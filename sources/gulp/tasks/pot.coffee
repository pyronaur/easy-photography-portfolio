
Gulp = require('gulp')
WP_Pot = require('gulp-wp-pot')
Sort = require('gulp-sort')

Gulp.task "pot", ->
	Gulp.src( '**/*.php' )
	.pipe( Sort() )
	.pipe( WP_Pot( {

					  domain: 'pp-plugin',
					  destFile: 'photography-portfolio.pot',
					  package: 'Photography Portfolio',
					  bugReport: 'http://help.colormelon.com',
					  lastTranslator: 'Colormelon <help@colormelon.com>',
					  team: 'Colormelon <help@colormelon.com>',
				  } ) )
	.pipe( Gulp.dest( 'languages' ) )
	
