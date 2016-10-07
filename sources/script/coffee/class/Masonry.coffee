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
			[ 'pp.masonry.init', @start, 100 ]
			# [ 'pp.masonry.reload', _.debounce( @refresh, 300 ), 50 ]
		]

		@attach()
		@create()


	create: =>
		return if @$container.length is 0

		@$container.addClass('is-preparing-masonry')

		@maybe_create_sizer()

		# Only initialize, if no masonry exists
		@$container.masonry
			itemSelector: ".#{@Elements.item}"
			columnWidth : ".#{@Elements.sizer}"
			gutter      : 0
			initLayout  : false


		return

	start: =>
		Hooks.doAction 'pp.masonry.before_start'

		@$container.masonry 'on', 'layoutComplete', =>
			Hooks.doAction 'pp.masonry.start'
			@$container.removeClass('is-preparing-masonry')

		@$container.masonry()

	destroy: =>
		@detach()
		@maybe_remove_sizer()

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


	###

		Create a sizer element for jquery-masonry to use

	###
	maybe_create_sizer: ->
		@create_sizer() if @sizer_doesnt_exist()
		return

	maybe_remove_sizer: ->
		return if @$container.length isnt 1
		@$container.find(".#{@Elements.sizer}").remove()
		return

	sizer_doesnt_exist: -> @$container.find( ".#{@Elements.sizer}" ).length is 0


	create_sizer: ->
		@$container.append """<div class="#{@Elements.sizer}"></div>"""

		return


module.exports = Masonry