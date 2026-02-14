<?php
/**
 * Custom Post Type: FirstShorts Video
 */

if (!defined('ABSPATH')) {
    exit;
}

function firstshorts_register_video_cpt()
{
    $labels = array(
        'name' => __('FirstShorts', 'firstshorts'),
        'singular_name' => __('FirstShorts', 'firstshorts'),
        'menu_name' => __('FirstShorts', 'firstshorts'),
        'name_admin_bar' => __('FirstShorts', 'firstshorts'),
        'add_new' => __('Add New', 'firstshorts'),
        'add_new_item' => __('Add New Short', 'firstshorts'),
        'new_item' => __('New Short', 'firstshorts'),
        'edit_item' => __('Edit Short', 'firstshorts'),
        'view_item' => __('View Short', 'firstshorts'),
        'all_items' => __('All Shorts', 'firstshorts'),
        'search_items' => __('Search Shorts', 'firstshorts'),
        'not_found' => __('No shorts found.', 'firstshorts'),
        'not_found_in_trash' => __('No shorts found in Trash.', 'firstshorts'),
        'featured_image' => __('Short Thumbnail', 'firstshorts'),
        'set_featured_image' => __('Set short thumbnail', 'firstshorts'),
        'remove_featured_image' => __('Remove short thumbnail', 'firstshorts'),
        'use_featured_image' => __('Use as short thumbnail', 'firstshorts'),
    );

    $args = array(
        'label' => __('FirstShorts', 'firstshorts'),
        'description' => __('Short video content for WooCommerce products and sliders', 'firstshorts'),
        'labels' => $labels,
        'supports' => array('title', 'thumbnail'),
        'public' => true,
        'show_ui' => true,
        'show_in_menu' => true,
        'menu_position' => 20,
        'menu_icon' => 'dashicons-video-alt3',
        'has_archive' => false,
        'rewrite' => array('slug' => 'firstshorts-video'),
        'show_in_rest' => false,
    );

    register_post_type('firstshorts_video', $args);
}

/**
 * Add shortcode column to FirstShorts list
 */
add_filter('manage_firstshorts_video_posts_columns', 'firstshorts_add_custom_columns');
function firstshorts_add_custom_columns($columns)
{
    $new_columns = array();
    foreach ($columns as $key => $value) {
        if ($key === 'title') {
            $new_columns[$key] = $value;
            $new_columns['shortcode'] = __('Shortcode', 'firstshorts');
        } else {
            $new_columns[$key] = $value;
        }
    }
    return $new_columns;
}

/**
 * Populate shortcode column
 */
add_action('manage_firstshorts_video_posts_custom_column', 'firstshorts_fill_custom_columns', 10, 2);
function firstshorts_fill_custom_columns($column, $post_id)
{
    if ($column === 'shortcode') {
        $shortcode = '[fs_slider post_id="' . intval($post_id) . '"]';
        echo '<code style="background:#f0f0f1; padding:3px 6px; border-radius:4px; font-size:11px; border:1px solid #dcdcde;">' . esc_html($shortcode) . '</code>';
        echo '<button type="button" class="button button-small firstshorts-copy-btn" data-copy="' . esc_attr($shortcode) . '" style="margin-left:8px; height:24px; line-height:22px; padding:0 8px; font-size:11px; vertical-align:middle;">' . __('Copy', 'firstshorts') . '</button>';
    }
}

/**
 * Remove "Add Media" button from the FirstShorts editor screen
 */
add_action('admin_head', 'firstshorts_remove_add_media_button');
function firstshorts_remove_add_media_button()
{
    $screen = get_current_screen();
    if ($screen && $screen->post_type === 'firstshorts_video') {
        remove_action('media_buttons', 'media_buttons');
    }
}

