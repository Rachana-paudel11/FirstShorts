/**
 * FirstShorts Admin - Video Upload Handler
 * Handles WordPress media library integration for video uploads
 */

(function($) {
    'use strict';

    /**
     * Initialize Video Upload Handler
     * 
     * Pseudo Code:
     * 1. Wait for document ready
     * 2. Get upload button element
     * 3. Attach click event to button
     * 4. Open WordPress media library
     * 5. Filter to show only video files
     * 6. On selection, get video URL
     * 7. Auto-fill Video URL input field
     */
    $(document).ready(function() {
        // Get the upload button
        var uploadButton = $('#firstshorts_upload_video_btn');
        var videoUrlInput = $('#firstshorts_video_url');

        // Store the WordPress media frame
        var mediaFrame;

        // Upload button click handler
        uploadButton.on('click', function(e) {
            e.preventDefault();

            // If frame already exists, reopen it
            if (mediaFrame) {
                mediaFrame.open();
                return;
            }

            /**
             * Create new media frame
             * Configuration:
             * - title: "Select Video" (shown at top of modal)
             * - button: "Use this video" (button text)
             * - library.type: 'video' (filter to show only videos)
             * - multiple: false (select only one video)
             */
            mediaFrame = wp.media({
                title: firstshortsAdmin.uploadTitle,
                button: {
                    text: firstshortsAdmin.uploadButton
                },
                library: {
                    type: 'video' // Only show video files
                },
                multiple: false // Allow selecting only one video
            });

            /**
             * When video is selected
             * Get the selected video attachment object
             */
            mediaFrame.on('select', function() {
                // Get selected attachment
                var attachment = mediaFrame.state().get('selection').first().toJSON();

                // Get video URL from attachment
                var videoUrl = attachment.url;
                var videoType = attachment.mime;

                // Validate video type
                if (!isValidVideoType(videoType)) {
                    alert(firstshortsAdmin.invalidType || 'Invalid video format. Please select MP4, WebM, or OGG.');
                    return;
                }

                // Auto-fill the Video URL field
                videoUrlInput.val(videoUrl);

                // Optional: Show success message
                console.log('Video uploaded successfully:', videoUrl);
                console.log('Video type:', videoType);

                // Trigger change event (for any dependent scripts)
                videoUrlInput.trigger('change');
            });

            // Open the media library modal
            mediaFrame.open();
        });

        /**
         * Validate video file type
         * 
         * @param {string} mimeType - The MIME type from attachment
         * @return {boolean} - True if valid video format
         */
        function isValidVideoType(mimeType) {
            // Allowed video MIME types
            var allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
            return allowedTypes.indexOf(mimeType) !== -1;
        }

        /**
         * Copy Shortcode Button Handler
         * Copies shortcode text to clipboard
         */
        $(document).on('click', '.firstshorts-copy-btn', function() {
            var shortcode = $(this).data('copy');
            var button = $(this);

            if (navigator.clipboard && shortcode) {
                navigator.clipboard.writeText(shortcode).then(function() {
                    button.text('Copied');
                    setTimeout(function() {
                        button.text('Copy');
                    }, 1500);
                });
            } else if (shortcode) {
                // Fallback for older browsers
                var tempInput = $('<input>');
                $('body').append(tempInput);
                tempInput.val(shortcode).select();
                document.execCommand('copy');
                tempInput.remove();

                button.text('Copied');
                setTimeout(function() {
                    button.text('Copy');
                }, 1500);
            }
        });
    });

})(jQuery);
