<?php


namespace Photography_Portfolio\Frontend\Layout\Single;


use Photography_Portfolio\Contracts\Layout_Factory_Interface;
use Photography_Portfolio\Frontend\Gallery\Attachment;
use Photography_Portfolio\Frontend\Gallery\Gallery;
use Photography_Portfolio\Frontend\Gallery_Data_Renderer;
use Photography_Portfolio\Frontend\Layout\Entry\Entry;
use Photography_Portfolio\Frontend\Template_Trait;

/**
 * Class Single_Portfolio_Layout
 * @package Photography_Portfolio\Frontend\Layout\Single
 */
abstract class Single_Portfolio_Layout implements Layout_Factory_Interface {

	use Template_Trait;

	/**
	 * @var $slug
	 * Required, used as key to store the layout
	 */
	public $slug;

	/**
	 * @var \WP_Query $query
	 * The portfolio post ID
	 */
	public $query;

	/**
	 * @var array
	 * Portfolio gallery image sizes
	 */
	public $attached_sizes = array(
		'thumb' => 'full',
		'full'  => 'full',
	);

	/**
	 * @var Post ID
	 */
	public $id;


	/**
	 * Single_Portfolio_Layout constructor.
	 */
	public function __construct( $slug, \WP_Query $query ) {

		$this->query = $query;
		$this->slug  = $slug;
		$this->id    = $query->get_queried_object_id();
	}


	/**
	 *  Display Gallery
	 */
	public function display_gallery() {

		global $pp_gallery_data;
		global $attachment;

		foreach ( Gallery::get_all( $this->id ) as $attachment ) {

			$pp_gallery_data = $this->setup_item_data( $attachment );
			$this->get( 'single/gallery/loop-item' );

		}

		// Don't pollute global scope. Remove the variables after we're done.
		unset( $attachment, $pp_gallery_data );
	}


	/**
	 * Parse gallery item data, must have a render() method to render inline attribute(s)
	 *
	 * @param Attachment $attachment
	 *
	 * @return \Photography_Portfolio\Contracts\Render_Inline_Attribute
	 */
	public function setup_item_data( Attachment $attachment ) {

		return new Gallery_Data_Renderer( $attachment, $this->attached_sizes );
	}


	public function display() {

		// Create Entry instance
		$entry = ( new Entry( $this->id ) )
			->setup_featured_image( $this->attached_sizes['thumb'] )
			->setup_subtitle();

		// Enable $entry access in template
		set_query_var( 'entry', $entry );

		// Get the template
		$this->get( 'single/single' );

	}


}