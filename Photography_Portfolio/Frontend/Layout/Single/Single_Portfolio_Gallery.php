<?php


namespace Photography_Portfolio\Frontend\Layout\Single;


use Photography_Portfolio\Frontend\Gallery\Attachment;
use Photography_Portfolio\Frontend\Gallery\Gallery;

class Single_Portfolio_Gallery {


	public  $current_attachment = - 1;
	private $gallery;
	private $id;

	/**
	 * @var Attachment $attachment
	 */
	private $attachment;


	/**
	 * Single_Portfolio_Gallery constructor.
	 */
	public function __construct( $id ) {

		$this->id      = $id;
		$this->gallery = new Gallery( $id );
		$this->items   = $this->gallery->all();
		$this->count   = count( $this->items );


	}


	public function has_data() {

		if ( $this->count === 0 ) {
			return false;
		}

		if ( $this->current_attachment + 1 < $this->count ) {
			return true;
		}
	}


	public function the_attachment() {

		$this->next_attachment();

	}


	public function next_attachment() {

		$this->current_attachment ++;
		$this->attachment = $this->items[ $this->current_attachment ];

		return $this->attachment;

	}


	public function get_the_attachment() {

		return $this->attachment;
	}

}