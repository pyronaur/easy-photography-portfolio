###
    Dependencies
###
$ = require( "jQuery" )
Hooks = require( "wp_hooks" )
Item_Data = require( '../lazy/Item_Data' )


defaults =
	dynamic : true
	speed   : 350
	preload : 3
	download: false
	escKey  : false # We're rolling our own

	thumbnail         : true
	showThumbByDefault: true

settings = $.extend( {}, defaults, window.__phort.lightGallery )


single_item_data = ( item ) ->

	if item.data.get_type( ) is 'video'
		full = item.data.get_or_false( 'video_url' )
	else
		full = item.data.get_url( 'full' )

	return {
		src    : full
		thumb  : item.data.get_url( 'thumb' )
		subHtml: item.caption
	}


get_settings = ( gallery, index ) ->
	settings.index         = index
	settings.dynamicEl     = gallery.map( single_item_data )
	settings.videoMaxWidth = $( window ).width( ) * 0.8

	Hooks.applyFilters 'phort.lightGallery.settings', settings


module.exports = ( $el ) ->
	destroy: ->
		$el.data( 'lightGallery' ).destroy( )

	open: ( $gallery_items, index ) ->
		$el.lightGallery( get_settings( $gallery_items, index ) )



