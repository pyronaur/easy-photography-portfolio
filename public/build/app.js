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
var $, Gallery, Hooks, Item_Data;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Item_Data = require('../lazy/Item_Data');

Gallery = function($items) {
  var defaults, gallery_data, settings, single_item_data;
  defaults = {
    dynamic: true,
    speed: 350,
    preload: 3,
    download: false,
    thumbnail: true,
    showThumbByDefault: true
  };
  settings = _.defaults(window.__phort.lightGallery, defaults);
  console.log(settings);
  single_item_data = function($item) {
    var data, full;
    data = new Item_Data($item);
    if (data.get_type() === 'video') {
      full = data.get_or_false('video_url');
    } else {
      full = data.get_url('full');
    }
    return {
      src: full,
      thumb: data.get_url('thumb')
    };
  };
  gallery_data = function() {
    return $items.map(function() {
      return single_item_data($(this));
    });
  };
  return {
    open: function(index) {
      settings.index = index;
      settings.dynamicEl = gallery_data();
      settings.videoMaxWidth = $(window).width() * 0.8;
      settings = Hooks.applyFilters('phort.lightGallery.settings', settings);
      return $(document).lightGallery(settings);
    }
  };
};

Hooks.addAction('phort.core.ready', function() {
  if ($('.PP_Popup--lightgallery').length === 0) {
    return false;
  }
  return $(document).on('click', '.PP_Popup--lightgallery .PP_Gallery__item', function(e) {
    var $el, $items, index;
    e.preventDefault();
    $el = $(this);
    $items = $el.closest('.PP_Gallery').find('.PP_Gallery__item');
    index = $items.index($el);
    return Gallery($items).open(index);
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
    item.$el.removeClass(this.Elements.item).find("." + this.Elements.placeholder).fadeOut(400, function() {
      return $(this).remove();
    });
    return Hooks.doAction('phort.lazy.loaded_item', item);
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
var $, Abstract_Lazy_Loader, Hooks, Lazy_Masonry, __WINDOW,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

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
    Lazy_Masonry.__super__.cleanup_after_load.call(this, item);
    Hooks.doAction('phort.portfolio.refresh');
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


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jb3JlL1Bob3RvZ3JhcGh5X1BvcnRmb2xpby5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY29yZS9XaW5kb3cuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvcG9wdXAuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvQWJzdHJhY3RfTGF6eV9Mb2FkZXIuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvSXRlbV9EYXRhLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0xhenlfTWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvbGF6eS9zdGFydC5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL1BvcnRmb2xpb19FdmVudF9NYW5hZ2VyLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9wb3J0Zm9saW8vUG9ydGZvbGlvX0ludGVyZmFjZS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL1BvcnRmb2xpb19NYXNvbnJ5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9wb3J0Zm9saW8vc3RhcnQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTs7O0FBQUEsSUFBQTs7QUFHQSxLQUFBLEdBQVEsT0FBQSxDQUFTLFVBQVQ7O0FBQ1IsQ0FBQSxHQUFJLE9BQUEsQ0FBUyxRQUFUOztBQUlKLE1BQU0sQ0FBQyxVQUFQLEdBRUM7RUFBQSxtQkFBQSxFQUFxQixPQUFBLENBQVMsaUNBQVQsQ0FBckI7RUFHQSxTQUFBLEVBQVcsT0FBQSxDQUFTLGtCQUFULENBSFg7RUFNQSxvQkFBQSxFQUFzQixP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LFVBQVUsQ0FBQyxNQUFaLENBQW1CLGVBQUEsR0FBaUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxLQUEzQixHQUFpQyxXQUFwRDtFQURhOzs7O0dBaEdpQjs7QUFxR2hDLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7Ozs7OztBQzdHakI7OztBQUFBLElBQUE7O0FBR0EsS0FBQSxHQUFRLE9BQUEsQ0FBUyxVQUFUOztBQUNSLHVCQUFBLEdBQTBCLE9BQUEsQ0FBUywyQkFBVDs7QUFDMUIsQ0FBQSxHQUFJLE9BQUEsQ0FBUyxRQUFUOztBQUdKLFNBQUEsR0FBWSxJQUFJLHVCQUFKLENBQUE7O0FBR1osVUFBQSxHQUFhLFNBQUE7QUFDWixTQUFTLENBQUEsQ0FBRyxhQUFILENBQWtCLENBQUMsTUFBbkIsS0FBK0I7QUFENUI7O0FBSWIsYUFBQSxHQUFnQixTQUFBO0FBQ2YsTUFBQTtFQUFBLElBQWdCLENBQUksVUFBQSxDQUFBLENBQXBCO0FBQUEsV0FBTyxNQUFQOztFQUVBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUyxxQkFBVDtTQUNwQixJQUFJLGlCQUFKLENBQUE7QUFKZTs7QUFNaEIsa0JBQUEsR0FBcUIsU0FBRSxPQUFGO0VBRXBCLElBQXlDLFVBQUEsQ0FBQSxDQUF6QztBQUFBLFdBQU8sT0FBQSxDQUFTLG1CQUFULEVBQVA7O0FBQ0EsU0FBTztBQUhhOztBQU9yQixLQUFLLENBQUMsU0FBTixDQUFnQixrQkFBaEIsRUFBb0MsU0FBUyxDQUFDLE9BQTlDLEVBQXVELEVBQXZEOztBQUNBLEtBQUssQ0FBQyxTQUFOLENBQWdCLG1CQUFoQixFQUFxQyxTQUFTLENBQUMsTUFBL0MsRUFBdUQsRUFBdkQ7O0FBR0EsS0FBSyxDQUFDLFNBQU4sQ0FBZ0Isa0JBQWhCLEVBQW9DLGFBQXBDOztBQUdBLEtBQUssQ0FBQyxTQUFOLENBQWdCLG9CQUFoQixFQUFzQyxrQkFBdEMiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIjIyNcbiAgICBMb2FkIERlcGVuZGVuY2llc1xuIyMjXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG4kID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuXG5cbiMgRXhwb3NlIHNvbWUgUGhvdG9ncmFwaHkgUG9ydGZvbGlvIG1vZHVsZXMgdG8gdGhlIHB1YmxpYyBmb3IgZXh0ZW5zaWJpbGl0eVxud2luZG93LlBQX01vZHVsZXMgPVxuXHQjIEV4dGVuZCBQb3J0Zm9saW8gSW50ZXJmYWNlIHRvIGJ1aWxkIGN1c3RvbSBwb3J0Zm9saW8gbGF5b3V0cyBiYXNlZCBvbiBQUCBFdmVudHNcblx0UG9ydGZvbGlvX0ludGVyZmFjZTogcmVxdWlyZSggJy4vcG9ydGZvbGlvL1BvcnRmb2xpb19JbnRlcmZhY2UnIClcblxuXHQjIFVzZSBgSXRlbV9EYXRhYCB0byBnZXQgZm9ybWF0dGVkIGl0ZW0gaW1hZ2Ugc2l6ZXMgZm9yIGxhenkgbGFvZGluZ1xuXHRJdGVtX0RhdGE6IHJlcXVpcmUoICcuL2xhenkvSXRlbV9EYXRhJyApXG5cblx0IyBFeHRlbmQgQWJzdHJhY3RfTGF6eV9Mb2RlciB0byBpbXBsZW1lbnQgbGF6eSBsb2FkZXIgZm9yIHlvdXIgbGF5b3V0XG5cdEFic3RyYWN0X0xhenlfTG9hZGVyOiByZXF1aXJlKCAnLi9sYXp5L0Fic3RyYWN0X0xhenlfTG9hZGVyJyApXG5cbiMjI1xuXHRJbmNsdWRlc1xuIyMjXG5cbiMgU3RhcnQgUG9ydGZvbGlvXG5yZXF1aXJlICcuL3BvcnRmb2xpby9zdGFydCdcblxuIyBHYWxsZXJ5XG5yZXF1aXJlICcuL2dhbGxlcnkvcG9wdXAnXG5cbiMgTGF6eSBMb2FkaW5nXG5yZXF1aXJlICcuL2xhenkvc3RhcnQnXG5cblxuXG5cbiMjI1xuXHRCb290IG9uIGBkb2N1bWVudC5yZWFkeWBcbiMjI1xuJCggZG9jdW1lbnQgKS5yZWFkeSAtPlxuXG5cdCMgT25seSBydW4gdGhpcyBzY3JpcHQgd2hlbiBib2R5IGhhcyBgUFBfUG9ydGZvbGlvYCBjbGFzc1xuXHRyZXR1cm4gaWYgbm90ICQoICdib2R5JyApLmhhc0NsYXNzKCAnUFBfUG9ydGZvbGlvJyApXG5cblx0IyBCb290XG5cdFBob3RvZ3JhcGh5X1BvcnRmb2xpbyA9IG5ldyAoIHJlcXVpcmUoICcuL2NvcmUvUGhvdG9ncmFwaHlfUG9ydGZvbGlvJyApICkoKVxuXHRQaG90b2dyYXBoeV9Qb3J0Zm9saW8ucmVhZHkoKVxuXG5cdHJldHVybiIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuXG5cbmNsYXNzIENvcmVcblxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LmNvcmUucmVhZHknLCBAd2FpdF9mb3JfbG9hZFxuXG5cdCMgVHJpZ2dlciBwaG9ydC5jb3JlLnJlYWR5XG5cdHJlYWR5OiA9PlxuXHRcdGlmIEhvb2tzLmFwcGx5RmlsdGVycyggJ3Bob3J0LmNvcmUucmVhZHknLCB0cnVlIClcblx0XHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5jb3JlLnJlYWR5J1xuXHRcdHJldHVyblxuXG5cdHdhaXRfZm9yX2xvYWQ6ID0+XG5cdFx0IyBUcmlnZ2VyIGltYWdlc0xvYWRlZCBldmVudCB3aGVuIGltYWdlcyBoYXZlIGxvYWRlZFxuXHRcdCQoICcuUFBfV3JhcHBlcicgKS5pbWFnZXNMb2FkZWQoIEBsb2FkZWQgKVxuXG5cdCMgVHJpZ2dlciBwaG9ydC5jb3JlLmxvYWRlZFxuXHRsb2FkZWQ6IC0+XG5cdFx0aWYgSG9va3MuYXBwbHlGaWx0ZXJzKCAncGhvcnQuY29yZS5sb2FkZWQnLCB0cnVlIClcblx0XHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5jb3JlLmxvYWRlZCdcblxuXHRcdHJldHVyblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQ29yZSIsIkhvb2tzID0gcmVxdWlyZSggJ3dwX2hvb2tzJyApXG5cblxuZ2V0X3NpemUgPSAtPlxuXHR3aWR0aCA6IHdpbmRvdy5pbm5lcldpZHRoIHx8ICR3aW5kb3cud2lkdGgoKVxuXHRoZWlnaHQ6IHdpbmRvdy5pbm5lckhlaWdodCB8fCAkd2luZG93LmhlaWdodCgpXG5cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRfc2l6ZSgpIiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCBcImpRdWVyeVwiIClcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcbkl0ZW1fRGF0YSA9IHJlcXVpcmUoICcuLi9sYXp5L0l0ZW1fRGF0YScgKVxuXG5cbkdhbGxlcnkgPSAoICRpdGVtcyApIC0+XG5cblx0ZGVmYXVsdHMgPVxuXHRcdGR5bmFtaWMgOiB0cnVlXG5cdFx0c3BlZWQgICA6IDM1MFxuXHRcdHByZWxvYWQgOiAzXG5cdFx0ZG93bmxvYWQ6IGZhbHNlXG5cblx0XHR0aHVtYm5haWwgICAgICAgICA6IHRydWVcblx0XHRzaG93VGh1bWJCeURlZmF1bHQ6IHRydWVcblxuXHRzZXR0aW5ncyA9IF8uZGVmYXVsdHMoIHdpbmRvdy5fX3Bob3J0LmxpZ2h0R2FsbGVyeSwgZGVmYXVsdHMgKVxuXG5cdGNvbnNvbGUubG9nIHNldHRpbmdzXG5cblx0c2luZ2xlX2l0ZW1fZGF0YSA9ICggJGl0ZW0gKSAtPlxuXHRcdGRhdGEgPSBuZXcgSXRlbV9EYXRhKCAkaXRlbSApXG5cblx0XHRpZiBkYXRhLmdldF90eXBlKCApIGlzICd2aWRlbydcblx0XHRcdGZ1bGwgPSBkYXRhLmdldF9vcl9mYWxzZSggJ3ZpZGVvX3VybCcgKVxuXHRcdGVsc2Vcblx0XHRcdGZ1bGwgPSBkYXRhLmdldF91cmwoICdmdWxsJyApXG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0c3JjICA6IGZ1bGxcblx0XHRcdHRodW1iOiBkYXRhLmdldF91cmwoICd0aHVtYicgKVxuXHRcdH1cblxuXHRnYWxsZXJ5X2RhdGEgPSAtPlxuXHRcdCRpdGVtcy5tYXAgLT4gc2luZ2xlX2l0ZW1fZGF0YSggJCggdGhpcyApIClcblxuXHRvcGVuOiAoIGluZGV4ICkgLT5cblxuXHRcdHNldHRpbmdzLmluZGV4ID0gaW5kZXhcblx0XHRzZXR0aW5ncy5keW5hbWljRWwgPSBnYWxsZXJ5X2RhdGEoIClcblx0XHRzZXR0aW5ncy52aWRlb01heFdpZHRoID0gJCggd2luZG93ICkud2lkdGgoICkgKiAwLjhcblxuXHRcdHNldHRpbmdzID0gSG9va3MuYXBwbHlGaWx0ZXJzICdwaG9ydC5saWdodEdhbGxlcnkuc2V0dGluZ3MnLCBzZXR0aW5nc1xuXG5cdFx0JCggZG9jdW1lbnQgKS5saWdodEdhbGxlcnkoIHNldHRpbmdzIClcblxuXG5Ib29rcy5hZGRBY3Rpb24gJ3Bob3J0LmNvcmUucmVhZHknLCAtPlxuXG5cdCMgT25seSBlbmFibGUgalF1ZXJ5IGxpZ2h0R2FsbGVyeSBpZiB0aGUgcG9wdXAgZ2FsbGVyeSBjbGFzcyBpcyBmb3VuZFxuXHRpZiAkKCAnLlBQX1BvcHVwLS1saWdodGdhbGxlcnknICkubGVuZ3RoIGlzIDBcblx0XHRyZXR1cm4gZmFsc2VcblxuXHQkKCBkb2N1bWVudCApLm9uICdjbGljaycsICcuUFBfUG9wdXAtLWxpZ2h0Z2FsbGVyeSAuUFBfR2FsbGVyeV9faXRlbScsICggZSApIC0+XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCggKVxuXG5cdFx0JGVsID0gJCggdGhpcyApXG5cdFx0JGl0ZW1zID0gJGVsLmNsb3Nlc3QoICcuUFBfR2FsbGVyeScgKS5maW5kKCAnLlBQX0dhbGxlcnlfX2l0ZW0nIClcblx0XHRpbmRleCA9ICRpdGVtcy5pbmRleCggJGVsIClcblxuXHRcdEdhbGxlcnkoICRpdGVtcyApLm9wZW4oIGluZGV4IClcblxuIiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5JdGVtX0RhdGEgPSByZXF1aXJlKCAnLi9JdGVtX0RhdGEnIClcbl9fV0lORE9XID0gcmVxdWlyZSggJy4uL2NvcmUvV2luZG93JyApXG5cbmNsYXNzIEFic3RyYWN0X0xhenlfTG9hZGVyXG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdEBFbGVtZW50cyA9XG5cdFx0XHRpdGVtICAgICAgIDogJ1BQX0xhenlfSW1hZ2UnXG5cdFx0XHRwbGFjZWhvbGRlcjogJ1BQX0xhenlfSW1hZ2VfX3BsYWNlaG9sZGVyJ1xuXHRcdFx0bGluayAgICAgICA6ICdQUF9KU19MYXp5X19saW5rJ1xuXHRcdFx0aW1hZ2UgICAgICA6ICdQUF9KU19MYXp5X19pbWFnZSdcblxuXHRcdEBJdGVtcyA9IFtdXG5cblx0XHQjIEFkanVzdGFibGUgU2Vuc2l0aXZpdHkgZm9yIEBpbl92aWV3IGZ1bmN0aW9uXG5cdFx0IyBWYWx1ZSBpbiBwaXhlbHNcblx0XHRAU2Vuc2l0aXZpdHkgPSAxMDBcblxuXHRcdCMgQXV0by1zZXR1cCB3aGVuIGV2ZW50cyBhcmUgYXR0YWNoZWRcblx0XHQjIEF1dG8tZGVzdHJveSB3aGVuIGV2ZW50cyBhcmUgZGV0YWNoZWRcblx0XHRAdGhyb3R0bGVkX2F1dG9sb2FkID0gbnVsbFxuXG5cdFx0QHNldHVwX2l0ZW1zKClcblx0XHRAcmVzaXplX2FsbCgpXG5cdFx0QGF0dGFjaF9ldmVudHMoKVxuXG5cdCMjI1xuXHRcdEFic3RyYWN0IE1ldGhvZHNcblx0IyMjXG5cblx0IyBUaGlzIGlzIHJ1biB3aGVuIGEgcmVzaXplIG9yIHJlZnJlc2ggZXZlbnQgaXMgZGV0ZWN0ZWRcblx0cmVzaXplOiAtPiByZXR1cm5cblxuXHRsb2FkOiAoIGl0ZW0gKSAtPlxuXHRcdEBsb2FkX2ltYWdlKCBpdGVtIClcblx0XHRpdGVtLiRlbC5pbWFnZXNMb2FkZWQgPT5cblx0XHRcdEBjbGVhbnVwX2FmdGVyX2xvYWQoIGl0ZW0gKVxuXG5cdGxvYWRfaW1hZ2U6ICggaXRlbSApIC0+XG5cblx0XHQjIEdldCBpbWFnZSBVUkxzXG5cdFx0dGh1bWIgPSBpdGVtLmRhdGEuZ2V0X3VybCggJ3RodW1iJyApXG5cdFx0ZnVsbCA9IGl0ZW0uZGF0YS5nZXRfdXJsKCAnZnVsbCcgKVxuXG5cdFx0IyBDcmVhdGUgZWxlbWVudHNcblx0XHRpdGVtLiRlbFxuXHRcdFx0LnByZXBlbmQoIEBnZXRfaXRlbV9odG1sKCB0aHVtYiwgZnVsbCApIClcblx0XHRcdC5yZW1vdmVDbGFzcyggJ0xhenktSW1hZ2UnIClcblxuXHRcdCMgTWFrZSBzdXJlIHRoaXMgaW1hZ2UgaXNuJ3QgbG9hZGVkIGFnYWluXG5cdFx0aXRlbS5sb2FkZWQgPSB0cnVlXG5cblx0Y2xlYW51cF9hZnRlcl9sb2FkOiAoIGl0ZW0gKSAtPlxuXHRcdCMgQWRkIGltYWdlIFBQX0pTX2xvYWRlZCBjbGFzc1xuXHRcdGl0ZW0uJGVsLmZpbmQoICdpbWcnICkuYWRkQ2xhc3MoICdQUF9KU19fbG9hZGVkJyApLnJlbW92ZUNsYXNzKCAnUFBfSlNfX2xvYWRpbmcnIClcblxuXHRcdGl0ZW0uJGVsXG5cblx0XHRcdCMgUmVtb3ZlIGBQUF9MYXp5X0ltYWdlYCwgYXMgdGhpcyBpcyBub3QgYSBsYXp5LWxvYWRhYmxlIGltYWdlIGFueW1vcmVcblx0XHRcdC5yZW1vdmVDbGFzcyggQEVsZW1lbnRzLml0ZW0gKVxuXG5cdFx0XHQjIFJlbW92ZSBQbGFjZWhvbGRlclxuXHRcdFx0LmZpbmQoIFwiLiN7QEVsZW1lbnRzLnBsYWNlaG9sZGVyfVwiIClcblx0XHRcdC5mYWRlT3V0KCA0MDAsIC0+ICQoIHRoaXMgKS5yZW1vdmUoKSApXG5cblx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQubGF6eS5sb2FkZWRfaXRlbScsIGl0ZW1cblxuXG5cdGdldF9pdGVtX2h0bWw6ICggdGh1bWIsIGZ1bGwgKSAtPlxuXG5cdFx0aWYgJ2Rpc2FibGUnIGlzIHdpbmRvdy5fX3Bob3J0LnBvcHVwX2dhbGxlcnlcblx0XHRcdHJldHVybiBcIlwiXCJcblx0XHRcdDxkaXYgY2xhc3M9XCIje0BFbGVtZW50cy5saW5rfVwiIHJlbD1cImdhbGxlcnlcIj5cblx0XHRcdFx0PGltZyBjbGFzcz1cIiN7QEVsZW1lbnRzLmltYWdlfVwiIHNyYz1cIiN7dGh1bWJ9XCIgY2xhc3M9XCJQUF9KU19fbG9hZGluZ1wiIC8+XG5cdFx0XHQ8L2Rpdj5cblx0XHRcdFwiXCJcIlxuXHRcdGVsc2Vcblx0XHRcdHJldHVybiBcIlwiXCJcblx0XHRcdDxhIGNsYXNzPVwiI3tARWxlbWVudHMubGlua31cIiBocmVmPVwiI3tmdWxsfVwiIHJlbD1cImdhbGxlcnlcIj5cblx0XHRcdFx0PGltZyBjbGFzcz1cIiN7QEVsZW1lbnRzLmltYWdlfVwiIHNyYz1cIiN7dGh1bWJ9XCIgY2xhc3M9XCJQUF9KU19fbG9hZGluZ1wiIC8+XG5cdFx0XHQ8L2E+XG5cdFx0XHRcIlwiXCJcblxuXHRzZXR1cF9pdGVtczogPT5cblx0XHQjIENsZWFyIGV4aXN0aW5nIGl0ZW1zLCBpZiBhbnlcblx0XHRASXRlbXMgPSBbXVxuXG5cdFx0IyBMb29wIG92ZXIgRE9NIGFuZCBhZGQgZWFjaCBpdGVtIHRvIEBJdGVtc1xuXHRcdCQoIFwiLiN7QEVsZW1lbnRzLml0ZW19XCIgKS5lYWNoKCBAYWRkX2l0ZW0gKVxuXHRcdHJldHVyblxuXG5cdGFkZF9pdGVtOiAoIGtleSwgZWwgKSA9PlxuXHRcdCRlbCA9ICQoIGVsIClcblx0XHRASXRlbXMucHVzaFxuXHRcdFx0ZWwgICAgOiBlbFxuXHRcdFx0JGVsICAgOiAkZWxcblx0XHRcdGRhdGEgIDogbmV3IEl0ZW1fRGF0YSggJGVsIClcblx0XHRcdGxvYWRlZDogZmFsc2VcblxuXG5cdFx0cmV0dXJuXG5cblxuXHQjIyNcblx0XHRNZXRob2RzXG5cdCMjI1xuXHRyZXNpemVfYWxsOiAtPlxuXHRcdEByZXNpemUoIGl0ZW0gKSBmb3IgaXRlbSBpbiBASXRlbXNcblxuXG5cblx0IyBBdXRvbWF0aWNhbGx5IExvYWQgYWxsIGl0ZW1zIHRoYXQgYXJlIGBpbl9sb29zZV92aWV3YFxuXHRhdXRvbG9hZDogPT5cblx0XHRmb3IgaXRlbSwga2V5IGluIEBJdGVtc1xuXHRcdFx0aWYgbm90IGl0ZW0ubG9hZGVkIGFuZCBAaW5fbG9vc2VfdmlldyggaXRlbS5lbCApXG5cdFx0XHRcdEBsb2FkKCBpdGVtIClcblxuXHRpbl9sb29zZV92aWV3OiAoIGVsICkgLT5cblx0XHRyZXR1cm4gdHJ1ZSBpZiBub3QgZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0P1xuXHRcdHJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuXG5cdFx0IyBFbGVtZW50cyBub3QgaW4gdmlldyBpZiB0aGV5IGRvbid0IGhhdmUgZGltZW5zaW9uc1xuXHRcdHJldHVybiBmYWxzZSBpZiByZWN0LmhlaWdodCBpcyAwIGFuZCByZWN0LndpZHRoIGlzIDBcblxuXG5cdFx0cmV0dXJuIChcblx0XHRcdCMgWSBBeGlzXG5cdFx0XHRyZWN0LnRvcCArIHJlY3QuaGVpZ2h0ID49IC1AU2Vuc2l0aXZpdHkgYW5kICMgdG9wXG5cdFx0XHRyZWN0LmJvdHRvbSAtIHJlY3QuaGVpZ2h0IDw9IF9fV0lORE9XLmhlaWdodCArIEBTZW5zaXRpdml0eSBhbmRcblxuXHRcdFx0IyBYIEF4aXNcblx0XHRcdHJlY3QubGVmdCArIHJlY3Qud2lkdGggPj0gLUBTZW5zaXRpdml0eSBhbmRcblx0XHRcdHJlY3QucmlnaHQgLSByZWN0LndpZHRoIDw9IF9fV0lORE9XLndpZHRoICsgQFNlbnNpdGl2aXR5XG5cblx0XHQpXG5cblx0ZGVzdHJveTogLT5cblx0XHRAZGV0YWNoX2V2ZW50cygpXG5cblx0YXR0YWNoX2V2ZW50czogLT5cblx0XHQjIENyZWF0ZSBhIGRlYm91bmNlZCBgYXV0b2xvYWRgIGZ1bmN0aW9uXG5cdFx0QHRocm90dGxlZF9hdXRvbG9hZCA9IF8udGhyb3R0bGUoIEBhdXRvbG9hZCwgNTAgKVxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCBAdGhyb3R0bGVkX2F1dG9sb2FkLCAxMDBcblxuXG5cdGRldGFjaF9ldmVudHM6IC0+XG5cdFx0IyBDbGVhciB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uIGZyb20gaW5zdGFuY2Vcblx0XHRAdGhyb3R0bGVkX2F1dG9sb2FkID0gbnVsbFxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCBAdGhyb3R0bGVkX2F1dG9sb2FkLCAxMDBcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQWJzdHJhY3RfTGF6eV9Mb2FkZXJcbiIsImNsYXNzIEl0ZW1fRGF0YVxuXG5cdGNvbnN0cnVjdG9yOiAoICRlbCApIC0+XG5cdFx0QCRlbCA9ICRlbFxuXHRcdGRhdGEgPSAkZWwuZGF0YSggJ2l0ZW0nIClcblxuXHRcdGlmIG5vdCBkYXRhXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IgXCJFbGVtZW50IGRvZXNuJ3QgY29udGFpbiBgZGF0YS1pdGVtYCBhdHRyaWJ1dGVcIlxuXG5cdFx0QGRhdGEgPSBkYXRhXG5cblxuXG5cdGdldF9kYXRhOiAoIG5hbWUgKSAtPlxuXHRcdGltYWdlID0gQGRhdGFbICdpbWFnZXMnIF1bIG5hbWUgXVxuXHRcdHJldHVybiBmYWxzZSBpZiBub3QgaW1hZ2VcblxuXHRcdHJldHVybiBpbWFnZVxuXG5cdGdldF9zaXplOiAoIG5hbWUgKSAtPlxuXHRcdGltYWdlID0gQGdldF9kYXRhKCBuYW1lIClcblx0XHRyZXR1cm4gZmFsc2UgaWYgbm90IGltYWdlXG5cblx0XHRzaXplID0gaW1hZ2VbICdzaXplJyBdXG5cblx0XHRbd2lkdGgsIGhlaWdodF0gPSBzaXplLnNwbGl0KCAneCcgKVxuXG5cdFx0d2lkdGggPSBwYXJzZUludCggd2lkdGggKVxuXHRcdGhlaWdodCA9IHBhcnNlSW50KCBoZWlnaHQgKVxuXG5cdFx0cmV0dXJuIFt3aWR0aCwgaGVpZ2h0XVxuXG5cdGdldF91cmw6ICggbmFtZSApIC0+XG5cdFx0aW1hZ2UgPSBAZ2V0X2RhdGEoIG5hbWUgKVxuXHRcdHJldHVybiBmYWxzZSBpZiBub3QgaW1hZ2Vcblx0XHRyZXR1cm4gaW1hZ2VbICd1cmwnIF1cblxuXHRnZXRfb3JfZmFsc2U6ICgga2V5ICkgLT5cblx0XHRpZiBAZGF0YVsga2V5IF1cblx0XHRcdHJldHVybiBAZGF0YVsga2V5IF1cblx0XHRyZXR1cm4gZmFsc2VcblxuXHRnZXRfcmF0aW8gICA6IC0+IEBnZXRfb3JfZmFsc2UoICdyYXRpbycgKVxuXHRnZXRfdHlwZSAgICA6IC0+IEBnZXRfb3JfZmFsc2UoICd0eXBlJyApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBJdGVtX0RhdGFcbiIsIiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5BYnN0cmFjdF9MYXp5X0xvYWRlciA9IHJlcXVpcmUoICcuL0Fic3RyYWN0X0xhenlfTG9hZGVyJyApXG5fX1dJTkRPVyA9IHJlcXVpcmUoICcuLi9jb3JlL1dpbmRvdycgKVxuXG5jbGFzcyBMYXp5X01hc29ucnkgZXh0ZW5kcyBBYnN0cmFjdF9MYXp5X0xvYWRlclxuXG5cdHJlc2l6ZV9hbGw6IC0+XG5cdFx0QHBsYWNlaG9sZGVyX3dpZHRoID0gJCggJy5QUF9NYXNvbnJ5X19zaXplcicgKS53aWR0aCgpXG5cdFx0c3VwZXIoKVxuXG5cdHJlc2l6ZTogKCBpdGVtICkgLT5cblx0XHRpdGVtLiRlbC5jc3MgJ21pbi1oZWlnaHQnOiBNYXRoLmZsb29yKCBAcGxhY2Vob2xkZXJfd2lkdGggLyBpdGVtLmRhdGEuZ2V0X3JhdGlvKCkgKVxuXG5cdGNsZWFudXBfYWZ0ZXJfbG9hZDogKGl0ZW0pIC0+XG5cdFx0IyBSZW1vdmUgbWluLWhlaWdodFxuXHRcdGl0ZW0uJGVsLmNzcyggJ21pbi1oZWlnaHQnLCAnJyApXG5cblx0XHQjIFJ1biBhbGwgb3RoZXIgY2xlYW51cHNcblx0XHRzdXBlciggaXRlbSApXG5cblx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnXG5cblx0XHRyZXR1cm5cblxuXHRhdHRhY2hfZXZlbnRzOiAtPlxuXHRcdCMgQ2FsbCBQYXJlbnQgZmlyc3QsIGl0J3MgZ29pbmcgdG8gY3JlYXRlIEB0aHJvdHRsZWRfYXV0b2xvYWRcblx0XHRzdXBlcigpXG5cblx0XHQjIEF0dGFjaFxuXHRcdCQoIHdpbmRvdyApLm9uICdzY3JvbGwnLCBAdGhyb3R0bGVkX2F1dG9sb2FkXG5cblxuXG5cdGRldGFjaF9ldmVudHM6IC0+XG5cdFx0IyBEZXRhY2hcblx0XHQkKCB3aW5kb3cgKS5vZmYgJ3Njcm9sbCcsIEB0aHJvdHRsZWRfYXV0b2xvYWRcblxuXHRcdCMgQ2FsbCBwYXJlbnQgbGFzdCwgaXQncyBnb2luZyB0byBjbGVhbiB1cCBAdGhyb3R0bGVkX2F1dG9sb2FkXG5cdFx0c3VwZXIoKVxuXG5cdGRlc3Ryb3k6IC0+XG5cdFx0Zm9yIGl0ZW0sIGtleSBpbiBASXRlbXNcblx0XHRcdGl0ZW0uJGVsLmNzcyAnbWluLWhlaWdodCcsICcnXG5cdFx0c3VwZXIoKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gTGF6eV9NYXNvbnJ5XG4iLCIkID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuXG5cbmluc3RhbmNlID0gZmFsc2VcblxuZGVzdHJveSA9IC0+XG5cdHJldHVybiBpZiBub3QgaW5zdGFuY2Vcblx0aW5zdGFuY2UuZGVzdHJveSgpXG5cdGluc3RhbmNlID0gbnVsbFxuXG5jcmVhdGUgPSAtPlxuXG5cdCMgTWFrZSBzdXJlIGFuIGluc3RhbmNlIGRvZXNuJ3QgYWxyZWFkeSBleGlzdFxuXHRkZXN0cm95KClcblxuXHQjIEhhbmRsZXIgcmVxdWlyZWRcblx0SGFuZGxlciA9IEhvb2tzLmFwcGx5RmlsdGVycyAncGhvcnQubGF6eS5oYW5kbGVyJywgZmFsc2Vcblx0cmV0dXJuIGlmIG5vdCBIYW5kbGVyXG5cblx0IyBCeSBkZWZhdWx0IExhenlfTWFzb25yeSBpcyBoYW5kbGluZyBMYXp5LUxvYWRpbmdcblx0IyBDaGVjayBpZiBhbnlvbmUgd2FudHMgdG8gaGlqYWNrIGhhbmRsZXJcblx0aW5zdGFuY2UgPSBuZXcgSGFuZGxlcigpXG5cblx0cmV0dXJuXG5cblxuIyBJbml0aWFsaXplIGxhenkgbG9hZGVyIGFmdGVyIHRoZSBwb3J0Zm9saW8gaXMgcHJlcGFyZWQsIHAgPSAxMDBcbkhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnLCBjcmVhdGUsIDEwMFxuSG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScsIGRlc3Ryb3kiLCJIb29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5cbiMjI1xuXG4gICAgIyBJbml0aWFsaXplIFBvcnRmb2xpbyBDb3JlXG5cdC0tLVxuXHRcdFVzaW5nIHA1MCBAIGBwaG9ydC5jb3JlLnJlYWR5YFxuXHRcdExhdGUgcHJpb3JpdHkgaXMgZ29pbmcgdG8gZm9yY2UgZXhwbGljaXQgcHJpb3JpdHkgaW4gYW55IG90aGVyIG1vdmluZyBwYXJ0cyB0aGF0IGFyZSBnb2luZyB0byB0b3VjaCBwb3J0Zm9saW8gbGF5b3V0IGF0IGBwaG9ydC5sb2FkZWRgXG5cdC0tLVxuXG4jIyNcbmNsYXNzIFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyXG5cblx0cHJlcGFyZTogLT5cblx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnXG5cdFx0cmV0dXJuXG5cblx0Y3JlYXRlOiAtPlxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uY3JlYXRlJ1xuXHRcdHJldHVyblxuXG5cblx0cmVmcmVzaDogLT5cblx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnXG5cdFx0cmV0dXJuXG5cblxuXHRkZXN0cm95OiAtPlxuXHRcdCMgRGVzdHJveVxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveSdcblx0XHRyZXR1cm5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyIiwiSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuXG5cbiMjI1xuXHRBYnN0cmFjdCBDbGFzcyBQb3J0b2ZsaW9fRXZlbnRfSW1lcGxlbWVudGF0aW9uXG5cbiAgICBIYW5kbGVzIGFsbCB0aGUgZXZlbnRzIHJlcXVpcmVkIHRvIGZ1bGx5IGhhbmRsZSBhIHBvcnRmb2xpbyBsYXlvdXQgcHJvY2Vzc1xuIyMjXG5jbGFzcyBQb3J0Zm9saW9fSW50ZXJmYWNlXG5cblx0Y29uc3RydWN0b3I6ICggYXJncyApIC0+XG5cdFx0QHNldHVwX2FjdGlvbnMoKVxuXHRcdEBpbml0aWFsaXplKCBhcmdzIClcblxuXHRzZXR1cF9hY3Rpb25zOiAtPlxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnLCBAcHJlcGFyZSwgNTBcblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5jcmVhdGUnLCBAY3JlYXRlLCA1MFxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCBAcmVmcmVzaCwgNTBcblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgQGRlc3Ryb3ksIDUwXG5cdFx0SG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScsIEBwdXJnZV9hY3Rpb25zLCAxMDBcblxuXHRwdXJnZV9hY3Rpb25zOiA9PlxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnLCBAcHJlcGFyZSwgNTBcblx0XHRIb29rcy5yZW1vdmVBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5jcmVhdGUnLCBAY3JlYXRlLCA1MFxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCBAcmVmcmVzaCwgNTBcblx0XHRIb29rcy5yZW1vdmVBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgQGRlc3Ryb3ksIDUwXG5cdFx0SG9va3MucmVtb3ZlQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScsIEBwdXJnZV9hY3Rpb25zLCAxMDBcblxuXG5cdCMjI1xuICAgIFx0UmVxdWlyZSB0aGVzZSBtZXRob2RzXG5cdCMjI1xuXHRpbml0aWFsaXplOiAtPiB0aHJvdyBuZXcgRXJyb3IoIFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGBpbml0aWFsaXplYCBtZXRob2RcIiApXG5cdHByZXBhcmUgICA6IC0+IHRocm93IG5ldyBFcnJvciggXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYHByZXBhcmVgIG1ldGhvZFwiIClcblx0Y3JlYXRlICAgIDogLT4gdGhyb3cgbmV3IEVycm9yKCBcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgY3JlYXRlYCBtZXRob2RcIiApXG5cdHJlZnJlc2ggICA6IC0+IHRocm93IG5ldyBFcnJvciggXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYHJlZnJlc2hgIG1ldGhvZFwiIClcblx0ZGVzdHJveSAgIDogLT4gdGhyb3cgbmV3IEVycm9yKCBcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgZGVzdHJveWAgbWV0aG9kXCIgKVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW9fSW50ZXJmYWNlIiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5Qb3J0Zm9saW9fSW50ZXJmYWNlID0gcmVxdWlyZSggJy4vUG9ydGZvbGlvX0ludGVyZmFjZScgKVxuXG5cbmNsYXNzIFBvcnRmb2xpb19NYXNvbnJ5IGV4dGVuZHMgUG9ydGZvbGlvX0ludGVyZmFjZVxuXG5cdGNvbnN0cnVjdG9yOiAtPlxuXG5cdFx0QEVsZW1lbnRzID1cblx0XHRcdGNvbnRhaW5lcjogJ1BQX01hc29ucnknXG5cdFx0XHRzaXplciAgICA6ICdQUF9NYXNvbnJ5X19zaXplcidcblx0XHRcdGl0ZW0gICAgIDogJ1BQX01hc29ucnlfX2l0ZW0nXG5cblx0XHRzdXBlcigpXG5cblx0IyMjXG5cdFx0SW5pdGlhbGl6ZVxuXHQjIyNcblx0aW5pdGlhbGl6ZTogLT5cblx0XHRAJGNvbnRhaW5lciA9ICQoIFwiLiN7QEVsZW1lbnRzLmNvbnRhaW5lcn1cIiApXG5cblx0IyMjXG5cdFx0UHJlcGFyZSAmIEF0dGFjaCBFdmVudHNcbiAgICBcdERvbid0IHNob3cgYW55dGhpbmcgeWV0LlxuXG5cdFx0QGNhbGxlZCBvbiBob29rIGBwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZWBcblx0IyMjXG5cdHByZXBhcmU6ID0+XG5cdFx0cmV0dXJuIGlmIEAkY29udGFpbmVyLmxlbmd0aCBpcyAwXG5cblx0XHRAJGNvbnRhaW5lci5hZGRDbGFzcyggJ1BQX0pTX19sb2FkaW5nX21hc29ucnknIClcblxuXHRcdEBtYXliZV9jcmVhdGVfc2l6ZXIoKVxuXG5cdFx0IyBPbmx5IGluaXRpYWxpemUsIGlmIG5vIG1hc29ucnkgZXhpc3RzXG5cdFx0bWFzb25yeV9zZXR0aW5ncyA9IEhvb2tzLmFwcGx5RmlsdGVycyAncGhvcnQubWFzb25yeS5zZXR0aW5ncycsXG5cdFx0XHRpdGVtU2VsZWN0b3I6IFwiLiN7QEVsZW1lbnRzLml0ZW19XCJcblx0XHRcdGNvbHVtbldpZHRoIDogXCIuI3tARWxlbWVudHMuc2l6ZXJ9XCJcblx0XHRcdGd1dHRlciAgICAgIDogMFxuXHRcdFx0aW5pdExheW91dCAgOiBmYWxzZVxuXG5cdFx0QCRjb250YWluZXIubWFzb25yeSggbWFzb25yeV9zZXR0aW5ncyApXG5cblx0XHRAJGNvbnRhaW5lci5tYXNvbnJ5ICdvbmNlJywgJ2xheW91dENvbXBsZXRlJywgPT5cblx0XHRcdEAkY29udGFpbmVyXG5cdFx0XHRcdC5yZW1vdmVDbGFzcyggJ1BQX0pTX19sb2FkaW5nX21hc29ucnknIClcblx0XHRcdFx0LmFkZENsYXNzKCAnUFBfSlNfX2xvYWRpbmdfY29tcGxldGUnIClcblxuXHRcdFx0IyBAdHJpZ2dlciByZWZyZXNoIGV2ZW50XG5cdFx0XHQjIHRyaWdnZXJzIGBAcmVmcmVzaCgpYFxuXHRcdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5yZWZyZXNoJ1xuXG5cblx0IyMjXG5cdFx0U3RhcnQgdGhlIFBvcnRmb2xpb1xuXHRcdEBjYWxsZWQgb24gaG9vayBgcGhvcnQucG9ydGZvbGlvLmNyZWF0ZWBcblx0IyMjXG5cdGNyZWF0ZTogPT5cblx0XHRAJGNvbnRhaW5lci5tYXNvbnJ5KClcblx0XHRyZXR1cm5cblxuXG5cdCMjI1xuXHRcdERlc3Ryb3lcblx0XHRAY2FsbGVkIG9uIGhvb2sgYHBob3J0LnBvcnRmb2xpby5kZXN0cm95YFxuXHQjIyNcblx0ZGVzdHJveTogPT5cblx0XHRAbWF5YmVfcmVtb3ZlX3NpemVyKClcblxuXHRcdGlmIEAkY29udGFpbmVyLmxlbmd0aCA+IDBcblx0XHRcdEAkY29udGFpbmVyLm1hc29ucnkoICdkZXN0cm95JyApXG5cblxuXHRcdHJldHVyblxuXG5cblx0IyMjXG5cdFx0UmVsb2FkIHRoZSBsYXlvdXRcblx0XHRAY2FsbGVkIG9uIGhvb2sgYHBob3J0LnBvcnRmb2xpby5yZWZyZXNoYFxuXHQjIyNcblx0cmVmcmVzaDogPT5cblx0XHRAJGNvbnRhaW5lci5tYXNvbnJ5KCAnbGF5b3V0JyApXG5cblxuXG5cdCMjI1xuXHRcdENyZWF0ZSBhIHNpemVyIGVsZW1lbnQgZm9yIGpxdWVyeS1tYXNvbnJ5IHRvIHVzZVxuXHQjIyNcblx0bWF5YmVfY3JlYXRlX3NpemVyOiAtPlxuXHRcdEBjcmVhdGVfc2l6ZXIoKSBpZiBAc2l6ZXJfZG9lc250X2V4aXN0KClcblx0XHRyZXR1cm5cblxuXHRtYXliZV9yZW1vdmVfc2l6ZXI6IC0+XG5cdFx0cmV0dXJuIGlmIEAkY29udGFpbmVyLmxlbmd0aCBpc250IDFcblx0XHRAJGNvbnRhaW5lci5maW5kKCBcIi4je0BFbGVtZW50cy5zaXplcn1cIiApLnJlbW92ZSgpXG5cdFx0cmV0dXJuXG5cblx0c2l6ZXJfZG9lc250X2V4aXN0OiAtPiBAJGNvbnRhaW5lci5maW5kKCBcIi4je0BFbGVtZW50cy5zaXplcn1cIiApLmxlbmd0aCBpcyAwXG5cblxuXHRjcmVhdGVfc2l6ZXI6IC0+XG5cdFx0QCRjb250YWluZXIuYXBwZW5kIFwiXCJcIjxkaXYgY2xhc3M9XCIje0BFbGVtZW50cy5zaXplcn1cIj48L2Rpdj5cIlwiXCJcblxuXHRcdHJldHVyblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBvcnRmb2xpb19NYXNvbnJ5IiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcblBvcnRmb2xpb19FdmVudF9NYW5hZ2VyID0gcmVxdWlyZSggJy4vUG9ydGZvbGlvX0V2ZW50X01hbmFnZXInIClcbiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5cbiMgUG9ydGZvbGlvIG1hbmFnZXIgd2lsbCB0cmlnZ2VyIHBvcnRmb2xpbyBldmVudHMgd2hlbiBuZWNlc3NhcnlcblBvcnRmb2xpbyA9IG5ldyBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlcigpXG5cblxuaXNfbWFzb25yeSA9IC0+XG5cdHJldHVybiAoICQoICcuUFBfTWFzb25yeScgKS5sZW5ndGggaXNudCAwIClcblxuIyBTdGFydCBNYXNvbnJ5IExheW91dFxuc3RhcnRfbWFzb25yeSA9IC0+XG5cdHJldHVybiBmYWxzZSBpZiBub3QgaXNfbWFzb25yeSgpXG5cblx0UG9ydGZvbGlvX01hc29ucnkgPSByZXF1aXJlKCAnLi9Qb3J0Zm9saW9fTWFzb25yeScgKVxuXHRuZXcgUG9ydGZvbGlvX01hc29ucnkoKVxuXG5tYXliZV9sYXp5X21hc29ucnkgPSAoIGhhbmRsZXIgKSAtPlxuXHQjIFVzZSBMYXp5X01hc29ucnkgaGFuZGxlciwgaWYgY3VycmVudCBsYXlvdXQgaXMgbWFzb25yeVxuXHRyZXR1cm4gcmVxdWlyZSggJ2xhenkvTGF6eV9NYXNvbnJ5JyApIGlmIGlzX21hc29ucnkoKVxuXHRyZXR1cm4gaGFuZGxlclxuXG5cbiMgU3RhcnQgUG9ydGZvbGlvXG5Ib29rcy5hZGRBY3Rpb24gJ3Bob3J0LmNvcmUucmVhZHknLCBQb3J0Zm9saW8ucHJlcGFyZSwgNTBcbkhvb2tzLmFkZEFjdGlvbiAncGhvcnQuY29yZS5sb2FkZWQnLCBQb3J0Zm9saW8uY3JlYXRlLCA1MFxuXG4jIEluaXRpYWxpemUgTWFzb25yeSBMYXlvdXRcbkhvb2tzLmFkZEFjdGlvbiAncGhvcnQuY29yZS5yZWFkeScsIHN0YXJ0X21hc29ucnlcblxuIyBJbml0aWFsaXplIExhenkgTG9hZGluZyBmb3IgTWFzb25yeSBMYXlvdXRcbkhvb2tzLmFkZEZpbHRlciAncGhvcnQubGF6eS5oYW5kbGVyJywgbWF5YmVfbGF6eV9tYXNvbnJ5XG5cblxuXG4iXX0=
