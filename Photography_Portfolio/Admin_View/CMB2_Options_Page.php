<?php


namespace Photography_Portfolio\Admin_View;


class CMB2_Options_Page {

	protected $name         = '';
	protected $options_page = '';

	private $key;
	private $metabox_id;
	private $settings;


	/**
	 * CMB2_Options_Page constructor.
	 */
	public function __construct( $key, $name, $settings ) {

		$this->key      = $key;
		$this->name     = $name;
		$this->settings = $settings;

		$this->metabox_id = $key . '_metabox';

		add_action( 'admin_init', [ $this, 'register_setting' ] );
		add_action( 'admin_menu', [ $this, 'add_options_page' ] );
		add_action( 'cmb2_admin_init', [ $this, 'add_options_page_metabox' ] );

	}


	/**
	 * Register settings notices for display
	 *
	 * @since  0.1.0
	 *
	 * @param  int   $object_id Option key
	 * @param  array $updated   Array of updated fields
	 *
	 * @return void
	 */
	public function settings_notices( $object_id, $updated ) {

		if ( $object_id !== $this->key || empty( $updated ) ) {
			return;
		}

		add_settings_error( $this->key . '-notices', '', __( 'Settings updated.', 'photography-portfolio' ), 'updated' );
		settings_errors( $this->key . '-notices' );
	}


	/**
	 * Public getter method for retrieving protected/private variables
	 * @since  0.1.0
	 *
	 * @param  string $field Field to retrieve
	 *
	 * @return mixed          Field value or false
	 */
	public function __get( $field ) {

		// Allowed fields to retrieve
		if ( in_array( $field, [ 'key', 'metabox_id', 'title', 'options_page' ], true ) ) {
			return $this->{$field};
		}
		trigger_error( 'Invalid property: ' . $field );

		return false;
	}


	/**
	 * Add the options metabox to the array of metaboxes
	 * @since  0.1.0
	 */
	function add_options_page_metabox() {

		// hook in our save notices
		add_action( "cmb2_save_options-page_fields_{$this->metabox_id}", [ $this, 'settings_notices' ], 10, 2 );

		$cmb = new_cmb2_box(
			[
				'id'         => $this->metabox_id,
				'hookup'     => false,
				'cmb_styles' => false,
				'show_on'    => [
					// These are important, don't remove
					'key'   => 'options-page',
					'value' => [ $this->key, ],
				],
			]
		);

		foreach ( $this->settings as $setting ) {
			$cmb->add_field( $setting );
		}

	}


	/**
	 * Admin page markup. Mostly handled by CMB2
	 * @since  0.1.0
	 */
	public function admin_page_display() {

		?>
		<div class="wrap cmb2-options-page <?php echo $this->key; ?>">
			<h2><?php echo esc_html( get_admin_page_title() ); ?></h2>
			<?php cmb2_metabox_form( $this->metabox_id, $this->key ); ?>
		</div>
		<?php
	}


	/**
	 * Add menu options page
	 * @since 0.1.0
	 */
	public function add_options_page() {

		$this->options_page = add_submenu_page(
			'edit.php?post_type=phort_post',
			$this->name,
			$this->name,
			'manage_options',
			$this->key,
			[ $this, 'admin_page_display' ]
		);

		// Include CMB CSS in the head to avoid FOUC
		add_action( "admin_print_styles-{$this->options_page}", [ 'CMB2_hookup', 'enqueue_cmb_css' ] );
	}


	/**
	 * Register our setting to WP
	 * @since  0.1.0
	 */
	public function register_setting() {

		register_setting( $this->key, $this->key );
	}


}

