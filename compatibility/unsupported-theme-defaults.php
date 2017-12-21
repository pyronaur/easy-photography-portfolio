<?php


/**
 * Add some default styling in themes that don't natively support EPP
 */
add_action( 'init', 'phort_maybe_add_default_container_styles', 100 );
function phort_maybe_add_default_container_styles() {

	// Only add the class if the theme doesn't support the plugin
	if ( ! phort_has_theme_support() ) {
		phort_attach_class( 'PP_Wrapper', 'PP_Wrapper--default' );
	}

}