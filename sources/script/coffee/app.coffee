###
    Dependencies
###
$ = require( 'jQuery' )
Hooks = require( "wp_hooks" )
Masonry = require( 'class/Masonry' )
Portfolio = require( 'class/Portfolio' )
State_Manager = require( 'class/State_Manager' )

App_State = new State_Manager()

Hooks.addAction 'pp.ready', ->

	if $('.PP-Masonry').length > 0
		Hooks.addFilter 'pp.portfolio.handler', -> new Masonry()


Hooks.addAction 'pp.loaded', ->
	portfolio = new Portfolio()
