###
    Dependencies
###
$ = require( 'jQuery' )
Hooks = require( 'wp_hooks' )
Photoswipe_Factory = require( './photoswipe_factory' )
Item_Data = require( '../lazy/Item_Data' )

Gallery = null
$items = null

parse_image_data = ( $gallery_items ) ->
	image_data = []

	$gallery_items.each ( key, el ) ->
		$el = $( el )
		data = new Item_Data( $el )

		[width, height] = data.get_size( 'full' )


		if data.get_type( ) is 'image'
			data =
				src  : data.get_url( 'full' )
				msrc : data.get_url( 'full' )
				w    : width
				h    : height
				title: $el.find( 'figcaption' ).html( )


		image_data.push( data ) if data?

	return image_data


open_photoswipe_with_animation = ( index ) ->

	# @TODO: Add option to prevent animation
	# Disable zoom for Packery portfolio - images are cropped there
	#	return undefined if $( 'body' ).hasClass( 'Portfolio--packery' )

	return if not $items or not $items.length or $items.length is 0


	$item = $items.eq( index )

	# @TODO: Make sure lazy loading works when closing Photoswipe
	# // Disable for now - is this even needed?
	# A temporary fix to load $item without modular code
	#	if $item.hasClass( 'PP_Lazy_Image' )
	#		Hooks.doAction 'lazy.load_item', $item

	thumbnail = $item.find( 'img' ).get( 0 )
	pageYScroll = window.pageYOffset || document.documentElement.scrollTop
	rect = thumbnail.getBoundingClientRect( )

	# // w = width
	out =
		x: rect.left
		y: rect.top + pageYScroll
		w: rect.width

	return out



open_gallery_at_index = ( $items, index = 0 ) ->
	initialize_gallery( )

	images = parse_image_data( $items )

	if images.length > 0
		Gallery.open( images, index: index )

###
	Implementation
###


# Listen for click events
on_click = ( e ) ->
	e.preventDefault( )
	$el = $( this )
	$items = $el.closest( '.PP_Gallery' ).find( '.PP_Gallery__item' )
	index = $items.index( $el )

	open_gallery_at_index($items, index)

initialize_gallery = ->
	return if Gallery?

	Gallery = new Photoswipe_Factory( getThumbBoundsFn: open_photoswipe_with_animation )
	$( document ).on 'click', '.PP_Gallery__item', on_click


Hooks.addAction 'phort.core.ready', ->
	initialize_gallery( )
	return
