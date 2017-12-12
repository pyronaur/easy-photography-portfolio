$ = require( "jQuery" )
Hooks = require( "wp_hooks" )
Lazy_Default = require( "./Lazy_Default" )

instance = false

destroy = ->
	return if not instance
	instance.destroy( )
	instance = null

create = ->

	# Make sure an instance doesn't already exist
	destroy( )

	# Handler required
	Handler = Hooks.applyFilters "phort.lazy.handler", Lazy_Default

	return if not ($( ".PP_Lazy_Image__placeholder" ).length > 0)
	return if not Handler

	# By default Lazy_Masonry is handling Lazy-Loading
	# Check if anyone wants to hijack handler
	instance = new Handler( )
	Hooks.addAction "phort.core.loaded", instance.autoload

	return


# Initialize lazy loader after the portfolio is prepared, p = 100
Hooks.addAction "phort.portfolio.prepare", create, 100
Hooks.addAction "phort.portfolio.destroy", destroy


module.exports =
	create : create
	destroy: destroy