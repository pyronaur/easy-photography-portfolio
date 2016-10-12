$ = require( 'jQuery' )
Hooks = require( "wp_hooks" )
Masonry = require( './class/Masonry' )
Lazy_Masonry = require( './lazy/Lazy_Masonry' )

Hooks.addAction 'pp.masonry.start/before', ->
	# By default Lazy_Masonry is handling Lazy-Loading
	# Check if anyone wants to hijack handler
	Lazy_Handler = Hooks.applyFilters 'pp.lazy.handler', Lazy_Masonry
	new Lazy_Handler()
	return

# Load first masonry images when the layout has completed
Hooks.addAction 'pp.masonry.start/complete', ->
	Hooks.doAction 'pp.lazy.autoload'


Hooks.addAction 'pp.ready', ->
	if $( '.PP_Masonry' ).length > 0
		Hooks.addFilter 'pp.portfolio.handler', -> new Masonry()

