<?php

use Photography_Portfolio\Admin\Options_Page;
use Photography_Portfolio\Admin\PP_Post_Meta;
use Photography_Portfolio\Core\Initialize_Layout_Registry;
use Photography_Portfolio\Core\Query;
use Photography_Portfolio\Core\Register_Post_Type;
use Photography_Portfolio\Core\Template_Loader;
use Photography_Portfolio\Frontend\Frontend;
use Photography_Portfolio\Frontend\Layout_Factory;
use Photography_Portfolio\Frontend\Layout_Registry;
use Photography_Portfolio\Settings\Portfolio_Options_Page;

/**
 * Colormelon_Photography_Portfolio
 * @package Photography_Portfolio
 * @type Singleton God Object, the worst kind. Yet serves its function.
 *
 */
final class Colormelon_Photography_Portfolio {

	/**
	 * This is a Singleton class
	 * Singletons are almost always bad, surely not this time. Right?....
	 */
	protected static $_instance = NULL;


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
	 * Colormelon Photography Portfolio Version
	 *
	 * @var string
	 */
	private $version = '1.0.0';


	private $post_type;
	private $template_loader;
	private $options   = false;
	private $metaboxes = false;


	/**
	 * Constructor.
	 */
	public function __construct() {

		// Constants should be defined before anything else happens.
		$this->define_constants();

		// If there is anything you want to do before the plugin configures itself
		do_action( 'pp/core/prepare', $this );

		// Initialize Core
		$this->post_type       = new Register_Post_Type();
		$this->query           = new Query();
		$this->template_loader = new Template_Loader();


		// Setup sub-classes
		// Register Layouts
		$this->layouts = Initialize_Layout_Registry::with_defaults();


		// Initialize Hooks
		$this->hooks();

		/**
		 * == Boot ==
		 * Either the front or backend
		 */
		if ( is_admin() ) {
			$this->options   = new Options_Page( new Portfolio_Options_Page() );
			$this->metaboxes = new PP_Post_Meta();
		}
		else {
			new Frontend();
		}

		// Trigger `pp/core/loaded` as soon as the plugin is fully loaded
		do_action( 'pp/core/loaded', $this );

	}


	/**
	 * Define CLM Constants
	 */
	private function define_constants() {

		define( 'CLM_VERSION', $this->version );
		define( 'CLM_ABSPATH', __DIR__ . '/' );
		define( 'CLM_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );
		define( 'CLM_PLUGIN_DIR_URL', plugin_dir_url( __FILE__ ) );

		define( 'CLM_THEME_PATH', 'portfolio/' );
		define( 'CLM_PLUGIN_THEME_PATH', CLM_ABSPATH . '/public/templates/' );

	}


	public function hooks() {

		/*
		 * Load Photography Portfolio templates when needed:
		 */
		add_filter( 'template_include', array( Template_Loader::class, 'load' ) );


		/**
		 * Autoload Archive Data
		 */
		add_action(
			'pp/get_template/archive/layout',
			function () {

				Layout_Factory::autoload( 'archive', pp_slug_archive() );
			}
		);

		/**
		 * Autoload Single Portfolio entry data
		 */
		add_action(
			'pp/get_template/single/layout',
			function () {

				Layout_Factory::autoload( 'single', pp_slug_single() );
			}
		);

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
			self::$_instance = new self();
		}

		return self::$_instance;
	}


	/**
	 * Cloning is forbidden.
	 */
	public function __clone() {

		_doing_it_wrong( __FUNCTION__, __( "Can't do this thing.", 'pp-plugin' ), '2.1' );
	}


	/**
	 * Unserializing instances of this class is forbidden.
	 */
	public function __wakeup() {

		_doing_it_wrong( __FUNCTION__, __( "Can't do this thing.", 'pp-plugin' ), '2.1' );
	}


}
