import "./App.css";
import VideoPlayer from "./components/left/videoplayer";
import RecommendedVideos from "./components/right/RecommendedVideos";
import VideoUpload from "./components/VideoUpload/VideoUpload";
import Navbar from "./components/Navbar/Navbar";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home/Home";
import Profile from "./components/Profile/Profile";

function App() {
  const [videoid, setVideoId] = useState("");
  const setvideoid = (videoId) => {
    setVideoId(videoId);
  };

  const isAuthenticated = () => {
    // return true;
    return !!localStorage.getItem("token");
  };

  const PrivateRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
  };

  return (
    <div className="App">
      <Navbar />
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/player" element={<VideoPlayer videoid={videoid} />} /> */}
          <Route
            path="/player"
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

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <PrivateRoute>
                <VideoUpload />
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
