<?php

/**
 * Easy access to our god-class
 * @return \Colormelon_Photography_Portfolio
 */
function PP_Instance() {

	return Colormelon_Photography_Portfolio::instance();
}


/**
 * Checks if the current query is a portfolio query
 * @return bool
 */
function pp_is_portfolio() {

	return PP_Instance()->query->is_portfolio();
}
