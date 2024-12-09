import React, { useState, useRef, useEffect } from "react";
import styles from "../Home/Home.module.css";
import "./Profile.css";
import videoCardStyles from "./videocard.module.css";
import { FaEllipsisV } from "react-icons/fa";

const VideoCard = ({ video, index, handleVideoClick, privacy }) => {
  console.log("privacy", privacy === "public");
  const [isPrivacy, setPrivacy] = useState(privacy);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEllipsisClick = (e) => {
    e.stopPropagation(); // Prevent video click event
    setShowDropdown(!showDropdown);
  };

  const handlePrivacyChange = async (e, newPrivacy) => {
    e.stopPropagation();
    try {
      console.log("newPrivacy====", newPrivacy);
      const response = await fetch(`/api/updatevisibility/updateVideoStatus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },

        body: JSON.stringify({
          visibility: newPrivacy,
          videoId: video.videoId,
          userId: video.userId,
        }),
      });

      if (response.ok) {
        setPrivacy(newPrivacy);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error("Error updating privacy:", error);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this video?")) {
      try {
        const response = await fetch(`/api/videos/${video.videoId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          // You might want to add a callback prop to refresh the video list
          setShowDropdown(false);
        }
      } catch (error) {
        console.error("Error deleting video:", error);
      }
    }
  };

  return (
    <div
      key={video.videoId + index + Math.random()}
      className={styles.videoCard}
      onClick={() => handleVideoClick(video)}
    >
      <img
        src={video.thumbnailUrl || "https://via.placeholder.com/280x157"}
        alt={video.title}
        className={styles.thumbnail}
      />
      <div className={styles.videoInfo}>
        <h3>{video.title}</h3>
        <p className={styles.videoStats}>
          <div className={videoCardStyles.dropdownContainer} ref={dropdownRef}>
            <button
              onClick={handleEllipsisClick}
              className={videoCardStyles.ellipsis}
            >
              <FaEllipsisV />
            </button>
            {showDropdown && (
              <div className={videoCardStyles.dropdown}>
                <button
                  onClick={(e) => handlePrivacyChange(e, "public")}
                  disabled={isPrivacy === "public"}
                  className={
                    isPrivacy === "public" ? videoCardStyles.disabled : ""
                  }
                >
                  Make Public
                </button>
                <button
                  onClick={(e) => handlePrivacyChange(e, "private")}
                  disabled={isPrivacy === "private"}
                  className={
                    isPrivacy === "private" ? videoCardStyles.disabled : ""
                  }
                >
                  Make Private
                </button>
                <button
                  onClick={handleDelete}
                  className={videoCardStyles.delete}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
          {" Created At: " + new Date(video.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default VideoCard;
