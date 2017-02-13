<?php
/*
 * Archive Portfolio Description
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
			<?php phort_the_archive_title() ?>
		</h1>

		<?php if ( phort_get_archive_content() ): ?>
			<div class="PP_Description__content">
				<?php phort_the_archive_content(); ?>
			</div> <!-- .PP_Description__content -->
		<?php endif; ?>

	</div> <!-- .PP_Description__inner -->
</div> <!-- PP_Description -->