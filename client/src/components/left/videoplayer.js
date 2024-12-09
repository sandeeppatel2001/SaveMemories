import React, { useEffect, useRef, useState } from "react";
import "./left.css";
import VideoControls from "./VideoControls";
import Comments from "./Comments";
import Hls from "hls.js";

const VideoPlayer = ({ videoDetail }) => {
  console.log("videoDetail===============", videoDetail);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [quality, setQuality] = useState("240p"); // Default quality
  const qualities = ["144p", "240p", "360p", "480p", "720p", "1080p"]; // Match server qualities
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const initializeHLS = () => {
      const video = videoRef.current;
      if (!video) return;
      // extract the videoid from current location url
      const videoid = window.location.href.split("=")[1];

      // Cleanup previous HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      // send token as well get the token from local storage and send to backend
      const token = localStorage.getItem("token");
      // send token in header as well
      // const videoSrc = `http://localhost:3001/api/videos/hls/${videoId}/${quality}/playlist.m3u8?token=${token}`;
      const videoSrc = `http://${process.env.VM_HOST}:3001/api/videos/hls/${videoDetail.videoId}/${quality}/playlist.m3u8`;
      // send token in header as well

      if (Hls.isSupported()) {
        const hls = new Hls({
          debug: false,
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          xhrSetup: (xhr) => {
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          },
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
                console.error("Network error:", data);
                if (data.response?.code === 401) {
                  window.location.href = "/login";
                }
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error("Media error:", data);
                hls.recoverMediaError();
                break;
              default:
                console.error("Fatal error:", data);
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
  }, [videoDetail, quality]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsDescriptionExpanded(true);
      } else {
        setIsDescriptionExpanded(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

      <div className="video-info">
        <h1 className="video-title">{videoDetail.title}</h1>
        <div className="channel-info">
          <img
            src="https://via.placeholder.com/40"
            alt="channel"
            className="channel-avatar"
          />
          <div className="channel-details">
            <h3 className="channel-name">{videoDetail.channelName}</h3>
            <p className="subscriber-count">
              {videoDetail.subscriberCount} subscribers
            </p>
          </div>
          <button className="subscribe-btn">Subscribe</button>
        </div>

        <VideoControls />

        <div className="description-container">
          <div
            className={`description-content ${
              isDescriptionExpanded ? "expanded" : ""
            }`}
          >
            <p className="video-description">
              {videoDetail.description ||
                "This is a long description that will be truncated on mobile devices unless expanded. It can contain multiple paragraphs and details about the video."}
              {/* Add more description text here */}
            </p>
          </div>
          {isMobile && (
            <button
              className="show-more-btn"
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            >
              {isDescriptionExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      </div>

      <Comments />
    </div>
  );
};

export default VideoPlayer;
