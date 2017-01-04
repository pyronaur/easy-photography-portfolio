<?php
/**
 * Flush Permalinks on plugin activation
 * Ensure PHP 5.2 compitability - don't use anonymous functions
 */
function phort_plugin_activation_hook() {

	// Register post types
	Photography_Portfolio\Core\Register_Post_Type::register_post_type();
	Photography_Portfolio\Core\Register_Post_Type::register_taxonomy();


	// Flush rewrite rules
	flush_rewrite_rules();

}

