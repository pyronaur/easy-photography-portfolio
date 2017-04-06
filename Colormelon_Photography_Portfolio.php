<?php

use Photography_Portfolio\Admin_View\Admin_View;
use Photography_Portfolio\Admin_View\Welcome_Message;
use Photography_Portfolio\Core\Add_Attachment_Meta;
use Photography_Portfolio\Core\Initialize_Layout_Registry;
use Photography_Portfolio\Core\Query;
use Photography_Portfolio\Core\Register_Post_Type;
use Photography_Portfolio\Frontend\Layout_Factory;
use Photography_Portfolio\Frontend\Layout_Registry;
use Photography_Portfolio\Frontend\Public_View;

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
	private $version = '1.1.3';


	private $attachment_meta;


	/**
	 * Constructor.
	 */
	public function __construct() {

		define( 'CLM_VERSION', $this->version );

		// If there is anything you want to do before the plugin configures itself
		do_action( 'phort/core/prepare', $this );

		/**
		 * Register post types on `init` action
		 * post_type:   `phort_post`
		 * taxonomy:    `phort_post_category`
		 */
		Register_Post_Type::initialize();

		$this->attachment_meta = new Add_Attachment_Meta();
		$this->query           = new Query();


		// Setup sub-classes
		// Register Layouts
		$this->layouts = Initialize_Layout_Registry::with_defaults();


		// Initialize Hooks
		$this->hooks();


		// Trigger `phort/core/loaded` as soon as the plugin is fully loaded
		do_action( 'phort/core/loaded', $this );
	}


	public function hooks() {

		/*
		 * Load Photography Portfolio templates when needed:
		 */
		add_action( 'init', [ $this, 'load_view' ] );
		add_filter( 'template_include', [ 'Photography_Portfolio\Core\Template_Loader', 'load' ], 150 );
		add_filter( 'plugin_action_links_' . CLM_PLUGIN_BASENAME, [ $this, 'action_links' ] );


		/**
		 * Autoload Archive Data
		 */
		add_action(
			'phort/load_template/archive/layout',
			function () {

				Layout_Factory::autoload( 'archive', phort_slug_archive() );
			}
		);

		/**
		 * Autoload Single Portfolio entry data
		 */
		add_action(
			'phort/load_template/single/layout',
			function () {

				Layout_Factory::autoload( 'single', phort_slug_single() );
			}
		);

	}


	public function load_view() {

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

		_doing_it_wrong( __FUNCTION__, __( "Can't do this thing.", 'phort-plugin' ), '2.1' );
	}


	/**
	 * Unserializing instances of this class is forbidden.
	 */
	public function __wakeup() {

		_doing_it_wrong( __FUNCTION__, __( "Can't do this thing.", 'phort-plugin' ), '2.1' );
	}


	public function action_links( $links ) {

		$links[] = '<a href="' . esc_url( get_admin_url( NULL, 'edit.php?post_type=phort_post&page=phort_options' ) ) . '">Settings</a>';

		return $links;
	}


}
