gulp = require("gulp")
Config = GLOBAL.config
sass = require("gulp-sass")
notify = require("gulp-notify")
handle_errors = require("../util/handleErrors")
autoprefixer = require "gulp-autoprefixer"
maps = require "gulp-sourcemaps"
cssmin = require 'gulp-clean-css'
util = require "gulp-util"
include = require 'gulp-include'


development = ->
	gulp.src("#{Config.sass.source}/app.sass")
	.pipe(maps.init())
	.pipe(include(extensions: 'sass')).on('error', console.log)
	.pipe(sass({
		indentedSyntax: true,
		precision: 4
		style: 'expanded'
		sourcemap: true
	}))
	.on("error", handle_errors)
	.pipe autoprefixer()
	.pipe maps.write()
	.pipe gulp.dest(Config.build)


production = ->
	cssmin_opts =
		rebase: false
		keepSpecialComments: 0
		advanced: false
		aggressiveMerging: false


	sass("#{Config.sass.source}/app.sass", {
		precision: 4
		style: 'expanded'
		sourcemap: false
	})
	.pipe autoprefixer()
	.pipe cssmin(cssmin_opts)
	.pipe gulp.dest(Config.build)


gulp.task "sass", ->
	console.log ""
	if GLOBAL.production()
		console.log "Running Sass: ", util.colors.yellow('Production')
		production()
	else
		console.log "Running Sass: ", util.colors.green('Development')
		development()


