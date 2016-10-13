<?php


namespace Photography_Portfolio\Settings;


use Photography_Portfolio\Contracts\Options_Page_Settings;


class Portfolio_Options_Page implements Options_Page_Settings {


	public function get_page_title() {

		return esc_html__( 'Portfolio Settings', 'MELON_TXT' );

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


	public function set_fields( $cmb ) {

		$this->pages();
		$cmb->add_field(
			array(
				'id'               => "portfolio_page",
				'name'             => esc_html__( 'Portfolio Page', 'MELON_TXT' ),
				'type'             => 'select',
				'show_option_none' => true,
				'options'          => $this->pages(),

			)
		);


		// Set our CMB2 fields
		$cmb->add_field(
			array(
				'name'    => esc_html__( 'Portfolio Archive Layout', 'MELON_TXT' ),
				'id'      => 'portfolio_layout',
				'type'    => 'select',
				'options' => CMP_Instance()->layouts->available_layouts( 'archive' ),

			)
		);

		$cmb->add_field(
			array(
				'name'    => esc_html__( 'Single Portfolio Layout', 'MELON_TXT' ),
				'id'      => 'single_portfolio_layout',
				'type'    => 'select',
				'options' => CMP_Instance()->layouts->available_layouts( 'single' ),

			)
		);


		$cmb->add_field(
			array(
				'name'    => esc_html__( 'Enable Portfolio Subtitles', 'MELON_TXT' ),
				'id'      => 'portfolio_enable_subtitle',
				'type'    => 'checkbox',
				'default' => true,

			)
		);


		$cmb->add_field(
			array(
				'id'       => "portfolio_show_image_count",
				'name'     => esc_html__( 'Show image count in subtitles', 'MELON_TXT' ),
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


	}
}
