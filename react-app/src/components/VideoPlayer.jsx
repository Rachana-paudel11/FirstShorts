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
  const [likeCount, setLikeCount] = useState(0);
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
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
    showToast(!liked ? 'Liked' : 'Like removed');
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

  const handleBuyNow = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (displayOptions.ctaLink) {
      window.location.href = displayOptions.ctaLink;
    } else {
      console.log('No CTA Link provided');
    }
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

        <div className="firstshorts-preview-overlay" style={{ pointerEvents: 'none' }}>
          {(displayOptions.showViewCount || displayOptions.showLikes || displayOptions.showSave || displayOptions.showShare) && (
            <div className="firstshorts-preview-actions" style={{ pointerEvents: 'auto' }}>
              {displayOptions.showViewCount && (
                <div className="firstshorts-preview-btn firstshorts-preview-btn-overlay firstshorts-preview-btn-stat">
                  <span className="firstshorts-btn-symbol">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </span>
                  <span className="firstshorts-btn-count">{viewCount}</span>
                </div>
              )}
              {displayOptions.showLikes && (
                <button
                  type="button"
                  className={`firstshorts-preview-btn firstshorts-preview-btn-overlay ${liked ? 'active' : ''}`}
                  onClick={handleLike}
                  aria-label={liked ? 'Unlike' : 'Like'}
                >
                  <span className="firstshorts-btn-symbol">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  </span>
                  <span className="firstshorts-btn-count">{likeCount}</span>
                </button>
              )}
              {displayOptions.showSave && (
                <button
                  type="button"
                  className={`firstshorts-preview-btn firstshorts-preview-btn-overlay ${saved ? 'active' : ''}`}
                  onClick={handleSave}
                >
                  <span className="firstshorts-btn-symbol">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                  </span>
                </button>
              )}
              {displayOptions.showShare && (
                <button
                  type="button"
                  className="firstshorts-preview-btn firstshorts-preview-btn-overlay"
                  onClick={handleShare}
                >
                  <span className="firstshorts-btn-symbol">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </span>
                </button>
              )}
            </div>
          )}

          {displayOptions.showBuyButton && (
            <div className="firstshorts-video-cta-row" style={{ pointerEvents: 'auto' }}>
              {displayOptions.ctaLink ? (
                <a
                  className={`firstshorts-btn firstshorts-btn-cta ${displayOptions.ctaStyle === 'secondary' ? 'firstshorts-btn-cta-secondary' : ''}`}
                  href={displayOptions.ctaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={displayOptions.ctaText || 'Buy now'}
                  style={{ textDecoration: 'none' }}
                >
                  <span className="firstshorts-btn-symbol">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                  </span>
                  <span className="firstshorts-btn-text">{displayOptions.ctaText || 'Buy Now'}</span>
                </a>
              ) : (
                <button
                  className={`firstshorts-btn firstshorts-btn-cta ${displayOptions.ctaStyle === 'secondary' ? 'firstshorts-btn-cta-secondary' : ''}`}
                  onClick={handleBuyNow}
                  type="button"
                  aria-label={displayOptions.ctaText || 'Buy now'}
                >
                  <span className="firstshorts-btn-symbol">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                  </span>
                  <span className="firstshorts-btn-text">{displayOptions.ctaText || 'Buy Now'}</span>
                </button>
              )}
              <button
                className="firstshorts-btn firstshorts-btn-cta firstshorts-btn-cta-secondary"
                onClick={handleAddToCart}
                type="button"
                aria-label="Add to cart"
              >
                <span className="firstshorts-btn-symbol">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"></path><path d="M20 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"></path><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                </span>
                <span className="firstshorts-btn-text">Add to Cart</span>
              </button>
            </div>
          )}
        </div>
      </div >
    </div >
  );
};

export default VideoPlayer;
