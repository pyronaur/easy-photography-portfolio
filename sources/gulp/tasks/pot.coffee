
gulp = require('gulp')
wpPot = require('gulp-wp-pot')
sort = require('gulp-sort')

gulp.task "pot", ->
	gulp.src( '**/*.php' )
	.pipe( sort() )
	.pipe( wpPot( {

					  domain: 'pp-plugin',
					  destFile: 'photography-portfolio.pot',
					  package: 'Photography Portfolio',
					  bugReport: 'http://help.colormelon.com',
					  lastTranslator: 'Colormelon <help@colormelon.com>',
					  team: 'Colormelon <help@colormelon.com>',
				  } ) )
	.pipe( gulp.dest( 'languages' ) )
	
