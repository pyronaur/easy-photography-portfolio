<?php


namespace Photography_Portfolio\Frontend\Layout\Entry;


use Photography_Portfolio\Frontend\Gallery\Attachment;
use Photography_Portfolio\Frontend\Gallery\Gallery;
use Photography_Portfolio\Frontend\Gallery_Data_Renderer;

class Entry {

	/**
	 * @var bool
	 */
	public $subtitle = false;

	/**
	 * @var \Photography_Portfolio\Frontend\Gallery\Attachment $featured_image
	 */
	public $featured_image = false;

	/**
	 * @var string
	 */
	public $featured_image_size;

	public $attached_sizes = [
		'full' => 'full',
	];

	/**
	 * @var
	 */
	protected $id;


	/**
	 * Entry constructor.
	 */
	public function __construct( $id ) {

		$this->id = $id;
	}


	/**
	 *
	 *
	 * ---------------------- Featured Image ----------------------
	 *
	 *
	 */

	/**
	 * Prepare portfolio entry featured image, store as class variable
	 *
	 * @param string $size
	 *
	 * @return $this for chainability
	 */
	public function setup_featured_image( $size ) {


		$featured_image_id = $this->get_featured_image_id();

		if ( $featured_image_id ) {
			$this->featured_image_size = $size;
			$this->featured_image      = new Attachment( $featured_image_id );
		}

		return $this;
	}


	/**
	 * Have to make sure that `get_post_thumbnail_id` returns the real image.
	 * Wordpress IDs may be jumbled after importing content, image and post ids may collide.
	 */
	public function get_featured_image_id() {

		if ( ! has_post_thumbnail( $this->id ) ) {
			return false;
		}

		$featured_image_id = get_post_thumbnail_id( $this->id );


		if ( ! wp_attachment_is_image( $featured_image_id ) ) {
			return false;
		}

		return $featured_image_id;

	}


	/**
	 *
	 */
	public function show_featured_image() {

		if ( $this->has_featured_image() ) {
			$this->featured_image->display( $this->featured_image_size );
		}
	}


	/**
	 * @return bool
	 */
	public function has_featured_image() {

		return ( $this->featured_image != false );
	}

	/**
	 *
	 *
	 * ---------------------- Subtitle ----------------------
	 *
	 *
	 */


	/**
	 * @return $this
	 */
	public function setup_subtitle() {

		$this->subtitle = $this->get_subtitle();

		return $this;
	}


	/**
	 * Get the subtitle
	 *
	 * @apply_filters `phort/entry/subtitle`
	 * @return bool|string
	 */
	public function get_subtitle() {

		$subtitle = false;


		/**
		 * Exit early if a there is a subtitle returned by a filter
		 */
		if ( has_filter( 'phort/entry/subtitle' ) ) {
			$subtitle = apply_filters( 'phort/entry/subtitle', $subtitle, $this );

			if ( $subtitle !== false ) {
				return $subtitle;
			}

		}

		/**
		 * Only get a subtitle, if subtitles are enabled
		 */
		if ( ! phort_get_option( 'portfolio_enable_subtitle', false ) ) {
			return false;
		}

		/**
		 * If image count is disabled, set subtitle and quit
		 */
		$show_image_count = phort_get_option( 'portfolio_show_image_count', false );
		$subtitle         = trim( get_post_meta( $this->id, 'phort_subtitle', true ) );

		/**
		 * Count images, maybe set subtitle to image count
		 */
		if (
			'always' == $show_image_count
			|| ( 'only_missing' == $show_image_count && empty( $subtitle ) )
		) {

			$gallery     = new Gallery( $this->id );
			$image_count = $gallery->count();

			$subtitle = sprintf( esc_html__( '%d images', 'phort-plugin' ), $image_count );

		}


		return $subtitle;

	}


	/**
	 *
	 *
	 * ---------------------- Data ----------------------
	 *
	 * @TODO: Refactor please. Something doesn't feel right here.
	 *          * Not DRY
	 *          * Not 100% Clear what is what
	 */


	public function data_render() {

		$this->data_setup()->render();
	}


	public function data_setup() {

		$featured_image_id = $this->get_featured_image_id();

		if ( $featured_image_id ) {

			$attachment = new Attachment( get_post_thumbnail_id( $this->id ) );

			return $this->data_create_renderer( $attachment, $this->attached_sizes );
		}

		return $this;
	}


	/**
	 * Parse gallery item data, must have a render() method to render inline attribute(s)
	 *
	 * @param Attachment $attachment
	 *
	 * @return \Photography_Portfolio\Contracts\Render_Inline_Attribute
	 */
	public function data_create_renderer( Attachment $attachment, $sizes ) {

		return new Gallery_Data_Renderer( $attachment, $sizes );
	}


}