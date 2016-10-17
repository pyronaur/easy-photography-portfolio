<?php

while ( have_posts() ) : the_post();

	pp_get_template( 'single/description' );
	pp_get_template( 'single/gallery' );

endwhile;
