import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

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

  return (
    <div className="comments-section">
      <h3 className="comments-title">{comments.length} Comments</h3>

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
  );
};

export default Comments;
