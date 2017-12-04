<?php
/**
 * Gallery Loop Item
 * @since 1.0.0
 * @modified 1.0.0
 */

$attachment = phort_get_gallery_attachment();

$class = array(
	'PP_Gallery__item',
	'PP_Gallery__item--' . $attachment->type,
	'PP_Lazy_Image',
	'image-' . $attachment->orientation,
);

?>

<figure <?php phort_class( $class ) ?> <?php phort_gallery_data_attribute(); ?>>

	<?php phort_get_template( 'gallery/item/' . $attachment->type ); ?>
	<?php phort_get_template( 'gallery/caption' ); ?>
	<?php phort_get_template( 'gallery/item/noscript' ); ?>

</figure> <!-- .PP_Gallery__item -->