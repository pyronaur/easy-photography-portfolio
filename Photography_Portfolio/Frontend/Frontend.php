<?php


namespace Photography_Portfolio\Frontend;


class Frontend {


	/**
	 * Frontend constructor.
	 */
	public function __construct() {

		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue' ) );
		add_filter( 'body_class', array( $this, 'adjust_body_class' ) );

	}


	public function enqueue() {

		wp_enqueue_style( 'photography-portfolio', CLM_PLUGIN_DIR_URL . 'public/assets/app.css' );
		wp_enqueue_script( 'photography-portfolio', CLM_PLUGIN_DIR_URL . 'public/assets/app.js' );
	}


	public function adjust_body_class( $classes ) {

		if ( cmp_is_portfolio() ) {
			$classes[] = 'is-portfolio';
		}

		if ( is_singular( 'portfolio' ) ||
		     is_page_template( 'templates/single-portfolio.php' )
		) {
			$classes[] = 'Portfolio--' . cmp_get_layout();
		}

		return $classes;

	}

}