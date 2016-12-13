###
    Dependencies
###
$ = require( 'jQuery' )
Hooks = require( "wp_hooks" )


class Core

	constructor: ->
		Hooks.addAction 'phort.core.ready', @wait_for_load

	# Trigger phort.core.ready
	ready: =>
		if Hooks.applyFilters( 'phort.core.ready', true )
			Hooks.doAction 'phort.core.ready'
		return

	wait_for_load: =>
		# Trigger imagesLoaded event when images have loaded
		$( '.PP_Wrapper' ).imagesLoaded( @loaded )

	# Trigger phort.core.loaded
	loaded: ->
		if Hooks.applyFilters( 'phort.core.loaded', true )
			Hooks.doAction 'phort.core.loaded'

		return


module.exports = Core