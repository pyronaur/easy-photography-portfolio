<?php


namespace Photography_Portfolio\Frontend\Layout\Single;


use Photography_Portfolio\Contracts\Layout_Factory_Interface;
use Photography_Portfolio\Frontend\Filter_CSS_Classes;
use Photography_Portfolio\Frontend\Gallery\Attachment;
use Photography_Portfolio\Frontend\Gallery_Data_Renderer;
use Photography_Portfolio\Frontend\Layout\Entry\Entry;

/**
 * Class Single_Portfolio_Layout
 * @property \Photography_Portfolio\Frontend\Gallery\Gallery gallery
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
	public $attached_sizes = [
		'thumb' => 'full',
		'full'  => 'full',
	];

	/**
	 * @var $id `post_id`
	 */
	public $id;


	public $entry;

	public $gallery;


	/**
	 * Single_Portfolio_Layout constructor.
	 */
	public function __construct( $slug, \WP_Query $query ) {

		$this->query = $query;
		$this->slug  = $slug;
		$this->id    = $query->get_queried_object_id();

		/**
		 * Allow themes to alter attached image sizes
		 * Example full string hook would look somthing like this: `phort/masonry/attached_sizes`
		 *
		 * @uses  apply_filters()
		 * @since 1.0.5
		 */
		$this->attached_sizes = apply_filters( "phort/single/$slug/attached_sizes", $this->attached_sizes, $this );


		$this->entry   = new Entry( $this->id );
		$this->gallery = new Single_Portfolio_Gallery( $this->id );

		$this->maybe_filter_css_classes();
		$this->setup_postdata();


	}


	/**
	 * Setup entry featured image and subtitle
	 */
	public function setup_postdata() {

		// Create Entry instance
		$this->entry
			->setup_featured_image( $this->attached_sizes['thumb'] )
			->setup_subtitle();

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
}