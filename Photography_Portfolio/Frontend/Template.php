<?php


namespace Photography_Portfolio\Frontend;


class Template {

	public static function get( $slug, $name = NULL ) {


		$debug_mode    = false;
		$template      = '';
		$full_filename = "{$slug}-{$name}.php";
		$slug_filename = "{$slug}.php";



		// Get __THEME__/portfolio/slug-name.php
		if ( $name && ! $debug_mode ) {
			$template = locate_template( CLM_THEME_PATH . $full_filename );
		}

		// Get __PLUGIN__/templates/slug-name.php
		if ( ! $template && $name && file_exists( CLM_PLUGIN_THEME_PATH . $full_filename ) ) {
			$template = CLM_PLUGIN_THEME_PATH . $full_filename;
		}


		/**
		 *  slug-name.php not found, look for slug.php:
		 */

		// Get __THEME__/portfolio/slug.php
		if ( ! $template && ! $debug_mode ) {
			$template = locate_template( CLM_THEME_PATH . $slug_filename );
		}

		// Get __PLUGIN__/templates/slug.php
		if ( ! $template && file_exists( CLM_PLUGIN_THEME_PATH . $slug_filename ) ) {
			$template = CLM_PLUGIN_THEME_PATH . $slug_filename;
		}

		

		// Allow 3rd party plugins to filter template file from their plugin.
		$template = apply_filters( 'cmp/template/get', $template, $slug, $name );


		/**
		 * Load Template if template is found
		 */
		if ( $template ) {
			load_template( $template, false );
		}

	}

}