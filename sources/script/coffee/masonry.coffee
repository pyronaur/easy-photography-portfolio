$ = require( 'jQuery' )
Hooks = require( "wp_hooks" )
Masonry = require( './class/Masonry' )
Lazy_Loader = require( './lazy/Lazy_Loader' )
Lazy_Masonry = require( './lazy/Lazy_Masonry' )

Hooks.addAction 'pp.masonry.start/before', ->
	new Lazy_Loader( new Lazy_Masonry() )


Hooks.addAction 'pp.ready', ->
	if $( '.PP-Masonry' ).length > 0
		Hooks.addFilter 'pp.portfolio.handler', -> new Masonry()
