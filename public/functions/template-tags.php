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
function phort_get_template( $template, $slug = NULL ) {

	if ( NULL === $slug ) {
		$slug = phort_slug_current();
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
function phort_get_class( $class = '' ) {

	$classes = array();

	if ( $class ) {

		if ( ! is_array( $class ) ) {
			$class = preg_split( '#\s+#', $class );
		}

		$classes = array_map( 'esc_attr', $class );
	}


	$classes = apply_filters( 'phort_get_class', $classes, $class );
	$classes = array_map( 'esc_attr', $classes );

	return array_unique( $classes );
}


/*
 * Kind of like `post_class()`
 */
function phort_class( $class = '' ) {

	// Separates classes with a double space, collates classes for post DIV
	echo 'class="' . join( '  ', phort_get_class( $class ) ) . '"';
}


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Portfolio Entry
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function phort_entry_get_subtitle() {

	global $phort_layout;

	return $phort_layout->entry->subtitle;
}

function phort_entry_has_subtitle() {

	return ( phort_entry_get_subtitle() != '' );
}

function phort_entry_the_featured_image() {

	global $phort_layout;
	$phort_layout->entry->show_featured_image();
}


function phort_entry_has_featured_image() {

	global $phort_layout;

	return $phort_layout->entry->has_featured_image();
}

function phort_entry_data_attribute() {

	global $phort_layout;

	if( ! phort_entry_has_featured_image() ) {
		return false;
	}

	$data = new Gallery_Data_Renderer( $phort_layout->entry->featured_image, $phort_layout->attached_sizes );
	$data->render();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Portfolio Gallery
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function phort_gallery_data_attribute() {

	global $phort_layout;

	$data = new Gallery_Data_Renderer( phort_get_gallery_attachment(), $phort_layout->attached_sizes );
	$data->render();
}

/**
 * Check if gallery exists and has attachments
 * @return bool
 */
function phort_gallery_has_items() {

	global $phort_layout;

	if ( ! isset( $phort_layout ) || ! isset( $phort_layout->gallery ) ) {
		return false;
	}

	return $phort_layout->gallery->has_data();
}

/**
 * Setup the current attachment
 * @return mixed
 */
function phort_gallery_setup_item() {

	global $phort_layout;

	return $phort_layout->gallery->the_attachment();
}

/**
 * Fetch the current attachment
 * @return Attachment
 */
function phort_get_gallery_attachment() {

	global $phort_layout;

	return $phort_layout->gallery->get_the_attachment();
}


// ------------------------
//   Archive Template Tags
// ------------------------
function phort_get_archive_title() {

	$title = '';

	if ( is_tax( 'phort_post_category' ) ) {
		$title = single_term_title();
	}

	elseif ( is_post_type_archive( 'phort_post' ) || PP_Instance()->query->is_portfolio_page() ) {
		$title = get_the_title( phort_get_option( 'portfolio_page', false ) );
		if ( $title ) {
			return $title;
		}
	}

	return apply_filters( 'phort/template/archive_title', $title );
}


function phort_the_archive_title() {

	$title = phort_get_archive_title();

	if ( $title ) {
		echo $title;
	}
}

function phort_get_archive_content() {

	$content = '';
	if ( is_tax( 'phort_post_category' ) ) {
		$content = term_description();
	}
	if ( is_post_type_archive( 'phort_post' ) || PP_Instance()->query->is_portfolio_page() ) {
		$content = get_post( phort_get_option( 'portfolio_page', false ) )->post_content;
	}

	return apply_filters( 'phort/template/archive_content', $content );
}

function phort_the_archive_content() {

	$content = phort_get_archive_content();

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