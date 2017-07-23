Config = GLOBAL.config
Gulp = require( 'gulp' )
Download = require "gulp-download"
Rename = require 'gulp-rename'


Gulp.task "getlibs", ->

	for key, url of Config.external_libs
		console.log "Downloading #{key} from URL: #{url}"

		Download( url )
		.pipe( Rename( basename: key ) )
		.pipe( Gulp.dest( Config.libs.dest ) )
