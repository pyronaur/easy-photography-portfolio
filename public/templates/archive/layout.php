<?php
/**
 * Generic Archive Layout
 * @since    1.0.0
 * @modified 1.4.6
 */
?>

<?php phort_get_template( 'archive/description' ); ?>

<div <?php phort_class( 'PP_Archive_Container' ); ?>>

	<?php do_action( 'phort/archive/loop/start' ); ?>

	<?php while ( have_posts() ) : the_post(); ?>
		<?php phort_get_template( 'archive/entry' ); ?>
	<?php endwhile; ?>

	<?php do_action( 'phort/archive/loop/end' ); ?>

</div>