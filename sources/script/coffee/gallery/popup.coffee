###
    Dependencies
###
$ = require( "jQuery" )
Hooks = require( "wp_hooks" )
Item_Data = require( '../lazy/Item_Data' )


Gallery = ( $el ) ->

	defaults =
		dynamic : true
		speed   : 350
		preload : 3
		download: false
		escKey  : false # We're rolling our own

		thumbnail         : true
		showThumbByDefault: true

	settings = $.extend( {}, defaults, window.__phort.lightGallery )


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

	gallery_data = ( $items ) ->
		$items.map -> single_item_data( $( this ) )

	get_settings = ( $items, index ) ->
		settings.index         = index
		settings.dynamicEl     = gallery_data( $items )
		settings.videoMaxWidth = $( window ).width( ) * 0.8

		Hooks.applyFilters 'phort.lightGallery.settings', settings


	destroy: ->
		$el.data( 'lightGallery' ).destroy( )

	open: ( $items, index ) ->
		$el.lightGallery( get_settings( $items, index ) )


Hooks.addAction 'phort.core.ready', ->

	# $el is going to be the current gallery element onClick
	$el = false

	# Only enable jQuery lightGallery if the popup gallery class is found
	if $( '.PP_Popup--lightgallery' ).length is 0
		return false

	# Open gallery
	$( document ).on 'click', '.PP_Popup--lightgallery .PP_Gallery__item', ( e ) ->
		e.preventDefault( )

		$el = $( this )
		$items = $el.closest( '.PP_Gallery' ).find( '.PP_Gallery__item' )
		index = $items.index( $el )

		Gallery( $el ).open( $items, index )

	# By default EPP will close the whole gallery on close
	# Use this hooks to prevent that
	if Hooks.applyFilters 'phort.gallery.custom_esc', true
		$( window ).on 'keydown', ( e ) ->
			if $el && e.keyCode is 27
				e.preventDefault( )
				Gallery( $el ).destroy( )
				$el = false

			return # nothing

