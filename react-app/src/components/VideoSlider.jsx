import React, { useState, useRef, useEffect } from 'react';

const VideoSliderCard = ({ video, index }) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [viewCount] = useState(0);
  const defaultOptions = {
    showViewCount: true,
    showLikes: true,
    showSave: true,
    showShare: true,
    showBuyButton: true,
    ctaText: 'Buy Now',
    ctaStyle: 'primary',
    maxWidth: 500,
    maxHeight: 600
  };
  const hasCustomOptions = video.displayOptions && Object.keys(video.displayOptions).length > 0;
  const displayOptions = hasCustomOptions
    ? { ...defaultOptions, ...video.displayOptions }
    : defaultOptions;

  const toHandle = (title = '') => {
    const handle = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .slice(0, 16);
    return handle || 'firstshorts';
  };

  const handleLike = () => {
    setLiked(!liked);
  };

  const handleSave = () => {
    setSaved(!saved);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video.title,
        url: video.permalink
      });
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(video.permalink);
    }
  };

  const handleBuyNow = () => {
    console.log('Buy now clicked');
  };

  const handleAddToCart = () => {
    console.log('Add to cart clicked');
  };

  const maxWidth = Number(displayOptions.maxWidth) || 500;
  const maxHeight = Number(displayOptions.maxHeight) || 600;
  const clampedMaxWidth = Math.min(500, Math.max(200, maxWidth));
  const clampedMaxHeight = Math.min(1000, Math.max(300, maxHeight));

  return (
    <div className="firstshorts-video-container" style={{ maxWidth: `${clampedMaxWidth}px`, padding: 0, background: 'transparent', border: 'none', boxShadow: 'none' }}>
      {/* Video Player */}
      <div className="firstshorts-video-player-wrapper" style={{ boxShadow: 'none', background: 'transparent', height: `${clampedMaxHeight}px` }}>
        <video
          src={video.videoUrl}
          poster={video.thumbnail}
          className="firstshorts-slide-image"
          loop
          muted
          playsInline
          autoPlay
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
        />
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
                >
                  <span className="firstshorts-btn-symbol">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  </span>
                  <span className="firstshorts-btn-count">0</span>
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

          <div className="firstshorts-slide-meta" style={{ pointerEvents: 'auto' }}>
            {displayOptions.showBuyButton && (
              <div className="firstshorts-slide-cta-row">
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
        </div>
      </div>
    </div>
  );
};

const VideoSlider = ({ videos = [], count = 5 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(4);
  const sliderRef = useRef(null);

  // Limit videos to count
  const displayVideos = videos.slice(0, count);

  const maxIndex = Math.max(0, displayVideos.length - slidesPerView);

  useEffect(() => {
    const container = sliderRef.current;
    if (!container) return;

    const updateSlidesPerView = (width) => {
      if (width >= 1100) {
        setSlidesPerView(4);
      } else if (width >= 800) {
        setSlidesPerView(3);
      } else if (width >= 550) {
        setSlidesPerView(2);
      } else {
        setSlidesPerView(1);
      }
    };

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.contentRect) {
          updateSlidesPerView(entry.contentRect.width);
        }
      }
    });

    resizeObserver.observe(container);

    // Initial check
    setTimeout(() => {
      if (container) updateSlidesPerView(container.offsetWidth);
    }, 100);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [currentIndex, maxIndex]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const goToSlide = (index) => {
    const clamped = Math.max(0, Math.min(index, maxIndex));
    setCurrentIndex(clamped);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      nextSlide();
    }
    if (touchStart - touchEnd < -75) {
      prevSlide();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
  };

  if (!displayVideos.length) {
    return <p>No videos available.</p>;
  }

  const dotsCount = maxIndex + 1;

  const globalOptions = displayVideos[0]?.displayOptions || {};
  const containerMaxWidth = Number(globalOptions.maxWidth) || 1200; // Sliders can be wider than single videos
  const clampedMaxWidth = Math.max(200, containerMaxWidth);

  return (
    <div
      className="firstshorts-slider-container"
      style={{
        '--slides-per-view': slidesPerView,
        background: 'transparent',
        boxShadow: 'none',
        padding: '10px 0',
        maxWidth: `${clampedMaxWidth}px`,
        margin: '0 auto'
      }}
    >
      <style>{`.firstshorts-slider-container::before { display: none !important; }`}</style>
      <div
        className="firstshorts-slider-wrapper"
        style={{ background: 'transparent', border: 'none', backdropFilter: 'none' }}
        role="region"
        aria-roledescription="carousel"
        aria-label="Video slider"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <div
          className="firstshorts-slider"
          ref={sliderRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: `translateX(-${currentIndex * (100 / slidesPerView)}%)`,
            transition: 'transform 0.3s ease-in-out'
          }}
        >
          {displayVideos.map((video, index) => (
            <div key={video.id} className="firstshorts-slide">
              <VideoSliderCard video={video} index={index} />
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {displayVideos.length > 1 && (
          <>
            <button
              className="firstshorts-slider-btn firstshorts-slider-prev"
              onClick={prevSlide}
              aria-label="Previous video"
            >
              ‹
            </button>
            <button
              className="firstshorts-slider-btn firstshorts-slider-next"
              onClick={nextSlide}
              aria-label="Next video"
            >
              ›
            </button>
          </>
        )}
      </div>

      {displayVideos.length > 1 && (
        <div className="firstshorts-slider-counter" aria-live="polite">
          {currentIndex + 1} / {dotsCount}
        </div>
      )}

      {/* Dots Navigation */}
      {displayVideos.length > 1 && (
        <div className="firstshorts-slider-dots">
          {Array.from({ length: dotsCount }).map((_, index) => (
            <button
              key={index}
              className={`firstshorts-slider-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoSlider;
