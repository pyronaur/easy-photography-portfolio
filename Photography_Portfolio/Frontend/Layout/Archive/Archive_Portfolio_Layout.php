<?php


namespace Photography_Portfolio\Frontend\Layout\Archive;


use Photography_Portfolio\Contracts\Layout_Factory_Interface;
use Photography_Portfolio\Frontend\Filter_CSS_Classes;
use Photography_Portfolio\Frontend\Layout\Entry\Entry;

/**
 * Class Archive_Portfolio_Layout
 * @package Photography_Portfolio\Frontend\Layout\Archive
 */
abstract class Archive_Portfolio_Layout implements Layout_Factory_Interface {

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
	 * Store $entry for public access
	 * @var Entry $entry
	 */
	public $entry;


	/**
	 * Archive_Portfolio_Layout constructor.
	 */
	public function __construct( $slug, \WP_Query $query ) {

		$this->query = $query;
		$this->slug  = $slug;

		/**
		 * Allow themes to alter attached image sizes
		 * Example full string hook would look somthing like this: `phort/masonry/attached_sizes`
		 *
		 * @uses apply_filters()
		 * @since 1.0.5
		 */
		$this->attached_sizes = apply_filters("phort/archive/$slug/attached_sizes", $this->attached_sizes, $this);


		$this->maybe_filter_css_classes();

		/**
		 * Setup entry data when `phort_get_template` is used
		 */
		add_action( 'phort/load_template/archive/entry', [ $this, 'setup_postdata' ] );

		/**
		 * Maybe alter the entry class
		 */
		add_filter( 'phort_get_class', [ $this, 'filter_entry_class' ] );





	}


	public function filter_entry_class( $classes ) {

		if ( in_array( 'PP_Entry', $classes ) ) {
			if ( ! phort_entry_has_featured_image() ) {
				$classes[] = 'PP_Entry--no-thumbnail';
			}
		}

		return $classes;
	}


	/**
	 * Method run via hook each time before phort_get_layout() is called to populate entry data
	 *
	 * @param $id
	 *
	 * @return Entry instance
	 * @TODO: This still needs a better interface. This isn't dry ( entry setup is repeated in single-portfolio too )
	 */
	public function setup_postdata() {

		$this->entry = ( new Entry( get_the_ID() ) )
			->setup_featured_image( $this->attached_sizes['thumb'] )
			->setup_subtitle();

	}

}