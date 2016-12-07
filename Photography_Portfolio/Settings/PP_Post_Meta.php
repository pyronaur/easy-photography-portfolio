<?php


namespace Photography_Portfolio\Settings;


class PP_Post_Meta {


	/**
	 * PP_Post_Meta constructor.
	 */
	public function __construct() {

		add_action( 'cmb2_init', [ $this, 'after_content' ] );

		/**
		 * @TODO: Implement this in a pretty way, this needs CSS and JavaScript
		 */
		// add_action( 'edit_form_after_title', [ $this, 'move_metabox_after_post_title' ] );


	}

//	/**
//	 * Display checkbox metabox below title field
//	 * @link https://github.com/WordPress/WordPress/blob/56d6682461be82da1a3bafc454dad2c9da451a38/wp-admin/edit-form-advanced.php#L517-L523
//	 */
//	public function move_metabox_after_post_title() {
//
//		$cmb = cmb2_get_metabox( 'pp_post_meta' );
//		if ( in_array( get_post_type(), $cmb->prop( 'object_types' ), 1 ) ) {
//			$cmb->show_form();
//		}
//	}

	public function after_content() {

		$cmb = new_cmb2_box(
			array(
				'id'           => 'pp_post_after_meta',
				'title'        => __( 'Photography Portfolio', 'pp-plugin' ),
				'object_types' => array( 'pp_post' ),
				'context'      => 'normal',
				'priority'     => 'high',
			)
		);

		$cmb->add_field(
			array(

				'desc'         => '',
				'id'           => 'pp_gallery',
				'type'         => 'file_list',
				'preview_size' => array( 125, 125, true ), // Default: array( 50, 50 )
				// Optional, override default text strings
				'text'         => array(
					'add_upload_files_text' => esc_html__( 'Add Images', 'pp-plugin' ),
					'remove_image_text'     => esc_html__( 'Remove Image', 'pp-plugin' ),
					'file_text'             => esc_html__( 'File:', 'pp-plugin' ),
					'file_download_text'    => esc_html__( 'Download', 'pp-plugin' ),
					'remove_text'           => esc_html__( 'Remove', 'pp-plugin' ),
				),
			)
		);


		/*
		 * Allow metabox extension
		 */
		do_action( 'pp/meta/after_content', $cmb );

	}
}