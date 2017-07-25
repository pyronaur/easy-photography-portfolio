###
    Dependencies
###
$ = require( "jQuery" )
Hooks = require( "wp_hooks" )


defaults =
	index       : 0
	preload     : [ 1, 3 ]
	escKey      : false
	shareButtons: [
		# @TODO: i18n for labels
		{ id: 'facebook', label: 'Share on Facebook', url: 'https://www.facebook.com/sharer/sharer.php?u={{url}}' }
		{ id: 'twitter', label: 'Tweet', url: 'https://twitter.com/intent/tweet?text={{text}}&url={{url}}' }
		{ id: 'pinterest', label: 'Pin it', url: 'http://www.pinterest.com/pin/create/button/?url={{url}}&media={{image_url}}&description={{text}}' }
	]


pswp = document.querySelector( '.pswp' )
UI = Hooks.applyFilters( "phort.photoswipe.UI", window.PhotoSwipeUI_Default )
PhotoSwipe = window.PhotoSwipe


create = ( data, opts = {} ) ->
	options = $.extend( {}, defaults, opts )

	# Index is 0 by default
	if not options.index?
		options.index = 0

	# Set the index to 0 if it isn't a proper value
	if not options.index or options.index < 0
		options.index = 0

	instance = new PhotoSwipe( pswp, UI, data, options )
	instance.init( )

	return instance


single_item_data = ( item ) ->
	# PhotoSwipe supports only images
	return if item.data.get_type( ) isnt 'image'

	[width, height] = item.data.get_size( 'full' )

	# return
	src  : item.data.get_url( 'full' )
	msrc : item.data.get_url( 'full' )
	w    : width
	h    : height
	title: item.caption

# @TODO: Add option to prevent animation
# @TODO: Make sure lazy loading works when closing Photoswipe
thumbnail_position = ( $el ) -> return ->
	return false if not $el

	thumbnail = $el.find( 'img' ).get( 0 )
	pageYScroll = window.pageYOffset || document.documentElement.scrollTop
	rect = thumbnail.getBoundingClientRect( )

	# // w = width
	out =
		x: rect.left
		y: rect.top + pageYScroll
		w: rect.width

	return out


module.exports = ( $el ) ->
	Gallery = false

	close: ->
		return if not Gallery
		Gallery.close( )
		Gallery = false

	open: ( gallery, index ) ->

		options =
			getThumbBoundsFn: thumbnail_position( $el )
			index           : index

		Gallery = create( gallery.map( single_item_data ), options )


