###
    Dependencies
###
Hooks = require( "wp_hooks" )
Portfolio_Event_Manager = require( './Portfolio_Event_Manager' )
$ = require( 'jQuery' )

# Portfolio manager will trigger portfolio events when necessary
Portfolio = new Portfolio_Event_Manager()


is_masonry = ->
	return ( $( '.PP_Masonry' ).length isnt 0 )

# Start Masonry Layout
start_masonry = ->
	return false if not is_masonry()

	Portfolio_Masonry = require( './Portfolio_Masonry' )
	new Portfolio_Masonry()

maybe_lazy_masonry = ( handler ) ->
	# Use Lazy_Masonry handler, if current layout is masonry
	return require( 'lazy/Lazy_Masonry' ) if is_masonry()
	return handler


# Start Portfolio
Hooks.addAction 'phort.core.ready', Portfolio.prepare, 50
Hooks.addAction 'phort.core.loaded', Portfolio.create, 50

# Initialize Masonry Layout
Hooks.addAction 'phort.core.ready', start_masonry

# Initialize Lazy Loading for Masonry Layout
Hooks.addFilter 'phort.lazy.handler', maybe_lazy_masonry



