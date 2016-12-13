<?php


namespace Photography_Portfolio\Core;


use Photography_Portfolio\Frontend\Layout\Single\Packery\Single_Packery_layout;
use Photography_Portfolio\Frontend\Layout_Registry;

class Initialize_Layout_Registry {


	/**
	 * Initialize Layout registry and add default plugin layouts to it
	 *
	 * @return Layout_Registry
	 */
	public static function with_defaults() {

		$layout_registry = new Layout_Registry();


		/**
		 * Portfolio Archive
		 */
		$layout_registry->add(
			'Photography_Portfolio\Frontend\Layout\Archive\Masonry_Hovercard\Archive_Masonry_Hovercard_Layout',
			'archive',
			'masonry-hovercard',
			esc_html__( 'Masonry with hover', 'phort-plugin' )

		);

		/**
		 * Single Portfolio
		 */
		$layout_registry->add(
			'Photography_Portfolio\Frontend\Layout\Single\Masonry\Single_Masonry_Layout',
			'single',
			'masonry',
			esc_html__( 'Masonry', 'phort-plugin' )
		);

		/**
		 * You can use this hook to either register or de-register any layout
		 * @hook `phort/register_layouts`
		 */
		do_action( 'phort/core/register_layouts', $layout_registry );


		/**
		 * Return Layout_Registry instance
		 */
		return $layout_registry;
	}
}