import React, { useState, useRef } from "react";
import { FaCloudUploadAlt, FaTimes, FaCheck } from "react-icons/fa";
import axios from "axios";
import "./VideoUpload.css";

const VideoUpload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [details, setDetails] = useState({
    title: "",
    description: "",
    visibility: "public",
  });
  const [step, setStep] = useState(1);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("video/")) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setStep(2);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("video/")) {
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
      setStep(2);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!file || !details.title) return;

    const formData = new FormData();
    formData.append("video", file);
    formData.append("title", details.title);
    formData.append("description", details.description);
    formData.append("visibility", details.visibility);

    setUploading(true);

    try {
      const response = await axios.post(
        "http://localhost:3001/api/videos/upload",
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

      console.log("Upload successful:", response.data);
      setStep(3);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setPreview(null);
    setProgress(0);
    setDetails({
      title: "",
      description: "",
      visibility: "public",
    });
    setStep(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="video-upload-container">
      <div className="upload-header">
        <h2>Upload video</h2>
        {step > 1 && (
          <button className="close-btn" onClick={resetUpload}>
            <FaTimes />
          </button>
        )}
      </div>

      {step === 1 && (
        <div
          className="upload-area"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <FaCloudUploadAlt className="upload-icon" />
          <h3>Drag and drop video files to upload</h3>
          <p>Your videos will be private until you publish them</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="file-input"
            id="file-input"
          />
          <label htmlFor="file-input" className="select-files-btn">
            SELECT FILES
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="details-section">
          <div className="preview-section">
            <video src={preview} controls className="video-preview" />
            <div className="file-info">
              <p>{file.name}</p>
              <p>{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          </div>

          <div className="details-form">
            <div className="form-group">
              <label>Title (required)</label>
              <input
                type="text"
                value={details.title}
                onChange={(e) =>
                  setDetails({ ...details, title: e.target.value })
                }
                placeholder="Add a title that describes your video"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={details.description}
                onChange={(e) =>
                  setDetails({ ...details, description: e.target.value })
                }
                placeholder="Tell viewers about your video"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Visibility</label>
              <select
                value={details.visibility}
                onChange={(e) =>
                  setDetails({ ...details, visibility: e.target.value })
                }
              >
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
                <option value="private">Private</option>
              </select>
            </div>

            <button
              className="upload-btn"
              onClick={handleUpload}
              disabled={!details.title || uploading}
            >
              {uploading ? `Uploading... ${progress}%` : "Upload"}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="upload-success">
          <FaCheck className="success-icon" />
          <h3>Upload successful!</h3>
          <p>Your video will be available at:</p>
          <a href="/" className="video-link">
            View video
          </a>
          <button className="upload-another-btn" onClick={resetUpload}>
            Upload another video
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
