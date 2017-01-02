$ = require( 'jQuery' )
Abstract_Lazy_Loader = require( './Abstract_Lazy_Loader' )
__WINDOW = require( '../core/Window' )

class Lazy_Masonry extends Abstract_Lazy_Loader

	resize: ( item ) ->
		item.$el.css 'min-height': Math.floor( @get_width() / item.data.get_ratio() )


	get_width: ->
		# @TODO: Don't touch the DOM in a loop! Store the value and make sure it refreshes properly!
		$( '.PP_Masonry__sizer' ).width()

	cleanup_after_load: (item) ->
		# Remove min-height
		item.$el.css( 'min-height', '' )

		# Run all other cleanups
		super( item )

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
