<?php


namespace Photography_Portfolio\Frontend;


abstract class Layout_Factory {
	protected $layout_slug;
	protected $query;


	/**
	 * Layout_Factory constructor.
	 */
	public function __construct( $query ) {

		$this->query = $query;
	}


	abstract function find_slug();


	abstract function get_layout_class( $layout_slug );


	public function set_slug( $layout_slug = NULL ) {

		if ( ! $layout_slug ) {
			$layout_slug = $this->find_slug();
		}
		$this->layout_slug = $layout_slug;

		return $this;
	}


	/**
	 * @param \WP_Query $query
	 * @param string    $layout_slug
	 *
	 *
	 * Method to display a layout
	 *
	 *
	 */
	public function load() {


		global $cm_portfolio;

		$cm_portfolio = $this->create_layout_instance( $this->query );
		$cm_portfolio->display();

		// Don't pollute global scope. Remove the variable after we're done.
		unset ( $cm_portfolio );


	}


	public function create_layout_instance() {

		$layout_class = $this->get_layout_class( $this->layout_slug );

		return new $layout_class( $this->layout_slug, $this->query );

	}


	public static function display( $layout_slug = NULL, $query = NULL ) {

		if ( ! $query ) {

			global $wp_query;
			$query = $wp_query;

		}


		$factory = new static( $query );
		$factory
			->set_slug( $layout_slug )
			->load();

		return $factory;
	}


}