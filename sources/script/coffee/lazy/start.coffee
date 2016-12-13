$ = require( 'jQuery' )
Hooks = require( "wp_hooks" )
Lazy_Masonry = require( './Lazy_Masonry' )


lazy_instance = false

is_masonry = -> $( '.PP_Masonry' ).length > 0

init_lazy_loader = ->
	return if not is_masonry()

	if lazy_instance
		lazy_instance.destroy()

	# By default Lazy_Masonry is handling Lazy-Loading
	# Check if anyone wants to hijack handler
	lazy_instance = new (Hooks.applyFilters 'phort.lazy.handler', Lazy_Masonry)


# Initialize lazy loader after the portfolio is prepared, p = 100
Hooks.addAction 'phort.portfolio.prepare', init_lazy_loader, 100
Hooks.addAction 'phort.portfolio.destroy', ->
	if lazy_instance
		lazy_instance.destroy()
		lazy_instance = null


# Load first masonry images when the layout has completed
Hooks.addAction 'phort.portfolio.refresh', ->
	Hooks.doAction 'phort.lazy.autoload'
