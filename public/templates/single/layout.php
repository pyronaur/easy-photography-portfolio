<?php
/*
 * Generic Single Portfolio View
 * @since 1.0.0
 * @modified 1.0.0
 */
?>

<?php while ( have_posts() ) : the_post(); ?>

	<?php
	// Display the portfolio description
	phort_get_template( 'single/description' );
	?>

	<?php
	/**
	 * Display the gallery
	 */
	?>
	<div <?php phort_class( 'PP_Gallery' ) ?>>

		<?php
		if ( phort_gallery_has_items() ):
			while ( phort_gallery_has_items() ): phort_gallery_setup_item();

				phort_get_template( 'gallery/loop-item' );

			endwhile;
		endif;
		?>

	</div> <!-- .PP_Gallery -->


<?php endwhile; ?>
