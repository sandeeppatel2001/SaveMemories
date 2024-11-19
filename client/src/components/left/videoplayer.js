import React, { useState, useEffect } from "react";
import "./left.css";
import VideoControls from "./VideoControls";
import Comments from "./Comments";

const VideoPlayer = ({ videoId }) => {
  const [quality, setQuality] = useState("144p");
  const qualities = ["144p", "360p", "720p", "1080p"];

  const handleContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  const handleKeyDown = (e) => {
    // Prevent common keyboard shortcuts
    if (
      (e.ctrlKey && (e.keyCode === 83 || e.keyCode === 85)) || // Ctrl + S or Ctrl + U
      e.keyCode === 123 // F12
    ) {
      e.preventDefault();
      return false;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="video-player">
      <div className="video-container">
        <video
          className="video"
          controls
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          onContextMenu={handleContextMenu}
          playsInline
          src={`http://localhost:3001/stream/${videoId}/${quality}`}
        />
        <div className="video-controls-overlay">
          <div className="quality-selector">
            <select
              value={quality}
              onChange={(e) => {
                setQuality(e.target.value);
                const video = document.querySelector("video");
                const currentTime = video.currentTime;
                video.src = `http://localhost:3001/stream/${videoId}/${e.target.value}`;
                video.currentTime = currentTime;

                const playPromise = video.play();
                if (playPromise !== null) {
                  playPromise.catch(() => {
                    video.play();
                  });
                }
              }}
            >
              {qualities.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* <div className="video-info">
        <h1 className="video-title">Video Title</h1>

        <div className="channel-info">
          <img
            src="https://via.placeholder.com/40"
            alt="channel"
            className="channel-avatar"
          />
          <div className="channel-details">
            <h3 className="channel-name">Channel Name</h3>
            <p className="subscriber-count">1.2M subscribers</p>
          </div>
          <button className="subscribe-btn">Subscribe</button>
        </div>

        <VideoControls />

        <p className="video-description">
          Video description goes here. This can include details about the video,
          upload date, and other relevant information.
        </p>
      </div> */}

      {/* <Comments /> */}
    </div>
  );
};

export default VideoPlayer;
