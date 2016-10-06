gulp = require("gulp")
sync = require("browser-sync")
Config = GLOBAL.config
watch = require "gulp-watch"
util = require 'gulp-util'


gulp.task "browser-sync", ->
	sync.init "assets/build/*.css",
		proxy:
			target: Config.url
		open: false
		port: 3002


gulp.task "sync", ["browser-sync"], ->

	watch "#{Config.coffee.source}/**", ->
		gulp.start "coffee"

	watch "#{Config.libs.source}/**", ->
		gulp.start "libs"

	watch "#{Config.sass.source}/**", ->
		gulp.start "sass"

	watch "#{Config.build}/*.js", ->
		sync.reload()
	
