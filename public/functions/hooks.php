<?php


use Photography_Portfolio\Frontend\Gallery_Data_Renderer;

function phort_inline_data_image_size() {

	global $phort_layout;

	if ( ! phort_entry_has_featured_image() ) {
		return false;
	}

	$data = new Gallery_Data_Renderer( $phort_layout->entry->featured_image, $phort_layout->attached_sizes );
	$data->render();

}

add_action( 'phort/archive/entry/attributes', 'phort_inline_data_image_size' );



/**
 * Detect JavaScript
 */
add_action( 'wp_head', 'phort_detect_javascript' );
function phort_detect_javascript() {

	if ( ! phort_is_portfolio() ) {
		return;
	}

	echo "<script>(function(html){html.classList.add('js');})(document.documentElement)</script>";
}


/**
 * Adjust CSS Classes on the <body> element
 *
 * @filter body_class
 *
 * @param $classes
 *
 * @return array
 */
add_filter( 'body_class', 'phort_adjust_body_classes' );
function phort_adjust_body_classes( $classes ) {

	if ( ! phort_is_portfolio() ) {
		return $classes;
	}

	// If this is portfolio, add core portfolio class
	$classes[] = 'PP_Portfolio';


	// Single Portfolio
	if ( phort_is_single() ) {

		$classes[] = 'PP_Single';
		$classes[] = 'PP_Single--' . phort_slug_single();

		$gallery_type = phort_get_option( 'popup_gallery' );

		if ( 'disabled' !== $gallery_type && ! empty( $gallery_type ) ) {
			$classes[] = 'PP_Popup--' . sanitize_html_class( $gallery_type );
		}

	}

	// Portfolio Archive & Categories
	if ( phort_is_archive() ) {
		$classes[] = 'PP_Archive';
		$classes[] = 'PP_Archive--' . phort_slug_archive();
	}


	return $classes;
}



/*
 * ==== PRIVATE Functions ====
 * The following functions will be moved out of here soon..
 */

/**
 * Hide archive description if the setting says so.
 * @TODO: Move somewhere nice
 *
 * ========
 * Do not tamper with this function/filter - it's likely going to be removed without warning
 * That's why it's prefixed with `_phort`
 * ========
 */
function _phort_utilize_archive_description_setting() {

	if ( 'enable' !== phort_get_option( 'archive_description' ) ) {
		phort_detach_template( 'phort_get_template' );
	}

}

add_action( 'init', '_phort_utilize_archive_description_setting' );

/**
 * Show or hide captions in galleries
 * This still looks a bit odd, but at the moment there is no other place to put the gallery captions settings
 * @TODO: Move somewhere nice
 *      
 * ========
 * Do not tamper with this function/filter - it's likely going to be removed without warning
 * That's why it's prefixed with `_phort`
 * ========
 */
function _phort_utilize_caption_settings() {


	$gallery_captions = phort_get_option( 'gallery_captions' );
	if ( $gallery_captions === 'hide' ) {
		add_filter( 'phort/get_template/gallery/caption', '__return_false' );
	}
	else if ( $gallery_captions === 'show_all' ) {
		phort_attach_class( 'PP_Gallery', 'PP_Gallery--show-captions' );
	}
}

add_action( 'init', '_phort_utilize_caption_settings' );