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
	 * @var             $cm_portfolio Layout_Factory_Interface instance
	 * @see Single_Portfolio_Layout
	 * @see Archive_Portfolio_Layout
	 */
	public function load() {


		global $cm_portfolio;

		$cm_portfolio = $this->create_layout_instance( $this->query );
		$cm_portfolio->display();

		// Don't pollute global scope. Remove the variable after we're done.
		unset ( $cm_portfolio );


	}


	/**
	 * Create a layout instance
	 * @return Layout_Factory_Interface instance
	 */
	public function create_layout_instance() {

		return new $this->classname( $this->slug, $this->query );

	}


}