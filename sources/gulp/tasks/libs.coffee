Config 			= GLOBAL.config
gulp 			= require('gulp')
coffee 			= require("gulp-coffee")
handle_errors 	= require('../util/handleErrors')
concat 			= require "gulp-concat"
sourcemaps 			= require "gulp-sourcemaps"
uglify 			= require 'gulp-uglify'
order = require 'gulp-order'
util = require 'gulp-util'


get_source = ->

	lib_order = Object.keys(Config.external_libs)
	# Add "custom" manual libs that can't be pulled froma n URL with getlibs
	if Config.manual_libs? and Config.manual_libs.length > 0
		lib_order = lib_order.concat(Config.manual_libs)


	libs = lib_order.map (str) -> "#{Config.libs.source}/#{str}.js"

	gulp.src(libs)
	


development = ->

	ugly_opts =
		mangle: false
		preserveComments: 'all'
		compress: false
		output:
			beautify: true

	get_source()
		.pipe( sourcemaps.init( loadMaps: true ) )
		.pipe( uglify(  ugly_opts ).on('error', handle_errors) )
		.pipe( concat("libs.js") )
		.pipe( gulp.dest(Config.build) )




production = ->
	get_source()
		.pipe( uglify().on('error', handle_errors) )
		.pipe( concat("libs.js") )
		.pipe( gulp.dest(Config.build) )





gulp.task "libs", ->
	console.log ""
	if GLOBAL.production()
		console.log "Contcatenate Libs: ", util.colors.yellow('Production')
		production()
	else
		console.log "Contcatenate Libs: ", util.colors.green('Development')
		development()