import "./App.css";
import VideoPlayer from "./components/left/videoplayer";
import RecommendedVideos from "./components/right/RecommendedVideos";
import VideoUpload from "./videoUpload";
import { useState } from "react";
function App() {
  const [videoid, setVideoId] = useState("");
  const setvideoid = (videoId) => {
    setVideoId(videoId);
  };
  return (
    <div className="App">
      <header className="App-header">
        <div className="container">
          <div className="left-section">
            <VideoPlayer videoId={videoid} />
          </div>
          <div className="right-section">
            <RecommendedVideos setvideoid={setvideoid} />
          </div>
        </div>
        {/* <VideoUpload /> */}
      </header>
    </div>
  );
}

export default App;
