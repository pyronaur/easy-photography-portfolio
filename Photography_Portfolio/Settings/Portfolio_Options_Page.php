<?php


namespace Photography_Portfolio\Settings;


use Photography_Portfolio\Contracts\Options_Page_Settings_Interface;


/**
 * Class Portfolio_Options_Page
 * @package Photography_Portfolio\Settings
 *
 * @TODO    : This needs a sensible name to distinguish views from settings
 */
class Portfolio_Options_Page implements Options_Page_Settings_Interface {


	public function get_page_title() {

		return esc_html__( 'Portfolio Settings', 'phort-plugin' );

	}


	public function set_fields( \CMB2 $cmb ) {

		$this->pages();
		$cmb->add_field(
			array(
				'id'               => "portfolio_page",
				'name'             => esc_html__( 'Portfolio Page', 'phort-plugin' ),
				'type'             => 'select',
				'show_option_none' => true,
				'options'          => $this->pages(),

			)
		);


		// Set our CMB2 fields
		$cmb->add_field(
			array(
				'name'    => esc_html__( 'Portfolio Archive Layout', 'phort-plugin' ),
				'id'      => 'portfolio_layout',
				'type'    => 'select',
				'options' => PP_Instance()->layouts->available_layouts( 'archive' ),

			)
		);

		$cmb->add_field(
			array(
				'name'    => esc_html__( 'Show Titles & Descriptions in Archives', 'phort-plugin' ),
				'id'      => 'archive_enable_description',
				'type'    => 'checkbox',
				'default' => false,

			)
		);

		$cmb->add_field(
			array(
				'name'    => esc_html__( 'Single Portfolio Layout', 'phort-plugin' ),
				'id'      => 'single_portfolio_layout',
				'type'    => 'select',
				'options' => PP_Instance()->layouts->available_layouts( 'single' ),

			)
		);


		$cmb->add_field(
			array(
				'name'    => esc_html__( 'Enable Portfolio Subtitles', 'phort-plugin' ),
				'id'      => 'portfolio_enable_subtitle',
				'type'    => 'checkbox',
				'default' => true,

			)
		);


		$cmb->add_field(
			array(
				'id'       => "portfolio_show_image_count",
				'name'     => esc_html__( 'Show image count in subtitles', 'phort-plugin' ),
				'required' => array( 'portfolio_enable_subtitle', '=', '1' ),

				'type'    => 'select',
				'options' => array(
					'disable'      => "Disable",
					'only_missing' => "Only Enable when a sub-title is empty",
					'always'       => 'Always Enable (override sub-titles)',
				),
				'default' => 'disable',

			)
		);


		/**
		 * Only add Wrapper Class option if theme has no native Photography Portfolio Support
		 */
		if ( ! phort_has_theme_support() ) {
			$cmb->add_field(
				array(
					'id'      => "wrapper_class",
					'name'    => esc_html__( 'Wrapper CSS Classes', 'phort-plugin' ),
					'desc'    => esc_html__(
						'Some themes use different wrapper class-names than the standard.
					 You can enter custom CSS classnames here to make the plugin compatible with your theme',
						'phort-plugin'
					),
					'type'    => 'text',
					'default' => '',

				)
			);
		}


	}


	public function pages() {

		$args = array(
			'posts_per_page' => - 1,
			'post_type'      => 'page',
			'post_status'    => 'publish',
		);

		$pages = array();

		foreach ( get_posts( $args ) as $post ) {
			$pages[ (int) $post->ID ] = esc_html( $post->post_title );
		}

		return $pages;
	}
}
