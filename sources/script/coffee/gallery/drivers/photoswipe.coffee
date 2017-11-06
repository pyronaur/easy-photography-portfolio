###
    Dependencies
###
$ = require( "jQuery" )
Hooks = require( "wp_hooks" )

labels = $.extend( {}, {
	'facebook': 'Share on Facebook',
	'twitter': 'Tweet',
	'pinterest': 'Pin it',
}, window.__phort.i18n.photoswipe )


defaults =
	index       : 0
	preload     : [ 1, 3 ]
	escKey      : false
	shareButtons: [
		{ id: 'facebook', label: labels.facebook, url: 'https://www.facebook.com/sharer/sharer.php?u={{url}}' }
		{ id: 'twitter', label : labels.twitter, url: 'https://twitter.com/intent/tweet?text={{text}}&url={{url}}' }
		{ id: 'pinterest', label: labels.pinterest, url: 'http://www.pinterest.com/pin/create/button/?url={{url}}&media={{image_url}}&description={{text}}' }
	]


pswp = document.querySelector( '.pswp' )
UI = Hooks.applyFilters( "phort.photoswipe.UI", window.PhotoSwipeUI_Default )
PhotoSwipe = window.PhotoSwipe


create = ( data, opts = {} ) ->
	options = Hooks.applyFilters( "phort.photoswipe.options", $.extend( {}, defaults, opts ) )

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
	return if item.data.get( 'type' ) isnt 'image'


	[width, height] = item.data.size( 'full' )

	# return
	src  : item.data.url( 'full' )
	msrc : item.data.url( 'full' )
	w    : width
	h    : height
	title: item.caption


thumbnail_position = ( $gallery ) -> return ( index ) ->
	return false if not $gallery.length

	$el = $gallery.eq( index )
	thumbnail = $el.find( 'img' ).get( 0 )

	# Thumbnail must exist before dimensions can be obtained
	return if not thumbnail

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
			getThumbBoundsFn: thumbnail_position( $el.closest( '.PP_Gallery' ).find( '.PP_Gallery__item' ) )
			index           : index

		Gallery = create( gallery.map( single_item_data ), options )



