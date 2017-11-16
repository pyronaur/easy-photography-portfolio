(function ( $ ) {
    'use strict'


    /**
     * When `element_to_watch` matches `value`, display `row`
     * @param element_to_watch
     * @param row
     * @param value
     */
    var show_row_by_select_value = function ( element_to_watch, value, dynamic_row ) {

        var show_or_hide = function () {
            var selected = $( element_to_watch ).val()
            var $row     = $( dynamic_row ).closest( '.cmb-row' )

            if ( selected === value ) {
                $row.show()
            } else {
                $row.hide()
            }
        }

        $( document ).ready( show_or_hide )
        $( document ).on( 'change', element_to_watch, show_or_hide )

    }

    show_row_by_select_value( '#popup_gallery', 'lightgallery', '#lg_thumbnails' )
    show_row_by_select_value( '#portfolio_page_displays', 'phort_post_category', '#portfolio_home_category' )
    show_row_by_select_value( '#portfolio_page_displays', 'phort_post', '#portfolio_home_entry' )


})( jQuery )