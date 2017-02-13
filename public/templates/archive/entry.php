<?php
/*
 * Generic Archive Entry
 * @since 1.0.0
 * @modified 1.0.0
 */
?>

<div <?php phort_class( 'PP_Entry' ); ?> <?php phort_entry_data_attribute() ?> id="PP_Entry-<?php the_ID() ?>">

	<?php if ( phort_entry_has_featured_image() ): ?>
		<div class="PP_Entry__thumbnail">
			<?php phort_entry_the_featured_image() ?>
		</div> <!-- .PP_Entry__thumbnail -->
	<?php else: ?>
		<div class="PP_Entry__thumbnail--replacement"></div>
	<?php endif; ?>

	<div class="PP_Entry__header">

		<h3 class="PP_Entry__title">
			<a href="<?php the_permalink(); ?>" <?php phort_class('PP_Entry__permalink') ?>>
				<?php the_title(); ?>
			</a>
		</h3>

		<?php if ( phort_entry_has_subtitle() ): ?>
			<h4 class="PP_Entry__subtitle"><?php echo esc_html( phort_entry_get_subtitle() ); ?></h4>
		<?php endif; ?>

	</div> <!-- .PP_Entry__header -->


	<a class="PP_Entry__more" href="<?php the_permalink(); ?>">
			<span class="PP_Entry__inner">
				<span class="PP_Entry__view">
					<?php esc_html_e( 'View Gallery', 'phort-plugin' ) ?>
				</span>
			</span>
	</a> <!-- .PP_Entry__popup -->

</div>