<?php

use Photography_Portfolio\Admin_View\Admin_View;
use Photography_Portfolio\Core\Gallery_Attachment_Video_Support;
use Photography_Portfolio\Core\Initialize_Layout_Registry;
use Photography_Portfolio\Core\Query;
use Photography_Portfolio\Core\Register_Post_Type;
use Photography_Portfolio\Frontend\Layout_Factory;
use Photography_Portfolio\Frontend\Layout_Registry;
use Photography_Portfolio\Frontend\Public_View;
use Photography_Portfolio\Frontend\Template;
use Photography_Portfolio\Settings\General_Portfolio_Settings;
use Photography_Portfolio\Settings\Setting_Registry;

/**
 * Colormelon_Photography_Portfolio
 * @package Photography_Portfolio
 * @type    `Singleton` God Object, the worst kind. Yet serves its function.
 *
 */
final class Colormelon_Photography_Portfolio {

	/**
	 * This is a Singleton class
	 * Singletons are almost always bad, surely not this time. Right?....
	 */
	protected static $_instance = NULL;

	/**
	 * All plugin options will be added in the settings
	 * @var Setting_Registry $settings
	 */
	public $settings;


	/**
	 * @var Layout_Registry $layouts
	 * Contains all available portfolio layouts
	 */
	public $layouts;

	/**
	 * @var $query Query
	 * Determines if portfolio is active
	 */
	public $query;

	/**
	 * @var $layout - The current Layout settings
	 */
	public $layout;

	/**
	 * Colormelon Photography Portfolio Version
	 *
	 * @var string
	 */
	private $version = '1.4.3';


	/**
	 * Constructor.
	 */
	public function __construct() {

		define( 'CLM_VERSION', $this->version );

		/**
		 * Everything else is handled in $this->boot(), so that `phort_instance()` is available if needed
		 */

	}


	public function prepare_view() {

		/**
		 * == Boot ==
		 * Either the front or backend
		 */
		if ( is_admin() ) {
			new Admin_View();
		}
		else {
			new Public_View();
		}

		// Trigger `phort/core/loaded` as soon as the plugin is fully loaded
		do_action( 'phort/core/loaded', $this );

	}


	/**
	 * Main Instance.
	 *
	 * Ensures only one instance of Colormelon_Photography_Portfolio is loaded or can be loaded.
	 *
	 * @static
	 * @return Colormelon_Photography_Portfolio instance
	 *
	 * Very Heavily inspired by WooCommerce
	 */
	public static function instance() {

		if ( is_null( self::$_instance ) ) {
			// Create instance
			self::$_instance = new self();

			// Boot immediately
			self::$_instance->initialize();
		}

		return self::$_instance;
	}


	public function load_translations() {

		load_plugin_textdomain( 'photography-portfolio', false, dirname( CLM_ABSPATH ) . '/languages' );
	}


	/**
	 * Cloning is forbidden.
	 */
	public function __clone() {

		_doing_it_wrong( __FUNCTION__, __( "Can't do this thing.", 'photography-portfolio' ), '2.1' );
	}


	/**
	 * Unserializing instances of this class is forbidden.
	 */
	public function __wakeup() {

		_doing_it_wrong( __FUNCTION__, __( "Can't do this thing.", 'photography-portfolio' ), '2.1' );
	}


	/**
	 * Attach "Settings" in plugin action links (in the plugin list)
	 *
	 * @param $links
	 *
	 * @return mixed
	 */
	public function action_links( $links ) {

		$url = get_admin_url( NULL, 'edit.php?post_type=phort_post&page=phort_options' );

		array_unshift(
			$links,
			'<a href="' . esc_url( $url ) . '">' . esc_html__(
				'Settings',
				'photography-portfolio'
			) . '</a>'
		);

		return $links;
	}


	/**
	 * Setup the plugin setting registry and register the available options
	 */
	public function setup_settings() {

		$this->settings = new Setting_Registry();

		// Setup General Settings
		$general_settings = new General_Portfolio_Settings( $this->layouts );

		// Add all settings to the registry
		$this->settings->add_all( $general_settings->get_all() );
	}


	/**
	 * Maybe start loading portfolio template files instead of whatever WordPress was going to do.
	 * This is run @filter `template_include`
	 *
	 * @param $template - Current template path
	 *
	 * @return string
	 */
	public function maybe_load_portfolio_template_files( $template ) {

		/**
		 * Exceptions
		 */
		if ( is_embed() ) {
			return $template;
		}

		/**
		 * If the current query says that this is a portfolio -
		 * Load the portfolio view
		 */
		if ( $this->query->is_portfolio() ) {

			/*
			 * Prepare the layout data
			 */
			$this->layout = Layout_Factory::autoload();

			/*
			 * Return the initial template file
			 */

			$located_template = Template::locate( [ 'wrapper.php', 'photography-portfolio.php' ] );
			if ( $located_template ) {
				return $located_template;
			}

		}


		/**
		 * Return $template if this is not the portfolio or a template was not located
		 */
		return $template;

	}


	/**
	 * Constructor is only going to set up the core
	 */
	protected function initialize() {

		// If there is anything you want to do before the plugin configures itself
		do_action( 'phort/core/prepare', $this );

		$this->query = new Query();

		// Register Layouts
		$this->layouts = Initialize_Layout_Registry::with_defaults();


		$this->register_hooks();
	}


	protected function register_hooks() {

		/**
		 *
		 * Register Post Types
		 *
		 * post_type:   `phort_post`
		 * taxonomy:    `phort_post_category`
		 * Turns out taxonomies have to be registered before the
		 * post type is registered to get pretty URLs like `/portfolio/category/%cat`
		 *
		 * @link https://cnpagency.com/blog/the-right-way-to-do-wordpress-custom-taxonomy-rewrites/
		 *
		 * `add_action` order is improtant here:
		 */
		add_action( 'init', [ 'Photography_Portfolio\Core\Register_Post_Type', 'register_taxonomy' ], 5 );
		add_action( 'init', [ 'Photography_Portfolio\Core\Register_Post_Type', 'register_post_type' ], 5 );

		/*
		 * Setup the settings
		 * Crucial for `phort_get_option` to work properly, which is almost at the core of everything else further down the pipe
		 */

		add_action( 'init', [ $this, 'setup_settings' ], 7 );


		// Load Translations:
		add_action( 'init', [ $this, 'load_translations' ] );

		/**
		 * Load `Admin_View` or `Public_View`
		 */
		add_action( 'init', [ $this, 'prepare_view' ], 30 );

		/*
		 *
		 * This at the core of loading all of the Easy Photography Portfolio template files
		 */
		add_filter( 'template_include', [ $this, 'maybe_load_portfolio_template_files' ], 150 );

		/**
		 * Modify the WP_Query before posts are queried.
		 */
		if ( ! is_admin() ) {
			add_action( 'pre_get_posts', [ $this->query, 'store_original_query' ], 2 );
			add_action( 'pre_get_posts', [ $this->query, 'set_variables' ], 5 );
			add_action( 'pre_get_posts', [ $this->query, 'increase_ppp_limit' ], 25 );
		}

		/**
		 *
		 * == Miscellaneous ==
		 *
		 */

		// Maybe add video support
		add_action( 'init', [ 'Photography_Portfolio\Core\Gallery_Attachment_Video_Support', 'maybe_add_hooks' ] );

		// Add "Settings" to plugin links in plugin page
		add_filter( 'plugin_action_links_' . CLM_PLUGIN_BASENAME, [ $this, 'action_links' ] );


	}


}
