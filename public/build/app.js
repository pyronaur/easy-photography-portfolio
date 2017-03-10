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
	Includes
 */

require('./portfolio/start');

require('./gallery/popup');

require('./lazy/start');


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
var $, Hooks, Item_Data, get_item_data, get_items;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Item_Data = require('../lazy/Item_Data');

get_items = function($el) {
  var $container, $items;
  $container = $el.closest('.PP_Gallery');
  return $items = $container.find('.PP_Gallery__item');
};

get_item_data = function() {
  var full, item_data;
  item_data = new Item_Data($(this));
  if (item_data.get_type() === 'video') {
    full = item_data.get_or_false('video_url');
  } else {
    full = item_data.get_url('full');
  }
  return {
    src: full,
    thumb: item_data.get_url('thumb')
  };
};


/*
    @TODO: Need detach/destroy methods
 */

Hooks.addAction('phort.core.ready', function() {
  if ($('.PP_Popup--lightgallery').length === 0) {
    return false;
  }
  return $(document).on('click', '.PP_Popup--lightgallery .PP_Gallery__item', function(e) {
    var $el, $items, data;
    e.preventDefault();
    $el = $(this);
    $items = get_items($el);
    data = $items.map(get_item_data);
    return $el.lightGallery({
      dynamic: true,
      dynamicEl: data,
      index: $items.index($el),
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
    if ('disable' === window.__phort.popup_gallery) {
      return "<div class=\"" + this.Elements.link + "\" rel=\"gallery\">\n	<img class=\"" + this.Elements.image + "\" src=\"" + thumb + "\" class=\"PP_JS__loading\" />\n</div>";
    } else {
      return "<a class=\"" + this.Elements.link + "\" href=\"" + full + "\" rel=\"gallery\">\n	<img class=\"" + this.Elements.image + "\" src=\"" + thumb + "\" class=\"PP_JS__loading\" />\n</a>";
    }
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
    this.Elements = {
      container: 'PP_Masonry',
      sizer: 'PP_Masonry__sizer',
      item: 'PP_Masonry__item'
    };
    Portfolio_Masonry.__super__.constructor.call(this);
  }


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


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jb3JlL1Bob3RvZ3JhcGh5X1BvcnRmb2xpby5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY29yZS9XaW5kb3cuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvcG9wdXAuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvQWJzdHJhY3RfTGF6eV9Mb2FkZXIuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvSXRlbV9EYXRhLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0xhenlfTWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvbGF6eS9zdGFydC5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL1BvcnRmb2xpb19FdmVudF9NYW5hZ2VyLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9wb3J0Zm9saW8vUG9ydGZvbGlvX0ludGVyZmFjZS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL1BvcnRmb2xpb19NYXNvbnJ5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9wb3J0Zm9saW8vc3RhcnQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM3SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN4SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxuLypcbiAgICBMb2FkIERlcGVuZGVuY2llc1xuICovXG52YXIgJCwgSG9va3M7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG53aW5kb3cuUFBfTW9kdWxlcyA9IHtcbiAgUG9ydGZvbGlvX0ludGVyZmFjZTogcmVxdWlyZSgnLi9wb3J0Zm9saW8vUG9ydGZvbGlvX0ludGVyZmFjZScpLFxuICBJdGVtX0RhdGE6IHJlcXVpcmUoJy4vbGF6eS9JdGVtX0RhdGEnKSxcbiAgQWJzdHJhY3RfTGF6eV9Mb2FkZXI6IHJlcXVpcmUoJy4vbGF6eS9BYnN0cmFjdF9MYXp5X0xvYWRlcicpXG59O1xuXG5cbi8qXG5cdEluY2x1ZGVzXG4gKi9cblxucmVxdWlyZSgnLi9wb3J0Zm9saW8vc3RhcnQnKTtcblxucmVxdWlyZSgnLi9nYWxsZXJ5L3BvcHVwJyk7XG5cbnJlcXVpcmUoJy4vbGF6eS9zdGFydCcpO1xuXG5cbi8qXG5cdEJvb3Qgb24gYGRvY3VtZW50LnJlYWR5YFxuICovXG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICB2YXIgUGhvdG9ncmFwaHlfUG9ydGZvbGlvO1xuICBpZiAoISQoJ2JvZHknKS5oYXNDbGFzcygnUFBfUG9ydGZvbGlvJykpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgUGhvdG9ncmFwaHlfUG9ydGZvbGlvID0gbmV3IChyZXF1aXJlKCcuL2NvcmUvUGhvdG9ncmFwaHlfUG9ydGZvbGlvJykpKCk7XG4gIFBob3RvZ3JhcGh5X1BvcnRmb2xpby5yZWFkeSgpO1xufSk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVlYQndMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaVlYQndMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaU8wRkJRVUU3T3p0QlFVRkJMRWxCUVVFN08wRkJSMEVzUzBGQlFTeEhRVUZSTEU5QlFVRXNRMEZCVXl4VlFVRlVPenRCUVVOU0xFTkJRVUVzUjBGQlNTeFBRVUZCTEVOQlFWTXNVVUZCVkRzN1FVRkpTaXhOUVVGTkxFTkJRVU1zVlVGQlVDeEhRVVZETzBWQlFVRXNiVUpCUVVFc1JVRkJjVUlzVDBGQlFTeERRVUZUTEdsRFFVRlVMRU5CUVhKQ08wVkJSMEVzVTBGQlFTeEZRVUZYTEU5QlFVRXNRMEZCVXl4clFrRkJWQ3hEUVVoWU8wVkJUVUVzYjBKQlFVRXNSVUZCYzBJc1QwRkJRU3hEUVVGVExEWkNRVUZVTEVOQlRuUkNPenM3TzBGQlVVUTdPenM3UVVGTFFTeFBRVUZCTEVOQlFWRXNiVUpCUVZJN08wRkJSMEVzVDBGQlFTeERRVUZSTEdsQ1FVRlNPenRCUVVkQkxFOUJRVUVzUTBGQlVTeGpRVUZTT3pzN1FVRkxRVHM3T3p0QlFVZEJMRU5CUVVFc1EwRkJSeXhSUVVGSUxFTkJRV0VzUTBGQlF5eExRVUZrTEVOQlFXOUNMRk5CUVVFN1FVRkhia0lzVFVGQlFUdEZRVUZCTEVsQlFWVXNRMEZCU1N4RFFVRkJMRU5CUVVjc1RVRkJTQ3hEUVVGWExFTkJRVU1zVVVGQldpeERRVUZ6UWl4alFVRjBRaXhEUVVGa08wRkJRVUVzVjBGQlFUczdSVUZIUVN4eFFrRkJRU3hIUVVFMFFpeEpRVUZCTEVOQlFVVXNUMEZCUVN4RFFVRlRMRGhDUVVGVUxFTkJRVVlzUTBGQlFTeERRVUZCTzBWQlF6VkNMSEZDUVVGeFFpeERRVUZETEV0QlFYUkNMRU5CUVVFN1FVRlFiVUlzUTBGQmNFSWlmUT09XG4iLCJcbi8qXG4gICAgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBDb3JlLCBIb29rcyxcbiAgYmluZCA9IGZ1bmN0aW9uKGZuLCBtZSl7IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7IH07IH07XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5Db3JlID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBDb3JlKCkge1xuICAgIHRoaXMud2FpdF9mb3JfbG9hZCA9IGJpbmQodGhpcy53YWl0X2Zvcl9sb2FkLCB0aGlzKTtcbiAgICB0aGlzLnJlYWR5ID0gYmluZCh0aGlzLnJlYWR5LCB0aGlzKTtcbiAgICBIb29rcy5hZGRBY3Rpb24oJ3Bob3J0LmNvcmUucmVhZHknLCB0aGlzLndhaXRfZm9yX2xvYWQpO1xuICB9XG5cbiAgQ29yZS5wcm90b3R5cGUucmVhZHkgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoSG9va3MuYXBwbHlGaWx0ZXJzKCdwaG9ydC5jb3JlLnJlYWR5JywgdHJ1ZSkpIHtcbiAgICAgIEhvb2tzLmRvQWN0aW9uKCdwaG9ydC5jb3JlLnJlYWR5Jyk7XG4gICAgfVxuICB9O1xuXG4gIENvcmUucHJvdG90eXBlLndhaXRfZm9yX2xvYWQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJCgnLlBQX1dyYXBwZXInKS5pbWFnZXNMb2FkZWQodGhpcy5sb2FkZWQpO1xuICB9O1xuXG4gIENvcmUucHJvdG90eXBlLmxvYWRlZCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChIb29rcy5hcHBseUZpbHRlcnMoJ3Bob3J0LmNvcmUubG9hZGVkJywgdHJ1ZSkpIHtcbiAgICAgIEhvb2tzLmRvQWN0aW9uKCdwaG9ydC5jb3JlLmxvYWRlZCcpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gQ29yZTtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb3JlO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lVR2h2ZEc5bmNtRndhSGxmVUc5eWRHWnZiR2x2TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lVR2h2ZEc5bmNtRndhSGxmVUc5eWRHWnZiR2x2TG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lPMEZCUVVFN096dEJRVUZCTEVsQlFVRXNZMEZCUVR0RlFVRkJPenRCUVVkQkxFTkJRVUVzUjBGQlNTeFBRVUZCTEVOQlFWTXNVVUZCVkRzN1FVRkRTaXhMUVVGQkxFZEJRVkVzVDBGQlFTeERRVUZUTEZWQlFWUTdPMEZCUjBZN1JVRkZVU3hqUVVGQk96czdTVUZEV2l4TFFVRkxMRU5CUVVNc1UwRkJUaXhEUVVGblFpeHJRa0ZCYUVJc1JVRkJiME1zU1VGQlF5eERRVUZCTEdGQlFYSkRPMFZCUkZrN08ybENRVWxpTEV0QlFVRXNSMEZCVHl4VFFVRkJPMGxCUTA0c1NVRkJSeXhMUVVGTExFTkJRVU1zV1VGQlRpeERRVUZ2UWl4clFrRkJjRUlzUlVGQmQwTXNTVUZCZUVNc1EwRkJTRHROUVVORExFdEJRVXNzUTBGQlF5eFJRVUZPTEVOQlFXVXNhMEpCUVdZc1JVRkVSRHM3UlVGRVRUczdhVUpCUzFBc1lVRkJRU3hIUVVGbExGTkJRVUU3VjBGRlpDeERRVUZCTEVOQlFVY3NZVUZCU0N4RFFVRnJRaXhEUVVGRExGbEJRVzVDTEVOQlFXbERMRWxCUVVNc1EwRkJRU3hOUVVGc1F6dEZRVVpqT3p0cFFrRkxaaXhOUVVGQkxFZEJRVkVzVTBGQlFUdEpRVU5RTEVsQlFVY3NTMEZCU3l4RFFVRkRMRmxCUVU0c1EwRkJiMElzYlVKQlFYQkNMRVZCUVhsRExFbEJRWHBETEVOQlFVZzdUVUZEUXl4TFFVRkxMRU5CUVVNc1VVRkJUaXhEUVVGbExHMUNRVUZtTEVWQlJFUTdPMFZCUkU4N096czdPenRCUVU5VUxFMUJRVTBzUTBGQlF5eFBRVUZRTEVkQlFXbENJbjA9XG4iLCJ2YXIgSG9va3MsIGdldF9zaXplO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5nZXRfc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHdpZHRoOiB3aW5kb3cuaW5uZXJXaWR0aCB8fCAkd2luZG93LndpZHRoKCksXG4gICAgaGVpZ2h0OiB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgJHdpbmRvdy5oZWlnaHQoKVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBnZXRfc2l6ZSgpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lWMmx1Wkc5M0xtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpVjJsdVpHOTNMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRU3hKUVVGQk96dEJRVUZCTEV0QlFVRXNSMEZCVVN4UFFVRkJMRU5CUVZNc1ZVRkJWRHM3UVVGSFVpeFJRVUZCTEVkQlFWY3NVMEZCUVR0VFFVTldPMGxCUVVFc1MwRkJRU3hGUVVGUkxFMUJRVTBzUTBGQlF5eFZRVUZRTEVsQlFYRkNMRTlCUVU4c1EwRkJReXhMUVVGU0xFTkJRVUVzUTBGQk4wSTdTVUZEUVN4TlFVRkJMRVZCUVZFc1RVRkJUU3hEUVVGRExGZEJRVkFzU1VGQmMwSXNUMEZCVHl4RFFVRkRMRTFCUVZJc1EwRkJRU3hEUVVRNVFqczdRVUZFVlRzN1FVRkxXQ3hOUVVGTkxFTkJRVU1zVDBGQlVDeEhRVUZwUWl4UlFVRkJMRU5CUVVFaWZRPT1cbiIsIlxuLypcbiAgICBEZXBlbmRlbmNpZXNcbiAqL1xudmFyICQsIEhvb2tzLCBJdGVtX0RhdGEsIGdldF9pdGVtX2RhdGEsIGdldF9pdGVtcztcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbkl0ZW1fRGF0YSA9IHJlcXVpcmUoJy4uL2xhenkvSXRlbV9EYXRhJyk7XG5cbmdldF9pdGVtcyA9IGZ1bmN0aW9uKCRlbCkge1xuICB2YXIgJGNvbnRhaW5lciwgJGl0ZW1zO1xuICAkY29udGFpbmVyID0gJGVsLmNsb3Nlc3QoJy5QUF9HYWxsZXJ5Jyk7XG4gIHJldHVybiAkaXRlbXMgPSAkY29udGFpbmVyLmZpbmQoJy5QUF9HYWxsZXJ5X19pdGVtJyk7XG59O1xuXG5nZXRfaXRlbV9kYXRhID0gZnVuY3Rpb24oKSB7XG4gIHZhciBmdWxsLCBpdGVtX2RhdGE7XG4gIGl0ZW1fZGF0YSA9IG5ldyBJdGVtX0RhdGEoJCh0aGlzKSk7XG4gIGlmIChpdGVtX2RhdGEuZ2V0X3R5cGUoKSA9PT0gJ3ZpZGVvJykge1xuICAgIGZ1bGwgPSBpdGVtX2RhdGEuZ2V0X29yX2ZhbHNlKCd2aWRlb191cmwnKTtcbiAgfSBlbHNlIHtcbiAgICBmdWxsID0gaXRlbV9kYXRhLmdldF91cmwoJ2Z1bGwnKTtcbiAgfVxuICByZXR1cm4ge1xuICAgIHNyYzogZnVsbCxcbiAgICB0aHVtYjogaXRlbV9kYXRhLmdldF91cmwoJ3RodW1iJylcbiAgfTtcbn07XG5cblxuLypcbiAgICBAVE9ETzogTmVlZCBkZXRhY2gvZGVzdHJveSBtZXRob2RzXG4gKi9cblxuSG9va3MuYWRkQWN0aW9uKCdwaG9ydC5jb3JlLnJlYWR5JywgZnVuY3Rpb24oKSB7XG4gIGlmICgkKCcuUFBfUG9wdXAtLWxpZ2h0Z2FsbGVyeScpLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5QUF9Qb3B1cC0tbGlnaHRnYWxsZXJ5IC5QUF9HYWxsZXJ5X19pdGVtJywgZnVuY3Rpb24oZSkge1xuICAgIHZhciAkZWwsICRpdGVtcywgZGF0YTtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJGVsID0gJCh0aGlzKTtcbiAgICAkaXRlbXMgPSBnZXRfaXRlbXMoJGVsKTtcbiAgICBkYXRhID0gJGl0ZW1zLm1hcChnZXRfaXRlbV9kYXRhKTtcbiAgICByZXR1cm4gJGVsLmxpZ2h0R2FsbGVyeSh7XG4gICAgICBkeW5hbWljOiB0cnVlLFxuICAgICAgZHluYW1pY0VsOiBkYXRhLFxuICAgICAgaW5kZXg6ICRpdGVtcy5pbmRleCgkZWwpLFxuICAgICAgc3BlZWQ6IDM1MCxcbiAgICAgIHByZWxvYWQ6IDMsXG4gICAgICBkb3dubG9hZDogZmFsc2UsXG4gICAgICB2aWRlb01heFdpZHRoOiAkKHdpbmRvdykud2lkdGgoKSAqIDAuOFxuICAgIH0pO1xuICB9KTtcbn0pO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2ljRzl3ZFhBdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUp3YjNCMWNDNWpiMlptWldVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWp0QlFVRkJPenM3UVVGQlFTeEpRVUZCT3p0QlFVZEJMRU5CUVVFc1IwRkJTU3hQUVVGQkxFTkJRVk1zVVVGQlZEczdRVUZEU2l4TFFVRkJMRWRCUVZFc1QwRkJRU3hEUVVGVExGVkJRVlE3TzBGQlExSXNVMEZCUVN4SFFVRlpMRTlCUVVFc1EwRkJVeXh0UWtGQlZEczdRVUZIV2l4VFFVRkJMRWRCUVZrc1UwRkJSU3hIUVVGR08wRkJRMWdzVFVGQlFUdEZRVUZCTEZWQlFVRXNSMEZCWVN4SFFVRkhMRU5CUVVNc1QwRkJTaXhEUVVGaExHRkJRV0k3VTBGRFlpeE5RVUZCTEVkQlFWTXNWVUZCVlN4RFFVRkRMRWxCUVZnc1EwRkJhVUlzYlVKQlFXcENPMEZCUmtVN08wRkJTVm9zWVVGQlFTeEhRVUZuUWl4VFFVRkJPMEZCUldZc1RVRkJRVHRGUVVGQkxGTkJRVUVzUjBGQlowSXNTVUZCUVN4VFFVRkJMRU5CUVZjc1EwRkJRU3hEUVVGSExFbEJRVWdzUTBGQldEdEZRVVZvUWl4SlFVRkhMRk5CUVZNc1EwRkJReXhSUVVGV0xFTkJRVUVzUTBGQlFTeExRVUY1UWl4UFFVRTFRanRKUVVORExFbEJRVUVzUjBGQlR5eFRRVUZUTEVOQlFVTXNXVUZCVml4RFFVRjNRaXhYUVVGNFFpeEZRVVJTTzBkQlFVRXNUVUZCUVR0SlFVZERMRWxCUVVFc1IwRkJUeXhUUVVGVExFTkJRVU1zVDBGQlZpeERRVUZ0UWl4TlFVRnVRaXhGUVVoU096dEJRVXRCTEZOQlFVODdTVUZEVGl4SFFVRkJMRVZCUVU4c1NVRkVSRHRKUVVWT0xFdEJRVUVzUlVGQlR5eFRRVUZUTEVOQlFVTXNUMEZCVml4RFFVRnRRaXhQUVVGdVFpeERRVVpFT3p0QlFWUlJPenM3UVVGbGFFSTdPenM3UVVGSFFTeExRVUZMTEVOQlFVTXNVMEZCVGl4RFFVRm5RaXhyUWtGQmFFSXNSVUZCYjBNc1UwRkJRVHRGUVVkdVF5eEpRVUZITEVOQlFVRXNRMEZCUnl4NVFrRkJTQ3hEUVVFNFFpeERRVUZETEUxQlFTOUNMRXRCUVhsRExFTkJRVFZETzBGQlEwTXNWMEZCVHl4TlFVUlNPenRUUVVkQkxFTkJRVUVzUTBGQlJ5eFJRVUZJTEVOQlFXRXNRMEZCUXl4RlFVRmtMRU5CUVdsQ0xFOUJRV3BDTEVWQlFUQkNMREpEUVVFeFFpeEZRVUYxUlN4VFFVRkZMRU5CUVVZN1FVRkRkRVVzVVVGQlFUdEpRVUZCTEVOQlFVTXNRMEZCUXl4alFVRkdMRU5CUVVFN1NVRkRRU3hIUVVGQkxFZEJRVTBzUTBGQlFTeERRVUZITEVsQlFVZzdTVUZGVGl4TlFVRkJMRWRCUVZNc1UwRkJRU3hEUVVGWExFZEJRVmc3U1VGRFZDeEpRVUZCTEVkQlFVOHNUVUZCVFN4RFFVRkRMRWRCUVZBc1EwRkJXU3hoUVVGYU8xZEJSMUFzUjBGQlJ5eERRVUZETEZsQlFVb3NRMEZEUXp0TlFVRkJMRTlCUVVFc1JVRkJaU3hKUVVGbU8wMUJRMEVzVTBGQlFTeEZRVUZsTEVsQlJHWTdUVUZGUVN4TFFVRkJMRVZCUVdVc1RVRkJUU3hEUVVGRExFdEJRVkFzUTBGQll5eEhRVUZrTEVOQlJtWTdUVUZIUVN4TFFVRkJMRVZCUVdVc1IwRklaanROUVVsQkxFOUJRVUVzUlVGQlpTeERRVXBtTzAxQlMwRXNVVUZCUVN4RlFVRmxMRXRCVEdZN1RVRk5RU3hoUVVGQkxFVkJRV1VzUTBGQlFTeERRVUZITEUxQlFVZ3NRMEZCVnl4RFFVRkRMRXRCUVZvc1EwRkJRU3hEUVVGQkxFZEJRWFZDTEVkQlRuUkRPMHRCUkVRN1JVRlNjMFVzUTBGQmRrVTdRVUZPYlVNc1EwRkJjRU1pZlE9PVxuIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgJCwgQWJzdHJhY3RfTGF6eV9Mb2FkZXIsIEhvb2tzLCBJdGVtX0RhdGEsIF9fV0lORE9XLFxuICBiaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbkl0ZW1fRGF0YSA9IHJlcXVpcmUoJy4vSXRlbV9EYXRhJyk7XG5cbl9fV0lORE9XID0gcmVxdWlyZSgnLi4vY29yZS9XaW5kb3cnKTtcblxuQWJzdHJhY3RfTGF6eV9Mb2FkZXIgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIEFic3RyYWN0X0xhenlfTG9hZGVyKCkge1xuICAgIHRoaXMuYXV0b2xvYWQgPSBiaW5kKHRoaXMuYXV0b2xvYWQsIHRoaXMpO1xuICAgIHRoaXMuYWRkX2l0ZW0gPSBiaW5kKHRoaXMuYWRkX2l0ZW0sIHRoaXMpO1xuICAgIHRoaXMuc2V0dXBfaXRlbXMgPSBiaW5kKHRoaXMuc2V0dXBfaXRlbXMsIHRoaXMpO1xuICAgIHRoaXMuRWxlbWVudHMgPSB7XG4gICAgICBpdGVtOiAnUFBfTGF6eV9JbWFnZScsXG4gICAgICBwbGFjZWhvbGRlcjogJ1BQX0xhenlfSW1hZ2VfX3BsYWNlaG9sZGVyJyxcbiAgICAgIGxpbms6ICdQUF9KU19MYXp5X19saW5rJyxcbiAgICAgIGltYWdlOiAnUFBfSlNfTGF6eV9faW1hZ2UnXG4gICAgfTtcbiAgICB0aGlzLkl0ZW1zID0gW107XG4gICAgdGhpcy5TZW5zaXRpdml0eSA9IDEwMDtcbiAgICB0aGlzLnRocm90dGxlZF9hdXRvbG9hZCA9IG51bGw7XG4gICAgdGhpcy5zZXR1cF9pdGVtcygpO1xuICAgIHRoaXMucmVzaXplX2FsbCgpO1xuICAgIHRoaXMuYXR0YWNoX2V2ZW50cygpO1xuICB9XG5cblxuICAvKlxuICBcdFx0QWJzdHJhY3QgTWV0aG9kc1xuICAgKi9cblxuICBBYnN0cmFjdF9MYXp5X0xvYWRlci5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24oKSB7fTtcblxuICBBYnN0cmFjdF9MYXp5X0xvYWRlci5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICB0aGlzLmxvYWRfaW1hZ2UoaXRlbSk7XG4gICAgcmV0dXJuIGl0ZW0uJGVsLmltYWdlc0xvYWRlZCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzLmNsZWFudXBfYWZ0ZXJfbG9hZChpdGVtKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9O1xuXG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5sb2FkX2ltYWdlID0gZnVuY3Rpb24oaXRlbSkge1xuICAgIHZhciBmdWxsLCB0aHVtYjtcbiAgICB0aHVtYiA9IGl0ZW0uZGF0YS5nZXRfdXJsKCd0aHVtYicpO1xuICAgIGZ1bGwgPSBpdGVtLmRhdGEuZ2V0X3VybCgnZnVsbCcpO1xuICAgIGl0ZW0uJGVsLnByZXBlbmQodGhpcy5nZXRfaXRlbV9odG1sKHRodW1iLCBmdWxsKSkucmVtb3ZlQ2xhc3MoJ0xhenktSW1hZ2UnKTtcbiAgICByZXR1cm4gaXRlbS5sb2FkZWQgPSB0cnVlO1xuICB9O1xuXG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5jbGVhbnVwX2FmdGVyX2xvYWQgPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgaXRlbS4kZWwuZmluZCgnaW1nJykuYWRkQ2xhc3MoJ1BQX0pTX19sb2FkZWQnKS5yZW1vdmVDbGFzcygnUFBfSlNfX2xvYWRpbmcnKTtcbiAgICByZXR1cm4gaXRlbS4kZWwucmVtb3ZlQ2xhc3ModGhpcy5FbGVtZW50cy5pdGVtKS5maW5kKFwiLlwiICsgdGhpcy5FbGVtZW50cy5wbGFjZWhvbGRlcikuZmFkZU91dCg0MDAsIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICQodGhpcykucmVtb3ZlKCk7XG4gICAgfSk7XG4gIH07XG5cbiAgQWJzdHJhY3RfTGF6eV9Mb2FkZXIucHJvdG90eXBlLmdldF9pdGVtX2h0bWwgPSBmdW5jdGlvbih0aHVtYiwgZnVsbCkge1xuICAgIGlmICgnZGlzYWJsZScgPT09IHdpbmRvdy5fX3Bob3J0LnBvcHVwX2dhbGxlcnkpIHtcbiAgICAgIHJldHVybiBcIjxkaXYgY2xhc3M9XFxcIlwiICsgdGhpcy5FbGVtZW50cy5saW5rICsgXCJcXFwiIHJlbD1cXFwiZ2FsbGVyeVxcXCI+XFxuXHQ8aW1nIGNsYXNzPVxcXCJcIiArIHRoaXMuRWxlbWVudHMuaW1hZ2UgKyBcIlxcXCIgc3JjPVxcXCJcIiArIHRodW1iICsgXCJcXFwiIGNsYXNzPVxcXCJQUF9KU19fbG9hZGluZ1xcXCIgLz5cXG48L2Rpdj5cIjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFwiPGEgY2xhc3M9XFxcIlwiICsgdGhpcy5FbGVtZW50cy5saW5rICsgXCJcXFwiIGhyZWY9XFxcIlwiICsgZnVsbCArIFwiXFxcIiByZWw9XFxcImdhbGxlcnlcXFwiPlxcblx0PGltZyBjbGFzcz1cXFwiXCIgKyB0aGlzLkVsZW1lbnRzLmltYWdlICsgXCJcXFwiIHNyYz1cXFwiXCIgKyB0aHVtYiArIFwiXFxcIiBjbGFzcz1cXFwiUFBfSlNfX2xvYWRpbmdcXFwiIC8+XFxuPC9hPlwiO1xuICAgIH1cbiAgfTtcblxuICBBYnN0cmFjdF9MYXp5X0xvYWRlci5wcm90b3R5cGUuc2V0dXBfaXRlbXMgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLkl0ZW1zID0gW107XG4gICAgJChcIi5cIiArIHRoaXMuRWxlbWVudHMuaXRlbSkuZWFjaCh0aGlzLmFkZF9pdGVtKTtcbiAgfTtcblxuICBBYnN0cmFjdF9MYXp5X0xvYWRlci5wcm90b3R5cGUuYWRkX2l0ZW0gPSBmdW5jdGlvbihrZXksIGVsKSB7XG4gICAgdmFyICRlbDtcbiAgICAkZWwgPSAkKGVsKTtcbiAgICB0aGlzLkl0ZW1zLnB1c2goe1xuICAgICAgZWw6IGVsLFxuICAgICAgJGVsOiAkZWwsXG4gICAgICBkYXRhOiBuZXcgSXRlbV9EYXRhKCRlbCksXG4gICAgICBsb2FkZWQ6IGZhbHNlXG4gICAgfSk7XG4gIH07XG5cblxuICAvKlxuICBcdFx0TWV0aG9kc1xuICAgKi9cblxuICBBYnN0cmFjdF9MYXp5X0xvYWRlci5wcm90b3R5cGUucmVzaXplX2FsbCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpLCBpdGVtLCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICByZWYgPSB0aGlzLkl0ZW1zO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGl0ZW0gPSByZWZbaV07XG4gICAgICByZXN1bHRzLnB1c2godGhpcy5yZXNpemUoaXRlbSkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICBBYnN0cmFjdF9MYXp5X0xvYWRlci5wcm90b3R5cGUuYXV0b2xvYWQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaSwgaXRlbSwga2V5LCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICByZWYgPSB0aGlzLkl0ZW1zO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGtleSA9IGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBrZXkgPSArK2kpIHtcbiAgICAgIGl0ZW0gPSByZWZba2V5XTtcbiAgICAgIGlmICghaXRlbS5sb2FkZWQgJiYgdGhpcy5pbl9sb29zZV92aWV3KGl0ZW0uZWwpKSB7XG4gICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLmxvYWQoaXRlbSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHZvaWQgMCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5pbl9sb29zZV92aWV3ID0gZnVuY3Rpb24oZWwpIHtcbiAgICB2YXIgcmVjdDtcbiAgICBpZiAoZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0ID09IG51bGwpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgaWYgKHJlY3QuaGVpZ2h0ID09PSAwICYmIHJlY3Qud2lkdGggPT09IDApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHJlY3QudG9wICsgcmVjdC5oZWlnaHQgPj0gLXRoaXMuU2Vuc2l0aXZpdHkgJiYgcmVjdC5ib3R0b20gLSByZWN0LmhlaWdodCA8PSBfX1dJTkRPVy5oZWlnaHQgKyB0aGlzLlNlbnNpdGl2aXR5ICYmIHJlY3QubGVmdCArIHJlY3Qud2lkdGggPj0gLXRoaXMuU2Vuc2l0aXZpdHkgJiYgcmVjdC5yaWdodCAtIHJlY3Qud2lkdGggPD0gX19XSU5ET1cud2lkdGggKyB0aGlzLlNlbnNpdGl2aXR5O1xuICB9O1xuXG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5yZW1vdmVfcGxhY2Vob2xkZXIgPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0uJGVsLmZpbmQoXCIuXCIgKyB0aGlzLkVsZW1lbnRzLnBsYWNlaG9sZGVyICsgXCIsIG5vc2NyaXB0XCIpLnJlbW92ZSgpO1xuICB9O1xuXG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZGV0YWNoX2V2ZW50cygpO1xuICB9O1xuXG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5hdHRhY2hfZXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy50aHJvdHRsZWRfYXV0b2xvYWQgPSBfLnRocm90dGxlKHRoaXMuYXV0b2xvYWQsIDUwKTtcbiAgICByZXR1cm4gSG9va3MuYWRkQWN0aW9uKCdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCcsIHRoaXMudGhyb3R0bGVkX2F1dG9sb2FkLCAxMDApO1xuICB9O1xuXG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5kZXRhY2hfZXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy50aHJvdHRsZWRfYXV0b2xvYWQgPSBudWxsO1xuICAgIHJldHVybiBIb29rcy5yZW1vdmVBY3Rpb24oJ3Bob3J0LnBvcnRmb2xpby5yZWZyZXNoJywgdGhpcy50aHJvdHRsZWRfYXV0b2xvYWQsIDEwMCk7XG4gIH07XG5cbiAgcmV0dXJuIEFic3RyYWN0X0xhenlfTG9hZGVyO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFic3RyYWN0X0xhenlfTG9hZGVyO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lRV0p6ZEhKaFkzUmZUR0Y2ZVY5TWIyRmtaWEl1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SkJZbk4wY21GamRGOU1ZWHA1WDB4dllXUmxjaTVqYjJabVpXVWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqdEJRVUZCT3pzN1FVRkJRU3hKUVVGQkxHMUVRVUZCTzBWQlFVRTdPMEZCUjBFc1EwRkJRU3hIUVVGSkxFOUJRVUVzUTBGQlV5eFJRVUZVT3p0QlFVTktMRXRCUVVFc1IwRkJVU3hQUVVGQkxFTkJRVk1zVlVGQlZEczdRVUZEVWl4VFFVRkJMRWRCUVZrc1QwRkJRU3hEUVVGVExHRkJRVlE3TzBGQlExb3NVVUZCUVN4SFFVRlhMRTlCUVVFc1EwRkJVeXhuUWtGQlZEczdRVUZGVER0RlFVTlJMRGhDUVVGQk96czdPMGxCUTFvc1NVRkJReXhEUVVGQkxGRkJRVVFzUjBGRFF6dE5RVUZCTEVsQlFVRXNSVUZCWVN4bFFVRmlPMDFCUTBFc1YwRkJRU3hGUVVGaExEUkNRVVJpTzAxQlJVRXNTVUZCUVN4RlFVRmhMR3RDUVVaaU8wMUJSMEVzUzBGQlFTeEZRVUZoTEcxQ1FVaGlPenRKUVV0RUxFbEJRVU1zUTBGQlFTeExRVUZFTEVkQlFWTTdTVUZKVkN4SlFVRkRMRU5CUVVFc1YwRkJSQ3hIUVVGbE8wbEJTV1lzU1VGQlF5eERRVUZCTEd0Q1FVRkVMRWRCUVhOQ08wbEJSWFJDTEVsQlFVTXNRMEZCUVN4WFFVRkVMRU5CUVVFN1NVRkRRU3hKUVVGRExFTkJRVUVzVlVGQlJDeERRVUZCTzBsQlEwRXNTVUZCUXl4RFFVRkJMR0ZCUVVRc1EwRkJRVHRGUVc1Q1dUczdPMEZCY1VKaU96czdPMmxEUVV0QkxFMUJRVUVzUjBGQlVTeFRRVUZCTEVkQlFVRTdPMmxEUVVWU0xFbEJRVUVzUjBGQlRTeFRRVUZGTEVsQlFVWTdTVUZEVEN4SlFVRkRMRU5CUVVFc1ZVRkJSQ3hEUVVGaExFbEJRV0k3VjBGRFFTeEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRmxCUVZRc1EwRkJjMElzUTBGQlFTeFRRVUZCTEV0QlFVRTdZVUZCUVN4VFFVRkJPMlZCUTNKQ0xFdEJRVU1zUTBGQlFTeHJRa0ZCUkN4RFFVRnhRaXhKUVVGeVFqdE5RVVJ4UWp0SlFVRkJMRU5CUVVFc1EwRkJRU3hEUVVGQkxFbEJRVUVzUTBGQmRFSTdSVUZHU3pzN2FVTkJTMDRzVlVGQlFTeEhRVUZaTEZOQlFVVXNTVUZCUmp0QlFVZFlMRkZCUVVFN1NVRkJRU3hMUVVGQkxFZEJRVkVzU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4UFFVRldMRU5CUVcxQ0xFOUJRVzVDTzBsQlExSXNTVUZCUVN4SFFVRlBMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zVDBGQlZpeERRVUZ0UWl4TlFVRnVRanRKUVVkUUxFbEJRVWtzUTBGQlF5eEhRVU5NTEVOQlFVTXNUMEZFUkN4RFFVTlZMRWxCUVVNc1EwRkJRU3hoUVVGRUxFTkJRV2RDTEV0QlFXaENMRVZCUVhWQ0xFbEJRWFpDTEVOQlJGWXNRMEZGUVN4RFFVRkRMRmRCUmtRc1EwRkZZeXhaUVVaa08xZEJTMEVzU1VGQlNTeERRVUZETEUxQlFVd3NSMEZCWXp0RlFWcElPenRwUTBGaldpeHJRa0ZCUVN4SFFVRnZRaXhUUVVGRkxFbEJRVVk3U1VGRmJrSXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhKUVVGVUxFTkJRV1VzUzBGQlppeERRVUZ6UWl4RFFVRkRMRkZCUVhaQ0xFTkJRV2xETEdWQlFXcERMRU5CUVd0RUxFTkJRVU1zVjBGQmJrUXNRMEZCWjBVc1owSkJRV2hGTzFkQlJVRXNTVUZCU1N4RFFVRkRMRWRCUjB3c1EwRkJReXhYUVVoRUxFTkJSMk1zU1VGQlF5eERRVUZCTEZGQlFWRXNRMEZCUXl4SlFVaDRRaXhEUVUxQkxFTkJRVU1zU1VGT1JDeERRVTFQTEVkQlFVRXNSMEZCU1N4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExGZEJUbkpDTEVOQlQwRXNRMEZCUXl4UFFWQkVMRU5CVDFVc1IwRlFWaXhGUVU5bExGTkJRVUU3WVVGQlJ5eERRVUZCTEVOQlFVY3NTVUZCU0N4RFFVRlRMRU5CUVVNc1RVRkJWaXhEUVVGQk8wbEJRVWdzUTBGUVpqdEZRVXB0UWpzN2FVTkJZWEJDTEdGQlFVRXNSMEZCWlN4VFFVRkZMRXRCUVVZc1JVRkJVeXhKUVVGVU8wbEJSV1FzU1VGQlJ5eFRRVUZCTEV0QlFXRXNUVUZCVFN4RFFVRkRMRTlCUVU4c1EwRkJReXhoUVVFdlFqdEJRVU5ETEdGQlFVOHNaVUZCUVN4SFFVTlBMRWxCUVVNc1EwRkJRU3hSUVVGUkxFTkJRVU1zU1VGRWFrSXNSMEZEYzBJc2NVTkJSSFJDTEVkQlJWRXNTVUZCUXl4RFFVRkJMRkZCUVZFc1EwRkJReXhMUVVac1FpeEhRVVYzUWl4WFFVWjRRaXhIUVVWcFF5eExRVVpxUXl4SFFVVjFReXg1UTBGSUwwTTdTMEZCUVN4TlFVRkJPMEZCVDBNc1lVRkJUeXhoUVVGQkxFZEJRMHNzU1VGQlF5eERRVUZCTEZGQlFWRXNRMEZCUXl4SlFVUm1MRWRCUTI5Q0xGbEJSSEJDTEVkQlF6aENMRWxCUkRsQ0xFZEJRMjFETEhGRFFVUnVReXhIUVVWUkxFbEJRVU1zUTBGQlFTeFJRVUZSTEVOQlFVTXNTMEZHYkVJc1IwRkZkMElzVjBGR2VFSXNSMEZGYVVNc1MwRkdha01zUjBGRmRVTXNkVU5CVkM5RE96dEZRVVpqT3p0cFEwRmxaaXhYUVVGQkxFZEJRV0VzVTBGQlFUdEpRVVZhTEVsQlFVTXNRMEZCUVN4TFFVRkVMRWRCUVZNN1NVRkhWQ3hEUVVGQkxFTkJRVWNzUjBGQlFTeEhRVUZKTEVsQlFVTXNRMEZCUVN4UlFVRlJMRU5CUVVNc1NVRkJha0lzUTBGQmVVSXNRMEZCUXl4SlFVRXhRaXhEUVVGblF5eEpRVUZETEVOQlFVRXNVVUZCYWtNN1JVRk1XVHM3YVVOQlVXSXNVVUZCUVN4SFFVRlZMRk5CUVVVc1IwRkJSaXhGUVVGUExFVkJRVkE3UVVGRFZDeFJRVUZCTzBsQlFVRXNSMEZCUVN4SFFVRk5MRU5CUVVFc1EwRkJSeXhGUVVGSU8wbEJRMDRzU1VGQlF5eERRVUZCTEV0QlFVc3NRMEZCUXl4SlFVRlFMRU5CUTBNN1RVRkJRU3hGUVVGQkxFVkJRVkVzUlVGQlVqdE5RVU5CTEVkQlFVRXNSVUZCVVN4SFFVUlNPMDFCUlVFc1NVRkJRU3hGUVVGWkxFbEJRVUVzVTBGQlFTeERRVUZYTEVkQlFWZ3NRMEZHV2p0TlFVZEJMRTFCUVVFc1JVRkJVU3hMUVVoU08wdEJSRVE3UlVGR1V6czdPMEZCVlZZN096czdhVU5CUjBFc1ZVRkJRU3hIUVVGWkxGTkJRVUU3UVVGRFdDeFJRVUZCTzBGQlFVRTdRVUZCUVR0VFFVRkJMSEZEUVVGQk96dHRRa0ZCUVN4SlFVRkRMRU5CUVVFc1RVRkJSQ3hEUVVGVExFbEJRVlE3UVVGQlFUczdSVUZFVnpzN2FVTkJUVm9zVVVGQlFTeEhRVUZWTEZOQlFVRTdRVUZEVkN4UlFVRkJPMEZCUVVFN1FVRkJRVHRUUVVGQkxHbEVRVUZCT3p0TlFVTkRMRWxCUVVjc1EwRkJTU3hKUVVGSkxFTkJRVU1zVFVGQlZDeEpRVUZ2UWl4SlFVRkRMRU5CUVVFc1lVRkJSQ3hEUVVGblFpeEpRVUZKTEVOQlFVTXNSVUZCY2tJc1EwRkJka0k3Y1VKQlEwTXNTVUZCUXl4RFFVRkJMRWxCUVVRc1EwRkJUeXhKUVVGUUxFZEJSRVE3VDBGQlFTeE5RVUZCT3paQ1FVRkJPenRCUVVSRU96dEZRVVJUT3p0cFEwRkxWaXhoUVVGQkxFZEJRV1VzVTBGQlJTeEZRVUZHTzBGQlEyUXNVVUZCUVR0SlFVRkJMRWxCUVcxQ0xHZERRVUZ1UWp0QlFVRkJMR0ZCUVU4c1MwRkJVRHM3U1VGRFFTeEpRVUZCTEVkQlFVOHNSVUZCUlN4RFFVRkRMSEZDUVVGSUxFTkJRVUU3U1VGSFVDeEpRVUZuUWl4SlFVRkpMRU5CUVVNc1RVRkJUQ3hMUVVGbExFTkJRV1lzU1VGQmNVSXNTVUZCU1N4RFFVRkRMRXRCUVV3c1MwRkJZeXhEUVVGdVJEdEJRVUZCTEdGQlFVOHNUVUZCVURzN1FVRkhRU3hYUVVWRExFbEJRVWtzUTBGQlF5eEhRVUZNTEVkQlFWY3NTVUZCU1N4RFFVRkRMRTFCUVdoQ0xFbEJRVEJDTEVOQlFVTXNTVUZCUXl4RFFVRkJMRmRCUVRWQ0xFbEJRMEVzU1VGQlNTeERRVUZETEUxQlFVd3NSMEZCWXl4SlFVRkpMRU5CUVVNc1RVRkJia0lzU1VGQk5rSXNVVUZCVVN4RFFVRkRMRTFCUVZRc1IwRkJhMElzU1VGQlF5eERRVUZCTEZkQlJHaEVMRWxCU1VFc1NVRkJTU3hEUVVGRExFbEJRVXdzUjBGQldTeEpRVUZKTEVOQlFVTXNTMEZCYWtJc1NVRkJNRUlzUTBGQlF5eEpRVUZETEVOQlFVRXNWMEZLTlVJc1NVRkxRU3hKUVVGSkxFTkJRVU1zUzBGQlRDeEhRVUZoTEVsQlFVa3NRMEZCUXl4TFFVRnNRaXhKUVVFeVFpeFJRVUZSTEVOQlFVTXNTMEZCVkN4SFFVRnBRaXhKUVVGRExFTkJRVUU3UlVGbWFFTTdPMmxEUVcxQ1ppeHJRa0ZCUVN4SFFVRnZRaXhUUVVGRkxFbEJRVVk3VjBGRGJrSXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhKUVVGVUxFTkJRV1VzUjBGQlFTeEhRVUZKTEVsQlFVTXNRMEZCUVN4UlFVRlJMRU5CUVVNc1YwRkJaQ3hIUVVFd1FpeFpRVUY2UXl4RFFVRnpSQ3hEUVVGRExFMUJRWFpFTEVOQlFVRTdSVUZFYlVJN08ybERRVWR3UWl4UFFVRkJMRWRCUVZNc1UwRkJRVHRYUVVOU0xFbEJRVU1zUTBGQlFTeGhRVUZFTEVOQlFVRTdSVUZFVVRzN2FVTkJSMVFzWVVGQlFTeEhRVUZsTEZOQlFVRTdTVUZGWkN4SlFVRkRMRU5CUVVFc2EwSkJRVVFzUjBGQmMwSXNRMEZCUXl4RFFVRkRMRkZCUVVZc1EwRkJXU3hKUVVGRExFTkJRVUVzVVVGQllpeEZRVUYxUWl4RlFVRjJRanRYUVVOMFFpeExRVUZMTEVOQlFVTXNVMEZCVGl4RFFVRm5RaXg1UWtGQmFFSXNSVUZCTWtNc1NVRkJReXhEUVVGQkxHdENRVUUxUXl4RlFVRm5SU3hIUVVGb1JUdEZRVWhqT3p0cFEwRk5aaXhoUVVGQkxFZEJRV1VzVTBGQlFUdEpRVVZrTEVsQlFVTXNRMEZCUVN4clFrRkJSQ3hIUVVGelFqdFhRVU4wUWl4TFFVRkxMRU5CUVVNc1dVRkJUaXhEUVVGdFFpeDVRa0ZCYmtJc1JVRkJPRU1zU1VGQlF5eERRVUZCTEd0Q1FVRXZReXhGUVVGdFJTeEhRVUZ1UlR0RlFVaGpPenM3T3pzN1FVRlBhRUlzVFVGQlRTeERRVUZETEU5QlFWQXNSMEZCYVVJaWZRPT1cbiIsInZhciBJdGVtX0RhdGE7XG5cbkl0ZW1fRGF0YSA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gSXRlbV9EYXRhKCRlbCkge1xuICAgIHZhciBkYXRhO1xuICAgIHRoaXMuJGVsID0gJGVsO1xuICAgIGRhdGEgPSAkZWwuZGF0YSgnaXRlbScpO1xuICAgIGlmICghZGF0YSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRWxlbWVudCBkb2Vzbid0IGNvbnRhaW4gYGRhdGEtaXRlbWAgYXR0cmlidXRlXCIpO1xuICAgIH1cbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICB9XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfZGF0YSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaW1hZ2U7XG4gICAgaW1hZ2UgPSB0aGlzLmRhdGFbJ2ltYWdlcyddW25hbWVdO1xuICAgIGlmICghaW1hZ2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGltYWdlO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X3NpemUgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGhlaWdodCwgaW1hZ2UsIHJlZiwgc2l6ZSwgd2lkdGg7XG4gICAgaW1hZ2UgPSB0aGlzLmdldF9kYXRhKG5hbWUpO1xuICAgIGlmICghaW1hZ2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgc2l6ZSA9IGltYWdlWydzaXplJ107XG4gICAgcmVmID0gc2l6ZS5zcGxpdCgneCcpLCB3aWR0aCA9IHJlZlswXSwgaGVpZ2h0ID0gcmVmWzFdO1xuICAgIHdpZHRoID0gcGFyc2VJbnQod2lkdGgpO1xuICAgIGhlaWdodCA9IHBhcnNlSW50KGhlaWdodCk7XG4gICAgcmV0dXJuIFt3aWR0aCwgaGVpZ2h0XTtcbiAgfTtcblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF91cmwgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGltYWdlO1xuICAgIGltYWdlID0gdGhpcy5nZXRfZGF0YShuYW1lKTtcbiAgICBpZiAoIWltYWdlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBpbWFnZVsndXJsJ107XG4gIH07XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfb3JfZmFsc2UgPSBmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAodGhpcy5kYXRhW2tleV0pIHtcbiAgICAgIHJldHVybiB0aGlzLmRhdGFba2V5XTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X3JhdGlvID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0X29yX2ZhbHNlKCdyYXRpbycpO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X3R5cGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRfb3JfZmFsc2UoJ3R5cGUnKTtcbiAgfTtcblxuICByZXR1cm4gSXRlbV9EYXRhO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEl0ZW1fRGF0YTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pU1hSbGJWOUVZWFJoTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lTWFJsYlY5RVlYUmhMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRU3hKUVVGQk96dEJRVUZOTzBWQlJWRXNiVUpCUVVVc1IwRkJSanRCUVVOYUxGRkJRVUU3U1VGQlFTeEpRVUZETEVOQlFVRXNSMEZCUkN4SFFVRlBPMGxCUTFBc1NVRkJRU3hIUVVGUExFZEJRVWNzUTBGQlF5eEpRVUZLTEVOQlFWVXNUVUZCVmp0SlFVVlFMRWxCUVVjc1EwRkJTU3hKUVVGUU8wRkJRME1zV1VGQlZTeEpRVUZCTEV0QlFVRXNRMEZCVFN3clEwRkJUaXhGUVVSWU96dEpRVWRCTEVsQlFVTXNRMEZCUVN4SlFVRkVMRWRCUVZFN1JVRlFTVHM3YzBKQlYySXNVVUZCUVN4SFFVRlZMRk5CUVVVc1NVRkJSanRCUVVOVUxGRkJRVUU3U1VGQlFTeExRVUZCTEVkQlFWRXNTVUZCUXl4RFFVRkJMRWxCUVUwc1EwRkJRU3hSUVVGQkxFTkJRVmtzUTBGQlFTeEpRVUZCTzBsQlF6TkNMRWxCUVdkQ0xFTkJRVWtzUzBGQmNFSTdRVUZCUVN4aFFVRlBMRTFCUVZBN08wRkJSVUVzVjBGQlR6dEZRVXBGT3p0elFrRk5WaXhSUVVGQkxFZEJRVlVzVTBGQlJTeEpRVUZHTzBGQlExUXNVVUZCUVR0SlFVRkJMRXRCUVVFc1IwRkJVU3hKUVVGRExFTkJRVUVzVVVGQlJDeERRVUZYTEVsQlFWZzdTVUZEVWl4SlFVRm5RaXhEUVVGSkxFdEJRWEJDTzBGQlFVRXNZVUZCVHl4TlFVRlFPenRKUVVWQkxFbEJRVUVzUjBGQlR5eExRVUZQTEVOQlFVRXNUVUZCUVR0SlFVVmtMRTFCUVd0Q0xFbEJRVWtzUTBGQlF5eExRVUZNTEVOQlFWa3NSMEZCV2l4RFFVRnNRaXhGUVVGRExHTkJRVVFzUlVGQlVUdEpRVVZTTEV0QlFVRXNSMEZCVVN4UlFVRkJMRU5CUVZVc1MwRkJWanRKUVVOU0xFMUJRVUVzUjBGQlV5eFJRVUZCTEVOQlFWVXNUVUZCVmp0QlFVVlVMRmRCUVU4c1EwRkJReXhMUVVGRUxFVkJRVkVzVFVGQlVqdEZRVmhGT3p0elFrRmhWaXhQUVVGQkxFZEJRVk1zVTBGQlJTeEpRVUZHTzBGQlExSXNVVUZCUVR0SlFVRkJMRXRCUVVFc1IwRkJVU3hKUVVGRExFTkJRVUVzVVVGQlJDeERRVUZYTEVsQlFWZzdTVUZEVWl4SlFVRm5RaXhEUVVGSkxFdEJRWEJDTzBGQlFVRXNZVUZCVHl4TlFVRlFPenRCUVVOQkxGZEJRVThzUzBGQlR5eERRVUZCTEV0QlFVRTdSVUZJVGpzN2MwSkJTMVFzV1VGQlFTeEhRVUZqTEZOQlFVVXNSMEZCUmp0SlFVTmlMRWxCUVVjc1NVRkJReXhEUVVGQkxFbEJRVTBzUTBGQlFTeEhRVUZCTEVOQlFWWTdRVUZEUXl4aFFVRlBMRWxCUVVNc1EwRkJRU3hKUVVGTkxFTkJRVUVzUjBGQlFTeEZRVVJtT3p0QlFVVkJMRmRCUVU4N1JVRklUVHM3YzBKQlMyUXNVMEZCUVN4SFFVRmpMRk5CUVVFN1YwRkJSeXhKUVVGRExFTkJRVUVzV1VGQlJDeERRVUZsTEU5QlFXWTdSVUZCU0RzN2MwSkJRMlFzVVVGQlFTeEhRVUZqTEZOQlFVRTdWMEZCUnl4SlFVRkRMRU5CUVVFc1dVRkJSQ3hEUVVGbExFMUJRV1k3UlVGQlNEczdPenM3TzBGQlIyWXNUVUZCVFN4RFFVRkRMRTlCUVZBc1IwRkJhVUlpZlE9PVxuIiwidmFyICQsIEFic3RyYWN0X0xhenlfTG9hZGVyLCBMYXp5X01hc29ucnksIF9fV0lORE9XLFxuICBleHRlbmQgPSBmdW5jdGlvbihjaGlsZCwgcGFyZW50KSB7IGZvciAodmFyIGtleSBpbiBwYXJlbnQpIHsgaWYgKGhhc1Byb3AuY2FsbChwYXJlbnQsIGtleSkpIGNoaWxkW2tleV0gPSBwYXJlbnRba2V5XTsgfSBmdW5jdGlvbiBjdG9yKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gY2hpbGQ7IH0gY3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlOyBjaGlsZC5wcm90b3R5cGUgPSBuZXcgY3RvcigpOyBjaGlsZC5fX3N1cGVyX18gPSBwYXJlbnQucHJvdG90eXBlOyByZXR1cm4gY2hpbGQ7IH0sXG4gIGhhc1Byb3AgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkFic3RyYWN0X0xhenlfTG9hZGVyID0gcmVxdWlyZSgnLi9BYnN0cmFjdF9MYXp5X0xvYWRlcicpO1xuXG5fX1dJTkRPVyA9IHJlcXVpcmUoJy4uL2NvcmUvV2luZG93Jyk7XG5cbkxhenlfTWFzb25yeSA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gIGV4dGVuZChMYXp5X01hc29ucnksIHN1cGVyQ2xhc3MpO1xuXG4gIGZ1bmN0aW9uIExhenlfTWFzb25yeSgpIHtcbiAgICByZXR1cm4gTGF6eV9NYXNvbnJ5Ll9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5yZXNpemVfYWxsID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wbGFjZWhvbGRlcl93aWR0aCA9ICQoJy5QUF9NYXNvbnJ5X19zaXplcicpLndpZHRoKCk7XG4gICAgcmV0dXJuIExhenlfTWFzb25yeS5fX3N1cGVyX18ucmVzaXplX2FsbC5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24oaXRlbSkge1xuICAgIHJldHVybiBpdGVtLiRlbC5jc3Moe1xuICAgICAgJ21pbi1oZWlnaHQnOiBNYXRoLmZsb29yKHRoaXMucGxhY2Vob2xkZXJfd2lkdGggLyBpdGVtLmRhdGEuZ2V0X3JhdGlvKCkpXG4gICAgfSk7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5jbGVhbnVwX2FmdGVyX2xvYWQgPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgaXRlbS4kZWwuY3NzKCdtaW4taGVpZ2h0JywgJycpO1xuICAgIHJldHVybiBMYXp5X01hc29ucnkuX19zdXBlcl9fLmNsZWFudXBfYWZ0ZXJfbG9hZC5jYWxsKHRoaXMsIGl0ZW0pO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUuYXR0YWNoX2V2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIExhenlfTWFzb25yeS5fX3N1cGVyX18uYXR0YWNoX2V2ZW50cy5jYWxsKHRoaXMpO1xuICAgIHJldHVybiAkKHdpbmRvdykub24oJ3Njcm9sbCcsIHRoaXMudGhyb3R0bGVkX2F1dG9sb2FkKTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmRldGFjaF9ldmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAkKHdpbmRvdykub2ZmKCdzY3JvbGwnLCB0aGlzLnRocm90dGxlZF9hdXRvbG9hZCk7XG4gICAgcmV0dXJuIExhenlfTWFzb25yeS5fX3N1cGVyX18uZGV0YWNoX2V2ZW50cy5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpLCBpdGVtLCBrZXksIGxlbiwgcmVmO1xuICAgIHJlZiA9IHRoaXMuSXRlbXM7XG4gICAgZm9yIChrZXkgPSBpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsga2V5ID0gKytpKSB7XG4gICAgICBpdGVtID0gcmVmW2tleV07XG4gICAgICBpdGVtLiRlbC5jc3MoJ21pbi1oZWlnaHQnLCAnJyk7XG4gICAgfVxuICAgIHJldHVybiBMYXp5X01hc29ucnkuX19zdXBlcl9fLmRlc3Ryb3kuY2FsbCh0aGlzKTtcbiAgfTtcblxuICByZXR1cm4gTGF6eV9NYXNvbnJ5O1xuXG59KShBYnN0cmFjdF9MYXp5X0xvYWRlcik7XG5cbm1vZHVsZS5leHBvcnRzID0gTGF6eV9NYXNvbnJ5O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lUR0Y2ZVY5TllYTnZibko1TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lUR0Y2ZVY5TllYTnZibko1TG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4SlFVRkJMQ3REUVVGQk8wVkJRVUU3T3p0QlFVRkJMRU5CUVVFc1IwRkJTU3hQUVVGQkxFTkJRVk1zVVVGQlZEczdRVUZEU2l4dlFrRkJRU3hIUVVGMVFpeFBRVUZCTEVOQlFWTXNkMEpCUVZRN08wRkJRM1pDTEZGQlFVRXNSMEZCVnl4UFFVRkJMRU5CUVZNc1owSkJRVlE3TzBGQlJVdzdPenM3T3pzN2VVSkJSVXdzVlVGQlFTeEhRVUZaTEZOQlFVRTdTVUZEV0N4SlFVRkRMRU5CUVVFc2FVSkJRVVFzUjBGQmNVSXNRMEZCUVN4RFFVRkhMRzlDUVVGSUxFTkJRWGxDTEVOQlFVTXNTMEZCTVVJc1EwRkJRVHRYUVVOeVFpd3lRMEZCUVR0RlFVWlhPenQ1UWtGSldpeE5RVUZCTEVkQlFWRXNVMEZCUlN4SlFVRkdPMWRCUTFBc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eEhRVUZVTEVOQlFXRTdUVUZCUVN4WlFVRkJMRVZCUVdNc1NVRkJTU3hEUVVGRExFdEJRVXdzUTBGQldTeEpRVUZETEVOQlFVRXNhVUpCUVVRc1IwRkJjVUlzU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4VFFVRldMRU5CUVVFc1EwRkJha01zUTBGQlpEdExRVUZpTzBWQlJFODdPM2xDUVVkU0xHdENRVUZCTEVkQlFXOUNMRk5CUVVNc1NVRkJSRHRKUVVWdVFpeEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRWRCUVZRc1EwRkJZeXhaUVVGa0xFVkJRVFJDTEVWQlFUVkNPMWRCUjBFc2NVUkJRVThzU1VGQlVEdEZRVXh0UWpzN2VVSkJUM0JDTEdGQlFVRXNSMEZCWlN4VFFVRkJPMGxCUldRc09FTkJRVUU3VjBGSFFTeERRVUZCTEVOQlFVY3NUVUZCU0N4RFFVRlhMRU5CUVVNc1JVRkJXaXhEUVVGbExGRkJRV1lzUlVGQmVVSXNTVUZCUXl4RFFVRkJMR3RDUVVFeFFqdEZRVXhqT3p0NVFrRlRaaXhoUVVGQkxFZEJRV1VzVTBGQlFUdEpRVVZrTEVOQlFVRXNRMEZCUnl4TlFVRklMRU5CUVZjc1EwRkJReXhIUVVGYUxFTkJRV2RDTEZGQlFXaENMRVZCUVRCQ0xFbEJRVU1zUTBGQlFTeHJRa0ZCTTBJN1YwRkhRU3c0UTBGQlFUdEZRVXhqT3p0NVFrRlBaaXhQUVVGQkxFZEJRVk1zVTBGQlFUdEJRVU5TTEZGQlFVRTdRVUZCUVR0QlFVRkJMRk5CUVVFc2FVUkJRVUU3TzAxQlEwTXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhIUVVGVUxFTkJRV0VzV1VGQllpeEZRVUV5UWl4RlFVRXpRanRCUVVSRU8xZEJSVUVzZDBOQlFVRTdSVUZJVVRzN096dEhRV2hEYVVJN08wRkJjME16UWl4TlFVRk5MRU5CUVVNc1QwRkJVQ3hIUVVGcFFpSjlcbiIsInZhciAkLCBIb29rcywgY3JlYXRlLCBkZXN0cm95LCBpbnN0YW5jZTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbmluc3RhbmNlID0gZmFsc2U7XG5cbmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCFpbnN0YW5jZSkge1xuICAgIHJldHVybjtcbiAgfVxuICBpbnN0YW5jZS5kZXN0cm95KCk7XG4gIHJldHVybiBpbnN0YW5jZSA9IG51bGw7XG59O1xuXG5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIEhhbmRsZXI7XG4gIGRlc3Ryb3koKTtcbiAgSGFuZGxlciA9IEhvb2tzLmFwcGx5RmlsdGVycygncGhvcnQubGF6eS5oYW5kbGVyJywgZmFsc2UpO1xuICBpZiAoIUhhbmRsZXIpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaW5zdGFuY2UgPSBuZXcgSGFuZGxlcigpO1xufTtcblxuSG9va3MuYWRkQWN0aW9uKCdwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZScsIGNyZWF0ZSwgMTAwKTtcblxuSG9va3MuYWRkQWN0aW9uKCdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScsIGRlc3Ryb3kpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2ljM1JoY25RdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUp6ZEdGeWRDNWpiMlptWldVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWtGQlFVRXNTVUZCUVRzN1FVRkJRU3hEUVVGQkxFZEJRVWtzVDBGQlFTeERRVUZUTEZGQlFWUTdPMEZCUTBvc1MwRkJRU3hIUVVGUkxFOUJRVUVzUTBGQlV5eFZRVUZVT3p0QlFVZFNMRkZCUVVFc1IwRkJWenM3UVVGRldDeFBRVUZCTEVkQlFWVXNVMEZCUVR0RlFVTlVMRWxCUVZVc1EwRkJTU3hSUVVGa08wRkJRVUVzVjBGQlFUczdSVUZEUVN4UlFVRlJMRU5CUVVNc1QwRkJWQ3hEUVVGQk8xTkJRMEVzVVVGQlFTeEhRVUZYTzBGQlNFWTdPMEZCUzFZc1RVRkJRU3hIUVVGVExGTkJRVUU3UVVGSFVpeE5RVUZCTzBWQlFVRXNUMEZCUVN4RFFVRkJPMFZCUjBFc1QwRkJRU3hIUVVGVkxFdEJRVXNzUTBGQlF5eFpRVUZPTEVOQlFXMUNMRzlDUVVGdVFpeEZRVUY1UXl4TFFVRjZRenRGUVVOV0xFbEJRVlVzUTBGQlNTeFBRVUZrTzBGQlFVRXNWMEZCUVRzN1JVRkpRU3hSUVVGQkxFZEJRV1VzU1VGQlFTeFBRVUZCTEVOQlFVRTdRVUZZVURzN1FVRnBRbFFzUzBGQlN5eERRVUZETEZOQlFVNHNRMEZCWjBJc2VVSkJRV2hDTEVWQlFUSkRMRTFCUVRORExFVkJRVzFFTEVkQlFXNUVPenRCUVVOQkxFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMSGxDUVVGb1FpeEZRVUV5UXl4UFFVRXpReUo5XG4iLCJ2YXIgSG9va3MsIFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5cbi8qXG5cbiAgICAgKiBJbml0aWFsaXplIFBvcnRmb2xpbyBDb3JlXG5cdC0tLVxuXHRcdFVzaW5nIHA1MCBAIGBwaG9ydC5jb3JlLnJlYWR5YFxuXHRcdExhdGUgcHJpb3JpdHkgaXMgZ29pbmcgdG8gZm9yY2UgZXhwbGljaXQgcHJpb3JpdHkgaW4gYW55IG90aGVyIG1vdmluZyBwYXJ0cyB0aGF0IGFyZSBnb2luZyB0byB0b3VjaCBwb3J0Zm9saW8gbGF5b3V0IGF0IGBwaG9ydC5sb2FkZWRgXG5cdC0tLVxuICovXG5cblBvcnRmb2xpb19FdmVudF9NYW5hZ2VyID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlcigpIHt9XG5cbiAgUG9ydGZvbGlvX0V2ZW50X01hbmFnZXIucHJvdG90eXBlLnByZXBhcmUgPSBmdW5jdGlvbigpIHtcbiAgICBIb29rcy5kb0FjdGlvbigncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnKTtcbiAgfTtcblxuICBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlci5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MuZG9BY3Rpb24oJ3Bob3J0LnBvcnRmb2xpby5jcmVhdGUnKTtcbiAgfTtcblxuICBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlci5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLmRvQWN0aW9uKCdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCcpO1xuICB9O1xuXG4gIFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MuZG9BY3Rpb24oJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95Jyk7XG4gIH07XG5cbiAgcmV0dXJuIFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lVRzl5ZEdadmJHbHZYMFYyWlc1MFgwMWhibUZuWlhJdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUpRYjNKMFptOXNhVzlmUlhabGJuUmZUV0Z1WVdkbGNpNWpiMlptWldVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWtGQlFVRXNTVUZCUVRzN1FVRkJRU3hMUVVGQkxFZEJRVkVzVDBGQlFTeERRVUZUTEZWQlFWUTdPenRCUVVWU096czdPenM3T3pzN1FVRlRUVHM3TzI5RFFVVk1MRTlCUVVFc1IwRkJVeXhUUVVGQk8wbEJRMUlzUzBGQlN5eERRVUZETEZGQlFVNHNRMEZCWlN4NVFrRkJaanRGUVVSUk96dHZRMEZKVkN4TlFVRkJMRWRCUVZFc1UwRkJRVHRKUVVOUUxFdEJRVXNzUTBGQlF5eFJRVUZPTEVOQlFXVXNkMEpCUVdZN1JVRkVUenM3YjBOQlMxSXNUMEZCUVN4SFFVRlRMRk5CUVVFN1NVRkRVaXhMUVVGTExFTkJRVU1zVVVGQlRpeERRVUZsTEhsQ1FVRm1PMFZCUkZFN08yOURRVXRVTEU5QlFVRXNSMEZCVXl4VFFVRkJPMGxCUlZJc1MwRkJTeXhEUVVGRExGRkJRVTRzUTBGQlpTeDVRa0ZCWmp0RlFVWlJPenM3T3pzN1FVRk5WaXhOUVVGTkxFTkJRVU1zVDBGQlVDeEhRVUZwUWlKOVxuIiwidmFyIEhvb2tzLCBQb3J0Zm9saW9fSW50ZXJmYWNlLFxuICBiaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuXG4vKlxuXHRBYnN0cmFjdCBDbGFzcyBQb3J0b2ZsaW9fRXZlbnRfSW1lcGxlbWVudGF0aW9uXG5cbiAgICBIYW5kbGVzIGFsbCB0aGUgZXZlbnRzIHJlcXVpcmVkIHRvIGZ1bGx5IGhhbmRsZSBhIHBvcnRmb2xpbyBsYXlvdXQgcHJvY2Vzc1xuICovXG5cblBvcnRmb2xpb19JbnRlcmZhY2UgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIFBvcnRmb2xpb19JbnRlcmZhY2UoYXJncykge1xuICAgIHRoaXMucHVyZ2VfYWN0aW9ucyA9IGJpbmQodGhpcy5wdXJnZV9hY3Rpb25zLCB0aGlzKTtcbiAgICB0aGlzLnNldHVwX2FjdGlvbnMoKTtcbiAgICB0aGlzLmluaXRpYWxpemUoYXJncyk7XG4gIH1cblxuICBQb3J0Zm9saW9fSW50ZXJmYWNlLnByb3RvdHlwZS5zZXR1cF9hY3Rpb25zID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MuYWRkQWN0aW9uKCdwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZScsIHRoaXMucHJlcGFyZSwgNTApO1xuICAgIEhvb2tzLmFkZEFjdGlvbigncGhvcnQucG9ydGZvbGlvLmNyZWF0ZScsIHRoaXMuY3JlYXRlLCA1MCk7XG4gICAgSG9va3MuYWRkQWN0aW9uKCdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCcsIHRoaXMucmVmcmVzaCwgNTApO1xuICAgIEhvb2tzLmFkZEFjdGlvbigncGhvcnQucG9ydGZvbGlvLmRlc3Ryb3knLCB0aGlzLmRlc3Ryb3ksIDUwKTtcbiAgICByZXR1cm4gSG9va3MuYWRkQWN0aW9uKCdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScsIHRoaXMucHVyZ2VfYWN0aW9ucywgMTAwKTtcbiAgfTtcblxuICBQb3J0Zm9saW9fSW50ZXJmYWNlLnByb3RvdHlwZS5wdXJnZV9hY3Rpb25zID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MucmVtb3ZlQWN0aW9uKCdwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZScsIHRoaXMucHJlcGFyZSwgNTApO1xuICAgIEhvb2tzLnJlbW92ZUFjdGlvbigncGhvcnQucG9ydGZvbGlvLmNyZWF0ZScsIHRoaXMuY3JlYXRlLCA1MCk7XG4gICAgSG9va3MucmVtb3ZlQWN0aW9uKCdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCcsIHRoaXMucmVmcmVzaCwgNTApO1xuICAgIEhvb2tzLnJlbW92ZUFjdGlvbigncGhvcnQucG9ydGZvbGlvLmRlc3Ryb3knLCB0aGlzLmRlc3Ryb3ksIDUwKTtcbiAgICByZXR1cm4gSG9va3MucmVtb3ZlQWN0aW9uKCdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScsIHRoaXMucHVyZ2VfYWN0aW9ucywgMTAwKTtcbiAgfTtcblxuXG4gIC8qXG4gICAgIFx0UmVxdWlyZSB0aGVzZSBtZXRob2RzXG4gICAqL1xuXG4gIFBvcnRmb2xpb19JbnRlcmZhY2UucHJvdG90eXBlLmluaXRpYWxpemUgPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYGluaXRpYWxpemVgIG1ldGhvZFwiKTtcbiAgfTtcblxuICBQb3J0Zm9saW9fSW50ZXJmYWNlLnByb3RvdHlwZS5wcmVwYXJlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGBwcmVwYXJlYCBtZXRob2RcIik7XG4gIH07XG5cbiAgUG9ydGZvbGlvX0ludGVyZmFjZS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGBjcmVhdGVgIG1ldGhvZFwiKTtcbiAgfTtcblxuICBQb3J0Zm9saW9fSW50ZXJmYWNlLnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGByZWZyZXNoYCBtZXRob2RcIik7XG4gIH07XG5cbiAgUG9ydGZvbGlvX0ludGVyZmFjZS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgZGVzdHJveWAgbWV0aG9kXCIpO1xuICB9O1xuXG4gIHJldHVybiBQb3J0Zm9saW9fSW50ZXJmYWNlO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBvcnRmb2xpb19JbnRlcmZhY2U7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVVHOXlkR1p2YkdsdlgwbHVkR1Z5Wm1GalpTNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSWxCdmNuUm1iMnhwYjE5SmJuUmxjbVpoWTJVdVkyOW1abVZsSWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUpCUVVGQkxFbEJRVUVzTUVKQlFVRTdSVUZCUVRzN1FVRkJRU3hMUVVGQkxFZEJRVkVzVDBGQlFTeERRVUZUTEZWQlFWUTdPenRCUVVkU096czdPenM3UVVGTFRUdEZRVVZSTERaQ1FVRkZMRWxCUVVZN08wbEJRMW9zU1VGQlF5eERRVUZCTEdGQlFVUXNRMEZCUVR0SlFVTkJMRWxCUVVNc1EwRkJRU3hWUVVGRUxFTkJRV0VzU1VGQllqdEZRVVpaT3p0blEwRkpZaXhoUVVGQkxFZEJRV1VzVTBGQlFUdEpRVU5rTEV0QlFVc3NRMEZCUXl4VFFVRk9MRU5CUVdkQ0xIbENRVUZvUWl4RlFVRXlReXhKUVVGRExFTkJRVUVzVDBGQk5VTXNSVUZCY1VRc1JVRkJja1E3U1VGRFFTeExRVUZMTEVOQlFVTXNVMEZCVGl4RFFVRm5RaXgzUWtGQmFFSXNSVUZCTUVNc1NVRkJReXhEUVVGQkxFMUJRVE5ETEVWQlFXMUVMRVZCUVc1RU8wbEJRMEVzUzBGQlN5eERRVUZETEZOQlFVNHNRMEZCWjBJc2VVSkJRV2hDTEVWQlFUSkRMRWxCUVVNc1EwRkJRU3hQUVVFMVF5eEZRVUZ4UkN4RlFVRnlSRHRKUVVOQkxFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMSGxDUVVGb1FpeEZRVUV5UXl4SlFVRkRMRU5CUVVFc1QwRkJOVU1zUlVGQmNVUXNSVUZCY2tRN1YwRkRRU3hMUVVGTExFTkJRVU1zVTBGQlRpeERRVUZuUWl4NVFrRkJhRUlzUlVGQk1rTXNTVUZCUXl4RFFVRkJMR0ZCUVRWRExFVkJRVEpFTEVkQlFUTkVPMFZCVEdNN08yZERRVTltTEdGQlFVRXNSMEZCWlN4VFFVRkJPMGxCUTJRc1MwRkJTeXhEUVVGRExGbEJRVTRzUTBGQmJVSXNlVUpCUVc1Q0xFVkJRVGhETEVsQlFVTXNRMEZCUVN4UFFVRXZReXhGUVVGM1JDeEZRVUY0UkR0SlFVTkJMRXRCUVVzc1EwRkJReXhaUVVGT0xFTkJRVzFDTEhkQ1FVRnVRaXhGUVVFMlF5eEpRVUZETEVOQlFVRXNUVUZCT1VNc1JVRkJjMFFzUlVGQmRFUTdTVUZEUVN4TFFVRkxMRU5CUVVNc1dVRkJUaXhEUVVGdFFpeDVRa0ZCYmtJc1JVRkJPRU1zU1VGQlF5eERRVUZCTEU5QlFTOURMRVZCUVhkRUxFVkJRWGhFTzBsQlEwRXNTMEZCU3l4RFFVRkRMRmxCUVU0c1EwRkJiVUlzZVVKQlFXNUNMRVZCUVRoRExFbEJRVU1zUTBGQlFTeFBRVUV2UXl4RlFVRjNSQ3hGUVVGNFJEdFhRVU5CTEV0QlFVc3NRMEZCUXl4WlFVRk9MRU5CUVcxQ0xIbENRVUZ1UWl4RlFVRTRReXhKUVVGRExFTkJRVUVzWVVGQkwwTXNSVUZCT0VRc1IwRkJPVVE3UlVGTVl6czdPMEZCVVdZN096czdaME5CUjBFc1ZVRkJRU3hIUVVGWkxGTkJRVUU3UVVGQlJ5eFZRVUZWTEVsQlFVRXNTMEZCUVN4RFFVRlBMSEZHUVVGUU8wVkJRV0k3TzJkRFFVTmFMRTlCUVVFc1IwRkJXU3hUUVVGQk8wRkJRVWNzVlVGQlZTeEpRVUZCTEV0QlFVRXNRMEZCVHl4clJrRkJVRHRGUVVGaU96dG5RMEZEV2l4TlFVRkJMRWRCUVZrc1UwRkJRVHRCUVVGSExGVkJRVlVzU1VGQlFTeExRVUZCTEVOQlFVOHNhVVpCUVZBN1JVRkJZanM3WjBOQlExb3NUMEZCUVN4SFFVRlpMRk5CUVVFN1FVRkJSeXhWUVVGVkxFbEJRVUVzUzBGQlFTeERRVUZQTEd0R1FVRlFPMFZCUVdJN08yZERRVU5hTEU5QlFVRXNSMEZCV1N4VFFVRkJPMEZCUVVjc1ZVRkJWU3hKUVVGQkxFdEJRVUVzUTBGQlR5eHJSa0ZCVUR0RlFVRmlPenM3T3pzN1FVRkpZaXhOUVVGTkxFTkJRVU1zVDBGQlVDeEhRVUZwUWlKOVxuIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgJCwgSG9va3MsIFBvcnRmb2xpb19JbnRlcmZhY2UsIFBvcnRmb2xpb19NYXNvbnJ5LFxuICBiaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfSxcbiAgZXh0ZW5kID0gZnVuY3Rpb24oY2hpbGQsIHBhcmVudCkgeyBmb3IgKHZhciBrZXkgaW4gcGFyZW50KSB7IGlmIChoYXNQcm9wLmNhbGwocGFyZW50LCBrZXkpKSBjaGlsZFtrZXldID0gcGFyZW50W2tleV07IH0gZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9IGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTsgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTsgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTsgcmV0dXJuIGNoaWxkOyB9LFxuICBoYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHk7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5Qb3J0Zm9saW9fSW50ZXJmYWNlID0gcmVxdWlyZSgnLi9Qb3J0Zm9saW9fSW50ZXJmYWNlJyk7XG5cblBvcnRmb2xpb19NYXNvbnJ5ID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgZXh0ZW5kKFBvcnRmb2xpb19NYXNvbnJ5LCBzdXBlckNsYXNzKTtcblxuICBmdW5jdGlvbiBQb3J0Zm9saW9fTWFzb25yeSgpIHtcbiAgICB0aGlzLnJlZnJlc2ggPSBiaW5kKHRoaXMucmVmcmVzaCwgdGhpcyk7XG4gICAgdGhpcy5kZXN0cm95ID0gYmluZCh0aGlzLmRlc3Ryb3ksIHRoaXMpO1xuICAgIHRoaXMuY3JlYXRlID0gYmluZCh0aGlzLmNyZWF0ZSwgdGhpcyk7XG4gICAgdGhpcy5wcmVwYXJlID0gYmluZCh0aGlzLnByZXBhcmUsIHRoaXMpO1xuICAgIHRoaXMuRWxlbWVudHMgPSB7XG4gICAgICBjb250YWluZXI6ICdQUF9NYXNvbnJ5JyxcbiAgICAgIHNpemVyOiAnUFBfTWFzb25yeV9fc2l6ZXInLFxuICAgICAgaXRlbTogJ1BQX01hc29ucnlfX2l0ZW0nXG4gICAgfTtcbiAgICBQb3J0Zm9saW9fTWFzb25yeS5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzKTtcbiAgfVxuXG5cbiAgLypcbiAgXHRcdEluaXRpYWxpemVcbiAgICovXG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLmluaXRpYWxpemUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy4kY29udGFpbmVyID0gJChcIi5cIiArIHRoaXMuRWxlbWVudHMuY29udGFpbmVyKTtcbiAgfTtcblxuXG4gIC8qXG4gIFx0XHRQcmVwYXJlICYgQXR0YWNoIEV2ZW50c1xuICAgICBcdERvbid0IHNob3cgYW55dGhpbmcgeWV0LlxuICBcbiAgXHRcdEBjYWxsZWQgb24gaG9vayBgcGhvcnQucG9ydGZvbGlvLnByZXBhcmVgXG4gICAqL1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5wcmVwYXJlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG1hc29ucnlfc2V0dGluZ3M7XG4gICAgaWYgKHRoaXMuJGNvbnRhaW5lci5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy4kY29udGFpbmVyLmFkZENsYXNzKCdQUF9KU19fbG9hZGluZ19tYXNvbnJ5Jyk7XG4gICAgdGhpcy5tYXliZV9jcmVhdGVfc2l6ZXIoKTtcbiAgICBtYXNvbnJ5X3NldHRpbmdzID0gSG9va3MuYXBwbHlGaWx0ZXJzKCdwaG9ydC5tYXNvbnJ5LnNldHRpbmdzJywge1xuICAgICAgaXRlbVNlbGVjdG9yOiBcIi5cIiArIHRoaXMuRWxlbWVudHMuaXRlbSxcbiAgICAgIGNvbHVtbldpZHRoOiBcIi5cIiArIHRoaXMuRWxlbWVudHMuc2l6ZXIsXG4gICAgICBndXR0ZXI6IDAsXG4gICAgICBpbml0TGF5b3V0OiBmYWxzZVxuICAgIH0pO1xuICAgIHRoaXMuJGNvbnRhaW5lci5tYXNvbnJ5KG1hc29ucnlfc2V0dGluZ3MpO1xuICAgIHJldHVybiB0aGlzLiRjb250YWluZXIubWFzb25yeSgnb25jZScsICdsYXlvdXRDb21wbGV0ZScsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBfdGhpcy4kY29udGFpbmVyLnJlbW92ZUNsYXNzKCdQUF9KU19fbG9hZGluZ19tYXNvbnJ5JykuYWRkQ2xhc3MoJ1BQX0pTX19sb2FkaW5nX2NvbXBsZXRlJyk7XG4gICAgICAgIHJldHVybiBIb29rcy5kb0FjdGlvbigncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9O1xuXG5cbiAgLypcbiAgXHRcdFN0YXJ0IHRoZSBQb3J0Zm9saW9cbiAgXHRcdEBjYWxsZWQgb24gaG9vayBgcGhvcnQucG9ydGZvbGlvLmNyZWF0ZWBcbiAgICovXG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJGNvbnRhaW5lci5tYXNvbnJ5KCk7XG4gIH07XG5cblxuICAvKlxuICBcdFx0RGVzdHJveVxuICBcdFx0QGNhbGxlZCBvbiBob29rIGBwaG9ydC5wb3J0Zm9saW8uZGVzdHJveWBcbiAgICovXG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLm1heWJlX3JlbW92ZV9zaXplcigpO1xuICAgIGlmICh0aGlzLiRjb250YWluZXIubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy4kY29udGFpbmVyLm1hc29ucnkoJ2Rlc3Ryb3knKTtcbiAgICB9XG4gIH07XG5cblxuICAvKlxuICBcdFx0UmVsb2FkIHRoZSBsYXlvdXRcbiAgXHRcdEBjYWxsZWQgb24gaG9vayBgcGhvcnQucG9ydGZvbGlvLnJlZnJlc2hgXG4gICAqL1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuJGNvbnRhaW5lci5tYXNvbnJ5KCdsYXlvdXQnKTtcbiAgfTtcblxuXG4gIC8qXG4gIFx0XHRDcmVhdGUgYSBzaXplciBlbGVtZW50IGZvciBqcXVlcnktbWFzb25yeSB0byB1c2VcbiAgICovXG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLm1heWJlX2NyZWF0ZV9zaXplciA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnNpemVyX2RvZXNudF9leGlzdCgpKSB7XG4gICAgICB0aGlzLmNyZWF0ZV9zaXplcigpO1xuICAgIH1cbiAgfTtcblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUubWF5YmVfcmVtb3ZlX3NpemVyID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuJGNvbnRhaW5lci5sZW5ndGggIT09IDEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy4kY29udGFpbmVyLmZpbmQoXCIuXCIgKyB0aGlzLkVsZW1lbnRzLnNpemVyKS5yZW1vdmUoKTtcbiAgfTtcblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUuc2l6ZXJfZG9lc250X2V4aXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuJGNvbnRhaW5lci5maW5kKFwiLlwiICsgdGhpcy5FbGVtZW50cy5zaXplcikubGVuZ3RoID09PSAwO1xuICB9O1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5jcmVhdGVfc2l6ZXIgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRjb250YWluZXIuYXBwZW5kKFwiPGRpdiBjbGFzcz1cXFwiXCIgKyB0aGlzLkVsZW1lbnRzLnNpemVyICsgXCJcXFwiPjwvZGl2PlwiKTtcbiAgfTtcblxuICByZXR1cm4gUG9ydGZvbGlvX01hc29ucnk7XG5cbn0pKFBvcnRmb2xpb19JbnRlcmZhY2UpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBvcnRmb2xpb19NYXNvbnJ5O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lVRzl5ZEdadmJHbHZYMDFoYzI5dWNua3Vhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lKUWIzSjBabTlzYVc5ZlRXRnpiMjV5ZVM1amIyWm1aV1VpWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanRCUVVGQk96czdRVUZCUVN4SlFVRkJMR2RFUVVGQk8wVkJRVUU3T3pzN1FVRkhRU3hEUVVGQkxFZEJRVWtzVDBGQlFTeERRVUZUTEZGQlFWUTdPMEZCUTBvc1MwRkJRU3hIUVVGUkxFOUJRVUVzUTBGQlV5eFZRVUZVT3p0QlFVTlNMRzFDUVVGQkxFZEJRWE5DTEU5QlFVRXNRMEZCVXl4MVFrRkJWRHM3UVVGSGFFSTdPenRGUVVWUkxESkNRVUZCT3pzN096dEpRVVZhTEVsQlFVTXNRMEZCUVN4UlFVRkVMRWRCUTBNN1RVRkJRU3hUUVVGQkxFVkJRVmNzV1VGQldEdE5RVU5CTEV0QlFVRXNSVUZCVnl4dFFrRkVXRHROUVVWQkxFbEJRVUVzUlVGQlZ5eHJRa0ZHV0RzN1NVRkpSQ3hwUkVGQlFUdEZRVkJaT3pzN1FVRlRZanM3T3pzNFFrRkhRU3hWUVVGQkxFZEJRVmtzVTBGQlFUdFhRVU5ZTEVsQlFVTXNRMEZCUVN4VlFVRkVMRWRCUVdNc1EwRkJRU3hEUVVGSExFZEJRVUVzUjBGQlNTeEpRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRk5CUVdwQ08wVkJSRWc3T3p0QlFVZGFPenM3T3pzN096aENRVTFCTEU5QlFVRXNSMEZCVXl4VFFVRkJPMEZCUTFJc1VVRkJRVHRKUVVGQkxFbEJRVlVzU1VGQlF5eERRVUZCTEZWQlFWVXNRMEZCUXl4TlFVRmFMRXRCUVhOQ0xFTkJRV2hETzBGQlFVRXNZVUZCUVRzN1NVRkZRU3hKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEZGQlFWb3NRMEZCYzBJc2QwSkJRWFJDTzBsQlJVRXNTVUZCUXl4RFFVRkJMR3RDUVVGRUxFTkJRVUU3U1VGSFFTeG5Ra0ZCUVN4SFFVRnRRaXhMUVVGTExFTkJRVU1zV1VGQlRpeERRVUZ0UWl4M1FrRkJia0lzUlVGRGJFSTdUVUZCUVN4WlFVRkJMRVZCUVdNc1IwRkJRU3hIUVVGSkxFbEJRVU1zUTBGQlFTeFJRVUZSTEVOQlFVTXNTVUZCTlVJN1RVRkRRU3hYUVVGQkxFVkJRV01zUjBGQlFTeEhRVUZKTEVsQlFVTXNRMEZCUVN4UlFVRlJMRU5CUVVNc1MwRkVOVUk3VFVGRlFTeE5RVUZCTEVWQlFXTXNRMEZHWkR0TlFVZEJMRlZCUVVFc1JVRkJZeXhMUVVoa08wdEJSR3RDTzBsQlRXNUNMRWxCUVVNc1EwRkJRU3hWUVVGVkxFTkJRVU1zVDBGQldpeERRVUZ4UWl4blFrRkJja0k3VjBGRlFTeEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRTlCUVZvc1EwRkJiMElzVFVGQmNFSXNSVUZCTkVJc1owSkJRVFZDTEVWQlFUaERMRU5CUVVFc1UwRkJRU3hMUVVGQk8yRkJRVUVzVTBGQlFUdFJRVU0zUXl4TFFVRkRMRU5CUVVFc1ZVRkRRU3hEUVVGRExGZEJSRVlzUTBGRFpTeDNRa0ZFWml4RFFVVkRMRU5CUVVNc1VVRkdSaXhEUVVWWkxIbENRVVphTzJWQlRVRXNTMEZCU3l4RFFVRkRMRkZCUVU0c1EwRkJaU3g1UWtGQlpqdE5RVkEyUXp0SlFVRkJMRU5CUVVFc1EwRkJRU3hEUVVGQkxFbEJRVUVzUTBGQk9VTTdSVUZvUWxFN096dEJRVEJDVkRzN096czdPRUpCU1VFc1RVRkJRU3hIUVVGUkxGTkJRVUU3U1VGRFVDeEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRTlCUVZvc1EwRkJRVHRGUVVSUE96czdRVUZMVWpzN096czdPRUpCU1VFc1QwRkJRU3hIUVVGVExGTkJRVUU3U1VGRFVpeEpRVUZETEVOQlFVRXNhMEpCUVVRc1EwRkJRVHRKUVVWQkxFbEJRVWNzU1VGQlF5eERRVUZCTEZWQlFWVXNRMEZCUXl4TlFVRmFMRWRCUVhGQ0xFTkJRWGhDTzAxQlEwTXNTVUZCUXl4RFFVRkJMRlZCUVZVc1EwRkJReXhQUVVGYUxFTkJRWEZDTEZOQlFYSkNMRVZCUkVRN08wVkJTRkU3T3p0QlFWVlVPenM3T3pzNFFrRkpRU3hQUVVGQkxFZEJRVk1zVTBGQlFUdFhRVU5TTEVsQlFVTXNRMEZCUVN4VlFVRlZMRU5CUVVNc1QwRkJXaXhEUVVGeFFpeFJRVUZ5UWp0RlFVUlJPenM3UVVGTFZEczdPenM0UWtGSFFTeHJRa0ZCUVN4SFFVRnZRaXhUUVVGQk8wbEJRMjVDTEVsQlFXMUNMRWxCUVVNc1EwRkJRU3hyUWtGQlJDeERRVUZCTEVOQlFXNUNPMDFCUVVFc1NVRkJReXhEUVVGQkxGbEJRVVFzUTBGQlFTeEZRVUZCT3p0RlFVUnRRanM3T0VKQlNYQkNMR3RDUVVGQkxFZEJRVzlDTEZOQlFVRTdTVUZEYmtJc1NVRkJWU3hKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEUxQlFWb3NTMEZCZDBJc1EwRkJiRU03UVVGQlFTeGhRVUZCT3p0SlFVTkJMRWxCUVVNc1EwRkJRU3hWUVVGVkxFTkJRVU1zU1VGQldpeERRVUZyUWl4SFFVRkJMRWRCUVVrc1NVRkJReXhEUVVGQkxGRkJRVkVzUTBGQlF5eExRVUZvUXl4RFFVRjVReXhEUVVGRExFMUJRVEZETEVOQlFVRTdSVUZHYlVJN096aENRVXR3UWl4clFrRkJRU3hIUVVGdlFpeFRRVUZCTzFkQlFVY3NTVUZCUXl4RFFVRkJMRlZCUVZVc1EwRkJReXhKUVVGYUxFTkJRV3RDTEVkQlFVRXNSMEZCU1N4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExFdEJRV2hETEVOQlFYbERMRU5CUVVNc1RVRkJNVU1zUzBGQmIwUTdSVUZCZGtRN096aENRVWR3UWl4WlFVRkJMRWRCUVdNc1UwRkJRVHRKUVVOaUxFbEJRVU1zUTBGQlFTeFZRVUZWTEVOQlFVTXNUVUZCV2l4RFFVRnRRaXhsUVVGQkxFZEJRV2xDTEVsQlFVTXNRMEZCUVN4UlFVRlJMRU5CUVVNc1MwRkJNMElzUjBGQmFVTXNWMEZCY0VRN1JVRkVZVHM3T3p0SFFXaEhhVUk3TzBGQmNVZG9ReXhOUVVGTkxFTkJRVU1zVDBGQlVDeEhRVUZwUWlKOVxuIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgJCwgSG9va3MsIFBvcnRmb2xpbywgUG9ydGZvbGlvX0V2ZW50X01hbmFnZXIsIGlzX21hc29ucnksIG1heWJlX2xhenlfbWFzb25yeSwgc3RhcnRfbWFzb25yeTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuUG9ydGZvbGlvX0V2ZW50X01hbmFnZXIgPSByZXF1aXJlKCcuL1BvcnRmb2xpb19FdmVudF9NYW5hZ2VyJyk7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Qb3J0Zm9saW8gPSBuZXcgUG9ydGZvbGlvX0V2ZW50X01hbmFnZXIoKTtcblxuaXNfbWFzb25yeSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gJCgnLlBQX01hc29ucnknKS5sZW5ndGggIT09IDA7XG59O1xuXG5zdGFydF9tYXNvbnJ5ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBQb3J0Zm9saW9fTWFzb25yeTtcbiAgaWYgKCFpc19tYXNvbnJ5KCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgUG9ydGZvbGlvX01hc29ucnkgPSByZXF1aXJlKCcuL1BvcnRmb2xpb19NYXNvbnJ5Jyk7XG4gIHJldHVybiBuZXcgUG9ydGZvbGlvX01hc29ucnkoKTtcbn07XG5cbm1heWJlX2xhenlfbWFzb25yeSA9IGZ1bmN0aW9uKGhhbmRsZXIpIHtcbiAgaWYgKGlzX21hc29ucnkoKSkge1xuICAgIHJldHVybiByZXF1aXJlKCdsYXp5L0xhenlfTWFzb25yeScpO1xuICB9XG4gIHJldHVybiBoYW5kbGVyO1xufTtcblxuSG9va3MuYWRkQWN0aW9uKCdwaG9ydC5jb3JlLnJlYWR5JywgUG9ydGZvbGlvLnByZXBhcmUsIDUwKTtcblxuSG9va3MuYWRkQWN0aW9uKCdwaG9ydC5jb3JlLmxvYWRlZCcsIFBvcnRmb2xpby5jcmVhdGUsIDUwKTtcblxuSG9va3MuYWRkQWN0aW9uKCdwaG9ydC5jb3JlLnJlYWR5Jywgc3RhcnRfbWFzb25yeSk7XG5cbkhvb2tzLmFkZEZpbHRlcigncGhvcnQubGF6eS5oYW5kbGVyJywgbWF5YmVfbGF6eV9tYXNvbnJ5KTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYzNSaGNuUXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lKemRHRnlkQzVqYjJabVpXVWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqdEJRVUZCT3pzN1FVRkJRU3hKUVVGQk96dEJRVWRCTEV0QlFVRXNSMEZCVVN4UFFVRkJMRU5CUVZNc1ZVRkJWRHM3UVVGRFVpeDFRa0ZCUVN4SFFVRXdRaXhQUVVGQkxFTkJRVk1zTWtKQlFWUTdPMEZCUXpGQ0xFTkJRVUVzUjBGQlNTeFBRVUZCTEVOQlFWTXNVVUZCVkRzN1FVRkhTaXhUUVVGQkxFZEJRV2RDTEVsQlFVRXNkVUpCUVVFc1EwRkJRVHM3UVVGSGFFSXNWVUZCUVN4SFFVRmhMRk5CUVVFN1FVRkRXaXhUUVVGVExFTkJRVUVzUTBGQlJ5eGhRVUZJTEVOQlFXdENMRU5CUVVNc1RVRkJia0lzUzBGQkswSTdRVUZFTlVJN08wRkJTV0lzWVVGQlFTeEhRVUZuUWl4VFFVRkJPMEZCUTJZc1RVRkJRVHRGUVVGQkxFbEJRV2RDTEVOQlFVa3NWVUZCUVN4RFFVRkJMRU5CUVhCQ08wRkJRVUVzVjBGQlR5eE5RVUZRT3p0RlFVVkJMR2xDUVVGQkxFZEJRVzlDTEU5QlFVRXNRMEZCVXl4eFFrRkJWRHRUUVVOb1FpeEpRVUZCTEdsQ1FVRkJMRU5CUVVFN1FVRktWenM3UVVGTmFFSXNhMEpCUVVFc1IwRkJjVUlzVTBGQlJTeFBRVUZHTzBWQlJYQkNMRWxCUVhsRExGVkJRVUVzUTBGQlFTeERRVUY2UXp0QlFVRkJMRmRCUVU4c1QwRkJRU3hEUVVGVExHMUNRVUZVTEVWQlFWQTdPMEZCUTBFc1UwRkJUenRCUVVoaE96dEJRVTl5UWl4TFFVRkxMRU5CUVVNc1UwRkJUaXhEUVVGblFpeHJRa0ZCYUVJc1JVRkJiME1zVTBGQlV5eERRVUZETEU5QlFUbERMRVZCUVhWRUxFVkJRWFpFT3p0QlFVTkJMRXRCUVVzc1EwRkJReXhUUVVGT0xFTkJRV2RDTEcxQ1FVRm9RaXhGUVVGeFF5eFRRVUZUTEVOQlFVTXNUVUZCTDBNc1JVRkJkVVFzUlVGQmRrUTdPMEZCUjBFc1MwRkJTeXhEUVVGRExGTkJRVTRzUTBGQlowSXNhMEpCUVdoQ0xFVkJRVzlETEdGQlFYQkRPenRCUVVkQkxFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMRzlDUVVGb1FpeEZRVUZ6UXl4clFrRkJkRU1pZlE9PVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
