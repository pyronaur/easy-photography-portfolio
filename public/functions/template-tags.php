<?php

use Photography_Portfolio\Frontend\Gallery\Attachment;
use Photography_Portfolio\Frontend\Gallery_Data_Renderer;
use Photography_Portfolio\Frontend\Template;

/**
 * == Instantly load a portfolio template
 *
 * Only use this function to UNSET a template!
 * Never load templates with this function!
 *
 * Use `phort_get_template()` instead!
 *
 * @param $template
 * @param $slug
 */
function _phort_load_template( $template, $slug ) {

	Template::load( $template, $slug );
}


/**
 * Shorthand to easily detach template from any `phort_get_template/{$template}` hook
 *
 * @priority = 40
 */
function phort_detach_template( $template, $remove_when_slug = '*' ) {

	add_action(
		"phort_get_template/{$template}",

		function ( $template, $current_slug ) use ( $remove_when_slug ) {

			// Only remove action if conditional slug is unset or matches the $current_slug
			if ( $remove_when_slug === '*' || $remove_when_slug === $current_slug ) {
				remove_action( "phort_get_template/{$template}", '_phort_load_template', 50 );
			}

		},
		// priority 50 - 10 = 40
		40,

		// arguments = 2
		2
	);

}

/**
 * Shorthand to easily attach template to any `phort_get_template/{$template}` hook
 *
 * @param     $template - the template path, for example `single/layout`
 * @param     $callback
 * @param int $priority
 * @param int $arguments
 */
function phort_attach_template( $template, $callback, $priority = 50, $arguments = 2 ) {

	add_action( "phort_get_template/{$template}", $callback, $priority, $arguments );
}

/**
 * Get Portfolio Template
 * Kind of like `get_template_part()`
 *
 * @param      $template
 * @param null $slug
 *
 * @updated 1.4.0
 * @hook    `phort_get_template/{$template}`
 */
function phort_get_template( $template, $slug = NULL ) {

	if ( NULL === $slug ) {
		$slug = phort_slug_current();
	}

	/**
	 * Defer loading the requested $template path with `add_action()`
	 * This way anyone can load a desired template bit before or after an Easy Photography Portfolio template is loaded
	 *
	 * @priority = 50
	 * To load templates after a $template has loaded, increase the priority
	 * To load templates before - decrease the priority
	 *
	 */
	phort_attach_template( $template, '_phort_load_template' );

	/**
	 * Load any templates that have been attached to this:
	 */
	do_action( "phort_get_template/{$template}", $template, $slug );

}


/**
 * Kind of like `get_post_class()`
 *
 * @param array|string $class - A list of escaped CSS Classes, ready for output
 *
 * @return array
 */
function phort_get_class( $class = '' ) {

	$classes = [];

	if ( $class ) {

		if ( ! is_array( $class ) ) {
			$class = preg_split( '#\s+#', $class );
		}

		$classes = array_map( 'esc_attr', $class );
	}


	$classes = apply_filters( 'phort_get_class', $classes, $class );

	/**
	 * For convenience, use `esc_attr` instead of `sanitize_html_class`
	 * This allows the $classes array to look like this:
	 * ['classname_a', 'classname_b classname_c class_name_y', 'classname_z']
	 *
	 * It's both good and bad, but that's what WordPress uses, so we do too.
	 */
	$classes = array_map( 'esc_attr', $classes );

	return array_unique( $classes );
}


/**
 * Kind of like `post_class()`
 *
 * @param array $class - Array prefered, strings accepted.
 */
function phort_class( $class = [] ) {

	// Separates classes with a double space, collates classes for post DIV
	// phort_get_class is already using `esc_attr`
	// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
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

/**
 * Allow custom attributes to be added to entries
 */
function phort_entry_data_attributes() {

	do_action( 'phort/archive/entry/attributes' );
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
 *
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
 *
 * @return mixed
 */
function phort_gallery_setup_item() {

	global $phort_layout;

	return $phort_layout->gallery->the_attachment();
}

/**
 * Fetch the current attachment
 *
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
		$title = single_term_title( '', false );
	} elseif ( is_post_type_archive( 'phort_post' ) || phort_instance()->query->is_portfolio_home() ) {
		$title = get_the_title( phort_get_option( 'portfolio_page' ) );
		if ( $title ) {
			return $title;
		}
	}

	return apply_filters( 'phort/template/archive_title', $title );
}


function phort_the_archive_title() {

	$title = phort_get_archive_title();

	if ( $title ) {
		// This is just as safe as `the_title` or `single_term_title`.
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo $title;
	}
}

function phort_get_archive_content() {

	$content = '';
	if ( is_tax( 'phort_post_category' ) ) {
		$content = term_description();
	}
	if ( is_post_type_archive( 'phort_post' ) || phort_instance()->query->is_portfolio_home() ) {
		$content = get_post( phort_get_option( 'portfolio_page' ) )->post_content;
	}

	return apply_filters( 'phort/template/archive_content', wp_kses_post( $content ) );
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

	echo wp_kses_post( $content );
}
