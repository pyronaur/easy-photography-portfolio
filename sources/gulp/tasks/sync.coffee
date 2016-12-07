Gulp = require("gulp")
BSync = require("browser-sync")
Config = GLOBAL.config
Watch = require "gulp-watch"


Gulp.task "browser-sync", ->
	BSync.init "public/build/*.css",
		proxy:
			target: Config.url
		open: false
		port: 3002


Gulp.task "sync", ["browser-sync"], ->

	Watch "#{Config.coffee.source}/**", ->
		Gulp.start "coffee"

	Watch "#{Config.libs.source}/**", ->
		Gulp.start "libs"

	Watch "#{Config.sass.source}/**", ->
		Gulp.start "css"

	Watch "#{Config.build}/*.js", ->
		BSync.reload()
	
