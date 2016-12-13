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
var $, Abstract_Lazy_Loader, Hooks, Item_Data;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Item_Data = require('./Item_Data');

Abstract_Lazy_Loader = (function() {
  Abstract_Lazy_Loader.prototype.Elements = {
    item: 'PP_Lazy_Image',
    placeholder: 'PP_Lazy_Image__placeholder',
    link: 'PP_JS_Lazy__link',
    image: 'PP_JS_Lazy__image'
  };

  Abstract_Lazy_Loader.prototype.Items = [];

  function Abstract_Lazy_Loader() {
    this.setup_data();
    this.resize_all();
    this.attach_events();
  }


  /*
  		Abstract Methods
   */

  Abstract_Lazy_Loader.prototype.resize = function() {
    throw new Error("[Abstract] Any subclass of `Abstract_Lazy_Loader` must implement `resize` method");
  };

  Abstract_Lazy_Loader.prototype.load = function() {
    throw new Error("[Abstract] Any subclass of `Abstract_Lazy_Loader` must implement `load` method");
  };

  Abstract_Lazy_Loader.prototype.autoload = function() {
    throw new Error("[Abstract] Any subclass of `Abstract_Lazy_Loader` must implement `autoload` method");
  };

  Abstract_Lazy_Loader.prototype.setup_data = function() {
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

  Abstract_Lazy_Loader.prototype.load_all = function() {
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

  Abstract_Lazy_Loader.prototype.remove_placeholder = function(item) {
    return item.$el.find("." + this.Elements.placeholder + ", noscript").remove();
  };

  Abstract_Lazy_Loader.prototype.destroy = function() {
    return this.detach_events();
  };

  Abstract_Lazy_Loader.prototype.attach_events = function() {
    return Hooks.addAction('phort.lazy.autoload', this.autoload);
  };

  Abstract_Lazy_Loader.prototype.detach_events = function() {
    return Hooks.removeAction('phort.lazy.autoload', this.autoload);
  };

  return Abstract_Lazy_Loader;

})();

module.exports = Abstract_Lazy_Loader;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./Item_Data":6}],6:[function(require,module,exports){
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
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Abstract_Lazy_Loader = require('./Abstract_Lazy_Loader');

__WINDOW = require('../core/Window');

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

},{"../core/Window":3,"./Abstract_Lazy_Loader":5}],8:[function(require,module,exports){
(function (global){
var $, Hooks, Lazy_Masonry, init_lazy_loader, is_masonry, lazy_instance;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Lazy_Masonry = require('./Lazy_Masonry');

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
  return lazy_instance = new (Hooks.applyFilters('phort.lazy.handler', Lazy_Masonry));
};

Hooks.addAction('phort.portfolio.prepare', init_lazy_loader, 100);

Hooks.addAction('phort.portfolio.destroy', function() {
  if (lazy_instance) {
    lazy_instance.destroy();
    return lazy_instance = null;
  }
});

Hooks.addAction('phort.portfolio.refresh', function() {
  return Hooks.doAction('phort.lazy.autoload');
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./Lazy_Masonry":7}],9:[function(require,module,exports){
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
    Hooks.removeAction('phort.loaded', this.create, 50);
  };

  return Portfolio_Event_Manager;

})();

module.exports = Portfolio_Event_Manager;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],10:[function(require,module,exports){
(function (global){
var Hooks, Portfolio_Interface;

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);


/*
	Abstract Class Portoflio_Event_Imeplementation

    Handles all the events required to fully handle a portfolio layout process
 */

Portfolio_Interface = (function() {
  function Portfolio_Interface(args) {
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
var $, Hooks, Portfolio, Portfolio_Event_Manager;

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Portfolio_Event_Manager = require('./Portfolio_Event_Manager');

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Portfolio = new Portfolio_Event_Manager();

Hooks.addAction('phort.core.ready', Portfolio.prepare, 50);

Hooks.addAction('phort.core.loaded', Portfolio.create, 50);

Hooks.addAction('phort.core.ready', function() {
  var Portfolio_Masonry;
  if ($('.PP_Masonry').length === 0) {
    return false;
  }
  Portfolio_Masonry = require('./Portfolio_Masonry');
  return new Portfolio_Masonry();
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./Portfolio_Event_Manager":9,"./Portfolio_Masonry":11}]},{},[1])


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jb3JlL1Bob3RvZ3JhcGh5X1BvcnRmb2xpby5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY29yZS9XaW5kb3cuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvcG9wdXAuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvQWJzdHJhY3RfTGF6eV9Mb2FkZXIuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvSXRlbV9EYXRhLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0xhenlfTWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvbGF6eS9zdGFydC5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL1BvcnRmb2xpb19FdmVudF9NYW5hZ2VyLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9wb3J0Zm9saW8vUG9ydGZvbGlvX0ludGVyZmFjZS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL1BvcnRmb2xpb19NYXNvbnJ5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9wb3J0Zm9saW8vc3RhcnQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2xIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMzSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxuLypcbiAgICBMb2FkIERlcGVuZGVuY2llc1xuICovXG52YXIgJCwgSG9va3M7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG53aW5kb3cuUFBfTW9kdWxlcyA9IHtcbiAgUG9ydGZvbGlvX0ludGVyZmFjZTogcmVxdWlyZSgnLi9wb3J0Zm9saW8vUG9ydGZvbGlvX0ludGVyZmFjZScpLFxuICBJdGVtX0RhdGE6IHJlcXVpcmUoJy4vbGF6eS9JdGVtX0RhdGEnKSxcbiAgQWJzdHJhY3RfTGF6eV9Mb2FkZXI6IHJlcXVpcmUoJy4vbGF6eS9BYnN0cmFjdF9MYXp5X0xvYWRlcicpXG59O1xuXG5cbi8qXG5cdEJvb3Qgb24gYGRvY3VtZW50LnJlYWR5YFxuICovXG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICB2YXIgUGhvdG9ncmFwaHlfUG9ydGZvbGlvO1xuICBpZiAoISQoJ2JvZHknKS5oYXNDbGFzcygnUFBfUG9ydGZvbGlvJykpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgUGhvdG9ncmFwaHlfUG9ydGZvbGlvID0gbmV3IChyZXF1aXJlKCcuL2NvcmUvUGhvdG9ncmFwaHlfUG9ydGZvbGlvJykpKCk7XG4gIFBob3RvZ3JhcGh5X1BvcnRmb2xpby5yZWFkeSgpO1xufSk7XG5cblxuLypcblx0TG9hZCBBcHBcbiAqL1xuXG5yZXF1aXJlKCcuL3BvcnRmb2xpby9zdGFydCcpO1xuXG5yZXF1aXJlKCcuL2dhbGxlcnkvcG9wdXAnKTtcblxucmVxdWlyZSgnLi9sYXp5L3N0YXJ0Jyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVlYQndMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaVlYQndMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaU8wRkJRVUU3T3p0QlFVRkJMRWxCUVVFN08wRkJSMEVzUzBGQlFTeEhRVUZSTEU5QlFVRXNRMEZCVXl4VlFVRlVPenRCUVVOU0xFTkJRVUVzUjBGQlNTeFBRVUZCTEVOQlFWTXNVVUZCVkRzN1FVRkpTaXhOUVVGTkxFTkJRVU1zVlVGQlVDeEhRVVZETzBWQlFVRXNiVUpCUVVFc1JVRkJjVUlzVDBGQlFTeERRVUZUTEdsRFFVRlVMRU5CUVhKQ08wVkJSMEVzVTBGQlFTeEZRVUZYTEU5QlFVRXNRMEZCVXl4clFrRkJWQ3hEUVVoWU8wVkJUVUVzYjBKQlFVRXNSVUZCYzBJc1QwRkJRU3hEUVVGVExEWkNRVUZVTEVOQlRuUkNPenM3TzBGQlUwUTdPenM3UVVGSFFTeERRVUZCTEVOQlFVY3NVVUZCU0N4RFFVRmhMRU5CUVVNc1MwRkJaQ3hEUVVGdlFpeFRRVUZCTzBGQlIyNUNMRTFCUVVFN1JVRkJRU3hKUVVGVkxFTkJRVWtzUTBGQlFTeERRVUZITEUxQlFVZ3NRMEZCVnl4RFFVRkRMRkZCUVZvc1EwRkJjMElzWTBGQmRFSXNRMEZCWkR0QlFVRkJMRmRCUVVFN08wVkJSMEVzY1VKQlFVRXNSMEZCTkVJc1NVRkJRU3hEUVVGRkxFOUJRVUVzUTBGQlV5dzRRa0ZCVkN4RFFVRkdMRU5CUVVFc1EwRkJRVHRGUVVNMVFpeHhRa0ZCY1VJc1EwRkJReXhMUVVGMFFpeERRVUZCTzBGQlVHMUNMRU5CUVhCQ096czdRVUZaUVRzN096dEJRVXRCTEU5QlFVRXNRMEZCVVN4dFFrRkJVanM3UVVGSFFTeFBRVUZCTEVOQlFWRXNhVUpCUVZJN08wRkJSMEVzVDBGQlFTeERRVUZSTEdOQlFWSWlmUT09XG4iLCJcbi8qXG4gICAgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBDb3JlLCBIb29rcyxcbiAgYmluZCA9IGZ1bmN0aW9uKGZuLCBtZSl7IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7IH07IH07XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5Db3JlID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBDb3JlKCkge1xuICAgIHRoaXMud2FpdF9mb3JfbG9hZCA9IGJpbmQodGhpcy53YWl0X2Zvcl9sb2FkLCB0aGlzKTtcbiAgICB0aGlzLnJlYWR5ID0gYmluZCh0aGlzLnJlYWR5LCB0aGlzKTtcbiAgICBIb29rcy5hZGRBY3Rpb24oJ3Bob3J0LmNvcmUucmVhZHknLCB0aGlzLndhaXRfZm9yX2xvYWQpO1xuICB9XG5cbiAgQ29yZS5wcm90b3R5cGUucmVhZHkgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoSG9va3MuYXBwbHlGaWx0ZXJzKCdwaG9ydC5jb3JlLnJlYWR5JywgdHJ1ZSkpIHtcbiAgICAgIEhvb2tzLmRvQWN0aW9uKCdwaG9ydC5jb3JlLnJlYWR5Jyk7XG4gICAgfVxuICB9O1xuXG4gIENvcmUucHJvdG90eXBlLndhaXRfZm9yX2xvYWQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJCgnLlBQX1dyYXBwZXInKS5pbWFnZXNMb2FkZWQodGhpcy5sb2FkZWQpO1xuICB9O1xuXG4gIENvcmUucHJvdG90eXBlLmxvYWRlZCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChIb29rcy5hcHBseUZpbHRlcnMoJ3Bob3J0LmNvcmUubG9hZGVkJywgdHJ1ZSkpIHtcbiAgICAgIEhvb2tzLmRvQWN0aW9uKCdwaG9ydC5jb3JlLmxvYWRlZCcpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gQ29yZTtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb3JlO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lVR2h2ZEc5bmNtRndhSGxmVUc5eWRHWnZiR2x2TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lVR2h2ZEc5bmNtRndhSGxmVUc5eWRHWnZiR2x2TG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lPMEZCUVVFN096dEJRVUZCTEVsQlFVRXNZMEZCUVR0RlFVRkJPenRCUVVkQkxFTkJRVUVzUjBGQlNTeFBRVUZCTEVOQlFWTXNVVUZCVkRzN1FVRkRTaXhMUVVGQkxFZEJRVkVzVDBGQlFTeERRVUZUTEZWQlFWUTdPMEZCUjBZN1JVRkZVU3hqUVVGQk96czdTVUZEV2l4TFFVRkxMRU5CUVVNc1UwRkJUaXhEUVVGblFpeHJRa0ZCYUVJc1JVRkJiME1zU1VGQlF5eERRVUZCTEdGQlFYSkRPMFZCUkZrN08ybENRVWxpTEV0QlFVRXNSMEZCVHl4VFFVRkJPMGxCUTA0c1NVRkJSeXhMUVVGTExFTkJRVU1zV1VGQlRpeERRVUZ2UWl4clFrRkJjRUlzUlVGQmQwTXNTVUZCZUVNc1EwRkJTRHROUVVORExFdEJRVXNzUTBGQlF5eFJRVUZPTEVOQlFXVXNhMEpCUVdZc1JVRkVSRHM3UlVGRVRUczdhVUpCUzFBc1lVRkJRU3hIUVVGbExGTkJRVUU3VjBGRlpDeERRVUZCTEVOQlFVY3NZVUZCU0N4RFFVRnJRaXhEUVVGRExGbEJRVzVDTEVOQlFXbERMRWxCUVVNc1EwRkJRU3hOUVVGc1F6dEZRVVpqT3p0cFFrRkxaaXhOUVVGQkxFZEJRVkVzVTBGQlFUdEpRVU5RTEVsQlFVY3NTMEZCU3l4RFFVRkRMRmxCUVU0c1EwRkJiMElzYlVKQlFYQkNMRVZCUVhsRExFbEJRWHBETEVOQlFVZzdUVUZEUXl4TFFVRkxMRU5CUVVNc1VVRkJUaXhEUVVGbExHMUNRVUZtTEVWQlJFUTdPMFZCUkU4N096czdPenRCUVU5VUxFMUJRVTBzUTBGQlF5eFBRVUZRTEVkQlFXbENJbjA9XG4iLCJ2YXIgSG9va3MsIGdldF9zaXplO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5nZXRfc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHdpZHRoOiB3aW5kb3cuaW5uZXJXaWR0aCB8fCAkd2luZG93LndpZHRoKCksXG4gICAgaGVpZ2h0OiB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgJHdpbmRvdy5oZWlnaHQoKVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBnZXRfc2l6ZSgpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lWMmx1Wkc5M0xtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpVjJsdVpHOTNMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRU3hKUVVGQk96dEJRVUZCTEV0QlFVRXNSMEZCVVN4UFFVRkJMRU5CUVZNc1ZVRkJWRHM3UVVGSFVpeFJRVUZCTEVkQlFWY3NVMEZCUVR0VFFVTldPMGxCUVVFc1MwRkJRU3hGUVVGUkxFMUJRVTBzUTBGQlF5eFZRVUZRTEVsQlFYRkNMRTlCUVU4c1EwRkJReXhMUVVGU0xFTkJRVUVzUTBGQk4wSTdTVUZEUVN4TlFVRkJMRVZCUVZFc1RVRkJUU3hEUVVGRExGZEJRVkFzU1VGQmMwSXNUMEZCVHl4RFFVRkRMRTFCUVZJc1EwRkJRU3hEUVVRNVFqczdRVUZFVlRzN1FVRkxXQ3hOUVVGTkxFTkJRVU1zVDBGQlVDeEhRVUZwUWl4UlFVRkJMRU5CUVVFaWZRPT1cbiIsIlxuLypcbiAgICBEZXBlbmRlbmNpZXNcbiAqL1xudmFyICQsIEhvb2tzLCBJdGVtX0RhdGEsIGdldF9kYXRhO1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuSXRlbV9EYXRhID0gcmVxdWlyZSgnLi4vbGF6eS9JdGVtX0RhdGEnKTtcblxuZ2V0X2RhdGEgPSBmdW5jdGlvbihlbCkge1xuICB2YXIgJGNvbnRhaW5lciwgJGVsLCAkaXRlbXMsIGl0ZW1zO1xuICAkZWwgPSAkKGVsKTtcbiAgJGNvbnRhaW5lciA9ICRlbC5jbG9zZXN0KCcuUFBfR2FsbGVyeScpO1xuICAkaXRlbXMgPSAkY29udGFpbmVyLmZpbmQoJy5QUF9HYWxsZXJ5X19pdGVtJyk7XG4gIGl0ZW1zID0gJGl0ZW1zLm1hcChmdW5jdGlvbihrZXksIGl0ZW0pIHtcbiAgICB2YXIgZnVsbCwgaXRlbV9kYXRhO1xuICAgIGl0ZW1fZGF0YSA9IG5ldyBJdGVtX0RhdGEoJChpdGVtKSk7XG4gICAgaWYgKGl0ZW1fZGF0YS5nZXRfdHlwZSgpID09PSAndmlkZW8nKSB7XG4gICAgICBmdWxsID0gaXRlbV9kYXRhLmdldF9vcl9mYWxzZSgndmlkZW9fdXJsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZ1bGwgPSBpdGVtX2RhdGEuZ2V0X3VybCgnZnVsbCcpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgc3JjOiBmdWxsLFxuICAgICAgdGh1bWI6IGl0ZW1fZGF0YS5nZXRfdXJsKCd0aHVtYicpXG4gICAgfTtcbiAgfSk7XG4gIHJldHVybiBpdGVtcztcbn07XG5cblxuLypcbiAgICBAVE9ETzogTmVlZCBkZXRhY2gvZGVzdHJveSBtZXRob2RzXG4gKi9cblxuSG9va3MuYWRkQWN0aW9uKCdwaG9ydC5jb3JlLnJlYWR5JywgZnVuY3Rpb24oKSB7XG4gIHJldHVybiAkKCcuUFBfR2FsbGVyeV9faXRlbScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgJGVsO1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkZWwgPSAkKHRoaXMpO1xuICAgIHJldHVybiAkZWwubGlnaHRHYWxsZXJ5KHtcbiAgICAgIGR5bmFtaWM6IHRydWUsXG4gICAgICBkeW5hbWljRWw6IGdldF9kYXRhKHRoaXMpLFxuICAgICAgaW5kZXg6ICQoJy5QUF9HYWxsZXJ5X19pdGVtJykuaW5kZXgoJGVsKSxcbiAgICAgIHNwZWVkOiAzNTAsXG4gICAgICBwcmVsb2FkOiAzLFxuICAgICAgZG93bmxvYWQ6IGZhbHNlLFxuICAgICAgdmlkZW9NYXhXaWR0aDogJCh3aW5kb3cpLndpZHRoKCkgKiAwLjhcbiAgICB9KTtcbiAgfSk7XG59KTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pY0c5d2RYQXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lKd2IzQjFjQzVqYjJabVpXVWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqdEJRVUZCT3pzN1FVRkJRU3hKUVVGQk96dEJRVWRCTEVOQlFVRXNSMEZCU1N4UFFVRkJMRU5CUVZNc1VVRkJWRHM3UVVGRFNpeExRVUZCTEVkQlFWRXNUMEZCUVN4RFFVRlRMRlZCUVZRN08wRkJRMUlzVTBGQlFTeEhRVUZaTEU5QlFVRXNRMEZCVXl4dFFrRkJWRHM3UVVGRldpeFJRVUZCTEVkQlFWY3NVMEZCUlN4RlFVRkdPMEZCUTFZc1RVRkJRVHRGUVVGQkxFZEJRVUVzUjBGQlRTeERRVUZCTEVOQlFVY3NSVUZCU0R0RlFVTk9MRlZCUVVFc1IwRkJZU3hIUVVGSExFTkJRVU1zVDBGQlNpeERRVUZoTEdGQlFXSTdSVUZGWWl4TlFVRkJMRWRCUVZNc1ZVRkJWU3hEUVVGRExFbEJRVmdzUTBGQmFVSXNiVUpCUVdwQ08wVkJSVlFzUzBGQlFTeEhRVUZSTEUxQlFVMHNRMEZCUXl4SFFVRlFMRU5CUVZjc1UwRkJSU3hIUVVGR0xFVkJRVThzU1VGQlVEdEJRVU5zUWl4UlFVRkJPMGxCUVVFc1UwRkJRU3hIUVVGblFpeEpRVUZCTEZOQlFVRXNRMEZCVnl4RFFVRkJMRU5CUVVjc1NVRkJTQ3hEUVVGWU8wbEJSMmhDTEVsQlFVY3NVMEZCVXl4RFFVRkRMRkZCUVZZc1EwRkJRU3hEUVVGQkxFdEJRWGRDTEU5QlFUTkNPMDFCUTBNc1NVRkJRU3hIUVVGUExGTkJRVk1zUTBGQlF5eFpRVUZXTEVOQlFYZENMRmRCUVhoQ0xFVkJSRkk3UzBGQlFTeE5RVUZCTzAxQlIwTXNTVUZCUVN4SFFVRlBMRk5CUVZNc1EwRkJReXhQUVVGV0xFTkJRVzFDTEUxQlFXNUNMRVZCU0ZJN08wRkJTMEVzVjBGQlR6dE5RVU5PTEVkQlFVRXNSVUZCVHl4SlFVUkVPMDFCUlU0c1MwRkJRU3hGUVVGUExGTkJRVk1zUTBGQlF5eFBRVUZXTEVOQlFXMUNMRTlCUVc1Q0xFTkJSa1E3TzBWQlZGY3NRMEZCV0R0QlFXVlNMRk5CUVU4N1FVRnlRa2M3T3p0QlFYVkNXRHM3T3p0QlFVZEJMRXRCUVVzc1EwRkJReXhUUVVGT0xFTkJRV2RDTEd0Q1FVRm9RaXhGUVVGdlF5eFRRVUZCTzFOQlJXNURMRU5CUVVFc1EwRkJSeXh0UWtGQlNDeERRVUYzUWl4RFFVRkRMRVZCUVhwQ0xFTkJRVFJDTEU5QlFUVkNMRVZCUVhGRExGTkJRVVVzUTBGQlJqdEJRVU53UXl4UlFVRkJPMGxCUVVFc1EwRkJReXhEUVVGRExHTkJRVVlzUTBGQlFUdEpRVWRCTEVkQlFVRXNSMEZCVFN4RFFVRkJMRU5CUVVjc1NVRkJTRHRYUVVkT0xFZEJRVWNzUTBGQlF5eFpRVUZLTEVOQlEwTTdUVUZCUVN4UFFVRkJMRVZCUVZjc1NVRkJXRHROUVVOQkxGTkJRVUVzUlVGQlZ5eFJRVUZCTEVOQlFWVXNTVUZCVml4RFFVUllPMDFCUlVFc1MwRkJRU3hGUVVGWExFTkJRVUVzUTBGQlJ5eHRRa0ZCU0N4RFFVRjNRaXhEUVVGRExFdEJRWHBDTEVOQlFTdENMRWRCUVM5Q0xFTkJSbGc3VFVGSFFTeExRVUZCTEVWQlFWY3NSMEZJV0R0TlFVbEJMRTlCUVVFc1JVRkJWeXhEUVVwWU8wMUJTMEVzVVVGQlFTeEZRVUZYTEV0QlRGZzdUVUZOUVN4aFFVRkJMRVZCUVdVc1EwRkJRU3hEUVVGRkxFMUJRVVlzUTBGQlV5eERRVUZETEV0QlFWWXNRMEZCUVN4RFFVRkJMRWRCUVc5Q0xFZEJUbTVETzB0QlJFUTdSVUZRYjBNc1EwRkJja003UVVGR2JVTXNRMEZCY0VNaWZRPT1cbiIsIlxuLypcbiAgICBEZXBlbmRlbmNpZXNcbiAqL1xudmFyICQsIEFic3RyYWN0X0xhenlfTG9hZGVyLCBIb29rcywgSXRlbV9EYXRhO1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuSXRlbV9EYXRhID0gcmVxdWlyZSgnLi9JdGVtX0RhdGEnKTtcblxuQWJzdHJhY3RfTGF6eV9Mb2FkZXIgPSAoZnVuY3Rpb24oKSB7XG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5FbGVtZW50cyA9IHtcbiAgICBpdGVtOiAnUFBfTGF6eV9JbWFnZScsXG4gICAgcGxhY2Vob2xkZXI6ICdQUF9MYXp5X0ltYWdlX19wbGFjZWhvbGRlcicsXG4gICAgbGluazogJ1BQX0pTX0xhenlfX2xpbmsnLFxuICAgIGltYWdlOiAnUFBfSlNfTGF6eV9faW1hZ2UnXG4gIH07XG5cbiAgQWJzdHJhY3RfTGF6eV9Mb2FkZXIucHJvdG90eXBlLkl0ZW1zID0gW107XG5cbiAgZnVuY3Rpb24gQWJzdHJhY3RfTGF6eV9Mb2FkZXIoKSB7XG4gICAgdGhpcy5zZXR1cF9kYXRhKCk7XG4gICAgdGhpcy5yZXNpemVfYWxsKCk7XG4gICAgdGhpcy5hdHRhY2hfZXZlbnRzKCk7XG4gIH1cblxuXG4gIC8qXG4gIFx0XHRBYnN0cmFjdCBNZXRob2RzXG4gICAqL1xuXG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgQWJzdHJhY3RfTGF6eV9Mb2FkZXJgIG11c3QgaW1wbGVtZW50IGByZXNpemVgIG1ldGhvZFwiKTtcbiAgfTtcblxuICBBYnN0cmFjdF9MYXp5X0xvYWRlci5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBBYnN0cmFjdF9MYXp5X0xvYWRlcmAgbXVzdCBpbXBsZW1lbnQgYGxvYWRgIG1ldGhvZFwiKTtcbiAgfTtcblxuICBBYnN0cmFjdF9MYXp5X0xvYWRlci5wcm90b3R5cGUuYXV0b2xvYWQgPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgQWJzdHJhY3RfTGF6eV9Mb2FkZXJgIG11c3QgaW1wbGVtZW50IGBhdXRvbG9hZGAgbWV0aG9kXCIpO1xuICB9O1xuXG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5zZXR1cF9kYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyICRpdGVtcztcbiAgICB0aGlzLkl0ZW1zID0gW107XG4gICAgJGl0ZW1zID0gJChcIi5cIiArIHRoaXMuRWxlbWVudHMuaXRlbSk7XG4gICAgJGl0ZW1zLmVhY2goKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oa2V5LCBlbCkge1xuICAgICAgICB2YXIgJGVsO1xuICAgICAgICAkZWwgPSAkKGVsKTtcbiAgICAgICAgcmV0dXJuIF90aGlzLkl0ZW1zLnB1c2goe1xuICAgICAgICAgIGVsOiBlbCxcbiAgICAgICAgICAkZWw6ICRlbCxcbiAgICAgICAgICBkYXRhOiBuZXcgSXRlbV9EYXRhKCRlbCksXG4gICAgICAgICAgbG9hZGVkOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9O1xuXG5cbiAgLypcbiAgXHRcdE1ldGhvZHNcbiAgICovXG5cbiAgQWJzdHJhY3RfTGF6eV9Mb2FkZXIucHJvdG90eXBlLnJlc2l6ZV9hbGwgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaSwgaXRlbSwgbGVuLCByZWYsIHJlc3VsdHM7XG4gICAgcmVmID0gdGhpcy5JdGVtcztcbiAgICByZXN1bHRzID0gW107XG4gICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpdGVtID0gcmVmW2ldO1xuICAgICAgcmVzdWx0cy5wdXNoKHRoaXMucmVzaXplKGl0ZW0pKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgQWJzdHJhY3RfTGF6eV9Mb2FkZXIucHJvdG90eXBlLmxvYWRfYWxsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGksIGl0ZW0sIGxlbiwgcmVmLCByZXN1bHRzO1xuICAgIHJlZiA9IHRoaXMuSXRlbXM7XG4gICAgcmVzdWx0cyA9IFtdO1xuICAgIGZvciAoaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgaXRlbSA9IHJlZltpXTtcbiAgICAgIHRoaXMubG9hZChpdGVtKTtcbiAgICAgIHJlc3VsdHMucHVzaCh0aGlzLnJlbW92ZV9wbGFjZWhvbGRlcihpdGVtKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5yZW1vdmVfcGxhY2Vob2xkZXIgPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0uJGVsLmZpbmQoXCIuXCIgKyB0aGlzLkVsZW1lbnRzLnBsYWNlaG9sZGVyICsgXCIsIG5vc2NyaXB0XCIpLnJlbW92ZSgpO1xuICB9O1xuXG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZGV0YWNoX2V2ZW50cygpO1xuICB9O1xuXG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5hdHRhY2hfZXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEhvb2tzLmFkZEFjdGlvbigncGhvcnQubGF6eS5hdXRvbG9hZCcsIHRoaXMuYXV0b2xvYWQpO1xuICB9O1xuXG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5kZXRhY2hfZXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEhvb2tzLnJlbW92ZUFjdGlvbigncGhvcnQubGF6eS5hdXRvbG9hZCcsIHRoaXMuYXV0b2xvYWQpO1xuICB9O1xuXG4gIHJldHVybiBBYnN0cmFjdF9MYXp5X0xvYWRlcjtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBBYnN0cmFjdF9MYXp5X0xvYWRlcjtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pUVdKemRISmhZM1JmVEdGNmVWOU1iMkZrWlhJdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUpCWW5OMGNtRmpkRjlNWVhwNVgweHZZV1JsY2k1amIyWm1aV1VpWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanRCUVVGQk96czdRVUZCUVN4SlFVRkJPenRCUVVkQkxFTkJRVUVzUjBGQlNTeFBRVUZCTEVOQlFWTXNVVUZCVkRzN1FVRkRTaXhMUVVGQkxFZEJRVkVzVDBGQlFTeERRVUZUTEZWQlFWUTdPMEZCUTFJc1UwRkJRU3hIUVVGWkxFOUJRVUVzUTBGQlV5eGhRVUZVT3p0QlFVVk9PMmxEUVVWTUxGRkJRVUVzUjBGRFF6dEpRVUZCTEVsQlFVRXNSVUZCWVN4bFFVRmlPMGxCUTBFc1YwRkJRU3hGUVVGaExEUkNRVVJpTzBsQlJVRXNTVUZCUVN4RlFVRmhMR3RDUVVaaU8wbEJSMEVzUzBGQlFTeEZRVUZoTEcxQ1FVaGlPenM3YVVOQlMwUXNTMEZCUVN4SFFVRlBPenRGUVVkTkxEaENRVUZCTzBsQlExb3NTVUZCUXl4RFFVRkJMRlZCUVVRc1EwRkJRVHRKUVVOQkxFbEJRVU1zUTBGQlFTeFZRVUZFTEVOQlFVRTdTVUZEUVN4SlFVRkRMRU5CUVVFc1lVRkJSQ3hEUVVGQk8wVkJTRms3T3p0QlFVMWlPenM3TzJsRFFVZEJMRTFCUVVFc1IwRkJWU3hUUVVGQk8wRkJRVWNzVlVGQlZTeEpRVUZCTEV0QlFVRXNRMEZCVHl4clJrRkJVRHRGUVVGaU96dHBRMEZEVml4SlFVRkJMRWRCUVZVc1UwRkJRVHRCUVVGSExGVkJRVlVzU1VGQlFTeExRVUZCTEVOQlFVOHNaMFpCUVZBN1JVRkJZanM3YVVOQlExWXNVVUZCUVN4SFFVRlZMRk5CUVVFN1FVRkJSeXhWUVVGVkxFbEJRVUVzUzBGQlFTeERRVUZQTEc5R1FVRlFPMFZCUVdJN08ybERRVWRXTEZWQlFVRXNSMEZCV1N4VFFVRkJPMEZCUlZnc1VVRkJRVHRKUVVGQkxFbEJRVU1zUTBGQlFTeExRVUZFTEVkQlFWTTdTVUZGVkN4TlFVRkJMRWRCUVZNc1EwRkJRU3hEUVVGSExFZEJRVUVzUjBGQlNTeEpRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRWxCUVdwQ08wbEJSVlFzVFVGQlRTeERRVUZETEVsQlFWQXNRMEZCV1N4RFFVRkJMRk5CUVVFc1MwRkJRVHRoUVVGQkxGTkJRVVVzUjBGQlJpeEZRVUZQTEVWQlFWQTdRVUZGV0N4WlFVRkJPMUZCUVVFc1IwRkJRU3hIUVVGTkxFTkJRVUVzUTBGQlJ5eEZRVUZJTzJWQlEwNHNTMEZCUXl4RFFVRkJMRXRCUVVzc1EwRkJReXhKUVVGUUxFTkJRME03VlVGQlFTeEZRVUZCTEVWQlFWRXNSVUZCVWp0VlFVTkJMRWRCUVVFc1JVRkJVU3hIUVVSU08xVkJSVUVzU1VGQlFTeEZRVUZaTEVsQlFVRXNVMEZCUVN4RFFVRlhMRWRCUVZnc1EwRkdXanRWUVVkQkxFMUJRVUVzUlVGQlVTeExRVWhTTzFOQlJFUTdUVUZJVnp0SlFVRkJMRU5CUVVFc1EwRkJRU3hEUVVGQkxFbEJRVUVzUTBGQldqdEZRVTVYT3pzN1FVRnJRbG83T3pzN2FVTkJSMEVzVlVGQlFTeEhRVUZaTEZOQlFVRTdRVUZEV0N4UlFVRkJPMEZCUVVFN1FVRkJRVHRUUVVGQkxIRkRRVUZCT3p0dFFrRkJRU3hKUVVGRExFTkJRVUVzVFVGQlJDeERRVUZUTEVsQlFWUTdRVUZCUVRzN1JVRkVWenM3YVVOQlIxb3NVVUZCUVN4SFFVRlZMRk5CUVVFN1FVRkRWQ3hSUVVGQk8wRkJRVUU3UVVGQlFUdFRRVUZCTEhGRFFVRkJPenROUVVORExFbEJRVU1zUTBGQlFTeEpRVUZFTEVOQlFVOHNTVUZCVUR0dFFrRkRRU3hKUVVGRExFTkJRVUVzYTBKQlFVUXNRMEZCY1VJc1NVRkJja0k3UVVGR1JEczdSVUZFVXpzN2FVTkJTMVlzYTBKQlFVRXNSMEZCYjBJc1UwRkJSU3hKUVVGR08xZEJRMjVDTEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1NVRkJWQ3hEUVVGbExFZEJRVUVzUjBGQlNTeEpRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRmRCUVdRc1IwRkJNRUlzV1VGQmVrTXNRMEZCYzBRc1EwRkJReXhOUVVGMlJDeERRVUZCTzBWQlJHMUNPenRwUTBGSmNFSXNUMEZCUVN4SFFVRlRMRk5CUVVFN1YwRkRVaXhKUVVGRExFTkJRVUVzWVVGQlJDeERRVUZCTzBWQlJGRTdPMmxEUVVkVUxHRkJRVUVzUjBGQlpTeFRRVUZCTzFkQlEyUXNTMEZCU3l4RFFVRkRMRk5CUVU0c1EwRkJaMElzY1VKQlFXaENMRVZCUVhWRExFbEJRVU1zUTBGQlFTeFJRVUY0UXp0RlFVUmpPenRwUTBGSFppeGhRVUZCTEVkQlFXVXNVMEZCUVR0WFFVTmtMRXRCUVVzc1EwRkJReXhaUVVGT0xFTkJRVzFDTEhGQ1FVRnVRaXhGUVVFd1F5eEpRVUZETEVOQlFVRXNVVUZCTTBNN1JVRkVZenM3T3pzN08wRkJTV2hDTEUxQlFVMHNRMEZCUXl4UFFVRlFMRWRCUVdsQ0luMD1cbiIsInZhciBJdGVtX0RhdGE7XG5cbkl0ZW1fRGF0YSA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gSXRlbV9EYXRhKCRlbCkge1xuICAgIHZhciBkYXRhO1xuICAgIHRoaXMuJGVsID0gJGVsO1xuICAgIGRhdGEgPSAkZWwuZGF0YSgnaXRlbScpO1xuICAgIGlmICghZGF0YSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRWxlbWVudCBkb2Vzbid0IGNvbnRhaW4gYGRhdGEtaXRlbWAgYXR0cmlidXRlXCIpO1xuICAgIH1cbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICB9XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfZGF0YSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaW1hZ2U7XG4gICAgaW1hZ2UgPSB0aGlzLmRhdGFbJ2ltYWdlcyddW25hbWVdO1xuICAgIGlmICghaW1hZ2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGltYWdlO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X3NpemUgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGhlaWdodCwgaW1hZ2UsIHJlZiwgc2l6ZSwgd2lkdGg7XG4gICAgaW1hZ2UgPSB0aGlzLmdldF9kYXRhKG5hbWUpO1xuICAgIGlmICghaW1hZ2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgc2l6ZSA9IGltYWdlWydzaXplJ107XG4gICAgcmVmID0gc2l6ZS5zcGxpdCgneCcpLCB3aWR0aCA9IHJlZlswXSwgaGVpZ2h0ID0gcmVmWzFdO1xuICAgIHdpZHRoID0gcGFyc2VJbnQod2lkdGgpO1xuICAgIGhlaWdodCA9IHBhcnNlSW50KGhlaWdodCk7XG4gICAgcmV0dXJuIFt3aWR0aCwgaGVpZ2h0XTtcbiAgfTtcblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF91cmwgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGltYWdlO1xuICAgIGltYWdlID0gdGhpcy5nZXRfZGF0YShuYW1lKTtcbiAgICBpZiAoIWltYWdlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBpbWFnZVsndXJsJ107XG4gIH07XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfb3JfZmFsc2UgPSBmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAodGhpcy5kYXRhW2tleV0pIHtcbiAgICAgIHJldHVybiB0aGlzLmRhdGFba2V5XTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X3JhdGlvID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0X29yX2ZhbHNlKCdyYXRpbycpO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X3R5cGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRfb3JfZmFsc2UoJ3R5cGUnKTtcbiAgfTtcblxuICByZXR1cm4gSXRlbV9EYXRhO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEl0ZW1fRGF0YTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pU1hSbGJWOUVZWFJoTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lTWFJsYlY5RVlYUmhMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRU3hKUVVGQk96dEJRVUZOTzBWQlJWRXNiVUpCUVVVc1IwRkJSanRCUVVOYUxGRkJRVUU3U1VGQlFTeEpRVUZETEVOQlFVRXNSMEZCUkN4SFFVRlBPMGxCUTFBc1NVRkJRU3hIUVVGUExFZEJRVWNzUTBGQlF5eEpRVUZLTEVOQlFWVXNUVUZCVmp0SlFVVlFMRWxCUVVjc1EwRkJTU3hKUVVGUU8wRkJRME1zV1VGQlZTeEpRVUZCTEV0QlFVRXNRMEZCVFN3clEwRkJUaXhGUVVSWU96dEpRVWRCTEVsQlFVTXNRMEZCUVN4SlFVRkVMRWRCUVZFN1JVRlFTVHM3YzBKQlYySXNVVUZCUVN4SFFVRlZMRk5CUVVVc1NVRkJSanRCUVVOVUxGRkJRVUU3U1VGQlFTeExRVUZCTEVkQlFWRXNTVUZCUXl4RFFVRkJMRWxCUVUwc1EwRkJRU3hSUVVGQkxFTkJRVmtzUTBGQlFTeEpRVUZCTzBsQlF6TkNMRWxCUVdkQ0xFTkJRVWtzUzBGQmNFSTdRVUZCUVN4aFFVRlBMRTFCUVZBN08wRkJSVUVzVjBGQlR6dEZRVXBGT3p0elFrRk5WaXhSUVVGQkxFZEJRVlVzVTBGQlJTeEpRVUZHTzBGQlExUXNVVUZCUVR0SlFVRkJMRXRCUVVFc1IwRkJVU3hKUVVGRExFTkJRVUVzVVVGQlJDeERRVUZYTEVsQlFWZzdTVUZEVWl4SlFVRm5RaXhEUVVGSkxFdEJRWEJDTzBGQlFVRXNZVUZCVHl4TlFVRlFPenRKUVVWQkxFbEJRVUVzUjBGQlR5eExRVUZQTEVOQlFVRXNUVUZCUVR0SlFVVmtMRTFCUVd0Q0xFbEJRVWtzUTBGQlF5eExRVUZNTEVOQlFWa3NSMEZCV2l4RFFVRnNRaXhGUVVGRExHTkJRVVFzUlVGQlVUdEpRVVZTTEV0QlFVRXNSMEZCVVN4UlFVRkJMRU5CUVZVc1MwRkJWanRKUVVOU0xFMUJRVUVzUjBGQlV5eFJRVUZCTEVOQlFWVXNUVUZCVmp0QlFVVlVMRmRCUVU4c1EwRkJReXhMUVVGRUxFVkJRVkVzVFVGQlVqdEZRVmhGT3p0elFrRmhWaXhQUVVGQkxFZEJRVk1zVTBGQlJTeEpRVUZHTzBGQlExSXNVVUZCUVR0SlFVRkJMRXRCUVVFc1IwRkJVU3hKUVVGRExFTkJRVUVzVVVGQlJDeERRVUZYTEVsQlFWZzdTVUZEVWl4SlFVRm5RaXhEUVVGSkxFdEJRWEJDTzBGQlFVRXNZVUZCVHl4TlFVRlFPenRCUVVOQkxGZEJRVThzUzBGQlR5eERRVUZCTEV0QlFVRTdSVUZJVGpzN2MwSkJTMVFzV1VGQlFTeEhRVUZqTEZOQlFVVXNSMEZCUmp0SlFVTmlMRWxCUVVjc1NVRkJReXhEUVVGQkxFbEJRVTBzUTBGQlFTeEhRVUZCTEVOQlFWWTdRVUZEUXl4aFFVRlBMRWxCUVVNc1EwRkJRU3hKUVVGTkxFTkJRVUVzUjBGQlFTeEZRVVJtT3p0QlFVVkJMRmRCUVU4N1JVRklUVHM3YzBKQlMyUXNVMEZCUVN4SFFVRmpMRk5CUVVFN1YwRkJSeXhKUVVGRExFTkJRVUVzV1VGQlJDeERRVUZsTEU5QlFXWTdSVUZCU0RzN2MwSkJRMlFzVVVGQlFTeEhRVUZqTEZOQlFVRTdWMEZCUnl4SlFVRkRMRU5CUVVFc1dVRkJSQ3hEUVVGbExFMUJRV1k3UlVGQlNEczdPenM3TzBGQlIyWXNUVUZCVFN4RFFVRkRMRTlCUVZBc1IwRkJhVUlpZlE9PVxuIiwidmFyICQsIEFic3RyYWN0X0xhenlfTG9hZGVyLCBMYXp5X01hc29ucnksIF9fV0lORE9XLFxuICBiaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfSxcbiAgZXh0ZW5kID0gZnVuY3Rpb24oY2hpbGQsIHBhcmVudCkgeyBmb3IgKHZhciBrZXkgaW4gcGFyZW50KSB7IGlmIChoYXNQcm9wLmNhbGwocGFyZW50LCBrZXkpKSBjaGlsZFtrZXldID0gcGFyZW50W2tleV07IH0gZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9IGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTsgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTsgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTsgcmV0dXJuIGNoaWxkOyB9LFxuICBoYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHk7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5BYnN0cmFjdF9MYXp5X0xvYWRlciA9IHJlcXVpcmUoJy4vQWJzdHJhY3RfTGF6eV9Mb2FkZXInKTtcblxuX19XSU5ET1cgPSByZXF1aXJlKCcuLi9jb3JlL1dpbmRvdycpO1xuXG5MYXp5X01hc29ucnkgPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICBleHRlbmQoTGF6eV9NYXNvbnJ5LCBzdXBlckNsYXNzKTtcblxuICBmdW5jdGlvbiBMYXp5X01hc29ucnkoKSB7XG4gICAgdGhpcy5sb2FkX2l0ZW1zX2luX3ZpZXcgPSBiaW5kKHRoaXMubG9hZF9pdGVtc19pbl92aWV3LCB0aGlzKTtcbiAgICB0aGlzLmF1dG9sb2FkID0gYmluZCh0aGlzLmF1dG9sb2FkLCB0aGlzKTtcbiAgICB0aGlzLmRlYm91bmNlZF9sb2FkX2l0ZW1zX2luX3ZpZXcgPSBfLmRlYm91bmNlKHRoaXMubG9hZF9pdGVtc19pbl92aWV3LCA1MCk7XG4gICAgTGF6eV9NYXNvbnJ5Ll9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMpO1xuICB9XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0uJGVsLmNzcyh7XG4gICAgICAnbWluLWhlaWdodCc6IE1hdGguZmxvb3IodGhpcy5nZXRfd2lkdGgoKSAvIGl0ZW0uZGF0YS5nZXRfcmF0aW8oKSlcbiAgICB9KTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmdldF93aWR0aCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAkKCcuUFBfTWFzb25yeV9fc2l6ZXInKS53aWR0aCgpO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUuYXV0b2xvYWQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5sb2FkX2l0ZW1zX2luX3ZpZXcoKTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmxvYWQgPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgdmFyICRpbWFnZSwgZnVsbCwgdGh1bWI7XG4gICAgdGh1bWIgPSBpdGVtLmRhdGEuZ2V0X3VybCgndGh1bWInKTtcbiAgICBmdWxsID0gaXRlbS5kYXRhLmdldF91cmwoJ2Z1bGwnKTtcbiAgICBpdGVtLiRlbC5wcmVwZW5kKFwiPGEgY2xhc3M9XFxcIlwiICsgdGhpcy5FbGVtZW50cy5saW5rICsgXCJcXFwiIGhyZWY9XFxcIlwiICsgZnVsbCArIFwiXFxcIiByZWw9XFxcImdhbGxlcnlcXFwiPlxcbjxpbWcgY2xhc3M9XFxcIlwiICsgdGhpcy5FbGVtZW50cy5pbWFnZSArIFwiXFxcIiBzcmM9XFxcIlwiICsgdGh1bWIgKyBcIlxcXCIgY2xhc3M9XFxcIlBQX0pTX19sb2FkaW5nXFxcIiAvPlxcbjwvYT5cIikucmVtb3ZlQ2xhc3MoJ0xhenktSW1hZ2UnKTtcbiAgICBpdGVtLmxvYWRlZCA9IHRydWU7XG4gICAgJGltYWdlID0gaXRlbS4kZWwuZmluZCgnaW1nJyk7XG4gICAgcmV0dXJuICRpbWFnZS5pbWFnZXNMb2FkZWQoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICRpbWFnZS5hZGRDbGFzcygnUFBfSlNfX2xvYWRlZCcpLnJlbW92ZUNsYXNzKCdQUF9KU19fbG9hZGluZycpO1xuICAgICAgICByZXR1cm4gaXRlbS4kZWwuY3NzKCdtaW4taGVpZ2h0JywgJycpLnJlbW92ZUNsYXNzKF90aGlzLkVsZW1lbnRzLml0ZW0pLmZpbmQoXCIuXCIgKyBfdGhpcy5FbGVtZW50cy5wbGFjZWhvbGRlcikuZmFkZU91dCg0MDAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiAkKHRoaXMpLnJlbW92ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUubG9hZF9pdGVtc19pbl92aWV3ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGksIGl0ZW0sIGtleSwgbGVuLCByZWYsIHJlc3VsdHM7XG4gICAgcmVmID0gdGhpcy5JdGVtcztcbiAgICByZXN1bHRzID0gW107XG4gICAgZm9yIChrZXkgPSBpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsga2V5ID0gKytpKSB7XG4gICAgICBpdGVtID0gcmVmW2tleV07XG4gICAgICBpZiAoIWl0ZW0ubG9hZGVkICYmIHRoaXMuaW5fbG9vc2VfdmlldyhpdGVtLmVsKSkge1xuICAgICAgICByZXN1bHRzLnB1c2godGhpcy5sb2FkKGl0ZW0pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdHMucHVzaCh2b2lkIDApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmluX2xvb3NlX3ZpZXcgPSBmdW5jdGlvbihlbCkge1xuICAgIHZhciByZWN0LCBzZW5zaXRpdml0eTtcbiAgICBpZiAoZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0ID09IG51bGwpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgc2Vuc2l0aXZpdHkgPSAxMDA7XG4gICAgcmV0dXJuIHJlY3QudG9wICsgcmVjdC5oZWlnaHQgPj0gLXNlbnNpdGl2aXR5ICYmIHJlY3QuYm90dG9tIC0gcmVjdC5oZWlnaHQgPD0gX19XSU5ET1cuaGVpZ2h0ICsgc2Vuc2l0aXZpdHkgJiYgcmVjdC5sZWZ0ICsgcmVjdC53aWR0aCA+PSAtc2Vuc2l0aXZpdHkgJiYgcmVjdC5yaWdodCAtIHJlY3Qud2lkdGggPD0gX19XSU5ET1cud2lkdGggKyBzZW5zaXRpdml0eTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmF0dGFjaF9ldmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAkKHdpbmRvdykub24oJ3Njcm9sbCcsIHRoaXMuZGVib3VuY2VkX2xvYWRfaXRlbXNfaW5fdmlldyk7XG4gICAgcmV0dXJuIExhenlfTWFzb25yeS5fX3N1cGVyX18uYXR0YWNoX2V2ZW50cy5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUuZGV0YWNoX2V2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICQod2luZG93KS5vZmYoJ3Njcm9sbCcsIHRoaXMuZGVib3VuY2VkX2xvYWRfaXRlbXNfaW5fdmlldyk7XG4gICAgcmV0dXJuIExhenlfTWFzb25yeS5fX3N1cGVyX18uZGV0YWNoX2V2ZW50cy5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpLCBpdGVtLCBrZXksIGxlbiwgcmVmO1xuICAgIHJlZiA9IHRoaXMuSXRlbXM7XG4gICAgZm9yIChrZXkgPSBpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsga2V5ID0gKytpKSB7XG4gICAgICBpdGVtID0gcmVmW2tleV07XG4gICAgICBpdGVtLiRlbC5jc3MoJ21pbi1oZWlnaHQnLCAnJyk7XG4gICAgfVxuICAgIHJldHVybiBMYXp5X01hc29ucnkuX19zdXBlcl9fLmRlc3Ryb3kuY2FsbCh0aGlzKTtcbiAgfTtcblxuICByZXR1cm4gTGF6eV9NYXNvbnJ5O1xuXG59KShBYnN0cmFjdF9MYXp5X0xvYWRlcik7XG5cbm1vZHVsZS5leHBvcnRzID0gTGF6eV9NYXNvbnJ5O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lUR0Y2ZVY5TllYTnZibko1TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lUR0Y2ZVY5TllYTnZibko1TG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4SlFVRkJMQ3REUVVGQk8wVkJRVUU3T3pzN1FVRkJRU3hEUVVGQkxFZEJRVWtzVDBGQlFTeERRVUZUTEZGQlFWUTdPMEZCUTBvc2IwSkJRVUVzUjBGQmRVSXNUMEZCUVN4RFFVRlRMSGRDUVVGVU96dEJRVU4yUWl4UlFVRkJMRWRCUVZjc1QwRkJRU3hEUVVGVExHZENRVUZVT3p0QlFVVk1PenM3UlVGRlVTeHpRa0ZCUVRzN08wbEJRMW9zU1VGQlF5eERRVUZCTERSQ1FVRkVMRWRCUVdkRExFTkJRVU1zUTBGQlF5eFJRVUZHTEVOQlFWa3NTVUZCUXl4RFFVRkJMR3RDUVVGaUxFVkJRV2xETEVWQlFXcERPMGxCUTJoRExEUkRRVUZCTzBWQlJsazdPM2xDUVV0aUxFMUJRVUVzUjBGQlVTeFRRVUZGTEVsQlFVWTdWMEZEVUN4SlFVRkpMRU5CUVVNc1IwRkJSeXhEUVVGRExFZEJRVlFzUTBGQllUdE5RVUZCTEZsQlFVRXNSVUZCWXl4SlFVRkpMRU5CUVVNc1MwRkJUQ3hEUVVGWkxFbEJRVU1zUTBGQlFTeFRRVUZFTEVOQlFVRXNRMEZCUVN4SFFVRmxMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zVTBGQlZpeERRVUZCTEVOQlFUTkNMRU5CUVdRN1MwRkJZanRGUVVSUE96dDVRa0ZKVWl4VFFVRkJMRWRCUVZjc1UwRkJRVHRYUVVWV0xFTkJRVUVzUTBGQlJ5eHZRa0ZCU0N4RFFVRjVRaXhEUVVGRExFdEJRVEZDTEVOQlFVRTdSVUZHVlRzN2VVSkJUVmdzVVVGQlFTeEhRVUZWTEZOQlFVRTdWMEZCUnl4SlFVRkRMRU5CUVVFc2EwSkJRVVFzUTBGQlFUdEZRVUZJT3p0NVFrRkpWaXhKUVVGQkxFZEJRVTBzVTBGQlJTeEpRVUZHTzBGQlJVd3NVVUZCUVR0SlFVRkJMRXRCUVVFc1IwRkJVU3hKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFWWXNRMEZCYlVJc1QwRkJia0k3U1VGRFVpeEpRVUZCTEVkQlFVOHNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGV0xFTkJRVzFDTEUxQlFXNUNPMGxCUlZBc1NVRkJTU3hEUVVGRExFZEJRMHdzUTBGQlF5eFBRVVJFTEVOQlExVXNZVUZCUVN4SFFVTkpMRWxCUVVNc1EwRkJRU3hSUVVGUkxFTkJRVU1zU1VGRVpDeEhRVU50UWl4WlFVUnVRaXhIUVVNMlFpeEpRVVEzUWl4SFFVTnJReXh2UTBGRWJFTXNSMEZGVFN4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExFdEJSbWhDTEVkQlJYTkNMRmRCUm5SQ0xFZEJSU3RDTEV0QlJpOUNMRWRCUlhGRExITkRRVWd2UXl4RFFVMUJMRU5CUVVNc1YwRk9SQ3hEUVUxakxGbEJUbVE3U1VGUlFTeEpRVUZKTEVOQlFVTXNUVUZCVEN4SFFVRmpPMGxCUTJRc1RVRkJRU3hIUVVGVExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNTVUZCVkN4RFFVRmxMRXRCUVdZN1YwRkRWQ3hOUVVGTkxFTkJRVU1zV1VGQlVDeERRVUZ2UWl4RFFVRkJMRk5CUVVFc1MwRkJRVHRoUVVGQkxGTkJRVUU3VVVGRmJrSXNUVUZCVFN4RFFVRkRMRkZCUVZBc1EwRkJhVUlzWlVGQmFrSXNRMEZCYTBNc1EwRkJReXhYUVVGdVF5eERRVUZuUkN4blFrRkJhRVE3WlVGRFFTeEpRVUZKTEVOQlFVTXNSMEZEVEN4RFFVRkRMRWRCUkVRc1EwRkRUU3haUVVST0xFVkJRMjlDTEVWQlJIQkNMRU5CUlVFc1EwRkJReXhYUVVaRUxFTkJSV01zUzBGQlF5eERRVUZCTEZGQlFWRXNRMEZCUXl4SlFVWjRRaXhEUVVkQkxFTkJRVU1zU1VGSVJDeERRVWRQTEVkQlFVRXNSMEZCU1N4TFFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExGZEJTSEpDTEVOQlNVRXNRMEZCUXl4UFFVcEVMRU5CU1ZNc1IwRktWQ3hGUVVsakxGTkJRVUU3YVVKQlFVY3NRMEZCUVN4RFFVRkhMRWxCUVVnc1EwRkJVeXhEUVVGRExFMUJRVllzUTBGQlFUdFJRVUZJTEVOQlNtUTdUVUZJYlVJN1NVRkJRU3hEUVVGQkxFTkJRVUVzUTBGQlFTeEpRVUZCTEVOQlFYQkNPMFZCWmtzN08zbENRVFJDVGl4clFrRkJRU3hIUVVGdlFpeFRRVUZCTzBGQlEyNUNMRkZCUVVFN1FVRkJRVHRCUVVGQk8xTkJRVUVzYVVSQlFVRTdPMDFCUTBNc1NVRkJSeXhEUVVGSkxFbEJRVWtzUTBGQlF5eE5RVUZVTEVsQlFXOUNMRWxCUVVNc1EwRkJRU3hoUVVGRUxFTkJRV2RDTEVsQlFVa3NRMEZCUXl4RlFVRnlRaXhEUVVGMlFqdHhRa0ZEUXl4SlFVRkRMRU5CUVVFc1NVRkJSQ3hEUVVGUExFbEJRVkFzUjBGRVJEdFBRVUZCTEUxQlFVRTdOa0pCUVVFN08wRkJSRVE3TzBWQlJHMUNPenQ1UWtGUGNFSXNZVUZCUVN4SFFVRmxMRk5CUVVVc1JVRkJSanRCUVVOa0xGRkJRVUU3U1VGQlFTeEpRVUZ0UWl4blEwRkJia0k3UVVGQlFTeGhRVUZQTEV0QlFWQTdPMGxCUTBFc1NVRkJRU3hIUVVGUExFVkJRVVVzUTBGQlF5eHhRa0ZCU0N4RFFVRkJPMGxCUjFBc1YwRkJRU3hIUVVGak8wRkJRMlFzVjBGRlF5eEpRVUZKTEVOQlFVTXNSMEZCVEN4SFFVRlhMRWxCUVVrc1EwRkJReXhOUVVGb1FpeEpRVUV3UWl4RFFVRkRMRmRCUVROQ0xFbEJRME1zU1VGQlNTeERRVUZETEUxQlFVd3NSMEZCWXl4SlFVRkpMRU5CUVVNc1RVRkJia0lzU1VGQk5rSXNVVUZCVVN4RFFVRkRMRTFCUVZRc1IwRkJhMElzVjBGRWFFUXNTVUZKUXl4SlFVRkpMRU5CUVVNc1NVRkJUQ3hIUVVGWkxFbEJRVWtzUTBGQlF5eExRVUZxUWl4SlFVRXdRaXhEUVVGRExGZEJTalZDTEVsQlMwTXNTVUZCU1N4RFFVRkRMRXRCUVV3c1IwRkJZU3hKUVVGSkxFTkJRVU1zUzBGQmJFSXNTVUZCTWtJc1VVRkJVU3hEUVVGRExFdEJRVlFzUjBGQmFVSTdSVUZpYUVNN08zbENRV2xDWml4aFFVRkJMRWRCUVdVc1UwRkJRVHRKUVVOa0xFTkJRVUVzUTBGQlJ5eE5RVUZJTEVOQlFWY3NRMEZCUXl4RlFVRmFMRU5CUVdVc1VVRkJaaXhGUVVGNVFpeEpRVUZETEVOQlFVRXNORUpCUVRGQ08xZEJRMEVzT0VOQlFVRTdSVUZHWXpzN2VVSkJTV1lzWVVGQlFTeEhRVUZsTEZOQlFVRTdTVUZEWkN4RFFVRkJMRU5CUVVjc1RVRkJTQ3hEUVVGWExFTkJRVU1zUjBGQldpeERRVUZuUWl4UlFVRm9RaXhGUVVFd1FpeEpRVUZETEVOQlFVRXNORUpCUVROQ08xZEJRMEVzT0VOQlFVRTdSVUZHWXpzN2VVSkJTV1lzVDBGQlFTeEhRVUZUTEZOQlFVRTdRVUZEVWl4UlFVRkJPMEZCUVVFN1FVRkJRU3hUUVVGQkxHbEVRVUZCT3p0TlFVTkRMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zUjBGQlZDeERRVUZoTEZsQlFXSXNSVUZCTWtJc1JVRkJNMEk3UVVGRVJEdFhRVWRCTEhkRFFVRkJPMFZCU2xFN096czdSMEZxUm1sQ096dEJRWFZHTTBJc1RVRkJUU3hEUVVGRExFOUJRVkFzUjBGQmFVSWlmUT09XG4iLCJ2YXIgJCwgSG9va3MsIExhenlfTWFzb25yeSwgaW5pdF9sYXp5X2xvYWRlciwgaXNfbWFzb25yeSwgbGF6eV9pbnN0YW5jZTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbkxhenlfTWFzb25yeSA9IHJlcXVpcmUoJy4vTGF6eV9NYXNvbnJ5Jyk7XG5cbmxhenlfaW5zdGFuY2UgPSBmYWxzZTtcblxuaXNfbWFzb25yeSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gJCgnLlBQX01hc29ucnknKS5sZW5ndGggPiAwO1xufTtcblxuaW5pdF9sYXp5X2xvYWRlciA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIWlzX21hc29ucnkoKSkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAobGF6eV9pbnN0YW5jZSkge1xuICAgIGxhenlfaW5zdGFuY2UuZGVzdHJveSgpO1xuICB9XG4gIHJldHVybiBsYXp5X2luc3RhbmNlID0gbmV3IChIb29rcy5hcHBseUZpbHRlcnMoJ3Bob3J0LmxhenkuaGFuZGxlcicsIExhenlfTWFzb25yeSkpO1xufTtcblxuSG9va3MuYWRkQWN0aW9uKCdwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZScsIGluaXRfbGF6eV9sb2FkZXIsIDEwMCk7XG5cbkhvb2tzLmFkZEFjdGlvbigncGhvcnQucG9ydGZvbGlvLmRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgaWYgKGxhenlfaW5zdGFuY2UpIHtcbiAgICBsYXp5X2luc3RhbmNlLmRlc3Ryb3koKTtcbiAgICByZXR1cm4gbGF6eV9pbnN0YW5jZSA9IG51bGw7XG4gIH1cbn0pO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3Bob3J0LnBvcnRmb2xpby5yZWZyZXNoJywgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBIb29rcy5kb0FjdGlvbigncGhvcnQubGF6eS5hdXRvbG9hZCcpO1xufSk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWMzUmhjblF1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SnpkR0Z5ZEM1amIyWm1aV1VpWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFc1NVRkJRVHM3UVVGQlFTeERRVUZCTEVkQlFVa3NUMEZCUVN4RFFVRlRMRkZCUVZRN08wRkJRMG9zUzBGQlFTeEhRVUZSTEU5QlFVRXNRMEZCVXl4VlFVRlVPenRCUVVOU0xGbEJRVUVzUjBGQlpTeFBRVUZCTEVOQlFWTXNaMEpCUVZRN08wRkJSMllzWVVGQlFTeEhRVUZuUWpzN1FVRkZhRUlzVlVGQlFTeEhRVUZoTEZOQlFVRTdVMEZCUnl4RFFVRkJMRU5CUVVjc1lVRkJTQ3hEUVVGclFpeERRVUZETEUxQlFXNUNMRWRCUVRSQ08wRkJRUzlDT3p0QlFVVmlMR2RDUVVGQkxFZEJRVzFDTEZOQlFVRTdSVUZEYkVJc1NVRkJWU3hEUVVGSkxGVkJRVUVzUTBGQlFTeERRVUZrTzBGQlFVRXNWMEZCUVRzN1JVRkZRU3hKUVVGSExHRkJRVWc3U1VGRFF5eGhRVUZoTEVOQlFVTXNUMEZCWkN4RFFVRkJMRVZCUkVRN08xTkJTMEVzWVVGQlFTeEhRVUZuUWl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExGbEJRVTRzUTBGQmJVSXNiMEpCUVc1Q0xFVkJRWGxETEZsQlFYcERMRU5CUVVRN1FVRlNSanM3UVVGWmJrSXNTMEZCU3l4RFFVRkRMRk5CUVU0c1EwRkJaMElzZVVKQlFXaENMRVZCUVRKRExHZENRVUV6UXl4RlFVRTJSQ3hIUVVFM1JEczdRVUZEUVN4TFFVRkxMRU5CUVVNc1UwRkJUaXhEUVVGblFpeDVRa0ZCYUVJc1JVRkJNa01zVTBGQlFUdEZRVU14UXl4SlFVRkhMR0ZCUVVnN1NVRkRReXhoUVVGaExFTkJRVU1zVDBGQlpDeERRVUZCTzFkQlEwRXNZVUZCUVN4SFFVRm5RaXhMUVVacVFqczdRVUZFTUVNc1EwRkJNME03TzBGQlQwRXNTMEZCU3l4RFFVRkRMRk5CUVU0c1EwRkJaMElzZVVKQlFXaENMRVZCUVRKRExGTkJRVUU3VTBGRE1VTXNTMEZCU3l4RFFVRkRMRkZCUVU0c1EwRkJaU3h4UWtGQlpqdEJRVVF3UXl4RFFVRXpReUo5XG4iLCJ2YXIgSG9va3MsIFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5cbi8qXG5cbiAgICAgKiBJbml0aWFsaXplIFBvcnRmb2xpbyBDb3JlXG5cdC0tLVxuXHRcdFVzaW5nIHA1MCBAIGBwaG9ydC5jb3JlLnJlYWR5YFxuXHRcdExhdGUgcHJpb3JpdHkgaXMgZ29pbmcgdG8gZm9yY2UgZXhwbGljaXQgcHJpb3JpdHkgaW4gYW55IG90aGVyIG1vdmluZyBwYXJ0cyB0aGF0IGFyZSBnb2luZyB0byB0b3VjaCBwb3J0Zm9saW8gbGF5b3V0IGF0IGBwaG9ydC5sb2FkZWRgXG5cdC0tLVxuICovXG5cblBvcnRmb2xpb19FdmVudF9NYW5hZ2VyID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlcigpIHt9XG5cbiAgUG9ydGZvbGlvX0V2ZW50X01hbmFnZXIucHJvdG90eXBlLnByZXBhcmUgPSBmdW5jdGlvbigpIHtcbiAgICBIb29rcy5kb0FjdGlvbigncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnKTtcbiAgfTtcblxuICBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlci5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MuZG9BY3Rpb24oJ3Bob3J0LnBvcnRmb2xpby5jcmVhdGUnKTtcbiAgfTtcblxuICBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlci5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLmRvQWN0aW9uKCdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCcpO1xuICB9O1xuXG4gIFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MuZG9BY3Rpb24oJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95Jyk7XG4gICAgSG9va3MucmVtb3ZlQWN0aW9uKCdwaG9ydC5sb2FkZWQnLCB0aGlzLmNyZWF0ZSwgNTApO1xuICB9O1xuXG4gIHJldHVybiBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlcjtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlcjtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVUc5eWRHWnZiR2x2WDBWMlpXNTBYMDFoYm1GblpYSXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lKUWIzSjBabTlzYVc5ZlJYWmxiblJmVFdGdVlXZGxjaTVqYjJabVpXVWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklrRkJRVUVzU1VGQlFUczdRVUZCUVN4TFFVRkJMRWRCUVZFc1QwRkJRU3hEUVVGVExGVkJRVlE3T3p0QlFVVlNPenM3T3pzN096czdRVUZUVFRzN08yOURRVVZNTEU5QlFVRXNSMEZCVXl4VFFVRkJPMGxCUTFJc1MwRkJTeXhEUVVGRExGRkJRVTRzUTBGQlpTeDVRa0ZCWmp0RlFVUlJPenR2UTBGSlZDeE5RVUZCTEVkQlFWRXNVMEZCUVR0SlFVTlFMRXRCUVVzc1EwRkJReXhSUVVGT0xFTkJRV1VzZDBKQlFXWTdSVUZFVHpzN2IwTkJTMUlzVDBGQlFTeEhRVUZUTEZOQlFVRTdTVUZEVWl4TFFVRkxMRU5CUVVNc1VVRkJUaXhEUVVGbExIbENRVUZtTzBWQlJGRTdPMjlEUVV0VUxFOUJRVUVzUjBGQlV5eFRRVUZCTzBsQlJWSXNTMEZCU3l4RFFVRkRMRkZCUVU0c1EwRkJaU3g1UWtGQlpqdEpRVU5CTEV0QlFVc3NRMEZCUXl4WlFVRk9MRU5CUVcxQ0xHTkJRVzVDTEVWQlFXMURMRWxCUVVNc1EwRkJRU3hOUVVGd1F5eEZRVUUwUXl4RlFVRTFRenRGUVVoUk96czdPenM3UVVGUFZpeE5RVUZOTEVOQlFVTXNUMEZCVUN4SFFVRnBRaUo5XG4iLCJ2YXIgSG9va3MsIFBvcnRmb2xpb19JbnRlcmZhY2U7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cblxuLypcblx0QWJzdHJhY3QgQ2xhc3MgUG9ydG9mbGlvX0V2ZW50X0ltZXBsZW1lbnRhdGlvblxuXG4gICAgSGFuZGxlcyBhbGwgdGhlIGV2ZW50cyByZXF1aXJlZCB0byBmdWxseSBoYW5kbGUgYSBwb3J0Zm9saW8gbGF5b3V0IHByb2Nlc3NcbiAqL1xuXG5Qb3J0Zm9saW9fSW50ZXJmYWNlID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBQb3J0Zm9saW9fSW50ZXJmYWNlKGFyZ3MpIHtcbiAgICB0aGlzLnNldHVwX2FjdGlvbnMoKTtcbiAgICB0aGlzLmluaXRpYWxpemUoYXJncyk7XG4gIH1cblxuICBQb3J0Zm9saW9fSW50ZXJmYWNlLnByb3RvdHlwZS5zZXR1cF9hY3Rpb25zID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MuYWRkQWN0aW9uKCdwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZScsIHRoaXMucHJlcGFyZSwgNTApO1xuICAgIEhvb2tzLmFkZEFjdGlvbigncGhvcnQucG9ydGZvbGlvLmNyZWF0ZScsIHRoaXMuY3JlYXRlLCA1MCk7XG4gICAgSG9va3MuYWRkQWN0aW9uKCdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCcsIHRoaXMucmVmcmVzaCwgNTApO1xuICAgIEhvb2tzLmFkZEFjdGlvbigncGhvcnQucG9ydGZvbGlvLmRlc3Ryb3knLCB0aGlzLmRlc3Ryb3ksIDUwKTtcbiAgICByZXR1cm4gSG9va3MuYWRkQWN0aW9uKCdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScsIHRoaXMucHVyZ2VfYWN0aW9ucywgMTAwKTtcbiAgfTtcblxuICBQb3J0Zm9saW9fSW50ZXJmYWNlLnByb3RvdHlwZS5wdXJnZV9hY3Rpb25zID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MucmVtb3ZlQWN0aW9uKCdwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZScsIHRoaXMucHJlcGFyZSwgNTApO1xuICAgIEhvb2tzLnJlbW92ZUFjdGlvbigncGhvcnQucG9ydGZvbGlvLmNyZWF0ZScsIHRoaXMuY3JlYXRlLCA1MCk7XG4gICAgSG9va3MucmVtb3ZlQWN0aW9uKCdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCcsIHRoaXMucmVmcmVzaCwgNTApO1xuICAgIEhvb2tzLnJlbW92ZUFjdGlvbigncGhvcnQucG9ydGZvbGlvLmRlc3Ryb3knLCB0aGlzLmRlc3Ryb3ksIDUwKTtcbiAgICByZXR1cm4gSG9va3MucmVtb3ZlQWN0aW9uKCdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScsIHRoaXMucHVyZ2VfYWN0aW9ucywgMTAwKTtcbiAgfTtcblxuXG4gIC8qXG4gICAgIFx0UmVxdWlyZSB0aGVzZSBtZXRob2RzXG4gICAqL1xuXG4gIFBvcnRmb2xpb19JbnRlcmZhY2UucHJvdG90eXBlLmluaXRpYWxpemUgPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYGluaXRpYWxpemVgIG1ldGhvZFwiKTtcbiAgfTtcblxuICBQb3J0Zm9saW9fSW50ZXJmYWNlLnByb3RvdHlwZS5wcmVwYXJlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGBwcmVwYXJlYCBtZXRob2RcIik7XG4gIH07XG5cbiAgUG9ydGZvbGlvX0ludGVyZmFjZS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGBjcmVhdGVgIG1ldGhvZFwiKTtcbiAgfTtcblxuICBQb3J0Zm9saW9fSW50ZXJmYWNlLnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGByZWZyZXNoYCBtZXRob2RcIik7XG4gIH07XG5cbiAgUG9ydGZvbGlvX0ludGVyZmFjZS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgZGVzdHJveWAgbWV0aG9kXCIpO1xuICB9O1xuXG4gIHJldHVybiBQb3J0Zm9saW9fSW50ZXJmYWNlO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBvcnRmb2xpb19JbnRlcmZhY2U7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVVHOXlkR1p2YkdsdlgwbHVkR1Z5Wm1GalpTNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSWxCdmNuUm1iMnhwYjE5SmJuUmxjbVpoWTJVdVkyOW1abVZsSWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUpCUVVGQkxFbEJRVUU3TzBGQlFVRXNTMEZCUVN4SFFVRlJMRTlCUVVFc1EwRkJVeXhWUVVGVU96czdRVUZIVWpzN096czdPMEZCUzAwN1JVRkZVU3cyUWtGQlJTeEpRVUZHTzBsQlExb3NTVUZCUXl4RFFVRkJMR0ZCUVVRc1EwRkJRVHRKUVVOQkxFbEJRVU1zUTBGQlFTeFZRVUZFTEVOQlFXRXNTVUZCWWp0RlFVWlpPenRuUTBGSllpeGhRVUZCTEVkQlFXVXNVMEZCUVR0SlFVTmtMRXRCUVVzc1EwRkJReXhUUVVGT0xFTkJRV2RDTEhsQ1FVRm9RaXhGUVVFeVF5eEpRVUZETEVOQlFVRXNUMEZCTlVNc1JVRkJjVVFzUlVGQmNrUTdTVUZEUVN4TFFVRkxMRU5CUVVNc1UwRkJUaXhEUVVGblFpeDNRa0ZCYUVJc1JVRkJNRU1zU1VGQlF5eERRVUZCTEUxQlFUTkRMRVZCUVcxRUxFVkJRVzVFTzBsQlEwRXNTMEZCU3l4RFFVRkRMRk5CUVU0c1EwRkJaMElzZVVKQlFXaENMRVZCUVRKRExFbEJRVU1zUTBGQlFTeFBRVUUxUXl4RlFVRnhSQ3hGUVVGeVJEdEpRVU5CTEV0QlFVc3NRMEZCUXl4VFFVRk9MRU5CUVdkQ0xIbENRVUZvUWl4RlFVRXlReXhKUVVGRExFTkJRVUVzVDBGQk5VTXNSVUZCY1VRc1JVRkJja1E3VjBGRFFTeExRVUZMTEVOQlFVTXNVMEZCVGl4RFFVRm5RaXg1UWtGQmFFSXNSVUZCTWtNc1NVRkJReXhEUVVGQkxHRkJRVFZETEVWQlFUSkVMRWRCUVRORU8wVkJUR003TzJkRFFVOW1MR0ZCUVVFc1IwRkJaU3hUUVVGQk8wbEJRMlFzUzBGQlN5eERRVUZETEZsQlFVNHNRMEZCYlVJc2VVSkJRVzVDTEVWQlFUaERMRWxCUVVNc1EwRkJRU3hQUVVFdlF5eEZRVUYzUkN4RlFVRjRSRHRKUVVOQkxFdEJRVXNzUTBGQlF5eFpRVUZPTEVOQlFXMUNMSGRDUVVGdVFpeEZRVUUyUXl4SlFVRkRMRU5CUVVFc1RVRkJPVU1zUlVGQmMwUXNSVUZCZEVRN1NVRkRRU3hMUVVGTExFTkJRVU1zV1VGQlRpeERRVUZ0UWl4NVFrRkJia0lzUlVGQk9FTXNTVUZCUXl4RFFVRkJMRTlCUVM5RExFVkJRWGRFTEVWQlFYaEVPMGxCUTBFc1MwRkJTeXhEUVVGRExGbEJRVTRzUTBGQmJVSXNlVUpCUVc1Q0xFVkJRVGhETEVsQlFVTXNRMEZCUVN4UFFVRXZReXhGUVVGM1JDeEZRVUY0UkR0WFFVTkJMRXRCUVVzc1EwRkJReXhaUVVGT0xFTkJRVzFDTEhsQ1FVRnVRaXhGUVVFNFF5eEpRVUZETEVOQlFVRXNZVUZCTDBNc1JVRkJPRVFzUjBGQk9VUTdSVUZNWXpzN08wRkJVV1k3T3pzN1owTkJSMEVzVlVGQlFTeEhRVUZaTEZOQlFVRTdRVUZCUnl4VlFVRlZMRWxCUVVFc1MwRkJRU3hEUVVGUExIRkdRVUZRTzBWQlFXSTdPMmREUVVOYUxFOUJRVUVzUjBGQldTeFRRVUZCTzBGQlFVY3NWVUZCVlN4SlFVRkJMRXRCUVVFc1EwRkJUeXhyUmtGQlVEdEZRVUZpT3p0blEwRkRXaXhOUVVGQkxFZEJRVmtzVTBGQlFUdEJRVUZITEZWQlFWVXNTVUZCUVN4TFFVRkJMRU5CUVU4c2FVWkJRVkE3UlVGQllqczdaME5CUTFvc1QwRkJRU3hIUVVGWkxGTkJRVUU3UVVGQlJ5eFZRVUZWTEVsQlFVRXNTMEZCUVN4RFFVRlBMR3RHUVVGUU8wVkJRV0k3TzJkRFFVTmFMRTlCUVVFc1IwRkJXU3hUUVVGQk8wRkJRVWNzVlVGQlZTeEpRVUZCTEV0QlFVRXNRMEZCVHl4clJrRkJVRHRGUVVGaU96czdPenM3UVVGSllpeE5RVUZOTEVOQlFVTXNUMEZCVUN4SFFVRnBRaUo5XG4iLCJcbi8qXG4gICAgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBIb29rcywgUG9ydGZvbGlvX0ludGVyZmFjZSwgUG9ydGZvbGlvX01hc29ucnksXG4gIGJpbmQgPSBmdW5jdGlvbihmbiwgbWUpeyByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuIGZuLmFwcGx5KG1lLCBhcmd1bWVudHMpOyB9OyB9LFxuICBleHRlbmQgPSBmdW5jdGlvbihjaGlsZCwgcGFyZW50KSB7IGZvciAodmFyIGtleSBpbiBwYXJlbnQpIHsgaWYgKGhhc1Byb3AuY2FsbChwYXJlbnQsIGtleSkpIGNoaWxkW2tleV0gPSBwYXJlbnRba2V5XTsgfSBmdW5jdGlvbiBjdG9yKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gY2hpbGQ7IH0gY3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlOyBjaGlsZC5wcm90b3R5cGUgPSBuZXcgY3RvcigpOyBjaGlsZC5fX3N1cGVyX18gPSBwYXJlbnQucHJvdG90eXBlOyByZXR1cm4gY2hpbGQ7IH0sXG4gIGhhc1Byb3AgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cblBvcnRmb2xpb19JbnRlcmZhY2UgPSByZXF1aXJlKCcuL1BvcnRmb2xpb19JbnRlcmZhY2UnKTtcblxuUG9ydGZvbGlvX01hc29ucnkgPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICBleHRlbmQoUG9ydGZvbGlvX01hc29ucnksIHN1cGVyQ2xhc3MpO1xuXG4gIGZ1bmN0aW9uIFBvcnRmb2xpb19NYXNvbnJ5KCkge1xuICAgIHRoaXMucmVmcmVzaCA9IGJpbmQodGhpcy5yZWZyZXNoLCB0aGlzKTtcbiAgICB0aGlzLmRlc3Ryb3kgPSBiaW5kKHRoaXMuZGVzdHJveSwgdGhpcyk7XG4gICAgdGhpcy5jcmVhdGUgPSBiaW5kKHRoaXMuY3JlYXRlLCB0aGlzKTtcbiAgICB0aGlzLnByZXBhcmUgPSBiaW5kKHRoaXMucHJlcGFyZSwgdGhpcyk7XG4gICAgcmV0dXJuIFBvcnRmb2xpb19NYXNvbnJ5Ll9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLkVsZW1lbnRzID0ge1xuICAgIGNvbnRhaW5lcjogJ1BQX01hc29ucnknLFxuICAgIHNpemVyOiAnUFBfTWFzb25yeV9fc2l6ZXInLFxuICAgIGl0ZW06ICdQUF9NYXNvbnJ5X19pdGVtJ1xuICB9O1xuXG5cbiAgLypcbiAgXHRcdEluaXRpYWxpemVcbiAgICovXG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLmluaXRpYWxpemUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy4kY29udGFpbmVyID0gJChcIi5cIiArIHRoaXMuRWxlbWVudHMuY29udGFpbmVyKTtcbiAgfTtcblxuXG4gIC8qXG4gIFx0XHRQcmVwYXJlICYgQXR0YWNoIEV2ZW50c1xuICAgICBcdERvbid0IHNob3cgYW55dGhpbmcgeWV0LlxuICBcbiAgXHRcdEBjYWxsZWQgb24gaG9vayBgcGhvcnQucG9ydGZvbGlvLnByZXBhcmVgXG4gICAqL1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5wcmVwYXJlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG1hc29ucnlfc2V0dGluZ3M7XG4gICAgaWYgKHRoaXMuJGNvbnRhaW5lci5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy4kY29udGFpbmVyLmFkZENsYXNzKCdQUF9KU19fbG9hZGluZ19tYXNvbnJ5Jyk7XG4gICAgdGhpcy5tYXliZV9jcmVhdGVfc2l6ZXIoKTtcbiAgICBtYXNvbnJ5X3NldHRpbmdzID0gSG9va3MuYXBwbHlGaWx0ZXJzKCdwaG9ydC5tYXNvbnJ5LnNldHRpbmdzJywge1xuICAgICAgaXRlbVNlbGVjdG9yOiBcIi5cIiArIHRoaXMuRWxlbWVudHMuaXRlbSxcbiAgICAgIGNvbHVtbldpZHRoOiBcIi5cIiArIHRoaXMuRWxlbWVudHMuc2l6ZXIsXG4gICAgICBndXR0ZXI6IDAsXG4gICAgICBpbml0TGF5b3V0OiBmYWxzZVxuICAgIH0pO1xuICAgIHRoaXMuJGNvbnRhaW5lci5tYXNvbnJ5KG1hc29ucnlfc2V0dGluZ3MpO1xuICAgIHJldHVybiB0aGlzLiRjb250YWluZXIubWFzb25yeSgnb25jZScsICdsYXlvdXRDb21wbGV0ZScsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBfdGhpcy4kY29udGFpbmVyLnJlbW92ZUNsYXNzKCdQUF9KU19fbG9hZGluZ19tYXNvbnJ5JykuYWRkQ2xhc3MoJ1BQX0pTX19sb2FkaW5nX2NvbXBsZXRlJyk7XG4gICAgICAgIHJldHVybiBIb29rcy5kb0FjdGlvbigncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9O1xuXG5cbiAgLypcbiAgXHRcdFN0YXJ0IHRoZSBQb3J0Zm9saW9cbiAgXHRcdEBjYWxsZWQgb24gaG9vayBgcGhvcnQucG9ydGZvbGlvLmNyZWF0ZWBcbiAgICovXG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJGNvbnRhaW5lci5tYXNvbnJ5KCk7XG4gIH07XG5cblxuICAvKlxuICBcdFx0RGVzdHJveVxuICBcdFx0QGNhbGxlZCBvbiBob29rIGBwaG9ydC5wb3J0Zm9saW8uZGVzdHJveWBcbiAgICovXG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLm1heWJlX3JlbW92ZV9zaXplcigpO1xuICAgIGlmICh0aGlzLiRjb250YWluZXIubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy4kY29udGFpbmVyLm1hc29ucnkoJ2Rlc3Ryb3knKTtcbiAgICB9XG4gIH07XG5cblxuICAvKlxuICBcdFx0UmVsb2FkIHRoZSBsYXlvdXRcbiAgXHRcdEBjYWxsZWQgb24gaG9vayBgcGhvcnQucG9ydGZvbGlvLnJlZnJlc2hgXG4gICAqL1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuJGNvbnRhaW5lci5tYXNvbnJ5KCdsYXlvdXQnKTtcbiAgfTtcblxuXG4gIC8qXG4gIFx0XHRDcmVhdGUgYSBzaXplciBlbGVtZW50IGZvciBqcXVlcnktbWFzb25yeSB0byB1c2VcbiAgICovXG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLm1heWJlX2NyZWF0ZV9zaXplciA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnNpemVyX2RvZXNudF9leGlzdCgpKSB7XG4gICAgICB0aGlzLmNyZWF0ZV9zaXplcigpO1xuICAgIH1cbiAgfTtcblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUubWF5YmVfcmVtb3ZlX3NpemVyID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuJGNvbnRhaW5lci5sZW5ndGggIT09IDEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy4kY29udGFpbmVyLmZpbmQoXCIuXCIgKyB0aGlzLkVsZW1lbnRzLnNpemVyKS5yZW1vdmUoKTtcbiAgfTtcblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUuc2l6ZXJfZG9lc250X2V4aXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuJGNvbnRhaW5lci5maW5kKFwiLlwiICsgdGhpcy5FbGVtZW50cy5zaXplcikubGVuZ3RoID09PSAwO1xuICB9O1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5jcmVhdGVfc2l6ZXIgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRjb250YWluZXIuYXBwZW5kKFwiPGRpdiBjbGFzcz1cXFwiXCIgKyB0aGlzLkVsZW1lbnRzLnNpemVyICsgXCJcXFwiPjwvZGl2PlwiKTtcbiAgfTtcblxuICByZXR1cm4gUG9ydGZvbGlvX01hc29ucnk7XG5cbn0pKFBvcnRmb2xpb19JbnRlcmZhY2UpO1xuXG53aW5kb3cuUFBfTW9kdWxlcy5Qb3J0Zm9saW9fTWFzb25yeSA9IFBvcnRmb2xpb19NYXNvbnJ5O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBvcnRmb2xpb19NYXNvbnJ5O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lVRzl5ZEdadmJHbHZYMDFoYzI5dWNua3Vhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lKUWIzSjBabTlzYVc5ZlRXRnpiMjV5ZVM1amIyWm1aV1VpWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanRCUVVGQk96czdRVUZCUVN4SlFVRkJMR2RFUVVGQk8wVkJRVUU3T3pzN1FVRkhRU3hEUVVGQkxFZEJRVWtzVDBGQlFTeERRVUZUTEZGQlFWUTdPMEZCUTBvc1MwRkJRU3hIUVVGUkxFOUJRVUVzUTBGQlV5eFZRVUZVT3p0QlFVTlNMRzFDUVVGQkxFZEJRWE5DTEU5QlFVRXNRMEZCVXl4MVFrRkJWRHM3UVVGSGFFSTdPenM3T3pzN096czdPemhDUVVWTUxGRkJRVUVzUjBGRFF6dEpRVUZCTEZOQlFVRXNSVUZCVnl4WlFVRllPMGxCUTBFc1MwRkJRU3hGUVVGWExHMUNRVVJZTzBsQlJVRXNTVUZCUVN4RlFVRlhMR3RDUVVaWU96czdPMEZCU1VRN096czdPRUpCUjBFc1ZVRkJRU3hIUVVGWkxGTkJRVUU3VjBGRFdDeEpRVUZETEVOQlFVRXNWVUZCUkN4SFFVRmpMRU5CUVVFc1EwRkJSeXhIUVVGQkxFZEJRVWtzU1VGQlF5eERRVUZCTEZGQlFWRXNRMEZCUXl4VFFVRnFRanRGUVVSSU96czdRVUZIV2pzN096czdPenM0UWtGTlFTeFBRVUZCTEVkQlFWTXNVMEZCUVR0QlFVTlNMRkZCUVVFN1NVRkJRU3hKUVVGVkxFbEJRVU1zUTBGQlFTeFZRVUZWTEVOQlFVTXNUVUZCV2l4TFFVRnpRaXhEUVVGb1F6dEJRVUZCTEdGQlFVRTdPMGxCUlVFc1NVRkJReXhEUVVGQkxGVkJRVlVzUTBGQlF5eFJRVUZhTEVOQlFYTkNMSGRDUVVGMFFqdEpRVVZCTEVsQlFVTXNRMEZCUVN4clFrRkJSQ3hEUVVGQk8wbEJSMEVzWjBKQlFVRXNSMEZCYlVJc1MwRkJTeXhEUVVGRExGbEJRVTRzUTBGQmJVSXNkMEpCUVc1Q0xFVkJRMnhDTzAxQlFVRXNXVUZCUVN4RlFVRmpMRWRCUVVFc1IwRkJTU3hKUVVGRExFTkJRVUVzVVVGQlVTeERRVUZETEVsQlFUVkNPMDFCUTBFc1YwRkJRU3hGUVVGakxFZEJRVUVzUjBGQlNTeEpRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRXRCUkRWQ08wMUJSVUVzVFVGQlFTeEZRVUZqTEVOQlJtUTdUVUZIUVN4VlFVRkJMRVZCUVdNc1MwRklaRHRMUVVSclFqdEpRVTF1UWl4SlFVRkRMRU5CUVVFc1ZVRkJWU3hEUVVGRExFOUJRVm9zUTBGQmNVSXNaMEpCUVhKQ08xZEJSVUVzU1VGQlF5eERRVUZCTEZWQlFWVXNRMEZCUXl4UFFVRmFMRU5CUVc5Q0xFMUJRWEJDTEVWQlFUUkNMR2RDUVVFMVFpeEZRVUU0UXl4RFFVRkJMRk5CUVVFc1MwRkJRVHRoUVVGQkxGTkJRVUU3VVVGRE4wTXNTMEZCUXl4RFFVRkJMRlZCUTBFc1EwRkJReXhYUVVSR0xFTkJRMlVzZDBKQlJHWXNRMEZGUXl4RFFVRkRMRkZCUmtZc1EwRkZXU3g1UWtGR1dqdGxRVTFCTEV0QlFVc3NRMEZCUXl4UlFVRk9MRU5CUVdVc2VVSkJRV1k3VFVGUU5rTTdTVUZCUVN4RFFVRkJMRU5CUVVFc1EwRkJRU3hKUVVGQkxFTkJRVGxETzBWQmFFSlJPenM3UVVFd1FsUTdPenM3T3poQ1FVbEJMRTFCUVVFc1IwRkJVU3hUUVVGQk8wbEJRMUFzU1VGQlF5eERRVUZCTEZWQlFWVXNRMEZCUXl4UFFVRmFMRU5CUVVFN1JVRkVUenM3TzBGQlMxSTdPenM3T3poQ1FVbEJMRTlCUVVFc1IwRkJVeXhUUVVGQk8wbEJRMUlzU1VGQlF5eERRVUZCTEd0Q1FVRkVMRU5CUVVFN1NVRkZRU3hKUVVGSExFbEJRVU1zUTBGQlFTeFZRVUZWTEVOQlFVTXNUVUZCV2l4SFFVRnhRaXhEUVVGNFFqdE5RVU5ETEVsQlFVTXNRMEZCUVN4VlFVRlZMRU5CUVVNc1QwRkJXaXhEUVVGeFFpeFRRVUZ5UWl4RlFVUkVPenRGUVVoUk96czdRVUZWVkRzN096czdPRUpCU1VFc1QwRkJRU3hIUVVGVExGTkJRVUU3VjBGRFVpeEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRTlCUVZvc1EwRkJjVUlzVVVGQmNrSTdSVUZFVVRzN08wRkJTMVE3T3pzN09FSkJSMEVzYTBKQlFVRXNSMEZCYjBJc1UwRkJRVHRKUVVOdVFpeEpRVUZ0UWl4SlFVRkRMRU5CUVVFc2EwSkJRVVFzUTBGQlFTeERRVUZ1UWp0TlFVRkJMRWxCUVVNc1EwRkJRU3haUVVGRUxFTkJRVUVzUlVGQlFUczdSVUZFYlVJN096aENRVWx3UWl4clFrRkJRU3hIUVVGdlFpeFRRVUZCTzBsQlEyNUNMRWxCUVZVc1NVRkJReXhEUVVGQkxGVkJRVlVzUTBGQlF5eE5RVUZhTEV0QlFYZENMRU5CUVd4RE8wRkJRVUVzWVVGQlFUczdTVUZEUVN4SlFVRkRMRU5CUVVFc1ZVRkJWU3hEUVVGRExFbEJRVm9zUTBGQmEwSXNSMEZCUVN4SFFVRkpMRWxCUVVNc1EwRkJRU3hSUVVGUkxFTkJRVU1zUzBGQmFFTXNRMEZCZVVNc1EwRkJReXhOUVVFeFF5eERRVUZCTzBWQlJtMUNPenM0UWtGTGNFSXNhMEpCUVVFc1IwRkJiMElzVTBGQlFUdFhRVUZITEVsQlFVTXNRMEZCUVN4VlFVRlZMRU5CUVVNc1NVRkJXaXhEUVVGclFpeEhRVUZCTEVkQlFVa3NTVUZCUXl4RFFVRkJMRkZCUVZFc1EwRkJReXhMUVVGb1F5eERRVUY1UXl4RFFVRkRMRTFCUVRGRExFdEJRVzlFTzBWQlFYWkVPenM0UWtGSGNFSXNXVUZCUVN4SFFVRmpMRk5CUVVFN1NVRkRZaXhKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEUxQlFWb3NRMEZCYlVJc1pVRkJRU3hIUVVGcFFpeEpRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRXRCUVROQ0xFZEJRV2xETEZkQlFYQkVPMFZCUkdFN096czdSMEUxUm1sQ096dEJRV2xIYUVNc1RVRkJUU3hEUVVGRExGVkJRVlVzUTBGQlF5eHBRa0ZCYkVJc1IwRkJjME03TzBGQlEzUkRMRTFCUVUwc1EwRkJReXhQUVVGUUxFZEJRV2xDSW4wPVxuIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgJCwgSG9va3MsIFBvcnRmb2xpbywgUG9ydGZvbGlvX0V2ZW50X01hbmFnZXI7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cblBvcnRmb2xpb19FdmVudF9NYW5hZ2VyID0gcmVxdWlyZSgnLi9Qb3J0Zm9saW9fRXZlbnRfTWFuYWdlcicpO1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuUG9ydGZvbGlvID0gbmV3IFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyKCk7XG5cbkhvb2tzLmFkZEFjdGlvbigncGhvcnQuY29yZS5yZWFkeScsIFBvcnRmb2xpby5wcmVwYXJlLCA1MCk7XG5cbkhvb2tzLmFkZEFjdGlvbigncGhvcnQuY29yZS5sb2FkZWQnLCBQb3J0Zm9saW8uY3JlYXRlLCA1MCk7XG5cbkhvb2tzLmFkZEFjdGlvbigncGhvcnQuY29yZS5yZWFkeScsIGZ1bmN0aW9uKCkge1xuICB2YXIgUG9ydGZvbGlvX01hc29ucnk7XG4gIGlmICgkKCcuUFBfTWFzb25yeScpLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBQb3J0Zm9saW9fTWFzb25yeSA9IHJlcXVpcmUoJy4vUG9ydGZvbGlvX01hc29ucnknKTtcbiAgcmV0dXJuIG5ldyBQb3J0Zm9saW9fTWFzb25yeSgpO1xufSk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWMzUmhjblF1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SnpkR0Z5ZEM1amIyWm1aV1VpWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanRCUVVGQk96czdRVUZCUVN4SlFVRkJPenRCUVVkQkxFdEJRVUVzUjBGQlVTeFBRVUZCTEVOQlFWTXNWVUZCVkRzN1FVRkRVaXgxUWtGQlFTeEhRVUV3UWl4UFFVRkJMRU5CUVZNc01rSkJRVlE3TzBGQlF6RkNMRU5CUVVFc1IwRkJTU3hQUVVGQkxFTkJRVkVzVVVGQlVqczdRVUZIU2l4VFFVRkJMRWRCUVdkQ0xFbEJRVUVzZFVKQlFVRXNRMEZCUVRzN1FVRkhhRUlzUzBGQlN5eERRVUZETEZOQlFVNHNRMEZCWjBJc2EwSkJRV2hDTEVWQlFXOURMRk5CUVZNc1EwRkJReXhQUVVFNVF5eEZRVUYxUkN4RlFVRjJSRHM3UVVGRFFTeExRVUZMTEVOQlFVTXNVMEZCVGl4RFFVRm5RaXh0UWtGQmFFSXNSVUZCY1VNc1UwRkJVeXhEUVVGRExFMUJRUzlETEVWQlFYVkVMRVZCUVhaRU96dEJRVWxCTEV0QlFVc3NRMEZCUXl4VFFVRk9MRU5CUVdkQ0xHdENRVUZvUWl4RlFVRnZReXhUUVVGQk8wRkJSVzVETEUxQlFVRTdSVUZCUVN4SlFVRm5RaXhEUVVGQkxFTkJRVWNzWVVGQlNDeERRVUZyUWl4RFFVRkRMRTFCUVc1Q0xFdEJRVFpDTEVOQlFUZERPMEZCUVVFc1YwRkJUeXhOUVVGUU96dEZRVVZCTEdsQ1FVRkJMRWRCUVc5Q0xFOUJRVUVzUTBGQlV5eHhRa0ZCVkR0VFFVTm9RaXhKUVVGQkxHbENRVUZCTEVOQlFVRTdRVUZNSzBJc1EwRkJjRU1pZlE9PVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
