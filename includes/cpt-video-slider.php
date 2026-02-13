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

