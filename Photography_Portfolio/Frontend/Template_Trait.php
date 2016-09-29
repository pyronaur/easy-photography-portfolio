<?php


namespace Photography_Portfolio\Frontend;


trait Template_Trait {

	/**
	 * @param $name
	 */
	public function get( $name ) {

		Template::get( $name, $this->slug );

	}

}