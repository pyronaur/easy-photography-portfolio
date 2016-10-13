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


	public function is_portfolio_front_page( $query ) {

		if ( ! is_a( $query, 'WP_Query' ) ) {
			return false;
		}

		return ( get_option( 'show_on_front' ) == 'page'
		         && get_option( 'page_on_front' )
		         && $query->get( 'page_id' ) == get_option( 'page_on_front' )
		         && cmp_get_option( 'portfolio_page', false ) == get_option( 'page_on_front' )
		);

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

		/**
		 * domain.com/portfolio/ is a portfolio archive. No doubt, no doubt.
		 */
		$result = $query->is_post_type_archive( 'portfolio' );

		if ( $result === true ) {
			$this->is_archive = $result;
		}


		/**
		 *  Check if current Page is supposed to be an Archive
		 *  Modify the WP_Query if so:
		 */
		if ( $this->is_portfolio_front_page( $query ) || $query->get_queried_object_id() === cmp_get_option( 'portfolio_page', false ) ) {
			// modify query_vars:
			$query->set( 'post_type', 'portfolio' );  // override 'post_type'
			$query->set( 'pagename', NULL );  // override 'pagename'
			$query->set( 'page_id', '' );  // override 'pagename'
			$query->set( 'posts_per_page', - 1 );


			$query->is_singular = 0;
			$query->is_page     = 0;

			/**
			 * Set is_archive
			 */
			$this->is_archive = true;
		}


	}
}
