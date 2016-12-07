Config = GLOBAL.config
Gulp = require 'gulp'
Coffee = require "gulp-coffee"
JSHint = require 'gulp-jshint'
Stylish = require 'jshint-stylish'
Delete = require 'del'
Map_Stream = require 'map-stream'
Error_Handle = require '../util/handleErrors'


JSHint = require 'gulp-jshint'
Stylish = require 'jshint-stylish'

get_source = ->
	# Remove Previous JSHint Files
	Delete( Config.coffee.hint.output )

	# Get CoffeeScript Files
	files = Gulp.src( Config.coffee.hint.source )
	.pipe( Coffee( {
		join: false
		bare: true
	} ).on( "error", Error_Handle ) )


	return files


compile_reported_files = ( file, cb ) ->
	# Wrap Map because streams are meant to be used only once
	# https://github.com/spalger/gulp-jshint/issues/50
	Map_Stream ( file, cb ) ->
		bad_files = []
		if not file.jshint.success
			bad_file = file.path.split( '/' ).pop().replace( '.js', '' )

			if bad_file?
				bad_files.push( Config.coffee.source + "/" + bad_file + ".coffee" )


			if bad_files.length > 0
				Gulp.src( bad_files )
				.pipe( Coffee() )
				# Output CoffeeScript Files to debug
				.pipe ( Gulp.dest( Config.coffee.hint.output ) )


		cb( null, file )


Gulp.task "jshint", ->
	get_source()
	.pipe( JSHint( {
	#eqnull: true
	} ) )
	.pipe( JSHint.reporter( Stylish ) )
	.pipe( compile_reported_files() )
