<?php


namespace Photography_Portfolio\Frontend\Layout\Single\Masonry;


use Photography_Portfolio\Frontend\Layout\Single\Single_Portfolio_Layout;

class Single_Column_Layout extends Single_Portfolio_Layout {

	public $attached_sizes = [

		'thumb' => 'large',
		'full'  => 'full',

	];

	public $appended_classes = [
		'PP_Gallery'       => 'PP_Single_Column',
		'PP_Gallery__item' => 'PP_Single_Column__item',
	];


}