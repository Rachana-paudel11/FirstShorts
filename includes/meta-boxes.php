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
    
    wp_enqueue_style(
        'firstshorts-admin-style',
        plugin_dir_url(dirname(__FILE__)) . 'assets/css/style.css',
        array(),
        '1.0.0'
    );
}
add_action('admin_enqueue_scripts', 'firstshorts_enqueue_admin_styles');


/**
 * Hide Permalink/Slug UI for FirstShorts Video
 */
function firstshorts_hide_video_permalink_ui() {
    global $post_type;
    if ($post_type !== 'firstshorts_video') {
        return;
    }

    echo '<style>#edit-slug-box { display: none; }</style>';
}
add_action('admin_head', 'firstshorts_hide_video_permalink_ui');


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
    if (empty($display_type)) {
        $display_type = 'single';
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
                <label>
                    <input type="checkbox" 
                           id="firstshorts_show_view_count" 
                           name="firstshorts_show_view_count" 
                           value="1" 
                           <?php checked($show_view_count, 1); ?> />
                    <?php _e('View Count', 'firstshorts'); ?>
                </label>
                
                <label>
                    <input type="checkbox" 
                           id="firstshorts_show_likes" 
                           name="firstshorts_show_likes" 
                           value="1" 
                           <?php checked($show_likes, 1); ?> />
                    <?php _e('Like Button', 'firstshorts'); ?>
                </label>
                
                <label>
                    <input type="checkbox" 
                           id="firstshorts_show_save" 
                           name="firstshorts_show_save" 
                           value="1" 
                           <?php checked($show_save, 1); ?> />
                    <?php _e('Save Button', 'firstshorts'); ?>
                </label>
                
                <label>
                    <input type="checkbox" 
                           id="firstshorts_show_share" 
                           name="firstshorts_show_share" 
                           value="1" 
                           <?php checked($show_share, 1); ?> />
                    <?php _e('Share Button', 'firstshorts'); ?>
                </label>
                
                <label>
                    <input type="checkbox" 
                           id="firstshorts_show_buy_button" 
                           name="firstshorts_show_buy_button" 
                           value="1" 
                           <?php checked($show_buy_button, 1); ?> />
                    <?php _e('Buy Now / Add to Cart', 'firstshorts'); ?>
                </label>
            </div>
        </div>
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
    $video_source = get_post_meta($post->ID, '_firstshorts_video_source', true);
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
            
            <p class="description"><?php _e('Upload or enter the URL of the video file (MP4, WebM, OGG)', 'firstshorts'); ?></p>
        </div>

        <div class="firstshorts-meta-field">
            <label for="firstshorts_video_source">
                <?php _e('Video Source', 'firstshorts'); ?>
            </label>
            <select id="firstshorts_video_source" name="firstshorts_video_source">
                <option value="self-hosted" <?php selected($video_source, 'self-hosted'); ?>>
                    <?php _e('Self-Hosted', 'firstshorts'); ?>
                </option>
            </select>
            <p class="description"><?php _e('Videos are self-hosted on your server', 'firstshorts'); ?></p>
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
    $single_shortcode = '[firstshorts_video id="' . $video_id . '"]';
    $slider_shortcode = '[firstshorts_video_slider count="5"]';

    ?>
    <div class="firstshorts-shortcode-box">
        <?php if (empty($video_id)): ?>
            <p style="color: #b45309; margin: 0 0 10px;">
                <?php _e('Save the video to generate a shortcode.', 'firstshorts'); ?>
            </p>
        <?php endif; ?>
        <p><strong><?php _e('Single Video', 'firstshorts'); ?></strong></p>
        <div class="firstshorts-shortcode-row">
            <input type="text" class="firstshorts-shortcode-input" readonly value="<?php echo esc_attr($single_shortcode); ?>" />
            <button type="button" class="button firstshorts-copy-btn" data-copy="<?php echo esc_attr($single_shortcode); ?>">
                <?php _e('Copy', 'firstshorts'); ?>
            </button>
        </div>

        <p style="margin-top: 12px;"><strong><?php _e('Video Slider', 'firstshorts'); ?></strong></p>
        <div class="firstshorts-shortcode-row">
            <input type="text" class="firstshorts-shortcode-input" readonly value="<?php echo esc_attr($slider_shortcode); ?>" />
            <button type="button" class="button firstshorts-copy-btn" data-copy="<?php echo esc_attr($slider_shortcode); ?>">
                <?php _e('Copy', 'firstshorts'); ?>
            </button>
        </div>
    </div>

    <style>
        .firstshorts-shortcode-row {
            display: flex;
            gap: 6px;
            align-items: center;
        }
        .firstshorts-shortcode-input {
            width: 100%;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            font-size: 12px;
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

    // Step 4: Save display options (checkboxes for buttons)
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

    // Step 5: Save video details
    
    // Save Video URL (with security: sanitize and escape)
    if (isset($_POST['firstshorts_video_url'])) {
        update_post_meta(
            $post_id,
            '_firstshorts_video_url',
            esc_url_raw($_POST['firstshorts_video_url']) // Validates and escapes URL
        );
    }

    // Save Video Source (sanitize to prevent injection)
    if (isset($_POST['firstshorts_video_source'])) {
        update_post_meta(
            $post_id,
            '_firstshorts_video_source',
            sanitize_text_field($_POST['firstshorts_video_source']) // Remove HTML/scripts
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
}
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
