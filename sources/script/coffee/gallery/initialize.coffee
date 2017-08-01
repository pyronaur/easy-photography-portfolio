###
    Dependencies
###
$ = require( 'jQuery' )
Hooks = require( 'wp_hooks' )


###
    There must be a Gallery Driver to start the gallery
###
gallery_type = window.__phort.popup_gallery || 'lightgallery'

#
#
# Gallery Driver:
# The driver is responsible for adapting the popup gallery to Easy Photography Portfolio
if gallery_type is 'lightgallery'
	Gallery_Driver = require( './driver_lightgallery' )
if gallery_type is 'photoswipe'
	Gallery_Driver = require( './driver_photoswipe' )

Gallery_Driver = Hooks.applyFilters( 'phort.gallery.driver', Gallery_Driver )
return if not Gallery_Driver


#
#
# Gallery Factory:
# The gallery factory is what we're interacting with to open/close a gallery
Gallery_Factory = require( './gallery_factory' )
Gallery_Factory = Hooks.applyFilters( 'phort.gallery.factory', Gallery_Factory )
return false if not Gallery_Factory


# Initialize Gallery Factory
Gallery = Gallery_Factory(Gallery_Driver)


initialize_from_hash = ->
	index = parseInt( window.location.hash.split( '&pid=' )[ 1 ], 10 )
	el = $( '.PP_Gallery' ).first( ).find( '.PP_Gallery__item' ).get( index )
	Gallery.open( el )


##
## Attach Events
##
$( document ).on 'click', '.PP_Gallery__item', ( e ) ->
	e.preventDefault( )
	Gallery.open( this )

if Hooks.applyFilters 'phort.gallery.custom_esc', true
	$( window ).on 'keydown', ( e ) ->
		return unless e.keyCode is 27
		e.preventDefault( )
		Gallery.close( )


if window.location.hash
	Hooks.addAction 'phort.core.loaded', initialize_from_hash
