<?php


namespace Photography_Portfolio\Core;


class Template_Loader {


	public static function load( $template ) {

		/**
		 * Exceptions
		 */
		if ( is_embed() ) {
			return $template;
		}


		$portfolio = PP_Instance();


		/**
		 * Single Portfolio Entry
		 */
		if ( $portfolio->query->is_single() ) {
			return self::load_file( 'single-portfolio' );
		}

		/**
		 * Taxonomies ( Portfolio Categories )
		 */
		if ( $portfolio->query->is_category() ) {

			$term = get_queried_object();

			if ( is_tax( 'portfolio_category' ) ) {
				$file = 'taxonomy-' . $term->taxonomy;
			}
			else {
				$file = 'archive-product';
			}

			return self::load_file( $file );


		}


		/**
		 * Full Archive
		 */
		if ( $portfolio->query->is_archive() ) {
			return self::load_file( 'archive-portfolio' );
		}

		/**
		 * Return the default template if nothing stuck
		 */
		return $template;

	}


	public static function load_file( $filename ) {

		$files = array( 'photography-portfolio.php' );

		$full_filename = $filename . '.php';

		$files[] = $full_filename;
		$files[] = CLM_THEME_PATH . $full_filename;


		return self::locate_template( $files, $full_filename );

	}


	public static function locate_template( $files, $full_filename ) {

		/**
		 * Look for template in theme folder
		 */
		$template = locate_template( array_unique( $files ) );


		/**
		 * If theme doesn't have it, use plugin fallback
		 */
		if ( ! $template ) {
			$template = CLM_PLUGIN_THEME_PATH . $full_filename;
		}

		return $template;
	}


}