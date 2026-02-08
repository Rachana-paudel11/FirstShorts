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

  const handleAddToCart = () => {
    // TODO: Integrate with WooCommerce
    console.log('Add to cart functionality');
  };

  const maxWidth = Number(displayOptions.maxWidth) || 500;
  const clampedMaxWidth = Math.min(500, Math.max(200, maxWidth));

  return (
    <div className="firstshorts-video-container" style={{ maxWidth: `${clampedMaxWidth}px` }}>
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

        <div className="firstshorts-video-overlay" aria-hidden="true">
          {displayOptions.showBuyButton && (
            <div className="firstshorts-video-cta-row">
              <button
                className="firstshorts-btn firstshorts-btn-cta"
                onClick={handleBuyNow}
                type="button"
                aria-label="Buy now"
              >
                <span className="firstshorts-btn-symbol">🛍</span>
                <span className="firstshorts-btn-text">Buy Now</span>
              </button>
              <button
                className="firstshorts-btn firstshorts-btn-cta firstshorts-btn-cta-secondary"
                onClick={handleAddToCart}
                type="button"
                aria-label="Add to cart"
              >
                <span className="firstshorts-btn-symbol">🛒</span>
                <span className="firstshorts-btn-text">Add to Cart</span>
              </button>
            </div>
          )}

          <div className="firstshorts-video-actions">
            {displayOptions.showViewCount && (
              <button
                className="firstshorts-btn firstshorts-btn-overlay firstshorts-btn-view"
                aria-label="View count"
                type="button"
              >
                <span className="firstshorts-btn-symbol">◉</span>
                <span className="firstshorts-btn-count">{viewCount}</span>
              </button>
            )}

            {displayOptions.showLikes && (
              <button 
                className={`firstshorts-btn firstshorts-btn-overlay firstshorts-btn-like ${liked ? 'active' : ''}`}
                onClick={handleLike}
                aria-pressed={liked}
                type="button"
              >
                <span className="firstshorts-btn-symbol">{liked ? '♥' : '♡'}</span>
              </button>
            )}

            {displayOptions.showSave && (
              <button 
                className={`firstshorts-btn firstshorts-btn-overlay firstshorts-btn-save ${saved ? 'active' : ''}`}
                onClick={handleSave}
                aria-pressed={saved}
                type="button"
              >
                <svg
                  className="firstshorts-btn-icon-svg"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M7 3h10a2 2 0 0 1 2 2v16l-7-4-7 4V5a2 2 0 0 1 2-2Z" />
                </svg>
              </button>
            )}

            {displayOptions.showShare && (
              <button 
                className="firstshorts-btn firstshorts-btn-overlay firstshorts-btn-share"
                onClick={handleShare}
                type="button"
              >
                <svg
                  className="firstshorts-btn-icon-svg"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M5 12.5a7.5 7.5 0 0 1 7.5-7.5h1V3l5 4-5 4V8h-1a4.5 4.5 0 0 0 0 9H19v3h-6.5A7.5 7.5 0 0 1 5 12.5Z" />
                </svg>
              </button>
            )}
          </div>
        </div>
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
