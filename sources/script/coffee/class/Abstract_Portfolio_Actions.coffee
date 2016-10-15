Hooks = require( "wp_hooks" )


###
	Abstract Class Portoflio_Event_Imeplementation

    Handles all the events required to fully handle a portfolio layout process
###
class Abstract_Portfolio_Actions

	constructor: ( args ) ->
		@setup_actions()
		@initialize( args )

	setup_actions: ->
		Hooks.addAction 'pp.portfolio.prepare', @prepare, 50
		Hooks.addAction 'pp.portfolio.create', @create, 50
		Hooks.addAction 'pp.portfolio.refresh', @refresh, 50
		Hooks.addAction 'pp.portfolio.destroy', @destroy, 50
		Hooks.addAction 'pp.portfolio.destroy', @purge_actions, 50

	purge_actions: ->
		Hooks.removeAction 'pp.portfolio.create', @prepare, 50
		Hooks.removeAction 'pp.portfolio.create', @create, 50
		Hooks.removeAction 'pp.portfolio.refresh', @refresh, 50
		Hooks.removeAction 'pp.portfolio.destroy', @destroy, 50
		Hooks.removeAction 'pp.portfolio.destroy', @purge_actions, 50


	###
    	Require these methods
	###
	initialize: -> throw new Error( "[Abstract] Any subclass of `Portfolio_Actions` must implement `initialize` method" )
	prepare   : -> throw new Error( "[Abstract] Any subclass of `Portfolio_Actions` must implement `prepare` method" )
	create    : -> throw new Error( "[Abstract] Any subclass of `Portfolio_Actions` must implement `create` method" )
	refresh   : -> throw new Error( "[Abstract] Any subclass of `Portfolio_Actions` must implement `refresh` method" )
	destroy   : -> throw new Error( "[Abstract] Any subclass of `Portfolio_Actions` must implement `destroy` method" )

module.exports = Abstract_Portfolio_Actions