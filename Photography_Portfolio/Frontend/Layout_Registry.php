<?php


namespace Photography_Portfolio\Frontend;


use Photography_Portfolio\Contracts\Layout_Factory_Interface;

class Layout_Registry {

	protected $registry = array();


	/**
	 * Register a new single portfolio layout
	 *
	 * @param string                   $layout_group - Which group of layouts to add this to ?
	 * @param Layout_Factory_Interface $classname    - Fully qualified class name
	 *
	 * @return bool|Layout_Registry instance
	 * @throws \Exception
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
			$this->registry[ $layout_group ] = array();
		}

		$this->registry[ $layout_group ][ $slug ] = array(
			'key'   => $slug,
			'label' => $label,
			'class' => $classname,
		);

		return $this;
	}


	/**
	 *
	 * @param string $layout_group
	 * @param string $classname
	 *
	 * @return bool
	 * @throws \Exception
	 */
	public function validate_registration_class( $layout_group, $classname ) {


		/**
		 * Make sure that class exists
		 */
		if ( ! class_exists( $classname ) ) {
			throw new \Exception( "Class $classname does not exist" );
		}

		return true;
	}


	/**
	 * Remove portfolio layout from registry
	 *
	 * @param Layout_Factory_Interface $classname - Fully qualified class name
	 *
	 * @return bool
	 * @throws \Exception
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
	 * @param $layout_slug
	 *
	 * @return Layout_Factory_Interface
	 * @throws \Exception
	 */
	public function find_class( $layout_group, $layout_slug ) {

		if ( ! in_array( $layout_slug, array_keys( $this->available_layouts( $layout_group ) ) ) ) {
			trigger_error( "Layout `$layout_slug` is not defined in Portfolio_Item_Factory`. Reverting layout to default." );
			$layout_slug = $this->get_default( $layout_group );
		}

		return $this->registry[ $layout_group ][ $layout_slug ]['class'];

	}


	/**
	 * Return registered portfolio items in an associative array
	 * @return array
	 */
	public function available_layouts( $layout_group ) {

		$layouts = array();
		foreach ( $this->registry[ $layout_group ] as $item ) {
			$layouts[ $item['key'] ] = $item['label'];
		}

		return $layouts;
	}


	public function get_default( $layout_group ) {

		return key( $this->available_layouts( $layout_group ) );
	}

}