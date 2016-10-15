<?php
/**
 * Start Wrapper
 * @load /partials/wrapper-start.php
 */
do_action( 'cmp/wrapper/start' );

/**
 * Start a loop and load all gallery items
 * @load /single/single.php
 * @TODO : Fix insonsitent naming. `archive/layout.php` vs `single/single.php`
 */
pp_display_single_portfolio();


/**
 * End Wrapper
 * @load /partials/wrapper-end.php
 */
do_action( 'cmp/wrapper/end' );