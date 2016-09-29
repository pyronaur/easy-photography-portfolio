<?php

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


use CLM\Metamod;

/*
 *
 * -- Initialize Portfolio
 *
 */
function CMP_Instance() {

	return Colormelon_Photography_Portfolio::instance();
}


/**
 *
 * -- CLM Portfolio Functions
 *
 */
function cmp_get_layout( $post_id = NULL ) {

	if ( ! $post_id ) {
		$post_id = get_the_ID();
	}

	return Metamod::get_value( 'single_portfolio_layout', $post_id );
}

function cmp_get_class( $class = NULL, $post_id = NULL ) {

	if ( $class ) {
		if ( ! is_array( $class ) ) {
			$class = preg_split( '#\s+#', $class );
		}
		$class = array_map( 'esc_attr', $class );
	}
	else {
		// Ensure that we always coerce class to being an array.
		$class = array();
	}

	// Add Gallery--{{type}} to class
	$class[] = 'Gallery--' . cmp_get_layout( $post_id );;

	return get_post_class( $class );
}

function cmp_class( $class = NULL, $post_id = NULL ) {

	// Separates classes with a double space, collates classes for post DIV
	echo 'class="' . join( '  ', cmp_get_class( $class, $post_id ) ) . '"';
}