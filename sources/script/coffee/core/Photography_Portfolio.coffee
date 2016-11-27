###
    Dependencies
###
$ = require( 'jQuery' )
Hooks = require( "wp_hooks" )


class Core

	# Trigger pp.core.ready
	ready: =>
		if Hooks.applyFilters( 'pp.core.ready', true )
			Hooks.doAction 'pp.core.ready'

		# Trigger imagesLoaded event when images have loaded
		$( '.PP_Wrapper' ).imagesLoaded( @loaded )

		return

	# Trigger pp.core.loaded
	loaded: ->
		if Hooks.applyFilters( 'pp.core.loaded', true )
			Hooks.doAction 'pp.core.loaded'

		return


module.exports = Core