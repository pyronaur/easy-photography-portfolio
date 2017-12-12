<?php


namespace Photography_Portfolio\Frontend;


use Photography_Portfolio\Contracts\Layout_Factory_Interface;

class Layout_Factory {

	protected $query;
	protected $classname;
	private   $slug;


	/**
	 * Layout_Factory constructor.
	 */
	public function __construct( $query, $slug, $handler_class ) {

		$this->query     = $query;
		$this->classname = $handler_class;
		$this->slug      = $slug;
	}


	public static function autoload() {


		global $wp_query;
		global $phort_layout;

		// fallback
		$layout = 'archive';
		$slug   = '';

		// Archive?
		if ( phort_is_archive() ) {
			$layout = 'archive';
			$slug   = phort_slug_archive();
		}

		// Single
		elseif ( phort_is_single() ) {
			$layout = 'single';
			$slug   = phort_slug_single();
		}


		$layout_class_name = phort_instance()->layouts->find_class( $layout, $slug );


		$factory = new static( $wp_query, $slug, $layout_class_name );

		/**
		 * Expose $phort_layout as a global for use in template functions
		 */
		$phort_layout = $factory->create_layout_instance();

	}


	/**
	 * Create a layout instance
	 * @return Layout_Factory_Interface instance
	 */
	public function create_layout_instance() {

		return new $this->classname( $this->slug, $this->query );

	}


}