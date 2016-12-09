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
  lazy_instance.destroy();
  return lazy_instance = null;
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


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jb3JlL1Bob3RvZ3JhcGh5X1BvcnRmb2xpby5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY29yZS9XaW5kb3cuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvcG9wdXAuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvQWJzdHJhY3RfTGF6eV9Mb2FkZXIuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvSXRlbV9EYXRhLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0xhenlfTWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvbGF6eS9zdGFydC5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL1BvcnRmb2xpb19FdmVudF9NYW5hZ2VyLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9wb3J0Zm9saW8vUG9ydGZvbGlvX0ludGVyZmFjZS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL1BvcnRmb2xpb19NYXNvbnJ5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9wb3J0Zm9saW8vc3RhcnQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2xIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzNJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG4vKlxuICAgIExvYWQgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBIb29rcztcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbndpbmRvdy5QUF9Nb2R1bGVzID0ge1xuICBQb3J0Zm9saW9fSW50ZXJmYWNlOiByZXF1aXJlKCcuL3BvcnRmb2xpby9Qb3J0Zm9saW9fSW50ZXJmYWNlJyksXG4gIEl0ZW1fRGF0YTogcmVxdWlyZSgnLi9sYXp5L0l0ZW1fRGF0YScpLFxuICBBYnN0cmFjdF9MYXp5X0xvYWRlcjogcmVxdWlyZSgnLi9sYXp5L0Fic3RyYWN0X0xhenlfTG9hZGVyJylcbn07XG5cblxuLypcblx0Qm9vdCBvbiBgZG9jdW1lbnQucmVhZHlgXG4gKi9cblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gIHZhciBQaG90b2dyYXBoeV9Qb3J0Zm9saW87XG4gIGlmICghJCgnYm9keScpLmhhc0NsYXNzKCdQUF9Qb3J0Zm9saW8nKSkge1xuICAgIHJldHVybjtcbiAgfVxuICBQaG90b2dyYXBoeV9Qb3J0Zm9saW8gPSBuZXcgKHJlcXVpcmUoJy4vY29yZS9QaG90b2dyYXBoeV9Qb3J0Zm9saW8nKSkoKTtcbiAgUGhvdG9ncmFwaHlfUG9ydGZvbGlvLnJlYWR5KCk7XG59KTtcblxuXG4vKlxuXHRMb2FkIEFwcFxuICovXG5cbnJlcXVpcmUoJy4vcG9ydGZvbGlvL3N0YXJ0Jyk7XG5cbnJlcXVpcmUoJy4vZ2FsbGVyeS9wb3B1cCcpO1xuXG5yZXF1aXJlKCcuL2xhenkvc3RhcnQnKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pWVhCd0xtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpWVhCd0xtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pTzBGQlFVRTdPenRCUVVGQkxFbEJRVUU3TzBGQlIwRXNTMEZCUVN4SFFVRlJMRTlCUVVFc1EwRkJVeXhWUVVGVU96dEJRVU5TTEVOQlFVRXNSMEZCU1N4UFFVRkJMRU5CUVZNc1VVRkJWRHM3UVVGSlNpeE5RVUZOTEVOQlFVTXNWVUZCVUN4SFFVVkRPMFZCUVVFc2JVSkJRVUVzUlVGQmNVSXNUMEZCUVN4RFFVRlRMR2xEUVVGVUxFTkJRWEpDTzBWQlIwRXNVMEZCUVN4RlFVRlhMRTlCUVVFc1EwRkJVeXhyUWtGQlZDeERRVWhZTzBWQlRVRXNiMEpCUVVFc1JVRkJjMElzVDBGQlFTeERRVUZUTERaQ1FVRlVMRU5CVG5SQ096czdPMEZCVTBRN096czdRVUZIUVN4RFFVRkJMRU5CUVVjc1VVRkJTQ3hEUVVGaExFTkJRVU1zUzBGQlpDeERRVUZ2UWl4VFFVRkJPMEZCUjI1Q0xFMUJRVUU3UlVGQlFTeEpRVUZWTEVOQlFVa3NRMEZCUVN4RFFVRkhMRTFCUVVnc1EwRkJWeXhEUVVGRExGRkJRVm9zUTBGQmMwSXNZMEZCZEVJc1EwRkJaRHRCUVVGQkxGZEJRVUU3TzBWQlIwRXNjVUpCUVVFc1IwRkJORUlzU1VGQlFTeERRVUZGTEU5QlFVRXNRMEZCVXl3NFFrRkJWQ3hEUVVGR0xFTkJRVUVzUTBGQlFUdEZRVU0xUWl4eFFrRkJjVUlzUTBGQlF5eExRVUYwUWl4RFFVRkJPMEZCVUcxQ0xFTkJRWEJDT3pzN1FVRlpRVHM3T3p0QlFVdEJMRTlCUVVFc1EwRkJVU3h0UWtGQlVqczdRVUZIUVN4UFFVRkJMRU5CUVZFc2FVSkJRVkk3TzBGQlIwRXNUMEZCUVN4RFFVRlJMR05CUVZJaWZRPT1cbiIsIlxuLypcbiAgICBEZXBlbmRlbmNpZXNcbiAqL1xudmFyICQsIENvcmUsIEhvb2tzLFxuICBiaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbkNvcmUgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIENvcmUoKSB7XG4gICAgdGhpcy53YWl0X2Zvcl9sb2FkID0gYmluZCh0aGlzLndhaXRfZm9yX2xvYWQsIHRoaXMpO1xuICAgIHRoaXMucmVhZHkgPSBiaW5kKHRoaXMucmVhZHksIHRoaXMpO1xuICAgIEhvb2tzLmFkZEFjdGlvbigncHAuY29yZS5yZWFkeScsIHRoaXMud2FpdF9mb3JfbG9hZCk7XG4gIH1cblxuICBDb3JlLnByb3RvdHlwZS5yZWFkeSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChIb29rcy5hcHBseUZpbHRlcnMoJ3BwLmNvcmUucmVhZHknLCB0cnVlKSkge1xuICAgICAgSG9va3MuZG9BY3Rpb24oJ3BwLmNvcmUucmVhZHknKTtcbiAgICB9XG4gIH07XG5cbiAgQ29yZS5wcm90b3R5cGUud2FpdF9mb3JfbG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAkKCcuUFBfV3JhcHBlcicpLmltYWdlc0xvYWRlZCh0aGlzLmxvYWRlZCk7XG4gIH07XG5cbiAgQ29yZS5wcm90b3R5cGUubG9hZGVkID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKEhvb2tzLmFwcGx5RmlsdGVycygncHAuY29yZS5sb2FkZWQnLCB0cnVlKSkge1xuICAgICAgSG9va3MuZG9BY3Rpb24oJ3BwLmNvcmUubG9hZGVkJyk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBDb3JlO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvcmU7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVVHaHZkRzluY21Gd2FIbGZVRzl5ZEdadmJHbHZMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaVVHaHZkRzluY21Gd2FIbGZVRzl5ZEdadmJHbHZMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaU8wRkJRVUU3T3p0QlFVRkJMRWxCUVVFc1kwRkJRVHRGUVVGQk96dEJRVWRCTEVOQlFVRXNSMEZCU1N4UFFVRkJMRU5CUVZNc1VVRkJWRHM3UVVGRFNpeExRVUZCTEVkQlFWRXNUMEZCUVN4RFFVRlRMRlZCUVZRN08wRkJSMFk3UlVGRlVTeGpRVUZCT3pzN1NVRkRXaXhMUVVGTExFTkJRVU1zVTBGQlRpeERRVUZuUWl4bFFVRm9RaXhGUVVGcFF5eEpRVUZETEVOQlFVRXNZVUZCYkVNN1JVRkVXVHM3YVVKQlNXSXNTMEZCUVN4SFFVRlBMRk5CUVVFN1NVRkRUaXhKUVVGSExFdEJRVXNzUTBGQlF5eFpRVUZPTEVOQlFXOUNMR1ZCUVhCQ0xFVkJRWEZETEVsQlFYSkRMRU5CUVVnN1RVRkRReXhMUVVGTExFTkJRVU1zVVVGQlRpeERRVUZsTEdWQlFXWXNSVUZFUkRzN1JVRkVUVHM3YVVKQlMxQXNZVUZCUVN4SFFVRmxMRk5CUVVFN1YwRkZaQ3hEUVVGQkxFTkJRVWNzWVVGQlNDeERRVUZyUWl4RFFVRkRMRmxCUVc1Q0xFTkJRV2xETEVsQlFVTXNRMEZCUVN4TlFVRnNRenRGUVVaak96dHBRa0ZMWml4TlFVRkJMRWRCUVZFc1UwRkJRVHRKUVVOUUxFbEJRVWNzUzBGQlN5eERRVUZETEZsQlFVNHNRMEZCYjBJc1owSkJRWEJDTEVWQlFYTkRMRWxCUVhSRExFTkJRVWc3VFVGRFF5eExRVUZMTEVOQlFVTXNVVUZCVGl4RFFVRmxMR2RDUVVGbUxFVkJSRVE3TzBWQlJFODdPenM3T3p0QlFVOVVMRTFCUVUwc1EwRkJReXhQUVVGUUxFZEJRV2xDSW4wPVxuIiwidmFyIEhvb2tzLCBnZXRfc2l6ZTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuZ2V0X3NpemUgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICB3aWR0aDogd2luZG93LmlubmVyV2lkdGggfHwgJHdpbmRvdy53aWR0aCgpLFxuICAgIGhlaWdodDogd2luZG93LmlubmVySGVpZ2h0IHx8ICR3aW5kb3cuaGVpZ2h0KClcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0X3NpemUoKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVjJsdVpHOTNMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaVYybHVaRzkzTG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4SlFVRkJPenRCUVVGQkxFdEJRVUVzUjBGQlVTeFBRVUZCTEVOQlFWTXNWVUZCVkRzN1FVRkhVaXhSUVVGQkxFZEJRVmNzVTBGQlFUdFRRVU5XTzBsQlFVRXNTMEZCUVN4RlFVRlJMRTFCUVUwc1EwRkJReXhWUVVGUUxFbEJRWEZDTEU5QlFVOHNRMEZCUXl4TFFVRlNMRU5CUVVFc1EwRkJOMEk3U1VGRFFTeE5RVUZCTEVWQlFWRXNUVUZCVFN4RFFVRkRMRmRCUVZBc1NVRkJjMElzVDBGQlR5eERRVUZETEUxQlFWSXNRMEZCUVN4RFFVUTVRanM3UVVGRVZUczdRVUZMV0N4TlFVRk5MRU5CUVVNc1QwRkJVQ3hIUVVGcFFpeFJRVUZCTEVOQlFVRWlmUT09XG4iLCJcbi8qXG4gICAgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBIb29rcywgSXRlbV9EYXRhLCBnZXRfZGF0YTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbkl0ZW1fRGF0YSA9IHJlcXVpcmUoJy4uL2xhenkvSXRlbV9EYXRhJyk7XG5cbmdldF9kYXRhID0gZnVuY3Rpb24oZWwpIHtcbiAgdmFyICRjb250YWluZXIsICRlbCwgJGl0ZW1zLCBpdGVtcztcbiAgJGVsID0gJChlbCk7XG4gICRjb250YWluZXIgPSAkZWwuY2xvc2VzdCgnLlBQX0dhbGxlcnknKTtcbiAgJGl0ZW1zID0gJGNvbnRhaW5lci5maW5kKCcuUFBfR2FsbGVyeV9faXRlbScpO1xuICBpdGVtcyA9ICRpdGVtcy5tYXAoZnVuY3Rpb24oa2V5LCBpdGVtKSB7XG4gICAgdmFyIGZ1bGwsIGl0ZW1fZGF0YTtcbiAgICBpdGVtX2RhdGEgPSBuZXcgSXRlbV9EYXRhKCQoaXRlbSkpO1xuICAgIGlmIChpdGVtX2RhdGEuZ2V0X3R5cGUoKSA9PT0gJ3ZpZGVvJykge1xuICAgICAgZnVsbCA9IGl0ZW1fZGF0YS5nZXRfb3JfZmFsc2UoJ3ZpZGVvX3VybCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmdWxsID0gaXRlbV9kYXRhLmdldF91cmwoJ2Z1bGwnKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHNyYzogZnVsbCxcbiAgICAgIHRodW1iOiBpdGVtX2RhdGEuZ2V0X3VybCgndGh1bWInKVxuICAgIH07XG4gIH0pO1xuICByZXR1cm4gaXRlbXM7XG59O1xuXG5cbi8qXG4gICAgQFRPRE86IE5lZWQgZGV0YWNoL2Rlc3Ryb3kgbWV0aG9kc1xuICovXG5cbkhvb2tzLmFkZEFjdGlvbigncHAuY29yZS5yZWFkeScsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4gJCgnLlBQX0dhbGxlcnlfX2l0ZW0nKS5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgdmFyICRlbDtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJGVsID0gJCh0aGlzKTtcbiAgICByZXR1cm4gJGVsLmxpZ2h0R2FsbGVyeSh7XG4gICAgICBkeW5hbWljOiB0cnVlLFxuICAgICAgZHluYW1pY0VsOiBnZXRfZGF0YSh0aGlzKSxcbiAgICAgIGluZGV4OiAkKCcuUFBfR2FsbGVyeV9faXRlbScpLmluZGV4KCRlbCksXG4gICAgICBzcGVlZDogMzUwLFxuICAgICAgcHJlbG9hZDogMyxcbiAgICAgIGRvd25sb2FkOiBmYWxzZSxcbiAgICAgIHZpZGVvTWF4V2lkdGg6ICQod2luZG93KS53aWR0aCgpICogMC44XG4gICAgfSk7XG4gIH0pO1xufSk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWNHOXdkWEF1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SndiM0IxY0M1amIyWm1aV1VpWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanRCUVVGQk96czdRVUZCUVN4SlFVRkJPenRCUVVkQkxFTkJRVUVzUjBGQlNTeFBRVUZCTEVOQlFWTXNVVUZCVkRzN1FVRkRTaXhMUVVGQkxFZEJRVkVzVDBGQlFTeERRVUZUTEZWQlFWUTdPMEZCUTFJc1UwRkJRU3hIUVVGWkxFOUJRVUVzUTBGQlV5eHRRa0ZCVkRzN1FVRkZXaXhSUVVGQkxFZEJRVmNzVTBGQlJTeEZRVUZHTzBGQlExWXNUVUZCUVR0RlFVRkJMRWRCUVVFc1IwRkJUU3hEUVVGQkxFTkJRVWNzUlVGQlNEdEZRVU5PTEZWQlFVRXNSMEZCWVN4SFFVRkhMRU5CUVVNc1QwRkJTaXhEUVVGaExHRkJRV0k3UlVGRllpeE5RVUZCTEVkQlFWTXNWVUZCVlN4RFFVRkRMRWxCUVZnc1EwRkJhVUlzYlVKQlFXcENPMFZCUlZRc1MwRkJRU3hIUVVGUkxFMUJRVTBzUTBGQlF5eEhRVUZRTEVOQlFWY3NVMEZCUlN4SFFVRkdMRVZCUVU4c1NVRkJVRHRCUVVOc1FpeFJRVUZCTzBsQlFVRXNVMEZCUVN4SFFVRm5RaXhKUVVGQkxGTkJRVUVzUTBGQlZ5eERRVUZCTEVOQlFVY3NTVUZCU0N4RFFVRllPMGxCUjJoQ0xFbEJRVWNzVTBGQlV5eERRVUZETEZGQlFWWXNRMEZCUVN4RFFVRkJMRXRCUVhkQ0xFOUJRVE5DTzAxQlEwTXNTVUZCUVN4SFFVRlBMRk5CUVZNc1EwRkJReXhaUVVGV0xFTkJRWGRDTEZkQlFYaENMRVZCUkZJN1MwRkJRU3hOUVVGQk8wMUJSME1zU1VGQlFTeEhRVUZQTEZOQlFWTXNRMEZCUXl4UFFVRldMRU5CUVcxQ0xFMUJRVzVDTEVWQlNGSTdPMEZCUzBFc1YwRkJUenROUVVOT0xFZEJRVUVzUlVGQlR5eEpRVVJFTzAxQlJVNHNTMEZCUVN4RlFVRlBMRk5CUVZNc1EwRkJReXhQUVVGV0xFTkJRVzFDTEU5QlFXNUNMRU5CUmtRN08wVkJWRmNzUTBGQldEdEJRV1ZTTEZOQlFVODdRVUZ5UWtjN096dEJRWFZDV0RzN096dEJRVWRCTEV0QlFVc3NRMEZCUXl4VFFVRk9MRU5CUVdkQ0xHVkJRV2hDTEVWQlFXbERMRk5CUVVFN1UwRkZhRU1zUTBGQlFTeERRVUZITEcxQ1FVRklMRU5CUVhkQ0xFTkJRVU1zUlVGQmVrSXNRMEZCTkVJc1QwRkJOVUlzUlVGQmNVTXNVMEZCUlN4RFFVRkdPMEZCUTNCRExGRkJRVUU3U1VGQlFTeERRVUZETEVOQlFVTXNZMEZCUml4RFFVRkJPMGxCUjBFc1IwRkJRU3hIUVVGTkxFTkJRVUVzUTBGQlJ5eEpRVUZJTzFkQlIwNHNSMEZCUnl4RFFVRkRMRmxCUVVvc1EwRkRRenROUVVGQkxFOUJRVUVzUlVGQlZ5eEpRVUZZTzAxQlEwRXNVMEZCUVN4RlFVRlhMRkZCUVVFc1EwRkJWU3hKUVVGV0xFTkJSRmc3VFVGRlFTeExRVUZCTEVWQlFWY3NRMEZCUVN4RFFVRkhMRzFDUVVGSUxFTkJRWGRDTEVOQlFVTXNTMEZCZWtJc1EwRkJLMElzUjBGQkwwSXNRMEZHV0R0TlFVZEJMRXRCUVVFc1JVRkJWeXhIUVVoWU8wMUJTVUVzVDBGQlFTeEZRVUZYTEVOQlNsZzdUVUZMUVN4UlFVRkJMRVZCUVZjc1MwRk1XRHROUVUxQkxHRkJRVUVzUlVGQlpTeERRVUZCTEVOQlFVVXNUVUZCUml4RFFVRlRMRU5CUVVNc1MwRkJWaXhEUVVGQkxFTkJRVUVzUjBGQmIwSXNSMEZPYmtNN1MwRkVSRHRGUVZCdlF5eERRVUZ5UXp0QlFVWm5ReXhEUVVGcVF5SjlcbiIsIlxuLypcbiAgICBEZXBlbmRlbmNpZXNcbiAqL1xudmFyICQsIEFic3RyYWN0X0xhenlfTG9hZGVyLCBIb29rcywgSXRlbV9EYXRhO1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuSXRlbV9EYXRhID0gcmVxdWlyZSgnLi9JdGVtX0RhdGEnKTtcblxuQWJzdHJhY3RfTGF6eV9Mb2FkZXIgPSAoZnVuY3Rpb24oKSB7XG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5FbGVtZW50cyA9IHtcbiAgICBpdGVtOiAnUFBfTGF6eV9JbWFnZScsXG4gICAgcGxhY2Vob2xkZXI6ICdQUF9MYXp5X0ltYWdlX19wbGFjZWhvbGRlcicsXG4gICAgbGluazogJ1BQX0pTX0xhenlfX2xpbmsnLFxuICAgIGltYWdlOiAnUFBfSlNfTGF6eV9faW1hZ2UnXG4gIH07XG5cbiAgQWJzdHJhY3RfTGF6eV9Mb2FkZXIucHJvdG90eXBlLkl0ZW1zID0gW107XG5cbiAgZnVuY3Rpb24gQWJzdHJhY3RfTGF6eV9Mb2FkZXIoKSB7XG4gICAgdGhpcy5zZXR1cF9kYXRhKCk7XG4gICAgdGhpcy5yZXNpemVfYWxsKCk7XG4gICAgdGhpcy5hdHRhY2hfZXZlbnRzKCk7XG4gIH1cblxuXG4gIC8qXG4gIFx0XHRBYnN0cmFjdCBNZXRob2RzXG4gICAqL1xuXG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgQWJzdHJhY3RfTGF6eV9Mb2FkZXJgIG11c3QgaW1wbGVtZW50IGByZXNpemVgIG1ldGhvZFwiKTtcbiAgfTtcblxuICBBYnN0cmFjdF9MYXp5X0xvYWRlci5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBBYnN0cmFjdF9MYXp5X0xvYWRlcmAgbXVzdCBpbXBsZW1lbnQgYGxvYWRgIG1ldGhvZFwiKTtcbiAgfTtcblxuICBBYnN0cmFjdF9MYXp5X0xvYWRlci5wcm90b3R5cGUuYXV0b2xvYWQgPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgQWJzdHJhY3RfTGF6eV9Mb2FkZXJgIG11c3QgaW1wbGVtZW50IGBhdXRvbG9hZGAgbWV0aG9kXCIpO1xuICB9O1xuXG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5zZXR1cF9kYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyICRpdGVtcztcbiAgICB0aGlzLkl0ZW1zID0gW107XG4gICAgJGl0ZW1zID0gJChcIi5cIiArIHRoaXMuRWxlbWVudHMuaXRlbSk7XG4gICAgJGl0ZW1zLmVhY2goKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oa2V5LCBlbCkge1xuICAgICAgICB2YXIgJGVsO1xuICAgICAgICAkZWwgPSAkKGVsKTtcbiAgICAgICAgcmV0dXJuIF90aGlzLkl0ZW1zLnB1c2goe1xuICAgICAgICAgIGVsOiBlbCxcbiAgICAgICAgICAkZWw6ICRlbCxcbiAgICAgICAgICBkYXRhOiBuZXcgSXRlbV9EYXRhKCRlbCksXG4gICAgICAgICAgbG9hZGVkOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9O1xuXG5cbiAgLypcbiAgXHRcdE1ldGhvZHNcbiAgICovXG5cbiAgQWJzdHJhY3RfTGF6eV9Mb2FkZXIucHJvdG90eXBlLnJlc2l6ZV9hbGwgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaSwgaXRlbSwgbGVuLCByZWYsIHJlc3VsdHM7XG4gICAgcmVmID0gdGhpcy5JdGVtcztcbiAgICByZXN1bHRzID0gW107XG4gICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpdGVtID0gcmVmW2ldO1xuICAgICAgcmVzdWx0cy5wdXNoKHRoaXMucmVzaXplKGl0ZW0pKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgQWJzdHJhY3RfTGF6eV9Mb2FkZXIucHJvdG90eXBlLmxvYWRfYWxsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGksIGl0ZW0sIGxlbiwgcmVmLCByZXN1bHRzO1xuICAgIHJlZiA9IHRoaXMuSXRlbXM7XG4gICAgcmVzdWx0cyA9IFtdO1xuICAgIGZvciAoaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgaXRlbSA9IHJlZltpXTtcbiAgICAgIHRoaXMubG9hZChpdGVtKTtcbiAgICAgIHJlc3VsdHMucHVzaCh0aGlzLnJlbW92ZV9wbGFjZWhvbGRlcihpdGVtKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5yZW1vdmVfcGxhY2Vob2xkZXIgPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0uJGVsLmZpbmQoXCIuXCIgKyB0aGlzLkVsZW1lbnRzLnBsYWNlaG9sZGVyICsgXCIsIG5vc2NyaXB0XCIpLnJlbW92ZSgpO1xuICB9O1xuXG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZGV0YWNoX2V2ZW50cygpO1xuICB9O1xuXG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5hdHRhY2hfZXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEhvb2tzLmFkZEFjdGlvbigncHAubGF6eS5hdXRvbG9hZCcsIHRoaXMuYXV0b2xvYWQpO1xuICB9O1xuXG4gIEFic3RyYWN0X0xhenlfTG9hZGVyLnByb3RvdHlwZS5kZXRhY2hfZXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEhvb2tzLnJlbW92ZUFjdGlvbigncHAubGF6eS5hdXRvbG9hZCcsIHRoaXMuYXV0b2xvYWQpO1xuICB9O1xuXG4gIHJldHVybiBBYnN0cmFjdF9MYXp5X0xvYWRlcjtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBBYnN0cmFjdF9MYXp5X0xvYWRlcjtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pUVdKemRISmhZM1JmVEdGNmVWOU1iMkZrWlhJdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUpCWW5OMGNtRmpkRjlNWVhwNVgweHZZV1JsY2k1amIyWm1aV1VpWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanRCUVVGQk96czdRVUZCUVN4SlFVRkJPenRCUVVkQkxFTkJRVUVzUjBGQlNTeFBRVUZCTEVOQlFWTXNVVUZCVkRzN1FVRkRTaXhMUVVGQkxFZEJRVkVzVDBGQlFTeERRVUZUTEZWQlFWUTdPMEZCUTFJc1UwRkJRU3hIUVVGWkxFOUJRVUVzUTBGQlV5eGhRVUZVT3p0QlFVVk9PMmxEUVVWTUxGRkJRVUVzUjBGRFF6dEpRVUZCTEVsQlFVRXNSVUZCWVN4bFFVRmlPMGxCUTBFc1YwRkJRU3hGUVVGaExEUkNRVVJpTzBsQlJVRXNTVUZCUVN4RlFVRmhMR3RDUVVaaU8wbEJSMEVzUzBGQlFTeEZRVUZoTEcxQ1FVaGlPenM3YVVOQlMwUXNTMEZCUVN4SFFVRlBPenRGUVVkTkxEaENRVUZCTzBsQlExb3NTVUZCUXl4RFFVRkJMRlZCUVVRc1EwRkJRVHRKUVVOQkxFbEJRVU1zUTBGQlFTeFZRVUZFTEVOQlFVRTdTVUZEUVN4SlFVRkRMRU5CUVVFc1lVRkJSQ3hEUVVGQk8wVkJTRms3T3p0QlFVMWlPenM3TzJsRFFVZEJMRTFCUVVFc1IwRkJWU3hUUVVGQk8wRkJRVWNzVlVGQlZTeEpRVUZCTEV0QlFVRXNRMEZCVHl4clJrRkJVRHRGUVVGaU96dHBRMEZEVml4SlFVRkJMRWRCUVZVc1UwRkJRVHRCUVVGSExGVkJRVlVzU1VGQlFTeExRVUZCTEVOQlFVOHNaMFpCUVZBN1JVRkJZanM3YVVOQlExWXNVVUZCUVN4SFFVRlZMRk5CUVVFN1FVRkJSeXhWUVVGVkxFbEJRVUVzUzBGQlFTeERRVUZQTEc5R1FVRlFPMFZCUVdJN08ybERRVWRXTEZWQlFVRXNSMEZCV1N4VFFVRkJPMEZCUlZnc1VVRkJRVHRKUVVGQkxFbEJRVU1zUTBGQlFTeExRVUZFTEVkQlFWTTdTVUZGVkN4TlFVRkJMRWRCUVZNc1EwRkJRU3hEUVVGSExFZEJRVUVzUjBGQlNTeEpRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRWxCUVdwQ08wbEJSVlFzVFVGQlRTeERRVUZETEVsQlFWQXNRMEZCV1N4RFFVRkJMRk5CUVVFc1MwRkJRVHRoUVVGQkxGTkJRVVVzUjBGQlJpeEZRVUZQTEVWQlFWQTdRVUZGV0N4WlFVRkJPMUZCUVVFc1IwRkJRU3hIUVVGTkxFTkJRVUVzUTBGQlJ5eEZRVUZJTzJWQlEwNHNTMEZCUXl4RFFVRkJMRXRCUVVzc1EwRkJReXhKUVVGUUxFTkJRME03VlVGQlFTeEZRVUZCTEVWQlFWRXNSVUZCVWp0VlFVTkJMRWRCUVVFc1JVRkJVU3hIUVVSU08xVkJSVUVzU1VGQlFTeEZRVUZaTEVsQlFVRXNVMEZCUVN4RFFVRlhMRWRCUVZnc1EwRkdXanRWUVVkQkxFMUJRVUVzUlVGQlVTeExRVWhTTzFOQlJFUTdUVUZJVnp0SlFVRkJMRU5CUVVFc1EwRkJRU3hEUVVGQkxFbEJRVUVzUTBGQldqdEZRVTVYT3pzN1FVRnJRbG83T3pzN2FVTkJSMEVzVlVGQlFTeEhRVUZaTEZOQlFVRTdRVUZEV0N4UlFVRkJPMEZCUVVFN1FVRkJRVHRUUVVGQkxIRkRRVUZCT3p0dFFrRkJRU3hKUVVGRExFTkJRVUVzVFVGQlJDeERRVUZUTEVsQlFWUTdRVUZCUVRzN1JVRkVWenM3YVVOQlIxb3NVVUZCUVN4SFFVRlZMRk5CUVVFN1FVRkRWQ3hSUVVGQk8wRkJRVUU3UVVGQlFUdFRRVUZCTEhGRFFVRkJPenROUVVORExFbEJRVU1zUTBGQlFTeEpRVUZFTEVOQlFVOHNTVUZCVUR0dFFrRkRRU3hKUVVGRExFTkJRVUVzYTBKQlFVUXNRMEZCY1VJc1NVRkJja0k3UVVGR1JEczdSVUZFVXpzN2FVTkJTMVlzYTBKQlFVRXNSMEZCYjBJc1UwRkJSU3hKUVVGR08xZEJRMjVDTEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1NVRkJWQ3hEUVVGbExFZEJRVUVzUjBGQlNTeEpRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRmRCUVdRc1IwRkJNRUlzV1VGQmVrTXNRMEZCYzBRc1EwRkJReXhOUVVGMlJDeERRVUZCTzBWQlJHMUNPenRwUTBGSmNFSXNUMEZCUVN4SFFVRlRMRk5CUVVFN1YwRkRVaXhKUVVGRExFTkJRVUVzWVVGQlJDeERRVUZCTzBWQlJGRTdPMmxEUVVkVUxHRkJRVUVzUjBGQlpTeFRRVUZCTzFkQlEyUXNTMEZCU3l4RFFVRkRMRk5CUVU0c1EwRkJaMElzYTBKQlFXaENMRVZCUVc5RExFbEJRVU1zUTBGQlFTeFJRVUZ5UXp0RlFVUmpPenRwUTBGSFppeGhRVUZCTEVkQlFXVXNVMEZCUVR0WFFVTmtMRXRCUVVzc1EwRkJReXhaUVVGT0xFTkJRVzFDTEd0Q1FVRnVRaXhGUVVGMVF5eEpRVUZETEVOQlFVRXNVVUZCZUVNN1JVRkVZenM3T3pzN08wRkJTV2hDTEUxQlFVMHNRMEZCUXl4UFFVRlFMRWRCUVdsQ0luMD1cbiIsInZhciBJdGVtX0RhdGE7XG5cbkl0ZW1fRGF0YSA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gSXRlbV9EYXRhKCRlbCkge1xuICAgIHZhciBkYXRhO1xuICAgIHRoaXMuJGVsID0gJGVsO1xuICAgIGRhdGEgPSAkZWwuZGF0YSgnaXRlbScpO1xuICAgIGlmICghZGF0YSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRWxlbWVudCBkb2Vzbid0IGNvbnRhaW4gYGRhdGEtaXRlbWAgYXR0cmlidXRlXCIpO1xuICAgIH1cbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICB9XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfZGF0YSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaW1hZ2U7XG4gICAgaW1hZ2UgPSB0aGlzLmRhdGFbJ2ltYWdlcyddW25hbWVdO1xuICAgIGlmICghaW1hZ2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGltYWdlO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X3NpemUgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGhlaWdodCwgaW1hZ2UsIHJlZiwgc2l6ZSwgd2lkdGg7XG4gICAgaW1hZ2UgPSB0aGlzLmdldF9kYXRhKG5hbWUpO1xuICAgIGlmICghaW1hZ2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgc2l6ZSA9IGltYWdlWydzaXplJ107XG4gICAgcmVmID0gc2l6ZS5zcGxpdCgneCcpLCB3aWR0aCA9IHJlZlswXSwgaGVpZ2h0ID0gcmVmWzFdO1xuICAgIHdpZHRoID0gcGFyc2VJbnQod2lkdGgpO1xuICAgIGhlaWdodCA9IHBhcnNlSW50KGhlaWdodCk7XG4gICAgcmV0dXJuIFt3aWR0aCwgaGVpZ2h0XTtcbiAgfTtcblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF91cmwgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGltYWdlO1xuICAgIGltYWdlID0gdGhpcy5nZXRfZGF0YShuYW1lKTtcbiAgICBpZiAoIWltYWdlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBpbWFnZVsndXJsJ107XG4gIH07XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfb3JfZmFsc2UgPSBmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAodGhpcy5kYXRhW2tleV0pIHtcbiAgICAgIHJldHVybiB0aGlzLmRhdGFba2V5XTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X3JhdGlvID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0X29yX2ZhbHNlKCdyYXRpbycpO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X3R5cGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRfb3JfZmFsc2UoJ3R5cGUnKTtcbiAgfTtcblxuICByZXR1cm4gSXRlbV9EYXRhO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEl0ZW1fRGF0YTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pU1hSbGJWOUVZWFJoTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lTWFJsYlY5RVlYUmhMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRU3hKUVVGQk96dEJRVUZOTzBWQlJWRXNiVUpCUVVVc1IwRkJSanRCUVVOYUxGRkJRVUU3U1VGQlFTeEpRVUZETEVOQlFVRXNSMEZCUkN4SFFVRlBPMGxCUTFBc1NVRkJRU3hIUVVGUExFZEJRVWNzUTBGQlF5eEpRVUZLTEVOQlFWVXNUVUZCVmp0SlFVVlFMRWxCUVVjc1EwRkJTU3hKUVVGUU8wRkJRME1zV1VGQlZTeEpRVUZCTEV0QlFVRXNRMEZCVFN3clEwRkJUaXhGUVVSWU96dEpRVWRCTEVsQlFVTXNRMEZCUVN4SlFVRkVMRWRCUVZFN1JVRlFTVHM3YzBKQlYySXNVVUZCUVN4SFFVRlZMRk5CUVVVc1NVRkJSanRCUVVOVUxGRkJRVUU3U1VGQlFTeExRVUZCTEVkQlFWRXNTVUZCUXl4RFFVRkJMRWxCUVUwc1EwRkJRU3hSUVVGQkxFTkJRVmtzUTBGQlFTeEpRVUZCTzBsQlF6TkNMRWxCUVdkQ0xFTkJRVWtzUzBGQmNFSTdRVUZCUVN4aFFVRlBMRTFCUVZBN08wRkJSVUVzVjBGQlR6dEZRVXBGT3p0elFrRk5WaXhSUVVGQkxFZEJRVlVzVTBGQlJTeEpRVUZHTzBGQlExUXNVVUZCUVR0SlFVRkJMRXRCUVVFc1IwRkJVU3hKUVVGRExFTkJRVUVzVVVGQlJDeERRVUZYTEVsQlFWZzdTVUZEVWl4SlFVRm5RaXhEUVVGSkxFdEJRWEJDTzBGQlFVRXNZVUZCVHl4TlFVRlFPenRKUVVWQkxFbEJRVUVzUjBGQlR5eExRVUZQTEVOQlFVRXNUVUZCUVR0SlFVVmtMRTFCUVd0Q0xFbEJRVWtzUTBGQlF5eExRVUZNTEVOQlFWa3NSMEZCV2l4RFFVRnNRaXhGUVVGRExHTkJRVVFzUlVGQlVUdEpRVVZTTEV0QlFVRXNSMEZCVVN4UlFVRkJMRU5CUVZVc1MwRkJWanRKUVVOU0xFMUJRVUVzUjBGQlV5eFJRVUZCTEVOQlFWVXNUVUZCVmp0QlFVVlVMRmRCUVU4c1EwRkJReXhMUVVGRUxFVkJRVkVzVFVGQlVqdEZRVmhGT3p0elFrRmhWaXhQUVVGQkxFZEJRVk1zVTBGQlJTeEpRVUZHTzBGQlExSXNVVUZCUVR0SlFVRkJMRXRCUVVFc1IwRkJVU3hKUVVGRExFTkJRVUVzVVVGQlJDeERRVUZYTEVsQlFWZzdTVUZEVWl4SlFVRm5RaXhEUVVGSkxFdEJRWEJDTzBGQlFVRXNZVUZCVHl4TlFVRlFPenRCUVVOQkxGZEJRVThzUzBGQlR5eERRVUZCTEV0QlFVRTdSVUZJVGpzN2MwSkJTMVFzV1VGQlFTeEhRVUZqTEZOQlFVVXNSMEZCUmp0SlFVTmlMRWxCUVVjc1NVRkJReXhEUVVGQkxFbEJRVTBzUTBGQlFTeEhRVUZCTEVOQlFWWTdRVUZEUXl4aFFVRlBMRWxCUVVNc1EwRkJRU3hKUVVGTkxFTkJRVUVzUjBGQlFTeEZRVVJtT3p0QlFVVkJMRmRCUVU4N1JVRklUVHM3YzBKQlMyUXNVMEZCUVN4SFFVRmpMRk5CUVVFN1YwRkJSeXhKUVVGRExFTkJRVUVzV1VGQlJDeERRVUZsTEU5QlFXWTdSVUZCU0RzN2MwSkJRMlFzVVVGQlFTeEhRVUZqTEZOQlFVRTdWMEZCUnl4SlFVRkRMRU5CUVVFc1dVRkJSQ3hEUVVGbExFMUJRV1k3UlVGQlNEczdPenM3TzBGQlIyWXNUVUZCVFN4RFFVRkRMRTlCUVZBc1IwRkJhVUlpZlE9PVxuIiwidmFyICQsIEFic3RyYWN0X0xhenlfTG9hZGVyLCBMYXp5X01hc29ucnksIF9fV0lORE9XLFxuICBiaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfSxcbiAgZXh0ZW5kID0gZnVuY3Rpb24oY2hpbGQsIHBhcmVudCkgeyBmb3IgKHZhciBrZXkgaW4gcGFyZW50KSB7IGlmIChoYXNQcm9wLmNhbGwocGFyZW50LCBrZXkpKSBjaGlsZFtrZXldID0gcGFyZW50W2tleV07IH0gZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9IGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTsgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTsgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTsgcmV0dXJuIGNoaWxkOyB9LFxuICBoYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHk7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5BYnN0cmFjdF9MYXp5X0xvYWRlciA9IHJlcXVpcmUoJy4vQWJzdHJhY3RfTGF6eV9Mb2FkZXInKTtcblxuX19XSU5ET1cgPSByZXF1aXJlKCcuLi9jb3JlL1dpbmRvdycpO1xuXG5MYXp5X01hc29ucnkgPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICBleHRlbmQoTGF6eV9NYXNvbnJ5LCBzdXBlckNsYXNzKTtcblxuICBmdW5jdGlvbiBMYXp5X01hc29ucnkoKSB7XG4gICAgdGhpcy5sb2FkX2l0ZW1zX2luX3ZpZXcgPSBiaW5kKHRoaXMubG9hZF9pdGVtc19pbl92aWV3LCB0aGlzKTtcbiAgICB0aGlzLmF1dG9sb2FkID0gYmluZCh0aGlzLmF1dG9sb2FkLCB0aGlzKTtcbiAgICB0aGlzLmRlYm91bmNlZF9sb2FkX2l0ZW1zX2luX3ZpZXcgPSBfLmRlYm91bmNlKHRoaXMubG9hZF9pdGVtc19pbl92aWV3LCA1MCk7XG4gICAgTGF6eV9NYXNvbnJ5Ll9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMpO1xuICB9XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0uJGVsLmNzcyh7XG4gICAgICAnbWluLWhlaWdodCc6IE1hdGguZmxvb3IodGhpcy5nZXRfd2lkdGgoKSAvIGl0ZW0uZGF0YS5nZXRfcmF0aW8oKSlcbiAgICB9KTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmdldF93aWR0aCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAkKCcuUFBfTWFzb25yeV9fc2l6ZXInKS53aWR0aCgpO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUuYXV0b2xvYWQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5sb2FkX2l0ZW1zX2luX3ZpZXcoKTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmxvYWQgPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgdmFyICRpbWFnZSwgZnVsbCwgdGh1bWI7XG4gICAgdGh1bWIgPSBpdGVtLmRhdGEuZ2V0X3VybCgndGh1bWInKTtcbiAgICBmdWxsID0gaXRlbS5kYXRhLmdldF91cmwoJ2Z1bGwnKTtcbiAgICBpdGVtLiRlbC5wcmVwZW5kKFwiPGEgY2xhc3M9XFxcIlwiICsgdGhpcy5FbGVtZW50cy5saW5rICsgXCJcXFwiIGhyZWY9XFxcIlwiICsgZnVsbCArIFwiXFxcIiByZWw9XFxcImdhbGxlcnlcXFwiPlxcbjxpbWcgY2xhc3M9XFxcIlwiICsgdGhpcy5FbGVtZW50cy5pbWFnZSArIFwiXFxcIiBzcmM9XFxcIlwiICsgdGh1bWIgKyBcIlxcXCIgY2xhc3M9XFxcIlBQX0pTX19sb2FkaW5nXFxcIiAvPlxcbjwvYT5cIikucmVtb3ZlQ2xhc3MoJ0xhenktSW1hZ2UnKTtcbiAgICBpdGVtLmxvYWRlZCA9IHRydWU7XG4gICAgJGltYWdlID0gaXRlbS4kZWwuZmluZCgnaW1nJyk7XG4gICAgcmV0dXJuICRpbWFnZS5pbWFnZXNMb2FkZWQoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICRpbWFnZS5hZGRDbGFzcygnUFBfSlNfX2xvYWRlZCcpLnJlbW92ZUNsYXNzKCdQUF9KU19fbG9hZGluZycpO1xuICAgICAgICByZXR1cm4gaXRlbS4kZWwuY3NzKCdtaW4taGVpZ2h0JywgJycpLnJlbW92ZUNsYXNzKF90aGlzLkVsZW1lbnRzLml0ZW0pLmZpbmQoXCIuXCIgKyBfdGhpcy5FbGVtZW50cy5wbGFjZWhvbGRlcikuZmFkZU91dCg0MDAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiAkKHRoaXMpLnJlbW92ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUubG9hZF9pdGVtc19pbl92aWV3ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGksIGl0ZW0sIGtleSwgbGVuLCByZWYsIHJlc3VsdHM7XG4gICAgcmVmID0gdGhpcy5JdGVtcztcbiAgICByZXN1bHRzID0gW107XG4gICAgZm9yIChrZXkgPSBpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsga2V5ID0gKytpKSB7XG4gICAgICBpdGVtID0gcmVmW2tleV07XG4gICAgICBpZiAoIWl0ZW0ubG9hZGVkICYmIHRoaXMuaW5fbG9vc2VfdmlldyhpdGVtLmVsKSkge1xuICAgICAgICByZXN1bHRzLnB1c2godGhpcy5sb2FkKGl0ZW0pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdHMucHVzaCh2b2lkIDApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmluX2xvb3NlX3ZpZXcgPSBmdW5jdGlvbihlbCkge1xuICAgIHZhciByZWN0LCBzZW5zaXRpdml0eTtcbiAgICBpZiAoZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0ID09IG51bGwpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgc2Vuc2l0aXZpdHkgPSAxMDA7XG4gICAgcmV0dXJuIHJlY3QudG9wICsgcmVjdC5oZWlnaHQgPj0gLXNlbnNpdGl2aXR5ICYmIHJlY3QuYm90dG9tIC0gcmVjdC5oZWlnaHQgPD0gX19XSU5ET1cuaGVpZ2h0ICsgc2Vuc2l0aXZpdHkgJiYgcmVjdC5sZWZ0ICsgcmVjdC53aWR0aCA+PSAtc2Vuc2l0aXZpdHkgJiYgcmVjdC5yaWdodCAtIHJlY3Qud2lkdGggPD0gX19XSU5ET1cud2lkdGggKyBzZW5zaXRpdml0eTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmF0dGFjaF9ldmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAkKHdpbmRvdykub24oJ3Njcm9sbCcsIHRoaXMuZGVib3VuY2VkX2xvYWRfaXRlbXNfaW5fdmlldyk7XG4gICAgcmV0dXJuIExhenlfTWFzb25yeS5fX3N1cGVyX18uYXR0YWNoX2V2ZW50cy5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUuZGV0YWNoX2V2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICQod2luZG93KS5vZmYoJ3Njcm9sbCcsIHRoaXMuZGVib3VuY2VkX2xvYWRfaXRlbXNfaW5fdmlldyk7XG4gICAgcmV0dXJuIExhenlfTWFzb25yeS5fX3N1cGVyX18uZGV0YWNoX2V2ZW50cy5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpLCBpdGVtLCBrZXksIGxlbiwgcmVmO1xuICAgIHJlZiA9IHRoaXMuSXRlbXM7XG4gICAgZm9yIChrZXkgPSBpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsga2V5ID0gKytpKSB7XG4gICAgICBpdGVtID0gcmVmW2tleV07XG4gICAgICBpdGVtLiRlbC5jc3MoJ21pbi1oZWlnaHQnLCAnJyk7XG4gICAgfVxuICAgIHJldHVybiBMYXp5X01hc29ucnkuX19zdXBlcl9fLmRlc3Ryb3kuY2FsbCh0aGlzKTtcbiAgfTtcblxuICByZXR1cm4gTGF6eV9NYXNvbnJ5O1xuXG59KShBYnN0cmFjdF9MYXp5X0xvYWRlcik7XG5cbm1vZHVsZS5leHBvcnRzID0gTGF6eV9NYXNvbnJ5O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lUR0Y2ZVY5TllYTnZibko1TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lUR0Y2ZVY5TllYTnZibko1TG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4SlFVRkJMQ3REUVVGQk8wVkJRVUU3T3pzN1FVRkJRU3hEUVVGQkxFZEJRVWtzVDBGQlFTeERRVUZUTEZGQlFWUTdPMEZCUTBvc2IwSkJRVUVzUjBGQmRVSXNUMEZCUVN4RFFVRlRMSGRDUVVGVU96dEJRVU4yUWl4UlFVRkJMRWRCUVZjc1QwRkJRU3hEUVVGVExHZENRVUZVT3p0QlFVVk1PenM3UlVGRlVTeHpRa0ZCUVRzN08wbEJRMW9zU1VGQlF5eERRVUZCTERSQ1FVRkVMRWRCUVdkRExFTkJRVU1zUTBGQlF5eFJRVUZHTEVOQlFWa3NTVUZCUXl4RFFVRkJMR3RDUVVGaUxFVkJRV2xETEVWQlFXcERPMGxCUTJoRExEUkRRVUZCTzBWQlJsazdPM2xDUVV0aUxFMUJRVUVzUjBGQlVTeFRRVUZGTEVsQlFVWTdWMEZEVUN4SlFVRkpMRU5CUVVNc1IwRkJSeXhEUVVGRExFZEJRVlFzUTBGQllUdE5RVUZCTEZsQlFVRXNSVUZCWXl4SlFVRkpMRU5CUVVNc1MwRkJUQ3hEUVVGWkxFbEJRVU1zUTBGQlFTeFRRVUZFTEVOQlFVRXNRMEZCUVN4SFFVRmxMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zVTBGQlZpeERRVUZCTEVOQlFUTkNMRU5CUVdRN1MwRkJZanRGUVVSUE96dDVRa0ZKVWl4VFFVRkJMRWRCUVZjc1UwRkJRVHRYUVVWV0xFTkJRVUVzUTBGQlJ5eHZRa0ZCU0N4RFFVRjVRaXhEUVVGRExFdEJRVEZDTEVOQlFVRTdSVUZHVlRzN2VVSkJUVmdzVVVGQlFTeEhRVUZWTEZOQlFVRTdWMEZCUnl4SlFVRkRMRU5CUVVFc2EwSkJRVVFzUTBGQlFUdEZRVUZJT3p0NVFrRkpWaXhKUVVGQkxFZEJRVTBzVTBGQlJTeEpRVUZHTzBGQlJVd3NVVUZCUVR0SlFVRkJMRXRCUVVFc1IwRkJVU3hKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFWWXNRMEZCYlVJc1QwRkJia0k3U1VGRFVpeEpRVUZCTEVkQlFVOHNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGV0xFTkJRVzFDTEUxQlFXNUNPMGxCUlZBc1NVRkJTU3hEUVVGRExFZEJRMHdzUTBGQlF5eFBRVVJFTEVOQlExVXNZVUZCUVN4SFFVTkpMRWxCUVVNc1EwRkJRU3hSUVVGUkxFTkJRVU1zU1VGRVpDeEhRVU50UWl4WlFVUnVRaXhIUVVNMlFpeEpRVVEzUWl4SFFVTnJReXh2UTBGRWJFTXNSMEZGVFN4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExFdEJSbWhDTEVkQlJYTkNMRmRCUm5SQ0xFZEJSU3RDTEV0QlJpOUNMRWRCUlhGRExITkRRVWd2UXl4RFFVMUJMRU5CUVVNc1YwRk9SQ3hEUVUxakxGbEJUbVE3U1VGUlFTeEpRVUZKTEVOQlFVTXNUVUZCVEN4SFFVRmpPMGxCUTJRc1RVRkJRU3hIUVVGVExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNTVUZCVkN4RFFVRmxMRXRCUVdZN1YwRkRWQ3hOUVVGTkxFTkJRVU1zV1VGQlVDeERRVUZ2UWl4RFFVRkJMRk5CUVVFc1MwRkJRVHRoUVVGQkxGTkJRVUU3VVVGRmJrSXNUVUZCVFN4RFFVRkRMRkZCUVZBc1EwRkJhVUlzWlVGQmFrSXNRMEZCYTBNc1EwRkJReXhYUVVGdVF5eERRVUZuUkN4blFrRkJhRVE3WlVGRFFTeEpRVUZKTEVOQlFVTXNSMEZEVEN4RFFVRkRMRWRCUkVRc1EwRkRUU3haUVVST0xFVkJRMjlDTEVWQlJIQkNMRU5CUlVFc1EwRkJReXhYUVVaRUxFTkJSV01zUzBGQlF5eERRVUZCTEZGQlFWRXNRMEZCUXl4SlFVWjRRaXhEUVVkQkxFTkJRVU1zU1VGSVJDeERRVWRQTEVkQlFVRXNSMEZCU1N4TFFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExGZEJTSEpDTEVOQlNVRXNRMEZCUXl4UFFVcEVMRU5CU1ZNc1IwRktWQ3hGUVVsakxGTkJRVUU3YVVKQlFVY3NRMEZCUVN4RFFVRkhMRWxCUVVnc1EwRkJVeXhEUVVGRExFMUJRVllzUTBGQlFUdFJRVUZJTEVOQlNtUTdUVUZJYlVJN1NVRkJRU3hEUVVGQkxFTkJRVUVzUTBGQlFTeEpRVUZCTEVOQlFYQkNPMFZCWmtzN08zbENRVFJDVGl4clFrRkJRU3hIUVVGdlFpeFRRVUZCTzBGQlEyNUNMRkZCUVVFN1FVRkJRVHRCUVVGQk8xTkJRVUVzYVVSQlFVRTdPMDFCUTBNc1NVRkJSeXhEUVVGSkxFbEJRVWtzUTBGQlF5eE5RVUZVTEVsQlFXOUNMRWxCUVVNc1EwRkJRU3hoUVVGRUxFTkJRV2RDTEVsQlFVa3NRMEZCUXl4RlFVRnlRaXhEUVVGMlFqdHhRa0ZEUXl4SlFVRkRMRU5CUVVFc1NVRkJSQ3hEUVVGUExFbEJRVkFzUjBGRVJEdFBRVUZCTEUxQlFVRTdOa0pCUVVFN08wRkJSRVE3TzBWQlJHMUNPenQ1UWtGUGNFSXNZVUZCUVN4SFFVRmxMRk5CUVVVc1JVRkJSanRCUVVOa0xGRkJRVUU3U1VGQlFTeEpRVUZ0UWl4blEwRkJia0k3UVVGQlFTeGhRVUZQTEV0QlFWQTdPMGxCUTBFc1NVRkJRU3hIUVVGUExFVkJRVVVzUTBGQlF5eHhRa0ZCU0N4RFFVRkJPMGxCUjFBc1YwRkJRU3hIUVVGak8wRkJRMlFzVjBGRlF5eEpRVUZKTEVOQlFVTXNSMEZCVEN4SFFVRlhMRWxCUVVrc1EwRkJReXhOUVVGb1FpeEpRVUV3UWl4RFFVRkRMRmRCUVROQ0xFbEJRME1zU1VGQlNTeERRVUZETEUxQlFVd3NSMEZCWXl4SlFVRkpMRU5CUVVNc1RVRkJia0lzU1VGQk5rSXNVVUZCVVN4RFFVRkRMRTFCUVZRc1IwRkJhMElzVjBGRWFFUXNTVUZKUXl4SlFVRkpMRU5CUVVNc1NVRkJUQ3hIUVVGWkxFbEJRVWtzUTBGQlF5eExRVUZxUWl4SlFVRXdRaXhEUVVGRExGZEJTalZDTEVsQlMwTXNTVUZCU1N4RFFVRkRMRXRCUVV3c1IwRkJZU3hKUVVGSkxFTkJRVU1zUzBGQmJFSXNTVUZCTWtJc1VVRkJVU3hEUVVGRExFdEJRVlFzUjBGQmFVSTdSVUZpYUVNN08zbENRV2xDWml4aFFVRkJMRWRCUVdVc1UwRkJRVHRKUVVOa0xFTkJRVUVzUTBGQlJ5eE5RVUZJTEVOQlFWY3NRMEZCUXl4RlFVRmFMRU5CUVdVc1VVRkJaaXhGUVVGNVFpeEpRVUZETEVOQlFVRXNORUpCUVRGQ08xZEJRMEVzT0VOQlFVRTdSVUZHWXpzN2VVSkJTV1lzWVVGQlFTeEhRVUZsTEZOQlFVRTdTVUZEWkN4RFFVRkJMRU5CUVVjc1RVRkJTQ3hEUVVGWExFTkJRVU1zUjBGQldpeERRVUZuUWl4UlFVRm9RaXhGUVVFd1FpeEpRVUZETEVOQlFVRXNORUpCUVROQ08xZEJRMEVzT0VOQlFVRTdSVUZHWXpzN2VVSkJTV1lzVDBGQlFTeEhRVUZUTEZOQlFVRTdRVUZEVWl4UlFVRkJPMEZCUVVFN1FVRkJRU3hUUVVGQkxHbEVRVUZCT3p0TlFVTkRMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zUjBGQlZDeERRVUZoTEZsQlFXSXNSVUZCTWtJc1JVRkJNMEk3UVVGRVJEdFhRVWRCTEhkRFFVRkJPMFZCU2xFN096czdSMEZxUm1sQ096dEJRWFZHTTBJc1RVRkJUU3hEUVVGRExFOUJRVkFzUjBGQmFVSWlmUT09XG4iLCJ2YXIgJCwgSG9va3MsIExhenlfTWFzb25yeSwgaW5pdF9sYXp5X2xvYWRlciwgaXNfbWFzb25yeSwgbGF6eV9pbnN0YW5jZTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbkxhenlfTWFzb25yeSA9IHJlcXVpcmUoJy4vTGF6eV9NYXNvbnJ5Jyk7XG5cbmxhenlfaW5zdGFuY2UgPSBmYWxzZTtcblxuaXNfbWFzb25yeSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gJCgnLlBQX01hc29ucnknKS5sZW5ndGggPiAwO1xufTtcblxuaW5pdF9sYXp5X2xvYWRlciA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIWlzX21hc29ucnkoKSkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAobGF6eV9pbnN0YW5jZSkge1xuICAgIGxhenlfaW5zdGFuY2UuZGVzdHJveSgpO1xuICB9XG4gIHJldHVybiBsYXp5X2luc3RhbmNlID0gbmV3IChIb29rcy5hcHBseUZpbHRlcnMoJ3BwLmxhenkuaGFuZGxlcicsIExhenlfTWFzb25yeSkpO1xufTtcblxuSG9va3MuYWRkQWN0aW9uKCdwcC5wb3J0Zm9saW8ucHJlcGFyZScsIGluaXRfbGF6eV9sb2FkZXIsIDEwMCk7XG5cbkhvb2tzLmFkZEFjdGlvbigncHAucG9ydGZvbGlvLmRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgbGF6eV9pbnN0YW5jZS5kZXN0cm95KCk7XG4gIHJldHVybiBsYXp5X2luc3RhbmNlID0gbnVsbDtcbn0pO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3BwLnBvcnRmb2xpby5yZWZyZXNoJywgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBIb29rcy5kb0FjdGlvbigncHAubGF6eS5hdXRvbG9hZCcpO1xufSk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWMzUmhjblF1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SnpkR0Z5ZEM1amIyWm1aV1VpWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFc1NVRkJRVHM3UVVGQlFTeERRVUZCTEVkQlFVa3NUMEZCUVN4RFFVRlRMRkZCUVZRN08wRkJRMG9zUzBGQlFTeEhRVUZSTEU5QlFVRXNRMEZCVXl4VlFVRlVPenRCUVVOU0xGbEJRVUVzUjBGQlpTeFBRVUZCTEVOQlFWTXNaMEpCUVZRN08wRkJSMllzWVVGQlFTeEhRVUZuUWpzN1FVRkZhRUlzVlVGQlFTeEhRVUZoTEZOQlFVRTdVMEZCUnl4RFFVRkJMRU5CUVVjc1lVRkJTQ3hEUVVGclFpeERRVUZETEUxQlFXNUNMRWRCUVRSQ08wRkJRUzlDT3p0QlFVVmlMR2RDUVVGQkxFZEJRVzFDTEZOQlFVRTdSVUZEYkVJc1NVRkJWU3hEUVVGSkxGVkJRVUVzUTBGQlFTeERRVUZrTzBGQlFVRXNWMEZCUVRzN1JVRkZRU3hKUVVGSExHRkJRVWc3U1VGRFF5eGhRVUZoTEVOQlFVTXNUMEZCWkN4RFFVRkJMRVZCUkVRN08xTkJTMEVzWVVGQlFTeEhRVUZuUWl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExGbEJRVTRzUTBGQmJVSXNhVUpCUVc1Q0xFVkJRWE5ETEZsQlFYUkRMRU5CUVVRN1FVRlNSanM3UVVGWmJrSXNTMEZCU3l4RFFVRkRMRk5CUVU0c1EwRkJaMElzYzBKQlFXaENMRVZCUVhkRExHZENRVUY0UXl4RlFVRXdSQ3hIUVVFeFJEczdRVUZEUVN4TFFVRkxMRU5CUVVNc1UwRkJUaXhEUVVGblFpeHpRa0ZCYUVJc1JVRkJkME1zVTBGQlFUdEZRVU4yUXl4aFFVRmhMRU5CUVVNc1QwRkJaQ3hEUVVGQk8xTkJRMEVzWVVGQlFTeEhRVUZuUWp0QlFVWjFRaXhEUVVGNFF6czdRVUZOUVN4TFFVRkxMRU5CUVVNc1UwRkJUaXhEUVVGblFpeHpRa0ZCYUVJc1JVRkJkME1zVTBGQlFUdFRRVU4yUXl4TFFVRkxMRU5CUVVNc1VVRkJUaXhEUVVGbExHdENRVUZtTzBGQlJIVkRMRU5CUVhoREluMD1cbiIsInZhciBIb29rcywgUG9ydGZvbGlvX0V2ZW50X01hbmFnZXI7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cblxuLypcblxuICAgICAqIEluaXRpYWxpemUgUG9ydGZvbGlvIENvcmVcblx0LS0tXG5cdFx0VXNpbmcgcDUwIEAgYHBwLmNvcmUucmVhZHlgXG5cdFx0TGF0ZSBwcmlvcml0eSBpcyBnb2luZyB0byBmb3JjZSBleHBsaWNpdCBwcmlvcml0eSBpbiBhbnkgb3RoZXIgbW92aW5nIHBhcnRzIHRoYXQgYXJlIGdvaW5nIHRvIHRvdWNoIHBvcnRmb2xpbyBsYXlvdXQgYXQgYHBwLmxvYWRlZGBcblx0LS0tXG4gKi9cblxuUG9ydGZvbGlvX0V2ZW50X01hbmFnZXIgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyKCkge31cblxuICBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlci5wcm90b3R5cGUucHJlcGFyZSA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5wb3J0Zm9saW8ucHJlcGFyZScpO1xuICB9O1xuXG4gIFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBIb29rcy5kb0FjdGlvbigncHAucG9ydGZvbGlvLmNyZWF0ZScpO1xuICB9O1xuXG4gIFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyLnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MuZG9BY3Rpb24oJ3BwLnBvcnRmb2xpby5yZWZyZXNoJyk7XG4gIH07XG5cbiAgUG9ydGZvbGlvX0V2ZW50X01hbmFnZXIucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICBIb29rcy5kb0FjdGlvbigncHAucG9ydGZvbGlvLmRlc3Ryb3knKTtcbiAgICBIb29rcy5yZW1vdmVBY3Rpb24oJ3BwLmxvYWRlZCcsIHRoaXMuY3JlYXRlLCA1MCk7XG4gIH07XG5cbiAgcmV0dXJuIFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lVRzl5ZEdadmJHbHZYMFYyWlc1MFgwMWhibUZuWlhJdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUpRYjNKMFptOXNhVzlmUlhabGJuUmZUV0Z1WVdkbGNpNWpiMlptWldVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWtGQlFVRXNTVUZCUVRzN1FVRkJRU3hMUVVGQkxFZEJRVkVzVDBGQlFTeERRVUZUTEZWQlFWUTdPenRCUVVWU096czdPenM3T3pzN1FVRlRUVHM3TzI5RFFVVk1MRTlCUVVFc1IwRkJVeXhUUVVGQk8wbEJRMUlzUzBGQlN5eERRVUZETEZGQlFVNHNRMEZCWlN4elFrRkJaanRGUVVSUk96dHZRMEZKVkN4TlFVRkJMRWRCUVZFc1UwRkJRVHRKUVVOUUxFdEJRVXNzUTBGQlF5eFJRVUZPTEVOQlFXVXNjVUpCUVdZN1JVRkVUenM3YjBOQlMxSXNUMEZCUVN4SFFVRlRMRk5CUVVFN1NVRkRVaXhMUVVGTExFTkJRVU1zVVVGQlRpeERRVUZsTEhOQ1FVRm1PMFZCUkZFN08yOURRVXRVTEU5QlFVRXNSMEZCVXl4VFFVRkJPMGxCUlZJc1MwRkJTeXhEUVVGRExGRkJRVTRzUTBGQlpTeHpRa0ZCWmp0SlFVTkJMRXRCUVVzc1EwRkJReXhaUVVGT0xFTkJRVzFDTEZkQlFXNUNMRVZCUVdkRExFbEJRVU1zUTBGQlFTeE5RVUZxUXl4RlFVRjVReXhGUVVGNlF6dEZRVWhST3pzN096czdRVUZQVml4TlFVRk5MRU5CUVVNc1QwRkJVQ3hIUVVGcFFpSjlcbiIsInZhciBIb29rcywgUG9ydGZvbGlvX0ludGVyZmFjZTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuXG4vKlxuXHRBYnN0cmFjdCBDbGFzcyBQb3J0b2ZsaW9fRXZlbnRfSW1lcGxlbWVudGF0aW9uXG5cbiAgICBIYW5kbGVzIGFsbCB0aGUgZXZlbnRzIHJlcXVpcmVkIHRvIGZ1bGx5IGhhbmRsZSBhIHBvcnRmb2xpbyBsYXlvdXQgcHJvY2Vzc1xuICovXG5cblBvcnRmb2xpb19JbnRlcmZhY2UgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIFBvcnRmb2xpb19JbnRlcmZhY2UoYXJncykge1xuICAgIHRoaXMuc2V0dXBfYWN0aW9ucygpO1xuICAgIHRoaXMuaW5pdGlhbGl6ZShhcmdzKTtcbiAgfVxuXG4gIFBvcnRmb2xpb19JbnRlcmZhY2UucHJvdG90eXBlLnNldHVwX2FjdGlvbnMgPSBmdW5jdGlvbigpIHtcbiAgICBIb29rcy5hZGRBY3Rpb24oJ3BwLnBvcnRmb2xpby5wcmVwYXJlJywgdGhpcy5wcmVwYXJlLCA1MCk7XG4gICAgSG9va3MuYWRkQWN0aW9uKCdwcC5wb3J0Zm9saW8uY3JlYXRlJywgdGhpcy5jcmVhdGUsIDUwKTtcbiAgICBIb29rcy5hZGRBY3Rpb24oJ3BwLnBvcnRmb2xpby5yZWZyZXNoJywgdGhpcy5yZWZyZXNoLCA1MCk7XG4gICAgSG9va3MuYWRkQWN0aW9uKCdwcC5wb3J0Zm9saW8uZGVzdHJveScsIHRoaXMuZGVzdHJveSwgNTApO1xuICAgIHJldHVybiBIb29rcy5hZGRBY3Rpb24oJ3BwLnBvcnRmb2xpby5kZXN0cm95JywgdGhpcy5wdXJnZV9hY3Rpb25zLCAxMDApO1xuICB9O1xuXG4gIFBvcnRmb2xpb19JbnRlcmZhY2UucHJvdG90eXBlLnB1cmdlX2FjdGlvbnMgPSBmdW5jdGlvbigpIHtcbiAgICBIb29rcy5yZW1vdmVBY3Rpb24oJ3BwLnBvcnRmb2xpby5wcmVwYXJlJywgdGhpcy5wcmVwYXJlLCA1MCk7XG4gICAgSG9va3MucmVtb3ZlQWN0aW9uKCdwcC5wb3J0Zm9saW8uY3JlYXRlJywgdGhpcy5jcmVhdGUsIDUwKTtcbiAgICBIb29rcy5yZW1vdmVBY3Rpb24oJ3BwLnBvcnRmb2xpby5yZWZyZXNoJywgdGhpcy5yZWZyZXNoLCA1MCk7XG4gICAgSG9va3MucmVtb3ZlQWN0aW9uKCdwcC5wb3J0Zm9saW8uZGVzdHJveScsIHRoaXMuZGVzdHJveSwgNTApO1xuICAgIHJldHVybiBIb29rcy5yZW1vdmVBY3Rpb24oJ3BwLnBvcnRmb2xpby5kZXN0cm95JywgdGhpcy5wdXJnZV9hY3Rpb25zLCAxMDApO1xuICB9O1xuXG5cbiAgLypcbiAgICAgXHRSZXF1aXJlIHRoZXNlIG1ldGhvZHNcbiAgICovXG5cbiAgUG9ydGZvbGlvX0ludGVyZmFjZS5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgaW5pdGlhbGl6ZWAgbWV0aG9kXCIpO1xuICB9O1xuXG4gIFBvcnRmb2xpb19JbnRlcmZhY2UucHJvdG90eXBlLnByZXBhcmUgPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYHByZXBhcmVgIG1ldGhvZFwiKTtcbiAgfTtcblxuICBQb3J0Zm9saW9fSW50ZXJmYWNlLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYGNyZWF0ZWAgbWV0aG9kXCIpO1xuICB9O1xuXG4gIFBvcnRmb2xpb19JbnRlcmZhY2UucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYHJlZnJlc2hgIG1ldGhvZFwiKTtcbiAgfTtcblxuICBQb3J0Zm9saW9fSW50ZXJmYWNlLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGBkZXN0cm95YCBtZXRob2RcIik7XG4gIH07XG5cbiAgcmV0dXJuIFBvcnRmb2xpb19JbnRlcmZhY2U7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gUG9ydGZvbGlvX0ludGVyZmFjZTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVUc5eWRHWnZiR2x2WDBsdWRHVnlabUZqWlM1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJbEJ2Y25SbWIyeHBiMTlKYm5SbGNtWmhZMlV1WTI5bVptVmxJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSkJRVUZCTEVsQlFVRTdPMEZCUVVFc1MwRkJRU3hIUVVGUkxFOUJRVUVzUTBGQlV5eFZRVUZVT3pzN1FVRkhVanM3T3pzN08wRkJTMDA3UlVGRlVTdzJRa0ZCUlN4SlFVRkdPMGxCUTFvc1NVRkJReXhEUVVGQkxHRkJRVVFzUTBGQlFUdEpRVU5CTEVsQlFVTXNRMEZCUVN4VlFVRkVMRU5CUVdFc1NVRkJZanRGUVVaWk96dG5RMEZKWWl4aFFVRkJMRWRCUVdVc1UwRkJRVHRKUVVOa0xFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMSE5DUVVGb1FpeEZRVUYzUXl4SlFVRkRMRU5CUVVFc1QwRkJla01zUlVGQmEwUXNSVUZCYkVRN1NVRkRRU3hMUVVGTExFTkJRVU1zVTBGQlRpeERRVUZuUWl4eFFrRkJhRUlzUlVGQmRVTXNTVUZCUXl4RFFVRkJMRTFCUVhoRExFVkJRV2RFTEVWQlFXaEVPMGxCUTBFc1MwRkJTeXhEUVVGRExGTkJRVTRzUTBGQlowSXNjMEpCUVdoQ0xFVkJRWGRETEVsQlFVTXNRMEZCUVN4UFFVRjZReXhGUVVGclJDeEZRVUZzUkR0SlFVTkJMRXRCUVVzc1EwRkJReXhUUVVGT0xFTkJRV2RDTEhOQ1FVRm9RaXhGUVVGM1F5eEpRVUZETEVOQlFVRXNUMEZCZWtNc1JVRkJhMFFzUlVGQmJFUTdWMEZEUVN4TFFVRkxMRU5CUVVNc1UwRkJUaXhEUVVGblFpeHpRa0ZCYUVJc1JVRkJkME1zU1VGQlF5eERRVUZCTEdGQlFYcERMRVZCUVhkRUxFZEJRWGhFTzBWQlRHTTdPMmREUVU5bUxHRkJRVUVzUjBGQlpTeFRRVUZCTzBsQlEyUXNTMEZCU3l4RFFVRkRMRmxCUVU0c1EwRkJiVUlzYzBKQlFXNUNMRVZCUVRKRExFbEJRVU1zUTBGQlFTeFBRVUUxUXl4RlFVRnhSQ3hGUVVGeVJEdEpRVU5CTEV0QlFVc3NRMEZCUXl4WlFVRk9MRU5CUVcxQ0xIRkNRVUZ1UWl4RlFVRXdReXhKUVVGRExFTkJRVUVzVFVGQk0wTXNSVUZCYlVRc1JVRkJia1E3U1VGRFFTeExRVUZMTEVOQlFVTXNXVUZCVGl4RFFVRnRRaXh6UWtGQmJrSXNSVUZCTWtNc1NVRkJReXhEUVVGQkxFOUJRVFZETEVWQlFYRkVMRVZCUVhKRU8wbEJRMEVzUzBGQlN5eERRVUZETEZsQlFVNHNRMEZCYlVJc2MwSkJRVzVDTEVWQlFUSkRMRWxCUVVNc1EwRkJRU3hQUVVFMVF5eEZRVUZ4UkN4RlFVRnlSRHRYUVVOQkxFdEJRVXNzUTBGQlF5eFpRVUZPTEVOQlFXMUNMSE5DUVVGdVFpeEZRVUV5UXl4SlFVRkRMRU5CUVVFc1lVRkJOVU1zUlVGQk1rUXNSMEZCTTBRN1JVRk1ZenM3TzBGQlVXWTdPenM3WjBOQlIwRXNWVUZCUVN4SFFVRlpMRk5CUVVFN1FVRkJSeXhWUVVGVkxFbEJRVUVzUzBGQlFTeERRVUZQTEhGR1FVRlFPMFZCUVdJN08yZERRVU5hTEU5QlFVRXNSMEZCV1N4VFFVRkJPMEZCUVVjc1ZVRkJWU3hKUVVGQkxFdEJRVUVzUTBGQlR5eHJSa0ZCVUR0RlFVRmlPenRuUTBGRFdpeE5RVUZCTEVkQlFWa3NVMEZCUVR0QlFVRkhMRlZCUVZVc1NVRkJRU3hMUVVGQkxFTkJRVThzYVVaQlFWQTdSVUZCWWpzN1owTkJRMW9zVDBGQlFTeEhRVUZaTEZOQlFVRTdRVUZCUnl4VlFVRlZMRWxCUVVFc1MwRkJRU3hEUVVGUExHdEdRVUZRTzBWQlFXSTdPMmREUVVOYUxFOUJRVUVzUjBGQldTeFRRVUZCTzBGQlFVY3NWVUZCVlN4SlFVRkJMRXRCUVVFc1EwRkJUeXhyUmtGQlVEdEZRVUZpT3pzN096czdRVUZKWWl4TlFVRk5MRU5CUVVNc1QwRkJVQ3hIUVVGcFFpSjlcbiIsIlxuLypcbiAgICBEZXBlbmRlbmNpZXNcbiAqL1xudmFyICQsIEhvb2tzLCBQb3J0Zm9saW9fSW50ZXJmYWNlLCBQb3J0Zm9saW9fTWFzb25yeSxcbiAgYmluZCA9IGZ1bmN0aW9uKGZuLCBtZSl7IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7IH07IH0sXG4gIGV4dGVuZCA9IGZ1bmN0aW9uKGNoaWxkLCBwYXJlbnQpIHsgZm9yICh2YXIga2V5IGluIHBhcmVudCkgeyBpZiAoaGFzUHJvcC5jYWxsKHBhcmVudCwga2V5KSkgY2hpbGRba2V5XSA9IHBhcmVudFtrZXldOyB9IGZ1bmN0aW9uIGN0b3IoKSB7IHRoaXMuY29uc3RydWN0b3IgPSBjaGlsZDsgfSBjdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7IGNoaWxkLnByb3RvdHlwZSA9IG5ldyBjdG9yKCk7IGNoaWxkLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7IHJldHVybiBjaGlsZDsgfSxcbiAgaGFzUHJvcCA9IHt9Lmhhc093blByb3BlcnR5O1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuUG9ydGZvbGlvX0ludGVyZmFjZSA9IHJlcXVpcmUoJy4vUG9ydGZvbGlvX0ludGVyZmFjZScpO1xuXG5Qb3J0Zm9saW9fTWFzb25yeSA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gIGV4dGVuZChQb3J0Zm9saW9fTWFzb25yeSwgc3VwZXJDbGFzcyk7XG5cbiAgZnVuY3Rpb24gUG9ydGZvbGlvX01hc29ucnkoKSB7XG4gICAgdGhpcy5yZWZyZXNoID0gYmluZCh0aGlzLnJlZnJlc2gsIHRoaXMpO1xuICAgIHRoaXMuZGVzdHJveSA9IGJpbmQodGhpcy5kZXN0cm95LCB0aGlzKTtcbiAgICB0aGlzLmNyZWF0ZSA9IGJpbmQodGhpcy5jcmVhdGUsIHRoaXMpO1xuICAgIHRoaXMucHJlcGFyZSA9IGJpbmQodGhpcy5wcmVwYXJlLCB0aGlzKTtcbiAgICByZXR1cm4gUG9ydGZvbGlvX01hc29ucnkuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUuRWxlbWVudHMgPSB7XG4gICAgY29udGFpbmVyOiAnUFBfTWFzb25yeScsXG4gICAgc2l6ZXI6ICdQUF9NYXNvbnJ5X19zaXplcicsXG4gICAgaXRlbTogJ1BQX01hc29ucnlfX2l0ZW0nXG4gIH07XG5cblxuICAvKlxuICBcdFx0SW5pdGlhbGl6ZVxuICAgKi9cblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLiRjb250YWluZXIgPSAkKFwiLlwiICsgdGhpcy5FbGVtZW50cy5jb250YWluZXIpO1xuICB9O1xuXG5cbiAgLypcbiAgXHRcdFByZXBhcmUgJiBBdHRhY2ggRXZlbnRzXG4gICAgIFx0RG9uJ3Qgc2hvdyBhbnl0aGluZyB5ZXQuXG4gIFxuICBcdFx0QGNhbGxlZCBvbiBob29rIGBwcC5wb3J0Zm9saW8ucHJlcGFyZWBcbiAgICovXG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLnByZXBhcmUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbWFzb25yeV9zZXR0aW5ncztcbiAgICBpZiAodGhpcy4kY29udGFpbmVyLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLiRjb250YWluZXIuYWRkQ2xhc3MoJ1BQX0pTX19sb2FkaW5nX21hc29ucnknKTtcbiAgICB0aGlzLm1heWJlX2NyZWF0ZV9zaXplcigpO1xuICAgIG1hc29ucnlfc2V0dGluZ3MgPSBIb29rcy5hcHBseUZpbHRlcnMoJ3BwLm1hc29ucnkuc2V0dGluZ3MnLCB7XG4gICAgICBpdGVtU2VsZWN0b3I6IFwiLlwiICsgdGhpcy5FbGVtZW50cy5pdGVtLFxuICAgICAgY29sdW1uV2lkdGg6IFwiLlwiICsgdGhpcy5FbGVtZW50cy5zaXplcixcbiAgICAgIGd1dHRlcjogMCxcbiAgICAgIGluaXRMYXlvdXQ6IGZhbHNlXG4gICAgfSk7XG4gICAgdGhpcy4kY29udGFpbmVyLm1hc29ucnkobWFzb25yeV9zZXR0aW5ncyk7XG4gICAgcmV0dXJuIHRoaXMuJGNvbnRhaW5lci5tYXNvbnJ5KCdvbmNlJywgJ2xheW91dENvbXBsZXRlJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIF90aGlzLiRjb250YWluZXIucmVtb3ZlQ2xhc3MoJ1BQX0pTX19sb2FkaW5nX21hc29ucnknKS5hZGRDbGFzcygnUFBfSlNfX2xvYWRpbmdfY29tcGxldGUnKTtcbiAgICAgICAgcmV0dXJuIEhvb2tzLmRvQWN0aW9uKCdwcC5wb3J0Zm9saW8ucmVmcmVzaCcpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH07XG5cblxuICAvKlxuICBcdFx0U3RhcnQgdGhlIFBvcnRmb2xpb1xuICBcdFx0QGNhbGxlZCBvbiBob29rIGBwcC5wb3J0Zm9saW8uY3JlYXRlYFxuICAgKi9cblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kY29udGFpbmVyLm1hc29ucnkoKTtcbiAgfTtcblxuXG4gIC8qXG4gIFx0XHREZXN0cm95XG4gIFx0XHRAY2FsbGVkIG9uIGhvb2sgYHBwLnBvcnRmb2xpby5kZXN0cm95YFxuICAgKi9cblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMubWF5YmVfcmVtb3ZlX3NpemVyKCk7XG4gICAgaWYgKHRoaXMuJGNvbnRhaW5lci5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLiRjb250YWluZXIubWFzb25yeSgnZGVzdHJveScpO1xuICAgIH1cbiAgfTtcblxuXG4gIC8qXG4gIFx0XHRSZWxvYWQgdGhlIGxheW91dFxuICBcdFx0QGNhbGxlZCBvbiBob29rIGBwcC5wb3J0Zm9saW8ucmVmcmVzaGBcbiAgICovXG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy4kY29udGFpbmVyLm1hc29ucnkoJ2xheW91dCcpO1xuICB9O1xuXG5cbiAgLypcbiAgXHRcdENyZWF0ZSBhIHNpemVyIGVsZW1lbnQgZm9yIGpxdWVyeS1tYXNvbnJ5IHRvIHVzZVxuICAgKi9cblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUubWF5YmVfY3JlYXRlX3NpemVyID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuc2l6ZXJfZG9lc250X2V4aXN0KCkpIHtcbiAgICAgIHRoaXMuY3JlYXRlX3NpemVyKCk7XG4gICAgfVxuICB9O1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5tYXliZV9yZW1vdmVfc2l6ZXIgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy4kY29udGFpbmVyLmxlbmd0aCAhPT0gMSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLiRjb250YWluZXIuZmluZChcIi5cIiArIHRoaXMuRWxlbWVudHMuc2l6ZXIpLnJlbW92ZSgpO1xuICB9O1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5zaXplcl9kb2VzbnRfZXhpc3QgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy4kY29udGFpbmVyLmZpbmQoXCIuXCIgKyB0aGlzLkVsZW1lbnRzLnNpemVyKS5sZW5ndGggPT09IDA7XG4gIH07XG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLmNyZWF0ZV9zaXplciA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJGNvbnRhaW5lci5hcHBlbmQoXCI8ZGl2IGNsYXNzPVxcXCJcIiArIHRoaXMuRWxlbWVudHMuc2l6ZXIgKyBcIlxcXCI+PC9kaXY+XCIpO1xuICB9O1xuXG4gIHJldHVybiBQb3J0Zm9saW9fTWFzb25yeTtcblxufSkoUG9ydGZvbGlvX0ludGVyZmFjZSk7XG5cbndpbmRvdy5QUF9Nb2R1bGVzLlBvcnRmb2xpb19NYXNvbnJ5ID0gUG9ydGZvbGlvX01hc29ucnk7XG5cbm1vZHVsZS5leHBvcnRzID0gUG9ydGZvbGlvX01hc29ucnk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVVHOXlkR1p2YkdsdlgwMWhjMjl1Y25rdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUpRYjNKMFptOXNhVzlmVFdGemIyNXllUzVqYjJabVpXVWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqdEJRVUZCT3pzN1FVRkJRU3hKUVVGQkxHZEVRVUZCTzBWQlFVRTdPenM3UVVGSFFTeERRVUZCTEVkQlFVa3NUMEZCUVN4RFFVRlRMRkZCUVZRN08wRkJRMG9zUzBGQlFTeEhRVUZSTEU5QlFVRXNRMEZCVXl4VlFVRlVPenRCUVVOU0xHMUNRVUZCTEVkQlFYTkNMRTlCUVVFc1EwRkJVeXgxUWtGQlZEczdRVUZIYUVJN096czdPenM3T3pzN096aENRVVZNTEZGQlFVRXNSMEZEUXp0SlFVRkJMRk5CUVVFc1JVRkJWeXhaUVVGWU8wbEJRMEVzUzBGQlFTeEZRVUZYTEcxQ1FVUllPMGxCUlVFc1NVRkJRU3hGUVVGWExHdENRVVpZT3pzN08wRkJTVVE3T3pzN09FSkJSMEVzVlVGQlFTeEhRVUZaTEZOQlFVRTdWMEZEV0N4SlFVRkRMRU5CUVVFc1ZVRkJSQ3hIUVVGakxFTkJRVUVzUTBGQlJ5eEhRVUZCTEVkQlFVa3NTVUZCUXl4RFFVRkJMRkZCUVZFc1EwRkJReXhUUVVGcVFqdEZRVVJJT3pzN1FVRkhXanM3T3pzN096czRRa0ZOUVN4UFFVRkJMRWRCUVZNc1UwRkJRVHRCUVVOU0xGRkJRVUU3U1VGQlFTeEpRVUZWTEVsQlFVTXNRMEZCUVN4VlFVRlZMRU5CUVVNc1RVRkJXaXhMUVVGelFpeERRVUZvUXp0QlFVRkJMR0ZCUVVFN08wbEJSVUVzU1VGQlF5eERRVUZCTEZWQlFWVXNRMEZCUXl4UlFVRmFMRU5CUVhOQ0xIZENRVUYwUWp0SlFVVkJMRWxCUVVNc1EwRkJRU3hyUWtGQlJDeERRVUZCTzBsQlIwRXNaMEpCUVVFc1IwRkJiVUlzUzBGQlN5eERRVUZETEZsQlFVNHNRMEZCYlVJc2NVSkJRVzVDTEVWQlEyeENPMDFCUVVFc1dVRkJRU3hGUVVGakxFZEJRVUVzUjBGQlNTeEpRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRWxCUVRWQ08wMUJRMEVzVjBGQlFTeEZRVUZqTEVkQlFVRXNSMEZCU1N4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExFdEJSRFZDTzAxQlJVRXNUVUZCUVN4RlFVRmpMRU5CUm1RN1RVRkhRU3hWUVVGQkxFVkJRV01zUzBGSVpEdExRVVJyUWp0SlFVMXVRaXhKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEU5QlFWb3NRMEZCY1VJc1owSkJRWEpDTzFkQlJVRXNTVUZCUXl4RFFVRkJMRlZCUVZVc1EwRkJReXhQUVVGYUxFTkJRVzlDTEUxQlFYQkNMRVZCUVRSQ0xHZENRVUUxUWl4RlFVRTRReXhEUVVGQkxGTkJRVUVzUzBGQlFUdGhRVUZCTEZOQlFVRTdVVUZETjBNc1MwRkJReXhEUVVGQkxGVkJRMEVzUTBGQlF5eFhRVVJHTEVOQlEyVXNkMEpCUkdZc1EwRkZReXhEUVVGRExGRkJSa1lzUTBGRldTeDVRa0ZHV2p0bFFVMUJMRXRCUVVzc1EwRkJReXhSUVVGT0xFTkJRV1VzYzBKQlFXWTdUVUZRTmtNN1NVRkJRU3hEUVVGQkxFTkJRVUVzUTBGQlFTeEpRVUZCTEVOQlFUbERPMFZCYUVKUk96czdRVUV3UWxRN096czdPemhDUVVsQkxFMUJRVUVzUjBGQlVTeFRRVUZCTzBsQlExQXNTVUZCUXl4RFFVRkJMRlZCUVZVc1EwRkJReXhQUVVGYUxFTkJRVUU3UlVGRVR6czdPMEZCUzFJN096czdPemhDUVVsQkxFOUJRVUVzUjBGQlV5eFRRVUZCTzBsQlExSXNTVUZCUXl4RFFVRkJMR3RDUVVGRUxFTkJRVUU3U1VGRlFTeEpRVUZITEVsQlFVTXNRMEZCUVN4VlFVRlZMRU5CUVVNc1RVRkJXaXhIUVVGeFFpeERRVUY0UWp0TlFVTkRMRWxCUVVNc1EwRkJRU3hWUVVGVkxFTkJRVU1zVDBGQldpeERRVUZ4UWl4VFFVRnlRaXhGUVVSRU96dEZRVWhST3pzN1FVRlZWRHM3T3pzN09FSkJTVUVzVDBGQlFTeEhRVUZUTEZOQlFVRTdWMEZEVWl4SlFVRkRMRU5CUVVFc1ZVRkJWU3hEUVVGRExFOUJRVm9zUTBGQmNVSXNVVUZCY2tJN1JVRkVVVHM3TzBGQlMxUTdPenM3T0VKQlIwRXNhMEpCUVVFc1IwRkJiMElzVTBGQlFUdEpRVU51UWl4SlFVRnRRaXhKUVVGRExFTkJRVUVzYTBKQlFVUXNRMEZCUVN4RFFVRnVRanROUVVGQkxFbEJRVU1zUTBGQlFTeFpRVUZFTEVOQlFVRXNSVUZCUVRzN1JVRkViVUk3T3poQ1FVbHdRaXhyUWtGQlFTeEhRVUZ2UWl4VFFVRkJPMGxCUTI1Q0xFbEJRVlVzU1VGQlF5eERRVUZCTEZWQlFWVXNRMEZCUXl4TlFVRmFMRXRCUVhkQ0xFTkJRV3hETzBGQlFVRXNZVUZCUVRzN1NVRkRRU3hKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEVsQlFWb3NRMEZCYTBJc1IwRkJRU3hIUVVGSkxFbEJRVU1zUTBGQlFTeFJRVUZSTEVOQlFVTXNTMEZCYUVNc1EwRkJlVU1zUTBGQlF5eE5RVUV4UXl4RFFVRkJPMFZCUm0xQ096czRRa0ZMY0VJc2EwSkJRVUVzUjBGQmIwSXNVMEZCUVR0WFFVRkhMRWxCUVVNc1EwRkJRU3hWUVVGVkxFTkJRVU1zU1VGQldpeERRVUZyUWl4SFFVRkJMRWRCUVVrc1NVRkJReXhEUVVGQkxGRkJRVkVzUTBGQlF5eExRVUZvUXl4RFFVRjVReXhEUVVGRExFMUJRVEZETEV0QlFXOUVPMFZCUVhaRU96czRRa0ZIY0VJc1dVRkJRU3hIUVVGakxGTkJRVUU3U1VGRFlpeEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRTFCUVZvc1EwRkJiVUlzWlVGQlFTeEhRVUZwUWl4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExFdEJRVE5DTEVkQlFXbERMRmRCUVhCRU8wVkJSR0U3T3pzN1IwRTFSbWxDT3p0QlFXbEhhRU1zVFVGQlRTeERRVUZETEZWQlFWVXNRMEZCUXl4cFFrRkJiRUlzUjBGQmMwTTdPMEZCUTNSRExFMUJRVTBzUTBGQlF5eFBRVUZRTEVkQlFXbENJbjA9XG4iLCJcbi8qXG4gICAgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBIb29rcywgUG9ydGZvbGlvLCBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlcjtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuUG9ydGZvbGlvX0V2ZW50X01hbmFnZXIgPSByZXF1aXJlKCcuL1BvcnRmb2xpb19FdmVudF9NYW5hZ2VyJyk7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Qb3J0Zm9saW8gPSBuZXcgUG9ydGZvbGlvX0V2ZW50X01hbmFnZXIoKTtcblxuSG9va3MuYWRkQWN0aW9uKCdwcC5jb3JlLnJlYWR5JywgUG9ydGZvbGlvLnByZXBhcmUsIDUwKTtcblxuSG9va3MuYWRkQWN0aW9uKCdwcC5jb3JlLmxvYWRlZCcsIFBvcnRmb2xpby5jcmVhdGUsIDUwKTtcblxuSG9va3MuYWRkQWN0aW9uKCdwcC5jb3JlLnJlYWR5JywgZnVuY3Rpb24oKSB7XG4gIHZhciBQb3J0Zm9saW9fTWFzb25yeTtcbiAgaWYgKCQoJy5QUF9NYXNvbnJ5JykubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIFBvcnRmb2xpb19NYXNvbnJ5ID0gcmVxdWlyZSgnLi9Qb3J0Zm9saW9fTWFzb25yeScpO1xuICByZXR1cm4gbmV3IFBvcnRmb2xpb19NYXNvbnJ5KCk7XG59KTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYzNSaGNuUXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lKemRHRnlkQzVqYjJabVpXVWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqdEJRVUZCT3pzN1FVRkJRU3hKUVVGQk96dEJRVWRCTEV0QlFVRXNSMEZCVVN4UFFVRkJMRU5CUVZNc1ZVRkJWRHM3UVVGRFVpeDFRa0ZCUVN4SFFVRXdRaXhQUVVGQkxFTkJRVk1zTWtKQlFWUTdPMEZCUXpGQ0xFTkJRVUVzUjBGQlNTeFBRVUZCTEVOQlFWRXNVVUZCVWpzN1FVRkhTaXhUUVVGQkxFZEJRV2RDTEVsQlFVRXNkVUpCUVVFc1EwRkJRVHM3UVVGSGFFSXNTMEZCU3l4RFFVRkRMRk5CUVU0c1EwRkJaMElzWlVGQmFFSXNSVUZCYVVNc1UwRkJVeXhEUVVGRExFOUJRVE5ETEVWQlFXOUVMRVZCUVhCRU96dEJRVU5CTEV0QlFVc3NRMEZCUXl4VFFVRk9MRU5CUVdkQ0xHZENRVUZvUWl4RlFVRnJReXhUUVVGVExFTkJRVU1zVFVGQk5VTXNSVUZCYjBRc1JVRkJjRVE3TzBGQlNVRXNTMEZCU3l4RFFVRkRMRk5CUVU0c1EwRkJaMElzWlVGQmFFSXNSVUZCYVVNc1UwRkJRVHRCUVVWb1F5eE5RVUZCTzBWQlFVRXNTVUZCWjBJc1EwRkJRU3hEUVVGSExHRkJRVWdzUTBGQmEwSXNRMEZCUXl4TlFVRnVRaXhMUVVFMlFpeERRVUUzUXp0QlFVRkJMRmRCUVU4c1RVRkJVRHM3UlVGRlFTeHBRa0ZCUVN4SFFVRnZRaXhQUVVGQkxFTkJRVk1zY1VKQlFWUTdVMEZEYUVJc1NVRkJRU3hwUWtGQlFTeERRVUZCTzBGQlREUkNMRU5CUVdwREluMD1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
