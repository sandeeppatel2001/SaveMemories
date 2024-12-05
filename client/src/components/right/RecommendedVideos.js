import React from "react";
import "./right.css";
import thumbnail from "../img/thumb.jpg";
import { useState, useEffect } from "react";
const RecommendedVideos = ({ setvideoid }) => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3001/api/videos/getvideoId")
      .then((res) => res.json())
      .then((data) => {
        console.log("===============", data);
        let videosarray = [];
        data.forEach((videodata) => {
          videosarray.push({
            id: 1,
            title: "Sample Video 1",
            channel: "Channel Name",
            thumbnail: videodata.thumbnailUrl
              ? `https://108and7.s3.ap-south-1.amazonaws.com/videos/${videodata.videoId}/thumbnail.jpg`
              : thumbnail,
            videoId: videodata.videoId,
          });
        });
        setVideos(videosarray);
      });
  }, []);
  // const videos = [
  //   {
  //     id: 1,
  //     title: "Sample Video 1",
  //     channel: "Channel Name",
  //     thumbnail: thumbnail,
  //   },
  //   // Add more video objects as needed
  //   {
  //     id: 2,
  //     title: "Sample Video 2",
  //     channel: "Channel Name",
  //     thumbnail: thumbnail,
  //   },
  //   {
  //     id: 3,
  //     title: "Sample Video 3",
  //     channel: "Channel Name",
  //     thumbnail: thumbnail,
  //   },
  //   {
  //     id: 4,
  //     title: "Sample Video 4",
  //     channel: "Channel Name",
  //     thumbnail: thumbnail,
  //   },
  //   {
  //     id: 5,
  //     title: "Sample Video 5",
  //     channel: "Channel Name",
  //     thumbnail: thumbnail,
  //   },
  //   {
  //     id: 6,
  //     title: "Sample Video 6",
  //     channel: "Channel Name",
  //     thumbnail: thumbnail,
  //   },
  //   {
  //     id: 7,
  //     title: "Sample Video 7",
  //     channel: "Channel Name",
  //     thumbnail: thumbnail,
  //   },
  // ];
  console.log(videos);
  const handleVideoClick = (videoId) => {
    console.log("videoId", videoId);
    setvideoid(videoId);
    setSelectedVideo(videoId);
  };
  return (
    <div className="recommended-videos">
      {videos.map((video, index) => (
        <div
          onClick={() => handleVideoClick(video.videoId)}
          key={video.id + index}
          className={`video-card ${
            selectedVideo === video.videoId ? "selected" : ""
          }`}
        >
          <img
            src={
              video.thumbnail ||
              thumbnail ||
              "https://via.placeholder.com/168x94"
            }
            alt={video.title}
            className="thumbnail"
          />
          <div className="video-card-info">
            <h3 className="video-card-title">{video.title}</h3>
            <p className="video-card-channel">{video.channel}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecommendedVideos;
