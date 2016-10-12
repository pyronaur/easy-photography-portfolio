###
    Dependencies
###
$ = require( 'jQuery' )
Hooks = require( "wp_hooks" )
Item_Data = require( './Item_Data' )

class Lazy_Loader

	Elements:
		item       : 'PP_Lazy_Image'
		placeholder: 'PP_Lazy_Image__placeholder'

	Data: []


	constructor: () ->
		console.log 'Constructuring'
		@setup_data()
		@attach_events()
		@resize_all()
		@load_all()


	###
		Abstract Methods
	###
	resize: -> throw new Error( "[Abstract] Any subclass of `Lazy_Loader` must implement `resize` method" )
	load  : -> throw new Error( "[Abstract] Any subclass of `Lazy_Loader` must implement `load` method" )


	setup_data: ->
		$items = $( ".#{@Elements.item}" )

		$items.each ( key, el ) =>
			# I wish there was a prettier way to write this
			$el = $( el )
			@Data.push
				el  : el
				$el : $el
				data: new Item_Data( $el )

		return


	###
		Methods
	###
	resize_all: ->
		@resize( item ) for item in @Data

	load_all: ->
		for item in @Data
			@load( item )
			@remove_placeholder( item )

	remove_placeholder: ( item ) ->
		item.$el.find( ".#{@Elements.placeholder}, noscript" ).remove()


	destroy: ->
		@detach_events()


module.exports = Lazy_Loader
