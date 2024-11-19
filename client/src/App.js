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
            <VideoPlayer videoId="1731846190983" />
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
