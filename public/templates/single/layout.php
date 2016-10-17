<?php
/*
 * Generic Single Portfolio View
 * @since 1.0.0
 * @modified 1.0.0
 */

while ( have_posts() ) : the_post();

	pp_get_template( 'single/description' );
	pp_get_template( 'single/gallery' );

endwhile;
