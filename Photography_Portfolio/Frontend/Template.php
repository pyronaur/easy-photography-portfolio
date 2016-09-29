<?php


namespace Photography_Portfolio\Frontend;


class Template {

	public static function get( $name, $modifier = NULL ) {

		get_template_part( 'portfolio/' . $name, $modifier );
	}

}