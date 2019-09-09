<?php

use Photography_Portfolio\Core\Gallery_Attachment_Video_Support;
use Photography_Portfolio\Frontend\Layout\View;

/**
 * Easy access to our god-class
 *
 * @return \Easy_Photography_Portfolio
 */
function phort_instance() {

	return Easy_Photography_Portfolio::instance();
}


/**
 * Checks if the current query is a portfolio query
 *
 * @return bool
 */
function phort_is_portfolio() {

	return phort_instance()->query->is_portfolio();
}


function phort_load_view() {

	View::load();
}


function phort_get_home_page() {

	return (int) phort_get_option( 'portfolio_page' );
}


/**
 * Check for theme support
 *
 * @return mixed
 */
function phort_has_theme_support() {

	return (

		/**
		 * @deprecated: `photography-portfolio-plugin`
		 * Use `easy-photography-portfolio` instead
		 */
		get_theme_support( 'photography-portfolio-plugin' )
		||
		get_theme_support( 'easy-photography-portfolio' )

	);
}


/**
 * Detect whether current page is the portfolio front page AND the WordPress home page
 *
 * @return bool
 */
function phort_is_front_page() {

	return phort_instance()->query->is_portfolio_front_page();
}


/**
 * Detect whether current layout is an archive layout
 *
 * @return bool
 */
function phort_is_archive() {

	return (
		phort_instance()->query->is_archive() || phort_instance()->query->is_category()
	);
}

/**
 * Detect whether current layout is singular
 *
 * @param bool $layout_slug
 *
 * @return bool
 */
function phort_is_single( $layout_slug = false ) {

	$is_single = phort_instance()->query->is_single();
	if ( ! $layout_slug ) {
		return $is_single;
	}


	return ( $is_single && phort_slug_single() === $layout_slug );
}

function phort_has_video_support() {

	return Gallery_Attachment_Video_Support::$has_video_support;
}


/**
 * Shorthand to easily attach a class to `phort_get_class`
 *
 * @param $where - Which class to attach your custom class to
 * @param $class - The custom class to attach
 */
function phort_attach_class( $where, $class ) {

	add_filter(
		'phort_get_class',
		function ( $classes ) use ( $where, $class ) {

			if ( in_array( $where, $classes ) ) {
				$classes[] = $class;
			}

			return $classes;
		}
	);
}


/**
 *
 * @param     $message - error message to log.
 * @param int $type    - passed to `trigger_error`.
 */
function phort_log_error( $message, $type = E_USER_NOTICE ) {

	// Only log errors in debug mode
	if ( ! defined( "WP_DEBUG" ) || ! WP_DEBUG ) {
		return;
	}
	// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped, WordPress.PHP.DevelopmentFunctions.error_log_trigger_error
	trigger_error( $message, $type );
}