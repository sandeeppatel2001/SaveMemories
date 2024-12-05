import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import styles from "../Home/Home.module.css";
import axios from "axios";
const Profile = () => {
  const [user, setUser] = useState({
    username: "User",
    mobile: "0000000000",
    _id: "",
    // Add more user details as needed
  });
  const [publicVideos, setPublicVideos] = useState([]);
  const [privateVideos, setPrivateVideos] = useState([]);
  const [isPrivateVideos, setIsPrivateVideos] = useState(false);
  const navigate = useNavigate();

  const handleVideoClick = (videoId) => {
    navigate(`/player?v=${videoId}`);
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  const handlePublicOrPrivateClick = () => {
    setIsPrivateVideos(!isPrivateVideos);
  };
  const getuserdetails = async () => {
    const response = await axios.get(
      "http://localhost:3001/api/videos/getuservideos"
    );
    console.log(response.data);
    setUser(response.data.user);
    setPublicVideos([
      ...response.data.publicVideos,
      ...response.data.publicVideos,
    ]);
    setPrivateVideos([
      ...response.data.privateVideos,
      ...response.data.privateVideos,
    ]);
  };
  useEffect(() => {
    getuserdetails();
  }, []);
  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h2>{user.username}</h2>
          <div className="profile-stats">
            <span>Mobile: {user.mobile} </span>
            <span>Videos: {publicVideos.length + privateVideos.length} </span>
          </div>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="profile-tabs">
        <button
          className={!isPrivateVideos ? "active" : ""}
          onClick={handlePublicOrPrivateClick}
        >
          Public Videos
        </button>

        {/* <button>PLAYLISTS</button> */}

        <button
          className={isPrivateVideos ? "active" : ""}
          onClick={handlePublicOrPrivateClick}
        >
          Private Videos
        </button>
      </div>

      <div className="profile-videos">
        {/* Video grid will be populated here */}
        <div className={styles.homeContainer}>
          <div className={styles.videoGrid}>
            {isPrivateVideos
              ? privateVideos.map((video, index) => (
                  <div
                    key={video.videoId + index + Math.random()}
                    className={styles.videoCard}
                    onClick={() => handleVideoClick(video.videoId)}
                  >
                    <img
                      src={
                        video.thumbnailUrl ||
                        "https://via.placeholder.com/280x157"
                      }
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
                ))
              : publicVideos.map((video, index) => (
                  <div
                    key={video.videoId + index + Math.random()}
                    className={styles.videoCard}
                    onClick={() => handleVideoClick(video.videoId)}
                  >
                    <img
                      src={
                        video.thumbnailUrl ||
                        "https://via.placeholder.com/280x157"
                      }
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
      </div>
    </div>
  );
};

export default Profile;
