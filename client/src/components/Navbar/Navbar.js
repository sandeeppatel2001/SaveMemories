import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaCompass,
  FaVideo,
  FaHistory,
  FaYoutube,
  FaBars,
  FaSearch,
  FaUpload,
  FaBell,
  FaUser,
} from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <button className="menu-btn">
            <FaBars />
          </button>
          <Link to="/" className="logo">
            <FaYoutube className="youtube-icon" />
            <span>YouTube</span>
          </Link>
        </div>

        <div className={`search-container ${showSearch ? "show-search" : ""}`}>
          <div className="search-box">
            <input type="text" placeholder="Search" />
            <button className="search-btn">
              <FaSearch />
            </button>
          </div>
        </div>

        <div className="navbar-right">
          <button
            className="mobile-search-btn"
            onClick={() => setShowSearch(!showSearch)}
          >
            <FaSearch />
          </button>
          <Link to="/upload" className="nav-icon">
            <FaUpload />
          </Link>
          <button className="nav-icon">
            <FaBell />
          </button>
          <button className="nav-icon profile-icon">
            <FaUser />
          </button>
        </div>
      </nav>

      <div className="mobile-navbar">
        <Link to="/" className="mobile-nav-item">
          <FaHome />
          <span>Home</span>
        </Link>
        <Link to="/explore" className="mobile-nav-item">
          <FaCompass />
          <span>Explore</span>
        </Link>
        <Link to="/upload" className="mobile-nav-item">
          <FaUpload />
          <span>Upload</span>
        </Link>
        <Link to="/library" className="mobile-nav-item">
          <FaVideo />
          <span>Library</span>
        </Link>
        <Link to="/history" className="mobile-nav-item">
          <FaHistory />
          <span>History</span>
        </Link>
      </div>
    </>
  );
};

export default Navbar;
