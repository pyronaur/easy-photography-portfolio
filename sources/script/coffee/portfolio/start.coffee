###
    Dependencies
###
Hooks = require( "wp_hooks" )
Portfolio_Event_Manager = require( './Portfolio_Event_Manager' )
$ = require('jQuery')

# Portfolio manager will trigger portfolio events when necessary
Portfolio = new Portfolio_Event_Manager()

# Start Portfolio
Hooks.addAction 'pp.core.ready', Portfolio.prepare, 50
Hooks.addAction 'pp.core.loaded', Portfolio.create, 50


# Start Masonry Layout
Hooks.addAction 'pp.core.ready', ->

	return false if $( '.PP_Masonry' ).length is 0

	Portfolio_Masonry = require( './Portfolio_Masonry' )
	new Portfolio_Masonry()