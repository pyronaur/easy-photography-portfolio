<?php


namespace Photography_Portfolio\Settings\Sample_Content;


class Setup_Sample_Content {

	/**
	 * Setup_Sample_Content constructor.
	 *
	 */
	public function __construct() {

		if ( ! defined( 'ABSPATH' )
		     || ! is_admin()
		     || ! current_user_can( 'activate_plugins' )
		     || wp_doing_ajax()
		) {
			return false;
		}

		$this->create_portfolio_page();
		$this->create_first_portfolio_entry();
	}


	private function create_portfolio_page() {

		$phort_page_id = phort_get_home_page();
		/**
		 * Check if Portfolio Page is already set
		 */
		if ( $phort_page_id > 0 && ( $page_object = get_post( $phort_page_id ) ) ) {
			if ( 'page' === $page_object->post_type && ! in_array( $page_object->post_status, [ 'pending', 'trash', 'future', 'auto-draft' ] ) ) {
				// Valid page is already in place
				return $page_object->ID;
			}
		}

		/**
		 * Make sure that "Portfolio" doesn't already exists as a page.
		 * If it does, and EPP settings haven't caught that above, create "Easy Photography Portfolio" page instead.
		 */
		$portfolio_page_title = esc_html__( 'Portfolio', 'photography-portfolio' );
		$phort_page_id        = $this->get_portfolio_page( $portfolio_page_title );

		/**
		 * If "Portfolio" already exists, use "Easy Photography Portfolio"
		 */
		if ( ! $phort_page_id ) {
			$portfolio_page_title = esc_html__( 'Easy Photography Portfolio', 'photography-portfolio' );
			$phort_page_id        = $this->get_portfolio_page( $portfolio_page_title );
		}


		/**
		 * If both "Portfolio" or "Easy Photography Portfolio" doesn't exist, create a new page with the available title
		 */
		if ( ! $phort_page_id ) {
			$page_data = [
				'post_status'    => 'publish',
				'post_type'      => 'page',
				'post_author'    => 1,
				'post_title'     => $portfolio_page_title,
				'post_content'   => '',
				'comment_status' => 'closed',
			];

			$phort_page_id = wp_insert_post( $page_data );
		}

		/**
		 * By now there should be a phort_page_id.
		 * If there is, automatically set that as the portfolio_page
		 */
		if ( $phort_page_id > 0 ) {
			phort_set_option( 'portfolio_page', $phort_page_id );
		}


		return $phort_page_id;

	}


	private function create_first_portfolio_entry() {

		/**
		 * If `phort_sample_post` option already exists,
		 * A sample post has been already created at one point or another.
		 * Never, ever create another one, as long as the option is still there.
		 */
		if ( is_numeric( get_option( 'phort_sample_post' ) ) ) {
			return false;
		}

		$portfolio_posts = new \WP_Query(
			[
				'post_type' => 'phort_post',
			]
		);

		/**
		 * Don't create anything if there are posts already!
		 */
		if ( $portfolio_posts->have_posts() ) {
			return false;
		}


		/**
		 * Create the First Portfolio Entry!
		 */
		$page_data = [
			'post_status'  => 'publish',
			'post_type'    => 'phort_post',
			'post_author'  => 1,
			'post_title'   => esc_html__( 'First Portfolio Entry', 'photography-portfolio' ),
			'post_content' => $this->get_the_first_portfolio_entry_content(),
		];

		$phort_post_id = wp_insert_post( $page_data );


		/**
		 * Add Featured Image
		 */
		$featured_image_url = CLM_PLUGIN_DIR_URL . '/public/sample-content/pandu-ior.jpg';

		// Necessary funcitons to upload the featured image
		require_once( ABSPATH . 'wp-admin/includes/media.php' );
		require_once( ABSPATH . 'wp-admin/includes/file.php' );
		require_once( ABSPATH . 'wp-admin/includes/image.php' );

		// Upload the featured image
		media_sideload_image( $featured_image_url, $phort_post_id );


		$attachments = get_posts(
			[
				'numberposts'    => '1',
				'post_parent'    => $phort_post_id,
				'post_type'      => 'attachment',
				'post_mime_type' => 'image',
			]
		);


		if ( count( $attachments ) > 0 && isset( $attachments[0]->ID ) ) {
			// set image as the post thumbnail
			set_post_thumbnail( $phort_post_id, $attachments[0]->ID );
		}


		update_option( 'phort_sample_post', $phort_post_id );


		/**
		 * Set the subtitle!
		 */
		update_post_meta($phort_post_id, 'phort_subtitle', esc_html__( 'With a subtitle', 'photography-portfolio' ));
		return $phort_post_id;

	}


	public function get_portfolio_page( $title ) {

		$page = get_page_by_title( $title );
		if ( $page && isset( $page->ID ) && $page->ID > 0 ) {
			return $page->ID;
		}

		return 0;
	}


	/**
	 * Strings make the code look ugly, simplify $this->create_first_portfolio_entry by composing the content in this function:
	 * @return string
	 */
	public function get_the_first_portfolio_entry_content() {

		$content = "Welcome to Easy Photography Portfolio! This is your first portfolio entry. Edit or delete it, and start building your portfolio!

If you need help setting up - have a look at our <a href=\"http://colormelon.com/easy-photography-portfolio-full-setup-guide\">Easy Photography Portfolio setup guide</a>.
	";

		/**
		 * If the current theme doesn't support EPP - let's add a shameless plug about photography themes.
		 */
		if ( ! phort_has_theme_support() ) {
			$content .= "
We also design <a href=\"https://colormelon.com\">WordPress Themes for Photographers</a>, so if you like our plugin, consider picking up one of our themes!";
		}

		$content .= "
<h4>Upload your first gallery!</h4>
Edit this post, scroll down to \"Photography Portfolio\" and click the \"Add Images\" button to upload your first gallery!
		";

		return $content;

	}

}