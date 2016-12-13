<?php
/*
 * Gallery Item Caption
 * @since 1.0.0
 * @modified 1.0.0
 */

$attachment = phort_get_gallery_attachment();

if ( $attachment->description ): ?>
	<figcaption class="PP_Gallery__caption"><?= wp_kses_post( $attachment->description ); ?></figcaption>
<?php endif; ?>