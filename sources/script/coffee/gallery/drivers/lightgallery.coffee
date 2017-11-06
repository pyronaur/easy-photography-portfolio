###
    Dependencies
###
$ = require( "jQuery" )
Hooks = require( "wp_hooks" )

defaults =
	dynamic : true
	speed   : 350
	preload : 3
	download: false
	escKey  : false # We're rolling our own

	thumbnail         : true
	showThumbByDefault: true

# @TODO: Use Object.assign() with Babel
settings = $.extend( {}, defaults, window.__phort.lightGallery )


single_item_data = ( item ) ->

	if item.data.get( 'type' ) is 'video'
		full = item.data.get( 'video_url' )
	else
		full = item.data.url( 'full' )

	return {
		src    : full
		thumb  : item.data.url( 'thumb' )
		subHtml: item.caption
	}


get_settings = ( gallery, index ) ->
	settings.index         = index
	settings.dynamicEl     = gallery.map( single_item_data )
	settings.videoMaxWidth = window.innerWidth * 0.8

	Hooks.applyFilters 'phort.lightGallery.settings', settings


module.exports = ( $el ) ->
	close: ->
		Gallery = $el.data( 'lightGallery' )
		Gallery.destroy( ) if Gallery and Gallery.destroy?

	open: ( gallery_items, index ) ->
		Gallery = $el.lightGallery( get_settings( gallery_items, index ) )




