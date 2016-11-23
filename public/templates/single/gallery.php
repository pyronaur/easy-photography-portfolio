<?php
/*
 * Gallery Loop
 * @since 1.0.0
 * @modified 1.0.0
 */

?>
<div <?php pp_class( 'PP_Gallery' ) ?>>

	<?php
	/**
	 * Start a loop and load all gallery items
	 * @load /single/gallery/loop-item.php
	 */
	pp_display_gallery();
	?>

</div> <!-- .PP_Gallery -->