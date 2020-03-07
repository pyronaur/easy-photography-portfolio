<?php
/**
 * Generic Archive Layout
 * @since    1.0.0
 * @modified 1.4.6
 */
?>

<?php phort_get_template( 'archive/description' ); ?>

<?php if ( phort_get_option( 'archive_category' ) === 'enable' ): ?>
<div <?php phort_class( 'PP_Archive_Filter' ); ?> >
    <div <?php phort_class( 'PP_Archive_Filter_Categories' ); ?> >
		         <?php if ( count( get_terms( 'phort_post_category' ) ) !== 0 ): ?>

                     <span>
                        <?php esc_html_e( 'Categories:', 'photography-portfolio' ); ?>
                     </span>

			         <?php foreach ( get_terms( 'phort_post_category' ) as $taxonomy ): ?>
                         <a href="<?php echo esc_url( get_category_link( $taxonomy->term_id ) ); ?>">
                             <?php esc_html_e( $taxonomy->name, 'photography-portfolio' ); ?>
                         </a>
			         <?php endforeach; ?>
		         <?php endif; ?>
    </div>
</div>
<?php endif; ?>

<div <?php phort_class( 'PP_Archive_Container' ); ?>>

	<?php do_action( 'phort/archive/loop/start' ); ?>

	<?php while ( have_posts() ) : the_post(); ?>
		<?php phort_get_template( 'archive/entry' ); ?>
	<?php endwhile; ?>

	<?php do_action( 'phort/archive/loop/end' ); ?>

</div>