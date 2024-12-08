const express = require("express");
const router = express.Router();
const { upload } = require("../middleware/upload");
const { videoQueue, redis } = require("../services/queueService");
const { createThumbnailFromBuffer } = require("../services/thumbnailGenerator");
const { processFileToHLS } = require("../services/videoProcessing");
const videoIdModel = require("../mongodb/models/videomodel");
const logger = require("../config/logger");
const { s3 } = require("../services/s3Upload");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs").promises;
const auth = require("../middleware/auth");
const videoQualities = [
  { resolution: "144p", height: 144, bitrate: "400k" },
  { resolution: "240p", height: 240, bitrate: "800k" },
  { resolution: "360p", height: 360, bitrate: "1000k" },
  { resolution: "480p", height: 480, bitrate: "1500k" },
  { resolution: "720p", height: 720, bitrate: "2500k" },
  { resolution: "1080p", height: 1080, bitrate: "4000k" },
];

const MAX_BUFFER_SIZE = 1 * 1024 * 1024; // for redis db
// add auth middleware
router.post("/upload", auth, upload.single("video"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer || req.file.buffer.length === 0) {
      throw new Error("Invalid upload: No file or empty buffer received");
    }

    if (!req.file.mimetype.startsWith("video/")) {
      throw new Error("Invalid file type. Only video files are allowed.");
    }
    // take all the data from req.body
    const { title, description, visibility } = req.body;
    // take user id from req.user
    const userId = req.user._id;
    const videoId = crypto.randomUUID();
    const thumbnailBuffer = req.file.buffer;

    try {
      const thumbnailUrl = await createThumbnailFromBuffer(
        thumbnailBuffer,
        videoId
      );
      // save all details in database
      await videoIdModel.findOneAndUpdate(
        { videoId },
        { thumbnailUrl, title, description, visibility, userId },
        { upsert: true }
      );
    } catch (thumbnailError) {
      logger.error(
        `Thumbnail generation failed for videoId ${videoId}:`,
        thumbnailError
      );
    }

    await videoIdModel.findOneAndUpdate(
      { videoId },
      { status: "processing" },
      { upsert: true }
    );

    if (req.file.buffer.length > MAX_BUFFER_SIZE) {
      // Process large files
      const tempDir = path.join(
        __dirname,
        "../tempvideos",
        videoId,
        "original"
      );
      await fs.mkdir(tempDir, { recursive: true });
      const tempPath = path.join(tempDir, "input.mp4");
      await fs.writeFile(tempPath, req.file.buffer);

      try {
        await redis.set(`video:${videoId}:status`, "processing");
        await Promise.all(
          videoQualities.map((quality) =>
            processFileToHLS(tempPath, videoId, quality)
          )
        );
        await redis.set(`video:${videoId}:status`, "completed");
      } catch (error) {
        await redis.set(`video:${videoId}:status`, "failed");
        throw error;
      } finally {
        // await fs.rm(path.join(__dirname, "../tempvideos", videoId), {
        //   recursive: true,
        //   force: true,
        // });
      }
    } else {
      // Process small files using queue
      await videoQueue.add(
        {
          videoId,
          videoBuffer: req.file.buffer,
        },
        {
          removeOnComplete: true,
          attempts: 3,
        }
      );
    }

    res.json({
      success: true,
      videoId,
      status: "processing",
    });
  } catch (error) {
    logger.error("Upload failed:", error);
    res.status(500).json({
      error: "Upload failed",
      details: error.message,
    });
  }
});

router.get("/hls/:videoId/:quality/:file", auth, async (req, res) => {
  try {
    const { videoId, quality, file } = req.params;
    const key = `videos/${videoId}/${quality}/${file}`;

    const fileStream = s3
      .getObject({
        Bucket: process.env.AWS_BUCKET1,
        Key: key,
      })
      .createReadStream();

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

router.get("/getpublicvideos", auth, async (req, res) => {
  try {
    // find only public videos
    const videoId = await videoIdModel
      .find({ visibility: "public" })
      .limit(100);
    res.send(videoId);
  } catch (error) {
    logger.error("Failed to fetch videoIds:", error);
    res.status(500).json({ error: "Failed to fetch videoIds" });
  }
});
router.get("/getuservideos", auth, async (req, res) => {
  try {
    // console.log("req.user", req.user);
    // req.user {
    //   _id: new ObjectId('666666666666666666666666'),
    //   username: 'test',
    //   mobile: '1234567890'
    // }
    const videoId = await videoIdModel
      .find({ userId: req.user._id }) // typecast _id to mongoid
      .limit(100);
    // console.log("videoId=======>", videoId);
    // saperate public and private videos
    const publicVideos = videoId.filter(
      (video) => video.visibility === "public"
    );
    const privateVideos = videoId.filter(
      (video) => video.visibility === "private"
    );
    res.send({ user: req.user, publicVideos, privateVideos });
  } catch (error) {
    logger.error("Failed to fetch videoIds:", error);
    res.status(500).json({ error: "Failed to fetch videoIds" });
  }
});
module.exports = router;
