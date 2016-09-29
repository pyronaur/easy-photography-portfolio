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

require_once __DIR__ . '/vendor/autoload.php';

require_once __DIR__ . '/Colormelon_Photography_Portfolio.php';
require_once __DIR__ . '/public/functions/functions.php';


/**
 * Boot
 */
CMP_Instance();
