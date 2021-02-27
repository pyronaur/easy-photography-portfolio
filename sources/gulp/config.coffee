GLOBAL.config =

	# General Config
	url  : "http://theme.wp"
	build: "./public/build"

	### External Libraries & Their URLs ###
	external_libs:
		# Essentials
		# DEPRECATED:
		# event-manager and WP-JS-Hooks doesn't exist anymore.
		# Currently manually added `epp-js-hooks.js`
		"epp-js-hooks": true
		"photoswipe"   : "https://raw.githubusercontent.com/dimsemenov/PhotoSwipe/master/dist/photoswipe.js"
		"photoswipe-ui": "https://raw.githubusercontent.com/dimsemenov/PhotoSwipe/master/dist/photoswipe-ui-default.js"


	# **************************
	# 	Sass
	# **************************
	styl:
		app: "./sources/style/frontend"
		admin: "./sources/style/admin"

	# **************************
	# 	CoffeeScript
	# **************************
	coffee:
		source       : "./sources/script/coffee"
		entry       : "./sources/script/coffee/app.coffee"
		hint:
			output: "./sources/script/coffee-jshint"
			source: [
				"./sources/script/coffee/*.coffee"
				"./sources/script/coffee/*/**.coffee",
			]



	# **************************
	# 	JavaScript Libraries
	# **************************
	libs:
		dest  : "./public/build/libs"

	scripts:
		admin: "./sources/script/admin"

	browserify: {}


