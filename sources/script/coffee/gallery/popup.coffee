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


active_gallery = false

parse_gallery_item = ( key, el ) ->
	$el = $( el )

	index  : key
	data   : new Item_Data( $el )
	caption: $el.find( '.PP_Gallery__caption' ).html( ) || ''

open_gallery = ( el ) ->
	$el = $( el )
	$items = $el.closest( '.PP_Gallery' ).find( '.PP_Gallery__item' )

	if $items.length > 0
		index = $items.index( $el )
		gallery_items = $.makeArray( $items.map( parse_gallery_item ) )

		active_gallery = Gallery( $el )
		active_gallery.open( gallery_items, index )

close_gallery = ->
	return false if not active_gallery
	active_gallery.close( )
	active_gallery = false


##
## Attach Events
##
$( document ).on 'click', '.PP_Gallery__item', ( e ) ->
	e.preventDefault( )
	open_gallery( this )

if Hooks.applyFilters 'phort.gallery.custom_esc', true
	$( window ).on 'keydown', ( e ) ->
		return unless e.keyCode is 27
		close_gallery( )
		e.preventDefault( )

