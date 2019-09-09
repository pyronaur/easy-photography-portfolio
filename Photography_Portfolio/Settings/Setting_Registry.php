<?php


namespace Photography_Portfolio\Settings;


class Setting_Registry {

	protected $registry = [];


	public function remove( $id ) {

		if ( $this->exists( $id ) ) {
			unset( $this->registry[ $id ] );

			return true;
		}

		return false;

	}


	public function exists( $id ) {

		return isset( $this->registry[ $id ] );

	}


	public function update( $setting ) {

		if ( $this->exists( $setting['id'] ) && $this->is_valid( $setting ) ) {

			$this->registry[ $setting['id'] ] = $setting;

			return true;
		}

		return false;

	}


	public function is_valid( $setting ) {

		/**
		 * Setting must have an ID
		 */
		if ( empty( $setting['id'] ) ) {
			trigger_error( 'Setting ID is required in `Photography_Portfolio\Settings\Setting_Registry`' );

			return false;
		}


		return true;

	}


	public function get( $id ) {

		if ( $this->exists( $id ) ) {
			return $this->registry[ $id ];
		}

		return false;

	}


	public function get_all() {

		return $this->registry;
	}


	public function add_all( $settings ) {

		foreach ( $settings as $setting ) {
			$this->add( $setting );
		}
	}


	public function add( $setting ) {


		if ( ! $this->is_valid( $setting ) ) {
			return false;
		}

		$id = $setting['id'];

		/**
		 * Setting ID must be Unique
		 */
		if ( $this->exists( $id ) ) {
			trigger_error( 'Setting `' . (int) $id . '` already exists in `Photography_Portfolio\Settings\Setting_Registry`' );

			return false;
		}


		/**
		 * Store $setting in the registry
		 */
		$this->registry[ $id ] = $setting;

		return true;

	}


}
