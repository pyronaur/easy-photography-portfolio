<?php
/**
 * @var CLM\Gallery\Attachment $attachment
 */
global $attachment;
?>
<noscript>
	<img src="<?php echo esc_url( $attachment->get_image_url( 'large' ) ) ?>"
	     alt="<?php echo esc_attr( $attachment->caption ) ?>"/>
</noscript>