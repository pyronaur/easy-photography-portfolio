<?php
use Photography_Portfolio\Frontend\Layout\View;
use Photography_Portfolio\Frontend\Layout_Factory;


/**
 *
 * -- Portfolio Functions
 *
 */
function pp_load_view() {

	View::load();
}


/**
 * Find & Load the correct portfolio template
 *
 * @uses WP_Query $wp_query
 *
 * @param string $layout_type Layout name, like [single, archive]
 * @param string $layout_slug The layout name, like [masonry, horizontal]
 */
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
