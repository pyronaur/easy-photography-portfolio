(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var Core, Hooks, Portfolio;

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Core = require('./class/Core');

Portfolio = require('./class/Portfolio');

new Core();

Hooks.addAction('pp.core.ready', (function() {
  return new Portfolio();
}), 50);

require('./masonry');

require('./portfolio/popup');


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./class/Core":3,"./class/Portfolio":4,"./masonry":9,"./portfolio/popup":11}],2:[function(require,module,exports){
(function (global){
var Abstract_Portfolio_Actions, Hooks;

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);


/*
	Abstract Class Portoflio_Event_Imeplementation

    Handles all the events required to fully handle a portfolio layout process
 */

Abstract_Portfolio_Actions = (function() {
  function Abstract_Portfolio_Actions(args) {
    this.setup_actions();
    this.initialize(args);
  }

  Abstract_Portfolio_Actions.prototype.setup_actions = function() {
    Hooks.addAction('pp.portfolio.prepare', this.prepare, 50);
    Hooks.addAction('pp.portfolio.create', this.create, 50);
    Hooks.addAction('pp.portfolio.refresh', this.refresh, 50);
    Hooks.addAction('pp.portfolio.destroy', this.destroy, 50);
    return Hooks.addAction('pp.portfolio.destroy', this.purge_actions, 50);
  };

  Abstract_Portfolio_Actions.prototype.purge_actions = function() {
    Hooks.removeAction('pp.portfolio.create', this.prepare, 50);
    Hooks.removeAction('pp.portfolio.create', this.create, 50);
    Hooks.removeAction('pp.portfolio.refresh', this.refresh, 50);
    Hooks.removeAction('pp.portfolio.destroy', this.destroy, 50);
    return Hooks.removeAction('pp.portfolio.destroy', this.purge_actions, 50);
  };


  /*
     	Require these methods
   */

  Abstract_Portfolio_Actions.prototype.initialize = function() {
    throw new Error("[Abstract] Any subclass of `Portfolio_Actions` must implement `initialize` method");
  };

  Abstract_Portfolio_Actions.prototype.prepare = function() {
    throw new Error("[Abstract] Any subclass of `Portfolio_Actions` must implement `prepare` method");
  };

  Abstract_Portfolio_Actions.prototype.create = function() {
    throw new Error("[Abstract] Any subclass of `Portfolio_Actions` must implement `create` method");
  };

  Abstract_Portfolio_Actions.prototype.refresh = function() {
    throw new Error("[Abstract] Any subclass of `Portfolio_Actions` must implement `refresh` method");
  };

  Abstract_Portfolio_Actions.prototype.destroy = function() {
    throw new Error("[Abstract] Any subclass of `Portfolio_Actions` must implement `destroy` method");
  };

  return Abstract_Portfolio_Actions;

})();

module.exports = Abstract_Portfolio_Actions;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],3:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var $, Core, Hooks;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Core = (function() {
  function Core() {
    this.$doc = $(document);
    this.attach_events();
  }

  Core.prototype.attach_events = function() {
    this.$doc.on('ready', this.ready);
    this.$doc.find('.PP_Wrapper').imagesLoaded(this.loaded);
  };

  Core.prototype.ready = function() {
    if (Hooks.applyFilters('pp.core.ready', true)) {
      Hooks.doAction('pp.core.ready');
    }
  };

  Core.prototype.loaded = function() {
    if (Hooks.applyFilters('pp.loaded', true)) {
      Hooks.doAction('pp.core.loaded');
    }
  };

  return Core;

})();

module.exports = Core;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],4:[function(require,module,exports){
(function (global){
var Hooks, Portfolio;

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);


/*

     * Initialize Portfolio Core
	---
		Using p50 @ pp.loaded
		Late priority is going to force explicit priority in any other moving parts that are going to touch portfolio layout at `pp.loaded`
	---
 */

Portfolio = (function() {
  function Portfolio() {
    Hooks.addAction('pp.core.loaded', this.create, 50);
    this.prepare();
  }

  Portfolio.prototype.prepare = function() {
    Hooks.doAction('pp.portfolio.prepare');
  };

  Portfolio.prototype.create = function() {
    Hooks.doAction('pp.portfolio.create');
  };

  Portfolio.prototype.refresh = function() {
    Hooks.doAction('pp.portfolio.refresh');
  };

  Portfolio.prototype.destroy = function() {
    Hooks.doAction('pp.portfolio.destroy');
    Hooks.removeAction('pp.loaded', this.create, 50);
  };

  return Portfolio;

})();

module.exports = Portfolio;


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
    placeholder: 'PP_Lazy_Image__placeholder',
    link: 'PP_JS_Lazy__link',
    image: 'PP_JS_Lazy__image'
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

},{"./Item_Data":7}],7:[function(require,module,exports){
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


},{}],8:[function(require,module,exports){
(function (global){
var $, Abstract_Lazy_Loader, Lazy_Masonry, __WINDOW,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Abstract_Lazy_Loader = require('./Abstract_Lazy_Loader');

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
    item.$el.prepend("<a class=\"" + this.Elements.link + "\" href=\"" + full + "\" rel=\"gallery\">\n<img class=\"" + this.Elements.image + "\" src=\"" + thumb + "\" class=\"PP_JS__loading\" />\n</a>").removeClass('Lazy-Image');
    item.loaded = true;
    $image = item.$el.find('img');
    return $image.imagesLoaded((function(_this) {
      return function() {
        $image.addClass('PP_JS__loaded').removeClass('PP_JS__loading');
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

})(Abstract_Lazy_Loader);

module.exports = Lazy_Masonry;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../global/Window":5,"./Abstract_Lazy_Loader":6}],9:[function(require,module,exports){
(function (global){
var $, Hooks, Lazy_Masonry, Portfolio_Masonry;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Portfolio_Masonry = require('./portfolio/Portfolio_Masonry');

Lazy_Masonry = require('./lazy/Lazy_Masonry');

Hooks.addAction('pp.masonry.start/before', function() {
  var Lazy_Handler;
  Lazy_Handler = Hooks.applyFilters('pp.lazy.handler', Lazy_Masonry);
  new Lazy_Handler();
});

Hooks.addAction('pp.masonry.start/complete', function() {
  return Hooks.doAction('pp.lazy.autoload');
});

Hooks.addAction('pp.core.ready', function() {
  if ($('.PP_Masonry').length > 0) {
    return new Portfolio_Masonry($(document));
  }
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./lazy/Lazy_Masonry":8,"./portfolio/Portfolio_Masonry":10}],10:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var $, Hooks, Portfolio_Actions, Portfolio_Masonry,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Portfolio_Actions = require('./../class/Abstract_Portfolio_Actions');

Portfolio_Masonry = (function(superClass) {
  extend(Portfolio_Masonry, superClass);

  function Portfolio_Masonry() {
    this.refresh = bind(this.refresh, this);
    this.destroy = bind(this.destroy, this);
    this.create = bind(this.create, this);
    this.prepare = bind(this.prepare, this);
    return Portfolio_Masonry.__super__.constructor.apply(this, arguments);
  }

  Portfolio_Masonry.prototype.Elements = {
    container: 'PP_Masonry',
    sizer: 'PP_Masonry__sizer',
    item: 'PP_Masonry__item'
  };


  /*
  		Initialize
   */

  Portfolio_Masonry.prototype.initialize = function($parent) {
    return this.$container = $parent.find("." + this.Elements.container);
  };


  /*
  		Prepare & Attach Events
     	Don't show anything yet.
   */

  Portfolio_Masonry.prototype.prepare = function() {
    var masonry_settings;
    if (this.$container.length === 0) {
      return;
    }
    this.$container.addClass('PP_JS__loading_masonry');
    this.maybe_create_sizer();
    Hooks.doAction('pp.masonry.start/before');
    masonry_settings = Hooks.applyFilters('pp.masonry.settings', {
      itemSelector: "." + this.Elements.item,
      columnWidth: "." + this.Elements.sizer,
      gutter: 0,
      initLayout: false
    });
    this.$container.masonry(masonry_settings);
    return this.$container.masonry('on', 'layoutComplete', (function(_this) {
      return function() {
        Hooks.doAction('pp.masonry.start/complete');
        return _this.$container.removeClass('PP_JS__loading_masonry').addClass('PP_JS__loading_complete');
      };
    })(this));
  };


  /*
  		Start the Portfolio
   */

  Portfolio_Masonry.prototype.create = function() {
    this.$container.masonry();
    Hooks.doAction('pp.masonry.start/layout');
  };


  /*
  		Destroy
   */

  Portfolio_Masonry.prototype.destroy = function() {
    this.maybe_remove_sizer();
    if (this.$container.length > 0) {
      this.$container.masonry('destroy');
    }
  };


  /*
  		Reload the layout
   */

  Portfolio_Masonry.prototype.refresh = function() {
    return this.$container.masonry('layout');
  };


  /*
  
  		Create a sizer element for jquery-masonry to use
   */

  Portfolio_Masonry.prototype.maybe_create_sizer = function() {
    if (this.sizer_doesnt_exist()) {
      this.create_sizer();
    }
  };

  Portfolio_Masonry.prototype.maybe_remove_sizer = function() {
    if (this.$container.length !== 1) {
      return;
    }
    this.$container.find("." + this.Elements.sizer).remove();
  };

  Portfolio_Masonry.prototype.sizer_doesnt_exist = function() {
    return this.$container.find("." + this.Elements.sizer).length === 0;
  };

  Portfolio_Masonry.prototype.create_sizer = function() {
    this.$container.append("<div class=\"" + this.Elements.sizer + "\"></div>");
  };

  return Portfolio_Masonry;

})(Portfolio_Actions);

module.exports = Portfolio_Masonry;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../class/Abstract_Portfolio_Actions":2}],11:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var $, Hooks, Item_Data, get_data;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Item_Data = require('../lazy/Item_Data');

get_data = function(el) {
  var $container, $el, $items, items;
  $el = $(el);
  $container = $el.closest('.PP_Gallery');
  $items = $container.find('.PP_Gallery__item');
  items = $items.map(function(key, item) {
    var i;
    i = new Item_Data($(item));
    return {
      src: i.get_url('full'),
      thumb: i.get_url('thumb')
    };
  });
  return items;
};

Hooks.addAction('pp.core.ready', function() {
  return $('.PP_Gallery__item').on('click', function(e) {
    var $el;
    e.preventDefault();
    $el = $(this);
    return $el.lightGallery({
      dynamic: true,
      dynamicEl: get_data(this),
      index: $('.PP_Gallery__item').index($el),
      speed: 350,
      preload: 3,
      download: false
    });
  });
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../lazy/Item_Data":7}]},{},[1])


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jbGFzcy9BYnN0cmFjdF9Qb3J0Zm9saW9fQWN0aW9ucy5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY2xhc3MvQ29yZS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY2xhc3MvUG9ydGZvbGlvLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9nbG9iYWwvV2luZG93LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0Fic3RyYWN0X0xhenlfTG9hZGVyLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0l0ZW1fRGF0YS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvbGF6eS9MYXp5X01hc29ucnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL21hc29ucnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL3BvcnRmb2xpby9Qb3J0Zm9saW9fTWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL3BvcHVwLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgQ29yZSwgSG9va3MsIFBvcnRmb2xpbztcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuQ29yZSA9IHJlcXVpcmUoJy4vY2xhc3MvQ29yZScpO1xuXG5Qb3J0Zm9saW8gPSByZXF1aXJlKCcuL2NsYXNzL1BvcnRmb2xpbycpO1xuXG5uZXcgQ29yZSgpO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3BwLmNvcmUucmVhZHknLCAoZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgUG9ydGZvbGlvKCk7XG59KSwgNTApO1xuXG5yZXF1aXJlKCcuL21hc29ucnknKTtcblxucmVxdWlyZSgnLi9wb3J0Zm9saW8vcG9wdXAnKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pWVhCd0xtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpWVhCd0xtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pTzBGQlFVRTdPenRCUVVGQkxFbEJRVUU3TzBGQlIwRXNTMEZCUVN4SFFVRlJMRTlCUVVFc1EwRkJVeXhWUVVGVU96dEJRVU5TTEVsQlFVRXNSMEZCVHl4UFFVRkJMRU5CUVZNc1kwRkJWRHM3UVVGRFVDeFRRVUZCTEVkQlFWa3NUMEZCUVN4RFFVRlRMRzFDUVVGVU96dEJRVWxTTEVsQlFVRXNTVUZCUVN4RFFVRkJPenRCUVVkS0xFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMR1ZCUVdoQ0xFVkJRV2xETEVOQlFVVXNVMEZCUVR0VFFVRlBMRWxCUVVFc1UwRkJRU3hEUVVGQk8wRkJRVkFzUTBGQlJpeERRVUZxUXl4RlFVRjVSQ3hGUVVGNlJEczdRVUZIUVN4UFFVRkJMRU5CUVZFc1YwRkJVanM3UVVGSFFTeFBRVUZCTEVOQlFWRXNiVUpCUVZJaWZRPT1cbiIsInZhciBBYnN0cmFjdF9Qb3J0Zm9saW9fQWN0aW9ucywgSG9va3M7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cblxuLypcblx0QWJzdHJhY3QgQ2xhc3MgUG9ydG9mbGlvX0V2ZW50X0ltZXBsZW1lbnRhdGlvblxuXG4gICAgSGFuZGxlcyBhbGwgdGhlIGV2ZW50cyByZXF1aXJlZCB0byBmdWxseSBoYW5kbGUgYSBwb3J0Zm9saW8gbGF5b3V0IHByb2Nlc3NcbiAqL1xuXG5BYnN0cmFjdF9Qb3J0Zm9saW9fQWN0aW9ucyA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gQWJzdHJhY3RfUG9ydGZvbGlvX0FjdGlvbnMoYXJncykge1xuICAgIHRoaXMuc2V0dXBfYWN0aW9ucygpO1xuICAgIHRoaXMuaW5pdGlhbGl6ZShhcmdzKTtcbiAgfVxuXG4gIEFic3RyYWN0X1BvcnRmb2xpb19BY3Rpb25zLnByb3RvdHlwZS5zZXR1cF9hY3Rpb25zID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MuYWRkQWN0aW9uKCdwcC5wb3J0Zm9saW8ucHJlcGFyZScsIHRoaXMucHJlcGFyZSwgNTApO1xuICAgIEhvb2tzLmFkZEFjdGlvbigncHAucG9ydGZvbGlvLmNyZWF0ZScsIHRoaXMuY3JlYXRlLCA1MCk7XG4gICAgSG9va3MuYWRkQWN0aW9uKCdwcC5wb3J0Zm9saW8ucmVmcmVzaCcsIHRoaXMucmVmcmVzaCwgNTApO1xuICAgIEhvb2tzLmFkZEFjdGlvbigncHAucG9ydGZvbGlvLmRlc3Ryb3knLCB0aGlzLmRlc3Ryb3ksIDUwKTtcbiAgICByZXR1cm4gSG9va3MuYWRkQWN0aW9uKCdwcC5wb3J0Zm9saW8uZGVzdHJveScsIHRoaXMucHVyZ2VfYWN0aW9ucywgNTApO1xuICB9O1xuXG4gIEFic3RyYWN0X1BvcnRmb2xpb19BY3Rpb25zLnByb3RvdHlwZS5wdXJnZV9hY3Rpb25zID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MucmVtb3ZlQWN0aW9uKCdwcC5wb3J0Zm9saW8uY3JlYXRlJywgdGhpcy5wcmVwYXJlLCA1MCk7XG4gICAgSG9va3MucmVtb3ZlQWN0aW9uKCdwcC5wb3J0Zm9saW8uY3JlYXRlJywgdGhpcy5jcmVhdGUsIDUwKTtcbiAgICBIb29rcy5yZW1vdmVBY3Rpb24oJ3BwLnBvcnRmb2xpby5yZWZyZXNoJywgdGhpcy5yZWZyZXNoLCA1MCk7XG4gICAgSG9va3MucmVtb3ZlQWN0aW9uKCdwcC5wb3J0Zm9saW8uZGVzdHJveScsIHRoaXMuZGVzdHJveSwgNTApO1xuICAgIHJldHVybiBIb29rcy5yZW1vdmVBY3Rpb24oJ3BwLnBvcnRmb2xpby5kZXN0cm95JywgdGhpcy5wdXJnZV9hY3Rpb25zLCA1MCk7XG4gIH07XG5cblxuICAvKlxuICAgICBcdFJlcXVpcmUgdGhlc2UgbWV0aG9kc1xuICAgKi9cblxuICBBYnN0cmFjdF9Qb3J0Zm9saW9fQWN0aW9ucy5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fQWN0aW9uc2AgbXVzdCBpbXBsZW1lbnQgYGluaXRpYWxpemVgIG1ldGhvZFwiKTtcbiAgfTtcblxuICBBYnN0cmFjdF9Qb3J0Zm9saW9fQWN0aW9ucy5wcm90b3R5cGUucHJlcGFyZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fQWN0aW9uc2AgbXVzdCBpbXBsZW1lbnQgYHByZXBhcmVgIG1ldGhvZFwiKTtcbiAgfTtcblxuICBBYnN0cmFjdF9Qb3J0Zm9saW9fQWN0aW9ucy5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19BY3Rpb25zYCBtdXN0IGltcGxlbWVudCBgY3JlYXRlYCBtZXRob2RcIik7XG4gIH07XG5cbiAgQWJzdHJhY3RfUG9ydGZvbGlvX0FjdGlvbnMucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0FjdGlvbnNgIG11c3QgaW1wbGVtZW50IGByZWZyZXNoYCBtZXRob2RcIik7XG4gIH07XG5cbiAgQWJzdHJhY3RfUG9ydGZvbGlvX0FjdGlvbnMucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0FjdGlvbnNgIG11c3QgaW1wbGVtZW50IGBkZXN0cm95YCBtZXRob2RcIik7XG4gIH07XG5cbiAgcmV0dXJuIEFic3RyYWN0X1BvcnRmb2xpb19BY3Rpb25zO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFic3RyYWN0X1BvcnRmb2xpb19BY3Rpb25zO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lRV0p6ZEhKaFkzUmZVRzl5ZEdadmJHbHZYMEZqZEdsdmJuTXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lKQlluTjBjbUZqZEY5UWIzSjBabTlzYVc5ZlFXTjBhVzl1Y3k1amIyWm1aV1VpWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFc1NVRkJRVHM3UVVGQlFTeExRVUZCTEVkQlFWRXNUMEZCUVN4RFFVRlRMRlZCUVZRN096dEJRVWRTT3pzN096czdRVUZMVFR0RlFVVlJMRzlEUVVGRkxFbEJRVVk3U1VGRFdpeEpRVUZETEVOQlFVRXNZVUZCUkN4RFFVRkJPMGxCUTBFc1NVRkJReXhEUVVGQkxGVkJRVVFzUTBGQllTeEpRVUZpTzBWQlJsazdPM1ZEUVVsaUxHRkJRVUVzUjBGQlpTeFRRVUZCTzBsQlEyUXNTMEZCU3l4RFFVRkRMRk5CUVU0c1EwRkJaMElzYzBKQlFXaENMRVZCUVhkRExFbEJRVU1zUTBGQlFTeFBRVUY2UXl4RlFVRnJSQ3hGUVVGc1JEdEpRVU5CTEV0QlFVc3NRMEZCUXl4VFFVRk9MRU5CUVdkQ0xIRkNRVUZvUWl4RlFVRjFReXhKUVVGRExFTkJRVUVzVFVGQmVFTXNSVUZCWjBRc1JVRkJhRVE3U1VGRFFTeExRVUZMTEVOQlFVTXNVMEZCVGl4RFFVRm5RaXh6UWtGQmFFSXNSVUZCZDBNc1NVRkJReXhEUVVGQkxFOUJRWHBETEVWQlFXdEVMRVZCUVd4RU8wbEJRMEVzUzBGQlN5eERRVUZETEZOQlFVNHNRMEZCWjBJc2MwSkJRV2hDTEVWQlFYZERMRWxCUVVNc1EwRkJRU3hQUVVGNlF5eEZRVUZyUkN4RlFVRnNSRHRYUVVOQkxFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMSE5DUVVGb1FpeEZRVUYzUXl4SlFVRkRMRU5CUVVFc1lVRkJla01zUlVGQmQwUXNSVUZCZUVRN1JVRk1ZenM3ZFVOQlQyWXNZVUZCUVN4SFFVRmxMRk5CUVVFN1NVRkRaQ3hMUVVGTExFTkJRVU1zV1VGQlRpeERRVUZ0UWl4eFFrRkJia0lzUlVGQk1FTXNTVUZCUXl4RFFVRkJMRTlCUVRORExFVkJRVzlFTEVWQlFYQkVPMGxCUTBFc1MwRkJTeXhEUVVGRExGbEJRVTRzUTBGQmJVSXNjVUpCUVc1Q0xFVkJRVEJETEVsQlFVTXNRMEZCUVN4TlFVRXpReXhGUVVGdFJDeEZRVUZ1UkR0SlFVTkJMRXRCUVVzc1EwRkJReXhaUVVGT0xFTkJRVzFDTEhOQ1FVRnVRaXhGUVVFeVF5eEpRVUZETEVOQlFVRXNUMEZCTlVNc1JVRkJjVVFzUlVGQmNrUTdTVUZEUVN4TFFVRkxMRU5CUVVNc1dVRkJUaXhEUVVGdFFpeHpRa0ZCYmtJc1JVRkJNa01zU1VGQlF5eERRVUZCTEU5QlFUVkRMRVZCUVhGRUxFVkJRWEpFTzFkQlEwRXNTMEZCU3l4RFFVRkRMRmxCUVU0c1EwRkJiVUlzYzBKQlFXNUNMRVZCUVRKRExFbEJRVU1zUTBGQlFTeGhRVUUxUXl4RlFVRXlSQ3hGUVVFelJEdEZRVXhqT3pzN1FVRlJaanM3T3p0MVEwRkhRU3hWUVVGQkxFZEJRVmtzVTBGQlFUdEJRVUZITEZWQlFWVXNTVUZCUVN4TFFVRkJMRU5CUVU4c2JVWkJRVkE3UlVGQllqczdkVU5CUTFvc1QwRkJRU3hIUVVGWkxGTkJRVUU3UVVGQlJ5eFZRVUZWTEVsQlFVRXNTMEZCUVN4RFFVRlBMR2RHUVVGUU8wVkJRV0k3TzNWRFFVTmFMRTFCUVVFc1IwRkJXU3hUUVVGQk8wRkJRVWNzVlVGQlZTeEpRVUZCTEV0QlFVRXNRMEZCVHl3clJVRkJVRHRGUVVGaU96dDFRMEZEV2l4UFFVRkJMRWRCUVZrc1UwRkJRVHRCUVVGSExGVkJRVlVzU1VGQlFTeExRVUZCTEVOQlFVOHNaMFpCUVZBN1JVRkJZanM3ZFVOQlExb3NUMEZCUVN4SFFVRlpMRk5CUVVFN1FVRkJSeXhWUVVGVkxFbEJRVUVzUzBGQlFTeERRVUZQTEdkR1FVRlFPMFZCUVdJN096czdPenRCUVVWaUxFMUJRVTBzUTBGQlF5eFBRVUZRTEVkQlFXbENJbjA9XG4iLCJcbi8qXG4gICAgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBDb3JlLCBIb29rcztcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbkNvcmUgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIENvcmUoKSB7XG4gICAgdGhpcy4kZG9jID0gJChkb2N1bWVudCk7XG4gICAgdGhpcy5hdHRhY2hfZXZlbnRzKCk7XG4gIH1cblxuICBDb3JlLnByb3RvdHlwZS5hdHRhY2hfZXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kZG9jLm9uKCdyZWFkeScsIHRoaXMucmVhZHkpO1xuICAgIHRoaXMuJGRvYy5maW5kKCcuUFBfV3JhcHBlcicpLmltYWdlc0xvYWRlZCh0aGlzLmxvYWRlZCk7XG4gIH07XG5cbiAgQ29yZS5wcm90b3R5cGUucmVhZHkgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoSG9va3MuYXBwbHlGaWx0ZXJzKCdwcC5jb3JlLnJlYWR5JywgdHJ1ZSkpIHtcbiAgICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5jb3JlLnJlYWR5Jyk7XG4gICAgfVxuICB9O1xuXG4gIENvcmUucHJvdG90eXBlLmxvYWRlZCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChIb29rcy5hcHBseUZpbHRlcnMoJ3BwLmxvYWRlZCcsIHRydWUpKSB7XG4gICAgICBIb29rcy5kb0FjdGlvbigncHAuY29yZS5sb2FkZWQnKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIENvcmU7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29yZTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pUTI5eVpTNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSWtOdmNtVXVZMjltWm1WbElsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lJN1FVRkJRVHM3TzBGQlFVRXNTVUZCUVRzN1FVRkhRU3hEUVVGQkxFZEJRVWtzVDBGQlFTeERRVUZUTEZGQlFWUTdPMEZCUTBvc1MwRkJRU3hIUVVGUkxFOUJRVUVzUTBGQlV5eFZRVUZVT3p0QlFVZEdPMFZCUlZFc1kwRkJRVHRKUVVOYUxFbEJRVU1zUTBGQlFTeEpRVUZFTEVkQlFWRXNRMEZCUVN4RFFVRkhMRkZCUVVnN1NVRkRVaXhKUVVGRExFTkJRVUVzWVVGQlJDeERRVUZCTzBWQlJsazdPMmxDUVUxaUxHRkJRVUVzUjBGQlpTeFRRVUZCTzBsQlEyUXNTVUZCUXl4RFFVRkJMRWxCUVVrc1EwRkJReXhGUVVGT0xFTkJRVk1zVDBGQlZDeEZRVUZyUWl4SlFVRkRMRU5CUVVFc1MwRkJia0k3U1VGRFFTeEpRVUZETEVOQlFVRXNTVUZCU1N4RFFVRkRMRWxCUVU0c1EwRkJXU3hoUVVGYUxFTkJRVEpDTEVOQlFVTXNXVUZCTlVJc1EwRkJNRU1zU1VGQlF5eERRVUZCTEUxQlFUTkRPMFZCUm1NN08ybENRVkZtTEV0QlFVRXNSMEZCVHl4VFFVRkJPMGxCUTA0c1NVRkJSeXhMUVVGTExFTkJRVU1zV1VGQlRpeERRVUZ2UWl4bFFVRndRaXhGUVVGeFF5eEpRVUZ5UXl4RFFVRklPMDFCUTBNc1MwRkJTeXhEUVVGRExGRkJRVTRzUTBGQlpTeGxRVUZtTEVWQlJFUTdPMFZCUkUwN08ybENRVTlRTEUxQlFVRXNSMEZCVVN4VFFVRkJPMGxCUTFBc1NVRkJSeXhMUVVGTExFTkJRVU1zV1VGQlRpeERRVUZ2UWl4WFFVRndRaXhGUVVGcFF5eEpRVUZxUXl4RFFVRklPMDFCUTBNc1MwRkJTeXhEUVVGRExGRkJRVTRzUTBGQlpTeG5Ra0ZCWml4RlFVUkVPenRGUVVSUE96czdPenM3UVVGUFZDeE5RVUZOTEVOQlFVTXNUMEZCVUN4SFFVRnBRaUo5XG4iLCJ2YXIgSG9va3MsIFBvcnRmb2xpbztcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuXG4vKlxuXG4gICAgICogSW5pdGlhbGl6ZSBQb3J0Zm9saW8gQ29yZVxuXHQtLS1cblx0XHRVc2luZyBwNTAgQCBwcC5sb2FkZWRcblx0XHRMYXRlIHByaW9yaXR5IGlzIGdvaW5nIHRvIGZvcmNlIGV4cGxpY2l0IHByaW9yaXR5IGluIGFueSBvdGhlciBtb3ZpbmcgcGFydHMgdGhhdCBhcmUgZ29pbmcgdG8gdG91Y2ggcG9ydGZvbGlvIGxheW91dCBhdCBgcHAubG9hZGVkYFxuXHQtLS1cbiAqL1xuXG5Qb3J0Zm9saW8gPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIFBvcnRmb2xpbygpIHtcbiAgICBIb29rcy5hZGRBY3Rpb24oJ3BwLmNvcmUubG9hZGVkJywgdGhpcy5jcmVhdGUsIDUwKTtcbiAgICB0aGlzLnByZXBhcmUoKTtcbiAgfVxuXG4gIFBvcnRmb2xpby5wcm90b3R5cGUucHJlcGFyZSA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5wb3J0Zm9saW8ucHJlcGFyZScpO1xuICB9O1xuXG4gIFBvcnRmb2xpby5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MuZG9BY3Rpb24oJ3BwLnBvcnRmb2xpby5jcmVhdGUnKTtcbiAgfTtcblxuICBQb3J0Zm9saW8ucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbigpIHtcbiAgICBIb29rcy5kb0FjdGlvbigncHAucG9ydGZvbGlvLnJlZnJlc2gnKTtcbiAgfTtcblxuICBQb3J0Zm9saW8ucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICBIb29rcy5kb0FjdGlvbigncHAucG9ydGZvbGlvLmRlc3Ryb3knKTtcbiAgICBIb29rcy5yZW1vdmVBY3Rpb24oJ3BwLmxvYWRlZCcsIHRoaXMuY3JlYXRlLCA1MCk7XG4gIH07XG5cbiAgcmV0dXJuIFBvcnRmb2xpbztcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW87XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVVHOXlkR1p2YkdsdkxtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpVUc5eWRHWnZiR2x2TG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4SlFVRkJPenRCUVVGQkxFdEJRVUVzUjBGQlVTeFBRVUZCTEVOQlFWTXNWVUZCVkRzN08wRkJSVkk3T3pzN096czdPenRCUVZOTk8wVkJSVkVzYlVKQlFVRTdTVUZEV2l4TFFVRkxMRU5CUVVNc1UwRkJUaXhEUVVGblFpeG5Ra0ZCYUVJc1JVRkJhME1zU1VGQlF5eERRVUZCTEUxQlFXNURMRVZCUVRKRExFVkJRVE5ETzBsQlEwRXNTVUZCUXl4RFFVRkJMRTlCUVVRc1EwRkJRVHRGUVVaWk96dHpRa0ZKWWl4UFFVRkJMRWRCUVZNc1UwRkJRVHRKUVVOU0xFdEJRVXNzUTBGQlF5eFJRVUZPTEVOQlFXVXNjMEpCUVdZN1JVRkVVVHM3YzBKQlNWUXNUVUZCUVN4SFFVRlJMRk5CUVVFN1NVRkRVQ3hMUVVGTExFTkJRVU1zVVVGQlRpeERRVUZsTEhGQ1FVRm1PMFZCUkU4N08zTkNRVXRTTEU5QlFVRXNSMEZCVXl4VFFVRkJPMGxCUTFJc1MwRkJTeXhEUVVGRExGRkJRVTRzUTBGQlpTeHpRa0ZCWmp0RlFVUlJPenR6UWtGTFZDeFBRVUZCTEVkQlFWTXNVMEZCUVR0SlFVVlNMRXRCUVVzc1EwRkJReXhSUVVGT0xFTkJRV1VzYzBKQlFXWTdTVUZEUVN4TFFVRkxMRU5CUVVNc1dVRkJUaXhEUVVGdFFpeFhRVUZ1UWl4RlFVRm5ReXhKUVVGRExFTkJRVUVzVFVGQmFrTXNSVUZCZVVNc1JVRkJla003UlVGSVVUczdPenM3TzBGQlQxWXNUVUZCVFN4RFFVRkRMRTlCUVZBc1IwRkJhVUlpZlE9PVxuIiwidmFyIEhvb2tzLCBnZXRfc2l6ZTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuZ2V0X3NpemUgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICB3aWR0aDogd2luZG93LmlubmVyV2lkdGggfHwgJHdpbmRvdy53aWR0aCgpLFxuICAgIGhlaWdodDogd2luZG93LmlubmVySGVpZ2h0IHx8ICR3aW5kb3cuaGVpZ2h0KClcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0X3NpemUoKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVjJsdVpHOTNMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaVYybHVaRzkzTG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4SlFVRkJPenRCUVVGQkxFdEJRVUVzUjBGQlVTeFBRVUZCTEVOQlFWTXNWVUZCVkRzN1FVRkhVaXhSUVVGQkxFZEJRVmNzVTBGQlFUdFRRVU5XTzBsQlFVRXNTMEZCUVN4RlFVRlJMRTFCUVUwc1EwRkJReXhWUVVGUUxFbEJRWEZDTEU5QlFVOHNRMEZCUXl4TFFVRlNMRU5CUVVFc1EwRkJOMEk3U1VGRFFTeE5RVUZCTEVWQlFWRXNUVUZCVFN4RFFVRkRMRmRCUVZBc1NVRkJjMElzVDBGQlR5eERRVUZETEUxQlFWSXNRMEZCUVN4RFFVUTVRanM3UVVGRVZUczdRVUZMV0N4TlFVRk5MRU5CUVVNc1QwRkJVQ3hIUVVGcFFpeFJRVUZCTEVOQlFVRWlmUT09XG4iLCJcbi8qXG4gICAgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBIb29rcywgSXRlbV9EYXRhLCBMYXp5X0xvYWRlcjtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbkl0ZW1fRGF0YSA9IHJlcXVpcmUoJy4vSXRlbV9EYXRhJyk7XG5cbkxhenlfTG9hZGVyID0gKGZ1bmN0aW9uKCkge1xuICBMYXp5X0xvYWRlci5wcm90b3R5cGUuRWxlbWVudHMgPSB7XG4gICAgaXRlbTogJ1BQX0xhenlfSW1hZ2UnLFxuICAgIHBsYWNlaG9sZGVyOiAnUFBfTGF6eV9JbWFnZV9fcGxhY2Vob2xkZXInLFxuICAgIGxpbms6ICdQUF9KU19MYXp5X19saW5rJyxcbiAgICBpbWFnZTogJ1BQX0pTX0xhenlfX2ltYWdlJ1xuICB9O1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5JdGVtcyA9IFtdO1xuXG4gIGZ1bmN0aW9uIExhenlfTG9hZGVyKCkge1xuICAgIHRoaXMuc2V0dXBfZGF0YSgpO1xuICAgIHRoaXMucmVzaXplX2FsbCgpO1xuICAgIHRoaXMuYXR0YWNoX2V2ZW50cygpO1xuICB9XG5cblxuICAvKlxuICBcdFx0QWJzdHJhY3QgTWV0aG9kc1xuICAgKi9cblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYExhenlfTG9hZGVyYCBtdXN0IGltcGxlbWVudCBgcmVzaXplYCBtZXRob2RcIik7XG4gIH07XG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgTGF6eV9Mb2FkZXJgIG11c3QgaW1wbGVtZW50IGBsb2FkYCBtZXRob2RcIik7XG4gIH07XG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLmF1dG9sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYExhenlfTG9hZGVyYCBtdXN0IGltcGxlbWVudCBgYXV0b2xvYWRgIG1ldGhvZFwiKTtcbiAgfTtcblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUuc2V0dXBfZGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciAkaXRlbXM7XG4gICAgJGl0ZW1zID0gJChcIi5cIiArIHRoaXMuRWxlbWVudHMuaXRlbSk7XG4gICAgJGl0ZW1zLmVhY2goKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oa2V5LCBlbCkge1xuICAgICAgICB2YXIgJGVsO1xuICAgICAgICAkZWwgPSAkKGVsKTtcbiAgICAgICAgcmV0dXJuIF90aGlzLkl0ZW1zLnB1c2goe1xuICAgICAgICAgIGVsOiBlbCxcbiAgICAgICAgICAkZWw6ICRlbCxcbiAgICAgICAgICBkYXRhOiBuZXcgSXRlbV9EYXRhKCRlbCksXG4gICAgICAgICAgbG9hZGVkOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9O1xuXG5cbiAgLypcbiAgXHRcdE1ldGhvZHNcbiAgICovXG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLnJlc2l6ZV9hbGwgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaSwgaXRlbSwgbGVuLCByZWYsIHJlc3VsdHM7XG4gICAgcmVmID0gdGhpcy5JdGVtcztcbiAgICByZXN1bHRzID0gW107XG4gICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpdGVtID0gcmVmW2ldO1xuICAgICAgcmVzdWx0cy5wdXNoKHRoaXMucmVzaXplKGl0ZW0pKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLmxvYWRfYWxsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGksIGl0ZW0sIGxlbiwgcmVmLCByZXN1bHRzO1xuICAgIHJlZiA9IHRoaXMuSXRlbXM7XG4gICAgcmVzdWx0cyA9IFtdO1xuICAgIGZvciAoaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgaXRlbSA9IHJlZltpXTtcbiAgICAgIHRoaXMubG9hZChpdGVtKTtcbiAgICAgIHJlc3VsdHMucHVzaCh0aGlzLnJlbW92ZV9wbGFjZWhvbGRlcihpdGVtKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5yZW1vdmVfcGxhY2Vob2xkZXIgPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0uJGVsLmZpbmQoXCIuXCIgKyB0aGlzLkVsZW1lbnRzLnBsYWNlaG9sZGVyICsgXCIsIG5vc2NyaXB0XCIpLnJlbW92ZSgpO1xuICB9O1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZGV0YWNoX2V2ZW50cygpO1xuICB9O1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5hdHRhY2hfZXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEhvb2tzLmFkZEFjdGlvbigncHAubGF6eS5hdXRvbG9hZCcsIHRoaXMuYXV0b2xvYWQpO1xuICB9O1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5kZXRhY2hfZXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEhvb2tzLnJlbW92ZUFjdGlvbigncHAubGF6eS5hdXRvbG9hZCcsIHRoaXMuYXV0b2xvYWQpO1xuICB9O1xuXG4gIHJldHVybiBMYXp5X0xvYWRlcjtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBMYXp5X0xvYWRlcjtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pUVdKemRISmhZM1JmVEdGNmVWOU1iMkZrWlhJdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUpCWW5OMGNtRmpkRjlNWVhwNVgweHZZV1JsY2k1amIyWm1aV1VpWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanRCUVVGQk96czdRVUZCUVN4SlFVRkJPenRCUVVkQkxFTkJRVUVzUjBGQlNTeFBRVUZCTEVOQlFWTXNVVUZCVkRzN1FVRkRTaXhMUVVGQkxFZEJRVkVzVDBGQlFTeERRVUZUTEZWQlFWUTdPMEZCUTFJc1UwRkJRU3hIUVVGWkxFOUJRVUVzUTBGQlV5eGhRVUZVT3p0QlFVVk9PM2RDUVVWTUxGRkJRVUVzUjBGRFF6dEpRVUZCTEVsQlFVRXNSVUZCWVN4bFFVRmlPMGxCUTBFc1YwRkJRU3hGUVVGaExEUkNRVVJpTzBsQlJVRXNTVUZCUVN4RlFVRlBMR3RDUVVaUU8wbEJSMEVzUzBGQlFTeEZRVUZQTEcxQ1FVaFFPenM3ZDBKQlMwUXNTMEZCUVN4SFFVRlBPenRGUVVkTkxIRkNRVUZCTzBsQlExb3NTVUZCUXl4RFFVRkJMRlZCUVVRc1EwRkJRVHRKUVVOQkxFbEJRVU1zUTBGQlFTeFZRVUZFTEVOQlFVRTdTVUZEUVN4SlFVRkRMRU5CUVVFc1lVRkJSQ3hEUVVGQk8wVkJTRms3T3p0QlFVMWlPenM3TzNkQ1FVZEJMRTFCUVVFc1IwRkJWU3hUUVVGQk8wRkJRVWNzVlVGQlZTeEpRVUZCTEV0QlFVRXNRMEZCVHl4NVJVRkJVRHRGUVVGaU96dDNRa0ZEVml4SlFVRkJMRWRCUVZVc1UwRkJRVHRCUVVGSExGVkJRVlVzU1VGQlFTeExRVUZCTEVOQlFVOHNkVVZCUVZBN1JVRkJZanM3ZDBKQlExWXNVVUZCUVN4SFFVRlZMRk5CUVVFN1FVRkJSeXhWUVVGVkxFbEJRVUVzUzBGQlFTeERRVUZQTERKRlFVRlFPMFZCUVdJN08zZENRVWRXTEZWQlFVRXNSMEZCV1N4VFFVRkJPMEZCUTFnc1VVRkJRVHRKUVVGQkxFMUJRVUVzUjBGQlV5eERRVUZCTEVOQlFVY3NSMEZCUVN4SFFVRkpMRWxCUVVNc1EwRkJRU3hSUVVGUkxFTkJRVU1zU1VGQmFrSTdTVUZGVkN4TlFVRk5MRU5CUVVNc1NVRkJVQ3hEUVVGWkxFTkJRVUVzVTBGQlFTeExRVUZCTzJGQlFVRXNVMEZCUlN4SFFVRkdMRVZCUVU4c1JVRkJVRHRCUVVWWUxGbEJRVUU3VVVGQlFTeEhRVUZCTEVkQlFVMHNRMEZCUVN4RFFVRkhMRVZCUVVnN1pVRkRUaXhMUVVGRExFTkJRVUVzUzBGQlN5eERRVUZETEVsQlFWQXNRMEZEUXp0VlFVRkJMRVZCUVVFc1JVRkJVU3hGUVVGU08xVkJRMEVzUjBGQlFTeEZRVUZSTEVkQlJGSTdWVUZGUVN4SlFVRkJMRVZCUVZrc1NVRkJRU3hUUVVGQkxFTkJRVmNzUjBGQldDeERRVVphTzFWQlIwRXNUVUZCUVN4RlFVRlJMRXRCU0ZJN1UwRkVSRHROUVVoWE8wbEJRVUVzUTBGQlFTeERRVUZCTEVOQlFVRXNTVUZCUVN4RFFVRmFPMFZCU0ZjN096dEJRV1ZhT3pzN08zZENRVWRCTEZWQlFVRXNSMEZCV1N4VFFVRkJPMEZCUTFnc1VVRkJRVHRCUVVGQk8wRkJRVUU3VTBGQlFTeHhRMEZCUVRzN2JVSkJRVUVzU1VGQlF5eERRVUZCTEUxQlFVUXNRMEZCVXl4SlFVRlVPMEZCUVVFN08wVkJSRmM3TzNkQ1FVZGFMRkZCUVVFc1IwRkJWU3hUUVVGQk8wRkJRMVFzVVVGQlFUdEJRVUZCTzBGQlFVRTdVMEZCUVN4eFEwRkJRVHM3VFVGRFF5eEpRVUZETEVOQlFVRXNTVUZCUkN4RFFVRlBMRWxCUVZBN2JVSkJRMEVzU1VGQlF5eERRVUZCTEd0Q1FVRkVMRU5CUVhGQ0xFbEJRWEpDTzBGQlJrUTdPMFZCUkZNN08zZENRVXRXTEd0Q1FVRkJMRWRCUVc5Q0xGTkJRVVVzU1VGQlJqdFhRVU51UWl4SlFVRkpMRU5CUVVNc1IwRkJSeXhEUVVGRExFbEJRVlFzUTBGQlpTeEhRVUZCTEVkQlFVa3NTVUZCUXl4RFFVRkJMRkZCUVZFc1EwRkJReXhYUVVGa0xFZEJRVEJDTEZsQlFYcERMRU5CUVhORUxFTkJRVU1zVFVGQmRrUXNRMEZCUVR0RlFVUnRRanM3ZDBKQlNYQkNMRTlCUVVFc1IwRkJVeXhUUVVGQk8xZEJRMUlzU1VGQlF5eERRVUZCTEdGQlFVUXNRMEZCUVR0RlFVUlJPenQzUWtGSFZDeGhRVUZCTEVkQlFXVXNVMEZCUVR0WFFVTmtMRXRCUVVzc1EwRkJReXhUUVVGT0xFTkJRV2RDTEd0Q1FVRm9RaXhGUVVGdlF5eEpRVUZETEVOQlFVRXNVVUZCY2tNN1JVRkVZenM3ZDBKQlIyWXNZVUZCUVN4SFFVRmxMRk5CUVVFN1YwRkRaQ3hMUVVGTExFTkJRVU1zV1VGQlRpeERRVUZ0UWl4clFrRkJia0lzUlVGQmRVTXNTVUZCUXl4RFFVRkJMRkZCUVhoRE8wVkJSR003T3pzN096dEJRVWRvUWl4TlFVRk5MRU5CUVVNc1QwRkJVQ3hIUVVGcFFpSjlcbiIsInZhciBJdGVtX0RhdGE7XG5cbkl0ZW1fRGF0YSA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gSXRlbV9EYXRhKCRlbCkge1xuICAgIHZhciBkYXRhO1xuICAgIHRoaXMuJGVsID0gJGVsO1xuICAgIGRhdGEgPSAkZWwuZGF0YSgnaXRlbScpO1xuICAgIGlmICghZGF0YSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRWxlbWVudCBkb2Vzbid0IGNvbnRhaW4gYGRhdGEtaXRlbWAgYXR0cmlidXRlXCIpO1xuICAgIH1cbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICB9XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfZGF0YSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaW1hZ2U7XG4gICAgaW1hZ2UgPSB0aGlzLmRhdGFbJ2ltYWdlcyddW25hbWVdO1xuICAgIGlmICghaW1hZ2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGltYWdlO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X3NpemUgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGhlaWdodCwgaW1hZ2UsIHJlZiwgc2l6ZSwgd2lkdGg7XG4gICAgaW1hZ2UgPSB0aGlzLmdldF9kYXRhKG5hbWUpO1xuICAgIGlmICghaW1hZ2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgc2l6ZSA9IGltYWdlWydzaXplJ107XG4gICAgcmVmID0gc2l6ZS5zcGxpdCgneCcpLCB3aWR0aCA9IHJlZlswXSwgaGVpZ2h0ID0gcmVmWzFdO1xuICAgIHdpZHRoID0gcGFyc2VJbnQod2lkdGgpO1xuICAgIGhlaWdodCA9IHBhcnNlSW50KGhlaWdodCk7XG4gICAgcmV0dXJuIFt3aWR0aCwgaGVpZ2h0XTtcbiAgfTtcblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF91cmwgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGltYWdlO1xuICAgIGltYWdlID0gdGhpcy5nZXRfZGF0YShuYW1lKTtcbiAgICBpZiAoIWltYWdlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBpbWFnZVsndXJsJ107XG4gIH07XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfb3JfZmFsc2UgPSBmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAodGhpcy5kYXRhW2tleV0pIHtcbiAgICAgIHJldHVybiB0aGlzLmRhdGFba2V5XTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X3JhdGlvID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0X29yX2ZhbHNlKCdyYXRpbycpO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X3R5cGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRfb3JfZmFsc2UoJ3R5cGUnKTtcbiAgfTtcblxuICByZXR1cm4gSXRlbV9EYXRhO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEl0ZW1fRGF0YTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pU1hSbGJWOUVZWFJoTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lTWFJsYlY5RVlYUmhMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRU3hKUVVGQk96dEJRVUZOTzBWQlJWRXNiVUpCUVVVc1IwRkJSanRCUVVOYUxGRkJRVUU3U1VGQlFTeEpRVUZETEVOQlFVRXNSMEZCUkN4SFFVRlBPMGxCUTFBc1NVRkJRU3hIUVVGUExFZEJRVWNzUTBGQlF5eEpRVUZLTEVOQlFWVXNUVUZCVmp0SlFVVlFMRWxCUVVjc1EwRkJTU3hKUVVGUU8wRkJRME1zV1VGQlZTeEpRVUZCTEV0QlFVRXNRMEZCVFN3clEwRkJUaXhGUVVSWU96dEpRVWRCTEVsQlFVTXNRMEZCUVN4SlFVRkVMRWRCUVZFN1JVRlFTVHM3YzBKQlYySXNVVUZCUVN4SFFVRlZMRk5CUVVVc1NVRkJSanRCUVVOVUxGRkJRVUU3U1VGQlFTeExRVUZCTEVkQlFWRXNTVUZCUXl4RFFVRkJMRWxCUVUwc1EwRkJRU3hSUVVGQkxFTkJRVmtzUTBGQlFTeEpRVUZCTzBsQlF6TkNMRWxCUVdkQ0xFTkJRVWtzUzBGQmNFSTdRVUZCUVN4aFFVRlBMRTFCUVZBN08wRkJSVUVzVjBGQlR6dEZRVXBGT3p0elFrRk5WaXhSUVVGQkxFZEJRVlVzVTBGQlJTeEpRVUZHTzBGQlExUXNVVUZCUVR0SlFVRkJMRXRCUVVFc1IwRkJVU3hKUVVGRExFTkJRVUVzVVVGQlJDeERRVUZYTEVsQlFWZzdTVUZEVWl4SlFVRm5RaXhEUVVGSkxFdEJRWEJDTzBGQlFVRXNZVUZCVHl4TlFVRlFPenRKUVVWQkxFbEJRVUVzUjBGQlR5eExRVUZQTEVOQlFVRXNUVUZCUVR0SlFVVmtMRTFCUVd0Q0xFbEJRVWtzUTBGQlF5eExRVUZNTEVOQlFWa3NSMEZCV2l4RFFVRnNRaXhGUVVGRExHTkJRVVFzUlVGQlVUdEpRVVZTTEV0QlFVRXNSMEZCVVN4UlFVRkJMRU5CUVZVc1MwRkJWanRKUVVOU0xFMUJRVUVzUjBGQlV5eFJRVUZCTEVOQlFWVXNUVUZCVmp0QlFVVlVMRmRCUVU4c1EwRkJReXhMUVVGRUxFVkJRVkVzVFVGQlVqdEZRVmhGT3p0elFrRmhWaXhQUVVGQkxFZEJRVk1zVTBGQlJTeEpRVUZHTzBGQlExSXNVVUZCUVR0SlFVRkJMRXRCUVVFc1IwRkJVU3hKUVVGRExFTkJRVUVzVVVGQlJDeERRVUZYTEVsQlFWZzdTVUZEVWl4SlFVRm5RaXhEUVVGSkxFdEJRWEJDTzBGQlFVRXNZVUZCVHl4TlFVRlFPenRCUVVOQkxGZEJRVThzUzBGQlR5eERRVUZCTEV0QlFVRTdSVUZJVGpzN2MwSkJTMVFzV1VGQlFTeEhRVUZqTEZOQlFVVXNSMEZCUmp0SlFVTmlMRWxCUVVjc1NVRkJReXhEUVVGQkxFbEJRVTBzUTBGQlFTeEhRVUZCTEVOQlFWWTdRVUZEUXl4aFFVRlBMRWxCUVVNc1EwRkJRU3hKUVVGTkxFTkJRVUVzUjBGQlFTeEZRVVJtT3p0QlFVVkJMRmRCUVU4N1JVRklUVHM3YzBKQlMyUXNVMEZCUVN4SFFVRmpMRk5CUVVFN1YwRkJSeXhKUVVGRExFTkJRVUVzV1VGQlJDeERRVUZsTEU5QlFXWTdSVUZCU0RzN2MwSkJRMlFzVVVGQlFTeEhRVUZqTEZOQlFVRTdWMEZCUnl4SlFVRkRMRU5CUVVFc1dVRkJSQ3hEUVVGbExFMUJRV1k3UlVGQlNEczdPenM3TzBGQlIyWXNUVUZCVFN4RFFVRkRMRTlCUVZBc1IwRkJhVUlpZlE9PVxuIiwidmFyICQsIEFic3RyYWN0X0xhenlfTG9hZGVyLCBMYXp5X01hc29ucnksIF9fV0lORE9XLFxuICBiaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfSxcbiAgZXh0ZW5kID0gZnVuY3Rpb24oY2hpbGQsIHBhcmVudCkgeyBmb3IgKHZhciBrZXkgaW4gcGFyZW50KSB7IGlmIChoYXNQcm9wLmNhbGwocGFyZW50LCBrZXkpKSBjaGlsZFtrZXldID0gcGFyZW50W2tleV07IH0gZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9IGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTsgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTsgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTsgcmV0dXJuIGNoaWxkOyB9LFxuICBoYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHk7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5BYnN0cmFjdF9MYXp5X0xvYWRlciA9IHJlcXVpcmUoJy4vQWJzdHJhY3RfTGF6eV9Mb2FkZXInKTtcblxuX19XSU5ET1cgPSByZXF1aXJlKCcuLi9nbG9iYWwvV2luZG93Jyk7XG5cbkxhenlfTWFzb25yeSA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gIGV4dGVuZChMYXp5X01hc29ucnksIHN1cGVyQ2xhc3MpO1xuXG4gIGZ1bmN0aW9uIExhenlfTWFzb25yeSgpIHtcbiAgICB0aGlzLmxvYWRfaXRlbXNfaW5fdmlldyA9IGJpbmQodGhpcy5sb2FkX2l0ZW1zX2luX3ZpZXcsIHRoaXMpO1xuICAgIHRoaXMuYXV0b2xvYWQgPSBiaW5kKHRoaXMuYXV0b2xvYWQsIHRoaXMpO1xuICAgIHRoaXMuZGVib3VuY2VkX2xvYWRfaXRlbXNfaW5fdmlldyA9IF8uZGVib3VuY2UodGhpcy5sb2FkX2l0ZW1zX2luX3ZpZXcsIDUwKTtcbiAgICBMYXp5X01hc29ucnkuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmNhbGwodGhpcyk7XG4gIH1cblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbS4kZWwuY3NzKHtcbiAgICAgICdtaW4taGVpZ2h0JzogTWF0aC5mbG9vcih0aGlzLmdldF93aWR0aCgpIC8gaXRlbS5kYXRhLmdldF9yYXRpbygpKVxuICAgIH0pO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUuZ2V0X3dpZHRoID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICQoJy5QUF9NYXNvbnJ5X19zaXplcicpLndpZHRoKCk7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5hdXRvbG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmxvYWRfaXRlbXNfaW5fdmlldygpO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICB2YXIgJGltYWdlLCBmdWxsLCB0aHVtYjtcbiAgICB0aHVtYiA9IGl0ZW0uZGF0YS5nZXRfdXJsKCd0aHVtYicpO1xuICAgIGZ1bGwgPSBpdGVtLmRhdGEuZ2V0X3VybCgnZnVsbCcpO1xuICAgIGl0ZW0uJGVsLnByZXBlbmQoXCI8YSBjbGFzcz1cXFwiXCIgKyB0aGlzLkVsZW1lbnRzLmxpbmsgKyBcIlxcXCIgaHJlZj1cXFwiXCIgKyBmdWxsICsgXCJcXFwiIHJlbD1cXFwiZ2FsbGVyeVxcXCI+XFxuPGltZyBjbGFzcz1cXFwiXCIgKyB0aGlzLkVsZW1lbnRzLmltYWdlICsgXCJcXFwiIHNyYz1cXFwiXCIgKyB0aHVtYiArIFwiXFxcIiBjbGFzcz1cXFwiUFBfSlNfX2xvYWRpbmdcXFwiIC8+XFxuPC9hPlwiKS5yZW1vdmVDbGFzcygnTGF6eS1JbWFnZScpO1xuICAgIGl0ZW0ubG9hZGVkID0gdHJ1ZTtcbiAgICAkaW1hZ2UgPSBpdGVtLiRlbC5maW5kKCdpbWcnKTtcbiAgICByZXR1cm4gJGltYWdlLmltYWdlc0xvYWRlZCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgJGltYWdlLmFkZENsYXNzKCdQUF9KU19fbG9hZGVkJykucmVtb3ZlQ2xhc3MoJ1BQX0pTX19sb2FkaW5nJyk7XG4gICAgICAgIHJldHVybiBpdGVtLiRlbC5jc3MoJ21pbi1oZWlnaHQnLCAnJykucmVtb3ZlQ2xhc3MoX3RoaXMuRWxlbWVudHMuaXRlbSkuZmluZChcIi5cIiArIF90aGlzLkVsZW1lbnRzLnBsYWNlaG9sZGVyKS5mYWRlT3V0KDQwMCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuICQodGhpcykucmVtb3ZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5sb2FkX2l0ZW1zX2luX3ZpZXcgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaSwgaXRlbSwga2V5LCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICByZWYgPSB0aGlzLkl0ZW1zO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGtleSA9IGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBrZXkgPSArK2kpIHtcbiAgICAgIGl0ZW0gPSByZWZba2V5XTtcbiAgICAgIGlmICghaXRlbS5sb2FkZWQgJiYgdGhpcy5pbl9sb29zZV92aWV3KGl0ZW0uZWwpKSB7XG4gICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLmxvYWQoaXRlbSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHZvaWQgMCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUuaW5fbG9vc2VfdmlldyA9IGZ1bmN0aW9uKGVsKSB7XG4gICAgdmFyIHJlY3QsIHNlbnNpdGl2aXR5O1xuICAgIGlmIChlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBzZW5zaXRpdml0eSA9IDEwMDtcbiAgICByZXR1cm4gcmVjdC50b3AgKyByZWN0LmhlaWdodCA+PSAtc2Vuc2l0aXZpdHkgJiYgcmVjdC5ib3R0b20gLSByZWN0LmhlaWdodCA8PSBfX1dJTkRPVy5oZWlnaHQgKyBzZW5zaXRpdml0eSAmJiByZWN0LmxlZnQgKyByZWN0LndpZHRoID49IC1zZW5zaXRpdml0eSAmJiByZWN0LnJpZ2h0IC0gcmVjdC53aWR0aCA8PSBfX1dJTkRPVy53aWR0aCArIHNlbnNpdGl2aXR5O1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUuYXR0YWNoX2V2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICQod2luZG93KS5vbignc2Nyb2xsJywgdGhpcy5kZWJvdW5jZWRfbG9hZF9pdGVtc19pbl92aWV3KTtcbiAgICByZXR1cm4gTGF6eV9NYXNvbnJ5Ll9fc3VwZXJfXy5hdHRhY2hfZXZlbnRzLmNhbGwodGhpcyk7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5kZXRhY2hfZXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgJCh3aW5kb3cpLm9mZignc2Nyb2xsJywgdGhpcy5kZWJvdW5jZWRfbG9hZF9pdGVtc19pbl92aWV3KTtcbiAgICByZXR1cm4gTGF6eV9NYXNvbnJ5Ll9fc3VwZXJfXy5kZXRhY2hfZXZlbnRzLmNhbGwodGhpcyk7XG4gIH07XG5cbiAgcmV0dXJuIExhenlfTWFzb25yeTtcblxufSkoQWJzdHJhY3RfTGF6eV9Mb2FkZXIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExhenlfTWFzb25yeTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVEdGNmVWOU5ZWE52Ym5KNUxtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpVEdGNmVWOU5ZWE52Ym5KNUxtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeEpRVUZCTEN0RFFVRkJPMFZCUVVFN096czdRVUZCUVN4RFFVRkJMRWRCUVVrc1QwRkJRU3hEUVVGVExGRkJRVlE3TzBGQlEwb3NiMEpCUVVFc1IwRkJkVUlzVDBGQlFTeERRVUZUTEhkQ1FVRlVPenRCUVVOMlFpeFJRVUZCTEVkQlFWY3NUMEZCUVN4RFFVRlRMR3RDUVVGVU96dEJRVVZNT3pzN1JVRkZVU3h6UWtGQlFUczdPMGxCUTFvc1NVRkJReXhEUVVGQkxEUkNRVUZFTEVkQlFXZERMRU5CUVVNc1EwRkJReXhSUVVGR0xFTkJRVmtzU1VGQlF5eERRVUZCTEd0Q1FVRmlMRVZCUVdsRExFVkJRV3BETzBsQlEyaERMRFJEUVVGQk8wVkJSbGs3TzNsQ1FVdGlMRTFCUVVFc1IwRkJVU3hUUVVGRkxFbEJRVVk3VjBGRFVDeEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRWRCUVZRc1EwRkJZVHROUVVGQkxGbEJRVUVzUlVGQll5eEpRVUZKTEVOQlFVTXNTMEZCVEN4RFFVRlpMRWxCUVVNc1EwRkJRU3hUUVVGRUxFTkJRVUVzUTBGQlFTeEhRVUZsTEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1UwRkJWaXhEUVVGQkxFTkJRVE5DTEVOQlFXUTdTMEZCWWp0RlFVUlBPenQ1UWtGSlVpeFRRVUZCTEVkQlFWY3NVMEZCUVR0WFFVVldMRU5CUVVFc1EwRkJSeXh2UWtGQlNDeERRVUY1UWl4RFFVRkRMRXRCUVRGQ0xFTkJRVUU3UlVGR1ZUczdlVUpCU1Znc1VVRkJRU3hIUVVGVkxGTkJRVUU3VjBGQlJ5eEpRVUZETEVOQlFVRXNhMEpCUVVRc1EwRkJRVHRGUVVGSU96dDVRa0ZGVml4SlFVRkJMRWRCUVUwc1UwRkJSU3hKUVVGR08wRkJSVXdzVVVGQlFUdEpRVUZCTEV0QlFVRXNSMEZCVVN4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFOUJRVllzUTBGQmJVSXNUMEZCYmtJN1NVRkRVaXhKUVVGQkxFZEJRVThzU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4UFFVRldMRU5CUVcxQ0xFMUJRVzVDTzBsQlJWQXNTVUZCU1N4RFFVRkRMRWRCUTB3c1EwRkJReXhQUVVSRUxFTkJRMVVzWVVGQlFTeEhRVU5KTEVsQlFVTXNRMEZCUVN4UlFVRlJMRU5CUVVNc1NVRkVaQ3hIUVVOdFFpeFpRVVJ1UWl4SFFVTTJRaXhKUVVRM1FpeEhRVU5yUXl4dlEwRkViRU1zUjBGRlRTeEpRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRXRCUm1oQ0xFZEJSWE5DTEZkQlJuUkNMRWRCUlN0Q0xFdEJSaTlDTEVkQlJYRkRMSE5EUVVndlF5eERRVTFCTEVOQlFVTXNWMEZPUkN4RFFVMWpMRmxCVG1RN1NVRlJRU3hKUVVGSkxFTkJRVU1zVFVGQlRDeEhRVUZqTzBsQlEyUXNUVUZCUVN4SFFVRlRMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zU1VGQlZDeERRVUZsTEV0QlFXWTdWMEZEVkN4TlFVRk5MRU5CUVVNc1dVRkJVQ3hEUVVGdlFpeERRVUZCTEZOQlFVRXNTMEZCUVR0aFFVRkJMRk5CUVVFN1VVRkZia0lzVFVGQlRTeERRVUZETEZGQlFWQXNRMEZCYVVJc1pVRkJha0lzUTBGQmEwTXNRMEZCUXl4WFFVRnVReXhEUVVGblJDeG5Ra0ZCYUVRN1pVRkRRU3hKUVVGSkxFTkJRVU1zUjBGRFRDeERRVUZETEVkQlJFUXNRMEZEVFN4WlFVUk9MRVZCUTI5Q0xFVkJSSEJDTEVOQlJVRXNRMEZCUXl4WFFVWkVMRU5CUldNc1MwRkJReXhEUVVGQkxGRkJRVkVzUTBGQlF5eEpRVVo0UWl4RFFVZEJMRU5CUVVNc1NVRklSQ3hEUVVkUExFZEJRVUVzUjBGQlNTeExRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRmRCU0hKQ0xFTkJTVUVzUTBGQlF5eFBRVXBFTEVOQlNWTXNSMEZLVkN4RlFVbGpMRk5CUVVFN2FVSkJRVWNzUTBGQlFTeERRVUZITEVsQlFVZ3NRMEZCVXl4RFFVRkRMRTFCUVZZc1EwRkJRVHRSUVVGSUxFTkJTbVE3VFVGSWJVSTdTVUZCUVN4RFFVRkJMRU5CUVVFc1EwRkJRU3hKUVVGQkxFTkJRWEJDTzBWQlprczdPM2xDUVRSQ1RpeHJRa0ZCUVN4SFFVRnZRaXhUUVVGQk8wRkJRMjVDTEZGQlFVRTdRVUZCUVR0QlFVRkJPMU5CUVVFc2FVUkJRVUU3TzAxQlEwTXNTVUZCUnl4RFFVRkpMRWxCUVVrc1EwRkJReXhOUVVGVUxFbEJRVzlDTEVsQlFVTXNRMEZCUVN4aFFVRkVMRU5CUVdkQ0xFbEJRVWtzUTBGQlF5eEZRVUZ5UWl4RFFVRjJRanR4UWtGRFF5eEpRVUZETEVOQlFVRXNTVUZCUkN4RFFVRlBMRWxCUVZBc1IwRkVSRHRQUVVGQkxFMUJRVUU3TmtKQlFVRTdPMEZCUkVRN08wVkJSRzFDT3p0NVFrRlBjRUlzWVVGQlFTeEhRVUZsTEZOQlFVVXNSVUZCUmp0QlFVTmtMRkZCUVVFN1NVRkJRU3hKUVVGdFFpeG5RMEZCYmtJN1FVRkJRU3hoUVVGUExFdEJRVkE3TzBsQlEwRXNTVUZCUVN4SFFVRlBMRVZCUVVVc1EwRkJReXh4UWtGQlNDeERRVUZCTzBsQlIxQXNWMEZCUVN4SFFVRmpPMEZCUTJRc1YwRkZReXhKUVVGSkxFTkJRVU1zUjBGQlRDeEhRVUZYTEVsQlFVa3NRMEZCUXl4TlFVRm9RaXhKUVVFd1FpeERRVUZETEZkQlFUTkNMRWxCUTBNc1NVRkJTU3hEUVVGRExFMUJRVXdzUjBGQll5eEpRVUZKTEVOQlFVTXNUVUZCYmtJc1NVRkJOa0lzVVVGQlVTeERRVUZETEUxQlFWUXNSMEZCYTBJc1YwRkVhRVFzU1VGSlF5eEpRVUZKTEVOQlFVTXNTVUZCVEN4SFFVRlpMRWxCUVVrc1EwRkJReXhMUVVGcVFpeEpRVUV3UWl4RFFVRkRMRmRCU2pWQ0xFbEJTME1zU1VGQlNTeERRVUZETEV0QlFVd3NSMEZCWVN4SlFVRkpMRU5CUVVNc1MwRkJiRUlzU1VGQk1rSXNVVUZCVVN4RFFVRkRMRXRCUVZRc1IwRkJhVUk3UlVGaWFFTTdPM2xDUVdsQ1ppeGhRVUZCTEVkQlFXVXNVMEZCUVR0SlFVTmtMRU5CUVVFc1EwRkJSeXhOUVVGSUxFTkJRVmNzUTBGQlF5eEZRVUZhTEVOQlFXVXNVVUZCWml4RlFVRjVRaXhKUVVGRExFTkJRVUVzTkVKQlFURkNPMWRCUTBFc09FTkJRVUU3UlVGR1l6czdlVUpCU1dZc1lVRkJRU3hIUVVGbExGTkJRVUU3U1VGRFpDeERRVUZCTEVOQlFVY3NUVUZCU0N4RFFVRlhMRU5CUVVNc1IwRkJXaXhEUVVGblFpeFJRVUZvUWl4RlFVRXdRaXhKUVVGRExFTkJRVUVzTkVKQlFUTkNPMWRCUTBFc09FTkJRVUU3UlVGR1l6czdPenRIUVhwRlZ6czdRVUUyUlROQ0xFMUJRVTBzUTBGQlF5eFBRVUZRTEVkQlFXbENJbjA9XG4iLCJ2YXIgJCwgSG9va3MsIExhenlfTWFzb25yeSwgUG9ydGZvbGlvX01hc29ucnk7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5Qb3J0Zm9saW9fTWFzb25yeSA9IHJlcXVpcmUoJy4vcG9ydGZvbGlvL1BvcnRmb2xpb19NYXNvbnJ5Jyk7XG5cbkxhenlfTWFzb25yeSA9IHJlcXVpcmUoJy4vbGF6eS9MYXp5X01hc29ucnknKTtcblxuSG9va3MuYWRkQWN0aW9uKCdwcC5tYXNvbnJ5LnN0YXJ0L2JlZm9yZScsIGZ1bmN0aW9uKCkge1xuICB2YXIgTGF6eV9IYW5kbGVyO1xuICBMYXp5X0hhbmRsZXIgPSBIb29rcy5hcHBseUZpbHRlcnMoJ3BwLmxhenkuaGFuZGxlcicsIExhenlfTWFzb25yeSk7XG4gIG5ldyBMYXp5X0hhbmRsZXIoKTtcbn0pO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3BwLm1hc29ucnkuc3RhcnQvY29tcGxldGUnLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIEhvb2tzLmRvQWN0aW9uKCdwcC5sYXp5LmF1dG9sb2FkJyk7XG59KTtcblxuSG9va3MuYWRkQWN0aW9uKCdwcC5jb3JlLnJlYWR5JywgZnVuY3Rpb24oKSB7XG4gIGlmICgkKCcuUFBfTWFzb25yeScpLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gbmV3IFBvcnRmb2xpb19NYXNvbnJ5KCQoZG9jdW1lbnQpKTtcbiAgfVxufSk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWJXRnpiMjV5ZVM1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJbTFoYzI5dWNua3VZMjltWm1WbElsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lKQlFVRkJMRWxCUVVFN08wRkJRVUVzUTBGQlFTeEhRVUZKTEU5QlFVRXNRMEZCVXl4UlFVRlVPenRCUVVOS0xFdEJRVUVzUjBGQlVTeFBRVUZCTEVOQlFWTXNWVUZCVkRzN1FVRkRVaXhwUWtGQlFTeEhRVUZ2UWl4UFFVRkJMRU5CUVZNc0swSkJRVlE3TzBGQlEzQkNMRmxCUVVFc1IwRkJaU3hQUVVGQkxFTkJRVk1zY1VKQlFWUTdPMEZCUldZc1MwRkJTeXhEUVVGRExGTkJRVTRzUTBGQlowSXNlVUpCUVdoQ0xFVkJRVEpETEZOQlFVRTdRVUZITVVNc1RVRkJRVHRGUVVGQkxGbEJRVUVzUjBGQlpTeExRVUZMTEVOQlFVTXNXVUZCVGl4RFFVRnRRaXhwUWtGQmJrSXNSVUZCYzBNc1dVRkJkRU03UlVGRFdDeEpRVUZCTEZsQlFVRXNRMEZCUVR0QlFVcHpReXhEUVVFelF6czdRVUZSUVN4TFFVRkxMRU5CUVVNc1UwRkJUaXhEUVVGblFpd3lRa0ZCYUVJc1JVRkJOa01zVTBGQlFUdFRRVU0xUXl4TFFVRkxMRU5CUVVNc1VVRkJUaXhEUVVGbExHdENRVUZtTzBGQlJEUkRMRU5CUVRkRE96dEJRVWxCTEV0QlFVc3NRMEZCUXl4VFFVRk9MRU5CUVdkQ0xHVkJRV2hDTEVWQlFXbERMRk5CUVVFN1JVRkRhRU1zU1VGQlJ5eERRVUZCTEVOQlFVY3NZVUZCU0N4RFFVRnJRaXhEUVVGRExFMUJRVzVDTEVkQlFUUkNMRU5CUVM5Q08xZEJRMHNzU1VGQlFTeHBRa0ZCUVN4RFFVRnRRaXhEUVVGQkxFTkJRVVVzVVVGQlJpeERRVUZ1UWl4RlFVUk1PenRCUVVSblF5eERRVUZxUXlKOVxuIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgJCwgSG9va3MsIFBvcnRmb2xpb19BY3Rpb25zLCBQb3J0Zm9saW9fTWFzb25yeSxcbiAgYmluZCA9IGZ1bmN0aW9uKGZuLCBtZSl7IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7IH07IH0sXG4gIGV4dGVuZCA9IGZ1bmN0aW9uKGNoaWxkLCBwYXJlbnQpIHsgZm9yICh2YXIga2V5IGluIHBhcmVudCkgeyBpZiAoaGFzUHJvcC5jYWxsKHBhcmVudCwga2V5KSkgY2hpbGRba2V5XSA9IHBhcmVudFtrZXldOyB9IGZ1bmN0aW9uIGN0b3IoKSB7IHRoaXMuY29uc3RydWN0b3IgPSBjaGlsZDsgfSBjdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7IGNoaWxkLnByb3RvdHlwZSA9IG5ldyBjdG9yKCk7IGNoaWxkLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7IHJldHVybiBjaGlsZDsgfSxcbiAgaGFzUHJvcCA9IHt9Lmhhc093blByb3BlcnR5O1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuUG9ydGZvbGlvX0FjdGlvbnMgPSByZXF1aXJlKCcuLy4uL2NsYXNzL0Fic3RyYWN0X1BvcnRmb2xpb19BY3Rpb25zJyk7XG5cblBvcnRmb2xpb19NYXNvbnJ5ID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgZXh0ZW5kKFBvcnRmb2xpb19NYXNvbnJ5LCBzdXBlckNsYXNzKTtcblxuICBmdW5jdGlvbiBQb3J0Zm9saW9fTWFzb25yeSgpIHtcbiAgICB0aGlzLnJlZnJlc2ggPSBiaW5kKHRoaXMucmVmcmVzaCwgdGhpcyk7XG4gICAgdGhpcy5kZXN0cm95ID0gYmluZCh0aGlzLmRlc3Ryb3ksIHRoaXMpO1xuICAgIHRoaXMuY3JlYXRlID0gYmluZCh0aGlzLmNyZWF0ZSwgdGhpcyk7XG4gICAgdGhpcy5wcmVwYXJlID0gYmluZCh0aGlzLnByZXBhcmUsIHRoaXMpO1xuICAgIHJldHVybiBQb3J0Zm9saW9fTWFzb25yeS5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5FbGVtZW50cyA9IHtcbiAgICBjb250YWluZXI6ICdQUF9NYXNvbnJ5JyxcbiAgICBzaXplcjogJ1BQX01hc29ucnlfX3NpemVyJyxcbiAgICBpdGVtOiAnUFBfTWFzb25yeV9faXRlbSdcbiAgfTtcblxuXG4gIC8qXG4gIFx0XHRJbml0aWFsaXplXG4gICAqL1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24oJHBhcmVudCkge1xuICAgIHJldHVybiB0aGlzLiRjb250YWluZXIgPSAkcGFyZW50LmZpbmQoXCIuXCIgKyB0aGlzLkVsZW1lbnRzLmNvbnRhaW5lcik7XG4gIH07XG5cblxuICAvKlxuICBcdFx0UHJlcGFyZSAmIEF0dGFjaCBFdmVudHNcbiAgICAgXHREb24ndCBzaG93IGFueXRoaW5nIHlldC5cbiAgICovXG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLnByZXBhcmUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbWFzb25yeV9zZXR0aW5ncztcbiAgICBpZiAodGhpcy4kY29udGFpbmVyLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLiRjb250YWluZXIuYWRkQ2xhc3MoJ1BQX0pTX19sb2FkaW5nX21hc29ucnknKTtcbiAgICB0aGlzLm1heWJlX2NyZWF0ZV9zaXplcigpO1xuICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5tYXNvbnJ5LnN0YXJ0L2JlZm9yZScpO1xuICAgIG1hc29ucnlfc2V0dGluZ3MgPSBIb29rcy5hcHBseUZpbHRlcnMoJ3BwLm1hc29ucnkuc2V0dGluZ3MnLCB7XG4gICAgICBpdGVtU2VsZWN0b3I6IFwiLlwiICsgdGhpcy5FbGVtZW50cy5pdGVtLFxuICAgICAgY29sdW1uV2lkdGg6IFwiLlwiICsgdGhpcy5FbGVtZW50cy5zaXplcixcbiAgICAgIGd1dHRlcjogMCxcbiAgICAgIGluaXRMYXlvdXQ6IGZhbHNlXG4gICAgfSk7XG4gICAgdGhpcy4kY29udGFpbmVyLm1hc29ucnkobWFzb25yeV9zZXR0aW5ncyk7XG4gICAgcmV0dXJuIHRoaXMuJGNvbnRhaW5lci5tYXNvbnJ5KCdvbicsICdsYXlvdXRDb21wbGV0ZScsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBIb29rcy5kb0FjdGlvbigncHAubWFzb25yeS5zdGFydC9jb21wbGV0ZScpO1xuICAgICAgICByZXR1cm4gX3RoaXMuJGNvbnRhaW5lci5yZW1vdmVDbGFzcygnUFBfSlNfX2xvYWRpbmdfbWFzb25yeScpLmFkZENsYXNzKCdQUF9KU19fbG9hZGluZ19jb21wbGV0ZScpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH07XG5cblxuICAvKlxuICBcdFx0U3RhcnQgdGhlIFBvcnRmb2xpb1xuICAgKi9cblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kY29udGFpbmVyLm1hc29ucnkoKTtcbiAgICBIb29rcy5kb0FjdGlvbigncHAubWFzb25yeS5zdGFydC9sYXlvdXQnKTtcbiAgfTtcblxuXG4gIC8qXG4gIFx0XHREZXN0cm95XG4gICAqL1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5tYXliZV9yZW1vdmVfc2l6ZXIoKTtcbiAgICBpZiAodGhpcy4kY29udGFpbmVyLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuJGNvbnRhaW5lci5tYXNvbnJ5KCdkZXN0cm95Jyk7XG4gICAgfVxuICB9O1xuXG5cbiAgLypcbiAgXHRcdFJlbG9hZCB0aGUgbGF5b3V0XG4gICAqL1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuJGNvbnRhaW5lci5tYXNvbnJ5KCdsYXlvdXQnKTtcbiAgfTtcblxuXG4gIC8qXG4gIFxuICBcdFx0Q3JlYXRlIGEgc2l6ZXIgZWxlbWVudCBmb3IganF1ZXJ5LW1hc29ucnkgdG8gdXNlXG4gICAqL1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5tYXliZV9jcmVhdGVfc2l6ZXIgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5zaXplcl9kb2VzbnRfZXhpc3QoKSkge1xuICAgICAgdGhpcy5jcmVhdGVfc2l6ZXIoKTtcbiAgICB9XG4gIH07XG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLm1heWJlX3JlbW92ZV9zaXplciA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLiRjb250YWluZXIubGVuZ3RoICE9PSAxKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuJGNvbnRhaW5lci5maW5kKFwiLlwiICsgdGhpcy5FbGVtZW50cy5zaXplcikucmVtb3ZlKCk7XG4gIH07XG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLnNpemVyX2RvZXNudF9leGlzdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLiRjb250YWluZXIuZmluZChcIi5cIiArIHRoaXMuRWxlbWVudHMuc2l6ZXIpLmxlbmd0aCA9PT0gMDtcbiAgfTtcblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUuY3JlYXRlX3NpemVyID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kY29udGFpbmVyLmFwcGVuZChcIjxkaXYgY2xhc3M9XFxcIlwiICsgdGhpcy5FbGVtZW50cy5zaXplciArIFwiXFxcIj48L2Rpdj5cIik7XG4gIH07XG5cbiAgcmV0dXJuIFBvcnRmb2xpb19NYXNvbnJ5O1xuXG59KShQb3J0Zm9saW9fQWN0aW9ucyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUG9ydGZvbGlvX01hc29ucnk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVVHOXlkR1p2YkdsdlgwMWhjMjl1Y25rdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUpRYjNKMFptOXNhVzlmVFdGemIyNXllUzVqYjJabVpXVWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqdEJRVUZCT3pzN1FVRkJRU3hKUVVGQkxEaERRVUZCTzBWQlFVRTdPenM3UVVGSFFTeERRVUZCTEVkQlFVa3NUMEZCUVN4RFFVRlRMRkZCUVZRN08wRkJRMG9zUzBGQlFTeEhRVUZSTEU5QlFVRXNRMEZCVXl4VlFVRlVPenRCUVVOU0xHbENRVUZCTEVkQlFXOUNMRTlCUVVFc1EwRkJVeXgxUTBGQlZEczdRVUZIWkRzN096czdPenM3T3pzN09FSkJSVXdzVVVGQlFTeEhRVU5ETzBsQlFVRXNVMEZCUVN4RlFVRlhMRmxCUVZnN1NVRkRRU3hMUVVGQkxFVkJRVmNzYlVKQlJGZzdTVUZGUVN4SlFVRkJMRVZCUVZjc2EwSkJSbGc3T3pzN1FVRkpSRHM3T3pzNFFrRkhRU3hWUVVGQkxFZEJRVmtzVTBGQlJTeFBRVUZHTzFkQlExZ3NTVUZCUXl4RFFVRkJMRlZCUVVRc1IwRkJZeXhQUVVGUExFTkJRVU1zU1VGQlVpeERRVUZqTEVkQlFVRXNSMEZCU1N4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExGTkJRVFZDTzBWQlJFZzdPenRCUVVkYU96czdPenM0UWtGSlFTeFBRVUZCTEVkQlFWTXNVMEZCUVR0QlFVTlNMRkZCUVVFN1NVRkJRU3hKUVVGVkxFbEJRVU1zUTBGQlFTeFZRVUZWTEVOQlFVTXNUVUZCV2l4TFFVRnpRaXhEUVVGb1F6dEJRVUZCTEdGQlFVRTdPMGxCUlVFc1NVRkJReXhEUVVGQkxGVkJRVlVzUTBGQlF5eFJRVUZhTEVOQlFYTkNMSGRDUVVGMFFqdEpRVVZCTEVsQlFVTXNRMEZCUVN4clFrRkJSQ3hEUVVGQk8wbEJRMEVzUzBGQlN5eERRVUZETEZGQlFVNHNRMEZCWlN4NVFrRkJaanRKUVVsQkxHZENRVUZCTEVkQlFXMUNMRXRCUVVzc1EwRkJReXhaUVVGT0xFTkJRVzFDTEhGQ1FVRnVRaXhGUVVOc1FqdE5RVUZCTEZsQlFVRXNSVUZCWXl4SFFVRkJMRWRCUVVrc1NVRkJReXhEUVVGQkxGRkJRVkVzUTBGQlF5eEpRVUUxUWp0TlFVTkJMRmRCUVVFc1JVRkJZeXhIUVVGQkxFZEJRVWtzU1VGQlF5eERRVUZCTEZGQlFWRXNRMEZCUXl4TFFVUTFRanROUVVWQkxFMUJRVUVzUlVGQll5eERRVVprTzAxQlIwRXNWVUZCUVN4RlFVRmpMRXRCU0dRN1MwRkVhMEk3U1VGTmJrSXNTVUZCUXl4RFFVRkJMRlZCUVZVc1EwRkJReXhQUVVGYUxFTkJRWEZDTEdkQ1FVRnlRanRYUVVWQkxFbEJRVU1zUTBGQlFTeFZRVUZWTEVOQlFVTXNUMEZCV2l4RFFVRnZRaXhKUVVGd1FpeEZRVUV3UWl4blFrRkJNVUlzUlVGQk5FTXNRMEZCUVN4VFFVRkJMRXRCUVVFN1lVRkJRU3hUUVVGQk8xRkJRek5ETEV0QlFVc3NRMEZCUXl4UlFVRk9MRU5CUVdVc01rSkJRV1k3WlVGRFFTeExRVUZETEVOQlFVRXNWVUZEUkN4RFFVRkRMRmRCUkVRc1EwRkRZeXgzUWtGRVpDeERRVVZCTEVOQlFVTXNVVUZHUkN4RFFVVlhMSGxDUVVaWU8wMUJSakpETzBsQlFVRXNRMEZCUVN4RFFVRkJMRU5CUVVFc1NVRkJRU3hEUVVFMVF6dEZRV3hDVVRzN08wRkJlVUpVT3pzN096aENRVWRCTEUxQlFVRXNSMEZCVVN4VFFVRkJPMGxCUTFBc1NVRkJReXhEUVVGQkxGVkJRVlVzUTBGQlF5eFBRVUZhTEVOQlFVRTdTVUZEUVN4TFFVRkxMRU5CUVVNc1VVRkJUaXhEUVVGbExIbENRVUZtTzBWQlJrODdPenRCUVU5U096czdPemhDUVVkQkxFOUJRVUVzUjBGQlV5eFRRVUZCTzBsQlExSXNTVUZCUXl4RFFVRkJMR3RDUVVGRUxFTkJRVUU3U1VGRlFTeEpRVUZITEVsQlFVTXNRMEZCUVN4VlFVRlZMRU5CUVVNc1RVRkJXaXhIUVVGeFFpeERRVUY0UWp0TlFVTkRMRWxCUVVNc1EwRkJRU3hWUVVGVkxFTkJRVU1zVDBGQldpeERRVUZ4UWl4VFFVRnlRaXhGUVVSRU96dEZRVWhST3pzN1FVRlZWRHM3T3pzNFFrRkhRU3hQUVVGQkxFZEJRVk1zVTBGQlFUdFhRVU5TTEVsQlFVTXNRMEZCUVN4VlFVRlZMRU5CUVVNc1QwRkJXaXhEUVVGeFFpeFJRVUZ5UWp0RlFVUlJPenM3UVVGTFZEczdPenM3T0VKQlMwRXNhMEpCUVVFc1IwRkJiMElzVTBGQlFUdEpRVU51UWl4SlFVRnRRaXhKUVVGRExFTkJRVUVzYTBKQlFVUXNRMEZCUVN4RFFVRnVRanROUVVGQkxFbEJRVU1zUTBGQlFTeFpRVUZFTEVOQlFVRXNSVUZCUVRzN1JVRkViVUk3T3poQ1FVbHdRaXhyUWtGQlFTeEhRVUZ2UWl4VFFVRkJPMGxCUTI1Q0xFbEJRVlVzU1VGQlF5eERRVUZCTEZWQlFWVXNRMEZCUXl4TlFVRmFMRXRCUVhkQ0xFTkJRV3hETzBGQlFVRXNZVUZCUVRzN1NVRkRRU3hKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEVsQlFWb3NRMEZCYTBJc1IwRkJRU3hIUVVGSkxFbEJRVU1zUTBGQlFTeFJRVUZSTEVOQlFVTXNTMEZCYUVNc1EwRkJlVU1zUTBGQlF5eE5RVUV4UXl4RFFVRkJPMFZCUm0xQ096czRRa0ZMY0VJc2EwSkJRVUVzUjBGQmIwSXNVMEZCUVR0WFFVRkhMRWxCUVVNc1EwRkJRU3hWUVVGVkxFTkJRVU1zU1VGQldpeERRVUZyUWl4SFFVRkJMRWRCUVVrc1NVRkJReXhEUVVGQkxGRkJRVkVzUTBGQlF5eExRVUZvUXl4RFFVRjVReXhEUVVGRExFMUJRVEZETEV0QlFXOUVPMFZCUVhaRU96czRRa0ZIY0VJc1dVRkJRU3hIUVVGakxGTkJRVUU3U1VGRFlpeEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRTFCUVZvc1EwRkJiVUlzWlVGQlFTeEhRVUZwUWl4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExFdEJRVE5DTEVkQlFXbERMRmRCUVhCRU8wVkJSR0U3T3pzN1IwRXhSbWxDT3p0QlFXZEhhRU1zVFVGQlRTeERRVUZETEU5QlFWQXNSMEZCYVVJaWZRPT1cbiIsIlxuLypcbiAgICBEZXBlbmRlbmNpZXNcbiAqL1xudmFyICQsIEhvb2tzLCBJdGVtX0RhdGEsIGdldF9kYXRhO1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuSXRlbV9EYXRhID0gcmVxdWlyZSgnLi4vbGF6eS9JdGVtX0RhdGEnKTtcblxuZ2V0X2RhdGEgPSBmdW5jdGlvbihlbCkge1xuICB2YXIgJGNvbnRhaW5lciwgJGVsLCAkaXRlbXMsIGl0ZW1zO1xuICAkZWwgPSAkKGVsKTtcbiAgJGNvbnRhaW5lciA9ICRlbC5jbG9zZXN0KCcuUFBfR2FsbGVyeScpO1xuICAkaXRlbXMgPSAkY29udGFpbmVyLmZpbmQoJy5QUF9HYWxsZXJ5X19pdGVtJyk7XG4gIGl0ZW1zID0gJGl0ZW1zLm1hcChmdW5jdGlvbihrZXksIGl0ZW0pIHtcbiAgICB2YXIgaTtcbiAgICBpID0gbmV3IEl0ZW1fRGF0YSgkKGl0ZW0pKTtcbiAgICByZXR1cm4ge1xuICAgICAgc3JjOiBpLmdldF91cmwoJ2Z1bGwnKSxcbiAgICAgIHRodW1iOiBpLmdldF91cmwoJ3RodW1iJylcbiAgICB9O1xuICB9KTtcbiAgcmV0dXJuIGl0ZW1zO1xufTtcblxuSG9va3MuYWRkQWN0aW9uKCdwcC5jb3JlLnJlYWR5JywgZnVuY3Rpb24oKSB7XG4gIHJldHVybiAkKCcuUFBfR2FsbGVyeV9faXRlbScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgJGVsO1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkZWwgPSAkKHRoaXMpO1xuICAgIHJldHVybiAkZWwubGlnaHRHYWxsZXJ5KHtcbiAgICAgIGR5bmFtaWM6IHRydWUsXG4gICAgICBkeW5hbWljRWw6IGdldF9kYXRhKHRoaXMpLFxuICAgICAgaW5kZXg6ICQoJy5QUF9HYWxsZXJ5X19pdGVtJykuaW5kZXgoJGVsKSxcbiAgICAgIHNwZWVkOiAzNTAsXG4gICAgICBwcmVsb2FkOiAzLFxuICAgICAgZG93bmxvYWQ6IGZhbHNlXG4gICAgfSk7XG4gIH0pO1xufSk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWNHOXdkWEF1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SndiM0IxY0M1amIyWm1aV1VpWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanRCUVVGQk96czdRVUZCUVN4SlFVRkJPenRCUVVkQkxFTkJRVUVzUjBGQlNTeFBRVUZCTEVOQlFWTXNVVUZCVkRzN1FVRkRTaXhMUVVGQkxFZEJRVkVzVDBGQlFTeERRVUZUTEZWQlFWUTdPMEZCUTFJc1UwRkJRU3hIUVVGWkxFOUJRVUVzUTBGQlV5eHRRa0ZCVkRzN1FVRkZXaXhSUVVGQkxFZEJRVmNzVTBGQlJTeEZRVUZHTzBGQlExWXNUVUZCUVR0RlFVRkJMRWRCUVVFc1IwRkJUU3hEUVVGQkxFTkJRVWNzUlVGQlNEdEZRVU5PTEZWQlFVRXNSMEZCWVN4SFFVRkhMRU5CUVVNc1QwRkJTaXhEUVVGaExHRkJRV0k3UlVGRllpeE5RVUZCTEVkQlFWTXNWVUZCVlN4RFFVRkRMRWxCUVZnc1EwRkJhVUlzYlVKQlFXcENPMFZCUlZRc1MwRkJRU3hIUVVGUkxFMUJRVTBzUTBGQlF5eEhRVUZRTEVOQlFWY3NVMEZCUlN4SFFVRkdMRVZCUVU4c1NVRkJVRHRCUVVOc1FpeFJRVUZCTzBsQlFVRXNRMEZCUVN4SFFVRlJMRWxCUVVFc1UwRkJRU3hEUVVGWExFTkJRVUVzUTBGQlJ5eEpRVUZJTEVOQlFWZzdRVUZGVWl4WFFVRlBPMDFCUTA0c1IwRkJRU3hGUVVGUExFTkJRVU1zUTBGQlF5eFBRVUZHTEVOQlFWY3NUVUZCV0N4RFFVUkVPMDFCUlU0c1MwRkJRU3hGUVVGUExFTkJRVU1zUTBGQlF5eFBRVUZHTEVOQlFWY3NUMEZCV0N4RFFVWkVPenRGUVVoWExFTkJRVmc3UVVGVFVpeFRRVUZQTzBGQlprYzdPMEZCYTBKWUxFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMR1ZCUVdoQ0xFVkJRV2xETEZOQlFVRTdVMEZGYUVNc1EwRkJRU3hEUVVGSExHMUNRVUZJTEVOQlFYZENMRU5CUVVNc1JVRkJla0lzUTBGQk5FSXNUMEZCTlVJc1JVRkJjVU1zVTBGQlJTeERRVUZHTzBGQlEzQkRMRkZCUVVFN1NVRkJRU3hEUVVGRExFTkJRVU1zWTBGQlJpeERRVUZCTzBsQlIwRXNSMEZCUVN4SFFVRk5MRU5CUVVFc1EwRkJSeXhKUVVGSU8xZEJSMDRzUjBGQlJ5eERRVUZETEZsQlFVb3NRMEZEUXp0TlFVRkJMRTlCUVVFc1JVRkJWeXhKUVVGWU8wMUJRMEVzVTBGQlFTeEZRVUZYTEZGQlFVRXNRMEZCVlN4SlFVRldMRU5CUkZnN1RVRkZRU3hMUVVGQkxFVkJRVmNzUTBGQlFTeERRVUZITEcxQ1FVRklMRU5CUVhkQ0xFTkJRVU1zUzBGQmVrSXNRMEZCSzBJc1IwRkJMMElzUTBGR1dEdE5RVWRCTEV0QlFVRXNSVUZCVnl4SFFVaFlPMDFCU1VFc1QwRkJRU3hGUVVGWExFTkJTbGc3VFVGTFFTeFJRVUZCTEVWQlFWY3NTMEZNV0R0TFFVUkVPMFZCVUc5RExFTkJRWEpETzBGQlJtZERMRU5CUVdwREluMD1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
