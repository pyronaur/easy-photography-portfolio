<?php
/**
 *
 * @link              http://colormelon.com
 * @since             1.0.0
 * @package           Photography portfolio
 *
 * @wordpress-plugin
 * Plugin Name:       Photography Portfolio
 * Plugin URI:        http://colormelon.com/plugins/photography-portfolio
 * Description:       The only photography portfolio plugin you'll ever need.
 * Version:           1.0.0
 * Author:            Colormelon, justnorris
 * Author URI:        http://colormelon.com
 * License:           GPL-3.0+
 * License URI:       http://www.gnu.org/licenses/gpl-3.0.txt
 * Text Domain:       MELON_TXT
 */


/**
 * Include Colormelon Photography Portfolio
 */

/**
 * Composer Autoloading
 * Requires PHP 5.3.29+
 */
require_once __DIR__ . '/vendor/autoload.php';

/**
 * Include CMB2
 */
if ( file_exists( __DIR__ . '/vendor/webdevstudios/cmb2/init.php' ) ) {
	require_once __DIR__ . '/vendor/webdevstudios/cmb2/init.php';
}

/**
 * Require the plugin god object.
 */
require_once __DIR__ . '/Colormelon_Photography_Portfolio.php';


/**
 * Template Tags, public functions usage in themes
 */
require_once __DIR__ . '/public/functions/options.php';
require_once __DIR__ . '/public/functions/functions.php';
require_once __DIR__ . '/public/functions/slugs.php';
require_once __DIR__ . '/public/functions/display-tags.php';
require_once __DIR__ . '/public/functions/template-tags.php';


/**
 *
 *
 * CMB2
 *
 *
 */
require_once __DIR__ . '/cmb2.php';


/**
 * Boot Colormelon_Photography_Portfolio
 */
add_action( 'after_setup_theme', 'PP_Instance' );
