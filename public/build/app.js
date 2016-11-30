(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){

/*
    Load Dependencies
 */
var $, Hooks;

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

window.PP_Modules = {};


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

},{"./core/Photography_Portfolio":2,"./gallery/popup":4,"./lazy/start":8,"./portfolio/start":12}],2:[function(require,module,exports){
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

},{"../lazy/Item_Data":6}],5:[function(require,module,exports){
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

window.PP_Modules.Lazy_Loader = Lazy_Loader;

module.exports = Lazy_Loader;


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

window.PP_Modules.Item_Data = Item_Data;

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
    Hooks.removeAction('pp.portfolio.create', this.prepare, 50);
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

window.PP_Modules.Portfolio_Interface = Portfolio_Interface;

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


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jb3JlL1Bob3RvZ3JhcGh5X1BvcnRmb2xpby5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY29yZS9XaW5kb3cuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvcG9wdXAuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvQWJzdHJhY3RfTGF6eV9Mb2FkZXIuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvSXRlbV9EYXRhLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0xhenlfTWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvbGF6eS9zdGFydC5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL1BvcnRmb2xpb19FdmVudF9NYW5hZ2VyLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9wb3J0Zm9saW8vUG9ydGZvbGlvX0ludGVyZmFjZS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL1BvcnRmb2xpb19NYXNvbnJ5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9wb3J0Zm9saW8vc3RhcnQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMzSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxuLypcbiAgICBMb2FkIERlcGVuZGVuY2llc1xuICovXG52YXIgJCwgSG9va3M7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG53aW5kb3cuUFBfTW9kdWxlcyA9IHt9O1xuXG5cbi8qXG5cdEJvb3Qgb24gYGRvY3VtZW50LnJlYWR5YFxuICovXG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICB2YXIgUGhvdG9ncmFwaHlfUG9ydGZvbGlvO1xuICBpZiAoISQoJ2JvZHknKS5oYXNDbGFzcygnUFBfUG9ydGZvbGlvJykpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgUGhvdG9ncmFwaHlfUG9ydGZvbGlvID0gbmV3IChyZXF1aXJlKCcuL2NvcmUvUGhvdG9ncmFwaHlfUG9ydGZvbGlvJykpKCk7XG4gIFBob3RvZ3JhcGh5X1BvcnRmb2xpby5yZWFkeSgpO1xufSk7XG5cblxuLypcblx0TG9hZCBBcHBcbiAqL1xuXG5yZXF1aXJlKCcuL3BvcnRmb2xpby9zdGFydCcpO1xuXG5yZXF1aXJlKCcuL2dhbGxlcnkvcG9wdXAnKTtcblxucmVxdWlyZSgnLi9sYXp5L3N0YXJ0Jyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVlYQndMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaVlYQndMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaU8wRkJRVUU3T3p0QlFVRkJMRWxCUVVFN08wRkJSMEVzUzBGQlFTeEhRVUZSTEU5QlFVRXNRMEZCVXl4VlFVRlVPenRCUVVOU0xFTkJRVUVzUjBGQlNTeFBRVUZCTEVOQlFWTXNVVUZCVkRzN1FVRkpTaXhOUVVGTkxFTkJRVU1zVlVGQlVDeEhRVUZ2UWpzN08wRkJSWEJDT3pzN08wRkJSMEVzUTBGQlFTeERRVUZITEZGQlFVZ3NRMEZCWVN4RFFVRkRMRXRCUVdRc1EwRkJiMElzVTBGQlFUdEJRVWR1UWl4TlFVRkJPMFZCUVVFc1NVRkJWU3hEUVVGSkxFTkJRVUVzUTBGQlJ5eE5RVUZJTEVOQlFWY3NRMEZCUXl4UlFVRmFMRU5CUVhOQ0xHTkJRWFJDTEVOQlFXUTdRVUZCUVN4WFFVRkJPenRGUVVkQkxIRkNRVUZCTEVkQlFUUkNMRWxCUVVFc1EwRkJSU3hQUVVGQkxFTkJRVk1zT0VKQlFWUXNRMEZCUml4RFFVRkJMRU5CUVVFN1JVRkROVUlzY1VKQlFYRkNMRU5CUVVNc1MwRkJkRUlzUTBGQlFUdEJRVkJ0UWl4RFFVRndRanM3TzBGQldVRTdPenM3UVVGTFFTeFBRVUZCTEVOQlFWRXNiVUpCUVZJN08wRkJSMEVzVDBGQlFTeERRVUZSTEdsQ1FVRlNPenRCUVVkQkxFOUJRVUVzUTBGQlVTeGpRVUZTSW4wPVxuIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgJCwgQ29yZSwgSG9va3MsXG4gIGJpbmQgPSBmdW5jdGlvbihmbiwgbWUpeyByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuIGZuLmFwcGx5KG1lLCBhcmd1bWVudHMpOyB9OyB9O1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuQ29yZSA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gQ29yZSgpIHtcbiAgICB0aGlzLndhaXRfZm9yX2xvYWQgPSBiaW5kKHRoaXMud2FpdF9mb3JfbG9hZCwgdGhpcyk7XG4gICAgdGhpcy5yZWFkeSA9IGJpbmQodGhpcy5yZWFkeSwgdGhpcyk7XG4gICAgSG9va3MuYWRkQWN0aW9uKCdwcC5jb3JlLnJlYWR5JywgdGhpcy53YWl0X2Zvcl9sb2FkKTtcbiAgfVxuXG4gIENvcmUucHJvdG90eXBlLnJlYWR5ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKEhvb2tzLmFwcGx5RmlsdGVycygncHAuY29yZS5yZWFkeScsIHRydWUpKSB7XG4gICAgICBIb29rcy5kb0FjdGlvbigncHAuY29yZS5yZWFkeScpO1xuICAgIH1cbiAgfTtcblxuICBDb3JlLnByb3RvdHlwZS53YWl0X2Zvcl9sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICQoJy5QUF9XcmFwcGVyJykuaW1hZ2VzTG9hZGVkKHRoaXMubG9hZGVkKTtcbiAgfTtcblxuICBDb3JlLnByb3RvdHlwZS5sb2FkZWQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoSG9va3MuYXBwbHlGaWx0ZXJzKCdwcC5jb3JlLmxvYWRlZCcsIHRydWUpKSB7XG4gICAgICBIb29rcy5kb0FjdGlvbigncHAuY29yZS5sb2FkZWQnKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIENvcmU7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29yZTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVUdodmRHOW5jbUZ3YUhsZlVHOXlkR1p2YkdsdkxtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpVUdodmRHOW5jbUZ3YUhsZlVHOXlkR1p2YkdsdkxtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pTzBGQlFVRTdPenRCUVVGQkxFbEJRVUVzWTBGQlFUdEZRVUZCT3p0QlFVZEJMRU5CUVVFc1IwRkJTU3hQUVVGQkxFTkJRVk1zVVVGQlZEczdRVUZEU2l4TFFVRkJMRWRCUVZFc1QwRkJRU3hEUVVGVExGVkJRVlE3TzBGQlIwWTdSVUZGVVN4alFVRkJPenM3U1VGRFdpeExRVUZMTEVOQlFVTXNVMEZCVGl4RFFVRm5RaXhsUVVGb1FpeEZRVUZwUXl4SlFVRkRMRU5CUVVFc1lVRkJiRU03UlVGRVdUczdhVUpCU1dJc1MwRkJRU3hIUVVGUExGTkJRVUU3U1VGRFRpeEpRVUZITEV0QlFVc3NRMEZCUXl4WlFVRk9MRU5CUVc5Q0xHVkJRWEJDTEVWQlFYRkRMRWxCUVhKRExFTkJRVWc3VFVGRFF5eExRVUZMTEVOQlFVTXNVVUZCVGl4RFFVRmxMR1ZCUVdZc1JVRkVSRHM3UlVGRVRUczdhVUpCUzFBc1lVRkJRU3hIUVVGbExGTkJRVUU3VjBGRlpDeERRVUZCTEVOQlFVY3NZVUZCU0N4RFFVRnJRaXhEUVVGRExGbEJRVzVDTEVOQlFXbERMRWxCUVVNc1EwRkJRU3hOUVVGc1F6dEZRVVpqT3p0cFFrRkxaaXhOUVVGQkxFZEJRVkVzVTBGQlFUdEpRVU5RTEVsQlFVY3NTMEZCU3l4RFFVRkRMRmxCUVU0c1EwRkJiMElzWjBKQlFYQkNMRVZCUVhORExFbEJRWFJETEVOQlFVZzdUVUZEUXl4TFFVRkxMRU5CUVVNc1VVRkJUaXhEUVVGbExHZENRVUZtTEVWQlJFUTdPMFZCUkU4N096czdPenRCUVU5VUxFMUJRVTBzUTBGQlF5eFBRVUZRTEVkQlFXbENJbjA9XG4iLCJ2YXIgSG9va3MsIGdldF9zaXplO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5nZXRfc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHdpZHRoOiB3aW5kb3cuaW5uZXJXaWR0aCB8fCAkd2luZG93LndpZHRoKCksXG4gICAgaGVpZ2h0OiB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgJHdpbmRvdy5oZWlnaHQoKVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBnZXRfc2l6ZSgpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lWMmx1Wkc5M0xtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpVjJsdVpHOTNMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRU3hKUVVGQk96dEJRVUZCTEV0QlFVRXNSMEZCVVN4UFFVRkJMRU5CUVZNc1ZVRkJWRHM3UVVGSFVpeFJRVUZCTEVkQlFWY3NVMEZCUVR0VFFVTldPMGxCUVVFc1MwRkJRU3hGUVVGUkxFMUJRVTBzUTBGQlF5eFZRVUZRTEVsQlFYRkNMRTlCUVU4c1EwRkJReXhMUVVGU0xFTkJRVUVzUTBGQk4wSTdTVUZEUVN4TlFVRkJMRVZCUVZFc1RVRkJUU3hEUVVGRExGZEJRVkFzU1VGQmMwSXNUMEZCVHl4RFFVRkRMRTFCUVZJc1EwRkJRU3hEUVVRNVFqczdRVUZFVlRzN1FVRkxXQ3hOUVVGTkxFTkJRVU1zVDBGQlVDeEhRVUZwUWl4UlFVRkJMRU5CUVVFaWZRPT1cbiIsIlxuLypcbiAgICBEZXBlbmRlbmNpZXNcbiAqL1xudmFyICQsIEhvb2tzLCBJdGVtX0RhdGEsIGdldF9kYXRhO1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuSXRlbV9EYXRhID0gcmVxdWlyZSgnLi4vbGF6eS9JdGVtX0RhdGEnKTtcblxuZ2V0X2RhdGEgPSBmdW5jdGlvbihlbCkge1xuICB2YXIgJGNvbnRhaW5lciwgJGVsLCAkaXRlbXMsIGl0ZW1zO1xuICAkZWwgPSAkKGVsKTtcbiAgJGNvbnRhaW5lciA9ICRlbC5jbG9zZXN0KCcuUFBfR2FsbGVyeScpO1xuICAkaXRlbXMgPSAkY29udGFpbmVyLmZpbmQoJy5QUF9HYWxsZXJ5X19pdGVtJyk7XG4gIGl0ZW1zID0gJGl0ZW1zLm1hcChmdW5jdGlvbihrZXksIGl0ZW0pIHtcbiAgICB2YXIgaTtcbiAgICBpID0gbmV3IEl0ZW1fRGF0YSgkKGl0ZW0pKTtcbiAgICByZXR1cm4ge1xuICAgICAgc3JjOiBpLmdldF91cmwoJ2Z1bGwnKSxcbiAgICAgIHRodW1iOiBpLmdldF91cmwoJ3RodW1iJylcbiAgICB9O1xuICB9KTtcbiAgcmV0dXJuIGl0ZW1zO1xufTtcblxuXG4vKlxuICAgIEBUT0RPOiBOZWVkIGRldGFjaC9kZXN0cm95IG1ldGhvZHNcbiAqL1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3BwLmNvcmUucmVhZHknLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICQoJy5QUF9HYWxsZXJ5X19pdGVtJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgIHZhciAkZWw7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICRlbCA9ICQodGhpcyk7XG4gICAgcmV0dXJuICRlbC5saWdodEdhbGxlcnkoe1xuICAgICAgZHluYW1pYzogdHJ1ZSxcbiAgICAgIGR5bmFtaWNFbDogZ2V0X2RhdGEodGhpcyksXG4gICAgICBpbmRleDogJCgnLlBQX0dhbGxlcnlfX2l0ZW0nKS5pbmRleCgkZWwpLFxuICAgICAgc3BlZWQ6IDM1MCxcbiAgICAgIHByZWxvYWQ6IDMsXG4gICAgICBkb3dubG9hZDogZmFsc2VcbiAgICB9KTtcbiAgfSk7XG59KTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pY0c5d2RYQXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lKd2IzQjFjQzVqYjJabVpXVWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqdEJRVUZCT3pzN1FVRkJRU3hKUVVGQk96dEJRVWRCTEVOQlFVRXNSMEZCU1N4UFFVRkJMRU5CUVZNc1VVRkJWRHM3UVVGRFNpeExRVUZCTEVkQlFWRXNUMEZCUVN4RFFVRlRMRlZCUVZRN08wRkJRMUlzVTBGQlFTeEhRVUZaTEU5QlFVRXNRMEZCVXl4dFFrRkJWRHM3UVVGRldpeFJRVUZCTEVkQlFWY3NVMEZCUlN4RlFVRkdPMEZCUTFZc1RVRkJRVHRGUVVGQkxFZEJRVUVzUjBGQlRTeERRVUZCTEVOQlFVY3NSVUZCU0R0RlFVTk9MRlZCUVVFc1IwRkJZU3hIUVVGSExFTkJRVU1zVDBGQlNpeERRVUZoTEdGQlFXSTdSVUZGWWl4TlFVRkJMRWRCUVZNc1ZVRkJWU3hEUVVGRExFbEJRVmdzUTBGQmFVSXNiVUpCUVdwQ08wVkJSVlFzUzBGQlFTeEhRVUZSTEUxQlFVMHNRMEZCUXl4SFFVRlFMRU5CUVZjc1UwRkJSU3hIUVVGR0xFVkJRVThzU1VGQlVEdEJRVU5zUWl4UlFVRkJPMGxCUVVFc1EwRkJRU3hIUVVGUkxFbEJRVUVzVTBGQlFTeERRVUZYTEVOQlFVRXNRMEZCUnl4SlFVRklMRU5CUVZnN1FVRkZVaXhYUVVGUE8wMUJRMDRzUjBGQlFTeEZRVUZQTEVOQlFVTXNRMEZCUXl4UFFVRkdMRU5CUVZjc1RVRkJXQ3hEUVVSRU8wMUJSVTRzUzBGQlFTeEZRVUZQTEVOQlFVTXNRMEZCUXl4UFFVRkdMRU5CUVZjc1QwRkJXQ3hEUVVaRU96dEZRVWhYTEVOQlFWZzdRVUZUVWl4VFFVRlBPMEZCWmtjN096dEJRV2xDV0RzN096dEJRVWRCTEV0QlFVc3NRMEZCUXl4VFFVRk9MRU5CUVdkQ0xHVkJRV2hDTEVWQlFXbERMRk5CUVVFN1UwRkZhRU1zUTBGQlFTeERRVUZITEcxQ1FVRklMRU5CUVhkQ0xFTkJRVU1zUlVGQmVrSXNRMEZCTkVJc1QwRkJOVUlzUlVGQmNVTXNVMEZCUlN4RFFVRkdPMEZCUTNCRExGRkJRVUU3U1VGQlFTeERRVUZETEVOQlFVTXNZMEZCUml4RFFVRkJPMGxCUjBFc1IwRkJRU3hIUVVGTkxFTkJRVUVzUTBGQlJ5eEpRVUZJTzFkQlIwNHNSMEZCUnl4RFFVRkRMRmxCUVVvc1EwRkRRenROUVVGQkxFOUJRVUVzUlVGQlZ5eEpRVUZZTzAxQlEwRXNVMEZCUVN4RlFVRlhMRkZCUVVFc1EwRkJWU3hKUVVGV0xFTkJSRmc3VFVGRlFTeExRVUZCTEVWQlFWY3NRMEZCUVN4RFFVRkhMRzFDUVVGSUxFTkJRWGRDTEVOQlFVTXNTMEZCZWtJc1EwRkJLMElzUjBGQkwwSXNRMEZHV0R0TlFVZEJMRXRCUVVFc1JVRkJWeXhIUVVoWU8wMUJTVUVzVDBGQlFTeEZRVUZYTEVOQlNsZzdUVUZMUVN4UlFVRkJMRVZCUVZjc1MwRk1XRHRMUVVSRU8wVkJVRzlETEVOQlFYSkRPMEZCUm1kRExFTkJRV3BESW4wPVxuIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgJCwgSG9va3MsIEl0ZW1fRGF0YSwgTGF6eV9Mb2FkZXI7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5JdGVtX0RhdGEgPSByZXF1aXJlKCcuL0l0ZW1fRGF0YScpO1xuXG5MYXp5X0xvYWRlciA9IChmdW5jdGlvbigpIHtcbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLkVsZW1lbnRzID0ge1xuICAgIGl0ZW06ICdQUF9MYXp5X0ltYWdlJyxcbiAgICBwbGFjZWhvbGRlcjogJ1BQX0xhenlfSW1hZ2VfX3BsYWNlaG9sZGVyJyxcbiAgICBsaW5rOiAnUFBfSlNfTGF6eV9fbGluaycsXG4gICAgaW1hZ2U6ICdQUF9KU19MYXp5X19pbWFnZSdcbiAgfTtcblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUuSXRlbXMgPSBbXTtcblxuICBmdW5jdGlvbiBMYXp5X0xvYWRlcigpIHtcbiAgICB0aGlzLnNldHVwX2RhdGEoKTtcbiAgICB0aGlzLnJlc2l6ZV9hbGwoKTtcbiAgICB0aGlzLmF0dGFjaF9ldmVudHMoKTtcbiAgfVxuXG5cbiAgLypcbiAgXHRcdEFic3RyYWN0IE1ldGhvZHNcbiAgICovXG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBMYXp5X0xvYWRlcmAgbXVzdCBpbXBsZW1lbnQgYHJlc2l6ZWAgbWV0aG9kXCIpO1xuICB9O1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYExhenlfTG9hZGVyYCBtdXN0IGltcGxlbWVudCBgbG9hZGAgbWV0aG9kXCIpO1xuICB9O1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5hdXRvbG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBMYXp5X0xvYWRlcmAgbXVzdCBpbXBsZW1lbnQgYGF1dG9sb2FkYCBtZXRob2RcIik7XG4gIH07XG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLnNldHVwX2RhdGEgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgJGl0ZW1zO1xuICAgIHRoaXMuSXRlbXMgPSBbXTtcbiAgICAkaXRlbXMgPSAkKFwiLlwiICsgdGhpcy5FbGVtZW50cy5pdGVtKTtcbiAgICAkaXRlbXMuZWFjaCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihrZXksIGVsKSB7XG4gICAgICAgIHZhciAkZWw7XG4gICAgICAgICRlbCA9ICQoZWwpO1xuICAgICAgICByZXR1cm4gX3RoaXMuSXRlbXMucHVzaCh7XG4gICAgICAgICAgZWw6IGVsLFxuICAgICAgICAgICRlbDogJGVsLFxuICAgICAgICAgIGRhdGE6IG5ldyBJdGVtX0RhdGEoJGVsKSxcbiAgICAgICAgICBsb2FkZWQ6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH07XG5cblxuICAvKlxuICBcdFx0TWV0aG9kc1xuICAgKi9cblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUucmVzaXplX2FsbCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpLCBpdGVtLCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICByZWYgPSB0aGlzLkl0ZW1zO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGl0ZW0gPSByZWZbaV07XG4gICAgICByZXN1bHRzLnB1c2godGhpcy5yZXNpemUoaXRlbSkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUubG9hZF9hbGwgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaSwgaXRlbSwgbGVuLCByZWYsIHJlc3VsdHM7XG4gICAgcmVmID0gdGhpcy5JdGVtcztcbiAgICByZXN1bHRzID0gW107XG4gICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpdGVtID0gcmVmW2ldO1xuICAgICAgdGhpcy5sb2FkKGl0ZW0pO1xuICAgICAgcmVzdWx0cy5wdXNoKHRoaXMucmVtb3ZlX3BsYWNlaG9sZGVyKGl0ZW0pKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLnJlbW92ZV9wbGFjZWhvbGRlciA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICByZXR1cm4gaXRlbS4kZWwuZmluZChcIi5cIiArIHRoaXMuRWxlbWVudHMucGxhY2Vob2xkZXIgKyBcIiwgbm9zY3JpcHRcIikucmVtb3ZlKCk7XG4gIH07XG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kZXRhY2hfZXZlbnRzKCk7XG4gIH07XG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLmF0dGFjaF9ldmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gSG9va3MuYWRkQWN0aW9uKCdwcC5sYXp5LmF1dG9sb2FkJywgdGhpcy5hdXRvbG9hZCk7XG4gIH07XG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLmRldGFjaF9ldmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gSG9va3MucmVtb3ZlQWN0aW9uKCdwcC5sYXp5LmF1dG9sb2FkJywgdGhpcy5hdXRvbG9hZCk7XG4gIH07XG5cbiAgcmV0dXJuIExhenlfTG9hZGVyO1xuXG59KSgpO1xuXG53aW5kb3cuUFBfTW9kdWxlcy5MYXp5X0xvYWRlciA9IExhenlfTG9hZGVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExhenlfTG9hZGVyO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lRV0p6ZEhKaFkzUmZUR0Y2ZVY5TWIyRmtaWEl1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SkJZbk4wY21GamRGOU1ZWHA1WDB4dllXUmxjaTVqYjJabVpXVWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqdEJRVUZCT3pzN1FVRkJRU3hKUVVGQk96dEJRVWRCTEVOQlFVRXNSMEZCU1N4UFFVRkJMRU5CUVZNc1VVRkJWRHM3UVVGRFNpeExRVUZCTEVkQlFWRXNUMEZCUVN4RFFVRlRMRlZCUVZRN08wRkJRMUlzVTBGQlFTeEhRVUZaTEU5QlFVRXNRMEZCVXl4aFFVRlVPenRCUVVWT08zZENRVVZNTEZGQlFVRXNSMEZEUXp0SlFVRkJMRWxCUVVFc1JVRkJZU3hsUVVGaU8wbEJRMEVzVjBGQlFTeEZRVUZoTERSQ1FVUmlPMGxCUlVFc1NVRkJRU3hGUVVGaExHdENRVVppTzBsQlIwRXNTMEZCUVN4RlFVRmhMRzFDUVVoaU96czdkMEpCUzBRc1MwRkJRU3hIUVVGUE96dEZRVWROTEhGQ1FVRkJPMGxCUTFvc1NVRkJReXhEUVVGQkxGVkJRVVFzUTBGQlFUdEpRVU5CTEVsQlFVTXNRMEZCUVN4VlFVRkVMRU5CUVVFN1NVRkRRU3hKUVVGRExFTkJRVUVzWVVGQlJDeERRVUZCTzBWQlNGazdPenRCUVUxaU96czdPM2RDUVVkQkxFMUJRVUVzUjBGQlZTeFRRVUZCTzBGQlFVY3NWVUZCVlN4SlFVRkJMRXRCUVVFc1EwRkJUeXg1UlVGQlVEdEZRVUZpT3p0M1FrRkRWaXhKUVVGQkxFZEJRVlVzVTBGQlFUdEJRVUZITEZWQlFWVXNTVUZCUVN4TFFVRkJMRU5CUVU4c2RVVkJRVkE3UlVGQllqczdkMEpCUTFZc1VVRkJRU3hIUVVGVkxGTkJRVUU3UVVGQlJ5eFZRVUZWTEVsQlFVRXNTMEZCUVN4RFFVRlBMREpGUVVGUU8wVkJRV0k3TzNkQ1FVZFdMRlZCUVVFc1IwRkJXU3hUUVVGQk8wRkJSVmdzVVVGQlFUdEpRVUZCTEVsQlFVTXNRMEZCUVN4TFFVRkVMRWRCUVZNN1NVRkZWQ3hOUVVGQkxFZEJRVk1zUTBGQlFTeERRVUZITEVkQlFVRXNSMEZCU1N4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExFbEJRV3BDTzBsQlJWUXNUVUZCVFN4RFFVRkRMRWxCUVZBc1EwRkJXU3hEUVVGQkxGTkJRVUVzUzBGQlFUdGhRVUZCTEZOQlFVVXNSMEZCUml4RlFVRlBMRVZCUVZBN1FVRkZXQ3haUVVGQk8xRkJRVUVzUjBGQlFTeEhRVUZOTEVOQlFVRXNRMEZCUnl4RlFVRklPMlZCUTA0c1MwRkJReXhEUVVGQkxFdEJRVXNzUTBGQlF5eEpRVUZRTEVOQlEwTTdWVUZCUVN4RlFVRkJMRVZCUVZFc1JVRkJVanRWUVVOQkxFZEJRVUVzUlVGQlVTeEhRVVJTTzFWQlJVRXNTVUZCUVN4RlFVRlpMRWxCUVVFc1UwRkJRU3hEUVVGWExFZEJRVmdzUTBGR1dqdFZRVWRCTEUxQlFVRXNSVUZCVVN4TFFVaFNPMU5CUkVRN1RVRklWenRKUVVGQkxFTkJRVUVzUTBGQlFTeERRVUZCTEVsQlFVRXNRMEZCV2p0RlFVNVhPenM3UVVGclFsbzdPenM3ZDBKQlIwRXNWVUZCUVN4SFFVRlpMRk5CUVVFN1FVRkRXQ3hSUVVGQk8wRkJRVUU3UVVGQlFUdFRRVUZCTEhGRFFVRkJPenR0UWtGQlFTeEpRVUZETEVOQlFVRXNUVUZCUkN4RFFVRlRMRWxCUVZRN1FVRkJRVHM3UlVGRVZ6czdkMEpCUjFvc1VVRkJRU3hIUVVGVkxGTkJRVUU3UVVGRFZDeFJRVUZCTzBGQlFVRTdRVUZCUVR0VFFVRkJMSEZEUVVGQk96dE5RVU5ETEVsQlFVTXNRMEZCUVN4SlFVRkVMRU5CUVU4c1NVRkJVRHR0UWtGRFFTeEpRVUZETEVOQlFVRXNhMEpCUVVRc1EwRkJjVUlzU1VGQmNrSTdRVUZHUkRzN1JVRkVVenM3ZDBKQlMxWXNhMEpCUVVFc1IwRkJiMElzVTBGQlJTeEpRVUZHTzFkQlEyNUNMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zU1VGQlZDeERRVUZsTEVkQlFVRXNSMEZCU1N4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExGZEJRV1FzUjBGQk1FSXNXVUZCZWtNc1EwRkJjMFFzUTBGQlF5eE5RVUYyUkN4RFFVRkJPMFZCUkcxQ096dDNRa0ZKY0VJc1QwRkJRU3hIUVVGVExGTkJRVUU3VjBGRFVpeEpRVUZETEVOQlFVRXNZVUZCUkN4RFFVRkJPMFZCUkZFN08zZENRVWRVTEdGQlFVRXNSMEZCWlN4VFFVRkJPMWRCUTJRc1MwRkJTeXhEUVVGRExGTkJRVTRzUTBGQlowSXNhMEpCUVdoQ0xFVkJRVzlETEVsQlFVTXNRMEZCUVN4UlFVRnlRenRGUVVSak96dDNRa0ZIWml4aFFVRkJMRWRCUVdVc1UwRkJRVHRYUVVOa0xFdEJRVXNzUTBGQlF5eFpRVUZPTEVOQlFXMUNMR3RDUVVGdVFpeEZRVUYxUXl4SlFVRkRMRU5CUVVFc1VVRkJlRU03UlVGRVl6czdPenM3TzBGQlNXaENMRTFCUVUwc1EwRkJReXhWUVVGVkxFTkJRVU1zVjBGQmJFSXNSMEZCWjBNN08wRkJRMmhETEUxQlFVMHNRMEZCUXl4UFFVRlFMRWRCUVdsQ0luMD1cbiIsInZhciBJdGVtX0RhdGE7XG5cbkl0ZW1fRGF0YSA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gSXRlbV9EYXRhKCRlbCkge1xuICAgIHZhciBkYXRhO1xuICAgIHRoaXMuJGVsID0gJGVsO1xuICAgIGRhdGEgPSAkZWwuZGF0YSgnaXRlbScpO1xuICAgIGlmICghZGF0YSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRWxlbWVudCBkb2Vzbid0IGNvbnRhaW4gYGRhdGEtaXRlbWAgYXR0cmlidXRlXCIpO1xuICAgIH1cbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICB9XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfZGF0YSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaW1hZ2U7XG4gICAgaW1hZ2UgPSB0aGlzLmRhdGFbJ2ltYWdlcyddW25hbWVdO1xuICAgIGlmICghaW1hZ2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGltYWdlO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X3NpemUgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGhlaWdodCwgaW1hZ2UsIHJlZiwgc2l6ZSwgd2lkdGg7XG4gICAgaW1hZ2UgPSB0aGlzLmdldF9kYXRhKG5hbWUpO1xuICAgIGlmICghaW1hZ2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgc2l6ZSA9IGltYWdlWydzaXplJ107XG4gICAgcmVmID0gc2l6ZS5zcGxpdCgneCcpLCB3aWR0aCA9IHJlZlswXSwgaGVpZ2h0ID0gcmVmWzFdO1xuICAgIHdpZHRoID0gcGFyc2VJbnQod2lkdGgpO1xuICAgIGhlaWdodCA9IHBhcnNlSW50KGhlaWdodCk7XG4gICAgcmV0dXJuIFt3aWR0aCwgaGVpZ2h0XTtcbiAgfTtcblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF91cmwgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGltYWdlO1xuICAgIGltYWdlID0gdGhpcy5nZXRfZGF0YShuYW1lKTtcbiAgICBpZiAoIWltYWdlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBpbWFnZVsndXJsJ107XG4gIH07XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfb3JfZmFsc2UgPSBmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAodGhpcy5kYXRhW2tleV0pIHtcbiAgICAgIHJldHVybiB0aGlzLmRhdGFba2V5XTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X3JhdGlvID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0X29yX2ZhbHNlKCdyYXRpbycpO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X3R5cGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRfb3JfZmFsc2UoJ3R5cGUnKTtcbiAgfTtcblxuICByZXR1cm4gSXRlbV9EYXRhO1xuXG59KSgpO1xuXG53aW5kb3cuUFBfTW9kdWxlcy5JdGVtX0RhdGEgPSBJdGVtX0RhdGE7XG5cbm1vZHVsZS5leHBvcnRzID0gSXRlbV9EYXRhO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lTWFJsYlY5RVlYUmhMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaVNYUmxiVjlFWVhSaExtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeEpRVUZCT3p0QlFVRk5PMFZCUlZFc2JVSkJRVVVzUjBGQlJqdEJRVU5hTEZGQlFVRTdTVUZCUVN4SlFVRkRMRU5CUVVFc1IwRkJSQ3hIUVVGUE8wbEJRMUFzU1VGQlFTeEhRVUZQTEVkQlFVY3NRMEZCUXl4SlFVRktMRU5CUVZVc1RVRkJWanRKUVVWUUxFbEJRVWNzUTBGQlNTeEpRVUZRTzBGQlEwTXNXVUZCVlN4SlFVRkJMRXRCUVVFc1EwRkJUU3dyUTBGQlRpeEZRVVJZT3p0SlFVZEJMRWxCUVVNc1EwRkJRU3hKUVVGRUxFZEJRVkU3UlVGUVNUczdjMEpCVjJJc1VVRkJRU3hIUVVGVkxGTkJRVVVzU1VGQlJqdEJRVU5VTEZGQlFVRTdTVUZCUVN4TFFVRkJMRWRCUVZFc1NVRkJReXhEUVVGQkxFbEJRVTBzUTBGQlFTeFJRVUZCTEVOQlFWa3NRMEZCUVN4SlFVRkJPMGxCUXpOQ0xFbEJRV2RDTEVOQlFVa3NTMEZCY0VJN1FVRkJRU3hoUVVGUExFMUJRVkE3TzBGQlJVRXNWMEZCVHp0RlFVcEZPenR6UWtGTlZpeFJRVUZCTEVkQlFWVXNVMEZCUlN4SlFVRkdPMEZCUTFRc1VVRkJRVHRKUVVGQkxFdEJRVUVzUjBGQlVTeEpRVUZETEVOQlFVRXNVVUZCUkN4RFFVRlhMRWxCUVZnN1NVRkRVaXhKUVVGblFpeERRVUZKTEV0QlFYQkNPMEZCUVVFc1lVRkJUeXhOUVVGUU96dEpRVVZCTEVsQlFVRXNSMEZCVHl4TFFVRlBMRU5CUVVFc1RVRkJRVHRKUVVWa0xFMUJRV3RDTEVsQlFVa3NRMEZCUXl4TFFVRk1MRU5CUVZrc1IwRkJXaXhEUVVGc1FpeEZRVUZETEdOQlFVUXNSVUZCVVR0SlFVVlNMRXRCUVVFc1IwRkJVU3hSUVVGQkxFTkJRVlVzUzBGQlZqdEpRVU5TTEUxQlFVRXNSMEZCVXl4UlFVRkJMRU5CUVZVc1RVRkJWanRCUVVWVUxGZEJRVThzUTBGQlF5eExRVUZFTEVWQlFWRXNUVUZCVWp0RlFWaEZPenR6UWtGaFZpeFBRVUZCTEVkQlFWTXNVMEZCUlN4SlFVRkdPMEZCUTFJc1VVRkJRVHRKUVVGQkxFdEJRVUVzUjBGQlVTeEpRVUZETEVOQlFVRXNVVUZCUkN4RFFVRlhMRWxCUVZnN1NVRkRVaXhKUVVGblFpeERRVUZKTEV0QlFYQkNPMEZCUVVFc1lVRkJUeXhOUVVGUU96dEJRVU5CTEZkQlFVOHNTMEZCVHl4RFFVRkJMRXRCUVVFN1JVRklUanM3YzBKQlMxUXNXVUZCUVN4SFFVRmpMRk5CUVVVc1IwRkJSanRKUVVOaUxFbEJRVWNzU1VGQlF5eERRVUZCTEVsQlFVMHNRMEZCUVN4SFFVRkJMRU5CUVZZN1FVRkRReXhoUVVGUExFbEJRVU1zUTBGQlFTeEpRVUZOTEVOQlFVRXNSMEZCUVN4RlFVUm1PenRCUVVWQkxGZEJRVTg3UlVGSVRUczdjMEpCUzJRc1UwRkJRU3hIUVVGakxGTkJRVUU3VjBGQlJ5eEpRVUZETEVOQlFVRXNXVUZCUkN4RFFVRmxMRTlCUVdZN1JVRkJTRHM3YzBKQlEyUXNVVUZCUVN4SFFVRmpMRk5CUVVFN1YwRkJSeXhKUVVGRExFTkJRVUVzV1VGQlJDeERRVUZsTEUxQlFXWTdSVUZCU0RzN096czdPMEZCUjJZc1RVRkJUU3hEUVVGRExGVkJRVlVzUTBGQlF5eFRRVUZzUWl4SFFVRTRRanM3UVVGRE9VSXNUVUZCVFN4RFFVRkRMRTlCUVZBc1IwRkJhVUlpZlE9PVxuIiwidmFyICQsIEFic3RyYWN0X0xhenlfTG9hZGVyLCBMYXp5X01hc29ucnksIF9fV0lORE9XLFxuICBiaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfSxcbiAgZXh0ZW5kID0gZnVuY3Rpb24oY2hpbGQsIHBhcmVudCkgeyBmb3IgKHZhciBrZXkgaW4gcGFyZW50KSB7IGlmIChoYXNQcm9wLmNhbGwocGFyZW50LCBrZXkpKSBjaGlsZFtrZXldID0gcGFyZW50W2tleV07IH0gZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9IGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTsgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTsgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTsgcmV0dXJuIGNoaWxkOyB9LFxuICBoYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHk7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5BYnN0cmFjdF9MYXp5X0xvYWRlciA9IHJlcXVpcmUoJy4vQWJzdHJhY3RfTGF6eV9Mb2FkZXInKTtcblxuX19XSU5ET1cgPSByZXF1aXJlKCcuLi9jb3JlL1dpbmRvdycpO1xuXG5MYXp5X01hc29ucnkgPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICBleHRlbmQoTGF6eV9NYXNvbnJ5LCBzdXBlckNsYXNzKTtcblxuICBmdW5jdGlvbiBMYXp5X01hc29ucnkoKSB7XG4gICAgdGhpcy5sb2FkX2l0ZW1zX2luX3ZpZXcgPSBiaW5kKHRoaXMubG9hZF9pdGVtc19pbl92aWV3LCB0aGlzKTtcbiAgICB0aGlzLmF1dG9sb2FkID0gYmluZCh0aGlzLmF1dG9sb2FkLCB0aGlzKTtcbiAgICB0aGlzLmRlYm91bmNlZF9sb2FkX2l0ZW1zX2luX3ZpZXcgPSBfLmRlYm91bmNlKHRoaXMubG9hZF9pdGVtc19pbl92aWV3LCA1MCk7XG4gICAgTGF6eV9NYXNvbnJ5Ll9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMpO1xuICB9XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0uJGVsLmNzcyh7XG4gICAgICAnbWluLWhlaWdodCc6IE1hdGguZmxvb3IodGhpcy5nZXRfd2lkdGgoKSAvIGl0ZW0uZGF0YS5nZXRfcmF0aW8oKSlcbiAgICB9KTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmdldF93aWR0aCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAkKCcuUFBfTWFzb25yeV9fc2l6ZXInKS53aWR0aCgpO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUuYXV0b2xvYWQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5sb2FkX2l0ZW1zX2luX3ZpZXcoKTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmxvYWQgPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgdmFyICRpbWFnZSwgZnVsbCwgdGh1bWI7XG4gICAgdGh1bWIgPSBpdGVtLmRhdGEuZ2V0X3VybCgndGh1bWInKTtcbiAgICBmdWxsID0gaXRlbS5kYXRhLmdldF91cmwoJ2Z1bGwnKTtcbiAgICBpdGVtLiRlbC5wcmVwZW5kKFwiPGEgY2xhc3M9XFxcIlwiICsgdGhpcy5FbGVtZW50cy5saW5rICsgXCJcXFwiIGhyZWY9XFxcIlwiICsgZnVsbCArIFwiXFxcIiByZWw9XFxcImdhbGxlcnlcXFwiPlxcbjxpbWcgY2xhc3M9XFxcIlwiICsgdGhpcy5FbGVtZW50cy5pbWFnZSArIFwiXFxcIiBzcmM9XFxcIlwiICsgdGh1bWIgKyBcIlxcXCIgY2xhc3M9XFxcIlBQX0pTX19sb2FkaW5nXFxcIiAvPlxcbjwvYT5cIikucmVtb3ZlQ2xhc3MoJ0xhenktSW1hZ2UnKTtcbiAgICBpdGVtLmxvYWRlZCA9IHRydWU7XG4gICAgJGltYWdlID0gaXRlbS4kZWwuZmluZCgnaW1nJyk7XG4gICAgcmV0dXJuICRpbWFnZS5pbWFnZXNMb2FkZWQoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICRpbWFnZS5hZGRDbGFzcygnUFBfSlNfX2xvYWRlZCcpLnJlbW92ZUNsYXNzKCdQUF9KU19fbG9hZGluZycpO1xuICAgICAgICByZXR1cm4gaXRlbS4kZWwuY3NzKCdtaW4taGVpZ2h0JywgJycpLnJlbW92ZUNsYXNzKF90aGlzLkVsZW1lbnRzLml0ZW0pLmZpbmQoXCIuXCIgKyBfdGhpcy5FbGVtZW50cy5wbGFjZWhvbGRlcikuZmFkZU91dCg0MDAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiAkKHRoaXMpLnJlbW92ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUubG9hZF9pdGVtc19pbl92aWV3ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGksIGl0ZW0sIGtleSwgbGVuLCByZWYsIHJlc3VsdHM7XG4gICAgcmVmID0gdGhpcy5JdGVtcztcbiAgICByZXN1bHRzID0gW107XG4gICAgZm9yIChrZXkgPSBpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsga2V5ID0gKytpKSB7XG4gICAgICBpdGVtID0gcmVmW2tleV07XG4gICAgICBpZiAoIWl0ZW0ubG9hZGVkICYmIHRoaXMuaW5fbG9vc2VfdmlldyhpdGVtLmVsKSkge1xuICAgICAgICByZXN1bHRzLnB1c2godGhpcy5sb2FkKGl0ZW0pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdHMucHVzaCh2b2lkIDApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmluX2xvb3NlX3ZpZXcgPSBmdW5jdGlvbihlbCkge1xuICAgIHZhciByZWN0LCBzZW5zaXRpdml0eTtcbiAgICBpZiAoZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0ID09IG51bGwpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgc2Vuc2l0aXZpdHkgPSAxMDA7XG4gICAgcmV0dXJuIHJlY3QudG9wICsgcmVjdC5oZWlnaHQgPj0gLXNlbnNpdGl2aXR5ICYmIHJlY3QuYm90dG9tIC0gcmVjdC5oZWlnaHQgPD0gX19XSU5ET1cuaGVpZ2h0ICsgc2Vuc2l0aXZpdHkgJiYgcmVjdC5sZWZ0ICsgcmVjdC53aWR0aCA+PSAtc2Vuc2l0aXZpdHkgJiYgcmVjdC5yaWdodCAtIHJlY3Qud2lkdGggPD0gX19XSU5ET1cud2lkdGggKyBzZW5zaXRpdml0eTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmF0dGFjaF9ldmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAkKHdpbmRvdykub24oJ3Njcm9sbCcsIHRoaXMuZGVib3VuY2VkX2xvYWRfaXRlbXNfaW5fdmlldyk7XG4gICAgcmV0dXJuIExhenlfTWFzb25yeS5fX3N1cGVyX18uYXR0YWNoX2V2ZW50cy5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUuZGV0YWNoX2V2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICQod2luZG93KS5vZmYoJ3Njcm9sbCcsIHRoaXMuZGVib3VuY2VkX2xvYWRfaXRlbXNfaW5fdmlldyk7XG4gICAgcmV0dXJuIExhenlfTWFzb25yeS5fX3N1cGVyX18uZGV0YWNoX2V2ZW50cy5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpLCBpdGVtLCBrZXksIGxlbiwgcmVmO1xuICAgIHJlZiA9IHRoaXMuSXRlbXM7XG4gICAgZm9yIChrZXkgPSBpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsga2V5ID0gKytpKSB7XG4gICAgICBpdGVtID0gcmVmW2tleV07XG4gICAgICBpdGVtLiRlbC5jc3MoJ21pbi1oZWlnaHQnLCAnJyk7XG4gICAgfVxuICAgIHJldHVybiBMYXp5X01hc29ucnkuX19zdXBlcl9fLmRlc3Ryb3kuY2FsbCh0aGlzKTtcbiAgfTtcblxuICByZXR1cm4gTGF6eV9NYXNvbnJ5O1xuXG59KShBYnN0cmFjdF9MYXp5X0xvYWRlcik7XG5cbm1vZHVsZS5leHBvcnRzID0gTGF6eV9NYXNvbnJ5O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lUR0Y2ZVY5TllYTnZibko1TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lUR0Y2ZVY5TllYTnZibko1TG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4SlFVRkJMQ3REUVVGQk8wVkJRVUU3T3pzN1FVRkJRU3hEUVVGQkxFZEJRVWtzVDBGQlFTeERRVUZUTEZGQlFWUTdPMEZCUTBvc2IwSkJRVUVzUjBGQmRVSXNUMEZCUVN4RFFVRlRMSGRDUVVGVU96dEJRVU4yUWl4UlFVRkJMRWRCUVZjc1QwRkJRU3hEUVVGVExHZENRVUZVT3p0QlFVVk1PenM3UlVGRlVTeHpRa0ZCUVRzN08wbEJRMW9zU1VGQlF5eERRVUZCTERSQ1FVRkVMRWRCUVdkRExFTkJRVU1zUTBGQlF5eFJRVUZHTEVOQlFWa3NTVUZCUXl4RFFVRkJMR3RDUVVGaUxFVkJRV2xETEVWQlFXcERPMGxCUTJoRExEUkRRVUZCTzBWQlJsazdPM2xDUVV0aUxFMUJRVUVzUjBGQlVTeFRRVUZGTEVsQlFVWTdWMEZEVUN4SlFVRkpMRU5CUVVNc1IwRkJSeXhEUVVGRExFZEJRVlFzUTBGQllUdE5RVUZCTEZsQlFVRXNSVUZCWXl4SlFVRkpMRU5CUVVNc1MwRkJUQ3hEUVVGWkxFbEJRVU1zUTBGQlFTeFRRVUZFTEVOQlFVRXNRMEZCUVN4SFFVRmxMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zVTBGQlZpeERRVUZCTEVOQlFUTkNMRU5CUVdRN1MwRkJZanRGUVVSUE96dDVRa0ZKVWl4VFFVRkJMRWRCUVZjc1UwRkJRVHRYUVVWV0xFTkJRVUVzUTBGQlJ5eHZRa0ZCU0N4RFFVRjVRaXhEUVVGRExFdEJRVEZDTEVOQlFVRTdSVUZHVlRzN2VVSkJUVmdzVVVGQlFTeEhRVUZWTEZOQlFVRTdWMEZCUnl4SlFVRkRMRU5CUVVFc2EwSkJRVVFzUTBGQlFUdEZRVUZJT3p0NVFrRkpWaXhKUVVGQkxFZEJRVTBzVTBGQlJTeEpRVUZHTzBGQlJVd3NVVUZCUVR0SlFVRkJMRXRCUVVFc1IwRkJVU3hKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFWWXNRMEZCYlVJc1QwRkJia0k3U1VGRFVpeEpRVUZCTEVkQlFVOHNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGV0xFTkJRVzFDTEUxQlFXNUNPMGxCUlZBc1NVRkJTU3hEUVVGRExFZEJRMHdzUTBGQlF5eFBRVVJFTEVOQlExVXNZVUZCUVN4SFFVTkpMRWxCUVVNc1EwRkJRU3hSUVVGUkxFTkJRVU1zU1VGRVpDeEhRVU50UWl4WlFVUnVRaXhIUVVNMlFpeEpRVVEzUWl4SFFVTnJReXh2UTBGRWJFTXNSMEZGVFN4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExFdEJSbWhDTEVkQlJYTkNMRmRCUm5SQ0xFZEJSU3RDTEV0QlJpOUNMRWRCUlhGRExITkRRVWd2UXl4RFFVMUJMRU5CUVVNc1YwRk9SQ3hEUVUxakxGbEJUbVE3U1VGUlFTeEpRVUZKTEVOQlFVTXNUVUZCVEN4SFFVRmpPMGxCUTJRc1RVRkJRU3hIUVVGVExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNTVUZCVkN4RFFVRmxMRXRCUVdZN1YwRkRWQ3hOUVVGTkxFTkJRVU1zV1VGQlVDeERRVUZ2UWl4RFFVRkJMRk5CUVVFc1MwRkJRVHRoUVVGQkxGTkJRVUU3VVVGRmJrSXNUVUZCVFN4RFFVRkRMRkZCUVZBc1EwRkJhVUlzWlVGQmFrSXNRMEZCYTBNc1EwRkJReXhYUVVGdVF5eERRVUZuUkN4blFrRkJhRVE3WlVGRFFTeEpRVUZKTEVOQlFVTXNSMEZEVEN4RFFVRkRMRWRCUkVRc1EwRkRUU3haUVVST0xFVkJRMjlDTEVWQlJIQkNMRU5CUlVFc1EwRkJReXhYUVVaRUxFTkJSV01zUzBGQlF5eERRVUZCTEZGQlFWRXNRMEZCUXl4SlFVWjRRaXhEUVVkQkxFTkJRVU1zU1VGSVJDeERRVWRQTEVkQlFVRXNSMEZCU1N4TFFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExGZEJTSEpDTEVOQlNVRXNRMEZCUXl4UFFVcEVMRU5CU1ZNc1IwRktWQ3hGUVVsakxGTkJRVUU3YVVKQlFVY3NRMEZCUVN4RFFVRkhMRWxCUVVnc1EwRkJVeXhEUVVGRExFMUJRVllzUTBGQlFUdFJRVUZJTEVOQlNtUTdUVUZJYlVJN1NVRkJRU3hEUVVGQkxFTkJRVUVzUTBGQlFTeEpRVUZCTEVOQlFYQkNPMFZCWmtzN08zbENRVFJDVGl4clFrRkJRU3hIUVVGdlFpeFRRVUZCTzBGQlEyNUNMRkZCUVVFN1FVRkJRVHRCUVVGQk8xTkJRVUVzYVVSQlFVRTdPMDFCUTBNc1NVRkJSeXhEUVVGSkxFbEJRVWtzUTBGQlF5eE5RVUZVTEVsQlFXOUNMRWxCUVVNc1EwRkJRU3hoUVVGRUxFTkJRV2RDTEVsQlFVa3NRMEZCUXl4RlFVRnlRaXhEUVVGMlFqdHhRa0ZEUXl4SlFVRkRMRU5CUVVFc1NVRkJSQ3hEUVVGUExFbEJRVkFzUjBGRVJEdFBRVUZCTEUxQlFVRTdOa0pCUVVFN08wRkJSRVE3TzBWQlJHMUNPenQ1UWtGUGNFSXNZVUZCUVN4SFFVRmxMRk5CUVVVc1JVRkJSanRCUVVOa0xGRkJRVUU3U1VGQlFTeEpRVUZ0UWl4blEwRkJia0k3UVVGQlFTeGhRVUZQTEV0QlFWQTdPMGxCUTBFc1NVRkJRU3hIUVVGUExFVkJRVVVzUTBGQlF5eHhRa0ZCU0N4RFFVRkJPMGxCUjFBc1YwRkJRU3hIUVVGak8wRkJRMlFzVjBGRlF5eEpRVUZKTEVOQlFVTXNSMEZCVEN4SFFVRlhMRWxCUVVrc1EwRkJReXhOUVVGb1FpeEpRVUV3UWl4RFFVRkRMRmRCUVROQ0xFbEJRME1zU1VGQlNTeERRVUZETEUxQlFVd3NSMEZCWXl4SlFVRkpMRU5CUVVNc1RVRkJia0lzU1VGQk5rSXNVVUZCVVN4RFFVRkRMRTFCUVZRc1IwRkJhMElzVjBGRWFFUXNTVUZKUXl4SlFVRkpMRU5CUVVNc1NVRkJUQ3hIUVVGWkxFbEJRVWtzUTBGQlF5eExRVUZxUWl4SlFVRXdRaXhEUVVGRExGZEJTalZDTEVsQlMwTXNTVUZCU1N4RFFVRkRMRXRCUVV3c1IwRkJZU3hKUVVGSkxFTkJRVU1zUzBGQmJFSXNTVUZCTWtJc1VVRkJVU3hEUVVGRExFdEJRVlFzUjBGQmFVSTdSVUZpYUVNN08zbENRV2xDWml4aFFVRkJMRWRCUVdVc1UwRkJRVHRKUVVOa0xFTkJRVUVzUTBGQlJ5eE5RVUZJTEVOQlFWY3NRMEZCUXl4RlFVRmFMRU5CUVdVc1VVRkJaaXhGUVVGNVFpeEpRVUZETEVOQlFVRXNORUpCUVRGQ08xZEJRMEVzT0VOQlFVRTdSVUZHWXpzN2VVSkJTV1lzWVVGQlFTeEhRVUZsTEZOQlFVRTdTVUZEWkN4RFFVRkJMRU5CUVVjc1RVRkJTQ3hEUVVGWExFTkJRVU1zUjBGQldpeERRVUZuUWl4UlFVRm9RaXhGUVVFd1FpeEpRVUZETEVOQlFVRXNORUpCUVROQ08xZEJRMEVzT0VOQlFVRTdSVUZHWXpzN2VVSkJTV1lzVDBGQlFTeEhRVUZUTEZOQlFVRTdRVUZEVWl4UlFVRkJPMEZCUVVFN1FVRkJRU3hUUVVGQkxHbEVRVUZCT3p0TlFVTkRMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zUjBGQlZDeERRVUZoTEZsQlFXSXNSVUZCTWtJc1JVRkJNMEk3UVVGRVJEdFhRVWRCTEhkRFFVRkJPMFZCU2xFN096czdSMEZxUm1sQ096dEJRWFZHTTBJc1RVRkJUU3hEUVVGRExFOUJRVkFzUjBGQmFVSWlmUT09XG4iLCJ2YXIgJCwgSG9va3MsIExhenlfTWFzb25yeSwgaW5pdF9sYXp5X2xvYWRlciwgaXNfbWFzb25yeSwgbGF6eV9pbnN0YW5jZTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbkxhenlfTWFzb25yeSA9IHJlcXVpcmUoJy4vTGF6eV9NYXNvbnJ5Jyk7XG5cbmxhenlfaW5zdGFuY2UgPSBmYWxzZTtcblxuaXNfbWFzb25yeSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gJCgnLlBQX01hc29ucnknKS5sZW5ndGggPiAwO1xufTtcblxuaW5pdF9sYXp5X2xvYWRlciA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIWlzX21hc29ucnkoKSkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAobGF6eV9pbnN0YW5jZSkge1xuICAgIGxhenlfaW5zdGFuY2UuZGVzdHJveSgpO1xuICB9XG4gIHJldHVybiBsYXp5X2luc3RhbmNlID0gbmV3IChIb29rcy5hcHBseUZpbHRlcnMoJ3BwLmxhenkuaGFuZGxlcicsIExhenlfTWFzb25yeSkpO1xufTtcblxuSG9va3MuYWRkQWN0aW9uKCdwcC5wb3J0Zm9saW8ucHJlcGFyZScsIGluaXRfbGF6eV9sb2FkZXIsIDEwMCk7XG5cbkhvb2tzLmFkZEFjdGlvbigncHAucG9ydGZvbGlvLmRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgbGF6eV9pbnN0YW5jZS5kZXN0cm95KCk7XG4gIHJldHVybiBsYXp5X2luc3RhbmNlID0gbnVsbDtcbn0pO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3BwLnBvcnRmb2xpby5yZWZyZXNoJywgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBIb29rcy5kb0FjdGlvbigncHAubGF6eS5hdXRvbG9hZCcpO1xufSk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWMzUmhjblF1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SnpkR0Z5ZEM1amIyWm1aV1VpWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFc1NVRkJRVHM3UVVGQlFTeERRVUZCTEVkQlFVa3NUMEZCUVN4RFFVRlRMRkZCUVZRN08wRkJRMG9zUzBGQlFTeEhRVUZSTEU5QlFVRXNRMEZCVXl4VlFVRlVPenRCUVVOU0xGbEJRVUVzUjBGQlpTeFBRVUZCTEVOQlFWTXNaMEpCUVZRN08wRkJSMllzWVVGQlFTeEhRVUZuUWpzN1FVRkZhRUlzVlVGQlFTeEhRVUZoTEZOQlFVRTdVMEZCUnl4RFFVRkJMRU5CUVVjc1lVRkJTQ3hEUVVGclFpeERRVUZETEUxQlFXNUNMRWRCUVRSQ08wRkJRUzlDT3p0QlFVVmlMR2RDUVVGQkxFZEJRVzFDTEZOQlFVRTdSVUZEYkVJc1NVRkJWU3hEUVVGSkxGVkJRVUVzUTBGQlFTeERRVUZrTzBGQlFVRXNWMEZCUVRzN1JVRkZRU3hKUVVGSExHRkJRVWc3U1VGRFF5eGhRVUZoTEVOQlFVTXNUMEZCWkN4RFFVRkJMRVZCUkVRN08xTkJTMEVzWVVGQlFTeEhRVUZuUWl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExGbEJRVTRzUTBGQmJVSXNhVUpCUVc1Q0xFVkJRWE5ETEZsQlFYUkRMRU5CUVVRN1FVRlNSanM3UVVGWmJrSXNTMEZCU3l4RFFVRkRMRk5CUVU0c1EwRkJaMElzYzBKQlFXaENMRVZCUVhkRExHZENRVUY0UXl4RlFVRXdSQ3hIUVVFeFJEczdRVUZEUVN4TFFVRkxMRU5CUVVNc1UwRkJUaXhEUVVGblFpeHpRa0ZCYUVJc1JVRkJkME1zVTBGQlFUdEZRVU4yUXl4aFFVRmhMRU5CUVVNc1QwRkJaQ3hEUVVGQk8xTkJRMEVzWVVGQlFTeEhRVUZuUWp0QlFVWjFRaXhEUVVGNFF6czdRVUZOUVN4TFFVRkxMRU5CUVVNc1UwRkJUaXhEUVVGblFpeHpRa0ZCYUVJc1JVRkJkME1zVTBGQlFUdFRRVU4yUXl4TFFVRkxMRU5CUVVNc1VVRkJUaXhEUVVGbExHdENRVUZtTzBGQlJIVkRMRU5CUVhoREluMD1cbiIsInZhciBIb29rcywgUG9ydGZvbGlvX0V2ZW50X01hbmFnZXI7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cblxuLypcblxuICAgICAqIEluaXRpYWxpemUgUG9ydGZvbGlvIENvcmVcblx0LS0tXG5cdFx0VXNpbmcgcDUwIEAgYHBwLmNvcmUucmVhZHlgXG5cdFx0TGF0ZSBwcmlvcml0eSBpcyBnb2luZyB0byBmb3JjZSBleHBsaWNpdCBwcmlvcml0eSBpbiBhbnkgb3RoZXIgbW92aW5nIHBhcnRzIHRoYXQgYXJlIGdvaW5nIHRvIHRvdWNoIHBvcnRmb2xpbyBsYXlvdXQgYXQgYHBwLmxvYWRlZGBcblx0LS0tXG4gKi9cblxuUG9ydGZvbGlvX0V2ZW50X01hbmFnZXIgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyKCkge31cblxuICBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlci5wcm90b3R5cGUucHJlcGFyZSA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5wb3J0Zm9saW8ucHJlcGFyZScpO1xuICB9O1xuXG4gIFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBIb29rcy5kb0FjdGlvbigncHAucG9ydGZvbGlvLmNyZWF0ZScpO1xuICB9O1xuXG4gIFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyLnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MuZG9BY3Rpb24oJ3BwLnBvcnRmb2xpby5yZWZyZXNoJyk7XG4gIH07XG5cbiAgUG9ydGZvbGlvX0V2ZW50X01hbmFnZXIucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICBIb29rcy5kb0FjdGlvbigncHAucG9ydGZvbGlvLmRlc3Ryb3knKTtcbiAgICBIb29rcy5yZW1vdmVBY3Rpb24oJ3BwLmxvYWRlZCcsIHRoaXMuY3JlYXRlLCA1MCk7XG4gIH07XG5cbiAgcmV0dXJuIFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lVRzl5ZEdadmJHbHZYMFYyWlc1MFgwMWhibUZuWlhJdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUpRYjNKMFptOXNhVzlmUlhabGJuUmZUV0Z1WVdkbGNpNWpiMlptWldVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWtGQlFVRXNTVUZCUVRzN1FVRkJRU3hMUVVGQkxFZEJRVkVzVDBGQlFTeERRVUZUTEZWQlFWUTdPenRCUVVWU096czdPenM3T3pzN1FVRlRUVHM3TzI5RFFVVk1MRTlCUVVFc1IwRkJVeXhUUVVGQk8wbEJRMUlzUzBGQlN5eERRVUZETEZGQlFVNHNRMEZCWlN4elFrRkJaanRGUVVSUk96dHZRMEZKVkN4TlFVRkJMRWRCUVZFc1UwRkJRVHRKUVVOUUxFdEJRVXNzUTBGQlF5eFJRVUZPTEVOQlFXVXNjVUpCUVdZN1JVRkVUenM3YjBOQlMxSXNUMEZCUVN4SFFVRlRMRk5CUVVFN1NVRkRVaXhMUVVGTExFTkJRVU1zVVVGQlRpeERRVUZsTEhOQ1FVRm1PMFZCUkZFN08yOURRVXRVTEU5QlFVRXNSMEZCVXl4VFFVRkJPMGxCUlZJc1MwRkJTeXhEUVVGRExGRkJRVTRzUTBGQlpTeHpRa0ZCWmp0SlFVTkJMRXRCUVVzc1EwRkJReXhaUVVGT0xFTkJRVzFDTEZkQlFXNUNMRVZCUVdkRExFbEJRVU1zUTBGQlFTeE5RVUZxUXl4RlFVRjVReXhGUVVGNlF6dEZRVWhST3pzN096czdRVUZQVml4TlFVRk5MRU5CUVVNc1QwRkJVQ3hIUVVGcFFpSjlcbiIsInZhciBIb29rcywgUG9ydGZvbGlvX0ludGVyZmFjZTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuXG4vKlxuXHRBYnN0cmFjdCBDbGFzcyBQb3J0b2ZsaW9fRXZlbnRfSW1lcGxlbWVudGF0aW9uXG5cbiAgICBIYW5kbGVzIGFsbCB0aGUgZXZlbnRzIHJlcXVpcmVkIHRvIGZ1bGx5IGhhbmRsZSBhIHBvcnRmb2xpbyBsYXlvdXQgcHJvY2Vzc1xuICovXG5cblBvcnRmb2xpb19JbnRlcmZhY2UgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIFBvcnRmb2xpb19JbnRlcmZhY2UoYXJncykge1xuICAgIHRoaXMuc2V0dXBfYWN0aW9ucygpO1xuICAgIHRoaXMuaW5pdGlhbGl6ZShhcmdzKTtcbiAgfVxuXG4gIFBvcnRmb2xpb19JbnRlcmZhY2UucHJvdG90eXBlLnNldHVwX2FjdGlvbnMgPSBmdW5jdGlvbigpIHtcbiAgICBIb29rcy5hZGRBY3Rpb24oJ3BwLnBvcnRmb2xpby5wcmVwYXJlJywgdGhpcy5wcmVwYXJlLCA1MCk7XG4gICAgSG9va3MuYWRkQWN0aW9uKCdwcC5wb3J0Zm9saW8uY3JlYXRlJywgdGhpcy5jcmVhdGUsIDUwKTtcbiAgICBIb29rcy5hZGRBY3Rpb24oJ3BwLnBvcnRmb2xpby5yZWZyZXNoJywgdGhpcy5yZWZyZXNoLCA1MCk7XG4gICAgSG9va3MuYWRkQWN0aW9uKCdwcC5wb3J0Zm9saW8uZGVzdHJveScsIHRoaXMuZGVzdHJveSwgNTApO1xuICAgIHJldHVybiBIb29rcy5hZGRBY3Rpb24oJ3BwLnBvcnRmb2xpby5kZXN0cm95JywgdGhpcy5wdXJnZV9hY3Rpb25zLCAxMDApO1xuICB9O1xuXG4gIFBvcnRmb2xpb19JbnRlcmZhY2UucHJvdG90eXBlLnB1cmdlX2FjdGlvbnMgPSBmdW5jdGlvbigpIHtcbiAgICBIb29rcy5yZW1vdmVBY3Rpb24oJ3BwLnBvcnRmb2xpby5jcmVhdGUnLCB0aGlzLnByZXBhcmUsIDUwKTtcbiAgICBIb29rcy5yZW1vdmVBY3Rpb24oJ3BwLnBvcnRmb2xpby5jcmVhdGUnLCB0aGlzLmNyZWF0ZSwgNTApO1xuICAgIEhvb2tzLnJlbW92ZUFjdGlvbigncHAucG9ydGZvbGlvLnJlZnJlc2gnLCB0aGlzLnJlZnJlc2gsIDUwKTtcbiAgICBIb29rcy5yZW1vdmVBY3Rpb24oJ3BwLnBvcnRmb2xpby5kZXN0cm95JywgdGhpcy5kZXN0cm95LCA1MCk7XG4gICAgcmV0dXJuIEhvb2tzLnJlbW92ZUFjdGlvbigncHAucG9ydGZvbGlvLmRlc3Ryb3knLCB0aGlzLnB1cmdlX2FjdGlvbnMsIDEwMCk7XG4gIH07XG5cblxuICAvKlxuICAgICBcdFJlcXVpcmUgdGhlc2UgbWV0aG9kc1xuICAgKi9cblxuICBQb3J0Zm9saW9fSW50ZXJmYWNlLnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGBpbml0aWFsaXplYCBtZXRob2RcIik7XG4gIH07XG5cbiAgUG9ydGZvbGlvX0ludGVyZmFjZS5wcm90b3R5cGUucHJlcGFyZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgcHJlcGFyZWAgbWV0aG9kXCIpO1xuICB9O1xuXG4gIFBvcnRmb2xpb19JbnRlcmZhY2UucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgY3JlYXRlYCBtZXRob2RcIik7XG4gIH07XG5cbiAgUG9ydGZvbGlvX0ludGVyZmFjZS5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgcmVmcmVzaGAgbWV0aG9kXCIpO1xuICB9O1xuXG4gIFBvcnRmb2xpb19JbnRlcmZhY2UucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYGRlc3Ryb3lgIG1ldGhvZFwiKTtcbiAgfTtcblxuICByZXR1cm4gUG9ydGZvbGlvX0ludGVyZmFjZTtcblxufSkoKTtcblxud2luZG93LlBQX01vZHVsZXMuUG9ydGZvbGlvX0ludGVyZmFjZSA9IFBvcnRmb2xpb19JbnRlcmZhY2U7XG5cbm1vZHVsZS5leHBvcnRzID0gUG9ydGZvbGlvX0ludGVyZmFjZTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVUc5eWRHWnZiR2x2WDBsdWRHVnlabUZqWlM1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJbEJ2Y25SbWIyeHBiMTlKYm5SbGNtWmhZMlV1WTI5bVptVmxJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSkJRVUZCTEVsQlFVRTdPMEZCUVVFc1MwRkJRU3hIUVVGUkxFOUJRVUVzUTBGQlV5eFZRVUZVT3pzN1FVRkhVanM3T3pzN08wRkJTMDA3UlVGRlVTdzJRa0ZCUlN4SlFVRkdPMGxCUTFvc1NVRkJReXhEUVVGQkxHRkJRVVFzUTBGQlFUdEpRVU5CTEVsQlFVTXNRMEZCUVN4VlFVRkVMRU5CUVdFc1NVRkJZanRGUVVaWk96dG5RMEZKWWl4aFFVRkJMRWRCUVdVc1UwRkJRVHRKUVVOa0xFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMSE5DUVVGb1FpeEZRVUYzUXl4SlFVRkRMRU5CUVVFc1QwRkJla01zUlVGQmEwUXNSVUZCYkVRN1NVRkRRU3hMUVVGTExFTkJRVU1zVTBGQlRpeERRVUZuUWl4eFFrRkJhRUlzUlVGQmRVTXNTVUZCUXl4RFFVRkJMRTFCUVhoRExFVkJRV2RFTEVWQlFXaEVPMGxCUTBFc1MwRkJTeXhEUVVGRExGTkJRVTRzUTBGQlowSXNjMEpCUVdoQ0xFVkJRWGRETEVsQlFVTXNRMEZCUVN4UFFVRjZReXhGUVVGclJDeEZRVUZzUkR0SlFVTkJMRXRCUVVzc1EwRkJReXhUUVVGT0xFTkJRV2RDTEhOQ1FVRm9RaXhGUVVGM1F5eEpRVUZETEVOQlFVRXNUMEZCZWtNc1JVRkJhMFFzUlVGQmJFUTdWMEZEUVN4TFFVRkxMRU5CUVVNc1UwRkJUaXhEUVVGblFpeHpRa0ZCYUVJc1JVRkJkME1zU1VGQlF5eERRVUZCTEdGQlFYcERMRVZCUVhkRUxFZEJRWGhFTzBWQlRHTTdPMmREUVU5bUxHRkJRVUVzUjBGQlpTeFRRVUZCTzBsQlEyUXNTMEZCU3l4RFFVRkRMRmxCUVU0c1EwRkJiVUlzY1VKQlFXNUNMRVZCUVRCRExFbEJRVU1zUTBGQlFTeFBRVUV6UXl4RlFVRnZSQ3hGUVVGd1JEdEpRVU5CTEV0QlFVc3NRMEZCUXl4WlFVRk9MRU5CUVcxQ0xIRkNRVUZ1UWl4RlFVRXdReXhKUVVGRExFTkJRVUVzVFVGQk0wTXNSVUZCYlVRc1JVRkJia1E3U1VGRFFTeExRVUZMTEVOQlFVTXNXVUZCVGl4RFFVRnRRaXh6UWtGQmJrSXNSVUZCTWtNc1NVRkJReXhEUVVGQkxFOUJRVFZETEVWQlFYRkVMRVZCUVhKRU8wbEJRMEVzUzBGQlN5eERRVUZETEZsQlFVNHNRMEZCYlVJc2MwSkJRVzVDTEVWQlFUSkRMRWxCUVVNc1EwRkJRU3hQUVVFMVF5eEZRVUZ4UkN4RlFVRnlSRHRYUVVOQkxFdEJRVXNzUTBGQlF5eFpRVUZPTEVOQlFXMUNMSE5DUVVGdVFpeEZRVUV5UXl4SlFVRkRMRU5CUVVFc1lVRkJOVU1zUlVGQk1rUXNSMEZCTTBRN1JVRk1ZenM3TzBGQlVXWTdPenM3WjBOQlIwRXNWVUZCUVN4SFFVRlpMRk5CUVVFN1FVRkJSeXhWUVVGVkxFbEJRVUVzUzBGQlFTeERRVUZQTEhGR1FVRlFPMFZCUVdJN08yZERRVU5hTEU5QlFVRXNSMEZCV1N4VFFVRkJPMEZCUVVjc1ZVRkJWU3hKUVVGQkxFdEJRVUVzUTBGQlR5eHJSa0ZCVUR0RlFVRmlPenRuUTBGRFdpeE5RVUZCTEVkQlFWa3NVMEZCUVR0QlFVRkhMRlZCUVZVc1NVRkJRU3hMUVVGQkxFTkJRVThzYVVaQlFWQTdSVUZCWWpzN1owTkJRMW9zVDBGQlFTeEhRVUZaTEZOQlFVRTdRVUZCUnl4VlFVRlZMRWxCUVVFc1MwRkJRU3hEUVVGUExHdEdRVUZRTzBWQlFXSTdPMmREUVVOYUxFOUJRVUVzUjBGQldTeFRRVUZCTzBGQlFVY3NWVUZCVlN4SlFVRkJMRXRCUVVFc1EwRkJUeXhyUmtGQlVEdEZRVUZpT3pzN096czdRVUZKWWl4TlFVRk5MRU5CUVVNc1ZVRkJWU3hEUVVGRExHMUNRVUZzUWl4SFFVRjNRenM3UVVGRGVFTXNUVUZCVFN4RFFVRkRMRTlCUVZBc1IwRkJhVUlpZlE9PVxuIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgJCwgSG9va3MsIFBvcnRmb2xpb19JbnRlcmZhY2UsIFBvcnRmb2xpb19NYXNvbnJ5LFxuICBiaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfSxcbiAgZXh0ZW5kID0gZnVuY3Rpb24oY2hpbGQsIHBhcmVudCkgeyBmb3IgKHZhciBrZXkgaW4gcGFyZW50KSB7IGlmIChoYXNQcm9wLmNhbGwocGFyZW50LCBrZXkpKSBjaGlsZFtrZXldID0gcGFyZW50W2tleV07IH0gZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9IGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTsgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTsgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTsgcmV0dXJuIGNoaWxkOyB9LFxuICBoYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHk7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5Qb3J0Zm9saW9fSW50ZXJmYWNlID0gcmVxdWlyZSgnLi9Qb3J0Zm9saW9fSW50ZXJmYWNlJyk7XG5cblBvcnRmb2xpb19NYXNvbnJ5ID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgZXh0ZW5kKFBvcnRmb2xpb19NYXNvbnJ5LCBzdXBlckNsYXNzKTtcblxuICBmdW5jdGlvbiBQb3J0Zm9saW9fTWFzb25yeSgpIHtcbiAgICB0aGlzLnJlZnJlc2ggPSBiaW5kKHRoaXMucmVmcmVzaCwgdGhpcyk7XG4gICAgdGhpcy5kZXN0cm95ID0gYmluZCh0aGlzLmRlc3Ryb3ksIHRoaXMpO1xuICAgIHRoaXMuY3JlYXRlID0gYmluZCh0aGlzLmNyZWF0ZSwgdGhpcyk7XG4gICAgdGhpcy5wcmVwYXJlID0gYmluZCh0aGlzLnByZXBhcmUsIHRoaXMpO1xuICAgIHJldHVybiBQb3J0Zm9saW9fTWFzb25yeS5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5FbGVtZW50cyA9IHtcbiAgICBjb250YWluZXI6ICdQUF9NYXNvbnJ5JyxcbiAgICBzaXplcjogJ1BQX01hc29ucnlfX3NpemVyJyxcbiAgICBpdGVtOiAnUFBfTWFzb25yeV9faXRlbSdcbiAgfTtcblxuXG4gIC8qXG4gIFx0XHRJbml0aWFsaXplXG4gICAqL1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuJGNvbnRhaW5lciA9ICQoXCIuXCIgKyB0aGlzLkVsZW1lbnRzLmNvbnRhaW5lcik7XG4gIH07XG5cblxuICAvKlxuICBcdFx0UHJlcGFyZSAmIEF0dGFjaCBFdmVudHNcbiAgICAgXHREb24ndCBzaG93IGFueXRoaW5nIHlldC5cbiAgXG4gIFx0XHRAY2FsbGVkIG9uIGhvb2sgYHBwLnBvcnRmb2xpby5wcmVwYXJlYFxuICAgKi9cblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUucHJlcGFyZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBtYXNvbnJ5X3NldHRpbmdzO1xuICAgIGlmICh0aGlzLiRjb250YWluZXIubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuJGNvbnRhaW5lci5hZGRDbGFzcygnUFBfSlNfX2xvYWRpbmdfbWFzb25yeScpO1xuICAgIHRoaXMubWF5YmVfY3JlYXRlX3NpemVyKCk7XG4gICAgbWFzb25yeV9zZXR0aW5ncyA9IEhvb2tzLmFwcGx5RmlsdGVycygncHAubWFzb25yeS5zZXR0aW5ncycsIHtcbiAgICAgIGl0ZW1TZWxlY3RvcjogXCIuXCIgKyB0aGlzLkVsZW1lbnRzLml0ZW0sXG4gICAgICBjb2x1bW5XaWR0aDogXCIuXCIgKyB0aGlzLkVsZW1lbnRzLnNpemVyLFxuICAgICAgZ3V0dGVyOiAwLFxuICAgICAgaW5pdExheW91dDogZmFsc2VcbiAgICB9KTtcbiAgICB0aGlzLiRjb250YWluZXIubWFzb25yeShtYXNvbnJ5X3NldHRpbmdzKTtcbiAgICByZXR1cm4gdGhpcy4kY29udGFpbmVyLm1hc29ucnkoJ29uY2UnLCAnbGF5b3V0Q29tcGxldGUnLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgX3RoaXMuJGNvbnRhaW5lci5yZW1vdmVDbGFzcygnUFBfSlNfX2xvYWRpbmdfbWFzb25yeScpLmFkZENsYXNzKCdQUF9KU19fbG9hZGluZ19jb21wbGV0ZScpO1xuICAgICAgICByZXR1cm4gSG9va3MuZG9BY3Rpb24oJ3BwLnBvcnRmb2xpby5yZWZyZXNoJyk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfTtcblxuXG4gIC8qXG4gIFx0XHRTdGFydCB0aGUgUG9ydGZvbGlvXG4gIFx0XHRAY2FsbGVkIG9uIGhvb2sgYHBwLnBvcnRmb2xpby5jcmVhdGVgXG4gICAqL1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRjb250YWluZXIubWFzb25yeSgpO1xuICB9O1xuXG5cbiAgLypcbiAgXHRcdERlc3Ryb3lcbiAgXHRcdEBjYWxsZWQgb24gaG9vayBgcHAucG9ydGZvbGlvLmRlc3Ryb3lgXG4gICAqL1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5tYXliZV9yZW1vdmVfc2l6ZXIoKTtcbiAgICBpZiAodGhpcy4kY29udGFpbmVyLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuJGNvbnRhaW5lci5tYXNvbnJ5KCdkZXN0cm95Jyk7XG4gICAgfVxuICB9O1xuXG5cbiAgLypcbiAgXHRcdFJlbG9hZCB0aGUgbGF5b3V0XG4gIFx0XHRAY2FsbGVkIG9uIGhvb2sgYHBwLnBvcnRmb2xpby5yZWZyZXNoYFxuICAgKi9cblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLiRjb250YWluZXIubWFzb25yeSgnbGF5b3V0Jyk7XG4gIH07XG5cblxuICAvKlxuICBcdFx0Q3JlYXRlIGEgc2l6ZXIgZWxlbWVudCBmb3IganF1ZXJ5LW1hc29ucnkgdG8gdXNlXG4gICAqL1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5tYXliZV9jcmVhdGVfc2l6ZXIgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5zaXplcl9kb2VzbnRfZXhpc3QoKSkge1xuICAgICAgdGhpcy5jcmVhdGVfc2l6ZXIoKTtcbiAgICB9XG4gIH07XG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLm1heWJlX3JlbW92ZV9zaXplciA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLiRjb250YWluZXIubGVuZ3RoICE9PSAxKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuJGNvbnRhaW5lci5maW5kKFwiLlwiICsgdGhpcy5FbGVtZW50cy5zaXplcikucmVtb3ZlKCk7XG4gIH07XG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLnNpemVyX2RvZXNudF9leGlzdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLiRjb250YWluZXIuZmluZChcIi5cIiArIHRoaXMuRWxlbWVudHMuc2l6ZXIpLmxlbmd0aCA9PT0gMDtcbiAgfTtcblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUuY3JlYXRlX3NpemVyID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kY29udGFpbmVyLmFwcGVuZChcIjxkaXYgY2xhc3M9XFxcIlwiICsgdGhpcy5FbGVtZW50cy5zaXplciArIFwiXFxcIj48L2Rpdj5cIik7XG4gIH07XG5cbiAgcmV0dXJuIFBvcnRmb2xpb19NYXNvbnJ5O1xuXG59KShQb3J0Zm9saW9fSW50ZXJmYWNlKTtcblxud2luZG93LlBQX01vZHVsZXMuUG9ydGZvbGlvX01hc29ucnkgPSBQb3J0Zm9saW9fTWFzb25yeTtcblxubW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW9fTWFzb25yeTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVUc5eWRHWnZiR2x2WDAxaGMyOXVjbmt1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SlFiM0owWm05c2FXOWZUV0Z6YjI1eWVTNWpiMlptWldVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWp0QlFVRkJPenM3UVVGQlFTeEpRVUZCTEdkRVFVRkJPMFZCUVVFN096czdRVUZIUVN4RFFVRkJMRWRCUVVrc1QwRkJRU3hEUVVGVExGRkJRVlE3TzBGQlEwb3NTMEZCUVN4SFFVRlJMRTlCUVVFc1EwRkJVeXhWUVVGVU96dEJRVU5TTEcxQ1FVRkJMRWRCUVhOQ0xFOUJRVUVzUTBGQlV5eDFRa0ZCVkRzN1FVRkhhRUk3T3pzN096czdPenM3T3poQ1FVVk1MRkZCUVVFc1IwRkRRenRKUVVGQkxGTkJRVUVzUlVGQlZ5eFpRVUZZTzBsQlEwRXNTMEZCUVN4RlFVRlhMRzFDUVVSWU8wbEJSVUVzU1VGQlFTeEZRVUZYTEd0Q1FVWllPenM3TzBGQlNVUTdPenM3T0VKQlIwRXNWVUZCUVN4SFFVRlpMRk5CUVVFN1YwRkRXQ3hKUVVGRExFTkJRVUVzVlVGQlJDeEhRVUZqTEVOQlFVRXNRMEZCUnl4SFFVRkJMRWRCUVVrc1NVRkJReXhEUVVGQkxGRkJRVkVzUTBGQlF5eFRRVUZxUWp0RlFVUklPenM3UVVGSFdqczdPenM3T3pzNFFrRk5RU3hQUVVGQkxFZEJRVk1zVTBGQlFUdEJRVU5TTEZGQlFVRTdTVUZCUVN4SlFVRlZMRWxCUVVNc1EwRkJRU3hWUVVGVkxFTkJRVU1zVFVGQldpeExRVUZ6UWl4RFFVRm9RenRCUVVGQkxHRkJRVUU3TzBsQlJVRXNTVUZCUXl4RFFVRkJMRlZCUVZVc1EwRkJReXhSUVVGYUxFTkJRWE5DTEhkQ1FVRjBRanRKUVVWQkxFbEJRVU1zUTBGQlFTeHJRa0ZCUkN4RFFVRkJPMGxCUjBFc1owSkJRVUVzUjBGQmJVSXNTMEZCU3l4RFFVRkRMRmxCUVU0c1EwRkJiVUlzY1VKQlFXNUNMRVZCUTJ4Q08wMUJRVUVzV1VGQlFTeEZRVUZqTEVkQlFVRXNSMEZCU1N4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExFbEJRVFZDTzAxQlEwRXNWMEZCUVN4RlFVRmpMRWRCUVVFc1IwRkJTU3hKUVVGRExFTkJRVUVzVVVGQlVTeERRVUZETEV0QlJEVkNPMDFCUlVFc1RVRkJRU3hGUVVGakxFTkJSbVE3VFVGSFFTeFZRVUZCTEVWQlFXTXNTMEZJWkR0TFFVUnJRanRKUVUxdVFpeEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRTlCUVZvc1EwRkJjVUlzWjBKQlFYSkNPMWRCUlVFc1NVRkJReXhEUVVGQkxGVkJRVlVzUTBGQlF5eFBRVUZhTEVOQlFXOUNMRTFCUVhCQ0xFVkJRVFJDTEdkQ1FVRTFRaXhGUVVFNFF5eERRVUZCTEZOQlFVRXNTMEZCUVR0aFFVRkJMRk5CUVVFN1VVRkROME1zUzBGQlF5eERRVUZCTEZWQlEwRXNRMEZCUXl4WFFVUkdMRU5CUTJVc2QwSkJSR1lzUTBGRlF5eERRVUZETEZGQlJrWXNRMEZGV1N4NVFrRkdXanRsUVUxQkxFdEJRVXNzUTBGQlF5eFJRVUZPTEVOQlFXVXNjMEpCUVdZN1RVRlFOa003U1VGQlFTeERRVUZCTEVOQlFVRXNRMEZCUVN4SlFVRkJMRU5CUVRsRE8wVkJhRUpST3pzN1FVRXdRbFE3T3pzN096aENRVWxCTEUxQlFVRXNSMEZCVVN4VFFVRkJPMGxCUTFBc1NVRkJReXhEUVVGQkxGVkJRVlVzUTBGQlF5eFBRVUZhTEVOQlFVRTdSVUZFVHpzN08wRkJTMUk3T3pzN096aENRVWxCTEU5QlFVRXNSMEZCVXl4VFFVRkJPMGxCUTFJc1NVRkJReXhEUVVGQkxHdENRVUZFTEVOQlFVRTdTVUZGUVN4SlFVRkhMRWxCUVVNc1EwRkJRU3hWUVVGVkxFTkJRVU1zVFVGQldpeEhRVUZ4UWl4RFFVRjRRanROUVVORExFbEJRVU1zUTBGQlFTeFZRVUZWTEVOQlFVTXNUMEZCV2l4RFFVRnhRaXhUUVVGeVFpeEZRVVJFT3p0RlFVaFJPenM3UVVGVlZEczdPenM3T0VKQlNVRXNUMEZCUVN4SFFVRlRMRk5CUVVFN1YwRkRVaXhKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEU5QlFWb3NRMEZCY1VJc1VVRkJja0k3UlVGRVVUczdPMEZCUzFRN096czdPRUpCUjBFc2EwSkJRVUVzUjBGQmIwSXNVMEZCUVR0SlFVTnVRaXhKUVVGdFFpeEpRVUZETEVOQlFVRXNhMEpCUVVRc1EwRkJRU3hEUVVGdVFqdE5RVUZCTEVsQlFVTXNRMEZCUVN4WlFVRkVMRU5CUVVFc1JVRkJRVHM3UlVGRWJVSTdPemhDUVVsd1FpeHJRa0ZCUVN4SFFVRnZRaXhUUVVGQk8wbEJRMjVDTEVsQlFWVXNTVUZCUXl4RFFVRkJMRlZCUVZVc1EwRkJReXhOUVVGYUxFdEJRWGRDTEVOQlFXeERPMEZCUVVFc1lVRkJRVHM3U1VGRFFTeEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRWxCUVZvc1EwRkJhMElzUjBGQlFTeEhRVUZKTEVsQlFVTXNRMEZCUVN4UlFVRlJMRU5CUVVNc1MwRkJhRU1zUTBGQmVVTXNRMEZCUXl4TlFVRXhReXhEUVVGQk8wVkJSbTFDT3pzNFFrRkxjRUlzYTBKQlFVRXNSMEZCYjBJc1UwRkJRVHRYUVVGSExFbEJRVU1zUTBGQlFTeFZRVUZWTEVOQlFVTXNTVUZCV2l4RFFVRnJRaXhIUVVGQkxFZEJRVWtzU1VGQlF5eERRVUZCTEZGQlFWRXNRMEZCUXl4TFFVRm9ReXhEUVVGNVF5eERRVUZETEUxQlFURkRMRXRCUVc5RU8wVkJRWFpFT3pzNFFrRkhjRUlzV1VGQlFTeEhRVUZqTEZOQlFVRTdTVUZEWWl4SlFVRkRMRU5CUVVFc1ZVRkJWU3hEUVVGRExFMUJRVm9zUTBGQmJVSXNaVUZCUVN4SFFVRnBRaXhKUVVGRExFTkJRVUVzVVVGQlVTeERRVUZETEV0QlFUTkNMRWRCUVdsRExGZEJRWEJFTzBWQlJHRTdPenM3UjBFMVJtbENPenRCUVdsSGFFTXNUVUZCVFN4RFFVRkRMRlZCUVZVc1EwRkJReXhwUWtGQmJFSXNSMEZCYzBNN08wRkJRM1JETEUxQlFVMHNRMEZCUXl4UFFVRlFMRWRCUVdsQ0luMD1cbiIsIlxuLypcbiAgICBEZXBlbmRlbmNpZXNcbiAqL1xudmFyICQsIEhvb2tzLCBQb3J0Zm9saW8sIFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5Qb3J0Zm9saW9fRXZlbnRfTWFuYWdlciA9IHJlcXVpcmUoJy4vUG9ydGZvbGlvX0V2ZW50X01hbmFnZXInKTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cblBvcnRmb2xpbyA9IG5ldyBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlcigpO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3BwLmNvcmUucmVhZHknLCBQb3J0Zm9saW8ucHJlcGFyZSwgNTApO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3BwLmNvcmUubG9hZGVkJywgUG9ydGZvbGlvLmNyZWF0ZSwgNTApO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3BwLmNvcmUucmVhZHknLCBmdW5jdGlvbigpIHtcbiAgdmFyIFBvcnRmb2xpb19NYXNvbnJ5O1xuICBpZiAoJCgnLlBQX01hc29ucnknKS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgUG9ydGZvbGlvX01hc29ucnkgPSByZXF1aXJlKCcuL1BvcnRmb2xpb19NYXNvbnJ5Jyk7XG4gIHJldHVybiBuZXcgUG9ydGZvbGlvX01hc29ucnkoKTtcbn0pO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2ljM1JoY25RdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUp6ZEdGeWRDNWpiMlptWldVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWp0QlFVRkJPenM3UVVGQlFTeEpRVUZCT3p0QlFVZEJMRXRCUVVFc1IwRkJVU3hQUVVGQkxFTkJRVk1zVlVGQlZEczdRVUZEVWl4MVFrRkJRU3hIUVVFd1FpeFBRVUZCTEVOQlFWTXNNa0pCUVZRN08wRkJRekZDTEVOQlFVRXNSMEZCU1N4UFFVRkJMRU5CUVZFc1VVRkJVanM3UVVGSFNpeFRRVUZCTEVkQlFXZENMRWxCUVVFc2RVSkJRVUVzUTBGQlFUczdRVUZIYUVJc1MwRkJTeXhEUVVGRExGTkJRVTRzUTBGQlowSXNaVUZCYUVJc1JVRkJhVU1zVTBGQlV5eERRVUZETEU5QlFUTkRMRVZCUVc5RUxFVkJRWEJFT3p0QlFVTkJMRXRCUVVzc1EwRkJReXhUUVVGT0xFTkJRV2RDTEdkQ1FVRm9RaXhGUVVGclF5eFRRVUZUTEVOQlFVTXNUVUZCTlVNc1JVRkJiMFFzUlVGQmNFUTdPMEZCU1VFc1MwRkJTeXhEUVVGRExGTkJRVTRzUTBGQlowSXNaVUZCYUVJc1JVRkJhVU1zVTBGQlFUdEJRVVZvUXl4TlFVRkJPMFZCUVVFc1NVRkJaMElzUTBGQlFTeERRVUZITEdGQlFVZ3NRMEZCYTBJc1EwRkJReXhOUVVGdVFpeExRVUUyUWl4RFFVRTNRenRCUVVGQkxGZEJRVThzVFVGQlVEczdSVUZGUVN4cFFrRkJRU3hIUVVGdlFpeFBRVUZCTEVOQlFWTXNjVUpCUVZRN1UwRkRhRUlzU1VGQlFTeHBRa0ZCUVN4RFFVRkJPMEZCVERSQ0xFTkJRV3BESW4wPVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
