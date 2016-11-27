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


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jbGFzcy9BYnN0cmFjdF9Qb3J0Zm9saW9fQWN0aW9ucy5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY2xhc3MvQ29yZS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY2xhc3MvUG9ydGZvbGlvLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9nbG9iYWwvV2luZG93LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0Fic3RyYWN0X0xhenlfTG9hZGVyLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0l0ZW1fRGF0YS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvbGF6eS9MYXp5X01hc29ucnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL21hc29ucnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL3BvcnRmb2xpby9Qb3J0Zm9saW9fTWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL3BvcHVwLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDeklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgQ29yZSwgSG9va3MsIFBvcnRmb2xpbztcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuQ29yZSA9IHJlcXVpcmUoJy4vY2xhc3MvQ29yZScpO1xuXG5Qb3J0Zm9saW8gPSByZXF1aXJlKCcuL2NsYXNzL1BvcnRmb2xpbycpO1xuXG5uZXcgQ29yZSgpO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3BwLmNvcmUucmVhZHknLCAoZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgUG9ydGZvbGlvKCk7XG59KSwgNTApO1xuXG5yZXF1aXJlKCcuL21hc29ucnknKTtcblxucmVxdWlyZSgnLi9wb3J0Zm9saW8vcG9wdXAnKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pWVhCd0xtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpWVhCd0xtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pTzBGQlFVRTdPenRCUVVGQkxFbEJRVUU3TzBGQlIwRXNTMEZCUVN4SFFVRlJMRTlCUVVFc1EwRkJVeXhWUVVGVU96dEJRVU5TTEVsQlFVRXNSMEZCVHl4UFFVRkJMRU5CUVZNc1kwRkJWRHM3UVVGRFVDeFRRVUZCTEVkQlFWa3NUMEZCUVN4RFFVRlRMRzFDUVVGVU96dEJRVWxTTEVsQlFVRXNTVUZCUVN4RFFVRkJPenRCUVVkS0xFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMR1ZCUVdoQ0xFVkJRV2xETEVOQlFVVXNVMEZCUVR0VFFVRlBMRWxCUVVFc1UwRkJRU3hEUVVGQk8wRkJRVkFzUTBGQlJpeERRVUZxUXl4RlFVRjVSQ3hGUVVGNlJEczdRVUZIUVN4UFFVRkJMRU5CUVZFc1YwRkJVanM3UVVGSFFTeFBRVUZCTEVOQlFWRXNiVUpCUVZJaWZRPT1cbiIsInZhciBBYnN0cmFjdF9Qb3J0Zm9saW9fQWN0aW9ucywgSG9va3M7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cblxuLypcblx0QWJzdHJhY3QgQ2xhc3MgUG9ydG9mbGlvX0V2ZW50X0ltZXBsZW1lbnRhdGlvblxuXG4gICAgSGFuZGxlcyBhbGwgdGhlIGV2ZW50cyByZXF1aXJlZCB0byBmdWxseSBoYW5kbGUgYSBwb3J0Zm9saW8gbGF5b3V0IHByb2Nlc3NcbiAqL1xuXG5BYnN0cmFjdF9Qb3J0Zm9saW9fQWN0aW9ucyA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gQWJzdHJhY3RfUG9ydGZvbGlvX0FjdGlvbnMoYXJncykge1xuICAgIHRoaXMuc2V0dXBfYWN0aW9ucygpO1xuICAgIHRoaXMuaW5pdGlhbGl6ZShhcmdzKTtcbiAgfVxuXG4gIEFic3RyYWN0X1BvcnRmb2xpb19BY3Rpb25zLnByb3RvdHlwZS5zZXR1cF9hY3Rpb25zID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MuYWRkQWN0aW9uKCdwcC5wb3J0Zm9saW8ucHJlcGFyZScsIHRoaXMucHJlcGFyZSwgNTApO1xuICAgIEhvb2tzLmFkZEFjdGlvbigncHAucG9ydGZvbGlvLmNyZWF0ZScsIHRoaXMuY3JlYXRlLCA1MCk7XG4gICAgSG9va3MuYWRkQWN0aW9uKCdwcC5wb3J0Zm9saW8ucmVmcmVzaCcsIHRoaXMucmVmcmVzaCwgNTApO1xuICAgIEhvb2tzLmFkZEFjdGlvbigncHAucG9ydGZvbGlvLmRlc3Ryb3knLCB0aGlzLmRlc3Ryb3ksIDUwKTtcbiAgICByZXR1cm4gSG9va3MuYWRkQWN0aW9uKCdwcC5wb3J0Zm9saW8uZGVzdHJveScsIHRoaXMucHVyZ2VfYWN0aW9ucywgMTAwKTtcbiAgfTtcblxuICBBYnN0cmFjdF9Qb3J0Zm9saW9fQWN0aW9ucy5wcm90b3R5cGUucHVyZ2VfYWN0aW9ucyA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLnJlbW92ZUFjdGlvbigncHAucG9ydGZvbGlvLmNyZWF0ZScsIHRoaXMucHJlcGFyZSwgNTApO1xuICAgIEhvb2tzLnJlbW92ZUFjdGlvbigncHAucG9ydGZvbGlvLmNyZWF0ZScsIHRoaXMuY3JlYXRlLCA1MCk7XG4gICAgSG9va3MucmVtb3ZlQWN0aW9uKCdwcC5wb3J0Zm9saW8ucmVmcmVzaCcsIHRoaXMucmVmcmVzaCwgNTApO1xuICAgIEhvb2tzLnJlbW92ZUFjdGlvbigncHAucG9ydGZvbGlvLmRlc3Ryb3knLCB0aGlzLmRlc3Ryb3ksIDUwKTtcbiAgICByZXR1cm4gSG9va3MucmVtb3ZlQWN0aW9uKCdwcC5wb3J0Zm9saW8uZGVzdHJveScsIHRoaXMucHVyZ2VfYWN0aW9ucywgMTAwKTtcbiAgfTtcblxuXG4gIC8qXG4gICAgIFx0UmVxdWlyZSB0aGVzZSBtZXRob2RzXG4gICAqL1xuXG4gIEFic3RyYWN0X1BvcnRmb2xpb19BY3Rpb25zLnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19BY3Rpb25zYCBtdXN0IGltcGxlbWVudCBgaW5pdGlhbGl6ZWAgbWV0aG9kXCIpO1xuICB9O1xuXG4gIEFic3RyYWN0X1BvcnRmb2xpb19BY3Rpb25zLnByb3RvdHlwZS5wcmVwYXJlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19BY3Rpb25zYCBtdXN0IGltcGxlbWVudCBgcHJlcGFyZWAgbWV0aG9kXCIpO1xuICB9O1xuXG4gIEFic3RyYWN0X1BvcnRmb2xpb19BY3Rpb25zLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0FjdGlvbnNgIG11c3QgaW1wbGVtZW50IGBjcmVhdGVgIG1ldGhvZFwiKTtcbiAgfTtcblxuICBBYnN0cmFjdF9Qb3J0Zm9saW9fQWN0aW9ucy5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fQWN0aW9uc2AgbXVzdCBpbXBsZW1lbnQgYHJlZnJlc2hgIG1ldGhvZFwiKTtcbiAgfTtcblxuICBBYnN0cmFjdF9Qb3J0Zm9saW9fQWN0aW9ucy5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fQWN0aW9uc2AgbXVzdCBpbXBsZW1lbnQgYGRlc3Ryb3lgIG1ldGhvZFwiKTtcbiAgfTtcblxuICByZXR1cm4gQWJzdHJhY3RfUG9ydGZvbGlvX0FjdGlvbnM7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gQWJzdHJhY3RfUG9ydGZvbGlvX0FjdGlvbnM7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVFXSnpkSEpoWTNSZlVHOXlkR1p2YkdsdlgwRmpkR2x2Ym5NdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUpCWW5OMGNtRmpkRjlRYjNKMFptOXNhVzlmUVdOMGFXOXVjeTVqYjJabVpXVWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklrRkJRVUVzU1VGQlFUczdRVUZCUVN4TFFVRkJMRWRCUVZFc1QwRkJRU3hEUVVGVExGVkJRVlE3T3p0QlFVZFNPenM3T3pzN1FVRkxUVHRGUVVWUkxHOURRVUZGTEVsQlFVWTdTVUZEV2l4SlFVRkRMRU5CUVVFc1lVRkJSQ3hEUVVGQk8wbEJRMEVzU1VGQlF5eERRVUZCTEZWQlFVUXNRMEZCWVN4SlFVRmlPMFZCUmxrN08zVkRRVWxpTEdGQlFVRXNSMEZCWlN4VFFVRkJPMGxCUTJRc1MwRkJTeXhEUVVGRExGTkJRVTRzUTBGQlowSXNjMEpCUVdoQ0xFVkJRWGRETEVsQlFVTXNRMEZCUVN4UFFVRjZReXhGUVVGclJDeEZRVUZzUkR0SlFVTkJMRXRCUVVzc1EwRkJReXhUUVVGT0xFTkJRV2RDTEhGQ1FVRm9RaXhGUVVGMVF5eEpRVUZETEVOQlFVRXNUVUZCZUVNc1JVRkJaMFFzUlVGQmFFUTdTVUZEUVN4TFFVRkxMRU5CUVVNc1UwRkJUaXhEUVVGblFpeHpRa0ZCYUVJc1JVRkJkME1zU1VGQlF5eERRVUZCTEU5QlFYcERMRVZCUVd0RUxFVkJRV3hFTzBsQlEwRXNTMEZCU3l4RFFVRkRMRk5CUVU0c1EwRkJaMElzYzBKQlFXaENMRVZCUVhkRExFbEJRVU1zUTBGQlFTeFBRVUY2UXl4RlFVRnJSQ3hGUVVGc1JEdFhRVU5CTEV0QlFVc3NRMEZCUXl4VFFVRk9MRU5CUVdkQ0xITkNRVUZvUWl4RlFVRjNReXhKUVVGRExFTkJRVUVzWVVGQmVrTXNSVUZCZDBRc1IwRkJlRVE3UlVGTVl6czdkVU5CVDJZc1lVRkJRU3hIUVVGbExGTkJRVUU3U1VGRFpDeExRVUZMTEVOQlFVTXNXVUZCVGl4RFFVRnRRaXh4UWtGQmJrSXNSVUZCTUVNc1NVRkJReXhEUVVGQkxFOUJRVE5ETEVWQlFXOUVMRVZCUVhCRU8wbEJRMEVzUzBGQlN5eERRVUZETEZsQlFVNHNRMEZCYlVJc2NVSkJRVzVDTEVWQlFUQkRMRWxCUVVNc1EwRkJRU3hOUVVFelF5eEZRVUZ0UkN4RlFVRnVSRHRKUVVOQkxFdEJRVXNzUTBGQlF5eFpRVUZPTEVOQlFXMUNMSE5DUVVGdVFpeEZRVUV5UXl4SlFVRkRMRU5CUVVFc1QwRkJOVU1zUlVGQmNVUXNSVUZCY2tRN1NVRkRRU3hMUVVGTExFTkJRVU1zV1VGQlRpeERRVUZ0UWl4elFrRkJia0lzUlVGQk1rTXNTVUZCUXl4RFFVRkJMRTlCUVRWRExFVkJRWEZFTEVWQlFYSkVPMWRCUTBFc1MwRkJTeXhEUVVGRExGbEJRVTRzUTBGQmJVSXNjMEpCUVc1Q0xFVkJRVEpETEVsQlFVTXNRMEZCUVN4aFFVRTFReXhGUVVFeVJDeEhRVUV6UkR0RlFVeGpPenM3UVVGUlpqczdPenQxUTBGSFFTeFZRVUZCTEVkQlFWa3NVMEZCUVR0QlFVRkhMRlZCUVZVc1NVRkJRU3hMUVVGQkxFTkJRVThzYlVaQlFWQTdSVUZCWWpzN2RVTkJRMW9zVDBGQlFTeEhRVUZaTEZOQlFVRTdRVUZCUnl4VlFVRlZMRWxCUVVFc1MwRkJRU3hEUVVGUExHZEdRVUZRTzBWQlFXSTdPM1ZEUVVOYUxFMUJRVUVzUjBGQldTeFRRVUZCTzBGQlFVY3NWVUZCVlN4SlFVRkJMRXRCUVVFc1EwRkJUeXdyUlVGQlVEdEZRVUZpT3p0MVEwRkRXaXhQUVVGQkxFZEJRVmtzVTBGQlFUdEJRVUZITEZWQlFWVXNTVUZCUVN4TFFVRkJMRU5CUVU4c1owWkJRVkE3UlVGQllqczdkVU5CUTFvc1QwRkJRU3hIUVVGWkxGTkJRVUU3UVVGQlJ5eFZRVUZWTEVsQlFVRXNTMEZCUVN4RFFVRlBMR2RHUVVGUU8wVkJRV0k3T3pzN096dEJRVVZpTEUxQlFVMHNRMEZCUXl4UFFVRlFMRWRCUVdsQ0luMD1cbiIsIlxuLypcbiAgICBEZXBlbmRlbmNpZXNcbiAqL1xudmFyICQsIENvcmUsIEhvb2tzLFxuICBiaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbkNvcmUgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIENvcmUoKSB7XG4gICAgdGhpcy5yZWFkeSA9IGJpbmQodGhpcy5yZWFkeSwgdGhpcyk7XG4gICAgdGhpcy4kZG9jID0gJChkb2N1bWVudCk7XG4gICAgdGhpcy5hdHRhY2hfZXZlbnRzKCk7XG4gIH1cblxuICBDb3JlLnByb3RvdHlwZS5hdHRhY2hfZXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kZG9jLm9uKCdyZWFkeScsIHRoaXMucmVhZHkpO1xuICB9O1xuXG4gIENvcmUucHJvdG90eXBlLnJlYWR5ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKEhvb2tzLmFwcGx5RmlsdGVycygncHAuY29yZS5yZWFkeScsIHRydWUpKSB7XG4gICAgICBIb29rcy5kb0FjdGlvbigncHAuY29yZS5yZWFkeScpO1xuICAgIH1cbiAgICB0aGlzLiRkb2MuZmluZCgnLlBQX1dyYXBwZXInKS5pbWFnZXNMb2FkZWQodGhpcy5sb2FkZWQpO1xuICB9O1xuXG4gIENvcmUucHJvdG90eXBlLmxvYWRlZCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChIb29rcy5hcHBseUZpbHRlcnMoJ3BwLmxvYWRlZCcsIHRydWUpKSB7XG4gICAgICBIb29rcy5kb0FjdGlvbigncHAuY29yZS5sb2FkZWQnKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIENvcmU7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29yZTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pUTI5eVpTNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSWtOdmNtVXVZMjltWm1WbElsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lJN1FVRkJRVHM3TzBGQlFVRXNTVUZCUVN4alFVRkJPMFZCUVVFN08wRkJSMEVzUTBGQlFTeEhRVUZKTEU5QlFVRXNRMEZCVXl4UlFVRlVPenRCUVVOS0xFdEJRVUVzUjBGQlVTeFBRVUZCTEVOQlFWTXNWVUZCVkRzN1FVRkhSanRGUVVWUkxHTkJRVUU3TzBsQlExb3NTVUZCUXl4RFFVRkJMRWxCUVVRc1IwRkJVU3hEUVVGQkxFTkJRVWNzVVVGQlNEdEpRVU5TTEVsQlFVTXNRMEZCUVN4aFFVRkVMRU5CUVVFN1JVRkdXVHM3YVVKQlRXSXNZVUZCUVN4SFFVRmxMRk5CUVVFN1NVRkRaQ3hKUVVGRExFTkJRVUVzU1VGQlNTeERRVUZETEVWQlFVNHNRMEZCVXl4UFFVRlVMRVZCUVd0Q0xFbEJRVU1zUTBGQlFTeExRVUZ1UWp0RlFVUmpPenRwUWtGUFppeExRVUZCTEVkQlFVOHNVMEZCUVR0SlFVTk9MRWxCUVVjc1MwRkJTeXhEUVVGRExGbEJRVTRzUTBGQmIwSXNaVUZCY0VJc1JVRkJjVU1zU1VGQmNrTXNRMEZCU0R0TlFVTkRMRXRCUVVzc1EwRkJReXhSUVVGT0xFTkJRV1VzWlVGQlppeEZRVVJFT3p0SlFVbEJMRWxCUVVNc1EwRkJRU3hKUVVGSkxFTkJRVU1zU1VGQlRpeERRVUZaTEdGQlFWb3NRMEZCTWtJc1EwRkJReXhaUVVFMVFpeERRVUV3UXl4SlFVRkRMRU5CUVVFc1RVRkJNME03UlVGTVRUczdhVUpCVlZBc1RVRkJRU3hIUVVGUkxGTkJRVUU3U1VGRFVDeEpRVUZITEV0QlFVc3NRMEZCUXl4WlFVRk9MRU5CUVc5Q0xGZEJRWEJDTEVWQlFXbERMRWxCUVdwRExFTkJRVWc3VFVGRFF5eExRVUZMTEVOQlFVTXNVVUZCVGl4RFFVRmxMR2RDUVVGbUxFVkJSRVE3TzBWQlJFODdPenM3T3p0QlFVOVVMRTFCUVUwc1EwRkJReXhQUVVGUUxFZEJRV2xDSW4wPVxuIiwidmFyIEhvb2tzLCBQb3J0Zm9saW87XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cblxuLypcblxuICAgICAqIEluaXRpYWxpemUgUG9ydGZvbGlvIENvcmVcblx0LS0tXG5cdFx0VXNpbmcgcDUwIEAgcHAubG9hZGVkXG5cdFx0TGF0ZSBwcmlvcml0eSBpcyBnb2luZyB0byBmb3JjZSBleHBsaWNpdCBwcmlvcml0eSBpbiBhbnkgb3RoZXIgbW92aW5nIHBhcnRzIHRoYXQgYXJlIGdvaW5nIHRvIHRvdWNoIHBvcnRmb2xpbyBsYXlvdXQgYXQgYHBwLmxvYWRlZGBcblx0LS0tXG4gKi9cblxuUG9ydGZvbGlvID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBQb3J0Zm9saW8oKSB7XG4gICAgSG9va3MuYWRkQWN0aW9uKCdwcC5jb3JlLmxvYWRlZCcsIHRoaXMuY3JlYXRlLCA1MCk7XG4gICAgdGhpcy5wcmVwYXJlKCk7XG4gIH1cblxuICBQb3J0Zm9saW8ucHJvdG90eXBlLnByZXBhcmUgPSBmdW5jdGlvbigpIHtcbiAgICBIb29rcy5kb0FjdGlvbigncHAucG9ydGZvbGlvLnByZXBhcmUnKTtcbiAgfTtcblxuICBQb3J0Zm9saW8ucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5wb3J0Zm9saW8uY3JlYXRlJyk7XG4gIH07XG5cbiAgUG9ydGZvbGlvLnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MuZG9BY3Rpb24oJ3BwLnBvcnRmb2xpby5yZWZyZXNoJyk7XG4gIH07XG5cbiAgUG9ydGZvbGlvLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MuZG9BY3Rpb24oJ3BwLnBvcnRmb2xpby5kZXN0cm95Jyk7XG4gICAgSG9va3MucmVtb3ZlQWN0aW9uKCdwcC5sb2FkZWQnLCB0aGlzLmNyZWF0ZSwgNTApO1xuICB9O1xuXG4gIHJldHVybiBQb3J0Zm9saW87XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gUG9ydGZvbGlvO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lVRzl5ZEdadmJHbHZMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaVVHOXlkR1p2YkdsdkxtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeEpRVUZCT3p0QlFVRkJMRXRCUVVFc1IwRkJVU3hQUVVGQkxFTkJRVk1zVlVGQlZEczdPMEZCUlZJN096czdPenM3T3p0QlFWTk5PMFZCUlZFc2JVSkJRVUU3U1VGRFdpeExRVUZMTEVOQlFVTXNVMEZCVGl4RFFVRm5RaXhuUWtGQmFFSXNSVUZCYTBNc1NVRkJReXhEUVVGQkxFMUJRVzVETEVWQlFUSkRMRVZCUVRORE8wbEJRMEVzU1VGQlF5eERRVUZCTEU5QlFVUXNRMEZCUVR0RlFVWlpPenR6UWtGSllpeFBRVUZCTEVkQlFWTXNVMEZCUVR0SlFVTlNMRXRCUVVzc1EwRkJReXhSUVVGT0xFTkJRV1VzYzBKQlFXWTdSVUZFVVRzN2MwSkJTVlFzVFVGQlFTeEhRVUZSTEZOQlFVRTdTVUZEVUN4TFFVRkxMRU5CUVVNc1VVRkJUaXhEUVVGbExIRkNRVUZtTzBWQlJFODdPM05DUVV0U0xFOUJRVUVzUjBGQlV5eFRRVUZCTzBsQlExSXNTMEZCU3l4RFFVRkRMRkZCUVU0c1EwRkJaU3h6UWtGQlpqdEZRVVJST3p0elFrRkxWQ3hQUVVGQkxFZEJRVk1zVTBGQlFUdEpRVVZTTEV0QlFVc3NRMEZCUXl4UlFVRk9MRU5CUVdVc2MwSkJRV1k3U1VGRFFTeExRVUZMTEVOQlFVTXNXVUZCVGl4RFFVRnRRaXhYUVVGdVFpeEZRVUZuUXl4SlFVRkRMRU5CUVVFc1RVRkJha01zUlVGQmVVTXNSVUZCZWtNN1JVRklVVHM3T3pzN08wRkJUMVlzVFVGQlRTeERRVUZETEU5QlFWQXNSMEZCYVVJaWZRPT1cbiIsInZhciBIb29rcywgZ2V0X3NpemU7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbmdldF9zaXplID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgd2lkdGg6IHdpbmRvdy5pbm5lcldpZHRoIHx8ICR3aW5kb3cud2lkdGgoKSxcbiAgICBoZWlnaHQ6IHdpbmRvdy5pbm5lckhlaWdodCB8fCAkd2luZG93LmhlaWdodCgpXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdldF9zaXplKCk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVYybHVaRzkzTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lWMmx1Wkc5M0xtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeEpRVUZCT3p0QlFVRkJMRXRCUVVFc1IwRkJVU3hQUVVGQkxFTkJRVk1zVlVGQlZEczdRVUZIVWl4UlFVRkJMRWRCUVZjc1UwRkJRVHRUUVVOV08wbEJRVUVzUzBGQlFTeEZRVUZSTEUxQlFVMHNRMEZCUXl4VlFVRlFMRWxCUVhGQ0xFOUJRVThzUTBGQlF5eExRVUZTTEVOQlFVRXNRMEZCTjBJN1NVRkRRU3hOUVVGQkxFVkJRVkVzVFVGQlRTeERRVUZETEZkQlFWQXNTVUZCYzBJc1QwRkJUeXhEUVVGRExFMUJRVklzUTBGQlFTeERRVVE1UWpzN1FVRkVWVHM3UVVGTFdDeE5RVUZOTEVOQlFVTXNUMEZCVUN4SFFVRnBRaXhSUVVGQkxFTkJRVUVpZlE9PVxuIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgJCwgSG9va3MsIEl0ZW1fRGF0YSwgTGF6eV9Mb2FkZXI7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5JdGVtX0RhdGEgPSByZXF1aXJlKCcuL0l0ZW1fRGF0YScpO1xuXG5MYXp5X0xvYWRlciA9IChmdW5jdGlvbigpIHtcbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLkVsZW1lbnRzID0ge1xuICAgIGl0ZW06ICdQUF9MYXp5X0ltYWdlJyxcbiAgICBwbGFjZWhvbGRlcjogJ1BQX0xhenlfSW1hZ2VfX3BsYWNlaG9sZGVyJyxcbiAgICBsaW5rOiAnUFBfSlNfTGF6eV9fbGluaycsXG4gICAgaW1hZ2U6ICdQUF9KU19MYXp5X19pbWFnZSdcbiAgfTtcblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUuSXRlbXMgPSBbXTtcblxuICBmdW5jdGlvbiBMYXp5X0xvYWRlcigpIHtcbiAgICB0aGlzLnNldHVwX2RhdGEoKTtcbiAgICB0aGlzLnJlc2l6ZV9hbGwoKTtcbiAgICB0aGlzLmF0dGFjaF9ldmVudHMoKTtcbiAgfVxuXG5cbiAgLypcbiAgXHRcdEFic3RyYWN0IE1ldGhvZHNcbiAgICovXG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBMYXp5X0xvYWRlcmAgbXVzdCBpbXBsZW1lbnQgYHJlc2l6ZWAgbWV0aG9kXCIpO1xuICB9O1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYExhenlfTG9hZGVyYCBtdXN0IGltcGxlbWVudCBgbG9hZGAgbWV0aG9kXCIpO1xuICB9O1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5hdXRvbG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBMYXp5X0xvYWRlcmAgbXVzdCBpbXBsZW1lbnQgYGF1dG9sb2FkYCBtZXRob2RcIik7XG4gIH07XG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLnNldHVwX2RhdGEgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgJGl0ZW1zO1xuICAgIHRoaXMuSXRlbXMgPSBbXTtcbiAgICAkaXRlbXMgPSAkKFwiLlwiICsgdGhpcy5FbGVtZW50cy5pdGVtKTtcbiAgICAkaXRlbXMuZWFjaCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihrZXksIGVsKSB7XG4gICAgICAgIHZhciAkZWw7XG4gICAgICAgICRlbCA9ICQoZWwpO1xuICAgICAgICByZXR1cm4gX3RoaXMuSXRlbXMucHVzaCh7XG4gICAgICAgICAgZWw6IGVsLFxuICAgICAgICAgICRlbDogJGVsLFxuICAgICAgICAgIGRhdGE6IG5ldyBJdGVtX0RhdGEoJGVsKSxcbiAgICAgICAgICBsb2FkZWQ6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH07XG5cblxuICAvKlxuICBcdFx0TWV0aG9kc1xuICAgKi9cblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUucmVzaXplX2FsbCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpLCBpdGVtLCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICByZWYgPSB0aGlzLkl0ZW1zO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGl0ZW0gPSByZWZbaV07XG4gICAgICByZXN1bHRzLnB1c2godGhpcy5yZXNpemUoaXRlbSkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUubG9hZF9hbGwgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaSwgaXRlbSwgbGVuLCByZWYsIHJlc3VsdHM7XG4gICAgcmVmID0gdGhpcy5JdGVtcztcbiAgICByZXN1bHRzID0gW107XG4gICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpdGVtID0gcmVmW2ldO1xuICAgICAgdGhpcy5sb2FkKGl0ZW0pO1xuICAgICAgcmVzdWx0cy5wdXNoKHRoaXMucmVtb3ZlX3BsYWNlaG9sZGVyKGl0ZW0pKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLnJlbW92ZV9wbGFjZWhvbGRlciA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbS4kZWwuZmluZChcIi5cIiArIHRoaXMuRWxlbWVudHMucGxhY2Vob2xkZXIgKyBcIiwgbm9zY3JpcHRcIikucmVtb3ZlKCk7XG4gIH07XG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kZXRhY2hfZXZlbnRzKCk7XG4gIH07XG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLmF0dGFjaF9ldmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gSG9va3MuYWRkQWN0aW9uKCdwcC5sYXp5LmF1dG9sb2FkJywgdGhpcy5hdXRvbG9hZCk7XG4gIH07XG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLmRldGFjaF9ldmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gSG9va3MucmVtb3ZlQWN0aW9uKCdwcC5sYXp5LmF1dG9sb2FkJywgdGhpcy5hdXRvbG9hZCk7XG4gIH07XG5cbiAgcmV0dXJuIExhenlfTG9hZGVyO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExhenlfTG9hZGVyO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lRV0p6ZEhKaFkzUmZUR0Y2ZVY5TWIyRmtaWEl1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SkJZbk4wY21GamRGOU1ZWHA1WDB4dllXUmxjaTVqYjJabVpXVWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqdEJRVUZCT3pzN1FVRkJRU3hKUVVGQk96dEJRVWRCTEVOQlFVRXNSMEZCU1N4UFFVRkJMRU5CUVZNc1VVRkJWRHM3UVVGRFNpeExRVUZCTEVkQlFWRXNUMEZCUVN4RFFVRlRMRlZCUVZRN08wRkJRMUlzVTBGQlFTeEhRVUZaTEU5QlFVRXNRMEZCVXl4aFFVRlVPenRCUVVWT08zZENRVVZNTEZGQlFVRXNSMEZEUXp0SlFVRkJMRWxCUVVFc1JVRkJZU3hsUVVGaU8wbEJRMEVzVjBGQlFTeEZRVUZoTERSQ1FVUmlPMGxCUlVFc1NVRkJRU3hGUVVGaExHdENRVVppTzBsQlIwRXNTMEZCUVN4RlFVRmhMRzFDUVVoaU96czdkMEpCUzBRc1MwRkJRU3hIUVVGUE96dEZRVWROTEhGQ1FVRkJPMGxCUTFvc1NVRkJReXhEUVVGQkxGVkJRVVFzUTBGQlFUdEpRVU5CTEVsQlFVTXNRMEZCUVN4VlFVRkVMRU5CUVVFN1NVRkRRU3hKUVVGRExFTkJRVUVzWVVGQlJDeERRVUZCTzBWQlNGazdPenRCUVUxaU96czdPM2RDUVVkQkxFMUJRVUVzUjBGQlZTeFRRVUZCTzBGQlFVY3NWVUZCVlN4SlFVRkJMRXRCUVVFc1EwRkJUeXg1UlVGQlVEdEZRVUZpT3p0M1FrRkRWaXhKUVVGQkxFZEJRVlVzVTBGQlFUdEJRVUZITEZWQlFWVXNTVUZCUVN4TFFVRkJMRU5CUVU4c2RVVkJRVkE3UlVGQllqczdkMEpCUTFZc1VVRkJRU3hIUVVGVkxGTkJRVUU3UVVGQlJ5eFZRVUZWTEVsQlFVRXNTMEZCUVN4RFFVRlBMREpGUVVGUU8wVkJRV0k3TzNkQ1FVZFdMRlZCUVVFc1IwRkJXU3hUUVVGQk8wRkJSVmdzVVVGQlFUdEpRVUZCTEVsQlFVTXNRMEZCUVN4TFFVRkVMRWRCUVZNN1NVRkZWQ3hOUVVGQkxFZEJRVk1zUTBGQlFTeERRVUZITEVkQlFVRXNSMEZCU1N4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExFbEJRV3BDTzBsQlJWUXNUVUZCVFN4RFFVRkRMRWxCUVZBc1EwRkJXU3hEUVVGQkxGTkJRVUVzUzBGQlFUdGhRVUZCTEZOQlFVVXNSMEZCUml4RlFVRlBMRVZCUVZBN1FVRkZXQ3haUVVGQk8xRkJRVUVzUjBGQlFTeEhRVUZOTEVOQlFVRXNRMEZCUnl4RlFVRklPMlZCUTA0c1MwRkJReXhEUVVGQkxFdEJRVXNzUTBGQlF5eEpRVUZRTEVOQlEwTTdWVUZCUVN4RlFVRkJMRVZCUVZFc1JVRkJVanRWUVVOQkxFZEJRVUVzUlVGQlVTeEhRVVJTTzFWQlJVRXNTVUZCUVN4RlFVRlpMRWxCUVVFc1UwRkJRU3hEUVVGWExFZEJRVmdzUTBGR1dqdFZRVWRCTEUxQlFVRXNSVUZCVVN4TFFVaFNPMU5CUkVRN1RVRklWenRKUVVGQkxFTkJRVUVzUTBGQlFTeERRVUZCTEVsQlFVRXNRMEZCV2p0RlFVNVhPenM3UVVGclFsbzdPenM3ZDBKQlIwRXNWVUZCUVN4SFFVRlpMRk5CUVVFN1FVRkRXQ3hSUVVGQk8wRkJRVUU3UVVGQlFUdFRRVUZCTEhGRFFVRkJPenR0UWtGQlFTeEpRVUZETEVOQlFVRXNUVUZCUkN4RFFVRlRMRWxCUVZRN1FVRkJRVHM3UlVGRVZ6czdkMEpCUjFvc1VVRkJRU3hIUVVGVkxGTkJRVUU3UVVGRFZDeFJRVUZCTzBGQlFVRTdRVUZCUVR0VFFVRkJMSEZEUVVGQk96dE5RVU5ETEVsQlFVTXNRMEZCUVN4SlFVRkVMRU5CUVU4c1NVRkJVRHR0UWtGRFFTeEpRVUZETEVOQlFVRXNhMEpCUVVRc1EwRkJjVUlzU1VGQmNrSTdRVUZHUkRzN1JVRkVVenM3ZDBKQlMxWXNhMEpCUVVFc1IwRkJiMElzVTBGQlJTeEpRVUZHTzFkQlEyNUNMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zU1VGQlZDeERRVUZsTEVkQlFVRXNSMEZCU1N4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExGZEJRV1FzUjBGQk1FSXNXVUZCZWtNc1EwRkJjMFFzUTBGQlF5eE5RVUYyUkN4RFFVRkJPMFZCUkcxQ096dDNRa0ZKY0VJc1QwRkJRU3hIUVVGVExGTkJRVUU3VjBGRFVpeEpRVUZETEVOQlFVRXNZVUZCUkN4RFFVRkJPMFZCUkZFN08zZENRVWRVTEdGQlFVRXNSMEZCWlN4VFFVRkJPMWRCUTJRc1MwRkJTeXhEUVVGRExGTkJRVTRzUTBGQlowSXNhMEpCUVdoQ0xFVkJRVzlETEVsQlFVTXNRMEZCUVN4UlFVRnlRenRGUVVSak96dDNRa0ZIWml4aFFVRkJMRWRCUVdVc1UwRkJRVHRYUVVOa0xFdEJRVXNzUTBGQlF5eFpRVUZPTEVOQlFXMUNMR3RDUVVGdVFpeEZRVUYxUXl4SlFVRkRMRU5CUVVFc1VVRkJlRU03UlVGRVl6czdPenM3TzBGQlIyaENMRTFCUVUwc1EwRkJReXhQUVVGUUxFZEJRV2xDSW4wPVxuIiwidmFyIEl0ZW1fRGF0YTtcblxuSXRlbV9EYXRhID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBJdGVtX0RhdGEoJGVsKSB7XG4gICAgdmFyIGRhdGE7XG4gICAgdGhpcy4kZWwgPSAkZWw7XG4gICAgZGF0YSA9ICRlbC5kYXRhKCdpdGVtJyk7XG4gICAgaWYgKCFkYXRhKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFbGVtZW50IGRvZXNuJ3QgY29udGFpbiBgZGF0YS1pdGVtYCBhdHRyaWJ1dGVcIik7XG4gICAgfVxuICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gIH1cblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF9kYXRhID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBpbWFnZTtcbiAgICBpbWFnZSA9IHRoaXMuZGF0YVsnaW1hZ2VzJ11bbmFtZV07XG4gICAgaWYgKCFpbWFnZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gaW1hZ2U7XG4gIH07XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfc2l6ZSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaGVpZ2h0LCBpbWFnZSwgcmVmLCBzaXplLCB3aWR0aDtcbiAgICBpbWFnZSA9IHRoaXMuZ2V0X2RhdGEobmFtZSk7XG4gICAgaWYgKCFpbWFnZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBzaXplID0gaW1hZ2VbJ3NpemUnXTtcbiAgICByZWYgPSBzaXplLnNwbGl0KCd4JyksIHdpZHRoID0gcmVmWzBdLCBoZWlnaHQgPSByZWZbMV07XG4gICAgd2lkdGggPSBwYXJzZUludCh3aWR0aCk7XG4gICAgaGVpZ2h0ID0gcGFyc2VJbnQoaGVpZ2h0KTtcbiAgICByZXR1cm4gW3dpZHRoLCBoZWlnaHRdO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X3VybCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaW1hZ2U7XG4gICAgaW1hZ2UgPSB0aGlzLmdldF9kYXRhKG5hbWUpO1xuICAgIGlmICghaW1hZ2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGltYWdlWyd1cmwnXTtcbiAgfTtcblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF9vcl9mYWxzZSA9IGZ1bmN0aW9uKGtleSkge1xuICAgIGlmICh0aGlzLmRhdGFba2V5XSkge1xuICAgICAgcmV0dXJuIHRoaXMuZGF0YVtrZXldO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfcmF0aW8gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRfb3JfZmFsc2UoJ3JhdGlvJyk7XG4gIH07XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfdHlwZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldF9vcl9mYWxzZSgndHlwZScpO1xuICB9O1xuXG4gIHJldHVybiBJdGVtX0RhdGE7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gSXRlbV9EYXRhO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lTWFJsYlY5RVlYUmhMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaVNYUmxiVjlFWVhSaExtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeEpRVUZCT3p0QlFVRk5PMFZCUlZFc2JVSkJRVVVzUjBGQlJqdEJRVU5hTEZGQlFVRTdTVUZCUVN4SlFVRkRMRU5CUVVFc1IwRkJSQ3hIUVVGUE8wbEJRMUFzU1VGQlFTeEhRVUZQTEVkQlFVY3NRMEZCUXl4SlFVRktMRU5CUVZVc1RVRkJWanRKUVVWUUxFbEJRVWNzUTBGQlNTeEpRVUZRTzBGQlEwTXNXVUZCVlN4SlFVRkJMRXRCUVVFc1EwRkJUU3dyUTBGQlRpeEZRVVJZT3p0SlFVZEJMRWxCUVVNc1EwRkJRU3hKUVVGRUxFZEJRVkU3UlVGUVNUczdjMEpCVjJJc1VVRkJRU3hIUVVGVkxGTkJRVVVzU1VGQlJqdEJRVU5VTEZGQlFVRTdTVUZCUVN4TFFVRkJMRWRCUVZFc1NVRkJReXhEUVVGQkxFbEJRVTBzUTBGQlFTeFJRVUZCTEVOQlFWa3NRMEZCUVN4SlFVRkJPMGxCUXpOQ0xFbEJRV2RDTEVOQlFVa3NTMEZCY0VJN1FVRkJRU3hoUVVGUExFMUJRVkE3TzBGQlJVRXNWMEZCVHp0RlFVcEZPenR6UWtGTlZpeFJRVUZCTEVkQlFWVXNVMEZCUlN4SlFVRkdPMEZCUTFRc1VVRkJRVHRKUVVGQkxFdEJRVUVzUjBGQlVTeEpRVUZETEVOQlFVRXNVVUZCUkN4RFFVRlhMRWxCUVZnN1NVRkRVaXhKUVVGblFpeERRVUZKTEV0QlFYQkNPMEZCUVVFc1lVRkJUeXhOUVVGUU96dEpRVVZCTEVsQlFVRXNSMEZCVHl4TFFVRlBMRU5CUVVFc1RVRkJRVHRKUVVWa0xFMUJRV3RDTEVsQlFVa3NRMEZCUXl4TFFVRk1MRU5CUVZrc1IwRkJXaXhEUVVGc1FpeEZRVUZETEdOQlFVUXNSVUZCVVR0SlFVVlNMRXRCUVVFc1IwRkJVU3hSUVVGQkxFTkJRVlVzUzBGQlZqdEpRVU5TTEUxQlFVRXNSMEZCVXl4UlFVRkJMRU5CUVZVc1RVRkJWanRCUVVWVUxGZEJRVThzUTBGQlF5eExRVUZFTEVWQlFWRXNUVUZCVWp0RlFWaEZPenR6UWtGaFZpeFBRVUZCTEVkQlFWTXNVMEZCUlN4SlFVRkdPMEZCUTFJc1VVRkJRVHRKUVVGQkxFdEJRVUVzUjBGQlVTeEpRVUZETEVOQlFVRXNVVUZCUkN4RFFVRlhMRWxCUVZnN1NVRkRVaXhKUVVGblFpeERRVUZKTEV0QlFYQkNPMEZCUVVFc1lVRkJUeXhOUVVGUU96dEJRVU5CTEZkQlFVOHNTMEZCVHl4RFFVRkJMRXRCUVVFN1JVRklUanM3YzBKQlMxUXNXVUZCUVN4SFFVRmpMRk5CUVVVc1IwRkJSanRKUVVOaUxFbEJRVWNzU1VGQlF5eERRVUZCTEVsQlFVMHNRMEZCUVN4SFFVRkJMRU5CUVZZN1FVRkRReXhoUVVGUExFbEJRVU1zUTBGQlFTeEpRVUZOTEVOQlFVRXNSMEZCUVN4RlFVUm1PenRCUVVWQkxGZEJRVTg3UlVGSVRUczdjMEpCUzJRc1UwRkJRU3hIUVVGakxGTkJRVUU3VjBGQlJ5eEpRVUZETEVOQlFVRXNXVUZCUkN4RFFVRmxMRTlCUVdZN1JVRkJTRHM3YzBKQlEyUXNVVUZCUVN4SFFVRmpMRk5CUVVFN1YwRkJSeXhKUVVGRExFTkJRVUVzV1VGQlJDeERRVUZsTEUxQlFXWTdSVUZCU0RzN096czdPMEZCUjJZc1RVRkJUU3hEUVVGRExFOUJRVkFzUjBGQmFVSWlmUT09XG4iLCJ2YXIgJCwgQWJzdHJhY3RfTGF6eV9Mb2FkZXIsIExhenlfTWFzb25yeSwgX19XSU5ET1csXG4gIGJpbmQgPSBmdW5jdGlvbihmbiwgbWUpeyByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuIGZuLmFwcGx5KG1lLCBhcmd1bWVudHMpOyB9OyB9LFxuICBleHRlbmQgPSBmdW5jdGlvbihjaGlsZCwgcGFyZW50KSB7IGZvciAodmFyIGtleSBpbiBwYXJlbnQpIHsgaWYgKGhhc1Byb3AuY2FsbChwYXJlbnQsIGtleSkpIGNoaWxkW2tleV0gPSBwYXJlbnRba2V5XTsgfSBmdW5jdGlvbiBjdG9yKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gY2hpbGQ7IH0gY3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlOyBjaGlsZC5wcm90b3R5cGUgPSBuZXcgY3RvcigpOyBjaGlsZC5fX3N1cGVyX18gPSBwYXJlbnQucHJvdG90eXBlOyByZXR1cm4gY2hpbGQ7IH0sXG4gIGhhc1Byb3AgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkFic3RyYWN0X0xhenlfTG9hZGVyID0gcmVxdWlyZSgnLi9BYnN0cmFjdF9MYXp5X0xvYWRlcicpO1xuXG5fX1dJTkRPVyA9IHJlcXVpcmUoJy4uL2dsb2JhbC9XaW5kb3cnKTtcblxuTGF6eV9NYXNvbnJ5ID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgZXh0ZW5kKExhenlfTWFzb25yeSwgc3VwZXJDbGFzcyk7XG5cbiAgZnVuY3Rpb24gTGF6eV9NYXNvbnJ5KCkge1xuICAgIHRoaXMubG9hZF9pdGVtc19pbl92aWV3ID0gYmluZCh0aGlzLmxvYWRfaXRlbXNfaW5fdmlldywgdGhpcyk7XG4gICAgdGhpcy5hdXRvbG9hZCA9IGJpbmQodGhpcy5hdXRvbG9hZCwgdGhpcyk7XG4gICAgdGhpcy5kZWJvdW5jZWRfbG9hZF9pdGVtc19pbl92aWV3ID0gXy5kZWJvdW5jZSh0aGlzLmxvYWRfaXRlbXNfaW5fdmlldywgNTApO1xuICAgIExhenlfTWFzb25yeS5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzKTtcbiAgfVxuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24oaXRlbSkge1xuICAgIHJldHVybiBpdGVtLiRlbC5jc3Moe1xuICAgICAgJ21pbi1oZWlnaHQnOiBNYXRoLmZsb29yKHRoaXMuZ2V0X3dpZHRoKCkgLyBpdGVtLmRhdGEuZ2V0X3JhdGlvKCkpXG4gICAgfSk7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5nZXRfd2lkdGggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJCgnLlBQX01hc29ucnlfX3NpemVyJykud2lkdGgoKTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmF1dG9sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMubG9hZF9pdGVtc19pbl92aWV3KCk7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24oaXRlbSkge1xuICAgIHZhciAkaW1hZ2UsIGZ1bGwsIHRodW1iO1xuICAgIHRodW1iID0gaXRlbS5kYXRhLmdldF91cmwoJ3RodW1iJyk7XG4gICAgZnVsbCA9IGl0ZW0uZGF0YS5nZXRfdXJsKCdmdWxsJyk7XG4gICAgaXRlbS4kZWwucHJlcGVuZChcIjxhIGNsYXNzPVxcXCJcIiArIHRoaXMuRWxlbWVudHMubGluayArIFwiXFxcIiBocmVmPVxcXCJcIiArIGZ1bGwgKyBcIlxcXCIgcmVsPVxcXCJnYWxsZXJ5XFxcIj5cXG48aW1nIGNsYXNzPVxcXCJcIiArIHRoaXMuRWxlbWVudHMuaW1hZ2UgKyBcIlxcXCIgc3JjPVxcXCJcIiArIHRodW1iICsgXCJcXFwiIGNsYXNzPVxcXCJQUF9KU19fbG9hZGluZ1xcXCIgLz5cXG48L2E+XCIpLnJlbW92ZUNsYXNzKCdMYXp5LUltYWdlJyk7XG4gICAgaXRlbS5sb2FkZWQgPSB0cnVlO1xuICAgICRpbWFnZSA9IGl0ZW0uJGVsLmZpbmQoJ2ltZycpO1xuICAgIHJldHVybiAkaW1hZ2UuaW1hZ2VzTG9hZGVkKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAkaW1hZ2UuYWRkQ2xhc3MoJ1BQX0pTX19sb2FkZWQnKS5yZW1vdmVDbGFzcygnUFBfSlNfX2xvYWRpbmcnKTtcbiAgICAgICAgcmV0dXJuIGl0ZW0uJGVsLmNzcygnbWluLWhlaWdodCcsICcnKS5yZW1vdmVDbGFzcyhfdGhpcy5FbGVtZW50cy5pdGVtKS5maW5kKFwiLlwiICsgX3RoaXMuRWxlbWVudHMucGxhY2Vob2xkZXIpLmZhZGVPdXQoNDAwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gJCh0aGlzKS5yZW1vdmUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmxvYWRfaXRlbXNfaW5fdmlldyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpLCBpdGVtLCBrZXksIGxlbiwgcmVmLCByZXN1bHRzO1xuICAgIHJlZiA9IHRoaXMuSXRlbXM7XG4gICAgcmVzdWx0cyA9IFtdO1xuICAgIGZvciAoa2V5ID0gaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGtleSA9ICsraSkge1xuICAgICAgaXRlbSA9IHJlZltrZXldO1xuICAgICAgaWYgKCFpdGVtLmxvYWRlZCAmJiB0aGlzLmluX2xvb3NlX3ZpZXcoaXRlbS5lbCkpIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMubG9hZChpdGVtKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHRzLnB1c2godm9pZCAwKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5pbl9sb29zZV92aWV3ID0gZnVuY3Rpb24oZWwpIHtcbiAgICB2YXIgcmVjdCwgc2Vuc2l0aXZpdHk7XG4gICAgaWYgKGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHNlbnNpdGl2aXR5ID0gMTAwO1xuICAgIHJldHVybiByZWN0LnRvcCArIHJlY3QuaGVpZ2h0ID49IC1zZW5zaXRpdml0eSAmJiByZWN0LmJvdHRvbSAtIHJlY3QuaGVpZ2h0IDw9IF9fV0lORE9XLmhlaWdodCArIHNlbnNpdGl2aXR5ICYmIHJlY3QubGVmdCArIHJlY3Qud2lkdGggPj0gLXNlbnNpdGl2aXR5ICYmIHJlY3QucmlnaHQgLSByZWN0LndpZHRoIDw9IF9fV0lORE9XLndpZHRoICsgc2Vuc2l0aXZpdHk7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5hdHRhY2hfZXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgJCh3aW5kb3cpLm9uKCdzY3JvbGwnLCB0aGlzLmRlYm91bmNlZF9sb2FkX2l0ZW1zX2luX3ZpZXcpO1xuICAgIHJldHVybiBMYXp5X01hc29ucnkuX19zdXBlcl9fLmF0dGFjaF9ldmVudHMuY2FsbCh0aGlzKTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmRldGFjaF9ldmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAkKHdpbmRvdykub2ZmKCdzY3JvbGwnLCB0aGlzLmRlYm91bmNlZF9sb2FkX2l0ZW1zX2luX3ZpZXcpO1xuICAgIHJldHVybiBMYXp5X01hc29ucnkuX19zdXBlcl9fLmRldGFjaF9ldmVudHMuY2FsbCh0aGlzKTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaSwgaXRlbSwga2V5LCBsZW4sIHJlZjtcbiAgICByZWYgPSB0aGlzLkl0ZW1zO1xuICAgIGZvciAoa2V5ID0gaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGtleSA9ICsraSkge1xuICAgICAgaXRlbSA9IHJlZltrZXldO1xuICAgICAgaXRlbS4kZWwuY3NzKCdtaW4taGVpZ2h0JywgJycpO1xuICAgIH1cbiAgICByZXR1cm4gTGF6eV9NYXNvbnJ5Ll9fc3VwZXJfXy5kZXN0cm95LmNhbGwodGhpcyk7XG4gIH07XG5cbiAgcmV0dXJuIExhenlfTWFzb25yeTtcblxufSkoQWJzdHJhY3RfTGF6eV9Mb2FkZXIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExhenlfTWFzb25yeTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVEdGNmVWOU5ZWE52Ym5KNUxtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpVEdGNmVWOU5ZWE52Ym5KNUxtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeEpRVUZCTEN0RFFVRkJPMFZCUVVFN096czdRVUZCUVN4RFFVRkJMRWRCUVVrc1QwRkJRU3hEUVVGVExGRkJRVlE3TzBGQlEwb3NiMEpCUVVFc1IwRkJkVUlzVDBGQlFTeERRVUZUTEhkQ1FVRlVPenRCUVVOMlFpeFJRVUZCTEVkQlFWY3NUMEZCUVN4RFFVRlRMR3RDUVVGVU96dEJRVVZNT3pzN1JVRkZVU3h6UWtGQlFUczdPMGxCUTFvc1NVRkJReXhEUVVGQkxEUkNRVUZFTEVkQlFXZERMRU5CUVVNc1EwRkJReXhSUVVGR0xFTkJRVmtzU1VGQlF5eERRVUZCTEd0Q1FVRmlMRVZCUVdsRExFVkJRV3BETzBsQlEyaERMRFJEUVVGQk8wVkJSbGs3TzNsQ1FVdGlMRTFCUVVFc1IwRkJVU3hUUVVGRkxFbEJRVVk3VjBGRFVDeEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRWRCUVZRc1EwRkJZVHROUVVGQkxGbEJRVUVzUlVGQll5eEpRVUZKTEVOQlFVTXNTMEZCVEN4RFFVRlpMRWxCUVVNc1EwRkJRU3hUUVVGRUxFTkJRVUVzUTBGQlFTeEhRVUZsTEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1UwRkJWaXhEUVVGQkxFTkJRVE5DTEVOQlFXUTdTMEZCWWp0RlFVUlBPenQ1UWtGSlVpeFRRVUZCTEVkQlFWY3NVMEZCUVR0WFFVVldMRU5CUVVFc1EwRkJSeXh2UWtGQlNDeERRVUY1UWl4RFFVRkRMRXRCUVRGQ0xFTkJRVUU3UlVGR1ZUczdlVUpCVFZnc1VVRkJRU3hIUVVGVkxGTkJRVUU3VjBGQlJ5eEpRVUZETEVOQlFVRXNhMEpCUVVRc1EwRkJRVHRGUVVGSU96dDVRa0ZKVml4SlFVRkJMRWRCUVUwc1UwRkJSU3hKUVVGR08wRkJSVXdzVVVGQlFUdEpRVUZCTEV0QlFVRXNSMEZCVVN4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFOUJRVllzUTBGQmJVSXNUMEZCYmtJN1NVRkRVaXhKUVVGQkxFZEJRVThzU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4UFFVRldMRU5CUVcxQ0xFMUJRVzVDTzBsQlJWQXNTVUZCU1N4RFFVRkRMRWRCUTB3c1EwRkJReXhQUVVSRUxFTkJRMVVzWVVGQlFTeEhRVU5KTEVsQlFVTXNRMEZCUVN4UlFVRlJMRU5CUVVNc1NVRkVaQ3hIUVVOdFFpeFpRVVJ1UWl4SFFVTTJRaXhKUVVRM1FpeEhRVU5yUXl4dlEwRkViRU1zUjBGRlRTeEpRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRXRCUm1oQ0xFZEJSWE5DTEZkQlJuUkNMRWRCUlN0Q0xFdEJSaTlDTEVkQlJYRkRMSE5EUVVndlF5eERRVTFCTEVOQlFVTXNWMEZPUkN4RFFVMWpMRmxCVG1RN1NVRlJRU3hKUVVGSkxFTkJRVU1zVFVGQlRDeEhRVUZqTzBsQlEyUXNUVUZCUVN4SFFVRlRMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zU1VGQlZDeERRVUZsTEV0QlFXWTdWMEZEVkN4TlFVRk5MRU5CUVVNc1dVRkJVQ3hEUVVGdlFpeERRVUZCTEZOQlFVRXNTMEZCUVR0aFFVRkJMRk5CUVVFN1VVRkZia0lzVFVGQlRTeERRVUZETEZGQlFWQXNRMEZCYVVJc1pVRkJha0lzUTBGQmEwTXNRMEZCUXl4WFFVRnVReXhEUVVGblJDeG5Ra0ZCYUVRN1pVRkRRU3hKUVVGSkxFTkJRVU1zUjBGRFRDeERRVUZETEVkQlJFUXNRMEZEVFN4WlFVUk9MRVZCUTI5Q0xFVkJSSEJDTEVOQlJVRXNRMEZCUXl4WFFVWkVMRU5CUldNc1MwRkJReXhEUVVGQkxGRkJRVkVzUTBGQlF5eEpRVVo0UWl4RFFVZEJMRU5CUVVNc1NVRklSQ3hEUVVkUExFZEJRVUVzUjBGQlNTeExRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRmRCU0hKQ0xFTkJTVUVzUTBGQlF5eFBRVXBFTEVOQlNWTXNSMEZLVkN4RlFVbGpMRk5CUVVFN2FVSkJRVWNzUTBGQlFTeERRVUZITEVsQlFVZ3NRMEZCVXl4RFFVRkRMRTFCUVZZc1EwRkJRVHRSUVVGSUxFTkJTbVE3VFVGSWJVSTdTVUZCUVN4RFFVRkJMRU5CUVVFc1EwRkJRU3hKUVVGQkxFTkJRWEJDTzBWQlprczdPM2xDUVRSQ1RpeHJRa0ZCUVN4SFFVRnZRaXhUUVVGQk8wRkJRMjVDTEZGQlFVRTdRVUZCUVR0QlFVRkJPMU5CUVVFc2FVUkJRVUU3TzAxQlEwTXNTVUZCUnl4RFFVRkpMRWxCUVVrc1EwRkJReXhOUVVGVUxFbEJRVzlDTEVsQlFVTXNRMEZCUVN4aFFVRkVMRU5CUVdkQ0xFbEJRVWtzUTBGQlF5eEZRVUZ5UWl4RFFVRjJRanR4UWtGRFF5eEpRVUZETEVOQlFVRXNTVUZCUkN4RFFVRlBMRWxCUVZBc1IwRkVSRHRQUVVGQkxFMUJRVUU3TmtKQlFVRTdPMEZCUkVRN08wVkJSRzFDT3p0NVFrRlBjRUlzWVVGQlFTeEhRVUZsTEZOQlFVVXNSVUZCUmp0QlFVTmtMRkZCUVVFN1NVRkJRU3hKUVVGdFFpeG5RMEZCYmtJN1FVRkJRU3hoUVVGUExFdEJRVkE3TzBsQlEwRXNTVUZCUVN4SFFVRlBMRVZCUVVVc1EwRkJReXh4UWtGQlNDeERRVUZCTzBsQlIxQXNWMEZCUVN4SFFVRmpPMEZCUTJRc1YwRkZReXhKUVVGSkxFTkJRVU1zUjBGQlRDeEhRVUZYTEVsQlFVa3NRMEZCUXl4TlFVRm9RaXhKUVVFd1FpeERRVUZETEZkQlFUTkNMRWxCUTBNc1NVRkJTU3hEUVVGRExFMUJRVXdzUjBGQll5eEpRVUZKTEVOQlFVTXNUVUZCYmtJc1NVRkJOa0lzVVVGQlVTeERRVUZETEUxQlFWUXNSMEZCYTBJc1YwRkVhRVFzU1VGSlF5eEpRVUZKTEVOQlFVTXNTVUZCVEN4SFFVRlpMRWxCUVVrc1EwRkJReXhMUVVGcVFpeEpRVUV3UWl4RFFVRkRMRmRCU2pWQ0xFbEJTME1zU1VGQlNTeERRVUZETEV0QlFVd3NSMEZCWVN4SlFVRkpMRU5CUVVNc1MwRkJiRUlzU1VGQk1rSXNVVUZCVVN4RFFVRkRMRXRCUVZRc1IwRkJhVUk3UlVGaWFFTTdPM2xDUVdsQ1ppeGhRVUZCTEVkQlFXVXNVMEZCUVR0SlFVTmtMRU5CUVVFc1EwRkJSeXhOUVVGSUxFTkJRVmNzUTBGQlF5eEZRVUZhTEVOQlFXVXNVVUZCWml4RlFVRjVRaXhKUVVGRExFTkJRVUVzTkVKQlFURkNPMWRCUTBFc09FTkJRVUU3UlVGR1l6czdlVUpCU1dZc1lVRkJRU3hIUVVGbExGTkJRVUU3U1VGRFpDeERRVUZCTEVOQlFVY3NUVUZCU0N4RFFVRlhMRU5CUVVNc1IwRkJXaXhEUVVGblFpeFJRVUZvUWl4RlFVRXdRaXhKUVVGRExFTkJRVUVzTkVKQlFUTkNPMWRCUTBFc09FTkJRVUU3UlVGR1l6czdlVUpCU1dZc1QwRkJRU3hIUVVGVExGTkJRVUU3UVVGRFVpeFJRVUZCTzBGQlFVRTdRVUZCUVN4VFFVRkJMR2xFUVVGQk96dE5RVU5ETEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1IwRkJWQ3hEUVVGaExGbEJRV0lzUlVGQk1rSXNSVUZCTTBJN1FVRkVSRHRYUVVkQkxIZERRVUZCTzBWQlNsRTdPenM3UjBGcVJtbENPenRCUVhWR00wSXNUVUZCVFN4RFFVRkRMRTlCUVZBc1IwRkJhVUlpZlE9PVxuIiwidmFyICQsIEhvb2tzLCBMYXp5X01hc29ucnksIFBvcnRmb2xpb19NYXNvbnJ5LCBpbml0X2xhenlfbG9hZGVyLCBpbml0X21hc29ucnksIGlzX21hc29ucnksIGxhenlfaW5zdGFuY2U7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5Qb3J0Zm9saW9fTWFzb25yeSA9IHJlcXVpcmUoJy4vcG9ydGZvbGlvL1BvcnRmb2xpb19NYXNvbnJ5Jyk7XG5cbkxhenlfTWFzb25yeSA9IHJlcXVpcmUoJy4vbGF6eS9MYXp5X01hc29ucnknKTtcblxubGF6eV9pbnN0YW5jZSA9IGZhbHNlO1xuXG5pc19tYXNvbnJ5ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAkKCcuUFBfTWFzb25yeScpLmxlbmd0aCA+IDA7XG59O1xuXG5cbi8qXG5cdEluaXRpYWxpemUgTWFzb25yeVxuICovXG5cbmluaXRfbWFzb25yeSA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIWlzX21hc29ucnkoKSkge1xuICAgIHJldHVybjtcbiAgfVxuICByZXR1cm4gbmV3IFBvcnRmb2xpb19NYXNvbnJ5KCQoZG9jdW1lbnQpKTtcbn07XG5cbmluaXRfbGF6eV9sb2FkZXIgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCFpc19tYXNvbnJ5KCkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGxhenlfaW5zdGFuY2UpIHtcbiAgICBsYXp5X2luc3RhbmNlLmRlc3Ryb3koKTtcbiAgfVxuICByZXR1cm4gbGF6eV9pbnN0YW5jZSA9IG5ldyAoSG9va3MuYXBwbHlGaWx0ZXJzKCdwcC5sYXp5LmhhbmRsZXInLCBMYXp5X01hc29ucnkpKTtcbn07XG5cblxuLypcblx0U2V0dXAgRXZlbnRzXG4gKi9cblxuSG9va3MuYWRkQWN0aW9uKCdwcC5jb3JlLnJlYWR5JywgaW5pdF9tYXNvbnJ5KTtcblxuSG9va3MuYWRkQWN0aW9uKCdwcC5wb3J0Zm9saW8ucHJlcGFyZScsIGluaXRfbGF6eV9sb2FkZXIsIDEwMCk7XG5cbkhvb2tzLmFkZEFjdGlvbigncHAucG9ydGZvbGlvLmRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgbGF6eV9pbnN0YW5jZS5kZXN0cm95KCk7XG4gIHJldHVybiBsYXp5X2luc3RhbmNlID0gbnVsbDtcbn0pO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3BwLnBvcnRmb2xpby5yZWZyZXNoJywgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBIb29rcy5kb0FjdGlvbigncHAubGF6eS5hdXRvbG9hZCcpO1xufSk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWJXRnpiMjV5ZVM1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJbTFoYzI5dWNua3VZMjltWm1WbElsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lKQlFVRkJMRWxCUVVFN08wRkJRVUVzUTBGQlFTeEhRVUZKTEU5QlFVRXNRMEZCVXl4UlFVRlVPenRCUVVOS0xFdEJRVUVzUjBGQlVTeFBRVUZCTEVOQlFWTXNWVUZCVkRzN1FVRkRVaXhwUWtGQlFTeEhRVUZ2UWl4UFFVRkJMRU5CUVZNc0swSkJRVlE3TzBGQlEzQkNMRmxCUVVFc1IwRkJaU3hQUVVGQkxFTkJRVk1zY1VKQlFWUTdPMEZCUldZc1lVRkJRU3hIUVVGblFqczdRVUZGYUVJc1ZVRkJRU3hIUVVGaExGTkJRVUU3VTBGQlJ5eERRVUZCTEVOQlFVY3NZVUZCU0N4RFFVRnJRaXhEUVVGRExFMUJRVzVDTEVkQlFUUkNPMEZCUVM5Q096czdRVUZIWWpzN096dEJRVWRCTEZsQlFVRXNSMEZCWlN4VFFVRkJPMFZCUTJRc1NVRkJWU3hEUVVGSkxGVkJRVUVzUTBGQlFTeERRVUZrTzBGQlFVRXNWMEZCUVRzN1UwRkpTU3hKUVVGQkxHbENRVUZCTEVOQlFXMUNMRU5CUVVFc1EwRkJSeXhSUVVGSUxFTkJRVzVDTzBGQlRGVTdPMEZCVVdZc1owSkJRVUVzUjBGQmJVSXNVMEZCUVR0RlFVTnNRaXhKUVVGVkxFTkJRVWtzVlVGQlFTeERRVUZCTEVOQlFXUTdRVUZCUVN4WFFVRkJPenRGUVVWQkxFbEJRVWNzWVVGQlNEdEpRVU5ETEdGQlFXRXNRMEZCUXl4UFFVRmtMRU5CUVVFc1JVRkVSRHM3VTBGTFFTeGhRVUZCTEVkQlFXZENMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zV1VGQlRpeERRVUZ0UWl4cFFrRkJia0lzUlVGQmMwTXNXVUZCZEVNc1EwRkJSRHRCUVZKR096czdRVUZYYmtJN096czdRVUZKUVN4TFFVRkxMRU5CUVVNc1UwRkJUaXhEUVVGblFpeGxRVUZvUWl4RlFVRnBReXhaUVVGcVF6czdRVUZIUVN4TFFVRkxMRU5CUVVNc1UwRkJUaXhEUVVGblFpeHpRa0ZCYUVJc1JVRkJkME1zWjBKQlFYaERMRVZCUVRCRUxFZEJRVEZFT3p0QlFVTkJMRXRCUVVzc1EwRkJReXhUUVVGT0xFTkJRV2RDTEhOQ1FVRm9RaXhGUVVGM1F5eFRRVUZCTzBWQlEzWkRMR0ZCUVdFc1EwRkJReXhQUVVGa0xFTkJRVUU3VTBGRFFTeGhRVUZCTEVkQlFXZENPMEZCUm5WQ0xFTkJRWGhET3p0QlFVMUJMRXRCUVVzc1EwRkJReXhUUVVGT0xFTkJRV2RDTEhOQ1FVRm9RaXhGUVVGM1F5eFRRVUZCTzFOQlEzWkRMRXRCUVVzc1EwRkJReXhSUVVGT0xFTkJRV1VzYTBKQlFXWTdRVUZFZFVNc1EwRkJlRU1pZlE9PVxuIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgJCwgSG9va3MsIFBvcnRmb2xpb19BY3Rpb25zLCBQb3J0Zm9saW9fTWFzb25yeSxcbiAgYmluZCA9IGZ1bmN0aW9uKGZuLCBtZSl7IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7IH07IH0sXG4gIGV4dGVuZCA9IGZ1bmN0aW9uKGNoaWxkLCBwYXJlbnQpIHsgZm9yICh2YXIga2V5IGluIHBhcmVudCkgeyBpZiAoaGFzUHJvcC5jYWxsKHBhcmVudCwga2V5KSkgY2hpbGRba2V5XSA9IHBhcmVudFtrZXldOyB9IGZ1bmN0aW9uIGN0b3IoKSB7IHRoaXMuY29uc3RydWN0b3IgPSBjaGlsZDsgfSBjdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7IGNoaWxkLnByb3RvdHlwZSA9IG5ldyBjdG9yKCk7IGNoaWxkLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7IHJldHVybiBjaGlsZDsgfSxcbiAgaGFzUHJvcCA9IHt9Lmhhc093blByb3BlcnR5O1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuUG9ydGZvbGlvX0FjdGlvbnMgPSByZXF1aXJlKCcuLy4uL2NsYXNzL0Fic3RyYWN0X1BvcnRmb2xpb19BY3Rpb25zJyk7XG5cblBvcnRmb2xpb19NYXNvbnJ5ID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgZXh0ZW5kKFBvcnRmb2xpb19NYXNvbnJ5LCBzdXBlckNsYXNzKTtcblxuICBmdW5jdGlvbiBQb3J0Zm9saW9fTWFzb25yeSgpIHtcbiAgICB0aGlzLnJlZnJlc2ggPSBiaW5kKHRoaXMucmVmcmVzaCwgdGhpcyk7XG4gICAgdGhpcy5kZXN0cm95ID0gYmluZCh0aGlzLmRlc3Ryb3ksIHRoaXMpO1xuICAgIHRoaXMuY3JlYXRlID0gYmluZCh0aGlzLmNyZWF0ZSwgdGhpcyk7XG4gICAgdGhpcy5wcmVwYXJlID0gYmluZCh0aGlzLnByZXBhcmUsIHRoaXMpO1xuICAgIHJldHVybiBQb3J0Zm9saW9fTWFzb25yeS5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5FbGVtZW50cyA9IHtcbiAgICBjb250YWluZXI6ICdQUF9NYXNvbnJ5JyxcbiAgICBzaXplcjogJ1BQX01hc29ucnlfX3NpemVyJyxcbiAgICBpdGVtOiAnUFBfTWFzb25yeV9faXRlbSdcbiAgfTtcblxuXG4gIC8qXG4gIFx0XHRJbml0aWFsaXplXG4gICAqL1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24oJHBhcmVudCkge1xuICAgIHJldHVybiB0aGlzLiRjb250YWluZXIgPSAkcGFyZW50LmZpbmQoXCIuXCIgKyB0aGlzLkVsZW1lbnRzLmNvbnRhaW5lcik7XG4gIH07XG5cblxuICAvKlxuICBcdFx0UHJlcGFyZSAmIEF0dGFjaCBFdmVudHNcbiAgICAgXHREb24ndCBzaG93IGFueXRoaW5nIHlldC5cbiAgXG4gIFx0XHRAY2FsbGVkIG9uIGhvb2sgYHBwLnBvcnRmb2xpby5wcmVwYXJlYFxuICAgKi9cblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUucHJlcGFyZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBtYXNvbnJ5X3NldHRpbmdzO1xuICAgIGlmICh0aGlzLiRjb250YWluZXIubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuJGNvbnRhaW5lci5hZGRDbGFzcygnUFBfSlNfX2xvYWRpbmdfbWFzb25yeScpO1xuICAgIHRoaXMubWF5YmVfY3JlYXRlX3NpemVyKCk7XG4gICAgbWFzb25yeV9zZXR0aW5ncyA9IEhvb2tzLmFwcGx5RmlsdGVycygncHAubWFzb25yeS5zZXR0aW5ncycsIHtcbiAgICAgIGl0ZW1TZWxlY3RvcjogXCIuXCIgKyB0aGlzLkVsZW1lbnRzLml0ZW0sXG4gICAgICBjb2x1bW5XaWR0aDogXCIuXCIgKyB0aGlzLkVsZW1lbnRzLnNpemVyLFxuICAgICAgZ3V0dGVyOiAwLFxuICAgICAgaW5pdExheW91dDogZmFsc2VcbiAgICB9KTtcbiAgICB0aGlzLiRjb250YWluZXIubWFzb25yeShtYXNvbnJ5X3NldHRpbmdzKTtcbiAgICByZXR1cm4gdGhpcy4kY29udGFpbmVyLm1hc29ucnkoJ29uY2UnLCAnbGF5b3V0Q29tcGxldGUnLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgX3RoaXMuJGNvbnRhaW5lci5yZW1vdmVDbGFzcygnUFBfSlNfX2xvYWRpbmdfbWFzb25yeScpLmFkZENsYXNzKCdQUF9KU19fbG9hZGluZ19jb21wbGV0ZScpO1xuICAgICAgICByZXR1cm4gSG9va3MuZG9BY3Rpb24oJ3BwLnBvcnRmb2xpby5yZWZyZXNoJyk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfTtcblxuXG4gIC8qXG4gIFx0XHRTdGFydCB0aGUgUG9ydGZvbGlvXG4gIFx0XHRAY2FsbGVkIG9uIGhvb2sgYHBwLnBvcnRmb2xpby5jcmVhdGVgXG4gICAqL1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRjb250YWluZXIubWFzb25yeSgpO1xuICB9O1xuXG5cbiAgLypcbiAgXHRcdERlc3Ryb3lcbiAgXHRcdEBjYWxsZWQgb24gaG9vayBgcHAucG9ydGZvbGlvLmRlc3Ryb3lgXG4gICAqL1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5tYXliZV9yZW1vdmVfc2l6ZXIoKTtcbiAgICBpZiAodGhpcy4kY29udGFpbmVyLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuJGNvbnRhaW5lci5tYXNvbnJ5KCdkZXN0cm95Jyk7XG4gICAgfVxuICB9O1xuXG5cbiAgLypcbiAgXHRcdFJlbG9hZCB0aGUgbGF5b3V0XG4gIFx0XHRAY2FsbGVkIG9uIGhvb2sgYHBwLnBvcnRmb2xpby5yZWZyZXNoYFxuICAgKi9cblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLiRjb250YWluZXIubWFzb25yeSgnbGF5b3V0Jyk7XG4gIH07XG5cblxuICAvKlxuICBcdFx0Q3JlYXRlIGEgc2l6ZXIgZWxlbWVudCBmb3IganF1ZXJ5LW1hc29ucnkgdG8gdXNlXG4gICAqL1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5tYXliZV9jcmVhdGVfc2l6ZXIgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5zaXplcl9kb2VzbnRfZXhpc3QoKSkge1xuICAgICAgdGhpcy5jcmVhdGVfc2l6ZXIoKTtcbiAgICB9XG4gIH07XG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLm1heWJlX3JlbW92ZV9zaXplciA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLiRjb250YWluZXIubGVuZ3RoICE9PSAxKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuJGNvbnRhaW5lci5maW5kKFwiLlwiICsgdGhpcy5FbGVtZW50cy5zaXplcikucmVtb3ZlKCk7XG4gIH07XG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLnNpemVyX2RvZXNudF9leGlzdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLiRjb250YWluZXIuZmluZChcIi5cIiArIHRoaXMuRWxlbWVudHMuc2l6ZXIpLmxlbmd0aCA9PT0gMDtcbiAgfTtcblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUuY3JlYXRlX3NpemVyID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kY29udGFpbmVyLmFwcGVuZChcIjxkaXYgY2xhc3M9XFxcIlwiICsgdGhpcy5FbGVtZW50cy5zaXplciArIFwiXFxcIj48L2Rpdj5cIik7XG4gIH07XG5cbiAgcmV0dXJuIFBvcnRmb2xpb19NYXNvbnJ5O1xuXG59KShQb3J0Zm9saW9fQWN0aW9ucyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUG9ydGZvbGlvX01hc29ucnk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVVHOXlkR1p2YkdsdlgwMWhjMjl1Y25rdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUpRYjNKMFptOXNhVzlmVFdGemIyNXllUzVqYjJabVpXVWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqdEJRVUZCT3pzN1FVRkJRU3hKUVVGQkxEaERRVUZCTzBWQlFVRTdPenM3UVVGSFFTeERRVUZCTEVkQlFVa3NUMEZCUVN4RFFVRlRMRkZCUVZRN08wRkJRMG9zUzBGQlFTeEhRVUZSTEU5QlFVRXNRMEZCVXl4VlFVRlVPenRCUVVOU0xHbENRVUZCTEVkQlFXOUNMRTlCUVVFc1EwRkJVeXgxUTBGQlZEczdRVUZIWkRzN096czdPenM3T3pzN09FSkJSVXdzVVVGQlFTeEhRVU5ETzBsQlFVRXNVMEZCUVN4RlFVRlhMRmxCUVZnN1NVRkRRU3hMUVVGQkxFVkJRVmNzYlVKQlJGZzdTVUZGUVN4SlFVRkJMRVZCUVZjc2EwSkJSbGc3T3pzN1FVRkpSRHM3T3pzNFFrRkhRU3hWUVVGQkxFZEJRVmtzVTBGQlJTeFBRVUZHTzFkQlExZ3NTVUZCUXl4RFFVRkJMRlZCUVVRc1IwRkJZeXhQUVVGUExFTkJRVU1zU1VGQlVpeERRVUZqTEVkQlFVRXNSMEZCU1N4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExGTkJRVFZDTzBWQlJFZzdPenRCUVVkYU96czdPenM3T3poQ1FVMUJMRTlCUVVFc1IwRkJVeXhUUVVGQk8wRkJRMUlzVVVGQlFUdEpRVUZCTEVsQlFWVXNTVUZCUXl4RFFVRkJMRlZCUVZVc1EwRkJReXhOUVVGYUxFdEJRWE5DTEVOQlFXaERPMEZCUVVFc1lVRkJRVHM3U1VGRlFTeEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRkZCUVZvc1EwRkJjMElzZDBKQlFYUkNPMGxCUlVFc1NVRkJReXhEUVVGQkxHdENRVUZFTEVOQlFVRTdTVUZIUVN4blFrRkJRU3hIUVVGdFFpeExRVUZMTEVOQlFVTXNXVUZCVGl4RFFVRnRRaXh4UWtGQmJrSXNSVUZEYkVJN1RVRkJRU3haUVVGQkxFVkJRV01zUjBGQlFTeEhRVUZKTEVsQlFVTXNRMEZCUVN4UlFVRlJMRU5CUVVNc1NVRkJOVUk3VFVGRFFTeFhRVUZCTEVWQlFXTXNSMEZCUVN4SFFVRkpMRWxCUVVNc1EwRkJRU3hSUVVGUkxFTkJRVU1zUzBGRU5VSTdUVUZGUVN4TlFVRkJMRVZCUVdNc1EwRkdaRHROUVVkQkxGVkJRVUVzUlVGQll5eExRVWhrTzB0QlJHdENPMGxCVFc1Q0xFbEJRVU1zUTBGQlFTeFZRVUZWTEVOQlFVTXNUMEZCV2l4RFFVRnhRaXhuUWtGQmNrSTdWMEZGUVN4SlFVRkRMRU5CUVVFc1ZVRkJWU3hEUVVGRExFOUJRVm9zUTBGQmIwSXNUVUZCY0VJc1JVRkJORUlzWjBKQlFUVkNMRVZCUVRoRExFTkJRVUVzVTBGQlFTeExRVUZCTzJGQlFVRXNVMEZCUVR0UlFVTTNReXhMUVVGRExFTkJRVUVzVlVGRFFTeERRVUZETEZkQlJFWXNRMEZEWlN4M1FrRkVaaXhEUVVWRExFTkJRVU1zVVVGR1JpeERRVVZaTEhsQ1FVWmFPMlZCVFVFc1MwRkJTeXhEUVVGRExGRkJRVTRzUTBGQlpTeHpRa0ZCWmp0TlFWQTJRenRKUVVGQkxFTkJRVUVzUTBGQlFTeERRVUZCTEVsQlFVRXNRMEZCT1VNN1JVRm9RbEU3T3p0QlFUQkNWRHM3T3pzN09FSkJTVUVzVFVGQlFTeEhRVUZSTEZOQlFVRTdTVUZEVUN4SlFVRkRMRU5CUVVFc1ZVRkJWU3hEUVVGRExFOUJRVm9zUTBGQlFUdEZRVVJQT3pzN1FVRkxVanM3T3pzN09FSkJTVUVzVDBGQlFTeEhRVUZUTEZOQlFVRTdTVUZEVWl4SlFVRkRMRU5CUVVFc2EwSkJRVVFzUTBGQlFUdEpRVVZCTEVsQlFVY3NTVUZCUXl4RFFVRkJMRlZCUVZVc1EwRkJReXhOUVVGYUxFZEJRWEZDTEVOQlFYaENPMDFCUTBNc1NVRkJReXhEUVVGQkxGVkJRVlVzUTBGQlF5eFBRVUZhTEVOQlFYRkNMRk5CUVhKQ0xFVkJSRVE3TzBWQlNGRTdPenRCUVZWVU96czdPenM0UWtGSlFTeFBRVUZCTEVkQlFWTXNVMEZCUVR0WFFVTlNMRWxCUVVNc1EwRkJRU3hWUVVGVkxFTkJRVU1zVDBGQldpeERRVUZ4UWl4UlFVRnlRanRGUVVSUk96czdRVUZMVkRzN096czRRa0ZIUVN4clFrRkJRU3hIUVVGdlFpeFRRVUZCTzBsQlEyNUNMRWxCUVcxQ0xFbEJRVU1zUTBGQlFTeHJRa0ZCUkN4RFFVRkJMRU5CUVc1Q08wMUJRVUVzU1VGQlF5eERRVUZCTEZsQlFVUXNRMEZCUVN4RlFVRkJPenRGUVVSdFFqczdPRUpCU1hCQ0xHdENRVUZCTEVkQlFXOUNMRk5CUVVFN1NVRkRia0lzU1VGQlZTeEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRTFCUVZvc1MwRkJkMElzUTBGQmJFTTdRVUZCUVN4aFFVRkJPenRKUVVOQkxFbEJRVU1zUTBGQlFTeFZRVUZWTEVOQlFVTXNTVUZCV2l4RFFVRnJRaXhIUVVGQkxFZEJRVWtzU1VGQlF5eERRVUZCTEZGQlFWRXNRMEZCUXl4TFFVRm9ReXhEUVVGNVF5eERRVUZETEUxQlFURkRMRU5CUVVFN1JVRkdiVUk3T3poQ1FVdHdRaXhyUWtGQlFTeEhRVUZ2UWl4VFFVRkJPMWRCUVVjc1NVRkJReXhEUVVGQkxGVkJRVlVzUTBGQlF5eEpRVUZhTEVOQlFXdENMRWRCUVVFc1IwRkJTU3hKUVVGRExFTkJRVUVzVVVGQlVTeERRVUZETEV0QlFXaERMRU5CUVhsRExFTkJRVU1zVFVGQk1VTXNTMEZCYjBRN1JVRkJka1E3T3poQ1FVZHdRaXhaUVVGQkxFZEJRV01zVTBGQlFUdEpRVU5pTEVsQlFVTXNRMEZCUVN4VlFVRlZMRU5CUVVNc1RVRkJXaXhEUVVGdFFpeGxRVUZCTEVkQlFXbENMRWxCUVVNc1EwRkJRU3hSUVVGUkxFTkJRVU1zUzBGQk0wSXNSMEZCYVVNc1YwRkJjRVE3UlVGRVlUczdPenRIUVRWR2FVSTdPMEZCYTBkb1F5eE5RVUZOTEVOQlFVTXNUMEZCVUN4SFFVRnBRaUo5XG4iLCJcbi8qXG4gICAgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBIb29rcywgSXRlbV9EYXRhLCBnZXRfZGF0YTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbkl0ZW1fRGF0YSA9IHJlcXVpcmUoJy4uL2xhenkvSXRlbV9EYXRhJyk7XG5cbmdldF9kYXRhID0gZnVuY3Rpb24oZWwpIHtcbiAgdmFyICRjb250YWluZXIsICRlbCwgJGl0ZW1zLCBpdGVtcztcbiAgJGVsID0gJChlbCk7XG4gICRjb250YWluZXIgPSAkZWwuY2xvc2VzdCgnLlBQX0dhbGxlcnknKTtcbiAgJGl0ZW1zID0gJGNvbnRhaW5lci5maW5kKCcuUFBfR2FsbGVyeV9faXRlbScpO1xuICBpdGVtcyA9ICRpdGVtcy5tYXAoZnVuY3Rpb24oa2V5LCBpdGVtKSB7XG4gICAgdmFyIGk7XG4gICAgaSA9IG5ldyBJdGVtX0RhdGEoJChpdGVtKSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNyYzogaS5nZXRfdXJsKCdmdWxsJyksXG4gICAgICB0aHVtYjogaS5nZXRfdXJsKCd0aHVtYicpXG4gICAgfTtcbiAgfSk7XG4gIHJldHVybiBpdGVtcztcbn07XG5cbkhvb2tzLmFkZEFjdGlvbigncHAuY29yZS5yZWFkeScsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4gJCgnLlBQX0dhbGxlcnlfX2l0ZW0nKS5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgdmFyICRlbDtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJGVsID0gJCh0aGlzKTtcbiAgICByZXR1cm4gJGVsLmxpZ2h0R2FsbGVyeSh7XG4gICAgICBkeW5hbWljOiB0cnVlLFxuICAgICAgZHluYW1pY0VsOiBnZXRfZGF0YSh0aGlzKSxcbiAgICAgIGluZGV4OiAkKCcuUFBfR2FsbGVyeV9faXRlbScpLmluZGV4KCRlbCksXG4gICAgICBzcGVlZDogMzUwLFxuICAgICAgcHJlbG9hZDogMyxcbiAgICAgIGRvd25sb2FkOiBmYWxzZVxuICAgIH0pO1xuICB9KTtcbn0pO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2ljRzl3ZFhBdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUp3YjNCMWNDNWpiMlptWldVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWp0QlFVRkJPenM3UVVGQlFTeEpRVUZCT3p0QlFVZEJMRU5CUVVFc1IwRkJTU3hQUVVGQkxFTkJRVk1zVVVGQlZEczdRVUZEU2l4TFFVRkJMRWRCUVZFc1QwRkJRU3hEUVVGVExGVkJRVlE3TzBGQlExSXNVMEZCUVN4SFFVRlpMRTlCUVVFc1EwRkJVeXh0UWtGQlZEczdRVUZGV2l4UlFVRkJMRWRCUVZjc1UwRkJSU3hGUVVGR08wRkJRMVlzVFVGQlFUdEZRVUZCTEVkQlFVRXNSMEZCVFN4RFFVRkJMRU5CUVVjc1JVRkJTRHRGUVVOT0xGVkJRVUVzUjBGQllTeEhRVUZITEVOQlFVTXNUMEZCU2l4RFFVRmhMR0ZCUVdJN1JVRkZZaXhOUVVGQkxFZEJRVk1zVlVGQlZTeERRVUZETEVsQlFWZ3NRMEZCYVVJc2JVSkJRV3BDTzBWQlJWUXNTMEZCUVN4SFFVRlJMRTFCUVUwc1EwRkJReXhIUVVGUUxFTkJRVmNzVTBGQlJTeEhRVUZHTEVWQlFVOHNTVUZCVUR0QlFVTnNRaXhSUVVGQk8wbEJRVUVzUTBGQlFTeEhRVUZSTEVsQlFVRXNVMEZCUVN4RFFVRlhMRU5CUVVFc1EwRkJSeXhKUVVGSUxFTkJRVmc3UVVGRlVpeFhRVUZQTzAxQlEwNHNSMEZCUVN4RlFVRlBMRU5CUVVNc1EwRkJReXhQUVVGR0xFTkJRVmNzVFVGQldDeERRVVJFTzAxQlJVNHNTMEZCUVN4RlFVRlBMRU5CUVVNc1EwRkJReXhQUVVGR0xFTkJRVmNzVDBGQldDeERRVVpFT3p0RlFVaFhMRU5CUVZnN1FVRlRVaXhUUVVGUE8wRkJaa2M3TzBGQmEwSllMRXRCUVVzc1EwRkJReXhUUVVGT0xFTkJRV2RDTEdWQlFXaENMRVZCUVdsRExGTkJRVUU3VTBGRmFFTXNRMEZCUVN4RFFVRkhMRzFDUVVGSUxFTkJRWGRDTEVOQlFVTXNSVUZCZWtJc1EwRkJORUlzVDBGQk5VSXNSVUZCY1VNc1UwRkJSU3hEUVVGR08wRkJRM0JETEZGQlFVRTdTVUZCUVN4RFFVRkRMRU5CUVVNc1kwRkJSaXhEUVVGQk8wbEJSMEVzUjBGQlFTeEhRVUZOTEVOQlFVRXNRMEZCUnl4SlFVRklPMWRCUjA0c1IwRkJSeXhEUVVGRExGbEJRVW9zUTBGRFF6dE5RVUZCTEU5QlFVRXNSVUZCVnl4SlFVRllPMDFCUTBFc1UwRkJRU3hGUVVGWExGRkJRVUVzUTBGQlZTeEpRVUZXTEVOQlJGZzdUVUZGUVN4TFFVRkJMRVZCUVZjc1EwRkJRU3hEUVVGSExHMUNRVUZJTEVOQlFYZENMRU5CUVVNc1MwRkJla0lzUTBGQkswSXNSMEZCTDBJc1EwRkdXRHROUVVkQkxFdEJRVUVzUlVGQlZ5eEhRVWhZTzAxQlNVRXNUMEZCUVN4RlFVRlhMRU5CU2xnN1RVRkxRU3hSUVVGQkxFVkJRVmNzUzBGTVdEdExRVVJFTzBWQlVHOURMRU5CUVhKRE8wRkJSbWRETEVOQlFXcERJbjA9XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
