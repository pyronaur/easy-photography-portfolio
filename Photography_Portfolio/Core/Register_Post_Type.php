<?php


namespace Photography_Portfolio\Core;


class Register_Post_Type {


	/**
	 * Register_Post_type constructor.
	 */
	public function __construct() {

		add_action( 'init', array( $this, 'register_post_type' ), 5 );
		add_action( 'init', array( $this, 'register_taxonomy' ), 5 );

	}


	public function register_post_type() {

		$labels = apply_filters(
			'pp/post_type/labels',
			array(
				'name'               => _x( 'Portfolio Entries', 'Post Type General Name', 'pp-plugin' ),
				'singular_name'      => _x( 'Portfolio Entry', 'Post Type Singular Name', 'pp-plugin' ),
				'menu_name'          => __( 'Portfolio', 'pp-plugin' ),
				'parent_item_colon'  => __( 'Parent Entry', 'pp-plugin' ),
				'all_items'          => __( 'All Entries', 'pp-plugin' ),
				'view_item'          => __( 'View Entries', 'pp-plugin' ),
				'add_new_item'       => __( 'Add New Portfolio  Entry', 'pp-plugin' ),
				'add_new'            => __( 'New Portfolio  Entry', 'pp-plugin' ),
				'edit_item'          => __( 'Edit Portfolio Entry', 'pp-plugin' ),
				'update_item'        => __( 'Update Entry', 'pp-plugin' ),
				'search_items'       => __( 'Search portfolio', 'pp-plugin' ),
				'not_found'          => __( 'No portfolio entries found', 'pp-plugin' ),
				'not_found_in_trash' => __( 'No portfolio entries found in Trash', 'pp-plugin' ),
			)
		);

		$args = apply_filters(
			'pp/post_type/args',
			array(
				'label'               => __( 'portfolio', 'pp-plugin' ),
				'description'         => __( 'Portfolio', 'pp-plugin' ),
				'labels'              => $labels,
				'supports'            => array( 'title', 'editor', 'excerpt', 'thumbnail', 'custom-fields' ),
				'hierarchical'        => false,
				'public'              => true,
				'show_ui'             => true,
				'show_in_menu'        => true,
				'show_in_nav_menus'   => true,
				'show_in_admin_bar'   => true,
				'menu_position'       => 5,
				'menu_icon'           => 'dashicons-portfolio',
				'can_export'          => true,
				'has_archive'         => true,
				'exclude_from_search' => false,
				'publicly_queryable'  => true,
				'capability_type'     => 'post',
				'rewrite'             => [ 'slug' => 'portfolio' ],

			)
		);


		register_post_type( 'pp_post', $args );
	}


	public function register_taxonomy() {

		$labels = apply_filters(
			'pp/taxonomy/labels',
			array(
				'name'                       => _x( 'Portfolio Categories', 'Taxonomy General Name', 'pp-plugin' ),
				'singular_name'              => _x( 'Portfolio Category', 'Taxonomy Singular Name', 'pp-plugin' ),
				'menu_name'                  => __( 'Categories', 'pp-plugin' ),
				'all_items'                  => __( 'All Categories', 'pp-plugin' ),
				'parent_item'                => __( 'Parent Category', 'pp-plugin' ),
				'parent_item_colon'          => __( 'Parent Category:', 'pp-plugin' ),
				'new_item_name'              => __( 'New Category Name', 'pp-plugin' ),
				'add_new_item'               => __( 'Add New Category', 'pp-plugin' ),
				'edit_item'                  => __( 'Edit Category', 'pp-plugin' ),
				'update_item'                => __( 'Update Category', 'pp-plugin' ),
				'separate_items_with_commas' => __( 'Separate categories with commas', 'pp-plugin' ),
				'search_items'               => __( 'Search Portfolio categories', 'pp-plugin' ),
				'add_or_remove_items'        => __( 'Add or remove categories', 'pp-plugin' ),
				'choose_from_most_used'      => __( 'Choose from the most used categories', 'pp-plugin' ),
			)
		);

		$args = apply_filters(
			'pp/taxonomy/args',
			array(
				'labels'            => $labels,
				'hierarchical'      => true,
				'public'            => true,
				'show_ui'           => true,
				'show_admin_column' => true,
				'show_in_nav_menus' => true,
				'show_tagcloud'     => false,
			)
		);


		register_taxonomy( 'pp_post_category', 'pp_post', $args );

	}


}