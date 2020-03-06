<?php


namespace Photography_Portfolio\Settings;


use Photography_Portfolio\Frontend\Layout_Registry;


/**
 * Class General_Portfolio_Settings
 * @package Easy_Photography_Portfolio\Settings
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
         * @TODO       : Remove at version 1.5.0
         *
         */
        $this->defaults = apply_filters_deprecated(
            'phort/general_portfolio_settings/defaults',
            [
                [
                    'portfolio_layout'        => 'masonry-hovercard',
                    'single_portfolio_layout' => 'masonry',
                    'archive_description'     => 'disable',
                    'archive_category'        => 'disable',
                    'portfolio_subtitles'     => 'only_subtitles',
                    'popup_gallery'           => 'photoswipe',

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
         * @TODO       : Remove at version 1.5.0
         */
        $this->settings = apply_filters_deprecated(
            'phort/general_portfolio_settings/settings',
            [
                [
                    'popup_gallery' => [
                        'disable'      => esc_html__( 'Disable', 'photography-portfolio' ),
                        'lightgallery' => esc_html__( 'LightGallery', 'photography-portfolio' ),
                        'photoswipe'   => esc_html__( 'PhotoSwipe (recommended)', 'photography-portfolio' ),
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
            'name' => esc_html__( 'Main', 'photography-portfolio' ),
            'type' => 'title',
            'id'   => 'main_settings_title',
        ];

        $settings[] = [
            'id'               => "portfolio_page",
            'name'             => esc_html__( 'Portfolio Home Page', 'photography-portfolio' ),
            'type'             => 'select',
            'show_option_none' => true,
            'options'          => $this->get_all_pages(),
        ];

        /**
         * Add custom home page query in themes where the theme isn't already runnign a custom query
         */
        if ( ! class_exists( '\Theme\Page_Template_Query_Filter' ) ) {

            $setting_requires_homepage = esc_html__(
                'Please note that this setting will only work if the "Portfolio Home Page" is also set as the home page in "Settings" -> "General" -> "Reading" -> "Front page displays"',
                'photography-portfolio'
            );

            $settings[] = [
                'id'      => "portfolio_page_displays",
                'name'    => esc_html__( 'In Portfolio Home Page', 'photography-portfolio' ),
                'type'    => 'select',
                'default' => 'all',
                'options' => [
                    'all'                       => esc_html__( 'Show all Portfolio entries', 'photography-portfolio' ),
                    'phort_post_category'       => esc_html__( 'Show a Portfolio category', 'photography-portfolio' ),
                    'phort_post'                => esc_html__( 'Show a single Portfolio entry', 'photography-portfolio' ),
                ],
            ];

            $settings[] = [
                'id'               => "portfolio_home_category",
                'name'             => esc_html__( 'Category to Display', 'photography-portfolio' ),
                'type'             => 'select',
                'show_option_none' => true,
                'options'          => $this->get_portfolio_categories(),
                'desc'             => $setting_requires_homepage,
            ];

            $settings[] = [
                'id'               => "portfolio_home_entry",
                'name'             => esc_html__( 'Portfolio Entry to Display', 'photography-portfolio' ),
                'type'             => 'select',
                'show_option_none' => true,
                'options'          => $this->get_portfolio_entries(),
                'desc'             => $setting_requires_homepage,
            ];
        }

	    $settings[] = [
		    'id'      => 'archive_category',
		    'name'    => esc_html__( 'Show Category Navigation', 'photography-portfolio' ),
		    'type'    => 'select',
		    'default' => $this->defaults['archive_category'],
		    'options' => [
			    'disable' => esc_html__( 'Disable', 'photography-portfolio' ),
			    'enable'  => esc_html__( 'Enable', 'photography-portfolio' ),
		    ],
	    ];

        /**
         *
         * ======== Layout Settings
         *
         */

        if ( $has_layout_settings ) {
            $settings[] = [
                'name' => esc_html__( 'Layout', 'photography-portfolio' ),
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
         * ======== Pop-up Gallery Settings
         *
         */

        if ( $this->settings_exist( 'popup_gallery' ) ) {

            $settings[] = [
                'name' => esc_html__( 'Pop-up Gallery Settings', 'photography-portfolio' ),
                'type' => 'title',
                'id'   => 'popup_gallery_settings_title',
            ];


            $settings[] = [
                'id'      => "popup_gallery",
                'name'    => esc_html__( 'Pop-up Gallery', 'photography-portfolio' ),
                'type'    => 'select',
                'default' => $this->defaults['popup_gallery'],
                'options' => $this->settings['popup_gallery'],
                'desc'    => '<span>' . wp_kses(
                        __(
                            '<b>PhotoSwipe</b> is recommended. However, if you need video support or gallery thumbnails, use <b>lightGallery</b>.',
                            'photography-portfolio'
                        )
                        ,
                        // Allow <a>, <br>, <b>
                        [ 'br' => [], 'b' => [] ]
                    ) . '</span>',

            ];

            $settings[] = [
                'id'      => "lg_thumbnails",
                'name'    => esc_html__( 'Pop-up Gallery: Thumbnails', 'photography-portfolio' ),
                'type'    => 'select',
                'default' => 'show',
                'options' => [
                    'disable' => esc_html__( 'Disable', 'photography-portfolio' ),
                    'hide'    => esc_html__( 'Hide by default', 'photography-portfolio' ),
                    'show'    => esc_html__( 'Show by default', 'photography-portfolio' ),
                ],
            ];
        }


        /**
         *
         * ======== Other Settings
         *
         */
        $settings[] = [
            'name' => esc_html__( 'Titles & Descriptions', 'photography-portfolio' ),
            'type' => 'title',
            'id'   => 'misc_settings_title',
        ];


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
            'id'      => "gallery_captions",
            'name'    => esc_html__( 'Image Captions', 'photography-portfolio' ),
            'type'    => 'select',
            'default' => 'show',
            'options' => [
                'hide'     => esc_html__( 'Hide', 'photography-portfolio' ),
                'show'     => esc_html__( 'Show only in pop-up galleries', 'photography-portfolio' ),
                'show_all' => esc_html__( 'Always show ', 'photography-portfolio' ),
            ],
        ];


        /**
         * Only add Wrapper Class option if theme has no native Photography Portfolio Support
         */
        if ( ! phort_has_theme_support() ) {

            $settings[] = [
                'name' => esc_html__( 'Theme Compatibility', 'photography-portfolio' ),
                'type' => 'title',
                'id'   => 'theme_compatibility_settings_title',
            ];

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

        /*
         * Don't execute on the front-end
         */
        if ( ! is_admin() ) {
            return [];
        }

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


    /**
     * Get all WordPress Pages and return an array that will direclty fit in a select field.
     * @return array
     */
    public function get_portfolio_categories() {

        /*
         * Don't execute on the front-end
         */
        if ( ! is_admin() ) {
            return [];
        }

        $terms = [];

        foreach ( get_terms( 'phort_post_category' ) as $taxonomy ) {
            $terms[ (int) $taxonomy->term_id ] = esc_html( $taxonomy->name );
        }

        return $terms;
    }


    /**
     * Get all WordPress Pages and return an array that will direclty fit in a select field.
     * @return array
     */
    public function get_portfolio_entries() {

        /*
         * Don't execute on the front-end
         */
        if ( ! is_admin() ) {
            return [];
        }

        $args = [
            'posts_per_page' => - 1,
            'post_type'      => 'phort_post',
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
