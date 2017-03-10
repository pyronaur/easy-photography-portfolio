<?php
/**
 * 3rd party plugins & themes compatibility.
 * Load files individually.
 *
 * @since 1.1.2
 */

/**
 * This file should work without errors on PHP 5.2.17
 * Use this instead of __DIR__
 */
$__DIR = dirname( __FILE__ );

require_once $__DIR . '/wpml.php';