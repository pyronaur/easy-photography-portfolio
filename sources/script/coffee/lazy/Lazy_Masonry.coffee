$ = require( 'jQuery' )
Lazy_Loader = require( './Lazy_Loader' )


class Lazy_Masonry extends Lazy_Loader

	resize: ( item ) ->
		item.$el.css 'min-height': Math.floor( @get_width() / item.data.get_ratio() )


	get_width: ->
		# @TODO: Don't touch the DOM in a loop! Store the value and make sure it refreshes properly!
		$( '.PP_Masonry__sizer' ).width()


	load: ( item ) ->

		thumb = item.data.get_url( 'thumb' )
		full = item.data.get_url( 'full' )

		item.$el
		.prepend( """
				<a href="#{full}" rel="gallery">
				<img src="#{thumb}" class="is-loading" />
				</a>
		""" )
		.removeClass( 'Lazy-Image' )


		$image = item.$el.find( 'img' )

		$image.imagesLoaded ->
			$image.addClass( 'is-loaded' ).removeClass( 'is-loading' )
			item.$el
			.css( 'min-height', '' )
			.removeClass( 'lazy-image' )
	#				.find( '.lazy-image__placeholder' )
	#					.velocity( 'fadeOut', -> $( this ).remove() )


	handle_scroll: ( e ) =>
		console.log "Scroll"

	attach_events: ->
		$( window ).on 'scroll', @handle_scroll

	detach_events: ->
		$( window ).off 'scroll', @handle_scroll

module.exports = Lazy_Masonry
