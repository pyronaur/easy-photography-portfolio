###
    Load Dependencies
###
Hooks = require( "wp_hooks" )
$ = require( 'jQuery' )


# Expose some Photography Portfolio modules to the public for extensibility
window.PP_Modules = {}

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

# Start Portfolio
require './portfolio/start'

# Gallery
require './gallery/popup'

# Lazy Loading
require './lazy/start'