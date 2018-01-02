<?php


namespace Photography_Portfolio\Frontend\Popup_Gallery;


class Popup_Gallery_Factory {

	/**
	 * Create a popup-gallery instance, according to plugin settings
	 *
	 * @return bool|lightGallery|Photoswipe
	 */
	public static function create_instance() {

		$gallery = phort_get_option( 'popup_gallery' );
		if ( 'photoswipe' === $gallery ) {
			return new Photoswipe();
		}

		if ( 'photoswipe' === $gallery ) {
			return new lightGallery();
		}

		return false;
	}
}