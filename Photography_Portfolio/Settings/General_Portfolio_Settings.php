<?php


namespace Photography_Portfolio\Settings;


use Photography_Portfolio\Frontend\Layout_Registry;


/**
 * Class General_Portfolio_Settings
 * @package Photography_Portfolio\Settings
 */
class General_Portfolio_Settings {

	protected $defaults = [];
	protected $settings = [];


	/**
	 * General_Portfolio_Settings constructor.
	 */
	public function __construct( Layout_Registry $layout_registry ) {

		$this->layout_registry = $layout_registry;

		/**
		 * Don't modify defaults through `phort/general_portfolio_settings/defaults`
		 * Use phort_instance()->registry instead
		 *
		 * @deprecated 1.1.4 Use `phort/core/loaded` to wait for the plugin to setup, then modify `phort_instance()->settings`
		 * @TODO       : Remove at version 1.2.0
		 *
		 */
		$this->defaults = apply_filters_deprecated(
			'phort/general_portfolio_settings/defaults',
			[
				[
					'portfolio_layout'        => 'masonry-hovercard',
					'single_portfolio_layout' => 'masonry',
					'archive_description'     => 'disable',
					'portfolio_subtitles'     => 'only_subtitles',
					'popup_gallery'           => 'lightgallery',

				],
			],
			'1.1.4',
			'phort_set_defaults()',
			'Use add_action("phort/core/loaded"); and `phort_instance()->settings;` instead to modify settings'
		);


		/**
		 * Setup filterable settings
		 *
		 * @deprecated 1.1.4 Use `phort/core/loaded` instead
		 * @TODO       : Remove at version 1.2.0
		 */
		$this->settings = apply_filters_deprecated(
			'phort/general_portfolio_settings/settings',
			[
				[
					'popup_gallery' => [
						'disable'      => esc_html__( 'Disable', 'photography-portfolio' ),
						'lightgallery' => esc_html__( 'Enable', 'photography-portfolio' ),
					],
				],
			],
			'1.1.4',
			'phort_instance()->settings',
			'Use add_action("phort/core/loaded"); and `phort_instance()->settings;` instead to modify settings'
		);

	}


	public function get_all() {

		$settings = [];

		$archive_layouts     = $this->layout_registry->available_layouts( 'archive' );
		$single_layouts      = $this->layout_registry->available_layouts( 'single' );
		$has_layout_settings = ( count( $archive_layouts ) > 1 || count( $single_layouts ) > 1 );


		/**
		 *
		 * ======== Core Settings
		 *
		 */
		$settings[] = [
			'name' => 'Main',
			'type' => 'title',
			'id'   => 'main_settings_title',
		];

		$settings[] = [
			'id'               => "portfolio_page",
			'name'             => esc_html__( 'Main Portfolio Page', 'photography-portfolio' ),
			'type'             => 'select',
			'show_option_none' => true,
			'options'          => $this->get_all_pages(),
		];

		/**
		 *
		 * ======== Layout Settings
		 *
		 */

		if ( $has_layout_settings ) {
			$settings[] = [
				'name' => 'Layout',
				'type' => 'title',
				'id'   => 'layout_settings_title',
			];
		}

		/**
		 * Hide "Single Portfolio Layout" Option, if there is only 1 layout available
		 */
		if ( count( $single_layouts ) > 1 ) {
			$settings[] = [
				'name'    => esc_html__( 'Single Portfolio Layout', 'photography-portfolio' ),
				'id'      => 'single_portfolio_layout',
				'type'    => 'select',
				'options' => $single_layouts,
				'default' => $this->defaults['single_portfolio_layout'],

			];
		}

		if ( count( $archive_layouts ) > 1 ) {
			$settings[] = [
				'name'    => esc_html__( 'Portfolio Archive Layout', 'photography-portfolio' ),
				'id'      => 'portfolio_layout',
				'type'    => 'select',
				'options' => $archive_layouts,
				'default' => $this->defaults['portfolio_layout'],

			];
		}


		/**
		 *
		 * ======== Layout Settings
		 *
		 */

		$settings[] = [
			'name' => 'Other',
			'type' => 'title',
			'id'   => 'misc_settings_title',
		];


		if ( $this->settings_exist( 'popup_gallery' ) ) {
			$settings[] = [
				'id'      => "popup_gallery",
				'name'    => esc_html__( 'Pop-up Gallery', 'photography-portfolio' ),
				'type'    => 'select',
				'default' => $this->defaults['popup_gallery'],
				'options' => $this->settings['popup_gallery'],
			];
		}


		$settings[] = [
			'id'      => "archive_description",
			'name'    => esc_html__( 'Show Archive Titles & Descriptions', 'photography-portfolio' ),
			'desc'    => esc_html__(
				'"Archives" are places like "Categories" and your "Main Portfolio Page".',
				'photography-portfolio'
			),
			'type'    => 'select',
			'default' => $this->defaults['archive_description'],
			'options' => [
				'disable' => esc_html__( 'Disable', 'photography-portfolio' ),
				'enable'  => esc_html__( 'Enable', 'photography-portfolio' ),
			],
		];


		$settings[] = [
			'id'      => "portfolio_subtitles",
			'name'    => esc_html__( 'Album Subtitle', 'photography-portfolio' ),
			'type'    => 'select',
			'default' => $this->defaults['portfolio_subtitles'],
			'options' => [
				'disable'            => esc_html__( 'Disable', 'photography-portfolio' ),
				'only_subtitles'     => esc_html__( 'Show Only Subtitle', 'photography-portfolio' ),
				'only_count'         => esc_html__( 'Show Only Image Count', 'photography-portfolio' ),
				'subtitles_or_count' => esc_html__( 'Show Subtitle or Image Count', 'photography-portfolio' ),
			],
		];


		$settings[] = [
			'id'      => "lg_thumbnails",
			'name'    => esc_html__( 'Popup Gallery Thumbnails', 'photography-portfolio' ),
			'type'    => 'select',
			'default' => 'show',
			'options' => [
				'disable' => esc_html__( 'Disable', 'photography-portfolio' ),
				'hide'    => esc_html__( 'Hide by default', 'photography-portfolio' ),
				'show'    => esc_html__( 'Show by default', 'photography-portfolio' ),
			],
		];

		/**
		 * Only add Wrapper Class option if theme has no native Photography Portfolio Support
		 */
		if ( ! phort_has_theme_support() ) {
			$settings[] = [
				'id'      => "wrapper_class",
				'name'    => esc_html__( 'Wrapper CSS Classes', 'photography-portfolio' ),
				'desc'    => esc_html__(
					'Some themes use different wrapper class-names than the standard.
					 You can enter custom CSS classnames here to make the plugin compatible with your theme',
					'photography-portfolio'
				),
				'type'    => 'text',
				'default' => '',

			];
		}


		return $settings;
	}


	/**
	 * Get all WordPress Pages and return an array that will direclty fit in a select field.
	 * @return array
	 */
	public function get_all_pages() {

		$args = [
			'posts_per_page' => - 1,
			'post_type'      => 'page',
			'post_status'    => 'publish',
		];

		$pages = [];

		foreach ( get_posts( $args ) as $post ) {
			$pages[ (int) $post->ID ] = esc_html( $post->post_title );
		}

		return $pages;
	}


	public function settings_exist( $setting ) {

		return ( ! empty( $this->settings[ $setting ] ) );

	}
}
