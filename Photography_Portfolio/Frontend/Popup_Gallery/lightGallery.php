<?php


namespace Photography_Portfolio\Frontend\Popup_Gallery;


class lightGallery extends Abstract_Popup_Gallery {


	/**
	 * lightGallery.js specific settings.
	 * You can inspect all the available settings here:
	 * @link http://sachinchoolur.github.io/lightGallery/docs/api.html
	 */
	public function javascript_settings() {


		$thumbnails = phort_get_option( 'lg_thumbnails' );

		return
			[
				'lightGallery' => [
					'thumbnail'          => ( $thumbnails !== 'disable' ),
					'showThumbByDefault' => ( $thumbnails === 'show' ),
				],
			];
	}


	public function register() {

		// Style
		wp_register_style( 'phort-gallery-lightgallery', $this->build_directory_url . 'libs/lightgallery.css' );

		// Script
		wp_register_script( 'phort-gallery-lightgallery', $this->build_directory_url . 'libs/light-gallery-custom.js', [ 'jquery' ], NULL, true );
	}


	public function enqueue() {

		// Script
		wp_enqueue_style( 'phort-gallery-lightgallery' );

		// Style
		wp_enqueue_script( 'phort-gallery-lightgallery' );
	}


	public function script_handles() {

		return [ 'phort-gallery-lightgallery' ];
	}
}