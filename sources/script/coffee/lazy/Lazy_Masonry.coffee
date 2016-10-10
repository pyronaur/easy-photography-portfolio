$ = require( 'jQuery' )
Item_Data = require( './Item_Data' )


class Lazy_Masonry

	resize: ( el ) ->
		$el = $( el )
		ratio = new Item_Data( $el ).get_ratio()


		$el.css
			'min-height': Math.floor( @get_width() / ratio )

	get_width: ->
		# @TODO: Don't touch the DOM in a loop! Store the value and make sure it refreshes properly!
		$( '.PP_Masonry__sizer' ).width()


	load: ( el ) ->
		$el = $( el )

		image = new Item_Data( $el )
		thumb = image.get_url( 'thumb' )
		full = image.get_url('full')

		$el
		.prepend( """
				<a href="#{full}" rel="gallery">
				<img src="#{thumb}" class="is-loading" />
				</a>
		""" )
		.removeClass( 'Lazy-Image' )


		$image = $el.find( 'img' )

		$image.imagesLoaded ->
			$image.addClass( 'is-loaded' ).removeClass( 'is-loading' )
			$el
			.css( 'min-height', '' )
			.removeClass( 'lazy-image' )
#				.find( '.lazy-image__placeholder' )
#					.velocity( 'fadeOut', -> $( this ).remove() )


module.exports = Lazy_Masonry