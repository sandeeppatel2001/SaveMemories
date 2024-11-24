import "./App.css";
import VideoPlayer from "./components/left/videoplayer";
import RecommendedVideos from "./components/right/RecommendedVideos";
import VideoUpload from "./videoUpload";
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="container">
          <div className="left-section">
            <VideoPlayer videoId="f4c641b9-7686-45a6-83f9-12401f8d30f5" />
          </div>
          <div className="right-section">
            <RecommendedVideos />
          </div>
        </div>
        {/* <VideoUpload /> */}
      </header>
    </div>
  );
}

export default App;
