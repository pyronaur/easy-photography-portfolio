###
    Dependencies
###
$ = require( 'jQuery' )
Hooks = require( "wp_hooks" )
Item_Data = require( './Item_Data' )
__WINDOW = require( '../core/Window' )

class Abstract_Lazy_Loader
	constructor: ->
		@Elements =
			item       : 'PP_Lazy_Image'
			placeholder: 'PP_Lazy_Image__placeholder'
			link       : 'PP_JS_Lazy__link'
			image      : 'PP_JS_Lazy__image'

		@Items = []

		# Adjustable Sensitivity for @in_view function
		# Value in pixels
		@Sensitivity = 100

		# Auto-setup when events are attached
		# Auto-destroy when events are detached
		@throttled_autoload = null

		@setup_items()
		@resize_all()
		@attach_events()

	###
		Abstract Methods
	###

	# This is run when a resize or refresh event is detected
	resize: -> return

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

			# Remove `PP_Lazy_Image`, as this is not a lazy-loadable image anymore
			.removeClass( @Elements.item )

			# Remove Placeholder
			.find( ".#{@Elements.placeholder}" )
			.fadeOut( 400, -> $( this ).remove() )

		Hooks.doAction 'phort.lazy.loaded_item', item


	get_item_html: ( thumb, full ) ->

		if 'disable' is window.__phort.popup_gallery
			return """
			<div class="#{@Elements.link}" rel="gallery">
				<img class="#{@Elements.image}" src="#{thumb}" class="PP_JS__loading" />
			</div>
			"""
		else
			return """
			<a class="#{@Elements.link}" href="#{full}" rel="gallery">
				<img class="#{@Elements.image}" src="#{thumb}" class="PP_JS__loading" />
			</a>
			"""

	setup_items: =>
		# Clear existing items, if any
		@Items = []

		# Loop over DOM and add each item to @Items
		$( ".#{@Elements.item}" ).each( @add_item )
		return

	add_item: ( key, el ) =>
		$el = $( el )
		@Items.push
			el    : el
			$el   : $el
			data  : new Item_Data( $el )
			loaded: false


		return


	###
		Methods
	###
	resize_all: ->
		@resize( item ) for item in @Items



	# Automatically Load all items that are `in_loose_view`
	autoload: =>
		for item, key in @Items
			if not item.loaded and @in_loose_view( item.el )
				@load( item )

	in_loose_view: ( el ) ->
		return true if not el.getBoundingClientRect?
		rect = el.getBoundingClientRect()

		# Elements not in view if they don't have dimensions
		return false if rect.height is 0 and rect.width is 0


		return (
			# Y Axis
			rect.top + rect.height >= -@Sensitivity and # top
			rect.bottom - rect.height <= __WINDOW.height + @Sensitivity and

			# X Axis
			rect.left + rect.width >= -@Sensitivity and
			rect.right - rect.width <= __WINDOW.width + @Sensitivity

		)

	remove_placeholder: ( item ) ->
		item.$el.find( ".#{@Elements.placeholder}, noscript" ).remove()

	destroy: ->
		@detach_events()

	attach_events: ->
		# Create a debounced `autoload` function
		@throttled_autoload = _.throttle( @autoload, 50 )
		Hooks.addAction 'phort.portfolio.refresh', @throttled_autoload, 100


	detach_events: ->
		# Clear the debounced function from instance
		@throttled_autoload = null
		Hooks.removeAction 'phort.portfolio.refresh', @throttled_autoload, 100



module.exports = Abstract_Lazy_Loader
