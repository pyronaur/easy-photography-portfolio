$ = require( 'jQuery' )
Abstract_Lazy_Loader = require( './Abstract_Lazy_Loader' )
__WINDOW = require( '../core/Window' )

class Lazy_Masonry extends Abstract_Lazy_Loader

	resize: ( item ) ->
		item.$el.css 'min-height': Math.floor( @get_width() / item.data.get_ratio() )


	get_width: ->
		# @TODO: Don't touch the DOM in a loop! Store the value and make sure it refreshes properly!
		$( '.PP_Masonry__sizer' ).width()



	load: ( item ) ->
		@load_image( item )
		item.$el.imagesLoaded =>
			@cleanup_after_load( item )

	load_image: ( item ) ->

		# Get image URLs
		thumb = item.data.get_url( 'thumb' )
		full = item.data.get_url( 'full' )

		# Create elements
		item.$el
		.prepend( @get_item_html( thumb, full ) )
		.removeClass( 'Lazy-Image' )

		# Make sure this image isn't loaded again
		item.loaded = true


	cleanup_after_load: ( item ) ->
		# Add image PP_JS_loaded class
		item.$el.find( 'img' ).addClass( 'PP_JS__loaded' ).removeClass( 'PP_JS__loading' )

		item.$el
		.css( 'min-height', '' )
		.removeClass( @Elements.item )

		# Remove Placeholder
		.find( ".#{@Elements.placeholder}" )
		.fadeOut( 400, -> $( this ).remove() )

	attach_events: ->
		# Call Parent first, it's going to create @debounced_autoload
		super()

		# Attach
		$( window ).on 'scroll', @debounced_autoload



	detach_events: ->
		# Detach
		$( window ).off 'scroll', @debounced_autoload

		# Call parent last, it's going to clean up @debounced_autoload
		super()



	destroy: ->
		for item, key in @Items
			item.$el.css 'min-height', ''

		super()

module.exports = Lazy_Masonry
