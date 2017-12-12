<?php

// Create a helper function for easy SDK access.
function phort_freemium_analytics() {

	global $phort_freemium_analytics;

	if ( ! isset( $phort_freemium_analytics ) ) {
		// Include Freemius SDK.
		require_once dirname( __FILE__ ) . '/freemius/start.php';

		try {
			$phort_freemium_analytics = fs_dynamic_init(
				[
					'id'             => '1578',
					'slug'           => 'photography-portfolio',
					'type'           => 'plugin',
					'public_key'     => 'pk_b0b6e8f245449e6b4b1fe8e5cd0cb',
					'is_premium'     => false,
					'has_addons'     => false,
					'has_paid_plans' => false,
					'menu'           => [
						'slug'           => 'phort_options',
						'override_exact' => true,
						'account'        => false,
						'support'        => false,
						'contact'        => false,
						'parent'         => [
							'slug' => 'edit.php?post_type=phort_post',
						],
					],
				]
			);
		} catch ( Freemius_Exception $e ) {
			// failed
		}
	}

	return $phort_freemium_analytics;
}


function phort_freemium_analytics_settings_url() {

	return admin_url( 'edit.php?post_type=phort_post&page=phort_options' );
}

add_action(
	'init',
	function () {

		// Init Freemius.
		phort_freemium_analytics();

		phort_freemium_analytics()->add_filter( 'connect_url', 'phort_freemium_analytics_settings_url' );
		phort_freemium_analytics()->add_filter( 'after_skip_url', 'phort_freemium_analytics_settings_url' );
		phort_freemium_analytics()->add_filter( 'after_connect_url', 'phort_freemium_analytics_settings_url' );
		phort_freemium_analytics()->add_filter( 'after_pending_connect_url', 'phort_freemium_analytics_settings_url' );

		// Signal that SDK was initiated.
		do_action( 'phort_freemium_analytics_loaded' );

	}
);