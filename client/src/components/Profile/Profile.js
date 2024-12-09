import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import styles from "../Home/Home.module.css";
import axios from "axios";
import VideoCard from "./videoCard";
const Profile = ({ setvideo }) => {
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

  const handleVideoClick = (video) => {
    setvideo(video);
    navigate(`/player?v=${video.videoId}`);
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  const handlePublicOrPrivateClick = () => {
    setIsPrivateVideos(!isPrivateVideos);
  };

  useEffect(() => {
    const getuserdetails = async () => {
      try {
        const response = await axios.get(`/api/videos/getuservideos`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log("userdetails", response.data);
        setUser(response.data.user);
        setPublicVideos(response.data.publicVideos);
        setPrivateVideos(response.data.privateVideos);
      } catch (error) {
        console.log("Error details:", error);

        // Handle 401 Unauthorized error
        if (error.response && error.response.status === 401) {
          // localStorage.removeItem("token"); // Clear invalid token
          navigate("/login"); // Redirect to login
          return;
        }

        // Handle other errors
        console.error("Error fetching user details:", error);
      }
    };

    // Only fetch if we have a token
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    getuserdetails();
  }, [navigate]);
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
                  <VideoCard
                    video={video}
                    index={index}
                    handleVideoClick={handleVideoClick}
                    privacy="private"
                  />
                ))
              : publicVideos.map((video, index) => (
                  <VideoCard
                    video={video}
                    index={index}
                    handleVideoClick={handleVideoClick}
                    privacy="public"
                  />
                ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
