<?php
use Photography_Portfolio\Frontend\Template;

/**
 * Kind of like `get_post_class()`
 *
 * @param array|string $class
 *
 * @return array
 */
function pp_get_class( $class = '' ) {

	$classes = array();

	if ( $class ) {

		if ( ! is_array( $class ) ) {
			$class = preg_split( '#\s+#', $class );
		}

		$classes = array_map( 'esc_attr', $class );
	}


	$classes = apply_filters( 'pp_get_class', $classes, $class );
	$classes = array_map( 'esc_attr', $classes );

	return array_unique( $classes );
}


/*
 * Kind of like `post_class()`
 */
function pp_class( $class = '' ) {

	// Separates classes with a double space, collates classes for post DIV
	echo 'class="' . join( '  ', pp_get_class( $class ) ) . '"';
}


/**
 * Get Portfolio Template
 * Kind of like `get_template_part()`
 *
 * @param      $template
 * @param null $slug
 */
function pp_get_template( $template, $slug = NULL ) {

	if ( NULL === $slug ) {
		$slug = pp_slug_current();
	}


	Template::get( $template, $slug );
}
