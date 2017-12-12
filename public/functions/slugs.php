<?php


/**
 *
 * Get single layout slug
 *
 */
function phort_slug_single() {

	return sanitize_html_class(
		phort_instance()->layouts->validate(
			'single',
			phort_get_option( 'single_portfolio_layout' )
		)
	);
}


/**
 *
 * Get archive layout slug
 *
 */
function phort_slug_archive() {

	return sanitize_html_class(
		phort_instance()->layouts->validate(
			'archive',
			phort_get_option( 'portfolio_layout' )
		)
	);


}


function phort_slug_current() {

	$slug = false;
	// Single Portfolio
	if ( phort_is_single() ) {
		$slug = phort_slug_single();
	} // Portfolio Archive & Categories
	else if ( phort_is_archive() ) {
		$slug = phort_slug_archive();
	}

	return $slug;
}