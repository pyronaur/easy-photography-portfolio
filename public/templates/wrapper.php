<?php
/*
 * ===================
 *  I am root
 * ===================
 *
 * This template file will call all other templates. Modify only if absolutely necessary.
 *
 */

/**
 * Start Content Wrapper
 *
 * @loads /partials/wrapper-start.php
 */
do_action( 'cmp/wrapper/start' );

/**
 * Start a loop and load all gallery items
 *
 * @loads  /single/layout.php
 * @loads  /archive/layout.php
 */
pp_load_view();


/**
 * End Content Wrapper
 *
 * @loads /partials/wrapper-end.php
 */
do_action( 'cmp/wrapper/end' );