/*! lightgallery - v1.3.6 - 2016-11-18
* http://sachinchoolur.github.io/lightGallery/
* Copyright (c) 2016 Sachin N; Licensed GPLv3 */
(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module unless amdModuleId is set
        define([ "jquery" ], function(a0) {
            return factory(a0);
        });
    } else if (typeof exports === "object") {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require("jquery"));
    } else {
        factory(root["jQuery"]);
    }
})(this, function($) {
    (function() {
        "use strict";
        var defaults = {
            mode: "lg-slide",
            // Ex : 'ease'
            cssEasing: "ease",
            //'for jquery animation'
            easing: "linear",
            speed: 600,
            height: "100%",
            width: "100%",
            addClass: "",
            startClass: "lg-start-zoom",
            backdropDuration: 150,
            hideBarsDelay: 6e3,
            useLeft: false,
            closable: true,
            loop: true,
            escKey: true,
            keyPress: true,
            controls: true,
            slideEndAnimatoin: true,
            hideControlOnEnd: false,
            mousewheel: true,
            getCaptionFromTitleOrAlt: true,
            // .lg-item || '.lg-sub-html'
            appendSubHtmlTo: ".lg-sub-html",
            subHtmlSelectorRelative: false,
            /**
         * @desc number of preload slides
         * will exicute only after the current slide is fully loaded.
         *
         * @ex you clicked on 4th image and if preload = 1 then 3rd slide and 5th
         * slide will be loaded in the background after the 4th slide is fully loaded..
         * if preload is 2 then 2nd 3rd 5th 6th slides will be preloaded.. ... ...
         *
         */
            preload: 1,
            showAfterLoad: true,
            selector: "",
            selectWithin: "",
            nextHtml: "",
            prevHtml: "",
            // 0, 1
            index: false,
            iframeMaxWidth: "100%",
            download: true,
            counter: true,
            appendCounterTo: ".lg-toolbar",
            swipeThreshold: 50,
            enableSwipe: true,
            enableDrag: true,
            dynamic: false,
            dynamicEl: [],
            galleryId: 1
        };
        function Plugin(element, options) {
            // Current lightGallery element
            this.el = element;
            // Current jquery element
            this.$el = $(element);
            // lightGallery settings
            this.s = $.extend({}, defaults, options);
            // When using dynamic mode, ensure dynamicEl is an array
            if (this.s.dynamic && this.s.dynamicEl !== "undefined" && this.s.dynamicEl.constructor === Array && !this.s.dynamicEl.length) {
                throw "When using dynamic mode, you must also define dynamicEl as an Array.";
            }
            // lightGallery modules
            this.modules = {};
            // false when lightgallery complete first slide;
            this.lGalleryOn = false;
            this.lgBusy = false;
            // Timeout function for hiding controls;
            this.hideBartimeout = false;
            // To determine browser supports for touch events;
            this.isTouch = "ontouchstart" in document.documentElement;
            // Disable hideControlOnEnd if sildeEndAnimation is true
            if (this.s.slideEndAnimatoin) {
                this.s.hideControlOnEnd = false;
            }
            // Gallery items
            if (this.s.dynamic) {
                this.$items = this.s.dynamicEl;
            } else {
                if (this.s.selector === "this") {
                    this.$items = this.$el;
                } else if (this.s.selector !== "") {
                    if (this.s.selectWithin) {
                        this.$items = $(this.s.selectWithin).find(this.s.selector);
                    } else {
                        this.$items = this.$el.find($(this.s.selector));
                    }
                } else {
                    this.$items = this.$el.children();
                }
            }
            // .lg-item
            this.$slide = "";
            // .lg-outer
            this.$outer = "";
            this.init();
            return this;
        }
        Plugin.prototype.init = function() {
            var _this = this;
            // s.preload should not be more than $item.length
            if (_this.s.preload > _this.$items.length) {
                _this.s.preload = _this.$items.length;
            }
            // if dynamic option is enabled execute immediately
            var _hash = window.location.hash;
            if (_hash.indexOf("lg=" + this.s.galleryId) > 0) {
                _this.index = parseInt(_hash.split("&slide=")[1], 10);
                $("body").addClass("lg-from-hash");
                if (!$("body").hasClass("lg-on")) {
                    setTimeout(function() {
                        _this.build(_this.index);
                    });
                    $("body").addClass("lg-on");
                }
            }
            if (_this.s.dynamic) {
                _this.$el.trigger("onBeforeOpen.lg");
                _this.index = _this.s.index || 0;
                // prevent accidental double execution
                if (!$("body").hasClass("lg-on")) {
                    setTimeout(function() {
                        _this.build(_this.index);
                        $("body").addClass("lg-on");
                    });
                }
            } else {
                // Using different namespace for click because click event should not unbind if selector is same object('this')
                _this.$items.on("click.lgcustom", function(event) {
                    // For IE8
                    try {
                        event.preventDefault();
                        event.preventDefault();
                    } catch (er) {
                        event.returnValue = false;
                    }
                    _this.$el.trigger("onBeforeOpen.lg");
                    _this.index = _this.s.index || _this.$items.index(this);
                    // prevent accidental double execution
                    if (!$("body").hasClass("lg-on")) {
                        _this.build(_this.index);
                        $("body").addClass("lg-on");
                    }
                });
            }
        };
        Plugin.prototype.build = function(index) {
            var _this = this;
            _this.structure();
            // module constructor
            $.each($.fn.lightGallery.modules, function(key) {
                _this.modules[key] = new $.fn.lightGallery.modules[key](_this.el);
            });
            // initiate slide function
            _this.slide(index, false, false);
            if (_this.s.keyPress) {
                _this.keyPress();
            }
            if (_this.$items.length > 1) {
                _this.arrow();
                setTimeout(function() {
                    _this.enableDrag();
                    _this.enableSwipe();
                }, 50);
                if (_this.s.mousewheel) {
                    _this.mousewheel();
                }
            }
            _this.counter();
            _this.closeGallery();
            _this.$el.trigger("onAfterOpen.lg");
            // Hide controllers if mouse doesn't move for some period
            _this.$outer.on("mousemove.lg click.lg touchstart.lg", function() {
                _this.$outer.removeClass("lg-hide-items");
                clearTimeout(_this.hideBartimeout);
                // Timeout will be cleared on each slide movement also
                _this.hideBartimeout = setTimeout(function() {
                    _this.$outer.addClass("lg-hide-items");
                }, _this.s.hideBarsDelay);
            });
        };
        Plugin.prototype.structure = function() {
            var list = "";
            var controls = "";
            var i = 0;
            var subHtmlCont = "";
            var template;
            var _this = this;
            $("body").append('<div class="lg-backdrop"></div>');
            $(".lg-backdrop").css("transition-duration", this.s.backdropDuration + "ms");
            // Create gallery items
            for (i = 0; i < this.$items.length; i++) {
                list += '<div class="lg-item"></div>';
            }
            // Create controlls
            if (this.s.controls && this.$items.length > 1) {
                controls = '<div class="lg-actions">' + '<div class="lg-prev lg-icon">' + this.s.prevHtml + "</div>" + '<div class="lg-next lg-icon">' + this.s.nextHtml + "</div>" + "</div>";
            }
            if (this.s.appendSubHtmlTo === ".lg-sub-html") {
                subHtmlCont = '<div class="lg-sub-html"></div>';
            }
            template = '<div class="lg-outer ' + this.s.addClass + " " + this.s.startClass + '">' + '<div class="lg" style="width:' + this.s.width + "; height:" + this.s.height + '">' + '<div class="lg-inner">' + list + "</div>" + '<div class="lg-toolbar group">' + '<span class="lg-close lg-icon"></span>' + "</div>" + controls + subHtmlCont + "</div>" + "</div>";
            $("body").append(template);
            this.$outer = $(".lg-outer");
            this.$slide = this.$outer.find(".lg-item");
            if (this.s.useLeft) {
                this.$outer.addClass("lg-use-left");
                // Set mode lg-slide if use left is true;
                this.s.mode = "lg-slide";
            } else {
                this.$outer.addClass("lg-use-css3");
            }
            // For fixed height gallery
            _this.setTop();
            $(window).on("resize.lg orientationchange.lg", function() {
                setTimeout(function() {
                    _this.setTop();
                }, 100);
            });
            // add class lg-current to remove initial transition
            this.$slide.eq(this.index).addClass("lg-current");
            // add Class for css support and transition mode
            if (this.doCss()) {
                this.$outer.addClass("lg-css3");
            } else {
                this.$outer.addClass("lg-css");
                // Set speed 0 because no animation will happen if browser doesn't support css3
                this.s.speed = 0;
            }
            this.$outer.addClass(this.s.mode);
            if (this.s.enableDrag && this.$items.length > 1) {
                this.$outer.addClass("lg-grab");
            }
            if (this.s.showAfterLoad) {
                this.$outer.addClass("lg-show-after-load");
            }
            if (this.doCss()) {
                var $inner = this.$outer.find(".lg-inner");
                $inner.css("transition-timing-function", this.s.cssEasing);
                $inner.css("transition-duration", this.s.speed + "ms");
            }
            setTimeout(function() {
                $(".lg-backdrop").addClass("in");
            });
            setTimeout(function() {
                _this.$outer.addClass("lg-visible");
            }, this.s.backdropDuration);
            if (this.s.download) {
                this.$outer.find(".lg-toolbar").append('<a id="lg-download" target="_blank" download class="lg-download lg-icon"></a>');
            }
            // Store the current scroll top value to scroll back after closing the gallery..
            this.prevScrollTop = $(window).scrollTop();
        };
        // For fixed height gallery
        Plugin.prototype.setTop = function() {
            if (this.s.height !== "100%") {
                var wH = $(window).height();
                var top = (wH - parseInt(this.s.height, 10)) / 2;
                var $lGallery = this.$outer.find(".lg");
                if (wH >= parseInt(this.s.height, 10)) {
                    $lGallery.css("top", top + "px");
                } else {
                    $lGallery.css("top", "0px");
                }
            }
        };
        // Find css3 support
        Plugin.prototype.doCss = function() {
            // check for css animation support
            var support = function() {
                var transition = [ "transition", "MozTransition", "WebkitTransition", "OTransition", "msTransition", "KhtmlTransition" ];
                var root = document.documentElement;
                var i = 0;
                for (i = 0; i < transition.length; i++) {
                    if (transition[i] in root.style) {
                        return true;
                    }
                }
            };
            if (support()) {
                return true;
            }
            return false;
        };
        /**
     *  @desc Check the given src is video
     *  @param {String} src
     *  @return {Object} video type
     *  Ex:{ youtube  :  ["//www.youtube.com/watch?v=c0asJgSyxcY", "c0asJgSyxcY"] }
     */
        Plugin.prototype.isVideo = function(src, index) {
            var html;
            if (this.s.dynamic) {
                html = this.s.dynamicEl[index].html;
            } else {
                html = this.$items.eq(index).attr("data-html");
            }
            if (!src && html) {
                return {
                    html5: true
                };
            }
            var youtube = src.match(/\/\/(?:www\.)?youtu(?:\.be|be\.com)\/(?:watch\?v=|embed\/)?([a-z0-9\-\_\%]+)/i);
            var vimeo = src.match(/\/\/(?:www\.)?vimeo.com\/([0-9a-z\-_]+)/i);
            var dailymotion = src.match(/\/\/(?:www\.)?dai.ly\/([0-9a-z\-_]+)/i);
            var vk = src.match(/\/\/(?:www\.)?(?:vk\.com|vkontakte\.ru)\/(?:video_ext\.php\?)(.*)/i);
            if (youtube) {
                return {
                    youtube: youtube
                };
            } else if (vimeo) {
                return {
                    vimeo: vimeo
                };
            } else if (dailymotion) {
                return {
                    dailymotion: dailymotion
                };
            } else if (vk) {
                return {
                    vk: vk
                };
            }
        };
        /**
     *  @desc Create image counter
     *  Ex: 1/10
     */
        Plugin.prototype.counter = function() {
            if (this.s.counter) {
                $(this.s.appendCounterTo).append('<div id="lg-counter"><span id="lg-counter-current">' + (parseInt(this.index, 10) + 1) + '</span> / <span id="lg-counter-all">' + this.$items.length + "</span></div>");
            }
        };
        /**
     *  @desc add sub-html into the slide
     *  @param {Number} index - index of the slide
     */
        Plugin.prototype.addHtml = function(index) {
            var subHtml = null;
            var subHtmlUrl;
            var $currentEle;
            if (this.s.dynamic) {
                if (this.s.dynamicEl[index].subHtmlUrl) {
                    subHtmlUrl = this.s.dynamicEl[index].subHtmlUrl;
                } else {
                    subHtml = this.s.dynamicEl[index].subHtml;
                }
            } else {
                $currentEle = this.$items.eq(index);
                if ($currentEle.attr("data-sub-html-url")) {
                    subHtmlUrl = $currentEle.attr("data-sub-html-url");
                } else {
                    subHtml = $currentEle.attr("data-sub-html");
                    if (this.s.getCaptionFromTitleOrAlt && !subHtml) {
                        subHtml = $currentEle.attr("title") || $currentEle.find("img").first().attr("alt");
                    }
                }
            }
            if (!subHtmlUrl) {
                if (typeof subHtml !== "undefined" && subHtml !== null) {
                    // get first letter of subhtml
                    // if first letter starts with . or # get the html form the jQuery object
                    var fL = subHtml.substring(0, 1);
                    if (fL === "." || fL === "#") {
                        if (this.s.subHtmlSelectorRelative && !this.s.dynamic) {
                            subHtml = $currentEle.find(subHtml).html();
                        } else {
                            subHtml = $(subHtml).html();
                        }
                    }
                } else {
                    subHtml = "";
                }
            }
            if (this.s.appendSubHtmlTo === ".lg-sub-html") {
                if (subHtmlUrl) {
                    this.$outer.find(this.s.appendSubHtmlTo).load(subHtmlUrl);
                } else {
                    this.$outer.find(this.s.appendSubHtmlTo).html(subHtml);
                }
            } else {
                if (subHtmlUrl) {
                    this.$slide.eq(index).load(subHtmlUrl);
                } else {
                    this.$slide.eq(index).append(subHtml);
                }
            }
            // Add lg-empty-html class if title doesn't exist
            if (typeof subHtml !== "undefined" && subHtml !== null) {
                if (subHtml === "") {
                    this.$outer.find(this.s.appendSubHtmlTo).addClass("lg-empty-html");
                } else {
                    this.$outer.find(this.s.appendSubHtmlTo).removeClass("lg-empty-html");
                }
            }
            this.$el.trigger("onAfterAppendSubHtml.lg", [ index ]);
        };
        /**
     *  @desc Preload slides
     *  @param {Number} index - index of the slide
     */
        Plugin.prototype.preload = function(index) {
            var i = 1;
            var j = 1;
            for (i = 1; i <= this.s.preload; i++) {
                if (i >= this.$items.length - index) {
                    break;
                }
                this.loadContent(index + i, false, 0);
            }
            for (j = 1; j <= this.s.preload; j++) {
                if (index - j < 0) {
                    break;
                }
                this.loadContent(index - j, false, 0);
            }
        };
        /**
     *  @desc Load slide content into slide.
     *  @param {Number} index - index of the slide.
     *  @param {Boolean} rec - if true call loadcontent() function again.
     *  @param {Boolean} delay - delay for adding complete class. it is 0 except first time.
     */
        Plugin.prototype.loadContent = function(index, rec, delay) {
            var _this = this;
            var _hasPoster = false;
            var _$img;
            var _src;
            var _poster;
            var _srcset;
            var _sizes;
            var _html;
            var getResponsiveSrc = function(srcItms) {
                var rsWidth = [];
                var rsSrc = [];
                for (var i = 0; i < srcItms.length; i++) {
                    var __src = srcItms[i].split(" ");
                    // Manage empty space
                    if (__src[0] === "") {
                        __src.splice(0, 1);
                    }
                    rsSrc.push(__src[0]);
                    rsWidth.push(__src[1]);
                }
                var wWidth = $(window).width();
                for (var j = 0; j < rsWidth.length; j++) {
                    if (parseInt(rsWidth[j], 10) > wWidth) {
                        _src = rsSrc[j];
                        break;
                    }
                }
            };
            if (_this.s.dynamic) {
                if (_this.s.dynamicEl[index].poster) {
                    _hasPoster = true;
                    _poster = _this.s.dynamicEl[index].poster;
                }
                _html = _this.s.dynamicEl[index].html;
                _src = _this.s.dynamicEl[index].src;
                if (_this.s.dynamicEl[index].responsive) {
                    var srcDyItms = _this.s.dynamicEl[index].responsive.split(",");
                    getResponsiveSrc(srcDyItms);
                }
                _srcset = _this.s.dynamicEl[index].srcset;
                _sizes = _this.s.dynamicEl[index].sizes;
            } else {
                if (_this.$items.eq(index).attr("data-poster")) {
                    _hasPoster = true;
                    _poster = _this.$items.eq(index).attr("data-poster");
                }
                _html = _this.$items.eq(index).attr("data-html");
                _src = _this.$items.eq(index).attr("href") || _this.$items.eq(index).attr("data-src");
                if (_this.$items.eq(index).attr("data-responsive")) {
                    var srcItms = _this.$items.eq(index).attr("data-responsive").split(",");
                    getResponsiveSrc(srcItms);
                }
                _srcset = _this.$items.eq(index).attr("data-srcset");
                _sizes = _this.$items.eq(index).attr("data-sizes");
            }
            //if (_src || _srcset || _sizes || _poster) {
            var iframe = false;
            if (_this.s.dynamic) {
                if (_this.s.dynamicEl[index].iframe) {
                    iframe = true;
                }
            } else {
                if (_this.$items.eq(index).attr("data-iframe") === "true") {
                    iframe = true;
                }
            }
            var _isVideo = _this.isVideo(_src, index);
            if (!_this.$slide.eq(index).hasClass("lg-loaded")) {
                if (iframe) {
                    _this.$slide.eq(index).prepend('<div class="lg-video-cont" style="max-width:' + _this.s.iframeMaxWidth + '"><div class="lg-video"><iframe class="lg-object" frameborder="0" src="' + _src + '"  allowfullscreen="true"></iframe></div></div>');
                } else if (_hasPoster) {
                    var videoClass = "";
                    if (_isVideo && _isVideo.youtube) {
                        videoClass = "lg-has-youtube";
                    } else if (_isVideo && _isVideo.vimeo) {
                        videoClass = "lg-has-vimeo";
                    } else {
                        videoClass = "lg-has-html5";
                    }
                    _this.$slide.eq(index).prepend('<div class="lg-video-cont ' + videoClass + ' "><div class="lg-video"><span class="lg-video-play"></span><img class="lg-object lg-has-poster" src="' + _poster + '" /></div></div>');
                } else if (_isVideo) {
                    _this.$slide.eq(index).prepend('<div class="lg-video-cont "><div class="lg-video"></div></div>');
                    _this.$el.trigger("hasVideo.lg", [ index, _src, _html ]);
                } else {
                    _this.$slide.eq(index).prepend('<div class="lg-img-wrap"><img class="lg-object lg-image" src="' + _src + '" /></div>');
                }
                _this.$el.trigger("onAferAppendSlide.lg", [ index ]);
                _$img = _this.$slide.eq(index).find(".lg-object");
                if (_sizes) {
                    _$img.attr("sizes", _sizes);
                }
                if (_srcset) {
                    _$img.attr("srcset", _srcset);
                    try {
                        picturefill({
                            elements: [ _$img[0] ]
                        });
                    } catch (e) {
                        console.error("Make sure you have included Picturefill version 2");
                    }
                }
                if (this.s.appendSubHtmlTo !== ".lg-sub-html") {
                    _this.addHtml(index);
                }
                _this.$slide.eq(index).addClass("lg-loaded");
            }
            _this.$slide.eq(index).find(".lg-object").on("load.lg error.lg", function() {
                // For first time add some delay for displaying the start animation.
                var _speed = 0;
                // Do not change the delay value because it is required for zoom plugin.
                // If gallery opened from direct url (hash) speed value should be 0
                if (delay && !$("body").hasClass("lg-from-hash")) {
                    _speed = delay;
                }
                setTimeout(function() {
                    _this.$slide.eq(index).addClass("lg-complete");
                    _this.$el.trigger("onSlideItemLoad.lg", [ index, delay || 0 ]);
                }, _speed);
            });
            // @todo check load state for html5 videos
            if (_isVideo && _isVideo.html5 && !_hasPoster) {
                _this.$slide.eq(index).addClass("lg-complete");
            }
            if (rec === true) {
                if (!_this.$slide.eq(index).hasClass("lg-complete")) {
                    _this.$slide.eq(index).find(".lg-object").on("load.lg error.lg", function() {
                        _this.preload(index);
                    });
                } else {
                    _this.preload(index);
                }
            }
        };
        /**
    *   @desc slide function for lightgallery
        ** Slide() gets call on start
        ** ** Set lg.on true once slide() function gets called.
        ** Call loadContent() on slide() function inside setTimeout
        ** ** On first slide we do not want any animation like slide of fade
        ** ** So on first slide( if lg.on if false that is first slide) loadContent() should start loading immediately
        ** ** Else loadContent() should wait for the transition to complete.
        ** ** So set timeout s.speed + 50
    <=> ** loadContent() will load slide content in to the particular slide
        ** ** It has recursion (rec) parameter. if rec === true loadContent() will call preload() function.
        ** ** preload will execute only when the previous slide is fully loaded (images iframe)
        ** ** avoid simultaneous image load
    <=> ** Preload() will check for s.preload value and call loadContent() again accoring to preload value
        ** loadContent()  <====> Preload();

    *   @param {Number} index - index of the slide
    *   @param {Boolean} fromTouch - true if slide function called via touch event or mouse drag
    *   @param {Boolean} fromThumb - true if slide function called via thumbnail click
    */
        Plugin.prototype.slide = function(index, fromTouch, fromThumb) {
            var _prevIndex = this.$outer.find(".lg-current").index();
            var _this = this;
            // Prevent if multiple call
            // Required for hsh plugin
            if (_this.lGalleryOn && _prevIndex === index) {
                return;
            }
            var _length = this.$slide.length;
            var _time = _this.lGalleryOn ? this.s.speed : 0;
            var _next = false;
            var _prev = false;
            if (!_this.lgBusy) {
                if (this.s.download) {
                    var _src;
                    if (_this.s.dynamic) {
                        _src = _this.s.dynamicEl[index].downloadUrl !== false && (_this.s.dynamicEl[index].downloadUrl || _this.s.dynamicEl[index].src);
                    } else {
                        _src = _this.$items.eq(index).attr("data-download-url") !== "false" && (_this.$items.eq(index).attr("data-download-url") || _this.$items.eq(index).attr("href") || _this.$items.eq(index).attr("data-src"));
                    }
                    if (_src) {
                        $("#lg-download").attr("href", _src);
                        _this.$outer.removeClass("lg-hide-download");
                    } else {
                        _this.$outer.addClass("lg-hide-download");
                    }
                }
                this.$el.trigger("onBeforeSlide.lg", [ _prevIndex, index, fromTouch, fromThumb ]);
                _this.lgBusy = true;
                clearTimeout(_this.hideBartimeout);
                // Add title if this.s.appendSubHtmlTo === lg-sub-html
                if (this.s.appendSubHtmlTo === ".lg-sub-html") {
                    // wait for slide animation to complete
                    setTimeout(function() {
                        _this.addHtml(index);
                    }, _time);
                }
                this.arrowDisable(index);
                if (!fromTouch) {
                    // remove all transitions
                    _this.$outer.addClass("lg-no-trans");
                    this.$slide.removeClass("lg-prev-slide lg-next-slide");
                    if (index < _prevIndex) {
                        _prev = true;
                        if (index === 0 && _prevIndex === _length - 1 && !fromThumb) {
                            _prev = false;
                            _next = true;
                        }
                    } else if (index > _prevIndex) {
                        _next = true;
                        if (index === _length - 1 && _prevIndex === 0 && !fromThumb) {
                            _prev = true;
                            _next = false;
                        }
                    }
                    if (_prev) {
                        //prevslide
                        this.$slide.eq(index).addClass("lg-prev-slide");
                        this.$slide.eq(_prevIndex).addClass("lg-next-slide");
                    } else if (_next) {
                        // next slide
                        this.$slide.eq(index).addClass("lg-next-slide");
                        this.$slide.eq(_prevIndex).addClass("lg-prev-slide");
                    }
                    // give 50 ms for browser to add/remove class
                    setTimeout(function() {
                        _this.$slide.removeClass("lg-current");
                        //_this.$slide.eq(_prevIndex).removeClass('lg-current');
                        _this.$slide.eq(index).addClass("lg-current");
                        // reset all transitions
                        _this.$outer.removeClass("lg-no-trans");
                    }, 50);
                } else {
                    var touchPrev = index - 1;
                    var touchNext = index + 1;
                    if (index === 0 && _prevIndex === _length - 1) {
                        // next slide
                        touchNext = 0;
                        touchPrev = _length - 1;
                    } else if (index === _length - 1 && _prevIndex === 0) {
                        // prev slide
                        touchNext = 0;
                        touchPrev = _length - 1;
                    }
                    this.$slide.removeClass("lg-prev-slide lg-current lg-next-slide");
                    _this.$slide.eq(touchPrev).addClass("lg-prev-slide");
                    _this.$slide.eq(touchNext).addClass("lg-next-slide");
                    _this.$slide.eq(index).addClass("lg-current");
                }
                if (_this.lGalleryOn) {
                    setTimeout(function() {
                        _this.loadContent(index, true, 0);
                    }, this.s.speed + 50);
                    setTimeout(function() {
                        _this.lgBusy = false;
                        _this.$el.trigger("onAfterSlide.lg", [ _prevIndex, index, fromTouch, fromThumb ]);
                    }, this.s.speed);
                } else {
                    _this.loadContent(index, true, _this.s.backdropDuration);
                    _this.lgBusy = false;
                    _this.$el.trigger("onAfterSlide.lg", [ _prevIndex, index, fromTouch, fromThumb ]);
                }
                _this.lGalleryOn = true;
                if (this.s.counter) {
                    $("#lg-counter-current").text(index + 1);
                }
            }
        };
        /**
     *  @desc Go to next slide
     *  @param {Boolean} fromTouch - true if slide function called via touch event
     */
        Plugin.prototype.goToNextSlide = function(fromTouch) {
            var _this = this;
            if (!_this.lgBusy) {
                if (_this.index + 1 < _this.$slide.length) {
                    _this.index++;
                    _this.$el.trigger("onBeforeNextSlide.lg", [ _this.index ]);
                    _this.slide(_this.index, fromTouch, false);
                } else {
                    if (_this.s.loop) {
                        _this.index = 0;
                        _this.$el.trigger("onBeforeNextSlide.lg", [ _this.index ]);
                        _this.slide(_this.index, fromTouch, false);
                    } else if (_this.s.slideEndAnimatoin) {
                        _this.$outer.addClass("lg-right-end");
                        setTimeout(function() {
                            _this.$outer.removeClass("lg-right-end");
                        }, 400);
                    }
                }
            }
        };
        /**
     *  @desc Go to previous slide
     *  @param {Boolean} fromTouch - true if slide function called via touch event
     */
        Plugin.prototype.goToPrevSlide = function(fromTouch) {
            var _this = this;
            if (!_this.lgBusy) {
                if (_this.index > 0) {
                    _this.index--;
                    _this.$el.trigger("onBeforePrevSlide.lg", [ _this.index, fromTouch ]);
                    _this.slide(_this.index, fromTouch, false);
                } else {
                    if (_this.s.loop) {
                        _this.index = _this.$items.length - 1;
                        _this.$el.trigger("onBeforePrevSlide.lg", [ _this.index, fromTouch ]);
                        _this.slide(_this.index, fromTouch, false);
                    } else if (_this.s.slideEndAnimatoin) {
                        _this.$outer.addClass("lg-left-end");
                        setTimeout(function() {
                            _this.$outer.removeClass("lg-left-end");
                        }, 400);
                    }
                }
            }
        };
        Plugin.prototype.keyPress = function() {
            var _this = this;
            if (this.$items.length > 1) {
                $(window).on("keyup.lg", function(e) {
                    if (_this.$items.length > 1) {
                        if (e.keyCode === 37) {
                            e.preventDefault();
                            _this.goToPrevSlide();
                        }
                        if (e.keyCode === 39) {
                            e.preventDefault();
                            _this.goToNextSlide();
                        }
                    }
                });
            }
            $(window).on("keydown.lg", function(e) {
                if (_this.s.escKey === true && e.keyCode === 27) {
                    e.preventDefault();
                    if (!_this.$outer.hasClass("lg-thumb-open")) {
                        _this.destroy();
                    } else {
                        _this.$outer.removeClass("lg-thumb-open");
                    }
                }
            });
        };
        Plugin.prototype.arrow = function() {
            var _this = this;
            this.$outer.find(".lg-prev").on("click.lg", function() {
                _this.goToPrevSlide();
            });
            this.$outer.find(".lg-next").on("click.lg", function() {
                _this.goToNextSlide();
            });
        };
        Plugin.prototype.arrowDisable = function(index) {
            // Disable arrows if s.hideControlOnEnd is true
            if (!this.s.loop && this.s.hideControlOnEnd) {
                if (index + 1 < this.$slide.length) {
                    this.$outer.find(".lg-next").removeAttr("disabled").removeClass("disabled");
                } else {
                    this.$outer.find(".lg-next").attr("disabled", "disabled").addClass("disabled");
                }
                if (index > 0) {
                    this.$outer.find(".lg-prev").removeAttr("disabled").removeClass("disabled");
                } else {
                    this.$outer.find(".lg-prev").attr("disabled", "disabled").addClass("disabled");
                }
            }
        };
        Plugin.prototype.setTranslate = function($el, xValue, yValue) {
            // jQuery supports Automatic CSS prefixing since jQuery 1.8.0
            if (this.s.useLeft) {
                $el.css("left", xValue);
            } else {
                $el.css({
                    transform: "translate3d(" + xValue + "px, " + yValue + "px, 0px)"
                });
            }
        };
        Plugin.prototype.touchMove = function(startCoords, endCoords) {
            var distance = endCoords - startCoords;
            if (Math.abs(distance) > 15) {
                // reset opacity and transition duration
                this.$outer.addClass("lg-dragging");
                // move current slide
                this.setTranslate(this.$slide.eq(this.index), distance, 0);
                // move next and prev slide with current slide
                this.setTranslate($(".lg-prev-slide"), -this.$slide.eq(this.index).width() + distance, 0);
                this.setTranslate($(".lg-next-slide"), this.$slide.eq(this.index).width() + distance, 0);
            }
        };
        Plugin.prototype.touchEnd = function(distance) {
            var _this = this;
            // keep slide animation for any mode while dragg/swipe
            if (_this.s.mode !== "lg-slide") {
                _this.$outer.addClass("lg-slide");
            }
            this.$slide.not(".lg-current, .lg-prev-slide, .lg-next-slide").css("opacity", "0");
            // set transition duration
            setTimeout(function() {
                _this.$outer.removeClass("lg-dragging");
                if (distance < 0 && Math.abs(distance) > _this.s.swipeThreshold) {
                    _this.goToNextSlide(true);
                } else if (distance > 0 && Math.abs(distance) > _this.s.swipeThreshold) {
                    _this.goToPrevSlide(true);
                } else if (Math.abs(distance) < 5) {
                    // Trigger click if distance is less than 5 pix
                    _this.$el.trigger("onSlideClick.lg");
                }
                _this.$slide.removeAttr("style");
            });
            // remove slide class once drag/swipe is completed if mode is not slide
            setTimeout(function() {
                if (!_this.$outer.hasClass("lg-dragging") && _this.s.mode !== "lg-slide") {
                    _this.$outer.removeClass("lg-slide");
                }
            }, _this.s.speed + 100);
        };
        Plugin.prototype.enableSwipe = function() {
            var _this = this;
            var startCoords = 0;
            var endCoords = 0;
            var isMoved = false;
            if (_this.s.enableSwipe && _this.isTouch && _this.doCss()) {
                _this.$slide.on("touchstart.lg", function(e) {
                    if (!_this.$outer.hasClass("lg-zoomed") && !_this.lgBusy) {
                        e.preventDefault();
                        _this.manageSwipeClass();
                        startCoords = e.originalEvent.targetTouches[0].pageX;
                    }
                });
                _this.$slide.on("touchmove.lg", function(e) {
                    if (!_this.$outer.hasClass("lg-zoomed")) {
                        e.preventDefault();
                        endCoords = e.originalEvent.targetTouches[0].pageX;
                        _this.touchMove(startCoords, endCoords);
                        isMoved = true;
                    }
                });
                _this.$slide.on("touchend.lg", function() {
                    if (!_this.$outer.hasClass("lg-zoomed")) {
                        if (isMoved) {
                            isMoved = false;
                            _this.touchEnd(endCoords - startCoords);
                        } else {
                            _this.$el.trigger("onSlideClick.lg");
                        }
                    }
                });
            }
        };
        Plugin.prototype.enableDrag = function() {
            var _this = this;
            var startCoords = 0;
            var endCoords = 0;
            var isDraging = false;
            var isMoved = false;
            if (_this.s.enableDrag && !_this.isTouch && _this.doCss()) {
                _this.$slide.on("mousedown.lg", function(e) {
                    // execute only on .lg-object
                    if (!_this.$outer.hasClass("lg-zoomed")) {
                        if ($(e.target).hasClass("lg-object") || $(e.target).hasClass("lg-video-play")) {
                            e.preventDefault();
                            if (!_this.lgBusy) {
                                _this.manageSwipeClass();
                                startCoords = e.pageX;
                                isDraging = true;
                                // ** Fix for webkit cursor issue https://code.google.com/p/chromium/issues/detail?id=26723
                                _this.$outer.scrollLeft += 1;
                                _this.$outer.scrollLeft -= 1;
                                // *
                                _this.$outer.removeClass("lg-grab").addClass("lg-grabbing");
                                _this.$el.trigger("onDragstart.lg");
                            }
                        }
                    }
                });
                $(window).on("mousemove.lg", function(e) {
                    if (isDraging) {
                        isMoved = true;
                        endCoords = e.pageX;
                        _this.touchMove(startCoords, endCoords);
                        _this.$el.trigger("onDragmove.lg");
                    }
                });
                $(window).on("mouseup.lg", function(e) {
                    if (isMoved) {
                        isMoved = false;
                        _this.touchEnd(endCoords - startCoords);
                        _this.$el.trigger("onDragend.lg");
                    } else if ($(e.target).hasClass("lg-object") || $(e.target).hasClass("lg-video-play")) {
                        _this.$el.trigger("onSlideClick.lg");
                    }
                    // Prevent execution on click
                    if (isDraging) {
                        isDraging = false;
                        _this.$outer.removeClass("lg-grabbing").addClass("lg-grab");
                    }
                });
            }
        };
        Plugin.prototype.manageSwipeClass = function() {
            var touchNext = this.index + 1;
            var touchPrev = this.index - 1;
            var length = this.$slide.length;
            if (this.s.loop) {
                if (this.index === 0) {
                    touchPrev = length - 1;
                } else if (this.index === length - 1) {
                    touchNext = 0;
                }
            }
            this.$slide.removeClass("lg-next-slide lg-prev-slide");
            if (touchPrev > -1) {
                this.$slide.eq(touchPrev).addClass("lg-prev-slide");
            }
            this.$slide.eq(touchNext).addClass("lg-next-slide");
        };
        Plugin.prototype.mousewheel = function() {
            var _this = this;
            _this.$outer.on("mousewheel.lg", function(e) {
                if (!e.deltaY) {
                    return;
                }
                if (e.deltaY > 0) {
                    _this.goToPrevSlide();
                } else {
                    _this.goToNextSlide();
                }
                e.preventDefault();
            });
        };
        Plugin.prototype.closeGallery = function() {
            var _this = this;
            var mousedown = false;
            this.$outer.find(".lg-close").on("click.lg", function() {
                _this.destroy();
            });
            if (_this.s.closable) {
                // If you drag the slide and release outside gallery gets close on chrome
                // for preventing this check mousedown and mouseup happened on .lg-item or lg-outer
                _this.$outer.on("mousedown.lg", function(e) {
                    if ($(e.target).is(".lg-outer") || $(e.target).is(".lg-item ") || $(e.target).is(".lg-img-wrap")) {
                        mousedown = true;
                    } else {
                        mousedown = false;
                    }
                });
                _this.$outer.on("mouseup.lg", function(e) {
                    if ($(e.target).is(".lg-outer") || $(e.target).is(".lg-item ") || $(e.target).is(".lg-img-wrap") && mousedown) {
                        if (!_this.$outer.hasClass("lg-dragging")) {
                            _this.destroy();
                        }
                    }
                });
            }
        };
        Plugin.prototype.destroy = function(d) {
            var _this = this;
            if (!d) {
                _this.$el.trigger("onBeforeClose.lg");
            }
            $(window).scrollTop(_this.prevScrollTop);
            /**
         * if d is false or undefined destroy will only close the gallery
         * plugins instance remains with the element
         *
         * if d is true destroy will completely remove the plugin
         */
            if (d) {
                if (!_this.s.dynamic) {
                    // only when not using dynamic mode is $items a jquery collection
                    this.$items.off("click.lg click.lgcustom");
                }
                $.removeData(_this.el, "lightGallery");
            }
            // Unbind all events added by lightGallery
            this.$el.off(".lg.tm");
            // Distroy all lightGallery modules
            $.each($.fn.lightGallery.modules, function(key) {
                if (_this.modules[key]) {
                    _this.modules[key].destroy();
                }
            });
            this.lGalleryOn = false;
            clearTimeout(_this.hideBartimeout);
            this.hideBartimeout = false;
            $(window).off(".lg");
            $("body").removeClass("lg-on lg-from-hash");
            if (_this.$outer) {
                _this.$outer.removeClass("lg-visible");
            }
            $(".lg-backdrop").removeClass("in");
            setTimeout(function() {
                if (_this.$outer) {
                    _this.$outer.remove();
                }
                $(".lg-backdrop").remove();
                if (!d) {
                    _this.$el.trigger("onCloseAfter.lg");
                }
            }, _this.s.backdropDuration + 50);
        };
        $.fn.lightGallery = function(options) {
            return this.each(function() {
                if (!$.data(this, "lightGallery")) {
                    $.data(this, "lightGallery", new Plugin(this, options));
                } else {
                    try {
                        $(this).data("lightGallery").init();
                    } catch (err) {
                        console.error("lightGallery has not initiated properly");
                    }
                }
            });
        };
        $.fn.lightGallery.modules = {};
    })();
});
/*! lg-video - v1.0.1 - 2016-09-30
* http://sachinchoolur.github.io/lightGallery
* Copyright (c) 2016 Sachin N; Licensed GPLv3 */
(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module unless amdModuleId is set
        define([ "jquery" ], function(a0) {
            return factory(a0);
        });
    } else if (typeof exports === "object") {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require("jquery"));
    } else {
        factory(jQuery);
    }
})(this, function($) {
    (function() {
        "use strict";
        var defaults = {
            videoMaxWidth: "855px",
            youtubePlayerParams: false,
            vimeoPlayerParams: false,
            dailymotionPlayerParams: false,
            vkPlayerParams: false,
            videojs: false,
            videojsOptions: {}
        };
        var Video = function(element) {
            this.core = $(element).data("lightGallery");
            this.$el = $(element);
            this.core.s = $.extend({}, defaults, this.core.s);
            this.videoLoaded = false;
            this.init();
            return this;
        };
        Video.prototype.init = function() {
            var _this = this;
            // Event triggered when video url found without poster
            _this.core.$el.on("hasVideo.lg.tm", function(event, index, src, html) {
                _this.core.$slide.eq(index).find(".lg-video").append(_this.loadVideo(src, "lg-object", true, index, html));
                if (html) {
                    if (_this.core.s.videojs) {
                        try {
                            videojs(_this.core.$slide.eq(index).find(".lg-html5").get(0), _this.core.s.videojsOptions, function() {
                                if (!_this.videoLoaded) {
                                    this.play();
                                }
                            });
                        } catch (e) {
                            console.error("Make sure you have included videojs");
                        }
                    } else {
                        _this.core.$slide.eq(index).find(".lg-html5").get(0).play();
                    }
                }
            });
            // Set max width for video
            _this.core.$el.on("onAferAppendSlide.lg.tm", function(event, index) {
                _this.core.$slide.eq(index).find(".lg-video-cont").css("max-width", _this.core.s.videoMaxWidth);
                _this.videoLoaded = true;
            });
            var loadOnClick = function($el) {
                // check slide has poster
                if ($el.find(".lg-object").hasClass("lg-has-poster") && $el.find(".lg-object").is(":visible")) {
                    // check already video element present
                    if (!$el.hasClass("lg-has-video")) {
                        $el.addClass("lg-video-playing lg-has-video");
                        var _src;
                        var _html;
                        var _loadVideo = function(_src, _html) {
                            $el.find(".lg-video").append(_this.loadVideo(_src, "", false, _this.core.index, _html));
                            if (_html) {
                                if (_this.core.s.videojs) {
                                    try {
                                        videojs(_this.core.$slide.eq(_this.core.index).find(".lg-html5").get(0), _this.core.s.videojsOptions, function() {
                                            this.play();
                                        });
                                    } catch (e) {
                                        console.error("Make sure you have included videojs");
                                    }
                                } else {
                                    _this.core.$slide.eq(_this.core.index).find(".lg-html5").get(0).play();
                                }
                            }
                        };
                        if (_this.core.s.dynamic) {
                            _src = _this.core.s.dynamicEl[_this.core.index].src;
                            _html = _this.core.s.dynamicEl[_this.core.index].html;
                            _loadVideo(_src, _html);
                        } else {
                            _src = _this.core.$items.eq(_this.core.index).attr("href") || _this.core.$items.eq(_this.core.index).attr("data-src");
                            _html = _this.core.$items.eq(_this.core.index).attr("data-html");
                            _loadVideo(_src, _html);
                        }
                        var $tempImg = $el.find(".lg-object");
                        $el.find(".lg-video").append($tempImg);
                        // @todo loading icon for html5 videos also
                        // for showing the loading indicator while loading video
                        if (!$el.find(".lg-video-object").hasClass("lg-html5")) {
                            $el.removeClass("lg-complete");
                            $el.find(".lg-video-object").on("load.lg error.lg", function() {
                                $el.addClass("lg-complete");
                            });
                        }
                    } else {
                        var youtubePlayer = $el.find(".lg-youtube").get(0);
                        var vimeoPlayer = $el.find(".lg-vimeo").get(0);
                        var dailymotionPlayer = $el.find(".lg-dailymotion").get(0);
                        var html5Player = $el.find(".lg-html5").get(0);
                        if (youtubePlayer) {
                            youtubePlayer.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', "*");
                        } else if (vimeoPlayer) {
                            try {
                                $f(vimeoPlayer).api("play");
                            } catch (e) {
                                console.error("Make sure you have included froogaloop2 js");
                            }
                        } else if (dailymotionPlayer) {
                            dailymotionPlayer.contentWindow.postMessage("play", "*");
                        } else if (html5Player) {
                            if (_this.core.s.videojs) {
                                try {
                                    videojs(html5Player).play();
                                } catch (e) {
                                    console.error("Make sure you have included videojs");
                                }
                            } else {
                                html5Player.play();
                            }
                        }
                        $el.addClass("lg-video-playing");
                    }
                }
            };
            if (_this.core.doCss() && _this.core.$items.length > 1 && (_this.core.s.enableSwipe && _this.core.isTouch || _this.core.s.enableDrag && !_this.core.isTouch)) {
                _this.core.$el.on("onSlideClick.lg.tm", function() {
                    var $el = _this.core.$slide.eq(_this.core.index);
                    loadOnClick($el);
                });
            } else {
                // For IE 9 and bellow
                _this.core.$slide.on("click.lg", function() {
                    loadOnClick($(this));
                });
            }
            _this.core.$el.on("onBeforeSlide.lg.tm", function(event, prevIndex, index) {
                var $videoSlide = _this.core.$slide.eq(prevIndex);
                var youtubePlayer = $videoSlide.find(".lg-youtube").get(0);
                var vimeoPlayer = $videoSlide.find(".lg-vimeo").get(0);
                var dailymotionPlayer = $videoSlide.find(".lg-dailymotion").get(0);
                var vkPlayer = $videoSlide.find(".lg-vk").get(0);
                var html5Player = $videoSlide.find(".lg-html5").get(0);
                if (youtubePlayer) {
                    youtubePlayer.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', "*");
                } else if (vimeoPlayer) {
                    try {
                        $f(vimeoPlayer).api("pause");
                    } catch (e) {
                        console.error("Make sure you have included froogaloop2 js");
                    }
                } else if (dailymotionPlayer) {
                    dailymotionPlayer.contentWindow.postMessage("pause", "*");
                } else if (html5Player) {
                    if (_this.core.s.videojs) {
                        try {
                            videojs(html5Player).pause();
                        } catch (e) {
                            console.error("Make sure you have included videojs");
                        }
                    } else {
                        html5Player.pause();
                    }
                }
                if (vkPlayer) {
                    $(vkPlayer).attr("src", $(vkPlayer).attr("src").replace("&autoplay", "&noplay"));
                }
                var _src;
                if (_this.core.s.dynamic) {
                    _src = _this.core.s.dynamicEl[index].src;
                } else {
                    _src = _this.core.$items.eq(index).attr("href") || _this.core.$items.eq(index).attr("data-src");
                }
                var _isVideo = _this.core.isVideo(_src, index) || {};
                if (_isVideo.youtube || _isVideo.vimeo || _isVideo.dailymotion || _isVideo.vk) {
                    _this.core.$outer.addClass("lg-hide-download");
                }
            });
            _this.core.$el.on("onAfterSlide.lg.tm", function(event, prevIndex) {
                _this.core.$slide.eq(prevIndex).removeClass("lg-video-playing");
            });
        };
        Video.prototype.loadVideo = function(src, addClass, noposter, index, html) {
            var video = "";
            var autoplay = 1;
            var a = "";
            var isVideo = this.core.isVideo(src, index) || {};
            // Enable autoplay for first video if poster doesn't exist
            if (noposter) {
                if (this.videoLoaded) {
                    autoplay = 0;
                } else {
                    autoplay = 1;
                }
            }
            if (isVideo.youtube) {
                a = "?wmode=opaque&autoplay=" + autoplay + "&enablejsapi=1";
                if (this.core.s.youtubePlayerParams) {
                    a = a + "&" + $.param(this.core.s.youtubePlayerParams);
                }
                video = '<iframe class="lg-video-object lg-youtube ' + addClass + '" width="560" height="315" src="//www.youtube.com/embed/' + isVideo.youtube[1] + a + '" frameborder="0" allowfullscreen></iframe>';
            } else if (isVideo.vimeo) {
                a = "?autoplay=" + autoplay + "&api=1";
                if (this.core.s.vimeoPlayerParams) {
                    a = a + "&" + $.param(this.core.s.vimeoPlayerParams);
                }
                video = '<iframe class="lg-video-object lg-vimeo ' + addClass + '" width="560" height="315"  src="//player.vimeo.com/video/' + isVideo.vimeo[1] + a + '" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>';
            } else if (isVideo.dailymotion) {
                a = "?wmode=opaque&autoplay=" + autoplay + "&api=postMessage";
                if (this.core.s.dailymotionPlayerParams) {
                    a = a + "&" + $.param(this.core.s.dailymotionPlayerParams);
                }
                video = '<iframe class="lg-video-object lg-dailymotion ' + addClass + '" width="560" height="315" src="//www.dailymotion.com/embed/video/' + isVideo.dailymotion[1] + a + '" frameborder="0" allowfullscreen></iframe>';
            } else if (isVideo.html5) {
                var fL = html.substring(0, 1);
                if (fL === "." || fL === "#") {
                    html = $(html).html();
                }
                video = html;
            } else if (isVideo.vk) {
                a = "&autoplay=" + autoplay;
                if (this.core.s.vkPlayerParams) {
                    a = a + "&" + $.param(this.core.s.vkPlayerParams);
                }
                video = '<iframe class="lg-video-object lg-vk ' + addClass + '" width="560" height="315" src="http://vk.com/video_ext.php?' + isVideo.vk[1] + a + '" frameborder="0" allowfullscreen></iframe>';
            }
            return video;
        };
        Video.prototype.destroy = function() {
            this.videoLoaded = false;
        };
        $.fn.lightGallery.modules.video = Video;
    })();
});
/*! lg-hash - v1.0.1 - 2016-09-30
* http://sachinchoolur.github.io/lightGallery
* Copyright (c) 2016 Sachin N; Licensed GPLv3 */
(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module unless amdModuleId is set
        define([ "jquery" ], function(a0) {
            return factory(a0);
        });
    } else if (typeof exports === "object") {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require("jquery"));
    } else {
        factory(jQuery);
    }
})(this, function($) {
    (function() {
        "use strict";
        var defaults = {
            hash: true
        };
        var Hash = function(element) {
            this.core = $(element).data("lightGallery");
            this.core.s = $.extend({}, defaults, this.core.s);
            if (this.core.s.hash) {
                this.oldHash = window.location.hash;
                this.init();
            }
            return this;
        };
        Hash.prototype.init = function() {
            var _this = this;
            var _hash;
            // Change hash value on after each slide transition
            _this.core.$el.on("onAfterSlide.lg.tm", function(event, prevIndex, index) {
                window.location.hash = "lg=" + _this.core.s.galleryId + "&slide=" + index;
            });
            // Listen hash change and change the slide according to slide value
            $(window).on("hashchange.lg.hash", function() {
                _hash = window.location.hash;
                var _idx = parseInt(_hash.split("&slide=")[1], 10);
                // it galleryId doesn't exist in the url close the gallery
                if (_hash.indexOf("lg=" + _this.core.s.galleryId) > -1) {
                    _this.core.slide(_idx, false, false);
                } else if (_this.core.lGalleryOn) {
                    _this.core.destroy();
                }
            });
        };
        Hash.prototype.destroy = function() {
            if (!this.core.s.hash) {
                return;
            }
            // Reset to old hash value
            if (this.oldHash && this.oldHash.indexOf("lg=" + this.core.s.galleryId) < 0) {
                window.location.hash = this.oldHash;
            } else {
                if (history.pushState) {
                    history.pushState("", document.title, window.location.pathname + window.location.search);
                } else {
                    window.location.hash = "";
                }
            }
            this.core.$el.off(".lg.hash");
        };
        $.fn.lightGallery.modules.hash = Hash;
    })();
});
/*! lg-thumbnail - v1.0.1 - 2016-09-30
* http://sachinchoolur.github.io/lightGallery
* Copyright (c) 2016 Sachin N; Licensed GPLv3 */
(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module unless amdModuleId is set
        define([ "jquery" ], function(a0) {
            return factory(a0);
        });
    } else if (typeof exports === "object") {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require("jquery"));
    } else {
        factory(jQuery);
    }
})(this, function($) {
    (function() {
        "use strict";
        var defaults = {
            thumbnail: true,
            animateThumb: true,
            currentPagerPosition: "middle",
            thumbWidth: 100,
            thumbContHeight: 100,
            thumbMargin: 5,
            exThumbImage: false,
            showThumbByDefault: true,
            toogleThumb: true,
            pullCaptionUp: true,
            enableThumbDrag: true,
            enableThumbSwipe: true,
            swipeThreshold: 50,
            loadYoutubeThumbnail: true,
            youtubeThumbSize: 1,
            loadVimeoThumbnail: true,
            vimeoThumbSize: "thumbnail_small",
            loadDailymotionThumbnail: true
        };
        var Thumbnail = function(element) {
            // get lightGallery core plugin data
            this.core = $(element).data("lightGallery");
            // extend module default settings with lightGallery core settings
            this.core.s = $.extend({}, defaults, this.core.s);
            this.$el = $(element);
            this.$thumbOuter = null;
            this.thumbOuterWidth = 0;
            this.thumbTotalWidth = this.core.$items.length * (this.core.s.thumbWidth + this.core.s.thumbMargin);
            this.thumbIndex = this.core.index;
            // Thumbnail animation value
            this.left = 0;
            this.init();
            return this;
        };
        Thumbnail.prototype.init = function() {
            var _this = this;
            if (this.core.s.thumbnail && this.core.$items.length > 1) {
                if (this.core.s.showThumbByDefault) {
                    setTimeout(function() {
                        _this.core.$outer.addClass("lg-thumb-open");
                    }, 700);
                }
                if (this.core.s.pullCaptionUp) {
                    this.core.$outer.addClass("lg-pull-caption-up");
                }
                this.build();
                if (this.core.s.animateThumb) {
                    if (this.core.s.enableThumbDrag && !this.core.isTouch && this.core.doCss()) {
                        this.enableThumbDrag();
                    }
                    if (this.core.s.enableThumbSwipe && this.core.isTouch && this.core.doCss()) {
                        this.enableThumbSwipe();
                    }
                    this.thumbClickable = false;
                } else {
                    this.thumbClickable = true;
                }
                this.toogle();
                this.thumbkeyPress();
            }
        };
        Thumbnail.prototype.build = function() {
            var _this = this;
            var thumbList = "";
            var vimeoErrorThumbSize = "";
            var $thumb;
            var html = '<div class="lg-thumb-outer">' + '<div class="lg-thumb group">' + "</div>" + "</div>";
            switch (this.core.s.vimeoThumbSize) {
              case "thumbnail_large":
                vimeoErrorThumbSize = "640";
                break;

              case "thumbnail_medium":
                vimeoErrorThumbSize = "200x150";
                break;

              case "thumbnail_small":
                vimeoErrorThumbSize = "100x75";
            }
            _this.core.$outer.addClass("lg-has-thumb");
            _this.core.$outer.find(".lg").append(html);
            _this.$thumbOuter = _this.core.$outer.find(".lg-thumb-outer");
            _this.thumbOuterWidth = _this.$thumbOuter.width();
            if (_this.core.s.animateThumb) {
                _this.core.$outer.find(".lg-thumb").css({
                    width: _this.thumbTotalWidth + "px",
                    position: "relative"
                });
            }
            if (this.core.s.animateThumb) {
                _this.$thumbOuter.css("height", _this.core.s.thumbContHeight + "px");
            }
            function getThumb(src, thumb, index) {
                var isVideo = _this.core.isVideo(src, index) || {};
                var thumbImg;
                var vimeoId = "";
                if (isVideo.youtube || isVideo.vimeo || isVideo.dailymotion) {
                    if (isVideo.youtube) {
                        if (_this.core.s.loadYoutubeThumbnail) {
                            thumbImg = "//img.youtube.com/vi/" + isVideo.youtube[1] + "/" + _this.core.s.youtubeThumbSize + ".jpg";
                        } else {
                            thumbImg = thumb;
                        }
                    } else if (isVideo.vimeo) {
                        if (_this.core.s.loadVimeoThumbnail) {
                            thumbImg = "//i.vimeocdn.com/video/error_" + vimeoErrorThumbSize + ".jpg";
                            vimeoId = isVideo.vimeo[1];
                        } else {
                            thumbImg = thumb;
                        }
                    } else if (isVideo.dailymotion) {
                        if (_this.core.s.loadDailymotionThumbnail) {
                            thumbImg = "//www.dailymotion.com/thumbnail/video/" + isVideo.dailymotion[1];
                        } else {
                            thumbImg = thumb;
                        }
                    }
                } else {
                    thumbImg = thumb;
                }
                thumbList += '<div data-vimeo-id="' + vimeoId + '" class="lg-thumb-item" style="width:' + _this.core.s.thumbWidth + "px; margin-right: " + _this.core.s.thumbMargin + 'px"><img src="' + thumbImg + '" /></div>';
                vimeoId = "";
            }
            if (_this.core.s.dynamic) {
                for (var i = 0; i < _this.core.s.dynamicEl.length; i++) {
                    getThumb(_this.core.s.dynamicEl[i].src, _this.core.s.dynamicEl[i].thumb, i);
                }
            } else {
                _this.core.$items.each(function(i) {
                    if (!_this.core.s.exThumbImage) {
                        getThumb($(this).attr("href") || $(this).attr("data-src"), $(this).find("img").attr("src"), i);
                    } else {
                        getThumb($(this).attr("href") || $(this).attr("data-src"), $(this).attr(_this.core.s.exThumbImage), i);
                    }
                });
            }
            _this.core.$outer.find(".lg-thumb").html(thumbList);
            $thumb = _this.core.$outer.find(".lg-thumb-item");
            // Load vimeo thumbnails
            $thumb.each(function() {
                var $this = $(this);
                var vimeoVideoId = $this.attr("data-vimeo-id");
                if (vimeoVideoId) {
                    $.getJSON("//www.vimeo.com/api/v2/video/" + vimeoVideoId + ".json?callback=?", {
                        format: "json"
                    }, function(data) {
                        $this.find("img").attr("src", data[0][_this.core.s.vimeoThumbSize]);
                    });
                }
            });
            // manage active class for thumbnail
            $thumb.eq(_this.core.index).addClass("active");
            _this.core.$el.on("onBeforeSlide.lg.tm", function() {
                $thumb.removeClass("active");
                $thumb.eq(_this.core.index).addClass("active");
            });
            $thumb.on("click.lg touchend.lg", function() {
                var _$this = $(this);
                setTimeout(function() {
                    // In IE9 and bellow touch does not support
                    // Go to slide if browser does not support css transitions
                    if (_this.thumbClickable && !_this.core.lgBusy || !_this.core.doCss()) {
                        _this.core.index = _$this.index();
                        _this.core.slide(_this.core.index, false, true);
                    }
                }, 50);
            });
            _this.core.$el.on("onBeforeSlide.lg.tm", function() {
                _this.animateThumb(_this.core.index);
            });
            $(window).on("resize.lg.thumb orientationchange.lg.thumb", function() {
                setTimeout(function() {
                    _this.animateThumb(_this.core.index);
                    _this.thumbOuterWidth = _this.$thumbOuter.width();
                }, 200);
            });
        };
        Thumbnail.prototype.setTranslate = function(value) {
            // jQuery supports Automatic CSS prefixing since jQuery 1.8.0
            this.core.$outer.find(".lg-thumb").css({
                transform: "translate3d(-" + value + "px, 0px, 0px)"
            });
        };
        Thumbnail.prototype.animateThumb = function(index) {
            var $thumb = this.core.$outer.find(".lg-thumb");
            if (this.core.s.animateThumb) {
                var position;
                switch (this.core.s.currentPagerPosition) {
                  case "left":
                    position = 0;
                    break;

                  case "middle":
                    position = this.thumbOuterWidth / 2 - this.core.s.thumbWidth / 2;
                    break;

                  case "right":
                    position = this.thumbOuterWidth - this.core.s.thumbWidth;
                }
                this.left = (this.core.s.thumbWidth + this.core.s.thumbMargin) * index - 1 - position;
                if (this.left > this.thumbTotalWidth - this.thumbOuterWidth) {
                    this.left = this.thumbTotalWidth - this.thumbOuterWidth;
                }
                if (this.left < 0) {
                    this.left = 0;
                }
                if (this.core.lGalleryOn) {
                    if (!$thumb.hasClass("on")) {
                        this.core.$outer.find(".lg-thumb").css("transition-duration", this.core.s.speed + "ms");
                    }
                    if (!this.core.doCss()) {
                        $thumb.animate({
                            left: -this.left + "px"
                        }, this.core.s.speed);
                    }
                } else {
                    if (!this.core.doCss()) {
                        $thumb.css("left", -this.left + "px");
                    }
                }
                this.setTranslate(this.left);
            }
        };
        // Enable thumbnail dragging and swiping
        Thumbnail.prototype.enableThumbDrag = function() {
            var _this = this;
            var startCoords = 0;
            var endCoords = 0;
            var isDraging = false;
            var isMoved = false;
            var tempLeft = 0;
            _this.$thumbOuter.addClass("lg-grab");
            _this.core.$outer.find(".lg-thumb").on("mousedown.lg.thumb", function(e) {
                if (_this.thumbTotalWidth > _this.thumbOuterWidth) {
                    // execute only on .lg-object
                    e.preventDefault();
                    startCoords = e.pageX;
                    isDraging = true;
                    // ** Fix for webkit cursor issue https://code.google.com/p/chromium/issues/detail?id=26723
                    _this.core.$outer.scrollLeft += 1;
                    _this.core.$outer.scrollLeft -= 1;
                    // *
                    _this.thumbClickable = false;
                    _this.$thumbOuter.removeClass("lg-grab").addClass("lg-grabbing");
                }
            });
            $(window).on("mousemove.lg.thumb", function(e) {
                if (isDraging) {
                    tempLeft = _this.left;
                    isMoved = true;
                    endCoords = e.pageX;
                    _this.$thumbOuter.addClass("lg-dragging");
                    tempLeft = tempLeft - (endCoords - startCoords);
                    if (tempLeft > _this.thumbTotalWidth - _this.thumbOuterWidth) {
                        tempLeft = _this.thumbTotalWidth - _this.thumbOuterWidth;
                    }
                    if (tempLeft < 0) {
                        tempLeft = 0;
                    }
                    // move current slide
                    _this.setTranslate(tempLeft);
                }
            });
            $(window).on("mouseup.lg.thumb", function() {
                if (isMoved) {
                    isMoved = false;
                    _this.$thumbOuter.removeClass("lg-dragging");
                    _this.left = tempLeft;
                    if (Math.abs(endCoords - startCoords) < _this.core.s.swipeThreshold) {
                        _this.thumbClickable = true;
                    }
                } else {
                    _this.thumbClickable = true;
                }
                if (isDraging) {
                    isDraging = false;
                    _this.$thumbOuter.removeClass("lg-grabbing").addClass("lg-grab");
                }
            });
        };
        Thumbnail.prototype.enableThumbSwipe = function() {
            var _this = this;
            var startCoords = 0;
            var endCoords = 0;
            var isMoved = false;
            var tempLeft = 0;
            _this.core.$outer.find(".lg-thumb").on("touchstart.lg", function(e) {
                if (_this.thumbTotalWidth > _this.thumbOuterWidth) {
                    e.preventDefault();
                    startCoords = e.originalEvent.targetTouches[0].pageX;
                    _this.thumbClickable = false;
                }
            });
            _this.core.$outer.find(".lg-thumb").on("touchmove.lg", function(e) {
                if (_this.thumbTotalWidth > _this.thumbOuterWidth) {
                    e.preventDefault();
                    endCoords = e.originalEvent.targetTouches[0].pageX;
                    isMoved = true;
                    _this.$thumbOuter.addClass("lg-dragging");
                    tempLeft = _this.left;
                    tempLeft = tempLeft - (endCoords - startCoords);
                    if (tempLeft > _this.thumbTotalWidth - _this.thumbOuterWidth) {
                        tempLeft = _this.thumbTotalWidth - _this.thumbOuterWidth;
                    }
                    if (tempLeft < 0) {
                        tempLeft = 0;
                    }
                    // move current slide
                    _this.setTranslate(tempLeft);
                }
            });
            _this.core.$outer.find(".lg-thumb").on("touchend.lg", function() {
                if (_this.thumbTotalWidth > _this.thumbOuterWidth) {
                    if (isMoved) {
                        isMoved = false;
                        _this.$thumbOuter.removeClass("lg-dragging");
                        if (Math.abs(endCoords - startCoords) < _this.core.s.swipeThreshold) {
                            _this.thumbClickable = true;
                        }
                        _this.left = tempLeft;
                    } else {
                        _this.thumbClickable = true;
                    }
                } else {
                    _this.thumbClickable = true;
                }
            });
        };
        Thumbnail.prototype.toogle = function() {
            var _this = this;
            if (_this.core.s.toogleThumb) {
                _this.core.$outer.addClass("lg-can-toggle");
                _this.$thumbOuter.append('<span class="lg-toogle-thumb lg-icon"></span>');
                _this.core.$outer.find(".lg-toogle-thumb").on("click.lg", function() {
                    _this.core.$outer.toggleClass("lg-thumb-open");
                });
            }
        };
        Thumbnail.prototype.thumbkeyPress = function() {
            var _this = this;
            $(window).on("keydown.lg.thumb", function(e) {
                if (e.keyCode === 38) {
                    e.preventDefault();
                    _this.core.$outer.addClass("lg-thumb-open");
                } else if (e.keyCode === 40) {
                    e.preventDefault();
                    _this.core.$outer.removeClass("lg-thumb-open");
                }
            });
        };
        Thumbnail.prototype.destroy = function() {
            if (this.core.s.thumbnail && this.core.$items.length > 1) {
                $(window).off("resize.lg.thumb orientationchange.lg.thumb keydown.lg.thumb");
                this.$thumbOuter.remove();
                this.core.$outer.removeClass("lg-has-thumb");
            }
        };
        $.fn.lightGallery.modules.Thumbnail = Thumbnail;
    })();
});
/*! lg-share - v1.0.2 - 2016-11-26
* http://sachinchoolur.github.io/lightGallery
* Copyright (c) 2016 Sachin N; Licensed GPLv3 */
(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module unless amdModuleId is set
        define([ "jquery" ], function(a0) {
            return factory(a0);
        });
    } else if (typeof exports === "object") {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require("jquery"));
    } else {
        factory(jQuery);
    }
})(this, function($) {
    (function() {
        "use strict";
        var defaults = {
            share: true,
            facebook: true,
            facebookDropdownText: "Facebook",
            twitter: true,
            twitterDropdownText: "Twitter",
            googlePlus: true,
            googlePlusDropdownText: "GooglePlus",
            pinterest: true,
            pinterestDropdownText: "Pinterest"
        };
        var Share = function(element) {
            this.core = $(element).data("lightGallery");
            this.core.s = $.extend({}, defaults, this.core.s);
            if (this.core.s.share) {
                this.init();
            }
            return this;
        };
        Share.prototype.init = function() {
            var _this = this;
            var shareHtml = '<span id="lg-share" class="lg-icon">' + '<ul class="lg-dropdown" style="position: absolute;">';
            shareHtml += _this.core.s.facebook ? '<li><a id="lg-share-facebook" target="_blank"><span class="lg-icon"></span><span class="lg-dropdown-text">' + this.core.s.facebookDropdownText + "</span></a></li>" : "";
            shareHtml += _this.core.s.twitter ? '<li><a id="lg-share-twitter" target="_blank"><span class="lg-icon"></span><span class="lg-dropdown-text">' + this.core.s.twitterDropdownText + "</span></a></li>" : "";
            shareHtml += _this.core.s.googlePlus ? '<li><a id="lg-share-googleplus" target="_blank"><span class="lg-icon"></span><span class="lg-dropdown-text">' + this.core.s.googlePlusDropdownText + "</span></a></li>" : "";
            shareHtml += _this.core.s.pinterest ? '<li><a id="lg-share-pinterest" target="_blank"><span class="lg-icon"></span><span class="lg-dropdown-text">' + this.core.s.pinterestDropdownText + "</span></a></li>" : "";
            shareHtml += "</ul></span>";
            this.core.$outer.find(".lg-toolbar").append(shareHtml);
            this.core.$outer.find(".lg").append('<div id="lg-dropdown-overlay"></div>');
            $("#lg-share").on("click.lg", function() {
                _this.core.$outer.toggleClass("lg-dropdown-active");
            });
            $("#lg-dropdown-overlay").on("click.lg", function() {
                _this.core.$outer.removeClass("lg-dropdown-active");
            });
            _this.core.$el.on("onAfterSlide.lg.tm", function(event, prevIndex, index) {
                setTimeout(function() {
                    $("#lg-share-facebook").attr("href", "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(_this.core.$items.eq(index).attr("data-facebook-share-url") || window.location.href));
                    $("#lg-share-twitter").attr("href", "https://twitter.com/intent/tweet?text=" + _this.core.$items.eq(index).attr("data-tweet-text") + "&url=" + encodeURIComponent(_this.core.$items.eq(index).attr("data-twitter-share-url") || window.location.href));
                    $("#lg-share-googleplus").attr("href", "https://plus.google.com/share?url=" + encodeURIComponent(_this.core.$items.eq(index).attr("data-googleplus-share-url") || window.location.href));
                    $("#lg-share-pinterest").attr("href", "http://www.pinterest.com/pin/create/button/?url=" + encodeURIComponent(_this.core.$items.eq(index).attr("data-pinterest-share-url") || window.location.href) + "&media=" + encodeURIComponent(_this.core.$items.eq(index).attr("href") || _this.core.$items.eq(index).attr("data-src")) + "&description=" + _this.core.$items.eq(index).attr("data-pinterest-text"));
                }, 100);
            });
        };
        Share.prototype.destroy = function() {};
        $.fn.lightGallery.modules.share = Share;
    })();
});
/*! lg-fullscreen - v1.0.1 - 2016-09-30
* http://sachinchoolur.github.io/lightGallery
* Copyright (c) 2016 Sachin N; Licensed GPLv3 */
(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module unless amdModuleId is set
        define([ "jquery" ], function(a0) {
            return factory(a0);
        });
    } else if (typeof exports === "object") {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require("jquery"));
    } else {
        factory(jQuery);
    }
})(this, function($) {
    (function() {
        "use strict";
        var defaults = {
            fullScreen: true
        };
        var Fullscreen = function(element) {
            // get lightGallery core plugin data
            this.core = $(element).data("lightGallery");
            this.$el = $(element);
            // extend module defalut settings with lightGallery core settings
            this.core.s = $.extend({}, defaults, this.core.s);
            this.init();
            return this;
        };
        Fullscreen.prototype.init = function() {
            var fullScreen = "";
            if (this.core.s.fullScreen) {
                // check for fullscreen browser support
                if (!document.fullscreenEnabled && !document.webkitFullscreenEnabled && !document.mozFullScreenEnabled && !document.msFullscreenEnabled) {
                    return;
                } else {
                    fullScreen = '<span class="lg-fullscreen lg-icon"></span>';
                    this.core.$outer.find(".lg-toolbar").append(fullScreen);
                    this.fullScreen();
                }
            }
        };
        Fullscreen.prototype.requestFullscreen = function() {
            var el = document.documentElement;
            if (el.requestFullscreen) {
                el.requestFullscreen();
            } else if (el.msRequestFullscreen) {
                el.msRequestFullscreen();
            } else if (el.mozRequestFullScreen) {
                el.mozRequestFullScreen();
            } else if (el.webkitRequestFullscreen) {
                el.webkitRequestFullscreen();
            }
        };
        Fullscreen.prototype.exitFullscreen = function() {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        };
        // https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Using_full_screen_mode
        Fullscreen.prototype.fullScreen = function() {
            var _this = this;
            $(document).on("fullscreenchange.lg webkitfullscreenchange.lg mozfullscreenchange.lg MSFullscreenChange.lg", function() {
                _this.core.$outer.toggleClass("lg-fullscreen-on");
            });
            this.core.$outer.find(".lg-fullscreen").on("click.lg", function() {
                if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
                    _this.requestFullscreen();
                } else {
                    _this.exitFullscreen();
                }
            });
        };
        Fullscreen.prototype.destroy = function() {
            // exit from fullscreen if activated
            this.exitFullscreen();
            $(document).off("fullscreenchange.lg webkitfullscreenchange.lg mozfullscreenchange.lg MSFullscreenChange.lg");
        };
        $.fn.lightGallery.modules.fullscreen = Fullscreen;
    })();
});
/*! lg-autoplay - v1.0.1 - 2016-09-30
* http://sachinchoolur.github.io/lightGallery
* Copyright (c) 2016 Sachin N; Licensed GPLv3 */
(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module unless amdModuleId is set
        define([ "jquery" ], function(a0) {
            return factory(a0);
        });
    } else if (typeof exports === "object") {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require("jquery"));
    } else {
        factory(jQuery);
    }
})(this, function($) {
    (function() {
        "use strict";
        var defaults = {
            autoplay: false,
            pause: 5e3,
            progressBar: true,
            fourceAutoplay: false,
            autoplayControls: true,
            appendAutoplayControlsTo: ".lg-toolbar"
        };
        /**
     * Creates the autoplay plugin.
     * @param {object} element - lightGallery element
     */
        var Autoplay = function(element) {
            this.core = $(element).data("lightGallery");
            this.$el = $(element);
            // Execute only if items are above 1
            if (this.core.$items.length < 2) {
                return false;
            }
            this.core.s = $.extend({}, defaults, this.core.s);
            this.interval = false;
            // Identify if slide happened from autoplay
            this.fromAuto = true;
            // Identify if autoplay canceled from touch/drag
            this.canceledOnTouch = false;
            // save fourceautoplay value
            this.fourceAutoplayTemp = this.core.s.fourceAutoplay;
            // do not allow progress bar if browser does not support css3 transitions
            if (!this.core.doCss()) {
                this.core.s.progressBar = false;
            }
            this.init();
            return this;
        };
        Autoplay.prototype.init = function() {
            var _this = this;
            // append autoplay controls
            if (_this.core.s.autoplayControls) {
                _this.controls();
            }
            // Create progress bar
            if (_this.core.s.progressBar) {
                _this.core.$outer.find(".lg").append('<div class="lg-progress-bar"><div class="lg-progress"></div></div>');
            }
            // set progress
            _this.progress();
            // Start autoplay
            if (_this.core.s.autoplay) {
                _this.startlAuto();
            }
            // cancel interval on touchstart and dragstart
            _this.$el.on("onDragstart.lg.tm touchstart.lg.tm", function() {
                if (_this.interval) {
                    _this.cancelAuto();
                    _this.canceledOnTouch = true;
                }
            });
            // restore autoplay if autoplay canceled from touchstart / dragstart
            _this.$el.on("onDragend.lg.tm touchend.lg.tm onSlideClick.lg.tm", function() {
                if (!_this.interval && _this.canceledOnTouch) {
                    _this.startlAuto();
                    _this.canceledOnTouch = false;
                }
            });
        };
        Autoplay.prototype.progress = function() {
            var _this = this;
            var _$progressBar;
            var _$progress;
            _this.$el.on("onBeforeSlide.lg.tm", function() {
                // start progress bar animation
                if (_this.core.s.progressBar && _this.fromAuto) {
                    _$progressBar = _this.core.$outer.find(".lg-progress-bar");
                    _$progress = _this.core.$outer.find(".lg-progress");
                    if (_this.interval) {
                        _$progress.removeAttr("style");
                        _$progressBar.removeClass("lg-start");
                        setTimeout(function() {
                            _$progress.css("transition", "width " + (_this.core.s.speed + _this.core.s.pause) + "ms ease 0s");
                            _$progressBar.addClass("lg-start");
                        }, 20);
                    }
                }
                // Remove setinterval if slide is triggered manually and fourceautoplay is false
                if (!_this.fromAuto && !_this.core.s.fourceAutoplay) {
                    _this.cancelAuto();
                }
                _this.fromAuto = false;
            });
        };
        // Manage autoplay via play/stop buttons
        Autoplay.prototype.controls = function() {
            var _this = this;
            var _html = '<span class="lg-autoplay-button lg-icon"></span>';
            // Append autoplay controls
            $(this.core.s.appendAutoplayControlsTo).append(_html);
            _this.core.$outer.find(".lg-autoplay-button").on("click.lg", function() {
                if ($(_this.core.$outer).hasClass("lg-show-autoplay")) {
                    _this.cancelAuto();
                    _this.core.s.fourceAutoplay = false;
                } else {
                    if (!_this.interval) {
                        _this.startlAuto();
                        _this.core.s.fourceAutoplay = _this.fourceAutoplayTemp;
                    }
                }
            });
        };
        // Autostart gallery
        Autoplay.prototype.startlAuto = function() {
            var _this = this;
            _this.core.$outer.find(".lg-progress").css("transition", "width " + (_this.core.s.speed + _this.core.s.pause) + "ms ease 0s");
            _this.core.$outer.addClass("lg-show-autoplay");
            _this.core.$outer.find(".lg-progress-bar").addClass("lg-start");
            _this.interval = setInterval(function() {
                if (_this.core.index + 1 < _this.core.$items.length) {
                    _this.core.index++;
                } else {
                    _this.core.index = 0;
                }
                _this.fromAuto = true;
                _this.core.slide(_this.core.index, false, false);
            }, _this.core.s.speed + _this.core.s.pause);
        };
        // cancel Autostart
        Autoplay.prototype.cancelAuto = function() {
            clearInterval(this.interval);
            this.interval = false;
            this.core.$outer.find(".lg-progress").removeAttr("style");
            this.core.$outer.removeClass("lg-show-autoplay");
            this.core.$outer.find(".lg-progress-bar").removeClass("lg-start");
        };
        Autoplay.prototype.destroy = function() {
            this.cancelAuto();
            this.core.$outer.find(".lg-progress-bar").remove();
        };
        $.fn.lightGallery.modules.autoplay = Autoplay;
    })();
});
/*jshint browser:true */
/*!
* FitVids 1.1
*
* Copyright 2013, Chris Coyier - http://css-tricks.com + Dave Rupert - http://daverupert.com
* Credit to Thierry Koblentz - http://www.alistapart.com/articles/creating-intrinsic-ratios-for-video/
* Released under the WTFPL license - http://sam.zoy.org/wtfpl/
*
*/
(function($) {
    "use strict";
    $.fn.fitVids = function(options) {
        var settings = {
            customSelector: null,
            ignore: null
        };
        if (!document.getElementById("fit-vids-style")) {
            // appendStyles: https://github.com/toddmotto/fluidvids/blob/master/dist/fluidvids.js
            var head = document.head || document.getElementsByTagName("head")[0];
            var css = ".fluid-width-video-wrapper{width:100%;position:relative;padding:0;}.fluid-width-video-wrapper iframe,.fluid-width-video-wrapper object,.fluid-width-video-wrapper embed {position:absolute;top:0;left:0;width:100%;height:100%;}";
            var div = document.createElement("div");
            div.innerHTML = '<p>x</p><style id="fit-vids-style">' + css + "</style>";
            head.appendChild(div.childNodes[1]);
        }
        if (options) {
            $.extend(settings, options);
        }
        return this.each(function() {
            var selectors = [ 'iframe[src*="player.vimeo.com"]', 'iframe[src*="youtube.com"]', 'iframe[src*="youtube-nocookie.com"]', 'iframe[src*="kickstarter.com"][src*="video.html"]', "object", "embed" ];
            if (settings.customSelector) {
                selectors.push(settings.customSelector);
            }
            var ignoreList = ".fitvidsignore";
            if (settings.ignore) {
                ignoreList = ignoreList + ", " + settings.ignore;
            }
            var $allVideos = $(this).find(selectors.join(","));
            $allVideos = $allVideos.not("object object");
            // SwfObj conflict patch
            $allVideos = $allVideos.not(ignoreList);
            // Disable FitVids on this video.
            $allVideos.each(function() {
                var $this = $(this);
                if ($this.parents(ignoreList).length > 0) {
                    return;
                }
                if (this.tagName.toLowerCase() === "embed" && $this.parent("object").length || $this.parent(".fluid-width-video-wrapper").length) {
                    return;
                }
                if (!$this.css("height") && !$this.css("width") && (isNaN($this.attr("height")) || isNaN($this.attr("width")))) {
                    $this.attr("height", 9);
                    $this.attr("width", 16);
                }
                var height = this.tagName.toLowerCase() === "object" || $this.attr("height") && !isNaN(parseInt($this.attr("height"), 10)) ? parseInt($this.attr("height"), 10) : $this.height(), width = !isNaN(parseInt($this.attr("width"), 10)) ? parseInt($this.attr("width"), 10) : $this.width(), aspectRatio = height / width;
                if (!$this.attr("name")) {
                    var videoName = "fitvid" + $.fn.fitVids._count;
                    $this.attr("name", videoName);
                    $.fn.fitVids._count++;
                }
                $this.wrap('<div class="fluid-width-video-wrapper"></div>').parent(".fluid-width-video-wrapper").css("padding-top", aspectRatio * 100 + "%");
                $this.removeAttr("height").removeAttr("width");
            });
        });
    };
    // Internal counter for unique video names.
    $.fn.fitVids._count = 0;
})(window.jQuery || window.Zepto);
(function(window, undefined) {
    "use strict";
    /**
	 * Handles managing all events for whatever you plug it into. Priorities for hooks are based on lowest to highest in
	 * that, lowest priority hooks are fired first.
	 */
    var EventManager = function() {
        var slice = Array.prototype.slice;
        /**
		 * Maintain a reference to the object scope so our public methods never get confusing.
		 */
        var MethodsAvailable = {
            removeFilter: removeFilter,
            applyFilters: applyFilters,
            addFilter: addFilter,
            removeAction: removeAction,
            doAction: doAction,
            addAction: addAction
        };
        /**
		 * Contains the hooks that get registered with this EventManager. The array for storage utilizes a "flat"
		 * object literal such that looking up the hook utilizes the native object literal hash.
		 */
        var STORAGE = {
            actions: {},
            filters: {}
        };
        /**
		 * Adds an action to the event manager.
		 *
		 * @param action Must contain namespace.identifier
		 * @param callback Must be a valid callback function before this action is added
		 * @param [priority=10] Used to control when the function is executed in relation to other callbacks bound to the same hook
		 * @param [context] Supply a value to be used for this
		 */
        function addAction(action, callback, priority, context) {
            if (typeof action === "string" && typeof callback === "function") {
                priority = parseInt(priority || 10, 10);
                _addHook("actions", action, callback, priority, context);
            }
            return MethodsAvailable;
        }
        /**
		 * Performs an action if it exists. You can pass as many arguments as you want to this function; the only rule is
		 * that the first argument must always be the action.
		 */
        function doAction() {
            var args = slice.call(arguments);
            var action = args.shift();
            if (typeof action === "string") {
                _runHook("actions", action, args);
            }
            return MethodsAvailable;
        }
        /**
		 * Removes the specified action if it contains a namespace.identifier & exists.
		 *
		 * @param action The action to remove
		 * @param [callback] Callback function to remove
		 */
        function removeAction(action, callback) {
            if (typeof action === "string") {
                _removeHook("actions", action, callback);
            }
            return MethodsAvailable;
        }
        /**
		 * Adds a filter to the event manager.
		 *
		 * @param filter Must contain namespace.identifier
		 * @param callback Must be a valid callback function before this action is added
		 * @param [priority=10] Used to control when the function is executed in relation to other callbacks bound to the same hook
		 * @param [context] Supply a value to be used for this
		 */
        function addFilter(filter, callback, priority, context) {
            if (typeof filter === "string" && typeof callback === "function") {
                priority = parseInt(priority || 10, 10);
                _addHook("filters", filter, callback, priority, context);
            }
            return MethodsAvailable;
        }
        /**
		 * Performs a filter if it exists. You should only ever pass 1 argument to be filtered. The only rule is that
		 * the first argument must always be the filter.
		 */
        function applyFilters() {
            var args = slice.call(arguments);
            var filter = args.shift();
            if (typeof filter === "string") {
                return _runHook("filters", filter, args);
            }
            return MethodsAvailable;
        }
        /**
		 * Removes the specified filter if it contains a namespace.identifier & exists.
		 *
		 * @param filter The action to remove
		 * @param [callback] Callback function to remove
		 */
        function removeFilter(filter, callback) {
            if (typeof filter === "string") {
                _removeHook("filters", filter, callback);
            }
            return MethodsAvailable;
        }
        /**
		 * Removes the specified hook by resetting the value of it.
		 *
		 * @param type Type of hook, either 'actions' or 'filters'
		 * @param hook The hook (namespace.identifier) to remove
		 * @private
		 */
        function _removeHook(type, hook, callback, context) {
            var handlers, handler, i;
            if (!STORAGE[type][hook]) {
                return;
            }
            if (!callback) {
                STORAGE[type][hook] = [];
            } else {
                handlers = STORAGE[type][hook];
                if (!context) {
                    for (i = handlers.length; i--; ) {
                        if (handlers[i].callback === callback) {
                            handlers.splice(i, 1);
                        }
                    }
                } else {
                    for (i = handlers.length; i--; ) {
                        handler = handlers[i];
                        if (handler.callback === callback && handler.context === context) {
                            handlers.splice(i, 1);
                        }
                    }
                }
            }
        }
        /**
		 * Adds the hook to the appropriate storage container
		 *
		 * @param type 'actions' or 'filters'
		 * @param hook The hook (namespace.identifier) to add to our event manager
		 * @param callback The function that will be called when the hook is executed.
		 * @param priority The priority of this hook. Must be an integer.
		 * @param [context] A value to be used for this
		 * @private
		 */
        function _addHook(type, hook, callback, priority, context) {
            var hookObject = {
                callback: callback,
                priority: priority,
                context: context
            };
            // Utilize 'prop itself' : http://jsperf.com/hasownproperty-vs-in-vs-undefined/19
            var hooks = STORAGE[type][hook];
            if (hooks) {
                hooks.push(hookObject);
                hooks = _hookInsertSort(hooks);
            } else {
                hooks = [ hookObject ];
            }
            STORAGE[type][hook] = hooks;
        }
        /**
		 * Use an insert sort for keeping our hooks organized based on priority. This function is ridiculously faster
		 * than bubble sort, etc: http://jsperf.com/javascript-sort
		 *
		 * @param hooks The custom array containing all of the appropriate hooks to perform an insert sort on.
		 * @private
		 */
        function _hookInsertSort(hooks) {
            var tmpHook, j, prevHook;
            for (var i = 1, len = hooks.length; i < len; i++) {
                tmpHook = hooks[i];
                j = i;
                while ((prevHook = hooks[j - 1]) && prevHook.priority > tmpHook.priority) {
                    hooks[j] = hooks[j - 1];
                    --j;
                }
                hooks[j] = tmpHook;
            }
            return hooks;
        }
        /**
		 * Runs the specified hook. If it is an action, the value is not modified but if it is a filter, it is.
		 *
		 * @param type 'actions' or 'filters'
		 * @param hook The hook ( namespace.identifier ) to be ran.
		 * @param args Arguments to pass to the action/filter. If it's a filter, args is actually a single parameter.
		 * @private
		 */
        function _runHook(type, hook, args) {
            var handlers = STORAGE[type][hook], i, len;
            if (!handlers) {
                return type === "filters" ? args[0] : false;
            }
            len = handlers.length;
            if (type === "filters") {
                for (i = 0; i < len; i++) {
                    args[0] = handlers[i].callback.apply(handlers[i].context, args);
                }
            } else {
                for (i = 0; i < len; i++) {
                    handlers[i].callback.apply(handlers[i].context, args);
                }
            }
            return type === "filters" ? args[0] : true;
        }
        // return all of the publicly available methods
        return MethodsAvailable;
    };
    window.wp = window.wp || {};
    window.wp.hooks = window.wp.hooks || new EventManager();
})(window);
/*!
 * imagesLoaded PACKAGED v4.1.1
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */
/**
 * EvEmitter v1.0.3
 * Lil' event emitter
 * MIT License
 */
/* jshint unused: true, undef: true, strict: true */
(function(global, factory) {
    // universal module definition
    /* jshint strict: false */
    /* globals define, module, window */
    if (typeof define == "function" && define.amd) {
        // AMD - RequireJS
        define("ev-emitter/ev-emitter", factory);
    } else if (typeof module == "object" && module.exports) {
        // CommonJS - Browserify, Webpack
        module.exports = factory();
    } else {
        // Browser globals
        global.EvEmitter = factory();
    }
})(typeof window != "undefined" ? window : this, function() {
    function EvEmitter() {}
    var proto = EvEmitter.prototype;
    proto.on = function(eventName, listener) {
        if (!eventName || !listener) {
            return;
        }
        // set events hash
        var events = this._events = this._events || {};
        // set listeners array
        var listeners = events[eventName] = events[eventName] || [];
        // only add once
        if (listeners.indexOf(listener) == -1) {
            listeners.push(listener);
        }
        return this;
    };
    proto.once = function(eventName, listener) {
        if (!eventName || !listener) {
            return;
        }
        // add event
        this.on(eventName, listener);
        // set once flag
        // set onceEvents hash
        var onceEvents = this._onceEvents = this._onceEvents || {};
        // set onceListeners object
        var onceListeners = onceEvents[eventName] = onceEvents[eventName] || {};
        // set flag
        onceListeners[listener] = true;
        return this;
    };
    proto.off = function(eventName, listener) {
        var listeners = this._events && this._events[eventName];
        if (!listeners || !listeners.length) {
            return;
        }
        var index = listeners.indexOf(listener);
        if (index != -1) {
            listeners.splice(index, 1);
        }
        return this;
    };
    proto.emitEvent = function(eventName, args) {
        var listeners = this._events && this._events[eventName];
        if (!listeners || !listeners.length) {
            return;
        }
        var i = 0;
        var listener = listeners[i];
        args = args || [];
        // once stuff
        var onceListeners = this._onceEvents && this._onceEvents[eventName];
        while (listener) {
            var isOnce = onceListeners && onceListeners[listener];
            if (isOnce) {
                // remove listener
                // remove before trigger to prevent recursion
                this.off(eventName, listener);
                // unset once flag
                delete onceListeners[listener];
            }
            // trigger listener
            listener.apply(this, args);
            // get next listener
            i += isOnce ? 0 : 1;
            listener = listeners[i];
        }
        return this;
    };
    return EvEmitter;
});

/*!
 * imagesLoaded v4.1.1
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */
(function(window, factory) {
    "use strict";
    // universal module definition
    /*global define: false, module: false, require: false */
    if (typeof define == "function" && define.amd) {
        // AMD
        define([ "ev-emitter/ev-emitter" ], function(EvEmitter) {
            return factory(window, EvEmitter);
        });
    } else if (typeof module == "object" && module.exports) {
        // CommonJS
        module.exports = factory(window, require("ev-emitter"));
    } else {
        // browser global
        window.imagesLoaded = factory(window, window.EvEmitter);
    }
})(window, // --------------------------  factory -------------------------- //
function factory(window, EvEmitter) {
    var $ = window.jQuery;
    var console = window.console;
    // -------------------------- helpers -------------------------- //
    // extend objects
    function extend(a, b) {
        for (var prop in b) {
            a[prop] = b[prop];
        }
        return a;
    }
    // turn element or nodeList into an array
    function makeArray(obj) {
        var ary = [];
        if (Array.isArray(obj)) {
            // use object if already an array
            ary = obj;
        } else if (typeof obj.length == "number") {
            // convert nodeList to array
            for (var i = 0; i < obj.length; i++) {
                ary.push(obj[i]);
            }
        } else {
            // array of single index
            ary.push(obj);
        }
        return ary;
    }
    // -------------------------- imagesLoaded -------------------------- //
    /**
 * @param {Array, Element, NodeList, String} elem
 * @param {Object or Function} options - if function, use as callback
 * @param {Function} onAlways - callback function
 */
    function ImagesLoaded(elem, options, onAlways) {
        // coerce ImagesLoaded() without new, to be new ImagesLoaded()
        if (!(this instanceof ImagesLoaded)) {
            return new ImagesLoaded(elem, options, onAlways);
        }
        // use elem as selector string
        if (typeof elem == "string") {
            elem = document.querySelectorAll(elem);
        }
        this.elements = makeArray(elem);
        this.options = extend({}, this.options);
        if (typeof options == "function") {
            onAlways = options;
        } else {
            extend(this.options, options);
        }
        if (onAlways) {
            this.on("always", onAlways);
        }
        this.getImages();
        if ($) {
            // add jQuery Deferred object
            this.jqDeferred = new $.Deferred();
        }
        // HACK check async to allow time to bind listeners
        setTimeout(function() {
            this.check();
        }.bind(this));
    }
    ImagesLoaded.prototype = Object.create(EvEmitter.prototype);
    ImagesLoaded.prototype.options = {};
    ImagesLoaded.prototype.getImages = function() {
        this.images = [];
        // filter & find items if we have an item selector
        this.elements.forEach(this.addElementImages, this);
    };
    /**
 * @param {Node} element
 */
    ImagesLoaded.prototype.addElementImages = function(elem) {
        // filter siblings
        if (elem.nodeName == "IMG") {
            this.addImage(elem);
        }
        // get background image on element
        if (this.options.background === true) {
            this.addElementBackgroundImages(elem);
        }
        // find children
        // no non-element nodes, #143
        var nodeType = elem.nodeType;
        if (!nodeType || !elementNodeTypes[nodeType]) {
            return;
        }
        var childImgs = elem.querySelectorAll("img");
        // concat childElems to filterFound array
        for (var i = 0; i < childImgs.length; i++) {
            var img = childImgs[i];
            this.addImage(img);
        }
        // get child background images
        if (typeof this.options.background == "string") {
            var children = elem.querySelectorAll(this.options.background);
            for (i = 0; i < children.length; i++) {
                var child = children[i];
                this.addElementBackgroundImages(child);
            }
        }
    };
    var elementNodeTypes = {
        1: true,
        9: true,
        11: true
    };
    ImagesLoaded.prototype.addElementBackgroundImages = function(elem) {
        var style = getComputedStyle(elem);
        if (!style) {
            // Firefox returns null if in a hidden iframe https://bugzil.la/548397
            return;
        }
        // get url inside url("...")
        var reURL = /url\((['"])?(.*?)\1\)/gi;
        var matches = reURL.exec(style.backgroundImage);
        while (matches !== null) {
            var url = matches && matches[2];
            if (url) {
                this.addBackground(url, elem);
            }
            matches = reURL.exec(style.backgroundImage);
        }
    };
    /**
 * @param {Image} img
 */
    ImagesLoaded.prototype.addImage = function(img) {
        var loadingImage = new LoadingImage(img);
        this.images.push(loadingImage);
    };
    ImagesLoaded.prototype.addBackground = function(url, elem) {
        var background = new Background(url, elem);
        this.images.push(background);
    };
    ImagesLoaded.prototype.check = function() {
        var _this = this;
        this.progressedCount = 0;
        this.hasAnyBroken = false;
        // complete if no images
        if (!this.images.length) {
            this.complete();
            return;
        }
        function onProgress(image, elem, message) {
            // HACK - Chrome triggers event before object properties have changed. #83
            setTimeout(function() {
                _this.progress(image, elem, message);
            });
        }
        this.images.forEach(function(loadingImage) {
            loadingImage.once("progress", onProgress);
            loadingImage.check();
        });
    };
    ImagesLoaded.prototype.progress = function(image, elem, message) {
        this.progressedCount++;
        this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;
        // progress event
        this.emitEvent("progress", [ this, image, elem ]);
        if (this.jqDeferred && this.jqDeferred.notify) {
            this.jqDeferred.notify(this, image);
        }
        // check if completed
        if (this.progressedCount == this.images.length) {
            this.complete();
        }
        if (this.options.debug && console) {
            console.log("progress: " + message, image, elem);
        }
    };
    ImagesLoaded.prototype.complete = function() {
        var eventName = this.hasAnyBroken ? "fail" : "done";
        this.isComplete = true;
        this.emitEvent(eventName, [ this ]);
        this.emitEvent("always", [ this ]);
        if (this.jqDeferred) {
            var jqMethod = this.hasAnyBroken ? "reject" : "resolve";
            this.jqDeferred[jqMethod](this);
        }
    };
    // --------------------------  -------------------------- //
    function LoadingImage(img) {
        this.img = img;
    }
    LoadingImage.prototype = Object.create(EvEmitter.prototype);
    LoadingImage.prototype.check = function() {
        // If complete is true and browser supports natural sizes,
        // try to check for image status manually.
        var isComplete = this.getIsImageComplete();
        if (isComplete) {
            // report based on naturalWidth
            this.confirm(this.img.naturalWidth !== 0, "naturalWidth");
            return;
        }
        // If none of the checks above matched, simulate loading on detached element.
        this.proxyImage = new Image();
        this.proxyImage.addEventListener("load", this);
        this.proxyImage.addEventListener("error", this);
        // bind to image as well for Firefox. #191
        this.img.addEventListener("load", this);
        this.img.addEventListener("error", this);
        this.proxyImage.src = this.img.src;
    };
    LoadingImage.prototype.getIsImageComplete = function() {
        return this.img.complete && this.img.naturalWidth !== undefined;
    };
    LoadingImage.prototype.confirm = function(isLoaded, message) {
        this.isLoaded = isLoaded;
        this.emitEvent("progress", [ this, this.img, message ]);
    };
    // ----- events ----- //
    // trigger specified handler for event type
    LoadingImage.prototype.handleEvent = function(event) {
        var method = "on" + event.type;
        if (this[method]) {
            this[method](event);
        }
    };
    LoadingImage.prototype.onload = function() {
        this.confirm(true, "onload");
        this.unbindEvents();
    };
    LoadingImage.prototype.onerror = function() {
        this.confirm(false, "onerror");
        this.unbindEvents();
    };
    LoadingImage.prototype.unbindEvents = function() {
        this.proxyImage.removeEventListener("load", this);
        this.proxyImage.removeEventListener("error", this);
        this.img.removeEventListener("load", this);
        this.img.removeEventListener("error", this);
    };
    // -------------------------- Background -------------------------- //
    function Background(url, element) {
        this.url = url;
        this.element = element;
        this.img = new Image();
    }
    // inherit LoadingImage prototype
    Background.prototype = Object.create(LoadingImage.prototype);
    Background.prototype.check = function() {
        this.img.addEventListener("load", this);
        this.img.addEventListener("error", this);
        this.img.src = this.url;
        // check if image is already complete
        var isComplete = this.getIsImageComplete();
        if (isComplete) {
            this.confirm(this.img.naturalWidth !== 0, "naturalWidth");
            this.unbindEvents();
        }
    };
    Background.prototype.unbindEvents = function() {
        this.img.removeEventListener("load", this);
        this.img.removeEventListener("error", this);
    };
    Background.prototype.confirm = function(isLoaded, message) {
        this.isLoaded = isLoaded;
        this.emitEvent("progress", [ this, this.element, message ]);
    };
    // -------------------------- jQuery -------------------------- //
    ImagesLoaded.makeJQueryPlugin = function(jQuery) {
        jQuery = jQuery || window.jQuery;
        if (!jQuery) {
            return;
        }
        // set local variable
        $ = jQuery;
        // $().imagesLoaded()
        $.fn.imagesLoaded = function(options, callback) {
            var instance = new ImagesLoaded(this, options, callback);
            return instance.jqDeferred.promise($(this));
        };
    };
    // try making plugin
    ImagesLoaded.makeJQueryPlugin();
    // --------------------------  -------------------------- //
    return ImagesLoaded;
});
/*!
 * Masonry PACKAGED v4.1.1
 * Cascading grid layout library
 * http://masonry.desandro.com
 * MIT License
 * by David DeSandro
 */
/**
 * Bridget makes jQuery widgets
 * v2.0.1
 * MIT license
 */
/* jshint browser: true, strict: true, undef: true, unused: true */
(function(window, factory) {
    // universal module definition
    /*jshint strict: false */
    /* globals define, module, require */
    if (typeof define == "function" && define.amd) {
        // AMD
        define("jquery-bridget/jquery-bridget", [ "jquery" ], function(jQuery) {
            return factory(window, jQuery);
        });
    } else if (typeof module == "object" && module.exports) {
        // CommonJS
        module.exports = factory(window, require("jquery"));
    } else {
        // browser global
        window.jQueryBridget = factory(window, window.jQuery);
    }
})(window, function factory(window, jQuery) {
    "use strict";
    // ----- utils ----- //
    var arraySlice = Array.prototype.slice;
    // helper function for logging errors
    // $.error breaks jQuery chaining
    var console = window.console;
    var logError = typeof console == "undefined" ? function() {} : function(message) {
        console.error(message);
    };
    // ----- jQueryBridget ----- //
    function jQueryBridget(namespace, PluginClass, $) {
        $ = $ || jQuery || window.jQuery;
        if (!$) {
            return;
        }
        // add option method -> $().plugin('option', {...})
        if (!PluginClass.prototype.option) {
            // option setter
            PluginClass.prototype.option = function(opts) {
                // bail out if not an object
                if (!$.isPlainObject(opts)) {
                    return;
                }
                this.options = $.extend(true, this.options, opts);
            };
        }
        // make jQuery plugin
        $.fn[namespace] = function(arg0) {
            if (typeof arg0 == "string") {
                // method call $().plugin( 'methodName', { options } )
                // shift arguments by 1
                var args = arraySlice.call(arguments, 1);
                return methodCall(this, arg0, args);
            }
            // just $().plugin({ options })
            plainCall(this, arg0);
            return this;
        };
        // $().plugin('methodName')
        function methodCall($elems, methodName, args) {
            var returnValue;
            var pluginMethodStr = "$()." + namespace + '("' + methodName + '")';
            $elems.each(function(i, elem) {
                // get instance
                var instance = $.data(elem, namespace);
                if (!instance) {
                    logError(namespace + " not initialized. Cannot call methods, i.e. " + pluginMethodStr);
                    return;
                }
                var method = instance[methodName];
                if (!method || methodName.charAt(0) == "_") {
                    logError(pluginMethodStr + " is not a valid method");
                    return;
                }
                // apply method, get return value
                var value = method.apply(instance, args);
                // set return value if value is returned, use only first value
                returnValue = returnValue === undefined ? value : returnValue;
            });
            return returnValue !== undefined ? returnValue : $elems;
        }
        function plainCall($elems, options) {
            $elems.each(function(i, elem) {
                var instance = $.data(elem, namespace);
                if (instance) {
                    // set options & init
                    instance.option(options);
                    instance._init();
                } else {
                    // initialize new instance
                    instance = new PluginClass(elem, options);
                    $.data(elem, namespace, instance);
                }
            });
        }
        updateJQuery($);
    }
    // ----- updateJQuery ----- //
    // set $.bridget for v1 backwards compatibility
    function updateJQuery($) {
        if (!$ || $ && $.bridget) {
            return;
        }
        $.bridget = jQueryBridget;
    }
    updateJQuery(jQuery || window.jQuery);
    // -----  ----- //
    return jQueryBridget;
});

/**
 * EvEmitter v1.0.3
 * Lil' event emitter
 * MIT License
 */
/* jshint unused: true, undef: true, strict: true */
(function(global, factory) {
    // universal module definition
    /* jshint strict: false */
    /* globals define, module, window */
    if (typeof define == "function" && define.amd) {
        // AMD - RequireJS
        define("ev-emitter/ev-emitter", factory);
    } else if (typeof module == "object" && module.exports) {
        // CommonJS - Browserify, Webpack
        module.exports = factory();
    } else {
        // Browser globals
        global.EvEmitter = factory();
    }
})(typeof window != "undefined" ? window : this, function() {
    function EvEmitter() {}
    var proto = EvEmitter.prototype;
    proto.on = function(eventName, listener) {
        if (!eventName || !listener) {
            return;
        }
        // set events hash
        var events = this._events = this._events || {};
        // set listeners array
        var listeners = events[eventName] = events[eventName] || [];
        // only add once
        if (listeners.indexOf(listener) == -1) {
            listeners.push(listener);
        }
        return this;
    };
    proto.once = function(eventName, listener) {
        if (!eventName || !listener) {
            return;
        }
        // add event
        this.on(eventName, listener);
        // set once flag
        // set onceEvents hash
        var onceEvents = this._onceEvents = this._onceEvents || {};
        // set onceListeners object
        var onceListeners = onceEvents[eventName] = onceEvents[eventName] || {};
        // set flag
        onceListeners[listener] = true;
        return this;
    };
    proto.off = function(eventName, listener) {
        var listeners = this._events && this._events[eventName];
        if (!listeners || !listeners.length) {
            return;
        }
        var index = listeners.indexOf(listener);
        if (index != -1) {
            listeners.splice(index, 1);
        }
        return this;
    };
    proto.emitEvent = function(eventName, args) {
        var listeners = this._events && this._events[eventName];
        if (!listeners || !listeners.length) {
            return;
        }
        var i = 0;
        var listener = listeners[i];
        args = args || [];
        // once stuff
        var onceListeners = this._onceEvents && this._onceEvents[eventName];
        while (listener) {
            var isOnce = onceListeners && onceListeners[listener];
            if (isOnce) {
                // remove listener
                // remove before trigger to prevent recursion
                this.off(eventName, listener);
                // unset once flag
                delete onceListeners[listener];
            }
            // trigger listener
            listener.apply(this, args);
            // get next listener
            i += isOnce ? 0 : 1;
            listener = listeners[i];
        }
        return this;
    };
    return EvEmitter;
});

/*!
 * getSize v2.0.2
 * measure size of elements
 * MIT license
 */
/*jshint browser: true, strict: true, undef: true, unused: true */
/*global define: false, module: false, console: false */
(function(window, factory) {
    "use strict";
    if (typeof define == "function" && define.amd) {
        // AMD
        define("get-size/get-size", [], function() {
            return factory();
        });
    } else if (typeof module == "object" && module.exports) {
        // CommonJS
        module.exports = factory();
    } else {
        // browser global
        window.getSize = factory();
    }
})(window, function factory() {
    "use strict";
    // -------------------------- helpers -------------------------- //
    // get a number from a string, not a percentage
    function getStyleSize(value) {
        var num = parseFloat(value);
        // not a percent like '100%', and a number
        var isValid = value.indexOf("%") == -1 && !isNaN(num);
        return isValid && num;
    }
    function noop() {}
    var logError = typeof console == "undefined" ? noop : function(message) {
        console.error(message);
    };
    // -------------------------- measurements -------------------------- //
    var measurements = [ "paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "marginLeft", "marginRight", "marginTop", "marginBottom", "borderLeftWidth", "borderRightWidth", "borderTopWidth", "borderBottomWidth" ];
    var measurementsLength = measurements.length;
    function getZeroSize() {
        var size = {
            width: 0,
            height: 0,
            innerWidth: 0,
            innerHeight: 0,
            outerWidth: 0,
            outerHeight: 0
        };
        for (var i = 0; i < measurementsLength; i++) {
            var measurement = measurements[i];
            size[measurement] = 0;
        }
        return size;
    }
    // -------------------------- getStyle -------------------------- //
    /**
 * getStyle, get style of element, check for Firefox bug
 * https://bugzilla.mozilla.org/show_bug.cgi?id=548397
 */
    function getStyle(elem) {
        var style = getComputedStyle(elem);
        if (!style) {
            logError("Style returned " + style + ". Are you running this code in a hidden iframe on Firefox? " + "See http://bit.ly/getsizebug1");
        }
        return style;
    }
    // -------------------------- setup -------------------------- //
    var isSetup = false;
    var isBoxSizeOuter;
    /**
 * setup
 * check isBoxSizerOuter
 * do on first getSize() rather than on page load for Firefox bug
 */
    function setup() {
        // setup once
        if (isSetup) {
            return;
        }
        isSetup = true;
        // -------------------------- box sizing -------------------------- //
        /**
   * WebKit measures the outer-width on style.width on border-box elems
   * IE & Firefox<29 measures the inner-width
   */
        var div = document.createElement("div");
        div.style.width = "200px";
        div.style.padding = "1px 2px 3px 4px";
        div.style.borderStyle = "solid";
        div.style.borderWidth = "1px 2px 3px 4px";
        div.style.boxSizing = "border-box";
        var body = document.body || document.documentElement;
        body.appendChild(div);
        var style = getStyle(div);
        getSize.isBoxSizeOuter = isBoxSizeOuter = getStyleSize(style.width) == 200;
        body.removeChild(div);
    }
    // -------------------------- getSize -------------------------- //
    function getSize(elem) {
        setup();
        // use querySeletor if elem is string
        if (typeof elem == "string") {
            elem = document.querySelector(elem);
        }
        // do not proceed on non-objects
        if (!elem || typeof elem != "object" || !elem.nodeType) {
            return;
        }
        var style = getStyle(elem);
        // if hidden, everything is 0
        if (style.display == "none") {
            return getZeroSize();
        }
        var size = {};
        size.width = elem.offsetWidth;
        size.height = elem.offsetHeight;
        var isBorderBox = size.isBorderBox = style.boxSizing == "border-box";
        // get all measurements
        for (var i = 0; i < measurementsLength; i++) {
            var measurement = measurements[i];
            var value = style[measurement];
            var num = parseFloat(value);
            // any 'auto', 'medium' value will be 0
            size[measurement] = !isNaN(num) ? num : 0;
        }
        var paddingWidth = size.paddingLeft + size.paddingRight;
        var paddingHeight = size.paddingTop + size.paddingBottom;
        var marginWidth = size.marginLeft + size.marginRight;
        var marginHeight = size.marginTop + size.marginBottom;
        var borderWidth = size.borderLeftWidth + size.borderRightWidth;
        var borderHeight = size.borderTopWidth + size.borderBottomWidth;
        var isBorderBoxSizeOuter = isBorderBox && isBoxSizeOuter;
        // overwrite width and height if we can get it from style
        var styleWidth = getStyleSize(style.width);
        if (styleWidth !== false) {
            size.width = styleWidth + (// add padding and border unless it's already including it
            isBorderBoxSizeOuter ? 0 : paddingWidth + borderWidth);
        }
        var styleHeight = getStyleSize(style.height);
        if (styleHeight !== false) {
            size.height = styleHeight + (// add padding and border unless it's already including it
            isBorderBoxSizeOuter ? 0 : paddingHeight + borderHeight);
        }
        size.innerWidth = size.width - (paddingWidth + borderWidth);
        size.innerHeight = size.height - (paddingHeight + borderHeight);
        size.outerWidth = size.width + marginWidth;
        size.outerHeight = size.height + marginHeight;
        return size;
    }
    return getSize;
});

/**
 * matchesSelector v2.0.1
 * matchesSelector( element, '.selector' )
 * MIT license
 */
/*jshint browser: true, strict: true, undef: true, unused: true */
(function(window, factory) {
    /*global define: false, module: false */
    "use strict";
    // universal module definition
    if (typeof define == "function" && define.amd) {
        // AMD
        define("desandro-matches-selector/matches-selector", factory);
    } else if (typeof module == "object" && module.exports) {
        // CommonJS
        module.exports = factory();
    } else {
        // browser global
        window.matchesSelector = factory();
    }
})(window, function factory() {
    "use strict";
    var matchesMethod = function() {
        var ElemProto = Element.prototype;
        // check for the standard method name first
        if (ElemProto.matches) {
            return "matches";
        }
        // check un-prefixed
        if (ElemProto.matchesSelector) {
            return "matchesSelector";
        }
        // check vendor prefixes
        var prefixes = [ "webkit", "moz", "ms", "o" ];
        for (var i = 0; i < prefixes.length; i++) {
            var prefix = prefixes[i];
            var method = prefix + "MatchesSelector";
            if (ElemProto[method]) {
                return method;
            }
        }
    }();
    return function matchesSelector(elem, selector) {
        return elem[matchesMethod](selector);
    };
});

/**
 * Fizzy UI utils v2.0.2
 * MIT license
 */
/*jshint browser: true, undef: true, unused: true, strict: true */
(function(window, factory) {
    // universal module definition
    /*jshint strict: false */
    /*globals define, module, require */
    if (typeof define == "function" && define.amd) {
        // AMD
        define("fizzy-ui-utils/utils", [ "desandro-matches-selector/matches-selector" ], function(matchesSelector) {
            return factory(window, matchesSelector);
        });
    } else if (typeof module == "object" && module.exports) {
        // CommonJS
        module.exports = factory(window, require("desandro-matches-selector"));
    } else {
        // browser global
        window.fizzyUIUtils = factory(window, window.matchesSelector);
    }
})(window, function factory(window, matchesSelector) {
    var utils = {};
    // ----- extend ----- //
    // extends objects
    utils.extend = function(a, b) {
        for (var prop in b) {
            a[prop] = b[prop];
        }
        return a;
    };
    // ----- modulo ----- //
    utils.modulo = function(num, div) {
        return (num % div + div) % div;
    };
    // ----- makeArray ----- //
    // turn element or nodeList into an array
    utils.makeArray = function(obj) {
        var ary = [];
        if (Array.isArray(obj)) {
            // use object if already an array
            ary = obj;
        } else if (obj && typeof obj.length == "number") {
            // convert nodeList to array
            for (var i = 0; i < obj.length; i++) {
                ary.push(obj[i]);
            }
        } else {
            // array of single index
            ary.push(obj);
        }
        return ary;
    };
    // ----- removeFrom ----- //
    utils.removeFrom = function(ary, obj) {
        var index = ary.indexOf(obj);
        if (index != -1) {
            ary.splice(index, 1);
        }
    };
    // ----- getParent ----- //
    utils.getParent = function(elem, selector) {
        while (elem != document.body) {
            elem = elem.parentNode;
            if (matchesSelector(elem, selector)) {
                return elem;
            }
        }
    };
    // ----- getQueryElement ----- //
    // use element as selector string
    utils.getQueryElement = function(elem) {
        if (typeof elem == "string") {
            return document.querySelector(elem);
        }
        return elem;
    };
    // ----- handleEvent ----- //
    // enable .ontype to trigger from .addEventListener( elem, 'type' )
    utils.handleEvent = function(event) {
        var method = "on" + event.type;
        if (this[method]) {
            this[method](event);
        }
    };
    // ----- filterFindElements ----- //
    utils.filterFindElements = function(elems, selector) {
        // make array of elems
        elems = utils.makeArray(elems);
        var ffElems = [];
        elems.forEach(function(elem) {
            // check that elem is an actual element
            if (!(elem instanceof HTMLElement)) {
                return;
            }
            // add elem if no selector
            if (!selector) {
                ffElems.push(elem);
                return;
            }
            // filter & find items if we have a selector
            // filter
            if (matchesSelector(elem, selector)) {
                ffElems.push(elem);
            }
            // find children
            var childElems = elem.querySelectorAll(selector);
            // concat childElems to filterFound array
            for (var i = 0; i < childElems.length; i++) {
                ffElems.push(childElems[i]);
            }
        });
        return ffElems;
    };
    // ----- debounceMethod ----- //
    utils.debounceMethod = function(_class, methodName, threshold) {
        // original method
        var method = _class.prototype[methodName];
        var timeoutName = methodName + "Timeout";
        _class.prototype[methodName] = function() {
            var timeout = this[timeoutName];
            if (timeout) {
                clearTimeout(timeout);
            }
            var args = arguments;
            var _this = this;
            this[timeoutName] = setTimeout(function() {
                method.apply(_this, args);
                delete _this[timeoutName];
            }, threshold || 100);
        };
    };
    // ----- docReady ----- //
    utils.docReady = function(callback) {
        var readyState = document.readyState;
        if (readyState == "complete" || readyState == "interactive") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    };
    // ----- htmlInit ----- //
    // http://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/
    utils.toDashed = function(str) {
        return str.replace(/(.)([A-Z])/g, function(match, $1, $2) {
            return $1 + "-" + $2;
        }).toLowerCase();
    };
    var console = window.console;
    /**
 * allow user to initialize classes via [data-namespace] or .js-namespace class
 * htmlInit( Widget, 'widgetName' )
 * options are parsed from data-namespace-options
 */
    utils.htmlInit = function(WidgetClass, namespace) {
        utils.docReady(function() {
            var dashedNamespace = utils.toDashed(namespace);
            var dataAttr = "data-" + dashedNamespace;
            var dataAttrElems = document.querySelectorAll("[" + dataAttr + "]");
            var jsDashElems = document.querySelectorAll(".js-" + dashedNamespace);
            var elems = utils.makeArray(dataAttrElems).concat(utils.makeArray(jsDashElems));
            var dataOptionsAttr = dataAttr + "-options";
            var jQuery = window.jQuery;
            elems.forEach(function(elem) {
                var attr = elem.getAttribute(dataAttr) || elem.getAttribute(dataOptionsAttr);
                var options;
                try {
                    options = attr && JSON.parse(attr);
                } catch (error) {
                    // log error, do not initialize
                    if (console) {
                        console.error("Error parsing " + dataAttr + " on " + elem.className + ": " + error);
                    }
                    return;
                }
                // initialize
                var instance = new WidgetClass(elem, options);
                // make available via $().data('layoutname')
                if (jQuery) {
                    jQuery.data(elem, namespace, instance);
                }
            });
        });
    };
    // -----  ----- //
    return utils;
});

/**
 * Outlayer Item
 */
(function(window, factory) {
    // universal module definition
    /* jshint strict: false */
    /* globals define, module, require */
    if (typeof define == "function" && define.amd) {
        // AMD - RequireJS
        define("outlayer/item", [ "ev-emitter/ev-emitter", "get-size/get-size" ], factory);
    } else if (typeof module == "object" && module.exports) {
        // CommonJS - Browserify, Webpack
        module.exports = factory(require("ev-emitter"), require("get-size"));
    } else {
        // browser global
        window.Outlayer = {};
        window.Outlayer.Item = factory(window.EvEmitter, window.getSize);
    }
})(window, function factory(EvEmitter, getSize) {
    "use strict";
    // ----- helpers ----- //
    function isEmptyObj(obj) {
        for (var prop in obj) {
            return false;
        }
        prop = null;
        return true;
    }
    // -------------------------- CSS3 support -------------------------- //
    var docElemStyle = document.documentElement.style;
    var transitionProperty = typeof docElemStyle.transition == "string" ? "transition" : "WebkitTransition";
    var transformProperty = typeof docElemStyle.transform == "string" ? "transform" : "WebkitTransform";
    var transitionEndEvent = {
        WebkitTransition: "webkitTransitionEnd",
        transition: "transitionend"
    }[transitionProperty];
    // cache all vendor properties that could have vendor prefix
    var vendorProperties = {
        transform: transformProperty,
        transition: transitionProperty,
        transitionDuration: transitionProperty + "Duration",
        transitionProperty: transitionProperty + "Property",
        transitionDelay: transitionProperty + "Delay"
    };
    // -------------------------- Item -------------------------- //
    function Item(element, layout) {
        if (!element) {
            return;
        }
        this.element = element;
        // parent layout class, i.e. Masonry, Isotope, or Packery
        this.layout = layout;
        this.position = {
            x: 0,
            y: 0
        };
        this._create();
    }
    // inherit EvEmitter
    var proto = Item.prototype = Object.create(EvEmitter.prototype);
    proto.constructor = Item;
    proto._create = function() {
        // transition objects
        this._transn = {
            ingProperties: {},
            clean: {},
            onEnd: {}
        };
        this.css({
            position: "absolute"
        });
    };
    // trigger specified handler for event type
    proto.handleEvent = function(event) {
        var method = "on" + event.type;
        if (this[method]) {
            this[method](event);
        }
    };
    proto.getSize = function() {
        this.size = getSize(this.element);
    };
    /**
 * apply CSS styles to element
 * @param {Object} style
 */
    proto.css = function(style) {
        var elemStyle = this.element.style;
        for (var prop in style) {
            // use vendor property if available
            var supportedProp = vendorProperties[prop] || prop;
            elemStyle[supportedProp] = style[prop];
        }
    };
    // measure position, and sets it
    proto.getPosition = function() {
        var style = getComputedStyle(this.element);
        var isOriginLeft = this.layout._getOption("originLeft");
        var isOriginTop = this.layout._getOption("originTop");
        var xValue = style[isOriginLeft ? "left" : "right"];
        var yValue = style[isOriginTop ? "top" : "bottom"];
        // convert percent to pixels
        var layoutSize = this.layout.size;
        var x = xValue.indexOf("%") != -1 ? parseFloat(xValue) / 100 * layoutSize.width : parseInt(xValue, 10);
        var y = yValue.indexOf("%") != -1 ? parseFloat(yValue) / 100 * layoutSize.height : parseInt(yValue, 10);
        // clean up 'auto' or other non-integer values
        x = isNaN(x) ? 0 : x;
        y = isNaN(y) ? 0 : y;
        // remove padding from measurement
        x -= isOriginLeft ? layoutSize.paddingLeft : layoutSize.paddingRight;
        y -= isOriginTop ? layoutSize.paddingTop : layoutSize.paddingBottom;
        this.position.x = x;
        this.position.y = y;
    };
    // set settled position, apply padding
    proto.layoutPosition = function() {
        var layoutSize = this.layout.size;
        var style = {};
        var isOriginLeft = this.layout._getOption("originLeft");
        var isOriginTop = this.layout._getOption("originTop");
        // x
        var xPadding = isOriginLeft ? "paddingLeft" : "paddingRight";
        var xProperty = isOriginLeft ? "left" : "right";
        var xResetProperty = isOriginLeft ? "right" : "left";
        var x = this.position.x + layoutSize[xPadding];
        // set in percentage or pixels
        style[xProperty] = this.getXValue(x);
        // reset other property
        style[xResetProperty] = "";
        // y
        var yPadding = isOriginTop ? "paddingTop" : "paddingBottom";
        var yProperty = isOriginTop ? "top" : "bottom";
        var yResetProperty = isOriginTop ? "bottom" : "top";
        var y = this.position.y + layoutSize[yPadding];
        // set in percentage or pixels
        style[yProperty] = this.getYValue(y);
        // reset other property
        style[yResetProperty] = "";
        this.css(style);
        this.emitEvent("layout", [ this ]);
    };
    proto.getXValue = function(x) {
        var isHorizontal = this.layout._getOption("horizontal");
        return this.layout.options.percentPosition && !isHorizontal ? x / this.layout.size.width * 100 + "%" : x + "px";
    };
    proto.getYValue = function(y) {
        var isHorizontal = this.layout._getOption("horizontal");
        return this.layout.options.percentPosition && isHorizontal ? y / this.layout.size.height * 100 + "%" : y + "px";
    };
    proto._transitionTo = function(x, y) {
        this.getPosition();
        // get current x & y from top/left
        var curX = this.position.x;
        var curY = this.position.y;
        var compareX = parseInt(x, 10);
        var compareY = parseInt(y, 10);
        var didNotMove = compareX === this.position.x && compareY === this.position.y;
        // save end position
        this.setPosition(x, y);
        // if did not move and not transitioning, just go to layout
        if (didNotMove && !this.isTransitioning) {
            this.layoutPosition();
            return;
        }
        var transX = x - curX;
        var transY = y - curY;
        var transitionStyle = {};
        transitionStyle.transform = this.getTranslate(transX, transY);
        this.transition({
            to: transitionStyle,
            onTransitionEnd: {
                transform: this.layoutPosition
            },
            isCleaning: true
        });
    };
    proto.getTranslate = function(x, y) {
        // flip cooridinates if origin on right or bottom
        var isOriginLeft = this.layout._getOption("originLeft");
        var isOriginTop = this.layout._getOption("originTop");
        x = isOriginLeft ? x : -x;
        y = isOriginTop ? y : -y;
        return "translate3d(" + x + "px, " + y + "px, 0)";
    };
    // non transition + transform support
    proto.goTo = function(x, y) {
        this.setPosition(x, y);
        this.layoutPosition();
    };
    proto.moveTo = proto._transitionTo;
    proto.setPosition = function(x, y) {
        this.position.x = parseInt(x, 10);
        this.position.y = parseInt(y, 10);
    };
    // ----- transition ----- //
    /**
 * @param {Object} style - CSS
 * @param {Function} onTransitionEnd
 */
    // non transition, just trigger callback
    proto._nonTransition = function(args) {
        this.css(args.to);
        if (args.isCleaning) {
            this._removeStyles(args.to);
        }
        for (var prop in args.onTransitionEnd) {
            args.onTransitionEnd[prop].call(this);
        }
    };
    /**
 * proper transition
 * @param {Object} args - arguments
 *   @param {Object} to - style to transition to
 *   @param {Object} from - style to start transition from
 *   @param {Boolean} isCleaning - removes transition styles after transition
 *   @param {Function} onTransitionEnd - callback
 */
    proto.transition = function(args) {
        // redirect to nonTransition if no transition duration
        if (!parseFloat(this.layout.options.transitionDuration)) {
            this._nonTransition(args);
            return;
        }
        var _transition = this._transn;
        // keep track of onTransitionEnd callback by css property
        for (var prop in args.onTransitionEnd) {
            _transition.onEnd[prop] = args.onTransitionEnd[prop];
        }
        // keep track of properties that are transitioning
        for (prop in args.to) {
            _transition.ingProperties[prop] = true;
            // keep track of properties to clean up when transition is done
            if (args.isCleaning) {
                _transition.clean[prop] = true;
            }
        }
        // set from styles
        if (args.from) {
            this.css(args.from);
            // force redraw. http://blog.alexmaccaw.com/css-transitions
            var h = this.element.offsetHeight;
            // hack for JSHint to hush about unused var
            h = null;
        }
        // enable transition
        this.enableTransition(args.to);
        // set styles that are transitioning
        this.css(args.to);
        this.isTransitioning = true;
    };
    // dash before all cap letters, including first for
    // WebkitTransform => -webkit-transform
    function toDashedAll(str) {
        return str.replace(/([A-Z])/g, function($1) {
            return "-" + $1.toLowerCase();
        });
    }
    var transitionProps = "opacity," + toDashedAll(transformProperty);
    proto.enableTransition = function() {
        // HACK changing transitionProperty during a transition
        // will cause transition to jump
        if (this.isTransitioning) {
            return;
        }
        // make `transition: foo, bar, baz` from style object
        // HACK un-comment this when enableTransition can work
        // while a transition is happening
        // var transitionValues = [];
        // for ( var prop in style ) {
        //   // dash-ify camelCased properties like WebkitTransition
        //   prop = vendorProperties[ prop ] || prop;
        //   transitionValues.push( toDashedAll( prop ) );
        // }
        // munge number to millisecond, to match stagger
        var duration = this.layout.options.transitionDuration;
        duration = typeof duration == "number" ? duration + "ms" : duration;
        // enable transition styles
        this.css({
            transitionProperty: transitionProps,
            transitionDuration: duration,
            transitionDelay: this.staggerDelay || 0
        });
        // listen for transition end event
        this.element.addEventListener(transitionEndEvent, this, false);
    };
    // ----- events ----- //
    proto.onwebkitTransitionEnd = function(event) {
        this.ontransitionend(event);
    };
    proto.onotransitionend = function(event) {
        this.ontransitionend(event);
    };
    // properties that I munge to make my life easier
    var dashedVendorProperties = {
        "-webkit-transform": "transform"
    };
    proto.ontransitionend = function(event) {
        // disregard bubbled events from children
        if (event.target !== this.element) {
            return;
        }
        var _transition = this._transn;
        // get property name of transitioned property, convert to prefix-free
        var propertyName = dashedVendorProperties[event.propertyName] || event.propertyName;
        // remove property that has completed transitioning
        delete _transition.ingProperties[propertyName];
        // check if any properties are still transitioning
        if (isEmptyObj(_transition.ingProperties)) {
            // all properties have completed transitioning
            this.disableTransition();
        }
        // clean style
        if (propertyName in _transition.clean) {
            // clean up style
            this.element.style[event.propertyName] = "";
            delete _transition.clean[propertyName];
        }
        // trigger onTransitionEnd callback
        if (propertyName in _transition.onEnd) {
            var onTransitionEnd = _transition.onEnd[propertyName];
            onTransitionEnd.call(this);
            delete _transition.onEnd[propertyName];
        }
        this.emitEvent("transitionEnd", [ this ]);
    };
    proto.disableTransition = function() {
        this.removeTransitionStyles();
        this.element.removeEventListener(transitionEndEvent, this, false);
        this.isTransitioning = false;
    };
    /**
 * removes style property from element
 * @param {Object} style
**/
    proto._removeStyles = function(style) {
        // clean up transition styles
        var cleanStyle = {};
        for (var prop in style) {
            cleanStyle[prop] = "";
        }
        this.css(cleanStyle);
    };
    var cleanTransitionStyle = {
        transitionProperty: "",
        transitionDuration: "",
        transitionDelay: ""
    };
    proto.removeTransitionStyles = function() {
        // remove transition
        this.css(cleanTransitionStyle);
    };
    // ----- stagger ----- //
    proto.stagger = function(delay) {
        delay = isNaN(delay) ? 0 : delay;
        this.staggerDelay = delay + "ms";
    };
    // ----- show/hide/remove ----- //
    // remove element from DOM
    proto.removeElem = function() {
        this.element.parentNode.removeChild(this.element);
        // remove display: none
        this.css({
            display: ""
        });
        this.emitEvent("remove", [ this ]);
    };
    proto.remove = function() {
        // just remove element if no transition support or no transition
        if (!transitionProperty || !parseFloat(this.layout.options.transitionDuration)) {
            this.removeElem();
            return;
        }
        // start transition
        this.once("transitionEnd", function() {
            this.removeElem();
        });
        this.hide();
    };
    proto.reveal = function() {
        delete this.isHidden;
        // remove display: none
        this.css({
            display: ""
        });
        var options = this.layout.options;
        var onTransitionEnd = {};
        var transitionEndProperty = this.getHideRevealTransitionEndProperty("visibleStyle");
        onTransitionEnd[transitionEndProperty] = this.onRevealTransitionEnd;
        this.transition({
            from: options.hiddenStyle,
            to: options.visibleStyle,
            isCleaning: true,
            onTransitionEnd: onTransitionEnd
        });
    };
    proto.onRevealTransitionEnd = function() {
        // check if still visible
        // during transition, item may have been hidden
        if (!this.isHidden) {
            this.emitEvent("reveal");
        }
    };
    /**
 * get style property use for hide/reveal transition end
 * @param {String} styleProperty - hiddenStyle/visibleStyle
 * @returns {String}
 */
    proto.getHideRevealTransitionEndProperty = function(styleProperty) {
        var optionStyle = this.layout.options[styleProperty];
        // use opacity
        if (optionStyle.opacity) {
            return "opacity";
        }
        // get first property
        for (var prop in optionStyle) {
            return prop;
        }
    };
    proto.hide = function() {
        // set flag
        this.isHidden = true;
        // remove display: none
        this.css({
            display: ""
        });
        var options = this.layout.options;
        var onTransitionEnd = {};
        var transitionEndProperty = this.getHideRevealTransitionEndProperty("hiddenStyle");
        onTransitionEnd[transitionEndProperty] = this.onHideTransitionEnd;
        this.transition({
            from: options.visibleStyle,
            to: options.hiddenStyle,
            // keep hidden stuff hidden
            isCleaning: true,
            onTransitionEnd: onTransitionEnd
        });
    };
    proto.onHideTransitionEnd = function() {
        // check if still hidden
        // during transition, item may have been un-hidden
        if (this.isHidden) {
            this.css({
                display: "none"
            });
            this.emitEvent("hide");
        }
    };
    proto.destroy = function() {
        this.css({
            position: "",
            left: "",
            right: "",
            top: "",
            bottom: "",
            transition: "",
            transform: ""
        });
    };
    return Item;
});

/*!
 * Outlayer v2.1.0
 * the brains and guts of a layout library
 * MIT license
 */
(function(window, factory) {
    "use strict";
    // universal module definition
    /* jshint strict: false */
    /* globals define, module, require */
    if (typeof define == "function" && define.amd) {
        // AMD - RequireJS
        define("outlayer/outlayer", [ "ev-emitter/ev-emitter", "get-size/get-size", "fizzy-ui-utils/utils", "./item" ], function(EvEmitter, getSize, utils, Item) {
            return factory(window, EvEmitter, getSize, utils, Item);
        });
    } else if (typeof module == "object" && module.exports) {
        // CommonJS - Browserify, Webpack
        module.exports = factory(window, require("ev-emitter"), require("get-size"), require("fizzy-ui-utils"), require("./item"));
    } else {
        // browser global
        window.Outlayer = factory(window, window.EvEmitter, window.getSize, window.fizzyUIUtils, window.Outlayer.Item);
    }
})(window, function factory(window, EvEmitter, getSize, utils, Item) {
    "use strict";
    // ----- vars ----- //
    var console = window.console;
    var jQuery = window.jQuery;
    var noop = function() {};
    // -------------------------- Outlayer -------------------------- //
    // globally unique identifiers
    var GUID = 0;
    // internal store of all Outlayer intances
    var instances = {};
    /**
 * @param {Element, String} element
 * @param {Object} options
 * @constructor
 */
    function Outlayer(element, options) {
        var queryElement = utils.getQueryElement(element);
        if (!queryElement) {
            if (console) {
                console.error("Bad element for " + this.constructor.namespace + ": " + (queryElement || element));
            }
            return;
        }
        this.element = queryElement;
        // add jQuery
        if (jQuery) {
            this.$element = jQuery(this.element);
        }
        // options
        this.options = utils.extend({}, this.constructor.defaults);
        this.option(options);
        // add id for Outlayer.getFromElement
        var id = ++GUID;
        this.element.outlayerGUID = id;
        // expando
        instances[id] = this;
        // associate via id
        // kick it off
        this._create();
        var isInitLayout = this._getOption("initLayout");
        if (isInitLayout) {
            this.layout();
        }
    }
    // settings are for internal use only
    Outlayer.namespace = "outlayer";
    Outlayer.Item = Item;
    // default options
    Outlayer.defaults = {
        containerStyle: {
            position: "relative"
        },
        initLayout: true,
        originLeft: true,
        originTop: true,
        resize: true,
        resizeContainer: true,
        // item options
        transitionDuration: "0.4s",
        hiddenStyle: {
            opacity: 0,
            transform: "scale(0.001)"
        },
        visibleStyle: {
            opacity: 1,
            transform: "scale(1)"
        }
    };
    var proto = Outlayer.prototype;
    // inherit EvEmitter
    utils.extend(proto, EvEmitter.prototype);
    /**
 * set options
 * @param {Object} opts
 */
    proto.option = function(opts) {
        utils.extend(this.options, opts);
    };
    /**
 * get backwards compatible option value, check old name
 */
    proto._getOption = function(option) {
        var oldOption = this.constructor.compatOptions[option];
        return oldOption && this.options[oldOption] !== undefined ? this.options[oldOption] : this.options[option];
    };
    Outlayer.compatOptions = {
        // currentName: oldName
        initLayout: "isInitLayout",
        horizontal: "isHorizontal",
        layoutInstant: "isLayoutInstant",
        originLeft: "isOriginLeft",
        originTop: "isOriginTop",
        resize: "isResizeBound",
        resizeContainer: "isResizingContainer"
    };
    proto._create = function() {
        // get items from children
        this.reloadItems();
        // elements that affect layout, but are not laid out
        this.stamps = [];
        this.stamp(this.options.stamp);
        // set container style
        utils.extend(this.element.style, this.options.containerStyle);
        // bind resize method
        var canBindResize = this._getOption("resize");
        if (canBindResize) {
            this.bindResize();
        }
    };
    // goes through all children again and gets bricks in proper order
    proto.reloadItems = function() {
        // collection of item elements
        this.items = this._itemize(this.element.children);
    };
    /**
 * turn elements into Outlayer.Items to be used in layout
 * @param {Array or NodeList or HTMLElement} elems
 * @returns {Array} items - collection of new Outlayer Items
 */
    proto._itemize = function(elems) {
        var itemElems = this._filterFindItemElements(elems);
        var Item = this.constructor.Item;
        // create new Outlayer Items for collection
        var items = [];
        for (var i = 0; i < itemElems.length; i++) {
            var elem = itemElems[i];
            var item = new Item(elem, this);
            items.push(item);
        }
        return items;
    };
    /**
 * get item elements to be used in layout
 * @param {Array or NodeList or HTMLElement} elems
 * @returns {Array} items - item elements
 */
    proto._filterFindItemElements = function(elems) {
        return utils.filterFindElements(elems, this.options.itemSelector);
    };
    /**
 * getter method for getting item elements
 * @returns {Array} elems - collection of item elements
 */
    proto.getItemElements = function() {
        return this.items.map(function(item) {
            return item.element;
        });
    };
    // ----- init & layout ----- //
    /**
 * lays out all items
 */
    proto.layout = function() {
        this._resetLayout();
        this._manageStamps();
        // don't animate first layout
        var layoutInstant = this._getOption("layoutInstant");
        var isInstant = layoutInstant !== undefined ? layoutInstant : !this._isLayoutInited;
        this.layoutItems(this.items, isInstant);
        // flag for initalized
        this._isLayoutInited = true;
    };
    // _init is alias for layout
    proto._init = proto.layout;
    /**
 * logic before any new layout
 */
    proto._resetLayout = function() {
        this.getSize();
    };
    proto.getSize = function() {
        this.size = getSize(this.element);
    };
    /**
 * get measurement from option, for columnWidth, rowHeight, gutter
 * if option is String -> get element from selector string, & get size of element
 * if option is Element -> get size of element
 * else use option as a number
 *
 * @param {String} measurement
 * @param {String} size - width or height
 * @private
 */
    proto._getMeasurement = function(measurement, size) {
        var option = this.options[measurement];
        var elem;
        if (!option) {
            // default to 0
            this[measurement] = 0;
        } else {
            // use option as an element
            if (typeof option == "string") {
                elem = this.element.querySelector(option);
            } else if (option instanceof HTMLElement) {
                elem = option;
            }
            // use size of element, if element
            this[measurement] = elem ? getSize(elem)[size] : option;
        }
    };
    /**
 * layout a collection of item elements
 * @api public
 */
    proto.layoutItems = function(items, isInstant) {
        items = this._getItemsForLayout(items);
        this._layoutItems(items, isInstant);
        this._postLayout();
    };
    /**
 * get the items to be laid out
 * you may want to skip over some items
 * @param {Array} items
 * @returns {Array} items
 */
    proto._getItemsForLayout = function(items) {
        return items.filter(function(item) {
            return !item.isIgnored;
        });
    };
    /**
 * layout items
 * @param {Array} items
 * @param {Boolean} isInstant
 */
    proto._layoutItems = function(items, isInstant) {
        this._emitCompleteOnItems("layout", items);
        if (!items || !items.length) {
            // no items, emit event with empty array
            return;
        }
        var queue = [];
        items.forEach(function(item) {
            // get x/y object from method
            var position = this._getItemLayoutPosition(item);
            // enqueue
            position.item = item;
            position.isInstant = isInstant || item.isLayoutInstant;
            queue.push(position);
        }, this);
        this._processLayoutQueue(queue);
    };
    /**
 * get item layout position
 * @param {Outlayer.Item} item
 * @returns {Object} x and y position
 */
    proto._getItemLayoutPosition = function() {
        return {
            x: 0,
            y: 0
        };
    };
    /**
 * iterate over array and position each item
 * Reason being - separating this logic prevents 'layout invalidation'
 * thx @paul_irish
 * @param {Array} queue
 */
    proto._processLayoutQueue = function(queue) {
        this.updateStagger();
        queue.forEach(function(obj, i) {
            this._positionItem(obj.item, obj.x, obj.y, obj.isInstant, i);
        }, this);
    };
    // set stagger from option in milliseconds number
    proto.updateStagger = function() {
        var stagger = this.options.stagger;
        if (stagger === null || stagger === undefined) {
            this.stagger = 0;
            return;
        }
        this.stagger = getMilliseconds(stagger);
        return this.stagger;
    };
    /**
 * Sets position of item in DOM
 * @param {Outlayer.Item} item
 * @param {Number} x - horizontal position
 * @param {Number} y - vertical position
 * @param {Boolean} isInstant - disables transitions
 */
    proto._positionItem = function(item, x, y, isInstant, i) {
        if (isInstant) {
            // if not transition, just set CSS
            item.goTo(x, y);
        } else {
            item.stagger(i * this.stagger);
            item.moveTo(x, y);
        }
    };
    /**
 * Any logic you want to do after each layout,
 * i.e. size the container
 */
    proto._postLayout = function() {
        this.resizeContainer();
    };
    proto.resizeContainer = function() {
        var isResizingContainer = this._getOption("resizeContainer");
        if (!isResizingContainer) {
            return;
        }
        var size = this._getContainerSize();
        if (size) {
            this._setContainerMeasure(size.width, true);
            this._setContainerMeasure(size.height, false);
        }
    };
    /**
 * Sets width or height of container if returned
 * @returns {Object} size
 *   @param {Number} width
 *   @param {Number} height
 */
    proto._getContainerSize = noop;
    /**
 * @param {Number} measure - size of width or height
 * @param {Boolean} isWidth
 */
    proto._setContainerMeasure = function(measure, isWidth) {
        if (measure === undefined) {
            return;
        }
        var elemSize = this.size;
        // add padding and border width if border box
        if (elemSize.isBorderBox) {
            measure += isWidth ? elemSize.paddingLeft + elemSize.paddingRight + elemSize.borderLeftWidth + elemSize.borderRightWidth : elemSize.paddingBottom + elemSize.paddingTop + elemSize.borderTopWidth + elemSize.borderBottomWidth;
        }
        measure = Math.max(measure, 0);
        this.element.style[isWidth ? "width" : "height"] = measure + "px";
    };
    /**
 * emit eventComplete on a collection of items events
 * @param {String} eventName
 * @param {Array} items - Outlayer.Items
 */
    proto._emitCompleteOnItems = function(eventName, items) {
        var _this = this;
        function onComplete() {
            _this.dispatchEvent(eventName + "Complete", null, [ items ]);
        }
        var count = items.length;
        if (!items || !count) {
            onComplete();
            return;
        }
        var doneCount = 0;
        function tick() {
            doneCount++;
            if (doneCount == count) {
                onComplete();
            }
        }
        // bind callback
        items.forEach(function(item) {
            item.once(eventName, tick);
        });
    };
    /**
 * emits events via EvEmitter and jQuery events
 * @param {String} type - name of event
 * @param {Event} event - original event
 * @param {Array} args - extra arguments
 */
    proto.dispatchEvent = function(type, event, args) {
        // add original event to arguments
        var emitArgs = event ? [ event ].concat(args) : args;
        this.emitEvent(type, emitArgs);
        if (jQuery) {
            // set this.$element
            this.$element = this.$element || jQuery(this.element);
            if (event) {
                // create jQuery event
                var $event = jQuery.Event(event);
                $event.type = type;
                this.$element.trigger($event, args);
            } else {
                // just trigger with type if no event available
                this.$element.trigger(type, args);
            }
        }
    };
    // -------------------------- ignore & stamps -------------------------- //
    /**
 * keep item in collection, but do not lay it out
 * ignored items do not get skipped in layout
 * @param {Element} elem
 */
    proto.ignore = function(elem) {
        var item = this.getItem(elem);
        if (item) {
            item.isIgnored = true;
        }
    };
    /**
 * return item to layout collection
 * @param {Element} elem
 */
    proto.unignore = function(elem) {
        var item = this.getItem(elem);
        if (item) {
            delete item.isIgnored;
        }
    };
    /**
 * adds elements to stamps
 * @param {NodeList, Array, Element, or String} elems
 */
    proto.stamp = function(elems) {
        elems = this._find(elems);
        if (!elems) {
            return;
        }
        this.stamps = this.stamps.concat(elems);
        // ignore
        elems.forEach(this.ignore, this);
    };
    /**
 * removes elements to stamps
 * @param {NodeList, Array, or Element} elems
 */
    proto.unstamp = function(elems) {
        elems = this._find(elems);
        if (!elems) {
            return;
        }
        elems.forEach(function(elem) {
            // filter out removed stamp elements
            utils.removeFrom(this.stamps, elem);
            this.unignore(elem);
        }, this);
    };
    /**
 * finds child elements
 * @param {NodeList, Array, Element, or String} elems
 * @returns {Array} elems
 */
    proto._find = function(elems) {
        if (!elems) {
            return;
        }
        // if string, use argument as selector string
        if (typeof elems == "string") {
            elems = this.element.querySelectorAll(elems);
        }
        elems = utils.makeArray(elems);
        return elems;
    };
    proto._manageStamps = function() {
        if (!this.stamps || !this.stamps.length) {
            return;
        }
        this._getBoundingRect();
        this.stamps.forEach(this._manageStamp, this);
    };
    // update boundingLeft / Top
    proto._getBoundingRect = function() {
        // get bounding rect for container element
        var boundingRect = this.element.getBoundingClientRect();
        var size = this.size;
        this._boundingRect = {
            left: boundingRect.left + size.paddingLeft + size.borderLeftWidth,
            top: boundingRect.top + size.paddingTop + size.borderTopWidth,
            right: boundingRect.right - (size.paddingRight + size.borderRightWidth),
            bottom: boundingRect.bottom - (size.paddingBottom + size.borderBottomWidth)
        };
    };
    /**
 * @param {Element} stamp
**/
    proto._manageStamp = noop;
    /**
 * get x/y position of element relative to container element
 * @param {Element} elem
 * @returns {Object} offset - has left, top, right, bottom
 */
    proto._getElementOffset = function(elem) {
        var boundingRect = elem.getBoundingClientRect();
        var thisRect = this._boundingRect;
        var size = getSize(elem);
        var offset = {
            left: boundingRect.left - thisRect.left - size.marginLeft,
            top: boundingRect.top - thisRect.top - size.marginTop,
            right: thisRect.right - boundingRect.right - size.marginRight,
            bottom: thisRect.bottom - boundingRect.bottom - size.marginBottom
        };
        return offset;
    };
    // -------------------------- resize -------------------------- //
    // enable event handlers for listeners
    // i.e. resize -> onresize
    proto.handleEvent = utils.handleEvent;
    /**
 * Bind layout to window resizing
 */
    proto.bindResize = function() {
        window.addEventListener("resize", this);
        this.isResizeBound = true;
    };
    /**
 * Unbind layout to window resizing
 */
    proto.unbindResize = function() {
        window.removeEventListener("resize", this);
        this.isResizeBound = false;
    };
    proto.onresize = function() {
        this.resize();
    };
    utils.debounceMethod(Outlayer, "onresize", 100);
    proto.resize = function() {
        // don't trigger if size did not change
        // or if resize was unbound. See #9
        if (!this.isResizeBound || !this.needsResizeLayout()) {
            return;
        }
        this.layout();
    };
    /**
 * check if layout is needed post layout
 * @returns Boolean
 */
    proto.needsResizeLayout = function() {
        var size = getSize(this.element);
        // check that this.size and size are there
        // IE8 triggers resize on body size change, so they might not be
        var hasSizes = this.size && size;
        return hasSizes && size.innerWidth !== this.size.innerWidth;
    };
    // -------------------------- methods -------------------------- //
    /**
 * add items to Outlayer instance
 * @param {Array or NodeList or Element} elems
 * @returns {Array} items - Outlayer.Items
**/
    proto.addItems = function(elems) {
        var items = this._itemize(elems);
        // add items to collection
        if (items.length) {
            this.items = this.items.concat(items);
        }
        return items;
    };
    /**
 * Layout newly-appended item elements
 * @param {Array or NodeList or Element} elems
 */
    proto.appended = function(elems) {
        var items = this.addItems(elems);
        if (!items.length) {
            return;
        }
        // layout and reveal just the new items
        this.layoutItems(items, true);
        this.reveal(items);
    };
    /**
 * Layout prepended elements
 * @param {Array or NodeList or Element} elems
 */
    proto.prepended = function(elems) {
        var items = this._itemize(elems);
        if (!items.length) {
            return;
        }
        // add items to beginning of collection
        var previousItems = this.items.slice(0);
        this.items = items.concat(previousItems);
        // start new layout
        this._resetLayout();
        this._manageStamps();
        // layout new stuff without transition
        this.layoutItems(items, true);
        this.reveal(items);
        // layout previous items
        this.layoutItems(previousItems);
    };
    /**
 * reveal a collection of items
 * @param {Array of Outlayer.Items} items
 */
    proto.reveal = function(items) {
        this._emitCompleteOnItems("reveal", items);
        if (!items || !items.length) {
            return;
        }
        var stagger = this.updateStagger();
        items.forEach(function(item, i) {
            item.stagger(i * stagger);
            item.reveal();
        });
    };
    /**
 * hide a collection of items
 * @param {Array of Outlayer.Items} items
 */
    proto.hide = function(items) {
        this._emitCompleteOnItems("hide", items);
        if (!items || !items.length) {
            return;
        }
        var stagger = this.updateStagger();
        items.forEach(function(item, i) {
            item.stagger(i * stagger);
            item.hide();
        });
    };
    /**
 * reveal item elements
 * @param {Array}, {Element}, {NodeList} items
 */
    proto.revealItemElements = function(elems) {
        var items = this.getItems(elems);
        this.reveal(items);
    };
    /**
 * hide item elements
 * @param {Array}, {Element}, {NodeList} items
 */
    proto.hideItemElements = function(elems) {
        var items = this.getItems(elems);
        this.hide(items);
    };
    /**
 * get Outlayer.Item, given an Element
 * @param {Element} elem
 * @param {Function} callback
 * @returns {Outlayer.Item} item
 */
    proto.getItem = function(elem) {
        // loop through items to get the one that matches
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if (item.element == elem) {
                // return item
                return item;
            }
        }
    };
    /**
 * get collection of Outlayer.Items, given Elements
 * @param {Array} elems
 * @returns {Array} items - Outlayer.Items
 */
    proto.getItems = function(elems) {
        elems = utils.makeArray(elems);
        var items = [];
        elems.forEach(function(elem) {
            var item = this.getItem(elem);
            if (item) {
                items.push(item);
            }
        }, this);
        return items;
    };
    /**
 * remove element(s) from instance and DOM
 * @param {Array or NodeList or Element} elems
 */
    proto.remove = function(elems) {
        var removeItems = this.getItems(elems);
        this._emitCompleteOnItems("remove", removeItems);
        // bail if no items to remove
        if (!removeItems || !removeItems.length) {
            return;
        }
        removeItems.forEach(function(item) {
            item.remove();
            // remove item from collection
            utils.removeFrom(this.items, item);
        }, this);
    };
    // ----- destroy ----- //
    // remove and disable Outlayer instance
    proto.destroy = function() {
        // clean up dynamic styles
        var style = this.element.style;
        style.height = "";
        style.position = "";
        style.width = "";
        // destroy items
        this.items.forEach(function(item) {
            item.destroy();
        });
        this.unbindResize();
        var id = this.element.outlayerGUID;
        delete instances[id];
        // remove reference to instance by id
        delete this.element.outlayerGUID;
        // remove data for jQuery
        if (jQuery) {
            jQuery.removeData(this.element, this.constructor.namespace);
        }
    };
    // -------------------------- data -------------------------- //
    /**
 * get Outlayer instance from element
 * @param {Element} elem
 * @returns {Outlayer}
 */
    Outlayer.data = function(elem) {
        elem = utils.getQueryElement(elem);
        var id = elem && elem.outlayerGUID;
        return id && instances[id];
    };
    // -------------------------- create Outlayer class -------------------------- //
    /**
 * create a layout class
 * @param {String} namespace
 */
    Outlayer.create = function(namespace, options) {
        // sub-class Outlayer
        var Layout = subclass(Outlayer);
        // apply new options and compatOptions
        Layout.defaults = utils.extend({}, Outlayer.defaults);
        utils.extend(Layout.defaults, options);
        Layout.compatOptions = utils.extend({}, Outlayer.compatOptions);
        Layout.namespace = namespace;
        Layout.data = Outlayer.data;
        // sub-class Item
        Layout.Item = subclass(Item);
        // -------------------------- declarative -------------------------- //
        utils.htmlInit(Layout, namespace);
        // -------------------------- jQuery bridge -------------------------- //
        // make into jQuery plugin
        if (jQuery && jQuery.bridget) {
            jQuery.bridget(namespace, Layout);
        }
        return Layout;
    };
    function subclass(Parent) {
        function SubClass() {
            Parent.apply(this, arguments);
        }
        SubClass.prototype = Object.create(Parent.prototype);
        SubClass.prototype.constructor = SubClass;
        return SubClass;
    }
    // ----- helpers ----- //
    // how many milliseconds are in each unit
    var msUnits = {
        ms: 1,
        s: 1e3
    };
    // munge time-like parameter into millisecond number
    // '0.4s' -> 40
    function getMilliseconds(time) {
        if (typeof time == "number") {
            return time;
        }
        var matches = time.match(/(^\d*\.?\d*)(\w*)/);
        var num = matches && matches[1];
        var unit = matches && matches[2];
        if (!num.length) {
            return 0;
        }
        num = parseFloat(num);
        var mult = msUnits[unit] || 1;
        return num * mult;
    }
    // ----- fin ----- //
    // back in global
    Outlayer.Item = Item;
    return Outlayer;
});

/*!
 * Masonry v4.1.1
 * Cascading grid layout library
 * http://masonry.desandro.com
 * MIT License
 * by David DeSandro
 */
(function(window, factory) {
    // universal module definition
    /* jshint strict: false */
    /*globals define, module, require */
    if (typeof define == "function" && define.amd) {
        // AMD
        define([ "outlayer/outlayer", "get-size/get-size" ], factory);
    } else if (typeof module == "object" && module.exports) {
        // CommonJS
        module.exports = factory(require("outlayer"), require("get-size"));
    } else {
        // browser global
        window.Masonry = factory(window.Outlayer, window.getSize);
    }
})(window, function factory(Outlayer, getSize) {
    // -------------------------- masonryDefinition -------------------------- //
    // create an Outlayer layout class
    var Masonry = Outlayer.create("masonry");
    // isFitWidth -> fitWidth
    Masonry.compatOptions.fitWidth = "isFitWidth";
    Masonry.prototype._resetLayout = function() {
        this.getSize();
        this._getMeasurement("columnWidth", "outerWidth");
        this._getMeasurement("gutter", "outerWidth");
        this.measureColumns();
        // reset column Y
        this.colYs = [];
        for (var i = 0; i < this.cols; i++) {
            this.colYs.push(0);
        }
        this.maxY = 0;
    };
    Masonry.prototype.measureColumns = function() {
        this.getContainerWidth();
        // if columnWidth is 0, default to outerWidth of first item
        if (!this.columnWidth) {
            var firstItem = this.items[0];
            var firstItemElem = firstItem && firstItem.element;
            // columnWidth fall back to item of first element
            this.columnWidth = firstItemElem && getSize(firstItemElem).outerWidth || // if first elem has no width, default to size of container
            this.containerWidth;
        }
        var columnWidth = this.columnWidth += this.gutter;
        // calculate columns
        var containerWidth = this.containerWidth + this.gutter;
        var cols = containerWidth / columnWidth;
        // fix rounding errors, typically with gutters
        var excess = columnWidth - containerWidth % columnWidth;
        // if overshoot is less than a pixel, round up, otherwise floor it
        var mathMethod = excess && excess < 1 ? "round" : "floor";
        cols = Math[mathMethod](cols);
        this.cols = Math.max(cols, 1);
    };
    Masonry.prototype.getContainerWidth = function() {
        // container is parent if fit width
        var isFitWidth = this._getOption("fitWidth");
        var container = isFitWidth ? this.element.parentNode : this.element;
        // check that this.size and size are there
        // IE8 triggers resize on body size change, so they might not be
        var size = getSize(container);
        this.containerWidth = size && size.innerWidth;
    };
    Masonry.prototype._getItemLayoutPosition = function(item) {
        item.getSize();
        // how many columns does this brick span
        var remainder = item.size.outerWidth % this.columnWidth;
        var mathMethod = remainder && remainder < 1 ? "round" : "ceil";
        // round if off by 1 pixel, otherwise use ceil
        var colSpan = Math[mathMethod](item.size.outerWidth / this.columnWidth);
        colSpan = Math.min(colSpan, this.cols);
        var colGroup = this._getColGroup(colSpan);
        // get the minimum Y value from the columns
        var minimumY = Math.min.apply(Math, colGroup);
        var shortColIndex = colGroup.indexOf(minimumY);
        // position the brick
        var position = {
            x: this.columnWidth * shortColIndex,
            y: minimumY
        };
        // apply setHeight to necessary columns
        var setHeight = minimumY + item.size.outerHeight;
        var setSpan = this.cols + 1 - colGroup.length;
        for (var i = 0; i < setSpan; i++) {
            this.colYs[shortColIndex + i] = setHeight;
        }
        return position;
    };
    /**
   * @param {Number} colSpan - number of columns the element spans
   * @returns {Array} colGroup
   */
    Masonry.prototype._getColGroup = function(colSpan) {
        if (colSpan < 2) {
            // if brick spans only one column, use all the column Ys
            return this.colYs;
        }
        var colGroup = [];
        // how many different places could this brick fit horizontally
        var groupCount = this.cols + 1 - colSpan;
        // for each group potential horizontal position
        for (var i = 0; i < groupCount; i++) {
            // make an array of colY values for that one group
            var groupColYs = this.colYs.slice(i, i + colSpan);
            // and get the max value of the array
            colGroup[i] = Math.max.apply(Math, groupColYs);
        }
        return colGroup;
    };
    Masonry.prototype._manageStamp = function(stamp) {
        var stampSize = getSize(stamp);
        var offset = this._getElementOffset(stamp);
        // get the columns that this stamp affects
        var isOriginLeft = this._getOption("originLeft");
        var firstX = isOriginLeft ? offset.left : offset.right;
        var lastX = firstX + stampSize.outerWidth;
        var firstCol = Math.floor(firstX / this.columnWidth);
        firstCol = Math.max(0, firstCol);
        var lastCol = Math.floor(lastX / this.columnWidth);
        // lastCol should not go over if multiple of columnWidth #425
        lastCol -= lastX % this.columnWidth ? 0 : 1;
        lastCol = Math.min(this.cols - 1, lastCol);
        // set colYs to bottom of the stamp
        var isOriginTop = this._getOption("originTop");
        var stampMaxY = (isOriginTop ? offset.top : offset.bottom) + stampSize.outerHeight;
        for (var i = firstCol; i <= lastCol; i++) {
            this.colYs[i] = Math.max(stampMaxY, this.colYs[i]);
        }
    };
    Masonry.prototype._getContainerSize = function() {
        this.maxY = Math.max.apply(Math, this.colYs);
        var size = {
            height: this.maxY
        };
        if (this._getOption("fitWidth")) {
            size.width = this._getContainerFitWidth();
        }
        return size;
    };
    Masonry.prototype._getContainerFitWidth = function() {
        var unusedCols = 0;
        // count unused columns
        var i = this.cols;
        while (--i) {
            if (this.colYs[i] !== 0) {
                break;
            }
            unusedCols++;
        }
        // fit container to columns that have been used
        return (this.cols - unusedCols) * this.columnWidth - this.gutter;
    };
    Masonry.prototype.needsResizeLayout = function() {
        var previousWidth = this.containerWidth;
        this.getContainerWidth();
        return previousWidth != this.containerWidth;
    };
    return Masonry;
});