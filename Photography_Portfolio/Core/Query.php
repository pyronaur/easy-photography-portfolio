<?php


namespace Photography_Portfolio\Core;


class Query {

	protected $is_archive;
	protected $is_single;
	protected $is_category;


	/**
	 * Router constructor.
	 */
	public function __construct() {

		add_action( 'pre_get_posts', array( $this, 'set_variables' ) );
	}


	public function is_portfolio() {

		return ( $this->is_archive || $this->is_single || $this->is_category );
	}


	public function is_archive() {

		return $this->is_archive;
	}


	public function is_category() {

		return $this->is_category;
	}


	public function set_variables( \WP_Query $query ) {

		if ( ! $query->is_main_query() ) {
			return;
		}
		
		$this->set_is_archive( $query );
		$this->set_is_category( $query );
		$this->set_is_single( $query );
	}


	protected function set_is_archive( \WP_Query $query ) {

		/**
		 * domain.com/portfolio/ is a portfolio archive. No doubt, no doubt.
		 */
		$result = $query->is_post_type_archive( 'pp_post' );

		if ( $result === true ) {
			$this->is_archive = $result;
		}


		/**
		 *  Check if current Page is supposed to be an Archive
		 *  Modify the WP_Query if so:
		 */
		if ( ( $this->is_portfolio_front_page_active() && $this->is_portfolio_front_page( $query ) ) || $this->is_portfolio_page( $query ) ) {


			// modify query_vars:
			$query->set( 'post_type', 'pp_post' );  // override 'post_type'
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


	protected function set_is_category( \WP_Query $query ) {

		$result = $query->is_tax( get_object_taxonomies( 'pp_post_category' ) );


		$this->is_category = $result;
	}


	protected function set_is_single( \WP_Query $query ) {

		$is_pp_post      = ( $query->get( 'post_type' ) === 'pp_post' );
		$this->is_single = ( $is_pp_post
		                     && (
			                     $query->is_single() || $this->is_portfolio_front_page( $query )
		                     )
		);

		return $this->is_single;
	}


	public function is_portfolio_front_page_active() {

		return ( pp_get_option( 'portfolio_page', false ) == get_option( 'page_on_front' ) );
	}


	public function is_portfolio_front_page( \WP_Query $query ) {

		if ( ! is_a( $query, 'WP_Query' ) ) {
			return false;
		}

		return ( get_option( 'show_on_front' ) == 'page'
		         && get_option( 'page_on_front' )
		         && $query->get( 'page_id' ) == get_option( 'page_on_front' )
		);

	}


	public function is_portfolio_page( \WP_Query $query ) {

		$qID = $query->get_queried_object_id();

		return ( $qID > 0 && ( (int) $qID === (int) pp_get_option( 'portfolio_page', false ) ) );
	}


	public function is_single() {

		return $this->is_single;
	}

}
