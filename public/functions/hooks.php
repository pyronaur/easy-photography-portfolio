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
 * @since 1.4.0
 * @TODO  Remove at 1.6.0
 * New gallery loop action hook:
 * `gallery-loop` instead of `gallery/loop`
 */
add_action(
	'phort/gallery-loop/start',
	function () {

		do_action_deprecated( 'phort/gallery/loop/start', [], '1.4.0' );
	}
);

add_action(
	'phort/gallery-loop/end',
	function () {

		do_action_deprecated( 'phort/gallery/loop/end', [], '1.4.0' );
	}
);


/**
 * Show or hide captions in galleries
 * This still looks a bit odd, but at the moment there is no other place to put the gallery captions settings
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