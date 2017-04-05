<?php


namespace Photography_Portfolio\Admin_View;


class Welcome_Message {


	private $meta_key     = 'phort_welcome_status';
	private $action_close = 'close_welcome';


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


	public
	function should_display() {

		/**
		 * Don't display welcome message,
		 * If the current theme has support for Easy Photography Portfolio
		 */
		if ( phort_has_theme_support() ) {
			return false;
		}

		global $current_user;
		$user_id = $current_user->ID;

		return ( 'message_is_closed' != get_user_meta( $user_id, $this->meta_key, true ) );
	}


	public function display() {

		if ( $this->should_display() ) {
			$this->the_message();
		}


	}


	public
	function the_message() {

		?>
		<div class="Phort_Welcome notice">
			<h4><span>Welcome To</span> Easy Photography Portfolio</h4>
			<p>
				To get started, have a look at the
				<a target="_blank"
				   href="https://colormelon.com/easy-photography-portfolio-full-setup-guide/?utm_source=easy-photography-portfolio&utm_medium=welcome">full
					setup guide</a>
				or the <a target="_blank" href="http://go.colormelon.com/epp-tutorial">video tutorial</a>
			</p>
			<a class="Phort_Hide" href="?<?php echo $this->action_close ?>=1">&times;</a>
		</div>
		<?php
	}


	function ignore() {

		global $current_user;
		$user_id = $current_user->ID;

		if ( isset( $_GET[ $this->action_close ] ) && '1' == $_GET[ $this->action_close ] ) {
			add_user_meta( $user_id, $this->meta_key, 'message_is_closed', true );
		}
	}

}