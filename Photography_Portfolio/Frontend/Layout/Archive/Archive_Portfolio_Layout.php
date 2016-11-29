<?php


namespace Photography_Portfolio\Frontend\Layout\Archive;


use Photography_Portfolio\Contracts\Layout_Factory_Interface;
use Photography_Portfolio\Frontend\Filter_CSS_Classes;
use Photography_Portfolio\Frontend\Layout\Entry\Entry;
use Photography_Portfolio\Frontend\Template;
use Photography_Portfolio\Frontend\Template_Trait;

/**
 * Class Archive_Portfolio_Layout
 * @package Photography_Portfolio\Frontend\Layout\Archive
 */
abstract class Archive_Portfolio_Layout implements Layout_Factory_Interface {

	use Template_Trait;
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
	 * Archive_Portfolio_Layout constructor.
	 */
	public function __construct( $slug, \WP_Query $query ) {

		$this->query = $query;
		$this->slug  = $slug;

	}


	/**
	 *
	 */
	public function display() {

		$this->maybe_filter_css_classes();
		$this->get( 'archive/layout' );

	}


	/**
	 * Method to display a single entry of a portfolio archive
	 *
	 * @see Template_Trait - $this->slug is always implied when getting a template
	 *
	 * @param $id
	 */
	public function the_entry( $id ) {

		set_query_var( 'entry', $this->create_entry( $id ) );
		$this->get( 'archive/entry' );

	}


	/**
	 * Method to create a new entry
	 *
	 * @param $id
	 *
	 * @return Entry instance
	 */
	public function create_entry( $id ) {

		return ( new Entry( $id ) )
			->setup_featured_image( $this->attached_sizes['thumb'] )
			->setup_subtitle();
	}

}