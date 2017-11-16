GLOBAL.config =

	# General Config
	url  : "http://bird.demmoo.com"
	build: "./public/build"

	### External Libraries & Their URLs ###
	external_libs:
		# Essentials
		"wp-js-hooks": "https://raw.githubusercontent.com/carldanley/WP-JS-Hooks/master/build/event-manager.min.js"
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


