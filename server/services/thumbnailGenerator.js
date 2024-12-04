const ffmpeg = require("fluent-ffmpeg");
const { PassThrough } = require("stream");
const logger = require("../config/logger");
const { uploadToS3 } = require("./s3Upload");

async function createThumbnailFromBuffer(thumbnailBuffer, videoId) {
  return new Promise((resolve, reject) => {
    logger.info("Starting thumbnail generation", { videoId });
    let outputBuffer = Buffer.alloc(0);
    const inputStream = new PassThrough();

    ffmpeg()
      .input(inputStream)
      .inputFormat("mp4")
      .inputOptions(["-ignore_unknown", "-err_detect ignore_err"])
      .outputOptions([
        "-frames:v 1",
        "-an",
        "-vf",
        "scale=480:270:force_original_aspect_ratio=decrease",
        "-q:v 2",
        "-preset",
        "fast",
        "-y",
      ])
      .format("image2")
      .on("error", (err) => {
        logger.error(
          `Thumbnail generation error for videoId ${videoId}`,
          err.message
        );
        createThumbnailFallback(thumbnailBuffer, videoId, resolve, reject);
      })
      .on("start", (cmd) => {
        logger.info(`Starting thumbnail generation for videoId ${videoId}`);
        logger.debug(`FFmpeg command: ${cmd}`);
      })
      .stream()
      .on("data", (chunk) => {
        outputBuffer = Buffer.concat([outputBuffer, chunk]);
      })
      .on("end", async () => {
        try {
          if (!outputBuffer.length) {
            throw new Error("Generated thumbnail is empty");
          }

          const s3Response = await uploadToS3(
            process.env.AWS_BUCKET2,
            outputBuffer,
            `videos/${videoId}/thumbnail.jpg`
          );

          const thumbnailUrl = s3Response.Location;
          logger.info(
            `Thumbnail uploaded successfully for videoId ${videoId}`,
            { thumbnailUrl }
          );
          resolve(thumbnailUrl);
        } catch (error) {
          logger.error(
            `Thumbnail processing failed for videoId ${videoId}`,
            error
          );
          createThumbnailFallback(thumbnailBuffer, videoId, resolve, reject);
        }
      });

    inputStream.end(thumbnailBuffer);
  });
}

function createThumbnailFallback(thumbnailBuffer, videoId, resolve, reject) {
  try {
    logger.info(`Using fallback thumbnail generation for videoId ${videoId}`);

    // Try a simpler ffmpeg command as fallback
    let outputBuffer = Buffer.alloc(0);
    const inputStream = new PassThrough();

    ffmpeg()
      .input(inputStream)
      .inputFormat("mp4")
      .outputOptions([
        "-frames:v 1", // Extract first frame only
        "-vf",
        "scale=480:270", // Simple scaling without force aspect ratio
        "-q:v 5", // Lower quality for more reliable processing
        "-y", // Overwrite output
      ])
      .format("image2")
      .on("error", (err) => {
        logger.error(
          `Fallback thumbnail generation failed for videoId ${videoId}`,
          err.message
        );
        // If fallback ffmpeg also fails, upload original buffer as last resort
        uploadToS3(
          process.env.AWS_BUCKET2,
          thumbnailBuffer,
          `videos/${videoId}/thumbnail.jpg`
        )
          .then((s3Response) => {
            logger.info(
              `Original buffer uploaded as thumbnail for videoId ${videoId}`
            );
            resolve(s3Response.Location);
          })
          .catch(reject);
      })
      .stream()
      .on("data", (chunk) => {
        outputBuffer = Buffer.concat([outputBuffer, chunk]);
      })
      .on("end", async () => {
        try {
          if (!outputBuffer.length) {
            throw new Error("Fallback generated thumbnail is empty");
          }

          const s3Response = await uploadToS3(
            process.env.AWS_BUCKET2,
            outputBuffer,
            `videos/${videoId}/thumbnail.jpg`
          );

          logger.info(
            `Fallback thumbnail uploaded successfully for videoId ${videoId}`
          );
          resolve(s3Response.Location);
        } catch (error) {
          logger.error(
            `Fallback thumbnail upload failed for videoId ${videoId}`,
            error
          );
          reject(error);
        }
      });

    inputStream.end(thumbnailBuffer);
  } catch (error) {
    logger.error(
      `Fallback thumbnail processing failed for videoId ${videoId}`,
      error
    );
    reject(error);
  }
}

module.exports = {
  createThumbnailFromBuffer,
};
