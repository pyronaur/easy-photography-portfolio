Config = GLOBAL.config
Gulp = require( 'gulp' )
Error_Handle = require( '../util/handleErrors' )
Concat = require "gulp-concat"
Sourcemap = require "gulp-sourcemaps"
Uglify = require 'gulp-uglify'
Utilities = require 'gulp-util'


get_source = ->

	lib_order = Object.keys( Config.external_libs )
	# Add "custom" manual libs that can't be pulled froma n URL with getlibs
	if Config.manual_libs? and Config.manual_libs.length > 0
		lib_order = lib_order.concat( Config.manual_libs )


	libs = lib_order.map ( str ) -> "#{Config.libs.source}/#{str}.js"

	Gulp.src( libs )


development = ->

	ugly_opts =
		mangle          : false
		preserveComments: 'all'
		compress        : false
		output          :
			beautify: true

	get_source( )
		.pipe( Sourcemap.init( loadMaps: true ) )
		.pipe( Uglify( ugly_opts ).on( 'error', Error_Handle ) )
		.pipe( Concat( "photography-portfolio-libs.js" ) )
		.pipe( Gulp.dest( Config.build ) )


production = ->
	get_source( )
		.pipe( Uglify( ).on( 'error', Error_Handle ) )
		.pipe( Concat( "photography-portfolio-libs.js" ) )
		.pipe( Gulp.dest( Config.build ) )


Gulp.task "libs", ->
	console.log ""
	if GLOBAL.production( )
		console.log "Contcatenate Libs: ", Utilities.colors.yellow( 'Production' )
		production( )
	else
		console.log "Contcatenate Libs: ", Utilities.colors.green( 'Development' )
		development( )