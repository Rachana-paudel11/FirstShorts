<?php
/**
 * Custom Post Type: FirstShorts Video
 */

if (!defined('ABSPATH')) {
    exit;
}

function firstshorts_register_video_cpt() {
    $labels = array(
        'name'               => __('FirstShorts Videos', 'firstshorts'),
        'singular_name'      => __('FirstShorts Video', 'firstshorts'),
        'menu_name'          => __('FirstShorts Videos', 'firstshorts'),
        'name_admin_bar'     => __('FirstShorts Video', 'firstshorts'),
        'add_new'            => __('Add New', 'firstshorts'),
        'add_new_item'       => __('Add New Video', 'firstshorts'),
        'new_item'           => __('New Video', 'firstshorts'),
        'edit_item'          => __('Edit Video', 'firstshorts'),
        'view_item'          => __('View Video', 'firstshorts'),
        'all_items'          => __('All Videos', 'firstshorts'),
        'search_items'       => __('Search Videos', 'firstshorts'),
        'not_found'          => __('No videos found.', 'firstshorts'),
        'not_found_in_trash' => __('No videos found in Trash.', 'firstshorts'),
        'featured_image'     => __('Video Thumbnail', 'firstshorts'),
        'set_featured_image' => __('Set video thumbnail', 'firstshorts'),
        'remove_featured_image' => __('Remove video thumbnail', 'firstshorts'),
        'use_featured_image' => __('Use as video thumbnail', 'firstshorts'),
    );

    $args = array(
        'label'               => __('FirstShorts Video', 'firstshorts'),
        'description'         => __('Video content for WooCommerce products and sliders', 'firstshorts'),
        'labels'              => $labels,
        'supports'            => array('title', 'editor', 'thumbnail'),
        'public'              => true,
        'show_ui'             => true,
        'show_in_menu'        => true,
        'menu_position'       => 20,
        'menu_icon'           => 'dashicons-video-alt3',
        'has_archive'         => false,
        'rewrite'             => array('slug' => 'firstshorts-video'),
        'show_in_rest'        => false,
    );

    register_post_type('firstshorts_video', $args);
}
