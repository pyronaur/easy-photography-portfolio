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

},{"./class/Portfolio":3,"./class/State_Manager":4,"./masonry":9}],2:[function(require,module,exports){
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
(function (global){
var Hooks, get_size;

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

get_size = function() {
  return {
    width: window.innerWidth || $window.width(),
    height: window.innerHeight || $window.height()
  };
};

module.exports = get_size();


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],6:[function(require,module,exports){
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


},{}],7:[function(require,module,exports){
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

  Lazy_Loader.prototype.Items = [];

  function Lazy_Loader() {
    this.setup_data();
    this.resize_all();
    this.attach_events();
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

  Lazy_Loader.prototype.autoload = function() {
    throw new Error("[Abstract] Any subclass of `Lazy_Loader` must implement `autoload` method");
  };

  Lazy_Loader.prototype.setup_data = function() {
    var $items;
    $items = $("." + this.Elements.item);
    $items.each((function(_this) {
      return function(key, el) {
        var $el;
        $el = $(el);
        return _this.Items.push({
          el: el,
          $el: $el,
          data: new Item_Data($el),
          loaded: false
        });
      };
    })(this));
  };


  /*
  		Methods
   */

  Lazy_Loader.prototype.resize_all = function() {
    var i, item, len, ref, results;
    ref = this.Items;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      item = ref[i];
      results.push(this.resize(item));
    }
    return results;
  };

  Lazy_Loader.prototype.load_all = function() {
    var i, item, len, ref, results;
    ref = this.Items;
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

  Lazy_Loader.prototype.attach_events = function() {
    return Hooks.addAction('pp.lazy.autoload', this.autoload);
  };

  Lazy_Loader.prototype.detach_events = function() {
    return Hooks.removeAction('pp.lazy.autoload', this.autoload);
  };

  return Lazy_Loader;

})();

module.exports = Lazy_Loader;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./Item_Data":6}],8:[function(require,module,exports){
(function (global){
var $, Lazy_Loader, Lazy_Masonry, __WINDOW,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Lazy_Loader = require('./Lazy_Loader');

__WINDOW = require('../global/Window');

Lazy_Masonry = (function(superClass) {
  extend(Lazy_Masonry, superClass);

  function Lazy_Masonry() {
    this.load_items_in_view = bind(this.load_items_in_view, this);
    this.autoload = bind(this.autoload, this);
    this.debounced_load_items_in_view = _.debounce(this.load_items_in_view, 50);
    Lazy_Masonry.__super__.constructor.call(this);
  }

  Lazy_Masonry.prototype.resize = function(item) {
    return item.$el.css({
      'min-height': Math.floor(this.get_width() / item.data.get_ratio())
    });
  };

  Lazy_Masonry.prototype.get_width = function() {
    return $('.PP_Masonry__sizer').width();
  };

  Lazy_Masonry.prototype.autoload = function() {
    return this.load_items_in_view();
  };

  Lazy_Masonry.prototype.load = function(item) {
    var $image, full, thumb;
    thumb = item.data.get_url('thumb');
    full = item.data.get_url('full');
    item.$el.prepend("<a href=\"" + full + "\" rel=\"gallery\">\n<img src=\"" + thumb + "\" class=\"is-loading\" />\n</a>").removeClass('Lazy-Image');
    item.loaded = true;
    $image = item.$el.find('img');
    return $image.imagesLoaded((function(_this) {
      return function() {
        $image.addClass('is-loaded').removeClass('is-loading');
        return item.$el.css('min-height', '').removeClass(_this.Elements.item).find("." + _this.Elements.placeholder).fadeOut(400, function() {
          return $(this).remove();
        });
      };
    })(this));
  };

  Lazy_Masonry.prototype.load_items_in_view = function() {
    var i, item, key, len, ref, results;
    ref = this.Items;
    results = [];
    for (key = i = 0, len = ref.length; i < len; key = ++i) {
      item = ref[key];
      if (!item.loaded && this.in_loose_view(item.el)) {
        results.push(this.load(item));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  Lazy_Masonry.prototype.in_loose_view = function(el) {
    var rect, sensitivity;
    if (el.getBoundingClientRect == null) {
      return true;
    }
    rect = el.getBoundingClientRect();
    sensitivity = 100;
    return rect.top + rect.height >= -sensitivity && rect.bottom - rect.height <= __WINDOW.height + sensitivity && rect.left + rect.width >= -sensitivity && rect.right - rect.width <= __WINDOW.width + sensitivity;
  };

  Lazy_Masonry.prototype.attach_events = function() {
    $(window).on('scroll', this.debounced_load_items_in_view);
    return Lazy_Masonry.__super__.attach_events.call(this);
  };

  Lazy_Masonry.prototype.detach_events = function() {
    $(window).off('scroll', this.debounced_load_items_in_view);
    return Lazy_Masonry.__super__.detach_events.call(this);
  };

  return Lazy_Masonry;

})(Lazy_Loader);

module.exports = Lazy_Masonry;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../global/Window":5,"./Lazy_Loader":7}],9:[function(require,module,exports){
(function (global){
var $, Hooks, Lazy_Masonry, Masonry;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Masonry = require('./class/Masonry');

Lazy_Masonry = require('./lazy/Lazy_Masonry');

Hooks.addAction('pp.masonry.start/before', function() {
  var Lazy_Handler;
  Lazy_Handler = Hooks.applyFilters('pp.lazy.handler', Lazy_Masonry);
  new Lazy_Handler();
});

Hooks.addAction('pp.masonry.start/complete', function() {
  return Hooks.doAction('pp.lazy.autoload');
});

Hooks.addAction('pp.ready', function() {
  if ($('.PP_Masonry').length > 0) {
    return Hooks.addFilter('pp.portfolio.handler', function() {
      return new Masonry();
    });
  }
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./class/Masonry":2,"./lazy/Lazy_Masonry":8}]},{},[1])


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jbGFzcy9NYXNvbnJ5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jbGFzcy9Qb3J0Zm9saW8uY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2NsYXNzL1N0YXRlX01hbmFnZXIuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dsb2JhbC9XaW5kb3cuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvSXRlbV9EYXRhLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0xhenlfTG9hZGVyLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0xhenlfTWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvbWFzb25yeS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgQXBwX1N0YXRlLCBIb29rcywgUG9ydGZvbGlvLCBTdGF0ZV9NYW5hZ2VyO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5Qb3J0Zm9saW8gPSByZXF1aXJlKCcuL2NsYXNzL1BvcnRmb2xpbycpO1xuXG5TdGF0ZV9NYW5hZ2VyID0gcmVxdWlyZSgnLi9jbGFzcy9TdGF0ZV9NYW5hZ2VyJyk7XG5cbkFwcF9TdGF0ZSA9IG5ldyBTdGF0ZV9NYW5hZ2VyKCk7XG5cbkhvb2tzLmFkZEFjdGlvbigncHAubG9hZGVkJywgZnVuY3Rpb24oKSB7XG4gIHZhciBwb3J0Zm9saW87XG4gIHJldHVybiBwb3J0Zm9saW8gPSBuZXcgUG9ydGZvbGlvKCk7XG59KTtcblxucmVxdWlyZSgnLi9tYXNvbnJ5Jyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVlYQndMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaVlYQndMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaU8wRkJRVUU3T3p0QlFVRkJMRWxCUVVFN08wRkJSMEVzUzBGQlFTeEhRVUZSTEU5QlFVRXNRMEZCVXl4VlFVRlVPenRCUVVOU0xGTkJRVUVzUjBGQldTeFBRVUZCTEVOQlFWTXNiVUpCUVZRN08wRkJRMW9zWVVGQlFTeEhRVUZuUWl4UFFVRkJMRU5CUVZNc2RVSkJRVlE3TzBGQlIyaENMRk5CUVVFc1IwRkJaMElzU1VGQlFTeGhRVUZCTEVOQlFVRTdPMEZCU1doQ0xFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMRmRCUVdoQ0xFVkJRVFpDTEZOQlFVRTdRVUZETlVJc1RVRkJRVHRUUVVGQkxGTkJRVUVzUjBGQlowSXNTVUZCUVN4VFFVRkJMRU5CUVVFN1FVRkVXU3hEUVVFM1FqczdRVUZKUVN4UFFVRkJMRU5CUVZFc1YwRkJVaUo5XG4iLCJcbi8qXG4gICAgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBIb29rcywgTWFzb25yeSxcbiAgYmluZCA9IGZ1bmN0aW9uKGZuLCBtZSl7IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7IH07IH07XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5NYXNvbnJ5ID0gKGZ1bmN0aW9uKCkge1xuICBNYXNvbnJ5LnByb3RvdHlwZS5FbGVtZW50cyA9IHtcbiAgICBjb250YWluZXI6ICdQUF9NYXNvbnJ5JyxcbiAgICBzaXplcjogJ1BQX01hc29ucnlfX3NpemVyJyxcbiAgICBpdGVtOiAnUFBfTWFzb25yeV9faXRlbSdcbiAgfTtcblxuICBmdW5jdGlvbiBNYXNvbnJ5KCRwYXJlbnQpIHtcbiAgICBpZiAoJHBhcmVudCA9PSBudWxsKSB7XG4gICAgICAkcGFyZW50ID0gJChkb2N1bWVudCk7XG4gICAgfVxuICAgIHRoaXMucmVmcmVzaCA9IGJpbmQodGhpcy5yZWZyZXNoLCB0aGlzKTtcbiAgICB0aGlzLmRlc3Ryb3kgPSBiaW5kKHRoaXMuZGVzdHJveSwgdGhpcyk7XG4gICAgdGhpcy5jcmVhdGUgPSBiaW5kKHRoaXMuY3JlYXRlLCB0aGlzKTtcbiAgICB0aGlzLiRjb250YWluZXIgPSAkcGFyZW50LmZpbmQoXCIuXCIgKyB0aGlzLkVsZW1lbnRzLmNvbnRhaW5lcik7XG4gICAgdGhpcy5jcmVhdGUoKTtcbiAgfVxuXG4gIE1hc29ucnkucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLiRjb250YWluZXIubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuJGNvbnRhaW5lci5hZGRDbGFzcygnaXMtcHJlcGFyaW5nLW1hc29ucnknKTtcbiAgICB0aGlzLm1heWJlX2NyZWF0ZV9zaXplcigpO1xuICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5tYXNvbnJ5LnN0YXJ0L2JlZm9yZScpO1xuICAgIHRoaXMuJGNvbnRhaW5lci5tYXNvbnJ5KHtcbiAgICAgIGl0ZW1TZWxlY3RvcjogXCIuXCIgKyB0aGlzLkVsZW1lbnRzLml0ZW0sXG4gICAgICBjb2x1bW5XaWR0aDogXCIuXCIgKyB0aGlzLkVsZW1lbnRzLnNpemVyLFxuICAgICAgZ3V0dGVyOiAwLFxuICAgICAgaW5pdExheW91dDogZmFsc2VcbiAgICB9KTtcbiAgICB0aGlzLiRjb250YWluZXIubWFzb25yeSgnb24nLCAnbGF5b3V0Q29tcGxldGUnLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgX3RoaXMuJGNvbnRhaW5lci5yZW1vdmVDbGFzcygnaXMtcHJlcGFyaW5nLW1hc29ucnknKTtcbiAgICAgICAgcmV0dXJuIEhvb2tzLmRvQWN0aW9uKCdwcC5tYXNvbnJ5LnN0YXJ0L2NvbXBsZXRlJyk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICB0aGlzLiRjb250YWluZXIubWFzb25yeSgpO1xuICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5tYXNvbnJ5LnN0YXJ0L2xheW91dCcpO1xuICB9O1xuXG4gIE1hc29ucnkucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLm1heWJlX3JlbW92ZV9zaXplcigpO1xuICAgIGlmICh0aGlzLiRjb250YWluZXIubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy4kY29udGFpbmVyLm1hc29ucnkoJ2Rlc3Ryb3knKTtcbiAgICB9XG4gIH07XG5cbiAgTWFzb25yeS5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLiRjb250YWluZXIubWFvc25yeSgnbGF5b3V0Jyk7XG4gIH07XG5cblxuICAvKlxuICBcbiAgXHRcdENyZWF0ZSBhIHNpemVyIGVsZW1lbnQgZm9yIGpxdWVyeS1tYXNvbnJ5IHRvIHVzZVxuICAgKi9cblxuICBNYXNvbnJ5LnByb3RvdHlwZS5tYXliZV9jcmVhdGVfc2l6ZXIgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5zaXplcl9kb2VzbnRfZXhpc3QoKSkge1xuICAgICAgdGhpcy5jcmVhdGVfc2l6ZXIoKTtcbiAgICB9XG4gIH07XG5cbiAgTWFzb25yeS5wcm90b3R5cGUubWF5YmVfcmVtb3ZlX3NpemVyID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuJGNvbnRhaW5lci5sZW5ndGggIT09IDEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy4kY29udGFpbmVyLmZpbmQoXCIuXCIgKyB0aGlzLkVsZW1lbnRzLnNpemVyKS5yZW1vdmUoKTtcbiAgfTtcblxuICBNYXNvbnJ5LnByb3RvdHlwZS5zaXplcl9kb2VzbnRfZXhpc3QgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy4kY29udGFpbmVyLmZpbmQoXCIuXCIgKyB0aGlzLkVsZW1lbnRzLnNpemVyKS5sZW5ndGggPT09IDA7XG4gIH07XG5cbiAgTWFzb25yeS5wcm90b3R5cGUuY3JlYXRlX3NpemVyID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kY29udGFpbmVyLmFwcGVuZChcIjxkaXYgY2xhc3M9XFxcIlwiICsgdGhpcy5FbGVtZW50cy5zaXplciArIFwiXFxcIj48L2Rpdj5cIik7XG4gIH07XG5cbiAgcmV0dXJuIE1hc29ucnk7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTWFzb25yeTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVFdGemIyNXllUzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklrMWhjMjl1Y25rdVkyOW1abVZsSWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUk3UVVGQlFUczdPMEZCUVVFc1NVRkJRU3hwUWtGQlFUdEZRVUZCT3p0QlFVZEJMRU5CUVVFc1IwRkJTU3hQUVVGQkxFTkJRVk1zVVVGQlZEczdRVUZEU2l4TFFVRkJMRWRCUVZFc1QwRkJRU3hEUVVGVExGVkJRVlE3TzBGQlJVWTdiMEpCUlV3c1VVRkJRU3hIUVVORE8wbEJRVUVzVTBGQlFTeEZRVUZYTEZsQlFWZzdTVUZEUVN4TFFVRkJMRVZCUVZjc2JVSkJSRmc3U1VGRlFTeEpRVUZCTEVWQlFWY3NhMEpCUmxnN096dEZRVTlaTEdsQ1FVRkZMRTlCUVVZN08wMUJRVVVzVlVGQlZTeERRVUZCTEVOQlFVY3NVVUZCU0RzN096czdTVUZEZUVJc1NVRkJReXhEUVVGQkxGVkJRVVFzUjBGQll5eFBRVUZQTEVOQlFVTXNTVUZCVWl4RFFVRmpMRWRCUVVFc1IwRkJTU3hKUVVGRExFTkJRVUVzVVVGQlVTeERRVUZETEZOQlFUVkNPMGxCUldRc1NVRkJReXhEUVVGQkxFMUJRVVFzUTBGQlFUdEZRVWhaT3p0dlFrRk5ZaXhOUVVGQkxFZEJRVkVzVTBGQlFUdEpRVU5RTEVsQlFWVXNTVUZCUXl4RFFVRkJMRlZCUVZVc1EwRkJReXhOUVVGYUxFdEJRWE5DTEVOQlFXaERPMEZCUVVFc1lVRkJRVHM3U1VGRlFTeEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRkZCUVZvc1EwRkJjMElzYzBKQlFYUkNPMGxCUlVFc1NVRkJReXhEUVVGQkxHdENRVUZFTEVOQlFVRTdTVUZEUVN4TFFVRkxMRU5CUVVNc1VVRkJUaXhEUVVGbExIbENRVUZtTzBsQlIwRXNTVUZCUXl4RFFVRkJMRlZCUVZVc1EwRkJReXhQUVVGYUxFTkJRME03VFVGQlFTeFpRVUZCTEVWQlFXTXNSMEZCUVN4SFFVRkpMRWxCUVVNc1EwRkJRU3hSUVVGUkxFTkJRVU1zU1VGQk5VSTdUVUZEUVN4WFFVRkJMRVZCUVdNc1IwRkJRU3hIUVVGSkxFbEJRVU1zUTBGQlFTeFJRVUZSTEVOQlFVTXNTMEZFTlVJN1RVRkZRU3hOUVVGQkxFVkJRV01zUTBGR1pEdE5RVWRCTEZWQlFVRXNSVUZCWXl4TFFVaGtPMHRCUkVRN1NVRlBRU3hKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEU5QlFWb3NRMEZCYjBJc1NVRkJjRUlzUlVGQk1FSXNaMEpCUVRGQ0xFVkJRVFJETEVOQlFVRXNVMEZCUVN4TFFVRkJPMkZCUVVFc1UwRkJRVHRSUVVNelF5eExRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRmRCUVZvc1EwRkJlVUlzYzBKQlFYcENPMlZCUTBFc1MwRkJTeXhEUVVGRExGRkJRVTRzUTBGQlpTd3lRa0ZCWmp0TlFVWXlRenRKUVVGQkxFTkJRVUVzUTBGQlFTeERRVUZCTEVsQlFVRXNRMEZCTlVNN1NVRkxRU3hKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEU5QlFWb3NRMEZCUVR0SlFVTkJMRXRCUVVzc1EwRkJReXhSUVVGT0xFTkJRV1VzZVVKQlFXWTdSVUYwUWs4N08yOUNRVFJDVWl4UFFVRkJMRWRCUVZNc1UwRkJRVHRKUVVOU0xFbEJRVU1zUTBGQlFTeHJRa0ZCUkN4RFFVRkJPMGxCUlVFc1NVRkJSeXhKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEUxQlFWb3NSMEZCY1VJc1EwRkJlRUk3VFVGRFF5eEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRTlCUVZvc1EwRkJjVUlzVTBGQmNrSXNSVUZFUkRzN1JVRklVVHM3YjBKQlUxUXNUMEZCUVN4SFFVRlRMRk5CUVVFN1YwRkRVaXhKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEU5QlFWb3NRMEZCY1VJc1VVRkJja0k3UlVGRVVUczdPMEZCUjFRN096czdPMjlDUVV0QkxHdENRVUZCTEVkQlFXOUNMRk5CUVVFN1NVRkRia0lzU1VGQmJVSXNTVUZCUXl4RFFVRkJMR3RDUVVGRUxFTkJRVUVzUTBGQmJrSTdUVUZCUVN4SlFVRkRMRU5CUVVFc1dVRkJSQ3hEUVVGQkxFVkJRVUU3TzBWQlJHMUNPenR2UWtGSmNFSXNhMEpCUVVFc1IwRkJiMElzVTBGQlFUdEpRVU51UWl4SlFVRlZMRWxCUVVNc1EwRkJRU3hWUVVGVkxFTkJRVU1zVFVGQldpeExRVUYzUWl4RFFVRnNRenRCUVVGQkxHRkJRVUU3TzBsQlEwRXNTVUZCUXl4RFFVRkJMRlZCUVZVc1EwRkJReXhKUVVGYUxFTkJRV3RDTEVkQlFVRXNSMEZCU1N4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExFdEJRV2hETEVOQlFYbERMRU5CUVVNc1RVRkJNVU1zUTBGQlFUdEZRVVp0UWpzN2IwSkJTM0JDTEd0Q1FVRkJMRWRCUVc5Q0xGTkJRVUU3VjBGQlJ5eEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRWxCUVZvc1EwRkJhMElzUjBGQlFTeEhRVUZKTEVsQlFVTXNRMEZCUVN4UlFVRlJMRU5CUVVNc1MwRkJhRU1zUTBGQmVVTXNRMEZCUXl4TlFVRXhReXhMUVVGdlJEdEZRVUYyUkRzN2IwSkJSM0JDTEZsQlFVRXNSMEZCWXl4VFFVRkJPMGxCUTJJc1NVRkJReXhEUVVGQkxGVkJRVlVzUTBGQlF5eE5RVUZhTEVOQlFXMUNMR1ZCUVVFc1IwRkJhVUlzU1VGQlF5eERRVUZCTEZGQlFWRXNRMEZCUXl4TFFVRXpRaXhIUVVGcFF5eFhRVUZ3UkR0RlFVUmhPenM3T3pzN1FVRk5aaXhOUVVGTkxFTkJRVU1zVDBGQlVDeEhRVUZwUWlKOVxuIiwidmFyIEhvb2tzLCBQb3J0Zm9saW87XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cblBvcnRmb2xpbyA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gUG9ydGZvbGlvKCkge1xuXG4gICAgLypcbiAgICAgIFx0XHRFdmVudCBCYXNlZCBQb3J0Zm9saW8gaXMgZ29pbmcgdG8gc3RhcnQgc29vblxuICAgICAqL1xuICAgIHRoaXMuaGFuZGxlciA9IEhvb2tzLmFwcGx5RmlsdGVycygncHAucG9ydGZvbGlvLmhhbmRsZXInLCBmYWxzZSk7XG4gICAgaWYgKHRoaXMuaGFuZGxlcikge1xuICAgICAgSG9va3MuYWRkQWN0aW9uKCdwcC5wb3J0Zm9saW8uY3JlYXRlJywgdGhpcy5oYW5kbGVyLmNyZWF0ZSwgNTApO1xuICAgICAgSG9va3MuYWRkQWN0aW9uKCdwcC5wb3J0Zm9saW8ucmVmcmVzaCcsIHRoaXMuaGFuZGxlci5yZWZyZXNoLCA1MCk7XG4gICAgICBIb29rcy5hZGRBY3Rpb24oJ3BwLnBvcnRmb2xpby5kZXN0cm95JywgdGhpcy5oYW5kbGVyLmRlc3Ryb3ksIDUwKTtcbiAgICAgIEhvb2tzLmFkZEFjdGlvbigncHAucG9ydGZvbGlvLmRlc3Ryb3knLCB0aGlzLmF1dG9fZGVzdHJveSwgNTAwKTtcbiAgICB9XG4gIH1cblxuICBQb3J0Zm9saW8ucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5wb3J0Zm9saW8uY3JlYXRlJyk7XG4gIH07XG5cbiAgUG9ydGZvbGlvLnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MuZG9BY3Rpb24oJ3BwLnBvcnRmb2xpby5yZWZyZXNoJyk7XG4gIH07XG5cbiAgUG9ydGZvbGlvLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MuZG9BY3Rpb24oJ3BwLnBvcnRmb2xpby5kZXN0cm95Jyk7XG4gIH07XG5cbiAgUG9ydGZvbGlvLnByb3RvdHlwZS5hdXRvX2Rlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICBIb29rcy5yZW1vdmVBY3Rpb24oJ3BwLnBvcnRmb2xpby5jcmVhdGUnLCB0aGlzLmhhbmRsZXIuY3JlYXRlLCA1MCk7XG4gICAgSG9va3MucmVtb3ZlQWN0aW9uKCdwcC5wb3J0Zm9saW8ucmVmcmVzaCcsIHRoaXMuaGFuZGxlci5yZWZyZXNoLCA1MCk7XG4gICAgcmV0dXJuIEhvb2tzLnJlbW92ZUFjdGlvbigncHAucG9ydGZvbGlvLmRlc3Ryb3knLCB0aGlzLmhhbmRsZXIuZGVzdHJveSwgNTApO1xuICB9O1xuXG4gIHJldHVybiBQb3J0Zm9saW87XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gUG9ydGZvbGlvO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lVRzl5ZEdadmJHbHZMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaVVHOXlkR1p2YkdsdkxtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeEpRVUZCT3p0QlFVRkJMRXRCUVVFc1IwRkJVU3hQUVVGQkxFTkJRVk1zVlVGQlZEczdRVUZGUmp0RlFVVlJMRzFDUVVGQk96dEJRVU5hT3pzN1NVRkhRU3hKUVVGRExFTkJRVUVzVDBGQlJDeEhRVUZYTEV0QlFVc3NRMEZCUXl4WlFVRk9MRU5CUVcxQ0xITkNRVUZ1UWl4RlFVRXlReXhMUVVFelF6dEpRVVZZTEVsQlFVY3NTVUZCUXl4RFFVRkJMRTlCUVVvN1RVRkZReXhMUVVGTExFTkJRVU1zVTBGQlRpeERRVUZuUWl4eFFrRkJhRUlzUlVGQmRVTXNTVUZCUXl4RFFVRkJMRTlCUVU4c1EwRkJReXhOUVVGb1JDeEZRVUYzUkN4RlFVRjRSRHROUVVOQkxFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMSE5DUVVGb1FpeEZRVUYzUXl4SlFVRkRMRU5CUVVFc1QwRkJUeXhEUVVGRExFOUJRV3BFTEVWQlFUQkVMRVZCUVRGRU8wMUJRMEVzUzBGQlN5eERRVUZETEZOQlFVNHNRMEZCWjBJc2MwSkJRV2hDTEVWQlFYZERMRWxCUVVNc1EwRkJRU3hQUVVGUExFTkJRVU1zVDBGQmFrUXNSVUZCTUVRc1JVRkJNVVE3VFVGSFFTeExRVUZMTEVOQlFVTXNVMEZCVGl4RFFVRm5RaXh6UWtGQmFFSXNSVUZCZDBNc1NVRkJReXhEUVVGQkxGbEJRWHBETEVWQlFYVkVMRWRCUVhaRUxFVkJVRVE3TzBWQlRsazdPM05DUVdWaUxFMUJRVUVzUjBGQlVTeFRRVUZCTzBsQlExQXNTMEZCU3l4RFFVRkRMRkZCUVU0c1EwRkJaU3h4UWtGQlpqdEZRVVJQT3p0elFrRkxVaXhQUVVGQkxFZEJRVk1zVTBGQlFUdEpRVU5TTEV0QlFVc3NRMEZCUXl4UlFVRk9MRU5CUVdVc2MwSkJRV1k3UlVGRVVUczdjMEpCUzFRc1QwRkJRU3hIUVVGVExGTkJRVUU3U1VGRlVpeExRVUZMTEVOQlFVTXNVVUZCVGl4RFFVRmxMSE5DUVVGbU8wVkJSbEU3TzNOQ1FVdFVMRmxCUVVFc1IwRkJZeXhUUVVGQk8wbEJSV0lzUzBGQlN5eERRVUZETEZsQlFVNHNRMEZCYlVJc2NVSkJRVzVDTEVWQlFUQkRMRWxCUVVNc1EwRkJRU3hQUVVGUExFTkJRVU1zVFVGQmJrUXNSVUZCTWtRc1JVRkJNMFE3U1VGRFFTeExRVUZMTEVOQlFVTXNXVUZCVGl4RFFVRnRRaXh6UWtGQmJrSXNSVUZCTWtNc1NVRkJReXhEUVVGQkxFOUJRVThzUTBGQlF5eFBRVUZ3UkN4RlFVRTJSQ3hGUVVFM1JEdFhRVU5CTEV0QlFVc3NRMEZCUXl4WlFVRk9MRU5CUVcxQ0xITkNRVUZ1UWl4RlFVRXlReXhKUVVGRExFTkJRVUVzVDBGQlR5eERRVUZETEU5QlFYQkVMRVZCUVRaRUxFVkJRVGRFTzBWQlNtRTdPenM3T3p0QlFVOW1MRTFCUVUwc1EwRkJReXhQUVVGUUxFZEJRV2xDSW4wPVxuIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgJCwgSG9va3MsIFN0YXRlX01hbmFnZXIsXG4gIGJpbmQgPSBmdW5jdGlvbihmbiwgbWUpeyByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuIGZuLmFwcGx5KG1lLCBhcmd1bWVudHMpOyB9OyB9O1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuU3RhdGVfTWFuYWdlciA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gU3RhdGVfTWFuYWdlcigpIHtcbiAgICB0aGlzLmxvYWRlZCA9IGJpbmQodGhpcy5sb2FkZWQsIHRoaXMpO1xuICAgIHRoaXMucmVhZHkgPSBiaW5kKHRoaXMucmVhZHksIHRoaXMpO1xuICAgIHRoaXMuJGRvYyA9ICQoZG9jdW1lbnQpO1xuICAgIHRoaXMuJGRvYy5vbigncmVhZHknLCB0aGlzLnJlYWR5KTtcbiAgICB0aGlzLiRkb2MuZmluZCgnLnBwLXdyYXBwZXInKS5pbWFnZXNMb2FkZWQodGhpcy5sb2FkZWQpO1xuICB9XG5cbiAgU3RhdGVfTWFuYWdlci5wcm90b3R5cGUucmVhZHkgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdHJpZ2dlcjtcbiAgICB0cmlnZ2VyID0gdHJ1ZTtcbiAgICBpZiAoSG9va3MuYXBwbHlGaWx0ZXJzKCdwcC5yZWFkeScsIHRydWUpKSB7XG4gICAgICBIb29rcy5kb0FjdGlvbigncHAucmVhZHknKTtcbiAgICB9XG4gIH07XG5cbiAgU3RhdGVfTWFuYWdlci5wcm90b3R5cGUubG9hZGVkID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRyaWdnZXI7XG4gICAgdHJpZ2dlciA9IHRydWU7XG4gICAgaWYgKEhvb2tzLmFwcGx5RmlsdGVycygncHAubG9hZGVkJywgdHJ1ZSkpIHtcbiAgICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5sb2FkZWQnKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIFN0YXRlX01hbmFnZXI7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhdGVfTWFuYWdlcjtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVTNSaGRHVmZUV0Z1WVdkbGNpNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSWxOMFlYUmxYMDFoYm1GblpYSXVZMjltWm1WbElsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lJN1FVRkJRVHM3TzBGQlFVRXNTVUZCUVN4MVFrRkJRVHRGUVVGQk96dEJRVWRCTEVOQlFVRXNSMEZCU1N4UFFVRkJMRU5CUVZNc1VVRkJWRHM3UVVGRFNpeExRVUZCTEVkQlFWRXNUMEZCUVN4RFFVRlRMRlZCUVZRN08wRkJSMFk3UlVGRlVTeDFRa0ZCUVRzN08wbEJRMW9zU1VGQlF5eERRVUZCTEVsQlFVUXNSMEZCVVN4RFFVRkJMRU5CUVVjc1VVRkJTRHRKUVVkU0xFbEJRVU1zUTBGQlFTeEpRVUZKTEVOQlFVTXNSVUZCVGl4RFFVRlRMRTlCUVZRc1JVRkJhMElzU1VGQlF5eERRVUZCTEV0QlFXNUNPMGxCUTBFc1NVRkJReXhEUVVGQkxFbEJRVWtzUTBGQlF5eEpRVUZPTEVOQlFWa3NZVUZCV2l4RFFVRXlRaXhEUVVGRExGbEJRVFZDTEVOQlFUQkRMRWxCUVVNc1EwRkJRU3hOUVVFelF6dEZRVXhaT3pzd1FrRlJZaXhMUVVGQkxFZEJRVThzVTBGQlFUdEJRVU5PTEZGQlFVRTdTVUZCUVN4UFFVRkJMRWRCUVZVN1NVRkZWaXhKUVVGSExFdEJRVXNzUTBGQlF5eFpRVUZPTEVOQlFXMUNMRlZCUVc1Q0xFVkJRU3RDTEVsQlFTOUNMRU5CUVVnN1RVRkRReXhMUVVGTExFTkJRVU1zVVVGQlRpeERRVUZsTEZWQlFXWXNSVUZFUkRzN1JVRklUVHM3TUVKQlVWQXNUVUZCUVN4SFFVRlJMRk5CUVVFN1FVRkRVQ3hSUVVGQk8wbEJRVUVzVDBGQlFTeEhRVUZWTzBsQlJWWXNTVUZCUnl4TFFVRkxMRU5CUVVNc1dVRkJUaXhEUVVGdFFpeFhRVUZ1UWl4RlFVRm5ReXhKUVVGb1F5eERRVUZJTzAxQlEwTXNTMEZCU3l4RFFVRkRMRkZCUVU0c1EwRkJaU3hYUVVGbUxFVkJSRVE3TzBWQlNFODdPenM3T3p0QlFWTlVMRTFCUVUwc1EwRkJReXhQUVVGUUxFZEJRV2xDSW4wPVxuIiwidmFyIEhvb2tzLCBnZXRfc2l6ZTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuZ2V0X3NpemUgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICB3aWR0aDogd2luZG93LmlubmVyV2lkdGggfHwgJHdpbmRvdy53aWR0aCgpLFxuICAgIGhlaWdodDogd2luZG93LmlubmVySGVpZ2h0IHx8ICR3aW5kb3cuaGVpZ2h0KClcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0X3NpemUoKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVjJsdVpHOTNMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaVYybHVaRzkzTG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4SlFVRkJPenRCUVVGQkxFdEJRVUVzUjBGQlVTeFBRVUZCTEVOQlFWTXNWVUZCVkRzN1FVRkhVaXhSUVVGQkxFZEJRVmNzVTBGQlFUdFRRVU5XTzBsQlFVRXNTMEZCUVN4RlFVRlJMRTFCUVUwc1EwRkJReXhWUVVGUUxFbEJRWEZDTEU5QlFVOHNRMEZCUXl4TFFVRlNMRU5CUVVFc1EwRkJOMEk3U1VGRFFTeE5RVUZCTEVWQlFWRXNUVUZCVFN4RFFVRkRMRmRCUVZBc1NVRkJjMElzVDBGQlR5eERRVUZETEUxQlFWSXNRMEZCUVN4RFFVUTVRanM3UVVGRVZUczdRVUZMV0N4TlFVRk5MRU5CUVVNc1QwRkJVQ3hIUVVGcFFpeFJRVUZCTEVOQlFVRWlmUT09XG4iLCJ2YXIgSXRlbV9EYXRhO1xuXG5JdGVtX0RhdGEgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIEl0ZW1fRGF0YSgkZWwpIHtcbiAgICB2YXIgZGF0YTtcbiAgICB0aGlzLiRlbCA9ICRlbDtcbiAgICBkYXRhID0gJGVsLmRhdGEoJ2l0ZW0nKTtcbiAgICBpZiAoIWRhdGEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkVsZW1lbnQgZG9lc24ndCBjb250YWluIGBkYXRhLWl0ZW1gIGF0dHJpYnV0ZVwiKTtcbiAgICB9XG4gICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgfVxuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X2RhdGEgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGltYWdlO1xuICAgIGltYWdlID0gdGhpcy5kYXRhWydpbWFnZXMnXVtuYW1lXTtcbiAgICBpZiAoIWltYWdlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBpbWFnZTtcbiAgfTtcblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF9zaXplID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBoZWlnaHQsIGltYWdlLCByZWYsIHNpemUsIHdpZHRoO1xuICAgIGltYWdlID0gdGhpcy5nZXRfZGF0YShuYW1lKTtcbiAgICBpZiAoIWltYWdlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHNpemUgPSBpbWFnZVsnc2l6ZSddO1xuICAgIHJlZiA9IHNpemUuc3BsaXQoJ3gnKSwgd2lkdGggPSByZWZbMF0sIGhlaWdodCA9IHJlZlsxXTtcbiAgICB3aWR0aCA9IHBhcnNlSW50KHdpZHRoKTtcbiAgICBoZWlnaHQgPSBwYXJzZUludChoZWlnaHQpO1xuICAgIHJldHVybiBbd2lkdGgsIGhlaWdodF07XG4gIH07XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfdXJsID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBpbWFnZTtcbiAgICBpbWFnZSA9IHRoaXMuZ2V0X2RhdGEobmFtZSk7XG4gICAgaWYgKCFpbWFnZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gaW1hZ2VbJ3VybCddO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X29yX2ZhbHNlID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKHRoaXMuZGF0YVtrZXldKSB7XG4gICAgICByZXR1cm4gdGhpcy5kYXRhW2tleV07XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF9yYXRpbyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldF9vcl9mYWxzZSgncmF0aW8nKTtcbiAgfTtcblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF90eXBlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0X29yX2ZhbHNlKCd0eXBlJyk7XG4gIH07XG5cbiAgcmV0dXJuIEl0ZW1fRGF0YTtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBJdGVtX0RhdGE7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVNYUmxiVjlFWVhSaExtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpU1hSbGJWOUVZWFJoTG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4SlFVRkJPenRCUVVGTk8wVkJSVkVzYlVKQlFVVXNSMEZCUmp0QlFVTmFMRkZCUVVFN1NVRkJRU3hKUVVGRExFTkJRVUVzUjBGQlJDeEhRVUZQTzBsQlExQXNTVUZCUVN4SFFVRlBMRWRCUVVjc1EwRkJReXhKUVVGS0xFTkJRVlVzVFVGQlZqdEpRVVZRTEVsQlFVY3NRMEZCU1N4SlFVRlFPMEZCUTBNc1dVRkJWU3hKUVVGQkxFdEJRVUVzUTBGQlRTd3JRMEZCVGl4RlFVUllPenRKUVVkQkxFbEJRVU1zUTBGQlFTeEpRVUZFTEVkQlFWRTdSVUZRU1RzN2MwSkJWMklzVVVGQlFTeEhRVUZWTEZOQlFVVXNTVUZCUmp0QlFVTlVMRkZCUVVFN1NVRkJRU3hMUVVGQkxFZEJRVkVzU1VGQlF5eERRVUZCTEVsQlFVMHNRMEZCUVN4UlFVRkJMRU5CUVZrc1EwRkJRU3hKUVVGQk8wbEJRek5DTEVsQlFXZENMRU5CUVVrc1MwRkJjRUk3UVVGQlFTeGhRVUZQTEUxQlFWQTdPMEZCUlVFc1YwRkJUenRGUVVwRk96dHpRa0ZOVml4UlFVRkJMRWRCUVZVc1UwRkJSU3hKUVVGR08wRkJRMVFzVVVGQlFUdEpRVUZCTEV0QlFVRXNSMEZCVVN4SlFVRkRMRU5CUVVFc1VVRkJSQ3hEUVVGWExFbEJRVmc3U1VGRFVpeEpRVUZuUWl4RFFVRkpMRXRCUVhCQ08wRkJRVUVzWVVGQlR5eE5RVUZRT3p0SlFVVkJMRWxCUVVFc1IwRkJUeXhMUVVGUExFTkJRVUVzVFVGQlFUdEpRVVZrTEUxQlFXdENMRWxCUVVrc1EwRkJReXhMUVVGTUxFTkJRVmtzUjBGQldpeERRVUZzUWl4RlFVRkRMR05CUVVRc1JVRkJVVHRKUVVWU0xFdEJRVUVzUjBGQlVTeFJRVUZCTEVOQlFWVXNTMEZCVmp0SlFVTlNMRTFCUVVFc1IwRkJVeXhSUVVGQkxFTkJRVlVzVFVGQlZqdEJRVVZVTEZkQlFVOHNRMEZCUXl4TFFVRkVMRVZCUVZFc1RVRkJVanRGUVZoRk96dHpRa0ZoVml4UFFVRkJMRWRCUVZNc1UwRkJSU3hKUVVGR08wRkJRMUlzVVVGQlFUdEpRVUZCTEV0QlFVRXNSMEZCVVN4SlFVRkRMRU5CUVVFc1VVRkJSQ3hEUVVGWExFbEJRVmc3U1VGRFVpeEpRVUZuUWl4RFFVRkpMRXRCUVhCQ08wRkJRVUVzWVVGQlR5eE5RVUZRT3p0QlFVTkJMRmRCUVU4c1MwRkJUeXhEUVVGQkxFdEJRVUU3UlVGSVRqczdjMEpCUzFRc1dVRkJRU3hIUVVGakxGTkJRVVVzUjBGQlJqdEpRVU5pTEVsQlFVY3NTVUZCUXl4RFFVRkJMRWxCUVUwc1EwRkJRU3hIUVVGQkxFTkJRVlk3UVVGRFF5eGhRVUZQTEVsQlFVTXNRMEZCUVN4SlFVRk5MRU5CUVVFc1IwRkJRU3hGUVVSbU96dEJRVVZCTEZkQlFVODdSVUZJVFRzN2MwSkJTMlFzVTBGQlFTeEhRVUZqTEZOQlFVRTdWMEZCUnl4SlFVRkRMRU5CUVVFc1dVRkJSQ3hEUVVGbExFOUJRV1k3UlVGQlNEczdjMEpCUTJRc1VVRkJRU3hIUVVGakxGTkJRVUU3VjBGQlJ5eEpRVUZETEVOQlFVRXNXVUZCUkN4RFFVRmxMRTFCUVdZN1JVRkJTRHM3T3pzN08wRkJSMllzVFVGQlRTeERRVUZETEU5QlFWQXNSMEZCYVVJaWZRPT1cbiIsIlxuLypcbiAgICBEZXBlbmRlbmNpZXNcbiAqL1xudmFyICQsIEhvb2tzLCBJdGVtX0RhdGEsIExhenlfTG9hZGVyO1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuSXRlbV9EYXRhID0gcmVxdWlyZSgnLi9JdGVtX0RhdGEnKTtcblxuTGF6eV9Mb2FkZXIgPSAoZnVuY3Rpb24oKSB7XG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5FbGVtZW50cyA9IHtcbiAgICBpdGVtOiAnUFBfTGF6eV9JbWFnZScsXG4gICAgcGxhY2Vob2xkZXI6ICdQUF9MYXp5X0ltYWdlX19wbGFjZWhvbGRlcidcbiAgfTtcblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUuSXRlbXMgPSBbXTtcblxuICBmdW5jdGlvbiBMYXp5X0xvYWRlcigpIHtcbiAgICB0aGlzLnNldHVwX2RhdGEoKTtcbiAgICB0aGlzLnJlc2l6ZV9hbGwoKTtcbiAgICB0aGlzLmF0dGFjaF9ldmVudHMoKTtcbiAgfVxuXG5cbiAgLypcbiAgXHRcdEFic3RyYWN0IE1ldGhvZHNcbiAgICovXG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBMYXp5X0xvYWRlcmAgbXVzdCBpbXBsZW1lbnQgYHJlc2l6ZWAgbWV0aG9kXCIpO1xuICB9O1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYExhenlfTG9hZGVyYCBtdXN0IGltcGxlbWVudCBgbG9hZGAgbWV0aG9kXCIpO1xuICB9O1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5hdXRvbG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBMYXp5X0xvYWRlcmAgbXVzdCBpbXBsZW1lbnQgYGF1dG9sb2FkYCBtZXRob2RcIik7XG4gIH07XG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLnNldHVwX2RhdGEgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgJGl0ZW1zO1xuICAgICRpdGVtcyA9ICQoXCIuXCIgKyB0aGlzLkVsZW1lbnRzLml0ZW0pO1xuICAgICRpdGVtcy5lYWNoKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGtleSwgZWwpIHtcbiAgICAgICAgdmFyICRlbDtcbiAgICAgICAgJGVsID0gJChlbCk7XG4gICAgICAgIHJldHVybiBfdGhpcy5JdGVtcy5wdXNoKHtcbiAgICAgICAgICBlbDogZWwsXG4gICAgICAgICAgJGVsOiAkZWwsXG4gICAgICAgICAgZGF0YTogbmV3IEl0ZW1fRGF0YSgkZWwpLFxuICAgICAgICAgIGxvYWRlZDogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfTtcblxuXG4gIC8qXG4gIFx0XHRNZXRob2RzXG4gICAqL1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5yZXNpemVfYWxsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGksIGl0ZW0sIGxlbiwgcmVmLCByZXN1bHRzO1xuICAgIHJlZiA9IHRoaXMuSXRlbXM7XG4gICAgcmVzdWx0cyA9IFtdO1xuICAgIGZvciAoaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgaXRlbSA9IHJlZltpXTtcbiAgICAgIHJlc3VsdHMucHVzaCh0aGlzLnJlc2l6ZShpdGVtKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5sb2FkX2FsbCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpLCBpdGVtLCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICByZWYgPSB0aGlzLkl0ZW1zO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGl0ZW0gPSByZWZbaV07XG4gICAgICB0aGlzLmxvYWQoaXRlbSk7XG4gICAgICByZXN1bHRzLnB1c2godGhpcy5yZW1vdmVfcGxhY2Vob2xkZXIoaXRlbSkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUucmVtb3ZlX3BsYWNlaG9sZGVyID0gZnVuY3Rpb24oaXRlbSkge1xuICAgIHJldHVybiBpdGVtLiRlbC5maW5kKFwiLlwiICsgdGhpcy5FbGVtZW50cy5wbGFjZWhvbGRlciArIFwiLCBub3NjcmlwdFwiKS5yZW1vdmUoKTtcbiAgfTtcblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmRldGFjaF9ldmVudHMoKTtcbiAgfTtcblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUuYXR0YWNoX2V2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBIb29rcy5hZGRBY3Rpb24oJ3BwLmxhenkuYXV0b2xvYWQnLCB0aGlzLmF1dG9sb2FkKTtcbiAgfTtcblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUuZGV0YWNoX2V2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBIb29rcy5yZW1vdmVBY3Rpb24oJ3BwLmxhenkuYXV0b2xvYWQnLCB0aGlzLmF1dG9sb2FkKTtcbiAgfTtcblxuICByZXR1cm4gTGF6eV9Mb2FkZXI7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTGF6eV9Mb2FkZXI7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVRHRjZlVjlNYjJGa1pYSXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lKTVlYcDVYMHh2WVdSbGNpNWpiMlptWldVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWp0QlFVRkJPenM3UVVGQlFTeEpRVUZCT3p0QlFVZEJMRU5CUVVFc1IwRkJTU3hQUVVGQkxFTkJRVk1zVVVGQlZEczdRVUZEU2l4TFFVRkJMRWRCUVZFc1QwRkJRU3hEUVVGVExGVkJRVlE3TzBGQlExSXNVMEZCUVN4SFFVRlpMRTlCUVVFc1EwRkJVeXhoUVVGVU96dEJRVVZPTzNkQ1FVVk1MRkZCUVVFc1IwRkRRenRKUVVGQkxFbEJRVUVzUlVGQllTeGxRVUZpTzBsQlEwRXNWMEZCUVN4RlFVRmhMRFJDUVVSaU96czdkMEpCUjBRc1MwRkJRU3hIUVVGUE96dEZRVWROTEhGQ1FVRkJPMGxCUTFvc1NVRkJReXhEUVVGQkxGVkJRVVFzUTBGQlFUdEpRVU5CTEVsQlFVTXNRMEZCUVN4VlFVRkVMRU5CUVVFN1NVRkRRU3hKUVVGRExFTkJRVUVzWVVGQlJDeERRVUZCTzBWQlNGazdPenRCUVUxaU96czdPM2RDUVVkQkxFMUJRVUVzUjBGQlZTeFRRVUZCTzBGQlFVY3NWVUZCVlN4SlFVRkJMRXRCUVVFc1EwRkJUeXg1UlVGQlVEdEZRVUZpT3p0M1FrRkRWaXhKUVVGQkxFZEJRVlVzVTBGQlFUdEJRVUZITEZWQlFWVXNTVUZCUVN4TFFVRkJMRU5CUVU4c2RVVkJRVkE3UlVGQllqczdkMEpCUTFZc1VVRkJRU3hIUVVGVkxGTkJRVUU3UVVGQlJ5eFZRVUZWTEVsQlFVRXNTMEZCUVN4RFFVRlBMREpGUVVGUU8wVkJRV0k3TzNkQ1FVZFdMRlZCUVVFc1IwRkJXU3hUUVVGQk8wRkJRMWdzVVVGQlFUdEpRVUZCTEUxQlFVRXNSMEZCVXl4RFFVRkJMRU5CUVVjc1IwRkJRU3hIUVVGSkxFbEJRVU1zUTBGQlFTeFJRVUZSTEVOQlFVTXNTVUZCYWtJN1NVRkZWQ3hOUVVGTkxFTkJRVU1zU1VGQlVDeERRVUZaTEVOQlFVRXNVMEZCUVN4TFFVRkJPMkZCUVVFc1UwRkJSU3hIUVVGR0xFVkJRVThzUlVGQlVEdEJRVVZZTEZsQlFVRTdVVUZCUVN4SFFVRkJMRWRCUVUwc1EwRkJRU3hEUVVGSExFVkJRVWc3WlVGRFRpeExRVUZETEVOQlFVRXNTMEZCU3l4RFFVRkRMRWxCUVZBc1EwRkRRenRWUVVGQkxFVkJRVUVzUlVGQlVTeEZRVUZTTzFWQlEwRXNSMEZCUVN4RlFVRlJMRWRCUkZJN1ZVRkZRU3hKUVVGQkxFVkJRVmtzU1VGQlFTeFRRVUZCTEVOQlFWY3NSMEZCV0N4RFFVWmFPMVZCUjBFc1RVRkJRU3hGUVVGUkxFdEJTRkk3VTBGRVJEdE5RVWhYTzBsQlFVRXNRMEZCUVN4RFFVRkJMRU5CUVVFc1NVRkJRU3hEUVVGYU8wVkJTRmM3T3p0QlFXVmFPenM3TzNkQ1FVZEJMRlZCUVVFc1IwRkJXU3hUUVVGQk8wRkJRMWdzVVVGQlFUdEJRVUZCTzBGQlFVRTdVMEZCUVN4eFEwRkJRVHM3YlVKQlFVRXNTVUZCUXl4RFFVRkJMRTFCUVVRc1EwRkJVeXhKUVVGVU8wRkJRVUU3TzBWQlJGYzdPM2RDUVVkYUxGRkJRVUVzUjBGQlZTeFRRVUZCTzBGQlExUXNVVUZCUVR0QlFVRkJPMEZCUVVFN1UwRkJRU3h4UTBGQlFUczdUVUZEUXl4SlFVRkRMRU5CUVVFc1NVRkJSQ3hEUVVGUExFbEJRVkE3YlVKQlEwRXNTVUZCUXl4RFFVRkJMR3RDUVVGRUxFTkJRWEZDTEVsQlFYSkNPMEZCUmtRN08wVkJSRk03TzNkQ1FVdFdMR3RDUVVGQkxFZEJRVzlDTEZOQlFVVXNTVUZCUmp0WFFVTnVRaXhKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEVsQlFWUXNRMEZCWlN4SFFVRkJMRWRCUVVrc1NVRkJReXhEUVVGQkxGRkJRVkVzUTBGQlF5eFhRVUZrTEVkQlFUQkNMRmxCUVhwRExFTkJRWE5FTEVOQlFVTXNUVUZCZGtRc1EwRkJRVHRGUVVSdFFqczdkMEpCU1hCQ0xFOUJRVUVzUjBGQlV5eFRRVUZCTzFkQlExSXNTVUZCUXl4RFFVRkJMR0ZCUVVRc1EwRkJRVHRGUVVSUk96dDNRa0ZIVkN4aFFVRkJMRWRCUVdVc1UwRkJRVHRYUVVOa0xFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMR3RDUVVGb1FpeEZRVUZ2UXl4SlFVRkRMRU5CUVVFc1VVRkJja003UlVGRVl6czdkMEpCUjJZc1lVRkJRU3hIUVVGbExGTkJRVUU3VjBGRFpDeExRVUZMTEVOQlFVTXNXVUZCVGl4RFFVRnRRaXhyUWtGQmJrSXNSVUZCZFVNc1NVRkJReXhEUVVGQkxGRkJRWGhETzBWQlJHTTdPenM3T3p0QlFVZG9RaXhOUVVGTkxFTkJRVU1zVDBGQlVDeEhRVUZwUWlKOVxuIiwidmFyICQsIExhenlfTG9hZGVyLCBMYXp5X01hc29ucnksIF9fV0lORE9XLFxuICBiaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfSxcbiAgZXh0ZW5kID0gZnVuY3Rpb24oY2hpbGQsIHBhcmVudCkgeyBmb3IgKHZhciBrZXkgaW4gcGFyZW50KSB7IGlmIChoYXNQcm9wLmNhbGwocGFyZW50LCBrZXkpKSBjaGlsZFtrZXldID0gcGFyZW50W2tleV07IH0gZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9IGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTsgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTsgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTsgcmV0dXJuIGNoaWxkOyB9LFxuICBoYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHk7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5MYXp5X0xvYWRlciA9IHJlcXVpcmUoJy4vTGF6eV9Mb2FkZXInKTtcblxuX19XSU5ET1cgPSByZXF1aXJlKCcuLi9nbG9iYWwvV2luZG93Jyk7XG5cbkxhenlfTWFzb25yeSA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gIGV4dGVuZChMYXp5X01hc29ucnksIHN1cGVyQ2xhc3MpO1xuXG4gIGZ1bmN0aW9uIExhenlfTWFzb25yeSgpIHtcbiAgICB0aGlzLmxvYWRfaXRlbXNfaW5fdmlldyA9IGJpbmQodGhpcy5sb2FkX2l0ZW1zX2luX3ZpZXcsIHRoaXMpO1xuICAgIHRoaXMuYXV0b2xvYWQgPSBiaW5kKHRoaXMuYXV0b2xvYWQsIHRoaXMpO1xuICAgIHRoaXMuZGVib3VuY2VkX2xvYWRfaXRlbXNfaW5fdmlldyA9IF8uZGVib3VuY2UodGhpcy5sb2FkX2l0ZW1zX2luX3ZpZXcsIDUwKTtcbiAgICBMYXp5X01hc29ucnkuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmNhbGwodGhpcyk7XG4gIH1cblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbS4kZWwuY3NzKHtcbiAgICAgICdtaW4taGVpZ2h0JzogTWF0aC5mbG9vcih0aGlzLmdldF93aWR0aCgpIC8gaXRlbS5kYXRhLmdldF9yYXRpbygpKVxuICAgIH0pO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUuZ2V0X3dpZHRoID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICQoJy5QUF9NYXNvbnJ5X19zaXplcicpLndpZHRoKCk7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5hdXRvbG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmxvYWRfaXRlbXNfaW5fdmlldygpO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICB2YXIgJGltYWdlLCBmdWxsLCB0aHVtYjtcbiAgICB0aHVtYiA9IGl0ZW0uZGF0YS5nZXRfdXJsKCd0aHVtYicpO1xuICAgIGZ1bGwgPSBpdGVtLmRhdGEuZ2V0X3VybCgnZnVsbCcpO1xuICAgIGl0ZW0uJGVsLnByZXBlbmQoXCI8YSBocmVmPVxcXCJcIiArIGZ1bGwgKyBcIlxcXCIgcmVsPVxcXCJnYWxsZXJ5XFxcIj5cXG48aW1nIHNyYz1cXFwiXCIgKyB0aHVtYiArIFwiXFxcIiBjbGFzcz1cXFwiaXMtbG9hZGluZ1xcXCIgLz5cXG48L2E+XCIpLnJlbW92ZUNsYXNzKCdMYXp5LUltYWdlJyk7XG4gICAgaXRlbS5sb2FkZWQgPSB0cnVlO1xuICAgICRpbWFnZSA9IGl0ZW0uJGVsLmZpbmQoJ2ltZycpO1xuICAgIHJldHVybiAkaW1hZ2UuaW1hZ2VzTG9hZGVkKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAkaW1hZ2UuYWRkQ2xhc3MoJ2lzLWxvYWRlZCcpLnJlbW92ZUNsYXNzKCdpcy1sb2FkaW5nJyk7XG4gICAgICAgIHJldHVybiBpdGVtLiRlbC5jc3MoJ21pbi1oZWlnaHQnLCAnJykucmVtb3ZlQ2xhc3MoX3RoaXMuRWxlbWVudHMuaXRlbSkuZmluZChcIi5cIiArIF90aGlzLkVsZW1lbnRzLnBsYWNlaG9sZGVyKS5mYWRlT3V0KDQwMCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuICQodGhpcykucmVtb3ZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5sb2FkX2l0ZW1zX2luX3ZpZXcgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaSwgaXRlbSwga2V5LCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICByZWYgPSB0aGlzLkl0ZW1zO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGtleSA9IGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBrZXkgPSArK2kpIHtcbiAgICAgIGl0ZW0gPSByZWZba2V5XTtcbiAgICAgIGlmICghaXRlbS5sb2FkZWQgJiYgdGhpcy5pbl9sb29zZV92aWV3KGl0ZW0uZWwpKSB7XG4gICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLmxvYWQoaXRlbSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHZvaWQgMCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUuaW5fbG9vc2VfdmlldyA9IGZ1bmN0aW9uKGVsKSB7XG4gICAgdmFyIHJlY3QsIHNlbnNpdGl2aXR5O1xuICAgIGlmIChlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBzZW5zaXRpdml0eSA9IDEwMDtcbiAgICByZXR1cm4gcmVjdC50b3AgKyByZWN0LmhlaWdodCA+PSAtc2Vuc2l0aXZpdHkgJiYgcmVjdC5ib3R0b20gLSByZWN0LmhlaWdodCA8PSBfX1dJTkRPVy5oZWlnaHQgKyBzZW5zaXRpdml0eSAmJiByZWN0LmxlZnQgKyByZWN0LndpZHRoID49IC1zZW5zaXRpdml0eSAmJiByZWN0LnJpZ2h0IC0gcmVjdC53aWR0aCA8PSBfX1dJTkRPVy53aWR0aCArIHNlbnNpdGl2aXR5O1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUuYXR0YWNoX2V2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICQod2luZG93KS5vbignc2Nyb2xsJywgdGhpcy5kZWJvdW5jZWRfbG9hZF9pdGVtc19pbl92aWV3KTtcbiAgICByZXR1cm4gTGF6eV9NYXNvbnJ5Ll9fc3VwZXJfXy5hdHRhY2hfZXZlbnRzLmNhbGwodGhpcyk7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5kZXRhY2hfZXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgJCh3aW5kb3cpLm9mZignc2Nyb2xsJywgdGhpcy5kZWJvdW5jZWRfbG9hZF9pdGVtc19pbl92aWV3KTtcbiAgICByZXR1cm4gTGF6eV9NYXNvbnJ5Ll9fc3VwZXJfXy5kZXRhY2hfZXZlbnRzLmNhbGwodGhpcyk7XG4gIH07XG5cbiAgcmV0dXJuIExhenlfTWFzb25yeTtcblxufSkoTGF6eV9Mb2FkZXIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExhenlfTWFzb25yeTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVEdGNmVWOU5ZWE52Ym5KNUxtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpVEdGNmVWOU5ZWE52Ym5KNUxtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeEpRVUZCTEhORFFVRkJPMFZCUVVFN096czdRVUZCUVN4RFFVRkJMRWRCUVVrc1QwRkJRU3hEUVVGVExGRkJRVlE3TzBGQlEwb3NWMEZCUVN4SFFVRmpMRTlCUVVFc1EwRkJVeXhsUVVGVU96dEJRVU5rTEZGQlFVRXNSMEZCVnl4UFFVRkJMRU5CUVZNc2EwSkJRVlE3TzBGQlJVdzdPenRGUVVWUkxITkNRVUZCT3pzN1NVRkRXaXhKUVVGRExFTkJRVUVzTkVKQlFVUXNSMEZCWjBNc1EwRkJReXhEUVVGRExGRkJRVVlzUTBGQldTeEpRVUZETEVOQlFVRXNhMEpCUVdJc1JVRkJhVU1zUlVGQmFrTTdTVUZEYUVNc05FTkJRVUU3UlVGR1dUczdlVUpCUzJJc1RVRkJRU3hIUVVGUkxGTkJRVVVzU1VGQlJqdFhRVU5RTEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1IwRkJWQ3hEUVVGaE8wMUJRVUVzV1VGQlFTeEZRVUZqTEVsQlFVa3NRMEZCUXl4TFFVRk1MRU5CUVZrc1NVRkJReXhEUVVGQkxGTkJRVVFzUTBGQlFTeERRVUZCTEVkQlFXVXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhUUVVGV0xFTkJRVUVzUTBGQk0wSXNRMEZCWkR0TFFVRmlPMFZCUkU4N08zbENRVWxTTEZOQlFVRXNSMEZCVnl4VFFVRkJPMWRCUlZZc1EwRkJRU3hEUVVGSExHOUNRVUZJTEVOQlFYbENMRU5CUVVNc1MwRkJNVUlzUTBGQlFUdEZRVVpWT3p0NVFrRkpXQ3hSUVVGQkxFZEJRVlVzVTBGQlFUdFhRVUZITEVsQlFVTXNRMEZCUVN4clFrRkJSQ3hEUVVGQk8wVkJRVWc3TzNsQ1FVVldMRWxCUVVFc1IwRkJUU3hUUVVGRkxFbEJRVVk3UVVGRlRDeFJRVUZCTzBsQlFVRXNTMEZCUVN4SFFVRlJMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zVDBGQlZpeERRVUZ0UWl4UFFVRnVRanRKUVVOU0xFbEJRVUVzUjBGQlR5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVZZc1EwRkJiVUlzVFVGQmJrSTdTVUZGVUN4SlFVRkpMRU5CUVVNc1IwRkRUQ3hEUVVGRExFOUJSRVFzUTBGRFZTeFpRVUZCTEVkQlEwY3NTVUZFU0N4SFFVTlJMR3REUVVSU0xFZEJSVWtzUzBGR1NpeEhRVVZWTEd0RFFVaHdRaXhEUVUxQkxFTkJRVU1zVjBGT1JDeERRVTFqTEZsQlRtUTdTVUZSUVN4SlFVRkpMRU5CUVVNc1RVRkJUQ3hIUVVGak8wbEJRMlFzVFVGQlFTeEhRVUZUTEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1NVRkJWQ3hEUVVGbExFdEJRV1k3VjBGRFZDeE5RVUZOTEVOQlFVTXNXVUZCVUN4RFFVRnZRaXhEUVVGQkxGTkJRVUVzUzBGQlFUdGhRVUZCTEZOQlFVRTdVVUZEYmtJc1RVRkJUU3hEUVVGRExGRkJRVkFzUTBGQmFVSXNWMEZCYWtJc1EwRkJPRUlzUTBGQlF5eFhRVUV2UWl4RFFVRTBReXhaUVVFMVF6dGxRVU5CTEVsQlFVa3NRMEZCUXl4SFFVTk1MRU5CUVVNc1IwRkVSQ3hEUVVOTkxGbEJSRTRzUlVGRGIwSXNSVUZFY0VJc1EwRkZRU3hEUVVGRExGZEJSa1FzUTBGRll5eExRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRWxCUm5oQ0xFTkJSMEVzUTBGQlF5eEpRVWhFTEVOQlIwOHNSMEZCUVN4SFFVRkpMRXRCUVVNc1EwRkJRU3hSUVVGUkxFTkJRVU1zVjBGSWNrSXNRMEZKUVN4RFFVRkRMRTlCU2tRc1EwRkpVeXhIUVVwVUxFVkJTV01zVTBGQlFUdHBRa0ZCUnl4RFFVRkJMRU5CUVVjc1NVRkJTQ3hEUVVGVExFTkJRVU1zVFVGQlZpeERRVUZCTzFGQlFVZ3NRMEZLWkR0TlFVWnRRanRKUVVGQkxFTkJRVUVzUTBGQlFTeERRVUZCTEVsQlFVRXNRMEZCY0VJN1JVRm1TenM3ZVVKQk1rSk9MR3RDUVVGQkxFZEJRVzlDTEZOQlFVRTdRVUZEYmtJc1VVRkJRVHRCUVVGQk8wRkJRVUU3VTBGQlFTeHBSRUZCUVRzN1RVRkRReXhKUVVGSExFTkJRVWtzU1VGQlNTeERRVUZETEUxQlFWUXNTVUZCYjBJc1NVRkJReXhEUVVGQkxHRkJRVVFzUTBGQlowSXNTVUZCU1N4RFFVRkRMRVZCUVhKQ0xFTkJRWFpDTzNGQ1FVTkRMRWxCUVVNc1EwRkJRU3hKUVVGRUxFTkJRVThzU1VGQlVDeEhRVVJFTzA5QlFVRXNUVUZCUVRzMlFrRkJRVHM3UVVGRVJEczdSVUZFYlVJN08zbENRVTl3UWl4aFFVRkJMRWRCUVdVc1UwRkJSU3hGUVVGR08wRkJRMlFzVVVGQlFUdEpRVUZCTEVsQlFXMUNMR2REUVVGdVFqdEJRVUZCTEdGQlFVOHNTMEZCVURzN1NVRkRRU3hKUVVGQkxFZEJRVThzUlVGQlJTeERRVUZETEhGQ1FVRklMRU5CUVVFN1NVRkhVQ3hYUVVGQkxFZEJRV003UVVGRFpDeFhRVVZETEVsQlFVa3NRMEZCUXl4SFFVRk1MRWRCUVZjc1NVRkJTU3hEUVVGRExFMUJRV2hDTEVsQlFUQkNMRU5CUVVNc1YwRkJNMElzU1VGRFF5eEpRVUZKTEVOQlFVTXNUVUZCVEN4SFFVRmpMRWxCUVVrc1EwRkJReXhOUVVGdVFpeEpRVUUyUWl4UlFVRlJMRU5CUVVNc1RVRkJWQ3hIUVVGclFpeFhRVVJvUkN4SlFVbERMRWxCUVVrc1EwRkJReXhKUVVGTUxFZEJRVmtzU1VGQlNTeERRVUZETEV0QlFXcENMRWxCUVRCQ0xFTkJRVU1zVjBGS05VSXNTVUZMUXl4SlFVRkpMRU5CUVVNc1MwRkJUQ3hIUVVGaExFbEJRVWtzUTBGQlF5eExRVUZzUWl4SlFVRXlRaXhSUVVGUkxFTkJRVU1zUzBGQlZDeEhRVUZwUWp0RlFXSm9RenM3ZVVKQmFVSm1MR0ZCUVVFc1IwRkJaU3hUUVVGQk8wbEJRMlFzUTBGQlFTeERRVUZITEUxQlFVZ3NRMEZCVnl4RFFVRkRMRVZCUVZvc1EwRkJaU3hSUVVGbUxFVkJRWGxDTEVsQlFVTXNRMEZCUVN3MFFrRkJNVUk3VjBGRFFTdzRRMEZCUVR0RlFVWmpPenQ1UWtGSlppeGhRVUZCTEVkQlFXVXNVMEZCUVR0SlFVTmtMRU5CUVVFc1EwRkJSeXhOUVVGSUxFTkJRVmNzUTBGQlF5eEhRVUZhTEVOQlFXZENMRkZCUVdoQ0xFVkJRVEJDTEVsQlFVTXNRMEZCUVN3MFFrRkJNMEk3VjBGRFFTdzRRMEZCUVR0RlFVWmpPenM3TzBkQmVFVlhPenRCUVRSRk0wSXNUVUZCVFN4RFFVRkRMRTlCUVZBc1IwRkJhVUlpZlE9PVxuIiwidmFyICQsIEhvb2tzLCBMYXp5X01hc29ucnksIE1hc29ucnk7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5NYXNvbnJ5ID0gcmVxdWlyZSgnLi9jbGFzcy9NYXNvbnJ5Jyk7XG5cbkxhenlfTWFzb25yeSA9IHJlcXVpcmUoJy4vbGF6eS9MYXp5X01hc29ucnknKTtcblxuSG9va3MuYWRkQWN0aW9uKCdwcC5tYXNvbnJ5LnN0YXJ0L2JlZm9yZScsIGZ1bmN0aW9uKCkge1xuICB2YXIgTGF6eV9IYW5kbGVyO1xuICBMYXp5X0hhbmRsZXIgPSBIb29rcy5hcHBseUZpbHRlcnMoJ3BwLmxhenkuaGFuZGxlcicsIExhenlfTWFzb25yeSk7XG4gIG5ldyBMYXp5X0hhbmRsZXIoKTtcbn0pO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3BwLm1hc29ucnkuc3RhcnQvY29tcGxldGUnLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIEhvb2tzLmRvQWN0aW9uKCdwcC5sYXp5LmF1dG9sb2FkJyk7XG59KTtcblxuSG9va3MuYWRkQWN0aW9uKCdwcC5yZWFkeScsIGZ1bmN0aW9uKCkge1xuICBpZiAoJCgnLlBQX01hc29ucnknKS5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIEhvb2tzLmFkZEZpbHRlcigncHAucG9ydGZvbGlvLmhhbmRsZXInLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgTWFzb25yeSgpO1xuICAgIH0pO1xuICB9XG59KTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYldGemIyNXllUzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYkltMWhjMjl1Y25rdVkyOW1abVZsSWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUpCUVVGQkxFbEJRVUU3TzBGQlFVRXNRMEZCUVN4SFFVRkpMRTlCUVVFc1EwRkJVeXhSUVVGVU96dEJRVU5LTEV0QlFVRXNSMEZCVVN4UFFVRkJMRU5CUVZNc1ZVRkJWRHM3UVVGRFVpeFBRVUZCTEVkQlFWVXNUMEZCUVN4RFFVRlRMR2xDUVVGVU96dEJRVU5XTEZsQlFVRXNSMEZCWlN4UFFVRkJMRU5CUVZNc2NVSkJRVlE3TzBGQlJXWXNTMEZCU3l4RFFVRkRMRk5CUVU0c1EwRkJaMElzZVVKQlFXaENMRVZCUVRKRExGTkJRVUU3UVVGSE1VTXNUVUZCUVR0RlFVRkJMRmxCUVVFc1IwRkJaU3hMUVVGTExFTkJRVU1zV1VGQlRpeERRVUZ0UWl4cFFrRkJia0lzUlVGQmMwTXNXVUZCZEVNN1JVRkRXQ3hKUVVGQkxGbEJRVUVzUTBGQlFUdEJRVXB6UXl4RFFVRXpRenM3UVVGUlFTeExRVUZMTEVOQlFVTXNVMEZCVGl4RFFVRm5RaXd5UWtGQmFFSXNSVUZCTmtNc1UwRkJRVHRUUVVNMVF5eExRVUZMTEVOQlFVTXNVVUZCVGl4RFFVRmxMR3RDUVVGbU8wRkJSRFJETEVOQlFUZERPenRCUVVsQkxFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMRlZCUVdoQ0xFVkJRVFJDTEZOQlFVRTdSVUZETTBJc1NVRkJSeXhEUVVGQkxFTkJRVWNzWVVGQlNDeERRVUZyUWl4RFFVRkRMRTFCUVc1Q0xFZEJRVFJDTEVOQlFTOUNPMWRCUTBNc1MwRkJTeXhEUVVGRExGTkJRVTRzUTBGQlowSXNjMEpCUVdoQ0xFVkJRWGRETEZOQlFVRTdZVUZCVHl4SlFVRkJMRTlCUVVFc1EwRkJRVHRKUVVGUUxFTkJRWGhETEVWQlJFUTdPMEZCUkRKQ0xFTkJRVFZDSW4wPVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
