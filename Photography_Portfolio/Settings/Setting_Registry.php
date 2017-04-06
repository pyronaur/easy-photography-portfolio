<?php


namespace Photography_Portfolio\Settings;


class Setting_Registry {

	protected $registry = [];


	public function update( $id, $new_value ) {

		if ( $this->exists( $id ) && $this->is_valid( $new_value ) ) {

			$this->remove( $id );
			$this->add( $new_value );

			return true;
		}

		return false;

	}


	public function exists( $id ) {

		return isset( $this->registry[ $id ] );

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


	public function remove( $id ) {

		if ( $this->exists( $id ) ) {
			$this->registry[ $id ];

			return true;
		}

		return false;

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
			trigger_error( 'Setting `' . $id . '` already exists in `Photography_Portfolio\Settings\Setting_Registry`' );

			return false;
		}


		/**
		 * Store $setting in the registry
		 */
		$this->registry[ $id ] = $setting;

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

}