const router = require("express").Router();
const videoIdModel = require("../mongodb/models/videomodel");
const auth = require("../middleware/auth");

router.post("/updateVideoStatus", auth, async (req, res) => {
  try {
    const { videoId, visibility } = req.body;
    console.log("visibility changed to", visibility);
    console.log("videoId", videoId);

    const video = await videoIdModel.findOne({ videoId: videoId });
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    video.visibility = visibility;
    video.title = video.title ? video.title : "from server";
    video.userId = userId;
    await video.save();
    res.json({ message: "Visibility updated" });
  } catch (error) {
    console.error("Error updating video status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
