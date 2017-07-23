GLOBAL.config =

	# General Config
	url  : "http://peebles.demmoo.com"
	build: "./public/build"

	### External Libraries & Their URLs ###
	external_libs:

		# LightGallery
		lg_core: "https://raw.githubusercontent.com/sachinchoolur/lightGallery/master/dist/js/lightgallery.js"
		lg_video: "https://raw.githubusercontent.com/sachinchoolur/lg-video/master/dist/lg-video.js"
		lg_hash: "https://raw.githubusercontent.com/sachinchoolur/lg-hash/master/dist/lg-hash.js"
		lg_thumbs: "https://raw.githubusercontent.com/sachinchoolur/lg-thumbnail/master/dist/lg-thumbnail.js"
		lg_share: "https://raw.githubusercontent.com/sachinchoolur/lg-share/master/dist/lg-share.js"
		lg_fullscreen: "https://raw.githubusercontent.com/sachinchoolur/lg-fullscreen/master/dist/lg-fullscreen.js"
		lg_autoplay: "https://raw.githubusercontent.com/sachinchoolur/lg-autoplay/master/dist/lg-autoplay.js"

		# Essentials
		wp_js_hooks: "https://raw.githubusercontent.com/carldanley/WP-JS-Hooks/master/src/event-manager.js"





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
		source: "./sources/script/vendor"
		dest  : "./public/build/libs.js"


	browserify: {}


