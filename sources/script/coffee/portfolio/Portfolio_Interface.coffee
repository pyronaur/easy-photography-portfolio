Hooks = require( "wp_hooks" )


###
	Abstract Class Portoflio_Event_Imeplementation

    Handles all the events required to fully handle a portfolio layout process
###
class Portfolio_Interface

	constructor: ( args ) ->
		@setup_actions()
		@initialize( args )

	setup_actions: ->
		Hooks.addAction 'phort.portfolio.prepare', @prepare, 50
		Hooks.addAction 'phort.portfolio.create', @create, 50
		Hooks.addAction 'phort.portfolio.refresh', @refresh, 50
		Hooks.addAction 'phort.portfolio.destroy', @destroy, 50
		Hooks.addAction 'phort.portfolio.destroy', @purge_actions, 100

	purge_actions: =>
		Hooks.removeAction 'phort.portfolio.prepare', @prepare, 50
		Hooks.removeAction 'phort.portfolio.create', @create, 50
		Hooks.removeAction 'phort.portfolio.refresh', @refresh, 50
		Hooks.removeAction 'phort.portfolio.destroy', @destroy, 50
		Hooks.removeAction 'phort.portfolio.destroy', @purge_actions, 100


	###
    	Require these methods
	###
	initialize: -> throw new Error( "[Abstract] Any subclass of `Portfolio_Interface` must implement `initialize` method" )
	prepare   : -> throw new Error( "[Abstract] Any subclass of `Portfolio_Interface` must implement `prepare` method" )
	create    : -> throw new Error( "[Abstract] Any subclass of `Portfolio_Interface` must implement `create` method" )
	refresh   : -> throw new Error( "[Abstract] Any subclass of `Portfolio_Interface` must implement `refresh` method" )
	destroy   : -> throw new Error( "[Abstract] Any subclass of `Portfolio_Interface` must implement `destroy` method" )



module.exports = Portfolio_Interface