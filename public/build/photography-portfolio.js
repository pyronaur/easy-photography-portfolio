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
    instance: function() {
      return Gallery;
    },
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
    instance: function() {
      return Gallery;
    },
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
      instance.open(gallery_items, index);
      Hooks.doAction('phort.gallery.open', instance, gallery_items, index);
    }
  };
  return {
    open: open,
    handle_hash: function() {
      var el, index;
      index = parseInt(window.location.hash.split('&pid=')[1], 10);
      el = $('.PP_Gallery').first().find('.PP_Gallery__item').get(index);
      open(el);
    },
    close: function() {
      if (!instance) {
        return false;
      }
      instance.close();
      instance = false;
      Hooks.doAction('phort.gallery.close', instance);
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


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jb3JlL1V0aWxpdGllcy5qcyIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jb3JlL1dpbmRvdy5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY29yZS9zdGFydC5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvZ2FsbGVyeS9hZGFwdGVycy9saWdodGdhbGxlcnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvYWRhcHRlcnMvcGhvdG9zd2lwZS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvZ2FsbGVyeS9nYWxsZXJ5X2ZhY3RvcnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvZ2FsbGVyeV9pdGVtX2RhdGEuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvZ2FsbGVyeV9pdGVtX2ZhY3RvcnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvcHJlcGFyZV9nYWxsZXJ5X2ZhY3RvcnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvc3RhcnQuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvQWJzdHJhY3RfTGF6eV9Mb2FkZXIuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvTGF6eV9NYXNvbnJ5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L3N0YXJ0LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9wb3J0Zm9saW8vUG9ydGZvbGlvX0V2ZW50cy5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL1BvcnRmb2xpb19JbnRlcmZhY2UuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL3BvcnRmb2xpby9Qb3J0Zm9saW9fTWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL3N0YXJ0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7OztBQUFBLElBQUE7O0FBR0EsS0FBQSxHQUFRLE9BQUEsQ0FBUyxVQUFUOztBQUNSLENBQUEsR0FBSSxPQUFBLENBQVMsUUFBVDs7QUFHSixNQUFNLENBQUMsVUFBUCxHQUVDO0VBQUEsbUJBQUEsRUFBcUIsT0FBQSxDQUFTLGlDQUFULENBQXJCO0VBR0EsT0FBQSxFQUNDO0lBQUEsU0FBQSxFQUFjLE9BQUEsQ0FBUyw2QkFBVCxDQUFkO0lBQ0EsWUFBQSxFQUFjLE9BQUEsQ0FBUyxnQ0FBVCxDQURkO0dBSkQ7RUFRQSxvQkFBQSxFQUFzQixPQUFBLENBQVMsNkJBQVQsQ0FSdEI7OztBQVdELE1BQU0sQ0FBQyxxQkFBUCxHQUNDO0VBQUEsSUFBQSxFQUFrQixPQUFBLENBQVMsY0FBVCxDQUFsQjtFQUNBLGdCQUFBLEVBQWtCLE9BQUEsQ0FBUyxtQkFBVCxDQURsQjtFQUVBLE9BQUEsRUFBa0IsT0FBQSxDQUFTLGlCQUFULENBRmxCO0VBR0EsV0FBQSxFQUFrQixPQUFBLENBQVMsY0FBVCxDQUhsQjs7OztBQUtEOzs7O0FBR0EsQ0FBQSxDQUFHLFFBQUgsQ0FBYSxDQUFDLEtBQWQsQ0FBb0IsU0FBQTtFQUduQixJQUFVLENBQUksQ0FBQSxDQUFHLE1BQUgsQ0FBVyxDQUFDLFFBQVosQ0FBc0IsY0FBdEIsQ0FBZDtBQUFBLFdBQUE7O0VBR0EscUJBQXFCLENBQUMsSUFBSSxDQUFDLEtBQTNCLENBQUE7QUFObUIsQ0FBcEI7Ozs7OztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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dkQ7OzhCQUdwQixZQUFBLEdBQWMsU0FBQTtJQUNiLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFBWixDQUFtQixlQUFBLEdBQWlCLElBQUMsQ0FBQSxRQUFRLENBQUMsS0FBM0IsR0FBaUMsV0FBcEQ7RUFEYTs7OztHQWhHaUI7O0FBcUdoQyxNQUFNLENBQUMsT0FBUCxHQUFpQjs7Ozs7Ozs7QUM3R2pCOzs7QUFBQSxJQUFBOztBQUdBLENBQUEsR0FBSSxPQUFBLENBQVMsUUFBVDs7QUFDSixLQUFBLEdBQVEsT0FBQSxDQUFTLFVBQVQ7O0FBR1IsT0FBQSxHQUFVLE9BQUEsQ0FBUyxvQkFBVDs7QUFFVixVQUFBLEdBQWEsU0FBQTtBQUNaLFNBQVMsQ0FBQSxDQUFHLGFBQUgsQ0FBa0IsQ0FBQyxNQUFuQixLQUErQjtBQUQ1Qjs7QUFJYixhQUFBLEdBQWdCLFNBQUE7QUFDZixNQUFBO0VBQUEsSUFBZ0IsQ0FBSSxVQUFBLENBQUEsQ0FBcEI7QUFBQSxXQUFPLE1BQVA7O0VBRUEsaUJBQUEsR0FBb0IsT0FBQSxDQUFTLHFCQUFUO1NBQ3BCLElBQUksaUJBQUosQ0FBQTtBQUplOztBQU1oQixrQkFBQSxHQUFxQixTQUFFLE9BQUY7RUFFcEIsSUFBeUMsVUFBQSxDQUFBLENBQXpDO0FBQUEsV0FBTyxPQUFBLENBQVMsbUJBQVQsRUFBUDs7QUFDQSxTQUFPO0FBSGE7O0FBT3JCLEtBQUssQ0FBQyxTQUFOLENBQWdCLGtCQUFoQixFQUFvQyxPQUFPLENBQUMsT0FBNUMsRUFBcUQsRUFBckQ7O0FBQ0EsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsbUJBQWhCLEVBQXFDLE9BQU8sQ0FBQyxNQUE3QyxFQUFxRCxFQUFyRDs7QUFHQSxLQUFLLENBQUMsU0FBTixDQUFnQixrQkFBaEIsRUFBb0MsYUFBcEM7O0FBR0EsS0FBSyxDQUFDLFNBQU4sQ0FBZ0Isb0JBQWhCLEVBQXNDLGtCQUF0QyIsImZpbGUiOiJwaG90b2dyYXBoeS1wb3J0Zm9saW8uanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiMjI1xuICAgIExvYWQgRGVwZW5kZW5jaWVzXG4jIyNcbkhvb2tzID0gcmVxdWlyZSggJ3dwX2hvb2tzJyApXG4kID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuXG4jIEV4cG9zZSBzb21lIFBob3RvZ3JhcGh5IFBvcnRmb2xpbyBtb2R1bGVzIHRvIHRoZSBwdWJsaWMgZm9yIGV4dGVuc2liaWxpdHlcbndpbmRvdy5QUF9Nb2R1bGVzID1cblx0IyBFeHRlbmQgUG9ydGZvbGlvIEludGVyZmFjZSB0byBidWlsZCBjdXN0b20gcG9ydGZvbGlvIGxheW91dHMgYmFzZWQgb24gUFAgRXZlbnRzXG5cdFBvcnRmb2xpb19JbnRlcmZhY2U6IHJlcXVpcmUoICcuL3BvcnRmb2xpby9Qb3J0Zm9saW9fSW50ZXJmYWNlJyApXG5cbiMgVXNlIGBnYWxsZXJ5X2l0ZW1fZGF0YWAgdG8gZ2V0IGZvcm1hdHRlZCBpdGVtIGltYWdlIHNpemVzIGZvciBsYXp5IGxvYWRpbmdcblx0Z2FsbGVyeTpcblx0XHRpdGVtX2RhdGEgICA6IHJlcXVpcmUoICcuL2dhbGxlcnkvZ2FsbGVyeV9pdGVtX2RhdGEnIClcblx0XHRpdGVtX2ZhY3Rvcnk6IHJlcXVpcmUoICcuL2dhbGxlcnkvZ2FsbGVyeV9pdGVtX2ZhY3RvcnknIClcblxuIyBFeHRlbmQgQWJzdHJhY3RfTGF6eV9Mb2RlciB0byBpbXBsZW1lbnQgbGF6eSBsb2FkZXIgZm9yIHlvdXIgbGF5b3V0XG5cdEFic3RyYWN0X0xhenlfTG9hZGVyOiByZXF1aXJlKCAnLi9sYXp5L0Fic3RyYWN0X0xhenlfTG9hZGVyJyApXG5cblxud2luZG93LlBob3RvZ3JhcGh5X1BvcnRmb2xpbyA9XG5cdENvcmUgICAgICAgICAgICA6IHJlcXVpcmUoICcuL2NvcmUvc3RhcnQnIClcblx0UG9ydGZvbGlvX0xheW91dDogcmVxdWlyZSggJy4vcG9ydGZvbGlvL3N0YXJ0JyApXG5cdEdhbGxlcnkgICAgICAgICA6IHJlcXVpcmUoICcuL2dhbGxlcnkvc3RhcnQnIClcblx0TGF6eV9Mb2FkZXIgICAgIDogcmVxdWlyZSggJy4vbGF6eS9zdGFydCcgKVxuXG4jIyNcblx0Qm9vdCBvbiBgZG9jdW1lbnQucmVhZHlgXG4jIyNcbiQoIGRvY3VtZW50ICkucmVhZHkgLT5cblxuXHQjIE9ubHkgcnVuIHRoaXMgc2NyaXB0IHdoZW4gYm9keSBoYXMgYFBQX1BvcnRmb2xpb2AgY2xhc3Ncblx0cmV0dXJuIGlmIG5vdCAkKCAnYm9keScgKS5oYXNDbGFzcyggJ1BQX1BvcnRmb2xpbycgKVxuXG5cdCMgQm9vdFxuXHRQaG90b2dyYXBoeV9Qb3J0Zm9saW8uQ29yZS5yZWFkeSggKVxuXHRyZXR1cm5cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuXG5cbiAgICAvKipcbiAgICAgKiBUaGFuayB5b3UgUnVzcyBmb3IgaGVscGluZyBtZSBhdm9pZCB3cml0aW5nIHRoaXMgbXlzZWxmOlxuICAgICAqIEB1cmwgaHR0cHM6Ly9yZW15c2hhcnAuY29tLzIwMTAvMDcvMjEvdGhyb3R0bGluZy1mdW5jdGlvbi1jYWxscy8jY29tbWVudC0yNzQ1NjYzNTk0XG4gICAgICovXG4gICAgdGhyb3R0bGU6IGZ1bmN0aW9uICggZm4sIHRocmVzaGhvbGQsIHNjb3BlICkge1xuICAgICAgICB0aHJlc2hob2xkIHx8ICh0aHJlc2hob2xkID0gMjUwKVxuICAgICAgICB2YXIgbGFzdCxcbiAgICAgICAgICAgIGRlZmVyVGltZXJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBjb250ZXh0ID0gc2NvcGUgfHwgdGhpc1xuXG4gICAgICAgICAgICB2YXIgbm93ICA9ICtuZXcgRGF0ZSxcbiAgICAgICAgICAgICAgICBhcmdzID0gYXJndW1lbnRzXG4gICAgICAgICAgICBpZiAoIGxhc3QgJiYgbm93IDwgbGFzdCArIHRocmVzaGhvbGQgKSB7XG4gICAgICAgICAgICAgICAgLy8gaG9sZCBvbiB0byBpdFxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCggZGVmZXJUaW1lciApXG4gICAgICAgICAgICAgICAgZGVmZXJUaW1lciA9IHNldFRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFzdCA9IG5vd1xuICAgICAgICAgICAgICAgICAgICBmbi5hcHBseSggY29udGV4dCwgYXJncyApXG4gICAgICAgICAgICAgICAgfSwgdGhyZXNoaG9sZCArIGxhc3QgLSBub3cgKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsYXN0ID0gbm93XG4gICAgICAgICAgICAgICAgZm4uYXBwbHkoIGNvbnRleHQsIGFyZ3MgKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG5cbn0iLCJIb29rcyA9IHJlcXVpcmUoICd3cF9ob29rcycgKVxuXG5cbmdldF9zaXplID0gLT5cblx0d2lkdGggOiB3aW5kb3cuaW5uZXJXaWR0aCB8fCAkd2luZG93LndpZHRoKClcblx0aGVpZ2h0OiB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgJHdpbmRvdy5oZWlnaHQoKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0X3NpemUoKSIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuSG9va3MgPSByZXF1aXJlKCAnd3BfaG9va3MnIClcblxucmVhZHkgPSAtPlxuXHRpZiBIb29rcy5hcHBseUZpbHRlcnMoICdwaG9ydC5jb3JlLnJlYWR5JywgdHJ1ZSApXG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LmNvcmUucmVhZHknXG5cblx0IyBBdXRvbWF0aWNhbGx5IHRyaWdnZXIgYHBob3J0LmNvcmUubG9hZGVkYCB3aGVuIGltYWdlcyBhcmUgbG9hZGVkXG5cdCQoICcuUFBfV3JhcHBlcicgKS5pbWFnZXNMb2FkZWQoIGxvYWRlZCApXG5cdHJldHVyblxuXG5sb2FkZWQgPSAtPlxuXHRpZiBIb29rcy5hcHBseUZpbHRlcnMoICdwaG9ydC5jb3JlLmxvYWRlZCcsIHRydWUgKVxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5jb3JlLmxvYWRlZCdcblx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID1cblx0bG9hZGVkOiBsb2FkZWRcblx0cmVhZHkgOiByZWFkeSIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggXCJqUXVlcnlcIiApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5cbmRlZmF1bHRzID1cblx0ZHluYW1pYyA6IHRydWVcblx0c3BlZWQgICA6IDM1MFxuXHRwcmVsb2FkIDogM1xuXHRkb3dubG9hZDogZmFsc2Vcblx0ZXNjS2V5ICA6IGZhbHNlICMgV2UncmUgcm9sbGluZyBvdXIgb3duXG5cblx0dGh1bWJuYWlsICAgICAgICAgOiB0cnVlXG5cdHNob3dUaHVtYkJ5RGVmYXVsdDogdHJ1ZVxuXG4jIEBUT0RPOiBVc2UgT2JqZWN0LmFzc2lnbigpIHdpdGggQmFiZWxcbnNldHRpbmdzID0gJC5leHRlbmQoIHt9LCBkZWZhdWx0cywgd2luZG93Ll9fcGhvcnQubGlnaHRHYWxsZXJ5IClcblxuXG5zaW5nbGVfaXRlbV9kYXRhID0gKCBpdGVtICkgLT5cblxuXHRpZiBpdGVtLmRhdGEuZ2V0KCAndHlwZScgKSBpcyAndmlkZW8nXG5cdFx0ZnVsbCA9IGl0ZW0uZGF0YS5nZXQoICd2aWRlb191cmwnIClcblx0ZWxzZVxuXHRcdGZ1bGwgPSBpdGVtLmRhdGEudXJsKCAnZnVsbCcgKVxuXG5cdHJldHVybiB7XG5cdFx0c3JjICAgIDogZnVsbFxuXHRcdHRodW1iICA6IGl0ZW0uZGF0YS51cmwoICd0aHVtYicgKVxuXHRcdHN1Ykh0bWw6IGl0ZW0uY2FwdGlvblxuXHR9XG5cblxuZ2V0X3NldHRpbmdzID0gKCBnYWxsZXJ5LCBpbmRleCApIC0+XG5cdHNldHRpbmdzLmluZGV4ICAgICAgICAgPSBpbmRleFxuXHRzZXR0aW5ncy5keW5hbWljRWwgICAgID0gZ2FsbGVyeS5tYXAoIHNpbmdsZV9pdGVtX2RhdGEgKVxuXHRzZXR0aW5ncy52aWRlb01heFdpZHRoID0gd2luZG93LmlubmVyV2lkdGggKiAwLjhcblxuXHRIb29rcy5hcHBseUZpbHRlcnMgJ3Bob3J0LmxpZ2h0R2FsbGVyeS5zZXR0aW5ncycsIHNldHRpbmdzXG5cblxubW9kdWxlLmV4cG9ydHMgPSAoICRlbCApIC0+XG5cdGluc3RhbmNlOiAtPiBHYWxsZXJ5XG5cdGNsb3NlOiAtPlxuXHRcdEdhbGxlcnkgPSAkZWwuZGF0YSggJ2xpZ2h0R2FsbGVyeScgKVxuXHRcdEdhbGxlcnkuZGVzdHJveSggKSBpZiBHYWxsZXJ5IGFuZCBHYWxsZXJ5LmRlc3Ryb3k/XG5cblx0b3BlbjogKCBnYWxsZXJ5X2l0ZW1zLCBpbmRleCApIC0+XG5cdFx0R2FsbGVyeSA9ICRlbC5saWdodEdhbGxlcnkoIGdldF9zZXR0aW5ncyggZ2FsbGVyeV9pdGVtcywgaW5kZXggKSApXG5cblxuXG5cbiIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggXCJqUXVlcnlcIiApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5cbmxhYmVscyA9ICQuZXh0ZW5kKCB7fSwge1xuXHQnZmFjZWJvb2snOiAnU2hhcmUgb24gRmFjZWJvb2snLFxuXHQndHdpdHRlcic6ICdUd2VldCcsXG5cdCdwaW50ZXJlc3QnOiAnUGluIGl0Jyxcbn0sIHdpbmRvdy5fX3Bob3J0LmkxOG4ucGhvdG9zd2lwZSApXG5cblxuZGVmYXVsdHMgPVxuXHRpbmRleCAgICAgICA6IDBcblx0cHJlbG9hZCAgICAgOiBbIDEsIDMgXVxuXHRlc2NLZXkgICAgICA6IGZhbHNlXG5cdHNoYXJlQnV0dG9uczogW1xuXHRcdHsgaWQ6ICdmYWNlYm9vaycsIGxhYmVsOiBsYWJlbHMuZmFjZWJvb2ssIHVybDogJ2h0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS9zaGFyZXIvc2hhcmVyLnBocD91PXt7dXJsfX0nIH1cblx0XHR7IGlkOiAndHdpdHRlcicsIGxhYmVsIDogbGFiZWxzLnR3aXR0ZXIsIHVybDogJ2h0dHBzOi8vdHdpdHRlci5jb20vaW50ZW50L3R3ZWV0P3RleHQ9e3t0ZXh0fX0mdXJsPXt7dXJsfX0nIH1cblx0XHR7IGlkOiAncGludGVyZXN0JywgbGFiZWw6IGxhYmVscy5waW50ZXJlc3QsIHVybDogJ2h0dHA6Ly93d3cucGludGVyZXN0LmNvbS9waW4vY3JlYXRlL2J1dHRvbi8/dXJsPXt7dXJsfX0mbWVkaWE9e3tpbWFnZV91cmx9fSZkZXNjcmlwdGlvbj17e3RleHR9fScgfVxuXHRdXG5cblxucHN3cCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoICcucHN3cCcgKVxuVUkgPSBIb29rcy5hcHBseUZpbHRlcnMoIFwicGhvcnQucGhvdG9zd2lwZS5VSVwiLCB3aW5kb3cuUGhvdG9Td2lwZVVJX0RlZmF1bHQgKVxuUGhvdG9Td2lwZSA9IHdpbmRvdy5QaG90b1N3aXBlXG5cblxuY3JlYXRlID0gKCBkYXRhLCBvcHRzID0ge30gKSAtPlxuXHRvcHRpb25zID0gSG9va3MuYXBwbHlGaWx0ZXJzKCBcInBob3J0LnBob3Rvc3dpcGUub3B0aW9uc1wiLCAkLmV4dGVuZCgge30sIGRlZmF1bHRzLCBvcHRzICkgKVxuXG5cdCMgSW5kZXggaXMgMCBieSBkZWZhdWx0XG5cdGlmIG5vdCBvcHRpb25zLmluZGV4P1xuXHRcdG9wdGlvbnMuaW5kZXggPSAwXG5cblx0IyBTZXQgdGhlIGluZGV4IHRvIDAgaWYgaXQgaXNuJ3QgYSBwcm9wZXIgdmFsdWVcblx0aWYgbm90IG9wdGlvbnMuaW5kZXggb3Igb3B0aW9ucy5pbmRleCA8IDBcblx0XHRvcHRpb25zLmluZGV4ID0gMFxuXG5cdGluc3RhbmNlID0gbmV3IFBob3RvU3dpcGUoIHBzd3AsIFVJLCBkYXRhLCBvcHRpb25zIClcblx0aW5zdGFuY2UuaW5pdCggKVxuXG5cdHJldHVybiBpbnN0YW5jZVxuXG5cbnNpbmdsZV9pdGVtX2RhdGEgPSAoIGl0ZW0gKSAtPlxuXHQjIFBob3RvU3dpcGUgc3VwcG9ydHMgb25seSBpbWFnZXNcblx0cmV0dXJuIGlmIGl0ZW0uZGF0YS5nZXQoICd0eXBlJyApIGlzbnQgJ2ltYWdlJ1xuXG5cblx0W3dpZHRoLCBoZWlnaHRdID0gaXRlbS5kYXRhLnNpemUoICdmdWxsJyApXG5cblx0IyByZXR1cm5cblx0c3JjICA6IGl0ZW0uZGF0YS51cmwoICdmdWxsJyApXG5cdG1zcmMgOiBpdGVtLmRhdGEudXJsKCAnZnVsbCcgKVxuXHR3ICAgIDogd2lkdGhcblx0aCAgICA6IGhlaWdodFxuXHR0aXRsZTogaXRlbS5jYXB0aW9uXG5cblxudGh1bWJuYWlsX3Bvc2l0aW9uID0gKCAkZ2FsbGVyeSApIC0+IHJldHVybiAoIGluZGV4ICkgLT5cblx0cmV0dXJuIGZhbHNlIGlmIG5vdCAkZ2FsbGVyeS5sZW5ndGhcblxuXHQkZWwgPSAkZ2FsbGVyeS5lcSggaW5kZXggKVxuXHR0aHVtYm5haWwgPSAkZWwuZmluZCggJ2ltZycgKS5nZXQoIDAgKVxuXG5cdCMgVGh1bWJuYWlsIG11c3QgZXhpc3QgYmVmb3JlIGRpbWVuc2lvbnMgY2FuIGJlIG9idGFpbmVkXG5cdHJldHVybiBpZiBub3QgdGh1bWJuYWlsXG5cblx0cGFnZVlTY3JvbGwgPSB3aW5kb3cucGFnZVlPZmZzZXQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcFxuXHRyZWN0ID0gdGh1bWJuYWlsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCggKVxuXG5cdCMgLy8gdyA9IHdpZHRoXG5cdG91dCA9XG5cdFx0eDogcmVjdC5sZWZ0XG5cdFx0eTogcmVjdC50b3AgKyBwYWdlWVNjcm9sbFxuXHRcdHc6IHJlY3Qud2lkdGhcblxuXHRyZXR1cm4gb3V0XG5cblxubW9kdWxlLmV4cG9ydHMgPSAoICRlbCApIC0+XG5cdEdhbGxlcnkgPSBmYWxzZVxuXHRpbnN0YW5jZTogLT4gR2FsbGVyeVxuXHRjbG9zZTogLT5cblx0XHRyZXR1cm4gaWYgbm90IEdhbGxlcnlcblx0XHRHYWxsZXJ5LmNsb3NlKCApXG5cdFx0R2FsbGVyeSA9IGZhbHNlXG5cblx0b3BlbjogKCBnYWxsZXJ5LCBpbmRleCApIC0+XG5cdFx0b3B0aW9ucyA9XG5cdFx0XHRnZXRUaHVtYkJvdW5kc0ZuOiB0aHVtYm5haWxfcG9zaXRpb24oICRlbC5jbG9zZXN0KCAnLlBQX0dhbGxlcnknICkuZmluZCggJy5QUF9HYWxsZXJ5X19pdGVtJyApIClcblx0XHRcdGluZGV4ICAgICAgICAgICA6IGluZGV4XG5cblx0XHRHYWxsZXJ5ID0gY3JlYXRlKCBnYWxsZXJ5Lm1hcCggc2luZ2xlX2l0ZW1fZGF0YSApLCBvcHRpb25zIClcblxuXG5cbiIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuSG9va3MgPSByZXF1aXJlKCAnd3BfaG9va3MnIClcbmdhbGVyeV9pdGVtX2RhdGEgPSByZXF1aXJlKCAnLi9nYWxsZXJ5X2l0ZW1fZmFjdG9yeScgKVxuXG5cbnBhcnNlX2dhbGxlcnlfaXRlbSA9ICgga2V5LCBlbCApIC0+XG5cdCRlbCA9ICQoIGVsIClcblxuXHRpbmRleCAgOiBrZXlcblx0ZGF0YSAgIDogZ2FsZXJ5X2l0ZW1fZGF0YSggJGVsIClcblx0Y2FwdGlvbjogJGVsLmZpbmQoICcuUFBfR2FsbGVyeV9fY2FwdGlvbicgKS5odG1sKCApIHx8ICcnXG5cblxubW9kdWxlLmV4cG9ydHMgPSAoIEdhbGxlcnlfRHJpdmVyICkgLT5cblx0aW5zdGFuY2UgPSBmYWxzZVxuXG5cdG9wZW4gPSAoIGVsICkgLT5cblx0XHQkZWwgPSAkKCBlbCApXG5cdFx0JGl0ZW1zID0gJGVsLmNsb3Nlc3QoICcuUFBfR2FsbGVyeScgKS5maW5kKCAnLlBQX0dhbGxlcnlfX2l0ZW0nIClcblxuXHRcdGlmICRpdGVtcy5sZW5ndGggPiAwXG5cdFx0XHRpbmRleCA9ICRpdGVtcy5pbmRleCggJGVsIClcblx0XHRcdGdhbGxlcnlfaXRlbXMgPSAkLm1ha2VBcnJheSggJGl0ZW1zLm1hcCggcGFyc2VfZ2FsbGVyeV9pdGVtICkgKVxuXG5cdFx0XHRpbnN0YW5jZSA9IEdhbGxlcnlfRHJpdmVyKCAkZWwgKVxuXHRcdFx0aW5zdGFuY2Uub3BlbiggZ2FsbGVyeV9pdGVtcywgaW5kZXggKVxuXG5cdFx0XHRIb29rcy5kb0FjdGlvbiggJ3Bob3J0LmdhbGxlcnkub3BlbicsIGluc3RhbmNlLCBnYWxsZXJ5X2l0ZW1zLCBpbmRleCApXG5cblx0XHRyZXR1cm5cblxuXHRvcGVuOiBvcGVuXG5cblx0aGFuZGxlX2hhc2g6IC0+XG5cdFx0aW5kZXggPSBwYXJzZUludCggd2luZG93LmxvY2F0aW9uLmhhc2guc3BsaXQoICcmcGlkPScgKVsgMSBdLCAxMCApXG5cdFx0ZWwgPSAkKCAnLlBQX0dhbGxlcnknICkuZmlyc3QoICkuZmluZCggJy5QUF9HYWxsZXJ5X19pdGVtJyApLmdldCggaW5kZXggKVxuXHRcdG9wZW4oIGVsIClcblxuXHRcdHJldHVyblxuXG5cdGNsb3NlOiAtPlxuXHRcdHJldHVybiBmYWxzZSBpZiBub3QgaW5zdGFuY2VcblxuXHRcdGluc3RhbmNlLmNsb3NlKCApXG5cdFx0aW5zdGFuY2UgPSBmYWxzZVxuXG5cdFx0SG9va3MuZG9BY3Rpb24oICdwaG9ydC5nYWxsZXJ5LmNsb3NlJywgaW5zdGFuY2UgKVxuXHRcdHJldHVybiIsIml0ZW1fZGF0YSA9ICggZGF0YV9vYmogKSAtPlxuXG5cdHBsdWNrID0gKCBvYmplY3QsIGtleSApIC0+XG5cdFx0aWYgb2JqZWN0IGFuZCBvYmplY3RbIGtleSBdXG5cdFx0XHRyZXR1cm4gb2JqZWN0WyBrZXkgXVxuXHRcdHJldHVybiBmYWxzZVxuXG5cdGdldCA9ICgga2V5ICkgLT4gcGx1Y2soIGRhdGFfb2JqLCBrZXkgKVxuXG5cdGltYWdlID0gKCBzaXplX25hbWUgKSAtPiBwbHVjayggZ2V0KCAnaW1hZ2VzJyApLCBzaXplX25hbWUgKVxuXG5cblx0c2l6ZTogKCBzaXplX25hbWUgKSAtPlxuXHRcdGltYWdlX3NpemUgPSBwbHVjayggaW1hZ2UoIHNpemVfbmFtZSApLCAnc2l6ZScgKVxuXHRcdHJldHVybiBmYWxzZSBpZiBub3QgaW1hZ2Vfc2l6ZVxuXG5cdFx0W3dpZHRoLCBoZWlnaHRdID0gaW1hZ2Vfc2l6ZS5zcGxpdCggJ3gnIClcblxuXHRcdHdpZHRoID0gcGFyc2VJbnQoIHdpZHRoIClcblx0XHRoZWlnaHQgPSBwYXJzZUludCggaGVpZ2h0IClcblxuXHRcdHJldHVybiBbIHdpZHRoLCBoZWlnaHQgXVxuXG5cdHVybDogKCBzaXplX25hbWUgKSAtPiBwbHVjayggaW1hZ2UoIHNpemVfbmFtZSApLCAndXJsJyApXG5cdGdldDogZ2V0XG5cblxubW9kdWxlLmV4cG9ydHMgPSBpdGVtX2RhdGEiLCJpdGVtID0gcmVxdWlyZSgnLi9nYWxsZXJ5X2l0ZW1fZGF0YScpXG5cbml0ZW1fZGF0YSA9ICggJGVsICkgLT5cblx0ZGF0YV9vYmogPSAkZWwuZGF0YSggJ2l0ZW0nIClcblxuXHRpZiBub3QgZGF0YV9vYmpcblx0XHR0aHJvdyBuZXcgRXJyb3IgXCJFbGVtZW50IGRvZXNuJ3QgY29udGFpbiBgZGF0YS1pdGVtYCBhdHRyaWJ1dGVcIlxuXG5cdHJldHVybiBpdGVtKCBkYXRhX29iaiApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBpdGVtX2RhdGEiLCJIb29rcyA9IHJlcXVpcmUoXCJ3cF9ob29rc1wiKVxuXG4jXG4jIFRoaXMgZmlsZSBpcyBnb2luZyB0byByZXR1cm4gYSBbR2FsbGVyeSBGYWN0b3J5XSBpbnN0YW5jZVxuIyBFYXN5IFBob3RvZ3JhcGh5IFBvcnRmb2xpbyBpcyB1c2luZyB0aGF0IHRvIG9wZW4vY2xvc2UvZGVzdHJveSBnYWxsZXJpZXNcbiNcbiMgW0dhbGxlcnkgRmFjdG9yeV0gcmVsaWVzIG9uIGEgW0FkYXB0ZXJdXG4jIEluc3RlYWQgb2YgcmVseWluZyBkaXJlY3RseSBvbiBhIGRlcGVuZGVuY3ksIEdhbGxlcnkgRmFjdG9yeSByZWxpZXMgb24gYSBBZGFwdGVyIHRoYXQgY2FuIGJlIG1vZGlmaWVkXG4jIEEgQWRhcHRlciBpcyBhbiBhZGFwdGVyIGZvciBhIFBvcHVwLUdhbGxlcnkgcGx1Z2luLCBzdWNoIGFzIExpZ2h0R2FsbGVyeSBvciBQaG90b1N3aXBlXG4jXG4jIFNvIHdoZW4gYSBnYWxsZXJ5IGlzIG9wZW5lZCwgdGhpcyBpcyBwcm9iYWJseSBob3cgaXQncyBnb2luZyB0byBsb29rOlxuIyBbR2FsbGVyeSBGYWN0b3J5XSBhc2tzIFtBZGFwdGVyXSB0byBmaW5kIGFuZCBvcGVuIGEgZ2FsbGVyeSB3aXRoIFthbnkgTGlnaHRCb3ggTGlicmFyeV1cbiNcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEdhbGxlcnkgQWRhcHRlcjpcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuc2V0dXBfZHJpdmVyID0gKCBkcml2ZXJfbmFtZSA9ICdsaWdodGdhbGxlcnknICkgLT5cblx0aWYgZHJpdmVyX25hbWUgaXMgJ2xpZ2h0Z2FsbGVyeSdcblx0XHRhZGFwdGVyID0gcmVxdWlyZSggJy4vYWRhcHRlcnMvbGlnaHRnYWxsZXJ5JyApXG5cblx0aWYgZHJpdmVyX25hbWUgaXMgJ3Bob3Rvc3dpcGUnXG5cdFx0YWRhcHRlciA9IHJlcXVpcmUoICcuL2FkYXB0ZXJzL3Bob3Rvc3dpcGUnIClcblxuXHRyZXR1cm4gSG9va3MuYXBwbHlGaWx0ZXJzKCAncGhvcnQuZ2FsbGVyeS5kcml2ZXInLCBhZGFwdGVyIClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEdhbGxlcnkgRmFjdG9yeTpcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBUaGUgZ2FsbGVyeSBmYWN0b3J5IGlzIHdoYXQgd2UncmUgaW50ZXJhY3Rpbmcgd2l0aCB0byBvcGVuL2Nsb3NlIGEgZ2FsbGVyeVxuc2V0dXBfZmFjdG9yeSA9IC0+XG5cdGZhY3RvcnkgPSByZXF1aXJlKCAnLi9nYWxsZXJ5X2ZhY3RvcnknIClcblx0cmV0dXJuIEhvb2tzLmFwcGx5RmlsdGVycyggJ3Bob3J0LmdhbGxlcnkuZmFjdG9yeScsIGZhY3RvcnkgKVxuXG4jXG4jIFJldHVybiBhIGZhY3RvcnkgaW5zdGFuY2VcbiNcblxuZ2FsbGVyeV9kcml2ZXIgPSBzZXR1cF9kcml2ZXIoIHdpbmRvdy5fX3Bob3J0LnBvcHVwX2dhbGxlcnkgKVxuZ2FsbGVyeV9mYWN0b3J5ID0gc2V0dXBfZmFjdG9yeSggKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdhbGxlcnlfZmFjdG9yeSggZ2FsbGVyeV9kcml2ZXIgKSIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuSG9va3MgPSByZXF1aXJlKCAnd3BfaG9va3MnIClcbkdhbGxlcnkgPSByZXF1aXJlKCAnLi9wcmVwYXJlX2dhbGxlcnlfZmFjdG9yeScgKVxuXG5Ib29rcy5hZGRBY3Rpb24gJ3Bob3J0LmNvcmUucmVhZHknLCAtPlxuXG5cdGhhbmRsZV9jbGlja3MgPSBIb29rcy5hcHBseUZpbHRlcnMoICdwaG9ydC5nYWxsZXJ5LmhhbmRsZV9jbGlja3MnLCB0cnVlIClcblx0aGFuZGxlX2hhc2ggPSBIb29rcy5hcHBseUZpbHRlcnMoICdwaG9ydC5nYWxsZXJ5LmhhbmRsZV9oYXNoJywgdHJ1ZSApXG5cdGhhbmRsZV9lc2Nfa2V5ID0gSG9va3MuYXBwbHlGaWx0ZXJzKCAncGhvcnQuZ2FsbGVyeS5jdXN0b21fZXNjJywgdHJ1ZSApXG5cblx0IyBIYW5kbGUgSGFzaGNoYW5nZVxuXHRpZiBoYW5kbGVfaGFzaCBhbmQgd2luZG93LmxvY2F0aW9uLmhhc2ggYW5kIEdhbGxlcnkuaGFuZGxlX2hhc2hcblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LmNvcmUubG9hZGVkJywgR2FsbGVyeS5oYW5kbGVfaGFzaFxuXG5cdCMgSGFuZGxlIENsaWNrc1xuXHRpZiBoYW5kbGVfY2xpY2tzXG5cdFx0JCggZG9jdW1lbnQgKS5vbiAnY2xpY2snLCAnLlBQX0dhbGxlcnlfX2l0ZW0nLCAoIGUgKSAtPlxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCggKVxuXHRcdFx0R2FsbGVyeS5vcGVuKCB0aGlzIClcblxuXG5cdCMgSGFuZGxlIEVTQ2FwZSBLZXlcblx0aWYgaGFuZGxlX2VzY19rZXlcblx0XHQkKCB3aW5kb3cgKS5vbiAna2V5ZG93bicsICggZSApIC0+XG5cdFx0XHRyZXR1cm4gdW5sZXNzIGUua2V5IGlzICdFc2NhcGUnXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCApXG5cdFx0XHRHYWxsZXJ5LmNsb3NlKCApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBHYWxsZXJ5XG4iLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuJCA9IHJlcXVpcmUoICdqUXVlcnknIClcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcbmdhbGxlcnlfaXRlbSA9IHJlcXVpcmUoICcuLi9nYWxsZXJ5L2dhbGxlcnlfaXRlbV9mYWN0b3J5JyApXG5fX1dJTkRPVyA9IHJlcXVpcmUoICcuLi9jb3JlL1dpbmRvdycgKVxudGhyb3R0bGUgPSByZXF1aXJlKCcuLi9jb3JlL1V0aWxpdGllcycpLnRocm90dGxlXG5cbmNsYXNzIEFic3RyYWN0X0xhenlfTG9hZGVyXG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdEBFbGVtZW50cyA9XG5cdFx0XHRpdGVtICAgICAgIDogJ1BQX0xhenlfSW1hZ2UnXG5cdFx0XHRwbGFjZWhvbGRlcjogJ1BQX0xhenlfSW1hZ2VfX3BsYWNlaG9sZGVyJ1xuXHRcdFx0bGluayAgICAgICA6ICdQUF9KU19MYXp5X19saW5rJ1xuXHRcdFx0aW1hZ2UgICAgICA6ICdQUF9KU19MYXp5X19pbWFnZSdcblxuXHRcdEBJdGVtcyA9IFtdXG5cblx0XHQjIEFkanVzdGFibGUgU2Vuc2l0aXZpdHkgZm9yIEBpbl92aWV3IGZ1bmN0aW9uXG5cdFx0IyBWYWx1ZSBpbiBwaXhlbHNcblx0XHRAU2Vuc2l0aXZpdHkgPSAxMDBcblxuXHRcdCMgQXV0by1zZXR1cCB3aGVuIGV2ZW50cyBhcmUgYXR0YWNoZWRcblx0XHQjIEF1dG8tZGVzdHJveSB3aGVuIGV2ZW50cyBhcmUgZGV0YWNoZWRcblx0XHRAdGhyb3R0bGVkX2F1dG9sb2FkID0gbnVsbFxuXG5cdFx0QHNldHVwX2l0ZW1zKClcblx0XHRAcmVzaXplX2FsbCgpXG5cdFx0QGF0dGFjaF9ldmVudHMoKVxuXG5cdCMjI1xuXHRcdEFic3RyYWN0IE1ldGhvZHNcblx0IyMjXG5cblx0IyBUaGlzIGlzIHJ1biB3aGVuIGEgcmVzaXplIG9yIHJlZnJlc2ggZXZlbnQgaXMgZGV0ZWN0ZWRcblx0cmVzaXplOiAtPiByZXR1cm5cblxuXHRsb2FkOiAoIGl0ZW0gKSAtPlxuXHRcdEBsb2FkX2ltYWdlKCBpdGVtIClcblx0XHRpdGVtLiRlbC5pbWFnZXNMb2FkZWQgPT5cblx0XHRcdEBjbGVhbnVwX2FmdGVyX2xvYWQoIGl0ZW0gKVxuXG5cdGxvYWRfaW1hZ2U6ICggaXRlbSApIC0+XG5cblx0XHQjIEdldCBpbWFnZSBVUkxzXG5cdFx0dGh1bWIgPSBpdGVtLmRhdGEudXJsKCAndGh1bWInIClcblx0XHRmdWxsID0gaXRlbS5kYXRhLnVybCggJ2Z1bGwnIClcblxuXHRcdCMgQ3JlYXRlIGVsZW1lbnRzXG5cdFx0aXRlbS4kZWxcblx0XHRcdC5wcmVwZW5kKCBAZ2V0X2l0ZW1faHRtbCggdGh1bWIsIGZ1bGwgKSApXG5cdFx0XHQucmVtb3ZlQ2xhc3MoICdMYXp5LUltYWdlJyApXG5cblx0XHQjIE1ha2Ugc3VyZSB0aGlzIGltYWdlIGlzbid0IGxvYWRlZCBhZ2FpblxuXHRcdGl0ZW0ubG9hZGVkID0gdHJ1ZVxuXG5cdGNsZWFudXBfYWZ0ZXJfbG9hZDogKCBpdGVtICkgLT5cblx0XHQjIEFkZCBpbWFnZSBQUF9KU19sb2FkZWQgY2xhc3Ncblx0XHRpdGVtLiRlbC5maW5kKCAnaW1nJyApLmFkZENsYXNzKCAnUFBfSlNfX2xvYWRlZCcgKS5yZW1vdmVDbGFzcyggJ1BQX0pTX19sb2FkaW5nJyApXG5cblx0XHRpdGVtLiRlbFxuXG5cdFx0XHQjIFJlbW92ZSBgUFBfTGF6eV9JbWFnZWAsIGFzIHRoaXMgaXMgbm90IGEgbGF6eS1sb2FkYWJsZSBpbWFnZSBhbnltb3JlXG5cdFx0XHQucmVtb3ZlQ2xhc3MoIEBFbGVtZW50cy5pdGVtIClcblxuXHRcdFx0IyBSZW1vdmUgUGxhY2Vob2xkZXJcblx0XHRcdC5maW5kKCBcIi4je0BFbGVtZW50cy5wbGFjZWhvbGRlcn1cIiApXG5cdFx0XHQuZmFkZU91dCggNDAwLCAtPiAkKCB0aGlzICkucmVtb3ZlKCkgKVxuXG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LmxhenkubG9hZGVkX2l0ZW0nLCBpdGVtXG5cblxuXHRnZXRfaXRlbV9odG1sOiAoIHRodW1iLCBmdWxsICkgLT5cblxuXHRcdGlmICdkaXNhYmxlJyBpcyB3aW5kb3cuX19waG9ydC5wb3B1cF9nYWxsZXJ5XG5cdFx0XHRyZXR1cm4gXCJcIlwiXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiI3tARWxlbWVudHMubGlua31cIiByZWw9XCJnYWxsZXJ5XCI+XG5cdFx0XHRcdDxpbWcgY2xhc3M9XCIje0BFbGVtZW50cy5pbWFnZX1cIiBzcmM9XCIje3RodW1ifVwiIGNsYXNzPVwiUFBfSlNfX2xvYWRpbmdcIiAvPlxuXHRcdFx0PC9kaXY+XG5cdFx0XHRcIlwiXCJcblx0XHRlbHNlXG5cdFx0XHRyZXR1cm4gXCJcIlwiXG5cdFx0XHQ8YSBjbGFzcz1cIiN7QEVsZW1lbnRzLmxpbmt9XCIgaHJlZj1cIiN7ZnVsbH1cIiByZWw9XCJnYWxsZXJ5XCI+XG5cdFx0XHRcdDxpbWcgY2xhc3M9XCIje0BFbGVtZW50cy5pbWFnZX1cIiBzcmM9XCIje3RodW1ifVwiIGNsYXNzPVwiUFBfSlNfX2xvYWRpbmdcIiAvPlxuXHRcdFx0PC9hPlxuXHRcdFx0XCJcIlwiXG5cblx0c2V0dXBfaXRlbXM6ID0+XG5cdFx0IyBDbGVhciBleGlzdGluZyBpdGVtcywgaWYgYW55XG5cdFx0QEl0ZW1zID0gW11cblxuXHRcdCMgTG9vcCBvdmVyIERPTSBhbmQgYWRkIGVhY2ggaXRlbSB0byBASXRlbXNcblx0XHQkKCBcIi4je0BFbGVtZW50cy5pdGVtfVwiICkuZWFjaCggQGFkZF9pdGVtIClcblx0XHRyZXR1cm5cblxuXHRhZGRfaXRlbTogKCBrZXksIGVsICkgPT5cblx0XHQkZWwgPSAkKCBlbCApXG5cdFx0QEl0ZW1zLnB1c2hcblx0XHRcdGVsICAgIDogZWxcblx0XHRcdCRlbCAgIDogJGVsXG5cdFx0XHRkYXRhICA6IGdhbGxlcnlfaXRlbSggJGVsIClcblx0XHRcdGxvYWRlZDogZmFsc2VcblxuXG5cdFx0cmV0dXJuXG5cblxuXHQjIyNcblx0XHRNZXRob2RzXG5cdCMjI1xuXHRyZXNpemVfYWxsOiAtPlxuXHRcdEByZXNpemUoIGl0ZW0gKSBmb3IgaXRlbSBpbiBASXRlbXNcblxuXG5cblx0IyBBdXRvbWF0aWNhbGx5IExvYWQgYWxsIGl0ZW1zIHRoYXQgYXJlIGBpbl9sb29zZV92aWV3YFxuXHRhdXRvbG9hZDogPT5cblx0XHRmb3IgaXRlbSwga2V5IGluIEBJdGVtc1xuXHRcdFx0aWYgbm90IGl0ZW0ubG9hZGVkIGFuZCBAaW5fbG9vc2VfdmlldyggaXRlbS5lbCApXG5cdFx0XHRcdEBsb2FkKCBpdGVtIClcblxuXHRpbl9sb29zZV92aWV3OiAoIGVsICkgLT5cblx0XHRyZXR1cm4gdHJ1ZSBpZiBub3QgZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0P1xuXHRcdHJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuXG5cdFx0IyBFbGVtZW50cyBub3QgaW4gdmlldyBpZiB0aGV5IGRvbid0IGhhdmUgZGltZW5zaW9uc1xuXHRcdHJldHVybiBmYWxzZSBpZiByZWN0LmhlaWdodCBpcyAwIGFuZCByZWN0LndpZHRoIGlzIDBcblxuXG5cdFx0cmV0dXJuIChcblx0XHRcdCMgWSBBeGlzXG5cdFx0XHRyZWN0LnRvcCArIHJlY3QuaGVpZ2h0ID49IC1AU2Vuc2l0aXZpdHkgYW5kICMgdG9wXG5cdFx0XHRyZWN0LmJvdHRvbSAtIHJlY3QuaGVpZ2h0IDw9IF9fV0lORE9XLmhlaWdodCArIEBTZW5zaXRpdml0eSBhbmRcblxuXHRcdFx0IyBYIEF4aXNcblx0XHRcdHJlY3QubGVmdCArIHJlY3Qud2lkdGggPj0gLUBTZW5zaXRpdml0eSBhbmRcblx0XHRcdHJlY3QucmlnaHQgLSByZWN0LndpZHRoIDw9IF9fV0lORE9XLndpZHRoICsgQFNlbnNpdGl2aXR5XG5cblx0XHQpXG5cblx0ZGVzdHJveTogLT5cblx0XHRAZGV0YWNoX2V2ZW50cygpXG5cblx0YXR0YWNoX2V2ZW50czogLT5cblx0XHQjIENyZWF0ZSBhIGRlYm91bmNlZCBgYXV0b2xvYWRgIGZ1bmN0aW9uXG5cdFx0QHRocm90dGxlZF9hdXRvbG9hZCA9IHRocm90dGxlKCBAYXV0b2xvYWQsIDUwIClcblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5yZWZyZXNoJywgQHRocm90dGxlZF9hdXRvbG9hZCwgMTAwXG5cblxuXHRkZXRhY2hfZXZlbnRzOiAtPlxuXHRcdCMgQ2xlYXIgdGhlIGRlYm91bmNlZCBmdW5jdGlvbiBmcm9tIGluc3RhbmNlXG5cdFx0QHRocm90dGxlZF9hdXRvbG9hZCA9IG51bGxcblx0XHRIb29rcy5yZW1vdmVBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5yZWZyZXNoJywgQHRocm90dGxlZF9hdXRvbG9hZCwgMTAwXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFic3RyYWN0X0xhenlfTG9hZGVyXG4iLCIkID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuQWJzdHJhY3RfTGF6eV9Mb2FkZXIgPSByZXF1aXJlKCAnLi9BYnN0cmFjdF9MYXp5X0xvYWRlcicgKVxuX19XSU5ET1cgPSByZXF1aXJlKCAnLi4vY29yZS9XaW5kb3cnIClcblxuY2xhc3MgTGF6eV9NYXNvbnJ5IGV4dGVuZHMgQWJzdHJhY3RfTGF6eV9Mb2FkZXJcblxuXHRyZXNpemVfYWxsOiAtPlxuXHRcdEBwbGFjZWhvbGRlcl93aWR0aCA9ICQoICcuUFBfTWFzb25yeV9fc2l6ZXInICkud2lkdGgoKVxuXHRcdHN1cGVyKClcblxuXHRyZXNpemU6ICggaXRlbSApIC0+XG5cdFx0aXRlbS4kZWwuY3NzICdtaW4taGVpZ2h0JzogTWF0aC5mbG9vciggQHBsYWNlaG9sZGVyX3dpZHRoIC8gaXRlbS5kYXRhLmdldCgncmF0aW8nKSApXG5cblx0Y2xlYW51cF9hZnRlcl9sb2FkOiAoaXRlbSkgLT5cblx0XHQjIFJlbW92ZSBtaW4taGVpZ2h0XG5cdFx0aXRlbS4kZWwuY3NzKCAnbWluLWhlaWdodCcsICcnIClcblxuXHRcdCMgUnVuIGFsbCBvdGhlciBjbGVhbnVwc1xuXHRcdHN1cGVyKCBpdGVtIClcblxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCdcblxuXHRcdHJldHVyblxuXG5cdGF0dGFjaF9ldmVudHM6IC0+XG5cdFx0IyBDYWxsIFBhcmVudCBmaXJzdCwgaXQncyBnb2luZyB0byBjcmVhdGUgQHRocm90dGxlZF9hdXRvbG9hZFxuXHRcdHN1cGVyKClcblxuXHRcdCMgQXR0YWNoXG5cdFx0JCggd2luZG93ICkub24gJ3Njcm9sbCcsIEB0aHJvdHRsZWRfYXV0b2xvYWRcblxuXG5cblx0ZGV0YWNoX2V2ZW50czogLT5cblx0XHQjIERldGFjaFxuXHRcdCQoIHdpbmRvdyApLm9mZiAnc2Nyb2xsJywgQHRocm90dGxlZF9hdXRvbG9hZFxuXG5cdFx0IyBDYWxsIHBhcmVudCBsYXN0LCBpdCdzIGdvaW5nIHRvIGNsZWFuIHVwIEB0aHJvdHRsZWRfYXV0b2xvYWRcblx0XHRzdXBlcigpXG5cblx0ZGVzdHJveTogLT5cblx0XHRmb3IgaXRlbSwga2V5IGluIEBJdGVtc1xuXHRcdFx0aXRlbS4kZWwuY3NzICdtaW4taGVpZ2h0JywgJydcblx0XHRzdXBlcigpXG5cblxubW9kdWxlLmV4cG9ydHMgPSBMYXp5X01hc29ucnlcbiIsIiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoICd3cF9ob29rcycgKVxuXG5cbmluc3RhbmNlID0gZmFsc2VcblxuZGVzdHJveSA9IC0+XG5cdHJldHVybiBpZiBub3QgaW5zdGFuY2Vcblx0aW5zdGFuY2UuZGVzdHJveSggKVxuXHRpbnN0YW5jZSA9IG51bGxcblxuY3JlYXRlID0gLT5cblxuXHQjIE1ha2Ugc3VyZSBhbiBpbnN0YW5jZSBkb2Vzbid0IGFscmVhZHkgZXhpc3Rcblx0ZGVzdHJveSggKVxuXG5cdCMgSGFuZGxlciByZXF1aXJlZFxuXHRIYW5kbGVyID0gSG9va3MuYXBwbHlGaWx0ZXJzICdwaG9ydC5sYXp5LmhhbmRsZXInLCBmYWxzZVxuXHRyZXR1cm4gaWYgbm90IEhhbmRsZXJcblxuXHQjIEJ5IGRlZmF1bHQgTGF6eV9NYXNvbnJ5IGlzIGhhbmRsaW5nIExhenktTG9hZGluZ1xuXHQjIENoZWNrIGlmIGFueW9uZSB3YW50cyB0byBoaWphY2sgaGFuZGxlclxuXHRpbnN0YW5jZSA9IG5ldyBIYW5kbGVyKCApXG5cblx0cmV0dXJuXG5cblxuIyBJbml0aWFsaXplIGxhenkgbG9hZGVyIGFmdGVyIHRoZSBwb3J0Zm9saW8gaXMgcHJlcGFyZWQsIHAgPSAxMDBcbkhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnLCBjcmVhdGUsIDEwMFxuSG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScsIGRlc3Ryb3lcblxubW9kdWxlLmV4cG9ydHMgPVxuXHRjcmVhdGUgOiBjcmVhdGVcblx0ZGVzdHJveTogZGVzdHJveSIsIkhvb2tzID0gcmVxdWlyZSggJ3dwX2hvb2tzJyApXG5cbiMjI1xuXG4gICAgIyBJbml0aWFsaXplIFBvcnRmb2xpbyBDb3JlXG5cdC0tLVxuXHRcdFVzaW5nIHA1MCBAIGBwaG9ydC5jb3JlLnJlYWR5YFxuXHRcdExhdGUgcHJpb3JpdHkgaXMgZ29pbmcgdG8gZm9yY2UgZXhwbGljaXQgcHJpb3JpdHkgaW4gYW55IG90aGVyIG1vdmluZyBwYXJ0cyB0aGF0IGFyZSBnb2luZyB0byB0b3VjaCBwb3J0Zm9saW8gbGF5b3V0IGF0IGBwaG9ydC5sb2FkZWRgXG5cdC0tLVxuXG4jIyNcbm1vZHVsZS5leHBvcnRzID1cblxuXHRwcmVwYXJlOiAtPlxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZSdcblx0XHRyZXR1cm5cblxuXHRjcmVhdGU6IC0+XG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5jcmVhdGUnXG5cdFx0cmV0dXJuXG5cblxuXHRyZWZyZXNoOiAtPlxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCdcblx0XHRyZXR1cm5cblxuXG5cdGRlc3Ryb3k6IC0+XG5cdFx0IyBEZXN0cm95XG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95J1xuXHRcdHJldHVyblxuIiwiSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuXG5cbiMjI1xuXHRBYnN0cmFjdCBDbGFzcyBQb3J0b2ZsaW9fRXZlbnRfSW1lcGxlbWVudGF0aW9uXG5cbiAgICBIYW5kbGVzIGFsbCB0aGUgZXZlbnRzIHJlcXVpcmVkIHRvIGZ1bGx5IGhhbmRsZSBhIHBvcnRmb2xpbyBsYXlvdXQgcHJvY2Vzc1xuIyMjXG5jbGFzcyBQb3J0Zm9saW9fSW50ZXJmYWNlXG5cblx0Y29uc3RydWN0b3I6ICggYXJncyApIC0+XG5cdFx0QHNldHVwX2FjdGlvbnMoKVxuXHRcdEBpbml0aWFsaXplKCBhcmdzIClcblxuXHRzZXR1cF9hY3Rpb25zOiAtPlxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnLCBAcHJlcGFyZSwgNTBcblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5jcmVhdGUnLCBAY3JlYXRlLCA1MFxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCBAcmVmcmVzaCwgNTBcblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgQGRlc3Ryb3ksIDUwXG5cdFx0SG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScsIEBwdXJnZV9hY3Rpb25zLCAxMDBcblxuXHRwdXJnZV9hY3Rpb25zOiA9PlxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnLCBAcHJlcGFyZSwgNTBcblx0XHRIb29rcy5yZW1vdmVBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5jcmVhdGUnLCBAY3JlYXRlLCA1MFxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCBAcmVmcmVzaCwgNTBcblx0XHRIb29rcy5yZW1vdmVBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgQGRlc3Ryb3ksIDUwXG5cdFx0SG9va3MucmVtb3ZlQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScsIEBwdXJnZV9hY3Rpb25zLCAxMDBcblxuXG5cdCMjI1xuICAgIFx0UmVxdWlyZSB0aGVzZSBtZXRob2RzXG5cdCMjI1xuXHRpbml0aWFsaXplOiAtPiB0aHJvdyBuZXcgRXJyb3IoIFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGBpbml0aWFsaXplYCBtZXRob2RcIiApXG5cdHByZXBhcmUgICA6IC0+IHRocm93IG5ldyBFcnJvciggXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYHByZXBhcmVgIG1ldGhvZFwiIClcblx0Y3JlYXRlICAgIDogLT4gdGhyb3cgbmV3IEVycm9yKCBcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgY3JlYXRlYCBtZXRob2RcIiApXG5cdHJlZnJlc2ggICA6IC0+IHRocm93IG5ldyBFcnJvciggXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYHJlZnJlc2hgIG1ldGhvZFwiIClcblx0ZGVzdHJveSAgIDogLT4gdGhyb3cgbmV3IEVycm9yKCBcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgZGVzdHJveWAgbWV0aG9kXCIgKVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW9fSW50ZXJmYWNlIiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5Qb3J0Zm9saW9fSW50ZXJmYWNlID0gcmVxdWlyZSggJy4vUG9ydGZvbGlvX0ludGVyZmFjZScgKVxuXG4jIEBUT0RPOiBOZWVkIGEgaGVhdnZ5IHJlZmFjdG9yIC0gbm8gbW9yZSBjbGFzc2VzIHBsZWFzZVxuY2xhc3MgUG9ydGZvbGlvX01hc29ucnkgZXh0ZW5kcyBQb3J0Zm9saW9fSW50ZXJmYWNlXG5cblx0Y29uc3RydWN0b3I6IC0+XG5cblx0XHRARWxlbWVudHMgPVxuXHRcdFx0Y29udGFpbmVyOiAnUFBfTWFzb25yeSdcblx0XHRcdHNpemVyICAgIDogJ1BQX01hc29ucnlfX3NpemVyJ1xuXHRcdFx0aXRlbSAgICAgOiAnUFBfTWFzb25yeV9faXRlbSdcblxuXHRcdHN1cGVyKClcblxuXHQjIyNcblx0XHRJbml0aWFsaXplXG5cdCMjI1xuXHRpbml0aWFsaXplOiAtPlxuXHRcdEAkY29udGFpbmVyID0gJCggXCIuI3tARWxlbWVudHMuY29udGFpbmVyfVwiIClcblxuXHQjIyNcblx0XHRQcmVwYXJlICYgQXR0YWNoIEV2ZW50c1xuICAgIFx0RG9uJ3Qgc2hvdyBhbnl0aGluZyB5ZXQuXG5cblx0XHRAY2FsbGVkIG9uIGhvb2sgYHBob3J0LnBvcnRmb2xpby5wcmVwYXJlYFxuXHQjIyNcblx0cHJlcGFyZTogPT5cblx0XHRyZXR1cm4gaWYgQCRjb250YWluZXIubGVuZ3RoIGlzIDBcblxuXHRcdEAkY29udGFpbmVyLmFkZENsYXNzKCAnUFBfSlNfX2xvYWRpbmdfbWFzb25yeScgKVxuXG5cdFx0QG1heWJlX2NyZWF0ZV9zaXplcigpXG5cblx0XHQjIE9ubHkgaW5pdGlhbGl6ZSwgaWYgbm8gbWFzb25yeSBleGlzdHNcblx0XHRtYXNvbnJ5X3NldHRpbmdzID0gSG9va3MuYXBwbHlGaWx0ZXJzICdwaG9ydC5tYXNvbnJ5LnNldHRpbmdzJyxcblx0XHRcdGl0ZW1TZWxlY3RvcjogXCIuI3tARWxlbWVudHMuaXRlbX1cIlxuXHRcdFx0Y29sdW1uV2lkdGggOiBcIi4je0BFbGVtZW50cy5zaXplcn1cIlxuXHRcdFx0Z3V0dGVyICAgICAgOiAwXG5cdFx0XHRpbml0TGF5b3V0ICA6IGZhbHNlXG5cblx0XHRAJGNvbnRhaW5lci5tYXNvbnJ5KCBtYXNvbnJ5X3NldHRpbmdzIClcblxuXHRcdEAkY29udGFpbmVyLm1hc29ucnkgJ29uY2UnLCAnbGF5b3V0Q29tcGxldGUnLCA9PlxuXHRcdFx0QCRjb250YWluZXJcblx0XHRcdFx0LnJlbW92ZUNsYXNzKCAnUFBfSlNfX2xvYWRpbmdfbWFzb25yeScgKVxuXHRcdFx0XHQuYWRkQ2xhc3MoICdQUF9KU19fbG9hZGluZ19jb21wbGV0ZScgKVxuXG5cdFx0XHQjIEB0cmlnZ2VyIHJlZnJlc2ggZXZlbnRcblx0XHRcdCMgdHJpZ2dlcnMgYEByZWZyZXNoKClgXG5cdFx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnXG5cblxuXHQjIyNcblx0XHRTdGFydCB0aGUgUG9ydGZvbGlvXG5cdFx0QGNhbGxlZCBvbiBob29rIGBwaG9ydC5wb3J0Zm9saW8uY3JlYXRlYFxuXHQjIyNcblx0Y3JlYXRlOiA9PlxuXHRcdEAkY29udGFpbmVyLm1hc29ucnkoKVxuXHRcdHJldHVyblxuXG5cblx0IyMjXG5cdFx0RGVzdHJveVxuXHRcdEBjYWxsZWQgb24gaG9vayBgcGhvcnQucG9ydGZvbGlvLmRlc3Ryb3lgXG5cdCMjI1xuXHRkZXN0cm95OiA9PlxuXHRcdEBtYXliZV9yZW1vdmVfc2l6ZXIoKVxuXG5cdFx0aWYgQCRjb250YWluZXIubGVuZ3RoID4gMFxuXHRcdFx0QCRjb250YWluZXIubWFzb25yeSggJ2Rlc3Ryb3knIClcblxuXG5cdFx0cmV0dXJuXG5cblxuXHQjIyNcblx0XHRSZWxvYWQgdGhlIGxheW91dFxuXHRcdEBjYWxsZWQgb24gaG9vayBgcGhvcnQucG9ydGZvbGlvLnJlZnJlc2hgXG5cdCMjI1xuXHRyZWZyZXNoOiA9PlxuXHRcdEAkY29udGFpbmVyLm1hc29ucnkoICdsYXlvdXQnIClcblxuXG5cblx0IyMjXG5cdFx0Q3JlYXRlIGEgc2l6ZXIgZWxlbWVudCBmb3IganF1ZXJ5LW1hc29ucnkgdG8gdXNlXG5cdCMjI1xuXHRtYXliZV9jcmVhdGVfc2l6ZXI6IC0+XG5cdFx0QGNyZWF0ZV9zaXplcigpIGlmIEBzaXplcl9kb2VzbnRfZXhpc3QoKVxuXHRcdHJldHVyblxuXG5cdG1heWJlX3JlbW92ZV9zaXplcjogLT5cblx0XHRyZXR1cm4gaWYgQCRjb250YWluZXIubGVuZ3RoIGlzbnQgMVxuXHRcdEAkY29udGFpbmVyLmZpbmQoIFwiLiN7QEVsZW1lbnRzLnNpemVyfVwiICkucmVtb3ZlKClcblx0XHRyZXR1cm5cblxuXHRzaXplcl9kb2VzbnRfZXhpc3Q6IC0+IEAkY29udGFpbmVyLmZpbmQoIFwiLiN7QEVsZW1lbnRzLnNpemVyfVwiICkubGVuZ3RoIGlzIDBcblxuXG5cdGNyZWF0ZV9zaXplcjogLT5cblx0XHRAJGNvbnRhaW5lci5hcHBlbmQgXCJcIlwiPGRpdiBjbGFzcz1cIiN7QEVsZW1lbnRzLnNpemVyfVwiPjwvZGl2PlwiXCJcIlxuXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gUG9ydGZvbGlvX01hc29ucnkiLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuJCA9IHJlcXVpcmUoICdqUXVlcnknIClcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcblxuIyBQb3J0Zm9saW8gbWFuYWdlciB3aWxsIHRyaWdnZXIgcG9ydGZvbGlvIGV2ZW50cyB3aGVuIG5lY2Vzc2FyeVxuVHJpZ2dlciA9IHJlcXVpcmUoICcuL1BvcnRmb2xpb19FdmVudHMnIClcblxuaXNfbWFzb25yeSA9IC0+XG5cdHJldHVybiAoICQoICcuUFBfTWFzb25yeScgKS5sZW5ndGggaXNudCAwIClcblxuIyBTdGFydCBNYXNvbnJ5IExheW91dFxuc3RhcnRfbWFzb25yeSA9IC0+XG5cdHJldHVybiBmYWxzZSBpZiBub3QgaXNfbWFzb25yeSgpXG5cblx0UG9ydGZvbGlvX01hc29ucnkgPSByZXF1aXJlKCAnLi9Qb3J0Zm9saW9fTWFzb25yeScgKVxuXHRuZXcgUG9ydGZvbGlvX01hc29ucnkoKVxuXG5tYXliZV9sYXp5X21hc29ucnkgPSAoIGhhbmRsZXIgKSAtPlxuXHQjIFVzZSBMYXp5X01hc29ucnkgaGFuZGxlciwgaWYgY3VycmVudCBsYXlvdXQgaXMgbWFzb25yeVxuXHRyZXR1cm4gcmVxdWlyZSggJ2xhenkvTGF6eV9NYXNvbnJ5JyApIGlmIGlzX21hc29ucnkoKVxuXHRyZXR1cm4gaGFuZGxlclxuXG5cbiMgU3RhcnQgUG9ydGZvbGlvXG5Ib29rcy5hZGRBY3Rpb24gJ3Bob3J0LmNvcmUucmVhZHknLCBUcmlnZ2VyLnByZXBhcmUsIDUwXG5Ib29rcy5hZGRBY3Rpb24gJ3Bob3J0LmNvcmUubG9hZGVkJywgVHJpZ2dlci5jcmVhdGUsIDUwXG5cbiMgSW5pdGlhbGl6ZSBNYXNvbnJ5IExheW91dFxuSG9va3MuYWRkQWN0aW9uICdwaG9ydC5jb3JlLnJlYWR5Jywgc3RhcnRfbWFzb25yeVxuXG4jIEluaXRpYWxpemUgTGF6eSBMb2FkaW5nIGZvciBNYXNvbnJ5IExheW91dFxuSG9va3MuYWRkRmlsdGVyICdwaG9ydC5sYXp5LmhhbmRsZXInLCBtYXliZV9sYXp5X21hc29ucnlcblxuXG5cbiJdfQ==
