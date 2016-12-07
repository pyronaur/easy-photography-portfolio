<?php


namespace Photography_Portfolio\Frontend;


class Public_View {


	/**
	 * Public_View constructor.
	 */
	public function __construct() {

		// Hook into WordPress
		add_action( 'wp_head', [ $this, 'detect_javascript' ] );
		add_filter( 'body_class', [ $this, 'adjust_body_class' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue' ] );

		// Hook into Self
		add_action( 'pp/wrapper/start', [ $this, 'render_wrapper_start' ] );
		add_action( 'pp/wrapper/end', [ $this, 'render_wrapper_end' ] );

		// Adjust .PP_Wrapper classes
		add_filter( 'pp_get_class', [ $this, 'adjust_wrapper_class' ], 10, 2 );


	}


	public function enqueue() {

		$build_directory = CLM_PLUGIN_DIR_URL . 'public/build';

		wp_enqueue_style( 'PP-style', $build_directory . '/app.css' );
		wp_enqueue_script( 'PP-libs', $build_directory . '/libs.js', [], CLM_VERSION, true );
		wp_enqueue_script( 'PP-app', $build_directory . '/app.js', [ 'PP-libs', 'underscore' ], CLM_VERSION, true );
	}


	public function detect_javascript() {

		echo "<script>document.documentElement.classList.add('js');</script>";
	}


	public function adjust_body_class( $classes ) {

		if ( ! pp_is_portfolio() ) {
			return $classes;
		}

		// If this is portfolio, add core portfolio class
		$classes[] = 'PP_Portfolio';


		// Single Portfolio
		if ( PP_Instance()->query->is_single() ) {
			$classes[] = 'PP_Single';
			$classes[] = 'PP_Single--' . pp_slug_single();
		}

		// Portfolio Archive & Categories
		if ( PP_Instance()->query->is_archive() || PP_Instance()->query->is_category() ) {
			$classes[] = 'PP_Archive';
			$classes[] = 'PP_Archive--' . pp_slug_archive();
		}


		return $classes;
	}


	public function adjust_wrapper_class( $classes, $class ) {

		/**
		 * Only affect .PP_Wrapper
		 */

		if ( ! in_array( 'PP_Wrapper', $class ) ) {
			return $classes;
		}

		$custom_classes = pp_get_option( 'wrapper_class' );

		if ( $custom_classes ) {
			$classes = array_merge( $classes, pp_get_class( $custom_classes ) );
		}

		return $classes;

	}


	public function render_wrapper_start() {

		Template::get( 'partials/wrapper-start' );

	}


	public function render_wrapper_end() {

		Template::get( 'partials/wrapper-end' );
	}

}