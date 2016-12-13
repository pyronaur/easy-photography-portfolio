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

	return $pp_layout->entry->subtitle;
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

	if( ! pp_entry_has_featured_image() ) {
		return false;
	}

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


// ------------------------
//   Archive Template Tags
// ------------------------
function pp_get_archive_title() {

	$title = '';

	if ( is_tax( 'pp_post_category' ) ) {
		$title = single_term_title();
	}

	elseif ( is_post_type_archive( 'pp_post' ) || PP_Instance()->query->is_portfolio_page() ) {
		$title = get_the_title( pp_get_option( 'portfolio_page', false ) );
		if ( $title ) {
			return $title;
		}
	}

	return apply_filters( 'pp/template/archive_title', $title );
}


function pp_the_archive_title() {

	$title = pp_get_archive_title();

	if ( $title ) {
		echo $title;
	}
}

function pp_get_archive_content() {

	$content = '';
	if ( is_tax( 'pp_post_category' ) ) {
		$content = term_description();
	}
	if ( is_post_type_archive( 'pp_post' ) || PP_Instance()->query->is_portfolio_page() ) {
		$content = get_post( pp_get_option( 'portfolio_page', false ) )->post_content;
	}

	return apply_filters( 'pp/template/archive_content', $content );
}

function pp_the_archive_content() {

	$content = pp_get_archive_content();

	/**
	 * @copied from `the_content()`
	 * Filters the post content.
	 *
	 * @param string $content Content of the current post.
	 */
	$content = apply_filters( 'the_content', $content );
	$content = str_replace( ']]>', ']]&gt;', $content );

	echo $content;
}