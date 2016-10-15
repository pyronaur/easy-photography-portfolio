(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var App_State, Hooks, Portfolio, State_Manager;

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Portfolio = require('./class/Portfolio');

State_Manager = require('./class/State_Manager');

App_State = new State_Manager();

Hooks.addAction('pp.loaded', function() {
  var portfolio;
  return portfolio = new Portfolio();
});

require('./masonry');

require('./portfolio/popup');


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./class/Portfolio":3,"./class/State_Manager":4,"./masonry":9,"./portfolio/popup":10}],2:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var $, Hooks, Masonry,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Masonry = (function() {
  Masonry.prototype.Elements = {
    container: 'PP_Masonry',
    sizer: 'PP_Masonry__sizer',
    item: 'PP_Masonry__item'
  };

  function Masonry($parent) {
    if ($parent == null) {
      $parent = $(document);
    }
    this.refresh = bind(this.refresh, this);
    this.destroy = bind(this.destroy, this);
    this.create = bind(this.create, this);
    this.$container = $parent.find("." + this.Elements.container);
    this.create();
  }

  Masonry.prototype.create = function() {
    if (this.$container.length === 0) {
      return;
    }
    this.$container.addClass('is-preparing-masonry');
    this.maybe_create_sizer();
    Hooks.doAction('pp.masonry.start/before');
    this.$container.masonry({
      itemSelector: "." + this.Elements.item,
      columnWidth: "." + this.Elements.sizer,
      gutter: 0,
      initLayout: false
    });
    this.$container.masonry('on', 'layoutComplete', (function(_this) {
      return function() {
        _this.$container.removeClass('is-preparing-masonry');
        return Hooks.doAction('pp.masonry.start/complete');
      };
    })(this));
    this.$container.masonry();
    Hooks.doAction('pp.masonry.start/layout');
  };

  Masonry.prototype.destroy = function() {
    this.maybe_remove_sizer();
    if (this.$container.length > 0) {
      this.$container.masonry('destroy');
    }
  };

  Masonry.prototype.refresh = function() {
    return this.$container.maosnry('layout');
  };


  /*
  
  		Create a sizer element for jquery-masonry to use
   */

  Masonry.prototype.maybe_create_sizer = function() {
    if (this.sizer_doesnt_exist()) {
      this.create_sizer();
    }
  };

  Masonry.prototype.maybe_remove_sizer = function() {
    if (this.$container.length !== 1) {
      return;
    }
    this.$container.find("." + this.Elements.sizer).remove();
  };

  Masonry.prototype.sizer_doesnt_exist = function() {
    return this.$container.find("." + this.Elements.sizer).length === 0;
  };

  Masonry.prototype.create_sizer = function() {
    this.$container.append("<div class=\"" + this.Elements.sizer + "\"></div>");
  };

  return Masonry;

})();

module.exports = Masonry;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],3:[function(require,module,exports){
(function (global){
var Hooks, Portfolio;

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Portfolio = (function() {
  function Portfolio() {

    /*
      		Event Based Portfolio is going to start soon
     */
    this.handler = Hooks.applyFilters('pp.portfolio.handler', false);
    if (this.handler) {
      Hooks.addAction('pp.portfolio.create', this.handler.create, 50);
      Hooks.addAction('pp.portfolio.refresh', this.handler.refresh, 50);
      Hooks.addAction('pp.portfolio.destroy', this.handler.destroy, 50);
      Hooks.addAction('pp.portfolio.destroy', this.auto_destroy, 500);
    }
  }

  Portfolio.prototype.create = function() {
    Hooks.doAction('pp.portfolio.create');
  };

  Portfolio.prototype.refresh = function() {
    Hooks.doAction('pp.portfolio.refresh');
  };

  Portfolio.prototype.destroy = function() {
    Hooks.doAction('pp.portfolio.destroy');
  };

  Portfolio.prototype.auto_destroy = function() {
    Hooks.removeAction('pp.portfolio.create', this.handler.create, 50);
    Hooks.removeAction('pp.portfolio.refresh', this.handler.refresh, 50);
    return Hooks.removeAction('pp.portfolio.destroy', this.handler.destroy, 50);
  };

  return Portfolio;

})();

module.exports = Portfolio;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],4:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var $, Hooks, State_Manager,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

State_Manager = (function() {
  function State_Manager() {
    this.loaded = bind(this.loaded, this);
    this.ready = bind(this.ready, this);
    this.$doc = $(document);
    this.$doc.on('ready', this.ready);
    this.$doc.find('.PP_Wrapper').imagesLoaded(this.loaded);
  }

  State_Manager.prototype.ready = function() {
    var trigger;
    trigger = true;
    if (Hooks.applyFilters('pp.ready', true)) {
      Hooks.doAction('pp.ready');
    }
  };

  State_Manager.prototype.loaded = function() {
    var trigger;
    trigger = true;
    if (Hooks.applyFilters('pp.loaded', true)) {
      Hooks.doAction('pp.loaded');
    }
  };

  return State_Manager;

})();

module.exports = State_Manager;


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
    placeholder: 'PP_Lazy_Image__placeholder'
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

},{"./Item_Data":6}],8:[function(require,module,exports){
(function (global){
var $, Lazy_Loader, Lazy_Masonry, __WINDOW,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Lazy_Loader = require('./Lazy_Loader');

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
    item.$el.prepend("<a href=\"" + full + "\" rel=\"gallery\">\n<img src=\"" + thumb + "\" class=\"is-loading\" />\n</a>").removeClass('Lazy-Image');
    item.loaded = true;
    $image = item.$el.find('img');
    return $image.imagesLoaded((function(_this) {
      return function() {
        $image.addClass('is-loaded').removeClass('is-loading');
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

  return Lazy_Masonry;

})(Lazy_Loader);

module.exports = Lazy_Masonry;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../global/Window":5,"./Lazy_Loader":7}],9:[function(require,module,exports){
(function (global){
var $, Hooks, Lazy_Masonry, Masonry;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Masonry = require('./class/Masonry');

Lazy_Masonry = require('./lazy/Lazy_Masonry');

Hooks.addAction('pp.masonry.start/before', function() {
  var Lazy_Handler;
  Lazy_Handler = Hooks.applyFilters('pp.lazy.handler', Lazy_Masonry);
  new Lazy_Handler();
});

Hooks.addAction('pp.masonry.start/complete', function() {
  return Hooks.doAction('pp.lazy.autoload');
});

Hooks.addAction('pp.ready', function() {
  if ($('.PP_Masonry').length > 0) {
    return Hooks.addFilter('pp.portfolio.handler', function() {
      return new Masonry();
    });
  }
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./class/Masonry":2,"./lazy/Lazy_Masonry":8}],10:[function(require,module,exports){
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

Hooks.addAction('pp.ready', function() {
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

},{"../lazy/Item_Data":6}]},{},[1])


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jbGFzcy9NYXNvbnJ5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jbGFzcy9Qb3J0Zm9saW8uY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2NsYXNzL1N0YXRlX01hbmFnZXIuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dsb2JhbC9XaW5kb3cuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvSXRlbV9EYXRhLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0xhenlfTG9hZGVyLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0xhenlfTWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvbWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL3BvcHVwLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgQXBwX1N0YXRlLCBIb29rcywgUG9ydGZvbGlvLCBTdGF0ZV9NYW5hZ2VyO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5Qb3J0Zm9saW8gPSByZXF1aXJlKCcuL2NsYXNzL1BvcnRmb2xpbycpO1xuXG5TdGF0ZV9NYW5hZ2VyID0gcmVxdWlyZSgnLi9jbGFzcy9TdGF0ZV9NYW5hZ2VyJyk7XG5cbkFwcF9TdGF0ZSA9IG5ldyBTdGF0ZV9NYW5hZ2VyKCk7XG5cbkhvb2tzLmFkZEFjdGlvbigncHAubG9hZGVkJywgZnVuY3Rpb24oKSB7XG4gIHZhciBwb3J0Zm9saW87XG4gIHJldHVybiBwb3J0Zm9saW8gPSBuZXcgUG9ydGZvbGlvKCk7XG59KTtcblxucmVxdWlyZSgnLi9tYXNvbnJ5Jyk7XG5cbnJlcXVpcmUoJy4vcG9ydGZvbGlvL3BvcHVwJyk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVlYQndMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE1pT2xzaVlYQndMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaU8wRkJRVUU3T3p0QlFVRkJMRWxCUVVFN08wRkJSMEVzUzBGQlFTeEhRVUZSTEU5QlFVRXNRMEZCVXl4VlFVRlVPenRCUVVOU0xGTkJRVUVzUjBGQldTeFBRVUZCTEVOQlFWTXNiVUpCUVZRN08wRkJRMW9zWVVGQlFTeEhRVUZuUWl4UFFVRkJMRU5CUVZNc2RVSkJRVlE3TzBGQlIyaENMRk5CUVVFc1IwRkJaMElzU1VGQlFTeGhRVUZCTEVOQlFVRTdPMEZCU1doQ0xFdEJRVXNzUTBGQlF5eFRRVUZPTEVOQlFXZENMRmRCUVdoQ0xFVkJRVFpDTEZOQlFVRTdRVUZETlVJc1RVRkJRVHRUUVVGQkxGTkJRVUVzUjBGQlowSXNTVUZCUVN4VFFVRkJMRU5CUVVFN1FVRkVXU3hEUVVFM1FqczdRVUZKUVN4UFFVRkJMRU5CUVZFc1YwRkJVanM3UVVGSFFTeFBRVUZCTEVOQlFWRXNiVUpCUVZJaWZRPT1cbiIsIlxuLypcbiAgICBEZXBlbmRlbmNpZXNcbiAqL1xudmFyICQsIEhvb2tzLCBNYXNvbnJ5LFxuICBiaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbk1hc29ucnkgPSAoZnVuY3Rpb24oKSB7XG4gIE1hc29ucnkucHJvdG90eXBlLkVsZW1lbnRzID0ge1xuICAgIGNvbnRhaW5lcjogJ1BQX01hc29ucnknLFxuICAgIHNpemVyOiAnUFBfTWFzb25yeV9fc2l6ZXInLFxuICAgIGl0ZW06ICdQUF9NYXNvbnJ5X19pdGVtJ1xuICB9O1xuXG4gIGZ1bmN0aW9uIE1hc29ucnkoJHBhcmVudCkge1xuICAgIGlmICgkcGFyZW50ID09IG51bGwpIHtcbiAgICAgICRwYXJlbnQgPSAkKGRvY3VtZW50KTtcbiAgICB9XG4gICAgdGhpcy5yZWZyZXNoID0gYmluZCh0aGlzLnJlZnJlc2gsIHRoaXMpO1xuICAgIHRoaXMuZGVzdHJveSA9IGJpbmQodGhpcy5kZXN0cm95LCB0aGlzKTtcbiAgICB0aGlzLmNyZWF0ZSA9IGJpbmQodGhpcy5jcmVhdGUsIHRoaXMpO1xuICAgIHRoaXMuJGNvbnRhaW5lciA9ICRwYXJlbnQuZmluZChcIi5cIiArIHRoaXMuRWxlbWVudHMuY29udGFpbmVyKTtcbiAgICB0aGlzLmNyZWF0ZSgpO1xuICB9XG5cbiAgTWFzb25yeS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuJGNvbnRhaW5lci5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy4kY29udGFpbmVyLmFkZENsYXNzKCdpcy1wcmVwYXJpbmctbWFzb25yeScpO1xuICAgIHRoaXMubWF5YmVfY3JlYXRlX3NpemVyKCk7XG4gICAgSG9va3MuZG9BY3Rpb24oJ3BwLm1hc29ucnkuc3RhcnQvYmVmb3JlJyk7XG4gICAgdGhpcy4kY29udGFpbmVyLm1hc29ucnkoe1xuICAgICAgaXRlbVNlbGVjdG9yOiBcIi5cIiArIHRoaXMuRWxlbWVudHMuaXRlbSxcbiAgICAgIGNvbHVtbldpZHRoOiBcIi5cIiArIHRoaXMuRWxlbWVudHMuc2l6ZXIsXG4gICAgICBndXR0ZXI6IDAsXG4gICAgICBpbml0TGF5b3V0OiBmYWxzZVxuICAgIH0pO1xuICAgIHRoaXMuJGNvbnRhaW5lci5tYXNvbnJ5KCdvbicsICdsYXlvdXRDb21wbGV0ZScsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBfdGhpcy4kY29udGFpbmVyLnJlbW92ZUNsYXNzKCdpcy1wcmVwYXJpbmctbWFzb25yeScpO1xuICAgICAgICByZXR1cm4gSG9va3MuZG9BY3Rpb24oJ3BwLm1hc29ucnkuc3RhcnQvY29tcGxldGUnKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHRoaXMuJGNvbnRhaW5lci5tYXNvbnJ5KCk7XG4gICAgSG9va3MuZG9BY3Rpb24oJ3BwLm1hc29ucnkuc3RhcnQvbGF5b3V0Jyk7XG4gIH07XG5cbiAgTWFzb25yeS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMubWF5YmVfcmVtb3ZlX3NpemVyKCk7XG4gICAgaWYgKHRoaXMuJGNvbnRhaW5lci5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLiRjb250YWluZXIubWFzb25yeSgnZGVzdHJveScpO1xuICAgIH1cbiAgfTtcblxuICBNYXNvbnJ5LnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuJGNvbnRhaW5lci5tYW9zbnJ5KCdsYXlvdXQnKTtcbiAgfTtcblxuXG4gIC8qXG4gIFxuICBcdFx0Q3JlYXRlIGEgc2l6ZXIgZWxlbWVudCBmb3IganF1ZXJ5LW1hc29ucnkgdG8gdXNlXG4gICAqL1xuXG4gIE1hc29ucnkucHJvdG90eXBlLm1heWJlX2NyZWF0ZV9zaXplciA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnNpemVyX2RvZXNudF9leGlzdCgpKSB7XG4gICAgICB0aGlzLmNyZWF0ZV9zaXplcigpO1xuICAgIH1cbiAgfTtcblxuICBNYXNvbnJ5LnByb3RvdHlwZS5tYXliZV9yZW1vdmVfc2l6ZXIgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy4kY29udGFpbmVyLmxlbmd0aCAhPT0gMSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLiRjb250YWluZXIuZmluZChcIi5cIiArIHRoaXMuRWxlbWVudHMuc2l6ZXIpLnJlbW92ZSgpO1xuICB9O1xuXG4gIE1hc29ucnkucHJvdG90eXBlLnNpemVyX2RvZXNudF9leGlzdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLiRjb250YWluZXIuZmluZChcIi5cIiArIHRoaXMuRWxlbWVudHMuc2l6ZXIpLmxlbmd0aCA9PT0gMDtcbiAgfTtcblxuICBNYXNvbnJ5LnByb3RvdHlwZS5jcmVhdGVfc2l6ZXIgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRjb250YWluZXIuYXBwZW5kKFwiPGRpdiBjbGFzcz1cXFwiXCIgKyB0aGlzLkVsZW1lbnRzLnNpemVyICsgXCJcXFwiPjwvZGl2PlwiKTtcbiAgfTtcblxuICByZXR1cm4gTWFzb25yeTtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNYXNvbnJ5O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lUV0Z6YjI1eWVTNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSWsxaGMyOXVjbmt1WTI5bVptVmxJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSTdRVUZCUVRzN08wRkJRVUVzU1VGQlFTeHBRa0ZCUVR0RlFVRkJPenRCUVVkQkxFTkJRVUVzUjBGQlNTeFBRVUZCTEVOQlFWTXNVVUZCVkRzN1FVRkRTaXhMUVVGQkxFZEJRVkVzVDBGQlFTeERRVUZUTEZWQlFWUTdPMEZCUlVZN2IwSkJSVXdzVVVGQlFTeEhRVU5ETzBsQlFVRXNVMEZCUVN4RlFVRlhMRmxCUVZnN1NVRkRRU3hMUVVGQkxFVkJRVmNzYlVKQlJGZzdTVUZGUVN4SlFVRkJMRVZCUVZjc2EwSkJSbGc3T3p0RlFVOVpMR2xDUVVGRkxFOUJRVVk3TzAxQlFVVXNWVUZCVlN4RFFVRkJMRU5CUVVjc1VVRkJTRHM3T3pzN1NVRkRlRUlzU1VGQlF5eERRVUZCTEZWQlFVUXNSMEZCWXl4UFFVRlBMRU5CUVVNc1NVRkJVaXhEUVVGakxFZEJRVUVzUjBGQlNTeEpRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRk5CUVRWQ08wbEJSV1FzU1VGQlF5eERRVUZCTEUxQlFVUXNRMEZCUVR0RlFVaFpPenR2UWtGTllpeE5RVUZCTEVkQlFWRXNVMEZCUVR0SlFVTlFMRWxCUVZVc1NVRkJReXhEUVVGQkxGVkJRVlVzUTBGQlF5eE5RVUZhTEV0QlFYTkNMRU5CUVdoRE8wRkJRVUVzWVVGQlFUczdTVUZGUVN4SlFVRkRMRU5CUVVFc1ZVRkJWU3hEUVVGRExGRkJRVm9zUTBGQmMwSXNjMEpCUVhSQ08wbEJSVUVzU1VGQlF5eERRVUZCTEd0Q1FVRkVMRU5CUVVFN1NVRkRRU3hMUVVGTExFTkJRVU1zVVVGQlRpeERRVUZsTEhsQ1FVRm1PMGxCUjBFc1NVRkJReXhEUVVGQkxGVkJRVlVzUTBGQlF5eFBRVUZhTEVOQlEwTTdUVUZCUVN4WlFVRkJMRVZCUVdNc1IwRkJRU3hIUVVGSkxFbEJRVU1zUTBGQlFTeFJRVUZSTEVOQlFVTXNTVUZCTlVJN1RVRkRRU3hYUVVGQkxFVkJRV01zUjBGQlFTeEhRVUZKTEVsQlFVTXNRMEZCUVN4UlFVRlJMRU5CUVVNc1MwRkVOVUk3VFVGRlFTeE5RVUZCTEVWQlFXTXNRMEZHWkR0TlFVZEJMRlZCUVVFc1JVRkJZeXhMUVVoa08wdEJSRVE3U1VGUFFTeEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRTlCUVZvc1EwRkJiMElzU1VGQmNFSXNSVUZCTUVJc1owSkJRVEZDTEVWQlFUUkRMRU5CUVVFc1UwRkJRU3hMUVVGQk8yRkJRVUVzVTBGQlFUdFJRVU16UXl4TFFVRkRMRU5CUVVFc1ZVRkJWU3hEUVVGRExGZEJRVm9zUTBGQmVVSXNjMEpCUVhwQ08yVkJRMEVzUzBGQlN5eERRVUZETEZGQlFVNHNRMEZCWlN3eVFrRkJaanROUVVZeVF6dEpRVUZCTEVOQlFVRXNRMEZCUVN4RFFVRkJMRWxCUVVFc1EwRkJOVU03U1VGTFFTeEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRTlCUVZvc1EwRkJRVHRKUVVOQkxFdEJRVXNzUTBGQlF5eFJRVUZPTEVOQlFXVXNlVUpCUVdZN1JVRjBRazg3TzI5Q1FUUkNVaXhQUVVGQkxFZEJRVk1zVTBGQlFUdEpRVU5TTEVsQlFVTXNRMEZCUVN4clFrRkJSQ3hEUVVGQk8wbEJSVUVzU1VGQlJ5eEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRTFCUVZvc1IwRkJjVUlzUTBGQmVFSTdUVUZEUXl4SlFVRkRMRU5CUVVFc1ZVRkJWU3hEUVVGRExFOUJRVm9zUTBGQmNVSXNVMEZCY2tJc1JVRkVSRHM3UlVGSVVUczdiMEpCVTFRc1QwRkJRU3hIUVVGVExGTkJRVUU3VjBGRFVpeEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRTlCUVZvc1EwRkJjVUlzVVVGQmNrSTdSVUZFVVRzN08wRkJSMVE3T3pzN08yOUNRVXRCTEd0Q1FVRkJMRWRCUVc5Q0xGTkJRVUU3U1VGRGJrSXNTVUZCYlVJc1NVRkJReXhEUVVGQkxHdENRVUZFTEVOQlFVRXNRMEZCYmtJN1RVRkJRU3hKUVVGRExFTkJRVUVzV1VGQlJDeERRVUZCTEVWQlFVRTdPMFZCUkcxQ096dHZRa0ZKY0VJc2EwSkJRVUVzUjBGQmIwSXNVMEZCUVR0SlFVTnVRaXhKUVVGVkxFbEJRVU1zUTBGQlFTeFZRVUZWTEVOQlFVTXNUVUZCV2l4TFFVRjNRaXhEUVVGc1F6dEJRVUZCTEdGQlFVRTdPMGxCUTBFc1NVRkJReXhEUVVGQkxGVkJRVlVzUTBGQlF5eEpRVUZhTEVOQlFXdENMRWRCUVVFc1IwRkJTU3hKUVVGRExFTkJRVUVzVVVGQlVTeERRVUZETEV0QlFXaERMRU5CUVhsRExFTkJRVU1zVFVGQk1VTXNRMEZCUVR0RlFVWnRRanM3YjBKQlMzQkNMR3RDUVVGQkxFZEJRVzlDTEZOQlFVRTdWMEZCUnl4SlFVRkRMRU5CUVVFc1ZVRkJWU3hEUVVGRExFbEJRVm9zUTBGQmEwSXNSMEZCUVN4SFFVRkpMRWxCUVVNc1EwRkJRU3hSUVVGUkxFTkJRVU1zUzBGQmFFTXNRMEZCZVVNc1EwRkJReXhOUVVFeFF5eExRVUZ2UkR0RlFVRjJSRHM3YjBKQlIzQkNMRmxCUVVFc1IwRkJZeXhUUVVGQk8wbEJRMklzU1VGQlF5eERRVUZCTEZWQlFWVXNRMEZCUXl4TlFVRmFMRU5CUVcxQ0xHVkJRVUVzUjBGQmFVSXNTVUZCUXl4RFFVRkJMRkZCUVZFc1EwRkJReXhMUVVFelFpeEhRVUZwUXl4WFFVRndSRHRGUVVSaE96czdPenM3UVVGTlppeE5RVUZOTEVOQlFVTXNUMEZCVUN4SFFVRnBRaUo5XG4iLCJ2YXIgSG9va3MsIFBvcnRmb2xpbztcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuUG9ydGZvbGlvID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBQb3J0Zm9saW8oKSB7XG5cbiAgICAvKlxuICAgICAgXHRcdEV2ZW50IEJhc2VkIFBvcnRmb2xpbyBpcyBnb2luZyB0byBzdGFydCBzb29uXG4gICAgICovXG4gICAgdGhpcy5oYW5kbGVyID0gSG9va3MuYXBwbHlGaWx0ZXJzKCdwcC5wb3J0Zm9saW8uaGFuZGxlcicsIGZhbHNlKTtcbiAgICBpZiAodGhpcy5oYW5kbGVyKSB7XG4gICAgICBIb29rcy5hZGRBY3Rpb24oJ3BwLnBvcnRmb2xpby5jcmVhdGUnLCB0aGlzLmhhbmRsZXIuY3JlYXRlLCA1MCk7XG4gICAgICBIb29rcy5hZGRBY3Rpb24oJ3BwLnBvcnRmb2xpby5yZWZyZXNoJywgdGhpcy5oYW5kbGVyLnJlZnJlc2gsIDUwKTtcbiAgICAgIEhvb2tzLmFkZEFjdGlvbigncHAucG9ydGZvbGlvLmRlc3Ryb3knLCB0aGlzLmhhbmRsZXIuZGVzdHJveSwgNTApO1xuICAgICAgSG9va3MuYWRkQWN0aW9uKCdwcC5wb3J0Zm9saW8uZGVzdHJveScsIHRoaXMuYXV0b19kZXN0cm95LCA1MDApO1xuICAgIH1cbiAgfVxuXG4gIFBvcnRmb2xpby5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MuZG9BY3Rpb24oJ3BwLnBvcnRmb2xpby5jcmVhdGUnKTtcbiAgfTtcblxuICBQb3J0Zm9saW8ucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbigpIHtcbiAgICBIb29rcy5kb0FjdGlvbigncHAucG9ydGZvbGlvLnJlZnJlc2gnKTtcbiAgfTtcblxuICBQb3J0Zm9saW8ucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICBIb29rcy5kb0FjdGlvbigncHAucG9ydGZvbGlvLmRlc3Ryb3knKTtcbiAgfTtcblxuICBQb3J0Zm9saW8ucHJvdG90eXBlLmF1dG9fZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLnJlbW92ZUFjdGlvbigncHAucG9ydGZvbGlvLmNyZWF0ZScsIHRoaXMuaGFuZGxlci5jcmVhdGUsIDUwKTtcbiAgICBIb29rcy5yZW1vdmVBY3Rpb24oJ3BwLnBvcnRmb2xpby5yZWZyZXNoJywgdGhpcy5oYW5kbGVyLnJlZnJlc2gsIDUwKTtcbiAgICByZXR1cm4gSG9va3MucmVtb3ZlQWN0aW9uKCdwcC5wb3J0Zm9saW8uZGVzdHJveScsIHRoaXMuaGFuZGxlci5kZXN0cm95LCA1MCk7XG4gIH07XG5cbiAgcmV0dXJuIFBvcnRmb2xpbztcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW87XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVVHOXlkR1p2YkdsdkxtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpVUc5eWRHWnZiR2x2TG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4SlFVRkJPenRCUVVGQkxFdEJRVUVzUjBGQlVTeFBRVUZCTEVOQlFWTXNWVUZCVkRzN1FVRkZSanRGUVVWUkxHMUNRVUZCT3p0QlFVTmFPenM3U1VGSFFTeEpRVUZETEVOQlFVRXNUMEZCUkN4SFFVRlhMRXRCUVVzc1EwRkJReXhaUVVGT0xFTkJRVzFDTEhOQ1FVRnVRaXhGUVVFeVF5eExRVUV6UXp0SlFVVllMRWxCUVVjc1NVRkJReXhEUVVGQkxFOUJRVW83VFVGRlF5eExRVUZMTEVOQlFVTXNVMEZCVGl4RFFVRm5RaXh4UWtGQmFFSXNSVUZCZFVNc1NVRkJReXhEUVVGQkxFOUJRVThzUTBGQlF5eE5RVUZvUkN4RlFVRjNSQ3hGUVVGNFJEdE5RVU5CTEV0QlFVc3NRMEZCUXl4VFFVRk9MRU5CUVdkQ0xITkNRVUZvUWl4RlFVRjNReXhKUVVGRExFTkJRVUVzVDBGQlR5eERRVUZETEU5QlFXcEVMRVZCUVRCRUxFVkJRVEZFTzAxQlEwRXNTMEZCU3l4RFFVRkRMRk5CUVU0c1EwRkJaMElzYzBKQlFXaENMRVZCUVhkRExFbEJRVU1zUTBGQlFTeFBRVUZQTEVOQlFVTXNUMEZCYWtRc1JVRkJNRVFzUlVGQk1VUTdUVUZIUVN4TFFVRkxMRU5CUVVNc1UwRkJUaXhEUVVGblFpeHpRa0ZCYUVJc1JVRkJkME1zU1VGQlF5eERRVUZCTEZsQlFYcERMRVZCUVhWRUxFZEJRWFpFTEVWQlVFUTdPMFZCVGxrN08zTkNRV1ZpTEUxQlFVRXNSMEZCVVN4VFFVRkJPMGxCUTFBc1MwRkJTeXhEUVVGRExGRkJRVTRzUTBGQlpTeHhRa0ZCWmp0RlFVUlBPenR6UWtGTFVpeFBRVUZCTEVkQlFWTXNVMEZCUVR0SlFVTlNMRXRCUVVzc1EwRkJReXhSUVVGT0xFTkJRV1VzYzBKQlFXWTdSVUZFVVRzN2MwSkJTMVFzVDBGQlFTeEhRVUZUTEZOQlFVRTdTVUZGVWl4TFFVRkxMRU5CUVVNc1VVRkJUaXhEUVVGbExITkNRVUZtTzBWQlJsRTdPM05DUVV0VUxGbEJRVUVzUjBGQll5eFRRVUZCTzBsQlJXSXNTMEZCU3l4RFFVRkRMRmxCUVU0c1EwRkJiVUlzY1VKQlFXNUNMRVZCUVRCRExFbEJRVU1zUTBGQlFTeFBRVUZQTEVOQlFVTXNUVUZCYmtRc1JVRkJNa1FzUlVGQk0wUTdTVUZEUVN4TFFVRkxMRU5CUVVNc1dVRkJUaXhEUVVGdFFpeHpRa0ZCYmtJc1JVRkJNa01zU1VGQlF5eERRVUZCTEU5QlFVOHNRMEZCUXl4UFFVRndSQ3hGUVVFMlJDeEZRVUUzUkR0WFFVTkJMRXRCUVVzc1EwRkJReXhaUVVGT0xFTkJRVzFDTEhOQ1FVRnVRaXhGUVVFeVF5eEpRVUZETEVOQlFVRXNUMEZCVHl4RFFVRkRMRTlCUVhCRUxFVkJRVFpFTEVWQlFUZEVPMFZCU21FN096czdPenRCUVU5bUxFMUJRVTBzUTBGQlF5eFBRVUZRTEVkQlFXbENJbjA9XG4iLCJcbi8qXG4gICAgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBIb29rcywgU3RhdGVfTWFuYWdlcixcbiAgYmluZCA9IGZ1bmN0aW9uKGZuLCBtZSl7IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7IH07IH07XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5TdGF0ZV9NYW5hZ2VyID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBTdGF0ZV9NYW5hZ2VyKCkge1xuICAgIHRoaXMubG9hZGVkID0gYmluZCh0aGlzLmxvYWRlZCwgdGhpcyk7XG4gICAgdGhpcy5yZWFkeSA9IGJpbmQodGhpcy5yZWFkeSwgdGhpcyk7XG4gICAgdGhpcy4kZG9jID0gJChkb2N1bWVudCk7XG4gICAgdGhpcy4kZG9jLm9uKCdyZWFkeScsIHRoaXMucmVhZHkpO1xuICAgIHRoaXMuJGRvYy5maW5kKCcuUFBfV3JhcHBlcicpLmltYWdlc0xvYWRlZCh0aGlzLmxvYWRlZCk7XG4gIH1cblxuICBTdGF0ZV9NYW5hZ2VyLnByb3RvdHlwZS5yZWFkeSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0cmlnZ2VyO1xuICAgIHRyaWdnZXIgPSB0cnVlO1xuICAgIGlmIChIb29rcy5hcHBseUZpbHRlcnMoJ3BwLnJlYWR5JywgdHJ1ZSkpIHtcbiAgICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5yZWFkeScpO1xuICAgIH1cbiAgfTtcblxuICBTdGF0ZV9NYW5hZ2VyLnByb3RvdHlwZS5sb2FkZWQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdHJpZ2dlcjtcbiAgICB0cmlnZ2VyID0gdHJ1ZTtcbiAgICBpZiAoSG9va3MuYXBwbHlGaWx0ZXJzKCdwcC5sb2FkZWQnLCB0cnVlKSkge1xuICAgICAgSG9va3MuZG9BY3Rpb24oJ3BwLmxvYWRlZCcpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gU3RhdGVfTWFuYWdlcjtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdGF0ZV9NYW5hZ2VyO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lVM1JoZEdWZlRXRnVZV2RsY2k1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJbE4wWVhSbFgwMWhibUZuWlhJdVkyOW1abVZsSWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUk3UVVGQlFUczdPMEZCUVVFc1NVRkJRU3gxUWtGQlFUdEZRVUZCT3p0QlFVZEJMRU5CUVVFc1IwRkJTU3hQUVVGQkxFTkJRVk1zVVVGQlZEczdRVUZEU2l4TFFVRkJMRWRCUVZFc1QwRkJRU3hEUVVGVExGVkJRVlE3TzBGQlIwWTdSVUZGVVN4MVFrRkJRVHM3TzBsQlExb3NTVUZCUXl4RFFVRkJMRWxCUVVRc1IwRkJVU3hEUVVGQkxFTkJRVWNzVVVGQlNEdEpRVWRTTEVsQlFVTXNRMEZCUVN4SlFVRkpMRU5CUVVNc1JVRkJUaXhEUVVGVExFOUJRVlFzUlVGQmEwSXNTVUZCUXl4RFFVRkJMRXRCUVc1Q08wbEJRMEVzU1VGQlF5eERRVUZCTEVsQlFVa3NRMEZCUXl4SlFVRk9MRU5CUVZrc1lVRkJXaXhEUVVFeVFpeERRVUZETEZsQlFUVkNMRU5CUVRCRExFbEJRVU1zUTBGQlFTeE5RVUV6UXp0RlFVeFpPenN3UWtGUllpeExRVUZCTEVkQlFVOHNVMEZCUVR0QlFVTk9MRkZCUVVFN1NVRkJRU3hQUVVGQkxFZEJRVlU3U1VGRlZpeEpRVUZITEV0QlFVc3NRMEZCUXl4WlFVRk9MRU5CUVcxQ0xGVkJRVzVDTEVWQlFTdENMRWxCUVM5Q0xFTkJRVWc3VFVGRFF5eExRVUZMTEVOQlFVTXNVVUZCVGl4RFFVRmxMRlZCUVdZc1JVRkVSRHM3UlVGSVRUczdNRUpCVVZBc1RVRkJRU3hIUVVGUkxGTkJRVUU3UVVGRFVDeFJRVUZCTzBsQlFVRXNUMEZCUVN4SFFVRlZPMGxCUlZZc1NVRkJSeXhMUVVGTExFTkJRVU1zV1VGQlRpeERRVUZ0UWl4WFFVRnVRaXhGUVVGblF5eEpRVUZvUXl4RFFVRklPMDFCUTBNc1MwRkJTeXhEUVVGRExGRkJRVTRzUTBGQlpTeFhRVUZtTEVWQlJFUTdPMFZCU0U4N096czdPenRCUVZOVUxFMUJRVTBzUTBGQlF5eFBRVUZRTEVkQlFXbENJbjA9XG4iLCJ2YXIgSG9va3MsIGdldF9zaXplO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5nZXRfc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHdpZHRoOiB3aW5kb3cuaW5uZXJXaWR0aCB8fCAkd2luZG93LndpZHRoKCksXG4gICAgaGVpZ2h0OiB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgJHdpbmRvdy5oZWlnaHQoKVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBnZXRfc2l6ZSgpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lWMmx1Wkc5M0xtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpVjJsdVpHOTNMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRU3hKUVVGQk96dEJRVUZCTEV0QlFVRXNSMEZCVVN4UFFVRkJMRU5CUVZNc1ZVRkJWRHM3UVVGSFVpeFJRVUZCTEVkQlFWY3NVMEZCUVR0VFFVTldPMGxCUVVFc1MwRkJRU3hGUVVGUkxFMUJRVTBzUTBGQlF5eFZRVUZRTEVsQlFYRkNMRTlCUVU4c1EwRkJReXhMUVVGU0xFTkJRVUVzUTBGQk4wSTdTVUZEUVN4TlFVRkJMRVZCUVZFc1RVRkJUU3hEUVVGRExGZEJRVkFzU1VGQmMwSXNUMEZCVHl4RFFVRkRMRTFCUVZJc1EwRkJRU3hEUVVRNVFqczdRVUZFVlRzN1FVRkxXQ3hOUVVGTkxFTkJRVU1zVDBGQlVDeEhRVUZwUWl4UlFVRkJMRU5CUVVFaWZRPT1cbiIsInZhciBJdGVtX0RhdGE7XG5cbkl0ZW1fRGF0YSA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gSXRlbV9EYXRhKCRlbCkge1xuICAgIHZhciBkYXRhO1xuICAgIHRoaXMuJGVsID0gJGVsO1xuICAgIGRhdGEgPSAkZWwuZGF0YSgnaXRlbScpO1xuICAgIGlmICghZGF0YSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRWxlbWVudCBkb2Vzbid0IGNvbnRhaW4gYGRhdGEtaXRlbWAgYXR0cmlidXRlXCIpO1xuICAgIH1cbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICB9XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfZGF0YSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaW1hZ2U7XG4gICAgaW1hZ2UgPSB0aGlzLmRhdGFbJ2ltYWdlcyddW25hbWVdO1xuICAgIGlmICghaW1hZ2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGltYWdlO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X3NpemUgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGhlaWdodCwgaW1hZ2UsIHJlZiwgc2l6ZSwgd2lkdGg7XG4gICAgaW1hZ2UgPSB0aGlzLmdldF9kYXRhKG5hbWUpO1xuICAgIGlmICghaW1hZ2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgc2l6ZSA9IGltYWdlWydzaXplJ107XG4gICAgcmVmID0gc2l6ZS5zcGxpdCgneCcpLCB3aWR0aCA9IHJlZlswXSwgaGVpZ2h0ID0gcmVmWzFdO1xuICAgIHdpZHRoID0gcGFyc2VJbnQod2lkdGgpO1xuICAgIGhlaWdodCA9IHBhcnNlSW50KGhlaWdodCk7XG4gICAgcmV0dXJuIFt3aWR0aCwgaGVpZ2h0XTtcbiAgfTtcblxuICBJdGVtX0RhdGEucHJvdG90eXBlLmdldF91cmwgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGltYWdlO1xuICAgIGltYWdlID0gdGhpcy5nZXRfZGF0YShuYW1lKTtcbiAgICBpZiAoIWltYWdlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBpbWFnZVsndXJsJ107XG4gIH07XG5cbiAgSXRlbV9EYXRhLnByb3RvdHlwZS5nZXRfb3JfZmFsc2UgPSBmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAodGhpcy5kYXRhW2tleV0pIHtcbiAgICAgIHJldHVybiB0aGlzLmRhdGFba2V5XTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X3JhdGlvID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0X29yX2ZhbHNlKCdyYXRpbycpO1xuICB9O1xuXG4gIEl0ZW1fRGF0YS5wcm90b3R5cGUuZ2V0X3R5cGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRfb3JfZmFsc2UoJ3R5cGUnKTtcbiAgfTtcblxuICByZXR1cm4gSXRlbV9EYXRhO1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEl0ZW1fRGF0YTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pU1hSbGJWOUVZWFJoTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lTWFJsYlY5RVlYUmhMbU52Wm1abFpTSmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRU3hKUVVGQk96dEJRVUZOTzBWQlJWRXNiVUpCUVVVc1IwRkJSanRCUVVOYUxGRkJRVUU3U1VGQlFTeEpRVUZETEVOQlFVRXNSMEZCUkN4SFFVRlBPMGxCUTFBc1NVRkJRU3hIUVVGUExFZEJRVWNzUTBGQlF5eEpRVUZLTEVOQlFWVXNUVUZCVmp0SlFVVlFMRWxCUVVjc1EwRkJTU3hKUVVGUU8wRkJRME1zV1VGQlZTeEpRVUZCTEV0QlFVRXNRMEZCVFN3clEwRkJUaXhGUVVSWU96dEpRVWRCTEVsQlFVTXNRMEZCUVN4SlFVRkVMRWRCUVZFN1JVRlFTVHM3YzBKQlYySXNVVUZCUVN4SFFVRlZMRk5CUVVVc1NVRkJSanRCUVVOVUxGRkJRVUU3U1VGQlFTeExRVUZCTEVkQlFWRXNTVUZCUXl4RFFVRkJMRWxCUVUwc1EwRkJRU3hSUVVGQkxFTkJRVmtzUTBGQlFTeEpRVUZCTzBsQlF6TkNMRWxCUVdkQ0xFTkJRVWtzUzBGQmNFSTdRVUZCUVN4aFFVRlBMRTFCUVZBN08wRkJSVUVzVjBGQlR6dEZRVXBGT3p0elFrRk5WaXhSUVVGQkxFZEJRVlVzVTBGQlJTeEpRVUZHTzBGQlExUXNVVUZCUVR0SlFVRkJMRXRCUVVFc1IwRkJVU3hKUVVGRExFTkJRVUVzVVVGQlJDeERRVUZYTEVsQlFWZzdTVUZEVWl4SlFVRm5RaXhEUVVGSkxFdEJRWEJDTzBGQlFVRXNZVUZCVHl4TlFVRlFPenRKUVVWQkxFbEJRVUVzUjBGQlR5eExRVUZQTEVOQlFVRXNUVUZCUVR0SlFVVmtMRTFCUVd0Q0xFbEJRVWtzUTBGQlF5eExRVUZNTEVOQlFWa3NSMEZCV2l4RFFVRnNRaXhGUVVGRExHTkJRVVFzUlVGQlVUdEpRVVZTTEV0QlFVRXNSMEZCVVN4UlFVRkJMRU5CUVZVc1MwRkJWanRKUVVOU0xFMUJRVUVzUjBGQlV5eFJRVUZCTEVOQlFWVXNUVUZCVmp0QlFVVlVMRmRCUVU4c1EwRkJReXhMUVVGRUxFVkJRVkVzVFVGQlVqdEZRVmhGT3p0elFrRmhWaXhQUVVGQkxFZEJRVk1zVTBGQlJTeEpRVUZHTzBGQlExSXNVVUZCUVR0SlFVRkJMRXRCUVVFc1IwRkJVU3hKUVVGRExFTkJRVUVzVVVGQlJDeERRVUZYTEVsQlFWZzdTVUZEVWl4SlFVRm5RaXhEUVVGSkxFdEJRWEJDTzBGQlFVRXNZVUZCVHl4TlFVRlFPenRCUVVOQkxGZEJRVThzUzBGQlR5eERRVUZCTEV0QlFVRTdSVUZJVGpzN2MwSkJTMVFzV1VGQlFTeEhRVUZqTEZOQlFVVXNSMEZCUmp0SlFVTmlMRWxCUVVjc1NVRkJReXhEUVVGQkxFbEJRVTBzUTBGQlFTeEhRVUZCTEVOQlFWWTdRVUZEUXl4aFFVRlBMRWxCUVVNc1EwRkJRU3hKUVVGTkxFTkJRVUVzUjBGQlFTeEZRVVJtT3p0QlFVVkJMRmRCUVU4N1JVRklUVHM3YzBKQlMyUXNVMEZCUVN4SFFVRmpMRk5CUVVFN1YwRkJSeXhKUVVGRExFTkJRVUVzV1VGQlJDeERRVUZsTEU5QlFXWTdSVUZCU0RzN2MwSkJRMlFzVVVGQlFTeEhRVUZqTEZOQlFVRTdWMEZCUnl4SlFVRkRMRU5CUVVFc1dVRkJSQ3hEUVVGbExFMUJRV1k3UlVGQlNEczdPenM3TzBGQlIyWXNUVUZCVFN4RFFVRkRMRTlCUVZBc1IwRkJhVUlpZlE9PVxuIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgJCwgSG9va3MsIEl0ZW1fRGF0YSwgTGF6eV9Mb2FkZXI7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5JdGVtX0RhdGEgPSByZXF1aXJlKCcuL0l0ZW1fRGF0YScpO1xuXG5MYXp5X0xvYWRlciA9IChmdW5jdGlvbigpIHtcbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLkVsZW1lbnRzID0ge1xuICAgIGl0ZW06ICdQUF9MYXp5X0ltYWdlJyxcbiAgICBwbGFjZWhvbGRlcjogJ1BQX0xhenlfSW1hZ2VfX3BsYWNlaG9sZGVyJ1xuICB9O1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5JdGVtcyA9IFtdO1xuXG4gIGZ1bmN0aW9uIExhenlfTG9hZGVyKCkge1xuICAgIHRoaXMuc2V0dXBfZGF0YSgpO1xuICAgIHRoaXMucmVzaXplX2FsbCgpO1xuICAgIHRoaXMuYXR0YWNoX2V2ZW50cygpO1xuICB9XG5cblxuICAvKlxuICBcdFx0QWJzdHJhY3QgTWV0aG9kc1xuICAgKi9cblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYExhenlfTG9hZGVyYCBtdXN0IGltcGxlbWVudCBgcmVzaXplYCBtZXRob2RcIik7XG4gIH07XG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgTGF6eV9Mb2FkZXJgIG11c3QgaW1wbGVtZW50IGBsb2FkYCBtZXRob2RcIik7XG4gIH07XG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLmF1dG9sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYExhenlfTG9hZGVyYCBtdXN0IGltcGxlbWVudCBgYXV0b2xvYWRgIG1ldGhvZFwiKTtcbiAgfTtcblxuICBMYXp5X0xvYWRlci5wcm90b3R5cGUuc2V0dXBfZGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciAkaXRlbXM7XG4gICAgJGl0ZW1zID0gJChcIi5cIiArIHRoaXMuRWxlbWVudHMuaXRlbSk7XG4gICAgJGl0ZW1zLmVhY2goKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oa2V5LCBlbCkge1xuICAgICAgICB2YXIgJGVsO1xuICAgICAgICAkZWwgPSAkKGVsKTtcbiAgICAgICAgcmV0dXJuIF90aGlzLkl0ZW1zLnB1c2goe1xuICAgICAgICAgIGVsOiBlbCxcbiAgICAgICAgICAkZWw6ICRlbCxcbiAgICAgICAgICBkYXRhOiBuZXcgSXRlbV9EYXRhKCRlbCksXG4gICAgICAgICAgbG9hZGVkOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9O1xuXG5cbiAgLypcbiAgXHRcdE1ldGhvZHNcbiAgICovXG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLnJlc2l6ZV9hbGwgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaSwgaXRlbSwgbGVuLCByZWYsIHJlc3VsdHM7XG4gICAgcmVmID0gdGhpcy5JdGVtcztcbiAgICByZXN1bHRzID0gW107XG4gICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpdGVtID0gcmVmW2ldO1xuICAgICAgcmVzdWx0cy5wdXNoKHRoaXMucmVzaXplKGl0ZW0pKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgTGF6eV9Mb2FkZXIucHJvdG90eXBlLmxvYWRfYWxsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGksIGl0ZW0sIGxlbiwgcmVmLCByZXN1bHRzO1xuICAgIHJlZiA9IHRoaXMuSXRlbXM7XG4gICAgcmVzdWx0cyA9IFtdO1xuICAgIGZvciAoaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgaXRlbSA9IHJlZltpXTtcbiAgICAgIHRoaXMubG9hZChpdGVtKTtcbiAgICAgIHJlc3VsdHMucHVzaCh0aGlzLnJlbW92ZV9wbGFjZWhvbGRlcihpdGVtKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5yZW1vdmVfcGxhY2Vob2xkZXIgPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW0uJGVsLmZpbmQoXCIuXCIgKyB0aGlzLkVsZW1lbnRzLnBsYWNlaG9sZGVyICsgXCIsIG5vc2NyaXB0XCIpLnJlbW92ZSgpO1xuICB9O1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZGV0YWNoX2V2ZW50cygpO1xuICB9O1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5hdHRhY2hfZXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEhvb2tzLmFkZEFjdGlvbigncHAubGF6eS5hdXRvbG9hZCcsIHRoaXMuYXV0b2xvYWQpO1xuICB9O1xuXG4gIExhenlfTG9hZGVyLnByb3RvdHlwZS5kZXRhY2hfZXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEhvb2tzLnJlbW92ZUFjdGlvbigncHAubGF6eS5hdXRvbG9hZCcsIHRoaXMuYXV0b2xvYWQpO1xuICB9O1xuXG4gIHJldHVybiBMYXp5X0xvYWRlcjtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBMYXp5X0xvYWRlcjtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pVEdGNmVWOU1iMkZrWlhJdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUpNWVhwNVgweHZZV1JsY2k1amIyWm1aV1VpWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanRCUVVGQk96czdRVUZCUVN4SlFVRkJPenRCUVVkQkxFTkJRVUVzUjBGQlNTeFBRVUZCTEVOQlFWTXNVVUZCVkRzN1FVRkRTaXhMUVVGQkxFZEJRVkVzVDBGQlFTeERRVUZUTEZWQlFWUTdPMEZCUTFJc1UwRkJRU3hIUVVGWkxFOUJRVUVzUTBGQlV5eGhRVUZVT3p0QlFVVk9PM2RDUVVWTUxGRkJRVUVzUjBGRFF6dEpRVUZCTEVsQlFVRXNSVUZCWVN4bFFVRmlPMGxCUTBFc1YwRkJRU3hGUVVGaExEUkNRVVJpT3pzN2QwSkJSMFFzUzBGQlFTeEhRVUZQT3p0RlFVZE5MSEZDUVVGQk8wbEJRMW9zU1VGQlF5eERRVUZCTEZWQlFVUXNRMEZCUVR0SlFVTkJMRWxCUVVNc1EwRkJRU3hWUVVGRUxFTkJRVUU3U1VGRFFTeEpRVUZETEVOQlFVRXNZVUZCUkN4RFFVRkJPMFZCU0ZrN096dEJRVTFpT3pzN08zZENRVWRCTEUxQlFVRXNSMEZCVlN4VFFVRkJPMEZCUVVjc1ZVRkJWU3hKUVVGQkxFdEJRVUVzUTBGQlR5eDVSVUZCVUR0RlFVRmlPenQzUWtGRFZpeEpRVUZCTEVkQlFWVXNVMEZCUVR0QlFVRkhMRlZCUVZVc1NVRkJRU3hMUVVGQkxFTkJRVThzZFVWQlFWQTdSVUZCWWpzN2QwSkJRMVlzVVVGQlFTeEhRVUZWTEZOQlFVRTdRVUZCUnl4VlFVRlZMRWxCUVVFc1MwRkJRU3hEUVVGUExESkZRVUZRTzBWQlFXSTdPM2RDUVVkV0xGVkJRVUVzUjBGQldTeFRRVUZCTzBGQlExZ3NVVUZCUVR0SlFVRkJMRTFCUVVFc1IwRkJVeXhEUVVGQkxFTkJRVWNzUjBGQlFTeEhRVUZKTEVsQlFVTXNRMEZCUVN4UlFVRlJMRU5CUVVNc1NVRkJha0k3U1VGRlZDeE5RVUZOTEVOQlFVTXNTVUZCVUN4RFFVRlpMRU5CUVVFc1UwRkJRU3hMUVVGQk8yRkJRVUVzVTBGQlJTeEhRVUZHTEVWQlFVOHNSVUZCVUR0QlFVVllMRmxCUVVFN1VVRkJRU3hIUVVGQkxFZEJRVTBzUTBGQlFTeERRVUZITEVWQlFVZzdaVUZEVGl4TFFVRkRMRU5CUVVFc1MwRkJTeXhEUVVGRExFbEJRVkFzUTBGRFF6dFZRVUZCTEVWQlFVRXNSVUZCVVN4RlFVRlNPMVZCUTBFc1IwRkJRU3hGUVVGUkxFZEJSRkk3VlVGRlFTeEpRVUZCTEVWQlFWa3NTVUZCUVN4VFFVRkJMRU5CUVZjc1IwRkJXQ3hEUVVaYU8xVkJSMEVzVFVGQlFTeEZRVUZSTEV0QlNGSTdVMEZFUkR0TlFVaFhPMGxCUVVFc1EwRkJRU3hEUVVGQkxFTkJRVUVzU1VGQlFTeERRVUZhTzBWQlNGYzdPenRCUVdWYU96czdPM2RDUVVkQkxGVkJRVUVzUjBGQldTeFRRVUZCTzBGQlExZ3NVVUZCUVR0QlFVRkJPMEZCUVVFN1UwRkJRU3h4UTBGQlFUczdiVUpCUVVFc1NVRkJReXhEUVVGQkxFMUJRVVFzUTBGQlV5eEpRVUZVTzBGQlFVRTdPMFZCUkZjN08zZENRVWRhTEZGQlFVRXNSMEZCVlN4VFFVRkJPMEZCUTFRc1VVRkJRVHRCUVVGQk8wRkJRVUU3VTBGQlFTeHhRMEZCUVRzN1RVRkRReXhKUVVGRExFTkJRVUVzU1VGQlJDeERRVUZQTEVsQlFWQTdiVUpCUTBFc1NVRkJReXhEUVVGQkxHdENRVUZFTEVOQlFYRkNMRWxCUVhKQ08wRkJSa1E3TzBWQlJGTTdPM2RDUVV0V0xHdENRVUZCTEVkQlFXOUNMRk5CUVVVc1NVRkJSanRYUVVOdVFpeEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRWxCUVZRc1EwRkJaU3hIUVVGQkxFZEJRVWtzU1VGQlF5eERRVUZCTEZGQlFWRXNRMEZCUXl4WFFVRmtMRWRCUVRCQ0xGbEJRWHBETEVOQlFYTkVMRU5CUVVNc1RVRkJka1FzUTBGQlFUdEZRVVJ0UWpzN2QwSkJTWEJDTEU5QlFVRXNSMEZCVXl4VFFVRkJPMWRCUTFJc1NVRkJReXhEUVVGQkxHRkJRVVFzUTBGQlFUdEZRVVJST3p0M1FrRkhWQ3hoUVVGQkxFZEJRV1VzVTBGQlFUdFhRVU5rTEV0QlFVc3NRMEZCUXl4VFFVRk9MRU5CUVdkQ0xHdENRVUZvUWl4RlFVRnZReXhKUVVGRExFTkJRVUVzVVVGQmNrTTdSVUZFWXpzN2QwSkJSMllzWVVGQlFTeEhRVUZsTEZOQlFVRTdWMEZEWkN4TFFVRkxMRU5CUVVNc1dVRkJUaXhEUVVGdFFpeHJRa0ZCYmtJc1JVRkJkVU1zU1VGQlF5eERRVUZCTEZGQlFYaERPMFZCUkdNN096czdPenRCUVVkb1FpeE5RVUZOTEVOQlFVTXNUMEZCVUN4SFFVRnBRaUo5XG4iLCJ2YXIgJCwgTGF6eV9Mb2FkZXIsIExhenlfTWFzb25yeSwgX19XSU5ET1csXG4gIGJpbmQgPSBmdW5jdGlvbihmbiwgbWUpeyByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuIGZuLmFwcGx5KG1lLCBhcmd1bWVudHMpOyB9OyB9LFxuICBleHRlbmQgPSBmdW5jdGlvbihjaGlsZCwgcGFyZW50KSB7IGZvciAodmFyIGtleSBpbiBwYXJlbnQpIHsgaWYgKGhhc1Byb3AuY2FsbChwYXJlbnQsIGtleSkpIGNoaWxkW2tleV0gPSBwYXJlbnRba2V5XTsgfSBmdW5jdGlvbiBjdG9yKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gY2hpbGQ7IH0gY3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlOyBjaGlsZC5wcm90b3R5cGUgPSBuZXcgY3RvcigpOyBjaGlsZC5fX3N1cGVyX18gPSBwYXJlbnQucHJvdG90eXBlOyByZXR1cm4gY2hpbGQ7IH0sXG4gIGhhc1Byb3AgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkxhenlfTG9hZGVyID0gcmVxdWlyZSgnLi9MYXp5X0xvYWRlcicpO1xuXG5fX1dJTkRPVyA9IHJlcXVpcmUoJy4uL2dsb2JhbC9XaW5kb3cnKTtcblxuTGF6eV9NYXNvbnJ5ID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgZXh0ZW5kKExhenlfTWFzb25yeSwgc3VwZXJDbGFzcyk7XG5cbiAgZnVuY3Rpb24gTGF6eV9NYXNvbnJ5KCkge1xuICAgIHRoaXMubG9hZF9pdGVtc19pbl92aWV3ID0gYmluZCh0aGlzLmxvYWRfaXRlbXNfaW5fdmlldywgdGhpcyk7XG4gICAgdGhpcy5hdXRvbG9hZCA9IGJpbmQodGhpcy5hdXRvbG9hZCwgdGhpcyk7XG4gICAgdGhpcy5kZWJvdW5jZWRfbG9hZF9pdGVtc19pbl92aWV3ID0gXy5kZWJvdW5jZSh0aGlzLmxvYWRfaXRlbXNfaW5fdmlldywgNTApO1xuICAgIExhenlfTWFzb25yeS5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzKTtcbiAgfVxuXG4gIExhenlfTWFzb25yeS5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24oaXRlbSkge1xuICAgIHJldHVybiBpdGVtLiRlbC5jc3Moe1xuICAgICAgJ21pbi1oZWlnaHQnOiBNYXRoLmZsb29yKHRoaXMuZ2V0X3dpZHRoKCkgLyBpdGVtLmRhdGEuZ2V0X3JhdGlvKCkpXG4gICAgfSk7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5nZXRfd2lkdGggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJCgnLlBQX01hc29ucnlfX3NpemVyJykud2lkdGgoKTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmF1dG9sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMubG9hZF9pdGVtc19pbl92aWV3KCk7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24oaXRlbSkge1xuICAgIHZhciAkaW1hZ2UsIGZ1bGwsIHRodW1iO1xuICAgIHRodW1iID0gaXRlbS5kYXRhLmdldF91cmwoJ3RodW1iJyk7XG4gICAgZnVsbCA9IGl0ZW0uZGF0YS5nZXRfdXJsKCdmdWxsJyk7XG4gICAgaXRlbS4kZWwucHJlcGVuZChcIjxhIGhyZWY9XFxcIlwiICsgZnVsbCArIFwiXFxcIiByZWw9XFxcImdhbGxlcnlcXFwiPlxcbjxpbWcgc3JjPVxcXCJcIiArIHRodW1iICsgXCJcXFwiIGNsYXNzPVxcXCJpcy1sb2FkaW5nXFxcIiAvPlxcbjwvYT5cIikucmVtb3ZlQ2xhc3MoJ0xhenktSW1hZ2UnKTtcbiAgICBpdGVtLmxvYWRlZCA9IHRydWU7XG4gICAgJGltYWdlID0gaXRlbS4kZWwuZmluZCgnaW1nJyk7XG4gICAgcmV0dXJuICRpbWFnZS5pbWFnZXNMb2FkZWQoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICRpbWFnZS5hZGRDbGFzcygnaXMtbG9hZGVkJykucmVtb3ZlQ2xhc3MoJ2lzLWxvYWRpbmcnKTtcbiAgICAgICAgcmV0dXJuIGl0ZW0uJGVsLmNzcygnbWluLWhlaWdodCcsICcnKS5yZW1vdmVDbGFzcyhfdGhpcy5FbGVtZW50cy5pdGVtKS5maW5kKFwiLlwiICsgX3RoaXMuRWxlbWVudHMucGxhY2Vob2xkZXIpLmZhZGVPdXQoNDAwLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gJCh0aGlzKS5yZW1vdmUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmxvYWRfaXRlbXNfaW5fdmlldyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpLCBpdGVtLCBrZXksIGxlbiwgcmVmLCByZXN1bHRzO1xuICAgIHJlZiA9IHRoaXMuSXRlbXM7XG4gICAgcmVzdWx0cyA9IFtdO1xuICAgIGZvciAoa2V5ID0gaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGtleSA9ICsraSkge1xuICAgICAgaXRlbSA9IHJlZltrZXldO1xuICAgICAgaWYgKCFpdGVtLmxvYWRlZCAmJiB0aGlzLmluX2xvb3NlX3ZpZXcoaXRlbS5lbCkpIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMubG9hZChpdGVtKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHRzLnB1c2godm9pZCAwKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5pbl9sb29zZV92aWV3ID0gZnVuY3Rpb24oZWwpIHtcbiAgICB2YXIgcmVjdCwgc2Vuc2l0aXZpdHk7XG4gICAgaWYgKGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHNlbnNpdGl2aXR5ID0gMTAwO1xuICAgIHJldHVybiByZWN0LnRvcCArIHJlY3QuaGVpZ2h0ID49IC1zZW5zaXRpdml0eSAmJiByZWN0LmJvdHRvbSAtIHJlY3QuaGVpZ2h0IDw9IF9fV0lORE9XLmhlaWdodCArIHNlbnNpdGl2aXR5ICYmIHJlY3QubGVmdCArIHJlY3Qud2lkdGggPj0gLXNlbnNpdGl2aXR5ICYmIHJlY3QucmlnaHQgLSByZWN0LndpZHRoIDw9IF9fV0lORE9XLndpZHRoICsgc2Vuc2l0aXZpdHk7XG4gIH07XG5cbiAgTGF6eV9NYXNvbnJ5LnByb3RvdHlwZS5hdHRhY2hfZXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgJCh3aW5kb3cpLm9uKCdzY3JvbGwnLCB0aGlzLmRlYm91bmNlZF9sb2FkX2l0ZW1zX2luX3ZpZXcpO1xuICAgIHJldHVybiBMYXp5X01hc29ucnkuX19zdXBlcl9fLmF0dGFjaF9ldmVudHMuY2FsbCh0aGlzKTtcbiAgfTtcblxuICBMYXp5X01hc29ucnkucHJvdG90eXBlLmRldGFjaF9ldmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAkKHdpbmRvdykub2ZmKCdzY3JvbGwnLCB0aGlzLmRlYm91bmNlZF9sb2FkX2l0ZW1zX2luX3ZpZXcpO1xuICAgIHJldHVybiBMYXp5X01hc29ucnkuX19zdXBlcl9fLmRldGFjaF9ldmVudHMuY2FsbCh0aGlzKTtcbiAgfTtcblxuICByZXR1cm4gTGF6eV9NYXNvbnJ5O1xuXG59KShMYXp5X0xvYWRlcik7XG5cbm1vZHVsZS5leHBvcnRzID0gTGF6eV9NYXNvbnJ5O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lUR0Y2ZVY5TllYTnZibko1TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lUR0Y2ZVY5TllYTnZibko1TG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4SlFVRkJMSE5EUVVGQk8wVkJRVUU3T3pzN1FVRkJRU3hEUVVGQkxFZEJRVWtzVDBGQlFTeERRVUZUTEZGQlFWUTdPMEZCUTBvc1YwRkJRU3hIUVVGakxFOUJRVUVzUTBGQlV5eGxRVUZVT3p0QlFVTmtMRkZCUVVFc1IwRkJWeXhQUVVGQkxFTkJRVk1zYTBKQlFWUTdPMEZCUlV3N096dEZRVVZSTEhOQ1FVRkJPenM3U1VGRFdpeEpRVUZETEVOQlFVRXNORUpCUVVRc1IwRkJaME1zUTBGQlF5eERRVUZETEZGQlFVWXNRMEZCV1N4SlFVRkRMRU5CUVVFc2EwSkJRV0lzUlVGQmFVTXNSVUZCYWtNN1NVRkRhRU1zTkVOQlFVRTdSVUZHV1RzN2VVSkJTMklzVFVGQlFTeEhRVUZSTEZOQlFVVXNTVUZCUmp0WFFVTlFMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zUjBGQlZDeERRVUZoTzAxQlFVRXNXVUZCUVN4RlFVRmpMRWxCUVVrc1EwRkJReXhMUVVGTUxFTkJRVmtzU1VGQlF5eERRVUZCTEZOQlFVUXNRMEZCUVN4RFFVRkJMRWRCUVdVc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eFRRVUZXTEVOQlFVRXNRMEZCTTBJc1EwRkJaRHRMUVVGaU8wVkJSRTg3TzNsQ1FVbFNMRk5CUVVFc1IwRkJWeXhUUVVGQk8xZEJSVllzUTBGQlFTeERRVUZITEc5Q1FVRklMRU5CUVhsQ0xFTkJRVU1zUzBGQk1VSXNRMEZCUVR0RlFVWlZPenQ1UWtGSldDeFJRVUZCTEVkQlFWVXNVMEZCUVR0WFFVRkhMRWxCUVVNc1EwRkJRU3hyUWtGQlJDeERRVUZCTzBWQlFVZzdPM2xDUVVWV0xFbEJRVUVzUjBGQlRTeFRRVUZGTEVsQlFVWTdRVUZGVEN4UlFVRkJPMGxCUVVFc1MwRkJRU3hIUVVGUkxFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVml4RFFVRnRRaXhQUVVGdVFqdEpRVU5TTEVsQlFVRXNSMEZCVHl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFOUJRVllzUTBGQmJVSXNUVUZCYmtJN1NVRkZVQ3hKUVVGSkxFTkJRVU1zUjBGRFRDeERRVUZETEU5QlJFUXNRMEZEVlN4WlFVRkJMRWRCUTBjc1NVRkVTQ3hIUVVOUkxHdERRVVJTTEVkQlJVa3NTMEZHU2l4SFFVVlZMR3REUVVod1FpeERRVTFCTEVOQlFVTXNWMEZPUkN4RFFVMWpMRmxCVG1RN1NVRlJRU3hKUVVGSkxFTkJRVU1zVFVGQlRDeEhRVUZqTzBsQlEyUXNUVUZCUVN4SFFVRlRMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zU1VGQlZDeERRVUZsTEV0QlFXWTdWMEZEVkN4TlFVRk5MRU5CUVVNc1dVRkJVQ3hEUVVGdlFpeERRVUZCTEZOQlFVRXNTMEZCUVR0aFFVRkJMRk5CUVVFN1VVRkRia0lzVFVGQlRTeERRVUZETEZGQlFWQXNRMEZCYVVJc1YwRkJha0lzUTBGQk9FSXNRMEZCUXl4WFFVRXZRaXhEUVVFMFF5eFpRVUUxUXp0bFFVTkJMRWxCUVVrc1EwRkJReXhIUVVOTUxFTkJRVU1zUjBGRVJDeERRVU5OTEZsQlJFNHNSVUZEYjBJc1JVRkVjRUlzUTBGRlFTeERRVUZETEZkQlJrUXNRMEZGWXl4TFFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExFbEJSbmhDTEVOQlIwRXNRMEZCUXl4SlFVaEVMRU5CUjA4c1IwRkJRU3hIUVVGSkxFdEJRVU1zUTBGQlFTeFJRVUZSTEVOQlFVTXNWMEZJY2tJc1EwRkpRU3hEUVVGRExFOUJTa1FzUTBGSlV5eEhRVXBVTEVWQlNXTXNVMEZCUVR0cFFrRkJSeXhEUVVGQkxFTkJRVWNzU1VGQlNDeERRVUZUTEVOQlFVTXNUVUZCVml4RFFVRkJPMUZCUVVnc1EwRktaRHROUVVadFFqdEpRVUZCTEVOQlFVRXNRMEZCUVN4RFFVRkJMRWxCUVVFc1EwRkJjRUk3UlVGbVN6czdlVUpCTWtKT0xHdENRVUZCTEVkQlFXOUNMRk5CUVVFN1FVRkRia0lzVVVGQlFUdEJRVUZCTzBGQlFVRTdVMEZCUVN4cFJFRkJRVHM3VFVGRFF5eEpRVUZITEVOQlFVa3NTVUZCU1N4RFFVRkRMRTFCUVZRc1NVRkJiMElzU1VGQlF5eERRVUZCTEdGQlFVUXNRMEZCWjBJc1NVRkJTU3hEUVVGRExFVkJRWEpDTEVOQlFYWkNPM0ZDUVVORExFbEJRVU1zUTBGQlFTeEpRVUZFTEVOQlFVOHNTVUZCVUN4SFFVUkVPMDlCUVVFc1RVRkJRVHMyUWtGQlFUczdRVUZFUkRzN1JVRkViVUk3TzNsQ1FVOXdRaXhoUVVGQkxFZEJRV1VzVTBGQlJTeEZRVUZHTzBGQlEyUXNVVUZCUVR0SlFVRkJMRWxCUVcxQ0xHZERRVUZ1UWp0QlFVRkJMR0ZCUVU4c1MwRkJVRHM3U1VGRFFTeEpRVUZCTEVkQlFVOHNSVUZCUlN4RFFVRkRMSEZDUVVGSUxFTkJRVUU3U1VGSFVDeFhRVUZCTEVkQlFXTTdRVUZEWkN4WFFVVkRMRWxCUVVrc1EwRkJReXhIUVVGTUxFZEJRVmNzU1VGQlNTeERRVUZETEUxQlFXaENMRWxCUVRCQ0xFTkJRVU1zVjBGQk0wSXNTVUZEUXl4SlFVRkpMRU5CUVVNc1RVRkJUQ3hIUVVGakxFbEJRVWtzUTBGQlF5eE5RVUZ1UWl4SlFVRTJRaXhSUVVGUkxFTkJRVU1zVFVGQlZDeEhRVUZyUWl4WFFVUm9SQ3hKUVVsRExFbEJRVWtzUTBGQlF5eEpRVUZNTEVkQlFWa3NTVUZCU1N4RFFVRkRMRXRCUVdwQ0xFbEJRVEJDTEVOQlFVTXNWMEZLTlVJc1NVRkxReXhKUVVGSkxFTkJRVU1zUzBGQlRDeEhRVUZoTEVsQlFVa3NRMEZCUXl4TFFVRnNRaXhKUVVFeVFpeFJRVUZSTEVOQlFVTXNTMEZCVkN4SFFVRnBRanRGUVdKb1F6czdlVUpCYVVKbUxHRkJRVUVzUjBGQlpTeFRRVUZCTzBsQlEyUXNRMEZCUVN4RFFVRkhMRTFCUVVnc1EwRkJWeXhEUVVGRExFVkJRVm9zUTBGQlpTeFJRVUZtTEVWQlFYbENMRWxCUVVNc1EwRkJRU3cwUWtGQk1VSTdWMEZEUVN3NFEwRkJRVHRGUVVaak96dDVRa0ZKWml4aFFVRkJMRWRCUVdVc1UwRkJRVHRKUVVOa0xFTkJRVUVzUTBGQlJ5eE5RVUZJTEVOQlFWY3NRMEZCUXl4SFFVRmFMRU5CUVdkQ0xGRkJRV2hDTEVWQlFUQkNMRWxCUVVNc1EwRkJRU3cwUWtGQk0wSTdWMEZEUVN3NFEwRkJRVHRGUVVaak96czdPMGRCZUVWWE96dEJRVFJGTTBJc1RVRkJUU3hEUVVGRExFOUJRVkFzUjBGQmFVSWlmUT09XG4iLCJ2YXIgJCwgSG9va3MsIExhenlfTWFzb25yeSwgTWFzb25yeTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbk1hc29ucnkgPSByZXF1aXJlKCcuL2NsYXNzL01hc29ucnknKTtcblxuTGF6eV9NYXNvbnJ5ID0gcmVxdWlyZSgnLi9sYXp5L0xhenlfTWFzb25yeScpO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3BwLm1hc29ucnkuc3RhcnQvYmVmb3JlJywgZnVuY3Rpb24oKSB7XG4gIHZhciBMYXp5X0hhbmRsZXI7XG4gIExhenlfSGFuZGxlciA9IEhvb2tzLmFwcGx5RmlsdGVycygncHAubGF6eS5oYW5kbGVyJywgTGF6eV9NYXNvbnJ5KTtcbiAgbmV3IExhenlfSGFuZGxlcigpO1xufSk7XG5cbkhvb2tzLmFkZEFjdGlvbigncHAubWFzb25yeS5zdGFydC9jb21wbGV0ZScsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4gSG9va3MuZG9BY3Rpb24oJ3BwLmxhenkuYXV0b2xvYWQnKTtcbn0pO1xuXG5Ib29rcy5hZGRBY3Rpb24oJ3BwLnJlYWR5JywgZnVuY3Rpb24oKSB7XG4gIGlmICgkKCcuUFBfTWFzb25yeScpLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gSG9va3MuYWRkRmlsdGVyKCdwcC5wb3J0Zm9saW8uaGFuZGxlcicsIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG5ldyBNYXNvbnJ5KCk7XG4gICAgfSk7XG4gIH1cbn0pO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2liV0Z6YjI1eWVTNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSW0xaGMyOXVjbmt1WTI5bVptVmxJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSkJRVUZCTEVsQlFVRTdPMEZCUVVFc1EwRkJRU3hIUVVGSkxFOUJRVUVzUTBGQlV5eFJRVUZVT3p0QlFVTktMRXRCUVVFc1IwRkJVU3hQUVVGQkxFTkJRVk1zVlVGQlZEczdRVUZEVWl4UFFVRkJMRWRCUVZVc1QwRkJRU3hEUVVGVExHbENRVUZVT3p0QlFVTldMRmxCUVVFc1IwRkJaU3hQUVVGQkxFTkJRVk1zY1VKQlFWUTdPMEZCUldZc1MwRkJTeXhEUVVGRExGTkJRVTRzUTBGQlowSXNlVUpCUVdoQ0xFVkJRVEpETEZOQlFVRTdRVUZITVVNc1RVRkJRVHRGUVVGQkxGbEJRVUVzUjBGQlpTeExRVUZMTEVOQlFVTXNXVUZCVGl4RFFVRnRRaXhwUWtGQmJrSXNSVUZCYzBNc1dVRkJkRU03UlVGRFdDeEpRVUZCTEZsQlFVRXNRMEZCUVR0QlFVcHpReXhEUVVFelF6czdRVUZSUVN4TFFVRkxMRU5CUVVNc1UwRkJUaXhEUVVGblFpd3lRa0ZCYUVJc1JVRkJOa01zVTBGQlFUdFRRVU0xUXl4TFFVRkxMRU5CUVVNc1VVRkJUaXhEUVVGbExHdENRVUZtTzBGQlJEUkRMRU5CUVRkRE96dEJRVWxCTEV0QlFVc3NRMEZCUXl4VFFVRk9MRU5CUVdkQ0xGVkJRV2hDTEVWQlFUUkNMRk5CUVVFN1JVRkRNMElzU1VGQlJ5eERRVUZCTEVOQlFVY3NZVUZCU0N4RFFVRnJRaXhEUVVGRExFMUJRVzVDTEVkQlFUUkNMRU5CUVM5Q08xZEJRME1zUzBGQlN5eERRVUZETEZOQlFVNHNRMEZCWjBJc2MwSkJRV2hDTEVWQlFYZERMRk5CUVVFN1lVRkJUeXhKUVVGQkxFOUJRVUVzUTBGQlFUdEpRVUZRTEVOQlFYaERMRVZCUkVRN08wRkJSREpDTEVOQlFUVkNJbjA9XG4iLCJcbi8qXG4gICAgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBIb29rcywgSXRlbV9EYXRhLCBnZXRfZGF0YTtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbkl0ZW1fRGF0YSA9IHJlcXVpcmUoJy4uL2xhenkvSXRlbV9EYXRhJyk7XG5cbmdldF9kYXRhID0gZnVuY3Rpb24oZWwpIHtcbiAgdmFyICRjb250YWluZXIsICRlbCwgJGl0ZW1zLCBpdGVtcztcbiAgJGVsID0gJChlbCk7XG4gICRjb250YWluZXIgPSAkZWwuY2xvc2VzdCgnLlBQX0dhbGxlcnknKTtcbiAgJGl0ZW1zID0gJGNvbnRhaW5lci5maW5kKCcuUFBfR2FsbGVyeV9faXRlbScpO1xuICBpdGVtcyA9ICRpdGVtcy5tYXAoZnVuY3Rpb24oa2V5LCBpdGVtKSB7XG4gICAgdmFyIGk7XG4gICAgaSA9IG5ldyBJdGVtX0RhdGEoJChpdGVtKSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNyYzogaS5nZXRfdXJsKCdmdWxsJyksXG4gICAgICB0aHVtYjogaS5nZXRfdXJsKCd0aHVtYicpXG4gICAgfTtcbiAgfSk7XG4gIHJldHVybiBpdGVtcztcbn07XG5cbkhvb2tzLmFkZEFjdGlvbigncHAucmVhZHknLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICQoJy5QUF9HYWxsZXJ5X19pdGVtJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgIHZhciAkZWw7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICRlbCA9ICQodGhpcyk7XG4gICAgcmV0dXJuICRlbC5saWdodEdhbGxlcnkoe1xuICAgICAgZHluYW1pYzogdHJ1ZSxcbiAgICAgIGR5bmFtaWNFbDogZ2V0X2RhdGEodGhpcyksXG4gICAgICBpbmRleDogJCgnLlBQX0dhbGxlcnlfX2l0ZW0nKS5pbmRleCgkZWwpLFxuICAgICAgc3BlZWQ6IDM1MCxcbiAgICAgIHByZWxvYWQ6IDMsXG4gICAgICBkb3dubG9hZDogZmFsc2VcbiAgICB9KTtcbiAgfSk7XG59KTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pY0c5d2RYQXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lKd2IzQjFjQzVqYjJabVpXVWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqdEJRVUZCT3pzN1FVRkJRU3hKUVVGQk96dEJRVWRCTEVOQlFVRXNSMEZCU1N4UFFVRkJMRU5CUVZNc1VVRkJWRHM3UVVGRFNpeExRVUZCTEVkQlFWRXNUMEZCUVN4RFFVRlRMRlZCUVZRN08wRkJRMUlzVTBGQlFTeEhRVUZaTEU5QlFVRXNRMEZCVXl4dFFrRkJWRHM3UVVGRldpeFJRVUZCTEVkQlFWY3NVMEZCUlN4RlFVRkdPMEZCUTFZc1RVRkJRVHRGUVVGQkxFZEJRVUVzUjBGQlRTeERRVUZCTEVOQlFVY3NSVUZCU0R0RlFVTk9MRlZCUVVFc1IwRkJZU3hIUVVGSExFTkJRVU1zVDBGQlNpeERRVUZoTEdGQlFXSTdSVUZGWWl4TlFVRkJMRWRCUVZNc1ZVRkJWU3hEUVVGRExFbEJRVmdzUTBGQmFVSXNiVUpCUVdwQ08wVkJSVlFzUzBGQlFTeEhRVUZSTEUxQlFVMHNRMEZCUXl4SFFVRlFMRU5CUVZjc1UwRkJSU3hIUVVGR0xFVkJRVThzU1VGQlVEdEJRVU5zUWl4UlFVRkJPMGxCUVVFc1EwRkJRU3hIUVVGUkxFbEJRVUVzVTBGQlFTeERRVUZYTEVOQlFVRXNRMEZCUnl4SlFVRklMRU5CUVZnN1FVRkZVaXhYUVVGUE8wMUJRMDRzUjBGQlFTeEZRVUZQTEVOQlFVTXNRMEZCUXl4UFFVRkdMRU5CUVZjc1RVRkJXQ3hEUVVSRU8wMUJSVTRzUzBGQlFTeEZRVUZQTEVOQlFVTXNRMEZCUXl4UFFVRkdMRU5CUVZjc1QwRkJXQ3hEUVVaRU96dEZRVWhYTEVOQlFWZzdRVUZUVWl4VFFVRlBPMEZCWmtjN08wRkJhMEpZTEV0QlFVc3NRMEZCUXl4VFFVRk9MRU5CUVdkQ0xGVkJRV2hDTEVWQlFUUkNMRk5CUVVFN1UwRkZNMElzUTBGQlFTeERRVUZITEcxQ1FVRklMRU5CUVhkQ0xFTkJRVU1zUlVGQmVrSXNRMEZCTkVJc1QwRkJOVUlzUlVGQmNVTXNVMEZCUlN4RFFVRkdPMEZCUTNCRExGRkJRVUU3U1VGQlFTeERRVUZETEVOQlFVTXNZMEZCUml4RFFVRkJPMGxCUjBFc1IwRkJRU3hIUVVGTkxFTkJRVUVzUTBGQlJ5eEpRVUZJTzFkQlIwNHNSMEZCUnl4RFFVRkRMRmxCUVVvc1EwRkRRenROUVVGQkxFOUJRVUVzUlVGQlZ5eEpRVUZZTzAxQlEwRXNVMEZCUVN4RlFVRlhMRkZCUVVFc1EwRkJWU3hKUVVGV0xFTkJSRmc3VFVGRlFTeExRVUZCTEVWQlFWY3NRMEZCUVN4RFFVRkhMRzFDUVVGSUxFTkJRWGRDTEVOQlFVTXNTMEZCZWtJc1EwRkJLMElzUjBGQkwwSXNRMEZHV0R0TlFVZEJMRXRCUVVFc1JVRkJWeXhIUVVoWU8wMUJTVUVzVDBGQlFTeEZRVUZYTEVOQlNsZzdUVUZMUVN4UlFVRkJMRVZCUVZjc1MwRk1XRHRMUVVSRU8wVkJVRzlETEVOQlFYSkRPMEZCUmpKQ0xFTkJRVFZDSW4wPVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
