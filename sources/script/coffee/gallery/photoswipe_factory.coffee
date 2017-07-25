###
    Dependencies
###
Hooks = require('wp_hooks')
$ = require('jQuery')

class Photoswipe_Factory

	constructor: (options = {}) ->

		@el = document.querySelector('.pswp')
		@UI = Hooks.applyFilters("phort.photoswipe.UI", PhotoSwipeUI_Default)
		@is_open = false

		defaults =
			index: 0
			preload: [1,3]
			escKey: false
			shareButtons: [
				{id:'facebook', label:'Share on Facebook', url:'https://www.facebook.com/sharer/sharer.php?u={{url}}'}
				{id:'twitter', label:'Tweet', url:'https://twitter.com/intent/tweet?text={{text}}&url={{url}}'}
				{id:'pinterest', label:'Pin it', url:'http://www.pinterest.com/pin/create/button/?url={{url}}&media={{image_url}}&description={{text}}'}
			]


		@defaults = Hooks.applyFilters "phort.photoswipe.defaults", $.extend( {}, defaults, options )


	close: =>
		@instance.close()

	handle_close: =>
		@is_open = false
		return

	trigger_change: ->
		Hooks.doAction 'theme.gallery/move', @getCurrentIndex()

	open: (data = {}, opts = {}) ->

		options = $.extend( {}, @defaults, opts)

		# Index is 0 by default
		if not options.index?
			options.index = 0

		# Set the index to 0 if it isn't a proper value
		if not options.index or options.index < 0
			options.index = 0

		@instance = new PhotoSwipe(@el, @UI, data , options)
		@instance.init()
		@instance.listen 'close', @handle_close
		@instance.listen 'afterChange', @trigger_change
		@is_open = true

		return @instance



# exports
module.exports = Photoswipe_Factory