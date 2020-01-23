
Gulp = require('gulp')
WP_Pot = require('gulp-wp-pot')
Sort = require('gulp-sort')

Gulp.task "pot", ->
	Gulp.src( '**/*.php' )
	.pipe( Sort() )
	.pipe( WP_Pot( {

					  domain: 'photography-portfolio',
					  destFile: 'photography-portfolio.pot',
					  package: 'Photography Portfolio',
					  bugReport: 'https://wordpress.org/support/plugin/photography-portfolio/',
					  lastTranslator: 'Nauris <hi@pyronaur.com>',
					  team: 'Nauris <hi@pyronaur.com>',
				  } ) )
	.pipe( Gulp.dest( 'languages' ) )
	
