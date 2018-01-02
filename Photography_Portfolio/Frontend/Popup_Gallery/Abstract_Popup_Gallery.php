<?php


namespace Photography_Portfolio\Frontend\Popup_Gallery;


abstract class Abstract_Popup_Gallery {
	protected static $slug = '';
	protected        $build_directory_url;


	/**
	 * Photoswipe constructor.
	 */
	public function __construct() {

		$this->build_directory_url = CLM_PLUGIN_DIR_URL . 'public/build/';
	}


	/**
	 * Return an array of registered script handles
	 *
	 * @return array
	 */
	abstract public function script_handles();


	/**
	 * Return an array of JavaScript settings
	 *
	 * @return array
	 */
	abstract public function javascript_settings();


	/**
	 * Register Styles & Scripts
	 * @return void
	 */
	abstract public function register();


	/**
	 * Enqueue Styles & Scripts
	 * @return void
	 */
	abstract public function enqueue();


	public function get_slug() {

		return Abstract_Popup_Gallery::$slug;

	}


}