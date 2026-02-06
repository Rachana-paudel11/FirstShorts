import React, { useState, useRef } from 'react';

const VideoSlider = ({ videos = [], count = 5 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const sliderRef = useRef(null);

  // Limit videos to count
  const displayVideos = videos.slice(0, count);

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev === displayVideos.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? displayVideos.length - 1 : prev - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
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

  return (
    <div className="firstshorts-slider-container">
      <div
        className="firstshorts-slider-wrapper"
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
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: 'transform 0.3s ease-in-out'
          }}
        >
          {displayVideos.map((video, index) => (
            <div key={video.id} className="firstshorts-slide">
              <div className="firstshorts-slide-thumbnail">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="firstshorts-slide-image"
                  loading={index > 0 ? 'lazy' : 'eager'}
                />
                <div className="firstshorts-play-overlay">
                  <a 
                    href={video.permalink} 
                    className="firstshorts-play-btn"
                    aria-label={`Play ${video.title}`}
                  >
                    ▶
                  </a>
                </div>
              </div>
              
              <div className="firstshorts-slide-info">
                <h3 className="firstshorts-slide-title">
                  <a href={video.permalink}>{video.title}</a>
                </h3>
                {video.excerpt && (
                  <p className="firstshorts-slide-excerpt">{video.excerpt}</p>
                )}
              </div>
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
          {currentIndex + 1} / {displayVideos.length}
        </div>
      )}

      {/* Dots Navigation */}
      {displayVideos.length > 1 && (
        <div className="firstshorts-slider-dots">
          {displayVideos.map((_, index) => (
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
