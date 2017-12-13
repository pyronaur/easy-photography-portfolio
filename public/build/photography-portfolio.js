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
var $, Hooks, Lazy_Default, create, destroy, instance;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Lazy_Default = require("./Lazy_Default");

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
  Handler = Hooks.applyFilters("phort.lazy.handler", Lazy_Default);
  if (!($(".PP_Lazy_Image__placeholder").length > 0)) {
    return;
  }
  if (!Handler) {
    return;
  }
  instance = new Handler();
  Hooks.addAction("phort.core.loaded", instance.autoload);
};

Hooks.addAction("phort.portfolio.prepare", create, 100);

Hooks.addAction("phort.portfolio.destroy", destroy);

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
var $, Hooks, Portfolio_Interface, Portfolio_Masonry, defer,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Portfolio_Interface = require("./Portfolio_Interface");

defer = function(cb) {
  return setTimeout(cb, 1);
};

Portfolio_Masonry = (function(superClass) {
  var once;

  extend(Portfolio_Masonry, superClass);

  once = false;

  function Portfolio_Masonry() {
    this.refresh = bind(this.refresh, this);
    this.destroy = bind(this.destroy, this);
    this.create = bind(this.create, this);
    this.prepare = bind(this.prepare, this);
    this.Elements = {
      container: "PP_Masonry",
      sizer: "PP_Masonry__sizer",
      item: "PP_Masonry__item"
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
    this.$container.addClass("PP_JS__loading_masonry");
    this.maybe_create_sizer();
    masonry_settings = Hooks.applyFilters("phort.masonry.settings", {
      itemSelector: "." + this.Elements.item,
      columnWidth: "." + this.Elements.sizer,
      gutter: 0,
      initLayout: false
    });
    this.$container.masonry(masonry_settings);
    return this.$container.masonry("once", "layoutComplete", (function(_this) {
      return function() {
        _this.$container.removeClass("PP_JS__loading_masonry").addClass("PP_JS__loading_complete");
        return defer(function() {
          return Hooks.doAction("phort.portfolio.refresh");
        });
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
      this.$container.masonry("destroy");
    }
  };


  /*
  		Reload the layout
  		@called on hook `phort.portfolio.refresh`
   */

  Portfolio_Masonry.prototype.refresh = function() {
    return this.$container.masonry("layout");
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


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jb3JlL1V0aWxpdGllcy5qcyIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jb3JlL1dpbmRvdy5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY29yZS9zdGFydC5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvZ2FsbGVyeS9hZGFwdGVycy9saWdodGdhbGxlcnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvYWRhcHRlcnMvcGhvdG9zd2lwZS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvZ2FsbGVyeS9nYWxsZXJ5X2ZhY3RvcnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvZ2FsbGVyeV9pdGVtX2RhdGEuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvZ2FsbGVyeV9pdGVtX2ZhY3RvcnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvcHJlcGFyZV9nYWxsZXJ5X2ZhY3RvcnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvc3RhcnQuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvQWJzdHJhY3RfTGF6eV9Mb2FkZXIuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvTGF6eV9EZWZhdWx0LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0xhenlfTWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvbGF6eS9zdGFydC5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL1BvcnRmb2xpb19FdmVudHMuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL3BvcnRmb2xpby9Qb3J0Zm9saW9fSW50ZXJmYWNlLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9wb3J0Zm9saW8vUG9ydGZvbGlvX01hc29ucnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL3BvcnRmb2xpby9zdGFydC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOzs7QUFBQSxJQUFBOztBQUdBLEtBQUEsR0FBUSxPQUFBLENBQVMsVUFBVDs7QUFDUixDQUFBLEdBQUksT0FBQSxDQUFTLFFBQVQ7O0FBR0osTUFBTSxDQUFDLFVBQVAsR0FFQztFQUFBLG1CQUFBLEVBQXFCLE9BQUEsQ0FBUyxpQ0FBVCxDQUFyQjtFQUdBLE9BQUEsRUFDQztJQUFBLFNBQUEsRUFBYyxPQUFBLENBQVMsNkJBQVQsQ0FBZDtJQUNBLFlBQUEsRUFBYyxPQUFBLENBQVMsZ0NBQVQsQ0FEZDtHQUpEO0VBUUEsb0JBQUEsRUFBc0IsT0FBQSxDQUFTLDZCQUFULENBUnRCOzs7QUFXRCxNQUFNLENBQUMscUJBQVAsR0FDQztFQUFBLElBQUEsRUFBa0IsT0FBQSxDQUFTLGNBQVQsQ0FBbEI7RUFDQSxnQkFBQSxFQUFrQixPQUFBLENBQVMsbUJBQVQsQ0FEbEI7RUFFQSxPQUFBLEVBQWtCLE9BQUEsQ0FBUyxpQkFBVCxDQUZsQjtFQUdBLFdBQUEsRUFBa0IsT0FBQSxDQUFTLGNBQVQsQ0FIbEI7Ozs7QUFLRDs7OztBQUdBLENBQUEsQ0FBRyxRQUFILENBQWEsQ0FBQyxLQUFkLENBQW9CLFNBQUE7RUFHbkIsSUFBVSxDQUFJLENBQUEsQ0FBRyxNQUFILENBQVcsQ0FBQyxRQUFaLENBQXNCLGNBQXRCLENBQWQ7QUFBQSxXQUFBOztFQUdBLHFCQUFxQixDQUFDLElBQUksQ0FBQyxLQUEzQixDQUFBO0FBTm1CLENBQXBCOzs7Ozs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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Q0FBa0IsQ0FBQyxNQUFuQixLQUErQjtBQUQ1Qjs7QUFJYixhQUFBLEdBQWdCLFNBQUE7QUFDZixNQUFBO0VBQUEsSUFBZ0IsQ0FBSSxVQUFBLENBQUEsQ0FBcEI7QUFBQSxXQUFPLE1BQVA7O0VBRUEsaUJBQUEsR0FBb0IsT0FBQSxDQUFTLHFCQUFUO1NBQ3BCLElBQUksaUJBQUosQ0FBQTtBQUplOztBQU1oQixrQkFBQSxHQUFxQixTQUFFLE9BQUY7RUFFcEIsSUFBeUMsVUFBQSxDQUFBLENBQXpDO0FBQUEsV0FBTyxPQUFBLENBQVMsbUJBQVQsRUFBUDs7QUFDQSxTQUFPO0FBSGE7O0FBT3JCLEtBQUssQ0FBQyxTQUFOLENBQWdCLGtCQUFoQixFQUFvQyxPQUFPLENBQUMsT0FBNUMsRUFBcUQsRUFBckQ7O0FBQ0EsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsbUJBQWhCLEVBQXFDLE9BQU8sQ0FBQyxNQUE3QyxFQUFxRCxFQUFyRDs7QUFHQSxLQUFLLENBQUMsU0FBTixDQUFnQixrQkFBaEIsRUFBb0MsYUFBcEM7O0FBR0EsS0FBSyxDQUFDLFNBQU4sQ0FBZ0Isb0JBQWhCLEVBQXNDLGtCQUF0QyIsImZpbGUiOiJwaG90b2dyYXBoeS1wb3J0Zm9saW8uanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiMjI1xuICAgIExvYWQgRGVwZW5kZW5jaWVzXG4jIyNcbkhvb2tzID0gcmVxdWlyZSggJ3dwX2hvb2tzJyApXG4kID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuXG4jIEV4cG9zZSBzb21lIFBob3RvZ3JhcGh5IFBvcnRmb2xpbyBtb2R1bGVzIHRvIHRoZSBwdWJsaWMgZm9yIGV4dGVuc2liaWxpdHlcbndpbmRvdy5QUF9Nb2R1bGVzID1cblx0IyBFeHRlbmQgUG9ydGZvbGlvIEludGVyZmFjZSB0byBidWlsZCBjdXN0b20gcG9ydGZvbGlvIGxheW91dHMgYmFzZWQgb24gUFAgRXZlbnRzXG5cdFBvcnRmb2xpb19JbnRlcmZhY2U6IHJlcXVpcmUoICcuL3BvcnRmb2xpby9Qb3J0Zm9saW9fSW50ZXJmYWNlJyApXG5cbiMgVXNlIGBnYWxsZXJ5X2l0ZW1fZGF0YWAgdG8gZ2V0IGZvcm1hdHRlZCBpdGVtIGltYWdlIHNpemVzIGZvciBsYXp5IGxvYWRpbmdcblx0Z2FsbGVyeTpcblx0XHRpdGVtX2RhdGEgICA6IHJlcXVpcmUoICcuL2dhbGxlcnkvZ2FsbGVyeV9pdGVtX2RhdGEnIClcblx0XHRpdGVtX2ZhY3Rvcnk6IHJlcXVpcmUoICcuL2dhbGxlcnkvZ2FsbGVyeV9pdGVtX2ZhY3RvcnknIClcblxuIyBFeHRlbmQgQWJzdHJhY3RfTGF6eV9Mb2RlciB0byBpbXBsZW1lbnQgbGF6eSBsb2FkZXIgZm9yIHlvdXIgbGF5b3V0XG5cdEFic3RyYWN0X0xhenlfTG9hZGVyOiByZXF1aXJlKCAnLi9sYXp5L0Fic3RyYWN0X0xhenlfTG9hZGVyJyApXG5cblxud2luZG93LlBob3RvZ3JhcGh5X1BvcnRmb2xpbyA9XG5cdENvcmUgICAgICAgICAgICA6IHJlcXVpcmUoICcuL2NvcmUvc3RhcnQnIClcblx0UG9ydGZvbGlvX0xheW91dDogcmVxdWlyZSggJy4vcG9ydGZvbGlvL3N0YXJ0JyApXG5cdEdhbGxlcnkgICAgICAgICA6IHJlcXVpcmUoICcuL2dhbGxlcnkvc3RhcnQnIClcblx0TGF6eV9Mb2FkZXIgICAgIDogcmVxdWlyZSggJy4vbGF6eS9zdGFydCcgKVxuXG4jIyNcblx0Qm9vdCBvbiBgZG9jdW1lbnQucmVhZHlgXG4jIyNcbiQoIGRvY3VtZW50ICkucmVhZHkgLT5cblxuXHQjIE9ubHkgcnVuIHRoaXMgc2NyaXB0IHdoZW4gYm9keSBoYXMgYFBQX1BvcnRmb2xpb2AgY2xhc3Ncblx0cmV0dXJuIGlmIG5vdCAkKCAnYm9keScgKS5oYXNDbGFzcyggJ1BQX1BvcnRmb2xpbycgKVxuXG5cdCMgQm9vdFxuXHRQaG90b2dyYXBoeV9Qb3J0Zm9saW8uQ29yZS5yZWFkeSggKVxuXHRyZXR1cm5cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuXG5cbiAgICAvKipcbiAgICAgKiBUaGFuayB5b3UgUnVzcyBmb3IgaGVscGluZyBtZSBhdm9pZCB3cml0aW5nIHRoaXMgbXlzZWxmOlxuICAgICAqIEB1cmwgaHR0cHM6Ly9yZW15c2hhcnAuY29tLzIwMTAvMDcvMjEvdGhyb3R0bGluZy1mdW5jdGlvbi1jYWxscy8jY29tbWVudC0yNzQ1NjYzNTk0XG4gICAgICovXG4gICAgdGhyb3R0bGU6IGZ1bmN0aW9uICggZm4sIHRocmVzaGhvbGQsIHNjb3BlICkge1xuICAgICAgICB0aHJlc2hob2xkIHx8ICh0aHJlc2hob2xkID0gMjUwKVxuICAgICAgICB2YXIgbGFzdCxcbiAgICAgICAgICAgIGRlZmVyVGltZXJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBjb250ZXh0ID0gc2NvcGUgfHwgdGhpc1xuXG4gICAgICAgICAgICB2YXIgbm93ICA9ICtuZXcgRGF0ZSxcbiAgICAgICAgICAgICAgICBhcmdzID0gYXJndW1lbnRzXG4gICAgICAgICAgICBpZiAoIGxhc3QgJiYgbm93IDwgbGFzdCArIHRocmVzaGhvbGQgKSB7XG4gICAgICAgICAgICAgICAgLy8gaG9sZCBvbiB0byBpdFxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCggZGVmZXJUaW1lciApXG4gICAgICAgICAgICAgICAgZGVmZXJUaW1lciA9IHNldFRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFzdCA9IG5vd1xuICAgICAgICAgICAgICAgICAgICBmbi5hcHBseSggY29udGV4dCwgYXJncyApXG4gICAgICAgICAgICAgICAgfSwgdGhyZXNoaG9sZCArIGxhc3QgLSBub3cgKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsYXN0ID0gbm93XG4gICAgICAgICAgICAgICAgZm4uYXBwbHkoIGNvbnRleHQsIGFyZ3MgKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG5cbn0iLCJIb29rcyA9IHJlcXVpcmUoICd3cF9ob29rcycgKVxuXG5cbmdldF9zaXplID0gLT5cblx0d2lkdGggOiB3aW5kb3cuaW5uZXJXaWR0aCB8fCAkd2luZG93LndpZHRoKClcblx0aGVpZ2h0OiB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgJHdpbmRvdy5oZWlnaHQoKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0X3NpemUoKSIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuSG9va3MgPSByZXF1aXJlKCAnd3BfaG9va3MnIClcblxucmVhZHkgPSAtPlxuXHRpZiBIb29rcy5hcHBseUZpbHRlcnMoICdwaG9ydC5jb3JlLnJlYWR5JywgdHJ1ZSApXG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LmNvcmUucmVhZHknXG5cblx0IyBBdXRvbWF0aWNhbGx5IHRyaWdnZXIgYHBob3J0LmNvcmUubG9hZGVkYCB3aGVuIGltYWdlcyBhcmUgbG9hZGVkXG5cdCQoICcuUFBfV3JhcHBlcicgKS5pbWFnZXNMb2FkZWQoIGxvYWRlZCApXG5cdHJldHVyblxuXG5sb2FkZWQgPSAtPlxuXHRpZiBIb29rcy5hcHBseUZpbHRlcnMoICdwaG9ydC5jb3JlLmxvYWRlZCcsIHRydWUgKVxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5jb3JlLmxvYWRlZCdcblx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID1cblx0bG9hZGVkOiBsb2FkZWRcblx0cmVhZHkgOiByZWFkeSIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggXCJqUXVlcnlcIiApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5cbmRlZmF1bHRzID1cblx0ZHluYW1pYyA6IHRydWVcblx0c3BlZWQgICA6IDM1MFxuXHRwcmVsb2FkIDogM1xuXHRkb3dubG9hZDogZmFsc2Vcblx0ZXNjS2V5ICA6IGZhbHNlICMgV2UncmUgcm9sbGluZyBvdXIgb3duXG5cblx0dGh1bWJuYWlsICAgICAgICAgOiB0cnVlXG5cdHNob3dUaHVtYkJ5RGVmYXVsdDogdHJ1ZVxuXG4jIEBUT0RPOiBVc2UgT2JqZWN0LmFzc2lnbigpIHdpdGggQmFiZWxcbnNldHRpbmdzID0gJC5leHRlbmQoIHt9LCBkZWZhdWx0cywgd2luZG93Ll9fcGhvcnQubGlnaHRHYWxsZXJ5IClcblxuXG5zaW5nbGVfaXRlbV9kYXRhID0gKCBpdGVtICkgLT5cblxuXHRpZiBpdGVtLmRhdGEuZ2V0KCAndHlwZScgKSBpcyAndmlkZW8nXG5cdFx0ZnVsbCA9IGl0ZW0uZGF0YS5nZXQoICd2aWRlb191cmwnIClcblx0ZWxzZVxuXHRcdGZ1bGwgPSBpdGVtLmRhdGEudXJsKCAnZnVsbCcgKVxuXG5cdHJldHVybiB7XG5cdFx0c3JjICAgIDogZnVsbFxuXHRcdHRodW1iICA6IGl0ZW0uZGF0YS51cmwoICd0aHVtYicgKVxuXHRcdHN1Ykh0bWw6IGl0ZW0uY2FwdGlvblxuXHR9XG5cblxuZ2V0X3NldHRpbmdzID0gKCBnYWxsZXJ5LCBpbmRleCApIC0+XG5cdHNldHRpbmdzLmluZGV4ICAgICAgICAgPSBpbmRleFxuXHRzZXR0aW5ncy5keW5hbWljRWwgICAgID0gZ2FsbGVyeS5tYXAoIHNpbmdsZV9pdGVtX2RhdGEgKVxuXHRzZXR0aW5ncy52aWRlb01heFdpZHRoID0gd2luZG93LmlubmVyV2lkdGggKiAwLjhcblxuXHRIb29rcy5hcHBseUZpbHRlcnMgJ3Bob3J0LmxpZ2h0R2FsbGVyeS5zZXR0aW5ncycsIHNldHRpbmdzXG5cblxubW9kdWxlLmV4cG9ydHMgPSAoICRlbCApIC0+XG5cdGluc3RhbmNlOiAtPiBHYWxsZXJ5XG5cdGNsb3NlOiAtPlxuXHRcdEdhbGxlcnkgPSAkZWwuZGF0YSggJ2xpZ2h0R2FsbGVyeScgKVxuXHRcdEdhbGxlcnkuZGVzdHJveSggKSBpZiBHYWxsZXJ5IGFuZCBHYWxsZXJ5LmRlc3Ryb3k/XG5cblx0b3BlbjogKCBnYWxsZXJ5X2l0ZW1zLCBpbmRleCApIC0+XG5cdFx0R2FsbGVyeSA9ICRlbC5saWdodEdhbGxlcnkoIGdldF9zZXR0aW5ncyggZ2FsbGVyeV9pdGVtcywgaW5kZXggKSApXG5cblxuXG5cbiIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggXCJqUXVlcnlcIiApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5cbmxhYmVscyA9ICQuZXh0ZW5kKCB7fSwge1xuXHQnZmFjZWJvb2snOiAnU2hhcmUgb24gRmFjZWJvb2snLFxuXHQndHdpdHRlcic6ICdUd2VldCcsXG5cdCdwaW50ZXJlc3QnOiAnUGluIGl0Jyxcbn0sIHdpbmRvdy5fX3Bob3J0LmkxOG4ucGhvdG9zd2lwZSApXG5cblxuZGVmYXVsdHMgPVxuXHRpbmRleCAgICAgICA6IDBcblx0cHJlbG9hZCAgICAgOiBbIDEsIDMgXVxuXHRlc2NLZXkgICAgICA6IGZhbHNlXG5cdHNoYXJlQnV0dG9uczogW1xuXHRcdHsgaWQ6ICdmYWNlYm9vaycsIGxhYmVsOiBsYWJlbHMuZmFjZWJvb2ssIHVybDogJ2h0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS9zaGFyZXIvc2hhcmVyLnBocD91PXt7dXJsfX0nIH1cblx0XHR7IGlkOiAndHdpdHRlcicsIGxhYmVsIDogbGFiZWxzLnR3aXR0ZXIsIHVybDogJ2h0dHBzOi8vdHdpdHRlci5jb20vaW50ZW50L3R3ZWV0P3RleHQ9e3t0ZXh0fX0mdXJsPXt7dXJsfX0nIH1cblx0XHR7IGlkOiAncGludGVyZXN0JywgbGFiZWw6IGxhYmVscy5waW50ZXJlc3QsIHVybDogJ2h0dHA6Ly93d3cucGludGVyZXN0LmNvbS9waW4vY3JlYXRlL2J1dHRvbi8/dXJsPXt7dXJsfX0mbWVkaWE9e3tpbWFnZV91cmx9fSZkZXNjcmlwdGlvbj17e3RleHR9fScgfVxuXHRdXG5cblxucHN3cCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoICcucHN3cCcgKVxuVUkgPSBIb29rcy5hcHBseUZpbHRlcnMoIFwicGhvcnQucGhvdG9zd2lwZS5VSVwiLCB3aW5kb3cuUGhvdG9Td2lwZVVJX0RlZmF1bHQgKVxuUGhvdG9Td2lwZSA9IHdpbmRvdy5QaG90b1N3aXBlXG5cblxuY3JlYXRlID0gKCBkYXRhLCBvcHRzID0ge30gKSAtPlxuXG5cdG9wdGlvbnMgPSAkLmV4dGVuZCgge30sIGRlZmF1bHRzLCBvcHRzIClcblx0b3B0aW9ucyA9IEhvb2tzLmFwcGx5RmlsdGVycyggXCJwaG9ydC5waG90b3N3aXBlLm9wdGlvbnNcIiwgb3B0aW9ucywgZGF0YSwgb3B0cyApXG5cblx0IyBJbmRleCBpcyAwIGJ5IGRlZmF1bHRcblx0aWYgbm90IG9wdGlvbnMuaW5kZXg/XG5cdFx0b3B0aW9ucy5pbmRleCA9IDBcblxuXHQjIFNldCB0aGUgaW5kZXggdG8gMCBpZiBpdCBpc24ndCBhIHByb3BlciB2YWx1ZVxuXHRpZiBub3Qgb3B0aW9ucy5pbmRleCBvciBvcHRpb25zLmluZGV4IDwgMFxuXHRcdG9wdGlvbnMuaW5kZXggPSAwXG5cblx0aW5zdGFuY2UgPSBuZXcgUGhvdG9Td2lwZSggcHN3cCwgVUksIGRhdGEsIG9wdGlvbnMgKVxuXHRpbnN0YW5jZS5pbml0KCApXG5cblx0cmV0dXJuIGluc3RhbmNlXG5cblxuc2luZ2xlX2l0ZW1fZGF0YSA9ICggaXRlbSApIC0+XG5cdCMgUGhvdG9Td2lwZSBzdXBwb3J0cyBvbmx5IGltYWdlc1xuXHRyZXR1cm4gaWYgaXRlbS5kYXRhLmdldCggJ3R5cGUnICkgaXNudCAnaW1hZ2UnXG5cblxuXHRbd2lkdGgsIGhlaWdodF0gPSBpdGVtLmRhdGEuc2l6ZSggJ2Z1bGwnIClcblxuXHQjIHJldHVyblxuXHRzcmMgIDogaXRlbS5kYXRhLnVybCggJ2Z1bGwnIClcblx0bXNyYyA6IGl0ZW0uZGF0YS51cmwoICdmdWxsJyApXG5cdHcgICAgOiB3aWR0aFxuXHRoICAgIDogaGVpZ2h0XG5cdHRpdGxlOiBpdGVtLmNhcHRpb25cblxuXG50aHVtYm5haWxfcG9zaXRpb24gPSAoICRnYWxsZXJ5ICkgLT4gcmV0dXJuICggaW5kZXggKSAtPlxuXHRyZXR1cm4gZmFsc2UgaWYgbm90ICRnYWxsZXJ5Lmxlbmd0aFxuXG5cdCRlbCA9ICRnYWxsZXJ5LmVxKCBpbmRleCApXG5cdHRodW1ibmFpbCA9ICRlbC5maW5kKCAnaW1nJyApLmdldCggMCApXG5cblx0IyBUaHVtYm5haWwgbXVzdCBleGlzdCBiZWZvcmUgZGltZW5zaW9ucyBjYW4gYmUgb2J0YWluZWRcblx0cmV0dXJuIGlmIG5vdCB0aHVtYm5haWxcblxuXHRwYWdlWVNjcm9sbCA9IHdpbmRvdy5wYWdlWU9mZnNldCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wXG5cdHJlY3QgPSB0aHVtYm5haWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCApXG5cblx0IyAvLyB3ID0gd2lkdGhcblx0b3V0ID1cblx0XHR4OiByZWN0LmxlZnRcblx0XHR5OiByZWN0LnRvcCArIHBhZ2VZU2Nyb2xsXG5cdFx0dzogcmVjdC53aWR0aFxuXG5cdHJldHVybiBvdXRcblxuXG5tb2R1bGUuZXhwb3J0cyA9ICggJGVsICkgLT5cblx0R2FsbGVyeSA9IGZhbHNlXG5cdGluc3RhbmNlOiAtPiBHYWxsZXJ5XG5cdGNsb3NlOiAtPlxuXHRcdHJldHVybiBpZiBub3QgR2FsbGVyeVxuXHRcdEdhbGxlcnkuY2xvc2UoIClcblx0XHRHYWxsZXJ5ID0gZmFsc2VcblxuXHRvcGVuOiAoIGdhbGxlcnksIGluZGV4ICkgLT5cblx0XHRvcHRpb25zID1cblx0XHRcdGdldFRodW1iQm91bmRzRm46IHRodW1ibmFpbF9wb3NpdGlvbiggJGVsLmNsb3Nlc3QoICcuUFBfR2FsbGVyeScgKS5maW5kKCAnLlBQX0dhbGxlcnlfX2l0ZW0nICkgKVxuXHRcdFx0aW5kZXggICAgICAgICAgIDogaW5kZXhcblxuXHRcdEdhbGxlcnkgPSBjcmVhdGUoIGdhbGxlcnkubWFwKCBzaW5nbGVfaXRlbV9kYXRhICksIG9wdGlvbnMgKVxuXG5cblxuIiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoICd3cF9ob29rcycgKVxuZ2FsZXJ5X2l0ZW1fZGF0YSA9IHJlcXVpcmUoICcuL2dhbGxlcnlfaXRlbV9mYWN0b3J5JyApXG5cblxucGFyc2VfZ2FsbGVyeV9pdGVtID0gKCBrZXksIGVsICkgLT5cblx0JGVsID0gJCggZWwgKVxuXG5cdGluZGV4ICA6IGtleVxuXHRkYXRhICAgOiBnYWxlcnlfaXRlbV9kYXRhKCAkZWwgKVxuXHRjYXB0aW9uOiAkZWwuZmluZCggJy5QUF9HYWxsZXJ5X19jYXB0aW9uJyApLmh0bWwoICkgfHwgJydcblxuXG5tb2R1bGUuZXhwb3J0cyA9ICggR2FsbGVyeV9Ecml2ZXIgKSAtPlxuXHRpbnN0YW5jZSA9IGZhbHNlXG5cblx0b3BlbiA9ICggZWwgKSAtPlxuXHRcdCRlbCA9ICQoIGVsIClcblx0XHQkaXRlbXMgPSAkZWwuY2xvc2VzdCggJy5QUF9HYWxsZXJ5JyApLmZpbmQoICcuUFBfR2FsbGVyeV9faXRlbScgKVxuXG5cdFx0aWYgJGl0ZW1zLmxlbmd0aCA+IDBcblx0XHRcdGluZGV4ID0gJGl0ZW1zLmluZGV4KCAkZWwgKVxuXHRcdFx0Z2FsbGVyeV9pdGVtcyA9ICQubWFrZUFycmF5KCAkaXRlbXMubWFwKCBwYXJzZV9nYWxsZXJ5X2l0ZW0gKSApXG5cblx0XHRcdGluc3RhbmNlID0gR2FsbGVyeV9Ecml2ZXIoICRlbCApXG5cdFx0XHRpbnN0YW5jZS5vcGVuKCBnYWxsZXJ5X2l0ZW1zLCBpbmRleCApXG5cblx0XHRcdEhvb2tzLmRvQWN0aW9uKCAncGhvcnQuZ2FsbGVyeS5vcGVuJywgaW5zdGFuY2UsIGdhbGxlcnlfaXRlbXMsIGluZGV4IClcblxuXHRcdHJldHVyblxuXG5cdG9wZW46IG9wZW5cblxuXHRoYW5kbGVfaGFzaDogLT5cblx0XHRpbmRleCA9IHBhcnNlSW50KCB3aW5kb3cubG9jYXRpb24uaGFzaC5zcGxpdCggJyZwaWQ9JyApWyAxIF0sIDEwIClcblx0XHRlbCA9ICQoICcuUFBfR2FsbGVyeScgKS5maXJzdCggKS5maW5kKCAnLlBQX0dhbGxlcnlfX2l0ZW0nICkuZ2V0KCBpbmRleCApXG5cdFx0b3BlbiggZWwgKVxuXG5cdFx0cmV0dXJuXG5cblx0Y2xvc2U6IC0+XG5cdFx0cmV0dXJuIGZhbHNlIGlmIG5vdCBpbnN0YW5jZVxuXG5cdFx0aW5zdGFuY2UuY2xvc2UoIClcblx0XHRpbnN0YW5jZSA9IGZhbHNlXG5cblx0XHRIb29rcy5kb0FjdGlvbiggJ3Bob3J0LmdhbGxlcnkuY2xvc2UnLCBpbnN0YW5jZSApXG5cdFx0cmV0dXJuIiwiaXRlbV9kYXRhID0gKCBkYXRhX29iaiApIC0+XG5cblx0cGx1Y2sgPSAoIG9iamVjdCwga2V5ICkgLT5cblx0XHRpZiBvYmplY3QgYW5kIG9iamVjdFsga2V5IF1cblx0XHRcdHJldHVybiBvYmplY3RbIGtleSBdXG5cdFx0cmV0dXJuIGZhbHNlXG5cblx0Z2V0ID0gKCBrZXkgKSAtPiBwbHVjayggZGF0YV9vYmosIGtleSApXG5cblx0aW1hZ2UgPSAoIHNpemVfbmFtZSApIC0+IHBsdWNrKCBnZXQoICdpbWFnZXMnICksIHNpemVfbmFtZSApXG5cblxuXHRzaXplOiAoIHNpemVfbmFtZSApIC0+XG5cdFx0aW1hZ2Vfc2l6ZSA9IHBsdWNrKCBpbWFnZSggc2l6ZV9uYW1lICksICdzaXplJyApXG5cdFx0cmV0dXJuIGZhbHNlIGlmIG5vdCBpbWFnZV9zaXplXG5cblx0XHRbd2lkdGgsIGhlaWdodF0gPSBpbWFnZV9zaXplLnNwbGl0KCAneCcgKVxuXG5cdFx0d2lkdGggPSBwYXJzZUludCggd2lkdGggKVxuXHRcdGhlaWdodCA9IHBhcnNlSW50KCBoZWlnaHQgKVxuXG5cdFx0cmV0dXJuIFsgd2lkdGgsIGhlaWdodCBdXG5cblx0dXJsOiAoIHNpemVfbmFtZSApIC0+IHBsdWNrKCBpbWFnZSggc2l6ZV9uYW1lICksICd1cmwnIClcblx0Z2V0OiBnZXRcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGl0ZW1fZGF0YSIsIml0ZW0gPSByZXF1aXJlKCcuL2dhbGxlcnlfaXRlbV9kYXRhJylcblxuaXRlbV9kYXRhID0gKCAkZWwgKSAtPlxuXHRkYXRhX29iaiA9ICRlbC5kYXRhKCAnaXRlbScgKVxuXG5cdGlmIG5vdCBkYXRhX29ialxuXHRcdHRocm93IG5ldyBFcnJvciBcIkVsZW1lbnQgZG9lc24ndCBjb250YWluIGBkYXRhLWl0ZW1gIGF0dHJpYnV0ZVwiXG5cblx0cmV0dXJuIGl0ZW0oIGRhdGFfb2JqIClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGl0ZW1fZGF0YSIsIkhvb2tzID0gcmVxdWlyZShcIndwX2hvb2tzXCIpXG5cbiNcbiMgVGhpcyBmaWxlIGlzIGdvaW5nIHRvIHJldHVybiBhIFtHYWxsZXJ5IEZhY3RvcnldIGluc3RhbmNlXG4jIEVhc3kgUGhvdG9ncmFwaHkgUG9ydGZvbGlvIGlzIHVzaW5nIHRoYXQgdG8gb3Blbi9jbG9zZS9kZXN0cm95IGdhbGxlcmllc1xuI1xuIyBbR2FsbGVyeSBGYWN0b3J5XSByZWxpZXMgb24gYSBbQWRhcHRlcl1cbiMgSW5zdGVhZCBvZiByZWx5aW5nIGRpcmVjdGx5IG9uIGEgZGVwZW5kZW5jeSwgR2FsbGVyeSBGYWN0b3J5IHJlbGllcyBvbiBhIEFkYXB0ZXIgdGhhdCBjYW4gYmUgbW9kaWZpZWRcbiMgQSBBZGFwdGVyIGlzIGFuIGFkYXB0ZXIgZm9yIGEgUG9wdXAtR2FsbGVyeSBwbHVnaW4sIHN1Y2ggYXMgTGlnaHRHYWxsZXJ5IG9yIFBob3RvU3dpcGVcbiNcbiMgU28gd2hlbiBhIGdhbGxlcnkgaXMgb3BlbmVkLCB0aGlzIGlzIHByb2JhYmx5IGhvdyBpdCdzIGdvaW5nIHRvIGxvb2s6XG4jIFtHYWxsZXJ5IEZhY3RvcnldIGFza3MgW0FkYXB0ZXJdIHRvIGZpbmQgYW5kIG9wZW4gYSBnYWxsZXJ5IHdpdGggW2FueSBMaWdodEJveCBMaWJyYXJ5XVxuI1xuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgR2FsbGVyeSBBZGFwdGVyOlxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5zZXR1cF9kcml2ZXIgPSAoIGRyaXZlcl9uYW1lID0gJ2xpZ2h0Z2FsbGVyeScgKSAtPlxuXHRpZiBkcml2ZXJfbmFtZSBpcyAnbGlnaHRnYWxsZXJ5J1xuXHRcdGFkYXB0ZXIgPSByZXF1aXJlKCAnLi9hZGFwdGVycy9saWdodGdhbGxlcnknIClcblxuXHRpZiBkcml2ZXJfbmFtZSBpcyAncGhvdG9zd2lwZSdcblx0XHRhZGFwdGVyID0gcmVxdWlyZSggJy4vYWRhcHRlcnMvcGhvdG9zd2lwZScgKVxuXG5cdHJldHVybiBIb29rcy5hcHBseUZpbHRlcnMoICdwaG9ydC5nYWxsZXJ5LmRyaXZlcicsIGFkYXB0ZXIgKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgR2FsbGVyeSBGYWN0b3J5OlxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIFRoZSBnYWxsZXJ5IGZhY3RvcnkgaXMgd2hhdCB3ZSdyZSBpbnRlcmFjdGluZyB3aXRoIHRvIG9wZW4vY2xvc2UgYSBnYWxsZXJ5XG5zZXR1cF9mYWN0b3J5ID0gLT5cblx0ZmFjdG9yeSA9IHJlcXVpcmUoICcuL2dhbGxlcnlfZmFjdG9yeScgKVxuXHRyZXR1cm4gSG9va3MuYXBwbHlGaWx0ZXJzKCAncGhvcnQuZ2FsbGVyeS5mYWN0b3J5JywgZmFjdG9yeSApXG5cbiNcbiMgUmV0dXJuIGEgZmFjdG9yeSBpbnN0YW5jZVxuI1xuXG5nYWxsZXJ5X2RyaXZlciA9IHNldHVwX2RyaXZlciggd2luZG93Ll9fcGhvcnQucG9wdXBfZ2FsbGVyeSApXG5nYWxsZXJ5X2ZhY3RvcnkgPSBzZXR1cF9mYWN0b3J5KCApXG5cbm1vZHVsZS5leHBvcnRzID0gZ2FsbGVyeV9mYWN0b3J5KCBnYWxsZXJ5X2RyaXZlciApIiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoICd3cF9ob29rcycgKVxuR2FsbGVyeSA9IHJlcXVpcmUoICcuL3ByZXBhcmVfZ2FsbGVyeV9mYWN0b3J5JyApXG5cbiQoZG9jdW1lbnQpLnJlYWR5IC0+XG5cblx0aGFuZGxlX2NsaWNrcyA9IEhvb2tzLmFwcGx5RmlsdGVycyggJ3Bob3J0LmdhbGxlcnkuaGFuZGxlX2NsaWNrcycsIHRydWUgKVxuXHRoYW5kbGVfaGFzaCA9IEhvb2tzLmFwcGx5RmlsdGVycyggJ3Bob3J0LmdhbGxlcnkuaGFuZGxlX2hhc2gnLCB0cnVlIClcblx0aGFuZGxlX2VzY19rZXkgPSBIb29rcy5hcHBseUZpbHRlcnMoICdwaG9ydC5nYWxsZXJ5LmN1c3RvbV9lc2MnLCB0cnVlIClcblxuXHQjIEhhbmRsZSBIYXNoY2hhbmdlXG5cdGlmIGhhbmRsZV9oYXNoIGFuZCB3aW5kb3cubG9jYXRpb24uaGFzaCBhbmQgR2FsbGVyeS5oYW5kbGVfaGFzaFxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQuY29yZS5sb2FkZWQnLCBHYWxsZXJ5LmhhbmRsZV9oYXNoXG5cblx0IyBIYW5kbGUgQ2xpY2tzXG5cdGlmIGhhbmRsZV9jbGlja3Ncblx0XHQkKCBkb2N1bWVudCApLm9uICdjbGljaycsICcuUFBfR2FsbGVyeV9faXRlbScsICggZSApIC0+XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCApXG5cdFx0XHRHYWxsZXJ5Lm9wZW4oIHRoaXMgKVxuXG5cblx0IyBIYW5kbGUgRVNDYXBlIEtleVxuXHRpZiBoYW5kbGVfZXNjX2tleVxuXHRcdCQoIHdpbmRvdyApLm9uICdrZXlkb3duJywgKCBlICkgLT5cblx0XHRcdHJldHVybiB1bmxlc3MgZS5rZXkgaXMgJ0VzY2FwZSdcblx0XHRcdGUucHJldmVudERlZmF1bHQoIClcblx0XHRcdEdhbGxlcnkuY2xvc2UoIClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbGxlcnlcbiIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuZ2FsbGVyeV9pdGVtID0gcmVxdWlyZSggJy4uL2dhbGxlcnkvZ2FsbGVyeV9pdGVtX2ZhY3RvcnknIClcbl9fV0lORE9XID0gcmVxdWlyZSggJy4uL2NvcmUvV2luZG93JyApXG50aHJvdHRsZSA9IHJlcXVpcmUoJy4uL2NvcmUvVXRpbGl0aWVzJykudGhyb3R0bGVcblxuY2xhc3MgQWJzdHJhY3RfTGF6eV9Mb2FkZXJcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QEVsZW1lbnRzID1cblx0XHRcdGl0ZW0gICAgICAgOiAnUFBfTGF6eV9JbWFnZSdcblx0XHRcdHBsYWNlaG9sZGVyOiAnUFBfTGF6eV9JbWFnZV9fcGxhY2Vob2xkZXInXG5cdFx0XHRsaW5rICAgICAgIDogJ1BQX0pTX0xhenlfX2xpbmsnXG5cdFx0XHRpbWFnZSAgICAgIDogJ1BQX0pTX0xhenlfX2ltYWdlJ1xuXG5cdFx0QEl0ZW1zID0gW11cblxuXHRcdCMgQWRqdXN0YWJsZSBTZW5zaXRpdml0eSBmb3IgQGluX3ZpZXcgZnVuY3Rpb25cblx0XHQjIFZhbHVlIGluIHBpeGVsc1xuXHRcdEBTZW5zaXRpdml0eSA9IDEwMFxuXG5cdFx0IyBBdXRvLXNldHVwIHdoZW4gZXZlbnRzIGFyZSBhdHRhY2hlZFxuXHRcdCMgQXV0by1kZXN0cm95IHdoZW4gZXZlbnRzIGFyZSBkZXRhY2hlZFxuXHRcdEB0aHJvdHRsZWRfYXV0b2xvYWQgPSBudWxsXG5cblx0XHRAc2V0dXBfaXRlbXMoKVxuXHRcdEByZXNpemVfYWxsKClcblx0XHRAYXR0YWNoX2V2ZW50cygpXG5cblx0IyMjXG5cdFx0QWJzdHJhY3QgTWV0aG9kc1xuXHQjIyNcblxuXHQjIFRoaXMgaXMgcnVuIHdoZW4gYSByZXNpemUgb3IgcmVmcmVzaCBldmVudCBpcyBkZXRlY3RlZFxuXHRyZXNpemU6IC0+IHJldHVyblxuXG5cdGxvYWQ6ICggaXRlbSApIC0+XG5cdFx0QGxvYWRfaW1hZ2UoIGl0ZW0gKVxuXHRcdGl0ZW0uJGVsLmltYWdlc0xvYWRlZCA9PlxuXHRcdFx0QGNsZWFudXBfYWZ0ZXJfbG9hZCggaXRlbSApXG5cblx0bG9hZF9pbWFnZTogKCBpdGVtICkgLT5cblxuXHRcdCMgR2V0IGltYWdlIFVSTFxuXHRcdHRodW1iID0gaXRlbS5kYXRhLnVybCggJ3RodW1iJyApXG5cdFx0ZnVsbCA9IGl0ZW0uZGF0YS51cmwoICdmdWxsJyApXG5cblx0XHQjIENyZWF0ZSBlbGVtZW50c1xuXHRcdGl0ZW0uJGVsXG5cdFx0XHQucHJlcGVuZCggQGdldF9pdGVtX2h0bWwoIHRodW1iLCBmdWxsICkgKVxuXHRcdFx0LnJlbW92ZUNsYXNzKCAnTGF6eS1JbWFnZScgKVxuXG5cdFx0IyBNYWtlIHN1cmUgdGhpcyBpbWFnZSBpc24ndCBsb2FkZWQgYWdhaW5cblx0XHRpdGVtLmxvYWRlZCA9IHRydWVcblxuXHRjbGVhbnVwX2FmdGVyX2xvYWQ6ICggaXRlbSApIC0+XG5cdFx0IyBBZGQgaW1hZ2UgUFBfSlNfbG9hZGVkIGNsYXNzXG5cdFx0aXRlbS4kZWwuZmluZCggJ2ltZycgKS5hZGRDbGFzcyggJ1BQX0pTX19sb2FkZWQnICkucmVtb3ZlQ2xhc3MoICdQUF9KU19fbG9hZGluZycgKVxuXG5cdFx0aXRlbS4kZWxcblxuXHRcdFx0IyBSZW1vdmUgYFBQX0xhenlfSW1hZ2VgLCBhcyB0aGlzIGlzIG5vdCBhIGxhenktbG9hZGFibGUgaW1hZ2UgYW55bW9yZVxuXHRcdFx0LnJlbW92ZUNsYXNzKCBARWxlbWVudHMuaXRlbSApXG5cblx0XHRcdCMgUmVtb3ZlIFBsYWNlaG9sZGVyXG5cdFx0XHQuZmluZCggXCIuI3tARWxlbWVudHMucGxhY2Vob2xkZXJ9XCIgKVxuXHRcdFx0LmZhZGVPdXQoIDQwMCwgLT4gJCggdGhpcyApLnJlbW92ZSgpIClcblxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5sYXp5LmxvYWRlZF9pdGVtJywgaXRlbVxuXG5cblx0Z2V0X2l0ZW1faHRtbDogKCB0aHVtYiwgZnVsbCApIC0+XG5cblx0XHRpZiAnZGlzYWJsZScgaXMgd2luZG93Ll9fcGhvcnQucG9wdXBfZ2FsbGVyeVxuXHRcdFx0cmV0dXJuIFwiXCJcIlxuXHRcdFx0PGRpdiBjbGFzcz1cIiN7QEVsZW1lbnRzLmxpbmt9XCIgcmVsPVwiZ2FsbGVyeVwiPlxuXHRcdFx0XHQ8aW1nIGNsYXNzPVwiI3tARWxlbWVudHMuaW1hZ2V9XCIgc3JjPVwiI3t0aHVtYn1cIiBjbGFzcz1cIlBQX0pTX19sb2FkaW5nXCIgLz5cblx0XHRcdDwvZGl2PlxuXHRcdFx0XCJcIlwiXG5cdFx0ZWxzZVxuXHRcdFx0cmV0dXJuIFwiXCJcIlxuXHRcdFx0PGEgY2xhc3M9XCIje0BFbGVtZW50cy5saW5rfVwiIGhyZWY9XCIje2Z1bGx9XCIgcmVsPVwiZ2FsbGVyeVwiPlxuXHRcdFx0XHQ8aW1nIGNsYXNzPVwiI3tARWxlbWVudHMuaW1hZ2V9XCIgc3JjPVwiI3t0aHVtYn1cIiBjbGFzcz1cIlBQX0pTX19sb2FkaW5nXCIgLz5cblx0XHRcdDwvYT5cblx0XHRcdFwiXCJcIlxuXG5cdHNldHVwX2l0ZW1zOiA9PlxuXHRcdCMgQ2xlYXIgZXhpc3RpbmcgaXRlbXMsIGlmIGFueVxuXHRcdEBJdGVtcyA9IFtdXG5cblx0XHQjIExvb3Agb3ZlciBET00gYW5kIGFkZCBlYWNoIGl0ZW0gdG8gQEl0ZW1zXG5cdFx0JCggXCIuI3tARWxlbWVudHMuaXRlbX1cIiApLmVhY2goIEBhZGRfaXRlbSApXG5cdFx0cmV0dXJuXG5cblx0YWRkX2l0ZW06ICgga2V5LCBlbCApID0+XG5cdFx0JGVsID0gJCggZWwgKVxuXHRcdEBJdGVtcy5wdXNoXG5cdFx0XHRlbCAgICA6IGVsXG5cdFx0XHQkZWwgICA6ICRlbFxuXHRcdFx0ZGF0YSAgOiBnYWxsZXJ5X2l0ZW0oICRlbCApXG5cdFx0XHRsb2FkZWQ6IGZhbHNlXG5cblxuXHRcdHJldHVyblxuXG5cblx0IyMjXG5cdFx0TWV0aG9kc1xuXHQjIyNcblx0cmVzaXplX2FsbDogLT5cblx0XHRAcmVzaXplKCBpdGVtICkgZm9yIGl0ZW0gaW4gQEl0ZW1zXG5cblxuXG5cdCMgQXV0b21hdGljYWxseSBMb2FkIGFsbCBpdGVtcyB0aGF0IGFyZSBgaW5fbG9vc2Vfdmlld2Bcblx0YXV0b2xvYWQ6ID0+XG5cdFx0Zm9yIGl0ZW0sIGtleSBpbiBASXRlbXNcblx0XHRcdGlmIG5vdCBpdGVtLmxvYWRlZCBhbmQgQGluX2xvb3NlX3ZpZXcoIGl0ZW0uZWwgKVxuXHRcdFx0XHRAbG9hZCggaXRlbSApXG5cblx0aW5fbG9vc2VfdmlldzogKCBlbCApIC0+XG5cdFx0cmV0dXJuIHRydWUgaWYgbm90IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdD9cblx0XHRyZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcblxuXHRcdCMgRWxlbWVudHMgbm90IGluIHZpZXcgaWYgdGhleSBkb24ndCBoYXZlIGRpbWVuc2lvbnNcblx0XHRyZXR1cm4gZmFsc2UgaWYgcmVjdC5oZWlnaHQgaXMgMCBhbmQgcmVjdC53aWR0aCBpcyAwXG5cblxuXHRcdHJldHVybiAoXG5cdFx0XHQjIFkgQXhpc1xuXHRcdFx0cmVjdC50b3AgKyByZWN0LmhlaWdodCA+PSAtQFNlbnNpdGl2aXR5IGFuZCAjIHRvcFxuXHRcdFx0cmVjdC5ib3R0b20gLSByZWN0LmhlaWdodCA8PSBfX1dJTkRPVy5oZWlnaHQgKyBAU2Vuc2l0aXZpdHkgYW5kXG5cblx0XHRcdCMgWCBBeGlzXG5cdFx0XHRyZWN0LmxlZnQgKyByZWN0LndpZHRoID49IC1AU2Vuc2l0aXZpdHkgYW5kXG5cdFx0XHRyZWN0LnJpZ2h0IC0gcmVjdC53aWR0aCA8PSBfX1dJTkRPVy53aWR0aCArIEBTZW5zaXRpdml0eVxuXG5cdFx0KVxuXG5cdGRlc3Ryb3k6IC0+XG5cdFx0QGRldGFjaF9ldmVudHMoKVxuXG5cdGF0dGFjaF9ldmVudHM6IC0+XG5cdFx0IyBDcmVhdGUgYSBkZWJvdW5jZWQgYGF1dG9sb2FkYCBmdW5jdGlvblxuXHRcdEB0aHJvdHRsZWRfYXV0b2xvYWQgPSB0aHJvdHRsZSggQGF1dG9sb2FkLCA1MCApXG5cdFx0SG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCcsIEB0aHJvdHRsZWRfYXV0b2xvYWQsIDEwMFxuXG5cblx0ZGV0YWNoX2V2ZW50czogLT5cblx0XHQjIENsZWFyIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gZnJvbSBpbnN0YW5jZVxuXHRcdEB0aHJvdHRsZWRfYXV0b2xvYWQgPSBudWxsXG5cdFx0SG9va3MucmVtb3ZlQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCcsIEB0aHJvdHRsZWRfYXV0b2xvYWQsIDEwMFxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBYnN0cmFjdF9MYXp5X0xvYWRlclxuIiwiJCA9IHJlcXVpcmUoIFwialF1ZXJ5XCIgKVxuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuQWJzdHJhY3RfTGF6eV9Mb2FkZXIgPSByZXF1aXJlKCBcIi4vQWJzdHJhY3RfTGF6eV9Mb2FkZXJcIiApXG5cbmNsYXNzIExhenlfRGVmYXVsdCBleHRlbmRzIEFic3RyYWN0X0xhenlfTG9hZGVyXG5cblxuXHRyZXNpemU6ICggaXRlbSApIC0+XG5cdFx0W3csIGhdID0gaXRlbS5kYXRhLnNpemUoIFwidGh1bWJcIiApXG5cdFx0cmF0aW8gPSBpdGVtLmRhdGEuZ2V0KCBcInJhdGlvXCIgKVxuXG5cdFx0c21hbGxlc3Rfd2lkdGggPSBNYXRoLm1pbiggaXRlbS4kZWwud2lkdGgoICksIHcgKVxuXHRcdGhlaWdodCA9IE1hdGguZmxvb3IoIHNtYWxsZXN0X3dpZHRoIC8gcmF0aW8gKVxuXHRcdHdpZHRoID0gTWF0aC5mbG9vciggc21hbGxlc3Rfd2lkdGggKVxuXG5cdFx0aXRlbS4kZWwuY3NzXG5cdFx0XHRcIndpZHRoXCIgOiB3aWR0aFxuXHRcdFx0XCJoZWlnaHRcIjogaGVpZ2h0XG5cblx0Y2xlYW51cF9hZnRlcl9sb2FkOiAoIGl0ZW0gKSAtPlxuXHRcdCMgUmVtb3ZlIG1pbi1oZWlnaHRcblx0XHRpdGVtLiRlbC5jc3MoIFwibWluLWhlaWdodFwiLCBcIlwiIClcblxuXHRcdCMgUnVuIGFsbCBvdGhlciBjbGVhbnVwc1xuXHRcdHN1cGVyKCBpdGVtIClcblxuXHRcdEhvb2tzLmRvQWN0aW9uIFwicGhvcnQucG9ydGZvbGlvLnJlZnJlc2hcIlxuXG5cdFx0cmV0dXJuXG5cblx0YXR0YWNoX2V2ZW50czogLT5cblx0XHQjIENhbGwgUGFyZW50IGZpcnN0LCBpdCdzIGdvaW5nIHRvIGNyZWF0ZSBAdGhyb3R0bGVkX2F1dG9sb2FkXG5cdFx0c3VwZXIoIClcblxuXHRcdCMgQXR0YWNoXG5cdFx0JCggd2luZG93ICkub24gXCJzY3JvbGxcIiwgQHRocm90dGxlZF9hdXRvbG9hZFxuXG5cblxuXHRkZXRhY2hfZXZlbnRzOiAtPlxuXHRcdCMgRGV0YWNoXG5cdFx0JCggd2luZG93ICkub2ZmIFwic2Nyb2xsXCIsIEB0aHJvdHRsZWRfYXV0b2xvYWRcblxuXHRcdCMgQ2FsbCBwYXJlbnQgbGFzdCwgaXQncyBnb2luZyB0byBjbGVhbiB1cCBAdGhyb3R0bGVkX2F1dG9sb2FkXG5cdFx0c3VwZXIoIClcblxuXHRkZXN0cm95OiAtPlxuXHRcdGZvciBpdGVtLCBrZXkgaW4gQEl0ZW1zXG5cdFx0XHRpdGVtLiRlbC5jc3Ncblx0XHRcdFx0J21pbi1oZWlnaHQnOiAnJ1xuXHRcdFx0XHQnbWF4LXdpZHRoJyA6ICcnXG5cdFx0c3VwZXIoIClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IExhenlfRGVmYXVsdFxuIiwiJCA9IHJlcXVpcmUoICdqUXVlcnknIClcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcbkFic3RyYWN0X0xhenlfTG9hZGVyID0gcmVxdWlyZSggJy4vQWJzdHJhY3RfTGF6eV9Mb2FkZXInIClcbl9fV0lORE9XID0gcmVxdWlyZSggJy4uL2NvcmUvV2luZG93JyApXG5cbmNsYXNzIExhenlfTWFzb25yeSBleHRlbmRzIEFic3RyYWN0X0xhenlfTG9hZGVyXG5cblx0cmVzaXplX2FsbDogLT5cblx0XHRAcGxhY2Vob2xkZXJfd2lkdGggPSAkKCAnLlBQX01hc29ucnlfX3NpemVyJyApLndpZHRoKClcblx0XHRzdXBlcigpXG5cblx0cmVzaXplOiAoIGl0ZW0gKSAtPlxuXHRcdGl0ZW0uJGVsLmNzcyAnbWluLWhlaWdodCc6IE1hdGguZmxvb3IoIEBwbGFjZWhvbGRlcl93aWR0aCAvIGl0ZW0uZGF0YS5nZXQoJ3JhdGlvJykgKVxuXG5cdGNsZWFudXBfYWZ0ZXJfbG9hZDogKGl0ZW0pIC0+XG5cdFx0IyBSZW1vdmUgbWluLWhlaWdodFxuXHRcdGl0ZW0uJGVsLmNzcyggJ21pbi1oZWlnaHQnLCAnJyApXG5cblx0XHQjIFJ1biBhbGwgb3RoZXIgY2xlYW51cHNcblx0XHRzdXBlciggaXRlbSApXG5cblx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnXG5cblx0XHRyZXR1cm5cblxuXHRhdHRhY2hfZXZlbnRzOiAtPlxuXHRcdCMgQ2FsbCBQYXJlbnQgZmlyc3QsIGl0J3MgZ29pbmcgdG8gY3JlYXRlIEB0aHJvdHRsZWRfYXV0b2xvYWRcblx0XHRzdXBlcigpXG5cblx0XHQjIEF0dGFjaFxuXHRcdCQoIHdpbmRvdyApLm9uICdzY3JvbGwnLCBAdGhyb3R0bGVkX2F1dG9sb2FkXG5cblxuXG5cdGRldGFjaF9ldmVudHM6IC0+XG5cdFx0IyBEZXRhY2hcblx0XHQkKCB3aW5kb3cgKS5vZmYgJ3Njcm9sbCcsIEB0aHJvdHRsZWRfYXV0b2xvYWRcblxuXHRcdCMgQ2FsbCBwYXJlbnQgbGFzdCwgaXQncyBnb2luZyB0byBjbGVhbiB1cCBAdGhyb3R0bGVkX2F1dG9sb2FkXG5cdFx0c3VwZXIoKVxuXG5cdGRlc3Ryb3k6IC0+XG5cdFx0Zm9yIGl0ZW0sIGtleSBpbiBASXRlbXNcblx0XHRcdGl0ZW0uJGVsLmNzcyAnbWluLWhlaWdodCcsICcnXG5cdFx0c3VwZXIoKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gTGF6eV9NYXNvbnJ5XG4iLCIkID0gcmVxdWlyZSggXCJqUXVlcnlcIiApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5MYXp5X0RlZmF1bHQgPSByZXF1aXJlKCBcIi4vTGF6eV9EZWZhdWx0XCIgKVxuXG5pbnN0YW5jZSA9IGZhbHNlXG5cbmRlc3Ryb3kgPSAtPlxuXHRyZXR1cm4gaWYgbm90IGluc3RhbmNlXG5cdGluc3RhbmNlLmRlc3Ryb3koIClcblx0aW5zdGFuY2UgPSBudWxsXG5cbmNyZWF0ZSA9IC0+XG5cblx0IyBNYWtlIHN1cmUgYW4gaW5zdGFuY2UgZG9lc24ndCBhbHJlYWR5IGV4aXN0XG5cdGRlc3Ryb3koIClcblxuXHQjIEhhbmRsZXIgcmVxdWlyZWRcblx0SGFuZGxlciA9IEhvb2tzLmFwcGx5RmlsdGVycyBcInBob3J0LmxhenkuaGFuZGxlclwiLCBMYXp5X0RlZmF1bHRcblxuXHRyZXR1cm4gaWYgbm90ICgkKCBcIi5QUF9MYXp5X0ltYWdlX19wbGFjZWhvbGRlclwiICkubGVuZ3RoID4gMClcblx0cmV0dXJuIGlmIG5vdCBIYW5kbGVyXG5cblx0IyBCeSBkZWZhdWx0IExhenlfTWFzb25yeSBpcyBoYW5kbGluZyBMYXp5LUxvYWRpbmdcblx0IyBDaGVjayBpZiBhbnlvbmUgd2FudHMgdG8gaGlqYWNrIGhhbmRsZXJcblx0aW5zdGFuY2UgPSBuZXcgSGFuZGxlciggKVxuXHRIb29rcy5hZGRBY3Rpb24gXCJwaG9ydC5jb3JlLmxvYWRlZFwiLCBpbnN0YW5jZS5hdXRvbG9hZFxuXG5cdHJldHVyblxuXG5cbiMgSW5pdGlhbGl6ZSBsYXp5IGxvYWRlciBhZnRlciB0aGUgcG9ydGZvbGlvIGlzIHByZXBhcmVkLCBwID0gMTAwXG5Ib29rcy5hZGRBY3Rpb24gXCJwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZVwiLCBjcmVhdGUsIDEwMFxuSG9va3MuYWRkQWN0aW9uIFwicGhvcnQucG9ydGZvbGlvLmRlc3Ryb3lcIiwgZGVzdHJveVxuXG5cbm1vZHVsZS5leHBvcnRzID1cblx0Y3JlYXRlIDogY3JlYXRlXG5cdGRlc3Ryb3k6IGRlc3Ryb3kiLCJIb29rcyA9IHJlcXVpcmUoICd3cF9ob29rcycgKVxuXG4jIyNcblxuICAgICMgSW5pdGlhbGl6ZSBQb3J0Zm9saW8gQ29yZVxuXHQtLS1cblx0XHRVc2luZyBwNTAgQCBgcGhvcnQuY29yZS5yZWFkeWBcblx0XHRMYXRlIHByaW9yaXR5IGlzIGdvaW5nIHRvIGZvcmNlIGV4cGxpY2l0IHByaW9yaXR5IGluIGFueSBvdGhlciBtb3ZpbmcgcGFydHMgdGhhdCBhcmUgZ29pbmcgdG8gdG91Y2ggcG9ydGZvbGlvIGxheW91dCBhdCBgcGhvcnQubG9hZGVkYFxuXHQtLS1cblxuIyMjXG5tb2R1bGUuZXhwb3J0cyA9XG5cblx0cHJlcGFyZTogLT5cblx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnXG5cdFx0cmV0dXJuXG5cblx0Y3JlYXRlOiAtPlxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uY3JlYXRlJ1xuXHRcdHJldHVyblxuXG5cblx0cmVmcmVzaDogLT5cblx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnXG5cdFx0cmV0dXJuXG5cblxuXHRkZXN0cm95OiAtPlxuXHRcdCMgRGVzdHJveVxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveSdcblx0XHRyZXR1cm5cbiIsIkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcblxuXG4jIyNcblx0QWJzdHJhY3QgQ2xhc3MgUG9ydG9mbGlvX0V2ZW50X0ltZXBsZW1lbnRhdGlvblxuXG4gICAgSGFuZGxlcyBhbGwgdGhlIGV2ZW50cyByZXF1aXJlZCB0byBmdWxseSBoYW5kbGUgYSBwb3J0Zm9saW8gbGF5b3V0IHByb2Nlc3NcbiMjI1xuY2xhc3MgUG9ydGZvbGlvX0ludGVyZmFjZVxuXG5cdGNvbnN0cnVjdG9yOiAoIGFyZ3MgKSAtPlxuXHRcdEBzZXR1cF9hY3Rpb25zKClcblx0XHRAaW5pdGlhbGl6ZSggYXJncyApXG5cblx0c2V0dXBfYWN0aW9uczogLT5cblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5wcmVwYXJlJywgQHByZXBhcmUsIDUwXG5cdFx0SG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uY3JlYXRlJywgQGNyZWF0ZSwgNTBcblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5yZWZyZXNoJywgQHJlZnJlc2gsIDUwXG5cdFx0SG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScsIEBkZXN0cm95LCA1MFxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLmRlc3Ryb3knLCBAcHVyZ2VfYWN0aW9ucywgMTAwXG5cblx0cHVyZ2VfYWN0aW9uczogPT5cblx0XHRIb29rcy5yZW1vdmVBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5wcmVwYXJlJywgQHByZXBhcmUsIDUwXG5cdFx0SG9va3MucmVtb3ZlQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uY3JlYXRlJywgQGNyZWF0ZSwgNTBcblx0XHRIb29rcy5yZW1vdmVBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5yZWZyZXNoJywgQHJlZnJlc2gsIDUwXG5cdFx0SG9va3MucmVtb3ZlQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScsIEBkZXN0cm95LCA1MFxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLmRlc3Ryb3knLCBAcHVyZ2VfYWN0aW9ucywgMTAwXG5cblxuXHQjIyNcbiAgICBcdFJlcXVpcmUgdGhlc2UgbWV0aG9kc1xuXHQjIyNcblx0aW5pdGlhbGl6ZTogLT4gdGhyb3cgbmV3IEVycm9yKCBcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgaW5pdGlhbGl6ZWAgbWV0aG9kXCIgKVxuXHRwcmVwYXJlICAgOiAtPiB0aHJvdyBuZXcgRXJyb3IoIFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGBwcmVwYXJlYCBtZXRob2RcIiApXG5cdGNyZWF0ZSAgICA6IC0+IHRocm93IG5ldyBFcnJvciggXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYGNyZWF0ZWAgbWV0aG9kXCIgKVxuXHRyZWZyZXNoICAgOiAtPiB0aHJvdyBuZXcgRXJyb3IoIFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGByZWZyZXNoYCBtZXRob2RcIiApXG5cdGRlc3Ryb3kgICA6IC0+IHRocm93IG5ldyBFcnJvciggXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYGRlc3Ryb3lgIG1ldGhvZFwiIClcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gUG9ydGZvbGlvX0ludGVyZmFjZSIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggXCJqUXVlcnlcIiApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5Qb3J0Zm9saW9fSW50ZXJmYWNlID0gcmVxdWlyZSggXCIuL1BvcnRmb2xpb19JbnRlcmZhY2VcIiApXG5cbiMgRGVmZXJpbmcgdGhlIHJlZnJlc2ggZWZlbnQgcHJldmVudHMgbWFzb25yeSBmcm9tIHRyaWdnZXJpbmcgYW4gZXJyb3JcbiMgVGhpcyBpcyBhbiB1Z2x5IHF1aWNrIGZpeC5cbiMgQFRPRE86IFJld3JpdGUgdGhlIHdob2xlIGZpbGUuXG5cbmRlZmVyID0gKCBjYiApIC0+IHNldFRpbWVvdXQoIGNiLCAxIClcblxuIyBAVE9ETzogTmVlZCBhIGhlYXZ2eSByZWZhY3RvciAtIG5vIG1vcmUgY2xhc3NlcyBwbGVhc2VcbmNsYXNzIFBvcnRmb2xpb19NYXNvbnJ5IGV4dGVuZHMgUG9ydGZvbGlvX0ludGVyZmFjZVxuXHRvbmNlID0gZmFsc2Vcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QEVsZW1lbnRzID1cblx0XHRcdGNvbnRhaW5lcjogXCJQUF9NYXNvbnJ5XCJcblx0XHRcdHNpemVyICAgIDogXCJQUF9NYXNvbnJ5X19zaXplclwiXG5cdFx0XHRpdGVtICAgICA6IFwiUFBfTWFzb25yeV9faXRlbVwiXG5cblx0XHRzdXBlciggKVxuXG5cdCMjI1xuXHRcdEluaXRpYWxpemVcblx0IyMjXG5cdGluaXRpYWxpemU6IC0+XG5cdFx0QCRjb250YWluZXIgPSAkKCBcIi4je0BFbGVtZW50cy5jb250YWluZXJ9XCIgKVxuXG5cdCMjI1xuXHRcdFByZXBhcmUgJiBBdHRhY2ggRXZlbnRzXG4gICAgXHREb24ndCBzaG93IGFueXRoaW5nIHlldC5cblxuXHRcdEBjYWxsZWQgb24gaG9vayBgcGhvcnQucG9ydGZvbGlvLnByZXBhcmVgXG5cdCMjI1xuXHRwcmVwYXJlOiA9PlxuXHRcdHJldHVybiBpZiBAJGNvbnRhaW5lci5sZW5ndGggaXMgMFxuXG5cdFx0QCRjb250YWluZXIuYWRkQ2xhc3MoIFwiUFBfSlNfX2xvYWRpbmdfbWFzb25yeVwiIClcblxuXHRcdEBtYXliZV9jcmVhdGVfc2l6ZXIoIClcblxuXHRcdCMgT25seSBpbml0aWFsaXplLCBpZiBubyBtYXNvbnJ5IGV4aXN0c1xuXHRcdG1hc29ucnlfc2V0dGluZ3MgPSBIb29rcy5hcHBseUZpbHRlcnMgXCJwaG9ydC5tYXNvbnJ5LnNldHRpbmdzXCIsXG5cdFx0XHRpdGVtU2VsZWN0b3I6IFwiLiN7QEVsZW1lbnRzLml0ZW19XCJcblx0XHRcdGNvbHVtbldpZHRoIDogXCIuI3tARWxlbWVudHMuc2l6ZXJ9XCJcblx0XHRcdGd1dHRlciAgICAgIDogMFxuXHRcdFx0aW5pdExheW91dCAgOiBmYWxzZVxuXG5cdFx0QCRjb250YWluZXIubWFzb25yeSggbWFzb25yeV9zZXR0aW5ncyApXG5cblx0XHRAJGNvbnRhaW5lci5tYXNvbnJ5IFwib25jZVwiLCBcImxheW91dENvbXBsZXRlXCIsID0+XG5cdFx0XHRAJGNvbnRhaW5lclxuXHRcdFx0XHQucmVtb3ZlQ2xhc3MoIFwiUFBfSlNfX2xvYWRpbmdfbWFzb25yeVwiIClcblx0XHRcdFx0LmFkZENsYXNzKCBcIlBQX0pTX19sb2FkaW5nX2NvbXBsZXRlXCIgKVxuXG5cdFx0XHQjIEB0cmlnZ2VyIHJlZnJlc2ggZXZlbnRcblx0XHRcdCMgdHJpZ2dlcnMgYEByZWZyZXNoKClgXG5cdFx0XHRkZWZlciggLT4gSG9va3MuZG9BY3Rpb24oIFwicGhvcnQucG9ydGZvbGlvLnJlZnJlc2hcIiApIClcblxuXG5cblxuXG5cdCMjI1xuXHRcdFN0YXJ0IHRoZSBQb3J0Zm9saW9cblx0XHRAY2FsbGVkIG9uIGhvb2sgYHBob3J0LnBvcnRmb2xpby5jcmVhdGVgXG5cdCMjI1xuXHRjcmVhdGU6ID0+XG5cdFx0QCRjb250YWluZXIubWFzb25yeSggKVxuXHRcdHJldHVyblxuXG5cblx0IyMjXG5cdFx0RGVzdHJveVxuXHRcdEBjYWxsZWQgb24gaG9vayBgcGhvcnQucG9ydGZvbGlvLmRlc3Ryb3lgXG5cdCMjI1xuXHRkZXN0cm95OiA9PlxuXHRcdEBtYXliZV9yZW1vdmVfc2l6ZXIoIClcblxuXHRcdGlmIEAkY29udGFpbmVyLmxlbmd0aCA+IDBcblx0XHRcdEAkY29udGFpbmVyLm1hc29ucnkoIFwiZGVzdHJveVwiIClcblxuXG5cdFx0cmV0dXJuXG5cblxuXHQjIyNcblx0XHRSZWxvYWQgdGhlIGxheW91dFxuXHRcdEBjYWxsZWQgb24gaG9vayBgcGhvcnQucG9ydGZvbGlvLnJlZnJlc2hgXG5cdCMjI1xuXHRyZWZyZXNoOiA9PlxuXHRcdEAkY29udGFpbmVyLm1hc29ucnkoIFwibGF5b3V0XCIgKVxuXG5cblxuXHQjIyNcblx0XHRDcmVhdGUgYSBzaXplciBlbGVtZW50IGZvciBqcXVlcnktbWFzb25yeSB0byB1c2Vcblx0IyMjXG5cdG1heWJlX2NyZWF0ZV9zaXplcjogLT5cblx0XHRAY3JlYXRlX3NpemVyKCApIGlmIEBzaXplcl9kb2VzbnRfZXhpc3QoIClcblx0XHRyZXR1cm5cblxuXHRtYXliZV9yZW1vdmVfc2l6ZXI6IC0+XG5cdFx0cmV0dXJuIGlmIEAkY29udGFpbmVyLmxlbmd0aCBpc250IDFcblx0XHRAJGNvbnRhaW5lci5maW5kKCBcIi4je0BFbGVtZW50cy5zaXplcn1cIiApLnJlbW92ZSggKVxuXHRcdHJldHVyblxuXG5cdHNpemVyX2RvZXNudF9leGlzdDogLT4gQCRjb250YWluZXIuZmluZCggXCIuI3tARWxlbWVudHMuc2l6ZXJ9XCIgKS5sZW5ndGggaXMgMFxuXG5cblx0Y3JlYXRlX3NpemVyOiAtPlxuXHRcdEAkY29udGFpbmVyLmFwcGVuZCBcIlwiXCI8ZGl2IGNsYXNzPVwiI3tARWxlbWVudHMuc2l6ZXJ9XCI+PC9kaXY+XCJcIlwiXG5cblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW9fTWFzb25yeSIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuXG4jIFBvcnRmb2xpbyBtYW5hZ2VyIHdpbGwgdHJpZ2dlciBwb3J0Zm9saW8gZXZlbnRzIHdoZW4gbmVjZXNzYXJ5XG5UcmlnZ2VyID0gcmVxdWlyZSggJy4vUG9ydGZvbGlvX0V2ZW50cycgKVxuXG5pc19tYXNvbnJ5ID0gLT5cblx0cmV0dXJuICggJCggJy5QUF9NYXNvbnJ5JyApLmxlbmd0aCBpc250IDAgKVxuXG4jIFN0YXJ0IE1hc29ucnkgTGF5b3V0XG5zdGFydF9tYXNvbnJ5ID0gLT5cblx0cmV0dXJuIGZhbHNlIGlmIG5vdCBpc19tYXNvbnJ5KClcblxuXHRQb3J0Zm9saW9fTWFzb25yeSA9IHJlcXVpcmUoICcuL1BvcnRmb2xpb19NYXNvbnJ5JyApXG5cdG5ldyBQb3J0Zm9saW9fTWFzb25yeSgpXG5cbm1heWJlX2xhenlfbWFzb25yeSA9ICggaGFuZGxlciApIC0+XG5cdCMgVXNlIExhenlfTWFzb25yeSBoYW5kbGVyLCBpZiBjdXJyZW50IGxheW91dCBpcyBtYXNvbnJ5XG5cdHJldHVybiByZXF1aXJlKCAnbGF6eS9MYXp5X01hc29ucnknICkgaWYgaXNfbWFzb25yeSgpXG5cdHJldHVybiBoYW5kbGVyXG5cblxuIyBTdGFydCBQb3J0Zm9saW9cbkhvb2tzLmFkZEFjdGlvbiAncGhvcnQuY29yZS5yZWFkeScsIFRyaWdnZXIucHJlcGFyZSwgNTBcbkhvb2tzLmFkZEFjdGlvbiAncGhvcnQuY29yZS5sb2FkZWQnLCBUcmlnZ2VyLmNyZWF0ZSwgNTBcblxuIyBJbml0aWFsaXplIE1hc29ucnkgTGF5b3V0XG5Ib29rcy5hZGRBY3Rpb24gJ3Bob3J0LmNvcmUucmVhZHknLCBzdGFydF9tYXNvbnJ5XG5cbiMgSW5pdGlhbGl6ZSBMYXp5IExvYWRpbmcgZm9yIE1hc29ucnkgTGF5b3V0XG5Ib29rcy5hZGRGaWx0ZXIgJ3Bob3J0LmxhenkuaGFuZGxlcicsIG1heWJlX2xhenlfbWFzb25yeVxuXG5cblxuIl19
