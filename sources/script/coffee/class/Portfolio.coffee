Hooks = require( "wp_hooks" )

###

    # Initialize Portfolio Core
	---
		Using p50 @ pp.loaded
		Late priority is going to force explicit priority in any other moving parts that are going to touch portfolio layout at `pp.loaded`
	---

###
class Portfolio

	constructor: ->
		Hooks.addAction 'pp.core.loaded', @create, 50
		@prepare()

	prepare: ->
		Hooks.doAction 'pp.portfolio.prepare'
		return

	create: ->
		Hooks.doAction 'pp.portfolio.create'
		return


	refresh: ->
		Hooks.doAction 'pp.portfolio.refresh'
		return


	destroy: ->
		# Destroy
		Hooks.doAction 'pp.portfolio.destroy'
		Hooks.removeAction 'pp.loaded', @create, 50
		return


module.exports = Portfolio