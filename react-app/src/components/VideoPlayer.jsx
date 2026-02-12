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
    <div className="firstshorts-video-container" style={{ maxWidth: `${clampedMaxWidth}px`, padding: 0, background: 'transparent', border: 'none', boxShadow: 'none' }}>
      {/* Video Player */}
      <div className="firstshorts-video-player-wrapper" style={{ boxShadow: 'none' }}>
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
                className={`firstshorts-btn firstshorts-btn-cta ${displayOptions.ctaStyle === 'secondary' ? 'firstshorts-btn-cta-secondary' : ''}`}
                onClick={handleBuyNow}
                type="button"
                aria-label={displayOptions.ctaText || 'Buy now'}
              >
                <span className="firstshorts-btn-symbol">🛍</span>
                <span className="firstshorts-btn-text">{displayOptions.ctaText || 'Buy Now'}</span>
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
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
