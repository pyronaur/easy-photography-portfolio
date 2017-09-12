<?php
/**
 * 3rd party plugins & themes compatibility.
 * Load files individually.
 *
 * @since   1.1.2
 * @updated 1.2.3
 */

/**
 * Add WPML Compatiblity
 */
require_once __DIR__ . '/wpml.php';

/**
 * Add some defaults for themes that don't natively support Easy Photography Portfolio
 */
require_once __DIR__ . '/unsupported-theme-defaults.php';
