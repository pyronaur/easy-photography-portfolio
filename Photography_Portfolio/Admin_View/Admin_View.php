<?php


namespace Photography_Portfolio\Admin_View;


use Photography_Portfolio\Settings\General_Portfolio_Settings;
use Photography_Portfolio\Settings\Portfolio_Entry_Metaboxes;
use Photography_Portfolio\Settings\Setting_Registry;

class Admin_View {

	private $general_options_page;
	private $metaboxes;


	/**
	 * Public_View constructor.
	 */
	public function __construct() {

		// Show welcome message in admin view
		new Welcome_Message();

		// Setup admin pages
		$this->create_options_pages();

		// Portfolio entry meta fields ( subtitle, gallery, ... )
		$this->metaboxes = new Portfolio_Entry_Metaboxes();

		// Enqueue scripts
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue' ] );
	}


	public function create_options_pages() {


		// Add General Portfolio Settings in the Options page
		$this->general_options_page = new CMB2_Options_Page(
			'phort_options',
			esc_html__( 'Portfolio Settings', 'photography-portfolio' ),

			// For now, there is only 1 admin page, $registry->get_all() is okay for that.
			phort_instance()->settings->get_all()
		);


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
		if (
			! in_array( $hook, [ 'post.php', 'post-new.php', 'phort_post_page_phort_options' ] )
			&&
			false === apply_filters( 'phort/force_admin_style', false )
		) {
			return;
		}

		wp_enqueue_style( 'phort-admin', CLM_PLUGIN_DIR_URL . 'public/build/phort-admin.css' );
		wp_enqueue_script('phort-admin', CLM_PLUGIN_DIR_URL . 'sources/script/admin/phort-admin.js');
	}


}