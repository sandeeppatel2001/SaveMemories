import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";

const Home = ({ setvideo }) => {
  const [videos, setVideos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Fetching videos");
    console.log(localStorage.getItem("token"));
    // Fetch public videos
    fetch(`/api/videos/getpublicvideos?timestamp=${Date.now()}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("data================", data);
        if (data.error) {
          navigate("/login");
        } else {
          setVideos(data);
        }
      })
      .catch((error) => console.error("Error fetching videos:", error));
  }, []);

  const handleVideoClick = (video) => {
    setvideo(video);
    navigate(`/player?v=${video.videoId}`);
  };

  return (
    <div className={styles.homeContainer}>
      <div className={styles.videoGrid}>
        {videos.map((video) => (
          <div
            key={video.videoId}
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
              <p className={styles.channelName}>{video.username}</p>
              <p className={styles.videoStats}>
                {video.views} views •{" "}
                {new Date(video.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
