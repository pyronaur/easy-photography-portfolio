<?php

namespace Photography_Portfolio\Frontend\Gallery;


class Gallery {

	private $ID;


	function __construct( $ID = false ) {

		// When ID Not specified, use the ID from the loop
		if ( ! $ID ) {
			$ID = get_the_ID();
		}
		$this->ID = $ID;

	}


	/**
	 * @return array of \Photography_Portfolio\Frontend\Gallery\Attachment objects
	 */
	public static function get_all() {

		$instance = new self();

		return $instance->all();

	}


	/**
	 * Get all gallery items
	 * @return array of \Photography_Portfolio\Frontend\Gallery\Attachment objects
	 */
	public function all() {

		return $this->get_items( $this->get_item_ids() );
	}


	/**
	 * @param array $gallery_ids
	 *
	 * @return array of \Photography_Portfolio\Frontend\Gallery\Attachment objects
	 */
	public function get_items( $gallery_ids ) {

		$out = [];

		foreach ( $gallery_ids as $attachment_id ) {

			/**
			 * Only create an attachment if it's a real image.
			 * Otherwise after content imports
			 */
			if ( wp_attachment_is_image( $attachment_id ) ) {
				$out[] = new Attachment( $attachment_id );
			}
		}

		return $out;
	}


	/**
	 * @param int $count
	 *
	 * @return array|bool|mixed
	 */
	public function get_item_ids( $count = 0 ) {

		$gallery = get_post_meta( $this->ID, 'phort_gallery', true );

		if ( ! $gallery ) {
			return [];
		}

		if ( is_int( $count ) && $count > 0 ) {
			$gallery = array_slice( $gallery, 0, $count, true );
		}

		return array_keys( $gallery );
	}


	/**
	 * @param int $count
	 *
	 * @return array of \Photography_Portfolio\Frontend\Gallery\Attachment objects
	 */
	public function get( $count = 0 ) {

		return $this->get_items( $this->get_item_ids( $count ) );
	}


	public function count() {

		return count( $this->get_item_ids() );
	}

}