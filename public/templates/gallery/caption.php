<?php
/*
 * Gallery Item Caption
 *
 * @since 1.0.0
 * @modified 1.2.0
 */

$attachment = phort_get_gallery_attachment();

if ( $attachment->caption || $attachment->description ): ?>
	<figcaption class="PP_Gallery__caption">

		<?php if ( $attachment->caption ): ?>
			<h4 class="PP_Caption__title"><?php echo wp_kses_post( $attachment->caption ); ?></h4>
		<?php endif; ?>
		<?php if ( $attachment->description ): ?>
			<p class="PP_Caption__desc"><?php echo wp_kses_post( $attachment->description ); ?></p>
		<?php endif; ?>
	</figcaption>
<?php endif; ?>