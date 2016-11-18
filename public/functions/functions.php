<?php
use Photography_Portfolio\Frontend\Layout\View;

/*
 *
 *
 *
 * @TODO: Template files should not use PHP Namespaces. Create public functions instead.
  *
 *
 *
 *
 */

/*
 *
 * -- Initialize Portfolio
 *
 */
function PP_Instance() {

	return Colormelon_Photography_Portfolio::instance();
}


/**
 *
 * -- CLM Portfolio Functions
 *
 */

function pp_get_class( $class = NULL, $post_id = NULL ) {

	$classes = array();

	if ( $class ) {
		if ( ! is_array( $class ) ) {
			$class = preg_split( '#\s+#', $class );
		}
		$classes = array_map( 'esc_attr', $class );
	}

	// Add PP_Gallery--{{type}} to class
	$classes[] = 'PP_Gallery--' . pp_slug_single( $post_id );

	$classes = array_map( 'esc_attr', $classes );

	return array_unique( $classes );
}


function pp_class( $class = NULL, $post_id = NULL ) {

	// Separates classes with a double space, collates classes for post DIV
	echo 'class="' . join( '  ', pp_get_class( $class, $post_id ) ) . '"';
}


if ( ! function_exists( "pp_load_view" ) ) {
	function pp_load_view() {

		View::load();
	}
}

if ( ! function_exists( "pp_display_archive" ) ) {

	/**
	 * Start a loop and load all gallery items
	 * @load /archive/layout.php
	 */
	function pp_display_archive() {

		Photography_Portfolio\Frontend\Layout\Archive\Archive_Portfolio_Factory::display();
	}
}


if ( ! function_exists( "pp_display_single" ) ) {

	/**
	 * Start a loop and load all gallery items
	 * @load /single/layout.php
	 */
	function pp_display_single() {

		Photography_Portfolio\Frontend\Layout\Single\Single_Portfolio_Factory::display();
	}
}


if ( ! function_exists( "pp_display_gallery" ) ) {
	function pp_display_gallery() {

		global $cm_portfolio;

		$cm_portfolio->display_gallery();
	}
}

if ( ! function_exists( "pp_display_entry" ) ) {
	function pp_display_entry( $post_id ) {

		global $cm_portfolio;

		$cm_portfolio->the_entry( $post_id );
	}
}


if ( ! function_exists( "pp_get_template" ) ) {
	function pp_get_template( $name ) {

		global $cm_portfolio;

		$cm_portfolio->get( $name );
	}
}


if ( ! function_exists( 'pp_is_portfolio' ) ) {
	function pp_is_portfolio() {

		return PP_Instance()->query->is_portfolio();


	}
}


if ( ! function_exists( "pp_slug_single" ) ) {

	/**
	 *
	 * Get single layout slug
	 *
	 */
	function pp_slug_single() {

		return sanitize_html_class(
			pp_get_option( 'single_portfolio_layout', PP_Instance()->layouts->get_default( 'single' ) )
		);
	}

}


if ( ! function_exists( "pp_slug_archive" ) ) {

	/**
	 *
	 * Get archive layout slug
	 *
	 */
	function pp_slug_archive() {

		return sanitize_html_class(
			pp_get_option( 'portfolio_layout', PP_Instance()->layouts->get_default( 'archive' ) )
		);
	}

}

function pp_slug_current() {

	// Single Portfolio
	if ( PP_Instance()->query->is_single() ) {
		return pp_slug_single();
	}

	// Portfolio Archive & Categories
	if ( PP_Instance()->query->is_archive() || PP_Instance()->query->is_category() ) {
		return pp_slug_archive();
	}

	return false;
}