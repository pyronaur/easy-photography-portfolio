<?php
/*
 * Generic Archive Layout
 * @since 1.0.0
 * @modified 1.0.0
 */
?>
<div class="PP_Masonry">

	<?php while ( have_posts() ) : the_post(); ?>

		<?php pp_display_entry( get_the_ID() ); ?>


	<?php endwhile; ?>

</div>