<?php


namespace Photography_Portfolio\Core;


class Query {

	/**
	 * @var \WP_Query $original_query
	 */
	public $original_query;

	protected $is_archive;
	protected $is_single;
	protected $is_category;


	/**
	 * Router constructor.
	 */
	public function __construct() {

		add_action( 'pre_get_posts', [ $this, 'set_variables' ], 5 );
		add_action( 'pre_get_posts', [ $this, 'increase_ppp_limit' ], 25 );
	}


	public function set_variables( \WP_Query $query ) {

		if ( ! $query->is_main_query() ) {
			return;
		}


		// Store the original query
		$this->original_query = clone $query;

		// Alter the $wp_query
		$this->set_is_archive( $query );
		$this->set_is_category( $query );
		$this->set_is_single( $query );
	}


	protected function set_is_archive( \WP_Query $query ) {

		/**
		 * domain.com/portfolio/ is a portfolio archive. No doubt, no doubt.
		 */
		$result = $query->is_post_type_archive( 'phort_post' );

		if ( $result === true ) {
			$this->is_archive = $result;
		}


		/**
		 *  Check if current Page is supposed to be an Archive
		 *  Modify the WP_Query if so:
		 */
		if (
			$this->is_portfolio_front_page()
			||
			// If [Static Front Page is NOT Current Page, but current page is portfolio]
			( ! $this->is_front_page( $query ) && $this->is_portfolio_home() )
		) {


			// modify query_vars:
			$query->set( 'post_type', 'phort_post' );  // override 'post_type'
			$query->set( 'pagename', NULL );  // override 'pagename'
			$query->set( 'page_id', '' );  // override 'pagename'


			$query->is_singular = 0;
			$query->is_page     = 0;

			/**
			 * Set is_archive
			 */
			$this->is_archive = true;
		}


	}


	protected function set_is_category( \WP_Query $query ) {

		$result = $query->is_tax( get_object_taxonomies( 'phort_post_category' ) );


		$this->is_category = $result;
	}


	protected function set_is_single( \WP_Query $query ) {

		$is_phort_post   = ( $query->get( 'post_type' ) === 'phort_post' );
		$this->is_single = ( $is_phort_post &&
		                     ( $query->is_single() || $query->is_singular( 'phort_post' ) )
		);

		return $this->is_single;
	}


	/**
	 * Check if current page is:
	 *  * Site Front Page
	 *  * And is portfolio
	 *
	 * @return bool
	 */
	public function is_portfolio_front_page() {

		return ( $this->is_portfolio_home_at_static_front_page() && $this->is_portfolio_home() );
	}


	/**
	 *  WordPress Doesn't correctly detect whther current query `is_front_page` @ `pre_get_posts` hook
	 * @link https://core.trac.wordpress.org/ticket/21790
	 *
	 * This isn't pretty,
	 * but the ticket has been open since 2012 and isn't fixed at the end of 2016.
	 * Monkeypatching.
	 *
	 * @param \WP_Query $query
	 *
	 * @return bool
	 */
	private function is_front_page( \WP_Query $query ) {

		return ( $this->get_queried_object_id() == get_option( 'page_on_front' ) );
	}


	/**
	 *
	 * Check if current page has been set as the "Main Portfolio Page"
	 *
	 * @return bool
	 */
	public function is_portfolio_home() {

		$id = $this->get_queried_object_id();

		return ( $id > 0 && $id === phort_get_home_page() );

	}


	public function is_portfolio_home_at_static_front_page() {

		return (
			'page' == get_option( 'show_on_front' )
			&&
			phort_get_home_page() == get_option( 'page_on_front' )
		);
	}


	protected function get_queried_object_id() {

		$id = (int) get_queried_object_id();

		if ( ! $id ) {
			$id = (int) $this->original_query->get( 'page_id' );
		}

		return $id;
	}


	/**
	 * Increase the posts per page limit
	 */
	public function increase_ppp_limit( \WP_Query $query ) {

		if ( $this->is_archive || $this->is_category ) {
			$query->set( 'numberposts', 100 );
			$query->set( 'posts_per_page', 100 );
		}


	}


	public function is_single() {

		return $this->is_single;
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


}
