<?php
/**
 * Admin Settings and Plugin Activation/Deactivation
 */

if (!defined('ABSPATH')) {
	exit;
}

/**
 * Plugin Activation Hook
 */
function firstshorts_activate() {
	// Register CPT before flushing
	firstshorts_register_video_cpt();
	flush_rewrite_rules();
}

/**
 * Plugin Deactivation Hook
 */
function firstshorts_deactivate() {
	flush_rewrite_rules();
}
