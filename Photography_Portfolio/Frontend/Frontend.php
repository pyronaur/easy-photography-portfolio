<?php


namespace Photography_Portfolio\Frontend;

use Photography_Portfolio\Frontend\Template;


class Frontend {


	/**
	 * Frontend constructor.
	 */
	public function __construct() {

		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue' ) );
		add_filter( 'body_class', array( $this, 'adjust_body_class' ) );
		add_action( 'cmp/wrapper/start', array( $this, 'render_wrapper_start' ) );
		add_action( 'cmp/wrapper/end', array( $this, 'render_wrapper_end' ) );

	}


	public function enqueue() {

		wp_enqueue_style( 'photography-portfolio', CLM_PLUGIN_DIR_URL . 'public/assets/app.css' );
		wp_enqueue_script( 'photography-portfolio', CLM_PLUGIN_DIR_URL . 'public/assets/app.js' );
	}


	public function adjust_body_class( $classes ) {

		if ( ! cmp_is_portfolio() ) {
			return $classes;
		}

		if ( is_singular( 'portfolio' ) ||
		     is_page_template( 'templates/single-portfolio.php' )
		) {
			$classes[] = 'Portfolio--' . cmp_get_layout();
		}

		$classes[] = 'is-portfolio';

		return $classes;

	}


	public function render_wrapper_start() {

		Template::get( 'partials/wrapper-start' );

	}


	public function render_wrapper_end() {

		Template::get( 'partials/wrapper-end' );
	}

}