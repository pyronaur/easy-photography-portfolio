<?php
/**
 * @since   1.4.6
 * @updated 1.4.6
 */

/**
 * Actions `phort/gallery/loop/*` are deprecated
 * Use `gallery-loop` instead of `gallery/loop` with `phort_get_template` hook
 */
//  @Todo: Remove at 1.6.0
add_action(
	'phort/gallery-loop/start',
	function () {

		do_action_deprecated( 'phort/gallery/loop/start', [], '1.4.0' );
	}
);

// @Todo: Remove at 1.6.0
add_action(
	'phort/gallery-loop/end',
	function () {

		do_action_deprecated( 'phort/gallery/loop/end', [], '1.4.0' );
	}
);


/**
 * @deprecated  since 1.3.0 use phort_entry_data_attributes() instead
 */
function phort_entry_data_attribute() {

	_deprecated_function( __FUNCTION__, "1.3.0", "phort_entry_data_attributes" );
	phort_entry_data_attributes();
}


/**
 * @deprecated action `phort/wrapper/start`
 */
add_action(
	'phort_get_template/partials/wrapper-start',
	function () {

		do_action_deprecated( 'phort/wrapper/start', NULL, '1.4.0', 'phort_get_template/partials/wrapper-start' );
	}
	,
	$priority = 5
);

/**
 * @deprecated action `phort/wrapper/end`
 */
add_action(
	'phort_get_template/partials/wrapper-end',
	function () {

		do_action_deprecated( 'phort/wrapper/end', NULL, '1.4.0', 'phort_get_template/partials/wrapper-start' );
	},
	$priority = 5
);


/**
 * @deprecated action `phort/archive/container/open`
 * @Todo       : Remove at 1.6.0
 */
add_action(
	'phort_get_template/archive/description',
	function () {

		do_action_deprecated( 'phort/archive/container/open', NULL, '1.4.0', 'phort_get_template' );
	}
	,
	$priority = 250
);

/**
 * @deprecated action `phort/archive/container/close`
 * @Todo       : Remove at 1.6.0
 */
add_action(
	'phort_get_template/archive/layout',
	function () {

		do_action_deprecated( 'phort/archive/container/close', NULL, '1.4.0', 'phort_get_template' );
	}
	,
	$priority = 250
);