<?php
/**
 * Available Global Variables: $portfolio, $entry
 *
 * @var $cm_portfolio Photography_Portoflio\Frontend\Layout\Single\Single_Portfolio_Layout
 *
 * @TODO: Create user friendly functions
 * `cmp_template('single/description')` instead of $cm_portfolio->get( 'single/description' );
 * `cmp_have_posts()` instead of `$cm_portfolio->query->have_posts()`
 */
global $cm_portfolio;

while ( $cm_portfolio->query->have_posts() ) : $cm_portfolio->query->the_post();

	cmp_get_template( 'single/description' );
	cmp_get_template( 'single/gallery' );

endwhile;

wp_reset_postdata();