<?php
/**
 * @package           Photography portfolio
 * @link              http://colormelon.com
 *
 * @wordpress-plugin
 * Plugin Name:       Easy Photography Portfolio
 * Plugin URI:        http://colormelon.com/plugins/photography-portfolio
 * Description:       Add a photography portfolio to any WordPress theme. Designed for Photographers, yet made with theme developers in mind.
 * Version:           1.3.0
 * Author:            Colormelon, justnorris
 * Author URI:        http://colormelon.com
 * License:           GPL-3.0+
 * License URI:       http://www.gnu.org/licenses/gpl-3.0.txt
 * Text Domain:       photography-portfolio
 * Domain Path:       /languages
 */
/**
 * This file should work without errors on PHP 5.2.17
 * Use this instead of __DIR__
 */
$__DIR = dirname( __FILE__ );


/**
 * Define Constants
 */
define( 'CLM_ABSPATH', $__DIR . '/' );
define( 'CLM_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );
define( 'CLM_PLUGIN_DIR_URL', plugin_dir_url( __FILE__ ) );

define( 'CLM_THEME_PATH', 'photography-portfolio/' );
define( 'CLM_PLUGIN_THEME_PATH', CLM_ABSPATH . 'public/templates/' );


/**
 * Require PHP 5.4
 * Instantly auto-deactivate if plugin requirements are not met
 */
if ( version_compare( phpversion(), '5.4', '<' ) ) {

	include( ABSPATH . "wp-includes/pluggable.php" );
	require_once $__DIR . '/php-require-54.php';

	$PP_Requre_PHP54 = new Photography_Portfolio_Require_PHP54();

	function phort_auto_deactivate() {

		deactivate_plugins( plugin_basename( __FILE__ ) );
	}

	if ( current_user_can( 'activate_plugins' ) ) {
		add_action( 'admin_notices', array( &$PP_Requre_PHP54, 'admin_notice' ) );
		add_action( 'admin_init', 'phort_auto_deactivate' );
	}
}



// ============================================================================
//  Initialize Photography Portfolio
// ============================================================================
else {

	/**
	 * Setup Autoloading
	 */
	require_once $__DIR . '/vendor/autoload.php';


	/**
	 * Include CMB2
	 */
	if ( file_exists( $__DIR . '/vendor/webdevstudios/cmb2/init.php' ) ) {
		require_once $__DIR . '/vendor/webdevstudios/cmb2/init.php';
	}


	/**
	 * Require the Plugin God object.
	 */
	require_once $__DIR . '/Colormelon_Photography_Portfolio.php';


	/**
	 * Template Tags, public functions usage in themes
	 */
	require_once $__DIR . '/public/functions/options.php';
	require_once $__DIR . '/public/functions/functions.php';
	require_once $__DIR . '/public/functions/slugs.php';
	require_once $__DIR . '/public/functions/template-tags.php';
	require_once $__DIR . '/public/functions/hooks.php';


	/**
	 * Add CMB2 Symlinks support in development environments
	 */
	if ( defined( "WP_DEBUG" ) && WP_DEBUG ) {
		require_once $__DIR . '/cmb-symlinks.php';
	}


	/**
	 * Flush permalinks after plugin is activated
	 */
	// phort_plugin_activation_hook lives here:
	require_once $__DIR . '/activation-hooks.php';

	// register_activation_hook is best called from this file
	register_activation_hook( __FILE__, 'phort_plugin_activation_hook' );


	/**
	 * 3rd party plugins & themes compatibility
	 *
	 * @since 1.1.2
	 */
	require_once $__DIR . '/compatibility/compatibility.php';


	/**
	 * Boot Colormelon_Photography_Portfolio
	 */
	add_action( 'after_setup_theme', 'phort_instance', 50 );

}