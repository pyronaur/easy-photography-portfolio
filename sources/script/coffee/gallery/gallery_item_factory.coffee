item = require('./gallery_item_data')

item_data = ( $el ) ->
	data_obj = $el.data( 'item' )

	if not data_obj
		throw new Error "Element doesn't contain `data-item` attribute"

	return item( data_obj )


module.exports = item_data