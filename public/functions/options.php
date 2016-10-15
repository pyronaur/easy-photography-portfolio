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


		/**
		 * Priority #1: `apply_filters()`
		 * Allow quick override through WP Filters
		 *
		 * Filters have been touched if `apply_filters()` returns anything else than `[undefined]`
		 * In that case, return that value
		 */
		$value = apply_filters( 'cmp_option_' . $option, '[undefined]', $default );
		if ( $value !== '[undefined]' ) {
			return $value;
		}

		/**
		 * Priority #2: `get_post_meta()`
		 * Get `$option` from post meta
		 */
		if ( in_the_loop() ) {
			$value = get_post_meta( get_the_ID(), $option, true );

			if ( $value && $value !== $default ) {
				return $value;
			}
		}

		/**
		 * Priority #3: `cmb2_get_option()`
		 * Get the option from wordpress options
		 */
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

