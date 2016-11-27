(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){

/*
    Load Dependencies
 */
var $, Core, Hooks;

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Core = require('./class/Core');

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);


/*
	Load App
 */

require('./portfolio/prepare');


/*
	Boot on `document.ready`
 */

$(document).ready(function() {
  var Photography_Portfolio;
  if (!$('body').hasClass('PP_Portfolio')) {
    return;
  }
  Photography_Portfolio = new Core();
  Photography_Portfolio.ready();
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./class/Core":3,"./portfolio/prepare":13}],2:[function(require,module,exports){
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
  }

  Core.prototype.ready = function() {
    if (Hooks.applyFilters('pp.core.ready', true)) {
      Hooks.doAction('pp.core.ready');
    }
    $('.PP_Wrapper').imagesLoaded(this.loaded);
  };

  Core.prototype.loaded = function() {
    if (Hooks.applyFilters('pp.core.loaded', true)) {
      Hooks.doAction('pp.core.loaded');
    }
  };

  return Core;

})();

module.exports = Core;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],4:[function(require,module,exports){
(function (global){
var Hooks, Portfolio_Manager;

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);


/*

     * Initialize Portfolio Core
	---
		Using p50 @ `pp.core.ready`
		Late priority is going to force explicit priority in any other moving parts that are going to touch portfolio layout at `pp.loaded`
	---
 */

Portfolio_Manager = (function() {
  function Portfolio_Manager() {}

  Portfolio_Manager.prototype.prepare = function() {
    Hooks.doAction('pp.portfolio.prepare');
  };

  Portfolio_Manager.prototype.create = function() {
    Hooks.doAction('pp.portfolio.create');
  };

  Portfolio_Manager.prototype.refresh = function() {
    Hooks.doAction('pp.portfolio.refresh');
  };

  Portfolio_Manager.prototype.destroy = function() {
    Hooks.doAction('pp.portfolio.destroy');
    Hooks.removeAction('pp.loaded', this.create, 50);
  };

  return Portfolio_Manager;

})();

module.exports = Portfolio_Manager;


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

},{"./../class/Abstract_Portfolio_Actions":2}],10:[function(require,module,exports){
(function (global){
var $, Hooks, Lazy_Masonry, init_lazy_loader, is_masonry, lazy_instance;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Lazy_Masonry = require('./../lazy/Lazy_Masonry');

lazy_instance = false;

is_masonry = function() {
  return $('.PP_Masonry').length > 0;
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

Hooks.addAction('pp.portfolio.prepare', init_lazy_loader, 100);

Hooks.addAction('pp.portfolio.destroy', function() {
  lazy_instance.destroy();
  return lazy_instance = null;
});

Hooks.addAction('pp.portfolio.refresh', function() {
  return Hooks.doAction('pp.lazy.autoload');
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../lazy/Lazy_Masonry":8}],11:[function(require,module,exports){
(function (global){
var $, Hooks, Portfolio_Masonry, init_masonry, is_masonry;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Portfolio_Masonry = require('./Portfolio_Masonry');

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


/*
	Setup Events
 */

Hooks.addAction('pp.core.ready', init_masonry);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./Portfolio_Masonry":9}],12:[function(require,module,exports){
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

},{"../lazy/Item_Data":7}],13:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var Hooks, Portfolio, Portfolio_Manager;

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Portfolio_Manager = require('./../class/Portfolio_Manager');

Portfolio = new Portfolio_Manager();

require('./lazy');

require('./masonry');

require('./popup');

Hooks.addAction('pp.core.ready', Portfolio.prepare, 50);

Hooks.addAction('pp.core.loaded', Portfolio.create, 50);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../class/Portfolio_Manager":4,"./lazy":10,"./masonry":11,"./popup":12}]},{},[1])


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jbGFzcy9BYnN0cmFjdF9Qb3J0Zm9saW9fQWN0aW9ucy5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY2xhc3MvQ29yZS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY2xhc3MvUG9ydGZvbGlvX01hbmFnZXIuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dsb2JhbC9XaW5kb3cuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvQWJzdHJhY3RfTGF6eV9Mb2FkZXIuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvSXRlbV9EYXRhLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0xhenlfTWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL1BvcnRmb2xpb19NYXNvbnJ5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9wb3J0Zm9saW8vbGF6eS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL21hc29ucnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL3BvcnRmb2xpby9wb3B1cC5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL3ByZXBhcmUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDeklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG4vKlxuICAgIExvYWQgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBDb3JlLCBIb29rcztcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuQ29yZSA9IHJlcXVpcmUoJy4vY2xhc3MvQ29yZScpO1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuXG4vKlxuXHRMb2FkIEFwcFxuICovXG5cbnJlcXVpcmUoJy4vcG9ydGZvbGlvL3ByZXBhcmUnKTtcblxuXG4vKlxuXHRCb290IG9uIGBkb2N1bWVudC5yZWFkeWBcbiAqL1xuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgdmFyIFBob3RvZ3JhcGh5X1BvcnRmb2xpbztcbiAgaWYgKCEkKCdib2R5JykuaGFzQ2xhc3MoJ1BQX1BvcnRmb2xpbycpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIFBob3RvZ3JhcGh5X1BvcnRmb2xpbyA9IG5ldyBDb3JlKCk7XG4gIFBob3RvZ3JhcGh5X1BvcnRmb2xpby5yZWFkeSgpO1xufSk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVlYQndMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaVlYQndMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaU8wRkJRVUU3T3p0QlFVRkJMRWxCUVVFN08wRkJSMEVzUzBGQlFTeEhRVUZSTEU5QlFVRXNRMEZCVXl4VlFVRlVPenRCUVVOU0xFbEJRVUVzUjBGQlR5eFBRVUZCTEVOQlFWTXNZMEZCVkRzN1FVRkRVQ3hEUVVGQkxFZEJRVWtzVDBGQlFTeERRVUZUTEZGQlFWUTdPenRCUVVWS096czdPMEZCUjBFc1QwRkJRU3hEUVVGUkxIRkNRVUZTT3pzN1FVRkZRVHM3T3p0QlFVZEJMRU5CUVVFc1EwRkJSeXhSUVVGSUxFTkJRV0VzUTBGQlF5eExRVUZrTEVOQlFXOUNMRk5CUVVFN1FVRkhia0lzVFVGQlFUdEZRVUZCTEVsQlFWVXNRMEZCU1N4RFFVRkJMRU5CUVVjc1RVRkJTQ3hEUVVGWExFTkJRVU1zVVVGQldpeERRVUZ6UWl4alFVRjBRaXhEUVVGa08wRkJRVUVzVjBGQlFUczdSVUZIUVN4eFFrRkJRU3hIUVVFMFFpeEpRVUZCTEVsQlFVRXNRMEZCUVR0RlFVTTFRaXh4UWtGQmNVSXNRMEZCUXl4TFFVRjBRaXhEUVVGQk8wRkJVRzFDTEVOQlFYQkNJbjA9XG4iLCJ2YXIgQWJzdHJhY3RfUG9ydGZvbGlvX0FjdGlvbnMsIEhvb2tzO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5cbi8qXG5cdEFic3RyYWN0IENsYXNzIFBvcnRvZmxpb19FdmVudF9JbWVwbGVtZW50YXRpb25cblxuICAgIEhhbmRsZXMgYWxsIHRoZSBldmVudHMgcmVxdWlyZWQgdG8gZnVsbHkgaGFuZGxlIGEgcG9ydGZvbGlvIGxheW91dCBwcm9jZXNzXG4gKi9cblxuQWJzdHJhY3RfUG9ydGZvbGlvX0FjdGlvbnMgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIEFic3RyYWN0X1BvcnRmb2xpb19BY3Rpb25zKGFyZ3MpIHtcbiAgICB0aGlzLnNldHVwX2FjdGlvbnMoKTtcbiAgICB0aGlzLmluaXRpYWxpemUoYXJncyk7XG4gIH1cblxuICBBYnN0cmFjdF9Qb3J0Zm9saW9fQWN0aW9ucy5wcm90b3R5cGUuc2V0dXBfYWN0aW9ucyA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLmFkZEFjdGlvbigncHAucG9ydGZvbGlvLnByZXBhcmUnLCB0aGlzLnByZXBhcmUsIDUwKTtcbiAgICBIb29rcy5hZGRBY3Rpb24oJ3BwLnBvcnRmb2xpby5jcmVhdGUnLCB0aGlzLmNyZWF0ZSwgNTApO1xuICAgIEhvb2tzLmFkZEFjdGlvbigncHAucG9ydGZvbGlvLnJlZnJlc2gnLCB0aGlzLnJlZnJlc2gsIDUwKTtcbiAgICBIb29rcy5hZGRBY3Rpb24oJ3BwLnBvcnRmb2xpby5kZXN0cm95JywgdGhpcy5kZXN0cm95LCA1MCk7XG4gICAgcmV0dXJuIEhvb2tzLmFkZEFjdGlvbigncHAucG9ydGZvbGlvLmRlc3Ryb3knLCB0aGlzLnB1cmdlX2FjdGlvbnMsIDEwMCk7XG4gIH07XG5cbiAgQWJzdHJhY3RfUG9ydGZvbGlvX0FjdGlvbnMucHJvdG90eXBlLnB1cmdlX2FjdGlvbnMgPSBmdW5jdGlvbigpIHtcbiAgICBIb29rcy5yZW1vdmVBY3Rpb24oJ3BwLnBvcnRmb2xpby5jcmVhdGUnLCB0aGlzLnByZXBhcmUsIDUwKTtcbiAgICBIb29rcy5yZW1vdmVBY3Rpb24oJ3BwLnBvcnRmb2xpby5jcmVhdGUnLCB0aGlzLmNyZWF0ZSwgNTApO1xuICAgIEhvb2tzLnJlbW92ZUFjdGlvbigncHAucG9ydGZvbGlvLnJlZnJlc2gnLCB0aGlzLnJlZnJlc2gsIDUwKTtcbiAgICBIb29rcy5yZW1vdmVBY3Rpb24oJ3BwLnBvcnRmb2xpby5kZXN0cm95JywgdGhpcy5kZXN0cm95LCA1MCk7XG4gICAgcmV0dXJuIEhvb2tzLnJlbW92ZUFjdGlvbigncHAucG9ydGZvbGlvLmRlc3Ryb3knLCB0aGlzLnB1cmdlX2FjdGlvbnMsIDEwMCk7XG4gIH07XG5cblxuICAvKlxuICAgICBcdFJlcXVpcmUgdGhlc2UgbWV0aG9kc1xuICAgKi9cblxuICBBYnN0cmFjdF9Qb3J0Zm9saW9fQWN0aW9ucy5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fQWN0aW9uc2AgbXVzdCBpbXBsZW1lbnQgYGluaXRpYWxpemVgIG1ldGhvZFwiKTtcbiAgfTtcblxuICBBYnN0cmFjdF9Qb3J0Zm9saW9fQWN0aW9ucy5wcm90b3R5cGUucHJlcGFyZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fQWN0aW9uc2AgbXVzdCBpbXBsZW1lbnQgYHByZXBhcmVgIG1ldGhvZFwiKTtcbiAgfTtcblxuICBBYnN0cmFjdF9Qb3J0Zm9saW9fQWN0aW9ucy5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19BY3Rpb25zYCBtdXN0IGltcGxlbWVudCBgY3JlYXRlYCBtZXRob2RcIik7XG4gIH07XG5cbiAgQWJzdHJhY3RfUG9ydGZvbGlvX0FjdGlvbnMucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0FjdGlvbnNgIG11c3QgaW1wbGVtZW50IGByZWZyZXNoYCBtZXRob2RcIik7XG4gIH07XG5cbiAgQWJzdHJhY3RfUG9ydGZvbGlvX0FjdGlvbnMucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0FjdGlvbnNgIG11c3QgaW1wbGVtZW50IGBkZXN0cm95YCBtZXRob2RcIik7XG4gIH07XG5cbiAgcmV0dXJuIEFic3RyYWN0X1BvcnRmb2xpb19BY3Rpb25zO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFic3RyYWN0X1BvcnRmb2xpb19BY3Rpb25zO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lRV0p6ZEhKaFkzUmZVRzl5ZEdadmJHbHZYMEZqZEdsdmJuTXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lKQlluTjBjbUZqZEY5UWIzSjBabTlzYVc5ZlFXTjBhVzl1Y3k1amIyWm1aV1VpWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFc1NVRkJRVHM3UVVGQlFTeExRVUZCTEVkQlFWRXNUMEZCUVN4RFFVRlRMRlZCUVZRN096dEJRVWRTT3pzN096czdRVUZMVFR0RlFVVlJMRzlEUVVGRkxFbEJRVVk3U1VGRFdpeEpRVUZETEVOQlFVRXNZVUZCUkN4RFFVRkJPMGxCUTBFc1NVRkJReXhEUVVGQkxGVkJRVVFzUTBGQllTeEpRVUZpTzBWQlJsazdPM1ZEUVVsaUxHRkJRVUVzUjBGQlpTeFRRVUZCTzBsQlEyUXNTMEZCU3l4RFFVRkRMRk5CUVU0c1EwRkJaMElzYzBKQlFXaENMRVZCUVhkRExFbEJRVU1zUTBGQlFTeFBRVUY2UXl4RlFVRnJSQ3hGUVVGc1JEdEpRVU5CTEV0QlFVc3NRMEZCUXl4VFFVRk9MRU5CUVdkQ0xIRkNRVUZvUWl4RlFVRjFReXhKUVVGRExFTkJRVUVzVFVGQmVFTXNSVUZCWjBRc1JVRkJhRVE3U1VGRFFTeExRVUZMTEVOQlFVTXNVMEZCVGl4RFFVRm5RaXh6UWtGQmFFSXNSVUZCZDBNc1NVRkJReXhEUVVGQkxFOUJRWHBETEVWQlFXdEVMRVZCUVd4RU8wbEJRMEVzUzBGQlN5eERRVUZETEZOQlFVNHNRMEZCWjBJc2MwSkJRV2hDTEVWQlFYZERMRWxCUVVNc1EwRkJRU3hQUVVGNlF5eEZRVUZyUkN4RlFVRnNSRHRYUVVOQkxFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMSE5DUVVGb1FpeEZRVUYzUXl4SlFVRkRMRU5CUVVFc1lVRkJla01zUlVGQmQwUXNSMEZCZUVRN1JVRk1ZenM3ZFVOQlQyWXNZVUZCUVN4SFFVRmxMRk5CUVVFN1NVRkRaQ3hMUVVGTExFTkJRVU1zV1VGQlRpeERRVUZ0UWl4eFFrRkJia0lzUlVGQk1FTXNTVUZCUXl4RFFVRkJMRTlCUVRORExFVkJRVzlFTEVWQlFYQkVPMGxCUTBFc1MwRkJTeXhEUVVGRExGbEJRVTRzUTBGQmJVSXNjVUpCUVc1Q0xFVkJRVEJETEVsQlFVTXNRMEZCUVN4TlFVRXpReXhGUVVGdFJDeEZRVUZ1UkR0SlFVTkJMRXRCUVVzc1EwRkJReXhaUVVGT0xFTkJRVzFDTEhOQ1FVRnVRaXhGUVVFeVF5eEpRVUZETEVOQlFVRXNUMEZCTlVNc1JVRkJjVVFzUlVGQmNrUTdTVUZEUVN4TFFVRkxMRU5CUVVNc1dVRkJUaXhEUVVGdFFpeHpRa0ZCYmtJc1JVRkJNa01zU1VGQlF5eERRVUZCTEU5QlFUVkRMRVZCUVhGRUxFVkJRWEpFTzFkQlEwRXNTMEZCU3l4RFFVRkRMRmxCUVU0c1EwRkJiVUlzYzBKQlFXNUNMRVZCUVRKRExFbEJRVU1zUTBGQlFTeGhRVUUxUXl4RlFVRXlSQ3hIUVVFelJEdEZRVXhqT3pzN1FVRlJaanM3T3p0MVEwRkhRU3hWUVVGQkxFZEJRVmtzVTBGQlFUdEJRVUZITEZWQlFWVXNTVUZCUVN4TFFVRkJMRU5CUVU4c2JVWkJRVkE3UlVGQllqczdkVU5CUTFvc1QwRkJRU3hIUVVGWkxGTkJRVUU3UVVGQlJ5eFZRVUZWTEVsQlFVRXNTMEZCUVN4RFFVRlBMR2RHUVVGUU8wVkJRV0k3TzNWRFFVTmFMRTFCUVVFc1IwRkJXU3hUUVVGQk8wRkJRVWNzVlVGQlZTeEpRVUZCTEV0QlFVRXNRMEZCVHl3clJVRkJVRHRGUVVGaU96dDFRMEZEV2l4UFFVRkJMRWRCUVZrc1UwRkJRVHRCUVVGSExGVkJRVlVzU1VGQlFTeExRVUZCTEVOQlFVOHNaMFpCUVZBN1JVRkJZanM3ZFVOQlExb3NUMEZCUVN4SFFVRlpMRk5CUVVFN1FVRkJSeXhWUVVGVkxFbEJRVUVzUzBGQlFTeERRVUZQTEdkR1FVRlFPMFZCUVdJN096czdPenRCUVVWaUxFMUJRVTBzUTBGQlF5eFBRVUZRTEVkQlFXbENJbjA9XG4iLCJcbi8qXG4gICAgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBDb3JlLCBIb29rcyxcbiAgYmluZCA9IGZ1bmN0aW9uKGZuLCBtZSl7IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7IH07IH07XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5Db3JlID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBDb3JlKCkge1xuICAgIHRoaXMucmVhZHkgPSBiaW5kKHRoaXMucmVhZHksIHRoaXMpO1xuICB9XG5cbiAgQ29yZS5wcm90b3R5cGUucmVhZHkgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoSG9va3MuYXBwbHlGaWx0ZXJzKCdwcC5jb3JlLnJlYWR5JywgdHJ1ZSkpIHtcbiAgICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5jb3JlLnJlYWR5Jyk7XG4gICAgfVxuICAgICQoJy5QUF9XcmFwcGVyJykuaW1hZ2VzTG9hZGVkKHRoaXMubG9hZGVkKTtcbiAgfTtcblxuICBDb3JlLnByb3RvdHlwZS5sb2FkZWQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoSG9va3MuYXBwbHlGaWx0ZXJzKCdwcC5jb3JlLmxvYWRlZCcsIHRydWUpKSB7XG4gICAgICBIb29rcy5kb0FjdGlvbigncHAuY29yZS5sb2FkZWQnKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIENvcmU7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29yZTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pUTI5eVpTNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSWtOdmNtVXVZMjltWm1WbElsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lJN1FVRkJRVHM3TzBGQlFVRXNTVUZCUVN4alFVRkJPMFZCUVVFN08wRkJSMEVzUTBGQlFTeEhRVUZKTEU5QlFVRXNRMEZCVXl4UlFVRlVPenRCUVVOS0xFdEJRVUVzUjBGQlVTeFBRVUZCTEVOQlFWTXNWVUZCVkRzN1FVRkhSanM3T3pzN2FVSkJSMHdzUzBGQlFTeEhRVUZQTEZOQlFVRTdTVUZEVGl4SlFVRkhMRXRCUVVzc1EwRkJReXhaUVVGT0xFTkJRVzlDTEdWQlFYQkNMRVZCUVhGRExFbEJRWEpETEVOQlFVZzdUVUZEUXl4TFFVRkxMRU5CUVVNc1VVRkJUaXhEUVVGbExHVkJRV1lzUlVGRVJEczdTVUZKUVN4RFFVRkJMRU5CUVVjc1lVRkJTQ3hEUVVGclFpeERRVUZETEZsQlFXNUNMRU5CUVdsRExFbEJRVU1zUTBGQlFTeE5RVUZzUXp0RlFVeE5PenRwUWtGVlVDeE5RVUZCTEVkQlFWRXNVMEZCUVR0SlFVTlFMRWxCUVVjc1MwRkJTeXhEUVVGRExGbEJRVTRzUTBGQmIwSXNaMEpCUVhCQ0xFVkJRWE5ETEVsQlFYUkRMRU5CUVVnN1RVRkRReXhMUVVGTExFTkJRVU1zVVVGQlRpeERRVUZsTEdkQ1FVRm1MRVZCUkVRN08wVkJSRTg3T3pzN096dEJRVTlVTEUxQlFVMHNRMEZCUXl4UFFVRlFMRWRCUVdsQ0luMD1cbiIsInZhciBIb29rcywgUG9ydGZvbGlvX01hbmFnZXI7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cblxuLypcblxuICAgICAqIEluaXRpYWxpemUgUG9ydGZvbGlvIENvcmVcblx0LS0tXG5cdFx0VXNpbmcgcDUwIEAgYHBwLmNvcmUucmVhZHlgXG5cdFx0TGF0ZSBwcmlvcml0eSBpcyBnb2luZyB0byBmb3JjZSBleHBsaWNpdCBwcmlvcml0eSBpbiBhbnkgb3RoZXIgbW92aW5nIHBhcnRzIHRoYXQgYXJlIGdvaW5nIHRvIHRvdWNoIHBvcnRmb2xpbyBsYXlvdXQgYXQgYHBwLmxvYWRlZGBcblx0LS0tXG4gKi9cblxuUG9ydGZvbGlvX01hbmFnZXIgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIFBvcnRmb2xpb19NYW5hZ2VyKCkge31cblxuICBQb3J0Zm9saW9fTWFuYWdlci5wcm90b3R5cGUucHJlcGFyZSA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5wb3J0Zm9saW8ucHJlcGFyZScpO1xuICB9O1xuXG4gIFBvcnRmb2xpb19NYW5hZ2VyLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBIb29rcy5kb0FjdGlvbigncHAucG9ydGZvbGlvLmNyZWF0ZScpO1xuICB9O1xuXG4gIFBvcnRmb2xpb19NYW5hZ2VyLnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MuZG9BY3Rpb24oJ3BwLnBvcnRmb2xpby5yZWZyZXNoJyk7XG4gIH07XG5cbiAgUG9ydGZvbGlvX01hbmFnZXIucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICBIb29rcy5kb0FjdGlvbigncHAucG9ydGZvbGlvLmRlc3Ryb3knKTtcbiAgICBIb29rcy5yZW1vdmVBY3Rpb24oJ3BwLmxvYWRlZCcsIHRoaXMuY3JlYXRlLCA1MCk7XG4gIH07XG5cbiAgcmV0dXJuIFBvcnRmb2xpb19NYW5hZ2VyO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBvcnRmb2xpb19NYW5hZ2VyO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lVRzl5ZEdadmJHbHZYMDFoYm1GblpYSXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lKUWIzSjBabTlzYVc5ZlRXRnVZV2RsY2k1amIyWm1aV1VpWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFc1NVRkJRVHM3UVVGQlFTeExRVUZCTEVkQlFWRXNUMEZCUVN4RFFVRlRMRlZCUVZRN096dEJRVVZTT3pzN096czdPenM3UVVGVFRUczdPemhDUVVWTUxFOUJRVUVzUjBGQlV5eFRRVUZCTzBsQlExSXNTMEZCU3l4RFFVRkRMRkZCUVU0c1EwRkJaU3h6UWtGQlpqdEZRVVJST3pzNFFrRkpWQ3hOUVVGQkxFZEJRVkVzVTBGQlFUdEpRVU5RTEV0QlFVc3NRMEZCUXl4UlFVRk9MRU5CUVdVc2NVSkJRV1k3UlVGRVR6czdPRUpCUzFJc1QwRkJRU3hIUVVGVExGTkJRVUU3U1VGRFVpeExRVUZMTEVOQlFVTXNVVUZCVGl4RFFVRmxMSE5DUVVGbU8wVkJSRkU3T3poQ1FVdFVMRTlCUVVFc1IwRkJVeXhUUVVGQk8wbEJSVklzUzBGQlN5eERRVUZETEZGQlFVNHNRMEZCWlN4elFrRkJaanRKUVVOQkxFdEJRVXNzUTBGQlF5eFpRVUZPTEVOQlFXMUNMRmRCUVc1Q0xFVkJRV2RETEVsQlFVTXNRMEZCUVN4TlFVRnFReXhGUVVGNVF5eEZRVUY2UXp0RlFVaFJPenM3T3pzN1FVRlBWaXhOUVVGTkxFTkJRVU1zVDBGQlVDeEhRVUZwUWlKOVxuIiwidmFyIEhvb2tzLCBnZXRfc2l6ZTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuZ2V0X3NpemUgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICB3aWR0aDogd2luZG93LmlubmVyV2lkdGggfHwgJHdpbmRvdy53aWR0aCgpLFxuICAgIGhlaWdodDogd2luZG93LmlubmVySGVpZ2h0IHx8ICR3aW5kb3cuaGVpZ2h0KClcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0X3NpemUoKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVjJsdVpHOTNMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaVYybHVaRzkzTG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4SlFVRkJPenRCUVVGQkxFdEJRVUVzUjBGQlVTeFBRVUZCTEVOQlFWTXNWVUZCVkRzN1FVRkhVaXhSUVVGQkxFZEJRVmNzVTBGQlFUdFRRVU5XTzBsQlFVRXNTMEZCUVN4RlFVRlJMRTFCUVUwc1EwRkJReXhWUVVGUUxFbEJRWEZDTEU5QlFVOHNRMEZCUXl4TFFVRlNMRU5CUVVFc1EwRkJOMEk3U1VGRFFTeE5RVUZCTEVWQlFWRXNUVUZCVFN4RFFVRkRMRmRCUVZBc1NVRkJjMElzVDBGQlR5eERRVUZETEUxQlFWSXNRMEZCUVN4RFFVUTVRanM3UVVGRVZUczdRVUZMV0N4TlFVRk5MRU5CUVVNc1QwRkJVQ3hIUVVGcFFpeFJRVUZCTEVOQlFVRWlmUT09XG4iLCJcbi8qXG4gICAgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBIb29rcywgSXRlbV9EYXRhLCBMYXp5X0xvYWRlcjtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbkl0ZW1fRGF0YSA9IHJlcXVpcmUoJy4vSXRlbV9EYXRhJyk7XG5cbkxhenlfTG9hZGVyID0gKGZ1bmN0aW9uKCkge1xuICBMYXp5X0xvYWRlci5wcm90b3R5cGUuRWxlbWVudHMgPSB7XG4gICAgaXRlbTogJ1BQX0xhenlfSW1hZ2UnLFxuICAgIHBsYWNlaG9sZGVyOiAnUFBfTGF6eV9JbWFnZV9fcGxhY2Vob2xkZXInLFxuICAgIGxpbms6ICdQUF9KU19MYXp5X19saW5rJyxcbiAgICBpbWFnZTogJ1BQX0pTX0xhenlfX2ltYWdlJ1xuICB9O1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5JdGVtcyA9IFtdO1xuXG4gIGZ1bmN0aW9uIExhenlfTG9hZGVyKCkge1xuICAgIHRoaXMuc2V0dXBfZGF0YSgpO1xuICAgIHRoaXMucmVzaXplX2FsbCgpO1xuICAgIHRoaXMuYXR0YWNoX2V2ZW50cygpO1xuICB9XG5cblxuICAvKlxuICBcdFx0QWJzdHJhY3QgTWV0aG9kc1xuICAgKi9cblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYExhenlfTG9hZGVyYCBtdXN0IGltcGxlbWVudCBgcmVzaXplYCBtZXRob2RcIik7XG4gIH07XG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgTGF6eV9Mb2FkZXJgIG11c3QgaW1wbGVtZW50IGBsb2FkYCBtZXRob2RcIik7XG4gIH07XG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLmF1dG9sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYExhenlfTG9hZGVyYCBtdXN0IGltcGxlbWVudCBgYXV0b2xvYWRgIG1ldGhvZFwiKTtcbiAgfTtcblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUuc2V0dXBfZGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciAkaXRlbXM7XG4gICAgdGhpcy5JdGVtcyA9IFtdO1xuICAgICRpdGVtcyA9ICQoXCIuXCIgKyB0aGlzLkVsZW1lbnRzLml0ZW0pO1xuICAgICRpdGVtcy5lYWNoKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGtleSwgZWwpIHtcbiAgICAgICAgdmFyICRlbDtcbiAgICAgICAgJGVsID0gJChlbCk7XG4gICAgICAgIHJldHVybiBfdGhpcy5JdGVtcy5wdXNoKHtcbiAgICAgICAgICBlbDogZWwsXG4gICAgICAgICAgJGVsOiAkZWwsXG4gICAgICAgICAgZGF0YTogbmV3IEl0ZW1fRGF0YSgkZWwpLFxuICAgICAgICAgIGxvYWRlZDogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfTtcblxuXG4gIC8qXG4gIFx0XHRNZXRob2RzXG4gICAqL1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5yZXNpemVfYWxsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGksIGl0ZW0sIGxlbiwgcmVmLCByZXN1bHRzO1xuICAgIHJlZiA9IHRoaXMuSXRlbXM7XG4gICAgcmVzdWx0cyA9IFtdO1xuICAgIGZvciAoaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgaXRlbSA9IHJlZltpXTtcbiAgICAgIHJlc3VsdHMucHVzaCh0aGlzLnJlc2l6ZShpdGVtKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5sb2FkX2FsbCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpLCBpdGVtLCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICByZWYgPSB0aGlzLkl0ZW1zO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGl0ZW0gPSByZWZbaV07XG4gICAgICB0aGlzLmxvYWQoaXRlbSk7XG4gICAgICByZXN1bHRzLnB1c2godGhpcy5yZW1vdmVfcGxhY2Vob2xkZXIoaXRlbSkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUucmVtb3ZlX3BsYWNlaG9sZGVyID0gZnVuY3Rpb24oaXRlbSkge1xuICAgIHJldHVybiBpdGVtLiRlbC5maW5kKFwiLlwiICsgdGhpcy5FbGVtZW50cy5wbGFjZWhvbGRlciArIFwiLCBub3NjcmlwdFwiKS5yZW1vdmUoKTtcbiAgfTtcblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmRldGFjaF9ldmVudHMoKTtcbiAgfTtcblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUuYXR0YWNoX2V2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBIb29rcy5hZGRBY3Rpb24oJ3BwLmxhenkuYXV0b2xvYWQnLCB0aGlzLmF1dG9sb2FkKTtcbiAgfTtcblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUuZGV0YWNoX2V2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBIb29rcy5yZW1vdmVBY3Rpb24oJ3BwLmxhenkuYXV0b2xvYWQnLCB0aGlzLmF1dG9sb2FkKTtcbiAgfTtcblxuICByZXR1cm4gTGF6eV9Mb2FkZXI7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTGF6eV9Mb2FkZXI7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVFXSnpkSEpoWTNSZlRHRjZlVjlNYjJGa1pYSXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lKQlluTjBjbUZqZEY5TVlYcDVYMHh2WVdSbGNpNWpiMlptWldVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWp0QlFVRkJPenM3UVVGQlFTeEpRVUZCT3p0QlFVZEJMRU5CUVVFc1IwRkJTU3hQUVVGQkxFTkJRVk1zVVVGQlZEczdRVUZEU2l4TFFVRkJMRWRCUVZFc1QwRkJRU3hEUVVGVExGVkJRVlE3TzBGQlExSXNVMEZCUVN4SFFVRlpMRTlCUVVFc1EwRkJVeXhoUVVGVU96dEJRVVZPTzNkQ1FVVk1MRkZCUVVFc1IwRkRRenRKUVVGQkxFbEJRVUVzUlVGQllTeGxRVUZpTzBsQlEwRXNWMEZCUVN4RlFVRmhMRFJDUVVSaU8wbEJSVUVzU1VGQlFTeEZRVUZoTEd0Q1FVWmlPMGxCUjBFc1MwRkJRU3hGUVVGaExHMUNRVWhpT3pzN2QwSkJTMFFzUzBGQlFTeEhRVUZQT3p0RlFVZE5MSEZDUVVGQk8wbEJRMW9zU1VGQlF5eERRVUZCTEZWQlFVUXNRMEZCUVR0SlFVTkJMRWxCUVVNc1EwRkJRU3hWUVVGRUxFTkJRVUU3U1VGRFFTeEpRVUZETEVOQlFVRXNZVUZCUkN4RFFVRkJPMFZCU0ZrN096dEJRVTFpT3pzN08zZENRVWRCTEUxQlFVRXNSMEZCVlN4VFFVRkJPMEZCUVVjc1ZVRkJWU3hKUVVGQkxFdEJRVUVzUTBGQlR5eDVSVUZCVUR0RlFVRmlPenQzUWtGRFZpeEpRVUZCTEVkQlFWVXNVMEZCUVR0QlFVRkhMRlZCUVZVc1NVRkJRU3hMUVVGQkxFTkJRVThzZFVWQlFWQTdSVUZCWWpzN2QwSkJRMVlzVVVGQlFTeEhRVUZWTEZOQlFVRTdRVUZCUnl4VlFVRlZMRWxCUVVFc1MwRkJRU3hEUVVGUExESkZRVUZRTzBWQlFXSTdPM2RDUVVkV0xGVkJRVUVzUjBGQldTeFRRVUZCTzBGQlJWZ3NVVUZCUVR0SlFVRkJMRWxCUVVNc1EwRkJRU3hMUVVGRUxFZEJRVk03U1VGRlZDeE5RVUZCTEVkQlFWTXNRMEZCUVN4RFFVRkhMRWRCUVVFc1IwRkJTU3hKUVVGRExFTkJRVUVzVVVGQlVTeERRVUZETEVsQlFXcENPMGxCUlZRc1RVRkJUU3hEUVVGRExFbEJRVkFzUTBGQldTeERRVUZCTEZOQlFVRXNTMEZCUVR0aFFVRkJMRk5CUVVVc1IwRkJSaXhGUVVGUExFVkJRVkE3UVVGRldDeFpRVUZCTzFGQlFVRXNSMEZCUVN4SFFVRk5MRU5CUVVFc1EwRkJSeXhGUVVGSU8yVkJRMDRzUzBGQlF5eERRVUZCTEV0QlFVc3NRMEZCUXl4SlFVRlFMRU5CUTBNN1ZVRkJRU3hGUVVGQkxFVkJRVkVzUlVGQlVqdFZRVU5CTEVkQlFVRXNSVUZCVVN4SFFVUlNPMVZCUlVFc1NVRkJRU3hGUVVGWkxFbEJRVUVzVTBGQlFTeERRVUZYTEVkQlFWZ3NRMEZHV2p0VlFVZEJMRTFCUVVFc1JVRkJVU3hMUVVoU08xTkJSRVE3VFVGSVZ6dEpRVUZCTEVOQlFVRXNRMEZCUVN4RFFVRkJMRWxCUVVFc1EwRkJXanRGUVU1WE96czdRVUZyUWxvN096czdkMEpCUjBFc1ZVRkJRU3hIUVVGWkxGTkJRVUU3UVVGRFdDeFJRVUZCTzBGQlFVRTdRVUZCUVR0VFFVRkJMSEZEUVVGQk96dHRRa0ZCUVN4SlFVRkRMRU5CUVVFc1RVRkJSQ3hEUVVGVExFbEJRVlE3UVVGQlFUczdSVUZFVnpzN2QwSkJSMW9zVVVGQlFTeEhRVUZWTEZOQlFVRTdRVUZEVkN4UlFVRkJPMEZCUVVFN1FVRkJRVHRUUVVGQkxIRkRRVUZCT3p0TlFVTkRMRWxCUVVNc1EwRkJRU3hKUVVGRUxFTkJRVThzU1VGQlVEdHRRa0ZEUVN4SlFVRkRMRU5CUVVFc2EwSkJRVVFzUTBGQmNVSXNTVUZCY2tJN1FVRkdSRHM3UlVGRVV6czdkMEpCUzFZc2EwSkJRVUVzUjBGQmIwSXNVMEZCUlN4SlFVRkdPMWRCUTI1Q0xFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNTVUZCVkN4RFFVRmxMRWRCUVVFc1IwRkJTU3hKUVVGRExFTkJRVUVzVVVGQlVTeERRVUZETEZkQlFXUXNSMEZCTUVJc1dVRkJla01zUTBGQmMwUXNRMEZCUXl4TlFVRjJSQ3hEUVVGQk8wVkJSRzFDT3p0M1FrRkpjRUlzVDBGQlFTeEhRVUZUTEZOQlFVRTdWMEZEVWl4SlFVRkRMRU5CUVVFc1lVRkJSQ3hEUVVGQk8wVkJSRkU3TzNkQ1FVZFVMR0ZCUVVFc1IwRkJaU3hUUVVGQk8xZEJRMlFzUzBGQlN5eERRVUZETEZOQlFVNHNRMEZCWjBJc2EwSkJRV2hDTEVWQlFXOURMRWxCUVVNc1EwRkJRU3hSUVVGeVF6dEZRVVJqT3p0M1FrRkhaaXhoUVVGQkxFZEJRV1VzVTBGQlFUdFhRVU5rTEV0QlFVc3NRMEZCUXl4WlFVRk9MRU5CUVcxQ0xHdENRVUZ1UWl4RlFVRjFReXhKUVVGRExFTkJRVUVzVVVGQmVFTTdSVUZFWXpzN096czdPMEZCUjJoQ0xFMUJRVTBzUTBGQlF5eFBRVUZRTEVkQlFXbENJbjA9XG4iLCJ2YXIgSXRlbV9EYXRhO1xuXG5JdGVtX0RhdGEgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIEl0ZW1fRGF0YSgkZWwpIHtcbiAgICB2YXIgZGF0YTtcbiAgICB0aGlzLiRlbCA9ICRlbDtcbiAgICBkYXRhID0gJGVsLmRhdGEoJ2l0ZW0nKTtcbiAgICBpZiAoIWRhdGEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkVsZW1lbnQgZG9lc24ndCBjb250YWluIGBkYXRhLWl0ZW1gIGF0dHJpYnV0ZVwiKTtcbiAgICB9XG4gICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgfVxuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X2RhdGEgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGltYWdlO1xuICAgIGltYWdlID0gdGhpcy5kYXRhWydpbWFnZXMnXVtuYW1lXTtcbiAgICBpZiAoIWltYWdlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBpbWFnZTtcbiAgfTtcblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF9zaXplID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBoZWlnaHQsIGltYWdlLCByZWYsIHNpemUsIHdpZHRoO1xuICAgIGltYWdlID0gdGhpcy5nZXRfZGF0YShuYW1lKTtcbiAgICBpZiAoIWltYWdlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHNpemUgPSBpbWFnZVsnc2l6ZSddO1xuICAgIHJlZiA9IHNpemUuc3BsaXQoJ3gnKSwgd2lkdGggPSByZWZbMF0sIGhlaWdodCA9IHJlZlsxXTtcbiAgICB3aWR0aCA9IHBhcnNlSW50KHdpZHRoKTtcbiAgICBoZWlnaHQgPSBwYXJzZUludChoZWlnaHQpO1xuICAgIHJldHVybiBbd2lkdGgsIGhlaWdodF07XG4gIH07XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfdXJsID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBpbWFnZTtcbiAgICBpbWFnZSA9IHRoaXMuZ2V0X2RhdGEobmFtZSk7XG4gICAgaWYgKCFpbWFnZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gaW1hZ2VbJ3VybCddO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X29yX2ZhbHNlID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKHRoaXMuZGF0YVtrZXldKSB7XG4gICAgICByZXR1cm4gdGhpcy5kYXRhW2tleV07XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF9yYXRpbyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldF9vcl9mYWxzZSgncmF0aW8nKTtcbiAgfTtcblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF90eXBlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0X29yX2ZhbHNlKCd0eXBlJyk7XG4gIH07XG5cbiAgcmV0dXJuIEl0ZW1fRGF0YTtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBJdGVtX0RhdGE7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVNYUmxiVjlFWVhSaExtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpU1hSbGJWOUVZWFJoTG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4SlFVRkJPenRCUVVGTk8wVkJSVkVzYlVKQlFVVXNSMEZCUmp0QlFVTmFMRkZCUVVFN1NVRkJRU3hKUVVGRExFTkJRVUVzUjBGQlJDeEhRVUZQTzBsQlExQXNTVUZCUVN4SFFVRlBMRWRCUVVjc1EwRkJReXhKUVVGS0xFTkJRVlVzVFVGQlZqdEpRVVZRTEVsQlFVY3NRMEZCU1N4SlFVRlFPMEZCUTBNc1dVRkJWU3hKUVVGQkxFdEJRVUVzUTBGQlRTd3JRMEZCVGl4RlFVUllPenRKUVVkQkxFbEJRVU1zUTBGQlFTeEpRVUZFTEVkQlFWRTdSVUZRU1RzN2MwSkJWMklzVVVGQlFTeEhRVUZWTEZOQlFVVXNTVUZCUmp0QlFVTlVMRkZCUVVFN1NVRkJRU3hMUVVGQkxFZEJRVkVzU1VGQlF5eERRVUZCTEVsQlFVMHNRMEZCUVN4UlFVRkJMRU5CUVZrc1EwRkJRU3hKUVVGQk8wbEJRek5DTEVsQlFXZENMRU5CUVVrc1MwRkJjRUk3UVVGQlFTeGhRVUZQTEUxQlFWQTdPMEZCUlVFc1YwRkJUenRGUVVwRk96dHpRa0ZOVml4UlFVRkJMRWRCUVZVc1UwRkJSU3hKUVVGR08wRkJRMVFzVVVGQlFUdEpRVUZCTEV0QlFVRXNSMEZCVVN4SlFVRkRMRU5CUVVFc1VVRkJSQ3hEUVVGWExFbEJRVmc3U1VGRFVpeEpRVUZuUWl4RFFVRkpMRXRCUVhCQ08wRkJRVUVzWVVGQlR5eE5RVUZRT3p0SlFVVkJMRWxCUVVFc1IwRkJUeXhMUVVGUExFTkJRVUVzVFVGQlFUdEpRVVZrTEUxQlFXdENMRWxCUVVrc1EwRkJReXhMUVVGTUxFTkJRVmtzUjBGQldpeERRVUZzUWl4RlFVRkRMR05CUVVRc1JVRkJVVHRKUVVWU0xFdEJRVUVzUjBGQlVTeFJRVUZCTEVOQlFWVXNTMEZCVmp0SlFVTlNMRTFCUVVFc1IwRkJVeXhSUVVGQkxFTkJRVlVzVFVGQlZqdEJRVVZVTEZkQlFVOHNRMEZCUXl4TFFVRkVMRVZCUVZFc1RVRkJVanRGUVZoRk96dHpRa0ZoVml4UFFVRkJMRWRCUVZNc1UwRkJSU3hKUVVGR08wRkJRMUlzVVVGQlFUdEpRVUZCTEV0QlFVRXNSMEZCVVN4SlFVRkRMRU5CUVVFc1VVRkJSQ3hEUVVGWExFbEJRVmc3U1VGRFVpeEpRVUZuUWl4RFFVRkpMRXRCUVhCQ08wRkJRVUVzWVVGQlR5eE5RVUZRT3p0QlFVTkJMRmRCUVU4c1MwRkJUeXhEUVVGQkxFdEJRVUU3UlVGSVRqczdjMEpCUzFRc1dVRkJRU3hIUVVGakxGTkJRVVVzUjBGQlJqdEpRVU5pTEVsQlFVY3NTVUZCUXl4RFFVRkJMRWxCUVUwc1EwRkJRU3hIUVVGQkxFTkJRVlk3UVVGRFF5eGhRVUZQTEVsQlFVTXNRMEZCUVN4SlFVRk5MRU5CUVVFc1IwRkJRU3hGUVVSbU96dEJRVVZCTEZkQlFVODdSVUZJVFRzN2MwSkJTMlFzVTBGQlFTeEhRVUZqTEZOQlFVRTdWMEZCUnl4SlFVRkRMRU5CUVVFc1dVRkJSQ3hEUVVGbExFOUJRV1k3UlVGQlNEczdjMEpCUTJRc1VVRkJRU3hIUVVGakxGTkJRVUU3VjBGQlJ5eEpRVUZETEVOQlFVRXNXVUZCUkN4RFFVRmxMRTFCUVdZN1JVRkJTRHM3T3pzN08wRkJSMllzVFVGQlRTeERRVUZETEU5QlFWQXNSMEZCYVVJaWZRPT1cbiIsInZhciAkLCBBYnN0cmFjdF9MYXp5X0xvYWRlciwgTGF6eV9NYXNvbnJ5LCBfX1dJTkRPVyxcbiAgYmluZCA9IGZ1bmN0aW9uKGZuLCBtZSl7IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7IH07IH0sXG4gIGV4dGVuZCA9IGZ1bmN0aW9uKGNoaWxkLCBwYXJlbnQpIHsgZm9yICh2YXIga2V5IGluIHBhcmVudCkgeyBpZiAoaGFzUHJvcC5jYWxsKHBhcmVudCwga2V5KSkgY2hpbGRba2V5XSA9IHBhcmVudFtrZXldOyB9IGZ1bmN0aW9uIGN0b3IoKSB7IHRoaXMuY29uc3RydWN0b3IgPSBjaGlsZDsgfSBjdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7IGNoaWxkLnByb3RvdHlwZSA9IG5ldyBjdG9yKCk7IGNoaWxkLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7IHJldHVybiBjaGlsZDsgfSxcbiAgaGFzUHJvcCA9IHt9Lmhhc093blByb3BlcnR5O1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuQWJzdHJhY3RfTGF6eV9Mb2FkZXIgPSByZXF1aXJlKCcuL0Fic3RyYWN0X0xhenlfTG9hZGVyJyk7XG5cbl9fV0lORE9XID0gcmVxdWlyZSgnLi4vZ2xvYmFsL1dpbmRvdycpO1xuXG5MYXp5X01hc29ucnkgPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICBleHRlbmQoTGF6eV9NYXNvbnJ5LCBzdXBlckNsYXNzKTtcblxuICBmdW5jdGlvbiBMYXp5X01hc29ucnkoKSB7XG4gICAgdGhpcy5sb2FkX2l0ZW1zX2luX3ZpZXcgPSBiaW5kKHRoaXMubG9hZF9pdGVtc19pbl92aWV3LCB0aGlzKTtcbiAgICB0aGlzLmF1dG9sb2FkID0gYmluZCh0aGlzLmF1dG9sb2FkLCB0aGlzKTtcbiAgICB0aGlzLmRlYm91bmNlZF9sb2FkX2l0ZW1zX2luX3ZpZXcgPSBfLmRlYm91bmNlKHRoaXMubG9hZF9pdGVtc19pbl92aWV3LCA1MCk7XG4gICAgTGF6eV9NYXNvbnJ5Ll9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMpO1xuICB9XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0uJGVsLmNzcyh7XG4gICAgICAnbWluLWhlaWdodCc6IE1hdGguZmxvb3IodGhpcy5nZXRfd2lkdGgoKSAvIGl0ZW0uZGF0YS5nZXRfcmF0aW8oKSlcbiAgICB9KTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmdldF93aWR0aCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAkKCcuUFBfTWFzb25yeV9fc2l6ZXInKS53aWR0aCgpO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUuYXV0b2xvYWQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5sb2FkX2l0ZW1zX2luX3ZpZXcoKTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmxvYWQgPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgdmFyICRpbWFnZSwgZnVsbCwgdGh1bWI7XG4gICAgdGh1bWIgPSBpdGVtLmRhdGEuZ2V0X3VybCgndGh1bWInKTtcbiAgICBmdWxsID0gaXRlbS5kYXRhLmdldF91cmwoJ2Z1bGwnKTtcbiAgICBpdGVtLiRlbC5wcmVwZW5kKFwiPGEgY2xhc3M9XFxcIlwiICsgdGhpcy5FbGVtZW50cy5saW5rICsgXCJcXFwiIGhyZWY9XFxcIlwiICsgZnVsbCArIFwiXFxcIiByZWw9XFxcImdhbGxlcnlcXFwiPlxcbjxpbWcgY2xhc3M9XFxcIlwiICsgdGhpcy5FbGVtZW50cy5pbWFnZSArIFwiXFxcIiBzcmM9XFxcIlwiICsgdGh1bWIgKyBcIlxcXCIgY2xhc3M9XFxcIlBQX0pTX19sb2FkaW5nXFxcIiAvPlxcbjwvYT5cIikucmVtb3ZlQ2xhc3MoJ0xhenktSW1hZ2UnKTtcbiAgICBpdGVtLmxvYWRlZCA9IHRydWU7XG4gICAgJGltYWdlID0gaXRlbS4kZWwuZmluZCgnaW1nJyk7XG4gICAgcmV0dXJuICRpbWFnZS5pbWFnZXNMb2FkZWQoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICRpbWFnZS5hZGRDbGFzcygnUFBfSlNfX2xvYWRlZCcpLnJlbW92ZUNsYXNzKCdQUF9KU19fbG9hZGluZycpO1xuICAgICAgICByZXR1cm4gaXRlbS4kZWwuY3NzKCdtaW4taGVpZ2h0JywgJycpLnJlbW92ZUNsYXNzKF90aGlzLkVsZW1lbnRzLml0ZW0pLmZpbmQoXCIuXCIgKyBfdGhpcy5FbGVtZW50cy5wbGFjZWhvbGRlcikuZmFkZU91dCg0MDAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiAkKHRoaXMpLnJlbW92ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUubG9hZF9pdGVtc19pbl92aWV3ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGksIGl0ZW0sIGtleSwgbGVuLCByZWYsIHJlc3VsdHM7XG4gICAgcmVmID0gdGhpcy5JdGVtcztcbiAgICByZXN1bHRzID0gW107XG4gICAgZm9yIChrZXkgPSBpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsga2V5ID0gKytpKSB7XG4gICAgICBpdGVtID0gcmVmW2tleV07XG4gICAgICBpZiAoIWl0ZW0ubG9hZGVkICYmIHRoaXMuaW5fbG9vc2VfdmlldyhpdGVtLmVsKSkge1xuICAgICAgICByZXN1bHRzLnB1c2godGhpcy5sb2FkKGl0ZW0pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdHMucHVzaCh2b2lkIDApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmluX2xvb3NlX3ZpZXcgPSBmdW5jdGlvbihlbCkge1xuICAgIHZhciByZWN0LCBzZW5zaXRpdml0eTtcbiAgICBpZiAoZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0ID09IG51bGwpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgc2Vuc2l0aXZpdHkgPSAxMDA7XG4gICAgcmV0dXJuIHJlY3QudG9wICsgcmVjdC5oZWlnaHQgPj0gLXNlbnNpdGl2aXR5ICYmIHJlY3QuYm90dG9tIC0gcmVjdC5oZWlnaHQgPD0gX19XSU5ET1cuaGVpZ2h0ICsgc2Vuc2l0aXZpdHkgJiYgcmVjdC5sZWZ0ICsgcmVjdC53aWR0aCA+PSAtc2Vuc2l0aXZpdHkgJiYgcmVjdC5yaWdodCAtIHJlY3Qud2lkdGggPD0gX19XSU5ET1cud2lkdGggKyBzZW5zaXRpdml0eTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmF0dGFjaF9ldmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAkKHdpbmRvdykub24oJ3Njcm9sbCcsIHRoaXMuZGVib3VuY2VkX2xvYWRfaXRlbXNfaW5fdmlldyk7XG4gICAgcmV0dXJuIExhenlfTWFzb25yeS5fX3N1cGVyX18uYXR0YWNoX2V2ZW50cy5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUuZGV0YWNoX2V2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICQod2luZG93KS5vZmYoJ3Njcm9sbCcsIHRoaXMuZGVib3VuY2VkX2xvYWRfaXRlbXNfaW5fdmlldyk7XG4gICAgcmV0dXJuIExhenlfTWFzb25yeS5fX3N1cGVyX18uZGV0YWNoX2V2ZW50cy5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpLCBpdGVtLCBrZXksIGxlbiwgcmVmO1xuICAgIHJlZiA9IHRoaXMuSXRlbXM7XG4gICAgZm9yIChrZXkgPSBpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsga2V5ID0gKytpKSB7XG4gICAgICBpdGVtID0gcmVmW2tleV07XG4gICAgICBpdGVtLiRlbC5jc3MoJ21pbi1oZWlnaHQnLCAnJyk7XG4gICAgfVxuICAgIHJldHVybiBMYXp5X01hc29ucnkuX19zdXBlcl9fLmRlc3Ryb3kuY2FsbCh0aGlzKTtcbiAgfTtcblxuICByZXR1cm4gTGF6eV9NYXNvbnJ5O1xuXG59KShBYnN0cmFjdF9MYXp5X0xvYWRlcik7XG5cbm1vZHVsZS5leHBvcnRzID0gTGF6eV9NYXNvbnJ5O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lUR0Y2ZVY5TllYTnZibko1TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lUR0Y2ZVY5TllYTnZibko1TG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4SlFVRkJMQ3REUVVGQk8wVkJRVUU3T3pzN1FVRkJRU3hEUVVGQkxFZEJRVWtzVDBGQlFTeERRVUZUTEZGQlFWUTdPMEZCUTBvc2IwSkJRVUVzUjBGQmRVSXNUMEZCUVN4RFFVRlRMSGRDUVVGVU96dEJRVU4yUWl4UlFVRkJMRWRCUVZjc1QwRkJRU3hEUVVGVExHdENRVUZVT3p0QlFVVk1PenM3UlVGRlVTeHpRa0ZCUVRzN08wbEJRMW9zU1VGQlF5eERRVUZCTERSQ1FVRkVMRWRCUVdkRExFTkJRVU1zUTBGQlF5eFJRVUZHTEVOQlFWa3NTVUZCUXl4RFFVRkJMR3RDUVVGaUxFVkJRV2xETEVWQlFXcERPMGxCUTJoRExEUkRRVUZCTzBWQlJsazdPM2xDUVV0aUxFMUJRVUVzUjBGQlVTeFRRVUZGTEVsQlFVWTdWMEZEVUN4SlFVRkpMRU5CUVVNc1IwRkJSeXhEUVVGRExFZEJRVlFzUTBGQllUdE5RVUZCTEZsQlFVRXNSVUZCWXl4SlFVRkpMRU5CUVVNc1MwRkJUQ3hEUVVGWkxFbEJRVU1zUTBGQlFTeFRRVUZFTEVOQlFVRXNRMEZCUVN4SFFVRmxMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zVTBGQlZpeERRVUZCTEVOQlFUTkNMRU5CUVdRN1MwRkJZanRGUVVSUE96dDVRa0ZKVWl4VFFVRkJMRWRCUVZjc1UwRkJRVHRYUVVWV0xFTkJRVUVzUTBGQlJ5eHZRa0ZCU0N4RFFVRjVRaXhEUVVGRExFdEJRVEZDTEVOQlFVRTdSVUZHVlRzN2VVSkJUVmdzVVVGQlFTeEhRVUZWTEZOQlFVRTdWMEZCUnl4SlFVRkRMRU5CUVVFc2EwSkJRVVFzUTBGQlFUdEZRVUZJT3p0NVFrRkpWaXhKUVVGQkxFZEJRVTBzVTBGQlJTeEpRVUZHTzBGQlJVd3NVVUZCUVR0SlFVRkJMRXRCUVVFc1IwRkJVU3hKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFWWXNRMEZCYlVJc1QwRkJia0k3U1VGRFVpeEpRVUZCTEVkQlFVOHNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGV0xFTkJRVzFDTEUxQlFXNUNPMGxCUlZBc1NVRkJTU3hEUVVGRExFZEJRMHdzUTBGQlF5eFBRVVJFTEVOQlExVXNZVUZCUVN4SFFVTkpMRWxCUVVNc1EwRkJRU3hSUVVGUkxFTkJRVU1zU1VGRVpDeEhRVU50UWl4WlFVUnVRaXhIUVVNMlFpeEpRVVEzUWl4SFFVTnJReXh2UTBGRWJFTXNSMEZGVFN4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExFdEJSbWhDTEVkQlJYTkNMRmRCUm5SQ0xFZEJSU3RDTEV0QlJpOUNMRWRCUlhGRExITkRRVWd2UXl4RFFVMUJMRU5CUVVNc1YwRk9SQ3hEUVUxakxGbEJUbVE3U1VGUlFTeEpRVUZKTEVOQlFVTXNUVUZCVEN4SFFVRmpPMGxCUTJRc1RVRkJRU3hIUVVGVExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNTVUZCVkN4RFFVRmxMRXRCUVdZN1YwRkRWQ3hOUVVGTkxFTkJRVU1zV1VGQlVDeERRVUZ2UWl4RFFVRkJMRk5CUVVFc1MwRkJRVHRoUVVGQkxGTkJRVUU3VVVGRmJrSXNUVUZCVFN4RFFVRkRMRkZCUVZBc1EwRkJhVUlzWlVGQmFrSXNRMEZCYTBNc1EwRkJReXhYUVVGdVF5eERRVUZuUkN4blFrRkJhRVE3WlVGRFFTeEpRVUZKTEVOQlFVTXNSMEZEVEN4RFFVRkRMRWRCUkVRc1EwRkRUU3haUVVST0xFVkJRMjlDTEVWQlJIQkNMRU5CUlVFc1EwRkJReXhYUVVaRUxFTkJSV01zUzBGQlF5eERRVUZCTEZGQlFWRXNRMEZCUXl4SlFVWjRRaXhEUVVkQkxFTkJRVU1zU1VGSVJDeERRVWRQTEVkQlFVRXNSMEZCU1N4TFFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExGZEJTSEpDTEVOQlNVRXNRMEZCUXl4UFFVcEVMRU5CU1ZNc1IwRktWQ3hGUVVsakxGTkJRVUU3YVVKQlFVY3NRMEZCUVN4RFFVRkhMRWxCUVVnc1EwRkJVeXhEUVVGRExFMUJRVllzUTBGQlFUdFJRVUZJTEVOQlNtUTdUVUZJYlVJN1NVRkJRU3hEUVVGQkxFTkJRVUVzUTBGQlFTeEpRVUZCTEVOQlFYQkNPMFZCWmtzN08zbENRVFJDVGl4clFrRkJRU3hIUVVGdlFpeFRRVUZCTzBGQlEyNUNMRkZCUVVFN1FVRkJRVHRCUVVGQk8xTkJRVUVzYVVSQlFVRTdPMDFCUTBNc1NVRkJSeXhEUVVGSkxFbEJRVWtzUTBGQlF5eE5RVUZVTEVsQlFXOUNMRWxCUVVNc1EwRkJRU3hoUVVGRUxFTkJRV2RDTEVsQlFVa3NRMEZCUXl4RlFVRnlRaXhEUVVGMlFqdHhRa0ZEUXl4SlFVRkRMRU5CUVVFc1NVRkJSQ3hEUVVGUExFbEJRVkFzUjBGRVJEdFBRVUZCTEUxQlFVRTdOa0pCUVVFN08wRkJSRVE3TzBWQlJHMUNPenQ1UWtGUGNFSXNZVUZCUVN4SFFVRmxMRk5CUVVVc1JVRkJSanRCUVVOa0xGRkJRVUU3U1VGQlFTeEpRVUZ0UWl4blEwRkJia0k3UVVGQlFTeGhRVUZQTEV0QlFWQTdPMGxCUTBFc1NVRkJRU3hIUVVGUExFVkJRVVVzUTBGQlF5eHhRa0ZCU0N4RFFVRkJPMGxCUjFBc1YwRkJRU3hIUVVGak8wRkJRMlFzVjBGRlF5eEpRVUZKTEVOQlFVTXNSMEZCVEN4SFFVRlhMRWxCUVVrc1EwRkJReXhOUVVGb1FpeEpRVUV3UWl4RFFVRkRMRmRCUVROQ0xFbEJRME1zU1VGQlNTeERRVUZETEUxQlFVd3NSMEZCWXl4SlFVRkpMRU5CUVVNc1RVRkJia0lzU1VGQk5rSXNVVUZCVVN4RFFVRkRMRTFCUVZRc1IwRkJhMElzVjBGRWFFUXNTVUZKUXl4SlFVRkpMRU5CUVVNc1NVRkJUQ3hIUVVGWkxFbEJRVWtzUTBGQlF5eExRVUZxUWl4SlFVRXdRaXhEUVVGRExGZEJTalZDTEVsQlMwTXNTVUZCU1N4RFFVRkRMRXRCUVV3c1IwRkJZU3hKUVVGSkxFTkJRVU1zUzBGQmJFSXNTVUZCTWtJc1VVRkJVU3hEUVVGRExFdEJRVlFzUjBGQmFVSTdSVUZpYUVNN08zbENRV2xDWml4aFFVRkJMRWRCUVdVc1UwRkJRVHRKUVVOa0xFTkJRVUVzUTBGQlJ5eE5RVUZJTEVOQlFWY3NRMEZCUXl4RlFVRmFMRU5CUVdVc1VVRkJaaXhGUVVGNVFpeEpRVUZETEVOQlFVRXNORUpCUVRGQ08xZEJRMEVzT0VOQlFVRTdSVUZHWXpzN2VVSkJTV1lzWVVGQlFTeEhRVUZsTEZOQlFVRTdTVUZEWkN4RFFVRkJMRU5CUVVjc1RVRkJTQ3hEUVVGWExFTkJRVU1zUjBGQldpeERRVUZuUWl4UlFVRm9RaXhGUVVFd1FpeEpRVUZETEVOQlFVRXNORUpCUVROQ08xZEJRMEVzT0VOQlFVRTdSVUZHWXpzN2VVSkJTV1lzVDBGQlFTeEhRVUZUTEZOQlFVRTdRVUZEVWl4UlFVRkJPMEZCUVVFN1FVRkJRU3hUUVVGQkxHbEVRVUZCT3p0TlFVTkRMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zUjBGQlZDeERRVUZoTEZsQlFXSXNSVUZCTWtJc1JVRkJNMEk3UVVGRVJEdFhRVWRCTEhkRFFVRkJPMFZCU2xFN096czdSMEZxUm1sQ096dEJRWFZHTTBJc1RVRkJUU3hEUVVGRExFOUJRVkFzUjBGQmFVSWlmUT09XG4iLCJcbi8qXG4gICAgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBIb29rcywgUG9ydGZvbGlvX0FjdGlvbnMsIFBvcnRmb2xpb19NYXNvbnJ5LFxuICBiaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfSxcbiAgZXh0ZW5kID0gZnVuY3Rpb24oY2hpbGQsIHBhcmVudCkgeyBmb3IgKHZhciBrZXkgaW4gcGFyZW50KSB7IGlmIChoYXNQcm9wLmNhbGwocGFyZW50LCBrZXkpKSBjaGlsZFtrZXldID0gcGFyZW50W2tleV07IH0gZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9IGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTsgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTsgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTsgcmV0dXJuIGNoaWxkOyB9LFxuICBoYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHk7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5Qb3J0Zm9saW9fQWN0aW9ucyA9IHJlcXVpcmUoJy4vLi4vY2xhc3MvQWJzdHJhY3RfUG9ydGZvbGlvX0FjdGlvbnMnKTtcblxuUG9ydGZvbGlvX01hc29ucnkgPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICBleHRlbmQoUG9ydGZvbGlvX01hc29ucnksIHN1cGVyQ2xhc3MpO1xuXG4gIGZ1bmN0aW9uIFBvcnRmb2xpb19NYXNvbnJ5KCkge1xuICAgIHRoaXMucmVmcmVzaCA9IGJpbmQodGhpcy5yZWZyZXNoLCB0aGlzKTtcbiAgICB0aGlzLmRlc3Ryb3kgPSBiaW5kKHRoaXMuZGVzdHJveSwgdGhpcyk7XG4gICAgdGhpcy5jcmVhdGUgPSBiaW5kKHRoaXMuY3JlYXRlLCB0aGlzKTtcbiAgICB0aGlzLnByZXBhcmUgPSBiaW5kKHRoaXMucHJlcGFyZSwgdGhpcyk7XG4gICAgcmV0dXJuIFBvcnRmb2xpb19NYXNvbnJ5Ll9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLkVsZW1lbnRzID0ge1xuICAgIGNvbnRhaW5lcjogJ1BQX01hc29ucnknLFxuICAgIHNpemVyOiAnUFBfTWFzb25yeV9fc2l6ZXInLFxuICAgIGl0ZW06ICdQUF9NYXNvbnJ5X19pdGVtJ1xuICB9O1xuXG5cbiAgLypcbiAgXHRcdEluaXRpYWxpemVcbiAgICovXG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLmluaXRpYWxpemUgPSBmdW5jdGlvbigkcGFyZW50KSB7XG4gICAgcmV0dXJuIHRoaXMuJGNvbnRhaW5lciA9ICRwYXJlbnQuZmluZChcIi5cIiArIHRoaXMuRWxlbWVudHMuY29udGFpbmVyKTtcbiAgfTtcblxuXG4gIC8qXG4gIFx0XHRQcmVwYXJlICYgQXR0YWNoIEV2ZW50c1xuICAgICBcdERvbid0IHNob3cgYW55dGhpbmcgeWV0LlxuICBcbiAgXHRcdEBjYWxsZWQgb24gaG9vayBgcHAucG9ydGZvbGlvLnByZXBhcmVgXG4gICAqL1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5wcmVwYXJlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG1hc29ucnlfc2V0dGluZ3M7XG4gICAgaWYgKHRoaXMuJGNvbnRhaW5lci5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy4kY29udGFpbmVyLmFkZENsYXNzKCdQUF9KU19fbG9hZGluZ19tYXNvbnJ5Jyk7XG4gICAgdGhpcy5tYXliZV9jcmVhdGVfc2l6ZXIoKTtcbiAgICBtYXNvbnJ5X3NldHRpbmdzID0gSG9va3MuYXBwbHlGaWx0ZXJzKCdwcC5tYXNvbnJ5LnNldHRpbmdzJywge1xuICAgICAgaXRlbVNlbGVjdG9yOiBcIi5cIiArIHRoaXMuRWxlbWVudHMuaXRlbSxcbiAgICAgIGNvbHVtbldpZHRoOiBcIi5cIiArIHRoaXMuRWxlbWVudHMuc2l6ZXIsXG4gICAgICBndXR0ZXI6IDAsXG4gICAgICBpbml0TGF5b3V0OiBmYWxzZVxuICAgIH0pO1xuICAgIHRoaXMuJGNvbnRhaW5lci5tYXNvbnJ5KG1hc29ucnlfc2V0dGluZ3MpO1xuICAgIHJldHVybiB0aGlzLiRjb250YWluZXIubWFzb25yeSgnb25jZScsICdsYXlvdXRDb21wbGV0ZScsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBfdGhpcy4kY29udGFpbmVyLnJlbW92ZUNsYXNzKCdQUF9KU19fbG9hZGluZ19tYXNvbnJ5JykuYWRkQ2xhc3MoJ1BQX0pTX19sb2FkaW5nX2NvbXBsZXRlJyk7XG4gICAgICAgIHJldHVybiBIb29rcy5kb0FjdGlvbigncHAucG9ydGZvbGlvLnJlZnJlc2gnKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9O1xuXG5cbiAgLypcbiAgXHRcdFN0YXJ0IHRoZSBQb3J0Zm9saW9cbiAgXHRcdEBjYWxsZWQgb24gaG9vayBgcHAucG9ydGZvbGlvLmNyZWF0ZWBcbiAgICovXG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJGNvbnRhaW5lci5tYXNvbnJ5KCk7XG4gIH07XG5cblxuICAvKlxuICBcdFx0RGVzdHJveVxuICBcdFx0QGNhbGxlZCBvbiBob29rIGBwcC5wb3J0Zm9saW8uZGVzdHJveWBcbiAgICovXG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLm1heWJlX3JlbW92ZV9zaXplcigpO1xuICAgIGlmICh0aGlzLiRjb250YWluZXIubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy4kY29udGFpbmVyLm1hc29ucnkoJ2Rlc3Ryb3knKTtcbiAgICB9XG4gIH07XG5cblxuICAvKlxuICBcdFx0UmVsb2FkIHRoZSBsYXlvdXRcbiAgXHRcdEBjYWxsZWQgb24gaG9vayBgcHAucG9ydGZvbGlvLnJlZnJlc2hgXG4gICAqL1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuJGNvbnRhaW5lci5tYXNvbnJ5KCdsYXlvdXQnKTtcbiAgfTtcblxuXG4gIC8qXG4gIFx0XHRDcmVhdGUgYSBzaXplciBlbGVtZW50IGZvciBqcXVlcnktbWFzb25yeSB0byB1c2VcbiAgICovXG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLm1heWJlX2NyZWF0ZV9zaXplciA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnNpemVyX2RvZXNudF9leGlzdCgpKSB7XG4gICAgICB0aGlzLmNyZWF0ZV9zaXplcigpO1xuICAgIH1cbiAgfTtcblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUubWF5YmVfcmVtb3ZlX3NpemVyID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuJGNvbnRhaW5lci5sZW5ndGggIT09IDEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy4kY29udGFpbmVyLmZpbmQoXCIuXCIgKyB0aGlzLkVsZW1lbnRzLnNpemVyKS5yZW1vdmUoKTtcbiAgfTtcblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUuc2l6ZXJfZG9lc250X2V4aXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuJGNvbnRhaW5lci5maW5kKFwiLlwiICsgdGhpcy5FbGVtZW50cy5zaXplcikubGVuZ3RoID09PSAwO1xuICB9O1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5jcmVhdGVfc2l6ZXIgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRjb250YWluZXIuYXBwZW5kKFwiPGRpdiBjbGFzcz1cXFwiXCIgKyB0aGlzLkVsZW1lbnRzLnNpemVyICsgXCJcXFwiPjwvZGl2PlwiKTtcbiAgfTtcblxuICByZXR1cm4gUG9ydGZvbGlvX01hc29ucnk7XG5cbn0pKFBvcnRmb2xpb19BY3Rpb25zKTtcblxubW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW9fTWFzb25yeTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVUc5eWRHWnZiR2x2WDAxaGMyOXVjbmt1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SlFiM0owWm05c2FXOWZUV0Z6YjI1eWVTNWpiMlptWldVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWp0QlFVRkJPenM3UVVGQlFTeEpRVUZCTERoRFFVRkJPMFZCUVVFN096czdRVUZIUVN4RFFVRkJMRWRCUVVrc1QwRkJRU3hEUVVGVExGRkJRVlE3TzBGQlEwb3NTMEZCUVN4SFFVRlJMRTlCUVVFc1EwRkJVeXhWUVVGVU96dEJRVU5TTEdsQ1FVRkJMRWRCUVc5Q0xFOUJRVUVzUTBGQlV5eDFRMEZCVkRzN1FVRkhaRHM3T3pzN096czdPenM3T0VKQlJVd3NVVUZCUVN4SFFVTkRPMGxCUVVFc1UwRkJRU3hGUVVGWExGbEJRVmc3U1VGRFFTeExRVUZCTEVWQlFWY3NiVUpCUkZnN1NVRkZRU3hKUVVGQkxFVkJRVmNzYTBKQlJsZzdPenM3UVVGSlJEczdPenM0UWtGSFFTeFZRVUZCTEVkQlFWa3NVMEZCUlN4UFFVRkdPMWRCUTFnc1NVRkJReXhEUVVGQkxGVkJRVVFzUjBGQll5eFBRVUZQTEVOQlFVTXNTVUZCVWl4RFFVRmpMRWRCUVVFc1IwRkJTU3hKUVVGRExFTkJRVUVzVVVGQlVTeERRVUZETEZOQlFUVkNPMFZCUkVnN096dEJRVWRhT3pzN096czdPemhDUVUxQkxFOUJRVUVzUjBGQlV5eFRRVUZCTzBGQlExSXNVVUZCUVR0SlFVRkJMRWxCUVZVc1NVRkJReXhEUVVGQkxGVkJRVlVzUTBGQlF5eE5RVUZhTEV0QlFYTkNMRU5CUVdoRE8wRkJRVUVzWVVGQlFUczdTVUZGUVN4SlFVRkRMRU5CUVVFc1ZVRkJWU3hEUVVGRExGRkJRVm9zUTBGQmMwSXNkMEpCUVhSQ08wbEJSVUVzU1VGQlF5eERRVUZCTEd0Q1FVRkVMRU5CUVVFN1NVRkhRU3huUWtGQlFTeEhRVUZ0UWl4TFFVRkxMRU5CUVVNc1dVRkJUaXhEUVVGdFFpeHhRa0ZCYmtJc1JVRkRiRUk3VFVGQlFTeFpRVUZCTEVWQlFXTXNSMEZCUVN4SFFVRkpMRWxCUVVNc1EwRkJRU3hSUVVGUkxFTkJRVU1zU1VGQk5VSTdUVUZEUVN4WFFVRkJMRVZCUVdNc1IwRkJRU3hIUVVGSkxFbEJRVU1zUTBGQlFTeFJRVUZSTEVOQlFVTXNTMEZFTlVJN1RVRkZRU3hOUVVGQkxFVkJRV01zUTBGR1pEdE5RVWRCTEZWQlFVRXNSVUZCWXl4TFFVaGtPMHRCUkd0Q08wbEJUVzVDTEVsQlFVTXNRMEZCUVN4VlFVRlZMRU5CUVVNc1QwRkJXaXhEUVVGeFFpeG5Ra0ZCY2tJN1YwRkZRU3hKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEU5QlFWb3NRMEZCYjBJc1RVRkJjRUlzUlVGQk5FSXNaMEpCUVRWQ0xFVkJRVGhETEVOQlFVRXNVMEZCUVN4TFFVRkJPMkZCUVVFc1UwRkJRVHRSUVVNM1F5eExRVUZETEVOQlFVRXNWVUZEUVN4RFFVRkRMRmRCUkVZc1EwRkRaU3gzUWtGRVppeERRVVZETEVOQlFVTXNVVUZHUml4RFFVVlpMSGxDUVVaYU8yVkJUVUVzUzBGQlN5eERRVUZETEZGQlFVNHNRMEZCWlN4elFrRkJaanROUVZBMlF6dEpRVUZCTEVOQlFVRXNRMEZCUVN4RFFVRkJMRWxCUVVFc1EwRkJPVU03UlVGb1FsRTdPenRCUVRCQ1ZEczdPenM3T0VKQlNVRXNUVUZCUVN4SFFVRlJMRk5CUVVFN1NVRkRVQ3hKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEU5QlFWb3NRMEZCUVR0RlFVUlBPenM3UVVGTFVqczdPenM3T0VKQlNVRXNUMEZCUVN4SFFVRlRMRk5CUVVFN1NVRkRVaXhKUVVGRExFTkJRVUVzYTBKQlFVUXNRMEZCUVR0SlFVVkJMRWxCUVVjc1NVRkJReXhEUVVGQkxGVkJRVlVzUTBGQlF5eE5RVUZhTEVkQlFYRkNMRU5CUVhoQ08wMUJRME1zU1VGQlF5eERRVUZCTEZWQlFWVXNRMEZCUXl4UFFVRmFMRU5CUVhGQ0xGTkJRWEpDTEVWQlJFUTdPMFZCU0ZFN096dEJRVlZVT3pzN096czRRa0ZKUVN4UFFVRkJMRWRCUVZNc1UwRkJRVHRYUVVOU0xFbEJRVU1zUTBGQlFTeFZRVUZWTEVOQlFVTXNUMEZCV2l4RFFVRnhRaXhSUVVGeVFqdEZRVVJST3pzN1FVRkxWRHM3T3pzNFFrRkhRU3hyUWtGQlFTeEhRVUZ2UWl4VFFVRkJPMGxCUTI1Q0xFbEJRVzFDTEVsQlFVTXNRMEZCUVN4clFrRkJSQ3hEUVVGQkxFTkJRVzVDTzAxQlFVRXNTVUZCUXl4RFFVRkJMRmxCUVVRc1EwRkJRU3hGUVVGQk96dEZRVVJ0UWpzN09FSkJTWEJDTEd0Q1FVRkJMRWRCUVc5Q0xGTkJRVUU3U1VGRGJrSXNTVUZCVlN4SlFVRkRMRU5CUVVFc1ZVRkJWU3hEUVVGRExFMUJRVm9zUzBGQmQwSXNRMEZCYkVNN1FVRkJRU3hoUVVGQk96dEpRVU5CTEVsQlFVTXNRMEZCUVN4VlFVRlZMRU5CUVVNc1NVRkJXaXhEUVVGclFpeEhRVUZCTEVkQlFVa3NTVUZCUXl4RFFVRkJMRkZCUVZFc1EwRkJReXhMUVVGb1F5eERRVUY1UXl4RFFVRkRMRTFCUVRGRExFTkJRVUU3UlVGR2JVSTdPemhDUVV0d1FpeHJRa0ZCUVN4SFFVRnZRaXhUUVVGQk8xZEJRVWNzU1VGQlF5eERRVUZCTEZWQlFWVXNRMEZCUXl4SlFVRmFMRU5CUVd0Q0xFZEJRVUVzUjBGQlNTeEpRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRXRCUVdoRExFTkJRWGxETEVOQlFVTXNUVUZCTVVNc1MwRkJiMFE3UlVGQmRrUTdPemhDUVVkd1FpeFpRVUZCTEVkQlFXTXNVMEZCUVR0SlFVTmlMRWxCUVVNc1EwRkJRU3hWUVVGVkxFTkJRVU1zVFVGQldpeERRVUZ0UWl4bFFVRkJMRWRCUVdsQ0xFbEJRVU1zUTBGQlFTeFJRVUZSTEVOQlFVTXNTMEZCTTBJc1IwRkJhVU1zVjBGQmNFUTdSVUZFWVRzN096dEhRVFZHYVVJN08wRkJhMGRvUXl4TlFVRk5MRU5CUVVNc1QwRkJVQ3hIUVVGcFFpSjlcbiIsInZhciAkLCBIb29rcywgTGF6eV9NYXNvbnJ5LCBpbml0X2xhenlfbG9hZGVyLCBpc19tYXNvbnJ5LCBsYXp5X2luc3RhbmNlO1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuTGF6eV9NYXNvbnJ5ID0gcmVxdWlyZSgnLi8uLi9sYXp5L0xhenlfTWFzb25yeScpO1xuXG5sYXp5X2luc3RhbmNlID0gZmFsc2U7XG5cbmlzX21hc29ucnkgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICQoJy5QUF9NYXNvbnJ5JykubGVuZ3RoID4gMDtcbn07XG5cbmluaXRfbGF6eV9sb2FkZXIgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCFpc19tYXNvbnJ5KCkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGxhenlfaW5zdGFuY2UpIHtcbiAgICBsYXp5X2luc3RhbmNlLmRlc3Ryb3koKTtcbiAgfVxuICByZXR1cm4gbGF6eV9pbnN0YW5jZSA9IG5ldyAoSG9va3MuYXBwbHlGaWx0ZXJzKCdwcC5sYXp5LmhhbmRsZXInLCBMYXp5X01hc29ucnkpKTtcbn07XG5cbkhvb2tzLmFkZEFjdGlvbigncHAucG9ydGZvbGlvLnByZXBhcmUnLCBpbml0X2xhenlfbG9hZGVyLCAxMDApO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3BwLnBvcnRmb2xpby5kZXN0cm95JywgZnVuY3Rpb24oKSB7XG4gIGxhenlfaW5zdGFuY2UuZGVzdHJveSgpO1xuICByZXR1cm4gbGF6eV9pbnN0YW5jZSA9IG51bGw7XG59KTtcblxuSG9va3MuYWRkQWN0aW9uKCdwcC5wb3J0Zm9saW8ucmVmcmVzaCcsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4gSG9va3MuZG9BY3Rpb24oJ3BwLmxhenkuYXV0b2xvYWQnKTtcbn0pO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2liR0Y2ZVM1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJbXhoZW5rdVkyOW1abVZsSWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUpCUVVGQkxFbEJRVUU3TzBGQlFVRXNRMEZCUVN4SFFVRkpMRTlCUVVFc1EwRkJVeXhSUVVGVU96dEJRVU5LTEV0QlFVRXNSMEZCVVN4UFFVRkJMRU5CUVZNc1ZVRkJWRHM3UVVGRFVpeFpRVUZCTEVkQlFXVXNUMEZCUVN4RFFVRlRMSGRDUVVGVU96dEJRVWRtTEdGQlFVRXNSMEZCWjBJN08wRkJSV2hDTEZWQlFVRXNSMEZCWVN4VFFVRkJPMU5CUVVjc1EwRkJRU3hEUVVGSExHRkJRVWdzUTBGQmEwSXNRMEZCUXl4TlFVRnVRaXhIUVVFMFFqdEJRVUV2UWpzN1FVRkZZaXhuUWtGQlFTeEhRVUZ0UWl4VFFVRkJPMFZCUTJ4Q0xFbEJRVlVzUTBGQlNTeFZRVUZCTEVOQlFVRXNRMEZCWkR0QlFVRkJMRmRCUVVFN08wVkJSVUVzU1VGQlJ5eGhRVUZJTzBsQlEwTXNZVUZCWVN4RFFVRkRMRTlCUVdRc1EwRkJRU3hGUVVSRU96dFRRVXRCTEdGQlFVRXNSMEZCWjBJc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eFpRVUZPTEVOQlFXMUNMR2xDUVVGdVFpeEZRVUZ6UXl4WlFVRjBReXhEUVVGRU8wRkJVa1k3TzBGQldXNUNMRXRCUVVzc1EwRkJReXhUUVVGT0xFTkJRV2RDTEhOQ1FVRm9RaXhGUVVGM1F5eG5Ra0ZCZUVNc1JVRkJNRVFzUjBGQk1VUTdPMEZCUTBFc1MwRkJTeXhEUVVGRExGTkJRVTRzUTBGQlowSXNjMEpCUVdoQ0xFVkJRWGRETEZOQlFVRTdSVUZEZGtNc1lVRkJZU3hEUVVGRExFOUJRV1FzUTBGQlFUdFRRVU5CTEdGQlFVRXNSMEZCWjBJN1FVRkdkVUlzUTBGQmVFTTdPMEZCVFVFc1MwRkJTeXhEUVVGRExGTkJRVTRzUTBGQlowSXNjMEpCUVdoQ0xFVkJRWGRETEZOQlFVRTdVMEZEZGtNc1MwRkJTeXhEUVVGRExGRkJRVTRzUTBGQlpTeHJRa0ZCWmp0QlFVUjFReXhEUVVGNFF5SjlcbiIsInZhciAkLCBIb29rcywgUG9ydGZvbGlvX01hc29ucnksIGluaXRfbWFzb25yeSwgaXNfbWFzb25yeTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cblBvcnRmb2xpb19NYXNvbnJ5ID0gcmVxdWlyZSgnLi9Qb3J0Zm9saW9fTWFzb25yeScpO1xuXG5pc19tYXNvbnJ5ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAkKCcuUFBfTWFzb25yeScpLmxlbmd0aCA+IDA7XG59O1xuXG5cbi8qXG5cdEluaXRpYWxpemUgTWFzb25yeVxuICovXG5cbmluaXRfbWFzb25yeSA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIWlzX21hc29ucnkoKSkge1xuICAgIHJldHVybjtcbiAgfVxuICByZXR1cm4gbmV3IFBvcnRmb2xpb19NYXNvbnJ5KCQoZG9jdW1lbnQpKTtcbn07XG5cblxuLypcblx0U2V0dXAgRXZlbnRzXG4gKi9cblxuSG9va3MuYWRkQWN0aW9uKCdwcC5jb3JlLnJlYWR5JywgaW5pdF9tYXNvbnJ5KTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYldGemIyNXllUzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYkltMWhjMjl1Y25rdVkyOW1abVZsSWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUpCUVVGQkxFbEJRVUU3TzBGQlFVRXNRMEZCUVN4SFFVRkpMRTlCUVVFc1EwRkJVeXhSUVVGVU96dEJRVU5LTEV0QlFVRXNSMEZCVVN4UFFVRkJMRU5CUVZNc1ZVRkJWRHM3UVVGRFVpeHBRa0ZCUVN4SFFVRnZRaXhQUVVGQkxFTkJRVk1zY1VKQlFWUTdPMEZCUlhCQ0xGVkJRVUVzUjBGQllTeFRRVUZCTzFOQlFVY3NRMEZCUVN4RFFVRkhMR0ZCUVVnc1EwRkJhMElzUTBGQlF5eE5RVUZ1UWl4SFFVRTBRanRCUVVFdlFqczdPMEZCUjJJN096czdRVUZIUVN4WlFVRkJMRWRCUVdVc1UwRkJRVHRGUVVOa0xFbEJRVlVzUTBGQlNTeFZRVUZCTEVOQlFVRXNRMEZCWkR0QlFVRkJMRmRCUVVFN08xTkJSMGtzU1VGQlFTeHBRa0ZCUVN4RFFVRnRRaXhEUVVGQkxFTkJRVWNzVVVGQlNDeERRVUZ1UWp0QlFVcFZPenM3UVVGUlpqczdPenRCUVVkQkxFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMR1ZCUVdoQ0xFVkJRV2xETEZsQlFXcERJbjA9XG4iLCJcbi8qXG4gICAgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBIb29rcywgSXRlbV9EYXRhLCBnZXRfZGF0YTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbkl0ZW1fRGF0YSA9IHJlcXVpcmUoJy4uL2xhenkvSXRlbV9EYXRhJyk7XG5cbmdldF9kYXRhID0gZnVuY3Rpb24oZWwpIHtcbiAgdmFyICRjb250YWluZXIsICRlbCwgJGl0ZW1zLCBpdGVtcztcbiAgJGVsID0gJChlbCk7XG4gICRjb250YWluZXIgPSAkZWwuY2xvc2VzdCgnLlBQX0dhbGxlcnknKTtcbiAgJGl0ZW1zID0gJGNvbnRhaW5lci5maW5kKCcuUFBfR2FsbGVyeV9faXRlbScpO1xuICBpdGVtcyA9ICRpdGVtcy5tYXAoZnVuY3Rpb24oa2V5LCBpdGVtKSB7XG4gICAgdmFyIGk7XG4gICAgaSA9IG5ldyBJdGVtX0RhdGEoJChpdGVtKSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNyYzogaS5nZXRfdXJsKCdmdWxsJyksXG4gICAgICB0aHVtYjogaS5nZXRfdXJsKCd0aHVtYicpXG4gICAgfTtcbiAgfSk7XG4gIHJldHVybiBpdGVtcztcbn07XG5cblxuLypcbiAgICBAVE9ETzogTmVlZCBkZXRhY2gvZGVzdHJveSBtZXRob2RzXG4gKi9cblxuSG9va3MuYWRkQWN0aW9uKCdwcC5jb3JlLnJlYWR5JywgZnVuY3Rpb24oKSB7XG4gIHJldHVybiAkKCcuUFBfR2FsbGVyeV9faXRlbScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgJGVsO1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkZWwgPSAkKHRoaXMpO1xuICAgIHJldHVybiAkZWwubGlnaHRHYWxsZXJ5KHtcbiAgICAgIGR5bmFtaWM6IHRydWUsXG4gICAgICBkeW5hbWljRWw6IGdldF9kYXRhKHRoaXMpLFxuICAgICAgaW5kZXg6ICQoJy5QUF9HYWxsZXJ5X19pdGVtJykuaW5kZXgoJGVsKSxcbiAgICAgIHNwZWVkOiAzNTAsXG4gICAgICBwcmVsb2FkOiAzLFxuICAgICAgZG93bmxvYWQ6IGZhbHNlXG4gICAgfSk7XG4gIH0pO1xufSk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWNHOXdkWEF1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SndiM0IxY0M1amIyWm1aV1VpWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanRCUVVGQk96czdRVUZCUVN4SlFVRkJPenRCUVVkQkxFTkJRVUVzUjBGQlNTeFBRVUZCTEVOQlFWTXNVVUZCVkRzN1FVRkRTaXhMUVVGQkxFZEJRVkVzVDBGQlFTeERRVUZUTEZWQlFWUTdPMEZCUTFJc1UwRkJRU3hIUVVGWkxFOUJRVUVzUTBGQlV5eHRRa0ZCVkRzN1FVRkZXaXhSUVVGQkxFZEJRVmNzVTBGQlJTeEZRVUZHTzBGQlExWXNUVUZCUVR0RlFVRkJMRWRCUVVFc1IwRkJUU3hEUVVGQkxFTkJRVWNzUlVGQlNEdEZRVU5PTEZWQlFVRXNSMEZCWVN4SFFVRkhMRU5CUVVNc1QwRkJTaXhEUVVGaExHRkJRV0k3UlVGRllpeE5RVUZCTEVkQlFWTXNWVUZCVlN4RFFVRkRMRWxCUVZnc1EwRkJhVUlzYlVKQlFXcENPMFZCUlZRc1MwRkJRU3hIUVVGUkxFMUJRVTBzUTBGQlF5eEhRVUZRTEVOQlFWY3NVMEZCUlN4SFFVRkdMRVZCUVU4c1NVRkJVRHRCUVVOc1FpeFJRVUZCTzBsQlFVRXNRMEZCUVN4SFFVRlJMRWxCUVVFc1UwRkJRU3hEUVVGWExFTkJRVUVzUTBGQlJ5eEpRVUZJTEVOQlFWZzdRVUZGVWl4WFFVRlBPMDFCUTA0c1IwRkJRU3hGUVVGUExFTkJRVU1zUTBGQlF5eFBRVUZHTEVOQlFWY3NUVUZCV0N4RFFVUkVPMDFCUlU0c1MwRkJRU3hGUVVGUExFTkJRVU1zUTBGQlF5eFBRVUZHTEVOQlFWY3NUMEZCV0N4RFFVWkVPenRGUVVoWExFTkJRVmc3UVVGVFVpeFRRVUZQTzBGQlprYzdPenRCUVdsQ1dEczdPenRCUVVkQkxFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMR1ZCUVdoQ0xFVkJRV2xETEZOQlFVRTdVMEZGYUVNc1EwRkJRU3hEUVVGSExHMUNRVUZJTEVOQlFYZENMRU5CUVVNc1JVRkJla0lzUTBGQk5FSXNUMEZCTlVJc1JVRkJjVU1zVTBGQlJTeERRVUZHTzBGQlEzQkRMRkZCUVVFN1NVRkJRU3hEUVVGRExFTkJRVU1zWTBGQlJpeERRVUZCTzBsQlIwRXNSMEZCUVN4SFFVRk5MRU5CUVVFc1EwRkJSeXhKUVVGSU8xZEJSMDRzUjBGQlJ5eERRVUZETEZsQlFVb3NRMEZEUXp0TlFVRkJMRTlCUVVFc1JVRkJWeXhKUVVGWU8wMUJRMEVzVTBGQlFTeEZRVUZYTEZGQlFVRXNRMEZCVlN4SlFVRldMRU5CUkZnN1RVRkZRU3hMUVVGQkxFVkJRVmNzUTBGQlFTeERRVUZITEcxQ1FVRklMRU5CUVhkQ0xFTkJRVU1zUzBGQmVrSXNRMEZCSzBJc1IwRkJMMElzUTBGR1dEdE5RVWRCTEV0QlFVRXNSVUZCVnl4SFFVaFlPMDFCU1VFc1QwRkJRU3hGUVVGWExFTkJTbGc3VFVGTFFTeFJRVUZCTEVWQlFWY3NTMEZNV0R0TFFVUkVPMFZCVUc5RExFTkJRWEpETzBGQlJtZERMRU5CUVdwREluMD1cbiIsIlxuLypcbiAgICBEZXBlbmRlbmNpZXNcbiAqL1xudmFyIEhvb2tzLCBQb3J0Zm9saW8sIFBvcnRmb2xpb19NYW5hZ2VyO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5Qb3J0Zm9saW9fTWFuYWdlciA9IHJlcXVpcmUoJy4vLi4vY2xhc3MvUG9ydGZvbGlvX01hbmFnZXInKTtcblxuUG9ydGZvbGlvID0gbmV3IFBvcnRmb2xpb19NYW5hZ2VyKCk7XG5cbnJlcXVpcmUoJy4vbGF6eScpO1xuXG5yZXF1aXJlKCcuL21hc29ucnknKTtcblxucmVxdWlyZSgnLi9wb3B1cCcpO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3BwLmNvcmUucmVhZHknLCBQb3J0Zm9saW8ucHJlcGFyZSwgNTApO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3BwLmNvcmUubG9hZGVkJywgUG9ydGZvbGlvLmNyZWF0ZSwgNTApO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2ljSEpsY0dGeVpTNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSW5CeVpYQmhjbVV1WTI5bVptVmxJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSTdRVUZCUVRzN08wRkJRVUVzU1VGQlFUczdRVUZIUVN4TFFVRkJMRWRCUVZFc1QwRkJRU3hEUVVGVExGVkJRVlE3TzBGQlExSXNhVUpCUVVFc1IwRkJiMElzVDBGQlFTeERRVUZUTERoQ1FVRlVPenRCUVVkd1FpeFRRVUZCTEVkQlFXZENMRWxCUVVFc2FVSkJRVUVzUTBGQlFUczdRVUZIYUVJc1QwRkJRU3hEUVVGUkxGRkJRVkk3TzBGQlEwRXNUMEZCUVN4RFFVRlJMRmRCUVZJN08wRkJRMEVzVDBGQlFTeERRVUZSTEZOQlFWSTdPMEZCUzBFc1MwRkJTeXhEUVVGRExGTkJRVTRzUTBGQlowSXNaVUZCYUVJc1JVRkJhVU1zVTBGQlV5eERRVUZETEU5QlFUTkRMRVZCUVc5RUxFVkJRWEJFT3p0QlFVTkJMRXRCUVVzc1EwRkJReXhUUVVGT0xFTkJRV2RDTEdkQ1FVRm9RaXhGUVVGclF5eFRRVUZUTEVOQlFVTXNUVUZCTlVNc1JVRkJiMFFzUlVGQmNFUWlmUT09XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
