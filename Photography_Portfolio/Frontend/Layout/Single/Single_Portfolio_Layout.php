<?php


namespace Photography_Portfolio\Frontend\Layout\Single;


use Photography_Portfolio\Contracts\Layout_Factory_Interface;
use Photography_Portfolio\Frontend\Filter_CSS_Classes;
use Photography_Portfolio\Frontend\Gallery\Attachment;
use Photography_Portfolio\Frontend\Gallery\Gallery;
use Photography_Portfolio\Frontend\Gallery_Data_Renderer;
use Photography_Portfolio\Frontend\Layout\Entry\Entry;

/**
 * Class Single_Portfolio_Layout
 * @package Photography_Portfolio\Frontend\Layout\Single
 */
abstract class Single_Portfolio_Layout implements Layout_Factory_Interface {

	use Filter_CSS_Classes;

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
	 * @var $id `post_id`
	 */
	public $id;


	public $entry;


	/**
	 * Single_Portfolio_Layout constructor.
	 */
	public function __construct( $slug, \WP_Query $query ) {

		$this->query = $query;
		$this->slug  = $slug;
		$this->id    = $query->get_queried_object_id();
		$this->entry = new Entry( $this->id );


	}


	/**
	 *  Display Gallery
	 */
	public function display_gallery() {

		global $pp_gallery_data;
		global $attachment;

		foreach ( Gallery::get_all( $this->id ) as $attachment ) {

			$pp_gallery_data = $this->setup_item_data( $attachment );
			pp_get_template( 'single/gallery/loop-item' );

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

		$this->maybe_filter_css_classes();

		// Create Entry instance
		$this->entry
			->setup_featured_image( $this->attached_sizes['thumb'] )
		// Enable $entry access in template
		set_query_var( 'entry', $entry );
			->setup_subtitle();

		// Get the template
		pp_get_template( 'single/layout', $this->slug );

	}


}