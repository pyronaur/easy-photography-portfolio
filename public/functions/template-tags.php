<?php
use Photography_Portfolio\Frontend\Gallery\Attachment;
use Photography_Portfolio\Frontend\Gallery_Data_Renderer;
use Photography_Portfolio\Frontend\Template;


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


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Portfolio Entry
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function pp_entry_get_subtitle() {

	global $pp_layout;

	return $pp_layout->entry->get_subtitle();
}

function pp_entry_has_subtitle() {

	return ( pp_entry_get_subtitle() != '' );
}

function pp_entry_the_featured_image() {

	global $pp_layout;
	$pp_layout->entry->show_featured_image();
}


function pp_entry_has_featured_image() {

	global $pp_layout;

	return $pp_layout->entry->has_featured_image();
}

function pp_entry_data_attribute() {

	global $pp_layout;

	$data = new Gallery_Data_Renderer( $pp_layout->entry->featured_image, $pp_layout->attached_sizes );
	$data->render();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Portfolio Gallery
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function pp_gallery_data_attribute() {

	global $pp_layout;

	$data = new Gallery_Data_Renderer( pp_get_gallery_attachment(), $pp_layout->attached_sizes );
	$data->render();
}

/**
 * Check if gallery exists and has attachments
 * @return bool
 */
function pp_gallery_has_items() {

	global $pp_layout;

	if ( ! isset( $pp_layout ) || ! isset( $pp_layout->gallery ) ) {
		return false;
	}

	return $pp_layout->gallery->has_data();
}

/**
 * Setup the current attachment
 * @return mixed
 */
function pp_gallery_setup_item() {

	global $pp_layout;

	return $pp_layout->gallery->the_attachment();
}

/**
 * Fetch the current attachment
 * @return Attachment
 */
function pp_get_gallery_attachment() {

	global $pp_layout;

	return $pp_layout->gallery->get_the_attachment();
}
