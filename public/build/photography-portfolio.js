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

},{"./core/Photography_Portfolio":2,"./gallery/popup":6,"./lazy/Abstract_Lazy_Loader":7,"./lazy/Item_Data":8,"./lazy/start":10,"./portfolio/Portfolio_Interface":12,"./portfolio/start":14}],2:[function(require,module,exports){
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
module.exports = {


    /**
     * Thank you Russ for helping me avoid writing this myself:
     * @url https://remysharp.com/2010/07/21/throttling-function-calls/#comment-2745663594
     */
    throttle: function ( fn, threshhold, scope ) {
        threshhold || (threshhold = 250)
        var last,
            deferTimer
        return function () {
            var context = scope || this

            var now  = +new Date,
                args = arguments
            if ( last && now < last + threshhold ) {
                // hold on to it
                clearTimeout( deferTimer )
                deferTimer = setTimeout( function () {
                    last = now
                    fn.apply( context, args )
                }, threshhold + last - now )
            } else {
                last = now
                fn.apply( context, args )
            }
        }
    }


}
},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var $, Hooks, Item_Data, lightGallery;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Item_Data = require('../lazy/Item_Data');

lightGallery = function($el) {
  var defaults, gallery_data, get_settings, settings, single_item_data;
  defaults = {
    dynamic: true,
    speed: 350,
    preload: 3,
    download: false,
    escKey: false,
    thumbnail: true,
    showThumbByDefault: true
  };
  settings = $.extend({}, defaults, window.__phort.lightGallery);
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
      thumb: data.get_url('thumb'),
      subHtml: $item.find('.PP_Gallery__caption').html() || ''
    };
  };
  gallery_data = function($items) {
    return $items.map(function() {
      return single_item_data($(this));
    });
  };
  get_settings = function($items, index) {
    settings.index = index;
    settings.dynamicEl = gallery_data($items);
    settings.videoMaxWidth = $(window).width() * 0.8;
    return Hooks.applyFilters('phort.lightGallery.settings', settings);
  };
  return {
    destroy: function() {
      return $el.data('lightGallery').destroy();
    },
    open: function($items, index) {
      return $el.lightGallery(get_settings($items, index));
    }
  };
};

Hooks.addAction('phort.core.ready', function() {
  var $el;
  $el = false;
  if ($('.PP_Popup--lightgallery').length === 0) {
    return false;
  }
  $(document).on('click', '.PP_Popup--lightgallery .PP_Gallery__item', function(e) {
    var $items, index;
    e.preventDefault();
    $el = $(this);
    $items = $el.closest('.PP_Gallery').find('.PP_Gallery__item');
    index = $items.index($el);
    return lightGallery($el).open($items, index);
  });
  if (Hooks.applyFilters('phort.gallery.custom_esc', true)) {
    return $(window).on('keydown', function(e) {
      if ($el && e.keyCode === 27) {
        e.preventDefault();
        lightGallery($el).destroy();
        $el = false;
      }
    });
  }
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../lazy/Item_Data":8}],6:[function(require,module,exports){
var gallery;

gallery = window.__phort.popup_gallery || 'lightgallery';

if (gallery === 'lightgallery') {
  require('./lightGallery');
}


},{"./lightGallery":5}],7:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var $, Abstract_Lazy_Loader, Hooks, Item_Data, __WINDOW, throttle,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Item_Data = require('./Item_Data');

__WINDOW = require('../core/Window');

throttle = require('../core/Utilities').throttle;

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
    this.throttled_autoload = throttle(this.autoload, 50);
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

},{"../core/Utilities":3,"../core/Window":4,"./Item_Data":8}],8:[function(require,module,exports){
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


},{}],9:[function(require,module,exports){
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

},{"../core/Window":4,"./Abstract_Lazy_Loader":7}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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

},{"./Portfolio_Interface":12}],14:[function(require,module,exports){
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

},{"./Portfolio_Event_Manager":11,"./Portfolio_Masonry":13,"lazy/Lazy_Masonry":9}]},{},[1])


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jb3JlL1Bob3RvZ3JhcGh5X1BvcnRmb2xpby5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY29yZS9VdGlsaXRpZXMuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY29yZS9XaW5kb3cuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvbGlnaHRHYWxsZXJ5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9nYWxsZXJ5L3BvcHVwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0Fic3RyYWN0X0xhenlfTG9hZGVyLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0l0ZW1fRGF0YS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvbGF6eS9MYXp5X01hc29ucnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvc3RhcnQuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL3BvcnRmb2xpby9Qb3J0Zm9saW9fRXZlbnRfTWFuYWdlci5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL1BvcnRmb2xpb19JbnRlcmZhY2UuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL3BvcnRmb2xpby9Qb3J0Zm9saW9fTWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL3N0YXJ0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7OztBQUFBLElBQUE7O0FBR0EsS0FBQSxHQUFRLE9BQUEsQ0FBUyxVQUFUOztBQUNSLENBQUEsR0FBSSxPQUFBLENBQVMsUUFBVDs7QUFJSixNQUFNLENBQUMsVUFBUCxHQUVD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ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiIyMjXG4gICAgTG9hZCBEZXBlbmRlbmNpZXNcbiMjI1xuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuJCA9IHJlcXVpcmUoICdqUXVlcnknIClcblxuXG4jIEV4cG9zZSBzb21lIFBob3RvZ3JhcGh5IFBvcnRmb2xpbyBtb2R1bGVzIHRvIHRoZSBwdWJsaWMgZm9yIGV4dGVuc2liaWxpdHlcbndpbmRvdy5QUF9Nb2R1bGVzID1cblx0IyBFeHRlbmQgUG9ydGZvbGlvIEludGVyZmFjZSB0byBidWlsZCBjdXN0b20gcG9ydGZvbGlvIGxheW91dHMgYmFzZWQgb24gUFAgRXZlbnRzXG5cdFBvcnRmb2xpb19JbnRlcmZhY2U6IHJlcXVpcmUoICcuL3BvcnRmb2xpby9Qb3J0Zm9saW9fSW50ZXJmYWNlJyApXG5cblx0IyBVc2UgYEl0ZW1fRGF0YWAgdG8gZ2V0IGZvcm1hdHRlZCBpdGVtIGltYWdlIHNpemVzIGZvciBsYXp5IGxhb2Rpbmdcblx0SXRlbV9EYXRhOiByZXF1aXJlKCAnLi9sYXp5L0l0ZW1fRGF0YScgKVxuXG5cdCMgRXh0ZW5kIEFic3RyYWN0X0xhenlfTG9kZXIgdG8gaW1wbGVtZW50IGxhenkgbG9hZGVyIGZvciB5b3VyIGxheW91dFxuXHRBYnN0cmFjdF9MYXp5X0xvYWRlcjogcmVxdWlyZSggJy4vbGF6eS9BYnN0cmFjdF9MYXp5X0xvYWRlcicgKVxuXG4jIyNcblx0SW5jbHVkZXNcbiMjI1xuXG4jIFN0YXJ0IFBvcnRmb2xpb1xucmVxdWlyZSAnLi9wb3J0Zm9saW8vc3RhcnQnXG5cbiMgR2FsbGVyeVxucmVxdWlyZSAnLi9nYWxsZXJ5L3BvcHVwJ1xuXG4jIExhenkgTG9hZGluZ1xucmVxdWlyZSAnLi9sYXp5L3N0YXJ0J1xuXG5cblxuXG4jIyNcblx0Qm9vdCBvbiBgZG9jdW1lbnQucmVhZHlgXG4jIyNcbiQoIGRvY3VtZW50ICkucmVhZHkgLT5cblxuXHQjIE9ubHkgcnVuIHRoaXMgc2NyaXB0IHdoZW4gYm9keSBoYXMgYFBQX1BvcnRmb2xpb2AgY2xhc3Ncblx0cmV0dXJuIGlmIG5vdCAkKCAnYm9keScgKS5oYXNDbGFzcyggJ1BQX1BvcnRmb2xpbycgKVxuXG5cdCMgQm9vdFxuXHRQaG90b2dyYXBoeV9Qb3J0Zm9saW8gPSBuZXcgKCByZXF1aXJlKCAnLi9jb3JlL1Bob3RvZ3JhcGh5X1BvcnRmb2xpbycgKSApKClcblx0UGhvdG9ncmFwaHlfUG9ydGZvbGlvLnJlYWR5KClcblxuXHRyZXR1cm4iLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuJCA9IHJlcXVpcmUoICdqUXVlcnknIClcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcblxuXG5jbGFzcyBDb3JlXG5cblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0SG9va3MuYWRkQWN0aW9uICdwaG9ydC5jb3JlLnJlYWR5JywgQHdhaXRfZm9yX2xvYWRcblxuXHQjIFRyaWdnZXIgcGhvcnQuY29yZS5yZWFkeVxuXHRyZWFkeTogPT5cblx0XHRpZiBIb29rcy5hcHBseUZpbHRlcnMoICdwaG9ydC5jb3JlLnJlYWR5JywgdHJ1ZSApXG5cdFx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQuY29yZS5yZWFkeSdcblx0XHRyZXR1cm5cblxuXHR3YWl0X2Zvcl9sb2FkOiA9PlxuXHRcdCMgVHJpZ2dlciBpbWFnZXNMb2FkZWQgZXZlbnQgd2hlbiBpbWFnZXMgaGF2ZSBsb2FkZWRcblx0XHQkKCAnLlBQX1dyYXBwZXInICkuaW1hZ2VzTG9hZGVkKCBAbG9hZGVkIClcblxuXHQjIFRyaWdnZXIgcGhvcnQuY29yZS5sb2FkZWRcblx0bG9hZGVkOiAtPlxuXHRcdGlmIEhvb2tzLmFwcGx5RmlsdGVycyggJ3Bob3J0LmNvcmUubG9hZGVkJywgdHJ1ZSApXG5cdFx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQuY29yZS5sb2FkZWQnXG5cblx0XHRyZXR1cm5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IENvcmUiLCJtb2R1bGUuZXhwb3J0cyA9IHtcblxuXG4gICAgLyoqXG4gICAgICogVGhhbmsgeW91IFJ1c3MgZm9yIGhlbHBpbmcgbWUgYXZvaWQgd3JpdGluZyB0aGlzIG15c2VsZjpcbiAgICAgKiBAdXJsIGh0dHBzOi8vcmVteXNoYXJwLmNvbS8yMDEwLzA3LzIxL3Rocm90dGxpbmctZnVuY3Rpb24tY2FsbHMvI2NvbW1lbnQtMjc0NTY2MzU5NFxuICAgICAqL1xuICAgIHRocm90dGxlOiBmdW5jdGlvbiAoIGZuLCB0aHJlc2hob2xkLCBzY29wZSApIHtcbiAgICAgICAgdGhyZXNoaG9sZCB8fCAodGhyZXNoaG9sZCA9IDI1MClcbiAgICAgICAgdmFyIGxhc3QsXG4gICAgICAgICAgICBkZWZlclRpbWVyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgY29udGV4dCA9IHNjb3BlIHx8IHRoaXNcblxuICAgICAgICAgICAgdmFyIG5vdyAgPSArbmV3IERhdGUsXG4gICAgICAgICAgICAgICAgYXJncyA9IGFyZ3VtZW50c1xuICAgICAgICAgICAgaWYgKCBsYXN0ICYmIG5vdyA8IGxhc3QgKyB0aHJlc2hob2xkICkge1xuICAgICAgICAgICAgICAgIC8vIGhvbGQgb24gdG8gaXRcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoIGRlZmVyVGltZXIgKVxuICAgICAgICAgICAgICAgIGRlZmVyVGltZXIgPSBzZXRUaW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3QgPSBub3dcbiAgICAgICAgICAgICAgICAgICAgZm4uYXBwbHkoIGNvbnRleHQsIGFyZ3MgKVxuICAgICAgICAgICAgICAgIH0sIHRocmVzaGhvbGQgKyBsYXN0IC0gbm93IClcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGFzdCA9IG5vd1xuICAgICAgICAgICAgICAgIGZuLmFwcGx5KCBjb250ZXh0LCBhcmdzIClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuXG59IiwiSG9va3MgPSByZXF1aXJlKCAnd3BfaG9va3MnIClcblxuXG5nZXRfc2l6ZSA9IC0+XG5cdHdpZHRoIDogd2luZG93LmlubmVyV2lkdGggfHwgJHdpbmRvdy53aWR0aCgpXG5cdGhlaWdodDogd2luZG93LmlubmVySGVpZ2h0IHx8ICR3aW5kb3cuaGVpZ2h0KClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldF9zaXplKCkiLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuJCA9IHJlcXVpcmUoIFwialF1ZXJ5XCIgKVxuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuSXRlbV9EYXRhID0gcmVxdWlyZSggJy4uL2xhenkvSXRlbV9EYXRhJyApXG5cblxubGlnaHRHYWxsZXJ5ID0gKCAkZWwgKSAtPlxuXG5cdGRlZmF1bHRzID1cblx0XHRkeW5hbWljIDogdHJ1ZVxuXHRcdHNwZWVkICAgOiAzNTBcblx0XHRwcmVsb2FkIDogM1xuXHRcdGRvd25sb2FkOiBmYWxzZVxuXHRcdGVzY0tleSAgOiBmYWxzZSAjIFdlJ3JlIHJvbGxpbmcgb3VyIG93blxuXG5cdFx0dGh1bWJuYWlsICAgICAgICAgOiB0cnVlXG5cdFx0c2hvd1RodW1iQnlEZWZhdWx0OiB0cnVlXG5cblx0c2V0dGluZ3MgPSAkLmV4dGVuZCgge30sIGRlZmF1bHRzLCB3aW5kb3cuX19waG9ydC5saWdodEdhbGxlcnkgKVxuXG5cblx0c2luZ2xlX2l0ZW1fZGF0YSA9ICggJGl0ZW0gKSAtPlxuXHRcdGRhdGEgPSBuZXcgSXRlbV9EYXRhKCAkaXRlbSApXG5cblx0XHRpZiBkYXRhLmdldF90eXBlKCApIGlzICd2aWRlbydcblx0XHRcdGZ1bGwgPSBkYXRhLmdldF9vcl9mYWxzZSggJ3ZpZGVvX3VybCcgKVxuXHRcdGVsc2Vcblx0XHRcdGZ1bGwgPSBkYXRhLmdldF91cmwoICdmdWxsJyApXG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0c3JjICA6IGZ1bGxcblx0XHRcdHRodW1iOiBkYXRhLmdldF91cmwoICd0aHVtYicgKVxuXHRcdFx0c3ViSHRtbDogJGl0ZW0uZmluZCgnLlBQX0dhbGxlcnlfX2NhcHRpb24nKS5odG1sKCkgfHwgJydcblx0XHR9XG5cblx0Z2FsbGVyeV9kYXRhID0gKCAkaXRlbXMgKSAtPlxuXHRcdCRpdGVtcy5tYXAgLT4gc2luZ2xlX2l0ZW1fZGF0YSggJCggdGhpcyApIClcblxuXHRnZXRfc2V0dGluZ3MgPSAoICRpdGVtcywgaW5kZXggKSAtPlxuXHRcdHNldHRpbmdzLmluZGV4ICAgICAgICAgPSBpbmRleFxuXHRcdHNldHRpbmdzLmR5bmFtaWNFbCAgICAgPSBnYWxsZXJ5X2RhdGEoICRpdGVtcyApXG5cdFx0c2V0dGluZ3MudmlkZW9NYXhXaWR0aCA9ICQoIHdpbmRvdyApLndpZHRoKCApICogMC44XG5cblx0XHRIb29rcy5hcHBseUZpbHRlcnMgJ3Bob3J0LmxpZ2h0R2FsbGVyeS5zZXR0aW5ncycsIHNldHRpbmdzXG5cblxuXHRkZXN0cm95OiAtPlxuXHRcdCRlbC5kYXRhKCAnbGlnaHRHYWxsZXJ5JyApLmRlc3Ryb3koIClcblxuXHRvcGVuOiAoICRpdGVtcywgaW5kZXggKSAtPlxuXHRcdCRlbC5saWdodEdhbGxlcnkoIGdldF9zZXR0aW5ncyggJGl0ZW1zLCBpbmRleCApIClcblxuXG5Ib29rcy5hZGRBY3Rpb24gJ3Bob3J0LmNvcmUucmVhZHknLCAtPlxuXG5cdCMgJGVsIGlzIGdvaW5nIHRvIGJlIHRoZSBjdXJyZW50IGdhbGxlcnkgZWxlbWVudCBvbkNsaWNrXG5cdCRlbCA9IGZhbHNlXG5cblx0IyBPbmx5IGVuYWJsZSBqUXVlcnkgbGlnaHRHYWxsZXJ5IGlmIHRoZSBwb3B1cCBnYWxsZXJ5IGNsYXNzIGlzIGZvdW5kXG5cdGlmICQoICcuUFBfUG9wdXAtLWxpZ2h0Z2FsbGVyeScgKS5sZW5ndGggaXMgMFxuXHRcdHJldHVybiBmYWxzZVxuXG5cdCMgT3BlbiBnYWxsZXJ5XG5cdCQoIGRvY3VtZW50ICkub24gJ2NsaWNrJywgJy5QUF9Qb3B1cC0tbGlnaHRnYWxsZXJ5IC5QUF9HYWxsZXJ5X19pdGVtJywgKCBlICkgLT5cblx0XHRlLnByZXZlbnREZWZhdWx0KCApXG5cblx0XHQkZWwgPSAkKCB0aGlzIClcblx0XHQkaXRlbXMgPSAkZWwuY2xvc2VzdCggJy5QUF9HYWxsZXJ5JyApLmZpbmQoICcuUFBfR2FsbGVyeV9faXRlbScgKVxuXHRcdGluZGV4ID0gJGl0ZW1zLmluZGV4KCAkZWwgKVxuXG5cdFx0bGlnaHRHYWxsZXJ5KCAkZWwgKS5vcGVuKCAkaXRlbXMsIGluZGV4IClcblxuXHQjIEJ5IGRlZmF1bHQgRVBQIHdpbGwgY2xvc2UgdGhlIHdob2xlIGdhbGxlcnkgb24gY2xvc2Vcblx0IyBVc2UgdGhpcyBob29rcyB0byBwcmV2ZW50IHRoYXRcblx0aWYgSG9va3MuYXBwbHlGaWx0ZXJzICdwaG9ydC5nYWxsZXJ5LmN1c3RvbV9lc2MnLCB0cnVlXG5cdFx0JCggd2luZG93ICkub24gJ2tleWRvd24nLCAoIGUgKSAtPlxuXHRcdFx0aWYgJGVsICYmIGUua2V5Q29kZSBpcyAyN1xuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCApXG5cdFx0XHRcdGxpZ2h0R2FsbGVyeSggJGVsICkuZGVzdHJveSggKVxuXHRcdFx0XHQkZWwgPSBmYWxzZVxuXG5cdFx0XHRyZXR1cm4gIyBub3RoaW5nXG5cbiIsImdhbGxlcnkgPSB3aW5kb3cuX19waG9ydC5wb3B1cF9nYWxsZXJ5IHx8ICdsaWdodGdhbGxlcnknXG5cbmlmIGdhbGxlcnkgaXMgJ2xpZ2h0Z2FsbGVyeSdcblx0cmVxdWlyZSggJy4vbGlnaHRHYWxsZXJ5JyApIiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5JdGVtX0RhdGEgPSByZXF1aXJlKCAnLi9JdGVtX0RhdGEnIClcbl9fV0lORE9XID0gcmVxdWlyZSggJy4uL2NvcmUvV2luZG93JyApXG50aHJvdHRsZSA9IHJlcXVpcmUoJy4uL2NvcmUvVXRpbGl0aWVzJykudGhyb3R0bGVcblxuY2xhc3MgQWJzdHJhY3RfTGF6eV9Mb2FkZXJcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QEVsZW1lbnRzID1cblx0XHRcdGl0ZW0gICAgICAgOiAnUFBfTGF6eV9JbWFnZSdcblx0XHRcdHBsYWNlaG9sZGVyOiAnUFBfTGF6eV9JbWFnZV9fcGxhY2Vob2xkZXInXG5cdFx0XHRsaW5rICAgICAgIDogJ1BQX0pTX0xhenlfX2xpbmsnXG5cdFx0XHRpbWFnZSAgICAgIDogJ1BQX0pTX0xhenlfX2ltYWdlJ1xuXG5cdFx0QEl0ZW1zID0gW11cblxuXHRcdCMgQWRqdXN0YWJsZSBTZW5zaXRpdml0eSBmb3IgQGluX3ZpZXcgZnVuY3Rpb25cblx0XHQjIFZhbHVlIGluIHBpeGVsc1xuXHRcdEBTZW5zaXRpdml0eSA9IDEwMFxuXG5cdFx0IyBBdXRvLXNldHVwIHdoZW4gZXZlbnRzIGFyZSBhdHRhY2hlZFxuXHRcdCMgQXV0by1kZXN0cm95IHdoZW4gZXZlbnRzIGFyZSBkZXRhY2hlZFxuXHRcdEB0aHJvdHRsZWRfYXV0b2xvYWQgPSBudWxsXG5cblx0XHRAc2V0dXBfaXRlbXMoKVxuXHRcdEByZXNpemVfYWxsKClcblx0XHRAYXR0YWNoX2V2ZW50cygpXG5cblx0IyMjXG5cdFx0QWJzdHJhY3QgTWV0aG9kc1xuXHQjIyNcblxuXHQjIFRoaXMgaXMgcnVuIHdoZW4gYSByZXNpemUgb3IgcmVmcmVzaCBldmVudCBpcyBkZXRlY3RlZFxuXHRyZXNpemU6IC0+IHJldHVyblxuXG5cdGxvYWQ6ICggaXRlbSApIC0+XG5cdFx0QGxvYWRfaW1hZ2UoIGl0ZW0gKVxuXHRcdGl0ZW0uJGVsLmltYWdlc0xvYWRlZCA9PlxuXHRcdFx0QGNsZWFudXBfYWZ0ZXJfbG9hZCggaXRlbSApXG5cblx0bG9hZF9pbWFnZTogKCBpdGVtICkgLT5cblxuXHRcdCMgR2V0IGltYWdlIFVSTHNcblx0XHR0aHVtYiA9IGl0ZW0uZGF0YS5nZXRfdXJsKCAndGh1bWInIClcblx0XHRmdWxsID0gaXRlbS5kYXRhLmdldF91cmwoICdmdWxsJyApXG5cblx0XHQjIENyZWF0ZSBlbGVtZW50c1xuXHRcdGl0ZW0uJGVsXG5cdFx0XHQucHJlcGVuZCggQGdldF9pdGVtX2h0bWwoIHRodW1iLCBmdWxsICkgKVxuXHRcdFx0LnJlbW92ZUNsYXNzKCAnTGF6eS1JbWFnZScgKVxuXG5cdFx0IyBNYWtlIHN1cmUgdGhpcyBpbWFnZSBpc24ndCBsb2FkZWQgYWdhaW5cblx0XHRpdGVtLmxvYWRlZCA9IHRydWVcblxuXHRjbGVhbnVwX2FmdGVyX2xvYWQ6ICggaXRlbSApIC0+XG5cdFx0IyBBZGQgaW1hZ2UgUFBfSlNfbG9hZGVkIGNsYXNzXG5cdFx0aXRlbS4kZWwuZmluZCggJ2ltZycgKS5hZGRDbGFzcyggJ1BQX0pTX19sb2FkZWQnICkucmVtb3ZlQ2xhc3MoICdQUF9KU19fbG9hZGluZycgKVxuXG5cdFx0aXRlbS4kZWxcblxuXHRcdFx0IyBSZW1vdmUgYFBQX0xhenlfSW1hZ2VgLCBhcyB0aGlzIGlzIG5vdCBhIGxhenktbG9hZGFibGUgaW1hZ2UgYW55bW9yZVxuXHRcdFx0LnJlbW92ZUNsYXNzKCBARWxlbWVudHMuaXRlbSApXG5cblx0XHRcdCMgUmVtb3ZlIFBsYWNlaG9sZGVyXG5cdFx0XHQuZmluZCggXCIuI3tARWxlbWVudHMucGxhY2Vob2xkZXJ9XCIgKVxuXHRcdFx0LmZhZGVPdXQoIDQwMCwgLT4gJCggdGhpcyApLnJlbW92ZSgpIClcblxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5sYXp5LmxvYWRlZF9pdGVtJywgaXRlbVxuXG5cblx0Z2V0X2l0ZW1faHRtbDogKCB0aHVtYiwgZnVsbCApIC0+XG5cblx0XHRpZiAnZGlzYWJsZScgaXMgd2luZG93Ll9fcGhvcnQucG9wdXBfZ2FsbGVyeVxuXHRcdFx0cmV0dXJuIFwiXCJcIlxuXHRcdFx0PGRpdiBjbGFzcz1cIiN7QEVsZW1lbnRzLmxpbmt9XCIgcmVsPVwiZ2FsbGVyeVwiPlxuXHRcdFx0XHQ8aW1nIGNsYXNzPVwiI3tARWxlbWVudHMuaW1hZ2V9XCIgc3JjPVwiI3t0aHVtYn1cIiBjbGFzcz1cIlBQX0pTX19sb2FkaW5nXCIgLz5cblx0XHRcdDwvZGl2PlxuXHRcdFx0XCJcIlwiXG5cdFx0ZWxzZVxuXHRcdFx0cmV0dXJuIFwiXCJcIlxuXHRcdFx0PGEgY2xhc3M9XCIje0BFbGVtZW50cy5saW5rfVwiIGhyZWY9XCIje2Z1bGx9XCIgcmVsPVwiZ2FsbGVyeVwiPlxuXHRcdFx0XHQ8aW1nIGNsYXNzPVwiI3tARWxlbWVudHMuaW1hZ2V9XCIgc3JjPVwiI3t0aHVtYn1cIiBjbGFzcz1cIlBQX0pTX19sb2FkaW5nXCIgLz5cblx0XHRcdDwvYT5cblx0XHRcdFwiXCJcIlxuXG5cdHNldHVwX2l0ZW1zOiA9PlxuXHRcdCMgQ2xlYXIgZXhpc3RpbmcgaXRlbXMsIGlmIGFueVxuXHRcdEBJdGVtcyA9IFtdXG5cblx0XHQjIExvb3Agb3ZlciBET00gYW5kIGFkZCBlYWNoIGl0ZW0gdG8gQEl0ZW1zXG5cdFx0JCggXCIuI3tARWxlbWVudHMuaXRlbX1cIiApLmVhY2goIEBhZGRfaXRlbSApXG5cdFx0cmV0dXJuXG5cblx0YWRkX2l0ZW06ICgga2V5LCBlbCApID0+XG5cdFx0JGVsID0gJCggZWwgKVxuXHRcdEBJdGVtcy5wdXNoXG5cdFx0XHRlbCAgICA6IGVsXG5cdFx0XHQkZWwgICA6ICRlbFxuXHRcdFx0ZGF0YSAgOiBuZXcgSXRlbV9EYXRhKCAkZWwgKVxuXHRcdFx0bG9hZGVkOiBmYWxzZVxuXG5cblx0XHRyZXR1cm5cblxuXG5cdCMjI1xuXHRcdE1ldGhvZHNcblx0IyMjXG5cdHJlc2l6ZV9hbGw6IC0+XG5cdFx0QHJlc2l6ZSggaXRlbSApIGZvciBpdGVtIGluIEBJdGVtc1xuXG5cblxuXHQjIEF1dG9tYXRpY2FsbHkgTG9hZCBhbGwgaXRlbXMgdGhhdCBhcmUgYGluX2xvb3NlX3ZpZXdgXG5cdGF1dG9sb2FkOiA9PlxuXHRcdGZvciBpdGVtLCBrZXkgaW4gQEl0ZW1zXG5cdFx0XHRpZiBub3QgaXRlbS5sb2FkZWQgYW5kIEBpbl9sb29zZV92aWV3KCBpdGVtLmVsIClcblx0XHRcdFx0QGxvYWQoIGl0ZW0gKVxuXG5cdGluX2xvb3NlX3ZpZXc6ICggZWwgKSAtPlxuXHRcdHJldHVybiB0cnVlIGlmIG5vdCBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3Q/XG5cdFx0cmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG5cblx0XHQjIEVsZW1lbnRzIG5vdCBpbiB2aWV3IGlmIHRoZXkgZG9uJ3QgaGF2ZSBkaW1lbnNpb25zXG5cdFx0cmV0dXJuIGZhbHNlIGlmIHJlY3QuaGVpZ2h0IGlzIDAgYW5kIHJlY3Qud2lkdGggaXMgMFxuXG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0IyBZIEF4aXNcblx0XHRcdHJlY3QudG9wICsgcmVjdC5oZWlnaHQgPj0gLUBTZW5zaXRpdml0eSBhbmQgIyB0b3Bcblx0XHRcdHJlY3QuYm90dG9tIC0gcmVjdC5oZWlnaHQgPD0gX19XSU5ET1cuaGVpZ2h0ICsgQFNlbnNpdGl2aXR5IGFuZFxuXG5cdFx0XHQjIFggQXhpc1xuXHRcdFx0cmVjdC5sZWZ0ICsgcmVjdC53aWR0aCA+PSAtQFNlbnNpdGl2aXR5IGFuZFxuXHRcdFx0cmVjdC5yaWdodCAtIHJlY3Qud2lkdGggPD0gX19XSU5ET1cud2lkdGggKyBAU2Vuc2l0aXZpdHlcblxuXHRcdClcblxuXHRkZXN0cm95OiAtPlxuXHRcdEBkZXRhY2hfZXZlbnRzKClcblxuXHRhdHRhY2hfZXZlbnRzOiAtPlxuXHRcdCMgQ3JlYXRlIGEgZGVib3VuY2VkIGBhdXRvbG9hZGAgZnVuY3Rpb25cblx0XHRAdGhyb3R0bGVkX2F1dG9sb2FkID0gdGhyb3R0bGUoIEBhdXRvbG9hZCwgNTAgKVxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCBAdGhyb3R0bGVkX2F1dG9sb2FkLCAxMDBcblxuXG5cdGRldGFjaF9ldmVudHM6IC0+XG5cdFx0IyBDbGVhciB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uIGZyb20gaW5zdGFuY2Vcblx0XHRAdGhyb3R0bGVkX2F1dG9sb2FkID0gbnVsbFxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCBAdGhyb3R0bGVkX2F1dG9sb2FkLCAxMDBcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQWJzdHJhY3RfTGF6eV9Mb2FkZXJcbiIsImNsYXNzIEl0ZW1fRGF0YVxuXG5cdGNvbnN0cnVjdG9yOiAoICRlbCApIC0+XG5cdFx0QCRlbCA9ICRlbFxuXHRcdGRhdGEgPSAkZWwuZGF0YSggJ2l0ZW0nIClcblxuXHRcdGlmIG5vdCBkYXRhXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IgXCJFbGVtZW50IGRvZXNuJ3QgY29udGFpbiBgZGF0YS1pdGVtYCBhdHRyaWJ1dGVcIlxuXG5cdFx0QGRhdGEgPSBkYXRhXG5cblxuXG5cdGdldF9kYXRhOiAoIG5hbWUgKSAtPlxuXHRcdGltYWdlID0gQGRhdGFbICdpbWFnZXMnIF1bIG5hbWUgXVxuXHRcdHJldHVybiBmYWxzZSBpZiBub3QgaW1hZ2VcblxuXHRcdHJldHVybiBpbWFnZVxuXG5cdGdldF9zaXplOiAoIG5hbWUgKSAtPlxuXHRcdGltYWdlID0gQGdldF9kYXRhKCBuYW1lIClcblx0XHRyZXR1cm4gZmFsc2UgaWYgbm90IGltYWdlXG5cblx0XHRzaXplID0gaW1hZ2VbICdzaXplJyBdXG5cblx0XHRbd2lkdGgsIGhlaWdodF0gPSBzaXplLnNwbGl0KCAneCcgKVxuXG5cdFx0d2lkdGggPSBwYXJzZUludCggd2lkdGggKVxuXHRcdGhlaWdodCA9IHBhcnNlSW50KCBoZWlnaHQgKVxuXG5cdFx0cmV0dXJuIFt3aWR0aCwgaGVpZ2h0XVxuXG5cdGdldF91cmw6ICggbmFtZSApIC0+XG5cdFx0aW1hZ2UgPSBAZ2V0X2RhdGEoIG5hbWUgKVxuXHRcdHJldHVybiBmYWxzZSBpZiBub3QgaW1hZ2Vcblx0XHRyZXR1cm4gaW1hZ2VbICd1cmwnIF1cblxuXHRnZXRfb3JfZmFsc2U6ICgga2V5ICkgLT5cblx0XHRpZiBAZGF0YVsga2V5IF1cblx0XHRcdHJldHVybiBAZGF0YVsga2V5IF1cblx0XHRyZXR1cm4gZmFsc2VcblxuXHRnZXRfcmF0aW8gICA6IC0+IEBnZXRfb3JfZmFsc2UoICdyYXRpbycgKVxuXHRnZXRfdHlwZSAgICA6IC0+IEBnZXRfb3JfZmFsc2UoICd0eXBlJyApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBJdGVtX0RhdGFcbiIsIiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5BYnN0cmFjdF9MYXp5X0xvYWRlciA9IHJlcXVpcmUoICcuL0Fic3RyYWN0X0xhenlfTG9hZGVyJyApXG5fX1dJTkRPVyA9IHJlcXVpcmUoICcuLi9jb3JlL1dpbmRvdycgKVxuXG5jbGFzcyBMYXp5X01hc29ucnkgZXh0ZW5kcyBBYnN0cmFjdF9MYXp5X0xvYWRlclxuXG5cdHJlc2l6ZV9hbGw6IC0+XG5cdFx0QHBsYWNlaG9sZGVyX3dpZHRoID0gJCggJy5QUF9NYXNvbnJ5X19zaXplcicgKS53aWR0aCgpXG5cdFx0c3VwZXIoKVxuXG5cdHJlc2l6ZTogKCBpdGVtICkgLT5cblx0XHRpdGVtLiRlbC5jc3MgJ21pbi1oZWlnaHQnOiBNYXRoLmZsb29yKCBAcGxhY2Vob2xkZXJfd2lkdGggLyBpdGVtLmRhdGEuZ2V0X3JhdGlvKCkgKVxuXG5cdGNsZWFudXBfYWZ0ZXJfbG9hZDogKGl0ZW0pIC0+XG5cdFx0IyBSZW1vdmUgbWluLWhlaWdodFxuXHRcdGl0ZW0uJGVsLmNzcyggJ21pbi1oZWlnaHQnLCAnJyApXG5cblx0XHQjIFJ1biBhbGwgb3RoZXIgY2xlYW51cHNcblx0XHRzdXBlciggaXRlbSApXG5cblx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnXG5cblx0XHRyZXR1cm5cblxuXHRhdHRhY2hfZXZlbnRzOiAtPlxuXHRcdCMgQ2FsbCBQYXJlbnQgZmlyc3QsIGl0J3MgZ29pbmcgdG8gY3JlYXRlIEB0aHJvdHRsZWRfYXV0b2xvYWRcblx0XHRzdXBlcigpXG5cblx0XHQjIEF0dGFjaFxuXHRcdCQoIHdpbmRvdyApLm9uICdzY3JvbGwnLCBAdGhyb3R0bGVkX2F1dG9sb2FkXG5cblxuXG5cdGRldGFjaF9ldmVudHM6IC0+XG5cdFx0IyBEZXRhY2hcblx0XHQkKCB3aW5kb3cgKS5vZmYgJ3Njcm9sbCcsIEB0aHJvdHRsZWRfYXV0b2xvYWRcblxuXHRcdCMgQ2FsbCBwYXJlbnQgbGFzdCwgaXQncyBnb2luZyB0byBjbGVhbiB1cCBAdGhyb3R0bGVkX2F1dG9sb2FkXG5cdFx0c3VwZXIoKVxuXG5cdGRlc3Ryb3k6IC0+XG5cdFx0Zm9yIGl0ZW0sIGtleSBpbiBASXRlbXNcblx0XHRcdGl0ZW0uJGVsLmNzcyAnbWluLWhlaWdodCcsICcnXG5cdFx0c3VwZXIoKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gTGF6eV9NYXNvbnJ5XG4iLCIkID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuXG5cbmluc3RhbmNlID0gZmFsc2VcblxuZGVzdHJveSA9IC0+XG5cdHJldHVybiBpZiBub3QgaW5zdGFuY2Vcblx0aW5zdGFuY2UuZGVzdHJveSgpXG5cdGluc3RhbmNlID0gbnVsbFxuXG5jcmVhdGUgPSAtPlxuXG5cdCMgTWFrZSBzdXJlIGFuIGluc3RhbmNlIGRvZXNuJ3QgYWxyZWFkeSBleGlzdFxuXHRkZXN0cm95KClcblxuXHQjIEhhbmRsZXIgcmVxdWlyZWRcblx0SGFuZGxlciA9IEhvb2tzLmFwcGx5RmlsdGVycyAncGhvcnQubGF6eS5oYW5kbGVyJywgZmFsc2Vcblx0cmV0dXJuIGlmIG5vdCBIYW5kbGVyXG5cblx0IyBCeSBkZWZhdWx0IExhenlfTWFzb25yeSBpcyBoYW5kbGluZyBMYXp5LUxvYWRpbmdcblx0IyBDaGVjayBpZiBhbnlvbmUgd2FudHMgdG8gaGlqYWNrIGhhbmRsZXJcblx0aW5zdGFuY2UgPSBuZXcgSGFuZGxlcigpXG5cblx0cmV0dXJuXG5cblxuIyBJbml0aWFsaXplIGxhenkgbG9hZGVyIGFmdGVyIHRoZSBwb3J0Zm9saW8gaXMgcHJlcGFyZWQsIHAgPSAxMDBcbkhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnLCBjcmVhdGUsIDEwMFxuSG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScsIGRlc3Ryb3kiLCJIb29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5cbiMjI1xuXG4gICAgIyBJbml0aWFsaXplIFBvcnRmb2xpbyBDb3JlXG5cdC0tLVxuXHRcdFVzaW5nIHA1MCBAIGBwaG9ydC5jb3JlLnJlYWR5YFxuXHRcdExhdGUgcHJpb3JpdHkgaXMgZ29pbmcgdG8gZm9yY2UgZXhwbGljaXQgcHJpb3JpdHkgaW4gYW55IG90aGVyIG1vdmluZyBwYXJ0cyB0aGF0IGFyZSBnb2luZyB0byB0b3VjaCBwb3J0Zm9saW8gbGF5b3V0IGF0IGBwaG9ydC5sb2FkZWRgXG5cdC0tLVxuXG4jIyNcbmNsYXNzIFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyXG5cblx0cHJlcGFyZTogLT5cblx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnXG5cdFx0cmV0dXJuXG5cblx0Y3JlYXRlOiAtPlxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uY3JlYXRlJ1xuXHRcdHJldHVyblxuXG5cblx0cmVmcmVzaDogLT5cblx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnXG5cdFx0cmV0dXJuXG5cblxuXHRkZXN0cm95OiAtPlxuXHRcdCMgRGVzdHJveVxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveSdcblx0XHRyZXR1cm5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyIiwiSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuXG5cbiMjI1xuXHRBYnN0cmFjdCBDbGFzcyBQb3J0b2ZsaW9fRXZlbnRfSW1lcGxlbWVudGF0aW9uXG5cbiAgICBIYW5kbGVzIGFsbCB0aGUgZXZlbnRzIHJlcXVpcmVkIHRvIGZ1bGx5IGhhbmRsZSBhIHBvcnRmb2xpbyBsYXlvdXQgcHJvY2Vzc1xuIyMjXG5jbGFzcyBQb3J0Zm9saW9fSW50ZXJmYWNlXG5cblx0Y29uc3RydWN0b3I6ICggYXJncyApIC0+XG5cdFx0QHNldHVwX2FjdGlvbnMoKVxuXHRcdEBpbml0aWFsaXplKCBhcmdzIClcblxuXHRzZXR1cF9hY3Rpb25zOiAtPlxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnLCBAcHJlcGFyZSwgNTBcblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5jcmVhdGUnLCBAY3JlYXRlLCA1MFxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCBAcmVmcmVzaCwgNTBcblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgQGRlc3Ryb3ksIDUwXG5cdFx0SG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScsIEBwdXJnZV9hY3Rpb25zLCAxMDBcblxuXHRwdXJnZV9hY3Rpb25zOiA9PlxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnLCBAcHJlcGFyZSwgNTBcblx0XHRIb29rcy5yZW1vdmVBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5jcmVhdGUnLCBAY3JlYXRlLCA1MFxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCBAcmVmcmVzaCwgNTBcblx0XHRIb29rcy5yZW1vdmVBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgQGRlc3Ryb3ksIDUwXG5cdFx0SG9va3MucmVtb3ZlQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScsIEBwdXJnZV9hY3Rpb25zLCAxMDBcblxuXG5cdCMjI1xuICAgIFx0UmVxdWlyZSB0aGVzZSBtZXRob2RzXG5cdCMjI1xuXHRpbml0aWFsaXplOiAtPiB0aHJvdyBuZXcgRXJyb3IoIFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGBpbml0aWFsaXplYCBtZXRob2RcIiApXG5cdHByZXBhcmUgICA6IC0+IHRocm93IG5ldyBFcnJvciggXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYHByZXBhcmVgIG1ldGhvZFwiIClcblx0Y3JlYXRlICAgIDogLT4gdGhyb3cgbmV3IEVycm9yKCBcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgY3JlYXRlYCBtZXRob2RcIiApXG5cdHJlZnJlc2ggICA6IC0+IHRocm93IG5ldyBFcnJvciggXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYHJlZnJlc2hgIG1ldGhvZFwiIClcblx0ZGVzdHJveSAgIDogLT4gdGhyb3cgbmV3IEVycm9yKCBcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgZGVzdHJveWAgbWV0aG9kXCIgKVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW9fSW50ZXJmYWNlIiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5Qb3J0Zm9saW9fSW50ZXJmYWNlID0gcmVxdWlyZSggJy4vUG9ydGZvbGlvX0ludGVyZmFjZScgKVxuXG5cbmNsYXNzIFBvcnRmb2xpb19NYXNvbnJ5IGV4dGVuZHMgUG9ydGZvbGlvX0ludGVyZmFjZVxuXG5cdGNvbnN0cnVjdG9yOiAtPlxuXG5cdFx0QEVsZW1lbnRzID1cblx0XHRcdGNvbnRhaW5lcjogJ1BQX01hc29ucnknXG5cdFx0XHRzaXplciAgICA6ICdQUF9NYXNvbnJ5X19zaXplcidcblx0XHRcdGl0ZW0gICAgIDogJ1BQX01hc29ucnlfX2l0ZW0nXG5cblx0XHRzdXBlcigpXG5cblx0IyMjXG5cdFx0SW5pdGlhbGl6ZVxuXHQjIyNcblx0aW5pdGlhbGl6ZTogLT5cblx0XHRAJGNvbnRhaW5lciA9ICQoIFwiLiN7QEVsZW1lbnRzLmNvbnRhaW5lcn1cIiApXG5cblx0IyMjXG5cdFx0UHJlcGFyZSAmIEF0dGFjaCBFdmVudHNcbiAgICBcdERvbid0IHNob3cgYW55dGhpbmcgeWV0LlxuXG5cdFx0QGNhbGxlZCBvbiBob29rIGBwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZWBcblx0IyMjXG5cdHByZXBhcmU6ID0+XG5cdFx0cmV0dXJuIGlmIEAkY29udGFpbmVyLmxlbmd0aCBpcyAwXG5cblx0XHRAJGNvbnRhaW5lci5hZGRDbGFzcyggJ1BQX0pTX19sb2FkaW5nX21hc29ucnknIClcblxuXHRcdEBtYXliZV9jcmVhdGVfc2l6ZXIoKVxuXG5cdFx0IyBPbmx5IGluaXRpYWxpemUsIGlmIG5vIG1hc29ucnkgZXhpc3RzXG5cdFx0bWFzb25yeV9zZXR0aW5ncyA9IEhvb2tzLmFwcGx5RmlsdGVycyAncGhvcnQubWFzb25yeS5zZXR0aW5ncycsXG5cdFx0XHRpdGVtU2VsZWN0b3I6IFwiLiN7QEVsZW1lbnRzLml0ZW19XCJcblx0XHRcdGNvbHVtbldpZHRoIDogXCIuI3tARWxlbWVudHMuc2l6ZXJ9XCJcblx0XHRcdGd1dHRlciAgICAgIDogMFxuXHRcdFx0aW5pdExheW91dCAgOiBmYWxzZVxuXG5cdFx0QCRjb250YWluZXIubWFzb25yeSggbWFzb25yeV9zZXR0aW5ncyApXG5cblx0XHRAJGNvbnRhaW5lci5tYXNvbnJ5ICdvbmNlJywgJ2xheW91dENvbXBsZXRlJywgPT5cblx0XHRcdEAkY29udGFpbmVyXG5cdFx0XHRcdC5yZW1vdmVDbGFzcyggJ1BQX0pTX19sb2FkaW5nX21hc29ucnknIClcblx0XHRcdFx0LmFkZENsYXNzKCAnUFBfSlNfX2xvYWRpbmdfY29tcGxldGUnIClcblxuXHRcdFx0IyBAdHJpZ2dlciByZWZyZXNoIGV2ZW50XG5cdFx0XHQjIHRyaWdnZXJzIGBAcmVmcmVzaCgpYFxuXHRcdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5yZWZyZXNoJ1xuXG5cblx0IyMjXG5cdFx0U3RhcnQgdGhlIFBvcnRmb2xpb1xuXHRcdEBjYWxsZWQgb24gaG9vayBgcGhvcnQucG9ydGZvbGlvLmNyZWF0ZWBcblx0IyMjXG5cdGNyZWF0ZTogPT5cblx0XHRAJGNvbnRhaW5lci5tYXNvbnJ5KClcblx0XHRyZXR1cm5cblxuXG5cdCMjI1xuXHRcdERlc3Ryb3lcblx0XHRAY2FsbGVkIG9uIGhvb2sgYHBob3J0LnBvcnRmb2xpby5kZXN0cm95YFxuXHQjIyNcblx0ZGVzdHJveTogPT5cblx0XHRAbWF5YmVfcmVtb3ZlX3NpemVyKClcblxuXHRcdGlmIEAkY29udGFpbmVyLmxlbmd0aCA+IDBcblx0XHRcdEAkY29udGFpbmVyLm1hc29ucnkoICdkZXN0cm95JyApXG5cblxuXHRcdHJldHVyblxuXG5cblx0IyMjXG5cdFx0UmVsb2FkIHRoZSBsYXlvdXRcblx0XHRAY2FsbGVkIG9uIGhvb2sgYHBob3J0LnBvcnRmb2xpby5yZWZyZXNoYFxuXHQjIyNcblx0cmVmcmVzaDogPT5cblx0XHRAJGNvbnRhaW5lci5tYXNvbnJ5KCAnbGF5b3V0JyApXG5cblxuXG5cdCMjI1xuXHRcdENyZWF0ZSBhIHNpemVyIGVsZW1lbnQgZm9yIGpxdWVyeS1tYXNvbnJ5IHRvIHVzZVxuXHQjIyNcblx0bWF5YmVfY3JlYXRlX3NpemVyOiAtPlxuXHRcdEBjcmVhdGVfc2l6ZXIoKSBpZiBAc2l6ZXJfZG9lc250X2V4aXN0KClcblx0XHRyZXR1cm5cblxuXHRtYXliZV9yZW1vdmVfc2l6ZXI6IC0+XG5cdFx0cmV0dXJuIGlmIEAkY29udGFpbmVyLmxlbmd0aCBpc250IDFcblx0XHRAJGNvbnRhaW5lci5maW5kKCBcIi4je0BFbGVtZW50cy5zaXplcn1cIiApLnJlbW92ZSgpXG5cdFx0cmV0dXJuXG5cblx0c2l6ZXJfZG9lc250X2V4aXN0OiAtPiBAJGNvbnRhaW5lci5maW5kKCBcIi4je0BFbGVtZW50cy5zaXplcn1cIiApLmxlbmd0aCBpcyAwXG5cblxuXHRjcmVhdGVfc2l6ZXI6IC0+XG5cdFx0QCRjb250YWluZXIuYXBwZW5kIFwiXCJcIjxkaXYgY2xhc3M9XCIje0BFbGVtZW50cy5zaXplcn1cIj48L2Rpdj5cIlwiXCJcblxuXHRcdHJldHVyblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBvcnRmb2xpb19NYXNvbnJ5IiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcblBvcnRmb2xpb19FdmVudF9NYW5hZ2VyID0gcmVxdWlyZSggJy4vUG9ydGZvbGlvX0V2ZW50X01hbmFnZXInIClcbiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5cbiMgUG9ydGZvbGlvIG1hbmFnZXIgd2lsbCB0cmlnZ2VyIHBvcnRmb2xpbyBldmVudHMgd2hlbiBuZWNlc3NhcnlcblBvcnRmb2xpbyA9IG5ldyBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlcigpXG5cblxuaXNfbWFzb25yeSA9IC0+XG5cdHJldHVybiAoICQoICcuUFBfTWFzb25yeScgKS5sZW5ndGggaXNudCAwIClcblxuIyBTdGFydCBNYXNvbnJ5IExheW91dFxuc3RhcnRfbWFzb25yeSA9IC0+XG5cdHJldHVybiBmYWxzZSBpZiBub3QgaXNfbWFzb25yeSgpXG5cblx0UG9ydGZvbGlvX01hc29ucnkgPSByZXF1aXJlKCAnLi9Qb3J0Zm9saW9fTWFzb25yeScgKVxuXHRuZXcgUG9ydGZvbGlvX01hc29ucnkoKVxuXG5tYXliZV9sYXp5X21hc29ucnkgPSAoIGhhbmRsZXIgKSAtPlxuXHQjIFVzZSBMYXp5X01hc29ucnkgaGFuZGxlciwgaWYgY3VycmVudCBsYXlvdXQgaXMgbWFzb25yeVxuXHRyZXR1cm4gcmVxdWlyZSggJ2xhenkvTGF6eV9NYXNvbnJ5JyApIGlmIGlzX21hc29ucnkoKVxuXHRyZXR1cm4gaGFuZGxlclxuXG5cbiMgU3RhcnQgUG9ydGZvbGlvXG5Ib29rcy5hZGRBY3Rpb24gJ3Bob3J0LmNvcmUucmVhZHknLCBQb3J0Zm9saW8ucHJlcGFyZSwgNTBcbkhvb2tzLmFkZEFjdGlvbiAncGhvcnQuY29yZS5sb2FkZWQnLCBQb3J0Zm9saW8uY3JlYXRlLCA1MFxuXG4jIEluaXRpYWxpemUgTWFzb25yeSBMYXlvdXRcbkhvb2tzLmFkZEFjdGlvbiAncGhvcnQuY29yZS5yZWFkeScsIHN0YXJ0X21hc29ucnlcblxuIyBJbml0aWFsaXplIExhenkgTG9hZGluZyBmb3IgTWFzb25yeSBMYXlvdXRcbkhvb2tzLmFkZEZpbHRlciAncGhvcnQubGF6eS5oYW5kbGVyJywgbWF5YmVfbGF6eV9tYXNvbnJ5XG5cblxuXG4iXX0=
