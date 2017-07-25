###
    Dependencies
###
Photoswipe_Factory = require( './photoswipe_factory' )

single_item_data = ( item ) ->
	# PhotoSwipe supports only images
	return if item.data.get_type( ) isnt 'image'

	[width, height] = item.data.get_size( 'full' )

	# return
	src  : item.data.get_url( 'full' )
	msrc : item.data.get_url( 'full' )
	w    : width
	h    : height
	title: item.caption

# @TODO: Add option to prevent animation
# @TODO: Make sure lazy loading works when closing Photoswipe
thumbnail_position = ( $el ) -> return ->
	return false if not $el

	thumbnail = $el.find( 'img' ).get( 0 )
	pageYScroll = window.pageYOffset || document.documentElement.scrollTop
	rect = thumbnail.getBoundingClientRect( )

	# // w = width
	out =
		x: rect.left
		y: rect.top + pageYScroll
		w: rect.width

	return out


module.exports = ( $el ) ->
	Gallery = false

	close: ->
		return if not Gallery
		Gallery.close()
		Gallery = false

	open: ( gallery, index ) ->
		Gallery = new Photoswipe_Factory( getThumbBoundsFn: thumbnail_position( $el ) )
		Gallery.open( gallery.map( single_item_data ), index: index )

