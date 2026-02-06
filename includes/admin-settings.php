<?php
if (!defined('ABSPATH')) {
	exit;
}

function firstshorts_activate() {
	if (function_exists('firstshorts_register_video_cpt')) {
		firstshorts_register_video_cpt();
	}
	flush_rewrite_rules();
}

function firstshorts_deactivate() {
	flush_rewrite_rules();
}
