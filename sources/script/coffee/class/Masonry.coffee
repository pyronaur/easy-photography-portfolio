###
    Dependencies
###
$ = require( 'jQuery' )
Hooks = require( "wp_hooks" )
$window = $( window )

class Masonry

	Elements:
		container: 'PP-Masonry'
		sizer    : 'PP-Masonry__sizer'
		item     : 'PP-Masonry__item'




	constructor: ( $parent = $( document ) )->
		@$container = $parent.find( ".#{@Elements.container}" )

		@Events = [
			[ 'pp.masonry.destroy', @destroy ]
			[ 'pp.masonry.refresh', @refresh ]
			[ 'pp.masonry.init', @create, 150 ]
			# [ 'pp.masonry.reload', _.debounce( @refresh, 300 ), 50 ]
		]

		@attach()
		@create()



	create_sizer: ( $el ) ->
		@$container.append """<div class="#{@Elements.sizer}"></div>"""

	sizer_doesnt_exist: ( $el ) -> $el.find( ".#{@Elements.sizer}" ).length is 0

	maybe_create_sizer: ->
		if @sizer_doesnt_exist( @$container )
			@create_sizer( @$container )

	create: =>
		return if @$container.length is 0

		@maybe_create_sizer()

		# Only initialize, if no masonry exists
		@$container.masonry
			itemSelector: ".#{@Elements.item}"
			columnWidth : ".#{@Elements.sizer}"
			gutter      : 0


		return

	destroy: =>
		if @$container.length > 0
			@$container.masonry( 'destroy' )
		return

	refresh: =>
		@$container.maosnry( 'layout' )

	attach: ->
		for event in @Events
			Hooks.addAction.apply( this, event )

	detach: ->
		for event in @Events
			Hooks.removeAction.apply( this, event )


module.exports = Masonry