<?php


namespace Photography_Portfolio\Core;


class Query {

	/**
	 * @var \WP_Query $original_query
	 */
	public $original_query;

	protected $is_archive  = false;
	protected $is_single   = false;
	protected $is_category = false;



	public function set_variables( \WP_Query $query ) {

		if ( ! $query->is_main_query() ) {
			return;
		}


		/**
		 * Add custom home page query in themes where the theme isn't already running a custom query
		 */
		if ( $this->is_portfolio_front_page() && ! class_exists( '\Theme\Page_Template_Query_Filter' ) ) {
			$this->custom_home_page_query( $query );
		}


		if ( ! $query->get( 'phort_is_custom_query' ) ) {

			// Alter the $wp_query
			$this->set_is_archive( $query );
			$this->set_is_category( $query );
			$this->set_is_single( $query );
		}


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


	protected function set_is_single( \WP_Query $query ) {

		$is_phort_post   = ( $query->get( 'post_type' ) === 'phort_post' );
		$this->is_single = ( $is_phort_post &&
		                     ( $query->is_single() || $query->is_singular( 'phort_post' ) )
		);

		return $this->is_single;
	}


	public function is_portfolio() {

		return ( $this->is_archive || $this->is_single || $this->is_category );
	}


	public function is_archive() {

		return $this->is_archive;
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
			$this->remove_page_from_wp_query( $query );

			$query->is_singular = 0;

			/**
			 * Set is_archive
			 */
			$this->is_archive = true;
		}


	}


	public function is_category() {

		return $this->is_category;
	}


	protected function set_is_category( \WP_Query $query ) {

		$result = $query->is_tax( get_object_taxonomies( 'phort_post' ) );


		$this->is_category = $result;
	}


	public function store_original_query( \WP_Query $query ) {

		if ( ! $query->is_main_query() ) {
			return;
		}

		$this->original_query = clone $query;
	}


	public function custom_home_page_query( \WP_Query $query ) {

		$display = phort_get_option( 'portfolio_page_displays' );
		if ( $display === 'all' ) {
			return;
		}

		if ( $display === 'phort_post_category' ) {
			$category_id = phort_get_option( 'portfolio_home_category' );
			if ( $category_id ) {
				$this->load_category_in_portfolio_home( $category_id, $query );
			}
		}


		if ( $display === 'phort_post' ) {
			$post_id = phort_get_option( 'portfolio_home_entry' );
			if ( $post_id ) {
				$this->load_entry_in_portfolio_home( $post_id, $query );
			}
		}
	}


	public function remove_page_from_wp_query( \WP_Query $query ) {


		$query->set( 'pagename', NULL );  // override 'pagename'
		$query->set( 'page_id', NULL );  // override 'pagename'
		$query->is_page = 0;

	}


	public function load_category_in_portfolio_home( $category_id, \WP_Query $query ) {

		/**
		 * Very important to check strictly whether term exists ( !== ) otherwise it turns up false positives
		 */
		if ( false === term_exists( (int) $category_id, 'phort_post_category' ) ) {
			return false;
		}

		$this->remove_page_from_wp_query( $query );


		$query->set(
			'tax_query',
			[
				[
					'taxonomy' => 'phort_post_category',
					'field'    => 'term_id',
					'terms'    => $category_id,
				],
			]
		);

		$query->is_tax      = 1;
		$query->is_singular = 0;
		$query->set( 'post_type', 'phort_post' );  // override 'post_type'
		$query->set( 'posts_per_page', - 1 );


		$this->set_is_category( $query );
		$this->set_is_archive( $query );

	}


	public function load_entry_in_portfolio_home( $post_id, \WP_Query $query ) {

		$query->set( 'post_type', 'phort_post' );  // override 'post_type'
		$this->remove_page_from_wp_query( $query );

		$query->set( 'posts_per_page', 1 );
		$query->set( 'p', (int) $post_id );

		$query->is_singular = 1;
		$query->is_single   = 1;
		$query->is_archive  = 0;

		$query->set( 'phort_is_custom_query', true );
		$this->set_is_single( $query );


	}


	protected function get_queried_object_id() {

		$id = (int) get_queried_object_id();

		if ( ! $id ) {
			$id = (int) $this->original_query->get( 'page_id' );
		}

		return $id;
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


}
