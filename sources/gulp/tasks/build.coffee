gulp = require("gulp")
seq = require 'run-sequence'

gulp.task "build", (cb) ->
	GLOBAL.set_production()

	gulp.start "libs"
	gulp.start "sass"
	gulp.start "coffee"

