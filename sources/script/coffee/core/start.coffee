###
    Dependencies
###
$ = require( 'jQuery' )
Hooks = require( 'wp_hooks' )

ready = ->
	if Hooks.applyFilters( 'phort.core.ready', true )
		Hooks.doAction 'phort.core.ready'

	# Automatically trigger `phort.core.loaded` when images are loaded
	$( '.PP_Wrapper' ).imagesLoaded( loaded )
	return

loaded = ->
	if Hooks.applyFilters( 'phort.core.loaded', true )
		Hooks.doAction 'phort.core.loaded'
	return

module.exports =
	loaded: loaded
	ready : ready