<?php

global $cmp_gallery_data, $attachment;


$class = array(
	'Gallery__item',
	'Gallery__item--' . $attachment->type,
	'PP-Masonry__item',
	'Lazy-Image',
	'image-' . $attachment->orientation
);

?>

<figure class="<?php echo implode( "  ", $class ) ?>" <?php $cmp_gallery_data->render(); ?>>

	<?php cmp_get_template( 'single/gallery/item/' . $attachment->type ); ?>
	<?php cmp_get_template( 'single/gallery/item/noscript' ); ?>

</figure> <!-- .Gallery__item -->

