/**
 * FirstShorts Video - Frontend JavaScript
 * Handles button interactions and slider functionality
 */

(function($) {
    'use strict';

    /**
     * Initialize video player buttons
     * Attaches click handlers to all buttons
     */
    function initializeVideoButtons() {
        // View Count Button Click
        $(document).on('click', '.firstshorts-btn-view-count', function() {
            var button = $(this);
            var count = parseInt(button.find('span').text()) || 0;
            button.find('span').text(count + 1);
            console.log('View count incremented to:', count + 1);
        });

        // Like Button Click
        $(document).on('click', '.firstshorts-btn-like', function() {
            var button = $(this);
            var count = parseInt(button.find('span').text()) || 0;
            
            if (button.hasClass('liked')) {
                // Unlike
                button.removeClass('liked');
                button.find('span').text(Math.max(0, count - 1));
                console.log('Video unliked');
            } else {
                // Like
                button.addClass('liked');
                button.find('span').text(count + 1);
                console.log('Video liked');
            }
        });

        // Save Button Click
        $(document).on('click', '.firstshorts-btn-save', function() {
            var button = $(this);
            
            if (button.hasClass('saved')) {
                // Unsave
                button.removeClass('saved');
                button.text('📌 ' + 'Save');
                console.log('Video unsaved');
            } else {
                // Save
                button.addClass('saved');
                button.text('📌 ' + 'Saved');
                console.log('Video saved');
            }
        });

        // Share Button Click
        $(document).on('click', '.firstshorts-btn-share', function() {
            var videoUrl = window.location.href;
            var videoTitle = $('.firstshorts-video-title').text();
            
            // Use Web Share API if available
            if (navigator.share) {
                navigator.share({
                    title: videoTitle,
                    url: videoUrl
                }).catch(function(err) {
                    console.log('Share error:', err);
                });
            } else {
                // Fallback: Copy to clipboard
                var copyText = videoUrl;
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(copyText).then(function() {
                        alert('Video URL copied to clipboard!');
                    });
                } else {
                    alert('Share URL: ' + videoUrl);
                }
            }
            console.log('Video shared');
        });

        // Buy Button Click
        $(document).on('click', '.firstshorts-btn-buy', function() {
            console.log('Buy button clicked - Add to cart functionality');
            // This will be connected to WooCommerce in Phase 2
            alert('Add to Cart functionality - Coming Soon');
        });
    }

    /**
     * Initialize Slider
     * Handles slider navigation and auto-scroll
     */
    function initializeSlider() {
        var sliders = $('.firstshorts-slider');

        sliders.each(function() {
            var slider = $(this);
            var container = slider.closest('.firstshorts-slider-container');
            var prevBtn = container.find('.firstshorts-slider-prev');
            var nextBtn = container.find('.firstshorts-slider-next');
            var dots = container.find('.firstshorts-dot');
            var slideWidth = slider.find('.firstshorts-slide').outerWidth(true);

            // Next button click
            nextBtn.on('click', function() {
                slider.animate({
                    scrollLeft: slider.scrollLeft() + slideWidth
                }, 300);
                updateDots(slider, container);
            });

            // Previous button click
            prevBtn.on('click', function() {
                slider.animate({
                    scrollLeft: slider.scrollLeft() - slideWidth
                }, 300);
                updateDots(slider, container);
            });

            // Dot click navigation
            dots.on('click', function() {
                var index = $(this).data('slide');
                var scrollPosition = index * slideWidth;
                slider.animate({
                    scrollLeft: scrollPosition
                }, 300);
                updateDots(slider, container);
            });

            // Update dots on scroll
            slider.on('scroll', function() {
                updateDots(slider, container);
            });

            // Play button on slide click
            slider.find('.firstshorts-play-btn').on('click', function(e) {
                e.preventDefault();
                var slide = $(this).closest('.firstshorts-slide');
                var videoId = slide.data('video-id');
                console.log('Play video:', videoId);
            });
        });
    }

    /**
     * Update active dot based on scroll position
     */
    function updateDots(slider, container) {
        var scrollLeft = slider.scrollLeft();
        var slideWidth = slider.find('.firstshorts-slide').outerWidth(true);
        var activeIndex = Math.round(scrollLeft / slideWidth);
        
        container.find('.firstshorts-dot').removeClass('active');
        container.find('.firstshorts-dot').eq(activeIndex).addClass('active');
    }

    /**
     * Initialize touch swipe support for mobile
     */
    function initializeTouchSupport() {
        var touchStartX = 0;
        var touchEndX = 0;

        $(document).on('touchstart', '.firstshorts-slider', function() {
            touchStartX = event.changedTouches[0].screenX;
        });

        $(document).on('touchend', '.firstshorts-slider', function() {
            touchEndX = event.changedTouches[0].screenX;
            handleSwipe();
        });

        function handleSwipe() {
            if (touchEndX < touchStartX - 50) {
                // Swiped left - show next
                $('.firstshorts-slider-next').trigger('click');
            }
            if (touchEndX > touchStartX + 50) {
                // Swiped right - show previous
                $('.firstshorts-slider-prev').trigger('click');
            }
        }
    }

    /**
     * Document Ready - Initialize all components
     */
    $(document).ready(function() {
        console.log('FirstShorts frontend initialized');
        
        initializeVideoButtons();
        initializeSlider();
        initializeTouchSupport();
    });

})(jQuery);
