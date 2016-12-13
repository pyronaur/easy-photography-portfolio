<?php


namespace Photography_Portfolio\Contracts;


interface Options_Page_Settings_Interface {
	
	public function get_page_title();


	public function set_fields( \CMB2 $cmb_instance );
}