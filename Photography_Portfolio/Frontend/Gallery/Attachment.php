<?php

namespace Photography_Portfolio\Frontend\Gallery;


class Attachment {
	public $caption;
	public $description;
	public $type;
	public $data;
	public $id;
	public $orientation;


	/**
	 * Attachment constructor.
	 */
	public function __construct( $id ) {

		$this->id   = $id;
		$this->data = $this->setup_data();
		$this->type = $this->setup_type();

	}


	public function setup_data() {

		$data = wp_prepare_attachment_for_js( $this->id );

		// Descriptions & Captions
		$description = $data['description'];
		$caption     = $data['caption'];


		// Setup & Escape
		$this->description = html_entity_decode( htmlspecialchars( str_replace( '"', '&quot;', $description ), ENT_QUOTES ) );
		$this->caption     = html_entity_decode( htmlspecialchars( str_replace( '"', '&quot;', $caption ), ENT_QUOTES ) );
		$this->orientation = $data['orientation'];

		return $data;

	}


	private function setup_type() {

		if ( $this->get_video_url() && phort_has_video_support() ) {
			return 'video';
		}

		return $this->data['type'];
	}


	public function get_video_url() {

		$video = get_post_meta( $this->id, '_attachment_video_url', true );

		if ( $video ) {
			return esc_url_raw( $video );
		}

		return false;
	}


	public function type_is( $type ) {

		return ( $type === $this->type );
	}


	public function get_video() {

		return wp_oembed_get( $this->get_video_url(), [ 'width' => 1400 ] );

	}


	public function get_size_string( $size = 'full' ) {

		$image = $this->get_size( $size );

		return $image['width'] . 'x' . $image['height'];

	}


	public function get_size( $size = 'full' ) {

		$sizes = $this->data['sizes'];

		if ( isset( $sizes[ $size ] ) ) {
			return $sizes[ $size ];
		}

		$image = $this->get_custom_size( $size );
		if ( $image ) {
			return $image;
		}

		trigger_error( "Size `$size` not found for attachment `$this->id`, using full image instead" );

		return $sizes['full'];
	}


	public function get_custom_size( $size ) {

		$image_src = wp_get_attachment_image_src( $this->id, $size );

		if ( $image_src == false ) {
			return false;
		}

		return [
			'url'    => $image_src[0],
			'width'  => $image_src[1],
			'height' => $image_src[2],
		];
	}


	public function get_ratio( $size = 'full' ) {

		$image = $this->get_size( $size );

		$ratio = $image['width'] / $image['height'];

		return $ratio;

	}


	public function get_image_url( $size = 'full' ) {

		$image = $this->get_size( $size );

		$image_url = esc_url( $image['url'] );

		return $image_url;
	}


	/**
	 * Wrapper for wp_get_attachment_image
	 * @uses wp_get_attachment_image()
	 */

	public function display( $size = 'full' ) {

		echo wp_get_attachment_image( $this->id, $size );

	}

}