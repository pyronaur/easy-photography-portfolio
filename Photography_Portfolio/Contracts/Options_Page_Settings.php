<?php


namespace Photography_Portfolio\Contracts;


interface Options_Page_Settings {


	public function get_metabox_id();


	public function get_key();


	public function get_page_title();


	public function set_fields( $cmb_instance );
}