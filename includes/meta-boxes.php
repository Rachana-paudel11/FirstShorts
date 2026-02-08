<?php
/**
 * Meta Boxes: FirstShorts Video
 * Handles custom meta fields for video CPT
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register Meta Box for Video Display Options
 * 
 * Pseudo Code:
 * - Create meta box container
 * - Set title to "Display Options"
 * - Attach to firstshorts_video CPT
 * - Use callback to render the meta box HTML
 * - Position: Normal (below editor), Priority: High (top)
 */
function firstshorts_register_meta_boxes() {
    // Display Options and Video Details meta boxes in main area
    add_meta_box(
        'firstshorts_video_display_options',
        __('Display Options', 'firstshorts'),
        'firstshorts_render_display_options_metabox',
        'firstshorts_video',
        'normal',
        'high'
    );

    add_meta_box(
        'firstshorts_video_details',
        __('Video Details', 'firstshorts'),
        'firstshorts_render_video_details_metabox',
        'firstshorts_video',
        'normal',
        'high'
    );

    add_meta_box(
        'firstshorts_video_preview',
        __('Preview', 'firstshorts'),
        'firstshorts_render_preview_metabox',
        'firstshorts_video',
        'normal',
        'high'
    );

}
add_action('add_meta_boxes', 'firstshorts_register_meta_boxes');

/**
 * Display Shortcode Meta Box After Title
 * Position the shortcode box prominently after the post title
 */
function firstshorts_shortcode_after_title() {
    global $post, $post_type;
    
    if ('firstshorts_video' !== $post_type) {
        return;
    }
    
    // Render shortcode meta box after title
    ?>
    <div id="firstshorts_video_shortcodes" class="firstshorts-shortcode-after-title">
        <div class="inside">
            <?php firstshorts_render_shortcodes_metabox($post); ?>
        </div>
    </div>
    <?php
}
add_action('edit_form_after_title', 'firstshorts_shortcode_after_title');



/**
 * Disable Block Editor for FirstShorts Video CPT
 * Ensures meta boxes display reliably on the edit screen.
 */
function firstshorts_disable_block_editor_for_video($use_block_editor, $post_type) {
    if ($post_type === 'firstshorts_video') {
        return false;
    }

    return $use_block_editor;
}
add_filter('use_block_editor_for_post_type', 'firstshorts_disable_block_editor_for_video', 10, 2);

/**
 * Enqueue admin styles for meta box layout
 */
function firstshorts_enqueue_admin_styles($hook) {
    // Only load on post edit screens for our CPT
    if ('post.php' !== $hook && 'post-new.php' !== $hook) {
        return;
    }
    
    global $post_type;
    if ('firstshorts_video' !== $post_type) {
        return;
    }
    
    $admin_css_path = plugin_dir_path(dirname(__FILE__)) . 'assets/css/style.css';
    $admin_css_ver = file_exists($admin_css_path) ? filemtime($admin_css_path) : '1.0.0';
    wp_enqueue_style(
        'firstshorts-admin-style',
        plugin_dir_url(dirname(__FILE__)) . 'assets/css/style.css',
        array(),
        $admin_css_ver
    );
    
    // Add inline script to wrap meta boxes in split layout and move editor below
    wp_add_inline_script('jquery', "
        jQuery(document).ready(function($) {
            var displayBox = $('#firstshorts_video_display_options');
            var detailsBox = $('#firstshorts_video_details');
                var thumbnailBox = $('#postimagediv');
            var previewBox = $('#firstshorts_video_preview');
            var shortcodeBox = $('#firstshorts_video_shortcodes');
            
            if (displayBox.length && detailsBox.length) {
                var mainWrapper = $('<div class=\"firstshorts-admin-main-box\"></div>');
                var splitWrapper = $('<div class=\"firstshorts-split-layout\"></div>');
                var tabsWrapper = $('<div class=\"firstshorts-tabs\"></div>');
                var tabsNav = $(
                    '<div class=\"firstshorts-tabs-nav\">' +
                        '<button type=\"button\" class=\"firstshorts-tab is-active\" data-tab=\"display\">Display Options</button>' +
                        '<button type=\"button\" class=\"firstshorts-tab\" data-tab=\"details\">Video Details</button>' +
                    '</div>'
                );
                var tabsBody = $('<div class=\"firstshorts-tabs-body\"></div>');
                var displayPanel = $('<div class=\"firstshorts-tab-panel is-active\" data-tab-panel=\"display\"></div>');
                var detailsPanel = $('<div class=\"firstshorts-tab-panel\" data-tab-panel=\"details\"></div>');
                var actions = $(
                    '<div class=\"firstshorts-main-actions\">' +
                        '<span class=\"firstshorts-save-hint\">Make changes to enable save</span>' +
                        '<button type=\"button\" class=\"button button-primary firstshorts-save-btn\">Save Settings</button>' +
                    '</div>'
                );

                displayBox.before(mainWrapper);
                if (shortcodeBox.length) {
                    mainWrapper.append(shortcodeBox);
                }
                mainWrapper.append(splitWrapper);
                displayPanel.append(displayBox);
                detailsPanel.append(detailsBox);
                tabsBody.append(displayPanel).append(detailsPanel);
                tabsWrapper.append(tabsNav).append(tabsBody);
                splitWrapper.append(tabsWrapper);
                if (previewBox.length) {
                    splitWrapper.append(previewBox);
                }
                mainWrapper.append(actions);

                if (thumbnailBox.length) {
                    var metaRow = $('<div class=\\\"firstshorts-meta-row\\\"></div>');
                    mainWrapper.after(metaRow);
                    metaRow.append(thumbnailBox);
                }

                // Move editor below the meta row
                var editorWrapper = $('#postdivrich');
                if (editorWrapper.length) {
                    var metaRow = $('.firstshorts-meta-row');
                    if (metaRow.length) {
                        metaRow.after(editorWrapper);
                    } else {
                        mainWrapper.after(editorWrapper);
                    }
                }

                var saveBtn = $('#save-post');
                var videoUrlField = $('#firstshorts_video_url');
                var displayTypeField = $('#firstshorts_display_type');
                var displayCheckboxes = displayBox.find('input[type=\"checkbox\"]');
                var videoDurationField = $('#firstshorts_video_duration');
                var maxWidthField = $('#firstshorts_video_max_width');
                var initialDisplayState = {};
                displayCheckboxes.each(function() {
                    initialDisplayState[this.id] = this.checked ? '1' : '0';
                });
                var initialDisplayType = displayTypeField.val();
                var initialVideoUrl = videoUrlField.val();
                var initialVideoDuration = videoDurationField.val();
                var initialMaxWidth = maxWidthField.val();

                function updateSaveState() {
                    var hasVideo = videoUrlField.val().trim() !== '';
                    var hasDisplayChange = false;
                    displayCheckboxes.each(function() {
                        if ((this.checked ? '1' : '0') !== initialDisplayState[this.id]) {
                            hasDisplayChange = true;
                        }
                    });
                    if (displayTypeField.val() !== initialDisplayType) {
                        hasDisplayChange = true;
                    }

                    var hasVideoDetailsChange = false;
                    if (videoUrlField.val() !== initialVideoUrl) {
                        hasVideoDetailsChange = true;
                    }
                    if (videoDurationField.val() !== initialVideoDuration) {
                        hasVideoDetailsChange = true;
                    }
                    if (maxWidthField.val() !== initialMaxWidth) {
                        hasVideoDetailsChange = true;
                    }

                    var canSave = hasVideo && (hasDisplayChange || hasVideoDetailsChange);
                    var hint = actions.find('.firstshorts-save-hint');
                    actions.find('.firstshorts-save-btn').prop('disabled', !canSave);
                    if (!hasVideo) {
                        hint.text('Video URL is required');
                    } else if (!hasDisplayChange && !hasVideoDetailsChange) {
                        hint.text('Change at least one setting');
                    } else {
                        hint.text('Ready to save settings');
                    }
                }

                function updatePreview() {
                    if (!previewBox.length) {
                        return;
                    }
                    var previewVideo = previewBox.find('.firstshorts-preview-video');
                    var previewEmpty = previewBox.find('.firstshorts-preview-empty');
                    var url = videoUrlField.val().trim();
                    if (!url) {
                        previewVideo.attr('src', '').hide();
                        previewEmpty.show();
                        return;
                    }
                    previewVideo.attr('src', url).show();
                    previewEmpty.hide();
                }

                updateSaveState();
                updatePreview();
                videoUrlField.on('input', function() {
                    updateSaveState();
                    updatePreview();
                });
                displayTypeField.on('change', updateSaveState);
                displayCheckboxes.on('change', updateSaveState);
                videoDurationField.on('input', updateSaveState);
                maxWidthField.on('input', updateSaveState);

                tabsWrapper.on('click', '.firstshorts-tab', function() {
                    var target = $(this).data('tab');
                    tabsWrapper.find('.firstshorts-tab').removeClass('is-active');
                    $(this).addClass('is-active');
                    tabsWrapper.find('.firstshorts-tab-panel').removeClass('is-active');
                    tabsWrapper.find('.firstshorts-tab-panel').filter(function() {
                        return $(this).data('tab-panel') === target;
                    }).addClass('is-active');
                });

                // Save Settings always keeps draft status
                mainWrapper.on('click', '.firstshorts-save-btn', function() {
                    var hasVideo = videoUrlField.val().trim() !== '';
                    var hasDisplayChange = false;
                    displayCheckboxes.each(function() {
                        if ((this.checked ? '1' : '0') !== initialDisplayState[this.id]) {
                            hasDisplayChange = true;
                        }
                    });
                    if (displayTypeField.val() !== initialDisplayType) {
                        hasDisplayChange = true;
                    }

                    var hasVideoDetailsChange = false;
                    if (videoUrlField.val() !== initialVideoUrl) {
                        hasVideoDetailsChange = true;
                    }
                    if (videoDurationField.val() !== initialVideoDuration) {
                        hasVideoDetailsChange = true;
                    }
                    if (maxWidthField.val() !== initialMaxWidth) {
                        hasVideoDetailsChange = true;
                    }

                    if (!hasVideo) {
                        showFirstshortsToast('Video URL is required.');
                        return;
                    }

                    if (!hasDisplayChange && !hasVideoDetailsChange) {
                        showFirstshortsToast('Please change at least one setting before saving.');
                        return;
                    }

                    $(window).off('beforeunload');
                    if (window.onbeforeunload) {
                        window.onbeforeunload = null;
                    }
                    $('#post_status').val('draft');
                    $('#original_post_status').val('draft');
                    if (saveBtn.length) {
                        saveBtn.trigger('click');
                    } else {
                        $('#post').trigger('submit');
                    }
                });

                function showFirstshortsToast(message) {
                    var toast = $('#firstshorts-admin-toast');
                    if (!toast.length) {
                        toast = $('<div id=\"firstshorts-admin-toast\" class=\"firstshorts-admin-toast\"></div>');
                        $('body').append(toast);
                    }
                    toast.text(message).addClass('is-visible');
                    clearTimeout(toast.data('timeoutId'));
                    var timeoutId = setTimeout(function() {
                        toast.removeClass('is-visible');
                    }, 2200);
                    toast.data('timeoutId', timeoutId);
                }
            }
        });
    ");
}
add_action('admin_enqueue_scripts', 'firstshorts_enqueue_admin_styles');


/**
 * Hide default permalink UI for FirstShorts Video
 */
function firstshorts_hide_default_permalink_ui() {
    global $post_type;
    if ($post_type !== 'firstshorts_video') {
        return;
    }

    echo '<style>#edit-slug-box { display: none; }</style>';
}
add_action('admin_head', 'firstshorts_hide_default_permalink_ui');

/**
 * Hide Screen Options tab for FirstShorts Video
 */
function firstshorts_hide_screen_options_tab() {
    global $post_type;
    if ($post_type !== 'firstshorts_video') {
        return;
    }

    echo '<style>#screen-options-link-wrap, #screen-meta { display: none; }</style>';
}
add_action('admin_head', 'firstshorts_hide_screen_options_tab');

/**
 * Remove Publish meta box for FirstShorts Video
 */
function firstshorts_remove_publish_metabox() {
    remove_meta_box('submitdiv', 'firstshorts_video', 'side');
}
add_action('add_meta_boxes_firstshorts_video', 'firstshorts_remove_publish_metabox', 99);

/**
 * Remove default slug metabox to hide slug UI
 */
function firstshorts_remove_default_slug_metabox() {
    remove_meta_box('slugdiv', 'firstshorts_video', 'normal');
    remove_meta_box('slugdiv', 'firstshorts_video', 'side');
}
add_action('add_meta_boxes_firstshorts_video', 'firstshorts_remove_default_slug_metabox', 100);

/**
 * Remove default slug metabox to avoid duplicate slug UI
 */


/**
 * Move Featured Image (Short Thumbnail) metabox to main area
 */
function firstshorts_move_thumbnail_metabox() {
    remove_meta_box('postimagediv', 'firstshorts_video', 'side');
    add_meta_box(
        'postimagediv',
        __('Short Thumbnail', 'firstshorts'),
        'post_thumbnail_meta_box',
        'firstshorts_video',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes_firstshorts_video', 'firstshorts_move_thumbnail_metabox', 101);


/**
 * Render Display Options Meta Box
 * Shows checkboxes for button visibility
 * 
 * Parameters:
 * @param WP_Post $post - The current post object
 * 
 * Pseudo Code:
 * 1. Create WordPress nonce (security token)
 * 2. Fetch saved checkbox values from database (meta keys start with _firstshorts_show_*)
 * 3. Loop through each button option:
 *    - View Count
 *    - Likes
 *    - Save
 *    - Share
 *    - Buy Button
 * 4. For each option, display a checkbox
 * 5. Check the box if value = 1 (enabled)
 * 6. Leave unchecked if value = 0 (disabled)
 * 7. Add CSS styling for clean look
 */
function firstshorts_render_display_options_metabox($post) {
    // Verify nonce for security (prevent unauthorized meta box updates)
    wp_nonce_field('firstshorts_video_nonce', 'firstshorts_video_nonce_field');

    // Retrieve saved checkbox values from post meta
    // get_post_meta returns 1 if checked, 0 if unchecked
    $show_view_count = get_post_meta($post->ID, '_firstshorts_show_view_count', true);
    $show_likes = get_post_meta($post->ID, '_firstshorts_show_likes', true);
    $show_save = get_post_meta($post->ID, '_firstshorts_show_save', true);
    $show_share = get_post_meta($post->ID, '_firstshorts_show_share', true);
    $show_buy_button = get_post_meta($post->ID, '_firstshorts_show_buy_button', true);
    $display_type = get_post_meta($post->ID, '_firstshorts_display_type', true);
    $max_width = get_post_meta($post->ID, '_firstshorts_video_max_width', true);
    if (empty($display_type)) {
        $display_type = 'single';
    }
    if (empty($max_width)) {
        $max_width = 500;
    }

    ?>
    <div class="firstshorts-metabox-content">
        <p class="description" style="margin-bottom: 15px;">
            <?php _e('Configure how this video will be displayed on the frontend.', 'firstshorts'); ?>
        </p>

        <div class="firstshorts-meta-field">
            <label for="firstshorts_display_type">
                <?php _e('Display Type', 'firstshorts'); ?>
            </label>
            <select id="firstshorts_display_type" name="firstshorts_display_type">
                <option value="single" <?php selected($display_type, 'single'); ?>>
                    <?php _e('Single Video', 'firstshorts'); ?>
                </option>
                <option value="slider" <?php selected($display_type, 'slider'); ?>>
                    <?php _e('Video Slider', 'firstshorts'); ?>
                </option>
            </select>
            <p class="description">
                <?php _e('Choose which shortcode to show for this video.', 'firstshorts'); ?>
            </p>
        </div>

        <div class="firstshorts-meta-field">
            <label><?php _e('Button Visibility', 'firstshorts'); ?></label>
            <div class="firstshorts-checkbox-group">
                <label class="firstshorts-checkbox-row">
                    <input type="checkbox" 
                           id="firstshorts_show_view_count" 
                           name="firstshorts_show_view_count" 
                           value="1" 
                           <?php checked($show_view_count, 1); ?> />
                    <span class="firstshorts-checkbox-label"><?php _e('View Count', 'firstshorts'); ?></span>
                </label>
                
                <label class="firstshorts-checkbox-row">
                    <input type="checkbox" 
                           id="firstshorts_show_likes" 
                           name="firstshorts_show_likes" 
                           value="1" 
                           <?php checked($show_likes, 1); ?> />
                    <span class="firstshorts-checkbox-label"><?php _e('Like Button', 'firstshorts'); ?></span>
                </label>
                
                <label class="firstshorts-checkbox-row">
                    <input type="checkbox" 
                           id="firstshorts_show_save" 
                           name="firstshorts_show_save" 
                           value="1" 
                           <?php checked($show_save, 1); ?> />
                    <span class="firstshorts-checkbox-label"><?php _e('Save Button', 'firstshorts'); ?></span>
                </label>
                
                <label class="firstshorts-checkbox-row">
                    <input type="checkbox" 
                           id="firstshorts_show_share" 
                           name="firstshorts_show_share" 
                           value="1" 
                           <?php checked($show_share, 1); ?> />
                    <span class="firstshorts-checkbox-label"><?php _e('Share Button', 'firstshorts'); ?></span>
                </label>
                
                <label class="firstshorts-checkbox-row">
                    <input type="checkbox" 
                           id="firstshorts_show_buy_button" 
                           name="firstshorts_show_buy_button" 
                           value="1" 
                           <?php checked($show_buy_button, 1); ?> />
                    <span class="firstshorts-checkbox-label"><?php _e('Buy Now / Add to Cart', 'firstshorts'); ?></span>
                </label>
                </div>
            </div>

        <div class="firstshorts-meta-field">
            <label for="firstshorts_video_max_width">
                <?php _e('Max Video Width (px)', 'firstshorts'); ?>
            </label>
            <input type="number"
                   id="firstshorts_video_max_width"
                   name="firstshorts_video_max_width"
                   value="<?php echo esc_attr($max_width); ?>"
                   min="200"
                   max="500"
                   step="10"
                   style="width: 200px;" />
            <p class="description"><?php _e('Controls the max width for the video player (200–500px).', 'firstshorts'); ?></p>
        </div>
    <?php
}

/**
 * Render Video Details Meta Box
 * Shows fields for video URL and other details
 * 
 * Parameters:
 * @param WP_Post $post - The current post object
 * 
 * Pseudo Code:
 * 1. Retrieve saved values from post meta:
 *    - Video URL (for self-hosted video path)
 *    - Video Source (always "self-hosted")
 *    - Video Duration (in seconds)
 * 2. Display form fields:
 *    - URL input with placeholder
 *    - Source dropdown (self-hosted only)
 *    - Duration number input
 * 3. Pre-fill fields with saved values (if any)
 * 4. Show help text under each field
 */
function firstshorts_render_video_details_metabox($post) {
    // Retrieve saved values from database, default to empty string if not found
    $video_url = get_post_meta($post->ID, '_firstshorts_video_url', true);
    $video_duration = get_post_meta($post->ID, '_firstshorts_video_duration', true);

    ?>
    <div class="firstshorts-metabox-content">
        <p class="description" style="margin-bottom: 15px;">
            <?php _e('Upload and configure your video file.', 'firstshorts'); ?>
        </p>
        
        <div class="firstshorts-meta-field">
            <label for="firstshorts_video_url">
                <?php _e('Video File', 'firstshorts'); ?>
            </label>
            <div class="firstshorts-input-row">
                <input type="url" 
                       id="firstshorts_video_url" 
                       name="firstshorts_video_url" 
                       value="<?php echo esc_url($video_url); ?>"
                       placeholder="https://example.com/video.mp4" />
                
                <button type="button" 
                        id="firstshorts_upload_video_btn" 
                        class="button button-secondary firstshorts-upload-btn">
                    <?php _e('Upload Video', 'firstshorts'); ?>
                </button>
            </div>
            
            <p class="description"><?php _e('Upload or enter the URL of the video file (MP4, WebM, OGG)', 'firstshorts'); ?></p>
        </div>

        <div class="firstshorts-meta-field">
            <label for="firstshorts_video_duration">
                <?php _e('Duration (seconds)', 'firstshorts'); ?>
            </label>
            <input type="number" 
                   id="firstshorts_video_duration" 
                   name="firstshorts_video_duration" 
                   value="<?php echo esc_attr($video_duration); ?>"
                   placeholder="300"
                   min="0"
                   style="width: 200px;" />
            <p class="description"><?php _e('Duration of the video in seconds (optional)', 'firstshorts'); ?></p>
        </div>
    </div>
    <?php
}

/**
 * Render Preview Meta Box
 */
function firstshorts_render_preview_metabox($post) {
    $video_url = get_post_meta($post->ID, '_firstshorts_video_url', true);
    ?>
    <div class="firstshorts-preview-body">
        <p class="firstshorts-preview-empty" <?php echo empty($video_url) ? '' : 'style="display:none;"'; ?>>
            <?php _e('Add a video URL to see a preview.', 'firstshorts'); ?>
        </p>
        <video class="firstshorts-preview-video" controls preload="metadata" <?php echo empty($video_url) ? 'style="display:none;"' : ''; ?>
               src="<?php echo esc_url($video_url); ?>"></video>
    </div>
    <?php
}

/**
 * Render Shortcodes Meta Box
 * Shows copyable shortcodes for single video and slider
 *
 * Parameters:
 * @param WP_Post $post - The current post object
 *
 * Pseudo Code:
 * 1. Build single video shortcode with current post ID
 * 2. Provide slider shortcode for multiple videos
 * 3. Show copy buttons for quick use
 */
function firstshorts_render_shortcodes_metabox($post) {
    $video_id = intval($post->ID);
    $display_type = get_post_meta($post->ID, '_firstshorts_display_type', true);
    $post_status = get_post_status($post);
    $saved_once = get_post_meta($post->ID, '_firstshorts_saved_once', true);
    $single_shortcode = '[firstshorts_video id="' . $video_id . '"]';
    $slider_shortcode = '[firstshorts_video_slider count="5"]';

    ?>
    <div class="firstshorts-shortcode-box">
        <?php if ($post_status === 'auto-draft' || empty($video_id) || empty($saved_once)) : ?>
            <p style="color: #b45309; margin: 0 0 10px;">
                <?php _e('Save settings to generate a shortcode.', 'firstshorts'); ?>
            </p>
        <?php else : ?>
            <?php if (empty($display_type)) : ?>
                <p style="color: #b45309; margin: 0 0 10px;">
                    <?php _e('Select a display type and save settings to generate a shortcode.', 'firstshorts'); ?>
                </p>
            <?php else : ?>
                <div class="firstshorts-shortcode-grid">
                    <?php if ($display_type === 'slider') : ?>
                        <div class="firstshorts-shortcode-item">
                            <label class="firstshorts-shortcode-label"><?php _e('Video Slider', 'firstshorts'); ?></label>
                            <div class="firstshorts-shortcode-row">
                                <input type="text" class="firstshorts-shortcode-input" readonly value="<?php echo esc_attr($slider_shortcode); ?>" />
                                <button type="button" class="button firstshorts-copy-btn" data-copy="<?php echo esc_attr($slider_shortcode); ?>">
                                    <?php _e('Copy', 'firstshorts'); ?>
                                </button>
                            </div>
                        </div>
                    <?php else : ?>
                        <div class="firstshorts-shortcode-item">
                            <label class="firstshorts-shortcode-label"><?php _e('Single Video', 'firstshorts'); ?></label>
                            <div class="firstshorts-shortcode-row">
                                <input type="text" class="firstshorts-shortcode-input" readonly value="<?php echo esc_attr($single_shortcode); ?>" />
                                <button type="button" class="button firstshorts-copy-btn" data-copy="<?php echo esc_attr($single_shortcode); ?>">
                                    <?php _e('Copy', 'firstshorts'); ?>
                                </button>
                            </div>
                        </div>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
        <?php endif; ?>
    </div>

    <style>
        .firstshorts-shortcode-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        
        .firstshorts-shortcode-item {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        
        .firstshorts-shortcode-label {
            font-weight: 600;
            font-size: 13px;
            color: #1e1e1e;
        }
        
        .firstshorts-shortcode-row {
            display: flex;
            gap: 6px;
            align-items: center;
        }
        
        .firstshorts-shortcode-input {
            flex: 1;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            font-size: 12px;
            padding: 6px 8px;
        }
        
        .firstshorts-copy-btn {
            padding: 4px 10px;
            min-width: auto;
            height: 30px;
        }
        
        @media screen and (max-width: 782px) {
            .firstshorts-shortcode-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
    <?php
}

/**
 * Save Meta Box Data
 * 
 * Runs on 'save_post_firstshorts_video' hook when video is saved
 * 
 * Parameters:
 * @param int $post_id - The ID of the post being saved
 * 
 * Pseudo Code:
 * 1. Security Check - Verify nonce token exists and is valid
 *    If nonce fails: Stop execution (unauthorized save)
 * 
 * 2. Permission Check - Verify current user can edit this post
 *    If no permission: Stop execution
 * 
 * 3. Autosave Check - Skip during WordPress autosave
 *    If autosave: Stop execution (we handle actual saves only)
 * 
 * 4. Save Display Options (Button Toggles)
 *    Loop through each button checkbox:
 *    - If checked (1): Save as 1
 *    - If unchecked: Save as 0
 *    Use update_post_meta() to store in database
 * 
 * 5. Save Video Details
 *    - URL: Sanitize and escape with esc_url_raw()
 *    - Source: Sanitize text
 *    - Duration: Sanitize text
 *    Use update_post_meta() for each field
 */
function firstshorts_save_video_meta($post_id) {
    // Step 1: Verify nonce security token
    // Nonce protects against CSRF (Cross-Site Request Forgery) attacks
    if (!isset($_POST['firstshorts_video_nonce_field']) || 
        !wp_verify_nonce($_POST['firstshorts_video_nonce_field'], 'firstshorts_video_nonce')) {
        return; // Stop if nonce fails
    }

    // Step 2: Verify user has permission to edit this post
    // This ensures only authorized users can save meta data
    if (!current_user_can('edit_post', $post_id)) {
        return; // Stop if user doesn't have permission
    }

    // Step 3: Avoid infinite loops
    // WordPress autosaves trigger this function, we only want to run on manual saves
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return; // Stop during autosave
    }
    
    // Step 4: Verify this is our post type
    if (get_post_type($post_id) !== 'firstshorts_video') {
        return;
    }

    // Step 5: Save display options (checkboxes for buttons)
    // Array of all checkbox field names
    $display_fields = array(
        'firstshorts_show_view_count',
        'firstshorts_show_likes',
        'firstshorts_show_save',
        'firstshorts_show_share',
        'firstshorts_show_buy_button'
    );

    // Loop through each checkbox field
    foreach ($display_fields as $field) {
        // Add underscore prefix for meta key (WordPress convention)
        $meta_key = '_' . $field;
        
        // If checkbox is checked, save 1; if unchecked, save 0
        $value = isset($_POST[$field]) ? 1 : 0;
        
        // Save to database
        update_post_meta($post_id, $meta_key, $value);
    }

    // Step 6: Save video details
    
    // Save Video URL (with security: sanitize and escape)
    if (isset($_POST['firstshorts_video_url'])) {
        update_post_meta(
            $post_id,
            '_firstshorts_video_url',
            esc_url_raw($_POST['firstshorts_video_url']) // Validates and escapes URL
        );
    }

    // Save Video Duration (sanitize number input)
    if (isset($_POST['firstshorts_video_duration'])) {
        update_post_meta(
            $post_id,
            '_firstshorts_video_duration',
            sanitize_text_field($_POST['firstshorts_video_duration']) // Convert to safe text
        );
    }

    if (isset($_POST['firstshorts_video_max_width'])) {
        $max_width = absint($_POST['firstshorts_video_max_width']);
        if ($max_width < 200) {
            $max_width = 200;
        } elseif ($max_width > 500) {
            $max_width = 500;
        }
        update_post_meta(
            $post_id,
            '_firstshorts_video_max_width',
            $max_width
        );
    }
    
    // Save Display Type
    if (isset($_POST['firstshorts_display_type'])) {
        update_post_meta(
            $post_id,
            '_firstshorts_display_type',
            sanitize_text_field($_POST['firstshorts_display_type'])
        );
    }

    // Mark that settings have been saved at least once
    update_post_meta($post_id, '_firstshorts_saved_once', 1);
}
add_action('save_post_firstshorts_video', 'firstshorts_save_video_meta');

/**
 * Enqueue Admin Scripts and Styles
 * 
 * Pseudo Code:
 * 1. Register media uploader script
 * 2. Enqueue only on FirstShorts Video edit page
 * 3. Pass media library configuration to JavaScript
 */
function firstshorts_enqueue_admin_scripts($hook) {
    // Check if we're on FirstShorts Video edit page
    global $post_type;
    if ($post_type !== 'firstshorts_video' || !in_array($hook, array('post.php', 'post-new.php'))) {
        return;
    }

    // Enqueue WordPress media library (required for uploads)
    wp_enqueue_media();

    // Enqueue custom admin script
    wp_enqueue_script(
        'firstshorts-admin',
        plugin_dir_url(__FILE__) . '../assets/js/admin-video-upload.js',
        array('jquery'),
        '1.0.0',
        true
    );

    // Pass data to JavaScript
    wp_localize_script('firstshorts-admin', 'firstshortsAdmin', array(
        'uploadTitle' => __('Select Video', 'firstshorts'),
        'uploadButton' => __('Use this video', 'firstshorts'),
        'allowedTypes' => array('video/mp4', 'video/webm', 'video/ogg'),
    ));
}
add_action('admin_enqueue_scripts', 'firstshorts_enqueue_admin_scripts');

/**
 * Helper Function: Get Display Options for a Video
 * 
 * Used in frontend shortcode/template to determine which buttons to show
 * 
 * Parameters:
 * @param int $post_id - Video post ID
 * 
 * Returns:
 * @return array - Associative array with button visibility states
 *   Example: ['view_count' => true, 'likes' => false, 'save' => true, ...]
 * 
 * Pseudo Code:
 * 1. Query database for all button visibility settings
 * 2. Convert stored values (0/1) to boolean (true/false)
 * 3. Return as array for easy frontend access
 * 
 * Usage Example:
 * $options = firstshorts_get_display_options(123);
 * if ($options['likes']) {
 *     echo "Show like button";
 * }
 */
function firstshorts_get_display_options($post_id) {
    // Query database for each button setting and convert to boolean
    return array(
        'view_count' => (bool) get_post_meta($post_id, '_firstshorts_show_view_count', true),
        'likes' => (bool) get_post_meta($post_id, '_firstshorts_show_likes', true),
        'save' => (bool) get_post_meta($post_id, '_firstshorts_show_save', true),
        'share' => (bool) get_post_meta($post_id, '_firstshorts_show_share', true),
        'buy_button' => (bool) get_post_meta($post_id, '_firstshorts_show_buy_button', true),
        'max_width' => (int) get_post_meta($post_id, '_firstshorts_video_max_width', true),
    );
}

/**
 * Helper Function: Get Video Details
 * 
 * Used in frontend shortcode/template to retrieve video information
 * 
 * Parameters:
 * @param int $post_id - Video post ID
 * 
 * Returns:
 * @return array - Associative array with video data
 *   Example: [
 *     'url' => 'https://yoursite.com/videos/demo.mp4',
 *     'source' => 'self-hosted',
 *     'duration' => '300'
 *   ]
 * 
 * Pseudo Code:
 * 1. Query database for video URL
 * 2. Query database for video source type
 * 3. Query database for video duration
 * 4. Return all values in array format
 * 
 * Usage Example:
 * $details = firstshorts_get_video_details(123);
 * echo "<video src='" . $details['url'] . "'></video>";
 * echo "Duration: " . $details['duration'] . " seconds";
 */
function firstshorts_get_video_details($post_id) {
    // Retrieve video metadata from database
    return array(
        'url' => get_post_meta($post_id, '_firstshorts_video_url', true),        // Full URL to video file
        'source' => get_post_meta($post_id, '_firstshorts_video_source', true),  // Video source type
        'duration' => get_post_meta($post_id, '_firstshorts_video_duration', true), // Duration in seconds
    );
}
