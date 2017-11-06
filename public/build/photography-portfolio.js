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


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jb3JlL1V0aWxpdGllcy5qcyIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jb3JlL1dpbmRvdy5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY29yZS9zdGFydC5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvZ2FsbGVyeS9hZGFwdGVycy9saWdodGdhbGxlcnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvYWRhcHRlcnMvcGhvdG9zd2lwZS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvZ2FsbGVyeS9nYWxsZXJ5X2ZhY3RvcnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvZ2FsbGVyeV9pdGVtX2RhdGEuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvZ2FsbGVyeV9pdGVtX2ZhY3RvcnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvcHJlcGFyZV9nYWxsZXJ5X2ZhY3RvcnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvc3RhcnQuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvQWJzdHJhY3RfTGF6eV9Mb2FkZXIuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvTGF6eV9NYXNvbnJ5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L3N0YXJ0LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9wb3J0Zm9saW8vUG9ydGZvbGlvX0V2ZW50cy5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL1BvcnRmb2xpb19JbnRlcmZhY2UuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL3BvcnRmb2xpby9Qb3J0Zm9saW9fTWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL3N0YXJ0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7OztBQUFBLElBQUE7O0FBR0EsS0FBQSxHQUFRLE9BQUEsQ0FBUyxVQUFUOztBQUNSLENBQUEsR0FBSSxPQUFBLENBQVMsUUFBVDs7QUFHSixNQUFNLENBQUMsVUFBUCxHQUVDO0VBQUEsbUJBQUEsRUFBcUIsT0FBQSxDQUFTLGlDQUFULENBQXJCO0VBR0EsT0FBQSxFQUNDO0lBQUEsU0FBQSxFQUFjLE9BQUEsQ0FBUyw2QkFBVCxDQUFkO0lBQ0EsWUFBQSxFQUFjLE9BQUEsQ0FBUyxnQ0FBVCxDQURkO0dBSkQ7RUFRQSxvQkFBQSxFQUFzQixPQUFBLENBQVMsNkJBQVQsQ0FSdEI7OztBQVdELE1BQU0sQ0FBQyxxQkFBUCxHQUNDO0VBQUEsSUFBQSxFQUFrQixPQUFBLENBQVMsY0FBVCxDQUFsQjtFQUNBLGdCQUFBLEVBQWtCLE9BQUEsQ0FBUyxtQkFBVCxDQURsQjtFQUVBLE9BQUEsRUFBa0IsT0FBQSxDQUFTLGlCQUFULENBRmxCO0VBR0EsV0FBQSxFQUFrQixPQUFBLENBQVMsY0FBVCxDQUhsQjs7OztBQUtEOzs7O0FBR0EsQ0FBQSxDQUFHLFFBQUgsQ0FBYSxDQUFDLEtBQWQsQ0FBb0IsU0FBQTtFQUduQixJQUFVLENBQUksQ0FBQSxDQUFHLE1BQUgsQ0FBVyxDQUFDLFFBQVosQ0FBc0IsY0FBdEIsQ0FBZDtBQUFBLFdBQUE7O0VBR0EscUJBQXFCLENBQUMsSUFBSSxDQUFDLEtBQTNCLENBQUE7QUFObUIsQ0FBcEI7Ozs7OztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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dkQ7OzhCQUdwQixZQUFBLEdBQWMsU0FBQTtJQUNiLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFBWixDQUFtQixlQUFBLEdBQWlCLElBQUMsQ0FBQSxRQUFRLENBQUMsS0FBM0IsR0FBaUMsV0FBcEQ7RUFEYTs7OztHQWhHaUI7O0FBcUdoQyxNQUFNLENBQUMsT0FBUCxHQUFpQjs7Ozs7Ozs7QUM3R2pCOzs7QUFBQSxJQUFBOztBQUdBLENBQUEsR0FBSSxPQUFBLENBQVMsUUFBVDs7QUFDSixLQUFBLEdBQVEsT0FBQSxDQUFTLFVBQVQ7O0FBR1IsT0FBQSxHQUFVLE9BQUEsQ0FBUyxvQkFBVDs7QUFFVixVQUFBLEdBQWEsU0FBQTtBQUNaLFNBQVMsQ0FBQSxDQUFHLGFBQUgsQ0FBa0IsQ0FBQyxNQUFuQixLQUErQjtBQUQ1Qjs7QUFJYixhQUFBLEdBQWdCLFNBQUE7QUFDZixNQUFBO0VBQUEsSUFBZ0IsQ0FBSSxVQUFBLENBQUEsQ0FBcEI7QUFBQSxXQUFPLE1BQVA7O0VBRUEsaUJBQUEsR0FBb0IsT0FBQSxDQUFTLHFCQUFUO1NBQ3BCLElBQUksaUJBQUosQ0FBQTtBQUplOztBQU1oQixrQkFBQSxHQUFxQixTQUFFLE9BQUY7RUFFcEIsSUFBeUMsVUFBQSxDQUFBLENBQXpDO0FBQUEsV0FBTyxPQUFBLENBQVMsbUJBQVQsRUFBUDs7QUFDQSxTQUFPO0FBSGE7O0FBT3JCLEtBQUssQ0FBQyxTQUFOLENBQWdCLGtCQUFoQixFQUFvQyxPQUFPLENBQUMsT0FBNUMsRUFBcUQsRUFBckQ7O0FBQ0EsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsbUJBQWhCLEVBQXFDLE9BQU8sQ0FBQyxNQUE3QyxFQUFxRCxFQUFyRDs7QUFHQSxLQUFLLENBQUMsU0FBTixDQUFnQixrQkFBaEIsRUFBb0MsYUFBcEM7O0FBR0EsS0FBSyxDQUFDLFNBQU4sQ0FBZ0Isb0JBQWhCLEVBQXNDLGtCQUF0QyIsImZpbGUiOiJwaG90b2dyYXBoeS1wb3J0Zm9saW8uanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiMjI1xuICAgIExvYWQgRGVwZW5kZW5jaWVzXG4jIyNcbkhvb2tzID0gcmVxdWlyZSggJ3dwX2hvb2tzJyApXG4kID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuXG4jIEV4cG9zZSBzb21lIFBob3RvZ3JhcGh5IFBvcnRmb2xpbyBtb2R1bGVzIHRvIHRoZSBwdWJsaWMgZm9yIGV4dGVuc2liaWxpdHlcbndpbmRvdy5QUF9Nb2R1bGVzID1cblx0IyBFeHRlbmQgUG9ydGZvbGlvIEludGVyZmFjZSB0byBidWlsZCBjdXN0b20gcG9ydGZvbGlvIGxheW91dHMgYmFzZWQgb24gUFAgRXZlbnRzXG5cdFBvcnRmb2xpb19JbnRlcmZhY2U6IHJlcXVpcmUoICcuL3BvcnRmb2xpby9Qb3J0Zm9saW9fSW50ZXJmYWNlJyApXG5cbiMgVXNlIGBnYWxsZXJ5X2l0ZW1fZGF0YWAgdG8gZ2V0IGZvcm1hdHRlZCBpdGVtIGltYWdlIHNpemVzIGZvciBsYXp5IGxvYWRpbmdcblx0Z2FsbGVyeTpcblx0XHRpdGVtX2RhdGEgICA6IHJlcXVpcmUoICcuL2dhbGxlcnkvZ2FsbGVyeV9pdGVtX2RhdGEnIClcblx0XHRpdGVtX2ZhY3Rvcnk6IHJlcXVpcmUoICcuL2dhbGxlcnkvZ2FsbGVyeV9pdGVtX2ZhY3RvcnknIClcblxuIyBFeHRlbmQgQWJzdHJhY3RfTGF6eV9Mb2RlciB0byBpbXBsZW1lbnQgbGF6eSBsb2FkZXIgZm9yIHlvdXIgbGF5b3V0XG5cdEFic3RyYWN0X0xhenlfTG9hZGVyOiByZXF1aXJlKCAnLi9sYXp5L0Fic3RyYWN0X0xhenlfTG9hZGVyJyApXG5cblxud2luZG93LlBob3RvZ3JhcGh5X1BvcnRmb2xpbyA9XG5cdENvcmUgICAgICAgICAgICA6IHJlcXVpcmUoICcuL2NvcmUvc3RhcnQnIClcblx0UG9ydGZvbGlvX0xheW91dDogcmVxdWlyZSggJy4vcG9ydGZvbGlvL3N0YXJ0JyApXG5cdEdhbGxlcnkgICAgICAgICA6IHJlcXVpcmUoICcuL2dhbGxlcnkvc3RhcnQnIClcblx0TGF6eV9Mb2FkZXIgICAgIDogcmVxdWlyZSggJy4vbGF6eS9zdGFydCcgKVxuXG4jIyNcblx0Qm9vdCBvbiBgZG9jdW1lbnQucmVhZHlgXG4jIyNcbiQoIGRvY3VtZW50ICkucmVhZHkgLT5cblxuXHQjIE9ubHkgcnVuIHRoaXMgc2NyaXB0IHdoZW4gYm9keSBoYXMgYFBQX1BvcnRmb2xpb2AgY2xhc3Ncblx0cmV0dXJuIGlmIG5vdCAkKCAnYm9keScgKS5oYXNDbGFzcyggJ1BQX1BvcnRmb2xpbycgKVxuXG5cdCMgQm9vdFxuXHRQaG90b2dyYXBoeV9Qb3J0Zm9saW8uQ29yZS5yZWFkeSggKVxuXHRyZXR1cm5cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuXG5cbiAgICAvKipcbiAgICAgKiBUaGFuayB5b3UgUnVzcyBmb3IgaGVscGluZyBtZSBhdm9pZCB3cml0aW5nIHRoaXMgbXlzZWxmOlxuICAgICAqIEB1cmwgaHR0cHM6Ly9yZW15c2hhcnAuY29tLzIwMTAvMDcvMjEvdGhyb3R0bGluZy1mdW5jdGlvbi1jYWxscy8jY29tbWVudC0yNzQ1NjYzNTk0XG4gICAgICovXG4gICAgdGhyb3R0bGU6IGZ1bmN0aW9uICggZm4sIHRocmVzaGhvbGQsIHNjb3BlICkge1xuICAgICAgICB0aHJlc2hob2xkIHx8ICh0aHJlc2hob2xkID0gMjUwKVxuICAgICAgICB2YXIgbGFzdCxcbiAgICAgICAgICAgIGRlZmVyVGltZXJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBjb250ZXh0ID0gc2NvcGUgfHwgdGhpc1xuXG4gICAgICAgICAgICB2YXIgbm93ICA9ICtuZXcgRGF0ZSxcbiAgICAgICAgICAgICAgICBhcmdzID0gYXJndW1lbnRzXG4gICAgICAgICAgICBpZiAoIGxhc3QgJiYgbm93IDwgbGFzdCArIHRocmVzaGhvbGQgKSB7XG4gICAgICAgICAgICAgICAgLy8gaG9sZCBvbiB0byBpdFxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCggZGVmZXJUaW1lciApXG4gICAgICAgICAgICAgICAgZGVmZXJUaW1lciA9IHNldFRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFzdCA9IG5vd1xuICAgICAgICAgICAgICAgICAgICBmbi5hcHBseSggY29udGV4dCwgYXJncyApXG4gICAgICAgICAgICAgICAgfSwgdGhyZXNoaG9sZCArIGxhc3QgLSBub3cgKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsYXN0ID0gbm93XG4gICAgICAgICAgICAgICAgZm4uYXBwbHkoIGNvbnRleHQsIGFyZ3MgKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG5cbn0iLCJIb29rcyA9IHJlcXVpcmUoICd3cF9ob29rcycgKVxuXG5cbmdldF9zaXplID0gLT5cblx0d2lkdGggOiB3aW5kb3cuaW5uZXJXaWR0aCB8fCAkd2luZG93LndpZHRoKClcblx0aGVpZ2h0OiB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgJHdpbmRvdy5oZWlnaHQoKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0X3NpemUoKSIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuSG9va3MgPSByZXF1aXJlKCAnd3BfaG9va3MnIClcblxucmVhZHkgPSAtPlxuXHRpZiBIb29rcy5hcHBseUZpbHRlcnMoICdwaG9ydC5jb3JlLnJlYWR5JywgdHJ1ZSApXG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LmNvcmUucmVhZHknXG5cblx0IyBBdXRvbWF0aWNhbGx5IHRyaWdnZXIgYHBob3J0LmNvcmUubG9hZGVkYCB3aGVuIGltYWdlcyBhcmUgbG9hZGVkXG5cdCQoICcuUFBfV3JhcHBlcicgKS5pbWFnZXNMb2FkZWQoIGxvYWRlZCApXG5cdHJldHVyblxuXG5sb2FkZWQgPSAtPlxuXHRpZiBIb29rcy5hcHBseUZpbHRlcnMoICdwaG9ydC5jb3JlLmxvYWRlZCcsIHRydWUgKVxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5jb3JlLmxvYWRlZCdcblx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID1cblx0bG9hZGVkOiBsb2FkZWRcblx0cmVhZHkgOiByZWFkeSIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggXCJqUXVlcnlcIiApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5cbmRlZmF1bHRzID1cblx0ZHluYW1pYyA6IHRydWVcblx0c3BlZWQgICA6IDM1MFxuXHRwcmVsb2FkIDogM1xuXHRkb3dubG9hZDogZmFsc2Vcblx0ZXNjS2V5ICA6IGZhbHNlICMgV2UncmUgcm9sbGluZyBvdXIgb3duXG5cblx0dGh1bWJuYWlsICAgICAgICAgOiB0cnVlXG5cdHNob3dUaHVtYkJ5RGVmYXVsdDogdHJ1ZVxuXG4jIEBUT0RPOiBVc2UgT2JqZWN0LmFzc2lnbigpIHdpdGggQmFiZWxcbnNldHRpbmdzID0gJC5leHRlbmQoIHt9LCBkZWZhdWx0cywgd2luZG93Ll9fcGhvcnQubGlnaHRHYWxsZXJ5IClcblxuXG5zaW5nbGVfaXRlbV9kYXRhID0gKCBpdGVtICkgLT5cblxuXHRpZiBpdGVtLmRhdGEuZ2V0KCAndHlwZScgKSBpcyAndmlkZW8nXG5cdFx0ZnVsbCA9IGl0ZW0uZGF0YS5nZXQoICd2aWRlb191cmwnIClcblx0ZWxzZVxuXHRcdGZ1bGwgPSBpdGVtLmRhdGEudXJsKCAnZnVsbCcgKVxuXG5cdHJldHVybiB7XG5cdFx0c3JjICAgIDogZnVsbFxuXHRcdHRodW1iICA6IGl0ZW0uZGF0YS51cmwoICd0aHVtYicgKVxuXHRcdHN1Ykh0bWw6IGl0ZW0uY2FwdGlvblxuXHR9XG5cblxuZ2V0X3NldHRpbmdzID0gKCBnYWxsZXJ5LCBpbmRleCApIC0+XG5cdHNldHRpbmdzLmluZGV4ICAgICAgICAgPSBpbmRleFxuXHRzZXR0aW5ncy5keW5hbWljRWwgICAgID0gZ2FsbGVyeS5tYXAoIHNpbmdsZV9pdGVtX2RhdGEgKVxuXHRzZXR0aW5ncy52aWRlb01heFdpZHRoID0gd2luZG93LmlubmVyV2lkdGggKiAwLjhcblxuXHRIb29rcy5hcHBseUZpbHRlcnMgJ3Bob3J0LmxpZ2h0R2FsbGVyeS5zZXR0aW5ncycsIHNldHRpbmdzXG5cblxubW9kdWxlLmV4cG9ydHMgPSAoICRlbCApIC0+XG5cdGluc3RhbmNlOiAtPiBHYWxsZXJ5XG5cdGNsb3NlOiAtPlxuXHRcdEdhbGxlcnkgPSAkZWwuZGF0YSggJ2xpZ2h0R2FsbGVyeScgKVxuXHRcdEdhbGxlcnkuZGVzdHJveSggKSBpZiBHYWxsZXJ5IGFuZCBHYWxsZXJ5LmRlc3Ryb3k/XG5cblx0b3BlbjogKCBnYWxsZXJ5X2l0ZW1zLCBpbmRleCApIC0+XG5cdFx0R2FsbGVyeSA9ICRlbC5saWdodEdhbGxlcnkoIGdldF9zZXR0aW5ncyggZ2FsbGVyeV9pdGVtcywgaW5kZXggKSApXG5cblxuXG5cbiIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggXCJqUXVlcnlcIiApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5cbmxhYmVscyA9ICQuZXh0ZW5kKCB7fSwge1xuXHQnZmFjZWJvb2snOiAnU2hhcmUgb24gRmFjZWJvb2snLFxuXHQndHdpdHRlcic6ICdUd2VldCcsXG5cdCdwaW50ZXJlc3QnOiAnUGluIGl0Jyxcbn0sIHdpbmRvdy5fX3Bob3J0LmkxOG4ucGhvdG9zd2lwZSApXG5cblxuZGVmYXVsdHMgPVxuXHRpbmRleCAgICAgICA6IDBcblx0cHJlbG9hZCAgICAgOiBbIDEsIDMgXVxuXHRlc2NLZXkgICAgICA6IGZhbHNlXG5cdHNoYXJlQnV0dG9uczogW1xuXHRcdHsgaWQ6ICdmYWNlYm9vaycsIGxhYmVsOiBsYWJlbHMuZmFjZWJvb2ssIHVybDogJ2h0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS9zaGFyZXIvc2hhcmVyLnBocD91PXt7dXJsfX0nIH1cblx0XHR7IGlkOiAndHdpdHRlcicsIGxhYmVsIDogbGFiZWxzLnR3aXR0ZXIsIHVybDogJ2h0dHBzOi8vdHdpdHRlci5jb20vaW50ZW50L3R3ZWV0P3RleHQ9e3t0ZXh0fX0mdXJsPXt7dXJsfX0nIH1cblx0XHR7IGlkOiAncGludGVyZXN0JywgbGFiZWw6IGxhYmVscy5waW50ZXJlc3QsIHVybDogJ2h0dHA6Ly93d3cucGludGVyZXN0LmNvbS9waW4vY3JlYXRlL2J1dHRvbi8/dXJsPXt7dXJsfX0mbWVkaWE9e3tpbWFnZV91cmx9fSZkZXNjcmlwdGlvbj17e3RleHR9fScgfVxuXHRdXG5cblxucHN3cCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoICcucHN3cCcgKVxuVUkgPSBIb29rcy5hcHBseUZpbHRlcnMoIFwicGhvcnQucGhvdG9zd2lwZS5VSVwiLCB3aW5kb3cuUGhvdG9Td2lwZVVJX0RlZmF1bHQgKVxuUGhvdG9Td2lwZSA9IHdpbmRvdy5QaG90b1N3aXBlXG5cblxuY3JlYXRlID0gKCBkYXRhLCBvcHRzID0ge30gKSAtPlxuXHRvcHRpb25zID0gSG9va3MuYXBwbHlGaWx0ZXJzKCBcInBob3J0LnBob3Rvc3dpcGUub3B0aW9uc1wiLCAkLmV4dGVuZCgge30sIGRlZmF1bHRzLCBvcHRzICkgKVxuXG5cdCMgSW5kZXggaXMgMCBieSBkZWZhdWx0XG5cdGlmIG5vdCBvcHRpb25zLmluZGV4P1xuXHRcdG9wdGlvbnMuaW5kZXggPSAwXG5cblx0IyBTZXQgdGhlIGluZGV4IHRvIDAgaWYgaXQgaXNuJ3QgYSBwcm9wZXIgdmFsdWVcblx0aWYgbm90IG9wdGlvbnMuaW5kZXggb3Igb3B0aW9ucy5pbmRleCA8IDBcblx0XHRvcHRpb25zLmluZGV4ID0gMFxuXG5cdGluc3RhbmNlID0gbmV3IFBob3RvU3dpcGUoIHBzd3AsIFVJLCBkYXRhLCBvcHRpb25zIClcblx0aW5zdGFuY2UuaW5pdCggKVxuXG5cdHJldHVybiBpbnN0YW5jZVxuXG5cbnNpbmdsZV9pdGVtX2RhdGEgPSAoIGl0ZW0gKSAtPlxuXHQjIFBob3RvU3dpcGUgc3VwcG9ydHMgb25seSBpbWFnZXNcblx0cmV0dXJuIGlmIGl0ZW0uZGF0YS5nZXQoICd0eXBlJyApIGlzbnQgJ2ltYWdlJ1xuXG5cblx0W3dpZHRoLCBoZWlnaHRdID0gaXRlbS5kYXRhLnNpemUoICdmdWxsJyApXG5cblx0IyByZXR1cm5cblx0c3JjICA6IGl0ZW0uZGF0YS51cmwoICdmdWxsJyApXG5cdG1zcmMgOiBpdGVtLmRhdGEudXJsKCAnZnVsbCcgKVxuXHR3ICAgIDogd2lkdGhcblx0aCAgICA6IGhlaWdodFxuXHR0aXRsZTogaXRlbS5jYXB0aW9uXG5cblxudGh1bWJuYWlsX3Bvc2l0aW9uID0gKCAkZ2FsbGVyeSApIC0+IHJldHVybiAoIGluZGV4ICkgLT5cblx0cmV0dXJuIGZhbHNlIGlmIG5vdCAkZ2FsbGVyeS5sZW5ndGhcblxuXHQkZWwgPSAkZ2FsbGVyeS5lcSggaW5kZXggKVxuXHR0aHVtYm5haWwgPSAkZWwuZmluZCggJ2ltZycgKS5nZXQoIDAgKVxuXG5cdCMgVGh1bWJuYWlsIG11c3QgZXhpc3QgYmVmb3JlIGRpbWVuc2lvbnMgY2FuIGJlIG9idGFpbmVkXG5cdHJldHVybiBpZiBub3QgdGh1bWJuYWlsXG5cblx0cGFnZVlTY3JvbGwgPSB3aW5kb3cucGFnZVlPZmZzZXQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcFxuXHRyZWN0ID0gdGh1bWJuYWlsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCggKVxuXG5cdCMgLy8gdyA9IHdpZHRoXG5cdG91dCA9XG5cdFx0eDogcmVjdC5sZWZ0XG5cdFx0eTogcmVjdC50b3AgKyBwYWdlWVNjcm9sbFxuXHRcdHc6IHJlY3Qud2lkdGhcblxuXHRyZXR1cm4gb3V0XG5cblxubW9kdWxlLmV4cG9ydHMgPSAoICRlbCApIC0+XG5cdEdhbGxlcnkgPSBmYWxzZVxuXHRpbnN0YW5jZTogLT4gR2FsbGVyeVxuXHRjbG9zZTogLT5cblx0XHRyZXR1cm4gaWYgbm90IEdhbGxlcnlcblx0XHRHYWxsZXJ5LmNsb3NlKCApXG5cdFx0R2FsbGVyeSA9IGZhbHNlXG5cblx0b3BlbjogKCBnYWxsZXJ5LCBpbmRleCApIC0+XG5cdFx0b3B0aW9ucyA9XG5cdFx0XHRnZXRUaHVtYkJvdW5kc0ZuOiB0aHVtYm5haWxfcG9zaXRpb24oICRlbC5jbG9zZXN0KCAnLlBQX0dhbGxlcnknICkuZmluZCggJy5QUF9HYWxsZXJ5X19pdGVtJyApIClcblx0XHRcdGluZGV4ICAgICAgICAgICA6IGluZGV4XG5cblx0XHRHYWxsZXJ5ID0gY3JlYXRlKCBnYWxsZXJ5Lm1hcCggc2luZ2xlX2l0ZW1fZGF0YSApLCBvcHRpb25zIClcblxuXG5cbiIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuSG9va3MgPSByZXF1aXJlKCAnd3BfaG9va3MnIClcbmdhbGVyeV9pdGVtX2RhdGEgPSByZXF1aXJlKCAnLi9nYWxsZXJ5X2l0ZW1fZmFjdG9yeScgKVxuXG5cbnBhcnNlX2dhbGxlcnlfaXRlbSA9ICgga2V5LCBlbCApIC0+XG5cdCRlbCA9ICQoIGVsIClcblxuXHRpbmRleCAgOiBrZXlcblx0ZGF0YSAgIDogZ2FsZXJ5X2l0ZW1fZGF0YSggJGVsIClcblx0Y2FwdGlvbjogJGVsLmZpbmQoICcuUFBfR2FsbGVyeV9fY2FwdGlvbicgKS5odG1sKCApIHx8ICcnXG5cblxubW9kdWxlLmV4cG9ydHMgPSAoIEdhbGxlcnlfRHJpdmVyICkgLT5cblx0aW5zdGFuY2UgPSBmYWxzZVxuXG5cdG9wZW4gPSAoIGVsICkgLT5cblx0XHQkZWwgPSAkKCBlbCApXG5cdFx0JGl0ZW1zID0gJGVsLmNsb3Nlc3QoICcuUFBfR2FsbGVyeScgKS5maW5kKCAnLlBQX0dhbGxlcnlfX2l0ZW0nIClcblxuXHRcdGlmICRpdGVtcy5sZW5ndGggPiAwXG5cdFx0XHRpbmRleCA9ICRpdGVtcy5pbmRleCggJGVsIClcblx0XHRcdGdhbGxlcnlfaXRlbXMgPSAkLm1ha2VBcnJheSggJGl0ZW1zLm1hcCggcGFyc2VfZ2FsbGVyeV9pdGVtICkgKVxuXG5cdFx0XHRpbnN0YW5jZSA9IEdhbGxlcnlfRHJpdmVyKCAkZWwgKVxuXHRcdFx0aW5zdGFuY2Uub3BlbiggZ2FsbGVyeV9pdGVtcywgaW5kZXggKVxuXG5cdFx0XHRIb29rcy5kb0FjdGlvbiggJ3Bob3J0LmdhbGxlcnkub3BlbicsIGluc3RhbmNlLCBnYWxsZXJ5X2l0ZW1zLCBpbmRleCApXG5cblx0XHRyZXR1cm5cblxuXHRvcGVuOiBvcGVuXG5cblx0aGFuZGxlX2hhc2g6IC0+XG5cdFx0aW5kZXggPSBwYXJzZUludCggd2luZG93LmxvY2F0aW9uLmhhc2guc3BsaXQoICcmcGlkPScgKVsgMSBdLCAxMCApXG5cdFx0ZWwgPSAkKCAnLlBQX0dhbGxlcnknICkuZmlyc3QoICkuZmluZCggJy5QUF9HYWxsZXJ5X19pdGVtJyApLmdldCggaW5kZXggKVxuXHRcdG9wZW4oIGVsIClcblxuXHRcdHJldHVyblxuXG5cdGNsb3NlOiAtPlxuXHRcdHJldHVybiBmYWxzZSBpZiBub3QgaW5zdGFuY2VcblxuXHRcdGluc3RhbmNlLmNsb3NlKCApXG5cdFx0aW5zdGFuY2UgPSBmYWxzZVxuXG5cdFx0SG9va3MuZG9BY3Rpb24oICdwaG9ydC5nYWxsZXJ5Lm9wZW4nLCBpbnN0YW5jZSApXG5cdFx0cmV0dXJuIiwiaXRlbV9kYXRhID0gKCBkYXRhX29iaiApIC0+XG5cblx0cGx1Y2sgPSAoIG9iamVjdCwga2V5ICkgLT5cblx0XHRpZiBvYmplY3QgYW5kIG9iamVjdFsga2V5IF1cblx0XHRcdHJldHVybiBvYmplY3RbIGtleSBdXG5cdFx0cmV0dXJuIGZhbHNlXG5cblx0Z2V0ID0gKCBrZXkgKSAtPiBwbHVjayggZGF0YV9vYmosIGtleSApXG5cblx0aW1hZ2UgPSAoIHNpemVfbmFtZSApIC0+IHBsdWNrKCBnZXQoICdpbWFnZXMnICksIHNpemVfbmFtZSApXG5cblxuXHRzaXplOiAoIHNpemVfbmFtZSApIC0+XG5cdFx0aW1hZ2Vfc2l6ZSA9IHBsdWNrKCBpbWFnZSggc2l6ZV9uYW1lICksICdzaXplJyApXG5cdFx0cmV0dXJuIGZhbHNlIGlmIG5vdCBpbWFnZV9zaXplXG5cblx0XHRbd2lkdGgsIGhlaWdodF0gPSBpbWFnZV9zaXplLnNwbGl0KCAneCcgKVxuXG5cdFx0d2lkdGggPSBwYXJzZUludCggd2lkdGggKVxuXHRcdGhlaWdodCA9IHBhcnNlSW50KCBoZWlnaHQgKVxuXG5cdFx0cmV0dXJuIFsgd2lkdGgsIGhlaWdodCBdXG5cblx0dXJsOiAoIHNpemVfbmFtZSApIC0+IHBsdWNrKCBpbWFnZSggc2l6ZV9uYW1lICksICd1cmwnIClcblx0Z2V0OiBnZXRcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGl0ZW1fZGF0YSIsIml0ZW0gPSByZXF1aXJlKCcuL2dhbGxlcnlfaXRlbV9kYXRhJylcblxuaXRlbV9kYXRhID0gKCAkZWwgKSAtPlxuXHRkYXRhX29iaiA9ICRlbC5kYXRhKCAnaXRlbScgKVxuXG5cdGlmIG5vdCBkYXRhX29ialxuXHRcdHRocm93IG5ldyBFcnJvciBcIkVsZW1lbnQgZG9lc24ndCBjb250YWluIGBkYXRhLWl0ZW1gIGF0dHJpYnV0ZVwiXG5cblx0cmV0dXJuIGl0ZW0oIGRhdGFfb2JqIClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGl0ZW1fZGF0YSIsIkhvb2tzID0gcmVxdWlyZShcIndwX2hvb2tzXCIpXG5cbiNcbiMgVGhpcyBmaWxlIGlzIGdvaW5nIHRvIHJldHVybiBhIFtHYWxsZXJ5IEZhY3RvcnldIGluc3RhbmNlXG4jIEVhc3kgUGhvdG9ncmFwaHkgUG9ydGZvbGlvIGlzIHVzaW5nIHRoYXQgdG8gb3Blbi9jbG9zZS9kZXN0cm95IGdhbGxlcmllc1xuI1xuIyBbR2FsbGVyeSBGYWN0b3J5XSByZWxpZXMgb24gYSBbQWRhcHRlcl1cbiMgSW5zdGVhZCBvZiByZWx5aW5nIGRpcmVjdGx5IG9uIGEgZGVwZW5kZW5jeSwgR2FsbGVyeSBGYWN0b3J5IHJlbGllcyBvbiBhIEFkYXB0ZXIgdGhhdCBjYW4gYmUgbW9kaWZpZWRcbiMgQSBBZGFwdGVyIGlzIGFuIGFkYXB0ZXIgZm9yIGEgUG9wdXAtR2FsbGVyeSBwbHVnaW4sIHN1Y2ggYXMgTGlnaHRHYWxsZXJ5IG9yIFBob3RvU3dpcGVcbiNcbiMgU28gd2hlbiBhIGdhbGxlcnkgaXMgb3BlbmVkLCB0aGlzIGlzIHByb2JhYmx5IGhvdyBpdCdzIGdvaW5nIHRvIGxvb2s6XG4jIFtHYWxsZXJ5IEZhY3RvcnldIGFza3MgW0FkYXB0ZXJdIHRvIGZpbmQgYW5kIG9wZW4gYSBnYWxsZXJ5IHdpdGggW2FueSBMaWdodEJveCBMaWJyYXJ5XVxuI1xuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgR2FsbGVyeSBBZGFwdGVyOlxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5zZXR1cF9kcml2ZXIgPSAoIGRyaXZlcl9uYW1lID0gJ2xpZ2h0Z2FsbGVyeScgKSAtPlxuXHRpZiBkcml2ZXJfbmFtZSBpcyAnbGlnaHRnYWxsZXJ5J1xuXHRcdGFkYXB0ZXIgPSByZXF1aXJlKCAnLi9hZGFwdGVycy9saWdodGdhbGxlcnknIClcblxuXHRpZiBkcml2ZXJfbmFtZSBpcyAncGhvdG9zd2lwZSdcblx0XHRhZGFwdGVyID0gcmVxdWlyZSggJy4vYWRhcHRlcnMvcGhvdG9zd2lwZScgKVxuXG5cdHJldHVybiBIb29rcy5hcHBseUZpbHRlcnMoICdwaG9ydC5nYWxsZXJ5LmRyaXZlcicsIGFkYXB0ZXIgKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgR2FsbGVyeSBGYWN0b3J5OlxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIFRoZSBnYWxsZXJ5IGZhY3RvcnkgaXMgd2hhdCB3ZSdyZSBpbnRlcmFjdGluZyB3aXRoIHRvIG9wZW4vY2xvc2UgYSBnYWxsZXJ5XG5zZXR1cF9mYWN0b3J5ID0gLT5cblx0ZmFjdG9yeSA9IHJlcXVpcmUoICcuL2dhbGxlcnlfZmFjdG9yeScgKVxuXHRyZXR1cm4gSG9va3MuYXBwbHlGaWx0ZXJzKCAncGhvcnQuZ2FsbGVyeS5mYWN0b3J5JywgZmFjdG9yeSApXG5cbiNcbiMgUmV0dXJuIGEgZmFjdG9yeSBpbnN0YW5jZVxuI1xuXG5nYWxsZXJ5X2RyaXZlciA9IHNldHVwX2RyaXZlciggd2luZG93Ll9fcGhvcnQucG9wdXBfZ2FsbGVyeSApXG5nYWxsZXJ5X2ZhY3RvcnkgPSBzZXR1cF9mYWN0b3J5KCApXG5cbm1vZHVsZS5leHBvcnRzID0gZ2FsbGVyeV9mYWN0b3J5KCBnYWxsZXJ5X2RyaXZlciApIiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoICd3cF9ob29rcycgKVxuR2FsbGVyeSA9IHJlcXVpcmUoICcuL3ByZXBhcmVfZ2FsbGVyeV9mYWN0b3J5JyApXG5cbkhvb2tzLmFkZEFjdGlvbiAncGhvcnQuY29yZS5yZWFkeScsIC0+XG5cblx0aGFuZGxlX2NsaWNrcyA9IEhvb2tzLmFwcGx5RmlsdGVycyggJ3Bob3J0LmdhbGxlcnkuaGFuZGxlX2NsaWNrcycsIHRydWUgKVxuXHRoYW5kbGVfaGFzaCA9IEhvb2tzLmFwcGx5RmlsdGVycyggJ3Bob3J0LmdhbGxlcnkuaGFuZGxlX2hhc2gnLCB0cnVlIClcblx0aGFuZGxlX2VzY19rZXkgPSBIb29rcy5hcHBseUZpbHRlcnMoICdwaG9ydC5nYWxsZXJ5LmN1c3RvbV9lc2MnLCB0cnVlIClcblxuXHQjIEhhbmRsZSBIYXNoY2hhbmdlXG5cdGlmIGhhbmRsZV9oYXNoIGFuZCB3aW5kb3cubG9jYXRpb24uaGFzaCBhbmQgR2FsbGVyeS5oYW5kbGVfaGFzaFxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQuY29yZS5sb2FkZWQnLCBHYWxsZXJ5LmhhbmRsZV9oYXNoXG5cblx0IyBIYW5kbGUgQ2xpY2tzXG5cdGlmIGhhbmRsZV9jbGlja3Ncblx0XHQkKCBkb2N1bWVudCApLm9uICdjbGljaycsICcuUFBfR2FsbGVyeV9faXRlbScsICggZSApIC0+XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCApXG5cdFx0XHRHYWxsZXJ5Lm9wZW4oIHRoaXMgKVxuXG5cblx0IyBIYW5kbGUgRVNDYXBlIEtleVxuXHRpZiBoYW5kbGVfZXNjX2tleVxuXHRcdCQoIHdpbmRvdyApLm9uICdrZXlkb3duJywgKCBlICkgLT5cblx0XHRcdHJldHVybiB1bmxlc3MgZS5rZXkgaXMgJ0VzY2FwZSdcblx0XHRcdGUucHJldmVudERlZmF1bHQoIClcblx0XHRcdEdhbGxlcnkuY2xvc2UoIClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbGxlcnlcbiIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuZ2FsbGVyeV9pdGVtID0gcmVxdWlyZSggJy4uL2dhbGxlcnkvZ2FsbGVyeV9pdGVtX2ZhY3RvcnknIClcbl9fV0lORE9XID0gcmVxdWlyZSggJy4uL2NvcmUvV2luZG93JyApXG50aHJvdHRsZSA9IHJlcXVpcmUoJy4uL2NvcmUvVXRpbGl0aWVzJykudGhyb3R0bGVcblxuY2xhc3MgQWJzdHJhY3RfTGF6eV9Mb2FkZXJcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QEVsZW1lbnRzID1cblx0XHRcdGl0ZW0gICAgICAgOiAnUFBfTGF6eV9JbWFnZSdcblx0XHRcdHBsYWNlaG9sZGVyOiAnUFBfTGF6eV9JbWFnZV9fcGxhY2Vob2xkZXInXG5cdFx0XHRsaW5rICAgICAgIDogJ1BQX0pTX0xhenlfX2xpbmsnXG5cdFx0XHRpbWFnZSAgICAgIDogJ1BQX0pTX0xhenlfX2ltYWdlJ1xuXG5cdFx0QEl0ZW1zID0gW11cblxuXHRcdCMgQWRqdXN0YWJsZSBTZW5zaXRpdml0eSBmb3IgQGluX3ZpZXcgZnVuY3Rpb25cblx0XHQjIFZhbHVlIGluIHBpeGVsc1xuXHRcdEBTZW5zaXRpdml0eSA9IDEwMFxuXG5cdFx0IyBBdXRvLXNldHVwIHdoZW4gZXZlbnRzIGFyZSBhdHRhY2hlZFxuXHRcdCMgQXV0by1kZXN0cm95IHdoZW4gZXZlbnRzIGFyZSBkZXRhY2hlZFxuXHRcdEB0aHJvdHRsZWRfYXV0b2xvYWQgPSBudWxsXG5cblx0XHRAc2V0dXBfaXRlbXMoKVxuXHRcdEByZXNpemVfYWxsKClcblx0XHRAYXR0YWNoX2V2ZW50cygpXG5cblx0IyMjXG5cdFx0QWJzdHJhY3QgTWV0aG9kc1xuXHQjIyNcblxuXHQjIFRoaXMgaXMgcnVuIHdoZW4gYSByZXNpemUgb3IgcmVmcmVzaCBldmVudCBpcyBkZXRlY3RlZFxuXHRyZXNpemU6IC0+IHJldHVyblxuXG5cdGxvYWQ6ICggaXRlbSApIC0+XG5cdFx0QGxvYWRfaW1hZ2UoIGl0ZW0gKVxuXHRcdGl0ZW0uJGVsLmltYWdlc0xvYWRlZCA9PlxuXHRcdFx0QGNsZWFudXBfYWZ0ZXJfbG9hZCggaXRlbSApXG5cblx0bG9hZF9pbWFnZTogKCBpdGVtICkgLT5cblxuXHRcdCMgR2V0IGltYWdlIFVSTHNcblx0XHR0aHVtYiA9IGl0ZW0uZGF0YS51cmwoICd0aHVtYicgKVxuXHRcdGZ1bGwgPSBpdGVtLmRhdGEudXJsKCAnZnVsbCcgKVxuXG5cdFx0IyBDcmVhdGUgZWxlbWVudHNcblx0XHRpdGVtLiRlbFxuXHRcdFx0LnByZXBlbmQoIEBnZXRfaXRlbV9odG1sKCB0aHVtYiwgZnVsbCApIClcblx0XHRcdC5yZW1vdmVDbGFzcyggJ0xhenktSW1hZ2UnIClcblxuXHRcdCMgTWFrZSBzdXJlIHRoaXMgaW1hZ2UgaXNuJ3QgbG9hZGVkIGFnYWluXG5cdFx0aXRlbS5sb2FkZWQgPSB0cnVlXG5cblx0Y2xlYW51cF9hZnRlcl9sb2FkOiAoIGl0ZW0gKSAtPlxuXHRcdCMgQWRkIGltYWdlIFBQX0pTX2xvYWRlZCBjbGFzc1xuXHRcdGl0ZW0uJGVsLmZpbmQoICdpbWcnICkuYWRkQ2xhc3MoICdQUF9KU19fbG9hZGVkJyApLnJlbW92ZUNsYXNzKCAnUFBfSlNfX2xvYWRpbmcnIClcblxuXHRcdGl0ZW0uJGVsXG5cblx0XHRcdCMgUmVtb3ZlIGBQUF9MYXp5X0ltYWdlYCwgYXMgdGhpcyBpcyBub3QgYSBsYXp5LWxvYWRhYmxlIGltYWdlIGFueW1vcmVcblx0XHRcdC5yZW1vdmVDbGFzcyggQEVsZW1lbnRzLml0ZW0gKVxuXG5cdFx0XHQjIFJlbW92ZSBQbGFjZWhvbGRlclxuXHRcdFx0LmZpbmQoIFwiLiN7QEVsZW1lbnRzLnBsYWNlaG9sZGVyfVwiIClcblx0XHRcdC5mYWRlT3V0KCA0MDAsIC0+ICQoIHRoaXMgKS5yZW1vdmUoKSApXG5cblx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQubGF6eS5sb2FkZWRfaXRlbScsIGl0ZW1cblxuXG5cdGdldF9pdGVtX2h0bWw6ICggdGh1bWIsIGZ1bGwgKSAtPlxuXG5cdFx0aWYgJ2Rpc2FibGUnIGlzIHdpbmRvdy5fX3Bob3J0LnBvcHVwX2dhbGxlcnlcblx0XHRcdHJldHVybiBcIlwiXCJcblx0XHRcdDxkaXYgY2xhc3M9XCIje0BFbGVtZW50cy5saW5rfVwiIHJlbD1cImdhbGxlcnlcIj5cblx0XHRcdFx0PGltZyBjbGFzcz1cIiN7QEVsZW1lbnRzLmltYWdlfVwiIHNyYz1cIiN7dGh1bWJ9XCIgY2xhc3M9XCJQUF9KU19fbG9hZGluZ1wiIC8+XG5cdFx0XHQ8L2Rpdj5cblx0XHRcdFwiXCJcIlxuXHRcdGVsc2Vcblx0XHRcdHJldHVybiBcIlwiXCJcblx0XHRcdDxhIGNsYXNzPVwiI3tARWxlbWVudHMubGlua31cIiBocmVmPVwiI3tmdWxsfVwiIHJlbD1cImdhbGxlcnlcIj5cblx0XHRcdFx0PGltZyBjbGFzcz1cIiN7QEVsZW1lbnRzLmltYWdlfVwiIHNyYz1cIiN7dGh1bWJ9XCIgY2xhc3M9XCJQUF9KU19fbG9hZGluZ1wiIC8+XG5cdFx0XHQ8L2E+XG5cdFx0XHRcIlwiXCJcblxuXHRzZXR1cF9pdGVtczogPT5cblx0XHQjIENsZWFyIGV4aXN0aW5nIGl0ZW1zLCBpZiBhbnlcblx0XHRASXRlbXMgPSBbXVxuXG5cdFx0IyBMb29wIG92ZXIgRE9NIGFuZCBhZGQgZWFjaCBpdGVtIHRvIEBJdGVtc1xuXHRcdCQoIFwiLiN7QEVsZW1lbnRzLml0ZW19XCIgKS5lYWNoKCBAYWRkX2l0ZW0gKVxuXHRcdHJldHVyblxuXG5cdGFkZF9pdGVtOiAoIGtleSwgZWwgKSA9PlxuXHRcdCRlbCA9ICQoIGVsIClcblx0XHRASXRlbXMucHVzaFxuXHRcdFx0ZWwgICAgOiBlbFxuXHRcdFx0JGVsICAgOiAkZWxcblx0XHRcdGRhdGEgIDogZ2FsbGVyeV9pdGVtKCAkZWwgKVxuXHRcdFx0bG9hZGVkOiBmYWxzZVxuXG5cblx0XHRyZXR1cm5cblxuXG5cdCMjI1xuXHRcdE1ldGhvZHNcblx0IyMjXG5cdHJlc2l6ZV9hbGw6IC0+XG5cdFx0QHJlc2l6ZSggaXRlbSApIGZvciBpdGVtIGluIEBJdGVtc1xuXG5cblxuXHQjIEF1dG9tYXRpY2FsbHkgTG9hZCBhbGwgaXRlbXMgdGhhdCBhcmUgYGluX2xvb3NlX3ZpZXdgXG5cdGF1dG9sb2FkOiA9PlxuXHRcdGZvciBpdGVtLCBrZXkgaW4gQEl0ZW1zXG5cdFx0XHRpZiBub3QgaXRlbS5sb2FkZWQgYW5kIEBpbl9sb29zZV92aWV3KCBpdGVtLmVsIClcblx0XHRcdFx0QGxvYWQoIGl0ZW0gKVxuXG5cdGluX2xvb3NlX3ZpZXc6ICggZWwgKSAtPlxuXHRcdHJldHVybiB0cnVlIGlmIG5vdCBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3Q/XG5cdFx0cmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG5cblx0XHQjIEVsZW1lbnRzIG5vdCBpbiB2aWV3IGlmIHRoZXkgZG9uJ3QgaGF2ZSBkaW1lbnNpb25zXG5cdFx0cmV0dXJuIGZhbHNlIGlmIHJlY3QuaGVpZ2h0IGlzIDAgYW5kIHJlY3Qud2lkdGggaXMgMFxuXG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0IyBZIEF4aXNcblx0XHRcdHJlY3QudG9wICsgcmVjdC5oZWlnaHQgPj0gLUBTZW5zaXRpdml0eSBhbmQgIyB0b3Bcblx0XHRcdHJlY3QuYm90dG9tIC0gcmVjdC5oZWlnaHQgPD0gX19XSU5ET1cuaGVpZ2h0ICsgQFNlbnNpdGl2aXR5IGFuZFxuXG5cdFx0XHQjIFggQXhpc1xuXHRcdFx0cmVjdC5sZWZ0ICsgcmVjdC53aWR0aCA+PSAtQFNlbnNpdGl2aXR5IGFuZFxuXHRcdFx0cmVjdC5yaWdodCAtIHJlY3Qud2lkdGggPD0gX19XSU5ET1cud2lkdGggKyBAU2Vuc2l0aXZpdHlcblxuXHRcdClcblxuXHRkZXN0cm95OiAtPlxuXHRcdEBkZXRhY2hfZXZlbnRzKClcblxuXHRhdHRhY2hfZXZlbnRzOiAtPlxuXHRcdCMgQ3JlYXRlIGEgZGVib3VuY2VkIGBhdXRvbG9hZGAgZnVuY3Rpb25cblx0XHRAdGhyb3R0bGVkX2F1dG9sb2FkID0gdGhyb3R0bGUoIEBhdXRvbG9hZCwgNTAgKVxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCBAdGhyb3R0bGVkX2F1dG9sb2FkLCAxMDBcblxuXG5cdGRldGFjaF9ldmVudHM6IC0+XG5cdFx0IyBDbGVhciB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uIGZyb20gaW5zdGFuY2Vcblx0XHRAdGhyb3R0bGVkX2F1dG9sb2FkID0gbnVsbFxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCBAdGhyb3R0bGVkX2F1dG9sb2FkLCAxMDBcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQWJzdHJhY3RfTGF6eV9Mb2FkZXJcbiIsIiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5BYnN0cmFjdF9MYXp5X0xvYWRlciA9IHJlcXVpcmUoICcuL0Fic3RyYWN0X0xhenlfTG9hZGVyJyApXG5fX1dJTkRPVyA9IHJlcXVpcmUoICcuLi9jb3JlL1dpbmRvdycgKVxuXG5jbGFzcyBMYXp5X01hc29ucnkgZXh0ZW5kcyBBYnN0cmFjdF9MYXp5X0xvYWRlclxuXG5cdHJlc2l6ZV9hbGw6IC0+XG5cdFx0QHBsYWNlaG9sZGVyX3dpZHRoID0gJCggJy5QUF9NYXNvbnJ5X19zaXplcicgKS53aWR0aCgpXG5cdFx0c3VwZXIoKVxuXG5cdHJlc2l6ZTogKCBpdGVtICkgLT5cblx0XHRpdGVtLiRlbC5jc3MgJ21pbi1oZWlnaHQnOiBNYXRoLmZsb29yKCBAcGxhY2Vob2xkZXJfd2lkdGggLyBpdGVtLmRhdGEuZ2V0KCdyYXRpbycpIClcblxuXHRjbGVhbnVwX2FmdGVyX2xvYWQ6IChpdGVtKSAtPlxuXHRcdCMgUmVtb3ZlIG1pbi1oZWlnaHRcblx0XHRpdGVtLiRlbC5jc3MoICdtaW4taGVpZ2h0JywgJycgKVxuXG5cdFx0IyBSdW4gYWxsIG90aGVyIGNsZWFudXBzXG5cdFx0c3VwZXIoIGl0ZW0gKVxuXG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5yZWZyZXNoJ1xuXG5cdFx0cmV0dXJuXG5cblx0YXR0YWNoX2V2ZW50czogLT5cblx0XHQjIENhbGwgUGFyZW50IGZpcnN0LCBpdCdzIGdvaW5nIHRvIGNyZWF0ZSBAdGhyb3R0bGVkX2F1dG9sb2FkXG5cdFx0c3VwZXIoKVxuXG5cdFx0IyBBdHRhY2hcblx0XHQkKCB3aW5kb3cgKS5vbiAnc2Nyb2xsJywgQHRocm90dGxlZF9hdXRvbG9hZFxuXG5cblxuXHRkZXRhY2hfZXZlbnRzOiAtPlxuXHRcdCMgRGV0YWNoXG5cdFx0JCggd2luZG93ICkub2ZmICdzY3JvbGwnLCBAdGhyb3R0bGVkX2F1dG9sb2FkXG5cblx0XHQjIENhbGwgcGFyZW50IGxhc3QsIGl0J3MgZ29pbmcgdG8gY2xlYW4gdXAgQHRocm90dGxlZF9hdXRvbG9hZFxuXHRcdHN1cGVyKClcblxuXHRkZXN0cm95OiAtPlxuXHRcdGZvciBpdGVtLCBrZXkgaW4gQEl0ZW1zXG5cdFx0XHRpdGVtLiRlbC5jc3MgJ21pbi1oZWlnaHQnLCAnJ1xuXHRcdHN1cGVyKClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IExhenlfTWFzb25yeVxuIiwiJCA9IHJlcXVpcmUoICdqUXVlcnknIClcbkhvb2tzID0gcmVxdWlyZSggJ3dwX2hvb2tzJyApXG5cblxuaW5zdGFuY2UgPSBmYWxzZVxuXG5kZXN0cm95ID0gLT5cblx0cmV0dXJuIGlmIG5vdCBpbnN0YW5jZVxuXHRpbnN0YW5jZS5kZXN0cm95KCApXG5cdGluc3RhbmNlID0gbnVsbFxuXG5jcmVhdGUgPSAtPlxuXG5cdCMgTWFrZSBzdXJlIGFuIGluc3RhbmNlIGRvZXNuJ3QgYWxyZWFkeSBleGlzdFxuXHRkZXN0cm95KCApXG5cblx0IyBIYW5kbGVyIHJlcXVpcmVkXG5cdEhhbmRsZXIgPSBIb29rcy5hcHBseUZpbHRlcnMgJ3Bob3J0LmxhenkuaGFuZGxlcicsIGZhbHNlXG5cdHJldHVybiBpZiBub3QgSGFuZGxlclxuXG5cdCMgQnkgZGVmYXVsdCBMYXp5X01hc29ucnkgaXMgaGFuZGxpbmcgTGF6eS1Mb2FkaW5nXG5cdCMgQ2hlY2sgaWYgYW55b25lIHdhbnRzIHRvIGhpamFjayBoYW5kbGVyXG5cdGluc3RhbmNlID0gbmV3IEhhbmRsZXIoIClcblxuXHRyZXR1cm5cblxuXG4jIEluaXRpYWxpemUgbGF6eSBsb2FkZXIgYWZ0ZXIgdGhlIHBvcnRmb2xpbyBpcyBwcmVwYXJlZCwgcCA9IDEwMFxuSG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZScsIGNyZWF0ZSwgMTAwXG5Ib29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgZGVzdHJveVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5cdGNyZWF0ZSA6IGNyZWF0ZVxuXHRkZXN0cm95OiBkZXN0cm95IiwiSG9va3MgPSByZXF1aXJlKCAnd3BfaG9va3MnIClcblxuIyMjXG5cbiAgICAjIEluaXRpYWxpemUgUG9ydGZvbGlvIENvcmVcblx0LS0tXG5cdFx0VXNpbmcgcDUwIEAgYHBob3J0LmNvcmUucmVhZHlgXG5cdFx0TGF0ZSBwcmlvcml0eSBpcyBnb2luZyB0byBmb3JjZSBleHBsaWNpdCBwcmlvcml0eSBpbiBhbnkgb3RoZXIgbW92aW5nIHBhcnRzIHRoYXQgYXJlIGdvaW5nIHRvIHRvdWNoIHBvcnRmb2xpbyBsYXlvdXQgYXQgYHBob3J0LmxvYWRlZGBcblx0LS0tXG5cbiMjI1xubW9kdWxlLmV4cG9ydHMgPVxuXG5cdHByZXBhcmU6IC0+XG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5wcmVwYXJlJ1xuXHRcdHJldHVyblxuXG5cdGNyZWF0ZTogLT5cblx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQucG9ydGZvbGlvLmNyZWF0ZSdcblx0XHRyZXR1cm5cblxuXG5cdHJlZnJlc2g6IC0+XG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5yZWZyZXNoJ1xuXHRcdHJldHVyblxuXG5cblx0ZGVzdHJveTogLT5cblx0XHQjIERlc3Ryb3lcblx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQucG9ydGZvbGlvLmRlc3Ryb3knXG5cdFx0cmV0dXJuXG4iLCJIb29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5cblxuIyMjXG5cdEFic3RyYWN0IENsYXNzIFBvcnRvZmxpb19FdmVudF9JbWVwbGVtZW50YXRpb25cblxuICAgIEhhbmRsZXMgYWxsIHRoZSBldmVudHMgcmVxdWlyZWQgdG8gZnVsbHkgaGFuZGxlIGEgcG9ydGZvbGlvIGxheW91dCBwcm9jZXNzXG4jIyNcbmNsYXNzIFBvcnRmb2xpb19JbnRlcmZhY2VcblxuXHRjb25zdHJ1Y3RvcjogKCBhcmdzICkgLT5cblx0XHRAc2V0dXBfYWN0aW9ucygpXG5cdFx0QGluaXRpYWxpemUoIGFyZ3MgKVxuXG5cdHNldHVwX2FjdGlvbnM6IC0+XG5cdFx0SG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZScsIEBwcmVwYXJlLCA1MFxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLmNyZWF0ZScsIEBjcmVhdGUsIDUwXG5cdFx0SG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCcsIEByZWZyZXNoLCA1MFxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLmRlc3Ryb3knLCBAZGVzdHJveSwgNTBcblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgQHB1cmdlX2FjdGlvbnMsIDEwMFxuXG5cdHB1cmdlX2FjdGlvbnM6ID0+XG5cdFx0SG9va3MucmVtb3ZlQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZScsIEBwcmVwYXJlLCA1MFxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLmNyZWF0ZScsIEBjcmVhdGUsIDUwXG5cdFx0SG9va3MucmVtb3ZlQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCcsIEByZWZyZXNoLCA1MFxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLmRlc3Ryb3knLCBAZGVzdHJveSwgNTBcblx0XHRIb29rcy5yZW1vdmVBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgQHB1cmdlX2FjdGlvbnMsIDEwMFxuXG5cblx0IyMjXG4gICAgXHRSZXF1aXJlIHRoZXNlIG1ldGhvZHNcblx0IyMjXG5cdGluaXRpYWxpemU6IC0+IHRocm93IG5ldyBFcnJvciggXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYGluaXRpYWxpemVgIG1ldGhvZFwiIClcblx0cHJlcGFyZSAgIDogLT4gdGhyb3cgbmV3IEVycm9yKCBcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgcHJlcGFyZWAgbWV0aG9kXCIgKVxuXHRjcmVhdGUgICAgOiAtPiB0aHJvdyBuZXcgRXJyb3IoIFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGBjcmVhdGVgIG1ldGhvZFwiIClcblx0cmVmcmVzaCAgIDogLT4gdGhyb3cgbmV3IEVycm9yKCBcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgcmVmcmVzaGAgbWV0aG9kXCIgKVxuXHRkZXN0cm95ICAgOiAtPiB0aHJvdyBuZXcgRXJyb3IoIFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGBkZXN0cm95YCBtZXRob2RcIiApXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBvcnRmb2xpb19JbnRlcmZhY2UiLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuJCA9IHJlcXVpcmUoICdqUXVlcnknIClcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcblBvcnRmb2xpb19JbnRlcmZhY2UgPSByZXF1aXJlKCAnLi9Qb3J0Zm9saW9fSW50ZXJmYWNlJyApXG5cbiMgQFRPRE86IE5lZWQgYSBoZWF2dnkgcmVmYWN0b3IgLSBubyBtb3JlIGNsYXNzZXMgcGxlYXNlXG5jbGFzcyBQb3J0Zm9saW9fTWFzb25yeSBleHRlbmRzIFBvcnRmb2xpb19JbnRlcmZhY2VcblxuXHRjb25zdHJ1Y3RvcjogLT5cblxuXHRcdEBFbGVtZW50cyA9XG5cdFx0XHRjb250YWluZXI6ICdQUF9NYXNvbnJ5J1xuXHRcdFx0c2l6ZXIgICAgOiAnUFBfTWFzb25yeV9fc2l6ZXInXG5cdFx0XHRpdGVtICAgICA6ICdQUF9NYXNvbnJ5X19pdGVtJ1xuXG5cdFx0c3VwZXIoKVxuXG5cdCMjI1xuXHRcdEluaXRpYWxpemVcblx0IyMjXG5cdGluaXRpYWxpemU6IC0+XG5cdFx0QCRjb250YWluZXIgPSAkKCBcIi4je0BFbGVtZW50cy5jb250YWluZXJ9XCIgKVxuXG5cdCMjI1xuXHRcdFByZXBhcmUgJiBBdHRhY2ggRXZlbnRzXG4gICAgXHREb24ndCBzaG93IGFueXRoaW5nIHlldC5cblxuXHRcdEBjYWxsZWQgb24gaG9vayBgcGhvcnQucG9ydGZvbGlvLnByZXBhcmVgXG5cdCMjI1xuXHRwcmVwYXJlOiA9PlxuXHRcdHJldHVybiBpZiBAJGNvbnRhaW5lci5sZW5ndGggaXMgMFxuXG5cdFx0QCRjb250YWluZXIuYWRkQ2xhc3MoICdQUF9KU19fbG9hZGluZ19tYXNvbnJ5JyApXG5cblx0XHRAbWF5YmVfY3JlYXRlX3NpemVyKClcblxuXHRcdCMgT25seSBpbml0aWFsaXplLCBpZiBubyBtYXNvbnJ5IGV4aXN0c1xuXHRcdG1hc29ucnlfc2V0dGluZ3MgPSBIb29rcy5hcHBseUZpbHRlcnMgJ3Bob3J0Lm1hc29ucnkuc2V0dGluZ3MnLFxuXHRcdFx0aXRlbVNlbGVjdG9yOiBcIi4je0BFbGVtZW50cy5pdGVtfVwiXG5cdFx0XHRjb2x1bW5XaWR0aCA6IFwiLiN7QEVsZW1lbnRzLnNpemVyfVwiXG5cdFx0XHRndXR0ZXIgICAgICA6IDBcblx0XHRcdGluaXRMYXlvdXQgIDogZmFsc2VcblxuXHRcdEAkY29udGFpbmVyLm1hc29ucnkoIG1hc29ucnlfc2V0dGluZ3MgKVxuXG5cdFx0QCRjb250YWluZXIubWFzb25yeSAnb25jZScsICdsYXlvdXRDb21wbGV0ZScsID0+XG5cdFx0XHRAJGNvbnRhaW5lclxuXHRcdFx0XHQucmVtb3ZlQ2xhc3MoICdQUF9KU19fbG9hZGluZ19tYXNvbnJ5JyApXG5cdFx0XHRcdC5hZGRDbGFzcyggJ1BQX0pTX19sb2FkaW5nX2NvbXBsZXRlJyApXG5cblx0XHRcdCMgQHRyaWdnZXIgcmVmcmVzaCBldmVudFxuXHRcdFx0IyB0cmlnZ2VycyBgQHJlZnJlc2goKWBcblx0XHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCdcblxuXG5cdCMjI1xuXHRcdFN0YXJ0IHRoZSBQb3J0Zm9saW9cblx0XHRAY2FsbGVkIG9uIGhvb2sgYHBob3J0LnBvcnRmb2xpby5jcmVhdGVgXG5cdCMjI1xuXHRjcmVhdGU6ID0+XG5cdFx0QCRjb250YWluZXIubWFzb25yeSgpXG5cdFx0cmV0dXJuXG5cblxuXHQjIyNcblx0XHREZXN0cm95XG5cdFx0QGNhbGxlZCBvbiBob29rIGBwaG9ydC5wb3J0Zm9saW8uZGVzdHJveWBcblx0IyMjXG5cdGRlc3Ryb3k6ID0+XG5cdFx0QG1heWJlX3JlbW92ZV9zaXplcigpXG5cblx0XHRpZiBAJGNvbnRhaW5lci5sZW5ndGggPiAwXG5cdFx0XHRAJGNvbnRhaW5lci5tYXNvbnJ5KCAnZGVzdHJveScgKVxuXG5cblx0XHRyZXR1cm5cblxuXG5cdCMjI1xuXHRcdFJlbG9hZCB0aGUgbGF5b3V0XG5cdFx0QGNhbGxlZCBvbiBob29rIGBwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaGBcblx0IyMjXG5cdHJlZnJlc2g6ID0+XG5cdFx0QCRjb250YWluZXIubWFzb25yeSggJ2xheW91dCcgKVxuXG5cblxuXHQjIyNcblx0XHRDcmVhdGUgYSBzaXplciBlbGVtZW50IGZvciBqcXVlcnktbWFzb25yeSB0byB1c2Vcblx0IyMjXG5cdG1heWJlX2NyZWF0ZV9zaXplcjogLT5cblx0XHRAY3JlYXRlX3NpemVyKCkgaWYgQHNpemVyX2RvZXNudF9leGlzdCgpXG5cdFx0cmV0dXJuXG5cblx0bWF5YmVfcmVtb3ZlX3NpemVyOiAtPlxuXHRcdHJldHVybiBpZiBAJGNvbnRhaW5lci5sZW5ndGggaXNudCAxXG5cdFx0QCRjb250YWluZXIuZmluZCggXCIuI3tARWxlbWVudHMuc2l6ZXJ9XCIgKS5yZW1vdmUoKVxuXHRcdHJldHVyblxuXG5cdHNpemVyX2RvZXNudF9leGlzdDogLT4gQCRjb250YWluZXIuZmluZCggXCIuI3tARWxlbWVudHMuc2l6ZXJ9XCIgKS5sZW5ndGggaXMgMFxuXG5cblx0Y3JlYXRlX3NpemVyOiAtPlxuXHRcdEAkY29udGFpbmVyLmFwcGVuZCBcIlwiXCI8ZGl2IGNsYXNzPVwiI3tARWxlbWVudHMuc2l6ZXJ9XCI+PC9kaXY+XCJcIlwiXG5cblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW9fTWFzb25yeSIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuXG4jIFBvcnRmb2xpbyBtYW5hZ2VyIHdpbGwgdHJpZ2dlciBwb3J0Zm9saW8gZXZlbnRzIHdoZW4gbmVjZXNzYXJ5XG5UcmlnZ2VyID0gcmVxdWlyZSggJy4vUG9ydGZvbGlvX0V2ZW50cycgKVxuXG5pc19tYXNvbnJ5ID0gLT5cblx0cmV0dXJuICggJCggJy5QUF9NYXNvbnJ5JyApLmxlbmd0aCBpc250IDAgKVxuXG4jIFN0YXJ0IE1hc29ucnkgTGF5b3V0XG5zdGFydF9tYXNvbnJ5ID0gLT5cblx0cmV0dXJuIGZhbHNlIGlmIG5vdCBpc19tYXNvbnJ5KClcblxuXHRQb3J0Zm9saW9fTWFzb25yeSA9IHJlcXVpcmUoICcuL1BvcnRmb2xpb19NYXNvbnJ5JyApXG5cdG5ldyBQb3J0Zm9saW9fTWFzb25yeSgpXG5cbm1heWJlX2xhenlfbWFzb25yeSA9ICggaGFuZGxlciApIC0+XG5cdCMgVXNlIExhenlfTWFzb25yeSBoYW5kbGVyLCBpZiBjdXJyZW50IGxheW91dCBpcyBtYXNvbnJ5XG5cdHJldHVybiByZXF1aXJlKCAnbGF6eS9MYXp5X01hc29ucnknICkgaWYgaXNfbWFzb25yeSgpXG5cdHJldHVybiBoYW5kbGVyXG5cblxuIyBTdGFydCBQb3J0Zm9saW9cbkhvb2tzLmFkZEFjdGlvbiAncGhvcnQuY29yZS5yZWFkeScsIFRyaWdnZXIucHJlcGFyZSwgNTBcbkhvb2tzLmFkZEFjdGlvbiAncGhvcnQuY29yZS5sb2FkZWQnLCBUcmlnZ2VyLmNyZWF0ZSwgNTBcblxuIyBJbml0aWFsaXplIE1hc29ucnkgTGF5b3V0XG5Ib29rcy5hZGRBY3Rpb24gJ3Bob3J0LmNvcmUucmVhZHknLCBzdGFydF9tYXNvbnJ5XG5cbiMgSW5pdGlhbGl6ZSBMYXp5IExvYWRpbmcgZm9yIE1hc29ucnkgTGF5b3V0XG5Ib29rcy5hZGRGaWx0ZXIgJ3Bob3J0LmxhenkuaGFuZGxlcicsIG1heWJlX2xhenlfbWFzb25yeVxuXG5cblxuIl19
