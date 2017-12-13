###
    Dependencies
###
$ = require( "jQuery" )
Hooks = require( "wp_hooks" )
Portfolio_Interface = require( "./Portfolio_Interface" )

# Defering the refresh efent prevents masonry from triggering an error
# This is an ugly quick fix.
# @TODO: Rewrite the whole file.

defer = ( cb ) -> setTimeout( cb, 1 )

# @TODO: Need a heavvy refactor - no more classes please
class Portfolio_Masonry extends Portfolio_Interface
	once = false
	constructor: ->
		@Elements =
			container: "PP_Masonry"
			sizer    : "PP_Masonry__sizer"
			item     : "PP_Masonry__item"

		super( )

	###
		Initialize
	###
	initialize: ->
		@$container = $( ".#{@Elements.container}" )

	###
		Prepare & Attach Events
    	Don't show anything yet.

		@called on hook `phort.portfolio.prepare`
	###
	prepare: =>
		return if @$container.length is 0

		@$container.addClass( "PP_JS__loading_masonry" )

		@maybe_create_sizer( )

		# Only initialize, if no masonry exists
		masonry_settings = Hooks.applyFilters "phort.masonry.settings",
			itemSelector: ".#{@Elements.item}"
			columnWidth : ".#{@Elements.sizer}"
			gutter      : 0
			initLayout  : false

		@$container.masonry( masonry_settings )

		@$container.masonry "once", "layoutComplete", =>
			@$container
				.removeClass( "PP_JS__loading_masonry" )
				.addClass( "PP_JS__loading_complete" )

			# @trigger refresh event
			# triggers `@refresh()`
			defer( -> Hooks.doAction( "phort.portfolio.refresh" ) )





	###
		Start the Portfolio
		@called on hook `phort.portfolio.create`
	###
	create: =>
		@$container.masonry( )
		return


	###
		Destroy
		@called on hook `phort.portfolio.destroy`
	###
	destroy: =>
		@maybe_remove_sizer( )

		if @$container.length > 0
			@$container.masonry( "destroy" )


		return


	###
		Reload the layout
		@called on hook `phort.portfolio.refresh`
	###
	refresh: =>
		@$container.masonry( "layout" )



	###
		Create a sizer element for jquery-masonry to use
	###
	maybe_create_sizer: ->
		@create_sizer( ) if @sizer_doesnt_exist( )
		return

	maybe_remove_sizer: ->
		return if @$container.length isnt 1
		@$container.find( ".#{@Elements.sizer}" ).remove( )
		return

	sizer_doesnt_exist: -> @$container.find( ".#{@Elements.sizer}" ).length is 0


	create_sizer: ->
		@$container.append """<div class="#{@Elements.sizer}"></div>"""

		return

module.exports = Portfolio_Masonry