import "./App.css";
import VideoPlayer from "./components/left/videoplayer";
import RecommendedVideos from "./components/right/RecommendedVideos";
import VideoUpload from "./components/VideoUpload/VideoUpload";
import Navbar from "./components/Navbar/Navbar";
import { useState } from "react";
import { Routes, Route } from "react-router-dom";

function App() {
  const [videoid, setVideoId] = useState("");
  const setvideoid = (videoId) => {
    setVideoId(videoId);
  };

  return (
    <div className="App">
      <Navbar />
      <div className="content">
        <Routes>
          <Route
            path="/"
            element={
              <div className="container">
                <div className="left-section">
                  <VideoPlayer videoId={videoid} />
                </div>
                <div className="right-section">
                  <RecommendedVideos setvideoid={setvideoid} />
                </div>
              </div>
            }
          />
          <Route path="/upload" element={<VideoUpload />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
