<?php
/**
 * @since   1.4.6
 * @updated 1.4.6
 */

/**
 * Actions `phort/gallery/loop/*` are deprecated
 * Use `gallery-loop` instead of `gallery/loop` with `phort_get_template` hook
 */
//  @TODO  Remove at 1.6.0
add_action(
	'phort/gallery-loop/start',
	function () {

		do_action_deprecated( 'phort/gallery/loop/start', [], '1.4.0' );
	}
);

// @TODO: Remove at 1.6.0
add_action(
	'phort/gallery-loop/end',
	function () {

		do_action_deprecated( 'phort/gallery/loop/end', [], '1.4.0' );
	}
);