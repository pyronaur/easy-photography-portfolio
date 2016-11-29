<?php


namespace Photography_Portfolio\Frontend;


use Photography_Portfolio\Contracts\Layout_Factory_Interface;

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


	public static function autoload( $layout, $slug ) {


		global $wp_query;
		global $pp_layout;

		$layout_class_name = PP_Instance()->layouts->find_class( $layout, $slug );

		$factory = new static( $wp_query, $slug, $layout_class_name );

		/**
		 * Expose $pp_layout as a global for use in template functions
		 */
		$pp_layout = $factory->create_layout_instance();

	}


	/**
	 * Create a layout instance
	 * @return Layout_Factory_Interface instance
	 */
	public function create_layout_instance() {

		return new $this->classname( $this->slug, $this->query );

	}


}