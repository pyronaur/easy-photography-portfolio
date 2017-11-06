###
    Dependencies
###
$ = require( 'jQuery' )
Hooks = require( 'wp_hooks' )

# Gallery Driver:
# The driver is responsible for adapting the popup gallery to Easy Photography Portfolio
setup_driver = ( driver_name = 'lightgallery' ) ->
	if driver_name is 'lightgallery'
		Driver = require( './drivers/lightgallery' )

	if driver_name is 'photoswipe'
		Driver = require( './drivers/photoswipe' )

	return Hooks.applyFilters( 'phort.gallery.driver', Driver )

# Gallery Factory:
# The gallery factory is what we're interacting with to open/close a gallery
setup_factory = ->
	factory = require( './gallery_factory' )
	return Hooks.applyFilters( 'phort.gallery.factory', factory )


# --------------------------
# Initialize:
#
gallery_driver = setup_driver( window.__phort.popup_gallery )
gallery_factory = setup_factory()
Gallery = gallery_factory( gallery_driver )


# Click
$( document ).on 'click', '.PP_Gallery__item', ( e ) ->
	e.preventDefault( )
	Gallery.open( this )

# Hash
if window.location.hash and Gallery.handle_hash
	Hooks.addAction 'phort.core.loaded', Gallery.handle_hash

# ESC Key
if Hooks.applyFilters 'phort.gallery.custom_esc', true
	$( window ).on 'keydown', ( e ) ->
		return unless e.keyCode is 27
		e.preventDefault( )
		Gallery.close( )

