<?php


namespace Photography_Portfolio\Frontend;


trait Filter_CSS_Classes {

	protected $appended_classes = [
		/**
		 *  Append classnames in a dynamic manner:
		 * 'condition' => 'added-classname',
		 *
		 * For example:
		 *  Value:
		 *      'PP_Gallery' => 'PP_Masonry'
		 *
		 *  Will:
		 *      Append `PP_Masonry` to all `PP_Gallery` instances
		 *      when this trait activated
		 *
		 *
		 *
		 */
	];


	public function filter_phort_get_class( $classes ) {

		foreach ( $this->appended_classes as $needle => $append ) {

			if ( in_array( $needle, $classes ) ) {

				$classes = array_merge( $classes, (array) $append );
			}

		}

		return $classes;
	}


	public function maybe_filter_css_classes() {

		if ( count( $this->appended_classes ) > 0 ) {
			add_filter( 'phort_get_class', [ $this, 'filter_phort_get_class' ] );
		}

	}


}