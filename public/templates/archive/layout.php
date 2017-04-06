<?php
/*
 * Generic Archive Layout
 * @since 1.0.0
 * @modified 1.1.1
 */
?>

<?php
/**
 * Display Archive Descriptions, if they're enabled
 */
if ( 'enable' == phort_get_option( 'archive_description', 'disable' ) ) {
	phort_get_template( 'archive/description' );
}
?>

<?php

var_dump( phort_get_option( 'foobar', 'yes' ) );

?>

<?php do_action( 'phort/archive/container/open' ); ?>

	<div <?php phort_class( 'PP_Archive_Container' ); ?>>

		<?php do_action( 'phort/archive/loop/start' ); ?>

		<?php while ( have_posts() ) : the_post(); ?>
			<?php phort_get_template( 'archive/entry' ); ?>
		<?php endwhile; ?>

		<?php do_action( 'phort/archive/loop/end' ); ?>

	</div>

<?php do_action( 'phort/archive/container/open' ); ?>