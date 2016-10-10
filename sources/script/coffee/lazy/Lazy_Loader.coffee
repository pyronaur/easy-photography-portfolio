###
    Dependencies
###
$ = require( 'jQuery' )
Hooks = require( "wp_hooks" )

class Lazy_Loader


	constructor: ( @handler ) ->
		@handler = Hooks.applyFilters 'pp.lazy.handler', @handler

		console.log 'Boop'
		if @handler
			@resize_all()
			@load_all()

	resize_all: ->
		$items = $( '.Lazy-Image' )

		$items.each ( key, el ) =>
			@handler.resize( el )

	load_all: ->
		$items = $( '.Lazy-Image' )
		$items.each ( key, el ) =>
			@handler.load( el )
			@remove_placeholder( el )

	remove_placeholder: (el) ->
		$el = $( el )
		$el.find( '.Lazy-Image__placeholder, noscript' ).remove()


module.exports = Lazy_Loader
