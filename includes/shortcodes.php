<?php
/**
 * Shortcodes: FirstShorts Video
 * Creates frontend shortcodes to display videos
 */

if (!defined('ABSPATH')) {
    exit;
}

function firstshorts_mark_no_cache() {
    if (!defined('DONOTCACHEPAGE')) {
        define('DONOTCACHEPAGE', true);
    }

    if (function_exists('nocache_headers') && !headers_sent()) {
        nocache_headers();
    }
}

function firstshorts_maybe_disable_cache_on_shortcodes() {
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

        if (has_shortcode($post->post_content, 'firstshorts_video') ||
            has_shortcode($post->post_content, 'firstshorts_video_slider')) {
            firstshorts_mark_no_cache();
            return;
        }
    }
}
add_action('template_redirect', 'firstshorts_maybe_disable_cache_on_shortcodes');

/**
 * Shortcode: [firstshorts_video id="123"]
 * Displays a single video with buttons based on admin settings
 * 
 * Usage:
 * [firstshorts_video id="123"]
 * [firstshorts_video id="123" autoplay="true"]
 */
function firstshorts_video_shortcode($atts) {
    firstshorts_mark_no_cache();

    // Extract shortcode attributes
    $atts = shortcode_atts(array(
        'id'       => 0,
        'autoplay' => 'false',
    ), $atts);

    $video_id = intval($atts['id']);

    // Check if video exists
    $video_post = get_post($video_id);
    if (!$video_post || $video_post->post_type !== 'firstshorts_video') {
        return '<p>' . __('Video not found.', 'firstshorts') . '</p>';
    }

    // Get video data
    $video_details = firstshorts_get_video_details($video_id);
    $display_options = firstshorts_get_display_options($video_id);
    $thumbnail_url = get_the_post_thumbnail_url($video_id, 'large');

    if (empty($video_details['url'])) {
        return '<p>' . __('Video URL not configured.', 'firstshorts') . '</p>';
    }

    // Enqueue React assets
    firstshorts_enqueue_react_frontend();

    $autoplay = filter_var($atts['autoplay'], FILTER_VALIDATE_BOOLEAN);
    
    // Prepare props for React component
    $react_props = array(
        'videoId' => $video_id,
        'videoUrl' => $video_details['url'],
        'thumbnailUrl' => $thumbnail_url,
        'title' => $video_post->post_title,
        'description' => apply_filters('the_content', $video_post->post_content),
        'displayOptions' => array(
            'showViewCount' => (bool) $display_options['view_count'],
            'showLikes' => (bool) $display_options['likes'],
            'showSave' => (bool) $display_options['save'],
            'showShare' => (bool) $display_options['share'],
            'showBuyButton' => (bool) $display_options['buy_button'],
            'maxWidth' => (int) $display_options['max_width'],
        ),
        'autoplay' => $autoplay,
    );
    return sprintf(
        '<div class="firstshorts-video-react-root" data-props="%s"></div>',
        esc_attr(wp_json_encode($react_props))
    );
}
add_shortcode('firstshorts_video', 'firstshorts_video_shortcode');

/**
 * Shortcode: [firstshorts_video_slider]
 * Displays multiple videos in slider format
 * 
 * Usage:
 * [firstshorts_video_slider]
 * [firstshorts_video_slider count="10"]
 */
function firstshorts_video_slider_shortcode($atts) {
    firstshorts_mark_no_cache();

    // Extract shortcode attributes
    $atts = shortcode_atts(array(
        'count' => 5,
    ), $atts);

    // Query videos
    $args = array(
        'post_type'      => 'firstshorts_video',
        'posts_per_page' => intval($atts['count']),
        'orderby'        => 'date',
        'order'          => 'DESC',
        'post_status'    => 'publish',
    );

    $videos = new WP_Query($args);

    if (!$videos->have_posts()) {
        return '<p>' . __('No videos found.', 'firstshorts') . '</p>';
    }

    // Enqueue React assets
    firstshorts_enqueue_react_frontend();

    // Build video list for React
    $video_list = array();
    while ($videos->have_posts()):
        $videos->the_post();
        $display_options = firstshorts_get_display_options(get_the_ID());
        $video_list[] = array(
            'id' => get_the_ID(),
            'title' => get_the_title(),
            'excerpt' => wp_trim_words(get_the_excerpt(), 15),
            'thumbnail' => get_the_post_thumbnail_url(get_the_ID(), 'large'),
            'permalink' => get_permalink(),
            'displayOptions' => array(
                'showViewCount' => (bool) $display_options['view_count'],
                'showLikes' => (bool) $display_options['likes'],
                'showSave' => (bool) $display_options['save'],
                'showShare' => (bool) $display_options['share'],
                'showBuyButton' => (bool) $display_options['buy_button'],
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
