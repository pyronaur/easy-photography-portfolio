<?php


namespace Photography_Portfolio\Core;


use Photography_Portfolio\Frontend\Template;

class Template_Loader {


	public static function load( $template ) {

		/**
		 * Exceptions
		 */
		if ( is_embed() ) {
			return $template;
		}


		/**
		 * Get main instance
		 */
		$portfolio = PP_Instance();


		/**
		 * If current page load isn't portfolio - don't bother.
		 */
		if ( ! $portfolio->query->is_portfolio() ) {
			return $template; // exit
		}


		/**
		 * Single Portfolio Entry
		 *
		 * @loads single-portfolio.php
		 */
		if ( $portfolio->query->is_single() ) {
			return Template::locate( 'single-portfolio.php' );
		}


		/**
		 * Taxonomies ( Portfolio Categories )
		 *
		 * @loads taxonomy-{term}.php
		 * @loads archive-portfolio.php
		 */
		if ( $portfolio->query->is_category() ) {

			$files = [ ];
			$term  = get_queried_object();

			if ( is_tax( 'portfolio_category' ) ) {
				$files[] = 'taxonomy-' . $term->taxonomy . '.php';
			}
			$files[] = 'archive-portfolio.php';

			return Template::locate( $files );


		}

		/**
		 * Archive
		 *
		 * @loads archive-portfolio.php
		 */
		if ( $portfolio->query->is_archive() ) {
			return Template::locate( 'archive-portfolio.php' );
		}


		/**
		 * Return the default template if nothing stuck
		 */
		return $template;

	}


}