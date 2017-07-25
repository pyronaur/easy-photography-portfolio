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

},{"./core/Photography_Portfolio":2,"./gallery/popup":8,"./lazy/Abstract_Lazy_Loader":9,"./lazy/Item_Data":10,"./lazy/start":12,"./portfolio/Portfolio_Interface":14,"./portfolio/start":16}],2:[function(require,module,exports){
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
var $, Hooks, Item_Data, defaults, get_settings, settings, single_item_data;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Item_Data = require('../lazy/Item_Data');

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

single_item_data = function(item) {
  var full;
  if (item.data.get_type() === 'video') {
    full = item.data.get_or_false('video_url');
  } else {
    full = item.data.get_url('full');
  }
  return {
    src: full,
    thumb: item.data.get_url('thumb'),
    subHtml: item.caption
  };
};

get_settings = function(gallery, index) {
  settings.index = index;
  settings.dynamicEl = gallery.map(single_item_data);
  settings.videoMaxWidth = $(window).width() * 0.8;
  return Hooks.applyFilters('phort.lightGallery.settings', settings);
};

module.exports = function($el) {
  return {
    destroy: function() {
      return $el.data('lightGallery').destroy();
    },
    open: function($gallery_items, index) {
      return $el.lightGallery(get_settings($gallery_items, index));
    }
  };
};


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../lazy/Item_Data":10}],6:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var $, Hooks, Item_Data, Photoswipe_Factory, single_item_data, thumbnail_position;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Photoswipe_Factory = require('./photoswipe_factory');

Item_Data = require('../lazy/Item_Data');

single_item_data = function(item) {
  var height, ref, width;
  if (item.data.get_type() !== 'image') {
    return;
  }
  ref = item.data.get_size('full'), width = ref[0], height = ref[1];
  return {
    src: item.data.get_url('full'),
    msrc: item.data.get_url('full'),
    w: width,
    h: height,
    title: item.caption
  };
};

thumbnail_position = function($el) {
  return function() {
    var out, pageYScroll, rect, thumbnail;
    if (!$el) {
      return false;
    }
    thumbnail = $el.find('img').get(0);
    pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
    rect = thumbnail.getBoundingClientRect();
    out = {
      x: rect.left,
      y: rect.top + pageYScroll,
      w: rect.width
    };
    return out;
  };
};

module.exports = function($el) {
  return {
    open: function(gallery, index) {
      var Gallery;
      Gallery = new Photoswipe_Factory({
        getThumbBoundsFn: thumbnail_position($el)
      });
      return Gallery.open(gallery.map(single_item_data), {
        index: index
      });
    }
  };
};


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../lazy/Item_Data":10,"./photoswipe_factory":7}],7:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var $, Hooks, Photoswipe_Factory,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Photoswipe_Factory = (function() {
  function Photoswipe_Factory(options) {
    var defaults;
    if (options == null) {
      options = {};
    }
    this.handle_close = bind(this.handle_close, this);
    this.close = bind(this.close, this);
    this.el = document.querySelector('.pswp');
    this.UI = Hooks.applyFilters("phort.photoswipe.UI", PhotoSwipeUI_Default);
    this.is_open = false;
    defaults = {
      index: 0,
      preload: [1, 3],
      escKey: false,
      shareButtons: [
        {
          id: 'facebook',
          label: 'Share on Facebook',
          url: 'https://www.facebook.com/sharer/sharer.php?u={{url}}'
        }, {
          id: 'twitter',
          label: 'Tweet',
          url: 'https://twitter.com/intent/tweet?text={{text}}&url={{url}}'
        }, {
          id: 'pinterest',
          label: 'Pin it',
          url: 'http://www.pinterest.com/pin/create/button/?url={{url}}&media={{image_url}}&description={{text}}'
        }
      ]
    };
    this.defaults = Hooks.applyFilters("phort.photoswipe.defaults", $.extend({}, defaults, options));
  }

  Photoswipe_Factory.prototype.close = function() {
    return this.instance.close();
  };

  Photoswipe_Factory.prototype.handle_close = function() {
    this.is_open = false;
  };

  Photoswipe_Factory.prototype.trigger_change = function() {
    return Hooks.doAction('theme.gallery/move', this.getCurrentIndex());
  };

  Photoswipe_Factory.prototype.open = function(data, opts) {
    var options;
    if (data == null) {
      data = {};
    }
    if (opts == null) {
      opts = {};
    }
    options = $.extend({}, this.defaults, opts);
    if (options.index == null) {
      options.index = 0;
    }
    if (!options.index || options.index < 0) {
      options.index = 0;
    }
    this.instance = new PhotoSwipe(this.el, this.UI, data, options);
    this.instance.init();
    this.instance.listen('close', this.handle_close);
    this.instance.listen('afterChange', this.trigger_change);
    this.is_open = true;
    return this.instance;
  };

  return Photoswipe_Factory;

})();

module.exports = Photoswipe_Factory;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],8:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var $, Gallery, Hooks, Item_Data, active_gallery, gallery_item;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Item_Data = require('../lazy/Item_Data');

active_gallery = window.__phort.popup_gallery || 'lightgallery';

if (active_gallery === 'lightgallery') {
  Gallery = require('./lightGallery');
}

if (active_gallery === 'photoswipe') {
  Gallery = require('./photoswipe');
}

if (!Gallery) {
  return;
}

gallery_item = function(key, el) {
  var $el;
  $el = $(el);
  return {
    index: key,
    data: new Item_Data($el),
    caption: $el.find('.PP_Gallery__caption').html() || ''
  };
};

$(document).on('click', '.PP_Gallery__item', function(e) {
  var $el, $items, gallery_items, index;
  e.preventDefault();
  $el = $(this);
  $items = $el.closest('.PP_Gallery').find('.PP_Gallery__item');
  if ($items.length > 0) {
    index = $items.index($el);
    gallery_items = $.makeArray($items.map(gallery_item));
    return Gallery($el).open(gallery_items, index);
  }
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../lazy/Item_Data":10,"./lightGallery":5,"./photoswipe":6}],9:[function(require,module,exports){
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

},{"../core/Utilities":3,"../core/Window":4,"./Item_Data":10}],10:[function(require,module,exports){
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


},{}],11:[function(require,module,exports){
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

},{"../core/Window":4,"./Abstract_Lazy_Loader":9}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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

},{"./Portfolio_Interface":14}],16:[function(require,module,exports){
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

},{"./Portfolio_Event_Manager":13,"./Portfolio_Masonry":15,"lazy/Lazy_Masonry":11}]},{},[1])


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jb3JlL1Bob3RvZ3JhcGh5X1BvcnRmb2xpby5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY29yZS9VdGlsaXRpZXMuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY29yZS9XaW5kb3cuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvbGlnaHRHYWxsZXJ5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9nYWxsZXJ5L3Bob3Rvc3dpcGUuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvcGhvdG9zd2lwZV9mYWN0b3J5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9nYWxsZXJ5L3BvcHVwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0Fic3RyYWN0X0xhenlfTG9hZGVyLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0l0ZW1fRGF0YS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvbGF6eS9MYXp5X01hc29ucnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvc3RhcnQuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL3BvcnRmb2xpby9Qb3J0Zm9saW9fRXZlbnRfTWFuYWdlci5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL1BvcnRmb2xpb19JbnRlcmZhY2UuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL3BvcnRmb2xpby9Qb3J0Zm9saW9fTWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL3N0YXJ0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFB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QUFOLENBQWdCLG1CQUFoQixFQUFxQyxTQUFTLENBQUMsTUFBL0MsRUFBdUQsRUFBdkQ7O0FBR0EsS0FBSyxDQUFDLFNBQU4sQ0FBZ0Isa0JBQWhCLEVBQW9DLGFBQXBDOztBQUdBLEtBQUssQ0FBQyxTQUFOLENBQWdCLG9CQUFoQixFQUFzQyxrQkFBdEMiLCJmaWxlIjoicGhvdG9ncmFwaHktcG9ydGZvbGlvLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIjIyNcbiAgICBMb2FkIERlcGVuZGVuY2llc1xuIyMjXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG4kID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuXG5cbiMgRXhwb3NlIHNvbWUgUGhvdG9ncmFwaHkgUG9ydGZvbGlvIG1vZHVsZXMgdG8gdGhlIHB1YmxpYyBmb3IgZXh0ZW5zaWJpbGl0eVxud2luZG93LlBQX01vZHVsZXMgPVxuXHQjIEV4dGVuZCBQb3J0Zm9saW8gSW50ZXJmYWNlIHRvIGJ1aWxkIGN1c3RvbSBwb3J0Zm9saW8gbGF5b3V0cyBiYXNlZCBvbiBQUCBFdmVudHNcblx0UG9ydGZvbGlvX0ludGVyZmFjZTogcmVxdWlyZSggJy4vcG9ydGZvbGlvL1BvcnRmb2xpb19JbnRlcmZhY2UnIClcblxuXHQjIFVzZSBgSXRlbV9EYXRhYCB0byBnZXQgZm9ybWF0dGVkIGl0ZW0gaW1hZ2Ugc2l6ZXMgZm9yIGxhenkgbGFvZGluZ1xuXHRJdGVtX0RhdGE6IHJlcXVpcmUoICcuL2xhenkvSXRlbV9EYXRhJyApXG5cblx0IyBFeHRlbmQgQWJzdHJhY3RfTGF6eV9Mb2RlciB0byBpbXBsZW1lbnQgbGF6eSBsb2FkZXIgZm9yIHlvdXIgbGF5b3V0XG5cdEFic3RyYWN0X0xhenlfTG9hZGVyOiByZXF1aXJlKCAnLi9sYXp5L0Fic3RyYWN0X0xhenlfTG9hZGVyJyApXG5cbiMjI1xuXHRJbmNsdWRlc1xuIyMjXG5cbiMgU3RhcnQgUG9ydGZvbGlvXG5yZXF1aXJlICcuL3BvcnRmb2xpby9zdGFydCdcblxuIyBHYWxsZXJ5XG5yZXF1aXJlICcuL2dhbGxlcnkvcG9wdXAnXG5cbiMgTGF6eSBMb2FkaW5nXG5yZXF1aXJlICcuL2xhenkvc3RhcnQnXG5cblxuXG5cbiMjI1xuXHRCb290IG9uIGBkb2N1bWVudC5yZWFkeWBcbiMjI1xuJCggZG9jdW1lbnQgKS5yZWFkeSAtPlxuXG5cdCMgT25seSBydW4gdGhpcyBzY3JpcHQgd2hlbiBib2R5IGhhcyBgUFBfUG9ydGZvbGlvYCBjbGFzc1xuXHRyZXR1cm4gaWYgbm90ICQoICdib2R5JyApLmhhc0NsYXNzKCAnUFBfUG9ydGZvbGlvJyApXG5cblx0IyBCb290XG5cdFBob3RvZ3JhcGh5X1BvcnRmb2xpbyA9IG5ldyAoIHJlcXVpcmUoICcuL2NvcmUvUGhvdG9ncmFwaHlfUG9ydGZvbGlvJyApICkoKVxuXHRQaG90b2dyYXBoeV9Qb3J0Zm9saW8ucmVhZHkoKVxuXG5cdHJldHVybiIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuXG5cbmNsYXNzIENvcmVcblxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LmNvcmUucmVhZHknLCBAd2FpdF9mb3JfbG9hZFxuXG5cdCMgVHJpZ2dlciBwaG9ydC5jb3JlLnJlYWR5XG5cdHJlYWR5OiA9PlxuXHRcdGlmIEhvb2tzLmFwcGx5RmlsdGVycyggJ3Bob3J0LmNvcmUucmVhZHknLCB0cnVlIClcblx0XHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5jb3JlLnJlYWR5J1xuXHRcdHJldHVyblxuXG5cdHdhaXRfZm9yX2xvYWQ6ID0+XG5cdFx0IyBUcmlnZ2VyIGltYWdlc0xvYWRlZCBldmVudCB3aGVuIGltYWdlcyBoYXZlIGxvYWRlZFxuXHRcdCQoICcuUFBfV3JhcHBlcicgKS5pbWFnZXNMb2FkZWQoIEBsb2FkZWQgKVxuXG5cdCMgVHJpZ2dlciBwaG9ydC5jb3JlLmxvYWRlZFxuXHRsb2FkZWQ6IC0+XG5cdFx0aWYgSG9va3MuYXBwbHlGaWx0ZXJzKCAncGhvcnQuY29yZS5sb2FkZWQnLCB0cnVlIClcblx0XHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5jb3JlLmxvYWRlZCdcblxuXHRcdHJldHVyblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQ29yZSIsIm1vZHVsZS5leHBvcnRzID0ge1xuXG5cbiAgICAvKipcbiAgICAgKiBUaGFuayB5b3UgUnVzcyBmb3IgaGVscGluZyBtZSBhdm9pZCB3cml0aW5nIHRoaXMgbXlzZWxmOlxuICAgICAqIEB1cmwgaHR0cHM6Ly9yZW15c2hhcnAuY29tLzIwMTAvMDcvMjEvdGhyb3R0bGluZy1mdW5jdGlvbi1jYWxscy8jY29tbWVudC0yNzQ1NjYzNTk0XG4gICAgICovXG4gICAgdGhyb3R0bGU6IGZ1bmN0aW9uICggZm4sIHRocmVzaGhvbGQsIHNjb3BlICkge1xuICAgICAgICB0aHJlc2hob2xkIHx8ICh0aHJlc2hob2xkID0gMjUwKVxuICAgICAgICB2YXIgbGFzdCxcbiAgICAgICAgICAgIGRlZmVyVGltZXJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBjb250ZXh0ID0gc2NvcGUgfHwgdGhpc1xuXG4gICAgICAgICAgICB2YXIgbm93ICA9ICtuZXcgRGF0ZSxcbiAgICAgICAgICAgICAgICBhcmdzID0gYXJndW1lbnRzXG4gICAgICAgICAgICBpZiAoIGxhc3QgJiYgbm93IDwgbGFzdCArIHRocmVzaGhvbGQgKSB7XG4gICAgICAgICAgICAgICAgLy8gaG9sZCBvbiB0byBpdFxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCggZGVmZXJUaW1lciApXG4gICAgICAgICAgICAgICAgZGVmZXJUaW1lciA9IHNldFRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFzdCA9IG5vd1xuICAgICAgICAgICAgICAgICAgICBmbi5hcHBseSggY29udGV4dCwgYXJncyApXG4gICAgICAgICAgICAgICAgfSwgdGhyZXNoaG9sZCArIGxhc3QgLSBub3cgKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsYXN0ID0gbm93XG4gICAgICAgICAgICAgICAgZm4uYXBwbHkoIGNvbnRleHQsIGFyZ3MgKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG5cbn0iLCJIb29rcyA9IHJlcXVpcmUoICd3cF9ob29rcycgKVxuXG5cbmdldF9zaXplID0gLT5cblx0d2lkdGggOiB3aW5kb3cuaW5uZXJXaWR0aCB8fCAkd2luZG93LndpZHRoKClcblx0aGVpZ2h0OiB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgJHdpbmRvdy5oZWlnaHQoKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0X3NpemUoKSIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggXCJqUXVlcnlcIiApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5JdGVtX0RhdGEgPSByZXF1aXJlKCAnLi4vbGF6eS9JdGVtX0RhdGEnIClcblxuXG5kZWZhdWx0cyA9XG5cdGR5bmFtaWMgOiB0cnVlXG5cdHNwZWVkICAgOiAzNTBcblx0cHJlbG9hZCA6IDNcblx0ZG93bmxvYWQ6IGZhbHNlXG5cdGVzY0tleSAgOiBmYWxzZSAjIFdlJ3JlIHJvbGxpbmcgb3VyIG93blxuXG5cdHRodW1ibmFpbCAgICAgICAgIDogdHJ1ZVxuXHRzaG93VGh1bWJCeURlZmF1bHQ6IHRydWVcblxuc2V0dGluZ3MgPSAkLmV4dGVuZCgge30sIGRlZmF1bHRzLCB3aW5kb3cuX19waG9ydC5saWdodEdhbGxlcnkgKVxuXG5cbnNpbmdsZV9pdGVtX2RhdGEgPSAoIGl0ZW0gKSAtPlxuXG5cdGlmIGl0ZW0uZGF0YS5nZXRfdHlwZSggKSBpcyAndmlkZW8nXG5cdFx0ZnVsbCA9IGl0ZW0uZGF0YS5nZXRfb3JfZmFsc2UoICd2aWRlb191cmwnIClcblx0ZWxzZVxuXHRcdGZ1bGwgPSBpdGVtLmRhdGEuZ2V0X3VybCggJ2Z1bGwnIClcblxuXHRyZXR1cm4ge1xuXHRcdHNyYyAgICA6IGZ1bGxcblx0XHR0aHVtYiAgOiBpdGVtLmRhdGEuZ2V0X3VybCggJ3RodW1iJyApXG5cdFx0c3ViSHRtbDogaXRlbS5jYXB0aW9uXG5cdH1cblxuXG5nZXRfc2V0dGluZ3MgPSAoIGdhbGxlcnksIGluZGV4ICkgLT5cblx0c2V0dGluZ3MuaW5kZXggICAgICAgICA9IGluZGV4XG5cdHNldHRpbmdzLmR5bmFtaWNFbCAgICAgPSBnYWxsZXJ5Lm1hcCggc2luZ2xlX2l0ZW1fZGF0YSApXG5cdHNldHRpbmdzLnZpZGVvTWF4V2lkdGggPSAkKCB3aW5kb3cgKS53aWR0aCggKSAqIDAuOFxuXG5cdEhvb2tzLmFwcGx5RmlsdGVycyAncGhvcnQubGlnaHRHYWxsZXJ5LnNldHRpbmdzJywgc2V0dGluZ3NcblxuXG5tb2R1bGUuZXhwb3J0cyA9ICggJGVsICkgLT5cblx0ZGVzdHJveTogLT5cblx0XHQkZWwuZGF0YSggJ2xpZ2h0R2FsbGVyeScgKS5kZXN0cm95KCApXG5cblx0b3BlbjogKCAkZ2FsbGVyeV9pdGVtcywgaW5kZXggKSAtPlxuXHRcdCRlbC5saWdodEdhbGxlcnkoIGdldF9zZXR0aW5ncyggJGdhbGxlcnlfaXRlbXMsIGluZGV4ICkgKVxuXG5cblxuIiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoICd3cF9ob29rcycgKVxuUGhvdG9zd2lwZV9GYWN0b3J5ID0gcmVxdWlyZSggJy4vcGhvdG9zd2lwZV9mYWN0b3J5JyApXG5JdGVtX0RhdGEgPSByZXF1aXJlKCAnLi4vbGF6eS9JdGVtX0RhdGEnIClcblxuc2luZ2xlX2l0ZW1fZGF0YSA9ICggaXRlbSApIC0+XG5cdCMgUGhvdG9Td2lwZSBzdXBwb3J0cyBvbmx5IGltYWdlc1xuXHRyZXR1cm4gaWYgaXRlbS5kYXRhLmdldF90eXBlKCApIGlzbnQgJ2ltYWdlJ1xuXG5cdFt3aWR0aCwgaGVpZ2h0XSA9IGl0ZW0uZGF0YS5nZXRfc2l6ZSggJ2Z1bGwnIClcblxuXHQjIHJldHVyblxuXHRzcmMgIDogaXRlbS5kYXRhLmdldF91cmwoICdmdWxsJyApXG5cdG1zcmMgOiBpdGVtLmRhdGEuZ2V0X3VybCggJ2Z1bGwnIClcblx0dyAgICA6IHdpZHRoXG5cdGggICAgOiBoZWlnaHRcblx0dGl0bGU6IGl0ZW0uY2FwdGlvblxuXG4jIEBUT0RPOiBBZGQgb3B0aW9uIHRvIHByZXZlbnQgYW5pbWF0aW9uXG4jIEBUT0RPOiBNYWtlIHN1cmUgbGF6eSBsb2FkaW5nIHdvcmtzIHdoZW4gY2xvc2luZyBQaG90b3N3aXBlXG50aHVtYm5haWxfcG9zaXRpb24gPSAoICRlbCApIC0+IHJldHVybiAtPlxuXHRyZXR1cm4gZmFsc2UgaWYgbm90ICRlbFxuXG5cdHRodW1ibmFpbCA9ICRlbC5maW5kKCAnaW1nJyApLmdldCggMCApXG5cdHBhZ2VZU2Nyb2xsID0gd2luZG93LnBhZ2VZT2Zmc2V0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3Bcblx0cmVjdCA9IHRodW1ibmFpbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoIClcblxuXHQjIC8vIHcgPSB3aWR0aFxuXHRvdXQgPVxuXHRcdHg6IHJlY3QubGVmdFxuXHRcdHk6IHJlY3QudG9wICsgcGFnZVlTY3JvbGxcblx0XHR3OiByZWN0LndpZHRoXG5cblx0cmV0dXJuIG91dFxuXG5cbm1vZHVsZS5leHBvcnRzID0gKCAkZWwgKSAtPlxuXHRvcGVuOiAoIGdhbGxlcnksIGluZGV4ICkgLT5cblx0XHRHYWxsZXJ5ID0gbmV3IFBob3Rvc3dpcGVfRmFjdG9yeSggZ2V0VGh1bWJCb3VuZHNGbjogdGh1bWJuYWlsX3Bvc2l0aW9uKCAkZWwgKSApXG5cdFx0R2FsbGVyeS5vcGVuKCBnYWxsZXJ5Lm1hcCggc2luZ2xlX2l0ZW1fZGF0YSApLCBpbmRleDogaW5kZXggKVxuXG4iLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuSG9va3MgPSByZXF1aXJlKCd3cF9ob29rcycpXG4kID0gcmVxdWlyZSgnalF1ZXJ5JylcblxuY2xhc3MgUGhvdG9zd2lwZV9GYWN0b3J5XG5cblx0Y29uc3RydWN0b3I6IChvcHRpb25zID0ge30pIC0+XG5cblx0XHRAZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHN3cCcpXG5cdFx0QFVJID0gSG9va3MuYXBwbHlGaWx0ZXJzKFwicGhvcnQucGhvdG9zd2lwZS5VSVwiLCBQaG90b1N3aXBlVUlfRGVmYXVsdClcblx0XHRAaXNfb3BlbiA9IGZhbHNlXG5cblx0XHRkZWZhdWx0cyA9XG5cdFx0XHRpbmRleDogMFxuXHRcdFx0cHJlbG9hZDogWzEsM11cblx0XHRcdGVzY0tleTogZmFsc2Vcblx0XHRcdHNoYXJlQnV0dG9uczogW1xuXHRcdFx0XHR7aWQ6J2ZhY2Vib29rJywgbGFiZWw6J1NoYXJlIG9uIEZhY2Vib29rJywgdXJsOidodHRwczovL3d3dy5mYWNlYm9vay5jb20vc2hhcmVyL3NoYXJlci5waHA/dT17e3VybH19J31cblx0XHRcdFx0e2lkOid0d2l0dGVyJywgbGFiZWw6J1R3ZWV0JywgdXJsOidodHRwczovL3R3aXR0ZXIuY29tL2ludGVudC90d2VldD90ZXh0PXt7dGV4dH19JnVybD17e3VybH19J31cblx0XHRcdFx0e2lkOidwaW50ZXJlc3QnLCBsYWJlbDonUGluIGl0JywgdXJsOidodHRwOi8vd3d3LnBpbnRlcmVzdC5jb20vcGluL2NyZWF0ZS9idXR0b24vP3VybD17e3VybH19Jm1lZGlhPXt7aW1hZ2VfdXJsfX0mZGVzY3JpcHRpb249e3t0ZXh0fX0nfVxuXHRcdFx0XVxuXG5cblx0XHRAZGVmYXVsdHMgPSBIb29rcy5hcHBseUZpbHRlcnMgXCJwaG9ydC5waG90b3N3aXBlLmRlZmF1bHRzXCIsICQuZXh0ZW5kKCB7fSwgZGVmYXVsdHMsIG9wdGlvbnMgKVxuXG5cblx0Y2xvc2U6ID0+XG5cdFx0QGluc3RhbmNlLmNsb3NlKClcblxuXHRoYW5kbGVfY2xvc2U6ID0+XG5cdFx0QGlzX29wZW4gPSBmYWxzZVxuXHRcdHJldHVyblxuXG5cdHRyaWdnZXJfY2hhbmdlOiAtPlxuXHRcdEhvb2tzLmRvQWN0aW9uICd0aGVtZS5nYWxsZXJ5L21vdmUnLCBAZ2V0Q3VycmVudEluZGV4KClcblxuXHRvcGVuOiAoZGF0YSA9IHt9LCBvcHRzID0ge30pIC0+XG5cblx0XHRvcHRpb25zID0gJC5leHRlbmQoIHt9LCBAZGVmYXVsdHMsIG9wdHMpXG5cblx0XHQjIEluZGV4IGlzIDAgYnkgZGVmYXVsdFxuXHRcdGlmIG5vdCBvcHRpb25zLmluZGV4P1xuXHRcdFx0b3B0aW9ucy5pbmRleCA9IDBcblxuXHRcdCMgU2V0IHRoZSBpbmRleCB0byAwIGlmIGl0IGlzbid0IGEgcHJvcGVyIHZhbHVlXG5cdFx0aWYgbm90IG9wdGlvbnMuaW5kZXggb3Igb3B0aW9ucy5pbmRleCA8IDBcblx0XHRcdG9wdGlvbnMuaW5kZXggPSAwXG5cblx0XHRAaW5zdGFuY2UgPSBuZXcgUGhvdG9Td2lwZShAZWwsIEBVSSwgZGF0YSAsIG9wdGlvbnMpXG5cdFx0QGluc3RhbmNlLmluaXQoKVxuXHRcdEBpbnN0YW5jZS5saXN0ZW4gJ2Nsb3NlJywgQGhhbmRsZV9jbG9zZVxuXHRcdEBpbnN0YW5jZS5saXN0ZW4gJ2FmdGVyQ2hhbmdlJywgQHRyaWdnZXJfY2hhbmdlXG5cdFx0QGlzX29wZW4gPSB0cnVlXG5cblx0XHRyZXR1cm4gQGluc3RhbmNlXG5cblxuXG4jIGV4cG9ydHNcbm1vZHVsZS5leHBvcnRzID0gUGhvdG9zd2lwZV9GYWN0b3J5IiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCBcImpRdWVyeVwiIClcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcbkl0ZW1fRGF0YSA9IHJlcXVpcmUoICcuLi9sYXp5L0l0ZW1fRGF0YScgKVxuXG5cbmFjdGl2ZV9nYWxsZXJ5ID0gd2luZG93Ll9fcGhvcnQucG9wdXBfZ2FsbGVyeSB8fCAnbGlnaHRnYWxsZXJ5J1xuXG5pZiBhY3RpdmVfZ2FsbGVyeSBpcyAnbGlnaHRnYWxsZXJ5J1xuXHRHYWxsZXJ5ID0gcmVxdWlyZSggJy4vbGlnaHRHYWxsZXJ5JyApXG5cbmlmIGFjdGl2ZV9nYWxsZXJ5IGlzICdwaG90b3N3aXBlJ1xuXHRHYWxsZXJ5ID0gcmVxdWlyZSggJy4vcGhvdG9zd2lwZScgKVxuXG5yZXR1cm4gaWYgbm90IEdhbGxlcnlcblxuZ2FsbGVyeV9pdGVtID0gKCBrZXksIGVsICkgLT5cblx0JGVsID0gJCggZWwgKVxuXG5cdGluZGV4ICA6IGtleVxuXHRkYXRhICAgOiBuZXcgSXRlbV9EYXRhKCAkZWwgKVxuXHRjYXB0aW9uOiAkZWwuZmluZCggJy5QUF9HYWxsZXJ5X19jYXB0aW9uJyApLmh0bWwoICkgfHwgJydcblxuXG4kKCBkb2N1bWVudCApLm9uICdjbGljaycsICcuUFBfR2FsbGVyeV9faXRlbScsICggZSApIC0+XG5cdGUucHJldmVudERlZmF1bHQoIClcblxuXHQkZWwgPSAkKCB0aGlzIClcblx0JGl0ZW1zID0gJGVsLmNsb3Nlc3QoICcuUFBfR2FsbGVyeScgKS5maW5kKCAnLlBQX0dhbGxlcnlfX2l0ZW0nIClcblxuXHRpZiAkaXRlbXMubGVuZ3RoID4gMFxuXHRcdGluZGV4ID0gJGl0ZW1zLmluZGV4KCAkZWwgKVxuXHRcdGdhbGxlcnlfaXRlbXMgPSAkLm1ha2VBcnJheSggJGl0ZW1zLm1hcCggZ2FsbGVyeV9pdGVtICkgKVxuXHRcdEdhbGxlcnkoICRlbCApLm9wZW4oIGdhbGxlcnlfaXRlbXMsIGluZGV4IClcblxuXG4jIE1vdmUgZnJvbSBsaWdodEdhbGxlcnkgcGhvcnQuY29yZS5yZWFkeVxuIyBCeSBkZWZhdWx0IEVQUCB3aWxsIGNsb3NlIHRoZSB3aG9sZSBnYWxsZXJ5IG9uIGNsb3NlXG4jIFVzZSB0aGlzIGhvb2tzIHRvIHByZXZlbnQgdGhhdFxuI1x0aWYgSG9va3MuYXBwbHlGaWx0ZXJzICdwaG9ydC5nYWxsZXJ5LmN1c3RvbV9lc2MnLCB0cnVlXG4jXHRcdCQoIHdpbmRvdyApLm9uICdrZXlkb3duJywgKCBlICkgLT5cbiNcdFx0XHRpZiAkZWwgJiYgZS5rZXlDb2RlIGlzIDI3XG4jXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCApXG4jXHRcdFx0XHRsaWdodEdhbGxlcnkoICRlbCApLmRlc3Ryb3koIClcbiNcdFx0XHRcdCRlbCA9IGZhbHNlXG4jXG4jXHRcdFx0cmV0dXJuICMgbm90aGluZ1xuIiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5JdGVtX0RhdGEgPSByZXF1aXJlKCAnLi9JdGVtX0RhdGEnIClcbl9fV0lORE9XID0gcmVxdWlyZSggJy4uL2NvcmUvV2luZG93JyApXG50aHJvdHRsZSA9IHJlcXVpcmUoJy4uL2NvcmUvVXRpbGl0aWVzJykudGhyb3R0bGVcblxuY2xhc3MgQWJzdHJhY3RfTGF6eV9Mb2FkZXJcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QEVsZW1lbnRzID1cblx0XHRcdGl0ZW0gICAgICAgOiAnUFBfTGF6eV9JbWFnZSdcblx0XHRcdHBsYWNlaG9sZGVyOiAnUFBfTGF6eV9JbWFnZV9fcGxhY2Vob2xkZXInXG5cdFx0XHRsaW5rICAgICAgIDogJ1BQX0pTX0xhenlfX2xpbmsnXG5cdFx0XHRpbWFnZSAgICAgIDogJ1BQX0pTX0xhenlfX2ltYWdlJ1xuXG5cdFx0QEl0ZW1zID0gW11cblxuXHRcdCMgQWRqdXN0YWJsZSBTZW5zaXRpdml0eSBmb3IgQGluX3ZpZXcgZnVuY3Rpb25cblx0XHQjIFZhbHVlIGluIHBpeGVsc1xuXHRcdEBTZW5zaXRpdml0eSA9IDEwMFxuXG5cdFx0IyBBdXRvLXNldHVwIHdoZW4gZXZlbnRzIGFyZSBhdHRhY2hlZFxuXHRcdCMgQXV0by1kZXN0cm95IHdoZW4gZXZlbnRzIGFyZSBkZXRhY2hlZFxuXHRcdEB0aHJvdHRsZWRfYXV0b2xvYWQgPSBudWxsXG5cblx0XHRAc2V0dXBfaXRlbXMoKVxuXHRcdEByZXNpemVfYWxsKClcblx0XHRAYXR0YWNoX2V2ZW50cygpXG5cblx0IyMjXG5cdFx0QWJzdHJhY3QgTWV0aG9kc1xuXHQjIyNcblxuXHQjIFRoaXMgaXMgcnVuIHdoZW4gYSByZXNpemUgb3IgcmVmcmVzaCBldmVudCBpcyBkZXRlY3RlZFxuXHRyZXNpemU6IC0+IHJldHVyblxuXG5cdGxvYWQ6ICggaXRlbSApIC0+XG5cdFx0QGxvYWRfaW1hZ2UoIGl0ZW0gKVxuXHRcdGl0ZW0uJGVsLmltYWdlc0xvYWRlZCA9PlxuXHRcdFx0QGNsZWFudXBfYWZ0ZXJfbG9hZCggaXRlbSApXG5cblx0bG9hZF9pbWFnZTogKCBpdGVtICkgLT5cblxuXHRcdCMgR2V0IGltYWdlIFVSTHNcblx0XHR0aHVtYiA9IGl0ZW0uZGF0YS5nZXRfdXJsKCAndGh1bWInIClcblx0XHRmdWxsID0gaXRlbS5kYXRhLmdldF91cmwoICdmdWxsJyApXG5cblx0XHQjIENyZWF0ZSBlbGVtZW50c1xuXHRcdGl0ZW0uJGVsXG5cdFx0XHQucHJlcGVuZCggQGdldF9pdGVtX2h0bWwoIHRodW1iLCBmdWxsICkgKVxuXHRcdFx0LnJlbW92ZUNsYXNzKCAnTGF6eS1JbWFnZScgKVxuXG5cdFx0IyBNYWtlIHN1cmUgdGhpcyBpbWFnZSBpc24ndCBsb2FkZWQgYWdhaW5cblx0XHRpdGVtLmxvYWRlZCA9IHRydWVcblxuXHRjbGVhbnVwX2FmdGVyX2xvYWQ6ICggaXRlbSApIC0+XG5cdFx0IyBBZGQgaW1hZ2UgUFBfSlNfbG9hZGVkIGNsYXNzXG5cdFx0aXRlbS4kZWwuZmluZCggJ2ltZycgKS5hZGRDbGFzcyggJ1BQX0pTX19sb2FkZWQnICkucmVtb3ZlQ2xhc3MoICdQUF9KU19fbG9hZGluZycgKVxuXG5cdFx0aXRlbS4kZWxcblxuXHRcdFx0IyBSZW1vdmUgYFBQX0xhenlfSW1hZ2VgLCBhcyB0aGlzIGlzIG5vdCBhIGxhenktbG9hZGFibGUgaW1hZ2UgYW55bW9yZVxuXHRcdFx0LnJlbW92ZUNsYXNzKCBARWxlbWVudHMuaXRlbSApXG5cblx0XHRcdCMgUmVtb3ZlIFBsYWNlaG9sZGVyXG5cdFx0XHQuZmluZCggXCIuI3tARWxlbWVudHMucGxhY2Vob2xkZXJ9XCIgKVxuXHRcdFx0LmZhZGVPdXQoIDQwMCwgLT4gJCggdGhpcyApLnJlbW92ZSgpIClcblxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5sYXp5LmxvYWRlZF9pdGVtJywgaXRlbVxuXG5cblx0Z2V0X2l0ZW1faHRtbDogKCB0aHVtYiwgZnVsbCApIC0+XG5cblx0XHRpZiAnZGlzYWJsZScgaXMgd2luZG93Ll9fcGhvcnQucG9wdXBfZ2FsbGVyeVxuXHRcdFx0cmV0dXJuIFwiXCJcIlxuXHRcdFx0PGRpdiBjbGFzcz1cIiN7QEVsZW1lbnRzLmxpbmt9XCIgcmVsPVwiZ2FsbGVyeVwiPlxuXHRcdFx0XHQ8aW1nIGNsYXNzPVwiI3tARWxlbWVudHMuaW1hZ2V9XCIgc3JjPVwiI3t0aHVtYn1cIiBjbGFzcz1cIlBQX0pTX19sb2FkaW5nXCIgLz5cblx0XHRcdDwvZGl2PlxuXHRcdFx0XCJcIlwiXG5cdFx0ZWxzZVxuXHRcdFx0cmV0dXJuIFwiXCJcIlxuXHRcdFx0PGEgY2xhc3M9XCIje0BFbGVtZW50cy5saW5rfVwiIGhyZWY9XCIje2Z1bGx9XCIgcmVsPVwiZ2FsbGVyeVwiPlxuXHRcdFx0XHQ8aW1nIGNsYXNzPVwiI3tARWxlbWVudHMuaW1hZ2V9XCIgc3JjPVwiI3t0aHVtYn1cIiBjbGFzcz1cIlBQX0pTX19sb2FkaW5nXCIgLz5cblx0XHRcdDwvYT5cblx0XHRcdFwiXCJcIlxuXG5cdHNldHVwX2l0ZW1zOiA9PlxuXHRcdCMgQ2xlYXIgZXhpc3RpbmcgaXRlbXMsIGlmIGFueVxuXHRcdEBJdGVtcyA9IFtdXG5cblx0XHQjIExvb3Agb3ZlciBET00gYW5kIGFkZCBlYWNoIGl0ZW0gdG8gQEl0ZW1zXG5cdFx0JCggXCIuI3tARWxlbWVudHMuaXRlbX1cIiApLmVhY2goIEBhZGRfaXRlbSApXG5cdFx0cmV0dXJuXG5cblx0YWRkX2l0ZW06ICgga2V5LCBlbCApID0+XG5cdFx0JGVsID0gJCggZWwgKVxuXHRcdEBJdGVtcy5wdXNoXG5cdFx0XHRlbCAgICA6IGVsXG5cdFx0XHQkZWwgICA6ICRlbFxuXHRcdFx0ZGF0YSAgOiBuZXcgSXRlbV9EYXRhKCAkZWwgKVxuXHRcdFx0bG9hZGVkOiBmYWxzZVxuXG5cblx0XHRyZXR1cm5cblxuXG5cdCMjI1xuXHRcdE1ldGhvZHNcblx0IyMjXG5cdHJlc2l6ZV9hbGw6IC0+XG5cdFx0QHJlc2l6ZSggaXRlbSApIGZvciBpdGVtIGluIEBJdGVtc1xuXG5cblxuXHQjIEF1dG9tYXRpY2FsbHkgTG9hZCBhbGwgaXRlbXMgdGhhdCBhcmUgYGluX2xvb3NlX3ZpZXdgXG5cdGF1dG9sb2FkOiA9PlxuXHRcdGZvciBpdGVtLCBrZXkgaW4gQEl0ZW1zXG5cdFx0XHRpZiBub3QgaXRlbS5sb2FkZWQgYW5kIEBpbl9sb29zZV92aWV3KCBpdGVtLmVsIClcblx0XHRcdFx0QGxvYWQoIGl0ZW0gKVxuXG5cdGluX2xvb3NlX3ZpZXc6ICggZWwgKSAtPlxuXHRcdHJldHVybiB0cnVlIGlmIG5vdCBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3Q/XG5cdFx0cmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG5cblx0XHQjIEVsZW1lbnRzIG5vdCBpbiB2aWV3IGlmIHRoZXkgZG9uJ3QgaGF2ZSBkaW1lbnNpb25zXG5cdFx0cmV0dXJuIGZhbHNlIGlmIHJlY3QuaGVpZ2h0IGlzIDAgYW5kIHJlY3Qud2lkdGggaXMgMFxuXG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0IyBZIEF4aXNcblx0XHRcdHJlY3QudG9wICsgcmVjdC5oZWlnaHQgPj0gLUBTZW5zaXRpdml0eSBhbmQgIyB0b3Bcblx0XHRcdHJlY3QuYm90dG9tIC0gcmVjdC5oZWlnaHQgPD0gX19XSU5ET1cuaGVpZ2h0ICsgQFNlbnNpdGl2aXR5IGFuZFxuXG5cdFx0XHQjIFggQXhpc1xuXHRcdFx0cmVjdC5sZWZ0ICsgcmVjdC53aWR0aCA+PSAtQFNlbnNpdGl2aXR5IGFuZFxuXHRcdFx0cmVjdC5yaWdodCAtIHJlY3Qud2lkdGggPD0gX19XSU5ET1cud2lkdGggKyBAU2Vuc2l0aXZpdHlcblxuXHRcdClcblxuXHRkZXN0cm95OiAtPlxuXHRcdEBkZXRhY2hfZXZlbnRzKClcblxuXHRhdHRhY2hfZXZlbnRzOiAtPlxuXHRcdCMgQ3JlYXRlIGEgZGVib3VuY2VkIGBhdXRvbG9hZGAgZnVuY3Rpb25cblx0XHRAdGhyb3R0bGVkX2F1dG9sb2FkID0gdGhyb3R0bGUoIEBhdXRvbG9hZCwgNTAgKVxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCBAdGhyb3R0bGVkX2F1dG9sb2FkLCAxMDBcblxuXG5cdGRldGFjaF9ldmVudHM6IC0+XG5cdFx0IyBDbGVhciB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uIGZyb20gaW5zdGFuY2Vcblx0XHRAdGhyb3R0bGVkX2F1dG9sb2FkID0gbnVsbFxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCBAdGhyb3R0bGVkX2F1dG9sb2FkLCAxMDBcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQWJzdHJhY3RfTGF6eV9Mb2FkZXJcbiIsImNsYXNzIEl0ZW1fRGF0YVxuXG5cdGNvbnN0cnVjdG9yOiAoICRlbCApIC0+XG5cdFx0QCRlbCA9ICRlbFxuXHRcdGRhdGEgPSAkZWwuZGF0YSggJ2l0ZW0nIClcblxuXHRcdGlmIG5vdCBkYXRhXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IgXCJFbGVtZW50IGRvZXNuJ3QgY29udGFpbiBgZGF0YS1pdGVtYCBhdHRyaWJ1dGVcIlxuXG5cdFx0QGRhdGEgPSBkYXRhXG5cblxuXG5cdGdldF9kYXRhOiAoIG5hbWUgKSAtPlxuXHRcdGltYWdlID0gQGRhdGFbICdpbWFnZXMnIF1bIG5hbWUgXVxuXHRcdHJldHVybiBmYWxzZSBpZiBub3QgaW1hZ2VcblxuXHRcdHJldHVybiBpbWFnZVxuXG5cdGdldF9zaXplOiAoIG5hbWUgKSAtPlxuXHRcdGltYWdlID0gQGdldF9kYXRhKCBuYW1lIClcblx0XHRyZXR1cm4gZmFsc2UgaWYgbm90IGltYWdlXG5cblx0XHRzaXplID0gaW1hZ2VbICdzaXplJyBdXG5cblx0XHRbd2lkdGgsIGhlaWdodF0gPSBzaXplLnNwbGl0KCAneCcgKVxuXG5cdFx0d2lkdGggPSBwYXJzZUludCggd2lkdGggKVxuXHRcdGhlaWdodCA9IHBhcnNlSW50KCBoZWlnaHQgKVxuXG5cdFx0cmV0dXJuIFt3aWR0aCwgaGVpZ2h0XVxuXG5cdGdldF91cmw6ICggbmFtZSApIC0+XG5cdFx0aW1hZ2UgPSBAZ2V0X2RhdGEoIG5hbWUgKVxuXHRcdHJldHVybiBmYWxzZSBpZiBub3QgaW1hZ2Vcblx0XHRyZXR1cm4gaW1hZ2VbICd1cmwnIF1cblxuXHRnZXRfb3JfZmFsc2U6ICgga2V5ICkgLT5cblx0XHRpZiBAZGF0YVsga2V5IF1cblx0XHRcdHJldHVybiBAZGF0YVsga2V5IF1cblx0XHRyZXR1cm4gZmFsc2VcblxuXHRnZXRfcmF0aW8gICA6IC0+IEBnZXRfb3JfZmFsc2UoICdyYXRpbycgKVxuXHRnZXRfdHlwZSAgICA6IC0+IEBnZXRfb3JfZmFsc2UoICd0eXBlJyApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBJdGVtX0RhdGFcbiIsIiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5BYnN0cmFjdF9MYXp5X0xvYWRlciA9IHJlcXVpcmUoICcuL0Fic3RyYWN0X0xhenlfTG9hZGVyJyApXG5fX1dJTkRPVyA9IHJlcXVpcmUoICcuLi9jb3JlL1dpbmRvdycgKVxuXG5jbGFzcyBMYXp5X01hc29ucnkgZXh0ZW5kcyBBYnN0cmFjdF9MYXp5X0xvYWRlclxuXG5cdHJlc2l6ZV9hbGw6IC0+XG5cdFx0QHBsYWNlaG9sZGVyX3dpZHRoID0gJCggJy5QUF9NYXNvbnJ5X19zaXplcicgKS53aWR0aCgpXG5cdFx0c3VwZXIoKVxuXG5cdHJlc2l6ZTogKCBpdGVtICkgLT5cblx0XHRpdGVtLiRlbC5jc3MgJ21pbi1oZWlnaHQnOiBNYXRoLmZsb29yKCBAcGxhY2Vob2xkZXJfd2lkdGggLyBpdGVtLmRhdGEuZ2V0X3JhdGlvKCkgKVxuXG5cdGNsZWFudXBfYWZ0ZXJfbG9hZDogKGl0ZW0pIC0+XG5cdFx0IyBSZW1vdmUgbWluLWhlaWdodFxuXHRcdGl0ZW0uJGVsLmNzcyggJ21pbi1oZWlnaHQnLCAnJyApXG5cblx0XHQjIFJ1biBhbGwgb3RoZXIgY2xlYW51cHNcblx0XHRzdXBlciggaXRlbSApXG5cblx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnXG5cblx0XHRyZXR1cm5cblxuXHRhdHRhY2hfZXZlbnRzOiAtPlxuXHRcdCMgQ2FsbCBQYXJlbnQgZmlyc3QsIGl0J3MgZ29pbmcgdG8gY3JlYXRlIEB0aHJvdHRsZWRfYXV0b2xvYWRcblx0XHRzdXBlcigpXG5cblx0XHQjIEF0dGFjaFxuXHRcdCQoIHdpbmRvdyApLm9uICdzY3JvbGwnLCBAdGhyb3R0bGVkX2F1dG9sb2FkXG5cblxuXG5cdGRldGFjaF9ldmVudHM6IC0+XG5cdFx0IyBEZXRhY2hcblx0XHQkKCB3aW5kb3cgKS5vZmYgJ3Njcm9sbCcsIEB0aHJvdHRsZWRfYXV0b2xvYWRcblxuXHRcdCMgQ2FsbCBwYXJlbnQgbGFzdCwgaXQncyBnb2luZyB0byBjbGVhbiB1cCBAdGhyb3R0bGVkX2F1dG9sb2FkXG5cdFx0c3VwZXIoKVxuXG5cdGRlc3Ryb3k6IC0+XG5cdFx0Zm9yIGl0ZW0sIGtleSBpbiBASXRlbXNcblx0XHRcdGl0ZW0uJGVsLmNzcyAnbWluLWhlaWdodCcsICcnXG5cdFx0c3VwZXIoKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gTGF6eV9NYXNvbnJ5XG4iLCIkID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuXG5cbmluc3RhbmNlID0gZmFsc2VcblxuZGVzdHJveSA9IC0+XG5cdHJldHVybiBpZiBub3QgaW5zdGFuY2Vcblx0aW5zdGFuY2UuZGVzdHJveSgpXG5cdGluc3RhbmNlID0gbnVsbFxuXG5jcmVhdGUgPSAtPlxuXG5cdCMgTWFrZSBzdXJlIGFuIGluc3RhbmNlIGRvZXNuJ3QgYWxyZWFkeSBleGlzdFxuXHRkZXN0cm95KClcblxuXHQjIEhhbmRsZXIgcmVxdWlyZWRcblx0SGFuZGxlciA9IEhvb2tzLmFwcGx5RmlsdGVycyAncGhvcnQubGF6eS5oYW5kbGVyJywgZmFsc2Vcblx0cmV0dXJuIGlmIG5vdCBIYW5kbGVyXG5cblx0IyBCeSBkZWZhdWx0IExhenlfTWFzb25yeSBpcyBoYW5kbGluZyBMYXp5LUxvYWRpbmdcblx0IyBDaGVjayBpZiBhbnlvbmUgd2FudHMgdG8gaGlqYWNrIGhhbmRsZXJcblx0aW5zdGFuY2UgPSBuZXcgSGFuZGxlcigpXG5cblx0cmV0dXJuXG5cblxuIyBJbml0aWFsaXplIGxhenkgbG9hZGVyIGFmdGVyIHRoZSBwb3J0Zm9saW8gaXMgcHJlcGFyZWQsIHAgPSAxMDBcbkhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnLCBjcmVhdGUsIDEwMFxuSG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScsIGRlc3Ryb3kiLCJIb29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5cbiMjI1xuXG4gICAgIyBJbml0aWFsaXplIFBvcnRmb2xpbyBDb3JlXG5cdC0tLVxuXHRcdFVzaW5nIHA1MCBAIGBwaG9ydC5jb3JlLnJlYWR5YFxuXHRcdExhdGUgcHJpb3JpdHkgaXMgZ29pbmcgdG8gZm9yY2UgZXhwbGljaXQgcHJpb3JpdHkgaW4gYW55IG90aGVyIG1vdmluZyBwYXJ0cyB0aGF0IGFyZSBnb2luZyB0byB0b3VjaCBwb3J0Zm9saW8gbGF5b3V0IGF0IGBwaG9ydC5sb2FkZWRgXG5cdC0tLVxuXG4jIyNcbmNsYXNzIFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyXG5cblx0cHJlcGFyZTogLT5cblx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnXG5cdFx0cmV0dXJuXG5cblx0Y3JlYXRlOiAtPlxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uY3JlYXRlJ1xuXHRcdHJldHVyblxuXG5cblx0cmVmcmVzaDogLT5cblx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnXG5cdFx0cmV0dXJuXG5cblxuXHRkZXN0cm95OiAtPlxuXHRcdCMgRGVzdHJveVxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveSdcblx0XHRyZXR1cm5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyIiwiSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuXG5cbiMjI1xuXHRBYnN0cmFjdCBDbGFzcyBQb3J0b2ZsaW9fRXZlbnRfSW1lcGxlbWVudGF0aW9uXG5cbiAgICBIYW5kbGVzIGFsbCB0aGUgZXZlbnRzIHJlcXVpcmVkIHRvIGZ1bGx5IGhhbmRsZSBhIHBvcnRmb2xpbyBsYXlvdXQgcHJvY2Vzc1xuIyMjXG5jbGFzcyBQb3J0Zm9saW9fSW50ZXJmYWNlXG5cblx0Y29uc3RydWN0b3I6ICggYXJncyApIC0+XG5cdFx0QHNldHVwX2FjdGlvbnMoKVxuXHRcdEBpbml0aWFsaXplKCBhcmdzIClcblxuXHRzZXR1cF9hY3Rpb25zOiAtPlxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnLCBAcHJlcGFyZSwgNTBcblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5jcmVhdGUnLCBAY3JlYXRlLCA1MFxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCBAcmVmcmVzaCwgNTBcblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgQGRlc3Ryb3ksIDUwXG5cdFx0SG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScsIEBwdXJnZV9hY3Rpb25zLCAxMDBcblxuXHRwdXJnZV9hY3Rpb25zOiA9PlxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnLCBAcHJlcGFyZSwgNTBcblx0XHRIb29rcy5yZW1vdmVBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5jcmVhdGUnLCBAY3JlYXRlLCA1MFxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCBAcmVmcmVzaCwgNTBcblx0XHRIb29rcy5yZW1vdmVBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgQGRlc3Ryb3ksIDUwXG5cdFx0SG9va3MucmVtb3ZlQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScsIEBwdXJnZV9hY3Rpb25zLCAxMDBcblxuXG5cdCMjI1xuICAgIFx0UmVxdWlyZSB0aGVzZSBtZXRob2RzXG5cdCMjI1xuXHRpbml0aWFsaXplOiAtPiB0aHJvdyBuZXcgRXJyb3IoIFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGBpbml0aWFsaXplYCBtZXRob2RcIiApXG5cdHByZXBhcmUgICA6IC0+IHRocm93IG5ldyBFcnJvciggXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYHByZXBhcmVgIG1ldGhvZFwiIClcblx0Y3JlYXRlICAgIDogLT4gdGhyb3cgbmV3IEVycm9yKCBcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgY3JlYXRlYCBtZXRob2RcIiApXG5cdHJlZnJlc2ggICA6IC0+IHRocm93IG5ldyBFcnJvciggXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYHJlZnJlc2hgIG1ldGhvZFwiIClcblx0ZGVzdHJveSAgIDogLT4gdGhyb3cgbmV3IEVycm9yKCBcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgZGVzdHJveWAgbWV0aG9kXCIgKVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW9fSW50ZXJmYWNlIiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5Qb3J0Zm9saW9fSW50ZXJmYWNlID0gcmVxdWlyZSggJy4vUG9ydGZvbGlvX0ludGVyZmFjZScgKVxuXG5cbmNsYXNzIFBvcnRmb2xpb19NYXNvbnJ5IGV4dGVuZHMgUG9ydGZvbGlvX0ludGVyZmFjZVxuXG5cdGNvbnN0cnVjdG9yOiAtPlxuXG5cdFx0QEVsZW1lbnRzID1cblx0XHRcdGNvbnRhaW5lcjogJ1BQX01hc29ucnknXG5cdFx0XHRzaXplciAgICA6ICdQUF9NYXNvbnJ5X19zaXplcidcblx0XHRcdGl0ZW0gICAgIDogJ1BQX01hc29ucnlfX2l0ZW0nXG5cblx0XHRzdXBlcigpXG5cblx0IyMjXG5cdFx0SW5pdGlhbGl6ZVxuXHQjIyNcblx0aW5pdGlhbGl6ZTogLT5cblx0XHRAJGNvbnRhaW5lciA9ICQoIFwiLiN7QEVsZW1lbnRzLmNvbnRhaW5lcn1cIiApXG5cblx0IyMjXG5cdFx0UHJlcGFyZSAmIEF0dGFjaCBFdmVudHNcbiAgICBcdERvbid0IHNob3cgYW55dGhpbmcgeWV0LlxuXG5cdFx0QGNhbGxlZCBvbiBob29rIGBwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZWBcblx0IyMjXG5cdHByZXBhcmU6ID0+XG5cdFx0cmV0dXJuIGlmIEAkY29udGFpbmVyLmxlbmd0aCBpcyAwXG5cblx0XHRAJGNvbnRhaW5lci5hZGRDbGFzcyggJ1BQX0pTX19sb2FkaW5nX21hc29ucnknIClcblxuXHRcdEBtYXliZV9jcmVhdGVfc2l6ZXIoKVxuXG5cdFx0IyBPbmx5IGluaXRpYWxpemUsIGlmIG5vIG1hc29ucnkgZXhpc3RzXG5cdFx0bWFzb25yeV9zZXR0aW5ncyA9IEhvb2tzLmFwcGx5RmlsdGVycyAncGhvcnQubWFzb25yeS5zZXR0aW5ncycsXG5cdFx0XHRpdGVtU2VsZWN0b3I6IFwiLiN7QEVsZW1lbnRzLml0ZW19XCJcblx0XHRcdGNvbHVtbldpZHRoIDogXCIuI3tARWxlbWVudHMuc2l6ZXJ9XCJcblx0XHRcdGd1dHRlciAgICAgIDogMFxuXHRcdFx0aW5pdExheW91dCAgOiBmYWxzZVxuXG5cdFx0QCRjb250YWluZXIubWFzb25yeSggbWFzb25yeV9zZXR0aW5ncyApXG5cblx0XHRAJGNvbnRhaW5lci5tYXNvbnJ5ICdvbmNlJywgJ2xheW91dENvbXBsZXRlJywgPT5cblx0XHRcdEAkY29udGFpbmVyXG5cdFx0XHRcdC5yZW1vdmVDbGFzcyggJ1BQX0pTX19sb2FkaW5nX21hc29ucnknIClcblx0XHRcdFx0LmFkZENsYXNzKCAnUFBfSlNfX2xvYWRpbmdfY29tcGxldGUnIClcblxuXHRcdFx0IyBAdHJpZ2dlciByZWZyZXNoIGV2ZW50XG5cdFx0XHQjIHRyaWdnZXJzIGBAcmVmcmVzaCgpYFxuXHRcdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5yZWZyZXNoJ1xuXG5cblx0IyMjXG5cdFx0U3RhcnQgdGhlIFBvcnRmb2xpb1xuXHRcdEBjYWxsZWQgb24gaG9vayBgcGhvcnQucG9ydGZvbGlvLmNyZWF0ZWBcblx0IyMjXG5cdGNyZWF0ZTogPT5cblx0XHRAJGNvbnRhaW5lci5tYXNvbnJ5KClcblx0XHRyZXR1cm5cblxuXG5cdCMjI1xuXHRcdERlc3Ryb3lcblx0XHRAY2FsbGVkIG9uIGhvb2sgYHBob3J0LnBvcnRmb2xpby5kZXN0cm95YFxuXHQjIyNcblx0ZGVzdHJveTogPT5cblx0XHRAbWF5YmVfcmVtb3ZlX3NpemVyKClcblxuXHRcdGlmIEAkY29udGFpbmVyLmxlbmd0aCA+IDBcblx0XHRcdEAkY29udGFpbmVyLm1hc29ucnkoICdkZXN0cm95JyApXG5cblxuXHRcdHJldHVyblxuXG5cblx0IyMjXG5cdFx0UmVsb2FkIHRoZSBsYXlvdXRcblx0XHRAY2FsbGVkIG9uIGhvb2sgYHBob3J0LnBvcnRmb2xpby5yZWZyZXNoYFxuXHQjIyNcblx0cmVmcmVzaDogPT5cblx0XHRAJGNvbnRhaW5lci5tYXNvbnJ5KCAnbGF5b3V0JyApXG5cblxuXG5cdCMjI1xuXHRcdENyZWF0ZSBhIHNpemVyIGVsZW1lbnQgZm9yIGpxdWVyeS1tYXNvbnJ5IHRvIHVzZVxuXHQjIyNcblx0bWF5YmVfY3JlYXRlX3NpemVyOiAtPlxuXHRcdEBjcmVhdGVfc2l6ZXIoKSBpZiBAc2l6ZXJfZG9lc250X2V4aXN0KClcblx0XHRyZXR1cm5cblxuXHRtYXliZV9yZW1vdmVfc2l6ZXI6IC0+XG5cdFx0cmV0dXJuIGlmIEAkY29udGFpbmVyLmxlbmd0aCBpc250IDFcblx0XHRAJGNvbnRhaW5lci5maW5kKCBcIi4je0BFbGVtZW50cy5zaXplcn1cIiApLnJlbW92ZSgpXG5cdFx0cmV0dXJuXG5cblx0c2l6ZXJfZG9lc250X2V4aXN0OiAtPiBAJGNvbnRhaW5lci5maW5kKCBcIi4je0BFbGVtZW50cy5zaXplcn1cIiApLmxlbmd0aCBpcyAwXG5cblxuXHRjcmVhdGVfc2l6ZXI6IC0+XG5cdFx0QCRjb250YWluZXIuYXBwZW5kIFwiXCJcIjxkaXYgY2xhc3M9XCIje0BFbGVtZW50cy5zaXplcn1cIj48L2Rpdj5cIlwiXCJcblxuXHRcdHJldHVyblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBvcnRmb2xpb19NYXNvbnJ5IiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcblBvcnRmb2xpb19FdmVudF9NYW5hZ2VyID0gcmVxdWlyZSggJy4vUG9ydGZvbGlvX0V2ZW50X01hbmFnZXInIClcbiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5cbiMgUG9ydGZvbGlvIG1hbmFnZXIgd2lsbCB0cmlnZ2VyIHBvcnRmb2xpbyBldmVudHMgd2hlbiBuZWNlc3NhcnlcblBvcnRmb2xpbyA9IG5ldyBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlcigpXG5cblxuaXNfbWFzb25yeSA9IC0+XG5cdHJldHVybiAoICQoICcuUFBfTWFzb25yeScgKS5sZW5ndGggaXNudCAwIClcblxuIyBTdGFydCBNYXNvbnJ5IExheW91dFxuc3RhcnRfbWFzb25yeSA9IC0+XG5cdHJldHVybiBmYWxzZSBpZiBub3QgaXNfbWFzb25yeSgpXG5cblx0UG9ydGZvbGlvX01hc29ucnkgPSByZXF1aXJlKCAnLi9Qb3J0Zm9saW9fTWFzb25yeScgKVxuXHRuZXcgUG9ydGZvbGlvX01hc29ucnkoKVxuXG5tYXliZV9sYXp5X21hc29ucnkgPSAoIGhhbmRsZXIgKSAtPlxuXHQjIFVzZSBMYXp5X01hc29ucnkgaGFuZGxlciwgaWYgY3VycmVudCBsYXlvdXQgaXMgbWFzb25yeVxuXHRyZXR1cm4gcmVxdWlyZSggJ2xhenkvTGF6eV9NYXNvbnJ5JyApIGlmIGlzX21hc29ucnkoKVxuXHRyZXR1cm4gaGFuZGxlclxuXG5cbiMgU3RhcnQgUG9ydGZvbGlvXG5Ib29rcy5hZGRBY3Rpb24gJ3Bob3J0LmNvcmUucmVhZHknLCBQb3J0Zm9saW8ucHJlcGFyZSwgNTBcbkhvb2tzLmFkZEFjdGlvbiAncGhvcnQuY29yZS5sb2FkZWQnLCBQb3J0Zm9saW8uY3JlYXRlLCA1MFxuXG4jIEluaXRpYWxpemUgTWFzb25yeSBMYXlvdXRcbkhvb2tzLmFkZEFjdGlvbiAncGhvcnQuY29yZS5yZWFkeScsIHN0YXJ0X21hc29ucnlcblxuIyBJbml0aWFsaXplIExhenkgTG9hZGluZyBmb3IgTWFzb25yeSBMYXlvdXRcbkhvb2tzLmFkZEZpbHRlciAncGhvcnQubGF6eS5oYW5kbGVyJywgbWF5YmVfbGF6eV9tYXNvbnJ5XG5cblxuXG4iXX0=
