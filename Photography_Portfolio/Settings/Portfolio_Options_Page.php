<?php


namespace Photography_Portfolio\Settings;


use Photography_Portfolio\Contracts\Options_Page_Settings;


class Portfolio_Options_Page implements Options_Page_Settings {


	public function get_page_title() {

		return esc_html__( 'Portfolio Settings', 'MELON_TXT' );

	}

	

	public function set_fields( $cmb ) {

		// Set our CMB2 fields
		$cmb->add_field(
			array(
				'name'    => esc_html__( 'Portfolio Archive Layout', 'MELON_TXT' ),
				'id'      => 'portfolio_layout',
				'type'    => 'select',
				'options' => CMP_Instance()->layouts->available_layouts( 'archive' ),

			)
		);

		// Set our CMB2 fields
		$cmb->add_field(
			array(
				'name'    => esc_html__( 'Single Portfolio Layout', 'MELON_TXT' ),
				'id'      => 'single_portfolio_layout',
				'type'    => 'select',
				'options' => CMP_Instance()->layouts->available_layouts( 'single' ),

			)
		);


	}
}