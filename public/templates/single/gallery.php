<?php
/**
 * @TODO: Move `PP_Masonry`
 */
?>
<div <?php pp_class( 'PP_Gallery PP_Masonry' ) ?>>

	<?php
	/**
	 * Start a loop and load all gallery items
	 * @load /single/gallery/loop-item.php
	 */
	pp_display_gallery();
	?>

</div> <!-- .PP_Gallery -->