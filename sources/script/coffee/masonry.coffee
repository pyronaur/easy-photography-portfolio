$ = require( 'jQuery' )
Hooks = require( "wp_hooks" )
Portfolio_Masonry = require( './portfolio/Portfolio_Masonry' )
Lazy_Masonry = require( './lazy/Lazy_Masonry' )

lazy_instance = false

is_masonry = -> $( '.PP_Masonry' ).length > 0


###
	Initialize Masonry
###
init_masonry = ->
	return if not is_masonry()


	# Initialize
	new Portfolio_Masonry( $( document ) )


init_lazy_loader = ->
	return if not is_masonry()

	if lazy_instance
		lazy_instance.destroy()
		lazy_instance = null

	# By default Lazy_Masonry is handling Lazy-Loading
	# Check if anyone wants to hijack handler
	lazy_instance = Hooks.applyFilters 'pp.lazy.handler', Lazy_Masonry

	# Maybe Destroy Previous lazy_instance
	new lazy_instance()


###
	Setup Events
###

Hooks.addAction 'pp.core.ready', init_masonry

# Initialize lazy loader after the portfolio is prepared, p = 100
Hooks.addAction 'pp.portfolio.prepare', init_lazy_loader, 100


# Load first masonry images when the layout has completed
Hooks.addAction 'pp.portfolio.refresh', ->
	Hooks.doAction 'pp.lazy.autoload'


