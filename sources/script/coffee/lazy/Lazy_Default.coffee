$ = require( "jQuery" )
Hooks = require( "wp_hooks" )
Abstract_Lazy_Loader = require( "./Abstract_Lazy_Loader" )

class Lazy_Default extends Abstract_Lazy_Loader


	resize: ( item ) ->
		[w, h] = item.data.size( "thumb" )
		ratio = item.data.get( "ratio" )

		smallest_width = Math.min( item.$el.width( ), w )
		height = Math.floor( smallest_width / ratio )
		width = Math.floor( smallest_width )

		item.$el.css
			"width" : width
			"height": height

	cleanup_after_load: ( item ) ->
		# Remove min-height
		item.$el.css( "min-height", "" )

		# Run all other cleanups
		super( item )

		Hooks.doAction "phort.portfolio.refresh"

		return

	attach_events: ->
		# Call Parent first, it's going to create @throttled_autoload
		super( )

		# Attach
		$( window ).on "scroll", @throttled_autoload



	detach_events: ->
		# Detach
		$( window ).off "scroll", @throttled_autoload

		# Call parent last, it's going to clean up @throttled_autoload
		super( )

	destroy: ->
		for item, key in @Items
			item.$el.css
				'min-height': ''
				'max-width' : ''
		super( )


module.exports = Lazy_Default
