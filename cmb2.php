<?php

/**
 * Support Symlinks in Development environmnent
 */
if ( defined( "WP_DEBUG" ) && WP_DEBUG ) {
	function update_cmb2_meta_box_url( $url ) {

		return plugin_dir_url( __FILE__ ) . '/vendor/webdevstudios/cmb2';
	}

	add_filter( 'cmb2_meta_box_url', 'update_cmb2_meta_box_url' );
}
