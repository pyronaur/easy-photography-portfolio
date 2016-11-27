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
    return Hooks.addAction('pp.portfolio.destroy', this.purge_actions, 100);
  };

  Abstract_Portfolio_Actions.prototype.purge_actions = function() {
    Hooks.removeAction('pp.portfolio.create', this.prepare, 50);
    Hooks.removeAction('pp.portfolio.create', this.create, 50);
    Hooks.removeAction('pp.portfolio.refresh', this.refresh, 50);
    Hooks.removeAction('pp.portfolio.destroy', this.destroy, 50);
    return Hooks.removeAction('pp.portfolio.destroy', this.purge_actions, 100);
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
var $, Core, Hooks,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Core = (function() {
  function Core() {
    this.ready = bind(this.ready, this);
    this.$doc = $(document);
    this.attach_events();
  }

  Core.prototype.attach_events = function() {
    this.$doc.on('ready', this.ready);
  };

  Core.prototype.ready = function() {
    if (Hooks.applyFilters('pp.core.ready', true)) {
      Hooks.doAction('pp.core.ready');
    }
    this.$doc.find('.PP_Wrapper').imagesLoaded(this.loaded);
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
    this.Items = [];
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

  Lazy_Masonry.prototype.destroy = function() {
    var i, item, key, len, ref;
    ref = this.Items;
    for (key = i = 0, len = ref.length; i < len; key = ++i) {
      item = ref[key];
      item.$el.css('min-height', '');
    }
    return Lazy_Masonry.__super__.destroy.call(this);
  };

  return Lazy_Masonry;

})(Abstract_Lazy_Loader);

module.exports = Lazy_Masonry;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../global/Window":5,"./Abstract_Lazy_Loader":6}],9:[function(require,module,exports){
(function (global){
var $, Hooks, Lazy_Masonry, Portfolio_Masonry, init_lazy_loader, init_masonry, is_masonry, lazy_instance;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Portfolio_Masonry = require('./portfolio/Portfolio_Masonry');

Lazy_Masonry = require('./lazy/Lazy_Masonry');

lazy_instance = false;

is_masonry = function() {
  return $('.PP_Masonry').length > 0;
};


/*
	Initialize Masonry
 */

init_masonry = function() {
  if (!is_masonry()) {
    return;
  }
  return new Portfolio_Masonry($(document));
};

init_lazy_loader = function() {
  if (!is_masonry()) {
    return;
  }
  if (lazy_instance) {
    lazy_instance.destroy();
  }
  return lazy_instance = new (Hooks.applyFilters('pp.lazy.handler', Lazy_Masonry));
};


/*
	Setup Events
 */

Hooks.addAction('pp.core.ready', init_masonry);

Hooks.addAction('pp.portfolio.prepare', init_lazy_loader, 100);

Hooks.addAction('pp.portfolio.destroy', function() {
  lazy_instance.destroy();
  return lazy_instance = null;
});

Hooks.addAction('pp.portfolio.refresh', function() {
  return Hooks.doAction('pp.lazy.autoload');
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
  
  		@called on hook `pp.portfolio.prepare`
   */

  Portfolio_Masonry.prototype.prepare = function() {
    var masonry_settings;
    if (this.$container.length === 0) {
      return;
    }
    this.$container.addClass('PP_JS__loading_masonry');
    this.maybe_create_sizer();
    masonry_settings = Hooks.applyFilters('pp.masonry.settings', {
      itemSelector: "." + this.Elements.item,
      columnWidth: "." + this.Elements.sizer,
      gutter: 0,
      initLayout: false
    });
    this.$container.masonry(masonry_settings);
    return this.$container.masonry('once', 'layoutComplete', (function(_this) {
      return function() {
        _this.$container.removeClass('PP_JS__loading_masonry').addClass('PP_JS__loading_complete');
        return Hooks.doAction('pp.portfolio.refresh');
      };
    })(this));
  };


  /*
  		Start the Portfolio
  		@called on hook `pp.portfolio.create`
   */

  Portfolio_Masonry.prototype.create = function() {
    this.$container.masonry();
  };


  /*
  		Destroy
  		@called on hook `pp.portfolio.destroy`
   */

  Portfolio_Masonry.prototype.destroy = function() {
    this.maybe_remove_sizer();
    if (this.$container.length > 0) {
      this.$container.masonry('destroy');
    }
  };


  /*
  		Reload the layout
  		@called on hook `pp.portfolio.refresh`
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


/*
    @TODO: Need detach/destroy methods
 */

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


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jbGFzcy9BYnN0cmFjdF9Qb3J0Zm9saW9fQWN0aW9ucy5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY2xhc3MvQ29yZS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY2xhc3MvUG9ydGZvbGlvLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9nbG9iYWwvV2luZG93LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0Fic3RyYWN0X0xhenlfTG9hZGVyLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0l0ZW1fRGF0YS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvbGF6eS9MYXp5X01hc29ucnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL21hc29ucnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL3BvcnRmb2xpby9Qb3J0Zm9saW9fTWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL3BvcHVwLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDeklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxuLypcbiAgICBEZXBlbmRlbmNpZXNcbiAqL1xudmFyIENvcmUsIEhvb2tzLCBQb3J0Zm9saW87XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbkNvcmUgPSByZXF1aXJlKCcuL2NsYXNzL0NvcmUnKTtcblxuUG9ydGZvbGlvID0gcmVxdWlyZSgnLi9jbGFzcy9Qb3J0Zm9saW8nKTtcblxubmV3IENvcmUoKTtcblxuSG9va3MuYWRkQWN0aW9uKCdwcC5jb3JlLnJlYWR5JywgKGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFBvcnRmb2xpbygpO1xufSksIDUwKTtcblxucmVxdWlyZSgnLi9tYXNvbnJ5Jyk7XG5cbnJlcXVpcmUoJy4vcG9ydGZvbGlvL3BvcHVwJyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVlYQndMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaVlYQndMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaU8wRkJRVUU3T3p0QlFVRkJMRWxCUVVFN08wRkJSMEVzUzBGQlFTeEhRVUZSTEU5QlFVRXNRMEZCVXl4VlFVRlVPenRCUVVOU0xFbEJRVUVzUjBGQlR5eFBRVUZCTEVOQlFWTXNZMEZCVkRzN1FVRkRVQ3hUUVVGQkxFZEJRVmtzVDBGQlFTeERRVUZUTEcxQ1FVRlVPenRCUVVsU0xFbEJRVUVzU1VGQlFTeERRVUZCT3p0QlFVZEtMRXRCUVVzc1EwRkJReXhUUVVGT0xFTkJRV2RDTEdWQlFXaENMRVZCUVdsRExFTkJRVVVzVTBGQlFUdFRRVUZQTEVsQlFVRXNVMEZCUVN4RFFVRkJPMEZCUVZBc1EwRkJSaXhEUVVGcVF5eEZRVUY1UkN4RlFVRjZSRHM3UVVGSFFTeFBRVUZCTEVOQlFWRXNWMEZCVWpzN1FVRkhRU3hQUVVGQkxFTkJRVkVzYlVKQlFWSWlmUT09XG4iLCJ2YXIgQWJzdHJhY3RfUG9ydGZvbGlvX0FjdGlvbnMsIEhvb2tzO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5cbi8qXG5cdEFic3RyYWN0IENsYXNzIFBvcnRvZmxpb19FdmVudF9JbWVwbGVtZW50YXRpb25cblxuICAgIEhhbmRsZXMgYWxsIHRoZSBldmVudHMgcmVxdWlyZWQgdG8gZnVsbHkgaGFuZGxlIGEgcG9ydGZvbGlvIGxheW91dCBwcm9jZXNzXG4gKi9cblxuQWJzdHJhY3RfUG9ydGZvbGlvX0FjdGlvbnMgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIEFic3RyYWN0X1BvcnRmb2xpb19BY3Rpb25zKGFyZ3MpIHtcbiAgICB0aGlzLnNldHVwX2FjdGlvbnMoKTtcbiAgICB0aGlzLmluaXRpYWxpemUoYXJncyk7XG4gIH1cblxuICBBYnN0cmFjdF9Qb3J0Zm9saW9fQWN0aW9ucy5wcm90b3R5cGUuc2V0dXBfYWN0aW9ucyA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLmFkZEFjdGlvbigncHAucG9ydGZvbGlvLnByZXBhcmUnLCB0aGlzLnByZXBhcmUsIDUwKTtcbiAgICBIb29rcy5hZGRBY3Rpb24oJ3BwLnBvcnRmb2xpby5jcmVhdGUnLCB0aGlzLmNyZWF0ZSwgNTApO1xuICAgIEhvb2tzLmFkZEFjdGlvbigncHAucG9ydGZvbGlvLnJlZnJlc2gnLCB0aGlzLnJlZnJlc2gsIDUwKTtcbiAgICBIb29rcy5hZGRBY3Rpb24oJ3BwLnBvcnRmb2xpby5kZXN0cm95JywgdGhpcy5kZXN0cm95LCA1MCk7XG4gICAgcmV0dXJuIEhvb2tzLmFkZEFjdGlvbigncHAucG9ydGZvbGlvLmRlc3Ryb3knLCB0aGlzLnB1cmdlX2FjdGlvbnMsIDEwMCk7XG4gIH07XG5cbiAgQWJzdHJhY3RfUG9ydGZvbGlvX0FjdGlvbnMucHJvdG90eXBlLnB1cmdlX2FjdGlvbnMgPSBmdW5jdGlvbigpIHtcbiAgICBIb29rcy5yZW1vdmVBY3Rpb24oJ3BwLnBvcnRmb2xpby5jcmVhdGUnLCB0aGlzLnByZXBhcmUsIDUwKTtcbiAgICBIb29rcy5yZW1vdmVBY3Rpb24oJ3BwLnBvcnRmb2xpby5jcmVhdGUnLCB0aGlzLmNyZWF0ZSwgNTApO1xuICAgIEhvb2tzLnJlbW92ZUFjdGlvbigncHAucG9ydGZvbGlvLnJlZnJlc2gnLCB0aGlzLnJlZnJlc2gsIDUwKTtcbiAgICBIb29rcy5yZW1vdmVBY3Rpb24oJ3BwLnBvcnRmb2xpby5kZXN0cm95JywgdGhpcy5kZXN0cm95LCA1MCk7XG4gICAgcmV0dXJuIEhvb2tzLnJlbW92ZUFjdGlvbigncHAucG9ydGZvbGlvLmRlc3Ryb3knLCB0aGlzLnB1cmdlX2FjdGlvbnMsIDEwMCk7XG4gIH07XG5cblxuICAvKlxuICAgICBcdFJlcXVpcmUgdGhlc2UgbWV0aG9kc1xuICAgKi9cblxuICBBYnN0cmFjdF9Qb3J0Zm9saW9fQWN0aW9ucy5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fQWN0aW9uc2AgbXVzdCBpbXBsZW1lbnQgYGluaXRpYWxpemVgIG1ldGhvZFwiKTtcbiAgfTtcblxuICBBYnN0cmFjdF9Qb3J0Zm9saW9fQWN0aW9ucy5wcm90b3R5cGUucHJlcGFyZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fQWN0aW9uc2AgbXVzdCBpbXBsZW1lbnQgYHByZXBhcmVgIG1ldGhvZFwiKTtcbiAgfTtcblxuICBBYnN0cmFjdF9Qb3J0Zm9saW9fQWN0aW9ucy5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19BY3Rpb25zYCBtdXN0IGltcGxlbWVudCBgY3JlYXRlYCBtZXRob2RcIik7XG4gIH07XG5cbiAgQWJzdHJhY3RfUG9ydGZvbGlvX0FjdGlvbnMucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0FjdGlvbnNgIG11c3QgaW1wbGVtZW50IGByZWZyZXNoYCBtZXRob2RcIik7XG4gIH07XG5cbiAgQWJzdHJhY3RfUG9ydGZvbGlvX0FjdGlvbnMucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0FjdGlvbnNgIG11c3QgaW1wbGVtZW50IGBkZXN0cm95YCBtZXRob2RcIik7XG4gIH07XG5cbiAgcmV0dXJuIEFic3RyYWN0X1BvcnRmb2xpb19BY3Rpb25zO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFic3RyYWN0X1BvcnRmb2xpb19BY3Rpb25zO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lRV0p6ZEhKaFkzUmZVRzl5ZEdadmJHbHZYMEZqZEdsdmJuTXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lKQlluTjBjbUZqZEY5UWIzSjBabTlzYVc5ZlFXTjBhVzl1Y3k1amIyWm1aV1VpWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFc1NVRkJRVHM3UVVGQlFTeExRVUZCTEVkQlFWRXNUMEZCUVN4RFFVRlRMRlZCUVZRN096dEJRVWRTT3pzN096czdRVUZMVFR0RlFVVlJMRzlEUVVGRkxFbEJRVVk3U1VGRFdpeEpRVUZETEVOQlFVRXNZVUZCUkN4RFFVRkJPMGxCUTBFc1NVRkJReXhEUVVGQkxGVkJRVVFzUTBGQllTeEpRVUZpTzBWQlJsazdPM1ZEUVVsaUxHRkJRVUVzUjBGQlpTeFRRVUZCTzBsQlEyUXNTMEZCU3l4RFFVRkRMRk5CUVU0c1EwRkJaMElzYzBKQlFXaENMRVZCUVhkRExFbEJRVU1zUTBGQlFTeFBRVUY2UXl4RlFVRnJSQ3hGUVVGc1JEdEpRVU5CTEV0QlFVc3NRMEZCUXl4VFFVRk9MRU5CUVdkQ0xIRkNRVUZvUWl4RlFVRjFReXhKUVVGRExFTkJRVUVzVFVGQmVFTXNSVUZCWjBRc1JVRkJhRVE3U1VGRFFTeExRVUZMTEVOQlFVTXNVMEZCVGl4RFFVRm5RaXh6UWtGQmFFSXNSVUZCZDBNc1NVRkJReXhEUVVGQkxFOUJRWHBETEVWQlFXdEVMRVZCUVd4RU8wbEJRMEVzUzBGQlN5eERRVUZETEZOQlFVNHNRMEZCWjBJc2MwSkJRV2hDTEVWQlFYZERMRWxCUVVNc1EwRkJRU3hQUVVGNlF5eEZRVUZyUkN4RlFVRnNSRHRYUVVOQkxFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMSE5DUVVGb1FpeEZRVUYzUXl4SlFVRkRMRU5CUVVFc1lVRkJla01zUlVGQmQwUXNSMEZCZUVRN1JVRk1ZenM3ZFVOQlQyWXNZVUZCUVN4SFFVRmxMRk5CUVVFN1NVRkRaQ3hMUVVGTExFTkJRVU1zV1VGQlRpeERRVUZ0UWl4eFFrRkJia0lzUlVGQk1FTXNTVUZCUXl4RFFVRkJMRTlCUVRORExFVkJRVzlFTEVWQlFYQkVPMGxCUTBFc1MwRkJTeXhEUVVGRExGbEJRVTRzUTBGQmJVSXNjVUpCUVc1Q0xFVkJRVEJETEVsQlFVTXNRMEZCUVN4TlFVRXpReXhGUVVGdFJDeEZRVUZ1UkR0SlFVTkJMRXRCUVVzc1EwRkJReXhaUVVGT0xFTkJRVzFDTEhOQ1FVRnVRaXhGUVVFeVF5eEpRVUZETEVOQlFVRXNUMEZCTlVNc1JVRkJjVVFzUlVGQmNrUTdTVUZEUVN4TFFVRkxMRU5CUVVNc1dVRkJUaXhEUVVGdFFpeHpRa0ZCYmtJc1JVRkJNa01zU1VGQlF5eERRVUZCTEU5QlFUVkRMRVZCUVhGRUxFVkJRWEpFTzFkQlEwRXNTMEZCU3l4RFFVRkRMRmxCUVU0c1EwRkJiVUlzYzBKQlFXNUNMRVZCUVRKRExFbEJRVU1zUTBGQlFTeGhRVUUxUXl4RlFVRXlSQ3hIUVVFelJEdEZRVXhqT3pzN1FVRlJaanM3T3p0MVEwRkhRU3hWUVVGQkxFZEJRVmtzVTBGQlFUdEJRVUZITEZWQlFWVXNTVUZCUVN4TFFVRkJMRU5CUVU4c2JVWkJRVkE3UlVGQllqczdkVU5CUTFvc1QwRkJRU3hIUVVGWkxGTkJRVUU3UVVGQlJ5eFZRVUZWTEVsQlFVRXNTMEZCUVN4RFFVRlBMR2RHUVVGUU8wVkJRV0k3TzNWRFFVTmFMRTFCUVVFc1IwRkJXU3hUUVVGQk8wRkJRVWNzVlVGQlZTeEpRVUZCTEV0QlFVRXNRMEZCVHl3clJVRkJVRHRGUVVGaU96dDFRMEZEV2l4UFFVRkJMRWRCUVZrc1UwRkJRVHRCUVVGSExGVkJRVlVzU1VGQlFTeExRVUZCTEVOQlFVOHNaMFpCUVZBN1JVRkJZanM3ZFVOQlExb3NUMEZCUVN4SFFVRlpMRk5CUVVFN1FVRkJSeXhWUVVGVkxFbEJRVUVzUzBGQlFTeERRVUZQTEdkR1FVRlFPMFZCUVdJN096czdPenRCUVVWaUxFMUJRVTBzUTBGQlF5eFBRVUZRTEVkQlFXbENJbjA9XG4iLCJcbi8qXG4gICAgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBDb3JlLCBIb29rcyxcbiAgYmluZCA9IGZ1bmN0aW9uKGZuLCBtZSl7IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7IH07IH07XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5Db3JlID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBDb3JlKCkge1xuICAgIHRoaXMucmVhZHkgPSBiaW5kKHRoaXMucmVhZHksIHRoaXMpO1xuICAgIHRoaXMuJGRvYyA9ICQoZG9jdW1lbnQpO1xuICAgIHRoaXMuYXR0YWNoX2V2ZW50cygpO1xuICB9XG5cbiAgQ29yZS5wcm90b3R5cGUuYXR0YWNoX2V2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJGRvYy5vbigncmVhZHknLCB0aGlzLnJlYWR5KTtcbiAgfTtcblxuICBDb3JlLnByb3RvdHlwZS5yZWFkeSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChIb29rcy5hcHBseUZpbHRlcnMoJ3BwLmNvcmUucmVhZHknLCB0cnVlKSkge1xuICAgICAgSG9va3MuZG9BY3Rpb24oJ3BwLmNvcmUucmVhZHknKTtcbiAgICB9XG4gICAgdGhpcy4kZG9jLmZpbmQoJy5QUF9XcmFwcGVyJykuaW1hZ2VzTG9hZGVkKHRoaXMubG9hZGVkKTtcbiAgfTtcblxuICBDb3JlLnByb3RvdHlwZS5sb2FkZWQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoSG9va3MuYXBwbHlGaWx0ZXJzKCdwcC5sb2FkZWQnLCB0cnVlKSkge1xuICAgICAgSG9va3MuZG9BY3Rpb24oJ3BwLmNvcmUubG9hZGVkJyk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBDb3JlO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvcmU7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVEyOXlaUzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklrTnZjbVV1WTI5bVptVmxJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSTdRVUZCUVRzN08wRkJRVUVzU1VGQlFTeGpRVUZCTzBWQlFVRTdPMEZCUjBFc1EwRkJRU3hIUVVGSkxFOUJRVUVzUTBGQlV5eFJRVUZVT3p0QlFVTktMRXRCUVVFc1IwRkJVU3hQUVVGQkxFTkJRVk1zVlVGQlZEczdRVUZIUmp0RlFVVlJMR05CUVVFN08wbEJRMW9zU1VGQlF5eERRVUZCTEVsQlFVUXNSMEZCVVN4RFFVRkJMRU5CUVVjc1VVRkJTRHRKUVVOU0xFbEJRVU1zUTBGQlFTeGhRVUZFTEVOQlFVRTdSVUZHV1RzN2FVSkJUV0lzWVVGQlFTeEhRVUZsTEZOQlFVRTdTVUZEWkN4SlFVRkRMRU5CUVVFc1NVRkJTU3hEUVVGRExFVkJRVTRzUTBGQlV5eFBRVUZVTEVWQlFXdENMRWxCUVVNc1EwRkJRU3hMUVVGdVFqdEZRVVJqT3p0cFFrRlBaaXhMUVVGQkxFZEJRVThzVTBGQlFUdEpRVU5PTEVsQlFVY3NTMEZCU3l4RFFVRkRMRmxCUVU0c1EwRkJiMElzWlVGQmNFSXNSVUZCY1VNc1NVRkJja01zUTBGQlNEdE5RVU5ETEV0QlFVc3NRMEZCUXl4UlFVRk9MRU5CUVdVc1pVRkJaaXhGUVVSRU96dEpRVWxCTEVsQlFVTXNRMEZCUVN4SlFVRkpMRU5CUVVNc1NVRkJUaXhEUVVGWkxHRkJRVm9zUTBGQk1rSXNRMEZCUXl4WlFVRTFRaXhEUVVFd1F5eEpRVUZETEVOQlFVRXNUVUZCTTBNN1JVRk1UVHM3YVVKQlZWQXNUVUZCUVN4SFFVRlJMRk5CUVVFN1NVRkRVQ3hKUVVGSExFdEJRVXNzUTBGQlF5eFpRVUZPTEVOQlFXOUNMRmRCUVhCQ0xFVkJRV2xETEVsQlFXcERMRU5CUVVnN1RVRkRReXhMUVVGTExFTkJRVU1zVVVGQlRpeERRVUZsTEdkQ1FVRm1MRVZCUkVRN08wVkJSRTg3T3pzN096dEJRVTlVTEUxQlFVMHNRMEZCUXl4UFFVRlFMRWRCUVdsQ0luMD1cbiIsInZhciBIb29rcywgUG9ydGZvbGlvO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5cbi8qXG5cbiAgICAgKiBJbml0aWFsaXplIFBvcnRmb2xpbyBDb3JlXG5cdC0tLVxuXHRcdFVzaW5nIHA1MCBAIHBwLmxvYWRlZFxuXHRcdExhdGUgcHJpb3JpdHkgaXMgZ29pbmcgdG8gZm9yY2UgZXhwbGljaXQgcHJpb3JpdHkgaW4gYW55IG90aGVyIG1vdmluZyBwYXJ0cyB0aGF0IGFyZSBnb2luZyB0byB0b3VjaCBwb3J0Zm9saW8gbGF5b3V0IGF0IGBwcC5sb2FkZWRgXG5cdC0tLVxuICovXG5cblBvcnRmb2xpbyA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gUG9ydGZvbGlvKCkge1xuICAgIEhvb2tzLmFkZEFjdGlvbigncHAuY29yZS5sb2FkZWQnLCB0aGlzLmNyZWF0ZSwgNTApO1xuICAgIHRoaXMucHJlcGFyZSgpO1xuICB9XG5cbiAgUG9ydGZvbGlvLnByb3RvdHlwZS5wcmVwYXJlID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MuZG9BY3Rpb24oJ3BwLnBvcnRmb2xpby5wcmVwYXJlJyk7XG4gIH07XG5cbiAgUG9ydGZvbGlvLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBIb29rcy5kb0FjdGlvbigncHAucG9ydGZvbGlvLmNyZWF0ZScpO1xuICB9O1xuXG4gIFBvcnRmb2xpby5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5wb3J0Zm9saW8ucmVmcmVzaCcpO1xuICB9O1xuXG4gIFBvcnRmb2xpby5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5wb3J0Zm9saW8uZGVzdHJveScpO1xuICAgIEhvb2tzLnJlbW92ZUFjdGlvbigncHAubG9hZGVkJywgdGhpcy5jcmVhdGUsIDUwKTtcbiAgfTtcblxuICByZXR1cm4gUG9ydGZvbGlvO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBvcnRmb2xpbztcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVUc5eWRHWnZiR2x2TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lVRzl5ZEdadmJHbHZMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRU3hKUVVGQk96dEJRVUZCTEV0QlFVRXNSMEZCVVN4UFFVRkJMRU5CUVZNc1ZVRkJWRHM3TzBGQlJWSTdPenM3T3pzN096dEJRVk5OTzBWQlJWRXNiVUpCUVVFN1NVRkRXaXhMUVVGTExFTkJRVU1zVTBGQlRpeERRVUZuUWl4blFrRkJhRUlzUlVGQmEwTXNTVUZCUXl4RFFVRkJMRTFCUVc1RExFVkJRVEpETEVWQlFUTkRPMGxCUTBFc1NVRkJReXhEUVVGQkxFOUJRVVFzUTBGQlFUdEZRVVpaT3p0elFrRkpZaXhQUVVGQkxFZEJRVk1zVTBGQlFUdEpRVU5TTEV0QlFVc3NRMEZCUXl4UlFVRk9MRU5CUVdVc2MwSkJRV1k3UlVGRVVUczdjMEpCU1ZRc1RVRkJRU3hIUVVGUkxGTkJRVUU3U1VGRFVDeExRVUZMTEVOQlFVTXNVVUZCVGl4RFFVRmxMSEZDUVVGbU8wVkJSRTg3TzNOQ1FVdFNMRTlCUVVFc1IwRkJVeXhUUVVGQk8wbEJRMUlzUzBGQlN5eERRVUZETEZGQlFVNHNRMEZCWlN4elFrRkJaanRGUVVSUk96dHpRa0ZMVkN4UFFVRkJMRWRCUVZNc1UwRkJRVHRKUVVWU0xFdEJRVXNzUTBGQlF5eFJRVUZPTEVOQlFXVXNjMEpCUVdZN1NVRkRRU3hMUVVGTExFTkJRVU1zV1VGQlRpeERRVUZ0UWl4WFFVRnVRaXhGUVVGblF5eEpRVUZETEVOQlFVRXNUVUZCYWtNc1JVRkJlVU1zUlVGQmVrTTdSVUZJVVRzN096czdPMEZCVDFZc1RVRkJUU3hEUVVGRExFOUJRVkFzUjBGQmFVSWlmUT09XG4iLCJ2YXIgSG9va3MsIGdldF9zaXplO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5nZXRfc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHdpZHRoOiB3aW5kb3cuaW5uZXJXaWR0aCB8fCAkd2luZG93LndpZHRoKCksXG4gICAgaGVpZ2h0OiB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgJHdpbmRvdy5oZWlnaHQoKVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBnZXRfc2l6ZSgpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lWMmx1Wkc5M0xtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpVjJsdVpHOTNMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRU3hKUVVGQk96dEJRVUZCTEV0QlFVRXNSMEZCVVN4UFFVRkJMRU5CUVZNc1ZVRkJWRHM3UVVGSFVpeFJRVUZCTEVkQlFWY3NVMEZCUVR0VFFVTldPMGxCUVVFc1MwRkJRU3hGUVVGUkxFMUJRVTBzUTBGQlF5eFZRVUZRTEVsQlFYRkNMRTlCUVU4c1EwRkJReXhMUVVGU0xFTkJRVUVzUTBGQk4wSTdTVUZEUVN4TlFVRkJMRVZCUVZFc1RVRkJUU3hEUVVGRExGZEJRVkFzU1VGQmMwSXNUMEZCVHl4RFFVRkRMRTFCUVZJc1EwRkJRU3hEUVVRNVFqczdRVUZFVlRzN1FVRkxXQ3hOUVVGTkxFTkJRVU1zVDBGQlVDeEhRVUZwUWl4UlFVRkJMRU5CUVVFaWZRPT1cbiIsIlxuLypcbiAgICBEZXBlbmRlbmNpZXNcbiAqL1xudmFyICQsIEhvb2tzLCBJdGVtX0RhdGEsIExhenlfTG9hZGVyO1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuSXRlbV9EYXRhID0gcmVxdWlyZSgnLi9JdGVtX0RhdGEnKTtcblxuTGF6eV9Mb2FkZXIgPSAoZnVuY3Rpb24oKSB7XG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5FbGVtZW50cyA9IHtcbiAgICBpdGVtOiAnUFBfTGF6eV9JbWFnZScsXG4gICAgcGxhY2Vob2xkZXI6ICdQUF9MYXp5X0ltYWdlX19wbGFjZWhvbGRlcicsXG4gICAgbGluazogJ1BQX0pTX0xhenlfX2xpbmsnLFxuICAgIGltYWdlOiAnUFBfSlNfTGF6eV9faW1hZ2UnXG4gIH07XG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLkl0ZW1zID0gW107XG5cbiAgZnVuY3Rpb24gTGF6eV9Mb2FkZXIoKSB7XG4gICAgdGhpcy5zZXR1cF9kYXRhKCk7XG4gICAgdGhpcy5yZXNpemVfYWxsKCk7XG4gICAgdGhpcy5hdHRhY2hfZXZlbnRzKCk7XG4gIH1cblxuXG4gIC8qXG4gIFx0XHRBYnN0cmFjdCBNZXRob2RzXG4gICAqL1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgTGF6eV9Mb2FkZXJgIG11c3QgaW1wbGVtZW50IGByZXNpemVgIG1ldGhvZFwiKTtcbiAgfTtcblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBMYXp5X0xvYWRlcmAgbXVzdCBpbXBsZW1lbnQgYGxvYWRgIG1ldGhvZFwiKTtcbiAgfTtcblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUuYXV0b2xvYWQgPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgTGF6eV9Mb2FkZXJgIG11c3QgaW1wbGVtZW50IGBhdXRvbG9hZGAgbWV0aG9kXCIpO1xuICB9O1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5zZXR1cF9kYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyICRpdGVtcztcbiAgICB0aGlzLkl0ZW1zID0gW107XG4gICAgJGl0ZW1zID0gJChcIi5cIiArIHRoaXMuRWxlbWVudHMuaXRlbSk7XG4gICAgJGl0ZW1zLmVhY2goKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oa2V5LCBlbCkge1xuICAgICAgICB2YXIgJGVsO1xuICAgICAgICAkZWwgPSAkKGVsKTtcbiAgICAgICAgcmV0dXJuIF90aGlzLkl0ZW1zLnB1c2goe1xuICAgICAgICAgIGVsOiBlbCxcbiAgICAgICAgICAkZWw6ICRlbCxcbiAgICAgICAgICBkYXRhOiBuZXcgSXRlbV9EYXRhKCRlbCksXG4gICAgICAgICAgbG9hZGVkOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9O1xuXG5cbiAgLypcbiAgXHRcdE1ldGhvZHNcbiAgICovXG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLnJlc2l6ZV9hbGwgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaSwgaXRlbSwgbGVuLCByZWYsIHJlc3VsdHM7XG4gICAgcmVmID0gdGhpcy5JdGVtcztcbiAgICByZXN1bHRzID0gW107XG4gICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpdGVtID0gcmVmW2ldO1xuICAgICAgcmVzdWx0cy5wdXNoKHRoaXMucmVzaXplKGl0ZW0pKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLmxvYWRfYWxsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGksIGl0ZW0sIGxlbiwgcmVmLCByZXN1bHRzO1xuICAgIHJlZiA9IHRoaXMuSXRlbXM7XG4gICAgcmVzdWx0cyA9IFtdO1xuICAgIGZvciAoaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgaXRlbSA9IHJlZltpXTtcbiAgICAgIHRoaXMubG9hZChpdGVtKTtcbiAgICAgIHJlc3VsdHMucHVzaCh0aGlzLnJlbW92ZV9wbGFjZWhvbGRlcihpdGVtKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5yZW1vdmVfcGxhY2Vob2xkZXIgPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0uJGVsLmZpbmQoXCIuXCIgKyB0aGlzLkVsZW1lbnRzLnBsYWNlaG9sZGVyICsgXCIsIG5vc2NyaXB0XCIpLnJlbW92ZSgpO1xuICB9O1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZGV0YWNoX2V2ZW50cygpO1xuICB9O1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5hdHRhY2hfZXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEhvb2tzLmFkZEFjdGlvbigncHAubGF6eS5hdXRvbG9hZCcsIHRoaXMuYXV0b2xvYWQpO1xuICB9O1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5kZXRhY2hfZXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEhvb2tzLnJlbW92ZUFjdGlvbigncHAubGF6eS5hdXRvbG9hZCcsIHRoaXMuYXV0b2xvYWQpO1xuICB9O1xuXG4gIHJldHVybiBMYXp5X0xvYWRlcjtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBMYXp5X0xvYWRlcjtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pUVdKemRISmhZM1JmVEdGNmVWOU1iMkZrWlhJdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUpCWW5OMGNtRmpkRjlNWVhwNVgweHZZV1JsY2k1amIyWm1aV1VpWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanRCUVVGQk96czdRVUZCUVN4SlFVRkJPenRCUVVkQkxFTkJRVUVzUjBGQlNTeFBRVUZCTEVOQlFWTXNVVUZCVkRzN1FVRkRTaXhMUVVGQkxFZEJRVkVzVDBGQlFTeERRVUZUTEZWQlFWUTdPMEZCUTFJc1UwRkJRU3hIUVVGWkxFOUJRVUVzUTBGQlV5eGhRVUZVT3p0QlFVVk9PM2RDUVVWTUxGRkJRVUVzUjBGRFF6dEpRVUZCTEVsQlFVRXNSVUZCWVN4bFFVRmlPMGxCUTBFc1YwRkJRU3hGUVVGaExEUkNRVVJpTzBsQlJVRXNTVUZCUVN4RlFVRmhMR3RDUVVaaU8wbEJSMEVzUzBGQlFTeEZRVUZoTEcxQ1FVaGlPenM3ZDBKQlMwUXNTMEZCUVN4SFFVRlBPenRGUVVkTkxIRkNRVUZCTzBsQlExb3NTVUZCUXl4RFFVRkJMRlZCUVVRc1EwRkJRVHRKUVVOQkxFbEJRVU1zUTBGQlFTeFZRVUZFTEVOQlFVRTdTVUZEUVN4SlFVRkRMRU5CUVVFc1lVRkJSQ3hEUVVGQk8wVkJTRms3T3p0QlFVMWlPenM3TzNkQ1FVZEJMRTFCUVVFc1IwRkJWU3hUUVVGQk8wRkJRVWNzVlVGQlZTeEpRVUZCTEV0QlFVRXNRMEZCVHl4NVJVRkJVRHRGUVVGaU96dDNRa0ZEVml4SlFVRkJMRWRCUVZVc1UwRkJRVHRCUVVGSExGVkJRVlVzU1VGQlFTeExRVUZCTEVOQlFVOHNkVVZCUVZBN1JVRkJZanM3ZDBKQlExWXNVVUZCUVN4SFFVRlZMRk5CUVVFN1FVRkJSeXhWUVVGVkxFbEJRVUVzUzBGQlFTeERRVUZQTERKRlFVRlFPMFZCUVdJN08zZENRVWRXTEZWQlFVRXNSMEZCV1N4VFFVRkJPMEZCUlZnc1VVRkJRVHRKUVVGQkxFbEJRVU1zUTBGQlFTeExRVUZFTEVkQlFWTTdTVUZGVkN4TlFVRkJMRWRCUVZNc1EwRkJRU3hEUVVGSExFZEJRVUVzUjBGQlNTeEpRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRWxCUVdwQ08wbEJSVlFzVFVGQlRTeERRVUZETEVsQlFWQXNRMEZCV1N4RFFVRkJMRk5CUVVFc1MwRkJRVHRoUVVGQkxGTkJRVVVzUjBGQlJpeEZRVUZQTEVWQlFWQTdRVUZGV0N4WlFVRkJPMUZCUVVFc1IwRkJRU3hIUVVGTkxFTkJRVUVzUTBGQlJ5eEZRVUZJTzJWQlEwNHNTMEZCUXl4RFFVRkJMRXRCUVVzc1EwRkJReXhKUVVGUUxFTkJRME03VlVGQlFTeEZRVUZCTEVWQlFWRXNSVUZCVWp0VlFVTkJMRWRCUVVFc1JVRkJVU3hIUVVSU08xVkJSVUVzU1VGQlFTeEZRVUZaTEVsQlFVRXNVMEZCUVN4RFFVRlhMRWRCUVZnc1EwRkdXanRWUVVkQkxFMUJRVUVzUlVGQlVTeExRVWhTTzFOQlJFUTdUVUZJVnp0SlFVRkJMRU5CUVVFc1EwRkJRU3hEUVVGQkxFbEJRVUVzUTBGQldqdEZRVTVYT3pzN1FVRnJRbG83T3pzN2QwSkJSMEVzVlVGQlFTeEhRVUZaTEZOQlFVRTdRVUZEV0N4UlFVRkJPMEZCUVVFN1FVRkJRVHRUUVVGQkxIRkRRVUZCT3p0dFFrRkJRU3hKUVVGRExFTkJRVUVzVFVGQlJDeERRVUZUTEVsQlFWUTdRVUZCUVRzN1JVRkVWenM3ZDBKQlIxb3NVVUZCUVN4SFFVRlZMRk5CUVVFN1FVRkRWQ3hSUVVGQk8wRkJRVUU3UVVGQlFUdFRRVUZCTEhGRFFVRkJPenROUVVORExFbEJRVU1zUTBGQlFTeEpRVUZFTEVOQlFVOHNTVUZCVUR0dFFrRkRRU3hKUVVGRExFTkJRVUVzYTBKQlFVUXNRMEZCY1VJc1NVRkJja0k3UVVGR1JEczdSVUZFVXpzN2QwSkJTMVlzYTBKQlFVRXNSMEZCYjBJc1UwRkJSU3hKUVVGR08xZEJRMjVDTEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1NVRkJWQ3hEUVVGbExFZEJRVUVzUjBGQlNTeEpRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRmRCUVdRc1IwRkJNRUlzV1VGQmVrTXNRMEZCYzBRc1EwRkJReXhOUVVGMlJDeERRVUZCTzBWQlJHMUNPenQzUWtGSmNFSXNUMEZCUVN4SFFVRlRMRk5CUVVFN1YwRkRVaXhKUVVGRExFTkJRVUVzWVVGQlJDeERRVUZCTzBWQlJGRTdPM2RDUVVkVUxHRkJRVUVzUjBGQlpTeFRRVUZCTzFkQlEyUXNTMEZCU3l4RFFVRkRMRk5CUVU0c1EwRkJaMElzYTBKQlFXaENMRVZCUVc5RExFbEJRVU1zUTBGQlFTeFJRVUZ5UXp0RlFVUmpPenQzUWtGSFppeGhRVUZCTEVkQlFXVXNVMEZCUVR0WFFVTmtMRXRCUVVzc1EwRkJReXhaUVVGT0xFTkJRVzFDTEd0Q1FVRnVRaXhGUVVGMVF5eEpRVUZETEVOQlFVRXNVVUZCZUVNN1JVRkVZenM3T3pzN08wRkJSMmhDTEUxQlFVMHNRMEZCUXl4UFFVRlFMRWRCUVdsQ0luMD1cbiIsInZhciBJdGVtX0RhdGE7XG5cbkl0ZW1fRGF0YSA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gSXRlbV9EYXRhKCRlbCkge1xuICAgIHZhciBkYXRhO1xuICAgIHRoaXMuJGVsID0gJGVsO1xuICAgIGRhdGEgPSAkZWwuZGF0YSgnaXRlbScpO1xuICAgIGlmICghZGF0YSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRWxlbWVudCBkb2Vzbid0IGNvbnRhaW4gYGRhdGEtaXRlbWAgYXR0cmlidXRlXCIpO1xuICAgIH1cbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICB9XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfZGF0YSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaW1hZ2U7XG4gICAgaW1hZ2UgPSB0aGlzLmRhdGFbJ2ltYWdlcyddW25hbWVdO1xuICAgIGlmICghaW1hZ2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGltYWdlO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X3NpemUgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGhlaWdodCwgaW1hZ2UsIHJlZiwgc2l6ZSwgd2lkdGg7XG4gICAgaW1hZ2UgPSB0aGlzLmdldF9kYXRhKG5hbWUpO1xuICAgIGlmICghaW1hZ2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgc2l6ZSA9IGltYWdlWydzaXplJ107XG4gICAgcmVmID0gc2l6ZS5zcGxpdCgneCcpLCB3aWR0aCA9IHJlZlswXSwgaGVpZ2h0ID0gcmVmWzFdO1xuICAgIHdpZHRoID0gcGFyc2VJbnQod2lkdGgpO1xuICAgIGhlaWdodCA9IHBhcnNlSW50KGhlaWdodCk7XG4gICAgcmV0dXJuIFt3aWR0aCwgaGVpZ2h0XTtcbiAgfTtcblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF91cmwgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGltYWdlO1xuICAgIGltYWdlID0gdGhpcy5nZXRfZGF0YShuYW1lKTtcbiAgICBpZiAoIWltYWdlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBpbWFnZVsndXJsJ107XG4gIH07XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfb3JfZmFsc2UgPSBmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAodGhpcy5kYXRhW2tleV0pIHtcbiAgICAgIHJldHVybiB0aGlzLmRhdGFba2V5XTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X3JhdGlvID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0X29yX2ZhbHNlKCdyYXRpbycpO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X3R5cGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRfb3JfZmFsc2UoJ3R5cGUnKTtcbiAgfTtcblxuICByZXR1cm4gSXRlbV9EYXRhO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEl0ZW1fRGF0YTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pU1hSbGJWOUVZWFJoTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lTWFJsYlY5RVlYUmhMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRU3hKUVVGQk96dEJRVUZOTzBWQlJWRXNiVUpCUVVVc1IwRkJSanRCUVVOYUxGRkJRVUU3U1VGQlFTeEpRVUZETEVOQlFVRXNSMEZCUkN4SFFVRlBPMGxCUTFBc1NVRkJRU3hIUVVGUExFZEJRVWNzUTBGQlF5eEpRVUZLTEVOQlFWVXNUVUZCVmp0SlFVVlFMRWxCUVVjc1EwRkJTU3hKUVVGUU8wRkJRME1zV1VGQlZTeEpRVUZCTEV0QlFVRXNRMEZCVFN3clEwRkJUaXhGUVVSWU96dEpRVWRCTEVsQlFVTXNRMEZCUVN4SlFVRkVMRWRCUVZFN1JVRlFTVHM3YzBKQlYySXNVVUZCUVN4SFFVRlZMRk5CUVVVc1NVRkJSanRCUVVOVUxGRkJRVUU3U1VGQlFTeExRVUZCTEVkQlFWRXNTVUZCUXl4RFFVRkJMRWxCUVUwc1EwRkJRU3hSUVVGQkxFTkJRVmtzUTBGQlFTeEpRVUZCTzBsQlF6TkNMRWxCUVdkQ0xFTkJRVWtzUzBGQmNFSTdRVUZCUVN4aFFVRlBMRTFCUVZBN08wRkJSVUVzVjBGQlR6dEZRVXBGT3p0elFrRk5WaXhSUVVGQkxFZEJRVlVzVTBGQlJTeEpRVUZHTzBGQlExUXNVVUZCUVR0SlFVRkJMRXRCUVVFc1IwRkJVU3hKUVVGRExFTkJRVUVzVVVGQlJDeERRVUZYTEVsQlFWZzdTVUZEVWl4SlFVRm5RaXhEUVVGSkxFdEJRWEJDTzBGQlFVRXNZVUZCVHl4TlFVRlFPenRKUVVWQkxFbEJRVUVzUjBGQlR5eExRVUZQTEVOQlFVRXNUVUZCUVR0SlFVVmtMRTFCUVd0Q0xFbEJRVWtzUTBGQlF5eExRVUZNTEVOQlFWa3NSMEZCV2l4RFFVRnNRaXhGUVVGRExHTkJRVVFzUlVGQlVUdEpRVVZTTEV0QlFVRXNSMEZCVVN4UlFVRkJMRU5CUVZVc1MwRkJWanRKUVVOU0xFMUJRVUVzUjBGQlV5eFJRVUZCTEVOQlFWVXNUVUZCVmp0QlFVVlVMRmRCUVU4c1EwRkJReXhMUVVGRUxFVkJRVkVzVFVGQlVqdEZRVmhGT3p0elFrRmhWaXhQUVVGQkxFZEJRVk1zVTBGQlJTeEpRVUZHTzBGQlExSXNVVUZCUVR0SlFVRkJMRXRCUVVFc1IwRkJVU3hKUVVGRExFTkJRVUVzVVVGQlJDeERRVUZYTEVsQlFWZzdTVUZEVWl4SlFVRm5RaXhEUVVGSkxFdEJRWEJDTzBGQlFVRXNZVUZCVHl4TlFVRlFPenRCUVVOQkxGZEJRVThzUzBGQlR5eERRVUZCTEV0QlFVRTdSVUZJVGpzN2MwSkJTMVFzV1VGQlFTeEhRVUZqTEZOQlFVVXNSMEZCUmp0SlFVTmlMRWxCUVVjc1NVRkJReXhEUVVGQkxFbEJRVTBzUTBGQlFTeEhRVUZCTEVOQlFWWTdRVUZEUXl4aFFVRlBMRWxCUVVNc1EwRkJRU3hKUVVGTkxFTkJRVUVzUjBGQlFTeEZRVVJtT3p0QlFVVkJMRmRCUVU4N1JVRklUVHM3YzBKQlMyUXNVMEZCUVN4SFFVRmpMRk5CUVVFN1YwRkJSeXhKUVVGRExFTkJRVUVzV1VGQlJDeERRVUZsTEU5QlFXWTdSVUZCU0RzN2MwSkJRMlFzVVVGQlFTeEhRVUZqTEZOQlFVRTdWMEZCUnl4SlFVRkRMRU5CUVVFc1dVRkJSQ3hEUVVGbExFMUJRV1k3UlVGQlNEczdPenM3TzBGQlIyWXNUVUZCVFN4RFFVRkRMRTlCUVZBc1IwRkJhVUlpZlE9PVxuIiwidmFyICQsIEFic3RyYWN0X0xhenlfTG9hZGVyLCBMYXp5X01hc29ucnksIF9fV0lORE9XLFxuICBiaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfSxcbiAgZXh0ZW5kID0gZnVuY3Rpb24oY2hpbGQsIHBhcmVudCkgeyBmb3IgKHZhciBrZXkgaW4gcGFyZW50KSB7IGlmIChoYXNQcm9wLmNhbGwocGFyZW50LCBrZXkpKSBjaGlsZFtrZXldID0gcGFyZW50W2tleV07IH0gZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9IGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTsgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTsgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTsgcmV0dXJuIGNoaWxkOyB9LFxuICBoYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHk7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5BYnN0cmFjdF9MYXp5X0xvYWRlciA9IHJlcXVpcmUoJy4vQWJzdHJhY3RfTGF6eV9Mb2FkZXInKTtcblxuX19XSU5ET1cgPSByZXF1aXJlKCcuLi9nbG9iYWwvV2luZG93Jyk7XG5cbkxhenlfTWFzb25yeSA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gIGV4dGVuZChMYXp5X01hc29ucnksIHN1cGVyQ2xhc3MpO1xuXG4gIGZ1bmN0aW9uIExhenlfTWFzb25yeSgpIHtcbiAgICB0aGlzLmxvYWRfaXRlbXNfaW5fdmlldyA9IGJpbmQodGhpcy5sb2FkX2l0ZW1zX2luX3ZpZXcsIHRoaXMpO1xuICAgIHRoaXMuYXV0b2xvYWQgPSBiaW5kKHRoaXMuYXV0b2xvYWQsIHRoaXMpO1xuICAgIHRoaXMuZGVib3VuY2VkX2xvYWRfaXRlbXNfaW5fdmlldyA9IF8uZGVib3VuY2UodGhpcy5sb2FkX2l0ZW1zX2luX3ZpZXcsIDUwKTtcbiAgICBMYXp5X01hc29ucnkuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmNhbGwodGhpcyk7XG4gIH1cblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbS4kZWwuY3NzKHtcbiAgICAgICdtaW4taGVpZ2h0JzogTWF0aC5mbG9vcih0aGlzLmdldF93aWR0aCgpIC8gaXRlbS5kYXRhLmdldF9yYXRpbygpKVxuICAgIH0pO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUuZ2V0X3dpZHRoID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICQoJy5QUF9NYXNvbnJ5X19zaXplcicpLndpZHRoKCk7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5hdXRvbG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmxvYWRfaXRlbXNfaW5fdmlldygpO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICB2YXIgJGltYWdlLCBmdWxsLCB0aHVtYjtcbiAgICB0aHVtYiA9IGl0ZW0uZGF0YS5nZXRfdXJsKCd0aHVtYicpO1xuICAgIGZ1bGwgPSBpdGVtLmRhdGEuZ2V0X3VybCgnZnVsbCcpO1xuICAgIGl0ZW0uJGVsLnByZXBlbmQoXCI8YSBjbGFzcz1cXFwiXCIgKyB0aGlzLkVsZW1lbnRzLmxpbmsgKyBcIlxcXCIgaHJlZj1cXFwiXCIgKyBmdWxsICsgXCJcXFwiIHJlbD1cXFwiZ2FsbGVyeVxcXCI+XFxuPGltZyBjbGFzcz1cXFwiXCIgKyB0aGlzLkVsZW1lbnRzLmltYWdlICsgXCJcXFwiIHNyYz1cXFwiXCIgKyB0aHVtYiArIFwiXFxcIiBjbGFzcz1cXFwiUFBfSlNfX2xvYWRpbmdcXFwiIC8+XFxuPC9hPlwiKS5yZW1vdmVDbGFzcygnTGF6eS1JbWFnZScpO1xuICAgIGl0ZW0ubG9hZGVkID0gdHJ1ZTtcbiAgICAkaW1hZ2UgPSBpdGVtLiRlbC5maW5kKCdpbWcnKTtcbiAgICByZXR1cm4gJGltYWdlLmltYWdlc0xvYWRlZCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgJGltYWdlLmFkZENsYXNzKCdQUF9KU19fbG9hZGVkJykucmVtb3ZlQ2xhc3MoJ1BQX0pTX19sb2FkaW5nJyk7XG4gICAgICAgIHJldHVybiBpdGVtLiRlbC5jc3MoJ21pbi1oZWlnaHQnLCAnJykucmVtb3ZlQ2xhc3MoX3RoaXMuRWxlbWVudHMuaXRlbSkuZmluZChcIi5cIiArIF90aGlzLkVsZW1lbnRzLnBsYWNlaG9sZGVyKS5mYWRlT3V0KDQwMCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuICQodGhpcykucmVtb3ZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5sb2FkX2l0ZW1zX2luX3ZpZXcgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaSwgaXRlbSwga2V5LCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICByZWYgPSB0aGlzLkl0ZW1zO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGtleSA9IGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBrZXkgPSArK2kpIHtcbiAgICAgIGl0ZW0gPSByZWZba2V5XTtcbiAgICAgIGlmICghaXRlbS5sb2FkZWQgJiYgdGhpcy5pbl9sb29zZV92aWV3KGl0ZW0uZWwpKSB7XG4gICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLmxvYWQoaXRlbSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHZvaWQgMCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUuaW5fbG9vc2VfdmlldyA9IGZ1bmN0aW9uKGVsKSB7XG4gICAgdmFyIHJlY3QsIHNlbnNpdGl2aXR5O1xuICAgIGlmIChlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBzZW5zaXRpdml0eSA9IDEwMDtcbiAgICByZXR1cm4gcmVjdC50b3AgKyByZWN0LmhlaWdodCA+PSAtc2Vuc2l0aXZpdHkgJiYgcmVjdC5ib3R0b20gLSByZWN0LmhlaWdodCA8PSBfX1dJTkRPVy5oZWlnaHQgKyBzZW5zaXRpdml0eSAmJiByZWN0LmxlZnQgKyByZWN0LndpZHRoID49IC1zZW5zaXRpdml0eSAmJiByZWN0LnJpZ2h0IC0gcmVjdC53aWR0aCA8PSBfX1dJTkRPVy53aWR0aCArIHNlbnNpdGl2aXR5O1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUuYXR0YWNoX2V2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICQod2luZG93KS5vbignc2Nyb2xsJywgdGhpcy5kZWJvdW5jZWRfbG9hZF9pdGVtc19pbl92aWV3KTtcbiAgICByZXR1cm4gTGF6eV9NYXNvbnJ5Ll9fc3VwZXJfXy5hdHRhY2hfZXZlbnRzLmNhbGwodGhpcyk7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5kZXRhY2hfZXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgJCh3aW5kb3cpLm9mZignc2Nyb2xsJywgdGhpcy5kZWJvdW5jZWRfbG9hZF9pdGVtc19pbl92aWV3KTtcbiAgICByZXR1cm4gTGF6eV9NYXNvbnJ5Ll9fc3VwZXJfXy5kZXRhY2hfZXZlbnRzLmNhbGwodGhpcyk7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGksIGl0ZW0sIGtleSwgbGVuLCByZWY7XG4gICAgcmVmID0gdGhpcy5JdGVtcztcbiAgICBmb3IgKGtleSA9IGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBrZXkgPSArK2kpIHtcbiAgICAgIGl0ZW0gPSByZWZba2V5XTtcbiAgICAgIGl0ZW0uJGVsLmNzcygnbWluLWhlaWdodCcsICcnKTtcbiAgICB9XG4gICAgcmV0dXJuIExhenlfTWFzb25yeS5fX3N1cGVyX18uZGVzdHJveS5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIHJldHVybiBMYXp5X01hc29ucnk7XG5cbn0pKEFic3RyYWN0X0xhenlfTG9hZGVyKTtcblxubW9kdWxlLmV4cG9ydHMgPSBMYXp5X01hc29ucnk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVRHRjZlVjlOWVhOdmJuSjVMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaVRHRjZlVjlOWVhOdmJuSjVMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRU3hKUVVGQkxDdERRVUZCTzBWQlFVRTdPenM3UVVGQlFTeERRVUZCTEVkQlFVa3NUMEZCUVN4RFFVRlRMRkZCUVZRN08wRkJRMG9zYjBKQlFVRXNSMEZCZFVJc1QwRkJRU3hEUVVGVExIZENRVUZVT3p0QlFVTjJRaXhSUVVGQkxFZEJRVmNzVDBGQlFTeERRVUZUTEd0Q1FVRlVPenRCUVVWTU96czdSVUZGVVN4elFrRkJRVHM3TzBsQlExb3NTVUZCUXl4RFFVRkJMRFJDUVVGRUxFZEJRV2RETEVOQlFVTXNRMEZCUXl4UlFVRkdMRU5CUVZrc1NVRkJReXhEUVVGQkxHdENRVUZpTEVWQlFXbERMRVZCUVdwRE8wbEJRMmhETERSRFFVRkJPMFZCUmxrN08zbENRVXRpTEUxQlFVRXNSMEZCVVN4VFFVRkZMRWxCUVVZN1YwRkRVQ3hKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEVkQlFWUXNRMEZCWVR0TlFVRkJMRmxCUVVFc1JVRkJZeXhKUVVGSkxFTkJRVU1zUzBGQlRDeERRVUZaTEVsQlFVTXNRMEZCUVN4VFFVRkVMRU5CUVVFc1EwRkJRU3hIUVVGbExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNVMEZCVml4RFFVRkJMRU5CUVROQ0xFTkJRV1E3UzBGQllqdEZRVVJQT3p0NVFrRkpVaXhUUVVGQkxFZEJRVmNzVTBGQlFUdFhRVVZXTEVOQlFVRXNRMEZCUnl4dlFrRkJTQ3hEUVVGNVFpeERRVUZETEV0QlFURkNMRU5CUVVFN1JVRkdWVHM3ZVVKQlRWZ3NVVUZCUVN4SFFVRlZMRk5CUVVFN1YwRkJSeXhKUVVGRExFTkJRVUVzYTBKQlFVUXNRMEZCUVR0RlFVRklPenQ1UWtGSlZpeEpRVUZCTEVkQlFVMHNVMEZCUlN4SlFVRkdPMEZCUlV3c1VVRkJRVHRKUVVGQkxFdEJRVUVzUjBGQlVTeEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVZZc1EwRkJiVUlzVDBGQmJrSTdTVUZEVWl4SlFVRkJMRWRCUVU4c1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZXTEVOQlFXMUNMRTFCUVc1Q08wbEJSVkFzU1VGQlNTeERRVUZETEVkQlEwd3NRMEZCUXl4UFFVUkVMRU5CUTFVc1lVRkJRU3hIUVVOSkxFbEJRVU1zUTBGQlFTeFJRVUZSTEVOQlFVTXNTVUZFWkN4SFFVTnRRaXhaUVVSdVFpeEhRVU0yUWl4SlFVUTNRaXhIUVVOclF5eHZRMEZFYkVNc1IwRkZUU3hKUVVGRExFTkJRVUVzVVVGQlVTeERRVUZETEV0QlJtaENMRWRCUlhOQ0xGZEJSblJDTEVkQlJTdENMRXRCUmk5Q0xFZEJSWEZETEhORFFVZ3ZReXhEUVUxQkxFTkJRVU1zVjBGT1JDeERRVTFqTEZsQlRtUTdTVUZSUVN4SlFVRkpMRU5CUVVNc1RVRkJUQ3hIUVVGak8wbEJRMlFzVFVGQlFTeEhRVUZUTEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1NVRkJWQ3hEUVVGbExFdEJRV1k3VjBGRFZDeE5RVUZOTEVOQlFVTXNXVUZCVUN4RFFVRnZRaXhEUVVGQkxGTkJRVUVzUzBGQlFUdGhRVUZCTEZOQlFVRTdVVUZGYmtJc1RVRkJUU3hEUVVGRExGRkJRVkFzUTBGQmFVSXNaVUZCYWtJc1EwRkJhME1zUTBGQlF5eFhRVUZ1UXl4RFFVRm5SQ3huUWtGQmFFUTdaVUZEUVN4SlFVRkpMRU5CUVVNc1IwRkRUQ3hEUVVGRExFZEJSRVFzUTBGRFRTeFpRVVJPTEVWQlEyOUNMRVZCUkhCQ0xFTkJSVUVzUTBGQlF5eFhRVVpFTEVOQlJXTXNTMEZCUXl4RFFVRkJMRkZCUVZFc1EwRkJReXhKUVVaNFFpeERRVWRCTEVOQlFVTXNTVUZJUkN4RFFVZFBMRWRCUVVFc1IwRkJTU3hMUVVGRExFTkJRVUVzVVVGQlVTeERRVUZETEZkQlNISkNMRU5CU1VFc1EwRkJReXhQUVVwRUxFTkJTVk1zUjBGS1ZDeEZRVWxqTEZOQlFVRTdhVUpCUVVjc1EwRkJRU3hEUVVGSExFbEJRVWdzUTBGQlV5eERRVUZETEUxQlFWWXNRMEZCUVR0UlFVRklMRU5CU21RN1RVRkliVUk3U1VGQlFTeERRVUZCTEVOQlFVRXNRMEZCUVN4SlFVRkJMRU5CUVhCQ08wVkJaa3M3TzNsQ1FUUkNUaXhyUWtGQlFTeEhRVUZ2UWl4VFFVRkJPMEZCUTI1Q0xGRkJRVUU3UVVGQlFUdEJRVUZCTzFOQlFVRXNhVVJCUVVFN08wMUJRME1zU1VGQlJ5eERRVUZKTEVsQlFVa3NRMEZCUXl4TlFVRlVMRWxCUVc5Q0xFbEJRVU1zUTBGQlFTeGhRVUZFTEVOQlFXZENMRWxCUVVrc1EwRkJReXhGUVVGeVFpeERRVUYyUWp0eFFrRkRReXhKUVVGRExFTkJRVUVzU1VGQlJDeERRVUZQTEVsQlFWQXNSMEZFUkR0UFFVRkJMRTFCUVVFN05rSkJRVUU3TzBGQlJFUTdPMFZCUkcxQ096dDVRa0ZQY0VJc1lVRkJRU3hIUVVGbExGTkJRVVVzUlVGQlJqdEJRVU5rTEZGQlFVRTdTVUZCUVN4SlFVRnRRaXhuUTBGQmJrSTdRVUZCUVN4aFFVRlBMRXRCUVZBN08wbEJRMEVzU1VGQlFTeEhRVUZQTEVWQlFVVXNRMEZCUXl4eFFrRkJTQ3hEUVVGQk8wbEJSMUFzVjBGQlFTeEhRVUZqTzBGQlEyUXNWMEZGUXl4SlFVRkpMRU5CUVVNc1IwRkJUQ3hIUVVGWExFbEJRVWtzUTBGQlF5eE5RVUZvUWl4SlFVRXdRaXhEUVVGRExGZEJRVE5DTEVsQlEwTXNTVUZCU1N4RFFVRkRMRTFCUVV3c1IwRkJZeXhKUVVGSkxFTkJRVU1zVFVGQmJrSXNTVUZCTmtJc1VVRkJVU3hEUVVGRExFMUJRVlFzUjBGQmEwSXNWMEZFYUVRc1NVRkpReXhKUVVGSkxFTkJRVU1zU1VGQlRDeEhRVUZaTEVsQlFVa3NRMEZCUXl4TFFVRnFRaXhKUVVFd1FpeERRVUZETEZkQlNqVkNMRWxCUzBNc1NVRkJTU3hEUVVGRExFdEJRVXdzUjBGQllTeEpRVUZKTEVOQlFVTXNTMEZCYkVJc1NVRkJNa0lzVVVGQlVTeERRVUZETEV0QlFWUXNSMEZCYVVJN1JVRmlhRU03TzNsQ1FXbENaaXhoUVVGQkxFZEJRV1VzVTBGQlFUdEpRVU5rTEVOQlFVRXNRMEZCUnl4TlFVRklMRU5CUVZjc1EwRkJReXhGUVVGYUxFTkJRV1VzVVVGQlppeEZRVUY1UWl4SlFVRkRMRU5CUVVFc05FSkJRVEZDTzFkQlEwRXNPRU5CUVVFN1JVRkdZenM3ZVVKQlNXWXNZVUZCUVN4SFFVRmxMRk5CUVVFN1NVRkRaQ3hEUVVGQkxFTkJRVWNzVFVGQlNDeERRVUZYTEVOQlFVTXNSMEZCV2l4RFFVRm5RaXhSUVVGb1FpeEZRVUV3UWl4SlFVRkRMRU5CUVVFc05FSkJRVE5DTzFkQlEwRXNPRU5CUVVFN1JVRkdZenM3ZVVKQlNXWXNUMEZCUVN4SFFVRlRMRk5CUVVFN1FVRkRVaXhSUVVGQk8wRkJRVUU3UVVGQlFTeFRRVUZCTEdsRVFVRkJPenROUVVORExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNSMEZCVkN4RFFVRmhMRmxCUVdJc1JVRkJNa0lzUlVGQk0wSTdRVUZFUkR0WFFVZEJMSGREUVVGQk8wVkJTbEU3T3pzN1IwRnFSbWxDT3p0QlFYVkdNMElzVFVGQlRTeERRVUZETEU5QlFWQXNSMEZCYVVJaWZRPT1cbiIsInZhciAkLCBIb29rcywgTGF6eV9NYXNvbnJ5LCBQb3J0Zm9saW9fTWFzb25yeSwgaW5pdF9sYXp5X2xvYWRlciwgaW5pdF9tYXNvbnJ5LCBpc19tYXNvbnJ5LCBsYXp5X2luc3RhbmNlO1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuUG9ydGZvbGlvX01hc29ucnkgPSByZXF1aXJlKCcuL3BvcnRmb2xpby9Qb3J0Zm9saW9fTWFzb25yeScpO1xuXG5MYXp5X01hc29ucnkgPSByZXF1aXJlKCcuL2xhenkvTGF6eV9NYXNvbnJ5Jyk7XG5cbmxhenlfaW5zdGFuY2UgPSBmYWxzZTtcblxuaXNfbWFzb25yeSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gJCgnLlBQX01hc29ucnknKS5sZW5ndGggPiAwO1xufTtcblxuXG4vKlxuXHRJbml0aWFsaXplIE1hc29ucnlcbiAqL1xuXG5pbml0X21hc29ucnkgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCFpc19tYXNvbnJ5KCkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgcmV0dXJuIG5ldyBQb3J0Zm9saW9fTWFzb25yeSgkKGRvY3VtZW50KSk7XG59O1xuXG5pbml0X2xhenlfbG9hZGVyID0gZnVuY3Rpb24oKSB7XG4gIGlmICghaXNfbWFzb25yeSgpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChsYXp5X2luc3RhbmNlKSB7XG4gICAgbGF6eV9pbnN0YW5jZS5kZXN0cm95KCk7XG4gIH1cbiAgcmV0dXJuIGxhenlfaW5zdGFuY2UgPSBuZXcgKEhvb2tzLmFwcGx5RmlsdGVycygncHAubGF6eS5oYW5kbGVyJywgTGF6eV9NYXNvbnJ5KSk7XG59O1xuXG5cbi8qXG5cdFNldHVwIEV2ZW50c1xuICovXG5cbkhvb2tzLmFkZEFjdGlvbigncHAuY29yZS5yZWFkeScsIGluaXRfbWFzb25yeSk7XG5cbkhvb2tzLmFkZEFjdGlvbigncHAucG9ydGZvbGlvLnByZXBhcmUnLCBpbml0X2xhenlfbG9hZGVyLCAxMDApO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3BwLnBvcnRmb2xpby5kZXN0cm95JywgZnVuY3Rpb24oKSB7XG4gIGxhenlfaW5zdGFuY2UuZGVzdHJveSgpO1xuICByZXR1cm4gbGF6eV9pbnN0YW5jZSA9IG51bGw7XG59KTtcblxuSG9va3MuYWRkQWN0aW9uKCdwcC5wb3J0Zm9saW8ucmVmcmVzaCcsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4gSG9va3MuZG9BY3Rpb24oJ3BwLmxhenkuYXV0b2xvYWQnKTtcbn0pO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2liV0Z6YjI1eWVTNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSW0xaGMyOXVjbmt1WTI5bVptVmxJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSkJRVUZCTEVsQlFVRTdPMEZCUVVFc1EwRkJRU3hIUVVGSkxFOUJRVUVzUTBGQlV5eFJRVUZVT3p0QlFVTktMRXRCUVVFc1IwRkJVU3hQUVVGQkxFTkJRVk1zVlVGQlZEczdRVUZEVWl4cFFrRkJRU3hIUVVGdlFpeFBRVUZCTEVOQlFWTXNLMEpCUVZRN08wRkJRM0JDTEZsQlFVRXNSMEZCWlN4UFFVRkJMRU5CUVZNc2NVSkJRVlE3TzBGQlJXWXNZVUZCUVN4SFFVRm5RanM3UVVGRmFFSXNWVUZCUVN4SFFVRmhMRk5CUVVFN1UwRkJSeXhEUVVGQkxFTkJRVWNzWVVGQlNDeERRVUZyUWl4RFFVRkRMRTFCUVc1Q0xFZEJRVFJDTzBGQlFTOUNPenM3UVVGSFlqczdPenRCUVVkQkxGbEJRVUVzUjBGQlpTeFRRVUZCTzBWQlEyUXNTVUZCVlN4RFFVRkpMRlZCUVVFc1EwRkJRU3hEUVVGa08wRkJRVUVzVjBGQlFUczdVMEZKU1N4SlFVRkJMR2xDUVVGQkxFTkJRVzFDTEVOQlFVRXNRMEZCUnl4UlFVRklMRU5CUVc1Q08wRkJURlU3TzBGQlVXWXNaMEpCUVVFc1IwRkJiVUlzVTBGQlFUdEZRVU5zUWl4SlFVRlZMRU5CUVVrc1ZVRkJRU3hEUVVGQkxFTkJRV1E3UVVGQlFTeFhRVUZCT3p0RlFVVkJMRWxCUVVjc1lVRkJTRHRKUVVORExHRkJRV0VzUTBGQlF5eFBRVUZrTEVOQlFVRXNSVUZFUkRzN1UwRkxRU3hoUVVGQkxFZEJRV2RDTEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1dVRkJUaXhEUVVGdFFpeHBRa0ZCYmtJc1JVRkJjME1zV1VGQmRFTXNRMEZCUkR0QlFWSkdPenM3UVVGWGJrSTdPenM3UVVGSFFTeExRVUZMTEVOQlFVTXNVMEZCVGl4RFFVRm5RaXhsUVVGb1FpeEZRVUZwUXl4WlFVRnFRenM3UVVGSFFTeExRVUZMTEVOQlFVTXNVMEZCVGl4RFFVRm5RaXh6UWtGQmFFSXNSVUZCZDBNc1owSkJRWGhETEVWQlFUQkVMRWRCUVRGRU96dEJRVU5CTEV0QlFVc3NRMEZCUXl4VFFVRk9MRU5CUVdkQ0xITkNRVUZvUWl4RlFVRjNReXhUUVVGQk8wVkJRM1pETEdGQlFXRXNRMEZCUXl4UFFVRmtMRU5CUVVFN1UwRkRRU3hoUVVGQkxFZEJRV2RDTzBGQlJuVkNMRU5CUVhoRE96dEJRVTFCTEV0QlFVc3NRMEZCUXl4VFFVRk9MRU5CUVdkQ0xITkNRVUZvUWl4RlFVRjNReXhUUVVGQk8xTkJRM1pETEV0QlFVc3NRMEZCUXl4UlFVRk9MRU5CUVdVc2EwSkJRV1k3UVVGRWRVTXNRMEZCZUVNaWZRPT1cbiIsIlxuLypcbiAgICBEZXBlbmRlbmNpZXNcbiAqL1xudmFyICQsIEhvb2tzLCBQb3J0Zm9saW9fQWN0aW9ucywgUG9ydGZvbGlvX01hc29ucnksXG4gIGJpbmQgPSBmdW5jdGlvbihmbiwgbWUpeyByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuIGZuLmFwcGx5KG1lLCBhcmd1bWVudHMpOyB9OyB9LFxuICBleHRlbmQgPSBmdW5jdGlvbihjaGlsZCwgcGFyZW50KSB7IGZvciAodmFyIGtleSBpbiBwYXJlbnQpIHsgaWYgKGhhc1Byb3AuY2FsbChwYXJlbnQsIGtleSkpIGNoaWxkW2tleV0gPSBwYXJlbnRba2V5XTsgfSBmdW5jdGlvbiBjdG9yKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gY2hpbGQ7IH0gY3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlOyBjaGlsZC5wcm90b3R5cGUgPSBuZXcgY3RvcigpOyBjaGlsZC5fX3N1cGVyX18gPSBwYXJlbnQucHJvdG90eXBlOyByZXR1cm4gY2hpbGQ7IH0sXG4gIGhhc1Byb3AgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cblBvcnRmb2xpb19BY3Rpb25zID0gcmVxdWlyZSgnLi8uLi9jbGFzcy9BYnN0cmFjdF9Qb3J0Zm9saW9fQWN0aW9ucycpO1xuXG5Qb3J0Zm9saW9fTWFzb25yeSA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gIGV4dGVuZChQb3J0Zm9saW9fTWFzb25yeSwgc3VwZXJDbGFzcyk7XG5cbiAgZnVuY3Rpb24gUG9ydGZvbGlvX01hc29ucnkoKSB7XG4gICAgdGhpcy5yZWZyZXNoID0gYmluZCh0aGlzLnJlZnJlc2gsIHRoaXMpO1xuICAgIHRoaXMuZGVzdHJveSA9IGJpbmQodGhpcy5kZXN0cm95LCB0aGlzKTtcbiAgICB0aGlzLmNyZWF0ZSA9IGJpbmQodGhpcy5jcmVhdGUsIHRoaXMpO1xuICAgIHRoaXMucHJlcGFyZSA9IGJpbmQodGhpcy5wcmVwYXJlLCB0aGlzKTtcbiAgICByZXR1cm4gUG9ydGZvbGlvX01hc29ucnkuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUuRWxlbWVudHMgPSB7XG4gICAgY29udGFpbmVyOiAnUFBfTWFzb25yeScsXG4gICAgc2l6ZXI6ICdQUF9NYXNvbnJ5X19zaXplcicsXG4gICAgaXRlbTogJ1BQX01hc29ucnlfX2l0ZW0nXG4gIH07XG5cblxuICAvKlxuICBcdFx0SW5pdGlhbGl6ZVxuICAgKi9cblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCRwYXJlbnQpIHtcbiAgICByZXR1cm4gdGhpcy4kY29udGFpbmVyID0gJHBhcmVudC5maW5kKFwiLlwiICsgdGhpcy5FbGVtZW50cy5jb250YWluZXIpO1xuICB9O1xuXG5cbiAgLypcbiAgXHRcdFByZXBhcmUgJiBBdHRhY2ggRXZlbnRzXG4gICAgIFx0RG9uJ3Qgc2hvdyBhbnl0aGluZyB5ZXQuXG4gIFxuICBcdFx0QGNhbGxlZCBvbiBob29rIGBwcC5wb3J0Zm9saW8ucHJlcGFyZWBcbiAgICovXG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLnByZXBhcmUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbWFzb25yeV9zZXR0aW5ncztcbiAgICBpZiAodGhpcy4kY29udGFpbmVyLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLiRjb250YWluZXIuYWRkQ2xhc3MoJ1BQX0pTX19sb2FkaW5nX21hc29ucnknKTtcbiAgICB0aGlzLm1heWJlX2NyZWF0ZV9zaXplcigpO1xuICAgIG1hc29ucnlfc2V0dGluZ3MgPSBIb29rcy5hcHBseUZpbHRlcnMoJ3BwLm1hc29ucnkuc2V0dGluZ3MnLCB7XG4gICAgICBpdGVtU2VsZWN0b3I6IFwiLlwiICsgdGhpcy5FbGVtZW50cy5pdGVtLFxuICAgICAgY29sdW1uV2lkdGg6IFwiLlwiICsgdGhpcy5FbGVtZW50cy5zaXplcixcbiAgICAgIGd1dHRlcjogMCxcbiAgICAgIGluaXRMYXlvdXQ6IGZhbHNlXG4gICAgfSk7XG4gICAgdGhpcy4kY29udGFpbmVyLm1hc29ucnkobWFzb25yeV9zZXR0aW5ncyk7XG4gICAgcmV0dXJuIHRoaXMuJGNvbnRhaW5lci5tYXNvbnJ5KCdvbmNlJywgJ2xheW91dENvbXBsZXRlJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIF90aGlzLiRjb250YWluZXIucmVtb3ZlQ2xhc3MoJ1BQX0pTX19sb2FkaW5nX21hc29ucnknKS5hZGRDbGFzcygnUFBfSlNfX2xvYWRpbmdfY29tcGxldGUnKTtcbiAgICAgICAgcmV0dXJuIEhvb2tzLmRvQWN0aW9uKCdwcC5wb3J0Zm9saW8ucmVmcmVzaCcpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH07XG5cblxuICAvKlxuICBcdFx0U3RhcnQgdGhlIFBvcnRmb2xpb1xuICBcdFx0QGNhbGxlZCBvbiBob29rIGBwcC5wb3J0Zm9saW8uY3JlYXRlYFxuICAgKi9cblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kY29udGFpbmVyLm1hc29ucnkoKTtcbiAgfTtcblxuXG4gIC8qXG4gIFx0XHREZXN0cm95XG4gIFx0XHRAY2FsbGVkIG9uIGhvb2sgYHBwLnBvcnRmb2xpby5kZXN0cm95YFxuICAgKi9cblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMubWF5YmVfcmVtb3ZlX3NpemVyKCk7XG4gICAgaWYgKHRoaXMuJGNvbnRhaW5lci5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLiRjb250YWluZXIubWFzb25yeSgnZGVzdHJveScpO1xuICAgIH1cbiAgfTtcblxuXG4gIC8qXG4gIFx0XHRSZWxvYWQgdGhlIGxheW91dFxuICBcdFx0QGNhbGxlZCBvbiBob29rIGBwcC5wb3J0Zm9saW8ucmVmcmVzaGBcbiAgICovXG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy4kY29udGFpbmVyLm1hc29ucnkoJ2xheW91dCcpO1xuICB9O1xuXG5cbiAgLypcbiAgXHRcdENyZWF0ZSBhIHNpemVyIGVsZW1lbnQgZm9yIGpxdWVyeS1tYXNvbnJ5IHRvIHVzZVxuICAgKi9cblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUubWF5YmVfY3JlYXRlX3NpemVyID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuc2l6ZXJfZG9lc250X2V4aXN0KCkpIHtcbiAgICAgIHRoaXMuY3JlYXRlX3NpemVyKCk7XG4gICAgfVxuICB9O1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5tYXliZV9yZW1vdmVfc2l6ZXIgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy4kY29udGFpbmVyLmxlbmd0aCAhPT0gMSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLiRjb250YWluZXIuZmluZChcIi5cIiArIHRoaXMuRWxlbWVudHMuc2l6ZXIpLnJlbW92ZSgpO1xuICB9O1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5zaXplcl9kb2VzbnRfZXhpc3QgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy4kY29udGFpbmVyLmZpbmQoXCIuXCIgKyB0aGlzLkVsZW1lbnRzLnNpemVyKS5sZW5ndGggPT09IDA7XG4gIH07XG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLmNyZWF0ZV9zaXplciA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJGNvbnRhaW5lci5hcHBlbmQoXCI8ZGl2IGNsYXNzPVxcXCJcIiArIHRoaXMuRWxlbWVudHMuc2l6ZXIgKyBcIlxcXCI+PC9kaXY+XCIpO1xuICB9O1xuXG4gIHJldHVybiBQb3J0Zm9saW9fTWFzb25yeTtcblxufSkoUG9ydGZvbGlvX0FjdGlvbnMpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBvcnRmb2xpb19NYXNvbnJ5O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lVRzl5ZEdadmJHbHZYMDFoYzI5dWNua3Vhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lKUWIzSjBabTlzYVc5ZlRXRnpiMjV5ZVM1amIyWm1aV1VpWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanRCUVVGQk96czdRVUZCUVN4SlFVRkJMRGhEUVVGQk8wVkJRVUU3T3pzN1FVRkhRU3hEUVVGQkxFZEJRVWtzVDBGQlFTeERRVUZUTEZGQlFWUTdPMEZCUTBvc1MwRkJRU3hIUVVGUkxFOUJRVUVzUTBGQlV5eFZRVUZVT3p0QlFVTlNMR2xDUVVGQkxFZEJRVzlDTEU5QlFVRXNRMEZCVXl4MVEwRkJWRHM3UVVGSFpEczdPenM3T3pzN096czdPRUpCUlV3c1VVRkJRU3hIUVVORE8wbEJRVUVzVTBGQlFTeEZRVUZYTEZsQlFWZzdTVUZEUVN4TFFVRkJMRVZCUVZjc2JVSkJSRmc3U1VGRlFTeEpRVUZCTEVWQlFWY3NhMEpCUmxnN096czdRVUZKUkRzN096czRRa0ZIUVN4VlFVRkJMRWRCUVZrc1UwRkJSU3hQUVVGR08xZEJRMWdzU1VGQlF5eERRVUZCTEZWQlFVUXNSMEZCWXl4UFFVRlBMRU5CUVVNc1NVRkJVaXhEUVVGakxFZEJRVUVzUjBGQlNTeEpRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRk5CUVRWQ08wVkJSRWc3T3p0QlFVZGFPenM3T3pzN096aENRVTFCTEU5QlFVRXNSMEZCVXl4VFFVRkJPMEZCUTFJc1VVRkJRVHRKUVVGQkxFbEJRVlVzU1VGQlF5eERRVUZCTEZWQlFWVXNRMEZCUXl4TlFVRmFMRXRCUVhOQ0xFTkJRV2hETzBGQlFVRXNZVUZCUVRzN1NVRkZRU3hKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEZGQlFWb3NRMEZCYzBJc2QwSkJRWFJDTzBsQlJVRXNTVUZCUXl4RFFVRkJMR3RDUVVGRUxFTkJRVUU3U1VGSFFTeG5Ra0ZCUVN4SFFVRnRRaXhMUVVGTExFTkJRVU1zV1VGQlRpeERRVUZ0UWl4eFFrRkJia0lzUlVGRGJFSTdUVUZCUVN4WlFVRkJMRVZCUVdNc1IwRkJRU3hIUVVGSkxFbEJRVU1zUTBGQlFTeFJRVUZSTEVOQlFVTXNTVUZCTlVJN1RVRkRRU3hYUVVGQkxFVkJRV01zUjBGQlFTeEhRVUZKTEVsQlFVTXNRMEZCUVN4UlFVRlJMRU5CUVVNc1MwRkVOVUk3VFVGRlFTeE5RVUZCTEVWQlFXTXNRMEZHWkR0TlFVZEJMRlZCUVVFc1JVRkJZeXhMUVVoa08wdEJSR3RDTzBsQlRXNUNMRWxCUVVNc1EwRkJRU3hWUVVGVkxFTkJRVU1zVDBGQldpeERRVUZ4UWl4blFrRkJja0k3VjBGRlFTeEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRTlCUVZvc1EwRkJiMElzVFVGQmNFSXNSVUZCTkVJc1owSkJRVFZDTEVWQlFUaERMRU5CUVVFc1UwRkJRU3hMUVVGQk8yRkJRVUVzVTBGQlFUdFJRVU0zUXl4TFFVRkRMRU5CUVVFc1ZVRkRRU3hEUVVGRExGZEJSRVlzUTBGRFpTeDNRa0ZFWml4RFFVVkRMRU5CUVVNc1VVRkdSaXhEUVVWWkxIbENRVVphTzJWQlRVRXNTMEZCU3l4RFFVRkRMRkZCUVU0c1EwRkJaU3h6UWtGQlpqdE5RVkEyUXp0SlFVRkJMRU5CUVVFc1EwRkJRU3hEUVVGQkxFbEJRVUVzUTBGQk9VTTdSVUZvUWxFN096dEJRVEJDVkRzN096czdPRUpCU1VFc1RVRkJRU3hIUVVGUkxGTkJRVUU3U1VGRFVDeEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRTlCUVZvc1EwRkJRVHRGUVVSUE96czdRVUZMVWpzN096czdPRUpCU1VFc1QwRkJRU3hIUVVGVExGTkJRVUU3U1VGRFVpeEpRVUZETEVOQlFVRXNhMEpCUVVRc1EwRkJRVHRKUVVWQkxFbEJRVWNzU1VGQlF5eERRVUZCTEZWQlFWVXNRMEZCUXl4TlFVRmFMRWRCUVhGQ0xFTkJRWGhDTzAxQlEwTXNTVUZCUXl4RFFVRkJMRlZCUVZVc1EwRkJReXhQUVVGYUxFTkJRWEZDTEZOQlFYSkNMRVZCUkVRN08wVkJTRkU3T3p0QlFWVlVPenM3T3pzNFFrRkpRU3hQUVVGQkxFZEJRVk1zVTBGQlFUdFhRVU5TTEVsQlFVTXNRMEZCUVN4VlFVRlZMRU5CUVVNc1QwRkJXaXhEUVVGeFFpeFJRVUZ5UWp0RlFVUlJPenM3UVVGTFZEczdPenM0UWtGSFFTeHJRa0ZCUVN4SFFVRnZRaXhUUVVGQk8wbEJRMjVDTEVsQlFXMUNMRWxCUVVNc1EwRkJRU3hyUWtGQlJDeERRVUZCTEVOQlFXNUNPMDFCUVVFc1NVRkJReXhEUVVGQkxGbEJRVVFzUTBGQlFTeEZRVUZCT3p0RlFVUnRRanM3T0VKQlNYQkNMR3RDUVVGQkxFZEJRVzlDTEZOQlFVRTdTVUZEYmtJc1NVRkJWU3hKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEUxQlFWb3NTMEZCZDBJc1EwRkJiRU03UVVGQlFTeGhRVUZCT3p0SlFVTkJMRWxCUVVNc1EwRkJRU3hWUVVGVkxFTkJRVU1zU1VGQldpeERRVUZyUWl4SFFVRkJMRWRCUVVrc1NVRkJReXhEUVVGQkxGRkJRVkVzUTBGQlF5eExRVUZvUXl4RFFVRjVReXhEUVVGRExFMUJRVEZETEVOQlFVRTdSVUZHYlVJN096aENRVXR3UWl4clFrRkJRU3hIUVVGdlFpeFRRVUZCTzFkQlFVY3NTVUZCUXl4RFFVRkJMRlZCUVZVc1EwRkJReXhKUVVGYUxFTkJRV3RDTEVkQlFVRXNSMEZCU1N4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExFdEJRV2hETEVOQlFYbERMRU5CUVVNc1RVRkJNVU1zUzBGQmIwUTdSVUZCZGtRN096aENRVWR3UWl4WlFVRkJMRWRCUVdNc1UwRkJRVHRKUVVOaUxFbEJRVU1zUTBGQlFTeFZRVUZWTEVOQlFVTXNUVUZCV2l4RFFVRnRRaXhsUVVGQkxFZEJRV2xDTEVsQlFVTXNRMEZCUVN4UlFVRlJMRU5CUVVNc1MwRkJNMElzUjBGQmFVTXNWMEZCY0VRN1JVRkVZVHM3T3p0SFFUVkdhVUk3TzBGQmEwZG9ReXhOUVVGTkxFTkJRVU1zVDBGQlVDeEhRVUZwUWlKOVxuIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgJCwgSG9va3MsIEl0ZW1fRGF0YSwgZ2V0X2RhdGE7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5JdGVtX0RhdGEgPSByZXF1aXJlKCcuLi9sYXp5L0l0ZW1fRGF0YScpO1xuXG5nZXRfZGF0YSA9IGZ1bmN0aW9uKGVsKSB7XG4gIHZhciAkY29udGFpbmVyLCAkZWwsICRpdGVtcywgaXRlbXM7XG4gICRlbCA9ICQoZWwpO1xuICAkY29udGFpbmVyID0gJGVsLmNsb3Nlc3QoJy5QUF9HYWxsZXJ5Jyk7XG4gICRpdGVtcyA9ICRjb250YWluZXIuZmluZCgnLlBQX0dhbGxlcnlfX2l0ZW0nKTtcbiAgaXRlbXMgPSAkaXRlbXMubWFwKGZ1bmN0aW9uKGtleSwgaXRlbSkge1xuICAgIHZhciBpO1xuICAgIGkgPSBuZXcgSXRlbV9EYXRhKCQoaXRlbSkpO1xuICAgIHJldHVybiB7XG4gICAgICBzcmM6IGkuZ2V0X3VybCgnZnVsbCcpLFxuICAgICAgdGh1bWI6IGkuZ2V0X3VybCgndGh1bWInKVxuICAgIH07XG4gIH0pO1xuICByZXR1cm4gaXRlbXM7XG59O1xuXG5cbi8qXG4gICAgQFRPRE86IE5lZWQgZGV0YWNoL2Rlc3Ryb3kgbWV0aG9kc1xuICovXG5cbkhvb2tzLmFkZEFjdGlvbigncHAuY29yZS5yZWFkeScsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4gJCgnLlBQX0dhbGxlcnlfX2l0ZW0nKS5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgdmFyICRlbDtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJGVsID0gJCh0aGlzKTtcbiAgICByZXR1cm4gJGVsLmxpZ2h0R2FsbGVyeSh7XG4gICAgICBkeW5hbWljOiB0cnVlLFxuICAgICAgZHluYW1pY0VsOiBnZXRfZGF0YSh0aGlzKSxcbiAgICAgIGluZGV4OiAkKCcuUFBfR2FsbGVyeV9faXRlbScpLmluZGV4KCRlbCksXG4gICAgICBzcGVlZDogMzUwLFxuICAgICAgcHJlbG9hZDogMyxcbiAgICAgIGRvd25sb2FkOiBmYWxzZVxuICAgIH0pO1xuICB9KTtcbn0pO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2ljRzl3ZFhBdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUp3YjNCMWNDNWpiMlptWldVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWp0QlFVRkJPenM3UVVGQlFTeEpRVUZCT3p0QlFVZEJMRU5CUVVFc1IwRkJTU3hQUVVGQkxFTkJRVk1zVVVGQlZEczdRVUZEU2l4TFFVRkJMRWRCUVZFc1QwRkJRU3hEUVVGVExGVkJRVlE3TzBGQlExSXNVMEZCUVN4SFFVRlpMRTlCUVVFc1EwRkJVeXh0UWtGQlZEczdRVUZGV2l4UlFVRkJMRWRCUVZjc1UwRkJSU3hGUVVGR08wRkJRMVlzVFVGQlFUdEZRVUZCTEVkQlFVRXNSMEZCVFN4RFFVRkJMRU5CUVVjc1JVRkJTRHRGUVVOT0xGVkJRVUVzUjBGQllTeEhRVUZITEVOQlFVTXNUMEZCU2l4RFFVRmhMR0ZCUVdJN1JVRkZZaXhOUVVGQkxFZEJRVk1zVlVGQlZTeERRVUZETEVsQlFWZ3NRMEZCYVVJc2JVSkJRV3BDTzBWQlJWUXNTMEZCUVN4SFFVRlJMRTFCUVUwc1EwRkJReXhIUVVGUUxFTkJRVmNzVTBGQlJTeEhRVUZHTEVWQlFVOHNTVUZCVUR0QlFVTnNRaXhSUVVGQk8wbEJRVUVzUTBGQlFTeEhRVUZSTEVsQlFVRXNVMEZCUVN4RFFVRlhMRU5CUVVFc1EwRkJSeXhKUVVGSUxFTkJRVmc3UVVGRlVpeFhRVUZQTzAxQlEwNHNSMEZCUVN4RlFVRlBMRU5CUVVNc1EwRkJReXhQUVVGR0xFTkJRVmNzVFVGQldDeERRVVJFTzAxQlJVNHNTMEZCUVN4RlFVRlBMRU5CUVVNc1EwRkJReXhQUVVGR0xFTkJRVmNzVDBGQldDeERRVVpFT3p0RlFVaFhMRU5CUVZnN1FVRlRVaXhUUVVGUE8wRkJaa2M3T3p0QlFXbENXRHM3T3p0QlFVZEJMRXRCUVVzc1EwRkJReXhUUVVGT0xFTkJRV2RDTEdWQlFXaENMRVZCUVdsRExGTkJRVUU3VTBGRmFFTXNRMEZCUVN4RFFVRkhMRzFDUVVGSUxFTkJRWGRDTEVOQlFVTXNSVUZCZWtJc1EwRkJORUlzVDBGQk5VSXNSVUZCY1VNc1UwRkJSU3hEUVVGR08wRkJRM0JETEZGQlFVRTdTVUZCUVN4RFFVRkRMRU5CUVVNc1kwRkJSaXhEUVVGQk8wbEJSMEVzUjBGQlFTeEhRVUZOTEVOQlFVRXNRMEZCUnl4SlFVRklPMWRCUjA0c1IwRkJSeXhEUVVGRExGbEJRVW9zUTBGRFF6dE5RVUZCTEU5QlFVRXNSVUZCVnl4SlFVRllPMDFCUTBFc1UwRkJRU3hGUVVGWExGRkJRVUVzUTBGQlZTeEpRVUZXTEVOQlJGZzdUVUZGUVN4TFFVRkJMRVZCUVZjc1EwRkJRU3hEUVVGSExHMUNRVUZJTEVOQlFYZENMRU5CUVVNc1MwRkJla0lzUTBGQkswSXNSMEZCTDBJc1EwRkdXRHROUVVkQkxFdEJRVUVzUlVGQlZ5eEhRVWhZTzAxQlNVRXNUMEZCUVN4RlFVRlhMRU5CU2xnN1RVRkxRU3hSUVVGQkxFVkJRVmNzUzBGTVdEdExRVVJFTzBWQlVHOURMRU5CUVhKRE8wRkJSbWRETEVOQlFXcERJbjA9XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
