(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){

/*
    Load Dependencies
 */
var $, Hooks;

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

window.PP_Modules = {
  Portfolio_Interface: require("./portfolio/Portfolio_Interface"),
  gallery: {
    item_data: require("./gallery/gallery_item_data"),
    item_factory: require("./gallery/gallery_item_factory")
  },
  Abstract_Lazy_Loader: require("./lazy/Abstract_Lazy_Loader")
};

window.Photography_Portfolio = {
  Core: require("./core/start"),
  Portfolio_Layout: require("./portfolio/start"),
  Gallery: require("./gallery/start"),
  Lazy_Loader: require("./lazy/start")
};


/*
	Boot on `document.ready`
 */

$(document).ready(function() {
  if ($(".PP_Wrapper").length === 0) {
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


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jb3JlL1V0aWxpdGllcy5qcyIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jb3JlL1dpbmRvdy5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY29yZS9zdGFydC5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvZ2FsbGVyeS9hZGFwdGVycy9saWdodGdhbGxlcnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvYWRhcHRlcnMvcGhvdG9zd2lwZS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvZ2FsbGVyeS9nYWxsZXJ5X2ZhY3RvcnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvZ2FsbGVyeV9pdGVtX2RhdGEuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvZ2FsbGVyeV9pdGVtX2ZhY3RvcnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvcHJlcGFyZV9nYWxsZXJ5X2ZhY3RvcnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvc3RhcnQuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvQWJzdHJhY3RfTGF6eV9Mb2FkZXIuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvTGF6eV9EZWZhdWx0LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0xhenlfTWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvbGF6eS9zdGFydC5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL1BvcnRmb2xpb19FdmVudHMuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL3BvcnRmb2xpby9Qb3J0Zm9saW9fSW50ZXJmYWNlLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9wb3J0Zm9saW8vUG9ydGZvbGlvX01hc29ucnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL3BvcnRmb2xpby9zdGFydC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOzs7QUFBQSxJQUFBOztBQUdBLEtBQUEsR0FBUSxPQUFBLENBQVMsVUFBVDs7QUFDUixDQUFBLEdBQUksT0FBQSxDQUFTLFFBQVQ7O0FBR0osTUFBTSxDQUFDLFVBQVAsR0FFQztFQUFBLG1CQUFBLEVBQXFCLE9BQUEsQ0FBUyxpQ0FBVCxDQUFyQjtFQUdBLE9BQUEsRUFDQztJQUFBLFNBQUEsRUFBYyxPQUFBLENBQVMsNkJBQVQsQ0FBZDtJQUNBLFlBQUEsRUFBYyxPQUFBLENBQVMsZ0NBQVQsQ0FEZDtHQUpEO0VBUUEsb0JBQUEsRUFBc0IsT0FBQSxDQUFTLDZCQUFULENBUnRCOzs7QUFXRCxNQUFNLENBQUMscUJBQVAsR0FDQztFQUFBLElBQUEsRUFBa0IsT0FBQSxDQUFTLGNBQVQsQ0FBbEI7RUFDQSxnQkFBQSxFQUFrQixPQUFBLENBQVMsbUJBQVQsQ0FEbEI7RUFFQSxPQUFBLEVBQWtCLE9BQUEsQ0FBUyxpQkFBVCxDQUZsQjtFQUdBLFdBQUEsRUFBa0IsT0FBQSxDQUFTLGNBQVQsQ0FIbEI7Ozs7QUFLRDs7OztBQUdBLENBQUEsQ0FBRyxRQUFILENBQWEsQ0FBQyxLQUFkLENBQW9CLFNBQUE7RUFHbkIsSUFBVSxDQUFBLENBQUcsYUFBSCxDQUFrQixDQUFDLE1BQW5CLEtBQTZCLENBQXZDO0FBQUEsV0FBQTs7RUFHQSxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsS0FBM0IsQ0FBQTtBQU5tQixDQUFwQjs7Ozs7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QUMsTUFBbkIsS0FBK0I7QUFENUI7O0FBSWIsYUFBQSxHQUFnQixTQUFBO0FBQ2YsTUFBQTtFQUFBLElBQWdCLENBQUksVUFBQSxDQUFBLENBQXBCO0FBQUEsV0FBTyxNQUFQOztFQUVBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUyxxQkFBVDtTQUNwQixJQUFJLGlCQUFKLENBQUE7QUFKZTs7QUFNaEIsa0JBQUEsR0FBcUIsU0FBRSxPQUFGO0VBRXBCLElBQXlDLFVBQUEsQ0FBQSxDQUF6QztBQUFBLFdBQU8sT0FBQSxDQUFTLG1CQUFULEVBQVA7O0FBQ0EsU0FBTztBQUhhOztBQU9yQixLQUFLLENBQUMsU0FBTixDQUFnQixrQkFBaEIsRUFBb0MsT0FBTyxDQUFDLE9BQTVDLEVBQXFELEVBQXJEOztBQUNBLEtBQUssQ0FBQyxTQUFOLENBQWdCLG1CQUFoQixFQUFxQyxPQUFPLENBQUMsTUFBN0MsRUFBcUQsRUFBckQ7O0FBR0EsS0FBSyxDQUFDLFNBQU4sQ0FBZ0Isa0JBQWhCLEVBQW9DLGFBQXBDOztBQUdBLEtBQUssQ0FBQyxTQUFOLENBQWdCLG9CQUFoQixFQUFzQyxrQkFBdEMiLCJmaWxlIjoicGhvdG9ncmFwaHktcG9ydGZvbGlvLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIjIyNcbiAgICBMb2FkIERlcGVuZGVuY2llc1xuIyMjXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG4kID0gcmVxdWlyZSggXCJqUXVlcnlcIiApXG5cbiMgRXhwb3NlIHNvbWUgUGhvdG9ncmFwaHkgUG9ydGZvbGlvIG1vZHVsZXMgdG8gdGhlIHB1YmxpYyBmb3IgZXh0ZW5zaWJpbGl0eVxud2luZG93LlBQX01vZHVsZXMgPVxuXHQjIEV4dGVuZCBQb3J0Zm9saW8gSW50ZXJmYWNlIHRvIGJ1aWxkIGN1c3RvbSBwb3J0Zm9saW8gbGF5b3V0cyBiYXNlZCBvbiBQUCBFdmVudHNcblx0UG9ydGZvbGlvX0ludGVyZmFjZTogcmVxdWlyZSggXCIuL3BvcnRmb2xpby9Qb3J0Zm9saW9fSW50ZXJmYWNlXCIgKVxuXG4jIFVzZSBgZ2FsbGVyeV9pdGVtX2RhdGFgIHRvIGdldCBmb3JtYXR0ZWQgaXRlbSBpbWFnZSBzaXplcyBmb3IgbGF6eSBsb2FkaW5nXG5cdGdhbGxlcnk6XG5cdFx0aXRlbV9kYXRhICAgOiByZXF1aXJlKCBcIi4vZ2FsbGVyeS9nYWxsZXJ5X2l0ZW1fZGF0YVwiIClcblx0XHRpdGVtX2ZhY3Rvcnk6IHJlcXVpcmUoIFwiLi9nYWxsZXJ5L2dhbGxlcnlfaXRlbV9mYWN0b3J5XCIgKVxuXG4jIEV4dGVuZCBBYnN0cmFjdF9MYXp5X0xvZGVyIHRvIGltcGxlbWVudCBsYXp5IGxvYWRlciBmb3IgeW91ciBsYXlvdXRcblx0QWJzdHJhY3RfTGF6eV9Mb2FkZXI6IHJlcXVpcmUoIFwiLi9sYXp5L0Fic3RyYWN0X0xhenlfTG9hZGVyXCIgKVxuXG5cbndpbmRvdy5QaG90b2dyYXBoeV9Qb3J0Zm9saW8gPVxuXHRDb3JlICAgICAgICAgICAgOiByZXF1aXJlKCBcIi4vY29yZS9zdGFydFwiIClcblx0UG9ydGZvbGlvX0xheW91dDogcmVxdWlyZSggXCIuL3BvcnRmb2xpby9zdGFydFwiIClcblx0R2FsbGVyeSAgICAgICAgIDogcmVxdWlyZSggXCIuL2dhbGxlcnkvc3RhcnRcIiApXG5cdExhenlfTG9hZGVyICAgICA6IHJlcXVpcmUoIFwiLi9sYXp5L3N0YXJ0XCIgKVxuXG4jIyNcblx0Qm9vdCBvbiBgZG9jdW1lbnQucmVhZHlgXG4jIyNcbiQoIGRvY3VtZW50ICkucmVhZHkgLT5cblxuXHQjIE9ubHkgcnVuIHRoaXMgc2NyaXB0IHdoZW4gYm9keSBoYXMgYFBQX1BvcnRmb2xpb2AgY2xhc3Ncblx0cmV0dXJuIGlmICQoIFwiLlBQX1dyYXBwZXJcIiApLmxlbmd0aCBpcyAwXG5cblx0IyBCb290XG5cdFBob3RvZ3JhcGh5X1BvcnRmb2xpby5Db3JlLnJlYWR5KCApXG5cdHJldHVyblxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cblxuICAgIC8qKlxuICAgICAqIFRoYW5rIHlvdSBSdXNzIGZvciBoZWxwaW5nIG1lIGF2b2lkIHdyaXRpbmcgdGhpcyBteXNlbGY6XG4gICAgICogQHVybCBodHRwczovL3JlbXlzaGFycC5jb20vMjAxMC8wNy8yMS90aHJvdHRsaW5nLWZ1bmN0aW9uLWNhbGxzLyNjb21tZW50LTI3NDU2NjM1OTRcbiAgICAgKi9cbiAgICB0aHJvdHRsZTogZnVuY3Rpb24gKCBmbiwgdGhyZXNoaG9sZCwgc2NvcGUgKSB7XG4gICAgICAgIHRocmVzaGhvbGQgfHwgKHRocmVzaGhvbGQgPSAyNTApXG4gICAgICAgIHZhciBsYXN0LFxuICAgICAgICAgICAgZGVmZXJUaW1lclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGNvbnRleHQgPSBzY29wZSB8fCB0aGlzXG5cbiAgICAgICAgICAgIHZhciBub3cgID0gK25ldyBEYXRlLFxuICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmd1bWVudHNcbiAgICAgICAgICAgIGlmICggbGFzdCAmJiBub3cgPCBsYXN0ICsgdGhyZXNoaG9sZCApIHtcbiAgICAgICAgICAgICAgICAvLyBob2xkIG9uIHRvIGl0XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KCBkZWZlclRpbWVyIClcbiAgICAgICAgICAgICAgICBkZWZlclRpbWVyID0gc2V0VGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBsYXN0ID0gbm93XG4gICAgICAgICAgICAgICAgICAgIGZuLmFwcGx5KCBjb250ZXh0LCBhcmdzIClcbiAgICAgICAgICAgICAgICB9LCB0aHJlc2hob2xkICsgbGFzdCAtIG5vdyApXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxhc3QgPSBub3dcbiAgICAgICAgICAgICAgICBmbi5hcHBseSggY29udGV4dCwgYXJncyApXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cblxufSIsIkhvb2tzID0gcmVxdWlyZSggJ3dwX2hvb2tzJyApXG5cblxuZ2V0X3NpemUgPSAtPlxuXHR3aWR0aCA6IHdpbmRvdy5pbm5lcldpZHRoIHx8ICR3aW5kb3cud2lkdGgoKVxuXHRoZWlnaHQ6IHdpbmRvdy5pbm5lckhlaWdodCB8fCAkd2luZG93LmhlaWdodCgpXG5cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRfc2l6ZSgpIiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoICd3cF9ob29rcycgKVxuXG5yZWFkeSA9IC0+XG5cdGlmIEhvb2tzLmFwcGx5RmlsdGVycyggJ3Bob3J0LmNvcmUucmVhZHknLCB0cnVlIClcblx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQuY29yZS5yZWFkeSdcblxuXHQjIEF1dG9tYXRpY2FsbHkgdHJpZ2dlciBgcGhvcnQuY29yZS5sb2FkZWRgIHdoZW4gaW1hZ2VzIGFyZSBsb2FkZWRcblx0JCggJy5QUF9XcmFwcGVyJyApLmltYWdlc0xvYWRlZCggbG9hZGVkIClcblx0cmV0dXJuXG5cbmxvYWRlZCA9IC0+XG5cdGlmIEhvb2tzLmFwcGx5RmlsdGVycyggJ3Bob3J0LmNvcmUubG9hZGVkJywgdHJ1ZSApXG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LmNvcmUubG9hZGVkJ1xuXHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPVxuXHRsb2FkZWQ6IGxvYWRlZFxuXHRyZWFkeSA6IHJlYWR5IiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCBcImpRdWVyeVwiIClcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcblxuZGVmYXVsdHMgPVxuXHRkeW5hbWljIDogdHJ1ZVxuXHRzcGVlZCAgIDogMzUwXG5cdHByZWxvYWQgOiAzXG5cdGRvd25sb2FkOiBmYWxzZVxuXHRlc2NLZXkgIDogZmFsc2UgIyBXZSdyZSByb2xsaW5nIG91ciBvd25cblxuXHR0aHVtYm5haWwgICAgICAgICA6IHRydWVcblx0c2hvd1RodW1iQnlEZWZhdWx0OiB0cnVlXG5cbiMgQFRPRE86IFVzZSBPYmplY3QuYXNzaWduKCkgd2l0aCBCYWJlbFxuc2V0dGluZ3MgPSAkLmV4dGVuZCgge30sIGRlZmF1bHRzLCB3aW5kb3cuX19waG9ydC5saWdodEdhbGxlcnkgKVxuXG5cbnNpbmdsZV9pdGVtX2RhdGEgPSAoIGl0ZW0gKSAtPlxuXG5cdGlmIGl0ZW0uZGF0YS5nZXQoICd0eXBlJyApIGlzICd2aWRlbydcblx0XHRmdWxsID0gaXRlbS5kYXRhLmdldCggJ3ZpZGVvX3VybCcgKVxuXHRlbHNlXG5cdFx0ZnVsbCA9IGl0ZW0uZGF0YS51cmwoICdmdWxsJyApXG5cblx0cmV0dXJuIHtcblx0XHRzcmMgICAgOiBmdWxsXG5cdFx0dGh1bWIgIDogaXRlbS5kYXRhLnVybCggJ3RodW1iJyApXG5cdFx0c3ViSHRtbDogaXRlbS5jYXB0aW9uXG5cdH1cblxuXG5nZXRfc2V0dGluZ3MgPSAoIGdhbGxlcnksIGluZGV4ICkgLT5cblx0c2V0dGluZ3MuaW5kZXggICAgICAgICA9IGluZGV4XG5cdHNldHRpbmdzLmR5bmFtaWNFbCAgICAgPSBnYWxsZXJ5Lm1hcCggc2luZ2xlX2l0ZW1fZGF0YSApXG5cdHNldHRpbmdzLnZpZGVvTWF4V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCAqIDAuOFxuXG5cdEhvb2tzLmFwcGx5RmlsdGVycyAncGhvcnQubGlnaHRHYWxsZXJ5LnNldHRpbmdzJywgc2V0dGluZ3NcblxuXG5tb2R1bGUuZXhwb3J0cyA9ICggJGVsICkgLT5cblx0aW5zdGFuY2U6IC0+IEdhbGxlcnlcblx0Y2xvc2U6IC0+XG5cdFx0R2FsbGVyeSA9ICRlbC5kYXRhKCAnbGlnaHRHYWxsZXJ5JyApXG5cdFx0R2FsbGVyeS5kZXN0cm95KCApIGlmIEdhbGxlcnkgYW5kIEdhbGxlcnkuZGVzdHJveT9cblxuXHRvcGVuOiAoIGdhbGxlcnlfaXRlbXMsIGluZGV4ICkgLT5cblx0XHRHYWxsZXJ5ID0gJGVsLmxpZ2h0R2FsbGVyeSggZ2V0X3NldHRpbmdzKCBnYWxsZXJ5X2l0ZW1zLCBpbmRleCApIClcblxuXG5cblxuIiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCBcImpRdWVyeVwiIClcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcblxubGFiZWxzID0gJC5leHRlbmQoIHt9LCB7XG5cdCdmYWNlYm9vayc6ICdTaGFyZSBvbiBGYWNlYm9vaycsXG5cdCd0d2l0dGVyJzogJ1R3ZWV0Jyxcblx0J3BpbnRlcmVzdCc6ICdQaW4gaXQnLFxufSwgd2luZG93Ll9fcGhvcnQuaTE4bi5waG90b3N3aXBlIClcblxuXG5kZWZhdWx0cyA9XG5cdGluZGV4ICAgICAgIDogMFxuXHRwcmVsb2FkICAgICA6IFsgMSwgMyBdXG5cdGVzY0tleSAgICAgIDogZmFsc2Vcblx0c2hhcmVCdXR0b25zOiBbXG5cdFx0eyBpZDogJ2ZhY2Vib29rJywgbGFiZWw6IGxhYmVscy5mYWNlYm9vaywgdXJsOiAnaHR0cHM6Ly93d3cuZmFjZWJvb2suY29tL3NoYXJlci9zaGFyZXIucGhwP3U9e3t1cmx9fScgfVxuXHRcdHsgaWQ6ICd0d2l0dGVyJywgbGFiZWwgOiBsYWJlbHMudHdpdHRlciwgdXJsOiAnaHR0cHM6Ly90d2l0dGVyLmNvbS9pbnRlbnQvdHdlZXQ/dGV4dD17e3RleHR9fSZ1cmw9e3t1cmx9fScgfVxuXHRcdHsgaWQ6ICdwaW50ZXJlc3QnLCBsYWJlbDogbGFiZWxzLnBpbnRlcmVzdCwgdXJsOiAnaHR0cDovL3d3dy5waW50ZXJlc3QuY29tL3Bpbi9jcmVhdGUvYnV0dG9uLz91cmw9e3t1cmx9fSZtZWRpYT17e2ltYWdlX3VybH19JmRlc2NyaXB0aW9uPXt7dGV4dH19JyB9XG5cdF1cblxuXG5wc3dwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvciggJy5wc3dwJyApXG5VSSA9IEhvb2tzLmFwcGx5RmlsdGVycyggXCJwaG9ydC5waG90b3N3aXBlLlVJXCIsIHdpbmRvdy5QaG90b1N3aXBlVUlfRGVmYXVsdCApXG5QaG90b1N3aXBlID0gd2luZG93LlBob3RvU3dpcGVcblxuXG5jcmVhdGUgPSAoIGRhdGEsIG9wdHMgPSB7fSApIC0+XG5cblx0b3B0aW9ucyA9ICQuZXh0ZW5kKCB7fSwgZGVmYXVsdHMsIG9wdHMgKVxuXHRvcHRpb25zID0gSG9va3MuYXBwbHlGaWx0ZXJzKCBcInBob3J0LnBob3Rvc3dpcGUub3B0aW9uc1wiLCBvcHRpb25zLCBkYXRhLCBvcHRzIClcblxuXHQjIEluZGV4IGlzIDAgYnkgZGVmYXVsdFxuXHRpZiBub3Qgb3B0aW9ucy5pbmRleD9cblx0XHRvcHRpb25zLmluZGV4ID0gMFxuXG5cdCMgU2V0IHRoZSBpbmRleCB0byAwIGlmIGl0IGlzbid0IGEgcHJvcGVyIHZhbHVlXG5cdGlmIG5vdCBvcHRpb25zLmluZGV4IG9yIG9wdGlvbnMuaW5kZXggPCAwXG5cdFx0b3B0aW9ucy5pbmRleCA9IDBcblxuXHRpbnN0YW5jZSA9IG5ldyBQaG90b1N3aXBlKCBwc3dwLCBVSSwgZGF0YSwgb3B0aW9ucyApXG5cdGluc3RhbmNlLmluaXQoIClcblxuXHRyZXR1cm4gaW5zdGFuY2VcblxuXG5zaW5nbGVfaXRlbV9kYXRhID0gKCBpdGVtICkgLT5cblx0IyBQaG90b1N3aXBlIHN1cHBvcnRzIG9ubHkgaW1hZ2VzXG5cdHJldHVybiBpZiBpdGVtLmRhdGEuZ2V0KCAndHlwZScgKSBpc250ICdpbWFnZSdcblxuXG5cdFt3aWR0aCwgaGVpZ2h0XSA9IGl0ZW0uZGF0YS5zaXplKCAnZnVsbCcgKVxuXG5cdCMgcmV0dXJuXG5cdHNyYyAgOiBpdGVtLmRhdGEudXJsKCAnZnVsbCcgKVxuXHRtc3JjIDogaXRlbS5kYXRhLnVybCggJ2Z1bGwnIClcblx0dyAgICA6IHdpZHRoXG5cdGggICAgOiBoZWlnaHRcblx0dGl0bGU6IGl0ZW0uY2FwdGlvblxuXG5cbnRodW1ibmFpbF9wb3NpdGlvbiA9ICggJGdhbGxlcnkgKSAtPiByZXR1cm4gKCBpbmRleCApIC0+XG5cdHJldHVybiBmYWxzZSBpZiBub3QgJGdhbGxlcnkubGVuZ3RoXG5cblx0JGVsID0gJGdhbGxlcnkuZXEoIGluZGV4IClcblx0dGh1bWJuYWlsID0gJGVsLmZpbmQoICdpbWcnICkuZ2V0KCAwIClcblxuXHQjIFRodW1ibmFpbCBtdXN0IGV4aXN0IGJlZm9yZSBkaW1lbnNpb25zIGNhbiBiZSBvYnRhaW5lZFxuXHRyZXR1cm4gaWYgbm90IHRodW1ibmFpbFxuXG5cdHBhZ2VZU2Nyb2xsID0gd2luZG93LnBhZ2VZT2Zmc2V0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3Bcblx0cmVjdCA9IHRodW1ibmFpbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoIClcblxuXHQjIC8vIHcgPSB3aWR0aFxuXHRvdXQgPVxuXHRcdHg6IHJlY3QubGVmdFxuXHRcdHk6IHJlY3QudG9wICsgcGFnZVlTY3JvbGxcblx0XHR3OiByZWN0LndpZHRoXG5cblx0cmV0dXJuIG91dFxuXG5cbm1vZHVsZS5leHBvcnRzID0gKCAkZWwgKSAtPlxuXHRHYWxsZXJ5ID0gZmFsc2Vcblx0aW5zdGFuY2U6IC0+IEdhbGxlcnlcblx0Y2xvc2U6IC0+XG5cdFx0cmV0dXJuIGlmIG5vdCBHYWxsZXJ5XG5cdFx0R2FsbGVyeS5jbG9zZSggKVxuXHRcdEdhbGxlcnkgPSBmYWxzZVxuXG5cdG9wZW46ICggZ2FsbGVyeSwgaW5kZXggKSAtPlxuXHRcdG9wdGlvbnMgPVxuXHRcdFx0Z2V0VGh1bWJCb3VuZHNGbjogdGh1bWJuYWlsX3Bvc2l0aW9uKCAkZWwuY2xvc2VzdCggJy5QUF9HYWxsZXJ5JyApLmZpbmQoICcuUFBfR2FsbGVyeV9faXRlbScgKSApXG5cdFx0XHRpbmRleCAgICAgICAgICAgOiBpbmRleFxuXG5cdFx0R2FsbGVyeSA9IGNyZWF0ZSggZ2FsbGVyeS5tYXAoIHNpbmdsZV9pdGVtX2RhdGEgKSwgb3B0aW9ucyApXG5cblxuXG4iLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuJCA9IHJlcXVpcmUoICdqUXVlcnknIClcbkhvb2tzID0gcmVxdWlyZSggJ3dwX2hvb2tzJyApXG5nYWxlcnlfaXRlbV9kYXRhID0gcmVxdWlyZSggJy4vZ2FsbGVyeV9pdGVtX2ZhY3RvcnknIClcblxuXG5wYXJzZV9nYWxsZXJ5X2l0ZW0gPSAoIGtleSwgZWwgKSAtPlxuXHQkZWwgPSAkKCBlbCApXG5cblx0aW5kZXggIDoga2V5XG5cdGRhdGEgICA6IGdhbGVyeV9pdGVtX2RhdGEoICRlbCApXG5cdGNhcHRpb246ICRlbC5maW5kKCAnLlBQX0dhbGxlcnlfX2NhcHRpb24nICkuaHRtbCggKSB8fCAnJ1xuXG5cbm1vZHVsZS5leHBvcnRzID0gKCBHYWxsZXJ5X0RyaXZlciApIC0+XG5cdGluc3RhbmNlID0gZmFsc2VcblxuXHRvcGVuID0gKCBlbCApIC0+XG5cdFx0JGVsID0gJCggZWwgKVxuXHRcdCRpdGVtcyA9ICRlbC5jbG9zZXN0KCAnLlBQX0dhbGxlcnknICkuZmluZCggJy5QUF9HYWxsZXJ5X19pdGVtJyApXG5cblx0XHRpZiAkaXRlbXMubGVuZ3RoID4gMFxuXHRcdFx0aW5kZXggPSAkaXRlbXMuaW5kZXgoICRlbCApXG5cdFx0XHRnYWxsZXJ5X2l0ZW1zID0gJC5tYWtlQXJyYXkoICRpdGVtcy5tYXAoIHBhcnNlX2dhbGxlcnlfaXRlbSApIClcblxuXHRcdFx0aW5zdGFuY2UgPSBHYWxsZXJ5X0RyaXZlciggJGVsIClcblx0XHRcdGluc3RhbmNlLm9wZW4oIGdhbGxlcnlfaXRlbXMsIGluZGV4IClcblxuXHRcdFx0SG9va3MuZG9BY3Rpb24oICdwaG9ydC5nYWxsZXJ5Lm9wZW4nLCBpbnN0YW5jZSwgZ2FsbGVyeV9pdGVtcywgaW5kZXggKVxuXG5cdFx0cmV0dXJuXG5cblx0b3Blbjogb3BlblxuXG5cdGhhbmRsZV9oYXNoOiAtPlxuXHRcdGluZGV4ID0gcGFyc2VJbnQoIHdpbmRvdy5sb2NhdGlvbi5oYXNoLnNwbGl0KCAnJnBpZD0nIClbIDEgXSwgMTAgKVxuXHRcdGVsID0gJCggJy5QUF9HYWxsZXJ5JyApLmZpcnN0KCApLmZpbmQoICcuUFBfR2FsbGVyeV9faXRlbScgKS5nZXQoIGluZGV4IClcblx0XHRvcGVuKCBlbCApXG5cblx0XHRyZXR1cm5cblxuXHRjbG9zZTogLT5cblx0XHRyZXR1cm4gZmFsc2UgaWYgbm90IGluc3RhbmNlXG5cblx0XHRpbnN0YW5jZS5jbG9zZSggKVxuXHRcdGluc3RhbmNlID0gZmFsc2VcblxuXHRcdEhvb2tzLmRvQWN0aW9uKCAncGhvcnQuZ2FsbGVyeS5jbG9zZScsIGluc3RhbmNlIClcblx0XHRyZXR1cm4iLCJpdGVtX2RhdGEgPSAoIGRhdGFfb2JqICkgLT5cblxuXHRwbHVjayA9ICggb2JqZWN0LCBrZXkgKSAtPlxuXHRcdGlmIG9iamVjdCBhbmQgb2JqZWN0WyBrZXkgXVxuXHRcdFx0cmV0dXJuIG9iamVjdFsga2V5IF1cblx0XHRyZXR1cm4gZmFsc2VcblxuXHRnZXQgPSAoIGtleSApIC0+IHBsdWNrKCBkYXRhX29iaiwga2V5IClcblxuXHRpbWFnZSA9ICggc2l6ZV9uYW1lICkgLT4gcGx1Y2soIGdldCggJ2ltYWdlcycgKSwgc2l6ZV9uYW1lIClcblxuXG5cdHNpemU6ICggc2l6ZV9uYW1lICkgLT5cblx0XHRpbWFnZV9zaXplID0gcGx1Y2soIGltYWdlKCBzaXplX25hbWUgKSwgJ3NpemUnIClcblx0XHRyZXR1cm4gZmFsc2UgaWYgbm90IGltYWdlX3NpemVcblxuXHRcdFt3aWR0aCwgaGVpZ2h0XSA9IGltYWdlX3NpemUuc3BsaXQoICd4JyApXG5cblx0XHR3aWR0aCA9IHBhcnNlSW50KCB3aWR0aCApXG5cdFx0aGVpZ2h0ID0gcGFyc2VJbnQoIGhlaWdodCApXG5cblx0XHRyZXR1cm4gWyB3aWR0aCwgaGVpZ2h0IF1cblxuXHR1cmw6ICggc2l6ZV9uYW1lICkgLT4gcGx1Y2soIGltYWdlKCBzaXplX25hbWUgKSwgJ3VybCcgKVxuXHRnZXQ6IGdldFxuXG5cbm1vZHVsZS5leHBvcnRzID0gaXRlbV9kYXRhIiwiaXRlbSA9IHJlcXVpcmUoJy4vZ2FsbGVyeV9pdGVtX2RhdGEnKVxuXG5pdGVtX2RhdGEgPSAoICRlbCApIC0+XG5cdGRhdGFfb2JqID0gJGVsLmRhdGEoICdpdGVtJyApXG5cblx0aWYgbm90IGRhdGFfb2JqXG5cdFx0dGhyb3cgbmV3IEVycm9yIFwiRWxlbWVudCBkb2Vzbid0IGNvbnRhaW4gYGRhdGEtaXRlbWAgYXR0cmlidXRlXCJcblxuXHRyZXR1cm4gaXRlbSggZGF0YV9vYmogKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gaXRlbV9kYXRhIiwiSG9va3MgPSByZXF1aXJlKFwid3BfaG9va3NcIilcblxuI1xuIyBUaGlzIGZpbGUgaXMgZ29pbmcgdG8gcmV0dXJuIGEgW0dhbGxlcnkgRmFjdG9yeV0gaW5zdGFuY2VcbiMgRWFzeSBQaG90b2dyYXBoeSBQb3J0Zm9saW8gaXMgdXNpbmcgdGhhdCB0byBvcGVuL2Nsb3NlL2Rlc3Ryb3kgZ2FsbGVyaWVzXG4jXG4jIFtHYWxsZXJ5IEZhY3RvcnldIHJlbGllcyBvbiBhIFtBZGFwdGVyXVxuIyBJbnN0ZWFkIG9mIHJlbHlpbmcgZGlyZWN0bHkgb24gYSBkZXBlbmRlbmN5LCBHYWxsZXJ5IEZhY3RvcnkgcmVsaWVzIG9uIGEgQWRhcHRlciB0aGF0IGNhbiBiZSBtb2RpZmllZFxuIyBBIEFkYXB0ZXIgaXMgYW4gYWRhcHRlciBmb3IgYSBQb3B1cC1HYWxsZXJ5IHBsdWdpbiwgc3VjaCBhcyBMaWdodEdhbGxlcnkgb3IgUGhvdG9Td2lwZVxuI1xuIyBTbyB3aGVuIGEgZ2FsbGVyeSBpcyBvcGVuZWQsIHRoaXMgaXMgcHJvYmFibHkgaG93IGl0J3MgZ29pbmcgdG8gbG9vazpcbiMgW0dhbGxlcnkgRmFjdG9yeV0gYXNrcyBbQWRhcHRlcl0gdG8gZmluZCBhbmQgb3BlbiBhIGdhbGxlcnkgd2l0aCBbYW55IExpZ2h0Qm94IExpYnJhcnldXG4jXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBHYWxsZXJ5IEFkYXB0ZXI6XG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbnNldHVwX2RyaXZlciA9ICggZHJpdmVyX25hbWUgPSAnbGlnaHRnYWxsZXJ5JyApIC0+XG5cdGlmIGRyaXZlcl9uYW1lIGlzICdsaWdodGdhbGxlcnknXG5cdFx0YWRhcHRlciA9IHJlcXVpcmUoICcuL2FkYXB0ZXJzL2xpZ2h0Z2FsbGVyeScgKVxuXG5cdGlmIGRyaXZlcl9uYW1lIGlzICdwaG90b3N3aXBlJ1xuXHRcdGFkYXB0ZXIgPSByZXF1aXJlKCAnLi9hZGFwdGVycy9waG90b3N3aXBlJyApXG5cblx0cmV0dXJuIEhvb2tzLmFwcGx5RmlsdGVycyggJ3Bob3J0LmdhbGxlcnkuZHJpdmVyJywgYWRhcHRlciApXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBHYWxsZXJ5IEZhY3Rvcnk6XG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgVGhlIGdhbGxlcnkgZmFjdG9yeSBpcyB3aGF0IHdlJ3JlIGludGVyYWN0aW5nIHdpdGggdG8gb3Blbi9jbG9zZSBhIGdhbGxlcnlcbnNldHVwX2ZhY3RvcnkgPSAtPlxuXHRmYWN0b3J5ID0gcmVxdWlyZSggJy4vZ2FsbGVyeV9mYWN0b3J5JyApXG5cdHJldHVybiBIb29rcy5hcHBseUZpbHRlcnMoICdwaG9ydC5nYWxsZXJ5LmZhY3RvcnknLCBmYWN0b3J5IClcblxuI1xuIyBSZXR1cm4gYSBmYWN0b3J5IGluc3RhbmNlXG4jXG5cbmdhbGxlcnlfZHJpdmVyID0gc2V0dXBfZHJpdmVyKCB3aW5kb3cuX19waG9ydC5wb3B1cF9nYWxsZXJ5IClcbmdhbGxlcnlfZmFjdG9yeSA9IHNldHVwX2ZhY3RvcnkoIClcblxubW9kdWxlLmV4cG9ydHMgPSBnYWxsZXJ5X2ZhY3RvcnkoIGdhbGxlcnlfZHJpdmVyICkiLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuJCA9IHJlcXVpcmUoICdqUXVlcnknIClcbkhvb2tzID0gcmVxdWlyZSggJ3dwX2hvb2tzJyApXG5HYWxsZXJ5ID0gcmVxdWlyZSggJy4vcHJlcGFyZV9nYWxsZXJ5X2ZhY3RvcnknIClcblxuJChkb2N1bWVudCkucmVhZHkgLT5cblxuXHRoYW5kbGVfY2xpY2tzID0gSG9va3MuYXBwbHlGaWx0ZXJzKCAncGhvcnQuZ2FsbGVyeS5oYW5kbGVfY2xpY2tzJywgdHJ1ZSApXG5cdGhhbmRsZV9oYXNoID0gSG9va3MuYXBwbHlGaWx0ZXJzKCAncGhvcnQuZ2FsbGVyeS5oYW5kbGVfaGFzaCcsIHRydWUgKVxuXHRoYW5kbGVfZXNjX2tleSA9IEhvb2tzLmFwcGx5RmlsdGVycyggJ3Bob3J0LmdhbGxlcnkuY3VzdG9tX2VzYycsIHRydWUgKVxuXG5cdCMgSGFuZGxlIEhhc2hjaGFuZ2Vcblx0aWYgaGFuZGxlX2hhc2ggYW5kIHdpbmRvdy5sb2NhdGlvbi5oYXNoIGFuZCBHYWxsZXJ5LmhhbmRsZV9oYXNoXG5cdFx0SG9va3MuYWRkQWN0aW9uICdwaG9ydC5jb3JlLmxvYWRlZCcsIEdhbGxlcnkuaGFuZGxlX2hhc2hcblxuXHQjIEhhbmRsZSBDbGlja3Ncblx0aWYgaGFuZGxlX2NsaWNrc1xuXHRcdCQoIGRvY3VtZW50ICkub24gJ2NsaWNrJywgJy5QUF9HYWxsZXJ5X19pdGVtJywgKCBlICkgLT5cblx0XHRcdGUucHJldmVudERlZmF1bHQoIClcblx0XHRcdEdhbGxlcnkub3BlbiggdGhpcyApXG5cblxuXHQjIEhhbmRsZSBFU0NhcGUgS2V5XG5cdGlmIGhhbmRsZV9lc2Nfa2V5XG5cdFx0JCggd2luZG93ICkub24gJ2tleWRvd24nLCAoIGUgKSAtPlxuXHRcdFx0cmV0dXJuIHVubGVzcyBlLmtleSBpcyAnRXNjYXBlJ1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCggKVxuXHRcdFx0R2FsbGVyeS5jbG9zZSggKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gR2FsbGVyeVxuIiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5nYWxsZXJ5X2l0ZW0gPSByZXF1aXJlKCAnLi4vZ2FsbGVyeS9nYWxsZXJ5X2l0ZW1fZmFjdG9yeScgKVxuX19XSU5ET1cgPSByZXF1aXJlKCAnLi4vY29yZS9XaW5kb3cnIClcbnRocm90dGxlID0gcmVxdWlyZSgnLi4vY29yZS9VdGlsaXRpZXMnKS50aHJvdHRsZVxuXG5jbGFzcyBBYnN0cmFjdF9MYXp5X0xvYWRlclxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRARWxlbWVudHMgPVxuXHRcdFx0aXRlbSAgICAgICA6ICdQUF9MYXp5X0ltYWdlJ1xuXHRcdFx0cGxhY2Vob2xkZXI6ICdQUF9MYXp5X0ltYWdlX19wbGFjZWhvbGRlcidcblx0XHRcdGxpbmsgICAgICAgOiAnUFBfSlNfTGF6eV9fbGluaydcblx0XHRcdGltYWdlICAgICAgOiAnUFBfSlNfTGF6eV9faW1hZ2UnXG5cblx0XHRASXRlbXMgPSBbXVxuXG5cdFx0IyBBZGp1c3RhYmxlIFNlbnNpdGl2aXR5IGZvciBAaW5fdmlldyBmdW5jdGlvblxuXHRcdCMgVmFsdWUgaW4gcGl4ZWxzXG5cdFx0QFNlbnNpdGl2aXR5ID0gMTAwXG5cblx0XHQjIEF1dG8tc2V0dXAgd2hlbiBldmVudHMgYXJlIGF0dGFjaGVkXG5cdFx0IyBBdXRvLWRlc3Ryb3kgd2hlbiBldmVudHMgYXJlIGRldGFjaGVkXG5cdFx0QHRocm90dGxlZF9hdXRvbG9hZCA9IG51bGxcblxuXHRcdEBzZXR1cF9pdGVtcygpXG5cdFx0QHJlc2l6ZV9hbGwoKVxuXHRcdEBhdHRhY2hfZXZlbnRzKClcblxuXHQjIyNcblx0XHRBYnN0cmFjdCBNZXRob2RzXG5cdCMjI1xuXG5cdCMgVGhpcyBpcyBydW4gd2hlbiBhIHJlc2l6ZSBvciByZWZyZXNoIGV2ZW50IGlzIGRldGVjdGVkXG5cdHJlc2l6ZTogLT4gcmV0dXJuXG5cblx0bG9hZDogKCBpdGVtICkgLT5cblx0XHRAbG9hZF9pbWFnZSggaXRlbSApXG5cdFx0aXRlbS4kZWwuaW1hZ2VzTG9hZGVkID0+XG5cdFx0XHRAY2xlYW51cF9hZnRlcl9sb2FkKCBpdGVtIClcblxuXHRsb2FkX2ltYWdlOiAoIGl0ZW0gKSAtPlxuXG5cdFx0IyBHZXQgaW1hZ2UgVVJMXG5cdFx0dGh1bWIgPSBpdGVtLmRhdGEudXJsKCAndGh1bWInIClcblx0XHRmdWxsID0gaXRlbS5kYXRhLnVybCggJ2Z1bGwnIClcblxuXHRcdCMgQ3JlYXRlIGVsZW1lbnRzXG5cdFx0aXRlbS4kZWxcblx0XHRcdC5wcmVwZW5kKCBAZ2V0X2l0ZW1faHRtbCggdGh1bWIsIGZ1bGwgKSApXG5cdFx0XHQucmVtb3ZlQ2xhc3MoICdMYXp5LUltYWdlJyApXG5cblx0XHQjIE1ha2Ugc3VyZSB0aGlzIGltYWdlIGlzbid0IGxvYWRlZCBhZ2FpblxuXHRcdGl0ZW0ubG9hZGVkID0gdHJ1ZVxuXG5cdGNsZWFudXBfYWZ0ZXJfbG9hZDogKCBpdGVtICkgLT5cblx0XHQjIEFkZCBpbWFnZSBQUF9KU19sb2FkZWQgY2xhc3Ncblx0XHRpdGVtLiRlbC5maW5kKCAnaW1nJyApLmFkZENsYXNzKCAnUFBfSlNfX2xvYWRlZCcgKS5yZW1vdmVDbGFzcyggJ1BQX0pTX19sb2FkaW5nJyApXG5cblx0XHRpdGVtLiRlbFxuXG5cdFx0XHQjIFJlbW92ZSBgUFBfTGF6eV9JbWFnZWAsIGFzIHRoaXMgaXMgbm90IGEgbGF6eS1sb2FkYWJsZSBpbWFnZSBhbnltb3JlXG5cdFx0XHQucmVtb3ZlQ2xhc3MoIEBFbGVtZW50cy5pdGVtIClcblxuXHRcdFx0IyBSZW1vdmUgUGxhY2Vob2xkZXJcblx0XHRcdC5maW5kKCBcIi4je0BFbGVtZW50cy5wbGFjZWhvbGRlcn1cIiApXG5cdFx0XHQuZmFkZU91dCggNDAwLCAtPiAkKCB0aGlzICkucmVtb3ZlKCkgKVxuXG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LmxhenkubG9hZGVkX2l0ZW0nLCBpdGVtXG5cblxuXHRnZXRfaXRlbV9odG1sOiAoIHRodW1iLCBmdWxsICkgLT5cblxuXHRcdGlmICdkaXNhYmxlJyBpcyB3aW5kb3cuX19waG9ydC5wb3B1cF9nYWxsZXJ5XG5cdFx0XHRyZXR1cm4gXCJcIlwiXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiI3tARWxlbWVudHMubGlua31cIiByZWw9XCJnYWxsZXJ5XCI+XG5cdFx0XHRcdDxpbWcgY2xhc3M9XCIje0BFbGVtZW50cy5pbWFnZX1cIiBzcmM9XCIje3RodW1ifVwiIGNsYXNzPVwiUFBfSlNfX2xvYWRpbmdcIiAvPlxuXHRcdFx0PC9kaXY+XG5cdFx0XHRcIlwiXCJcblx0XHRlbHNlXG5cdFx0XHRyZXR1cm4gXCJcIlwiXG5cdFx0XHQ8YSBjbGFzcz1cIiN7QEVsZW1lbnRzLmxpbmt9XCIgaHJlZj1cIiN7ZnVsbH1cIiByZWw9XCJnYWxsZXJ5XCI+XG5cdFx0XHRcdDxpbWcgY2xhc3M9XCIje0BFbGVtZW50cy5pbWFnZX1cIiBzcmM9XCIje3RodW1ifVwiIGNsYXNzPVwiUFBfSlNfX2xvYWRpbmdcIiAvPlxuXHRcdFx0PC9hPlxuXHRcdFx0XCJcIlwiXG5cblx0c2V0dXBfaXRlbXM6ID0+XG5cdFx0IyBDbGVhciBleGlzdGluZyBpdGVtcywgaWYgYW55XG5cdFx0QEl0ZW1zID0gW11cblxuXHRcdCMgTG9vcCBvdmVyIERPTSBhbmQgYWRkIGVhY2ggaXRlbSB0byBASXRlbXNcblx0XHQkKCBcIi4je0BFbGVtZW50cy5pdGVtfVwiICkuZWFjaCggQGFkZF9pdGVtIClcblx0XHRyZXR1cm5cblxuXHRhZGRfaXRlbTogKCBrZXksIGVsICkgPT5cblx0XHQkZWwgPSAkKCBlbCApXG5cdFx0QEl0ZW1zLnB1c2hcblx0XHRcdGVsICAgIDogZWxcblx0XHRcdCRlbCAgIDogJGVsXG5cdFx0XHRkYXRhICA6IGdhbGxlcnlfaXRlbSggJGVsIClcblx0XHRcdGxvYWRlZDogZmFsc2VcblxuXG5cdFx0cmV0dXJuXG5cblxuXHQjIyNcblx0XHRNZXRob2RzXG5cdCMjI1xuXHRyZXNpemVfYWxsOiAtPlxuXHRcdEByZXNpemUoIGl0ZW0gKSBmb3IgaXRlbSBpbiBASXRlbXNcblxuXG5cblx0IyBBdXRvbWF0aWNhbGx5IExvYWQgYWxsIGl0ZW1zIHRoYXQgYXJlIGBpbl9sb29zZV92aWV3YFxuXHRhdXRvbG9hZDogPT5cblx0XHRmb3IgaXRlbSwga2V5IGluIEBJdGVtc1xuXHRcdFx0aWYgbm90IGl0ZW0ubG9hZGVkIGFuZCBAaW5fbG9vc2VfdmlldyggaXRlbS5lbCApXG5cdFx0XHRcdEBsb2FkKCBpdGVtIClcblxuXHRpbl9sb29zZV92aWV3OiAoIGVsICkgLT5cblx0XHRyZXR1cm4gdHJ1ZSBpZiBub3QgZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0P1xuXHRcdHJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuXG5cdFx0IyBFbGVtZW50cyBub3QgaW4gdmlldyBpZiB0aGV5IGRvbid0IGhhdmUgZGltZW5zaW9uc1xuXHRcdHJldHVybiBmYWxzZSBpZiByZWN0LmhlaWdodCBpcyAwIGFuZCByZWN0LndpZHRoIGlzIDBcblxuXG5cdFx0cmV0dXJuIChcblx0XHRcdCMgWSBBeGlzXG5cdFx0XHRyZWN0LnRvcCArIHJlY3QuaGVpZ2h0ID49IC1AU2Vuc2l0aXZpdHkgYW5kICMgdG9wXG5cdFx0XHRyZWN0LmJvdHRvbSAtIHJlY3QuaGVpZ2h0IDw9IF9fV0lORE9XLmhlaWdodCArIEBTZW5zaXRpdml0eSBhbmRcblxuXHRcdFx0IyBYIEF4aXNcblx0XHRcdHJlY3QubGVmdCArIHJlY3Qud2lkdGggPj0gLUBTZW5zaXRpdml0eSBhbmRcblx0XHRcdHJlY3QucmlnaHQgLSByZWN0LndpZHRoIDw9IF9fV0lORE9XLndpZHRoICsgQFNlbnNpdGl2aXR5XG5cblx0XHQpXG5cblx0ZGVzdHJveTogLT5cblx0XHRAZGV0YWNoX2V2ZW50cygpXG5cblx0YXR0YWNoX2V2ZW50czogLT5cblx0XHQjIENyZWF0ZSBhIGRlYm91bmNlZCBgYXV0b2xvYWRgIGZ1bmN0aW9uXG5cdFx0QHRocm90dGxlZF9hdXRvbG9hZCA9IHRocm90dGxlKCBAYXV0b2xvYWQsIDUwIClcblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5yZWZyZXNoJywgQHRocm90dGxlZF9hdXRvbG9hZCwgMTAwXG5cblxuXHRkZXRhY2hfZXZlbnRzOiAtPlxuXHRcdCMgQ2xlYXIgdGhlIGRlYm91bmNlZCBmdW5jdGlvbiBmcm9tIGluc3RhbmNlXG5cdFx0QHRocm90dGxlZF9hdXRvbG9hZCA9IG51bGxcblx0XHRIb29rcy5yZW1vdmVBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5yZWZyZXNoJywgQHRocm90dGxlZF9hdXRvbG9hZCwgMTAwXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFic3RyYWN0X0xhenlfTG9hZGVyXG4iLCIkID0gcmVxdWlyZSggXCJqUXVlcnlcIiApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5BYnN0cmFjdF9MYXp5X0xvYWRlciA9IHJlcXVpcmUoIFwiLi9BYnN0cmFjdF9MYXp5X0xvYWRlclwiIClcblxuY2xhc3MgTGF6eV9EZWZhdWx0IGV4dGVuZHMgQWJzdHJhY3RfTGF6eV9Mb2FkZXJcblxuXG5cdHJlc2l6ZTogKCBpdGVtICkgLT5cblx0XHRbdywgaF0gPSBpdGVtLmRhdGEuc2l6ZSggXCJ0aHVtYlwiIClcblx0XHRyYXRpbyA9IGl0ZW0uZGF0YS5nZXQoIFwicmF0aW9cIiApXG5cblx0XHRzbWFsbGVzdF93aWR0aCA9IE1hdGgubWluKCBpdGVtLiRlbC53aWR0aCggKSwgdyApXG5cdFx0aGVpZ2h0ID0gTWF0aC5mbG9vciggc21hbGxlc3Rfd2lkdGggLyByYXRpbyApXG5cdFx0d2lkdGggPSBNYXRoLmZsb29yKCBzbWFsbGVzdF93aWR0aCApXG5cblx0XHRpdGVtLiRlbC5jc3Ncblx0XHRcdFwid2lkdGhcIiA6IHdpZHRoXG5cdFx0XHRcImhlaWdodFwiOiBoZWlnaHRcblxuXHRjbGVhbnVwX2FmdGVyX2xvYWQ6ICggaXRlbSApIC0+XG5cdFx0IyBSZW1vdmUgbWluLWhlaWdodFxuXHRcdGl0ZW0uJGVsLmNzcyggXCJtaW4taGVpZ2h0XCIsIFwiXCIgKVxuXG5cdFx0IyBSdW4gYWxsIG90aGVyIGNsZWFudXBzXG5cdFx0c3VwZXIoIGl0ZW0gKVxuXG5cdFx0SG9va3MuZG9BY3Rpb24gXCJwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaFwiXG5cblx0XHRyZXR1cm5cblxuXHRhdHRhY2hfZXZlbnRzOiAtPlxuXHRcdCMgQ2FsbCBQYXJlbnQgZmlyc3QsIGl0J3MgZ29pbmcgdG8gY3JlYXRlIEB0aHJvdHRsZWRfYXV0b2xvYWRcblx0XHRzdXBlciggKVxuXG5cdFx0IyBBdHRhY2hcblx0XHQkKCB3aW5kb3cgKS5vbiBcInNjcm9sbFwiLCBAdGhyb3R0bGVkX2F1dG9sb2FkXG5cblxuXG5cdGRldGFjaF9ldmVudHM6IC0+XG5cdFx0IyBEZXRhY2hcblx0XHQkKCB3aW5kb3cgKS5vZmYgXCJzY3JvbGxcIiwgQHRocm90dGxlZF9hdXRvbG9hZFxuXG5cdFx0IyBDYWxsIHBhcmVudCBsYXN0LCBpdCdzIGdvaW5nIHRvIGNsZWFuIHVwIEB0aHJvdHRsZWRfYXV0b2xvYWRcblx0XHRzdXBlciggKVxuXG5cdGRlc3Ryb3k6IC0+XG5cdFx0Zm9yIGl0ZW0sIGtleSBpbiBASXRlbXNcblx0XHRcdGl0ZW0uJGVsLmNzc1xuXHRcdFx0XHQnbWluLWhlaWdodCc6ICcnXG5cdFx0XHRcdCdtYXgtd2lkdGgnIDogJydcblx0XHRzdXBlciggKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gTGF6eV9EZWZhdWx0XG4iLCIkID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuQWJzdHJhY3RfTGF6eV9Mb2FkZXIgPSByZXF1aXJlKCAnLi9BYnN0cmFjdF9MYXp5X0xvYWRlcicgKVxuX19XSU5ET1cgPSByZXF1aXJlKCAnLi4vY29yZS9XaW5kb3cnIClcblxuY2xhc3MgTGF6eV9NYXNvbnJ5IGV4dGVuZHMgQWJzdHJhY3RfTGF6eV9Mb2FkZXJcblxuXHRyZXNpemVfYWxsOiAtPlxuXHRcdEBwbGFjZWhvbGRlcl93aWR0aCA9ICQoICcuUFBfTWFzb25yeV9fc2l6ZXInICkud2lkdGgoKVxuXHRcdHN1cGVyKClcblxuXHRyZXNpemU6ICggaXRlbSApIC0+XG5cdFx0aXRlbS4kZWwuY3NzICdtaW4taGVpZ2h0JzogTWF0aC5mbG9vciggQHBsYWNlaG9sZGVyX3dpZHRoIC8gaXRlbS5kYXRhLmdldCgncmF0aW8nKSApXG5cblx0Y2xlYW51cF9hZnRlcl9sb2FkOiAoaXRlbSkgLT5cblx0XHQjIFJlbW92ZSBtaW4taGVpZ2h0XG5cdFx0aXRlbS4kZWwuY3NzKCAnbWluLWhlaWdodCcsICcnIClcblxuXHRcdCMgUnVuIGFsbCBvdGhlciBjbGVhbnVwc1xuXHRcdHN1cGVyKCBpdGVtIClcblxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCdcblxuXHRcdHJldHVyblxuXG5cdGF0dGFjaF9ldmVudHM6IC0+XG5cdFx0IyBDYWxsIFBhcmVudCBmaXJzdCwgaXQncyBnb2luZyB0byBjcmVhdGUgQHRocm90dGxlZF9hdXRvbG9hZFxuXHRcdHN1cGVyKClcblxuXHRcdCMgQXR0YWNoXG5cdFx0JCggd2luZG93ICkub24gJ3Njcm9sbCcsIEB0aHJvdHRsZWRfYXV0b2xvYWRcblxuXG5cblx0ZGV0YWNoX2V2ZW50czogLT5cblx0XHQjIERldGFjaFxuXHRcdCQoIHdpbmRvdyApLm9mZiAnc2Nyb2xsJywgQHRocm90dGxlZF9hdXRvbG9hZFxuXG5cdFx0IyBDYWxsIHBhcmVudCBsYXN0LCBpdCdzIGdvaW5nIHRvIGNsZWFuIHVwIEB0aHJvdHRsZWRfYXV0b2xvYWRcblx0XHRzdXBlcigpXG5cblx0ZGVzdHJveTogLT5cblx0XHRmb3IgaXRlbSwga2V5IGluIEBJdGVtc1xuXHRcdFx0aXRlbS4kZWwuY3NzICdtaW4taGVpZ2h0JywgJydcblx0XHRzdXBlcigpXG5cblxubW9kdWxlLmV4cG9ydHMgPSBMYXp5X01hc29ucnlcbiIsIiQgPSByZXF1aXJlKCBcImpRdWVyeVwiIClcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcbkxhenlfRGVmYXVsdCA9IHJlcXVpcmUoIFwiLi9MYXp5X0RlZmF1bHRcIiApXG5cbmluc3RhbmNlID0gZmFsc2VcblxuZGVzdHJveSA9IC0+XG5cdHJldHVybiBpZiBub3QgaW5zdGFuY2Vcblx0aW5zdGFuY2UuZGVzdHJveSggKVxuXHRpbnN0YW5jZSA9IG51bGxcblxuY3JlYXRlID0gLT5cblxuXHQjIE1ha2Ugc3VyZSBhbiBpbnN0YW5jZSBkb2Vzbid0IGFscmVhZHkgZXhpc3Rcblx0ZGVzdHJveSggKVxuXG5cdCMgSGFuZGxlciByZXF1aXJlZFxuXHRIYW5kbGVyID0gSG9va3MuYXBwbHlGaWx0ZXJzIFwicGhvcnQubGF6eS5oYW5kbGVyXCIsIExhenlfRGVmYXVsdFxuXG5cdHJldHVybiBpZiBub3QgKCQoIFwiLlBQX0xhenlfSW1hZ2VfX3BsYWNlaG9sZGVyXCIgKS5sZW5ndGggPiAwKVxuXHRyZXR1cm4gaWYgbm90IEhhbmRsZXJcblxuXHQjIEJ5IGRlZmF1bHQgTGF6eV9NYXNvbnJ5IGlzIGhhbmRsaW5nIExhenktTG9hZGluZ1xuXHQjIENoZWNrIGlmIGFueW9uZSB3YW50cyB0byBoaWphY2sgaGFuZGxlclxuXHRpbnN0YW5jZSA9IG5ldyBIYW5kbGVyKCApXG5cdEhvb2tzLmFkZEFjdGlvbiBcInBob3J0LmNvcmUubG9hZGVkXCIsIGluc3RhbmNlLmF1dG9sb2FkXG5cblx0cmV0dXJuXG5cblxuIyBJbml0aWFsaXplIGxhenkgbG9hZGVyIGFmdGVyIHRoZSBwb3J0Zm9saW8gaXMgcHJlcGFyZWQsIHAgPSAxMDBcbkhvb2tzLmFkZEFjdGlvbiBcInBob3J0LnBvcnRmb2xpby5wcmVwYXJlXCIsIGNyZWF0ZSwgMTAwXG5Ib29rcy5hZGRBY3Rpb24gXCJwaG9ydC5wb3J0Zm9saW8uZGVzdHJveVwiLCBkZXN0cm95XG5cblxubW9kdWxlLmV4cG9ydHMgPVxuXHRjcmVhdGUgOiBjcmVhdGVcblx0ZGVzdHJveTogZGVzdHJveSIsIkhvb2tzID0gcmVxdWlyZSggJ3dwX2hvb2tzJyApXG5cbiMjI1xuXG4gICAgIyBJbml0aWFsaXplIFBvcnRmb2xpbyBDb3JlXG5cdC0tLVxuXHRcdFVzaW5nIHA1MCBAIGBwaG9ydC5jb3JlLnJlYWR5YFxuXHRcdExhdGUgcHJpb3JpdHkgaXMgZ29pbmcgdG8gZm9yY2UgZXhwbGljaXQgcHJpb3JpdHkgaW4gYW55IG90aGVyIG1vdmluZyBwYXJ0cyB0aGF0IGFyZSBnb2luZyB0byB0b3VjaCBwb3J0Zm9saW8gbGF5b3V0IGF0IGBwaG9ydC5sb2FkZWRgXG5cdC0tLVxuXG4jIyNcbm1vZHVsZS5leHBvcnRzID1cblxuXHRwcmVwYXJlOiAtPlxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZSdcblx0XHRyZXR1cm5cblxuXHRjcmVhdGU6IC0+XG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5jcmVhdGUnXG5cdFx0cmV0dXJuXG5cblxuXHRyZWZyZXNoOiAtPlxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCdcblx0XHRyZXR1cm5cblxuXG5cdGRlc3Ryb3k6IC0+XG5cdFx0IyBEZXN0cm95XG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95J1xuXHRcdHJldHVyblxuIiwiSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuXG5cbiMjI1xuXHRBYnN0cmFjdCBDbGFzcyBQb3J0b2ZsaW9fRXZlbnRfSW1lcGxlbWVudGF0aW9uXG5cbiAgICBIYW5kbGVzIGFsbCB0aGUgZXZlbnRzIHJlcXVpcmVkIHRvIGZ1bGx5IGhhbmRsZSBhIHBvcnRmb2xpbyBsYXlvdXQgcHJvY2Vzc1xuIyMjXG5jbGFzcyBQb3J0Zm9saW9fSW50ZXJmYWNlXG5cblx0Y29uc3RydWN0b3I6ICggYXJncyApIC0+XG5cdFx0QHNldHVwX2FjdGlvbnMoKVxuXHRcdEBpbml0aWFsaXplKCBhcmdzIClcblxuXHRzZXR1cF9hY3Rpb25zOiAtPlxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnLCBAcHJlcGFyZSwgNTBcblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5jcmVhdGUnLCBAY3JlYXRlLCA1MFxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCBAcmVmcmVzaCwgNTBcblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgQGRlc3Ryb3ksIDUwXG5cdFx0SG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScsIEBwdXJnZV9hY3Rpb25zLCAxMDBcblxuXHRwdXJnZV9hY3Rpb25zOiA9PlxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnLCBAcHJlcGFyZSwgNTBcblx0XHRIb29rcy5yZW1vdmVBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5jcmVhdGUnLCBAY3JlYXRlLCA1MFxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCBAcmVmcmVzaCwgNTBcblx0XHRIb29rcy5yZW1vdmVBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgQGRlc3Ryb3ksIDUwXG5cdFx0SG9va3MucmVtb3ZlQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScsIEBwdXJnZV9hY3Rpb25zLCAxMDBcblxuXG5cdCMjI1xuICAgIFx0UmVxdWlyZSB0aGVzZSBtZXRob2RzXG5cdCMjI1xuXHRpbml0aWFsaXplOiAtPiB0aHJvdyBuZXcgRXJyb3IoIFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGBpbml0aWFsaXplYCBtZXRob2RcIiApXG5cdHByZXBhcmUgICA6IC0+IHRocm93IG5ldyBFcnJvciggXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYHByZXBhcmVgIG1ldGhvZFwiIClcblx0Y3JlYXRlICAgIDogLT4gdGhyb3cgbmV3IEVycm9yKCBcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgY3JlYXRlYCBtZXRob2RcIiApXG5cdHJlZnJlc2ggICA6IC0+IHRocm93IG5ldyBFcnJvciggXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYHJlZnJlc2hgIG1ldGhvZFwiIClcblx0ZGVzdHJveSAgIDogLT4gdGhyb3cgbmV3IEVycm9yKCBcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgZGVzdHJveWAgbWV0aG9kXCIgKVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW9fSW50ZXJmYWNlIiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCBcImpRdWVyeVwiIClcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcblBvcnRmb2xpb19JbnRlcmZhY2UgPSByZXF1aXJlKCBcIi4vUG9ydGZvbGlvX0ludGVyZmFjZVwiIClcblxuIyBEZWZlcmluZyB0aGUgcmVmcmVzaCBlZmVudCBwcmV2ZW50cyBtYXNvbnJ5IGZyb20gdHJpZ2dlcmluZyBhbiBlcnJvclxuIyBUaGlzIGlzIGFuIHVnbHkgcXVpY2sgZml4LlxuIyBAVE9ETzogUmV3cml0ZSB0aGUgd2hvbGUgZmlsZS5cblxuZGVmZXIgPSAoIGNiICkgLT4gc2V0VGltZW91dCggY2IsIDEgKVxuXG4jIEBUT0RPOiBOZWVkIGEgaGVhdnZ5IHJlZmFjdG9yIC0gbm8gbW9yZSBjbGFzc2VzIHBsZWFzZVxuY2xhc3MgUG9ydGZvbGlvX01hc29ucnkgZXh0ZW5kcyBQb3J0Zm9saW9fSW50ZXJmYWNlXG5cdG9uY2UgPSBmYWxzZVxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRARWxlbWVudHMgPVxuXHRcdFx0Y29udGFpbmVyOiBcIlBQX01hc29ucnlcIlxuXHRcdFx0c2l6ZXIgICAgOiBcIlBQX01hc29ucnlfX3NpemVyXCJcblx0XHRcdGl0ZW0gICAgIDogXCJQUF9NYXNvbnJ5X19pdGVtXCJcblxuXHRcdHN1cGVyKCApXG5cblx0IyMjXG5cdFx0SW5pdGlhbGl6ZVxuXHQjIyNcblx0aW5pdGlhbGl6ZTogLT5cblx0XHRAJGNvbnRhaW5lciA9ICQoIFwiLiN7QEVsZW1lbnRzLmNvbnRhaW5lcn1cIiApXG5cblx0IyMjXG5cdFx0UHJlcGFyZSAmIEF0dGFjaCBFdmVudHNcbiAgICBcdERvbid0IHNob3cgYW55dGhpbmcgeWV0LlxuXG5cdFx0QGNhbGxlZCBvbiBob29rIGBwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZWBcblx0IyMjXG5cdHByZXBhcmU6ID0+XG5cdFx0cmV0dXJuIGlmIEAkY29udGFpbmVyLmxlbmd0aCBpcyAwXG5cblx0XHRAJGNvbnRhaW5lci5hZGRDbGFzcyggXCJQUF9KU19fbG9hZGluZ19tYXNvbnJ5XCIgKVxuXG5cdFx0QG1heWJlX2NyZWF0ZV9zaXplciggKVxuXG5cdFx0IyBPbmx5IGluaXRpYWxpemUsIGlmIG5vIG1hc29ucnkgZXhpc3RzXG5cdFx0bWFzb25yeV9zZXR0aW5ncyA9IEhvb2tzLmFwcGx5RmlsdGVycyBcInBob3J0Lm1hc29ucnkuc2V0dGluZ3NcIixcblx0XHRcdGl0ZW1TZWxlY3RvcjogXCIuI3tARWxlbWVudHMuaXRlbX1cIlxuXHRcdFx0Y29sdW1uV2lkdGggOiBcIi4je0BFbGVtZW50cy5zaXplcn1cIlxuXHRcdFx0Z3V0dGVyICAgICAgOiAwXG5cdFx0XHRpbml0TGF5b3V0ICA6IGZhbHNlXG5cblx0XHRAJGNvbnRhaW5lci5tYXNvbnJ5KCBtYXNvbnJ5X3NldHRpbmdzIClcblxuXHRcdEAkY29udGFpbmVyLm1hc29ucnkgXCJvbmNlXCIsIFwibGF5b3V0Q29tcGxldGVcIiwgPT5cblx0XHRcdEAkY29udGFpbmVyXG5cdFx0XHRcdC5yZW1vdmVDbGFzcyggXCJQUF9KU19fbG9hZGluZ19tYXNvbnJ5XCIgKVxuXHRcdFx0XHQuYWRkQ2xhc3MoIFwiUFBfSlNfX2xvYWRpbmdfY29tcGxldGVcIiApXG5cblx0XHRcdCMgQHRyaWdnZXIgcmVmcmVzaCBldmVudFxuXHRcdFx0IyB0cmlnZ2VycyBgQHJlZnJlc2goKWBcblx0XHRcdGRlZmVyKCAtPiBIb29rcy5kb0FjdGlvbiggXCJwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaFwiICkgKVxuXG5cblxuXG5cblx0IyMjXG5cdFx0U3RhcnQgdGhlIFBvcnRmb2xpb1xuXHRcdEBjYWxsZWQgb24gaG9vayBgcGhvcnQucG9ydGZvbGlvLmNyZWF0ZWBcblx0IyMjXG5cdGNyZWF0ZTogPT5cblx0XHRAJGNvbnRhaW5lci5tYXNvbnJ5KCApXG5cdFx0cmV0dXJuXG5cblxuXHQjIyNcblx0XHREZXN0cm95XG5cdFx0QGNhbGxlZCBvbiBob29rIGBwaG9ydC5wb3J0Zm9saW8uZGVzdHJveWBcblx0IyMjXG5cdGRlc3Ryb3k6ID0+XG5cdFx0QG1heWJlX3JlbW92ZV9zaXplciggKVxuXG5cdFx0aWYgQCRjb250YWluZXIubGVuZ3RoID4gMFxuXHRcdFx0QCRjb250YWluZXIubWFzb25yeSggXCJkZXN0cm95XCIgKVxuXG5cblx0XHRyZXR1cm5cblxuXG5cdCMjI1xuXHRcdFJlbG9hZCB0aGUgbGF5b3V0XG5cdFx0QGNhbGxlZCBvbiBob29rIGBwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaGBcblx0IyMjXG5cdHJlZnJlc2g6ID0+XG5cdFx0QCRjb250YWluZXIubWFzb25yeSggXCJsYXlvdXRcIiApXG5cblxuXG5cdCMjI1xuXHRcdENyZWF0ZSBhIHNpemVyIGVsZW1lbnQgZm9yIGpxdWVyeS1tYXNvbnJ5IHRvIHVzZVxuXHQjIyNcblx0bWF5YmVfY3JlYXRlX3NpemVyOiAtPlxuXHRcdEBjcmVhdGVfc2l6ZXIoICkgaWYgQHNpemVyX2RvZXNudF9leGlzdCggKVxuXHRcdHJldHVyblxuXG5cdG1heWJlX3JlbW92ZV9zaXplcjogLT5cblx0XHRyZXR1cm4gaWYgQCRjb250YWluZXIubGVuZ3RoIGlzbnQgMVxuXHRcdEAkY29udGFpbmVyLmZpbmQoIFwiLiN7QEVsZW1lbnRzLnNpemVyfVwiICkucmVtb3ZlKCApXG5cdFx0cmV0dXJuXG5cblx0c2l6ZXJfZG9lc250X2V4aXN0OiAtPiBAJGNvbnRhaW5lci5maW5kKCBcIi4je0BFbGVtZW50cy5zaXplcn1cIiApLmxlbmd0aCBpcyAwXG5cblxuXHRjcmVhdGVfc2l6ZXI6IC0+XG5cdFx0QCRjb250YWluZXIuYXBwZW5kIFwiXCJcIjxkaXYgY2xhc3M9XCIje0BFbGVtZW50cy5zaXplcn1cIj48L2Rpdj5cIlwiXCJcblxuXHRcdHJldHVyblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBvcnRmb2xpb19NYXNvbnJ5IiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5cbiMgUG9ydGZvbGlvIG1hbmFnZXIgd2lsbCB0cmlnZ2VyIHBvcnRmb2xpbyBldmVudHMgd2hlbiBuZWNlc3NhcnlcblRyaWdnZXIgPSByZXF1aXJlKCAnLi9Qb3J0Zm9saW9fRXZlbnRzJyApXG5cbmlzX21hc29ucnkgPSAtPlxuXHRyZXR1cm4gKCAkKCAnLlBQX01hc29ucnknICkubGVuZ3RoIGlzbnQgMCApXG5cbiMgU3RhcnQgTWFzb25yeSBMYXlvdXRcbnN0YXJ0X21hc29ucnkgPSAtPlxuXHRyZXR1cm4gZmFsc2UgaWYgbm90IGlzX21hc29ucnkoKVxuXG5cdFBvcnRmb2xpb19NYXNvbnJ5ID0gcmVxdWlyZSggJy4vUG9ydGZvbGlvX01hc29ucnknIClcblx0bmV3IFBvcnRmb2xpb19NYXNvbnJ5KClcblxubWF5YmVfbGF6eV9tYXNvbnJ5ID0gKCBoYW5kbGVyICkgLT5cblx0IyBVc2UgTGF6eV9NYXNvbnJ5IGhhbmRsZXIsIGlmIGN1cnJlbnQgbGF5b3V0IGlzIG1hc29ucnlcblx0cmV0dXJuIHJlcXVpcmUoICdsYXp5L0xhenlfTWFzb25yeScgKSBpZiBpc19tYXNvbnJ5KClcblx0cmV0dXJuIGhhbmRsZXJcblxuXG4jIFN0YXJ0IFBvcnRmb2xpb1xuSG9va3MuYWRkQWN0aW9uICdwaG9ydC5jb3JlLnJlYWR5JywgVHJpZ2dlci5wcmVwYXJlLCA1MFxuSG9va3MuYWRkQWN0aW9uICdwaG9ydC5jb3JlLmxvYWRlZCcsIFRyaWdnZXIuY3JlYXRlLCA1MFxuXG4jIEluaXRpYWxpemUgTWFzb25yeSBMYXlvdXRcbkhvb2tzLmFkZEFjdGlvbiAncGhvcnQuY29yZS5yZWFkeScsIHN0YXJ0X21hc29ucnlcblxuIyBJbml0aWFsaXplIExhenkgTG9hZGluZyBmb3IgTWFzb25yeSBMYXlvdXRcbkhvb2tzLmFkZEZpbHRlciAncGhvcnQubGF6eS5oYW5kbGVyJywgbWF5YmVfbGF6eV9tYXNvbnJ5XG5cblxuXG4iXX0=
