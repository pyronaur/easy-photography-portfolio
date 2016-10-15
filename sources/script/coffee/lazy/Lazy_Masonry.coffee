$ = require( 'jQuery' )
Lazy_Loader = require( './Lazy_Loader' )
__WINDOW = require( '../global/Window' )

class Lazy_Masonry extends Lazy_Loader

	constructor: ->
		@debounced_load_items_in_view = _.debounce( @load_items_in_view, 50 )
		super()


	resize: ( item ) ->
		item.$el.css 'min-height': Math.floor( @get_width() / item.data.get_ratio() )


	get_width: ->
		# @TODO: Don't touch the DOM in a loop! Store the value and make sure it refreshes properly!
		$( '.PP_Masonry__sizer' ).width()

	autoload: => @load_items_in_view()

	load: ( item ) ->

		thumb = item.data.get_url( 'thumb' )
		full = item.data.get_url( 'full' )

		item.$el
		.prepend( """
				<a class="#{@Elements.link}" href="#{full}" rel="gallery">
				<img class="#{@Elements.image}" src="#{thumb}" class="PP_JS__loading" />
				</a>
		""" )
		.removeClass( 'Lazy-Image' )

		item.loaded = true
		$image = item.$el.find( 'img' )
		$image.imagesLoaded =>

			$image.addClass( 'PP_JS__loaded' ).removeClass( 'PP_JS__loading' )
			item.$el
				.css( 'min-height', '' )
				.removeClass( @Elements.item )
				.find( ".#{@Elements.placeholder}" )
				.fadeOut 400, -> $( this ).remove()





	load_items_in_view: =>
		for item, key in @Items
			if not item.loaded and @in_loose_view( item.el )
				@load( item )



	in_loose_view: ( el ) ->
		return true if not el.getBoundingClientRect?
		rect = el.getBoundingClientRect()

		# Sensitivity in Pixels
		sensitivity = 100
		return (
			# Y Axis
			rect.top + rect.height >= -sensitivity and # top
				rect.bottom - rect.height <= __WINDOW.height + sensitivity and

				# X Axis
				rect.left + rect.width >= -sensitivity and
				rect.right - rect.width <= __WINDOW.width + sensitivity

		)

	attach_events: ->
		$( window ).on 'scroll', @debounced_load_items_in_view
		super()

	detach_events: ->
		$( window ).off 'scroll', @debounced_load_items_in_view
		super()

module.exports = Lazy_Masonry
