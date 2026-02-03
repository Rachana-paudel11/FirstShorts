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
    // Add meta box for display options (which buttons to show)
    add_meta_box(
        'firstshorts_video_display_options',  // Unique ID
        __('Display Options', 'firstshorts'), // Title shown in admin
        'firstshorts_render_display_options_metabox', // Callback function to render HTML
        'firstshorts_video',  // Post type this meta box appears on
        'normal',             // Location (normal = main area)
        'high'                // Priority (high = top of section)
    );

    // Add meta box for video details (URL, source, duration)
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

    ?>
    <div class="firstshorts-metabox-wrapper">
        <p style="margin-bottom: 20px; color: #666; font-style: italic;">
            <?php _e('Select which buttons to display on the frontend for this video.', 'firstshorts'); ?>
        </p>

        <table class="form-table">
            <tr>
                <th scope="row" style="width: 200px;">
                    <label for="firstshorts_show_view_count">
                        <?php _e('View Count Button', 'firstshorts'); ?>
                    </label>
                </th>
                <td>
                    <input type="checkbox" 
                           id="firstshorts_show_view_count" 
                           name="firstshorts_show_view_count" 
                           value="1" 
                           <?php checked($show_view_count, 1); ?> />
                    <span class="description"><?php _e('Show view count button on video', 'firstshorts'); ?></span>
                </td>
            </tr>

            <tr>
                <th scope="row">
                    <label for="firstshorts_show_likes">
                        <?php _e('Like Button', 'firstshorts'); ?>
                    </label>
                </th>
                <td>
                    <input type="checkbox" 
                           id="firstshorts_show_likes" 
                           name="firstshorts_show_likes" 
                           value="1" 
                           <?php checked($show_likes, 1); ?> />
                    <span class="description"><?php _e('Show like/heart button on video', 'firstshorts'); ?></span>
                </td>
            </tr>

            <tr>
                <th scope="row">
                    <label for="firstshorts_show_save">
                        <?php _e('Save Button', 'firstshorts'); ?>
                    </label>
                </th>
                <td>
                    <input type="checkbox" 
                           id="firstshorts_show_save" 
                           name="firstshorts_show_save" 
                           value="1" 
                           <?php checked($show_save, 1); ?> />
                    <span class="description"><?php _e('Show save/bookmark button on video', 'firstshorts'); ?></span>
                </td>
            </tr>

            <tr>
                <th scope="row">
                    <label for="firstshorts_show_share">
                        <?php _e('Share Button', 'firstshorts'); ?>
                    </label>
                </th>
                <td>
                    <input type="checkbox" 
                           id="firstshorts_show_share" 
                           name="firstshorts_show_share" 
                           value="1" 
                           <?php checked($show_share, 1); ?> />
                    <span class="description"><?php _e('Show share button on video', 'firstshorts'); ?></span>
                </td>
            </tr>

            <tr>
                <th scope="row">
                    <label for="firstshorts_show_buy_button">
                        <?php _e('Buy Now / Add to Cart Button', 'firstshorts'); ?>
                    </label>
                </th>
                <td>
                    <input type="checkbox" 
                           id="firstshorts_show_buy_button" 
                           name="firstshorts_show_buy_button" 
                           value="1" 
                           <?php checked($show_buy_button, 1); ?> />
                    <span class="description"><?php _e('Show buy now / add to cart button on video', 'firstshorts'); ?></span>
                </td>
            </tr>
        </table>
    </div>

    <style>
        .firstshorts-metabox-wrapper .form-table td {
            padding: 12px 0;
        }
        .firstshorts-metabox-wrapper input[type="checkbox"] {
            margin-right: 8px;
            cursor: pointer;
        }
        .firstshorts-metabox-wrapper .description {
            display: inline-block;
            color: #666;
            margin-left: 5px;
        }
    </style>
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
    <table class="form-table">
        <tr>
            <th scope="row" style="width: 200px;">
                <label for="firstshorts_video_url">
                    <?php _e('Video URL', 'firstshorts'); ?>
                </label>
            </th>
            <td>
                <input type="url" 
                       id="firstshorts_video_url" 
                       name="firstshorts_video_url" 
                       value="<?php echo esc_url($video_url); ?>"
                       placeholder="https://example.com/video.mp4"
                       style="width: 100%; max-width: 400px;" />
                <p class="description"><?php _e('Enter the URL of the video (YouTube, Vimeo, or self-hosted)', 'firstshorts'); ?></p>
            </td>
        </tr>

        <tr>
            <th scope="row">
                <label for="firstshorts_video_source">
                    <?php _e('Video Source', 'firstshorts'); ?>
                </label>
            </th>
            <td>
                <select id="firstshorts_video_source" 
                        name="firstshorts_video_source"
                        style="width: 100%; max-width: 400px;">
                    <option value="self-hosted" <?php selected($video_source, 'self-hosted'); ?>>
                        <?php _e('Self-Hosted', 'firstshorts'); ?>
                    </option>
                </select>
                <p class="description"><?php _e('Videos are self-hosted on your server', 'firstshorts'); ?></p>
            </td>
        </tr>

        <tr>
            <th scope="row">
                <label for="firstshorts_video_duration">
                    <?php _e('Duration (seconds)', 'firstshorts'); ?>
                </label>
            </th>
            <td>
                <input type="number" 
                       id="firstshorts_video_duration" 
                       name="firstshorts_video_duration" 
                       value="<?php echo esc_attr($video_duration); ?>"
                       placeholder="300"
                       min="0"
                       style="width: 100%; max-width: 200px;" />
                <p class="description"><?php _e('Duration of the video in seconds', 'firstshorts'); ?></p>
            </td>
        </tr>
    </table>
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
add_action('save_post_firstshorts_video', 'firstshorts_save_video_meta');

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
