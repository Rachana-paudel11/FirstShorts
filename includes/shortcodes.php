<?php
/**
 * Shortcodes: FirstShorts Video
 * Creates frontend shortcodes to display videos
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Shortcode: [firstshorts_video id="123"]
 * Displays a single video with buttons based on admin settings
 * 
 * Usage:
 * [firstshorts_video id="123"]
 * [firstshorts_video id="123" autoplay="true"]
 */
function firstshorts_video_shortcode($atts) {
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

    // Enqueue assets
    wp_enqueue_style('firstshorts-frontend', plugin_dir_url(__FILE__) . '../assets/css/video-slider.css');
    wp_enqueue_script('firstshorts-frontend', plugin_dir_url(__FILE__) . '../assets/js/video-slider.js', array('jquery'), '1.0.0', true);

    $autoplay = filter_var($atts['autoplay'], FILTER_VALIDATE_BOOLEAN);

    ob_start();
    ?>
    <div class="firstshorts-video-container">
        <!-- Video Player -->
        <div class="firstshorts-video-player-wrapper">
            <video 
                class="firstshorts-video-player"
                width="100%"
                <?php echo $autoplay ? 'autoplay' : ''; ?>
                controls
                poster="<?php echo esc_url($thumbnail_url); ?>"
                style="background-color: #000; border-radius: 8px;">
                <source src="<?php echo esc_url($video_details['url']); ?>" type="video/mp4">
            </video>
        </div>

        <!-- Video Info -->
        <div class="firstshorts-video-info">
            <h2 class="firstshorts-video-title"><?php echo esc_html($video_post->post_title); ?></h2>
            
            <?php if (!empty($video_post->post_content)): ?>
                <div class="firstshorts-video-description">
                    <?php echo wp_kses_post($video_post->post_content); ?>
                </div>
            <?php endif; ?>

            <!-- Video Controls - Buttons -->
            <div class="firstshorts-video-controls">
                
                <?php if ($display_options['view_count']): ?>
                    <button class="firstshorts-btn firstshorts-btn-view-count" title="<?php _e('View Count', 'firstshorts'); ?>">
                        👁️ <span>0</span>
                    </button>
                <?php endif; ?>

                <?php if ($display_options['likes']): ?>
                    <button class="firstshorts-btn firstshorts-btn-like" title="<?php _e('Like', 'firstshorts'); ?>">
                        ❤️ <span>0</span>
                    </button>
                <?php endif; ?>

                <?php if ($display_options['save']): ?>
                    <button class="firstshorts-btn firstshorts-btn-save" title="<?php _e('Save', 'firstshorts'); ?>">
                        📌 <?php _e('Save', 'firstshorts'); ?>
                    </button>
                <?php endif; ?>

                <?php if ($display_options['share']): ?>
                    <button class="firstshorts-btn firstshorts-btn-share" title="<?php _e('Share', 'firstshorts'); ?>">
                        🔗 <?php _e('Share', 'firstshorts'); ?>
                    </button>
                <?php endif; ?>

                <?php if ($display_options['buy_button']): ?>
                    <button class="firstshorts-btn firstshorts-btn-buy" title="<?php _e('Buy Now', 'firstshorts'); ?>">
                        🛒 <?php _e('Add to Cart', 'firstshorts'); ?>
                    </button>
                <?php endif; ?>

            </div>
        </div>
    </div>
    <?php
    return ob_get_clean();
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

    // Enqueue assets
    wp_enqueue_style('firstshorts-slider', plugin_dir_url(__FILE__) . '../assets/css/video-slider.css');
    wp_enqueue_script('firstshorts-slider', plugin_dir_url(__FILE__) . '../assets/js/video-slider.js', array('jquery'), '1.0.0', true);

    ob_start();
    ?>
    <div class="firstshorts-slider-container">
        <div class="firstshorts-slider-wrapper">
            <div class="firstshorts-slider">
                
                <?php while ($videos->have_posts()): $videos->the_post(); ?>
                    <div class="firstshorts-slide">
                        <div class="firstshorts-slide-thumbnail">
                            <img src="<?php echo esc_url(get_the_post_thumbnail_url(get_the_ID(), 'large')); ?>" 
                                 alt="<?php echo esc_attr(get_the_title()); ?>"
                                 class="firstshorts-slide-image">
                            <div class="firstshorts-play-overlay">
                                <button class="firstshorts-play-btn">▶</button>
                            </div>
                        </div>
                        <div class="firstshorts-slide-info">
                            <h3><?php the_title(); ?></h3>
                            <p><?php echo wp_trim_words(get_the_excerpt(), 15); ?></p>
                        </div>
                    </div>
                <?php endwhile;
                wp_reset_postdata(); ?>

            </div>
        </div>

        <!-- Navigation -->
        <button class="firstshorts-slider-prev">❮</button>
        <button class="firstshorts-slider-next">❯</button>

        <!-- Dots -->
        <div class="firstshorts-slider-dots">
            <?php for ($i = 0; $i < $videos->post_count; $i++): ?>
                <button class="firstshorts-dot <?php echo $i === 0 ? 'active' : ''; ?>" data-slide="<?php echo $i; ?>"></button>
            <?php endfor; ?>
        </div>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode('firstshorts_video_slider', 'firstshorts_video_slider_shortcode');
