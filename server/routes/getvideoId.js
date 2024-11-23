const app = require("../app");
const VideoID = require("../mongodb/models");
app.get("/getvideoId", async (req, res) => {
  const videoId = await VideoID.find().limit(20);
  res.send(videoId);
});

module.exports = app;
