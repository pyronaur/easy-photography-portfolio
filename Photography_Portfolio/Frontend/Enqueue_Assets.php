<?php


namespace Photography_Portfolio\Frontend;


use Photography_Portfolio\Frontend\Popup_Gallery\lightGallery;
use Photography_Portfolio\Frontend\Popup_Gallery\Photoswipe;

class Enqueue_Assets {


	/**
	 * @var string - Where all the scripts and styles live
	 */
	protected $build_directory_url;
	protected $popup_gallery = false;


	/**
	 * Enqueue_Assets constructor.
	 */
	public function __construct() {

		// Hook into WordPress
		add_action( 'wp_head', [ $this, 'detect_javascript' ] );
		add_filter( 'body_class', [ $this, 'adjust_body_class' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue' ] );


		$this->popup_gallery       = $this->initialize_popup_gallery();
		$this->build_directory_url = CLM_PLUGIN_DIR_URL . 'public/build/';

	}


	/**
	 * Create a popup-gallery instance, according to plugin settings
	 *
	 * @return bool|lightGallery|Photoswipe
	 */
	public function initialize_popup_gallery() {

		$gallery = phort_get_option( 'popup_gallery' );
		if ( 'photoswipe' === $gallery ) {
			return new Photoswipe();
		}

		if ( 'photoswipe' === $gallery ) {
			return new lightGallery();
		}

		return false;
	}


	/**
	 * @return bool
	 */
	public function enqueue() {

		// Register scripts & styles
		$this->register();


		/**
		 * Enqueue scripts and styles only in portfolio
		 */
		if ( ! apply_filters( 'phort/enqueue', phort_is_portfolio() ) ) {
			return false;
		}

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
		$dependencies = array_merge( $dependencies, $this->popup_gallery->script_handles() );


		// Popup Gallery
		if ( $this->popup_gallery ) {
			$this->popup_gallery->register();
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


	public function detect_javascript() {

		echo "<script>document.documentElement.classList.add('js');</script>";
	}


	/**
	 * Adjust CSS Classes on the <body> element
	 *
	 * @filter body_class
	 *
	 * @param $classes
	 *
	 * @return array
	 */
	public function adjust_body_class( $classes ) {

		if ( ! phort_is_portfolio() ) {
			return $classes;
		}

		// If this is portfolio, add core portfolio class
		$classes[] = 'PP_Portfolio';


		// Single Portfolio
		if ( phort_is_single() ) {

			$classes[] = 'PP_Single';
			$classes[] = 'PP_Single--' . phort_slug_single();

			$gallery_type = phort_get_option( 'popup_gallery' );

			if ( 'disabled' !== $gallery_type && ! empty( $gallery_type ) ) {
				$classes[] = 'PP_Popup--' . sanitize_html_class( $gallery_type );
			}

		}

		// Portfolio Archive & Categories
		if ( phort_is_archive() ) {
			$classes[] = 'PP_Archive';
			$classes[] = 'PP_Archive--' . phort_slug_archive();
		}


		return $classes;
	}


}