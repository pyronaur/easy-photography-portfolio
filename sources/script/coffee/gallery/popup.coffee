###
    Dependencies
###
$ = require( "jQuery" )
Hooks = require( "wp_hooks" )
Item_Data = require( '../lazy/Item_Data' )


Gallery = ( $items ) ->

	settings =
		dynamic      : true
		speed        : 350
		preload      : 3
		download     : false


	single_item_data = ($item) ->

	single_item_data = ( $item ) ->
		data = new Item_Data( $item )

		if data.get_type( ) is 'video'
			full = data.get_or_false( 'video_url' )
		else
			full = data.get_url( 'full' )

		return {
			src  : full
			thumb: data.get_url( 'thumb' )
		}

	gallery_data = ->
		$items.map -> single_item_data( $( this ) )

	open: ( index ) ->

		settings.index = index
		settings.dynamicEl = gallery_data( )
		settings.videoMaxWidth = $( window ).width( ) * 0.8

		settings = Hooks.applyFilters 'phort.lightGallery.settings', settings

		$( document ).lightGallery( settings )


Hooks.addAction 'phort.core.ready', ->

	# Only enable jQuery lightGallery if the popup gallery class is found
	if $( '.PP_Popup--lightgallery' ).length is 0
		return false

	$( document ).on 'click', '.PP_Popup--lightgallery .PP_Gallery__item', ( e ) ->
		e.preventDefault( )

		$el = $( this )
		$items = $el.closest( '.PP_Gallery' ).find( '.PP_Gallery__item' )
		index = $items.index( $el )

		Gallery( $items ).open( index )

