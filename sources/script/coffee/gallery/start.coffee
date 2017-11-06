###
    Dependencies
###
$ = require( 'jQuery' )
Hooks = require( 'wp_hooks' )
Gallery = require( './prepare_gallery_factory' )

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


module.exports = Gallery
