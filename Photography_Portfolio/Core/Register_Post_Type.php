<?php


namespace Photography_Portfolio\Core;


class Register_Post_Type {


	public static function register_post_type() {

		$labels = apply_filters(
			'phort/post_type/labels',
			[
				'name'               => esc_html_x( 'Portfolio Entries', 'Post Type General Name', 'photography-portfolio' ),
				'singular_name'      => esc_html_x( 'Portfolio Entry', 'Post Type Singular Name', 'photography-portfolio' ),
				'menu_name'          => esc_html__( 'Portfolio', 'photography-portfolio' ),
				'parent_item_colon'  => esc_html__( 'Parent Entry', 'photography-portfolio' ),
				'all_items'          => esc_html__( 'All Entries', 'photography-portfolio' ),
				'view_item'          => esc_html__( 'View Entries', 'photography-portfolio' ),
				'add_new_item'       => esc_html__( 'Add New Portfolio  Entry', 'photography-portfolio' ),
				'add_new'            => esc_html__( 'New Portfolio  Entry', 'photography-portfolio' ),
				'edit_item'          => esc_html__( 'Edit Portfolio Entry', 'photography-portfolio' ),
				'update_item'        => esc_html__( 'Update Entry', 'photography-portfolio' ),
				'search_items'       => esc_html__( 'Search portfolio', 'photography-portfolio' ),
				'not_found'          => esc_html__( 'No portfolio entries found', 'photography-portfolio' ),
				'not_found_in_trash' => esc_html__( 'No portfolio entries found in Trash', 'photography-portfolio' ),
			]
		);

		$args = apply_filters(
			'phort/post_type/args',
			[
				'label'               => esc_html__( 'portfolio', 'photography-portfolio' ),
				'description'         => esc_html__( 'Portfolio', 'photography-portfolio' ),
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
				'name'                       => esc_html_x( 'Portfolio Categories', 'Taxonomy General Name', 'photography-portfolio' ),
				'singular_name'              => esc_html_x( 'Portfolio Category', 'Taxonomy Singular Name', 'photography-portfolio' ),
				'menu_name'                  => esc_html__( 'Categories', 'photography-portfolio' ),
				'all_items'                  => esc_html__( 'All Categories', 'photography-portfolio' ),
				'parent_item'                => esc_html__( 'Parent Category', 'photography-portfolio' ),
				'parent_item_colon'          => esc_html__( 'Parent Category:', 'photography-portfolio' ),
				'new_item_name'              => esc_html__( 'New Category Name', 'photography-portfolio' ),
				'add_new_item'               => esc_html__( 'Add New Category', 'photography-portfolio' ),
				'edit_item'                  => esc_html__( 'Edit Category', 'photography-portfolio' ),
				'update_item'                => esc_html__( 'Update Category', 'photography-portfolio' ),
				'separate_items_with_commas' => esc_html__( 'Separate categories with commas', 'photography-portfolio' ),
				'search_items'               => esc_html__( 'Search Portfolio categories', 'photography-portfolio' ),
				'add_or_remove_items'        => esc_html__( 'Add or remove categories', 'photography-portfolio' ),
				'choose_from_most_used'      => esc_html__( 'Choose from the most used categories', 'photography-portfolio' ),
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
