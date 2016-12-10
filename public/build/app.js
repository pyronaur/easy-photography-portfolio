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
    Hooks.addAction('pp.core.ready', this.wait_for_load);
  }

  Core.prototype.ready = function() {
    if (Hooks.applyFilters('pp.core.ready', true)) {
      Hooks.doAction('pp.core.ready');
    }
  };

  Core.prototype.wait_for_load = function() {
    return $('.PP_Wrapper').imagesLoaded(this.loaded);
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
    return Hooks.addAction('pp.lazy.autoload', this.autoload);
  };

  Abstract_Lazy_Loader.prototype.detach_events = function() {
    return Hooks.removeAction('pp.lazy.autoload', this.autoload);
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
  return lazy_instance = new (Hooks.applyFilters('pp.lazy.handler', Lazy_Masonry));
};

Hooks.addAction('pp.portfolio.prepare', init_lazy_loader, 100);

Hooks.addAction('pp.portfolio.destroy', function() {
  if (lazy_instance) {
    lazy_instance.destroy();
    return lazy_instance = null;
  }
});

Hooks.addAction('pp.portfolio.refresh', function() {
  return Hooks.doAction('pp.lazy.autoload');
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./Lazy_Masonry":7}],9:[function(require,module,exports){
(function (global){
var Hooks, Portfolio_Event_Manager;

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);


/*

     * Initialize Portfolio Core
	---
		Using p50 @ `pp.core.ready`
		Late priority is going to force explicit priority in any other moving parts that are going to touch portfolio layout at `pp.loaded`
	---
 */

Portfolio_Event_Manager = (function() {
  function Portfolio_Event_Manager() {}

  Portfolio_Event_Manager.prototype.prepare = function() {
    Hooks.doAction('pp.portfolio.prepare');
  };

  Portfolio_Event_Manager.prototype.create = function() {
    Hooks.doAction('pp.portfolio.create');
  };

  Portfolio_Event_Manager.prototype.refresh = function() {
    Hooks.doAction('pp.portfolio.refresh');
  };

  Portfolio_Event_Manager.prototype.destroy = function() {
    Hooks.doAction('pp.portfolio.destroy');
    Hooks.removeAction('pp.loaded', this.create, 50);
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
    Hooks.addAction('pp.portfolio.prepare', this.prepare, 50);
    Hooks.addAction('pp.portfolio.create', this.create, 50);
    Hooks.addAction('pp.portfolio.refresh', this.refresh, 50);
    Hooks.addAction('pp.portfolio.destroy', this.destroy, 50);
    return Hooks.addAction('pp.portfolio.destroy', this.purge_actions, 100);
  };

  Portfolio_Interface.prototype.purge_actions = function() {
    Hooks.removeAction('pp.portfolio.prepare', this.prepare, 50);
    Hooks.removeAction('pp.portfolio.create', this.create, 50);
    Hooks.removeAction('pp.portfolio.refresh', this.refresh, 50);
    Hooks.removeAction('pp.portfolio.destroy', this.destroy, 50);
    return Hooks.removeAction('pp.portfolio.destroy', this.purge_actions, 100);
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

Hooks.addAction('pp.core.ready', Portfolio.prepare, 50);

Hooks.addAction('pp.core.loaded', Portfolio.create, 50);

Hooks.addAction('pp.core.ready', function() {
  var Portfolio_Masonry;
  if ($('.PP_Masonry').length === 0) {
    return false;
  }
  Portfolio_Masonry = require('./Portfolio_Masonry');
  return new Portfolio_Masonry();
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./Portfolio_Event_Manager":9,"./Portfolio_Masonry":11}]},{},[1])


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jb3JlL1Bob3RvZ3JhcGh5X1BvcnRmb2xpby5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY29yZS9XaW5kb3cuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvcG9wdXAuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvQWJzdHJhY3RfTGF6eV9Mb2FkZXIuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvSXRlbV9EYXRhLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0xhenlfTWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvbGF6eS9zdGFydC5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL1BvcnRmb2xpb19FdmVudF9NYW5hZ2VyLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9wb3J0Zm9saW8vUG9ydGZvbGlvX0ludGVyZmFjZS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL1BvcnRmb2xpb19NYXNvbnJ5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9wb3J0Zm9saW8vc3RhcnQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2xIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMzSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxuLypcbiAgICBMb2FkIERlcGVuZGVuY2llc1xuICovXG52YXIgJCwgSG9va3M7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG53aW5kb3cuUFBfTW9kdWxlcyA9IHtcbiAgUG9ydGZvbGlvX0ludGVyZmFjZTogcmVxdWlyZSgnLi9wb3J0Zm9saW8vUG9ydGZvbGlvX0ludGVyZmFjZScpLFxuICBJdGVtX0RhdGE6IHJlcXVpcmUoJy4vbGF6eS9JdGVtX0RhdGEnKSxcbiAgQWJzdHJhY3RfTGF6eV9Mb2FkZXI6IHJlcXVpcmUoJy4vbGF6eS9BYnN0cmFjdF9MYXp5X0xvYWRlcicpXG59O1xuXG5cbi8qXG5cdEJvb3Qgb24gYGRvY3VtZW50LnJlYWR5YFxuICovXG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICB2YXIgUGhvdG9ncmFwaHlfUG9ydGZvbGlvO1xuICBpZiAoISQoJ2JvZHknKS5oYXNDbGFzcygnUFBfUG9ydGZvbGlvJykpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgUGhvdG9ncmFwaHlfUG9ydGZvbGlvID0gbmV3IChyZXF1aXJlKCcuL2NvcmUvUGhvdG9ncmFwaHlfUG9ydGZvbGlvJykpKCk7XG4gIFBob3RvZ3JhcGh5X1BvcnRmb2xpby5yZWFkeSgpO1xufSk7XG5cblxuLypcblx0TG9hZCBBcHBcbiAqL1xuXG5yZXF1aXJlKCcuL3BvcnRmb2xpby9zdGFydCcpO1xuXG5yZXF1aXJlKCcuL2dhbGxlcnkvcG9wdXAnKTtcblxucmVxdWlyZSgnLi9sYXp5L3N0YXJ0Jyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVlYQndMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaVlYQndMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaU8wRkJRVUU3T3p0QlFVRkJMRWxCUVVFN08wRkJSMEVzUzBGQlFTeEhRVUZSTEU5QlFVRXNRMEZCVXl4VlFVRlVPenRCUVVOU0xFTkJRVUVzUjBGQlNTeFBRVUZCTEVOQlFWTXNVVUZCVkRzN1FVRkpTaXhOUVVGTkxFTkJRVU1zVlVGQlVDeEhRVVZETzBWQlFVRXNiVUpCUVVFc1JVRkJjVUlzVDBGQlFTeERRVUZUTEdsRFFVRlVMRU5CUVhKQ08wVkJSMEVzVTBGQlFTeEZRVUZYTEU5QlFVRXNRMEZCVXl4clFrRkJWQ3hEUVVoWU8wVkJUVUVzYjBKQlFVRXNSVUZCYzBJc1QwRkJRU3hEUVVGVExEWkNRVUZVTEVOQlRuUkNPenM3TzBGQlUwUTdPenM3UVVGSFFTeERRVUZCTEVOQlFVY3NVVUZCU0N4RFFVRmhMRU5CUVVNc1MwRkJaQ3hEUVVGdlFpeFRRVUZCTzBGQlIyNUNMRTFCUVVFN1JVRkJRU3hKUVVGVkxFTkJRVWtzUTBGQlFTeERRVUZITEUxQlFVZ3NRMEZCVnl4RFFVRkRMRkZCUVZvc1EwRkJjMElzWTBGQmRFSXNRMEZCWkR0QlFVRkJMRmRCUVVFN08wVkJSMEVzY1VKQlFVRXNSMEZCTkVJc1NVRkJRU3hEUVVGRkxFOUJRVUVzUTBGQlV5dzRRa0ZCVkN4RFFVRkdMRU5CUVVFc1EwRkJRVHRGUVVNMVFpeHhRa0ZCY1VJc1EwRkJReXhMUVVGMFFpeERRVUZCTzBGQlVHMUNMRU5CUVhCQ096czdRVUZaUVRzN096dEJRVXRCTEU5QlFVRXNRMEZCVVN4dFFrRkJVanM3UVVGSFFTeFBRVUZCTEVOQlFWRXNhVUpCUVZJN08wRkJSMEVzVDBGQlFTeERRVUZSTEdOQlFWSWlmUT09XG4iLCJcbi8qXG4gICAgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBDb3JlLCBIb29rcyxcbiAgYmluZCA9IGZ1bmN0aW9uKGZuLCBtZSl7IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7IH07IH07XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5Db3JlID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBDb3JlKCkge1xuICAgIHRoaXMud2FpdF9mb3JfbG9hZCA9IGJpbmQodGhpcy53YWl0X2Zvcl9sb2FkLCB0aGlzKTtcbiAgICB0aGlzLnJlYWR5ID0gYmluZCh0aGlzLnJlYWR5LCB0aGlzKTtcbiAgICBIb29rcy5hZGRBY3Rpb24oJ3BwLmNvcmUucmVhZHknLCB0aGlzLndhaXRfZm9yX2xvYWQpO1xuICB9XG5cbiAgQ29yZS5wcm90b3R5cGUucmVhZHkgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoSG9va3MuYXBwbHlGaWx0ZXJzKCdwcC5jb3JlLnJlYWR5JywgdHJ1ZSkpIHtcbiAgICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5jb3JlLnJlYWR5Jyk7XG4gICAgfVxuICB9O1xuXG4gIENvcmUucHJvdG90eXBlLndhaXRfZm9yX2xvYWQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJCgnLlBQX1dyYXBwZXInKS5pbWFnZXNMb2FkZWQodGhpcy5sb2FkZWQpO1xuICB9O1xuXG4gIENvcmUucHJvdG90eXBlLmxvYWRlZCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChIb29rcy5hcHBseUZpbHRlcnMoJ3BwLmNvcmUubG9hZGVkJywgdHJ1ZSkpIHtcbiAgICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5jb3JlLmxvYWRlZCcpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gQ29yZTtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb3JlO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lVR2h2ZEc5bmNtRndhSGxmVUc5eWRHWnZiR2x2TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lVR2h2ZEc5bmNtRndhSGxmVUc5eWRHWnZiR2x2TG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lPMEZCUVVFN096dEJRVUZCTEVsQlFVRXNZMEZCUVR0RlFVRkJPenRCUVVkQkxFTkJRVUVzUjBGQlNTeFBRVUZCTEVOQlFWTXNVVUZCVkRzN1FVRkRTaXhMUVVGQkxFZEJRVkVzVDBGQlFTeERRVUZUTEZWQlFWUTdPMEZCUjBZN1JVRkZVU3hqUVVGQk96czdTVUZEV2l4TFFVRkxMRU5CUVVNc1UwRkJUaXhEUVVGblFpeGxRVUZvUWl4RlFVRnBReXhKUVVGRExFTkJRVUVzWVVGQmJFTTdSVUZFV1RzN2FVSkJTV0lzUzBGQlFTeEhRVUZQTEZOQlFVRTdTVUZEVGl4SlFVRkhMRXRCUVVzc1EwRkJReXhaUVVGT0xFTkJRVzlDTEdWQlFYQkNMRVZCUVhGRExFbEJRWEpETEVOQlFVZzdUVUZEUXl4TFFVRkxMRU5CUVVNc1VVRkJUaXhEUVVGbExHVkJRV1lzUlVGRVJEczdSVUZFVFRzN2FVSkJTMUFzWVVGQlFTeEhRVUZsTEZOQlFVRTdWMEZGWkN4RFFVRkJMRU5CUVVjc1lVRkJTQ3hEUVVGclFpeERRVUZETEZsQlFXNUNMRU5CUVdsRExFbEJRVU1zUTBGQlFTeE5RVUZzUXp0RlFVWmpPenRwUWtGTFppeE5RVUZCTEVkQlFWRXNVMEZCUVR0SlFVTlFMRWxCUVVjc1MwRkJTeXhEUVVGRExGbEJRVTRzUTBGQmIwSXNaMEpCUVhCQ0xFVkJRWE5ETEVsQlFYUkRMRU5CUVVnN1RVRkRReXhMUVVGTExFTkJRVU1zVVVGQlRpeERRVUZsTEdkQ1FVRm1MRVZCUkVRN08wVkJSRTg3T3pzN096dEJRVTlVTEUxQlFVMHNRMEZCUXl4UFFVRlFMRWRCUVdsQ0luMD1cbiIsInZhciBIb29rcywgZ2V0X3NpemU7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbmdldF9zaXplID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgd2lkdGg6IHdpbmRvdy5pbm5lcldpZHRoIHx8ICR3aW5kb3cud2lkdGgoKSxcbiAgICBoZWlnaHQ6IHdpbmRvdy5pbm5lckhlaWdodCB8fCAkd2luZG93LmhlaWdodCgpXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdldF9zaXplKCk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVYybHVaRzkzTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lWMmx1Wkc5M0xtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeEpRVUZCT3p0QlFVRkJMRXRCUVVFc1IwRkJVU3hQUVVGQkxFTkJRVk1zVlVGQlZEczdRVUZIVWl4UlFVRkJMRWRCUVZjc1UwRkJRVHRUUVVOV08wbEJRVUVzUzBGQlFTeEZRVUZSTEUxQlFVMHNRMEZCUXl4VlFVRlFMRWxCUVhGQ0xFOUJRVThzUTBGQlF5eExRVUZTTEVOQlFVRXNRMEZCTjBJN1NVRkRRU3hOUVVGQkxFVkJRVkVzVFVGQlRTeERRVUZETEZkQlFWQXNTVUZCYzBJc1QwRkJUeXhEUVVGRExFMUJRVklzUTBGQlFTeERRVVE1UWpzN1FVRkVWVHM3UVVGTFdDeE5RVUZOTEVOQlFVTXNUMEZCVUN4SFFVRnBRaXhSUVVGQkxFTkJRVUVpZlE9PVxuIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgJCwgSG9va3MsIEl0ZW1fRGF0YSwgZ2V0X2RhdGE7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5JdGVtX0RhdGEgPSByZXF1aXJlKCcuLi9sYXp5L0l0ZW1fRGF0YScpO1xuXG5nZXRfZGF0YSA9IGZ1bmN0aW9uKGVsKSB7XG4gIHZhciAkY29udGFpbmVyLCAkZWwsICRpdGVtcywgaXRlbXM7XG4gICRlbCA9ICQoZWwpO1xuICAkY29udGFpbmVyID0gJGVsLmNsb3Nlc3QoJy5QUF9HYWxsZXJ5Jyk7XG4gICRpdGVtcyA9ICRjb250YWluZXIuZmluZCgnLlBQX0dhbGxlcnlfX2l0ZW0nKTtcbiAgaXRlbXMgPSAkaXRlbXMubWFwKGZ1bmN0aW9uKGtleSwgaXRlbSkge1xuICAgIHZhciBmdWxsLCBpdGVtX2RhdGE7XG4gICAgaXRlbV9kYXRhID0gbmV3IEl0ZW1fRGF0YSgkKGl0ZW0pKTtcbiAgICBpZiAoaXRlbV9kYXRhLmdldF90eXBlKCkgPT09ICd2aWRlbycpIHtcbiAgICAgIGZ1bGwgPSBpdGVtX2RhdGEuZ2V0X29yX2ZhbHNlKCd2aWRlb191cmwnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZnVsbCA9IGl0ZW1fZGF0YS5nZXRfdXJsKCdmdWxsJyk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBzcmM6IGZ1bGwsXG4gICAgICB0aHVtYjogaXRlbV9kYXRhLmdldF91cmwoJ3RodW1iJylcbiAgICB9O1xuICB9KTtcbiAgcmV0dXJuIGl0ZW1zO1xufTtcblxuXG4vKlxuICAgIEBUT0RPOiBOZWVkIGRldGFjaC9kZXN0cm95IG1ldGhvZHNcbiAqL1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3BwLmNvcmUucmVhZHknLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICQoJy5QUF9HYWxsZXJ5X19pdGVtJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgIHZhciAkZWw7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICRlbCA9ICQodGhpcyk7XG4gICAgcmV0dXJuICRlbC5saWdodEdhbGxlcnkoe1xuICAgICAgZHluYW1pYzogdHJ1ZSxcbiAgICAgIGR5bmFtaWNFbDogZ2V0X2RhdGEodGhpcyksXG4gICAgICBpbmRleDogJCgnLlBQX0dhbGxlcnlfX2l0ZW0nKS5pbmRleCgkZWwpLFxuICAgICAgc3BlZWQ6IDM1MCxcbiAgICAgIHByZWxvYWQ6IDMsXG4gICAgICBkb3dubG9hZDogZmFsc2UsXG4gICAgICB2aWRlb01heFdpZHRoOiAkKHdpbmRvdykud2lkdGgoKSAqIDAuOFxuICAgIH0pO1xuICB9KTtcbn0pO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2ljRzl3ZFhBdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUp3YjNCMWNDNWpiMlptWldVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWp0QlFVRkJPenM3UVVGQlFTeEpRVUZCT3p0QlFVZEJMRU5CUVVFc1IwRkJTU3hQUVVGQkxFTkJRVk1zVVVGQlZEczdRVUZEU2l4TFFVRkJMRWRCUVZFc1QwRkJRU3hEUVVGVExGVkJRVlE3TzBGQlExSXNVMEZCUVN4SFFVRlpMRTlCUVVFc1EwRkJVeXh0UWtGQlZEczdRVUZGV2l4UlFVRkJMRWRCUVZjc1UwRkJSU3hGUVVGR08wRkJRMVlzVFVGQlFUdEZRVUZCTEVkQlFVRXNSMEZCVFN4RFFVRkJMRU5CUVVjc1JVRkJTRHRGUVVOT0xGVkJRVUVzUjBGQllTeEhRVUZITEVOQlFVTXNUMEZCU2l4RFFVRmhMR0ZCUVdJN1JVRkZZaXhOUVVGQkxFZEJRVk1zVlVGQlZTeERRVUZETEVsQlFWZ3NRMEZCYVVJc2JVSkJRV3BDTzBWQlJWUXNTMEZCUVN4SFFVRlJMRTFCUVUwc1EwRkJReXhIUVVGUUxFTkJRVmNzVTBGQlJTeEhRVUZHTEVWQlFVOHNTVUZCVUR0QlFVTnNRaXhSUVVGQk8wbEJRVUVzVTBGQlFTeEhRVUZuUWl4SlFVRkJMRk5CUVVFc1EwRkJWeXhEUVVGQkxFTkJRVWNzU1VGQlNDeERRVUZZTzBsQlIyaENMRWxCUVVjc1UwRkJVeXhEUVVGRExGRkJRVllzUTBGQlFTeERRVUZCTEV0QlFYZENMRTlCUVROQ08wMUJRME1zU1VGQlFTeEhRVUZQTEZOQlFWTXNRMEZCUXl4WlFVRldMRU5CUVhkQ0xGZEJRWGhDTEVWQlJGSTdTMEZCUVN4TlFVRkJPMDFCUjBNc1NVRkJRU3hIUVVGUExGTkJRVk1zUTBGQlF5eFBRVUZXTEVOQlFXMUNMRTFCUVc1Q0xFVkJTRkk3TzBGQlMwRXNWMEZCVHp0TlFVTk9MRWRCUVVFc1JVRkJUeXhKUVVSRU8wMUJSVTRzUzBGQlFTeEZRVUZQTEZOQlFWTXNRMEZCUXl4UFFVRldMRU5CUVcxQ0xFOUJRVzVDTEVOQlJrUTdPMFZCVkZjc1EwRkJXRHRCUVdWU0xGTkJRVTg3UVVGeVFrYzdPenRCUVhWQ1dEczdPenRCUVVkQkxFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMR1ZCUVdoQ0xFVkJRV2xETEZOQlFVRTdVMEZGYUVNc1EwRkJRU3hEUVVGSExHMUNRVUZJTEVOQlFYZENMRU5CUVVNc1JVRkJla0lzUTBGQk5FSXNUMEZCTlVJc1JVRkJjVU1zVTBGQlJTeERRVUZHTzBGQlEzQkRMRkZCUVVFN1NVRkJRU3hEUVVGRExFTkJRVU1zWTBGQlJpeERRVUZCTzBsQlIwRXNSMEZCUVN4SFFVRk5MRU5CUVVFc1EwRkJSeXhKUVVGSU8xZEJSMDRzUjBGQlJ5eERRVUZETEZsQlFVb3NRMEZEUXp0TlFVRkJMRTlCUVVFc1JVRkJWeXhKUVVGWU8wMUJRMEVzVTBGQlFTeEZRVUZYTEZGQlFVRXNRMEZCVlN4SlFVRldMRU5CUkZnN1RVRkZRU3hMUVVGQkxFVkJRVmNzUTBGQlFTeERRVUZITEcxQ1FVRklMRU5CUVhkQ0xFTkJRVU1zUzBGQmVrSXNRMEZCSzBJc1IwRkJMMElzUTBGR1dEdE5RVWRCTEV0QlFVRXNSVUZCVnl4SFFVaFlPMDFCU1VFc1QwRkJRU3hGUVVGWExFTkJTbGc3VFVGTFFTeFJRVUZCTEVWQlFWY3NTMEZNV0R0TlFVMUJMR0ZCUVVFc1JVRkJaU3hEUVVGQkxFTkJRVVVzVFVGQlJpeERRVUZUTEVOQlFVTXNTMEZCVml4RFFVRkJMRU5CUVVFc1IwRkJiMElzUjBGT2JrTTdTMEZFUkR0RlFWQnZReXhEUVVGeVF6dEJRVVpuUXl4RFFVRnFReUo5XG4iLCJcbi8qXG4gICAgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBBYnN0cmFjdF9MYXp5X0xvYWRlciwgSG9va3MsIEl0ZW1fRGF0YTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbkl0ZW1fRGF0YSA9IHJlcXVpcmUoJy4vSXRlbV9EYXRhJyk7XG5cbkFic3RyYWN0X0xhenlfTG9hZGVyID0gKGZ1bmN0aW9uKCkge1xuICBBYnN0cmFjdF9MYXp5X0xvYWRlci5wcm90b3R5cGUuRWxlbWVudHMgPSB7XG4gICAgaXRlbTogJ1BQX0xhenlfSW1hZ2UnLFxuICAgIHBsYWNlaG9sZGVyOiAnUFBfTGF6eV9JbWFnZV9fcGxhY2Vob2xkZXInLFxuICAgIGxpbms6ICdQUF9KU19MYXp5X19saW5rJyxcbiAgICBpbWFnZTogJ1BQX0pTX0xhenlfX2ltYWdlJ1xuICB9O1xuXG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5JdGVtcyA9IFtdO1xuXG4gIGZ1bmN0aW9uIEFic3RyYWN0X0xhenlfTG9hZGVyKCkge1xuICAgIHRoaXMuc2V0dXBfZGF0YSgpO1xuICAgIHRoaXMucmVzaXplX2FsbCgpO1xuICAgIHRoaXMuYXR0YWNoX2V2ZW50cygpO1xuICB9XG5cblxuICAvKlxuICBcdFx0QWJzdHJhY3QgTWV0aG9kc1xuICAgKi9cblxuICBBYnN0cmFjdF9MYXp5X0xvYWRlci5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYEFic3RyYWN0X0xhenlfTG9hZGVyYCBtdXN0IGltcGxlbWVudCBgcmVzaXplYCBtZXRob2RcIik7XG4gIH07XG5cbiAgQWJzdHJhY3RfTGF6eV9Mb2FkZXIucHJvdG90eXBlLmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgQWJzdHJhY3RfTGF6eV9Mb2FkZXJgIG11c3QgaW1wbGVtZW50IGBsb2FkYCBtZXRob2RcIik7XG4gIH07XG5cbiAgQWJzdHJhY3RfTGF6eV9Mb2FkZXIucHJvdG90eXBlLmF1dG9sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYEFic3RyYWN0X0xhenlfTG9hZGVyYCBtdXN0IGltcGxlbWVudCBgYXV0b2xvYWRgIG1ldGhvZFwiKTtcbiAgfTtcblxuICBBYnN0cmFjdF9MYXp5X0xvYWRlci5wcm90b3R5cGUuc2V0dXBfZGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciAkaXRlbXM7XG4gICAgdGhpcy5JdGVtcyA9IFtdO1xuICAgICRpdGVtcyA9ICQoXCIuXCIgKyB0aGlzLkVsZW1lbnRzLml0ZW0pO1xuICAgICRpdGVtcy5lYWNoKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGtleSwgZWwpIHtcbiAgICAgICAgdmFyICRlbDtcbiAgICAgICAgJGVsID0gJChlbCk7XG4gICAgICAgIHJldHVybiBfdGhpcy5JdGVtcy5wdXNoKHtcbiAgICAgICAgICBlbDogZWwsXG4gICAgICAgICAgJGVsOiAkZWwsXG4gICAgICAgICAgZGF0YTogbmV3IEl0ZW1fRGF0YSgkZWwpLFxuICAgICAgICAgIGxvYWRlZDogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfTtcblxuXG4gIC8qXG4gIFx0XHRNZXRob2RzXG4gICAqL1xuXG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5yZXNpemVfYWxsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGksIGl0ZW0sIGxlbiwgcmVmLCByZXN1bHRzO1xuICAgIHJlZiA9IHRoaXMuSXRlbXM7XG4gICAgcmVzdWx0cyA9IFtdO1xuICAgIGZvciAoaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgaXRlbSA9IHJlZltpXTtcbiAgICAgIHJlc3VsdHMucHVzaCh0aGlzLnJlc2l6ZShpdGVtKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5sb2FkX2FsbCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpLCBpdGVtLCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICByZWYgPSB0aGlzLkl0ZW1zO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGl0ZW0gPSByZWZbaV07XG4gICAgICB0aGlzLmxvYWQoaXRlbSk7XG4gICAgICByZXN1bHRzLnB1c2godGhpcy5yZW1vdmVfcGxhY2Vob2xkZXIoaXRlbSkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICBBYnN0cmFjdF9MYXp5X0xvYWRlci5wcm90b3R5cGUucmVtb3ZlX3BsYWNlaG9sZGVyID0gZnVuY3Rpb24oaXRlbSkge1xuICAgIHJldHVybiBpdGVtLiRlbC5maW5kKFwiLlwiICsgdGhpcy5FbGVtZW50cy5wbGFjZWhvbGRlciArIFwiLCBub3NjcmlwdFwiKS5yZW1vdmUoKTtcbiAgfTtcblxuICBBYnN0cmFjdF9MYXp5X0xvYWRlci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmRldGFjaF9ldmVudHMoKTtcbiAgfTtcblxuICBBYnN0cmFjdF9MYXp5X0xvYWRlci5wcm90b3R5cGUuYXR0YWNoX2V2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBIb29rcy5hZGRBY3Rpb24oJ3BwLmxhenkuYXV0b2xvYWQnLCB0aGlzLmF1dG9sb2FkKTtcbiAgfTtcblxuICBBYnN0cmFjdF9MYXp5X0xvYWRlci5wcm90b3R5cGUuZGV0YWNoX2V2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBIb29rcy5yZW1vdmVBY3Rpb24oJ3BwLmxhenkuYXV0b2xvYWQnLCB0aGlzLmF1dG9sb2FkKTtcbiAgfTtcblxuICByZXR1cm4gQWJzdHJhY3RfTGF6eV9Mb2FkZXI7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gQWJzdHJhY3RfTGF6eV9Mb2FkZXI7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVFXSnpkSEpoWTNSZlRHRjZlVjlNYjJGa1pYSXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lKQlluTjBjbUZqZEY5TVlYcDVYMHh2WVdSbGNpNWpiMlptWldVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWp0QlFVRkJPenM3UVVGQlFTeEpRVUZCT3p0QlFVZEJMRU5CUVVFc1IwRkJTU3hQUVVGQkxFTkJRVk1zVVVGQlZEczdRVUZEU2l4TFFVRkJMRWRCUVZFc1QwRkJRU3hEUVVGVExGVkJRVlE3TzBGQlExSXNVMEZCUVN4SFFVRlpMRTlCUVVFc1EwRkJVeXhoUVVGVU96dEJRVVZPTzJsRFFVVk1MRkZCUVVFc1IwRkRRenRKUVVGQkxFbEJRVUVzUlVGQllTeGxRVUZpTzBsQlEwRXNWMEZCUVN4RlFVRmhMRFJDUVVSaU8wbEJSVUVzU1VGQlFTeEZRVUZoTEd0Q1FVWmlPMGxCUjBFc1MwRkJRU3hGUVVGaExHMUNRVWhpT3pzN2FVTkJTMFFzUzBGQlFTeEhRVUZQT3p0RlFVZE5MRGhDUVVGQk8wbEJRMW9zU1VGQlF5eERRVUZCTEZWQlFVUXNRMEZCUVR0SlFVTkJMRWxCUVVNc1EwRkJRU3hWUVVGRUxFTkJRVUU3U1VGRFFTeEpRVUZETEVOQlFVRXNZVUZCUkN4RFFVRkJPMFZCU0ZrN096dEJRVTFpT3pzN08ybERRVWRCTEUxQlFVRXNSMEZCVlN4VFFVRkJPMEZCUVVjc1ZVRkJWU3hKUVVGQkxFdEJRVUVzUTBGQlR5eHJSa0ZCVUR0RlFVRmlPenRwUTBGRFZpeEpRVUZCTEVkQlFWVXNVMEZCUVR0QlFVRkhMRlZCUVZVc1NVRkJRU3hMUVVGQkxFTkJRVThzWjBaQlFWQTdSVUZCWWpzN2FVTkJRMVlzVVVGQlFTeEhRVUZWTEZOQlFVRTdRVUZCUnl4VlFVRlZMRWxCUVVFc1MwRkJRU3hEUVVGUExHOUdRVUZRTzBWQlFXSTdPMmxEUVVkV0xGVkJRVUVzUjBGQldTeFRRVUZCTzBGQlJWZ3NVVUZCUVR0SlFVRkJMRWxCUVVNc1EwRkJRU3hMUVVGRUxFZEJRVk03U1VGRlZDeE5RVUZCTEVkQlFWTXNRMEZCUVN4RFFVRkhMRWRCUVVFc1IwRkJTU3hKUVVGRExFTkJRVUVzVVVGQlVTeERRVUZETEVsQlFXcENPMGxCUlZRc1RVRkJUU3hEUVVGRExFbEJRVkFzUTBGQldTeERRVUZCTEZOQlFVRXNTMEZCUVR0aFFVRkJMRk5CUVVVc1IwRkJSaXhGUVVGUExFVkJRVkE3UVVGRldDeFpRVUZCTzFGQlFVRXNSMEZCUVN4SFFVRk5MRU5CUVVFc1EwRkJSeXhGUVVGSU8yVkJRMDRzUzBGQlF5eERRVUZCTEV0QlFVc3NRMEZCUXl4SlFVRlFMRU5CUTBNN1ZVRkJRU3hGUVVGQkxFVkJRVkVzUlVGQlVqdFZRVU5CTEVkQlFVRXNSVUZCVVN4SFFVUlNPMVZCUlVFc1NVRkJRU3hGUVVGWkxFbEJRVUVzVTBGQlFTeERRVUZYTEVkQlFWZ3NRMEZHV2p0VlFVZEJMRTFCUVVFc1JVRkJVU3hMUVVoU08xTkJSRVE3VFVGSVZ6dEpRVUZCTEVOQlFVRXNRMEZCUVN4RFFVRkJMRWxCUVVFc1EwRkJXanRGUVU1WE96czdRVUZyUWxvN096czdhVU5CUjBFc1ZVRkJRU3hIUVVGWkxGTkJRVUU3UVVGRFdDeFJRVUZCTzBGQlFVRTdRVUZCUVR0VFFVRkJMSEZEUVVGQk96dHRRa0ZCUVN4SlFVRkRMRU5CUVVFc1RVRkJSQ3hEUVVGVExFbEJRVlE3UVVGQlFUczdSVUZFVnpzN2FVTkJSMW9zVVVGQlFTeEhRVUZWTEZOQlFVRTdRVUZEVkN4UlFVRkJPMEZCUVVFN1FVRkJRVHRUUVVGQkxIRkRRVUZCT3p0TlFVTkRMRWxCUVVNc1EwRkJRU3hKUVVGRUxFTkJRVThzU1VGQlVEdHRRa0ZEUVN4SlFVRkRMRU5CUVVFc2EwSkJRVVFzUTBGQmNVSXNTVUZCY2tJN1FVRkdSRHM3UlVGRVV6czdhVU5CUzFZc2EwSkJRVUVzUjBGQmIwSXNVMEZCUlN4SlFVRkdPMWRCUTI1Q0xFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNTVUZCVkN4RFFVRmxMRWRCUVVFc1IwRkJTU3hKUVVGRExFTkJRVUVzVVVGQlVTeERRVUZETEZkQlFXUXNSMEZCTUVJc1dVRkJla01zUTBGQmMwUXNRMEZCUXl4TlFVRjJSQ3hEUVVGQk8wVkJSRzFDT3p0cFEwRkpjRUlzVDBGQlFTeEhRVUZUTEZOQlFVRTdWMEZEVWl4SlFVRkRMRU5CUVVFc1lVRkJSQ3hEUVVGQk8wVkJSRkU3TzJsRFFVZFVMR0ZCUVVFc1IwRkJaU3hUUVVGQk8xZEJRMlFzUzBGQlN5eERRVUZETEZOQlFVNHNRMEZCWjBJc2EwSkJRV2hDTEVWQlFXOURMRWxCUVVNc1EwRkJRU3hSUVVGeVF6dEZRVVJqT3p0cFEwRkhaaXhoUVVGQkxFZEJRV1VzVTBGQlFUdFhRVU5rTEV0QlFVc3NRMEZCUXl4WlFVRk9MRU5CUVcxQ0xHdENRVUZ1UWl4RlFVRjFReXhKUVVGRExFTkJRVUVzVVVGQmVFTTdSVUZFWXpzN096czdPMEZCU1doQ0xFMUJRVTBzUTBGQlF5eFBRVUZRTEVkQlFXbENJbjA9XG4iLCJ2YXIgSXRlbV9EYXRhO1xuXG5JdGVtX0RhdGEgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIEl0ZW1fRGF0YSgkZWwpIHtcbiAgICB2YXIgZGF0YTtcbiAgICB0aGlzLiRlbCA9ICRlbDtcbiAgICBkYXRhID0gJGVsLmRhdGEoJ2l0ZW0nKTtcbiAgICBpZiAoIWRhdGEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkVsZW1lbnQgZG9lc24ndCBjb250YWluIGBkYXRhLWl0ZW1gIGF0dHJpYnV0ZVwiKTtcbiAgICB9XG4gICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgfVxuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X2RhdGEgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGltYWdlO1xuICAgIGltYWdlID0gdGhpcy5kYXRhWydpbWFnZXMnXVtuYW1lXTtcbiAgICBpZiAoIWltYWdlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBpbWFnZTtcbiAgfTtcblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF9zaXplID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBoZWlnaHQsIGltYWdlLCByZWYsIHNpemUsIHdpZHRoO1xuICAgIGltYWdlID0gdGhpcy5nZXRfZGF0YShuYW1lKTtcbiAgICBpZiAoIWltYWdlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHNpemUgPSBpbWFnZVsnc2l6ZSddO1xuICAgIHJlZiA9IHNpemUuc3BsaXQoJ3gnKSwgd2lkdGggPSByZWZbMF0sIGhlaWdodCA9IHJlZlsxXTtcbiAgICB3aWR0aCA9IHBhcnNlSW50KHdpZHRoKTtcbiAgICBoZWlnaHQgPSBwYXJzZUludChoZWlnaHQpO1xuICAgIHJldHVybiBbd2lkdGgsIGhlaWdodF07XG4gIH07XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfdXJsID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBpbWFnZTtcbiAgICBpbWFnZSA9IHRoaXMuZ2V0X2RhdGEobmFtZSk7XG4gICAgaWYgKCFpbWFnZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gaW1hZ2VbJ3VybCddO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X29yX2ZhbHNlID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKHRoaXMuZGF0YVtrZXldKSB7XG4gICAgICByZXR1cm4gdGhpcy5kYXRhW2tleV07XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF9yYXRpbyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldF9vcl9mYWxzZSgncmF0aW8nKTtcbiAgfTtcblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF90eXBlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0X29yX2ZhbHNlKCd0eXBlJyk7XG4gIH07XG5cbiAgcmV0dXJuIEl0ZW1fRGF0YTtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBJdGVtX0RhdGE7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVNYUmxiVjlFWVhSaExtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpU1hSbGJWOUVZWFJoTG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4SlFVRkJPenRCUVVGTk8wVkJSVkVzYlVKQlFVVXNSMEZCUmp0QlFVTmFMRkZCUVVFN1NVRkJRU3hKUVVGRExFTkJRVUVzUjBGQlJDeEhRVUZQTzBsQlExQXNTVUZCUVN4SFFVRlBMRWRCUVVjc1EwRkJReXhKUVVGS0xFTkJRVlVzVFVGQlZqdEpRVVZRTEVsQlFVY3NRMEZCU1N4SlFVRlFPMEZCUTBNc1dVRkJWU3hKUVVGQkxFdEJRVUVzUTBGQlRTd3JRMEZCVGl4RlFVUllPenRKUVVkQkxFbEJRVU1zUTBGQlFTeEpRVUZFTEVkQlFWRTdSVUZRU1RzN2MwSkJWMklzVVVGQlFTeEhRVUZWTEZOQlFVVXNTVUZCUmp0QlFVTlVMRkZCUVVFN1NVRkJRU3hMUVVGQkxFZEJRVkVzU1VGQlF5eERRVUZCTEVsQlFVMHNRMEZCUVN4UlFVRkJMRU5CUVZrc1EwRkJRU3hKUVVGQk8wbEJRek5DTEVsQlFXZENMRU5CUVVrc1MwRkJjRUk3UVVGQlFTeGhRVUZQTEUxQlFWQTdPMEZCUlVFc1YwRkJUenRGUVVwRk96dHpRa0ZOVml4UlFVRkJMRWRCUVZVc1UwRkJSU3hKUVVGR08wRkJRMVFzVVVGQlFUdEpRVUZCTEV0QlFVRXNSMEZCVVN4SlFVRkRMRU5CUVVFc1VVRkJSQ3hEUVVGWExFbEJRVmc3U1VGRFVpeEpRVUZuUWl4RFFVRkpMRXRCUVhCQ08wRkJRVUVzWVVGQlR5eE5RVUZRT3p0SlFVVkJMRWxCUVVFc1IwRkJUeXhMUVVGUExFTkJRVUVzVFVGQlFUdEpRVVZrTEUxQlFXdENMRWxCUVVrc1EwRkJReXhMUVVGTUxFTkJRVmtzUjBGQldpeERRVUZzUWl4RlFVRkRMR05CUVVRc1JVRkJVVHRKUVVWU0xFdEJRVUVzUjBGQlVTeFJRVUZCTEVOQlFWVXNTMEZCVmp0SlFVTlNMRTFCUVVFc1IwRkJVeXhSUVVGQkxFTkJRVlVzVFVGQlZqdEJRVVZVTEZkQlFVOHNRMEZCUXl4TFFVRkVMRVZCUVZFc1RVRkJVanRGUVZoRk96dHpRa0ZoVml4UFFVRkJMRWRCUVZNc1UwRkJSU3hKUVVGR08wRkJRMUlzVVVGQlFUdEpRVUZCTEV0QlFVRXNSMEZCVVN4SlFVRkRMRU5CUVVFc1VVRkJSQ3hEUVVGWExFbEJRVmc3U1VGRFVpeEpRVUZuUWl4RFFVRkpMRXRCUVhCQ08wRkJRVUVzWVVGQlR5eE5RVUZRT3p0QlFVTkJMRmRCUVU4c1MwRkJUeXhEUVVGQkxFdEJRVUU3UlVGSVRqczdjMEpCUzFRc1dVRkJRU3hIUVVGakxGTkJRVVVzUjBGQlJqdEpRVU5pTEVsQlFVY3NTVUZCUXl4RFFVRkJMRWxCUVUwc1EwRkJRU3hIUVVGQkxFTkJRVlk3UVVGRFF5eGhRVUZQTEVsQlFVTXNRMEZCUVN4SlFVRk5MRU5CUVVFc1IwRkJRU3hGUVVSbU96dEJRVVZCTEZkQlFVODdSVUZJVFRzN2MwSkJTMlFzVTBGQlFTeEhRVUZqTEZOQlFVRTdWMEZCUnl4SlFVRkRMRU5CUVVFc1dVRkJSQ3hEUVVGbExFOUJRV1k3UlVGQlNEczdjMEpCUTJRc1VVRkJRU3hIUVVGakxGTkJRVUU3VjBGQlJ5eEpRVUZETEVOQlFVRXNXVUZCUkN4RFFVRmxMRTFCUVdZN1JVRkJTRHM3T3pzN08wRkJSMllzVFVGQlRTeERRVUZETEU5QlFWQXNSMEZCYVVJaWZRPT1cbiIsInZhciAkLCBBYnN0cmFjdF9MYXp5X0xvYWRlciwgTGF6eV9NYXNvbnJ5LCBfX1dJTkRPVyxcbiAgYmluZCA9IGZ1bmN0aW9uKGZuLCBtZSl7IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7IH07IH0sXG4gIGV4dGVuZCA9IGZ1bmN0aW9uKGNoaWxkLCBwYXJlbnQpIHsgZm9yICh2YXIga2V5IGluIHBhcmVudCkgeyBpZiAoaGFzUHJvcC5jYWxsKHBhcmVudCwga2V5KSkgY2hpbGRba2V5XSA9IHBhcmVudFtrZXldOyB9IGZ1bmN0aW9uIGN0b3IoKSB7IHRoaXMuY29uc3RydWN0b3IgPSBjaGlsZDsgfSBjdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7IGNoaWxkLnByb3RvdHlwZSA9IG5ldyBjdG9yKCk7IGNoaWxkLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7IHJldHVybiBjaGlsZDsgfSxcbiAgaGFzUHJvcCA9IHt9Lmhhc093blByb3BlcnR5O1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuQWJzdHJhY3RfTGF6eV9Mb2FkZXIgPSByZXF1aXJlKCcuL0Fic3RyYWN0X0xhenlfTG9hZGVyJyk7XG5cbl9fV0lORE9XID0gcmVxdWlyZSgnLi4vY29yZS9XaW5kb3cnKTtcblxuTGF6eV9NYXNvbnJ5ID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgZXh0ZW5kKExhenlfTWFzb25yeSwgc3VwZXJDbGFzcyk7XG5cbiAgZnVuY3Rpb24gTGF6eV9NYXNvbnJ5KCkge1xuICAgIHRoaXMubG9hZF9pdGVtc19pbl92aWV3ID0gYmluZCh0aGlzLmxvYWRfaXRlbXNfaW5fdmlldywgdGhpcyk7XG4gICAgdGhpcy5hdXRvbG9hZCA9IGJpbmQodGhpcy5hdXRvbG9hZCwgdGhpcyk7XG4gICAgdGhpcy5kZWJvdW5jZWRfbG9hZF9pdGVtc19pbl92aWV3ID0gXy5kZWJvdW5jZSh0aGlzLmxvYWRfaXRlbXNfaW5fdmlldywgNTApO1xuICAgIExhenlfTWFzb25yeS5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzKTtcbiAgfVxuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24oaXRlbSkge1xuICAgIHJldHVybiBpdGVtLiRlbC5jc3Moe1xuICAgICAgJ21pbi1oZWlnaHQnOiBNYXRoLmZsb29yKHRoaXMuZ2V0X3dpZHRoKCkgLyBpdGVtLmRhdGEuZ2V0X3JhdGlvKCkpXG4gICAgfSk7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5nZXRfd2lkdGggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJCgnLlBQX01hc29ucnlfX3NpemVyJykud2lkdGgoKTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmF1dG9sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMubG9hZF9pdGVtc19pbl92aWV3KCk7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24oaXRlbSkge1xuICAgIHZhciAkaW1hZ2UsIGZ1bGwsIHRodW1iO1xuICAgIHRodW1iID0gaXRlbS5kYXRhLmdldF91cmwoJ3RodW1iJyk7XG4gICAgZnVsbCA9IGl0ZW0uZGF0YS5nZXRfdXJsKCdmdWxsJyk7XG4gICAgaXRlbS4kZWwucHJlcGVuZChcIjxhIGNsYXNzPVxcXCJcIiArIHRoaXMuRWxlbWVudHMubGluayArIFwiXFxcIiBocmVmPVxcXCJcIiArIGZ1bGwgKyBcIlxcXCIgcmVsPVxcXCJnYWxsZXJ5XFxcIj5cXG48aW1nIGNsYXNzPVxcXCJcIiArIHRoaXMuRWxlbWVudHMuaW1hZ2UgKyBcIlxcXCIgc3JjPVxcXCJcIiArIHRodW1iICsgXCJcXFwiIGNsYXNzPVxcXCJQUF9KU19fbG9hZGluZ1xcXCIgLz5cXG48L2E+XCIpLnJlbW92ZUNsYXNzKCdMYXp5LUltYWdlJyk7XG4gICAgaXRlbS5sb2FkZWQgPSB0cnVlO1xuICAgICRpbWFnZSA9IGl0ZW0uJGVsLmZpbmQoJ2ltZycpO1xuICAgIHJldHVybiAkaW1hZ2UuaW1hZ2VzTG9hZGVkKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAkaW1hZ2UuYWRkQ2xhc3MoJ1BQX0pTX19sb2FkZWQnKS5yZW1vdmVDbGFzcygnUFBfSlNfX2xvYWRpbmcnKTtcbiAgICAgICAgcmV0dXJuIGl0ZW0uJGVsLmNzcygnbWluLWhlaWdodCcsICcnKS5yZW1vdmVDbGFzcyhfdGhpcy5FbGVtZW50cy5pdGVtKS5maW5kKFwiLlwiICsgX3RoaXMuRWxlbWVudHMucGxhY2Vob2xkZXIpLmZhZGVPdXQoNDAwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gJCh0aGlzKS5yZW1vdmUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmxvYWRfaXRlbXNfaW5fdmlldyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpLCBpdGVtLCBrZXksIGxlbiwgcmVmLCByZXN1bHRzO1xuICAgIHJlZiA9IHRoaXMuSXRlbXM7XG4gICAgcmVzdWx0cyA9IFtdO1xuICAgIGZvciAoa2V5ID0gaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGtleSA9ICsraSkge1xuICAgICAgaXRlbSA9IHJlZltrZXldO1xuICAgICAgaWYgKCFpdGVtLmxvYWRlZCAmJiB0aGlzLmluX2xvb3NlX3ZpZXcoaXRlbS5lbCkpIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMubG9hZChpdGVtKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHRzLnB1c2godm9pZCAwKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5pbl9sb29zZV92aWV3ID0gZnVuY3Rpb24oZWwpIHtcbiAgICB2YXIgcmVjdCwgc2Vuc2l0aXZpdHk7XG4gICAgaWYgKGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHNlbnNpdGl2aXR5ID0gMTAwO1xuICAgIHJldHVybiByZWN0LnRvcCArIHJlY3QuaGVpZ2h0ID49IC1zZW5zaXRpdml0eSAmJiByZWN0LmJvdHRvbSAtIHJlY3QuaGVpZ2h0IDw9IF9fV0lORE9XLmhlaWdodCArIHNlbnNpdGl2aXR5ICYmIHJlY3QubGVmdCArIHJlY3Qud2lkdGggPj0gLXNlbnNpdGl2aXR5ICYmIHJlY3QucmlnaHQgLSByZWN0LndpZHRoIDw9IF9fV0lORE9XLndpZHRoICsgc2Vuc2l0aXZpdHk7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5hdHRhY2hfZXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgJCh3aW5kb3cpLm9uKCdzY3JvbGwnLCB0aGlzLmRlYm91bmNlZF9sb2FkX2l0ZW1zX2luX3ZpZXcpO1xuICAgIHJldHVybiBMYXp5X01hc29ucnkuX19zdXBlcl9fLmF0dGFjaF9ldmVudHMuY2FsbCh0aGlzKTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmRldGFjaF9ldmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAkKHdpbmRvdykub2ZmKCdzY3JvbGwnLCB0aGlzLmRlYm91bmNlZF9sb2FkX2l0ZW1zX2luX3ZpZXcpO1xuICAgIHJldHVybiBMYXp5X01hc29ucnkuX19zdXBlcl9fLmRldGFjaF9ldmVudHMuY2FsbCh0aGlzKTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaSwgaXRlbSwga2V5LCBsZW4sIHJlZjtcbiAgICByZWYgPSB0aGlzLkl0ZW1zO1xuICAgIGZvciAoa2V5ID0gaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGtleSA9ICsraSkge1xuICAgICAgaXRlbSA9IHJlZltrZXldO1xuICAgICAgaXRlbS4kZWwuY3NzKCdtaW4taGVpZ2h0JywgJycpO1xuICAgIH1cbiAgICByZXR1cm4gTGF6eV9NYXNvbnJ5Ll9fc3VwZXJfXy5kZXN0cm95LmNhbGwodGhpcyk7XG4gIH07XG5cbiAgcmV0dXJuIExhenlfTWFzb25yeTtcblxufSkoQWJzdHJhY3RfTGF6eV9Mb2FkZXIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExhenlfTWFzb25yeTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVEdGNmVWOU5ZWE52Ym5KNUxtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpVEdGNmVWOU5ZWE52Ym5KNUxtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeEpRVUZCTEN0RFFVRkJPMFZCUVVFN096czdRVUZCUVN4RFFVRkJMRWRCUVVrc1QwRkJRU3hEUVVGVExGRkJRVlE3TzBGQlEwb3NiMEpCUVVFc1IwRkJkVUlzVDBGQlFTeERRVUZUTEhkQ1FVRlVPenRCUVVOMlFpeFJRVUZCTEVkQlFWY3NUMEZCUVN4RFFVRlRMR2RDUVVGVU96dEJRVVZNT3pzN1JVRkZVU3h6UWtGQlFUczdPMGxCUTFvc1NVRkJReXhEUVVGQkxEUkNRVUZFTEVkQlFXZERMRU5CUVVNc1EwRkJReXhSUVVGR0xFTkJRVmtzU1VGQlF5eERRVUZCTEd0Q1FVRmlMRVZCUVdsRExFVkJRV3BETzBsQlEyaERMRFJEUVVGQk8wVkJSbGs3TzNsQ1FVdGlMRTFCUVVFc1IwRkJVU3hUUVVGRkxFbEJRVVk3VjBGRFVDeEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRWRCUVZRc1EwRkJZVHROUVVGQkxGbEJRVUVzUlVGQll5eEpRVUZKTEVOQlFVTXNTMEZCVEN4RFFVRlpMRWxCUVVNc1EwRkJRU3hUUVVGRUxFTkJRVUVzUTBGQlFTeEhRVUZsTEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1UwRkJWaXhEUVVGQkxFTkJRVE5DTEVOQlFXUTdTMEZCWWp0RlFVUlBPenQ1UWtGSlVpeFRRVUZCTEVkQlFWY3NVMEZCUVR0WFFVVldMRU5CUVVFc1EwRkJSeXh2UWtGQlNDeERRVUY1UWl4RFFVRkRMRXRCUVRGQ0xFTkJRVUU3UlVGR1ZUczdlVUpCVFZnc1VVRkJRU3hIUVVGVkxGTkJRVUU3VjBGQlJ5eEpRVUZETEVOQlFVRXNhMEpCUVVRc1EwRkJRVHRGUVVGSU96dDVRa0ZKVml4SlFVRkJMRWRCUVUwc1UwRkJSU3hKUVVGR08wRkJSVXdzVVVGQlFUdEpRVUZCTEV0QlFVRXNSMEZCVVN4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFOUJRVllzUTBGQmJVSXNUMEZCYmtJN1NVRkRVaXhKUVVGQkxFZEJRVThzU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4UFFVRldMRU5CUVcxQ0xFMUJRVzVDTzBsQlJWQXNTVUZCU1N4RFFVRkRMRWRCUTB3c1EwRkJReXhQUVVSRUxFTkJRMVVzWVVGQlFTeEhRVU5KTEVsQlFVTXNRMEZCUVN4UlFVRlJMRU5CUVVNc1NVRkVaQ3hIUVVOdFFpeFpRVVJ1UWl4SFFVTTJRaXhKUVVRM1FpeEhRVU5yUXl4dlEwRkViRU1zUjBGRlRTeEpRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRXRCUm1oQ0xFZEJSWE5DTEZkQlJuUkNMRWRCUlN0Q0xFdEJSaTlDTEVkQlJYRkRMSE5EUVVndlF5eERRVTFCTEVOQlFVTXNWMEZPUkN4RFFVMWpMRmxCVG1RN1NVRlJRU3hKUVVGSkxFTkJRVU1zVFVGQlRDeEhRVUZqTzBsQlEyUXNUVUZCUVN4SFFVRlRMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zU1VGQlZDeERRVUZsTEV0QlFXWTdWMEZEVkN4TlFVRk5MRU5CUVVNc1dVRkJVQ3hEUVVGdlFpeERRVUZCTEZOQlFVRXNTMEZCUVR0aFFVRkJMRk5CUVVFN1VVRkZia0lzVFVGQlRTeERRVUZETEZGQlFWQXNRMEZCYVVJc1pVRkJha0lzUTBGQmEwTXNRMEZCUXl4WFFVRnVReXhEUVVGblJDeG5Ra0ZCYUVRN1pVRkRRU3hKUVVGSkxFTkJRVU1zUjBGRFRDeERRVUZETEVkQlJFUXNRMEZEVFN4WlFVUk9MRVZCUTI5Q0xFVkJSSEJDTEVOQlJVRXNRMEZCUXl4WFFVWkVMRU5CUldNc1MwRkJReXhEUVVGQkxGRkJRVkVzUTBGQlF5eEpRVVo0UWl4RFFVZEJMRU5CUVVNc1NVRklSQ3hEUVVkUExFZEJRVUVzUjBGQlNTeExRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRmRCU0hKQ0xFTkJTVUVzUTBGQlF5eFBRVXBFTEVOQlNWTXNSMEZLVkN4RlFVbGpMRk5CUVVFN2FVSkJRVWNzUTBGQlFTeERRVUZITEVsQlFVZ3NRMEZCVXl4RFFVRkRMRTFCUVZZc1EwRkJRVHRSUVVGSUxFTkJTbVE3VFVGSWJVSTdTVUZCUVN4RFFVRkJMRU5CUVVFc1EwRkJRU3hKUVVGQkxFTkJRWEJDTzBWQlprczdPM2xDUVRSQ1RpeHJRa0ZCUVN4SFFVRnZRaXhUUVVGQk8wRkJRMjVDTEZGQlFVRTdRVUZCUVR0QlFVRkJPMU5CUVVFc2FVUkJRVUU3TzAxQlEwTXNTVUZCUnl4RFFVRkpMRWxCUVVrc1EwRkJReXhOUVVGVUxFbEJRVzlDTEVsQlFVTXNRMEZCUVN4aFFVRkVMRU5CUVdkQ0xFbEJRVWtzUTBGQlF5eEZRVUZ5UWl4RFFVRjJRanR4UWtGRFF5eEpRVUZETEVOQlFVRXNTVUZCUkN4RFFVRlBMRWxCUVZBc1IwRkVSRHRQUVVGQkxFMUJRVUU3TmtKQlFVRTdPMEZCUkVRN08wVkJSRzFDT3p0NVFrRlBjRUlzWVVGQlFTeEhRVUZsTEZOQlFVVXNSVUZCUmp0QlFVTmtMRkZCUVVFN1NVRkJRU3hKUVVGdFFpeG5RMEZCYmtJN1FVRkJRU3hoUVVGUExFdEJRVkE3TzBsQlEwRXNTVUZCUVN4SFFVRlBMRVZCUVVVc1EwRkJReXh4UWtGQlNDeERRVUZCTzBsQlIxQXNWMEZCUVN4SFFVRmpPMEZCUTJRc1YwRkZReXhKUVVGSkxFTkJRVU1zUjBGQlRDeEhRVUZYTEVsQlFVa3NRMEZCUXl4TlFVRm9RaXhKUVVFd1FpeERRVUZETEZkQlFUTkNMRWxCUTBNc1NVRkJTU3hEUVVGRExFMUJRVXdzUjBGQll5eEpRVUZKTEVOQlFVTXNUVUZCYmtJc1NVRkJOa0lzVVVGQlVTeERRVUZETEUxQlFWUXNSMEZCYTBJc1YwRkVhRVFzU1VGSlF5eEpRVUZKTEVOQlFVTXNTVUZCVEN4SFFVRlpMRWxCUVVrc1EwRkJReXhMUVVGcVFpeEpRVUV3UWl4RFFVRkRMRmRCU2pWQ0xFbEJTME1zU1VGQlNTeERRVUZETEV0QlFVd3NSMEZCWVN4SlFVRkpMRU5CUVVNc1MwRkJiRUlzU1VGQk1rSXNVVUZCVVN4RFFVRkRMRXRCUVZRc1IwRkJhVUk3UlVGaWFFTTdPM2xDUVdsQ1ppeGhRVUZCTEVkQlFXVXNVMEZCUVR0SlFVTmtMRU5CUVVFc1EwRkJSeXhOUVVGSUxFTkJRVmNzUTBGQlF5eEZRVUZhTEVOQlFXVXNVVUZCWml4RlFVRjVRaXhKUVVGRExFTkJRVUVzTkVKQlFURkNPMWRCUTBFc09FTkJRVUU3UlVGR1l6czdlVUpCU1dZc1lVRkJRU3hIUVVGbExGTkJRVUU3U1VGRFpDeERRVUZCTEVOQlFVY3NUVUZCU0N4RFFVRlhMRU5CUVVNc1IwRkJXaXhEUVVGblFpeFJRVUZvUWl4RlFVRXdRaXhKUVVGRExFTkJRVUVzTkVKQlFUTkNPMWRCUTBFc09FTkJRVUU3UlVGR1l6czdlVUpCU1dZc1QwRkJRU3hIUVVGVExGTkJRVUU3UVVGRFVpeFJRVUZCTzBGQlFVRTdRVUZCUVN4VFFVRkJMR2xFUVVGQk96dE5RVU5ETEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1IwRkJWQ3hEUVVGaExGbEJRV0lzUlVGQk1rSXNSVUZCTTBJN1FVRkVSRHRYUVVkQkxIZERRVUZCTzBWQlNsRTdPenM3UjBGcVJtbENPenRCUVhWR00wSXNUVUZCVFN4RFFVRkRMRTlCUVZBc1IwRkJhVUlpZlE9PVxuIiwidmFyICQsIEhvb2tzLCBMYXp5X01hc29ucnksIGluaXRfbGF6eV9sb2FkZXIsIGlzX21hc29ucnksIGxhenlfaW5zdGFuY2U7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5MYXp5X01hc29ucnkgPSByZXF1aXJlKCcuL0xhenlfTWFzb25yeScpO1xuXG5sYXp5X2luc3RhbmNlID0gZmFsc2U7XG5cbmlzX21hc29ucnkgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICQoJy5QUF9NYXNvbnJ5JykubGVuZ3RoID4gMDtcbn07XG5cbmluaXRfbGF6eV9sb2FkZXIgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCFpc19tYXNvbnJ5KCkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGxhenlfaW5zdGFuY2UpIHtcbiAgICBsYXp5X2luc3RhbmNlLmRlc3Ryb3koKTtcbiAgfVxuICByZXR1cm4gbGF6eV9pbnN0YW5jZSA9IG5ldyAoSG9va3MuYXBwbHlGaWx0ZXJzKCdwcC5sYXp5LmhhbmRsZXInLCBMYXp5X01hc29ucnkpKTtcbn07XG5cbkhvb2tzLmFkZEFjdGlvbigncHAucG9ydGZvbGlvLnByZXBhcmUnLCBpbml0X2xhenlfbG9hZGVyLCAxMDApO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3BwLnBvcnRmb2xpby5kZXN0cm95JywgZnVuY3Rpb24oKSB7XG4gIGlmIChsYXp5X2luc3RhbmNlKSB7XG4gICAgbGF6eV9pbnN0YW5jZS5kZXN0cm95KCk7XG4gICAgcmV0dXJuIGxhenlfaW5zdGFuY2UgPSBudWxsO1xuICB9XG59KTtcblxuSG9va3MuYWRkQWN0aW9uKCdwcC5wb3J0Zm9saW8ucmVmcmVzaCcsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4gSG9va3MuZG9BY3Rpb24oJ3BwLmxhenkuYXV0b2xvYWQnKTtcbn0pO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2ljM1JoY25RdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUp6ZEdGeWRDNWpiMlptWldVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWtGQlFVRXNTVUZCUVRzN1FVRkJRU3hEUVVGQkxFZEJRVWtzVDBGQlFTeERRVUZUTEZGQlFWUTdPMEZCUTBvc1MwRkJRU3hIUVVGUkxFOUJRVUVzUTBGQlV5eFZRVUZVT3p0QlFVTlNMRmxCUVVFc1IwRkJaU3hQUVVGQkxFTkJRVk1zWjBKQlFWUTdPMEZCUjJZc1lVRkJRU3hIUVVGblFqczdRVUZGYUVJc1ZVRkJRU3hIUVVGaExGTkJRVUU3VTBGQlJ5eERRVUZCTEVOQlFVY3NZVUZCU0N4RFFVRnJRaXhEUVVGRExFMUJRVzVDTEVkQlFUUkNPMEZCUVM5Q096dEJRVVZpTEdkQ1FVRkJMRWRCUVcxQ0xGTkJRVUU3UlVGRGJFSXNTVUZCVlN4RFFVRkpMRlZCUVVFc1EwRkJRU3hEUVVGa08wRkJRVUVzVjBGQlFUczdSVUZGUVN4SlFVRkhMR0ZCUVVnN1NVRkRReXhoUVVGaExFTkJRVU1zVDBGQlpDeERRVUZCTEVWQlJFUTdPMU5CUzBFc1lVRkJRU3hIUVVGblFpeEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRmxCUVU0c1EwRkJiVUlzYVVKQlFXNUNMRVZCUVhORExGbEJRWFJETEVOQlFVUTdRVUZTUmpzN1FVRlpia0lzUzBGQlN5eERRVUZETEZOQlFVNHNRMEZCWjBJc2MwSkJRV2hDTEVWQlFYZERMR2RDUVVGNFF5eEZRVUV3UkN4SFFVRXhSRHM3UVVGRFFTeExRVUZMTEVOQlFVTXNVMEZCVGl4RFFVRm5RaXh6UWtGQmFFSXNSVUZCZDBNc1UwRkJRVHRGUVVOMlF5eEpRVUZITEdGQlFVZzdTVUZEUXl4aFFVRmhMRU5CUVVNc1QwRkJaQ3hEUVVGQk8xZEJRMEVzWVVGQlFTeEhRVUZuUWl4TFFVWnFRanM3UVVGRWRVTXNRMEZCZUVNN08wRkJUMEVzUzBGQlN5eERRVUZETEZOQlFVNHNRMEZCWjBJc2MwSkJRV2hDTEVWQlFYZERMRk5CUVVFN1UwRkRka01zUzBGQlN5eERRVUZETEZGQlFVNHNRMEZCWlN4clFrRkJaanRCUVVSMVF5eERRVUY0UXlKOVxuIiwidmFyIEhvb2tzLCBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlcjtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuXG4vKlxuXG4gICAgICogSW5pdGlhbGl6ZSBQb3J0Zm9saW8gQ29yZVxuXHQtLS1cblx0XHRVc2luZyBwNTAgQCBgcHAuY29yZS5yZWFkeWBcblx0XHRMYXRlIHByaW9yaXR5IGlzIGdvaW5nIHRvIGZvcmNlIGV4cGxpY2l0IHByaW9yaXR5IGluIGFueSBvdGhlciBtb3ZpbmcgcGFydHMgdGhhdCBhcmUgZ29pbmcgdG8gdG91Y2ggcG9ydGZvbGlvIGxheW91dCBhdCBgcHAubG9hZGVkYFxuXHQtLS1cbiAqL1xuXG5Qb3J0Zm9saW9fRXZlbnRfTWFuYWdlciA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gUG9ydGZvbGlvX0V2ZW50X01hbmFnZXIoKSB7fVxuXG4gIFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyLnByb3RvdHlwZS5wcmVwYXJlID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MuZG9BY3Rpb24oJ3BwLnBvcnRmb2xpby5wcmVwYXJlJyk7XG4gIH07XG5cbiAgUG9ydGZvbGlvX0V2ZW50X01hbmFnZXIucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5wb3J0Zm9saW8uY3JlYXRlJyk7XG4gIH07XG5cbiAgUG9ydGZvbGlvX0V2ZW50X01hbmFnZXIucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbigpIHtcbiAgICBIb29rcy5kb0FjdGlvbigncHAucG9ydGZvbGlvLnJlZnJlc2gnKTtcbiAgfTtcblxuICBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5wb3J0Zm9saW8uZGVzdHJveScpO1xuICAgIEhvb2tzLnJlbW92ZUFjdGlvbigncHAubG9hZGVkJywgdGhpcy5jcmVhdGUsIDUwKTtcbiAgfTtcblxuICByZXR1cm4gUG9ydGZvbGlvX0V2ZW50X01hbmFnZXI7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gUG9ydGZvbGlvX0V2ZW50X01hbmFnZXI7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVVHOXlkR1p2YkdsdlgwVjJaVzUwWDAxaGJtRm5aWEl1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SlFiM0owWm05c2FXOWZSWFpsYm5SZlRXRnVZV2RsY2k1amIyWm1aV1VpWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFc1NVRkJRVHM3UVVGQlFTeExRVUZCTEVkQlFWRXNUMEZCUVN4RFFVRlRMRlZCUVZRN096dEJRVVZTT3pzN096czdPenM3UVVGVFRUczdPMjlEUVVWTUxFOUJRVUVzUjBGQlV5eFRRVUZCTzBsQlExSXNTMEZCU3l4RFFVRkRMRkZCUVU0c1EwRkJaU3h6UWtGQlpqdEZRVVJST3p0dlEwRkpWQ3hOUVVGQkxFZEJRVkVzVTBGQlFUdEpRVU5RTEV0QlFVc3NRMEZCUXl4UlFVRk9MRU5CUVdVc2NVSkJRV1k3UlVGRVR6czdiME5CUzFJc1QwRkJRU3hIUVVGVExGTkJRVUU3U1VGRFVpeExRVUZMTEVOQlFVTXNVVUZCVGl4RFFVRmxMSE5DUVVGbU8wVkJSRkU3TzI5RFFVdFVMRTlCUVVFc1IwRkJVeXhUUVVGQk8wbEJSVklzUzBGQlN5eERRVUZETEZGQlFVNHNRMEZCWlN4elFrRkJaanRKUVVOQkxFdEJRVXNzUTBGQlF5eFpRVUZPTEVOQlFXMUNMRmRCUVc1Q0xFVkJRV2RETEVsQlFVTXNRMEZCUVN4TlFVRnFReXhGUVVGNVF5eEZRVUY2UXp0RlFVaFJPenM3T3pzN1FVRlBWaXhOUVVGTkxFTkJRVU1zVDBGQlVDeEhRVUZwUWlKOVxuIiwidmFyIEhvb2tzLCBQb3J0Zm9saW9fSW50ZXJmYWNlO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5cbi8qXG5cdEFic3RyYWN0IENsYXNzIFBvcnRvZmxpb19FdmVudF9JbWVwbGVtZW50YXRpb25cblxuICAgIEhhbmRsZXMgYWxsIHRoZSBldmVudHMgcmVxdWlyZWQgdG8gZnVsbHkgaGFuZGxlIGEgcG9ydGZvbGlvIGxheW91dCBwcm9jZXNzXG4gKi9cblxuUG9ydGZvbGlvX0ludGVyZmFjZSA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gUG9ydGZvbGlvX0ludGVyZmFjZShhcmdzKSB7XG4gICAgdGhpcy5zZXR1cF9hY3Rpb25zKCk7XG4gICAgdGhpcy5pbml0aWFsaXplKGFyZ3MpO1xuICB9XG5cbiAgUG9ydGZvbGlvX0ludGVyZmFjZS5wcm90b3R5cGUuc2V0dXBfYWN0aW9ucyA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLmFkZEFjdGlvbigncHAucG9ydGZvbGlvLnByZXBhcmUnLCB0aGlzLnByZXBhcmUsIDUwKTtcbiAgICBIb29rcy5hZGRBY3Rpb24oJ3BwLnBvcnRmb2xpby5jcmVhdGUnLCB0aGlzLmNyZWF0ZSwgNTApO1xuICAgIEhvb2tzLmFkZEFjdGlvbigncHAucG9ydGZvbGlvLnJlZnJlc2gnLCB0aGlzLnJlZnJlc2gsIDUwKTtcbiAgICBIb29rcy5hZGRBY3Rpb24oJ3BwLnBvcnRmb2xpby5kZXN0cm95JywgdGhpcy5kZXN0cm95LCA1MCk7XG4gICAgcmV0dXJuIEhvb2tzLmFkZEFjdGlvbigncHAucG9ydGZvbGlvLmRlc3Ryb3knLCB0aGlzLnB1cmdlX2FjdGlvbnMsIDEwMCk7XG4gIH07XG5cbiAgUG9ydGZvbGlvX0ludGVyZmFjZS5wcm90b3R5cGUucHVyZ2VfYWN0aW9ucyA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLnJlbW92ZUFjdGlvbigncHAucG9ydGZvbGlvLnByZXBhcmUnLCB0aGlzLnByZXBhcmUsIDUwKTtcbiAgICBIb29rcy5yZW1vdmVBY3Rpb24oJ3BwLnBvcnRmb2xpby5jcmVhdGUnLCB0aGlzLmNyZWF0ZSwgNTApO1xuICAgIEhvb2tzLnJlbW92ZUFjdGlvbigncHAucG9ydGZvbGlvLnJlZnJlc2gnLCB0aGlzLnJlZnJlc2gsIDUwKTtcbiAgICBIb29rcy5yZW1vdmVBY3Rpb24oJ3BwLnBvcnRmb2xpby5kZXN0cm95JywgdGhpcy5kZXN0cm95LCA1MCk7XG4gICAgcmV0dXJuIEhvb2tzLnJlbW92ZUFjdGlvbigncHAucG9ydGZvbGlvLmRlc3Ryb3knLCB0aGlzLnB1cmdlX2FjdGlvbnMsIDEwMCk7XG4gIH07XG5cblxuICAvKlxuICAgICBcdFJlcXVpcmUgdGhlc2UgbWV0aG9kc1xuICAgKi9cblxuICBQb3J0Zm9saW9fSW50ZXJmYWNlLnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGBpbml0aWFsaXplYCBtZXRob2RcIik7XG4gIH07XG5cbiAgUG9ydGZvbGlvX0ludGVyZmFjZS5wcm90b3R5cGUucHJlcGFyZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgcHJlcGFyZWAgbWV0aG9kXCIpO1xuICB9O1xuXG4gIFBvcnRmb2xpb19JbnRlcmZhY2UucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgY3JlYXRlYCBtZXRob2RcIik7XG4gIH07XG5cbiAgUG9ydGZvbGlvX0ludGVyZmFjZS5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgcmVmcmVzaGAgbWV0aG9kXCIpO1xuICB9O1xuXG4gIFBvcnRmb2xpb19JbnRlcmZhY2UucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYGRlc3Ryb3lgIG1ldGhvZFwiKTtcbiAgfTtcblxuICByZXR1cm4gUG9ydGZvbGlvX0ludGVyZmFjZTtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW9fSW50ZXJmYWNlO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lVRzl5ZEdadmJHbHZYMGx1ZEdWeVptRmpaUzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklsQnZjblJtYjJ4cGIxOUpiblJsY21aaFkyVXVZMjltWm1WbElsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lKQlFVRkJMRWxCUVVFN08wRkJRVUVzUzBGQlFTeEhRVUZSTEU5QlFVRXNRMEZCVXl4VlFVRlVPenM3UVVGSFVqczdPenM3TzBGQlMwMDdSVUZGVVN3MlFrRkJSU3hKUVVGR08wbEJRMW9zU1VGQlF5eERRVUZCTEdGQlFVUXNRMEZCUVR0SlFVTkJMRWxCUVVNc1EwRkJRU3hWUVVGRUxFTkJRV0VzU1VGQllqdEZRVVpaT3p0blEwRkpZaXhoUVVGQkxFZEJRV1VzVTBGQlFUdEpRVU5rTEV0QlFVc3NRMEZCUXl4VFFVRk9MRU5CUVdkQ0xITkNRVUZvUWl4RlFVRjNReXhKUVVGRExFTkJRVUVzVDBGQmVrTXNSVUZCYTBRc1JVRkJiRVE3U1VGRFFTeExRVUZMTEVOQlFVTXNVMEZCVGl4RFFVRm5RaXh4UWtGQmFFSXNSVUZCZFVNc1NVRkJReXhEUVVGQkxFMUJRWGhETEVWQlFXZEVMRVZCUVdoRU8wbEJRMEVzUzBGQlN5eERRVUZETEZOQlFVNHNRMEZCWjBJc2MwSkJRV2hDTEVWQlFYZERMRWxCUVVNc1EwRkJRU3hQUVVGNlF5eEZRVUZyUkN4RlFVRnNSRHRKUVVOQkxFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMSE5DUVVGb1FpeEZRVUYzUXl4SlFVRkRMRU5CUVVFc1QwRkJla01zUlVGQmEwUXNSVUZCYkVRN1YwRkRRU3hMUVVGTExFTkJRVU1zVTBGQlRpeERRVUZuUWl4elFrRkJhRUlzUlVGQmQwTXNTVUZCUXl4RFFVRkJMR0ZCUVhwRExFVkJRWGRFTEVkQlFYaEVPMFZCVEdNN08yZERRVTltTEdGQlFVRXNSMEZCWlN4VFFVRkJPMGxCUTJRc1MwRkJTeXhEUVVGRExGbEJRVTRzUTBGQmJVSXNjMEpCUVc1Q0xFVkJRVEpETEVsQlFVTXNRMEZCUVN4UFFVRTFReXhGUVVGeFJDeEZRVUZ5UkR0SlFVTkJMRXRCUVVzc1EwRkJReXhaUVVGT0xFTkJRVzFDTEhGQ1FVRnVRaXhGUVVFd1F5eEpRVUZETEVOQlFVRXNUVUZCTTBNc1JVRkJiVVFzUlVGQmJrUTdTVUZEUVN4TFFVRkxMRU5CUVVNc1dVRkJUaXhEUVVGdFFpeHpRa0ZCYmtJc1JVRkJNa01zU1VGQlF5eERRVUZCTEU5QlFUVkRMRVZCUVhGRUxFVkJRWEpFTzBsQlEwRXNTMEZCU3l4RFFVRkRMRmxCUVU0c1EwRkJiVUlzYzBKQlFXNUNMRVZCUVRKRExFbEJRVU1zUTBGQlFTeFBRVUUxUXl4RlFVRnhSQ3hGUVVGeVJEdFhRVU5CTEV0QlFVc3NRMEZCUXl4WlFVRk9MRU5CUVcxQ0xITkNRVUZ1UWl4RlFVRXlReXhKUVVGRExFTkJRVUVzWVVGQk5VTXNSVUZCTWtRc1IwRkJNMFE3UlVGTVl6czdPMEZCVVdZN096czdaME5CUjBFc1ZVRkJRU3hIUVVGWkxGTkJRVUU3UVVGQlJ5eFZRVUZWTEVsQlFVRXNTMEZCUVN4RFFVRlBMSEZHUVVGUU8wVkJRV0k3TzJkRFFVTmFMRTlCUVVFc1IwRkJXU3hUUVVGQk8wRkJRVWNzVlVGQlZTeEpRVUZCTEV0QlFVRXNRMEZCVHl4clJrRkJVRHRGUVVGaU96dG5RMEZEV2l4TlFVRkJMRWRCUVZrc1UwRkJRVHRCUVVGSExGVkJRVlVzU1VGQlFTeExRVUZCTEVOQlFVOHNhVVpCUVZBN1JVRkJZanM3WjBOQlExb3NUMEZCUVN4SFFVRlpMRk5CUVVFN1FVRkJSeXhWUVVGVkxFbEJRVUVzUzBGQlFTeERRVUZQTEd0R1FVRlFPMFZCUVdJN08yZERRVU5hTEU5QlFVRXNSMEZCV1N4VFFVRkJPMEZCUVVjc1ZVRkJWU3hKUVVGQkxFdEJRVUVzUTBGQlR5eHJSa0ZCVUR0RlFVRmlPenM3T3pzN1FVRkpZaXhOUVVGTkxFTkJRVU1zVDBGQlVDeEhRVUZwUWlKOVxuIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgJCwgSG9va3MsIFBvcnRmb2xpb19JbnRlcmZhY2UsIFBvcnRmb2xpb19NYXNvbnJ5LFxuICBiaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfSxcbiAgZXh0ZW5kID0gZnVuY3Rpb24oY2hpbGQsIHBhcmVudCkgeyBmb3IgKHZhciBrZXkgaW4gcGFyZW50KSB7IGlmIChoYXNQcm9wLmNhbGwocGFyZW50LCBrZXkpKSBjaGlsZFtrZXldID0gcGFyZW50W2tleV07IH0gZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9IGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTsgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTsgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTsgcmV0dXJuIGNoaWxkOyB9LFxuICBoYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHk7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5Qb3J0Zm9saW9fSW50ZXJmYWNlID0gcmVxdWlyZSgnLi9Qb3J0Zm9saW9fSW50ZXJmYWNlJyk7XG5cblBvcnRmb2xpb19NYXNvbnJ5ID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgZXh0ZW5kKFBvcnRmb2xpb19NYXNvbnJ5LCBzdXBlckNsYXNzKTtcblxuICBmdW5jdGlvbiBQb3J0Zm9saW9fTWFzb25yeSgpIHtcbiAgICB0aGlzLnJlZnJlc2ggPSBiaW5kKHRoaXMucmVmcmVzaCwgdGhpcyk7XG4gICAgdGhpcy5kZXN0cm95ID0gYmluZCh0aGlzLmRlc3Ryb3ksIHRoaXMpO1xuICAgIHRoaXMuY3JlYXRlID0gYmluZCh0aGlzLmNyZWF0ZSwgdGhpcyk7XG4gICAgdGhpcy5wcmVwYXJlID0gYmluZCh0aGlzLnByZXBhcmUsIHRoaXMpO1xuICAgIHJldHVybiBQb3J0Zm9saW9fTWFzb25yeS5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5FbGVtZW50cyA9IHtcbiAgICBjb250YWluZXI6ICdQUF9NYXNvbnJ5JyxcbiAgICBzaXplcjogJ1BQX01hc29ucnlfX3NpemVyJyxcbiAgICBpdGVtOiAnUFBfTWFzb25yeV9faXRlbSdcbiAgfTtcblxuXG4gIC8qXG4gIFx0XHRJbml0aWFsaXplXG4gICAqL1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuJGNvbnRhaW5lciA9ICQoXCIuXCIgKyB0aGlzLkVsZW1lbnRzLmNvbnRhaW5lcik7XG4gIH07XG5cblxuICAvKlxuICBcdFx0UHJlcGFyZSAmIEF0dGFjaCBFdmVudHNcbiAgICAgXHREb24ndCBzaG93IGFueXRoaW5nIHlldC5cbiAgXG4gIFx0XHRAY2FsbGVkIG9uIGhvb2sgYHBwLnBvcnRmb2xpby5wcmVwYXJlYFxuICAgKi9cblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUucHJlcGFyZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBtYXNvbnJ5X3NldHRpbmdzO1xuICAgIGlmICh0aGlzLiRjb250YWluZXIubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuJGNvbnRhaW5lci5hZGRDbGFzcygnUFBfSlNfX2xvYWRpbmdfbWFzb25yeScpO1xuICAgIHRoaXMubWF5YmVfY3JlYXRlX3NpemVyKCk7XG4gICAgbWFzb25yeV9zZXR0aW5ncyA9IEhvb2tzLmFwcGx5RmlsdGVycygncHAubWFzb25yeS5zZXR0aW5ncycsIHtcbiAgICAgIGl0ZW1TZWxlY3RvcjogXCIuXCIgKyB0aGlzLkVsZW1lbnRzLml0ZW0sXG4gICAgICBjb2x1bW5XaWR0aDogXCIuXCIgKyB0aGlzLkVsZW1lbnRzLnNpemVyLFxuICAgICAgZ3V0dGVyOiAwLFxuICAgICAgaW5pdExheW91dDogZmFsc2VcbiAgICB9KTtcbiAgICB0aGlzLiRjb250YWluZXIubWFzb25yeShtYXNvbnJ5X3NldHRpbmdzKTtcbiAgICByZXR1cm4gdGhpcy4kY29udGFpbmVyLm1hc29ucnkoJ29uY2UnLCAnbGF5b3V0Q29tcGxldGUnLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgX3RoaXMuJGNvbnRhaW5lci5yZW1vdmVDbGFzcygnUFBfSlNfX2xvYWRpbmdfbWFzb25yeScpLmFkZENsYXNzKCdQUF9KU19fbG9hZGluZ19jb21wbGV0ZScpO1xuICAgICAgICByZXR1cm4gSG9va3MuZG9BY3Rpb24oJ3BwLnBvcnRmb2xpby5yZWZyZXNoJyk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfTtcblxuXG4gIC8qXG4gIFx0XHRTdGFydCB0aGUgUG9ydGZvbGlvXG4gIFx0XHRAY2FsbGVkIG9uIGhvb2sgYHBwLnBvcnRmb2xpby5jcmVhdGVgXG4gICAqL1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRjb250YWluZXIubWFzb25yeSgpO1xuICB9O1xuXG5cbiAgLypcbiAgXHRcdERlc3Ryb3lcbiAgXHRcdEBjYWxsZWQgb24gaG9vayBgcHAucG9ydGZvbGlvLmRlc3Ryb3lgXG4gICAqL1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5tYXliZV9yZW1vdmVfc2l6ZXIoKTtcbiAgICBpZiAodGhpcy4kY29udGFpbmVyLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuJGNvbnRhaW5lci5tYXNvbnJ5KCdkZXN0cm95Jyk7XG4gICAgfVxuICB9O1xuXG5cbiAgLypcbiAgXHRcdFJlbG9hZCB0aGUgbGF5b3V0XG4gIFx0XHRAY2FsbGVkIG9uIGhvb2sgYHBwLnBvcnRmb2xpby5yZWZyZXNoYFxuICAgKi9cblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLiRjb250YWluZXIubWFzb25yeSgnbGF5b3V0Jyk7XG4gIH07XG5cblxuICAvKlxuICBcdFx0Q3JlYXRlIGEgc2l6ZXIgZWxlbWVudCBmb3IganF1ZXJ5LW1hc29ucnkgdG8gdXNlXG4gICAqL1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5tYXliZV9jcmVhdGVfc2l6ZXIgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5zaXplcl9kb2VzbnRfZXhpc3QoKSkge1xuICAgICAgdGhpcy5jcmVhdGVfc2l6ZXIoKTtcbiAgICB9XG4gIH07XG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLm1heWJlX3JlbW92ZV9zaXplciA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLiRjb250YWluZXIubGVuZ3RoICE9PSAxKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuJGNvbnRhaW5lci5maW5kKFwiLlwiICsgdGhpcy5FbGVtZW50cy5zaXplcikucmVtb3ZlKCk7XG4gIH07XG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLnNpemVyX2RvZXNudF9leGlzdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLiRjb250YWluZXIuZmluZChcIi5cIiArIHRoaXMuRWxlbWVudHMuc2l6ZXIpLmxlbmd0aCA9PT0gMDtcbiAgfTtcblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUuY3JlYXRlX3NpemVyID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kY29udGFpbmVyLmFwcGVuZChcIjxkaXYgY2xhc3M9XFxcIlwiICsgdGhpcy5FbGVtZW50cy5zaXplciArIFwiXFxcIj48L2Rpdj5cIik7XG4gIH07XG5cbiAgcmV0dXJuIFBvcnRmb2xpb19NYXNvbnJ5O1xuXG59KShQb3J0Zm9saW9fSW50ZXJmYWNlKTtcblxud2luZG93LlBQX01vZHVsZXMuUG9ydGZvbGlvX01hc29ucnkgPSBQb3J0Zm9saW9fTWFzb25yeTtcblxubW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW9fTWFzb25yeTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVUc5eWRHWnZiR2x2WDAxaGMyOXVjbmt1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SlFiM0owWm05c2FXOWZUV0Z6YjI1eWVTNWpiMlptWldVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWp0QlFVRkJPenM3UVVGQlFTeEpRVUZCTEdkRVFVRkJPMFZCUVVFN096czdRVUZIUVN4RFFVRkJMRWRCUVVrc1QwRkJRU3hEUVVGVExGRkJRVlE3TzBGQlEwb3NTMEZCUVN4SFFVRlJMRTlCUVVFc1EwRkJVeXhWUVVGVU96dEJRVU5TTEcxQ1FVRkJMRWRCUVhOQ0xFOUJRVUVzUTBGQlV5eDFRa0ZCVkRzN1FVRkhhRUk3T3pzN096czdPenM3T3poQ1FVVk1MRkZCUVVFc1IwRkRRenRKUVVGQkxGTkJRVUVzUlVGQlZ5eFpRVUZZTzBsQlEwRXNTMEZCUVN4RlFVRlhMRzFDUVVSWU8wbEJSVUVzU1VGQlFTeEZRVUZYTEd0Q1FVWllPenM3TzBGQlNVUTdPenM3T0VKQlIwRXNWVUZCUVN4SFFVRlpMRk5CUVVFN1YwRkRXQ3hKUVVGRExFTkJRVUVzVlVGQlJDeEhRVUZqTEVOQlFVRXNRMEZCUnl4SFFVRkJMRWRCUVVrc1NVRkJReXhEUVVGQkxGRkJRVkVzUTBGQlF5eFRRVUZxUWp0RlFVUklPenM3UVVGSFdqczdPenM3T3pzNFFrRk5RU3hQUVVGQkxFZEJRVk1zVTBGQlFUdEJRVU5TTEZGQlFVRTdTVUZCUVN4SlFVRlZMRWxCUVVNc1EwRkJRU3hWUVVGVkxFTkJRVU1zVFVGQldpeExRVUZ6UWl4RFFVRm9RenRCUVVGQkxHRkJRVUU3TzBsQlJVRXNTVUZCUXl4RFFVRkJMRlZCUVZVc1EwRkJReXhSUVVGYUxFTkJRWE5DTEhkQ1FVRjBRanRKUVVWQkxFbEJRVU1zUTBGQlFTeHJRa0ZCUkN4RFFVRkJPMGxCUjBFc1owSkJRVUVzUjBGQmJVSXNTMEZCU3l4RFFVRkRMRmxCUVU0c1EwRkJiVUlzY1VKQlFXNUNMRVZCUTJ4Q08wMUJRVUVzV1VGQlFTeEZRVUZqTEVkQlFVRXNSMEZCU1N4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExFbEJRVFZDTzAxQlEwRXNWMEZCUVN4RlFVRmpMRWRCUVVFc1IwRkJTU3hKUVVGRExFTkJRVUVzVVVGQlVTeERRVUZETEV0QlJEVkNPMDFCUlVFc1RVRkJRU3hGUVVGakxFTkJSbVE3VFVGSFFTeFZRVUZCTEVWQlFXTXNTMEZJWkR0TFFVUnJRanRKUVUxdVFpeEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRTlCUVZvc1EwRkJjVUlzWjBKQlFYSkNPMWRCUlVFc1NVRkJReXhEUVVGQkxGVkJRVlVzUTBGQlF5eFBRVUZhTEVOQlFXOUNMRTFCUVhCQ0xFVkJRVFJDTEdkQ1FVRTFRaXhGUVVFNFF5eERRVUZCTEZOQlFVRXNTMEZCUVR0aFFVRkJMRk5CUVVFN1VVRkROME1zUzBGQlF5eERRVUZCTEZWQlEwRXNRMEZCUXl4WFFVUkdMRU5CUTJVc2QwSkJSR1lzUTBGRlF5eERRVUZETEZGQlJrWXNRMEZGV1N4NVFrRkdXanRsUVUxQkxFdEJRVXNzUTBGQlF5eFJRVUZPTEVOQlFXVXNjMEpCUVdZN1RVRlFOa003U1VGQlFTeERRVUZCTEVOQlFVRXNRMEZCUVN4SlFVRkJMRU5CUVRsRE8wVkJhRUpST3pzN1FVRXdRbFE3T3pzN096aENRVWxCTEUxQlFVRXNSMEZCVVN4VFFVRkJPMGxCUTFBc1NVRkJReXhEUVVGQkxGVkJRVlVzUTBGQlF5eFBRVUZhTEVOQlFVRTdSVUZFVHpzN08wRkJTMUk3T3pzN096aENRVWxCTEU5QlFVRXNSMEZCVXl4VFFVRkJPMGxCUTFJc1NVRkJReXhEUVVGQkxHdENRVUZFTEVOQlFVRTdTVUZGUVN4SlFVRkhMRWxCUVVNc1EwRkJRU3hWUVVGVkxFTkJRVU1zVFVGQldpeEhRVUZ4UWl4RFFVRjRRanROUVVORExFbEJRVU1zUTBGQlFTeFZRVUZWTEVOQlFVTXNUMEZCV2l4RFFVRnhRaXhUUVVGeVFpeEZRVVJFT3p0RlFVaFJPenM3UVVGVlZEczdPenM3T0VKQlNVRXNUMEZCUVN4SFFVRlRMRk5CUVVFN1YwRkRVaXhKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEU5QlFWb3NRMEZCY1VJc1VVRkJja0k3UlVGRVVUczdPMEZCUzFRN096czdPRUpCUjBFc2EwSkJRVUVzUjBGQmIwSXNVMEZCUVR0SlFVTnVRaXhKUVVGdFFpeEpRVUZETEVOQlFVRXNhMEpCUVVRc1EwRkJRU3hEUVVGdVFqdE5RVUZCTEVsQlFVTXNRMEZCUVN4WlFVRkVMRU5CUVVFc1JVRkJRVHM3UlVGRWJVSTdPemhDUVVsd1FpeHJRa0ZCUVN4SFFVRnZRaXhUUVVGQk8wbEJRMjVDTEVsQlFWVXNTVUZCUXl4RFFVRkJMRlZCUVZVc1EwRkJReXhOUVVGYUxFdEJRWGRDTEVOQlFXeERPMEZCUVVFc1lVRkJRVHM3U1VGRFFTeEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRWxCUVZvc1EwRkJhMElzUjBGQlFTeEhRVUZKTEVsQlFVTXNRMEZCUVN4UlFVRlJMRU5CUVVNc1MwRkJhRU1zUTBGQmVVTXNRMEZCUXl4TlFVRXhReXhEUVVGQk8wVkJSbTFDT3pzNFFrRkxjRUlzYTBKQlFVRXNSMEZCYjBJc1UwRkJRVHRYUVVGSExFbEJRVU1zUTBGQlFTeFZRVUZWTEVOQlFVTXNTVUZCV2l4RFFVRnJRaXhIUVVGQkxFZEJRVWtzU1VGQlF5eERRVUZCTEZGQlFWRXNRMEZCUXl4TFFVRm9ReXhEUVVGNVF5eERRVUZETEUxQlFURkRMRXRCUVc5RU8wVkJRWFpFT3pzNFFrRkhjRUlzV1VGQlFTeEhRVUZqTEZOQlFVRTdTVUZEWWl4SlFVRkRMRU5CUVVFc1ZVRkJWU3hEUVVGRExFMUJRVm9zUTBGQmJVSXNaVUZCUVN4SFFVRnBRaXhKUVVGRExFTkJRVUVzVVVGQlVTeERRVUZETEV0QlFUTkNMRWRCUVdsRExGZEJRWEJFTzBWQlJHRTdPenM3UjBFMVJtbENPenRCUVdsSGFFTXNUVUZCVFN4RFFVRkRMRlZCUVZVc1EwRkJReXhwUWtGQmJFSXNSMEZCYzBNN08wRkJRM1JETEUxQlFVMHNRMEZCUXl4UFFVRlFMRWRCUVdsQ0luMD1cbiIsIlxuLypcbiAgICBEZXBlbmRlbmNpZXNcbiAqL1xudmFyICQsIEhvb2tzLCBQb3J0Zm9saW8sIFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5Qb3J0Zm9saW9fRXZlbnRfTWFuYWdlciA9IHJlcXVpcmUoJy4vUG9ydGZvbGlvX0V2ZW50X01hbmFnZXInKTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cblBvcnRmb2xpbyA9IG5ldyBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlcigpO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3BwLmNvcmUucmVhZHknLCBQb3J0Zm9saW8ucHJlcGFyZSwgNTApO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3BwLmNvcmUubG9hZGVkJywgUG9ydGZvbGlvLmNyZWF0ZSwgNTApO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3BwLmNvcmUucmVhZHknLCBmdW5jdGlvbigpIHtcbiAgdmFyIFBvcnRmb2xpb19NYXNvbnJ5O1xuICBpZiAoJCgnLlBQX01hc29ucnknKS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgUG9ydGZvbGlvX01hc29ucnkgPSByZXF1aXJlKCcuL1BvcnRmb2xpb19NYXNvbnJ5Jyk7XG4gIHJldHVybiBuZXcgUG9ydGZvbGlvX01hc29ucnkoKTtcbn0pO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2ljM1JoY25RdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUp6ZEdGeWRDNWpiMlptWldVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWp0QlFVRkJPenM3UVVGQlFTeEpRVUZCT3p0QlFVZEJMRXRCUVVFc1IwRkJVU3hQUVVGQkxFTkJRVk1zVlVGQlZEczdRVUZEVWl4MVFrRkJRU3hIUVVFd1FpeFBRVUZCTEVOQlFWTXNNa0pCUVZRN08wRkJRekZDTEVOQlFVRXNSMEZCU1N4UFFVRkJMRU5CUVZFc1VVRkJVanM3UVVGSFNpeFRRVUZCTEVkQlFXZENMRWxCUVVFc2RVSkJRVUVzUTBGQlFUczdRVUZIYUVJc1MwRkJTeXhEUVVGRExGTkJRVTRzUTBGQlowSXNaVUZCYUVJc1JVRkJhVU1zVTBGQlV5eERRVUZETEU5QlFUTkRMRVZCUVc5RUxFVkJRWEJFT3p0QlFVTkJMRXRCUVVzc1EwRkJReXhUUVVGT0xFTkJRV2RDTEdkQ1FVRm9RaXhGUVVGclF5eFRRVUZUTEVOQlFVTXNUVUZCTlVNc1JVRkJiMFFzUlVGQmNFUTdPMEZCU1VFc1MwRkJTeXhEUVVGRExGTkJRVTRzUTBGQlowSXNaVUZCYUVJc1JVRkJhVU1zVTBGQlFUdEJRVVZvUXl4TlFVRkJPMFZCUVVFc1NVRkJaMElzUTBGQlFTeERRVUZITEdGQlFVZ3NRMEZCYTBJc1EwRkJReXhOUVVGdVFpeExRVUUyUWl4RFFVRTNRenRCUVVGQkxGZEJRVThzVFVGQlVEczdSVUZGUVN4cFFrRkJRU3hIUVVGdlFpeFBRVUZCTEVOQlFWTXNjVUpCUVZRN1UwRkRhRUlzU1VGQlFTeHBRa0ZCUVN4RFFVRkJPMEZCVERSQ0xFTkJRV3BESW4wPVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
