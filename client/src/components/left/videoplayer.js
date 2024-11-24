import React, { useEffect, useRef, useState } from "react";
import "./left.css";
import VideoControls from "./VideoControls";
import Comments from "./Comments";
import Hls from "hls.js";

const VideoPlayer = ({ videoId }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [quality, setQuality] = useState("360p"); // Default quality
  const qualities = ["144p", "240p", "360p", "480p", "720p", "1080p"]; // Match server qualities

  useEffect(() => {
    const initializeHLS = () => {
      const video = videoRef.current;
      if (!video) return;

      // Cleanup previous HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const videoSrc = `http://localhost:3001/hls/${videoId}/${quality}/playlist.m3u8`;

      if (Hls.isSupported()) {
        const hls = new Hls({
          debug: false,
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });

        hls.loadSource(videoSrc);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch((error) => {
            console.log("Playback failed:", error);
          });
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log("Network error, trying to recover...");
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log("Media error, trying to recover...");
                hls.recoverMediaError();
                break;
              default:
                console.error("Fatal error, destroying HLS instance");
                hls.destroy();
                break;
            }
          }
        });

        hlsRef.current = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // For Safari
        video.src = videoSrc;
        video.addEventListener("loadedmetadata", () => {
          video.play().catch((error) => {
            console.log("Playback failed:", error);
          });
        });
      }
    };

    initializeHLS();

    // Cleanup function
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [videoId, quality]);

  const handleQualityChange = (newQuality) => {
    const video = videoRef.current;
    const currentTime = video?.currentTime || 0;

    // Store current time before quality change
    const storedTime = currentTime;

    setQuality(newQuality);

    // Wait for video to load with new quality before setting time
    const handleLoadedMetadata = () => {
      video.currentTime = storedTime;
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };

    if (video) {
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  return (
    <div className="video-player">
      <div className="video-container">
        <video
          ref={videoRef}
          className="video"
          controls
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          onContextMenu={handleContextMenu}
          playsInline
        />

        <div className="video-controls-overlay">
          <div className="quality-selector">
            <select
              value={quality}
              onChange={(e) => handleQualityChange(e.target.value)}
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
      </div>

      <Comments /> */}
    </div>
  );
};

export default VideoPlayer;
