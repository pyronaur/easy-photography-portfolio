<?php


namespace Photography_Portfolio\Admin_View;


use Photography_Portfolio\Settings\General_Portfolio_Settings;
use Photography_Portfolio\Settings\PP_Post_Meta;

class Admin_View {

	private $options   = false;
	private $metaboxes = false;


	/**
	 * Public_View constructor.
	 */
	public function __construct() {

		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue' ] );
		$this->options   = new Options_Page( new General_Portfolio_Settings() );
		$this->metaboxes = new PP_Post_Meta();
	}


	public function enqueue( $hook ) {

		/**
		 * Only enqueue styles when they're necessary
		 *
		 *  Edit Posts: `post.php`
		 *  Theme Options: `phort_post_page_phort_options`
		 *
		 * `phort_post_page_phort_options` is a very special key that WordPress generates. I wouldn't have guessed it.
		 */
		if ( ! in_array( $hook, [ 'post.php', 'post-new.php', 'phort_post_page_phort_options' ] ) ) {
			return;
		}

		wp_enqueue_style( 'PP-style', CLM_PLUGIN_DIR_URL . 'public/build' . '/admin.css' );
	}


}