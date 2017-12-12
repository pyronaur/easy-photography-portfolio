<?php


namespace Photography_Portfolio\Core;


class Register_Post_Type {


	public static function register_post_type() {

		$labels = apply_filters(
			'phort/post_type/labels',
			[
				'name'               => _x( 'Portfolio Entries', 'Post Type General Name', 'photography-portfolio' ),
				'singular_name'      => _x( 'Portfolio Entry', 'Post Type Singular Name', 'photography-portfolio' ),
				'menu_name'          => __( 'Portfolio', 'photography-portfolio' ),
				'parent_item_colon'  => __( 'Parent Entry', 'photography-portfolio' ),
				'all_items'          => __( 'All Entries', 'photography-portfolio' ),
				'view_item'          => __( 'View Entries', 'photography-portfolio' ),
				'add_new_item'       => __( 'Add New Portfolio  Entry', 'photography-portfolio' ),
				'add_new'            => __( 'New Portfolio  Entry', 'photography-portfolio' ),
				'edit_item'          => __( 'Edit Portfolio Entry', 'photography-portfolio' ),
				'update_item'        => __( 'Update Entry', 'photography-portfolio' ),
				'search_items'       => __( 'Search portfolio', 'photography-portfolio' ),
				'not_found'          => __( 'No portfolio entries found', 'photography-portfolio' ),
				'not_found_in_trash' => __( 'No portfolio entries found in Trash', 'photography-portfolio' ),
			]
		);

		$args = apply_filters(
			'phort/post_type/args',
			[
				'label'               => __( 'portfolio', 'photography-portfolio' ),
				'description'         => __( 'Portfolio', 'photography-portfolio' ),
				'labels'              => $labels,
				'supports'            => [ 'title', 'editor', 'excerpt', 'thumbnail', 'custom-fields' ],
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
				'show_in_rest'        => true,
				'capability_type'     => 'post',
				'rewrite'             => [ 'slug' => 'portfolio' ],

			]
		);


		register_post_type( 'phort_post', $args );
	}


	public static function register_taxonomy() {

		$labels = apply_filters(
			'phort/taxonomy/labels',
			[
				'name'                       => _x( 'Portfolio Categories', 'Taxonomy General Name', 'photography-portfolio' ),
				'singular_name'              => _x( 'Portfolio Category', 'Taxonomy Singular Name', 'photography-portfolio' ),
				'menu_name'                  => __( 'Categories', 'photography-portfolio' ),
				'all_items'                  => __( 'All Categories', 'photography-portfolio' ),
				'parent_item'                => __( 'Parent Category', 'photography-portfolio' ),
				'parent_item_colon'          => __( 'Parent Category:', 'photography-portfolio' ),
				'new_item_name'              => __( 'New Category Name', 'photography-portfolio' ),
				'add_new_item'               => __( 'Add New Category', 'photography-portfolio' ),
				'edit_item'                  => __( 'Edit Category', 'photography-portfolio' ),
				'update_item'                => __( 'Update Category', 'photography-portfolio' ),
				'separate_items_with_commas' => __( 'Separate categories with commas', 'photography-portfolio' ),
				'search_items'               => __( 'Search Portfolio categories', 'photography-portfolio' ),
				'add_or_remove_items'        => __( 'Add or remove categories', 'photography-portfolio' ),
				'choose_from_most_used'      => __( 'Choose from the most used categories', 'photography-portfolio' ),
			]
		);

		$args = apply_filters(
			'phort/taxonomy/args',
			[
				'labels'            => $labels,
				'hierarchical'      => true,
				'public'            => true,
				'show_ui'           => true,
				'show_admin_column' => true,
				'show_in_nav_menus' => true,
				'show_tagcloud'     => false,
				'rewrite'           => [
					'slug'       => 'portfolio/category',
					'with_front' => false,
				],
			]
		);


		register_taxonomy( 'phort_post_category', 'phort_post', $args );

	}


}