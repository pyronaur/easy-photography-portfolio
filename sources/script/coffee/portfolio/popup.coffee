###
    Dependencies
###
$ = require( "jQuery" )
Hooks = require( "wp_hooks" )
Item_Data = require( '../lazy/Item_Data' )

get_data = ( el ) ->
	$el = $( el )
	$container = $el.closest( '.Portfolio-Gallery' )

	$items = $container.find( '.Gallery__item' )

	items = $items.map ( key, item ) ->
		i = new Item_Data( $( item ) )

		return {
			src  : i.get_url( 'full' )
			thumb: i.get_url( 'thumb' )
		}


	return items


Hooks.addAction 'pp.ready', ->

	$( '.Gallery__item' ).on 'click', ( e ) ->
		e.preventDefault()


		$el = $( this )


		$el.lightGallery
			dynamic  : true
			dynamicEl: get_data( this )
			index    : $( '.Gallery__item' ).index $el
			speed    : 350
			preload  : 3
			download : false
