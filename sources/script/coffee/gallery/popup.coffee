###
    Dependencies
###
$ = require( 'jQuery' )
Hooks = require( 'wp_hooks' )
galery_item = require( './gallery_item_factory' )


gallery_type = window.__phort.popup_gallery || 'lightgallery'

if gallery_type is 'lightgallery'
	Gallery = require( './lightGallery' )

if gallery_type is 'photoswipe'
	Gallery = require( './photoswipe' )

return if not Gallery


popup = false

parse_gallery_item = ( key, el ) ->
	$el = $( el )

	index  : key
	data   : galery_item( $el )
	caption: $el.find( '.PP_Gallery__caption' ).html( ) || ''

open_gallery = ( el ) ->
	$el = $( el )
	$items = $el.closest( '.PP_Gallery' ).find( '.PP_Gallery__item' )

	if $items.length > 0
		index = $items.index( $el )
		gallery_items = $.makeArray( $items.map( parse_gallery_item ) )

		popup = Gallery( $el )
		popup.open( gallery_items, index )

close_gallery = ->
	return false if not popup
	popup.close( )
	popup = false


initialize_from_hash = ->
	index = parseInt(location.hash.split('&pid=')[1], 10)
	el = $('.PP_Gallery').first().find( '.PP_Gallery__item' ).get( index )
	open_gallery( el )

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

if window.location.hash
	Hooks.addAction 'phort.core.loaded', initialize_from_hash