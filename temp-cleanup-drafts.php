<?php
/**
 * One-time cleanup script to delete all 'firstshorts_video' drafts.
 * This script should be run via WP-CLI or by including it temporarily in functions.php.
 */

// Load WordPress if run standalone (change path as needed)
define('WP_USE_THEMES', false);
if (file_exists('../../../wp-load.php')) {
    require_once('../../../wp-load.php');
} else {
    // If we can't find wp-load, we'll assume we're being included
}

if (!defined('ABSPATH')) {
    exit('WordPress environment not found.');
}

function firstshorts_delete_all_drafts()
{
    $args = array(
        'post_type' => 'firstshorts_video',
        'post_status' => 'draft',
        'numberposts' => -1,
    );

    $drafts = get_posts($args);

    if (empty($drafts)) {
        return "No drafts found to delete.";
    }

    $count = 0;
    foreach ($drafts as $draft) {
        // Move to trash instead of permanent delete for safety
        if (wp_trash_post($draft->ID)) {
            $count++;
        }
    }

    return "Successfully moved $count drafts to the trash.";
}

// Execute and output result
echo firstshorts_delete_all_drafts();
