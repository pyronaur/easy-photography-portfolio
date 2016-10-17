<?php


namespace Photography_Portfolio\Frontend;


class Template {

	public static function get( $slug, $name = NULL ) {

		$template = false;


		/**
		 * Try to look for slug-name.php first
		 */
		if ( $name ) {
			$template = self::locate_template( "{$slug}-{$name}.php" );
		}

		if ( ! $template ) {
			$template = self::locate_template( "{$slug}.php" );
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


	public static function locate_template( $filename ) {

		$debug_mode = false;
		$template   = false;

		// Get __THEME__/portfolio/filename.php
		if ( ! $debug_mode ) {
			$template = locate_template( CLM_THEME_PATH . $filename );
		}

		// Get __PLUGIN__/templates/filename.php
		if ( ! $template && file_exists( CLM_PLUGIN_THEME_PATH . $filename ) ) {
			$template = CLM_PLUGIN_THEME_PATH . $filename;
		}

		return $template;
	}

}