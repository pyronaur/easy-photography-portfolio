<?php
/**
 * Available Global Variables: $portfolio, $entry
 *
 * @var $portfolio Photography_Portoflio\Frontend\Layout\Single\Single_Portfolio_Layout
 * @var $entry Photography_Portoflio\Frontend\Layout\Entry\Entry
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

<div class="Gallery__item entry-masonry entry-masonry--portfolio entry-portfolio--hovercard enable-hover" <?php $entry->data_render() ?>
     id="gallery-<?php the_ID() ?>">

	<div class="hovercard__thumbnail">
		<?php $entry->show_featured_image(); ?>
	</div> <!-- .hovercard__thumbnail -->

	<h3 class="hovercard__title">
		<a href="<?php the_permalink(); ?>">
			<?php the_title(); ?>
		</a>
	</h3>

	<div class="hovercard__popup">
		<div class="hovercard__inner">

			<h2 class="hovercard__title--popup">
				<a href="<?php the_permalink(); ?>">
					<?php the_title(); ?>
				</a>
			</h2>

			<?php if ( $entry->subtitle ): ?>
				<h4 class="hovercard__subtitle"><?php echo esc_html( $entry->subtitle ); ?></h4>
			<?php endif; ?>


			<hr class="sepline">

			<a class="view-gallery" href="<?php the_permalink(); ?>">
				<?php esc_html_e( 'View Gallery', 'bluebird-theme' ) ?>
			</a>

		</div> <!-- .hovercard__inner -->
	</div> <!-- .hovercard__popup -->

</div>