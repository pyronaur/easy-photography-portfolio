<?php


namespace Photography_Portfolio\Admin_View;


class Welcome_Message {


	private $meta_key     = 'phort_welcome_status';
	private $action_close = 'close_welcome';
	private $nonce_name   = 'phort_close_welcome';


	/**
	 * Welcome_Message constructor.
	 */
	public function __construct() {

		add_action( 'admin_notices', [ $this, 'display' ] );
		add_action( 'admin_init', [ $this, 'ignore' ] );

		if ( $this->should_display() ) {
			add_filter( 'phort/force_admin_style', '__return_true' );
		}

	}


	public function should_display() {

		/**
		 * Don't display welcome message,
		 * If the current theme has support for Easy Photography Portfolio
		 */
		if ( phort_has_theme_support() ) {
			return false;
		}

		$user_id = get_current_user_id();
		if ( ! $user_id ) {
			return false;
		}

		return ( 'message_is_closed' !== get_user_meta( $user_id, $this->meta_key, true ) );
	}


	public function display() {

		if ( $this->should_display() ) {
			$this->the_message();
		}


	}

	public function the_message() {

		$url_video_tutorial = "https://colormelon.com/easy-photography-portfolio-full-setup-guide/?utm_source=easy-photography-portfolio&utm_medium=welcome";
		$url_documentation  = "http://go.colormelon.com/epp-tutorial";
		$nonce              = wp_create_nonce( $this->nonce_name );
		$close_url          = admin_url( "/?{$this->action_close}=1&nonce={$nonce}" );
		?>
		<div class="Phort_Welcome notice">
			<h4><?php esc_html_e( 'Welcome to Easy Photography Portfolio', 'photography-portfolio' ); ?></h4>
			<p>

				<?php
				printf(
					wp_kses(
						__(
							'To get started, have a look at the <a target="_blank" href="%1$s">full setup guide</a> or the <a target="_blank" href="%2$s">video tutorial</a>',
							'photography-portfolio'
						),
						// Kses rules:
						[
							// Allow links with targets and hrefs
							'a' => [
								'href'   => [],
								'target' => [],
							],
						]
					),

					// Pass variables to printf()
					esc_url( $url_video_tutorial ),
					esc_url( $url_documentation )
				);
				?>
			</p>
			<a class="Phort_Hide" href="<?php echo esc_url( $close_url ) ?>">&times;</a>
		</div>

		<?php
	}


	function ignore() {

		global $current_user;
		$user_id = $current_user->ID;

		if (
			isset( $_GET['nonce'], $_GET[ $this->action_close ] )
			// Verifying nonce. it's ok not to escape.
			// phpcs:ignore WordPress.Security.ValidatedSanitizedInput
			&& wp_verify_nonce( $_GET['nonce'], $this->nonce_name )
			&& '1' == $_GET[ $this->action_close ]
		) {
			add_user_meta( $user_id, $this->meta_key, 'message_is_closed', true );
			wp_safe_redirect( admin_url( '/' ) );
			exit();
		}
	}

}