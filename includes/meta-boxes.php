<?php
add_action('wp_ajax_firstshorts_get_video_details', 'firstshorts_ajax_get_video_details');

function firstshorts_ajax_get_video_details()
{
    // 1. Security: Check permissions AND verify a nonce
    // We expect 'nonce' to be passed in the request, generated with action 'firstshorts_video_nonce'
    if (!isset($_REQUEST['nonce']) || !wp_verify_nonce($_REQUEST['nonce'], 'firstshorts_video_nonce')) {
        // If nonce is missing or invalid, we deny. 
        // Note: Existing JS must provide this nonce for this to work.
        wp_send_json_error(['message' => 'Invalid nonce'], 403);
    }

    if (!current_user_can('edit_posts')) {
        wp_send_json_error(['message' => 'Unauthorized'], 403);
    }

    // 2. Validate Input
    $id = isset($_POST['id']) ? absint($_POST['id']) : 0;
    if (!$id) {
        wp_send_json_error(['message' => 'Invalid ID'], 400);
    }

    $post = get_post($id);
    // Fix: Allow details for 'attachment' (Media Library) OR 'firstshorts_video'
    if (!$post || ($post->post_type !== 'firstshorts_video' && $post->post_type !== 'attachment')) {
        wp_send_json_error(['message' => 'Video/Attachment not found'], 404);
    }

    // 3. Fetch Data
    $label = get_the_title($id);
    $filename = '';
    $icon = '';
    $url = '';
    $bytes = 0;
    $sizeLabel = '0 B';

    // Handle Attachment (Media Library Item)
    if ($post->post_type === 'attachment') {
        $file_path = get_attached_file($id);
        $filename = basename($file_path);
        // Use WordPress native function for mime type icon
        $icon = wp_mime_type_icon($id);
        $url = wp_get_attachment_url($id);

        if ($file_path && file_exists($file_path)) {
            $bytes = filesize($file_path);
            $sizeLabel = size_format($bytes, 2);
        }
    }
    // Handle Custom Post Type
    else {
        // Try to retrieve manually saved meta (if any exists in future)
        $filename = get_post_meta($id, '_firstshorts_video_filename', true);
        $icon = get_post_meta($id, '_firstshorts_video_icon', true);
        $attachment_id = get_post_meta($id, '_firstshorts_video_attachment_id', true);

        if ($attachment_id) {
            $file_path = get_attached_file($attachment_id);
            $url = wp_get_attachment_url($attachment_id);
            if ($file_path && file_exists($file_path)) {
                $bytes = filesize($file_path);
                $sizeLabel = size_format($bytes, 2);
            }
        }
    }

    // 4. Return Response
    wp_send_json_success([
        'id' => $id,
        'label' => $label,
        'filename' => $filename,
        'url' => $url,
        'icon' => $icon,
        'typeLabel' => 'VIDEO',
        'bytes' => $bytes,
        'sizeLabel' => $sizeLabel,
    ]);
}

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
function firstshorts_register_meta_boxes()
{
    // Display Options and Video Details meta boxes in main area
    add_meta_box(
        'firstshorts_video_display_options',
        __('Display & Actions', 'firstshorts'),
        'firstshorts_render_display_options_metabox',
        'firstshorts_video',
        'normal',
        'high'
    );

    add_meta_box(
        'firstshorts_video_details',
        __('Short Video', 'firstshorts'),
        'firstshorts_render_video_details_metabox',
        'firstshorts_video',
        'normal',
        'high'
    );

    add_meta_box(
        'firstshorts_video_preview',
        __('Live Preview', 'firstshorts'),
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
function firstshorts_shortcode_after_title()
{
    global $post, $post_type;

    if ('firstshorts_video' !== $post_type) {
        return;
    }
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
function firstshorts_disable_block_editor_for_video($use_block_editor, $post_type)
{
    if ($post_type === 'firstshorts_video') {
        return false;
    }

    return $use_block_editor;
}
add_filter('use_block_editor_for_post_type', 'firstshorts_disable_block_editor_for_video', 10, 2);

/**
 * Enqueue admin styles for meta box layout
 */
function firstshorts_enqueue_admin_styles($hook)
{
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

    wp_add_inline_style(
        'firstshorts-admin-style',
        'body.firstshorts-admin #poststuff { transition: opacity 120ms ease; }'
        . 'body.firstshorts-admin-loading #poststuff { opacity: 0; pointer-events: none; }'
    );
}
add_action('admin_enqueue_scripts', 'firstshorts_enqueue_admin_styles');

function firstshorts_admin_body_class($classes)
{
    global $post_type;
    if ($post_type !== 'firstshorts_video') {
        return $classes;
    }

    $classes .= ' firstshorts-admin firstshorts-admin-loading';
    return $classes;
}
add_filter('admin_body_class', 'firstshorts_admin_body_class');

function firstshorts_admin_loading_fallback()
{
    global $post_type;
    if ($post_type !== 'firstshorts_video') {
        return;
    }

    echo '<script>'
        . 'window.addEventListener("load",function(){'
        . 'document.body.classList.remove("firstshorts-admin-loading");'
        . '});'
        . '</script>';
}
add_action('admin_head', 'firstshorts_admin_loading_fallback');


/**
 * Hide default permalink UI for FirstShorts Video
 */
function firstshorts_hide_default_permalink_ui()
{
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
function firstshorts_hide_screen_options_tab()
{
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
function firstshorts_remove_publish_metabox()
{
    remove_meta_box('submitdiv', 'firstshorts_video', 'side');
}
add_action('add_meta_boxes_firstshorts_video', 'firstshorts_remove_publish_metabox', 99);

/**
 * Remove default slug metabox to hide slug UI
 */
function firstshorts_remove_default_slug_metabox()
{
    remove_meta_box('slugdiv', 'firstshorts_video', 'normal');
    remove_meta_box('slugdiv', 'firstshorts_video', 'side');
}
add_action('add_meta_boxes_firstshorts_video', 'firstshorts_remove_default_slug_metabox', 100);

/**
 * Move Featured Image (Short Thumbnail) metabox to main area
 */
function firstshorts_move_thumbnail_metabox()
{
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
function firstshorts_render_display_options_metabox($post)
{
    // Verify nonce for security (prevent unauthorized meta box updates)
    wp_nonce_field('firstshorts_video_nonce', 'firstshorts_video_nonce_field');

    // Retrieve saved checkbox values from post meta
    // get_post_meta returns 1 if checked, 0 if unchecked
    $show_view_count = get_post_meta($post->ID, '_firstshorts_show_view_count', true);
    $show_likes = get_post_meta($post->ID, '_firstshorts_show_likes', true);
    $show_save = get_post_meta($post->ID, '_firstshorts_show_save', true);
    $show_share = get_post_meta($post->ID, '_firstshorts_show_share', true);
    $show_buy_button = get_post_meta($post->ID, '_firstshorts_show_buy_button', true);
    $max_width = get_post_meta($post->ID, '_firstshorts_video_max_width', true);
    $max_height = get_post_meta($post->ID, '_firstshorts_video_max_height', true);
    $cta_text = get_post_meta($post->ID, '_firstshorts_cta_text', true);
    $cta_link = get_post_meta($post->ID, '_firstshorts_cta_link', true);
    $cta_style = get_post_meta($post->ID, '_firstshorts_cta_style', true);
    $product_description = get_post_meta($post->ID, '_firstshorts_product_description', true);
    if (empty($max_width)) {
        $max_width = 500;
    }
    if (empty($max_height)) {
        $max_height = 600;
    }
    if (empty($cta_text)) {
        $cta_text = __('Buy Now', 'firstshorts');
    }
    if (empty($cta_style)) {
        $cta_style = 'primary';
    }

    ?>
        <div class="firstshorts-metabox-content">
            <div class="firstshorts-section">
                <div class="firstshorts-section-title">
                    <?php _e('Viewer Engagement', 'firstshorts'); ?>
                </div>
                <p class="description">
                    <?php _e('Social interactions shown on the video.', 'firstshorts'); ?>
                </p>

                <div class="firstshorts-checkbox-group">
                    <label class="firstshorts-checkbox-row">
                        <input type="checkbox" 
                               id="firstshorts_show_view_count" 
                               name="firstshorts_show_view_count" 
                               value="1" 
                               <?php checked($show_view_count, 1); ?> />
                        <span class="firstshorts-checkbox-label"><?php _e('Show View Count', 'firstshorts'); ?></span>
                    </label>
                
                    <label class="firstshorts-checkbox-row">
                        <input type="checkbox" 
                               id="firstshorts_show_likes" 
                               name="firstshorts_show_likes" 
                               value="1" 
                               <?php checked($show_likes, 1); ?> />
                        <span class="firstshorts-checkbox-label"><?php _e('Enable Likes', 'firstshorts'); ?></span>
                    </label>
                
                    <label class="firstshorts-checkbox-row">
                        <input type="checkbox" 
                               id="firstshorts_show_save" 
                               name="firstshorts_show_save" 
                               value="1" 
                               <?php checked($show_save, 1); ?> />
                        <span class="firstshorts-checkbox-label"><?php _e('Allow Save', 'firstshorts'); ?></span>
                    </label>
                
                    <label class="firstshorts-checkbox-row">
                        <input type="checkbox" 
                               id="firstshorts_show_share" 
                               name="firstshorts_show_share" 
                               value="1" 
                               <?php checked($show_share, 1); ?> />
                        <span class="firstshorts-checkbox-label"><?php _e('Allow Share', 'firstshorts'); ?></span>
                    </label>
                </div>
            </div>

            <div class="firstshorts-section">
                <div class="firstshorts-section-title firstshorts-section-title--accent">
                    <?php _e('Product Action', 'firstshorts'); ?>
                </div>
                <p class="description">
                    <?php _e('Configure the Call to Action (CTA) button to guide viewers to your product page or custom link.', 'firstshorts'); ?>
                </p>
                <div class="firstshorts-checkbox-group">
                    <label class="firstshorts-checkbox-row">
                        <input type="checkbox" 
                               id="firstshorts_show_buy_button" 
                               name="firstshorts_show_buy_button" 
                               value="1" 
                               <?php checked($show_buy_button, 1); ?> />
                        <span class="firstshorts-checkbox-label"><?php _e('Enable Product CTA', 'firstshorts'); ?></span>
                    </label>
                </div>

                <div class="firstshorts-meta-field">
                    <label for="firstshorts_cta_text">
                        <?php _e('CTA Text', 'firstshorts'); ?>
                    </label>
                    <input type="text"
                           id="firstshorts_cta_text"
                           name="firstshorts_cta_text"
                           value="<?php echo esc_attr($cta_text); ?>"
                           placeholder="Buy Now" />
                </div>

                <div class="firstshorts-meta-field">
                    <label for="firstshorts_cta_link">
                        <?php _e('CTA Link', 'firstshorts'); ?>
                    </label>
                    <input type="url"
                           id="firstshorts_cta_link"
                           name="firstshorts_cta_link"
                           value="<?php echo esc_url($cta_link); ?>"
                           placeholder="https://example.com/product" />
                    <p class="description"><?php _e('The URL to redirect users when the CTA button is clicked.', 'firstshorts'); ?></p>
                </div>

                <div class="firstshorts-meta-field">
                    <label for="firstshorts_cta_style">
                        <?php _e('CTA Style', 'firstshorts'); ?>
                    </label>
                    <select id="firstshorts_cta_style" name="firstshorts_cta_style">
                        <option value="primary" <?php selected($cta_style, 'primary'); ?>>
                            <?php _e('Primary', 'firstshorts'); ?>
                        </option>
                        <option value="secondary" <?php selected($cta_style, 'secondary'); ?>>
                            <?php _e('Secondary', 'firstshorts'); ?>
                        </option>
                    </select>
                </div>


            </div>

            <div class="firstshorts-meta-field">
                <label for="firstshorts_video_max_width">
                    <?php _e('Card Width (px)', 'firstshorts'); ?>
                </label>
                <input type="number"
                       id="firstshorts_video_max_width"
                       name="firstshorts_video_max_width"
                       value="<?php echo esc_attr($max_width); ?>"
                       min="200"
                       max="500"
                       step="10"
                       style="width: 200px;" />
                <p class="description"><?php _e('Recommended: 280–360px', 'firstshorts'); ?></p>
            </div>

            <div class="firstshorts-meta-field">
                <label for="firstshorts_video_max_height">
                    <?php _e('Card Height (px)', 'firstshorts'); ?>
                </label>
                <input type="number"
                       id="firstshorts_video_max_height"
                       name="firstshorts_video_max_height"
                       value="<?php echo esc_attr($max_height); ?>"
                       min="300"
                       max="1000"
                       step="10"
                       style="width: 200px;" />
                <p class="description"><?php _e('Recommended: 500–700px', 'firstshorts'); ?></p>
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
function firstshorts_render_video_details_metabox($post)
{
    // Retrieve saved values from database, default to empty string if not found
    $video_url = get_post_meta($post->ID, '_firstshorts_video_url', true);
    $video_duration = get_post_meta($post->ID, '_firstshorts_video_duration', true);
    $bulk_video_ids = get_post_meta($post->ID, '_firstshorts_bulk_video_ids', true);

    ?>
        <div class="firstshorts-metabox-content">
            <div class="firstshorts-video-actions">
                <button type="button"
                        id="firstshorts_bulk_upload_btn"
                        class="button button-secondary firstshorts-upload-btn">
                    <?php _e('Select Multiple Videos', 'firstshorts'); ?>
                </button>
            </div>

            <div class="firstshorts-meta-field firstshorts-video-source-field">
                <label for="firstshorts_video_url">
                    <?php _e('Video URL (optional)', 'firstshorts'); ?>
                </label>
                <input type="url" 
                       id="firstshorts_video_url" 
                       name="firstshorts_video_url" 
                       value="<?php echo esc_url($video_url); ?>"
                       placeholder="https://example.com/video.mp4" />
                <p class="firstshorts-inline-error" style="display: none; color: #b91c1c; margin: 6px 0 0;">
                    <?php _e('Video URL is required.', 'firstshorts'); ?>
                </p>
            </div>

            <div class="firstshorts-meta-field firstshorts-bulk-block">
                <input type="hidden"
                       id="firstshorts_bulk_video_ids"
                       name="firstshorts_bulk_video_ids"
                       value="<?php echo esc_attr($bulk_video_ids); ?>" />
                <input type="hidden"
                       id="firstshorts_bulk_video_data"
                       name="firstshorts_bulk_video_data"
                       value="<?php echo esc_attr(get_post_meta($post->ID, '_firstshorts_bulk_video_data', true)); ?>" />
                <div class="firstshorts-bulk-summary">
                    <div class="firstshorts-bulk-stat">
                        <span class="firstshorts-bulk-label"><?php _e('Selected', 'firstshorts'); ?></span>
                        <span class="firstshorts-bulk-count">0 videos</span>
                    </div>
                </div>
                <div class="firstshorts-bulk-actions">
                    <button type="button" class="button firstshorts-bulk-select-all" disabled>
                        <?php _e('Select all', 'firstshorts'); ?>
                    </button>
                    <button type="button" class="button firstshorts-bulk-remove-selected" disabled>
                        <?php _e('Remove selected', 'firstshorts'); ?>
                    </button>
                    <button type="button" class="button firstshorts-bulk-clear" disabled>
                        <?php _e('Clear list', 'firstshorts'); ?>
                    </button>
                </div>
                <div class="firstshorts-bulk-feedback" aria-live="polite"></div>
                <ul class="firstshorts-bulk-list" aria-label="Selected videos"></ul>
            </div>

            <div class="firstshorts-meta-field firstshorts-duration-field">
                <label for="firstshorts_video_duration">
                    <?php _e('Video Duration', 'firstshorts'); ?>
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
function firstshorts_render_preview_metabox($post)
{
    $max_width = get_post_meta($post->ID, '_firstshorts_video_max_width', true) ?: 500;
    ?>
        <div class="firstshorts-admin-preview-wrapper" style="max-width: <?php echo absint($max_width); ?>px;">
            <div class="firstshorts-preview-body">
                <p class="firstshorts-preview-empty" id="firstshorts-preview-empty">
                    <?php _e('Select a video to see a preview.', 'firstshorts'); ?>
                </p>
            
                <div class="firstshorts-preview-player" id="firstshorts-preview-player" style="display: none;">
                    <!-- Video Container with 9:16 aspect ratio -->
                    <div class="firstshorts-preview-video-container">
                        <video class="firstshorts-preview-video" id="firstshorts-preview-video" preload="metadata"></video>
                    
                        <!-- Overlay buttons will go here -->
                        <div class="firstshorts-preview-overlay" id="firstshorts-preview-overlay">
                            <!-- Buy buttons (top) -->
                            <div class="firstshorts-preview-cta-row" id="firstshorts-preview-cta-row" style="display: none;">
                                <button class="firstshorts-preview-btn firstshorts-preview-btn-cta" type="button">🛍 Buy Now</button>
                                <button class="firstshorts-preview-btn firstshorts-preview-btn-cta firstshorts-preview-btn-cta-secondary" type="button">🛒 Add to Cart</button>
                            </div>
                        
                            <!-- Action buttons (side) -->
                            <div class="firstshorts-preview-actions" id="firstshorts-preview-actions">
                                <!-- Dynamically populated by JS -->
                            </div>
                        </div>
                    </div>
                </div>
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
function firstshorts_render_shortcodes_metabox($post)
{
    $video_id = intval($post->ID);
    // Removed display_type logic (dead code)
    $post_status = get_post_status($post);
    $saved_once = get_post_meta($post->ID, '_firstshorts_saved_once', true);
    // Get selected video IDs for this post
    // Use bulk video IDs for slider shortcode
    $bulk_ids = get_post_meta($post->ID, '_firstshorts_bulk_video_ids', true);
    $ids_array = array_filter(array_map('absint', explode(',', $bulk_ids)));
    $slider_shortcode = '[fs_slider';
    if (!empty($ids_array)) {
        $slider_shortcode .= ' ids="' . esc_attr(implode(',', $ids_array)) . '"';
        $slider_shortcode .= ' post_id="' . $post->ID . '"';
        $slider_shortcode .= ' count="' . count($ids_array) . '"';
    } else {
        $slider_shortcode .= ' count="5"';
    }
    $slider_shortcode .= ']';
    $video_url = get_post_meta($post->ID, '_firstshorts_video_url', true);
    ?>
        <div class="firstshorts-shortcode-box firstshorts-shortcode-decongested">
            <div class="firstshorts-shortcode-grid">
                <div class="firstshorts-shortcode-item" data-shortcode-type="slider">
                    <label class="firstshorts-shortcode-label"><?php _e('Shortcode', 'firstshorts'); ?></label>
                    <div class="firstshorts-shortcode-row">
                        <?php 
                        $is_saved = !empty($saved_once) && $post_status !== 'auto-draft';
                        $display_value = $is_saved ? $slider_shortcode : '';
                        $placeholder = $is_saved ? '' : __('Save Short to generate code', 'firstshorts');
                        ?>
                        <input type="text" class="firstshorts-shortcode-input" readonly 
                               value="<?php echo esc_attr($display_value); ?>" 
                               placeholder="<?php echo esc_attr($placeholder); ?>" />
                        <button type="button" class="button firstshorts-copy-btn" 
                                data-copy="<?php echo esc_attr($display_value); ?>" 
                                <?php disabled(!$is_saved); ?>>
                            <?php _e('Copy', 'firstshorts'); ?>
                        </button>
                    </div>
                </div>
            </div>
        </div>

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
function firstshorts_save_video_meta($post_id)
{
    // Step 1: Verify nonce security token
    // Nonce protects against CSRF (Cross-Site Request Forgery) attacks
    if (
        !isset($_POST['firstshorts_video_nonce_field']) ||
        !wp_verify_nonce($_POST['firstshorts_video_nonce_field'], 'firstshorts_video_nonce')
    ) {
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

    if (isset($_POST['firstshorts_cta_text'])) {
        update_post_meta(
            $post_id,
            '_firstshorts_cta_text',
            sanitize_text_field($_POST['firstshorts_cta_text'])
        );
    }

    if (isset($_POST['firstshorts_cta_link'])) {
        update_post_meta(
            $post_id,
            '_firstshorts_cta_link',
            esc_url_raw($_POST['firstshorts_cta_link'])
        );
    }

    if (isset($_POST['firstshorts_cta_style'])) {
        update_post_meta(
            $post_id,
            '_firstshorts_cta_style',
            sanitize_text_field($_POST['firstshorts_cta_style'])
        );
    }



    // Bulk create videos from media library selection
    // Bulk creation now handled by AJAX, so only store bulk_video_ids here
    if (isset($_POST['firstshorts_bulk_video_ids'])) {
        $raw_ids = sanitize_text_field(wp_unslash($_POST['firstshorts_bulk_video_ids']));
        $ids = array_filter(array_map('absint', explode(',', $raw_ids)));
        if (!empty($ids)) {
            update_post_meta($post_id, '_firstshorts_bulk_video_ids', implode(',', $ids));
        } else {
            delete_post_meta($post_id, '_firstshorts_bulk_video_ids');
        }
    }

    if (isset($_POST['firstshorts_bulk_video_data'])) {
        update_post_meta(
            $post_id,
            '_firstshorts_bulk_video_data',
            wp_unslash($_POST['firstshorts_bulk_video_data']) // JSON string
        );
    }

    // Mark as saved once to enable shortcodes
    update_post_meta($post_id, '_firstshorts_saved_once', '1');

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

    if (isset($_POST['firstshorts_video_max_height'])) {
        $max_height = absint($_POST['firstshorts_video_max_height']);
        if ($max_height < 300) {
            $max_height = 300;
        } elseif ($max_height > 1000) {
            $max_height = 1000;
        }
        update_post_meta(
            $post_id,
            '_firstshorts_video_max_height',
            $max_height
        );
    }

    // Removed display_type save logic (dead code)

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
function firstshorts_enqueue_admin_scripts($hook)
{
    // Check if we're on FirstShorts Video edit page
    global $post_type;
    if ($post_type !== 'firstshorts_video' || !in_array($hook, array('post.php', 'post-new.php'))) {
        return;
    }

    // Enqueue WordPress media library (required for uploads)
    wp_enqueue_media();

    // Enqueue custom admin script
    $admin_js_path = plugin_dir_path(dirname(__FILE__)) . 'assets/js/admin-video-upload.js';
    $admin_js_ver = file_exists($admin_js_path) ? filemtime($admin_js_path) : '1.0.0';
    wp_enqueue_script(
        'firstshorts-admin',
        plugin_dir_url(__FILE__) . '../assets/js/admin-video-upload.js',
        array('jquery'),
        $admin_js_ver,
        true
    );

    // Pass data to JavaScript
    global $post;
    wp_localize_script('firstshorts-admin', 'firstshortsAdmin', array(
        'uploadTitle' => __('Select Video', 'firstshorts'),
        'uploadButton' => __('Use this video', 'firstshorts'),
        'allowedTypes' => array('video/mp4', 'video/webm', 'video/ogg'),
        'nonce' => wp_create_nonce('firstshorts_video_nonce'),
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'postId' => $post->ID,
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
function firstshorts_get_display_options($post_id)
{
    $defaults = array(
        'view_count' => true,
        'likes' => true,
        'save' => true,
        'share' => true,
        'buy_button' => true,
        'cta_text' => 'Buy Now',
        'cta_link' => '',
        'cta_style' => 'primary',
        'max_width' => 500,
        'max_height' => 600,
    );

    $view_count = get_post_meta($post_id, '_firstshorts_show_view_count', true);
    $likes = get_post_meta($post_id, '_firstshorts_show_likes', true);
    $save = get_post_meta($post_id, '_firstshorts_show_save', true);
    $share = get_post_meta($post_id, '_firstshorts_show_share', true);
    $buy_button = get_post_meta($post_id, '_firstshorts_show_buy_button', true);
    $max_width = get_post_meta($post_id, '_firstshorts_video_max_width', true);
    $max_height = get_post_meta($post_id, '_firstshorts_video_max_height', true);

    $cta_text = get_post_meta($post_id, '_firstshorts_cta_text', true);
    $cta_link = get_post_meta($post_id, '_firstshorts_cta_link', true);
    $cta_style = get_post_meta($post_id, '_firstshorts_cta_style', true);

    $view_count = $view_count === '' ? $defaults['view_count'] : (bool) $view_count;
    $likes = $likes === '' ? $defaults['likes'] : (bool) $likes;
    $save = $save === '' ? $defaults['save'] : (bool) $save;
    $share = $share === '' ? $defaults['share'] : (bool) $share;
    $buy_button = $buy_button === '' ? $defaults['buy_button'] : (bool) $buy_button;
    $cta_text = $cta_text === '' ? $defaults['cta_text'] : $cta_text;
    $cta_link = $cta_link === '' ? $defaults['cta_link'] : $cta_link;
    $cta_style = $cta_style === '' ? $defaults['cta_style'] : $cta_style;
    $product_description = get_post_meta($post_id, '_firstshorts_product_description', true);
    $max_width = $max_width === '' ? $defaults['max_width'] : (int) $max_width;
    $max_height = $max_height === '' ? $defaults['max_height'] : (int) $max_height;

    // Query database for each button setting and convert to boolean
    return array(
        'view_count' => $view_count,
        'likes' => $likes,
        'save' => $save,
        'share' => $share,
        'buy_button' => $buy_button,
        'cta_text' => $cta_text,
        'cta_link' => $cta_link,
        'cta_style' => $cta_style,
        'product_description' => $product_description,
        'max_width' => $max_width,
        'max_height' => $max_height,
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
function firstshorts_get_video_details($post_id)
{
    // Retrieve video metadata from database
    return array(
        'url' => get_post_meta($post_id, '_firstshorts_video_url', true),        // Full URL to video file
        'duration' => get_post_meta($post_id, '_firstshorts_video_duration', true), // Duration in seconds
    );
}

/**
 * Add custom columns to the Shorts list view
 */
function firstshorts_video_columns($columns)
{
    $new_columns = array();
    $new_columns['cb'] = $columns['cb'];
    $new_columns['title'] = $columns['title'];
    $new_columns['shortcode'] = __('Shortcode', 'firstshorts');
    $new_columns['date'] = $columns['date'];
    return $new_columns;
}
add_filter('manage_firstshorts_video_posts_columns', 'firstshorts_video_columns');

/**
 * Handle custom column content
 */
function firstshorts_video_custom_column_content($column, $post_id)
{
    if ($column === 'shortcode') {
        // Get video IDs saved for this short
        $video_ids = get_post_meta($post_id, '_firstshorts_bulk_video_ids', true);
        $shortcode = '[firstshorts_video_slider';

        if ($video_ids) {
            $shortcode .= ' ids="' . esc_attr($video_ids) . '"';
        }
        $shortcode .= ' post_id="' . $post_id . '" count="5"]';

        echo '<code>' . esc_html($shortcode) . '</code>';
    }
}
add_action('manage_firstshorts_video_posts_custom_column', 'firstshorts_video_custom_column_content', 10, 2);

