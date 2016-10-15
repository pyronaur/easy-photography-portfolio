<?php


if ( ! function_exists( "cmp_get_option" ) ) {
	/**
	 * Easy way to get option values
	 *
	 * @param      $option
	 * @param null $default
	 *
	 * @return mixed|null
	 */
	function cmp_get_option( $option, $default = NULL ) {

		$value = cmb2_get_option( 'cmp_options', $option );

		if ( ! $value && $default !== NULL ) {
			return $default;
		}

		return $value;


	}
}


if ( ! function_exists( "cmp_get_layout" ) ) {

	/**
	 *
	 * Get current layout name
	 *
	 */
	function cmp_get_layout() {

		return sanitize_html_class( cmp_get_option( 'single_portfolio_layout' ) );
	}

}


if ( ! function_exists( "cmp_get_archive_layout" ) ) {

	/**
	 *
	 * Get current layout name
	 *
	 */
	function cmp_get_archive_layout() {

		return sanitize_html_class( cmp_get_option( 'portfolio_layout' ) );
	}

}

