<?php


namespace Photography_Portfolio\Settings\Gallery;


class lightGallery {

	/**
	 * Apply lightGallery settings to `__phort` javascript global
	 *
	 * @param $settings
	 *
	 * @return array
	 */
	public static function apply_settings( $settings ) {

		if ( ! is_array( $settings )
		     ||
		     $settings['popup_gallery'] !== 'lightgallery'
		) {
			return $settings;
		}

		$settings['lightGallery'] = static::get_settings();

		return $settings;
	}


	/**
	 * lightGallery.js specific settings.
	 * You can inspect all the available settings here:
	 * @link http://sachinchoolur.github.io/lightGallery/docs/api.html
	 */
	public static function get_settings() {

		$thumbnails = phort_get_option( 'lg_thumbnails' );

		return [
			'thumbnail'          => ( $thumbnails !== 'disable' ),
			'showThumbByDefault' => ( $thumbnails === 'show' ),
		];


	}


	public static function register() {
		add_filter( 'phort/js/__phort', [ __CLASS__, 'apply_settings' ] );
	}
}