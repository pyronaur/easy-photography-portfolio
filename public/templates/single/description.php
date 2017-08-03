<?php
/*
 * Single Portfolio Description
 * @since 1.0.0
 * @modified 1.0.0
 */

/**
 * Display entry Title, Subtitle, Description
 */
?>
<div <?php phort_class( 'PP_Description' ) ?>>
	<div class="PP_Description__inner">
		<h1 class="PP_Description__title">
			<?php the_title() ?>
		</h1>

		<?php if ( phort_entry_has_subtitle() ): ?>
			<span class="PP_Description__subtitle"><?php echo esc_html( phort_entry_get_subtitle() ); ?></span>
		<?php endif; ?>

		<?php if ( get_the_content() ): ?>
			<div class="PP_Description__content">
				<?php the_content(); ?>
			</div> <!-- .PP_Description__content -->
		<?php endif; ?>
	</div> <!-- .PP_Description__inner -->
</div> <!-- PP_Description -->