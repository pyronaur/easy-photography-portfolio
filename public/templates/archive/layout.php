<?php
/*
 * Generic Archive Layout
 * @since 1.0.0
 * @modified 1.0.0
 */
?>

<?php
/**
 * Display Archive Descriptions, if they're enabled
 */
if ( pp_get_option( 'archive_enable_description', false ) ) {
	pp_get_template( 'archive/description' );
}
?>

<div <?php pp_class( 'PP_Archive_Container' ); ?>>

	<?php while ( have_posts() ) : the_post(); ?>

		<?php pp_get_template( 'archive/entry' ); ?>


	<?php endwhile; ?>

</div>