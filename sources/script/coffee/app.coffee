###
    Dependencies
###
$ = require( 'jQuery' )
Hooks = require( "wp_hooks" )
Masonry = require( 'class/Masonry' )
State_Manager = require( 'class/State_Manager' )

App_State = new State_Manager()

Hooks.addAction 'pp.loaded', ->
	masonry = new Masonry()
	masonry.start()