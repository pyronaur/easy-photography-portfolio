<?php
/**
 * @var CLM\Gallery\Attachment $attachment
 */
global $attachment;
?>
<div class="lazy-image__placeholder"></div>

<?php if ( $attachment->description ): ?>
	<figcaption class="caption"><?= wp_kses_post( $attachment->description ); ?></figcaption>
<?php endif; ?>
