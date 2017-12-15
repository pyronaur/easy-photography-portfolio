util = require('gulp-util')
###
    Check if is Production Mode on ?
###
is_production = false
GLOBAL.set_production = ->
	is_production = true
	return

GLOBAL.production = ->
	return (!!util.env.production || is_production)