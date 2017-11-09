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