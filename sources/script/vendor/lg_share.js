/*! lg-share - v1.0.2 - 2016-11-26
* http://sachinchoolur.github.io/lightGallery
* Copyright (c) 2016 Sachin N; Licensed GPLv3 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define(['jquery'], function (a0) {
      return (factory(a0));
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require('jquery'));
  } else {
    factory(jQuery);
  }
}(this, function ($) {

(function() {

    'use strict';

    var defaults = {
        share: true,
        facebook: true,
        facebookDropdownText: 'Facebook',
        twitter: true,
        twitterDropdownText: 'Twitter',
        googlePlus: true,
        googlePlusDropdownText: 'GooglePlus',
        pinterest: true,
        pinterestDropdownText: 'Pinterest'
    };

    var Share = function(element) {

        this.core = $(element).data('lightGallery');

        this.core.s = $.extend({}, defaults, this.core.s);
        if (this.core.s.share) {
            this.init();
        }

        return this;
    };

    Share.prototype.init = function() {
        var _this = this;
        var shareHtml = '<span id="lg-share" class="lg-icon">' +
            '<ul class="lg-dropdown" style="position: absolute;">';
        shareHtml += _this.core.s.facebook ? '<li><a id="lg-share-facebook" target="_blank"><span class="lg-icon"></span><span class="lg-dropdown-text">' + this.core.s.facebookDropdownText + '</span></a></li>' : '';
        shareHtml += _this.core.s.twitter ? '<li><a id="lg-share-twitter" target="_blank"><span class="lg-icon"></span><span class="lg-dropdown-text">' + this.core.s.twitterDropdownText + '</span></a></li>' : '';
        shareHtml += _this.core.s.googlePlus ? '<li><a id="lg-share-googleplus" target="_blank"><span class="lg-icon"></span><span class="lg-dropdown-text">' + this.core.s.googlePlusDropdownText + '</span></a></li>' : '';
        shareHtml += _this.core.s.pinterest ? '<li><a id="lg-share-pinterest" target="_blank"><span class="lg-icon"></span><span class="lg-dropdown-text">' + this.core.s.pinterestDropdownText + '</span></a></li>' : '';
        shareHtml += '</ul></span>';

        this.core.$outer.find('.lg-toolbar').append(shareHtml);
        this.core.$outer.find('.lg').append('<div id="lg-dropdown-overlay"></div>');
        $('#lg-share').on('click.lg', function(){
            _this.core.$outer.toggleClass('lg-dropdown-active');
        });

        $('#lg-dropdown-overlay').on('click.lg', function(){
            _this.core.$outer.removeClass('lg-dropdown-active');
        });

        _this.core.$el.on('onAfterSlide.lg.tm', function(event, prevIndex, index) {

            setTimeout(function() {

                // Set the $current_item
                // If core.$items is doesn't have an eq method - $current_item is unknown and should be false
                var $current_item;
                $current_item = (_this.core.$items && _this.core.$items.eq) ? _this.core.$items(index) : false;

                var share_data = {
                    facebook: {
                        url: _this.getShareURL('facebook-share-url', $current_item)
                    },
                    googleplus: {
                        url: _this.getShareURL('googleplus-share-url', $current_item)
                    },
                    twitter: {
                        text: '',
                        url: _this.getShareURL('twitter-share-url', $current_item)
                    },
                    pinterest: {
                        media: '',
                        text: '',
                        url: _this.getShareURL('data-pinterest-share-url', $current_item)
                    }
                };


                // Setup twitter text
                if ($current_item) {
                    // Setup Twitter Text
                    share_data.twitter.text = $current_item.attr('data-tweet-text');

                    // Setup Pinterest Media and Text
                    share_data.pinterest.media = encodeURIComponent($current_item.attr('href') || $current_item.attr('data-src'));
                    share_data.pinterest.text = $current_item.attr('data-pinterest-text');
                }


                // Set the attributes to the gathered data
                $('#lg-share-facebook').attr('href', 'https://www.facebook.com/sharer/sharer.php?u=' + share_data.facebook.url);

                $('#lg-share-twitter').attr('href', 'https://twitter.com/intent/tweet?text=' + share_data.twitter.text + '&url=' + share_data.twitter.url );

                $('#lg-share-googleplus').attr('href', 'https://plus.google.com/share?url=' + share_data.googleplus.url);

                $('#lg-share-pinterest').attr('href', 'http://www.pinterest.com/pin/create/button/?url=' + share_data.pinterest.url + '&media=' + share_data.pinterest.media + '&description=' + share_data.pinterest.text);

            }, 100);
        });
    };


    Share.prototype.getShareURL = function(dataAttribute, $el) {

        var url;

        if( $el ) {
            url = $el.attr('data-' + dataAttribute);
        }

        if( ! url ) {
            url = window.location.href;
        }

        return encodeURIComponent(url);
    };

    Share.prototype.destroy = function() {

    };

    $.fn.lightGallery.modules.share = Share;

})();



}));
