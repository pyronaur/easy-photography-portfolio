<?php

global $cmp_gallery_data, $attachment;


$class = array(
	'PP_Gallery__item',
	'PP_Gallery__item--' . $attachment->type,
	'PP_Masonry__item',
	'PP_Lazy_Image',
	'image-' . $attachment->orientation,
);

?>

<figure class="<?php echo implode( "  ", $class ) ?>" <?php $cmp_gallery_data->render(); ?>>

	<?php cmp_get_template( 'single/gallery/item/' . $attachment->type ); ?>
	<?php cmp_get_template( 'single/gallery/caption' ); ?>
	<?php cmp_get_template( 'single/gallery/item/noscript' ); ?>

</figure> <!-- .PP_Gallery__item -->