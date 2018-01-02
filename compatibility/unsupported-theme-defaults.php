<?php


/**
 * Add some default styling in themes that don't natively support EPP
 */
add_action( 'init', 'phort_maybe_add_default_container_styles', 100 );
function phort_maybe_add_default_container_styles() {

	// Only add the class if the theme doesn't support the plugin
	if ( ! phort_has_theme_support() ) {
		$classes = [ 'PP_Wrapper--default' ];


		/**
		 * If there is no theme support, users can add their own class name to the wrapper.
		 * Attach that classname with this funciton:
		 */
		$custom_classes = phort_get_option( 'wrapper_class' );
		if ( $custom_classes ) {
			$classes = array_merge( $classes, phort_get_class( $custom_classes ) );
		}

		phort_attach_class( 'PP_Wrapper', implode( " ", $classes ) );
	}

}