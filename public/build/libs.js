/*! PhotoSwipe - v4.1.1 - 2015-12-24
* http://photoswipe.com
* Copyright (c) 2015 Dmitry Semenov; */
(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define(factory);
    } else if (typeof exports === "object") {
        module.exports = factory();
    } else {
        root.PhotoSwipe = factory();
    }
})(this, function() {
    "use strict";
    var PhotoSwipe = function(template, UiClass, items, options) {
        /*>>framework-bridge*/
        /**
 *
 * Set of generic functions used by gallery.
 * 
 * You're free to modify anything here as long as functionality is kept.
 * 
 */
        var framework = {
            features: null,
            bind: function(target, type, listener, unbind) {
                var methodName = (unbind ? "remove" : "add") + "EventListener";
                type = type.split(" ");
                for (var i = 0; i < type.length; i++) {
                    if (type[i]) {
                        target[methodName](type[i], listener, false);
                    }
                }
            },
            isArray: function(obj) {
                return obj instanceof Array;
            },
            createEl: function(classes, tag) {
                var el = document.createElement(tag || "div");
                if (classes) {
                    el.className = classes;
                }
                return el;
            },
            getScrollY: function() {
                var yOffset = window.pageYOffset;
                return yOffset !== undefined ? yOffset : document.documentElement.scrollTop;
            },
            unbind: function(target, type, listener) {
                framework.bind(target, type, listener, true);
            },
            removeClass: function(el, className) {
                var reg = new RegExp("(\\s|^)" + className + "(\\s|$)");
                el.className = el.className.replace(reg, " ").replace(/^\s\s*/, "").replace(/\s\s*$/, "");
            },
            addClass: function(el, className) {
                if (!framework.hasClass(el, className)) {
                    el.className += (el.className ? " " : "") + className;
                }
            },
            hasClass: function(el, className) {
                return el.className && new RegExp("(^|\\s)" + className + "(\\s|$)").test(el.className);
            },
            getChildByClass: function(parentEl, childClassName) {
                var node = parentEl.firstChild;
                while (node) {
                    if (framework.hasClass(node, childClassName)) {
                        return node;
                    }
                    node = node.nextSibling;
                }
            },
            arraySearch: function(array, value, key) {
                var i = array.length;
                while (i--) {
                    if (array[i][key] === value) {
                        return i;
                    }
                }
                return -1;
            },
            extend: function(o1, o2, preventOverwrite) {
                for (var prop in o2) {
                    if (o2.hasOwnProperty(prop)) {
                        if (preventOverwrite && o1.hasOwnProperty(prop)) {
                            continue;
                        }
                        o1[prop] = o2[prop];
                    }
                }
            },
            easing: {
                sine: {
                    out: function(k) {
                        return Math.sin(k * (Math.PI / 2));
                    },
                    inOut: function(k) {
                        return -(Math.cos(Math.PI * k) - 1) / 2;
                    }
                },
                cubic: {
                    out: function(k) {
                        return --k * k * k + 1;
                    }
                }
            },
            /**
	 * 
	 * @return {object}
	 * 
	 * {
	 *  raf : request animation frame function
	 *  caf : cancel animation frame function
	 *  transfrom : transform property key (with vendor), or null if not supported
	 *  oldIE : IE8 or below
	 * }
	 * 
	 */
            detectFeatures: function() {
                if (framework.features) {
                    return framework.features;
                }
                var helperEl = framework.createEl(), helperStyle = helperEl.style, vendor = "", features = {};
                // IE8 and below
                features.oldIE = document.all && !document.addEventListener;
                features.touch = "ontouchstart" in window;
                if (window.requestAnimationFrame) {
                    features.raf = window.requestAnimationFrame;
                    features.caf = window.cancelAnimationFrame;
                }
                features.pointerEvent = navigator.pointerEnabled || navigator.msPointerEnabled;
                // fix false-positive detection of old Android in new IE
                // (IE11 ua string contains "Android 4.0")
                if (!features.pointerEvent) {
                    var ua = navigator.userAgent;
                    // Detect if device is iPhone or iPod and if it's older than iOS 8
                    // http://stackoverflow.com/a/14223920
                    // 
                    // This detection is made because of buggy top/bottom toolbars
                    // that don't trigger window.resize event.
                    // For more info refer to _isFixedPosition variable in core.js
                    if (/iP(hone|od)/.test(navigator.platform)) {
                        var v = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
                        if (v && v.length > 0) {
                            v = parseInt(v[1], 10);
                            if (v >= 1 && v < 8) {
                                features.isOldIOSPhone = true;
                            }
                        }
                    }
                    // Detect old Android (before KitKat)
                    // due to bugs related to position:fixed
                    // http://stackoverflow.com/questions/7184573/pick-up-the-android-version-in-the-browser-by-javascript
                    var match = ua.match(/Android\s([0-9\.]*)/);
                    var androidversion = match ? match[1] : 0;
                    androidversion = parseFloat(androidversion);
                    if (androidversion >= 1) {
                        if (androidversion < 4.4) {
                            features.isOldAndroid = true;
                        }
                        features.androidVersion = androidversion;
                    }
                    features.isMobileOpera = /opera mini|opera mobi/i.test(ua);
                }
                var styleChecks = [ "transform", "perspective", "animationName" ], vendors = [ "", "webkit", "Moz", "ms", "O" ], styleCheckItem, styleName;
                for (var i = 0; i < 4; i++) {
                    vendor = vendors[i];
                    for (var a = 0; a < 3; a++) {
                        styleCheckItem = styleChecks[a];
                        // uppercase first letter of property name, if vendor is present
                        styleName = vendor + (vendor ? styleCheckItem.charAt(0).toUpperCase() + styleCheckItem.slice(1) : styleCheckItem);
                        if (!features[styleCheckItem] && styleName in helperStyle) {
                            features[styleCheckItem] = styleName;
                        }
                    }
                    if (vendor && !features.raf) {
                        vendor = vendor.toLowerCase();
                        features.raf = window[vendor + "RequestAnimationFrame"];
                        if (features.raf) {
                            features.caf = window[vendor + "CancelAnimationFrame"] || window[vendor + "CancelRequestAnimationFrame"];
                        }
                    }
                }
                if (!features.raf) {
                    var lastTime = 0;
                    features.raf = function(fn) {
                        var currTime = new Date().getTime();
                        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                        var id = window.setTimeout(function() {
                            fn(currTime + timeToCall);
                        }, timeToCall);
                        lastTime = currTime + timeToCall;
                        return id;
                    };
                    features.caf = function(id) {
                        clearTimeout(id);
                    };
                }
                // Detect SVG support
                features.svg = !!document.createElementNS && !!document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect;
                framework.features = features;
                return features;
            }
        };
        framework.detectFeatures();
        // Override addEventListener for old versions of IE
        if (framework.features.oldIE) {
            framework.bind = function(target, type, listener, unbind) {
                type = type.split(" ");
                var methodName = (unbind ? "detach" : "attach") + "Event", evName, _handleEv = function() {
                    listener.handleEvent.call(listener);
                };
                for (var i = 0; i < type.length; i++) {
                    evName = type[i];
                    if (evName) {
                        if (typeof listener === "object" && listener.handleEvent) {
                            if (!unbind) {
                                listener["oldIE" + evName] = _handleEv;
                            } else {
                                if (!listener["oldIE" + evName]) {
                                    return false;
                                }
                            }
                            target[methodName]("on" + evName, listener["oldIE" + evName]);
                        } else {
                            target[methodName]("on" + evName, listener);
                        }
                    }
                }
            };
        }
        /*>>framework-bridge*/
        /*>>core*/
        //function(template, UiClass, items, options)
        var self = this;
        /**
 * Static vars, don't change unless you know what you're doing.
 */
        var DOUBLE_TAP_RADIUS = 25, NUM_HOLDERS = 3;
        /**
 * Options
 */
        var _options = {
            allowPanToNext: true,
            spacing: .12,
            bgOpacity: 1,
            mouseUsed: false,
            loop: true,
            pinchToClose: true,
            closeOnScroll: true,
            closeOnVerticalDrag: true,
            verticalDragRange: .75,
            hideAnimationDuration: 333,
            showAnimationDuration: 333,
            showHideOpacity: false,
            focus: true,
            escKey: true,
            arrowKeys: true,
            mainScrollEndFriction: .35,
            panEndFriction: .35,
            isClickableElement: function(el) {
                return el.tagName === "A";
            },
            getDoubleTapZoom: function(isMouseClick, item) {
                if (isMouseClick) {
                    return 1;
                } else {
                    return item.initialZoomLevel < .7 ? 1 : 1.33;
                }
            },
            maxSpreadZoom: 1.33,
            modal: true,
            // not fully implemented yet
            scaleMode: "fit"
        };
        framework.extend(_options, options);
        /**
 * Private helper variables & functions
 */
        var _getEmptyPoint = function() {
            return {
                x: 0,
                y: 0
            };
        };
        var _isOpen, _isDestroying, _closedByScroll, _currentItemIndex, _containerStyle, _containerShiftIndex, _currPanDist = _getEmptyPoint(), _startPanOffset = _getEmptyPoint(), _panOffset = _getEmptyPoint(), _upMoveEvents, // drag move, drag end & drag cancel events array
        _downEvents, // drag start events array
        _globalEventHandlers, _viewportSize = {}, _currZoomLevel, _startZoomLevel, _translatePrefix, _translateSufix, _updateSizeInterval, _itemsNeedUpdate, _currPositionIndex = 0, _offset = {}, _slideSize = _getEmptyPoint(), // size of slide area, including spacing
        _itemHolders, _prevItemIndex, _indexDiff = 0, // difference of indexes since last content update
        _dragStartEvent, _dragMoveEvent, _dragEndEvent, _dragCancelEvent, _transformKey, _pointerEventEnabled, _isFixedPosition = true, _likelyTouchDevice, _modules = [], _requestAF, _cancelAF, _initalClassName, _initalWindowScrollY, _oldIE, _currentWindowScrollY, _features, _windowVisibleSize = {}, _renderMaxResolution = false, // Registers PhotoSWipe module (History, Controller ...)
        _registerModule = function(name, module) {
            framework.extend(self, module.publicMethods);
            _modules.push(name);
        }, _getLoopedId = function(index) {
            var numSlides = _getNumItems();
            if (index > numSlides - 1) {
                return index - numSlides;
            } else if (index < 0) {
                return numSlides + index;
            }
            return index;
        }, // Micro bind/trigger
        _listeners = {}, _listen = function(name, fn) {
            if (!_listeners[name]) {
                _listeners[name] = [];
            }
            return _listeners[name].push(fn);
        }, _shout = function(name) {
            var listeners = _listeners[name];
            if (listeners) {
                var args = Array.prototype.slice.call(arguments);
                args.shift();
                for (var i = 0; i < listeners.length; i++) {
                    listeners[i].apply(self, args);
                }
            }
        }, _getCurrentTime = function() {
            return new Date().getTime();
        }, _applyBgOpacity = function(opacity) {
            _bgOpacity = opacity;
            self.bg.style.opacity = opacity * _options.bgOpacity;
        }, _applyZoomTransform = function(styleObj, x, y, zoom, item) {
            if (!_renderMaxResolution || item && item !== self.currItem) {
                zoom = zoom / (item ? item.fitRatio : self.currItem.fitRatio);
            }
            styleObj[_transformKey] = _translatePrefix + x + "px, " + y + "px" + _translateSufix + " scale(" + zoom + ")";
        }, _applyCurrentZoomPan = function(allowRenderResolution) {
            if (_currZoomElementStyle) {
                if (allowRenderResolution) {
                    if (_currZoomLevel > self.currItem.fitRatio) {
                        if (!_renderMaxResolution) {
                            _setImageSize(self.currItem, false, true);
                            _renderMaxResolution = true;
                        }
                    } else {
                        if (_renderMaxResolution) {
                            _setImageSize(self.currItem);
                            _renderMaxResolution = false;
                        }
                    }
                }
                _applyZoomTransform(_currZoomElementStyle, _panOffset.x, _panOffset.y, _currZoomLevel);
            }
        }, _applyZoomPanToItem = function(item) {
            if (item.container) {
                _applyZoomTransform(item.container.style, item.initialPosition.x, item.initialPosition.y, item.initialZoomLevel, item);
            }
        }, _setTranslateX = function(x, elStyle) {
            elStyle[_transformKey] = _translatePrefix + x + "px, 0px" + _translateSufix;
        }, _moveMainScroll = function(x, dragging) {
            if (!_options.loop && dragging) {
                var newSlideIndexOffset = _currentItemIndex + (_slideSize.x * _currPositionIndex - x) / _slideSize.x, delta = Math.round(x - _mainScrollPos.x);
                if (newSlideIndexOffset < 0 && delta > 0 || newSlideIndexOffset >= _getNumItems() - 1 && delta < 0) {
                    x = _mainScrollPos.x + delta * _options.mainScrollEndFriction;
                }
            }
            _mainScrollPos.x = x;
            _setTranslateX(x, _containerStyle);
        }, _calculatePanOffset = function(axis, zoomLevel) {
            var m = _midZoomPoint[axis] - _offset[axis];
            return _startPanOffset[axis] + _currPanDist[axis] + m - m * (zoomLevel / _startZoomLevel);
        }, _equalizePoints = function(p1, p2) {
            p1.x = p2.x;
            p1.y = p2.y;
            if (p2.id) {
                p1.id = p2.id;
            }
        }, _roundPoint = function(p) {
            p.x = Math.round(p.x);
            p.y = Math.round(p.y);
        }, _mouseMoveTimeout = null, _onFirstMouseMove = function() {
            // Wait until mouse move event is fired at least twice during 100ms
            // We do this, because some mobile browsers trigger it on touchstart
            if (_mouseMoveTimeout) {
                framework.unbind(document, "mousemove", _onFirstMouseMove);
                framework.addClass(template, "pswp--has_mouse");
                _options.mouseUsed = true;
                _shout("mouseUsed");
            }
            _mouseMoveTimeout = setTimeout(function() {
                _mouseMoveTimeout = null;
            }, 100);
        }, _bindEvents = function() {
            framework.bind(document, "keydown", self);
            if (_features.transform) {
                // don't bind click event in browsers that don't support transform (mostly IE8)
                framework.bind(self.scrollWrap, "click", self);
            }
            if (!_options.mouseUsed) {
                framework.bind(document, "mousemove", _onFirstMouseMove);
            }
            framework.bind(window, "resize scroll", self);
            _shout("bindEvents");
        }, _unbindEvents = function() {
            framework.unbind(window, "resize", self);
            framework.unbind(window, "scroll", _globalEventHandlers.scroll);
            framework.unbind(document, "keydown", self);
            framework.unbind(document, "mousemove", _onFirstMouseMove);
            if (_features.transform) {
                framework.unbind(self.scrollWrap, "click", self);
            }
            if (_isDragging) {
                framework.unbind(window, _upMoveEvents, self);
            }
            _shout("unbindEvents");
        }, _calculatePanBounds = function(zoomLevel, update) {
            var bounds = _calculateItemSize(self.currItem, _viewportSize, zoomLevel);
            if (update) {
                _currPanBounds = bounds;
            }
            return bounds;
        }, _getMinZoomLevel = function(item) {
            if (!item) {
                item = self.currItem;
            }
            return item.initialZoomLevel;
        }, _getMaxZoomLevel = function(item) {
            if (!item) {
                item = self.currItem;
            }
            return item.w > 0 ? _options.maxSpreadZoom : 1;
        }, // Return true if offset is out of the bounds
        _modifyDestPanOffset = function(axis, destPanBounds, destPanOffset, destZoomLevel) {
            if (destZoomLevel === self.currItem.initialZoomLevel) {
                destPanOffset[axis] = self.currItem.initialPosition[axis];
                return true;
            } else {
                destPanOffset[axis] = _calculatePanOffset(axis, destZoomLevel);
                if (destPanOffset[axis] > destPanBounds.min[axis]) {
                    destPanOffset[axis] = destPanBounds.min[axis];
                    return true;
                } else if (destPanOffset[axis] < destPanBounds.max[axis]) {
                    destPanOffset[axis] = destPanBounds.max[axis];
                    return true;
                }
            }
            return false;
        }, _setupTransforms = function() {
            if (_transformKey) {
                // setup 3d transforms
                var allow3dTransform = _features.perspective && !_likelyTouchDevice;
                _translatePrefix = "translate" + (allow3dTransform ? "3d(" : "(");
                _translateSufix = _features.perspective ? ", 0px)" : ")";
                return;
            }
            // Override zoom/pan/move functions in case old browser is used (most likely IE)
            // (so they use left/top/width/height, instead of CSS transform)
            _transformKey = "left";
            framework.addClass(template, "pswp--ie");
            _setTranslateX = function(x, elStyle) {
                elStyle.left = x + "px";
            };
            _applyZoomPanToItem = function(item) {
                var zoomRatio = item.fitRatio > 1 ? 1 : item.fitRatio, s = item.container.style, w = zoomRatio * item.w, h = zoomRatio * item.h;
                s.width = w + "px";
                s.height = h + "px";
                s.left = item.initialPosition.x + "px";
                s.top = item.initialPosition.y + "px";
            };
            _applyCurrentZoomPan = function() {
                if (_currZoomElementStyle) {
                    var s = _currZoomElementStyle, item = self.currItem, zoomRatio = item.fitRatio > 1 ? 1 : item.fitRatio, w = zoomRatio * item.w, h = zoomRatio * item.h;
                    s.width = w + "px";
                    s.height = h + "px";
                    s.left = _panOffset.x + "px";
                    s.top = _panOffset.y + "px";
                }
            };
        }, _onKeyDown = function(e) {
            var keydownAction = "";
            if (_options.escKey && e.keyCode === 27) {
                keydownAction = "close";
            } else if (_options.arrowKeys) {
                if (e.keyCode === 37) {
                    keydownAction = "prev";
                } else if (e.keyCode === 39) {
                    keydownAction = "next";
                }
            }
            if (keydownAction) {
                // don't do anything if special key pressed to prevent from overriding default browser actions
                // e.g. in Chrome on Mac cmd+arrow-left returns to previous page
                if (!e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
                    if (e.preventDefault) {
                        e.preventDefault();
                    } else {
                        e.returnValue = false;
                    }
                    self[keydownAction]();
                }
            }
        }, _onGlobalClick = function(e) {
            if (!e) {
                return;
            }
            // don't allow click event to pass through when triggering after drag or some other gesture
            if (_moved || _zoomStarted || _mainScrollAnimating || _verticalDragInitiated) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, _updatePageScrollOffset = function() {
            self.setScrollOffset(0, framework.getScrollY());
        };
        // Micro animation engine
        var _animations = {}, _numAnimations = 0, _stopAnimation = function(name) {
            if (_animations[name]) {
                if (_animations[name].raf) {
                    _cancelAF(_animations[name].raf);
                }
                _numAnimations--;
                delete _animations[name];
            }
        }, _registerStartAnimation = function(name) {
            if (_animations[name]) {
                _stopAnimation(name);
            }
            if (!_animations[name]) {
                _numAnimations++;
                _animations[name] = {};
            }
        }, _stopAllAnimations = function() {
            for (var prop in _animations) {
                if (_animations.hasOwnProperty(prop)) {
                    _stopAnimation(prop);
                }
            }
        }, _animateProp = function(name, b, endProp, d, easingFn, onUpdate, onComplete) {
            var startAnimTime = _getCurrentTime(), t;
            _registerStartAnimation(name);
            var animloop = function() {
                if (_animations[name]) {
                    t = _getCurrentTime() - startAnimTime;
                    // time diff
                    //b - beginning (start prop)
                    //d - anim duration
                    if (t >= d) {
                        _stopAnimation(name);
                        onUpdate(endProp);
                        if (onComplete) {
                            onComplete();
                        }
                        return;
                    }
                    onUpdate((endProp - b) * easingFn(t / d) + b);
                    _animations[name].raf = _requestAF(animloop);
                }
            };
            animloop();
        };
        var publicMethods = {
            // make a few local variables and functions public
            shout: _shout,
            listen: _listen,
            viewportSize: _viewportSize,
            options: _options,
            isMainScrollAnimating: function() {
                return _mainScrollAnimating;
            },
            getZoomLevel: function() {
                return _currZoomLevel;
            },
            getCurrentIndex: function() {
                return _currentItemIndex;
            },
            isDragging: function() {
                return _isDragging;
            },
            isZooming: function() {
                return _isZooming;
            },
            setScrollOffset: function(x, y) {
                _offset.x = x;
                _currentWindowScrollY = _offset.y = y;
                _shout("updateScrollOffset", _offset);
            },
            applyZoomPan: function(zoomLevel, panX, panY, allowRenderResolution) {
                _panOffset.x = panX;
                _panOffset.y = panY;
                _currZoomLevel = zoomLevel;
                _applyCurrentZoomPan(allowRenderResolution);
            },
            init: function() {
                if (_isOpen || _isDestroying) {
                    return;
                }
                var i;
                self.framework = framework;
                // basic functionality
                self.template = template;
                // root DOM element of PhotoSwipe
                self.bg = framework.getChildByClass(template, "pswp__bg");
                _initalClassName = template.className;
                _isOpen = true;
                _features = framework.detectFeatures();
                _requestAF = _features.raf;
                _cancelAF = _features.caf;
                _transformKey = _features.transform;
                _oldIE = _features.oldIE;
                self.scrollWrap = framework.getChildByClass(template, "pswp__scroll-wrap");
                self.container = framework.getChildByClass(self.scrollWrap, "pswp__container");
                _containerStyle = self.container.style;
                // for fast access
                // Objects that hold slides (there are only 3 in DOM)
                self.itemHolders = _itemHolders = [ {
                    el: self.container.children[0],
                    wrap: 0,
                    index: -1
                }, {
                    el: self.container.children[1],
                    wrap: 0,
                    index: -1
                }, {
                    el: self.container.children[2],
                    wrap: 0,
                    index: -1
                } ];
                // hide nearby item holders until initial zoom animation finishes (to avoid extra Paints)
                _itemHolders[0].el.style.display = _itemHolders[2].el.style.display = "none";
                _setupTransforms();
                // Setup global events
                _globalEventHandlers = {
                    resize: self.updateSize,
                    scroll: _updatePageScrollOffset,
                    keydown: _onKeyDown,
                    click: _onGlobalClick
                };
                // disable show/hide effects on old browsers that don't support CSS animations or transforms, 
                // old IOS, Android and Opera mobile. Blackberry seems to work fine, even older models.
                var oldPhone = _features.isOldIOSPhone || _features.isOldAndroid || _features.isMobileOpera;
                if (!_features.animationName || !_features.transform || oldPhone) {
                    _options.showAnimationDuration = _options.hideAnimationDuration = 0;
                }
                // init modules
                for (i = 0; i < _modules.length; i++) {
                    self["init" + _modules[i]]();
                }
                // init
                if (UiClass) {
                    var ui = self.ui = new UiClass(self, framework);
                    ui.init();
                }
                _shout("firstUpdate");
                _currentItemIndex = _currentItemIndex || _options.index || 0;
                // validate index
                if (isNaN(_currentItemIndex) || _currentItemIndex < 0 || _currentItemIndex >= _getNumItems()) {
                    _currentItemIndex = 0;
                }
                self.currItem = _getItemAt(_currentItemIndex);
                if (_features.isOldIOSPhone || _features.isOldAndroid) {
                    _isFixedPosition = false;
                }
                template.setAttribute("aria-hidden", "false");
                if (_options.modal) {
                    if (!_isFixedPosition) {
                        template.style.position = "absolute";
                        template.style.top = framework.getScrollY() + "px";
                    } else {
                        template.style.position = "fixed";
                    }
                }
                if (_currentWindowScrollY === undefined) {
                    _shout("initialLayout");
                    _currentWindowScrollY = _initalWindowScrollY = framework.getScrollY();
                }
                // add classes to root element of PhotoSwipe
                var rootClasses = "pswp--open ";
                if (_options.mainClass) {
                    rootClasses += _options.mainClass + " ";
                }
                if (_options.showHideOpacity) {
                    rootClasses += "pswp--animate_opacity ";
                }
                rootClasses += _likelyTouchDevice ? "pswp--touch" : "pswp--notouch";
                rootClasses += _features.animationName ? " pswp--css_animation" : "";
                rootClasses += _features.svg ? " pswp--svg" : "";
                framework.addClass(template, rootClasses);
                self.updateSize();
                // initial update
                _containerShiftIndex = -1;
                _indexDiff = null;
                for (i = 0; i < NUM_HOLDERS; i++) {
                    _setTranslateX((i + _containerShiftIndex) * _slideSize.x, _itemHolders[i].el.style);
                }
                if (!_oldIE) {
                    framework.bind(self.scrollWrap, _downEvents, self);
                }
                _listen("initialZoomInEnd", function() {
                    self.setContent(_itemHolders[0], _currentItemIndex - 1);
                    self.setContent(_itemHolders[2], _currentItemIndex + 1);
                    _itemHolders[0].el.style.display = _itemHolders[2].el.style.display = "block";
                    if (_options.focus) {
                        // focus causes layout, 
                        // which causes lag during the animation, 
                        // that's why we delay it untill the initial zoom transition ends
                        template.focus();
                    }
                    _bindEvents();
                });
                // set content for center slide (first time)
                self.setContent(_itemHolders[1], _currentItemIndex);
                self.updateCurrItem();
                _shout("afterInit");
                if (!_isFixedPosition) {
                    // On all versions of iOS lower than 8.0, we check size of viewport every second.
                    // 
                    // This is done to detect when Safari top & bottom bars appear, 
                    // as this action doesn't trigger any events (like resize). 
                    // 
                    // On iOS8 they fixed this.
                    // 
                    // 10 Nov 2014: iOS 7 usage ~40%. iOS 8 usage 56%.
                    _updateSizeInterval = setInterval(function() {
                        if (!_numAnimations && !_isDragging && !_isZooming && _currZoomLevel === self.currItem.initialZoomLevel) {
                            self.updateSize();
                        }
                    }, 1e3);
                }
                framework.addClass(template, "pswp--visible");
            },
            // Close the gallery, then destroy it
            close: function() {
                if (!_isOpen) {
                    return;
                }
                _isOpen = false;
                _isDestroying = true;
                _shout("close");
                _unbindEvents();
                _showOrHide(self.currItem, null, true, self.destroy);
            },
            // destroys the gallery (unbinds events, cleans up intervals and timeouts to avoid memory leaks)
            destroy: function() {
                _shout("destroy");
                if (_showOrHideTimeout) {
                    clearTimeout(_showOrHideTimeout);
                }
                template.setAttribute("aria-hidden", "true");
                template.className = _initalClassName;
                if (_updateSizeInterval) {
                    clearInterval(_updateSizeInterval);
                }
                framework.unbind(self.scrollWrap, _downEvents, self);
                // we unbind scroll event at the end, as closing animation may depend on it
                framework.unbind(window, "scroll", self);
                _stopDragUpdateLoop();
                _stopAllAnimations();
                _listeners = null;
            },
            /**
	 * Pan image to position
	 * @param {Number} x     
	 * @param {Number} y     
	 * @param {Boolean} force Will ignore bounds if set to true.
	 */
            panTo: function(x, y, force) {
                if (!force) {
                    if (x > _currPanBounds.min.x) {
                        x = _currPanBounds.min.x;
                    } else if (x < _currPanBounds.max.x) {
                        x = _currPanBounds.max.x;
                    }
                    if (y > _currPanBounds.min.y) {
                        y = _currPanBounds.min.y;
                    } else if (y < _currPanBounds.max.y) {
                        y = _currPanBounds.max.y;
                    }
                }
                _panOffset.x = x;
                _panOffset.y = y;
                _applyCurrentZoomPan();
            },
            handleEvent: function(e) {
                e = e || window.event;
                if (_globalEventHandlers[e.type]) {
                    _globalEventHandlers[e.type](e);
                }
            },
            goTo: function(index) {
                index = _getLoopedId(index);
                var diff = index - _currentItemIndex;
                _indexDiff = diff;
                _currentItemIndex = index;
                self.currItem = _getItemAt(_currentItemIndex);
                _currPositionIndex -= diff;
                _moveMainScroll(_slideSize.x * _currPositionIndex);
                _stopAllAnimations();
                _mainScrollAnimating = false;
                self.updateCurrItem();
            },
            next: function() {
                self.goTo(_currentItemIndex + 1);
            },
            prev: function() {
                self.goTo(_currentItemIndex - 1);
            },
            // update current zoom/pan objects
            updateCurrZoomItem: function(emulateSetContent) {
                if (emulateSetContent) {
                    _shout("beforeChange", 0);
                }
                // itemHolder[1] is middle (current) item
                if (_itemHolders[1].el.children.length) {
                    var zoomElement = _itemHolders[1].el.children[0];
                    if (framework.hasClass(zoomElement, "pswp__zoom-wrap")) {
                        _currZoomElementStyle = zoomElement.style;
                    } else {
                        _currZoomElementStyle = null;
                    }
                } else {
                    _currZoomElementStyle = null;
                }
                _currPanBounds = self.currItem.bounds;
                _startZoomLevel = _currZoomLevel = self.currItem.initialZoomLevel;
                _panOffset.x = _currPanBounds.center.x;
                _panOffset.y = _currPanBounds.center.y;
                if (emulateSetContent) {
                    _shout("afterChange");
                }
            },
            invalidateCurrItems: function() {
                _itemsNeedUpdate = true;
                for (var i = 0; i < NUM_HOLDERS; i++) {
                    if (_itemHolders[i].item) {
                        _itemHolders[i].item.needsUpdate = true;
                    }
                }
            },
            updateCurrItem: function(beforeAnimation) {
                if (_indexDiff === 0) {
                    return;
                }
                var diffAbs = Math.abs(_indexDiff), tempHolder;
                if (beforeAnimation && diffAbs < 2) {
                    return;
                }
                self.currItem = _getItemAt(_currentItemIndex);
                _renderMaxResolution = false;
                _shout("beforeChange", _indexDiff);
                if (diffAbs >= NUM_HOLDERS) {
                    _containerShiftIndex += _indexDiff + (_indexDiff > 0 ? -NUM_HOLDERS : NUM_HOLDERS);
                    diffAbs = NUM_HOLDERS;
                }
                for (var i = 0; i < diffAbs; i++) {
                    if (_indexDiff > 0) {
                        tempHolder = _itemHolders.shift();
                        _itemHolders[NUM_HOLDERS - 1] = tempHolder;
                        // move first to last
                        _containerShiftIndex++;
                        _setTranslateX((_containerShiftIndex + 2) * _slideSize.x, tempHolder.el.style);
                        self.setContent(tempHolder, _currentItemIndex - diffAbs + i + 1 + 1);
                    } else {
                        tempHolder = _itemHolders.pop();
                        _itemHolders.unshift(tempHolder);
                        // move last to first
                        _containerShiftIndex--;
                        _setTranslateX(_containerShiftIndex * _slideSize.x, tempHolder.el.style);
                        self.setContent(tempHolder, _currentItemIndex + diffAbs - i - 1 - 1);
                    }
                }
                // reset zoom/pan on previous item
                if (_currZoomElementStyle && Math.abs(_indexDiff) === 1) {
                    var prevItem = _getItemAt(_prevItemIndex);
                    if (prevItem.initialZoomLevel !== _currZoomLevel) {
                        _calculateItemSize(prevItem, _viewportSize);
                        _setImageSize(prevItem);
                        _applyZoomPanToItem(prevItem);
                    }
                }
                // reset diff after update
                _indexDiff = 0;
                self.updateCurrZoomItem();
                _prevItemIndex = _currentItemIndex;
                _shout("afterChange");
            },
            updateSize: function(force) {
                if (!_isFixedPosition && _options.modal) {
                    var windowScrollY = framework.getScrollY();
                    if (_currentWindowScrollY !== windowScrollY) {
                        template.style.top = windowScrollY + "px";
                        _currentWindowScrollY = windowScrollY;
                    }
                    if (!force && _windowVisibleSize.x === window.innerWidth && _windowVisibleSize.y === window.innerHeight) {
                        return;
                    }
                    _windowVisibleSize.x = window.innerWidth;
                    _windowVisibleSize.y = window.innerHeight;
                    //template.style.width = _windowVisibleSize.x + 'px';
                    template.style.height = _windowVisibleSize.y + "px";
                }
                _viewportSize.x = self.scrollWrap.clientWidth;
                _viewportSize.y = self.scrollWrap.clientHeight;
                _updatePageScrollOffset();
                _slideSize.x = _viewportSize.x + Math.round(_viewportSize.x * _options.spacing);
                _slideSize.y = _viewportSize.y;
                _moveMainScroll(_slideSize.x * _currPositionIndex);
                _shout("beforeResize");
                // even may be used for example to switch image sources
                // don't re-calculate size on inital size update
                if (_containerShiftIndex !== undefined) {
                    var holder, item, hIndex;
                    for (var i = 0; i < NUM_HOLDERS; i++) {
                        holder = _itemHolders[i];
                        _setTranslateX((i + _containerShiftIndex) * _slideSize.x, holder.el.style);
                        hIndex = _currentItemIndex + i - 1;
                        if (_options.loop && _getNumItems() > 2) {
                            hIndex = _getLoopedId(hIndex);
                        }
                        // update zoom level on items and refresh source (if needsUpdate)
                        item = _getItemAt(hIndex);
                        // re-render gallery item if `needsUpdate`,
                        // or doesn't have `bounds` (entirely new slide object)
                        if (item && (_itemsNeedUpdate || item.needsUpdate || !item.bounds)) {
                            self.cleanSlide(item);
                            self.setContent(holder, hIndex);
                            // if "center" slide
                            if (i === 1) {
                                self.currItem = item;
                                self.updateCurrZoomItem(true);
                            }
                            item.needsUpdate = false;
                        } else if (holder.index === -1 && hIndex >= 0) {
                            // add content first time
                            self.setContent(holder, hIndex);
                        }
                        if (item && item.container) {
                            _calculateItemSize(item, _viewportSize);
                            _setImageSize(item);
                            _applyZoomPanToItem(item);
                        }
                    }
                    _itemsNeedUpdate = false;
                }
                _startZoomLevel = _currZoomLevel = self.currItem.initialZoomLevel;
                _currPanBounds = self.currItem.bounds;
                if (_currPanBounds) {
                    _panOffset.x = _currPanBounds.center.x;
                    _panOffset.y = _currPanBounds.center.y;
                    _applyCurrentZoomPan(true);
                }
                _shout("resize");
            },
            // Zoom current item to
            zoomTo: function(destZoomLevel, centerPoint, speed, easingFn, updateFn) {
                /*
			if(destZoomLevel === 'fit') {
				destZoomLevel = self.currItem.fitRatio;
			} else if(destZoomLevel === 'fill') {
				destZoomLevel = self.currItem.fillRatio;
			}
		*/
                if (centerPoint) {
                    _startZoomLevel = _currZoomLevel;
                    _midZoomPoint.x = Math.abs(centerPoint.x) - _panOffset.x;
                    _midZoomPoint.y = Math.abs(centerPoint.y) - _panOffset.y;
                    _equalizePoints(_startPanOffset, _panOffset);
                }
                var destPanBounds = _calculatePanBounds(destZoomLevel, false), destPanOffset = {};
                _modifyDestPanOffset("x", destPanBounds, destPanOffset, destZoomLevel);
                _modifyDestPanOffset("y", destPanBounds, destPanOffset, destZoomLevel);
                var initialZoomLevel = _currZoomLevel;
                var initialPanOffset = {
                    x: _panOffset.x,
                    y: _panOffset.y
                };
                _roundPoint(destPanOffset);
                var onUpdate = function(now) {
                    if (now === 1) {
                        _currZoomLevel = destZoomLevel;
                        _panOffset.x = destPanOffset.x;
                        _panOffset.y = destPanOffset.y;
                    } else {
                        _currZoomLevel = (destZoomLevel - initialZoomLevel) * now + initialZoomLevel;
                        _panOffset.x = (destPanOffset.x - initialPanOffset.x) * now + initialPanOffset.x;
                        _panOffset.y = (destPanOffset.y - initialPanOffset.y) * now + initialPanOffset.y;
                    }
                    if (updateFn) {
                        updateFn(now);
                    }
                    _applyCurrentZoomPan(now === 1);
                };
                if (speed) {
                    _animateProp("customZoomTo", 0, 1, speed, easingFn || framework.easing.sine.inOut, onUpdate);
                } else {
                    onUpdate(1);
                }
            }
        };
        /*>>core*/
        /*>>gestures*/
        /**
 * Mouse/touch/pointer event handlers.
 * 
 * separated from @core.js for readability
 */
        var MIN_SWIPE_DISTANCE = 30, DIRECTION_CHECK_OFFSET = 10;
        // amount of pixels to drag to determine direction of swipe
        var _gestureStartTime, _gestureCheckSpeedTime, // pool of objects that are used during dragging of zooming
        p = {}, // first point
        p2 = {}, // second point (for zoom gesture)
        delta = {}, _currPoint = {}, _startPoint = {}, _currPointers = [], _startMainScrollPos = {}, _releaseAnimData, _posPoints = [], // array of points during dragging, used to determine type of gesture
        _tempPoint = {}, _isZoomingIn, _verticalDragInitiated, _oldAndroidTouchEndTimeout, _currZoomedItemIndex = 0, _centerPoint = _getEmptyPoint(), _lastReleaseTime = 0, _isDragging, // at least one pointer is down
        _isMultitouch, // at least two _pointers are down
        _zoomStarted, // zoom level changed during zoom gesture
        _moved, _dragAnimFrame, _mainScrollShifted, _currentPoints, // array of current touch points
        _isZooming, _currPointsDistance, _startPointsDistance, _currPanBounds, _mainScrollPos = _getEmptyPoint(), _currZoomElementStyle, _mainScrollAnimating, // true, if animation after swipe gesture is running
        _midZoomPoint = _getEmptyPoint(), _currCenterPoint = _getEmptyPoint(), _direction, _isFirstMove, _opacityChanged, _bgOpacity, _wasOverInitialZoom, _isEqualPoints = function(p1, p2) {
            return p1.x === p2.x && p1.y === p2.y;
        }, _isNearbyPoints = function(touch0, touch1) {
            return Math.abs(touch0.x - touch1.x) < DOUBLE_TAP_RADIUS && Math.abs(touch0.y - touch1.y) < DOUBLE_TAP_RADIUS;
        }, _calculatePointsDistance = function(p1, p2) {
            _tempPoint.x = Math.abs(p1.x - p2.x);
            _tempPoint.y = Math.abs(p1.y - p2.y);
            return Math.sqrt(_tempPoint.x * _tempPoint.x + _tempPoint.y * _tempPoint.y);
        }, _stopDragUpdateLoop = function() {
            if (_dragAnimFrame) {
                _cancelAF(_dragAnimFrame);
                _dragAnimFrame = null;
            }
        }, _dragUpdateLoop = function() {
            if (_isDragging) {
                _dragAnimFrame = _requestAF(_dragUpdateLoop);
                _renderMovement();
            }
        }, _canPan = function() {
            return !(_options.scaleMode === "fit" && _currZoomLevel === self.currItem.initialZoomLevel);
        }, // find the closest parent DOM element
        _closestElement = function(el, fn) {
            if (!el || el === document) {
                return false;
            }
            // don't search elements above pswp__scroll-wrap
            if (el.getAttribute("class") && el.getAttribute("class").indexOf("pswp__scroll-wrap") > -1) {
                return false;
            }
            if (fn(el)) {
                return el;
            }
            return _closestElement(el.parentNode, fn);
        }, _preventObj = {}, _preventDefaultEventBehaviour = function(e, isDown) {
            _preventObj.prevent = !_closestElement(e.target, _options.isClickableElement);
            _shout("preventDragEvent", e, isDown, _preventObj);
            return _preventObj.prevent;
        }, _convertTouchToPoint = function(touch, p) {
            p.x = touch.pageX;
            p.y = touch.pageY;
            p.id = touch.identifier;
            return p;
        }, _findCenterOfPoints = function(p1, p2, pCenter) {
            pCenter.x = (p1.x + p2.x) * .5;
            pCenter.y = (p1.y + p2.y) * .5;
        }, _pushPosPoint = function(time, x, y) {
            if (time - _gestureCheckSpeedTime > 50) {
                var o = _posPoints.length > 2 ? _posPoints.shift() : {};
                o.x = x;
                o.y = y;
                _posPoints.push(o);
                _gestureCheckSpeedTime = time;
            }
        }, _calculateVerticalDragOpacityRatio = function() {
            var yOffset = _panOffset.y - self.currItem.initialPosition.y;
            // difference between initial and current position
            return 1 - Math.abs(yOffset / (_viewportSize.y / 2));
        }, // points pool, reused during touch events
        _ePoint1 = {}, _ePoint2 = {}, _tempPointsArr = [], _tempCounter, _getTouchPoints = function(e) {
            // clean up previous points, without recreating array
            while (_tempPointsArr.length > 0) {
                _tempPointsArr.pop();
            }
            if (!_pointerEventEnabled) {
                if (e.type.indexOf("touch") > -1) {
                    if (e.touches && e.touches.length > 0) {
                        _tempPointsArr[0] = _convertTouchToPoint(e.touches[0], _ePoint1);
                        if (e.touches.length > 1) {
                            _tempPointsArr[1] = _convertTouchToPoint(e.touches[1], _ePoint2);
                        }
                    }
                } else {
                    _ePoint1.x = e.pageX;
                    _ePoint1.y = e.pageY;
                    _ePoint1.id = "";
                    _tempPointsArr[0] = _ePoint1;
                }
            } else {
                _tempCounter = 0;
                // we can use forEach, as pointer events are supported only in modern browsers
                _currPointers.forEach(function(p) {
                    if (_tempCounter === 0) {
                        _tempPointsArr[0] = p;
                    } else if (_tempCounter === 1) {
                        _tempPointsArr[1] = p;
                    }
                    _tempCounter++;
                });
            }
            return _tempPointsArr;
        }, _panOrMoveMainScroll = function(axis, delta) {
            var panFriction, overDiff = 0, newOffset = _panOffset[axis] + delta[axis], startOverDiff, dir = delta[axis] > 0, newMainScrollPosition = _mainScrollPos.x + delta.x, mainScrollDiff = _mainScrollPos.x - _startMainScrollPos.x, newPanPos, newMainScrollPos;
            // calculate fdistance over the bounds and friction
            if (newOffset > _currPanBounds.min[axis] || newOffset < _currPanBounds.max[axis]) {
                panFriction = _options.panEndFriction;
            } else {
                panFriction = 1;
            }
            newOffset = _panOffset[axis] + delta[axis] * panFriction;
            // move main scroll or start panning
            if (_options.allowPanToNext || _currZoomLevel === self.currItem.initialZoomLevel) {
                if (!_currZoomElementStyle) {
                    newMainScrollPos = newMainScrollPosition;
                } else if (_direction === "h" && axis === "x" && !_zoomStarted) {
                    if (dir) {
                        if (newOffset > _currPanBounds.min[axis]) {
                            panFriction = _options.panEndFriction;
                            overDiff = _currPanBounds.min[axis] - newOffset;
                            startOverDiff = _currPanBounds.min[axis] - _startPanOffset[axis];
                        }
                        // drag right
                        if ((startOverDiff <= 0 || mainScrollDiff < 0) && _getNumItems() > 1) {
                            newMainScrollPos = newMainScrollPosition;
                            if (mainScrollDiff < 0 && newMainScrollPosition > _startMainScrollPos.x) {
                                newMainScrollPos = _startMainScrollPos.x;
                            }
                        } else {
                            if (_currPanBounds.min.x !== _currPanBounds.max.x) {
                                newPanPos = newOffset;
                            }
                        }
                    } else {
                        if (newOffset < _currPanBounds.max[axis]) {
                            panFriction = _options.panEndFriction;
                            overDiff = newOffset - _currPanBounds.max[axis];
                            startOverDiff = _startPanOffset[axis] - _currPanBounds.max[axis];
                        }
                        if ((startOverDiff <= 0 || mainScrollDiff > 0) && _getNumItems() > 1) {
                            newMainScrollPos = newMainScrollPosition;
                            if (mainScrollDiff > 0 && newMainScrollPosition < _startMainScrollPos.x) {
                                newMainScrollPos = _startMainScrollPos.x;
                            }
                        } else {
                            if (_currPanBounds.min.x !== _currPanBounds.max.x) {
                                newPanPos = newOffset;
                            }
                        }
                    }
                }
                if (axis === "x") {
                    if (newMainScrollPos !== undefined) {
                        _moveMainScroll(newMainScrollPos, true);
                        if (newMainScrollPos === _startMainScrollPos.x) {
                            _mainScrollShifted = false;
                        } else {
                            _mainScrollShifted = true;
                        }
                    }
                    if (_currPanBounds.min.x !== _currPanBounds.max.x) {
                        if (newPanPos !== undefined) {
                            _panOffset.x = newPanPos;
                        } else if (!_mainScrollShifted) {
                            _panOffset.x += delta.x * panFriction;
                        }
                    }
                    return newMainScrollPos !== undefined;
                }
            }
            if (!_mainScrollAnimating) {
                if (!_mainScrollShifted) {
                    if (_currZoomLevel > self.currItem.fitRatio) {
                        _panOffset[axis] += delta[axis] * panFriction;
                    }
                }
            }
        }, // Pointerdown/touchstart/mousedown handler
        _onDragStart = function(e) {
            // Allow dragging only via left mouse button.
            // As this handler is not added in IE8 - we ignore e.which
            // 
            // http://www.quirksmode.org/js/events_properties.html
            // https://developer.mozilla.org/en-US/docs/Web/API/event.button
            if (e.type === "mousedown" && e.button > 0) {
                return;
            }
            if (_initialZoomRunning) {
                e.preventDefault();
                return;
            }
            if (_oldAndroidTouchEndTimeout && e.type === "mousedown") {
                return;
            }
            if (_preventDefaultEventBehaviour(e, true)) {
                e.preventDefault();
            }
            _shout("pointerDown");
            if (_pointerEventEnabled) {
                var pointerIndex = framework.arraySearch(_currPointers, e.pointerId, "id");
                if (pointerIndex < 0) {
                    pointerIndex = _currPointers.length;
                }
                _currPointers[pointerIndex] = {
                    x: e.pageX,
                    y: e.pageY,
                    id: e.pointerId
                };
            }
            var startPointsList = _getTouchPoints(e), numPoints = startPointsList.length;
            _currentPoints = null;
            _stopAllAnimations();
            // init drag
            if (!_isDragging || numPoints === 1) {
                _isDragging = _isFirstMove = true;
                framework.bind(window, _upMoveEvents, self);
                _isZoomingIn = _wasOverInitialZoom = _opacityChanged = _verticalDragInitiated = _mainScrollShifted = _moved = _isMultitouch = _zoomStarted = false;
                _direction = null;
                _shout("firstTouchStart", startPointsList);
                _equalizePoints(_startPanOffset, _panOffset);
                _currPanDist.x = _currPanDist.y = 0;
                _equalizePoints(_currPoint, startPointsList[0]);
                _equalizePoints(_startPoint, _currPoint);
                //_equalizePoints(_startMainScrollPos, _mainScrollPos);
                _startMainScrollPos.x = _slideSize.x * _currPositionIndex;
                _posPoints = [ {
                    x: _currPoint.x,
                    y: _currPoint.y
                } ];
                _gestureCheckSpeedTime = _gestureStartTime = _getCurrentTime();
                //_mainScrollAnimationEnd(true);
                _calculatePanBounds(_currZoomLevel, true);
                // Start rendering
                _stopDragUpdateLoop();
                _dragUpdateLoop();
            }
            // init zoom
            if (!_isZooming && numPoints > 1 && !_mainScrollAnimating && !_mainScrollShifted) {
                _startZoomLevel = _currZoomLevel;
                _zoomStarted = false;
                // true if zoom changed at least once
                _isZooming = _isMultitouch = true;
                _currPanDist.y = _currPanDist.x = 0;
                _equalizePoints(_startPanOffset, _panOffset);
                _equalizePoints(p, startPointsList[0]);
                _equalizePoints(p2, startPointsList[1]);
                _findCenterOfPoints(p, p2, _currCenterPoint);
                _midZoomPoint.x = Math.abs(_currCenterPoint.x) - _panOffset.x;
                _midZoomPoint.y = Math.abs(_currCenterPoint.y) - _panOffset.y;
                _currPointsDistance = _startPointsDistance = _calculatePointsDistance(p, p2);
            }
        }, // Pointermove/touchmove/mousemove handler
        _onDragMove = function(e) {
            e.preventDefault();
            if (_pointerEventEnabled) {
                var pointerIndex = framework.arraySearch(_currPointers, e.pointerId, "id");
                if (pointerIndex > -1) {
                    var p = _currPointers[pointerIndex];
                    p.x = e.pageX;
                    p.y = e.pageY;
                }
            }
            if (_isDragging) {
                var touchesList = _getTouchPoints(e);
                if (!_direction && !_moved && !_isZooming) {
                    if (_mainScrollPos.x !== _slideSize.x * _currPositionIndex) {
                        // if main scroll position is shifted – direction is always horizontal
                        _direction = "h";
                    } else {
                        var diff = Math.abs(touchesList[0].x - _currPoint.x) - Math.abs(touchesList[0].y - _currPoint.y);
                        // check the direction of movement
                        if (Math.abs(diff) >= DIRECTION_CHECK_OFFSET) {
                            _direction = diff > 0 ? "h" : "v";
                            _currentPoints = touchesList;
                        }
                    }
                } else {
                    _currentPoints = touchesList;
                }
            }
        }, // 
        _renderMovement = function() {
            if (!_currentPoints) {
                return;
            }
            var numPoints = _currentPoints.length;
            if (numPoints === 0) {
                return;
            }
            _equalizePoints(p, _currentPoints[0]);
            delta.x = p.x - _currPoint.x;
            delta.y = p.y - _currPoint.y;
            if (_isZooming && numPoints > 1) {
                // Handle behaviour for more than 1 point
                _currPoint.x = p.x;
                _currPoint.y = p.y;
                // check if one of two points changed
                if (!delta.x && !delta.y && _isEqualPoints(_currentPoints[1], p2)) {
                    return;
                }
                _equalizePoints(p2, _currentPoints[1]);
                if (!_zoomStarted) {
                    _zoomStarted = true;
                    _shout("zoomGestureStarted");
                }
                // Distance between two points
                var pointsDistance = _calculatePointsDistance(p, p2);
                var zoomLevel = _calculateZoomLevel(pointsDistance);
                // slightly over the of initial zoom level
                if (zoomLevel > self.currItem.initialZoomLevel + self.currItem.initialZoomLevel / 15) {
                    _wasOverInitialZoom = true;
                }
                // Apply the friction if zoom level is out of the bounds
                var zoomFriction = 1, minZoomLevel = _getMinZoomLevel(), maxZoomLevel = _getMaxZoomLevel();
                if (zoomLevel < minZoomLevel) {
                    if (_options.pinchToClose && !_wasOverInitialZoom && _startZoomLevel <= self.currItem.initialZoomLevel) {
                        // fade out background if zooming out
                        var minusDiff = minZoomLevel - zoomLevel;
                        var percent = 1 - minusDiff / (minZoomLevel / 1.2);
                        _applyBgOpacity(percent);
                        _shout("onPinchClose", percent);
                        _opacityChanged = true;
                    } else {
                        zoomFriction = (minZoomLevel - zoomLevel) / minZoomLevel;
                        if (zoomFriction > 1) {
                            zoomFriction = 1;
                        }
                        zoomLevel = minZoomLevel - zoomFriction * (minZoomLevel / 3);
                    }
                } else if (zoomLevel > maxZoomLevel) {
                    // 1.5 - extra zoom level above the max. E.g. if max is x6, real max 6 + 1.5 = 7.5
                    zoomFriction = (zoomLevel - maxZoomLevel) / (minZoomLevel * 6);
                    if (zoomFriction > 1) {
                        zoomFriction = 1;
                    }
                    zoomLevel = maxZoomLevel + zoomFriction * minZoomLevel;
                }
                if (zoomFriction < 0) {
                    zoomFriction = 0;
                }
                // distance between touch points after friction is applied
                _currPointsDistance = pointsDistance;
                // _centerPoint - The point in the middle of two pointers
                _findCenterOfPoints(p, p2, _centerPoint);
                // paning with two pointers pressed
                _currPanDist.x += _centerPoint.x - _currCenterPoint.x;
                _currPanDist.y += _centerPoint.y - _currCenterPoint.y;
                _equalizePoints(_currCenterPoint, _centerPoint);
                _panOffset.x = _calculatePanOffset("x", zoomLevel);
                _panOffset.y = _calculatePanOffset("y", zoomLevel);
                _isZoomingIn = zoomLevel > _currZoomLevel;
                _currZoomLevel = zoomLevel;
                _applyCurrentZoomPan();
            } else {
                // handle behaviour for one point (dragging or panning)
                if (!_direction) {
                    return;
                }
                if (_isFirstMove) {
                    _isFirstMove = false;
                    // subtract drag distance that was used during the detection direction  
                    if (Math.abs(delta.x) >= DIRECTION_CHECK_OFFSET) {
                        delta.x -= _currentPoints[0].x - _startPoint.x;
                    }
                    if (Math.abs(delta.y) >= DIRECTION_CHECK_OFFSET) {
                        delta.y -= _currentPoints[0].y - _startPoint.y;
                    }
                }
                _currPoint.x = p.x;
                _currPoint.y = p.y;
                // do nothing if pointers position hasn't changed
                if (delta.x === 0 && delta.y === 0) {
                    return;
                }
                if (_direction === "v" && _options.closeOnVerticalDrag) {
                    if (!_canPan()) {
                        _currPanDist.y += delta.y;
                        _panOffset.y += delta.y;
                        var opacityRatio = _calculateVerticalDragOpacityRatio();
                        _verticalDragInitiated = true;
                        _shout("onVerticalDrag", opacityRatio);
                        _applyBgOpacity(opacityRatio);
                        _applyCurrentZoomPan();
                        return;
                    }
                }
                _pushPosPoint(_getCurrentTime(), p.x, p.y);
                _moved = true;
                _currPanBounds = self.currItem.bounds;
                var mainScrollChanged = _panOrMoveMainScroll("x", delta);
                if (!mainScrollChanged) {
                    _panOrMoveMainScroll("y", delta);
                    _roundPoint(_panOffset);
                    _applyCurrentZoomPan();
                }
            }
        }, // Pointerup/pointercancel/touchend/touchcancel/mouseup event handler
        _onDragRelease = function(e) {
            if (_features.isOldAndroid) {
                if (_oldAndroidTouchEndTimeout && e.type === "mouseup") {
                    return;
                }
                // on Android (v4.1, 4.2, 4.3 & possibly older) 
                // ghost mousedown/up event isn't preventable via e.preventDefault,
                // which causes fake mousedown event
                // so we block mousedown/up for 600ms
                if (e.type.indexOf("touch") > -1) {
                    clearTimeout(_oldAndroidTouchEndTimeout);
                    _oldAndroidTouchEndTimeout = setTimeout(function() {
                        _oldAndroidTouchEndTimeout = 0;
                    }, 600);
                }
            }
            _shout("pointerUp");
            if (_preventDefaultEventBehaviour(e, false)) {
                e.preventDefault();
            }
            var releasePoint;
            if (_pointerEventEnabled) {
                var pointerIndex = framework.arraySearch(_currPointers, e.pointerId, "id");
                if (pointerIndex > -1) {
                    releasePoint = _currPointers.splice(pointerIndex, 1)[0];
                    if (navigator.pointerEnabled) {
                        releasePoint.type = e.pointerType || "mouse";
                    } else {
                        var MSPOINTER_TYPES = {
                            4: "mouse",
                            // event.MSPOINTER_TYPE_MOUSE
                            2: "touch",
                            // event.MSPOINTER_TYPE_TOUCH 
                            3: "pen"
                        };
                        releasePoint.type = MSPOINTER_TYPES[e.pointerType];
                        if (!releasePoint.type) {
                            releasePoint.type = e.pointerType || "mouse";
                        }
                    }
                }
            }
            var touchList = _getTouchPoints(e), gestureType, numPoints = touchList.length;
            if (e.type === "mouseup") {
                numPoints = 0;
            }
            // Do nothing if there were 3 touch points or more
            if (numPoints === 2) {
                _currentPoints = null;
                return true;
            }
            // if second pointer released
            if (numPoints === 1) {
                _equalizePoints(_startPoint, touchList[0]);
            }
            // pointer hasn't moved, send "tap release" point
            if (numPoints === 0 && !_direction && !_mainScrollAnimating) {
                if (!releasePoint) {
                    if (e.type === "mouseup") {
                        releasePoint = {
                            x: e.pageX,
                            y: e.pageY,
                            type: "mouse"
                        };
                    } else if (e.changedTouches && e.changedTouches[0]) {
                        releasePoint = {
                            x: e.changedTouches[0].pageX,
                            y: e.changedTouches[0].pageY,
                            type: "touch"
                        };
                    }
                }
                _shout("touchRelease", e, releasePoint);
            }
            // Difference in time between releasing of two last touch points (zoom gesture)
            var releaseTimeDiff = -1;
            // Gesture completed, no pointers left
            if (numPoints === 0) {
                _isDragging = false;
                framework.unbind(window, _upMoveEvents, self);
                _stopDragUpdateLoop();
                if (_isZooming) {
                    // Two points released at the same time
                    releaseTimeDiff = 0;
                } else if (_lastReleaseTime !== -1) {
                    releaseTimeDiff = _getCurrentTime() - _lastReleaseTime;
                }
            }
            _lastReleaseTime = numPoints === 1 ? _getCurrentTime() : -1;
            if (releaseTimeDiff !== -1 && releaseTimeDiff < 150) {
                gestureType = "zoom";
            } else {
                gestureType = "swipe";
            }
            if (_isZooming && numPoints < 2) {
                _isZooming = false;
                // Only second point released
                if (numPoints === 1) {
                    gestureType = "zoomPointerUp";
                }
                _shout("zoomGestureEnded");
            }
            _currentPoints = null;
            if (!_moved && !_zoomStarted && !_mainScrollAnimating && !_verticalDragInitiated) {
                // nothing to animate
                return;
            }
            _stopAllAnimations();
            if (!_releaseAnimData) {
                _releaseAnimData = _initDragReleaseAnimationData();
            }
            _releaseAnimData.calculateSwipeSpeed("x");
            if (_verticalDragInitiated) {
                var opacityRatio = _calculateVerticalDragOpacityRatio();
                if (opacityRatio < _options.verticalDragRange) {
                    self.close();
                } else {
                    var initalPanY = _panOffset.y, initialBgOpacity = _bgOpacity;
                    _animateProp("verticalDrag", 0, 1, 300, framework.easing.cubic.out, function(now) {
                        _panOffset.y = (self.currItem.initialPosition.y - initalPanY) * now + initalPanY;
                        _applyBgOpacity((1 - initialBgOpacity) * now + initialBgOpacity);
                        _applyCurrentZoomPan();
                    });
                    _shout("onVerticalDrag", 1);
                }
                return;
            }
            // main scroll 
            if ((_mainScrollShifted || _mainScrollAnimating) && numPoints === 0) {
                var itemChanged = _finishSwipeMainScrollGesture(gestureType, _releaseAnimData);
                if (itemChanged) {
                    return;
                }
                gestureType = "zoomPointerUp";
            }
            // prevent zoom/pan animation when main scroll animation runs
            if (_mainScrollAnimating) {
                return;
            }
            // Complete simple zoom gesture (reset zoom level if it's out of the bounds)  
            if (gestureType !== "swipe") {
                _completeZoomGesture();
                return;
            }
            // Complete pan gesture if main scroll is not shifted, and it's possible to pan current image
            if (!_mainScrollShifted && _currZoomLevel > self.currItem.fitRatio) {
                _completePanGesture(_releaseAnimData);
            }
        }, // Returns object with data about gesture
        // It's created only once and then reused
        _initDragReleaseAnimationData = function() {
            // temp local vars
            var lastFlickDuration, tempReleasePos;
            // s = this
            var s = {
                lastFlickOffset: {},
                lastFlickDist: {},
                lastFlickSpeed: {},
                slowDownRatio: {},
                slowDownRatioReverse: {},
                speedDecelerationRatio: {},
                speedDecelerationRatioAbs: {},
                distanceOffset: {},
                backAnimDestination: {},
                backAnimStarted: {},
                calculateSwipeSpeed: function(axis) {
                    if (_posPoints.length > 1) {
                        lastFlickDuration = _getCurrentTime() - _gestureCheckSpeedTime + 50;
                        tempReleasePos = _posPoints[_posPoints.length - 2][axis];
                    } else {
                        lastFlickDuration = _getCurrentTime() - _gestureStartTime;
                        // total gesture duration
                        tempReleasePos = _startPoint[axis];
                    }
                    s.lastFlickOffset[axis] = _currPoint[axis] - tempReleasePos;
                    s.lastFlickDist[axis] = Math.abs(s.lastFlickOffset[axis]);
                    if (s.lastFlickDist[axis] > 20) {
                        s.lastFlickSpeed[axis] = s.lastFlickOffset[axis] / lastFlickDuration;
                    } else {
                        s.lastFlickSpeed[axis] = 0;
                    }
                    if (Math.abs(s.lastFlickSpeed[axis]) < .1) {
                        s.lastFlickSpeed[axis] = 0;
                    }
                    s.slowDownRatio[axis] = .95;
                    s.slowDownRatioReverse[axis] = 1 - s.slowDownRatio[axis];
                    s.speedDecelerationRatio[axis] = 1;
                },
                calculateOverBoundsAnimOffset: function(axis, speed) {
                    if (!s.backAnimStarted[axis]) {
                        if (_panOffset[axis] > _currPanBounds.min[axis]) {
                            s.backAnimDestination[axis] = _currPanBounds.min[axis];
                        } else if (_panOffset[axis] < _currPanBounds.max[axis]) {
                            s.backAnimDestination[axis] = _currPanBounds.max[axis];
                        }
                        if (s.backAnimDestination[axis] !== undefined) {
                            s.slowDownRatio[axis] = .7;
                            s.slowDownRatioReverse[axis] = 1 - s.slowDownRatio[axis];
                            if (s.speedDecelerationRatioAbs[axis] < .05) {
                                s.lastFlickSpeed[axis] = 0;
                                s.backAnimStarted[axis] = true;
                                _animateProp("bounceZoomPan" + axis, _panOffset[axis], s.backAnimDestination[axis], speed || 300, framework.easing.sine.out, function(pos) {
                                    _panOffset[axis] = pos;
                                    _applyCurrentZoomPan();
                                });
                            }
                        }
                    }
                },
                // Reduces the speed by slowDownRatio (per 10ms)
                calculateAnimOffset: function(axis) {
                    if (!s.backAnimStarted[axis]) {
                        s.speedDecelerationRatio[axis] = s.speedDecelerationRatio[axis] * (s.slowDownRatio[axis] + s.slowDownRatioReverse[axis] - s.slowDownRatioReverse[axis] * s.timeDiff / 10);
                        s.speedDecelerationRatioAbs[axis] = Math.abs(s.lastFlickSpeed[axis] * s.speedDecelerationRatio[axis]);
                        s.distanceOffset[axis] = s.lastFlickSpeed[axis] * s.speedDecelerationRatio[axis] * s.timeDiff;
                        _panOffset[axis] += s.distanceOffset[axis];
                    }
                },
                panAnimLoop: function() {
                    if (_animations.zoomPan) {
                        _animations.zoomPan.raf = _requestAF(s.panAnimLoop);
                        s.now = _getCurrentTime();
                        s.timeDiff = s.now - s.lastNow;
                        s.lastNow = s.now;
                        s.calculateAnimOffset("x");
                        s.calculateAnimOffset("y");
                        _applyCurrentZoomPan();
                        s.calculateOverBoundsAnimOffset("x");
                        s.calculateOverBoundsAnimOffset("y");
                        if (s.speedDecelerationRatioAbs.x < .05 && s.speedDecelerationRatioAbs.y < .05) {
                            // round pan position
                            _panOffset.x = Math.round(_panOffset.x);
                            _panOffset.y = Math.round(_panOffset.y);
                            _applyCurrentZoomPan();
                            _stopAnimation("zoomPan");
                            return;
                        }
                    }
                }
            };
            return s;
        }, _completePanGesture = function(animData) {
            // calculate swipe speed for Y axis (paanning)
            animData.calculateSwipeSpeed("y");
            _currPanBounds = self.currItem.bounds;
            animData.backAnimDestination = {};
            animData.backAnimStarted = {};
            // Avoid acceleration animation if speed is too low
            if (Math.abs(animData.lastFlickSpeed.x) <= .05 && Math.abs(animData.lastFlickSpeed.y) <= .05) {
                animData.speedDecelerationRatioAbs.x = animData.speedDecelerationRatioAbs.y = 0;
                // Run pan drag release animation. E.g. if you drag image and release finger without momentum.
                animData.calculateOverBoundsAnimOffset("x");
                animData.calculateOverBoundsAnimOffset("y");
                return true;
            }
            // Animation loop that controls the acceleration after pan gesture ends
            _registerStartAnimation("zoomPan");
            animData.lastNow = _getCurrentTime();
            animData.panAnimLoop();
        }, _finishSwipeMainScrollGesture = function(gestureType, _releaseAnimData) {
            var itemChanged;
            if (!_mainScrollAnimating) {
                _currZoomedItemIndex = _currentItemIndex;
            }
            var itemsDiff;
            if (gestureType === "swipe") {
                var totalShiftDist = _currPoint.x - _startPoint.x, isFastLastFlick = _releaseAnimData.lastFlickDist.x < 10;
                // if container is shifted for more than MIN_SWIPE_DISTANCE, 
                // and last flick gesture was in right direction
                if (totalShiftDist > MIN_SWIPE_DISTANCE && (isFastLastFlick || _releaseAnimData.lastFlickOffset.x > 20)) {
                    // go to prev item
                    itemsDiff = -1;
                } else if (totalShiftDist < -MIN_SWIPE_DISTANCE && (isFastLastFlick || _releaseAnimData.lastFlickOffset.x < -20)) {
                    // go to next item
                    itemsDiff = 1;
                }
            }
            var nextCircle;
            if (itemsDiff) {
                _currentItemIndex += itemsDiff;
                if (_currentItemIndex < 0) {
                    _currentItemIndex = _options.loop ? _getNumItems() - 1 : 0;
                    nextCircle = true;
                } else if (_currentItemIndex >= _getNumItems()) {
                    _currentItemIndex = _options.loop ? 0 : _getNumItems() - 1;
                    nextCircle = true;
                }
                if (!nextCircle || _options.loop) {
                    _indexDiff += itemsDiff;
                    _currPositionIndex -= itemsDiff;
                    itemChanged = true;
                }
            }
            var animateToX = _slideSize.x * _currPositionIndex;
            var animateToDist = Math.abs(animateToX - _mainScrollPos.x);
            var finishAnimDuration;
            if (!itemChanged && animateToX > _mainScrollPos.x !== _releaseAnimData.lastFlickSpeed.x > 0) {
                // "return to current" duration, e.g. when dragging from slide 0 to -1
                finishAnimDuration = 333;
            } else {
                finishAnimDuration = Math.abs(_releaseAnimData.lastFlickSpeed.x) > 0 ? animateToDist / Math.abs(_releaseAnimData.lastFlickSpeed.x) : 333;
                finishAnimDuration = Math.min(finishAnimDuration, 400);
                finishAnimDuration = Math.max(finishAnimDuration, 250);
            }
            if (_currZoomedItemIndex === _currentItemIndex) {
                itemChanged = false;
            }
            _mainScrollAnimating = true;
            _shout("mainScrollAnimStart");
            _animateProp("mainScroll", _mainScrollPos.x, animateToX, finishAnimDuration, framework.easing.cubic.out, _moveMainScroll, function() {
                _stopAllAnimations();
                _mainScrollAnimating = false;
                _currZoomedItemIndex = -1;
                if (itemChanged || _currZoomedItemIndex !== _currentItemIndex) {
                    self.updateCurrItem();
                }
                _shout("mainScrollAnimComplete");
            });
            if (itemChanged) {
                self.updateCurrItem(true);
            }
            return itemChanged;
        }, _calculateZoomLevel = function(touchesDistance) {
            return 1 / _startPointsDistance * touchesDistance * _startZoomLevel;
        }, // Resets zoom if it's out of bounds
        _completeZoomGesture = function() {
            var destZoomLevel = _currZoomLevel, minZoomLevel = _getMinZoomLevel(), maxZoomLevel = _getMaxZoomLevel();
            if (_currZoomLevel < minZoomLevel) {
                destZoomLevel = minZoomLevel;
            } else if (_currZoomLevel > maxZoomLevel) {
                destZoomLevel = maxZoomLevel;
            }
            var destOpacity = 1, onUpdate, initialOpacity = _bgOpacity;
            if (_opacityChanged && !_isZoomingIn && !_wasOverInitialZoom && _currZoomLevel < minZoomLevel) {
                //_closedByScroll = true;
                self.close();
                return true;
            }
            if (_opacityChanged) {
                onUpdate = function(now) {
                    _applyBgOpacity((destOpacity - initialOpacity) * now + initialOpacity);
                };
            }
            self.zoomTo(destZoomLevel, 0, 200, framework.easing.cubic.out, onUpdate);
            return true;
        };
        _registerModule("Gestures", {
            publicMethods: {
                initGestures: function() {
                    // helper function that builds touch/pointer/mouse events
                    var addEventNames = function(pref, down, move, up, cancel) {
                        _dragStartEvent = pref + down;
                        _dragMoveEvent = pref + move;
                        _dragEndEvent = pref + up;
                        if (cancel) {
                            _dragCancelEvent = pref + cancel;
                        } else {
                            _dragCancelEvent = "";
                        }
                    };
                    _pointerEventEnabled = _features.pointerEvent;
                    if (_pointerEventEnabled && _features.touch) {
                        // we don't need touch events, if browser supports pointer events
                        _features.touch = false;
                    }
                    if (_pointerEventEnabled) {
                        if (navigator.pointerEnabled) {
                            addEventNames("pointer", "down", "move", "up", "cancel");
                        } else {
                            // IE10 pointer events are case-sensitive
                            addEventNames("MSPointer", "Down", "Move", "Up", "Cancel");
                        }
                    } else if (_features.touch) {
                        addEventNames("touch", "start", "move", "end", "cancel");
                        _likelyTouchDevice = true;
                    } else {
                        addEventNames("mouse", "down", "move", "up");
                    }
                    _upMoveEvents = _dragMoveEvent + " " + _dragEndEvent + " " + _dragCancelEvent;
                    _downEvents = _dragStartEvent;
                    if (_pointerEventEnabled && !_likelyTouchDevice) {
                        _likelyTouchDevice = navigator.maxTouchPoints > 1 || navigator.msMaxTouchPoints > 1;
                    }
                    // make variable public
                    self.likelyTouchDevice = _likelyTouchDevice;
                    _globalEventHandlers[_dragStartEvent] = _onDragStart;
                    _globalEventHandlers[_dragMoveEvent] = _onDragMove;
                    _globalEventHandlers[_dragEndEvent] = _onDragRelease;
                    // the Kraken
                    if (_dragCancelEvent) {
                        _globalEventHandlers[_dragCancelEvent] = _globalEventHandlers[_dragEndEvent];
                    }
                    // Bind mouse events on device with detected hardware touch support, in case it supports multiple types of input.
                    if (_features.touch) {
                        _downEvents += " mousedown";
                        _upMoveEvents += " mousemove mouseup";
                        _globalEventHandlers.mousedown = _globalEventHandlers[_dragStartEvent];
                        _globalEventHandlers.mousemove = _globalEventHandlers[_dragMoveEvent];
                        _globalEventHandlers.mouseup = _globalEventHandlers[_dragEndEvent];
                    }
                    if (!_likelyTouchDevice) {
                        // don't allow pan to next slide from zoomed state on Desktop
                        _options.allowPanToNext = false;
                    }
                }
            }
        });
        /*>>gestures*/
        /*>>show-hide-transition*/
        /**
 * show-hide-transition.js:
 *
 * Manages initial opening or closing transition.
 *
 * If you're not planning to use transition for gallery at all,
 * you may set options hideAnimationDuration and showAnimationDuration to 0,
 * and just delete startAnimation function.
 * 
 */
        var _showOrHideTimeout, _showOrHide = function(item, img, out, completeFn) {
            if (_showOrHideTimeout) {
                clearTimeout(_showOrHideTimeout);
            }
            _initialZoomRunning = true;
            _initialContentSet = true;
            // dimensions of small thumbnail {x:,y:,w:}.
            // Height is optional, as calculated based on large image.
            var thumbBounds;
            if (item.initialLayout) {
                thumbBounds = item.initialLayout;
                item.initialLayout = null;
            } else {
                thumbBounds = _options.getThumbBoundsFn && _options.getThumbBoundsFn(_currentItemIndex);
            }
            var duration = out ? _options.hideAnimationDuration : _options.showAnimationDuration;
            var onComplete = function() {
                _stopAnimation("initialZoom");
                if (!out) {
                    _applyBgOpacity(1);
                    if (img) {
                        img.style.display = "block";
                    }
                    framework.addClass(template, "pswp--animated-in");
                    _shout("initialZoom" + (out ? "OutEnd" : "InEnd"));
                } else {
                    self.template.removeAttribute("style");
                    self.bg.removeAttribute("style");
                }
                if (completeFn) {
                    completeFn();
                }
                _initialZoomRunning = false;
            };
            // if bounds aren't provided, just open gallery without animation
            if (!duration || !thumbBounds || thumbBounds.x === undefined) {
                _shout("initialZoom" + (out ? "Out" : "In"));
                _currZoomLevel = item.initialZoomLevel;
                _equalizePoints(_panOffset, item.initialPosition);
                _applyCurrentZoomPan();
                template.style.opacity = out ? 0 : 1;
                _applyBgOpacity(1);
                if (duration) {
                    setTimeout(function() {
                        onComplete();
                    }, duration);
                } else {
                    onComplete();
                }
                return;
            }
            var startAnimation = function() {
                var closeWithRaf = _closedByScroll, fadeEverything = !self.currItem.src || self.currItem.loadError || _options.showHideOpacity;
                // apply hw-acceleration to image
                if (item.miniImg) {
                    item.miniImg.style.webkitBackfaceVisibility = "hidden";
                }
                if (!out) {
                    _currZoomLevel = thumbBounds.w / item.w;
                    _panOffset.x = thumbBounds.x;
                    _panOffset.y = thumbBounds.y - _initalWindowScrollY;
                    self[fadeEverything ? "template" : "bg"].style.opacity = .001;
                    _applyCurrentZoomPan();
                }
                _registerStartAnimation("initialZoom");
                if (out && !closeWithRaf) {
                    framework.removeClass(template, "pswp--animated-in");
                }
                if (fadeEverything) {
                    if (out) {
                        framework[(closeWithRaf ? "remove" : "add") + "Class"](template, "pswp--animate_opacity");
                    } else {
                        setTimeout(function() {
                            framework.addClass(template, "pswp--animate_opacity");
                        }, 30);
                    }
                }
                _showOrHideTimeout = setTimeout(function() {
                    _shout("initialZoom" + (out ? "Out" : "In"));
                    if (!out) {
                        // "in" animation always uses CSS transitions (instead of rAF).
                        // CSS transition work faster here, 
                        // as developer may also want to animate other things, 
                        // like ui on top of sliding area, which can be animated just via CSS
                        _currZoomLevel = item.initialZoomLevel;
                        _equalizePoints(_panOffset, item.initialPosition);
                        _applyCurrentZoomPan();
                        _applyBgOpacity(1);
                        if (fadeEverything) {
                            template.style.opacity = 1;
                        } else {
                            _applyBgOpacity(1);
                        }
                        _showOrHideTimeout = setTimeout(onComplete, duration + 20);
                    } else {
                        // "out" animation uses rAF only when PhotoSwipe is closed by browser scroll, to recalculate position
                        var destZoomLevel = thumbBounds.w / item.w, initialPanOffset = {
                            x: _panOffset.x,
                            y: _panOffset.y
                        }, initialZoomLevel = _currZoomLevel, initalBgOpacity = _bgOpacity, onUpdate = function(now) {
                            if (now === 1) {
                                _currZoomLevel = destZoomLevel;
                                _panOffset.x = thumbBounds.x;
                                _panOffset.y = thumbBounds.y - _currentWindowScrollY;
                            } else {
                                _currZoomLevel = (destZoomLevel - initialZoomLevel) * now + initialZoomLevel;
                                _panOffset.x = (thumbBounds.x - initialPanOffset.x) * now + initialPanOffset.x;
                                _panOffset.y = (thumbBounds.y - _currentWindowScrollY - initialPanOffset.y) * now + initialPanOffset.y;
                            }
                            _applyCurrentZoomPan();
                            if (fadeEverything) {
                                template.style.opacity = 1 - now;
                            } else {
                                _applyBgOpacity(initalBgOpacity - now * initalBgOpacity);
                            }
                        };
                        if (closeWithRaf) {
                            _animateProp("initialZoom", 0, 1, duration, framework.easing.cubic.out, onUpdate, onComplete);
                        } else {
                            onUpdate(1);
                            _showOrHideTimeout = setTimeout(onComplete, duration + 20);
                        }
                    }
                }, out ? 25 : 90);
            };
            startAnimation();
        };
        /*>>show-hide-transition*/
        /*>>items-controller*/
        /**
*
* Controller manages gallery items, their dimensions, and their content.
* 
*/
        var _items, _tempPanAreaSize = {}, _imagesToAppendPool = [], _initialContentSet, _initialZoomRunning, _controllerDefaultOptions = {
            index: 0,
            errorMsg: '<div class="pswp__error-msg"><a href="%url%" target="_blank">The image</a> could not be loaded.</div>',
            forceProgressiveLoading: false,
            // TODO
            preload: [ 1, 1 ],
            getNumItemsFn: function() {
                return _items.length;
            }
        };
        var _getItemAt, _getNumItems, _initialIsLoop, _getZeroBounds = function() {
            return {
                center: {
                    x: 0,
                    y: 0
                },
                max: {
                    x: 0,
                    y: 0
                },
                min: {
                    x: 0,
                    y: 0
                }
            };
        }, _calculateSingleItemPanBounds = function(item, realPanElementW, realPanElementH) {
            var bounds = item.bounds;
            // position of element when it's centered
            bounds.center.x = Math.round((_tempPanAreaSize.x - realPanElementW) / 2);
            bounds.center.y = Math.round((_tempPanAreaSize.y - realPanElementH) / 2) + item.vGap.top;
            // maximum pan position
            bounds.max.x = realPanElementW > _tempPanAreaSize.x ? Math.round(_tempPanAreaSize.x - realPanElementW) : bounds.center.x;
            bounds.max.y = realPanElementH > _tempPanAreaSize.y ? Math.round(_tempPanAreaSize.y - realPanElementH) + item.vGap.top : bounds.center.y;
            // minimum pan position
            bounds.min.x = realPanElementW > _tempPanAreaSize.x ? 0 : bounds.center.x;
            bounds.min.y = realPanElementH > _tempPanAreaSize.y ? item.vGap.top : bounds.center.y;
        }, _calculateItemSize = function(item, viewportSize, zoomLevel) {
            if (item.src && !item.loadError) {
                var isInitial = !zoomLevel;
                if (isInitial) {
                    if (!item.vGap) {
                        item.vGap = {
                            top: 0,
                            bottom: 0
                        };
                    }
                    // allows overriding vertical margin for individual items
                    _shout("parseVerticalMargin", item);
                }
                _tempPanAreaSize.x = viewportSize.x;
                _tempPanAreaSize.y = viewportSize.y - item.vGap.top - item.vGap.bottom;
                if (isInitial) {
                    var hRatio = _tempPanAreaSize.x / item.w;
                    var vRatio = _tempPanAreaSize.y / item.h;
                    item.fitRatio = hRatio < vRatio ? hRatio : vRatio;
                    //item.fillRatio = hRatio > vRatio ? hRatio : vRatio;
                    var scaleMode = _options.scaleMode;
                    if (scaleMode === "orig") {
                        zoomLevel = 1;
                    } else if (scaleMode === "fit") {
                        zoomLevel = item.fitRatio;
                    }
                    if (zoomLevel > 1) {
                        zoomLevel = 1;
                    }
                    item.initialZoomLevel = zoomLevel;
                    if (!item.bounds) {
                        // reuse bounds object
                        item.bounds = _getZeroBounds();
                    }
                }
                if (!zoomLevel) {
                    return;
                }
                _calculateSingleItemPanBounds(item, item.w * zoomLevel, item.h * zoomLevel);
                if (isInitial && zoomLevel === item.initialZoomLevel) {
                    item.initialPosition = item.bounds.center;
                }
                return item.bounds;
            } else {
                item.w = item.h = 0;
                item.initialZoomLevel = item.fitRatio = 1;
                item.bounds = _getZeroBounds();
                item.initialPosition = item.bounds.center;
                // if it's not image, we return zero bounds (content is not zoomable)
                return item.bounds;
            }
        }, _appendImage = function(index, item, baseDiv, img, preventAnimation, keepPlaceholder) {
            if (item.loadError) {
                return;
            }
            if (img) {
                item.imageAppended = true;
                _setImageSize(item, img, item === self.currItem && _renderMaxResolution);
                baseDiv.appendChild(img);
                if (keepPlaceholder) {
                    setTimeout(function() {
                        if (item && item.loaded && item.placeholder) {
                            item.placeholder.style.display = "none";
                            item.placeholder = null;
                        }
                    }, 500);
                }
            }
        }, _preloadImage = function(item) {
            item.loading = true;
            item.loaded = false;
            var img = item.img = framework.createEl("pswp__img", "img");
            var onComplete = function() {
                item.loading = false;
                item.loaded = true;
                if (item.loadComplete) {
                    item.loadComplete(item);
                } else {
                    item.img = null;
                }
                img.onload = img.onerror = null;
                img = null;
            };
            img.onload = onComplete;
            img.onerror = function() {
                item.loadError = true;
                onComplete();
            };
            img.src = item.src;
            // + '?a=' + Math.random();
            return img;
        }, _checkForError = function(item, cleanUp) {
            if (item.src && item.loadError && item.container) {
                if (cleanUp) {
                    item.container.innerHTML = "";
                }
                item.container.innerHTML = _options.errorMsg.replace("%url%", item.src);
                return true;
            }
        }, _setImageSize = function(item, img, maxRes) {
            if (!item.src) {
                return;
            }
            if (!img) {
                img = item.container.lastChild;
            }
            var w = maxRes ? item.w : Math.round(item.w * item.fitRatio), h = maxRes ? item.h : Math.round(item.h * item.fitRatio);
            if (item.placeholder && !item.loaded) {
                item.placeholder.style.width = w + "px";
                item.placeholder.style.height = h + "px";
            }
            img.style.width = w + "px";
            img.style.height = h + "px";
        }, _appendImagesPool = function() {
            if (_imagesToAppendPool.length) {
                var poolItem;
                for (var i = 0; i < _imagesToAppendPool.length; i++) {
                    poolItem = _imagesToAppendPool[i];
                    if (poolItem.holder.index === poolItem.index) {
                        _appendImage(poolItem.index, poolItem.item, poolItem.baseDiv, poolItem.img, false, poolItem.clearPlaceholder);
                    }
                }
                _imagesToAppendPool = [];
            }
        };
        _registerModule("Controller", {
            publicMethods: {
                lazyLoadItem: function(index) {
                    index = _getLoopedId(index);
                    var item = _getItemAt(index);
                    if (!item || (item.loaded || item.loading) && !_itemsNeedUpdate) {
                        return;
                    }
                    _shout("gettingData", index, item);
                    if (!item.src) {
                        return;
                    }
                    _preloadImage(item);
                },
                initController: function() {
                    framework.extend(_options, _controllerDefaultOptions, true);
                    self.items = _items = items;
                    _getItemAt = self.getItemAt;
                    _getNumItems = _options.getNumItemsFn;
                    //self.getNumItems;
                    _initialIsLoop = _options.loop;
                    if (_getNumItems() < 3) {
                        _options.loop = false;
                    }
                    _listen("beforeChange", function(diff) {
                        var p = _options.preload, isNext = diff === null ? true : diff >= 0, preloadBefore = Math.min(p[0], _getNumItems()), preloadAfter = Math.min(p[1], _getNumItems()), i;
                        for (i = 1; i <= (isNext ? preloadAfter : preloadBefore); i++) {
                            self.lazyLoadItem(_currentItemIndex + i);
                        }
                        for (i = 1; i <= (isNext ? preloadBefore : preloadAfter); i++) {
                            self.lazyLoadItem(_currentItemIndex - i);
                        }
                    });
                    _listen("initialLayout", function() {
                        self.currItem.initialLayout = _options.getThumbBoundsFn && _options.getThumbBoundsFn(_currentItemIndex);
                    });
                    _listen("mainScrollAnimComplete", _appendImagesPool);
                    _listen("initialZoomInEnd", _appendImagesPool);
                    _listen("destroy", function() {
                        var item;
                        for (var i = 0; i < _items.length; i++) {
                            item = _items[i];
                            // remove reference to DOM elements, for GC
                            if (item.container) {
                                item.container = null;
                            }
                            if (item.placeholder) {
                                item.placeholder = null;
                            }
                            if (item.img) {
                                item.img = null;
                            }
                            if (item.preloader) {
                                item.preloader = null;
                            }
                            if (item.loadError) {
                                item.loaded = item.loadError = false;
                            }
                        }
                        _imagesToAppendPool = null;
                    });
                },
                getItemAt: function(index) {
                    if (index >= 0) {
                        return _items[index] !== undefined ? _items[index] : false;
                    }
                    return false;
                },
                allowProgressiveImg: function() {
                    // 1. Progressive image loading isn't working on webkit/blink 
                    //    when hw-acceleration (e.g. translateZ) is applied to IMG element.
                    //    That's why in PhotoSwipe parent element gets zoom transform, not image itself.
                    //    
                    // 2. Progressive image loading sometimes blinks in webkit/blink when applying animation to parent element.
                    //    That's why it's disabled on touch devices (mainly because of swipe transition)
                    //    
                    // 3. Progressive image loading sometimes doesn't work in IE (up to 11).
                    // Don't allow progressive loading on non-large touch devices
                    return _options.forceProgressiveLoading || !_likelyTouchDevice || _options.mouseUsed || screen.width > 1200;
                },
                setContent: function(holder, index) {
                    if (_options.loop) {
                        index = _getLoopedId(index);
                    }
                    var prevItem = self.getItemAt(holder.index);
                    if (prevItem) {
                        prevItem.container = null;
                    }
                    var item = self.getItemAt(index), img;
                    if (!item) {
                        holder.el.innerHTML = "";
                        return;
                    }
                    // allow to override data
                    _shout("gettingData", index, item);
                    holder.index = index;
                    holder.item = item;
                    // base container DIV is created only once for each of 3 holders
                    var baseDiv = item.container = framework.createEl("pswp__zoom-wrap");
                    if (!item.src && item.html) {
                        if (item.html.tagName) {
                            baseDiv.appendChild(item.html);
                        } else {
                            baseDiv.innerHTML = item.html;
                        }
                    }
                    _checkForError(item);
                    _calculateItemSize(item, _viewportSize);
                    if (item.src && !item.loadError && !item.loaded) {
                        item.loadComplete = function(item) {
                            // gallery closed before image finished loading
                            if (!_isOpen) {
                                return;
                            }
                            // check if holder hasn't changed while image was loading
                            if (holder && holder.index === index) {
                                if (_checkForError(item, true)) {
                                    item.loadComplete = item.img = null;
                                    _calculateItemSize(item, _viewportSize);
                                    _applyZoomPanToItem(item);
                                    if (holder.index === _currentItemIndex) {
                                        // recalculate dimensions
                                        self.updateCurrZoomItem();
                                    }
                                    return;
                                }
                                if (!item.imageAppended) {
                                    if (_features.transform && (_mainScrollAnimating || _initialZoomRunning)) {
                                        _imagesToAppendPool.push({
                                            item: item,
                                            baseDiv: baseDiv,
                                            img: item.img,
                                            index: index,
                                            holder: holder,
                                            clearPlaceholder: true
                                        });
                                    } else {
                                        _appendImage(index, item, baseDiv, item.img, _mainScrollAnimating || _initialZoomRunning, true);
                                    }
                                } else {
                                    // remove preloader & mini-img
                                    if (!_initialZoomRunning && item.placeholder) {
                                        item.placeholder.style.display = "none";
                                        item.placeholder = null;
                                    }
                                }
                            }
                            item.loadComplete = null;
                            item.img = null;
                            // no need to store image element after it's added
                            _shout("imageLoadComplete", index, item);
                        };
                        if (framework.features.transform) {
                            var placeholderClassName = "pswp__img pswp__img--placeholder";
                            placeholderClassName += item.msrc ? "" : " pswp__img--placeholder--blank";
                            var placeholder = framework.createEl(placeholderClassName, item.msrc ? "img" : "");
                            if (item.msrc) {
                                placeholder.src = item.msrc;
                            }
                            _setImageSize(item, placeholder);
                            baseDiv.appendChild(placeholder);
                            item.placeholder = placeholder;
                        }
                        if (!item.loading) {
                            _preloadImage(item);
                        }
                        if (self.allowProgressiveImg()) {
                            // just append image
                            if (!_initialContentSet && _features.transform) {
                                _imagesToAppendPool.push({
                                    item: item,
                                    baseDiv: baseDiv,
                                    img: item.img,
                                    index: index,
                                    holder: holder
                                });
                            } else {
                                _appendImage(index, item, baseDiv, item.img, true, true);
                            }
                        }
                    } else if (item.src && !item.loadError) {
                        // image object is created every time, due to bugs of image loading & delay when switching images
                        img = framework.createEl("pswp__img", "img");
                        img.style.opacity = 1;
                        img.src = item.src;
                        _setImageSize(item, img);
                        _appendImage(index, item, baseDiv, img, true);
                    }
                    if (!_initialContentSet && index === _currentItemIndex) {
                        _currZoomElementStyle = baseDiv.style;
                        _showOrHide(item, img || item.img);
                    } else {
                        _applyZoomPanToItem(item);
                    }
                    holder.el.innerHTML = "";
                    holder.el.appendChild(baseDiv);
                },
                cleanSlide: function(item) {
                    if (item.img) {
                        item.img.onload = item.img.onerror = null;
                    }
                    item.loaded = item.loading = item.img = item.imageAppended = false;
                }
            }
        });
        /*>>items-controller*/
        /*>>tap*/
        /**
 * tap.js:
 *
 * Displatches tap and double-tap events.
 * 
 */
        var tapTimer, tapReleasePoint = {}, _dispatchTapEvent = function(origEvent, releasePoint, pointerType) {
            var e = document.createEvent("CustomEvent"), eDetail = {
                origEvent: origEvent,
                target: origEvent.target,
                releasePoint: releasePoint,
                pointerType: pointerType || "touch"
            };
            e.initCustomEvent("pswpTap", true, true, eDetail);
            origEvent.target.dispatchEvent(e);
        };
        _registerModule("Tap", {
            publicMethods: {
                initTap: function() {
                    _listen("firstTouchStart", self.onTapStart);
                    _listen("touchRelease", self.onTapRelease);
                    _listen("destroy", function() {
                        tapReleasePoint = {};
                        tapTimer = null;
                    });
                },
                onTapStart: function(touchList) {
                    if (touchList.length > 1) {
                        clearTimeout(tapTimer);
                        tapTimer = null;
                    }
                },
                onTapRelease: function(e, releasePoint) {
                    if (!releasePoint) {
                        return;
                    }
                    if (!_moved && !_isMultitouch && !_numAnimations) {
                        var p0 = releasePoint;
                        if (tapTimer) {
                            clearTimeout(tapTimer);
                            tapTimer = null;
                            // Check if taped on the same place
                            if (_isNearbyPoints(p0, tapReleasePoint)) {
                                _shout("doubleTap", p0);
                                return;
                            }
                        }
                        if (releasePoint.type === "mouse") {
                            _dispatchTapEvent(e, releasePoint, "mouse");
                            return;
                        }
                        var clickedTagName = e.target.tagName.toUpperCase();
                        // avoid double tap delay on buttons and elements that have class pswp__single-tap
                        if (clickedTagName === "BUTTON" || framework.hasClass(e.target, "pswp__single-tap")) {
                            _dispatchTapEvent(e, releasePoint);
                            return;
                        }
                        _equalizePoints(tapReleasePoint, p0);
                        tapTimer = setTimeout(function() {
                            _dispatchTapEvent(e, releasePoint);
                            tapTimer = null;
                        }, 300);
                    }
                }
            }
        });
        /*>>tap*/
        /*>>desktop-zoom*/
        /**
 *
 * desktop-zoom.js:
 *
 * - Binds mousewheel event for paning zoomed image.
 * - Manages "dragging", "zoomed-in", "zoom-out" classes.
 *   (which are used for cursors and zoom icon)
 * - Adds toggleDesktopZoom function.
 * 
 */
        var _wheelDelta;
        _registerModule("DesktopZoom", {
            publicMethods: {
                initDesktopZoom: function() {
                    if (_oldIE) {
                        // no zoom for old IE (<=8)
                        return;
                    }
                    if (_likelyTouchDevice) {
                        // if detected hardware touch support, we wait until mouse is used,
                        // and only then apply desktop-zoom features
                        _listen("mouseUsed", function() {
                            self.setupDesktopZoom();
                        });
                    } else {
                        self.setupDesktopZoom(true);
                    }
                },
                setupDesktopZoom: function(onInit) {
                    _wheelDelta = {};
                    var events = "wheel mousewheel DOMMouseScroll";
                    _listen("bindEvents", function() {
                        framework.bind(template, events, self.handleMouseWheel);
                    });
                    _listen("unbindEvents", function() {
                        if (_wheelDelta) {
                            framework.unbind(template, events, self.handleMouseWheel);
                        }
                    });
                    self.mouseZoomedIn = false;
                    var hasDraggingClass, updateZoomable = function() {
                        if (self.mouseZoomedIn) {
                            framework.removeClass(template, "pswp--zoomed-in");
                            self.mouseZoomedIn = false;
                        }
                        if (_currZoomLevel < 1) {
                            framework.addClass(template, "pswp--zoom-allowed");
                        } else {
                            framework.removeClass(template, "pswp--zoom-allowed");
                        }
                        removeDraggingClass();
                    }, removeDraggingClass = function() {
                        if (hasDraggingClass) {
                            framework.removeClass(template, "pswp--dragging");
                            hasDraggingClass = false;
                        }
                    };
                    _listen("resize", updateZoomable);
                    _listen("afterChange", updateZoomable);
                    _listen("pointerDown", function() {
                        if (self.mouseZoomedIn) {
                            hasDraggingClass = true;
                            framework.addClass(template, "pswp--dragging");
                        }
                    });
                    _listen("pointerUp", removeDraggingClass);
                    if (!onInit) {
                        updateZoomable();
                    }
                },
                handleMouseWheel: function(e) {
                    if (_currZoomLevel <= self.currItem.fitRatio) {
                        if (_options.modal) {
                            if (!_options.closeOnScroll || _numAnimations || _isDragging) {
                                e.preventDefault();
                            } else if (_transformKey && Math.abs(e.deltaY) > 2) {
                                // close PhotoSwipe
                                // if browser supports transforms & scroll changed enough
                                _closedByScroll = true;
                                self.close();
                            }
                        }
                        return true;
                    }
                    // allow just one event to fire
                    e.stopPropagation();
                    // https://developer.mozilla.org/en-US/docs/Web/Events/wheel
                    _wheelDelta.x = 0;
                    if ("deltaX" in e) {
                        if (e.deltaMode === 1) {
                            // 18 - average line height
                            _wheelDelta.x = e.deltaX * 18;
                            _wheelDelta.y = e.deltaY * 18;
                        } else {
                            _wheelDelta.x = e.deltaX;
                            _wheelDelta.y = e.deltaY;
                        }
                    } else if ("wheelDelta" in e) {
                        if (e.wheelDeltaX) {
                            _wheelDelta.x = -.16 * e.wheelDeltaX;
                        }
                        if (e.wheelDeltaY) {
                            _wheelDelta.y = -.16 * e.wheelDeltaY;
                        } else {
                            _wheelDelta.y = -.16 * e.wheelDelta;
                        }
                    } else if ("detail" in e) {
                        _wheelDelta.y = e.detail;
                    } else {
                        return;
                    }
                    _calculatePanBounds(_currZoomLevel, true);
                    var newPanX = _panOffset.x - _wheelDelta.x, newPanY = _panOffset.y - _wheelDelta.y;
                    // only prevent scrolling in nonmodal mode when not at edges
                    if (_options.modal || newPanX <= _currPanBounds.min.x && newPanX >= _currPanBounds.max.x && newPanY <= _currPanBounds.min.y && newPanY >= _currPanBounds.max.y) {
                        e.preventDefault();
                    }
                    // TODO: use rAF instead of mousewheel?
                    self.panTo(newPanX, newPanY);
                },
                toggleDesktopZoom: function(centerPoint) {
                    centerPoint = centerPoint || {
                        x: _viewportSize.x / 2 + _offset.x,
                        y: _viewportSize.y / 2 + _offset.y
                    };
                    var doubleTapZoomLevel = _options.getDoubleTapZoom(true, self.currItem);
                    var zoomOut = _currZoomLevel === doubleTapZoomLevel;
                    self.mouseZoomedIn = !zoomOut;
                    self.zoomTo(zoomOut ? self.currItem.initialZoomLevel : doubleTapZoomLevel, centerPoint, 333);
                    framework[(!zoomOut ? "add" : "remove") + "Class"](template, "pswp--zoomed-in");
                }
            }
        });
        /*>>desktop-zoom*/
        /*>>history*/
        /**
 *
 * history.js:
 *
 * - Back button to close gallery.
 * 
 * - Unique URL for each slide: example.com/&pid=1&gid=3
 *   (where PID is picture index, and GID and gallery index)
 *   
 * - Switch URL when slides change.
 * 
 */
        var _historyDefaultOptions = {
            history: true,
            galleryUID: 1
        };
        var _historyUpdateTimeout, _hashChangeTimeout, _hashAnimCheckTimeout, _hashChangedByScript, _hashChangedByHistory, _hashReseted, _initialHash, _historyChanged, _closedFromURL, _urlChangedOnce, _windowLoc, _supportsPushState, _getHash = function() {
            return _windowLoc.hash.substring(1);
        }, _cleanHistoryTimeouts = function() {
            if (_historyUpdateTimeout) {
                clearTimeout(_historyUpdateTimeout);
            }
            if (_hashAnimCheckTimeout) {
                clearTimeout(_hashAnimCheckTimeout);
            }
        }, // pid - Picture index
        // gid - Gallery index
        _parseItemIndexFromURL = function() {
            var hash = _getHash(), params = {};
            if (hash.length < 5) {
                // pid=1
                return params;
            }
            var i, vars = hash.split("&");
            for (i = 0; i < vars.length; i++) {
                if (!vars[i]) {
                    continue;
                }
                var pair = vars[i].split("=");
                if (pair.length < 2) {
                    continue;
                }
                params[pair[0]] = pair[1];
            }
            if (_options.galleryPIDs) {
                // detect custom pid in hash and search for it among the items collection
                var searchfor = params.pid;
                params.pid = 0;
                // if custom pid cannot be found, fallback to the first item
                for (i = 0; i < _items.length; i++) {
                    if (_items[i].pid === searchfor) {
                        params.pid = i;
                        break;
                    }
                }
            } else {
                params.pid = parseInt(params.pid, 10) - 1;
            }
            if (params.pid < 0) {
                params.pid = 0;
            }
            return params;
        }, _updateHash = function() {
            if (_hashAnimCheckTimeout) {
                clearTimeout(_hashAnimCheckTimeout);
            }
            if (_numAnimations || _isDragging) {
                // changing browser URL forces layout/paint in some browsers, which causes noticable lag during animation
                // that's why we update hash only when no animations running
                _hashAnimCheckTimeout = setTimeout(_updateHash, 500);
                return;
            }
            if (_hashChangedByScript) {
                clearTimeout(_hashChangeTimeout);
            } else {
                _hashChangedByScript = true;
            }
            var pid = _currentItemIndex + 1;
            var item = _getItemAt(_currentItemIndex);
            if (item.hasOwnProperty("pid")) {
                // carry forward any custom pid assigned to the item
                pid = item.pid;
            }
            var newHash = _initialHash + "&" + "gid=" + _options.galleryUID + "&" + "pid=" + pid;
            if (!_historyChanged) {
                if (_windowLoc.hash.indexOf(newHash) === -1) {
                    _urlChangedOnce = true;
                }
            }
            var newURL = _windowLoc.href.split("#")[0] + "#" + newHash;
            if (_supportsPushState) {
                if ("#" + newHash !== window.location.hash) {
                    history[_historyChanged ? "replaceState" : "pushState"]("", document.title, newURL);
                }
            } else {
                if (_historyChanged) {
                    _windowLoc.replace(newURL);
                } else {
                    _windowLoc.hash = newHash;
                }
            }
            _historyChanged = true;
            _hashChangeTimeout = setTimeout(function() {
                _hashChangedByScript = false;
            }, 60);
        };
        _registerModule("History", {
            publicMethods: {
                initHistory: function() {
                    framework.extend(_options, _historyDefaultOptions, true);
                    if (!_options.history) {
                        return;
                    }
                    _windowLoc = window.location;
                    _urlChangedOnce = false;
                    _closedFromURL = false;
                    _historyChanged = false;
                    _initialHash = _getHash();
                    _supportsPushState = "pushState" in history;
                    if (_initialHash.indexOf("gid=") > -1) {
                        _initialHash = _initialHash.split("&gid=")[0];
                        _initialHash = _initialHash.split("?gid=")[0];
                    }
                    _listen("afterChange", self.updateURL);
                    _listen("unbindEvents", function() {
                        framework.unbind(window, "hashchange", self.onHashChange);
                    });
                    var returnToOriginal = function() {
                        _hashReseted = true;
                        if (!_closedFromURL) {
                            if (_urlChangedOnce) {
                                history.back();
                            } else {
                                if (_initialHash) {
                                    _windowLoc.hash = _initialHash;
                                } else {
                                    if (_supportsPushState) {
                                        // remove hash from url without refreshing it or scrolling to top
                                        history.pushState("", document.title, _windowLoc.pathname + _windowLoc.search);
                                    } else {
                                        _windowLoc.hash = "";
                                    }
                                }
                            }
                        }
                        _cleanHistoryTimeouts();
                    };
                    _listen("unbindEvents", function() {
                        if (_closedByScroll) {
                            // if PhotoSwipe is closed by scroll, we go "back" before the closing animation starts
                            // this is done to keep the scroll position
                            returnToOriginal();
                        }
                    });
                    _listen("destroy", function() {
                        if (!_hashReseted) {
                            returnToOriginal();
                        }
                    });
                    _listen("firstUpdate", function() {
                        _currentItemIndex = _parseItemIndexFromURL().pid;
                    });
                    var index = _initialHash.indexOf("pid=");
                    if (index > -1) {
                        _initialHash = _initialHash.substring(0, index);
                        if (_initialHash.slice(-1) === "&") {
                            _initialHash = _initialHash.slice(0, -1);
                        }
                    }
                    setTimeout(function() {
                        if (_isOpen) {
                            // hasn't destroyed yet
                            framework.bind(window, "hashchange", self.onHashChange);
                        }
                    }, 40);
                },
                onHashChange: function() {
                    if (_getHash() === _initialHash) {
                        _closedFromURL = true;
                        self.close();
                        return;
                    }
                    if (!_hashChangedByScript) {
                        _hashChangedByHistory = true;
                        self.goTo(_parseItemIndexFromURL().pid);
                        _hashChangedByHistory = false;
                    }
                },
                updateURL: function() {
                    // Delay the update of URL, to avoid lag during transition, 
                    // and to not to trigger actions like "refresh page sound" or "blinking favicon" to often
                    _cleanHistoryTimeouts();
                    if (_hashChangedByHistory) {
                        return;
                    }
                    if (!_historyChanged) {
                        _updateHash();
                    } else {
                        _historyUpdateTimeout = setTimeout(_updateHash, 800);
                    }
                }
            }
        });
        /*>>history*/
        framework.extend(self, publicMethods);
    };
    return PhotoSwipe;
});
/*! PhotoSwipe Default UI - 4.1.1 - 2015-12-24
* http://photoswipe.com
* Copyright (c) 2015 Dmitry Semenov; */
/**
*
* UI on top of main sliding area (caption, arrows, close button, etc.).
* Built just using public methods/properties of PhotoSwipe.
* 
*/
(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define(factory);
    } else if (typeof exports === "object") {
        module.exports = factory();
    } else {
        root.PhotoSwipeUI_Default = factory();
    }
})(this, function() {
    "use strict";
    var PhotoSwipeUI_Default = function(pswp, framework) {
        var ui = this;
        var _overlayUIUpdated = false, _controlsVisible = true, _fullscrenAPI, _controls, _captionContainer, _fakeCaptionContainer, _indexIndicator, _shareButton, _shareModal, _shareModalHidden = true, _initalCloseOnScrollValue, _isIdle, _listen, _loadingIndicator, _loadingIndicatorHidden, _loadingIndicatorTimeout, _galleryHasOneSlide, _options, _defaultUIOptions = {
            barsSize: {
                top: 44,
                bottom: "auto"
            },
            closeElClasses: [ "item", "caption", "zoom-wrap", "ui", "top-bar" ],
            timeToIdle: 4e3,
            timeToIdleOutside: 1e3,
            loadingIndicatorDelay: 1e3,
            // 2s
            addCaptionHTMLFn: function(item, captionEl) {
                if (!item.title) {
                    captionEl.children[0].innerHTML = "";
                    return false;
                }
                captionEl.children[0].innerHTML = item.title;
                return true;
            },
            closeEl: true,
            captionEl: true,
            fullscreenEl: true,
            zoomEl: true,
            shareEl: true,
            counterEl: true,
            arrowEl: true,
            preloaderEl: true,
            tapToClose: false,
            tapToToggleControls: true,
            clickToCloseNonZoomable: true,
            shareButtons: [ {
                id: "facebook",
                label: "Share on Facebook",
                url: "https://www.facebook.com/sharer/sharer.php?u={{url}}"
            }, {
                id: "twitter",
                label: "Tweet",
                url: "https://twitter.com/intent/tweet?text={{text}}&url={{url}}"
            }, {
                id: "pinterest",
                label: "Pin it",
                url: "http://www.pinterest.com/pin/create/button/" + "?url={{url}}&media={{image_url}}&description={{text}}"
            }, {
                id: "download",
                label: "Download image",
                url: "{{raw_image_url}}",
                download: true
            } ],
            getImageURLForShare: function() {
                return pswp.currItem.src || "";
            },
            getPageURLForShare: function() {
                return window.location.href;
            },
            getTextForShare: function() {
                return pswp.currItem.title || "";
            },
            indexIndicatorSep: " / ",
            fitControlsWidth: 1200
        }, _blockControlsTap, _blockControlsTapTimeout;
        var _onControlsTap = function(e) {
            if (_blockControlsTap) {
                return true;
            }
            e = e || window.event;
            if (_options.timeToIdle && _options.mouseUsed && !_isIdle) {
                // reset idle timer
                _onIdleMouseMove();
            }
            var target = e.target || e.srcElement, uiElement, clickedClass = target.getAttribute("class") || "", found;
            for (var i = 0; i < _uiElements.length; i++) {
                uiElement = _uiElements[i];
                if (uiElement.onTap && clickedClass.indexOf("pswp__" + uiElement.name) > -1) {
                    uiElement.onTap();
                    found = true;
                }
            }
            if (found) {
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
                _blockControlsTap = true;
                // Some versions of Android don't prevent ghost click event 
                // when preventDefault() was called on touchstart and/or touchend.
                // 
                // This happens on v4.3, 4.2, 4.1, 
                // older versions strangely work correctly, 
                // but just in case we add delay on all of them)	
                var tapDelay = framework.features.isOldAndroid ? 600 : 30;
                _blockControlsTapTimeout = setTimeout(function() {
                    _blockControlsTap = false;
                }, tapDelay);
            }
        }, _fitControlsInViewport = function() {
            return !pswp.likelyTouchDevice || _options.mouseUsed || screen.width > _options.fitControlsWidth;
        }, _togglePswpClass = function(el, cName, add) {
            framework[(add ? "add" : "remove") + "Class"](el, "pswp__" + cName);
        }, // add class when there is just one item in the gallery
        // (by default it hides left/right arrows and 1ofX counter)
        _countNumItems = function() {
            var hasOneSlide = _options.getNumItemsFn() === 1;
            if (hasOneSlide !== _galleryHasOneSlide) {
                _togglePswpClass(_controls, "ui--one-slide", hasOneSlide);
                _galleryHasOneSlide = hasOneSlide;
            }
        }, _toggleShareModalClass = function() {
            _togglePswpClass(_shareModal, "share-modal--hidden", _shareModalHidden);
        }, _toggleShareModal = function() {
            _shareModalHidden = !_shareModalHidden;
            if (!_shareModalHidden) {
                _toggleShareModalClass();
                setTimeout(function() {
                    if (!_shareModalHidden) {
                        framework.addClass(_shareModal, "pswp__share-modal--fade-in");
                    }
                }, 30);
            } else {
                framework.removeClass(_shareModal, "pswp__share-modal--fade-in");
                setTimeout(function() {
                    if (_shareModalHidden) {
                        _toggleShareModalClass();
                    }
                }, 300);
            }
            if (!_shareModalHidden) {
                _updateShareURLs();
            }
            return false;
        }, _openWindowPopup = function(e) {
            e = e || window.event;
            var target = e.target || e.srcElement;
            pswp.shout("shareLinkClick", e, target);
            if (!target.href) {
                return false;
            }
            if (target.hasAttribute("download")) {
                return true;
            }
            window.open(target.href, "pswp_share", "scrollbars=yes,resizable=yes,toolbar=no," + "location=yes,width=550,height=420,top=100,left=" + (window.screen ? Math.round(screen.width / 2 - 275) : 100));
            if (!_shareModalHidden) {
                _toggleShareModal();
            }
            return false;
        }, _updateShareURLs = function() {
            var shareButtonOut = "", shareButtonData, shareURL, image_url, page_url, share_text;
            for (var i = 0; i < _options.shareButtons.length; i++) {
                shareButtonData = _options.shareButtons[i];
                image_url = _options.getImageURLForShare(shareButtonData);
                page_url = _options.getPageURLForShare(shareButtonData);
                share_text = _options.getTextForShare(shareButtonData);
                shareURL = shareButtonData.url.replace("{{url}}", encodeURIComponent(page_url)).replace("{{image_url}}", encodeURIComponent(image_url)).replace("{{raw_image_url}}", image_url).replace("{{text}}", encodeURIComponent(share_text));
                shareButtonOut += '<a href="' + shareURL + '" target="_blank" ' + 'class="pswp__share--' + shareButtonData.id + '"' + (shareButtonData.download ? "download" : "") + ">" + shareButtonData.label + "</a>";
                if (_options.parseShareButtonOut) {
                    shareButtonOut = _options.parseShareButtonOut(shareButtonData, shareButtonOut);
                }
            }
            _shareModal.children[0].innerHTML = shareButtonOut;
            _shareModal.children[0].onclick = _openWindowPopup;
        }, _hasCloseClass = function(target) {
            for (var i = 0; i < _options.closeElClasses.length; i++) {
                if (framework.hasClass(target, "pswp__" + _options.closeElClasses[i])) {
                    return true;
                }
            }
        }, _idleInterval, _idleTimer, _idleIncrement = 0, _onIdleMouseMove = function() {
            clearTimeout(_idleTimer);
            _idleIncrement = 0;
            if (_isIdle) {
                ui.setIdle(false);
            }
        }, _onMouseLeaveWindow = function(e) {
            e = e ? e : window.event;
            var from = e.relatedTarget || e.toElement;
            if (!from || from.nodeName === "HTML") {
                clearTimeout(_idleTimer);
                _idleTimer = setTimeout(function() {
                    ui.setIdle(true);
                }, _options.timeToIdleOutside);
            }
        }, _setupFullscreenAPI = function() {
            if (_options.fullscreenEl && !framework.features.isOldAndroid) {
                if (!_fullscrenAPI) {
                    _fullscrenAPI = ui.getFullscreenAPI();
                }
                if (_fullscrenAPI) {
                    framework.bind(document, _fullscrenAPI.eventK, ui.updateFullscreen);
                    ui.updateFullscreen();
                    framework.addClass(pswp.template, "pswp--supports-fs");
                } else {
                    framework.removeClass(pswp.template, "pswp--supports-fs");
                }
            }
        }, _setupLoadingIndicator = function() {
            // Setup loading indicator
            if (_options.preloaderEl) {
                _toggleLoadingIndicator(true);
                _listen("beforeChange", function() {
                    clearTimeout(_loadingIndicatorTimeout);
                    // display loading indicator with delay
                    _loadingIndicatorTimeout = setTimeout(function() {
                        if (pswp.currItem && pswp.currItem.loading) {
                            if (!pswp.allowProgressiveImg() || pswp.currItem.img && !pswp.currItem.img.naturalWidth) {
                                // show preloader if progressive loading is not enabled, 
                                // or image width is not defined yet (because of slow connection)
                                _toggleLoadingIndicator(false);
                            }
                        } else {
                            _toggleLoadingIndicator(true);
                        }
                    }, _options.loadingIndicatorDelay);
                });
                _listen("imageLoadComplete", function(index, item) {
                    if (pswp.currItem === item) {
                        _toggleLoadingIndicator(true);
                    }
                });
            }
        }, _toggleLoadingIndicator = function(hide) {
            if (_loadingIndicatorHidden !== hide) {
                _togglePswpClass(_loadingIndicator, "preloader--active", !hide);
                _loadingIndicatorHidden = hide;
            }
        }, _applyNavBarGaps = function(item) {
            var gap = item.vGap;
            if (_fitControlsInViewport()) {
                var bars = _options.barsSize;
                if (_options.captionEl && bars.bottom === "auto") {
                    if (!_fakeCaptionContainer) {
                        _fakeCaptionContainer = framework.createEl("pswp__caption pswp__caption--fake");
                        _fakeCaptionContainer.appendChild(framework.createEl("pswp__caption__center"));
                        _controls.insertBefore(_fakeCaptionContainer, _captionContainer);
                        framework.addClass(_controls, "pswp__ui--fit");
                    }
                    if (_options.addCaptionHTMLFn(item, _fakeCaptionContainer, true)) {
                        var captionSize = _fakeCaptionContainer.clientHeight;
                        gap.bottom = parseInt(captionSize, 10) || 44;
                    } else {
                        gap.bottom = bars.top;
                    }
                } else {
                    gap.bottom = bars.bottom === "auto" ? 0 : bars.bottom;
                }
                // height of top bar is static, no need to calculate it
                gap.top = bars.top;
            } else {
                gap.top = gap.bottom = 0;
            }
        }, _setupIdle = function() {
            // Hide controls when mouse is used
            if (_options.timeToIdle) {
                _listen("mouseUsed", function() {
                    framework.bind(document, "mousemove", _onIdleMouseMove);
                    framework.bind(document, "mouseout", _onMouseLeaveWindow);
                    _idleInterval = setInterval(function() {
                        _idleIncrement++;
                        if (_idleIncrement === 2) {
                            ui.setIdle(true);
                        }
                    }, _options.timeToIdle / 2);
                });
            }
        }, _setupHidingControlsDuringGestures = function() {
            // Hide controls on vertical drag
            _listen("onVerticalDrag", function(now) {
                if (_controlsVisible && now < .95) {
                    ui.hideControls();
                } else if (!_controlsVisible && now >= .95) {
                    ui.showControls();
                }
            });
            // Hide controls when pinching to close
            var pinchControlsHidden;
            _listen("onPinchClose", function(now) {
                if (_controlsVisible && now < .9) {
                    ui.hideControls();
                    pinchControlsHidden = true;
                } else if (pinchControlsHidden && !_controlsVisible && now > .9) {
                    ui.showControls();
                }
            });
            _listen("zoomGestureEnded", function() {
                pinchControlsHidden = false;
                if (pinchControlsHidden && !_controlsVisible) {
                    ui.showControls();
                }
            });
        };
        var _uiElements = [ {
            name: "caption",
            option: "captionEl",
            onInit: function(el) {
                _captionContainer = el;
            }
        }, {
            name: "share-modal",
            option: "shareEl",
            onInit: function(el) {
                _shareModal = el;
            },
            onTap: function() {
                _toggleShareModal();
            }
        }, {
            name: "button--share",
            option: "shareEl",
            onInit: function(el) {
                _shareButton = el;
            },
            onTap: function() {
                _toggleShareModal();
            }
        }, {
            name: "button--zoom",
            option: "zoomEl",
            onTap: pswp.toggleDesktopZoom
        }, {
            name: "counter",
            option: "counterEl",
            onInit: function(el) {
                _indexIndicator = el;
            }
        }, {
            name: "button--close",
            option: "closeEl",
            onTap: pswp.close
        }, {
            name: "button--arrow--left",
            option: "arrowEl",
            onTap: pswp.prev
        }, {
            name: "button--arrow--right",
            option: "arrowEl",
            onTap: pswp.next
        }, {
            name: "button--fs",
            option: "fullscreenEl",
            onTap: function() {
                if (_fullscrenAPI.isFullscreen()) {
                    _fullscrenAPI.exit();
                } else {
                    _fullscrenAPI.enter();
                }
            }
        }, {
            name: "preloader",
            option: "preloaderEl",
            onInit: function(el) {
                _loadingIndicator = el;
            }
        } ];
        var _setupUIElements = function() {
            var item, classAttr, uiElement;
            var loopThroughChildElements = function(sChildren) {
                if (!sChildren) {
                    return;
                }
                var l = sChildren.length;
                for (var i = 0; i < l; i++) {
                    item = sChildren[i];
                    classAttr = item.className;
                    for (var a = 0; a < _uiElements.length; a++) {
                        uiElement = _uiElements[a];
                        if (classAttr.indexOf("pswp__" + uiElement.name) > -1) {
                            if (_options[uiElement.option]) {
                                // if element is not disabled from options
                                framework.removeClass(item, "pswp__element--disabled");
                                if (uiElement.onInit) {
                                    uiElement.onInit(item);
                                }
                            } else {
                                framework.addClass(item, "pswp__element--disabled");
                            }
                        }
                    }
                }
            };
            loopThroughChildElements(_controls.children);
            var topBar = framework.getChildByClass(_controls, "pswp__top-bar");
            if (topBar) {
                loopThroughChildElements(topBar.children);
            }
        };
        ui.init = function() {
            // extend options
            framework.extend(pswp.options, _defaultUIOptions, true);
            // create local link for fast access
            _options = pswp.options;
            // find pswp__ui element
            _controls = framework.getChildByClass(pswp.scrollWrap, "pswp__ui");
            // create local link
            _listen = pswp.listen;
            _setupHidingControlsDuringGestures();
            // update controls when slides change
            _listen("beforeChange", ui.update);
            // toggle zoom on double-tap
            _listen("doubleTap", function(point) {
                var initialZoomLevel = pswp.currItem.initialZoomLevel;
                if (pswp.getZoomLevel() !== initialZoomLevel) {
                    pswp.zoomTo(initialZoomLevel, point, 333);
                } else {
                    pswp.zoomTo(_options.getDoubleTapZoom(false, pswp.currItem), point, 333);
                }
            });
            // Allow text selection in caption
            _listen("preventDragEvent", function(e, isDown, preventObj) {
                var t = e.target || e.srcElement;
                if (t && t.getAttribute("class") && e.type.indexOf("mouse") > -1 && (t.getAttribute("class").indexOf("__caption") > 0 || /(SMALL|STRONG|EM)/i.test(t.tagName))) {
                    preventObj.prevent = false;
                }
            });
            // bind events for UI
            _listen("bindEvents", function() {
                framework.bind(_controls, "pswpTap click", _onControlsTap);
                framework.bind(pswp.scrollWrap, "pswpTap", ui.onGlobalTap);
                if (!pswp.likelyTouchDevice) {
                    framework.bind(pswp.scrollWrap, "mouseover", ui.onMouseOver);
                }
            });
            // unbind events for UI
            _listen("unbindEvents", function() {
                if (!_shareModalHidden) {
                    _toggleShareModal();
                }
                if (_idleInterval) {
                    clearInterval(_idleInterval);
                }
                framework.unbind(document, "mouseout", _onMouseLeaveWindow);
                framework.unbind(document, "mousemove", _onIdleMouseMove);
                framework.unbind(_controls, "pswpTap click", _onControlsTap);
                framework.unbind(pswp.scrollWrap, "pswpTap", ui.onGlobalTap);
                framework.unbind(pswp.scrollWrap, "mouseover", ui.onMouseOver);
                if (_fullscrenAPI) {
                    framework.unbind(document, _fullscrenAPI.eventK, ui.updateFullscreen);
                    if (_fullscrenAPI.isFullscreen()) {
                        _options.hideAnimationDuration = 0;
                        _fullscrenAPI.exit();
                    }
                    _fullscrenAPI = null;
                }
            });
            // clean up things when gallery is destroyed
            _listen("destroy", function() {
                if (_options.captionEl) {
                    if (_fakeCaptionContainer) {
                        _controls.removeChild(_fakeCaptionContainer);
                    }
                    framework.removeClass(_captionContainer, "pswp__caption--empty");
                }
                if (_shareModal) {
                    _shareModal.children[0].onclick = null;
                }
                framework.removeClass(_controls, "pswp__ui--over-close");
                framework.addClass(_controls, "pswp__ui--hidden");
                ui.setIdle(false);
            });
            if (!_options.showAnimationDuration) {
                framework.removeClass(_controls, "pswp__ui--hidden");
            }
            _listen("initialZoomIn", function() {
                if (_options.showAnimationDuration) {
                    framework.removeClass(_controls, "pswp__ui--hidden");
                }
            });
            _listen("initialZoomOut", function() {
                framework.addClass(_controls, "pswp__ui--hidden");
            });
            _listen("parseVerticalMargin", _applyNavBarGaps);
            _setupUIElements();
            if (_options.shareEl && _shareButton && _shareModal) {
                _shareModalHidden = true;
            }
            _countNumItems();
            _setupIdle();
            _setupFullscreenAPI();
            _setupLoadingIndicator();
        };
        ui.setIdle = function(isIdle) {
            _isIdle = isIdle;
            _togglePswpClass(_controls, "ui--idle", isIdle);
        };
        ui.update = function() {
            // Don't update UI if it's hidden
            if (_controlsVisible && pswp.currItem) {
                ui.updateIndexIndicator();
                if (_options.captionEl) {
                    _options.addCaptionHTMLFn(pswp.currItem, _captionContainer);
                    _togglePswpClass(_captionContainer, "caption--empty", !pswp.currItem.title);
                }
                _overlayUIUpdated = true;
            } else {
                _overlayUIUpdated = false;
            }
            if (!_shareModalHidden) {
                _toggleShareModal();
            }
            _countNumItems();
        };
        ui.updateFullscreen = function(e) {
            if (e) {
                // some browsers change window scroll position during the fullscreen
                // so PhotoSwipe updates it just in case
                setTimeout(function() {
                    pswp.setScrollOffset(0, framework.getScrollY());
                }, 50);
            }
            // toogle pswp--fs class on root element
            framework[(_fullscrenAPI.isFullscreen() ? "add" : "remove") + "Class"](pswp.template, "pswp--fs");
        };
        ui.updateIndexIndicator = function() {
            if (_options.counterEl) {
                _indexIndicator.innerHTML = pswp.getCurrentIndex() + 1 + _options.indexIndicatorSep + _options.getNumItemsFn();
            }
        };
        ui.onGlobalTap = function(e) {
            e = e || window.event;
            var target = e.target || e.srcElement;
            if (_blockControlsTap) {
                return;
            }
            if (e.detail && e.detail.pointerType === "mouse") {
                // close gallery if clicked outside of the image
                if (_hasCloseClass(target)) {
                    pswp.close();
                    return;
                }
                if (framework.hasClass(target, "pswp__img")) {
                    if (pswp.getZoomLevel() === 1 && pswp.getZoomLevel() <= pswp.currItem.fitRatio) {
                        if (_options.clickToCloseNonZoomable) {
                            pswp.close();
                        }
                    } else {
                        pswp.toggleDesktopZoom(e.detail.releasePoint);
                    }
                }
            } else {
                // tap anywhere (except buttons) to toggle visibility of controls
                if (_options.tapToToggleControls) {
                    if (_controlsVisible) {
                        ui.hideControls();
                    } else {
                        ui.showControls();
                    }
                }
                // tap to close gallery
                if (_options.tapToClose && (framework.hasClass(target, "pswp__img") || _hasCloseClass(target))) {
                    pswp.close();
                    return;
                }
            }
        };
        ui.onMouseOver = function(e) {
            e = e || window.event;
            var target = e.target || e.srcElement;
            // add class when mouse is over an element that should close the gallery
            _togglePswpClass(_controls, "ui--over-close", _hasCloseClass(target));
        };
        ui.hideControls = function() {
            framework.addClass(_controls, "pswp__ui--hidden");
            _controlsVisible = false;
        };
        ui.showControls = function() {
            _controlsVisible = true;
            if (!_overlayUIUpdated) {
                ui.update();
            }
            framework.removeClass(_controls, "pswp__ui--hidden");
        };
        ui.supportsFullscreen = function() {
            var d = document;
            return !!(d.exitFullscreen || d.mozCancelFullScreen || d.webkitExitFullscreen || d.msExitFullscreen);
        };
        ui.getFullscreenAPI = function() {
            var dE = document.documentElement, api, tF = "fullscreenchange";
            if (dE.requestFullscreen) {
                api = {
                    enterK: "requestFullscreen",
                    exitK: "exitFullscreen",
                    elementK: "fullscreenElement",
                    eventK: tF
                };
            } else if (dE.mozRequestFullScreen) {
                api = {
                    enterK: "mozRequestFullScreen",
                    exitK: "mozCancelFullScreen",
                    elementK: "mozFullScreenElement",
                    eventK: "moz" + tF
                };
            } else if (dE.webkitRequestFullscreen) {
                api = {
                    enterK: "webkitRequestFullscreen",
                    exitK: "webkitExitFullscreen",
                    elementK: "webkitFullscreenElement",
                    eventK: "webkit" + tF
                };
            } else if (dE.msRequestFullscreen) {
                api = {
                    enterK: "msRequestFullscreen",
                    exitK: "msExitFullscreen",
                    elementK: "msFullscreenElement",
                    eventK: "MSFullscreenChange"
                };
            }
            if (api) {
                api.enter = function() {
                    // disable close-on-scroll in fullscreen
                    _initalCloseOnScrollValue = _options.closeOnScroll;
                    _options.closeOnScroll = false;
                    if (this.enterK === "webkitRequestFullscreen") {
                        pswp.template[this.enterK](Element.ALLOW_KEYBOARD_INPUT);
                    } else {
                        return pswp.template[this.enterK]();
                    }
                };
                api.exit = function() {
                    _options.closeOnScroll = _initalCloseOnScrollValue;
                    return document[this.exitK]();
                };
                api.isFullscreen = function() {
                    return document[this.elementK];
                };
            }
            return api;
        };
    };
    return PhotoSwipeUI_Default;
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
/*! VelocityJS.org (1.3.1). (C) 2014 Julian Shapiro. MIT @license: en.wikipedia.org/wiki/MIT_License */
/*************************
 Velocity jQuery Shim
 *************************/
/*! VelocityJS.org jQuery Shim (1.0.1). (C) 2014 The jQuery Foundation. MIT @license: en.wikipedia.org/wiki/MIT_License. */
/* This file contains the jQuery functions that Velocity relies on, thereby removing Velocity's dependency on a full copy of jQuery, and allowing it to work in any environment. */
/* These shimmed functions are only used if jQuery isn't present. If both this shim and jQuery are loaded, Velocity defaults to jQuery proper. */
/* Browser support: Using this shim instead of jQuery proper removes support for IE8. */
(function(window) {
    "use strict";
    /***************
	 Setup
	 ***************/
    /* If jQuery is already loaded, there's no point in loading this shim. */
    if (window.jQuery) {
        return;
    }
    /* jQuery base. */
    var $ = function(selector, context) {
        return new $.fn.init(selector, context);
    };
    /********************
	 Private Methods
	 ********************/
    /* jQuery */
    $.isWindow = function(obj) {
        /* jshint eqeqeq: false */
        return obj && obj === obj.window;
    };
    /* jQuery */
    $.type = function(obj) {
        if (!obj) {
            return obj + "";
        }
        return typeof obj === "object" || typeof obj === "function" ? class2type[toString.call(obj)] || "object" : typeof obj;
    };
    /* jQuery */
    $.isArray = Array.isArray || function(obj) {
        return $.type(obj) === "array";
    };
    /* jQuery */
    function isArraylike(obj) {
        var length = obj.length, type = $.type(obj);
        if (type === "function" || $.isWindow(obj)) {
            return false;
        }
        if (obj.nodeType === 1 && length) {
            return true;
        }
        return type === "array" || length === 0 || typeof length === "number" && length > 0 && length - 1 in obj;
    }
    /***************
	 $ Methods
	 ***************/
    /* jQuery: Support removed for IE<9. */
    $.isPlainObject = function(obj) {
        var key;
        if (!obj || $.type(obj) !== "object" || obj.nodeType || $.isWindow(obj)) {
            return false;
        }
        try {
            if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                return false;
            }
        } catch (e) {
            return false;
        }
        for (key in obj) {}
        return key === undefined || hasOwn.call(obj, key);
    };
    /* jQuery */
    $.each = function(obj, callback, args) {
        var value, i = 0, length = obj.length, isArray = isArraylike(obj);
        if (args) {
            if (isArray) {
                for (;i < length; i++) {
                    value = callback.apply(obj[i], args);
                    if (value === false) {
                        break;
                    }
                }
            } else {
                for (i in obj) {
                    if (!obj.hasOwnProperty(i)) {
                        continue;
                    }
                    value = callback.apply(obj[i], args);
                    if (value === false) {
                        break;
                    }
                }
            }
        } else {
            if (isArray) {
                for (;i < length; i++) {
                    value = callback.call(obj[i], i, obj[i]);
                    if (value === false) {
                        break;
                    }
                }
            } else {
                for (i in obj) {
                    if (!obj.hasOwnProperty(i)) {
                        continue;
                    }
                    value = callback.call(obj[i], i, obj[i]);
                    if (value === false) {
                        break;
                    }
                }
            }
        }
        return obj;
    };
    /* Custom */
    $.data = function(node, key, value) {
        /* $.getData() */
        if (value === undefined) {
            var getId = node[$.expando], store = getId && cache[getId];
            if (key === undefined) {
                return store;
            } else if (store) {
                if (key in store) {
                    return store[key];
                }
            }
        } else if (key !== undefined) {
            var setId = node[$.expando] || (node[$.expando] = ++$.uuid);
            cache[setId] = cache[setId] || {};
            cache[setId][key] = value;
            return value;
        }
    };
    /* Custom */
    $.removeData = function(node, keys) {
        var id = node[$.expando], store = id && cache[id];
        if (store) {
            // Cleanup the entire store if no keys are provided.
            if (!keys) {
                delete cache[id];
            } else {
                $.each(keys, function(_, key) {
                    delete store[key];
                });
            }
        }
    };
    /* jQuery */
    $.extend = function() {
        var src, copyIsArray, copy, name, options, clone, target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;
        if (typeof target === "boolean") {
            deep = target;
            target = arguments[i] || {};
            i++;
        }
        if (typeof target !== "object" && $.type(target) !== "function") {
            target = {};
        }
        if (i === length) {
            target = this;
            i--;
        }
        for (;i < length; i++) {
            if (options = arguments[i]) {
                for (name in options) {
                    if (!options.hasOwnProperty(name)) {
                        continue;
                    }
                    src = target[name];
                    copy = options[name];
                    if (target === copy) {
                        continue;
                    }
                    if (deep && copy && ($.isPlainObject(copy) || (copyIsArray = $.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && $.isArray(src) ? src : [];
                        } else {
                            clone = src && $.isPlainObject(src) ? src : {};
                        }
                        target[name] = $.extend(deep, clone, copy);
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }
        return target;
    };
    /* jQuery 1.4.3 */
    $.queue = function(elem, type, data) {
        function $makeArray(arr, results) {
            var ret = results || [];
            if (arr) {
                if (isArraylike(Object(arr))) {
                    /* $.merge */
                    (function(first, second) {
                        var len = +second.length, j = 0, i = first.length;
                        while (j < len) {
                            first[i++] = second[j++];
                        }
                        if (len !== len) {
                            while (second[j] !== undefined) {
                                first[i++] = second[j++];
                            }
                        }
                        first.length = i;
                        return first;
                    })(ret, typeof arr === "string" ? [ arr ] : arr);
                } else {
                    [].push.call(ret, arr);
                }
            }
            return ret;
        }
        if (!elem) {
            return;
        }
        type = (type || "fx") + "queue";
        var q = $.data(elem, type);
        if (!data) {
            return q || [];
        }
        if (!q || $.isArray(data)) {
            q = $.data(elem, type, $makeArray(data));
        } else {
            q.push(data);
        }
        return q;
    };
    /* jQuery 1.4.3 */
    $.dequeue = function(elems, type) {
        /* Custom: Embed element iteration. */
        $.each(elems.nodeType ? [ elems ] : elems, function(i, elem) {
            type = type || "fx";
            var queue = $.queue(elem, type), fn = queue.shift();
            if (fn === "inprogress") {
                fn = queue.shift();
            }
            if (fn) {
                if (type === "fx") {
                    queue.unshift("inprogress");
                }
                fn.call(elem, function() {
                    $.dequeue(elem, type);
                });
            }
        });
    };
    /******************
	 $.fn Methods
	 ******************/
    /* jQuery */
    $.fn = $.prototype = {
        init: function(selector) {
            /* Just return the element wrapped inside an array; don't proceed with the actual jQuery node wrapping process. */
            if (selector.nodeType) {
                this[0] = selector;
                return this;
            } else {
                throw new Error("Not a DOM node.");
            }
        },
        offset: function() {
            /* jQuery altered code: Dropped disconnected DOM node checking. */
            var box = this[0].getBoundingClientRect ? this[0].getBoundingClientRect() : {
                top: 0,
                left: 0
            };
            return {
                top: box.top + (window.pageYOffset || document.scrollTop || 0) - (document.clientTop || 0),
                left: box.left + (window.pageXOffset || document.scrollLeft || 0) - (document.clientLeft || 0)
            };
        },
        position: function() {
            /* jQuery */
            function offsetParentFn(elem) {
                var offsetParent = elem.offsetParent || document;
                while (offsetParent && (offsetParent.nodeType.toLowerCase !== "html" && offsetParent.style.position === "static")) {
                    offsetParent = offsetParent.offsetParent;
                }
                return offsetParent || document;
            }
            /* Zepto */
            var elem = this[0], offsetParent = offsetParentFn(elem), offset = this.offset(), parentOffset = /^(?:body|html)$/i.test(offsetParent.nodeName) ? {
                top: 0,
                left: 0
            } : $(offsetParent).offset();
            offset.top -= parseFloat(elem.style.marginTop) || 0;
            offset.left -= parseFloat(elem.style.marginLeft) || 0;
            if (offsetParent.style) {
                parentOffset.top += parseFloat(offsetParent.style.borderTopWidth) || 0;
                parentOffset.left += parseFloat(offsetParent.style.borderLeftWidth) || 0;
            }
            return {
                top: offset.top - parentOffset.top,
                left: offset.left - parentOffset.left
            };
        }
    };
    /**********************
	 Private Variables
	 **********************/
    /* For $.data() */
    var cache = {};
    $.expando = "velocity" + new Date().getTime();
    $.uuid = 0;
    /* For $.queue() */
    var class2type = {}, hasOwn = class2type.hasOwnProperty, toString = class2type.toString;
    var types = "Boolean Number String Function Array Date RegExp Object Error".split(" ");
    for (var i = 0; i < types.length; i++) {
        class2type["[object " + types[i] + "]"] = types[i].toLowerCase();
    }
    /* Makes $(node) possible, without having to call init. */
    $.fn.init.prototype = $.fn;
    /* Globalize Velocity onto the window, and assign its Utilities property. */
    window.Velocity = {
        Utilities: $
    };
})(window);

/******************
 Velocity.js
 ******************/
(function(factory) {
    "use strict";
    /* CommonJS module. */
    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = factory();
    } else if (typeof define === "function" && define.amd) {
        define(factory);
    } else {
        factory();
    }
})(function() {
    "use strict";
    return function(global, window, document, undefined) {
        /***************
		 Summary
		 ***************/
        /*
		 - CSS: CSS stack that works independently from the rest of Velocity.
		 - animate(): Core animation method that iterates over the targeted elements and queues the incoming call onto each element individually.
		 - Pre-Queueing: Prepare the element for animation by instantiating its data cache and processing the call's options.
		 - Queueing: The logic that runs once the call has reached its point of execution in the element's $.queue() stack.
		 Most logic is placed here to avoid risking it becoming stale (if the element's properties have changed).
		 - Pushing: Consolidation of the tween data followed by its push onto the global in-progress calls container.
		 - tick(): The single requestAnimationFrame loop responsible for tweening all in-progress calls.
		 - completeCall(): Handles the cleanup process for each Velocity call.
		 */
        /*********************
		 Helper Functions
		 *********************/
        /* IE detection. Gist: https://gist.github.com/julianshapiro/9098609 */
        var IE = function() {
            if (document.documentMode) {
                return document.documentMode;
            } else {
                for (var i = 7; i > 4; i--) {
                    var div = document.createElement("div");
                    div.innerHTML = "<!--[if IE " + i + "]><span></span><![endif]-->";
                    if (div.getElementsByTagName("span").length) {
                        div = null;
                        return i;
                    }
                }
            }
            return undefined;
        }();
        /* rAF shim. Gist: https://gist.github.com/julianshapiro/9497513 */
        var rAFShim = function() {
            var timeLast = 0;
            return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
                var timeCurrent = new Date().getTime(), timeDelta;
                /* Dynamically set delay on a per-tick basis to match 60fps. */
                /* Technique by Erik Moller. MIT license: https://gist.github.com/paulirish/1579671 */
                timeDelta = Math.max(0, 16 - (timeCurrent - timeLast));
                timeLast = timeCurrent + timeDelta;
                return setTimeout(function() {
                    callback(timeCurrent + timeDelta);
                }, timeDelta);
            };
        }();
        /* Array compacting. Copyright Lo-Dash. MIT License: https://github.com/lodash/lodash/blob/master/LICENSE.txt */
        function compactSparseArray(array) {
            var index = -1, length = array ? array.length : 0, result = [];
            while (++index < length) {
                var value = array[index];
                if (value) {
                    result.push(value);
                }
            }
            return result;
        }
        function sanitizeElements(elements) {
            /* Unwrap jQuery/Zepto objects. */
            if (Type.isWrapped(elements)) {
                elements = [].slice.call(elements);
            } else if (Type.isNode(elements)) {
                elements = [ elements ];
            }
            return elements;
        }
        var Type = {
            isString: function(variable) {
                return typeof variable === "string";
            },
            isArray: Array.isArray || function(variable) {
                return Object.prototype.toString.call(variable) === "[object Array]";
            },
            isFunction: function(variable) {
                return Object.prototype.toString.call(variable) === "[object Function]";
            },
            isNode: function(variable) {
                return variable && variable.nodeType;
            },
            /* Copyright Martin Bohm. MIT License: https://gist.github.com/Tomalak/818a78a226a0738eaade */
            isNodeList: function(variable) {
                return typeof variable === "object" && /^\[object (HTMLCollection|NodeList|Object)\]$/.test(Object.prototype.toString.call(variable)) && variable.length !== undefined && (variable.length === 0 || typeof variable[0] === "object" && variable[0].nodeType > 0);
            },
            /* Determine if variable is a wrapped jQuery or Zepto element. */
            isWrapped: function(variable) {
                return variable && (variable.jquery || window.Zepto && window.Zepto.zepto.isZ(variable));
            },
            isSVG: function(variable) {
                return window.SVGElement && variable instanceof window.SVGElement;
            },
            isEmptyObject: function(variable) {
                for (var name in variable) {
                    if (variable.hasOwnProperty(name)) {
                        return false;
                    }
                }
                return true;
            }
        };
        /*****************
		 Dependencies
		 *****************/
        var $, isJQuery = false;
        if (global.fn && global.fn.jquery) {
            $ = global;
            isJQuery = true;
        } else {
            $ = window.Velocity.Utilities;
        }
        if (IE <= 8 && !isJQuery) {
            throw new Error("Velocity: IE8 and below require jQuery to be loaded before Velocity.");
        } else if (IE <= 7) {
            /* Revert to jQuery's $.animate(), and lose Velocity's extra features. */
            jQuery.fn.velocity = jQuery.fn.animate;
            /* Now that $.fn.velocity is aliased, abort this Velocity declaration. */
            return;
        }
        /*****************
		 Constants
		 *****************/
        var DURATION_DEFAULT = 400, EASING_DEFAULT = "swing";
        /*************
		 State
		 *************/
        var Velocity = {
            /* Container for page-wide Velocity state data. */
            State: {
                /* Detect mobile devices to determine if mobileHA should be turned on. */
                isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                /* The mobileHA option's behavior changes on older Android devices (Gingerbread, versions 2.3.3-2.3.7). */
                isAndroid: /Android/i.test(navigator.userAgent),
                isGingerbread: /Android 2\.3\.[3-7]/i.test(navigator.userAgent),
                isChrome: window.chrome,
                isFirefox: /Firefox/i.test(navigator.userAgent),
                /* Create a cached element for re-use when checking for CSS property prefixes. */
                prefixElement: document.createElement("div"),
                /* Cache every prefix match to avoid repeating lookups. */
                prefixMatches: {},
                /* Cache the anchor used for animating window scrolling. */
                scrollAnchor: null,
                /* Cache the browser-specific property names associated with the scroll anchor. */
                scrollPropertyLeft: null,
                scrollPropertyTop: null,
                /* Keep track of whether our RAF tick is running. */
                isTicking: false,
                /* Container for every in-progress call to Velocity. */
                calls: []
            },
            /* Velocity's custom CSS stack. Made global for unit testing. */
            CSS: {},
            /* A shim of the jQuery utility functions used by Velocity -- provided by Velocity's optional jQuery shim. */
            Utilities: $,
            /* Container for the user's custom animation redirects that are referenced by name in place of the properties map argument. */
            Redirects: {},
            Easings: {},
            /* Attempt to use ES6 Promises by default. Users can override this with a third-party promises library. */
            Promise: window.Promise,
            /* Velocity option defaults, which can be overriden by the user. */
            defaults: {
                queue: "",
                duration: DURATION_DEFAULT,
                easing: EASING_DEFAULT,
                begin: undefined,
                complete: undefined,
                progress: undefined,
                display: undefined,
                visibility: undefined,
                loop: false,
                delay: false,
                mobileHA: true,
                /* Advanced: Set to false to prevent property values from being cached between consecutive Velocity-initiated chain calls. */
                _cacheValues: true,
                /* Advanced: Set to false if the promise should always resolve on empty element lists. */
                promiseRejectEmpty: true
            },
            /* A design goal of Velocity is to cache data wherever possible in order to avoid DOM requerying. Accordingly, each element has a data cache. */
            init: function(element) {
                $.data(element, "velocity", {
                    /* Store whether this is an SVG element, since its properties are retrieved and updated differently than standard HTML elements. */
                    isSVG: Type.isSVG(element),
                    /* Keep track of whether the element is currently being animated by Velocity.
					 This is used to ensure that property values are not transferred between non-consecutive (stale) calls. */
                    isAnimating: false,
                    /* A reference to the element's live computedStyle object. Learn more here: https://developer.mozilla.org/en/docs/Web/API/window.getComputedStyle */
                    computedStyle: null,
                    /* Tween data is cached for each animation on the element so that data can be passed across calls --
					 in particular, end values are used as subsequent start values in consecutive Velocity calls. */
                    tweensContainer: null,
                    /* The full root property values of each CSS hook being animated on this element are cached so that:
					 1) Concurrently-animating hooks sharing the same root can have their root values' merged into one while tweening.
					 2) Post-hook-injection root values can be transferred over to consecutively chained Velocity calls as starting root values. */
                    rootPropertyValueCache: {},
                    /* A cache for transform updates, which must be manually flushed via CSS.flushTransformCache(). */
                    transformCache: {}
                });
            },
            /* A parallel to jQuery's $.css(), used for getting/setting Velocity's hooked CSS properties. */
            hook: null,
            /* Defined below. */
            /* Velocity-wide animation time remapping for testing purposes. */
            mock: false,
            version: {
                major: 1,
                minor: 3,
                patch: 1
            },
            /* Set to 1 or 2 (most verbose) to output debug info to console. */
            debug: false,
            /* Use rAF high resolution timestamp when available */
            timestamp: true
        };
        /* Retrieve the appropriate scroll anchor and property name for the browser: https://developer.mozilla.org/en-US/docs/Web/API/Window.scrollY */
        if (window.pageYOffset !== undefined) {
            Velocity.State.scrollAnchor = window;
            Velocity.State.scrollPropertyLeft = "pageXOffset";
            Velocity.State.scrollPropertyTop = "pageYOffset";
        } else {
            Velocity.State.scrollAnchor = document.documentElement || document.body.parentNode || document.body;
            Velocity.State.scrollPropertyLeft = "scrollLeft";
            Velocity.State.scrollPropertyTop = "scrollTop";
        }
        /* Shorthand alias for jQuery's $.data() utility. */
        function Data(element) {
            /* Hardcode a reference to the plugin name. */
            var response = $.data(element, "velocity");
            /* jQuery <=1.4.2 returns null instead of undefined when no match is found. We normalize this behavior. */
            return response === null ? undefined : response;
        }
        /**************
		 Easing
		 **************/
        /* Step easing generator. */
        function generateStep(steps) {
            return function(p) {
                return Math.round(p * steps) * (1 / steps);
            };
        }
        /* Bezier curve function generator. Copyright Gaetan Renaudeau. MIT License: http://en.wikipedia.org/wiki/MIT_License */
        function generateBezier(mX1, mY1, mX2, mY2) {
            var NEWTON_ITERATIONS = 4, NEWTON_MIN_SLOPE = .001, SUBDIVISION_PRECISION = 1e-7, SUBDIVISION_MAX_ITERATIONS = 10, kSplineTableSize = 11, kSampleStepSize = 1 / (kSplineTableSize - 1), float32ArraySupported = "Float32Array" in window;
            /* Must contain four arguments. */
            if (arguments.length !== 4) {
                return false;
            }
            /* Arguments must be numbers. */
            for (var i = 0; i < 4; ++i) {
                if (typeof arguments[i] !== "number" || isNaN(arguments[i]) || !isFinite(arguments[i])) {
                    return false;
                }
            }
            /* X values must be in the [0, 1] range. */
            mX1 = Math.min(mX1, 1);
            mX2 = Math.min(mX2, 1);
            mX1 = Math.max(mX1, 0);
            mX2 = Math.max(mX2, 0);
            var mSampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
            function A(aA1, aA2) {
                return 1 - 3 * aA2 + 3 * aA1;
            }
            function B(aA1, aA2) {
                return 3 * aA2 - 6 * aA1;
            }
            function C(aA1) {
                return 3 * aA1;
            }
            function calcBezier(aT, aA1, aA2) {
                return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
            }
            function getSlope(aT, aA1, aA2) {
                return 3 * A(aA1, aA2) * aT * aT + 2 * B(aA1, aA2) * aT + C(aA1);
            }
            function newtonRaphsonIterate(aX, aGuessT) {
                for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
                    var currentSlope = getSlope(aGuessT, mX1, mX2);
                    if (currentSlope === 0) {
                        return aGuessT;
                    }
                    var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
                    aGuessT -= currentX / currentSlope;
                }
                return aGuessT;
            }
            function calcSampleValues() {
                for (var i = 0; i < kSplineTableSize; ++i) {
                    mSampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
                }
            }
            function binarySubdivide(aX, aA, aB) {
                var currentX, currentT, i = 0;
                do {
                    currentT = aA + (aB - aA) / 2;
                    currentX = calcBezier(currentT, mX1, mX2) - aX;
                    if (currentX > 0) {
                        aB = currentT;
                    } else {
                        aA = currentT;
                    }
                } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
                return currentT;
            }
            function getTForX(aX) {
                var intervalStart = 0, currentSample = 1, lastSample = kSplineTableSize - 1;
                for (;currentSample !== lastSample && mSampleValues[currentSample] <= aX; ++currentSample) {
                    intervalStart += kSampleStepSize;
                }
                --currentSample;
                var dist = (aX - mSampleValues[currentSample]) / (mSampleValues[currentSample + 1] - mSampleValues[currentSample]), guessForT = intervalStart + dist * kSampleStepSize, initialSlope = getSlope(guessForT, mX1, mX2);
                if (initialSlope >= NEWTON_MIN_SLOPE) {
                    return newtonRaphsonIterate(aX, guessForT);
                } else if (initialSlope === 0) {
                    return guessForT;
                } else {
                    return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize);
                }
            }
            var _precomputed = false;
            function precompute() {
                _precomputed = true;
                if (mX1 !== mY1 || mX2 !== mY2) {
                    calcSampleValues();
                }
            }
            var f = function(aX) {
                if (!_precomputed) {
                    precompute();
                }
                if (mX1 === mY1 && mX2 === mY2) {
                    return aX;
                }
                if (aX === 0) {
                    return 0;
                }
                if (aX === 1) {
                    return 1;
                }
                return calcBezier(getTForX(aX), mY1, mY2);
            };
            f.getControlPoints = function() {
                return [ {
                    x: mX1,
                    y: mY1
                }, {
                    x: mX2,
                    y: mY2
                } ];
            };
            var str = "generateBezier(" + [ mX1, mY1, mX2, mY2 ] + ")";
            f.toString = function() {
                return str;
            };
            return f;
        }
        /* Runge-Kutta spring physics function generator. Adapted from Framer.js, copyright Koen Bok. MIT License: http://en.wikipedia.org/wiki/MIT_License */
        /* Given a tension, friction, and duration, a simulation at 60FPS will first run without a defined duration in order to calculate the full path. A second pass
		 then adjusts the time delta -- using the relation between actual time and duration -- to calculate the path for the duration-constrained animation. */
        var generateSpringRK4 = function() {
            function springAccelerationForState(state) {
                return -state.tension * state.x - state.friction * state.v;
            }
            function springEvaluateStateWithDerivative(initialState, dt, derivative) {
                var state = {
                    x: initialState.x + derivative.dx * dt,
                    v: initialState.v + derivative.dv * dt,
                    tension: initialState.tension,
                    friction: initialState.friction
                };
                return {
                    dx: state.v,
                    dv: springAccelerationForState(state)
                };
            }
            function springIntegrateState(state, dt) {
                var a = {
                    dx: state.v,
                    dv: springAccelerationForState(state)
                }, b = springEvaluateStateWithDerivative(state, dt * .5, a), c = springEvaluateStateWithDerivative(state, dt * .5, b), d = springEvaluateStateWithDerivative(state, dt, c), dxdt = 1 / 6 * (a.dx + 2 * (b.dx + c.dx) + d.dx), dvdt = 1 / 6 * (a.dv + 2 * (b.dv + c.dv) + d.dv);
                state.x = state.x + dxdt * dt;
                state.v = state.v + dvdt * dt;
                return state;
            }
            return function springRK4Factory(tension, friction, duration) {
                var initState = {
                    x: -1,
                    v: 0,
                    tension: null,
                    friction: null
                }, path = [ 0 ], time_lapsed = 0, tolerance = 1 / 1e4, DT = 16 / 1e3, have_duration, dt, last_state;
                tension = parseFloat(tension) || 500;
                friction = parseFloat(friction) || 20;
                duration = duration || null;
                initState.tension = tension;
                initState.friction = friction;
                have_duration = duration !== null;
                /* Calculate the actual time it takes for this animation to complete with the provided conditions. */
                if (have_duration) {
                    /* Run the simulation without a duration. */
                    time_lapsed = springRK4Factory(tension, friction);
                    /* Compute the adjusted time delta. */
                    dt = time_lapsed / duration * DT;
                } else {
                    dt = DT;
                }
                while (true) {
                    /* Next/step function .*/
                    last_state = springIntegrateState(last_state || initState, dt);
                    /* Store the position. */
                    path.push(1 + last_state.x);
                    time_lapsed += 16;
                    /* If the change threshold is reached, break. */
                    if (!(Math.abs(last_state.x) > tolerance && Math.abs(last_state.v) > tolerance)) {
                        break;
                    }
                }
                /* If duration is not defined, return the actual time required for completing this animation. Otherwise, return a closure that holds the
				 computed path and returns a snapshot of the position according to a given percentComplete. */
                return !have_duration ? time_lapsed : function(percentComplete) {
                    return path[percentComplete * (path.length - 1) | 0];
                };
            };
        }();
        /* jQuery easings. */
        Velocity.Easings = {
            linear: function(p) {
                return p;
            },
            swing: function(p) {
                return .5 - Math.cos(p * Math.PI) / 2;
            },
            /* Bonus "spring" easing, which is a less exaggerated version of easeInOutElastic. */
            spring: function(p) {
                return 1 - Math.cos(p * 4.5 * Math.PI) * Math.exp(-p * 6);
            }
        };
        /* CSS3 and Robert Penner easings. */
        $.each([ [ "ease", [ .25, .1, .25, 1 ] ], [ "ease-in", [ .42, 0, 1, 1 ] ], [ "ease-out", [ 0, 0, .58, 1 ] ], [ "ease-in-out", [ .42, 0, .58, 1 ] ], [ "easeInSine", [ .47, 0, .745, .715 ] ], [ "easeOutSine", [ .39, .575, .565, 1 ] ], [ "easeInOutSine", [ .445, .05, .55, .95 ] ], [ "easeInQuad", [ .55, .085, .68, .53 ] ], [ "easeOutQuad", [ .25, .46, .45, .94 ] ], [ "easeInOutQuad", [ .455, .03, .515, .955 ] ], [ "easeInCubic", [ .55, .055, .675, .19 ] ], [ "easeOutCubic", [ .215, .61, .355, 1 ] ], [ "easeInOutCubic", [ .645, .045, .355, 1 ] ], [ "easeInQuart", [ .895, .03, .685, .22 ] ], [ "easeOutQuart", [ .165, .84, .44, 1 ] ], [ "easeInOutQuart", [ .77, 0, .175, 1 ] ], [ "easeInQuint", [ .755, .05, .855, .06 ] ], [ "easeOutQuint", [ .23, 1, .32, 1 ] ], [ "easeInOutQuint", [ .86, 0, .07, 1 ] ], [ "easeInExpo", [ .95, .05, .795, .035 ] ], [ "easeOutExpo", [ .19, 1, .22, 1 ] ], [ "easeInOutExpo", [ 1, 0, 0, 1 ] ], [ "easeInCirc", [ .6, .04, .98, .335 ] ], [ "easeOutCirc", [ .075, .82, .165, 1 ] ], [ "easeInOutCirc", [ .785, .135, .15, .86 ] ] ], function(i, easingArray) {
            Velocity.Easings[easingArray[0]] = generateBezier.apply(null, easingArray[1]);
        });
        /* Determine the appropriate easing type given an easing input. */
        function getEasing(value, duration) {
            var easing = value;
            /* The easing option can either be a string that references a pre-registered easing,
			 or it can be a two-/four-item array of integers to be converted into a bezier/spring function. */
            if (Type.isString(value)) {
                /* Ensure that the easing has been assigned to jQuery's Velocity.Easings object. */
                if (!Velocity.Easings[value]) {
                    easing = false;
                }
            } else if (Type.isArray(value) && value.length === 1) {
                easing = generateStep.apply(null, value);
            } else if (Type.isArray(value) && value.length === 2) {
                /* springRK4 must be passed the animation's duration. */
                /* Note: If the springRK4 array contains non-numbers, generateSpringRK4() returns an easing
				 function generated with default tension and friction values. */
                easing = generateSpringRK4.apply(null, value.concat([ duration ]));
            } else if (Type.isArray(value) && value.length === 4) {
                /* Note: If the bezier array contains non-numbers, generateBezier() returns false. */
                easing = generateBezier.apply(null, value);
            } else {
                easing = false;
            }
            /* Revert to the Velocity-wide default easing type, or fall back to "swing" (which is also jQuery's default)
			 if the Velocity-wide default has been incorrectly modified. */
            if (easing === false) {
                if (Velocity.Easings[Velocity.defaults.easing]) {
                    easing = Velocity.defaults.easing;
                } else {
                    easing = EASING_DEFAULT;
                }
            }
            return easing;
        }
        /*****************
		 CSS Stack
		 *****************/
        /* The CSS object is a highly condensed and performant CSS stack that fully replaces jQuery's.
		 It handles the validation, getting, and setting of both standard CSS properties and CSS property hooks. */
        /* Note: A "CSS" shorthand is aliased so that our code is easier to read. */
        var CSS = Velocity.CSS = {
            /*************
			 RegEx
			 *************/
            RegEx: {
                isHex: /^#([A-f\d]{3}){1,2}$/i,
                /* Unwrap a property value's surrounding text, e.g. "rgba(4, 3, 2, 1)" ==> "4, 3, 2, 1" and "rect(4px 3px 2px 1px)" ==> "4px 3px 2px 1px". */
                valueUnwrap: /^[A-z]+\((.*)\)$/i,
                wrappedValueAlreadyExtracted: /[0-9.]+ [0-9.]+ [0-9.]+( [0-9.]+)?/,
                /* Split a multi-value property into an array of subvalues, e.g. "rgba(4, 3, 2, 1) 4px 3px 2px 1px" ==> [ "rgba(4, 3, 2, 1)", "4px", "3px", "2px", "1px" ]. */
                valueSplit: /([A-z]+\(.+\))|(([A-z0-9#-.]+?)(?=\s|$))/gi
            },
            /************
			 Lists
			 ************/
            Lists: {
                colors: [ "fill", "stroke", "stopColor", "color", "backgroundColor", "borderColor", "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor", "outlineColor" ],
                transformsBase: [ "translateX", "translateY", "scale", "scaleX", "scaleY", "skewX", "skewY", "rotateZ" ],
                transforms3D: [ "transformPerspective", "translateZ", "scaleZ", "rotateX", "rotateY" ]
            },
            /************
			 Hooks
			 ************/
            /* Hooks allow a subproperty (e.g. "boxShadowBlur") of a compound-value CSS property
			 (e.g. "boxShadow: X Y Blur Spread Color") to be animated as if it were a discrete property. */
            /* Note: Beyond enabling fine-grained property animation, hooking is necessary since Velocity only
			 tweens properties with single numeric values; unlike CSS transitions, Velocity does not interpolate compound-values. */
            Hooks: {
                /********************
				 Registration
				 ********************/
                /* Templates are a concise way of indicating which subproperties must be individually registered for each compound-value CSS property. */
                /* Each template consists of the compound-value's base name, its constituent subproperty names, and those subproperties' default values. */
                templates: {
                    textShadow: [ "Color X Y Blur", "black 0px 0px 0px" ],
                    boxShadow: [ "Color X Y Blur Spread", "black 0px 0px 0px 0px" ],
                    clip: [ "Top Right Bottom Left", "0px 0px 0px 0px" ],
                    backgroundPosition: [ "X Y", "0% 0%" ],
                    transformOrigin: [ "X Y Z", "50% 50% 0px" ],
                    perspectiveOrigin: [ "X Y", "50% 50%" ]
                },
                /* A "registered" hook is one that has been converted from its template form into a live,
				 tweenable property. It contains data to associate it with its root property. */
                registered: {},
                /* Convert the templates into individual hooks then append them to the registered object above. */
                register: function() {
                    /* Color hooks registration: Colors are defaulted to white -- as opposed to black -- since colors that are
					 currently set to "transparent" default to their respective template below when color-animated,
					 and white is typically a closer match to transparent than black is. An exception is made for text ("color"),
					 which is almost always set closer to black than white. */
                    for (var i = 0; i < CSS.Lists.colors.length; i++) {
                        var rgbComponents = CSS.Lists.colors[i] === "color" ? "0 0 0 1" : "255 255 255 1";
                        CSS.Hooks.templates[CSS.Lists.colors[i]] = [ "Red Green Blue Alpha", rgbComponents ];
                    }
                    var rootProperty, hookTemplate, hookNames;
                    /* In IE, color values inside compound-value properties are positioned at the end the value instead of at the beginning.
					 Thus, we re-arrange the templates accordingly. */
                    if (IE) {
                        for (rootProperty in CSS.Hooks.templates) {
                            if (!CSS.Hooks.templates.hasOwnProperty(rootProperty)) {
                                continue;
                            }
                            hookTemplate = CSS.Hooks.templates[rootProperty];
                            hookNames = hookTemplate[0].split(" ");
                            var defaultValues = hookTemplate[1].match(CSS.RegEx.valueSplit);
                            if (hookNames[0] === "Color") {
                                /* Reposition both the hook's name and its default value to the end of their respective strings. */
                                hookNames.push(hookNames.shift());
                                defaultValues.push(defaultValues.shift());
                                /* Replace the existing template for the hook's root property. */
                                CSS.Hooks.templates[rootProperty] = [ hookNames.join(" "), defaultValues.join(" ") ];
                            }
                        }
                    }
                    /* Hook registration. */
                    for (rootProperty in CSS.Hooks.templates) {
                        if (!CSS.Hooks.templates.hasOwnProperty(rootProperty)) {
                            continue;
                        }
                        hookTemplate = CSS.Hooks.templates[rootProperty];
                        hookNames = hookTemplate[0].split(" ");
                        for (var j in hookNames) {
                            if (!hookNames.hasOwnProperty(j)) {
                                continue;
                            }
                            var fullHookName = rootProperty + hookNames[j], hookPosition = j;
                            /* For each hook, register its full name (e.g. textShadowBlur) with its root property (e.g. textShadow)
							 and the hook's position in its template's default value string. */
                            CSS.Hooks.registered[fullHookName] = [ rootProperty, hookPosition ];
                        }
                    }
                },
                /*****************************
				 Injection and Extraction
				 *****************************/
                /* Look up the root property associated with the hook (e.g. return "textShadow" for "textShadowBlur"). */
                /* Since a hook cannot be set directly (the browser won't recognize it), style updating for hooks is routed through the hook's root property. */
                getRoot: function(property) {
                    var hookData = CSS.Hooks.registered[property];
                    if (hookData) {
                        return hookData[0];
                    } else {
                        /* If there was no hook match, return the property name untouched. */
                        return property;
                    }
                },
                /* Convert any rootPropertyValue, null or otherwise, into a space-delimited list of hook values so that
				 the targeted hook can be injected or extracted at its standard position. */
                cleanRootPropertyValue: function(rootProperty, rootPropertyValue) {
                    /* If the rootPropertyValue is wrapped with "rgb()", "clip()", etc., remove the wrapping to normalize the value before manipulation. */
                    if (CSS.RegEx.valueUnwrap.test(rootPropertyValue)) {
                        rootPropertyValue = rootPropertyValue.match(CSS.RegEx.valueUnwrap)[1];
                    }
                    /* If rootPropertyValue is a CSS null-value (from which there's inherently no hook value to extract),
					 default to the root's default value as defined in CSS.Hooks.templates. */
                    /* Note: CSS null-values include "none", "auto", and "transparent". They must be converted into their
					 zero-values (e.g. textShadow: "none" ==> textShadow: "0px 0px 0px black") for hook manipulation to proceed. */
                    if (CSS.Values.isCSSNullValue(rootPropertyValue)) {
                        rootPropertyValue = CSS.Hooks.templates[rootProperty][1];
                    }
                    return rootPropertyValue;
                },
                /* Extracted the hook's value from its root property's value. This is used to get the starting value of an animating hook. */
                extractValue: function(fullHookName, rootPropertyValue) {
                    var hookData = CSS.Hooks.registered[fullHookName];
                    if (hookData) {
                        var hookRoot = hookData[0], hookPosition = hookData[1];
                        rootPropertyValue = CSS.Hooks.cleanRootPropertyValue(hookRoot, rootPropertyValue);
                        /* Split rootPropertyValue into its constituent hook values then grab the desired hook at its standard position. */
                        return rootPropertyValue.toString().match(CSS.RegEx.valueSplit)[hookPosition];
                    } else {
                        /* If the provided fullHookName isn't a registered hook, return the rootPropertyValue that was passed in. */
                        return rootPropertyValue;
                    }
                },
                /* Inject the hook's value into its root property's value. This is used to piece back together the root property
				 once Velocity has updated one of its individually hooked values through tweening. */
                injectValue: function(fullHookName, hookValue, rootPropertyValue) {
                    var hookData = CSS.Hooks.registered[fullHookName];
                    if (hookData) {
                        var hookRoot = hookData[0], hookPosition = hookData[1], rootPropertyValueParts, rootPropertyValueUpdated;
                        rootPropertyValue = CSS.Hooks.cleanRootPropertyValue(hookRoot, rootPropertyValue);
                        /* Split rootPropertyValue into its individual hook values, replace the targeted value with hookValue,
						 then reconstruct the rootPropertyValue string. */
                        rootPropertyValueParts = rootPropertyValue.toString().match(CSS.RegEx.valueSplit);
                        rootPropertyValueParts[hookPosition] = hookValue;
                        rootPropertyValueUpdated = rootPropertyValueParts.join(" ");
                        return rootPropertyValueUpdated;
                    } else {
                        /* If the provided fullHookName isn't a registered hook, return the rootPropertyValue that was passed in. */
                        return rootPropertyValue;
                    }
                }
            },
            /*******************
			 Normalizations
			 *******************/
            /* Normalizations standardize CSS property manipulation by pollyfilling browser-specific implementations (e.g. opacity)
			 and reformatting special properties (e.g. clip, rgba) to look like standard ones. */
            Normalizations: {
                /* Normalizations are passed a normalization target (either the property's name, its extracted value, or its injected value),
				 the targeted element (which may need to be queried), and the targeted property value. */
                registered: {
                    clip: function(type, element, propertyValue) {
                        switch (type) {
                          case "name":
                            return "clip";

                          /* Clip needs to be unwrapped and stripped of its commas during extraction. */
                            case "extract":
                            var extracted;
                            /* If Velocity also extracted this value, skip extraction. */
                            if (CSS.RegEx.wrappedValueAlreadyExtracted.test(propertyValue)) {
                                extracted = propertyValue;
                            } else {
                                /* Remove the "rect()" wrapper. */
                                extracted = propertyValue.toString().match(CSS.RegEx.valueUnwrap);
                                /* Strip off commas. */
                                extracted = extracted ? extracted[1].replace(/,(\s+)?/g, " ") : propertyValue;
                            }
                            return extracted;

                          /* Clip needs to be re-wrapped during injection. */
                            case "inject":
                            return "rect(" + propertyValue + ")";
                        }
                    },
                    blur: function(type, element, propertyValue) {
                        switch (type) {
                          case "name":
                            return Velocity.State.isFirefox ? "filter" : "-webkit-filter";

                          case "extract":
                            var extracted = parseFloat(propertyValue);
                            /* If extracted is NaN, meaning the value isn't already extracted. */
                            if (!(extracted || extracted === 0)) {
                                var blurComponent = propertyValue.toString().match(/blur\(([0-9]+[A-z]+)\)/i);
                                /* If the filter string had a blur component, return just the blur value and unit type. */
                                if (blurComponent) {
                                    extracted = blurComponent[1];
                                } else {
                                    extracted = 0;
                                }
                            }
                            return extracted;

                          /* Blur needs to be re-wrapped during injection. */
                            case "inject":
                            /* For the blur effect to be fully de-applied, it needs to be set to "none" instead of 0. */
                            if (!parseFloat(propertyValue)) {
                                return "none";
                            } else {
                                return "blur(" + propertyValue + ")";
                            }
                        }
                    },
                    /* <=IE8 do not support the standard opacity property. They use filter:alpha(opacity=INT) instead. */
                    opacity: function(type, element, propertyValue) {
                        if (IE <= 8) {
                            switch (type) {
                              case "name":
                                return "filter";

                              case "extract":
                                /* <=IE8 return a "filter" value of "alpha(opacity=\d{1,3})".
									 Extract the value and convert it to a decimal value to match the standard CSS opacity property's formatting. */
                                var extracted = propertyValue.toString().match(/alpha\(opacity=(.*)\)/i);
                                if (extracted) {
                                    /* Convert to decimal value. */
                                    propertyValue = extracted[1] / 100;
                                } else {
                                    /* When extracting opacity, default to 1 since a null value means opacity hasn't been set. */
                                    propertyValue = 1;
                                }
                                return propertyValue;

                              case "inject":
                                /* Opacified elements are required to have their zoom property set to a non-zero value. */
                                element.style.zoom = 1;
                                /* Setting the filter property on elements with certain font property combinations can result in a
									 highly unappealing ultra-bolding effect. There's no way to remedy this throughout a tween, but dropping the
									 value altogether (when opacity hits 1) at leasts ensures that the glitch is gone post-tweening. */
                                if (parseFloat(propertyValue) >= 1) {
                                    return "";
                                } else {
                                    /* As per the filter property's spec, convert the decimal value to a whole number and wrap the value. */
                                    return "alpha(opacity=" + parseInt(parseFloat(propertyValue) * 100, 10) + ")";
                                }
                            }
                        } else {
                            switch (type) {
                              case "name":
                                return "opacity";

                              case "extract":
                                return propertyValue;

                              case "inject":
                                return propertyValue;
                            }
                        }
                    }
                },
                /*****************************
				 Batched Registrations
				 *****************************/
                /* Note: Batched normalizations extend the CSS.Normalizations.registered object. */
                register: function() {
                    /*****************
					 Transforms
					 *****************/
                    /* Transforms are the subproperties contained by the CSS "transform" property. Transforms must undergo normalization
					 so that they can be referenced in a properties map by their individual names. */
                    /* Note: When transforms are "set", they are actually assigned to a per-element transformCache. When all transform
					 setting is complete complete, CSS.flushTransformCache() must be manually called to flush the values to the DOM.
					 Transform setting is batched in this way to improve performance: the transform style only needs to be updated
					 once when multiple transform subproperties are being animated simultaneously. */
                    /* Note: IE9 and Android Gingerbread have support for 2D -- but not 3D -- transforms. Since animating unsupported
					 transform properties results in the browser ignoring the *entire* transform string, we prevent these 3D values
					 from being normalized for these browsers so that tweening skips these properties altogether
					 (since it will ignore them as being unsupported by the browser.) */
                    if ((!IE || IE > 9) && !Velocity.State.isGingerbread) {
                        /* Note: Since the standalone CSS "perspective" property and the CSS transform "perspective" subproperty
						 share the same name, the latter is given a unique token within Velocity: "transformPerspective". */
                        CSS.Lists.transformsBase = CSS.Lists.transformsBase.concat(CSS.Lists.transforms3D);
                    }
                    for (var i = 0; i < CSS.Lists.transformsBase.length; i++) {
                        /* Wrap the dynamically generated normalization function in a new scope so that transformName's value is
						 paired with its respective function. (Otherwise, all functions would take the final for loop's transformName.) */
                        (function() {
                            var transformName = CSS.Lists.transformsBase[i];
                            CSS.Normalizations.registered[transformName] = function(type, element, propertyValue) {
                                switch (type) {
                                  /* The normalized property name is the parent "transform" property -- the property that is actually set in CSS. */
                                    case "name":
                                    return "transform";

                                  /* Transform values are cached onto a per-element transformCache object. */
                                    case "extract":
                                    /* If this transform has yet to be assigned a value, return its null value. */
                                    if (Data(element) === undefined || Data(element).transformCache[transformName] === undefined) {
                                        /* Scale CSS.Lists.transformsBase default to 1 whereas all other transform properties default to 0. */
                                        return /^scale/i.test(transformName) ? 1 : 0;
                                    }
                                    return Data(element).transformCache[transformName].replace(/[()]/g, "");

                                  case "inject":
                                    var invalid = false;
                                    /* If an individual transform property contains an unsupported unit type, the browser ignores the *entire* transform property.
										 Thus, protect users from themselves by skipping setting for transform values supplied with invalid unit types. */
                                    /* Switch on the base transform type; ignore the axis by removing the last letter from the transform's name. */
                                    switch (transformName.substr(0, transformName.length - 1)) {
                                      /* Whitelist unit types for each transform. */
                                        case "translate":
                                        invalid = !/(%|px|em|rem|vw|vh|\d)$/i.test(propertyValue);
                                        break;

                                      /* Since an axis-free "scale" property is supported as well, a little hack is used here to detect it by chopping off its last letter. */
                                        case "scal":
                                      case "scale":
                                        /* Chrome on Android has a bug in which scaled elements blur if their initial scale
												 value is below 1 (which can happen with forcefeeding). Thus, we detect a yet-unset scale property
												 and ensure that its first value is always 1. More info: http://stackoverflow.com/questions/10417890/css3-animations-with-transform-causes-blurred-elements-on-webkit/10417962#10417962 */
                                        if (Velocity.State.isAndroid && Data(element).transformCache[transformName] === undefined && propertyValue < 1) {
                                            propertyValue = 1;
                                        }
                                        invalid = !/(\d)$/i.test(propertyValue);
                                        break;

                                      case "skew":
                                        invalid = !/(deg|\d)$/i.test(propertyValue);
                                        break;

                                      case "rotate":
                                        invalid = !/(deg|\d)$/i.test(propertyValue);
                                        break;
                                    }
                                    if (!invalid) {
                                        /* As per the CSS spec, wrap the value in parentheses. */
                                        Data(element).transformCache[transformName] = "(" + propertyValue + ")";
                                    }
                                    /* Although the value is set on the transformCache object, return the newly-updated value for the calling code to process as normal. */
                                    return Data(element).transformCache[transformName];
                                }
                            };
                        })();
                    }
                    /*************
					 Colors
					 *************/
                    /* Since Velocity only animates a single numeric value per property, color animation is achieved by hooking the individual RGBA components of CSS color properties.
					 Accordingly, color values must be normalized (e.g. "#ff0000", "red", and "rgb(255, 0, 0)" ==> "255 0 0 1") so that their components can be injected/extracted by CSS.Hooks logic. */
                    for (var j = 0; j < CSS.Lists.colors.length; j++) {
                        /* Wrap the dynamically generated normalization function in a new scope so that colorName's value is paired with its respective function.
						 (Otherwise, all functions would take the final for loop's colorName.) */
                        (function() {
                            var colorName = CSS.Lists.colors[j];
                            /* Note: In IE<=8, which support rgb but not rgba, color properties are reverted to rgb by stripping off the alpha component. */
                            CSS.Normalizations.registered[colorName] = function(type, element, propertyValue) {
                                switch (type) {
                                  case "name":
                                    return colorName;

                                  /* Convert all color values into the rgb format. (Old IE can return hex values and color names instead of rgb/rgba.) */
                                    case "extract":
                                    var extracted;
                                    /* If the color is already in its hookable form (e.g. "255 255 255 1") due to having been previously extracted, skip extraction. */
                                    if (CSS.RegEx.wrappedValueAlreadyExtracted.test(propertyValue)) {
                                        extracted = propertyValue;
                                    } else {
                                        var converted, colorNames = {
                                            black: "rgb(0, 0, 0)",
                                            blue: "rgb(0, 0, 255)",
                                            gray: "rgb(128, 128, 128)",
                                            green: "rgb(0, 128, 0)",
                                            red: "rgb(255, 0, 0)",
                                            white: "rgb(255, 255, 255)"
                                        };
                                        /* Convert color names to rgb. */
                                        if (/^[A-z]+$/i.test(propertyValue)) {
                                            if (colorNames[propertyValue] !== undefined) {
                                                converted = colorNames[propertyValue];
                                            } else {
                                                /* If an unmatched color name is provided, default to black. */
                                                converted = colorNames.black;
                                            }
                                        } else if (CSS.RegEx.isHex.test(propertyValue)) {
                                            converted = "rgb(" + CSS.Values.hexToRgb(propertyValue).join(" ") + ")";
                                        } else if (!/^rgba?\(/i.test(propertyValue)) {
                                            converted = colorNames.black;
                                        }
                                        /* Remove the surrounding "rgb/rgba()" string then replace commas with spaces and strip
											 repeated spaces (in case the value included spaces to begin with). */
                                        extracted = (converted || propertyValue).toString().match(CSS.RegEx.valueUnwrap)[1].replace(/,(\s+)?/g, " ");
                                    }
                                    /* So long as this isn't <=IE8, add a fourth (alpha) component if it's missing and default it to 1 (visible). */
                                    if ((!IE || IE > 8) && extracted.split(" ").length === 3) {
                                        extracted += " 1";
                                    }
                                    return extracted;

                                  case "inject":
                                    /* If this is IE<=8 and an alpha component exists, strip it off. */
                                    if (IE <= 8) {
                                        if (propertyValue.split(" ").length === 4) {
                                            propertyValue = propertyValue.split(/\s+/).slice(0, 3).join(" ");
                                        }
                                    } else if (propertyValue.split(" ").length === 3) {
                                        propertyValue += " 1";
                                    }
                                    /* Re-insert the browser-appropriate wrapper("rgb/rgba()"), insert commas, and strip off decimal units
										 on all values but the fourth (R, G, and B only accept whole numbers). */
                                    return (IE <= 8 ? "rgb" : "rgba") + "(" + propertyValue.replace(/\s+/g, ",").replace(/\.(\d)+(?=,)/g, "") + ")";
                                }
                            };
                        })();
                    }
                    /**************
					 Dimensions
					 **************/
                    function augmentDimension(name, element, wantInner) {
                        var isBorderBox = CSS.getPropertyValue(element, "boxSizing").toString().toLowerCase() === "border-box";
                        if (isBorderBox === (wantInner || false)) {
                            /* in box-sizing mode, the CSS width / height accessors already give the outerWidth / outerHeight. */
                            var i, value, augment = 0, sides = name === "width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ], fields = [ "padding" + sides[0], "padding" + sides[1], "border" + sides[0] + "Width", "border" + sides[1] + "Width" ];
                            for (i = 0; i < fields.length; i++) {
                                value = parseFloat(CSS.getPropertyValue(element, fields[i]));
                                if (!isNaN(value)) {
                                    augment += value;
                                }
                            }
                            return wantInner ? -augment : augment;
                        }
                        return 0;
                    }
                    function getDimension(name, wantInner) {
                        return function(type, element, propertyValue) {
                            switch (type) {
                              case "name":
                                return name;

                              case "extract":
                                return parseFloat(propertyValue) + augmentDimension(name, element, wantInner);

                              case "inject":
                                return parseFloat(propertyValue) - augmentDimension(name, element, wantInner) + "px";
                            }
                        };
                    }
                    CSS.Normalizations.registered.innerWidth = getDimension("width", true);
                    CSS.Normalizations.registered.innerHeight = getDimension("height", true);
                    CSS.Normalizations.registered.outerWidth = getDimension("width");
                    CSS.Normalizations.registered.outerHeight = getDimension("height");
                }
            },
            /************************
			 CSS Property Names
			 ************************/
            Names: {
                /* Camelcase a property name into its JavaScript notation (e.g. "background-color" ==> "backgroundColor").
				 Camelcasing is used to normalize property names between and across calls. */
                camelCase: function(property) {
                    return property.replace(/-(\w)/g, function(match, subMatch) {
                        return subMatch.toUpperCase();
                    });
                },
                /* For SVG elements, some properties (namely, dimensional ones) are GET/SET via the element's HTML attributes (instead of via CSS styles). */
                SVGAttribute: function(property) {
                    var SVGAttributes = "width|height|x|y|cx|cy|r|rx|ry|x1|x2|y1|y2";
                    /* Certain browsers require an SVG transform to be applied as an attribute. (Otherwise, application via CSS is preferable due to 3D support.) */
                    if (IE || Velocity.State.isAndroid && !Velocity.State.isChrome) {
                        SVGAttributes += "|transform";
                    }
                    return new RegExp("^(" + SVGAttributes + ")$", "i").test(property);
                },
                /* Determine whether a property should be set with a vendor prefix. */
                /* If a prefixed version of the property exists, return it. Otherwise, return the original property name.
				 If the property is not at all supported by the browser, return a false flag. */
                prefixCheck: function(property) {
                    /* If this property has already been checked, return the cached value. */
                    if (Velocity.State.prefixMatches[property]) {
                        return [ Velocity.State.prefixMatches[property], true ];
                    } else {
                        var vendors = [ "", "Webkit", "Moz", "ms", "O" ];
                        for (var i = 0, vendorsLength = vendors.length; i < vendorsLength; i++) {
                            var propertyPrefixed;
                            if (i === 0) {
                                propertyPrefixed = property;
                            } else {
                                /* Capitalize the first letter of the property to conform to JavaScript vendor prefix notation (e.g. webkitFilter). */
                                propertyPrefixed = vendors[i] + property.replace(/^\w/, function(match) {
                                    return match.toUpperCase();
                                });
                            }
                            /* Check if the browser supports this property as prefixed. */
                            if (Type.isString(Velocity.State.prefixElement.style[propertyPrefixed])) {
                                /* Cache the match. */
                                Velocity.State.prefixMatches[property] = propertyPrefixed;
                                return [ propertyPrefixed, true ];
                            }
                        }
                        /* If the browser doesn't support this property in any form, include a false flag so that the caller can decide how to proceed. */
                        return [ property, false ];
                    }
                }
            },
            /************************
			 CSS Property Values
			 ************************/
            Values: {
                /* Hex to RGB conversion. Copyright Tim Down: http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb */
                hexToRgb: function(hex) {
                    var shortformRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i, longformRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i, rgbParts;
                    hex = hex.replace(shortformRegex, function(m, r, g, b) {
                        return r + r + g + g + b + b;
                    });
                    rgbParts = longformRegex.exec(hex);
                    return rgbParts ? [ parseInt(rgbParts[1], 16), parseInt(rgbParts[2], 16), parseInt(rgbParts[3], 16) ] : [ 0, 0, 0 ];
                },
                isCSSNullValue: function(value) {
                    /* The browser defaults CSS values that have not been set to either 0 or one of several possible null-value strings.
					 Thus, we check for both falsiness and these special strings. */
                    /* Null-value checking is performed to default the special strings to 0 (for the sake of tweening) or their hook
					 templates as defined as CSS.Hooks (for the sake of hook injection/extraction). */
                    /* Note: Chrome returns "rgba(0, 0, 0, 0)" for an undefined color whereas IE returns "transparent". */
                    return !value || /^(none|auto|transparent|(rgba\(0, ?0, ?0, ?0\)))$/i.test(value);
                },
                /* Retrieve a property's default unit type. Used for assigning a unit type when one is not supplied by the user. */
                getUnitType: function(property) {
                    if (/^(rotate|skew)/i.test(property)) {
                        return "deg";
                    } else if (/(^(scale|scaleX|scaleY|scaleZ|alpha|flexGrow|flexHeight|zIndex|fontWeight)$)|((opacity|red|green|blue|alpha)$)/i.test(property)) {
                        /* The above properties are unitless. */
                        return "";
                    } else {
                        /* Default to px for all other properties. */
                        return "px";
                    }
                },
                /* HTML elements default to an associated display type when they're not set to display:none. */
                /* Note: This function is used for correctly setting the non-"none" display value in certain Velocity redirects, such as fadeIn/Out. */
                getDisplayType: function(element) {
                    var tagName = element && element.tagName.toString().toLowerCase();
                    if (/^(b|big|i|small|tt|abbr|acronym|cite|code|dfn|em|kbd|strong|samp|var|a|bdo|br|img|map|object|q|script|span|sub|sup|button|input|label|select|textarea)$/i.test(tagName)) {
                        return "inline";
                    } else if (/^(li)$/i.test(tagName)) {
                        return "list-item";
                    } else if (/^(tr)$/i.test(tagName)) {
                        return "table-row";
                    } else if (/^(table)$/i.test(tagName)) {
                        return "table";
                    } else if (/^(tbody)$/i.test(tagName)) {
                        return "table-row-group";
                    } else {
                        return "block";
                    }
                },
                /* The class add/remove functions are used to temporarily apply a "velocity-animating" class to elements while they're animating. */
                addClass: function(element, className) {
                    if (element.classList) {
                        element.classList.add(className);
                    } else {
                        element.className += (element.className.length ? " " : "") + className;
                    }
                },
                removeClass: function(element, className) {
                    if (element.classList) {
                        element.classList.remove(className);
                    } else {
                        element.className = element.className.toString().replace(new RegExp("(^|\\s)" + className.split(" ").join("|") + "(\\s|$)", "gi"), " ");
                    }
                }
            },
            /****************************
			 Style Getting & Setting
			 ****************************/
            /* The singular getPropertyValue, which routes the logic for all normalizations, hooks, and standard CSS properties. */
            getPropertyValue: function(element, property, rootPropertyValue, forceStyleLookup) {
                /* Get an element's computed property value. */
                /* Note: Retrieving the value of a CSS property cannot simply be performed by checking an element's
				 style attribute (which only reflects user-defined values). Instead, the browser must be queried for a property's
				 *computed* value. You can read more about getComputedStyle here: https://developer.mozilla.org/en/docs/Web/API/window.getComputedStyle */
                function computePropertyValue(element, property) {
                    /* When box-sizing isn't set to border-box, height and width style values are incorrectly computed when an
					 element's scrollbars are visible (which expands the element's dimensions). Thus, we defer to the more accurate
					 offsetHeight/Width property, which includes the total dimensions for interior, border, padding, and scrollbar.
					 We subtract border and padding to get the sum of interior + scrollbar. */
                    var computedValue = 0;
                    /* IE<=8 doesn't support window.getComputedStyle, thus we defer to jQuery, which has an extensive array
					 of hacks to accurately retrieve IE8 property values. Re-implementing that logic here is not worth bloating the
					 codebase for a dying browser. The performance repercussions of using jQuery here are minimal since
					 Velocity is optimized to rarely (and sometimes never) query the DOM. Further, the $.css() codepath isn't that slow. */
                    if (IE <= 8) {
                        computedValue = $.css(element, property);
                    } else {
                        /* Browsers do not return height and width values for elements that are set to display:"none". Thus, we temporarily
						 toggle display to the element type's default value. */
                        var toggleDisplay = false;
                        if (/^(width|height)$/.test(property) && CSS.getPropertyValue(element, "display") === 0) {
                            toggleDisplay = true;
                            CSS.setPropertyValue(element, "display", CSS.Values.getDisplayType(element));
                        }
                        var revertDisplay = function() {
                            if (toggleDisplay) {
                                CSS.setPropertyValue(element, "display", "none");
                            }
                        };
                        if (!forceStyleLookup) {
                            if (property === "height" && CSS.getPropertyValue(element, "boxSizing").toString().toLowerCase() !== "border-box") {
                                var contentBoxHeight = element.offsetHeight - (parseFloat(CSS.getPropertyValue(element, "borderTopWidth")) || 0) - (parseFloat(CSS.getPropertyValue(element, "borderBottomWidth")) || 0) - (parseFloat(CSS.getPropertyValue(element, "paddingTop")) || 0) - (parseFloat(CSS.getPropertyValue(element, "paddingBottom")) || 0);
                                revertDisplay();
                                return contentBoxHeight;
                            } else if (property === "width" && CSS.getPropertyValue(element, "boxSizing").toString().toLowerCase() !== "border-box") {
                                var contentBoxWidth = element.offsetWidth - (parseFloat(CSS.getPropertyValue(element, "borderLeftWidth")) || 0) - (parseFloat(CSS.getPropertyValue(element, "borderRightWidth")) || 0) - (parseFloat(CSS.getPropertyValue(element, "paddingLeft")) || 0) - (parseFloat(CSS.getPropertyValue(element, "paddingRight")) || 0);
                                revertDisplay();
                                return contentBoxWidth;
                            }
                        }
                        var computedStyle;
                        /* For elements that Velocity hasn't been called on directly (e.g. when Velocity queries the DOM on behalf
						 of a parent of an element its animating), perform a direct getComputedStyle lookup since the object isn't cached. */
                        if (Data(element) === undefined) {
                            computedStyle = window.getComputedStyle(element, null);
                        } else if (!Data(element).computedStyle) {
                            computedStyle = Data(element).computedStyle = window.getComputedStyle(element, null);
                        } else {
                            computedStyle = Data(element).computedStyle;
                        }
                        /* IE and Firefox do not return a value for the generic borderColor -- they only return individual values for each border side's color.
						 Also, in all browsers, when border colors aren't all the same, a compound value is returned that Velocity isn't setup to parse.
						 So, as a polyfill for querying individual border side colors, we just return the top border's color and animate all borders from that value. */
                        if (property === "borderColor") {
                            property = "borderTopColor";
                        }
                        /* IE9 has a bug in which the "filter" property must be accessed from computedStyle using the getPropertyValue method
						 instead of a direct property lookup. The getPropertyValue method is slower than a direct lookup, which is why we avoid it by default. */
                        if (IE === 9 && property === "filter") {
                            computedValue = computedStyle.getPropertyValue(property);
                        } else {
                            computedValue = computedStyle[property];
                        }
                        /* Fall back to the property's style value (if defined) when computedValue returns nothing,
						 which can happen when the element hasn't been painted. */
                        if (computedValue === "" || computedValue === null) {
                            computedValue = element.style[property];
                        }
                        revertDisplay();
                    }
                    /* For top, right, bottom, and left (TRBL) values that are set to "auto" on elements of "fixed" or "absolute" position,
					 defer to jQuery for converting "auto" to a numeric value. (For elements with a "static" or "relative" position, "auto" has the same
					 effect as being set to 0, so no conversion is necessary.) */
                    /* An example of why numeric conversion is necessary: When an element with "position:absolute" has an untouched "left"
					 property, which reverts to "auto", left's value is 0 relative to its parent element, but is often non-zero relative
					 to its *containing* (not parent) element, which is the nearest "position:relative" ancestor or the viewport (and always the viewport in the case of "position:fixed"). */
                    if (computedValue === "auto" && /^(top|right|bottom|left)$/i.test(property)) {
                        var position = computePropertyValue(element, "position");
                        /* GET */
                        /* For absolute positioning, jQuery's $.position() only returns values for top and left;
						 right and bottom will have their "auto" value reverted to 0. */
                        /* Note: A jQuery object must be created here since jQuery doesn't have a low-level alias for $.position().
						 Not a big deal since we're currently in a GET batch anyway. */
                        if (position === "fixed" || position === "absolute" && /top|left/i.test(property)) {
                            /* Note: jQuery strips the pixel unit from its returned values; we re-add it here to conform with computePropertyValue's behavior. */
                            computedValue = $(element).position()[property] + "px";
                        }
                    }
                    return computedValue;
                }
                var propertyValue;
                /* If this is a hooked property (e.g. "clipLeft" instead of the root property of "clip"),
				 extract the hook's value from a normalized rootPropertyValue using CSS.Hooks.extractValue(). */
                if (CSS.Hooks.registered[property]) {
                    var hook = property, hookRoot = CSS.Hooks.getRoot(hook);
                    /* If a cached rootPropertyValue wasn't passed in (which Velocity always attempts to do in order to avoid requerying the DOM),
					 query the DOM for the root property's value. */
                    if (rootPropertyValue === undefined) {
                        /* Since the browser is now being directly queried, use the official post-prefixing property name for this lookup. */
                        rootPropertyValue = CSS.getPropertyValue(element, CSS.Names.prefixCheck(hookRoot)[0]);
                    }
                    /* If this root has a normalization registered, peform the associated normalization extraction. */
                    if (CSS.Normalizations.registered[hookRoot]) {
                        rootPropertyValue = CSS.Normalizations.registered[hookRoot]("extract", element, rootPropertyValue);
                    }
                    /* Extract the hook's value. */
                    propertyValue = CSS.Hooks.extractValue(hook, rootPropertyValue);
                } else if (CSS.Normalizations.registered[property]) {
                    var normalizedPropertyName, normalizedPropertyValue;
                    normalizedPropertyName = CSS.Normalizations.registered[property]("name", element);
                    /* Transform values are calculated via normalization extraction (see below), which checks against the element's transformCache.
					 At no point do transform GETs ever actually query the DOM; initial stylesheet values are never processed.
					 This is because parsing 3D transform matrices is not always accurate and would bloat our codebase;
					 thus, normalization extraction defaults initial transform values to their zero-values (e.g. 1 for scaleX and 0 for translateX). */
                    if (normalizedPropertyName !== "transform") {
                        normalizedPropertyValue = computePropertyValue(element, CSS.Names.prefixCheck(normalizedPropertyName)[0]);
                        /* GET */
                        /* If the value is a CSS null-value and this property has a hook template, use that zero-value template so that hooks can be extracted from it. */
                        if (CSS.Values.isCSSNullValue(normalizedPropertyValue) && CSS.Hooks.templates[property]) {
                            normalizedPropertyValue = CSS.Hooks.templates[property][1];
                        }
                    }
                    propertyValue = CSS.Normalizations.registered[property]("extract", element, normalizedPropertyValue);
                }
                /* If a (numeric) value wasn't produced via hook extraction or normalization, query the DOM. */
                if (!/^[\d-]/.test(propertyValue)) {
                    /* For SVG elements, dimensional properties (which SVGAttribute() detects) are tweened via
					 their HTML attribute values instead of their CSS style values. */
                    var data = Data(element);
                    if (data && data.isSVG && CSS.Names.SVGAttribute(property)) {
                        /* Since the height/width attribute values must be set manually, they don't reflect computed values.
						 Thus, we use use getBBox() to ensure we always get values for elements with undefined height/width attributes. */
                        if (/^(height|width)$/i.test(property)) {
                            /* Firefox throws an error if .getBBox() is called on an SVG that isn't attached to the DOM. */
                            try {
                                propertyValue = element.getBBox()[property];
                            } catch (error) {
                                propertyValue = 0;
                            }
                        } else {
                            propertyValue = element.getAttribute(property);
                        }
                    } else {
                        propertyValue = computePropertyValue(element, CSS.Names.prefixCheck(property)[0]);
                    }
                }
                /* Since property lookups are for animation purposes (which entails computing the numeric delta between start and end values),
				 convert CSS null-values to an integer of value 0. */
                if (CSS.Values.isCSSNullValue(propertyValue)) {
                    propertyValue = 0;
                }
                if (Velocity.debug >= 2) {
                    console.log("Get " + property + ": " + propertyValue);
                }
                return propertyValue;
            },
            /* The singular setPropertyValue, which routes the logic for all normalizations, hooks, and standard CSS properties. */
            setPropertyValue: function(element, property, propertyValue, rootPropertyValue, scrollData) {
                var propertyName = property;
                /* In order to be subjected to call options and element queueing, scroll animation is routed through Velocity as if it were a standard CSS property. */
                if (property === "scroll") {
                    /* If a container option is present, scroll the container instead of the browser window. */
                    if (scrollData.container) {
                        scrollData.container["scroll" + scrollData.direction] = propertyValue;
                    } else {
                        if (scrollData.direction === "Left") {
                            window.scrollTo(propertyValue, scrollData.alternateValue);
                        } else {
                            window.scrollTo(scrollData.alternateValue, propertyValue);
                        }
                    }
                } else {
                    /* Transforms (translateX, rotateZ, etc.) are applied to a per-element transformCache object, which is manually flushed via flushTransformCache().
					 Thus, for now, we merely cache transforms being SET. */
                    if (CSS.Normalizations.registered[property] && CSS.Normalizations.registered[property]("name", element) === "transform") {
                        /* Perform a normalization injection. */
                        /* Note: The normalization logic handles the transformCache updating. */
                        CSS.Normalizations.registered[property]("inject", element, propertyValue);
                        propertyName = "transform";
                        propertyValue = Data(element).transformCache[property];
                    } else {
                        /* Inject hooks. */
                        if (CSS.Hooks.registered[property]) {
                            var hookName = property, hookRoot = CSS.Hooks.getRoot(property);
                            /* If a cached rootPropertyValue was not provided, query the DOM for the hookRoot's current value. */
                            rootPropertyValue = rootPropertyValue || CSS.getPropertyValue(element, hookRoot);
                            /* GET */
                            propertyValue = CSS.Hooks.injectValue(hookName, propertyValue, rootPropertyValue);
                            property = hookRoot;
                        }
                        /* Normalize names and values. */
                        if (CSS.Normalizations.registered[property]) {
                            propertyValue = CSS.Normalizations.registered[property]("inject", element, propertyValue);
                            property = CSS.Normalizations.registered[property]("name", element);
                        }
                        /* Assign the appropriate vendor prefix before performing an official style update. */
                        propertyName = CSS.Names.prefixCheck(property)[0];
                        /* A try/catch is used for IE<=8, which throws an error when "invalid" CSS values are set, e.g. a negative width.
						 Try/catch is avoided for other browsers since it incurs a performance overhead. */
                        if (IE <= 8) {
                            try {
                                element.style[propertyName] = propertyValue;
                            } catch (error) {
                                if (Velocity.debug) {
                                    console.log("Browser does not support [" + propertyValue + "] for [" + propertyName + "]");
                                }
                            }
                        } else {
                            var data = Data(element);
                            if (data && data.isSVG && CSS.Names.SVGAttribute(property)) {
                                /* Note: For SVG attributes, vendor-prefixed property names are never used. */
                                /* Note: Not all CSS properties can be animated via attributes, but the browser won't throw an error for unsupported properties. */
                                element.setAttribute(property, propertyValue);
                            } else {
                                element.style[propertyName] = propertyValue;
                            }
                        }
                        if (Velocity.debug >= 2) {
                            console.log("Set " + property + " (" + propertyName + "): " + propertyValue);
                        }
                    }
                }
                /* Return the normalized property name and value in case the caller wants to know how these values were modified before being applied to the DOM. */
                return [ propertyName, propertyValue ];
            },
            /* To increase performance by batching transform updates into a single SET, transforms are not directly applied to an element until flushTransformCache() is called. */
            /* Note: Velocity applies transform properties in the same order that they are chronogically introduced to the element's CSS styles. */
            flushTransformCache: function(element) {
                var transformString = "", data = Data(element);
                /* Certain browsers require that SVG transforms be applied as an attribute. However, the SVG transform attribute takes a modified version of CSS's transform string
				 (units are dropped and, except for skewX/Y, subproperties are merged into their master property -- e.g. scaleX and scaleY are merged into scale(X Y). */
                if ((IE || Velocity.State.isAndroid && !Velocity.State.isChrome) && data && data.isSVG) {
                    /* Since transform values are stored in their parentheses-wrapped form, we use a helper function to strip out their numeric values.
					 Further, SVG transform properties only take unitless (representing pixels) values, so it's okay that parseFloat() strips the unit suffixed to the float value. */
                    var getTransformFloat = function(transformProperty) {
                        return parseFloat(CSS.getPropertyValue(element, transformProperty));
                    };
                    /* Create an object to organize all the transforms that we'll apply to the SVG element. To keep the logic simple,
					 we process *all* transform properties -- even those that may not be explicitly applied (since they default to their zero-values anyway). */
                    var SVGTransforms = {
                        translate: [ getTransformFloat("translateX"), getTransformFloat("translateY") ],
                        skewX: [ getTransformFloat("skewX") ],
                        skewY: [ getTransformFloat("skewY") ],
                        /* If the scale property is set (non-1), use that value for the scaleX and scaleY values
						 (this behavior mimics the result of animating all these properties at once on HTML elements). */
                        scale: getTransformFloat("scale") !== 1 ? [ getTransformFloat("scale"), getTransformFloat("scale") ] : [ getTransformFloat("scaleX"), getTransformFloat("scaleY") ],
                        /* Note: SVG's rotate transform takes three values: rotation degrees followed by the X and Y values
						 defining the rotation's origin point. We ignore the origin values (default them to 0). */
                        rotate: [ getTransformFloat("rotateZ"), 0, 0 ]
                    };
                    /* Iterate through the transform properties in the user-defined property map order.
					 (This mimics the behavior of non-SVG transform animation.) */
                    $.each(Data(element).transformCache, function(transformName) {
                        /* Except for with skewX/Y, revert the axis-specific transform subproperties to their axis-free master
						 properties so that they match up with SVG's accepted transform properties. */
                        if (/^translate/i.test(transformName)) {
                            transformName = "translate";
                        } else if (/^scale/i.test(transformName)) {
                            transformName = "scale";
                        } else if (/^rotate/i.test(transformName)) {
                            transformName = "rotate";
                        }
                        /* Check that we haven't yet deleted the property from the SVGTransforms container. */
                        if (SVGTransforms[transformName]) {
                            /* Append the transform property in the SVG-supported transform format. As per the spec, surround the space-delimited values in parentheses. */
                            transformString += transformName + "(" + SVGTransforms[transformName].join(" ") + ")" + " ";
                            /* After processing an SVG transform property, delete it from the SVGTransforms container so we don't
							 re-insert the same master property if we encounter another one of its axis-specific properties. */
                            delete SVGTransforms[transformName];
                        }
                    });
                } else {
                    var transformValue, perspective;
                    /* Transform properties are stored as members of the transformCache object. Concatenate all the members into a string. */
                    $.each(Data(element).transformCache, function(transformName) {
                        transformValue = Data(element).transformCache[transformName];
                        /* Transform's perspective subproperty must be set first in order to take effect. Store it temporarily. */
                        if (transformName === "transformPerspective") {
                            perspective = transformValue;
                            return true;
                        }
                        /* IE9 only supports one rotation type, rotateZ, which it refers to as "rotate". */
                        if (IE === 9 && transformName === "rotateZ") {
                            transformName = "rotate";
                        }
                        transformString += transformName + transformValue + " ";
                    });
                    /* If present, set the perspective subproperty first. */
                    if (perspective) {
                        transformString = "perspective" + perspective + " " + transformString;
                    }
                }
                CSS.setPropertyValue(element, "transform", transformString);
            }
        };
        /* Register hooks and normalizations. */
        CSS.Hooks.register();
        CSS.Normalizations.register();
        /* Allow hook setting in the same fashion as jQuery's $.css(). */
        Velocity.hook = function(elements, arg2, arg3) {
            var value;
            elements = sanitizeElements(elements);
            $.each(elements, function(i, element) {
                /* Initialize Velocity's per-element data cache if this element hasn't previously been animated. */
                if (Data(element) === undefined) {
                    Velocity.init(element);
                }
                /* Get property value. If an element set was passed in, only return the value for the first element. */
                if (arg3 === undefined) {
                    if (value === undefined) {
                        value = CSS.getPropertyValue(element, arg2);
                    }
                } else {
                    /* sPV returns an array of the normalized propertyName/propertyValue pair used to update the DOM. */
                    var adjustedSet = CSS.setPropertyValue(element, arg2, arg3);
                    /* Transform properties don't automatically set. They have to be flushed to the DOM. */
                    if (adjustedSet[0] === "transform") {
                        Velocity.CSS.flushTransformCache(element);
                    }
                    value = adjustedSet;
                }
            });
            return value;
        };
        /*****************
		 Animation
		 *****************/
        var animate = function() {
            var opts;
            /******************
			 Call Chain
			 ******************/
            /* Logic for determining what to return to the call stack when exiting out of Velocity. */
            function getChain() {
                /* If we are using the utility function, attempt to return this call's promise. If no promise library was detected,
				 default to null instead of returning the targeted elements so that utility function's return value is standardized. */
                if (isUtility) {
                    return promiseData.promise || null;
                } else {
                    return elementsWrapped;
                }
            }
            /*************************
			 Arguments Assignment
			 *************************/
            /* To allow for expressive CoffeeScript code, Velocity supports an alternative syntax in which "elements" (or "e"), "properties" (or "p"), and "options" (or "o")
			 objects are defined on a container object that's passed in as Velocity's sole argument. */
            /* Note: Some browsers automatically populate arguments with a "properties" object. We detect it by checking for its default "names" property. */
            var syntacticSugar = arguments[0] && (arguments[0].p || ($.isPlainObject(arguments[0].properties) && !arguments[0].properties.names || Type.isString(arguments[0].properties))), /* Whether Velocity was called via the utility function (as opposed to on a jQuery/Zepto object). */
            isUtility, /* When Velocity is called via the utility function ($.Velocity()/Velocity()), elements are explicitly
					 passed in as the first parameter. Thus, argument positioning varies. We normalize them here. */
            elementsWrapped, argumentIndex;
            var elements, propertiesMap, options;
            /* Detect jQuery/Zepto elements being animated via the $.fn method. */
            if (Type.isWrapped(this)) {
                isUtility = false;
                argumentIndex = 0;
                elements = this;
                elementsWrapped = this;
            } else {
                isUtility = true;
                argumentIndex = 1;
                elements = syntacticSugar ? arguments[0].elements || arguments[0].e : arguments[0];
            }
            /***************
			 Promises
			 ***************/
            var promiseData = {
                promise: null,
                resolver: null,
                rejecter: null
            };
            /* If this call was made via the utility function (which is the default method of invocation when jQuery/Zepto are not being used), and if
			 promise support was detected, create a promise object for this call and store references to its resolver and rejecter methods. The resolve
			 method is used when a call completes naturally or is prematurely stopped by the user. In both cases, completeCall() handles the associated
			 call cleanup and promise resolving logic. The reject method is used when an invalid set of arguments is passed into a Velocity call. */
            /* Note: Velocity employs a call-based queueing architecture, which means that stopping an animating element actually stops the full call that
			 triggered it -- not that one element exclusively. Similarly, there is one promise per call, and all elements targeted by a Velocity call are
			 grouped together for the purposes of resolving and rejecting a promise. */
            if (isUtility && Velocity.Promise) {
                promiseData.promise = new Velocity.Promise(function(resolve, reject) {
                    promiseData.resolver = resolve;
                    promiseData.rejecter = reject;
                });
            }
            if (syntacticSugar) {
                propertiesMap = arguments[0].properties || arguments[0].p;
                options = arguments[0].options || arguments[0].o;
            } else {
                propertiesMap = arguments[argumentIndex];
                options = arguments[argumentIndex + 1];
            }
            elements = sanitizeElements(elements);
            if (!elements) {
                if (promiseData.promise) {
                    if (!propertiesMap || !options || options.promiseRejectEmpty !== false) {
                        promiseData.rejecter();
                    } else {
                        promiseData.resolver();
                    }
                }
                return;
            }
            /* The length of the element set (in the form of a nodeList or an array of elements) is defaulted to 1 in case a
			 single raw DOM element is passed in (which doesn't contain a length property). */
            var elementsLength = elements.length, elementsIndex = 0;
            /***************************
			 Argument Overloading
			 ***************************/
            /* Support is included for jQuery's argument overloading: $.animate(propertyMap [, duration] [, easing] [, complete]).
			 Overloading is detected by checking for the absence of an object being passed into options. */
            /* Note: The stop and finish actions do not accept animation options, and are therefore excluded from this check. */
            if (!/^(stop|finish|finishAll)$/i.test(propertiesMap) && !$.isPlainObject(options)) {
                /* The utility function shifts all arguments one position to the right, so we adjust for that offset. */
                var startingArgumentPosition = argumentIndex + 1;
                options = {};
                /* Iterate through all options arguments */
                for (var i = startingArgumentPosition; i < arguments.length; i++) {
                    /* Treat a number as a duration. Parse it out. */
                    /* Note: The following RegEx will return true if passed an array with a number as its first item.
					 Thus, arrays are skipped from this check. */
                    if (!Type.isArray(arguments[i]) && (/^(fast|normal|slow)$/i.test(arguments[i]) || /^\d/.test(arguments[i]))) {
                        options.duration = arguments[i];
                    } else if (Type.isString(arguments[i]) || Type.isArray(arguments[i])) {
                        options.easing = arguments[i];
                    } else if (Type.isFunction(arguments[i])) {
                        options.complete = arguments[i];
                    }
                }
            }
            /*********************
			 Action Detection
			 *********************/
            /* Velocity's behavior is categorized into "actions": Elements can either be specially scrolled into view,
			 or they can be started, stopped, or reversed. If a literal or referenced properties map is passed in as Velocity's
			 first argument, the associated action is "start". Alternatively, "scroll", "reverse", or "stop" can be passed in instead of a properties map. */
            var action;
            switch (propertiesMap) {
              case "scroll":
                action = "scroll";
                break;

              case "reverse":
                action = "reverse";
                break;

              case "finish":
              case "finishAll":
              case "stop":
                /*******************
					 Action: Stop
					 *******************/
                /* Clear the currently-active delay on each targeted element. */
                $.each(elements, function(i, element) {
                    if (Data(element) && Data(element).delayTimer) {
                        /* Stop the timer from triggering its cached next() function. */
                        clearTimeout(Data(element).delayTimer.setTimeout);
                        /* Manually call the next() function so that the subsequent queue items can progress. */
                        if (Data(element).delayTimer.next) {
                            Data(element).delayTimer.next();
                        }
                        delete Data(element).delayTimer;
                    }
                    /* If we want to finish everything in the queue, we have to iterate through it
						 and call each function. This will make them active calls below, which will
						 cause them to be applied via the duration setting. */
                    if (propertiesMap === "finishAll" && (options === true || Type.isString(options))) {
                        /* Iterate through the items in the element's queue. */
                        $.each($.queue(element, Type.isString(options) ? options : ""), function(_, item) {
                            /* The queue array can contain an "inprogress" string, which we skip. */
                            if (Type.isFunction(item)) {
                                item();
                            }
                        });
                        /* Clearing the $.queue() array is achieved by resetting it to []. */
                        $.queue(element, Type.isString(options) ? options : "", []);
                    }
                });
                var callsToStop = [];
                /* When the stop action is triggered, the elements' currently active call is immediately stopped. The active call might have
					 been applied to multiple elements, in which case all of the call's elements will be stopped. When an element
					 is stopped, the next item in its animation queue is immediately triggered. */
                /* An additional argument may be passed in to clear an element's remaining queued calls. Either true (which defaults to the "fx" queue)
					 or a custom queue string can be passed in. */
                /* Note: The stop command runs prior to Velocity's Queueing phase since its behavior is intended to take effect *immediately*,
					 regardless of the element's current queue state. */
                /* Iterate through every active call. */
                $.each(Velocity.State.calls, function(i, activeCall) {
                    /* Inactive calls are set to false by the logic inside completeCall(). Skip them. */
                    if (activeCall) {
                        /* Iterate through the active call's targeted elements. */
                        $.each(activeCall[1], function(k, activeElement) {
                            /* If true was passed in as a secondary argument, clear absolutely all calls on this element. Otherwise, only
								 clear calls associated with the relevant queue. */
                            /* Call stopping logic works as follows:
								 - options === true --> stop current default queue calls (and queue:false calls), including remaining queued ones.
								 - options === undefined --> stop current queue:"" call and all queue:false calls.
								 - options === false --> stop only queue:false calls.
								 - options === "custom" --> stop current queue:"custom" call, including remaining queued ones (there is no functionality to only clear the currently-running queue:"custom" call). */
                            var queueName = options === undefined ? "" : options;
                            if (queueName !== true && activeCall[2].queue !== queueName && !(options === undefined && activeCall[2].queue === false)) {
                                return true;
                            }
                            /* Iterate through the calls targeted by the stop command. */
                            $.each(elements, function(l, element) {
                                /* Check that this call was applied to the target element. */
                                if (element === activeElement) {
                                    /* Optionally clear the remaining queued calls. If we're doing "finishAll" this won't find anything,
										 due to the queue-clearing above. */
                                    if (options === true || Type.isString(options)) {
                                        /* Iterate through the items in the element's queue. */
                                        $.each($.queue(element, Type.isString(options) ? options : ""), function(_, item) {
                                            /* The queue array can contain an "inprogress" string, which we skip. */
                                            if (Type.isFunction(item)) {
                                                /* Pass the item's callback a flag indicating that we want to abort from the queue call.
													 (Specifically, the queue will resolve the call's associated promise then abort.)  */
                                                item(null, true);
                                            }
                                        });
                                        /* Clearing the $.queue() array is achieved by resetting it to []. */
                                        $.queue(element, Type.isString(options) ? options : "", []);
                                    }
                                    if (propertiesMap === "stop") {
                                        /* Since "reverse" uses cached start values (the previous call's endValues), these values must be
											 changed to reflect the final value that the elements were actually tweened to. */
                                        /* Note: If only queue:false animations are currently running on an element, it won't have a tweensContainer
											 object. Also, queue:false animations can't be reversed. */
                                        var data = Data(element);
                                        if (data && data.tweensContainer && queueName !== false) {
                                            $.each(data.tweensContainer, function(m, activeTween) {
                                                activeTween.endValue = activeTween.currentValue;
                                            });
                                        }
                                        callsToStop.push(i);
                                    } else if (propertiesMap === "finish" || propertiesMap === "finishAll") {
                                        /* To get active tweens to finish immediately, we forcefully shorten their durations to 1ms so that
											 they finish upon the next rAf tick then proceed with normal call completion logic. */
                                        activeCall[2].duration = 1;
                                    }
                                }
                            });
                        });
                    }
                });
                /* Prematurely call completeCall() on each matched active call. Pass an additional flag for "stop" to indicate
					 that the complete callback and display:none setting should be skipped since we're completing prematurely. */
                if (propertiesMap === "stop") {
                    $.each(callsToStop, function(i, j) {
                        completeCall(j, true);
                    });
                    if (promiseData.promise) {
                        /* Immediately resolve the promise associated with this stop call since stop runs synchronously. */
                        promiseData.resolver(elements);
                    }
                }
                /* Since we're stopping, and not proceeding with queueing, exit out of Velocity. */
                return getChain();

              default:
                /* Treat a non-empty plain object as a literal properties map. */
                if ($.isPlainObject(propertiesMap) && !Type.isEmptyObject(propertiesMap)) {
                    action = "start";
                } else if (Type.isString(propertiesMap) && Velocity.Redirects[propertiesMap]) {
                    opts = $.extend({}, options);
                    var durationOriginal = opts.duration, delayOriginal = opts.delay || 0;
                    /* If the backwards option was passed in, reverse the element set so that elements animate from the last to the first. */
                    if (opts.backwards === true) {
                        elements = $.extend(true, [], elements).reverse();
                    }
                    /* Individually trigger the redirect for each element in the set to prevent users from having to handle iteration logic in their redirect. */
                    $.each(elements, function(elementIndex, element) {
                        /* If the stagger option was passed in, successively delay each element by the stagger value (in ms). Retain the original delay value. */
                        if (parseFloat(opts.stagger)) {
                            opts.delay = delayOriginal + parseFloat(opts.stagger) * elementIndex;
                        } else if (Type.isFunction(opts.stagger)) {
                            opts.delay = delayOriginal + opts.stagger.call(element, elementIndex, elementsLength);
                        }
                        /* If the drag option was passed in, successively increase/decrease (depending on the presense of opts.backwards)
							 the duration of each element's animation, using floors to prevent producing very short durations. */
                        if (opts.drag) {
                            /* Default the duration of UI pack effects (callouts and transitions) to 1000ms instead of the usual default duration of 400ms. */
                            opts.duration = parseFloat(durationOriginal) || (/^(callout|transition)/.test(propertiesMap) ? 1e3 : DURATION_DEFAULT);
                            /* For each element, take the greater duration of: A) animation completion percentage relative to the original duration,
								 B) 75% of the original duration, or C) a 200ms fallback (in case duration is already set to a low value).
								 The end result is a baseline of 75% of the redirect's duration that increases/decreases as the end of the element set is approached. */
                            opts.duration = Math.max(opts.duration * (opts.backwards ? 1 - elementIndex / elementsLength : (elementIndex + 1) / elementsLength), opts.duration * .75, 200);
                        }
                        /* Pass in the call's opts object so that the redirect can optionally extend it. It defaults to an empty object instead of null to
							 reduce the opts checking logic required inside the redirect. */
                        Velocity.Redirects[propertiesMap].call(element, element, opts || {}, elementIndex, elementsLength, elements, promiseData.promise ? promiseData : undefined);
                    });
                    /* Since the animation logic resides within the redirect's own code, abort the remainder of this call.
						 (The performance overhead up to this point is virtually non-existant.) */
                    /* Note: The jQuery call chain is kept intact by returning the complete element set. */
                    return getChain();
                } else {
                    var abortError = "Velocity: First argument (" + propertiesMap + ") was not a property map, a known action, or a registered redirect. Aborting.";
                    if (promiseData.promise) {
                        promiseData.rejecter(new Error(abortError));
                    } else {
                        console.log(abortError);
                    }
                    return getChain();
                }
            }
            /**************************
			 Call-Wide Variables
			 **************************/
            /* A container for CSS unit conversion ratios (e.g. %, rem, and em ==> px) that is used to cache ratios across all elements
			 being animated in a single Velocity call. Calculating unit ratios necessitates DOM querying and updating, and is therefore
			 avoided (via caching) wherever possible. This container is call-wide instead of page-wide to avoid the risk of using stale
			 conversion metrics across Velocity animations that are not immediately consecutively chained. */
            var callUnitConversionData = {
                lastParent: null,
                lastPosition: null,
                lastFontSize: null,
                lastPercentToPxWidth: null,
                lastPercentToPxHeight: null,
                lastEmToPx: null,
                remToPx: null,
                vwToPx: null,
                vhToPx: null
            };
            /* A container for all the ensuing tween data and metadata associated with this call. This container gets pushed to the page-wide
			 Velocity.State.calls array that is processed during animation ticking. */
            var call = [];
            /************************
			 Element Processing
			 ************************/
            /* Element processing consists of three parts -- data processing that cannot go stale and data processing that *can* go stale (i.e. third-party style modifications):
			 1) Pre-Queueing: Element-wide variables, including the element's data storage, are instantiated. Call options are prepared. If triggered, the Stop action is executed.
			 2) Queueing: The logic that runs once this call has reached its point of execution in the element's $.queue() stack. Most logic is placed here to avoid risking it becoming stale.
			 3) Pushing: Consolidation of the tween data followed by its push onto the global in-progress calls container.
			 `elementArrayIndex` allows passing index of the element in the original array to value functions.
			 If `elementsIndex` were used instead the index would be determined by the elements' per-element queue.
			 */
            function processElement(element, elementArrayIndex) {
                /*************************
				 Part I: Pre-Queueing
				 *************************/
                /***************************
				 Element-Wide Variables
				 ***************************/
                var /* The runtime opts object is the extension of the current call's options and Velocity's page-wide option defaults. */
                opts = $.extend({}, Velocity.defaults, options), /* A container for the processed data associated with each property in the propertyMap.
						 (Each property in the map produces its own "tween".) */
                tweensContainer = {}, elementUnitConversionData;
                /******************
				 Element Init
				 ******************/
                if (Data(element) === undefined) {
                    Velocity.init(element);
                }
                /******************
				 Option: Delay
				 ******************/
                /* Since queue:false doesn't respect the item's existing queue, we avoid injecting its delay here (it's set later on). */
                /* Note: Velocity rolls its own delay function since jQuery doesn't have a utility alias for $.fn.delay()
				 (and thus requires jQuery element creation, which we avoid since its overhead includes DOM querying). */
                if (parseFloat(opts.delay) && opts.queue !== false) {
                    $.queue(element, opts.queue, function(next) {
                        /* This is a flag used to indicate to the upcoming completeCall() function that this queue entry was initiated by Velocity. See completeCall() for further details. */
                        Velocity.velocityQueueEntryFlag = true;
                        /* The ensuing queue item (which is assigned to the "next" argument that $.queue() automatically passes in) will be triggered after a setTimeout delay.
						 The setTimeout is stored so that it can be subjected to clearTimeout() if this animation is prematurely stopped via Velocity's "stop" command. */
                        Data(element).delayTimer = {
                            setTimeout: setTimeout(next, parseFloat(opts.delay)),
                            next: next
                        };
                    });
                }
                /*********************
				 Option: Duration
				 *********************/
                /* Support for jQuery's named durations. */
                switch (opts.duration.toString().toLowerCase()) {
                  case "fast":
                    opts.duration = 200;
                    break;

                  case "normal":
                    opts.duration = DURATION_DEFAULT;
                    break;

                  case "slow":
                    opts.duration = 600;
                    break;

                  default:
                    /* Remove the potential "ms" suffix and default to 1 if the user is attempting to set a duration of 0 (in order to produce an immediate style change). */
                    opts.duration = parseFloat(opts.duration) || 1;
                }
                /************************
				 Global Option: Mock
				 ************************/
                if (Velocity.mock !== false) {
                    /* In mock mode, all animations are forced to 1ms so that they occur immediately upon the next rAF tick.
					 Alternatively, a multiplier can be passed in to time remap all delays and durations. */
                    if (Velocity.mock === true) {
                        opts.duration = opts.delay = 1;
                    } else {
                        opts.duration *= parseFloat(Velocity.mock) || 1;
                        opts.delay *= parseFloat(Velocity.mock) || 1;
                    }
                }
                /*******************
				 Option: Easing
				 *******************/
                opts.easing = getEasing(opts.easing, opts.duration);
                /**********************
				 Option: Callbacks
				 **********************/
                /* Callbacks must functions. Otherwise, default to null. */
                if (opts.begin && !Type.isFunction(opts.begin)) {
                    opts.begin = null;
                }
                if (opts.progress && !Type.isFunction(opts.progress)) {
                    opts.progress = null;
                }
                if (opts.complete && !Type.isFunction(opts.complete)) {
                    opts.complete = null;
                }
                /*********************************
				 Option: Display & Visibility
				 *********************************/
                /* Refer to Velocity's documentation (VelocityJS.org/#displayAndVisibility) for a description of the display and visibility options' behavior. */
                /* Note: We strictly check for undefined instead of falsiness because display accepts an empty string value. */
                if (opts.display !== undefined && opts.display !== null) {
                    opts.display = opts.display.toString().toLowerCase();
                    /* Users can pass in a special "auto" value to instruct Velocity to set the element to its default display value. */
                    if (opts.display === "auto") {
                        opts.display = Velocity.CSS.Values.getDisplayType(element);
                    }
                }
                if (opts.visibility !== undefined && opts.visibility !== null) {
                    opts.visibility = opts.visibility.toString().toLowerCase();
                }
                /**********************
				 Option: mobileHA
				 **********************/
                /* When set to true, and if this is a mobile device, mobileHA automatically enables hardware acceleration (via a null transform hack)
				 on animating elements. HA is removed from the element at the completion of its animation. */
                /* Note: Android Gingerbread doesn't support HA. If a null transform hack (mobileHA) is in fact set, it will prevent other tranform subproperties from taking effect. */
                /* Note: You can read more about the use of mobileHA in Velocity's documentation: VelocityJS.org/#mobileHA. */
                opts.mobileHA = opts.mobileHA && Velocity.State.isMobile && !Velocity.State.isGingerbread;
                /***********************
				 Part II: Queueing
				 ***********************/
                /* When a set of elements is targeted by a Velocity call, the set is broken up and each element has the current Velocity call individually queued onto it.
				 In this way, each element's existing queue is respected; some elements may already be animating and accordingly should not have this current Velocity call triggered immediately. */
                /* In each queue, tween data is processed for each animating property then pushed onto the call-wide calls array. When the last element in the set has had its tweens processed,
				 the call array is pushed to Velocity.State.calls for live processing by the requestAnimationFrame tick. */
                function buildQueue(next) {
                    var data, lastTweensContainer;
                    /*******************
					 Option: Begin
					 *******************/
                    /* The begin callback is fired once per call -- not once per elemenet -- and is passed the full raw DOM element set as both its context and its first argument. */
                    if (opts.begin && elementsIndex === 0) {
                        /* We throw callbacks in a setTimeout so that thrown errors don't halt the execution of Velocity itself. */
                        try {
                            opts.begin.call(elements, elements);
                        } catch (error) {
                            setTimeout(function() {
                                throw error;
                            }, 1);
                        }
                    }
                    /*****************************************
					 Tween Data Construction (for Scroll)
					 *****************************************/
                    /* Note: In order to be subjected to chaining and animation options, scroll's tweening is routed through Velocity as if it were a standard CSS property animation. */
                    if (action === "scroll") {
                        /* The scroll action uniquely takes an optional "offset" option -- specified in pixels -- that offsets the targeted scroll position. */
                        var scrollDirection = /^x$/i.test(opts.axis) ? "Left" : "Top", scrollOffset = parseFloat(opts.offset) || 0, scrollPositionCurrent, scrollPositionCurrentAlternate, scrollPositionEnd;
                        /* Scroll also uniquely takes an optional "container" option, which indicates the parent element that should be scrolled --
						 as opposed to the browser window itself. This is useful for scrolling toward an element that's inside an overflowing parent element. */
                        if (opts.container) {
                            /* Ensure that either a jQuery object or a raw DOM element was passed in. */
                            if (Type.isWrapped(opts.container) || Type.isNode(opts.container)) {
                                /* Extract the raw DOM element from the jQuery wrapper. */
                                opts.container = opts.container[0] || opts.container;
                                /* Note: Unlike other properties in Velocity, the browser's scroll position is never cached since it so frequently changes
								 (due to the user's natural interaction with the page). */
                                scrollPositionCurrent = opts.container["scroll" + scrollDirection];
                                /* GET */
                                /* $.position() values are relative to the container's currently viewable area (without taking into account the container's true dimensions
								 -- say, for example, if the container was not overflowing). Thus, the scroll end value is the sum of the child element's position *and*
								 the scroll container's current scroll position. */
                                scrollPositionEnd = scrollPositionCurrent + $(element).position()[scrollDirection.toLowerCase()] + scrollOffset;
                            } else {
                                opts.container = null;
                            }
                        } else {
                            /* If the window itself is being scrolled -- not a containing element -- perform a live scroll position lookup using
							 the appropriate cached property names (which differ based on browser type). */
                            scrollPositionCurrent = Velocity.State.scrollAnchor[Velocity.State["scrollProperty" + scrollDirection]];
                            /* GET */
                            /* When scrolling the browser window, cache the alternate axis's current value since window.scrollTo() doesn't let us change only one value at a time. */
                            scrollPositionCurrentAlternate = Velocity.State.scrollAnchor[Velocity.State["scrollProperty" + (scrollDirection === "Left" ? "Top" : "Left")]];
                            /* GET */
                            /* Unlike $.position(), $.offset() values are relative to the browser window's true dimensions -- not merely its currently viewable area --
							 and therefore end values do not need to be compounded onto current values. */
                            scrollPositionEnd = $(element).offset()[scrollDirection.toLowerCase()] + scrollOffset;
                        }
                        /* Since there's only one format that scroll's associated tweensContainer can take, we create it manually. */
                        tweensContainer = {
                            scroll: {
                                rootPropertyValue: false,
                                startValue: scrollPositionCurrent,
                                currentValue: scrollPositionCurrent,
                                endValue: scrollPositionEnd,
                                unitType: "",
                                easing: opts.easing,
                                scrollData: {
                                    container: opts.container,
                                    direction: scrollDirection,
                                    alternateValue: scrollPositionCurrentAlternate
                                }
                            },
                            element: element
                        };
                        if (Velocity.debug) {
                            console.log("tweensContainer (scroll): ", tweensContainer.scroll, element);
                        }
                    } else if (action === "reverse") {
                        data = Data(element);
                        /* Abort if there is no prior animation data to reverse to. */
                        if (!data) {
                            return;
                        }
                        if (!data.tweensContainer) {
                            /* Dequeue the element so that this queue entry releases itself immediately, allowing subsequent queue entries to run. */
                            $.dequeue(element, opts.queue);
                            return;
                        } else {
                            /*********************
							 Options Parsing
							 *********************/
                            /* If the element was hidden via the display option in the previous call,
							 revert display to "auto" prior to reversal so that the element is visible again. */
                            if (data.opts.display === "none") {
                                data.opts.display = "auto";
                            }
                            if (data.opts.visibility === "hidden") {
                                data.opts.visibility = "visible";
                            }
                            /* If the loop option was set in the previous call, disable it so that "reverse" calls aren't recursively generated.
							 Further, remove the previous call's callback options; typically, users do not want these to be refired. */
                            data.opts.loop = false;
                            data.opts.begin = null;
                            data.opts.complete = null;
                            /* Since we're extending an opts object that has already been extended with the defaults options object,
							 we remove non-explicitly-defined properties that are auto-assigned values. */
                            if (!options.easing) {
                                delete opts.easing;
                            }
                            if (!options.duration) {
                                delete opts.duration;
                            }
                            /* The opts object used for reversal is an extension of the options object optionally passed into this
							 reverse call plus the options used in the previous Velocity call. */
                            opts = $.extend({}, data.opts, opts);
                            /*************************************
							 Tweens Container Reconstruction
							 *************************************/
                            /* Create a deepy copy (indicated via the true flag) of the previous call's tweensContainer. */
                            lastTweensContainer = $.extend(true, {}, data ? data.tweensContainer : null);
                            /* Manipulate the previous tweensContainer by replacing its end values and currentValues with its start values. */
                            for (var lastTween in lastTweensContainer) {
                                /* In addition to tween data, tweensContainers contain an element property that we ignore here. */
                                if (lastTweensContainer.hasOwnProperty(lastTween) && lastTween !== "element") {
                                    var lastStartValue = lastTweensContainer[lastTween].startValue;
                                    lastTweensContainer[lastTween].startValue = lastTweensContainer[lastTween].currentValue = lastTweensContainer[lastTween].endValue;
                                    lastTweensContainer[lastTween].endValue = lastStartValue;
                                    /* Easing is the only option that embeds into the individual tween data (since it can be defined on a per-property basis).
									 Accordingly, every property's easing value must be updated when an options object is passed in with a reverse call.
									 The side effect of this extensibility is that all per-property easing values are forcefully reset to the new value. */
                                    if (!Type.isEmptyObject(options)) {
                                        lastTweensContainer[lastTween].easing = opts.easing;
                                    }
                                    if (Velocity.debug) {
                                        console.log("reverse tweensContainer (" + lastTween + "): " + JSON.stringify(lastTweensContainer[lastTween]), element);
                                    }
                                }
                            }
                            tweensContainer = lastTweensContainer;
                        }
                    } else if (action === "start") {
                        /*************************
						 Value Transferring
						 *************************/
                        /* If this queue entry follows a previous Velocity-initiated queue entry *and* if this entry was created
						 while the element was in the process of being animated by Velocity, then this current call is safe to use
						 the end values from the prior call as its start values. Velocity attempts to perform this value transfer
						 process whenever possible in order to avoid requerying the DOM. */
                        /* If values aren't transferred from a prior call and start values were not forcefed by the user (more on this below),
						 then the DOM is queried for the element's current values as a last resort. */
                        /* Note: Conversely, animation reversal (and looping) *always* perform inter-call value transfers; they never requery the DOM. */
                        data = Data(element);
                        /* The per-element isAnimating flag is used to indicate whether it's safe (i.e. the data isn't stale)
						 to transfer over end values to use as start values. If it's set to true and there is a previous
						 Velocity call to pull values from, do so. */
                        if (data && data.tweensContainer && data.isAnimating === true) {
                            lastTweensContainer = data.tweensContainer;
                        }
                        /***************************
						 Tween Data Calculation
						 ***************************/
                        /* This function parses property data and defaults endValue, easing, and startValue as appropriate. */
                        /* Property map values can either take the form of 1) a single value representing the end value,
						 or 2) an array in the form of [ endValue, [, easing] [, startValue] ].
						 The optional third parameter is a forcefed startValue to be used instead of querying the DOM for
						 the element's current value. Read Velocity's docmentation to learn more about forcefeeding: VelocityJS.org/#forcefeeding */
                        var parsePropertyValue = function(valueData, skipResolvingEasing) {
                            var endValue, easing, startValue;
                            /* If we have a function as the main argument then resolve it first, in case it returns an array that needs to be split */
                            if (Type.isFunction(valueData)) {
                                valueData = valueData.call(element, elementArrayIndex, elementsLength);
                            }
                            /* Handle the array format, which can be structured as one of three potential overloads:
							 A) [ endValue, easing, startValue ], B) [ endValue, easing ], or C) [ endValue, startValue ] */
                            if (Type.isArray(valueData)) {
                                /* endValue is always the first item in the array. Don't bother validating endValue's value now
								 since the ensuing property cycling logic does that. */
                                endValue = valueData[0];
                                /* Two-item array format: If the second item is a number, function, or hex string, treat it as a
								 start value since easings can only be non-hex strings or arrays. */
                                if (!Type.isArray(valueData[1]) && /^[\d-]/.test(valueData[1]) || Type.isFunction(valueData[1]) || CSS.RegEx.isHex.test(valueData[1])) {
                                    startValue = valueData[1];
                                } else if (Type.isString(valueData[1]) && !CSS.RegEx.isHex.test(valueData[1]) || Type.isArray(valueData[1])) {
                                    easing = skipResolvingEasing ? valueData[1] : getEasing(valueData[1], opts.duration);
                                    /* Don't bother validating startValue's value now since the ensuing property cycling logic inherently does that. */
                                    if (valueData[2] !== undefined) {
                                        startValue = valueData[2];
                                    }
                                }
                            } else {
                                endValue = valueData;
                            }
                            /* Default to the call's easing if a per-property easing type was not defined. */
                            if (!skipResolvingEasing) {
                                easing = easing || opts.easing;
                            }
                            /* If functions were passed in as values, pass the function the current element as its context,
							 plus the element's index and the element set's size as arguments. Then, assign the returned value. */
                            if (Type.isFunction(endValue)) {
                                endValue = endValue.call(element, elementArrayIndex, elementsLength);
                            }
                            if (Type.isFunction(startValue)) {
                                startValue = startValue.call(element, elementArrayIndex, elementsLength);
                            }
                            /* Allow startValue to be left as undefined to indicate to the ensuing code that its value was not forcefed. */
                            return [ endValue || 0, easing, startValue ];
                        };
                        /* Do a quick check of property data and return if the startValue and endValue are both
						 functions (ie, don't split red/green/blue) */
                        var startAndEndFunction = function(valueData) {
                            if (Type.isArray(valueData)) {
                                return Type.isFunction(valueData[0]) && (valueData[1] === undefined || Type.isFunction(valueData[1]));
                            }
                            return false;
                        };
                        /* Cache RegExp as it's somewhat costly to create - but only for this iteration as it's a public value and might change */
                        var rxCSSListsColors;
                        /* Cycle through each property in the map, looking for shorthand color properties (e.g. "color" as opposed to "colorRed"). Inject the corresponding
						 colorRed, colorGreen, and colorBlue RGB component tweens into the propertiesMap (which Velocity understands) and remove the shorthand property. */
                        $.each(propertiesMap, function(property, value) {
                            if (!rxCSSListsColors) {
                                rxCSSListsColors = RegExp("^" + CSS.Lists.colors.join("$|^") + "$");
                            }
                            /* Find shorthand color properties that have been passed a hex string. */
                            /* Don't try to fix values if both startValue and endValue are a function */
                            /* Would be quicker to use CSS.Lists.colors.includes() if possible */
                            if (rxCSSListsColors.test(CSS.Names.camelCase(property)) && !startAndEndFunction(value)) {
                                /* Parse the value data for each shorthand. */
                                var valueData = parsePropertyValue(value, true), endValue = valueData[0], easing = valueData[1], startValue = valueData[2];
                                if (CSS.RegEx.isHex.test(endValue)) {
                                    /* Convert the hex strings into their RGB component arrays. */
                                    var colorComponents = [ "Red", "Green", "Blue" ], endValueRGB = CSS.Values.hexToRgb(endValue), startValueRGB = startValue ? CSS.Values.hexToRgb(startValue) : undefined;
                                    /* Inject the RGB component tweens into propertiesMap. */
                                    for (var i = 0; i < colorComponents.length; i++) {
                                        var dataArray = [ endValueRGB[i] ];
                                        if (easing) {
                                            dataArray.push(easing);
                                        }
                                        if (startValueRGB !== undefined) {
                                            dataArray.push(startValueRGB[i]);
                                        }
                                        propertiesMap[CSS.Names.camelCase(property) + colorComponents[i]] = dataArray;
                                    }
                                    /* Remove the intermediary shorthand property entry now that we've processed it. */
                                    delete propertiesMap[property];
                                }
                            }
                        });
                        /* Create a tween out of each property, and append its associated data to tweensContainer. */
                        for (var property in propertiesMap) {
                            if (!propertiesMap.hasOwnProperty(property)) {
                                continue;
                            }
                            /**************************
							 Start Value Sourcing
							 **************************/
                            /* Parse out endValue, easing, and startValue from the property's data. */
                            var valueData = parsePropertyValue(propertiesMap[property]), endValue = valueData[0], easing = valueData[1], startValue = valueData[2];
                            /* Now that the original property name's format has been used for the parsePropertyValue() lookup above,
							 we force the property to its camelCase styling to normalize it for manipulation. */
                            property = CSS.Names.camelCase(property);
                            /* In case this property is a hook, there are circumstances where we will intend to work on the hook's root property and not the hooked subproperty. */
                            var rootProperty = CSS.Hooks.getRoot(property), rootPropertyValue = false;
                            /* Other than for the dummy tween property, properties that are not supported by the browser (and do not have an associated normalization) will
							 inherently produce no style changes when set, so they are skipped in order to decrease animation tick overhead.
							 Property support is determined via prefixCheck(), which returns a false flag when no supported is detected. */
                            /* Note: Since SVG elements have some of their properties directly applied as HTML attributes,
							 there is no way to check for their explicit browser support, and so we skip skip this check for them. */
                            if ((!data || !data.isSVG) && rootProperty !== "tween" && CSS.Names.prefixCheck(rootProperty)[1] === false && CSS.Normalizations.registered[rootProperty] === undefined) {
                                if (Velocity.debug) {
                                    console.log("Skipping [" + rootProperty + "] due to a lack of browser support.");
                                }
                                continue;
                            }
                            /* If the display option is being set to a non-"none" (e.g. "block") and opacity (filter on IE<=8) is being
							 animated to an endValue of non-zero, the user's intention is to fade in from invisible, thus we forcefeed opacity
							 a startValue of 0 if its startValue hasn't already been sourced by value transferring or prior forcefeeding. */
                            if ((opts.display !== undefined && opts.display !== null && opts.display !== "none" || opts.visibility !== undefined && opts.visibility !== "hidden") && /opacity|filter/.test(property) && !startValue && endValue !== 0) {
                                startValue = 0;
                            }
                            /* If values have been transferred from the previous Velocity call, extract the endValue and rootPropertyValue
							 for all of the current call's properties that were *also* animated in the previous call. */
                            /* Note: Value transferring can optionally be disabled by the user via the _cacheValues option. */
                            if (opts._cacheValues && lastTweensContainer && lastTweensContainer[property]) {
                                if (startValue === undefined) {
                                    startValue = lastTweensContainer[property].endValue + lastTweensContainer[property].unitType;
                                }
                                /* The previous call's rootPropertyValue is extracted from the element's data cache since that's the
								 instance of rootPropertyValue that gets freshly updated by the tweening process, whereas the rootPropertyValue
								 attached to the incoming lastTweensContainer is equal to the root property's value prior to any tweening. */
                                rootPropertyValue = data.rootPropertyValueCache[rootProperty];
                            } else {
                                /* Handle hooked properties. */
                                if (CSS.Hooks.registered[property]) {
                                    if (startValue === undefined) {
                                        rootPropertyValue = CSS.getPropertyValue(element, rootProperty);
                                        /* GET */
                                        /* Note: The following getPropertyValue() call does not actually trigger a DOM query;
										 getPropertyValue() will extract the hook from rootPropertyValue. */
                                        startValue = CSS.getPropertyValue(element, property, rootPropertyValue);
                                    } else {
                                        /* Grab this hook's zero-value template, e.g. "0px 0px 0px black". */
                                        rootPropertyValue = CSS.Hooks.templates[rootProperty][1];
                                    }
                                } else if (startValue === undefined) {
                                    startValue = CSS.getPropertyValue(element, property);
                                }
                            }
                            /**************************
							 Value Data Extraction
							 **************************/
                            var separatedValue, endValueUnitType, startValueUnitType, operator = false;
                            /* Separates a property value into its numeric value and its unit type. */
                            var separateValue = function(property, value) {
                                var unitType, numericValue;
                                numericValue = (value || "0").toString().toLowerCase().replace(/[%A-z]+$/, function(match) {
                                    /* Grab the unit type. */
                                    unitType = match;
                                    /* Strip the unit type off of value. */
                                    return "";
                                });
                                /* If no unit type was supplied, assign one that is appropriate for this property (e.g. "deg" for rotateZ or "px" for width). */
                                if (!unitType) {
                                    unitType = CSS.Values.getUnitType(property);
                                }
                                return [ numericValue, unitType ];
                            };
                            /* Separate startValue. */
                            separatedValue = separateValue(property, startValue);
                            startValue = separatedValue[0];
                            startValueUnitType = separatedValue[1];
                            /* Separate endValue, and extract a value operator (e.g. "+=", "-=") if one exists. */
                            separatedValue = separateValue(property, endValue);
                            endValue = separatedValue[0].replace(/^([+-\/*])=/, function(match, subMatch) {
                                operator = subMatch;
                                /* Strip the operator off of the value. */
                                return "";
                            });
                            endValueUnitType = separatedValue[1];
                            /* Parse float values from endValue and startValue. Default to 0 if NaN is returned. */
                            startValue = parseFloat(startValue) || 0;
                            endValue = parseFloat(endValue) || 0;
                            /***************************************
							 Property-Specific Value Conversion
							 ***************************************/
                            /* Custom support for properties that don't actually accept the % unit type, but where pollyfilling is trivial and relatively foolproof. */
                            if (endValueUnitType === "%") {
                                /* A %-value fontSize/lineHeight is relative to the parent's fontSize (as opposed to the parent's dimensions),
								 which is identical to the em unit's behavior, so we piggyback off of that. */
                                if (/^(fontSize|lineHeight)$/.test(property)) {
                                    /* Convert % into an em decimal value. */
                                    endValue = endValue / 100;
                                    endValueUnitType = "em";
                                } else if (/^scale/.test(property)) {
                                    endValue = endValue / 100;
                                    endValueUnitType = "";
                                } else if (/(Red|Green|Blue)$/i.test(property)) {
                                    endValue = endValue / 100 * 255;
                                    endValueUnitType = "";
                                }
                            }
                            /***************************
							 Unit Ratio Calculation
							 ***************************/
                            /* When queried, the browser returns (most) CSS property values in pixels. Therefore, if an endValue with a unit type of
							 %, em, or rem is animated toward, startValue must be converted from pixels into the same unit type as endValue in order
							 for value manipulation logic (increment/decrement) to proceed. Further, if the startValue was forcefed or transferred
							 from a previous call, startValue may also not be in pixels. Unit conversion logic therefore consists of two steps:
							 1) Calculating the ratio of %/em/rem/vh/vw relative to pixels
							 2) Converting startValue into the same unit of measurement as endValue based on these ratios. */
                            /* Unit conversion ratios are calculated by inserting a sibling node next to the target node, copying over its position property,
							 setting values with the target unit type then comparing the returned pixel value. */
                            /* Note: Even if only one of these unit types is being animated, all unit ratios are calculated at once since the overhead
							 of batching the SETs and GETs together upfront outweights the potential overhead
							 of layout thrashing caused by re-querying for uncalculated ratios for subsequently-processed properties. */
                            /* Todo: Shift this logic into the calls' first tick instance so that it's synced with RAF. */
                            var calculateUnitRatios = function() {
                                /************************
								 Same Ratio Checks
								 ************************/
                                /* The properties below are used to determine whether the element differs sufficiently from this call's
								 previously iterated element to also differ in its unit conversion ratios. If the properties match up with those
								 of the prior element, the prior element's conversion ratios are used. Like most optimizations in Velocity,
								 this is done to minimize DOM querying. */
                                var sameRatioIndicators = {
                                    myParent: element.parentNode || document.body,
                                    /* GET */
                                    position: CSS.getPropertyValue(element, "position"),
                                    /* GET */
                                    fontSize: CSS.getPropertyValue(element, "fontSize")
                                }, /* Determine if the same % ratio can be used. % is based on the element's position value and its parent's width and height dimensions. */
                                samePercentRatio = sameRatioIndicators.position === callUnitConversionData.lastPosition && sameRatioIndicators.myParent === callUnitConversionData.lastParent, /* Determine if the same em ratio can be used. em is relative to the element's fontSize. */
                                sameEmRatio = sameRatioIndicators.fontSize === callUnitConversionData.lastFontSize;
                                /* Store these ratio indicators call-wide for the next element to compare against. */
                                callUnitConversionData.lastParent = sameRatioIndicators.myParent;
                                callUnitConversionData.lastPosition = sameRatioIndicators.position;
                                callUnitConversionData.lastFontSize = sameRatioIndicators.fontSize;
                                /***************************
								 Element-Specific Units
								 ***************************/
                                /* Note: IE8 rounds to the nearest pixel when returning CSS values, thus we perform conversions using a measurement
								 of 100 (instead of 1) to give our ratios a precision of at least 2 decimal values. */
                                var measurement = 100, unitRatios = {};
                                if (!sameEmRatio || !samePercentRatio) {
                                    var dummy = data && data.isSVG ? document.createElementNS("http://www.w3.org/2000/svg", "rect") : document.createElement("div");
                                    Velocity.init(dummy);
                                    sameRatioIndicators.myParent.appendChild(dummy);
                                    /* To accurately and consistently calculate conversion ratios, the element's cascaded overflow and box-sizing are stripped.
									 Similarly, since width/height can be artificially constrained by their min-/max- equivalents, these are controlled for as well. */
                                    /* Note: Overflow must be also be controlled for per-axis since the overflow property overwrites its per-axis values. */
                                    $.each([ "overflow", "overflowX", "overflowY" ], function(i, property) {
                                        Velocity.CSS.setPropertyValue(dummy, property, "hidden");
                                    });
                                    Velocity.CSS.setPropertyValue(dummy, "position", sameRatioIndicators.position);
                                    Velocity.CSS.setPropertyValue(dummy, "fontSize", sameRatioIndicators.fontSize);
                                    Velocity.CSS.setPropertyValue(dummy, "boxSizing", "content-box");
                                    /* width and height act as our proxy properties for measuring the horizontal and vertical % ratios. */
                                    $.each([ "minWidth", "maxWidth", "width", "minHeight", "maxHeight", "height" ], function(i, property) {
                                        Velocity.CSS.setPropertyValue(dummy, property, measurement + "%");
                                    });
                                    /* paddingLeft arbitrarily acts as our proxy property for the em ratio. */
                                    Velocity.CSS.setPropertyValue(dummy, "paddingLeft", measurement + "em");
                                    /* Divide the returned value by the measurement to get the ratio between 1% and 1px. Default to 1 since working with 0 can produce Infinite. */
                                    unitRatios.percentToPxWidth = callUnitConversionData.lastPercentToPxWidth = (parseFloat(CSS.getPropertyValue(dummy, "width", null, true)) || 1) / measurement;
                                    /* GET */
                                    unitRatios.percentToPxHeight = callUnitConversionData.lastPercentToPxHeight = (parseFloat(CSS.getPropertyValue(dummy, "height", null, true)) || 1) / measurement;
                                    /* GET */
                                    unitRatios.emToPx = callUnitConversionData.lastEmToPx = (parseFloat(CSS.getPropertyValue(dummy, "paddingLeft")) || 1) / measurement;
                                    /* GET */
                                    sameRatioIndicators.myParent.removeChild(dummy);
                                } else {
                                    unitRatios.emToPx = callUnitConversionData.lastEmToPx;
                                    unitRatios.percentToPxWidth = callUnitConversionData.lastPercentToPxWidth;
                                    unitRatios.percentToPxHeight = callUnitConversionData.lastPercentToPxHeight;
                                }
                                /***************************
								 Element-Agnostic Units
								 ***************************/
                                /* Whereas % and em ratios are determined on a per-element basis, the rem unit only needs to be checked
								 once per call since it's exclusively dependant upon document.body's fontSize. If this is the first time
								 that calculateUnitRatios() is being run during this call, remToPx will still be set to its default value of null,
								 so we calculate it now. */
                                if (callUnitConversionData.remToPx === null) {
                                    /* Default to browsers' default fontSize of 16px in the case of 0. */
                                    callUnitConversionData.remToPx = parseFloat(CSS.getPropertyValue(document.body, "fontSize")) || 16;
                                }
                                /* Similarly, viewport units are %-relative to the window's inner dimensions. */
                                if (callUnitConversionData.vwToPx === null) {
                                    callUnitConversionData.vwToPx = parseFloat(window.innerWidth) / 100;
                                    /* GET */
                                    callUnitConversionData.vhToPx = parseFloat(window.innerHeight) / 100;
                                }
                                unitRatios.remToPx = callUnitConversionData.remToPx;
                                unitRatios.vwToPx = callUnitConversionData.vwToPx;
                                unitRatios.vhToPx = callUnitConversionData.vhToPx;
                                if (Velocity.debug >= 1) {
                                    console.log("Unit ratios: " + JSON.stringify(unitRatios), element);
                                }
                                return unitRatios;
                            };
                            /********************
							 Unit Conversion
							 ********************/
                            /* The * and / operators, which are not passed in with an associated unit, inherently use startValue's unit. Skip value and unit conversion. */
                            if (/[\/*]/.test(operator)) {
                                endValueUnitType = startValueUnitType;
                            } else if (startValueUnitType !== endValueUnitType && startValue !== 0) {
                                /* Unit conversion is also skipped when endValue is 0, but *startValueUnitType* must be used for tween values to remain accurate. */
                                /* Note: Skipping unit conversion here means that if endValueUnitType was originally a relative unit, the animation won't relatively
								 match the underlying metrics if they change, but this is acceptable since we're animating toward invisibility instead of toward visibility,
								 which remains past the point of the animation's completion. */
                                if (endValue === 0) {
                                    endValueUnitType = startValueUnitType;
                                } else {
                                    /* By this point, we cannot avoid unit conversion (it's undesirable since it causes layout thrashing).
									 If we haven't already, we trigger calculateUnitRatios(), which runs once per element per call. */
                                    elementUnitConversionData = elementUnitConversionData || calculateUnitRatios();
                                    /* The following RegEx matches CSS properties that have their % values measured relative to the x-axis. */
                                    /* Note: W3C spec mandates that all of margin and padding's properties (even top and bottom) are %-relative to the *width* of the parent element. */
                                    var axis = /margin|padding|left|right|width|text|word|letter/i.test(property) || /X$/.test(property) || property === "x" ? "x" : "y";
                                    /* In order to avoid generating n^2 bespoke conversion functions, unit conversion is a two-step process:
									 1) Convert startValue into pixels. 2) Convert this new pixel value into endValue's unit type. */
                                    switch (startValueUnitType) {
                                      case "%":
                                        /* Note: translateX and translateY are the only properties that are %-relative to an element's own dimensions -- not its parent's dimensions.
											 Velocity does not include a special conversion process to account for this behavior. Therefore, animating translateX/Y from a % value
											 to a non-% value will produce an incorrect start value. Fortunately, this sort of cross-unit conversion is rarely done by users in practice. */
                                        startValue *= axis === "x" ? elementUnitConversionData.percentToPxWidth : elementUnitConversionData.percentToPxHeight;
                                        break;

                                      case "px":
                                        /* px acts as our midpoint in the unit conversion process; do nothing. */
                                        break;

                                      default:
                                        startValue *= elementUnitConversionData[startValueUnitType + "ToPx"];
                                    }
                                    /* Invert the px ratios to convert into to the target unit. */
                                    switch (endValueUnitType) {
                                      case "%":
                                        startValue *= 1 / (axis === "x" ? elementUnitConversionData.percentToPxWidth : elementUnitConversionData.percentToPxHeight);
                                        break;

                                      case "px":
                                        /* startValue is already in px, do nothing; we're done. */
                                        break;

                                      default:
                                        startValue *= 1 / elementUnitConversionData[endValueUnitType + "ToPx"];
                                    }
                                }
                            }
                            /*********************
							 Relative Values
							 *********************/
                            /* Operator logic must be performed last since it requires unit-normalized start and end values. */
                            /* Note: Relative *percent values* do not behave how most people think; while one would expect "+=50%"
							 to increase the property 1.5x its current value, it in fact increases the percent units in absolute terms:
							 50 points is added on top of the current % value. */
                            switch (operator) {
                              case "+":
                                endValue = startValue + endValue;
                                break;

                              case "-":
                                endValue = startValue - endValue;
                                break;

                              case "*":
                                endValue = startValue * endValue;
                                break;

                              case "/":
                                endValue = startValue / endValue;
                                break;
                            }
                            /**************************
							 tweensContainer Push
							 **************************/
                            /* Construct the per-property tween object, and push it to the element's tweensContainer. */
                            tweensContainer[property] = {
                                rootPropertyValue: rootPropertyValue,
                                startValue: startValue,
                                currentValue: startValue,
                                endValue: endValue,
                                unitType: endValueUnitType,
                                easing: easing
                            };
                            if (Velocity.debug) {
                                console.log("tweensContainer (" + property + "): " + JSON.stringify(tweensContainer[property]), element);
                            }
                        }
                        /* Along with its property data, store a reference to the element itself onto tweensContainer. */
                        tweensContainer.element = element;
                    }
                    /*****************
					 Call Push
					 *****************/
                    /* Note: tweensContainer can be empty if all of the properties in this call's property map were skipped due to not
					 being supported by the browser. The element property is used for checking that the tweensContainer has been appended to. */
                    if (tweensContainer.element) {
                        /* Apply the "velocity-animating" indicator class. */
                        CSS.Values.addClass(element, "velocity-animating");
                        /* The call array houses the tweensContainers for each element being animated in the current call. */
                        call.push(tweensContainer);
                        data = Data(element);
                        if (data) {
                            /* Store the tweensContainer and options if we're working on the default effects queue, so that they can be used by the reverse command. */
                            if (opts.queue === "") {
                                data.tweensContainer = tweensContainer;
                                data.opts = opts;
                            }
                            /* Switch on the element's animating flag. */
                            data.isAnimating = true;
                        }
                        /* Once the final element in this call's element set has been processed, push the call array onto
						 Velocity.State.calls for the animation tick to immediately begin processing. */
                        if (elementsIndex === elementsLength - 1) {
                            /* Add the current call plus its associated metadata (the element set and the call's options) onto the global call container.
							 Anything on this call container is subjected to tick() processing. */
                            Velocity.State.calls.push([ call, elements, opts, null, promiseData.resolver ]);
                            /* If the animation tick isn't running, start it. (Velocity shuts it off when there are no active calls to process.) */
                            if (Velocity.State.isTicking === false) {
                                Velocity.State.isTicking = true;
                                /* Start the tick loop. */
                                tick();
                            }
                        } else {
                            elementsIndex++;
                        }
                    }
                }
                /* When the queue option is set to false, the call skips the element's queue and fires immediately. */
                if (opts.queue === false) {
                    /* Since this buildQueue call doesn't respect the element's existing queue (which is where a delay option would have been appended),
					 we manually inject the delay property here with an explicit setTimeout. */
                    if (opts.delay) {
                        setTimeout(buildQueue, opts.delay);
                    } else {
                        buildQueue();
                    }
                } else {
                    $.queue(element, opts.queue, function(next, clearQueue) {
                        /* If the clearQueue flag was passed in by the stop command, resolve this call's promise. (Promises can only be resolved once,
						 so it's fine if this is repeatedly triggered for each element in the associated call.) */
                        if (clearQueue === true) {
                            if (promiseData.promise) {
                                promiseData.resolver(elements);
                            }
                            /* Do not continue with animation queueing. */
                            return true;
                        }
                        /* This flag indicates to the upcoming completeCall() function that this queue entry was initiated by Velocity.
						 See completeCall() for further details. */
                        Velocity.velocityQueueEntryFlag = true;
                        buildQueue(next);
                    });
                }
                /*********************
				 Auto-Dequeuing
				 *********************/
                /* As per jQuery's $.queue() behavior, to fire the first non-custom-queue entry on an element, the element
				 must be dequeued if its queue stack consists *solely* of the current call. (This can be determined by checking
				 for the "inprogress" item that jQuery prepends to active queue stack arrays.) Regardless, whenever the element's
				 queue is further appended with additional items -- including $.delay()'s or even $.animate() calls, the queue's
				 first entry is automatically fired. This behavior contrasts that of custom queues, which never auto-fire. */
                /* Note: When an element set is being subjected to a non-parallel Velocity call, the animation will not begin until
				 each one of the elements in the set has reached the end of its individually pre-existing queue chain. */
                /* Note: Unfortunately, most people don't fully grasp jQuery's powerful, yet quirky, $.queue() function.
				 Lean more here: http://stackoverflow.com/questions/1058158/can-somebody-explain-jquery-queue-to-me */
                if ((opts.queue === "" || opts.queue === "fx") && $.queue(element)[0] !== "inprogress") {
                    $.dequeue(element);
                }
            }
            /**************************
			 Element Set Iteration
			 **************************/
            /* If the "nodeType" property exists on the elements variable, we're animating a single element.
			 Place it in an array so that $.each() can iterate over it. */
            $.each(elements, function(i, element) {
                /* Ensure each element in a set has a nodeType (is a real element) to avoid throwing errors. */
                if (Type.isNode(element)) {
                    processElement(element, i);
                }
            });
            /******************
			 Option: Loop
			 ******************/
            /* The loop option accepts an integer indicating how many times the element should loop between the values in the
			 current call's properties map and the element's property values prior to this call. */
            /* Note: The loop option's logic is performed here -- after element processing -- because the current call needs
			 to undergo its queue insertion prior to the loop option generating its series of constituent "reverse" calls,
			 which chain after the current call. Two reverse calls (two "alternations") constitute one loop. */
            opts = $.extend({}, Velocity.defaults, options);
            opts.loop = parseInt(opts.loop, 10);
            var reverseCallsCount = opts.loop * 2 - 1;
            if (opts.loop) {
                /* Double the loop count to convert it into its appropriate number of "reverse" calls.
				 Subtract 1 from the resulting value since the current call is included in the total alternation count. */
                for (var x = 0; x < reverseCallsCount; x++) {
                    /* Since the logic for the reverse action occurs inside Queueing and therefore this call's options object
					 isn't parsed until then as well, the current call's delay option must be explicitly passed into the reverse
					 call so that the delay logic that occurs inside *Pre-Queueing* can process it. */
                    var reverseOptions = {
                        delay: opts.delay,
                        progress: opts.progress
                    };
                    /* If a complete callback was passed into this call, transfer it to the loop redirect's final "reverse" call
					 so that it's triggered when the entire redirect is complete (and not when the very first animation is complete). */
                    if (x === reverseCallsCount - 1) {
                        reverseOptions.display = opts.display;
                        reverseOptions.visibility = opts.visibility;
                        reverseOptions.complete = opts.complete;
                    }
                    animate(elements, "reverse", reverseOptions);
                }
            }
            /***************
			 Chaining
			 ***************/
            /* Return the elements back to the call chain, with wrapped elements taking precedence in case Velocity was called via the $.fn. extension. */
            return getChain();
        };
        /* Turn Velocity into the animation function, extended with the pre-existing Velocity object. */
        Velocity = $.extend(animate, Velocity);
        /* For legacy support, also expose the literal animate method. */
        Velocity.animate = animate;
        /**************
		 Timing
		 **************/
        /* Ticker function. */
        var ticker = window.requestAnimationFrame || rAFShim;
        /* Inactive browser tabs pause rAF, which results in all active animations immediately sprinting to their completion states when the tab refocuses.
		 To get around this, we dynamically switch rAF to setTimeout (which the browser *doesn't* pause) when the tab loses focus. We skip this for mobile
		 devices to avoid wasting battery power on inactive tabs. */
        /* Note: Tab focus detection doesn't work on older versions of IE, but that's okay since they don't support rAF to begin with. */
        if (!Velocity.State.isMobile && document.hidden !== undefined) {
            document.addEventListener("visibilitychange", function() {
                /* Reassign the rAF function (which the global tick() function uses) based on the tab's focus state. */
                if (document.hidden) {
                    ticker = function(callback) {
                        /* The tick function needs a truthy first argument in order to pass its internal timestamp check. */
                        return setTimeout(function() {
                            callback(true);
                        }, 16);
                    };
                    /* The rAF loop has been paused by the browser, so we manually restart the tick. */
                    tick();
                } else {
                    ticker = window.requestAnimationFrame || rAFShim;
                }
            });
        }
        /************
		 Tick
		 ************/
        /* Note: All calls to Velocity are pushed to the Velocity.State.calls array, which is fully iterated through upon each tick. */
        function tick(timestamp) {
            /* An empty timestamp argument indicates that this is the first tick occurence since ticking was turned on.
			 We leverage this metadata to fully ignore the first tick pass since RAF's initial pass is fired whenever
			 the browser's next tick sync time occurs, which results in the first elements subjected to Velocity
			 calls being animated out of sync with any elements animated immediately thereafter. In short, we ignore
			 the first RAF tick pass so that elements being immediately consecutively animated -- instead of simultaneously animated
			 by the same Velocity call -- are properly batched into the same initial RAF tick and consequently remain in sync thereafter. */
            if (timestamp) {
                /* We normally use RAF's high resolution timestamp but as it can be significantly offset when the browser is
				 under high stress we give the option for choppiness over allowing the browser to drop huge chunks of frames. */
                var timeCurrent = Velocity.timestamp && timestamp !== true ? timestamp : new Date().getTime();
                /********************
				 Call Iteration
				 ********************/
                var callsLength = Velocity.State.calls.length;
                /* To speed up iterating over this array, it is compacted (falsey items -- calls that have completed -- are removed)
				 when its length has ballooned to a point that can impact tick performance. This only becomes necessary when animation
				 has been continuous with many elements over a long period of time; whenever all active calls are completed, completeCall() clears Velocity.State.calls. */
                if (callsLength > 1e4) {
                    Velocity.State.calls = compactSparseArray(Velocity.State.calls);
                    callsLength = Velocity.State.calls.length;
                }
                /* Iterate through each active call. */
                for (var i = 0; i < callsLength; i++) {
                    /* When a Velocity call is completed, its Velocity.State.calls entry is set to false. Continue on to the next call. */
                    if (!Velocity.State.calls[i]) {
                        continue;
                    }
                    /************************
					 Call-Wide Variables
					 ************************/
                    var callContainer = Velocity.State.calls[i], call = callContainer[0], opts = callContainer[2], timeStart = callContainer[3], firstTick = !!timeStart, tweenDummyValue = null;
                    /* If timeStart is undefined, then this is the first time that this call has been processed by tick().
					 We assign timeStart now so that its value is as close to the real animation start time as possible.
					 (Conversely, had timeStart been defined when this call was added to Velocity.State.calls, the delay
					 between that time and now would cause the first few frames of the tween to be skipped since
					 percentComplete is calculated relative to timeStart.) */
                    /* Further, subtract 16ms (the approximate resolution of RAF) from the current time value so that the
					 first tick iteration isn't wasted by animating at 0% tween completion, which would produce the
					 same style value as the element's current value. */
                    if (!timeStart) {
                        timeStart = Velocity.State.calls[i][3] = timeCurrent - 16;
                    }
                    /* The tween's completion percentage is relative to the tween's start time, not the tween's start value
					 (which would result in unpredictable tween durations since JavaScript's timers are not particularly accurate).
					 Accordingly, we ensure that percentComplete does not exceed 1. */
                    var percentComplete = Math.min((timeCurrent - timeStart) / opts.duration, 1);
                    /**********************
					 Element Iteration
					 **********************/
                    /* For every call, iterate through each of the elements in its set. */
                    for (var j = 0, callLength = call.length; j < callLength; j++) {
                        var tweensContainer = call[j], element = tweensContainer.element;
                        /* Check to see if this element has been deleted midway through the animation by checking for the
						 continued existence of its data cache. If it's gone, skip animating this element. */
                        if (!Data(element)) {
                            continue;
                        }
                        var transformPropertyExists = false;
                        /**********************************
						 Display & Visibility Toggling
						 **********************************/
                        /* If the display option is set to non-"none", set it upfront so that the element can become visible before tweening begins.
						 (Otherwise, display's "none" value is set in completeCall() once the animation has completed.) */
                        if (opts.display !== undefined && opts.display !== null && opts.display !== "none") {
                            if (opts.display === "flex") {
                                var flexValues = [ "-webkit-box", "-moz-box", "-ms-flexbox", "-webkit-flex" ];
                                $.each(flexValues, function(i, flexValue) {
                                    CSS.setPropertyValue(element, "display", flexValue);
                                });
                            }
                            CSS.setPropertyValue(element, "display", opts.display);
                        }
                        /* Same goes with the visibility option, but its "none" equivalent is "hidden". */
                        if (opts.visibility !== undefined && opts.visibility !== "hidden") {
                            CSS.setPropertyValue(element, "visibility", opts.visibility);
                        }
                        /************************
						 Property Iteration
						 ************************/
                        /* For every element, iterate through each property. */
                        for (var property in tweensContainer) {
                            /* Note: In addition to property tween data, tweensContainer contains a reference to its associated element. */
                            if (tweensContainer.hasOwnProperty(property) && property !== "element") {
                                var tween = tweensContainer[property], currentValue, /* Easing can either be a pre-genereated function or a string that references a pre-registered easing
										 on the Velocity.Easings object. In either case, return the appropriate easing *function*. */
                                easing = Type.isString(tween.easing) ? Velocity.Easings[tween.easing] : tween.easing;
                                /******************************
								 Current Value Calculation
								 ******************************/
                                /* If this is the last tick pass (if we've reached 100% completion for this tween),
								 ensure that currentValue is explicitly set to its target endValue so that it's not subjected to any rounding. */
                                if (percentComplete === 1) {
                                    currentValue = tween.endValue;
                                } else {
                                    var tweenDelta = tween.endValue - tween.startValue;
                                    currentValue = tween.startValue + tweenDelta * easing(percentComplete, opts, tweenDelta);
                                    /* If no value change is occurring, don't proceed with DOM updating. */
                                    if (!firstTick && currentValue === tween.currentValue) {
                                        continue;
                                    }
                                }
                                tween.currentValue = currentValue;
                                /* If we're tweening a fake 'tween' property in order to log transition values, update the one-per-call variable so that
								 it can be passed into the progress callback. */
                                if (property === "tween") {
                                    tweenDummyValue = currentValue;
                                } else {
                                    /******************
									 Hooks: Part I
									 ******************/
                                    var hookRoot;
                                    /* For hooked properties, the newly-updated rootPropertyValueCache is cached onto the element so that it can be used
									 for subsequent hooks in this call that are associated with the same root property. If we didn't cache the updated
									 rootPropertyValue, each subsequent update to the root property in this tick pass would reset the previous hook's
									 updates to rootPropertyValue prior to injection. A nice performance byproduct of rootPropertyValue caching is that
									 subsequently chained animations using the same hookRoot but a different hook can use this cached rootPropertyValue. */
                                    if (CSS.Hooks.registered[property]) {
                                        hookRoot = CSS.Hooks.getRoot(property);
                                        var rootPropertyValueCache = Data(element).rootPropertyValueCache[hookRoot];
                                        if (rootPropertyValueCache) {
                                            tween.rootPropertyValue = rootPropertyValueCache;
                                        }
                                    }
                                    /*****************
									 DOM Update
									 *****************/
                                    /* setPropertyValue() returns an array of the property name and property value post any normalization that may have been performed. */
                                    /* Note: To solve an IE<=8 positioning bug, the unit type is dropped when setting a property value of 0. */
                                    var adjustedSetData = CSS.setPropertyValue(element, /* SET */
                                    property, tween.currentValue + (parseFloat(currentValue) === 0 ? "" : tween.unitType), tween.rootPropertyValue, tween.scrollData);
                                    /*******************
									 Hooks: Part II
									 *******************/
                                    /* Now that we have the hook's updated rootPropertyValue (the post-processed value provided by adjustedSetData), cache it onto the element. */
                                    if (CSS.Hooks.registered[property]) {
                                        /* Since adjustedSetData contains normalized data ready for DOM updating, the rootPropertyValue needs to be re-extracted from its normalized form. ?? */
                                        if (CSS.Normalizations.registered[hookRoot]) {
                                            Data(element).rootPropertyValueCache[hookRoot] = CSS.Normalizations.registered[hookRoot]("extract", null, adjustedSetData[1]);
                                        } else {
                                            Data(element).rootPropertyValueCache[hookRoot] = adjustedSetData[1];
                                        }
                                    }
                                    /***************
									 Transforms
									 ***************/
                                    /* Flag whether a transform property is being animated so that flushTransformCache() can be triggered once this tick pass is complete. */
                                    if (adjustedSetData[0] === "transform") {
                                        transformPropertyExists = true;
                                    }
                                }
                            }
                        }
                        /****************
						 mobileHA
						 ****************/
                        /* If mobileHA is enabled, set the translate3d transform to null to force hardware acceleration.
						 It's safe to override this property since Velocity doesn't actually support its animation (hooks are used in its place). */
                        if (opts.mobileHA) {
                            /* Don't set the null transform hack if we've already done so. */
                            if (Data(element).transformCache.translate3d === undefined) {
                                /* All entries on the transformCache object are later concatenated into a single transform string via flushTransformCache(). */
                                Data(element).transformCache.translate3d = "(0px, 0px, 0px)";
                                transformPropertyExists = true;
                            }
                        }
                        if (transformPropertyExists) {
                            CSS.flushTransformCache(element);
                        }
                    }
                    /* The non-"none" display value is only applied to an element once -- when its associated call is first ticked through.
					 Accordingly, it's set to false so that it isn't re-processed by this call in the next tick. */
                    if (opts.display !== undefined && opts.display !== "none") {
                        Velocity.State.calls[i][2].display = false;
                    }
                    if (opts.visibility !== undefined && opts.visibility !== "hidden") {
                        Velocity.State.calls[i][2].visibility = false;
                    }
                    /* Pass the elements and the timing data (percentComplete, msRemaining, timeStart, tweenDummyValue) into the progress callback. */
                    if (opts.progress) {
                        opts.progress.call(callContainer[1], callContainer[1], percentComplete, Math.max(0, timeStart + opts.duration - timeCurrent), timeStart, tweenDummyValue);
                    }
                    /* If this call has finished tweening, pass its index to completeCall() to handle call cleanup. */
                    if (percentComplete === 1) {
                        completeCall(i);
                    }
                }
            }
            /* Note: completeCall() sets the isTicking flag to false when the last call on Velocity.State.calls has completed. */
            if (Velocity.State.isTicking) {
                ticker(tick);
            }
        }
        /**********************
		 Call Completion
		 **********************/
        /* Note: Unlike tick(), which processes all active calls at once, call completion is handled on a per-call basis. */
        function completeCall(callIndex, isStopped) {
            /* Ensure the call exists. */
            if (!Velocity.State.calls[callIndex]) {
                return false;
            }
            /* Pull the metadata from the call. */
            var call = Velocity.State.calls[callIndex][0], elements = Velocity.State.calls[callIndex][1], opts = Velocity.State.calls[callIndex][2], resolver = Velocity.State.calls[callIndex][4];
            var remainingCallsExist = false;
            /*************************
			 Element Finalization
			 *************************/
            for (var i = 0, callLength = call.length; i < callLength; i++) {
                var element = call[i].element;
                /* If the user set display to "none" (intending to hide the element), set it now that the animation has completed. */
                /* Note: display:none isn't set when calls are manually stopped (via Velocity("stop"). */
                /* Note: Display gets ignored with "reverse" calls and infinite loops, since this behavior would be undesirable. */
                if (!isStopped && !opts.loop) {
                    if (opts.display === "none") {
                        CSS.setPropertyValue(element, "display", opts.display);
                    }
                    if (opts.visibility === "hidden") {
                        CSS.setPropertyValue(element, "visibility", opts.visibility);
                    }
                }
                /* If the element's queue is empty (if only the "inprogress" item is left at position 0) or if its queue is about to run
				 a non-Velocity-initiated entry, turn off the isAnimating flag. A non-Velocity-initiatied queue entry's logic might alter
				 an element's CSS values and thereby cause Velocity's cached value data to go stale. To detect if a queue entry was initiated by Velocity,
				 we check for the existence of our special Velocity.queueEntryFlag declaration, which minifiers won't rename since the flag
				 is assigned to jQuery's global $ object and thus exists out of Velocity's own scope. */
                var data = Data(element);
                if (opts.loop !== true && ($.queue(element)[1] === undefined || !/\.velocityQueueEntryFlag/i.test($.queue(element)[1]))) {
                    /* The element may have been deleted. Ensure that its data cache still exists before acting on it. */
                    if (data) {
                        data.isAnimating = false;
                        /* Clear the element's rootPropertyValueCache, which will become stale. */
                        data.rootPropertyValueCache = {};
                        var transformHAPropertyExists = false;
                        /* If any 3D transform subproperty is at its default value (regardless of unit type), remove it. */
                        $.each(CSS.Lists.transforms3D, function(i, transformName) {
                            var defaultValue = /^scale/.test(transformName) ? 1 : 0, currentValue = data.transformCache[transformName];
                            if (data.transformCache[transformName] !== undefined && new RegExp("^\\(" + defaultValue + "[^.]").test(currentValue)) {
                                transformHAPropertyExists = true;
                                delete data.transformCache[transformName];
                            }
                        });
                        /* Mobile devices have hardware acceleration removed at the end of the animation in order to avoid hogging the GPU's memory. */
                        if (opts.mobileHA) {
                            transformHAPropertyExists = true;
                            delete data.transformCache.translate3d;
                        }
                        /* Flush the subproperty removals to the DOM. */
                        if (transformHAPropertyExists) {
                            CSS.flushTransformCache(element);
                        }
                        /* Remove the "velocity-animating" indicator class. */
                        CSS.Values.removeClass(element, "velocity-animating");
                    }
                }
                /*********************
				 Option: Complete
				 *********************/
                /* Complete is fired once per call (not once per element) and is passed the full raw DOM element set as both its context and its first argument. */
                /* Note: Callbacks aren't fired when calls are manually stopped (via Velocity("stop"). */
                if (!isStopped && opts.complete && !opts.loop && i === callLength - 1) {
                    /* We throw callbacks in a setTimeout so that thrown errors don't halt the execution of Velocity itself. */
                    try {
                        opts.complete.call(elements, elements);
                    } catch (error) {
                        setTimeout(function() {
                            throw error;
                        }, 1);
                    }
                }
                /**********************
				 Promise Resolving
				 **********************/
                /* Note: Infinite loops don't return promises. */
                if (resolver && opts.loop !== true) {
                    resolver(elements);
                }
                /****************************
				 Option: Loop (Infinite)
				 ****************************/
                if (data && opts.loop === true && !isStopped) {
                    /* If a rotateX/Y/Z property is being animated by 360 deg with loop:true, swap tween start/end values to enable
					 continuous iterative rotation looping. (Otherise, the element would just rotate back and forth.) */
                    $.each(data.tweensContainer, function(propertyName, tweenContainer) {
                        if (/^rotate/.test(propertyName) && (parseFloat(tweenContainer.startValue) - parseFloat(tweenContainer.endValue)) % 360 === 0) {
                            var oldStartValue = tweenContainer.startValue;
                            tweenContainer.startValue = tweenContainer.endValue;
                            tweenContainer.endValue = oldStartValue;
                        }
                        if (/^backgroundPosition/.test(propertyName) && parseFloat(tweenContainer.endValue) === 100 && tweenContainer.unitType === "%") {
                            tweenContainer.endValue = 0;
                            tweenContainer.startValue = 100;
                        }
                    });
                    Velocity(element, "reverse", {
                        loop: true,
                        delay: opts.delay
                    });
                }
                /***************
				 Dequeueing
				 ***************/
                /* Fire the next call in the queue so long as this call's queue wasn't set to false (to trigger a parallel animation),
				 which would have already caused the next call to fire. Note: Even if the end of the animation queue has been reached,
				 $.dequeue() must still be called in order to completely clear jQuery's animation queue. */
                if (opts.queue !== false) {
                    $.dequeue(element, opts.queue);
                }
            }
            /************************
			 Calls Array Cleanup
			 ************************/
            /* Since this call is complete, set it to false so that the rAF tick skips it. This array is later compacted via compactSparseArray().
			 (For performance reasons, the call is set to false instead of being deleted from the array: http://www.html5rocks.com/en/tutorials/speed/v8/) */
            Velocity.State.calls[callIndex] = false;
            /* Iterate through the calls array to determine if this was the final in-progress animation.
			 If so, set a flag to end ticking and clear the calls array. */
            for (var j = 0, callsLength = Velocity.State.calls.length; j < callsLength; j++) {
                if (Velocity.State.calls[j] !== false) {
                    remainingCallsExist = true;
                    break;
                }
            }
            if (remainingCallsExist === false) {
                /* tick() will detect this flag upon its next iteration and subsequently turn itself off. */
                Velocity.State.isTicking = false;
                /* Clear the calls array so that its length is reset. */
                delete Velocity.State.calls;
                Velocity.State.calls = [];
            }
        }
        /******************
		 Frameworks
		 ******************/
        /* Both jQuery and Zepto allow their $.fn object to be extended to allow wrapped elements to be subjected to plugin calls.
		 If either framework is loaded, register a "velocity" extension pointing to Velocity's core animate() method.  Velocity
		 also registers itself onto a global container (window.jQuery || window.Zepto || window) so that certain features are
		 accessible beyond just a per-element scope. This master object contains an .animate() method, which is later assigned to $.fn
		 (if jQuery or Zepto are present). Accordingly, Velocity can both act on wrapped DOM elements and stand alone for targeting raw DOM elements. */
        global.Velocity = Velocity;
        if (global !== window) {
            /* Assign the element function to Velocity's core animate() method. */
            global.fn.velocity = animate;
            /* Assign the object function's defaults to Velocity's global defaults object. */
            global.fn.velocity.defaults = Velocity.defaults;
        }
        /***********************
		 Packaged Redirects
		 ***********************/
        /* slideUp, slideDown */
        $.each([ "Down", "Up" ], function(i, direction) {
            Velocity.Redirects["slide" + direction] = function(element, options, elementsIndex, elementsSize, elements, promiseData) {
                var opts = $.extend({}, options), begin = opts.begin, complete = opts.complete, inlineValues = {}, computedValues = {
                    height: "",
                    marginTop: "",
                    marginBottom: "",
                    paddingTop: "",
                    paddingBottom: ""
                };
                if (opts.display === undefined) {
                    /* Show the element before slideDown begins and hide the element after slideUp completes. */
                    /* Note: Inline elements cannot have dimensions animated, so they're reverted to inline-block. */
                    opts.display = direction === "Down" ? Velocity.CSS.Values.getDisplayType(element) === "inline" ? "inline-block" : "block" : "none";
                }
                opts.begin = function() {
                    /* If the user passed in a begin callback, fire it now. */
                    if (elementsIndex === 0 && begin) {
                        begin.call(elements, elements);
                    }
                    /* Cache the elements' original vertical dimensional property values so that we can animate back to them. */
                    for (var property in computedValues) {
                        if (!computedValues.hasOwnProperty(property)) {
                            continue;
                        }
                        inlineValues[property] = element.style[property];
                        /* For slideDown, use forcefeeding to animate all vertical properties from 0. For slideUp,
						 use forcefeeding to start from computed values and animate down to 0. */
                        var propertyValue = CSS.getPropertyValue(element, property);
                        computedValues[property] = direction === "Down" ? [ propertyValue, 0 ] : [ 0, propertyValue ];
                    }
                    /* Force vertical overflow content to clip so that sliding works as expected. */
                    inlineValues.overflow = element.style.overflow;
                    element.style.overflow = "hidden";
                };
                opts.complete = function() {
                    /* Reset element to its pre-slide inline values once its slide animation is complete. */
                    for (var property in inlineValues) {
                        if (inlineValues.hasOwnProperty(property)) {
                            element.style[property] = inlineValues[property];
                        }
                    }
                    /* If the user passed in a complete callback, fire it now. */
                    if (elementsIndex === elementsSize - 1) {
                        if (complete) {
                            complete.call(elements, elements);
                        }
                        if (promiseData) {
                            promiseData.resolver(elements);
                        }
                    }
                };
                Velocity(element, computedValues, opts);
            };
        });
        /* fadeIn, fadeOut */
        $.each([ "In", "Out" ], function(i, direction) {
            Velocity.Redirects["fade" + direction] = function(element, options, elementsIndex, elementsSize, elements, promiseData) {
                var opts = $.extend({}, options), complete = opts.complete, propertiesMap = {
                    opacity: direction === "In" ? 1 : 0
                };
                /* Since redirects are triggered individually for each element in the animated set, avoid repeatedly triggering
				 callbacks by firing them only when the final element has been reached. */
                if (elementsIndex !== 0) {
                    opts.begin = null;
                }
                if (elementsIndex !== elementsSize - 1) {
                    opts.complete = null;
                } else {
                    opts.complete = function() {
                        if (complete) {
                            complete.call(elements, elements);
                        }
                        if (promiseData) {
                            promiseData.resolver(elements);
                        }
                    };
                }
                /* If a display was passed in, use it. Otherwise, default to "none" for fadeOut or the element-specific default for fadeIn. */
                /* Note: We allow users to pass in "null" to skip display setting altogether. */
                if (opts.display === undefined) {
                    opts.display = direction === "In" ? "auto" : "none";
                }
                Velocity(this, propertiesMap, opts);
            };
        });
        return Velocity;
    }(window.jQuery || window.Zepto || window, window, document);
});
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
    window.wp.hooks = new EventManager();
})(window);
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
/*!
 * Flickity PACKAGED v2.0.4
 * Touch, responsive, flickable carousels
 *
 * Licensed GPLv3 for open source use
 * or Flickity Commercial License for commercial use
 *
 * http://flickity.metafizzy.co
 * Copyright 2016 Metafizzy
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
 * Fizzy UI utils v2.0.3
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
            // do async to allow for other scripts to run. metafizzy/flickity#441
            setTimeout(callback);
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
                // make available via $().data('namespace')
                if (jQuery) {
                    jQuery.data(elem, namespace, instance);
                }
            });
        });
    };
    // -----  ----- //
    return utils;
});

// Flickity.Cell
(function(window, factory) {
    // universal module definition
    /* jshint strict: false */
    if (typeof define == "function" && define.amd) {
        // AMD
        define("flickity/js/cell", [ "get-size/get-size" ], function(getSize) {
            return factory(window, getSize);
        });
    } else if (typeof module == "object" && module.exports) {
        // CommonJS
        module.exports = factory(window, require("get-size"));
    } else {
        // browser global
        window.Flickity = window.Flickity || {};
        window.Flickity.Cell = factory(window, window.getSize);
    }
})(window, function factory(window, getSize) {
    function Cell(elem, parent) {
        this.element = elem;
        this.parent = parent;
        this.create();
    }
    var proto = Cell.prototype;
    proto.create = function() {
        this.element.style.position = "absolute";
        this.x = 0;
        this.shift = 0;
    };
    proto.destroy = function() {
        // reset style
        this.element.style.position = "";
        var side = this.parent.originSide;
        this.element.style[side] = "";
    };
    proto.getSize = function() {
        this.size = getSize(this.element);
    };
    proto.setPosition = function(x) {
        this.x = x;
        this.updateTarget();
        this.renderPosition(x);
    };
    // setDefaultTarget v1 method, backwards compatibility, remove in v3
    proto.updateTarget = proto.setDefaultTarget = function() {
        var marginProperty = this.parent.originSide == "left" ? "marginLeft" : "marginRight";
        this.target = this.x + this.size[marginProperty] + this.size.width * this.parent.cellAlign;
    };
    proto.renderPosition = function(x) {
        // render position of cell with in slider
        var side = this.parent.originSide;
        this.element.style[side] = this.parent.getPositionValue(x);
    };
    /**
 * @param {Integer} factor - 0, 1, or -1
**/
    proto.wrapShift = function(shift) {
        this.shift = shift;
        this.renderPosition(this.x + this.parent.slideableWidth * shift);
    };
    proto.remove = function() {
        this.element.parentNode.removeChild(this.element);
    };
    return Cell;
});

// slide
(function(window, factory) {
    // universal module definition
    /* jshint strict: false */
    if (typeof define == "function" && define.amd) {
        // AMD
        define("flickity/js/slide", factory);
    } else if (typeof module == "object" && module.exports) {
        // CommonJS
        module.exports = factory();
    } else {
        // browser global
        window.Flickity = window.Flickity || {};
        window.Flickity.Slide = factory();
    }
})(window, function factory() {
    "use strict";
    function Slide(parent) {
        this.parent = parent;
        this.isOriginLeft = parent.originSide == "left";
        this.cells = [];
        this.outerWidth = 0;
        this.height = 0;
    }
    var proto = Slide.prototype;
    proto.addCell = function(cell) {
        this.cells.push(cell);
        this.outerWidth += cell.size.outerWidth;
        this.height = Math.max(cell.size.outerHeight, this.height);
        // first cell stuff
        if (this.cells.length == 1) {
            this.x = cell.x;
            // x comes from first cell
            var beginMargin = this.isOriginLeft ? "marginLeft" : "marginRight";
            this.firstMargin = cell.size[beginMargin];
        }
    };
    proto.updateTarget = function() {
        var endMargin = this.isOriginLeft ? "marginRight" : "marginLeft";
        var lastCell = this.getLastCell();
        var lastMargin = lastCell ? lastCell.size[endMargin] : 0;
        var slideWidth = this.outerWidth - (this.firstMargin + lastMargin);
        this.target = this.x + this.firstMargin + slideWidth * this.parent.cellAlign;
    };
    proto.getLastCell = function() {
        return this.cells[this.cells.length - 1];
    };
    proto.select = function() {
        this.changeSelectedClass("add");
    };
    proto.unselect = function() {
        this.changeSelectedClass("remove");
    };
    proto.changeSelectedClass = function(method) {
        this.cells.forEach(function(cell) {
            cell.element.classList[method]("is-selected");
        });
    };
    proto.getCellElements = function() {
        return this.cells.map(function(cell) {
            return cell.element;
        });
    };
    return Slide;
});

// animate
(function(window, factory) {
    // universal module definition
    /* jshint strict: false */
    if (typeof define == "function" && define.amd) {
        // AMD
        define("flickity/js/animate", [ "fizzy-ui-utils/utils" ], function(utils) {
            return factory(window, utils);
        });
    } else if (typeof module == "object" && module.exports) {
        // CommonJS
        module.exports = factory(window, require("fizzy-ui-utils"));
    } else {
        // browser global
        window.Flickity = window.Flickity || {};
        window.Flickity.animatePrototype = factory(window, window.fizzyUIUtils);
    }
})(window, function factory(window, utils) {
    // -------------------------- requestAnimationFrame -------------------------- //
    // get rAF, prefixed, if present
    var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
    // fallback to setTimeout
    var lastTime = 0;
    if (!requestAnimationFrame) {
        requestAnimationFrame = function(callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = setTimeout(callback, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    // -------------------------- animate -------------------------- //
    var proto = {};
    proto.startAnimation = function() {
        if (this.isAnimating) {
            return;
        }
        this.isAnimating = true;
        this.restingFrames = 0;
        this.animate();
    };
    proto.animate = function() {
        this.applyDragForce();
        this.applySelectedAttraction();
        var previousX = this.x;
        this.integratePhysics();
        this.positionSlider();
        this.settle(previousX);
        // animate next frame
        if (this.isAnimating) {
            var _this = this;
            requestAnimationFrame(function animateFrame() {
                _this.animate();
            });
        }
    };
    var transformProperty = function() {
        var style = document.documentElement.style;
        if (typeof style.transform == "string") {
            return "transform";
        }
        return "WebkitTransform";
    }();
    proto.positionSlider = function() {
        var x = this.x;
        // wrap position around
        if (this.options.wrapAround && this.cells.length > 1) {
            x = utils.modulo(x, this.slideableWidth);
            x = x - this.slideableWidth;
            this.shiftWrapCells(x);
        }
        x = x + this.cursorPosition;
        // reverse if right-to-left and using transform
        x = this.options.rightToLeft && transformProperty ? -x : x;
        var value = this.getPositionValue(x);
        // use 3D tranforms for hardware acceleration on iOS
        // but use 2D when settled, for better font-rendering
        this.slider.style[transformProperty] = this.isAnimating ? "translate3d(" + value + ",0,0)" : "translateX(" + value + ")";
        // scroll event
        var firstSlide = this.slides[0];
        if (firstSlide) {
            var positionX = -this.x - firstSlide.target;
            var progress = positionX / this.slidesWidth;
            this.dispatchEvent("scroll", null, [ progress, positionX ]);
        }
    };
    proto.positionSliderAtSelected = function() {
        if (!this.cells.length) {
            return;
        }
        this.x = -this.selectedSlide.target;
        this.positionSlider();
    };
    proto.getPositionValue = function(position) {
        if (this.options.percentPosition) {
            // percent position, round to 2 digits, like 12.34%
            return Math.round(position / this.size.innerWidth * 1e4) * .01 + "%";
        } else {
            // pixel positioning
            return Math.round(position) + "px";
        }
    };
    proto.settle = function(previousX) {
        // keep track of frames where x hasn't moved
        if (!this.isPointerDown && Math.round(this.x * 100) == Math.round(previousX * 100)) {
            this.restingFrames++;
        }
        // stop animating if resting for 3 or more frames
        if (this.restingFrames > 2) {
            this.isAnimating = false;
            delete this.isFreeScrolling;
            // render position with translateX when settled
            this.positionSlider();
            this.dispatchEvent("settle");
        }
    };
    proto.shiftWrapCells = function(x) {
        // shift before cells
        var beforeGap = this.cursorPosition + x;
        this._shiftCells(this.beforeShiftCells, beforeGap, -1);
        // shift after cells
        var afterGap = this.size.innerWidth - (x + this.slideableWidth + this.cursorPosition);
        this._shiftCells(this.afterShiftCells, afterGap, 1);
    };
    proto._shiftCells = function(cells, gap, shift) {
        for (var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            var cellShift = gap > 0 ? shift : 0;
            cell.wrapShift(cellShift);
            gap -= cell.size.outerWidth;
        }
    };
    proto._unshiftCells = function(cells) {
        if (!cells || !cells.length) {
            return;
        }
        for (var i = 0; i < cells.length; i++) {
            cells[i].wrapShift(0);
        }
    };
    // -------------------------- physics -------------------------- //
    proto.integratePhysics = function() {
        this.x += this.velocity;
        this.velocity *= this.getFrictionFactor();
    };
    proto.applyForce = function(force) {
        this.velocity += force;
    };
    proto.getFrictionFactor = function() {
        return 1 - this.options[this.isFreeScrolling ? "freeScrollFriction" : "friction"];
    };
    proto.getRestingPosition = function() {
        // my thanks to Steven Wittens, who simplified this math greatly
        return this.x + this.velocity / (1 - this.getFrictionFactor());
    };
    proto.applyDragForce = function() {
        if (!this.isPointerDown) {
            return;
        }
        // change the position to drag position by applying force
        var dragVelocity = this.dragX - this.x;
        var dragForce = dragVelocity - this.velocity;
        this.applyForce(dragForce);
    };
    proto.applySelectedAttraction = function() {
        // do not attract if pointer down or no cells
        if (this.isPointerDown || this.isFreeScrolling || !this.cells.length) {
            return;
        }
        var distance = this.selectedSlide.target * -1 - this.x;
        var force = distance * this.options.selectedAttraction;
        this.applyForce(force);
    };
    return proto;
});

// Flickity main
(function(window, factory) {
    // universal module definition
    /* jshint strict: false */
    if (typeof define == "function" && define.amd) {
        // AMD
        define("flickity/js/flickity", [ "ev-emitter/ev-emitter", "get-size/get-size", "fizzy-ui-utils/utils", "./cell", "./slide", "./animate" ], function(EvEmitter, getSize, utils, Cell, Slide, animatePrototype) {
            return factory(window, EvEmitter, getSize, utils, Cell, Slide, animatePrototype);
        });
    } else if (typeof module == "object" && module.exports) {
        // CommonJS
        module.exports = factory(window, require("ev-emitter"), require("get-size"), require("fizzy-ui-utils"), require("./cell"), require("./slide"), require("./animate"));
    } else {
        // browser global
        var _Flickity = window.Flickity;
        window.Flickity = factory(window, window.EvEmitter, window.getSize, window.fizzyUIUtils, _Flickity.Cell, _Flickity.Slide, _Flickity.animatePrototype);
    }
})(window, function factory(window, EvEmitter, getSize, utils, Cell, Slide, animatePrototype) {
    // vars
    var jQuery = window.jQuery;
    var getComputedStyle = window.getComputedStyle;
    var console = window.console;
    function moveElements(elems, toElem) {
        elems = utils.makeArray(elems);
        while (elems.length) {
            toElem.appendChild(elems.shift());
        }
    }
    // -------------------------- Flickity -------------------------- //
    // globally unique identifiers
    var GUID = 0;
    // internal store of all Flickity intances
    var instances = {};
    function Flickity(element, options) {
        var queryElement = utils.getQueryElement(element);
        if (!queryElement) {
            if (console) {
                console.error("Bad element for Flickity: " + (queryElement || element));
            }
            return;
        }
        this.element = queryElement;
        // do not initialize twice on same element
        if (this.element.flickityGUID) {
            var instance = instances[this.element.flickityGUID];
            instance.option(options);
            return instance;
        }
        // add jQuery
        if (jQuery) {
            this.$element = jQuery(this.element);
        }
        // options
        this.options = utils.extend({}, this.constructor.defaults);
        this.option(options);
        // kick things off
        this._create();
    }
    Flickity.defaults = {
        accessibility: true,
        // adaptiveHeight: false,
        cellAlign: "center",
        // cellSelector: undefined,
        // contain: false,
        freeScrollFriction: .075,
        // friction when free-scrolling
        friction: .28,
        // friction when selecting
        namespaceJQueryEvents: true,
        // initialIndex: 0,
        percentPosition: true,
        resize: true,
        selectedAttraction: .025,
        setGallerySize: true
    };
    // hash of methods triggered on _create()
    Flickity.createMethods = [];
    var proto = Flickity.prototype;
    // inherit EventEmitter
    utils.extend(proto, EvEmitter.prototype);
    proto._create = function() {
        // add id for Flickity.data
        var id = this.guid = ++GUID;
        this.element.flickityGUID = id;
        // expando
        instances[id] = this;
        // associate via id
        // initial properties
        this.selectedIndex = 0;
        // how many frames slider has been in same position
        this.restingFrames = 0;
        // initial physics properties
        this.x = 0;
        this.velocity = 0;
        this.originSide = this.options.rightToLeft ? "right" : "left";
        // create viewport & slider
        this.viewport = document.createElement("div");
        this.viewport.className = "flickity-viewport";
        this._createSlider();
        if (this.options.resize || this.options.watchCSS) {
            window.addEventListener("resize", this);
        }
        Flickity.createMethods.forEach(function(method) {
            this[method]();
        }, this);
        if (this.options.watchCSS) {
            this.watchCSS();
        } else {
            this.activate();
        }
    };
    /**
 * set options
 * @param {Object} opts
 */
    proto.option = function(opts) {
        utils.extend(this.options, opts);
    };
    proto.activate = function() {
        if (this.isActive) {
            return;
        }
        this.isActive = true;
        this.element.classList.add("flickity-enabled");
        if (this.options.rightToLeft) {
            this.element.classList.add("flickity-rtl");
        }
        this.getSize();
        // move initial cell elements so they can be loaded as cells
        var cellElems = this._filterFindCellElements(this.element.children);
        moveElements(cellElems, this.slider);
        this.viewport.appendChild(this.slider);
        this.element.appendChild(this.viewport);
        // get cells from children
        this.reloadCells();
        if (this.options.accessibility) {
            // allow element to focusable
            this.element.tabIndex = 0;
            // listen for key presses
            this.element.addEventListener("keydown", this);
        }
        this.emitEvent("activate");
        var index;
        var initialIndex = this.options.initialIndex;
        if (this.isInitActivated) {
            index = this.selectedIndex;
        } else if (initialIndex !== undefined) {
            index = this.cells[initialIndex] ? initialIndex : 0;
        } else {
            index = 0;
        }
        // select instantly
        this.select(index, false, true);
        // flag for initial activation, for using initialIndex
        this.isInitActivated = true;
    };
    // slider positions the cells
    proto._createSlider = function() {
        // slider element does all the positioning
        var slider = document.createElement("div");
        slider.className = "flickity-slider";
        slider.style[this.originSide] = 0;
        this.slider = slider;
    };
    proto._filterFindCellElements = function(elems) {
        return utils.filterFindElements(elems, this.options.cellSelector);
    };
    // goes through all children
    proto.reloadCells = function() {
        // collection of item elements
        this.cells = this._makeCells(this.slider.children);
        this.positionCells();
        this._getWrapShiftCells();
        this.setGallerySize();
    };
    /**
 * turn elements into Flickity.Cells
 * @param {Array or NodeList or HTMLElement} elems
 * @returns {Array} items - collection of new Flickity Cells
 */
    proto._makeCells = function(elems) {
        var cellElems = this._filterFindCellElements(elems);
        // create new Flickity for collection
        var cells = cellElems.map(function(cellElem) {
            return new Cell(cellElem, this);
        }, this);
        return cells;
    };
    proto.getLastCell = function() {
        return this.cells[this.cells.length - 1];
    };
    proto.getLastSlide = function() {
        return this.slides[this.slides.length - 1];
    };
    // positions all cells
    proto.positionCells = function() {
        // size all cells
        this._sizeCells(this.cells);
        // position all cells
        this._positionCells(0);
    };
    /**
 * position certain cells
 * @param {Integer} index - which cell to start with
 */
    proto._positionCells = function(index) {
        index = index || 0;
        // also measure maxCellHeight
        // start 0 if positioning all cells
        this.maxCellHeight = index ? this.maxCellHeight || 0 : 0;
        var cellX = 0;
        // get cellX
        if (index > 0) {
            var startCell = this.cells[index - 1];
            cellX = startCell.x + startCell.size.outerWidth;
        }
        var len = this.cells.length;
        for (var i = index; i < len; i++) {
            var cell = this.cells[i];
            cell.setPosition(cellX);
            cellX += cell.size.outerWidth;
            this.maxCellHeight = Math.max(cell.size.outerHeight, this.maxCellHeight);
        }
        // keep track of cellX for wrap-around
        this.slideableWidth = cellX;
        // slides
        this.updateSlides();
        // contain slides target
        this._containSlides();
        // update slidesWidth
        this.slidesWidth = len ? this.getLastSlide().target - this.slides[0].target : 0;
    };
    /**
 * cell.getSize() on multiple cells
 * @param {Array} cells
 */
    proto._sizeCells = function(cells) {
        cells.forEach(function(cell) {
            cell.getSize();
        });
    };
    // --------------------------  -------------------------- //
    proto.updateSlides = function() {
        this.slides = [];
        if (!this.cells.length) {
            return;
        }
        var slide = new Slide(this);
        this.slides.push(slide);
        var isOriginLeft = this.originSide == "left";
        var nextMargin = isOriginLeft ? "marginRight" : "marginLeft";
        var canCellFit = this._getCanCellFit();
        this.cells.forEach(function(cell, i) {
            // just add cell if first cell in slide
            if (!slide.cells.length) {
                slide.addCell(cell);
                return;
            }
            var slideWidth = slide.outerWidth - slide.firstMargin + (cell.size.outerWidth - cell.size[nextMargin]);
            if (canCellFit.call(this, i, slideWidth)) {
                slide.addCell(cell);
            } else {
                // doesn't fit, new slide
                slide.updateTarget();
                slide = new Slide(this);
                this.slides.push(slide);
                slide.addCell(cell);
            }
        }, this);
        // last slide
        slide.updateTarget();
        // update .selectedSlide
        this.updateSelectedSlide();
    };
    proto._getCanCellFit = function() {
        var groupCells = this.options.groupCells;
        if (!groupCells) {
            return function() {
                return false;
            };
        } else if (typeof groupCells == "number") {
            // group by number. 3 -> [0,1,2], [3,4,5], ...
            var number = parseInt(groupCells, 10);
            return function(i) {
                return i % number !== 0;
            };
        }
        // default, group by width of slide
        // parse '75%
        var percentMatch = typeof groupCells == "string" && groupCells.match(/^(\d+)%$/);
        var percent = percentMatch ? parseInt(percentMatch[1], 10) / 100 : 1;
        return function(i, slideWidth) {
            return slideWidth <= (this.size.innerWidth + 1) * percent;
        };
    };
    // alias _init for jQuery plugin .flickity()
    proto._init = proto.reposition = function() {
        this.positionCells();
        this.positionSliderAtSelected();
    };
    proto.getSize = function() {
        this.size = getSize(this.element);
        this.setCellAlign();
        this.cursorPosition = this.size.innerWidth * this.cellAlign;
    };
    var cellAlignShorthands = {
        // cell align, then based on origin side
        center: {
            left: .5,
            right: .5
        },
        left: {
            left: 0,
            right: 1
        },
        right: {
            right: 0,
            left: 1
        }
    };
    proto.setCellAlign = function() {
        var shorthand = cellAlignShorthands[this.options.cellAlign];
        this.cellAlign = shorthand ? shorthand[this.originSide] : this.options.cellAlign;
    };
    proto.setGallerySize = function() {
        if (this.options.setGallerySize) {
            var height = this.options.adaptiveHeight && this.selectedSlide ? this.selectedSlide.height : this.maxCellHeight;
            this.viewport.style.height = height + "px";
        }
    };
    proto._getWrapShiftCells = function() {
        // only for wrap-around
        if (!this.options.wrapAround) {
            return;
        }
        // unshift previous cells
        this._unshiftCells(this.beforeShiftCells);
        this._unshiftCells(this.afterShiftCells);
        // get before cells
        // initial gap
        var gapX = this.cursorPosition;
        var cellIndex = this.cells.length - 1;
        this.beforeShiftCells = this._getGapCells(gapX, cellIndex, -1);
        // get after cells
        // ending gap between last cell and end of gallery viewport
        gapX = this.size.innerWidth - this.cursorPosition;
        // start cloning at first cell, working forwards
        this.afterShiftCells = this._getGapCells(gapX, 0, 1);
    };
    proto._getGapCells = function(gapX, cellIndex, increment) {
        // keep adding cells until the cover the initial gap
        var cells = [];
        while (gapX > 0) {
            var cell = this.cells[cellIndex];
            if (!cell) {
                break;
            }
            cells.push(cell);
            cellIndex += increment;
            gapX -= cell.size.outerWidth;
        }
        return cells;
    };
    // ----- contain ----- //
    // contain cell targets so no excess sliding
    proto._containSlides = function() {
        if (!this.options.contain || this.options.wrapAround || !this.cells.length) {
            return;
        }
        var isRightToLeft = this.options.rightToLeft;
        var beginMargin = isRightToLeft ? "marginRight" : "marginLeft";
        var endMargin = isRightToLeft ? "marginLeft" : "marginRight";
        var contentWidth = this.slideableWidth - this.getLastCell().size[endMargin];
        // content is less than gallery size
        var isContentSmaller = contentWidth < this.size.innerWidth;
        // bounds
        var beginBound = this.cursorPosition + this.cells[0].size[beginMargin];
        var endBound = contentWidth - this.size.innerWidth * (1 - this.cellAlign);
        // contain each cell target
        this.slides.forEach(function(slide) {
            if (isContentSmaller) {
                // all cells fit inside gallery
                slide.target = contentWidth * this.cellAlign;
            } else {
                // contain to bounds
                slide.target = Math.max(slide.target, beginBound);
                slide.target = Math.min(slide.target, endBound);
            }
        }, this);
    };
    // -----  ----- //
    /**
 * emits events via eventEmitter and jQuery events
 * @param {String} type - name of event
 * @param {Event} event - original event
 * @param {Array} args - extra arguments
 */
    proto.dispatchEvent = function(type, event, args) {
        var emitArgs = event ? [ event ].concat(args) : args;
        this.emitEvent(type, emitArgs);
        if (jQuery && this.$element) {
            // default trigger with type if no event
            type += this.options.namespaceJQueryEvents ? ".flickity" : "";
            var $event = type;
            if (event) {
                // create jQuery event
                var jQEvent = jQuery.Event(event);
                jQEvent.type = type;
                $event = jQEvent;
            }
            this.$element.trigger($event, args);
        }
    };
    // -------------------------- select -------------------------- //
    /**
 * @param {Integer} index - index of the slide
 * @param {Boolean} isWrap - will wrap-around to last/first if at the end
 * @param {Boolean} isInstant - will immediately set position at selected cell
 */
    proto.select = function(index, isWrap, isInstant) {
        if (!this.isActive) {
            return;
        }
        index = parseInt(index, 10);
        this._wrapSelect(index);
        if (this.options.wrapAround || isWrap) {
            index = utils.modulo(index, this.slides.length);
        }
        // bail if invalid index
        if (!this.slides[index]) {
            return;
        }
        this.selectedIndex = index;
        this.updateSelectedSlide();
        if (isInstant) {
            this.positionSliderAtSelected();
        } else {
            this.startAnimation();
        }
        if (this.options.adaptiveHeight) {
            this.setGallerySize();
        }
        this.dispatchEvent("select");
        // old v1 event name, remove in v3
        this.dispatchEvent("cellSelect");
    };
    // wraps position for wrapAround, to move to closest slide. #113
    proto._wrapSelect = function(index) {
        var len = this.slides.length;
        var isWrapping = this.options.wrapAround && len > 1;
        if (!isWrapping) {
            return index;
        }
        var wrapIndex = utils.modulo(index, len);
        // go to shortest
        var delta = Math.abs(wrapIndex - this.selectedIndex);
        var backWrapDelta = Math.abs(wrapIndex + len - this.selectedIndex);
        var forewardWrapDelta = Math.abs(wrapIndex - len - this.selectedIndex);
        if (!this.isDragSelect && backWrapDelta < delta) {
            index += len;
        } else if (!this.isDragSelect && forewardWrapDelta < delta) {
            index -= len;
        }
        // wrap position so slider is within normal area
        if (index < 0) {
            this.x -= this.slideableWidth;
        } else if (index >= len) {
            this.x += this.slideableWidth;
        }
    };
    proto.previous = function(isWrap, isInstant) {
        this.select(this.selectedIndex - 1, isWrap, isInstant);
    };
    proto.next = function(isWrap, isInstant) {
        this.select(this.selectedIndex + 1, isWrap, isInstant);
    };
    proto.updateSelectedSlide = function() {
        var slide = this.slides[this.selectedIndex];
        // selectedIndex could be outside of slides, if triggered before resize()
        if (!slide) {
            return;
        }
        // unselect previous selected slide
        this.unselectSelectedSlide();
        // update new selected slide
        this.selectedSlide = slide;
        slide.select();
        this.selectedCells = slide.cells;
        this.selectedElements = slide.getCellElements();
        // HACK: selectedCell & selectedElement is first cell in slide, backwards compatibility
        // Remove in v3?
        this.selectedCell = slide.cells[0];
        this.selectedElement = this.selectedElements[0];
    };
    proto.unselectSelectedSlide = function() {
        if (this.selectedSlide) {
            this.selectedSlide.unselect();
        }
    };
    /**
 * select slide from number or cell element
 * @param {Element or Number} elem
 */
    proto.selectCell = function(value, isWrap, isInstant) {
        // get cell
        var cell;
        if (typeof value == "number") {
            cell = this.cells[value];
        } else {
            // use string as selector
            if (typeof value == "string") {
                value = this.element.querySelector(value);
            }
            // get cell from element
            cell = this.getCell(value);
        }
        // select slide that has cell
        for (var i = 0; cell && i < this.slides.length; i++) {
            var slide = this.slides[i];
            var index = slide.cells.indexOf(cell);
            if (index != -1) {
                this.select(i, isWrap, isInstant);
                return;
            }
        }
    };
    // -------------------------- get cells -------------------------- //
    /**
 * get Flickity.Cell, given an Element
 * @param {Element} elem
 * @returns {Flickity.Cell} item
 */
    proto.getCell = function(elem) {
        // loop through cells to get the one that matches
        for (var i = 0; i < this.cells.length; i++) {
            var cell = this.cells[i];
            if (cell.element == elem) {
                return cell;
            }
        }
    };
    /**
 * get collection of Flickity.Cells, given Elements
 * @param {Element, Array, NodeList} elems
 * @returns {Array} cells - Flickity.Cells
 */
    proto.getCells = function(elems) {
        elems = utils.makeArray(elems);
        var cells = [];
        elems.forEach(function(elem) {
            var cell = this.getCell(elem);
            if (cell) {
                cells.push(cell);
            }
        }, this);
        return cells;
    };
    /**
 * get cell elements
 * @returns {Array} cellElems
 */
    proto.getCellElements = function() {
        return this.cells.map(function(cell) {
            return cell.element;
        });
    };
    /**
 * get parent cell from an element
 * @param {Element} elem
 * @returns {Flickit.Cell} cell
 */
    proto.getParentCell = function(elem) {
        // first check if elem is cell
        var cell = this.getCell(elem);
        if (cell) {
            return cell;
        }
        // try to get parent cell elem
        elem = utils.getParent(elem, ".flickity-slider > *");
        return this.getCell(elem);
    };
    /**
 * get cells adjacent to a slide
 * @param {Integer} adjCount - number of adjacent slides
 * @param {Integer} index - index of slide to start
 * @returns {Array} cells - array of Flickity.Cells
 */
    proto.getAdjacentCellElements = function(adjCount, index) {
        if (!adjCount) {
            return this.selectedSlide.getCellElements();
        }
        index = index === undefined ? this.selectedIndex : index;
        var len = this.slides.length;
        if (1 + adjCount * 2 >= len) {
            return this.getCellElements();
        }
        var cellElems = [];
        for (var i = index - adjCount; i <= index + adjCount; i++) {
            var slideIndex = this.options.wrapAround ? utils.modulo(i, len) : i;
            var slide = this.slides[slideIndex];
            if (slide) {
                cellElems = cellElems.concat(slide.getCellElements());
            }
        }
        return cellElems;
    };
    // -------------------------- events -------------------------- //
    proto.uiChange = function() {
        this.emitEvent("uiChange");
    };
    proto.childUIPointerDown = function(event) {
        this.emitEvent("childUIPointerDown", [ event ]);
    };
    // ----- resize ----- //
    proto.onresize = function() {
        this.watchCSS();
        this.resize();
    };
    utils.debounceMethod(Flickity, "onresize", 150);
    proto.resize = function() {
        if (!this.isActive) {
            return;
        }
        this.getSize();
        // wrap values
        if (this.options.wrapAround) {
            this.x = utils.modulo(this.x, this.slideableWidth);
        }
        this.positionCells();
        this._getWrapShiftCells();
        this.setGallerySize();
        this.emitEvent("resize");
        // update selected index for group slides, instant
        // TODO: position can be lost between groups of various numbers
        var selectedElement = this.selectedElements && this.selectedElements[0];
        this.selectCell(selectedElement, false, true);
    };
    // watches the :after property, activates/deactivates
    proto.watchCSS = function() {
        var watchOption = this.options.watchCSS;
        if (!watchOption) {
            return;
        }
        var afterContent = getComputedStyle(this.element, ":after").content;
        // activate if :after { content: 'flickity' }
        if (afterContent.indexOf("flickity") != -1) {
            this.activate();
        } else {
            this.deactivate();
        }
    };
    // ----- keydown ----- //
    // go previous/next if left/right keys pressed
    proto.onkeydown = function(event) {
        // only work if element is in focus
        if (!this.options.accessibility || document.activeElement && document.activeElement != this.element) {
            return;
        }
        if (event.keyCode == 37) {
            // go left
            var leftMethod = this.options.rightToLeft ? "next" : "previous";
            this.uiChange();
            this[leftMethod]();
        } else if (event.keyCode == 39) {
            // go right
            var rightMethod = this.options.rightToLeft ? "previous" : "next";
            this.uiChange();
            this[rightMethod]();
        }
    };
    // -------------------------- destroy -------------------------- //
    // deactivate all Flickity functionality, but keep stuff available
    proto.deactivate = function() {
        if (!this.isActive) {
            return;
        }
        this.element.classList.remove("flickity-enabled");
        this.element.classList.remove("flickity-rtl");
        // destroy cells
        this.cells.forEach(function(cell) {
            cell.destroy();
        });
        this.unselectSelectedSlide();
        this.element.removeChild(this.viewport);
        // move child elements back into element
        moveElements(this.slider.children, this.element);
        if (this.options.accessibility) {
            this.element.removeAttribute("tabIndex");
            this.element.removeEventListener("keydown", this);
        }
        // set flags
        this.isActive = false;
        this.emitEvent("deactivate");
    };
    proto.destroy = function() {
        this.deactivate();
        window.removeEventListener("resize", this);
        this.emitEvent("destroy");
        if (jQuery && this.$element) {
            jQuery.removeData(this.element, "flickity");
        }
        delete this.element.flickityGUID;
        delete instances[this.guid];
    };
    // -------------------------- prototype -------------------------- //
    utils.extend(proto, animatePrototype);
    // -------------------------- extras -------------------------- //
    /**
 * get Flickity instance from element
 * @param {Element} elem
 * @returns {Flickity}
 */
    Flickity.data = function(elem) {
        elem = utils.getQueryElement(elem);
        var id = elem && elem.flickityGUID;
        return id && instances[id];
    };
    utils.htmlInit(Flickity, "flickity");
    if (jQuery && jQuery.bridget) {
        jQuery.bridget("flickity", Flickity);
    }
    Flickity.Cell = Cell;
    return Flickity;
});

/*!
 * Unipointer v2.1.0
 * base class for doing one thing with pointer event
 * MIT license
 */
/*jshint browser: true, undef: true, unused: true, strict: true */
(function(window, factory) {
    // universal module definition
    /* jshint strict: false */
    /*global define, module, require */
    if (typeof define == "function" && define.amd) {
        // AMD
        define("unipointer/unipointer", [ "ev-emitter/ev-emitter" ], function(EvEmitter) {
            return factory(window, EvEmitter);
        });
    } else if (typeof module == "object" && module.exports) {
        // CommonJS
        module.exports = factory(window, require("ev-emitter"));
    } else {
        // browser global
        window.Unipointer = factory(window, window.EvEmitter);
    }
})(window, function factory(window, EvEmitter) {
    function noop() {}
    function Unipointer() {}
    // inherit EvEmitter
    var proto = Unipointer.prototype = Object.create(EvEmitter.prototype);
    proto.bindStartEvent = function(elem) {
        this._bindStartEvent(elem, true);
    };
    proto.unbindStartEvent = function(elem) {
        this._bindStartEvent(elem, false);
    };
    /**
 * works as unbinder, as you can ._bindStart( false ) to unbind
 * @param {Boolean} isBind - will unbind if falsey
 */
    proto._bindStartEvent = function(elem, isBind) {
        // munge isBind, default to true
        isBind = isBind === undefined ? true : !!isBind;
        var bindMethod = isBind ? "addEventListener" : "removeEventListener";
        if (window.navigator.pointerEnabled) {
            // W3C Pointer Events, IE11. See https://coderwall.com/p/mfreca
            elem[bindMethod]("pointerdown", this);
        } else if (window.navigator.msPointerEnabled) {
            // IE10 Pointer Events
            elem[bindMethod]("MSPointerDown", this);
        } else {
            // listen for both, for devices like Chrome Pixel
            elem[bindMethod]("mousedown", this);
            elem[bindMethod]("touchstart", this);
        }
    };
    // trigger handler methods for events
    proto.handleEvent = function(event) {
        var method = "on" + event.type;
        if (this[method]) {
            this[method](event);
        }
    };
    // returns the touch that we're keeping track of
    proto.getTouch = function(touches) {
        for (var i = 0; i < touches.length; i++) {
            var touch = touches[i];
            if (touch.identifier == this.pointerIdentifier) {
                return touch;
            }
        }
    };
    // ----- start event ----- //
    proto.onmousedown = function(event) {
        // dismiss clicks from right or middle buttons
        var button = event.button;
        if (button && (button !== 0 && button !== 1)) {
            return;
        }
        this._pointerDown(event, event);
    };
    proto.ontouchstart = function(event) {
        this._pointerDown(event, event.changedTouches[0]);
    };
    proto.onMSPointerDown = proto.onpointerdown = function(event) {
        this._pointerDown(event, event);
    };
    /**
 * pointer start
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
    proto._pointerDown = function(event, pointer) {
        // dismiss other pointers
        if (this.isPointerDown) {
            return;
        }
        this.isPointerDown = true;
        // save pointer identifier to match up touch events
        this.pointerIdentifier = pointer.pointerId !== undefined ? // pointerId for pointer events, touch.indentifier for touch events
        pointer.pointerId : pointer.identifier;
        this.pointerDown(event, pointer);
    };
    proto.pointerDown = function(event, pointer) {
        this._bindPostStartEvents(event);
        this.emitEvent("pointerDown", [ event, pointer ]);
    };
    // hash of events to be bound after start event
    var postStartEvents = {
        mousedown: [ "mousemove", "mouseup" ],
        touchstart: [ "touchmove", "touchend", "touchcancel" ],
        pointerdown: [ "pointermove", "pointerup", "pointercancel" ],
        MSPointerDown: [ "MSPointerMove", "MSPointerUp", "MSPointerCancel" ]
    };
    proto._bindPostStartEvents = function(event) {
        if (!event) {
            return;
        }
        // get proper events to match start event
        var events = postStartEvents[event.type];
        // bind events to node
        events.forEach(function(eventName) {
            window.addEventListener(eventName, this);
        }, this);
        // save these arguments
        this._boundPointerEvents = events;
    };
    proto._unbindPostStartEvents = function() {
        // check for _boundEvents, in case dragEnd triggered twice (old IE8 bug)
        if (!this._boundPointerEvents) {
            return;
        }
        this._boundPointerEvents.forEach(function(eventName) {
            window.removeEventListener(eventName, this);
        }, this);
        delete this._boundPointerEvents;
    };
    // ----- move event ----- //
    proto.onmousemove = function(event) {
        this._pointerMove(event, event);
    };
    proto.onMSPointerMove = proto.onpointermove = function(event) {
        if (event.pointerId == this.pointerIdentifier) {
            this._pointerMove(event, event);
        }
    };
    proto.ontouchmove = function(event) {
        var touch = this.getTouch(event.changedTouches);
        if (touch) {
            this._pointerMove(event, touch);
        }
    };
    /**
 * pointer move
 * @param {Event} event
 * @param {Event or Touch} pointer
 * @private
 */
    proto._pointerMove = function(event, pointer) {
        this.pointerMove(event, pointer);
    };
    // public
    proto.pointerMove = function(event, pointer) {
        this.emitEvent("pointerMove", [ event, pointer ]);
    };
    // ----- end event ----- //
    proto.onmouseup = function(event) {
        this._pointerUp(event, event);
    };
    proto.onMSPointerUp = proto.onpointerup = function(event) {
        if (event.pointerId == this.pointerIdentifier) {
            this._pointerUp(event, event);
        }
    };
    proto.ontouchend = function(event) {
        var touch = this.getTouch(event.changedTouches);
        if (touch) {
            this._pointerUp(event, touch);
        }
    };
    /**
 * pointer up
 * @param {Event} event
 * @param {Event or Touch} pointer
 * @private
 */
    proto._pointerUp = function(event, pointer) {
        this._pointerDone();
        this.pointerUp(event, pointer);
    };
    // public
    proto.pointerUp = function(event, pointer) {
        this.emitEvent("pointerUp", [ event, pointer ]);
    };
    // ----- pointer done ----- //
    // triggered on pointer up & pointer cancel
    proto._pointerDone = function() {
        // reset properties
        this.isPointerDown = false;
        delete this.pointerIdentifier;
        // remove events
        this._unbindPostStartEvents();
        this.pointerDone();
    };
    proto.pointerDone = noop;
    // ----- pointer cancel ----- //
    proto.onMSPointerCancel = proto.onpointercancel = function(event) {
        if (event.pointerId == this.pointerIdentifier) {
            this._pointerCancel(event, event);
        }
    };
    proto.ontouchcancel = function(event) {
        var touch = this.getTouch(event.changedTouches);
        if (touch) {
            this._pointerCancel(event, touch);
        }
    };
    /**
 * pointer cancel
 * @param {Event} event
 * @param {Event or Touch} pointer
 * @private
 */
    proto._pointerCancel = function(event, pointer) {
        this._pointerDone();
        this.pointerCancel(event, pointer);
    };
    // public
    proto.pointerCancel = function(event, pointer) {
        this.emitEvent("pointerCancel", [ event, pointer ]);
    };
    // -----  ----- //
    // utility function for getting x/y coords from event
    Unipointer.getPointerPoint = function(pointer) {
        return {
            x: pointer.pageX,
            y: pointer.pageY
        };
    };
    // -----  ----- //
    return Unipointer;
});

/*!
 * Unidragger v2.1.0
 * Draggable base class
 * MIT license
 */
/*jshint browser: true, unused: true, undef: true, strict: true */
(function(window, factory) {
    // universal module definition
    /*jshint strict: false */
    /*globals define, module, require */
    if (typeof define == "function" && define.amd) {
        // AMD
        define("unidragger/unidragger", [ "unipointer/unipointer" ], function(Unipointer) {
            return factory(window, Unipointer);
        });
    } else if (typeof module == "object" && module.exports) {
        // CommonJS
        module.exports = factory(window, require("unipointer"));
    } else {
        // browser global
        window.Unidragger = factory(window, window.Unipointer);
    }
})(window, function factory(window, Unipointer) {
    // -----  ----- //
    function noop() {}
    // -------------------------- Unidragger -------------------------- //
    function Unidragger() {}
    // inherit Unipointer & EvEmitter
    var proto = Unidragger.prototype = Object.create(Unipointer.prototype);
    // ----- bind start ----- //
    proto.bindHandles = function() {
        this._bindHandles(true);
    };
    proto.unbindHandles = function() {
        this._bindHandles(false);
    };
    var navigator = window.navigator;
    /**
 * works as unbinder, as you can .bindHandles( false ) to unbind
 * @param {Boolean} isBind - will unbind if falsey
 */
    proto._bindHandles = function(isBind) {
        // munge isBind, default to true
        isBind = isBind === undefined ? true : !!isBind;
        // extra bind logic
        var binderExtra;
        if (navigator.pointerEnabled) {
            binderExtra = function(handle) {
                // disable scrolling on the element
                handle.style.touchAction = isBind ? "none" : "";
            };
        } else if (navigator.msPointerEnabled) {
            binderExtra = function(handle) {
                // disable scrolling on the element
                handle.style.msTouchAction = isBind ? "none" : "";
            };
        } else {
            binderExtra = noop;
        }
        // bind each handle
        var bindMethod = isBind ? "addEventListener" : "removeEventListener";
        for (var i = 0; i < this.handles.length; i++) {
            var handle = this.handles[i];
            this._bindStartEvent(handle, isBind);
            binderExtra(handle);
            handle[bindMethod]("click", this);
        }
    };
    // ----- start event ----- //
    /**
 * pointer start
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
    proto.pointerDown = function(event, pointer) {
        // dismiss range sliders
        if (event.target.nodeName == "INPUT" && event.target.type == "range") {
            // reset pointerDown logic
            this.isPointerDown = false;
            delete this.pointerIdentifier;
            return;
        }
        this._dragPointerDown(event, pointer);
        // kludge to blur focused inputs in dragger
        var focused = document.activeElement;
        if (focused && focused.blur) {
            focused.blur();
        }
        // bind move and end events
        this._bindPostStartEvents(event);
        this.emitEvent("pointerDown", [ event, pointer ]);
    };
    // base pointer down logic
    proto._dragPointerDown = function(event, pointer) {
        // track to see when dragging starts
        this.pointerDownPoint = Unipointer.getPointerPoint(pointer);
        var canPreventDefault = this.canPreventDefaultOnPointerDown(event, pointer);
        if (canPreventDefault) {
            event.preventDefault();
        }
    };
    // overwriteable method so Flickity can prevent for scrolling
    proto.canPreventDefaultOnPointerDown = function(event) {
        // prevent default, unless touchstart or <select>
        return event.target.nodeName != "SELECT";
    };
    // ----- move event ----- //
    /**
 * drag move
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
    proto.pointerMove = function(event, pointer) {
        var moveVector = this._dragPointerMove(event, pointer);
        this.emitEvent("pointerMove", [ event, pointer, moveVector ]);
        this._dragMove(event, pointer, moveVector);
    };
    // base pointer move logic
    proto._dragPointerMove = function(event, pointer) {
        var movePoint = Unipointer.getPointerPoint(pointer);
        var moveVector = {
            x: movePoint.x - this.pointerDownPoint.x,
            y: movePoint.y - this.pointerDownPoint.y
        };
        // start drag if pointer has moved far enough to start drag
        if (!this.isDragging && this.hasDragStarted(moveVector)) {
            this._dragStart(event, pointer);
        }
        return moveVector;
    };
    // condition if pointer has moved far enough to start drag
    proto.hasDragStarted = function(moveVector) {
        return Math.abs(moveVector.x) > 3 || Math.abs(moveVector.y) > 3;
    };
    // ----- end event ----- //
    /**
 * pointer up
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
    proto.pointerUp = function(event, pointer) {
        this.emitEvent("pointerUp", [ event, pointer ]);
        this._dragPointerUp(event, pointer);
    };
    proto._dragPointerUp = function(event, pointer) {
        if (this.isDragging) {
            this._dragEnd(event, pointer);
        } else {
            // pointer didn't move enough for drag to start
            this._staticClick(event, pointer);
        }
    };
    // -------------------------- drag -------------------------- //
    // dragStart
    proto._dragStart = function(event, pointer) {
        this.isDragging = true;
        this.dragStartPoint = Unipointer.getPointerPoint(pointer);
        // prevent clicks
        this.isPreventingClicks = true;
        this.dragStart(event, pointer);
    };
    proto.dragStart = function(event, pointer) {
        this.emitEvent("dragStart", [ event, pointer ]);
    };
    // dragMove
    proto._dragMove = function(event, pointer, moveVector) {
        // do not drag if not dragging yet
        if (!this.isDragging) {
            return;
        }
        this.dragMove(event, pointer, moveVector);
    };
    proto.dragMove = function(event, pointer, moveVector) {
        event.preventDefault();
        this.emitEvent("dragMove", [ event, pointer, moveVector ]);
    };
    // dragEnd
    proto._dragEnd = function(event, pointer) {
        // set flags
        this.isDragging = false;
        // re-enable clicking async
        setTimeout(function() {
            delete this.isPreventingClicks;
        }.bind(this));
        this.dragEnd(event, pointer);
    };
    proto.dragEnd = function(event, pointer) {
        this.emitEvent("dragEnd", [ event, pointer ]);
    };
    // ----- onclick ----- //
    // handle all clicks and prevent clicks when dragging
    proto.onclick = function(event) {
        if (this.isPreventingClicks) {
            event.preventDefault();
        }
    };
    // ----- staticClick ----- //
    // triggered after pointer down & up with no/tiny movement
    proto._staticClick = function(event, pointer) {
        // ignore emulated mouse up clicks
        if (this.isIgnoringMouseUp && event.type == "mouseup") {
            return;
        }
        // allow click in <input>s and <textarea>s
        var nodeName = event.target.nodeName;
        if (nodeName == "INPUT" || nodeName == "TEXTAREA") {
            event.target.focus();
        }
        this.staticClick(event, pointer);
        // set flag for emulated clicks 300ms after touchend
        if (event.type != "mouseup") {
            this.isIgnoringMouseUp = true;
            // reset flag after 300ms
            setTimeout(function() {
                delete this.isIgnoringMouseUp;
            }.bind(this), 400);
        }
    };
    proto.staticClick = function(event, pointer) {
        this.emitEvent("staticClick", [ event, pointer ]);
    };
    // ----- utils ----- //
    Unidragger.getPointerPoint = Unipointer.getPointerPoint;
    // -----  ----- //
    return Unidragger;
});

// drag
(function(window, factory) {
    // universal module definition
    /* jshint strict: false */
    if (typeof define == "function" && define.amd) {
        // AMD
        define("flickity/js/drag", [ "./flickity", "unidragger/unidragger", "fizzy-ui-utils/utils" ], function(Flickity, Unidragger, utils) {
            return factory(window, Flickity, Unidragger, utils);
        });
    } else if (typeof module == "object" && module.exports) {
        // CommonJS
        module.exports = factory(window, require("./flickity"), require("unidragger"), require("fizzy-ui-utils"));
    } else {
        // browser global
        window.Flickity = factory(window, window.Flickity, window.Unidragger, window.fizzyUIUtils);
    }
})(window, function factory(window, Flickity, Unidragger, utils) {
    // ----- defaults ----- //
    utils.extend(Flickity.defaults, {
        draggable: true,
        dragThreshold: 3
    });
    // ----- create ----- //
    Flickity.createMethods.push("_createDrag");
    // -------------------------- drag prototype -------------------------- //
    var proto = Flickity.prototype;
    utils.extend(proto, Unidragger.prototype);
    // --------------------------  -------------------------- //
    proto._createDrag = function() {
        this.on("activate", this.bindDrag);
        this.on("uiChange", this._uiChangeDrag);
        this.on("childUIPointerDown", this._childUIPointerDownDrag);
        this.on("deactivate", this.unbindDrag);
    };
    proto.bindDrag = function() {
        if (!this.options.draggable || this.isDragBound) {
            return;
        }
        this.element.classList.add("is-draggable");
        this.handles = [ this.viewport ];
        this.bindHandles();
        this.isDragBound = true;
    };
    proto.unbindDrag = function() {
        if (!this.isDragBound) {
            return;
        }
        this.element.classList.remove("is-draggable");
        this.unbindHandles();
        delete this.isDragBound;
    };
    proto._uiChangeDrag = function() {
        delete this.isFreeScrolling;
    };
    proto._childUIPointerDownDrag = function(event) {
        event.preventDefault();
        this.pointerDownFocus(event);
    };
    // -------------------------- pointer events -------------------------- //
    // nodes that have text fields
    var cursorNodes = {
        TEXTAREA: true,
        INPUT: true,
        OPTION: true
    };
    // input types that do not have text fields
    var clickTypes = {
        radio: true,
        checkbox: true,
        button: true,
        submit: true,
        image: true,
        file: true
    };
    proto.pointerDown = function(event, pointer) {
        // dismiss inputs with text fields. #403, #404
        var isCursorInput = cursorNodes[event.target.nodeName] && !clickTypes[event.target.type];
        if (isCursorInput) {
            // reset pointerDown logic
            this.isPointerDown = false;
            delete this.pointerIdentifier;
            return;
        }
        this._dragPointerDown(event, pointer);
        // kludge to blur focused inputs in dragger
        var focused = document.activeElement;
        if (focused && focused.blur && focused != this.element && // do not blur body for IE9 & 10, #117
        focused != document.body) {
            focused.blur();
        }
        this.pointerDownFocus(event);
        // stop if it was moving
        this.dragX = this.x;
        this.viewport.classList.add("is-pointer-down");
        // bind move and end events
        this._bindPostStartEvents(event);
        // track scrolling
        this.pointerDownScroll = getScrollPosition();
        window.addEventListener("scroll", this);
        this.dispatchEvent("pointerDown", event, [ pointer ]);
    };
    var touchStartEvents = {
        touchstart: true,
        MSPointerDown: true
    };
    var focusNodes = {
        INPUT: true,
        SELECT: true
    };
    proto.pointerDownFocus = function(event) {
        // focus element, if not touch, and its not an input or select
        if (!this.options.accessibility || touchStartEvents[event.type] || focusNodes[event.target.nodeName]) {
            return;
        }
        var prevScrollY = window.pageYOffset;
        this.element.focus();
        // hack to fix scroll jump after focus, #76
        if (window.pageYOffset != prevScrollY) {
            window.scrollTo(window.pageXOffset, prevScrollY);
        }
    };
    proto.canPreventDefaultOnPointerDown = function(event) {
        // prevent default, unless touchstart or <select>
        var isTouchstart = event.type == "touchstart";
        var targetNodeName = event.target.nodeName;
        return !isTouchstart && targetNodeName != "SELECT";
    };
    // ----- move ----- //
    proto.hasDragStarted = function(moveVector) {
        return Math.abs(moveVector.x) > this.options.dragThreshold;
    };
    // ----- up ----- //
    proto.pointerUp = function(event, pointer) {
        delete this.isTouchScrolling;
        this.viewport.classList.remove("is-pointer-down");
        this.dispatchEvent("pointerUp", event, [ pointer ]);
        this._dragPointerUp(event, pointer);
    };
    proto.pointerDone = function() {
        window.removeEventListener("scroll", this);
        delete this.pointerDownScroll;
    };
    // -------------------------- dragging -------------------------- //
    proto.dragStart = function(event, pointer) {
        this.dragStartPosition = this.x;
        this.startAnimation();
        this.dispatchEvent("dragStart", event, [ pointer ]);
    };
    proto.pointerMove = function(event, pointer) {
        var moveVector = this._dragPointerMove(event, pointer);
        this.dispatchEvent("pointerMove", event, [ pointer, moveVector ]);
        this._dragMove(event, pointer, moveVector);
    };
    proto.dragMove = function(event, pointer, moveVector) {
        event.preventDefault();
        this.previousDragX = this.dragX;
        // reverse if right-to-left
        var direction = this.options.rightToLeft ? -1 : 1;
        var dragX = this.dragStartPosition + moveVector.x * direction;
        if (!this.options.wrapAround && this.slides.length) {
            // slow drag
            var originBound = Math.max(-this.slides[0].target, this.dragStartPosition);
            dragX = dragX > originBound ? (dragX + originBound) * .5 : dragX;
            var endBound = Math.min(-this.getLastSlide().target, this.dragStartPosition);
            dragX = dragX < endBound ? (dragX + endBound) * .5 : dragX;
        }
        this.dragX = dragX;
        this.dragMoveTime = new Date();
        this.dispatchEvent("dragMove", event, [ pointer, moveVector ]);
    };
    proto.dragEnd = function(event, pointer) {
        if (this.options.freeScroll) {
            this.isFreeScrolling = true;
        }
        // set selectedIndex based on where flick will end up
        var index = this.dragEndRestingSelect();
        if (this.options.freeScroll && !this.options.wrapAround) {
            // if free-scroll & not wrap around
            // do not free-scroll if going outside of bounding slides
            // so bounding slides can attract slider, and keep it in bounds
            var restingX = this.getRestingPosition();
            this.isFreeScrolling = -restingX > this.slides[0].target && -restingX < this.getLastSlide().target;
        } else if (!this.options.freeScroll && index == this.selectedIndex) {
            // boost selection if selected index has not changed
            index += this.dragEndBoostSelect();
        }
        delete this.previousDragX;
        // apply selection
        // TODO refactor this, selecting here feels weird
        // HACK, set flag so dragging stays in correct direction
        this.isDragSelect = this.options.wrapAround;
        this.select(index);
        delete this.isDragSelect;
        this.dispatchEvent("dragEnd", event, [ pointer ]);
    };
    proto.dragEndRestingSelect = function() {
        var restingX = this.getRestingPosition();
        // how far away from selected slide
        var distance = Math.abs(this.getSlideDistance(-restingX, this.selectedIndex));
        // get closet resting going up and going down
        var positiveResting = this._getClosestResting(restingX, distance, 1);
        var negativeResting = this._getClosestResting(restingX, distance, -1);
        // use closer resting for wrap-around
        var index = positiveResting.distance < negativeResting.distance ? positiveResting.index : negativeResting.index;
        return index;
    };
    /**
 * given resting X and distance to selected cell
 * get the distance and index of the closest cell
 * @param {Number} restingX - estimated post-flick resting position
 * @param {Number} distance - distance to selected cell
 * @param {Integer} increment - +1 or -1, going up or down
 * @returns {Object} - { distance: {Number}, index: {Integer} }
 */
    proto._getClosestResting = function(restingX, distance, increment) {
        var index = this.selectedIndex;
        var minDistance = Infinity;
        var condition = this.options.contain && !this.options.wrapAround ? // if contain, keep going if distance is equal to minDistance
        function(d, md) {
            return d <= md;
        } : function(d, md) {
            return d < md;
        };
        while (condition(distance, minDistance)) {
            // measure distance to next cell
            index += increment;
            minDistance = distance;
            distance = this.getSlideDistance(-restingX, index);
            if (distance === null) {
                break;
            }
            distance = Math.abs(distance);
        }
        return {
            distance: minDistance,
            // selected was previous index
            index: index - increment
        };
    };
    /**
 * measure distance between x and a slide target
 * @param {Number} x
 * @param {Integer} index - slide index
 */
    proto.getSlideDistance = function(x, index) {
        var len = this.slides.length;
        // wrap around if at least 2 slides
        var isWrapAround = this.options.wrapAround && len > 1;
        var slideIndex = isWrapAround ? utils.modulo(index, len) : index;
        var slide = this.slides[slideIndex];
        if (!slide) {
            return null;
        }
        // add distance for wrap-around slides
        var wrap = isWrapAround ? this.slideableWidth * Math.floor(index / len) : 0;
        return x - (slide.target + wrap);
    };
    proto.dragEndBoostSelect = function() {
        // do not boost if no previousDragX or dragMoveTime
        if (this.previousDragX === undefined || !this.dragMoveTime || // or if drag was held for 100 ms
        new Date() - this.dragMoveTime > 100) {
            return 0;
        }
        var distance = this.getSlideDistance(-this.dragX, this.selectedIndex);
        var delta = this.previousDragX - this.dragX;
        if (distance > 0 && delta > 0) {
            // boost to next if moving towards the right, and positive velocity
            return 1;
        } else if (distance < 0 && delta < 0) {
            // boost to previous if moving towards the left, and negative velocity
            return -1;
        }
        return 0;
    };
    // ----- staticClick ----- //
    proto.staticClick = function(event, pointer) {
        // get clickedCell, if cell was clicked
        var clickedCell = this.getParentCell(event.target);
        var cellElem = clickedCell && clickedCell.element;
        var cellIndex = clickedCell && this.cells.indexOf(clickedCell);
        this.dispatchEvent("staticClick", event, [ pointer, cellElem, cellIndex ]);
    };
    // ----- scroll ----- //
    proto.onscroll = function() {
        var scroll = getScrollPosition();
        var scrollMoveX = this.pointerDownScroll.x - scroll.x;
        var scrollMoveY = this.pointerDownScroll.y - scroll.y;
        // cancel click/tap if scroll is too much
        if (Math.abs(scrollMoveX) > 3 || Math.abs(scrollMoveY) > 3) {
            this._pointerDone();
        }
    };
    // ----- utils ----- //
    function getScrollPosition() {
        return {
            x: window.pageXOffset,
            y: window.pageYOffset
        };
    }
    // -----  ----- //
    return Flickity;
});

/*!
 * Tap listener v2.0.0
 * listens to taps
 * MIT license
 */
/*jshint browser: true, unused: true, undef: true, strict: true */
(function(window, factory) {
    // universal module definition
    /*jshint strict: false*/
    /*globals define, module, require */
    if (typeof define == "function" && define.amd) {
        // AMD
        define("tap-listener/tap-listener", [ "unipointer/unipointer" ], function(Unipointer) {
            return factory(window, Unipointer);
        });
    } else if (typeof module == "object" && module.exports) {
        // CommonJS
        module.exports = factory(window, require("unipointer"));
    } else {
        // browser global
        window.TapListener = factory(window, window.Unipointer);
    }
})(window, function factory(window, Unipointer) {
    // --------------------------  TapListener -------------------------- //
    function TapListener(elem) {
        this.bindTap(elem);
    }
    // inherit Unipointer & EventEmitter
    var proto = TapListener.prototype = Object.create(Unipointer.prototype);
    /**
 * bind tap event to element
 * @param {Element} elem
 */
    proto.bindTap = function(elem) {
        if (!elem) {
            return;
        }
        this.unbindTap();
        this.tapElement = elem;
        this._bindStartEvent(elem, true);
    };
    proto.unbindTap = function() {
        if (!this.tapElement) {
            return;
        }
        this._bindStartEvent(this.tapElement, true);
        delete this.tapElement;
    };
    /**
 * pointer up
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
    proto.pointerUp = function(event, pointer) {
        // ignore emulated mouse up clicks
        if (this.isIgnoringMouseUp && event.type == "mouseup") {
            return;
        }
        var pointerPoint = Unipointer.getPointerPoint(pointer);
        var boundingRect = this.tapElement.getBoundingClientRect();
        var scrollX = window.pageXOffset;
        var scrollY = window.pageYOffset;
        // calculate if pointer is inside tapElement
        var isInside = pointerPoint.x >= boundingRect.left + scrollX && pointerPoint.x <= boundingRect.right + scrollX && pointerPoint.y >= boundingRect.top + scrollY && pointerPoint.y <= boundingRect.bottom + scrollY;
        // trigger callback if pointer is inside element
        if (isInside) {
            this.emitEvent("tap", [ event, pointer ]);
        }
        // set flag for emulated clicks 300ms after touchend
        if (event.type != "mouseup") {
            this.isIgnoringMouseUp = true;
            // reset flag after 300ms
            var _this = this;
            setTimeout(function() {
                delete _this.isIgnoringMouseUp;
            }, 400);
        }
    };
    proto.destroy = function() {
        this.pointerDone();
        this.unbindTap();
    };
    // -----  ----- //
    return TapListener;
});

// prev/next buttons
(function(window, factory) {
    // universal module definition
    /* jshint strict: false */
    if (typeof define == "function" && define.amd) {
        // AMD
        define("flickity/js/prev-next-button", [ "./flickity", "tap-listener/tap-listener", "fizzy-ui-utils/utils" ], function(Flickity, TapListener, utils) {
            return factory(window, Flickity, TapListener, utils);
        });
    } else if (typeof module == "object" && module.exports) {
        // CommonJS
        module.exports = factory(window, require("./flickity"), require("tap-listener"), require("fizzy-ui-utils"));
    } else {
        // browser global
        factory(window, window.Flickity, window.TapListener, window.fizzyUIUtils);
    }
})(window, function factory(window, Flickity, TapListener, utils) {
    "use strict";
    var svgURI = "http://www.w3.org/2000/svg";
    // -------------------------- PrevNextButton -------------------------- //
    function PrevNextButton(direction, parent) {
        this.direction = direction;
        this.parent = parent;
        this._create();
    }
    PrevNextButton.prototype = new TapListener();
    PrevNextButton.prototype._create = function() {
        // properties
        this.isEnabled = true;
        this.isPrevious = this.direction == -1;
        var leftDirection = this.parent.options.rightToLeft ? 1 : -1;
        this.isLeft = this.direction == leftDirection;
        var element = this.element = document.createElement("button");
        element.className = "flickity-prev-next-button";
        element.className += this.isPrevious ? " previous" : " next";
        // prevent button from submitting form http://stackoverflow.com/a/10836076/182183
        element.setAttribute("type", "button");
        // init as disabled
        this.disable();
        element.setAttribute("aria-label", this.isPrevious ? "previous" : "next");
        // create arrow
        var svg = this.createSVG();
        element.appendChild(svg);
        // events
        this.on("tap", this.onTap);
        this.parent.on("select", this.update.bind(this));
        this.on("pointerDown", this.parent.childUIPointerDown.bind(this.parent));
    };
    PrevNextButton.prototype.activate = function() {
        this.bindTap(this.element);
        // click events from keyboard
        this.element.addEventListener("click", this);
        // add to DOM
        this.parent.element.appendChild(this.element);
    };
    PrevNextButton.prototype.deactivate = function() {
        // remove from DOM
        this.parent.element.removeChild(this.element);
        // do regular TapListener destroy
        TapListener.prototype.destroy.call(this);
        // click events from keyboard
        this.element.removeEventListener("click", this);
    };
    PrevNextButton.prototype.createSVG = function() {
        var svg = document.createElementNS(svgURI, "svg");
        svg.setAttribute("viewBox", "0 0 100 100");
        var path = document.createElementNS(svgURI, "path");
        var pathMovements = getArrowMovements(this.parent.options.arrowShape);
        path.setAttribute("d", pathMovements);
        path.setAttribute("class", "arrow");
        // rotate arrow
        if (!this.isLeft) {
            path.setAttribute("transform", "translate(100, 100) rotate(180) ");
        }
        svg.appendChild(path);
        return svg;
    };
    // get SVG path movmement
    function getArrowMovements(shape) {
        // use shape as movement if string
        if (typeof shape == "string") {
            return shape;
        }
        // create movement string
        return "M " + shape.x0 + ",50" + " L " + shape.x1 + "," + (shape.y1 + 50) + " L " + shape.x2 + "," + (shape.y2 + 50) + " L " + shape.x3 + ",50 " + " L " + shape.x2 + "," + (50 - shape.y2) + " L " + shape.x1 + "," + (50 - shape.y1) + " Z";
    }
    PrevNextButton.prototype.onTap = function() {
        if (!this.isEnabled) {
            return;
        }
        this.parent.uiChange();
        var method = this.isPrevious ? "previous" : "next";
        this.parent[method]();
    };
    PrevNextButton.prototype.handleEvent = utils.handleEvent;
    PrevNextButton.prototype.onclick = function() {
        // only allow clicks from keyboard
        var focused = document.activeElement;
        if (focused && focused == this.element) {
            this.onTap();
        }
    };
    // -----  ----- //
    PrevNextButton.prototype.enable = function() {
        if (this.isEnabled) {
            return;
        }
        this.element.disabled = false;
        this.isEnabled = true;
    };
    PrevNextButton.prototype.disable = function() {
        if (!this.isEnabled) {
            return;
        }
        this.element.disabled = true;
        this.isEnabled = false;
    };
    PrevNextButton.prototype.update = function() {
        // index of first or last slide, if previous or next
        var slides = this.parent.slides;
        // enable is wrapAround and at least 2 slides
        if (this.parent.options.wrapAround && slides.length > 1) {
            this.enable();
            return;
        }
        var lastIndex = slides.length ? slides.length - 1 : 0;
        var boundIndex = this.isPrevious ? 0 : lastIndex;
        var method = this.parent.selectedIndex == boundIndex ? "disable" : "enable";
        this[method]();
    };
    PrevNextButton.prototype.destroy = function() {
        this.deactivate();
    };
    // -------------------------- Flickity prototype -------------------------- //
    utils.extend(Flickity.defaults, {
        prevNextButtons: true,
        arrowShape: {
            x0: 10,
            x1: 60,
            y1: 50,
            x2: 70,
            y2: 40,
            x3: 30
        }
    });
    Flickity.createMethods.push("_createPrevNextButtons");
    var proto = Flickity.prototype;
    proto._createPrevNextButtons = function() {
        if (!this.options.prevNextButtons) {
            return;
        }
        this.prevButton = new PrevNextButton((-1), this);
        this.nextButton = new PrevNextButton(1, this);
        this.on("activate", this.activatePrevNextButtons);
    };
    proto.activatePrevNextButtons = function() {
        this.prevButton.activate();
        this.nextButton.activate();
        this.on("deactivate", this.deactivatePrevNextButtons);
    };
    proto.deactivatePrevNextButtons = function() {
        this.prevButton.deactivate();
        this.nextButton.deactivate();
        this.off("deactivate", this.deactivatePrevNextButtons);
    };
    // --------------------------  -------------------------- //
    Flickity.PrevNextButton = PrevNextButton;
    return Flickity;
});

// page dots
(function(window, factory) {
    // universal module definition
    /* jshint strict: false */
    if (typeof define == "function" && define.amd) {
        // AMD
        define("flickity/js/page-dots", [ "./flickity", "tap-listener/tap-listener", "fizzy-ui-utils/utils" ], function(Flickity, TapListener, utils) {
            return factory(window, Flickity, TapListener, utils);
        });
    } else if (typeof module == "object" && module.exports) {
        // CommonJS
        module.exports = factory(window, require("./flickity"), require("tap-listener"), require("fizzy-ui-utils"));
    } else {
        // browser global
        factory(window, window.Flickity, window.TapListener, window.fizzyUIUtils);
    }
})(window, function factory(window, Flickity, TapListener, utils) {
    // -------------------------- PageDots -------------------------- //
    function PageDots(parent) {
        this.parent = parent;
        this._create();
    }
    PageDots.prototype = new TapListener();
    PageDots.prototype._create = function() {
        // create holder element
        this.holder = document.createElement("ol");
        this.holder.className = "flickity-page-dots";
        // create dots, array of elements
        this.dots = [];
        // events
        this.on("tap", this.onTap);
        this.on("pointerDown", this.parent.childUIPointerDown.bind(this.parent));
    };
    PageDots.prototype.activate = function() {
        this.setDots();
        this.bindTap(this.holder);
        // add to DOM
        this.parent.element.appendChild(this.holder);
    };
    PageDots.prototype.deactivate = function() {
        // remove from DOM
        this.parent.element.removeChild(this.holder);
        TapListener.prototype.destroy.call(this);
    };
    PageDots.prototype.setDots = function() {
        // get difference between number of slides and number of dots
        var delta = this.parent.slides.length - this.dots.length;
        if (delta > 0) {
            this.addDots(delta);
        } else if (delta < 0) {
            this.removeDots(-delta);
        }
    };
    PageDots.prototype.addDots = function(count) {
        var fragment = document.createDocumentFragment();
        var newDots = [];
        while (count) {
            var dot = document.createElement("li");
            dot.className = "dot";
            fragment.appendChild(dot);
            newDots.push(dot);
            count--;
        }
        this.holder.appendChild(fragment);
        this.dots = this.dots.concat(newDots);
    };
    PageDots.prototype.removeDots = function(count) {
        // remove from this.dots collection
        var removeDots = this.dots.splice(this.dots.length - count, count);
        // remove from DOM
        removeDots.forEach(function(dot) {
            this.holder.removeChild(dot);
        }, this);
    };
    PageDots.prototype.updateSelected = function() {
        // remove selected class on previous
        if (this.selectedDot) {
            this.selectedDot.className = "dot";
        }
        // don't proceed if no dots
        if (!this.dots.length) {
            return;
        }
        this.selectedDot = this.dots[this.parent.selectedIndex];
        this.selectedDot.className = "dot is-selected";
    };
    PageDots.prototype.onTap = function(event) {
        var target = event.target;
        // only care about dot clicks
        if (target.nodeName != "LI") {
            return;
        }
        this.parent.uiChange();
        var index = this.dots.indexOf(target);
        this.parent.select(index);
    };
    PageDots.prototype.destroy = function() {
        this.deactivate();
    };
    Flickity.PageDots = PageDots;
    // -------------------------- Flickity -------------------------- //
    utils.extend(Flickity.defaults, {
        pageDots: true
    });
    Flickity.createMethods.push("_createPageDots");
    var proto = Flickity.prototype;
    proto._createPageDots = function() {
        if (!this.options.pageDots) {
            return;
        }
        this.pageDots = new PageDots(this);
        // events
        this.on("activate", this.activatePageDots);
        this.on("select", this.updateSelectedPageDots);
        this.on("cellChange", this.updatePageDots);
        this.on("resize", this.updatePageDots);
        this.on("deactivate", this.deactivatePageDots);
    };
    proto.activatePageDots = function() {
        this.pageDots.activate();
    };
    proto.updateSelectedPageDots = function() {
        this.pageDots.updateSelected();
    };
    proto.updatePageDots = function() {
        this.pageDots.setDots();
    };
    proto.deactivatePageDots = function() {
        this.pageDots.deactivate();
    };
    // -----  ----- //
    Flickity.PageDots = PageDots;
    return Flickity;
});

// player & autoPlay
(function(window, factory) {
    // universal module definition
    /* jshint strict: false */
    if (typeof define == "function" && define.amd) {
        // AMD
        define("flickity/js/player", [ "ev-emitter/ev-emitter", "fizzy-ui-utils/utils", "./flickity" ], function(EvEmitter, utils, Flickity) {
            return factory(EvEmitter, utils, Flickity);
        });
    } else if (typeof module == "object" && module.exports) {
        // CommonJS
        module.exports = factory(require("ev-emitter"), require("fizzy-ui-utils"), require("./flickity"));
    } else {
        // browser global
        factory(window.EvEmitter, window.fizzyUIUtils, window.Flickity);
    }
})(window, function factory(EvEmitter, utils, Flickity) {
    // -------------------------- Page Visibility -------------------------- //
    // https://developer.mozilla.org/en-US/docs/Web/Guide/User_experience/Using_the_Page_Visibility_API
    var hiddenProperty, visibilityEvent;
    if ("hidden" in document) {
        hiddenProperty = "hidden";
        visibilityEvent = "visibilitychange";
    } else if ("webkitHidden" in document) {
        hiddenProperty = "webkitHidden";
        visibilityEvent = "webkitvisibilitychange";
    }
    // -------------------------- Player -------------------------- //
    function Player(parent) {
        this.parent = parent;
        this.state = "stopped";
        // visibility change event handler
        if (visibilityEvent) {
            this.onVisibilityChange = function() {
                this.visibilityChange();
            }.bind(this);
            this.onVisibilityPlay = function() {
                this.visibilityPlay();
            }.bind(this);
        }
    }
    Player.prototype = Object.create(EvEmitter.prototype);
    // start play
    Player.prototype.play = function() {
        if (this.state == "playing") {
            return;
        }
        // do not play if page is hidden, start playing when page is visible
        var isPageHidden = document[hiddenProperty];
        if (visibilityEvent && isPageHidden) {
            document.addEventListener(visibilityEvent, this.onVisibilityPlay);
            return;
        }
        this.state = "playing";
        // listen to visibility change
        if (visibilityEvent) {
            document.addEventListener(visibilityEvent, this.onVisibilityChange);
        }
        // start ticking
        this.tick();
    };
    Player.prototype.tick = function() {
        // do not tick if not playing
        if (this.state != "playing") {
            return;
        }
        var time = this.parent.options.autoPlay;
        // default to 3 seconds
        time = typeof time == "number" ? time : 3e3;
        var _this = this;
        // HACK: reset ticks if stopped and started within interval
        this.clear();
        this.timeout = setTimeout(function() {
            _this.parent.next(true);
            _this.tick();
        }, time);
    };
    Player.prototype.stop = function() {
        this.state = "stopped";
        this.clear();
        // remove visibility change event
        if (visibilityEvent) {
            document.removeEventListener(visibilityEvent, this.onVisibilityChange);
        }
    };
    Player.prototype.clear = function() {
        clearTimeout(this.timeout);
    };
    Player.prototype.pause = function() {
        if (this.state == "playing") {
            this.state = "paused";
            this.clear();
        }
    };
    Player.prototype.unpause = function() {
        // re-start play if paused
        if (this.state == "paused") {
            this.play();
        }
    };
    // pause if page visibility is hidden, unpause if visible
    Player.prototype.visibilityChange = function() {
        var isPageHidden = document[hiddenProperty];
        this[isPageHidden ? "pause" : "unpause"]();
    };
    Player.prototype.visibilityPlay = function() {
        this.play();
        document.removeEventListener(visibilityEvent, this.onVisibilityPlay);
    };
    // -------------------------- Flickity -------------------------- //
    utils.extend(Flickity.defaults, {
        pauseAutoPlayOnHover: true
    });
    Flickity.createMethods.push("_createPlayer");
    var proto = Flickity.prototype;
    proto._createPlayer = function() {
        this.player = new Player(this);
        this.on("activate", this.activatePlayer);
        this.on("uiChange", this.stopPlayer);
        this.on("pointerDown", this.stopPlayer);
        this.on("deactivate", this.deactivatePlayer);
    };
    proto.activatePlayer = function() {
        if (!this.options.autoPlay) {
            return;
        }
        this.player.play();
        this.element.addEventListener("mouseenter", this);
    };
    // Player API, don't hate the ... thanks I know where the door is
    proto.playPlayer = function() {
        this.player.play();
    };
    proto.stopPlayer = function() {
        this.player.stop();
    };
    proto.pausePlayer = function() {
        this.player.pause();
    };
    proto.unpausePlayer = function() {
        this.player.unpause();
    };
    proto.deactivatePlayer = function() {
        this.player.stop();
        this.element.removeEventListener("mouseenter", this);
    };
    // ----- mouseenter/leave ----- //
    // pause auto-play on hover
    proto.onmouseenter = function() {
        if (!this.options.pauseAutoPlayOnHover) {
            return;
        }
        this.player.pause();
        this.element.addEventListener("mouseleave", this);
    };
    // resume auto-play on hover off
    proto.onmouseleave = function() {
        this.player.unpause();
        this.element.removeEventListener("mouseleave", this);
    };
    // -----  ----- //
    Flickity.Player = Player;
    return Flickity;
});

// add, remove cell
(function(window, factory) {
    // universal module definition
    /* jshint strict: false */
    if (typeof define == "function" && define.amd) {
        // AMD
        define("flickity/js/add-remove-cell", [ "./flickity", "fizzy-ui-utils/utils" ], function(Flickity, utils) {
            return factory(window, Flickity, utils);
        });
    } else if (typeof module == "object" && module.exports) {
        // CommonJS
        module.exports = factory(window, require("./flickity"), require("fizzy-ui-utils"));
    } else {
        // browser global
        factory(window, window.Flickity, window.fizzyUIUtils);
    }
})(window, function factory(window, Flickity, utils) {
    // append cells to a document fragment
    function getCellsFragment(cells) {
        var fragment = document.createDocumentFragment();
        cells.forEach(function(cell) {
            fragment.appendChild(cell.element);
        });
        return fragment;
    }
    // -------------------------- add/remove cell prototype -------------------------- //
    var proto = Flickity.prototype;
    /**
 * Insert, prepend, or append cells
 * @param {Element, Array, NodeList} elems
 * @param {Integer} index
 */
    proto.insert = function(elems, index) {
        var cells = this._makeCells(elems);
        if (!cells || !cells.length) {
            return;
        }
        var len = this.cells.length;
        // default to append
        index = index === undefined ? len : index;
        // add cells with document fragment
        var fragment = getCellsFragment(cells);
        // append to slider
        var isAppend = index == len;
        if (isAppend) {
            this.slider.appendChild(fragment);
        } else {
            var insertCellElement = this.cells[index].element;
            this.slider.insertBefore(fragment, insertCellElement);
        }
        // add to this.cells
        if (index === 0) {
            // prepend, add to start
            this.cells = cells.concat(this.cells);
        } else if (isAppend) {
            // append, add to end
            this.cells = this.cells.concat(cells);
        } else {
            // insert in this.cells
            var endCells = this.cells.splice(index, len - index);
            this.cells = this.cells.concat(cells).concat(endCells);
        }
        this._sizeCells(cells);
        var selectedIndexDelta = index > this.selectedIndex ? 0 : cells.length;
        this._cellAddedRemoved(index, selectedIndexDelta);
    };
    proto.append = function(elems) {
        this.insert(elems, this.cells.length);
    };
    proto.prepend = function(elems) {
        this.insert(elems, 0);
    };
    /**
 * Remove cells
 * @param {Element, Array, NodeList} elems
 */
    proto.remove = function(elems) {
        var cells = this.getCells(elems);
        var selectedIndexDelta = 0;
        var len = cells.length;
        var i, cell;
        // calculate selectedIndexDelta, easier if done in seperate loop
        for (i = 0; i < len; i++) {
            cell = cells[i];
            var wasBefore = this.cells.indexOf(cell) < this.selectedIndex;
            selectedIndexDelta -= wasBefore ? 1 : 0;
        }
        for (i = 0; i < len; i++) {
            cell = cells[i];
            cell.remove();
            // remove item from collection
            utils.removeFrom(this.cells, cell);
        }
        if (cells.length) {
            // update stuff
            this._cellAddedRemoved(0, selectedIndexDelta);
        }
    };
    // updates when cells are added or removed
    proto._cellAddedRemoved = function(changedCellIndex, selectedIndexDelta) {
        // TODO this math isn't perfect with grouped slides
        selectedIndexDelta = selectedIndexDelta || 0;
        this.selectedIndex += selectedIndexDelta;
        this.selectedIndex = Math.max(0, Math.min(this.slides.length - 1, this.selectedIndex));
        this.cellChange(changedCellIndex, true);
        // backwards compatibility
        this.emitEvent("cellAddedRemoved", [ changedCellIndex, selectedIndexDelta ]);
    };
    /**
 * logic to be run after a cell's size changes
 * @param {Element} elem - cell's element
 */
    proto.cellSizeChange = function(elem) {
        var cell = this.getCell(elem);
        if (!cell) {
            return;
        }
        cell.getSize();
        var index = this.cells.indexOf(cell);
        this.cellChange(index);
    };
    /**
 * logic any time a cell is changed: added, removed, or size changed
 * @param {Integer} changedCellIndex - index of the changed cell, optional
 */
    proto.cellChange = function(changedCellIndex, isPositioningSlider) {
        var prevSlideableWidth = this.slideableWidth;
        this._positionCells(changedCellIndex);
        this._getWrapShiftCells();
        this.setGallerySize();
        this.emitEvent("cellChange", [ changedCellIndex ]);
        // position slider
        if (this.options.freeScroll) {
            // shift x by change in slideableWidth
            // TODO fix position shifts when prepending w/ freeScroll
            var deltaX = prevSlideableWidth - this.slideableWidth;
            this.x += deltaX * this.cellAlign;
            this.positionSlider();
        } else {
            // do not position slider after lazy load
            if (isPositioningSlider) {
                this.positionSliderAtSelected();
            }
            this.select(this.selectedIndex);
        }
    };
    // -----  ----- //
    return Flickity;
});

// lazyload
(function(window, factory) {
    // universal module definition
    /* jshint strict: false */
    if (typeof define == "function" && define.amd) {
        // AMD
        define("flickity/js/lazyload", [ "./flickity", "fizzy-ui-utils/utils" ], function(Flickity, utils) {
            return factory(window, Flickity, utils);
        });
    } else if (typeof module == "object" && module.exports) {
        // CommonJS
        module.exports = factory(window, require("./flickity"), require("fizzy-ui-utils"));
    } else {
        // browser global
        factory(window, window.Flickity, window.fizzyUIUtils);
    }
})(window, function factory(window, Flickity, utils) {
    "use strict";
    Flickity.createMethods.push("_createLazyload");
    var proto = Flickity.prototype;
    proto._createLazyload = function() {
        this.on("select", this.lazyLoad);
    };
    proto.lazyLoad = function() {
        var lazyLoad = this.options.lazyLoad;
        if (!lazyLoad) {
            return;
        }
        // get adjacent cells, use lazyLoad option for adjacent count
        var adjCount = typeof lazyLoad == "number" ? lazyLoad : 0;
        var cellElems = this.getAdjacentCellElements(adjCount);
        // get lazy images in those cells
        var lazyImages = [];
        cellElems.forEach(function(cellElem) {
            var lazyCellImages = getCellLazyImages(cellElem);
            lazyImages = lazyImages.concat(lazyCellImages);
        });
        // load lazy images
        lazyImages.forEach(function(img) {
            new LazyLoader(img, this);
        }, this);
    };
    function getCellLazyImages(cellElem) {
        // check if cell element is lazy image
        if (cellElem.nodeName == "IMG" && cellElem.getAttribute("data-flickity-lazyload")) {
            return [ cellElem ];
        }
        // select lazy images in cell
        var imgs = cellElem.querySelectorAll("img[data-flickity-lazyload]");
        return utils.makeArray(imgs);
    }
    // -------------------------- LazyLoader -------------------------- //
    /**
 * class to handle loading images
 */
    function LazyLoader(img, flickity) {
        this.img = img;
        this.flickity = flickity;
        this.load();
    }
    LazyLoader.prototype.handleEvent = utils.handleEvent;
    LazyLoader.prototype.load = function() {
        this.img.addEventListener("load", this);
        this.img.addEventListener("error", this);
        // load image
        this.img.src = this.img.getAttribute("data-flickity-lazyload");
        // remove attr
        this.img.removeAttribute("data-flickity-lazyload");
    };
    LazyLoader.prototype.onload = function(event) {
        this.complete(event, "flickity-lazyloaded");
    };
    LazyLoader.prototype.onerror = function(event) {
        this.complete(event, "flickity-lazyerror");
    };
    LazyLoader.prototype.complete = function(event, className) {
        // unbind events
        this.img.removeEventListener("load", this);
        this.img.removeEventListener("error", this);
        var cell = this.flickity.getParentCell(this.img);
        var cellElem = cell && cell.element;
        this.flickity.cellSizeChange(cellElem);
        this.img.classList.add(className);
        this.flickity.dispatchEvent("lazyLoad", event, cellElem);
    };
    // -----  ----- //
    Flickity.LazyLoader = LazyLoader;
    return Flickity;
});

/*!
 * Flickity v2.0.4
 * Touch, responsive, flickable carousels
 *
 * Licensed GPLv3 for open source use
 * or Flickity Commercial License for commercial use
 *
 * http://flickity.metafizzy.co
 * Copyright 2016 Metafizzy
 */
(function(window, factory) {
    // universal module definition
    /* jshint strict: false */
    if (typeof define == "function" && define.amd) {
        // AMD
        define("flickity/js/index", [ "./flickity", "./drag", "./prev-next-button", "./page-dots", "./player", "./add-remove-cell", "./lazyload" ], factory);
    } else if (typeof module == "object" && module.exports) {
        // CommonJS
        module.exports = factory(require("./flickity"), require("./drag"), require("./prev-next-button"), require("./page-dots"), require("./player"), require("./add-remove-cell"), require("./lazyload"));
    }
})(window, function factory(Flickity) {
    /*jshint strict: false*/
    return Flickity;
});

/*!
 * Flickity asNavFor v2.0.1
 * enable asNavFor for Flickity
 */
/*jshint browser: true, undef: true, unused: true, strict: true*/
(function(window, factory) {
    // universal module definition
    /*jshint strict: false */
    /*globals define, module, require */
    if (typeof define == "function" && define.amd) {
        // AMD
        define("flickity-as-nav-for/as-nav-for", [ "flickity/js/index", "fizzy-ui-utils/utils" ], factory);
    } else if (typeof module == "object" && module.exports) {
        // CommonJS
        module.exports = factory(require("flickity"), require("fizzy-ui-utils"));
    } else {
        // browser global
        window.Flickity = factory(window.Flickity, window.fizzyUIUtils);
    }
})(window, function factory(Flickity, utils) {
    // -------------------------- asNavFor prototype -------------------------- //
    // Flickity.defaults.asNavFor = null;
    Flickity.createMethods.push("_createAsNavFor");
    var proto = Flickity.prototype;
    proto._createAsNavFor = function() {
        this.on("activate", this.activateAsNavFor);
        this.on("deactivate", this.deactivateAsNavFor);
        this.on("destroy", this.destroyAsNavFor);
        var asNavForOption = this.options.asNavFor;
        if (!asNavForOption) {
            return;
        }
        // HACK do async, give time for other flickity to be initalized
        var _this = this;
        setTimeout(function initNavCompanion() {
            _this.setNavCompanion(asNavForOption);
        });
    };
    proto.setNavCompanion = function(elem) {
        elem = utils.getQueryElement(elem);
        var companion = Flickity.data(elem);
        // stop if no companion or companion is self
        if (!companion || companion == this) {
            return;
        }
        this.navCompanion = companion;
        // companion select
        var _this = this;
        this.onNavCompanionSelect = function() {
            _this.navCompanionSelect();
        };
        companion.on("select", this.onNavCompanionSelect);
        // click
        this.on("staticClick", this.onNavStaticClick);
        this.navCompanionSelect(true);
    };
    proto.navCompanionSelect = function(isInstant) {
        if (!this.navCompanion) {
            return;
        }
        // select slide that matches first cell of slide
        var selectedCell = this.navCompanion.selectedCells[0];
        var firstIndex = this.navCompanion.cells.indexOf(selectedCell);
        var lastIndex = firstIndex + this.navCompanion.selectedCells.length - 1;
        var selectIndex = Math.floor(lerp(firstIndex, lastIndex, this.navCompanion.cellAlign));
        this.selectCell(selectIndex, false, isInstant);
        // set nav selected class
        this.removeNavSelectedElements();
        // stop if companion has more cells than this one
        if (selectIndex >= this.cells.length) {
            return;
        }
        var selectedCells = this.cells.slice(firstIndex, lastIndex + 1);
        this.navSelectedElements = selectedCells.map(function(cell) {
            return cell.element;
        });
        this.changeNavSelectedClass("add");
    };
    function lerp(a, b, t) {
        return (b - a) * t + a;
    }
    proto.changeNavSelectedClass = function(method) {
        this.navSelectedElements.forEach(function(navElem) {
            navElem.classList[method]("is-nav-selected");
        });
    };
    proto.activateAsNavFor = function() {
        this.navCompanionSelect(true);
    };
    proto.removeNavSelectedElements = function() {
        if (!this.navSelectedElements) {
            return;
        }
        this.changeNavSelectedClass("remove");
        delete this.navSelectedElements;
    };
    proto.onNavStaticClick = function(event, pointer, cellElement, cellIndex) {
        if (typeof cellIndex == "number") {
            this.navCompanion.selectCell(cellIndex);
        }
    };
    proto.deactivateAsNavFor = function() {
        this.removeNavSelectedElements();
    };
    proto.destroyAsNavFor = function() {
        if (!this.navCompanion) {
            return;
        }
        this.navCompanion.off("select", this.onNavCompanionSelect);
        this.off("staticClick", this.onNavStaticClick);
        delete this.navCompanion;
    };
    // -----  ----- //
    return Flickity;
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
        define("imagesloaded/imagesloaded", [ "ev-emitter/ev-emitter" ], function(EvEmitter) {
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
 * Flickity imagesLoaded v2.0.0
 * enables imagesLoaded option for Flickity
 */
/*jshint browser: true, strict: true, undef: true, unused: true */
(function(window, factory) {
    // universal module definition
    /*jshint strict: false */
    /*globals define, module, require */
    if (typeof define == "function" && define.amd) {
        // AMD
        define([ "flickity/js/index", "imagesloaded/imagesloaded" ], function(Flickity, imagesLoaded) {
            return factory(window, Flickity, imagesLoaded);
        });
    } else if (typeof module == "object" && module.exports) {
        // CommonJS
        module.exports = factory(window, require("flickity"), require("imagesloaded"));
    } else {
        // browser global
        window.Flickity = factory(window, window.Flickity, window.imagesLoaded);
    }
})(window, function factory(window, Flickity, imagesLoaded) {
    "use strict";
    Flickity.createMethods.push("_createImagesLoaded");
    var proto = Flickity.prototype;
    proto._createImagesLoaded = function() {
        this.on("activate", this.imagesLoaded);
    };
    proto.imagesLoaded = function() {
        if (!this.options.imagesLoaded) {
            return;
        }
        var _this = this;
        function onImagesLoadedProgress(instance, image) {
            var cell = _this.getParentCell(image.img);
            _this.cellSizeChange(cell && cell.element);
            if (!_this.options.freeScroll) {
                _this.positionSliderAtSelected();
            }
        }
        imagesLoaded(this.slider).on("progress", onImagesLoadedProgress);
    };
    return Flickity;
});
/*!
 * Packery PACKAGED v2.1.1
 * Gapless, draggable grid layouts
 *
 * Licensed GPLv3 for open source use
 * or Packery Commercial License for commercial use
 *
 * http://packery.metafizzy.co
 * Copyright 2016 Metafizzy
 */
/**
 * Bridget makes jQuery widgets
 * v2.0.0
 * MIT license
 */
/* jshint browser: true, strict: true, undef: true, unused: true */
(function(window, factory) {
    "use strict";
    /* globals define: false, module: false, require: false */
    if (typeof define == "function" && define.amd) {
        // AMD
        define("jquery-bridget/jquery-bridget", [ "jquery" ], function(jQuery) {
            factory(window, jQuery);
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
 * EvEmitter v1.0.2
 * Lil' event emitter
 * MIT License
 */
/* jshint unused: true, undef: true, strict: true */
(function(global, factory) {
    // universal module definition
    /* jshint strict: false */
    /* globals define, module */
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
})(this, function() {
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
 * Fizzy UI utils v2.0.1
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
        if (document.readyState == "complete") {
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

/**
 * Rect
 * low-level utility class for basic geometry
 */
(function(window, factory) {
    // universal module definition
    /* jshint strict: false */
    /* globals define, module */
    if (typeof define == "function" && define.amd) {
        // AMD
        define("packery/js/rect", factory);
    } else if (typeof module == "object" && module.exports) {
        // CommonJS
        module.exports = factory();
    } else {
        // browser global
        window.Packery = window.Packery || {};
        window.Packery.Rect = factory();
    }
})(window, function factory() {
    "use strict";
    // -------------------------- Rect -------------------------- //
    function Rect(props) {
        // extend properties from defaults
        for (var prop in Rect.defaults) {
            this[prop] = Rect.defaults[prop];
        }
        for (prop in props) {
            this[prop] = props[prop];
        }
    }
    Rect.defaults = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };
    var proto = Rect.prototype;
    /**
 * Determines whether or not this rectangle wholly encloses another rectangle or point.
 * @param {Rect} rect
 * @returns {Boolean}
**/
    proto.contains = function(rect) {
        // points don't have width or height
        var otherWidth = rect.width || 0;
        var otherHeight = rect.height || 0;
        return this.x <= rect.x && this.y <= rect.y && this.x + this.width >= rect.x + otherWidth && this.y + this.height >= rect.y + otherHeight;
    };
    /**
 * Determines whether or not the rectangle intersects with another.
 * @param {Rect} rect
 * @returns {Boolean}
**/
    proto.overlaps = function(rect) {
        var thisRight = this.x + this.width;
        var thisBottom = this.y + this.height;
        var rectRight = rect.x + rect.width;
        var rectBottom = rect.y + rect.height;
        // http://stackoverflow.com/a/306332
        return this.x < rectRight && thisRight > rect.x && this.y < rectBottom && thisBottom > rect.y;
    };
    /**
 * @param {Rect} rect - the overlapping rect
 * @returns {Array} freeRects - rects representing the area around the rect
**/
    proto.getMaximalFreeRects = function(rect) {
        // if no intersection, return false
        if (!this.overlaps(rect)) {
            return false;
        }
        var freeRects = [];
        var freeRect;
        var thisRight = this.x + this.width;
        var thisBottom = this.y + this.height;
        var rectRight = rect.x + rect.width;
        var rectBottom = rect.y + rect.height;
        // top
        if (this.y < rect.y) {
            freeRect = new Rect({
                x: this.x,
                y: this.y,
                width: this.width,
                height: rect.y - this.y
            });
            freeRects.push(freeRect);
        }
        // right
        if (thisRight > rectRight) {
            freeRect = new Rect({
                x: rectRight,
                y: this.y,
                width: thisRight - rectRight,
                height: this.height
            });
            freeRects.push(freeRect);
        }
        // bottom
        if (thisBottom > rectBottom) {
            freeRect = new Rect({
                x: this.x,
                y: rectBottom,
                width: this.width,
                height: thisBottom - rectBottom
            });
            freeRects.push(freeRect);
        }
        // left
        if (this.x < rect.x) {
            freeRect = new Rect({
                x: this.x,
                y: this.y,
                width: rect.x - this.x,
                height: this.height
            });
            freeRects.push(freeRect);
        }
        return freeRects;
    };
    proto.canFit = function(rect) {
        return this.width >= rect.width && this.height >= rect.height;
    };
    return Rect;
});

/**
 * Packer
 * bin-packing algorithm
 */
(function(window, factory) {
    // universal module definition
    /* jshint strict: false */
    /* globals define, module, require */
    if (typeof define == "function" && define.amd) {
        // AMD
        define("packery/js/packer", [ "./rect" ], factory);
    } else if (typeof module == "object" && module.exports) {
        // CommonJS
        module.exports = factory(require("./rect"));
    } else {
        // browser global
        var Packery = window.Packery = window.Packery || {};
        Packery.Packer = factory(Packery.Rect);
    }
})(window, function factory(Rect) {
    "use strict";
    // -------------------------- Packer -------------------------- //
    /**
 * @param {Number} width
 * @param {Number} height
 * @param {String} sortDirection
 *   topLeft for vertical, leftTop for horizontal
 */
    function Packer(width, height, sortDirection) {
        this.width = width || 0;
        this.height = height || 0;
        this.sortDirection = sortDirection || "downwardLeftToRight";
        this.reset();
    }
    var proto = Packer.prototype;
    proto.reset = function() {
        this.spaces = [];
        var initialSpace = new Rect({
            x: 0,
            y: 0,
            width: this.width,
            height: this.height
        });
        this.spaces.push(initialSpace);
        // set sorter
        this.sorter = sorters[this.sortDirection] || sorters.downwardLeftToRight;
    };
    // change x and y of rect to fit with in Packer's available spaces
    proto.pack = function(rect) {
        for (var i = 0; i < this.spaces.length; i++) {
            var space = this.spaces[i];
            if (space.canFit(rect)) {
                this.placeInSpace(rect, space);
                break;
            }
        }
    };
    proto.columnPack = function(rect) {
        for (var i = 0; i < this.spaces.length; i++) {
            var space = this.spaces[i];
            var canFitInSpaceColumn = space.x <= rect.x && space.x + space.width >= rect.x + rect.width && space.height >= rect.height - .01;
            // fudge number for rounding error
            if (canFitInSpaceColumn) {
                rect.y = space.y;
                this.placed(rect);
                break;
            }
        }
    };
    proto.rowPack = function(rect) {
        for (var i = 0; i < this.spaces.length; i++) {
            var space = this.spaces[i];
            var canFitInSpaceRow = space.y <= rect.y && space.y + space.height >= rect.y + rect.height && space.width >= rect.width - .01;
            // fudge number for rounding error
            if (canFitInSpaceRow) {
                rect.x = space.x;
                this.placed(rect);
                break;
            }
        }
    };
    proto.placeInSpace = function(rect, space) {
        // place rect in space
        rect.x = space.x;
        rect.y = space.y;
        this.placed(rect);
    };
    // update spaces with placed rect
    proto.placed = function(rect) {
        // update spaces
        var revisedSpaces = [];
        for (var i = 0; i < this.spaces.length; i++) {
            var space = this.spaces[i];
            var newSpaces = space.getMaximalFreeRects(rect);
            // add either the original space or the new spaces to the revised spaces
            if (newSpaces) {
                revisedSpaces.push.apply(revisedSpaces, newSpaces);
            } else {
                revisedSpaces.push(space);
            }
        }
        this.spaces = revisedSpaces;
        this.mergeSortSpaces();
    };
    proto.mergeSortSpaces = function() {
        // remove redundant spaces
        Packer.mergeRects(this.spaces);
        this.spaces.sort(this.sorter);
    };
    // add a space back
    proto.addSpace = function(rect) {
        this.spaces.push(rect);
        this.mergeSortSpaces();
    };
    // -------------------------- utility functions -------------------------- //
    /**
 * Remove redundant rectangle from array of rectangles
 * @param {Array} rects: an array of Rects
 * @returns {Array} rects: an array of Rects
**/
    Packer.mergeRects = function(rects) {
        var i = 0;
        var rect = rects[i];
        rectLoop: while (rect) {
            var j = 0;
            var compareRect = rects[i + j];
            while (compareRect) {
                if (compareRect == rect) {
                    j++;
                } else if (compareRect.contains(rect)) {
                    // remove rect
                    rects.splice(i, 1);
                    rect = rects[i];
                    // set next rect
                    continue rectLoop;
                } else if (rect.contains(compareRect)) {
                    // remove compareRect
                    rects.splice(i + j, 1);
                } else {
                    j++;
                }
                compareRect = rects[i + j];
            }
            i++;
            rect = rects[i];
        }
        return rects;
    };
    // -------------------------- sorters -------------------------- //
    // functions for sorting rects in order
    var sorters = {
        // top down, then left to right
        downwardLeftToRight: function(a, b) {
            return a.y - b.y || a.x - b.x;
        },
        // left to right, then top down
        rightwardTopToBottom: function(a, b) {
            return a.x - b.x || a.y - b.y;
        }
    };
    // --------------------------  -------------------------- //
    return Packer;
});

/**
 * Packery Item Element
**/
(function(window, factory) {
    // universal module definition
    /* jshint strict: false */
    /* globals define, module, require */
    if (typeof define == "function" && define.amd) {
        // AMD
        define("packery/js/item", [ "outlayer/outlayer", "./rect" ], factory);
    } else if (typeof module == "object" && module.exports) {
        // CommonJS
        module.exports = factory(require("outlayer"), require("./rect"));
    } else {
        // browser global
        window.Packery.Item = factory(window.Outlayer, window.Packery.Rect);
    }
})(window, function factory(Outlayer, Rect) {
    "use strict";
    // -------------------------- Item -------------------------- //
    var docElemStyle = document.documentElement.style;
    var transformProperty = typeof docElemStyle.transform == "string" ? "transform" : "WebkitTransform";
    // sub-class Item
    var Item = function PackeryItem() {
        Outlayer.Item.apply(this, arguments);
    };
    var proto = Item.prototype = Object.create(Outlayer.Item.prototype);
    var __create = proto._create;
    proto._create = function() {
        // call default _create logic
        __create.call(this);
        this.rect = new Rect();
    };
    var _moveTo = proto.moveTo;
    proto.moveTo = function(x, y) {
        // don't shift 1px while dragging
        var dx = Math.abs(this.position.x - x);
        var dy = Math.abs(this.position.y - y);
        var canHackGoTo = this.layout.dragItemCount && !this.isPlacing && !this.isTransitioning && dx < 1 && dy < 1;
        if (canHackGoTo) {
            this.goTo(x, y);
            return;
        }
        _moveTo.apply(this, arguments);
    };
    // -------------------------- placing -------------------------- //
    proto.enablePlacing = function() {
        this.removeTransitionStyles();
        // remove transform property from transition
        if (this.isTransitioning && transformProperty) {
            this.element.style[transformProperty] = "none";
        }
        this.isTransitioning = false;
        this.getSize();
        this.layout._setRectSize(this.element, this.rect);
        this.isPlacing = true;
    };
    proto.disablePlacing = function() {
        this.isPlacing = false;
    };
    // -----  ----- //
    // remove element from DOM
    proto.removeElem = function() {
        this.element.parentNode.removeChild(this.element);
        // add space back to packer
        this.layout.packer.addSpace(this.rect);
        this.emitEvent("remove", [ this ]);
    };
    // ----- dropPlaceholder ----- //
    proto.showDropPlaceholder = function() {
        var dropPlaceholder = this.dropPlaceholder;
        if (!dropPlaceholder) {
            // create dropPlaceholder
            dropPlaceholder = this.dropPlaceholder = document.createElement("div");
            dropPlaceholder.className = "packery-drop-placeholder";
            dropPlaceholder.style.position = "absolute";
        }
        dropPlaceholder.style.width = this.size.width + "px";
        dropPlaceholder.style.height = this.size.height + "px";
        this.positionDropPlaceholder();
        this.layout.element.appendChild(dropPlaceholder);
    };
    proto.positionDropPlaceholder = function() {
        this.dropPlaceholder.style[transformProperty] = "translate(" + this.rect.x + "px, " + this.rect.y + "px)";
    };
    proto.hideDropPlaceholder = function() {
        // only remove once, #333
        var parent = this.dropPlaceholder.parentNode;
        if (parent) {
            parent.removeChild(this.dropPlaceholder);
        }
    };
    // -----  ----- //
    return Item;
});

/*!
 * Packery v2.1.1
 * Gapless, draggable grid layouts
 *
 * Licensed GPLv3 for open source use
 * or Packery Commercial License for commercial use
 *
 * http://packery.metafizzy.co
 * Copyright 2016 Metafizzy
 */
(function(window, factory) {
    // universal module definition
    /* jshint strict: false */
    /* globals define, module, require */
    if (typeof define == "function" && define.amd) {
        // AMD
        define([ "get-size/get-size", "outlayer/outlayer", "packery/js/rect", "packery/js/packer", "packery/js/item" ], factory);
    } else if (typeof module == "object" && module.exports) {
        // CommonJS
        module.exports = factory(require("get-size"), require("outlayer"), require("./rect"), require("./packer"), require("./item"));
    } else {
        // browser global
        window.Packery = factory(window.getSize, window.Outlayer, window.Packery.Rect, window.Packery.Packer, window.Packery.Item);
    }
})(window, function factory(getSize, Outlayer, Rect, Packer, Item) {
    "use strict";
    // ----- Rect ----- //
    // allow for pixel rounding errors IE8-IE11 & Firefox; #227
    Rect.prototype.canFit = function(rect) {
        return this.width >= rect.width - 1 && this.height >= rect.height - 1;
    };
    // -------------------------- Packery -------------------------- //
    // create an Outlayer layout class
    var Packery = Outlayer.create("packery");
    Packery.Item = Item;
    var proto = Packery.prototype;
    proto._create = function() {
        // call super
        Outlayer.prototype._create.call(this);
        // initial properties
        this.packer = new Packer();
        // packer for drop targets
        this.shiftPacker = new Packer();
        this.isEnabled = true;
        this.dragItemCount = 0;
        // create drag handlers
        var _this = this;
        this.handleDraggabilly = {
            dragStart: function() {
                _this.itemDragStart(this.element);
            },
            dragMove: function() {
                _this.itemDragMove(this.element, this.position.x, this.position.y);
            },
            dragEnd: function() {
                _this.itemDragEnd(this.element);
            }
        };
        this.handleUIDraggable = {
            start: function handleUIDraggableStart(event, ui) {
                // HTML5 may trigger dragstart, dismiss HTML5 dragging
                if (!ui) {
                    return;
                }
                _this.itemDragStart(event.currentTarget);
            },
            drag: function handleUIDraggableDrag(event, ui) {
                if (!ui) {
                    return;
                }
                _this.itemDragMove(event.currentTarget, ui.position.left, ui.position.top);
            },
            stop: function handleUIDraggableStop(event, ui) {
                if (!ui) {
                    return;
                }
                _this.itemDragEnd(event.currentTarget);
            }
        };
    };
    // ----- init & layout ----- //
    /**
 * logic before any new layout
 */
    proto._resetLayout = function() {
        this.getSize();
        this._getMeasurements();
        // reset packer
        var width, height, sortDirection;
        // packer settings, if horizontal or vertical
        if (this._getOption("horizontal")) {
            width = Infinity;
            height = this.size.innerHeight + this.gutter;
            sortDirection = "rightwardTopToBottom";
        } else {
            width = this.size.innerWidth + this.gutter;
            height = Infinity;
            sortDirection = "downwardLeftToRight";
        }
        this.packer.width = this.shiftPacker.width = width;
        this.packer.height = this.shiftPacker.height = height;
        this.packer.sortDirection = this.shiftPacker.sortDirection = sortDirection;
        this.packer.reset();
        // layout
        this.maxY = 0;
        this.maxX = 0;
    };
    /**
 * update columnWidth, rowHeight, & gutter
 * @private
 */
    proto._getMeasurements = function() {
        this._getMeasurement("columnWidth", "width");
        this._getMeasurement("rowHeight", "height");
        this._getMeasurement("gutter", "width");
    };
    proto._getItemLayoutPosition = function(item) {
        this._setRectSize(item.element, item.rect);
        if (this.isShifting || this.dragItemCount > 0) {
            var packMethod = this._getPackMethod();
            this.packer[packMethod](item.rect);
        } else {
            this.packer.pack(item.rect);
        }
        this._setMaxXY(item.rect);
        return item.rect;
    };
    proto.shiftLayout = function() {
        this.isShifting = true;
        this.layout();
        delete this.isShifting;
    };
    proto._getPackMethod = function() {
        return this._getOption("horizontal") ? "rowPack" : "columnPack";
    };
    /**
 * set max X and Y value, for size of container
 * @param {Packery.Rect} rect
 * @private
 */
    proto._setMaxXY = function(rect) {
        this.maxX = Math.max(rect.x + rect.width, this.maxX);
        this.maxY = Math.max(rect.y + rect.height, this.maxY);
    };
    /**
 * set the width and height of a rect, applying columnWidth and rowHeight
 * @param {Element} elem
 * @param {Packery.Rect} rect
 */
    proto._setRectSize = function(elem, rect) {
        var size = getSize(elem);
        var w = size.outerWidth;
        var h = size.outerHeight;
        // size for columnWidth and rowHeight, if available
        // only check if size is non-zero, #177
        if (w || h) {
            w = this._applyGridGutter(w, this.columnWidth);
            h = this._applyGridGutter(h, this.rowHeight);
        }
        // rect must fit in packer
        rect.width = Math.min(w, this.packer.width);
        rect.height = Math.min(h, this.packer.height);
    };
    /**
 * fits item to columnWidth/rowHeight and adds gutter
 * @param {Number} measurement - item width or height
 * @param {Number} gridSize - columnWidth or rowHeight
 * @returns measurement
 */
    proto._applyGridGutter = function(measurement, gridSize) {
        // just add gutter if no gridSize
        if (!gridSize) {
            return measurement + this.gutter;
        }
        gridSize += this.gutter;
        // fit item to columnWidth/rowHeight
        var remainder = measurement % gridSize;
        var mathMethod = remainder && remainder < 1 ? "round" : "ceil";
        measurement = Math[mathMethod](measurement / gridSize) * gridSize;
        return measurement;
    };
    proto._getContainerSize = function() {
        if (this._getOption("horizontal")) {
            return {
                width: this.maxX - this.gutter
            };
        } else {
            return {
                height: this.maxY - this.gutter
            };
        }
    };
    // -------------------------- stamp -------------------------- //
    /**
 * makes space for element
 * @param {Element} elem
 */
    proto._manageStamp = function(elem) {
        var item = this.getItem(elem);
        var rect;
        if (item && item.isPlacing) {
            rect = item.rect;
        } else {
            var offset = this._getElementOffset(elem);
            rect = new Rect({
                x: this._getOption("originLeft") ? offset.left : offset.right,
                y: this._getOption("originTop") ? offset.top : offset.bottom
            });
        }
        this._setRectSize(elem, rect);
        // save its space in the packer
        this.packer.placed(rect);
        this._setMaxXY(rect);
    };
    // -------------------------- methods -------------------------- //
    function verticalSorter(a, b) {
        return a.position.y - b.position.y || a.position.x - b.position.x;
    }
    function horizontalSorter(a, b) {
        return a.position.x - b.position.x || a.position.y - b.position.y;
    }
    proto.sortItemsByPosition = function() {
        var sorter = this._getOption("horizontal") ? horizontalSorter : verticalSorter;
        this.items.sort(sorter);
    };
    /**
 * Fit item element in its current position
 * Packery will position elements around it
 * useful for expanding elements
 *
 * @param {Element} elem
 * @param {Number} x - horizontal destination position, optional
 * @param {Number} y - vertical destination position, optional
 */
    proto.fit = function(elem, x, y) {
        var item = this.getItem(elem);
        if (!item) {
            return;
        }
        // stamp item to get it out of layout
        this.stamp(item.element);
        // set placing flag
        item.enablePlacing();
        this.updateShiftTargets(item);
        // fall back to current position for fitting
        x = x === undefined ? item.rect.x : x;
        y = y === undefined ? item.rect.y : y;
        // position it best at its destination
        this.shift(item, x, y);
        this._bindFitEvents(item);
        item.moveTo(item.rect.x, item.rect.y);
        // layout everything else
        this.shiftLayout();
        // return back to regularly scheduled programming
        this.unstamp(item.element);
        this.sortItemsByPosition();
        item.disablePlacing();
    };
    /**
 * emit event when item is fit and other items are laid out
 * @param {Packery.Item} item
 * @private
 */
    proto._bindFitEvents = function(item) {
        var _this = this;
        var ticks = 0;
        function onLayout() {
            ticks++;
            if (ticks != 2) {
                return;
            }
            _this.dispatchEvent("fitComplete", null, [ item ]);
        }
        // when item is laid out
        item.once("layout", onLayout);
        // when all items are laid out
        this.once("layoutComplete", onLayout);
    };
    // -------------------------- resize -------------------------- //
    // debounced, layout on resize
    proto.resize = function() {
        // don't trigger if size did not change
        // or if resize was unbound. See #285, outlayer#9
        if (!this.isResizeBound || !this.needsResizeLayout()) {
            return;
        }
        if (this.options.shiftPercentResize) {
            this.resizeShiftPercentLayout();
        } else {
            this.layout();
        }
    };
    /**
 * check if layout is needed post layout
 * @returns Boolean
 */
    proto.needsResizeLayout = function() {
        var size = getSize(this.element);
        var innerSize = this._getOption("horizontal") ? "innerHeight" : "innerWidth";
        return size[innerSize] != this.size[innerSize];
    };
    proto.resizeShiftPercentLayout = function() {
        var items = this._getItemsForLayout(this.items);
        var isHorizontal = this._getOption("horizontal");
        var coord = isHorizontal ? "y" : "x";
        var measure = isHorizontal ? "height" : "width";
        var segmentName = isHorizontal ? "rowHeight" : "columnWidth";
        var innerSize = isHorizontal ? "innerHeight" : "innerWidth";
        // proportional re-align items
        var previousSegment = this[segmentName];
        previousSegment = previousSegment && previousSegment + this.gutter;
        if (previousSegment) {
            this._getMeasurements();
            var currentSegment = this[segmentName] + this.gutter;
            items.forEach(function(item) {
                var seg = Math.round(item.rect[coord] / previousSegment);
                item.rect[coord] = seg * currentSegment;
            });
        } else {
            var currentSize = getSize(this.element)[innerSize] + this.gutter;
            var previousSize = this.packer[measure];
            items.forEach(function(item) {
                item.rect[coord] = item.rect[coord] / previousSize * currentSize;
            });
        }
        this.shiftLayout();
    };
    // -------------------------- drag -------------------------- //
    /**
 * handle an item drag start event
 * @param {Element} elem
 */
    proto.itemDragStart = function(elem) {
        if (!this.isEnabled) {
            return;
        }
        this.stamp(elem);
        // this.ignore( elem );
        var item = this.getItem(elem);
        if (!item) {
            return;
        }
        item.enablePlacing();
        item.showDropPlaceholder();
        this.dragItemCount++;
        this.updateShiftTargets(item);
    };
    proto.updateShiftTargets = function(dropItem) {
        this.shiftPacker.reset();
        // pack stamps
        this._getBoundingRect();
        var isOriginLeft = this._getOption("originLeft");
        var isOriginTop = this._getOption("originTop");
        this.stamps.forEach(function(stamp) {
            // ignore dragged item
            var item = this.getItem(stamp);
            if (item && item.isPlacing) {
                return;
            }
            var offset = this._getElementOffset(stamp);
            var rect = new Rect({
                x: isOriginLeft ? offset.left : offset.right,
                y: isOriginTop ? offset.top : offset.bottom
            });
            this._setRectSize(stamp, rect);
            // save its space in the packer
            this.shiftPacker.placed(rect);
        }, this);
        // reset shiftTargets
        var isHorizontal = this._getOption("horizontal");
        var segmentName = isHorizontal ? "rowHeight" : "columnWidth";
        var measure = isHorizontal ? "height" : "width";
        this.shiftTargetKeys = [];
        this.shiftTargets = [];
        var boundsSize;
        var segment = this[segmentName];
        segment = segment && segment + this.gutter;
        if (segment) {
            var segmentSpan = Math.ceil(dropItem.rect[measure] / segment);
            var segs = Math.floor((this.shiftPacker[measure] + this.gutter) / segment);
            boundsSize = (segs - segmentSpan) * segment;
            // add targets on top
            for (var i = 0; i < segs; i++) {
                var initialX = isHorizontal ? 0 : i * segment;
                var initialY = isHorizontal ? i * segment : 0;
                this._addShiftTarget(initialX, initialY, boundsSize);
            }
        } else {
            boundsSize = this.shiftPacker[measure] + this.gutter - dropItem.rect[measure];
            this._addShiftTarget(0, 0, boundsSize);
        }
        // pack each item to measure where shiftTargets are
        var items = this._getItemsForLayout(this.items);
        var packMethod = this._getPackMethod();
        items.forEach(function(item) {
            var rect = item.rect;
            this._setRectSize(item.element, rect);
            this.shiftPacker[packMethod](rect);
            // add top left corner
            this._addShiftTarget(rect.x, rect.y, boundsSize);
            // add bottom left / top right corner
            var cornerX = isHorizontal ? rect.x + rect.width : rect.x;
            var cornerY = isHorizontal ? rect.y : rect.y + rect.height;
            this._addShiftTarget(cornerX, cornerY, boundsSize);
            if (segment) {
                // add targets for each column on bottom / row on right
                var segSpan = Math.round(rect[measure] / segment);
                for (var i = 1; i < segSpan; i++) {
                    var segX = isHorizontal ? cornerX : rect.x + segment * i;
                    var segY = isHorizontal ? rect.y + segment * i : cornerY;
                    this._addShiftTarget(segX, segY, boundsSize);
                }
            }
        }, this);
    };
    proto._addShiftTarget = function(x, y, boundsSize) {
        var checkCoord = this._getOption("horizontal") ? y : x;
        if (checkCoord !== 0 && checkCoord > boundsSize) {
            return;
        }
        // create string for a key, easier to keep track of what targets
        var key = x + "," + y;
        var hasKey = this.shiftTargetKeys.indexOf(key) != -1;
        if (hasKey) {
            return;
        }
        this.shiftTargetKeys.push(key);
        this.shiftTargets.push({
            x: x,
            y: y
        });
    };
    // -------------------------- drop -------------------------- //
    proto.shift = function(item, x, y) {
        var shiftPosition;
        var minDistance = Infinity;
        var position = {
            x: x,
            y: y
        };
        this.shiftTargets.forEach(function(target) {
            var distance = getDistance(target, position);
            if (distance < minDistance) {
                shiftPosition = target;
                minDistance = distance;
            }
        });
        item.rect.x = shiftPosition.x;
        item.rect.y = shiftPosition.y;
    };
    function getDistance(a, b) {
        var dx = b.x - a.x;
        var dy = b.y - a.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    // -------------------------- drag move -------------------------- //
    var DRAG_THROTTLE_TIME = 120;
    /**
 * handle an item drag move event
 * @param {Element} elem
 * @param {Number} x - horizontal change in position
 * @param {Number} y - vertical change in position
 */
    proto.itemDragMove = function(elem, x, y) {
        var item = this.isEnabled && this.getItem(elem);
        if (!item) {
            return;
        }
        x -= this.size.paddingLeft;
        y -= this.size.paddingTop;
        var _this = this;
        function onDrag() {
            _this.shift(item, x, y);
            item.positionDropPlaceholder();
            _this.layout();
        }
        // throttle
        var now = new Date();
        if (this._itemDragTime && now - this._itemDragTime < DRAG_THROTTLE_TIME) {
            clearTimeout(this.dragTimeout);
            this.dragTimeout = setTimeout(onDrag, DRAG_THROTTLE_TIME);
        } else {
            onDrag();
            this._itemDragTime = now;
        }
    };
    // -------------------------- drag end -------------------------- //
    /**
 * handle an item drag end event
 * @param {Element} elem
 */
    proto.itemDragEnd = function(elem) {
        var item = this.isEnabled && this.getItem(elem);
        if (!item) {
            return;
        }
        clearTimeout(this.dragTimeout);
        item.element.classList.add("is-positioning-post-drag");
        var completeCount = 0;
        var _this = this;
        function onDragEndLayoutComplete() {
            completeCount++;
            if (completeCount != 2) {
                return;
            }
            // reset drag item
            item.element.classList.remove("is-positioning-post-drag");
            item.hideDropPlaceholder();
            _this.dispatchEvent("dragItemPositioned", null, [ item ]);
        }
        item.once("layout", onDragEndLayoutComplete);
        this.once("layoutComplete", onDragEndLayoutComplete);
        item.moveTo(item.rect.x, item.rect.y);
        this.layout();
        this.dragItemCount = Math.max(0, this.dragItemCount - 1);
        this.sortItemsByPosition();
        item.disablePlacing();
        this.unstamp(item.element);
    };
    /**
 * binds Draggabilly events
 * @param {Draggabilly} draggie
 */
    proto.bindDraggabillyEvents = function(draggie) {
        this._bindDraggabillyEvents(draggie, "on");
    };
    proto.unbindDraggabillyEvents = function(draggie) {
        this._bindDraggabillyEvents(draggie, "off");
    };
    proto._bindDraggabillyEvents = function(draggie, method) {
        var handlers = this.handleDraggabilly;
        draggie[method]("dragStart", handlers.dragStart);
        draggie[method]("dragMove", handlers.dragMove);
        draggie[method]("dragEnd", handlers.dragEnd);
    };
    /**
 * binds jQuery UI Draggable events
 * @param {jQuery} $elems
 */
    proto.bindUIDraggableEvents = function($elems) {
        this._bindUIDraggableEvents($elems, "on");
    };
    proto.unbindUIDraggableEvents = function($elems) {
        this._bindUIDraggableEvents($elems, "off");
    };
    proto._bindUIDraggableEvents = function($elems, method) {
        var handlers = this.handleUIDraggable;
        $elems[method]("dragstart", handlers.start)[method]("drag", handlers.drag)[method]("dragstop", handlers.stop);
    };
    // ----- destroy ----- //
    var _destroy = proto.destroy;
    proto.destroy = function() {
        _destroy.apply(this, arguments);
        // disable flag; prevent drag events from triggering. #72
        this.isEnabled = false;
    };
    // -----  ----- //
    Packery.Rect = Rect;
    Packery.Packer = Packer;
    return Packery;
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
    "use strict";
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