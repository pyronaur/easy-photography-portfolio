###
    Dependencies
###
$ = require( "jQuery" )
Hooks = require( "wp_hooks" )
Item_Data = require( '../lazy/Item_Data' )

get_data = ( el ) ->
	$el = $( el )
	$container = $el.closest( '.PP_Gallery' )

	$items = $container.find( '.PP_Gallery__item' )

	items = $items.map ( key, item ) ->
		i = new Item_Data( $( item ) )

		return {
			src  : i.get_url( 'full' )
			thumb: i.get_url( 'thumb' )
		}


	return items


Hooks.addAction 'pp.ready', ->

	$( '.PP_Gallery__item' ).on 'click', ( e ) ->
		e.preventDefault()


		$el = $( this )


		$el.lightGallery
			dynamic  : true
			dynamicEl: get_data( this )
			index    : $( '.PP_Gallery__item' ).index $el
			speed    : 350
			preload  : 3
			download : false
