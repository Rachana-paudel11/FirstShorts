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
    $js_file = $dist_path . 'firstshorts-react.js';
    if (file_exists($js_file)) {
        $js_ver = (string) filemtime($js_file);
        wp_enqueue_script(
            'firstshorts-react',
            $dist_url . 'firstshorts-react.js',
            array(),
            $js_ver,
            true
        );

        wp_add_inline_script(
            'firstshorts-react',
            "window.addEventListener('pageshow',function(event){if(event.persisted){window.location.reload();}});",
            'after'
        );
        
        // Enqueue React CSS if exists (Vite outputs hashed CSS under assets/)
        $css_files = glob($dist_path . 'assets/*.css');
        if (!empty($css_files)) {
            $css_file = basename($css_files[0]);
            $css_ver = (string) filemtime($dist_path . 'assets/' . $css_file);
            wp_enqueue_style(
                'firstshorts-react',
                $dist_url . 'assets/' . $css_file,
                array(),
                $css_ver
            );
        }
    }
}
