<?php
/*
 * Generic Single Portfolio View
 * @since 1.0.0
 * @modified 1.0.0
 */
?>

<?php while ( have_posts() ) : the_post(); ?>

	<?php if ( post_password_required() ): ?>
		<?php phort_get_template( 'single/protected-portfolio-entry' ); ?>
	<?php else: ?>
		<?php phort_get_template( 'single/portfolio-entry' ) ?>
	<?php endif; ?>

<?php endwhile;