Config 				= GLOBAL.config
gulp 				= require 'gulp'
coffee 				= require "gulp-coffee"
jshint 				= require 'gulp-jshint'
stylish 			= require 'jshint-stylish'
del 				= require 'del'
map					= require 'map-stream'
handle_errors 		= require '../util/handleErrors'


jshint = require 'gulp-jshint'
stylish = require 'jshint-stylish'

get_source = ->
	# Remove Previous JSHint Files
	del(Config.coffee.hint.output)

	# Get CoffeeScript Files
	files = gulp.src(Config.coffee.hint.source)
	.pipe(coffee({
		join: false
		bare: true
	}).on("error", handle_errors))


	return files


compile_reported_files = (file, cb) ->
	# Wrap Map because streams are meant to be used only once
	# https://github.com/spalger/gulp-jshint/issues/50
	map (file, cb) ->
		bad_files = []
		if not file.jshint.success
			bad_file = file.path.split('/').pop().replace('.js', '')

			if bad_file?
				bad_files.push(Config.coffee.source + "/" + bad_file + ".coffee")


			if bad_files.length > 0
				gulp.src(bad_files)
				.pipe(coffee())
				# Output CoffeeScript Files to debug
				.pipe ( gulp.dest(Config.coffee.hint.output) )


		cb(null, file)


gulp.task "jshint", ->
	get_source()
	.pipe(jshint({
		#eqnull: true
	}))
	.pipe(jshint.reporter(stylish))
	.pipe(compile_reported_files())
