"use strict"

Config = GLOBAL.config
browserify = require('browserify')
gulp = require('gulp')
source = require('vinyl-source-stream')
buffer = require('vinyl-buffer')
uglify = require('gulp-uglify')
sourcemaps = require('gulp-sourcemaps')
util = require('gulp-util')
concat = require('gulp-concat')
strip_debug = require('gulp-strip-debug')
handle_errors = require('./../util/handleErrors')



get_source = (debug) ->
	browserify(
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
	.on("error", handle_errors)
	.bundle()
	.on("error", handle_errors)
	.pipe(source('app.js'))
	.pipe(buffer())
	.on("error", handle_errors)


development = ->
	# Build CoffeeScript
	get_source(true)
	.pipe(sourcemaps.init(loadMaps: true))

	# Concat
	.pipe(concat("app.js"))
	.pipe(sourcemaps.write())
	.pipe(gulp.dest(Config.build))


production = ->
	# Build CoffeeScript
	get_source(false)

	# Concat
	.pipe(concat("app.js"))

	# Remove console.logs
	.pipe(strip_debug())

	# Uglify
	.pipe(uglify(
		debug  : true,
		options:
			sourceMap: true,
	))
	.pipe(gulp.dest(Config.build))


gulp.task "coffee", ->
	console.log ""
	if GLOBAL.production()
		console.log "CoffeeScript: ", util.colors.yellow('Production')
		production()
	else
		console.log "CoffeeScript: ", util.colors.green('Development')
		development()