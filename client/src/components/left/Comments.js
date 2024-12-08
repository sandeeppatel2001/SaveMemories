import React, { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import "./Comments.css";

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if screen is mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsExpanded(true);
      } else {
        setIsExpanded(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      setComments([
        {
          id: Date.now(),
          text: newComment,
          user: "Current User",
          timestamp: new Date().toLocaleDateString(),
          avatar: "https://via.placeholder.com/40",
        },
        ...comments,
      ]);
      setNewComment("");
    }
  };

  const toggleComments = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="comments-section">
      <div
        className="comments-header"
        onClick={isMobile ? toggleComments : undefined}
      >
        <h3 className="comments-title">{comments.length} Comments...</h3>
        {isMobile && (
          <button className="toggle-button">
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        )}
      </div>

      <div className={`comments-content ${isExpanded ? "expanded" : ""}`}>
        <form onSubmit={handleSubmitComment} className="comment-form">
          <img
            src="https://via.placeholder.com/40"
            alt="user"
            className="comment-avatar"
          />
          <div className="comment-input-container">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="comment-input"
            />
          </div>
          <button type="submit" className="comment-submit">
            Comment
          </button>
        </form>

        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment">
              <img
                src={comment.avatar}
                alt={comment.user}
                className="comment-avatar"
              />
              <div className="comment-content">
                <div className="comment-header">
                  <span className="comment-username">{comment.user}</span>
                  <span className="comment-timestamp">{comment.timestamp}</span>
                </div>
                <p className="comment-text">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Comments;
