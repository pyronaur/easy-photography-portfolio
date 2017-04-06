<?php


namespace Photography_Portfolio\Settings;


class Setting_Registry {

	protected $registry = [];


	public function add_all( $settings ) {

		foreach ( $settings as $setting ) {
			$this->add( $setting );
		}
	}


	public function add( $setting ) {

		/**
		 * Setting must have an ID
		 */
		if ( empty( $setting['id'] ) ) {
			trigger_error( 'Setting ID is required in `Photography_Portfolio\Settings\Setting_Registry`' );

			return false;
		}

		$id = $setting['id'];

		/**
		 * Setting ID must be Unique
		 */
		if ( isset( $this->registry[ $id ] ) ) {
			trigger_error( 'Setting `' . $id . '` already exists in `Photography_Portfolio\Settings\Setting_Registry`' );

			return false;
		}


		/**
		 * Store $setting in the registry
		 */
		$this->registry[ $id ] = $setting;

		return true;

	}


	public function remove( $key ) {

		if ( isset( $this->registry[ $key ] ) ) {
			$this->registry[ $key ];

			return true;
		}

		return false;

	}


	public function get_all() {

		return $this->registry;
	}
}