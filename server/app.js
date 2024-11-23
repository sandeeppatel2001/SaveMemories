const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs").promises;
const exists = require("fs").exists;
const cors = require("cors");
const crypto = require("crypto");
const Bull = require("bull");
const AWS = require("aws-sdk");
const Redis = require("ioredis");
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
const winston = require("winston");
const dotenv = require("dotenv");
const connectDB = require("./mongodb/mongoconnection");
dotenv.config({ path: "../.env" });
connectDB();
const videoIdModel = require("./mongodb/models");

// Configuration and Environment Variables
const config = {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
  },
  aws: {
    bucket: process.env.AWS_BUCKET,
    region: process.env.AWS_REGION,
    accessKey: process.env.AWS_ACCESS_KEY,
    secretKey: process.env.AWS_SECRET_KEY,
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY || crypto.randomBytes(16),
    iv: process.env.ENCRYPTION_IV || crypto.randomBytes(16),
  },
  app: {
    port: process.env.PORT || 3001,
  },
};

// Initialize Services
const redis = new Redis(config.redis);
const s3 = new AWS.S3({
  region: config.aws.region,
  accessKeyId: config.aws.accessKey,
  secretAccessKey: config.aws.secretKey,
});

// Setup Logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Video Processing Queue
const videoQueue = new Bull("video-processing", {
  redis: config.redis,
  limiter: {
    max: 5, // Process max 5 jobs at once
    duration: 1000,
  },
});

// Video quality configurations
const videoQualities = [
  { resolution: "1080p", height: 1080, bitrate: "4000k" },
  { resolution: "720p", height: 720, bitrate: "2500k" },
  { resolution: "480p", height: 480, bitrate: "1500k" },
  { resolution: "360p", height: 360, bitrate: "1000k" },
];
let app;
if (cluster.isMaster) {
  // Master process
  logger.info(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < 6; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    logger.info(`Worker ${worker.process.pid} died`);
    // Replace the dead worker
    cluster.fork();
  });
} else {
  // Worker process
  app = express();
  app.use(cors());
  app.use(express.json());

  // Middleware for security headers
  app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "media-src 'self' blob:;");
    res.setHeader("X-Content-Type-Options", "nosniff");
    next();
  });

  // Configure multer for S3
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB limit
    },
  });

  // Helper function to upload to S3
  async function uploadToS3(buffer, key) {
    return s3
      .upload({
        Bucket: config.aws.bucket,
        Key: key,
        Body: buffer,
        ContentEncryption: "AES256",
      })
      .promise();
  }

  // Process video function
  async function processVideoSegment(inputPath, quality, videoId) {
    const outputDir = `/tmp/${videoId}/${quality.resolution}`;
    await fs.mkdir(outputDir, { recursive: true });

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .size(`?x${quality.height}`)
        .videoBitrate(quality.bitrate)
        .format("hls")
        .outputOptions([
          "-hls_time 10",
          "-hls_list_size 0",
          "-hls_segment_type mpegts",
          "-hls_segment_filename",
          `${outputDir}/segment%d.ts`,
          `-hls_key_info_file ${outputDir}/enc.keyinfo`,
        ])
        .on("end", async () => {
          try {
            // Upload segments to S3
            const files = await fs.readdir(outputDir);
            for (const file of files) {
              const fileBuffer = await fs.readFile(`${outputDir}/${file}`);
              await uploadToS3(
                fileBuffer,
                `videos/${videoId}/${quality.resolution}/${file}`
              );
            }
            resolve();
          } catch (error) {
            reject(error);
          }
        })
        .on("error", reject)
        .save(`${outputDir}/playlist.m3u8`);
    });
  }

  // Queue processor
  videoQueue.process(async (job) => {
    const { videoId, inputPath } = job.data;
    try {
      await Promise.all(
        videoQualities.map((quality) =>
          processVideoSegment(inputPath, quality, videoId)
        )
      );

      // Cleanup temporary files
      await fs.rm(`/tmp/${videoId}`, { recursive: true, force: true });

      // Update video status in Redis
      await redis.set(`video:${videoId}:status`, "completed");

      return { success: true, videoId };
    } catch (error) {
      logger.error("Video processing failed:", error);
      await redis.set(`video:${videoId}:status`, "failed");
      throw error;
    }
  });

  // Upload endpoint
  app.post("/upload", upload.single("video"), async (req, res) => {
    try {
      const videoId = crypto.randomUUID();

      // Upload original file to S3
      await uploadToS3(
        req.file.buffer,
        `videos/${videoId}/original/${req.file.originalname}`
      );

      // Add to processing queue
      await videoQueue.add({
        videoId,
        inputPath: `s3://${config.aws.bucket}/videos/${videoId}/original/${req.file.originalname}`,
      });
      //  store videoId in mongodb
      await videoIdModel.create({ videoId });
      // Set initial status in Redis
      await redis.set(`video:${videoId}:status`, "processing");

      res.json({
        success: true,
        videoId,
        status: "processing",
      });
    } catch (error) {
      logger.error("Upload failed:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  // Status check endpoint
  app.get("/status/:videoId", async (req, res) => {
    try {
      const status = await redis.get(`video:${videoId}:status`);
      res.json({ status: status || "not_found" });
    } catch (error) {
      logger.error("Status check failed:", error);
      res.status(500).json({ error: "Status check failed" });
    }
  });

  // HLS streaming endpoint
  app.get("/hls/:videoId/:quality/:file", async (req, res) => {
    try {
      const { videoId, quality, file } = req.params;
      const key = `videos/${videoId}/${quality}/${file}`;

      // Check if file exists in S3
      const fileStream = s3
        .getObject({
          Bucket: config.aws.bucket,
          Key: key,
        })
        .createReadStream();

      // Set appropriate headers
      res.setHeader(
        "Content-Type",
        file.endsWith(".m3u8") ? "application/vnd.apple.mpegurl" : "video/MP2T"
      );

      fileStream.pipe(res);
    } catch (error) {
      logger.error("Streaming failed:", error);
      res.status(404).json({ error: "File not found" });
    }
  });

  // Error handling middleware
  app.use((error, req, res, next) => {
    logger.error("Unhandled error:", error);
    res.status(500).json({ error: "Internal server error" });
  });

  // Start server
  app.listen(config.app.port, () => {
    logger.info(`Worker ${process.pid} started on port ${config.app.port}`);
  });
}

module.exports = app;
