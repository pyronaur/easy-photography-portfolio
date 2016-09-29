<?php


namespace Photography_Portfolio\Frontend;


class Frontend {


	/**
	 * Frontend constructor.
	 */
	public function __construct() {

		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue' ) );

	}


	public function enqueue() {

		wp_enqueue_style( 'photography-portfolio', CLM_PLUGIN_DIR_URL . 'public/assets/app.css' );
		wp_enqueue_script( 'photography-portfolio', CLM_PLUGIN_DIR_URL . 'public/assets/app.js' );
	}

}