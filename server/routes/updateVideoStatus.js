const router = require("express").Router();
const videoIdModel = require("../mongodb/models/videomodel");
const auth = require("../middleware/auth");

router.post("/updateVideoStatus", auth, async (req, res) => {
  const { videoId, visibility } = req.body;
  const video = await videoIdModel.findById(videoId);
  if (!video) {
    return res.status(404).json({ message: "Video not found" });
  }

  video.visibility = visibility;
  await video.save();
  res.json({ message: "Visibility updated" });
});

module.exports = router;
