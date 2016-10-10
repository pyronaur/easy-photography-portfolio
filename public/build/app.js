(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var App_State, Hooks, Portfolio, State_Manager;

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Portfolio = require('./class/Portfolio');

State_Manager = require('./class/State_Manager');

App_State = new State_Manager();

Hooks.addAction('pp.loaded', function() {
  var portfolio;
  return portfolio = new Portfolio();
});

require('./masonry');


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./class/Portfolio":3,"./class/State_Manager":4,"./masonry":8}],2:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var $, Hooks, Masonry,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Masonry = (function() {
  Masonry.prototype.Elements = {
    container: 'PP_Masonry',
    sizer: 'PP_Masonry__sizer',
    item: 'PP_Masonry__item'
  };

  function Masonry($parent) {
    if ($parent == null) {
      $parent = $(document);
    }
    this.refresh = bind(this.refresh, this);
    this.destroy = bind(this.destroy, this);
    this.create = bind(this.create, this);
    this.$container = $parent.find("." + this.Elements.container);
    this.create();
  }

  Masonry.prototype.create = function() {
    if (this.$container.length === 0) {
      return;
    }
    this.$container.addClass('is-preparing-masonry');
    this.maybe_create_sizer();
    Hooks.doAction('pp.masonry.start/before');
    this.$container.masonry({
      itemSelector: "." + this.Elements.item,
      columnWidth: "." + this.Elements.sizer,
      gutter: 0,
      initLayout: false
    });
    this.$container.masonry('on', 'layoutComplete', (function(_this) {
      return function() {
        _this.$container.removeClass('is-preparing-masonry');
        return Hooks.doAction('pp.masonry.start/complete');
      };
    })(this));
    this.$container.masonry();
    Hooks.doAction('pp.masonry.start/layout');
  };

  Masonry.prototype.destroy = function() {
    this.maybe_remove_sizer();
    if (this.$container.length > 0) {
      this.$container.masonry('destroy');
    }
  };

  Masonry.prototype.refresh = function() {
    return this.$container.maosnry('layout');
  };


  /*
  
  		Create a sizer element for jquery-masonry to use
   */

  Masonry.prototype.maybe_create_sizer = function() {
    if (this.sizer_doesnt_exist()) {
      this.create_sizer();
    }
  };

  Masonry.prototype.maybe_remove_sizer = function() {
    if (this.$container.length !== 1) {
      return;
    }
    this.$container.find("." + this.Elements.sizer).remove();
  };

  Masonry.prototype.sizer_doesnt_exist = function() {
    return this.$container.find("." + this.Elements.sizer).length === 0;
  };

  Masonry.prototype.create_sizer = function() {
    this.$container.append("<div class=\"" + this.Elements.sizer + "\"></div>");
  };

  return Masonry;

})();

module.exports = Masonry;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],3:[function(require,module,exports){
(function (global){
var Hooks, Portfolio;

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Portfolio = (function() {
  function Portfolio() {

    /*
      		Event Based Portfolio is going to start soon
     */
    this.handler = Hooks.applyFilters('pp.portfolio.handler', false);
    if (this.handler) {
      Hooks.addAction('pp.portfolio.create', this.handler.create, 50);
      Hooks.addAction('pp.portfolio.refresh', this.handler.refresh, 50);
      Hooks.addAction('pp.portfolio.destroy', this.handler.destroy, 50);
      Hooks.addAction('pp.portfolio.destroy', this.auto_destroy, 500);
    }
  }

  Portfolio.prototype.create = function() {
    Hooks.doAction('pp.portfolio.create');
  };

  Portfolio.prototype.refresh = function() {
    Hooks.doAction('pp.portfolio.refresh');
  };

  Portfolio.prototype.destroy = function() {
    Hooks.doAction('pp.portfolio.destroy');
  };

  Portfolio.prototype.auto_destroy = function() {
    Hooks.removeAction('pp.portfolio.create', this.handler.create, 50);
    Hooks.removeAction('pp.portfolio.refresh', this.handler.refresh, 50);
    return Hooks.removeAction('pp.portfolio.destroy', this.handler.destroy, 50);
  };

  return Portfolio;

})();

module.exports = Portfolio;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],4:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var $, Hooks, State_Manager,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

State_Manager = (function() {
  function State_Manager() {
    this.loaded = bind(this.loaded, this);
    this.ready = bind(this.ready, this);
    this.$doc = $(document);
    this.$doc.on('ready', this.ready);
    this.$doc.find('.pp-wrapper').imagesLoaded(this.loaded);
  }

  State_Manager.prototype.ready = function() {
    var trigger;
    trigger = true;
    if (Hooks.applyFilters('pp.ready', true)) {
      Hooks.doAction('pp.ready');
    }
  };

  State_Manager.prototype.loaded = function() {
    var trigger;
    trigger = true;
    if (Hooks.applyFilters('pp.loaded', true)) {
      Hooks.doAction('pp.loaded');
    }
  };

  return State_Manager;

})();

module.exports = State_Manager;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],5:[function(require,module,exports){
var Item_Data;

Item_Data = (function() {
  function Item_Data($el) {
    var data;
    this.$el = $el;
    data = $el.data('item');
    if (!data) {
      throw new Error("Element doesn't contain `data-item` attribute");
    }
    this.data = data;
  }

  Item_Data.prototype.get_data = function(name) {
    var image;
    image = this.data['images'][name];
    if (!image) {
      return false;
    }
    return image;
  };

  Item_Data.prototype.get_size = function(name) {
    var height, image, ref, size, width;
    image = this.get_data(name);
    if (!image) {
      return false;
    }
    size = image['size'];
    ref = size.split('x'), width = ref[0], height = ref[1];
    width = parseInt(width);
    height = parseInt(height);
    return [width, height];
  };

  Item_Data.prototype.get_url = function(name) {
    var image;
    image = this.get_data(name);
    if (!image) {
      return false;
    }
    return image['url'];
  };

  Item_Data.prototype.get_or_false = function(key) {
    if (this.data[key]) {
      return this.data[key];
    }
    return false;
  };

  Item_Data.prototype.get_ratio = function() {
    return this.get_or_false('ratio');
  };

  Item_Data.prototype.get_type = function() {
    return this.get_or_false('type');
  };

  return Item_Data;

})();

module.exports = Item_Data;


},{}],6:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var $, Hooks, Lazy_Loader;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Lazy_Loader = (function() {
  Lazy_Loader.prototype.Elements = {
    item: 'PP_Lazy_Image'
  };

  function Lazy_Loader(handler) {
    this.handler = handler;
    this.handler = Hooks.applyFilters('pp.lazy.handler', this.handler);
    if (this.handler) {
      this.prepare();
      this.load_all();
    }
  }

  Lazy_Loader.prototype.prepare = function() {
    var $items;
    $items = $("." + this.Elements.item);
    return $items.each((function(_this) {
      return function(key, el) {
        return _this.handler.resize(el);
      };
    })(this));
  };

  Lazy_Loader.prototype.load_all = function() {
    var $items;
    $items = $("." + this.Elements.item);
    return $items.each((function(_this) {
      return function(key, el) {
        _this.handler.load(el);
        return _this.remove_placeholder(el);
      };
    })(this));
  };

  Lazy_Loader.prototype.remove_placeholder = function(el) {
    var $el;
    $el = $(el);
    return $el.find('.Lazy-Image__placeholder, noscript').remove();
  };

  return Lazy_Loader;

})();

module.exports = Lazy_Loader;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],7:[function(require,module,exports){
(function (global){
var $, Item_Data, Lazy_Masonry;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Item_Data = require('./Item_Data');

Lazy_Masonry = (function() {
  function Lazy_Masonry() {}

  Lazy_Masonry.prototype.resize = function(el) {
    var $el, ratio;
    $el = $(el);
    ratio = new Item_Data($el).get_ratio();
    return $el.css({
      'min-height': Math.floor(this.get_width() / ratio)
    });
  };

  Lazy_Masonry.prototype.get_width = function() {
    return $('.PP_Masonry__sizer').width();
  };

  Lazy_Masonry.prototype.load = function(el) {
    var $el, $image, full, image, thumb;
    $el = $(el);
    image = new Item_Data($el);
    thumb = image.get_url('thumb');
    full = image.get_url('full');
    $el.prepend("<a href=\"" + full + "\" rel=\"gallery\">\n<img src=\"" + thumb + "\" class=\"is-loading\" />\n</a>").removeClass('Lazy-Image');
    $image = $el.find('img');
    return $image.imagesLoaded(function() {
      $image.addClass('is-loaded').removeClass('is-loading');
      return $el.css('min-height', '').removeClass('lazy-image');
    });
  };

  return Lazy_Masonry;

})();

module.exports = Lazy_Masonry;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./Item_Data":5}],8:[function(require,module,exports){
(function (global){
var $, Hooks, Lazy_Loader, Lazy_Masonry, Masonry;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Masonry = require('./class/Masonry');

Lazy_Loader = require('./lazy/Lazy_Loader');

Lazy_Masonry = require('./lazy/Lazy_Masonry');

Hooks.addAction('pp.masonry.start/before', function() {
  return new Lazy_Loader(new Lazy_Masonry());
});

Hooks.addAction('pp.ready', function() {
  if ($('.PP_Masonry').length > 0) {
    return Hooks.addFilter('pp.portfolio.handler', function() {
      return new Masonry();
    });
  }
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./class/Masonry":2,"./lazy/Lazy_Loader":6,"./lazy/Lazy_Masonry":7}]},{},[1])


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jbGFzcy9NYXNvbnJ5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jbGFzcy9Qb3J0Zm9saW8uY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2NsYXNzL1N0YXRlX01hbmFnZXIuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvSXRlbV9EYXRhLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0xhenlfTG9hZGVyLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0xhenlfTWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvbWFzb25yeS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgQXBwX1N0YXRlLCBIb29rcywgUG9ydGZvbGlvLCBTdGF0ZV9NYW5hZ2VyO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5Qb3J0Zm9saW8gPSByZXF1aXJlKCcuL2NsYXNzL1BvcnRmb2xpbycpO1xuXG5TdGF0ZV9NYW5hZ2VyID0gcmVxdWlyZSgnLi9jbGFzcy9TdGF0ZV9NYW5hZ2VyJyk7XG5cbkFwcF9TdGF0ZSA9IG5ldyBTdGF0ZV9NYW5hZ2VyKCk7XG5cbkhvb2tzLmFkZEFjdGlvbigncHAubG9hZGVkJywgZnVuY3Rpb24oKSB7XG4gIHZhciBwb3J0Zm9saW87XG4gIHJldHVybiBwb3J0Zm9saW8gPSBuZXcgUG9ydGZvbGlvKCk7XG59KTtcblxucmVxdWlyZSgnLi9tYXNvbnJ5Jyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVlYQndMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaVlYQndMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaU8wRkJRVUU3T3p0QlFVRkJMRWxCUVVFN08wRkJSMEVzUzBGQlFTeEhRVUZSTEU5QlFVRXNRMEZCVXl4VlFVRlVPenRCUVVOU0xGTkJRVUVzUjBGQldTeFBRVUZCTEVOQlFWTXNiVUpCUVZRN08wRkJRMW9zWVVGQlFTeEhRVUZuUWl4UFFVRkJMRU5CUVZNc2RVSkJRVlE3TzBGQlIyaENMRk5CUVVFc1IwRkJaMElzU1VGQlFTeGhRVUZCTEVOQlFVRTdPMEZCU1doQ0xFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMRmRCUVdoQ0xFVkJRVFpDTEZOQlFVRTdRVUZETlVJc1RVRkJRVHRUUVVGQkxGTkJRVUVzUjBGQlowSXNTVUZCUVN4VFFVRkJMRU5CUVVFN1FVRkVXU3hEUVVFM1FqczdRVUZKUVN4UFFVRkJMRU5CUVZFc1YwRkJVaUo5XG4iLCJcbi8qXG4gICAgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBIb29rcywgTWFzb25yeSxcbiAgYmluZCA9IGZ1bmN0aW9uKGZuLCBtZSl7IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7IH07IH07XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5NYXNvbnJ5ID0gKGZ1bmN0aW9uKCkge1xuICBNYXNvbnJ5LnByb3RvdHlwZS5FbGVtZW50cyA9IHtcbiAgICBjb250YWluZXI6ICdQUF9NYXNvbnJ5JyxcbiAgICBzaXplcjogJ1BQX01hc29ucnlfX3NpemVyJyxcbiAgICBpdGVtOiAnUFBfTWFzb25yeV9faXRlbSdcbiAgfTtcblxuICBmdW5jdGlvbiBNYXNvbnJ5KCRwYXJlbnQpIHtcbiAgICBpZiAoJHBhcmVudCA9PSBudWxsKSB7XG4gICAgICAkcGFyZW50ID0gJChkb2N1bWVudCk7XG4gICAgfVxuICAgIHRoaXMucmVmcmVzaCA9IGJpbmQodGhpcy5yZWZyZXNoLCB0aGlzKTtcbiAgICB0aGlzLmRlc3Ryb3kgPSBiaW5kKHRoaXMuZGVzdHJveSwgdGhpcyk7XG4gICAgdGhpcy5jcmVhdGUgPSBiaW5kKHRoaXMuY3JlYXRlLCB0aGlzKTtcbiAgICB0aGlzLiRjb250YWluZXIgPSAkcGFyZW50LmZpbmQoXCIuXCIgKyB0aGlzLkVsZW1lbnRzLmNvbnRhaW5lcik7XG4gICAgdGhpcy5jcmVhdGUoKTtcbiAgfVxuXG4gIE1hc29ucnkucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLiRjb250YWluZXIubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuJGNvbnRhaW5lci5hZGRDbGFzcygnaXMtcHJlcGFyaW5nLW1hc29ucnknKTtcbiAgICB0aGlzLm1heWJlX2NyZWF0ZV9zaXplcigpO1xuICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5tYXNvbnJ5LnN0YXJ0L2JlZm9yZScpO1xuICAgIHRoaXMuJGNvbnRhaW5lci5tYXNvbnJ5KHtcbiAgICAgIGl0ZW1TZWxlY3RvcjogXCIuXCIgKyB0aGlzLkVsZW1lbnRzLml0ZW0sXG4gICAgICBjb2x1bW5XaWR0aDogXCIuXCIgKyB0aGlzLkVsZW1lbnRzLnNpemVyLFxuICAgICAgZ3V0dGVyOiAwLFxuICAgICAgaW5pdExheW91dDogZmFsc2VcbiAgICB9KTtcbiAgICB0aGlzLiRjb250YWluZXIubWFzb25yeSgnb24nLCAnbGF5b3V0Q29tcGxldGUnLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgX3RoaXMuJGNvbnRhaW5lci5yZW1vdmVDbGFzcygnaXMtcHJlcGFyaW5nLW1hc29ucnknKTtcbiAgICAgICAgcmV0dXJuIEhvb2tzLmRvQWN0aW9uKCdwcC5tYXNvbnJ5LnN0YXJ0L2NvbXBsZXRlJyk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICB0aGlzLiRjb250YWluZXIubWFzb25yeSgpO1xuICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5tYXNvbnJ5LnN0YXJ0L2xheW91dCcpO1xuICB9O1xuXG4gIE1hc29ucnkucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLm1heWJlX3JlbW92ZV9zaXplcigpO1xuICAgIGlmICh0aGlzLiRjb250YWluZXIubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy4kY29udGFpbmVyLm1hc29ucnkoJ2Rlc3Ryb3knKTtcbiAgICB9XG4gIH07XG5cbiAgTWFzb25yeS5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLiRjb250YWluZXIubWFvc25yeSgnbGF5b3V0Jyk7XG4gIH07XG5cblxuICAvKlxuICBcbiAgXHRcdENyZWF0ZSBhIHNpemVyIGVsZW1lbnQgZm9yIGpxdWVyeS1tYXNvbnJ5IHRvIHVzZVxuICAgKi9cblxuICBNYXNvbnJ5LnByb3RvdHlwZS5tYXliZV9jcmVhdGVfc2l6ZXIgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5zaXplcl9kb2VzbnRfZXhpc3QoKSkge1xuICAgICAgdGhpcy5jcmVhdGVfc2l6ZXIoKTtcbiAgICB9XG4gIH07XG5cbiAgTWFzb25yeS5wcm90b3R5cGUubWF5YmVfcmVtb3ZlX3NpemVyID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuJGNvbnRhaW5lci5sZW5ndGggIT09IDEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy4kY29udGFpbmVyLmZpbmQoXCIuXCIgKyB0aGlzLkVsZW1lbnRzLnNpemVyKS5yZW1vdmUoKTtcbiAgfTtcblxuICBNYXNvbnJ5LnByb3RvdHlwZS5zaXplcl9kb2VzbnRfZXhpc3QgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy4kY29udGFpbmVyLmZpbmQoXCIuXCIgKyB0aGlzLkVsZW1lbnRzLnNpemVyKS5sZW5ndGggPT09IDA7XG4gIH07XG5cbiAgTWFzb25yeS5wcm90b3R5cGUuY3JlYXRlX3NpemVyID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kY29udGFpbmVyLmFwcGVuZChcIjxkaXYgY2xhc3M9XFxcIlwiICsgdGhpcy5FbGVtZW50cy5zaXplciArIFwiXFxcIj48L2Rpdj5cIik7XG4gIH07XG5cbiAgcmV0dXJuIE1hc29ucnk7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTWFzb25yeTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVFdGemIyNXllUzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklrMWhjMjl1Y25rdVkyOW1abVZsSWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUk3UVVGQlFUczdPMEZCUVVFc1NVRkJRU3hwUWtGQlFUdEZRVUZCT3p0QlFVZEJMRU5CUVVFc1IwRkJTU3hQUVVGQkxFTkJRVk1zVVVGQlZEczdRVUZEU2l4TFFVRkJMRWRCUVZFc1QwRkJRU3hEUVVGVExGVkJRVlE3TzBGQlJVWTdiMEpCUlV3c1VVRkJRU3hIUVVORE8wbEJRVUVzVTBGQlFTeEZRVUZYTEZsQlFWZzdTVUZEUVN4TFFVRkJMRVZCUVZjc2JVSkJSRmc3U1VGRlFTeEpRVUZCTEVWQlFWY3NhMEpCUmxnN096dEZRVTlaTEdsQ1FVRkZMRTlCUVVZN08wMUJRVVVzVlVGQlZTeERRVUZCTEVOQlFVY3NVVUZCU0RzN096czdTVUZEZUVJc1NVRkJReXhEUVVGQkxGVkJRVVFzUjBGQll5eFBRVUZQTEVOQlFVTXNTVUZCVWl4RFFVRmpMRWRCUVVFc1IwRkJTU3hKUVVGRExFTkJRVUVzVVVGQlVTeERRVUZETEZOQlFUVkNPMGxCUldRc1NVRkJReXhEUVVGQkxFMUJRVVFzUTBGQlFUdEZRVWhaT3p0dlFrRk5ZaXhOUVVGQkxFZEJRVkVzVTBGQlFUdEpRVU5RTEVsQlFWVXNTVUZCUXl4RFFVRkJMRlZCUVZVc1EwRkJReXhOUVVGYUxFdEJRWE5DTEVOQlFXaERPMEZCUVVFc1lVRkJRVHM3U1VGRlFTeEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRkZCUVZvc1EwRkJjMElzYzBKQlFYUkNPMGxCUlVFc1NVRkJReXhEUVVGQkxHdENRVUZFTEVOQlFVRTdTVUZEUVN4TFFVRkxMRU5CUVVNc1VVRkJUaXhEUVVGbExIbENRVUZtTzBsQlIwRXNTVUZCUXl4RFFVRkJMRlZCUVZVc1EwRkJReXhQUVVGYUxFTkJRME03VFVGQlFTeFpRVUZCTEVWQlFXTXNSMEZCUVN4SFFVRkpMRWxCUVVNc1EwRkJRU3hSUVVGUkxFTkJRVU1zU1VGQk5VSTdUVUZEUVN4WFFVRkJMRVZCUVdNc1IwRkJRU3hIUVVGSkxFbEJRVU1zUTBGQlFTeFJRVUZSTEVOQlFVTXNTMEZFTlVJN1RVRkZRU3hOUVVGQkxFVkJRV01zUTBGR1pEdE5RVWRCTEZWQlFVRXNSVUZCWXl4TFFVaGtPMHRCUkVRN1NVRlBRU3hKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEU5QlFWb3NRMEZCYjBJc1NVRkJjRUlzUlVGQk1FSXNaMEpCUVRGQ0xFVkJRVFJETEVOQlFVRXNVMEZCUVN4TFFVRkJPMkZCUVVFc1UwRkJRVHRSUVVNelF5eExRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRmRCUVZvc1EwRkJlVUlzYzBKQlFYcENPMlZCUTBFc1MwRkJTeXhEUVVGRExGRkJRVTRzUTBGQlpTd3lRa0ZCWmp0TlFVWXlRenRKUVVGQkxFTkJRVUVzUTBGQlFTeERRVUZCTEVsQlFVRXNRMEZCTlVNN1NVRkxRU3hKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEU5QlFWb3NRMEZCUVR0SlFVTkJMRXRCUVVzc1EwRkJReXhSUVVGT0xFTkJRV1VzZVVKQlFXWTdSVUYwUWs4N08yOUNRVFJDVWl4UFFVRkJMRWRCUVZNc1UwRkJRVHRKUVVOU0xFbEJRVU1zUTBGQlFTeHJRa0ZCUkN4RFFVRkJPMGxCUlVFc1NVRkJSeXhKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEUxQlFWb3NSMEZCY1VJc1EwRkJlRUk3VFVGRFF5eEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRTlCUVZvc1EwRkJjVUlzVTBGQmNrSXNSVUZFUkRzN1JVRklVVHM3YjBKQlUxUXNUMEZCUVN4SFFVRlRMRk5CUVVFN1YwRkRVaXhKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEU5QlFWb3NRMEZCY1VJc1VVRkJja0k3UlVGRVVUczdPMEZCUjFRN096czdPMjlDUVV0QkxHdENRVUZCTEVkQlFXOUNMRk5CUVVFN1NVRkRia0lzU1VGQmJVSXNTVUZCUXl4RFFVRkJMR3RDUVVGRUxFTkJRVUVzUTBGQmJrSTdUVUZCUVN4SlFVRkRMRU5CUVVFc1dVRkJSQ3hEUVVGQkxFVkJRVUU3TzBWQlJHMUNPenR2UWtGSmNFSXNhMEpCUVVFc1IwRkJiMElzVTBGQlFUdEpRVU51UWl4SlFVRlZMRWxCUVVNc1EwRkJRU3hWUVVGVkxFTkJRVU1zVFVGQldpeExRVUYzUWl4RFFVRnNRenRCUVVGQkxHRkJRVUU3TzBsQlEwRXNTVUZCUXl4RFFVRkJMRlZCUVZVc1EwRkJReXhKUVVGYUxFTkJRV3RDTEVkQlFVRXNSMEZCU1N4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExFdEJRV2hETEVOQlFYbERMRU5CUVVNc1RVRkJNVU1zUTBGQlFUdEZRVVp0UWpzN2IwSkJTM0JDTEd0Q1FVRkJMRWRCUVc5Q0xGTkJRVUU3VjBGQlJ5eEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRWxCUVZvc1EwRkJhMElzUjBGQlFTeEhRVUZKTEVsQlFVTXNRMEZCUVN4UlFVRlJMRU5CUVVNc1MwRkJhRU1zUTBGQmVVTXNRMEZCUXl4TlFVRXhReXhMUVVGdlJEdEZRVUYyUkRzN2IwSkJSM0JDTEZsQlFVRXNSMEZCWXl4VFFVRkJPMGxCUTJJc1NVRkJReXhEUVVGQkxGVkJRVlVzUTBGQlF5eE5RVUZhTEVOQlFXMUNMR1ZCUVVFc1IwRkJhVUlzU1VGQlF5eERRVUZCTEZGQlFWRXNRMEZCUXl4TFFVRXpRaXhIUVVGcFF5eFhRVUZ3UkR0RlFVUmhPenM3T3pzN1FVRk5aaXhOUVVGTkxFTkJRVU1zVDBGQlVDeEhRVUZwUWlKOVxuIiwidmFyIEhvb2tzLCBQb3J0Zm9saW87XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cblBvcnRmb2xpbyA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gUG9ydGZvbGlvKCkge1xuXG4gICAgLypcbiAgICAgIFx0XHRFdmVudCBCYXNlZCBQb3J0Zm9saW8gaXMgZ29pbmcgdG8gc3RhcnQgc29vblxuICAgICAqL1xuICAgIHRoaXMuaGFuZGxlciA9IEhvb2tzLmFwcGx5RmlsdGVycygncHAucG9ydGZvbGlvLmhhbmRsZXInLCBmYWxzZSk7XG4gICAgaWYgKHRoaXMuaGFuZGxlcikge1xuICAgICAgSG9va3MuYWRkQWN0aW9uKCdwcC5wb3J0Zm9saW8uY3JlYXRlJywgdGhpcy5oYW5kbGVyLmNyZWF0ZSwgNTApO1xuICAgICAgSG9va3MuYWRkQWN0aW9uKCdwcC5wb3J0Zm9saW8ucmVmcmVzaCcsIHRoaXMuaGFuZGxlci5yZWZyZXNoLCA1MCk7XG4gICAgICBIb29rcy5hZGRBY3Rpb24oJ3BwLnBvcnRmb2xpby5kZXN0cm95JywgdGhpcy5oYW5kbGVyLmRlc3Ryb3ksIDUwKTtcbiAgICAgIEhvb2tzLmFkZEFjdGlvbigncHAucG9ydGZvbGlvLmRlc3Ryb3knLCB0aGlzLmF1dG9fZGVzdHJveSwgNTAwKTtcbiAgICB9XG4gIH1cblxuICBQb3J0Zm9saW8ucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5wb3J0Zm9saW8uY3JlYXRlJyk7XG4gIH07XG5cbiAgUG9ydGZvbGlvLnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MuZG9BY3Rpb24oJ3BwLnBvcnRmb2xpby5yZWZyZXNoJyk7XG4gIH07XG5cbiAgUG9ydGZvbGlvLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MuZG9BY3Rpb24oJ3BwLnBvcnRmb2xpby5kZXN0cm95Jyk7XG4gIH07XG5cbiAgUG9ydGZvbGlvLnByb3RvdHlwZS5hdXRvX2Rlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICBIb29rcy5yZW1vdmVBY3Rpb24oJ3BwLnBvcnRmb2xpby5jcmVhdGUnLCB0aGlzLmhhbmRsZXIuY3JlYXRlLCA1MCk7XG4gICAgSG9va3MucmVtb3ZlQWN0aW9uKCdwcC5wb3J0Zm9saW8ucmVmcmVzaCcsIHRoaXMuaGFuZGxlci5yZWZyZXNoLCA1MCk7XG4gICAgcmV0dXJuIEhvb2tzLnJlbW92ZUFjdGlvbigncHAucG9ydGZvbGlvLmRlc3Ryb3knLCB0aGlzLmhhbmRsZXIuZGVzdHJveSwgNTApO1xuICB9O1xuXG4gIHJldHVybiBQb3J0Zm9saW87XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gUG9ydGZvbGlvO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lVRzl5ZEdadmJHbHZMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaVVHOXlkR1p2YkdsdkxtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeEpRVUZCT3p0QlFVRkJMRXRCUVVFc1IwRkJVU3hQUVVGQkxFTkJRVk1zVlVGQlZEczdRVUZGUmp0RlFVVlJMRzFDUVVGQk96dEJRVU5hT3pzN1NVRkhRU3hKUVVGRExFTkJRVUVzVDBGQlJDeEhRVUZYTEV0QlFVc3NRMEZCUXl4WlFVRk9MRU5CUVcxQ0xITkNRVUZ1UWl4RlFVRXlReXhMUVVFelF6dEpRVVZZTEVsQlFVY3NTVUZCUXl4RFFVRkJMRTlCUVVvN1RVRkZReXhMUVVGTExFTkJRVU1zVTBGQlRpeERRVUZuUWl4eFFrRkJhRUlzUlVGQmRVTXNTVUZCUXl4RFFVRkJMRTlCUVU4c1EwRkJReXhOUVVGb1JDeEZRVUYzUkN4RlFVRjRSRHROUVVOQkxFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMSE5DUVVGb1FpeEZRVUYzUXl4SlFVRkRMRU5CUVVFc1QwRkJUeXhEUVVGRExFOUJRV3BFTEVWQlFUQkVMRVZCUVRGRU8wMUJRMEVzUzBGQlN5eERRVUZETEZOQlFVNHNRMEZCWjBJc2MwSkJRV2hDTEVWQlFYZERMRWxCUVVNc1EwRkJRU3hQUVVGUExFTkJRVU1zVDBGQmFrUXNSVUZCTUVRc1JVRkJNVVE3VFVGSFFTeExRVUZMTEVOQlFVTXNVMEZCVGl4RFFVRm5RaXh6UWtGQmFFSXNSVUZCZDBNc1NVRkJReXhEUVVGQkxGbEJRWHBETEVWQlFYVkVMRWRCUVhaRUxFVkJVRVE3TzBWQlRsazdPM05DUVdWaUxFMUJRVUVzUjBGQlVTeFRRVUZCTzBsQlExQXNTMEZCU3l4RFFVRkRMRkZCUVU0c1EwRkJaU3h4UWtGQlpqdEZRVVJQT3p0elFrRkxVaXhQUVVGQkxFZEJRVk1zVTBGQlFUdEpRVU5TTEV0QlFVc3NRMEZCUXl4UlFVRk9MRU5CUVdVc2MwSkJRV1k3UlVGRVVUczdjMEpCUzFRc1QwRkJRU3hIUVVGVExGTkJRVUU3U1VGRlVpeExRVUZMTEVOQlFVTXNVVUZCVGl4RFFVRmxMSE5DUVVGbU8wVkJSbEU3TzNOQ1FVdFVMRmxCUVVFc1IwRkJZeXhUUVVGQk8wbEJSV0lzUzBGQlN5eERRVUZETEZsQlFVNHNRMEZCYlVJc2NVSkJRVzVDTEVWQlFUQkRMRWxCUVVNc1EwRkJRU3hQUVVGUExFTkJRVU1zVFVGQmJrUXNSVUZCTWtRc1JVRkJNMFE3U1VGRFFTeExRVUZMTEVOQlFVTXNXVUZCVGl4RFFVRnRRaXh6UWtGQmJrSXNSVUZCTWtNc1NVRkJReXhEUVVGQkxFOUJRVThzUTBGQlF5eFBRVUZ3UkN4RlFVRTJSQ3hGUVVFM1JEdFhRVU5CTEV0QlFVc3NRMEZCUXl4WlFVRk9MRU5CUVcxQ0xITkNRVUZ1UWl4RlFVRXlReXhKUVVGRExFTkJRVUVzVDBGQlR5eERRVUZETEU5QlFYQkVMRVZCUVRaRUxFVkJRVGRFTzBWQlNtRTdPenM3T3p0QlFVOW1MRTFCUVUwc1EwRkJReXhQUVVGUUxFZEJRV2xDSW4wPVxuIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgJCwgSG9va3MsIFN0YXRlX01hbmFnZXIsXG4gIGJpbmQgPSBmdW5jdGlvbihmbiwgbWUpeyByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuIGZuLmFwcGx5KG1lLCBhcmd1bWVudHMpOyB9OyB9O1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuU3RhdGVfTWFuYWdlciA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gU3RhdGVfTWFuYWdlcigpIHtcbiAgICB0aGlzLmxvYWRlZCA9IGJpbmQodGhpcy5sb2FkZWQsIHRoaXMpO1xuICAgIHRoaXMucmVhZHkgPSBiaW5kKHRoaXMucmVhZHksIHRoaXMpO1xuICAgIHRoaXMuJGRvYyA9ICQoZG9jdW1lbnQpO1xuICAgIHRoaXMuJGRvYy5vbigncmVhZHknLCB0aGlzLnJlYWR5KTtcbiAgICB0aGlzLiRkb2MuZmluZCgnLnBwLXdyYXBwZXInKS5pbWFnZXNMb2FkZWQodGhpcy5sb2FkZWQpO1xuICB9XG5cbiAgU3RhdGVfTWFuYWdlci5wcm90b3R5cGUucmVhZHkgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdHJpZ2dlcjtcbiAgICB0cmlnZ2VyID0gdHJ1ZTtcbiAgICBpZiAoSG9va3MuYXBwbHlGaWx0ZXJzKCdwcC5yZWFkeScsIHRydWUpKSB7XG4gICAgICBIb29rcy5kb0FjdGlvbigncHAucmVhZHknKTtcbiAgICB9XG4gIH07XG5cbiAgU3RhdGVfTWFuYWdlci5wcm90b3R5cGUubG9hZGVkID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRyaWdnZXI7XG4gICAgdHJpZ2dlciA9IHRydWU7XG4gICAgaWYgKEhvb2tzLmFwcGx5RmlsdGVycygncHAubG9hZGVkJywgdHJ1ZSkpIHtcbiAgICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5sb2FkZWQnKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIFN0YXRlX01hbmFnZXI7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhdGVfTWFuYWdlcjtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVTNSaGRHVmZUV0Z1WVdkbGNpNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSWxOMFlYUmxYMDFoYm1GblpYSXVZMjltWm1WbElsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lJN1FVRkJRVHM3TzBGQlFVRXNTVUZCUVN4MVFrRkJRVHRGUVVGQk96dEJRVWRCTEVOQlFVRXNSMEZCU1N4UFFVRkJMRU5CUVZNc1VVRkJWRHM3UVVGRFNpeExRVUZCTEVkQlFWRXNUMEZCUVN4RFFVRlRMRlZCUVZRN08wRkJSMFk3UlVGRlVTeDFRa0ZCUVRzN08wbEJRMW9zU1VGQlF5eERRVUZCTEVsQlFVUXNSMEZCVVN4RFFVRkJMRU5CUVVjc1VVRkJTRHRKUVVkU0xFbEJRVU1zUTBGQlFTeEpRVUZKTEVOQlFVTXNSVUZCVGl4RFFVRlRMRTlCUVZRc1JVRkJhMElzU1VGQlF5eERRVUZCTEV0QlFXNUNPMGxCUTBFc1NVRkJReXhEUVVGQkxFbEJRVWtzUTBGQlF5eEpRVUZPTEVOQlFWa3NZVUZCV2l4RFFVRXlRaXhEUVVGRExGbEJRVFZDTEVOQlFUQkRMRWxCUVVNc1EwRkJRU3hOUVVFelF6dEZRVXhaT3pzd1FrRlJZaXhMUVVGQkxFZEJRVThzVTBGQlFUdEJRVU5PTEZGQlFVRTdTVUZCUVN4UFFVRkJMRWRCUVZVN1NVRkZWaXhKUVVGSExFdEJRVXNzUTBGQlF5eFpRVUZPTEVOQlFXMUNMRlZCUVc1Q0xFVkJRU3RDTEVsQlFTOUNMRU5CUVVnN1RVRkRReXhMUVVGTExFTkJRVU1zVVVGQlRpeERRVUZsTEZWQlFXWXNSVUZFUkRzN1JVRklUVHM3TUVKQlVWQXNUVUZCUVN4SFFVRlJMRk5CUVVFN1FVRkRVQ3hSUVVGQk8wbEJRVUVzVDBGQlFTeEhRVUZWTzBsQlJWWXNTVUZCUnl4TFFVRkxMRU5CUVVNc1dVRkJUaXhEUVVGdFFpeFhRVUZ1UWl4RlFVRm5ReXhKUVVGb1F5eERRVUZJTzAxQlEwTXNTMEZCU3l4RFFVRkRMRkZCUVU0c1EwRkJaU3hYUVVGbUxFVkJSRVE3TzBWQlNFODdPenM3T3p0QlFWTlVMRTFCUVUwc1EwRkJReXhQUVVGUUxFZEJRV2xDSW4wPVxuIiwidmFyIEl0ZW1fRGF0YTtcblxuSXRlbV9EYXRhID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBJdGVtX0RhdGEoJGVsKSB7XG4gICAgdmFyIGRhdGE7XG4gICAgdGhpcy4kZWwgPSAkZWw7XG4gICAgZGF0YSA9ICRlbC5kYXRhKCdpdGVtJyk7XG4gICAgaWYgKCFkYXRhKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFbGVtZW50IGRvZXNuJ3QgY29udGFpbiBgZGF0YS1pdGVtYCBhdHRyaWJ1dGVcIik7XG4gICAgfVxuICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gIH1cblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF9kYXRhID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBpbWFnZTtcbiAgICBpbWFnZSA9IHRoaXMuZGF0YVsnaW1hZ2VzJ11bbmFtZV07XG4gICAgaWYgKCFpbWFnZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gaW1hZ2U7XG4gIH07XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfc2l6ZSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaGVpZ2h0LCBpbWFnZSwgcmVmLCBzaXplLCB3aWR0aDtcbiAgICBpbWFnZSA9IHRoaXMuZ2V0X2RhdGEobmFtZSk7XG4gICAgaWYgKCFpbWFnZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBzaXplID0gaW1hZ2VbJ3NpemUnXTtcbiAgICByZWYgPSBzaXplLnNwbGl0KCd4JyksIHdpZHRoID0gcmVmWzBdLCBoZWlnaHQgPSByZWZbMV07XG4gICAgd2lkdGggPSBwYXJzZUludCh3aWR0aCk7XG4gICAgaGVpZ2h0ID0gcGFyc2VJbnQoaGVpZ2h0KTtcbiAgICByZXR1cm4gW3dpZHRoLCBoZWlnaHRdO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X3VybCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaW1hZ2U7XG4gICAgaW1hZ2UgPSB0aGlzLmdldF9kYXRhKG5hbWUpO1xuICAgIGlmICghaW1hZ2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGltYWdlWyd1cmwnXTtcbiAgfTtcblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF9vcl9mYWxzZSA9IGZ1bmN0aW9uKGtleSkge1xuICAgIGlmICh0aGlzLmRhdGFba2V5XSkge1xuICAgICAgcmV0dXJuIHRoaXMuZGF0YVtrZXldO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfcmF0aW8gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRfb3JfZmFsc2UoJ3JhdGlvJyk7XG4gIH07XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfdHlwZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldF9vcl9mYWxzZSgndHlwZScpO1xuICB9O1xuXG4gIHJldHVybiBJdGVtX0RhdGE7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gSXRlbV9EYXRhO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lTWFJsYlY5RVlYUmhMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaVNYUmxiVjlFWVhSaExtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeEpRVUZCT3p0QlFVRk5PMFZCUlZFc2JVSkJRVVVzUjBGQlJqdEJRVU5hTEZGQlFVRTdTVUZCUVN4SlFVRkRMRU5CUVVFc1IwRkJSQ3hIUVVGUE8wbEJRMUFzU1VGQlFTeEhRVUZQTEVkQlFVY3NRMEZCUXl4SlFVRktMRU5CUVZVc1RVRkJWanRKUVVWUUxFbEJRVWNzUTBGQlNTeEpRVUZRTzBGQlEwTXNXVUZCVlN4SlFVRkJMRXRCUVVFc1EwRkJUU3dyUTBGQlRpeEZRVVJZT3p0SlFVZEJMRWxCUVVNc1EwRkJRU3hKUVVGRUxFZEJRVkU3UlVGUVNUczdjMEpCVjJJc1VVRkJRU3hIUVVGVkxGTkJRVVVzU1VGQlJqdEJRVU5VTEZGQlFVRTdTVUZCUVN4TFFVRkJMRWRCUVZFc1NVRkJReXhEUVVGQkxFbEJRVTBzUTBGQlFTeFJRVUZCTEVOQlFWa3NRMEZCUVN4SlFVRkJPMGxCUXpOQ0xFbEJRV2RDTEVOQlFVa3NTMEZCY0VJN1FVRkJRU3hoUVVGUExFMUJRVkE3TzBGQlJVRXNWMEZCVHp0RlFVcEZPenR6UWtGTlZpeFJRVUZCTEVkQlFWVXNVMEZCUlN4SlFVRkdPMEZCUTFRc1VVRkJRVHRKUVVGQkxFdEJRVUVzUjBGQlVTeEpRVUZETEVOQlFVRXNVVUZCUkN4RFFVRlhMRWxCUVZnN1NVRkRVaXhKUVVGblFpeERRVUZKTEV0QlFYQkNPMEZCUVVFc1lVRkJUeXhOUVVGUU96dEpRVVZCTEVsQlFVRXNSMEZCVHl4TFFVRlBMRU5CUVVFc1RVRkJRVHRKUVVWa0xFMUJRV3RDTEVsQlFVa3NRMEZCUXl4TFFVRk1MRU5CUVZrc1IwRkJXaXhEUVVGc1FpeEZRVUZETEdOQlFVUXNSVUZCVVR0SlFVVlNMRXRCUVVFc1IwRkJVU3hSUVVGQkxFTkJRVlVzUzBGQlZqdEpRVU5TTEUxQlFVRXNSMEZCVXl4UlFVRkJMRU5CUVZVc1RVRkJWanRCUVVWVUxGZEJRVThzUTBGQlF5eExRVUZFTEVWQlFWRXNUVUZCVWp0RlFWaEZPenR6UWtGaFZpeFBRVUZCTEVkQlFWTXNVMEZCUlN4SlFVRkdPMEZCUTFJc1VVRkJRVHRKUVVGQkxFdEJRVUVzUjBGQlVTeEpRVUZETEVOQlFVRXNVVUZCUkN4RFFVRlhMRWxCUVZnN1NVRkRVaXhKUVVGblFpeERRVUZKTEV0QlFYQkNPMEZCUVVFc1lVRkJUeXhOUVVGUU96dEJRVU5CTEZkQlFVOHNTMEZCVHl4RFFVRkJMRXRCUVVFN1JVRklUanM3YzBKQlMxUXNXVUZCUVN4SFFVRmpMRk5CUVVVc1IwRkJSanRKUVVOaUxFbEJRVWNzU1VGQlF5eERRVUZCTEVsQlFVMHNRMEZCUVN4SFFVRkJMRU5CUVZZN1FVRkRReXhoUVVGUExFbEJRVU1zUTBGQlFTeEpRVUZOTEVOQlFVRXNSMEZCUVN4RlFVUm1PenRCUVVWQkxGZEJRVTg3UlVGSVRUczdjMEpCUzJRc1UwRkJRU3hIUVVGakxGTkJRVUU3VjBGQlJ5eEpRVUZETEVOQlFVRXNXVUZCUkN4RFFVRmxMRTlCUVdZN1JVRkJTRHM3YzBKQlEyUXNVVUZCUVN4SFFVRmpMRk5CUVVFN1YwRkJSeXhKUVVGRExFTkJRVUVzV1VGQlJDeERRVUZsTEUxQlFXWTdSVUZCU0RzN096czdPMEZCUjJZc1RVRkJUU3hEUVVGRExFOUJRVkFzUjBGQmFVSWlmUT09XG4iLCJcbi8qXG4gICAgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBIb29rcywgTGF6eV9Mb2FkZXI7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5MYXp5X0xvYWRlciA9IChmdW5jdGlvbigpIHtcbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLkVsZW1lbnRzID0ge1xuICAgIGl0ZW06ICdQUF9MYXp5X0ltYWdlJ1xuICB9O1xuXG4gIGZ1bmN0aW9uIExhenlfTG9hZGVyKGhhbmRsZXIpIHtcbiAgICB0aGlzLmhhbmRsZXIgPSBoYW5kbGVyO1xuICAgIHRoaXMuaGFuZGxlciA9IEhvb2tzLmFwcGx5RmlsdGVycygncHAubGF6eS5oYW5kbGVyJywgdGhpcy5oYW5kbGVyKTtcbiAgICBpZiAodGhpcy5oYW5kbGVyKSB7XG4gICAgICB0aGlzLnByZXBhcmUoKTtcbiAgICAgIHRoaXMubG9hZF9hbGwoKTtcbiAgICB9XG4gIH1cblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUucHJlcGFyZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciAkaXRlbXM7XG4gICAgJGl0ZW1zID0gJChcIi5cIiArIHRoaXMuRWxlbWVudHMuaXRlbSk7XG4gICAgcmV0dXJuICRpdGVtcy5lYWNoKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGtleSwgZWwpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzLmhhbmRsZXIucmVzaXplKGVsKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9O1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5sb2FkX2FsbCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciAkaXRlbXM7XG4gICAgJGl0ZW1zID0gJChcIi5cIiArIHRoaXMuRWxlbWVudHMuaXRlbSk7XG4gICAgcmV0dXJuICRpdGVtcy5lYWNoKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGtleSwgZWwpIHtcbiAgICAgICAgX3RoaXMuaGFuZGxlci5sb2FkKGVsKTtcbiAgICAgICAgcmV0dXJuIF90aGlzLnJlbW92ZV9wbGFjZWhvbGRlcihlbCk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfTtcblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUucmVtb3ZlX3BsYWNlaG9sZGVyID0gZnVuY3Rpb24oZWwpIHtcbiAgICB2YXIgJGVsO1xuICAgICRlbCA9ICQoZWwpO1xuICAgIHJldHVybiAkZWwuZmluZCgnLkxhenktSW1hZ2VfX3BsYWNlaG9sZGVyLCBub3NjcmlwdCcpLnJlbW92ZSgpO1xuICB9O1xuXG4gIHJldHVybiBMYXp5X0xvYWRlcjtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBMYXp5X0xvYWRlcjtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVEdGNmVWOU1iMkZrWlhJdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUpNWVhwNVgweHZZV1JsY2k1amIyWm1aV1VpWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanRCUVVGQk96czdRVUZCUVN4SlFVRkJPenRCUVVkQkxFTkJRVUVzUjBGQlNTeFBRVUZCTEVOQlFWTXNVVUZCVkRzN1FVRkRTaXhMUVVGQkxFZEJRVkVzVDBGQlFTeERRVUZUTEZWQlFWUTdPMEZCUlVZN2QwSkJSVXdzVVVGQlFTeEhRVU5ETzBsQlFVRXNTVUZCUVN4RlFVRk5MR1ZCUVU0N096dEZRVWRaTEhGQ1FVRkZMRTlCUVVZN1NVRkJSU3hKUVVGRExFTkJRVUVzVlVGQlJEdEpRVU5rTEVsQlFVTXNRMEZCUVN4UFFVRkVMRWRCUVZjc1MwRkJTeXhEUVVGRExGbEJRVTRzUTBGQmJVSXNhVUpCUVc1Q0xFVkJRWE5ETEVsQlFVTXNRMEZCUVN4UFFVRjJRenRKUVVWWUxFbEJRVWNzU1VGQlF5eERRVUZCTEU5QlFVbzdUVUZEUXl4SlFVRkRMRU5CUVVFc1QwRkJSQ3hEUVVGQk8wMUJRMEVzU1VGQlF5eERRVUZCTEZGQlFVUXNRMEZCUVN4RlFVWkVPenRGUVVoWk96dDNRa0ZQWWl4UFFVRkJMRWRCUVZNc1UwRkJRVHRCUVVOU0xGRkJRVUU3U1VGQlFTeE5RVUZCTEVkQlFWTXNRMEZCUVN4RFFVRkhMRWRCUVVFc1IwRkJTU3hKUVVGRExFTkJRVUVzVVVGQlVTeERRVUZETEVsQlFXcENPMWRCUlZRc1RVRkJUU3hEUVVGRExFbEJRVkFzUTBGQldTeERRVUZCTEZOQlFVRXNTMEZCUVR0aFFVRkJMRk5CUVVVc1IwRkJSaXhGUVVGUExFVkJRVkE3WlVGRFdDeExRVUZETEVOQlFVRXNUMEZCVHl4RFFVRkRMRTFCUVZRc1EwRkJhVUlzUlVGQmFrSTdUVUZFVnp0SlFVRkJMRU5CUVVFc1EwRkJRU3hEUVVGQkxFbEJRVUVzUTBGQldqdEZRVWhST3p0M1FrRk5WQ3hSUVVGQkxFZEJRVlVzVTBGQlFUdEJRVU5VTEZGQlFVRTdTVUZCUVN4TlFVRkJMRWRCUVZNc1EwRkJRU3hEUVVGSExFZEJRVUVzUjBGQlNTeEpRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRWxCUVdwQ08xZEJRMVFzVFVGQlRTeERRVUZETEVsQlFWQXNRMEZCV1N4RFFVRkJMRk5CUVVFc1MwRkJRVHRoUVVGQkxGTkJRVVVzUjBGQlJpeEZRVUZQTEVWQlFWQTdVVUZEV0N4TFFVRkRMRU5CUVVFc1QwRkJUeXhEUVVGRExFbEJRVlFzUTBGQlpTeEZRVUZtTzJWQlEwRXNTMEZCUXl4RFFVRkJMR3RDUVVGRUxFTkJRWEZDTEVWQlFYSkNPMDFCUmxjN1NVRkJRU3hEUVVGQkxFTkJRVUVzUTBGQlFTeEpRVUZCTEVOQlFWbzdSVUZHVXpzN2QwSkJUVllzYTBKQlFVRXNSMEZCYjBJc1UwRkJSU3hGUVVGR08wRkJRMjVDTEZGQlFVRTdTVUZCUVN4SFFVRkJMRWRCUVUwc1EwRkJRU3hEUVVGSExFVkJRVWc3VjBGRFRpeEhRVUZITEVOQlFVTXNTVUZCU2l4RFFVRlZMRzlEUVVGV0xFTkJRV2RFTEVOQlFVTXNUVUZCYWtRc1EwRkJRVHRGUVVadFFqczdPenM3TzBGQlMzSkNMRTFCUVUwc1EwRkJReXhQUVVGUUxFZEJRV2xDSW4wPVxuIiwidmFyICQsIEl0ZW1fRGF0YSwgTGF6eV9NYXNvbnJ5O1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuSXRlbV9EYXRhID0gcmVxdWlyZSgnLi9JdGVtX0RhdGEnKTtcblxuTGF6eV9NYXNvbnJ5ID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBMYXp5X01hc29ucnkoKSB7fVxuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24oZWwpIHtcbiAgICB2YXIgJGVsLCByYXRpbztcbiAgICAkZWwgPSAkKGVsKTtcbiAgICByYXRpbyA9IG5ldyBJdGVtX0RhdGEoJGVsKS5nZXRfcmF0aW8oKTtcbiAgICByZXR1cm4gJGVsLmNzcyh7XG4gICAgICAnbWluLWhlaWdodCc6IE1hdGguZmxvb3IodGhpcy5nZXRfd2lkdGgoKSAvIHJhdGlvKVxuICAgIH0pO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUuZ2V0X3dpZHRoID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICQoJy5QUF9NYXNvbnJ5X19zaXplcicpLndpZHRoKCk7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24oZWwpIHtcbiAgICB2YXIgJGVsLCAkaW1hZ2UsIGZ1bGwsIGltYWdlLCB0aHVtYjtcbiAgICAkZWwgPSAkKGVsKTtcbiAgICBpbWFnZSA9IG5ldyBJdGVtX0RhdGEoJGVsKTtcbiAgICB0aHVtYiA9IGltYWdlLmdldF91cmwoJ3RodW1iJyk7XG4gICAgZnVsbCA9IGltYWdlLmdldF91cmwoJ2Z1bGwnKTtcbiAgICAkZWwucHJlcGVuZChcIjxhIGhyZWY9XFxcIlwiICsgZnVsbCArIFwiXFxcIiByZWw9XFxcImdhbGxlcnlcXFwiPlxcbjxpbWcgc3JjPVxcXCJcIiArIHRodW1iICsgXCJcXFwiIGNsYXNzPVxcXCJpcy1sb2FkaW5nXFxcIiAvPlxcbjwvYT5cIikucmVtb3ZlQ2xhc3MoJ0xhenktSW1hZ2UnKTtcbiAgICAkaW1hZ2UgPSAkZWwuZmluZCgnaW1nJyk7XG4gICAgcmV0dXJuICRpbWFnZS5pbWFnZXNMb2FkZWQoZnVuY3Rpb24oKSB7XG4gICAgICAkaW1hZ2UuYWRkQ2xhc3MoJ2lzLWxvYWRlZCcpLnJlbW92ZUNsYXNzKCdpcy1sb2FkaW5nJyk7XG4gICAgICByZXR1cm4gJGVsLmNzcygnbWluLWhlaWdodCcsICcnKS5yZW1vdmVDbGFzcygnbGF6eS1pbWFnZScpO1xuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiBMYXp5X01hc29ucnk7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTGF6eV9NYXNvbnJ5O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lUR0Y2ZVY5TllYTnZibko1TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lUR0Y2ZVY5TllYTnZibko1TG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4SlFVRkJPenRCUVVGQkxFTkJRVUVzUjBGQlNTeFBRVUZCTEVOQlFWTXNVVUZCVkRzN1FVRkRTaXhUUVVGQkxFZEJRVmtzVDBGQlFTeERRVUZUTEdGQlFWUTdPMEZCUjA0N096dDVRa0ZGVEN4TlFVRkJMRWRCUVZFc1UwRkJSU3hGUVVGR08wRkJRMUFzVVVGQlFUdEpRVUZCTEVkQlFVRXNSMEZCVFN4RFFVRkJMRU5CUVVjc1JVRkJTRHRKUVVOT0xFdEJRVUVzUjBGQldTeEpRVUZCTEZOQlFVRXNRMEZCVnl4SFFVRllMRU5CUVdkQ0xFTkJRVU1zVTBGQmFrSXNRMEZCUVR0WFFVZGFMRWRCUVVjc1EwRkJReXhIUVVGS0xFTkJRME03VFVGQlFTeFpRVUZCTEVWQlFXTXNTVUZCU1N4RFFVRkRMRXRCUVV3c1EwRkJXU3hKUVVGRExFTkJRVUVzVTBGQlJDeERRVUZCTEVOQlFVRXNSMEZCWlN4TFFVRXpRaXhEUVVGa08wdEJSRVE3UlVGTVR6czdlVUpCVVZJc1UwRkJRU3hIUVVGWExGTkJRVUU3VjBGRlZpeERRVUZCTEVOQlFVY3NiMEpCUVVnc1EwRkJlVUlzUTBGQlF5eExRVUV4UWl4RFFVRkJPMFZCUmxVN08zbENRVXRZTEVsQlFVRXNSMEZCVFN4VFFVRkZMRVZCUVVZN1FVRkRUQ3hSUVVGQk8wbEJRVUVzUjBGQlFTeEhRVUZOTEVOQlFVRXNRMEZCUnl4RlFVRklPMGxCUlU0c1MwRkJRU3hIUVVGWkxFbEJRVUVzVTBGQlFTeERRVUZYTEVkQlFWZzdTVUZEV2l4TFFVRkJMRWRCUVZFc1MwRkJTeXhEUVVGRExFOUJRVTRzUTBGQlpTeFBRVUZtTzBsQlExSXNTVUZCUVN4SFFVRlBMRXRCUVVzc1EwRkJReXhQUVVGT0xFTkJRV01zVFVGQlpEdEpRVVZRTEVkQlEwRXNRMEZCUXl4UFFVUkVMRU5CUTFVc1dVRkJRU3hIUVVOSExFbEJSRWdzUjBGRFVTeHJRMEZFVWl4SFFVVkpMRXRCUmtvc1IwRkZWU3hyUTBGSWNFSXNRMEZOUVN4RFFVRkRMRmRCVGtRc1EwRk5ZeXhaUVU1a08wbEJVMEVzVFVGQlFTeEhRVUZUTEVkQlFVY3NRMEZCUXl4SlFVRktMRU5CUVZVc1MwRkJWanRYUVVWVUxFMUJRVTBzUTBGQlF5eFpRVUZRTEVOQlFXOUNMRk5CUVVFN1RVRkRia0lzVFVGQlRTeERRVUZETEZGQlFWQXNRMEZCYVVJc1YwRkJha0lzUTBGQk9FSXNRMEZCUXl4WFFVRXZRaXhEUVVFMFF5eFpRVUUxUXp0aFFVTkJMRWRCUTBFc1EwRkJReXhIUVVSRUxFTkJRMDBzV1VGRVRpeEZRVU52UWl4RlFVUndRaXhEUVVWQkxFTkJRVU1zVjBGR1JDeERRVVZqTEZsQlJtUTdTVUZHYlVJc1EwRkJjRUk3UlVGc1FrczdPenM3T3p0QlFUSkNVQ3hOUVVGTkxFTkJRVU1zVDBGQlVDeEhRVUZwUWlKOVxuIiwidmFyICQsIEhvb2tzLCBMYXp5X0xvYWRlciwgTGF6eV9NYXNvbnJ5LCBNYXNvbnJ5O1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuTWFzb25yeSA9IHJlcXVpcmUoJy4vY2xhc3MvTWFzb25yeScpO1xuXG5MYXp5X0xvYWRlciA9IHJlcXVpcmUoJy4vbGF6eS9MYXp5X0xvYWRlcicpO1xuXG5MYXp5X01hc29ucnkgPSByZXF1aXJlKCcuL2xhenkvTGF6eV9NYXNvbnJ5Jyk7XG5cbkhvb2tzLmFkZEFjdGlvbigncHAubWFzb25yeS5zdGFydC9iZWZvcmUnLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBMYXp5X0xvYWRlcihuZXcgTGF6eV9NYXNvbnJ5KCkpO1xufSk7XG5cbkhvb2tzLmFkZEFjdGlvbigncHAucmVhZHknLCBmdW5jdGlvbigpIHtcbiAgaWYgKCQoJy5QUF9NYXNvbnJ5JykubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiBIb29rcy5hZGRGaWx0ZXIoJ3BwLnBvcnRmb2xpby5oYW5kbGVyJywgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IE1hc29ucnkoKTtcbiAgICB9KTtcbiAgfVxufSk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWJXRnpiMjV5ZVM1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJbTFoYzI5dWNua3VZMjltWm1WbElsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lKQlFVRkJMRWxCUVVFN08wRkJRVUVzUTBGQlFTeEhRVUZKTEU5QlFVRXNRMEZCVXl4UlFVRlVPenRCUVVOS0xFdEJRVUVzUjBGQlVTeFBRVUZCTEVOQlFWTXNWVUZCVkRzN1FVRkRVaXhQUVVGQkxFZEJRVlVzVDBGQlFTeERRVUZUTEdsQ1FVRlVPenRCUVVOV0xGZEJRVUVzUjBGQll5eFBRVUZCTEVOQlFWTXNiMEpCUVZRN08wRkJRMlFzV1VGQlFTeEhRVUZsTEU5QlFVRXNRMEZCVXl4eFFrRkJWRHM3UVVGRlppeExRVUZMTEVOQlFVTXNVMEZCVGl4RFFVRm5RaXg1UWtGQmFFSXNSVUZCTWtNc1UwRkJRVHRUUVVOMFF5eEpRVUZCTEZkQlFVRXNRMEZCYVVJc1NVRkJRU3haUVVGQkxFTkJRVUVzUTBGQmFrSTdRVUZFYzBNc1EwRkJNME03TzBGQlNVRXNTMEZCU3l4RFFVRkRMRk5CUVU0c1EwRkJaMElzVlVGQmFFSXNSVUZCTkVJc1UwRkJRVHRGUVVNelFpeEpRVUZITEVOQlFVRXNRMEZCUnl4aFFVRklMRU5CUVd0Q0xFTkJRVU1zVFVGQmJrSXNSMEZCTkVJc1EwRkJMMEk3VjBGRFF5eExRVUZMTEVOQlFVTXNVMEZCVGl4RFFVRm5RaXh6UWtGQmFFSXNSVUZCZDBNc1UwRkJRVHRoUVVGUExFbEJRVUVzVDBGQlFTeERRVUZCTzBsQlFWQXNRMEZCZUVNc1JVRkVSRHM3UVVGRU1rSXNRMEZCTlVJaWZRPT1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
