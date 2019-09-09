<?php


namespace Photography_Portfolio\Frontend;


use Photography_Portfolio\Contracts\Layout_Factory_Interface;

class Layout_Registry {

	protected $registry = [];


	/**
	 * Register a new single portfolio layout
	 *
	 * @param string $layout_group - Which group of layouts to add this to ?
	 * @param string $classname    - Fully qualified class name
	 *
	 * @return bool|Layout_Registry instance
	 */
	public function add( $classname, $layout_group, $slug, $label ) {

		if ( ! $this->validate_registration_class( $layout_group, $classname ) ) {
			return false;
		}

		/**
		 * Don't add duplicateds
		 */
		if ( isset( $this->registry[ $layout_group ][ $slug ] ) ) {
			return true;
		}

		/**
		 * Create Layout Group if needed
		 */
		if ( ! isset( $this->registry[ $layout_group ] ) ) {
			$this->registry[ $layout_group ] = [];
		}

		$this->registry[ $layout_group ][ $slug ] = [
			'key'   => $slug,
			'label' => $label,
			'class' => $classname,
		];

		return $this;
	}


	/**
	 *
	 * @param string $layout_group
	 * @param string $classname
	 *
	 * @return bool
	 */
	public function validate_registration_class( $layout_group, $classname ) {

		/**
		 * Make sure that class exists
		 */
		if ( ! class_exists( $classname ) ) {
			phort_log_error( "Class $classname does not exist" );


			return false;

		}

		return true;
	}


	/**
	 * Remove portfolio layout from registry
	 *
	 * @param Layout_Factory_Interface $classname - Fully qualified class name
	 *
	 * @return bool
	 */
	public function remove( $layout_group, $slug ) {

		if ( ! isset( $this->registry[ $layout_group ][ $slug ] ) ) {
			return false;
		}

		unset( $this->registry[ $layout_group ][ $slug ] );

		return true;


	}


	/**
	 * Return registered portfolio items
	 * @return array
	 */
	public function all() {

		return $this->registry;
	}


	/**
	 * Find which PHP Class is resposnible for the requested layout name
	 *
	 * @param $slug
	 *
	 * @return Layout_Factory_Interface
	 */
	public function find_class( $group, $slug ) {

		$slug = $this->validate( $group, $slug );

		return $this->registry[ $group ][ $slug ]['class'];

	}


	/**
	 * Validate a layout slug
	 *
	 * @param $group
	 * @param $layout
	 *
	 * @return $layout ; if incorrect $layout passed, default will be returned
	 */
	public function validate( $group, $slug ) {

		if ( ! $this->layout_exists( $group, $slug ) ) {
			/**
			 * @TODO: Need a better solution for managing default layout values with solid fallbacks
			 * Until then, disable this error. Layout is always going to revert to the correct slug if possible anyway.
			 */
			return $this->get_default_slug( $group );
		}

		return $slug;

	}


	/**
	 * Method to check if a layout is registered
	 *
	 * @param $group
	 * @param $slug
	 *
	 * @return bool
	 */
	public function layout_exists( $group, $slug ) {

		return ( in_array( $slug, array_keys( $this->available_layouts( $group ) ) ) );

	}


	public function get_default_slug( $layout_group ) {

		return key( $this->available_layouts( $layout_group ) );
	}


	/**
	 * Return registered portfolio items in an associative array
	 * @return array
	 */
	public function available_layouts( $layout_group ) {

		$layouts = [];
		foreach ( $this->registry[ $layout_group ] as $item ) {
			$layouts[ $item['key'] ] = $item['label'];
		}

		return $layouts;
	}


}