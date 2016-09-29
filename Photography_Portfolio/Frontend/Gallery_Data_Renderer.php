<?php


namespace Photography_Portfolio\Frontend;


use CLM\Gallery\Attachment;
use Photography_Portfolio\Frontend\Contracts\Render_Inline_Attribute;


/**
 * Class Item
 * @package Photography_Portfolio\Frontend\Layout\Single
 */
class Gallery_Data_Renderer implements Render_Inline_Attribute {

	public $attachment;
	public $sizes;


	/**
	 * Portfolio_Item_Factory constructor.
	 *
	 * @TODO: Don't depend on Attachment directly, need interface
	 */
	public function __construct( Attachment $attachment, $sizes ) {

		$this->attachment = $attachment;
		$this->sizes      = $sizes;
	}


	public function prepare_data() {

		$data = array(
			'type'  => $this->attachment->type,
			'ratio' => $this->attachment->get_ratio(),

		);

		/**
		 * Attach Image Sizes
		 */
		foreach ( $this->sizes as $name => $size ) {
			$data['images'][ $name ] = array(
				'url'  => $this->attachment->get_image_url( $size ),
				'size' => $this->attachment->get_size_string( $size ),
			);
		}


		return apply_filters( 'cmp/gallery/prepare_data', $data, $this );

	}


	/**
	 * Output HTML data="" attribute
	 */
	public function render() {

		/**
		 * Note 1: Space before and after ` data-item='{JSON_DATA}' ` so we don't break HTML
		 * Note 2: Single Quotes Used: data-item'{JSON_DATA}'
		 */
		echo ' data-item=\'' . wp_json_encode( $this->prepare_data() ) . '\' ';
		
	}


}