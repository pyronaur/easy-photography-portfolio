<?php


/**
 * Add some default styling in themes that don't natively support EPP
 */
add_filter( 'phort_get_class', 'phort_add_styled_wrapper_class' );
function phort_add_styled_wrapper_class( $classes ) {

	// Only add the class if the theme doesn't support the plugin
	if ( phort_has_theme_support() ) {
		return $classes;
	}

	if ( in_array( 'PP_Wrapper', $classes ) ) {
		$classes[] = 'PP_Wrapper--default';
	}

	return $classes;
}