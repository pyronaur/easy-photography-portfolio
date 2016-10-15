<?php
/**
 * Start Wrapper
 * @load /partials/wrapper-start.php
 */
do_action( 'cmp/wrapper/start' );

/**
 * Start a loop and load all gallery items
 * @load /archive/layout.php
 */
pp_display_archive();


/**
 * End Wrapper
 * @load /partials/wrapper-end.php
 */
do_action( 'cmp/wrapper/end' );

