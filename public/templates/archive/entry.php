<?php
/*
 * Generic Archive Entry
 * @since 1.0.0
 * @modified 1.0.0
 */

/**
 * Available Global Variables: $portfolio, $entry
 *
 * @var $portfolio Photography_Portfolio\Frontend\Layout\Single\Single_Portfolio_Layout
 * @var $entry     Photography_Portfolio\Frontend\Layout\Entry\Entry
 *
 * @TODO: Create user friendly functions to access common template values.
 *      For example:
 *          `pp_subtitle()` instead of  `$entry->subtitle`
 *                               and/or
 *          `pp_data()` instead `of $entry->data_render`
 *
 */
?>

<div <?php pp_class('PP_Entry');?> <?php $entry->data_render() ?> id="PP_Entry-<?php the_ID() ?>">

	<div class="PP_Entry__thumbnail">
		<?php $entry->show_featured_image(); ?>
	</div> <!-- .PP_Entry__thumbnail -->

	<div class="PP_Entry__header">

		<h3 class="PP_Entry__title">
			<a href="<?php the_permalink(); ?>">
				<?php the_title(); ?>
			</a>
		</h3>

		<?php if ( $entry->subtitle ): ?>
			<h4 class="PP_Entry__subtitle"><?php echo esc_html( $entry->subtitle ); ?></h4>
		<?php endif; ?>

	</div> <!-- .PP_Entry__header -->


	<a class="PP_Entry__more" href="<?php the_permalink(); ?>">
			<span class="PP_Entry__inner">
				<span class="PP_Entry__view">
					<?php esc_html_e( 'View Gallery', 'bluebird-theme' ) ?>
				</span>
			</span>
	</a> <!-- .PP_Entry__popup -->

</div>