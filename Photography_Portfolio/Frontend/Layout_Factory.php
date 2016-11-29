<?php


namespace Photography_Portfolio\Frontend;


use Photography_Portfolio\Contracts\Layout_Factory_Interface;
use Photography_Portfolio\Frontend\Layout\Archive\Archive_Portfolio_Layout;
use Photography_Portfolio\Frontend\Layout\Single\Single_Portfolio_Layout;

class Layout_Factory {

	protected $query;
	private   $slug;


	/**
	 * Layout_Factory constructor.
	 */
	public function __construct( $query, $slug, $handler_class ) {

		$this->query     = $query;
		$this->classname = $handler_class;
		$this->slug      = $slug;
	}


	/**
	 * Method to display a layout
	 *
	 * @var             $pp_layout Layout_Factory_Interface instance
	 * @see Single_Portfolio_Layout
	 * @see Archive_Portfolio_Layout
	 */
	public function load() {


		global $pp_layout;

		$pp_layout = $this->create_layout_instance();
		$pp_layout->display();

		// Don't pollute global scope. Remove the variable after we're done.
		unset ( $pp_layout );


	}


	/**
	 * Create a layout instance
	 * @return Layout_Factory_Interface instance
	 */
	public function create_layout_instance() {

		return new $this->classname( $this->slug, $this->query );

	}


}