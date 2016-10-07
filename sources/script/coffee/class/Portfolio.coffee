Hooks = require( "wp_hooks" )

class Portfolio

	constructor: ->
		###
    		Event Based Portfolio is going to start soon
		###
		@handler = Hooks.applyFilters 'pp.portfolio.handler', false

		if @handler

			Hooks.addAction 'pp.portfolio.create', @handler.create, 50
			Hooks.addAction 'pp.portfolio.refresh', @handler.refresh, 50
			Hooks.addAction 'pp.portfolio.destroy', @handler.destroy, 50

			# Automatically detach when destroying
			Hooks.addAction 'pp.portfolio.destroy', @auto_destroy, 500

	create: ->
		Hooks.doAction 'pp.portfolio.create'
		return


	refresh: ->
		Hooks.doAction 'pp.portfolio.refresh'
		return


	destroy: ->
		# Destroy
		Hooks.doAction 'pp.portfolio.destroy'
		return

	auto_destroy: ->
		# Detach Events
		Hooks.removeAction 'pp.portfolio.create', @handler.create, 50
		Hooks.removeAction 'pp.portfolio.refresh', @handler.refresh, 50
		Hooks.removeAction 'pp.portfolio.destroy', @handler.destroy, 50


module.exports = Portfolio