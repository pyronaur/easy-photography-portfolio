###
    Load Dependencies
###
Hooks = require( "wp_hooks" )
Core = require( './class/Core' )
$ = require( 'jQuery' )

###
	Load App
###
require './portfolio/prepare'

###
	Boot on `document.ready`
###
$( document ).ready ->

	# Only run this script when body has `PP_Portfolio` class
	return if not $( 'body' ).hasClass( 'PP_Portfolio' )

	# Boot
	Photography_Portfolio = new Core()
	Photography_Portfolio.ready()

	return