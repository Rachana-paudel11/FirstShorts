<?php
/**
 * Shortcodes: FirstShorts Video
 * Creates frontend shortcodes to display videos
 */

if (!defined('ABSPATH')) {
    exit;
}

function firstshorts_mark_no_cache()
{
    if (!defined('DONOTCACHEPAGE')) {
        define('DONOTCACHEPAGE', true);
    }

    if (function_exists('nocache_headers') && !headers_sent()) {
        nocache_headers();
    }
}

function firstshorts_maybe_disable_cache_on_shortcodes()
{
    if (is_admin()) {
        return;
    }

    global $wp_query;
    if (empty($wp_query) || empty($wp_query->posts)) {
        return;
    }

    foreach ($wp_query->posts as $post) {
        if (!$post || empty($post->post_content)) {
            continue;
        }

        if (
            has_shortcode($post->post_content, 'firstshorts_video') ||
            has_shortcode($post->post_content, 'firstshorts_video_slider')
        ) {
            firstshorts_mark_no_cache();
            return;
        }
    }
}
add_action('template_redirect', 'firstshorts_maybe_disable_cache_on_shortcodes');


/**
 * Shortcode: [firstshorts_video_slider]
 * Displays multiple videos in slider format
 * 
 * Usage:
 * [firstshorts_video_slider]
 * [firstshorts_video_slider count="10"]
 */
function firstshorts_video_slider_shortcode($atts)
{
    firstshorts_mark_no_cache();

    // Extract shortcode attributes
    $atts = shortcode_atts(array(
        'count' => 5,
        'ids' => '',
        'post_id' => 0,
    ), $atts);

    // Query videos
    $args = array(
        'post_type' => 'attachment', // Fix: Query attachments directly
        'post_status' => 'inherit',    // Attachments have 'inherit' status
        'post_mime_type' => 'video',      // Ensure we only get videos
        'posts_per_page' => intval($atts['count']),
        'orderby' => 'date',
        'order' => 'DESC',
    );

    // If specific IDs are provided, prioritize them
    if (!empty($atts['ids'])) {
        $ids_array = array_map('absint', explode(',', $atts['ids']));
        if (!empty($ids_array)) {
            $args['post__in'] = $ids_array;
            $args['orderby'] = 'post__in'; // Preserve order
            // Ensure we get all selected videos regardless of count limit if specified
            $args['posts_per_page'] = -1;
        }
    }

    $videos = new WP_Query($args);

    if (!$videos->have_posts()) {
        return '<p>' . __('No videos found.', 'firstshorts') . '</p>';
    }

    // Enqueue React assets
    firstshorts_enqueue_react_frontend();

    // Build video list for React
    $video_list = array();
    $global_post_id = !empty($atts['post_id']) ? intval($atts['post_id']) : 0;

    // Fetch global options once if post_id is provided
    $global_options = $global_post_id ? firstshorts_get_display_options($global_post_id) : null;

    while ($videos->have_posts()):
        $videos->the_post();
        $current_video_id = get_the_ID();

        // Use global options or fallback to current video's options
        $display_options = $global_options ? $global_options : firstshorts_get_display_options($current_video_id);

        $video_list[] = array(
            'id' => $current_video_id,
            'title' => get_the_title(),
            'excerpt' => wp_trim_words(get_the_excerpt(), 15),
            'thumbnail' => get_the_post_thumbnail_url($current_video_id, 'large'),
            'videoUrl' => wp_get_attachment_url($current_video_id),
            'permalink' => get_permalink(),
            'displayOptions' => array(
                'showViewCount' => (bool) $display_options['view_count'],
                'showLikes' => (bool) $display_options['likes'],
                'showSave' => (bool) $display_options['save'],
                'showShare' => (bool) $display_options['share'],
                'showBuyButton' => (bool) $display_options['buy_button'],
                'ctaText' => $display_options['cta_text'],
                'ctaStyle' => $display_options['cta_style'],
                'maxWidth' => (int) $display_options['max_width'],
                'maxHeight' => (int) $display_options['max_height'],
            ),
        );
    endwhile;
    wp_reset_postdata();

    $react_props = array(
        'videos' => $video_list,
        'count' => intval($atts['count']),
    );

    return sprintf(
        '<div class="firstshorts-slider-react-root" data-props="%s"></div>',
        esc_attr(wp_json_encode($react_props))
    );
}
add_shortcode('firstshorts_video_slider', 'firstshorts_video_slider_shortcode');
