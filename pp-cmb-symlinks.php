<?php

/**
 * Support Symlinks in Development environmnent
 */
function update_cmb2_meta_box_url( $url ) {

	return plugin_dir_url( __FILE__ ) . '/vendor/webdevstudios/cmb2';
}

add_filter( 'cmb2_meta_box_url', 'update_cmb2_meta_box_url' );
