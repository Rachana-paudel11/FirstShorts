<?php
/**
 * React Integration: Enqueue React bundles for frontend
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Enqueue React bundle for frontend
 */
function firstshorts_enqueue_react_frontend() {
    $dist_path = plugin_dir_path(dirname(__FILE__)) . 'assets/dist/';
    $dist_url = plugin_dir_url(dirname(__FILE__)) . 'assets/dist/';
    
    // Check if React build exists
    if (file_exists($dist_path . 'firstshorts-react.js')) {
        wp_enqueue_script(
            'firstshorts-react',
            $dist_url . 'firstshorts-react.js',
            array(),
            '1.0.0',
            true
        );
        
        // Enqueue React CSS if exists (Vite outputs hashed CSS under assets/)
        $css_files = glob($dist_path . 'assets/*.css');
        if (!empty($css_files)) {
            $css_file = basename($css_files[0]);
            wp_enqueue_style(
                'firstshorts-react',
                $dist_url . 'assets/' . $css_file,
                array(),
                '1.0.0'
            );
        }
    }
}
