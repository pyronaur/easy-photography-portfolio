<?php


namespace Photography_Portfolio\Core;


class Template_Loader {

	/**
	 * Router constructor.
	 */
	public function __construct() {

		//		add_action( 'template_redirect', array( $this, 'template_loader' ) );
		add_filter( 'template_include', array( $this, 'template_loader' ) );
	}


	public function template_loader( $template ) {

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
			return $this->load_file( 'single-portfolio' );
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

			return $this->load_file( $file );


		}


		/**
		 * Full Archive
		 */
		if ( $portfolio->query->is_archive() ) {
			return $this->load_file( 'archive-portfolio' );
		}

		/**
		 * Return the default template if nothing stuck
		 */
		return $template;

	}


	public function load_file( $filename ) {

		$files = array( 'photography-portfolio.php' );

		$full_filename = $filename . '.php';

		$files[] = $full_filename;
		$files[] = CLM_THEME_PATH . $full_filename;


		return $this->locate_template( $files, $full_filename );

	}


	public function locate_template( $files, $full_filename ) {

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