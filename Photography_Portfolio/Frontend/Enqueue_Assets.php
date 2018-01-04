<?php


namespace Photography_Portfolio\Frontend;


class Enqueue_Assets {


	/**
	 * @var string - Where all the scripts and styles live
	 */
	protected $build_directory_url;

	/**
	 * @var \Photography_Portfolio\Frontend\Popup_Gallery\Abstract_Popup_Gallery
	 */
	protected $popup_gallery;


	/**
	 * Enqueue_Assets constructor.
	 */
	public function __construct( $popup_gallery = false ) {

		$this->build_directory_url = CLM_PLUGIN_DIR_URL . 'public/build/';
		$this->popup_gallery       = $popup_gallery;

		if ( phort_is_portfolio() ) {
			add_action( 'wp_enqueue_scripts', [ $this, 'enqueue' ] );
		}
	}


	/**
	 * @return bool
	 */
	public function enqueue() {

		// Register scripts & styles
		$this->register();


		// Enqueue Popup-Gallery scripts & Styles
		if ( $this->popup_gallery ) {
			$this->popup_gallery->enqueue();
		}


		// Enqueue style
		wp_enqueue_style( 'phort-style' );


		// Enqueue dependencies dynamically
		if ( in_array( phort_slug_current(), [ 'masonry', 'masonry-hovercard' ] ) ) {
			wp_enqueue_script( 'jquery-masonry' );
		}

		// Enqueue photography-portfolio.js last
		wp_enqueue_script( 'phort-app' );
	}


	/**
	 * Register Scripts and Styles
	 * This doesn't enqueue anything yet.
	 */
	public function register() {


		$dependencies = [
			'jquery',
			'imagesloaded',
			'wp-js-hooks',
		];

		// Popup Gallery
		if ( $this->popup_gallery ) {
			$this->popup_gallery->register();
			$dependencies = array_merge( $dependencies, $this->popup_gallery->script_handles() );
		}

		// Styles
		wp_register_style( 'phort-style', $this->build_directory_url . 'photography-portfolio.css' );

		// Scripts
		wp_register_script( 'wp-js-hooks', $this->build_directory_url . 'libs/wp-js-hooks.js', NULL, '1.0.0', true );
		wp_register_script( 'phort-app', $this->build_directory_url . 'photography-portfolio.js', $dependencies, CLM_VERSION, true );


		// Pass options to JavaScript side
		wp_localize_script( 'phort-app', '__phort', $this->javascript_settings() );
	}


	/**
	 * Return JavaScript settings to be included in a global
	 * @return mixed|void
	 */
	public function javascript_settings() {

		$settings = [
			'popup_gallery' => phort_get_option( 'popup_gallery' ),
		];

		if ( $this->popup_gallery ) {
			$settings = array_merge_recursive( $settings, $this->popup_gallery->javascript_settings() );
		}

		return apply_filters( 'phort/js/__phort', $settings );
	}


}