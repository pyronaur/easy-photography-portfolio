<?php
namespace Photography_Portfolio\Frontend\Contracts;


interface Layout_Factory_Interface {

	/**
	 * @param \WP_Query $query
	 * @param  string   $layout_slug
	 *
	 * @return mixed
	 *
	 * Method to display a layout
	 */
	public function __construct( $layout_slug, \WP_Query $query );


	public function display();

}