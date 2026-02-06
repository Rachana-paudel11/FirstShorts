import React, { useState, useRef } from 'react';

const VideoPlayer = ({ 
  videoId, 
  videoUrl, 
  thumbnailUrl, 
  title, 
  description,
  displayOptions = {},
  autoplay = false 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [toast, setToast] = useState('');
  const videoRef = useRef(null);
  const hasCountedViewRef = useRef(false);

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => setToast(''), 2200);
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    showToast(!liked ? 'Liked' : 'Like removed');
    // TODO: Send to WordPress API to save like
  };

  const handleSave = () => {
    setSaved(!saved);
    showToast(!saved ? 'Saved' : 'Removed from saved');
    // TODO: Send to WordPress API to save bookmark
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied');
    }
  };

  const handleBuyNow = () => {
    // TODO: Integrate with WooCommerce
    console.log('Add to cart functionality');
  };

  return (
    <div className="firstshorts-video-container">
      {/* Video Player */}
      <div className="firstshorts-video-player-wrapper">
        <video 
          ref={videoRef}
          className="firstshorts-video-player"
          poster={thumbnailUrl}
          autoPlay={autoplay}
          controls
          onPlay={() => {
            setIsPlaying(true);
            if (!hasCountedViewRef.current) {
              setViewCount((prev) => prev + 1);
              hasCountedViewRef.current = true;
            }
          }}
          onPause={() => setIsPlaying(false)}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Video Info */}
      <div className="firstshorts-video-info">
        <h2 className="firstshorts-video-title">{title}</h2>
        
        {description && (
          <div 
            className="firstshorts-video-description"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}

        {/* Video Controls - Buttons */}
        <div className="firstshorts-video-controls">
          {displayOptions.showViewCount && (
            <button className="firstshorts-btn firstshorts-btn-view" aria-label="View count">
              <span className="firstshorts-btn-icon">👁️</span>
              <span className="firstshorts-btn-text">{viewCount}</span>
            </button>
          )}

          {displayOptions.showLikes && (
            <button 
              className={`firstshorts-btn firstshorts-btn-like ${liked ? 'active' : ''}`}
              onClick={handleLike}
              aria-pressed={liked}
            >
              <span className="firstshorts-btn-icon">{liked ? '❤️' : '🤍'}</span>
              <span className="firstshorts-btn-text">Like</span>
            </button>
          )}

          {displayOptions.showSave && (
            <button 
              className={`firstshorts-btn firstshorts-btn-save ${saved ? 'active' : ''}`}
              onClick={handleSave}
              aria-pressed={saved}
            >
              <span className="firstshorts-btn-icon">{saved ? '🔖' : '📑'}</span>
              <span className="firstshorts-btn-text">Save</span>
            </button>
          )}

          {displayOptions.showShare && (
            <button 
              className="firstshorts-btn firstshorts-btn-share"
              onClick={handleShare}
            >
              <span className="firstshorts-btn-icon">📤</span>
              <span className="firstshorts-btn-text">Share</span>
            </button>
          )}

          {displayOptions.showBuyButton && (
            <button 
              className="firstshorts-btn firstshorts-btn-buy"
              onClick={handleBuyNow}
            >
              <span className="firstshorts-btn-icon">🛒</span>
              <span className="firstshorts-btn-text">Buy Now</span>
            </button>
          )}
        </div>

        {toast && (
          <div className="firstshorts-toast" role="status" aria-live="polite">
            {toast}
            <button
              className="firstshorts-toast-close"
              type="button"
              onClick={() => setToast('')}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
