<?php
/**
 * Available Global Variables: $portfolio, $entry
 *
 * @var $portfolio Photography_Portoflio\Frontend\Layout\Single\Single_Portfolio_Layout
 * @var $entry     Photography_Portoflio\Frontend\Layout\Entry\Entry
 *
 * @TODO: Create user friendly functions to access common template values.
 *      For example:
 *          `pp_subtitle()` instead of  `$entry->subtitle`
 *                               and/or
 *          `pp_data()` instead `of $entry->data_render`
 *
 */
?>

<div class="PP_Masonry__item PP_Hovercard" <?php $entry->data_render() ?> id="PP_Entry-<?php the_ID() ?>">

	<div class="PP_Masonry__thumbnail">
		<?php $entry->show_featured_image(); ?>
	</div> <!-- .PP_Hovercard__thumbnail -->

	<div class="PP_Hovercard__header">

		<h3 class="PP_Hovercard__title">
			<a href="<?php the_permalink(); ?>">
				<?php the_title(); ?>
			</a>
		</h3>

		<?php if ( $entry->subtitle ): ?>
			<h4 class="PP_Hovercard__subtitle"><?php echo esc_html( $entry->subtitle ); ?></h4>
		<?php endif; ?>

	</div> <!-- .PP_Hovercard__header -->


	<a class="PP_Hovercard__popup" href="<?php the_permalink(); ?>">
			<span class="PP_Hovercard__inner">
				<span class="PP_Hovercard__view">
					<?php esc_html_e( 'View Gallery', 'bluebird-theme' ) ?>
				</span>
			</span>
	</a> <!-- .PP_Hovercard__popup -->

</div>