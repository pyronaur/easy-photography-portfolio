GLOBAL.config =

	# General Config
	url  : "http://bird.localbox.in"
	build: "./public/build"

	### External Libraries & Their URLs ###
	external_libs:

		# Gallery
		lightgallery: "https://raw.githubusercontent.com/sachinchoolur/lightGallery/master/dist/js/lightgallery.js"

		# Essentials
		fitvids: "https://raw.githubusercontent.com/davatron5000/FitVids.js/master/jquery.fitvids.js"
		velocity: "https://raw.githubusercontent.com/julianshapiro/velocity/master/velocity.js"
		wp_js_hooks: "https://raw.githubusercontent.com/carldanley/WP-JS-Hooks/master/src/event-manager.js"

		# Libraries:
		masonry: "https://raw.githubusercontent.com/desandro/masonry/master/dist/masonry.pkgd.js"
		imagesLoaded: "https://raw.githubusercontent.com/desandro/imagesloaded/master/imagesloaded.js"



	# **************************
	# 	Sass
	# **************************
	sass:
		source: "./sources/style"

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
		source: "./sources/script/libs"
		dest  : "./public/build/libs.js"


	browserify: {}


