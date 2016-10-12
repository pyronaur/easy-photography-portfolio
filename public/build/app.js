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
var $, Hooks, Item_Data, Lazy_Loader;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Item_Data = require('./Item_Data');

Lazy_Loader = (function() {
  Lazy_Loader.prototype.Elements = {
    item: 'PP_Lazy_Image',
    placeholder: 'PP_Lazy_Image__placeholder'
  };

  Lazy_Loader.prototype.Data = [];

  function Lazy_Loader() {
    console.log('Constructuring');
    this.setup_data();
    this.attach_events();
    this.resize_all();
    this.load_all();
  }


  /*
  		Abstract Methods
   */

  Lazy_Loader.prototype.resize = function() {
    throw new Error("[Abstract] Any subclass of `Lazy_Loader` must implement `resize` method");
  };

  Lazy_Loader.prototype.load = function() {
    throw new Error("[Abstract] Any subclass of `Lazy_Loader` must implement `load` method");
  };

  Lazy_Loader.prototype.setup_data = function() {
    var $items;
    $items = $("." + this.Elements.item);
    $items.each((function(_this) {
      return function(key, el) {
        var $el;
        $el = $(el);
        return _this.Data.push({
          el: el,
          $el: $el,
          data: new Item_Data($el)
        });
      };
    })(this));
  };


  /*
  		Methods
   */

  Lazy_Loader.prototype.resize_all = function() {
    var i, item, len, ref, results;
    ref = this.Data;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      item = ref[i];
      results.push(this.resize(item));
    }
    return results;
  };

  Lazy_Loader.prototype.load_all = function() {
    var i, item, len, ref, results;
    ref = this.Data;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      item = ref[i];
      this.load(item);
      results.push(this.remove_placeholder(item));
    }
    return results;
  };

  Lazy_Loader.prototype.remove_placeholder = function(item) {
    return item.$el.find("." + this.Elements.placeholder + ", noscript").remove();
  };

  Lazy_Loader.prototype.destroy = function() {
    return this.detach_events();
  };

  return Lazy_Loader;

})();

module.exports = Lazy_Loader;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./Item_Data":5}],7:[function(require,module,exports){
(function (global){
var $, Lazy_Loader, Lazy_Masonry,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Lazy_Loader = require('./Lazy_Loader');

Lazy_Masonry = (function(superClass) {
  extend(Lazy_Masonry, superClass);

  function Lazy_Masonry() {
    this.handle_scroll = bind(this.handle_scroll, this);
    return Lazy_Masonry.__super__.constructor.apply(this, arguments);
  }

  Lazy_Masonry.prototype.resize = function(item) {
    return item.$el.css({
      'min-height': Math.floor(this.get_width() / item.data.get_ratio())
    });
  };

  Lazy_Masonry.prototype.get_width = function() {
    return $('.PP_Masonry__sizer').width();
  };

  Lazy_Masonry.prototype.load = function(item) {
    var $image, full, thumb;
    thumb = item.data.get_url('thumb');
    full = item.data.get_url('full');
    item.$el.prepend("<a href=\"" + full + "\" rel=\"gallery\">\n<img src=\"" + thumb + "\" class=\"is-loading\" />\n</a>").removeClass('Lazy-Image');
    $image = item.$el.find('img');
    return $image.imagesLoaded(function() {
      $image.addClass('is-loaded').removeClass('is-loading');
      return item.$el.css('min-height', '').removeClass('lazy-image');
    });
  };

  Lazy_Masonry.prototype.handle_scroll = function(e) {
    return console.log("Scroll");
  };

  Lazy_Masonry.prototype.attach_events = function() {
    return $(window).on('scroll', this.handle_scroll);
  };

  Lazy_Masonry.prototype.detach_events = function() {
    return $(window).off('scroll', this.handle_scroll);
  };

  return Lazy_Masonry;

})(Lazy_Loader);

module.exports = Lazy_Masonry;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./Lazy_Loader":6}],8:[function(require,module,exports){
(function (global){
var $, Hooks, Lazy_Masonry, Masonry;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Masonry = require('./class/Masonry');

Lazy_Masonry = require('./lazy/Lazy_Masonry');

Hooks.addAction('pp.masonry.start/before', function() {
  var Lazy_Handler;
  Lazy_Handler = Hooks.applyFilters('pp.lazy.handler', Lazy_Masonry);
  return new Lazy_Handler();
});

Hooks.addAction('pp.ready', function() {
  if ($('.PP_Masonry').length > 0) {
    return Hooks.addFilter('pp.portfolio.handler', function() {
      return new Masonry();
    });
  }
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./class/Masonry":2,"./lazy/Lazy_Masonry":7}]},{},[1])


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jbGFzcy9NYXNvbnJ5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jbGFzcy9Qb3J0Zm9saW8uY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2NsYXNzL1N0YXRlX01hbmFnZXIuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvSXRlbV9EYXRhLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0xhenlfTG9hZGVyLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0xhenlfTWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvbWFzb25yeS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNwR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgQXBwX1N0YXRlLCBIb29rcywgUG9ydGZvbGlvLCBTdGF0ZV9NYW5hZ2VyO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5Qb3J0Zm9saW8gPSByZXF1aXJlKCcuL2NsYXNzL1BvcnRmb2xpbycpO1xuXG5TdGF0ZV9NYW5hZ2VyID0gcmVxdWlyZSgnLi9jbGFzcy9TdGF0ZV9NYW5hZ2VyJyk7XG5cbkFwcF9TdGF0ZSA9IG5ldyBTdGF0ZV9NYW5hZ2VyKCk7XG5cbkhvb2tzLmFkZEFjdGlvbigncHAubG9hZGVkJywgZnVuY3Rpb24oKSB7XG4gIHZhciBwb3J0Zm9saW87XG4gIHJldHVybiBwb3J0Zm9saW8gPSBuZXcgUG9ydGZvbGlvKCk7XG59KTtcblxucmVxdWlyZSgnLi9tYXNvbnJ5Jyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVlYQndMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaVlYQndMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaU8wRkJRVUU3T3p0QlFVRkJMRWxCUVVFN08wRkJSMEVzUzBGQlFTeEhRVUZSTEU5QlFVRXNRMEZCVXl4VlFVRlVPenRCUVVOU0xGTkJRVUVzUjBGQldTeFBRVUZCTEVOQlFWTXNiVUpCUVZRN08wRkJRMW9zWVVGQlFTeEhRVUZuUWl4UFFVRkJMRU5CUVZNc2RVSkJRVlE3TzBGQlIyaENMRk5CUVVFc1IwRkJaMElzU1VGQlFTeGhRVUZCTEVOQlFVRTdPMEZCU1doQ0xFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMRmRCUVdoQ0xFVkJRVFpDTEZOQlFVRTdRVUZETlVJc1RVRkJRVHRUUVVGQkxGTkJRVUVzUjBGQlowSXNTVUZCUVN4VFFVRkJMRU5CUVVFN1FVRkVXU3hEUVVFM1FqczdRVUZKUVN4UFFVRkJMRU5CUVZFc1YwRkJVaUo5XG4iLCJcbi8qXG4gICAgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBIb29rcywgTWFzb25yeSxcbiAgYmluZCA9IGZ1bmN0aW9uKGZuLCBtZSl7IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7IH07IH07XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5NYXNvbnJ5ID0gKGZ1bmN0aW9uKCkge1xuICBNYXNvbnJ5LnByb3RvdHlwZS5FbGVtZW50cyA9IHtcbiAgICBjb250YWluZXI6ICdQUF9NYXNvbnJ5JyxcbiAgICBzaXplcjogJ1BQX01hc29ucnlfX3NpemVyJyxcbiAgICBpdGVtOiAnUFBfTWFzb25yeV9faXRlbSdcbiAgfTtcblxuICBmdW5jdGlvbiBNYXNvbnJ5KCRwYXJlbnQpIHtcbiAgICBpZiAoJHBhcmVudCA9PSBudWxsKSB7XG4gICAgICAkcGFyZW50ID0gJChkb2N1bWVudCk7XG4gICAgfVxuICAgIHRoaXMucmVmcmVzaCA9IGJpbmQodGhpcy5yZWZyZXNoLCB0aGlzKTtcbiAgICB0aGlzLmRlc3Ryb3kgPSBiaW5kKHRoaXMuZGVzdHJveSwgdGhpcyk7XG4gICAgdGhpcy5jcmVhdGUgPSBiaW5kKHRoaXMuY3JlYXRlLCB0aGlzKTtcbiAgICB0aGlzLiRjb250YWluZXIgPSAkcGFyZW50LmZpbmQoXCIuXCIgKyB0aGlzLkVsZW1lbnRzLmNvbnRhaW5lcik7XG4gICAgdGhpcy5jcmVhdGUoKTtcbiAgfVxuXG4gIE1hc29ucnkucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLiRjb250YWluZXIubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuJGNvbnRhaW5lci5hZGRDbGFzcygnaXMtcHJlcGFyaW5nLW1hc29ucnknKTtcbiAgICB0aGlzLm1heWJlX2NyZWF0ZV9zaXplcigpO1xuICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5tYXNvbnJ5LnN0YXJ0L2JlZm9yZScpO1xuICAgIHRoaXMuJGNvbnRhaW5lci5tYXNvbnJ5KHtcbiAgICAgIGl0ZW1TZWxlY3RvcjogXCIuXCIgKyB0aGlzLkVsZW1lbnRzLml0ZW0sXG4gICAgICBjb2x1bW5XaWR0aDogXCIuXCIgKyB0aGlzLkVsZW1lbnRzLnNpemVyLFxuICAgICAgZ3V0dGVyOiAwLFxuICAgICAgaW5pdExheW91dDogZmFsc2VcbiAgICB9KTtcbiAgICB0aGlzLiRjb250YWluZXIubWFzb25yeSgnb24nLCAnbGF5b3V0Q29tcGxldGUnLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgX3RoaXMuJGNvbnRhaW5lci5yZW1vdmVDbGFzcygnaXMtcHJlcGFyaW5nLW1hc29ucnknKTtcbiAgICAgICAgcmV0dXJuIEhvb2tzLmRvQWN0aW9uKCdwcC5tYXNvbnJ5LnN0YXJ0L2NvbXBsZXRlJyk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICB0aGlzLiRjb250YWluZXIubWFzb25yeSgpO1xuICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5tYXNvbnJ5LnN0YXJ0L2xheW91dCcpO1xuICB9O1xuXG4gIE1hc29ucnkucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLm1heWJlX3JlbW92ZV9zaXplcigpO1xuICAgIGlmICh0aGlzLiRjb250YWluZXIubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy4kY29udGFpbmVyLm1hc29ucnkoJ2Rlc3Ryb3knKTtcbiAgICB9XG4gIH07XG5cbiAgTWFzb25yeS5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLiRjb250YWluZXIubWFvc25yeSgnbGF5b3V0Jyk7XG4gIH07XG5cblxuICAvKlxuICBcbiAgXHRcdENyZWF0ZSBhIHNpemVyIGVsZW1lbnQgZm9yIGpxdWVyeS1tYXNvbnJ5IHRvIHVzZVxuICAgKi9cblxuICBNYXNvbnJ5LnByb3RvdHlwZS5tYXliZV9jcmVhdGVfc2l6ZXIgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5zaXplcl9kb2VzbnRfZXhpc3QoKSkge1xuICAgICAgdGhpcy5jcmVhdGVfc2l6ZXIoKTtcbiAgICB9XG4gIH07XG5cbiAgTWFzb25yeS5wcm90b3R5cGUubWF5YmVfcmVtb3ZlX3NpemVyID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuJGNvbnRhaW5lci5sZW5ndGggIT09IDEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy4kY29udGFpbmVyLmZpbmQoXCIuXCIgKyB0aGlzLkVsZW1lbnRzLnNpemVyKS5yZW1vdmUoKTtcbiAgfTtcblxuICBNYXNvbnJ5LnByb3RvdHlwZS5zaXplcl9kb2VzbnRfZXhpc3QgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy4kY29udGFpbmVyLmZpbmQoXCIuXCIgKyB0aGlzLkVsZW1lbnRzLnNpemVyKS5sZW5ndGggPT09IDA7XG4gIH07XG5cbiAgTWFzb25yeS5wcm90b3R5cGUuY3JlYXRlX3NpemVyID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kY29udGFpbmVyLmFwcGVuZChcIjxkaXYgY2xhc3M9XFxcIlwiICsgdGhpcy5FbGVtZW50cy5zaXplciArIFwiXFxcIj48L2Rpdj5cIik7XG4gIH07XG5cbiAgcmV0dXJuIE1hc29ucnk7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTWFzb25yeTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVFdGemIyNXllUzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklrMWhjMjl1Y25rdVkyOW1abVZsSWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUk3UVVGQlFUczdPMEZCUVVFc1NVRkJRU3hwUWtGQlFUdEZRVUZCT3p0QlFVZEJMRU5CUVVFc1IwRkJTU3hQUVVGQkxFTkJRVk1zVVVGQlZEczdRVUZEU2l4TFFVRkJMRWRCUVZFc1QwRkJRU3hEUVVGVExGVkJRVlE3TzBGQlJVWTdiMEpCUlV3c1VVRkJRU3hIUVVORE8wbEJRVUVzVTBGQlFTeEZRVUZYTEZsQlFWZzdTVUZEUVN4TFFVRkJMRVZCUVZjc2JVSkJSRmc3U1VGRlFTeEpRVUZCTEVWQlFWY3NhMEpCUmxnN096dEZRVTlaTEdsQ1FVRkZMRTlCUVVZN08wMUJRVVVzVlVGQlZTeERRVUZCTEVOQlFVY3NVVUZCU0RzN096czdTVUZEZUVJc1NVRkJReXhEUVVGQkxGVkJRVVFzUjBGQll5eFBRVUZQTEVOQlFVTXNTVUZCVWl4RFFVRmpMRWRCUVVFc1IwRkJTU3hKUVVGRExFTkJRVUVzVVVGQlVTeERRVUZETEZOQlFUVkNPMGxCUldRc1NVRkJReXhEUVVGQkxFMUJRVVFzUTBGQlFUdEZRVWhaT3p0dlFrRk5ZaXhOUVVGQkxFZEJRVkVzVTBGQlFUdEpRVU5RTEVsQlFWVXNTVUZCUXl4RFFVRkJMRlZCUVZVc1EwRkJReXhOUVVGYUxFdEJRWE5DTEVOQlFXaERPMEZCUVVFc1lVRkJRVHM3U1VGRlFTeEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRkZCUVZvc1EwRkJjMElzYzBKQlFYUkNPMGxCUlVFc1NVRkJReXhEUVVGQkxHdENRVUZFTEVOQlFVRTdTVUZEUVN4TFFVRkxMRU5CUVVNc1VVRkJUaXhEUVVGbExIbENRVUZtTzBsQlIwRXNTVUZCUXl4RFFVRkJMRlZCUVZVc1EwRkJReXhQUVVGYUxFTkJRME03VFVGQlFTeFpRVUZCTEVWQlFXTXNSMEZCUVN4SFFVRkpMRWxCUVVNc1EwRkJRU3hSUVVGUkxFTkJRVU1zU1VGQk5VSTdUVUZEUVN4WFFVRkJMRVZCUVdNc1IwRkJRU3hIUVVGSkxFbEJRVU1zUTBGQlFTeFJRVUZSTEVOQlFVTXNTMEZFTlVJN1RVRkZRU3hOUVVGQkxFVkJRV01zUTBGR1pEdE5RVWRCTEZWQlFVRXNSVUZCWXl4TFFVaGtPMHRCUkVRN1NVRlBRU3hKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEU5QlFWb3NRMEZCYjBJc1NVRkJjRUlzUlVGQk1FSXNaMEpCUVRGQ0xFVkJRVFJETEVOQlFVRXNVMEZCUVN4TFFVRkJPMkZCUVVFc1UwRkJRVHRSUVVNelF5eExRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRmRCUVZvc1EwRkJlVUlzYzBKQlFYcENPMlZCUTBFc1MwRkJTeXhEUVVGRExGRkJRVTRzUTBGQlpTd3lRa0ZCWmp0TlFVWXlRenRKUVVGQkxFTkJRVUVzUTBGQlFTeERRVUZCTEVsQlFVRXNRMEZCTlVNN1NVRkxRU3hKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEU5QlFWb3NRMEZCUVR0SlFVTkJMRXRCUVVzc1EwRkJReXhSUVVGT0xFTkJRV1VzZVVKQlFXWTdSVUYwUWs4N08yOUNRVFJDVWl4UFFVRkJMRWRCUVZNc1UwRkJRVHRKUVVOU0xFbEJRVU1zUTBGQlFTeHJRa0ZCUkN4RFFVRkJPMGxCUlVFc1NVRkJSeXhKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEUxQlFWb3NSMEZCY1VJc1EwRkJlRUk3VFVGRFF5eEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRTlCUVZvc1EwRkJjVUlzVTBGQmNrSXNSVUZFUkRzN1JVRklVVHM3YjBKQlUxUXNUMEZCUVN4SFFVRlRMRk5CUVVFN1YwRkRVaXhKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEU5QlFWb3NRMEZCY1VJc1VVRkJja0k3UlVGRVVUczdPMEZCUjFRN096czdPMjlDUVV0QkxHdENRVUZCTEVkQlFXOUNMRk5CUVVFN1NVRkRia0lzU1VGQmJVSXNTVUZCUXl4RFFVRkJMR3RDUVVGRUxFTkJRVUVzUTBGQmJrSTdUVUZCUVN4SlFVRkRMRU5CUVVFc1dVRkJSQ3hEUVVGQkxFVkJRVUU3TzBWQlJHMUNPenR2UWtGSmNFSXNhMEpCUVVFc1IwRkJiMElzVTBGQlFUdEpRVU51UWl4SlFVRlZMRWxCUVVNc1EwRkJRU3hWUVVGVkxFTkJRVU1zVFVGQldpeExRVUYzUWl4RFFVRnNRenRCUVVGQkxHRkJRVUU3TzBsQlEwRXNTVUZCUXl4RFFVRkJMRlZCUVZVc1EwRkJReXhKUVVGYUxFTkJRV3RDTEVkQlFVRXNSMEZCU1N4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExFdEJRV2hETEVOQlFYbERMRU5CUVVNc1RVRkJNVU1zUTBGQlFUdEZRVVp0UWpzN2IwSkJTM0JDTEd0Q1FVRkJMRWRCUVc5Q0xGTkJRVUU3VjBGQlJ5eEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRWxCUVZvc1EwRkJhMElzUjBGQlFTeEhRVUZKTEVsQlFVTXNRMEZCUVN4UlFVRlJMRU5CUVVNc1MwRkJhRU1zUTBGQmVVTXNRMEZCUXl4TlFVRXhReXhMUVVGdlJEdEZRVUYyUkRzN2IwSkJSM0JDTEZsQlFVRXNSMEZCWXl4VFFVRkJPMGxCUTJJc1NVRkJReXhEUVVGQkxGVkJRVlVzUTBGQlF5eE5RVUZhTEVOQlFXMUNMR1ZCUVVFc1IwRkJhVUlzU1VGQlF5eERRVUZCTEZGQlFWRXNRMEZCUXl4TFFVRXpRaXhIUVVGcFF5eFhRVUZ3UkR0RlFVUmhPenM3T3pzN1FVRk5aaXhOUVVGTkxFTkJRVU1zVDBGQlVDeEhRVUZwUWlKOVxuIiwidmFyIEhvb2tzLCBQb3J0Zm9saW87XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cblBvcnRmb2xpbyA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gUG9ydGZvbGlvKCkge1xuXG4gICAgLypcbiAgICAgIFx0XHRFdmVudCBCYXNlZCBQb3J0Zm9saW8gaXMgZ29pbmcgdG8gc3RhcnQgc29vblxuICAgICAqL1xuICAgIHRoaXMuaGFuZGxlciA9IEhvb2tzLmFwcGx5RmlsdGVycygncHAucG9ydGZvbGlvLmhhbmRsZXInLCBmYWxzZSk7XG4gICAgaWYgKHRoaXMuaGFuZGxlcikge1xuICAgICAgSG9va3MuYWRkQWN0aW9uKCdwcC5wb3J0Zm9saW8uY3JlYXRlJywgdGhpcy5oYW5kbGVyLmNyZWF0ZSwgNTApO1xuICAgICAgSG9va3MuYWRkQWN0aW9uKCdwcC5wb3J0Zm9saW8ucmVmcmVzaCcsIHRoaXMuaGFuZGxlci5yZWZyZXNoLCA1MCk7XG4gICAgICBIb29rcy5hZGRBY3Rpb24oJ3BwLnBvcnRmb2xpby5kZXN0cm95JywgdGhpcy5oYW5kbGVyLmRlc3Ryb3ksIDUwKTtcbiAgICAgIEhvb2tzLmFkZEFjdGlvbigncHAucG9ydGZvbGlvLmRlc3Ryb3knLCB0aGlzLmF1dG9fZGVzdHJveSwgNTAwKTtcbiAgICB9XG4gIH1cblxuICBQb3J0Zm9saW8ucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5wb3J0Zm9saW8uY3JlYXRlJyk7XG4gIH07XG5cbiAgUG9ydGZvbGlvLnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MuZG9BY3Rpb24oJ3BwLnBvcnRmb2xpby5yZWZyZXNoJyk7XG4gIH07XG5cbiAgUG9ydGZvbGlvLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MuZG9BY3Rpb24oJ3BwLnBvcnRmb2xpby5kZXN0cm95Jyk7XG4gIH07XG5cbiAgUG9ydGZvbGlvLnByb3RvdHlwZS5hdXRvX2Rlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICBIb29rcy5yZW1vdmVBY3Rpb24oJ3BwLnBvcnRmb2xpby5jcmVhdGUnLCB0aGlzLmhhbmRsZXIuY3JlYXRlLCA1MCk7XG4gICAgSG9va3MucmVtb3ZlQWN0aW9uKCdwcC5wb3J0Zm9saW8ucmVmcmVzaCcsIHRoaXMuaGFuZGxlci5yZWZyZXNoLCA1MCk7XG4gICAgcmV0dXJuIEhvb2tzLnJlbW92ZUFjdGlvbigncHAucG9ydGZvbGlvLmRlc3Ryb3knLCB0aGlzLmhhbmRsZXIuZGVzdHJveSwgNTApO1xuICB9O1xuXG4gIHJldHVybiBQb3J0Zm9saW87XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gUG9ydGZvbGlvO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lVRzl5ZEdadmJHbHZMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaVVHOXlkR1p2YkdsdkxtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeEpRVUZCT3p0QlFVRkJMRXRCUVVFc1IwRkJVU3hQUVVGQkxFTkJRVk1zVlVGQlZEczdRVUZGUmp0RlFVVlJMRzFDUVVGQk96dEJRVU5hT3pzN1NVRkhRU3hKUVVGRExFTkJRVUVzVDBGQlJDeEhRVUZYTEV0QlFVc3NRMEZCUXl4WlFVRk9MRU5CUVcxQ0xITkNRVUZ1UWl4RlFVRXlReXhMUVVFelF6dEpRVVZZTEVsQlFVY3NTVUZCUXl4RFFVRkJMRTlCUVVvN1RVRkZReXhMUVVGTExFTkJRVU1zVTBGQlRpeERRVUZuUWl4eFFrRkJhRUlzUlVGQmRVTXNTVUZCUXl4RFFVRkJMRTlCUVU4c1EwRkJReXhOUVVGb1JDeEZRVUYzUkN4RlFVRjRSRHROUVVOQkxFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMSE5DUVVGb1FpeEZRVUYzUXl4SlFVRkRMRU5CUVVFc1QwRkJUeXhEUVVGRExFOUJRV3BFTEVWQlFUQkVMRVZCUVRGRU8wMUJRMEVzUzBGQlN5eERRVUZETEZOQlFVNHNRMEZCWjBJc2MwSkJRV2hDTEVWQlFYZERMRWxCUVVNc1EwRkJRU3hQUVVGUExFTkJRVU1zVDBGQmFrUXNSVUZCTUVRc1JVRkJNVVE3VFVGSFFTeExRVUZMTEVOQlFVTXNVMEZCVGl4RFFVRm5RaXh6UWtGQmFFSXNSVUZCZDBNc1NVRkJReXhEUVVGQkxGbEJRWHBETEVWQlFYVkVMRWRCUVhaRUxFVkJVRVE3TzBWQlRsazdPM05DUVdWaUxFMUJRVUVzUjBGQlVTeFRRVUZCTzBsQlExQXNTMEZCU3l4RFFVRkRMRkZCUVU0c1EwRkJaU3h4UWtGQlpqdEZRVVJQT3p0elFrRkxVaXhQUVVGQkxFZEJRVk1zVTBGQlFUdEpRVU5TTEV0QlFVc3NRMEZCUXl4UlFVRk9MRU5CUVdVc2MwSkJRV1k3UlVGRVVUczdjMEpCUzFRc1QwRkJRU3hIUVVGVExGTkJRVUU3U1VGRlVpeExRVUZMTEVOQlFVTXNVVUZCVGl4RFFVRmxMSE5DUVVGbU8wVkJSbEU3TzNOQ1FVdFVMRmxCUVVFc1IwRkJZeXhUUVVGQk8wbEJSV0lzUzBGQlN5eERRVUZETEZsQlFVNHNRMEZCYlVJc2NVSkJRVzVDTEVWQlFUQkRMRWxCUVVNc1EwRkJRU3hQUVVGUExFTkJRVU1zVFVGQmJrUXNSVUZCTWtRc1JVRkJNMFE3U1VGRFFTeExRVUZMTEVOQlFVTXNXVUZCVGl4RFFVRnRRaXh6UWtGQmJrSXNSVUZCTWtNc1NVRkJReXhEUVVGQkxFOUJRVThzUTBGQlF5eFBRVUZ3UkN4RlFVRTJSQ3hGUVVFM1JEdFhRVU5CTEV0QlFVc3NRMEZCUXl4WlFVRk9MRU5CUVcxQ0xITkNRVUZ1UWl4RlFVRXlReXhKUVVGRExFTkJRVUVzVDBGQlR5eERRVUZETEU5QlFYQkVMRVZCUVRaRUxFVkJRVGRFTzBWQlNtRTdPenM3T3p0QlFVOW1MRTFCUVUwc1EwRkJReXhQUVVGUUxFZEJRV2xDSW4wPVxuIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgJCwgSG9va3MsIFN0YXRlX01hbmFnZXIsXG4gIGJpbmQgPSBmdW5jdGlvbihmbiwgbWUpeyByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuIGZuLmFwcGx5KG1lLCBhcmd1bWVudHMpOyB9OyB9O1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuU3RhdGVfTWFuYWdlciA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gU3RhdGVfTWFuYWdlcigpIHtcbiAgICB0aGlzLmxvYWRlZCA9IGJpbmQodGhpcy5sb2FkZWQsIHRoaXMpO1xuICAgIHRoaXMucmVhZHkgPSBiaW5kKHRoaXMucmVhZHksIHRoaXMpO1xuICAgIHRoaXMuJGRvYyA9ICQoZG9jdW1lbnQpO1xuICAgIHRoaXMuJGRvYy5vbigncmVhZHknLCB0aGlzLnJlYWR5KTtcbiAgICB0aGlzLiRkb2MuZmluZCgnLnBwLXdyYXBwZXInKS5pbWFnZXNMb2FkZWQodGhpcy5sb2FkZWQpO1xuICB9XG5cbiAgU3RhdGVfTWFuYWdlci5wcm90b3R5cGUucmVhZHkgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdHJpZ2dlcjtcbiAgICB0cmlnZ2VyID0gdHJ1ZTtcbiAgICBpZiAoSG9va3MuYXBwbHlGaWx0ZXJzKCdwcC5yZWFkeScsIHRydWUpKSB7XG4gICAgICBIb29rcy5kb0FjdGlvbigncHAucmVhZHknKTtcbiAgICB9XG4gIH07XG5cbiAgU3RhdGVfTWFuYWdlci5wcm90b3R5cGUubG9hZGVkID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRyaWdnZXI7XG4gICAgdHJpZ2dlciA9IHRydWU7XG4gICAgaWYgKEhvb2tzLmFwcGx5RmlsdGVycygncHAubG9hZGVkJywgdHJ1ZSkpIHtcbiAgICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5sb2FkZWQnKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIFN0YXRlX01hbmFnZXI7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhdGVfTWFuYWdlcjtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVTNSaGRHVmZUV0Z1WVdkbGNpNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSWxOMFlYUmxYMDFoYm1GblpYSXVZMjltWm1WbElsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lJN1FVRkJRVHM3TzBGQlFVRXNTVUZCUVN4MVFrRkJRVHRGUVVGQk96dEJRVWRCTEVOQlFVRXNSMEZCU1N4UFFVRkJMRU5CUVZNc1VVRkJWRHM3UVVGRFNpeExRVUZCTEVkQlFWRXNUMEZCUVN4RFFVRlRMRlZCUVZRN08wRkJSMFk3UlVGRlVTeDFRa0ZCUVRzN08wbEJRMW9zU1VGQlF5eERRVUZCTEVsQlFVUXNSMEZCVVN4RFFVRkJMRU5CUVVjc1VVRkJTRHRKUVVkU0xFbEJRVU1zUTBGQlFTeEpRVUZKTEVOQlFVTXNSVUZCVGl4RFFVRlRMRTlCUVZRc1JVRkJhMElzU1VGQlF5eERRVUZCTEV0QlFXNUNPMGxCUTBFc1NVRkJReXhEUVVGQkxFbEJRVWtzUTBGQlF5eEpRVUZPTEVOQlFWa3NZVUZCV2l4RFFVRXlRaXhEUVVGRExGbEJRVFZDTEVOQlFUQkRMRWxCUVVNc1EwRkJRU3hOUVVFelF6dEZRVXhaT3pzd1FrRlJZaXhMUVVGQkxFZEJRVThzVTBGQlFUdEJRVU5PTEZGQlFVRTdTVUZCUVN4UFFVRkJMRWRCUVZVN1NVRkZWaXhKUVVGSExFdEJRVXNzUTBGQlF5eFpRVUZPTEVOQlFXMUNMRlZCUVc1Q0xFVkJRU3RDTEVsQlFTOUNMRU5CUVVnN1RVRkRReXhMUVVGTExFTkJRVU1zVVVGQlRpeERRVUZsTEZWQlFXWXNSVUZFUkRzN1JVRklUVHM3TUVKQlVWQXNUVUZCUVN4SFFVRlJMRk5CUVVFN1FVRkRVQ3hSUVVGQk8wbEJRVUVzVDBGQlFTeEhRVUZWTzBsQlJWWXNTVUZCUnl4TFFVRkxMRU5CUVVNc1dVRkJUaXhEUVVGdFFpeFhRVUZ1UWl4RlFVRm5ReXhKUVVGb1F5eERRVUZJTzAxQlEwTXNTMEZCU3l4RFFVRkRMRkZCUVU0c1EwRkJaU3hYUVVGbUxFVkJSRVE3TzBWQlNFODdPenM3T3p0QlFWTlVMRTFCUVUwc1EwRkJReXhQUVVGUUxFZEJRV2xDSW4wPVxuIiwidmFyIEl0ZW1fRGF0YTtcblxuSXRlbV9EYXRhID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBJdGVtX0RhdGEoJGVsKSB7XG4gICAgdmFyIGRhdGE7XG4gICAgdGhpcy4kZWwgPSAkZWw7XG4gICAgZGF0YSA9ICRlbC5kYXRhKCdpdGVtJyk7XG4gICAgaWYgKCFkYXRhKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFbGVtZW50IGRvZXNuJ3QgY29udGFpbiBgZGF0YS1pdGVtYCBhdHRyaWJ1dGVcIik7XG4gICAgfVxuICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gIH1cblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF9kYXRhID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBpbWFnZTtcbiAgICBpbWFnZSA9IHRoaXMuZGF0YVsnaW1hZ2VzJ11bbmFtZV07XG4gICAgaWYgKCFpbWFnZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gaW1hZ2U7XG4gIH07XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfc2l6ZSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaGVpZ2h0LCBpbWFnZSwgcmVmLCBzaXplLCB3aWR0aDtcbiAgICBpbWFnZSA9IHRoaXMuZ2V0X2RhdGEobmFtZSk7XG4gICAgaWYgKCFpbWFnZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBzaXplID0gaW1hZ2VbJ3NpemUnXTtcbiAgICByZWYgPSBzaXplLnNwbGl0KCd4JyksIHdpZHRoID0gcmVmWzBdLCBoZWlnaHQgPSByZWZbMV07XG4gICAgd2lkdGggPSBwYXJzZUludCh3aWR0aCk7XG4gICAgaGVpZ2h0ID0gcGFyc2VJbnQoaGVpZ2h0KTtcbiAgICByZXR1cm4gW3dpZHRoLCBoZWlnaHRdO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X3VybCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaW1hZ2U7XG4gICAgaW1hZ2UgPSB0aGlzLmdldF9kYXRhKG5hbWUpO1xuICAgIGlmICghaW1hZ2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGltYWdlWyd1cmwnXTtcbiAgfTtcblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF9vcl9mYWxzZSA9IGZ1bmN0aW9uKGtleSkge1xuICAgIGlmICh0aGlzLmRhdGFba2V5XSkge1xuICAgICAgcmV0dXJuIHRoaXMuZGF0YVtrZXldO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfcmF0aW8gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRfb3JfZmFsc2UoJ3JhdGlvJyk7XG4gIH07XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfdHlwZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldF9vcl9mYWxzZSgndHlwZScpO1xuICB9O1xuXG4gIHJldHVybiBJdGVtX0RhdGE7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gSXRlbV9EYXRhO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lTWFJsYlY5RVlYUmhMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaVNYUmxiVjlFWVhSaExtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeEpRVUZCT3p0QlFVRk5PMFZCUlZFc2JVSkJRVVVzUjBGQlJqdEJRVU5hTEZGQlFVRTdTVUZCUVN4SlFVRkRMRU5CUVVFc1IwRkJSQ3hIUVVGUE8wbEJRMUFzU1VGQlFTeEhRVUZQTEVkQlFVY3NRMEZCUXl4SlFVRktMRU5CUVZVc1RVRkJWanRKUVVWUUxFbEJRVWNzUTBGQlNTeEpRVUZRTzBGQlEwTXNXVUZCVlN4SlFVRkJMRXRCUVVFc1EwRkJUU3dyUTBGQlRpeEZRVVJZT3p0SlFVZEJMRWxCUVVNc1EwRkJRU3hKUVVGRUxFZEJRVkU3UlVGUVNUczdjMEpCVjJJc1VVRkJRU3hIUVVGVkxGTkJRVVVzU1VGQlJqdEJRVU5VTEZGQlFVRTdTVUZCUVN4TFFVRkJMRWRCUVZFc1NVRkJReXhEUVVGQkxFbEJRVTBzUTBGQlFTeFJRVUZCTEVOQlFWa3NRMEZCUVN4SlFVRkJPMGxCUXpOQ0xFbEJRV2RDTEVOQlFVa3NTMEZCY0VJN1FVRkJRU3hoUVVGUExFMUJRVkE3TzBGQlJVRXNWMEZCVHp0RlFVcEZPenR6UWtGTlZpeFJRVUZCTEVkQlFWVXNVMEZCUlN4SlFVRkdPMEZCUTFRc1VVRkJRVHRKUVVGQkxFdEJRVUVzUjBGQlVTeEpRVUZETEVOQlFVRXNVVUZCUkN4RFFVRlhMRWxCUVZnN1NVRkRVaXhKUVVGblFpeERRVUZKTEV0QlFYQkNPMEZCUVVFc1lVRkJUeXhOUVVGUU96dEpRVVZCTEVsQlFVRXNSMEZCVHl4TFFVRlBMRU5CUVVFc1RVRkJRVHRKUVVWa0xFMUJRV3RDTEVsQlFVa3NRMEZCUXl4TFFVRk1MRU5CUVZrc1IwRkJXaXhEUVVGc1FpeEZRVUZETEdOQlFVUXNSVUZCVVR0SlFVVlNMRXRCUVVFc1IwRkJVU3hSUVVGQkxFTkJRVlVzUzBGQlZqdEpRVU5TTEUxQlFVRXNSMEZCVXl4UlFVRkJMRU5CUVZVc1RVRkJWanRCUVVWVUxGZEJRVThzUTBGQlF5eExRVUZFTEVWQlFWRXNUVUZCVWp0RlFWaEZPenR6UWtGaFZpeFBRVUZCTEVkQlFWTXNVMEZCUlN4SlFVRkdPMEZCUTFJc1VVRkJRVHRKUVVGQkxFdEJRVUVzUjBGQlVTeEpRVUZETEVOQlFVRXNVVUZCUkN4RFFVRlhMRWxCUVZnN1NVRkRVaXhKUVVGblFpeERRVUZKTEV0QlFYQkNPMEZCUVVFc1lVRkJUeXhOUVVGUU96dEJRVU5CTEZkQlFVOHNTMEZCVHl4RFFVRkJMRXRCUVVFN1JVRklUanM3YzBKQlMxUXNXVUZCUVN4SFFVRmpMRk5CUVVVc1IwRkJSanRKUVVOaUxFbEJRVWNzU1VGQlF5eERRVUZCTEVsQlFVMHNRMEZCUVN4SFFVRkJMRU5CUVZZN1FVRkRReXhoUVVGUExFbEJRVU1zUTBGQlFTeEpRVUZOTEVOQlFVRXNSMEZCUVN4RlFVUm1PenRCUVVWQkxGZEJRVTg3UlVGSVRUczdjMEpCUzJRc1UwRkJRU3hIUVVGakxGTkJRVUU3VjBGQlJ5eEpRVUZETEVOQlFVRXNXVUZCUkN4RFFVRmxMRTlCUVdZN1JVRkJTRHM3YzBKQlEyUXNVVUZCUVN4SFFVRmpMRk5CUVVFN1YwRkJSeXhKUVVGRExFTkJRVUVzV1VGQlJDeERRVUZsTEUxQlFXWTdSVUZCU0RzN096czdPMEZCUjJZc1RVRkJUU3hEUVVGRExFOUJRVkFzUjBGQmFVSWlmUT09XG4iLCJcbi8qXG4gICAgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBIb29rcywgSXRlbV9EYXRhLCBMYXp5X0xvYWRlcjtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbkl0ZW1fRGF0YSA9IHJlcXVpcmUoJy4vSXRlbV9EYXRhJyk7XG5cbkxhenlfTG9hZGVyID0gKGZ1bmN0aW9uKCkge1xuICBMYXp5X0xvYWRlci5wcm90b3R5cGUuRWxlbWVudHMgPSB7XG4gICAgaXRlbTogJ1BQX0xhenlfSW1hZ2UnLFxuICAgIHBsYWNlaG9sZGVyOiAnUFBfTGF6eV9JbWFnZV9fcGxhY2Vob2xkZXInXG4gIH07XG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLkRhdGEgPSBbXTtcblxuICBmdW5jdGlvbiBMYXp5X0xvYWRlcigpIHtcbiAgICBjb25zb2xlLmxvZygnQ29uc3RydWN0dXJpbmcnKTtcbiAgICB0aGlzLnNldHVwX2RhdGEoKTtcbiAgICB0aGlzLmF0dGFjaF9ldmVudHMoKTtcbiAgICB0aGlzLnJlc2l6ZV9hbGwoKTtcbiAgICB0aGlzLmxvYWRfYWxsKCk7XG4gIH1cblxuXG4gIC8qXG4gIFx0XHRBYnN0cmFjdCBNZXRob2RzXG4gICAqL1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgTGF6eV9Mb2FkZXJgIG11c3QgaW1wbGVtZW50IGByZXNpemVgIG1ldGhvZFwiKTtcbiAgfTtcblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBMYXp5X0xvYWRlcmAgbXVzdCBpbXBsZW1lbnQgYGxvYWRgIG1ldGhvZFwiKTtcbiAgfTtcblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUuc2V0dXBfZGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciAkaXRlbXM7XG4gICAgJGl0ZW1zID0gJChcIi5cIiArIHRoaXMuRWxlbWVudHMuaXRlbSk7XG4gICAgJGl0ZW1zLmVhY2goKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oa2V5LCBlbCkge1xuICAgICAgICB2YXIgJGVsO1xuICAgICAgICAkZWwgPSAkKGVsKTtcbiAgICAgICAgcmV0dXJuIF90aGlzLkRhdGEucHVzaCh7XG4gICAgICAgICAgZWw6IGVsLFxuICAgICAgICAgICRlbDogJGVsLFxuICAgICAgICAgIGRhdGE6IG5ldyBJdGVtX0RhdGEoJGVsKVxuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9O1xuXG5cbiAgLypcbiAgXHRcdE1ldGhvZHNcbiAgICovXG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLnJlc2l6ZV9hbGwgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaSwgaXRlbSwgbGVuLCByZWYsIHJlc3VsdHM7XG4gICAgcmVmID0gdGhpcy5EYXRhO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGl0ZW0gPSByZWZbaV07XG4gICAgICByZXN1bHRzLnB1c2godGhpcy5yZXNpemUoaXRlbSkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUubG9hZF9hbGwgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaSwgaXRlbSwgbGVuLCByZWYsIHJlc3VsdHM7XG4gICAgcmVmID0gdGhpcy5EYXRhO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGl0ZW0gPSByZWZbaV07XG4gICAgICB0aGlzLmxvYWQoaXRlbSk7XG4gICAgICByZXN1bHRzLnB1c2godGhpcy5yZW1vdmVfcGxhY2Vob2xkZXIoaXRlbSkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUucmVtb3ZlX3BsYWNlaG9sZGVyID0gZnVuY3Rpb24oaXRlbSkge1xuICAgIHJldHVybiBpdGVtLiRlbC5maW5kKFwiLlwiICsgdGhpcy5FbGVtZW50cy5wbGFjZWhvbGRlciArIFwiLCBub3NjcmlwdFwiKS5yZW1vdmUoKTtcbiAgfTtcblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmRldGFjaF9ldmVudHMoKTtcbiAgfTtcblxuICByZXR1cm4gTGF6eV9Mb2FkZXI7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTGF6eV9Mb2FkZXI7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVRHRjZlVjlNYjJGa1pYSXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lKTVlYcDVYMHh2WVdSbGNpNWpiMlptWldVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWp0QlFVRkJPenM3UVVGQlFTeEpRVUZCT3p0QlFVZEJMRU5CUVVFc1IwRkJTU3hQUVVGQkxFTkJRVk1zVVVGQlZEczdRVUZEU2l4TFFVRkJMRWRCUVZFc1QwRkJRU3hEUVVGVExGVkJRVlE3TzBGQlExSXNVMEZCUVN4SFFVRlpMRTlCUVVFc1EwRkJVeXhoUVVGVU96dEJRVVZPTzNkQ1FVVk1MRkZCUVVFc1IwRkRRenRKUVVGQkxFbEJRVUVzUlVGQllTeGxRVUZpTzBsQlEwRXNWMEZCUVN4RlFVRmhMRFJDUVVSaU96czdkMEpCUjBRc1NVRkJRU3hIUVVGTk96dEZRVWRQTEhGQ1FVRkJPMGxCUTFvc1QwRkJUeXhEUVVGRExFZEJRVklzUTBGQldTeG5Ra0ZCV2p0SlFVTkJMRWxCUVVNc1EwRkJRU3hWUVVGRUxFTkJRVUU3U1VGRFFTeEpRVUZETEVOQlFVRXNZVUZCUkN4RFFVRkJPMGxCUTBFc1NVRkJReXhEUVVGQkxGVkJRVVFzUTBGQlFUdEpRVU5CTEVsQlFVTXNRMEZCUVN4UlFVRkVMRU5CUVVFN1JVRk1XVHM3TzBGQlVXSTdPenM3ZDBKQlIwRXNUVUZCUVN4SFFVRlJMRk5CUVVFN1FVRkJSeXhWUVVGVkxFbEJRVUVzUzBGQlFTeERRVUZQTEhsRlFVRlFPMFZCUVdJN08zZENRVU5TTEVsQlFVRXNSMEZCVVN4VFFVRkJPMEZCUVVjc1ZVRkJWU3hKUVVGQkxFdEJRVUVzUTBGQlR5eDFSVUZCVUR0RlFVRmlPenQzUWtGSFVpeFZRVUZCTEVkQlFWa3NVMEZCUVR0QlFVTllMRkZCUVVFN1NVRkJRU3hOUVVGQkxFZEJRVk1zUTBGQlFTeERRVUZITEVkQlFVRXNSMEZCU1N4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExFbEJRV3BDTzBsQlJWUXNUVUZCVFN4RFFVRkRMRWxCUVZBc1EwRkJXU3hEUVVGQkxGTkJRVUVzUzBGQlFUdGhRVUZCTEZOQlFVVXNSMEZCUml4RlFVRlBMRVZCUVZBN1FVRkZXQ3haUVVGQk8xRkJRVUVzUjBGQlFTeEhRVUZOTEVOQlFVRXNRMEZCUnl4RlFVRklPMlZCUTA0c1MwRkJReXhEUVVGQkxFbEJRVWtzUTBGQlF5eEpRVUZPTEVOQlEwTTdWVUZCUVN4RlFVRkJMRVZCUVUwc1JVRkJUanRWUVVOQkxFZEJRVUVzUlVGQlRTeEhRVVJPTzFWQlJVRXNTVUZCUVN4RlFVRlZMRWxCUVVFc1UwRkJRU3hEUVVGWExFZEJRVmdzUTBGR1ZqdFRRVVJFTzAxQlNGYzdTVUZCUVN4RFFVRkJMRU5CUVVFc1EwRkJRU3hKUVVGQkxFTkJRVm83UlVGSVZ6czdPMEZCWTFvN096czdkMEpCUjBFc1ZVRkJRU3hIUVVGWkxGTkJRVUU3UVVGRFdDeFJRVUZCTzBGQlFVRTdRVUZCUVR0VFFVRkJMSEZEUVVGQk96dHRRa0ZCUVN4SlFVRkRMRU5CUVVFc1RVRkJSQ3hEUVVGVExFbEJRVlE3UVVGQlFUczdSVUZFVnpzN2QwSkJSMW9zVVVGQlFTeEhRVUZWTEZOQlFVRTdRVUZEVkN4UlFVRkJPMEZCUVVFN1FVRkJRVHRUUVVGQkxIRkRRVUZCT3p0TlFVTkRMRWxCUVVNc1EwRkJRU3hKUVVGRUxFTkJRVThzU1VGQlVEdHRRa0ZEUVN4SlFVRkRMRU5CUVVFc2EwSkJRVVFzUTBGQmNVSXNTVUZCY2tJN1FVRkdSRHM3UlVGRVV6czdkMEpCUzFZc2EwSkJRVUVzUjBGQmIwSXNVMEZCUlN4SlFVRkdPMWRCUTI1Q0xFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNTVUZCVkN4RFFVRmxMRWRCUVVFc1IwRkJTU3hKUVVGRExFTkJRVUVzVVVGQlVTeERRVUZETEZkQlFXUXNSMEZCTUVJc1dVRkJla01zUTBGQmMwUXNRMEZCUXl4TlFVRjJSQ3hEUVVGQk8wVkJSRzFDT3p0M1FrRkpjRUlzVDBGQlFTeEhRVUZUTEZOQlFVRTdWMEZEVWl4SlFVRkRMRU5CUVVFc1lVRkJSQ3hEUVVGQk8wVkJSRkU3T3pzN096dEJRVWxXTEUxQlFVMHNRMEZCUXl4UFFVRlFMRWRCUVdsQ0luMD1cbiIsInZhciAkLCBMYXp5X0xvYWRlciwgTGF6eV9NYXNvbnJ5LFxuICBiaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfSxcbiAgZXh0ZW5kID0gZnVuY3Rpb24oY2hpbGQsIHBhcmVudCkgeyBmb3IgKHZhciBrZXkgaW4gcGFyZW50KSB7IGlmIChoYXNQcm9wLmNhbGwocGFyZW50LCBrZXkpKSBjaGlsZFtrZXldID0gcGFyZW50W2tleV07IH0gZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9IGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTsgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTsgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTsgcmV0dXJuIGNoaWxkOyB9LFxuICBoYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHk7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5MYXp5X0xvYWRlciA9IHJlcXVpcmUoJy4vTGF6eV9Mb2FkZXInKTtcblxuTGF6eV9NYXNvbnJ5ID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgZXh0ZW5kKExhenlfTWFzb25yeSwgc3VwZXJDbGFzcyk7XG5cbiAgZnVuY3Rpb24gTGF6eV9NYXNvbnJ5KCkge1xuICAgIHRoaXMuaGFuZGxlX3Njcm9sbCA9IGJpbmQodGhpcy5oYW5kbGVfc2Nyb2xsLCB0aGlzKTtcbiAgICByZXR1cm4gTGF6eV9NYXNvbnJ5Ll9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0uJGVsLmNzcyh7XG4gICAgICAnbWluLWhlaWdodCc6IE1hdGguZmxvb3IodGhpcy5nZXRfd2lkdGgoKSAvIGl0ZW0uZGF0YS5nZXRfcmF0aW8oKSlcbiAgICB9KTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmdldF93aWR0aCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAkKCcuUFBfTWFzb25yeV9fc2l6ZXInKS53aWR0aCgpO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICB2YXIgJGltYWdlLCBmdWxsLCB0aHVtYjtcbiAgICB0aHVtYiA9IGl0ZW0uZGF0YS5nZXRfdXJsKCd0aHVtYicpO1xuICAgIGZ1bGwgPSBpdGVtLmRhdGEuZ2V0X3VybCgnZnVsbCcpO1xuICAgIGl0ZW0uJGVsLnByZXBlbmQoXCI8YSBocmVmPVxcXCJcIiArIGZ1bGwgKyBcIlxcXCIgcmVsPVxcXCJnYWxsZXJ5XFxcIj5cXG48aW1nIHNyYz1cXFwiXCIgKyB0aHVtYiArIFwiXFxcIiBjbGFzcz1cXFwiaXMtbG9hZGluZ1xcXCIgLz5cXG48L2E+XCIpLnJlbW92ZUNsYXNzKCdMYXp5LUltYWdlJyk7XG4gICAgJGltYWdlID0gaXRlbS4kZWwuZmluZCgnaW1nJyk7XG4gICAgcmV0dXJuICRpbWFnZS5pbWFnZXNMb2FkZWQoZnVuY3Rpb24oKSB7XG4gICAgICAkaW1hZ2UuYWRkQ2xhc3MoJ2lzLWxvYWRlZCcpLnJlbW92ZUNsYXNzKCdpcy1sb2FkaW5nJyk7XG4gICAgICByZXR1cm4gaXRlbS4kZWwuY3NzKCdtaW4taGVpZ2h0JywgJycpLnJlbW92ZUNsYXNzKCdsYXp5LWltYWdlJyk7XG4gICAgfSk7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5oYW5kbGVfc2Nyb2xsID0gZnVuY3Rpb24oZSkge1xuICAgIHJldHVybiBjb25zb2xlLmxvZyhcIlNjcm9sbFwiKTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmF0dGFjaF9ldmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJCh3aW5kb3cpLm9uKCdzY3JvbGwnLCB0aGlzLmhhbmRsZV9zY3JvbGwpO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUuZGV0YWNoX2V2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAkKHdpbmRvdykub2ZmKCdzY3JvbGwnLCB0aGlzLmhhbmRsZV9zY3JvbGwpO1xuICB9O1xuXG4gIHJldHVybiBMYXp5X01hc29ucnk7XG5cbn0pKExhenlfTG9hZGVyKTtcblxubW9kdWxlLmV4cG9ydHMgPSBMYXp5X01hc29ucnk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVRHRjZlVjlOWVhOdmJuSjVMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaVRHRjZlVjlOWVhOdmJuSjVMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRU3hKUVVGQkxEUkNRVUZCTzBWQlFVRTdPenM3UVVGQlFTeERRVUZCTEVkQlFVa3NUMEZCUVN4RFFVRlRMRkZCUVZRN08wRkJRMG9zVjBGQlFTeEhRVUZqTEU5QlFVRXNRMEZCVXl4bFFVRlVPenRCUVVkU096czdPenM3T3p0NVFrRkZUQ3hOUVVGQkxFZEJRVkVzVTBGQlJTeEpRVUZHTzFkQlExQXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhIUVVGVUxFTkJRV0U3VFVGQlFTeFpRVUZCTEVWQlFXTXNTVUZCU1N4RFFVRkRMRXRCUVV3c1EwRkJXU3hKUVVGRExFTkJRVUVzVTBGQlJDeERRVUZCTEVOQlFVRXNSMEZCWlN4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExGTkJRVllzUTBGQlFTeERRVUV6UWl4RFFVRmtPMHRCUVdJN1JVRkVUenM3ZVVKQlNWSXNVMEZCUVN4SFFVRlhMRk5CUVVFN1YwRkZWaXhEUVVGQkxFTkJRVWNzYjBKQlFVZ3NRMEZCZVVJc1EwRkJReXhMUVVFeFFpeERRVUZCTzBWQlJsVTdPM2xDUVV0WUxFbEJRVUVzUjBGQlRTeFRRVUZGTEVsQlFVWTdRVUZGVEN4UlFVRkJPMGxCUVVFc1MwRkJRU3hIUVVGUkxFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVml4RFFVRnRRaXhQUVVGdVFqdEpRVU5TTEVsQlFVRXNSMEZCVHl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFOUJRVllzUTBGQmJVSXNUVUZCYmtJN1NVRkZVQ3hKUVVGSkxFTkJRVU1zUjBGRFRDeERRVUZETEU5QlJFUXNRMEZEVlN4WlFVRkJMRWRCUTBjc1NVRkVTQ3hIUVVOUkxHdERRVVJTTEVkQlJVa3NTMEZHU2l4SFFVVlZMR3REUVVod1FpeERRVTFCTEVOQlFVTXNWMEZPUkN4RFFVMWpMRmxCVG1RN1NVRlRRU3hOUVVGQkxFZEJRVk1zU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4SlFVRlVMRU5CUVdVc1MwRkJaanRYUVVWVUxFMUJRVTBzUTBGQlF5eFpRVUZRTEVOQlFXOUNMRk5CUVVFN1RVRkRia0lzVFVGQlRTeERRVUZETEZGQlFWQXNRMEZCYVVJc1YwRkJha0lzUTBGQk9FSXNRMEZCUXl4WFFVRXZRaXhEUVVFMFF5eFpRVUUxUXp0aFFVTkJMRWxCUVVrc1EwRkJReXhIUVVOTUxFTkJRVU1zUjBGRVJDeERRVU5OTEZsQlJFNHNSVUZEYjBJc1JVRkVjRUlzUTBGRlFTeERRVUZETEZkQlJrUXNRMEZGWXl4WlFVWmtPMGxCUm0xQ0xFTkJRWEJDTzBWQmFFSkxPenQ1UWtGNVFrNHNZVUZCUVN4SFFVRmxMRk5CUVVVc1EwRkJSanRYUVVOa0xFOUJRVThzUTBGQlF5eEhRVUZTTEVOQlFWa3NVVUZCV2p0RlFVUmpPenQ1UWtGSFppeGhRVUZCTEVkQlFXVXNVMEZCUVR0WFFVTmtMRU5CUVVFc1EwRkJSeXhOUVVGSUxFTkJRVmNzUTBGQlF5eEZRVUZhTEVOQlFXVXNVVUZCWml4RlFVRjVRaXhKUVVGRExFTkJRVUVzWVVGQk1VSTdSVUZFWXpzN2VVSkJSMllzWVVGQlFTeEhRVUZsTEZOQlFVRTdWMEZEWkN4RFFVRkJMRU5CUVVjc1RVRkJTQ3hEUVVGWExFTkJRVU1zUjBGQldpeERRVUZuUWl4UlFVRm9RaXhGUVVFd1FpeEpRVUZETEVOQlFVRXNZVUZCTTBJN1JVRkVZenM3T3p0SFFURkRWenM3UVVFMlF6TkNMRTFCUVUwc1EwRkJReXhQUVVGUUxFZEJRV2xDSW4wPVxuIiwidmFyICQsIEhvb2tzLCBMYXp5X01hc29ucnksIE1hc29ucnk7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5NYXNvbnJ5ID0gcmVxdWlyZSgnLi9jbGFzcy9NYXNvbnJ5Jyk7XG5cbkxhenlfTWFzb25yeSA9IHJlcXVpcmUoJy4vbGF6eS9MYXp5X01hc29ucnknKTtcblxuSG9va3MuYWRkQWN0aW9uKCdwcC5tYXNvbnJ5LnN0YXJ0L2JlZm9yZScsIGZ1bmN0aW9uKCkge1xuICB2YXIgTGF6eV9IYW5kbGVyO1xuICBMYXp5X0hhbmRsZXIgPSBIb29rcy5hcHBseUZpbHRlcnMoJ3BwLmxhenkuaGFuZGxlcicsIExhenlfTWFzb25yeSk7XG4gIHJldHVybiBuZXcgTGF6eV9IYW5kbGVyKCk7XG59KTtcblxuSG9va3MuYWRkQWN0aW9uKCdwcC5yZWFkeScsIGZ1bmN0aW9uKCkge1xuICBpZiAoJCgnLlBQX01hc29ucnknKS5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIEhvb2tzLmFkZEZpbHRlcigncHAucG9ydGZvbGlvLmhhbmRsZXInLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgTWFzb25yeSgpO1xuICAgIH0pO1xuICB9XG59KTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYldGemIyNXllUzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYkltMWhjMjl1Y25rdVkyOW1abVZsSWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUpCUVVGQkxFbEJRVUU3TzBGQlFVRXNRMEZCUVN4SFFVRkpMRTlCUVVFc1EwRkJVeXhSUVVGVU96dEJRVU5LTEV0QlFVRXNSMEZCVVN4UFFVRkJMRU5CUVZNc1ZVRkJWRHM3UVVGRFVpeFBRVUZCTEVkQlFWVXNUMEZCUVN4RFFVRlRMR2xDUVVGVU96dEJRVU5XTEZsQlFVRXNSMEZCWlN4UFFVRkJMRU5CUVZNc2NVSkJRVlE3TzBGQlJXWXNTMEZCU3l4RFFVRkRMRk5CUVU0c1EwRkJaMElzZVVKQlFXaENMRVZCUVRKRExGTkJRVUU3UVVGSE1VTXNUVUZCUVR0RlFVRkJMRmxCUVVFc1IwRkJaU3hMUVVGTExFTkJRVU1zV1VGQlRpeERRVUZ0UWl4cFFrRkJia0lzUlVGQmMwTXNXVUZCZEVNN1UwRkRXQ3hKUVVGQkxGbEJRVUVzUTBGQlFUdEJRVXB6UXl4RFFVRXpRenM3UVVGUFFTeExRVUZMTEVOQlFVTXNVMEZCVGl4RFFVRm5RaXhWUVVGb1FpeEZRVUUwUWl4VFFVRkJPMFZCUXpOQ0xFbEJRVWNzUTBGQlFTeERRVUZITEdGQlFVZ3NRMEZCYTBJc1EwRkJReXhOUVVGdVFpeEhRVUUwUWl4RFFVRXZRanRYUVVORExFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMSE5DUVVGb1FpeEZRVUYzUXl4VFFVRkJPMkZCUVU4c1NVRkJRU3hQUVVGQkxFTkJRVUU3U1VGQlVDeERRVUY0UXl4RlFVUkVPenRCUVVReVFpeERRVUUxUWlKOVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
