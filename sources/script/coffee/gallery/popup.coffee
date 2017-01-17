###
    Dependencies
###
$ = require( "jQuery" )
Hooks = require( "wp_hooks" )
Item_Data = require( '../lazy/Item_Data' )


get_items = ( $el ) ->
	$container = $el.closest( '.PP_Gallery' )
	$items = $container.find( '.PP_Gallery__item' )

get_item_data = ->

	item_data = new Item_Data( $( this ) )

	if item_data.get_type() is 'video'
		full = item_data.get_or_false( 'video_url' )
	else
		full = item_data.get_url( 'full' )

	return {
		src  : full
		thumb: item_data.get_url( 'thumb' )
	}


###
    @TODO: Need detach/destroy methods
###
Hooks.addAction 'phort.core.ready', ->


	$( document ).on 'click', '.PP_Gallery__item', ( e ) ->
		e.preventDefault()
		$el = $( this )

		$items = get_items( $el )
		data = $items.map( get_item_data )


		$el.lightGallery
			dynamic      : true
			dynamicEl    : data
			index        : $items.index( $el )
			speed        : 350
			preload      : 3
			download     : false
			videoMaxWidth: $( window ).width() * 0.8
