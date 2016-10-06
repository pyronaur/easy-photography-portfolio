gulp = require("gulp")
Config = GLOBAL.config
notify = require("gulp-notify")
handle_errors = require("../util/handleErrors")
autoprefixer = require "gulp-autoprefixer"
maps = require "gulp-sourcemaps"
util = require "gulp-util"
stylus = require 'gulp-stylus'


development = ->
	gulp.src("#{Config.sass.source}/*.styl")
	.pipe(maps.init())
	.pipe stylus()
	.on("error", handle_errors)
	.pipe autoprefixer()
	.pipe maps.write()
	.pipe gulp.dest(Config.build)




gulp.task "css", ->
	console.log ""
	if GLOBAL.production()
		console.log "Building CSS: ", util.colors.yellow('Production')
		production()
	else
		console.log "Building CSS: ", util.colors.green('Development')
		development()



