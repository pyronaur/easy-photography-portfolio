<?php
/**
 * Flush Permalinks on plugin activation
 * Ensure PHP 5.2 compitability - don't use anonymous functions
 */
function phort_plugin_activation_hook() {

	// Register post types
	Photography_Portfolio\Core\Post_Type_Portfolio::register_post_type();
	Photography_Portfolio\Core\Post_Type_Portfolio::register_taxonomy();


	// Flush rewrite rules
	flush_rewrite_rules();

	// Initialize Easy Photography Portfolio
	phort_instance()->setup_settings();

	// Setup sample content
	new Photography_Portfolio\Settings\Sample_Content\Setup_Sample_Content();

}