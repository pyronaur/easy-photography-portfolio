Hooks = require( 'wp_hooks' )


get_size = ->
	width : window.innerWidth || $window.width()
	height: window.innerHeight || $window.height()


module.exports = get_size()