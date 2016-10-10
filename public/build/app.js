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
    container: 'PP-Masonry',
    sizer: 'PP-Masonry__sizer',
    item: 'PP-Masonry__item'
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
    $items = $('.Lazy-Image');
    return $items.each((function(_this) {
      return function(key, el) {
        return _this.handler.resize(el);
      };
    })(this));
  };

  Lazy_Loader.prototype.load_all = function() {
    var $items;
    $items = $('.Lazy-Image');
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
    return $('.PP-Masonry__sizer').width();
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
  if ($('.PP-Masonry').length > 0) {
    return Hooks.addFilter('pp.portfolio.handler', function() {
      return new Masonry();
    });
  }
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./class/Masonry":2,"./lazy/Lazy_Loader":6,"./lazy/Lazy_Masonry":7}]},{},[1])


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jbGFzcy9NYXNvbnJ5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jbGFzcy9Qb3J0Zm9saW8uY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2NsYXNzL1N0YXRlX01hbmFnZXIuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvSXRlbV9EYXRhLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0xhenlfTG9hZGVyLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0xhenlfTWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvbWFzb25yeS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxuLypcbiAgICBEZXBlbmRlbmNpZXNcbiAqL1xudmFyIEFwcF9TdGF0ZSwgSG9va3MsIFBvcnRmb2xpbywgU3RhdGVfTWFuYWdlcjtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuUG9ydGZvbGlvID0gcmVxdWlyZSgnLi9jbGFzcy9Qb3J0Zm9saW8nKTtcblxuU3RhdGVfTWFuYWdlciA9IHJlcXVpcmUoJy4vY2xhc3MvU3RhdGVfTWFuYWdlcicpO1xuXG5BcHBfU3RhdGUgPSBuZXcgU3RhdGVfTWFuYWdlcigpO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3BwLmxvYWRlZCcsIGZ1bmN0aW9uKCkge1xuICB2YXIgcG9ydGZvbGlvO1xuICByZXR1cm4gcG9ydGZvbGlvID0gbmV3IFBvcnRmb2xpbygpO1xufSk7XG5cbnJlcXVpcmUoJy4vbWFzb25yeScpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lZWEJ3TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lZWEJ3TG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lPMEZCUVVFN096dEJRVUZCTEVsQlFVRTdPMEZCUjBFc1MwRkJRU3hIUVVGUkxFOUJRVUVzUTBGQlV5eFZRVUZVT3p0QlFVTlNMRk5CUVVFc1IwRkJXU3hQUVVGQkxFTkJRVk1zYlVKQlFWUTdPMEZCUTFvc1lVRkJRU3hIUVVGblFpeFBRVUZCTEVOQlFWTXNkVUpCUVZRN08wRkJSMmhDTEZOQlFVRXNSMEZCWjBJc1NVRkJRU3hoUVVGQkxFTkJRVUU3TzBGQlNXaENMRXRCUVVzc1EwRkJReXhUUVVGT0xFTkJRV2RDTEZkQlFXaENMRVZCUVRaQ0xGTkJRVUU3UVVGRE5VSXNUVUZCUVR0VFFVRkJMRk5CUVVFc1IwRkJaMElzU1VGQlFTeFRRVUZCTEVOQlFVRTdRVUZFV1N4RFFVRTNRanM3UVVGSlFTeFBRVUZCTEVOQlFWRXNWMEZCVWlKOVxuIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgJCwgSG9va3MsIE1hc29ucnksXG4gIGJpbmQgPSBmdW5jdGlvbihmbiwgbWUpeyByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuIGZuLmFwcGx5KG1lLCBhcmd1bWVudHMpOyB9OyB9O1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuTWFzb25yeSA9IChmdW5jdGlvbigpIHtcbiAgTWFzb25yeS5wcm90b3R5cGUuRWxlbWVudHMgPSB7XG4gICAgY29udGFpbmVyOiAnUFAtTWFzb25yeScsXG4gICAgc2l6ZXI6ICdQUC1NYXNvbnJ5X19zaXplcicsXG4gICAgaXRlbTogJ1BQLU1hc29ucnlfX2l0ZW0nXG4gIH07XG5cbiAgZnVuY3Rpb24gTWFzb25yeSgkcGFyZW50KSB7XG4gICAgaWYgKCRwYXJlbnQgPT0gbnVsbCkge1xuICAgICAgJHBhcmVudCA9ICQoZG9jdW1lbnQpO1xuICAgIH1cbiAgICB0aGlzLnJlZnJlc2ggPSBiaW5kKHRoaXMucmVmcmVzaCwgdGhpcyk7XG4gICAgdGhpcy5kZXN0cm95ID0gYmluZCh0aGlzLmRlc3Ryb3ksIHRoaXMpO1xuICAgIHRoaXMuY3JlYXRlID0gYmluZCh0aGlzLmNyZWF0ZSwgdGhpcyk7XG4gICAgdGhpcy4kY29udGFpbmVyID0gJHBhcmVudC5maW5kKFwiLlwiICsgdGhpcy5FbGVtZW50cy5jb250YWluZXIpO1xuICAgIHRoaXMuY3JlYXRlKCk7XG4gIH1cblxuICBNYXNvbnJ5LnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy4kY29udGFpbmVyLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLiRjb250YWluZXIuYWRkQ2xhc3MoJ2lzLXByZXBhcmluZy1tYXNvbnJ5Jyk7XG4gICAgdGhpcy5tYXliZV9jcmVhdGVfc2l6ZXIoKTtcbiAgICBIb29rcy5kb0FjdGlvbigncHAubWFzb25yeS5zdGFydC9iZWZvcmUnKTtcbiAgICB0aGlzLiRjb250YWluZXIubWFzb25yeSh7XG4gICAgICBpdGVtU2VsZWN0b3I6IFwiLlwiICsgdGhpcy5FbGVtZW50cy5pdGVtLFxuICAgICAgY29sdW1uV2lkdGg6IFwiLlwiICsgdGhpcy5FbGVtZW50cy5zaXplcixcbiAgICAgIGd1dHRlcjogMCxcbiAgICAgIGluaXRMYXlvdXQ6IGZhbHNlXG4gICAgfSk7XG4gICAgdGhpcy4kY29udGFpbmVyLm1hc29ucnkoJ29uJywgJ2xheW91dENvbXBsZXRlJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIF90aGlzLiRjb250YWluZXIucmVtb3ZlQ2xhc3MoJ2lzLXByZXBhcmluZy1tYXNvbnJ5Jyk7XG4gICAgICAgIHJldHVybiBIb29rcy5kb0FjdGlvbigncHAubWFzb25yeS5zdGFydC9jb21wbGV0ZScpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgdGhpcy4kY29udGFpbmVyLm1hc29ucnkoKTtcbiAgICBIb29rcy5kb0FjdGlvbigncHAubWFzb25yeS5zdGFydC9sYXlvdXQnKTtcbiAgfTtcblxuICBNYXNvbnJ5LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5tYXliZV9yZW1vdmVfc2l6ZXIoKTtcbiAgICBpZiAodGhpcy4kY29udGFpbmVyLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuJGNvbnRhaW5lci5tYXNvbnJ5KCdkZXN0cm95Jyk7XG4gICAgfVxuICB9O1xuXG4gIE1hc29ucnkucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy4kY29udGFpbmVyLm1hb3NucnkoJ2xheW91dCcpO1xuICB9O1xuXG5cbiAgLypcbiAgXG4gIFx0XHRDcmVhdGUgYSBzaXplciBlbGVtZW50IGZvciBqcXVlcnktbWFzb25yeSB0byB1c2VcbiAgICovXG5cbiAgTWFzb25yeS5wcm90b3R5cGUubWF5YmVfY3JlYXRlX3NpemVyID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuc2l6ZXJfZG9lc250X2V4aXN0KCkpIHtcbiAgICAgIHRoaXMuY3JlYXRlX3NpemVyKCk7XG4gICAgfVxuICB9O1xuXG4gIE1hc29ucnkucHJvdG90eXBlLm1heWJlX3JlbW92ZV9zaXplciA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLiRjb250YWluZXIubGVuZ3RoICE9PSAxKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuJGNvbnRhaW5lci5maW5kKFwiLlwiICsgdGhpcy5FbGVtZW50cy5zaXplcikucmVtb3ZlKCk7XG4gIH07XG5cbiAgTWFzb25yeS5wcm90b3R5cGUuc2l6ZXJfZG9lc250X2V4aXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuJGNvbnRhaW5lci5maW5kKFwiLlwiICsgdGhpcy5FbGVtZW50cy5zaXplcikubGVuZ3RoID09PSAwO1xuICB9O1xuXG4gIE1hc29ucnkucHJvdG90eXBlLmNyZWF0ZV9zaXplciA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJGNvbnRhaW5lci5hcHBlbmQoXCI8ZGl2IGNsYXNzPVxcXCJcIiArIHRoaXMuRWxlbWVudHMuc2l6ZXIgKyBcIlxcXCI+PC9kaXY+XCIpO1xuICB9O1xuXG4gIHJldHVybiBNYXNvbnJ5O1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1hc29ucnk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVRXRnpiMjV5ZVM1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJazFoYzI5dWNua3VZMjltWm1WbElsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lJN1FVRkJRVHM3TzBGQlFVRXNTVUZCUVN4cFFrRkJRVHRGUVVGQk96dEJRVWRCTEVOQlFVRXNSMEZCU1N4UFFVRkJMRU5CUVZNc1VVRkJWRHM3UVVGRFNpeExRVUZCTEVkQlFWRXNUMEZCUVN4RFFVRlRMRlZCUVZRN08wRkJSVVk3YjBKQlJVd3NVVUZCUVN4SFFVTkRPMGxCUVVFc1UwRkJRU3hGUVVGWExGbEJRVmc3U1VGRFFTeExRVUZCTEVWQlFWY3NiVUpCUkZnN1NVRkZRU3hKUVVGQkxFVkJRVmNzYTBKQlJsZzdPenRGUVU5WkxHbENRVUZGTEU5QlFVWTdPMDFCUVVVc1ZVRkJWU3hEUVVGQkxFTkJRVWNzVVVGQlNEczdPenM3U1VGRGVFSXNTVUZCUXl4RFFVRkJMRlZCUVVRc1IwRkJZeXhQUVVGUExFTkJRVU1zU1VGQlVpeERRVUZqTEVkQlFVRXNSMEZCU1N4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExGTkJRVFZDTzBsQlJXUXNTVUZCUXl4RFFVRkJMRTFCUVVRc1EwRkJRVHRGUVVoWk96dHZRa0ZOWWl4TlFVRkJMRWRCUVZFc1UwRkJRVHRKUVVOUUxFbEJRVlVzU1VGQlF5eERRVUZCTEZWQlFWVXNRMEZCUXl4TlFVRmFMRXRCUVhOQ0xFTkJRV2hETzBGQlFVRXNZVUZCUVRzN1NVRkZRU3hKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEZGQlFWb3NRMEZCYzBJc2MwSkJRWFJDTzBsQlJVRXNTVUZCUXl4RFFVRkJMR3RDUVVGRUxFTkJRVUU3U1VGRFFTeExRVUZMTEVOQlFVTXNVVUZCVGl4RFFVRmxMSGxDUVVGbU8wbEJSMEVzU1VGQlF5eERRVUZCTEZWQlFWVXNRMEZCUXl4UFFVRmFMRU5CUTBNN1RVRkJRU3haUVVGQkxFVkJRV01zUjBGQlFTeEhRVUZKTEVsQlFVTXNRMEZCUVN4UlFVRlJMRU5CUVVNc1NVRkJOVUk3VFVGRFFTeFhRVUZCTEVWQlFXTXNSMEZCUVN4SFFVRkpMRWxCUVVNc1EwRkJRU3hSUVVGUkxFTkJRVU1zUzBGRU5VSTdUVUZGUVN4TlFVRkJMRVZCUVdNc1EwRkdaRHROUVVkQkxGVkJRVUVzUlVGQll5eExRVWhrTzB0QlJFUTdTVUZQUVN4SlFVRkRMRU5CUVVFc1ZVRkJWU3hEUVVGRExFOUJRVm9zUTBGQmIwSXNTVUZCY0VJc1JVRkJNRUlzWjBKQlFURkNMRVZCUVRSRExFTkJRVUVzVTBGQlFTeExRVUZCTzJGQlFVRXNVMEZCUVR0UlFVTXpReXhMUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEZkQlFWb3NRMEZCZVVJc2MwSkJRWHBDTzJWQlEwRXNTMEZCU3l4RFFVRkRMRkZCUVU0c1EwRkJaU3d5UWtGQlpqdE5RVVl5UXp0SlFVRkJMRU5CUVVFc1EwRkJRU3hEUVVGQkxFbEJRVUVzUTBGQk5VTTdTVUZMUVN4SlFVRkRMRU5CUVVFc1ZVRkJWU3hEUVVGRExFOUJRVm9zUTBGQlFUdEpRVU5CTEV0QlFVc3NRMEZCUXl4UlFVRk9MRU5CUVdVc2VVSkJRV1k3UlVGMFFrODdPMjlDUVRSQ1VpeFBRVUZCTEVkQlFWTXNVMEZCUVR0SlFVTlNMRWxCUVVNc1EwRkJRU3hyUWtGQlJDeERRVUZCTzBsQlJVRXNTVUZCUnl4SlFVRkRMRU5CUVVFc1ZVRkJWU3hEUVVGRExFMUJRVm9zUjBGQmNVSXNRMEZCZUVJN1RVRkRReXhKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEU5QlFWb3NRMEZCY1VJc1UwRkJja0lzUlVGRVJEczdSVUZJVVRzN2IwSkJVMVFzVDBGQlFTeEhRVUZUTEZOQlFVRTdWMEZEVWl4SlFVRkRMRU5CUVVFc1ZVRkJWU3hEUVVGRExFOUJRVm9zUTBGQmNVSXNVVUZCY2tJN1JVRkVVVHM3TzBGQlIxUTdPenM3TzI5Q1FVdEJMR3RDUVVGQkxFZEJRVzlDTEZOQlFVRTdTVUZEYmtJc1NVRkJiVUlzU1VGQlF5eERRVUZCTEd0Q1FVRkVMRU5CUVVFc1EwRkJia0k3VFVGQlFTeEpRVUZETEVOQlFVRXNXVUZCUkN4RFFVRkJMRVZCUVVFN08wVkJSRzFDT3p0dlFrRkpjRUlzYTBKQlFVRXNSMEZCYjBJc1UwRkJRVHRKUVVOdVFpeEpRVUZWTEVsQlFVTXNRMEZCUVN4VlFVRlZMRU5CUVVNc1RVRkJXaXhMUVVGM1FpeERRVUZzUXp0QlFVRkJMR0ZCUVVFN08wbEJRMEVzU1VGQlF5eERRVUZCTEZWQlFWVXNRMEZCUXl4SlFVRmFMRU5CUVd0Q0xFZEJRVUVzUjBGQlNTeEpRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRXRCUVdoRExFTkJRWGxETEVOQlFVTXNUVUZCTVVNc1EwRkJRVHRGUVVadFFqczdiMEpCUzNCQ0xHdENRVUZCTEVkQlFXOUNMRk5CUVVFN1YwRkJSeXhKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEVsQlFWb3NRMEZCYTBJc1IwRkJRU3hIUVVGSkxFbEJRVU1zUTBGQlFTeFJRVUZSTEVOQlFVTXNTMEZCYUVNc1EwRkJlVU1zUTBGQlF5eE5RVUV4UXl4TFFVRnZSRHRGUVVGMlJEczdiMEpCUjNCQ0xGbEJRVUVzUjBGQll5eFRRVUZCTzBsQlEySXNTVUZCUXl4RFFVRkJMRlZCUVZVc1EwRkJReXhOUVVGYUxFTkJRVzFDTEdWQlFVRXNSMEZCYVVJc1NVRkJReXhEUVVGQkxGRkJRVkVzUTBGQlF5eExRVUV6UWl4SFFVRnBReXhYUVVGd1JEdEZRVVJoT3pzN096czdRVUZOWml4TlFVRk5MRU5CUVVNc1QwRkJVQ3hIUVVGcFFpSjlcbiIsInZhciBIb29rcywgUG9ydGZvbGlvO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5Qb3J0Zm9saW8gPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIFBvcnRmb2xpbygpIHtcblxuICAgIC8qXG4gICAgICBcdFx0RXZlbnQgQmFzZWQgUG9ydGZvbGlvIGlzIGdvaW5nIHRvIHN0YXJ0IHNvb25cbiAgICAgKi9cbiAgICB0aGlzLmhhbmRsZXIgPSBIb29rcy5hcHBseUZpbHRlcnMoJ3BwLnBvcnRmb2xpby5oYW5kbGVyJywgZmFsc2UpO1xuICAgIGlmICh0aGlzLmhhbmRsZXIpIHtcbiAgICAgIEhvb2tzLmFkZEFjdGlvbigncHAucG9ydGZvbGlvLmNyZWF0ZScsIHRoaXMuaGFuZGxlci5jcmVhdGUsIDUwKTtcbiAgICAgIEhvb2tzLmFkZEFjdGlvbigncHAucG9ydGZvbGlvLnJlZnJlc2gnLCB0aGlzLmhhbmRsZXIucmVmcmVzaCwgNTApO1xuICAgICAgSG9va3MuYWRkQWN0aW9uKCdwcC5wb3J0Zm9saW8uZGVzdHJveScsIHRoaXMuaGFuZGxlci5kZXN0cm95LCA1MCk7XG4gICAgICBIb29rcy5hZGRBY3Rpb24oJ3BwLnBvcnRmb2xpby5kZXN0cm95JywgdGhpcy5hdXRvX2Rlc3Ryb3ksIDUwMCk7XG4gICAgfVxuICB9XG5cbiAgUG9ydGZvbGlvLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBIb29rcy5kb0FjdGlvbigncHAucG9ydGZvbGlvLmNyZWF0ZScpO1xuICB9O1xuXG4gIFBvcnRmb2xpby5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5wb3J0Zm9saW8ucmVmcmVzaCcpO1xuICB9O1xuXG4gIFBvcnRmb2xpby5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5wb3J0Zm9saW8uZGVzdHJveScpO1xuICB9O1xuXG4gIFBvcnRmb2xpby5wcm90b3R5cGUuYXV0b19kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MucmVtb3ZlQWN0aW9uKCdwcC5wb3J0Zm9saW8uY3JlYXRlJywgdGhpcy5oYW5kbGVyLmNyZWF0ZSwgNTApO1xuICAgIEhvb2tzLnJlbW92ZUFjdGlvbigncHAucG9ydGZvbGlvLnJlZnJlc2gnLCB0aGlzLmhhbmRsZXIucmVmcmVzaCwgNTApO1xuICAgIHJldHVybiBIb29rcy5yZW1vdmVBY3Rpb24oJ3BwLnBvcnRmb2xpby5kZXN0cm95JywgdGhpcy5oYW5kbGVyLmRlc3Ryb3ksIDUwKTtcbiAgfTtcblxuICByZXR1cm4gUG9ydGZvbGlvO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBvcnRmb2xpbztcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVUc5eWRHWnZiR2x2TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lVRzl5ZEdadmJHbHZMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRU3hKUVVGQk96dEJRVUZCTEV0QlFVRXNSMEZCVVN4UFFVRkJMRU5CUVZNc1ZVRkJWRHM3UVVGRlJqdEZRVVZSTEcxQ1FVRkJPenRCUVVOYU96czdTVUZIUVN4SlFVRkRMRU5CUVVFc1QwRkJSQ3hIUVVGWExFdEJRVXNzUTBGQlF5eFpRVUZPTEVOQlFXMUNMSE5DUVVGdVFpeEZRVUV5UXl4TFFVRXpRenRKUVVWWUxFbEJRVWNzU1VGQlF5eERRVUZCTEU5QlFVbzdUVUZGUXl4TFFVRkxMRU5CUVVNc1UwRkJUaXhEUVVGblFpeHhRa0ZCYUVJc1JVRkJkVU1zU1VGQlF5eERRVUZCTEU5QlFVOHNRMEZCUXl4TlFVRm9SQ3hGUVVGM1JDeEZRVUY0UkR0TlFVTkJMRXRCUVVzc1EwRkJReXhUUVVGT0xFTkJRV2RDTEhOQ1FVRm9RaXhGUVVGM1F5eEpRVUZETEVOQlFVRXNUMEZCVHl4RFFVRkRMRTlCUVdwRUxFVkJRVEJFTEVWQlFURkVPMDFCUTBFc1MwRkJTeXhEUVVGRExGTkJRVTRzUTBGQlowSXNjMEpCUVdoQ0xFVkJRWGRETEVsQlFVTXNRMEZCUVN4UFFVRlBMRU5CUVVNc1QwRkJha1FzUlVGQk1FUXNSVUZCTVVRN1RVRkhRU3hMUVVGTExFTkJRVU1zVTBGQlRpeERRVUZuUWl4elFrRkJhRUlzUlVGQmQwTXNTVUZCUXl4RFFVRkJMRmxCUVhwRExFVkJRWFZFTEVkQlFYWkVMRVZCVUVRN08wVkJUbGs3TzNOQ1FXVmlMRTFCUVVFc1IwRkJVU3hUUVVGQk8wbEJRMUFzUzBGQlN5eERRVUZETEZGQlFVNHNRMEZCWlN4eFFrRkJaanRGUVVSUE96dHpRa0ZMVWl4UFFVRkJMRWRCUVZNc1UwRkJRVHRKUVVOU0xFdEJRVXNzUTBGQlF5eFJRVUZPTEVOQlFXVXNjMEpCUVdZN1JVRkVVVHM3YzBKQlMxUXNUMEZCUVN4SFFVRlRMRk5CUVVFN1NVRkZVaXhMUVVGTExFTkJRVU1zVVVGQlRpeERRVUZsTEhOQ1FVRm1PMFZCUmxFN08zTkNRVXRVTEZsQlFVRXNSMEZCWXl4VFFVRkJPMGxCUldJc1MwRkJTeXhEUVVGRExGbEJRVTRzUTBGQmJVSXNjVUpCUVc1Q0xFVkJRVEJETEVsQlFVTXNRMEZCUVN4UFFVRlBMRU5CUVVNc1RVRkJia1FzUlVGQk1rUXNSVUZCTTBRN1NVRkRRU3hMUVVGTExFTkJRVU1zV1VGQlRpeERRVUZ0UWl4elFrRkJia0lzUlVGQk1rTXNTVUZCUXl4RFFVRkJMRTlCUVU4c1EwRkJReXhQUVVGd1JDeEZRVUUyUkN4RlFVRTNSRHRYUVVOQkxFdEJRVXNzUTBGQlF5eFpRVUZPTEVOQlFXMUNMSE5DUVVGdVFpeEZRVUV5UXl4SlFVRkRMRU5CUVVFc1QwRkJUeXhEUVVGRExFOUJRWEJFTEVWQlFUWkVMRVZCUVRkRU8wVkJTbUU3T3pzN096dEJRVTltTEUxQlFVMHNRMEZCUXl4UFFVRlFMRWRCUVdsQ0luMD1cbiIsIlxuLypcbiAgICBEZXBlbmRlbmNpZXNcbiAqL1xudmFyICQsIEhvb2tzLCBTdGF0ZV9NYW5hZ2VyLFxuICBiaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cblN0YXRlX01hbmFnZXIgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIFN0YXRlX01hbmFnZXIoKSB7XG4gICAgdGhpcy5sb2FkZWQgPSBiaW5kKHRoaXMubG9hZGVkLCB0aGlzKTtcbiAgICB0aGlzLnJlYWR5ID0gYmluZCh0aGlzLnJlYWR5LCB0aGlzKTtcbiAgICB0aGlzLiRkb2MgPSAkKGRvY3VtZW50KTtcbiAgICB0aGlzLiRkb2Mub24oJ3JlYWR5JywgdGhpcy5yZWFkeSk7XG4gICAgdGhpcy4kZG9jLmZpbmQoJy5wcC13cmFwcGVyJykuaW1hZ2VzTG9hZGVkKHRoaXMubG9hZGVkKTtcbiAgfVxuXG4gIFN0YXRlX01hbmFnZXIucHJvdG90eXBlLnJlYWR5ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRyaWdnZXI7XG4gICAgdHJpZ2dlciA9IHRydWU7XG4gICAgaWYgKEhvb2tzLmFwcGx5RmlsdGVycygncHAucmVhZHknLCB0cnVlKSkge1xuICAgICAgSG9va3MuZG9BY3Rpb24oJ3BwLnJlYWR5Jyk7XG4gICAgfVxuICB9O1xuXG4gIFN0YXRlX01hbmFnZXIucHJvdG90eXBlLmxvYWRlZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0cmlnZ2VyO1xuICAgIHRyaWdnZXIgPSB0cnVlO1xuICAgIGlmIChIb29rcy5hcHBseUZpbHRlcnMoJ3BwLmxvYWRlZCcsIHRydWUpKSB7XG4gICAgICBIb29rcy5kb0FjdGlvbigncHAubG9hZGVkJyk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBTdGF0ZV9NYW5hZ2VyO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXRlX01hbmFnZXI7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVUzUmhkR1ZmVFdGdVlXZGxjaTVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklsTjBZWFJsWDAxaGJtRm5aWEl1WTI5bVptVmxJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSTdRVUZCUVRzN08wRkJRVUVzU1VGQlFTeDFRa0ZCUVR0RlFVRkJPenRCUVVkQkxFTkJRVUVzUjBGQlNTeFBRVUZCTEVOQlFWTXNVVUZCVkRzN1FVRkRTaXhMUVVGQkxFZEJRVkVzVDBGQlFTeERRVUZUTEZWQlFWUTdPMEZCUjBZN1JVRkZVU3gxUWtGQlFUczdPMGxCUTFvc1NVRkJReXhEUVVGQkxFbEJRVVFzUjBGQlVTeERRVUZCTEVOQlFVY3NVVUZCU0R0SlFVZFNMRWxCUVVNc1EwRkJRU3hKUVVGSkxFTkJRVU1zUlVGQlRpeERRVUZUTEU5QlFWUXNSVUZCYTBJc1NVRkJReXhEUVVGQkxFdEJRVzVDTzBsQlEwRXNTVUZCUXl4RFFVRkJMRWxCUVVrc1EwRkJReXhKUVVGT0xFTkJRVmtzWVVGQldpeERRVUV5UWl4RFFVRkRMRmxCUVRWQ0xFTkJRVEJETEVsQlFVTXNRMEZCUVN4TlFVRXpRenRGUVV4Wk96c3dRa0ZSWWl4TFFVRkJMRWRCUVU4c1UwRkJRVHRCUVVOT0xGRkJRVUU3U1VGQlFTeFBRVUZCTEVkQlFWVTdTVUZGVml4SlFVRkhMRXRCUVVzc1EwRkJReXhaUVVGT0xFTkJRVzFDTEZWQlFXNUNMRVZCUVN0Q0xFbEJRUzlDTEVOQlFVZzdUVUZEUXl4TFFVRkxMRU5CUVVNc1VVRkJUaXhEUVVGbExGVkJRV1lzUlVGRVJEczdSVUZJVFRzN01FSkJVVkFzVFVGQlFTeEhRVUZSTEZOQlFVRTdRVUZEVUN4UlFVRkJPMGxCUVVFc1QwRkJRU3hIUVVGVk8wbEJSVllzU1VGQlJ5eExRVUZMTEVOQlFVTXNXVUZCVGl4RFFVRnRRaXhYUVVGdVFpeEZRVUZuUXl4SlFVRm9ReXhEUVVGSU8wMUJRME1zUzBGQlN5eERRVUZETEZGQlFVNHNRMEZCWlN4WFFVRm1MRVZCUkVRN08wVkJTRTg3T3pzN096dEJRVk5VTEUxQlFVMHNRMEZCUXl4UFFVRlFMRWRCUVdsQ0luMD1cbiIsInZhciBJdGVtX0RhdGE7XG5cbkl0ZW1fRGF0YSA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gSXRlbV9EYXRhKCRlbCkge1xuICAgIHZhciBkYXRhO1xuICAgIHRoaXMuJGVsID0gJGVsO1xuICAgIGRhdGEgPSAkZWwuZGF0YSgnaXRlbScpO1xuICAgIGlmICghZGF0YSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRWxlbWVudCBkb2Vzbid0IGNvbnRhaW4gYGRhdGEtaXRlbWAgYXR0cmlidXRlXCIpO1xuICAgIH1cbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICB9XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfZGF0YSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaW1hZ2U7XG4gICAgaW1hZ2UgPSB0aGlzLmRhdGFbJ2ltYWdlcyddW25hbWVdO1xuICAgIGlmICghaW1hZ2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGltYWdlO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X3NpemUgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGhlaWdodCwgaW1hZ2UsIHJlZiwgc2l6ZSwgd2lkdGg7XG4gICAgaW1hZ2UgPSB0aGlzLmdldF9kYXRhKG5hbWUpO1xuICAgIGlmICghaW1hZ2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgc2l6ZSA9IGltYWdlWydzaXplJ107XG4gICAgcmVmID0gc2l6ZS5zcGxpdCgneCcpLCB3aWR0aCA9IHJlZlswXSwgaGVpZ2h0ID0gcmVmWzFdO1xuICAgIHdpZHRoID0gcGFyc2VJbnQod2lkdGgpO1xuICAgIGhlaWdodCA9IHBhcnNlSW50KGhlaWdodCk7XG4gICAgcmV0dXJuIFt3aWR0aCwgaGVpZ2h0XTtcbiAgfTtcblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF91cmwgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGltYWdlO1xuICAgIGltYWdlID0gdGhpcy5nZXRfZGF0YShuYW1lKTtcbiAgICBpZiAoIWltYWdlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBpbWFnZVsndXJsJ107XG4gIH07XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfb3JfZmFsc2UgPSBmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAodGhpcy5kYXRhW2tleV0pIHtcbiAgICAgIHJldHVybiB0aGlzLmRhdGFba2V5XTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X3JhdGlvID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0X29yX2ZhbHNlKCdyYXRpbycpO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X3R5cGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRfb3JfZmFsc2UoJ3R5cGUnKTtcbiAgfTtcblxuICByZXR1cm4gSXRlbV9EYXRhO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEl0ZW1fRGF0YTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pU1hSbGJWOUVZWFJoTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lTWFJsYlY5RVlYUmhMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRU3hKUVVGQk96dEJRVUZOTzBWQlJWRXNiVUpCUVVVc1IwRkJSanRCUVVOYUxGRkJRVUU3U1VGQlFTeEpRVUZETEVOQlFVRXNSMEZCUkN4SFFVRlBPMGxCUTFBc1NVRkJRU3hIUVVGUExFZEJRVWNzUTBGQlF5eEpRVUZLTEVOQlFWVXNUVUZCVmp0SlFVVlFMRWxCUVVjc1EwRkJTU3hKUVVGUU8wRkJRME1zV1VGQlZTeEpRVUZCTEV0QlFVRXNRMEZCVFN3clEwRkJUaXhGUVVSWU96dEpRVWRCTEVsQlFVTXNRMEZCUVN4SlFVRkVMRWRCUVZFN1JVRlFTVHM3YzBKQlYySXNVVUZCUVN4SFFVRlZMRk5CUVVVc1NVRkJSanRCUVVOVUxGRkJRVUU3U1VGQlFTeExRVUZCTEVkQlFWRXNTVUZCUXl4RFFVRkJMRWxCUVUwc1EwRkJRU3hSUVVGQkxFTkJRVmtzUTBGQlFTeEpRVUZCTzBsQlF6TkNMRWxCUVdkQ0xFTkJRVWtzUzBGQmNFSTdRVUZCUVN4aFFVRlBMRTFCUVZBN08wRkJSVUVzVjBGQlR6dEZRVXBGT3p0elFrRk5WaXhSUVVGQkxFZEJRVlVzVTBGQlJTeEpRVUZHTzBGQlExUXNVVUZCUVR0SlFVRkJMRXRCUVVFc1IwRkJVU3hKUVVGRExFTkJRVUVzVVVGQlJDeERRVUZYTEVsQlFWZzdTVUZEVWl4SlFVRm5RaXhEUVVGSkxFdEJRWEJDTzBGQlFVRXNZVUZCVHl4TlFVRlFPenRKUVVWQkxFbEJRVUVzUjBGQlR5eExRVUZQTEVOQlFVRXNUVUZCUVR0SlFVVmtMRTFCUVd0Q0xFbEJRVWtzUTBGQlF5eExRVUZNTEVOQlFWa3NSMEZCV2l4RFFVRnNRaXhGUVVGRExHTkJRVVFzUlVGQlVUdEpRVVZTTEV0QlFVRXNSMEZCVVN4UlFVRkJMRU5CUVZVc1MwRkJWanRKUVVOU0xFMUJRVUVzUjBGQlV5eFJRVUZCTEVOQlFWVXNUVUZCVmp0QlFVVlVMRmRCUVU4c1EwRkJReXhMUVVGRUxFVkJRVkVzVFVGQlVqdEZRVmhGT3p0elFrRmhWaXhQUVVGQkxFZEJRVk1zVTBGQlJTeEpRVUZHTzBGQlExSXNVVUZCUVR0SlFVRkJMRXRCUVVFc1IwRkJVU3hKUVVGRExFTkJRVUVzVVVGQlJDeERRVUZYTEVsQlFWZzdTVUZEVWl4SlFVRm5RaXhEUVVGSkxFdEJRWEJDTzBGQlFVRXNZVUZCVHl4TlFVRlFPenRCUVVOQkxGZEJRVThzUzBGQlR5eERRVUZCTEV0QlFVRTdSVUZJVGpzN2MwSkJTMVFzV1VGQlFTeEhRVUZqTEZOQlFVVXNSMEZCUmp0SlFVTmlMRWxCUVVjc1NVRkJReXhEUVVGQkxFbEJRVTBzUTBGQlFTeEhRVUZCTEVOQlFWWTdRVUZEUXl4aFFVRlBMRWxCUVVNc1EwRkJRU3hKUVVGTkxFTkJRVUVzUjBGQlFTeEZRVVJtT3p0QlFVVkJMRmRCUVU4N1JVRklUVHM3YzBKQlMyUXNVMEZCUVN4SFFVRmpMRk5CUVVFN1YwRkJSeXhKUVVGRExFTkJRVUVzV1VGQlJDeERRVUZsTEU5QlFXWTdSVUZCU0RzN2MwSkJRMlFzVVVGQlFTeEhRVUZqTEZOQlFVRTdWMEZCUnl4SlFVRkRMRU5CUVVFc1dVRkJSQ3hEUVVGbExFMUJRV1k3UlVGQlNEczdPenM3TzBGQlIyWXNUVUZCVFN4RFFVRkRMRTlCUVZBc1IwRkJhVUlpZlE9PVxuIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgJCwgSG9va3MsIExhenlfTG9hZGVyO1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuTGF6eV9Mb2FkZXIgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIExhenlfTG9hZGVyKGhhbmRsZXIpIHtcbiAgICB0aGlzLmhhbmRsZXIgPSBoYW5kbGVyO1xuICAgIHRoaXMuaGFuZGxlciA9IEhvb2tzLmFwcGx5RmlsdGVycygncHAubGF6eS5oYW5kbGVyJywgdGhpcy5oYW5kbGVyKTtcbiAgICBpZiAodGhpcy5oYW5kbGVyKSB7XG4gICAgICB0aGlzLnByZXBhcmUoKTtcbiAgICAgIHRoaXMubG9hZF9hbGwoKTtcbiAgICB9XG4gIH1cblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUucHJlcGFyZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciAkaXRlbXM7XG4gICAgJGl0ZW1zID0gJCgnLkxhenktSW1hZ2UnKTtcbiAgICByZXR1cm4gJGl0ZW1zLmVhY2goKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oa2V5LCBlbCkge1xuICAgICAgICByZXR1cm4gX3RoaXMuaGFuZGxlci5yZXNpemUoZWwpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH07XG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLmxvYWRfYWxsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyICRpdGVtcztcbiAgICAkaXRlbXMgPSAkKCcuTGF6eS1JbWFnZScpO1xuICAgIHJldHVybiAkaXRlbXMuZWFjaCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihrZXksIGVsKSB7XG4gICAgICAgIF90aGlzLmhhbmRsZXIubG9hZChlbCk7XG4gICAgICAgIHJldHVybiBfdGhpcy5yZW1vdmVfcGxhY2Vob2xkZXIoZWwpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH07XG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLnJlbW92ZV9wbGFjZWhvbGRlciA9IGZ1bmN0aW9uKGVsKSB7XG4gICAgdmFyICRlbDtcbiAgICAkZWwgPSAkKGVsKTtcbiAgICByZXR1cm4gJGVsLmZpbmQoJy5MYXp5LUltYWdlX19wbGFjZWhvbGRlciwgbm9zY3JpcHQnKS5yZW1vdmUoKTtcbiAgfTtcblxuICByZXR1cm4gTGF6eV9Mb2FkZXI7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTGF6eV9Mb2FkZXI7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVRHRjZlVjlNYjJGa1pYSXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lKTVlYcDVYMHh2WVdSbGNpNWpiMlptWldVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWp0QlFVRkJPenM3UVVGQlFTeEpRVUZCT3p0QlFVZEJMRU5CUVVFc1IwRkJTU3hQUVVGQkxFTkJRVk1zVVVGQlZEczdRVUZEU2l4TFFVRkJMRWRCUVZFc1QwRkJRU3hEUVVGVExGVkJRVlE3TzBGQlJVWTdSVUZIVVN4eFFrRkJSU3hQUVVGR08wbEJRVVVzU1VGQlF5eERRVUZCTEZWQlFVUTdTVUZEWkN4SlFVRkRMRU5CUVVFc1QwRkJSQ3hIUVVGWExFdEJRVXNzUTBGQlF5eFpRVUZPTEVOQlFXMUNMR2xDUVVGdVFpeEZRVUZ6UXl4SlFVRkRMRU5CUVVFc1QwRkJka003U1VGRldDeEpRVUZITEVsQlFVTXNRMEZCUVN4UFFVRktPMDFCUTBNc1NVRkJReXhEUVVGQkxFOUJRVVFzUTBGQlFUdE5RVU5CTEVsQlFVTXNRMEZCUVN4UlFVRkVMRU5CUVVFc1JVRkdSRHM3UlVGSVdUczdkMEpCVDJJc1QwRkJRU3hIUVVGVExGTkJRVUU3UVVGRFVpeFJRVUZCTzBsQlFVRXNUVUZCUVN4SFFVRlRMRU5CUVVFc1EwRkJSeXhoUVVGSU8xZEJSVlFzVFVGQlRTeERRVUZETEVsQlFWQXNRMEZCV1N4RFFVRkJMRk5CUVVFc1MwRkJRVHRoUVVGQkxGTkJRVVVzUjBGQlJpeEZRVUZQTEVWQlFWQTdaVUZEV0N4TFFVRkRMRU5CUVVFc1QwRkJUeXhEUVVGRExFMUJRVlFzUTBGQmFVSXNSVUZCYWtJN1RVRkVWenRKUVVGQkxFTkJRVUVzUTBGQlFTeERRVUZCTEVsQlFVRXNRMEZCV2p0RlFVaFJPenQzUWtGTlZDeFJRVUZCTEVkQlFWVXNVMEZCUVR0QlFVTlVMRkZCUVVFN1NVRkJRU3hOUVVGQkxFZEJRVk1zUTBGQlFTeERRVUZITEdGQlFVZzdWMEZEVkN4TlFVRk5MRU5CUVVNc1NVRkJVQ3hEUVVGWkxFTkJRVUVzVTBGQlFTeExRVUZCTzJGQlFVRXNVMEZCUlN4SFFVRkdMRVZCUVU4c1JVRkJVRHRSUVVOWUxFdEJRVU1zUTBGQlFTeFBRVUZQTEVOQlFVTXNTVUZCVkN4RFFVRmxMRVZCUVdZN1pVRkRRU3hMUVVGRExFTkJRVUVzYTBKQlFVUXNRMEZCY1VJc1JVRkJja0k3VFVGR1Z6dEpRVUZCTEVOQlFVRXNRMEZCUVN4RFFVRkJMRWxCUVVFc1EwRkJXanRGUVVaVE96dDNRa0ZOVml4clFrRkJRU3hIUVVGdlFpeFRRVUZETEVWQlFVUTdRVUZEYmtJc1VVRkJRVHRKUVVGQkxFZEJRVUVzUjBGQlRTeERRVUZCTEVOQlFVY3NSVUZCU0R0WFFVTk9MRWRCUVVjc1EwRkJReXhKUVVGS0xFTkJRVlVzYjBOQlFWWXNRMEZCWjBRc1EwRkJReXhOUVVGcVJDeERRVUZCTzBWQlJtMUNPenM3T3pzN1FVRkxja0lzVFVGQlRTeERRVUZETEU5QlFWQXNSMEZCYVVJaWZRPT1cbiIsInZhciAkLCBJdGVtX0RhdGEsIExhenlfTWFzb25yeTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkl0ZW1fRGF0YSA9IHJlcXVpcmUoJy4vSXRlbV9EYXRhJyk7XG5cbkxhenlfTWFzb25yeSA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gTGF6eV9NYXNvbnJ5KCkge31cblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uKGVsKSB7XG4gICAgdmFyICRlbCwgcmF0aW87XG4gICAgJGVsID0gJChlbCk7XG4gICAgcmF0aW8gPSBuZXcgSXRlbV9EYXRhKCRlbCkuZ2V0X3JhdGlvKCk7XG4gICAgcmV0dXJuICRlbC5jc3Moe1xuICAgICAgJ21pbi1oZWlnaHQnOiBNYXRoLmZsb29yKHRoaXMuZ2V0X3dpZHRoKCkgLyByYXRpbylcbiAgICB9KTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmdldF93aWR0aCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAkKCcuUFAtTWFzb25yeV9fc2l6ZXInKS53aWR0aCgpO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uKGVsKSB7XG4gICAgdmFyICRlbCwgJGltYWdlLCBmdWxsLCBpbWFnZSwgdGh1bWI7XG4gICAgJGVsID0gJChlbCk7XG4gICAgaW1hZ2UgPSBuZXcgSXRlbV9EYXRhKCRlbCk7XG4gICAgdGh1bWIgPSBpbWFnZS5nZXRfdXJsKCd0aHVtYicpO1xuICAgIGZ1bGwgPSBpbWFnZS5nZXRfdXJsKCdmdWxsJyk7XG4gICAgJGVsLnByZXBlbmQoXCI8YSBocmVmPVxcXCJcIiArIGZ1bGwgKyBcIlxcXCIgcmVsPVxcXCJnYWxsZXJ5XFxcIj5cXG48aW1nIHNyYz1cXFwiXCIgKyB0aHVtYiArIFwiXFxcIiBjbGFzcz1cXFwiaXMtbG9hZGluZ1xcXCIgLz5cXG48L2E+XCIpLnJlbW92ZUNsYXNzKCdMYXp5LUltYWdlJyk7XG4gICAgJGltYWdlID0gJGVsLmZpbmQoJ2ltZycpO1xuICAgIHJldHVybiAkaW1hZ2UuaW1hZ2VzTG9hZGVkKGZ1bmN0aW9uKCkge1xuICAgICAgJGltYWdlLmFkZENsYXNzKCdpcy1sb2FkZWQnKS5yZW1vdmVDbGFzcygnaXMtbG9hZGluZycpO1xuICAgICAgcmV0dXJuICRlbC5jc3MoJ21pbi1oZWlnaHQnLCAnJykucmVtb3ZlQ2xhc3MoJ2xhenktaW1hZ2UnKTtcbiAgICB9KTtcbiAgfTtcblxuICByZXR1cm4gTGF6eV9NYXNvbnJ5O1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExhenlfTWFzb25yeTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVEdGNmVWOU5ZWE52Ym5KNUxtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpVEdGNmVWOU5ZWE52Ym5KNUxtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeEpRVUZCT3p0QlFVRkJMRU5CUVVFc1IwRkJTU3hQUVVGQkxFTkJRVk1zVVVGQlZEczdRVUZEU2l4VFFVRkJMRWRCUVZrc1QwRkJRU3hEUVVGVExHRkJRVlE3TzBGQlIwNDdPenQ1UWtGRlRDeE5RVUZCTEVkQlFWRXNVMEZCUlN4RlFVRkdPMEZCUTFBc1VVRkJRVHRKUVVGQkxFZEJRVUVzUjBGQlRTeERRVUZCTEVOQlFVY3NSVUZCU0R0SlFVTk9MRXRCUVVFc1IwRkJXU3hKUVVGQkxGTkJRVUVzUTBGQlZ5eEhRVUZZTEVOQlFXZENMRU5CUVVNc1UwRkJha0lzUTBGQlFUdFhRVWRhTEVkQlFVY3NRMEZCUXl4SFFVRktMRU5CUTBNN1RVRkJRU3haUVVGQkxFVkJRV01zU1VGQlNTeERRVUZETEV0QlFVd3NRMEZCV1N4SlFVRkRMRU5CUVVFc1UwRkJSQ3hEUVVGQkxFTkJRVUVzUjBGQlpTeExRVUV6UWl4RFFVRmtPMHRCUkVRN1JVRk1UenM3ZVVKQlVWSXNVMEZCUVN4SFFVRlhMRk5CUVVFN1YwRkZWaXhEUVVGQkxFTkJRVWNzYjBKQlFVZ3NRMEZCZVVJc1EwRkJReXhMUVVFeFFpeERRVUZCTzBWQlJsVTdPM2xDUVV0WUxFbEJRVUVzUjBGQlRTeFRRVUZGTEVWQlFVWTdRVUZEVEN4UlFVRkJPMGxCUVVFc1IwRkJRU3hIUVVGTkxFTkJRVUVzUTBGQlJ5eEZRVUZJTzBsQlJVNHNTMEZCUVN4SFFVRlpMRWxCUVVFc1UwRkJRU3hEUVVGWExFZEJRVmc3U1VGRFdpeExRVUZCTEVkQlFWRXNTMEZCU3l4RFFVRkRMRTlCUVU0c1EwRkJaU3hQUVVGbU8wbEJRMUlzU1VGQlFTeEhRVUZQTEV0QlFVc3NRMEZCUXl4UFFVRk9MRU5CUVdNc1RVRkJaRHRKUVVWUUxFZEJRMEVzUTBGQlF5eFBRVVJFTEVOQlExVXNXVUZCUVN4SFFVTkhMRWxCUkVnc1IwRkRVU3hyUTBGRVVpeEhRVVZKTEV0QlJrb3NSMEZGVlN4clEwRkljRUlzUTBGTlFTeERRVUZETEZkQlRrUXNRMEZOWXl4WlFVNWtPMGxCVTBFc1RVRkJRU3hIUVVGVExFZEJRVWNzUTBGQlF5eEpRVUZLTEVOQlFWVXNTMEZCVmp0WFFVVlVMRTFCUVUwc1EwRkJReXhaUVVGUUxFTkJRVzlDTEZOQlFVRTdUVUZEYmtJc1RVRkJUU3hEUVVGRExGRkJRVkFzUTBGQmFVSXNWMEZCYWtJc1EwRkJPRUlzUTBGQlF5eFhRVUV2UWl4RFFVRTBReXhaUVVFMVF6dGhRVU5CTEVkQlEwRXNRMEZCUXl4SFFVUkVMRU5CUTAwc1dVRkVUaXhGUVVOdlFpeEZRVVJ3UWl4RFFVVkJMRU5CUVVNc1YwRkdSQ3hEUVVWakxGbEJSbVE3U1VGR2JVSXNRMEZCY0VJN1JVRnNRa3M3T3pzN096dEJRVEpDVUN4TlFVRk5MRU5CUVVNc1QwRkJVQ3hIUVVGcFFpSjlcbiIsInZhciAkLCBIb29rcywgTGF6eV9Mb2FkZXIsIExhenlfTWFzb25yeSwgTWFzb25yeTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbk1hc29ucnkgPSByZXF1aXJlKCcuL2NsYXNzL01hc29ucnknKTtcblxuTGF6eV9Mb2FkZXIgPSByZXF1aXJlKCcuL2xhenkvTGF6eV9Mb2FkZXInKTtcblxuTGF6eV9NYXNvbnJ5ID0gcmVxdWlyZSgnLi9sYXp5L0xhenlfTWFzb25yeScpO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3BwLm1hc29ucnkuc3RhcnQvYmVmb3JlJywgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgTGF6eV9Mb2FkZXIobmV3IExhenlfTWFzb25yeSgpKTtcbn0pO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3BwLnJlYWR5JywgZnVuY3Rpb24oKSB7XG4gIGlmICgkKCcuUFAtTWFzb25yeScpLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gSG9va3MuYWRkRmlsdGVyKCdwcC5wb3J0Zm9saW8uaGFuZGxlcicsIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG5ldyBNYXNvbnJ5KCk7XG4gICAgfSk7XG4gIH1cbn0pO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2liV0Z6YjI1eWVTNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSW0xaGMyOXVjbmt1WTI5bVptVmxJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSkJRVUZCTEVsQlFVRTdPMEZCUVVFc1EwRkJRU3hIUVVGSkxFOUJRVUVzUTBGQlV5eFJRVUZVT3p0QlFVTktMRXRCUVVFc1IwRkJVU3hQUVVGQkxFTkJRVk1zVlVGQlZEczdRVUZEVWl4UFFVRkJMRWRCUVZVc1QwRkJRU3hEUVVGVExHbENRVUZVT3p0QlFVTldMRmRCUVVFc1IwRkJZeXhQUVVGQkxFTkJRVk1zYjBKQlFWUTdPMEZCUTJRc1dVRkJRU3hIUVVGbExFOUJRVUVzUTBGQlV5eHhRa0ZCVkRzN1FVRkZaaXhMUVVGTExFTkJRVU1zVTBGQlRpeERRVUZuUWl4NVFrRkJhRUlzUlVGQk1rTXNVMEZCUVR0VFFVTjBReXhKUVVGQkxGZEJRVUVzUTBGQmFVSXNTVUZCUVN4WlFVRkJMRU5CUVVFc1EwRkJha0k3UVVGRWMwTXNRMEZCTTBNN08wRkJTVUVzUzBGQlN5eERRVUZETEZOQlFVNHNRMEZCWjBJc1ZVRkJhRUlzUlVGQk5FSXNVMEZCUVR0RlFVTXpRaXhKUVVGSExFTkJRVUVzUTBGQlJ5eGhRVUZJTEVOQlFXdENMRU5CUVVNc1RVRkJia0lzUjBGQk5FSXNRMEZCTDBJN1YwRkRReXhMUVVGTExFTkJRVU1zVTBGQlRpeERRVUZuUWl4elFrRkJhRUlzUlVGQmQwTXNVMEZCUVR0aFFVRlBMRWxCUVVFc1QwRkJRU3hEUVVGQk8wbEJRVkFzUTBGQmVFTXNSVUZFUkRzN1FVRkVNa0lzUTBGQk5VSWlmUT09XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
