<?php
if (!defined('ABSPATH')) {
	exit;
}

function firstshorts_register_post_type() {
	$labels = array(
		'name'                  => 'FirstShorts',
		'singular_name'         => 'FirstShort',
		'menu_name'             => 'FirstShorts',
		'name_admin_bar'        => 'FirstShort',
		'add_new'               => 'Add New Short',
		'add_new_item'          => 'Add New Short',
		'new_item'              => 'New Short',
		'edit_item'             => 'Edit Short',
		'view_item'             => 'View Short',
		'all_items'             => 'All Shorts',
		'search_items'          => 'Search Shorts',
		'not_found'             => 'No Shorts found.',
		'not_found_in_trash'    => 'No Shorts found in Trash.',
	);

	$args = array(
		'labels'             => $labels,
		'public'             => true,
		'show_ui'            => true,
		'show_in_menu'       => true,
		'menu_position'      => 25,
		'menu_icon'          => 'dashicons-format-video',
		'supports'           => array('title', 'editor', 'thumbnail', 'custom-fields'),
		'has_archive'        => true,
		'rewrite'            => array('slug' => 'shorts'),
		'show_in_rest'       => true,
	);

	register_post_type('firstshort', $args);
}

add_action('init', 'firstshorts_register_post_type');

function firstshorts_activate() {
	firstshorts_register_post_type();
	flush_rewrite_rules();
}

function firstshorts_deactivate() {
	flush_rewrite_rules();
}
