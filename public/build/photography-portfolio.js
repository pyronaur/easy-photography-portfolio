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
  gallery: {
    item_data: require('./gallery/gallery_item_data'),
    item_factory: require('./gallery/gallery_item_factory')
  },
  Abstract_Lazy_Loader: require('./lazy/Abstract_Lazy_Loader')
};

window.Photography_Portfolio = {
  Core: require('./core/start'),
  Portfolio_Layout: require('./portfolio/start'),
  Gallery: require('./gallery/start'),
  Lazy_Loader: require('./lazy/start')
};


/*
	Boot on `document.ready`
 */

$(document).ready(function() {
  if (!$('body').hasClass('PP_Portfolio')) {
    return;
  }
  Photography_Portfolio.Core.ready();
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./core/start":4,"./gallery/gallery_item_data":8,"./gallery/gallery_item_factory":9,"./gallery/start":11,"./lazy/Abstract_Lazy_Loader":12,"./lazy/start":14,"./portfolio/Portfolio_Interface":16,"./portfolio/start":18}],2:[function(require,module,exports){
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
var $, Hooks, loaded, ready;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

ready = function() {
  if (Hooks.applyFilters('phort.core.ready', true)) {
    Hooks.doAction('phort.core.ready');
  }
  $('.PP_Wrapper').imagesLoaded(loaded);
};

loaded = function() {
  if (Hooks.applyFilters('phort.core.loaded', true)) {
    Hooks.doAction('phort.core.loaded');
  }
};

module.exports = {
  loaded: loaded,
  ready: ready
};


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],5:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var $, Hooks, defaults, get_settings, settings, single_item_data;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

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
  if (item.data.get('type') === 'video') {
    full = item.data.get('video_url');
  } else {
    full = item.data.url('full');
  }
  return {
    src: full,
    thumb: item.data.url('thumb'),
    subHtml: item.caption
  };
};

get_settings = function(gallery, index) {
  settings.index = index;
  settings.dynamicEl = gallery.map(single_item_data);
  settings.videoMaxWidth = window.innerWidth * 0.8;
  return Hooks.applyFilters('phort.lightGallery.settings', settings);
};

module.exports = function($el) {
  return {
    close: function() {
      var Gallery;
      Gallery = $el.data('lightGallery');
      if (Gallery && (Gallery.destroy != null)) {
        return Gallery.destroy();
      }
    },
    open: function(gallery_items, index) {
      var Gallery;
      return Gallery = $el.lightGallery(get_settings(gallery_items, index));
    }
  };
};


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],6:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var $, Hooks, PhotoSwipe, UI, create, defaults, labels, pswp, single_item_data, thumbnail_position;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

labels = $.extend({}, {
  'facebook': 'Share on Facebook',
  'twitter': 'Tweet',
  'pinterest': 'Pin it'
}, window.__phort.i18n.photoswipe);

defaults = {
  index: 0,
  preload: [1, 3],
  escKey: false,
  shareButtons: [
    {
      id: 'facebook',
      label: labels.facebook,
      url: 'https://www.facebook.com/sharer/sharer.php?u={{url}}'
    }, {
      id: 'twitter',
      label: labels.twitter,
      url: 'https://twitter.com/intent/tweet?text={{text}}&url={{url}}'
    }, {
      id: 'pinterest',
      label: labels.pinterest,
      url: 'http://www.pinterest.com/pin/create/button/?url={{url}}&media={{image_url}}&description={{text}}'
    }
  ]
};

pswp = document.querySelector('.pswp');

UI = Hooks.applyFilters("phort.photoswipe.UI", window.PhotoSwipeUI_Default);

PhotoSwipe = window.PhotoSwipe;

create = function(data, opts) {
  var instance, options;
  if (opts == null) {
    opts = {};
  }
  options = Hooks.applyFilters("phort.photoswipe.options", $.extend({}, defaults, opts));
  if (options.index == null) {
    options.index = 0;
  }
  if (!options.index || options.index < 0) {
    options.index = 0;
  }
  instance = new PhotoSwipe(pswp, UI, data, options);
  instance.init();
  return instance;
};

single_item_data = function(item) {
  var height, ref, width;
  if (item.data.get('type') !== 'image') {
    return;
  }
  ref = item.data.size('full'), width = ref[0], height = ref[1];
  return {
    src: item.data.url('full'),
    msrc: item.data.url('full'),
    w: width,
    h: height,
    title: item.caption
  };
};

thumbnail_position = function($gallery) {
  return function(index) {
    var $el, out, pageYScroll, rect, thumbnail;
    if (!$gallery.length) {
      return false;
    }
    $el = $gallery.eq(index);
    thumbnail = $el.find('img').get(0);
    if (!thumbnail) {
      return;
    }
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
  var Gallery;
  Gallery = false;
  return {
    close: function() {
      if (!Gallery) {
        return;
      }
      Gallery.close();
      return Gallery = false;
    },
    open: function(gallery, index) {
      var options;
      options = {
        getThumbBoundsFn: thumbnail_position($el.closest('.PP_Gallery').find('.PP_Gallery__item')),
        index: index
      };
      return Gallery = create(gallery.map(single_item_data), options);
    }
  };
};


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],7:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var $, Hooks, galery_item_data, parse_gallery_item;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

galery_item_data = require('./gallery_item_factory');

parse_gallery_item = function(key, el) {
  var $el;
  $el = $(el);
  return {
    index: key,
    data: galery_item_data($el),
    caption: $el.find('.PP_Gallery__caption').html() || ''
  };
};

module.exports = function(Gallery_Driver) {
  var instance, open;
  instance = false;
  open = function(el) {
    var $el, $items, gallery_items, index;
    $el = $(el);
    $items = $el.closest('.PP_Gallery').find('.PP_Gallery__item');
    if ($items.length > 0) {
      index = $items.index($el);
      gallery_items = $.makeArray($items.map(parse_gallery_item));
      instance = Gallery_Driver($el);
      return instance.open(gallery_items, index);
    }
  };
  return {
    open: open,
    handle_hash: function() {
      var el, index;
      index = parseInt(window.location.hash.split('&pid=')[1], 10);
      el = $('.PP_Gallery').first().find('.PP_Gallery__item').get(index);
      return open(el);
    },
    close: function() {
      if (!instance) {
        return false;
      }
      instance.close();
      return instance = false;
    }
  };
};


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./gallery_item_factory":9}],8:[function(require,module,exports){
var item_data;

item_data = function(data_obj) {
  var get, image, pluck;
  pluck = function(object, key) {
    if (object && object[key]) {
      return object[key];
    }
    return false;
  };
  get = function(key) {
    return pluck(data_obj, key);
  };
  image = function(size_name) {
    return pluck(get('images'), size_name);
  };
  return {
    size: function(size_name) {
      var height, image_size, ref, width;
      image_size = pluck(image(size_name), 'size');
      if (!image_size) {
        return false;
      }
      ref = image_size.split('x'), width = ref[0], height = ref[1];
      width = parseInt(width);
      height = parseInt(height);
      return [width, height];
    },
    url: function(size_name) {
      return pluck(image(size_name), 'url');
    },
    get: get
  };
};

module.exports = item_data;


},{}],9:[function(require,module,exports){
var item, item_data;

item = require('./gallery_item_data');

item_data = function($el) {
  var data_obj;
  data_obj = $el.data('item');
  if (!data_obj) {
    throw new Error("Element doesn't contain `data-item` attribute");
  }
  return item(data_obj);
};

module.exports = item_data;


},{"./gallery_item_data":8}],10:[function(require,module,exports){
(function (global){
var Hooks, gallery_driver, gallery_factory, setup_driver, setup_factory;

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

setup_driver = function(driver_name) {
  var adapter;
  if (driver_name == null) {
    driver_name = 'lightgallery';
  }
  if (driver_name === 'lightgallery') {
    adapter = require('./adapters/lightgallery');
  }
  if (driver_name === 'photoswipe') {
    adapter = require('./adapters/photoswipe');
  }
  return Hooks.applyFilters('phort.gallery.driver', adapter);
};

setup_factory = function() {
  var factory;
  factory = require('./gallery_factory');
  return Hooks.applyFilters('phort.gallery.factory', factory);
};

gallery_driver = setup_driver(window.__phort.popup_gallery);

gallery_factory = setup_factory();

module.exports = gallery_factory(gallery_driver);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./adapters/lightgallery":5,"./adapters/photoswipe":6,"./gallery_factory":7}],11:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var $, Gallery, Hooks;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Gallery = require('./prepare_gallery_factory');

Hooks.addAction('phort.core.ready', function() {
  var handle_clicks, handle_esc_key, handle_hash;
  handle_clicks = Hooks.applyFilters('phort.gallery.handle_clicks', true);
  handle_hash = Hooks.applyFilters('phort.gallery.handle_hash', true);
  handle_esc_key = Hooks.applyFilters('phort.gallery.custom_esc', true);
  if (handle_hash && window.location.hash && Gallery.handle_hash) {
    Hooks.addAction('phort.core.loaded', Gallery.handle_hash);
  }
  if (handle_clicks) {
    $(document).on('click', '.PP_Gallery__item', function(e) {
      e.preventDefault();
      return Gallery.open(this);
    });
  }
  if (handle_esc_key) {
    return $(window).on('keydown', function(e) {
      if (e.key !== 'Escape') {
        return;
      }
      e.preventDefault();
      return Gallery.close();
    });
  }
});

module.exports = Gallery;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./prepare_gallery_factory":10}],12:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var $, Abstract_Lazy_Loader, Hooks, __WINDOW, gallery_item, throttle,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

gallery_item = require('../gallery/gallery_item_factory');

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
    thumb = item.data.url('thumb');
    full = item.data.url('full');
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
      data: gallery_item($el),
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

},{"../core/Utilities":2,"../core/Window":3,"../gallery/gallery_item_factory":9}],13:[function(require,module,exports){
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
      'min-height': Math.floor(this.placeholder_width / item.data.get('ratio'))
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

},{"../core/Window":3,"./Abstract_Lazy_Loader":12}],14:[function(require,module,exports){
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

module.exports = {
  create: create,
  destroy: destroy
};


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],15:[function(require,module,exports){
(function (global){
var Hooks;

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);


/*

     * Initialize Portfolio Core
	---
		Using p50 @ `phort.core.ready`
		Late priority is going to force explicit priority in any other moving parts that are going to touch portfolio layout at `phort.loaded`
	---
 */

module.exports = {
  prepare: function() {
    Hooks.doAction('phort.portfolio.prepare');
  },
  create: function() {
    Hooks.doAction('phort.portfolio.create');
  },
  refresh: function() {
    Hooks.doAction('phort.portfolio.refresh');
  },
  destroy: function() {
    Hooks.doAction('phort.portfolio.destroy');
  }
};


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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

},{"./Portfolio_Interface":16}],18:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var $, Hooks, Trigger, is_masonry, maybe_lazy_masonry, start_masonry;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Trigger = require('./Portfolio_Events');

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

Hooks.addAction('phort.core.ready', Trigger.prepare, 50);

Hooks.addAction('phort.core.loaded', Trigger.create, 50);

Hooks.addAction('phort.core.ready', start_masonry);

Hooks.addFilter('phort.lazy.handler', maybe_lazy_masonry);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./Portfolio_Events":15,"./Portfolio_Masonry":17,"lazy/Lazy_Masonry":13}]},{},[1])


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jb3JlL1V0aWxpdGllcy5qcyIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jb3JlL1dpbmRvdy5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY29yZS9zdGFydC5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvZ2FsbGVyeS9hZGFwdGVycy9saWdodGdhbGxlcnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvYWRhcHRlcnMvcGhvdG9zd2lwZS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvZ2FsbGVyeS9nYWxsZXJ5X2ZhY3RvcnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvZ2FsbGVyeV9pdGVtX2RhdGEuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvZ2FsbGVyeV9pdGVtX2ZhY3RvcnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvcHJlcGFyZV9nYWxsZXJ5X2ZhY3RvcnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvc3RhcnQuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvQWJzdHJhY3RfTGF6eV9Mb2FkZXIuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvTGF6eV9NYXNvbnJ5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L3N0YXJ0LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9wb3J0Zm9saW8vUG9ydGZvbGlvX0V2ZW50cy5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL1BvcnRmb2xpb19JbnRlcmZhY2UuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL3BvcnRmb2xpby9Qb3J0Zm9saW9fTWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL3N0YXJ0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7OztBQUFBLElBQUE7O0FBR0EsS0FBQSxHQUFRLE9BQUEsQ0FBUyxVQUFUOztBQUNSLENBQUEsR0FBSSxPQUFBLENBQVMsUUFBVDs7QUFHSixNQUFNLENBQUMsVUFBUCxHQUVDO0VBQUEsbUJBQUEsRUFBcUIsT0FBQSxDQUFTLGlDQUFULENBQXJCO0VBR0EsT0FBQSxFQUNDO0lBQUEsU0FBQSxFQUFjLE9BQUEsQ0FBUyw2QkFBVCxDQUFkO0lBQ0EsWUFBQSxFQUFjLE9BQUEsQ0FBUyxnQ0FBVCxDQURkO0dBSkQ7RUFRQSxvQkFBQSxFQUFzQixPQUFBLENBQVMsNkJBQVQsQ0FSdEI7OztBQVdELE1BQU0sQ0FBQyxxQkFBUCxHQUNDO0VBQUEsSUFBQSxFQUFrQixPQUFBLENBQVMsY0FBVCxDQUFsQjtFQUNBLGdCQUFBLEVBQWtCLE9BQUEsQ0FBUyxtQkFBVCxDQURsQjtFQUVBLE9BQUEsRUFBa0IsT0FBQSxDQUFTLGlCQUFULENBRmxCO0VBR0EsV0FBQSxFQUFrQixPQUFBLENBQVMsY0FBVCxDQUhsQjs7OztBQUtEOzs7O0FBR0EsQ0FBQSxDQUFHLFFBQUgsQ0FBYSxDQUFDLEtBQWQsQ0FBb0IsU0FBQTtFQUduQixJQUFVLENBQUksQ0FBQSxDQUFHLE1BQUgsQ0FBVyxDQUFDLFFBQVosQ0FBc0IsY0FBdEIsQ0FBZDtBQUFBLFdBQUE7O0VBR0EscUJBQXFCLENBQUMsSUFBSSxDQUFDLEtBQTNCLENBQUE7QUFObUIsQ0FBcEI7Ozs7OztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QSxDQUFBLEdBQUksT0FBQSxDQUFTLFFBQVQ7O0FBQ0osS0FBQSxHQUFRLE9BQUEsQ0FBUyxVQUFUOztBQUdSLE9BQUEsR0FBVSxPQUFBLENBQVMsb0JBQVQ7O0FBRVYsVUFBQSxHQUFhLFNBQUE7QUFDWixTQUFTLENBQUEsQ0FBRyxhQUFILENBQWtCLENBQUMsTUFBbkIsS0FBK0I7QUFENUI7O0FBSWIsYUFBQSxHQUFnQixTQUFBO0FBQ2YsTUFBQTtFQUFBLElBQWdCLENBQUksVUFBQSxDQUFBLENBQXBCO0FBQUEsV0FBTyxNQUFQOztFQUVBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUyxxQkFBVDtTQUNwQixJQUFJLGlCQUFKLENBQUE7QUFKZTs7QUFNaEIsa0JBQUEsR0FBcUIsU0FBRSxPQUFGO0VBRXBCLElBQXlDLFVBQUEsQ0FBQSxDQUF6QztBQUFBLFdBQU8sT0FBQSxDQUFTLG1CQUFULEVBQVA7O0FBQ0EsU0FBTztBQUhhOztBQU9yQixLQUFLLENBQUMsU0FBTixDQUFnQixrQkFBaEIsRUFBb0MsT0FBTyxDQUFDLE9BQTVDLEVBQXFELEVBQXJEOztBQUNBLEtBQUssQ0FBQyxTQUFOLENBQWdCLG1CQUFoQixFQUFxQyxPQUFPLENBQUMsTUFBN0MsRUFBcUQsRUFBckQ7O0FBR0EsS0FBSyxDQUFDLFNBQU4sQ0FBZ0Isa0JBQWhCLEVBQW9DLGFBQXBDOztBQUdBLEtBQUssQ0FBQyxTQUFOLENBQWdCLG9CQUFoQixFQUFzQyxrQkFBdEMiLCJmaWxlIjoicGhvdG9ncmFwaHktcG9ydGZvbGlvLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIjIyNcbiAgICBMb2FkIERlcGVuZGVuY2llc1xuIyMjXG5Ib29rcyA9IHJlcXVpcmUoICd3cF9ob29rcycgKVxuJCA9IHJlcXVpcmUoICdqUXVlcnknIClcblxuIyBFeHBvc2Ugc29tZSBQaG90b2dyYXBoeSBQb3J0Zm9saW8gbW9kdWxlcyB0byB0aGUgcHVibGljIGZvciBleHRlbnNpYmlsaXR5XG53aW5kb3cuUFBfTW9kdWxlcyA9XG5cdCMgRXh0ZW5kIFBvcnRmb2xpbyBJbnRlcmZhY2UgdG8gYnVpbGQgY3VzdG9tIHBvcnRmb2xpbyBsYXlvdXRzIGJhc2VkIG9uIFBQIEV2ZW50c1xuXHRQb3J0Zm9saW9fSW50ZXJmYWNlOiByZXF1aXJlKCAnLi9wb3J0Zm9saW8vUG9ydGZvbGlvX0ludGVyZmFjZScgKVxuXG4jIFVzZSBgZ2FsbGVyeV9pdGVtX2RhdGFgIHRvIGdldCBmb3JtYXR0ZWQgaXRlbSBpbWFnZSBzaXplcyBmb3IgbGF6eSBsb2FkaW5nXG5cdGdhbGxlcnk6XG5cdFx0aXRlbV9kYXRhICAgOiByZXF1aXJlKCAnLi9nYWxsZXJ5L2dhbGxlcnlfaXRlbV9kYXRhJyApXG5cdFx0aXRlbV9mYWN0b3J5OiByZXF1aXJlKCAnLi9nYWxsZXJ5L2dhbGxlcnlfaXRlbV9mYWN0b3J5JyApXG5cbiMgRXh0ZW5kIEFic3RyYWN0X0xhenlfTG9kZXIgdG8gaW1wbGVtZW50IGxhenkgbG9hZGVyIGZvciB5b3VyIGxheW91dFxuXHRBYnN0cmFjdF9MYXp5X0xvYWRlcjogcmVxdWlyZSggJy4vbGF6eS9BYnN0cmFjdF9MYXp5X0xvYWRlcicgKVxuXG5cbndpbmRvdy5QaG90b2dyYXBoeV9Qb3J0Zm9saW8gPVxuXHRDb3JlICAgICAgICAgICAgOiByZXF1aXJlKCAnLi9jb3JlL3N0YXJ0JyApXG5cdFBvcnRmb2xpb19MYXlvdXQ6IHJlcXVpcmUoICcuL3BvcnRmb2xpby9zdGFydCcgKVxuXHRHYWxsZXJ5ICAgICAgICAgOiByZXF1aXJlKCAnLi9nYWxsZXJ5L3N0YXJ0JyApXG5cdExhenlfTG9hZGVyICAgICA6IHJlcXVpcmUoICcuL2xhenkvc3RhcnQnIClcblxuIyMjXG5cdEJvb3Qgb24gYGRvY3VtZW50LnJlYWR5YFxuIyMjXG4kKCBkb2N1bWVudCApLnJlYWR5IC0+XG5cblx0IyBPbmx5IHJ1biB0aGlzIHNjcmlwdCB3aGVuIGJvZHkgaGFzIGBQUF9Qb3J0Zm9saW9gIGNsYXNzXG5cdHJldHVybiBpZiBub3QgJCggJ2JvZHknICkuaGFzQ2xhc3MoICdQUF9Qb3J0Zm9saW8nIClcblxuXHQjIEJvb3Rcblx0UGhvdG9ncmFwaHlfUG9ydGZvbGlvLkNvcmUucmVhZHkoIClcblx0cmV0dXJuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcblxuXG4gICAgLyoqXG4gICAgICogVGhhbmsgeW91IFJ1c3MgZm9yIGhlbHBpbmcgbWUgYXZvaWQgd3JpdGluZyB0aGlzIG15c2VsZjpcbiAgICAgKiBAdXJsIGh0dHBzOi8vcmVteXNoYXJwLmNvbS8yMDEwLzA3LzIxL3Rocm90dGxpbmctZnVuY3Rpb24tY2FsbHMvI2NvbW1lbnQtMjc0NTY2MzU5NFxuICAgICAqL1xuICAgIHRocm90dGxlOiBmdW5jdGlvbiAoIGZuLCB0aHJlc2hob2xkLCBzY29wZSApIHtcbiAgICAgICAgdGhyZXNoaG9sZCB8fCAodGhyZXNoaG9sZCA9IDI1MClcbiAgICAgICAgdmFyIGxhc3QsXG4gICAgICAgICAgICBkZWZlclRpbWVyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgY29udGV4dCA9IHNjb3BlIHx8IHRoaXNcblxuICAgICAgICAgICAgdmFyIG5vdyAgPSArbmV3IERhdGUsXG4gICAgICAgICAgICAgICAgYXJncyA9IGFyZ3VtZW50c1xuICAgICAgICAgICAgaWYgKCBsYXN0ICYmIG5vdyA8IGxhc3QgKyB0aHJlc2hob2xkICkge1xuICAgICAgICAgICAgICAgIC8vIGhvbGQgb24gdG8gaXRcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoIGRlZmVyVGltZXIgKVxuICAgICAgICAgICAgICAgIGRlZmVyVGltZXIgPSBzZXRUaW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3QgPSBub3dcbiAgICAgICAgICAgICAgICAgICAgZm4uYXBwbHkoIGNvbnRleHQsIGFyZ3MgKVxuICAgICAgICAgICAgICAgIH0sIHRocmVzaGhvbGQgKyBsYXN0IC0gbm93IClcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGFzdCA9IG5vd1xuICAgICAgICAgICAgICAgIGZuLmFwcGx5KCBjb250ZXh0LCBhcmdzIClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuXG59IiwiSG9va3MgPSByZXF1aXJlKCAnd3BfaG9va3MnIClcblxuXG5nZXRfc2l6ZSA9IC0+XG5cdHdpZHRoIDogd2luZG93LmlubmVyV2lkdGggfHwgJHdpbmRvdy53aWR0aCgpXG5cdGhlaWdodDogd2luZG93LmlubmVySGVpZ2h0IHx8ICR3aW5kb3cuaGVpZ2h0KClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldF9zaXplKCkiLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuJCA9IHJlcXVpcmUoICdqUXVlcnknIClcbkhvb2tzID0gcmVxdWlyZSggJ3dwX2hvb2tzJyApXG5cbnJlYWR5ID0gLT5cblx0aWYgSG9va3MuYXBwbHlGaWx0ZXJzKCAncGhvcnQuY29yZS5yZWFkeScsIHRydWUgKVxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5jb3JlLnJlYWR5J1xuXG5cdCMgQXV0b21hdGljYWxseSB0cmlnZ2VyIGBwaG9ydC5jb3JlLmxvYWRlZGAgd2hlbiBpbWFnZXMgYXJlIGxvYWRlZFxuXHQkKCAnLlBQX1dyYXBwZXInICkuaW1hZ2VzTG9hZGVkKCBsb2FkZWQgKVxuXHRyZXR1cm5cblxubG9hZGVkID0gLT5cblx0aWYgSG9va3MuYXBwbHlGaWx0ZXJzKCAncGhvcnQuY29yZS5sb2FkZWQnLCB0cnVlIClcblx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQuY29yZS5sb2FkZWQnXG5cdHJldHVyblxuXG5tb2R1bGUuZXhwb3J0cyA9XG5cdGxvYWRlZDogbG9hZGVkXG5cdHJlYWR5IDogcmVhZHkiLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuJCA9IHJlcXVpcmUoIFwialF1ZXJ5XCIgKVxuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuXG5kZWZhdWx0cyA9XG5cdGR5bmFtaWMgOiB0cnVlXG5cdHNwZWVkICAgOiAzNTBcblx0cHJlbG9hZCA6IDNcblx0ZG93bmxvYWQ6IGZhbHNlXG5cdGVzY0tleSAgOiBmYWxzZSAjIFdlJ3JlIHJvbGxpbmcgb3VyIG93blxuXG5cdHRodW1ibmFpbCAgICAgICAgIDogdHJ1ZVxuXHRzaG93VGh1bWJCeURlZmF1bHQ6IHRydWVcblxuIyBAVE9ETzogVXNlIE9iamVjdC5hc3NpZ24oKSB3aXRoIEJhYmVsXG5zZXR0aW5ncyA9ICQuZXh0ZW5kKCB7fSwgZGVmYXVsdHMsIHdpbmRvdy5fX3Bob3J0LmxpZ2h0R2FsbGVyeSApXG5cblxuc2luZ2xlX2l0ZW1fZGF0YSA9ICggaXRlbSApIC0+XG5cblx0aWYgaXRlbS5kYXRhLmdldCggJ3R5cGUnICkgaXMgJ3ZpZGVvJ1xuXHRcdGZ1bGwgPSBpdGVtLmRhdGEuZ2V0KCAndmlkZW9fdXJsJyApXG5cdGVsc2Vcblx0XHRmdWxsID0gaXRlbS5kYXRhLnVybCggJ2Z1bGwnIClcblxuXHRyZXR1cm4ge1xuXHRcdHNyYyAgICA6IGZ1bGxcblx0XHR0aHVtYiAgOiBpdGVtLmRhdGEudXJsKCAndGh1bWInIClcblx0XHRzdWJIdG1sOiBpdGVtLmNhcHRpb25cblx0fVxuXG5cbmdldF9zZXR0aW5ncyA9ICggZ2FsbGVyeSwgaW5kZXggKSAtPlxuXHRzZXR0aW5ncy5pbmRleCAgICAgICAgID0gaW5kZXhcblx0c2V0dGluZ3MuZHluYW1pY0VsICAgICA9IGdhbGxlcnkubWFwKCBzaW5nbGVfaXRlbV9kYXRhIClcblx0c2V0dGluZ3MudmlkZW9NYXhXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoICogMC44XG5cblx0SG9va3MuYXBwbHlGaWx0ZXJzICdwaG9ydC5saWdodEdhbGxlcnkuc2V0dGluZ3MnLCBzZXR0aW5nc1xuXG5cbm1vZHVsZS5leHBvcnRzID0gKCAkZWwgKSAtPlxuXHRjbG9zZTogLT5cblx0XHRHYWxsZXJ5ID0gJGVsLmRhdGEoICdsaWdodEdhbGxlcnknIClcblx0XHRHYWxsZXJ5LmRlc3Ryb3koICkgaWYgR2FsbGVyeSBhbmQgR2FsbGVyeS5kZXN0cm95P1xuXG5cdG9wZW46ICggZ2FsbGVyeV9pdGVtcywgaW5kZXggKSAtPlxuXHRcdEdhbGxlcnkgPSAkZWwubGlnaHRHYWxsZXJ5KCBnZXRfc2V0dGluZ3MoIGdhbGxlcnlfaXRlbXMsIGluZGV4ICkgKVxuXG5cblxuXG4iLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuJCA9IHJlcXVpcmUoIFwialF1ZXJ5XCIgKVxuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuXG5sYWJlbHMgPSAkLmV4dGVuZCgge30sIHtcblx0J2ZhY2Vib29rJzogJ1NoYXJlIG9uIEZhY2Vib29rJyxcblx0J3R3aXR0ZXInOiAnVHdlZXQnLFxuXHQncGludGVyZXN0JzogJ1BpbiBpdCcsXG59LCB3aW5kb3cuX19waG9ydC5pMThuLnBob3Rvc3dpcGUgKVxuXG5cbmRlZmF1bHRzID1cblx0aW5kZXggICAgICAgOiAwXG5cdHByZWxvYWQgICAgIDogWyAxLCAzIF1cblx0ZXNjS2V5ICAgICAgOiBmYWxzZVxuXHRzaGFyZUJ1dHRvbnM6IFtcblx0XHR7IGlkOiAnZmFjZWJvb2snLCBsYWJlbDogbGFiZWxzLmZhY2Vib29rLCB1cmw6ICdodHRwczovL3d3dy5mYWNlYm9vay5jb20vc2hhcmVyL3NoYXJlci5waHA/dT17e3VybH19JyB9XG5cdFx0eyBpZDogJ3R3aXR0ZXInLCBsYWJlbCA6IGxhYmVscy50d2l0dGVyLCB1cmw6ICdodHRwczovL3R3aXR0ZXIuY29tL2ludGVudC90d2VldD90ZXh0PXt7dGV4dH19JnVybD17e3VybH19JyB9XG5cdFx0eyBpZDogJ3BpbnRlcmVzdCcsIGxhYmVsOiBsYWJlbHMucGludGVyZXN0LCB1cmw6ICdodHRwOi8vd3d3LnBpbnRlcmVzdC5jb20vcGluL2NyZWF0ZS9idXR0b24vP3VybD17e3VybH19Jm1lZGlhPXt7aW1hZ2VfdXJsfX0mZGVzY3JpcHRpb249e3t0ZXh0fX0nIH1cblx0XVxuXG5cbnBzd3AgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCAnLnBzd3AnIClcblVJID0gSG9va3MuYXBwbHlGaWx0ZXJzKCBcInBob3J0LnBob3Rvc3dpcGUuVUlcIiwgd2luZG93LlBob3RvU3dpcGVVSV9EZWZhdWx0IClcblBob3RvU3dpcGUgPSB3aW5kb3cuUGhvdG9Td2lwZVxuXG5cbmNyZWF0ZSA9ICggZGF0YSwgb3B0cyA9IHt9ICkgLT5cblx0b3B0aW9ucyA9IEhvb2tzLmFwcGx5RmlsdGVycyggXCJwaG9ydC5waG90b3N3aXBlLm9wdGlvbnNcIiwgJC5leHRlbmQoIHt9LCBkZWZhdWx0cywgb3B0cyApIClcblxuXHQjIEluZGV4IGlzIDAgYnkgZGVmYXVsdFxuXHRpZiBub3Qgb3B0aW9ucy5pbmRleD9cblx0XHRvcHRpb25zLmluZGV4ID0gMFxuXG5cdCMgU2V0IHRoZSBpbmRleCB0byAwIGlmIGl0IGlzbid0IGEgcHJvcGVyIHZhbHVlXG5cdGlmIG5vdCBvcHRpb25zLmluZGV4IG9yIG9wdGlvbnMuaW5kZXggPCAwXG5cdFx0b3B0aW9ucy5pbmRleCA9IDBcblxuXHRpbnN0YW5jZSA9IG5ldyBQaG90b1N3aXBlKCBwc3dwLCBVSSwgZGF0YSwgb3B0aW9ucyApXG5cdGluc3RhbmNlLmluaXQoIClcblxuXHRyZXR1cm4gaW5zdGFuY2VcblxuXG5zaW5nbGVfaXRlbV9kYXRhID0gKCBpdGVtICkgLT5cblx0IyBQaG90b1N3aXBlIHN1cHBvcnRzIG9ubHkgaW1hZ2VzXG5cdHJldHVybiBpZiBpdGVtLmRhdGEuZ2V0KCAndHlwZScgKSBpc250ICdpbWFnZSdcblxuXG5cdFt3aWR0aCwgaGVpZ2h0XSA9IGl0ZW0uZGF0YS5zaXplKCAnZnVsbCcgKVxuXG5cdCMgcmV0dXJuXG5cdHNyYyAgOiBpdGVtLmRhdGEudXJsKCAnZnVsbCcgKVxuXHRtc3JjIDogaXRlbS5kYXRhLnVybCggJ2Z1bGwnIClcblx0dyAgICA6IHdpZHRoXG5cdGggICAgOiBoZWlnaHRcblx0dGl0bGU6IGl0ZW0uY2FwdGlvblxuXG5cbnRodW1ibmFpbF9wb3NpdGlvbiA9ICggJGdhbGxlcnkgKSAtPiByZXR1cm4gKCBpbmRleCApIC0+XG5cdHJldHVybiBmYWxzZSBpZiBub3QgJGdhbGxlcnkubGVuZ3RoXG5cblx0JGVsID0gJGdhbGxlcnkuZXEoIGluZGV4IClcblx0dGh1bWJuYWlsID0gJGVsLmZpbmQoICdpbWcnICkuZ2V0KCAwIClcblxuXHQjIFRodW1ibmFpbCBtdXN0IGV4aXN0IGJlZm9yZSBkaW1lbnNpb25zIGNhbiBiZSBvYnRhaW5lZFxuXHRyZXR1cm4gaWYgbm90IHRodW1ibmFpbFxuXG5cdHBhZ2VZU2Nyb2xsID0gd2luZG93LnBhZ2VZT2Zmc2V0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3Bcblx0cmVjdCA9IHRodW1ibmFpbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoIClcblxuXHQjIC8vIHcgPSB3aWR0aFxuXHRvdXQgPVxuXHRcdHg6IHJlY3QubGVmdFxuXHRcdHk6IHJlY3QudG9wICsgcGFnZVlTY3JvbGxcblx0XHR3OiByZWN0LndpZHRoXG5cblx0cmV0dXJuIG91dFxuXG5cbm1vZHVsZS5leHBvcnRzID0gKCAkZWwgKSAtPlxuXHRHYWxsZXJ5ID0gZmFsc2VcblxuXHRjbG9zZTogLT5cblx0XHRyZXR1cm4gaWYgbm90IEdhbGxlcnlcblx0XHRHYWxsZXJ5LmNsb3NlKCApXG5cdFx0R2FsbGVyeSA9IGZhbHNlXG5cblx0b3BlbjogKCBnYWxsZXJ5LCBpbmRleCApIC0+XG5cdFx0b3B0aW9ucyA9XG5cdFx0XHRnZXRUaHVtYkJvdW5kc0ZuOiB0aHVtYm5haWxfcG9zaXRpb24oICRlbC5jbG9zZXN0KCAnLlBQX0dhbGxlcnknICkuZmluZCggJy5QUF9HYWxsZXJ5X19pdGVtJyApIClcblx0XHRcdGluZGV4ICAgICAgICAgICA6IGluZGV4XG5cblx0XHRHYWxsZXJ5ID0gY3JlYXRlKCBnYWxsZXJ5Lm1hcCggc2luZ2xlX2l0ZW1fZGF0YSApLCBvcHRpb25zIClcblxuXG5cbiIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuSG9va3MgPSByZXF1aXJlKCAnd3BfaG9va3MnIClcbmdhbGVyeV9pdGVtX2RhdGEgPSByZXF1aXJlKCAnLi9nYWxsZXJ5X2l0ZW1fZmFjdG9yeScgKVxuXG5cblxucGFyc2VfZ2FsbGVyeV9pdGVtID0gKCBrZXksIGVsICkgLT5cblx0JGVsID0gJCggZWwgKVxuXG5cdGluZGV4ICA6IGtleVxuXHRkYXRhICAgOiBnYWxlcnlfaXRlbV9kYXRhKCAkZWwgKVxuXHRjYXB0aW9uOiAkZWwuZmluZCggJy5QUF9HYWxsZXJ5X19jYXB0aW9uJyApLmh0bWwoICkgfHwgJydcblxuXG5tb2R1bGUuZXhwb3J0cyA9ICggR2FsbGVyeV9Ecml2ZXIgKSAtPlxuXHRpbnN0YW5jZSA9IGZhbHNlXG5cblx0b3BlbiA9IChlbCkgLT5cblx0XHQkZWwgPSAkKCBlbCApXG5cdFx0JGl0ZW1zID0gJGVsLmNsb3Nlc3QoICcuUFBfR2FsbGVyeScgKS5maW5kKCAnLlBQX0dhbGxlcnlfX2l0ZW0nIClcblxuXHRcdGlmICRpdGVtcy5sZW5ndGggPiAwXG5cdFx0XHRpbmRleCA9ICRpdGVtcy5pbmRleCggJGVsIClcblx0XHRcdGdhbGxlcnlfaXRlbXMgPSAkLm1ha2VBcnJheSggJGl0ZW1zLm1hcCggcGFyc2VfZ2FsbGVyeV9pdGVtICkgKVxuXG5cdFx0XHRpbnN0YW5jZSA9IEdhbGxlcnlfRHJpdmVyKCAkZWwgKVxuXHRcdFx0aW5zdGFuY2Uub3BlbiggZ2FsbGVyeV9pdGVtcywgaW5kZXggKVxuXG5cblx0b3Blbjogb3BlblxuXG5cdGhhbmRsZV9oYXNoOiAtPlxuXHRcdGluZGV4ID0gcGFyc2VJbnQoIHdpbmRvdy5sb2NhdGlvbi5oYXNoLnNwbGl0KCAnJnBpZD0nIClbIDEgXSwgMTAgKVxuXHRcdGVsID0gJCggJy5QUF9HYWxsZXJ5JyApLmZpcnN0KCApLmZpbmQoICcuUFBfR2FsbGVyeV9faXRlbScgKS5nZXQoIGluZGV4IClcblx0XHRvcGVuKCBlbCApXG5cblx0Y2xvc2U6IC0+XG5cdFx0cmV0dXJuIGZhbHNlIGlmIG5vdCBpbnN0YW5jZVxuXG5cdFx0aW5zdGFuY2UuY2xvc2UoIClcblx0XHRpbnN0YW5jZSA9IGZhbHNlIiwiaXRlbV9kYXRhID0gKCBkYXRhX29iaiApIC0+XG5cblx0cGx1Y2sgPSAoIG9iamVjdCwga2V5ICkgLT5cblx0XHRpZiBvYmplY3QgYW5kIG9iamVjdFsga2V5IF1cblx0XHRcdHJldHVybiBvYmplY3RbIGtleSBdXG5cdFx0cmV0dXJuIGZhbHNlXG5cblx0Z2V0ID0gKCBrZXkgKSAtPiBwbHVjayggZGF0YV9vYmosIGtleSApXG5cblx0aW1hZ2UgPSAoIHNpemVfbmFtZSApIC0+IHBsdWNrKCBnZXQoICdpbWFnZXMnICksIHNpemVfbmFtZSApXG5cblxuXHRzaXplOiAoIHNpemVfbmFtZSApIC0+XG5cdFx0aW1hZ2Vfc2l6ZSA9IHBsdWNrKCBpbWFnZSggc2l6ZV9uYW1lICksICdzaXplJyApXG5cdFx0cmV0dXJuIGZhbHNlIGlmIG5vdCBpbWFnZV9zaXplXG5cblx0XHRbd2lkdGgsIGhlaWdodF0gPSBpbWFnZV9zaXplLnNwbGl0KCAneCcgKVxuXG5cdFx0d2lkdGggPSBwYXJzZUludCggd2lkdGggKVxuXHRcdGhlaWdodCA9IHBhcnNlSW50KCBoZWlnaHQgKVxuXG5cdFx0cmV0dXJuIFsgd2lkdGgsIGhlaWdodCBdXG5cblx0dXJsOiAoIHNpemVfbmFtZSApIC0+IHBsdWNrKCBpbWFnZSggc2l6ZV9uYW1lICksICd1cmwnIClcblx0Z2V0OiBnZXRcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGl0ZW1fZGF0YSIsIml0ZW0gPSByZXF1aXJlKCcuL2dhbGxlcnlfaXRlbV9kYXRhJylcblxuaXRlbV9kYXRhID0gKCAkZWwgKSAtPlxuXHRkYXRhX29iaiA9ICRlbC5kYXRhKCAnaXRlbScgKVxuXG5cdGlmIG5vdCBkYXRhX29ialxuXHRcdHRocm93IG5ldyBFcnJvciBcIkVsZW1lbnQgZG9lc24ndCBjb250YWluIGBkYXRhLWl0ZW1gIGF0dHJpYnV0ZVwiXG5cblx0cmV0dXJuIGl0ZW0oIGRhdGFfb2JqIClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGl0ZW1fZGF0YSIsIkhvb2tzID0gcmVxdWlyZShcIndwX2hvb2tzXCIpXG5cbiNcbiMgVGhpcyBmaWxlIGlzIGdvaW5nIHRvIHJldHVybiBhIFtHYWxsZXJ5IEZhY3RvcnldIGluc3RhbmNlXG4jIEVhc3kgUGhvdG9ncmFwaHkgUG9ydGZvbGlvIGlzIHVzaW5nIHRoYXQgdG8gb3Blbi9jbG9zZS9kZXN0cm95IGdhbGxlcmllc1xuI1xuIyBbR2FsbGVyeSBGYWN0b3J5XSByZWxpZXMgb24gYSBbQWRhcHRlcl1cbiMgSW5zdGVhZCBvZiByZWx5aW5nIGRpcmVjdGx5IG9uIGEgZGVwZW5kZW5jeSwgR2FsbGVyeSBGYWN0b3J5IHJlbGllcyBvbiBhIEFkYXB0ZXIgdGhhdCBjYW4gYmUgbW9kaWZpZWRcbiMgQSBBZGFwdGVyIGlzIGFuIGFkYXB0ZXIgZm9yIGEgUG9wdXAtR2FsbGVyeSBwbHVnaW4sIHN1Y2ggYXMgTGlnaHRHYWxsZXJ5IG9yIFBob3RvU3dpcGVcbiNcbiMgU28gd2hlbiBhIGdhbGxlcnkgaXMgb3BlbmVkLCB0aGlzIGlzIHByb2JhYmx5IGhvdyBpdCdzIGdvaW5nIHRvIGxvb2s6XG4jIFtHYWxsZXJ5IEZhY3RvcnldIGFza3MgW0FkYXB0ZXJdIHRvIGZpbmQgYW5kIG9wZW4gYSBnYWxsZXJ5IHdpdGggW2FueSBMaWdodEJveCBMaWJyYXJ5XVxuI1xuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgR2FsbGVyeSBBZGFwdGVyOlxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5zZXR1cF9kcml2ZXIgPSAoIGRyaXZlcl9uYW1lID0gJ2xpZ2h0Z2FsbGVyeScgKSAtPlxuXHRpZiBkcml2ZXJfbmFtZSBpcyAnbGlnaHRnYWxsZXJ5J1xuXHRcdGFkYXB0ZXIgPSByZXF1aXJlKCAnLi9hZGFwdGVycy9saWdodGdhbGxlcnknIClcblxuXHRpZiBkcml2ZXJfbmFtZSBpcyAncGhvdG9zd2lwZSdcblx0XHRhZGFwdGVyID0gcmVxdWlyZSggJy4vYWRhcHRlcnMvcGhvdG9zd2lwZScgKVxuXG5cdHJldHVybiBIb29rcy5hcHBseUZpbHRlcnMoICdwaG9ydC5nYWxsZXJ5LmRyaXZlcicsIGFkYXB0ZXIgKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgR2FsbGVyeSBGYWN0b3J5OlxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIFRoZSBnYWxsZXJ5IGZhY3RvcnkgaXMgd2hhdCB3ZSdyZSBpbnRlcmFjdGluZyB3aXRoIHRvIG9wZW4vY2xvc2UgYSBnYWxsZXJ5XG5zZXR1cF9mYWN0b3J5ID0gLT5cblx0ZmFjdG9yeSA9IHJlcXVpcmUoICcuL2dhbGxlcnlfZmFjdG9yeScgKVxuXHRyZXR1cm4gSG9va3MuYXBwbHlGaWx0ZXJzKCAncGhvcnQuZ2FsbGVyeS5mYWN0b3J5JywgZmFjdG9yeSApXG5cbiNcbiMgUmV0dXJuIGEgZmFjdG9yeSBpbnN0YW5jZVxuI1xuXG5nYWxsZXJ5X2RyaXZlciA9IHNldHVwX2RyaXZlciggd2luZG93Ll9fcGhvcnQucG9wdXBfZ2FsbGVyeSApXG5nYWxsZXJ5X2ZhY3RvcnkgPSBzZXR1cF9mYWN0b3J5KCApXG5cbm1vZHVsZS5leHBvcnRzID0gZ2FsbGVyeV9mYWN0b3J5KCBnYWxsZXJ5X2RyaXZlciApIiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoICd3cF9ob29rcycgKVxuR2FsbGVyeSA9IHJlcXVpcmUoICcuL3ByZXBhcmVfZ2FsbGVyeV9mYWN0b3J5JyApXG5cbkhvb2tzLmFkZEFjdGlvbiAncGhvcnQuY29yZS5yZWFkeScsIC0+XG5cblx0aGFuZGxlX2NsaWNrcyA9IEhvb2tzLmFwcGx5RmlsdGVycyggJ3Bob3J0LmdhbGxlcnkuaGFuZGxlX2NsaWNrcycsIHRydWUgKVxuXHRoYW5kbGVfaGFzaCA9IEhvb2tzLmFwcGx5RmlsdGVycyggJ3Bob3J0LmdhbGxlcnkuaGFuZGxlX2hhc2gnLCB0cnVlIClcblx0aGFuZGxlX2VzY19rZXkgPSBIb29rcy5hcHBseUZpbHRlcnMoICdwaG9ydC5nYWxsZXJ5LmN1c3RvbV9lc2MnLCB0cnVlIClcblxuXHQjIEhhbmRsZSBIYXNoY2hhbmdlXG5cdGlmIGhhbmRsZV9oYXNoIGFuZCB3aW5kb3cubG9jYXRpb24uaGFzaCBhbmQgR2FsbGVyeS5oYW5kbGVfaGFzaFxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQuY29yZS5sb2FkZWQnLCBHYWxsZXJ5LmhhbmRsZV9oYXNoXG5cblx0IyBIYW5kbGUgQ2xpY2tzXG5cdGlmIGhhbmRsZV9jbGlja3Ncblx0XHQkKCBkb2N1bWVudCApLm9uICdjbGljaycsICcuUFBfR2FsbGVyeV9faXRlbScsICggZSApIC0+XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCApXG5cdFx0XHRHYWxsZXJ5Lm9wZW4oIHRoaXMgKVxuXG5cblx0IyBIYW5kbGUgRVNDYXBlIEtleVxuXHRpZiBoYW5kbGVfZXNjX2tleVxuXHRcdCQoIHdpbmRvdyApLm9uICdrZXlkb3duJywgKCBlICkgLT5cblx0XHRcdHJldHVybiB1bmxlc3MgZS5rZXkgaXMgJ0VzY2FwZSdcblx0XHRcdGUucHJldmVudERlZmF1bHQoIClcblx0XHRcdEdhbGxlcnkuY2xvc2UoIClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbGxlcnlcbiIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuZ2FsbGVyeV9pdGVtID0gcmVxdWlyZSggJy4uL2dhbGxlcnkvZ2FsbGVyeV9pdGVtX2ZhY3RvcnknIClcbl9fV0lORE9XID0gcmVxdWlyZSggJy4uL2NvcmUvV2luZG93JyApXG50aHJvdHRsZSA9IHJlcXVpcmUoJy4uL2NvcmUvVXRpbGl0aWVzJykudGhyb3R0bGVcblxuY2xhc3MgQWJzdHJhY3RfTGF6eV9Mb2FkZXJcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QEVsZW1lbnRzID1cblx0XHRcdGl0ZW0gICAgICAgOiAnUFBfTGF6eV9JbWFnZSdcblx0XHRcdHBsYWNlaG9sZGVyOiAnUFBfTGF6eV9JbWFnZV9fcGxhY2Vob2xkZXInXG5cdFx0XHRsaW5rICAgICAgIDogJ1BQX0pTX0xhenlfX2xpbmsnXG5cdFx0XHRpbWFnZSAgICAgIDogJ1BQX0pTX0xhenlfX2ltYWdlJ1xuXG5cdFx0QEl0ZW1zID0gW11cblxuXHRcdCMgQWRqdXN0YWJsZSBTZW5zaXRpdml0eSBmb3IgQGluX3ZpZXcgZnVuY3Rpb25cblx0XHQjIFZhbHVlIGluIHBpeGVsc1xuXHRcdEBTZW5zaXRpdml0eSA9IDEwMFxuXG5cdFx0IyBBdXRvLXNldHVwIHdoZW4gZXZlbnRzIGFyZSBhdHRhY2hlZFxuXHRcdCMgQXV0by1kZXN0cm95IHdoZW4gZXZlbnRzIGFyZSBkZXRhY2hlZFxuXHRcdEB0aHJvdHRsZWRfYXV0b2xvYWQgPSBudWxsXG5cblx0XHRAc2V0dXBfaXRlbXMoKVxuXHRcdEByZXNpemVfYWxsKClcblx0XHRAYXR0YWNoX2V2ZW50cygpXG5cblx0IyMjXG5cdFx0QWJzdHJhY3QgTWV0aG9kc1xuXHQjIyNcblxuXHQjIFRoaXMgaXMgcnVuIHdoZW4gYSByZXNpemUgb3IgcmVmcmVzaCBldmVudCBpcyBkZXRlY3RlZFxuXHRyZXNpemU6IC0+IHJldHVyblxuXG5cdGxvYWQ6ICggaXRlbSApIC0+XG5cdFx0QGxvYWRfaW1hZ2UoIGl0ZW0gKVxuXHRcdGl0ZW0uJGVsLmltYWdlc0xvYWRlZCA9PlxuXHRcdFx0QGNsZWFudXBfYWZ0ZXJfbG9hZCggaXRlbSApXG5cblx0bG9hZF9pbWFnZTogKCBpdGVtICkgLT5cblxuXHRcdCMgR2V0IGltYWdlIFVSTHNcblx0XHR0aHVtYiA9IGl0ZW0uZGF0YS51cmwoICd0aHVtYicgKVxuXHRcdGZ1bGwgPSBpdGVtLmRhdGEudXJsKCAnZnVsbCcgKVxuXG5cdFx0IyBDcmVhdGUgZWxlbWVudHNcblx0XHRpdGVtLiRlbFxuXHRcdFx0LnByZXBlbmQoIEBnZXRfaXRlbV9odG1sKCB0aHVtYiwgZnVsbCApIClcblx0XHRcdC5yZW1vdmVDbGFzcyggJ0xhenktSW1hZ2UnIClcblxuXHRcdCMgTWFrZSBzdXJlIHRoaXMgaW1hZ2UgaXNuJ3QgbG9hZGVkIGFnYWluXG5cdFx0aXRlbS5sb2FkZWQgPSB0cnVlXG5cblx0Y2xlYW51cF9hZnRlcl9sb2FkOiAoIGl0ZW0gKSAtPlxuXHRcdCMgQWRkIGltYWdlIFBQX0pTX2xvYWRlZCBjbGFzc1xuXHRcdGl0ZW0uJGVsLmZpbmQoICdpbWcnICkuYWRkQ2xhc3MoICdQUF9KU19fbG9hZGVkJyApLnJlbW92ZUNsYXNzKCAnUFBfSlNfX2xvYWRpbmcnIClcblxuXHRcdGl0ZW0uJGVsXG5cblx0XHRcdCMgUmVtb3ZlIGBQUF9MYXp5X0ltYWdlYCwgYXMgdGhpcyBpcyBub3QgYSBsYXp5LWxvYWRhYmxlIGltYWdlIGFueW1vcmVcblx0XHRcdC5yZW1vdmVDbGFzcyggQEVsZW1lbnRzLml0ZW0gKVxuXG5cdFx0XHQjIFJlbW92ZSBQbGFjZWhvbGRlclxuXHRcdFx0LmZpbmQoIFwiLiN7QEVsZW1lbnRzLnBsYWNlaG9sZGVyfVwiIClcblx0XHRcdC5mYWRlT3V0KCA0MDAsIC0+ICQoIHRoaXMgKS5yZW1vdmUoKSApXG5cblx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQubGF6eS5sb2FkZWRfaXRlbScsIGl0ZW1cblxuXG5cdGdldF9pdGVtX2h0bWw6ICggdGh1bWIsIGZ1bGwgKSAtPlxuXG5cdFx0aWYgJ2Rpc2FibGUnIGlzIHdpbmRvdy5fX3Bob3J0LnBvcHVwX2dhbGxlcnlcblx0XHRcdHJldHVybiBcIlwiXCJcblx0XHRcdDxkaXYgY2xhc3M9XCIje0BFbGVtZW50cy5saW5rfVwiIHJlbD1cImdhbGxlcnlcIj5cblx0XHRcdFx0PGltZyBjbGFzcz1cIiN7QEVsZW1lbnRzLmltYWdlfVwiIHNyYz1cIiN7dGh1bWJ9XCIgY2xhc3M9XCJQUF9KU19fbG9hZGluZ1wiIC8+XG5cdFx0XHQ8L2Rpdj5cblx0XHRcdFwiXCJcIlxuXHRcdGVsc2Vcblx0XHRcdHJldHVybiBcIlwiXCJcblx0XHRcdDxhIGNsYXNzPVwiI3tARWxlbWVudHMubGlua31cIiBocmVmPVwiI3tmdWxsfVwiIHJlbD1cImdhbGxlcnlcIj5cblx0XHRcdFx0PGltZyBjbGFzcz1cIiN7QEVsZW1lbnRzLmltYWdlfVwiIHNyYz1cIiN7dGh1bWJ9XCIgY2xhc3M9XCJQUF9KU19fbG9hZGluZ1wiIC8+XG5cdFx0XHQ8L2E+XG5cdFx0XHRcIlwiXCJcblxuXHRzZXR1cF9pdGVtczogPT5cblx0XHQjIENsZWFyIGV4aXN0aW5nIGl0ZW1zLCBpZiBhbnlcblx0XHRASXRlbXMgPSBbXVxuXG5cdFx0IyBMb29wIG92ZXIgRE9NIGFuZCBhZGQgZWFjaCBpdGVtIHRvIEBJdGVtc1xuXHRcdCQoIFwiLiN7QEVsZW1lbnRzLml0ZW19XCIgKS5lYWNoKCBAYWRkX2l0ZW0gKVxuXHRcdHJldHVyblxuXG5cdGFkZF9pdGVtOiAoIGtleSwgZWwgKSA9PlxuXHRcdCRlbCA9ICQoIGVsIClcblx0XHRASXRlbXMucHVzaFxuXHRcdFx0ZWwgICAgOiBlbFxuXHRcdFx0JGVsICAgOiAkZWxcblx0XHRcdGRhdGEgIDogZ2FsbGVyeV9pdGVtKCAkZWwgKVxuXHRcdFx0bG9hZGVkOiBmYWxzZVxuXG5cblx0XHRyZXR1cm5cblxuXG5cdCMjI1xuXHRcdE1ldGhvZHNcblx0IyMjXG5cdHJlc2l6ZV9hbGw6IC0+XG5cdFx0QHJlc2l6ZSggaXRlbSApIGZvciBpdGVtIGluIEBJdGVtc1xuXG5cblxuXHQjIEF1dG9tYXRpY2FsbHkgTG9hZCBhbGwgaXRlbXMgdGhhdCBhcmUgYGluX2xvb3NlX3ZpZXdgXG5cdGF1dG9sb2FkOiA9PlxuXHRcdGZvciBpdGVtLCBrZXkgaW4gQEl0ZW1zXG5cdFx0XHRpZiBub3QgaXRlbS5sb2FkZWQgYW5kIEBpbl9sb29zZV92aWV3KCBpdGVtLmVsIClcblx0XHRcdFx0QGxvYWQoIGl0ZW0gKVxuXG5cdGluX2xvb3NlX3ZpZXc6ICggZWwgKSAtPlxuXHRcdHJldHVybiB0cnVlIGlmIG5vdCBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3Q/XG5cdFx0cmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG5cblx0XHQjIEVsZW1lbnRzIG5vdCBpbiB2aWV3IGlmIHRoZXkgZG9uJ3QgaGF2ZSBkaW1lbnNpb25zXG5cdFx0cmV0dXJuIGZhbHNlIGlmIHJlY3QuaGVpZ2h0IGlzIDAgYW5kIHJlY3Qud2lkdGggaXMgMFxuXG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0IyBZIEF4aXNcblx0XHRcdHJlY3QudG9wICsgcmVjdC5oZWlnaHQgPj0gLUBTZW5zaXRpdml0eSBhbmQgIyB0b3Bcblx0XHRcdHJlY3QuYm90dG9tIC0gcmVjdC5oZWlnaHQgPD0gX19XSU5ET1cuaGVpZ2h0ICsgQFNlbnNpdGl2aXR5IGFuZFxuXG5cdFx0XHQjIFggQXhpc1xuXHRcdFx0cmVjdC5sZWZ0ICsgcmVjdC53aWR0aCA+PSAtQFNlbnNpdGl2aXR5IGFuZFxuXHRcdFx0cmVjdC5yaWdodCAtIHJlY3Qud2lkdGggPD0gX19XSU5ET1cud2lkdGggKyBAU2Vuc2l0aXZpdHlcblxuXHRcdClcblxuXHRkZXN0cm95OiAtPlxuXHRcdEBkZXRhY2hfZXZlbnRzKClcblxuXHRhdHRhY2hfZXZlbnRzOiAtPlxuXHRcdCMgQ3JlYXRlIGEgZGVib3VuY2VkIGBhdXRvbG9hZGAgZnVuY3Rpb25cblx0XHRAdGhyb3R0bGVkX2F1dG9sb2FkID0gdGhyb3R0bGUoIEBhdXRvbG9hZCwgNTAgKVxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCBAdGhyb3R0bGVkX2F1dG9sb2FkLCAxMDBcblxuXG5cdGRldGFjaF9ldmVudHM6IC0+XG5cdFx0IyBDbGVhciB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uIGZyb20gaW5zdGFuY2Vcblx0XHRAdGhyb3R0bGVkX2F1dG9sb2FkID0gbnVsbFxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCBAdGhyb3R0bGVkX2F1dG9sb2FkLCAxMDBcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQWJzdHJhY3RfTGF6eV9Mb2FkZXJcbiIsIiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5BYnN0cmFjdF9MYXp5X0xvYWRlciA9IHJlcXVpcmUoICcuL0Fic3RyYWN0X0xhenlfTG9hZGVyJyApXG5fX1dJTkRPVyA9IHJlcXVpcmUoICcuLi9jb3JlL1dpbmRvdycgKVxuXG5jbGFzcyBMYXp5X01hc29ucnkgZXh0ZW5kcyBBYnN0cmFjdF9MYXp5X0xvYWRlclxuXG5cdHJlc2l6ZV9hbGw6IC0+XG5cdFx0QHBsYWNlaG9sZGVyX3dpZHRoID0gJCggJy5QUF9NYXNvbnJ5X19zaXplcicgKS53aWR0aCgpXG5cdFx0c3VwZXIoKVxuXG5cdHJlc2l6ZTogKCBpdGVtICkgLT5cblx0XHRpdGVtLiRlbC5jc3MgJ21pbi1oZWlnaHQnOiBNYXRoLmZsb29yKCBAcGxhY2Vob2xkZXJfd2lkdGggLyBpdGVtLmRhdGEuZ2V0KCdyYXRpbycpIClcblxuXHRjbGVhbnVwX2FmdGVyX2xvYWQ6IChpdGVtKSAtPlxuXHRcdCMgUmVtb3ZlIG1pbi1oZWlnaHRcblx0XHRpdGVtLiRlbC5jc3MoICdtaW4taGVpZ2h0JywgJycgKVxuXG5cdFx0IyBSdW4gYWxsIG90aGVyIGNsZWFudXBzXG5cdFx0c3VwZXIoIGl0ZW0gKVxuXG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5yZWZyZXNoJ1xuXG5cdFx0cmV0dXJuXG5cblx0YXR0YWNoX2V2ZW50czogLT5cblx0XHQjIENhbGwgUGFyZW50IGZpcnN0LCBpdCdzIGdvaW5nIHRvIGNyZWF0ZSBAdGhyb3R0bGVkX2F1dG9sb2FkXG5cdFx0c3VwZXIoKVxuXG5cdFx0IyBBdHRhY2hcblx0XHQkKCB3aW5kb3cgKS5vbiAnc2Nyb2xsJywgQHRocm90dGxlZF9hdXRvbG9hZFxuXG5cblxuXHRkZXRhY2hfZXZlbnRzOiAtPlxuXHRcdCMgRGV0YWNoXG5cdFx0JCggd2luZG93ICkub2ZmICdzY3JvbGwnLCBAdGhyb3R0bGVkX2F1dG9sb2FkXG5cblx0XHQjIENhbGwgcGFyZW50IGxhc3QsIGl0J3MgZ29pbmcgdG8gY2xlYW4gdXAgQHRocm90dGxlZF9hdXRvbG9hZFxuXHRcdHN1cGVyKClcblxuXHRkZXN0cm95OiAtPlxuXHRcdGZvciBpdGVtLCBrZXkgaW4gQEl0ZW1zXG5cdFx0XHRpdGVtLiRlbC5jc3MgJ21pbi1oZWlnaHQnLCAnJ1xuXHRcdHN1cGVyKClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IExhenlfTWFzb25yeVxuIiwiJCA9IHJlcXVpcmUoICdqUXVlcnknIClcbkhvb2tzID0gcmVxdWlyZSggJ3dwX2hvb2tzJyApXG5cblxuaW5zdGFuY2UgPSBmYWxzZVxuXG5kZXN0cm95ID0gLT5cblx0cmV0dXJuIGlmIG5vdCBpbnN0YW5jZVxuXHRpbnN0YW5jZS5kZXN0cm95KCApXG5cdGluc3RhbmNlID0gbnVsbFxuXG5jcmVhdGUgPSAtPlxuXG5cdCMgTWFrZSBzdXJlIGFuIGluc3RhbmNlIGRvZXNuJ3QgYWxyZWFkeSBleGlzdFxuXHRkZXN0cm95KCApXG5cblx0IyBIYW5kbGVyIHJlcXVpcmVkXG5cdEhhbmRsZXIgPSBIb29rcy5hcHBseUZpbHRlcnMgJ3Bob3J0LmxhenkuaGFuZGxlcicsIGZhbHNlXG5cdHJldHVybiBpZiBub3QgSGFuZGxlclxuXG5cdCMgQnkgZGVmYXVsdCBMYXp5X01hc29ucnkgaXMgaGFuZGxpbmcgTGF6eS1Mb2FkaW5nXG5cdCMgQ2hlY2sgaWYgYW55b25lIHdhbnRzIHRvIGhpamFjayBoYW5kbGVyXG5cdGluc3RhbmNlID0gbmV3IEhhbmRsZXIoIClcblxuXHRyZXR1cm5cblxuXG4jIEluaXRpYWxpemUgbGF6eSBsb2FkZXIgYWZ0ZXIgdGhlIHBvcnRmb2xpbyBpcyBwcmVwYXJlZCwgcCA9IDEwMFxuSG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZScsIGNyZWF0ZSwgMTAwXG5Ib29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgZGVzdHJveVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5cdGNyZWF0ZSA6IGNyZWF0ZVxuXHRkZXN0cm95OiBkZXN0cm95IiwiSG9va3MgPSByZXF1aXJlKCAnd3BfaG9va3MnIClcblxuIyMjXG5cbiAgICAjIEluaXRpYWxpemUgUG9ydGZvbGlvIENvcmVcblx0LS0tXG5cdFx0VXNpbmcgcDUwIEAgYHBob3J0LmNvcmUucmVhZHlgXG5cdFx0TGF0ZSBwcmlvcml0eSBpcyBnb2luZyB0byBmb3JjZSBleHBsaWNpdCBwcmlvcml0eSBpbiBhbnkgb3RoZXIgbW92aW5nIHBhcnRzIHRoYXQgYXJlIGdvaW5nIHRvIHRvdWNoIHBvcnRmb2xpbyBsYXlvdXQgYXQgYHBob3J0LmxvYWRlZGBcblx0LS0tXG5cbiMjI1xubW9kdWxlLmV4cG9ydHMgPVxuXG5cdHByZXBhcmU6IC0+XG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5wcmVwYXJlJ1xuXHRcdHJldHVyblxuXG5cdGNyZWF0ZTogLT5cblx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQucG9ydGZvbGlvLmNyZWF0ZSdcblx0XHRyZXR1cm5cblxuXG5cdHJlZnJlc2g6IC0+XG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5yZWZyZXNoJ1xuXHRcdHJldHVyblxuXG5cblx0ZGVzdHJveTogLT5cblx0XHQjIERlc3Ryb3lcblx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQucG9ydGZvbGlvLmRlc3Ryb3knXG5cdFx0cmV0dXJuXG4iLCJIb29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5cblxuIyMjXG5cdEFic3RyYWN0IENsYXNzIFBvcnRvZmxpb19FdmVudF9JbWVwbGVtZW50YXRpb25cblxuICAgIEhhbmRsZXMgYWxsIHRoZSBldmVudHMgcmVxdWlyZWQgdG8gZnVsbHkgaGFuZGxlIGEgcG9ydGZvbGlvIGxheW91dCBwcm9jZXNzXG4jIyNcbmNsYXNzIFBvcnRmb2xpb19JbnRlcmZhY2VcblxuXHRjb25zdHJ1Y3RvcjogKCBhcmdzICkgLT5cblx0XHRAc2V0dXBfYWN0aW9ucygpXG5cdFx0QGluaXRpYWxpemUoIGFyZ3MgKVxuXG5cdHNldHVwX2FjdGlvbnM6IC0+XG5cdFx0SG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZScsIEBwcmVwYXJlLCA1MFxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLmNyZWF0ZScsIEBjcmVhdGUsIDUwXG5cdFx0SG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCcsIEByZWZyZXNoLCA1MFxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLmRlc3Ryb3knLCBAZGVzdHJveSwgNTBcblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgQHB1cmdlX2FjdGlvbnMsIDEwMFxuXG5cdHB1cmdlX2FjdGlvbnM6ID0+XG5cdFx0SG9va3MucmVtb3ZlQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZScsIEBwcmVwYXJlLCA1MFxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLmNyZWF0ZScsIEBjcmVhdGUsIDUwXG5cdFx0SG9va3MucmVtb3ZlQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCcsIEByZWZyZXNoLCA1MFxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLmRlc3Ryb3knLCBAZGVzdHJveSwgNTBcblx0XHRIb29rcy5yZW1vdmVBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgQHB1cmdlX2FjdGlvbnMsIDEwMFxuXG5cblx0IyMjXG4gICAgXHRSZXF1aXJlIHRoZXNlIG1ldGhvZHNcblx0IyMjXG5cdGluaXRpYWxpemU6IC0+IHRocm93IG5ldyBFcnJvciggXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYGluaXRpYWxpemVgIG1ldGhvZFwiIClcblx0cHJlcGFyZSAgIDogLT4gdGhyb3cgbmV3IEVycm9yKCBcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgcHJlcGFyZWAgbWV0aG9kXCIgKVxuXHRjcmVhdGUgICAgOiAtPiB0aHJvdyBuZXcgRXJyb3IoIFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGBjcmVhdGVgIG1ldGhvZFwiIClcblx0cmVmcmVzaCAgIDogLT4gdGhyb3cgbmV3IEVycm9yKCBcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgcmVmcmVzaGAgbWV0aG9kXCIgKVxuXHRkZXN0cm95ICAgOiAtPiB0aHJvdyBuZXcgRXJyb3IoIFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGBkZXN0cm95YCBtZXRob2RcIiApXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBvcnRmb2xpb19JbnRlcmZhY2UiLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuJCA9IHJlcXVpcmUoICdqUXVlcnknIClcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcblBvcnRmb2xpb19JbnRlcmZhY2UgPSByZXF1aXJlKCAnLi9Qb3J0Zm9saW9fSW50ZXJmYWNlJyApXG5cbiMgQFRPRE86IE5lZWQgYSBoZWF2dnkgcmVmYWN0b3IgLSBubyBtb3JlIGNsYXNzZXMgcGxlYXNlXG5jbGFzcyBQb3J0Zm9saW9fTWFzb25yeSBleHRlbmRzIFBvcnRmb2xpb19JbnRlcmZhY2VcblxuXHRjb25zdHJ1Y3RvcjogLT5cblxuXHRcdEBFbGVtZW50cyA9XG5cdFx0XHRjb250YWluZXI6ICdQUF9NYXNvbnJ5J1xuXHRcdFx0c2l6ZXIgICAgOiAnUFBfTWFzb25yeV9fc2l6ZXInXG5cdFx0XHRpdGVtICAgICA6ICdQUF9NYXNvbnJ5X19pdGVtJ1xuXG5cdFx0c3VwZXIoKVxuXG5cdCMjI1xuXHRcdEluaXRpYWxpemVcblx0IyMjXG5cdGluaXRpYWxpemU6IC0+XG5cdFx0QCRjb250YWluZXIgPSAkKCBcIi4je0BFbGVtZW50cy5jb250YWluZXJ9XCIgKVxuXG5cdCMjI1xuXHRcdFByZXBhcmUgJiBBdHRhY2ggRXZlbnRzXG4gICAgXHREb24ndCBzaG93IGFueXRoaW5nIHlldC5cblxuXHRcdEBjYWxsZWQgb24gaG9vayBgcGhvcnQucG9ydGZvbGlvLnByZXBhcmVgXG5cdCMjI1xuXHRwcmVwYXJlOiA9PlxuXHRcdHJldHVybiBpZiBAJGNvbnRhaW5lci5sZW5ndGggaXMgMFxuXG5cdFx0QCRjb250YWluZXIuYWRkQ2xhc3MoICdQUF9KU19fbG9hZGluZ19tYXNvbnJ5JyApXG5cblx0XHRAbWF5YmVfY3JlYXRlX3NpemVyKClcblxuXHRcdCMgT25seSBpbml0aWFsaXplLCBpZiBubyBtYXNvbnJ5IGV4aXN0c1xuXHRcdG1hc29ucnlfc2V0dGluZ3MgPSBIb29rcy5hcHBseUZpbHRlcnMgJ3Bob3J0Lm1hc29ucnkuc2V0dGluZ3MnLFxuXHRcdFx0aXRlbVNlbGVjdG9yOiBcIi4je0BFbGVtZW50cy5pdGVtfVwiXG5cdFx0XHRjb2x1bW5XaWR0aCA6IFwiLiN7QEVsZW1lbnRzLnNpemVyfVwiXG5cdFx0XHRndXR0ZXIgICAgICA6IDBcblx0XHRcdGluaXRMYXlvdXQgIDogZmFsc2VcblxuXHRcdEAkY29udGFpbmVyLm1hc29ucnkoIG1hc29ucnlfc2V0dGluZ3MgKVxuXG5cdFx0QCRjb250YWluZXIubWFzb25yeSAnb25jZScsICdsYXlvdXRDb21wbGV0ZScsID0+XG5cdFx0XHRAJGNvbnRhaW5lclxuXHRcdFx0XHQucmVtb3ZlQ2xhc3MoICdQUF9KU19fbG9hZGluZ19tYXNvbnJ5JyApXG5cdFx0XHRcdC5hZGRDbGFzcyggJ1BQX0pTX19sb2FkaW5nX2NvbXBsZXRlJyApXG5cblx0XHRcdCMgQHRyaWdnZXIgcmVmcmVzaCBldmVudFxuXHRcdFx0IyB0cmlnZ2VycyBgQHJlZnJlc2goKWBcblx0XHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCdcblxuXG5cdCMjI1xuXHRcdFN0YXJ0IHRoZSBQb3J0Zm9saW9cblx0XHRAY2FsbGVkIG9uIGhvb2sgYHBob3J0LnBvcnRmb2xpby5jcmVhdGVgXG5cdCMjI1xuXHRjcmVhdGU6ID0+XG5cdFx0QCRjb250YWluZXIubWFzb25yeSgpXG5cdFx0cmV0dXJuXG5cblxuXHQjIyNcblx0XHREZXN0cm95XG5cdFx0QGNhbGxlZCBvbiBob29rIGBwaG9ydC5wb3J0Zm9saW8uZGVzdHJveWBcblx0IyMjXG5cdGRlc3Ryb3k6ID0+XG5cdFx0QG1heWJlX3JlbW92ZV9zaXplcigpXG5cblx0XHRpZiBAJGNvbnRhaW5lci5sZW5ndGggPiAwXG5cdFx0XHRAJGNvbnRhaW5lci5tYXNvbnJ5KCAnZGVzdHJveScgKVxuXG5cblx0XHRyZXR1cm5cblxuXG5cdCMjI1xuXHRcdFJlbG9hZCB0aGUgbGF5b3V0XG5cdFx0QGNhbGxlZCBvbiBob29rIGBwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaGBcblx0IyMjXG5cdHJlZnJlc2g6ID0+XG5cdFx0QCRjb250YWluZXIubWFzb25yeSggJ2xheW91dCcgKVxuXG5cblxuXHQjIyNcblx0XHRDcmVhdGUgYSBzaXplciBlbGVtZW50IGZvciBqcXVlcnktbWFzb25yeSB0byB1c2Vcblx0IyMjXG5cdG1heWJlX2NyZWF0ZV9zaXplcjogLT5cblx0XHRAY3JlYXRlX3NpemVyKCkgaWYgQHNpemVyX2RvZXNudF9leGlzdCgpXG5cdFx0cmV0dXJuXG5cblx0bWF5YmVfcmVtb3ZlX3NpemVyOiAtPlxuXHRcdHJldHVybiBpZiBAJGNvbnRhaW5lci5sZW5ndGggaXNudCAxXG5cdFx0QCRjb250YWluZXIuZmluZCggXCIuI3tARWxlbWVudHMuc2l6ZXJ9XCIgKS5yZW1vdmUoKVxuXHRcdHJldHVyblxuXG5cdHNpemVyX2RvZXNudF9leGlzdDogLT4gQCRjb250YWluZXIuZmluZCggXCIuI3tARWxlbWVudHMuc2l6ZXJ9XCIgKS5sZW5ndGggaXMgMFxuXG5cblx0Y3JlYXRlX3NpemVyOiAtPlxuXHRcdEAkY29udGFpbmVyLmFwcGVuZCBcIlwiXCI8ZGl2IGNsYXNzPVwiI3tARWxlbWVudHMuc2l6ZXJ9XCI+PC9kaXY+XCJcIlwiXG5cblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW9fTWFzb25yeSIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuXG4jIFBvcnRmb2xpbyBtYW5hZ2VyIHdpbGwgdHJpZ2dlciBwb3J0Zm9saW8gZXZlbnRzIHdoZW4gbmVjZXNzYXJ5XG5UcmlnZ2VyID0gcmVxdWlyZSggJy4vUG9ydGZvbGlvX0V2ZW50cycgKVxuXG5pc19tYXNvbnJ5ID0gLT5cblx0cmV0dXJuICggJCggJy5QUF9NYXNvbnJ5JyApLmxlbmd0aCBpc250IDAgKVxuXG4jIFN0YXJ0IE1hc29ucnkgTGF5b3V0XG5zdGFydF9tYXNvbnJ5ID0gLT5cblx0cmV0dXJuIGZhbHNlIGlmIG5vdCBpc19tYXNvbnJ5KClcblxuXHRQb3J0Zm9saW9fTWFzb25yeSA9IHJlcXVpcmUoICcuL1BvcnRmb2xpb19NYXNvbnJ5JyApXG5cdG5ldyBQb3J0Zm9saW9fTWFzb25yeSgpXG5cbm1heWJlX2xhenlfbWFzb25yeSA9ICggaGFuZGxlciApIC0+XG5cdCMgVXNlIExhenlfTWFzb25yeSBoYW5kbGVyLCBpZiBjdXJyZW50IGxheW91dCBpcyBtYXNvbnJ5XG5cdHJldHVybiByZXF1aXJlKCAnbGF6eS9MYXp5X01hc29ucnknICkgaWYgaXNfbWFzb25yeSgpXG5cdHJldHVybiBoYW5kbGVyXG5cblxuIyBTdGFydCBQb3J0Zm9saW9cbkhvb2tzLmFkZEFjdGlvbiAncGhvcnQuY29yZS5yZWFkeScsIFRyaWdnZXIucHJlcGFyZSwgNTBcbkhvb2tzLmFkZEFjdGlvbiAncGhvcnQuY29yZS5sb2FkZWQnLCBUcmlnZ2VyLmNyZWF0ZSwgNTBcblxuIyBJbml0aWFsaXplIE1hc29ucnkgTGF5b3V0XG5Ib29rcy5hZGRBY3Rpb24gJ3Bob3J0LmNvcmUucmVhZHknLCBzdGFydF9tYXNvbnJ5XG5cbiMgSW5pdGlhbGl6ZSBMYXp5IExvYWRpbmcgZm9yIE1hc29ucnkgTGF5b3V0XG5Ib29rcy5hZGRGaWx0ZXIgJ3Bob3J0LmxhenkuaGFuZGxlcicsIG1heWJlX2xhenlfbWFzb25yeVxuXG5cblxuIl19
