<?php
use Photography_Portfolio\Frontend\Layout\View;
use Photography_Portfolio\Frontend\Layout_Factory;

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


	$classes = apply_filters( 'pp_get_class', $classes, $post_id, $class );
	$classes = array_map( 'esc_attr', $classes );

	return array_unique( $classes );
}


function pp_class( $class = NULL, $post_id = NULL ) {

	// Separates classes with a double space, collates classes for post DIV
	echo 'class="' . join( '  ', pp_get_class( $class, $post_id ) ) . '"';
}


function pp_load_view() {

	View::load();
}


function pp_display( $layout_type, $layout_slug ) {

	global $wp_query;
	$layout_class_name = PP_Instance()->layouts->find_class( $layout_type, $layout_slug );

	$view = new Layout_Factory( $wp_query, $layout_slug, $layout_class_name );
	$view->load();
}

/**
 * Start a loop and load all gallery items
 * @load /archive/layout.php
 */
function pp_display_archive() {

	pp_display( 'archive', pp_slug_archive() );

}


/**
 * Start a loop and load all gallery items
 * @load /single/layout.php
 */
function pp_display_single() {

	pp_display( 'single', pp_slug_single() );

}


function pp_display_gallery() {

	global $pp_layout;

	$pp_layout->display_gallery();
}


function pp_display_entry( $post_id ) {

	global $pp_layout;

	$pp_layout->the_entry( $post_id );
}


function pp_get_template( $name ) {

	global $pp_layout;

	$pp_layout->get( $name );
}


function pp_is_portfolio() {

	return PP_Instance()->query->is_portfolio();


}


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