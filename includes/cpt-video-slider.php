<?php
/**
 * Custom Post Type: FirstShorts Video
 * Registers unified video CPT for managing all video content
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register FirstShorts Video Custom Post Type
 */
function firstshorts_register_video_cpt() {
    $labels = array(
        'name'                  => _x('FirstShorts Videos', 'Post Type General Name', 'firstshorts'),
        'singular_name'         => _x('FirstShorts Video', 'Post Type Singular Name', 'firstshorts'),
        'menu_name'             => __('FirstShorts', 'firstshorts'),
        'name_admin_bar'        => __('FirstShort Video', 'firstshorts'),
        'archives'              => __('Video Archives', 'firstshorts'),
        'attributes'            => __('Video Attributes', 'firstshorts'),
        'parent_item_colon'     => __('Parent Video:', 'firstshorts'),
        'all_items'             => __('All Videos', 'firstshorts'),
        'add_new_item'          => __('Add New Video', 'firstshorts'),
        'add_new'               => __('Add New', 'firstshorts'),
        'new_item'              => __('New Video', 'firstshorts'),
        'edit_item'             => __('Edit Video', 'firstshorts'),
        'update_item'           => __('Update Video', 'firstshorts'),
        'view_item'             => __('View Video', 'firstshorts'),
        'view_items'            => __('View Videos', 'firstshorts'),
        'search_items'          => __('Search Videos', 'firstshorts'),
        'not_found'             => __('No videos found', 'firstshorts'),
        'not_found_in_trash'    => __('No videos found in Trash', 'firstshorts'),
        'featured_image'        => __('Video Thumbnail', 'firstshorts'),
        'set_featured_image'    => __('Set video thumbnail', 'firstshorts'),
        'remove_featured_image' => __('Remove video thumbnail', 'firstshorts'),
        'use_featured_image'    => __('Use as video thumbnail', 'firstshorts'),
        'insert_into_item'      => __('Insert into video', 'firstshorts'),
        'uploaded_to_this_item' => __('Uploaded to this video', 'firstshorts'),
        'items_list'            => __('Videos list', 'firstshorts'),
        'items_list_navigation' => __('Videos list navigation', 'firstshorts'),
        'filter_items_list'     => __('Filter videos list', 'firstshorts'),
    );

    $args = array(
        'label'                 => __('FirstShorts Video', 'firstshorts'),
        'description'           => __('Video content for WooCommerce products and sliders', 'firstshorts'),
        'labels'                => $labels,
        'supports'              => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
        'taxonomies'            => array(), // Can add 'category', 'post_tag' if needed
        'hierarchical'          => false,
        'public'                => true,
        'show_ui'               => true,
        'show_in_menu'          => true,
        'menu_position'         => 25,
        'menu_icon'             => 'dashicons-format-video',
        'show_in_admin_bar'     => true,
        'show_in_nav_menus'     => true,
        'can_export'            => true,
        'has_archive'           => true,
        'exclude_from_search'   => false,
        'publicly_queryable'    => true,
        'capability_type'       => 'post',
        'show_in_rest'          => true, // Enable REST API support
        'rest_base'             => 'firstshorts-videos',
        'rest_controller_class' => 'WP_REST_Posts_Controller',
        'rewrite'               => array('slug' => 'firstshorts-video'),
    );

    register_post_type('firstshorts_video', $args);
}
