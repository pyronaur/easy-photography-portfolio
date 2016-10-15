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

},{"./class/Core":2,"./class/Portfolio":3,"./masonry":9,"./portfolio/popup":11}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
(function (global){
var Hooks, Portfolio_Actions;

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);


/*
	Abstract Class Portoflio_Event_Imeplementation

    Handles all the events required to fully handle a portfolio layout process
 */

Portfolio_Actions = (function() {
  function Portfolio_Actions(args) {
    this.setup_actions();
    this.initialize(args);
  }

  Portfolio_Actions.prototype.setup_actions = function() {
    Hooks.addAction('pp.portfolio.prepare', this.prepare, 50);
    Hooks.addAction('pp.portfolio.create', this.create, 50);
    Hooks.addAction('pp.portfolio.refresh', this.refresh, 50);
    Hooks.addAction('pp.portfolio.destroy', this.destroy, 50);
    return Hooks.addAction('pp.portfolio.destroy', this.purge_actions, 50);
  };

  Portfolio_Actions.prototype.purge_actions = function() {
    Hooks.removeAction('pp.portfolio.create', this.prepare, 50);
    Hooks.removeAction('pp.portfolio.create', this.create, 50);
    Hooks.removeAction('pp.portfolio.refresh', this.refresh, 50);
    Hooks.removeAction('pp.portfolio.destroy', this.destroy, 50);
    return Hooks.removeAction('pp.portfolio.destroy', this.purge_actions, 50);
  };


  /*
     	Require these methods
   */

  Portfolio_Actions.prototype.initialize = function() {
    throw new Error("[Abstract] Any subclass of `Portfolio_Actions` must implement `initialize` method");
  };

  Portfolio_Actions.prototype.prepare = function() {
    throw new Error("[Abstract] Any subclass of `Portfolio_Actions` must implement `prepare` method");
  };

  Portfolio_Actions.prototype.create = function() {
    throw new Error("[Abstract] Any subclass of `Portfolio_Actions` must implement `create` method");
  };

  Portfolio_Actions.prototype.refresh = function() {
    throw new Error("[Abstract] Any subclass of `Portfolio_Actions` must implement `refresh` method");
  };

  Portfolio_Actions.prototype.destroy = function() {
    throw new Error("[Abstract] Any subclass of `Portfolio_Actions` must implement `destroy` method");
  };

  return Portfolio_Actions;

})();

module.exports = Portfolio_Actions;


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

})(Lazy_Loader);

module.exports = Lazy_Masonry;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../global/Window":5,"./Lazy_Loader":7}],9:[function(require,module,exports){
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

Portfolio_Actions = require('./../class/Portfolio_Actions');

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
    return this.$container.maosnry('layout');
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

},{"./../class/Portfolio_Actions":4}],11:[function(require,module,exports){
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

},{"../lazy/Item_Data":6}]},{},[1])


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jbGFzcy9Db3JlLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jbGFzcy9Qb3J0Zm9saW8uY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2NsYXNzL1BvcnRmb2xpb19BY3Rpb25zLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9nbG9iYWwvV2luZG93LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0l0ZW1fRGF0YS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvbGF6eS9MYXp5X0xvYWRlci5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvbGF6eS9MYXp5X01hc29ucnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL21hc29ucnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL3BvcnRmb2xpby9Qb3J0Zm9saW9fTWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL3BvcHVwLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgQ29yZSwgSG9va3MsIFBvcnRmb2xpbztcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuQ29yZSA9IHJlcXVpcmUoJy4vY2xhc3MvQ29yZScpO1xuXG5Qb3J0Zm9saW8gPSByZXF1aXJlKCcuL2NsYXNzL1BvcnRmb2xpbycpO1xuXG5uZXcgQ29yZSgpO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3BwLmNvcmUucmVhZHknLCAoZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgUG9ydGZvbGlvKCk7XG59KSwgNTApO1xuXG5yZXF1aXJlKCcuL21hc29ucnknKTtcblxucmVxdWlyZSgnLi9wb3J0Zm9saW8vcG9wdXAnKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pWVhCd0xtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpWVhCd0xtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pTzBGQlFVRTdPenRCUVVGQkxFbEJRVUU3TzBGQlIwRXNTMEZCUVN4SFFVRlJMRTlCUVVFc1EwRkJVeXhWUVVGVU96dEJRVU5TTEVsQlFVRXNSMEZCVHl4UFFVRkJMRU5CUVZNc1kwRkJWRHM3UVVGRFVDeFRRVUZCTEVkQlFWa3NUMEZCUVN4RFFVRlRMRzFDUVVGVU96dEJRVWxTTEVsQlFVRXNTVUZCUVN4RFFVRkJPenRCUVVkS0xFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMR1ZCUVdoQ0xFVkJRV2xETEVOQlFVVXNVMEZCUVR0VFFVRlBMRWxCUVVFc1UwRkJRU3hEUVVGQk8wRkJRVkFzUTBGQlJpeERRVUZxUXl4RlFVRjVSQ3hGUVVGNlJEczdRVUZIUVN4UFFVRkJMRU5CUVZFc1YwRkJVanM3UVVGSFFTeFBRVUZCTEVOQlFWRXNiVUpCUVZJaWZRPT1cbiIsIlxuLypcbiAgICBEZXBlbmRlbmNpZXNcbiAqL1xudmFyICQsIENvcmUsIEhvb2tzO1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuQ29yZSA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gQ29yZSgpIHtcbiAgICB0aGlzLiRkb2MgPSAkKGRvY3VtZW50KTtcbiAgICB0aGlzLmF0dGFjaF9ldmVudHMoKTtcbiAgfVxuXG4gIENvcmUucHJvdG90eXBlLmF0dGFjaF9ldmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRkb2Mub24oJ3JlYWR5JywgdGhpcy5yZWFkeSk7XG4gICAgdGhpcy4kZG9jLmZpbmQoJy5QUF9XcmFwcGVyJykuaW1hZ2VzTG9hZGVkKHRoaXMubG9hZGVkKTtcbiAgfTtcblxuICBDb3JlLnByb3RvdHlwZS5yZWFkeSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChIb29rcy5hcHBseUZpbHRlcnMoJ3BwLmNvcmUucmVhZHknLCB0cnVlKSkge1xuICAgICAgSG9va3MuZG9BY3Rpb24oJ3BwLmNvcmUucmVhZHknKTtcbiAgICB9XG4gIH07XG5cbiAgQ29yZS5wcm90b3R5cGUubG9hZGVkID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKEhvb2tzLmFwcGx5RmlsdGVycygncHAubG9hZGVkJywgdHJ1ZSkpIHtcbiAgICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5jb3JlLmxvYWRlZCcpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gQ29yZTtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb3JlO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lRMjl5WlM1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJa052Y21VdVkyOW1abVZsSWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUk3UVVGQlFUczdPMEZCUVVFc1NVRkJRVHM3UVVGSFFTeERRVUZCTEVkQlFVa3NUMEZCUVN4RFFVRlRMRkZCUVZRN08wRkJRMG9zUzBGQlFTeEhRVUZSTEU5QlFVRXNRMEZCVXl4VlFVRlVPenRCUVVkR08wVkJSVkVzWTBGQlFUdEpRVU5hTEVsQlFVTXNRMEZCUVN4SlFVRkVMRWRCUVZFc1EwRkJRU3hEUVVGSExGRkJRVWc3U1VGRFVpeEpRVUZETEVOQlFVRXNZVUZCUkN4RFFVRkJPMFZCUmxrN08ybENRVTFpTEdGQlFVRXNSMEZCWlN4VFFVRkJPMGxCUTJRc1NVRkJReXhEUVVGQkxFbEJRVWtzUTBGQlF5eEZRVUZPTEVOQlFWTXNUMEZCVkN4RlFVRnJRaXhKUVVGRExFTkJRVUVzUzBGQmJrSTdTVUZEUVN4SlFVRkRMRU5CUVVFc1NVRkJTU3hEUVVGRExFbEJRVTRzUTBGQldTeGhRVUZhTEVOQlFUSkNMRU5CUVVNc1dVRkJOVUlzUTBGQk1FTXNTVUZCUXl4RFFVRkJMRTFCUVRORE8wVkJSbU03TzJsQ1FWRm1MRXRCUVVFc1IwRkJUeXhUUVVGQk8wbEJRMDRzU1VGQlJ5eExRVUZMTEVOQlFVTXNXVUZCVGl4RFFVRnZRaXhsUVVGd1FpeEZRVUZ4UXl4SlFVRnlReXhEUVVGSU8wMUJRME1zUzBGQlN5eERRVUZETEZGQlFVNHNRMEZCWlN4bFFVRm1MRVZCUkVRN08wVkJSRTA3TzJsQ1FVOVFMRTFCUVVFc1IwRkJVU3hUUVVGQk8wbEJRMUFzU1VGQlJ5eExRVUZMTEVOQlFVTXNXVUZCVGl4RFFVRnZRaXhYUVVGd1FpeEZRVUZwUXl4SlFVRnFReXhEUVVGSU8wMUJRME1zUzBGQlN5eERRVUZETEZGQlFVNHNRMEZCWlN4blFrRkJaaXhGUVVSRU96dEZRVVJQT3pzN096czdRVUZQVkN4TlFVRk5MRU5CUVVNc1QwRkJVQ3hIUVVGcFFpSjlcbiIsInZhciBIb29rcywgUG9ydGZvbGlvO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5cbi8qXG5cbiAgICAgKiBJbml0aWFsaXplIFBvcnRmb2xpbyBDb3JlXG5cdC0tLVxuXHRcdFVzaW5nIHA1MCBAIHBwLmxvYWRlZFxuXHRcdExhdGUgcHJpb3JpdHkgaXMgZ29pbmcgdG8gZm9yY2UgZXhwbGljaXQgcHJpb3JpdHkgaW4gYW55IG90aGVyIG1vdmluZyBwYXJ0cyB0aGF0IGFyZSBnb2luZyB0byB0b3VjaCBwb3J0Zm9saW8gbGF5b3V0IGF0IGBwcC5sb2FkZWRgXG5cdC0tLVxuICovXG5cblBvcnRmb2xpbyA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gUG9ydGZvbGlvKCkge1xuICAgIEhvb2tzLmFkZEFjdGlvbigncHAuY29yZS5sb2FkZWQnLCB0aGlzLmNyZWF0ZSwgNTApO1xuICAgIHRoaXMucHJlcGFyZSgpO1xuICB9XG5cbiAgUG9ydGZvbGlvLnByb3RvdHlwZS5wcmVwYXJlID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MuZG9BY3Rpb24oJ3BwLnBvcnRmb2xpby5wcmVwYXJlJyk7XG4gIH07XG5cbiAgUG9ydGZvbGlvLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBIb29rcy5kb0FjdGlvbigncHAucG9ydGZvbGlvLmNyZWF0ZScpO1xuICB9O1xuXG4gIFBvcnRmb2xpby5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5wb3J0Zm9saW8ucmVmcmVzaCcpO1xuICB9O1xuXG4gIFBvcnRmb2xpby5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5wb3J0Zm9saW8uZGVzdHJveScpO1xuICAgIEhvb2tzLnJlbW92ZUFjdGlvbigncHAubG9hZGVkJywgdGhpcy5jcmVhdGUsIDUwKTtcbiAgfTtcblxuICByZXR1cm4gUG9ydGZvbGlvO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBvcnRmb2xpbztcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVUc5eWRHWnZiR2x2TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lVRzl5ZEdadmJHbHZMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRU3hKUVVGQk96dEJRVUZCTEV0QlFVRXNSMEZCVVN4UFFVRkJMRU5CUVZNc1ZVRkJWRHM3TzBGQlJWSTdPenM3T3pzN096dEJRVk5OTzBWQlJWRXNiVUpCUVVFN1NVRkRXaXhMUVVGTExFTkJRVU1zVTBGQlRpeERRVUZuUWl4blFrRkJhRUlzUlVGQmEwTXNTVUZCUXl4RFFVRkJMRTFCUVc1RExFVkJRVEpETEVWQlFUTkRPMGxCUTBFc1NVRkJReXhEUVVGQkxFOUJRVVFzUTBGQlFUdEZRVVpaT3p0elFrRkpZaXhQUVVGQkxFZEJRVk1zVTBGQlFUdEpRVU5TTEV0QlFVc3NRMEZCUXl4UlFVRk9MRU5CUVdVc2MwSkJRV1k3UlVGRVVUczdjMEpCU1ZRc1RVRkJRU3hIUVVGUkxGTkJRVUU3U1VGRFVDeExRVUZMTEVOQlFVTXNVVUZCVGl4RFFVRmxMSEZDUVVGbU8wVkJSRTg3TzNOQ1FVdFNMRTlCUVVFc1IwRkJVeXhUUVVGQk8wbEJRMUlzUzBGQlN5eERRVUZETEZGQlFVNHNRMEZCWlN4elFrRkJaanRGUVVSUk96dHpRa0ZMVkN4UFFVRkJMRWRCUVZNc1UwRkJRVHRKUVVWU0xFdEJRVXNzUTBGQlF5eFJRVUZPTEVOQlFXVXNjMEpCUVdZN1NVRkRRU3hMUVVGTExFTkJRVU1zV1VGQlRpeERRVUZ0UWl4WFFVRnVRaXhGUVVGblF5eEpRVUZETEVOQlFVRXNUVUZCYWtNc1JVRkJlVU1zUlVGQmVrTTdSVUZJVVRzN096czdPMEZCVDFZc1RVRkJUU3hEUVVGRExFOUJRVkFzUjBGQmFVSWlmUT09XG4iLCJ2YXIgSG9va3MsIFBvcnRmb2xpb19BY3Rpb25zO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5cbi8qXG5cdEFic3RyYWN0IENsYXNzIFBvcnRvZmxpb19FdmVudF9JbWVwbGVtZW50YXRpb25cblxuICAgIEhhbmRsZXMgYWxsIHRoZSBldmVudHMgcmVxdWlyZWQgdG8gZnVsbHkgaGFuZGxlIGEgcG9ydGZvbGlvIGxheW91dCBwcm9jZXNzXG4gKi9cblxuUG9ydGZvbGlvX0FjdGlvbnMgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIFBvcnRmb2xpb19BY3Rpb25zKGFyZ3MpIHtcbiAgICB0aGlzLnNldHVwX2FjdGlvbnMoKTtcbiAgICB0aGlzLmluaXRpYWxpemUoYXJncyk7XG4gIH1cblxuICBQb3J0Zm9saW9fQWN0aW9ucy5wcm90b3R5cGUuc2V0dXBfYWN0aW9ucyA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLmFkZEFjdGlvbigncHAucG9ydGZvbGlvLnByZXBhcmUnLCB0aGlzLnByZXBhcmUsIDUwKTtcbiAgICBIb29rcy5hZGRBY3Rpb24oJ3BwLnBvcnRmb2xpby5jcmVhdGUnLCB0aGlzLmNyZWF0ZSwgNTApO1xuICAgIEhvb2tzLmFkZEFjdGlvbigncHAucG9ydGZvbGlvLnJlZnJlc2gnLCB0aGlzLnJlZnJlc2gsIDUwKTtcbiAgICBIb29rcy5hZGRBY3Rpb24oJ3BwLnBvcnRmb2xpby5kZXN0cm95JywgdGhpcy5kZXN0cm95LCA1MCk7XG4gICAgcmV0dXJuIEhvb2tzLmFkZEFjdGlvbigncHAucG9ydGZvbGlvLmRlc3Ryb3knLCB0aGlzLnB1cmdlX2FjdGlvbnMsIDUwKTtcbiAgfTtcblxuICBQb3J0Zm9saW9fQWN0aW9ucy5wcm90b3R5cGUucHVyZ2VfYWN0aW9ucyA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLnJlbW92ZUFjdGlvbigncHAucG9ydGZvbGlvLmNyZWF0ZScsIHRoaXMucHJlcGFyZSwgNTApO1xuICAgIEhvb2tzLnJlbW92ZUFjdGlvbigncHAucG9ydGZvbGlvLmNyZWF0ZScsIHRoaXMuY3JlYXRlLCA1MCk7XG4gICAgSG9va3MucmVtb3ZlQWN0aW9uKCdwcC5wb3J0Zm9saW8ucmVmcmVzaCcsIHRoaXMucmVmcmVzaCwgNTApO1xuICAgIEhvb2tzLnJlbW92ZUFjdGlvbigncHAucG9ydGZvbGlvLmRlc3Ryb3knLCB0aGlzLmRlc3Ryb3ksIDUwKTtcbiAgICByZXR1cm4gSG9va3MucmVtb3ZlQWN0aW9uKCdwcC5wb3J0Zm9saW8uZGVzdHJveScsIHRoaXMucHVyZ2VfYWN0aW9ucywgNTApO1xuICB9O1xuXG5cbiAgLypcbiAgICAgXHRSZXF1aXJlIHRoZXNlIG1ldGhvZHNcbiAgICovXG5cbiAgUG9ydGZvbGlvX0FjdGlvbnMucHJvdG90eXBlLmluaXRpYWxpemUgPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0FjdGlvbnNgIG11c3QgaW1wbGVtZW50IGBpbml0aWFsaXplYCBtZXRob2RcIik7XG4gIH07XG5cbiAgUG9ydGZvbGlvX0FjdGlvbnMucHJvdG90eXBlLnByZXBhcmUgPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0FjdGlvbnNgIG11c3QgaW1wbGVtZW50IGBwcmVwYXJlYCBtZXRob2RcIik7XG4gIH07XG5cbiAgUG9ydGZvbGlvX0FjdGlvbnMucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fQWN0aW9uc2AgbXVzdCBpbXBsZW1lbnQgYGNyZWF0ZWAgbWV0aG9kXCIpO1xuICB9O1xuXG4gIFBvcnRmb2xpb19BY3Rpb25zLnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19BY3Rpb25zYCBtdXN0IGltcGxlbWVudCBgcmVmcmVzaGAgbWV0aG9kXCIpO1xuICB9O1xuXG4gIFBvcnRmb2xpb19BY3Rpb25zLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19BY3Rpb25zYCBtdXN0IGltcGxlbWVudCBgZGVzdHJveWAgbWV0aG9kXCIpO1xuICB9O1xuXG4gIHJldHVybiBQb3J0Zm9saW9fQWN0aW9ucztcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW9fQWN0aW9ucztcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVUc5eWRHWnZiR2x2WDBGamRHbHZibk11YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SlFiM0owWm05c2FXOWZRV04wYVc5dWN5NWpiMlptWldVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWtGQlFVRXNTVUZCUVRzN1FVRkJRU3hMUVVGQkxFZEJRVkVzVDBGQlFTeERRVUZUTEZWQlFWUTdPenRCUVVkU096czdPenM3UVVGTFRUdEZRVVZSTERKQ1FVRkZMRWxCUVVZN1NVRkRXaXhKUVVGRExFTkJRVUVzWVVGQlJDeERRVUZCTzBsQlEwRXNTVUZCUXl4RFFVRkJMRlZCUVVRc1EwRkJZU3hKUVVGaU8wVkJSbGs3T3poQ1FVbGlMR0ZCUVVFc1IwRkJaU3hUUVVGQk8wbEJRMlFzUzBGQlN5eERRVUZETEZOQlFVNHNRMEZCWjBJc2MwSkJRV2hDTEVWQlFYZERMRWxCUVVNc1EwRkJRU3hQUVVGNlF5eEZRVUZyUkN4RlFVRnNSRHRKUVVOQkxFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMSEZDUVVGb1FpeEZRVUYxUXl4SlFVRkRMRU5CUVVFc1RVRkJlRU1zUlVGQlowUXNSVUZCYUVRN1NVRkRRU3hMUVVGTExFTkJRVU1zVTBGQlRpeERRVUZuUWl4elFrRkJhRUlzUlVGQmQwTXNTVUZCUXl4RFFVRkJMRTlCUVhwRExFVkJRV3RFTEVWQlFXeEVPMGxCUTBFc1MwRkJTeXhEUVVGRExGTkJRVTRzUTBGQlowSXNjMEpCUVdoQ0xFVkJRWGRETEVsQlFVTXNRMEZCUVN4UFFVRjZReXhGUVVGclJDeEZRVUZzUkR0WFFVTkJMRXRCUVVzc1EwRkJReXhUUVVGT0xFTkJRV2RDTEhOQ1FVRm9RaXhGUVVGM1F5eEpRVUZETEVOQlFVRXNZVUZCZWtNc1JVRkJkMFFzUlVGQmVFUTdSVUZNWXpzN09FSkJUMllzWVVGQlFTeEhRVUZsTEZOQlFVRTdTVUZEWkN4TFFVRkxMRU5CUVVNc1dVRkJUaXhEUVVGdFFpeHhRa0ZCYmtJc1JVRkJNRU1zU1VGQlF5eERRVUZCTEU5QlFUTkRMRVZCUVc5RUxFVkJRWEJFTzBsQlEwRXNTMEZCU3l4RFFVRkRMRmxCUVU0c1EwRkJiVUlzY1VKQlFXNUNMRVZCUVRCRExFbEJRVU1zUTBGQlFTeE5RVUV6UXl4RlFVRnRSQ3hGUVVGdVJEdEpRVU5CTEV0QlFVc3NRMEZCUXl4WlFVRk9MRU5CUVcxQ0xITkNRVUZ1UWl4RlFVRXlReXhKUVVGRExFTkJRVUVzVDBGQk5VTXNSVUZCY1VRc1JVRkJja1E3U1VGRFFTeExRVUZMTEVOQlFVTXNXVUZCVGl4RFFVRnRRaXh6UWtGQmJrSXNSVUZCTWtNc1NVRkJReXhEUVVGQkxFOUJRVFZETEVWQlFYRkVMRVZCUVhKRU8xZEJRMEVzUzBGQlN5eERRVUZETEZsQlFVNHNRMEZCYlVJc2MwSkJRVzVDTEVWQlFUSkRMRWxCUVVNc1EwRkJRU3hoUVVFMVF5eEZRVUV5UkN4RlFVRXpSRHRGUVV4ak96czdRVUZSWmpzN096czRRa0ZIUVN4VlFVRkJMRWRCUVZrc1UwRkJRVHRCUVVGSExGVkJRVlVzU1VGQlFTeExRVUZCTEVOQlFVOHNiVVpCUVZBN1JVRkJZanM3T0VKQlExb3NUMEZCUVN4SFFVRlpMRk5CUVVFN1FVRkJSeXhWUVVGVkxFbEJRVUVzUzBGQlFTeERRVUZQTEdkR1FVRlFPMFZCUVdJN096aENRVU5hTEUxQlFVRXNSMEZCV1N4VFFVRkJPMEZCUVVjc1ZVRkJWU3hKUVVGQkxFdEJRVUVzUTBGQlR5d3JSVUZCVUR0RlFVRmlPenM0UWtGRFdpeFBRVUZCTEVkQlFWa3NVMEZCUVR0QlFVRkhMRlZCUVZVc1NVRkJRU3hMUVVGQkxFTkJRVThzWjBaQlFWQTdSVUZCWWpzN09FSkJRMW9zVDBGQlFTeEhRVUZaTEZOQlFVRTdRVUZCUnl4VlFVRlZMRWxCUVVFc1MwRkJRU3hEUVVGUExHZEdRVUZRTzBWQlFXSTdPenM3T3p0QlFVVmlMRTFCUVUwc1EwRkJReXhQUVVGUUxFZEJRV2xDSW4wPVxuIiwidmFyIEhvb2tzLCBnZXRfc2l6ZTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuZ2V0X3NpemUgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICB3aWR0aDogd2luZG93LmlubmVyV2lkdGggfHwgJHdpbmRvdy53aWR0aCgpLFxuICAgIGhlaWdodDogd2luZG93LmlubmVySGVpZ2h0IHx8ICR3aW5kb3cuaGVpZ2h0KClcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0X3NpemUoKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVjJsdVpHOTNMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaVYybHVaRzkzTG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4SlFVRkJPenRCUVVGQkxFdEJRVUVzUjBGQlVTeFBRVUZCTEVOQlFWTXNWVUZCVkRzN1FVRkhVaXhSUVVGQkxFZEJRVmNzVTBGQlFUdFRRVU5XTzBsQlFVRXNTMEZCUVN4RlFVRlJMRTFCUVUwc1EwRkJReXhWUVVGUUxFbEJRWEZDTEU5QlFVOHNRMEZCUXl4TFFVRlNMRU5CUVVFc1EwRkJOMEk3U1VGRFFTeE5RVUZCTEVWQlFWRXNUVUZCVFN4RFFVRkRMRmRCUVZBc1NVRkJjMElzVDBGQlR5eERRVUZETEUxQlFWSXNRMEZCUVN4RFFVUTVRanM3UVVGRVZUczdRVUZMV0N4TlFVRk5MRU5CUVVNc1QwRkJVQ3hIUVVGcFFpeFJRVUZCTEVOQlFVRWlmUT09XG4iLCJ2YXIgSXRlbV9EYXRhO1xuXG5JdGVtX0RhdGEgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIEl0ZW1fRGF0YSgkZWwpIHtcbiAgICB2YXIgZGF0YTtcbiAgICB0aGlzLiRlbCA9ICRlbDtcbiAgICBkYXRhID0gJGVsLmRhdGEoJ2l0ZW0nKTtcbiAgICBpZiAoIWRhdGEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkVsZW1lbnQgZG9lc24ndCBjb250YWluIGBkYXRhLWl0ZW1gIGF0dHJpYnV0ZVwiKTtcbiAgICB9XG4gICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgfVxuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X2RhdGEgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGltYWdlO1xuICAgIGltYWdlID0gdGhpcy5kYXRhWydpbWFnZXMnXVtuYW1lXTtcbiAgICBpZiAoIWltYWdlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBpbWFnZTtcbiAgfTtcblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF9zaXplID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBoZWlnaHQsIGltYWdlLCByZWYsIHNpemUsIHdpZHRoO1xuICAgIGltYWdlID0gdGhpcy5nZXRfZGF0YShuYW1lKTtcbiAgICBpZiAoIWltYWdlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHNpemUgPSBpbWFnZVsnc2l6ZSddO1xuICAgIHJlZiA9IHNpemUuc3BsaXQoJ3gnKSwgd2lkdGggPSByZWZbMF0sIGhlaWdodCA9IHJlZlsxXTtcbiAgICB3aWR0aCA9IHBhcnNlSW50KHdpZHRoKTtcbiAgICBoZWlnaHQgPSBwYXJzZUludChoZWlnaHQpO1xuICAgIHJldHVybiBbd2lkdGgsIGhlaWdodF07XG4gIH07XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfdXJsID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBpbWFnZTtcbiAgICBpbWFnZSA9IHRoaXMuZ2V0X2RhdGEobmFtZSk7XG4gICAgaWYgKCFpbWFnZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gaW1hZ2VbJ3VybCddO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X29yX2ZhbHNlID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKHRoaXMuZGF0YVtrZXldKSB7XG4gICAgICByZXR1cm4gdGhpcy5kYXRhW2tleV07XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF9yYXRpbyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldF9vcl9mYWxzZSgncmF0aW8nKTtcbiAgfTtcblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF90eXBlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0X29yX2ZhbHNlKCd0eXBlJyk7XG4gIH07XG5cbiAgcmV0dXJuIEl0ZW1fRGF0YTtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBJdGVtX0RhdGE7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVNYUmxiVjlFWVhSaExtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpU1hSbGJWOUVZWFJoTG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4SlFVRkJPenRCUVVGTk8wVkJSVkVzYlVKQlFVVXNSMEZCUmp0QlFVTmFMRkZCUVVFN1NVRkJRU3hKUVVGRExFTkJRVUVzUjBGQlJDeEhRVUZQTzBsQlExQXNTVUZCUVN4SFFVRlBMRWRCUVVjc1EwRkJReXhKUVVGS0xFTkJRVlVzVFVGQlZqdEpRVVZRTEVsQlFVY3NRMEZCU1N4SlFVRlFPMEZCUTBNc1dVRkJWU3hKUVVGQkxFdEJRVUVzUTBGQlRTd3JRMEZCVGl4RlFVUllPenRKUVVkQkxFbEJRVU1zUTBGQlFTeEpRVUZFTEVkQlFWRTdSVUZRU1RzN2MwSkJWMklzVVVGQlFTeEhRVUZWTEZOQlFVVXNTVUZCUmp0QlFVTlVMRkZCUVVFN1NVRkJRU3hMUVVGQkxFZEJRVkVzU1VGQlF5eERRVUZCTEVsQlFVMHNRMEZCUVN4UlFVRkJMRU5CUVZrc1EwRkJRU3hKUVVGQk8wbEJRek5DTEVsQlFXZENMRU5CUVVrc1MwRkJjRUk3UVVGQlFTeGhRVUZQTEUxQlFWQTdPMEZCUlVFc1YwRkJUenRGUVVwRk96dHpRa0ZOVml4UlFVRkJMRWRCUVZVc1UwRkJSU3hKUVVGR08wRkJRMVFzVVVGQlFUdEpRVUZCTEV0QlFVRXNSMEZCVVN4SlFVRkRMRU5CUVVFc1VVRkJSQ3hEUVVGWExFbEJRVmc3U1VGRFVpeEpRVUZuUWl4RFFVRkpMRXRCUVhCQ08wRkJRVUVzWVVGQlR5eE5RVUZRT3p0SlFVVkJMRWxCUVVFc1IwRkJUeXhMUVVGUExFTkJRVUVzVFVGQlFUdEpRVVZrTEUxQlFXdENMRWxCUVVrc1EwRkJReXhMUVVGTUxFTkJRVmtzUjBGQldpeERRVUZzUWl4RlFVRkRMR05CUVVRc1JVRkJVVHRKUVVWU0xFdEJRVUVzUjBGQlVTeFJRVUZCTEVOQlFWVXNTMEZCVmp0SlFVTlNMRTFCUVVFc1IwRkJVeXhSUVVGQkxFTkJRVlVzVFVGQlZqdEJRVVZVTEZkQlFVOHNRMEZCUXl4TFFVRkVMRVZCUVZFc1RVRkJVanRGUVZoRk96dHpRa0ZoVml4UFFVRkJMRWRCUVZNc1UwRkJSU3hKUVVGR08wRkJRMUlzVVVGQlFUdEpRVUZCTEV0QlFVRXNSMEZCVVN4SlFVRkRMRU5CUVVFc1VVRkJSQ3hEUVVGWExFbEJRVmc3U1VGRFVpeEpRVUZuUWl4RFFVRkpMRXRCUVhCQ08wRkJRVUVzWVVGQlR5eE5RVUZRT3p0QlFVTkJMRmRCUVU4c1MwRkJUeXhEUVVGQkxFdEJRVUU3UlVGSVRqczdjMEpCUzFRc1dVRkJRU3hIUVVGakxGTkJRVVVzUjBGQlJqdEpRVU5pTEVsQlFVY3NTVUZCUXl4RFFVRkJMRWxCUVUwc1EwRkJRU3hIUVVGQkxFTkJRVlk3UVVGRFF5eGhRVUZQTEVsQlFVTXNRMEZCUVN4SlFVRk5MRU5CUVVFc1IwRkJRU3hGUVVSbU96dEJRVVZCTEZkQlFVODdSVUZJVFRzN2MwSkJTMlFzVTBGQlFTeEhRVUZqTEZOQlFVRTdWMEZCUnl4SlFVRkRMRU5CUVVFc1dVRkJSQ3hEUVVGbExFOUJRV1k3UlVGQlNEczdjMEpCUTJRc1VVRkJRU3hIUVVGakxGTkJRVUU3VjBGQlJ5eEpRVUZETEVOQlFVRXNXVUZCUkN4RFFVRmxMRTFCUVdZN1JVRkJTRHM3T3pzN08wRkJSMllzVFVGQlRTeERRVUZETEU5QlFWQXNSMEZCYVVJaWZRPT1cbiIsIlxuLypcbiAgICBEZXBlbmRlbmNpZXNcbiAqL1xudmFyICQsIEhvb2tzLCBJdGVtX0RhdGEsIExhenlfTG9hZGVyO1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuSXRlbV9EYXRhID0gcmVxdWlyZSgnLi9JdGVtX0RhdGEnKTtcblxuTGF6eV9Mb2FkZXIgPSAoZnVuY3Rpb24oKSB7XG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5FbGVtZW50cyA9IHtcbiAgICBpdGVtOiAnUFBfTGF6eV9JbWFnZScsXG4gICAgcGxhY2Vob2xkZXI6ICdQUF9MYXp5X0ltYWdlX19wbGFjZWhvbGRlcicsXG4gICAgbGluazogJ1BQX0pTX0xhenlfX2xpbmsnLFxuICAgIGltYWdlOiAnUFBfSlNfTGF6eV9faW1hZ2UnXG4gIH07XG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLkl0ZW1zID0gW107XG5cbiAgZnVuY3Rpb24gTGF6eV9Mb2FkZXIoKSB7XG4gICAgdGhpcy5zZXR1cF9kYXRhKCk7XG4gICAgdGhpcy5yZXNpemVfYWxsKCk7XG4gICAgdGhpcy5hdHRhY2hfZXZlbnRzKCk7XG4gIH1cblxuXG4gIC8qXG4gIFx0XHRBYnN0cmFjdCBNZXRob2RzXG4gICAqL1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgTGF6eV9Mb2FkZXJgIG11c3QgaW1wbGVtZW50IGByZXNpemVgIG1ldGhvZFwiKTtcbiAgfTtcblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBMYXp5X0xvYWRlcmAgbXVzdCBpbXBsZW1lbnQgYGxvYWRgIG1ldGhvZFwiKTtcbiAgfTtcblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUuYXV0b2xvYWQgPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgTGF6eV9Mb2FkZXJgIG11c3QgaW1wbGVtZW50IGBhdXRvbG9hZGAgbWV0aG9kXCIpO1xuICB9O1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5zZXR1cF9kYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyICRpdGVtcztcbiAgICAkaXRlbXMgPSAkKFwiLlwiICsgdGhpcy5FbGVtZW50cy5pdGVtKTtcbiAgICAkaXRlbXMuZWFjaCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihrZXksIGVsKSB7XG4gICAgICAgIHZhciAkZWw7XG4gICAgICAgICRlbCA9ICQoZWwpO1xuICAgICAgICByZXR1cm4gX3RoaXMuSXRlbXMucHVzaCh7XG4gICAgICAgICAgZWw6IGVsLFxuICAgICAgICAgICRlbDogJGVsLFxuICAgICAgICAgIGRhdGE6IG5ldyBJdGVtX0RhdGEoJGVsKSxcbiAgICAgICAgICBsb2FkZWQ6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH07XG5cblxuICAvKlxuICBcdFx0TWV0aG9kc1xuICAgKi9cblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUucmVzaXplX2FsbCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpLCBpdGVtLCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICByZWYgPSB0aGlzLkl0ZW1zO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGl0ZW0gPSByZWZbaV07XG4gICAgICByZXN1bHRzLnB1c2godGhpcy5yZXNpemUoaXRlbSkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUubG9hZF9hbGwgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaSwgaXRlbSwgbGVuLCByZWYsIHJlc3VsdHM7XG4gICAgcmVmID0gdGhpcy5JdGVtcztcbiAgICByZXN1bHRzID0gW107XG4gICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpdGVtID0gcmVmW2ldO1xuICAgICAgdGhpcy5sb2FkKGl0ZW0pO1xuICAgICAgcmVzdWx0cy5wdXNoKHRoaXMucmVtb3ZlX3BsYWNlaG9sZGVyKGl0ZW0pKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLnJlbW92ZV9wbGFjZWhvbGRlciA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbS4kZWwuZmluZChcIi5cIiArIHRoaXMuRWxlbWVudHMucGxhY2Vob2xkZXIgKyBcIiwgbm9zY3JpcHRcIikucmVtb3ZlKCk7XG4gIH07XG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kZXRhY2hfZXZlbnRzKCk7XG4gIH07XG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLmF0dGFjaF9ldmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gSG9va3MuYWRkQWN0aW9uKCdwcC5sYXp5LmF1dG9sb2FkJywgdGhpcy5hdXRvbG9hZCk7XG4gIH07XG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLmRldGFjaF9ldmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gSG9va3MucmVtb3ZlQWN0aW9uKCdwcC5sYXp5LmF1dG9sb2FkJywgdGhpcy5hdXRvbG9hZCk7XG4gIH07XG5cbiAgcmV0dXJuIExhenlfTG9hZGVyO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExhenlfTG9hZGVyO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lUR0Y2ZVY5TWIyRmtaWEl1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5Sk1ZWHA1WDB4dllXUmxjaTVqYjJabVpXVWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqdEJRVUZCT3pzN1FVRkJRU3hKUVVGQk96dEJRVWRCTEVOQlFVRXNSMEZCU1N4UFFVRkJMRU5CUVZNc1VVRkJWRHM3UVVGRFNpeExRVUZCTEVkQlFWRXNUMEZCUVN4RFFVRlRMRlZCUVZRN08wRkJRMUlzVTBGQlFTeEhRVUZaTEU5QlFVRXNRMEZCVXl4aFFVRlVPenRCUVVWT08zZENRVVZNTEZGQlFVRXNSMEZEUXp0SlFVRkJMRWxCUVVFc1JVRkJZU3hsUVVGaU8wbEJRMEVzVjBGQlFTeEZRVUZoTERSQ1FVUmlPMGxCUlVFc1NVRkJRU3hGUVVGUExHdENRVVpRTzBsQlIwRXNTMEZCUVN4RlFVRlBMRzFDUVVoUU96czdkMEpCUzBRc1MwRkJRU3hIUVVGUE96dEZRVWROTEhGQ1FVRkJPMGxCUTFvc1NVRkJReXhEUVVGQkxGVkJRVVFzUTBGQlFUdEpRVU5CTEVsQlFVTXNRMEZCUVN4VlFVRkVMRU5CUVVFN1NVRkRRU3hKUVVGRExFTkJRVUVzWVVGQlJDeERRVUZCTzBWQlNGazdPenRCUVUxaU96czdPM2RDUVVkQkxFMUJRVUVzUjBGQlZTeFRRVUZCTzBGQlFVY3NWVUZCVlN4SlFVRkJMRXRCUVVFc1EwRkJUeXg1UlVGQlVEdEZRVUZpT3p0M1FrRkRWaXhKUVVGQkxFZEJRVlVzVTBGQlFUdEJRVUZITEZWQlFWVXNTVUZCUVN4TFFVRkJMRU5CUVU4c2RVVkJRVkE3UlVGQllqczdkMEpCUTFZc1VVRkJRU3hIUVVGVkxGTkJRVUU3UVVGQlJ5eFZRVUZWTEVsQlFVRXNTMEZCUVN4RFFVRlBMREpGUVVGUU8wVkJRV0k3TzNkQ1FVZFdMRlZCUVVFc1IwRkJXU3hUUVVGQk8wRkJRMWdzVVVGQlFUdEpRVUZCTEUxQlFVRXNSMEZCVXl4RFFVRkJMRU5CUVVjc1IwRkJRU3hIUVVGSkxFbEJRVU1zUTBGQlFTeFJRVUZSTEVOQlFVTXNTVUZCYWtJN1NVRkZWQ3hOUVVGTkxFTkJRVU1zU1VGQlVDeERRVUZaTEVOQlFVRXNVMEZCUVN4TFFVRkJPMkZCUVVFc1UwRkJSU3hIUVVGR0xFVkJRVThzUlVGQlVEdEJRVVZZTEZsQlFVRTdVVUZCUVN4SFFVRkJMRWRCUVUwc1EwRkJRU3hEUVVGSExFVkJRVWc3WlVGRFRpeExRVUZETEVOQlFVRXNTMEZCU3l4RFFVRkRMRWxCUVZBc1EwRkRRenRWUVVGQkxFVkJRVUVzUlVGQlVTeEZRVUZTTzFWQlEwRXNSMEZCUVN4RlFVRlJMRWRCUkZJN1ZVRkZRU3hKUVVGQkxFVkJRVmtzU1VGQlFTeFRRVUZCTEVOQlFWY3NSMEZCV0N4RFFVWmFPMVZCUjBFc1RVRkJRU3hGUVVGUkxFdEJTRkk3VTBGRVJEdE5RVWhYTzBsQlFVRXNRMEZCUVN4RFFVRkJMRU5CUVVFc1NVRkJRU3hEUVVGYU8wVkJTRmM3T3p0QlFXVmFPenM3TzNkQ1FVZEJMRlZCUVVFc1IwRkJXU3hUUVVGQk8wRkJRMWdzVVVGQlFUdEJRVUZCTzBGQlFVRTdVMEZCUVN4eFEwRkJRVHM3YlVKQlFVRXNTVUZCUXl4RFFVRkJMRTFCUVVRc1EwRkJVeXhKUVVGVU8wRkJRVUU3TzBWQlJGYzdPM2RDUVVkYUxGRkJRVUVzUjBGQlZTeFRRVUZCTzBGQlExUXNVVUZCUVR0QlFVRkJPMEZCUVVFN1UwRkJRU3h4UTBGQlFUczdUVUZEUXl4SlFVRkRMRU5CUVVFc1NVRkJSQ3hEUVVGUExFbEJRVkE3YlVKQlEwRXNTVUZCUXl4RFFVRkJMR3RDUVVGRUxFTkJRWEZDTEVsQlFYSkNPMEZCUmtRN08wVkJSRk03TzNkQ1FVdFdMR3RDUVVGQkxFZEJRVzlDTEZOQlFVVXNTVUZCUmp0WFFVTnVRaXhKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEVsQlFWUXNRMEZCWlN4SFFVRkJMRWRCUVVrc1NVRkJReXhEUVVGQkxGRkJRVkVzUTBGQlF5eFhRVUZrTEVkQlFUQkNMRmxCUVhwRExFTkJRWE5FTEVOQlFVTXNUVUZCZGtRc1EwRkJRVHRGUVVSdFFqczdkMEpCU1hCQ0xFOUJRVUVzUjBGQlV5eFRRVUZCTzFkQlExSXNTVUZCUXl4RFFVRkJMR0ZCUVVRc1EwRkJRVHRGUVVSUk96dDNRa0ZIVkN4aFFVRkJMRWRCUVdVc1UwRkJRVHRYUVVOa0xFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMR3RDUVVGb1FpeEZRVUZ2UXl4SlFVRkRMRU5CUVVFc1VVRkJja003UlVGRVl6czdkMEpCUjJZc1lVRkJRU3hIUVVGbExGTkJRVUU3VjBGRFpDeExRVUZMTEVOQlFVTXNXVUZCVGl4RFFVRnRRaXhyUWtGQmJrSXNSVUZCZFVNc1NVRkJReXhEUVVGQkxGRkJRWGhETzBWQlJHTTdPenM3T3p0QlFVZG9RaXhOUVVGTkxFTkJRVU1zVDBGQlVDeEhRVUZwUWlKOVxuIiwidmFyICQsIExhenlfTG9hZGVyLCBMYXp5X01hc29ucnksIF9fV0lORE9XLFxuICBiaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfSxcbiAgZXh0ZW5kID0gZnVuY3Rpb24oY2hpbGQsIHBhcmVudCkgeyBmb3IgKHZhciBrZXkgaW4gcGFyZW50KSB7IGlmIChoYXNQcm9wLmNhbGwocGFyZW50LCBrZXkpKSBjaGlsZFtrZXldID0gcGFyZW50W2tleV07IH0gZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9IGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTsgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTsgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTsgcmV0dXJuIGNoaWxkOyB9LFxuICBoYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHk7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5MYXp5X0xvYWRlciA9IHJlcXVpcmUoJy4vTGF6eV9Mb2FkZXInKTtcblxuX19XSU5ET1cgPSByZXF1aXJlKCcuLi9nbG9iYWwvV2luZG93Jyk7XG5cbkxhenlfTWFzb25yeSA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gIGV4dGVuZChMYXp5X01hc29ucnksIHN1cGVyQ2xhc3MpO1xuXG4gIGZ1bmN0aW9uIExhenlfTWFzb25yeSgpIHtcbiAgICB0aGlzLmxvYWRfaXRlbXNfaW5fdmlldyA9IGJpbmQodGhpcy5sb2FkX2l0ZW1zX2luX3ZpZXcsIHRoaXMpO1xuICAgIHRoaXMuYXV0b2xvYWQgPSBiaW5kKHRoaXMuYXV0b2xvYWQsIHRoaXMpO1xuICAgIHRoaXMuZGVib3VuY2VkX2xvYWRfaXRlbXNfaW5fdmlldyA9IF8uZGVib3VuY2UodGhpcy5sb2FkX2l0ZW1zX2luX3ZpZXcsIDUwKTtcbiAgICBMYXp5X01hc29ucnkuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmNhbGwodGhpcyk7XG4gIH1cblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbS4kZWwuY3NzKHtcbiAgICAgICdtaW4taGVpZ2h0JzogTWF0aC5mbG9vcih0aGlzLmdldF93aWR0aCgpIC8gaXRlbS5kYXRhLmdldF9yYXRpbygpKVxuICAgIH0pO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUuZ2V0X3dpZHRoID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICQoJy5QUF9NYXNvbnJ5X19zaXplcicpLndpZHRoKCk7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5hdXRvbG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmxvYWRfaXRlbXNfaW5fdmlldygpO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICB2YXIgJGltYWdlLCBmdWxsLCB0aHVtYjtcbiAgICB0aHVtYiA9IGl0ZW0uZGF0YS5nZXRfdXJsKCd0aHVtYicpO1xuICAgIGZ1bGwgPSBpdGVtLmRhdGEuZ2V0X3VybCgnZnVsbCcpO1xuICAgIGl0ZW0uJGVsLnByZXBlbmQoXCI8YSBjbGFzcz1cXFwiXCIgKyB0aGlzLkVsZW1lbnRzLmxpbmsgKyBcIlxcXCIgaHJlZj1cXFwiXCIgKyBmdWxsICsgXCJcXFwiIHJlbD1cXFwiZ2FsbGVyeVxcXCI+XFxuPGltZyBjbGFzcz1cXFwiXCIgKyB0aGlzLkVsZW1lbnRzLmltYWdlICsgXCJcXFwiIHNyYz1cXFwiXCIgKyB0aHVtYiArIFwiXFxcIiBjbGFzcz1cXFwiUFBfSlNfX2xvYWRpbmdcXFwiIC8+XFxuPC9hPlwiKS5yZW1vdmVDbGFzcygnTGF6eS1JbWFnZScpO1xuICAgIGl0ZW0ubG9hZGVkID0gdHJ1ZTtcbiAgICAkaW1hZ2UgPSBpdGVtLiRlbC5maW5kKCdpbWcnKTtcbiAgICByZXR1cm4gJGltYWdlLmltYWdlc0xvYWRlZCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgJGltYWdlLmFkZENsYXNzKCdQUF9KU19fbG9hZGVkJykucmVtb3ZlQ2xhc3MoJ1BQX0pTX19sb2FkaW5nJyk7XG4gICAgICAgIHJldHVybiBpdGVtLiRlbC5jc3MoJ21pbi1oZWlnaHQnLCAnJykucmVtb3ZlQ2xhc3MoX3RoaXMuRWxlbWVudHMuaXRlbSkuZmluZChcIi5cIiArIF90aGlzLkVsZW1lbnRzLnBsYWNlaG9sZGVyKS5mYWRlT3V0KDQwMCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuICQodGhpcykucmVtb3ZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5sb2FkX2l0ZW1zX2luX3ZpZXcgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaSwgaXRlbSwga2V5LCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICByZWYgPSB0aGlzLkl0ZW1zO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGtleSA9IGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBrZXkgPSArK2kpIHtcbiAgICAgIGl0ZW0gPSByZWZba2V5XTtcbiAgICAgIGlmICghaXRlbS5sb2FkZWQgJiYgdGhpcy5pbl9sb29zZV92aWV3KGl0ZW0uZWwpKSB7XG4gICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLmxvYWQoaXRlbSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHZvaWQgMCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUuaW5fbG9vc2VfdmlldyA9IGZ1bmN0aW9uKGVsKSB7XG4gICAgdmFyIHJlY3QsIHNlbnNpdGl2aXR5O1xuICAgIGlmIChlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBzZW5zaXRpdml0eSA9IDEwMDtcbiAgICByZXR1cm4gcmVjdC50b3AgKyByZWN0LmhlaWdodCA+PSAtc2Vuc2l0aXZpdHkgJiYgcmVjdC5ib3R0b20gLSByZWN0LmhlaWdodCA8PSBfX1dJTkRPVy5oZWlnaHQgKyBzZW5zaXRpdml0eSAmJiByZWN0LmxlZnQgKyByZWN0LndpZHRoID49IC1zZW5zaXRpdml0eSAmJiByZWN0LnJpZ2h0IC0gcmVjdC53aWR0aCA8PSBfX1dJTkRPVy53aWR0aCArIHNlbnNpdGl2aXR5O1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUuYXR0YWNoX2V2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICQod2luZG93KS5vbignc2Nyb2xsJywgdGhpcy5kZWJvdW5jZWRfbG9hZF9pdGVtc19pbl92aWV3KTtcbiAgICByZXR1cm4gTGF6eV9NYXNvbnJ5Ll9fc3VwZXJfXy5hdHRhY2hfZXZlbnRzLmNhbGwodGhpcyk7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5kZXRhY2hfZXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgJCh3aW5kb3cpLm9mZignc2Nyb2xsJywgdGhpcy5kZWJvdW5jZWRfbG9hZF9pdGVtc19pbl92aWV3KTtcbiAgICByZXR1cm4gTGF6eV9NYXNvbnJ5Ll9fc3VwZXJfXy5kZXRhY2hfZXZlbnRzLmNhbGwodGhpcyk7XG4gIH07XG5cbiAgcmV0dXJuIExhenlfTWFzb25yeTtcblxufSkoTGF6eV9Mb2FkZXIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExhenlfTWFzb25yeTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVEdGNmVWOU5ZWE52Ym5KNUxtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpVEdGNmVWOU5ZWE52Ym5KNUxtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeEpRVUZCTEhORFFVRkJPMFZCUVVFN096czdRVUZCUVN4RFFVRkJMRWRCUVVrc1QwRkJRU3hEUVVGVExGRkJRVlE3TzBGQlEwb3NWMEZCUVN4SFFVRmpMRTlCUVVFc1EwRkJVeXhsUVVGVU96dEJRVU5rTEZGQlFVRXNSMEZCVnl4UFFVRkJMRU5CUVZNc2EwSkJRVlE3TzBGQlJVdzdPenRGUVVWUkxITkNRVUZCT3pzN1NVRkRXaXhKUVVGRExFTkJRVUVzTkVKQlFVUXNSMEZCWjBNc1EwRkJReXhEUVVGRExGRkJRVVlzUTBGQldTeEpRVUZETEVOQlFVRXNhMEpCUVdJc1JVRkJhVU1zUlVGQmFrTTdTVUZEYUVNc05FTkJRVUU3UlVGR1dUczdlVUpCUzJJc1RVRkJRU3hIUVVGUkxGTkJRVVVzU1VGQlJqdFhRVU5RTEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1IwRkJWQ3hEUVVGaE8wMUJRVUVzV1VGQlFTeEZRVUZqTEVsQlFVa3NRMEZCUXl4TFFVRk1MRU5CUVZrc1NVRkJReXhEUVVGQkxGTkJRVVFzUTBGQlFTeERRVUZCTEVkQlFXVXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhUUVVGV0xFTkJRVUVzUTBGQk0wSXNRMEZCWkR0TFFVRmlPMFZCUkU4N08zbENRVWxTTEZOQlFVRXNSMEZCVnl4VFFVRkJPMWRCUlZZc1EwRkJRU3hEUVVGSExHOUNRVUZJTEVOQlFYbENMRU5CUVVNc1MwRkJNVUlzUTBGQlFUdEZRVVpWT3p0NVFrRkpXQ3hSUVVGQkxFZEJRVlVzVTBGQlFUdFhRVUZITEVsQlFVTXNRMEZCUVN4clFrRkJSQ3hEUVVGQk8wVkJRVWc3TzNsQ1FVVldMRWxCUVVFc1IwRkJUU3hUUVVGRkxFbEJRVVk3UVVGRlRDeFJRVUZCTzBsQlFVRXNTMEZCUVN4SFFVRlJMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zVDBGQlZpeERRVUZ0UWl4UFFVRnVRanRKUVVOU0xFbEJRVUVzUjBGQlR5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVZZc1EwRkJiVUlzVFVGQmJrSTdTVUZGVUN4SlFVRkpMRU5CUVVNc1IwRkRUQ3hEUVVGRExFOUJSRVFzUTBGRFZTeGhRVUZCTEVkQlEwa3NTVUZCUXl4RFFVRkJMRkZCUVZFc1EwRkJReXhKUVVSa0xFZEJRMjFDTEZsQlJHNUNMRWRCUXpaQ0xFbEJSRGRDTEVkQlEydERMRzlEUVVSc1F5eEhRVVZOTEVsQlFVTXNRMEZCUVN4UlFVRlJMRU5CUVVNc1MwRkdhRUlzUjBGRmMwSXNWMEZHZEVJc1IwRkZLMElzUzBGR0wwSXNSMEZGY1VNc2MwTkJTQzlETEVOQlRVRXNRMEZCUXl4WFFVNUVMRU5CVFdNc1dVRk9aRHRKUVZGQkxFbEJRVWtzUTBGQlF5eE5RVUZNTEVkQlFXTTdTVUZEWkN4TlFVRkJMRWRCUVZNc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eEpRVUZVTEVOQlFXVXNTMEZCWmp0WFFVTlVMRTFCUVUwc1EwRkJReXhaUVVGUUxFTkJRVzlDTEVOQlFVRXNVMEZCUVN4TFFVRkJPMkZCUVVFc1UwRkJRVHRSUVVWdVFpeE5RVUZOTEVOQlFVTXNVVUZCVUN4RFFVRnBRaXhsUVVGcVFpeERRVUZyUXl4RFFVRkRMRmRCUVc1RExFTkJRV2RFTEdkQ1FVRm9SRHRsUVVOQkxFbEJRVWtzUTBGQlF5eEhRVU5LTEVOQlFVTXNSMEZFUml4RFFVTlBMRmxCUkZBc1JVRkRjVUlzUlVGRWNrSXNRMEZGUXl4RFFVRkRMRmRCUmtZc1EwRkZaU3hMUVVGRExFTkJRVUVzVVVGQlVTeERRVUZETEVsQlJucENMRU5CUjBNc1EwRkJReXhKUVVoR0xFTkJSMUVzUjBGQlFTeEhRVUZKTEV0QlFVTXNRMEZCUVN4UlFVRlJMRU5CUVVNc1YwRklkRUlzUTBGSlF5eERRVUZETEU5QlNrWXNRMEZKVlN4SFFVcFdMRVZCU1dVc1UwRkJRVHRwUWtGQlJ5eERRVUZCTEVOQlFVY3NTVUZCU0N4RFFVRlRMRU5CUVVNc1RVRkJWaXhEUVVGQk8xRkJRVWdzUTBGS1pqdE5RVWh0UWp0SlFVRkJMRU5CUVVFc1EwRkJRU3hEUVVGQkxFbEJRVUVzUTBGQmNFSTdSVUZtU3pzN2VVSkJORUpPTEd0Q1FVRkJMRWRCUVc5Q0xGTkJRVUU3UVVGRGJrSXNVVUZCUVR0QlFVRkJPMEZCUVVFN1UwRkJRU3hwUkVGQlFUczdUVUZEUXl4SlFVRkhMRU5CUVVrc1NVRkJTU3hEUVVGRExFMUJRVlFzU1VGQmIwSXNTVUZCUXl4RFFVRkJMR0ZCUVVRc1EwRkJaMElzU1VGQlNTeERRVUZETEVWQlFYSkNMRU5CUVhaQ08zRkNRVU5ETEVsQlFVTXNRMEZCUVN4SlFVRkVMRU5CUVU4c1NVRkJVQ3hIUVVSRU8wOUJRVUVzVFVGQlFUczJRa0ZCUVRzN1FVRkVSRHM3UlVGRWJVSTdPM2xDUVU5d1FpeGhRVUZCTEVkQlFXVXNVMEZCUlN4RlFVRkdPMEZCUTJRc1VVRkJRVHRKUVVGQkxFbEJRVzFDTEdkRFFVRnVRanRCUVVGQkxHRkJRVThzUzBGQlVEczdTVUZEUVN4SlFVRkJMRWRCUVU4c1JVRkJSU3hEUVVGRExIRkNRVUZJTEVOQlFVRTdTVUZIVUN4WFFVRkJMRWRCUVdNN1FVRkRaQ3hYUVVWRExFbEJRVWtzUTBGQlF5eEhRVUZNTEVkQlFWY3NTVUZCU1N4RFFVRkRMRTFCUVdoQ0xFbEJRVEJDTEVOQlFVTXNWMEZCTTBJc1NVRkRReXhKUVVGSkxFTkJRVU1zVFVGQlRDeEhRVUZqTEVsQlFVa3NRMEZCUXl4TlFVRnVRaXhKUVVFMlFpeFJRVUZSTEVOQlFVTXNUVUZCVkN4SFFVRnJRaXhYUVVSb1JDeEpRVWxETEVsQlFVa3NRMEZCUXl4SlFVRk1MRWRCUVZrc1NVRkJTU3hEUVVGRExFdEJRV3BDTEVsQlFUQkNMRU5CUVVNc1YwRktOVUlzU1VGTFF5eEpRVUZKTEVOQlFVTXNTMEZCVEN4SFFVRmhMRWxCUVVrc1EwRkJReXhMUVVGc1FpeEpRVUV5UWl4UlFVRlJMRU5CUVVNc1MwRkJWQ3hIUVVGcFFqdEZRV0pvUXpzN2VVSkJhVUptTEdGQlFVRXNSMEZCWlN4VFFVRkJPMGxCUTJRc1EwRkJRU3hEUVVGSExFMUJRVWdzUTBGQlZ5eERRVUZETEVWQlFWb3NRMEZCWlN4UlFVRm1MRVZCUVhsQ0xFbEJRVU1zUTBGQlFTdzBRa0ZCTVVJN1YwRkRRU3c0UTBGQlFUdEZRVVpqT3p0NVFrRkpaaXhoUVVGQkxFZEJRV1VzVTBGQlFUdEpRVU5rTEVOQlFVRXNRMEZCUnl4TlFVRklMRU5CUVZjc1EwRkJReXhIUVVGYUxFTkJRV2RDTEZGQlFXaENMRVZCUVRCQ0xFbEJRVU1zUTBGQlFTdzBRa0ZCTTBJN1YwRkRRU3c0UTBGQlFUdEZRVVpqT3pzN08wZEJla1ZYT3p0QlFUWkZNMElzVFVGQlRTeERRVUZETEU5QlFWQXNSMEZCYVVJaWZRPT1cbiIsInZhciAkLCBIb29rcywgTGF6eV9NYXNvbnJ5LCBQb3J0Zm9saW9fTWFzb25yeTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cblBvcnRmb2xpb19NYXNvbnJ5ID0gcmVxdWlyZSgnLi9wb3J0Zm9saW8vUG9ydGZvbGlvX01hc29ucnknKTtcblxuTGF6eV9NYXNvbnJ5ID0gcmVxdWlyZSgnLi9sYXp5L0xhenlfTWFzb25yeScpO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3BwLm1hc29ucnkuc3RhcnQvYmVmb3JlJywgZnVuY3Rpb24oKSB7XG4gIHZhciBMYXp5X0hhbmRsZXI7XG4gIExhenlfSGFuZGxlciA9IEhvb2tzLmFwcGx5RmlsdGVycygncHAubGF6eS5oYW5kbGVyJywgTGF6eV9NYXNvbnJ5KTtcbiAgbmV3IExhenlfSGFuZGxlcigpO1xufSk7XG5cbkhvb2tzLmFkZEFjdGlvbigncHAubWFzb25yeS5zdGFydC9jb21wbGV0ZScsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4gSG9va3MuZG9BY3Rpb24oJ3BwLmxhenkuYXV0b2xvYWQnKTtcbn0pO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3BwLmNvcmUucmVhZHknLCBmdW5jdGlvbigpIHtcbiAgaWYgKCQoJy5QUF9NYXNvbnJ5JykubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiBuZXcgUG9ydGZvbGlvX01hc29ucnkoJChkb2N1bWVudCkpO1xuICB9XG59KTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYldGemIyNXllUzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYkltMWhjMjl1Y25rdVkyOW1abVZsSWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUpCUVVGQkxFbEJRVUU3TzBGQlFVRXNRMEZCUVN4SFFVRkpMRTlCUVVFc1EwRkJVeXhSUVVGVU96dEJRVU5LTEV0QlFVRXNSMEZCVVN4UFFVRkJMRU5CUVZNc1ZVRkJWRHM3UVVGRFVpeHBRa0ZCUVN4SFFVRnZRaXhQUVVGQkxFTkJRVk1zSzBKQlFWUTdPMEZCUTNCQ0xGbEJRVUVzUjBGQlpTeFBRVUZCTEVOQlFWTXNjVUpCUVZRN08wRkJSV1lzUzBGQlN5eERRVUZETEZOQlFVNHNRMEZCWjBJc2VVSkJRV2hDTEVWQlFUSkRMRk5CUVVFN1FVRkhNVU1zVFVGQlFUdEZRVUZCTEZsQlFVRXNSMEZCWlN4TFFVRkxMRU5CUVVNc1dVRkJUaXhEUVVGdFFpeHBRa0ZCYmtJc1JVRkJjME1zV1VGQmRFTTdSVUZEV0N4SlFVRkJMRmxCUVVFc1EwRkJRVHRCUVVwelF5eERRVUV6UXpzN1FVRlJRU3hMUVVGTExFTkJRVU1zVTBGQlRpeERRVUZuUWl3eVFrRkJhRUlzUlVGQk5rTXNVMEZCUVR0VFFVTTFReXhMUVVGTExFTkJRVU1zVVVGQlRpeERRVUZsTEd0Q1FVRm1PMEZCUkRSRExFTkJRVGRET3p0QlFVbEJMRXRCUVVzc1EwRkJReXhUUVVGT0xFTkJRV2RDTEdWQlFXaENMRVZCUVdsRExGTkJRVUU3UlVGRGFFTXNTVUZCUnl4RFFVRkJMRU5CUVVjc1lVRkJTQ3hEUVVGclFpeERRVUZETEUxQlFXNUNMRWRCUVRSQ0xFTkJRUzlDTzFkQlEwc3NTVUZCUVN4cFFrRkJRU3hEUVVGdFFpeERRVUZCTEVOQlFVVXNVVUZCUml4RFFVRnVRaXhGUVVSTU96dEJRVVJuUXl4RFFVRnFReUo5XG4iLCJcbi8qXG4gICAgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBIb29rcywgUG9ydGZvbGlvX0FjdGlvbnMsIFBvcnRmb2xpb19NYXNvbnJ5LFxuICBiaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfSxcbiAgZXh0ZW5kID0gZnVuY3Rpb24oY2hpbGQsIHBhcmVudCkgeyBmb3IgKHZhciBrZXkgaW4gcGFyZW50KSB7IGlmIChoYXNQcm9wLmNhbGwocGFyZW50LCBrZXkpKSBjaGlsZFtrZXldID0gcGFyZW50W2tleV07IH0gZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9IGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTsgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTsgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTsgcmV0dXJuIGNoaWxkOyB9LFxuICBoYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHk7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5Qb3J0Zm9saW9fQWN0aW9ucyA9IHJlcXVpcmUoJy4vLi4vY2xhc3MvUG9ydGZvbGlvX0FjdGlvbnMnKTtcblxuUG9ydGZvbGlvX01hc29ucnkgPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICBleHRlbmQoUG9ydGZvbGlvX01hc29ucnksIHN1cGVyQ2xhc3MpO1xuXG4gIGZ1bmN0aW9uIFBvcnRmb2xpb19NYXNvbnJ5KCkge1xuICAgIHRoaXMucmVmcmVzaCA9IGJpbmQodGhpcy5yZWZyZXNoLCB0aGlzKTtcbiAgICB0aGlzLmRlc3Ryb3kgPSBiaW5kKHRoaXMuZGVzdHJveSwgdGhpcyk7XG4gICAgdGhpcy5jcmVhdGUgPSBiaW5kKHRoaXMuY3JlYXRlLCB0aGlzKTtcbiAgICB0aGlzLnByZXBhcmUgPSBiaW5kKHRoaXMucHJlcGFyZSwgdGhpcyk7XG4gICAgcmV0dXJuIFBvcnRmb2xpb19NYXNvbnJ5Ll9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLkVsZW1lbnRzID0ge1xuICAgIGNvbnRhaW5lcjogJ1BQX01hc29ucnknLFxuICAgIHNpemVyOiAnUFBfTWFzb25yeV9fc2l6ZXInLFxuICAgIGl0ZW06ICdQUF9NYXNvbnJ5X19pdGVtJ1xuICB9O1xuXG5cbiAgLypcbiAgXHRcdEluaXRpYWxpemVcbiAgICovXG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLmluaXRpYWxpemUgPSBmdW5jdGlvbigkcGFyZW50KSB7XG4gICAgcmV0dXJuIHRoaXMuJGNvbnRhaW5lciA9ICRwYXJlbnQuZmluZChcIi5cIiArIHRoaXMuRWxlbWVudHMuY29udGFpbmVyKTtcbiAgfTtcblxuXG4gIC8qXG4gIFx0XHRQcmVwYXJlICYgQXR0YWNoIEV2ZW50c1xuICAgICBcdERvbid0IHNob3cgYW55dGhpbmcgeWV0LlxuICAgKi9cblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUucHJlcGFyZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBtYXNvbnJ5X3NldHRpbmdzO1xuICAgIGlmICh0aGlzLiRjb250YWluZXIubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuJGNvbnRhaW5lci5hZGRDbGFzcygnUFBfSlNfX2xvYWRpbmdfbWFzb25yeScpO1xuICAgIHRoaXMubWF5YmVfY3JlYXRlX3NpemVyKCk7XG4gICAgSG9va3MuZG9BY3Rpb24oJ3BwLm1hc29ucnkuc3RhcnQvYmVmb3JlJyk7XG4gICAgbWFzb25yeV9zZXR0aW5ncyA9IEhvb2tzLmFwcGx5RmlsdGVycygncHAubWFzb25yeS5zZXR0aW5ncycsIHtcbiAgICAgIGl0ZW1TZWxlY3RvcjogXCIuXCIgKyB0aGlzLkVsZW1lbnRzLml0ZW0sXG4gICAgICBjb2x1bW5XaWR0aDogXCIuXCIgKyB0aGlzLkVsZW1lbnRzLnNpemVyLFxuICAgICAgZ3V0dGVyOiAwLFxuICAgICAgaW5pdExheW91dDogZmFsc2VcbiAgICB9KTtcbiAgICB0aGlzLiRjb250YWluZXIubWFzb25yeShtYXNvbnJ5X3NldHRpbmdzKTtcbiAgICByZXR1cm4gdGhpcy4kY29udGFpbmVyLm1hc29ucnkoJ29uJywgJ2xheW91dENvbXBsZXRlJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5tYXNvbnJ5LnN0YXJ0L2NvbXBsZXRlJyk7XG4gICAgICAgIHJldHVybiBfdGhpcy4kY29udGFpbmVyLnJlbW92ZUNsYXNzKCdQUF9KU19fbG9hZGluZ19tYXNvbnJ5JykuYWRkQ2xhc3MoJ1BQX0pTX19sb2FkaW5nX2NvbXBsZXRlJyk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfTtcblxuXG4gIC8qXG4gIFx0XHRTdGFydCB0aGUgUG9ydGZvbGlvXG4gICAqL1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRjb250YWluZXIubWFzb25yeSgpO1xuICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5tYXNvbnJ5LnN0YXJ0L2xheW91dCcpO1xuICB9O1xuXG5cbiAgLypcbiAgXHRcdERlc3Ryb3lcbiAgICovXG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLm1heWJlX3JlbW92ZV9zaXplcigpO1xuICAgIGlmICh0aGlzLiRjb250YWluZXIubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy4kY29udGFpbmVyLm1hc29ucnkoJ2Rlc3Ryb3knKTtcbiAgICB9XG4gIH07XG5cblxuICAvKlxuICBcdFx0UmVsb2FkIHRoZSBsYXlvdXRcbiAgICovXG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy4kY29udGFpbmVyLm1hb3NucnkoJ2xheW91dCcpO1xuICB9O1xuXG5cbiAgLypcbiAgXG4gIFx0XHRDcmVhdGUgYSBzaXplciBlbGVtZW50IGZvciBqcXVlcnktbWFzb25yeSB0byB1c2VcbiAgICovXG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLm1heWJlX2NyZWF0ZV9zaXplciA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnNpemVyX2RvZXNudF9leGlzdCgpKSB7XG4gICAgICB0aGlzLmNyZWF0ZV9zaXplcigpO1xuICAgIH1cbiAgfTtcblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUubWF5YmVfcmVtb3ZlX3NpemVyID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuJGNvbnRhaW5lci5sZW5ndGggIT09IDEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy4kY29udGFpbmVyLmZpbmQoXCIuXCIgKyB0aGlzLkVsZW1lbnRzLnNpemVyKS5yZW1vdmUoKTtcbiAgfTtcblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUuc2l6ZXJfZG9lc250X2V4aXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuJGNvbnRhaW5lci5maW5kKFwiLlwiICsgdGhpcy5FbGVtZW50cy5zaXplcikubGVuZ3RoID09PSAwO1xuICB9O1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5jcmVhdGVfc2l6ZXIgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRjb250YWluZXIuYXBwZW5kKFwiPGRpdiBjbGFzcz1cXFwiXCIgKyB0aGlzLkVsZW1lbnRzLnNpemVyICsgXCJcXFwiPjwvZGl2PlwiKTtcbiAgfTtcblxuICByZXR1cm4gUG9ydGZvbGlvX01hc29ucnk7XG5cbn0pKFBvcnRmb2xpb19BY3Rpb25zKTtcblxubW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW9fTWFzb25yeTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVUc5eWRHWnZiR2x2WDAxaGMyOXVjbmt1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SlFiM0owWm05c2FXOWZUV0Z6YjI1eWVTNWpiMlptWldVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWp0QlFVRkJPenM3UVVGQlFTeEpRVUZCTERoRFFVRkJPMFZCUVVFN096czdRVUZIUVN4RFFVRkJMRWRCUVVrc1QwRkJRU3hEUVVGVExGRkJRVlE3TzBGQlEwb3NTMEZCUVN4SFFVRlJMRTlCUVVFc1EwRkJVeXhWUVVGVU96dEJRVU5TTEdsQ1FVRkJMRWRCUVc5Q0xFOUJRVUVzUTBGQlV5dzRRa0ZCVkRzN1FVRkhaRHM3T3pzN096czdPenM3T0VKQlJVd3NVVUZCUVN4SFFVTkRPMGxCUVVFc1UwRkJRU3hGUVVGWExGbEJRVmc3U1VGRFFTeExRVUZCTEVWQlFWY3NiVUpCUkZnN1NVRkZRU3hKUVVGQkxFVkJRVmNzYTBKQlJsZzdPenM3UVVGSlJEczdPenM0UWtGSFFTeFZRVUZCTEVkQlFWa3NVMEZCUlN4UFFVRkdPMWRCUTFnc1NVRkJReXhEUVVGQkxGVkJRVVFzUjBGQll5eFBRVUZQTEVOQlFVTXNTVUZCVWl4RFFVRmpMRWRCUVVFc1IwRkJTU3hKUVVGRExFTkJRVUVzVVVGQlVTeERRVUZETEZOQlFUVkNPMFZCUkVnN096dEJRVWRhT3pzN096czRRa0ZKUVN4UFFVRkJMRWRCUVZNc1UwRkJRVHRCUVVOU0xGRkJRVUU3U1VGQlFTeEpRVUZWTEVsQlFVTXNRMEZCUVN4VlFVRlZMRU5CUVVNc1RVRkJXaXhMUVVGelFpeERRVUZvUXp0QlFVRkJMR0ZCUVVFN08wbEJSVUVzU1VGQlF5eERRVUZCTEZWQlFWVXNRMEZCUXl4UlFVRmFMRU5CUVhOQ0xIZENRVUYwUWp0SlFVVkJMRWxCUVVNc1EwRkJRU3hyUWtGQlJDeERRVUZCTzBsQlEwRXNTMEZCU3l4RFFVRkRMRkZCUVU0c1EwRkJaU3g1UWtGQlpqdEpRVWxCTEdkQ1FVRkJMRWRCUVcxQ0xFdEJRVXNzUTBGQlF5eFpRVUZPTEVOQlFXMUNMSEZDUVVGdVFpeEZRVU5zUWp0TlFVRkJMRmxCUVVFc1JVRkJZeXhIUVVGQkxFZEJRVWtzU1VGQlF5eERRVUZCTEZGQlFWRXNRMEZCUXl4SlFVRTFRanROUVVOQkxGZEJRVUVzUlVGQll5eEhRVUZCTEVkQlFVa3NTVUZCUXl4RFFVRkJMRkZCUVZFc1EwRkJReXhMUVVRMVFqdE5RVVZCTEUxQlFVRXNSVUZCWXl4RFFVWmtPMDFCUjBFc1ZVRkJRU3hGUVVGakxFdEJTR1E3UzBGRWEwSTdTVUZOYmtJc1NVRkJReXhEUVVGQkxGVkJRVlVzUTBGQlF5eFBRVUZhTEVOQlFYRkNMR2RDUVVGeVFqdFhRVVZCTEVsQlFVTXNRMEZCUVN4VlFVRlZMRU5CUVVNc1QwRkJXaXhEUVVGdlFpeEpRVUZ3UWl4RlFVRXdRaXhuUWtGQk1VSXNSVUZCTkVNc1EwRkJRU3hUUVVGQkxFdEJRVUU3WVVGQlFTeFRRVUZCTzFGQlF6TkRMRXRCUVVzc1EwRkJReXhSUVVGT0xFTkJRV1VzTWtKQlFXWTdaVUZEUVN4TFFVRkRMRU5CUVVFc1ZVRkRSQ3hEUVVGRExGZEJSRVFzUTBGRFl5eDNRa0ZFWkN4RFFVVkJMRU5CUVVNc1VVRkdSQ3hEUVVWWExIbENRVVpZTzAxQlJqSkRPMGxCUVVFc1EwRkJRU3hEUVVGQkxFTkJRVUVzU1VGQlFTeERRVUUxUXp0RlFXeENVVHM3TzBGQmVVSlVPenM3T3poQ1FVZEJMRTFCUVVFc1IwRkJVU3hUUVVGQk8wbEJRMUFzU1VGQlF5eERRVUZCTEZWQlFWVXNRMEZCUXl4UFFVRmFMRU5CUVVFN1NVRkRRU3hMUVVGTExFTkJRVU1zVVVGQlRpeERRVUZsTEhsQ1FVRm1PMFZCUms4N096dEJRVTlTT3pzN096aENRVWRCTEU5QlFVRXNSMEZCVXl4VFFVRkJPMGxCUTFJc1NVRkJReXhEUVVGQkxHdENRVUZFTEVOQlFVRTdTVUZGUVN4SlFVRkhMRWxCUVVNc1EwRkJRU3hWUVVGVkxFTkJRVU1zVFVGQldpeEhRVUZ4UWl4RFFVRjRRanROUVVORExFbEJRVU1zUTBGQlFTeFZRVUZWTEVOQlFVTXNUMEZCV2l4RFFVRnhRaXhUUVVGeVFpeEZRVVJFT3p0RlFVaFJPenM3UVVGVlZEczdPenM0UWtGSFFTeFBRVUZCTEVkQlFWTXNVMEZCUVR0WFFVTlNMRWxCUVVNc1EwRkJRU3hWUVVGVkxFTkJRVU1zVDBGQldpeERRVUZ4UWl4UlFVRnlRanRGUVVSUk96czdRVUZMVkRzN096czdPRUpCUzBFc2EwSkJRVUVzUjBGQmIwSXNVMEZCUVR0SlFVTnVRaXhKUVVGdFFpeEpRVUZETEVOQlFVRXNhMEpCUVVRc1EwRkJRU3hEUVVGdVFqdE5RVUZCTEVsQlFVTXNRMEZCUVN4WlFVRkVMRU5CUVVFc1JVRkJRVHM3UlVGRWJVSTdPemhDUVVsd1FpeHJRa0ZCUVN4SFFVRnZRaXhUUVVGQk8wbEJRMjVDTEVsQlFWVXNTVUZCUXl4RFFVRkJMRlZCUVZVc1EwRkJReXhOUVVGYUxFdEJRWGRDTEVOQlFXeERPMEZCUVVFc1lVRkJRVHM3U1VGRFFTeEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRWxCUVZvc1EwRkJhMElzUjBGQlFTeEhRVUZKTEVsQlFVTXNRMEZCUVN4UlFVRlJMRU5CUVVNc1MwRkJhRU1zUTBGQmVVTXNRMEZCUXl4TlFVRXhReXhEUVVGQk8wVkJSbTFDT3pzNFFrRkxjRUlzYTBKQlFVRXNSMEZCYjBJc1UwRkJRVHRYUVVGSExFbEJRVU1zUTBGQlFTeFZRVUZWTEVOQlFVTXNTVUZCV2l4RFFVRnJRaXhIUVVGQkxFZEJRVWtzU1VGQlF5eERRVUZCTEZGQlFWRXNRMEZCUXl4TFFVRm9ReXhEUVVGNVF5eERRVUZETEUxQlFURkRMRXRCUVc5RU8wVkJRWFpFT3pzNFFrRkhjRUlzV1VGQlFTeEhRVUZqTEZOQlFVRTdTVUZEWWl4SlFVRkRMRU5CUVVFc1ZVRkJWU3hEUVVGRExFMUJRVm9zUTBGQmJVSXNaVUZCUVN4SFFVRnBRaXhKUVVGRExFTkJRVUVzVVVGQlVTeERRVUZETEV0QlFUTkNMRWRCUVdsRExGZEJRWEJFTzBWQlJHRTdPenM3UjBFeFJtbENPenRCUVdkSGFFTXNUVUZCVFN4RFFVRkRMRTlCUVZBc1IwRkJhVUlpZlE9PVxuIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgJCwgSG9va3MsIEl0ZW1fRGF0YSwgZ2V0X2RhdGE7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5JdGVtX0RhdGEgPSByZXF1aXJlKCcuLi9sYXp5L0l0ZW1fRGF0YScpO1xuXG5nZXRfZGF0YSA9IGZ1bmN0aW9uKGVsKSB7XG4gIHZhciAkY29udGFpbmVyLCAkZWwsICRpdGVtcywgaXRlbXM7XG4gICRlbCA9ICQoZWwpO1xuICAkY29udGFpbmVyID0gJGVsLmNsb3Nlc3QoJy5QUF9HYWxsZXJ5Jyk7XG4gICRpdGVtcyA9ICRjb250YWluZXIuZmluZCgnLlBQX0dhbGxlcnlfX2l0ZW0nKTtcbiAgaXRlbXMgPSAkaXRlbXMubWFwKGZ1bmN0aW9uKGtleSwgaXRlbSkge1xuICAgIHZhciBpO1xuICAgIGkgPSBuZXcgSXRlbV9EYXRhKCQoaXRlbSkpO1xuICAgIHJldHVybiB7XG4gICAgICBzcmM6IGkuZ2V0X3VybCgnZnVsbCcpLFxuICAgICAgdGh1bWI6IGkuZ2V0X3VybCgndGh1bWInKVxuICAgIH07XG4gIH0pO1xuICByZXR1cm4gaXRlbXM7XG59O1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3BwLmNvcmUucmVhZHknLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICQoJy5QUF9HYWxsZXJ5X19pdGVtJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgIHZhciAkZWw7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICRlbCA9ICQodGhpcyk7XG4gICAgcmV0dXJuICRlbC5saWdodEdhbGxlcnkoe1xuICAgICAgZHluYW1pYzogdHJ1ZSxcbiAgICAgIGR5bmFtaWNFbDogZ2V0X2RhdGEodGhpcyksXG4gICAgICBpbmRleDogJCgnLlBQX0dhbGxlcnlfX2l0ZW0nKS5pbmRleCgkZWwpLFxuICAgICAgc3BlZWQ6IDM1MCxcbiAgICAgIHByZWxvYWQ6IDMsXG4gICAgICBkb3dubG9hZDogZmFsc2VcbiAgICB9KTtcbiAgfSk7XG59KTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pY0c5d2RYQXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lKd2IzQjFjQzVqYjJabVpXVWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqdEJRVUZCT3pzN1FVRkJRU3hKUVVGQk96dEJRVWRCTEVOQlFVRXNSMEZCU1N4UFFVRkJMRU5CUVZNc1VVRkJWRHM3UVVGRFNpeExRVUZCTEVkQlFWRXNUMEZCUVN4RFFVRlRMRlZCUVZRN08wRkJRMUlzVTBGQlFTeEhRVUZaTEU5QlFVRXNRMEZCVXl4dFFrRkJWRHM3UVVGRldpeFJRVUZCTEVkQlFWY3NVMEZCUlN4RlFVRkdPMEZCUTFZc1RVRkJRVHRGUVVGQkxFZEJRVUVzUjBGQlRTeERRVUZCTEVOQlFVY3NSVUZCU0R0RlFVTk9MRlZCUVVFc1IwRkJZU3hIUVVGSExFTkJRVU1zVDBGQlNpeERRVUZoTEdGQlFXSTdSVUZGWWl4TlFVRkJMRWRCUVZNc1ZVRkJWU3hEUVVGRExFbEJRVmdzUTBGQmFVSXNiVUpCUVdwQ08wVkJSVlFzUzBGQlFTeEhRVUZSTEUxQlFVMHNRMEZCUXl4SFFVRlFMRU5CUVZjc1UwRkJSU3hIUVVGR0xFVkJRVThzU1VGQlVEdEJRVU5zUWl4UlFVRkJPMGxCUVVFc1EwRkJRU3hIUVVGUkxFbEJRVUVzVTBGQlFTeERRVUZYTEVOQlFVRXNRMEZCUnl4SlFVRklMRU5CUVZnN1FVRkZVaXhYUVVGUE8wMUJRMDRzUjBGQlFTeEZRVUZQTEVOQlFVTXNRMEZCUXl4UFFVRkdMRU5CUVZjc1RVRkJXQ3hEUVVSRU8wMUJSVTRzUzBGQlFTeEZRVUZQTEVOQlFVTXNRMEZCUXl4UFFVRkdMRU5CUVZjc1QwRkJXQ3hEUVVaRU96dEZRVWhYTEVOQlFWZzdRVUZUVWl4VFFVRlBPMEZCWmtjN08wRkJhMEpZTEV0QlFVc3NRMEZCUXl4VFFVRk9MRU5CUVdkQ0xHVkJRV2hDTEVWQlFXbERMRk5CUVVFN1UwRkZhRU1zUTBGQlFTeERRVUZITEcxQ1FVRklMRU5CUVhkQ0xFTkJRVU1zUlVGQmVrSXNRMEZCTkVJc1QwRkJOVUlzUlVGQmNVTXNVMEZCUlN4RFFVRkdPMEZCUTNCRExGRkJRVUU3U1VGQlFTeERRVUZETEVOQlFVTXNZMEZCUml4RFFVRkJPMGxCUjBFc1IwRkJRU3hIUVVGTkxFTkJRVUVzUTBGQlJ5eEpRVUZJTzFkQlIwNHNSMEZCUnl4RFFVRkRMRmxCUVVvc1EwRkRRenROUVVGQkxFOUJRVUVzUlVGQlZ5eEpRVUZZTzAxQlEwRXNVMEZCUVN4RlFVRlhMRkZCUVVFc1EwRkJWU3hKUVVGV0xFTkJSRmc3VFVGRlFTeExRVUZCTEVWQlFWY3NRMEZCUVN4RFFVRkhMRzFDUVVGSUxFTkJRWGRDTEVOQlFVTXNTMEZCZWtJc1EwRkJLMElzUjBGQkwwSXNRMEZHV0R0TlFVZEJMRXRCUVVFc1JVRkJWeXhIUVVoWU8wMUJTVUVzVDBGQlFTeEZRVUZYTEVOQlNsZzdUVUZMUVN4UlFVRkJMRVZCUVZjc1MwRk1XRHRMUVVSRU8wVkJVRzlETEVOQlFYSkRPMEZCUm1kRExFTkJRV3BESW4wPVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
