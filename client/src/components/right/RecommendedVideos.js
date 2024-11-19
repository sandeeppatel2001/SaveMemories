import React from "react";
import "./right.css";
import thumbnail from "../img/thumb.jpg";

const RecommendedVideos = () => {
  const videos = [
    {
      id: 1,
      title: "Sample Video 1",
      channel: "Channel Name",
      thumbnail: thumbnail,
    },
    // Add more video objects as needed
    {
      id: 2,
      title: "Sample Video 2",
      channel: "Channel Name",
      thumbnail: thumbnail,
    },
    {
      id: 3,
      title: "Sample Video 3",
      channel: "Channel Name",
      thumbnail: thumbnail,
    },
    {
      id: 4,
      title: "Sample Video 4",
      channel: "Channel Name",
      thumbnail: thumbnail,
    },
    {
      id: 5,
      title: "Sample Video 5",
      channel: "Channel Name",
      thumbnail: thumbnail,
    },
    {
      id: 6,
      title: "Sample Video 6",
      channel: "Channel Name",
      thumbnail: thumbnail,
    },
    {
      id: 7,
      title: "Sample Video 7",
      channel: "Channel Name",
      thumbnail: thumbnail,
    },
  ];
  console.log(videos);
  return (
    <div className="recommended-videos">
      {videos.map((video) => (
        <div key={video.id} className="video-card">
          <img
            src={
              thumbnail ||
              video.thumbnail ||
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
