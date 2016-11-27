class Item_Data

	constructor: ( $el ) ->
		@$el = $el
		data = $el.data( 'item' )

		if not data
			throw new Error "Element doesn't contain `data-item` attribute"

		@data = data



	get_data: ( name ) ->
		image = @data[ 'images' ][ name ]
		return false if not image

		return image

	get_size: ( name ) ->
		image = @get_data( name )
		return false if not image

		size = image[ 'size' ]

		[width, height] = size.split( 'x' )

		width = parseInt( width )
		height = parseInt( height )

		return [width, height]

	get_url: ( name ) ->
		image = @get_data( name )
		return false if not image
		return image[ 'url' ]

	get_or_false: ( key ) ->
		if @data[ key ]
			return @data[ key ]
		return false

	get_ratio   : -> @get_or_false( 'ratio' )
	get_type    : -> @get_or_false( 'type' )


window.PP_Modules.Item_Data = Item_Data
module.exports = Item_Data
