Gulp = require( "gulp" )

Gulp.task "build", ( cb ) ->
	GLOBAL.set_production()

	Gulp.start "libs"
	Gulp.start "sass"
	Gulp.start "coffee"

