const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
    unique: true,
  },
  thumbnailUrl: {
    type: String,
    default: "",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  visibility: {
    type: String,
    enum: ["public", "unlisted", "private"],
    default: "private",
  },
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
module.exports = mongoose.model("VideoID", videoSchema);

// module.exports = mongoose.model("Video", videoSchema);
