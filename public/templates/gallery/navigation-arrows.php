<?php
use CLM\Mod;

/**
 * @TODO: Remove \CLM\Mod ?
 */
?>
<?php if ( Mod::get_value( 'portfolio_navigation_arrows' ) ): ?>
	<div class="js__scroll portfolio-arrow portfolio-arrow--left is-disabled" data-direction="left">
		<i class="icon ion-ios-arrow-left"></i>
	</div>

	<div class="js__scroll portfolio-arrow portfolio-arrow--right is-disabled" data-direction="right">
		<i class="icon ion-ios-arrow-right"></i>
	</div>
<?php endif; ?>

<?php if ( Mod::get_value( 'portfolio_close_enable' ) ): ?>
	<div class="js__close portfolio-close">
		<i class="icon ion-android-close"></i>
	</div>
<?php endif; ?>
