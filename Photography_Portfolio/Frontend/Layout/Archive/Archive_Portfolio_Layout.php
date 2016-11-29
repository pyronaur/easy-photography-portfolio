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


		$this->maybe_filter_css_classes();
		add_action( 'pp/get_template/archive/entry', [ $this, 'setup_postdata' ] );


	}


	/**
	 * Method run via hook each time before pp_get_layout() is called to populate entry data
	 *
	 * @param $id
	 *
	 * @return Entry instance
	 */
	public function setup_postdata() {

		$this->entry = ( new Entry( get_the_ID() ) )
			->setup_featured_image( $this->attached_sizes['thumb'] )
			->setup_subtitle();

		set_query_var( 'entry', $this->entry );

	}

}