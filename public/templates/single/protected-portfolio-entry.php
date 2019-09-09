<div <?php phort_class( 'PP_Protected' ) ?>>

	<h1 class="PP_Protected__title"><?php esc_html_e( 'Protected Gallery', 'photography-portfolio' ); ?></h1>
	<?php
	// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	echo get_the_password_form();
	?>

</div>
