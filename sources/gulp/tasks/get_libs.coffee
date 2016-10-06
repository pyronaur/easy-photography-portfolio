Config = GLOBAL.config
gulp = require( 'gulp' )
download = require "gulp-download"
rename = require 'gulp-rename'


gulp.task "getlibs", ->

	for key, url of Config.external_libs
		console.log "Downloading #{key} from URL: #{url}"

		download( url )
		.pipe( rename( basename: key ) )
		.pipe( gulp.dest( Config.libs.source ) )
