<?php
/**
 * Available Global Variables: $portfolio, $entry
 *
 * @var $cm_portfolio Photography_Portoflio\Frontend\Layout\Single\Single_Portfolio_Layout
 *
 * @TODO: Create user friendly functions
 * `pp_template('single/description')` instead of $cm_portfolio->get( 'single/description' );
 * `pp_have_posts()` instead of `$cm_portfolio->query->have_posts()`
 */
global $cm_portfolio;

while ( $cm_portfolio->query->have_posts() ) : $cm_portfolio->query->the_post();

	pp_get_template( 'single/description' );
	pp_get_template( 'single/gallery' );

endwhile;

wp_reset_postdata();