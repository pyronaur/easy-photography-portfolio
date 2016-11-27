(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){

/*
    Load Dependencies
 */
var $, Hooks;

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);


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

require('./portfolio/index');

require('./layouts/masonry');

require('./gallery/popup');

require('./lazy/index');


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./core/Photography_Portfolio":2,"./gallery/popup":4,"./layouts/masonry":5,"./lazy/index":9,"./portfolio/index":13}],2:[function(require,module,exports){
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

},{"../lazy/Item_Data":7}],5:[function(require,module,exports){
(function (global){
var $, Hooks, Portfolio_Masonry, init_masonry, is_masonry;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Portfolio_Masonry = require('./../portfolio/Portfolio_Masonry');

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

},{"./../portfolio/Portfolio_Masonry":12}],6:[function(require,module,exports){
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

},{"../core/Window":3,"./Abstract_Lazy_Loader":6}],9:[function(require,module,exports){
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

},{"./Lazy_Masonry":8}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

module.exports = Portfolio_Interface;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],12:[function(require,module,exports){
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

})(Portfolio_Interface);

module.exports = Portfolio_Masonry;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./Portfolio_Interface":11}],13:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var Hooks, Portfolio, Portfolio_Event_Manager;

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Portfolio_Event_Manager = require('./Portfolio_Event_Manager');

Portfolio = new Portfolio_Event_Manager();

Hooks.addAction('pp.core.ready', Portfolio.prepare, 50);

Hooks.addAction('pp.core.loaded', Portfolio.create, 50);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./Portfolio_Event_Manager":10}]},{},[1])


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jb3JlL1Bob3RvZ3JhcGh5X1BvcnRmb2xpby5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY29yZS9XaW5kb3cuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvcG9wdXAuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xheW91dHMvbWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvbGF6eS9BYnN0cmFjdF9MYXp5X0xvYWRlci5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvbGF6eS9JdGVtX0RhdGEuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvTGF6eV9NYXNvbnJ5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L2luZGV4LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9wb3J0Zm9saW8vUG9ydGZvbGlvX0V2ZW50X01hbmFnZXIuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL3BvcnRmb2xpby9Qb3J0Zm9saW9fSW50ZXJmYWNlLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9wb3J0Zm9saW8vUG9ydGZvbGlvX01hc29ucnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL3BvcnRmb2xpby9pbmRleC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2xIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDeklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxuLypcbiAgICBMb2FkIERlcGVuZGVuY2llc1xuICovXG52YXIgJCwgSG9va3M7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5cbi8qXG5cdEJvb3Qgb24gYGRvY3VtZW50LnJlYWR5YFxuICovXG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICB2YXIgUGhvdG9ncmFwaHlfUG9ydGZvbGlvO1xuICBpZiAoISQoJ2JvZHknKS5oYXNDbGFzcygnUFBfUG9ydGZvbGlvJykpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgUGhvdG9ncmFwaHlfUG9ydGZvbGlvID0gbmV3IChyZXF1aXJlKCcuL2NvcmUvUGhvdG9ncmFwaHlfUG9ydGZvbGlvJykpKCk7XG4gIFBob3RvZ3JhcGh5X1BvcnRmb2xpby5yZWFkeSgpO1xufSk7XG5cblxuLypcblx0TG9hZCBBcHBcbiAqL1xuXG5yZXF1aXJlKCcuL3BvcnRmb2xpby9pbmRleCcpO1xuXG5yZXF1aXJlKCcuL2xheW91dHMvbWFzb25yeScpO1xuXG5yZXF1aXJlKCcuL2dhbGxlcnkvcG9wdXAnKTtcblxucmVxdWlyZSgnLi9sYXp5L2luZGV4Jyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVlYQndMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaVlYQndMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaU8wRkJRVUU3T3p0QlFVRkJMRWxCUVVFN08wRkJSMEVzUzBGQlFTeEhRVUZSTEU5QlFVRXNRMEZCVXl4VlFVRlVPenRCUVVOU0xFTkJRVUVzUjBGQlNTeFBRVUZCTEVOQlFWTXNVVUZCVkRzN08wRkJSMG83T3pzN1FVRkhRU3hEUVVGQkxFTkJRVWNzVVVGQlNDeERRVUZoTEVOQlFVTXNTMEZCWkN4RFFVRnZRaXhUUVVGQk8wRkJSMjVDTEUxQlFVRTdSVUZCUVN4SlFVRlZMRU5CUVVrc1EwRkJRU3hEUVVGSExFMUJRVWdzUTBGQlZ5eERRVUZETEZGQlFWb3NRMEZCYzBJc1kwRkJkRUlzUTBGQlpEdEJRVUZCTEZkQlFVRTdPMFZCUjBFc2NVSkJRVUVzUjBGQk5FSXNTVUZCUVN4RFFVRkZMRTlCUVVFc1EwRkJVeXc0UWtGQlZDeERRVUZHTEVOQlFVRXNRMEZCUVR0RlFVTTFRaXh4UWtGQmNVSXNRMEZCUXl4TFFVRjBRaXhEUVVGQk8wRkJVRzFDTEVOQlFYQkNPenM3UVVGWlFUczdPenRCUVV0QkxFOUJRVUVzUTBGQlVTeHRRa0ZCVWpzN1FVRkhRU3hQUVVGQkxFTkJRVkVzYlVKQlFWSTdPMEZCUjBFc1QwRkJRU3hEUVVGUkxHbENRVUZTT3p0QlFVZEJMRTlCUVVFc1EwRkJVU3hqUVVGU0luMD1cbiIsIlxuLypcbiAgICBEZXBlbmRlbmNpZXNcbiAqL1xudmFyICQsIENvcmUsIEhvb2tzLFxuICBiaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbkNvcmUgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIENvcmUoKSB7XG4gICAgdGhpcy5yZWFkeSA9IGJpbmQodGhpcy5yZWFkeSwgdGhpcyk7XG4gIH1cblxuICBDb3JlLnByb3RvdHlwZS5yZWFkeSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChIb29rcy5hcHBseUZpbHRlcnMoJ3BwLmNvcmUucmVhZHknLCB0cnVlKSkge1xuICAgICAgSG9va3MuZG9BY3Rpb24oJ3BwLmNvcmUucmVhZHknKTtcbiAgICB9XG4gICAgJCgnLlBQX1dyYXBwZXInKS5pbWFnZXNMb2FkZWQodGhpcy5sb2FkZWQpO1xuICB9O1xuXG4gIENvcmUucHJvdG90eXBlLmxvYWRlZCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChIb29rcy5hcHBseUZpbHRlcnMoJ3BwLmNvcmUubG9hZGVkJywgdHJ1ZSkpIHtcbiAgICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5jb3JlLmxvYWRlZCcpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gQ29yZTtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb3JlO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lVR2h2ZEc5bmNtRndhSGxmVUc5eWRHWnZiR2x2TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lVR2h2ZEc5bmNtRndhSGxmVUc5eWRHWnZiR2x2TG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lPMEZCUVVFN096dEJRVUZCTEVsQlFVRXNZMEZCUVR0RlFVRkJPenRCUVVkQkxFTkJRVUVzUjBGQlNTeFBRVUZCTEVOQlFWTXNVVUZCVkRzN1FVRkRTaXhMUVVGQkxFZEJRVkVzVDBGQlFTeERRVUZUTEZWQlFWUTdPMEZCUjBZN096czdPMmxDUVVkTUxFdEJRVUVzUjBGQlR5eFRRVUZCTzBsQlEwNHNTVUZCUnl4TFFVRkxMRU5CUVVNc1dVRkJUaXhEUVVGdlFpeGxRVUZ3UWl4RlFVRnhReXhKUVVGeVF5eERRVUZJTzAxQlEwTXNTMEZCU3l4RFFVRkRMRkZCUVU0c1EwRkJaU3hsUVVGbUxFVkJSRVE3TzBsQlNVRXNRMEZCUVN4RFFVRkhMR0ZCUVVnc1EwRkJhMElzUTBGQlF5eFpRVUZ1UWl4RFFVRnBReXhKUVVGRExFTkJRVUVzVFVGQmJFTTdSVUZNVFRzN2FVSkJWVkFzVFVGQlFTeEhRVUZSTEZOQlFVRTdTVUZEVUN4SlFVRkhMRXRCUVVzc1EwRkJReXhaUVVGT0xFTkJRVzlDTEdkQ1FVRndRaXhGUVVGelF5eEpRVUYwUXl4RFFVRklPMDFCUTBNc1MwRkJTeXhEUVVGRExGRkJRVTRzUTBGQlpTeG5Ra0ZCWml4RlFVUkVPenRGUVVSUE96czdPenM3UVVGUFZDeE5RVUZOTEVOQlFVTXNUMEZCVUN4SFFVRnBRaUo5XG4iLCJ2YXIgSG9va3MsIGdldF9zaXplO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5nZXRfc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHdpZHRoOiB3aW5kb3cuaW5uZXJXaWR0aCB8fCAkd2luZG93LndpZHRoKCksXG4gICAgaGVpZ2h0OiB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgJHdpbmRvdy5oZWlnaHQoKVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBnZXRfc2l6ZSgpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lWMmx1Wkc5M0xtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpVjJsdVpHOTNMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRU3hKUVVGQk96dEJRVUZCTEV0QlFVRXNSMEZCVVN4UFFVRkJMRU5CUVZNc1ZVRkJWRHM3UVVGSFVpeFJRVUZCTEVkQlFWY3NVMEZCUVR0VFFVTldPMGxCUVVFc1MwRkJRU3hGUVVGUkxFMUJRVTBzUTBGQlF5eFZRVUZRTEVsQlFYRkNMRTlCUVU4c1EwRkJReXhMUVVGU0xFTkJRVUVzUTBGQk4wSTdTVUZEUVN4TlFVRkJMRVZCUVZFc1RVRkJUU3hEUVVGRExGZEJRVkFzU1VGQmMwSXNUMEZCVHl4RFFVRkRMRTFCUVZJc1EwRkJRU3hEUVVRNVFqczdRVUZFVlRzN1FVRkxXQ3hOUVVGTkxFTkJRVU1zVDBGQlVDeEhRVUZwUWl4UlFVRkJMRU5CUVVFaWZRPT1cbiIsIlxuLypcbiAgICBEZXBlbmRlbmNpZXNcbiAqL1xudmFyICQsIEhvb2tzLCBJdGVtX0RhdGEsIGdldF9kYXRhO1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuSXRlbV9EYXRhID0gcmVxdWlyZSgnLi4vbGF6eS9JdGVtX0RhdGEnKTtcblxuZ2V0X2RhdGEgPSBmdW5jdGlvbihlbCkge1xuICB2YXIgJGNvbnRhaW5lciwgJGVsLCAkaXRlbXMsIGl0ZW1zO1xuICAkZWwgPSAkKGVsKTtcbiAgJGNvbnRhaW5lciA9ICRlbC5jbG9zZXN0KCcuUFBfR2FsbGVyeScpO1xuICAkaXRlbXMgPSAkY29udGFpbmVyLmZpbmQoJy5QUF9HYWxsZXJ5X19pdGVtJyk7XG4gIGl0ZW1zID0gJGl0ZW1zLm1hcChmdW5jdGlvbihrZXksIGl0ZW0pIHtcbiAgICB2YXIgaTtcbiAgICBpID0gbmV3IEl0ZW1fRGF0YSgkKGl0ZW0pKTtcbiAgICByZXR1cm4ge1xuICAgICAgc3JjOiBpLmdldF91cmwoJ2Z1bGwnKSxcbiAgICAgIHRodW1iOiBpLmdldF91cmwoJ3RodW1iJylcbiAgICB9O1xuICB9KTtcbiAgcmV0dXJuIGl0ZW1zO1xufTtcblxuXG4vKlxuICAgIEBUT0RPOiBOZWVkIGRldGFjaC9kZXN0cm95IG1ldGhvZHNcbiAqL1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3BwLmNvcmUucmVhZHknLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICQoJy5QUF9HYWxsZXJ5X19pdGVtJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgIHZhciAkZWw7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICRlbCA9ICQodGhpcyk7XG4gICAgcmV0dXJuICRlbC5saWdodEdhbGxlcnkoe1xuICAgICAgZHluYW1pYzogdHJ1ZSxcbiAgICAgIGR5bmFtaWNFbDogZ2V0X2RhdGEodGhpcyksXG4gICAgICBpbmRleDogJCgnLlBQX0dhbGxlcnlfX2l0ZW0nKS5pbmRleCgkZWwpLFxuICAgICAgc3BlZWQ6IDM1MCxcbiAgICAgIHByZWxvYWQ6IDMsXG4gICAgICBkb3dubG9hZDogZmFsc2VcbiAgICB9KTtcbiAgfSk7XG59KTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pY0c5d2RYQXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lKd2IzQjFjQzVqYjJabVpXVWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqdEJRVUZCT3pzN1FVRkJRU3hKUVVGQk96dEJRVWRCTEVOQlFVRXNSMEZCU1N4UFFVRkJMRU5CUVZNc1VVRkJWRHM3UVVGRFNpeExRVUZCTEVkQlFWRXNUMEZCUVN4RFFVRlRMRlZCUVZRN08wRkJRMUlzVTBGQlFTeEhRVUZaTEU5QlFVRXNRMEZCVXl4dFFrRkJWRHM3UVVGRldpeFJRVUZCTEVkQlFWY3NVMEZCUlN4RlFVRkdPMEZCUTFZc1RVRkJRVHRGUVVGQkxFZEJRVUVzUjBGQlRTeERRVUZCTEVOQlFVY3NSVUZCU0R0RlFVTk9MRlZCUVVFc1IwRkJZU3hIUVVGSExFTkJRVU1zVDBGQlNpeERRVUZoTEdGQlFXSTdSVUZGWWl4TlFVRkJMRWRCUVZNc1ZVRkJWU3hEUVVGRExFbEJRVmdzUTBGQmFVSXNiVUpCUVdwQ08wVkJSVlFzUzBGQlFTeEhRVUZSTEUxQlFVMHNRMEZCUXl4SFFVRlFMRU5CUVZjc1UwRkJSU3hIUVVGR0xFVkJRVThzU1VGQlVEdEJRVU5zUWl4UlFVRkJPMGxCUVVFc1EwRkJRU3hIUVVGUkxFbEJRVUVzVTBGQlFTeERRVUZYTEVOQlFVRXNRMEZCUnl4SlFVRklMRU5CUVZnN1FVRkZVaXhYUVVGUE8wMUJRMDRzUjBGQlFTeEZRVUZQTEVOQlFVTXNRMEZCUXl4UFFVRkdMRU5CUVZjc1RVRkJXQ3hEUVVSRU8wMUJSVTRzUzBGQlFTeEZRVUZQTEVOQlFVTXNRMEZCUXl4UFFVRkdMRU5CUVZjc1QwRkJXQ3hEUVVaRU96dEZRVWhYTEVOQlFWZzdRVUZUVWl4VFFVRlBPMEZCWmtjN096dEJRV2xDV0RzN096dEJRVWRCTEV0QlFVc3NRMEZCUXl4VFFVRk9MRU5CUVdkQ0xHVkJRV2hDTEVWQlFXbERMRk5CUVVFN1UwRkZhRU1zUTBGQlFTeERRVUZITEcxQ1FVRklMRU5CUVhkQ0xFTkJRVU1zUlVGQmVrSXNRMEZCTkVJc1QwRkJOVUlzUlVGQmNVTXNVMEZCUlN4RFFVRkdPMEZCUTNCRExGRkJRVUU3U1VGQlFTeERRVUZETEVOQlFVTXNZMEZCUml4RFFVRkJPMGxCUjBFc1IwRkJRU3hIUVVGTkxFTkJRVUVzUTBGQlJ5eEpRVUZJTzFkQlIwNHNSMEZCUnl4RFFVRkRMRmxCUVVvc1EwRkRRenROUVVGQkxFOUJRVUVzUlVGQlZ5eEpRVUZZTzAxQlEwRXNVMEZCUVN4RlFVRlhMRkZCUVVFc1EwRkJWU3hKUVVGV0xFTkJSRmc3VFVGRlFTeExRVUZCTEVWQlFWY3NRMEZCUVN4RFFVRkhMRzFDUVVGSUxFTkJRWGRDTEVOQlFVTXNTMEZCZWtJc1EwRkJLMElzUjBGQkwwSXNRMEZHV0R0TlFVZEJMRXRCUVVFc1JVRkJWeXhIUVVoWU8wMUJTVUVzVDBGQlFTeEZRVUZYTEVOQlNsZzdUVUZMUVN4UlFVRkJMRVZCUVZjc1MwRk1XRHRMUVVSRU8wVkJVRzlETEVOQlFYSkRPMEZCUm1kRExFTkJRV3BESW4wPVxuIiwidmFyICQsIEhvb2tzLCBQb3J0Zm9saW9fTWFzb25yeSwgaW5pdF9tYXNvbnJ5LCBpc19tYXNvbnJ5O1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuUG9ydGZvbGlvX01hc29ucnkgPSByZXF1aXJlKCcuLy4uL3BvcnRmb2xpby9Qb3J0Zm9saW9fTWFzb25yeScpO1xuXG5pc19tYXNvbnJ5ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAkKCcuUFBfTWFzb25yeScpLmxlbmd0aCA+IDA7XG59O1xuXG5cbi8qXG5cdEluaXRpYWxpemUgTWFzb25yeVxuICovXG5cbmluaXRfbWFzb25yeSA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIWlzX21hc29ucnkoKSkge1xuICAgIHJldHVybjtcbiAgfVxuICByZXR1cm4gbmV3IFBvcnRmb2xpb19NYXNvbnJ5KCQoZG9jdW1lbnQpKTtcbn07XG5cblxuLypcblx0U2V0dXAgRXZlbnRzXG4gKi9cblxuSG9va3MuYWRkQWN0aW9uKCdwcC5jb3JlLnJlYWR5JywgaW5pdF9tYXNvbnJ5KTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYldGemIyNXllUzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYkltMWhjMjl1Y25rdVkyOW1abVZsSWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUpCUVVGQkxFbEJRVUU3TzBGQlFVRXNRMEZCUVN4SFFVRkpMRTlCUVVFc1EwRkJVeXhSUVVGVU96dEJRVU5LTEV0QlFVRXNSMEZCVVN4UFFVRkJMRU5CUVZNc1ZVRkJWRHM3UVVGRFVpeHBRa0ZCUVN4SFFVRnZRaXhQUVVGQkxFTkJRVk1zYTBOQlFWUTdPMEZCUlhCQ0xGVkJRVUVzUjBGQllTeFRRVUZCTzFOQlFVY3NRMEZCUVN4RFFVRkhMR0ZCUVVnc1EwRkJhMElzUTBGQlF5eE5RVUZ1UWl4SFFVRTBRanRCUVVFdlFqczdPMEZCUjJJN096czdRVUZIUVN4WlFVRkJMRWRCUVdVc1UwRkJRVHRGUVVOa0xFbEJRVlVzUTBGQlNTeFZRVUZCTEVOQlFVRXNRMEZCWkR0QlFVRkJMRmRCUVVFN08xTkJSMGtzU1VGQlFTeHBRa0ZCUVN4RFFVRnRRaXhEUVVGQkxFTkJRVWNzVVVGQlNDeERRVUZ1UWp0QlFVcFZPenM3UVVGUlpqczdPenRCUVVkQkxFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMR1ZCUVdoQ0xFVkJRV2xETEZsQlFXcERJbjA9XG4iLCJcbi8qXG4gICAgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBIb29rcywgSXRlbV9EYXRhLCBMYXp5X0xvYWRlcjtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbkl0ZW1fRGF0YSA9IHJlcXVpcmUoJy4vSXRlbV9EYXRhJyk7XG5cbkxhenlfTG9hZGVyID0gKGZ1bmN0aW9uKCkge1xuICBMYXp5X0xvYWRlci5wcm90b3R5cGUuRWxlbWVudHMgPSB7XG4gICAgaXRlbTogJ1BQX0xhenlfSW1hZ2UnLFxuICAgIHBsYWNlaG9sZGVyOiAnUFBfTGF6eV9JbWFnZV9fcGxhY2Vob2xkZXInLFxuICAgIGxpbms6ICdQUF9KU19MYXp5X19saW5rJyxcbiAgICBpbWFnZTogJ1BQX0pTX0xhenlfX2ltYWdlJ1xuICB9O1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5JdGVtcyA9IFtdO1xuXG4gIGZ1bmN0aW9uIExhenlfTG9hZGVyKCkge1xuICAgIHRoaXMuc2V0dXBfZGF0YSgpO1xuICAgIHRoaXMucmVzaXplX2FsbCgpO1xuICAgIHRoaXMuYXR0YWNoX2V2ZW50cygpO1xuICB9XG5cblxuICAvKlxuICBcdFx0QWJzdHJhY3QgTWV0aG9kc1xuICAgKi9cblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYExhenlfTG9hZGVyYCBtdXN0IGltcGxlbWVudCBgcmVzaXplYCBtZXRob2RcIik7XG4gIH07XG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgTGF6eV9Mb2FkZXJgIG11c3QgaW1wbGVtZW50IGBsb2FkYCBtZXRob2RcIik7XG4gIH07XG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLmF1dG9sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYExhenlfTG9hZGVyYCBtdXN0IGltcGxlbWVudCBgYXV0b2xvYWRgIG1ldGhvZFwiKTtcbiAgfTtcblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUuc2V0dXBfZGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciAkaXRlbXM7XG4gICAgdGhpcy5JdGVtcyA9IFtdO1xuICAgICRpdGVtcyA9ICQoXCIuXCIgKyB0aGlzLkVsZW1lbnRzLml0ZW0pO1xuICAgICRpdGVtcy5lYWNoKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGtleSwgZWwpIHtcbiAgICAgICAgdmFyICRlbDtcbiAgICAgICAgJGVsID0gJChlbCk7XG4gICAgICAgIHJldHVybiBfdGhpcy5JdGVtcy5wdXNoKHtcbiAgICAgICAgICBlbDogZWwsXG4gICAgICAgICAgJGVsOiAkZWwsXG4gICAgICAgICAgZGF0YTogbmV3IEl0ZW1fRGF0YSgkZWwpLFxuICAgICAgICAgIGxvYWRlZDogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfTtcblxuXG4gIC8qXG4gIFx0XHRNZXRob2RzXG4gICAqL1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5yZXNpemVfYWxsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGksIGl0ZW0sIGxlbiwgcmVmLCByZXN1bHRzO1xuICAgIHJlZiA9IHRoaXMuSXRlbXM7XG4gICAgcmVzdWx0cyA9IFtdO1xuICAgIGZvciAoaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgaXRlbSA9IHJlZltpXTtcbiAgICAgIHJlc3VsdHMucHVzaCh0aGlzLnJlc2l6ZShpdGVtKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5sb2FkX2FsbCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpLCBpdGVtLCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICByZWYgPSB0aGlzLkl0ZW1zO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGl0ZW0gPSByZWZbaV07XG4gICAgICB0aGlzLmxvYWQoaXRlbSk7XG4gICAgICByZXN1bHRzLnB1c2godGhpcy5yZW1vdmVfcGxhY2Vob2xkZXIoaXRlbSkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUucmVtb3ZlX3BsYWNlaG9sZGVyID0gZnVuY3Rpb24oaXRlbSkge1xuICAgIHJldHVybiBpdGVtLiRlbC5maW5kKFwiLlwiICsgdGhpcy5FbGVtZW50cy5wbGFjZWhvbGRlciArIFwiLCBub3NjcmlwdFwiKS5yZW1vdmUoKTtcbiAgfTtcblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmRldGFjaF9ldmVudHMoKTtcbiAgfTtcblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUuYXR0YWNoX2V2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBIb29rcy5hZGRBY3Rpb24oJ3BwLmxhenkuYXV0b2xvYWQnLCB0aGlzLmF1dG9sb2FkKTtcbiAgfTtcblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUuZGV0YWNoX2V2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBIb29rcy5yZW1vdmVBY3Rpb24oJ3BwLmxhenkuYXV0b2xvYWQnLCB0aGlzLmF1dG9sb2FkKTtcbiAgfTtcblxuICByZXR1cm4gTGF6eV9Mb2FkZXI7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gTGF6eV9Mb2FkZXI7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVFXSnpkSEpoWTNSZlRHRjZlVjlNYjJGa1pYSXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lKQlluTjBjbUZqZEY5TVlYcDVYMHh2WVdSbGNpNWpiMlptWldVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWp0QlFVRkJPenM3UVVGQlFTeEpRVUZCT3p0QlFVZEJMRU5CUVVFc1IwRkJTU3hQUVVGQkxFTkJRVk1zVVVGQlZEczdRVUZEU2l4TFFVRkJMRWRCUVZFc1QwRkJRU3hEUVVGVExGVkJRVlE3TzBGQlExSXNVMEZCUVN4SFFVRlpMRTlCUVVFc1EwRkJVeXhoUVVGVU96dEJRVVZPTzNkQ1FVVk1MRkZCUVVFc1IwRkRRenRKUVVGQkxFbEJRVUVzUlVGQllTeGxRVUZpTzBsQlEwRXNWMEZCUVN4RlFVRmhMRFJDUVVSaU8wbEJSVUVzU1VGQlFTeEZRVUZoTEd0Q1FVWmlPMGxCUjBFc1MwRkJRU3hGUVVGaExHMUNRVWhpT3pzN2QwSkJTMFFzUzBGQlFTeEhRVUZQT3p0RlFVZE5MSEZDUVVGQk8wbEJRMW9zU1VGQlF5eERRVUZCTEZWQlFVUXNRMEZCUVR0SlFVTkJMRWxCUVVNc1EwRkJRU3hWUVVGRUxFTkJRVUU3U1VGRFFTeEpRVUZETEVOQlFVRXNZVUZCUkN4RFFVRkJPMFZCU0ZrN096dEJRVTFpT3pzN08zZENRVWRCTEUxQlFVRXNSMEZCVlN4VFFVRkJPMEZCUVVjc1ZVRkJWU3hKUVVGQkxFdEJRVUVzUTBGQlR5eDVSVUZCVUR0RlFVRmlPenQzUWtGRFZpeEpRVUZCTEVkQlFWVXNVMEZCUVR0QlFVRkhMRlZCUVZVc1NVRkJRU3hMUVVGQkxFTkJRVThzZFVWQlFWQTdSVUZCWWpzN2QwSkJRMVlzVVVGQlFTeEhRVUZWTEZOQlFVRTdRVUZCUnl4VlFVRlZMRWxCUVVFc1MwRkJRU3hEUVVGUExESkZRVUZRTzBWQlFXSTdPM2RDUVVkV0xGVkJRVUVzUjBGQldTeFRRVUZCTzBGQlJWZ3NVVUZCUVR0SlFVRkJMRWxCUVVNc1EwRkJRU3hMUVVGRUxFZEJRVk03U1VGRlZDeE5RVUZCTEVkQlFWTXNRMEZCUVN4RFFVRkhMRWRCUVVFc1IwRkJTU3hKUVVGRExFTkJRVUVzVVVGQlVTeERRVUZETEVsQlFXcENPMGxCUlZRc1RVRkJUU3hEUVVGRExFbEJRVkFzUTBGQldTeERRVUZCTEZOQlFVRXNTMEZCUVR0aFFVRkJMRk5CUVVVc1IwRkJSaXhGUVVGUExFVkJRVkE3UVVGRldDeFpRVUZCTzFGQlFVRXNSMEZCUVN4SFFVRk5MRU5CUVVFc1EwRkJSeXhGUVVGSU8yVkJRMDRzUzBGQlF5eERRVUZCTEV0QlFVc3NRMEZCUXl4SlFVRlFMRU5CUTBNN1ZVRkJRU3hGUVVGQkxFVkJRVkVzUlVGQlVqdFZRVU5CTEVkQlFVRXNSVUZCVVN4SFFVUlNPMVZCUlVFc1NVRkJRU3hGUVVGWkxFbEJRVUVzVTBGQlFTeERRVUZYTEVkQlFWZ3NRMEZHV2p0VlFVZEJMRTFCUVVFc1JVRkJVU3hMUVVoU08xTkJSRVE3VFVGSVZ6dEpRVUZCTEVOQlFVRXNRMEZCUVN4RFFVRkJMRWxCUVVFc1EwRkJXanRGUVU1WE96czdRVUZyUWxvN096czdkMEpCUjBFc1ZVRkJRU3hIUVVGWkxGTkJRVUU3UVVGRFdDeFJRVUZCTzBGQlFVRTdRVUZCUVR0VFFVRkJMSEZEUVVGQk96dHRRa0ZCUVN4SlFVRkRMRU5CUVVFc1RVRkJSQ3hEUVVGVExFbEJRVlE3UVVGQlFUczdSVUZFVnpzN2QwSkJSMW9zVVVGQlFTeEhRVUZWTEZOQlFVRTdRVUZEVkN4UlFVRkJPMEZCUVVFN1FVRkJRVHRUUVVGQkxIRkRRVUZCT3p0TlFVTkRMRWxCUVVNc1EwRkJRU3hKUVVGRUxFTkJRVThzU1VGQlVEdHRRa0ZEUVN4SlFVRkRMRU5CUVVFc2EwSkJRVVFzUTBGQmNVSXNTVUZCY2tJN1FVRkdSRHM3UlVGRVV6czdkMEpCUzFZc2EwSkJRVUVzUjBGQmIwSXNVMEZCUlN4SlFVRkdPMWRCUTI1Q0xFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNTVUZCVkN4RFFVRmxMRWRCUVVFc1IwRkJTU3hKUVVGRExFTkJRVUVzVVVGQlVTeERRVUZETEZkQlFXUXNSMEZCTUVJc1dVRkJla01zUTBGQmMwUXNRMEZCUXl4TlFVRjJSQ3hEUVVGQk8wVkJSRzFDT3p0M1FrRkpjRUlzVDBGQlFTeEhRVUZUTEZOQlFVRTdWMEZEVWl4SlFVRkRMRU5CUVVFc1lVRkJSQ3hEUVVGQk8wVkJSRkU3TzNkQ1FVZFVMR0ZCUVVFc1IwRkJaU3hUUVVGQk8xZEJRMlFzUzBGQlN5eERRVUZETEZOQlFVNHNRMEZCWjBJc2EwSkJRV2hDTEVWQlFXOURMRWxCUVVNc1EwRkJRU3hSUVVGeVF6dEZRVVJqT3p0M1FrRkhaaXhoUVVGQkxFZEJRV1VzVTBGQlFUdFhRVU5rTEV0QlFVc3NRMEZCUXl4WlFVRk9MRU5CUVcxQ0xHdENRVUZ1UWl4RlFVRjFReXhKUVVGRExFTkJRVUVzVVVGQmVFTTdSVUZFWXpzN096czdPMEZCUjJoQ0xFMUJRVTBzUTBGQlF5eFBRVUZRTEVkQlFXbENJbjA9XG4iLCJ2YXIgSXRlbV9EYXRhO1xuXG5JdGVtX0RhdGEgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIEl0ZW1fRGF0YSgkZWwpIHtcbiAgICB2YXIgZGF0YTtcbiAgICB0aGlzLiRlbCA9ICRlbDtcbiAgICBkYXRhID0gJGVsLmRhdGEoJ2l0ZW0nKTtcbiAgICBpZiAoIWRhdGEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkVsZW1lbnQgZG9lc24ndCBjb250YWluIGBkYXRhLWl0ZW1gIGF0dHJpYnV0ZVwiKTtcbiAgICB9XG4gICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgfVxuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X2RhdGEgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGltYWdlO1xuICAgIGltYWdlID0gdGhpcy5kYXRhWydpbWFnZXMnXVtuYW1lXTtcbiAgICBpZiAoIWltYWdlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBpbWFnZTtcbiAgfTtcblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF9zaXplID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBoZWlnaHQsIGltYWdlLCByZWYsIHNpemUsIHdpZHRoO1xuICAgIGltYWdlID0gdGhpcy5nZXRfZGF0YShuYW1lKTtcbiAgICBpZiAoIWltYWdlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHNpemUgPSBpbWFnZVsnc2l6ZSddO1xuICAgIHJlZiA9IHNpemUuc3BsaXQoJ3gnKSwgd2lkdGggPSByZWZbMF0sIGhlaWdodCA9IHJlZlsxXTtcbiAgICB3aWR0aCA9IHBhcnNlSW50KHdpZHRoKTtcbiAgICBoZWlnaHQgPSBwYXJzZUludChoZWlnaHQpO1xuICAgIHJldHVybiBbd2lkdGgsIGhlaWdodF07XG4gIH07XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfdXJsID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBpbWFnZTtcbiAgICBpbWFnZSA9IHRoaXMuZ2V0X2RhdGEobmFtZSk7XG4gICAgaWYgKCFpbWFnZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gaW1hZ2VbJ3VybCddO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X29yX2ZhbHNlID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKHRoaXMuZGF0YVtrZXldKSB7XG4gICAgICByZXR1cm4gdGhpcy5kYXRhW2tleV07XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF9yYXRpbyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldF9vcl9mYWxzZSgncmF0aW8nKTtcbiAgfTtcblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF90eXBlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0X29yX2ZhbHNlKCd0eXBlJyk7XG4gIH07XG5cbiAgcmV0dXJuIEl0ZW1fRGF0YTtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBJdGVtX0RhdGE7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVNYUmxiVjlFWVhSaExtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpU1hSbGJWOUVZWFJoTG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4SlFVRkJPenRCUVVGTk8wVkJSVkVzYlVKQlFVVXNSMEZCUmp0QlFVTmFMRkZCUVVFN1NVRkJRU3hKUVVGRExFTkJRVUVzUjBGQlJDeEhRVUZQTzBsQlExQXNTVUZCUVN4SFFVRlBMRWRCUVVjc1EwRkJReXhKUVVGS0xFTkJRVlVzVFVGQlZqdEpRVVZRTEVsQlFVY3NRMEZCU1N4SlFVRlFPMEZCUTBNc1dVRkJWU3hKUVVGQkxFdEJRVUVzUTBGQlRTd3JRMEZCVGl4RlFVUllPenRKUVVkQkxFbEJRVU1zUTBGQlFTeEpRVUZFTEVkQlFWRTdSVUZRU1RzN2MwSkJWMklzVVVGQlFTeEhRVUZWTEZOQlFVVXNTVUZCUmp0QlFVTlVMRkZCUVVFN1NVRkJRU3hMUVVGQkxFZEJRVkVzU1VGQlF5eERRVUZCTEVsQlFVMHNRMEZCUVN4UlFVRkJMRU5CUVZrc1EwRkJRU3hKUVVGQk8wbEJRek5DTEVsQlFXZENMRU5CUVVrc1MwRkJjRUk3UVVGQlFTeGhRVUZQTEUxQlFWQTdPMEZCUlVFc1YwRkJUenRGUVVwRk96dHpRa0ZOVml4UlFVRkJMRWRCUVZVc1UwRkJSU3hKUVVGR08wRkJRMVFzVVVGQlFUdEpRVUZCTEV0QlFVRXNSMEZCVVN4SlFVRkRMRU5CUVVFc1VVRkJSQ3hEUVVGWExFbEJRVmc3U1VGRFVpeEpRVUZuUWl4RFFVRkpMRXRCUVhCQ08wRkJRVUVzWVVGQlR5eE5RVUZRT3p0SlFVVkJMRWxCUVVFc1IwRkJUeXhMUVVGUExFTkJRVUVzVFVGQlFUdEpRVVZrTEUxQlFXdENMRWxCUVVrc1EwRkJReXhMUVVGTUxFTkJRVmtzUjBGQldpeERRVUZzUWl4RlFVRkRMR05CUVVRc1JVRkJVVHRKUVVWU0xFdEJRVUVzUjBGQlVTeFJRVUZCTEVOQlFWVXNTMEZCVmp0SlFVTlNMRTFCUVVFc1IwRkJVeXhSUVVGQkxFTkJRVlVzVFVGQlZqdEJRVVZVTEZkQlFVOHNRMEZCUXl4TFFVRkVMRVZCUVZFc1RVRkJVanRGUVZoRk96dHpRa0ZoVml4UFFVRkJMRWRCUVZNc1UwRkJSU3hKUVVGR08wRkJRMUlzVVVGQlFUdEpRVUZCTEV0QlFVRXNSMEZCVVN4SlFVRkRMRU5CUVVFc1VVRkJSQ3hEUVVGWExFbEJRVmc3U1VGRFVpeEpRVUZuUWl4RFFVRkpMRXRCUVhCQ08wRkJRVUVzWVVGQlR5eE5RVUZRT3p0QlFVTkJMRmRCUVU4c1MwRkJUeXhEUVVGQkxFdEJRVUU3UlVGSVRqczdjMEpCUzFRc1dVRkJRU3hIUVVGakxGTkJRVVVzUjBGQlJqdEpRVU5pTEVsQlFVY3NTVUZCUXl4RFFVRkJMRWxCUVUwc1EwRkJRU3hIUVVGQkxFTkJRVlk3UVVGRFF5eGhRVUZQTEVsQlFVTXNRMEZCUVN4SlFVRk5MRU5CUVVFc1IwRkJRU3hGUVVSbU96dEJRVVZCTEZkQlFVODdSVUZJVFRzN2MwSkJTMlFzVTBGQlFTeEhRVUZqTEZOQlFVRTdWMEZCUnl4SlFVRkRMRU5CUVVFc1dVRkJSQ3hEUVVGbExFOUJRV1k3UlVGQlNEczdjMEpCUTJRc1VVRkJRU3hIUVVGakxGTkJRVUU3VjBGQlJ5eEpRVUZETEVOQlFVRXNXVUZCUkN4RFFVRmxMRTFCUVdZN1JVRkJTRHM3T3pzN08wRkJSMllzVFVGQlRTeERRVUZETEU5QlFWQXNSMEZCYVVJaWZRPT1cbiIsInZhciAkLCBBYnN0cmFjdF9MYXp5X0xvYWRlciwgTGF6eV9NYXNvbnJ5LCBfX1dJTkRPVyxcbiAgYmluZCA9IGZ1bmN0aW9uKGZuLCBtZSl7IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7IH07IH0sXG4gIGV4dGVuZCA9IGZ1bmN0aW9uKGNoaWxkLCBwYXJlbnQpIHsgZm9yICh2YXIga2V5IGluIHBhcmVudCkgeyBpZiAoaGFzUHJvcC5jYWxsKHBhcmVudCwga2V5KSkgY2hpbGRba2V5XSA9IHBhcmVudFtrZXldOyB9IGZ1bmN0aW9uIGN0b3IoKSB7IHRoaXMuY29uc3RydWN0b3IgPSBjaGlsZDsgfSBjdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7IGNoaWxkLnByb3RvdHlwZSA9IG5ldyBjdG9yKCk7IGNoaWxkLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7IHJldHVybiBjaGlsZDsgfSxcbiAgaGFzUHJvcCA9IHt9Lmhhc093blByb3BlcnR5O1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuQWJzdHJhY3RfTGF6eV9Mb2FkZXIgPSByZXF1aXJlKCcuL0Fic3RyYWN0X0xhenlfTG9hZGVyJyk7XG5cbl9fV0lORE9XID0gcmVxdWlyZSgnLi4vY29yZS9XaW5kb3cnKTtcblxuTGF6eV9NYXNvbnJ5ID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgZXh0ZW5kKExhenlfTWFzb25yeSwgc3VwZXJDbGFzcyk7XG5cbiAgZnVuY3Rpb24gTGF6eV9NYXNvbnJ5KCkge1xuICAgIHRoaXMubG9hZF9pdGVtc19pbl92aWV3ID0gYmluZCh0aGlzLmxvYWRfaXRlbXNfaW5fdmlldywgdGhpcyk7XG4gICAgdGhpcy5hdXRvbG9hZCA9IGJpbmQodGhpcy5hdXRvbG9hZCwgdGhpcyk7XG4gICAgdGhpcy5kZWJvdW5jZWRfbG9hZF9pdGVtc19pbl92aWV3ID0gXy5kZWJvdW5jZSh0aGlzLmxvYWRfaXRlbXNfaW5fdmlldywgNTApO1xuICAgIExhenlfTWFzb25yeS5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzKTtcbiAgfVxuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24oaXRlbSkge1xuICAgIHJldHVybiBpdGVtLiRlbC5jc3Moe1xuICAgICAgJ21pbi1oZWlnaHQnOiBNYXRoLmZsb29yKHRoaXMuZ2V0X3dpZHRoKCkgLyBpdGVtLmRhdGEuZ2V0X3JhdGlvKCkpXG4gICAgfSk7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5nZXRfd2lkdGggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJCgnLlBQX01hc29ucnlfX3NpemVyJykud2lkdGgoKTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmF1dG9sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMubG9hZF9pdGVtc19pbl92aWV3KCk7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24oaXRlbSkge1xuICAgIHZhciAkaW1hZ2UsIGZ1bGwsIHRodW1iO1xuICAgIHRodW1iID0gaXRlbS5kYXRhLmdldF91cmwoJ3RodW1iJyk7XG4gICAgZnVsbCA9IGl0ZW0uZGF0YS5nZXRfdXJsKCdmdWxsJyk7XG4gICAgaXRlbS4kZWwucHJlcGVuZChcIjxhIGNsYXNzPVxcXCJcIiArIHRoaXMuRWxlbWVudHMubGluayArIFwiXFxcIiBocmVmPVxcXCJcIiArIGZ1bGwgKyBcIlxcXCIgcmVsPVxcXCJnYWxsZXJ5XFxcIj5cXG48aW1nIGNsYXNzPVxcXCJcIiArIHRoaXMuRWxlbWVudHMuaW1hZ2UgKyBcIlxcXCIgc3JjPVxcXCJcIiArIHRodW1iICsgXCJcXFwiIGNsYXNzPVxcXCJQUF9KU19fbG9hZGluZ1xcXCIgLz5cXG48L2E+XCIpLnJlbW92ZUNsYXNzKCdMYXp5LUltYWdlJyk7XG4gICAgaXRlbS5sb2FkZWQgPSB0cnVlO1xuICAgICRpbWFnZSA9IGl0ZW0uJGVsLmZpbmQoJ2ltZycpO1xuICAgIHJldHVybiAkaW1hZ2UuaW1hZ2VzTG9hZGVkKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAkaW1hZ2UuYWRkQ2xhc3MoJ1BQX0pTX19sb2FkZWQnKS5yZW1vdmVDbGFzcygnUFBfSlNfX2xvYWRpbmcnKTtcbiAgICAgICAgcmV0dXJuIGl0ZW0uJGVsLmNzcygnbWluLWhlaWdodCcsICcnKS5yZW1vdmVDbGFzcyhfdGhpcy5FbGVtZW50cy5pdGVtKS5maW5kKFwiLlwiICsgX3RoaXMuRWxlbWVudHMucGxhY2Vob2xkZXIpLmZhZGVPdXQoNDAwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gJCh0aGlzKS5yZW1vdmUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmxvYWRfaXRlbXNfaW5fdmlldyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpLCBpdGVtLCBrZXksIGxlbiwgcmVmLCByZXN1bHRzO1xuICAgIHJlZiA9IHRoaXMuSXRlbXM7XG4gICAgcmVzdWx0cyA9IFtdO1xuICAgIGZvciAoa2V5ID0gaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGtleSA9ICsraSkge1xuICAgICAgaXRlbSA9IHJlZltrZXldO1xuICAgICAgaWYgKCFpdGVtLmxvYWRlZCAmJiB0aGlzLmluX2xvb3NlX3ZpZXcoaXRlbS5lbCkpIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMubG9hZChpdGVtKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHRzLnB1c2godm9pZCAwKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5pbl9sb29zZV92aWV3ID0gZnVuY3Rpb24oZWwpIHtcbiAgICB2YXIgcmVjdCwgc2Vuc2l0aXZpdHk7XG4gICAgaWYgKGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHNlbnNpdGl2aXR5ID0gMTAwO1xuICAgIHJldHVybiByZWN0LnRvcCArIHJlY3QuaGVpZ2h0ID49IC1zZW5zaXRpdml0eSAmJiByZWN0LmJvdHRvbSAtIHJlY3QuaGVpZ2h0IDw9IF9fV0lORE9XLmhlaWdodCArIHNlbnNpdGl2aXR5ICYmIHJlY3QubGVmdCArIHJlY3Qud2lkdGggPj0gLXNlbnNpdGl2aXR5ICYmIHJlY3QucmlnaHQgLSByZWN0LndpZHRoIDw9IF9fV0lORE9XLndpZHRoICsgc2Vuc2l0aXZpdHk7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5hdHRhY2hfZXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgJCh3aW5kb3cpLm9uKCdzY3JvbGwnLCB0aGlzLmRlYm91bmNlZF9sb2FkX2l0ZW1zX2luX3ZpZXcpO1xuICAgIHJldHVybiBMYXp5X01hc29ucnkuX19zdXBlcl9fLmF0dGFjaF9ldmVudHMuY2FsbCh0aGlzKTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmRldGFjaF9ldmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAkKHdpbmRvdykub2ZmKCdzY3JvbGwnLCB0aGlzLmRlYm91bmNlZF9sb2FkX2l0ZW1zX2luX3ZpZXcpO1xuICAgIHJldHVybiBMYXp5X01hc29ucnkuX19zdXBlcl9fLmRldGFjaF9ldmVudHMuY2FsbCh0aGlzKTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaSwgaXRlbSwga2V5LCBsZW4sIHJlZjtcbiAgICByZWYgPSB0aGlzLkl0ZW1zO1xuICAgIGZvciAoa2V5ID0gaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGtleSA9ICsraSkge1xuICAgICAgaXRlbSA9IHJlZltrZXldO1xuICAgICAgaXRlbS4kZWwuY3NzKCdtaW4taGVpZ2h0JywgJycpO1xuICAgIH1cbiAgICByZXR1cm4gTGF6eV9NYXNvbnJ5Ll9fc3VwZXJfXy5kZXN0cm95LmNhbGwodGhpcyk7XG4gIH07XG5cbiAgcmV0dXJuIExhenlfTWFzb25yeTtcblxufSkoQWJzdHJhY3RfTGF6eV9Mb2FkZXIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExhenlfTWFzb25yeTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVEdGNmVWOU5ZWE52Ym5KNUxtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpVEdGNmVWOU5ZWE52Ym5KNUxtTnZabVpsWlNKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeEpRVUZCTEN0RFFVRkJPMFZCUVVFN096czdRVUZCUVN4RFFVRkJMRWRCUVVrc1QwRkJRU3hEUVVGVExGRkJRVlE3TzBGQlEwb3NiMEpCUVVFc1IwRkJkVUlzVDBGQlFTeERRVUZUTEhkQ1FVRlVPenRCUVVOMlFpeFJRVUZCTEVkQlFWY3NUMEZCUVN4RFFVRlRMR2RDUVVGVU96dEJRVVZNT3pzN1JVRkZVU3h6UWtGQlFUczdPMGxCUTFvc1NVRkJReXhEUVVGQkxEUkNRVUZFTEVkQlFXZERMRU5CUVVNc1EwRkJReXhSUVVGR0xFTkJRVmtzU1VGQlF5eERRVUZCTEd0Q1FVRmlMRVZCUVdsRExFVkJRV3BETzBsQlEyaERMRFJEUVVGQk8wVkJSbGs3TzNsQ1FVdGlMRTFCUVVFc1IwRkJVU3hUUVVGRkxFbEJRVVk3VjBGRFVDeEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRWRCUVZRc1EwRkJZVHROUVVGQkxGbEJRVUVzUlVGQll5eEpRVUZKTEVOQlFVTXNTMEZCVEN4RFFVRlpMRWxCUVVNc1EwRkJRU3hUUVVGRUxFTkJRVUVzUTBGQlFTeEhRVUZsTEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1UwRkJWaXhEUVVGQkxFTkJRVE5DTEVOQlFXUTdTMEZCWWp0RlFVUlBPenQ1UWtGSlVpeFRRVUZCTEVkQlFWY3NVMEZCUVR0WFFVVldMRU5CUVVFc1EwRkJSeXh2UWtGQlNDeERRVUY1UWl4RFFVRkRMRXRCUVRGQ0xFTkJRVUU3UlVGR1ZUczdlVUpCVFZnc1VVRkJRU3hIUVVGVkxGTkJRVUU3VjBGQlJ5eEpRVUZETEVOQlFVRXNhMEpCUVVRc1EwRkJRVHRGUVVGSU96dDVRa0ZKVml4SlFVRkJMRWRCUVUwc1UwRkJSU3hKUVVGR08wRkJSVXdzVVVGQlFUdEpRVUZCTEV0QlFVRXNSMEZCVVN4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFOUJRVllzUTBGQmJVSXNUMEZCYmtJN1NVRkRVaXhKUVVGQkxFZEJRVThzU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4UFFVRldMRU5CUVcxQ0xFMUJRVzVDTzBsQlJWQXNTVUZCU1N4RFFVRkRMRWRCUTB3c1EwRkJReXhQUVVSRUxFTkJRMVVzWVVGQlFTeEhRVU5KTEVsQlFVTXNRMEZCUVN4UlFVRlJMRU5CUVVNc1NVRkVaQ3hIUVVOdFFpeFpRVVJ1UWl4SFFVTTJRaXhKUVVRM1FpeEhRVU5yUXl4dlEwRkViRU1zUjBGRlRTeEpRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRXRCUm1oQ0xFZEJSWE5DTEZkQlJuUkNMRWRCUlN0Q0xFdEJSaTlDTEVkQlJYRkRMSE5EUVVndlF5eERRVTFCTEVOQlFVTXNWMEZPUkN4RFFVMWpMRmxCVG1RN1NVRlJRU3hKUVVGSkxFTkJRVU1zVFVGQlRDeEhRVUZqTzBsQlEyUXNUVUZCUVN4SFFVRlRMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zU1VGQlZDeERRVUZsTEV0QlFXWTdWMEZEVkN4TlFVRk5MRU5CUVVNc1dVRkJVQ3hEUVVGdlFpeERRVUZCTEZOQlFVRXNTMEZCUVR0aFFVRkJMRk5CUVVFN1VVRkZia0lzVFVGQlRTeERRVUZETEZGQlFWQXNRMEZCYVVJc1pVRkJha0lzUTBGQmEwTXNRMEZCUXl4WFFVRnVReXhEUVVGblJDeG5Ra0ZCYUVRN1pVRkRRU3hKUVVGSkxFTkJRVU1zUjBGRFRDeERRVUZETEVkQlJFUXNRMEZEVFN4WlFVUk9MRVZCUTI5Q0xFVkJSSEJDTEVOQlJVRXNRMEZCUXl4WFFVWkVMRU5CUldNc1MwRkJReXhEUVVGQkxGRkJRVkVzUTBGQlF5eEpRVVo0UWl4RFFVZEJMRU5CUVVNc1NVRklSQ3hEUVVkUExFZEJRVUVzUjBGQlNTeExRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRmRCU0hKQ0xFTkJTVUVzUTBGQlF5eFBRVXBFTEVOQlNWTXNSMEZLVkN4RlFVbGpMRk5CUVVFN2FVSkJRVWNzUTBGQlFTeERRVUZITEVsQlFVZ3NRMEZCVXl4RFFVRkRMRTFCUVZZc1EwRkJRVHRSUVVGSUxFTkJTbVE3VFVGSWJVSTdTVUZCUVN4RFFVRkJMRU5CUVVFc1EwRkJRU3hKUVVGQkxFTkJRWEJDTzBWQlprczdPM2xDUVRSQ1RpeHJRa0ZCUVN4SFFVRnZRaXhUUVVGQk8wRkJRMjVDTEZGQlFVRTdRVUZCUVR0QlFVRkJPMU5CUVVFc2FVUkJRVUU3TzAxQlEwTXNTVUZCUnl4RFFVRkpMRWxCUVVrc1EwRkJReXhOUVVGVUxFbEJRVzlDTEVsQlFVTXNRMEZCUVN4aFFVRkVMRU5CUVdkQ0xFbEJRVWtzUTBGQlF5eEZRVUZ5UWl4RFFVRjJRanR4UWtGRFF5eEpRVUZETEVOQlFVRXNTVUZCUkN4RFFVRlBMRWxCUVZBc1IwRkVSRHRQUVVGQkxFMUJRVUU3TmtKQlFVRTdPMEZCUkVRN08wVkJSRzFDT3p0NVFrRlBjRUlzWVVGQlFTeEhRVUZsTEZOQlFVVXNSVUZCUmp0QlFVTmtMRkZCUVVFN1NVRkJRU3hKUVVGdFFpeG5RMEZCYmtJN1FVRkJRU3hoUVVGUExFdEJRVkE3TzBsQlEwRXNTVUZCUVN4SFFVRlBMRVZCUVVVc1EwRkJReXh4UWtGQlNDeERRVUZCTzBsQlIxQXNWMEZCUVN4SFFVRmpPMEZCUTJRc1YwRkZReXhKUVVGSkxFTkJRVU1zUjBGQlRDeEhRVUZYTEVsQlFVa3NRMEZCUXl4TlFVRm9RaXhKUVVFd1FpeERRVUZETEZkQlFUTkNMRWxCUTBNc1NVRkJTU3hEUVVGRExFMUJRVXdzUjBGQll5eEpRVUZKTEVOQlFVTXNUVUZCYmtJc1NVRkJOa0lzVVVGQlVTeERRVUZETEUxQlFWUXNSMEZCYTBJc1YwRkVhRVFzU1VGSlF5eEpRVUZKTEVOQlFVTXNTVUZCVEN4SFFVRlpMRWxCUVVrc1EwRkJReXhMUVVGcVFpeEpRVUV3UWl4RFFVRkRMRmRCU2pWQ0xFbEJTME1zU1VGQlNTeERRVUZETEV0QlFVd3NSMEZCWVN4SlFVRkpMRU5CUVVNc1MwRkJiRUlzU1VGQk1rSXNVVUZCVVN4RFFVRkRMRXRCUVZRc1IwRkJhVUk3UlVGaWFFTTdPM2xDUVdsQ1ppeGhRVUZCTEVkQlFXVXNVMEZCUVR0SlFVTmtMRU5CUVVFc1EwRkJSeXhOUVVGSUxFTkJRVmNzUTBGQlF5eEZRVUZhTEVOQlFXVXNVVUZCWml4RlFVRjVRaXhKUVVGRExFTkJRVUVzTkVKQlFURkNPMWRCUTBFc09FTkJRVUU3UlVGR1l6czdlVUpCU1dZc1lVRkJRU3hIUVVGbExGTkJRVUU3U1VGRFpDeERRVUZCTEVOQlFVY3NUVUZCU0N4RFFVRlhMRU5CUVVNc1IwRkJXaXhEUVVGblFpeFJRVUZvUWl4RlFVRXdRaXhKUVVGRExFTkJRVUVzTkVKQlFUTkNPMWRCUTBFc09FTkJRVUU3UlVGR1l6czdlVUpCU1dZc1QwRkJRU3hIUVVGVExGTkJRVUU3UVVGRFVpeFJRVUZCTzBGQlFVRTdRVUZCUVN4VFFVRkJMR2xFUVVGQk96dE5RVU5ETEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1IwRkJWQ3hEUVVGaExGbEJRV0lzUlVGQk1rSXNSVUZCTTBJN1FVRkVSRHRYUVVkQkxIZERRVUZCTzBWQlNsRTdPenM3UjBGcVJtbENPenRCUVhWR00wSXNUVUZCVFN4RFFVRkRMRTlCUVZBc1IwRkJhVUlpZlE9PVxuIiwidmFyICQsIEhvb2tzLCBMYXp5X01hc29ucnksIGluaXRfbGF6eV9sb2FkZXIsIGlzX21hc29ucnksIGxhenlfaW5zdGFuY2U7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5MYXp5X01hc29ucnkgPSByZXF1aXJlKCcuL0xhenlfTWFzb25yeScpO1xuXG5sYXp5X2luc3RhbmNlID0gZmFsc2U7XG5cbmlzX21hc29ucnkgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICQoJy5QUF9NYXNvbnJ5JykubGVuZ3RoID4gMDtcbn07XG5cbmluaXRfbGF6eV9sb2FkZXIgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCFpc19tYXNvbnJ5KCkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGxhenlfaW5zdGFuY2UpIHtcbiAgICBsYXp5X2luc3RhbmNlLmRlc3Ryb3koKTtcbiAgfVxuICByZXR1cm4gbGF6eV9pbnN0YW5jZSA9IG5ldyAoSG9va3MuYXBwbHlGaWx0ZXJzKCdwcC5sYXp5LmhhbmRsZXInLCBMYXp5X01hc29ucnkpKTtcbn07XG5cbkhvb2tzLmFkZEFjdGlvbigncHAucG9ydGZvbGlvLnByZXBhcmUnLCBpbml0X2xhenlfbG9hZGVyLCAxMDApO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3BwLnBvcnRmb2xpby5kZXN0cm95JywgZnVuY3Rpb24oKSB7XG4gIGxhenlfaW5zdGFuY2UuZGVzdHJveSgpO1xuICByZXR1cm4gbGF6eV9pbnN0YW5jZSA9IG51bGw7XG59KTtcblxuSG9va3MuYWRkQWN0aW9uKCdwcC5wb3J0Zm9saW8ucmVmcmVzaCcsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4gSG9va3MuZG9BY3Rpb24oJ3BwLmxhenkuYXV0b2xvYWQnKTtcbn0pO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lhVzVrWlhndWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUpwYm1SbGVDNWpiMlptWldVaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWtGQlFVRXNTVUZCUVRzN1FVRkJRU3hEUVVGQkxFZEJRVWtzVDBGQlFTeERRVUZUTEZGQlFWUTdPMEZCUTBvc1MwRkJRU3hIUVVGUkxFOUJRVUVzUTBGQlV5eFZRVUZVT3p0QlFVTlNMRmxCUVVFc1IwRkJaU3hQUVVGQkxFTkJRVk1zWjBKQlFWUTdPMEZCUjJZc1lVRkJRU3hIUVVGblFqczdRVUZGYUVJc1ZVRkJRU3hIUVVGaExGTkJRVUU3VTBGQlJ5eERRVUZCTEVOQlFVY3NZVUZCU0N4RFFVRnJRaXhEUVVGRExFMUJRVzVDTEVkQlFUUkNPMEZCUVM5Q096dEJRVVZpTEdkQ1FVRkJMRWRCUVcxQ0xGTkJRVUU3UlVGRGJFSXNTVUZCVlN4RFFVRkpMRlZCUVVFc1EwRkJRU3hEUVVGa08wRkJRVUVzVjBGQlFUczdSVUZGUVN4SlFVRkhMR0ZCUVVnN1NVRkRReXhoUVVGaExFTkJRVU1zVDBGQlpDeERRVUZCTEVWQlJFUTdPMU5CUzBFc1lVRkJRU3hIUVVGblFpeEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRmxCUVU0c1EwRkJiVUlzYVVKQlFXNUNMRVZCUVhORExGbEJRWFJETEVOQlFVUTdRVUZTUmpzN1FVRlpia0lzUzBGQlN5eERRVUZETEZOQlFVNHNRMEZCWjBJc2MwSkJRV2hDTEVWQlFYZERMR2RDUVVGNFF5eEZRVUV3UkN4SFFVRXhSRHM3UVVGRFFTeExRVUZMTEVOQlFVTXNVMEZCVGl4RFFVRm5RaXh6UWtGQmFFSXNSVUZCZDBNc1UwRkJRVHRGUVVOMlF5eGhRVUZoTEVOQlFVTXNUMEZCWkN4RFFVRkJPMU5CUTBFc1lVRkJRU3hIUVVGblFqdEJRVVoxUWl4RFFVRjRRenM3UVVGTlFTeExRVUZMTEVOQlFVTXNVMEZCVGl4RFFVRm5RaXh6UWtGQmFFSXNSVUZCZDBNc1UwRkJRVHRUUVVOMlF5eExRVUZMTEVOQlFVTXNVVUZCVGl4RFFVRmxMR3RDUVVGbU8wRkJSSFZETEVOQlFYaERJbjA9XG4iLCJ2YXIgSG9va3MsIFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5cbi8qXG5cbiAgICAgKiBJbml0aWFsaXplIFBvcnRmb2xpbyBDb3JlXG5cdC0tLVxuXHRcdFVzaW5nIHA1MCBAIGBwcC5jb3JlLnJlYWR5YFxuXHRcdExhdGUgcHJpb3JpdHkgaXMgZ29pbmcgdG8gZm9yY2UgZXhwbGljaXQgcHJpb3JpdHkgaW4gYW55IG90aGVyIG1vdmluZyBwYXJ0cyB0aGF0IGFyZSBnb2luZyB0byB0b3VjaCBwb3J0Zm9saW8gbGF5b3V0IGF0IGBwcC5sb2FkZWRgXG5cdC0tLVxuICovXG5cblBvcnRmb2xpb19FdmVudF9NYW5hZ2VyID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlcigpIHt9XG5cbiAgUG9ydGZvbGlvX0V2ZW50X01hbmFnZXIucHJvdG90eXBlLnByZXBhcmUgPSBmdW5jdGlvbigpIHtcbiAgICBIb29rcy5kb0FjdGlvbigncHAucG9ydGZvbGlvLnByZXBhcmUnKTtcbiAgfTtcblxuICBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlci5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MuZG9BY3Rpb24oJ3BwLnBvcnRmb2xpby5jcmVhdGUnKTtcbiAgfTtcblxuICBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlci5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5wb3J0Zm9saW8ucmVmcmVzaCcpO1xuICB9O1xuXG4gIFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MuZG9BY3Rpb24oJ3BwLnBvcnRmb2xpby5kZXN0cm95Jyk7XG4gICAgSG9va3MucmVtb3ZlQWN0aW9uKCdwcC5sb2FkZWQnLCB0aGlzLmNyZWF0ZSwgNTApO1xuICB9O1xuXG4gIHJldHVybiBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlcjtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlcjtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVUc5eWRHWnZiR2x2WDBWMlpXNTBYMDFoYm1GblpYSXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lKUWIzSjBabTlzYVc5ZlJYWmxiblJmVFdGdVlXZGxjaTVqYjJabVpXVWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklrRkJRVUVzU1VGQlFUczdRVUZCUVN4TFFVRkJMRWRCUVZFc1QwRkJRU3hEUVVGVExGVkJRVlE3T3p0QlFVVlNPenM3T3pzN096czdRVUZUVFRzN08yOURRVVZNTEU5QlFVRXNSMEZCVXl4VFFVRkJPMGxCUTFJc1MwRkJTeXhEUVVGRExGRkJRVTRzUTBGQlpTeHpRa0ZCWmp0RlFVUlJPenR2UTBGSlZDeE5RVUZCTEVkQlFWRXNVMEZCUVR0SlFVTlFMRXRCUVVzc1EwRkJReXhSUVVGT0xFTkJRV1VzY1VKQlFXWTdSVUZFVHpzN2IwTkJTMUlzVDBGQlFTeEhRVUZUTEZOQlFVRTdTVUZEVWl4TFFVRkxMRU5CUVVNc1VVRkJUaXhEUVVGbExITkNRVUZtTzBWQlJGRTdPMjlEUVV0VUxFOUJRVUVzUjBGQlV5eFRRVUZCTzBsQlJWSXNTMEZCU3l4RFFVRkRMRkZCUVU0c1EwRkJaU3h6UWtGQlpqdEpRVU5CTEV0QlFVc3NRMEZCUXl4WlFVRk9MRU5CUVcxQ0xGZEJRVzVDTEVWQlFXZERMRWxCUVVNc1EwRkJRU3hOUVVGcVF5eEZRVUY1UXl4RlFVRjZRenRGUVVoUk96czdPenM3UVVGUFZpeE5RVUZOTEVOQlFVTXNUMEZCVUN4SFFVRnBRaUo5XG4iLCJ2YXIgSG9va3MsIFBvcnRmb2xpb19JbnRlcmZhY2U7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cblxuLypcblx0QWJzdHJhY3QgQ2xhc3MgUG9ydG9mbGlvX0V2ZW50X0ltZXBsZW1lbnRhdGlvblxuXG4gICAgSGFuZGxlcyBhbGwgdGhlIGV2ZW50cyByZXF1aXJlZCB0byBmdWxseSBoYW5kbGUgYSBwb3J0Zm9saW8gbGF5b3V0IHByb2Nlc3NcbiAqL1xuXG5Qb3J0Zm9saW9fSW50ZXJmYWNlID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBQb3J0Zm9saW9fSW50ZXJmYWNlKGFyZ3MpIHtcbiAgICB0aGlzLnNldHVwX2FjdGlvbnMoKTtcbiAgICB0aGlzLmluaXRpYWxpemUoYXJncyk7XG4gIH1cblxuICBQb3J0Zm9saW9fSW50ZXJmYWNlLnByb3RvdHlwZS5zZXR1cF9hY3Rpb25zID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MuYWRkQWN0aW9uKCdwcC5wb3J0Zm9saW8ucHJlcGFyZScsIHRoaXMucHJlcGFyZSwgNTApO1xuICAgIEhvb2tzLmFkZEFjdGlvbigncHAucG9ydGZvbGlvLmNyZWF0ZScsIHRoaXMuY3JlYXRlLCA1MCk7XG4gICAgSG9va3MuYWRkQWN0aW9uKCdwcC5wb3J0Zm9saW8ucmVmcmVzaCcsIHRoaXMucmVmcmVzaCwgNTApO1xuICAgIEhvb2tzLmFkZEFjdGlvbigncHAucG9ydGZvbGlvLmRlc3Ryb3knLCB0aGlzLmRlc3Ryb3ksIDUwKTtcbiAgICByZXR1cm4gSG9va3MuYWRkQWN0aW9uKCdwcC5wb3J0Zm9saW8uZGVzdHJveScsIHRoaXMucHVyZ2VfYWN0aW9ucywgMTAwKTtcbiAgfTtcblxuICBQb3J0Zm9saW9fSW50ZXJmYWNlLnByb3RvdHlwZS5wdXJnZV9hY3Rpb25zID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MucmVtb3ZlQWN0aW9uKCdwcC5wb3J0Zm9saW8uY3JlYXRlJywgdGhpcy5wcmVwYXJlLCA1MCk7XG4gICAgSG9va3MucmVtb3ZlQWN0aW9uKCdwcC5wb3J0Zm9saW8uY3JlYXRlJywgdGhpcy5jcmVhdGUsIDUwKTtcbiAgICBIb29rcy5yZW1vdmVBY3Rpb24oJ3BwLnBvcnRmb2xpby5yZWZyZXNoJywgdGhpcy5yZWZyZXNoLCA1MCk7XG4gICAgSG9va3MucmVtb3ZlQWN0aW9uKCdwcC5wb3J0Zm9saW8uZGVzdHJveScsIHRoaXMuZGVzdHJveSwgNTApO1xuICAgIHJldHVybiBIb29rcy5yZW1vdmVBY3Rpb24oJ3BwLnBvcnRmb2xpby5kZXN0cm95JywgdGhpcy5wdXJnZV9hY3Rpb25zLCAxMDApO1xuICB9O1xuXG5cbiAgLypcbiAgICAgXHRSZXF1aXJlIHRoZXNlIG1ldGhvZHNcbiAgICovXG5cbiAgUG9ydGZvbGlvX0ludGVyZmFjZS5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgaW5pdGlhbGl6ZWAgbWV0aG9kXCIpO1xuICB9O1xuXG4gIFBvcnRmb2xpb19JbnRlcmZhY2UucHJvdG90eXBlLnByZXBhcmUgPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYHByZXBhcmVgIG1ldGhvZFwiKTtcbiAgfTtcblxuICBQb3J0Zm9saW9fSW50ZXJmYWNlLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYGNyZWF0ZWAgbWV0aG9kXCIpO1xuICB9O1xuXG4gIFBvcnRmb2xpb19JbnRlcmZhY2UucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYHJlZnJlc2hgIG1ldGhvZFwiKTtcbiAgfTtcblxuICBQb3J0Zm9saW9fSW50ZXJmYWNlLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGBkZXN0cm95YCBtZXRob2RcIik7XG4gIH07XG5cbiAgcmV0dXJuIFBvcnRmb2xpb19JbnRlcmZhY2U7XG5cbn0pKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gUG9ydGZvbGlvX0ludGVyZmFjZTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVUc5eWRHWnZiR2x2WDBsdWRHVnlabUZqWlM1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJbEJ2Y25SbWIyeHBiMTlKYm5SbGNtWmhZMlV1WTI5bVptVmxJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSkJRVUZCTEVsQlFVRTdPMEZCUVVFc1MwRkJRU3hIUVVGUkxFOUJRVUVzUTBGQlV5eFZRVUZVT3pzN1FVRkhVanM3T3pzN08wRkJTMDA3UlVGRlVTdzJRa0ZCUlN4SlFVRkdPMGxCUTFvc1NVRkJReXhEUVVGQkxHRkJRVVFzUTBGQlFUdEpRVU5CTEVsQlFVTXNRMEZCUVN4VlFVRkVMRU5CUVdFc1NVRkJZanRGUVVaWk96dG5RMEZKWWl4aFFVRkJMRWRCUVdVc1UwRkJRVHRKUVVOa0xFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMSE5DUVVGb1FpeEZRVUYzUXl4SlFVRkRMRU5CUVVFc1QwRkJla01zUlVGQmEwUXNSVUZCYkVRN1NVRkRRU3hMUVVGTExFTkJRVU1zVTBGQlRpeERRVUZuUWl4eFFrRkJhRUlzUlVGQmRVTXNTVUZCUXl4RFFVRkJMRTFCUVhoRExFVkJRV2RFTEVWQlFXaEVPMGxCUTBFc1MwRkJTeXhEUVVGRExGTkJRVTRzUTBGQlowSXNjMEpCUVdoQ0xFVkJRWGRETEVsQlFVTXNRMEZCUVN4UFFVRjZReXhGUVVGclJDeEZRVUZzUkR0SlFVTkJMRXRCUVVzc1EwRkJReXhUUVVGT0xFTkJRV2RDTEhOQ1FVRm9RaXhGUVVGM1F5eEpRVUZETEVOQlFVRXNUMEZCZWtNc1JVRkJhMFFzUlVGQmJFUTdWMEZEUVN4TFFVRkxMRU5CUVVNc1UwRkJUaXhEUVVGblFpeHpRa0ZCYUVJc1JVRkJkME1zU1VGQlF5eERRVUZCTEdGQlFYcERMRVZCUVhkRUxFZEJRWGhFTzBWQlRHTTdPMmREUVU5bUxHRkJRVUVzUjBGQlpTeFRRVUZCTzBsQlEyUXNTMEZCU3l4RFFVRkRMRmxCUVU0c1EwRkJiVUlzY1VKQlFXNUNMRVZCUVRCRExFbEJRVU1zUTBGQlFTeFBRVUV6UXl4RlFVRnZSQ3hGUVVGd1JEdEpRVU5CTEV0QlFVc3NRMEZCUXl4WlFVRk9MRU5CUVcxQ0xIRkNRVUZ1UWl4RlFVRXdReXhKUVVGRExFTkJRVUVzVFVGQk0wTXNSVUZCYlVRc1JVRkJia1E3U1VGRFFTeExRVUZMTEVOQlFVTXNXVUZCVGl4RFFVRnRRaXh6UWtGQmJrSXNSVUZCTWtNc1NVRkJReXhEUVVGQkxFOUJRVFZETEVWQlFYRkVMRVZCUVhKRU8wbEJRMEVzUzBGQlN5eERRVUZETEZsQlFVNHNRMEZCYlVJc2MwSkJRVzVDTEVWQlFUSkRMRWxCUVVNc1EwRkJRU3hQUVVFMVF5eEZRVUZ4UkN4RlFVRnlSRHRYUVVOQkxFdEJRVXNzUTBGQlF5eFpRVUZPTEVOQlFXMUNMSE5DUVVGdVFpeEZRVUV5UXl4SlFVRkRMRU5CUVVFc1lVRkJOVU1zUlVGQk1rUXNSMEZCTTBRN1JVRk1ZenM3TzBGQlVXWTdPenM3WjBOQlIwRXNWVUZCUVN4SFFVRlpMRk5CUVVFN1FVRkJSeXhWUVVGVkxFbEJRVUVzUzBGQlFTeERRVUZQTEhGR1FVRlFPMFZCUVdJN08yZERRVU5hTEU5QlFVRXNSMEZCV1N4VFFVRkJPMEZCUVVjc1ZVRkJWU3hKUVVGQkxFdEJRVUVzUTBGQlR5eHJSa0ZCVUR0RlFVRmlPenRuUTBGRFdpeE5RVUZCTEVkQlFWa3NVMEZCUVR0QlFVRkhMRlZCUVZVc1NVRkJRU3hMUVVGQkxFTkJRVThzYVVaQlFWQTdSVUZCWWpzN1owTkJRMW9zVDBGQlFTeEhRVUZaTEZOQlFVRTdRVUZCUnl4VlFVRlZMRWxCUVVFc1MwRkJRU3hEUVVGUExHdEdRVUZRTzBWQlFXSTdPMmREUVVOYUxFOUJRVUVzUjBGQldTeFRRVUZCTzBGQlFVY3NWVUZCVlN4SlFVRkJMRXRCUVVFc1EwRkJUeXhyUmtGQlVEdEZRVUZpT3pzN096czdRVUZGWWl4TlFVRk5MRU5CUVVNc1QwRkJVQ3hIUVVGcFFpSjlcbiIsIlxuLypcbiAgICBEZXBlbmRlbmNpZXNcbiAqL1xudmFyICQsIEhvb2tzLCBQb3J0Zm9saW9fSW50ZXJmYWNlLCBQb3J0Zm9saW9fTWFzb25yeSxcbiAgYmluZCA9IGZ1bmN0aW9uKGZuLCBtZSl7IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7IH07IH0sXG4gIGV4dGVuZCA9IGZ1bmN0aW9uKGNoaWxkLCBwYXJlbnQpIHsgZm9yICh2YXIga2V5IGluIHBhcmVudCkgeyBpZiAoaGFzUHJvcC5jYWxsKHBhcmVudCwga2V5KSkgY2hpbGRba2V5XSA9IHBhcmVudFtrZXldOyB9IGZ1bmN0aW9uIGN0b3IoKSB7IHRoaXMuY29uc3RydWN0b3IgPSBjaGlsZDsgfSBjdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7IGNoaWxkLnByb3RvdHlwZSA9IG5ldyBjdG9yKCk7IGNoaWxkLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7IHJldHVybiBjaGlsZDsgfSxcbiAgaGFzUHJvcCA9IHt9Lmhhc093blByb3BlcnR5O1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuUG9ydGZvbGlvX0ludGVyZmFjZSA9IHJlcXVpcmUoJy4vUG9ydGZvbGlvX0ludGVyZmFjZScpO1xuXG5Qb3J0Zm9saW9fTWFzb25yeSA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gIGV4dGVuZChQb3J0Zm9saW9fTWFzb25yeSwgc3VwZXJDbGFzcyk7XG5cbiAgZnVuY3Rpb24gUG9ydGZvbGlvX01hc29ucnkoKSB7XG4gICAgdGhpcy5yZWZyZXNoID0gYmluZCh0aGlzLnJlZnJlc2gsIHRoaXMpO1xuICAgIHRoaXMuZGVzdHJveSA9IGJpbmQodGhpcy5kZXN0cm95LCB0aGlzKTtcbiAgICB0aGlzLmNyZWF0ZSA9IGJpbmQodGhpcy5jcmVhdGUsIHRoaXMpO1xuICAgIHRoaXMucHJlcGFyZSA9IGJpbmQodGhpcy5wcmVwYXJlLCB0aGlzKTtcbiAgICByZXR1cm4gUG9ydGZvbGlvX01hc29ucnkuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUuRWxlbWVudHMgPSB7XG4gICAgY29udGFpbmVyOiAnUFBfTWFzb25yeScsXG4gICAgc2l6ZXI6ICdQUF9NYXNvbnJ5X19zaXplcicsXG4gICAgaXRlbTogJ1BQX01hc29ucnlfX2l0ZW0nXG4gIH07XG5cblxuICAvKlxuICBcdFx0SW5pdGlhbGl6ZVxuICAgKi9cblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCRwYXJlbnQpIHtcbiAgICByZXR1cm4gdGhpcy4kY29udGFpbmVyID0gJHBhcmVudC5maW5kKFwiLlwiICsgdGhpcy5FbGVtZW50cy5jb250YWluZXIpO1xuICB9O1xuXG5cbiAgLypcbiAgXHRcdFByZXBhcmUgJiBBdHRhY2ggRXZlbnRzXG4gICAgIFx0RG9uJ3Qgc2hvdyBhbnl0aGluZyB5ZXQuXG4gIFxuICBcdFx0QGNhbGxlZCBvbiBob29rIGBwcC5wb3J0Zm9saW8ucHJlcGFyZWBcbiAgICovXG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLnByZXBhcmUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbWFzb25yeV9zZXR0aW5ncztcbiAgICBpZiAodGhpcy4kY29udGFpbmVyLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLiRjb250YWluZXIuYWRkQ2xhc3MoJ1BQX0pTX19sb2FkaW5nX21hc29ucnknKTtcbiAgICB0aGlzLm1heWJlX2NyZWF0ZV9zaXplcigpO1xuICAgIG1hc29ucnlfc2V0dGluZ3MgPSBIb29rcy5hcHBseUZpbHRlcnMoJ3BwLm1hc29ucnkuc2V0dGluZ3MnLCB7XG4gICAgICBpdGVtU2VsZWN0b3I6IFwiLlwiICsgdGhpcy5FbGVtZW50cy5pdGVtLFxuICAgICAgY29sdW1uV2lkdGg6IFwiLlwiICsgdGhpcy5FbGVtZW50cy5zaXplcixcbiAgICAgIGd1dHRlcjogMCxcbiAgICAgIGluaXRMYXlvdXQ6IGZhbHNlXG4gICAgfSk7XG4gICAgdGhpcy4kY29udGFpbmVyLm1hc29ucnkobWFzb25yeV9zZXR0aW5ncyk7XG4gICAgcmV0dXJuIHRoaXMuJGNvbnRhaW5lci5tYXNvbnJ5KCdvbmNlJywgJ2xheW91dENvbXBsZXRlJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIF90aGlzLiRjb250YWluZXIucmVtb3ZlQ2xhc3MoJ1BQX0pTX19sb2FkaW5nX21hc29ucnknKS5hZGRDbGFzcygnUFBfSlNfX2xvYWRpbmdfY29tcGxldGUnKTtcbiAgICAgICAgcmV0dXJuIEhvb2tzLmRvQWN0aW9uKCdwcC5wb3J0Zm9saW8ucmVmcmVzaCcpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH07XG5cblxuICAvKlxuICBcdFx0U3RhcnQgdGhlIFBvcnRmb2xpb1xuICBcdFx0QGNhbGxlZCBvbiBob29rIGBwcC5wb3J0Zm9saW8uY3JlYXRlYFxuICAgKi9cblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy4kY29udGFpbmVyLm1hc29ucnkoKTtcbiAgfTtcblxuXG4gIC8qXG4gIFx0XHREZXN0cm95XG4gIFx0XHRAY2FsbGVkIG9uIGhvb2sgYHBwLnBvcnRmb2xpby5kZXN0cm95YFxuICAgKi9cblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMubWF5YmVfcmVtb3ZlX3NpemVyKCk7XG4gICAgaWYgKHRoaXMuJGNvbnRhaW5lci5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLiRjb250YWluZXIubWFzb25yeSgnZGVzdHJveScpO1xuICAgIH1cbiAgfTtcblxuXG4gIC8qXG4gIFx0XHRSZWxvYWQgdGhlIGxheW91dFxuICBcdFx0QGNhbGxlZCBvbiBob29rIGBwcC5wb3J0Zm9saW8ucmVmcmVzaGBcbiAgICovXG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy4kY29udGFpbmVyLm1hc29ucnkoJ2xheW91dCcpO1xuICB9O1xuXG5cbiAgLypcbiAgXHRcdENyZWF0ZSBhIHNpemVyIGVsZW1lbnQgZm9yIGpxdWVyeS1tYXNvbnJ5IHRvIHVzZVxuICAgKi9cblxuICBQb3J0Zm9saW9fTWFzb25yeS5wcm90b3R5cGUubWF5YmVfY3JlYXRlX3NpemVyID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuc2l6ZXJfZG9lc250X2V4aXN0KCkpIHtcbiAgICAgIHRoaXMuY3JlYXRlX3NpemVyKCk7XG4gICAgfVxuICB9O1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5tYXliZV9yZW1vdmVfc2l6ZXIgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy4kY29udGFpbmVyLmxlbmd0aCAhPT0gMSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLiRjb250YWluZXIuZmluZChcIi5cIiArIHRoaXMuRWxlbWVudHMuc2l6ZXIpLnJlbW92ZSgpO1xuICB9O1xuXG4gIFBvcnRmb2xpb19NYXNvbnJ5LnByb3RvdHlwZS5zaXplcl9kb2VzbnRfZXhpc3QgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy4kY29udGFpbmVyLmZpbmQoXCIuXCIgKyB0aGlzLkVsZW1lbnRzLnNpemVyKS5sZW5ndGggPT09IDA7XG4gIH07XG5cbiAgUG9ydGZvbGlvX01hc29ucnkucHJvdG90eXBlLmNyZWF0ZV9zaXplciA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJGNvbnRhaW5lci5hcHBlbmQoXCI8ZGl2IGNsYXNzPVxcXCJcIiArIHRoaXMuRWxlbWVudHMuc2l6ZXIgKyBcIlxcXCI+PC9kaXY+XCIpO1xuICB9O1xuXG4gIHJldHVybiBQb3J0Zm9saW9fTWFzb25yeTtcblxufSkoUG9ydGZvbGlvX0ludGVyZmFjZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUG9ydGZvbGlvX01hc29ucnk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVVHOXlkR1p2YkdsdlgwMWhjMjl1Y25rdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUpRYjNKMFptOXNhVzlmVFdGemIyNXllUzVqYjJabVpXVWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqdEJRVUZCT3pzN1FVRkJRU3hKUVVGQkxHZEVRVUZCTzBWQlFVRTdPenM3UVVGSFFTeERRVUZCTEVkQlFVa3NUMEZCUVN4RFFVRlRMRkZCUVZRN08wRkJRMG9zUzBGQlFTeEhRVUZSTEU5QlFVRXNRMEZCVXl4VlFVRlVPenRCUVVOU0xHMUNRVUZCTEVkQlFYTkNMRTlCUVVFc1EwRkJVeXgxUWtGQlZEczdRVUZIYUVJN096czdPenM3T3pzN096aENRVVZNTEZGQlFVRXNSMEZEUXp0SlFVRkJMRk5CUVVFc1JVRkJWeXhaUVVGWU8wbEJRMEVzUzBGQlFTeEZRVUZYTEcxQ1FVUllPMGxCUlVFc1NVRkJRU3hGUVVGWExHdENRVVpZT3pzN08wRkJTVVE3T3pzN09FSkJSMEVzVlVGQlFTeEhRVUZaTEZOQlFVVXNUMEZCUmp0WFFVTllMRWxCUVVNc1EwRkJRU3hWUVVGRUxFZEJRV01zVDBGQlR5eERRVUZETEVsQlFWSXNRMEZCWXl4SFFVRkJMRWRCUVVrc1NVRkJReXhEUVVGQkxGRkJRVkVzUTBGQlF5eFRRVUUxUWp0RlFVUklPenM3UVVGSFdqczdPenM3T3pzNFFrRk5RU3hQUVVGQkxFZEJRVk1zVTBGQlFUdEJRVU5TTEZGQlFVRTdTVUZCUVN4SlFVRlZMRWxCUVVNc1EwRkJRU3hWUVVGVkxFTkJRVU1zVFVGQldpeExRVUZ6UWl4RFFVRm9RenRCUVVGQkxHRkJRVUU3TzBsQlJVRXNTVUZCUXl4RFFVRkJMRlZCUVZVc1EwRkJReXhSUVVGYUxFTkJRWE5DTEhkQ1FVRjBRanRKUVVWQkxFbEJRVU1zUTBGQlFTeHJRa0ZCUkN4RFFVRkJPMGxCUjBFc1owSkJRVUVzUjBGQmJVSXNTMEZCU3l4RFFVRkRMRmxCUVU0c1EwRkJiVUlzY1VKQlFXNUNMRVZCUTJ4Q08wMUJRVUVzV1VGQlFTeEZRVUZqTEVkQlFVRXNSMEZCU1N4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExFbEJRVFZDTzAxQlEwRXNWMEZCUVN4RlFVRmpMRWRCUVVFc1IwRkJTU3hKUVVGRExFTkJRVUVzVVVGQlVTeERRVUZETEV0QlJEVkNPMDFCUlVFc1RVRkJRU3hGUVVGakxFTkJSbVE3VFVGSFFTeFZRVUZCTEVWQlFXTXNTMEZJWkR0TFFVUnJRanRKUVUxdVFpeEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRTlCUVZvc1EwRkJjVUlzWjBKQlFYSkNPMWRCUlVFc1NVRkJReXhEUVVGQkxGVkJRVlVzUTBGQlF5eFBRVUZhTEVOQlFXOUNMRTFCUVhCQ0xFVkJRVFJDTEdkQ1FVRTFRaXhGUVVFNFF5eERRVUZCTEZOQlFVRXNTMEZCUVR0aFFVRkJMRk5CUVVFN1VVRkROME1zUzBGQlF5eERRVUZCTEZWQlEwRXNRMEZCUXl4WFFVUkdMRU5CUTJVc2QwSkJSR1lzUTBGRlF5eERRVUZETEZGQlJrWXNRMEZGV1N4NVFrRkdXanRsUVUxQkxFdEJRVXNzUTBGQlF5eFJRVUZPTEVOQlFXVXNjMEpCUVdZN1RVRlFOa003U1VGQlFTeERRVUZCTEVOQlFVRXNRMEZCUVN4SlFVRkJMRU5CUVRsRE8wVkJhRUpST3pzN1FVRXdRbFE3T3pzN096aENRVWxCTEUxQlFVRXNSMEZCVVN4VFFVRkJPMGxCUTFBc1NVRkJReXhEUVVGQkxGVkJRVlVzUTBGQlF5eFBRVUZhTEVOQlFVRTdSVUZFVHpzN08wRkJTMUk3T3pzN096aENRVWxCTEU5QlFVRXNSMEZCVXl4VFFVRkJPMGxCUTFJc1NVRkJReXhEUVVGQkxHdENRVUZFTEVOQlFVRTdTVUZGUVN4SlFVRkhMRWxCUVVNc1EwRkJRU3hWUVVGVkxFTkJRVU1zVFVGQldpeEhRVUZ4UWl4RFFVRjRRanROUVVORExFbEJRVU1zUTBGQlFTeFZRVUZWTEVOQlFVTXNUMEZCV2l4RFFVRnhRaXhUUVVGeVFpeEZRVVJFT3p0RlFVaFJPenM3UVVGVlZEczdPenM3T0VKQlNVRXNUMEZCUVN4SFFVRlRMRk5CUVVFN1YwRkRVaXhKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEU5QlFWb3NRMEZCY1VJc1VVRkJja0k3UlVGRVVUczdPMEZCUzFRN096czdPRUpCUjBFc2EwSkJRVUVzUjBGQmIwSXNVMEZCUVR0SlFVTnVRaXhKUVVGdFFpeEpRVUZETEVOQlFVRXNhMEpCUVVRc1EwRkJRU3hEUVVGdVFqdE5RVUZCTEVsQlFVTXNRMEZCUVN4WlFVRkVMRU5CUVVFc1JVRkJRVHM3UlVGRWJVSTdPemhDUVVsd1FpeHJRa0ZCUVN4SFFVRnZRaXhUUVVGQk8wbEJRMjVDTEVsQlFWVXNTVUZCUXl4RFFVRkJMRlZCUVZVc1EwRkJReXhOUVVGYUxFdEJRWGRDTEVOQlFXeERPMEZCUVVFc1lVRkJRVHM3U1VGRFFTeEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRWxCUVZvc1EwRkJhMElzUjBGQlFTeEhRVUZKTEVsQlFVTXNRMEZCUVN4UlFVRlJMRU5CUVVNc1MwRkJhRU1zUTBGQmVVTXNRMEZCUXl4TlFVRXhReXhEUVVGQk8wVkJSbTFDT3pzNFFrRkxjRUlzYTBKQlFVRXNSMEZCYjBJc1UwRkJRVHRYUVVGSExFbEJRVU1zUTBGQlFTeFZRVUZWTEVOQlFVTXNTVUZCV2l4RFFVRnJRaXhIUVVGQkxFZEJRVWtzU1VGQlF5eERRVUZCTEZGQlFWRXNRMEZCUXl4TFFVRm9ReXhEUVVGNVF5eERRVUZETEUxQlFURkRMRXRCUVc5RU8wVkJRWFpFT3pzNFFrRkhjRUlzV1VGQlFTeEhRVUZqTEZOQlFVRTdTVUZEWWl4SlFVRkRMRU5CUVVFc1ZVRkJWU3hEUVVGRExFMUJRVm9zUTBGQmJVSXNaVUZCUVN4SFFVRnBRaXhKUVVGRExFTkJRVUVzVVVGQlVTeERRVUZETEV0QlFUTkNMRWRCUVdsRExGZEJRWEJFTzBWQlJHRTdPenM3UjBFMVJtbENPenRCUVd0SGFFTXNUVUZCVFN4RFFVRkRMRTlCUVZBc1IwRkJhVUlpZlE9PVxuIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgSG9va3MsIFBvcnRmb2xpbywgUG9ydGZvbGlvX0V2ZW50X01hbmFnZXI7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cblBvcnRmb2xpb19FdmVudF9NYW5hZ2VyID0gcmVxdWlyZSgnLi9Qb3J0Zm9saW9fRXZlbnRfTWFuYWdlcicpO1xuXG5Qb3J0Zm9saW8gPSBuZXcgUG9ydGZvbGlvX0V2ZW50X01hbmFnZXIoKTtcblxuSG9va3MuYWRkQWN0aW9uKCdwcC5jb3JlLnJlYWR5JywgUG9ydGZvbGlvLnByZXBhcmUsIDUwKTtcblxuSG9va3MuYWRkQWN0aW9uKCdwcC5jb3JlLmxvYWRlZCcsIFBvcnRmb2xpby5jcmVhdGUsIDUwKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYVc1a1pYZ3Vhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lKcGJtUmxlQzVqYjJabVpXVWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqdEJRVUZCT3pzN1FVRkJRU3hKUVVGQk96dEJRVWRCTEV0QlFVRXNSMEZCVVN4UFFVRkJMRU5CUVZNc1ZVRkJWRHM3UVVGRFVpeDFRa0ZCUVN4SFFVRXdRaXhQUVVGQkxFTkJRVk1zTWtKQlFWUTdPMEZCUnpGQ0xGTkJRVUVzUjBGQlowSXNTVUZCUVN4MVFrRkJRU3hEUVVGQk96dEJRVWRvUWl4TFFVRkxMRU5CUVVNc1UwRkJUaXhEUVVGblFpeGxRVUZvUWl4RlFVRnBReXhUUVVGVExFTkJRVU1zVDBGQk0wTXNSVUZCYjBRc1JVRkJjRVE3TzBGQlEwRXNTMEZCU3l4RFFVRkRMRk5CUVU0c1EwRkJaMElzWjBKQlFXaENMRVZCUVd0RExGTkJRVk1zUTBGQlF5eE5RVUUxUXl4RlFVRnZSQ3hGUVVGd1JDSjlcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
