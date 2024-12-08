import React, { useState } from "react";
import { FaThumbsUp, FaThumbsDown, FaShare, FaBookmark } from "react-icons/fa";

const VideoControls = () => {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  const handleLike = () => {
    if (isLiked) {
      setLikes((prev) => prev - 1);
      setIsLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setIsLiked(true);
      if (isDisliked) {
        setDislikes((prev) => prev - 1);
        setIsDisliked(false);
      }
    }
  };

  const handleDislike = () => {
    if (isDisliked) {
      setDislikes((prev) => prev - 1);
      setIsDisliked(false);
    } else {
      setDislikes((prev) => prev + 1);
      setIsDisliked(true);
      if (isLiked) {
        setLikes((prev) => prev - 1);
        setIsLiked(false);
      }
    }
  };

  return (
    <div className="video-controls">
      <div className="control-buttons">
        <button
          className={`control-btn ${isLiked ? "active" : ""}`}
          onClick={handleLike}
        >
          <FaThumbsUp /> {likes}
        </button>
        <button
          className={`control-btn ${isDisliked ? "active" : ""}`}
          onClick={handleDislike}
        >
          <FaThumbsDown /> {dislikes}
        </button>
        <button className="control-btn">
          <FaShare /> Share
        </button>
        {/* <button className="control-btn">
          <FaBookmark /> Save
        </button> */}
      </div>
    </div>
  );
};

export default VideoControls;
