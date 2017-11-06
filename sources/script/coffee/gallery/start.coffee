###
    Dependencies
###
$ = require( 'jQuery' )
Hooks = require( 'wp_hooks' )

# --------------------------
# Gallery Driver:
# The driver is responsible for adapting the popup gallery to Easy Photography Portfolio
driver_name = window.__phort.popup_gallery || 'lightgallery'

if driver_name is 'lightgallery'
	Gallery_Driver = require( './drivers/lightgallery' )

if driver_name is 'photoswipe'
	Gallery_Driver = require( './drivers/photoswipe' )

Gallery_Driver = Hooks.applyFilters( 'phort.gallery.driver', Gallery_Driver )
return if not Gallery_Driver

# --------------------------
# Gallery Factory:
# The gallery factory is what we're interacting with to open/close a gallery
Gallery_Factory = require( './gallery_factory' )
Gallery_Factory = Hooks.applyFilters( 'phort.gallery.factory', Gallery_Factory )
return false if not Gallery_Factory


# --------------------------
# Initialize:
#
Gallery = Gallery_Factory( Gallery_Driver )

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

