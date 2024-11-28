const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  videoId: String,
  thumbnailUrl: String,
  status: {
    type: String,
    enum: ["processing", "completed", "failed"],
    default: "processing",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Videoids", videoSchema);
