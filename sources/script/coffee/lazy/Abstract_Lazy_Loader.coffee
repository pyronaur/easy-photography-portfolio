###
    Dependencies
###
$ = require( 'jQuery' )
Hooks = require( "wp_hooks" )
Item_Data = require( './Item_Data' )

class Abstract_Lazy_Loader

	Elements:
		item       : 'PP_Lazy_Image'
		placeholder: 'PP_Lazy_Image__placeholder'
		link       : 'PP_JS_Lazy__link'
		image      : 'PP_JS_Lazy__image'

	Items: []


	constructor: () ->
		@setup_data()
		@resize_all()
		@attach_events()


	###
		Abstract Methods
	###
	resize  : -> throw new Error( "[Abstract] Any subclass of `Abstract_Lazy_Loader` must implement `resize` method" )
	load    : -> throw new Error( "[Abstract] Any subclass of `Abstract_Lazy_Loader` must implement `load` method" )
	autoload: -> throw new Error( "[Abstract] Any subclass of `Abstract_Lazy_Loader` must implement `autoload` method" )


	setup_data: ->

		@Items = []

		$items = $( ".#{@Elements.item}" )

		$items.each ( key, el ) =>
			# I wish there was a prettier way to write this
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

	load_all: ->
		for item in @Items
			@load( item )
			@remove_placeholder( item )

	remove_placeholder: ( item ) ->
		item.$el.find( ".#{@Elements.placeholder}, noscript" ).remove()


	destroy: ->
		@detach_events()

	attach_events: ->
		Hooks.addAction 'phort.lazy.autoload', @autoload

	detach_events: ->
		Hooks.removeAction 'phort.lazy.autoload', @autoload


module.exports = Abstract_Lazy_Loader
