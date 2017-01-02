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
    this.debounced_autoload = null;
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
    var rect, sensitivity;
    if (el.getBoundingClientRect == null) {
      return true;
    }
    rect = el.getBoundingClientRect();
    sensitivity = 100;
    return rect.top + rect.height >= -sensitivity && rect.bottom - rect.height <= __WINDOW.height + sensitivity && rect.left + rect.width >= -sensitivity && rect.right - rect.width <= __WINDOW.width + sensitivity;
  };

  Abstract_Lazy_Loader.prototype.remove_placeholder = function(item) {
    return item.$el.find("." + this.Elements.placeholder + ", noscript").remove();
  };

  Abstract_Lazy_Loader.prototype.destroy = function() {
    return this.detach_events();
  };

  Abstract_Lazy_Loader.prototype.attach_events = function() {
    this.debounced_autoload = _.debounce(this.autoload, 50);
    return Hooks.addAction('phort.portfolio.refresh', this.debounced_autoload, 100);
  };

  Abstract_Lazy_Loader.prototype.detach_events = function() {
    this.debounced_autoload = null;
    return Hooks.removeAction('phort.portfolio.refresh', this.debounced_autoload, 100);
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
    return $(window).on('scroll', this.debounced_autoload);
  };

  Lazy_Masonry.prototype.detach_events = function() {
    $(window).off('scroll', this.debounced_autoload);
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

Hooks.addAction('phort.portfolio.refresh', function() {
  return Hooks.doAction('phort.lazy.refresh');
});


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


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jb3JlL1Bob3RvZ3JhcGh5X1BvcnRmb2xpby5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY29yZS9XaW5kb3cuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvcG9wdXAuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvQWJzdHJhY3RfTGF6eV9Mb2FkZXIuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvSXRlbV9EYXRhLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0xhenlfTWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvbGF6eS9zdGFydC5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL1BvcnRmb2xpb19FdmVudF9NYW5hZ2VyLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9wb3J0Zm9saW8vUG9ydGZvbGlvX0ludGVyZmFjZS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL1BvcnRmb2xpb19NYXNvbnJ5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9wb3J0Zm9saW8vc3RhcnQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3RKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDM0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbi8qXG4gICAgTG9hZCBEZXBlbmRlbmNpZXNcbiAqL1xudmFyICQsIEhvb2tzO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxud2luZG93LlBQX01vZHVsZXMgPSB7XG4gIFBvcnRmb2xpb19JbnRlcmZhY2U6IHJlcXVpcmUoJy4vcG9ydGZvbGlvL1BvcnRmb2xpb19JbnRlcmZhY2UnKSxcbiAgSXRlbV9EYXRhOiByZXF1aXJlKCcuL2xhenkvSXRlbV9EYXRhJyksXG4gIEFic3RyYWN0X0xhenlfTG9hZGVyOiByZXF1aXJlKCcuL2xhenkvQWJzdHJhY3RfTGF6eV9Mb2FkZXInKVxufTtcblxuXG4vKlxuXHRCb290IG9uIGBkb2N1bWVudC5yZWFkeWBcbiAqL1xuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgdmFyIFBob3RvZ3JhcGh5X1BvcnRmb2xpbztcbiAgaWYgKCEkKCdib2R5JykuaGFzQ2xhc3MoJ1BQX1BvcnRmb2xpbycpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIFBob3RvZ3JhcGh5X1BvcnRmb2xpbyA9IG5ldyAocmVxdWlyZSgnLi9jb3JlL1Bob3RvZ3JhcGh5X1BvcnRmb2xpbycpKSgpO1xuICBQaG90b2dyYXBoeV9Qb3J0Zm9saW8ucmVhZHkoKTtcbn0pO1xuXG5cbi8qXG5cdExvYWQgQXBwXG4gKi9cblxucmVxdWlyZSgnLi9wb3J0Zm9saW8vc3RhcnQnKTtcblxucmVxdWlyZSgnLi9nYWxsZXJ5L3BvcHVwJyk7XG5cbnJlcXVpcmUoJy4vbGF6eS9zdGFydCcpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lZWEJ3TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lZWEJ3TG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lPMEZCUVVFN096dEJRVUZCTEVsQlFVRTdPMEZCUjBFc1MwRkJRU3hIUVVGUkxFOUJRVUVzUTBGQlV5eFZRVUZVT3p0QlFVTlNMRU5CUVVFc1IwRkJTU3hQUVVGQkxFTkJRVk1zVVVGQlZEczdRVUZKU2l4TlFVRk5MRU5CUVVNc1ZVRkJVQ3hIUVVWRE8wVkJRVUVzYlVKQlFVRXNSVUZCY1VJc1QwRkJRU3hEUVVGVExHbERRVUZVTEVOQlFYSkNPMFZCUjBFc1UwRkJRU3hGUVVGWExFOUJRVUVzUTBGQlV5eHJRa0ZCVkN4RFFVaFlPMFZCVFVFc2IwSkJRVUVzUlVGQmMwSXNUMEZCUVN4RFFVRlRMRFpDUVVGVUxFTkJUblJDT3pzN08wRkJVMFE3T3pzN1FVRkhRU3hEUVVGQkxFTkJRVWNzVVVGQlNDeERRVUZoTEVOQlFVTXNTMEZCWkN4RFFVRnZRaXhUUVVGQk8wRkJSMjVDTEUxQlFVRTdSVUZCUVN4SlFVRlZMRU5CUVVrc1EwRkJRU3hEUVVGSExFMUJRVWdzUTBGQlZ5eERRVUZETEZGQlFWb3NRMEZCYzBJc1kwRkJkRUlzUTBGQlpEdEJRVUZCTEZkQlFVRTdPMFZCUjBFc2NVSkJRVUVzUjBGQk5FSXNTVUZCUVN4RFFVRkZMRTlCUVVFc1EwRkJVeXc0UWtGQlZDeERRVUZHTEVOQlFVRXNRMEZCUVR0RlFVTTFRaXh4UWtGQmNVSXNRMEZCUXl4TFFVRjBRaXhEUVVGQk8wRkJVRzFDTEVOQlFYQkNPenM3UVVGWlFUczdPenRCUVV0QkxFOUJRVUVzUTBGQlVTeHRRa0ZCVWpzN1FVRkhRU3hQUVVGQkxFTkJRVkVzYVVKQlFWSTdPMEZCUjBFc1QwRkJRU3hEUVVGUkxHTkJRVklpZlE9PVxuIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgJCwgQ29yZSwgSG9va3MsXG4gIGJpbmQgPSBmdW5jdGlvbihmbiwgbWUpeyByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuIGZuLmFwcGx5KG1lLCBhcmd1bWVudHMpOyB9OyB9O1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuQ29yZSA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gQ29yZSgpIHtcbiAgICB0aGlzLndhaXRfZm9yX2xvYWQgPSBiaW5kKHRoaXMud2FpdF9mb3JfbG9hZCwgdGhpcyk7XG4gICAgdGhpcy5yZWFkeSA9IGJpbmQodGhpcy5yZWFkeSwgdGhpcyk7XG4gICAgSG9va3MuYWRkQWN0aW9uKCdwaG9ydC5jb3JlLnJlYWR5JywgdGhpcy53YWl0X2Zvcl9sb2FkKTtcbiAgfVxuXG4gIENvcmUucHJvdG90eXBlLnJlYWR5ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKEhvb2tzLmFwcGx5RmlsdGVycygncGhvcnQuY29yZS5yZWFkeScsIHRydWUpKSB7XG4gICAgICBIb29rcy5kb0FjdGlvbigncGhvcnQuY29yZS5yZWFkeScpO1xuICAgIH1cbiAgfTtcblxuICBDb3JlLnByb3RvdHlwZS53YWl0X2Zvcl9sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICQoJy5QUF9XcmFwcGVyJykuaW1hZ2VzTG9hZGVkKHRoaXMubG9hZGVkKTtcbiAgfTtcblxuICBDb3JlLnByb3RvdHlwZS5sb2FkZWQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoSG9va3MuYXBwbHlGaWx0ZXJzKCdwaG9ydC5jb3JlLmxvYWRlZCcsIHRydWUpKSB7XG4gICAgICBIb29rcy5kb0FjdGlvbigncGhvcnQuY29yZS5sb2FkZWQnKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIENvcmU7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29yZTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVUdodmRHOW5jbUZ3YUhsZlVHOXlkR1p2YkdsdkxtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpVUdodmRHOW5jbUZ3YUhsZlVHOXlkR1p2YkdsdkxtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pTzBGQlFVRTdPenRCUVVGQkxFbEJRVUVzWTBGQlFUdEZRVUZCT3p0QlFVZEJMRU5CUVVFc1IwRkJTU3hQUVVGQkxFTkJRVk1zVVVGQlZEczdRVUZEU2l4TFFVRkJMRWRCUVZFc1QwRkJRU3hEUVVGVExGVkJRVlE3TzBGQlIwWTdSVUZGVVN4alFVRkJPenM3U1VGRFdpeExRVUZMTEVOQlFVTXNVMEZCVGl4RFFVRm5RaXhyUWtGQmFFSXNSVUZCYjBNc1NVRkJReXhEUVVGQkxHRkJRWEpETzBWQlJGazdPMmxDUVVsaUxFdEJRVUVzUjBGQlR5eFRRVUZCTzBsQlEwNHNTVUZCUnl4TFFVRkxMRU5CUVVNc1dVRkJUaXhEUVVGdlFpeHJRa0ZCY0VJc1JVRkJkME1zU1VGQmVFTXNRMEZCU0R0TlFVTkRMRXRCUVVzc1EwRkJReXhSUVVGT0xFTkJRV1VzYTBKQlFXWXNSVUZFUkRzN1JVRkVUVHM3YVVKQlMxQXNZVUZCUVN4SFFVRmxMRk5CUVVFN1YwRkZaQ3hEUVVGQkxFTkJRVWNzWVVGQlNDeERRVUZyUWl4RFFVRkRMRmxCUVc1Q0xFTkJRV2xETEVsQlFVTXNRMEZCUVN4TlFVRnNRenRGUVVaak96dHBRa0ZMWml4TlFVRkJMRWRCUVZFc1UwRkJRVHRKUVVOUUxFbEJRVWNzUzBGQlN5eERRVUZETEZsQlFVNHNRMEZCYjBJc2JVSkJRWEJDTEVWQlFYbERMRWxCUVhwRExFTkJRVWc3VFVGRFF5eExRVUZMTEVOQlFVTXNVVUZCVGl4RFFVRmxMRzFDUVVGbUxFVkJSRVE3TzBWQlJFODdPenM3T3p0QlFVOVVMRTFCUVUwc1EwRkJReXhQUVVGUUxFZEJRV2xDSW4wPVxuIiwidmFyIEhvb2tzLCBnZXRfc2l6ZTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuZ2V0X3NpemUgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICB3aWR0aDogd2luZG93LmlubmVyV2lkdGggfHwgJHdpbmRvdy53aWR0aCgpLFxuICAgIGhlaWdodDogd2luZG93LmlubmVySGVpZ2h0IHx8ICR3aW5kb3cuaGVpZ2h0KClcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0X3NpemUoKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVjJsdVpHOTNMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaVYybHVaRzkzTG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4SlFVRkJPenRCUVVGQkxFdEJRVUVzUjBGQlVTeFBRVUZCTEVOQlFWTXNWVUZCVkRzN1FVRkhVaXhSUVVGQkxFZEJRVmNzVTBGQlFUdFRRVU5XTzBsQlFVRXNTMEZCUVN4RlFVRlJMRTFCUVUwc1EwRkJReXhWUVVGUUxFbEJRWEZDTEU5QlFVOHNRMEZCUXl4TFFVRlNMRU5CUVVFc1EwRkJOMEk3U1VGRFFTeE5RVUZCTEVWQlFWRXNUVUZCVFN4RFFVRkRMRmRCUVZBc1NVRkJjMElzVDBGQlR5eERRVUZETEUxQlFWSXNRMEZCUVN4RFFVUTVRanM3UVVGRVZUczdRVUZMV0N4TlFVRk5MRU5CUVVNc1QwRkJVQ3hIUVVGcFFpeFJRVUZCTEVOQlFVRWlmUT09XG4iLCJcbi8qXG4gICAgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBIb29rcywgSXRlbV9EYXRhLCBnZXRfZGF0YTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbkl0ZW1fRGF0YSA9IHJlcXVpcmUoJy4uL2xhenkvSXRlbV9EYXRhJyk7XG5cbmdldF9kYXRhID0gZnVuY3Rpb24oZWwpIHtcbiAgdmFyICRjb250YWluZXIsICRlbCwgJGl0ZW1zLCBpdGVtcztcbiAgJGVsID0gJChlbCk7XG4gICRjb250YWluZXIgPSAkZWwuY2xvc2VzdCgnLlBQX0dhbGxlcnknKTtcbiAgJGl0ZW1zID0gJGNvbnRhaW5lci5maW5kKCcuUFBfR2FsbGVyeV9faXRlbScpO1xuICBpdGVtcyA9ICRpdGVtcy5tYXAoZnVuY3Rpb24oa2V5LCBpdGVtKSB7XG4gICAgdmFyIGZ1bGwsIGl0ZW1fZGF0YTtcbiAgICBpdGVtX2RhdGEgPSBuZXcgSXRlbV9EYXRhKCQoaXRlbSkpO1xuICAgIGlmIChpdGVtX2RhdGEuZ2V0X3R5cGUoKSA9PT0gJ3ZpZGVvJykge1xuICAgICAgZnVsbCA9IGl0ZW1fZGF0YS5nZXRfb3JfZmFsc2UoJ3ZpZGVvX3VybCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmdWxsID0gaXRlbV9kYXRhLmdldF91cmwoJ2Z1bGwnKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHNyYzogZnVsbCxcbiAgICAgIHRodW1iOiBpdGVtX2RhdGEuZ2V0X3VybCgndGh1bWInKVxuICAgIH07XG4gIH0pO1xuICByZXR1cm4gaXRlbXM7XG59O1xuXG5cbi8qXG4gICAgQFRPRE86IE5lZWQgZGV0YWNoL2Rlc3Ryb3kgbWV0aG9kc1xuICovXG5cbkhvb2tzLmFkZEFjdGlvbigncGhvcnQuY29yZS5yZWFkeScsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4gJCgnLlBQX0dhbGxlcnlfX2l0ZW0nKS5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgdmFyICRlbDtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJGVsID0gJCh0aGlzKTtcbiAgICByZXR1cm4gJGVsLmxpZ2h0R2FsbGVyeSh7XG4gICAgICBkeW5hbWljOiB0cnVlLFxuICAgICAgZHluYW1pY0VsOiBnZXRfZGF0YSh0aGlzKSxcbiAgICAgIGluZGV4OiAkKCcuUFBfR2FsbGVyeV9faXRlbScpLmluZGV4KCRlbCksXG4gICAgICBzcGVlZDogMzUwLFxuICAgICAgcHJlbG9hZDogMyxcbiAgICAgIGRvd25sb2FkOiBmYWxzZSxcbiAgICAgIHZpZGVvTWF4V2lkdGg6ICQod2luZG93KS53aWR0aCgpICogMC44XG4gICAgfSk7XG4gIH0pO1xufSk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWNHOXdkWEF1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SndiM0IxY0M1amIyWm1aV1VpWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanRCUVVGQk96czdRVUZCUVN4SlFVRkJPenRCUVVkQkxFTkJRVUVzUjBGQlNTeFBRVUZCTEVOQlFWTXNVVUZCVkRzN1FVRkRTaXhMUVVGQkxFZEJRVkVzVDBGQlFTeERRVUZUTEZWQlFWUTdPMEZCUTFJc1UwRkJRU3hIUVVGWkxFOUJRVUVzUTBGQlV5eHRRa0ZCVkRzN1FVRkZXaXhSUVVGQkxFZEJRVmNzVTBGQlJTeEZRVUZHTzBGQlExWXNUVUZCUVR0RlFVRkJMRWRCUVVFc1IwRkJUU3hEUVVGQkxFTkJRVWNzUlVGQlNEdEZRVU5PTEZWQlFVRXNSMEZCWVN4SFFVRkhMRU5CUVVNc1QwRkJTaXhEUVVGaExHRkJRV0k3UlVGRllpeE5RVUZCTEVkQlFWTXNWVUZCVlN4RFFVRkRMRWxCUVZnc1EwRkJhVUlzYlVKQlFXcENPMFZCUlZRc1MwRkJRU3hIUVVGUkxFMUJRVTBzUTBGQlF5eEhRVUZRTEVOQlFWY3NVMEZCUlN4SFFVRkdMRVZCUVU4c1NVRkJVRHRCUVVOc1FpeFJRVUZCTzBsQlFVRXNVMEZCUVN4SFFVRm5RaXhKUVVGQkxGTkJRVUVzUTBGQlZ5eERRVUZCTEVOQlFVY3NTVUZCU0N4RFFVRllPMGxCUjJoQ0xFbEJRVWNzVTBGQlV5eERRVUZETEZGQlFWWXNRMEZCUVN4RFFVRkJMRXRCUVhkQ0xFOUJRVE5DTzAxQlEwTXNTVUZCUVN4SFFVRlBMRk5CUVZNc1EwRkJReXhaUVVGV0xFTkJRWGRDTEZkQlFYaENMRVZCUkZJN1MwRkJRU3hOUVVGQk8wMUJSME1zU1VGQlFTeEhRVUZQTEZOQlFWTXNRMEZCUXl4UFFVRldMRU5CUVcxQ0xFMUJRVzVDTEVWQlNGSTdPMEZCUzBFc1YwRkJUenROUVVOT0xFZEJRVUVzUlVGQlR5eEpRVVJFTzAxQlJVNHNTMEZCUVN4RlFVRlBMRk5CUVZNc1EwRkJReXhQUVVGV0xFTkJRVzFDTEU5QlFXNUNMRU5CUmtRN08wVkJWRmNzUTBGQldEdEJRV1ZTTEZOQlFVODdRVUZ5UWtjN096dEJRWFZDV0RzN096dEJRVWRCTEV0QlFVc3NRMEZCUXl4VFFVRk9MRU5CUVdkQ0xHdENRVUZvUWl4RlFVRnZReXhUUVVGQk8xTkJSVzVETEVOQlFVRXNRMEZCUnl4dFFrRkJTQ3hEUVVGM1FpeERRVUZETEVWQlFYcENMRU5CUVRSQ0xFOUJRVFZDTEVWQlFYRkRMRk5CUVVVc1EwRkJSanRCUVVOd1F5eFJRVUZCTzBsQlFVRXNRMEZCUXl4RFFVRkRMR05CUVVZc1EwRkJRVHRKUVVkQkxFZEJRVUVzUjBGQlRTeERRVUZCTEVOQlFVY3NTVUZCU0R0WFFVZE9MRWRCUVVjc1EwRkJReXhaUVVGS0xFTkJRME03VFVGQlFTeFBRVUZCTEVWQlFWY3NTVUZCV0R0TlFVTkJMRk5CUVVFc1JVRkJWeXhSUVVGQkxFTkJRVlVzU1VGQlZpeERRVVJZTzAxQlJVRXNTMEZCUVN4RlFVRlhMRU5CUVVFc1EwRkJSeXh0UWtGQlNDeERRVUYzUWl4RFFVRkRMRXRCUVhwQ0xFTkJRU3RDTEVkQlFTOUNMRU5CUmxnN1RVRkhRU3hMUVVGQkxFVkJRVmNzUjBGSVdEdE5RVWxCTEU5QlFVRXNSVUZCVnl4RFFVcFlPMDFCUzBFc1VVRkJRU3hGUVVGWExFdEJURmc3VFVGTlFTeGhRVUZCTEVWQlFXVXNRMEZCUVN4RFFVRkZMRTFCUVVZc1EwRkJVeXhEUVVGRExFdEJRVllzUTBGQlFTeERRVUZCTEVkQlFXOUNMRWRCVG01RE8wdEJSRVE3UlVGUWIwTXNRMEZCY2tNN1FVRkdiVU1zUTBGQmNFTWlmUT09XG4iLCJcbi8qXG4gICAgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBBYnN0cmFjdF9MYXp5X0xvYWRlciwgSG9va3MsIEl0ZW1fRGF0YSwgX19XSU5ET1csXG4gIGJpbmQgPSBmdW5jdGlvbihmbiwgbWUpeyByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuIGZuLmFwcGx5KG1lLCBhcmd1bWVudHMpOyB9OyB9O1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuSXRlbV9EYXRhID0gcmVxdWlyZSgnLi9JdGVtX0RhdGEnKTtcblxuX19XSU5ET1cgPSByZXF1aXJlKCcuLi9jb3JlL1dpbmRvdycpO1xuXG5BYnN0cmFjdF9MYXp5X0xvYWRlciA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gQWJzdHJhY3RfTGF6eV9Mb2FkZXIoKSB7XG4gICAgdGhpcy5hdXRvbG9hZCA9IGJpbmQodGhpcy5hdXRvbG9hZCwgdGhpcyk7XG4gICAgdGhpcy5hZGRfaXRlbSA9IGJpbmQodGhpcy5hZGRfaXRlbSwgdGhpcyk7XG4gICAgdGhpcy5zZXR1cF9pdGVtcyA9IGJpbmQodGhpcy5zZXR1cF9pdGVtcywgdGhpcyk7XG4gICAgdGhpcy5FbGVtZW50cyA9IHtcbiAgICAgIGl0ZW06ICdQUF9MYXp5X0ltYWdlJyxcbiAgICAgIHBsYWNlaG9sZGVyOiAnUFBfTGF6eV9JbWFnZV9fcGxhY2Vob2xkZXInLFxuICAgICAgbGluazogJ1BQX0pTX0xhenlfX2xpbmsnLFxuICAgICAgaW1hZ2U6ICdQUF9KU19MYXp5X19pbWFnZSdcbiAgICB9O1xuICAgIHRoaXMuSXRlbXMgPSBbXTtcbiAgICB0aGlzLmRlYm91bmNlZF9hdXRvbG9hZCA9IG51bGw7XG4gICAgdGhpcy5zZXR1cF9pdGVtcygpO1xuICAgIHRoaXMucmVzaXplX2FsbCgpO1xuICAgIHRoaXMuYXR0YWNoX2V2ZW50cygpO1xuICB9XG5cblxuICAvKlxuICBcdFx0QWJzdHJhY3QgTWV0aG9kc1xuICAgKi9cblxuICBBYnN0cmFjdF9MYXp5X0xvYWRlci5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24oKSB7fTtcblxuICBBYnN0cmFjdF9MYXp5X0xvYWRlci5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICB0aGlzLmxvYWRfaW1hZ2UoaXRlbSk7XG4gICAgcmV0dXJuIGl0ZW0uJGVsLmltYWdlc0xvYWRlZCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzLmNsZWFudXBfYWZ0ZXJfbG9hZChpdGVtKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9O1xuXG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5sb2FkX2ltYWdlID0gZnVuY3Rpb24oaXRlbSkge1xuICAgIHZhciBmdWxsLCB0aHVtYjtcbiAgICB0aHVtYiA9IGl0ZW0uZGF0YS5nZXRfdXJsKCd0aHVtYicpO1xuICAgIGZ1bGwgPSBpdGVtLmRhdGEuZ2V0X3VybCgnZnVsbCcpO1xuICAgIGl0ZW0uJGVsLnByZXBlbmQodGhpcy5nZXRfaXRlbV9odG1sKHRodW1iLCBmdWxsKSkucmVtb3ZlQ2xhc3MoJ0xhenktSW1hZ2UnKTtcbiAgICByZXR1cm4gaXRlbS5sb2FkZWQgPSB0cnVlO1xuICB9O1xuXG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5jbGVhbnVwX2FmdGVyX2xvYWQgPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgaXRlbS4kZWwuZmluZCgnaW1nJykuYWRkQ2xhc3MoJ1BQX0pTX19sb2FkZWQnKS5yZW1vdmVDbGFzcygnUFBfSlNfX2xvYWRpbmcnKTtcbiAgICByZXR1cm4gaXRlbS4kZWwucmVtb3ZlQ2xhc3ModGhpcy5FbGVtZW50cy5pdGVtKS5maW5kKFwiLlwiICsgdGhpcy5FbGVtZW50cy5wbGFjZWhvbGRlcikuZmFkZU91dCg0MDAsIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICQodGhpcykucmVtb3ZlKCk7XG4gICAgfSk7XG4gIH07XG5cbiAgQWJzdHJhY3RfTGF6eV9Mb2FkZXIucHJvdG90eXBlLmdldF9pdGVtX2h0bWwgPSBmdW5jdGlvbih0aHVtYiwgZnVsbCkge1xuICAgIHJldHVybiBcIlxcbjxhIGNsYXNzPVxcXCJcIiArIHRoaXMuRWxlbWVudHMubGluayArIFwiXFxcIiBocmVmPVxcXCJcIiArIGZ1bGwgKyBcIlxcXCIgcmVsPVxcXCJnYWxsZXJ5XFxcIj5cXG5cdDxpbWcgY2xhc3M9XFxcIlwiICsgdGhpcy5FbGVtZW50cy5pbWFnZSArIFwiXFxcIiBzcmM9XFxcIlwiICsgdGh1bWIgKyBcIlxcXCIgY2xhc3M9XFxcIlBQX0pTX19sb2FkaW5nXFxcIiAvPlxcbjwvYT5cIjtcbiAgfTtcblxuICBBYnN0cmFjdF9MYXp5X0xvYWRlci5wcm90b3R5cGUuc2V0dXBfaXRlbXMgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLkl0ZW1zID0gW107XG4gICAgJChcIi5cIiArIHRoaXMuRWxlbWVudHMuaXRlbSkuZWFjaCh0aGlzLmFkZF9pdGVtKTtcbiAgfTtcblxuICBBYnN0cmFjdF9MYXp5X0xvYWRlci5wcm90b3R5cGUuYWRkX2l0ZW0gPSBmdW5jdGlvbihrZXksIGVsKSB7XG4gICAgdmFyICRlbDtcbiAgICAkZWwgPSAkKGVsKTtcbiAgICB0aGlzLkl0ZW1zLnB1c2goe1xuICAgICAgZWw6IGVsLFxuICAgICAgJGVsOiAkZWwsXG4gICAgICBkYXRhOiBuZXcgSXRlbV9EYXRhKCRlbCksXG4gICAgICBsb2FkZWQ6IGZhbHNlXG4gICAgfSk7XG4gIH07XG5cblxuICAvKlxuICBcdFx0TWV0aG9kc1xuICAgKi9cblxuICBBYnN0cmFjdF9MYXp5X0xvYWRlci5wcm90b3R5cGUucmVzaXplX2FsbCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpLCBpdGVtLCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICByZWYgPSB0aGlzLkl0ZW1zO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGl0ZW0gPSByZWZbaV07XG4gICAgICByZXN1bHRzLnB1c2godGhpcy5yZXNpemUoaXRlbSkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICBBYnN0cmFjdF9MYXp5X0xvYWRlci5wcm90b3R5cGUuYXV0b2xvYWQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaSwgaXRlbSwga2V5LCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICByZWYgPSB0aGlzLkl0ZW1zO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGtleSA9IGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBrZXkgPSArK2kpIHtcbiAgICAgIGl0ZW0gPSByZWZba2V5XTtcbiAgICAgIGlmICghaXRlbS5sb2FkZWQgJiYgdGhpcy5pbl9sb29zZV92aWV3KGl0ZW0uZWwpKSB7XG4gICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLmxvYWQoaXRlbSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHZvaWQgMCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5pbl9sb29zZV92aWV3ID0gZnVuY3Rpb24oZWwpIHtcbiAgICB2YXIgcmVjdCwgc2Vuc2l0aXZpdHk7XG4gICAgaWYgKGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHNlbnNpdGl2aXR5ID0gMTAwO1xuICAgIHJldHVybiByZWN0LnRvcCArIHJlY3QuaGVpZ2h0ID49IC1zZW5zaXRpdml0eSAmJiByZWN0LmJvdHRvbSAtIHJlY3QuaGVpZ2h0IDw9IF9fV0lORE9XLmhlaWdodCArIHNlbnNpdGl2aXR5ICYmIHJlY3QubGVmdCArIHJlY3Qud2lkdGggPj0gLXNlbnNpdGl2aXR5ICYmIHJlY3QucmlnaHQgLSByZWN0LndpZHRoIDw9IF9fV0lORE9XLndpZHRoICsgc2Vuc2l0aXZpdHk7XG4gIH07XG5cbiAgQWJzdHJhY3RfTGF6eV9Mb2FkZXIucHJvdG90eXBlLnJlbW92ZV9wbGFjZWhvbGRlciA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbS4kZWwuZmluZChcIi5cIiArIHRoaXMuRWxlbWVudHMucGxhY2Vob2xkZXIgKyBcIiwgbm9zY3JpcHRcIikucmVtb3ZlKCk7XG4gIH07XG5cbiAgQWJzdHJhY3RfTGF6eV9Mb2FkZXIucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kZXRhY2hfZXZlbnRzKCk7XG4gIH07XG5cbiAgQWJzdHJhY3RfTGF6eV9Mb2FkZXIucHJvdG90eXBlLmF0dGFjaF9ldmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmRlYm91bmNlZF9hdXRvbG9hZCA9IF8uZGVib3VuY2UodGhpcy5hdXRvbG9hZCwgNTApO1xuICAgIHJldHVybiBIb29rcy5hZGRBY3Rpb24oJ3Bob3J0LnBvcnRmb2xpby5yZWZyZXNoJywgdGhpcy5kZWJvdW5jZWRfYXV0b2xvYWQsIDEwMCk7XG4gIH07XG5cbiAgQWJzdHJhY3RfTGF6eV9Mb2FkZXIucHJvdG90eXBlLmRldGFjaF9ldmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmRlYm91bmNlZF9hdXRvbG9hZCA9IG51bGw7XG4gICAgcmV0dXJuIEhvb2tzLnJlbW92ZUFjdGlvbigncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCB0aGlzLmRlYm91bmNlZF9hdXRvbG9hZCwgMTAwKTtcbiAgfTtcblxuICByZXR1cm4gQWJzdHJhY3RfTGF6eV9Mb2FkZXI7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gQWJzdHJhY3RfTGF6eV9Mb2FkZXI7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVFXSnpkSEpoWTNSZlRHRjZlVjlNYjJGa1pYSXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lKQlluTjBjbUZqZEY5TVlYcDVYMHh2WVdSbGNpNWpiMlptWldVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWp0QlFVRkJPenM3UVVGQlFTeEpRVUZCTEcxRVFVRkJPMFZCUVVFN08wRkJSMEVzUTBGQlFTeEhRVUZKTEU5QlFVRXNRMEZCVXl4UlFVRlVPenRCUVVOS0xFdEJRVUVzUjBGQlVTeFBRVUZCTEVOQlFWTXNWVUZCVkRzN1FVRkRVaXhUUVVGQkxFZEJRVmtzVDBGQlFTeERRVUZUTEdGQlFWUTdPMEZCUTFvc1VVRkJRU3hIUVVGWExFOUJRVUVzUTBGQlV5eG5Ra0ZCVkRzN1FVRkZURHRGUVVOUkxEaENRVUZCT3pzN08wbEJRMW9zU1VGQlF5eERRVUZCTEZGQlFVUXNSMEZEUXp0TlFVRkJMRWxCUVVFc1JVRkJZU3hsUVVGaU8wMUJRMEVzVjBGQlFTeEZRVUZoTERSQ1FVUmlPMDFCUlVFc1NVRkJRU3hGUVVGaExHdENRVVppTzAxQlIwRXNTMEZCUVN4RlFVRmhMRzFDUVVoaU96dEpRVXRFTEVsQlFVTXNRMEZCUVN4TFFVRkVMRWRCUVZNN1NVRkpWQ3hKUVVGRExFTkJRVUVzYTBKQlFVUXNSMEZCYzBJN1NVRkZkRUlzU1VGQlF5eERRVUZCTEZkQlFVUXNRMEZCUVR0SlFVTkJMRWxCUVVNc1EwRkJRU3hWUVVGRUxFTkJRVUU3U1VGRFFTeEpRVUZETEVOQlFVRXNZVUZCUkN4RFFVRkJPMFZCWmxrN096dEJRV2xDWWpzN096dHBRMEZMUVN4TlFVRkJMRWRCUVZFc1UwRkJRU3hIUVVGQk96dHBRMEZGVWl4SlFVRkJMRWRCUVUwc1UwRkJSU3hKUVVGR08wbEJRMHdzU1VGQlF5eERRVUZCTEZWQlFVUXNRMEZCWVN4SlFVRmlPMWRCUTBFc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eFpRVUZVTEVOQlFYTkNMRU5CUVVFc1UwRkJRU3hMUVVGQk8yRkJRVUVzVTBGQlFUdGxRVU55UWl4TFFVRkRMRU5CUVVFc2EwSkJRVVFzUTBGQmNVSXNTVUZCY2tJN1RVRkVjVUk3U1VGQlFTeERRVUZCTEVOQlFVRXNRMEZCUVN4SlFVRkJMRU5CUVhSQ08wVkJSa3M3TzJsRFFVdE9MRlZCUVVFc1IwRkJXU3hUUVVGRkxFbEJRVVk3UVVGSFdDeFJRVUZCTzBsQlFVRXNTMEZCUVN4SFFVRlJMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zVDBGQlZpeERRVUZ0UWl4UFFVRnVRanRKUVVOU0xFbEJRVUVzUjBGQlR5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVZZc1EwRkJiVUlzVFVGQmJrSTdTVUZIVUN4SlFVRkpMRU5CUVVNc1IwRkRUQ3hEUVVGRExFOUJSRVFzUTBGRFZTeEpRVUZETEVOQlFVRXNZVUZCUkN4RFFVRm5RaXhMUVVGb1FpeEZRVUYxUWl4SlFVRjJRaXhEUVVSV0xFTkJSVUVzUTBGQlF5eFhRVVpFTEVOQlJXTXNXVUZHWkR0WFFVdEJMRWxCUVVrc1EwRkJReXhOUVVGTUxFZEJRV003UlVGYVNEczdhVU5CWTFvc2EwSkJRVUVzUjBGQmIwSXNVMEZCUlN4SlFVRkdPMGxCUlc1Q0xFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNTVUZCVkN4RFFVRmxMRXRCUVdZc1EwRkJjMElzUTBGQlF5eFJRVUYyUWl4RFFVRnBReXhsUVVGcVF5eERRVUZyUkN4RFFVRkRMRmRCUVc1RUxFTkJRV2RGTEdkQ1FVRm9SVHRYUVVWQkxFbEJRVWtzUTBGQlF5eEhRVWRNTEVOQlFVTXNWMEZJUkN4RFFVZGpMRWxCUVVNc1EwRkJRU3hSUVVGUkxFTkJRVU1zU1VGSWVFSXNRMEZOUVN4RFFVRkRMRWxCVGtRc1EwRk5UeXhIUVVGQkxFZEJRVWtzU1VGQlF5eERRVUZCTEZGQlFWRXNRMEZCUXl4WFFVNXlRaXhEUVU5QkxFTkJRVU1zVDBGUVJDeERRVTlWTEVkQlVGWXNSVUZQWlN4VFFVRkJPMkZCUVVjc1EwRkJRU3hEUVVGSExFbEJRVWdzUTBGQlV5eERRVUZETEUxQlFWWXNRMEZCUVR0SlFVRklMRU5CVUdZN1JVRktiVUk3TzJsRFFXRndRaXhoUVVGQkxFZEJRV1VzVTBGQlJTeExRVUZHTEVWQlFWTXNTVUZCVkR0WFFVTmtMR1ZCUVVFc1IwRkZXU3hKUVVGRExFTkJRVUVzVVVGQlVTeERRVUZETEVsQlJuUkNMRWRCUlRKQ0xGbEJSak5DTEVkQlJYRkRMRWxCUm5KRExFZEJSVEJETEhGRFFVWXhReXhIUVVkbExFbEJRVU1zUTBGQlFTeFJRVUZSTEVOQlFVTXNTMEZJZWtJc1IwRkhLMElzVjBGSUwwSXNSMEZIZDBNc1MwRkllRU1zUjBGSE9FTTdSVUZLYUVNN08ybERRVkZtTEZkQlFVRXNSMEZCWVN4VFFVRkJPMGxCUlZvc1NVRkJReXhEUVVGQkxFdEJRVVFzUjBGQlV6dEpRVWRVTEVOQlFVRXNRMEZCUnl4SFFVRkJMRWRCUVVrc1NVRkJReXhEUVVGQkxGRkJRVkVzUTBGQlF5eEpRVUZxUWl4RFFVRjVRaXhEUVVGRExFbEJRVEZDTEVOQlFXZERMRWxCUVVNc1EwRkJRU3hSUVVGcVF6dEZRVXhaT3p0cFEwRlJZaXhSUVVGQkxFZEJRVlVzVTBGQlJTeEhRVUZHTEVWQlFVOHNSVUZCVUR0QlFVTlVMRkZCUVVFN1NVRkJRU3hIUVVGQkxFZEJRVTBzUTBGQlFTeERRVUZITEVWQlFVZzdTVUZEVGl4SlFVRkRMRU5CUVVFc1MwRkJTeXhEUVVGRExFbEJRVkFzUTBGRFF6dE5RVUZCTEVWQlFVRXNSVUZCVVN4RlFVRlNPMDFCUTBFc1IwRkJRU3hGUVVGUkxFZEJSRkk3VFVGRlFTeEpRVUZCTEVWQlFWa3NTVUZCUVN4VFFVRkJMRU5CUVZjc1IwRkJXQ3hEUVVaYU8wMUJSMEVzVFVGQlFTeEZRVUZSTEV0QlNGSTdTMEZFUkR0RlFVWlRPenM3UVVGVlZqczdPenRwUTBGSFFTeFZRVUZCTEVkQlFWa3NVMEZCUVR0QlFVTllMRkZCUVVFN1FVRkJRVHRCUVVGQk8xTkJRVUVzY1VOQlFVRTdPMjFDUVVGQkxFbEJRVU1zUTBGQlFTeE5RVUZFTEVOQlFWTXNTVUZCVkR0QlFVRkJPenRGUVVSWE96dHBRMEZOV2l4UlFVRkJMRWRCUVZVc1UwRkJRVHRCUVVOVUxGRkJRVUU3UVVGQlFUdEJRVUZCTzFOQlFVRXNhVVJCUVVFN08wMUJRME1zU1VGQlJ5eERRVUZKTEVsQlFVa3NRMEZCUXl4TlFVRlVMRWxCUVc5Q0xFbEJRVU1zUTBGQlFTeGhRVUZFTEVOQlFXZENMRWxCUVVrc1EwRkJReXhGUVVGeVFpeERRVUYyUWp0eFFrRkRReXhKUVVGRExFTkJRVUVzU1VGQlJDeERRVUZQTEVsQlFWQXNSMEZFUkR0UFFVRkJMRTFCUVVFN05rSkJRVUU3TzBGQlJFUTdPMFZCUkZNN08ybERRVXRXTEdGQlFVRXNSMEZCWlN4VFFVRkZMRVZCUVVZN1FVRkRaQ3hSUVVGQk8wbEJRVUVzU1VGQmJVSXNaME5CUVc1Q08wRkJRVUVzWVVGQlR5eExRVUZRT3p0SlFVTkJMRWxCUVVFc1IwRkJUeXhGUVVGRkxFTkJRVU1zY1VKQlFVZ3NRMEZCUVR0SlFVZFFMRmRCUVVFc1IwRkJZenRCUVVOa0xGZEJSVU1zU1VGQlNTeERRVUZETEVkQlFVd3NSMEZCVnl4SlFVRkpMRU5CUVVNc1RVRkJhRUlzU1VGQk1FSXNRMEZCUXl4WFFVRXpRaXhKUVVORExFbEJRVWtzUTBGQlF5eE5RVUZNTEVkQlFXTXNTVUZCU1N4RFFVRkRMRTFCUVc1Q0xFbEJRVFpDTEZGQlFWRXNRMEZCUXl4TlFVRlVMRWRCUVd0Q0xGZEJSR2hFTEVsQlNVTXNTVUZCU1N4RFFVRkRMRWxCUVV3c1IwRkJXU3hKUVVGSkxFTkJRVU1zUzBGQmFrSXNTVUZCTUVJc1EwRkJReXhYUVVvMVFpeEpRVXRETEVsQlFVa3NRMEZCUXl4TFFVRk1MRWRCUVdFc1NVRkJTU3hEUVVGRExFdEJRV3hDTEVsQlFUSkNMRkZCUVZFc1EwRkJReXhMUVVGVUxFZEJRV2xDTzBWQlltaERPenRwUTBGcFFtWXNhMEpCUVVFc1IwRkJiMElzVTBGQlJTeEpRVUZHTzFkQlEyNUNMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zU1VGQlZDeERRVUZsTEVkQlFVRXNSMEZCU1N4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExGZEJRV1FzUjBGQk1FSXNXVUZCZWtNc1EwRkJjMFFzUTBGQlF5eE5RVUYyUkN4RFFVRkJPMFZCUkcxQ096dHBRMEZIY0VJc1QwRkJRU3hIUVVGVExGTkJRVUU3VjBGRFVpeEpRVUZETEVOQlFVRXNZVUZCUkN4RFFVRkJPMFZCUkZFN08ybERRVWRVTEdGQlFVRXNSMEZCWlN4VFFVRkJPMGxCUldRc1NVRkJReXhEUVVGQkxHdENRVUZFTEVkQlFYTkNMRU5CUVVNc1EwRkJReXhSUVVGR0xFTkJRVmtzU1VGQlF5eERRVUZCTEZGQlFXSXNSVUZCZFVJc1JVRkJka0k3VjBGRGRFSXNTMEZCU3l4RFFVRkRMRk5CUVU0c1EwRkJaMElzZVVKQlFXaENMRVZCUVRKRExFbEJRVU1zUTBGQlFTeHJRa0ZCTlVNc1JVRkJaMFVzUjBGQmFFVTdSVUZJWXpzN2FVTkJUV1lzWVVGQlFTeEhRVUZsTEZOQlFVRTdTVUZGWkN4SlFVRkRMRU5CUVVFc2EwSkJRVVFzUjBGQmMwSTdWMEZEZEVJc1MwRkJTeXhEUVVGRExGbEJRVTRzUTBGQmJVSXNlVUpCUVc1Q0xFVkJRVGhETEVsQlFVTXNRMEZCUVN4clFrRkJMME1zUlVGQmJVVXNSMEZCYmtVN1JVRklZenM3T3pzN08wRkJUMmhDTEUxQlFVMHNRMEZCUXl4UFFVRlFMRWRCUVdsQ0luMD1cbiIsInZhciBJdGVtX0RhdGE7XG5cbkl0ZW1fRGF0YSA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gSXRlbV9EYXRhKCRlbCkge1xuICAgIHZhciBkYXRhO1xuICAgIHRoaXMuJGVsID0gJGVsO1xuICAgIGRhdGEgPSAkZWwuZGF0YSgnaXRlbScpO1xuICAgIGlmICghZGF0YSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRWxlbWVudCBkb2Vzbid0IGNvbnRhaW4gYGRhdGEtaXRlbWAgYXR0cmlidXRlXCIpO1xuICAgIH1cbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICB9XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfZGF0YSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaW1hZ2U7XG4gICAgaW1hZ2UgPSB0aGlzLmRhdGFbJ2ltYWdlcyddW25hbWVdO1xuICAgIGlmICghaW1hZ2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGltYWdlO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X3NpemUgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGhlaWdodCwgaW1hZ2UsIHJlZiwgc2l6ZSwgd2lkdGg7XG4gICAgaW1hZ2UgPSB0aGlzLmdldF9kYXRhKG5hbWUpO1xuICAgIGlmICghaW1hZ2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgc2l6ZSA9IGltYWdlWydzaXplJ107XG4gICAgcmVmID0gc2l6ZS5zcGxpdCgneCcpLCB3aWR0aCA9IHJlZlswXSwgaGVpZ2h0ID0gcmVmWzFdO1xuICAgIHdpZHRoID0gcGFyc2VJbnQod2lkdGgpO1xuICAgIGhlaWdodCA9IHBhcnNlSW50KGhlaWdodCk7XG4gICAgcmV0dXJuIFt3aWR0aCwgaGVpZ2h0XTtcbiAgfTtcblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF91cmwgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGltYWdlO1xuICAgIGltYWdlID0gdGhpcy5nZXRfZGF0YShuYW1lKTtcbiAgICBpZiAoIWltYWdlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBpbWFnZVsndXJsJ107XG4gIH07XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfb3JfZmFsc2UgPSBmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAodGhpcy5kYXRhW2tleV0pIHtcbiAgICAgIHJldHVybiB0aGlzLmRhdGFba2V5XTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X3JhdGlvID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0X29yX2ZhbHNlKCdyYXRpbycpO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X3R5cGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRfb3JfZmFsc2UoJ3R5cGUnKTtcbiAgfTtcblxuICByZXR1cm4gSXRlbV9EYXRhO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEl0ZW1fRGF0YTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pU1hSbGJWOUVZWFJoTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lTWFJsYlY5RVlYUmhMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRU3hKUVVGQk96dEJRVUZOTzBWQlJWRXNiVUpCUVVVc1IwRkJSanRCUVVOYUxGRkJRVUU3U1VGQlFTeEpRVUZETEVOQlFVRXNSMEZCUkN4SFFVRlBPMGxCUTFBc1NVRkJRU3hIUVVGUExFZEJRVWNzUTBGQlF5eEpRVUZLTEVOQlFWVXNUVUZCVmp0SlFVVlFMRWxCUVVjc1EwRkJTU3hKUVVGUU8wRkJRME1zV1VGQlZTeEpRVUZCTEV0QlFVRXNRMEZCVFN3clEwRkJUaXhGUVVSWU96dEpRVWRCTEVsQlFVTXNRMEZCUVN4SlFVRkVMRWRCUVZFN1JVRlFTVHM3YzBKQlYySXNVVUZCUVN4SFFVRlZMRk5CUVVVc1NVRkJSanRCUVVOVUxGRkJRVUU3U1VGQlFTeExRVUZCTEVkQlFWRXNTVUZCUXl4RFFVRkJMRWxCUVUwc1EwRkJRU3hSUVVGQkxFTkJRVmtzUTBGQlFTeEpRVUZCTzBsQlF6TkNMRWxCUVdkQ0xFTkJRVWtzUzBGQmNFSTdRVUZCUVN4aFFVRlBMRTFCUVZBN08wRkJSVUVzVjBGQlR6dEZRVXBGT3p0elFrRk5WaXhSUVVGQkxFZEJRVlVzVTBGQlJTeEpRVUZHTzBGQlExUXNVVUZCUVR0SlFVRkJMRXRCUVVFc1IwRkJVU3hKUVVGRExFTkJRVUVzVVVGQlJDeERRVUZYTEVsQlFWZzdTVUZEVWl4SlFVRm5RaXhEUVVGSkxFdEJRWEJDTzBGQlFVRXNZVUZCVHl4TlFVRlFPenRKUVVWQkxFbEJRVUVzUjBGQlR5eExRVUZQTEVOQlFVRXNUVUZCUVR0SlFVVmtMRTFCUVd0Q0xFbEJRVWtzUTBGQlF5eExRVUZNTEVOQlFWa3NSMEZCV2l4RFFVRnNRaXhGUVVGRExHTkJRVVFzUlVGQlVUdEpRVVZTTEV0QlFVRXNSMEZCVVN4UlFVRkJMRU5CUVZVc1MwRkJWanRKUVVOU0xFMUJRVUVzUjBGQlV5eFJRVUZCTEVOQlFWVXNUVUZCVmp0QlFVVlVMRmRCUVU4c1EwRkJReXhMUVVGRUxFVkJRVkVzVFVGQlVqdEZRVmhGT3p0elFrRmhWaXhQUVVGQkxFZEJRVk1zVTBGQlJTeEpRVUZHTzBGQlExSXNVVUZCUVR0SlFVRkJMRXRCUVVFc1IwRkJVU3hKUVVGRExFTkJRVUVzVVVGQlJDeERRVUZYTEVsQlFWZzdTVUZEVWl4SlFVRm5RaXhEUVVGSkxFdEJRWEJDTzBGQlFVRXNZVUZCVHl4TlFVRlFPenRCUVVOQkxGZEJRVThzUzBGQlR5eERRVUZCTEV0QlFVRTdSVUZJVGpzN2MwSkJTMVFzV1VGQlFTeEhRVUZqTEZOQlFVVXNSMEZCUmp0SlFVTmlMRWxCUVVjc1NVRkJReXhEUVVGQkxFbEJRVTBzUTBGQlFTeEhRVUZCTEVOQlFWWTdRVUZEUXl4aFFVRlBMRWxCUVVNc1EwRkJRU3hKUVVGTkxFTkJRVUVzUjBGQlFTeEZRVVJtT3p0QlFVVkJMRmRCUVU4N1JVRklUVHM3YzBKQlMyUXNVMEZCUVN4SFFVRmpMRk5CUVVFN1YwRkJSeXhKUVVGRExFTkJRVUVzV1VGQlJDeERRVUZsTEU5QlFXWTdSVUZCU0RzN2MwSkJRMlFzVVVGQlFTeEhRVUZqTEZOQlFVRTdWMEZCUnl4SlFVRkRMRU5CUVVFc1dVRkJSQ3hEUVVGbExFMUJRV1k3UlVGQlNEczdPenM3TzBGQlIyWXNUVUZCVFN4RFFVRkRMRTlCUVZBc1IwRkJhVUlpZlE9PVxuIiwidmFyICQsIEFic3RyYWN0X0xhenlfTG9hZGVyLCBMYXp5X01hc29ucnksIF9fV0lORE9XLFxuICBleHRlbmQgPSBmdW5jdGlvbihjaGlsZCwgcGFyZW50KSB7IGZvciAodmFyIGtleSBpbiBwYXJlbnQpIHsgaWYgKGhhc1Byb3AuY2FsbChwYXJlbnQsIGtleSkpIGNoaWxkW2tleV0gPSBwYXJlbnRba2V5XTsgfSBmdW5jdGlvbiBjdG9yKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gY2hpbGQ7IH0gY3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlOyBjaGlsZC5wcm90b3R5cGUgPSBuZXcgY3RvcigpOyBjaGlsZC5fX3N1cGVyX18gPSBwYXJlbnQucHJvdG90eXBlOyByZXR1cm4gY2hpbGQ7IH0sXG4gIGhhc1Byb3AgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkFic3RyYWN0X0xhenlfTG9hZGVyID0gcmVxdWlyZSgnLi9BYnN0cmFjdF9MYXp5X0xvYWRlcicpO1xuXG5fX1dJTkRPVyA9IHJlcXVpcmUoJy4uL2NvcmUvV2luZG93Jyk7XG5cbkxhenlfTWFzb25yeSA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gIGV4dGVuZChMYXp5X01hc29ucnksIHN1cGVyQ2xhc3MpO1xuXG4gIGZ1bmN0aW9uIExhenlfTWFzb25yeSgpIHtcbiAgICByZXR1cm4gTGF6eV9NYXNvbnJ5Ll9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5yZXNpemVfYWxsID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wbGFjZWhvbGRlcl93aWR0aCA9ICQoJy5QUF9NYXNvbnJ5X19zaXplcicpLndpZHRoKCk7XG4gICAgcmV0dXJuIExhenlfTWFzb25yeS5fX3N1cGVyX18ucmVzaXplX2FsbC5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24oaXRlbSkge1xuICAgIHJldHVybiBpdGVtLiRlbC5jc3Moe1xuICAgICAgJ21pbi1oZWlnaHQnOiBNYXRoLmZsb29yKHRoaXMucGxhY2Vob2xkZXJfd2lkdGggLyBpdGVtLmRhdGEuZ2V0X3JhdGlvKCkpXG4gICAgfSk7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5jbGVhbnVwX2FmdGVyX2xvYWQgPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgaXRlbS4kZWwuY3NzKCdtaW4taGVpZ2h0JywgJycpO1xuICAgIHJldHVybiBMYXp5X01hc29ucnkuX19zdXBlcl9fLmNsZWFudXBfYWZ0ZXJfbG9hZC5jYWxsKHRoaXMsIGl0ZW0pO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUuYXR0YWNoX2V2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIExhenlfTWFzb25yeS5fX3N1cGVyX18uYXR0YWNoX2V2ZW50cy5jYWxsKHRoaXMpO1xuICAgIHJldHVybiAkKHdpbmRvdykub24oJ3Njcm9sbCcsIHRoaXMuZGVib3VuY2VkX2F1dG9sb2FkKTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmRldGFjaF9ldmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAkKHdpbmRvdykub2ZmKCdzY3JvbGwnLCB0aGlzLmRlYm91bmNlZF9hdXRvbG9hZCk7XG4gICAgcmV0dXJuIExhenlfTWFzb25yeS5fX3N1cGVyX18uZGV0YWNoX2V2ZW50cy5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpLCBpdGVtLCBrZXksIGxlbiwgcmVmO1xuICAgIHJlZiA9IHRoaXMuSXRlbXM7XG4gICAgZm9yIChrZXkgPSBpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsga2V5ID0gKytpKSB7XG4gICAgICBpdGVtID0gcmVmW2tleV07XG4gICAgICBpdGVtLiRlbC5jc3MoJ21pbi1oZWlnaHQnLCAnJyk7XG4gICAgfVxuICAgIHJldHVybiBMYXp5X01hc29ucnkuX19zdXBlcl9fLmRlc3Ryb3kuY2FsbCh0aGlzKTtcbiAgfTtcblxuICByZXR1cm4gTGF6eV9NYXNvbnJ5O1xuXG59KShBYnN0cmFjdF9MYXp5X0xvYWRlcik7XG5cbm1vZHVsZS5leHBvcnRzID0gTGF6eV9NYXNvbnJ5O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lUR0Y2ZVY5TllYTnZibko1TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lUR0Y2ZVY5TllYTnZibko1TG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4SlFVRkJMQ3REUVVGQk8wVkJRVUU3T3p0QlFVRkJMRU5CUVVFc1IwRkJTU3hQUVVGQkxFTkJRVk1zVVVGQlZEczdRVUZEU2l4dlFrRkJRU3hIUVVGMVFpeFBRVUZCTEVOQlFWTXNkMEpCUVZRN08wRkJRM1pDTEZGQlFVRXNSMEZCVnl4UFFVRkJMRU5CUVZNc1owSkJRVlE3TzBGQlJVdzdPenM3T3pzN2VVSkJSVXdzVlVGQlFTeEhRVUZaTEZOQlFVRTdTVUZEV0N4SlFVRkRMRU5CUVVFc2FVSkJRVVFzUjBGQmNVSXNRMEZCUVN4RFFVRkhMRzlDUVVGSUxFTkJRWGxDTEVOQlFVTXNTMEZCTVVJc1EwRkJRVHRYUVVOeVFpd3lRMEZCUVR0RlFVWlhPenQ1UWtGSldpeE5RVUZCTEVkQlFWRXNVMEZCUlN4SlFVRkdPMWRCUTFBc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eEhRVUZVTEVOQlFXRTdUVUZCUVN4WlFVRkJMRVZCUVdNc1NVRkJTU3hEUVVGRExFdEJRVXdzUTBGQldTeEpRVUZETEVOQlFVRXNhVUpCUVVRc1IwRkJjVUlzU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4VFFVRldMRU5CUVVFc1EwRkJha01zUTBGQlpEdExRVUZpTzBWQlJFODdPM2xDUVVkU0xHdENRVUZCTEVkQlFXOUNMRk5CUVVNc1NVRkJSRHRKUVVWdVFpeEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRWRCUVZRc1EwRkJZeXhaUVVGa0xFVkJRVFJDTEVWQlFUVkNPMWRCUjBFc2NVUkJRVThzU1VGQlVEdEZRVXh0UWpzN2VVSkJUM0JDTEdGQlFVRXNSMEZCWlN4VFFVRkJPMGxCUldRc09FTkJRVUU3VjBGSFFTeERRVUZCTEVOQlFVY3NUVUZCU0N4RFFVRlhMRU5CUVVNc1JVRkJXaXhEUVVGbExGRkJRV1lzUlVGQmVVSXNTVUZCUXl4RFFVRkJMR3RDUVVFeFFqdEZRVXhqT3p0NVFrRlRaaXhoUVVGQkxFZEJRV1VzVTBGQlFUdEpRVVZrTEVOQlFVRXNRMEZCUnl4TlFVRklMRU5CUVZjc1EwRkJReXhIUVVGYUxFTkJRV2RDTEZGQlFXaENMRVZCUVRCQ0xFbEJRVU1zUTBGQlFTeHJRa0ZCTTBJN1YwRkhRU3c0UTBGQlFUdEZRVXhqT3p0NVFrRlBaaXhQUVVGQkxFZEJRVk1zVTBGQlFUdEJRVU5TTEZGQlFVRTdRVUZCUVR0QlFVRkJMRk5CUVVFc2FVUkJRVUU3TzAxQlEwTXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhIUVVGVUxFTkJRV0VzV1VGQllpeEZRVUV5UWl4RlFVRXpRanRCUVVSRU8xZEJSVUVzZDBOQlFVRTdSVUZJVVRzN096dEhRV2hEYVVJN08wRkJjME16UWl4TlFVRk5MRU5CUVVNc1QwRkJVQ3hIUVVGcFFpSjlcbiIsInZhciAkLCBIb29rcywgY3JlYXRlLCBkZXN0cm95LCBpbnN0YW5jZTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbmluc3RhbmNlID0gZmFsc2U7XG5cbmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCFpbnN0YW5jZSkge1xuICAgIHJldHVybjtcbiAgfVxuICBpbnN0YW5jZS5kZXN0cm95KCk7XG4gIHJldHVybiBpbnN0YW5jZSA9IG51bGw7XG59O1xuXG5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIEhhbmRsZXI7XG4gIGRlc3Ryb3koKTtcbiAgSGFuZGxlciA9IEhvb2tzLmFwcGx5RmlsdGVycygncGhvcnQubGF6eS5oYW5kbGVyJywgZmFsc2UpO1xuICBpZiAoIUhhbmRsZXIpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaW5zdGFuY2UgPSBuZXcgSGFuZGxlcigpO1xufTtcblxuSG9va3MuYWRkQWN0aW9uKCdwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZScsIGNyZWF0ZSwgMTAwKTtcblxuSG9va3MuYWRkQWN0aW9uKCdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScsIGRlc3Ryb3kpO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3Bob3J0LnBvcnRmb2xpby5yZWZyZXNoJywgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBIb29rcy5kb0FjdGlvbigncGhvcnQubGF6eS5yZWZyZXNoJyk7XG59KTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYzNSaGNuUXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lKemRHRnlkQzVqYjJabVpXVWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklrRkJRVUVzU1VGQlFUczdRVUZCUVN4RFFVRkJMRWRCUVVrc1QwRkJRU3hEUVVGVExGRkJRVlE3TzBGQlEwb3NTMEZCUVN4SFFVRlJMRTlCUVVFc1EwRkJVeXhWUVVGVU96dEJRVWRTTEZGQlFVRXNSMEZCVnpzN1FVRkZXQ3hQUVVGQkxFZEJRVlVzVTBGQlFUdEZRVU5VTEVsQlFWVXNRMEZCU1N4UlFVRmtPMEZCUVVFc1YwRkJRVHM3UlVGRFFTeFJRVUZSTEVOQlFVTXNUMEZCVkN4RFFVRkJPMU5CUTBFc1VVRkJRU3hIUVVGWE8wRkJTRVk3TzBGQlMxWXNUVUZCUVN4SFFVRlRMRk5CUVVFN1FVRkhVaXhOUVVGQk8wVkJRVUVzVDBGQlFTeERRVUZCTzBWQlIwRXNUMEZCUVN4SFFVRlZMRXRCUVVzc1EwRkJReXhaUVVGT0xFTkJRVzFDTEc5Q1FVRnVRaXhGUVVGNVF5eExRVUY2UXp0RlFVTldMRWxCUVZVc1EwRkJTU3hQUVVGa08wRkJRVUVzVjBGQlFUczdSVUZKUVN4UlFVRkJMRWRCUVdVc1NVRkJRU3hQUVVGQkxFTkJRVUU3UVVGWVVEczdRVUZwUWxRc1MwRkJTeXhEUVVGRExGTkJRVTRzUTBGQlowSXNlVUpCUVdoQ0xFVkJRVEpETEUxQlFUTkRMRVZCUVcxRUxFZEJRVzVFT3p0QlFVTkJMRXRCUVVzc1EwRkJReXhUUVVGT0xFTkJRV2RDTEhsQ1FVRm9RaXhGUVVFeVF5eFBRVUV6UXpzN1FVRkpRU3hMUVVGTExFTkJRVU1zVTBGQlRpeERRVUZuUWl4NVFrRkJhRUlzUlVGQk1rTXNVMEZCUVR0VFFVTXhReXhMUVVGTExFTkJRVU1zVVVGQlRpeERRVUZsTEc5Q1FVRm1PMEZCUkRCRExFTkJRVE5ESW4wPVxuIiwidmFyIEhvb2tzLCBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlcjtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuXG4vKlxuXG4gICAgICogSW5pdGlhbGl6ZSBQb3J0Zm9saW8gQ29yZVxuXHQtLS1cblx0XHRVc2luZyBwNTAgQCBgcGhvcnQuY29yZS5yZWFkeWBcblx0XHRMYXRlIHByaW9yaXR5IGlzIGdvaW5nIHRvIGZvcmNlIGV4cGxpY2l0IHByaW9yaXR5IGluIGFueSBvdGhlciBtb3ZpbmcgcGFydHMgdGhhdCBhcmUgZ29pbmcgdG8gdG91Y2ggcG9ydGZvbGlvIGxheW91dCBhdCBgcGhvcnQubG9hZGVkYFxuXHQtLS1cbiAqL1xuXG5Qb3J0Zm9saW9fRXZlbnRfTWFuYWdlciA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gUG9ydGZvbGlvX0V2ZW50X01hbmFnZXIoKSB7fVxuXG4gIFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyLnByb3RvdHlwZS5wcmVwYXJlID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MuZG9BY3Rpb24oJ3Bob3J0LnBvcnRmb2xpby5wcmVwYXJlJyk7XG4gIH07XG5cbiAgUG9ydGZvbGlvX0V2ZW50X01hbmFnZXIucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLmRvQWN0aW9uKCdwaG9ydC5wb3J0Zm9saW8uY3JlYXRlJyk7XG4gIH07XG5cbiAgUG9ydGZvbGlvX0V2ZW50X01hbmFnZXIucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbigpIHtcbiAgICBIb29rcy5kb0FjdGlvbigncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnKTtcbiAgfTtcblxuICBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLmRvQWN0aW9uKCdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScpO1xuICB9O1xuXG4gIHJldHVybiBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlcjtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlcjtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVUc5eWRHWnZiR2x2WDBWMlpXNTBYMDFoYm1GblpYSXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lKUWIzSjBabTlzYVc5ZlJYWmxiblJmVFdGdVlXZGxjaTVqYjJabVpXVWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklrRkJRVUVzU1VGQlFUczdRVUZCUVN4TFFVRkJMRWRCUVZFc1QwRkJRU3hEUVVGVExGVkJRVlE3T3p0QlFVVlNPenM3T3pzN096czdRVUZUVFRzN08yOURRVVZNTEU5QlFVRXNSMEZCVXl4VFFVRkJPMGxCUTFJc1MwRkJTeXhEUVVGRExGRkJRVTRzUTBGQlpTeDVRa0ZCWmp0RlFVUlJPenR2UTBGSlZDeE5RVUZCTEVkQlFWRXNVMEZCUVR0SlFVTlFMRXRCUVVzc1EwRkJReXhSUVVGT0xFTkJRV1VzZDBKQlFXWTdSVUZFVHpzN2IwTkJTMUlzVDBGQlFTeEhRVUZUTEZOQlFVRTdTVUZEVWl4TFFVRkxMRU5CUVVNc1VVRkJUaXhEUVVGbExIbENRVUZtTzBWQlJGRTdPMjlEUVV0VUxFOUJRVUVzUjBGQlV5eFRRVUZCTzBsQlJWSXNTMEZCU3l4RFFVRkRMRkZCUVU0c1EwRkJaU3g1UWtGQlpqdEZRVVpST3pzN096czdRVUZOVml4TlFVRk5MRU5CUVVNc1QwRkJVQ3hIUVVGcFFpSjlcbiIsInZhciBIb29rcywgUG9ydGZvbGlvX0ludGVyZmFjZSxcbiAgYmluZCA9IGZ1bmN0aW9uKGZuLCBtZSl7IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7IH07IH07XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cblxuLypcblx0QWJzdHJhY3QgQ2xhc3MgUG9ydG9mbGlvX0V2ZW50X0ltZXBsZW1lbnRhdGlvblxuXG4gICAgSGFuZGxlcyBhbGwgdGhlIGV2ZW50cyByZXF1aXJlZCB0byBmdWxseSBoYW5kbGUgYSBwb3J0Zm9saW8gbGF5b3V0IHByb2Nlc3NcbiAqL1xuXG5Qb3J0Zm9saW9fSW50ZXJmYWNlID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBQb3J0Zm9saW9fSW50ZXJmYWNlKGFyZ3MpIHtcbiAgICB0aGlzLnB1cmdlX2FjdGlvbnMgPSBiaW5kKHRoaXMucHVyZ2VfYWN0aW9ucywgdGhpcyk7XG4gICAgdGhpcy5zZXR1cF9hY3Rpb25zKCk7XG4gICAgdGhpcy5pbml0aWFsaXplKGFyZ3MpO1xuICB9XG5cbiAgUG9ydGZvbGlvX0ludGVyZmFjZS5wcm90b3R5cGUuc2V0dXBfYWN0aW9ucyA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLmFkZEFjdGlvbigncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnLCB0aGlzLnByZXBhcmUsIDUwKTtcbiAgICBIb29rcy5hZGRBY3Rpb24oJ3Bob3J0LnBvcnRmb2xpby5jcmVhdGUnLCB0aGlzLmNyZWF0ZSwgNTApO1xuICAgIEhvb2tzLmFkZEFjdGlvbigncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCB0aGlzLnJlZnJlc2gsIDUwKTtcbiAgICBIb29rcy5hZGRBY3Rpb24oJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgdGhpcy5kZXN0cm95LCA1MCk7XG4gICAgcmV0dXJuIEhvb2tzLmFkZEFjdGlvbigncGhvcnQucG9ydGZvbGlvLmRlc3Ryb3knLCB0aGlzLnB1cmdlX2FjdGlvbnMsIDEwMCk7XG4gIH07XG5cbiAgUG9ydGZvbGlvX0ludGVyZmFjZS5wcm90b3R5cGUucHVyZ2VfYWN0aW9ucyA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLnJlbW92ZUFjdGlvbigncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnLCB0aGlzLnByZXBhcmUsIDUwKTtcbiAgICBIb29rcy5yZW1vdmVBY3Rpb24oJ3Bob3J0LnBvcnRmb2xpby5jcmVhdGUnLCB0aGlzLmNyZWF0ZSwgNTApO1xuICAgIEhvb2tzLnJlbW92ZUFjdGlvbigncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCB0aGlzLnJlZnJlc2gsIDUwKTtcbiAgICBIb29rcy5yZW1vdmVBY3Rpb24oJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgdGhpcy5kZXN0cm95LCA1MCk7XG4gICAgcmV0dXJuIEhvb2tzLnJlbW92ZUFjdGlvbigncGhvcnQucG9ydGZvbGlvLmRlc3Ryb3knLCB0aGlzLnB1cmdlX2FjdGlvbnMsIDEwMCk7XG4gIH07XG5cblxuICAvKlxuICAgICBcdFJlcXVpcmUgdGhlc2UgbWV0aG9kc1xuICAgKi9cblxuICBQb3J0Zm9saW9fSW50ZXJmYWNlLnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGBpbml0aWFsaXplYCBtZXRob2RcIik7XG4gIH07XG5cbiAgUG9ydGZvbGlvX0ludGVyZmFjZS5wcm90b3R5cGUucHJlcGFyZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgcHJlcGFyZWAgbWV0aG9kXCIpO1xuICB9O1xuXG4gIFBvcnRmb2xpb19JbnRlcmZhY2UucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgY3JlYXRlYCBtZXRob2RcIik7XG4gIH07XG5cbiAgUG9ydGZvbGlvX0ludGVyZmFjZS5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgcmVmcmVzaGAgbWV0aG9kXCIpO1xuICB9O1xuXG4gIFBvcnRmb2xpb19JbnRlcmZhY2UucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYGRlc3Ryb3lgIG1ldGhvZFwiKTtcbiAgfTtcblxuICByZXR1cm4gUG9ydGZvbGlvX0ludGVyZmFjZTtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW9fSW50ZXJmYWNlO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lVRzl5ZEdadmJHbHZYMGx1ZEdWeVptRmpaUzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklsQnZjblJtYjJ4cGIxOUpiblJsY21aaFkyVXVZMjltWm1WbElsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lKQlFVRkJMRWxCUVVFc01FSkJRVUU3UlVGQlFUczdRVUZCUVN4TFFVRkJMRWRCUVZFc1QwRkJRU3hEUVVGVExGVkJRVlE3T3p0QlFVZFNPenM3T3pzN1FVRkxUVHRGUVVWUkxEWkNRVUZGTEVsQlFVWTdPMGxCUTFvc1NVRkJReXhEUVVGQkxHRkJRVVFzUTBGQlFUdEpRVU5CTEVsQlFVTXNRMEZCUVN4VlFVRkVMRU5CUVdFc1NVRkJZanRGUVVaWk96dG5RMEZKWWl4aFFVRkJMRWRCUVdVc1UwRkJRVHRKUVVOa0xFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMSGxDUVVGb1FpeEZRVUV5UXl4SlFVRkRMRU5CUVVFc1QwRkJOVU1zUlVGQmNVUXNSVUZCY2tRN1NVRkRRU3hMUVVGTExFTkJRVU1zVTBGQlRpeERRVUZuUWl4M1FrRkJhRUlzUlVGQk1FTXNTVUZCUXl4RFFVRkJMRTFCUVRORExFVkJRVzFFTEVWQlFXNUVPMGxCUTBFc1MwRkJTeXhEUVVGRExGTkJRVTRzUTBGQlowSXNlVUpCUVdoQ0xFVkJRVEpETEVsQlFVTXNRMEZCUVN4UFFVRTFReXhGUVVGeFJDeEZRVUZ5UkR0SlFVTkJMRXRCUVVzc1EwRkJReXhUUVVGT0xFTkJRV2RDTEhsQ1FVRm9RaXhGUVVFeVF5eEpRVUZETEVOQlFVRXNUMEZCTlVNc1JVRkJjVVFzUlVGQmNrUTdWMEZEUVN4TFFVRkxMRU5CUVVNc1UwRkJUaXhEUVVGblFpeDVRa0ZCYUVJc1JVRkJNa01zU1VGQlF5eERRVUZCTEdGQlFUVkRMRVZCUVRKRUxFZEJRVE5FTzBWQlRHTTdPMmREUVU5bUxHRkJRVUVzUjBGQlpTeFRRVUZCTzBsQlEyUXNTMEZCU3l4RFFVRkRMRmxCUVU0c1EwRkJiVUlzZVVKQlFXNUNMRVZCUVRoRExFbEJRVU1zUTBGQlFTeFBRVUV2UXl4RlFVRjNSQ3hGUVVGNFJEdEpRVU5CTEV0QlFVc3NRMEZCUXl4WlFVRk9MRU5CUVcxQ0xIZENRVUZ1UWl4RlFVRTJReXhKUVVGRExFTkJRVUVzVFVGQk9VTXNSVUZCYzBRc1JVRkJkRVE3U1VGRFFTeExRVUZMTEVOQlFVTXNXVUZCVGl4RFFVRnRRaXg1UWtGQmJrSXNSVUZCT0VNc1NVRkJReXhEUVVGQkxFOUJRUzlETEVWQlFYZEVMRVZCUVhoRU8wbEJRMEVzUzBGQlN5eERRVUZETEZsQlFVNHNRMEZCYlVJc2VVSkJRVzVDTEVWQlFUaERMRWxCUVVNc1EwRkJRU3hQUVVFdlF5eEZRVUYzUkN4RlFVRjRSRHRYUVVOQkxFdEJRVXNzUTBGQlF5eFpRVUZPTEVOQlFXMUNMSGxDUVVGdVFpeEZRVUU0UXl4SlFVRkRMRU5CUVVFc1lVRkJMME1zUlVGQk9FUXNSMEZCT1VRN1JVRk1ZenM3TzBGQlVXWTdPenM3WjBOQlIwRXNWVUZCUVN4SFFVRlpMRk5CUVVFN1FVRkJSeXhWUVVGVkxFbEJRVUVzUzBGQlFTeERRVUZQTEhGR1FVRlFPMFZCUVdJN08yZERRVU5hTEU5QlFVRXNSMEZCV1N4VFFVRkJPMEZCUVVjc1ZVRkJWU3hKUVVGQkxFdEJRVUVzUTBGQlR5eHJSa0ZCVUR0RlFVRmlPenRuUTBGRFdpeE5RVUZCTEVkQlFWa3NVMEZCUVR0QlFVRkhMRlZCUVZVc1NVRkJRU3hMUVVGQkxFTkJRVThzYVVaQlFWQTdSVUZCWWpzN1owTkJRMW9zVDBGQlFTeEhRVUZaTEZOQlFVRTdRVUZCUnl4VlFVRlZMRWxCUVVFc1MwRkJRU3hEUVVGUExHdEdRVUZRTzBWQlFXSTdPMmREUVVOYUxFOUJRVUVzUjBGQldTeFRRVUZCTzBGQlFVY3NWVUZCVlN4SlFVRkJMRXRCUVVFc1EwRkJUeXhyUmtGQlVEdEZRVUZpT3pzN096czdRVUZKWWl4TlFVRk5MRU5CUVVNc1QwRkJVQ3hIUVVGcFFpSjlcbiIsIlxuLypcbiAgICBEZXBlbmRlbmNpZXNcbiAqL1xudmFyICQsIEhvb2tzLCBQb3J0Zm9saW9fSW50ZXJmYWNlLCBQb3J0Zm9saW9fTWFzb25yeSxcbiAgYmluZCA9IGZ1bmN0aW9uKGZuLCBtZSl7IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7IH07IH0sXG4gIGV4dGVuZCA9IGZ1bmN0aW9uKGNoaWxkLCBwYXJlbnQpIHsgZm9yICh2YXIga2V5IGluIHBhcmVudCkgeyBpZiAoaGFzUHJvcC5jYWxsKHBhcmVudCwga2V5KSkgY2hpbGRba2V5XSA9IHBhcmVudFtrZXldOyB9IGZ1bmN0aW9uIGN0b3IoKSB7IHRoaXMuY29uc3RydWN0b3IgPSBjaGlsZDsgfSBjdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7IGNoaWxkLnByb3RvdHlwZSA9IG5ldyBjdG9yKCk7IGNoaWxkLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7IHJldHVybiBjaGlsZDsgfSxcbiAgaGFzUHJvcCA9IHt9Lmhhc093blByb3BlcnR5O1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuUG9ydGZvbGlvX0ludGVyZmFjZSA9IHJlcXVpcmUoJy4vUG9ydGZvbGlvX0ludGVyZmFjZScpO1xuXG5Qb3J0Zm9saW9fTWFzb25yeSA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gIGV4dGVuZChQb3J0Zm9saW9fTWFzb25yeSwgc3VwZXJDbGFzcyk7XG5cbiAgZnVuY3Rpb24gUG9ydGZvbGlvX01hc29ucnkoKSB7XG4gICAgdGhpcy5yZWZyZXNoID0gYmluZCh0aGlzLnJlZnJlc2gsIHRoaXMpO1xuICAgIHRoaXMuZGVzdHJveSA9IGJpbmQodGhpcy5kZXN0cm95LCB0aGlzKTtcbiAgICB0aGlzLmNyZWF0ZSA9IGJpbmQodGhpcy5jcmVhdGUsIHRoaXMpO1xuICAgIHRoaXMucHJlcGFyZSA9IGJpbmQodGhpcy5wcmVwYXJlLCB0aGlzKTtcbiAgICByZXR1cm4gUG9ydGZvbGlvX01hc29ucnkuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUuRWxlbWVudHMgPSB7XG4gICAgY29udGFpbmVyOiAnUFBfTWFzb25yeScsXG4gICAgc2l6ZXI6ICdQUF9NYXNvbnJ5X19zaXplcicsXG4gICAgaXRlbTogJ1BQX01hc29ucnlfX2l0ZW0nXG4gIH07XG5cblxuICAvKlxuICBcdFx0SW5pdGlhbGl6ZVxuICAgKi9cblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLiRjb250YWluZXIgPSAkKFwiLlwiICsgdGhpcy5FbGVtZW50cy5jb250YWluZXIpO1xuICB9O1xuXG5cbiAgLypcbiAgXHRcdFByZXBhcmUgJiBBdHRhY2ggRXZlbnRzXG4gICAgIFx0RG9uJ3Qgc2hvdyBhbnl0aGluZyB5ZXQuXG4gIFxuICBcdFx0QGNhbGxlZCBvbiBob29rIGBwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZWBcbiAgICovXG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLnByZXBhcmUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbWFzb25yeV9zZXR0aW5ncztcbiAgICBpZiAodGhpcy4kY29udGFpbmVyLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLiRjb250YWluZXIuYWRkQ2xhc3MoJ1BQX0pTX19sb2FkaW5nX21hc29ucnknKTtcbiAgICB0aGlzLm1heWJlX2NyZWF0ZV9zaXplcigpO1xuICAgIG1hc29ucnlfc2V0dGluZ3MgPSBIb29rcy5hcHBseUZpbHRlcnMoJ3Bob3J0Lm1hc29ucnkuc2V0dGluZ3MnLCB7XG4gICAgICBpdGVtU2VsZWN0b3I6IFwiLlwiICsgdGhpcy5FbGVtZW50cy5pdGVtLFxuICAgICAgY29sdW1uV2lkdGg6IFwiLlwiICsgdGhpcy5FbGVtZW50cy5zaXplcixcbiAgICAgIGd1dHRlcjogMCxcbiAgICAgIGluaXRMYXlvdXQ6IGZhbHNlXG4gICAgfSk7XG4gICAgdGhpcy4kY29udGFpbmVyLm1hc29ucnkobWFzb25yeV9zZXR0aW5ncyk7XG4gICAgcmV0dXJuIHRoaXMuJGNvbnRhaW5lci5tYXNvbnJ5KCdvbmNlJywgJ2xheW91dENvbXBsZXRlJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIF90aGlzLiRjb250YWluZXIucmVtb3ZlQ2xhc3MoJ1BQX0pTX19sb2FkaW5nX21hc29ucnknKS5hZGRDbGFzcygnUFBfSlNfX2xvYWRpbmdfY29tcGxldGUnKTtcbiAgICAgICAgcmV0dXJuIEhvb2tzLmRvQWN0aW9uKCdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCcpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH07XG5cblxuICAvKlxuICBcdFx0U3RhcnQgdGhlIFBvcnRmb2xpb1xuICBcdFx0QGNhbGxlZCBvbiBob29rIGBwaG9ydC5wb3J0Zm9saW8uY3JlYXRlYFxuICAgKi9cblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kY29udGFpbmVyLm1hc29ucnkoKTtcbiAgfTtcblxuXG4gIC8qXG4gIFx0XHREZXN0cm95XG4gIFx0XHRAY2FsbGVkIG9uIGhvb2sgYHBob3J0LnBvcnRmb2xpby5kZXN0cm95YFxuICAgKi9cblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMubWF5YmVfcmVtb3ZlX3NpemVyKCk7XG4gICAgaWYgKHRoaXMuJGNvbnRhaW5lci5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLiRjb250YWluZXIubWFzb25yeSgnZGVzdHJveScpO1xuICAgIH1cbiAgfTtcblxuXG4gIC8qXG4gIFx0XHRSZWxvYWQgdGhlIGxheW91dFxuICBcdFx0QGNhbGxlZCBvbiBob29rIGBwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaGBcbiAgICovXG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy4kY29udGFpbmVyLm1hc29ucnkoJ2xheW91dCcpO1xuICB9O1xuXG5cbiAgLypcbiAgXHRcdENyZWF0ZSBhIHNpemVyIGVsZW1lbnQgZm9yIGpxdWVyeS1tYXNvbnJ5IHRvIHVzZVxuICAgKi9cblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUubWF5YmVfY3JlYXRlX3NpemVyID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuc2l6ZXJfZG9lc250X2V4aXN0KCkpIHtcbiAgICAgIHRoaXMuY3JlYXRlX3NpemVyKCk7XG4gICAgfVxuICB9O1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5tYXliZV9yZW1vdmVfc2l6ZXIgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy4kY29udGFpbmVyLmxlbmd0aCAhPT0gMSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLiRjb250YWluZXIuZmluZChcIi5cIiArIHRoaXMuRWxlbWVudHMuc2l6ZXIpLnJlbW92ZSgpO1xuICB9O1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5zaXplcl9kb2VzbnRfZXhpc3QgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy4kY29udGFpbmVyLmZpbmQoXCIuXCIgKyB0aGlzLkVsZW1lbnRzLnNpemVyKS5sZW5ndGggPT09IDA7XG4gIH07XG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLmNyZWF0ZV9zaXplciA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJGNvbnRhaW5lci5hcHBlbmQoXCI8ZGl2IGNsYXNzPVxcXCJcIiArIHRoaXMuRWxlbWVudHMuc2l6ZXIgKyBcIlxcXCI+PC9kaXY+XCIpO1xuICB9O1xuXG4gIHJldHVybiBQb3J0Zm9saW9fTWFzb25yeTtcblxufSkoUG9ydGZvbGlvX0ludGVyZmFjZSk7XG5cbndpbmRvdy5QUF9Nb2R1bGVzLlBvcnRmb2xpb19NYXNvbnJ5ID0gUG9ydGZvbGlvX01hc29ucnk7XG5cbm1vZHVsZS5leHBvcnRzID0gUG9ydGZvbGlvX01hc29ucnk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVVHOXlkR1p2YkdsdlgwMWhjMjl1Y25rdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUpRYjNKMFptOXNhVzlmVFdGemIyNXllUzVqYjJabVpXVWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqdEJRVUZCT3pzN1FVRkJRU3hKUVVGQkxHZEVRVUZCTzBWQlFVRTdPenM3UVVGSFFTeERRVUZCTEVkQlFVa3NUMEZCUVN4RFFVRlRMRkZCUVZRN08wRkJRMG9zUzBGQlFTeEhRVUZSTEU5QlFVRXNRMEZCVXl4VlFVRlVPenRCUVVOU0xHMUNRVUZCTEVkQlFYTkNMRTlCUVVFc1EwRkJVeXgxUWtGQlZEczdRVUZIYUVJN096czdPenM3T3pzN096aENRVVZNTEZGQlFVRXNSMEZEUXp0SlFVRkJMRk5CUVVFc1JVRkJWeXhaUVVGWU8wbEJRMEVzUzBGQlFTeEZRVUZYTEcxQ1FVUllPMGxCUlVFc1NVRkJRU3hGUVVGWExHdENRVVpZT3pzN08wRkJTVVE3T3pzN09FSkJSMEVzVlVGQlFTeEhRVUZaTEZOQlFVRTdWMEZEV0N4SlFVRkRMRU5CUVVFc1ZVRkJSQ3hIUVVGakxFTkJRVUVzUTBGQlJ5eEhRVUZCTEVkQlFVa3NTVUZCUXl4RFFVRkJMRkZCUVZFc1EwRkJReXhUUVVGcVFqdEZRVVJJT3pzN1FVRkhXanM3T3pzN096czRRa0ZOUVN4UFFVRkJMRWRCUVZNc1UwRkJRVHRCUVVOU0xGRkJRVUU3U1VGQlFTeEpRVUZWTEVsQlFVTXNRMEZCUVN4VlFVRlZMRU5CUVVNc1RVRkJXaXhMUVVGelFpeERRVUZvUXp0QlFVRkJMR0ZCUVVFN08wbEJSVUVzU1VGQlF5eERRVUZCTEZWQlFWVXNRMEZCUXl4UlFVRmFMRU5CUVhOQ0xIZENRVUYwUWp0SlFVVkJMRWxCUVVNc1EwRkJRU3hyUWtGQlJDeERRVUZCTzBsQlIwRXNaMEpCUVVFc1IwRkJiVUlzUzBGQlN5eERRVUZETEZsQlFVNHNRMEZCYlVJc2QwSkJRVzVDTEVWQlEyeENPMDFCUVVFc1dVRkJRU3hGUVVGakxFZEJRVUVzUjBGQlNTeEpRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRWxCUVRWQ08wMUJRMEVzVjBGQlFTeEZRVUZqTEVkQlFVRXNSMEZCU1N4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExFdEJSRFZDTzAxQlJVRXNUVUZCUVN4RlFVRmpMRU5CUm1RN1RVRkhRU3hWUVVGQkxFVkJRV01zUzBGSVpEdExRVVJyUWp0SlFVMXVRaXhKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEU5QlFWb3NRMEZCY1VJc1owSkJRWEpDTzFkQlJVRXNTVUZCUXl4RFFVRkJMRlZCUVZVc1EwRkJReXhQUVVGYUxFTkJRVzlDTEUxQlFYQkNMRVZCUVRSQ0xHZENRVUUxUWl4RlFVRTRReXhEUVVGQkxGTkJRVUVzUzBGQlFUdGhRVUZCTEZOQlFVRTdVVUZETjBNc1MwRkJReXhEUVVGQkxGVkJRMEVzUTBGQlF5eFhRVVJHTEVOQlEyVXNkMEpCUkdZc1EwRkZReXhEUVVGRExGRkJSa1lzUTBGRldTeDVRa0ZHV2p0bFFVMUJMRXRCUVVzc1EwRkJReXhSUVVGT0xFTkJRV1VzZVVKQlFXWTdUVUZRTmtNN1NVRkJRU3hEUVVGQkxFTkJRVUVzUTBGQlFTeEpRVUZCTEVOQlFUbERPMFZCYUVKUk96czdRVUV3UWxRN096czdPemhDUVVsQkxFMUJRVUVzUjBGQlVTeFRRVUZCTzBsQlExQXNTVUZCUXl4RFFVRkJMRlZCUVZVc1EwRkJReXhQUVVGYUxFTkJRVUU3UlVGRVR6czdPMEZCUzFJN096czdPemhDUVVsQkxFOUJRVUVzUjBGQlV5eFRRVUZCTzBsQlExSXNTVUZCUXl4RFFVRkJMR3RDUVVGRUxFTkJRVUU3U1VGRlFTeEpRVUZITEVsQlFVTXNRMEZCUVN4VlFVRlZMRU5CUVVNc1RVRkJXaXhIUVVGeFFpeERRVUY0UWp0TlFVTkRMRWxCUVVNc1EwRkJRU3hWUVVGVkxFTkJRVU1zVDBGQldpeERRVUZ4UWl4VFFVRnlRaXhGUVVSRU96dEZRVWhST3pzN1FVRlZWRHM3T3pzN09FSkJTVUVzVDBGQlFTeEhRVUZUTEZOQlFVRTdWMEZEVWl4SlFVRkRMRU5CUVVFc1ZVRkJWU3hEUVVGRExFOUJRVm9zUTBGQmNVSXNVVUZCY2tJN1JVRkVVVHM3TzBGQlMxUTdPenM3T0VKQlIwRXNhMEpCUVVFc1IwRkJiMElzVTBGQlFUdEpRVU51UWl4SlFVRnRRaXhKUVVGRExFTkJRVUVzYTBKQlFVUXNRMEZCUVN4RFFVRnVRanROUVVGQkxFbEJRVU1zUTBGQlFTeFpRVUZFTEVOQlFVRXNSVUZCUVRzN1JVRkViVUk3T3poQ1FVbHdRaXhyUWtGQlFTeEhRVUZ2UWl4VFFVRkJPMGxCUTI1Q0xFbEJRVlVzU1VGQlF5eERRVUZCTEZWQlFWVXNRMEZCUXl4TlFVRmFMRXRCUVhkQ0xFTkJRV3hETzBGQlFVRXNZVUZCUVRzN1NVRkRRU3hKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEVsQlFWb3NRMEZCYTBJc1IwRkJRU3hIUVVGSkxFbEJRVU1zUTBGQlFTeFJRVUZSTEVOQlFVTXNTMEZCYUVNc1EwRkJlVU1zUTBGQlF5eE5RVUV4UXl4RFFVRkJPMFZCUm0xQ096czRRa0ZMY0VJc2EwSkJRVUVzUjBGQmIwSXNVMEZCUVR0WFFVRkhMRWxCUVVNc1EwRkJRU3hWUVVGVkxFTkJRVU1zU1VGQldpeERRVUZyUWl4SFFVRkJMRWRCUVVrc1NVRkJReXhEUVVGQkxGRkJRVkVzUTBGQlF5eExRVUZvUXl4RFFVRjVReXhEUVVGRExFMUJRVEZETEV0QlFXOUVPMFZCUVhaRU96czRRa0ZIY0VJc1dVRkJRU3hIUVVGakxGTkJRVUU3U1VGRFlpeEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRTFCUVZvc1EwRkJiVUlzWlVGQlFTeEhRVUZwUWl4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExFdEJRVE5DTEVkQlFXbERMRmRCUVhCRU8wVkJSR0U3T3pzN1IwRTFSbWxDT3p0QlFXbEhhRU1zVFVGQlRTeERRVUZETEZWQlFWVXNRMEZCUXl4cFFrRkJiRUlzUjBGQmMwTTdPMEZCUTNSRExFMUJRVTBzUTBGQlF5eFBRVUZRTEVkQlFXbENJbjA9XG4iLCJcbi8qXG4gICAgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBIb29rcywgUG9ydGZvbGlvLCBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlciwgaXNfbWFzb25yeSwgbWF5YmVfbGF6eV9tYXNvbnJ5LCBzdGFydF9tYXNvbnJ5O1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5Qb3J0Zm9saW9fRXZlbnRfTWFuYWdlciA9IHJlcXVpcmUoJy4vUG9ydGZvbGlvX0V2ZW50X01hbmFnZXInKTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cblBvcnRmb2xpbyA9IG5ldyBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlcigpO1xuXG5pc19tYXNvbnJ5ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAkKCcuUFBfTWFzb25yeScpLmxlbmd0aCAhPT0gMDtcbn07XG5cbnN0YXJ0X21hc29ucnkgPSBmdW5jdGlvbigpIHtcbiAgdmFyIFBvcnRmb2xpb19NYXNvbnJ5O1xuICBpZiAoIWlzX21hc29ucnkoKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBQb3J0Zm9saW9fTWFzb25yeSA9IHJlcXVpcmUoJy4vUG9ydGZvbGlvX01hc29ucnknKTtcbiAgcmV0dXJuIG5ldyBQb3J0Zm9saW9fTWFzb25yeSgpO1xufTtcblxubWF5YmVfbGF6eV9tYXNvbnJ5ID0gZnVuY3Rpb24oaGFuZGxlcikge1xuICBpZiAoaXNfbWFzb25yeSgpKSB7XG4gICAgcmV0dXJuIHJlcXVpcmUoJ2xhenkvTGF6eV9NYXNvbnJ5Jyk7XG4gIH1cbiAgcmV0dXJuIGhhbmRsZXI7XG59O1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3Bob3J0LmNvcmUucmVhZHknLCBQb3J0Zm9saW8ucHJlcGFyZSwgNTApO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3Bob3J0LmNvcmUubG9hZGVkJywgUG9ydGZvbGlvLmNyZWF0ZSwgNTApO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3Bob3J0LmNvcmUucmVhZHknLCBzdGFydF9tYXNvbnJ5KTtcblxuSG9va3MuYWRkRmlsdGVyKCdwaG9ydC5sYXp5LmhhbmRsZXInLCBtYXliZV9sYXp5X21hc29ucnkpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2ljM1JoY25RdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUp6ZEdGeWRDNWpiMlptWldVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWp0QlFVRkJPenM3UVVGQlFTeEpRVUZCT3p0QlFVZEJMRXRCUVVFc1IwRkJVU3hQUVVGQkxFTkJRVk1zVlVGQlZEczdRVUZEVWl4MVFrRkJRU3hIUVVFd1FpeFBRVUZCTEVOQlFWTXNNa0pCUVZRN08wRkJRekZDTEVOQlFVRXNSMEZCU1N4UFFVRkJMRU5CUVZNc1VVRkJWRHM3UVVGSFNpeFRRVUZCTEVkQlFXZENMRWxCUVVFc2RVSkJRVUVzUTBGQlFUczdRVUZIYUVJc1ZVRkJRU3hIUVVGaExGTkJRVUU3UVVGRFdpeFRRVUZUTEVOQlFVRXNRMEZCUnl4aFFVRklMRU5CUVd0Q0xFTkJRVU1zVFVGQmJrSXNTMEZCSzBJN1FVRkVOVUk3TzBGQlNXSXNZVUZCUVN4SFFVRm5RaXhUUVVGQk8wRkJRMllzVFVGQlFUdEZRVUZCTEVsQlFXZENMRU5CUVVrc1ZVRkJRU3hEUVVGQkxFTkJRWEJDTzBGQlFVRXNWMEZCVHl4TlFVRlFPenRGUVVWQkxHbENRVUZCTEVkQlFXOUNMRTlCUVVFc1EwRkJVeXh4UWtGQlZEdFRRVU5vUWl4SlFVRkJMR2xDUVVGQkxFTkJRVUU3UVVGS1Z6czdRVUZOYUVJc2EwSkJRVUVzUjBGQmNVSXNVMEZCUlN4UFFVRkdPMFZCUlhCQ0xFbEJRWGxETEZWQlFVRXNRMEZCUVN4RFFVRjZRenRCUVVGQkxGZEJRVThzVDBGQlFTeERRVUZUTEcxQ1FVRlVMRVZCUVZBN08wRkJRMEVzVTBGQlR6dEJRVWhoT3p0QlFVOXlRaXhMUVVGTExFTkJRVU1zVTBGQlRpeERRVUZuUWl4clFrRkJhRUlzUlVGQmIwTXNVMEZCVXl4RFFVRkRMRTlCUVRsRExFVkJRWFZFTEVWQlFYWkVPenRCUVVOQkxFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMRzFDUVVGb1FpeEZRVUZ4UXl4VFFVRlRMRU5CUVVNc1RVRkJMME1zUlVGQmRVUXNSVUZCZGtRN08wRkJSMEVzUzBGQlN5eERRVUZETEZOQlFVNHNRMEZCWjBJc2EwSkJRV2hDTEVWQlFXOURMR0ZCUVhCRE96dEJRVWRCTEV0QlFVc3NRMEZCUXl4VFFVRk9MRU5CUVdkQ0xHOUNRVUZvUWl4RlFVRnpReXhyUWtGQmRFTWlmUT09XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
