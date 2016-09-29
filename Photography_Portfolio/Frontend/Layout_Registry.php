<?php


namespace Photography_Portfolio\Frontend;


class Layout_Registry {

	protected $registry = array();


	/**
	 * Register a new single portfolio layout
	 *
	 * @param string                   $layout_group - Which group of layouts to add this to ?
	 * @param Layout_Factory_Interface $classname    - Fully qualified class name
	 *
	 * @return bool
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
	 *
	 * @param string Layout group
	 * @param $classname
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
	 * Return registered portfolio items
	 * @return array
	 */
	public function all() {

		return $this->registry;
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


	/**
	 * Find which PHP Class is resposnible for the requested layout name
	 *
	 * @param $layout_slug
	 *
	 * @return Layout_Factory_Interface
	 * @throws \Exception
	 */
	public function find_class( $layout_group, $layout_slug ) {

		if ( ! isset( $this->registry[ $layout_group ][ $layout_slug ] ) ) {
			throw new \Exception( "Layout `$layout_slug` is not defined in Portfolio_Item_Factory`" );
		}

		return $this->registry[ $layout_group ][ $layout_slug ]['class'];

	}


}