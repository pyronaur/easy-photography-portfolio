<?php

namespace Photography_Portfolio\Frontend\Popup_Gallery;


class Photoswipe extends Abstract_Popup_Gallery {

	protected static $slug = 'photoswipe';


	public function __construct() {

		parent::__construct();
		add_action( 'get_footer', [ $this, 'display_html' ], 1000 );

	}


	public function script_handles() {

		return [ 'photoswipe-ui-default', 'photoswipe' ];

	}


	public function enqueue() {

		wp_enqueue_style( 'photoswipe-default-skin' ); // Explicit queuing
		wp_enqueue_style( 'photoswipe' );

		wp_enqueue_script( 'photoswipe-ui-default' ); // Explicit queuing is necessary, dependencies might get
		wp_enqueue_script( 'photoswipe' );

	}


	public function register() {

		/*
		 * Styles
		 */
		wp_register_style( 'photoswipe-default-skin', $this->build_directory_url . 'libs/photoswipe-ui.css', NULL, '4.1.3' );
		wp_register_style( 'photoswipe', $this->build_directory_url . 'libs/photoswipe.css', [ 'photoswipe-default-skin' ], '4.1.3' );

		/*
		 * Scripts
		 */
		wp_register_script( 'phort-gallery-lightgallery', $this->build_directory_url . 'libs/light-gallery-custom.js', [ 'jquery' ], NULL, true );
		wp_register_script( 'photoswipe-ui-default', $this->build_directory_url . 'libs/photoswipe-ui.js', NULL, '4.1.3', true );
		wp_register_script(
			'photoswipe',
			$this->build_directory_url . 'libs/photoswipe.js',
			[ 'jquery', 'photoswipe-ui-default' ],
			'4.1.3',
			true
		);

	}


	public function javascript_settings() {

		return [
			'i18n' => [
				'photoswipe' => [
					'facebook'  => esc_html__( 'Share on Facebook', 'photography-portfolio' ),
					'twitter'   => esc_html__( 'Tweet', 'photography-portfolio' ),
					'pinterest' => esc_html__( 'Pin it', 'photography-portfolio' ),
				],
			],
		];
	}


	public function display_html() {

		phort_get_template( 'partials/photoswipe' );
	}
}