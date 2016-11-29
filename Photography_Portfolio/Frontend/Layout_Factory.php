<?php


namespace Photography_Portfolio\Frontend;


use Photography_Portfolio\Contracts\Layout_Factory_Interface;
use Photography_Portfolio\Frontend\Layout\Archive\Archive_Portfolio_Layout;
use Photography_Portfolio\Frontend\Layout\Single\Single_Portfolio_Layout;

abstract class Layout_Factory {

	protected $layout_slug;
	protected $query;


	/**
	 * Layout_Factory constructor.
	 */
	public function __construct( $query ) {

		$this->query = $query;
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

		$layout_class = $this->get_layout_class( $this->layout_slug );

		return new $layout_class( $this->layout_slug, $this->query );

	}


	/**
	 * Find layout class name by slug
	 *
	 * @param $layout_slug
	 *
	 * @return Layout_Factory based class
	 */
	abstract function get_layout_class( $layout_slug );


	/**
	 * Set and store the layout slug
	 *
	 * @uses $this->find_slug()
	 *
	 * @param null $layout_slug (optional)
	 *
	 * @return $this
	 */
	public function set_slug( $layout_slug ) {

		$this->layout_slug = $layout_slug;

		return $this;
	}
	
}