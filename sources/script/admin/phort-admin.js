(function ( $ ) {
    'use strict'


    var show_lightgallery_thumbnails_option = function () {

        var selected = $( '#popup_gallery' ).val()
        var $row     = $( '#lg_thumbnails' ).closest( '.cmb-row' )

        if ( selected === 'lightgallery' ) {
            $row.show()
        } else {
            $row.hide()
        }

    }


    $( document ).ready( show_lightgallery_thumbnails_option )
    $( document ).on( 'change', '#popup_gallery', show_lightgallery_thumbnails_option )

})( jQuery )