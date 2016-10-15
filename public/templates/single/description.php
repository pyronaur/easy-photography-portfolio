<?php
/**
 *
 * Display entry Title, Subtitle, Description
 *
 * Available Global Variables: $portfolio, $entry
 *
 * @var $portfolio Photography_Portoflio\Frontend\Layout\Single\Single_Portfolio_Layout
 * @var $entry     Photography_Portoflio\Frontend\Layout\Entry\Entry
 */
?>
<div class="PP_Description">
	<div class="PP_Description__inner">

		<h1 class="PP_Description__title">
			<?php the_title() ?>
		</h1>

		<?php if ( $entry->subtitle ): ?>
			<span class="PP_Description__subtitle"><?= esc_html( $entry->subtitle ); ?></span>
		<?php endif; ?>

		<?php if ( get_the_content() ): ?>
			<div class="PP_Description__content">
				<?php the_content(); ?>
			</div> <!-- .PP_Description__content -->
		<?php endif; ?>

	</div> <!-- .PP_Description__inner -->
</div> <!-- PP_Description -->