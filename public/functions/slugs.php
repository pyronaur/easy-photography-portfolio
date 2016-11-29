<?php


/**
 *
 * Get single layout slug
 *
 */
function pp_slug_single() {

	return sanitize_html_class(
		pp_get_option( 'single_portfolio_layout', PP_Instance()->layouts->get_default( 'single' ) )
	);
}


/**
 *
 * Get archive layout slug
 *
 */
function pp_slug_archive() {

	return sanitize_html_class(
		pp_get_option( 'portfolio_layout', PP_Instance()->layouts->get_default( 'archive' ) )
	);
}


function pp_slug_current() {

	// Single Portfolio
	if ( PP_Instance()->query->is_single() ) {
		return pp_slug_single();
	}

	// Portfolio Archive & Categories
	if ( PP_Instance()->query->is_archive() || PP_Instance()->query->is_category() ) {
		return pp_slug_archive();
	}

	return false;
}