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

},{"./core/Photography_Portfolio":2,"./gallery/popup":5,"./lazy/Abstract_Lazy_Loader":6,"./lazy/Item_Data":7,"./lazy/start":9,"./portfolio/Portfolio_Interface":11,"./portfolio/start":13}],2:[function(require,module,exports){
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
var $, Gallery, Hooks, Item_Data;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Item_Data = require('../lazy/Item_Data');

Gallery = function($el) {
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
      thumb: data.get_url('thumb')
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
    return Gallery($el).open($items, index);
  });
  if (Hooks.applyFilters('phort.gallery.custom_esc', true)) {
    return $(window).on('keydown', function(e) {
      if ($el && e.keyCode === 27) {
        e.preventDefault();
        Gallery($el).destroy();
        $el = false;
      }
    });
  }
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../lazy/Item_Data":7}],6:[function(require,module,exports){
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

},{"../core/Utilities":3,"../core/Window":4,"./Item_Data":7}],7:[function(require,module,exports){
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

},{"../core/Window":4,"./Abstract_Lazy_Loader":6}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{"./Portfolio_Interface":11}],13:[function(require,module,exports){
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

},{"./Portfolio_Event_Manager":10,"./Portfolio_Masonry":12,"lazy/Lazy_Masonry":8}]},{},[1])


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jb3JlL1Bob3RvZ3JhcGh5X1BvcnRmb2xpby5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY29yZS9VdGlsaXRpZXMuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY29yZS9XaW5kb3cuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvcG9wdXAuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvQWJzdHJhY3RfTGF6eV9Mb2FkZXIuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvSXRlbV9EYXRhLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0xhenlfTWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvbGF6eS9zdGFydC5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL1BvcnRmb2xpb19FdmVudF9NYW5hZ2VyLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9wb3J0Zm9saW8vUG9ydGZvbGlvX0ludGVyZmFjZS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL1BvcnRmb2xpb19NYXNvbnJ5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9wb3J0Zm9saW8vc3RhcnQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTs7O0FBQUEsSUFBQTs7QUFHQSxLQUFBLEdBQVEsT0FBQSxDQUFTLFVBQVQ7O0FBQ1IsQ0FBQSxHQUFJLE9BQUEsQ0FBUyxRQUFUOztBQUlKLE1BQU0sQ0FBQyxVQUFQLEdBRUM7RUFBQSxtQkFBQSxFQUFxQixPQUFBLENBQVMsaUNBQVQsQ0FBckI7RUFHQSxTQUFBLEVB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QSxHQUFJLE9BQUEsQ0FBUyxRQUFUOztBQUdKLFNBQUEsR0FBWSxJQUFJLHVCQUFKLENBQUE7O0FBR1osVUFBQSxHQUFhLFNBQUE7QUFDWixTQUFTLENBQUEsQ0FBRyxhQUFILENBQWtCLENBQUMsTUFBbkIsS0FBK0I7QUFENUI7O0FBSWIsYUFBQSxHQUFnQixTQUFBO0FBQ2YsTUFBQTtFQUFBLElBQWdCLENBQUksVUFBQSxDQUFBLENBQXBCO0FBQUEsV0FBTyxNQUFQOztFQUVBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUyxxQkFBVDtTQUNwQixJQUFJLGlCQUFKLENBQUE7QUFKZTs7QUFNaEIsa0JBQUEsR0FBcUIsU0FBRSxPQUFGO0VBRXBCLElBQXlDLFVBQUEsQ0FBQSxDQUF6QztBQUFBLFdBQU8sT0FBQSxDQUFTLG1CQUFULEVBQVA7O0FBQ0EsU0FBTztBQUhhOztBQU9yQixLQUFLLENBQUMsU0FBTixDQUFnQixrQkFBaEIsRUFBb0MsU0FBUyxDQUFDLE9BQTlDLEVBQXVELEVBQXZEOztBQUNBLEtBQUssQ0FBQyxTQUFOLENBQWdCLG1CQUFoQixFQUFxQyxTQUFTLENBQUMsTUFBL0MsRUFBdUQsRUFBdkQ7O0FBR0EsS0FBSyxDQUFDLFNBQU4sQ0FBZ0Isa0JBQWhCLEVBQW9DLGFBQXBDOztBQUdBLEtBQUssQ0FBQyxTQUFOLENBQWdCLG9CQUFoQixFQUFzQyxrQkFBdEMiLCJmaWxlIjoicGhvdG9ncmFwaHktcG9ydGZvbGlvLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIjIyNcbiAgICBMb2FkIERlcGVuZGVuY2llc1xuIyMjXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG4kID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuXG5cbiMgRXhwb3NlIHNvbWUgUGhvdG9ncmFwaHkgUG9ydGZvbGlvIG1vZHVsZXMgdG8gdGhlIHB1YmxpYyBmb3IgZXh0ZW5zaWJpbGl0eVxud2luZG93LlBQX01vZHVsZXMgPVxuXHQjIEV4dGVuZCBQb3J0Zm9saW8gSW50ZXJmYWNlIHRvIGJ1aWxkIGN1c3RvbSBwb3J0Zm9saW8gbGF5b3V0cyBiYXNlZCBvbiBQUCBFdmVudHNcblx0UG9ydGZvbGlvX0ludGVyZmFjZTogcmVxdWlyZSggJy4vcG9ydGZvbGlvL1BvcnRmb2xpb19JbnRlcmZhY2UnIClcblxuXHQjIFVzZSBgSXRlbV9EYXRhYCB0byBnZXQgZm9ybWF0dGVkIGl0ZW0gaW1hZ2Ugc2l6ZXMgZm9yIGxhenkgbGFvZGluZ1xuXHRJdGVtX0RhdGE6IHJlcXVpcmUoICcuL2xhenkvSXRlbV9EYXRhJyApXG5cblx0IyBFeHRlbmQgQWJzdHJhY3RfTGF6eV9Mb2RlciB0byBpbXBsZW1lbnQgbGF6eSBsb2FkZXIgZm9yIHlvdXIgbGF5b3V0XG5cdEFic3RyYWN0X0xhenlfTG9hZGVyOiByZXF1aXJlKCAnLi9sYXp5L0Fic3RyYWN0X0xhenlfTG9hZGVyJyApXG5cbiMjI1xuXHRJbmNsdWRlc1xuIyMjXG5cbiMgU3RhcnQgUG9ydGZvbGlvXG5yZXF1aXJlICcuL3BvcnRmb2xpby9zdGFydCdcblxuIyBHYWxsZXJ5XG5yZXF1aXJlICcuL2dhbGxlcnkvcG9wdXAnXG5cbiMgTGF6eSBMb2FkaW5nXG5yZXF1aXJlICcuL2xhenkvc3RhcnQnXG5cblxuXG5cbiMjI1xuXHRCb290IG9uIGBkb2N1bWVudC5yZWFkeWBcbiMjI1xuJCggZG9jdW1lbnQgKS5yZWFkeSAtPlxuXG5cdCMgT25seSBydW4gdGhpcyBzY3JpcHQgd2hlbiBib2R5IGhhcyBgUFBfUG9ydGZvbGlvYCBjbGFzc1xuXHRyZXR1cm4gaWYgbm90ICQoICdib2R5JyApLmhhc0NsYXNzKCAnUFBfUG9ydGZvbGlvJyApXG5cblx0IyBCb290XG5cdFBob3RvZ3JhcGh5X1BvcnRmb2xpbyA9IG5ldyAoIHJlcXVpcmUoICcuL2NvcmUvUGhvdG9ncmFwaHlfUG9ydGZvbGlvJyApICkoKVxuXHRQaG90b2dyYXBoeV9Qb3J0Zm9saW8ucmVhZHkoKVxuXG5cdHJldHVybiIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuXG5cbmNsYXNzIENvcmVcblxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LmNvcmUucmVhZHknLCBAd2FpdF9mb3JfbG9hZFxuXG5cdCMgVHJpZ2dlciBwaG9ydC5jb3JlLnJlYWR5XG5cdHJlYWR5OiA9PlxuXHRcdGlmIEhvb2tzLmFwcGx5RmlsdGVycyggJ3Bob3J0LmNvcmUucmVhZHknLCB0cnVlIClcblx0XHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5jb3JlLnJlYWR5J1xuXHRcdHJldHVyblxuXG5cdHdhaXRfZm9yX2xvYWQ6ID0+XG5cdFx0IyBUcmlnZ2VyIGltYWdlc0xvYWRlZCBldmVudCB3aGVuIGltYWdlcyBoYXZlIGxvYWRlZFxuXHRcdCQoICcuUFBfV3JhcHBlcicgKS5pbWFnZXNMb2FkZWQoIEBsb2FkZWQgKVxuXG5cdCMgVHJpZ2dlciBwaG9ydC5jb3JlLmxvYWRlZFxuXHRsb2FkZWQ6IC0+XG5cdFx0aWYgSG9va3MuYXBwbHlGaWx0ZXJzKCAncGhvcnQuY29yZS5sb2FkZWQnLCB0cnVlIClcblx0XHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5jb3JlLmxvYWRlZCdcblxuXHRcdHJldHVyblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQ29yZSIsIm1vZHVsZS5leHBvcnRzID0ge1xuXG5cbiAgICAvKipcbiAgICAgKiBUaGFuayB5b3UgUnVzcyBmb3IgaGVscGluZyBtZSBhdm9pZCB3cml0aW5nIHRoaXMgbXlzZWxmOlxuICAgICAqIEB1cmwgaHR0cHM6Ly9yZW15c2hhcnAuY29tLzIwMTAvMDcvMjEvdGhyb3R0bGluZy1mdW5jdGlvbi1jYWxscy8jY29tbWVudC0yNzQ1NjYzNTk0XG4gICAgICovXG4gICAgdGhyb3R0bGU6IGZ1bmN0aW9uICggZm4sIHRocmVzaGhvbGQsIHNjb3BlICkge1xuICAgICAgICB0aHJlc2hob2xkIHx8ICh0aHJlc2hob2xkID0gMjUwKVxuICAgICAgICB2YXIgbGFzdCxcbiAgICAgICAgICAgIGRlZmVyVGltZXJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBjb250ZXh0ID0gc2NvcGUgfHwgdGhpc1xuXG4gICAgICAgICAgICB2YXIgbm93ICA9ICtuZXcgRGF0ZSxcbiAgICAgICAgICAgICAgICBhcmdzID0gYXJndW1lbnRzXG4gICAgICAgICAgICBpZiAoIGxhc3QgJiYgbm93IDwgbGFzdCArIHRocmVzaGhvbGQgKSB7XG4gICAgICAgICAgICAgICAgLy8gaG9sZCBvbiB0byBpdFxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCggZGVmZXJUaW1lciApXG4gICAgICAgICAgICAgICAgZGVmZXJUaW1lciA9IHNldFRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFzdCA9IG5vd1xuICAgICAgICAgICAgICAgICAgICBmbi5hcHBseSggY29udGV4dCwgYXJncyApXG4gICAgICAgICAgICAgICAgfSwgdGhyZXNoaG9sZCArIGxhc3QgLSBub3cgKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsYXN0ID0gbm93XG4gICAgICAgICAgICAgICAgZm4uYXBwbHkoIGNvbnRleHQsIGFyZ3MgKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG5cbn0iLCJIb29rcyA9IHJlcXVpcmUoICd3cF9ob29rcycgKVxuXG5cbmdldF9zaXplID0gLT5cblx0d2lkdGggOiB3aW5kb3cuaW5uZXJXaWR0aCB8fCAkd2luZG93LndpZHRoKClcblx0aGVpZ2h0OiB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgJHdpbmRvdy5oZWlnaHQoKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0X3NpemUoKSIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggXCJqUXVlcnlcIiApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5JdGVtX0RhdGEgPSByZXF1aXJlKCAnLi4vbGF6eS9JdGVtX0RhdGEnIClcblxuXG5HYWxsZXJ5ID0gKCAkZWwgKSAtPlxuXG5cdGRlZmF1bHRzID1cblx0XHRkeW5hbWljIDogdHJ1ZVxuXHRcdHNwZWVkICAgOiAzNTBcblx0XHRwcmVsb2FkIDogM1xuXHRcdGRvd25sb2FkOiBmYWxzZVxuXHRcdGVzY0tleSAgOiBmYWxzZSAjIFdlJ3JlIHJvbGxpbmcgb3VyIG93blxuXG5cdFx0dGh1bWJuYWlsICAgICAgICAgOiB0cnVlXG5cdFx0c2hvd1RodW1iQnlEZWZhdWx0OiB0cnVlXG5cblx0c2V0dGluZ3MgPSAkLmV4dGVuZCgge30sIGRlZmF1bHRzLCB3aW5kb3cuX19waG9ydC5saWdodEdhbGxlcnkgKVxuXG5cblx0c2luZ2xlX2l0ZW1fZGF0YSA9ICggJGl0ZW0gKSAtPlxuXHRcdGRhdGEgPSBuZXcgSXRlbV9EYXRhKCAkaXRlbSApXG5cblx0XHRpZiBkYXRhLmdldF90eXBlKCApIGlzICd2aWRlbydcblx0XHRcdGZ1bGwgPSBkYXRhLmdldF9vcl9mYWxzZSggJ3ZpZGVvX3VybCcgKVxuXHRcdGVsc2Vcblx0XHRcdGZ1bGwgPSBkYXRhLmdldF91cmwoICdmdWxsJyApXG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0c3JjICA6IGZ1bGxcblx0XHRcdHRodW1iOiBkYXRhLmdldF91cmwoICd0aHVtYicgKVxuXHRcdH1cblxuXHRnYWxsZXJ5X2RhdGEgPSAoICRpdGVtcyApIC0+XG5cdFx0JGl0ZW1zLm1hcCAtPiBzaW5nbGVfaXRlbV9kYXRhKCAkKCB0aGlzICkgKVxuXG5cdGdldF9zZXR0aW5ncyA9ICggJGl0ZW1zLCBpbmRleCApIC0+XG5cdFx0c2V0dGluZ3MuaW5kZXggICAgICAgICA9IGluZGV4XG5cdFx0c2V0dGluZ3MuZHluYW1pY0VsICAgICA9IGdhbGxlcnlfZGF0YSggJGl0ZW1zIClcblx0XHRzZXR0aW5ncy52aWRlb01heFdpZHRoID0gJCggd2luZG93ICkud2lkdGgoICkgKiAwLjhcblxuXHRcdEhvb2tzLmFwcGx5RmlsdGVycyAncGhvcnQubGlnaHRHYWxsZXJ5LnNldHRpbmdzJywgc2V0dGluZ3NcblxuXG5cdGRlc3Ryb3k6IC0+XG5cdFx0JGVsLmRhdGEoICdsaWdodEdhbGxlcnknICkuZGVzdHJveSggKVxuXG5cdG9wZW46ICggJGl0ZW1zLCBpbmRleCApIC0+XG5cdFx0JGVsLmxpZ2h0R2FsbGVyeSggZ2V0X3NldHRpbmdzKCAkaXRlbXMsIGluZGV4ICkgKVxuXG5cbkhvb2tzLmFkZEFjdGlvbiAncGhvcnQuY29yZS5yZWFkeScsIC0+XG5cblx0IyAkZWwgaXMgZ29pbmcgdG8gYmUgdGhlIGN1cnJlbnQgZ2FsbGVyeSBlbGVtZW50IG9uQ2xpY2tcblx0JGVsID0gZmFsc2VcblxuXHQjIE9ubHkgZW5hYmxlIGpRdWVyeSBsaWdodEdhbGxlcnkgaWYgdGhlIHBvcHVwIGdhbGxlcnkgY2xhc3MgaXMgZm91bmRcblx0aWYgJCggJy5QUF9Qb3B1cC0tbGlnaHRnYWxsZXJ5JyApLmxlbmd0aCBpcyAwXG5cdFx0cmV0dXJuIGZhbHNlXG5cblx0IyBPcGVuIGdhbGxlcnlcblx0JCggZG9jdW1lbnQgKS5vbiAnY2xpY2snLCAnLlBQX1BvcHVwLS1saWdodGdhbGxlcnkgLlBQX0dhbGxlcnlfX2l0ZW0nLCAoIGUgKSAtPlxuXHRcdGUucHJldmVudERlZmF1bHQoIClcblxuXHRcdCRlbCA9ICQoIHRoaXMgKVxuXHRcdCRpdGVtcyA9ICRlbC5jbG9zZXN0KCAnLlBQX0dhbGxlcnknICkuZmluZCggJy5QUF9HYWxsZXJ5X19pdGVtJyApXG5cdFx0aW5kZXggPSAkaXRlbXMuaW5kZXgoICRlbCApXG5cblx0XHRHYWxsZXJ5KCAkZWwgKS5vcGVuKCAkaXRlbXMsIGluZGV4IClcblxuXHQjIEJ5IGRlZmF1bHQgRVBQIHdpbGwgY2xvc2UgdGhlIHdob2xlIGdhbGxlcnkgb24gY2xvc2Vcblx0IyBVc2UgdGhpcyBob29rcyB0byBwcmV2ZW50IHRoYXRcblx0aWYgSG9va3MuYXBwbHlGaWx0ZXJzICdwaG9ydC5nYWxsZXJ5LmN1c3RvbV9lc2MnLCB0cnVlXG5cdFx0JCggd2luZG93ICkub24gJ2tleWRvd24nLCAoIGUgKSAtPlxuXHRcdFx0aWYgJGVsICYmIGUua2V5Q29kZSBpcyAyN1xuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCApXG5cdFx0XHRcdEdhbGxlcnkoICRlbCApLmRlc3Ryb3koIClcblx0XHRcdFx0JGVsID0gZmFsc2VcblxuXHRcdFx0cmV0dXJuICMgbm90aGluZ1xuXG4iLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuJCA9IHJlcXVpcmUoICdqUXVlcnknIClcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcbkl0ZW1fRGF0YSA9IHJlcXVpcmUoICcuL0l0ZW1fRGF0YScgKVxuX19XSU5ET1cgPSByZXF1aXJlKCAnLi4vY29yZS9XaW5kb3cnIClcbnRocm90dGxlID0gcmVxdWlyZSgnLi4vY29yZS9VdGlsaXRpZXMnKS50aHJvdHRsZVxuXG5jbGFzcyBBYnN0cmFjdF9MYXp5X0xvYWRlclxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRARWxlbWVudHMgPVxuXHRcdFx0aXRlbSAgICAgICA6ICdQUF9MYXp5X0ltYWdlJ1xuXHRcdFx0cGxhY2Vob2xkZXI6ICdQUF9MYXp5X0ltYWdlX19wbGFjZWhvbGRlcidcblx0XHRcdGxpbmsgICAgICAgOiAnUFBfSlNfTGF6eV9fbGluaydcblx0XHRcdGltYWdlICAgICAgOiAnUFBfSlNfTGF6eV9faW1hZ2UnXG5cblx0XHRASXRlbXMgPSBbXVxuXG5cdFx0IyBBZGp1c3RhYmxlIFNlbnNpdGl2aXR5IGZvciBAaW5fdmlldyBmdW5jdGlvblxuXHRcdCMgVmFsdWUgaW4gcGl4ZWxzXG5cdFx0QFNlbnNpdGl2aXR5ID0gMTAwXG5cblx0XHQjIEF1dG8tc2V0dXAgd2hlbiBldmVudHMgYXJlIGF0dGFjaGVkXG5cdFx0IyBBdXRvLWRlc3Ryb3kgd2hlbiBldmVudHMgYXJlIGRldGFjaGVkXG5cdFx0QHRocm90dGxlZF9hdXRvbG9hZCA9IG51bGxcblxuXHRcdEBzZXR1cF9pdGVtcygpXG5cdFx0QHJlc2l6ZV9hbGwoKVxuXHRcdEBhdHRhY2hfZXZlbnRzKClcblxuXHQjIyNcblx0XHRBYnN0cmFjdCBNZXRob2RzXG5cdCMjI1xuXG5cdCMgVGhpcyBpcyBydW4gd2hlbiBhIHJlc2l6ZSBvciByZWZyZXNoIGV2ZW50IGlzIGRldGVjdGVkXG5cdHJlc2l6ZTogLT4gcmV0dXJuXG5cblx0bG9hZDogKCBpdGVtICkgLT5cblx0XHRAbG9hZF9pbWFnZSggaXRlbSApXG5cdFx0aXRlbS4kZWwuaW1hZ2VzTG9hZGVkID0+XG5cdFx0XHRAY2xlYW51cF9hZnRlcl9sb2FkKCBpdGVtIClcblxuXHRsb2FkX2ltYWdlOiAoIGl0ZW0gKSAtPlxuXG5cdFx0IyBHZXQgaW1hZ2UgVVJMc1xuXHRcdHRodW1iID0gaXRlbS5kYXRhLmdldF91cmwoICd0aHVtYicgKVxuXHRcdGZ1bGwgPSBpdGVtLmRhdGEuZ2V0X3VybCggJ2Z1bGwnIClcblxuXHRcdCMgQ3JlYXRlIGVsZW1lbnRzXG5cdFx0aXRlbS4kZWxcblx0XHRcdC5wcmVwZW5kKCBAZ2V0X2l0ZW1faHRtbCggdGh1bWIsIGZ1bGwgKSApXG5cdFx0XHQucmVtb3ZlQ2xhc3MoICdMYXp5LUltYWdlJyApXG5cblx0XHQjIE1ha2Ugc3VyZSB0aGlzIGltYWdlIGlzbid0IGxvYWRlZCBhZ2FpblxuXHRcdGl0ZW0ubG9hZGVkID0gdHJ1ZVxuXG5cdGNsZWFudXBfYWZ0ZXJfbG9hZDogKCBpdGVtICkgLT5cblx0XHQjIEFkZCBpbWFnZSBQUF9KU19sb2FkZWQgY2xhc3Ncblx0XHRpdGVtLiRlbC5maW5kKCAnaW1nJyApLmFkZENsYXNzKCAnUFBfSlNfX2xvYWRlZCcgKS5yZW1vdmVDbGFzcyggJ1BQX0pTX19sb2FkaW5nJyApXG5cblx0XHRpdGVtLiRlbFxuXG5cdFx0XHQjIFJlbW92ZSBgUFBfTGF6eV9JbWFnZWAsIGFzIHRoaXMgaXMgbm90IGEgbGF6eS1sb2FkYWJsZSBpbWFnZSBhbnltb3JlXG5cdFx0XHQucmVtb3ZlQ2xhc3MoIEBFbGVtZW50cy5pdGVtIClcblxuXHRcdFx0IyBSZW1vdmUgUGxhY2Vob2xkZXJcblx0XHRcdC5maW5kKCBcIi4je0BFbGVtZW50cy5wbGFjZWhvbGRlcn1cIiApXG5cdFx0XHQuZmFkZU91dCggNDAwLCAtPiAkKCB0aGlzICkucmVtb3ZlKCkgKVxuXG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LmxhenkubG9hZGVkX2l0ZW0nLCBpdGVtXG5cblxuXHRnZXRfaXRlbV9odG1sOiAoIHRodW1iLCBmdWxsICkgLT5cblxuXHRcdGlmICdkaXNhYmxlJyBpcyB3aW5kb3cuX19waG9ydC5wb3B1cF9nYWxsZXJ5XG5cdFx0XHRyZXR1cm4gXCJcIlwiXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiI3tARWxlbWVudHMubGlua31cIiByZWw9XCJnYWxsZXJ5XCI+XG5cdFx0XHRcdDxpbWcgY2xhc3M9XCIje0BFbGVtZW50cy5pbWFnZX1cIiBzcmM9XCIje3RodW1ifVwiIGNsYXNzPVwiUFBfSlNfX2xvYWRpbmdcIiAvPlxuXHRcdFx0PC9kaXY+XG5cdFx0XHRcIlwiXCJcblx0XHRlbHNlXG5cdFx0XHRyZXR1cm4gXCJcIlwiXG5cdFx0XHQ8YSBjbGFzcz1cIiN7QEVsZW1lbnRzLmxpbmt9XCIgaHJlZj1cIiN7ZnVsbH1cIiByZWw9XCJnYWxsZXJ5XCI+XG5cdFx0XHRcdDxpbWcgY2xhc3M9XCIje0BFbGVtZW50cy5pbWFnZX1cIiBzcmM9XCIje3RodW1ifVwiIGNsYXNzPVwiUFBfSlNfX2xvYWRpbmdcIiAvPlxuXHRcdFx0PC9hPlxuXHRcdFx0XCJcIlwiXG5cblx0c2V0dXBfaXRlbXM6ID0+XG5cdFx0IyBDbGVhciBleGlzdGluZyBpdGVtcywgaWYgYW55XG5cdFx0QEl0ZW1zID0gW11cblxuXHRcdCMgTG9vcCBvdmVyIERPTSBhbmQgYWRkIGVhY2ggaXRlbSB0byBASXRlbXNcblx0XHQkKCBcIi4je0BFbGVtZW50cy5pdGVtfVwiICkuZWFjaCggQGFkZF9pdGVtIClcblx0XHRyZXR1cm5cblxuXHRhZGRfaXRlbTogKCBrZXksIGVsICkgPT5cblx0XHQkZWwgPSAkKCBlbCApXG5cdFx0QEl0ZW1zLnB1c2hcblx0XHRcdGVsICAgIDogZWxcblx0XHRcdCRlbCAgIDogJGVsXG5cdFx0XHRkYXRhICA6IG5ldyBJdGVtX0RhdGEoICRlbCApXG5cdFx0XHRsb2FkZWQ6IGZhbHNlXG5cblxuXHRcdHJldHVyblxuXG5cblx0IyMjXG5cdFx0TWV0aG9kc1xuXHQjIyNcblx0cmVzaXplX2FsbDogLT5cblx0XHRAcmVzaXplKCBpdGVtICkgZm9yIGl0ZW0gaW4gQEl0ZW1zXG5cblxuXG5cdCMgQXV0b21hdGljYWxseSBMb2FkIGFsbCBpdGVtcyB0aGF0IGFyZSBgaW5fbG9vc2Vfdmlld2Bcblx0YXV0b2xvYWQ6ID0+XG5cdFx0Zm9yIGl0ZW0sIGtleSBpbiBASXRlbXNcblx0XHRcdGlmIG5vdCBpdGVtLmxvYWRlZCBhbmQgQGluX2xvb3NlX3ZpZXcoIGl0ZW0uZWwgKVxuXHRcdFx0XHRAbG9hZCggaXRlbSApXG5cblx0aW5fbG9vc2VfdmlldzogKCBlbCApIC0+XG5cdFx0cmV0dXJuIHRydWUgaWYgbm90IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdD9cblx0XHRyZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcblxuXHRcdCMgRWxlbWVudHMgbm90IGluIHZpZXcgaWYgdGhleSBkb24ndCBoYXZlIGRpbWVuc2lvbnNcblx0XHRyZXR1cm4gZmFsc2UgaWYgcmVjdC5oZWlnaHQgaXMgMCBhbmQgcmVjdC53aWR0aCBpcyAwXG5cblxuXHRcdHJldHVybiAoXG5cdFx0XHQjIFkgQXhpc1xuXHRcdFx0cmVjdC50b3AgKyByZWN0LmhlaWdodCA+PSAtQFNlbnNpdGl2aXR5IGFuZCAjIHRvcFxuXHRcdFx0cmVjdC5ib3R0b20gLSByZWN0LmhlaWdodCA8PSBfX1dJTkRPVy5oZWlnaHQgKyBAU2Vuc2l0aXZpdHkgYW5kXG5cblx0XHRcdCMgWCBBeGlzXG5cdFx0XHRyZWN0LmxlZnQgKyByZWN0LndpZHRoID49IC1AU2Vuc2l0aXZpdHkgYW5kXG5cdFx0XHRyZWN0LnJpZ2h0IC0gcmVjdC53aWR0aCA8PSBfX1dJTkRPVy53aWR0aCArIEBTZW5zaXRpdml0eVxuXG5cdFx0KVxuXG5cdGRlc3Ryb3k6IC0+XG5cdFx0QGRldGFjaF9ldmVudHMoKVxuXG5cdGF0dGFjaF9ldmVudHM6IC0+XG5cdFx0IyBDcmVhdGUgYSBkZWJvdW5jZWQgYGF1dG9sb2FkYCBmdW5jdGlvblxuXHRcdEB0aHJvdHRsZWRfYXV0b2xvYWQgPSB0aHJvdHRsZSggQGF1dG9sb2FkLCA1MCApXG5cdFx0SG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCcsIEB0aHJvdHRsZWRfYXV0b2xvYWQsIDEwMFxuXG5cblx0ZGV0YWNoX2V2ZW50czogLT5cblx0XHQjIENsZWFyIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gZnJvbSBpbnN0YW5jZVxuXHRcdEB0aHJvdHRsZWRfYXV0b2xvYWQgPSBudWxsXG5cdFx0SG9va3MucmVtb3ZlQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCcsIEB0aHJvdHRsZWRfYXV0b2xvYWQsIDEwMFxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBYnN0cmFjdF9MYXp5X0xvYWRlclxuIiwiY2xhc3MgSXRlbV9EYXRhXG5cblx0Y29uc3RydWN0b3I6ICggJGVsICkgLT5cblx0XHRAJGVsID0gJGVsXG5cdFx0ZGF0YSA9ICRlbC5kYXRhKCAnaXRlbScgKVxuXG5cdFx0aWYgbm90IGRhdGFcblx0XHRcdHRocm93IG5ldyBFcnJvciBcIkVsZW1lbnQgZG9lc24ndCBjb250YWluIGBkYXRhLWl0ZW1gIGF0dHJpYnV0ZVwiXG5cblx0XHRAZGF0YSA9IGRhdGFcblxuXG5cblx0Z2V0X2RhdGE6ICggbmFtZSApIC0+XG5cdFx0aW1hZ2UgPSBAZGF0YVsgJ2ltYWdlcycgXVsgbmFtZSBdXG5cdFx0cmV0dXJuIGZhbHNlIGlmIG5vdCBpbWFnZVxuXG5cdFx0cmV0dXJuIGltYWdlXG5cblx0Z2V0X3NpemU6ICggbmFtZSApIC0+XG5cdFx0aW1hZ2UgPSBAZ2V0X2RhdGEoIG5hbWUgKVxuXHRcdHJldHVybiBmYWxzZSBpZiBub3QgaW1hZ2VcblxuXHRcdHNpemUgPSBpbWFnZVsgJ3NpemUnIF1cblxuXHRcdFt3aWR0aCwgaGVpZ2h0XSA9IHNpemUuc3BsaXQoICd4JyApXG5cblx0XHR3aWR0aCA9IHBhcnNlSW50KCB3aWR0aCApXG5cdFx0aGVpZ2h0ID0gcGFyc2VJbnQoIGhlaWdodCApXG5cblx0XHRyZXR1cm4gW3dpZHRoLCBoZWlnaHRdXG5cblx0Z2V0X3VybDogKCBuYW1lICkgLT5cblx0XHRpbWFnZSA9IEBnZXRfZGF0YSggbmFtZSApXG5cdFx0cmV0dXJuIGZhbHNlIGlmIG5vdCBpbWFnZVxuXHRcdHJldHVybiBpbWFnZVsgJ3VybCcgXVxuXG5cdGdldF9vcl9mYWxzZTogKCBrZXkgKSAtPlxuXHRcdGlmIEBkYXRhWyBrZXkgXVxuXHRcdFx0cmV0dXJuIEBkYXRhWyBrZXkgXVxuXHRcdHJldHVybiBmYWxzZVxuXG5cdGdldF9yYXRpbyAgIDogLT4gQGdldF9vcl9mYWxzZSggJ3JhdGlvJyApXG5cdGdldF90eXBlICAgIDogLT4gQGdldF9vcl9mYWxzZSggJ3R5cGUnIClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEl0ZW1fRGF0YVxuIiwiJCA9IHJlcXVpcmUoICdqUXVlcnknIClcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcbkFic3RyYWN0X0xhenlfTG9hZGVyID0gcmVxdWlyZSggJy4vQWJzdHJhY3RfTGF6eV9Mb2FkZXInIClcbl9fV0lORE9XID0gcmVxdWlyZSggJy4uL2NvcmUvV2luZG93JyApXG5cbmNsYXNzIExhenlfTWFzb25yeSBleHRlbmRzIEFic3RyYWN0X0xhenlfTG9hZGVyXG5cblx0cmVzaXplX2FsbDogLT5cblx0XHRAcGxhY2Vob2xkZXJfd2lkdGggPSAkKCAnLlBQX01hc29ucnlfX3NpemVyJyApLndpZHRoKClcblx0XHRzdXBlcigpXG5cblx0cmVzaXplOiAoIGl0ZW0gKSAtPlxuXHRcdGl0ZW0uJGVsLmNzcyAnbWluLWhlaWdodCc6IE1hdGguZmxvb3IoIEBwbGFjZWhvbGRlcl93aWR0aCAvIGl0ZW0uZGF0YS5nZXRfcmF0aW8oKSApXG5cblx0Y2xlYW51cF9hZnRlcl9sb2FkOiAoaXRlbSkgLT5cblx0XHQjIFJlbW92ZSBtaW4taGVpZ2h0XG5cdFx0aXRlbS4kZWwuY3NzKCAnbWluLWhlaWdodCcsICcnIClcblxuXHRcdCMgUnVuIGFsbCBvdGhlciBjbGVhbnVwc1xuXHRcdHN1cGVyKCBpdGVtIClcblxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCdcblxuXHRcdHJldHVyblxuXG5cdGF0dGFjaF9ldmVudHM6IC0+XG5cdFx0IyBDYWxsIFBhcmVudCBmaXJzdCwgaXQncyBnb2luZyB0byBjcmVhdGUgQHRocm90dGxlZF9hdXRvbG9hZFxuXHRcdHN1cGVyKClcblxuXHRcdCMgQXR0YWNoXG5cdFx0JCggd2luZG93ICkub24gJ3Njcm9sbCcsIEB0aHJvdHRsZWRfYXV0b2xvYWRcblxuXG5cblx0ZGV0YWNoX2V2ZW50czogLT5cblx0XHQjIERldGFjaFxuXHRcdCQoIHdpbmRvdyApLm9mZiAnc2Nyb2xsJywgQHRocm90dGxlZF9hdXRvbG9hZFxuXG5cdFx0IyBDYWxsIHBhcmVudCBsYXN0LCBpdCdzIGdvaW5nIHRvIGNsZWFuIHVwIEB0aHJvdHRsZWRfYXV0b2xvYWRcblx0XHRzdXBlcigpXG5cblx0ZGVzdHJveTogLT5cblx0XHRmb3IgaXRlbSwga2V5IGluIEBJdGVtc1xuXHRcdFx0aXRlbS4kZWwuY3NzICdtaW4taGVpZ2h0JywgJydcblx0XHRzdXBlcigpXG5cblxubW9kdWxlLmV4cG9ydHMgPSBMYXp5X01hc29ucnlcbiIsIiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5cblxuaW5zdGFuY2UgPSBmYWxzZVxuXG5kZXN0cm95ID0gLT5cblx0cmV0dXJuIGlmIG5vdCBpbnN0YW5jZVxuXHRpbnN0YW5jZS5kZXN0cm95KClcblx0aW5zdGFuY2UgPSBudWxsXG5cbmNyZWF0ZSA9IC0+XG5cblx0IyBNYWtlIHN1cmUgYW4gaW5zdGFuY2UgZG9lc24ndCBhbHJlYWR5IGV4aXN0XG5cdGRlc3Ryb3koKVxuXG5cdCMgSGFuZGxlciByZXF1aXJlZFxuXHRIYW5kbGVyID0gSG9va3MuYXBwbHlGaWx0ZXJzICdwaG9ydC5sYXp5LmhhbmRsZXInLCBmYWxzZVxuXHRyZXR1cm4gaWYgbm90IEhhbmRsZXJcblxuXHQjIEJ5IGRlZmF1bHQgTGF6eV9NYXNvbnJ5IGlzIGhhbmRsaW5nIExhenktTG9hZGluZ1xuXHQjIENoZWNrIGlmIGFueW9uZSB3YW50cyB0byBoaWphY2sgaGFuZGxlclxuXHRpbnN0YW5jZSA9IG5ldyBIYW5kbGVyKClcblxuXHRyZXR1cm5cblxuXG4jIEluaXRpYWxpemUgbGF6eSBsb2FkZXIgYWZ0ZXIgdGhlIHBvcnRmb2xpbyBpcyBwcmVwYXJlZCwgcCA9IDEwMFxuSG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZScsIGNyZWF0ZSwgMTAwXG5Ib29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgZGVzdHJveSIsIkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcblxuIyMjXG5cbiAgICAjIEluaXRpYWxpemUgUG9ydGZvbGlvIENvcmVcblx0LS0tXG5cdFx0VXNpbmcgcDUwIEAgYHBob3J0LmNvcmUucmVhZHlgXG5cdFx0TGF0ZSBwcmlvcml0eSBpcyBnb2luZyB0byBmb3JjZSBleHBsaWNpdCBwcmlvcml0eSBpbiBhbnkgb3RoZXIgbW92aW5nIHBhcnRzIHRoYXQgYXJlIGdvaW5nIHRvIHRvdWNoIHBvcnRmb2xpbyBsYXlvdXQgYXQgYHBob3J0LmxvYWRlZGBcblx0LS0tXG5cbiMjI1xuY2xhc3MgUG9ydGZvbGlvX0V2ZW50X01hbmFnZXJcblxuXHRwcmVwYXJlOiAtPlxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZSdcblx0XHRyZXR1cm5cblxuXHRjcmVhdGU6IC0+XG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5jcmVhdGUnXG5cdFx0cmV0dXJuXG5cblxuXHRyZWZyZXNoOiAtPlxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCdcblx0XHRyZXR1cm5cblxuXG5cdGRlc3Ryb3k6IC0+XG5cdFx0IyBEZXN0cm95XG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95J1xuXHRcdHJldHVyblxuXG5cbm1vZHVsZS5leHBvcnRzID0gUG9ydGZvbGlvX0V2ZW50X01hbmFnZXIiLCJIb29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5cblxuIyMjXG5cdEFic3RyYWN0IENsYXNzIFBvcnRvZmxpb19FdmVudF9JbWVwbGVtZW50YXRpb25cblxuICAgIEhhbmRsZXMgYWxsIHRoZSBldmVudHMgcmVxdWlyZWQgdG8gZnVsbHkgaGFuZGxlIGEgcG9ydGZvbGlvIGxheW91dCBwcm9jZXNzXG4jIyNcbmNsYXNzIFBvcnRmb2xpb19JbnRlcmZhY2VcblxuXHRjb25zdHJ1Y3RvcjogKCBhcmdzICkgLT5cblx0XHRAc2V0dXBfYWN0aW9ucygpXG5cdFx0QGluaXRpYWxpemUoIGFyZ3MgKVxuXG5cdHNldHVwX2FjdGlvbnM6IC0+XG5cdFx0SG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZScsIEBwcmVwYXJlLCA1MFxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLmNyZWF0ZScsIEBjcmVhdGUsIDUwXG5cdFx0SG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCcsIEByZWZyZXNoLCA1MFxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLmRlc3Ryb3knLCBAZGVzdHJveSwgNTBcblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgQHB1cmdlX2FjdGlvbnMsIDEwMFxuXG5cdHB1cmdlX2FjdGlvbnM6ID0+XG5cdFx0SG9va3MucmVtb3ZlQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZScsIEBwcmVwYXJlLCA1MFxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLmNyZWF0ZScsIEBjcmVhdGUsIDUwXG5cdFx0SG9va3MucmVtb3ZlQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCcsIEByZWZyZXNoLCA1MFxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLmRlc3Ryb3knLCBAZGVzdHJveSwgNTBcblx0XHRIb29rcy5yZW1vdmVBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgQHB1cmdlX2FjdGlvbnMsIDEwMFxuXG5cblx0IyMjXG4gICAgXHRSZXF1aXJlIHRoZXNlIG1ldGhvZHNcblx0IyMjXG5cdGluaXRpYWxpemU6IC0+IHRocm93IG5ldyBFcnJvciggXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYGluaXRpYWxpemVgIG1ldGhvZFwiIClcblx0cHJlcGFyZSAgIDogLT4gdGhyb3cgbmV3IEVycm9yKCBcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgcHJlcGFyZWAgbWV0aG9kXCIgKVxuXHRjcmVhdGUgICAgOiAtPiB0aHJvdyBuZXcgRXJyb3IoIFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGBjcmVhdGVgIG1ldGhvZFwiIClcblx0cmVmcmVzaCAgIDogLT4gdGhyb3cgbmV3IEVycm9yKCBcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgcmVmcmVzaGAgbWV0aG9kXCIgKVxuXHRkZXN0cm95ICAgOiAtPiB0aHJvdyBuZXcgRXJyb3IoIFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGBkZXN0cm95YCBtZXRob2RcIiApXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBvcnRmb2xpb19JbnRlcmZhY2UiLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuJCA9IHJlcXVpcmUoICdqUXVlcnknIClcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcblBvcnRmb2xpb19JbnRlcmZhY2UgPSByZXF1aXJlKCAnLi9Qb3J0Zm9saW9fSW50ZXJmYWNlJyApXG5cblxuY2xhc3MgUG9ydGZvbGlvX01hc29ucnkgZXh0ZW5kcyBQb3J0Zm9saW9fSW50ZXJmYWNlXG5cblx0Y29uc3RydWN0b3I6IC0+XG5cblx0XHRARWxlbWVudHMgPVxuXHRcdFx0Y29udGFpbmVyOiAnUFBfTWFzb25yeSdcblx0XHRcdHNpemVyICAgIDogJ1BQX01hc29ucnlfX3NpemVyJ1xuXHRcdFx0aXRlbSAgICAgOiAnUFBfTWFzb25yeV9faXRlbSdcblxuXHRcdHN1cGVyKClcblxuXHQjIyNcblx0XHRJbml0aWFsaXplXG5cdCMjI1xuXHRpbml0aWFsaXplOiAtPlxuXHRcdEAkY29udGFpbmVyID0gJCggXCIuI3tARWxlbWVudHMuY29udGFpbmVyfVwiIClcblxuXHQjIyNcblx0XHRQcmVwYXJlICYgQXR0YWNoIEV2ZW50c1xuICAgIFx0RG9uJ3Qgc2hvdyBhbnl0aGluZyB5ZXQuXG5cblx0XHRAY2FsbGVkIG9uIGhvb2sgYHBob3J0LnBvcnRmb2xpby5wcmVwYXJlYFxuXHQjIyNcblx0cHJlcGFyZTogPT5cblx0XHRyZXR1cm4gaWYgQCRjb250YWluZXIubGVuZ3RoIGlzIDBcblxuXHRcdEAkY29udGFpbmVyLmFkZENsYXNzKCAnUFBfSlNfX2xvYWRpbmdfbWFzb25yeScgKVxuXG5cdFx0QG1heWJlX2NyZWF0ZV9zaXplcigpXG5cblx0XHQjIE9ubHkgaW5pdGlhbGl6ZSwgaWYgbm8gbWFzb25yeSBleGlzdHNcblx0XHRtYXNvbnJ5X3NldHRpbmdzID0gSG9va3MuYXBwbHlGaWx0ZXJzICdwaG9ydC5tYXNvbnJ5LnNldHRpbmdzJyxcblx0XHRcdGl0ZW1TZWxlY3RvcjogXCIuI3tARWxlbWVudHMuaXRlbX1cIlxuXHRcdFx0Y29sdW1uV2lkdGggOiBcIi4je0BFbGVtZW50cy5zaXplcn1cIlxuXHRcdFx0Z3V0dGVyICAgICAgOiAwXG5cdFx0XHRpbml0TGF5b3V0ICA6IGZhbHNlXG5cblx0XHRAJGNvbnRhaW5lci5tYXNvbnJ5KCBtYXNvbnJ5X3NldHRpbmdzIClcblxuXHRcdEAkY29udGFpbmVyLm1hc29ucnkgJ29uY2UnLCAnbGF5b3V0Q29tcGxldGUnLCA9PlxuXHRcdFx0QCRjb250YWluZXJcblx0XHRcdFx0LnJlbW92ZUNsYXNzKCAnUFBfSlNfX2xvYWRpbmdfbWFzb25yeScgKVxuXHRcdFx0XHQuYWRkQ2xhc3MoICdQUF9KU19fbG9hZGluZ19jb21wbGV0ZScgKVxuXG5cdFx0XHQjIEB0cmlnZ2VyIHJlZnJlc2ggZXZlbnRcblx0XHRcdCMgdHJpZ2dlcnMgYEByZWZyZXNoKClgXG5cdFx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnXG5cblxuXHQjIyNcblx0XHRTdGFydCB0aGUgUG9ydGZvbGlvXG5cdFx0QGNhbGxlZCBvbiBob29rIGBwaG9ydC5wb3J0Zm9saW8uY3JlYXRlYFxuXHQjIyNcblx0Y3JlYXRlOiA9PlxuXHRcdEAkY29udGFpbmVyLm1hc29ucnkoKVxuXHRcdHJldHVyblxuXG5cblx0IyMjXG5cdFx0RGVzdHJveVxuXHRcdEBjYWxsZWQgb24gaG9vayBgcGhvcnQucG9ydGZvbGlvLmRlc3Ryb3lgXG5cdCMjI1xuXHRkZXN0cm95OiA9PlxuXHRcdEBtYXliZV9yZW1vdmVfc2l6ZXIoKVxuXG5cdFx0aWYgQCRjb250YWluZXIubGVuZ3RoID4gMFxuXHRcdFx0QCRjb250YWluZXIubWFzb25yeSggJ2Rlc3Ryb3knIClcblxuXG5cdFx0cmV0dXJuXG5cblxuXHQjIyNcblx0XHRSZWxvYWQgdGhlIGxheW91dFxuXHRcdEBjYWxsZWQgb24gaG9vayBgcGhvcnQucG9ydGZvbGlvLnJlZnJlc2hgXG5cdCMjI1xuXHRyZWZyZXNoOiA9PlxuXHRcdEAkY29udGFpbmVyLm1hc29ucnkoICdsYXlvdXQnIClcblxuXG5cblx0IyMjXG5cdFx0Q3JlYXRlIGEgc2l6ZXIgZWxlbWVudCBmb3IganF1ZXJ5LW1hc29ucnkgdG8gdXNlXG5cdCMjI1xuXHRtYXliZV9jcmVhdGVfc2l6ZXI6IC0+XG5cdFx0QGNyZWF0ZV9zaXplcigpIGlmIEBzaXplcl9kb2VzbnRfZXhpc3QoKVxuXHRcdHJldHVyblxuXG5cdG1heWJlX3JlbW92ZV9zaXplcjogLT5cblx0XHRyZXR1cm4gaWYgQCRjb250YWluZXIubGVuZ3RoIGlzbnQgMVxuXHRcdEAkY29udGFpbmVyLmZpbmQoIFwiLiN7QEVsZW1lbnRzLnNpemVyfVwiICkucmVtb3ZlKClcblx0XHRyZXR1cm5cblxuXHRzaXplcl9kb2VzbnRfZXhpc3Q6IC0+IEAkY29udGFpbmVyLmZpbmQoIFwiLiN7QEVsZW1lbnRzLnNpemVyfVwiICkubGVuZ3RoIGlzIDBcblxuXG5cdGNyZWF0ZV9zaXplcjogLT5cblx0XHRAJGNvbnRhaW5lci5hcHBlbmQgXCJcIlwiPGRpdiBjbGFzcz1cIiN7QEVsZW1lbnRzLnNpemVyfVwiPjwvZGl2PlwiXCJcIlxuXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gUG9ydGZvbGlvX01hc29ucnkiLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuUG9ydGZvbGlvX0V2ZW50X01hbmFnZXIgPSByZXF1aXJlKCAnLi9Qb3J0Zm9saW9fRXZlbnRfTWFuYWdlcicgKVxuJCA9IHJlcXVpcmUoICdqUXVlcnknIClcblxuIyBQb3J0Zm9saW8gbWFuYWdlciB3aWxsIHRyaWdnZXIgcG9ydGZvbGlvIGV2ZW50cyB3aGVuIG5lY2Vzc2FyeVxuUG9ydGZvbGlvID0gbmV3IFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyKClcblxuXG5pc19tYXNvbnJ5ID0gLT5cblx0cmV0dXJuICggJCggJy5QUF9NYXNvbnJ5JyApLmxlbmd0aCBpc250IDAgKVxuXG4jIFN0YXJ0IE1hc29ucnkgTGF5b3V0XG5zdGFydF9tYXNvbnJ5ID0gLT5cblx0cmV0dXJuIGZhbHNlIGlmIG5vdCBpc19tYXNvbnJ5KClcblxuXHRQb3J0Zm9saW9fTWFzb25yeSA9IHJlcXVpcmUoICcuL1BvcnRmb2xpb19NYXNvbnJ5JyApXG5cdG5ldyBQb3J0Zm9saW9fTWFzb25yeSgpXG5cbm1heWJlX2xhenlfbWFzb25yeSA9ICggaGFuZGxlciApIC0+XG5cdCMgVXNlIExhenlfTWFzb25yeSBoYW5kbGVyLCBpZiBjdXJyZW50IGxheW91dCBpcyBtYXNvbnJ5XG5cdHJldHVybiByZXF1aXJlKCAnbGF6eS9MYXp5X01hc29ucnknICkgaWYgaXNfbWFzb25yeSgpXG5cdHJldHVybiBoYW5kbGVyXG5cblxuIyBTdGFydCBQb3J0Zm9saW9cbkhvb2tzLmFkZEFjdGlvbiAncGhvcnQuY29yZS5yZWFkeScsIFBvcnRmb2xpby5wcmVwYXJlLCA1MFxuSG9va3MuYWRkQWN0aW9uICdwaG9ydC5jb3JlLmxvYWRlZCcsIFBvcnRmb2xpby5jcmVhdGUsIDUwXG5cbiMgSW5pdGlhbGl6ZSBNYXNvbnJ5IExheW91dFxuSG9va3MuYWRkQWN0aW9uICdwaG9ydC5jb3JlLnJlYWR5Jywgc3RhcnRfbWFzb25yeVxuXG4jIEluaXRpYWxpemUgTGF6eSBMb2FkaW5nIGZvciBNYXNvbnJ5IExheW91dFxuSG9va3MuYWRkRmlsdGVyICdwaG9ydC5sYXp5LmhhbmRsZXInLCBtYXliZV9sYXp5X21hc29ucnlcblxuXG5cbiJdfQ==
