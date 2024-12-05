const ffmpeg = require("../config/ffmpeg");
const path = require("path");
const fs = require("fs").promises;
const logger = require("../config/logger");
const { uploadToS3 } = require("./s3Upload");

async function processFileToHLS(inputPath, videoId, quality) {
  const outputDir = path.join(
    __dirname,
    "../tempvideos",
    videoId,
    quality.resolution
  );
  await fs.mkdir(outputDir, { recursive: true });

  try {
    await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) {
          logger.error(`FFprobe error: ${err.message}`);
          reject(err);
          return;
        }
        logger.info(`Input file metadata: ${JSON.stringify(metadata.format)}`);
        resolve(metadata);
      });
    });
  } catch (error) {
    logger.error(`File validation failed: ${error.message}`);
    throw error;
  }

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoCodec("libx264")
      .audioCodec("aac")
      .size(`?x${quality.height}`)
      .videoBitrate(quality.bitrate)
      .format("hls")
      .outputOptions([
        "-hls_time 10",
        "-hls_list_size 0",
        "-hls_segment_type mpegts",
        "-hls_segment_filename",
        `${outputDir}/segment%d.ts`,
        "-hls_flags delete_segments",
        "-start_number 0",
        "-g 30",
        "-sc_threshold 0",
        "-b_strategy 0",
        "-preset fast",
        "-profile:v main",
        "-level:v 3.1",
        "-max_muxing_queue_size 1024",
      ])
      .on("start", (commandLine) => {
        logger.info(`FFmpeg started with command: ${commandLine}`);
      })
      .on("progress", (progress) => {
        logger.info(
          `Processing ${quality.resolution}: ${progress.percent}% done`
        );
      })
      .on("end", async () => {
        try {
          const files = await fs.readdir(outputDir);
          for (const file of files) {
            const fileBuffer = await fs.readFile(path.join(outputDir, file));
            await uploadToS3(
              process.env.AWS_BUCKET1,
              fileBuffer,
              `videos/${videoId}/${quality.resolution}/${file}`
            );
          }
          await fs.rm(outputDir, { recursive: true, force: true });
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on("error", (err) => {
        logger.error(`FFmpeg error: ${err.message}`);
        reject(err);
      })
      .save(`${outputDir}/playlist.m3u8`);
  });
}

async function processBufferToHLS(buffer, videoId, quality) {
  const outputDir = path.join(os.tmpdir(), videoId, quality.resolution);
  await fs.mkdir(outputDir, { recursive: true });
  logger.info("processBufferToHLS");
  return new Promise((resolve, reject) => {
    const inputStream = require("stream").Readable.from(buffer);

    ffmpeg()
      .input(inputStream)
      .inputFormat("mp4")
      .size(`?x${quality.height}`)
      .videoBitrate(quality.bitrate)
      .format("hls")
      .outputOptions([
        "-hls_time 10",
        "-hls_list_size 0",
        "-hls_segment_type mpegts",
        "-hls_segment_filename",
        `${outputDir}/segment%d.ts`,
      ])
      .on("end", async () => {
        try {
          const files = await fs.readdir(outputDir);
          for (const file of files) {
            const fileBuffer = await fs.readFile(path.join(outputDir, file));
            await uploadToS3(
              process.env.AWS_BUCKET1,
              fileBuffer,
              `videos/${videoId}/${quality.resolution}/${file}`
            );
          }
          await fs.rm(outputDir, { recursive: true, force: true });
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on("error", reject)
      .save(`${outputDir}/playlist.m3u8`);
  });
}

module.exports = {
  processFileToHLS,
  processBufferToHLS,
};
