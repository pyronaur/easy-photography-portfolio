<?php


namespace Photography_Portfolio\Frontend\Layout\Archive\Masonry_Hovercard;


use Photography_Portfolio\Frontend\Layout\Archive\Archive_Portfolio_Layout;

class Archive_Masonry_Hovercard_Layout extends Archive_Portfolio_Layout {


	public $attached_sizes = array(

		'thumb' => 'large',
		'full'  => 'full',
	);

	public $appended_classes = [
		'PP_Entry'   => [ 'PP_Masonry__item', 'PP_Card', 'PP_Card--hoverable' ],
		'PP_Archive_Container' => 'PP_Masonry',
	];
}