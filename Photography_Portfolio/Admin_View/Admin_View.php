<?php


namespace Photography_Portfolio\Admin_View;


use Photography_Portfolio\Settings\Portfolio_Options_Page;
use Photography_Portfolio\Settings\PP_Post_Meta;

class Admin_View {

	private $options   = false;
	private $metaboxes = false;


	/**
	 * Public_View constructor.
	 */
	public function __construct() {

		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue' ] );
		$this->options   = new Options_Page( new Portfolio_Options_Page() );
		$this->metaboxes = new PP_Post_Meta();
	}


	public function enqueue( $hook ) {

		/**
		 * Only enqueue styles in post editor
		 */
		if ( $hook !== 'post.php' ) {
			return;
		}

		$build_directory = CLM_PLUGIN_DIR_URL . 'public/build';

		wp_enqueue_style( 'PP-style', $build_directory . '/admin.css' );

	}


}