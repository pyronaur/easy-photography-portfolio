<?php
use Photography_Portfolio\Frontend\Layout\View;

/**
 *
 *
 * Available Global Variables: $cm_portfolio, $entry
 *
 * @var $cm_portfolio Photography_Portoflio\Frontend\Layout\Single\Single_Portfolio_Layout
 * @var $entry        Photography_Portoflio\Frontend\Layout\Entry\Entry
 */

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
	$classes[] = 'PP_Gallery--' . pp_get_single_slug( $post_id );

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

if ( ! function_exists( "pp_archive_layout" ) ) {

	/**
	 * Start a loop and load all gallery items
	 * @load /archive/layout.php
	 */
	function pp_archive_layout() {

		Photography_Portfolio\Frontend\Layout\Archive\Archive_Portfolio_Factory::display();
	}
}


if ( ! function_exists( "pp_single_layout" ) ) {

	/**
	 * Start a loop and load all gallery items
	 * @load /single/layout.php
	 */
	function pp_single_layout() {

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