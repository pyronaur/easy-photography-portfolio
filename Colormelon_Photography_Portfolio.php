<?php

use Photography_Portfolio\Admin\Options_Page;
use Photography_Portfolio\Core\Register_Post_Type;
use Photography_Portfolio\Core\Template_Loader;
use Photography_Portfolio\Frontend\Frontend;
use Photography_Portfolio\Frontend\Layout\Archive\Masonry_Hovercard\Archive_Masonry_Hovercard_Layout;
use Photography_Portfolio\Frontend\Layout\Single\Masonry\Single_Masonry_Layout;
use Photography_Portfolio\Frontend\Layout\Single\Packery\Single_Packery_layout;
use Photography_Portfolio\Frontend\Layout_Registry;
use Photography_Portfolio\Settings\Portfolio_Options_Page;

/**
 * Class Portfolio
 * @package Portfolio
 *
 *          Looks like this is going to become the God Class.
 *          Let's refactor this later
 *          Of course we will.
 *
 */
final class Colormelon_Photography_Portfolio {

	/**
	 * This is a Singleton class
	 *
	 * Singletons are almost always bad, surely not this time. Right?....
	 *
	 * @var Core
	 */
	protected static $_instance = NULL;
	/**
	 * @var Layout_Registry $layouts
	 * Contains all available portfolio layouts
	 */
	public $layouts;
	/**
	 * Colormelon Photography Portfolio Version
	 *
	 * @var stringÅ
	 */
	private $version = '1.0.0';
	private $post_type;

	private $template_loader;

	private $options = false;


	/**
	 * Constructor.
	 */
	public function __construct() {

		// If there is anything you want to do before the plugin configures itself
		do_action( 'cmp/prepare', $this );

		$this->define_constants();

		$this->post_type       = new Register_Post_Type();
		$this->template_loader = new Template_Loader();


		// Setup sub-classes
		$this->layouts = new Layout_Registry();


		// Initialize & Configure
		$this->init_hooks();
		$this->register_layouts();


		/**
		 * Boot Front-end
		 */
		new Frontend();

		if ( is_admin() ) {
			$this->options = new Options_Page( new Portfolio_Options_Page() );
		}
		
		// Trigger `cmp/loaded` as soon as the plugin is fully loaded
		do_action( 'cmp/loaded', $this );

	}


	/**
	 * Main Instance.
	 *
	 * Ensures only one instance of WooCommerce is loaded or can be loaded.
	 *
	 * @static
	 * @return Core instance
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

		_doing_it_wrong( __FUNCTION__, __( "Can't do this thing.", 'cmp' ), '2.1' );
	}


	/**
	 * Unserializing instances of this class is forbidden.
	 */
	public function __wakeup() {

		_doing_it_wrong( __FUNCTION__, __( "Can't do this thing.", 'cmp' ), '2.1' );
	}


	/**
	 * Hook into actions and filters.
	 */
	private function init_hooks() {

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


	/**
	 *
	 */
	private function register_layouts() {


		/**
		 * Portfolio Archive
		 */
		$this->layouts->add(

			Archive_Masonry_Hovercard_Layout::class,
			'archive',
			'masonry-hovercard',
			esc_html__( 'Masonry with hover', 'MELON_TXT' )

		);

		/**
		 * Single Portfolio
		 */
		$this->layouts->add(

			Single_Masonry_Layout::class,
			'single',
			'masonry',
			esc_html__( 'Masonry', 'MELON_TXT' )

		);

		$this->layouts->add(

			Single_Packery_layout::class,
			'single',
			'packery',
			esc_html__( 'Cropped Masonry', 'MELON_TXT' )

		);

	}


}


