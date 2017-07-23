"use strict"

Config = GLOBAL.config
Browserify = require('browserify')
Gulp = require('gulp')
Stream = require('vinyl-source-stream')
Buffer = require('vinyl-buffer')
Uglify = require('gulp-uglify')
Sourcemap = require('gulp-sourcemaps')
Utilities = require('gulp-util')
Concat = require('gulp-concat')
Strip_Debug = require('gulp-strip-debug')
Error_Handle = require('./../util/handleErrors')




get_source = (debug) ->
	Browserify(
		entries   : Config.coffee.entry
		debug     : debug
		extensions: [".coffee", ".js"],
		transform : ["coffeeify", "browserify-shim"]
		paths: [
			"./#{Config.coffee.source}"
		]
		insertGlobalVars: {
			'App': -> "require('setup/globals')"
		}

	)
	.on("error", Error_Handle)
	.bundle()
	.on("error", Error_Handle)
	.pipe(Stream('photography-portfolio.js'))
	.pipe(Buffer())
	.on("error", Error_Handle)


development = ->
	# Build CoffeeScript
	get_source(true)
	.pipe(Sourcemap.init(loadMaps: true))

	# Concat
	.pipe(Concat("photography-portfolio.js"))
	.pipe(Sourcemap.write())
	.pipe(Gulp.dest(Config.build))


production = ->
	# Build CoffeeScript
	get_source(false)

	# Concat
	.pipe(Concat("photography-portfolio.js"))

	# Remove console.logs
	.pipe(Strip_Debug())

	# Uglify
	.pipe(Uglify(
		debug  : true,
		options:
			sourceMap: true,
	))
	.pipe(Gulp.dest(Config.build))


Gulp.task "coffee", ->
	console.log ""
	if GLOBAL.production()
		console.log "CoffeeScript: ", Utilities.colors.yellow('Production')
		production()
	else
		console.log "CoffeeScript: ", Utilities.colors.green('Development')
		development()