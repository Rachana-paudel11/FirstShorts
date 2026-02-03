<?php
/*
 * Plugin Name:       FirstShorts 
 * Plugin URI:        https://example.com/plugins/the-basics/
 * Description:       plugin to add videos for woo commerce
 * Version:           1.0.0
 * Requires at least: 5.2
 * Requires PHP:      7.2
 * Author:            Rachana Paudel
 * Author URI:        https://author.example.com/
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 */

if (!defined('ABSPATH')) {
    exit;
}

// Include plugin files
require_once __DIR__ . '/includes/cpt-video-slider.php';
require_once __DIR__ . '/includes/meta-boxes.php';
require_once __DIR__ . '/includes/shortcodes.php';
require_once __DIR__ . '/includes/admin-settings.php';

// Register Custom Post Type
add_action('init', 'firstshorts_register_video_cpt');

register_activation_hook(__FILE__, 'firstshorts_activate');
register_deactivation_hook(__FILE__, 'firstshorts_deactivate');
