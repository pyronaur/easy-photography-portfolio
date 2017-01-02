$ = require( 'jQuery' )
Abstract_Lazy_Loader = require( './Abstract_Lazy_Loader' )
__WINDOW = require( '../core/Window' )

class Lazy_Masonry extends Abstract_Lazy_Loader

	resize_all: ->
		@placeholder_width = $( '.PP_Masonry__sizer' ).width()
		super()

	resize: ( item ) ->
		item.$el.css 'min-height': Math.floor( @placeholder_width / item.data.get_ratio() )

	cleanup_after_load: (item) ->
		# Remove min-height
		item.$el.css( 'min-height', '' )

		# Run all other cleanups
		super( item )

	attach_events: ->
		# Call Parent first, it's going to create @throttled_autoload
		super()

		# Attach
		$( window ).on 'scroll', @throttled_autoload



	detach_events: ->
		# Detach
		$( window ).off 'scroll', @throttled_autoload

		# Call parent last, it's going to clean up @throttled_autoload
		super()

	destroy: ->
		for item, key in @Items
			item.$el.css 'min-height', ''
		super()


module.exports = Lazy_Masonry
