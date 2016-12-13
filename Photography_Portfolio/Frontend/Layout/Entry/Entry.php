<?php


namespace Photography_Portfolio\Frontend\Layout\Entry;


use Photography_Portfolio\Frontend\Gallery\Attachment;
use Photography_Portfolio\Frontend\Gallery\Gallery;
use Photography_Portfolio\Frontend\Gallery_Data_Renderer;


/**
 * Class Entry
 *
 * @property-read \Photography_Portfolio\Frontend\Gallery\Attachment $featured_image
 *
 * @TODO    :
 *
 *      * Bluebird relies on `has-no-thumbnail` in cases where there is no thumbnail. Figure out where to handle that.
 *      * $entry->hover functionality is removed for now. Restore it somehow. ( `div.hovercard__popup` )
 *      * Need to somehow add class `enable-hover` when it's needed, but not in the plugin? Decisions....
 *      * Remove `Mod::`
 */
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
	public $featured_image_size = 'full';

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
	public function setup_featured_image( $size = 'full' ) {

		if ( ! has_post_thumbnail( $this->id ) ) {
			return $this;
		}

		/**
		 * @Todo: Maybe check if $size exists ?
		 */
		$this->featured_image_size = $size;
		$this->featured_image      = new Attachment( get_post_thumbnail_id( $this->id ) );


		return $this;
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
	 * @apply_filters `pp/entry/subtitle`
	 * @return bool|string
	 */
	public function get_subtitle() {

		$subtitle = false;


		/**
		 * Exit early if a there is a subtitle returned by a filter
		 */
		if ( has_filter( 'pp/entry/subtitle' ) ) {
			$subtitle = apply_filters( 'pp/entry/subtitle', $subtitle, $this );

			if ( $subtitle !== false ) {
				return $subtitle;
			}

		}

		/**
		 * Only get a subtitle, if subtitles are enabled
		 */
		if ( ! pp_get_option( 'portfolio_enable_subtitle', false ) ) {
			return false;
		}

		/**
		 * If image count is disabled, set subtitle and quit
		 */
		$show_image_count = pp_get_option( 'portfolio_show_image_count', false );
		$subtitle         = trim( get_post_meta( $this->id, 'pp_subtitle', true ) );

		/**
		 * Count images, maybe set subtitle to image count
		 */
		if (
			'always' == $show_image_count
			|| ( 'only_missing' == $show_image_count && empty( $subtitle ) )
		) {

			$gallery     = new Gallery( $this->id );
			$image_count = $gallery->count();

			$subtitle = sprintf( esc_html__( '%d images', 'pp-plugin' ), $image_count );

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

		$attachment = new Attachment( get_post_thumbnail_id( $this->id ) );

		return $this->data_create_renderer( $attachment, $this->attached_sizes );

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