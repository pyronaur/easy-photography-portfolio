<?php


namespace Photography_Portfolio\Frontend;


class Frontend {


	/**
	 * Frontend constructor.
	 */
	public function __construct() {

		// Hook into WordPress
		add_action( 'wp_head', [ $this, 'detect_javascript' ] );
		add_filter( 'body_class', [ $this, 'adjust_body_class' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue' ] );

		// Hook into Self
		add_action( 'cmp/wrapper/start', [ $this, 'render_wrapper_start' ] );
		add_action( 'cmp/wrapper/end', [ $this, 'render_wrapper_end' ] );


	}


	public function enqueue() {

		$build_directory = CLM_PLUGIN_DIR_URL . 'public/build';

		wp_enqueue_style( 'PP-style', $build_directory . '/app.css' );
		wp_enqueue_script( 'PP-libs', $build_directory . '/libs.js' );
		wp_enqueue_script( 'PP-app', $build_directory . '/app.js', array( 'PP-libs', 'underscore' ) );
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
		if ( PP_Instance()->is->single() ) {
			$classes[] = 'PP_Single';
			$classes[] = 'PP_Single--' . pp_get_layout();
		}

		// Portfolio Archive & Categories
		if ( PP_Instance()->is->archive() || PP_Instance()->is->category() ) {
			$classes[] = 'PP_Archive';
			$classes[] = 'PP_Archive--' . pp_get_archive_layout();
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