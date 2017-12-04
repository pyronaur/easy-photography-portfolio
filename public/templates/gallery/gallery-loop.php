<?php
/**
 * @since 1.4.0
 *
 * There is almost no reason to ever modify this file in a theme!
 * Try not to.
 *
 * Instead, have a look at `phort_get_template_{$template}` @hook!
 */
?>
<div <?php phort_class( 'PP_Gallery' ) ?>>
	<?php do_action( 'phort/gallery-loop/start' ) ?>

	<?php
	if ( phort_gallery_has_items() ):
		while ( phort_gallery_has_items() ): phort_gallery_setup_item();
			phort_get_template( 'gallery/loop-item' );
		endwhile;
	endif;
	?>

	<?php do_action( 'phort/gallery-loop/end' ) ?>
</div> <!-- .PP_Gallery -->
