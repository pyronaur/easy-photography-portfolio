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
      Hooks.doAction('phort.gallery.open', instance);
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


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jb3JlL1V0aWxpdGllcy5qcyIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jb3JlL1dpbmRvdy5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY29yZS9zdGFydC5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvZ2FsbGVyeS9hZGFwdGVycy9saWdodGdhbGxlcnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvYWRhcHRlcnMvcGhvdG9zd2lwZS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvZ2FsbGVyeS9nYWxsZXJ5X2ZhY3RvcnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvZ2FsbGVyeV9pdGVtX2RhdGEuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvZ2FsbGVyeV9pdGVtX2ZhY3RvcnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvcHJlcGFyZV9nYWxsZXJ5X2ZhY3RvcnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvc3RhcnQuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvQWJzdHJhY3RfTGF6eV9Mb2FkZXIuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvTGF6eV9NYXNvbnJ5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L3N0YXJ0LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9wb3J0Zm9saW8vUG9ydGZvbGlvX0V2ZW50cy5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL1BvcnRmb2xpb19JbnRlcmZhY2UuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL3BvcnRmb2xpby9Qb3J0Zm9saW9fTWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL3N0YXJ0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7OztBQUFBLElBQUE7O0FBR0EsS0FBQSxHQUFRLE9BQUEsQ0FBUyxVQUFUOztBQUNSLENBQUEsR0FBSSxPQUFBLENBQVMsUUFBVDs7QUFHSixNQUFNLENBQUMsVUFBUCxHQUVDO0VBQUEsbUJBQUEsRUFBcUIsT0FBQSxDQUFTLGlDQUFULENBQXJCO0VBR0EsT0FBQSxFQUNDO0lBQUEsU0FBQSxFQUFjLE9BQUEsQ0FBUyw2QkFBVCxDQUFkO0lBQ0EsWUFBQSxFQUFjLE9BQUEsQ0FBUyxnQ0FBVCxDQURkO0dBSkQ7RUFRQSxvQkFBQSxFQUFzQixPQUFBLENBQVMsNkJBQVQsQ0FSdEI7OztBQVdELE1BQU0sQ0FBQyxxQkFBUCxHQUNDO0VBQUEsSUFBQSxFQUFrQixPQUFBLENBQVMsY0FBVCxDQUFsQjtFQUNBLGdCQUFBLEVBQWtCLE9BQUEsQ0FBUyxtQkFBVCxDQURsQjtFQUVBLE9BQUEsRUFBa0IsT0FBQSxDQUFTLGlCQUFULENBRmxCO0VBR0EsV0FBQSxFQUFrQixPQUFBLENBQVMsY0FBVCxDQUhsQjs7OztBQUtEOzs7O0FBR0EsQ0FBQSxDQUFHLFFBQUgsQ0FBYSxDQUFDLEtBQWQsQ0FBb0IsU0FBQTtFQUduQixJQUFVLENBQUksQ0FBQSxDQUFHLE1BQUgsQ0FBVyxDQUFDLFFBQVosQ0FBc0IsY0FBdEIsQ0FBZDtBQUFBLFdBQUE7O0VBR0EscUJBQXFCLENBQUMsSUFBSSxDQUFDLEtBQTNCLENBQUE7QUFObUIsQ0FBcEI7Ozs7OztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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aUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxLQUEzQixHQUFpQyxXQUFwRDtFQURhOzs7O0dBaEdpQjs7QUFxR2hDLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7Ozs7OztBQzdHakI7OztBQUFBLElBQUE7O0FBR0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUyxRQUFUOztBQUNKLEtBQUEsR0FBUSxPQUFBLENBQVMsVUFBVDs7QUFHUixPQUFBLEdBQVUsT0FBQSxDQUFTLG9CQUFUOztBQUVWLFVBQUEsR0FBYSxTQUFBO0FBQ1osU0FBUyxDQUFBLENBQUcsYUFBSCxDQUFrQixDQUFDLE1BQW5CLEtBQStCO0FBRDVCOztBQUliLGFBQUEsR0FBZ0IsU0FBQTtBQUNmLE1BQUE7RUFBQSxJQUFnQixDQUFJLFVBQUEsQ0FBQSxDQUFwQjtBQUFBLFdBQU8sTUFBUDs7RUFFQSxpQkFBQSxHQUFvQixPQUFBLENBQVMscUJBQVQ7U0FDcEIsSUFBSSxpQkFBSixDQUFBO0FBSmU7O0FBTWhCLGtCQUFBLEdBQXFCLFNBQUUsT0FBRjtFQUVwQixJQUF5QyxVQUFBLENBQUEsQ0FBekM7QUFBQSxXQUFPLE9BQUEsQ0FBUyxtQkFBVCxFQUFQOztBQUNBLFNBQU87QUFIYTs7QUFPckIsS0FBSyxDQUFDLFNBQU4sQ0FBZ0Isa0JBQWhCLEVBQW9DLE9BQU8sQ0FBQyxPQUE1QyxFQUFxRCxFQUFyRDs7QUFDQSxLQUFLLENBQUMsU0FBTixDQUFnQixtQkFBaEIsRUFBcUMsT0FBTyxDQUFDLE1BQTdDLEVBQXFELEVBQXJEOztBQUdBLEtBQUssQ0FBQyxTQUFOLENBQWdCLGtCQUFoQixFQUFvQyxhQUFwQzs7QUFHQSxLQUFLLENBQUMsU0FBTixDQUFnQixvQkFBaEIsRUFBc0Msa0JBQXRDIiwiZmlsZSI6InBob3RvZ3JhcGh5LXBvcnRmb2xpby5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiIyMjXG4gICAgTG9hZCBEZXBlbmRlbmNpZXNcbiMjI1xuSG9va3MgPSByZXF1aXJlKCAnd3BfaG9va3MnIClcbiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5cbiMgRXhwb3NlIHNvbWUgUGhvdG9ncmFwaHkgUG9ydGZvbGlvIG1vZHVsZXMgdG8gdGhlIHB1YmxpYyBmb3IgZXh0ZW5zaWJpbGl0eVxud2luZG93LlBQX01vZHVsZXMgPVxuXHQjIEV4dGVuZCBQb3J0Zm9saW8gSW50ZXJmYWNlIHRvIGJ1aWxkIGN1c3RvbSBwb3J0Zm9saW8gbGF5b3V0cyBiYXNlZCBvbiBQUCBFdmVudHNcblx0UG9ydGZvbGlvX0ludGVyZmFjZTogcmVxdWlyZSggJy4vcG9ydGZvbGlvL1BvcnRmb2xpb19JbnRlcmZhY2UnIClcblxuIyBVc2UgYGdhbGxlcnlfaXRlbV9kYXRhYCB0byBnZXQgZm9ybWF0dGVkIGl0ZW0gaW1hZ2Ugc2l6ZXMgZm9yIGxhenkgbG9hZGluZ1xuXHRnYWxsZXJ5OlxuXHRcdGl0ZW1fZGF0YSAgIDogcmVxdWlyZSggJy4vZ2FsbGVyeS9nYWxsZXJ5X2l0ZW1fZGF0YScgKVxuXHRcdGl0ZW1fZmFjdG9yeTogcmVxdWlyZSggJy4vZ2FsbGVyeS9nYWxsZXJ5X2l0ZW1fZmFjdG9yeScgKVxuXG4jIEV4dGVuZCBBYnN0cmFjdF9MYXp5X0xvZGVyIHRvIGltcGxlbWVudCBsYXp5IGxvYWRlciBmb3IgeW91ciBsYXlvdXRcblx0QWJzdHJhY3RfTGF6eV9Mb2FkZXI6IHJlcXVpcmUoICcuL2xhenkvQWJzdHJhY3RfTGF6eV9Mb2FkZXInIClcblxuXG53aW5kb3cuUGhvdG9ncmFwaHlfUG9ydGZvbGlvID1cblx0Q29yZSAgICAgICAgICAgIDogcmVxdWlyZSggJy4vY29yZS9zdGFydCcgKVxuXHRQb3J0Zm9saW9fTGF5b3V0OiByZXF1aXJlKCAnLi9wb3J0Zm9saW8vc3RhcnQnIClcblx0R2FsbGVyeSAgICAgICAgIDogcmVxdWlyZSggJy4vZ2FsbGVyeS9zdGFydCcgKVxuXHRMYXp5X0xvYWRlciAgICAgOiByZXF1aXJlKCAnLi9sYXp5L3N0YXJ0JyApXG5cbiMjI1xuXHRCb290IG9uIGBkb2N1bWVudC5yZWFkeWBcbiMjI1xuJCggZG9jdW1lbnQgKS5yZWFkeSAtPlxuXG5cdCMgT25seSBydW4gdGhpcyBzY3JpcHQgd2hlbiBib2R5IGhhcyBgUFBfUG9ydGZvbGlvYCBjbGFzc1xuXHRyZXR1cm4gaWYgbm90ICQoICdib2R5JyApLmhhc0NsYXNzKCAnUFBfUG9ydGZvbGlvJyApXG5cblx0IyBCb290XG5cdFBob3RvZ3JhcGh5X1BvcnRmb2xpby5Db3JlLnJlYWR5KCApXG5cdHJldHVyblxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cblxuICAgIC8qKlxuICAgICAqIFRoYW5rIHlvdSBSdXNzIGZvciBoZWxwaW5nIG1lIGF2b2lkIHdyaXRpbmcgdGhpcyBteXNlbGY6XG4gICAgICogQHVybCBodHRwczovL3JlbXlzaGFycC5jb20vMjAxMC8wNy8yMS90aHJvdHRsaW5nLWZ1bmN0aW9uLWNhbGxzLyNjb21tZW50LTI3NDU2NjM1OTRcbiAgICAgKi9cbiAgICB0aHJvdHRsZTogZnVuY3Rpb24gKCBmbiwgdGhyZXNoaG9sZCwgc2NvcGUgKSB7XG4gICAgICAgIHRocmVzaGhvbGQgfHwgKHRocmVzaGhvbGQgPSAyNTApXG4gICAgICAgIHZhciBsYXN0LFxuICAgICAgICAgICAgZGVmZXJUaW1lclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGNvbnRleHQgPSBzY29wZSB8fCB0aGlzXG5cbiAgICAgICAgICAgIHZhciBub3cgID0gK25ldyBEYXRlLFxuICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmd1bWVudHNcbiAgICAgICAgICAgIGlmICggbGFzdCAmJiBub3cgPCBsYXN0ICsgdGhyZXNoaG9sZCApIHtcbiAgICAgICAgICAgICAgICAvLyBob2xkIG9uIHRvIGl0XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KCBkZWZlclRpbWVyIClcbiAgICAgICAgICAgICAgICBkZWZlclRpbWVyID0gc2V0VGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBsYXN0ID0gbm93XG4gICAgICAgICAgICAgICAgICAgIGZuLmFwcGx5KCBjb250ZXh0LCBhcmdzIClcbiAgICAgICAgICAgICAgICB9LCB0aHJlc2hob2xkICsgbGFzdCAtIG5vdyApXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxhc3QgPSBub3dcbiAgICAgICAgICAgICAgICBmbi5hcHBseSggY29udGV4dCwgYXJncyApXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cblxufSIsIkhvb2tzID0gcmVxdWlyZSggJ3dwX2hvb2tzJyApXG5cblxuZ2V0X3NpemUgPSAtPlxuXHR3aWR0aCA6IHdpbmRvdy5pbm5lcldpZHRoIHx8ICR3aW5kb3cud2lkdGgoKVxuXHRoZWlnaHQ6IHdpbmRvdy5pbm5lckhlaWdodCB8fCAkd2luZG93LmhlaWdodCgpXG5cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRfc2l6ZSgpIiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoICd3cF9ob29rcycgKVxuXG5yZWFkeSA9IC0+XG5cdGlmIEhvb2tzLmFwcGx5RmlsdGVycyggJ3Bob3J0LmNvcmUucmVhZHknLCB0cnVlIClcblx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQuY29yZS5yZWFkeSdcblxuXHQjIEF1dG9tYXRpY2FsbHkgdHJpZ2dlciBgcGhvcnQuY29yZS5sb2FkZWRgIHdoZW4gaW1hZ2VzIGFyZSBsb2FkZWRcblx0JCggJy5QUF9XcmFwcGVyJyApLmltYWdlc0xvYWRlZCggbG9hZGVkIClcblx0cmV0dXJuXG5cbmxvYWRlZCA9IC0+XG5cdGlmIEhvb2tzLmFwcGx5RmlsdGVycyggJ3Bob3J0LmNvcmUubG9hZGVkJywgdHJ1ZSApXG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LmNvcmUubG9hZGVkJ1xuXHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPVxuXHRsb2FkZWQ6IGxvYWRlZFxuXHRyZWFkeSA6IHJlYWR5IiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCBcImpRdWVyeVwiIClcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcblxuZGVmYXVsdHMgPVxuXHRkeW5hbWljIDogdHJ1ZVxuXHRzcGVlZCAgIDogMzUwXG5cdHByZWxvYWQgOiAzXG5cdGRvd25sb2FkOiBmYWxzZVxuXHRlc2NLZXkgIDogZmFsc2UgIyBXZSdyZSByb2xsaW5nIG91ciBvd25cblxuXHR0aHVtYm5haWwgICAgICAgICA6IHRydWVcblx0c2hvd1RodW1iQnlEZWZhdWx0OiB0cnVlXG5cbiMgQFRPRE86IFVzZSBPYmplY3QuYXNzaWduKCkgd2l0aCBCYWJlbFxuc2V0dGluZ3MgPSAkLmV4dGVuZCgge30sIGRlZmF1bHRzLCB3aW5kb3cuX19waG9ydC5saWdodEdhbGxlcnkgKVxuXG5cbnNpbmdsZV9pdGVtX2RhdGEgPSAoIGl0ZW0gKSAtPlxuXG5cdGlmIGl0ZW0uZGF0YS5nZXQoICd0eXBlJyApIGlzICd2aWRlbydcblx0XHRmdWxsID0gaXRlbS5kYXRhLmdldCggJ3ZpZGVvX3VybCcgKVxuXHRlbHNlXG5cdFx0ZnVsbCA9IGl0ZW0uZGF0YS51cmwoICdmdWxsJyApXG5cblx0cmV0dXJuIHtcblx0XHRzcmMgICAgOiBmdWxsXG5cdFx0dGh1bWIgIDogaXRlbS5kYXRhLnVybCggJ3RodW1iJyApXG5cdFx0c3ViSHRtbDogaXRlbS5jYXB0aW9uXG5cdH1cblxuXG5nZXRfc2V0dGluZ3MgPSAoIGdhbGxlcnksIGluZGV4ICkgLT5cblx0c2V0dGluZ3MuaW5kZXggICAgICAgICA9IGluZGV4XG5cdHNldHRpbmdzLmR5bmFtaWNFbCAgICAgPSBnYWxsZXJ5Lm1hcCggc2luZ2xlX2l0ZW1fZGF0YSApXG5cdHNldHRpbmdzLnZpZGVvTWF4V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCAqIDAuOFxuXG5cdEhvb2tzLmFwcGx5RmlsdGVycyAncGhvcnQubGlnaHRHYWxsZXJ5LnNldHRpbmdzJywgc2V0dGluZ3NcblxuXG5tb2R1bGUuZXhwb3J0cyA9ICggJGVsICkgLT5cblx0Y2xvc2U6IC0+XG5cdFx0R2FsbGVyeSA9ICRlbC5kYXRhKCAnbGlnaHRHYWxsZXJ5JyApXG5cdFx0R2FsbGVyeS5kZXN0cm95KCApIGlmIEdhbGxlcnkgYW5kIEdhbGxlcnkuZGVzdHJveT9cblxuXHRvcGVuOiAoIGdhbGxlcnlfaXRlbXMsIGluZGV4ICkgLT5cblx0XHRHYWxsZXJ5ID0gJGVsLmxpZ2h0R2FsbGVyeSggZ2V0X3NldHRpbmdzKCBnYWxsZXJ5X2l0ZW1zLCBpbmRleCApIClcblxuXG5cblxuIiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCBcImpRdWVyeVwiIClcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcblxubGFiZWxzID0gJC5leHRlbmQoIHt9LCB7XG5cdCdmYWNlYm9vayc6ICdTaGFyZSBvbiBGYWNlYm9vaycsXG5cdCd0d2l0dGVyJzogJ1R3ZWV0Jyxcblx0J3BpbnRlcmVzdCc6ICdQaW4gaXQnLFxufSwgd2luZG93Ll9fcGhvcnQuaTE4bi5waG90b3N3aXBlIClcblxuXG5kZWZhdWx0cyA9XG5cdGluZGV4ICAgICAgIDogMFxuXHRwcmVsb2FkICAgICA6IFsgMSwgMyBdXG5cdGVzY0tleSAgICAgIDogZmFsc2Vcblx0c2hhcmVCdXR0b25zOiBbXG5cdFx0eyBpZDogJ2ZhY2Vib29rJywgbGFiZWw6IGxhYmVscy5mYWNlYm9vaywgdXJsOiAnaHR0cHM6Ly93d3cuZmFjZWJvb2suY29tL3NoYXJlci9zaGFyZXIucGhwP3U9e3t1cmx9fScgfVxuXHRcdHsgaWQ6ICd0d2l0dGVyJywgbGFiZWwgOiBsYWJlbHMudHdpdHRlciwgdXJsOiAnaHR0cHM6Ly90d2l0dGVyLmNvbS9pbnRlbnQvdHdlZXQ/dGV4dD17e3RleHR9fSZ1cmw9e3t1cmx9fScgfVxuXHRcdHsgaWQ6ICdwaW50ZXJlc3QnLCBsYWJlbDogbGFiZWxzLnBpbnRlcmVzdCwgdXJsOiAnaHR0cDovL3d3dy5waW50ZXJlc3QuY29tL3Bpbi9jcmVhdGUvYnV0dG9uLz91cmw9e3t1cmx9fSZtZWRpYT17e2ltYWdlX3VybH19JmRlc2NyaXB0aW9uPXt7dGV4dH19JyB9XG5cdF1cblxuXG5wc3dwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvciggJy5wc3dwJyApXG5VSSA9IEhvb2tzLmFwcGx5RmlsdGVycyggXCJwaG9ydC5waG90b3N3aXBlLlVJXCIsIHdpbmRvdy5QaG90b1N3aXBlVUlfRGVmYXVsdCApXG5QaG90b1N3aXBlID0gd2luZG93LlBob3RvU3dpcGVcblxuXG5jcmVhdGUgPSAoIGRhdGEsIG9wdHMgPSB7fSApIC0+XG5cdG9wdGlvbnMgPSBIb29rcy5hcHBseUZpbHRlcnMoIFwicGhvcnQucGhvdG9zd2lwZS5vcHRpb25zXCIsICQuZXh0ZW5kKCB7fSwgZGVmYXVsdHMsIG9wdHMgKSApXG5cblx0IyBJbmRleCBpcyAwIGJ5IGRlZmF1bHRcblx0aWYgbm90IG9wdGlvbnMuaW5kZXg/XG5cdFx0b3B0aW9ucy5pbmRleCA9IDBcblxuXHQjIFNldCB0aGUgaW5kZXggdG8gMCBpZiBpdCBpc24ndCBhIHByb3BlciB2YWx1ZVxuXHRpZiBub3Qgb3B0aW9ucy5pbmRleCBvciBvcHRpb25zLmluZGV4IDwgMFxuXHRcdG9wdGlvbnMuaW5kZXggPSAwXG5cblx0aW5zdGFuY2UgPSBuZXcgUGhvdG9Td2lwZSggcHN3cCwgVUksIGRhdGEsIG9wdGlvbnMgKVxuXHRpbnN0YW5jZS5pbml0KCApXG5cblx0cmV0dXJuIGluc3RhbmNlXG5cblxuc2luZ2xlX2l0ZW1fZGF0YSA9ICggaXRlbSApIC0+XG5cdCMgUGhvdG9Td2lwZSBzdXBwb3J0cyBvbmx5IGltYWdlc1xuXHRyZXR1cm4gaWYgaXRlbS5kYXRhLmdldCggJ3R5cGUnICkgaXNudCAnaW1hZ2UnXG5cblxuXHRbd2lkdGgsIGhlaWdodF0gPSBpdGVtLmRhdGEuc2l6ZSggJ2Z1bGwnIClcblxuXHQjIHJldHVyblxuXHRzcmMgIDogaXRlbS5kYXRhLnVybCggJ2Z1bGwnIClcblx0bXNyYyA6IGl0ZW0uZGF0YS51cmwoICdmdWxsJyApXG5cdHcgICAgOiB3aWR0aFxuXHRoICAgIDogaGVpZ2h0XG5cdHRpdGxlOiBpdGVtLmNhcHRpb25cblxuXG50aHVtYm5haWxfcG9zaXRpb24gPSAoICRnYWxsZXJ5ICkgLT4gcmV0dXJuICggaW5kZXggKSAtPlxuXHRyZXR1cm4gZmFsc2UgaWYgbm90ICRnYWxsZXJ5Lmxlbmd0aFxuXG5cdCRlbCA9ICRnYWxsZXJ5LmVxKCBpbmRleCApXG5cdHRodW1ibmFpbCA9ICRlbC5maW5kKCAnaW1nJyApLmdldCggMCApXG5cblx0IyBUaHVtYm5haWwgbXVzdCBleGlzdCBiZWZvcmUgZGltZW5zaW9ucyBjYW4gYmUgb2J0YWluZWRcblx0cmV0dXJuIGlmIG5vdCB0aHVtYm5haWxcblxuXHRwYWdlWVNjcm9sbCA9IHdpbmRvdy5wYWdlWU9mZnNldCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wXG5cdHJlY3QgPSB0aHVtYm5haWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCApXG5cblx0IyAvLyB3ID0gd2lkdGhcblx0b3V0ID1cblx0XHR4OiByZWN0LmxlZnRcblx0XHR5OiByZWN0LnRvcCArIHBhZ2VZU2Nyb2xsXG5cdFx0dzogcmVjdC53aWR0aFxuXG5cdHJldHVybiBvdXRcblxuXG5tb2R1bGUuZXhwb3J0cyA9ICggJGVsICkgLT5cblx0R2FsbGVyeSA9IGZhbHNlXG5cblx0Y2xvc2U6IC0+XG5cdFx0cmV0dXJuIGlmIG5vdCBHYWxsZXJ5XG5cdFx0R2FsbGVyeS5jbG9zZSggKVxuXHRcdEdhbGxlcnkgPSBmYWxzZVxuXG5cdG9wZW46ICggZ2FsbGVyeSwgaW5kZXggKSAtPlxuXHRcdG9wdGlvbnMgPVxuXHRcdFx0Z2V0VGh1bWJCb3VuZHNGbjogdGh1bWJuYWlsX3Bvc2l0aW9uKCAkZWwuY2xvc2VzdCggJy5QUF9HYWxsZXJ5JyApLmZpbmQoICcuUFBfR2FsbGVyeV9faXRlbScgKSApXG5cdFx0XHRpbmRleCAgICAgICAgICAgOiBpbmRleFxuXG5cdFx0R2FsbGVyeSA9IGNyZWF0ZSggZ2FsbGVyeS5tYXAoIHNpbmdsZV9pdGVtX2RhdGEgKSwgb3B0aW9ucyApXG5cblxuXG4iLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuJCA9IHJlcXVpcmUoICdqUXVlcnknIClcbkhvb2tzID0gcmVxdWlyZSggJ3dwX2hvb2tzJyApXG5nYWxlcnlfaXRlbV9kYXRhID0gcmVxdWlyZSggJy4vZ2FsbGVyeV9pdGVtX2ZhY3RvcnknIClcblxuXG5wYXJzZV9nYWxsZXJ5X2l0ZW0gPSAoIGtleSwgZWwgKSAtPlxuXHQkZWwgPSAkKCBlbCApXG5cblx0aW5kZXggIDoga2V5XG5cdGRhdGEgICA6IGdhbGVyeV9pdGVtX2RhdGEoICRlbCApXG5cdGNhcHRpb246ICRlbC5maW5kKCAnLlBQX0dhbGxlcnlfX2NhcHRpb24nICkuaHRtbCggKSB8fCAnJ1xuXG5cbm1vZHVsZS5leHBvcnRzID0gKCBHYWxsZXJ5X0RyaXZlciApIC0+XG5cdGluc3RhbmNlID0gZmFsc2VcblxuXHRvcGVuID0gKCBlbCApIC0+XG5cdFx0JGVsID0gJCggZWwgKVxuXHRcdCRpdGVtcyA9ICRlbC5jbG9zZXN0KCAnLlBQX0dhbGxlcnknICkuZmluZCggJy5QUF9HYWxsZXJ5X19pdGVtJyApXG5cblx0XHRpZiAkaXRlbXMubGVuZ3RoID4gMFxuXHRcdFx0aW5kZXggPSAkaXRlbXMuaW5kZXgoICRlbCApXG5cdFx0XHRnYWxsZXJ5X2l0ZW1zID0gJC5tYWtlQXJyYXkoICRpdGVtcy5tYXAoIHBhcnNlX2dhbGxlcnlfaXRlbSApIClcblxuXHRcdFx0aW5zdGFuY2UgPSBHYWxsZXJ5X0RyaXZlciggJGVsIClcblx0XHRcdGluc3RhbmNlLm9wZW4oIGdhbGxlcnlfaXRlbXMsIGluZGV4IClcblxuXHRcdFx0SG9va3MuZG9BY3Rpb24oICdwaG9ydC5nYWxsZXJ5Lm9wZW4nLCBpbnN0YW5jZSwgZ2FsbGVyeV9pdGVtcywgaW5kZXggKVxuXG5cdFx0cmV0dXJuXG5cblx0b3Blbjogb3BlblxuXG5cdGhhbmRsZV9oYXNoOiAtPlxuXHRcdGluZGV4ID0gcGFyc2VJbnQoIHdpbmRvdy5sb2NhdGlvbi5oYXNoLnNwbGl0KCAnJnBpZD0nIClbIDEgXSwgMTAgKVxuXHRcdGVsID0gJCggJy5QUF9HYWxsZXJ5JyApLmZpcnN0KCApLmZpbmQoICcuUFBfR2FsbGVyeV9faXRlbScgKS5nZXQoIGluZGV4IClcblx0XHRvcGVuKCBlbCApXG5cblx0XHRyZXR1cm5cblxuXHRjbG9zZTogLT5cblx0XHRyZXR1cm4gZmFsc2UgaWYgbm90IGluc3RhbmNlXG5cblx0XHRpbnN0YW5jZS5jbG9zZSggKVxuXHRcdGluc3RhbmNlID0gZmFsc2VcblxuXHRcdEhvb2tzLmRvQWN0aW9uKCAncGhvcnQuZ2FsbGVyeS5vcGVuJywgaW5zdGFuY2UgKVxuXHRcdHJldHVybiIsIml0ZW1fZGF0YSA9ICggZGF0YV9vYmogKSAtPlxuXG5cdHBsdWNrID0gKCBvYmplY3QsIGtleSApIC0+XG5cdFx0aWYgb2JqZWN0IGFuZCBvYmplY3RbIGtleSBdXG5cdFx0XHRyZXR1cm4gb2JqZWN0WyBrZXkgXVxuXHRcdHJldHVybiBmYWxzZVxuXG5cdGdldCA9ICgga2V5ICkgLT4gcGx1Y2soIGRhdGFfb2JqLCBrZXkgKVxuXG5cdGltYWdlID0gKCBzaXplX25hbWUgKSAtPiBwbHVjayggZ2V0KCAnaW1hZ2VzJyApLCBzaXplX25hbWUgKVxuXG5cblx0c2l6ZTogKCBzaXplX25hbWUgKSAtPlxuXHRcdGltYWdlX3NpemUgPSBwbHVjayggaW1hZ2UoIHNpemVfbmFtZSApLCAnc2l6ZScgKVxuXHRcdHJldHVybiBmYWxzZSBpZiBub3QgaW1hZ2Vfc2l6ZVxuXG5cdFx0W3dpZHRoLCBoZWlnaHRdID0gaW1hZ2Vfc2l6ZS5zcGxpdCggJ3gnIClcblxuXHRcdHdpZHRoID0gcGFyc2VJbnQoIHdpZHRoIClcblx0XHRoZWlnaHQgPSBwYXJzZUludCggaGVpZ2h0IClcblxuXHRcdHJldHVybiBbIHdpZHRoLCBoZWlnaHQgXVxuXG5cdHVybDogKCBzaXplX25hbWUgKSAtPiBwbHVjayggaW1hZ2UoIHNpemVfbmFtZSApLCAndXJsJyApXG5cdGdldDogZ2V0XG5cblxubW9kdWxlLmV4cG9ydHMgPSBpdGVtX2RhdGEiLCJpdGVtID0gcmVxdWlyZSgnLi9nYWxsZXJ5X2l0ZW1fZGF0YScpXG5cbml0ZW1fZGF0YSA9ICggJGVsICkgLT5cblx0ZGF0YV9vYmogPSAkZWwuZGF0YSggJ2l0ZW0nIClcblxuXHRpZiBub3QgZGF0YV9vYmpcblx0XHR0aHJvdyBuZXcgRXJyb3IgXCJFbGVtZW50IGRvZXNuJ3QgY29udGFpbiBgZGF0YS1pdGVtYCBhdHRyaWJ1dGVcIlxuXG5cdHJldHVybiBpdGVtKCBkYXRhX29iaiApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBpdGVtX2RhdGEiLCJIb29rcyA9IHJlcXVpcmUoXCJ3cF9ob29rc1wiKVxuXG4jXG4jIFRoaXMgZmlsZSBpcyBnb2luZyB0byByZXR1cm4gYSBbR2FsbGVyeSBGYWN0b3J5XSBpbnN0YW5jZVxuIyBFYXN5IFBob3RvZ3JhcGh5IFBvcnRmb2xpbyBpcyB1c2luZyB0aGF0IHRvIG9wZW4vY2xvc2UvZGVzdHJveSBnYWxsZXJpZXNcbiNcbiMgW0dhbGxlcnkgRmFjdG9yeV0gcmVsaWVzIG9uIGEgW0FkYXB0ZXJdXG4jIEluc3RlYWQgb2YgcmVseWluZyBkaXJlY3RseSBvbiBhIGRlcGVuZGVuY3ksIEdhbGxlcnkgRmFjdG9yeSByZWxpZXMgb24gYSBBZGFwdGVyIHRoYXQgY2FuIGJlIG1vZGlmaWVkXG4jIEEgQWRhcHRlciBpcyBhbiBhZGFwdGVyIGZvciBhIFBvcHVwLUdhbGxlcnkgcGx1Z2luLCBzdWNoIGFzIExpZ2h0R2FsbGVyeSBvciBQaG90b1N3aXBlXG4jXG4jIFNvIHdoZW4gYSBnYWxsZXJ5IGlzIG9wZW5lZCwgdGhpcyBpcyBwcm9iYWJseSBob3cgaXQncyBnb2luZyB0byBsb29rOlxuIyBbR2FsbGVyeSBGYWN0b3J5XSBhc2tzIFtBZGFwdGVyXSB0byBmaW5kIGFuZCBvcGVuIGEgZ2FsbGVyeSB3aXRoIFthbnkgTGlnaHRCb3ggTGlicmFyeV1cbiNcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEdhbGxlcnkgQWRhcHRlcjpcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuc2V0dXBfZHJpdmVyID0gKCBkcml2ZXJfbmFtZSA9ICdsaWdodGdhbGxlcnknICkgLT5cblx0aWYgZHJpdmVyX25hbWUgaXMgJ2xpZ2h0Z2FsbGVyeSdcblx0XHRhZGFwdGVyID0gcmVxdWlyZSggJy4vYWRhcHRlcnMvbGlnaHRnYWxsZXJ5JyApXG5cblx0aWYgZHJpdmVyX25hbWUgaXMgJ3Bob3Rvc3dpcGUnXG5cdFx0YWRhcHRlciA9IHJlcXVpcmUoICcuL2FkYXB0ZXJzL3Bob3Rvc3dpcGUnIClcblxuXHRyZXR1cm4gSG9va3MuYXBwbHlGaWx0ZXJzKCAncGhvcnQuZ2FsbGVyeS5kcml2ZXInLCBhZGFwdGVyIClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEdhbGxlcnkgRmFjdG9yeTpcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBUaGUgZ2FsbGVyeSBmYWN0b3J5IGlzIHdoYXQgd2UncmUgaW50ZXJhY3Rpbmcgd2l0aCB0byBvcGVuL2Nsb3NlIGEgZ2FsbGVyeVxuc2V0dXBfZmFjdG9yeSA9IC0+XG5cdGZhY3RvcnkgPSByZXF1aXJlKCAnLi9nYWxsZXJ5X2ZhY3RvcnknIClcblx0cmV0dXJuIEhvb2tzLmFwcGx5RmlsdGVycyggJ3Bob3J0LmdhbGxlcnkuZmFjdG9yeScsIGZhY3RvcnkgKVxuXG4jXG4jIFJldHVybiBhIGZhY3RvcnkgaW5zdGFuY2VcbiNcblxuZ2FsbGVyeV9kcml2ZXIgPSBzZXR1cF9kcml2ZXIoIHdpbmRvdy5fX3Bob3J0LnBvcHVwX2dhbGxlcnkgKVxuZ2FsbGVyeV9mYWN0b3J5ID0gc2V0dXBfZmFjdG9yeSggKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdhbGxlcnlfZmFjdG9yeSggZ2FsbGVyeV9kcml2ZXIgKSIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuSG9va3MgPSByZXF1aXJlKCAnd3BfaG9va3MnIClcbkdhbGxlcnkgPSByZXF1aXJlKCAnLi9wcmVwYXJlX2dhbGxlcnlfZmFjdG9yeScgKVxuXG5Ib29rcy5hZGRBY3Rpb24gJ3Bob3J0LmNvcmUucmVhZHknLCAtPlxuXG5cdGhhbmRsZV9jbGlja3MgPSBIb29rcy5hcHBseUZpbHRlcnMoICdwaG9ydC5nYWxsZXJ5LmhhbmRsZV9jbGlja3MnLCB0cnVlIClcblx0aGFuZGxlX2hhc2ggPSBIb29rcy5hcHBseUZpbHRlcnMoICdwaG9ydC5nYWxsZXJ5LmhhbmRsZV9oYXNoJywgdHJ1ZSApXG5cdGhhbmRsZV9lc2Nfa2V5ID0gSG9va3MuYXBwbHlGaWx0ZXJzKCAncGhvcnQuZ2FsbGVyeS5jdXN0b21fZXNjJywgdHJ1ZSApXG5cblx0IyBIYW5kbGUgSGFzaGNoYW5nZVxuXHRpZiBoYW5kbGVfaGFzaCBhbmQgd2luZG93LmxvY2F0aW9uLmhhc2ggYW5kIEdhbGxlcnkuaGFuZGxlX2hhc2hcblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LmNvcmUubG9hZGVkJywgR2FsbGVyeS5oYW5kbGVfaGFzaFxuXG5cdCMgSGFuZGxlIENsaWNrc1xuXHRpZiBoYW5kbGVfY2xpY2tzXG5cdFx0JCggZG9jdW1lbnQgKS5vbiAnY2xpY2snLCAnLlBQX0dhbGxlcnlfX2l0ZW0nLCAoIGUgKSAtPlxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCggKVxuXHRcdFx0R2FsbGVyeS5vcGVuKCB0aGlzIClcblxuXG5cdCMgSGFuZGxlIEVTQ2FwZSBLZXlcblx0aWYgaGFuZGxlX2VzY19rZXlcblx0XHQkKCB3aW5kb3cgKS5vbiAna2V5ZG93bicsICggZSApIC0+XG5cdFx0XHRyZXR1cm4gdW5sZXNzIGUua2V5IGlzICdFc2NhcGUnXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCApXG5cdFx0XHRHYWxsZXJ5LmNsb3NlKCApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBHYWxsZXJ5XG4iLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuJCA9IHJlcXVpcmUoICdqUXVlcnknIClcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcbmdhbGxlcnlfaXRlbSA9IHJlcXVpcmUoICcuLi9nYWxsZXJ5L2dhbGxlcnlfaXRlbV9mYWN0b3J5JyApXG5fX1dJTkRPVyA9IHJlcXVpcmUoICcuLi9jb3JlL1dpbmRvdycgKVxudGhyb3R0bGUgPSByZXF1aXJlKCcuLi9jb3JlL1V0aWxpdGllcycpLnRocm90dGxlXG5cbmNsYXNzIEFic3RyYWN0X0xhenlfTG9hZGVyXG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdEBFbGVtZW50cyA9XG5cdFx0XHRpdGVtICAgICAgIDogJ1BQX0xhenlfSW1hZ2UnXG5cdFx0XHRwbGFjZWhvbGRlcjogJ1BQX0xhenlfSW1hZ2VfX3BsYWNlaG9sZGVyJ1xuXHRcdFx0bGluayAgICAgICA6ICdQUF9KU19MYXp5X19saW5rJ1xuXHRcdFx0aW1hZ2UgICAgICA6ICdQUF9KU19MYXp5X19pbWFnZSdcblxuXHRcdEBJdGVtcyA9IFtdXG5cblx0XHQjIEFkanVzdGFibGUgU2Vuc2l0aXZpdHkgZm9yIEBpbl92aWV3IGZ1bmN0aW9uXG5cdFx0IyBWYWx1ZSBpbiBwaXhlbHNcblx0XHRAU2Vuc2l0aXZpdHkgPSAxMDBcblxuXHRcdCMgQXV0by1zZXR1cCB3aGVuIGV2ZW50cyBhcmUgYXR0YWNoZWRcblx0XHQjIEF1dG8tZGVzdHJveSB3aGVuIGV2ZW50cyBhcmUgZGV0YWNoZWRcblx0XHRAdGhyb3R0bGVkX2F1dG9sb2FkID0gbnVsbFxuXG5cdFx0QHNldHVwX2l0ZW1zKClcblx0XHRAcmVzaXplX2FsbCgpXG5cdFx0QGF0dGFjaF9ldmVudHMoKVxuXG5cdCMjI1xuXHRcdEFic3RyYWN0IE1ldGhvZHNcblx0IyMjXG5cblx0IyBUaGlzIGlzIHJ1biB3aGVuIGEgcmVzaXplIG9yIHJlZnJlc2ggZXZlbnQgaXMgZGV0ZWN0ZWRcblx0cmVzaXplOiAtPiByZXR1cm5cblxuXHRsb2FkOiAoIGl0ZW0gKSAtPlxuXHRcdEBsb2FkX2ltYWdlKCBpdGVtIClcblx0XHRpdGVtLiRlbC5pbWFnZXNMb2FkZWQgPT5cblx0XHRcdEBjbGVhbnVwX2FmdGVyX2xvYWQoIGl0ZW0gKVxuXG5cdGxvYWRfaW1hZ2U6ICggaXRlbSApIC0+XG5cblx0XHQjIEdldCBpbWFnZSBVUkxzXG5cdFx0dGh1bWIgPSBpdGVtLmRhdGEudXJsKCAndGh1bWInIClcblx0XHRmdWxsID0gaXRlbS5kYXRhLnVybCggJ2Z1bGwnIClcblxuXHRcdCMgQ3JlYXRlIGVsZW1lbnRzXG5cdFx0aXRlbS4kZWxcblx0XHRcdC5wcmVwZW5kKCBAZ2V0X2l0ZW1faHRtbCggdGh1bWIsIGZ1bGwgKSApXG5cdFx0XHQucmVtb3ZlQ2xhc3MoICdMYXp5LUltYWdlJyApXG5cblx0XHQjIE1ha2Ugc3VyZSB0aGlzIGltYWdlIGlzbid0IGxvYWRlZCBhZ2FpblxuXHRcdGl0ZW0ubG9hZGVkID0gdHJ1ZVxuXG5cdGNsZWFudXBfYWZ0ZXJfbG9hZDogKCBpdGVtICkgLT5cblx0XHQjIEFkZCBpbWFnZSBQUF9KU19sb2FkZWQgY2xhc3Ncblx0XHRpdGVtLiRlbC5maW5kKCAnaW1nJyApLmFkZENsYXNzKCAnUFBfSlNfX2xvYWRlZCcgKS5yZW1vdmVDbGFzcyggJ1BQX0pTX19sb2FkaW5nJyApXG5cblx0XHRpdGVtLiRlbFxuXG5cdFx0XHQjIFJlbW92ZSBgUFBfTGF6eV9JbWFnZWAsIGFzIHRoaXMgaXMgbm90IGEgbGF6eS1sb2FkYWJsZSBpbWFnZSBhbnltb3JlXG5cdFx0XHQucmVtb3ZlQ2xhc3MoIEBFbGVtZW50cy5pdGVtIClcblxuXHRcdFx0IyBSZW1vdmUgUGxhY2Vob2xkZXJcblx0XHRcdC5maW5kKCBcIi4je0BFbGVtZW50cy5wbGFjZWhvbGRlcn1cIiApXG5cdFx0XHQuZmFkZU91dCggNDAwLCAtPiAkKCB0aGlzICkucmVtb3ZlKCkgKVxuXG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LmxhenkubG9hZGVkX2l0ZW0nLCBpdGVtXG5cblxuXHRnZXRfaXRlbV9odG1sOiAoIHRodW1iLCBmdWxsICkgLT5cblxuXHRcdGlmICdkaXNhYmxlJyBpcyB3aW5kb3cuX19waG9ydC5wb3B1cF9nYWxsZXJ5XG5cdFx0XHRyZXR1cm4gXCJcIlwiXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiI3tARWxlbWVudHMubGlua31cIiByZWw9XCJnYWxsZXJ5XCI+XG5cdFx0XHRcdDxpbWcgY2xhc3M9XCIje0BFbGVtZW50cy5pbWFnZX1cIiBzcmM9XCIje3RodW1ifVwiIGNsYXNzPVwiUFBfSlNfX2xvYWRpbmdcIiAvPlxuXHRcdFx0PC9kaXY+XG5cdFx0XHRcIlwiXCJcblx0XHRlbHNlXG5cdFx0XHRyZXR1cm4gXCJcIlwiXG5cdFx0XHQ8YSBjbGFzcz1cIiN7QEVsZW1lbnRzLmxpbmt9XCIgaHJlZj1cIiN7ZnVsbH1cIiByZWw9XCJnYWxsZXJ5XCI+XG5cdFx0XHRcdDxpbWcgY2xhc3M9XCIje0BFbGVtZW50cy5pbWFnZX1cIiBzcmM9XCIje3RodW1ifVwiIGNsYXNzPVwiUFBfSlNfX2xvYWRpbmdcIiAvPlxuXHRcdFx0PC9hPlxuXHRcdFx0XCJcIlwiXG5cblx0c2V0dXBfaXRlbXM6ID0+XG5cdFx0IyBDbGVhciBleGlzdGluZyBpdGVtcywgaWYgYW55XG5cdFx0QEl0ZW1zID0gW11cblxuXHRcdCMgTG9vcCBvdmVyIERPTSBhbmQgYWRkIGVhY2ggaXRlbSB0byBASXRlbXNcblx0XHQkKCBcIi4je0BFbGVtZW50cy5pdGVtfVwiICkuZWFjaCggQGFkZF9pdGVtIClcblx0XHRyZXR1cm5cblxuXHRhZGRfaXRlbTogKCBrZXksIGVsICkgPT5cblx0XHQkZWwgPSAkKCBlbCApXG5cdFx0QEl0ZW1zLnB1c2hcblx0XHRcdGVsICAgIDogZWxcblx0XHRcdCRlbCAgIDogJGVsXG5cdFx0XHRkYXRhICA6IGdhbGxlcnlfaXRlbSggJGVsIClcblx0XHRcdGxvYWRlZDogZmFsc2VcblxuXG5cdFx0cmV0dXJuXG5cblxuXHQjIyNcblx0XHRNZXRob2RzXG5cdCMjI1xuXHRyZXNpemVfYWxsOiAtPlxuXHRcdEByZXNpemUoIGl0ZW0gKSBmb3IgaXRlbSBpbiBASXRlbXNcblxuXG5cblx0IyBBdXRvbWF0aWNhbGx5IExvYWQgYWxsIGl0ZW1zIHRoYXQgYXJlIGBpbl9sb29zZV92aWV3YFxuXHRhdXRvbG9hZDogPT5cblx0XHRmb3IgaXRlbSwga2V5IGluIEBJdGVtc1xuXHRcdFx0aWYgbm90IGl0ZW0ubG9hZGVkIGFuZCBAaW5fbG9vc2VfdmlldyggaXRlbS5lbCApXG5cdFx0XHRcdEBsb2FkKCBpdGVtIClcblxuXHRpbl9sb29zZV92aWV3OiAoIGVsICkgLT5cblx0XHRyZXR1cm4gdHJ1ZSBpZiBub3QgZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0P1xuXHRcdHJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuXG5cdFx0IyBFbGVtZW50cyBub3QgaW4gdmlldyBpZiB0aGV5IGRvbid0IGhhdmUgZGltZW5zaW9uc1xuXHRcdHJldHVybiBmYWxzZSBpZiByZWN0LmhlaWdodCBpcyAwIGFuZCByZWN0LndpZHRoIGlzIDBcblxuXG5cdFx0cmV0dXJuIChcblx0XHRcdCMgWSBBeGlzXG5cdFx0XHRyZWN0LnRvcCArIHJlY3QuaGVpZ2h0ID49IC1AU2Vuc2l0aXZpdHkgYW5kICMgdG9wXG5cdFx0XHRyZWN0LmJvdHRvbSAtIHJlY3QuaGVpZ2h0IDw9IF9fV0lORE9XLmhlaWdodCArIEBTZW5zaXRpdml0eSBhbmRcblxuXHRcdFx0IyBYIEF4aXNcblx0XHRcdHJlY3QubGVmdCArIHJlY3Qud2lkdGggPj0gLUBTZW5zaXRpdml0eSBhbmRcblx0XHRcdHJlY3QucmlnaHQgLSByZWN0LndpZHRoIDw9IF9fV0lORE9XLndpZHRoICsgQFNlbnNpdGl2aXR5XG5cblx0XHQpXG5cblx0ZGVzdHJveTogLT5cblx0XHRAZGV0YWNoX2V2ZW50cygpXG5cblx0YXR0YWNoX2V2ZW50czogLT5cblx0XHQjIENyZWF0ZSBhIGRlYm91bmNlZCBgYXV0b2xvYWRgIGZ1bmN0aW9uXG5cdFx0QHRocm90dGxlZF9hdXRvbG9hZCA9IHRocm90dGxlKCBAYXV0b2xvYWQsIDUwIClcblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5yZWZyZXNoJywgQHRocm90dGxlZF9hdXRvbG9hZCwgMTAwXG5cblxuXHRkZXRhY2hfZXZlbnRzOiAtPlxuXHRcdCMgQ2xlYXIgdGhlIGRlYm91bmNlZCBmdW5jdGlvbiBmcm9tIGluc3RhbmNlXG5cdFx0QHRocm90dGxlZF9hdXRvbG9hZCA9IG51bGxcblx0XHRIb29rcy5yZW1vdmVBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5yZWZyZXNoJywgQHRocm90dGxlZF9hdXRvbG9hZCwgMTAwXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFic3RyYWN0X0xhenlfTG9hZGVyXG4iLCIkID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuQWJzdHJhY3RfTGF6eV9Mb2FkZXIgPSByZXF1aXJlKCAnLi9BYnN0cmFjdF9MYXp5X0xvYWRlcicgKVxuX19XSU5ET1cgPSByZXF1aXJlKCAnLi4vY29yZS9XaW5kb3cnIClcblxuY2xhc3MgTGF6eV9NYXNvbnJ5IGV4dGVuZHMgQWJzdHJhY3RfTGF6eV9Mb2FkZXJcblxuXHRyZXNpemVfYWxsOiAtPlxuXHRcdEBwbGFjZWhvbGRlcl93aWR0aCA9ICQoICcuUFBfTWFzb25yeV9fc2l6ZXInICkud2lkdGgoKVxuXHRcdHN1cGVyKClcblxuXHRyZXNpemU6ICggaXRlbSApIC0+XG5cdFx0aXRlbS4kZWwuY3NzICdtaW4taGVpZ2h0JzogTWF0aC5mbG9vciggQHBsYWNlaG9sZGVyX3dpZHRoIC8gaXRlbS5kYXRhLmdldCgncmF0aW8nKSApXG5cblx0Y2xlYW51cF9hZnRlcl9sb2FkOiAoaXRlbSkgLT5cblx0XHQjIFJlbW92ZSBtaW4taGVpZ2h0XG5cdFx0aXRlbS4kZWwuY3NzKCAnbWluLWhlaWdodCcsICcnIClcblxuXHRcdCMgUnVuIGFsbCBvdGhlciBjbGVhbnVwc1xuXHRcdHN1cGVyKCBpdGVtIClcblxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCdcblxuXHRcdHJldHVyblxuXG5cdGF0dGFjaF9ldmVudHM6IC0+XG5cdFx0IyBDYWxsIFBhcmVudCBmaXJzdCwgaXQncyBnb2luZyB0byBjcmVhdGUgQHRocm90dGxlZF9hdXRvbG9hZFxuXHRcdHN1cGVyKClcblxuXHRcdCMgQXR0YWNoXG5cdFx0JCggd2luZG93ICkub24gJ3Njcm9sbCcsIEB0aHJvdHRsZWRfYXV0b2xvYWRcblxuXG5cblx0ZGV0YWNoX2V2ZW50czogLT5cblx0XHQjIERldGFjaFxuXHRcdCQoIHdpbmRvdyApLm9mZiAnc2Nyb2xsJywgQHRocm90dGxlZF9hdXRvbG9hZFxuXG5cdFx0IyBDYWxsIHBhcmVudCBsYXN0LCBpdCdzIGdvaW5nIHRvIGNsZWFuIHVwIEB0aHJvdHRsZWRfYXV0b2xvYWRcblx0XHRzdXBlcigpXG5cblx0ZGVzdHJveTogLT5cblx0XHRmb3IgaXRlbSwga2V5IGluIEBJdGVtc1xuXHRcdFx0aXRlbS4kZWwuY3NzICdtaW4taGVpZ2h0JywgJydcblx0XHRzdXBlcigpXG5cblxubW9kdWxlLmV4cG9ydHMgPSBMYXp5X01hc29ucnlcbiIsIiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoICd3cF9ob29rcycgKVxuXG5cbmluc3RhbmNlID0gZmFsc2VcblxuZGVzdHJveSA9IC0+XG5cdHJldHVybiBpZiBub3QgaW5zdGFuY2Vcblx0aW5zdGFuY2UuZGVzdHJveSggKVxuXHRpbnN0YW5jZSA9IG51bGxcblxuY3JlYXRlID0gLT5cblxuXHQjIE1ha2Ugc3VyZSBhbiBpbnN0YW5jZSBkb2Vzbid0IGFscmVhZHkgZXhpc3Rcblx0ZGVzdHJveSggKVxuXG5cdCMgSGFuZGxlciByZXF1aXJlZFxuXHRIYW5kbGVyID0gSG9va3MuYXBwbHlGaWx0ZXJzICdwaG9ydC5sYXp5LmhhbmRsZXInLCBmYWxzZVxuXHRyZXR1cm4gaWYgbm90IEhhbmRsZXJcblxuXHQjIEJ5IGRlZmF1bHQgTGF6eV9NYXNvbnJ5IGlzIGhhbmRsaW5nIExhenktTG9hZGluZ1xuXHQjIENoZWNrIGlmIGFueW9uZSB3YW50cyB0byBoaWphY2sgaGFuZGxlclxuXHRpbnN0YW5jZSA9IG5ldyBIYW5kbGVyKCApXG5cblx0cmV0dXJuXG5cblxuIyBJbml0aWFsaXplIGxhenkgbG9hZGVyIGFmdGVyIHRoZSBwb3J0Zm9saW8gaXMgcHJlcGFyZWQsIHAgPSAxMDBcbkhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnLCBjcmVhdGUsIDEwMFxuSG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScsIGRlc3Ryb3lcblxubW9kdWxlLmV4cG9ydHMgPVxuXHRjcmVhdGUgOiBjcmVhdGVcblx0ZGVzdHJveTogZGVzdHJveSIsIkhvb2tzID0gcmVxdWlyZSggJ3dwX2hvb2tzJyApXG5cbiMjI1xuXG4gICAgIyBJbml0aWFsaXplIFBvcnRmb2xpbyBDb3JlXG5cdC0tLVxuXHRcdFVzaW5nIHA1MCBAIGBwaG9ydC5jb3JlLnJlYWR5YFxuXHRcdExhdGUgcHJpb3JpdHkgaXMgZ29pbmcgdG8gZm9yY2UgZXhwbGljaXQgcHJpb3JpdHkgaW4gYW55IG90aGVyIG1vdmluZyBwYXJ0cyB0aGF0IGFyZSBnb2luZyB0byB0b3VjaCBwb3J0Zm9saW8gbGF5b3V0IGF0IGBwaG9ydC5sb2FkZWRgXG5cdC0tLVxuXG4jIyNcbm1vZHVsZS5leHBvcnRzID1cblxuXHRwcmVwYXJlOiAtPlxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZSdcblx0XHRyZXR1cm5cblxuXHRjcmVhdGU6IC0+XG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5jcmVhdGUnXG5cdFx0cmV0dXJuXG5cblxuXHRyZWZyZXNoOiAtPlxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCdcblx0XHRyZXR1cm5cblxuXG5cdGRlc3Ryb3k6IC0+XG5cdFx0IyBEZXN0cm95XG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95J1xuXHRcdHJldHVyblxuIiwiSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuXG5cbiMjI1xuXHRBYnN0cmFjdCBDbGFzcyBQb3J0b2ZsaW9fRXZlbnRfSW1lcGxlbWVudGF0aW9uXG5cbiAgICBIYW5kbGVzIGFsbCB0aGUgZXZlbnRzIHJlcXVpcmVkIHRvIGZ1bGx5IGhhbmRsZSBhIHBvcnRmb2xpbyBsYXlvdXQgcHJvY2Vzc1xuIyMjXG5jbGFzcyBQb3J0Zm9saW9fSW50ZXJmYWNlXG5cblx0Y29uc3RydWN0b3I6ICggYXJncyApIC0+XG5cdFx0QHNldHVwX2FjdGlvbnMoKVxuXHRcdEBpbml0aWFsaXplKCBhcmdzIClcblxuXHRzZXR1cF9hY3Rpb25zOiAtPlxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnLCBAcHJlcGFyZSwgNTBcblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5jcmVhdGUnLCBAY3JlYXRlLCA1MFxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCBAcmVmcmVzaCwgNTBcblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgQGRlc3Ryb3ksIDUwXG5cdFx0SG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScsIEBwdXJnZV9hY3Rpb25zLCAxMDBcblxuXHRwdXJnZV9hY3Rpb25zOiA9PlxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnLCBAcHJlcGFyZSwgNTBcblx0XHRIb29rcy5yZW1vdmVBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5jcmVhdGUnLCBAY3JlYXRlLCA1MFxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCBAcmVmcmVzaCwgNTBcblx0XHRIb29rcy5yZW1vdmVBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgQGRlc3Ryb3ksIDUwXG5cdFx0SG9va3MucmVtb3ZlQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScsIEBwdXJnZV9hY3Rpb25zLCAxMDBcblxuXG5cdCMjI1xuICAgIFx0UmVxdWlyZSB0aGVzZSBtZXRob2RzXG5cdCMjI1xuXHRpbml0aWFsaXplOiAtPiB0aHJvdyBuZXcgRXJyb3IoIFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGBpbml0aWFsaXplYCBtZXRob2RcIiApXG5cdHByZXBhcmUgICA6IC0+IHRocm93IG5ldyBFcnJvciggXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYHByZXBhcmVgIG1ldGhvZFwiIClcblx0Y3JlYXRlICAgIDogLT4gdGhyb3cgbmV3IEVycm9yKCBcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgY3JlYXRlYCBtZXRob2RcIiApXG5cdHJlZnJlc2ggICA6IC0+IHRocm93IG5ldyBFcnJvciggXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYHJlZnJlc2hgIG1ldGhvZFwiIClcblx0ZGVzdHJveSAgIDogLT4gdGhyb3cgbmV3IEVycm9yKCBcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgZGVzdHJveWAgbWV0aG9kXCIgKVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW9fSW50ZXJmYWNlIiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5Qb3J0Zm9saW9fSW50ZXJmYWNlID0gcmVxdWlyZSggJy4vUG9ydGZvbGlvX0ludGVyZmFjZScgKVxuXG4jIEBUT0RPOiBOZWVkIGEgaGVhdnZ5IHJlZmFjdG9yIC0gbm8gbW9yZSBjbGFzc2VzIHBsZWFzZVxuY2xhc3MgUG9ydGZvbGlvX01hc29ucnkgZXh0ZW5kcyBQb3J0Zm9saW9fSW50ZXJmYWNlXG5cblx0Y29uc3RydWN0b3I6IC0+XG5cblx0XHRARWxlbWVudHMgPVxuXHRcdFx0Y29udGFpbmVyOiAnUFBfTWFzb25yeSdcblx0XHRcdHNpemVyICAgIDogJ1BQX01hc29ucnlfX3NpemVyJ1xuXHRcdFx0aXRlbSAgICAgOiAnUFBfTWFzb25yeV9faXRlbSdcblxuXHRcdHN1cGVyKClcblxuXHQjIyNcblx0XHRJbml0aWFsaXplXG5cdCMjI1xuXHRpbml0aWFsaXplOiAtPlxuXHRcdEAkY29udGFpbmVyID0gJCggXCIuI3tARWxlbWVudHMuY29udGFpbmVyfVwiIClcblxuXHQjIyNcblx0XHRQcmVwYXJlICYgQXR0YWNoIEV2ZW50c1xuICAgIFx0RG9uJ3Qgc2hvdyBhbnl0aGluZyB5ZXQuXG5cblx0XHRAY2FsbGVkIG9uIGhvb2sgYHBob3J0LnBvcnRmb2xpby5wcmVwYXJlYFxuXHQjIyNcblx0cHJlcGFyZTogPT5cblx0XHRyZXR1cm4gaWYgQCRjb250YWluZXIubGVuZ3RoIGlzIDBcblxuXHRcdEAkY29udGFpbmVyLmFkZENsYXNzKCAnUFBfSlNfX2xvYWRpbmdfbWFzb25yeScgKVxuXG5cdFx0QG1heWJlX2NyZWF0ZV9zaXplcigpXG5cblx0XHQjIE9ubHkgaW5pdGlhbGl6ZSwgaWYgbm8gbWFzb25yeSBleGlzdHNcblx0XHRtYXNvbnJ5X3NldHRpbmdzID0gSG9va3MuYXBwbHlGaWx0ZXJzICdwaG9ydC5tYXNvbnJ5LnNldHRpbmdzJyxcblx0XHRcdGl0ZW1TZWxlY3RvcjogXCIuI3tARWxlbWVudHMuaXRlbX1cIlxuXHRcdFx0Y29sdW1uV2lkdGggOiBcIi4je0BFbGVtZW50cy5zaXplcn1cIlxuXHRcdFx0Z3V0dGVyICAgICAgOiAwXG5cdFx0XHRpbml0TGF5b3V0ICA6IGZhbHNlXG5cblx0XHRAJGNvbnRhaW5lci5tYXNvbnJ5KCBtYXNvbnJ5X3NldHRpbmdzIClcblxuXHRcdEAkY29udGFpbmVyLm1hc29ucnkgJ29uY2UnLCAnbGF5b3V0Q29tcGxldGUnLCA9PlxuXHRcdFx0QCRjb250YWluZXJcblx0XHRcdFx0LnJlbW92ZUNsYXNzKCAnUFBfSlNfX2xvYWRpbmdfbWFzb25yeScgKVxuXHRcdFx0XHQuYWRkQ2xhc3MoICdQUF9KU19fbG9hZGluZ19jb21wbGV0ZScgKVxuXG5cdFx0XHQjIEB0cmlnZ2VyIHJlZnJlc2ggZXZlbnRcblx0XHRcdCMgdHJpZ2dlcnMgYEByZWZyZXNoKClgXG5cdFx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnXG5cblxuXHQjIyNcblx0XHRTdGFydCB0aGUgUG9ydGZvbGlvXG5cdFx0QGNhbGxlZCBvbiBob29rIGBwaG9ydC5wb3J0Zm9saW8uY3JlYXRlYFxuXHQjIyNcblx0Y3JlYXRlOiA9PlxuXHRcdEAkY29udGFpbmVyLm1hc29ucnkoKVxuXHRcdHJldHVyblxuXG5cblx0IyMjXG5cdFx0RGVzdHJveVxuXHRcdEBjYWxsZWQgb24gaG9vayBgcGhvcnQucG9ydGZvbGlvLmRlc3Ryb3lgXG5cdCMjI1xuXHRkZXN0cm95OiA9PlxuXHRcdEBtYXliZV9yZW1vdmVfc2l6ZXIoKVxuXG5cdFx0aWYgQCRjb250YWluZXIubGVuZ3RoID4gMFxuXHRcdFx0QCRjb250YWluZXIubWFzb25yeSggJ2Rlc3Ryb3knIClcblxuXG5cdFx0cmV0dXJuXG5cblxuXHQjIyNcblx0XHRSZWxvYWQgdGhlIGxheW91dFxuXHRcdEBjYWxsZWQgb24gaG9vayBgcGhvcnQucG9ydGZvbGlvLnJlZnJlc2hgXG5cdCMjI1xuXHRyZWZyZXNoOiA9PlxuXHRcdEAkY29udGFpbmVyLm1hc29ucnkoICdsYXlvdXQnIClcblxuXG5cblx0IyMjXG5cdFx0Q3JlYXRlIGEgc2l6ZXIgZWxlbWVudCBmb3IganF1ZXJ5LW1hc29ucnkgdG8gdXNlXG5cdCMjI1xuXHRtYXliZV9jcmVhdGVfc2l6ZXI6IC0+XG5cdFx0QGNyZWF0ZV9zaXplcigpIGlmIEBzaXplcl9kb2VzbnRfZXhpc3QoKVxuXHRcdHJldHVyblxuXG5cdG1heWJlX3JlbW92ZV9zaXplcjogLT5cblx0XHRyZXR1cm4gaWYgQCRjb250YWluZXIubGVuZ3RoIGlzbnQgMVxuXHRcdEAkY29udGFpbmVyLmZpbmQoIFwiLiN7QEVsZW1lbnRzLnNpemVyfVwiICkucmVtb3ZlKClcblx0XHRyZXR1cm5cblxuXHRzaXplcl9kb2VzbnRfZXhpc3Q6IC0+IEAkY29udGFpbmVyLmZpbmQoIFwiLiN7QEVsZW1lbnRzLnNpemVyfVwiICkubGVuZ3RoIGlzIDBcblxuXG5cdGNyZWF0ZV9zaXplcjogLT5cblx0XHRAJGNvbnRhaW5lci5hcHBlbmQgXCJcIlwiPGRpdiBjbGFzcz1cIiN7QEVsZW1lbnRzLnNpemVyfVwiPjwvZGl2PlwiXCJcIlxuXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gUG9ydGZvbGlvX01hc29ucnkiLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuJCA9IHJlcXVpcmUoICdqUXVlcnknIClcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcblxuIyBQb3J0Zm9saW8gbWFuYWdlciB3aWxsIHRyaWdnZXIgcG9ydGZvbGlvIGV2ZW50cyB3aGVuIG5lY2Vzc2FyeVxuVHJpZ2dlciA9IHJlcXVpcmUoICcuL1BvcnRmb2xpb19FdmVudHMnIClcblxuaXNfbWFzb25yeSA9IC0+XG5cdHJldHVybiAoICQoICcuUFBfTWFzb25yeScgKS5sZW5ndGggaXNudCAwIClcblxuIyBTdGFydCBNYXNvbnJ5IExheW91dFxuc3RhcnRfbWFzb25yeSA9IC0+XG5cdHJldHVybiBmYWxzZSBpZiBub3QgaXNfbWFzb25yeSgpXG5cblx0UG9ydGZvbGlvX01hc29ucnkgPSByZXF1aXJlKCAnLi9Qb3J0Zm9saW9fTWFzb25yeScgKVxuXHRuZXcgUG9ydGZvbGlvX01hc29ucnkoKVxuXG5tYXliZV9sYXp5X21hc29ucnkgPSAoIGhhbmRsZXIgKSAtPlxuXHQjIFVzZSBMYXp5X01hc29ucnkgaGFuZGxlciwgaWYgY3VycmVudCBsYXlvdXQgaXMgbWFzb25yeVxuXHRyZXR1cm4gcmVxdWlyZSggJ2xhenkvTGF6eV9NYXNvbnJ5JyApIGlmIGlzX21hc29ucnkoKVxuXHRyZXR1cm4gaGFuZGxlclxuXG5cbiMgU3RhcnQgUG9ydGZvbGlvXG5Ib29rcy5hZGRBY3Rpb24gJ3Bob3J0LmNvcmUucmVhZHknLCBUcmlnZ2VyLnByZXBhcmUsIDUwXG5Ib29rcy5hZGRBY3Rpb24gJ3Bob3J0LmNvcmUubG9hZGVkJywgVHJpZ2dlci5jcmVhdGUsIDUwXG5cbiMgSW5pdGlhbGl6ZSBNYXNvbnJ5IExheW91dFxuSG9va3MuYWRkQWN0aW9uICdwaG9ydC5jb3JlLnJlYWR5Jywgc3RhcnRfbWFzb25yeVxuXG4jIEluaXRpYWxpemUgTGF6eSBMb2FkaW5nIGZvciBNYXNvbnJ5IExheW91dFxuSG9va3MuYWRkRmlsdGVyICdwaG9ydC5sYXp5LmhhbmRsZXInLCBtYXliZV9sYXp5X21hc29ucnlcblxuXG5cbiJdfQ==
