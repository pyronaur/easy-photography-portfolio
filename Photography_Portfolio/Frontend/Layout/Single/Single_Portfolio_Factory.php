<?php


namespace Photography_Portfolio\Frontend\Layout\Single;


use CLM\Metamod;
use Photography_Portfolio\Frontend\Layout_Factory;

class Single_Portfolio_Factory extends Layout_Factory {

	public function get_layout_class( $layout_slug ) {

		return PP_Instance()->layouts->find_class( 'single', $layout_slug );
	}
}