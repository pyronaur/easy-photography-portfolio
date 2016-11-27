###
    Load Dependencies
###
Hooks = require( "wp_hooks" )
$ = require( 'jQuery' )


###
	Boot on `document.ready`
###
$( document ).ready ->

	# Only run this script when body has `PP_Portfolio` class
	return if not $( 'body' ).hasClass( 'PP_Portfolio' )

	# Boot
	Photography_Portfolio = new ( require( './core/Photography_Portfolio' ) )()
	Photography_Portfolio.ready()

	return


###
	Load App
###

# Portfolio Manager
require './portfolio/index'

# Layouts
require './layouts/masonry'

# Gallery
require './gallery/popup'

# Lazy Loading
require './lazy/index'