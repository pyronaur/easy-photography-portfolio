<?php


namespace Photography_Portfolio\Settings;


/**
 * Class General_Portfolio_Settings
 * @package Photography_Portfolio\Settings
 */
class General_Portfolio_Settings {

	public    $registry;
	protected $defaults = [];
	protected $settings = [];


	/**
	 * General_Portfolio_Settings constructor.
	 */
	public function __construct() {


		$this->registry = new Setting_Registry();

		/**
		 * Allow the defaults to be modified from other themes/plugins
		 * Note: Defaults are only set after the user clicks “Save Changes” in Portfolio Settings.
		 */
		$this->defaults = apply_filters(
			'phort/general_portfolio_settings/defaults',
			[
				'portfolio_layout'        => 'masonry-hovercard',
				'single_portfolio_layout' => 'masonry',
				'archive_description'     => 'disable',
				'portfolio_subtitles'     => 'only_subtitles',
				'popup_gallery'           => 'lightgallery',

			]
		);


		/**
		 * Setup filterable settings
		 */
		$this->settings = apply_filters(
			'phort/general_portfolio_settings/settings',
			[
				'popup_gallery' => [
					'disable'      => esc_html__( 'Disable', 'phort-plugin' ),
					'lightgallery' => esc_html__( 'Enable', 'phort-plugin' ),
				],
			]
		);

		$this->set_fields();

	}



	public function set_fields() {


		$PP = phort_instance();

		$archive_layouts     = $PP->layouts->available_layouts( 'archive' );
		$single_layouts      = $PP->layouts->available_layouts( 'single' );
		$has_layout_settings = ( count( $archive_layouts ) > 1 || count( $single_layouts ) > 1 );


		/**
		 *
		 * ======== Core Settings
		 *
		 */
		$this->registry->add(
			[
				'name' => 'Main',
				'type' => 'title',
				'id'   => 'main_settings_title',
			]
		);

		$this->registry->add(
			[
				'id'               => "portfolio_page",
				'name'             => esc_html__( 'Main Portfolio Page', 'phort-plugin' ),
				'type'             => 'select',
				'show_option_none' => true,
				'options'          => $this->get_all_pages(),
			]
		);

		/**
		 *
		 * ======== Layout Settings
		 *
		 */

		if ( $has_layout_settings ) {
			$this->registry->add(
				[
					'name' => 'Layout',
					'type' => 'title',
					'id'   => 'layout_settings_title',
				]
			);
		}

		/**
		 * Hide "Single Portfolio Layout" Option, if there is only 1 layout available
		 */
		if ( count( $single_layouts ) > 1 ) {
			$this->registry->add(
				[
					'name'    => esc_html__( 'Single Portfolio Layout', 'phort-plugin' ),
					'id'      => 'single_portfolio_layout',
					'type'    => 'select',
					'options' => $single_layouts,
					'default' => $this->defaults['single_portfolio_layout'],

				]
			);
		}

		if ( count( $archive_layouts ) > 1 ) {
			$this->registry->add(
				[
					'name'    => esc_html__( 'Portfolio Archive Layout', 'phort-plugin' ),
					'id'      => 'portfolio_layout',
					'type'    => 'select',
					'options' => $archive_layouts,
					'default' => $this->defaults['portfolio_layout'],

				]
			);
		}


		/**
		 *
		 * ======== Layout Settings
		 *
		 */

		$this->registry->add(
			[
				'name' => 'Other',
				'type' => 'title',
				'id'   => 'misc_settings_title',
			]
		);


		if ( $this->settings_exist( 'popup_gallery' ) ) {
			$this->registry->add(
				[
					'id'      => "popup_gallery",
					'name'    => esc_html__( 'Pop-up Gallery', 'phort-plugin' ),
					'type'    => 'select',
					'default' => $this->defaults['popup_gallery'],
					'options' => $this->settings['popup_gallery'],
				]
			);
		}


		$this->registry->add(
			[
				'id'      => "archive_description",
				'name'    => esc_html__( 'Show Archive Titles & Descriptions', 'phort-plugin' ),
				'desc'    => esc_html__(
					'"Archives" are places like "Categories" and your "Main Portfolio Page".',
					'phort-plugin'
				),
				'type'    => 'select',
				'default' => $this->defaults['archive_description'],
				'options' => [
					'disable' => esc_html__( 'Disable', 'phort-plugin' ),
					'enable'  => esc_html__( 'Enable', 'phort-plugin' ),
				],
			]
		);


		$this->registry->add(
			[
				'id'      => "portfolio_subtitles",
				'name'    => esc_html__( 'Album Subtitle', 'phort-plugin' ),
				'type'    => 'select',
				'default' => $this->defaults['portfolio_subtitles'],
				'options' => [
					'disable'            => esc_html__( 'Disable', 'phort-plugin' ),
					'only_subtitles'     => esc_html__( 'Show Only Subtitle', 'phort-plugin' ),
					'only_count'         => esc_html__( 'Show Only Image Count', 'phort-plugin' ),
					'subtitles_or_count' => esc_html__( 'Show Subtitle or Image Count', 'phort-plugin' ),
				],
			]
		);

		/**
		 * Only add Wrapper Class option if theme has no native Photography Portfolio Support
		 */
		if ( ! phort_has_theme_support() ) {
			$this->registry->add(
				[
					'id'      => "wrapper_class",
					'name'    => esc_html__( 'Wrapper CSS Classes', 'phort-plugin' ),
					'desc'    => esc_html__(
						'Some themes use different wrapper class-names than the standard.
					 You can enter custom CSS classnames here to make the plugin compatible with your theme',
						'phort-plugin'
					),
					'type'    => 'text',
					'default' => '',

				]
			);
		}


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
