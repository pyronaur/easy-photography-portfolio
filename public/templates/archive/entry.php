<?php
/**
 * Available Global Variables: $portfolio, $entry
 *
 * @var $portfolio Photography_Portoflio\Frontend\Layout\Single\Single_Portfolio_Layout
 * @var $entry     Photography_Portoflio\Frontend\Layout\Entry\Entry
 *
 * @TODO:
 *      Create user friendly functions to access common template values.
 *      For example:
 *          `cmp_subtitle()` instead of  `$entry->subtitle`
 *                               and/or
 *          `cmp_data()` instead `of $entry->data_render`
 *
 */
?>

<div class="PP-Masonry__item PP-Hovercard" <?php $entry->data_render() ?> id="PP-Entry-<?php the_ID() ?>">

	<div class="PP-Masonry__thumbnail">
		<?php $entry->show_featured_image(); ?>
	</div> <!-- .PP-Hovercard__thumbnail -->

	<div class="PP-Hovercard__header">

		<h3 class="PP-Hovercard__title">
			<a href="<?php the_permalink(); ?>">
				<?php the_title(); ?>
			</a>
		</h3>

		<?php if ( $entry->subtitle ): ?>
			<hr class="PP-Hovercard__separator">
			<h4 class="PP-Hovercard__subtitle"><?php echo esc_html( $entry->subtitle ); ?></h4>
		<?php endif; ?>

	</div> <!-- .PP-Hovercard__header -->


	<a class="PP-Hovercard__popup" href="<?php the_permalink(); ?>">
			<span class="PP-Hovercard__inner">
				<span class="PP-Hovercard__view">
					<?php esc_html_e( 'View Gallery', 'bluebird-theme' ) ?>
				</span>
			</span>
	</a> <!-- .PP-Hovercard__popup -->

</div>