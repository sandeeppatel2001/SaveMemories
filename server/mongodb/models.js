const mongoose = require("mongoose");

const videoIdSchema = new mongoose.Schema({
  videoId: { type: String, required: true },
});

module.exports = mongoose.model("VideoID", videoIdSchema);
