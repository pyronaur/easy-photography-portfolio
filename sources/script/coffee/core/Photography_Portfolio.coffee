###
    Dependencies
###
$ = require( 'jQuery' )
Hooks = require( "wp_hooks" )


class Core

	constructor: ->
		Hooks.addAction 'pp.core.ready', @wait_for_load

	# Trigger pp.core.ready
	ready: =>
		if Hooks.applyFilters( 'pp.core.ready', true )
			Hooks.doAction 'pp.core.ready'
		return

	wait_for_load: =>
		# Trigger imagesLoaded event when images have loaded
		$( '.PP_Wrapper' ).imagesLoaded( @loaded )

	# Trigger pp.core.loaded
	loaded: ->
		if Hooks.applyFilters( 'pp.core.loaded', true )
			Hooks.doAction 'pp.core.loaded'

		return


module.exports = Core