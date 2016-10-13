<?php


namespace Photography_Portfolio\Core;


class Is {

	protected $is_archive;
	protected $is_single;
	protected $is_category;


	/**
	 * Router constructor.
	 */
	public function __construct( $post_id = NULL ) {

		add_action( 'pre_get_posts', array( $this, 'set_variables' ) );
	}


	public
	function portfolio() {

		return ( $this->is_archive || $this->is_single || $this->is_category );
	}


	public
	function single() {

		return $this->is_single;
	}


	public
	function archive() {

		return $this->is_archive;
	}


	public
	function category() {

		return $this->is_category;
	}


	public function set_variables( \WP_Query $query ) {

		$this->set_is_archive( $query );
		$this->set_is_category( $query );
		$this->set_is_single( $query );

	}


	/**
	 *
	 *
	 * Private Functions
	 *
	 *
	 */

	protected function set_is_single( \WP_Query $query ) {

		$result = $query->is_single() && 'portfolio' === $query->get( 'post_type' );


		$this->is_single = $result;

	}


	protected function set_is_category( \WP_Query $query ) {

		$result = $query->is_tax( get_object_taxonomies( 'portfolio_category' ) );


		$this->is_category = $result;
	}


	protected function set_is_archive( \WP_Query $query ) {

		$result = $query->is_post_type_archive( 'portfolio' );


		$this->is_archive = $result;

	}
}