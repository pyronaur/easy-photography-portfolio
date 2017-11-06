Hooks = require("wp_hooks")

#
# This file is going to return a [Gallery Factory] instance
# Easy Photography Portfolio is using that to open/close/destroy galleries
#
# [Gallery Factory] relies on a [Adapter]
# Instead of relying directly on a dependency, Gallery Factory relies on a Adapter that can be modified
# A Adapter is an adapter for a Popup-Gallery plugin, such as LightGallery or PhotoSwipe
#
# So when a gallery is opened, this is probably how it's going to look:
# [Gallery Factory] asks [Adapter] to find and open a gallery with [any LightBox Library]
#

# -------------------------
# Gallery Adapter:
# -------------------------
setup_driver = ( driver_name = 'lightgallery' ) ->
	if driver_name is 'lightgallery'
		adapter = require( './adapters/lightgallery' )

	if driver_name is 'photoswipe'
		adapter = require( './adapters/photoswipe' )

	return Hooks.applyFilters( 'phort.gallery.driver', adapter )

# -------------------------
# Gallery Factory:
# -------------------------
# The gallery factory is what we're interacting with to open/close a gallery
setup_factory = ->
	factory = require( './gallery_factory' )
	return Hooks.applyFilters( 'phort.gallery.factory', factory )

#
# Return a factory instance
#

gallery_driver = setup_driver( window.__phort.popup_gallery )
gallery_factory = setup_factory( )

module.exports = gallery_factory( gallery_driver )