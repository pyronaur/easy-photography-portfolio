$ = require( 'jQuery' )
Hooks = require( "wp_hooks" )
Portfolio_Masonry = require( './Portfolio_Masonry' )

is_masonry = -> $( '.PP_Masonry' ).length > 0


###
	Initialize Masonry
###
init_masonry = ->
	return if not is_masonry()

	# Initialize
	new Portfolio_Masonry( $( document ) )



###
	Setup Events
###
Hooks.addAction 'pp.core.ready', init_masonry




