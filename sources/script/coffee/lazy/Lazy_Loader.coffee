###
    Dependencies
###
$ = require( 'jQuery' )
Hooks = require( "wp_hooks" )

class Lazy_Loader

	Elements:
		item: 'PP_Lazy_Image'


	constructor: ( @handler ) ->
		@handler = Hooks.applyFilters 'pp.lazy.handler', @handler

		if @handler
			@prepare()
			@load_all()

	prepare: ->
		$items = $( ".#{@Elements.item}" )

		$items.each ( key, el ) =>
			@handler.resize( el )

	load_all: ->
		$items = $( ".#{@Elements.item}" )
		$items.each ( key, el ) =>
			@handler.load( el )
			@remove_placeholder( el )

	remove_placeholder: ( el ) ->
		$el = $( el )
		$el.find( '.Lazy-Image__placeholder, noscript' ).remove()


module.exports = Lazy_Loader
