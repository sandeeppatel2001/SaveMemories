import React, { useState } from "react";
import axios from "axios";

const VideoUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoId, setVideoId] = useState("1731846190983");

  const handleFileSelect = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("video", file);
    setUploading(true);

    try {
      const response = await axios.post(
        "http://localhost:3001/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          },
        }
      );
      console.log(response);
      setVideoId(response.data.videoId);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="video/*" onChange={handleFileSelect} />
      <button onClick={handleUpload} disabled={!file || uploading}>
        Upload Video
      </button>
      {uploading && <div>Upload Progress: {progress}%</div>}
      {videoId && (
        <div>
          <h3>Video Player</h3>
          <video controls width="100%">
            <source
              src={`http://localhost:3001/stream/${videoId}/144p`}
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
          <div>
            Quality:
            <select
              onChange={(e) => {
                const video = document.querySelector("video");
                const currentTime = video.currentTime;
                video.src = `http://localhost:3001/stream/${videoId}/${e.target.value}`;
                video.currentTime = currentTime;
                video.play();
              }}
            >
              <option value="1080p">1080p</option>
              <option value="720p">720p</option>
              <option value="480p">480p</option>
              <option value="360p">360p</option>
              <option value="240p">240p</option>
              <option value="144p">144p</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
