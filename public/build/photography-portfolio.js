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

},{"./core/start":4,"./gallery/gallery_item_data":8,"./gallery/gallery_item_factory":9,"./gallery/start":11,"./lazy/Abstract_Lazy_Loader":12,"./lazy/start":15,"./portfolio/Portfolio_Interface":17,"./portfolio/start":19}],2:[function(require,module,exports){
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
  options = $.extend({}, defaults, opts);
  options = Hooks.applyFilters("phort.photoswipe.options", options, data, opts);
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

$(document).ready(function() {
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
var $, Abstract_Lazy_Loader, Hooks, Lazy_Default,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Abstract_Lazy_Loader = require("./Abstract_Lazy_Loader");

Lazy_Default = (function(superClass) {
  extend(Lazy_Default, superClass);

  function Lazy_Default() {
    return Lazy_Default.__super__.constructor.apply(this, arguments);
  }

  Lazy_Default.prototype.resize = function(item) {
    var h, height, ratio, ref, smallest_width, w, width;
    ref = item.data.size("thumb"), w = ref[0], h = ref[1];
    ratio = item.data.get("ratio");
    smallest_width = Math.min(item.$el.width(), w);
    height = Math.floor(smallest_width / ratio);
    width = Math.floor(smallest_width);
    return item.$el.css({
      "width": width,
      "height": height
    });
  };

  Lazy_Default.prototype.cleanup_after_load = function(item) {
    item.$el.css("min-height", "");
    Lazy_Default.__super__.cleanup_after_load.call(this, item);
    Hooks.doAction("phort.portfolio.refresh");
  };

  Lazy_Default.prototype.attach_events = function() {
    Lazy_Default.__super__.attach_events.call(this);
    return $(window).on("scroll", this.throttled_autoload);
  };

  Lazy_Default.prototype.detach_events = function() {
    $(window).off("scroll", this.throttled_autoload);
    return Lazy_Default.__super__.detach_events.call(this);
  };

  Lazy_Default.prototype.destroy = function() {
    var i, item, key, len, ref;
    ref = this.Items;
    for (key = i = 0, len = ref.length; i < len; key = ++i) {
      item = ref[key];
      item.$el.css({
        'min-height': '',
        'max-width': ''
      });
    }
    return Lazy_Default.__super__.destroy.call(this);
  };

  return Lazy_Default;

})(Abstract_Lazy_Loader);

module.exports = Lazy_Default;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./Abstract_Lazy_Loader":12}],14:[function(require,module,exports){
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

},{"../core/Window":3,"./Abstract_Lazy_Loader":12}],15:[function(require,module,exports){
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
  Handler = Hooks.applyFilters('phort.lazy.handler', require('./Lazy_Default'));
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

},{"./Lazy_Default":13}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
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

},{"./Portfolio_Interface":17}],19:[function(require,module,exports){
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

},{"./Portfolio_Events":16,"./Portfolio_Masonry":18,"lazy/Lazy_Masonry":14}]},{},[1])


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jb3JlL1V0aWxpdGllcy5qcyIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jb3JlL1dpbmRvdy5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY29yZS9zdGFydC5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvZ2FsbGVyeS9hZGFwdGVycy9saWdodGdhbGxlcnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvYWRhcHRlcnMvcGhvdG9zd2lwZS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvZ2FsbGVyeS9nYWxsZXJ5X2ZhY3RvcnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvZ2FsbGVyeV9pdGVtX2RhdGEuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvZ2FsbGVyeV9pdGVtX2ZhY3RvcnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvcHJlcGFyZV9nYWxsZXJ5X2ZhY3RvcnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvc3RhcnQuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvQWJzdHJhY3RfTGF6eV9Mb2FkZXIuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvTGF6eV9EZWZhdWx0LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0xhenlfTWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvbGF6eS9zdGFydC5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL1BvcnRmb2xpb19FdmVudHMuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL3BvcnRmb2xpby9Qb3J0Zm9saW9fSW50ZXJmYWNlLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9wb3J0Zm9saW8vUG9ydGZvbGlvX01hc29ucnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL3BvcnRmb2xpby9zdGFydC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOzs7QUFBQSxJQUFBOztBQUdBLEtBQUEsR0FBUSxPQUFBLENBQVMsVUFBVDs7QUFDUixDQUFBLEdBQUksT0FBQSxDQUFTLFFBQVQ7O0FBR0osTUFBTSxDQUFDLFVBQVAsR0FFQztFQUFBLG1CQUFBLEVBQXFCLE9BQUEsQ0FBUyxpQ0FBVCxDQUFyQjtFQUdBLE9BQUEsRUFDQztJQUFBLFNBQUEsRUFBYyxPQUFBLENBQVMsNkJBQVQsQ0FBZDtJQUNBLFlBQUEsRUFBYyxPQUFBLENBQVMsZ0NBQVQsQ0FEZDtHQUpEO0VBUUEsb0JBQUEsRUFBc0IsT0FBQSxDQUFTLDZCQUFULENBUnRCOzs7QUFXRCxNQUFNLENBQUMscUJBQVAsR0FDQztFQUFBLElBQUEsRUFBa0IsT0FBQSxDQUFTLGNBQVQsQ0FBbEI7RUFDQSxnQkFBQSxFQUFrQixPQUFBLENBQVMsbUJBQVQsQ0FEbEI7RUFFQSxPQUFBLEVBQWtCLE9BQUEsQ0FBUyxpQkFBVCxDQUZsQjtFQUdBLFdBQUEsRUFBa0IsT0FBQSxDQUFTLGNBQVQsQ0FIbEI7Ozs7QUFLRDs7OztBQUdBLENBQUEsQ0FBRyxRQUFILENBQWEsQ0FBQyxLQUFkLENBQW9CLFNBQUE7RUFHbkIsSUFBVSxDQUFJLENBQUEsQ0FBRyxNQUFILENBQVcsQ0FBQyxRQUFaLENBQXNCLGNBQXRCLENBQWQ7QUFBQSxXQUFBOztFQUdBLHFCQUFxQixDQUFDLElBQUksQ0FBQyxLQUEzQixDQUFBO0FBTm1CLENBQXBCOzs7Ozs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QU9yQixLQUFLLENBQUMsU0FBTixDQUFnQixrQkFBaEIsRUFBb0MsT0FBTyxDQUFDLE9BQTVDLEVBQXFELEVBQXJEOztBQUNBLEtBQUssQ0FBQyxTQUFOLENBQWdCLG1CQUFoQixFQUFxQyxPQUFPLENBQUMsTUFBN0MsRUFBcUQsRUFBckQ7O0FBR0EsS0FBSyxDQUFDLFNBQU4sQ0FBZ0Isa0JBQWhCLEVBQW9DLGFBQXBDOztBQUdBLEtBQUssQ0FBQyxTQUFOLENBQWdCLG9CQUFoQixFQUFzQyxrQkFBdEMiLCJmaWxlIjoicGhvdG9ncmFwaHktcG9ydGZvbGlvLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIjIyNcbiAgICBMb2FkIERlcGVuZGVuY2llc1xuIyMjXG5Ib29rcyA9IHJlcXVpcmUoICd3cF9ob29rcycgKVxuJCA9IHJlcXVpcmUoICdqUXVlcnknIClcblxuIyBFeHBvc2Ugc29tZSBQaG90b2dyYXBoeSBQb3J0Zm9saW8gbW9kdWxlcyB0byB0aGUgcHVibGljIGZvciBleHRlbnNpYmlsaXR5XG53aW5kb3cuUFBfTW9kdWxlcyA9XG5cdCMgRXh0ZW5kIFBvcnRmb2xpbyBJbnRlcmZhY2UgdG8gYnVpbGQgY3VzdG9tIHBvcnRmb2xpbyBsYXlvdXRzIGJhc2VkIG9uIFBQIEV2ZW50c1xuXHRQb3J0Zm9saW9fSW50ZXJmYWNlOiByZXF1aXJlKCAnLi9wb3J0Zm9saW8vUG9ydGZvbGlvX0ludGVyZmFjZScgKVxuXG4jIFVzZSBgZ2FsbGVyeV9pdGVtX2RhdGFgIHRvIGdldCBmb3JtYXR0ZWQgaXRlbSBpbWFnZSBzaXplcyBmb3IgbGF6eSBsb2FkaW5nXG5cdGdhbGxlcnk6XG5cdFx0aXRlbV9kYXRhICAgOiByZXF1aXJlKCAnLi9nYWxsZXJ5L2dhbGxlcnlfaXRlbV9kYXRhJyApXG5cdFx0aXRlbV9mYWN0b3J5OiByZXF1aXJlKCAnLi9nYWxsZXJ5L2dhbGxlcnlfaXRlbV9mYWN0b3J5JyApXG5cbiMgRXh0ZW5kIEFic3RyYWN0X0xhenlfTG9kZXIgdG8gaW1wbGVtZW50IGxhenkgbG9hZGVyIGZvciB5b3VyIGxheW91dFxuXHRBYnN0cmFjdF9MYXp5X0xvYWRlcjogcmVxdWlyZSggJy4vbGF6eS9BYnN0cmFjdF9MYXp5X0xvYWRlcicgKVxuXG5cbndpbmRvdy5QaG90b2dyYXBoeV9Qb3J0Zm9saW8gPVxuXHRDb3JlICAgICAgICAgICAgOiByZXF1aXJlKCAnLi9jb3JlL3N0YXJ0JyApXG5cdFBvcnRmb2xpb19MYXlvdXQ6IHJlcXVpcmUoICcuL3BvcnRmb2xpby9zdGFydCcgKVxuXHRHYWxsZXJ5ICAgICAgICAgOiByZXF1aXJlKCAnLi9nYWxsZXJ5L3N0YXJ0JyApXG5cdExhenlfTG9hZGVyICAgICA6IHJlcXVpcmUoICcuL2xhenkvc3RhcnQnIClcblxuIyMjXG5cdEJvb3Qgb24gYGRvY3VtZW50LnJlYWR5YFxuIyMjXG4kKCBkb2N1bWVudCApLnJlYWR5IC0+XG5cblx0IyBPbmx5IHJ1biB0aGlzIHNjcmlwdCB3aGVuIGJvZHkgaGFzIGBQUF9Qb3J0Zm9saW9gIGNsYXNzXG5cdHJldHVybiBpZiBub3QgJCggJ2JvZHknICkuaGFzQ2xhc3MoICdQUF9Qb3J0Zm9saW8nIClcblxuXHQjIEJvb3Rcblx0UGhvdG9ncmFwaHlfUG9ydGZvbGlvLkNvcmUucmVhZHkoIClcblx0cmV0dXJuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcblxuXG4gICAgLyoqXG4gICAgICogVGhhbmsgeW91IFJ1c3MgZm9yIGhlbHBpbmcgbWUgYXZvaWQgd3JpdGluZyB0aGlzIG15c2VsZjpcbiAgICAgKiBAdXJsIGh0dHBzOi8vcmVteXNoYXJwLmNvbS8yMDEwLzA3LzIxL3Rocm90dGxpbmctZnVuY3Rpb24tY2FsbHMvI2NvbW1lbnQtMjc0NTY2MzU5NFxuICAgICAqL1xuICAgIHRocm90dGxlOiBmdW5jdGlvbiAoIGZuLCB0aHJlc2hob2xkLCBzY29wZSApIHtcbiAgICAgICAgdGhyZXNoaG9sZCB8fCAodGhyZXNoaG9sZCA9IDI1MClcbiAgICAgICAgdmFyIGxhc3QsXG4gICAgICAgICAgICBkZWZlclRpbWVyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgY29udGV4dCA9IHNjb3BlIHx8IHRoaXNcblxuICAgICAgICAgICAgdmFyIG5vdyAgPSArbmV3IERhdGUsXG4gICAgICAgICAgICAgICAgYXJncyA9IGFyZ3VtZW50c1xuICAgICAgICAgICAgaWYgKCBsYXN0ICYmIG5vdyA8IGxhc3QgKyB0aHJlc2hob2xkICkge1xuICAgICAgICAgICAgICAgIC8vIGhvbGQgb24gdG8gaXRcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoIGRlZmVyVGltZXIgKVxuICAgICAgICAgICAgICAgIGRlZmVyVGltZXIgPSBzZXRUaW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3QgPSBub3dcbiAgICAgICAgICAgICAgICAgICAgZm4uYXBwbHkoIGNvbnRleHQsIGFyZ3MgKVxuICAgICAgICAgICAgICAgIH0sIHRocmVzaGhvbGQgKyBsYXN0IC0gbm93IClcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGFzdCA9IG5vd1xuICAgICAgICAgICAgICAgIGZuLmFwcGx5KCBjb250ZXh0LCBhcmdzIClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuXG59IiwiSG9va3MgPSByZXF1aXJlKCAnd3BfaG9va3MnIClcblxuXG5nZXRfc2l6ZSA9IC0+XG5cdHdpZHRoIDogd2luZG93LmlubmVyV2lkdGggfHwgJHdpbmRvdy53aWR0aCgpXG5cdGhlaWdodDogd2luZG93LmlubmVySGVpZ2h0IHx8ICR3aW5kb3cuaGVpZ2h0KClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldF9zaXplKCkiLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuJCA9IHJlcXVpcmUoICdqUXVlcnknIClcbkhvb2tzID0gcmVxdWlyZSggJ3dwX2hvb2tzJyApXG5cbnJlYWR5ID0gLT5cblx0aWYgSG9va3MuYXBwbHlGaWx0ZXJzKCAncGhvcnQuY29yZS5yZWFkeScsIHRydWUgKVxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5jb3JlLnJlYWR5J1xuXG5cdCMgQXV0b21hdGljYWxseSB0cmlnZ2VyIGBwaG9ydC5jb3JlLmxvYWRlZGAgd2hlbiBpbWFnZXMgYXJlIGxvYWRlZFxuXHQkKCAnLlBQX1dyYXBwZXInICkuaW1hZ2VzTG9hZGVkKCBsb2FkZWQgKVxuXHRyZXR1cm5cblxubG9hZGVkID0gLT5cblx0aWYgSG9va3MuYXBwbHlGaWx0ZXJzKCAncGhvcnQuY29yZS5sb2FkZWQnLCB0cnVlIClcblx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQuY29yZS5sb2FkZWQnXG5cdHJldHVyblxuXG5tb2R1bGUuZXhwb3J0cyA9XG5cdGxvYWRlZDogbG9hZGVkXG5cdHJlYWR5IDogcmVhZHkiLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuJCA9IHJlcXVpcmUoIFwialF1ZXJ5XCIgKVxuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuXG5kZWZhdWx0cyA9XG5cdGR5bmFtaWMgOiB0cnVlXG5cdHNwZWVkICAgOiAzNTBcblx0cHJlbG9hZCA6IDNcblx0ZG93bmxvYWQ6IGZhbHNlXG5cdGVzY0tleSAgOiBmYWxzZSAjIFdlJ3JlIHJvbGxpbmcgb3VyIG93blxuXG5cdHRodW1ibmFpbCAgICAgICAgIDogdHJ1ZVxuXHRzaG93VGh1bWJCeURlZmF1bHQ6IHRydWVcblxuIyBAVE9ETzogVXNlIE9iamVjdC5hc3NpZ24oKSB3aXRoIEJhYmVsXG5zZXR0aW5ncyA9ICQuZXh0ZW5kKCB7fSwgZGVmYXVsdHMsIHdpbmRvdy5fX3Bob3J0LmxpZ2h0R2FsbGVyeSApXG5cblxuc2luZ2xlX2l0ZW1fZGF0YSA9ICggaXRlbSApIC0+XG5cblx0aWYgaXRlbS5kYXRhLmdldCggJ3R5cGUnICkgaXMgJ3ZpZGVvJ1xuXHRcdGZ1bGwgPSBpdGVtLmRhdGEuZ2V0KCAndmlkZW9fdXJsJyApXG5cdGVsc2Vcblx0XHRmdWxsID0gaXRlbS5kYXRhLnVybCggJ2Z1bGwnIClcblxuXHRyZXR1cm4ge1xuXHRcdHNyYyAgICA6IGZ1bGxcblx0XHR0aHVtYiAgOiBpdGVtLmRhdGEudXJsKCAndGh1bWInIClcblx0XHRzdWJIdG1sOiBpdGVtLmNhcHRpb25cblx0fVxuXG5cbmdldF9zZXR0aW5ncyA9ICggZ2FsbGVyeSwgaW5kZXggKSAtPlxuXHRzZXR0aW5ncy5pbmRleCAgICAgICAgID0gaW5kZXhcblx0c2V0dGluZ3MuZHluYW1pY0VsICAgICA9IGdhbGxlcnkubWFwKCBzaW5nbGVfaXRlbV9kYXRhIClcblx0c2V0dGluZ3MudmlkZW9NYXhXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoICogMC44XG5cblx0SG9va3MuYXBwbHlGaWx0ZXJzICdwaG9ydC5saWdodEdhbGxlcnkuc2V0dGluZ3MnLCBzZXR0aW5nc1xuXG5cbm1vZHVsZS5leHBvcnRzID0gKCAkZWwgKSAtPlxuXHRpbnN0YW5jZTogLT4gR2FsbGVyeVxuXHRjbG9zZTogLT5cblx0XHRHYWxsZXJ5ID0gJGVsLmRhdGEoICdsaWdodEdhbGxlcnknIClcblx0XHRHYWxsZXJ5LmRlc3Ryb3koICkgaWYgR2FsbGVyeSBhbmQgR2FsbGVyeS5kZXN0cm95P1xuXG5cdG9wZW46ICggZ2FsbGVyeV9pdGVtcywgaW5kZXggKSAtPlxuXHRcdEdhbGxlcnkgPSAkZWwubGlnaHRHYWxsZXJ5KCBnZXRfc2V0dGluZ3MoIGdhbGxlcnlfaXRlbXMsIGluZGV4ICkgKVxuXG5cblxuXG4iLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuJCA9IHJlcXVpcmUoIFwialF1ZXJ5XCIgKVxuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuXG5sYWJlbHMgPSAkLmV4dGVuZCgge30sIHtcblx0J2ZhY2Vib29rJzogJ1NoYXJlIG9uIEZhY2Vib29rJyxcblx0J3R3aXR0ZXInOiAnVHdlZXQnLFxuXHQncGludGVyZXN0JzogJ1BpbiBpdCcsXG59LCB3aW5kb3cuX19waG9ydC5pMThuLnBob3Rvc3dpcGUgKVxuXG5cbmRlZmF1bHRzID1cblx0aW5kZXggICAgICAgOiAwXG5cdHByZWxvYWQgICAgIDogWyAxLCAzIF1cblx0ZXNjS2V5ICAgICAgOiBmYWxzZVxuXHRzaGFyZUJ1dHRvbnM6IFtcblx0XHR7IGlkOiAnZmFjZWJvb2snLCBsYWJlbDogbGFiZWxzLmZhY2Vib29rLCB1cmw6ICdodHRwczovL3d3dy5mYWNlYm9vay5jb20vc2hhcmVyL3NoYXJlci5waHA/dT17e3VybH19JyB9XG5cdFx0eyBpZDogJ3R3aXR0ZXInLCBsYWJlbCA6IGxhYmVscy50d2l0dGVyLCB1cmw6ICdodHRwczovL3R3aXR0ZXIuY29tL2ludGVudC90d2VldD90ZXh0PXt7dGV4dH19JnVybD17e3VybH19JyB9XG5cdFx0eyBpZDogJ3BpbnRlcmVzdCcsIGxhYmVsOiBsYWJlbHMucGludGVyZXN0LCB1cmw6ICdodHRwOi8vd3d3LnBpbnRlcmVzdC5jb20vcGluL2NyZWF0ZS9idXR0b24vP3VybD17e3VybH19Jm1lZGlhPXt7aW1hZ2VfdXJsfX0mZGVzY3JpcHRpb249e3t0ZXh0fX0nIH1cblx0XVxuXG5cbnBzd3AgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCAnLnBzd3AnIClcblVJID0gSG9va3MuYXBwbHlGaWx0ZXJzKCBcInBob3J0LnBob3Rvc3dpcGUuVUlcIiwgd2luZG93LlBob3RvU3dpcGVVSV9EZWZhdWx0IClcblBob3RvU3dpcGUgPSB3aW5kb3cuUGhvdG9Td2lwZVxuXG5cbmNyZWF0ZSA9ICggZGF0YSwgb3B0cyA9IHt9ICkgLT5cblxuXHRvcHRpb25zID0gJC5leHRlbmQoIHt9LCBkZWZhdWx0cywgb3B0cyApXG5cdG9wdGlvbnMgPSBIb29rcy5hcHBseUZpbHRlcnMoIFwicGhvcnQucGhvdG9zd2lwZS5vcHRpb25zXCIsIG9wdGlvbnMsIGRhdGEsIG9wdHMgKVxuXG5cdCMgSW5kZXggaXMgMCBieSBkZWZhdWx0XG5cdGlmIG5vdCBvcHRpb25zLmluZGV4P1xuXHRcdG9wdGlvbnMuaW5kZXggPSAwXG5cblx0IyBTZXQgdGhlIGluZGV4IHRvIDAgaWYgaXQgaXNuJ3QgYSBwcm9wZXIgdmFsdWVcblx0aWYgbm90IG9wdGlvbnMuaW5kZXggb3Igb3B0aW9ucy5pbmRleCA8IDBcblx0XHRvcHRpb25zLmluZGV4ID0gMFxuXG5cdGluc3RhbmNlID0gbmV3IFBob3RvU3dpcGUoIHBzd3AsIFVJLCBkYXRhLCBvcHRpb25zIClcblx0aW5zdGFuY2UuaW5pdCggKVxuXG5cdHJldHVybiBpbnN0YW5jZVxuXG5cbnNpbmdsZV9pdGVtX2RhdGEgPSAoIGl0ZW0gKSAtPlxuXHQjIFBob3RvU3dpcGUgc3VwcG9ydHMgb25seSBpbWFnZXNcblx0cmV0dXJuIGlmIGl0ZW0uZGF0YS5nZXQoICd0eXBlJyApIGlzbnQgJ2ltYWdlJ1xuXG5cblx0W3dpZHRoLCBoZWlnaHRdID0gaXRlbS5kYXRhLnNpemUoICdmdWxsJyApXG5cblx0IyByZXR1cm5cblx0c3JjICA6IGl0ZW0uZGF0YS51cmwoICdmdWxsJyApXG5cdG1zcmMgOiBpdGVtLmRhdGEudXJsKCAnZnVsbCcgKVxuXHR3ICAgIDogd2lkdGhcblx0aCAgICA6IGhlaWdodFxuXHR0aXRsZTogaXRlbS5jYXB0aW9uXG5cblxudGh1bWJuYWlsX3Bvc2l0aW9uID0gKCAkZ2FsbGVyeSApIC0+IHJldHVybiAoIGluZGV4ICkgLT5cblx0cmV0dXJuIGZhbHNlIGlmIG5vdCAkZ2FsbGVyeS5sZW5ndGhcblxuXHQkZWwgPSAkZ2FsbGVyeS5lcSggaW5kZXggKVxuXHR0aHVtYm5haWwgPSAkZWwuZmluZCggJ2ltZycgKS5nZXQoIDAgKVxuXG5cdCMgVGh1bWJuYWlsIG11c3QgZXhpc3QgYmVmb3JlIGRpbWVuc2lvbnMgY2FuIGJlIG9idGFpbmVkXG5cdHJldHVybiBpZiBub3QgdGh1bWJuYWlsXG5cblx0cGFnZVlTY3JvbGwgPSB3aW5kb3cucGFnZVlPZmZzZXQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcFxuXHRyZWN0ID0gdGh1bWJuYWlsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCggKVxuXG5cdCMgLy8gdyA9IHdpZHRoXG5cdG91dCA9XG5cdFx0eDogcmVjdC5sZWZ0XG5cdFx0eTogcmVjdC50b3AgKyBwYWdlWVNjcm9sbFxuXHRcdHc6IHJlY3Qud2lkdGhcblxuXHRyZXR1cm4gb3V0XG5cblxubW9kdWxlLmV4cG9ydHMgPSAoICRlbCApIC0+XG5cdEdhbGxlcnkgPSBmYWxzZVxuXHRpbnN0YW5jZTogLT4gR2FsbGVyeVxuXHRjbG9zZTogLT5cblx0XHRyZXR1cm4gaWYgbm90IEdhbGxlcnlcblx0XHRHYWxsZXJ5LmNsb3NlKCApXG5cdFx0R2FsbGVyeSA9IGZhbHNlXG5cblx0b3BlbjogKCBnYWxsZXJ5LCBpbmRleCApIC0+XG5cdFx0b3B0aW9ucyA9XG5cdFx0XHRnZXRUaHVtYkJvdW5kc0ZuOiB0aHVtYm5haWxfcG9zaXRpb24oICRlbC5jbG9zZXN0KCAnLlBQX0dhbGxlcnknICkuZmluZCggJy5QUF9HYWxsZXJ5X19pdGVtJyApIClcblx0XHRcdGluZGV4ICAgICAgICAgICA6IGluZGV4XG5cblx0XHRHYWxsZXJ5ID0gY3JlYXRlKCBnYWxsZXJ5Lm1hcCggc2luZ2xlX2l0ZW1fZGF0YSApLCBvcHRpb25zIClcblxuXG5cbiIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuSG9va3MgPSByZXF1aXJlKCAnd3BfaG9va3MnIClcbmdhbGVyeV9pdGVtX2RhdGEgPSByZXF1aXJlKCAnLi9nYWxsZXJ5X2l0ZW1fZmFjdG9yeScgKVxuXG5cbnBhcnNlX2dhbGxlcnlfaXRlbSA9ICgga2V5LCBlbCApIC0+XG5cdCRlbCA9ICQoIGVsIClcblxuXHRpbmRleCAgOiBrZXlcblx0ZGF0YSAgIDogZ2FsZXJ5X2l0ZW1fZGF0YSggJGVsIClcblx0Y2FwdGlvbjogJGVsLmZpbmQoICcuUFBfR2FsbGVyeV9fY2FwdGlvbicgKS5odG1sKCApIHx8ICcnXG5cblxubW9kdWxlLmV4cG9ydHMgPSAoIEdhbGxlcnlfRHJpdmVyICkgLT5cblx0aW5zdGFuY2UgPSBmYWxzZVxuXG5cdG9wZW4gPSAoIGVsICkgLT5cblx0XHQkZWwgPSAkKCBlbCApXG5cdFx0JGl0ZW1zID0gJGVsLmNsb3Nlc3QoICcuUFBfR2FsbGVyeScgKS5maW5kKCAnLlBQX0dhbGxlcnlfX2l0ZW0nIClcblxuXHRcdGlmICRpdGVtcy5sZW5ndGggPiAwXG5cdFx0XHRpbmRleCA9ICRpdGVtcy5pbmRleCggJGVsIClcblx0XHRcdGdhbGxlcnlfaXRlbXMgPSAkLm1ha2VBcnJheSggJGl0ZW1zLm1hcCggcGFyc2VfZ2FsbGVyeV9pdGVtICkgKVxuXG5cdFx0XHRpbnN0YW5jZSA9IEdhbGxlcnlfRHJpdmVyKCAkZWwgKVxuXHRcdFx0aW5zdGFuY2Uub3BlbiggZ2FsbGVyeV9pdGVtcywgaW5kZXggKVxuXG5cdFx0XHRIb29rcy5kb0FjdGlvbiggJ3Bob3J0LmdhbGxlcnkub3BlbicsIGluc3RhbmNlLCBnYWxsZXJ5X2l0ZW1zLCBpbmRleCApXG5cblx0XHRyZXR1cm5cblxuXHRvcGVuOiBvcGVuXG5cblx0aGFuZGxlX2hhc2g6IC0+XG5cdFx0aW5kZXggPSBwYXJzZUludCggd2luZG93LmxvY2F0aW9uLmhhc2guc3BsaXQoICcmcGlkPScgKVsgMSBdLCAxMCApXG5cdFx0ZWwgPSAkKCAnLlBQX0dhbGxlcnknICkuZmlyc3QoICkuZmluZCggJy5QUF9HYWxsZXJ5X19pdGVtJyApLmdldCggaW5kZXggKVxuXHRcdG9wZW4oIGVsIClcblxuXHRcdHJldHVyblxuXG5cdGNsb3NlOiAtPlxuXHRcdHJldHVybiBmYWxzZSBpZiBub3QgaW5zdGFuY2VcblxuXHRcdGluc3RhbmNlLmNsb3NlKCApXG5cdFx0aW5zdGFuY2UgPSBmYWxzZVxuXG5cdFx0SG9va3MuZG9BY3Rpb24oICdwaG9ydC5nYWxsZXJ5LmNsb3NlJywgaW5zdGFuY2UgKVxuXHRcdHJldHVybiIsIml0ZW1fZGF0YSA9ICggZGF0YV9vYmogKSAtPlxuXG5cdHBsdWNrID0gKCBvYmplY3QsIGtleSApIC0+XG5cdFx0aWYgb2JqZWN0IGFuZCBvYmplY3RbIGtleSBdXG5cdFx0XHRyZXR1cm4gb2JqZWN0WyBrZXkgXVxuXHRcdHJldHVybiBmYWxzZVxuXG5cdGdldCA9ICgga2V5ICkgLT4gcGx1Y2soIGRhdGFfb2JqLCBrZXkgKVxuXG5cdGltYWdlID0gKCBzaXplX25hbWUgKSAtPiBwbHVjayggZ2V0KCAnaW1hZ2VzJyApLCBzaXplX25hbWUgKVxuXG5cblx0c2l6ZTogKCBzaXplX25hbWUgKSAtPlxuXHRcdGltYWdlX3NpemUgPSBwbHVjayggaW1hZ2UoIHNpemVfbmFtZSApLCAnc2l6ZScgKVxuXHRcdHJldHVybiBmYWxzZSBpZiBub3QgaW1hZ2Vfc2l6ZVxuXG5cdFx0W3dpZHRoLCBoZWlnaHRdID0gaW1hZ2Vfc2l6ZS5zcGxpdCggJ3gnIClcblxuXHRcdHdpZHRoID0gcGFyc2VJbnQoIHdpZHRoIClcblx0XHRoZWlnaHQgPSBwYXJzZUludCggaGVpZ2h0IClcblxuXHRcdHJldHVybiBbIHdpZHRoLCBoZWlnaHQgXVxuXG5cdHVybDogKCBzaXplX25hbWUgKSAtPiBwbHVjayggaW1hZ2UoIHNpemVfbmFtZSApLCAndXJsJyApXG5cdGdldDogZ2V0XG5cblxubW9kdWxlLmV4cG9ydHMgPSBpdGVtX2RhdGEiLCJpdGVtID0gcmVxdWlyZSgnLi9nYWxsZXJ5X2l0ZW1fZGF0YScpXG5cbml0ZW1fZGF0YSA9ICggJGVsICkgLT5cblx0ZGF0YV9vYmogPSAkZWwuZGF0YSggJ2l0ZW0nIClcblxuXHRpZiBub3QgZGF0YV9vYmpcblx0XHR0aHJvdyBuZXcgRXJyb3IgXCJFbGVtZW50IGRvZXNuJ3QgY29udGFpbiBgZGF0YS1pdGVtYCBhdHRyaWJ1dGVcIlxuXG5cdHJldHVybiBpdGVtKCBkYXRhX29iaiApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBpdGVtX2RhdGEiLCJIb29rcyA9IHJlcXVpcmUoXCJ3cF9ob29rc1wiKVxuXG4jXG4jIFRoaXMgZmlsZSBpcyBnb2luZyB0byByZXR1cm4gYSBbR2FsbGVyeSBGYWN0b3J5XSBpbnN0YW5jZVxuIyBFYXN5IFBob3RvZ3JhcGh5IFBvcnRmb2xpbyBpcyB1c2luZyB0aGF0IHRvIG9wZW4vY2xvc2UvZGVzdHJveSBnYWxsZXJpZXNcbiNcbiMgW0dhbGxlcnkgRmFjdG9yeV0gcmVsaWVzIG9uIGEgW0FkYXB0ZXJdXG4jIEluc3RlYWQgb2YgcmVseWluZyBkaXJlY3RseSBvbiBhIGRlcGVuZGVuY3ksIEdhbGxlcnkgRmFjdG9yeSByZWxpZXMgb24gYSBBZGFwdGVyIHRoYXQgY2FuIGJlIG1vZGlmaWVkXG4jIEEgQWRhcHRlciBpcyBhbiBhZGFwdGVyIGZvciBhIFBvcHVwLUdhbGxlcnkgcGx1Z2luLCBzdWNoIGFzIExpZ2h0R2FsbGVyeSBvciBQaG90b1N3aXBlXG4jXG4jIFNvIHdoZW4gYSBnYWxsZXJ5IGlzIG9wZW5lZCwgdGhpcyBpcyBwcm9iYWJseSBob3cgaXQncyBnb2luZyB0byBsb29rOlxuIyBbR2FsbGVyeSBGYWN0b3J5XSBhc2tzIFtBZGFwdGVyXSB0byBmaW5kIGFuZCBvcGVuIGEgZ2FsbGVyeSB3aXRoIFthbnkgTGlnaHRCb3ggTGlicmFyeV1cbiNcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEdhbGxlcnkgQWRhcHRlcjpcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuc2V0dXBfZHJpdmVyID0gKCBkcml2ZXJfbmFtZSA9ICdsaWdodGdhbGxlcnknICkgLT5cblx0aWYgZHJpdmVyX25hbWUgaXMgJ2xpZ2h0Z2FsbGVyeSdcblx0XHRhZGFwdGVyID0gcmVxdWlyZSggJy4vYWRhcHRlcnMvbGlnaHRnYWxsZXJ5JyApXG5cblx0aWYgZHJpdmVyX25hbWUgaXMgJ3Bob3Rvc3dpcGUnXG5cdFx0YWRhcHRlciA9IHJlcXVpcmUoICcuL2FkYXB0ZXJzL3Bob3Rvc3dpcGUnIClcblxuXHRyZXR1cm4gSG9va3MuYXBwbHlGaWx0ZXJzKCAncGhvcnQuZ2FsbGVyeS5kcml2ZXInLCBhZGFwdGVyIClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEdhbGxlcnkgRmFjdG9yeTpcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBUaGUgZ2FsbGVyeSBmYWN0b3J5IGlzIHdoYXQgd2UncmUgaW50ZXJhY3Rpbmcgd2l0aCB0byBvcGVuL2Nsb3NlIGEgZ2FsbGVyeVxuc2V0dXBfZmFjdG9yeSA9IC0+XG5cdGZhY3RvcnkgPSByZXF1aXJlKCAnLi9nYWxsZXJ5X2ZhY3RvcnknIClcblx0cmV0dXJuIEhvb2tzLmFwcGx5RmlsdGVycyggJ3Bob3J0LmdhbGxlcnkuZmFjdG9yeScsIGZhY3RvcnkgKVxuXG4jXG4jIFJldHVybiBhIGZhY3RvcnkgaW5zdGFuY2VcbiNcblxuZ2FsbGVyeV9kcml2ZXIgPSBzZXR1cF9kcml2ZXIoIHdpbmRvdy5fX3Bob3J0LnBvcHVwX2dhbGxlcnkgKVxuZ2FsbGVyeV9mYWN0b3J5ID0gc2V0dXBfZmFjdG9yeSggKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdhbGxlcnlfZmFjdG9yeSggZ2FsbGVyeV9kcml2ZXIgKSIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuSG9va3MgPSByZXF1aXJlKCAnd3BfaG9va3MnIClcbkdhbGxlcnkgPSByZXF1aXJlKCAnLi9wcmVwYXJlX2dhbGxlcnlfZmFjdG9yeScgKVxuXG4kKGRvY3VtZW50KS5yZWFkeSAtPlxuXG5cdGhhbmRsZV9jbGlja3MgPSBIb29rcy5hcHBseUZpbHRlcnMoICdwaG9ydC5nYWxsZXJ5LmhhbmRsZV9jbGlja3MnLCB0cnVlIClcblx0aGFuZGxlX2hhc2ggPSBIb29rcy5hcHBseUZpbHRlcnMoICdwaG9ydC5nYWxsZXJ5LmhhbmRsZV9oYXNoJywgdHJ1ZSApXG5cdGhhbmRsZV9lc2Nfa2V5ID0gSG9va3MuYXBwbHlGaWx0ZXJzKCAncGhvcnQuZ2FsbGVyeS5jdXN0b21fZXNjJywgdHJ1ZSApXG5cblx0IyBIYW5kbGUgSGFzaGNoYW5nZVxuXHRpZiBoYW5kbGVfaGFzaCBhbmQgd2luZG93LmxvY2F0aW9uLmhhc2ggYW5kIEdhbGxlcnkuaGFuZGxlX2hhc2hcblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LmNvcmUubG9hZGVkJywgR2FsbGVyeS5oYW5kbGVfaGFzaFxuXG5cdCMgSGFuZGxlIENsaWNrc1xuXHRpZiBoYW5kbGVfY2xpY2tzXG5cdFx0JCggZG9jdW1lbnQgKS5vbiAnY2xpY2snLCAnLlBQX0dhbGxlcnlfX2l0ZW0nLCAoIGUgKSAtPlxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCggKVxuXHRcdFx0R2FsbGVyeS5vcGVuKCB0aGlzIClcblxuXG5cdCMgSGFuZGxlIEVTQ2FwZSBLZXlcblx0aWYgaGFuZGxlX2VzY19rZXlcblx0XHQkKCB3aW5kb3cgKS5vbiAna2V5ZG93bicsICggZSApIC0+XG5cdFx0XHRyZXR1cm4gdW5sZXNzIGUua2V5IGlzICdFc2NhcGUnXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCApXG5cdFx0XHRHYWxsZXJ5LmNsb3NlKCApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBHYWxsZXJ5XG4iLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuJCA9IHJlcXVpcmUoICdqUXVlcnknIClcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcbmdhbGxlcnlfaXRlbSA9IHJlcXVpcmUoICcuLi9nYWxsZXJ5L2dhbGxlcnlfaXRlbV9mYWN0b3J5JyApXG5fX1dJTkRPVyA9IHJlcXVpcmUoICcuLi9jb3JlL1dpbmRvdycgKVxudGhyb3R0bGUgPSByZXF1aXJlKCcuLi9jb3JlL1V0aWxpdGllcycpLnRocm90dGxlXG5cbmNsYXNzIEFic3RyYWN0X0xhenlfTG9hZGVyXG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdEBFbGVtZW50cyA9XG5cdFx0XHRpdGVtICAgICAgIDogJ1BQX0xhenlfSW1hZ2UnXG5cdFx0XHRwbGFjZWhvbGRlcjogJ1BQX0xhenlfSW1hZ2VfX3BsYWNlaG9sZGVyJ1xuXHRcdFx0bGluayAgICAgICA6ICdQUF9KU19MYXp5X19saW5rJ1xuXHRcdFx0aW1hZ2UgICAgICA6ICdQUF9KU19MYXp5X19pbWFnZSdcblxuXHRcdEBJdGVtcyA9IFtdXG5cblx0XHQjIEFkanVzdGFibGUgU2Vuc2l0aXZpdHkgZm9yIEBpbl92aWV3IGZ1bmN0aW9uXG5cdFx0IyBWYWx1ZSBpbiBwaXhlbHNcblx0XHRAU2Vuc2l0aXZpdHkgPSAxMDBcblxuXHRcdCMgQXV0by1zZXR1cCB3aGVuIGV2ZW50cyBhcmUgYXR0YWNoZWRcblx0XHQjIEF1dG8tZGVzdHJveSB3aGVuIGV2ZW50cyBhcmUgZGV0YWNoZWRcblx0XHRAdGhyb3R0bGVkX2F1dG9sb2FkID0gbnVsbFxuXG5cdFx0QHNldHVwX2l0ZW1zKClcblx0XHRAcmVzaXplX2FsbCgpXG5cdFx0QGF0dGFjaF9ldmVudHMoKVxuXG5cdCMjI1xuXHRcdEFic3RyYWN0IE1ldGhvZHNcblx0IyMjXG5cblx0IyBUaGlzIGlzIHJ1biB3aGVuIGEgcmVzaXplIG9yIHJlZnJlc2ggZXZlbnQgaXMgZGV0ZWN0ZWRcblx0cmVzaXplOiAtPiByZXR1cm5cblxuXHRsb2FkOiAoIGl0ZW0gKSAtPlxuXHRcdEBsb2FkX2ltYWdlKCBpdGVtIClcblx0XHRpdGVtLiRlbC5pbWFnZXNMb2FkZWQgPT5cblx0XHRcdEBjbGVhbnVwX2FmdGVyX2xvYWQoIGl0ZW0gKVxuXG5cdGxvYWRfaW1hZ2U6ICggaXRlbSApIC0+XG5cblx0XHQjIEdldCBpbWFnZSBVUkxcblx0XHR0aHVtYiA9IGl0ZW0uZGF0YS51cmwoICd0aHVtYicgKVxuXHRcdGZ1bGwgPSBpdGVtLmRhdGEudXJsKCAnZnVsbCcgKVxuXG5cdFx0IyBDcmVhdGUgZWxlbWVudHNcblx0XHRpdGVtLiRlbFxuXHRcdFx0LnByZXBlbmQoIEBnZXRfaXRlbV9odG1sKCB0aHVtYiwgZnVsbCApIClcblx0XHRcdC5yZW1vdmVDbGFzcyggJ0xhenktSW1hZ2UnIClcblxuXHRcdCMgTWFrZSBzdXJlIHRoaXMgaW1hZ2UgaXNuJ3QgbG9hZGVkIGFnYWluXG5cdFx0aXRlbS5sb2FkZWQgPSB0cnVlXG5cblx0Y2xlYW51cF9hZnRlcl9sb2FkOiAoIGl0ZW0gKSAtPlxuXHRcdCMgQWRkIGltYWdlIFBQX0pTX2xvYWRlZCBjbGFzc1xuXHRcdGl0ZW0uJGVsLmZpbmQoICdpbWcnICkuYWRkQ2xhc3MoICdQUF9KU19fbG9hZGVkJyApLnJlbW92ZUNsYXNzKCAnUFBfSlNfX2xvYWRpbmcnIClcblxuXHRcdGl0ZW0uJGVsXG5cblx0XHRcdCMgUmVtb3ZlIGBQUF9MYXp5X0ltYWdlYCwgYXMgdGhpcyBpcyBub3QgYSBsYXp5LWxvYWRhYmxlIGltYWdlIGFueW1vcmVcblx0XHRcdC5yZW1vdmVDbGFzcyggQEVsZW1lbnRzLml0ZW0gKVxuXG5cdFx0XHQjIFJlbW92ZSBQbGFjZWhvbGRlclxuXHRcdFx0LmZpbmQoIFwiLiN7QEVsZW1lbnRzLnBsYWNlaG9sZGVyfVwiIClcblx0XHRcdC5mYWRlT3V0KCA0MDAsIC0+ICQoIHRoaXMgKS5yZW1vdmUoKSApXG5cblx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQubGF6eS5sb2FkZWRfaXRlbScsIGl0ZW1cblxuXG5cdGdldF9pdGVtX2h0bWw6ICggdGh1bWIsIGZ1bGwgKSAtPlxuXG5cdFx0aWYgJ2Rpc2FibGUnIGlzIHdpbmRvdy5fX3Bob3J0LnBvcHVwX2dhbGxlcnlcblx0XHRcdHJldHVybiBcIlwiXCJcblx0XHRcdDxkaXYgY2xhc3M9XCIje0BFbGVtZW50cy5saW5rfVwiIHJlbD1cImdhbGxlcnlcIj5cblx0XHRcdFx0PGltZyBjbGFzcz1cIiN7QEVsZW1lbnRzLmltYWdlfVwiIHNyYz1cIiN7dGh1bWJ9XCIgY2xhc3M9XCJQUF9KU19fbG9hZGluZ1wiIC8+XG5cdFx0XHQ8L2Rpdj5cblx0XHRcdFwiXCJcIlxuXHRcdGVsc2Vcblx0XHRcdHJldHVybiBcIlwiXCJcblx0XHRcdDxhIGNsYXNzPVwiI3tARWxlbWVudHMubGlua31cIiBocmVmPVwiI3tmdWxsfVwiIHJlbD1cImdhbGxlcnlcIj5cblx0XHRcdFx0PGltZyBjbGFzcz1cIiN7QEVsZW1lbnRzLmltYWdlfVwiIHNyYz1cIiN7dGh1bWJ9XCIgY2xhc3M9XCJQUF9KU19fbG9hZGluZ1wiIC8+XG5cdFx0XHQ8L2E+XG5cdFx0XHRcIlwiXCJcblxuXHRzZXR1cF9pdGVtczogPT5cblx0XHQjIENsZWFyIGV4aXN0aW5nIGl0ZW1zLCBpZiBhbnlcblx0XHRASXRlbXMgPSBbXVxuXG5cdFx0IyBMb29wIG92ZXIgRE9NIGFuZCBhZGQgZWFjaCBpdGVtIHRvIEBJdGVtc1xuXHRcdCQoIFwiLiN7QEVsZW1lbnRzLml0ZW19XCIgKS5lYWNoKCBAYWRkX2l0ZW0gKVxuXHRcdHJldHVyblxuXG5cdGFkZF9pdGVtOiAoIGtleSwgZWwgKSA9PlxuXHRcdCRlbCA9ICQoIGVsIClcblx0XHRASXRlbXMucHVzaFxuXHRcdFx0ZWwgICAgOiBlbFxuXHRcdFx0JGVsICAgOiAkZWxcblx0XHRcdGRhdGEgIDogZ2FsbGVyeV9pdGVtKCAkZWwgKVxuXHRcdFx0bG9hZGVkOiBmYWxzZVxuXG5cblx0XHRyZXR1cm5cblxuXG5cdCMjI1xuXHRcdE1ldGhvZHNcblx0IyMjXG5cdHJlc2l6ZV9hbGw6IC0+XG5cdFx0QHJlc2l6ZSggaXRlbSApIGZvciBpdGVtIGluIEBJdGVtc1xuXG5cblxuXHQjIEF1dG9tYXRpY2FsbHkgTG9hZCBhbGwgaXRlbXMgdGhhdCBhcmUgYGluX2xvb3NlX3ZpZXdgXG5cdGF1dG9sb2FkOiA9PlxuXHRcdGZvciBpdGVtLCBrZXkgaW4gQEl0ZW1zXG5cdFx0XHRpZiBub3QgaXRlbS5sb2FkZWQgYW5kIEBpbl9sb29zZV92aWV3KCBpdGVtLmVsIClcblx0XHRcdFx0QGxvYWQoIGl0ZW0gKVxuXG5cdGluX2xvb3NlX3ZpZXc6ICggZWwgKSAtPlxuXHRcdHJldHVybiB0cnVlIGlmIG5vdCBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3Q/XG5cdFx0cmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG5cblx0XHQjIEVsZW1lbnRzIG5vdCBpbiB2aWV3IGlmIHRoZXkgZG9uJ3QgaGF2ZSBkaW1lbnNpb25zXG5cdFx0cmV0dXJuIGZhbHNlIGlmIHJlY3QuaGVpZ2h0IGlzIDAgYW5kIHJlY3Qud2lkdGggaXMgMFxuXG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0IyBZIEF4aXNcblx0XHRcdHJlY3QudG9wICsgcmVjdC5oZWlnaHQgPj0gLUBTZW5zaXRpdml0eSBhbmQgIyB0b3Bcblx0XHRcdHJlY3QuYm90dG9tIC0gcmVjdC5oZWlnaHQgPD0gX19XSU5ET1cuaGVpZ2h0ICsgQFNlbnNpdGl2aXR5IGFuZFxuXG5cdFx0XHQjIFggQXhpc1xuXHRcdFx0cmVjdC5sZWZ0ICsgcmVjdC53aWR0aCA+PSAtQFNlbnNpdGl2aXR5IGFuZFxuXHRcdFx0cmVjdC5yaWdodCAtIHJlY3Qud2lkdGggPD0gX19XSU5ET1cud2lkdGggKyBAU2Vuc2l0aXZpdHlcblxuXHRcdClcblxuXHRkZXN0cm95OiAtPlxuXHRcdEBkZXRhY2hfZXZlbnRzKClcblxuXHRhdHRhY2hfZXZlbnRzOiAtPlxuXHRcdCMgQ3JlYXRlIGEgZGVib3VuY2VkIGBhdXRvbG9hZGAgZnVuY3Rpb25cblx0XHRAdGhyb3R0bGVkX2F1dG9sb2FkID0gdGhyb3R0bGUoIEBhdXRvbG9hZCwgNTAgKVxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCBAdGhyb3R0bGVkX2F1dG9sb2FkLCAxMDBcblxuXG5cdGRldGFjaF9ldmVudHM6IC0+XG5cdFx0IyBDbGVhciB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uIGZyb20gaW5zdGFuY2Vcblx0XHRAdGhyb3R0bGVkX2F1dG9sb2FkID0gbnVsbFxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCBAdGhyb3R0bGVkX2F1dG9sb2FkLCAxMDBcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQWJzdHJhY3RfTGF6eV9Mb2FkZXJcbiIsIiQgPSByZXF1aXJlKCBcImpRdWVyeVwiIClcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcbkFic3RyYWN0X0xhenlfTG9hZGVyID0gcmVxdWlyZSggXCIuL0Fic3RyYWN0X0xhenlfTG9hZGVyXCIgKVxuXG5jbGFzcyBMYXp5X0RlZmF1bHQgZXh0ZW5kcyBBYnN0cmFjdF9MYXp5X0xvYWRlclxuXG5cblx0cmVzaXplOiAoIGl0ZW0gKSAtPlxuXHRcdFt3LCBoXSA9IGl0ZW0uZGF0YS5zaXplKCBcInRodW1iXCIgKVxuXHRcdHJhdGlvID0gaXRlbS5kYXRhLmdldCggXCJyYXRpb1wiIClcblxuXHRcdHNtYWxsZXN0X3dpZHRoID0gTWF0aC5taW4oIGl0ZW0uJGVsLndpZHRoKCApLCB3IClcblx0XHRoZWlnaHQgPSBNYXRoLmZsb29yKCBzbWFsbGVzdF93aWR0aCAvIHJhdGlvIClcblx0XHR3aWR0aCA9IE1hdGguZmxvb3IoIHNtYWxsZXN0X3dpZHRoIClcblxuXHRcdGl0ZW0uJGVsLmNzc1xuXHRcdFx0XCJ3aWR0aFwiIDogd2lkdGhcblx0XHRcdFwiaGVpZ2h0XCI6IGhlaWdodFxuXG5cdGNsZWFudXBfYWZ0ZXJfbG9hZDogKCBpdGVtICkgLT5cblx0XHQjIFJlbW92ZSBtaW4taGVpZ2h0XG5cdFx0aXRlbS4kZWwuY3NzKCBcIm1pbi1oZWlnaHRcIiwgXCJcIiApXG5cblx0XHQjIFJ1biBhbGwgb3RoZXIgY2xlYW51cHNcblx0XHRzdXBlciggaXRlbSApXG5cblx0XHRIb29rcy5kb0FjdGlvbiBcInBob3J0LnBvcnRmb2xpby5yZWZyZXNoXCJcblxuXHRcdHJldHVyblxuXG5cdGF0dGFjaF9ldmVudHM6IC0+XG5cdFx0IyBDYWxsIFBhcmVudCBmaXJzdCwgaXQncyBnb2luZyB0byBjcmVhdGUgQHRocm90dGxlZF9hdXRvbG9hZFxuXHRcdHN1cGVyKCApXG5cblx0XHQjIEF0dGFjaFxuXHRcdCQoIHdpbmRvdyApLm9uIFwic2Nyb2xsXCIsIEB0aHJvdHRsZWRfYXV0b2xvYWRcblxuXG5cblx0ZGV0YWNoX2V2ZW50czogLT5cblx0XHQjIERldGFjaFxuXHRcdCQoIHdpbmRvdyApLm9mZiBcInNjcm9sbFwiLCBAdGhyb3R0bGVkX2F1dG9sb2FkXG5cblx0XHQjIENhbGwgcGFyZW50IGxhc3QsIGl0J3MgZ29pbmcgdG8gY2xlYW4gdXAgQHRocm90dGxlZF9hdXRvbG9hZFxuXHRcdHN1cGVyKCApXG5cblx0ZGVzdHJveTogLT5cblx0XHRmb3IgaXRlbSwga2V5IGluIEBJdGVtc1xuXHRcdFx0aXRlbS4kZWwuY3NzXG5cdFx0XHRcdCdtaW4taGVpZ2h0JzogJydcblx0XHRcdFx0J21heC13aWR0aCcgOiAnJ1xuXHRcdHN1cGVyKCApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBMYXp5X0RlZmF1bHRcbiIsIiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5BYnN0cmFjdF9MYXp5X0xvYWRlciA9IHJlcXVpcmUoICcuL0Fic3RyYWN0X0xhenlfTG9hZGVyJyApXG5fX1dJTkRPVyA9IHJlcXVpcmUoICcuLi9jb3JlL1dpbmRvdycgKVxuXG5jbGFzcyBMYXp5X01hc29ucnkgZXh0ZW5kcyBBYnN0cmFjdF9MYXp5X0xvYWRlclxuXG5cdHJlc2l6ZV9hbGw6IC0+XG5cdFx0QHBsYWNlaG9sZGVyX3dpZHRoID0gJCggJy5QUF9NYXNvbnJ5X19zaXplcicgKS53aWR0aCgpXG5cdFx0c3VwZXIoKVxuXG5cdHJlc2l6ZTogKCBpdGVtICkgLT5cblx0XHRpdGVtLiRlbC5jc3MgJ21pbi1oZWlnaHQnOiBNYXRoLmZsb29yKCBAcGxhY2Vob2xkZXJfd2lkdGggLyBpdGVtLmRhdGEuZ2V0KCdyYXRpbycpIClcblxuXHRjbGVhbnVwX2FmdGVyX2xvYWQ6IChpdGVtKSAtPlxuXHRcdCMgUmVtb3ZlIG1pbi1oZWlnaHRcblx0XHRpdGVtLiRlbC5jc3MoICdtaW4taGVpZ2h0JywgJycgKVxuXG5cdFx0IyBSdW4gYWxsIG90aGVyIGNsZWFudXBzXG5cdFx0c3VwZXIoIGl0ZW0gKVxuXG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5yZWZyZXNoJ1xuXG5cdFx0cmV0dXJuXG5cblx0YXR0YWNoX2V2ZW50czogLT5cblx0XHQjIENhbGwgUGFyZW50IGZpcnN0LCBpdCdzIGdvaW5nIHRvIGNyZWF0ZSBAdGhyb3R0bGVkX2F1dG9sb2FkXG5cdFx0c3VwZXIoKVxuXG5cdFx0IyBBdHRhY2hcblx0XHQkKCB3aW5kb3cgKS5vbiAnc2Nyb2xsJywgQHRocm90dGxlZF9hdXRvbG9hZFxuXG5cblxuXHRkZXRhY2hfZXZlbnRzOiAtPlxuXHRcdCMgRGV0YWNoXG5cdFx0JCggd2luZG93ICkub2ZmICdzY3JvbGwnLCBAdGhyb3R0bGVkX2F1dG9sb2FkXG5cblx0XHQjIENhbGwgcGFyZW50IGxhc3QsIGl0J3MgZ29pbmcgdG8gY2xlYW4gdXAgQHRocm90dGxlZF9hdXRvbG9hZFxuXHRcdHN1cGVyKClcblxuXHRkZXN0cm95OiAtPlxuXHRcdGZvciBpdGVtLCBrZXkgaW4gQEl0ZW1zXG5cdFx0XHRpdGVtLiRlbC5jc3MgJ21pbi1oZWlnaHQnLCAnJ1xuXHRcdHN1cGVyKClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IExhenlfTWFzb25yeVxuIiwiJCA9IHJlcXVpcmUoICdqUXVlcnknIClcbkhvb2tzID0gcmVxdWlyZSggJ3dwX2hvb2tzJyApXG5cblxuaW5zdGFuY2UgPSBmYWxzZVxuXG5kZXN0cm95ID0gLT5cblx0cmV0dXJuIGlmIG5vdCBpbnN0YW5jZVxuXHRpbnN0YW5jZS5kZXN0cm95KCApXG5cdGluc3RhbmNlID0gbnVsbFxuXG5jcmVhdGUgPSAtPlxuXG5cdCMgTWFrZSBzdXJlIGFuIGluc3RhbmNlIGRvZXNuJ3QgYWxyZWFkeSBleGlzdFxuXHRkZXN0cm95KCApXG5cblx0IyBIYW5kbGVyIHJlcXVpcmVkXG5cdEhhbmRsZXIgPSBIb29rcy5hcHBseUZpbHRlcnMgJ3Bob3J0LmxhenkuaGFuZGxlcicsIHJlcXVpcmUoICcuL0xhenlfRGVmYXVsdCcgKVxuXHRyZXR1cm4gaWYgbm90IEhhbmRsZXJcblxuXHQjIEJ5IGRlZmF1bHQgTGF6eV9NYXNvbnJ5IGlzIGhhbmRsaW5nIExhenktTG9hZGluZ1xuXHQjIENoZWNrIGlmIGFueW9uZSB3YW50cyB0byBoaWphY2sgaGFuZGxlclxuXHRpbnN0YW5jZSA9IG5ldyBIYW5kbGVyKCApXG5cblx0cmV0dXJuXG5cblxuIyBJbml0aWFsaXplIGxhenkgbG9hZGVyIGFmdGVyIHRoZSBwb3J0Zm9saW8gaXMgcHJlcGFyZWQsIHAgPSAxMDBcbkhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnLCBjcmVhdGUsIDEwMFxuSG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScsIGRlc3Ryb3lcblxubW9kdWxlLmV4cG9ydHMgPVxuXHRjcmVhdGUgOiBjcmVhdGVcblx0ZGVzdHJveTogZGVzdHJveSIsIkhvb2tzID0gcmVxdWlyZSggJ3dwX2hvb2tzJyApXG5cbiMjI1xuXG4gICAgIyBJbml0aWFsaXplIFBvcnRmb2xpbyBDb3JlXG5cdC0tLVxuXHRcdFVzaW5nIHA1MCBAIGBwaG9ydC5jb3JlLnJlYWR5YFxuXHRcdExhdGUgcHJpb3JpdHkgaXMgZ29pbmcgdG8gZm9yY2UgZXhwbGljaXQgcHJpb3JpdHkgaW4gYW55IG90aGVyIG1vdmluZyBwYXJ0cyB0aGF0IGFyZSBnb2luZyB0byB0b3VjaCBwb3J0Zm9saW8gbGF5b3V0IGF0IGBwaG9ydC5sb2FkZWRgXG5cdC0tLVxuXG4jIyNcbm1vZHVsZS5leHBvcnRzID1cblxuXHRwcmVwYXJlOiAtPlxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZSdcblx0XHRyZXR1cm5cblxuXHRjcmVhdGU6IC0+XG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5jcmVhdGUnXG5cdFx0cmV0dXJuXG5cblxuXHRyZWZyZXNoOiAtPlxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCdcblx0XHRyZXR1cm5cblxuXG5cdGRlc3Ryb3k6IC0+XG5cdFx0IyBEZXN0cm95XG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95J1xuXHRcdHJldHVyblxuIiwiSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuXG5cbiMjI1xuXHRBYnN0cmFjdCBDbGFzcyBQb3J0b2ZsaW9fRXZlbnRfSW1lcGxlbWVudGF0aW9uXG5cbiAgICBIYW5kbGVzIGFsbCB0aGUgZXZlbnRzIHJlcXVpcmVkIHRvIGZ1bGx5IGhhbmRsZSBhIHBvcnRmb2xpbyBsYXlvdXQgcHJvY2Vzc1xuIyMjXG5jbGFzcyBQb3J0Zm9saW9fSW50ZXJmYWNlXG5cblx0Y29uc3RydWN0b3I6ICggYXJncyApIC0+XG5cdFx0QHNldHVwX2FjdGlvbnMoKVxuXHRcdEBpbml0aWFsaXplKCBhcmdzIClcblxuXHRzZXR1cF9hY3Rpb25zOiAtPlxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnLCBAcHJlcGFyZSwgNTBcblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5jcmVhdGUnLCBAY3JlYXRlLCA1MFxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCBAcmVmcmVzaCwgNTBcblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgQGRlc3Ryb3ksIDUwXG5cdFx0SG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScsIEBwdXJnZV9hY3Rpb25zLCAxMDBcblxuXHRwdXJnZV9hY3Rpb25zOiA9PlxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnLCBAcHJlcGFyZSwgNTBcblx0XHRIb29rcy5yZW1vdmVBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5jcmVhdGUnLCBAY3JlYXRlLCA1MFxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCBAcmVmcmVzaCwgNTBcblx0XHRIb29rcy5yZW1vdmVBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgQGRlc3Ryb3ksIDUwXG5cdFx0SG9va3MucmVtb3ZlQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScsIEBwdXJnZV9hY3Rpb25zLCAxMDBcblxuXG5cdCMjI1xuICAgIFx0UmVxdWlyZSB0aGVzZSBtZXRob2RzXG5cdCMjI1xuXHRpbml0aWFsaXplOiAtPiB0aHJvdyBuZXcgRXJyb3IoIFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGBpbml0aWFsaXplYCBtZXRob2RcIiApXG5cdHByZXBhcmUgICA6IC0+IHRocm93IG5ldyBFcnJvciggXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYHByZXBhcmVgIG1ldGhvZFwiIClcblx0Y3JlYXRlICAgIDogLT4gdGhyb3cgbmV3IEVycm9yKCBcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgY3JlYXRlYCBtZXRob2RcIiApXG5cdHJlZnJlc2ggICA6IC0+IHRocm93IG5ldyBFcnJvciggXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYHJlZnJlc2hgIG1ldGhvZFwiIClcblx0ZGVzdHJveSAgIDogLT4gdGhyb3cgbmV3IEVycm9yKCBcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgZGVzdHJveWAgbWV0aG9kXCIgKVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW9fSW50ZXJmYWNlIiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5Qb3J0Zm9saW9fSW50ZXJmYWNlID0gcmVxdWlyZSggJy4vUG9ydGZvbGlvX0ludGVyZmFjZScgKVxuXG4jIEBUT0RPOiBOZWVkIGEgaGVhdnZ5IHJlZmFjdG9yIC0gbm8gbW9yZSBjbGFzc2VzIHBsZWFzZVxuY2xhc3MgUG9ydGZvbGlvX01hc29ucnkgZXh0ZW5kcyBQb3J0Zm9saW9fSW50ZXJmYWNlXG5cblx0Y29uc3RydWN0b3I6IC0+XG5cblx0XHRARWxlbWVudHMgPVxuXHRcdFx0Y29udGFpbmVyOiAnUFBfTWFzb25yeSdcblx0XHRcdHNpemVyICAgIDogJ1BQX01hc29ucnlfX3NpemVyJ1xuXHRcdFx0aXRlbSAgICAgOiAnUFBfTWFzb25yeV9faXRlbSdcblxuXHRcdHN1cGVyKClcblxuXHQjIyNcblx0XHRJbml0aWFsaXplXG5cdCMjI1xuXHRpbml0aWFsaXplOiAtPlxuXHRcdEAkY29udGFpbmVyID0gJCggXCIuI3tARWxlbWVudHMuY29udGFpbmVyfVwiIClcblxuXHQjIyNcblx0XHRQcmVwYXJlICYgQXR0YWNoIEV2ZW50c1xuICAgIFx0RG9uJ3Qgc2hvdyBhbnl0aGluZyB5ZXQuXG5cblx0XHRAY2FsbGVkIG9uIGhvb2sgYHBob3J0LnBvcnRmb2xpby5wcmVwYXJlYFxuXHQjIyNcblx0cHJlcGFyZTogPT5cblx0XHRyZXR1cm4gaWYgQCRjb250YWluZXIubGVuZ3RoIGlzIDBcblxuXHRcdEAkY29udGFpbmVyLmFkZENsYXNzKCAnUFBfSlNfX2xvYWRpbmdfbWFzb25yeScgKVxuXG5cdFx0QG1heWJlX2NyZWF0ZV9zaXplcigpXG5cblx0XHQjIE9ubHkgaW5pdGlhbGl6ZSwgaWYgbm8gbWFzb25yeSBleGlzdHNcblx0XHRtYXNvbnJ5X3NldHRpbmdzID0gSG9va3MuYXBwbHlGaWx0ZXJzICdwaG9ydC5tYXNvbnJ5LnNldHRpbmdzJyxcblx0XHRcdGl0ZW1TZWxlY3RvcjogXCIuI3tARWxlbWVudHMuaXRlbX1cIlxuXHRcdFx0Y29sdW1uV2lkdGggOiBcIi4je0BFbGVtZW50cy5zaXplcn1cIlxuXHRcdFx0Z3V0dGVyICAgICAgOiAwXG5cdFx0XHRpbml0TGF5b3V0ICA6IGZhbHNlXG5cblx0XHRAJGNvbnRhaW5lci5tYXNvbnJ5KCBtYXNvbnJ5X3NldHRpbmdzIClcblxuXHRcdEAkY29udGFpbmVyLm1hc29ucnkgJ29uY2UnLCAnbGF5b3V0Q29tcGxldGUnLCA9PlxuXHRcdFx0QCRjb250YWluZXJcblx0XHRcdFx0LnJlbW92ZUNsYXNzKCAnUFBfSlNfX2xvYWRpbmdfbWFzb25yeScgKVxuXHRcdFx0XHQuYWRkQ2xhc3MoICdQUF9KU19fbG9hZGluZ19jb21wbGV0ZScgKVxuXG5cdFx0XHQjIEB0cmlnZ2VyIHJlZnJlc2ggZXZlbnRcblx0XHRcdCMgdHJpZ2dlcnMgYEByZWZyZXNoKClgXG5cdFx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnXG5cblxuXHQjIyNcblx0XHRTdGFydCB0aGUgUG9ydGZvbGlvXG5cdFx0QGNhbGxlZCBvbiBob29rIGBwaG9ydC5wb3J0Zm9saW8uY3JlYXRlYFxuXHQjIyNcblx0Y3JlYXRlOiA9PlxuXHRcdEAkY29udGFpbmVyLm1hc29ucnkoKVxuXHRcdHJldHVyblxuXG5cblx0IyMjXG5cdFx0RGVzdHJveVxuXHRcdEBjYWxsZWQgb24gaG9vayBgcGhvcnQucG9ydGZvbGlvLmRlc3Ryb3lgXG5cdCMjI1xuXHRkZXN0cm95OiA9PlxuXHRcdEBtYXliZV9yZW1vdmVfc2l6ZXIoKVxuXG5cdFx0aWYgQCRjb250YWluZXIubGVuZ3RoID4gMFxuXHRcdFx0QCRjb250YWluZXIubWFzb25yeSggJ2Rlc3Ryb3knIClcblxuXG5cdFx0cmV0dXJuXG5cblxuXHQjIyNcblx0XHRSZWxvYWQgdGhlIGxheW91dFxuXHRcdEBjYWxsZWQgb24gaG9vayBgcGhvcnQucG9ydGZvbGlvLnJlZnJlc2hgXG5cdCMjI1xuXHRyZWZyZXNoOiA9PlxuXHRcdEAkY29udGFpbmVyLm1hc29ucnkoICdsYXlvdXQnIClcblxuXG5cblx0IyMjXG5cdFx0Q3JlYXRlIGEgc2l6ZXIgZWxlbWVudCBmb3IganF1ZXJ5LW1hc29ucnkgdG8gdXNlXG5cdCMjI1xuXHRtYXliZV9jcmVhdGVfc2l6ZXI6IC0+XG5cdFx0QGNyZWF0ZV9zaXplcigpIGlmIEBzaXplcl9kb2VzbnRfZXhpc3QoKVxuXHRcdHJldHVyblxuXG5cdG1heWJlX3JlbW92ZV9zaXplcjogLT5cblx0XHRyZXR1cm4gaWYgQCRjb250YWluZXIubGVuZ3RoIGlzbnQgMVxuXHRcdEAkY29udGFpbmVyLmZpbmQoIFwiLiN7QEVsZW1lbnRzLnNpemVyfVwiICkucmVtb3ZlKClcblx0XHRyZXR1cm5cblxuXHRzaXplcl9kb2VzbnRfZXhpc3Q6IC0+IEAkY29udGFpbmVyLmZpbmQoIFwiLiN7QEVsZW1lbnRzLnNpemVyfVwiICkubGVuZ3RoIGlzIDBcblxuXG5cdGNyZWF0ZV9zaXplcjogLT5cblx0XHRAJGNvbnRhaW5lci5hcHBlbmQgXCJcIlwiPGRpdiBjbGFzcz1cIiN7QEVsZW1lbnRzLnNpemVyfVwiPjwvZGl2PlwiXCJcIlxuXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gUG9ydGZvbGlvX01hc29ucnkiLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuJCA9IHJlcXVpcmUoICdqUXVlcnknIClcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcblxuIyBQb3J0Zm9saW8gbWFuYWdlciB3aWxsIHRyaWdnZXIgcG9ydGZvbGlvIGV2ZW50cyB3aGVuIG5lY2Vzc2FyeVxuVHJpZ2dlciA9IHJlcXVpcmUoICcuL1BvcnRmb2xpb19FdmVudHMnIClcblxuaXNfbWFzb25yeSA9IC0+XG5cdHJldHVybiAoICQoICcuUFBfTWFzb25yeScgKS5sZW5ndGggaXNudCAwIClcblxuIyBTdGFydCBNYXNvbnJ5IExheW91dFxuc3RhcnRfbWFzb25yeSA9IC0+XG5cdHJldHVybiBmYWxzZSBpZiBub3QgaXNfbWFzb25yeSgpXG5cblx0UG9ydGZvbGlvX01hc29ucnkgPSByZXF1aXJlKCAnLi9Qb3J0Zm9saW9fTWFzb25yeScgKVxuXHRuZXcgUG9ydGZvbGlvX01hc29ucnkoKVxuXG5tYXliZV9sYXp5X21hc29ucnkgPSAoIGhhbmRsZXIgKSAtPlxuXHQjIFVzZSBMYXp5X01hc29ucnkgaGFuZGxlciwgaWYgY3VycmVudCBsYXlvdXQgaXMgbWFzb25yeVxuXHRyZXR1cm4gcmVxdWlyZSggJ2xhenkvTGF6eV9NYXNvbnJ5JyApIGlmIGlzX21hc29ucnkoKVxuXHRyZXR1cm4gaGFuZGxlclxuXG5cbiMgU3RhcnQgUG9ydGZvbGlvXG5Ib29rcy5hZGRBY3Rpb24gJ3Bob3J0LmNvcmUucmVhZHknLCBUcmlnZ2VyLnByZXBhcmUsIDUwXG5Ib29rcy5hZGRBY3Rpb24gJ3Bob3J0LmNvcmUubG9hZGVkJywgVHJpZ2dlci5jcmVhdGUsIDUwXG5cbiMgSW5pdGlhbGl6ZSBNYXNvbnJ5IExheW91dFxuSG9va3MuYWRkQWN0aW9uICdwaG9ydC5jb3JlLnJlYWR5Jywgc3RhcnRfbWFzb25yeVxuXG4jIEluaXRpYWxpemUgTGF6eSBMb2FkaW5nIGZvciBNYXNvbnJ5IExheW91dFxuSG9va3MuYWRkRmlsdGVyICdwaG9ydC5sYXp5LmhhbmRsZXInLCBtYXliZV9sYXp5X21hc29ucnlcblxuXG5cbiJdfQ==
