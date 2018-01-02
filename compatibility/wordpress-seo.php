<?php


function phort_add_yoast_seo_compatibility( $id ) {

	if ( phort_instance()->query->is_portfolio_home() ) {
		return phort_get_home_page();
	}

	return $id;
}

add_filter( 'wpseo_frontend_page_type_simple_page_id', 'phort_add_yoast_seo_compatibility' );