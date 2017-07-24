Config = GLOBAL.config
Gulp = require 'gulp'
Error_Handle = require '../util/handleErrors'
Concat = require "gulp-concat"
Sourcemap = require "gulp-sourcemaps"
Uglify = require 'gulp-uglify'
Utilities = require 'gulp-util'
replace = require 'gulp-replace'
clean_css = require 'gulp-clean-css'
Download = require 'gulp-download'
rename = require 'gulp-rename'


download_stylesheet = ->

	ps = Download( 'https://raw.githubusercontent.com/dimsemenov/PhotoSwipe/master/dist/photoswipe.css' )
	ps_ui = Download( 'https://raw.githubusercontent.com/dimsemenov/PhotoSwipe/master/dist/default-skin/default-skin.css' )

	if GLOBAL.production( )
		ps_ui.pipe( clean_css( ) )

	ps_ui
		.pipe( replace( 'default-skin.', '../img/photoswipe/default-skin.' ) )
		.pipe( rename( basename: 'photoswipe-ui' ) )
		.pipe( Gulp.dest( Config.libs.dest ) )

	ps.pipe( Gulp.dest( Config.libs.dest ) )

Gulp.task "get_photoswipe", download_stylesheet