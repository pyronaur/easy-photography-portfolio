<?php
/*
 * Gallery Loop Item
 * @since 1.0.0
 * @modified 1.0.0
 */

$attachment = pp_get_gallery_attachment();

$class = array(
	'PP_Gallery__item',
	'PP_Gallery__item--' . $attachment->type,
	'PP_Lazy_Image',
	'image-' . $attachment->orientation,
);

?>

<figure <?php pp_class( $class ) ?> <?php pp_gallery_data_attribute(); ?>>

	<?php pp_get_template( 'single/gallery/item/' . $attachment->type ); ?>
	<?php pp_get_template( 'single/gallery/caption' ); ?>
	<?php pp_get_template( 'single/gallery/item/noscript' ); ?>

</figure> <!-- .PP_Gallery__item -->