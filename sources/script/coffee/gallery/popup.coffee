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
		item_data = new Item_Data( $( item ) )


		if item_data.get_type() is 'video'
			full = item_data.get_or_false( 'video_url' )
		else
			full = item_data.get_url( 'full' )

		return {
			src  : full
			thumb: item_data.get_url( 'thumb' )
		}


	return items

###
    @TODO: Need detach/destroy methods
###
Hooks.addAction 'phort.core.ready', ->

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
			videoMaxWidth: $(window).width() * 0.8
