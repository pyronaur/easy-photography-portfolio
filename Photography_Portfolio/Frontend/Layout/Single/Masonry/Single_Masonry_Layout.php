<?php


namespace Photography_Portfolio\Frontend\Layout\Single\Masonry;


use Photography_Portfolio\Frontend\Layout\Single\Single_Portfolio_Layout;

class Single_Masonry_Layout extends Single_Portfolio_Layout {
	
	public $attached_sizes = array(

		'thumb' => 'thumbnail_masonry',
		'full'  => 'full',

	);
	
}