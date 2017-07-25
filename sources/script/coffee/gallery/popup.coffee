###
    Dependencies
###
$ = require( "jQuery" )
Hooks = require( "wp_hooks" )
Item_Data = require( '../lazy/Item_Data' )


active_gallery = window.__phort.popup_gallery || 'lightgallery'

if active_gallery is 'lightgallery'
	Gallery = require( './lightGallery' )

if active_gallery is 'photoswipe'
	Gallery = require( './photoswipe' )

return if not Gallery

gallery_item = ( key, el ) ->
	$el = $( el )

	index  : key
	data   : new Item_Data( $el )
	caption: $el.find( '.PP_Gallery__caption' ).html( ) || ''


$( document ).on 'click', '.PP_Gallery__item', ( e ) ->
	e.preventDefault( )

	$el = $( this )
	$items = $el.closest( '.PP_Gallery' ).find( '.PP_Gallery__item' )

	if $items.length > 0
		index = $items.index( $el )
		gallery_items = $.makeArray( $items.map( gallery_item ) )
		Gallery( $el ).open( gallery_items, index )


# Move from lightGallery phort.core.ready
# By default EPP will close the whole gallery on close
# Use this hooks to prevent that
#	if Hooks.applyFilters 'phort.gallery.custom_esc', true
#		$( window ).on 'keydown', ( e ) ->
#			if $el && e.keyCode is 27
#				e.preventDefault( )
#				lightGallery( $el ).destroy( )
#				$el = false
#
#			return # nothing
