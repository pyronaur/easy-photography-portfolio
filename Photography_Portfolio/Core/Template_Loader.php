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
		 * Load wrapper if this is portfolio
		 */
		if ( PP_Instance()->query->is_portfolio() ) {

			return Template::locate( [ 'wrapper.php', 'photography-portfolio.php' ] );

		}


		/**
		 * Return the default template if nothing stuck
		 */
		return $template;

	}


}