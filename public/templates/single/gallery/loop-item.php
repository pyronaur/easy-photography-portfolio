<?php

global $cmp_gallery_data, $attachment;


$class = array(
	'Gallery__item',
	'Gallery__item--' . $attachment->type,
	'image-' . $attachment->orientation,
	'lazy-image',
	'js__lazy',
	'js__gallery-image',
);

?>

<figure class="<?php echo implode( "  ", $class ) ?>" <?php $cmp_gallery_data->render(); ?>>

	Thing: <?php echo $attachment->type ?>
	<?php cmp_get_template( 'single/gallery/item/' . $attachment->type ); ?>
	<?php cmp_get_template( 'single/gallery/item/noscript' ); ?>

</figure> <!-- .Gallery__item -->

