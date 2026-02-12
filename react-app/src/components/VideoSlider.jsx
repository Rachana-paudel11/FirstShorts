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
    showBuyButton: true
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

  return (
    <div className="firstshorts-slide-card" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
      <div className="firstshorts-slide-media" style={{ boxShadow: 'none', background: 'transparent' }}>
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
        <div className="firstshorts-slide-gradient" style={{ display: 'none' }} />
        <div className="firstshorts-slide-meta" style={{ bottom: '10px' }}>
          {displayOptions.showBuyButton && (
            <div className="firstshorts-slide-cta-row" style={{ justifyContent: 'center' }}>
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
    const updateSlidesPerView = () => {
      const width = window.innerWidth;
      if (width >= 1200) {
        setSlidesPerView(4);
      } else if (width >= 900) {
        setSlidesPerView(3);
      } else if (width >= 640) {
        setSlidesPerView(2);
      } else {
        setSlidesPerView(1);
      }
    };

    updateSlidesPerView();
    window.addEventListener('resize', updateSlidesPerView);
    return () => window.removeEventListener('resize', updateSlidesPerView);
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

  return (
    <div
      className="firstshorts-slider-container"
      style={{ '--slides-per-view': slidesPerView, background: 'transparent', boxShadow: 'none', padding: '10px 0' }}
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
