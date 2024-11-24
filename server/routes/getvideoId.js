const app = require("../app");
const VideoID = require("../mongodb/models");
app.get("/getvideoId", async (req, res) => {
  console.log("getvideoId get request");
  const videoId = await VideoID.find().limit(20);
  console.log("videoId", videoId);
  res.send(videoId);
});

module.exports = app;
