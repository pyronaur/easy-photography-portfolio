(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){

/*
    Load Dependencies
 */
var $, Hooks;

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

window.PP_Modules = {
  Portfolio_Interface: require('./portfolio/Portfolio_Interface'),
  Item_Data: require('./lazy/Item_Data'),
  Abstract_Lazy_Loader: require('./lazy/Abstract_Lazy_Loader')
};


/*
	Boot on `document.ready`
 */

$(document).ready(function() {
  var Photography_Portfolio;
  if (!$('body').hasClass('PP_Portfolio')) {
    return;
  }
  Photography_Portfolio = new (require('./core/Photography_Portfolio'))();
  Photography_Portfolio.ready();
});


/*
	Load App
 */

require('./portfolio/start');

require('./gallery/popup');

require('./lazy/start');


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./core/Photography_Portfolio":2,"./gallery/popup":4,"./lazy/Abstract_Lazy_Loader":5,"./lazy/Item_Data":6,"./lazy/start":8,"./portfolio/Portfolio_Interface":10,"./portfolio/start":12}],2:[function(require,module,exports){
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
    this.wait_for_load = bind(this.wait_for_load, this);
    this.ready = bind(this.ready, this);
    Hooks.addAction('phort.core.ready', this.wait_for_load);
  }

  Core.prototype.ready = function() {
    if (Hooks.applyFilters('phort.core.ready', true)) {
      Hooks.doAction('phort.core.ready');
    }
  };

  Core.prototype.wait_for_load = function() {
    return $('.PP_Wrapper').imagesLoaded(this.loaded);
  };

  Core.prototype.loaded = function() {
    if (Hooks.applyFilters('phort.core.loaded', true)) {
      Hooks.doAction('phort.core.loaded');
    }
  };

  return Core;

})();

module.exports = Core;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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
    var full, item_data;
    item_data = new Item_Data($(item));
    if (item_data.get_type() === 'video') {
      full = item_data.get_or_false('video_url');
    } else {
      full = item_data.get_url('full');
    }
    return {
      src: full,
      thumb: item_data.get_url('thumb')
    };
  });
  return items;
};


/*
    @TODO: Need detach/destroy methods
 */

Hooks.addAction('phort.core.ready', function() {
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
      download: false,
      videoMaxWidth: $(window).width() * 0.8
    });
  });
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../lazy/Item_Data":6}],5:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var $, Abstract_Lazy_Loader, Hooks, Item_Data, __WINDOW,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Item_Data = require('./Item_Data');

__WINDOW = require('../core/Window');

Abstract_Lazy_Loader = (function() {
  function Abstract_Lazy_Loader() {
    this.autoload = bind(this.autoload, this);
    this.add_item = bind(this.add_item, this);
    this.setup_items = bind(this.setup_items, this);
    this.Elements = {
      item: 'PP_Lazy_Image',
      placeholder: 'PP_Lazy_Image__placeholder',
      link: 'PP_JS_Lazy__link',
      image: 'PP_JS_Lazy__image'
    };
    this.Items = [];
    this.Sensitivity = 100;
    this.throttled_autoload = null;
    this.setup_items();
    this.resize_all();
    this.attach_events();
  }


  /*
  		Abstract Methods
   */

  Abstract_Lazy_Loader.prototype.resize = function() {};

  Abstract_Lazy_Loader.prototype.load = function(item) {
    this.load_image(item);
    return item.$el.imagesLoaded((function(_this) {
      return function() {
        return _this.cleanup_after_load(item);
      };
    })(this));
  };

  Abstract_Lazy_Loader.prototype.load_image = function(item) {
    var full, thumb;
    thumb = item.data.get_url('thumb');
    full = item.data.get_url('full');
    item.$el.prepend(this.get_item_html(thumb, full)).removeClass('Lazy-Image');
    return item.loaded = true;
  };

  Abstract_Lazy_Loader.prototype.cleanup_after_load = function(item) {
    item.$el.find('img').addClass('PP_JS__loaded').removeClass('PP_JS__loading');
    return item.$el.removeClass(this.Elements.item).find("." + this.Elements.placeholder).fadeOut(400, function() {
      return $(this).remove();
    });
  };

  Abstract_Lazy_Loader.prototype.get_item_html = function(thumb, full) {
    return "\n<a class=\"" + this.Elements.link + "\" href=\"" + full + "\" rel=\"gallery\">\n	<img class=\"" + this.Elements.image + "\" src=\"" + thumb + "\" class=\"PP_JS__loading\" />\n</a>";
  };

  Abstract_Lazy_Loader.prototype.setup_items = function() {
    this.Items = [];
    $("." + this.Elements.item).each(this.add_item);
  };

  Abstract_Lazy_Loader.prototype.add_item = function(key, el) {
    var $el;
    $el = $(el);
    this.Items.push({
      el: el,
      $el: $el,
      data: new Item_Data($el),
      loaded: false
    });
  };


  /*
  		Methods
   */

  Abstract_Lazy_Loader.prototype.resize_all = function() {
    var i, item, len, ref, results;
    ref = this.Items;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      item = ref[i];
      results.push(this.resize(item));
    }
    return results;
  };

  Abstract_Lazy_Loader.prototype.autoload = function() {
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

  Abstract_Lazy_Loader.prototype.in_loose_view = function(el) {
    var rect;
    if (el.getBoundingClientRect == null) {
      return true;
    }
    rect = el.getBoundingClientRect();
    if (rect.height === 0 && rect.width === 0) {
      return false;
    }
    return rect.top + rect.height >= -this.Sensitivity && rect.bottom - rect.height <= __WINDOW.height + this.Sensitivity && rect.left + rect.width >= -this.Sensitivity && rect.right - rect.width <= __WINDOW.width + this.Sensitivity;
  };

  Abstract_Lazy_Loader.prototype.remove_placeholder = function(item) {
    return item.$el.find("." + this.Elements.placeholder + ", noscript").remove();
  };

  Abstract_Lazy_Loader.prototype.destroy = function() {
    return this.detach_events();
  };

  Abstract_Lazy_Loader.prototype.attach_events = function() {
    this.throttled_autoload = _.throttle(this.autoload, 50);
    return Hooks.addAction('phort.portfolio.refresh', this.throttled_autoload, 100);
  };

  Abstract_Lazy_Loader.prototype.detach_events = function() {
    this.throttled_autoload = null;
    return Hooks.removeAction('phort.portfolio.refresh', this.throttled_autoload, 100);
  };

  return Abstract_Lazy_Loader;

})();

module.exports = Abstract_Lazy_Loader;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../core/Window":3,"./Item_Data":6}],6:[function(require,module,exports){
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
var $, Abstract_Lazy_Loader, Lazy_Masonry, __WINDOW,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Abstract_Lazy_Loader = require('./Abstract_Lazy_Loader');

__WINDOW = require('../core/Window');

Lazy_Masonry = (function(superClass) {
  extend(Lazy_Masonry, superClass);

  function Lazy_Masonry() {
    return Lazy_Masonry.__super__.constructor.apply(this, arguments);
  }

  Lazy_Masonry.prototype.resize_all = function() {
    this.placeholder_width = $('.PP_Masonry__sizer').width();
    return Lazy_Masonry.__super__.resize_all.call(this);
  };

  Lazy_Masonry.prototype.resize = function(item) {
    return item.$el.css({
      'min-height': Math.floor(this.placeholder_width / item.data.get_ratio())
    });
  };

  Lazy_Masonry.prototype.cleanup_after_load = function(item) {
    item.$el.css('min-height', '');
    return Lazy_Masonry.__super__.cleanup_after_load.call(this, item);
  };

  Lazy_Masonry.prototype.attach_events = function() {
    Lazy_Masonry.__super__.attach_events.call(this);
    return $(window).on('scroll', this.throttled_autoload);
  };

  Lazy_Masonry.prototype.detach_events = function() {
    $(window).off('scroll', this.throttled_autoload);
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

},{"../core/Window":3,"./Abstract_Lazy_Loader":5}],8:[function(require,module,exports){
(function (global){
var $, Hooks, create, destroy, instance;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

instance = false;

destroy = function() {
  if (!instance) {
    return;
  }
  instance.destroy();
  return instance = null;
};

create = function() {
  var Handler;
  destroy();
  Handler = Hooks.applyFilters('phort.lazy.handler', false);
  if (!Handler) {
    return;
  }
  instance = new Handler();
};

Hooks.addAction('phort.portfolio.prepare', create, 100);

Hooks.addAction('phort.portfolio.destroy', destroy);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],9:[function(require,module,exports){
(function (global){
var Hooks, Portfolio_Event_Manager;

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);


/*

     * Initialize Portfolio Core
	---
		Using p50 @ `phort.core.ready`
		Late priority is going to force explicit priority in any other moving parts that are going to touch portfolio layout at `phort.loaded`
	---
 */

Portfolio_Event_Manager = (function() {
  function Portfolio_Event_Manager() {}

  Portfolio_Event_Manager.prototype.prepare = function() {
    Hooks.doAction('phort.portfolio.prepare');
  };

  Portfolio_Event_Manager.prototype.create = function() {
    Hooks.doAction('phort.portfolio.create');
  };

  Portfolio_Event_Manager.prototype.refresh = function() {
    Hooks.doAction('phort.portfolio.refresh');
  };

  Portfolio_Event_Manager.prototype.destroy = function() {
    Hooks.doAction('phort.portfolio.destroy');
  };

  return Portfolio_Event_Manager;

})();

module.exports = Portfolio_Event_Manager;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],10:[function(require,module,exports){
(function (global){
var Hooks, Portfolio_Interface,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);


/*
	Abstract Class Portoflio_Event_Imeplementation

    Handles all the events required to fully handle a portfolio layout process
 */

Portfolio_Interface = (function() {
  function Portfolio_Interface(args) {
    this.purge_actions = bind(this.purge_actions, this);
    this.setup_actions();
    this.initialize(args);
  }

  Portfolio_Interface.prototype.setup_actions = function() {
    Hooks.addAction('phort.portfolio.prepare', this.prepare, 50);
    Hooks.addAction('phort.portfolio.create', this.create, 50);
    Hooks.addAction('phort.portfolio.refresh', this.refresh, 50);
    Hooks.addAction('phort.portfolio.destroy', this.destroy, 50);
    return Hooks.addAction('phort.portfolio.destroy', this.purge_actions, 100);
  };

  Portfolio_Interface.prototype.purge_actions = function() {
    Hooks.removeAction('phort.portfolio.prepare', this.prepare, 50);
    Hooks.removeAction('phort.portfolio.create', this.create, 50);
    Hooks.removeAction('phort.portfolio.refresh', this.refresh, 50);
    Hooks.removeAction('phort.portfolio.destroy', this.destroy, 50);
    return Hooks.removeAction('phort.portfolio.destroy', this.purge_actions, 100);
  };


  /*
     	Require these methods
   */

  Portfolio_Interface.prototype.initialize = function() {
    throw new Error("[Abstract] Any subclass of `Portfolio_Interface` must implement `initialize` method");
  };

  Portfolio_Interface.prototype.prepare = function() {
    throw new Error("[Abstract] Any subclass of `Portfolio_Interface` must implement `prepare` method");
  };

  Portfolio_Interface.prototype.create = function() {
    throw new Error("[Abstract] Any subclass of `Portfolio_Interface` must implement `create` method");
  };

  Portfolio_Interface.prototype.refresh = function() {
    throw new Error("[Abstract] Any subclass of `Portfolio_Interface` must implement `refresh` method");
  };

  Portfolio_Interface.prototype.destroy = function() {
    throw new Error("[Abstract] Any subclass of `Portfolio_Interface` must implement `destroy` method");
  };

  return Portfolio_Interface;

})();

module.exports = Portfolio_Interface;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],11:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var $, Hooks, Portfolio_Interface, Portfolio_Masonry,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Portfolio_Interface = require('./Portfolio_Interface');

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

  Portfolio_Masonry.prototype.initialize = function() {
    return this.$container = $("." + this.Elements.container);
  };


  /*
  		Prepare & Attach Events
     	Don't show anything yet.
  
  		@called on hook `phort.portfolio.prepare`
   */

  Portfolio_Masonry.prototype.prepare = function() {
    var masonry_settings;
    if (this.$container.length === 0) {
      return;
    }
    this.$container.addClass('PP_JS__loading_masonry');
    this.maybe_create_sizer();
    masonry_settings = Hooks.applyFilters('phort.masonry.settings', {
      itemSelector: "." + this.Elements.item,
      columnWidth: "." + this.Elements.sizer,
      gutter: 0,
      initLayout: false
    });
    this.$container.masonry(masonry_settings);
    return this.$container.masonry('once', 'layoutComplete', (function(_this) {
      return function() {
        _this.$container.removeClass('PP_JS__loading_masonry').addClass('PP_JS__loading_complete');
        return Hooks.doAction('phort.portfolio.refresh');
      };
    })(this));
  };


  /*
  		Start the Portfolio
  		@called on hook `phort.portfolio.create`
   */

  Portfolio_Masonry.prototype.create = function() {
    this.$container.masonry();
  };


  /*
  		Destroy
  		@called on hook `phort.portfolio.destroy`
   */

  Portfolio_Masonry.prototype.destroy = function() {
    this.maybe_remove_sizer();
    if (this.$container.length > 0) {
      this.$container.masonry('destroy');
    }
  };


  /*
  		Reload the layout
  		@called on hook `phort.portfolio.refresh`
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

})(Portfolio_Interface);

window.PP_Modules.Portfolio_Masonry = Portfolio_Masonry;

module.exports = Portfolio_Masonry;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./Portfolio_Interface":10}],12:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var $, Hooks, Portfolio, Portfolio_Event_Manager, is_masonry, maybe_lazy_masonry, start_masonry;

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Portfolio_Event_Manager = require('./Portfolio_Event_Manager');

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Portfolio = new Portfolio_Event_Manager();

is_masonry = function() {
  return $('.PP_Masonry').length !== 0;
};

start_masonry = function() {
  var Portfolio_Masonry;
  if (!is_masonry()) {
    return false;
  }
  Portfolio_Masonry = require('./Portfolio_Masonry');
  return new Portfolio_Masonry();
};

maybe_lazy_masonry = function(handler) {
  if (is_masonry()) {
    return require('lazy/Lazy_Masonry');
  }
  return handler;
};

Hooks.addAction('phort.core.ready', Portfolio.prepare, 50);

Hooks.addAction('phort.core.loaded', Portfolio.create, 50);

Hooks.addAction('phort.core.ready', start_masonry);

Hooks.addFilter('phort.lazy.handler', maybe_lazy_masonry);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./Portfolio_Event_Manager":9,"./Portfolio_Masonry":11,"lazy/Lazy_Masonry":7}]},{},[1])


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jb3JlL1Bob3RvZ3JhcGh5X1BvcnRmb2xpby5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY29yZS9XaW5kb3cuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvcG9wdXAuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvQWJzdHJhY3RfTGF6eV9Mb2FkZXIuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvSXRlbV9EYXRhLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0xhenlfTWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvbGF6eS9zdGFydC5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL1BvcnRmb2xpb19FdmVudF9NYW5hZ2VyLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9wb3J0Zm9saW8vUG9ydGZvbGlvX0ludGVyZmFjZS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL1BvcnRmb2xpb19NYXNvbnJ5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9wb3J0Zm9saW8vc3RhcnQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3pKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzNJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG4vKlxuICAgIExvYWQgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBIb29rcztcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbndpbmRvdy5QUF9Nb2R1bGVzID0ge1xuICBQb3J0Zm9saW9fSW50ZXJmYWNlOiByZXF1aXJlKCcuL3BvcnRmb2xpby9Qb3J0Zm9saW9fSW50ZXJmYWNlJyksXG4gIEl0ZW1fRGF0YTogcmVxdWlyZSgnLi9sYXp5L0l0ZW1fRGF0YScpLFxuICBBYnN0cmFjdF9MYXp5X0xvYWRlcjogcmVxdWlyZSgnLi9sYXp5L0Fic3RyYWN0X0xhenlfTG9hZGVyJylcbn07XG5cblxuLypcblx0Qm9vdCBvbiBgZG9jdW1lbnQucmVhZHlgXG4gKi9cblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gIHZhciBQaG90b2dyYXBoeV9Qb3J0Zm9saW87XG4gIGlmICghJCgnYm9keScpLmhhc0NsYXNzKCdQUF9Qb3J0Zm9saW8nKSkge1xuICAgIHJldHVybjtcbiAgfVxuICBQaG90b2dyYXBoeV9Qb3J0Zm9saW8gPSBuZXcgKHJlcXVpcmUoJy4vY29yZS9QaG90b2dyYXBoeV9Qb3J0Zm9saW8nKSkoKTtcbiAgUGhvdG9ncmFwaHlfUG9ydGZvbGlvLnJlYWR5KCk7XG59KTtcblxuXG4vKlxuXHRMb2FkIEFwcFxuICovXG5cbnJlcXVpcmUoJy4vcG9ydGZvbGlvL3N0YXJ0Jyk7XG5cbnJlcXVpcmUoJy4vZ2FsbGVyeS9wb3B1cCcpO1xuXG5yZXF1aXJlKCcuL2xhenkvc3RhcnQnKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pWVhCd0xtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpWVhCd0xtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pTzBGQlFVRTdPenRCUVVGQkxFbEJRVUU3TzBGQlIwRXNTMEZCUVN4SFFVRlJMRTlCUVVFc1EwRkJVeXhWUVVGVU96dEJRVU5TTEVOQlFVRXNSMEZCU1N4UFFVRkJMRU5CUVZNc1VVRkJWRHM3UVVGSlNpeE5RVUZOTEVOQlFVTXNWVUZCVUN4SFFVVkRPMFZCUVVFc2JVSkJRVUVzUlVGQmNVSXNUMEZCUVN4RFFVRlRMR2xEUVVGVUxFTkJRWEpDTzBWQlIwRXNVMEZCUVN4RlFVRlhMRTlCUVVFc1EwRkJVeXhyUWtGQlZDeERRVWhZTzBWQlRVRXNiMEpCUVVFc1JVRkJjMElzVDBGQlFTeERRVUZUTERaQ1FVRlVMRU5CVG5SQ096czdPMEZCVTBRN096czdRVUZIUVN4RFFVRkJMRU5CUVVjc1VVRkJTQ3hEUVVGaExFTkJRVU1zUzBGQlpDeERRVUZ2UWl4VFFVRkJPMEZCUjI1Q0xFMUJRVUU3UlVGQlFTeEpRVUZWTEVOQlFVa3NRMEZCUVN4RFFVRkhMRTFCUVVnc1EwRkJWeXhEUVVGRExGRkJRVm9zUTBGQmMwSXNZMEZCZEVJc1EwRkJaRHRCUVVGQkxGZEJRVUU3TzBWQlIwRXNjVUpCUVVFc1IwRkJORUlzU1VGQlFTeERRVUZGTEU5QlFVRXNRMEZCVXl3NFFrRkJWQ3hEUVVGR0xFTkJRVUVzUTBGQlFUdEZRVU0xUWl4eFFrRkJjVUlzUTBGQlF5eExRVUYwUWl4RFFVRkJPMEZCVUcxQ0xFTkJRWEJDT3pzN1FVRlpRVHM3T3p0QlFVdEJMRTlCUVVFc1EwRkJVU3h0UWtGQlVqczdRVUZIUVN4UFFVRkJMRU5CUVZFc2FVSkJRVkk3TzBGQlIwRXNUMEZCUVN4RFFVRlJMR05CUVZJaWZRPT1cbiIsIlxuLypcbiAgICBEZXBlbmRlbmNpZXNcbiAqL1xudmFyICQsIENvcmUsIEhvb2tzLFxuICBiaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbkNvcmUgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIENvcmUoKSB7XG4gICAgdGhpcy53YWl0X2Zvcl9sb2FkID0gYmluZCh0aGlzLndhaXRfZm9yX2xvYWQsIHRoaXMpO1xuICAgIHRoaXMucmVhZHkgPSBiaW5kKHRoaXMucmVhZHksIHRoaXMpO1xuICAgIEhvb2tzLmFkZEFjdGlvbigncGhvcnQuY29yZS5yZWFkeScsIHRoaXMud2FpdF9mb3JfbG9hZCk7XG4gIH1cblxuICBDb3JlLnByb3RvdHlwZS5yZWFkeSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChIb29rcy5hcHBseUZpbHRlcnMoJ3Bob3J0LmNvcmUucmVhZHknLCB0cnVlKSkge1xuICAgICAgSG9va3MuZG9BY3Rpb24oJ3Bob3J0LmNvcmUucmVhZHknKTtcbiAgICB9XG4gIH07XG5cbiAgQ29yZS5wcm90b3R5cGUud2FpdF9mb3JfbG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAkKCcuUFBfV3JhcHBlcicpLmltYWdlc0xvYWRlZCh0aGlzLmxvYWRlZCk7XG4gIH07XG5cbiAgQ29yZS5wcm90b3R5cGUubG9hZGVkID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKEhvb2tzLmFwcGx5RmlsdGVycygncGhvcnQuY29yZS5sb2FkZWQnLCB0cnVlKSkge1xuICAgICAgSG9va3MuZG9BY3Rpb24oJ3Bob3J0LmNvcmUubG9hZGVkJyk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBDb3JlO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvcmU7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVVHaHZkRzluY21Gd2FIbGZVRzl5ZEdadmJHbHZMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaVVHaHZkRzluY21Gd2FIbGZVRzl5ZEdadmJHbHZMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaU8wRkJRVUU3T3p0QlFVRkJMRWxCUVVFc1kwRkJRVHRGUVVGQk96dEJRVWRCTEVOQlFVRXNSMEZCU1N4UFFVRkJMRU5CUVZNc1VVRkJWRHM3UVVGRFNpeExRVUZCTEVkQlFWRXNUMEZCUVN4RFFVRlRMRlZCUVZRN08wRkJSMFk3UlVGRlVTeGpRVUZCT3pzN1NVRkRXaXhMUVVGTExFTkJRVU1zVTBGQlRpeERRVUZuUWl4clFrRkJhRUlzUlVGQmIwTXNTVUZCUXl4RFFVRkJMR0ZCUVhKRE8wVkJSRms3TzJsQ1FVbGlMRXRCUVVFc1IwRkJUeXhUUVVGQk8wbEJRMDRzU1VGQlJ5eExRVUZMTEVOQlFVTXNXVUZCVGl4RFFVRnZRaXhyUWtGQmNFSXNSVUZCZDBNc1NVRkJlRU1zUTBGQlNEdE5RVU5ETEV0QlFVc3NRMEZCUXl4UlFVRk9MRU5CUVdVc2EwSkJRV1lzUlVGRVJEczdSVUZFVFRzN2FVSkJTMUFzWVVGQlFTeEhRVUZsTEZOQlFVRTdWMEZGWkN4RFFVRkJMRU5CUVVjc1lVRkJTQ3hEUVVGclFpeERRVUZETEZsQlFXNUNMRU5CUVdsRExFbEJRVU1zUTBGQlFTeE5RVUZzUXp0RlFVWmpPenRwUWtGTFppeE5RVUZCTEVkQlFWRXNVMEZCUVR0SlFVTlFMRWxCUVVjc1MwRkJTeXhEUVVGRExGbEJRVTRzUTBGQmIwSXNiVUpCUVhCQ0xFVkJRWGxETEVsQlFYcERMRU5CUVVnN1RVRkRReXhMUVVGTExFTkJRVU1zVVVGQlRpeERRVUZsTEcxQ1FVRm1MRVZCUkVRN08wVkJSRTg3T3pzN096dEJRVTlVTEUxQlFVMHNRMEZCUXl4UFFVRlFMRWRCUVdsQ0luMD1cbiIsInZhciBIb29rcywgZ2V0X3NpemU7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbmdldF9zaXplID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgd2lkdGg6IHdpbmRvdy5pbm5lcldpZHRoIHx8ICR3aW5kb3cud2lkdGgoKSxcbiAgICBoZWlnaHQ6IHdpbmRvdy5pbm5lckhlaWdodCB8fCAkd2luZG93LmhlaWdodCgpXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdldF9zaXplKCk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVYybHVaRzkzTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lWMmx1Wkc5M0xtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeEpRVUZCT3p0QlFVRkJMRXRCUVVFc1IwRkJVU3hQUVVGQkxFTkJRVk1zVlVGQlZEczdRVUZIVWl4UlFVRkJMRWRCUVZjc1UwRkJRVHRUUVVOV08wbEJRVUVzUzBGQlFTeEZRVUZSTEUxQlFVMHNRMEZCUXl4VlFVRlFMRWxCUVhGQ0xFOUJRVThzUTBGQlF5eExRVUZTTEVOQlFVRXNRMEZCTjBJN1NVRkRRU3hOUVVGQkxFVkJRVkVzVFVGQlRTeERRVUZETEZkQlFWQXNTVUZCYzBJc1QwRkJUeXhEUVVGRExFMUJRVklzUTBGQlFTeERRVVE1UWpzN1FVRkVWVHM3UVVGTFdDeE5RVUZOTEVOQlFVTXNUMEZCVUN4SFFVRnBRaXhSUVVGQkxFTkJRVUVpZlE9PVxuIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgJCwgSG9va3MsIEl0ZW1fRGF0YSwgZ2V0X2RhdGE7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5JdGVtX0RhdGEgPSByZXF1aXJlKCcuLi9sYXp5L0l0ZW1fRGF0YScpO1xuXG5nZXRfZGF0YSA9IGZ1bmN0aW9uKGVsKSB7XG4gIHZhciAkY29udGFpbmVyLCAkZWwsICRpdGVtcywgaXRlbXM7XG4gICRlbCA9ICQoZWwpO1xuICAkY29udGFpbmVyID0gJGVsLmNsb3Nlc3QoJy5QUF9HYWxsZXJ5Jyk7XG4gICRpdGVtcyA9ICRjb250YWluZXIuZmluZCgnLlBQX0dhbGxlcnlfX2l0ZW0nKTtcbiAgaXRlbXMgPSAkaXRlbXMubWFwKGZ1bmN0aW9uKGtleSwgaXRlbSkge1xuICAgIHZhciBmdWxsLCBpdGVtX2RhdGE7XG4gICAgaXRlbV9kYXRhID0gbmV3IEl0ZW1fRGF0YSgkKGl0ZW0pKTtcbiAgICBpZiAoaXRlbV9kYXRhLmdldF90eXBlKCkgPT09ICd2aWRlbycpIHtcbiAgICAgIGZ1bGwgPSBpdGVtX2RhdGEuZ2V0X29yX2ZhbHNlKCd2aWRlb191cmwnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZnVsbCA9IGl0ZW1fZGF0YS5nZXRfdXJsKCdmdWxsJyk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBzcmM6IGZ1bGwsXG4gICAgICB0aHVtYjogaXRlbV9kYXRhLmdldF91cmwoJ3RodW1iJylcbiAgICB9O1xuICB9KTtcbiAgcmV0dXJuIGl0ZW1zO1xufTtcblxuXG4vKlxuICAgIEBUT0RPOiBOZWVkIGRldGFjaC9kZXN0cm95IG1ldGhvZHNcbiAqL1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3Bob3J0LmNvcmUucmVhZHknLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICQoJy5QUF9HYWxsZXJ5X19pdGVtJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgIHZhciAkZWw7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICRlbCA9ICQodGhpcyk7XG4gICAgcmV0dXJuICRlbC5saWdodEdhbGxlcnkoe1xuICAgICAgZHluYW1pYzogdHJ1ZSxcbiAgICAgIGR5bmFtaWNFbDogZ2V0X2RhdGEodGhpcyksXG4gICAgICBpbmRleDogJCgnLlBQX0dhbGxlcnlfX2l0ZW0nKS5pbmRleCgkZWwpLFxuICAgICAgc3BlZWQ6IDM1MCxcbiAgICAgIHByZWxvYWQ6IDMsXG4gICAgICBkb3dubG9hZDogZmFsc2UsXG4gICAgICB2aWRlb01heFdpZHRoOiAkKHdpbmRvdykud2lkdGgoKSAqIDAuOFxuICAgIH0pO1xuICB9KTtcbn0pO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2ljRzl3ZFhBdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUp3YjNCMWNDNWpiMlptWldVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWp0QlFVRkJPenM3UVVGQlFTeEpRVUZCT3p0QlFVZEJMRU5CUVVFc1IwRkJTU3hQUVVGQkxFTkJRVk1zVVVGQlZEczdRVUZEU2l4TFFVRkJMRWRCUVZFc1QwRkJRU3hEUVVGVExGVkJRVlE3TzBGQlExSXNVMEZCUVN4SFFVRlpMRTlCUVVFc1EwRkJVeXh0UWtGQlZEczdRVUZGV2l4UlFVRkJMRWRCUVZjc1UwRkJSU3hGUVVGR08wRkJRMVlzVFVGQlFUdEZRVUZCTEVkQlFVRXNSMEZCVFN4RFFVRkJMRU5CUVVjc1JVRkJTRHRGUVVOT0xGVkJRVUVzUjBGQllTeEhRVUZITEVOQlFVTXNUMEZCU2l4RFFVRmhMR0ZCUVdJN1JVRkZZaXhOUVVGQkxFZEJRVk1zVlVGQlZTeERRVUZETEVsQlFWZ3NRMEZCYVVJc2JVSkJRV3BDTzBWQlJWUXNTMEZCUVN4SFFVRlJMRTFCUVUwc1EwRkJReXhIUVVGUUxFTkJRVmNzVTBGQlJTeEhRVUZHTEVWQlFVOHNTVUZCVUR0QlFVTnNRaXhSUVVGQk8wbEJRVUVzVTBGQlFTeEhRVUZuUWl4SlFVRkJMRk5CUVVFc1EwRkJWeXhEUVVGQkxFTkJRVWNzU1VGQlNDeERRVUZZTzBsQlIyaENMRWxCUVVjc1UwRkJVeXhEUVVGRExGRkJRVllzUTBGQlFTeERRVUZCTEV0QlFYZENMRTlCUVROQ08wMUJRME1zU1VGQlFTeEhRVUZQTEZOQlFWTXNRMEZCUXl4WlFVRldMRU5CUVhkQ0xGZEJRWGhDTEVWQlJGSTdTMEZCUVN4TlFVRkJPMDFCUjBNc1NVRkJRU3hIUVVGUExGTkJRVk1zUTBGQlF5eFBRVUZXTEVOQlFXMUNMRTFCUVc1Q0xFVkJTRkk3TzBGQlMwRXNWMEZCVHp0TlFVTk9MRWRCUVVFc1JVRkJUeXhKUVVSRU8wMUJSVTRzUzBGQlFTeEZRVUZQTEZOQlFWTXNRMEZCUXl4UFFVRldMRU5CUVcxQ0xFOUJRVzVDTEVOQlJrUTdPMFZCVkZjc1EwRkJXRHRCUVdWU0xGTkJRVTg3UVVGeVFrYzdPenRCUVhWQ1dEczdPenRCUVVkQkxFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMR3RDUVVGb1FpeEZRVUZ2UXl4VFFVRkJPMU5CUlc1RExFTkJRVUVzUTBGQlJ5eHRRa0ZCU0N4RFFVRjNRaXhEUVVGRExFVkJRWHBDTEVOQlFUUkNMRTlCUVRWQ0xFVkJRWEZETEZOQlFVVXNRMEZCUmp0QlFVTndReXhSUVVGQk8wbEJRVUVzUTBGQlF5eERRVUZETEdOQlFVWXNRMEZCUVR0SlFVZEJMRWRCUVVFc1IwRkJUU3hEUVVGQkxFTkJRVWNzU1VGQlNEdFhRVWRPTEVkQlFVY3NRMEZCUXl4WlFVRktMRU5CUTBNN1RVRkJRU3hQUVVGQkxFVkJRVmNzU1VGQldEdE5RVU5CTEZOQlFVRXNSVUZCVnl4UlFVRkJMRU5CUVZVc1NVRkJWaXhEUVVSWU8wMUJSVUVzUzBGQlFTeEZRVUZYTEVOQlFVRXNRMEZCUnl4dFFrRkJTQ3hEUVVGM1FpeERRVUZETEV0QlFYcENMRU5CUVN0Q0xFZEJRUzlDTEVOQlJsZzdUVUZIUVN4TFFVRkJMRVZCUVZjc1IwRklXRHROUVVsQkxFOUJRVUVzUlVGQlZ5eERRVXBZTzAxQlMwRXNVVUZCUVN4RlFVRlhMRXRCVEZnN1RVRk5RU3hoUVVGQkxFVkJRV1VzUTBGQlFTeERRVUZGTEUxQlFVWXNRMEZCVXl4RFFVRkRMRXRCUVZZc1EwRkJRU3hEUVVGQkxFZEJRVzlDTEVkQlRtNURPMHRCUkVRN1JVRlFiME1zUTBGQmNrTTdRVUZHYlVNc1EwRkJjRU1pZlE9PVxuIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgJCwgQWJzdHJhY3RfTGF6eV9Mb2FkZXIsIEhvb2tzLCBJdGVtX0RhdGEsIF9fV0lORE9XLFxuICBiaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbkl0ZW1fRGF0YSA9IHJlcXVpcmUoJy4vSXRlbV9EYXRhJyk7XG5cbl9fV0lORE9XID0gcmVxdWlyZSgnLi4vY29yZS9XaW5kb3cnKTtcblxuQWJzdHJhY3RfTGF6eV9Mb2FkZXIgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIEFic3RyYWN0X0xhenlfTG9hZGVyKCkge1xuICAgIHRoaXMuYXV0b2xvYWQgPSBiaW5kKHRoaXMuYXV0b2xvYWQsIHRoaXMpO1xuICAgIHRoaXMuYWRkX2l0ZW0gPSBiaW5kKHRoaXMuYWRkX2l0ZW0sIHRoaXMpO1xuICAgIHRoaXMuc2V0dXBfaXRlbXMgPSBiaW5kKHRoaXMuc2V0dXBfaXRlbXMsIHRoaXMpO1xuICAgIHRoaXMuRWxlbWVudHMgPSB7XG4gICAgICBpdGVtOiAnUFBfTGF6eV9JbWFnZScsXG4gICAgICBwbGFjZWhvbGRlcjogJ1BQX0xhenlfSW1hZ2VfX3BsYWNlaG9sZGVyJyxcbiAgICAgIGxpbms6ICdQUF9KU19MYXp5X19saW5rJyxcbiAgICAgIGltYWdlOiAnUFBfSlNfTGF6eV9faW1hZ2UnXG4gICAgfTtcbiAgICB0aGlzLkl0ZW1zID0gW107XG4gICAgdGhpcy5TZW5zaXRpdml0eSA9IDEwMDtcbiAgICB0aGlzLnRocm90dGxlZF9hdXRvbG9hZCA9IG51bGw7XG4gICAgdGhpcy5zZXR1cF9pdGVtcygpO1xuICAgIHRoaXMucmVzaXplX2FsbCgpO1xuICAgIHRoaXMuYXR0YWNoX2V2ZW50cygpO1xuICB9XG5cblxuICAvKlxuICBcdFx0QWJzdHJhY3QgTWV0aG9kc1xuICAgKi9cblxuICBBYnN0cmFjdF9MYXp5X0xvYWRlci5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24oKSB7fTtcblxuICBBYnN0cmFjdF9MYXp5X0xvYWRlci5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICB0aGlzLmxvYWRfaW1hZ2UoaXRlbSk7XG4gICAgcmV0dXJuIGl0ZW0uJGVsLmltYWdlc0xvYWRlZCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzLmNsZWFudXBfYWZ0ZXJfbG9hZChpdGVtKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9O1xuXG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5sb2FkX2ltYWdlID0gZnVuY3Rpb24oaXRlbSkge1xuICAgIHZhciBmdWxsLCB0aHVtYjtcbiAgICB0aHVtYiA9IGl0ZW0uZGF0YS5nZXRfdXJsKCd0aHVtYicpO1xuICAgIGZ1bGwgPSBpdGVtLmRhdGEuZ2V0X3VybCgnZnVsbCcpO1xuICAgIGl0ZW0uJGVsLnByZXBlbmQodGhpcy5nZXRfaXRlbV9odG1sKHRodW1iLCBmdWxsKSkucmVtb3ZlQ2xhc3MoJ0xhenktSW1hZ2UnKTtcbiAgICByZXR1cm4gaXRlbS5sb2FkZWQgPSB0cnVlO1xuICB9O1xuXG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5jbGVhbnVwX2FmdGVyX2xvYWQgPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgaXRlbS4kZWwuZmluZCgnaW1nJykuYWRkQ2xhc3MoJ1BQX0pTX19sb2FkZWQnKS5yZW1vdmVDbGFzcygnUFBfSlNfX2xvYWRpbmcnKTtcbiAgICByZXR1cm4gaXRlbS4kZWwucmVtb3ZlQ2xhc3ModGhpcy5FbGVtZW50cy5pdGVtKS5maW5kKFwiLlwiICsgdGhpcy5FbGVtZW50cy5wbGFjZWhvbGRlcikuZmFkZU91dCg0MDAsIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICQodGhpcykucmVtb3ZlKCk7XG4gICAgfSk7XG4gIH07XG5cbiAgQWJzdHJhY3RfTGF6eV9Mb2FkZXIucHJvdG90eXBlLmdldF9pdGVtX2h0bWwgPSBmdW5jdGlvbih0aHVtYiwgZnVsbCkge1xuICAgIHJldHVybiBcIlxcbjxhIGNsYXNzPVxcXCJcIiArIHRoaXMuRWxlbWVudHMubGluayArIFwiXFxcIiBocmVmPVxcXCJcIiArIGZ1bGwgKyBcIlxcXCIgcmVsPVxcXCJnYWxsZXJ5XFxcIj5cXG5cdDxpbWcgY2xhc3M9XFxcIlwiICsgdGhpcy5FbGVtZW50cy5pbWFnZSArIFwiXFxcIiBzcmM9XFxcIlwiICsgdGh1bWIgKyBcIlxcXCIgY2xhc3M9XFxcIlBQX0pTX19sb2FkaW5nXFxcIiAvPlxcbjwvYT5cIjtcbiAgfTtcblxuICBBYnN0cmFjdF9MYXp5X0xvYWRlci5wcm90b3R5cGUuc2V0dXBfaXRlbXMgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLkl0ZW1zID0gW107XG4gICAgJChcIi5cIiArIHRoaXMuRWxlbWVudHMuaXRlbSkuZWFjaCh0aGlzLmFkZF9pdGVtKTtcbiAgfTtcblxuICBBYnN0cmFjdF9MYXp5X0xvYWRlci5wcm90b3R5cGUuYWRkX2l0ZW0gPSBmdW5jdGlvbihrZXksIGVsKSB7XG4gICAgdmFyICRlbDtcbiAgICAkZWwgPSAkKGVsKTtcbiAgICB0aGlzLkl0ZW1zLnB1c2goe1xuICAgICAgZWw6IGVsLFxuICAgICAgJGVsOiAkZWwsXG4gICAgICBkYXRhOiBuZXcgSXRlbV9EYXRhKCRlbCksXG4gICAgICBsb2FkZWQ6IGZhbHNlXG4gICAgfSk7XG4gIH07XG5cblxuICAvKlxuICBcdFx0TWV0aG9kc1xuICAgKi9cblxuICBBYnN0cmFjdF9MYXp5X0xvYWRlci5wcm90b3R5cGUucmVzaXplX2FsbCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpLCBpdGVtLCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICByZWYgPSB0aGlzLkl0ZW1zO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGl0ZW0gPSByZWZbaV07XG4gICAgICByZXN1bHRzLnB1c2godGhpcy5yZXNpemUoaXRlbSkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICBBYnN0cmFjdF9MYXp5X0xvYWRlci5wcm90b3R5cGUuYXV0b2xvYWQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaSwgaXRlbSwga2V5LCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICByZWYgPSB0aGlzLkl0ZW1zO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGtleSA9IGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBrZXkgPSArK2kpIHtcbiAgICAgIGl0ZW0gPSByZWZba2V5XTtcbiAgICAgIGlmICghaXRlbS5sb2FkZWQgJiYgdGhpcy5pbl9sb29zZV92aWV3KGl0ZW0uZWwpKSB7XG4gICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLmxvYWQoaXRlbSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHZvaWQgMCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5pbl9sb29zZV92aWV3ID0gZnVuY3Rpb24oZWwpIHtcbiAgICB2YXIgcmVjdDtcbiAgICBpZiAoZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0ID09IG51bGwpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgaWYgKHJlY3QuaGVpZ2h0ID09PSAwICYmIHJlY3Qud2lkdGggPT09IDApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHJlY3QudG9wICsgcmVjdC5oZWlnaHQgPj0gLXRoaXMuU2Vuc2l0aXZpdHkgJiYgcmVjdC5ib3R0b20gLSByZWN0LmhlaWdodCA8PSBfX1dJTkRPVy5oZWlnaHQgKyB0aGlzLlNlbnNpdGl2aXR5ICYmIHJlY3QubGVmdCArIHJlY3Qud2lkdGggPj0gLXRoaXMuU2Vuc2l0aXZpdHkgJiYgcmVjdC5yaWdodCAtIHJlY3Qud2lkdGggPD0gX19XSU5ET1cud2lkdGggKyB0aGlzLlNlbnNpdGl2aXR5O1xuICB9O1xuXG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5yZW1vdmVfcGxhY2Vob2xkZXIgPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0uJGVsLmZpbmQoXCIuXCIgKyB0aGlzLkVsZW1lbnRzLnBsYWNlaG9sZGVyICsgXCIsIG5vc2NyaXB0XCIpLnJlbW92ZSgpO1xuICB9O1xuXG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZGV0YWNoX2V2ZW50cygpO1xuICB9O1xuXG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5hdHRhY2hfZXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy50aHJvdHRsZWRfYXV0b2xvYWQgPSBfLnRocm90dGxlKHRoaXMuYXV0b2xvYWQsIDUwKTtcbiAgICByZXR1cm4gSG9va3MuYWRkQWN0aW9uKCdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCcsIHRoaXMudGhyb3R0bGVkX2F1dG9sb2FkLCAxMDApO1xuICB9O1xuXG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5kZXRhY2hfZXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy50aHJvdHRsZWRfYXV0b2xvYWQgPSBudWxsO1xuICAgIHJldHVybiBIb29rcy5yZW1vdmVBY3Rpb24oJ3Bob3J0LnBvcnRmb2xpby5yZWZyZXNoJywgdGhpcy50aHJvdHRsZWRfYXV0b2xvYWQsIDEwMCk7XG4gIH07XG5cbiAgcmV0dXJuIEFic3RyYWN0X0xhenlfTG9hZGVyO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFic3RyYWN0X0xhenlfTG9hZGVyO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lRV0p6ZEhKaFkzUmZUR0Y2ZVY5TWIyRmtaWEl1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SkJZbk4wY21GamRGOU1ZWHA1WDB4dllXUmxjaTVqYjJabVpXVWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqdEJRVUZCT3pzN1FVRkJRU3hKUVVGQkxHMUVRVUZCTzBWQlFVRTdPMEZCUjBFc1EwRkJRU3hIUVVGSkxFOUJRVUVzUTBGQlV5eFJRVUZVT3p0QlFVTktMRXRCUVVFc1IwRkJVU3hQUVVGQkxFTkJRVk1zVlVGQlZEczdRVUZEVWl4VFFVRkJMRWRCUVZrc1QwRkJRU3hEUVVGVExHRkJRVlE3TzBGQlExb3NVVUZCUVN4SFFVRlhMRTlCUVVFc1EwRkJVeXhuUWtGQlZEczdRVUZGVER0RlFVTlJMRGhDUVVGQk96czdPMGxCUTFvc1NVRkJReXhEUVVGQkxGRkJRVVFzUjBGRFF6dE5RVUZCTEVsQlFVRXNSVUZCWVN4bFFVRmlPMDFCUTBFc1YwRkJRU3hGUVVGaExEUkNRVVJpTzAxQlJVRXNTVUZCUVN4RlFVRmhMR3RDUVVaaU8wMUJSMEVzUzBGQlFTeEZRVUZoTEcxQ1FVaGlPenRKUVV0RUxFbEJRVU1zUTBGQlFTeExRVUZFTEVkQlFWTTdTVUZKVkN4SlFVRkRMRU5CUVVFc1YwRkJSQ3hIUVVGbE8wbEJTV1lzU1VGQlF5eERRVUZCTEd0Q1FVRkVMRWRCUVhOQ08wbEJSWFJDTEVsQlFVTXNRMEZCUVN4WFFVRkVMRU5CUVVFN1NVRkRRU3hKUVVGRExFTkJRVUVzVlVGQlJDeERRVUZCTzBsQlEwRXNTVUZCUXl4RFFVRkJMR0ZCUVVRc1EwRkJRVHRGUVc1Q1dUczdPMEZCY1VKaU96czdPMmxEUVV0QkxFMUJRVUVzUjBGQlVTeFRRVUZCTEVkQlFVRTdPMmxEUVVWU0xFbEJRVUVzUjBGQlRTeFRRVUZGTEVsQlFVWTdTVUZEVEN4SlFVRkRMRU5CUVVFc1ZVRkJSQ3hEUVVGaExFbEJRV0k3VjBGRFFTeEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRmxCUVZRc1EwRkJjMElzUTBGQlFTeFRRVUZCTEV0QlFVRTdZVUZCUVN4VFFVRkJPMlZCUTNKQ0xFdEJRVU1zUTBGQlFTeHJRa0ZCUkN4RFFVRnhRaXhKUVVGeVFqdE5RVVJ4UWp0SlFVRkJMRU5CUVVFc1EwRkJRU3hEUVVGQkxFbEJRVUVzUTBGQmRFSTdSVUZHU3pzN2FVTkJTMDRzVlVGQlFTeEhRVUZaTEZOQlFVVXNTVUZCUmp0QlFVZFlMRkZCUVVFN1NVRkJRU3hMUVVGQkxFZEJRVkVzU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4UFFVRldMRU5CUVcxQ0xFOUJRVzVDTzBsQlExSXNTVUZCUVN4SFFVRlBMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zVDBGQlZpeERRVUZ0UWl4TlFVRnVRanRKUVVkUUxFbEJRVWtzUTBGQlF5eEhRVU5NTEVOQlFVTXNUMEZFUkN4RFFVTlZMRWxCUVVNc1EwRkJRU3hoUVVGRUxFTkJRV2RDTEV0QlFXaENMRVZCUVhWQ0xFbEJRWFpDTEVOQlJGWXNRMEZGUVN4RFFVRkRMRmRCUmtRc1EwRkZZeXhaUVVaa08xZEJTMEVzU1VGQlNTeERRVUZETEUxQlFVd3NSMEZCWXp0RlFWcElPenRwUTBGaldpeHJRa0ZCUVN4SFFVRnZRaXhUUVVGRkxFbEJRVVk3U1VGRmJrSXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhKUVVGVUxFTkJRV1VzUzBGQlppeERRVUZ6UWl4RFFVRkRMRkZCUVhaQ0xFTkJRV2xETEdWQlFXcERMRU5CUVd0RUxFTkJRVU1zVjBGQmJrUXNRMEZCWjBVc1owSkJRV2hGTzFkQlJVRXNTVUZCU1N4RFFVRkRMRWRCUjB3c1EwRkJReXhYUVVoRUxFTkJSMk1zU1VGQlF5eERRVUZCTEZGQlFWRXNRMEZCUXl4SlFVaDRRaXhEUVUxQkxFTkJRVU1zU1VGT1JDeERRVTFQTEVkQlFVRXNSMEZCU1N4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExGZEJUbkpDTEVOQlQwRXNRMEZCUXl4UFFWQkVMRU5CVDFVc1IwRlFWaXhGUVU5bExGTkJRVUU3WVVGQlJ5eERRVUZCTEVOQlFVY3NTVUZCU0N4RFFVRlRMRU5CUVVNc1RVRkJWaXhEUVVGQk8wbEJRVWdzUTBGUVpqdEZRVXB0UWpzN2FVTkJZWEJDTEdGQlFVRXNSMEZCWlN4VFFVRkZMRXRCUVVZc1JVRkJVeXhKUVVGVU8xZEJRMlFzWlVGQlFTeEhRVVZaTEVsQlFVTXNRMEZCUVN4UlFVRlJMRU5CUVVNc1NVRkdkRUlzUjBGRk1rSXNXVUZHTTBJc1IwRkZjVU1zU1VGR2NrTXNSMEZGTUVNc2NVTkJSakZETEVkQlIyVXNTVUZCUXl4RFFVRkJMRkZCUVZFc1EwRkJReXhMUVVoNlFpeEhRVWNyUWl4WFFVZ3ZRaXhIUVVkM1F5eExRVWg0UXl4SFFVYzRRenRGUVVwb1F6czdhVU5CVVdZc1YwRkJRU3hIUVVGaExGTkJRVUU3U1VGRldpeEpRVUZETEVOQlFVRXNTMEZCUkN4SFFVRlRPMGxCUjFRc1EwRkJRU3hEUVVGSExFZEJRVUVzUjBGQlNTeEpRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRWxCUVdwQ0xFTkJRWGxDTEVOQlFVTXNTVUZCTVVJc1EwRkJaME1zU1VGQlF5eERRVUZCTEZGQlFXcERPMFZCVEZrN08ybERRVkZpTEZGQlFVRXNSMEZCVlN4VFFVRkZMRWRCUVVZc1JVRkJUeXhGUVVGUU8wRkJRMVFzVVVGQlFUdEpRVUZCTEVkQlFVRXNSMEZCVFN4RFFVRkJMRU5CUVVjc1JVRkJTRHRKUVVOT0xFbEJRVU1zUTBGQlFTeExRVUZMTEVOQlFVTXNTVUZCVUN4RFFVTkRPMDFCUVVFc1JVRkJRU3hGUVVGUkxFVkJRVkk3VFVGRFFTeEhRVUZCTEVWQlFWRXNSMEZFVWp0TlFVVkJMRWxCUVVFc1JVRkJXU3hKUVVGQkxGTkJRVUVzUTBGQlZ5eEhRVUZZTEVOQlJsbzdUVUZIUVN4TlFVRkJMRVZCUVZFc1MwRklVanRMUVVSRU8wVkJSbE03T3p0QlFWVldPenM3TzJsRFFVZEJMRlZCUVVFc1IwRkJXU3hUUVVGQk8wRkJRMWdzVVVGQlFUdEJRVUZCTzBGQlFVRTdVMEZCUVN4eFEwRkJRVHM3YlVKQlFVRXNTVUZCUXl4RFFVRkJMRTFCUVVRc1EwRkJVeXhKUVVGVU8wRkJRVUU3TzBWQlJGYzdPMmxEUVUxYUxGRkJRVUVzUjBGQlZTeFRRVUZCTzBGQlExUXNVVUZCUVR0QlFVRkJPMEZCUVVFN1UwRkJRU3hwUkVGQlFUczdUVUZEUXl4SlFVRkhMRU5CUVVrc1NVRkJTU3hEUVVGRExFMUJRVlFzU1VGQmIwSXNTVUZCUXl4RFFVRkJMR0ZCUVVRc1EwRkJaMElzU1VGQlNTeERRVUZETEVWQlFYSkNMRU5CUVhaQ08zRkNRVU5ETEVsQlFVTXNRMEZCUVN4SlFVRkVMRU5CUVU4c1NVRkJVQ3hIUVVSRU8wOUJRVUVzVFVGQlFUczJRa0ZCUVRzN1FVRkVSRHM3UlVGRVV6czdhVU5CUzFZc1lVRkJRU3hIUVVGbExGTkJRVVVzUlVGQlJqdEJRVU5rTEZGQlFVRTdTVUZCUVN4SlFVRnRRaXhuUTBGQmJrSTdRVUZCUVN4aFFVRlBMRXRCUVZBN08wbEJRMEVzU1VGQlFTeEhRVUZQTEVWQlFVVXNRMEZCUXl4eFFrRkJTQ3hEUVVGQk8wbEJSMUFzU1VGQlowSXNTVUZCU1N4RFFVRkRMRTFCUVV3c1MwRkJaU3hEUVVGbUxFbEJRWEZDTEVsQlFVa3NRMEZCUXl4TFFVRk1MRXRCUVdNc1EwRkJia1E3UVVGQlFTeGhRVUZQTEUxQlFWQTdPMEZCUjBFc1YwRkZReXhKUVVGSkxFTkJRVU1zUjBGQlRDeEhRVUZYTEVsQlFVa3NRMEZCUXl4TlFVRm9RaXhKUVVFd1FpeERRVUZETEVsQlFVTXNRMEZCUVN4WFFVRTFRaXhKUVVOQkxFbEJRVWtzUTBGQlF5eE5RVUZNTEVkQlFXTXNTVUZCU1N4RFFVRkRMRTFCUVc1Q0xFbEJRVFpDTEZGQlFWRXNRMEZCUXl4TlFVRlVMRWRCUVd0Q0xFbEJRVU1zUTBGQlFTeFhRVVJvUkN4SlFVbEJMRWxCUVVrc1EwRkJReXhKUVVGTUxFZEJRVmtzU1VGQlNTeERRVUZETEV0QlFXcENMRWxCUVRCQ0xFTkJRVU1zU1VGQlF5eERRVUZCTEZkQlNqVkNMRWxCUzBFc1NVRkJTU3hEUVVGRExFdEJRVXdzUjBGQllTeEpRVUZKTEVOQlFVTXNTMEZCYkVJc1NVRkJNa0lzVVVGQlVTeERRVUZETEV0QlFWUXNSMEZCYVVJc1NVRkJReXhEUVVGQk8wVkJabWhET3p0cFEwRnRRbVlzYTBKQlFVRXNSMEZCYjBJc1UwRkJSU3hKUVVGR08xZEJRMjVDTEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1NVRkJWQ3hEUVVGbExFZEJRVUVzUjBGQlNTeEpRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRmRCUVdRc1IwRkJNRUlzV1VGQmVrTXNRMEZCYzBRc1EwRkJReXhOUVVGMlJDeERRVUZCTzBWQlJHMUNPenRwUTBGSGNFSXNUMEZCUVN4SFFVRlRMRk5CUVVFN1YwRkRVaXhKUVVGRExFTkJRVUVzWVVGQlJDeERRVUZCTzBWQlJGRTdPMmxEUVVkVUxHRkJRVUVzUjBGQlpTeFRRVUZCTzBsQlJXUXNTVUZCUXl4RFFVRkJMR3RDUVVGRUxFZEJRWE5DTEVOQlFVTXNRMEZCUXl4UlFVRkdMRU5CUVZrc1NVRkJReXhEUVVGQkxGRkJRV0lzUlVGQmRVSXNSVUZCZGtJN1YwRkRkRUlzUzBGQlN5eERRVUZETEZOQlFVNHNRMEZCWjBJc2VVSkJRV2hDTEVWQlFUSkRMRWxCUVVNc1EwRkJRU3hyUWtGQk5VTXNSVUZCWjBVc1IwRkJhRVU3UlVGSVl6czdhVU5CVFdZc1lVRkJRU3hIUVVGbExGTkJRVUU3U1VGRlpDeEpRVUZETEVOQlFVRXNhMEpCUVVRc1IwRkJjMEk3VjBGRGRFSXNTMEZCU3l4RFFVRkRMRmxCUVU0c1EwRkJiVUlzZVVKQlFXNUNMRVZCUVRoRExFbEJRVU1zUTBGQlFTeHJRa0ZCTDBNc1JVRkJiVVVzUjBGQmJrVTdSVUZJWXpzN096czdPMEZCVDJoQ0xFMUJRVTBzUTBGQlF5eFBRVUZRTEVkQlFXbENJbjA9XG4iLCJ2YXIgSXRlbV9EYXRhO1xuXG5JdGVtX0RhdGEgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIEl0ZW1fRGF0YSgkZWwpIHtcbiAgICB2YXIgZGF0YTtcbiAgICB0aGlzLiRlbCA9ICRlbDtcbiAgICBkYXRhID0gJGVsLmRhdGEoJ2l0ZW0nKTtcbiAgICBpZiAoIWRhdGEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkVsZW1lbnQgZG9lc24ndCBjb250YWluIGBkYXRhLWl0ZW1gIGF0dHJpYnV0ZVwiKTtcbiAgICB9XG4gICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgfVxuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X2RhdGEgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGltYWdlO1xuICAgIGltYWdlID0gdGhpcy5kYXRhWydpbWFnZXMnXVtuYW1lXTtcbiAgICBpZiAoIWltYWdlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBpbWFnZTtcbiAgfTtcblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF9zaXplID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBoZWlnaHQsIGltYWdlLCByZWYsIHNpemUsIHdpZHRoO1xuICAgIGltYWdlID0gdGhpcy5nZXRfZGF0YShuYW1lKTtcbiAgICBpZiAoIWltYWdlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHNpemUgPSBpbWFnZVsnc2l6ZSddO1xuICAgIHJlZiA9IHNpemUuc3BsaXQoJ3gnKSwgd2lkdGggPSByZWZbMF0sIGhlaWdodCA9IHJlZlsxXTtcbiAgICB3aWR0aCA9IHBhcnNlSW50KHdpZHRoKTtcbiAgICBoZWlnaHQgPSBwYXJzZUludChoZWlnaHQpO1xuICAgIHJldHVybiBbd2lkdGgsIGhlaWdodF07XG4gIH07XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfdXJsID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBpbWFnZTtcbiAgICBpbWFnZSA9IHRoaXMuZ2V0X2RhdGEobmFtZSk7XG4gICAgaWYgKCFpbWFnZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gaW1hZ2VbJ3VybCddO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X29yX2ZhbHNlID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKHRoaXMuZGF0YVtrZXldKSB7XG4gICAgICByZXR1cm4gdGhpcy5kYXRhW2tleV07XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF9yYXRpbyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldF9vcl9mYWxzZSgncmF0aW8nKTtcbiAgfTtcblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF90eXBlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0X29yX2ZhbHNlKCd0eXBlJyk7XG4gIH07XG5cbiAgcmV0dXJuIEl0ZW1fRGF0YTtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBJdGVtX0RhdGE7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVNYUmxiVjlFWVhSaExtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpU1hSbGJWOUVZWFJoTG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4SlFVRkJPenRCUVVGTk8wVkJSVkVzYlVKQlFVVXNSMEZCUmp0QlFVTmFMRkZCUVVFN1NVRkJRU3hKUVVGRExFTkJRVUVzUjBGQlJDeEhRVUZQTzBsQlExQXNTVUZCUVN4SFFVRlBMRWRCUVVjc1EwRkJReXhKUVVGS0xFTkJRVlVzVFVGQlZqdEpRVVZRTEVsQlFVY3NRMEZCU1N4SlFVRlFPMEZCUTBNc1dVRkJWU3hKUVVGQkxFdEJRVUVzUTBGQlRTd3JRMEZCVGl4RlFVUllPenRKUVVkQkxFbEJRVU1zUTBGQlFTeEpRVUZFTEVkQlFWRTdSVUZRU1RzN2MwSkJWMklzVVVGQlFTeEhRVUZWTEZOQlFVVXNTVUZCUmp0QlFVTlVMRkZCUVVFN1NVRkJRU3hMUVVGQkxFZEJRVkVzU1VGQlF5eERRVUZCTEVsQlFVMHNRMEZCUVN4UlFVRkJMRU5CUVZrc1EwRkJRU3hKUVVGQk8wbEJRek5DTEVsQlFXZENMRU5CUVVrc1MwRkJjRUk3UVVGQlFTeGhRVUZQTEUxQlFWQTdPMEZCUlVFc1YwRkJUenRGUVVwRk96dHpRa0ZOVml4UlFVRkJMRWRCUVZVc1UwRkJSU3hKUVVGR08wRkJRMVFzVVVGQlFUdEpRVUZCTEV0QlFVRXNSMEZCVVN4SlFVRkRMRU5CUVVFc1VVRkJSQ3hEUVVGWExFbEJRVmc3U1VGRFVpeEpRVUZuUWl4RFFVRkpMRXRCUVhCQ08wRkJRVUVzWVVGQlR5eE5RVUZRT3p0SlFVVkJMRWxCUVVFc1IwRkJUeXhMUVVGUExFTkJRVUVzVFVGQlFUdEpRVVZrTEUxQlFXdENMRWxCUVVrc1EwRkJReXhMUVVGTUxFTkJRVmtzUjBGQldpeERRVUZzUWl4RlFVRkRMR05CUVVRc1JVRkJVVHRKUVVWU0xFdEJRVUVzUjBGQlVTeFJRVUZCTEVOQlFWVXNTMEZCVmp0SlFVTlNMRTFCUVVFc1IwRkJVeXhSUVVGQkxFTkJRVlVzVFVGQlZqdEJRVVZVTEZkQlFVOHNRMEZCUXl4TFFVRkVMRVZCUVZFc1RVRkJVanRGUVZoRk96dHpRa0ZoVml4UFFVRkJMRWRCUVZNc1UwRkJSU3hKUVVGR08wRkJRMUlzVVVGQlFUdEpRVUZCTEV0QlFVRXNSMEZCVVN4SlFVRkRMRU5CUVVFc1VVRkJSQ3hEUVVGWExFbEJRVmc3U1VGRFVpeEpRVUZuUWl4RFFVRkpMRXRCUVhCQ08wRkJRVUVzWVVGQlR5eE5RVUZRT3p0QlFVTkJMRmRCUVU4c1MwRkJUeXhEUVVGQkxFdEJRVUU3UlVGSVRqczdjMEpCUzFRc1dVRkJRU3hIUVVGakxGTkJRVVVzUjBGQlJqdEpRVU5pTEVsQlFVY3NTVUZCUXl4RFFVRkJMRWxCUVUwc1EwRkJRU3hIUVVGQkxFTkJRVlk3UVVGRFF5eGhRVUZQTEVsQlFVTXNRMEZCUVN4SlFVRk5MRU5CUVVFc1IwRkJRU3hGUVVSbU96dEJRVVZCTEZkQlFVODdSVUZJVFRzN2MwSkJTMlFzVTBGQlFTeEhRVUZqTEZOQlFVRTdWMEZCUnl4SlFVRkRMRU5CUVVFc1dVRkJSQ3hEUVVGbExFOUJRV1k3UlVGQlNEczdjMEpCUTJRc1VVRkJRU3hIUVVGakxGTkJRVUU3VjBGQlJ5eEpRVUZETEVOQlFVRXNXVUZCUkN4RFFVRmxMRTFCUVdZN1JVRkJTRHM3T3pzN08wRkJSMllzVFVGQlRTeERRVUZETEU5QlFWQXNSMEZCYVVJaWZRPT1cbiIsInZhciAkLCBBYnN0cmFjdF9MYXp5X0xvYWRlciwgTGF6eV9NYXNvbnJ5LCBfX1dJTkRPVyxcbiAgZXh0ZW5kID0gZnVuY3Rpb24oY2hpbGQsIHBhcmVudCkgeyBmb3IgKHZhciBrZXkgaW4gcGFyZW50KSB7IGlmIChoYXNQcm9wLmNhbGwocGFyZW50LCBrZXkpKSBjaGlsZFtrZXldID0gcGFyZW50W2tleV07IH0gZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9IGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTsgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTsgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTsgcmV0dXJuIGNoaWxkOyB9LFxuICBoYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHk7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5BYnN0cmFjdF9MYXp5X0xvYWRlciA9IHJlcXVpcmUoJy4vQWJzdHJhY3RfTGF6eV9Mb2FkZXInKTtcblxuX19XSU5ET1cgPSByZXF1aXJlKCcuLi9jb3JlL1dpbmRvdycpO1xuXG5MYXp5X01hc29ucnkgPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICBleHRlbmQoTGF6eV9NYXNvbnJ5LCBzdXBlckNsYXNzKTtcblxuICBmdW5jdGlvbiBMYXp5X01hc29ucnkoKSB7XG4gICAgcmV0dXJuIExhenlfTWFzb25yeS5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUucmVzaXplX2FsbCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucGxhY2Vob2xkZXJfd2lkdGggPSAkKCcuUFBfTWFzb25yeV9fc2l6ZXInKS53aWR0aCgpO1xuICAgIHJldHVybiBMYXp5X01hc29ucnkuX19zdXBlcl9fLnJlc2l6ZV9hbGwuY2FsbCh0aGlzKTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbS4kZWwuY3NzKHtcbiAgICAgICdtaW4taGVpZ2h0JzogTWF0aC5mbG9vcih0aGlzLnBsYWNlaG9sZGVyX3dpZHRoIC8gaXRlbS5kYXRhLmdldF9yYXRpbygpKVxuICAgIH0pO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUuY2xlYW51cF9hZnRlcl9sb2FkID0gZnVuY3Rpb24oaXRlbSkge1xuICAgIGl0ZW0uJGVsLmNzcygnbWluLWhlaWdodCcsICcnKTtcbiAgICByZXR1cm4gTGF6eV9NYXNvbnJ5Ll9fc3VwZXJfXy5jbGVhbnVwX2FmdGVyX2xvYWQuY2FsbCh0aGlzLCBpdGVtKTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmF0dGFjaF9ldmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICBMYXp5X01hc29ucnkuX19zdXBlcl9fLmF0dGFjaF9ldmVudHMuY2FsbCh0aGlzKTtcbiAgICByZXR1cm4gJCh3aW5kb3cpLm9uKCdzY3JvbGwnLCB0aGlzLnRocm90dGxlZF9hdXRvbG9hZCk7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5kZXRhY2hfZXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgJCh3aW5kb3cpLm9mZignc2Nyb2xsJywgdGhpcy50aHJvdHRsZWRfYXV0b2xvYWQpO1xuICAgIHJldHVybiBMYXp5X01hc29ucnkuX19zdXBlcl9fLmRldGFjaF9ldmVudHMuY2FsbCh0aGlzKTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaSwgaXRlbSwga2V5LCBsZW4sIHJlZjtcbiAgICByZWYgPSB0aGlzLkl0ZW1zO1xuICAgIGZvciAoa2V5ID0gaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGtleSA9ICsraSkge1xuICAgICAgaXRlbSA9IHJlZltrZXldO1xuICAgICAgaXRlbS4kZWwuY3NzKCdtaW4taGVpZ2h0JywgJycpO1xuICAgIH1cbiAgICByZXR1cm4gTGF6eV9NYXNvbnJ5Ll9fc3VwZXJfXy5kZXN0cm95LmNhbGwodGhpcyk7XG4gIH07XG5cbiAgcmV0dXJuIExhenlfTWFzb25yeTtcblxufSkoQWJzdHJhY3RfTGF6eV9Mb2FkZXIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExhenlfTWFzb25yeTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVEdGNmVWOU5ZWE52Ym5KNUxtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpVEdGNmVWOU5ZWE52Ym5KNUxtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeEpRVUZCTEN0RFFVRkJPMFZCUVVFN096dEJRVUZCTEVOQlFVRXNSMEZCU1N4UFFVRkJMRU5CUVZNc1VVRkJWRHM3UVVGRFNpeHZRa0ZCUVN4SFFVRjFRaXhQUVVGQkxFTkJRVk1zZDBKQlFWUTdPMEZCUTNaQ0xGRkJRVUVzUjBGQlZ5eFBRVUZCTEVOQlFWTXNaMEpCUVZRN08wRkJSVXc3T3pzN096czdlVUpCUlV3c1ZVRkJRU3hIUVVGWkxGTkJRVUU3U1VGRFdDeEpRVUZETEVOQlFVRXNhVUpCUVVRc1IwRkJjVUlzUTBGQlFTeERRVUZITEc5Q1FVRklMRU5CUVhsQ0xFTkJRVU1zUzBGQk1VSXNRMEZCUVR0WFFVTnlRaXd5UTBGQlFUdEZRVVpYT3p0NVFrRkpXaXhOUVVGQkxFZEJRVkVzVTBGQlJTeEpRVUZHTzFkQlExQXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhIUVVGVUxFTkJRV0U3VFVGQlFTeFpRVUZCTEVWQlFXTXNTVUZCU1N4RFFVRkRMRXRCUVV3c1EwRkJXU3hKUVVGRExFTkJRVUVzYVVKQlFVUXNSMEZCY1VJc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eFRRVUZXTEVOQlFVRXNRMEZCYWtNc1EwRkJaRHRMUVVGaU8wVkJSRTg3TzNsQ1FVZFNMR3RDUVVGQkxFZEJRVzlDTEZOQlFVTXNTVUZCUkR0SlFVVnVRaXhKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEVkQlFWUXNRMEZCWXl4WlFVRmtMRVZCUVRSQ0xFVkJRVFZDTzFkQlIwRXNjVVJCUVU4c1NVRkJVRHRGUVV4dFFqczdlVUpCVDNCQ0xHRkJRVUVzUjBGQlpTeFRRVUZCTzBsQlJXUXNPRU5CUVVFN1YwRkhRU3hEUVVGQkxFTkJRVWNzVFVGQlNDeERRVUZYTEVOQlFVTXNSVUZCV2l4RFFVRmxMRkZCUVdZc1JVRkJlVUlzU1VGQlF5eERRVUZCTEd0Q1FVRXhRanRGUVV4ak96dDVRa0ZUWml4aFFVRkJMRWRCUVdVc1UwRkJRVHRKUVVWa0xFTkJRVUVzUTBGQlJ5eE5RVUZJTEVOQlFWY3NRMEZCUXl4SFFVRmFMRU5CUVdkQ0xGRkJRV2hDTEVWQlFUQkNMRWxCUVVNc1EwRkJRU3hyUWtGQk0wSTdWMEZIUVN3NFEwRkJRVHRGUVV4ak96dDVRa0ZQWml4UFFVRkJMRWRCUVZNc1UwRkJRVHRCUVVOU0xGRkJRVUU3UVVGQlFUdEJRVUZCTEZOQlFVRXNhVVJCUVVFN08wMUJRME1zU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4SFFVRlVMRU5CUVdFc1dVRkJZaXhGUVVFeVFpeEZRVUV6UWp0QlFVUkVPMWRCUlVFc2QwTkJRVUU3UlVGSVVUczdPenRIUVdoRGFVSTdPMEZCYzBNelFpeE5RVUZOTEVOQlFVTXNUMEZCVUN4SFFVRnBRaUo5XG4iLCJ2YXIgJCwgSG9va3MsIGNyZWF0ZSwgZGVzdHJveSwgaW5zdGFuY2U7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5pbnN0YW5jZSA9IGZhbHNlO1xuXG5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gIGlmICghaW5zdGFuY2UpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaW5zdGFuY2UuZGVzdHJveSgpO1xuICByZXR1cm4gaW5zdGFuY2UgPSBudWxsO1xufTtcblxuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gIHZhciBIYW5kbGVyO1xuICBkZXN0cm95KCk7XG4gIEhhbmRsZXIgPSBIb29rcy5hcHBseUZpbHRlcnMoJ3Bob3J0LmxhenkuaGFuZGxlcicsIGZhbHNlKTtcbiAgaWYgKCFIYW5kbGVyKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGluc3RhbmNlID0gbmV3IEhhbmRsZXIoKTtcbn07XG5cbkhvb2tzLmFkZEFjdGlvbigncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnLCBjcmVhdGUsIDEwMCk7XG5cbkhvb2tzLmFkZEFjdGlvbigncGhvcnQucG9ydGZvbGlvLmRlc3Ryb3knLCBkZXN0cm95KTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYzNSaGNuUXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lKemRHRnlkQzVqYjJabVpXVWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklrRkJRVUVzU1VGQlFUczdRVUZCUVN4RFFVRkJMRWRCUVVrc1QwRkJRU3hEUVVGVExGRkJRVlE3TzBGQlEwb3NTMEZCUVN4SFFVRlJMRTlCUVVFc1EwRkJVeXhWUVVGVU96dEJRVWRTTEZGQlFVRXNSMEZCVnpzN1FVRkZXQ3hQUVVGQkxFZEJRVlVzVTBGQlFUdEZRVU5VTEVsQlFWVXNRMEZCU1N4UlFVRmtPMEZCUVVFc1YwRkJRVHM3UlVGRFFTeFJRVUZSTEVOQlFVTXNUMEZCVkN4RFFVRkJPMU5CUTBFc1VVRkJRU3hIUVVGWE8wRkJTRVk3TzBGQlMxWXNUVUZCUVN4SFFVRlRMRk5CUVVFN1FVRkhVaXhOUVVGQk8wVkJRVUVzVDBGQlFTeERRVUZCTzBWQlIwRXNUMEZCUVN4SFFVRlZMRXRCUVVzc1EwRkJReXhaUVVGT0xFTkJRVzFDTEc5Q1FVRnVRaXhGUVVGNVF5eExRVUY2UXp0RlFVTldMRWxCUVZVc1EwRkJTU3hQUVVGa08wRkJRVUVzVjBGQlFUczdSVUZKUVN4UlFVRkJMRWRCUVdVc1NVRkJRU3hQUVVGQkxFTkJRVUU3UVVGWVVEczdRVUZwUWxRc1MwRkJTeXhEUVVGRExGTkJRVTRzUTBGQlowSXNlVUpCUVdoQ0xFVkJRVEpETEUxQlFUTkRMRVZCUVcxRUxFZEJRVzVFT3p0QlFVTkJMRXRCUVVzc1EwRkJReXhUUVVGT0xFTkJRV2RDTEhsQ1FVRm9RaXhGUVVFeVF5eFBRVUV6UXlKOVxuIiwidmFyIEhvb2tzLCBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlcjtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuXG4vKlxuXG4gICAgICogSW5pdGlhbGl6ZSBQb3J0Zm9saW8gQ29yZVxuXHQtLS1cblx0XHRVc2luZyBwNTAgQCBgcGhvcnQuY29yZS5yZWFkeWBcblx0XHRMYXRlIHByaW9yaXR5IGlzIGdvaW5nIHRvIGZvcmNlIGV4cGxpY2l0IHByaW9yaXR5IGluIGFueSBvdGhlciBtb3ZpbmcgcGFydHMgdGhhdCBhcmUgZ29pbmcgdG8gdG91Y2ggcG9ydGZvbGlvIGxheW91dCBhdCBgcGhvcnQubG9hZGVkYFxuXHQtLS1cbiAqL1xuXG5Qb3J0Zm9saW9fRXZlbnRfTWFuYWdlciA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gUG9ydGZvbGlvX0V2ZW50X01hbmFnZXIoKSB7fVxuXG4gIFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyLnByb3RvdHlwZS5wcmVwYXJlID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MuZG9BY3Rpb24oJ3Bob3J0LnBvcnRmb2xpby5wcmVwYXJlJyk7XG4gIH07XG5cbiAgUG9ydGZvbGlvX0V2ZW50X01hbmFnZXIucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLmRvQWN0aW9uKCdwaG9ydC5wb3J0Zm9saW8uY3JlYXRlJyk7XG4gIH07XG5cbiAgUG9ydGZvbGlvX0V2ZW50X01hbmFnZXIucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbigpIHtcbiAgICBIb29rcy5kb0FjdGlvbigncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnKTtcbiAgfTtcblxuICBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLmRvQWN0aW9uKCdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScpO1xuICB9O1xuXG4gIHJldHVybiBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlcjtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlcjtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVUc5eWRHWnZiR2x2WDBWMlpXNTBYMDFoYm1GblpYSXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lKUWIzSjBabTlzYVc5ZlJYWmxiblJmVFdGdVlXZGxjaTVqYjJabVpXVWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklrRkJRVUVzU1VGQlFUczdRVUZCUVN4TFFVRkJMRWRCUVZFc1QwRkJRU3hEUVVGVExGVkJRVlE3T3p0QlFVVlNPenM3T3pzN096czdRVUZUVFRzN08yOURRVVZNTEU5QlFVRXNSMEZCVXl4VFFVRkJPMGxCUTFJc1MwRkJTeXhEUVVGRExGRkJRVTRzUTBGQlpTeDVRa0ZCWmp0RlFVUlJPenR2UTBGSlZDeE5RVUZCTEVkQlFWRXNVMEZCUVR0SlFVTlFMRXRCUVVzc1EwRkJReXhSUVVGT0xFTkJRV1VzZDBKQlFXWTdSVUZFVHpzN2IwTkJTMUlzVDBGQlFTeEhRVUZUTEZOQlFVRTdTVUZEVWl4TFFVRkxMRU5CUVVNc1VVRkJUaXhEUVVGbExIbENRVUZtTzBWQlJGRTdPMjlEUVV0VUxFOUJRVUVzUjBGQlV5eFRRVUZCTzBsQlJWSXNTMEZCU3l4RFFVRkRMRkZCUVU0c1EwRkJaU3g1UWtGQlpqdEZRVVpST3pzN096czdRVUZOVml4TlFVRk5MRU5CUVVNc1QwRkJVQ3hIUVVGcFFpSjlcbiIsInZhciBIb29rcywgUG9ydGZvbGlvX0ludGVyZmFjZSxcbiAgYmluZCA9IGZ1bmN0aW9uKGZuLCBtZSl7IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7IH07IH07XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cblxuLypcblx0QWJzdHJhY3QgQ2xhc3MgUG9ydG9mbGlvX0V2ZW50X0ltZXBsZW1lbnRhdGlvblxuXG4gICAgSGFuZGxlcyBhbGwgdGhlIGV2ZW50cyByZXF1aXJlZCB0byBmdWxseSBoYW5kbGUgYSBwb3J0Zm9saW8gbGF5b3V0IHByb2Nlc3NcbiAqL1xuXG5Qb3J0Zm9saW9fSW50ZXJmYWNlID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBQb3J0Zm9saW9fSW50ZXJmYWNlKGFyZ3MpIHtcbiAgICB0aGlzLnB1cmdlX2FjdGlvbnMgPSBiaW5kKHRoaXMucHVyZ2VfYWN0aW9ucywgdGhpcyk7XG4gICAgdGhpcy5zZXR1cF9hY3Rpb25zKCk7XG4gICAgdGhpcy5pbml0aWFsaXplKGFyZ3MpO1xuICB9XG5cbiAgUG9ydGZvbGlvX0ludGVyZmFjZS5wcm90b3R5cGUuc2V0dXBfYWN0aW9ucyA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLmFkZEFjdGlvbigncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnLCB0aGlzLnByZXBhcmUsIDUwKTtcbiAgICBIb29rcy5hZGRBY3Rpb24oJ3Bob3J0LnBvcnRmb2xpby5jcmVhdGUnLCB0aGlzLmNyZWF0ZSwgNTApO1xuICAgIEhvb2tzLmFkZEFjdGlvbigncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCB0aGlzLnJlZnJlc2gsIDUwKTtcbiAgICBIb29rcy5hZGRBY3Rpb24oJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgdGhpcy5kZXN0cm95LCA1MCk7XG4gICAgcmV0dXJuIEhvb2tzLmFkZEFjdGlvbigncGhvcnQucG9ydGZvbGlvLmRlc3Ryb3knLCB0aGlzLnB1cmdlX2FjdGlvbnMsIDEwMCk7XG4gIH07XG5cbiAgUG9ydGZvbGlvX0ludGVyZmFjZS5wcm90b3R5cGUucHVyZ2VfYWN0aW9ucyA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLnJlbW92ZUFjdGlvbigncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnLCB0aGlzLnByZXBhcmUsIDUwKTtcbiAgICBIb29rcy5yZW1vdmVBY3Rpb24oJ3Bob3J0LnBvcnRmb2xpby5jcmVhdGUnLCB0aGlzLmNyZWF0ZSwgNTApO1xuICAgIEhvb2tzLnJlbW92ZUFjdGlvbigncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCB0aGlzLnJlZnJlc2gsIDUwKTtcbiAgICBIb29rcy5yZW1vdmVBY3Rpb24oJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgdGhpcy5kZXN0cm95LCA1MCk7XG4gICAgcmV0dXJuIEhvb2tzLnJlbW92ZUFjdGlvbigncGhvcnQucG9ydGZvbGlvLmRlc3Ryb3knLCB0aGlzLnB1cmdlX2FjdGlvbnMsIDEwMCk7XG4gIH07XG5cblxuICAvKlxuICAgICBcdFJlcXVpcmUgdGhlc2UgbWV0aG9kc1xuICAgKi9cblxuICBQb3J0Zm9saW9fSW50ZXJmYWNlLnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGBpbml0aWFsaXplYCBtZXRob2RcIik7XG4gIH07XG5cbiAgUG9ydGZvbGlvX0ludGVyZmFjZS5wcm90b3R5cGUucHJlcGFyZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgcHJlcGFyZWAgbWV0aG9kXCIpO1xuICB9O1xuXG4gIFBvcnRmb2xpb19JbnRlcmZhY2UucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgY3JlYXRlYCBtZXRob2RcIik7XG4gIH07XG5cbiAgUG9ydGZvbGlvX0ludGVyZmFjZS5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgcmVmcmVzaGAgbWV0aG9kXCIpO1xuICB9O1xuXG4gIFBvcnRmb2xpb19JbnRlcmZhY2UucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYGRlc3Ryb3lgIG1ldGhvZFwiKTtcbiAgfTtcblxuICByZXR1cm4gUG9ydGZvbGlvX0ludGVyZmFjZTtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW9fSW50ZXJmYWNlO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lVRzl5ZEdadmJHbHZYMGx1ZEdWeVptRmpaUzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklsQnZjblJtYjJ4cGIxOUpiblJsY21aaFkyVXVZMjltWm1WbElsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lKQlFVRkJMRWxCUVVFc01FSkJRVUU3UlVGQlFUczdRVUZCUVN4TFFVRkJMRWRCUVZFc1QwRkJRU3hEUVVGVExGVkJRVlE3T3p0QlFVZFNPenM3T3pzN1FVRkxUVHRGUVVWUkxEWkNRVUZGTEVsQlFVWTdPMGxCUTFvc1NVRkJReXhEUVVGQkxHRkJRVVFzUTBGQlFUdEpRVU5CTEVsQlFVTXNRMEZCUVN4VlFVRkVMRU5CUVdFc1NVRkJZanRGUVVaWk96dG5RMEZKWWl4aFFVRkJMRWRCUVdVc1UwRkJRVHRKUVVOa0xFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMSGxDUVVGb1FpeEZRVUV5UXl4SlFVRkRMRU5CUVVFc1QwRkJOVU1zUlVGQmNVUXNSVUZCY2tRN1NVRkRRU3hMUVVGTExFTkJRVU1zVTBGQlRpeERRVUZuUWl4M1FrRkJhRUlzUlVGQk1FTXNTVUZCUXl4RFFVRkJMRTFCUVRORExFVkJRVzFFTEVWQlFXNUVPMGxCUTBFc1MwRkJTeXhEUVVGRExGTkJRVTRzUTBGQlowSXNlVUpCUVdoQ0xFVkJRVEpETEVsQlFVTXNRMEZCUVN4UFFVRTFReXhGUVVGeFJDeEZRVUZ5UkR0SlFVTkJMRXRCUVVzc1EwRkJReXhUUVVGT0xFTkJRV2RDTEhsQ1FVRm9RaXhGUVVFeVF5eEpRVUZETEVOQlFVRXNUMEZCTlVNc1JVRkJjVVFzUlVGQmNrUTdWMEZEUVN4TFFVRkxMRU5CUVVNc1UwRkJUaXhEUVVGblFpeDVRa0ZCYUVJc1JVRkJNa01zU1VGQlF5eERRVUZCTEdGQlFUVkRMRVZCUVRKRUxFZEJRVE5FTzBWQlRHTTdPMmREUVU5bUxHRkJRVUVzUjBGQlpTeFRRVUZCTzBsQlEyUXNTMEZCU3l4RFFVRkRMRmxCUVU0c1EwRkJiVUlzZVVKQlFXNUNMRVZCUVRoRExFbEJRVU1zUTBGQlFTeFBRVUV2UXl4RlFVRjNSQ3hGUVVGNFJEdEpRVU5CTEV0QlFVc3NRMEZCUXl4WlFVRk9MRU5CUVcxQ0xIZENRVUZ1UWl4RlFVRTJReXhKUVVGRExFTkJRVUVzVFVGQk9VTXNSVUZCYzBRc1JVRkJkRVE3U1VGRFFTeExRVUZMTEVOQlFVTXNXVUZCVGl4RFFVRnRRaXg1UWtGQmJrSXNSVUZCT0VNc1NVRkJReXhEUVVGQkxFOUJRUzlETEVWQlFYZEVMRVZCUVhoRU8wbEJRMEVzUzBGQlN5eERRVUZETEZsQlFVNHNRMEZCYlVJc2VVSkJRVzVDTEVWQlFUaERMRWxCUVVNc1EwRkJRU3hQUVVFdlF5eEZRVUYzUkN4RlFVRjRSRHRYUVVOQkxFdEJRVXNzUTBGQlF5eFpRVUZPTEVOQlFXMUNMSGxDUVVGdVFpeEZRVUU0UXl4SlFVRkRMRU5CUVVFc1lVRkJMME1zUlVGQk9FUXNSMEZCT1VRN1JVRk1ZenM3TzBGQlVXWTdPenM3WjBOQlIwRXNWVUZCUVN4SFFVRlpMRk5CUVVFN1FVRkJSeXhWUVVGVkxFbEJRVUVzUzBGQlFTeERRVUZQTEhGR1FVRlFPMFZCUVdJN08yZERRVU5hTEU5QlFVRXNSMEZCV1N4VFFVRkJPMEZCUVVjc1ZVRkJWU3hKUVVGQkxFdEJRVUVzUTBGQlR5eHJSa0ZCVUR0RlFVRmlPenRuUTBGRFdpeE5RVUZCTEVkQlFWa3NVMEZCUVR0QlFVRkhMRlZCUVZVc1NVRkJRU3hMUVVGQkxFTkJRVThzYVVaQlFWQTdSVUZCWWpzN1owTkJRMW9zVDBGQlFTeEhRVUZaTEZOQlFVRTdRVUZCUnl4VlFVRlZMRWxCUVVFc1MwRkJRU3hEUVVGUExHdEdRVUZRTzBWQlFXSTdPMmREUVVOYUxFOUJRVUVzUjBGQldTeFRRVUZCTzBGQlFVY3NWVUZCVlN4SlFVRkJMRXRCUVVFc1EwRkJUeXhyUmtGQlVEdEZRVUZpT3pzN096czdRVUZKWWl4TlFVRk5MRU5CUVVNc1QwRkJVQ3hIUVVGcFFpSjlcbiIsIlxuLypcbiAgICBEZXBlbmRlbmNpZXNcbiAqL1xudmFyICQsIEhvb2tzLCBQb3J0Zm9saW9fSW50ZXJmYWNlLCBQb3J0Zm9saW9fTWFzb25yeSxcbiAgYmluZCA9IGZ1bmN0aW9uKGZuLCBtZSl7IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7IH07IH0sXG4gIGV4dGVuZCA9IGZ1bmN0aW9uKGNoaWxkLCBwYXJlbnQpIHsgZm9yICh2YXIga2V5IGluIHBhcmVudCkgeyBpZiAoaGFzUHJvcC5jYWxsKHBhcmVudCwga2V5KSkgY2hpbGRba2V5XSA9IHBhcmVudFtrZXldOyB9IGZ1bmN0aW9uIGN0b3IoKSB7IHRoaXMuY29uc3RydWN0b3IgPSBjaGlsZDsgfSBjdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7IGNoaWxkLnByb3RvdHlwZSA9IG5ldyBjdG9yKCk7IGNoaWxkLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7IHJldHVybiBjaGlsZDsgfSxcbiAgaGFzUHJvcCA9IHt9Lmhhc093blByb3BlcnR5O1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuUG9ydGZvbGlvX0ludGVyZmFjZSA9IHJlcXVpcmUoJy4vUG9ydGZvbGlvX0ludGVyZmFjZScpO1xuXG5Qb3J0Zm9saW9fTWFzb25yeSA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gIGV4dGVuZChQb3J0Zm9saW9fTWFzb25yeSwgc3VwZXJDbGFzcyk7XG5cbiAgZnVuY3Rpb24gUG9ydGZvbGlvX01hc29ucnkoKSB7XG4gICAgdGhpcy5yZWZyZXNoID0gYmluZCh0aGlzLnJlZnJlc2gsIHRoaXMpO1xuICAgIHRoaXMuZGVzdHJveSA9IGJpbmQodGhpcy5kZXN0cm95LCB0aGlzKTtcbiAgICB0aGlzLmNyZWF0ZSA9IGJpbmQodGhpcy5jcmVhdGUsIHRoaXMpO1xuICAgIHRoaXMucHJlcGFyZSA9IGJpbmQodGhpcy5wcmVwYXJlLCB0aGlzKTtcbiAgICByZXR1cm4gUG9ydGZvbGlvX01hc29ucnkuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUuRWxlbWVudHMgPSB7XG4gICAgY29udGFpbmVyOiAnUFBfTWFzb25yeScsXG4gICAgc2l6ZXI6ICdQUF9NYXNvbnJ5X19zaXplcicsXG4gICAgaXRlbTogJ1BQX01hc29ucnlfX2l0ZW0nXG4gIH07XG5cblxuICAvKlxuICBcdFx0SW5pdGlhbGl6ZVxuICAgKi9cblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLiRjb250YWluZXIgPSAkKFwiLlwiICsgdGhpcy5FbGVtZW50cy5jb250YWluZXIpO1xuICB9O1xuXG5cbiAgLypcbiAgXHRcdFByZXBhcmUgJiBBdHRhY2ggRXZlbnRzXG4gICAgIFx0RG9uJ3Qgc2hvdyBhbnl0aGluZyB5ZXQuXG4gIFxuICBcdFx0QGNhbGxlZCBvbiBob29rIGBwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZWBcbiAgICovXG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLnByZXBhcmUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbWFzb25yeV9zZXR0aW5ncztcbiAgICBpZiAodGhpcy4kY29udGFpbmVyLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLiRjb250YWluZXIuYWRkQ2xhc3MoJ1BQX0pTX19sb2FkaW5nX21hc29ucnknKTtcbiAgICB0aGlzLm1heWJlX2NyZWF0ZV9zaXplcigpO1xuICAgIG1hc29ucnlfc2V0dGluZ3MgPSBIb29rcy5hcHBseUZpbHRlcnMoJ3Bob3J0Lm1hc29ucnkuc2V0dGluZ3MnLCB7XG4gICAgICBpdGVtU2VsZWN0b3I6IFwiLlwiICsgdGhpcy5FbGVtZW50cy5pdGVtLFxuICAgICAgY29sdW1uV2lkdGg6IFwiLlwiICsgdGhpcy5FbGVtZW50cy5zaXplcixcbiAgICAgIGd1dHRlcjogMCxcbiAgICAgIGluaXRMYXlvdXQ6IGZhbHNlXG4gICAgfSk7XG4gICAgdGhpcy4kY29udGFpbmVyLm1hc29ucnkobWFzb25yeV9zZXR0aW5ncyk7XG4gICAgcmV0dXJuIHRoaXMuJGNvbnRhaW5lci5tYXNvbnJ5KCdvbmNlJywgJ2xheW91dENvbXBsZXRlJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIF90aGlzLiRjb250YWluZXIucmVtb3ZlQ2xhc3MoJ1BQX0pTX19sb2FkaW5nX21hc29ucnknKS5hZGRDbGFzcygnUFBfSlNfX2xvYWRpbmdfY29tcGxldGUnKTtcbiAgICAgICAgcmV0dXJuIEhvb2tzLmRvQWN0aW9uKCdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCcpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH07XG5cblxuICAvKlxuICBcdFx0U3RhcnQgdGhlIFBvcnRmb2xpb1xuICBcdFx0QGNhbGxlZCBvbiBob29rIGBwaG9ydC5wb3J0Zm9saW8uY3JlYXRlYFxuICAgKi9cblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kY29udGFpbmVyLm1hc29ucnkoKTtcbiAgfTtcblxuXG4gIC8qXG4gIFx0XHREZXN0cm95XG4gIFx0XHRAY2FsbGVkIG9uIGhvb2sgYHBob3J0LnBvcnRmb2xpby5kZXN0cm95YFxuICAgKi9cblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMubWF5YmVfcmVtb3ZlX3NpemVyKCk7XG4gICAgaWYgKHRoaXMuJGNvbnRhaW5lci5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLiRjb250YWluZXIubWFzb25yeSgnZGVzdHJveScpO1xuICAgIH1cbiAgfTtcblxuXG4gIC8qXG4gIFx0XHRSZWxvYWQgdGhlIGxheW91dFxuICBcdFx0QGNhbGxlZCBvbiBob29rIGBwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaGBcbiAgICovXG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy4kY29udGFpbmVyLm1hc29ucnkoJ2xheW91dCcpO1xuICB9O1xuXG5cbiAgLypcbiAgXHRcdENyZWF0ZSBhIHNpemVyIGVsZW1lbnQgZm9yIGpxdWVyeS1tYXNvbnJ5IHRvIHVzZVxuICAgKi9cblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUubWF5YmVfY3JlYXRlX3NpemVyID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuc2l6ZXJfZG9lc250X2V4aXN0KCkpIHtcbiAgICAgIHRoaXMuY3JlYXRlX3NpemVyKCk7XG4gICAgfVxuICB9O1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5tYXliZV9yZW1vdmVfc2l6ZXIgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy4kY29udGFpbmVyLmxlbmd0aCAhPT0gMSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLiRjb250YWluZXIuZmluZChcIi5cIiArIHRoaXMuRWxlbWVudHMuc2l6ZXIpLnJlbW92ZSgpO1xuICB9O1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5zaXplcl9kb2VzbnRfZXhpc3QgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy4kY29udGFpbmVyLmZpbmQoXCIuXCIgKyB0aGlzLkVsZW1lbnRzLnNpemVyKS5sZW5ndGggPT09IDA7XG4gIH07XG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLmNyZWF0ZV9zaXplciA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJGNvbnRhaW5lci5hcHBlbmQoXCI8ZGl2IGNsYXNzPVxcXCJcIiArIHRoaXMuRWxlbWVudHMuc2l6ZXIgKyBcIlxcXCI+PC9kaXY+XCIpO1xuICB9O1xuXG4gIHJldHVybiBQb3J0Zm9saW9fTWFzb25yeTtcblxufSkoUG9ydGZvbGlvX0ludGVyZmFjZSk7XG5cbndpbmRvdy5QUF9Nb2R1bGVzLlBvcnRmb2xpb19NYXNvbnJ5ID0gUG9ydGZvbGlvX01hc29ucnk7XG5cbm1vZHVsZS5leHBvcnRzID0gUG9ydGZvbGlvX01hc29ucnk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVVHOXlkR1p2YkdsdlgwMWhjMjl1Y25rdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUpRYjNKMFptOXNhVzlmVFdGemIyNXllUzVqYjJabVpXVWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqdEJRVUZCT3pzN1FVRkJRU3hKUVVGQkxHZEVRVUZCTzBWQlFVRTdPenM3UVVGSFFTeERRVUZCTEVkQlFVa3NUMEZCUVN4RFFVRlRMRkZCUVZRN08wRkJRMG9zUzBGQlFTeEhRVUZSTEU5QlFVRXNRMEZCVXl4VlFVRlVPenRCUVVOU0xHMUNRVUZCTEVkQlFYTkNMRTlCUVVFc1EwRkJVeXgxUWtGQlZEczdRVUZIYUVJN096czdPenM3T3pzN096aENRVVZNTEZGQlFVRXNSMEZEUXp0SlFVRkJMRk5CUVVFc1JVRkJWeXhaUVVGWU8wbEJRMEVzUzBGQlFTeEZRVUZYTEcxQ1FVUllPMGxCUlVFc1NVRkJRU3hGUVVGWExHdENRVVpZT3pzN08wRkJTVVE3T3pzN09FSkJSMEVzVlVGQlFTeEhRVUZaTEZOQlFVRTdWMEZEV0N4SlFVRkRMRU5CUVVFc1ZVRkJSQ3hIUVVGakxFTkJRVUVzUTBGQlJ5eEhRVUZCTEVkQlFVa3NTVUZCUXl4RFFVRkJMRkZCUVZFc1EwRkJReXhUUVVGcVFqdEZRVVJJT3pzN1FVRkhXanM3T3pzN096czRRa0ZOUVN4UFFVRkJMRWRCUVZNc1UwRkJRVHRCUVVOU0xGRkJRVUU3U1VGQlFTeEpRVUZWTEVsQlFVTXNRMEZCUVN4VlFVRlZMRU5CUVVNc1RVRkJXaXhMUVVGelFpeERRVUZvUXp0QlFVRkJMR0ZCUVVFN08wbEJSVUVzU1VGQlF5eERRVUZCTEZWQlFWVXNRMEZCUXl4UlFVRmFMRU5CUVhOQ0xIZENRVUYwUWp0SlFVVkJMRWxCUVVNc1EwRkJRU3hyUWtGQlJDeERRVUZCTzBsQlIwRXNaMEpCUVVFc1IwRkJiVUlzUzBGQlN5eERRVUZETEZsQlFVNHNRMEZCYlVJc2QwSkJRVzVDTEVWQlEyeENPMDFCUVVFc1dVRkJRU3hGUVVGakxFZEJRVUVzUjBGQlNTeEpRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRWxCUVRWQ08wMUJRMEVzVjBGQlFTeEZRVUZqTEVkQlFVRXNSMEZCU1N4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExFdEJSRFZDTzAxQlJVRXNUVUZCUVN4RlFVRmpMRU5CUm1RN1RVRkhRU3hWUVVGQkxFVkJRV01zUzBGSVpEdExRVVJyUWp0SlFVMXVRaXhKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEU5QlFWb3NRMEZCY1VJc1owSkJRWEpDTzFkQlJVRXNTVUZCUXl4RFFVRkJMRlZCUVZVc1EwRkJReXhQUVVGYUxFTkJRVzlDTEUxQlFYQkNMRVZCUVRSQ0xHZENRVUUxUWl4RlFVRTRReXhEUVVGQkxGTkJRVUVzUzBGQlFUdGhRVUZCTEZOQlFVRTdVVUZETjBNc1MwRkJReXhEUVVGQkxGVkJRMEVzUTBGQlF5eFhRVVJHTEVOQlEyVXNkMEpCUkdZc1EwRkZReXhEUVVGRExGRkJSa1lzUTBGRldTeDVRa0ZHV2p0bFFVMUJMRXRCUVVzc1EwRkJReXhSUVVGT0xFTkJRV1VzZVVKQlFXWTdUVUZRTmtNN1NVRkJRU3hEUVVGQkxFTkJRVUVzUTBGQlFTeEpRVUZCTEVOQlFUbERPMFZCYUVKUk96czdRVUV3UWxRN096czdPemhDUVVsQkxFMUJRVUVzUjBGQlVTeFRRVUZCTzBsQlExQXNTVUZCUXl4RFFVRkJMRlZCUVZVc1EwRkJReXhQUVVGYUxFTkJRVUU3UlVGRVR6czdPMEZCUzFJN096czdPemhDUVVsQkxFOUJRVUVzUjBGQlV5eFRRVUZCTzBsQlExSXNTVUZCUXl4RFFVRkJMR3RDUVVGRUxFTkJRVUU3U1VGRlFTeEpRVUZITEVsQlFVTXNRMEZCUVN4VlFVRlZMRU5CUVVNc1RVRkJXaXhIUVVGeFFpeERRVUY0UWp0TlFVTkRMRWxCUVVNc1EwRkJRU3hWUVVGVkxFTkJRVU1zVDBGQldpeERRVUZ4UWl4VFFVRnlRaXhGUVVSRU96dEZRVWhST3pzN1FVRlZWRHM3T3pzN09FSkJTVUVzVDBGQlFTeEhRVUZUTEZOQlFVRTdWMEZEVWl4SlFVRkRMRU5CUVVFc1ZVRkJWU3hEUVVGRExFOUJRVm9zUTBGQmNVSXNVVUZCY2tJN1JVRkVVVHM3TzBGQlMxUTdPenM3T0VKQlIwRXNhMEpCUVVFc1IwRkJiMElzVTBGQlFUdEpRVU51UWl4SlFVRnRRaXhKUVVGRExFTkJRVUVzYTBKQlFVUXNRMEZCUVN4RFFVRnVRanROUVVGQkxFbEJRVU1zUTBGQlFTeFpRVUZFTEVOQlFVRXNSVUZCUVRzN1JVRkViVUk3T3poQ1FVbHdRaXhyUWtGQlFTeEhRVUZ2UWl4VFFVRkJPMGxCUTI1Q0xFbEJRVlVzU1VGQlF5eERRVUZCTEZWQlFWVXNRMEZCUXl4TlFVRmFMRXRCUVhkQ0xFTkJRV3hETzBGQlFVRXNZVUZCUVRzN1NVRkRRU3hKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEVsQlFWb3NRMEZCYTBJc1IwRkJRU3hIUVVGSkxFbEJRVU1zUTBGQlFTeFJRVUZSTEVOQlFVTXNTMEZCYUVNc1EwRkJlVU1zUTBGQlF5eE5RVUV4UXl4RFFVRkJPMFZCUm0xQ096czRRa0ZMY0VJc2EwSkJRVUVzUjBGQmIwSXNVMEZCUVR0WFFVRkhMRWxCUVVNc1EwRkJRU3hWUVVGVkxFTkJRVU1zU1VGQldpeERRVUZyUWl4SFFVRkJMRWRCUVVrc1NVRkJReXhEUVVGQkxGRkJRVkVzUTBGQlF5eExRVUZvUXl4RFFVRjVReXhEUVVGRExFMUJRVEZETEV0QlFXOUVPMFZCUVhaRU96czRRa0ZIY0VJc1dVRkJRU3hIUVVGakxGTkJRVUU3U1VGRFlpeEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRTFCUVZvc1EwRkJiVUlzWlVGQlFTeEhRVUZwUWl4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExFdEJRVE5DTEVkQlFXbERMRmRCUVhCRU8wVkJSR0U3T3pzN1IwRTFSbWxDT3p0QlFXbEhhRU1zVFVGQlRTeERRVUZETEZWQlFWVXNRMEZCUXl4cFFrRkJiRUlzUjBGQmMwTTdPMEZCUTNSRExFMUJRVTBzUTBGQlF5eFBRVUZRTEVkQlFXbENJbjA9XG4iLCJcbi8qXG4gICAgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBIb29rcywgUG9ydGZvbGlvLCBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlciwgaXNfbWFzb25yeSwgbWF5YmVfbGF6eV9tYXNvbnJ5LCBzdGFydF9tYXNvbnJ5O1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5Qb3J0Zm9saW9fRXZlbnRfTWFuYWdlciA9IHJlcXVpcmUoJy4vUG9ydGZvbGlvX0V2ZW50X01hbmFnZXInKTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cblBvcnRmb2xpbyA9IG5ldyBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlcigpO1xuXG5pc19tYXNvbnJ5ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAkKCcuUFBfTWFzb25yeScpLmxlbmd0aCAhPT0gMDtcbn07XG5cbnN0YXJ0X21hc29ucnkgPSBmdW5jdGlvbigpIHtcbiAgdmFyIFBvcnRmb2xpb19NYXNvbnJ5O1xuICBpZiAoIWlzX21hc29ucnkoKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBQb3J0Zm9saW9fTWFzb25yeSA9IHJlcXVpcmUoJy4vUG9ydGZvbGlvX01hc29ucnknKTtcbiAgcmV0dXJuIG5ldyBQb3J0Zm9saW9fTWFzb25yeSgpO1xufTtcblxubWF5YmVfbGF6eV9tYXNvbnJ5ID0gZnVuY3Rpb24oaGFuZGxlcikge1xuICBpZiAoaXNfbWFzb25yeSgpKSB7XG4gICAgcmV0dXJuIHJlcXVpcmUoJ2xhenkvTGF6eV9NYXNvbnJ5Jyk7XG4gIH1cbiAgcmV0dXJuIGhhbmRsZXI7XG59O1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3Bob3J0LmNvcmUucmVhZHknLCBQb3J0Zm9saW8ucHJlcGFyZSwgNTApO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3Bob3J0LmNvcmUubG9hZGVkJywgUG9ydGZvbGlvLmNyZWF0ZSwgNTApO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3Bob3J0LmNvcmUucmVhZHknLCBzdGFydF9tYXNvbnJ5KTtcblxuSG9va3MuYWRkRmlsdGVyKCdwaG9ydC5sYXp5LmhhbmRsZXInLCBtYXliZV9sYXp5X21hc29ucnkpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2ljM1JoY25RdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUp6ZEdGeWRDNWpiMlptWldVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWp0QlFVRkJPenM3UVVGQlFTeEpRVUZCT3p0QlFVZEJMRXRCUVVFc1IwRkJVU3hQUVVGQkxFTkJRVk1zVlVGQlZEczdRVUZEVWl4MVFrRkJRU3hIUVVFd1FpeFBRVUZCTEVOQlFWTXNNa0pCUVZRN08wRkJRekZDTEVOQlFVRXNSMEZCU1N4UFFVRkJMRU5CUVZNc1VVRkJWRHM3UVVGSFNpeFRRVUZCTEVkQlFXZENMRWxCUVVFc2RVSkJRVUVzUTBGQlFUczdRVUZIYUVJc1ZVRkJRU3hIUVVGaExGTkJRVUU3UVVGRFdpeFRRVUZUTEVOQlFVRXNRMEZCUnl4aFFVRklMRU5CUVd0Q0xFTkJRVU1zVFVGQmJrSXNTMEZCSzBJN1FVRkVOVUk3TzBGQlNXSXNZVUZCUVN4SFFVRm5RaXhUUVVGQk8wRkJRMllzVFVGQlFUdEZRVUZCTEVsQlFXZENMRU5CUVVrc1ZVRkJRU3hEUVVGQkxFTkJRWEJDTzBGQlFVRXNWMEZCVHl4TlFVRlFPenRGUVVWQkxHbENRVUZCTEVkQlFXOUNMRTlCUVVFc1EwRkJVeXh4UWtGQlZEdFRRVU5vUWl4SlFVRkJMR2xDUVVGQkxFTkJRVUU3UVVGS1Z6czdRVUZOYUVJc2EwSkJRVUVzUjBGQmNVSXNVMEZCUlN4UFFVRkdPMFZCUlhCQ0xFbEJRWGxETEZWQlFVRXNRMEZCUVN4RFFVRjZRenRCUVVGQkxGZEJRVThzVDBGQlFTeERRVUZUTEcxQ1FVRlVMRVZCUVZBN08wRkJRMEVzVTBGQlR6dEJRVWhoT3p0QlFVOXlRaXhMUVVGTExFTkJRVU1zVTBGQlRpeERRVUZuUWl4clFrRkJhRUlzUlVGQmIwTXNVMEZCVXl4RFFVRkRMRTlCUVRsRExFVkJRWFZFTEVWQlFYWkVPenRCUVVOQkxFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMRzFDUVVGb1FpeEZRVUZ4UXl4VFFVRlRMRU5CUVVNc1RVRkJMME1zUlVGQmRVUXNSVUZCZGtRN08wRkJSMEVzUzBGQlN5eERRVUZETEZOQlFVNHNRMEZCWjBJc2EwSkJRV2hDTEVWQlFXOURMR0ZCUVhCRE96dEJRVWRCTEV0QlFVc3NRMEZCUXl4VFFVRk9MRU5CUVdkQ0xHOUNRVUZvUWl4RlFVRnpReXhyUWtGQmRFTWlmUT09XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
