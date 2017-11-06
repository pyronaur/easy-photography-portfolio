###
    Dependencies
###
$ = require( 'jQuery' )
Hooks = require( 'wp_hooks' )
Gallery = require( './prepare_gallery_factory' )

Hooks.addAction 'phort.core.ready', ->

	handle_clicks = Hooks.applyFilters( 'phort.gallery.handle_clicks', true )
	handle_hash = Hooks.applyFilters( 'phort.gallery.handle_hash', true )
	handle_esc_key = Hooks.applyFilters( 'phort.gallery.custom_esc', true )

	# Handle Hashchange
	if handle_hash and window.location.hash and Gallery.handle_hash
		Hooks.addAction 'phort.core.loaded', Gallery.handle_hash

	# Handle Clicks
	if handle_clicks
		$( document ).on 'click', '.PP_Gallery__item', ( e ) ->
			e.preventDefault( )
			Gallery.open( this )


	# Handle ESCape Key
	if handle_esc_key
		$( window ).on 'keydown', ( e ) ->
			return unless e.key is 'Escape'
			e.preventDefault( )
			Gallery.close( )


module.exports = Gallery
