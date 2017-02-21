<?php
/**
 * WPML plugin related compatibility code.
 * Loaded only if WPML plugin is installed and active.
 *
 * @since 1.1.2
 */

/**
 * Load routines only if WPML is loaded.
 *
 * @since 1.1.2
 */
function wpml_phort_init() {

	/**
	 * Since it is only relevant when WPML Media plugin is activated.
	 */
	if ( defined( 'WPML_MEDIA_VERSION' ) ) {
		add_filter( 'wpml_duplicate_generic_string', 'wpml_phort_postmeta_duplication', 10, 3 );
	}
}

add_action( 'wpml_loaded', 'wpml_phort_init' );


/**
 * Translating image IDs if portfolio post is duplicated.
 *
 * @since 1.1.2
 */
function wpml_phort_postmeta_duplication( $value_to_filter, $target_language, $meta_data ) {
	if ( $meta_data['key'] !== 'phort_gallery' ) {
		return $value_to_filter;
	}

	$gallery            = maybe_unserialize( $value_to_filter );
	$translated_gallery = array();

	foreach ( $gallery as $image_id => $url ) {
		$translated_image_id = apply_filters( 'wpml_object_id', $image_id, 'attachment', true, $target_language );
		$translated_gallery[ $translated_image_id ] = $url;
	}

	return $translated_gallery;
}