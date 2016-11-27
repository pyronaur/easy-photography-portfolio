###
    Dependencies
###
$ = require( 'jQuery' )
Hooks = require( "wp_hooks" )


class Core

	constructor: ->
		@$doc = $( document )
		@attach_events()



	attach_events: ->
		@$doc.on 'ready', @ready

		return


	# Trigger pp.core.ready
	ready: =>
		if Hooks.applyFilters( 'pp.core.ready', true )
			Hooks.doAction 'pp.core.ready'

		# Trigger imagesLoaded event when images have loaded
		@$doc.find( '.PP_Wrapper' ).imagesLoaded( @loaded )

		return

	# Trigger pp.core.loaded
	loaded: ->
		if Hooks.applyFilters( 'pp.loaded', true )
			Hooks.doAction 'pp.core.loaded'

		return


module.exports = Core