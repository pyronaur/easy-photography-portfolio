Gulp = require("gulp")
Config = GLOBAL.config
Notify = require("gulp-notify")
Handle = require("../util/handleErrors")
Autoprefixer = require "gulp-autoprefixer"
Sourcemap = require "gulp-sourcemaps"
Utilities = require "gulp-util"
Stylus = require 'gulp-stylus'


development = ->
	Gulp.src("#{Config.styl.admin}/admin.styl")
	.pipe(Sourcemap.init())
	.pipe Stylus(
		'include css': true
	)
	.on("error", Handle)
	.pipe Autoprefixer()
	.pipe Sourcemap.write()
	.pipe Gulp.dest(Config.build)




Gulp.task "styl_admin", ->
	console.log ""
	if GLOBAL.production()
		console.log "Building CSS: ", Utilities.colors.yellow('Production')
		production()
	else
		console.log "Building CSS: ", Utilities.colors.green('Development')
		development()



