###
    Dependencies
###
$ = require( "jQuery" )
Hooks = require( "wp_hooks" )
Item_Data = require( '../lazy/Item_Data' )


gallery_type = window.__phort.popup_gallery || 'lightgallery'

if gallery_type is 'lightgallery'
	Gallery = require( './lightGallery' )

if gallery_type is 'photoswipe'
	Gallery = require( './photoswipe' )

return if not Gallery

gallery_item = ( key, el ) ->
	$el = $( el )

	index  : key
	data   : new Item_Data( $el )
	caption: $el.find( '.PP_Gallery__caption' ).html( ) || ''


active_gallery = false

$( document ).on 'click', '.PP_Gallery__item', ( e ) ->
	e.preventDefault( )

	$el = $( this )
	$items = $el.closest( '.PP_Gallery' ).find( '.PP_Gallery__item' )

	if $items.length > 0
		index = $items.index( $el )
		gallery_items = $.makeArray( $items.map( gallery_item ) )
		active_gallery = Gallery( $el )

		active_gallery.open( gallery_items, index )


# Move from lightGallery phort.core.ready
# By default EPP will close the whole gallery on close
# Use this hooks to prevent that
if Hooks.applyFilters 'phort.gallery.custom_esc', true
	$( window ).on 'keydown', ( e ) ->
		if active_gallery && e.keyCode is 27
			e.preventDefault( )
			active_gallery.close()
			active_gallery = false

		return
