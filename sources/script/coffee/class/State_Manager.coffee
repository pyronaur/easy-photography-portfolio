###
    Dependencies
###
$ = require( 'jQuery' )
Hooks = require( "wp_hooks" )


class State_Manager

	constructor: ->
		@$doc = $( document )
#		@$win = $( window )

		@$doc.on 'ready', @ready
		@$doc.find( '.pp-wrapper' ).imagesLoaded( @loaded )


	ready: =>
		trigger = true

		if Hooks.applyFilters('pp.ready', true)
			Hooks.doAction 'pp.ready'

		return

	loaded: =>
		trigger = true

		if Hooks.applyFilters('pp.loaded', true)
			Hooks.doAction 'pp.loaded'

		return


module.exports = State_Manager