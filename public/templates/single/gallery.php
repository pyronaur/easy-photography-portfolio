<?php
/**
 * Wrap the gallery loop and display gallery
 *
 * Available Global Variables: $cm_portfolio, $entry
 *
 * @var $cm_portfolio Photography_Portoflio\Frontend\Layout\Single\Single_Portfolio_Layout
 * @var $entry        Photography_Portoflio\Frontend\Layout\Entry\Entry
 */
global $cm_portfolio;
?>
<div <?php cmp_class( 'Portfolio-Gallery' ) ?>>
	<?php $cm_portfolio->display_gallery(); ?>
</div>