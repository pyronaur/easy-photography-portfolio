<?php
use Photography_Portfolio\Frontend\Layout\View;

/**
 * Easy access to our god-class
 * @return \Colormelon_Photography_Portfolio
 */
function phort_instance() {

	return Colormelon_Photography_Portfolio::instance();
}


/**
 * Checks if the current query is a portfolio query
 * @return bool
 */
function phort_is_portfolio() {

	return phort_instance()->query->is_portfolio();
}


function phort_load_view() {

	View::load();
}


function phort_get_home_page() {

	return (int) phort_get_option( 'portfolio_page' );
}


function phort_has_theme_support() {

	return get_theme_support( 'photography-portfolio-plugin' );
}


function phort_is_front_page() {

	return phort_instance()->query->is_portfolio_front_page();
}