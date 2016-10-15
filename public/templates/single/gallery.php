<?php
/**
 * @TODO: Move `PP_Masonry`
 */
?>
<div <?php cmp_class( 'PP_Gallery PP_Masonry' ) ?>>

	<?php
	/**
	 * Start a loop and load all gallery items
	 * @loads /single/gallery/loop-item.php
	 */
	cmp_display_gallery();
	?>

</div> <!-- .PP_Gallery -->