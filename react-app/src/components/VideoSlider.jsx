import React, { useState, useRef, useEffect } from 'react';

const VideoSliderCard = ({ video, isActive }) => {
  const videoRef = useRef(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [viewCount] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [lastTap, setLastTap] = useState(0);
  const [showHeart, setShowHeart] = useState(false);
  const [showPlayPause, setShowPlayPause] = useState(null);
  const [muteStatusTimer, setMuteStatusTimer] = useState(null);
  const [showMuteIndicator, setShowMuteIndicator] = useState(false);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    if (isActive && !document.hidden) {
      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.log('Autoplay prevented:', e);
        });
      }
    } else {
      vid.pause();
    }
  }, [isActive]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && videoRef.current) {
        videoRef.current.pause();
      } else if (!document.hidden && isActive && videoRef.current) {
        videoRef.current.play().catch(() => { });
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isActive]);

  const defaultOptions = {
    showViewCount: true,
    showLikes: true,
    showSave: true,
    showShare: true,
    showBuyButton: true,
    ctaText: 'Buy Now',
    ctaLink: '',
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
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  const handleVideoClick = (e) => {
    // Prevent interaction if video is not active to avoid audio chaos
    if (!isActive) return;

    const now = Date.now();
    if (now - lastTap < 300) {
      // Double tap detected
      if (!liked) handleLike();
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    } else {
      // Single tap - toggle play/pause
      if (videoRef.current) {
        if (videoRef.current.paused) {
          videoRef.current.play();
          setShowPlayPause('play');
        } else {
          videoRef.current.pause();
          setShowPlayPause('pause');
        }
        setTimeout(() => setShowPlayPause(null), 800);
      }
    }
    setLastTap(now);
  };

  const toggleMute = (e) => {
    if (e) e.stopPropagation();
    setIsMuted(!isMuted);
    setShowMuteIndicator(true);
    if (muteStatusTimer) clearTimeout(muteStatusTimer);
    const timer = setTimeout(() => setShowMuteIndicator(false), 1500);
    setMuteStatusTimer(timer);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
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
    console.log('Add to cart clicked');
  };

  const maxWidth = Number(displayOptions.maxWidth) || 360;
  const maxHeight = Number(displayOptions.maxHeight) || 640;
  const clampedMaxWidth = Math.min(1200, Math.max(150, maxWidth));
  const clampedMaxHeight = Math.min(1500, Math.max(200, maxHeight));

  return (
    <div className="firstshorts-video-container" style={{ maxWidth: `${clampedMaxWidth}px`, padding: 0, background: 'transparent', border: 'none', boxShadow: 'none' }}>
      {/* Video Player */}
      <div className="firstshorts-video-player-wrapper" style={{ boxShadow: 'none', background: 'transparent', height: `${clampedMaxHeight}px` }}>
        <video
          ref={videoRef}
          src={video.videoUrl}
          poster={video.thumbnail}
          className="firstshorts-slide-image"
          loop
          muted={!isActive || isMuted}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onClick={handleVideoClick}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px', cursor: 'pointer' }}
        />

        {/* Progress Bar */}
        <div className="firstshorts-video-progress-container" style={{
          position: 'absolute', bottom: '0', left: '0', width: '100%', height: '4px', background: 'rgba(255,255,255,0.2)', zIndex: 10, borderRadius: '0 0 12px 12px', overflow: 'hidden'
        }}>
          <div className="firstshorts-video-progress-bar" style={{
            width: `${progress}%`, height: '100%', background: '#38bdf8', transition: 'width 0.1s linear'
          }}></div>
        </div>

        {/* Mute Toggle */}
        <button
          onClick={toggleMute}
          className="firstshorts-mute-btn"
          style={{
            position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', zIndex: 20
          }}
        >
          {isMuted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
          )}
        </button>

        {/* Play/Pause Flash Overlay */}
        {showPlayPause && (
          <div className="firstshorts-status-flash" style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 100, background: 'rgba(0,0,0,0.3)', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'statusFlash 0.8s ease-out'
          }}>
            {showPlayPause === 'play' ? (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#fff"><path d="M5 3l14 9-14 9V3z"></path></svg>
            ) : (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#fff"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
            )}
          </div>
        )}

        {/* Mute Status Tip */}
        {showMuteIndicator && (
          <div className="firstshorts-mute-indicator" style={{
            position: 'absolute', top: '60px', right: '15px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', zIndex: 20, animation: 'fadeInOut 1.5s ease-in-out'
          }}>
            {isMuted ? 'MUTED' : 'UNMUTED'}
          </div>
        )}

        {/* Double Tap Heart Animation */}
        {showHeart && (
          <div className="firstshorts-heart-animation" style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 100, animation: 'heartPulse 0.8s ease-out'
          }}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </div>
        )}

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

          <div className="firstshorts-slide-meta" style={{ pointerEvents: 'auto' }}>
            {video.description && (
              <div className="firstshorts-video-description" style={{
                color: '#fff',
                fontSize: '13px',
                marginBottom: '10px',
                padding: '0 5px',
                textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                display: '-webkit-box',
                WebkitLineClamp: '2',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: '1.4'
              }}>
                {video.description}
              </div>
            )}
            {displayOptions.showBuyButton && (
              <div className="firstshorts-slide-cta-row">
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
        </div>
      </div >
    </div >
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

  const globalOptions = displayVideos[0]?.displayOptions || {};
  const orientation = globalOptions.orientation || 'horizontal';
  const scrollSnap = globalOptions.scrollSnap !== false;

  const currentSlidesPerView = orientation === 'vertical' ? 1 : slidesPerView;
  const maxIndex = Math.max(0, displayVideos.length - currentSlidesPerView);

  useEffect(() => {
    const container = sliderRef.current;
    if (!container) return;

    const updateSlidesPerView = (width) => {
      if (orientation === 'vertical') {
        setSlidesPerView(1);
        return;
      }
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
    const isVertical = orientation === 'vertical';
    setTouchStart(isVertical ? e.targetTouches[0].clientY : e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    const isVertical = orientation === 'vertical';
    setTouchEnd(isVertical ? e.targetTouches[0].clientY : e.targetTouches[0].clientX);
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
    const isVertical = orientation === 'vertical';
    if (isVertical) {
      if (e.key === 'ArrowUp') prevSlide();
      if (e.key === 'ArrowDown') nextSlide();
    } else {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    }
  };

  if (!displayVideos.length) {
    return <p>No videos available.</p>;
  }

  const dotsCount = maxIndex + 1;

  const containerMaxWidth = Number(globalOptions.maxWidth) || 360;
  const containerMaxHeight = Number(globalOptions.maxHeight) || 640;
  const clampedMaxWidth = Math.max(150, containerMaxWidth);

  return (
    <div
      className="firstshorts-slider-container"
      style={{
        '--slides-per-view': slidesPerView,
        background: 'transparent',
        boxShadow: 'none',
        padding: orientation === 'vertical' ? '40px 0' : '20px 70px',
        margin: '0 auto',
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      <style>{`.firstshorts-slider-container::before { display: none !important; }`}</style>
      <div
        className={`firstshorts-slider-wrapper ${orientation === 'vertical' ? 'vertical' : 'horizontal'}`}
        style={{
          background: 'transparent',
          border: 'none',
          backdropFilter: 'none',
          height: orientation === 'vertical' ? `${containerMaxHeight}px` : 'auto',
          maxWidth: orientation === 'horizontal' ? `${clampedMaxWidth}px` : 'none',
          margin: '0 auto',
          overflow: 'hidden'
        }}
        role="region"
        aria-roledescription="carousel"
        aria-label="Video slider"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <div
          className={`firstshorts-slider ${orientation === 'vertical' ? 'vertical' : 'horizontal'}`}
          ref={sliderRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            display: 'flex',
            flexDirection: orientation === 'vertical' ? 'column' : 'row',
            transform: orientation === 'vertical'
              ? `translateY(-${currentIndex * 100}%)`
              : `translateX(-${currentIndex * (100 / currentSlidesPerView)}%)`,
            transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
            height: orientation === 'vertical' ? '100%' : 'auto'
          }}
        >
          {displayVideos.map((video, index) => (
            <div
              key={video.id}
              className="firstshorts-slide"
              style={orientation === 'vertical' ? {
                flex: '0 0 100%',
                height: '100%',
                scrollSnapAlign: scrollSnap ? 'start' : 'none'
              } : {
                flex: `0 0 ${100 / currentSlidesPerView}%`,
                scrollSnapAlign: scrollSnap ? 'start' : 'none'
              }}
            >
              <VideoSliderCard
                video={video}
                isActive={index === currentIndex}
                displayOptions={video.displayOptions}
              />
            </div>
          ))}
        </div>
      </div>

      {displayVideos.length > currentSlidesPerView && (
        <>
          <button
            className={`firstshorts-slider-nav firstshorts-slider-nav-prev ${orientation === 'vertical' ? 'vertical' : 'horizontal'}`}
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {orientation === 'vertical' ? <polyline points="18 15 12 9 6 15"></polyline> : <polyline points="15 18 9 12 15 6"></polyline>}
            </svg>
          </button>
          <button
            className={`firstshorts-slider-nav firstshorts-slider-nav-next ${orientation === 'vertical' ? 'vertical' : 'horizontal'}`}
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {orientation === 'vertical' ? <polyline points="6 9 12 15 18 9"></polyline> : <polyline points="9 18 15 12 9 6"></polyline>}
            </svg>
          </button>
        </>
      )}

      {displayVideos.length > currentSlidesPerView && (
        <div className={`firstshorts-slider-dots ${orientation === 'vertical' ? 'vertical' : 'horizontal'}`}>
          {Array.from({ length: dotsCount }).map((_, i) => (
            <button
              key={i}
              className={`firstshorts-slider-dot ${currentIndex === i ? 'active' : ''}`}
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoSlider;
