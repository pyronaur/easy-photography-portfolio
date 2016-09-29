<?php
/**
 * @var $portfolio Photography_Portoflio\Frontend\Layout\Single\Single_Portfolio_Layout
 */
global $cm_portfolio;
$portfolio = $cm_portfolio;

?>
<div class="Gallery--masonry js__masonry masonry-portfolio--minimal">

	<?php while ( $portfolio->query->have_posts() ) : $portfolio->query->the_post(); ?>

		<?php cmp_display_entry( get_the_ID() ); ?>


	<?php endwhile;
	wp_reset_postdata(); ?>

</div>