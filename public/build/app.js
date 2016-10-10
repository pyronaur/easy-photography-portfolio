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
    item: 'PP_Lazy_Image',
    placeholder: 'PP_Lazy_Image__placeholder'
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
    return $el.find("." + this.Elements.placeholder + ", noscript").remove();
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


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jbGFzcy9NYXNvbnJ5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jbGFzcy9Qb3J0Zm9saW8uY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2NsYXNzL1N0YXRlX01hbmFnZXIuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvSXRlbV9EYXRhLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0xhenlfTG9hZGVyLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0xhenlfTWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvbWFzb25yeS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbi8qXG4gICAgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciBBcHBfU3RhdGUsIEhvb2tzLCBQb3J0Zm9saW8sIFN0YXRlX01hbmFnZXI7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cblBvcnRmb2xpbyA9IHJlcXVpcmUoJy4vY2xhc3MvUG9ydGZvbGlvJyk7XG5cblN0YXRlX01hbmFnZXIgPSByZXF1aXJlKCcuL2NsYXNzL1N0YXRlX01hbmFnZXInKTtcblxuQXBwX1N0YXRlID0gbmV3IFN0YXRlX01hbmFnZXIoKTtcblxuSG9va3MuYWRkQWN0aW9uKCdwcC5sb2FkZWQnLCBmdW5jdGlvbigpIHtcbiAgdmFyIHBvcnRmb2xpbztcbiAgcmV0dXJuIHBvcnRmb2xpbyA9IG5ldyBQb3J0Zm9saW8oKTtcbn0pO1xuXG5yZXF1aXJlKCcuL21hc29ucnknKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pWVhCd0xtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpWVhCd0xtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pTzBGQlFVRTdPenRCUVVGQkxFbEJRVUU3TzBGQlIwRXNTMEZCUVN4SFFVRlJMRTlCUVVFc1EwRkJVeXhWUVVGVU96dEJRVU5TTEZOQlFVRXNSMEZCV1N4UFFVRkJMRU5CUVZNc2JVSkJRVlE3TzBGQlExb3NZVUZCUVN4SFFVRm5RaXhQUVVGQkxFTkJRVk1zZFVKQlFWUTdPMEZCUjJoQ0xGTkJRVUVzUjBGQlowSXNTVUZCUVN4aFFVRkJMRU5CUVVFN08wRkJTV2hDTEV0QlFVc3NRMEZCUXl4VFFVRk9MRU5CUVdkQ0xGZEJRV2hDTEVWQlFUWkNMRk5CUVVFN1FVRkROVUlzVFVGQlFUdFRRVUZCTEZOQlFVRXNSMEZCWjBJc1NVRkJRU3hUUVVGQkxFTkJRVUU3UVVGRVdTeERRVUUzUWpzN1FVRkpRU3hQUVVGQkxFTkJRVkVzVjBGQlVpSjlcbiIsIlxuLypcbiAgICBEZXBlbmRlbmNpZXNcbiAqL1xudmFyICQsIEhvb2tzLCBNYXNvbnJ5LFxuICBiaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbk1hc29ucnkgPSAoZnVuY3Rpb24oKSB7XG4gIE1hc29ucnkucHJvdG90eXBlLkVsZW1lbnRzID0ge1xuICAgIGNvbnRhaW5lcjogJ1BQX01hc29ucnknLFxuICAgIHNpemVyOiAnUFBfTWFzb25yeV9fc2l6ZXInLFxuICAgIGl0ZW06ICdQUF9NYXNvbnJ5X19pdGVtJ1xuICB9O1xuXG4gIGZ1bmN0aW9uIE1hc29ucnkoJHBhcmVudCkge1xuICAgIGlmICgkcGFyZW50ID09IG51bGwpIHtcbiAgICAgICRwYXJlbnQgPSAkKGRvY3VtZW50KTtcbiAgICB9XG4gICAgdGhpcy5yZWZyZXNoID0gYmluZCh0aGlzLnJlZnJlc2gsIHRoaXMpO1xuICAgIHRoaXMuZGVzdHJveSA9IGJpbmQodGhpcy5kZXN0cm95LCB0aGlzKTtcbiAgICB0aGlzLmNyZWF0ZSA9IGJpbmQodGhpcy5jcmVhdGUsIHRoaXMpO1xuICAgIHRoaXMuJGNvbnRhaW5lciA9ICRwYXJlbnQuZmluZChcIi5cIiArIHRoaXMuRWxlbWVudHMuY29udGFpbmVyKTtcbiAgICB0aGlzLmNyZWF0ZSgpO1xuICB9XG5cbiAgTWFzb25yeS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuJGNvbnRhaW5lci5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy4kY29udGFpbmVyLmFkZENsYXNzKCdpcy1wcmVwYXJpbmctbWFzb25yeScpO1xuICAgIHRoaXMubWF5YmVfY3JlYXRlX3NpemVyKCk7XG4gICAgSG9va3MuZG9BY3Rpb24oJ3BwLm1hc29ucnkuc3RhcnQvYmVmb3JlJyk7XG4gICAgdGhpcy4kY29udGFpbmVyLm1hc29ucnkoe1xuICAgICAgaXRlbVNlbGVjdG9yOiBcIi5cIiArIHRoaXMuRWxlbWVudHMuaXRlbSxcbiAgICAgIGNvbHVtbldpZHRoOiBcIi5cIiArIHRoaXMuRWxlbWVudHMuc2l6ZXIsXG4gICAgICBndXR0ZXI6IDAsXG4gICAgICBpbml0TGF5b3V0OiBmYWxzZVxuICAgIH0pO1xuICAgIHRoaXMuJGNvbnRhaW5lci5tYXNvbnJ5KCdvbicsICdsYXlvdXRDb21wbGV0ZScsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBfdGhpcy4kY29udGFpbmVyLnJlbW92ZUNsYXNzKCdpcy1wcmVwYXJpbmctbWFzb25yeScpO1xuICAgICAgICByZXR1cm4gSG9va3MuZG9BY3Rpb24oJ3BwLm1hc29ucnkuc3RhcnQvY29tcGxldGUnKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHRoaXMuJGNvbnRhaW5lci5tYXNvbnJ5KCk7XG4gICAgSG9va3MuZG9BY3Rpb24oJ3BwLm1hc29ucnkuc3RhcnQvbGF5b3V0Jyk7XG4gIH07XG5cbiAgTWFzb25yeS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMubWF5YmVfcmVtb3ZlX3NpemVyKCk7XG4gICAgaWYgKHRoaXMuJGNvbnRhaW5lci5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLiRjb250YWluZXIubWFzb25yeSgnZGVzdHJveScpO1xuICAgIH1cbiAgfTtcblxuICBNYXNvbnJ5LnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuJGNvbnRhaW5lci5tYW9zbnJ5KCdsYXlvdXQnKTtcbiAgfTtcblxuXG4gIC8qXG4gIFxuICBcdFx0Q3JlYXRlIGEgc2l6ZXIgZWxlbWVudCBmb3IganF1ZXJ5LW1hc29ucnkgdG8gdXNlXG4gICAqL1xuXG4gIE1hc29ucnkucHJvdG90eXBlLm1heWJlX2NyZWF0ZV9zaXplciA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnNpemVyX2RvZXNudF9leGlzdCgpKSB7XG4gICAgICB0aGlzLmNyZWF0ZV9zaXplcigpO1xuICAgIH1cbiAgfTtcblxuICBNYXNvbnJ5LnByb3RvdHlwZS5tYXliZV9yZW1vdmVfc2l6ZXIgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy4kY29udGFpbmVyLmxlbmd0aCAhPT0gMSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLiRjb250YWluZXIuZmluZChcIi5cIiArIHRoaXMuRWxlbWVudHMuc2l6ZXIpLnJlbW92ZSgpO1xuICB9O1xuXG4gIE1hc29ucnkucHJvdG90eXBlLnNpemVyX2RvZXNudF9leGlzdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLiRjb250YWluZXIuZmluZChcIi5cIiArIHRoaXMuRWxlbWVudHMuc2l6ZXIpLmxlbmd0aCA9PT0gMDtcbiAgfTtcblxuICBNYXNvbnJ5LnByb3RvdHlwZS5jcmVhdGVfc2l6ZXIgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRjb250YWluZXIuYXBwZW5kKFwiPGRpdiBjbGFzcz1cXFwiXCIgKyB0aGlzLkVsZW1lbnRzLnNpemVyICsgXCJcXFwiPjwvZGl2PlwiKTtcbiAgfTtcblxuICByZXR1cm4gTWFzb25yeTtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNYXNvbnJ5O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lUV0Z6YjI1eWVTNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSWsxaGMyOXVjbmt1WTI5bVptVmxJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSTdRVUZCUVRzN08wRkJRVUVzU1VGQlFTeHBRa0ZCUVR0RlFVRkJPenRCUVVkQkxFTkJRVUVzUjBGQlNTeFBRVUZCTEVOQlFWTXNVVUZCVkRzN1FVRkRTaXhMUVVGQkxFZEJRVkVzVDBGQlFTeERRVUZUTEZWQlFWUTdPMEZCUlVZN2IwSkJSVXdzVVVGQlFTeEhRVU5ETzBsQlFVRXNVMEZCUVN4RlFVRlhMRmxCUVZnN1NVRkRRU3hMUVVGQkxFVkJRVmNzYlVKQlJGZzdTVUZGUVN4SlFVRkJMRVZCUVZjc2EwSkJSbGc3T3p0RlFVOVpMR2xDUVVGRkxFOUJRVVk3TzAxQlFVVXNWVUZCVlN4RFFVRkJMRU5CUVVjc1VVRkJTRHM3T3pzN1NVRkRlRUlzU1VGQlF5eERRVUZCTEZWQlFVUXNSMEZCWXl4UFFVRlBMRU5CUVVNc1NVRkJVaXhEUVVGakxFZEJRVUVzUjBGQlNTeEpRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRk5CUVRWQ08wbEJSV1FzU1VGQlF5eERRVUZCTEUxQlFVUXNRMEZCUVR0RlFVaFpPenR2UWtGTllpeE5RVUZCTEVkQlFWRXNVMEZCUVR0SlFVTlFMRWxCUVZVc1NVRkJReXhEUVVGQkxGVkJRVlVzUTBGQlF5eE5RVUZhTEV0QlFYTkNMRU5CUVdoRE8wRkJRVUVzWVVGQlFUczdTVUZGUVN4SlFVRkRMRU5CUVVFc1ZVRkJWU3hEUVVGRExGRkJRVm9zUTBGQmMwSXNjMEpCUVhSQ08wbEJSVUVzU1VGQlF5eERRVUZCTEd0Q1FVRkVMRU5CUVVFN1NVRkRRU3hMUVVGTExFTkJRVU1zVVVGQlRpeERRVUZsTEhsQ1FVRm1PMGxCUjBFc1NVRkJReXhEUVVGQkxGVkJRVlVzUTBGQlF5eFBRVUZhTEVOQlEwTTdUVUZCUVN4WlFVRkJMRVZCUVdNc1IwRkJRU3hIUVVGSkxFbEJRVU1zUTBGQlFTeFJRVUZSTEVOQlFVTXNTVUZCTlVJN1RVRkRRU3hYUVVGQkxFVkJRV01zUjBGQlFTeEhRVUZKTEVsQlFVTXNRMEZCUVN4UlFVRlJMRU5CUVVNc1MwRkVOVUk3VFVGRlFTeE5RVUZCTEVWQlFXTXNRMEZHWkR0TlFVZEJMRlZCUVVFc1JVRkJZeXhMUVVoa08wdEJSRVE3U1VGUFFTeEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRTlCUVZvc1EwRkJiMElzU1VGQmNFSXNSVUZCTUVJc1owSkJRVEZDTEVWQlFUUkRMRU5CUVVFc1UwRkJRU3hMUVVGQk8yRkJRVUVzVTBGQlFUdFJRVU16UXl4TFFVRkRMRU5CUVVFc1ZVRkJWU3hEUVVGRExGZEJRVm9zUTBGQmVVSXNjMEpCUVhwQ08yVkJRMEVzUzBGQlN5eERRVUZETEZGQlFVNHNRMEZCWlN3eVFrRkJaanROUVVZeVF6dEpRVUZCTEVOQlFVRXNRMEZCUVN4RFFVRkJMRWxCUVVFc1EwRkJOVU03U1VGTFFTeEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRTlCUVZvc1EwRkJRVHRKUVVOQkxFdEJRVXNzUTBGQlF5eFJRVUZPTEVOQlFXVXNlVUpCUVdZN1JVRjBRazg3TzI5Q1FUUkNVaXhQUVVGQkxFZEJRVk1zVTBGQlFUdEpRVU5TTEVsQlFVTXNRMEZCUVN4clFrRkJSQ3hEUVVGQk8wbEJSVUVzU1VGQlJ5eEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRTFCUVZvc1IwRkJjVUlzUTBGQmVFSTdUVUZEUXl4SlFVRkRMRU5CUVVFc1ZVRkJWU3hEUVVGRExFOUJRVm9zUTBGQmNVSXNVMEZCY2tJc1JVRkVSRHM3UlVGSVVUczdiMEpCVTFRc1QwRkJRU3hIUVVGVExGTkJRVUU3VjBGRFVpeEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRTlCUVZvc1EwRkJjVUlzVVVGQmNrSTdSVUZFVVRzN08wRkJSMVE3T3pzN08yOUNRVXRCTEd0Q1FVRkJMRWRCUVc5Q0xGTkJRVUU3U1VGRGJrSXNTVUZCYlVJc1NVRkJReXhEUVVGQkxHdENRVUZFTEVOQlFVRXNRMEZCYmtJN1RVRkJRU3hKUVVGRExFTkJRVUVzV1VGQlJDeERRVUZCTEVWQlFVRTdPMFZCUkcxQ096dHZRa0ZKY0VJc2EwSkJRVUVzUjBGQmIwSXNVMEZCUVR0SlFVTnVRaXhKUVVGVkxFbEJRVU1zUTBGQlFTeFZRVUZWTEVOQlFVTXNUVUZCV2l4TFFVRjNRaXhEUVVGc1F6dEJRVUZCTEdGQlFVRTdPMGxCUTBFc1NVRkJReXhEUVVGQkxGVkJRVlVzUTBGQlF5eEpRVUZhTEVOQlFXdENMRWRCUVVFc1IwRkJTU3hKUVVGRExFTkJRVUVzVVVGQlVTeERRVUZETEV0QlFXaERMRU5CUVhsRExFTkJRVU1zVFVGQk1VTXNRMEZCUVR0RlFVWnRRanM3YjBKQlMzQkNMR3RDUVVGQkxFZEJRVzlDTEZOQlFVRTdWMEZCUnl4SlFVRkRMRU5CUVVFc1ZVRkJWU3hEUVVGRExFbEJRVm9zUTBGQmEwSXNSMEZCUVN4SFFVRkpMRWxCUVVNc1EwRkJRU3hSUVVGUkxFTkJRVU1zUzBGQmFFTXNRMEZCZVVNc1EwRkJReXhOUVVFeFF5eExRVUZ2UkR0RlFVRjJSRHM3YjBKQlIzQkNMRmxCUVVFc1IwRkJZeXhUUVVGQk8wbEJRMklzU1VGQlF5eERRVUZCTEZWQlFWVXNRMEZCUXl4TlFVRmFMRU5CUVcxQ0xHVkJRVUVzUjBGQmFVSXNTVUZCUXl4RFFVRkJMRkZCUVZFc1EwRkJReXhMUVVFelFpeEhRVUZwUXl4WFFVRndSRHRGUVVSaE96czdPenM3UVVGTlppeE5RVUZOTEVOQlFVTXNUMEZCVUN4SFFVRnBRaUo5XG4iLCJ2YXIgSG9va3MsIFBvcnRmb2xpbztcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuUG9ydGZvbGlvID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBQb3J0Zm9saW8oKSB7XG5cbiAgICAvKlxuICAgICAgXHRcdEV2ZW50IEJhc2VkIFBvcnRmb2xpbyBpcyBnb2luZyB0byBzdGFydCBzb29uXG4gICAgICovXG4gICAgdGhpcy5oYW5kbGVyID0gSG9va3MuYXBwbHlGaWx0ZXJzKCdwcC5wb3J0Zm9saW8uaGFuZGxlcicsIGZhbHNlKTtcbiAgICBpZiAodGhpcy5oYW5kbGVyKSB7XG4gICAgICBIb29rcy5hZGRBY3Rpb24oJ3BwLnBvcnRmb2xpby5jcmVhdGUnLCB0aGlzLmhhbmRsZXIuY3JlYXRlLCA1MCk7XG4gICAgICBIb29rcy5hZGRBY3Rpb24oJ3BwLnBvcnRmb2xpby5yZWZyZXNoJywgdGhpcy5oYW5kbGVyLnJlZnJlc2gsIDUwKTtcbiAgICAgIEhvb2tzLmFkZEFjdGlvbigncHAucG9ydGZvbGlvLmRlc3Ryb3knLCB0aGlzLmhhbmRsZXIuZGVzdHJveSwgNTApO1xuICAgICAgSG9va3MuYWRkQWN0aW9uKCdwcC5wb3J0Zm9saW8uZGVzdHJveScsIHRoaXMuYXV0b19kZXN0cm95LCA1MDApO1xuICAgIH1cbiAgfVxuXG4gIFBvcnRmb2xpby5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MuZG9BY3Rpb24oJ3BwLnBvcnRmb2xpby5jcmVhdGUnKTtcbiAgfTtcblxuICBQb3J0Zm9saW8ucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbigpIHtcbiAgICBIb29rcy5kb0FjdGlvbigncHAucG9ydGZvbGlvLnJlZnJlc2gnKTtcbiAgfTtcblxuICBQb3J0Zm9saW8ucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICBIb29rcy5kb0FjdGlvbigncHAucG9ydGZvbGlvLmRlc3Ryb3knKTtcbiAgfTtcblxuICBQb3J0Zm9saW8ucHJvdG90eXBlLmF1dG9fZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLnJlbW92ZUFjdGlvbigncHAucG9ydGZvbGlvLmNyZWF0ZScsIHRoaXMuaGFuZGxlci5jcmVhdGUsIDUwKTtcbiAgICBIb29rcy5yZW1vdmVBY3Rpb24oJ3BwLnBvcnRmb2xpby5yZWZyZXNoJywgdGhpcy5oYW5kbGVyLnJlZnJlc2gsIDUwKTtcbiAgICByZXR1cm4gSG9va3MucmVtb3ZlQWN0aW9uKCdwcC5wb3J0Zm9saW8uZGVzdHJveScsIHRoaXMuaGFuZGxlci5kZXN0cm95LCA1MCk7XG4gIH07XG5cbiAgcmV0dXJuIFBvcnRmb2xpbztcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW87XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVVHOXlkR1p2YkdsdkxtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpVUc5eWRHWnZiR2x2TG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4SlFVRkJPenRCUVVGQkxFdEJRVUVzUjBGQlVTeFBRVUZCTEVOQlFWTXNWVUZCVkRzN1FVRkZSanRGUVVWUkxHMUNRVUZCT3p0QlFVTmFPenM3U1VGSFFTeEpRVUZETEVOQlFVRXNUMEZCUkN4SFFVRlhMRXRCUVVzc1EwRkJReXhaUVVGT0xFTkJRVzFDTEhOQ1FVRnVRaXhGUVVFeVF5eExRVUV6UXp0SlFVVllMRWxCUVVjc1NVRkJReXhEUVVGQkxFOUJRVW83VFVGRlF5eExRVUZMTEVOQlFVTXNVMEZCVGl4RFFVRm5RaXh4UWtGQmFFSXNSVUZCZFVNc1NVRkJReXhEUVVGQkxFOUJRVThzUTBGQlF5eE5RVUZvUkN4RlFVRjNSQ3hGUVVGNFJEdE5RVU5CTEV0QlFVc3NRMEZCUXl4VFFVRk9MRU5CUVdkQ0xITkNRVUZvUWl4RlFVRjNReXhKUVVGRExFTkJRVUVzVDBGQlR5eERRVUZETEU5QlFXcEVMRVZCUVRCRUxFVkJRVEZFTzAxQlEwRXNTMEZCU3l4RFFVRkRMRk5CUVU0c1EwRkJaMElzYzBKQlFXaENMRVZCUVhkRExFbEJRVU1zUTBGQlFTeFBRVUZQTEVOQlFVTXNUMEZCYWtRc1JVRkJNRVFzUlVGQk1VUTdUVUZIUVN4TFFVRkxMRU5CUVVNc1UwRkJUaXhEUVVGblFpeHpRa0ZCYUVJc1JVRkJkME1zU1VGQlF5eERRVUZCTEZsQlFYcERMRVZCUVhWRUxFZEJRWFpFTEVWQlVFUTdPMFZCVGxrN08zTkNRV1ZpTEUxQlFVRXNSMEZCVVN4VFFVRkJPMGxCUTFBc1MwRkJTeXhEUVVGRExGRkJRVTRzUTBGQlpTeHhRa0ZCWmp0RlFVUlBPenR6UWtGTFVpeFBRVUZCTEVkQlFWTXNVMEZCUVR0SlFVTlNMRXRCUVVzc1EwRkJReXhSUVVGT0xFTkJRV1VzYzBKQlFXWTdSVUZFVVRzN2MwSkJTMVFzVDBGQlFTeEhRVUZUTEZOQlFVRTdTVUZGVWl4TFFVRkxMRU5CUVVNc1VVRkJUaXhEUVVGbExITkNRVUZtTzBWQlJsRTdPM05DUVV0VUxGbEJRVUVzUjBGQll5eFRRVUZCTzBsQlJXSXNTMEZCU3l4RFFVRkRMRmxCUVU0c1EwRkJiVUlzY1VKQlFXNUNMRVZCUVRCRExFbEJRVU1zUTBGQlFTeFBRVUZQTEVOQlFVTXNUVUZCYmtRc1JVRkJNa1FzUlVGQk0wUTdTVUZEUVN4TFFVRkxMRU5CUVVNc1dVRkJUaXhEUVVGdFFpeHpRa0ZCYmtJc1JVRkJNa01zU1VGQlF5eERRVUZCTEU5QlFVOHNRMEZCUXl4UFFVRndSQ3hGUVVFMlJDeEZRVUUzUkR0WFFVTkJMRXRCUVVzc1EwRkJReXhaUVVGT0xFTkJRVzFDTEhOQ1FVRnVRaXhGUVVFeVF5eEpRVUZETEVOQlFVRXNUMEZCVHl4RFFVRkRMRTlCUVhCRUxFVkJRVFpFTEVWQlFUZEVPMFZCU21FN096czdPenRCUVU5bUxFMUJRVTBzUTBGQlF5eFBRVUZRTEVkQlFXbENJbjA9XG4iLCJcbi8qXG4gICAgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBIb29rcywgU3RhdGVfTWFuYWdlcixcbiAgYmluZCA9IGZ1bmN0aW9uKGZuLCBtZSl7IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7IH07IH07XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5TdGF0ZV9NYW5hZ2VyID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBTdGF0ZV9NYW5hZ2VyKCkge1xuICAgIHRoaXMubG9hZGVkID0gYmluZCh0aGlzLmxvYWRlZCwgdGhpcyk7XG4gICAgdGhpcy5yZWFkeSA9IGJpbmQodGhpcy5yZWFkeSwgdGhpcyk7XG4gICAgdGhpcy4kZG9jID0gJChkb2N1bWVudCk7XG4gICAgdGhpcy4kZG9jLm9uKCdyZWFkeScsIHRoaXMucmVhZHkpO1xuICAgIHRoaXMuJGRvYy5maW5kKCcucHAtd3JhcHBlcicpLmltYWdlc0xvYWRlZCh0aGlzLmxvYWRlZCk7XG4gIH1cblxuICBTdGF0ZV9NYW5hZ2VyLnByb3RvdHlwZS5yZWFkeSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0cmlnZ2VyO1xuICAgIHRyaWdnZXIgPSB0cnVlO1xuICAgIGlmIChIb29rcy5hcHBseUZpbHRlcnMoJ3BwLnJlYWR5JywgdHJ1ZSkpIHtcbiAgICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5yZWFkeScpO1xuICAgIH1cbiAgfTtcblxuICBTdGF0ZV9NYW5hZ2VyLnByb3RvdHlwZS5sb2FkZWQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdHJpZ2dlcjtcbiAgICB0cmlnZ2VyID0gdHJ1ZTtcbiAgICBpZiAoSG9va3MuYXBwbHlGaWx0ZXJzKCdwcC5sb2FkZWQnLCB0cnVlKSkge1xuICAgICAgSG9va3MuZG9BY3Rpb24oJ3BwLmxvYWRlZCcpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gU3RhdGVfTWFuYWdlcjtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdGF0ZV9NYW5hZ2VyO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lVM1JoZEdWZlRXRnVZV2RsY2k1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJbE4wWVhSbFgwMWhibUZuWlhJdVkyOW1abVZsSWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUk3UVVGQlFUczdPMEZCUVVFc1NVRkJRU3gxUWtGQlFUdEZRVUZCT3p0QlFVZEJMRU5CUVVFc1IwRkJTU3hQUVVGQkxFTkJRVk1zVVVGQlZEczdRVUZEU2l4TFFVRkJMRWRCUVZFc1QwRkJRU3hEUVVGVExGVkJRVlE3TzBGQlIwWTdSVUZGVVN4MVFrRkJRVHM3TzBsQlExb3NTVUZCUXl4RFFVRkJMRWxCUVVRc1IwRkJVU3hEUVVGQkxFTkJRVWNzVVVGQlNEdEpRVWRTTEVsQlFVTXNRMEZCUVN4SlFVRkpMRU5CUVVNc1JVRkJUaXhEUVVGVExFOUJRVlFzUlVGQmEwSXNTVUZCUXl4RFFVRkJMRXRCUVc1Q08wbEJRMEVzU1VGQlF5eERRVUZCTEVsQlFVa3NRMEZCUXl4SlFVRk9MRU5CUVZrc1lVRkJXaXhEUVVFeVFpeERRVUZETEZsQlFUVkNMRU5CUVRCRExFbEJRVU1zUTBGQlFTeE5RVUV6UXp0RlFVeFpPenN3UWtGUllpeExRVUZCTEVkQlFVOHNVMEZCUVR0QlFVTk9MRkZCUVVFN1NVRkJRU3hQUVVGQkxFZEJRVlU3U1VGRlZpeEpRVUZITEV0QlFVc3NRMEZCUXl4WlFVRk9MRU5CUVcxQ0xGVkJRVzVDTEVWQlFTdENMRWxCUVM5Q0xFTkJRVWc3VFVGRFF5eExRVUZMTEVOQlFVTXNVVUZCVGl4RFFVRmxMRlZCUVdZc1JVRkVSRHM3UlVGSVRUczdNRUpCVVZBc1RVRkJRU3hIUVVGUkxGTkJRVUU3UVVGRFVDeFJRVUZCTzBsQlFVRXNUMEZCUVN4SFFVRlZPMGxCUlZZc1NVRkJSeXhMUVVGTExFTkJRVU1zV1VGQlRpeERRVUZ0UWl4WFFVRnVRaXhGUVVGblF5eEpRVUZvUXl4RFFVRklPMDFCUTBNc1MwRkJTeXhEUVVGRExGRkJRVTRzUTBGQlpTeFhRVUZtTEVWQlJFUTdPMFZCU0U4N096czdPenRCUVZOVUxFMUJRVTBzUTBGQlF5eFBRVUZRTEVkQlFXbENJbjA9XG4iLCJ2YXIgSXRlbV9EYXRhO1xuXG5JdGVtX0RhdGEgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIEl0ZW1fRGF0YSgkZWwpIHtcbiAgICB2YXIgZGF0YTtcbiAgICB0aGlzLiRlbCA9ICRlbDtcbiAgICBkYXRhID0gJGVsLmRhdGEoJ2l0ZW0nKTtcbiAgICBpZiAoIWRhdGEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkVsZW1lbnQgZG9lc24ndCBjb250YWluIGBkYXRhLWl0ZW1gIGF0dHJpYnV0ZVwiKTtcbiAgICB9XG4gICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgfVxuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X2RhdGEgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGltYWdlO1xuICAgIGltYWdlID0gdGhpcy5kYXRhWydpbWFnZXMnXVtuYW1lXTtcbiAgICBpZiAoIWltYWdlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBpbWFnZTtcbiAgfTtcblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF9zaXplID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBoZWlnaHQsIGltYWdlLCByZWYsIHNpemUsIHdpZHRoO1xuICAgIGltYWdlID0gdGhpcy5nZXRfZGF0YShuYW1lKTtcbiAgICBpZiAoIWltYWdlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHNpemUgPSBpbWFnZVsnc2l6ZSddO1xuICAgIHJlZiA9IHNpemUuc3BsaXQoJ3gnKSwgd2lkdGggPSByZWZbMF0sIGhlaWdodCA9IHJlZlsxXTtcbiAgICB3aWR0aCA9IHBhcnNlSW50KHdpZHRoKTtcbiAgICBoZWlnaHQgPSBwYXJzZUludChoZWlnaHQpO1xuICAgIHJldHVybiBbd2lkdGgsIGhlaWdodF07XG4gIH07XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfdXJsID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBpbWFnZTtcbiAgICBpbWFnZSA9IHRoaXMuZ2V0X2RhdGEobmFtZSk7XG4gICAgaWYgKCFpbWFnZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gaW1hZ2VbJ3VybCddO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X29yX2ZhbHNlID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKHRoaXMuZGF0YVtrZXldKSB7XG4gICAgICByZXR1cm4gdGhpcy5kYXRhW2tleV07XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF9yYXRpbyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldF9vcl9mYWxzZSgncmF0aW8nKTtcbiAgfTtcblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF90eXBlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0X29yX2ZhbHNlKCd0eXBlJyk7XG4gIH07XG5cbiAgcmV0dXJuIEl0ZW1fRGF0YTtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBJdGVtX0RhdGE7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVNYUmxiVjlFWVhSaExtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpU1hSbGJWOUVZWFJoTG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4SlFVRkJPenRCUVVGTk8wVkJSVkVzYlVKQlFVVXNSMEZCUmp0QlFVTmFMRkZCUVVFN1NVRkJRU3hKUVVGRExFTkJRVUVzUjBGQlJDeEhRVUZQTzBsQlExQXNTVUZCUVN4SFFVRlBMRWRCUVVjc1EwRkJReXhKUVVGS0xFTkJRVlVzVFVGQlZqdEpRVVZRTEVsQlFVY3NRMEZCU1N4SlFVRlFPMEZCUTBNc1dVRkJWU3hKUVVGQkxFdEJRVUVzUTBGQlRTd3JRMEZCVGl4RlFVUllPenRKUVVkQkxFbEJRVU1zUTBGQlFTeEpRVUZFTEVkQlFWRTdSVUZRU1RzN2MwSkJWMklzVVVGQlFTeEhRVUZWTEZOQlFVVXNTVUZCUmp0QlFVTlVMRkZCUVVFN1NVRkJRU3hMUVVGQkxFZEJRVkVzU1VGQlF5eERRVUZCTEVsQlFVMHNRMEZCUVN4UlFVRkJMRU5CUVZrc1EwRkJRU3hKUVVGQk8wbEJRek5DTEVsQlFXZENMRU5CUVVrc1MwRkJjRUk3UVVGQlFTeGhRVUZQTEUxQlFWQTdPMEZCUlVFc1YwRkJUenRGUVVwRk96dHpRa0ZOVml4UlFVRkJMRWRCUVZVc1UwRkJSU3hKUVVGR08wRkJRMVFzVVVGQlFUdEpRVUZCTEV0QlFVRXNSMEZCVVN4SlFVRkRMRU5CUVVFc1VVRkJSQ3hEUVVGWExFbEJRVmc3U1VGRFVpeEpRVUZuUWl4RFFVRkpMRXRCUVhCQ08wRkJRVUVzWVVGQlR5eE5RVUZRT3p0SlFVVkJMRWxCUVVFc1IwRkJUeXhMUVVGUExFTkJRVUVzVFVGQlFUdEpRVVZrTEUxQlFXdENMRWxCUVVrc1EwRkJReXhMUVVGTUxFTkJRVmtzUjBGQldpeERRVUZzUWl4RlFVRkRMR05CUVVRc1JVRkJVVHRKUVVWU0xFdEJRVUVzUjBGQlVTeFJRVUZCTEVOQlFWVXNTMEZCVmp0SlFVTlNMRTFCUVVFc1IwRkJVeXhSUVVGQkxFTkJRVlVzVFVGQlZqdEJRVVZVTEZkQlFVOHNRMEZCUXl4TFFVRkVMRVZCUVZFc1RVRkJVanRGUVZoRk96dHpRa0ZoVml4UFFVRkJMRWRCUVZNc1UwRkJSU3hKUVVGR08wRkJRMUlzVVVGQlFUdEpRVUZCTEV0QlFVRXNSMEZCVVN4SlFVRkRMRU5CUVVFc1VVRkJSQ3hEUVVGWExFbEJRVmc3U1VGRFVpeEpRVUZuUWl4RFFVRkpMRXRCUVhCQ08wRkJRVUVzWVVGQlR5eE5RVUZRT3p0QlFVTkJMRmRCUVU4c1MwRkJUeXhEUVVGQkxFdEJRVUU3UlVGSVRqczdjMEpCUzFRc1dVRkJRU3hIUVVGakxGTkJRVVVzUjBGQlJqdEpRVU5pTEVsQlFVY3NTVUZCUXl4RFFVRkJMRWxCUVUwc1EwRkJRU3hIUVVGQkxFTkJRVlk3UVVGRFF5eGhRVUZQTEVsQlFVTXNRMEZCUVN4SlFVRk5MRU5CUVVFc1IwRkJRU3hGUVVSbU96dEJRVVZCTEZkQlFVODdSVUZJVFRzN2MwSkJTMlFzVTBGQlFTeEhRVUZqTEZOQlFVRTdWMEZCUnl4SlFVRkRMRU5CUVVFc1dVRkJSQ3hEUVVGbExFOUJRV1k3UlVGQlNEczdjMEpCUTJRc1VVRkJRU3hIUVVGakxGTkJRVUU3VjBGQlJ5eEpRVUZETEVOQlFVRXNXVUZCUkN4RFFVRmxMRTFCUVdZN1JVRkJTRHM3T3pzN08wRkJSMllzVFVGQlRTeERRVUZETEU5QlFWQXNSMEZCYVVJaWZRPT1cbiIsIlxuLypcbiAgICBEZXBlbmRlbmNpZXNcbiAqL1xudmFyICQsIEhvb2tzLCBMYXp5X0xvYWRlcjtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbkxhenlfTG9hZGVyID0gKGZ1bmN0aW9uKCkge1xuICBMYXp5X0xvYWRlci5wcm90b3R5cGUuRWxlbWVudHMgPSB7XG4gICAgaXRlbTogJ1BQX0xhenlfSW1hZ2UnLFxuICAgIHBsYWNlaG9sZGVyOiAnUFBfTGF6eV9JbWFnZV9fcGxhY2Vob2xkZXInXG4gIH07XG5cbiAgZnVuY3Rpb24gTGF6eV9Mb2FkZXIoaGFuZGxlcikge1xuICAgIHRoaXMuaGFuZGxlciA9IGhhbmRsZXI7XG4gICAgdGhpcy5oYW5kbGVyID0gSG9va3MuYXBwbHlGaWx0ZXJzKCdwcC5sYXp5LmhhbmRsZXInLCB0aGlzLmhhbmRsZXIpO1xuICAgIGlmICh0aGlzLmhhbmRsZXIpIHtcbiAgICAgIHRoaXMucHJlcGFyZSgpO1xuICAgICAgdGhpcy5sb2FkX2FsbCgpO1xuICAgIH1cbiAgfVxuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5wcmVwYXJlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyICRpdGVtcztcbiAgICAkaXRlbXMgPSAkKFwiLlwiICsgdGhpcy5FbGVtZW50cy5pdGVtKTtcbiAgICByZXR1cm4gJGl0ZW1zLmVhY2goKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oa2V5LCBlbCkge1xuICAgICAgICByZXR1cm4gX3RoaXMuaGFuZGxlci5yZXNpemUoZWwpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH07XG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLmxvYWRfYWxsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyICRpdGVtcztcbiAgICAkaXRlbXMgPSAkKFwiLlwiICsgdGhpcy5FbGVtZW50cy5pdGVtKTtcbiAgICByZXR1cm4gJGl0ZW1zLmVhY2goKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oa2V5LCBlbCkge1xuICAgICAgICBfdGhpcy5oYW5kbGVyLmxvYWQoZWwpO1xuICAgICAgICByZXR1cm4gX3RoaXMucmVtb3ZlX3BsYWNlaG9sZGVyKGVsKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9O1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5yZW1vdmVfcGxhY2Vob2xkZXIgPSBmdW5jdGlvbihlbCkge1xuICAgIHZhciAkZWw7XG4gICAgJGVsID0gJChlbCk7XG4gICAgcmV0dXJuICRlbC5maW5kKFwiLlwiICsgdGhpcy5FbGVtZW50cy5wbGFjZWhvbGRlciArIFwiLCBub3NjcmlwdFwiKS5yZW1vdmUoKTtcbiAgfTtcblxuICByZXR1cm4gTGF6eV9Mb2FkZXI7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTGF6eV9Mb2FkZXI7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVRHRjZlVjlNYjJGa1pYSXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lKTVlYcDVYMHh2WVdSbGNpNWpiMlptWldVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWp0QlFVRkJPenM3UVVGQlFTeEpRVUZCT3p0QlFVZEJMRU5CUVVFc1IwRkJTU3hQUVVGQkxFTkJRVk1zVVVGQlZEczdRVUZEU2l4TFFVRkJMRWRCUVZFc1QwRkJRU3hEUVVGVExGVkJRVlE3TzBGQlJVWTdkMEpCUlV3c1VVRkJRU3hIUVVORE8wbEJRVUVzU1VGQlFTeEZRVUZoTEdWQlFXSTdTVUZEUVN4WFFVRkJMRVZCUVdFc05FSkJSR0k3T3p0RlFVbFpMSEZDUVVGRkxFOUJRVVk3U1VGQlJTeEpRVUZETEVOQlFVRXNWVUZCUkR0SlFVTmtMRWxCUVVNc1EwRkJRU3hQUVVGRUxFZEJRVmNzUzBGQlN5eERRVUZETEZsQlFVNHNRMEZCYlVJc2FVSkJRVzVDTEVWQlFYTkRMRWxCUVVNc1EwRkJRU3hQUVVGMlF6dEpRVVZZTEVsQlFVY3NTVUZCUXl4RFFVRkJMRTlCUVVvN1RVRkRReXhKUVVGRExFTkJRVUVzVDBGQlJDeERRVUZCTzAxQlEwRXNTVUZCUXl4RFFVRkJMRkZCUVVRc1EwRkJRU3hGUVVaRU96dEZRVWhaT3p0M1FrRlBZaXhQUVVGQkxFZEJRVk1zVTBGQlFUdEJRVU5TTEZGQlFVRTdTVUZCUVN4TlFVRkJMRWRCUVZNc1EwRkJRU3hEUVVGSExFZEJRVUVzUjBGQlNTeEpRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRWxCUVdwQ08xZEJSVlFzVFVGQlRTeERRVUZETEVsQlFWQXNRMEZCV1N4RFFVRkJMRk5CUVVFc1MwRkJRVHRoUVVGQkxGTkJRVVVzUjBGQlJpeEZRVUZQTEVWQlFWQTdaVUZEV0N4TFFVRkRMRU5CUVVFc1QwRkJUeXhEUVVGRExFMUJRVlFzUTBGQmFVSXNSVUZCYWtJN1RVRkVWenRKUVVGQkxFTkJRVUVzUTBGQlFTeERRVUZCTEVsQlFVRXNRMEZCV2p0RlFVaFJPenQzUWtGTlZDeFJRVUZCTEVkQlFWVXNVMEZCUVR0QlFVTlVMRkZCUVVFN1NVRkJRU3hOUVVGQkxFZEJRVk1zUTBGQlFTeERRVUZITEVkQlFVRXNSMEZCU1N4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExFbEJRV3BDTzFkQlExUXNUVUZCVFN4RFFVRkRMRWxCUVZBc1EwRkJXU3hEUVVGQkxGTkJRVUVzUzBGQlFUdGhRVUZCTEZOQlFVVXNSMEZCUml4RlFVRlBMRVZCUVZBN1VVRkRXQ3hMUVVGRExFTkJRVUVzVDBGQlR5eERRVUZETEVsQlFWUXNRMEZCWlN4RlFVRm1PMlZCUTBFc1MwRkJReXhEUVVGQkxHdENRVUZFTEVOQlFYRkNMRVZCUVhKQ08wMUJSbGM3U1VGQlFTeERRVUZCTEVOQlFVRXNRMEZCUVN4SlFVRkJMRU5CUVZvN1JVRkdVenM3ZDBKQlRWWXNhMEpCUVVFc1IwRkJiMElzVTBGQlJTeEZRVUZHTzBGQlEyNUNMRkZCUVVFN1NVRkJRU3hIUVVGQkxFZEJRVTBzUTBGQlFTeERRVUZITEVWQlFVZzdWMEZEVGl4SFFVRkhMRU5CUVVNc1NVRkJTaXhEUVVGVkxFZEJRVUVzUjBGQlNTeEpRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRmRCUVdRc1IwRkJNRUlzV1VGQmNFTXNRMEZCYVVRc1EwRkJReXhOUVVGc1JDeERRVUZCTzBWQlJtMUNPenM3T3pzN1FVRkxja0lzVFVGQlRTeERRVUZETEU5QlFWQXNSMEZCYVVJaWZRPT1cbiIsInZhciAkLCBJdGVtX0RhdGEsIExhenlfTWFzb25yeTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkl0ZW1fRGF0YSA9IHJlcXVpcmUoJy4vSXRlbV9EYXRhJyk7XG5cbkxhenlfTWFzb25yeSA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gTGF6eV9NYXNvbnJ5KCkge31cblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uKGVsKSB7XG4gICAgdmFyICRlbCwgcmF0aW87XG4gICAgJGVsID0gJChlbCk7XG4gICAgcmF0aW8gPSBuZXcgSXRlbV9EYXRhKCRlbCkuZ2V0X3JhdGlvKCk7XG4gICAgcmV0dXJuICRlbC5jc3Moe1xuICAgICAgJ21pbi1oZWlnaHQnOiBNYXRoLmZsb29yKHRoaXMuZ2V0X3dpZHRoKCkgLyByYXRpbylcbiAgICB9KTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmdldF93aWR0aCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAkKCcuUFBfTWFzb25yeV9fc2l6ZXInKS53aWR0aCgpO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uKGVsKSB7XG4gICAgdmFyICRlbCwgJGltYWdlLCBmdWxsLCBpbWFnZSwgdGh1bWI7XG4gICAgJGVsID0gJChlbCk7XG4gICAgaW1hZ2UgPSBuZXcgSXRlbV9EYXRhKCRlbCk7XG4gICAgdGh1bWIgPSBpbWFnZS5nZXRfdXJsKCd0aHVtYicpO1xuICAgIGZ1bGwgPSBpbWFnZS5nZXRfdXJsKCdmdWxsJyk7XG4gICAgJGVsLnByZXBlbmQoXCI8YSBocmVmPVxcXCJcIiArIGZ1bGwgKyBcIlxcXCIgcmVsPVxcXCJnYWxsZXJ5XFxcIj5cXG48aW1nIHNyYz1cXFwiXCIgKyB0aHVtYiArIFwiXFxcIiBjbGFzcz1cXFwiaXMtbG9hZGluZ1xcXCIgLz5cXG48L2E+XCIpLnJlbW92ZUNsYXNzKCdMYXp5LUltYWdlJyk7XG4gICAgJGltYWdlID0gJGVsLmZpbmQoJ2ltZycpO1xuICAgIHJldHVybiAkaW1hZ2UuaW1hZ2VzTG9hZGVkKGZ1bmN0aW9uKCkge1xuICAgICAgJGltYWdlLmFkZENsYXNzKCdpcy1sb2FkZWQnKS5yZW1vdmVDbGFzcygnaXMtbG9hZGluZycpO1xuICAgICAgcmV0dXJuICRlbC5jc3MoJ21pbi1oZWlnaHQnLCAnJykucmVtb3ZlQ2xhc3MoJ2xhenktaW1hZ2UnKTtcbiAgICB9KTtcbiAgfTtcblxuICByZXR1cm4gTGF6eV9NYXNvbnJ5O1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExhenlfTWFzb25yeTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVEdGNmVWOU5ZWE52Ym5KNUxtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpVEdGNmVWOU5ZWE52Ym5KNUxtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeEpRVUZCT3p0QlFVRkJMRU5CUVVFc1IwRkJTU3hQUVVGQkxFTkJRVk1zVVVGQlZEczdRVUZEU2l4VFFVRkJMRWRCUVZrc1QwRkJRU3hEUVVGVExHRkJRVlE3TzBGQlIwNDdPenQ1UWtGRlRDeE5RVUZCTEVkQlFWRXNVMEZCUlN4RlFVRkdPMEZCUTFBc1VVRkJRVHRKUVVGQkxFZEJRVUVzUjBGQlRTeERRVUZCTEVOQlFVY3NSVUZCU0R0SlFVTk9MRXRCUVVFc1IwRkJXU3hKUVVGQkxGTkJRVUVzUTBGQlZ5eEhRVUZZTEVOQlFXZENMRU5CUVVNc1UwRkJha0lzUTBGQlFUdFhRVWRhTEVkQlFVY3NRMEZCUXl4SFFVRktMRU5CUTBNN1RVRkJRU3haUVVGQkxFVkJRV01zU1VGQlNTeERRVUZETEV0QlFVd3NRMEZCV1N4SlFVRkRMRU5CUVVFc1UwRkJSQ3hEUVVGQkxFTkJRVUVzUjBGQlpTeExRVUV6UWl4RFFVRmtPMHRCUkVRN1JVRk1UenM3ZVVKQlVWSXNVMEZCUVN4SFFVRlhMRk5CUVVFN1YwRkZWaXhEUVVGQkxFTkJRVWNzYjBKQlFVZ3NRMEZCZVVJc1EwRkJReXhMUVVFeFFpeERRVUZCTzBWQlJsVTdPM2xDUVV0WUxFbEJRVUVzUjBGQlRTeFRRVUZGTEVWQlFVWTdRVUZEVEN4UlFVRkJPMGxCUVVFc1IwRkJRU3hIUVVGTkxFTkJRVUVzUTBGQlJ5eEZRVUZJTzBsQlJVNHNTMEZCUVN4SFFVRlpMRWxCUVVFc1UwRkJRU3hEUVVGWExFZEJRVmc3U1VGRFdpeExRVUZCTEVkQlFWRXNTMEZCU3l4RFFVRkRMRTlCUVU0c1EwRkJaU3hQUVVGbU8wbEJRMUlzU1VGQlFTeEhRVUZQTEV0QlFVc3NRMEZCUXl4UFFVRk9MRU5CUVdNc1RVRkJaRHRKUVVWUUxFZEJRMEVzUTBGQlF5eFBRVVJFTEVOQlExVXNXVUZCUVN4SFFVTkhMRWxCUkVnc1IwRkRVU3hyUTBGRVVpeEhRVVZKTEV0QlJrb3NSMEZGVlN4clEwRkljRUlzUTBGTlFTeERRVUZETEZkQlRrUXNRMEZOWXl4WlFVNWtPMGxCVTBFc1RVRkJRU3hIUVVGVExFZEJRVWNzUTBGQlF5eEpRVUZLTEVOQlFWVXNTMEZCVmp0WFFVVlVMRTFCUVUwc1EwRkJReXhaUVVGUUxFTkJRVzlDTEZOQlFVRTdUVUZEYmtJc1RVRkJUU3hEUVVGRExGRkJRVkFzUTBGQmFVSXNWMEZCYWtJc1EwRkJPRUlzUTBGQlF5eFhRVUV2UWl4RFFVRTBReXhaUVVFMVF6dGhRVU5CTEVkQlEwRXNRMEZCUXl4SFFVUkVMRU5CUTAwc1dVRkVUaXhGUVVOdlFpeEZRVVJ3UWl4RFFVVkJMRU5CUVVNc1YwRkdSQ3hEUVVWakxGbEJSbVE3U1VGR2JVSXNRMEZCY0VJN1JVRnNRa3M3T3pzN096dEJRVEpDVUN4TlFVRk5MRU5CUVVNc1QwRkJVQ3hIUVVGcFFpSjlcbiIsInZhciAkLCBIb29rcywgTGF6eV9Mb2FkZXIsIExhenlfTWFzb25yeSwgTWFzb25yeTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbk1hc29ucnkgPSByZXF1aXJlKCcuL2NsYXNzL01hc29ucnknKTtcblxuTGF6eV9Mb2FkZXIgPSByZXF1aXJlKCcuL2xhenkvTGF6eV9Mb2FkZXInKTtcblxuTGF6eV9NYXNvbnJ5ID0gcmVxdWlyZSgnLi9sYXp5L0xhenlfTWFzb25yeScpO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3BwLm1hc29ucnkuc3RhcnQvYmVmb3JlJywgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgTGF6eV9Mb2FkZXIobmV3IExhenlfTWFzb25yeSgpKTtcbn0pO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3BwLnJlYWR5JywgZnVuY3Rpb24oKSB7XG4gIGlmICgkKCcuUFBfTWFzb25yeScpLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gSG9va3MuYWRkRmlsdGVyKCdwcC5wb3J0Zm9saW8uaGFuZGxlcicsIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG5ldyBNYXNvbnJ5KCk7XG4gICAgfSk7XG4gIH1cbn0pO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2liV0Z6YjI1eWVTNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSW0xaGMyOXVjbmt1WTI5bVptVmxJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSkJRVUZCTEVsQlFVRTdPMEZCUVVFc1EwRkJRU3hIUVVGSkxFOUJRVUVzUTBGQlV5eFJRVUZVT3p0QlFVTktMRXRCUVVFc1IwRkJVU3hQUVVGQkxFTkJRVk1zVlVGQlZEczdRVUZEVWl4UFFVRkJMRWRCUVZVc1QwRkJRU3hEUVVGVExHbENRVUZVT3p0QlFVTldMRmRCUVVFc1IwRkJZeXhQUVVGQkxFTkJRVk1zYjBKQlFWUTdPMEZCUTJRc1dVRkJRU3hIUVVGbExFOUJRVUVzUTBGQlV5eHhRa0ZCVkRzN1FVRkZaaXhMUVVGTExFTkJRVU1zVTBGQlRpeERRVUZuUWl4NVFrRkJhRUlzUlVGQk1rTXNVMEZCUVR0VFFVTjBReXhKUVVGQkxGZEJRVUVzUTBGQmFVSXNTVUZCUVN4WlFVRkJMRU5CUVVFc1EwRkJha0k3UVVGRWMwTXNRMEZCTTBNN08wRkJTVUVzUzBGQlN5eERRVUZETEZOQlFVNHNRMEZCWjBJc1ZVRkJhRUlzUlVGQk5FSXNVMEZCUVR0RlFVTXpRaXhKUVVGSExFTkJRVUVzUTBGQlJ5eGhRVUZJTEVOQlFXdENMRU5CUVVNc1RVRkJia0lzUjBGQk5FSXNRMEZCTDBJN1YwRkRReXhMUVVGTExFTkJRVU1zVTBGQlRpeERRVUZuUWl4elFrRkJhRUlzUlVGQmQwTXNVMEZCUVR0aFFVRlBMRWxCUVVFc1QwRkJRU3hEUVVGQk8wbEJRVkFzUTBGQmVFTXNSVUZFUkRzN1FVRkVNa0lzUTBGQk5VSWlmUT09XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
