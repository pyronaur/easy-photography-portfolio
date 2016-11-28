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
				'name'               => _x( 'Portfolio Entries', 'Post Type General Name', 'MELON_TXT' ),
				'singular_name'      => _x( 'Portfolio Entry', 'Post Type Singular Name', 'MELON_TXT' ),
				'menu_name'          => __( 'Portfolio', 'MELON_TXT' ),
				'parent_item_colon'  => __( 'Parent Entry', 'MELON_TXT' ),
				'all_items'          => __( 'All Entries', 'MELON_TXT' ),
				'view_item'          => __( 'View Entries', 'MELON_TXT' ),
				'add_new_item'       => __( 'Add New Portfolio  Entry', 'MELON_TXT' ),
				'add_new'            => __( 'New Portfolio  Entry', 'MELON_TXT' ),
				'edit_item'          => __( 'Edit Portfolio Entry', 'MELON_TXT' ),
				'update_item'        => __( 'Update Entry', 'MELON_TXT' ),
				'search_items'       => __( 'Search portfolio', 'MELON_TXT' ),
				'not_found'          => __( 'No portfolio entries found', 'MELON_TXT' ),
				'not_found_in_trash' => __( 'No portfolio entries found in Trash', 'MELON_TXT' ),
			)
		);

		$args = apply_filters(
			'pp/post_type/args',
			array(
				'label'               => __( 'portfolio', 'MELON_TXT' ),
				'description'         => __( 'Portfolio', 'MELON_TXT' ),
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
				'name'                       => _x( 'Portfolio Categories', 'Taxonomy General Name', 'MELON_TXT' ),
				'singular_name'              => _x( 'Portfolio Category', 'Taxonomy Singular Name', 'MELON_TXT' ),
				'menu_name'                  => __( 'Categories', 'MELON_TXT' ),
				'all_items'                  => __( 'All Categories', 'MELON_TXT' ),
				'parent_item'                => __( 'Parent Category', 'MELON_TXT' ),
				'parent_item_colon'          => __( 'Parent Category:', 'MELON_TXT' ),
				'new_item_name'              => __( 'New Category Name', 'MELON_TXT' ),
				'add_new_item'               => __( 'Add New Category', 'MELON_TXT' ),
				'edit_item'                  => __( 'Edit Category', 'MELON_TXT' ),
				'update_item'                => __( 'Update Category', 'MELON_TXT' ),
				'separate_items_with_commas' => __( 'Separate categories with commas', 'MELON_TXT' ),
				'search_items'               => __( 'Search Portfolio categories', 'MELON_TXT' ),
				'add_or_remove_items'        => __( 'Add or remove categories', 'MELON_TXT' ),
				'choose_from_most_used'      => __( 'Choose from the most used categories', 'MELON_TXT' ),
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