item = ( data_obj ) ->

	pluck = ( object, key ) ->
		if object and object[ key ]
			return object[ key ]
		return false

	get = ( key ) -> pluck( data_obj, key )

	image = ( size_name ) -> pluck( get( 'images' ), size_name )


	size: ( size_name ) ->
		image_size = pluck( image( size_name ), 'size' )
		return false if not image_size

		[width, height] = image_size.split( 'x' )

		width = parseInt( width )
		height = parseInt( height )

		return [ width, height ]

	url: ( size_name ) -> pluck( image( size_name ), 'url' )
	get: get


module.exports = item