<?php

/**
 * @var Gallery_Data_Interface $gallery_item
 * @var \Photography_Portfolio\Frontend\Gallery\Attachment $attachment
 */
use CLM\Metamod;
use Photography_Portoflio\Frontend\Gallery_Data_Interface;

global $cm_portfolio, $cmp_gallery_data, $attachment;


$class = array(
	'Gallery__item',
	'Gallery__item--' . $attachment->type,
	'image-' . $attachment->orientation,
	'lazy-image',
	'js__lazy',
);

/**
 * Enable Popup-galery
 * @TODO: Remove Metamod
 */
if ( true === Metamod::get_value( 'enable_popups' ) ) {
	$class[] = 'js__gallery-image';
}
?>

<figure class="<?php echo implode( "  ", $class ) ?>" <?php $cmp_gallery_data->render(); ?>>

	<?php $cm_portfolio->get( 'single/gallery/item/' . $attachment->type ); ?>
	<?php $cm_portfolio->get( 'single/gallery/item/noscript' ); ?>

</figure> <!-- .Gallery__item -->

