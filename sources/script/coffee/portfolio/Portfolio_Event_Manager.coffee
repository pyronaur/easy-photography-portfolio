Hooks = require( "wp_hooks" )

###

    # Initialize Portfolio Core
	---
		Using p50 @ `phort.core.ready`
		Late priority is going to force explicit priority in any other moving parts that are going to touch portfolio layout at `phort.loaded`
	---

###
class Portfolio_Event_Manager

	prepare: ->
		Hooks.doAction 'phort.portfolio.prepare'
		return

	create: ->
		Hooks.doAction 'phort.portfolio.create'
		return


	refresh: ->
		Hooks.doAction 'phort.portfolio.refresh'
		return


	destroy: ->
		# Destroy
		Hooks.doAction 'phort.portfolio.destroy'
		return


module.exports = Portfolio_Event_Manager