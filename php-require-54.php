<?php

class Photography_Portfolio_Require_PHP54 {

	/** @var String */
	private $minimum_version;


	/**
	 * @param $minimum_version
	 */
	public function __construct() {

		$this->minimum_version = '5.4';
	}


	/**
	 * @param $version
	 *
	 * @return bool
	 */
	public function does_it_meet_required_php_version( $version ) {

		if ( $this->is_minimum_php_version( $version ) ) {
			return true;
		}

		$this->load_minimum_required_version_notice();

		return false;
	}


	/**
	 * @param $version
	 *
	 * @return boolean
	 */
	private function is_minimum_php_version( $version ) {

		return version_compare( $this->minimum_version, $version, '<=' );
	}


	/**
	 * @return void
	 */
	private function load_minimum_required_version_notice() {

		if ( is_admin() && ! defined( 'DOING_AJAX' ) ) {
			add_action( 'admin_notices', array( $this, 'admin_notice' ) );
		}
	}


	public function admin_notice() {

		echo '<div class="error">';
		echo wp_kses_post(
			__(
				'<p>Your hosting environment is <strong>outdated</strong> and <strong>insecure</strong>! <br> Minimum version required for Photography Portfolio is PHP 5.4. Read more information about <a href="http://www.wpupdatephp.com/update/">how you can update your server</a>!</p>'
				,
				'phort-plugin'
			)
		);
		echo '</div>';
	}
}