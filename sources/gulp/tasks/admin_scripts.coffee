Config = global.config
gulp = require( 'gulp' )

gulp.task 'admin_scripts', ->
	gulp.src( "#{Config.scripts.admin}/*.js" )
		.pipe( gulp.dest( Config.build ) )