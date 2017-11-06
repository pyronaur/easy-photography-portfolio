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


/*
	Includes
 */

require('./portfolio/start');

require('./gallery/start');

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

},{"./core/Photography_Portfolio":2,"./gallery/gallery_item_data":8,"./gallery/gallery_item_factory":9,"./gallery/start":10,"./lazy/Abstract_Lazy_Loader":11,"./lazy/start":13,"./portfolio/Portfolio_Interface":15,"./portfolio/start":17}],2:[function(require,module,exports){
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

/*
    Dependencies
 */
var $, Gallery, Hooks, gallery_driver, gallery_factory, setup_driver, setup_factory;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

setup_driver = function(driver_name) {
  var Driver;
  if (driver_name == null) {
    driver_name = 'lightgallery';
  }
  if (driver_name === 'lightgallery') {
    Driver = require('./drivers/lightgallery');
  }
  if (driver_name === 'photoswipe') {
    Driver = require('./drivers/photoswipe');
  }
  return Hooks.applyFilters('phort.gallery.driver', Driver);
};

setup_factory = function() {
  var factory;
  factory = require('./gallery_factory');
  return Hooks.applyFilters('phort.gallery.factory', factory);
};

gallery_driver = setup_driver(window.__phort.popup_gallery);

gallery_factory = setup_factory();

Gallery = gallery_factory(gallery_driver);

$(document).on('click', '.PP_Gallery__item', function(e) {
  e.preventDefault();
  return Gallery.open(this);
});

if (window.location.hash && Gallery.handle_hash) {
  Hooks.addAction('phort.core.loaded', Gallery.handle_hash);
}

if (Hooks.applyFilters('phort.gallery.custom_esc', true)) {
  $(window).on('keydown', function(e) {
    if (e.keyCode !== 27) {
      return;
    }
    e.preventDefault();
    return Gallery.close();
  });
}


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./drivers/lightgallery":5,"./drivers/photoswipe":6,"./gallery_factory":7}],11:[function(require,module,exports){
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

},{"../core/Utilities":3,"../core/Window":4,"../gallery/gallery_item_factory":9}],12:[function(require,module,exports){
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

},{"../core/Window":4,"./Abstract_Lazy_Loader":11}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{"./Portfolio_Interface":15}],17:[function(require,module,exports){
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

},{"./Portfolio_Event_Manager":14,"./Portfolio_Masonry":16,"lazy/Lazy_Masonry":12}]},{},[1])


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jb3JlL1Bob3RvZ3JhcGh5X1BvcnRmb2xpby5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY29yZS9VdGlsaXRpZXMuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY29yZS9XaW5kb3cuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvZHJpdmVycy9saWdodGdhbGxlcnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvZHJpdmVycy9waG90b3N3aXBlLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9nYWxsZXJ5L2dhbGxlcnlfZmFjdG9yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvZ2FsbGVyeS9nYWxsZXJ5X2l0ZW1fZGF0YS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvZ2FsbGVyeS9nYWxsZXJ5X2l0ZW1fZmFjdG9yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvZ2FsbGVyeS9zdGFydC5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvbGF6eS9BYnN0cmFjdF9MYXp5X0xvYWRlci5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvbGF6eS9MYXp5X01hc29ucnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvc3RhcnQuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL3BvcnRmb2xpby9Qb3J0Zm9saW9fRXZlbnRfTWFuYWdlci5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL1BvcnRmb2xpb19JbnRlcmZhY2UuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL3BvcnRmb2xpby9Qb3J0Zm9saW9fTWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL3N0YXJ0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7OztBQUFBLElBQUE7O0FBR0EsS0FBQSxHQUFRLE9BQUEsQ0FBUyxVQUFUOztBQUNSLENBQUEsR0FBSSxPQUFBLENBQVMsUUFBVDs7QUFJSixNQUFNLENBQUMsVUFBUCxHQUVDO0VBQUEsbUJBQUEsRUFBcUIsT0FBQSxDQUFTLGlDQUFULENBQXJCO0VBR0EsT0FBQSxFQUNDO0lBQUEsU0FBQSxFQUFXLE9BQUEsQ0FBUyw2QkFBVCxDQUFYO0lBQ0EsWUFBQSxFQUFjLE9BQUEsQ0FBUSxnQ0FBUixDQURkO0dBSkQ7RUFRQSxvQkFBQSxFQUFzQixPQUFBLENBQVMsNkJBQVQsQ0FSdEI7Ozs7QUFVRDs7OztBQUtBLE9BQUEsQ0FBUSxtQkFBUjs7QUFHQSxPQUFBLENBQVEsaUJBQVI7O0FBR0EsT0FBQSxDQUFRLGNBQVI7OztBQUtBOzs7O0FBR0EsQ0FBQSxDQUFHLFFBQUgsQ0FBYSxDQUFDLEtBQWQsQ0FBb0IsU0FBQTtBQUduQixNQUFBO0VBQUEsSUFBVSxDQUFJLENBQUEsQ0FBRyxNQUFILENBQVcsQ0FBQyxRQUFaLENBQXNCLGNBQXRCLENBQWQ7QUFBQSxXQUFBOztFQUdBLHFCQUFBLEdBQXdCLElBQUksQ0FBRSxPQUFBLENBQVMsOEJBQVQsQ0FBRixDQUFKLENBQUE7RUFDeEIscUJBQXFCLENBQUMsS0FBdEIsQ0FBQTtBQVBtQixDQUFwQjs7Ozs7Ozs7QUN2Q0E7OztBQUFBLElBQUEsY0FBQTtFQUFBOztBQUdBLENBQUEsR0FBSSxPQUFBLENBQVMsUUFBVDs7QUFDSixLQUFBLEdBQVEsT0FBQSxDQUFTLFVBQVQ7O0FBR0Y7RUFFUSxjQUFBOzs7SUFDWixLQUFLLENBQUMsU0FBTixDQUFnQixrQkFBaEIsRUFBb0MsSUFBQyxDQUFBLGFBQXJDO0VBRFk7O2lCQUliLEtBQUEsR0FBTyxTQUFBO0lBQ04sSUFBRyxLQUFLLENBQUMsWUFBTixD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LENBQVMsbUJBQVQsRUFBUDs7QUFDQSxTQUFPO0FBSGE7O0FBT3JCLEtBQUssQ0FBQyxTQUFOLENBQWdCLGtCQUFoQixFQUFvQyxTQUFTLENBQUMsT0FBOUMsRUFBdUQsRUFBdkQ7O0FBQ0EsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsbUJBQWhCLEVBQXFDLFNBQVMsQ0FBQyxNQUEvQyxFQUF1RCxFQUF2RDs7QUFHQSxLQUFLLENBQUMsU0FBTixDQUFnQixrQkFBaEIsRUFBb0MsYUFBcEM7O0FBR0EsS0FBSyxDQUFDLFNBQU4sQ0FBZ0Isb0JBQWhCLEVBQXNDLGtCQUF0QyIsImZpbGUiOiJwaG90b2dyYXBoeS1wb3J0Zm9saW8uanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiMjI1xuICAgIExvYWQgRGVwZW5kZW5jaWVzXG4jIyNcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcbiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5cblxuIyBFeHBvc2Ugc29tZSBQaG90b2dyYXBoeSBQb3J0Zm9saW8gbW9kdWxlcyB0byB0aGUgcHVibGljIGZvciBleHRlbnNpYmlsaXR5XG53aW5kb3cuUFBfTW9kdWxlcyA9XG5cdCMgRXh0ZW5kIFBvcnRmb2xpbyBJbnRlcmZhY2UgdG8gYnVpbGQgY3VzdG9tIHBvcnRmb2xpbyBsYXlvdXRzIGJhc2VkIG9uIFBQIEV2ZW50c1xuXHRQb3J0Zm9saW9fSW50ZXJmYWNlOiByZXF1aXJlKCAnLi9wb3J0Zm9saW8vUG9ydGZvbGlvX0ludGVyZmFjZScgKVxuXG5cdCMgVXNlIGBnYWxsZXJ5X2l0ZW1fZGF0YWAgdG8gZ2V0IGZvcm1hdHRlZCBpdGVtIGltYWdlIHNpemVzIGZvciBsYXp5IGxvYWRpbmdcblx0Z2FsbGVyeTpcblx0XHRpdGVtX2RhdGE6IHJlcXVpcmUoICcuL2dhbGxlcnkvZ2FsbGVyeV9pdGVtX2RhdGEnIClcblx0XHRpdGVtX2ZhY3Rvcnk6IHJlcXVpcmUoJy4vZ2FsbGVyeS9nYWxsZXJ5X2l0ZW1fZmFjdG9yeScpXG5cblx0IyBFeHRlbmQgQWJzdHJhY3RfTGF6eV9Mb2RlciB0byBpbXBsZW1lbnQgbGF6eSBsb2FkZXIgZm9yIHlvdXIgbGF5b3V0XG5cdEFic3RyYWN0X0xhenlfTG9hZGVyOiByZXF1aXJlKCAnLi9sYXp5L0Fic3RyYWN0X0xhenlfTG9hZGVyJyApXG5cbiMjI1xuXHRJbmNsdWRlc1xuIyMjXG5cbiMgU3RhcnQgUG9ydGZvbGlvXG5yZXF1aXJlICcuL3BvcnRmb2xpby9zdGFydCdcblxuIyBHYWxsZXJ5XG5yZXF1aXJlICcuL2dhbGxlcnkvc3RhcnQnXG5cbiMgTGF6eSBMb2FkaW5nXG5yZXF1aXJlICcuL2xhenkvc3RhcnQnXG5cblxuXG5cbiMjI1xuXHRCb290IG9uIGBkb2N1bWVudC5yZWFkeWBcbiMjI1xuJCggZG9jdW1lbnQgKS5yZWFkeSAtPlxuXG5cdCMgT25seSBydW4gdGhpcyBzY3JpcHQgd2hlbiBib2R5IGhhcyBgUFBfUG9ydGZvbGlvYCBjbGFzc1xuXHRyZXR1cm4gaWYgbm90ICQoICdib2R5JyApLmhhc0NsYXNzKCAnUFBfUG9ydGZvbGlvJyApXG5cblx0IyBCb290XG5cdFBob3RvZ3JhcGh5X1BvcnRmb2xpbyA9IG5ldyAoIHJlcXVpcmUoICcuL2NvcmUvUGhvdG9ncmFwaHlfUG9ydGZvbGlvJyApICkoKVxuXHRQaG90b2dyYXBoeV9Qb3J0Zm9saW8ucmVhZHkoKVxuXG5cdHJldHVybiIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuXG5cbmNsYXNzIENvcmVcblxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LmNvcmUucmVhZHknLCBAd2FpdF9mb3JfbG9hZFxuXG5cdCMgVHJpZ2dlciBwaG9ydC5jb3JlLnJlYWR5XG5cdHJlYWR5OiA9PlxuXHRcdGlmIEhvb2tzLmFwcGx5RmlsdGVycyggJ3Bob3J0LmNvcmUucmVhZHknLCB0cnVlIClcblx0XHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5jb3JlLnJlYWR5J1xuXHRcdHJldHVyblxuXG5cdHdhaXRfZm9yX2xvYWQ6ID0+XG5cdFx0IyBUcmlnZ2VyIGltYWdlc0xvYWRlZCBldmVudCB3aGVuIGltYWdlcyBoYXZlIGxvYWRlZFxuXHRcdCQoICcuUFBfV3JhcHBlcicgKS5pbWFnZXNMb2FkZWQoIEBsb2FkZWQgKVxuXG5cdCMgVHJpZ2dlciBwaG9ydC5jb3JlLmxvYWRlZFxuXHRsb2FkZWQ6IC0+XG5cdFx0aWYgSG9va3MuYXBwbHlGaWx0ZXJzKCAncGhvcnQuY29yZS5sb2FkZWQnLCB0cnVlIClcblx0XHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5jb3JlLmxvYWRlZCdcblxuXHRcdHJldHVyblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQ29yZSIsIm1vZHVsZS5leHBvcnRzID0ge1xuXG5cbiAgICAvKipcbiAgICAgKiBUaGFuayB5b3UgUnVzcyBmb3IgaGVscGluZyBtZSBhdm9pZCB3cml0aW5nIHRoaXMgbXlzZWxmOlxuICAgICAqIEB1cmwgaHR0cHM6Ly9yZW15c2hhcnAuY29tLzIwMTAvMDcvMjEvdGhyb3R0bGluZy1mdW5jdGlvbi1jYWxscy8jY29tbWVudC0yNzQ1NjYzNTk0XG4gICAgICovXG4gICAgdGhyb3R0bGU6IGZ1bmN0aW9uICggZm4sIHRocmVzaGhvbGQsIHNjb3BlICkge1xuICAgICAgICB0aHJlc2hob2xkIHx8ICh0aHJlc2hob2xkID0gMjUwKVxuICAgICAgICB2YXIgbGFzdCxcbiAgICAgICAgICAgIGRlZmVyVGltZXJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBjb250ZXh0ID0gc2NvcGUgfHwgdGhpc1xuXG4gICAgICAgICAgICB2YXIgbm93ICA9ICtuZXcgRGF0ZSxcbiAgICAgICAgICAgICAgICBhcmdzID0gYXJndW1lbnRzXG4gICAgICAgICAgICBpZiAoIGxhc3QgJiYgbm93IDwgbGFzdCArIHRocmVzaGhvbGQgKSB7XG4gICAgICAgICAgICAgICAgLy8gaG9sZCBvbiB0byBpdFxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCggZGVmZXJUaW1lciApXG4gICAgICAgICAgICAgICAgZGVmZXJUaW1lciA9IHNldFRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFzdCA9IG5vd1xuICAgICAgICAgICAgICAgICAgICBmbi5hcHBseSggY29udGV4dCwgYXJncyApXG4gICAgICAgICAgICAgICAgfSwgdGhyZXNoaG9sZCArIGxhc3QgLSBub3cgKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsYXN0ID0gbm93XG4gICAgICAgICAgICAgICAgZm4uYXBwbHkoIGNvbnRleHQsIGFyZ3MgKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG5cbn0iLCJIb29rcyA9IHJlcXVpcmUoICd3cF9ob29rcycgKVxuXG5cbmdldF9zaXplID0gLT5cblx0d2lkdGggOiB3aW5kb3cuaW5uZXJXaWR0aCB8fCAkd2luZG93LndpZHRoKClcblx0aGVpZ2h0OiB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgJHdpbmRvdy5oZWlnaHQoKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0X3NpemUoKSIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggXCJqUXVlcnlcIiApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5cbmRlZmF1bHRzID1cblx0ZHluYW1pYyA6IHRydWVcblx0c3BlZWQgICA6IDM1MFxuXHRwcmVsb2FkIDogM1xuXHRkb3dubG9hZDogZmFsc2Vcblx0ZXNjS2V5ICA6IGZhbHNlICMgV2UncmUgcm9sbGluZyBvdXIgb3duXG5cblx0dGh1bWJuYWlsICAgICAgICAgOiB0cnVlXG5cdHNob3dUaHVtYkJ5RGVmYXVsdDogdHJ1ZVxuXG4jIEBUT0RPOiBVc2UgT2JqZWN0LmFzc2lnbigpIHdpdGggQmFiZWxcbnNldHRpbmdzID0gJC5leHRlbmQoIHt9LCBkZWZhdWx0cywgd2luZG93Ll9fcGhvcnQubGlnaHRHYWxsZXJ5IClcblxuXG5zaW5nbGVfaXRlbV9kYXRhID0gKCBpdGVtICkgLT5cblxuXHRpZiBpdGVtLmRhdGEuZ2V0KCAndHlwZScgKSBpcyAndmlkZW8nXG5cdFx0ZnVsbCA9IGl0ZW0uZGF0YS5nZXQoICd2aWRlb191cmwnIClcblx0ZWxzZVxuXHRcdGZ1bGwgPSBpdGVtLmRhdGEudXJsKCAnZnVsbCcgKVxuXG5cdHJldHVybiB7XG5cdFx0c3JjICAgIDogZnVsbFxuXHRcdHRodW1iICA6IGl0ZW0uZGF0YS51cmwoICd0aHVtYicgKVxuXHRcdHN1Ykh0bWw6IGl0ZW0uY2FwdGlvblxuXHR9XG5cblxuZ2V0X3NldHRpbmdzID0gKCBnYWxsZXJ5LCBpbmRleCApIC0+XG5cdHNldHRpbmdzLmluZGV4ICAgICAgICAgPSBpbmRleFxuXHRzZXR0aW5ncy5keW5hbWljRWwgICAgID0gZ2FsbGVyeS5tYXAoIHNpbmdsZV9pdGVtX2RhdGEgKVxuXHRzZXR0aW5ncy52aWRlb01heFdpZHRoID0gd2luZG93LmlubmVyV2lkdGggKiAwLjhcblxuXHRIb29rcy5hcHBseUZpbHRlcnMgJ3Bob3J0LmxpZ2h0R2FsbGVyeS5zZXR0aW5ncycsIHNldHRpbmdzXG5cblxubW9kdWxlLmV4cG9ydHMgPSAoICRlbCApIC0+XG5cdGNsb3NlOiAtPlxuXHRcdEdhbGxlcnkgPSAkZWwuZGF0YSggJ2xpZ2h0R2FsbGVyeScgKVxuXHRcdEdhbGxlcnkuZGVzdHJveSggKSBpZiBHYWxsZXJ5IGFuZCBHYWxsZXJ5LmRlc3Ryb3k/XG5cblx0b3BlbjogKCBnYWxsZXJ5X2l0ZW1zLCBpbmRleCApIC0+XG5cdFx0R2FsbGVyeSA9ICRlbC5saWdodEdhbGxlcnkoIGdldF9zZXR0aW5ncyggZ2FsbGVyeV9pdGVtcywgaW5kZXggKSApXG5cblxuXG5cbiIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggXCJqUXVlcnlcIiApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5cbmxhYmVscyA9ICQuZXh0ZW5kKCB7fSwge1xuXHQnZmFjZWJvb2snOiAnU2hhcmUgb24gRmFjZWJvb2snLFxuXHQndHdpdHRlcic6ICdUd2VldCcsXG5cdCdwaW50ZXJlc3QnOiAnUGluIGl0Jyxcbn0sIHdpbmRvdy5fX3Bob3J0LmkxOG4ucGhvdG9zd2lwZSApXG5cblxuZGVmYXVsdHMgPVxuXHRpbmRleCAgICAgICA6IDBcblx0cHJlbG9hZCAgICAgOiBbIDEsIDMgXVxuXHRlc2NLZXkgICAgICA6IGZhbHNlXG5cdHNoYXJlQnV0dG9uczogW1xuXHRcdHsgaWQ6ICdmYWNlYm9vaycsIGxhYmVsOiBsYWJlbHMuZmFjZWJvb2ssIHVybDogJ2h0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS9zaGFyZXIvc2hhcmVyLnBocD91PXt7dXJsfX0nIH1cblx0XHR7IGlkOiAndHdpdHRlcicsIGxhYmVsIDogbGFiZWxzLnR3aXR0ZXIsIHVybDogJ2h0dHBzOi8vdHdpdHRlci5jb20vaW50ZW50L3R3ZWV0P3RleHQ9e3t0ZXh0fX0mdXJsPXt7dXJsfX0nIH1cblx0XHR7IGlkOiAncGludGVyZXN0JywgbGFiZWw6IGxhYmVscy5waW50ZXJlc3QsIHVybDogJ2h0dHA6Ly93d3cucGludGVyZXN0LmNvbS9waW4vY3JlYXRlL2J1dHRvbi8/dXJsPXt7dXJsfX0mbWVkaWE9e3tpbWFnZV91cmx9fSZkZXNjcmlwdGlvbj17e3RleHR9fScgfVxuXHRdXG5cblxucHN3cCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoICcucHN3cCcgKVxuVUkgPSBIb29rcy5hcHBseUZpbHRlcnMoIFwicGhvcnQucGhvdG9zd2lwZS5VSVwiLCB3aW5kb3cuUGhvdG9Td2lwZVVJX0RlZmF1bHQgKVxuUGhvdG9Td2lwZSA9IHdpbmRvdy5QaG90b1N3aXBlXG5cblxuY3JlYXRlID0gKCBkYXRhLCBvcHRzID0ge30gKSAtPlxuXHRvcHRpb25zID0gSG9va3MuYXBwbHlGaWx0ZXJzKCBcInBob3J0LnBob3Rvc3dpcGUub3B0aW9uc1wiLCAkLmV4dGVuZCgge30sIGRlZmF1bHRzLCBvcHRzICkgKVxuXG5cdCMgSW5kZXggaXMgMCBieSBkZWZhdWx0XG5cdGlmIG5vdCBvcHRpb25zLmluZGV4P1xuXHRcdG9wdGlvbnMuaW5kZXggPSAwXG5cblx0IyBTZXQgdGhlIGluZGV4IHRvIDAgaWYgaXQgaXNuJ3QgYSBwcm9wZXIgdmFsdWVcblx0aWYgbm90IG9wdGlvbnMuaW5kZXggb3Igb3B0aW9ucy5pbmRleCA8IDBcblx0XHRvcHRpb25zLmluZGV4ID0gMFxuXG5cdGluc3RhbmNlID0gbmV3IFBob3RvU3dpcGUoIHBzd3AsIFVJLCBkYXRhLCBvcHRpb25zIClcblx0aW5zdGFuY2UuaW5pdCggKVxuXG5cdHJldHVybiBpbnN0YW5jZVxuXG5cbnNpbmdsZV9pdGVtX2RhdGEgPSAoIGl0ZW0gKSAtPlxuXHQjIFBob3RvU3dpcGUgc3VwcG9ydHMgb25seSBpbWFnZXNcblx0cmV0dXJuIGlmIGl0ZW0uZGF0YS5nZXQoICd0eXBlJyApIGlzbnQgJ2ltYWdlJ1xuXG5cblx0W3dpZHRoLCBoZWlnaHRdID0gaXRlbS5kYXRhLnNpemUoICdmdWxsJyApXG5cblx0IyByZXR1cm5cblx0c3JjICA6IGl0ZW0uZGF0YS51cmwoICdmdWxsJyApXG5cdG1zcmMgOiBpdGVtLmRhdGEudXJsKCAnZnVsbCcgKVxuXHR3ICAgIDogd2lkdGhcblx0aCAgICA6IGhlaWdodFxuXHR0aXRsZTogaXRlbS5jYXB0aW9uXG5cblxudGh1bWJuYWlsX3Bvc2l0aW9uID0gKCAkZ2FsbGVyeSApIC0+IHJldHVybiAoIGluZGV4ICkgLT5cblx0cmV0dXJuIGZhbHNlIGlmIG5vdCAkZ2FsbGVyeS5sZW5ndGhcblxuXHQkZWwgPSAkZ2FsbGVyeS5lcSggaW5kZXggKVxuXHR0aHVtYm5haWwgPSAkZWwuZmluZCggJ2ltZycgKS5nZXQoIDAgKVxuXG5cdCMgVGh1bWJuYWlsIG11c3QgZXhpc3QgYmVmb3JlIGRpbWVuc2lvbnMgY2FuIGJlIG9idGFpbmVkXG5cdHJldHVybiBpZiBub3QgdGh1bWJuYWlsXG5cblx0cGFnZVlTY3JvbGwgPSB3aW5kb3cucGFnZVlPZmZzZXQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcFxuXHRyZWN0ID0gdGh1bWJuYWlsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCggKVxuXG5cdCMgLy8gdyA9IHdpZHRoXG5cdG91dCA9XG5cdFx0eDogcmVjdC5sZWZ0XG5cdFx0eTogcmVjdC50b3AgKyBwYWdlWVNjcm9sbFxuXHRcdHc6IHJlY3Qud2lkdGhcblxuXHRyZXR1cm4gb3V0XG5cblxubW9kdWxlLmV4cG9ydHMgPSAoICRlbCApIC0+XG5cdEdhbGxlcnkgPSBmYWxzZVxuXG5cdGNsb3NlOiAtPlxuXHRcdHJldHVybiBpZiBub3QgR2FsbGVyeVxuXHRcdEdhbGxlcnkuY2xvc2UoIClcblx0XHRHYWxsZXJ5ID0gZmFsc2VcblxuXHRvcGVuOiAoIGdhbGxlcnksIGluZGV4ICkgLT5cblx0XHRvcHRpb25zID1cblx0XHRcdGdldFRodW1iQm91bmRzRm46IHRodW1ibmFpbF9wb3NpdGlvbiggJGVsLmNsb3Nlc3QoICcuUFBfR2FsbGVyeScgKS5maW5kKCAnLlBQX0dhbGxlcnlfX2l0ZW0nICkgKVxuXHRcdFx0aW5kZXggICAgICAgICAgIDogaW5kZXhcblxuXHRcdEdhbGxlcnkgPSBjcmVhdGUoIGdhbGxlcnkubWFwKCBzaW5nbGVfaXRlbV9kYXRhICksIG9wdGlvbnMgKVxuXG5cblxuIiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoICd3cF9ob29rcycgKVxuZ2FsZXJ5X2l0ZW1fZGF0YSA9IHJlcXVpcmUoICcuL2dhbGxlcnlfaXRlbV9mYWN0b3J5JyApXG5cblxuXG5wYXJzZV9nYWxsZXJ5X2l0ZW0gPSAoIGtleSwgZWwgKSAtPlxuXHQkZWwgPSAkKCBlbCApXG5cblx0aW5kZXggIDoga2V5XG5cdGRhdGEgICA6IGdhbGVyeV9pdGVtX2RhdGEoICRlbCApXG5cdGNhcHRpb246ICRlbC5maW5kKCAnLlBQX0dhbGxlcnlfX2NhcHRpb24nICkuaHRtbCggKSB8fCAnJ1xuXG5cbm1vZHVsZS5leHBvcnRzID0gKCBHYWxsZXJ5X0RyaXZlciApIC0+XG5cdGluc3RhbmNlID0gZmFsc2VcblxuXHRvcGVuID0gKGVsKSAtPlxuXHRcdCRlbCA9ICQoIGVsIClcblx0XHQkaXRlbXMgPSAkZWwuY2xvc2VzdCggJy5QUF9HYWxsZXJ5JyApLmZpbmQoICcuUFBfR2FsbGVyeV9faXRlbScgKVxuXG5cdFx0aWYgJGl0ZW1zLmxlbmd0aCA+IDBcblx0XHRcdGluZGV4ID0gJGl0ZW1zLmluZGV4KCAkZWwgKVxuXHRcdFx0Z2FsbGVyeV9pdGVtcyA9ICQubWFrZUFycmF5KCAkaXRlbXMubWFwKCBwYXJzZV9nYWxsZXJ5X2l0ZW0gKSApXG5cblx0XHRcdGluc3RhbmNlID0gR2FsbGVyeV9Ecml2ZXIoICRlbCApXG5cdFx0XHRpbnN0YW5jZS5vcGVuKCBnYWxsZXJ5X2l0ZW1zLCBpbmRleCApXG5cblxuXHRvcGVuOiBvcGVuXG5cblx0aGFuZGxlX2hhc2g6IC0+XG5cdFx0aW5kZXggPSBwYXJzZUludCggd2luZG93LmxvY2F0aW9uLmhhc2guc3BsaXQoICcmcGlkPScgKVsgMSBdLCAxMCApXG5cdFx0ZWwgPSAkKCAnLlBQX0dhbGxlcnknICkuZmlyc3QoICkuZmluZCggJy5QUF9HYWxsZXJ5X19pdGVtJyApLmdldCggaW5kZXggKVxuXHRcdG9wZW4oIGVsIClcblxuXHRjbG9zZTogLT5cblx0XHRyZXR1cm4gZmFsc2UgaWYgbm90IGluc3RhbmNlXG5cblx0XHRpbnN0YW5jZS5jbG9zZSggKVxuXHRcdGluc3RhbmNlID0gZmFsc2UiLCJpdGVtX2RhdGEgPSAoIGRhdGFfb2JqICkgLT5cblxuXHRwbHVjayA9ICggb2JqZWN0LCBrZXkgKSAtPlxuXHRcdGlmIG9iamVjdCBhbmQgb2JqZWN0WyBrZXkgXVxuXHRcdFx0cmV0dXJuIG9iamVjdFsga2V5IF1cblx0XHRyZXR1cm4gZmFsc2VcblxuXHRnZXQgPSAoIGtleSApIC0+IHBsdWNrKCBkYXRhX29iaiwga2V5IClcblxuXHRpbWFnZSA9ICggc2l6ZV9uYW1lICkgLT4gcGx1Y2soIGdldCggJ2ltYWdlcycgKSwgc2l6ZV9uYW1lIClcblxuXG5cdHNpemU6ICggc2l6ZV9uYW1lICkgLT5cblx0XHRpbWFnZV9zaXplID0gcGx1Y2soIGltYWdlKCBzaXplX25hbWUgKSwgJ3NpemUnIClcblx0XHRyZXR1cm4gZmFsc2UgaWYgbm90IGltYWdlX3NpemVcblxuXHRcdFt3aWR0aCwgaGVpZ2h0XSA9IGltYWdlX3NpemUuc3BsaXQoICd4JyApXG5cblx0XHR3aWR0aCA9IHBhcnNlSW50KCB3aWR0aCApXG5cdFx0aGVpZ2h0ID0gcGFyc2VJbnQoIGhlaWdodCApXG5cblx0XHRyZXR1cm4gWyB3aWR0aCwgaGVpZ2h0IF1cblxuXHR1cmw6ICggc2l6ZV9uYW1lICkgLT4gcGx1Y2soIGltYWdlKCBzaXplX25hbWUgKSwgJ3VybCcgKVxuXHRnZXQ6IGdldFxuXG5cbm1vZHVsZS5leHBvcnRzID0gaXRlbV9kYXRhIiwiaXRlbSA9IHJlcXVpcmUoJy4vZ2FsbGVyeV9pdGVtX2RhdGEnKVxuXG5pdGVtX2RhdGEgPSAoICRlbCApIC0+XG5cdGRhdGFfb2JqID0gJGVsLmRhdGEoICdpdGVtJyApXG5cblx0aWYgbm90IGRhdGFfb2JqXG5cdFx0dGhyb3cgbmV3IEVycm9yIFwiRWxlbWVudCBkb2Vzbid0IGNvbnRhaW4gYGRhdGEtaXRlbWAgYXR0cmlidXRlXCJcblxuXHRyZXR1cm4gaXRlbSggZGF0YV9vYmogKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gaXRlbV9kYXRhIiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoICd3cF9ob29rcycgKVxuXG4jIEdhbGxlcnkgRHJpdmVyOlxuIyBUaGUgZHJpdmVyIGlzIHJlc3BvbnNpYmxlIGZvciBhZGFwdGluZyB0aGUgcG9wdXAgZ2FsbGVyeSB0byBFYXN5IFBob3RvZ3JhcGh5IFBvcnRmb2xpb1xuc2V0dXBfZHJpdmVyID0gKCBkcml2ZXJfbmFtZSA9ICdsaWdodGdhbGxlcnknICkgLT5cblx0aWYgZHJpdmVyX25hbWUgaXMgJ2xpZ2h0Z2FsbGVyeSdcblx0XHREcml2ZXIgPSByZXF1aXJlKCAnLi9kcml2ZXJzL2xpZ2h0Z2FsbGVyeScgKVxuXG5cdGlmIGRyaXZlcl9uYW1lIGlzICdwaG90b3N3aXBlJ1xuXHRcdERyaXZlciA9IHJlcXVpcmUoICcuL2RyaXZlcnMvcGhvdG9zd2lwZScgKVxuXG5cdHJldHVybiBIb29rcy5hcHBseUZpbHRlcnMoICdwaG9ydC5nYWxsZXJ5LmRyaXZlcicsIERyaXZlciApXG5cbiMgR2FsbGVyeSBGYWN0b3J5OlxuIyBUaGUgZ2FsbGVyeSBmYWN0b3J5IGlzIHdoYXQgd2UncmUgaW50ZXJhY3Rpbmcgd2l0aCB0byBvcGVuL2Nsb3NlIGEgZ2FsbGVyeVxuc2V0dXBfZmFjdG9yeSA9IC0+XG5cdGZhY3RvcnkgPSByZXF1aXJlKCAnLi9nYWxsZXJ5X2ZhY3RvcnknIClcblx0cmV0dXJuIEhvb2tzLmFwcGx5RmlsdGVycyggJ3Bob3J0LmdhbGxlcnkuZmFjdG9yeScsIGZhY3RvcnkgKVxuXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgSW5pdGlhbGl6ZTpcbiNcbmdhbGxlcnlfZHJpdmVyID0gc2V0dXBfZHJpdmVyKCB3aW5kb3cuX19waG9ydC5wb3B1cF9nYWxsZXJ5IClcbmdhbGxlcnlfZmFjdG9yeSA9IHNldHVwX2ZhY3RvcnkoKVxuR2FsbGVyeSA9IGdhbGxlcnlfZmFjdG9yeSggZ2FsbGVyeV9kcml2ZXIgKVxuXG5cbiMgQ2xpY2tcbiQoIGRvY3VtZW50ICkub24gJ2NsaWNrJywgJy5QUF9HYWxsZXJ5X19pdGVtJywgKCBlICkgLT5cblx0ZS5wcmV2ZW50RGVmYXVsdCggKVxuXHRHYWxsZXJ5Lm9wZW4oIHRoaXMgKVxuXG4jIEhhc2hcbmlmIHdpbmRvdy5sb2NhdGlvbi5oYXNoIGFuZCBHYWxsZXJ5LmhhbmRsZV9oYXNoXG5cdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQuY29yZS5sb2FkZWQnLCBHYWxsZXJ5LmhhbmRsZV9oYXNoXG5cbiMgRVNDIEtleVxuaWYgSG9va3MuYXBwbHlGaWx0ZXJzICdwaG9ydC5nYWxsZXJ5LmN1c3RvbV9lc2MnLCB0cnVlXG5cdCQoIHdpbmRvdyApLm9uICdrZXlkb3duJywgKCBlICkgLT5cblx0XHRyZXR1cm4gdW5sZXNzIGUua2V5Q29kZSBpcyAyN1xuXHRcdGUucHJldmVudERlZmF1bHQoIClcblx0XHRHYWxsZXJ5LmNsb3NlKCApXG5cbiIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuZ2FsbGVyeV9pdGVtID0gcmVxdWlyZSggJy4uL2dhbGxlcnkvZ2FsbGVyeV9pdGVtX2ZhY3RvcnknIClcbl9fV0lORE9XID0gcmVxdWlyZSggJy4uL2NvcmUvV2luZG93JyApXG50aHJvdHRsZSA9IHJlcXVpcmUoJy4uL2NvcmUvVXRpbGl0aWVzJykudGhyb3R0bGVcblxuY2xhc3MgQWJzdHJhY3RfTGF6eV9Mb2FkZXJcblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0QEVsZW1lbnRzID1cblx0XHRcdGl0ZW0gICAgICAgOiAnUFBfTGF6eV9JbWFnZSdcblx0XHRcdHBsYWNlaG9sZGVyOiAnUFBfTGF6eV9JbWFnZV9fcGxhY2Vob2xkZXInXG5cdFx0XHRsaW5rICAgICAgIDogJ1BQX0pTX0xhenlfX2xpbmsnXG5cdFx0XHRpbWFnZSAgICAgIDogJ1BQX0pTX0xhenlfX2ltYWdlJ1xuXG5cdFx0QEl0ZW1zID0gW11cblxuXHRcdCMgQWRqdXN0YWJsZSBTZW5zaXRpdml0eSBmb3IgQGluX3ZpZXcgZnVuY3Rpb25cblx0XHQjIFZhbHVlIGluIHBpeGVsc1xuXHRcdEBTZW5zaXRpdml0eSA9IDEwMFxuXG5cdFx0IyBBdXRvLXNldHVwIHdoZW4gZXZlbnRzIGFyZSBhdHRhY2hlZFxuXHRcdCMgQXV0by1kZXN0cm95IHdoZW4gZXZlbnRzIGFyZSBkZXRhY2hlZFxuXHRcdEB0aHJvdHRsZWRfYXV0b2xvYWQgPSBudWxsXG5cblx0XHRAc2V0dXBfaXRlbXMoKVxuXHRcdEByZXNpemVfYWxsKClcblx0XHRAYXR0YWNoX2V2ZW50cygpXG5cblx0IyMjXG5cdFx0QWJzdHJhY3QgTWV0aG9kc1xuXHQjIyNcblxuXHQjIFRoaXMgaXMgcnVuIHdoZW4gYSByZXNpemUgb3IgcmVmcmVzaCBldmVudCBpcyBkZXRlY3RlZFxuXHRyZXNpemU6IC0+IHJldHVyblxuXG5cdGxvYWQ6ICggaXRlbSApIC0+XG5cdFx0QGxvYWRfaW1hZ2UoIGl0ZW0gKVxuXHRcdGl0ZW0uJGVsLmltYWdlc0xvYWRlZCA9PlxuXHRcdFx0QGNsZWFudXBfYWZ0ZXJfbG9hZCggaXRlbSApXG5cblx0bG9hZF9pbWFnZTogKCBpdGVtICkgLT5cblxuXHRcdCMgR2V0IGltYWdlIFVSTHNcblx0XHR0aHVtYiA9IGl0ZW0uZGF0YS51cmwoICd0aHVtYicgKVxuXHRcdGZ1bGwgPSBpdGVtLmRhdGEudXJsKCAnZnVsbCcgKVxuXG5cdFx0IyBDcmVhdGUgZWxlbWVudHNcblx0XHRpdGVtLiRlbFxuXHRcdFx0LnByZXBlbmQoIEBnZXRfaXRlbV9odG1sKCB0aHVtYiwgZnVsbCApIClcblx0XHRcdC5yZW1vdmVDbGFzcyggJ0xhenktSW1hZ2UnIClcblxuXHRcdCMgTWFrZSBzdXJlIHRoaXMgaW1hZ2UgaXNuJ3QgbG9hZGVkIGFnYWluXG5cdFx0aXRlbS5sb2FkZWQgPSB0cnVlXG5cblx0Y2xlYW51cF9hZnRlcl9sb2FkOiAoIGl0ZW0gKSAtPlxuXHRcdCMgQWRkIGltYWdlIFBQX0pTX2xvYWRlZCBjbGFzc1xuXHRcdGl0ZW0uJGVsLmZpbmQoICdpbWcnICkuYWRkQ2xhc3MoICdQUF9KU19fbG9hZGVkJyApLnJlbW92ZUNsYXNzKCAnUFBfSlNfX2xvYWRpbmcnIClcblxuXHRcdGl0ZW0uJGVsXG5cblx0XHRcdCMgUmVtb3ZlIGBQUF9MYXp5X0ltYWdlYCwgYXMgdGhpcyBpcyBub3QgYSBsYXp5LWxvYWRhYmxlIGltYWdlIGFueW1vcmVcblx0XHRcdC5yZW1vdmVDbGFzcyggQEVsZW1lbnRzLml0ZW0gKVxuXG5cdFx0XHQjIFJlbW92ZSBQbGFjZWhvbGRlclxuXHRcdFx0LmZpbmQoIFwiLiN7QEVsZW1lbnRzLnBsYWNlaG9sZGVyfVwiIClcblx0XHRcdC5mYWRlT3V0KCA0MDAsIC0+ICQoIHRoaXMgKS5yZW1vdmUoKSApXG5cblx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQubGF6eS5sb2FkZWRfaXRlbScsIGl0ZW1cblxuXG5cdGdldF9pdGVtX2h0bWw6ICggdGh1bWIsIGZ1bGwgKSAtPlxuXG5cdFx0aWYgJ2Rpc2FibGUnIGlzIHdpbmRvdy5fX3Bob3J0LnBvcHVwX2dhbGxlcnlcblx0XHRcdHJldHVybiBcIlwiXCJcblx0XHRcdDxkaXYgY2xhc3M9XCIje0BFbGVtZW50cy5saW5rfVwiIHJlbD1cImdhbGxlcnlcIj5cblx0XHRcdFx0PGltZyBjbGFzcz1cIiN7QEVsZW1lbnRzLmltYWdlfVwiIHNyYz1cIiN7dGh1bWJ9XCIgY2xhc3M9XCJQUF9KU19fbG9hZGluZ1wiIC8+XG5cdFx0XHQ8L2Rpdj5cblx0XHRcdFwiXCJcIlxuXHRcdGVsc2Vcblx0XHRcdHJldHVybiBcIlwiXCJcblx0XHRcdDxhIGNsYXNzPVwiI3tARWxlbWVudHMubGlua31cIiBocmVmPVwiI3tmdWxsfVwiIHJlbD1cImdhbGxlcnlcIj5cblx0XHRcdFx0PGltZyBjbGFzcz1cIiN7QEVsZW1lbnRzLmltYWdlfVwiIHNyYz1cIiN7dGh1bWJ9XCIgY2xhc3M9XCJQUF9KU19fbG9hZGluZ1wiIC8+XG5cdFx0XHQ8L2E+XG5cdFx0XHRcIlwiXCJcblxuXHRzZXR1cF9pdGVtczogPT5cblx0XHQjIENsZWFyIGV4aXN0aW5nIGl0ZW1zLCBpZiBhbnlcblx0XHRASXRlbXMgPSBbXVxuXG5cdFx0IyBMb29wIG92ZXIgRE9NIGFuZCBhZGQgZWFjaCBpdGVtIHRvIEBJdGVtc1xuXHRcdCQoIFwiLiN7QEVsZW1lbnRzLml0ZW19XCIgKS5lYWNoKCBAYWRkX2l0ZW0gKVxuXHRcdHJldHVyblxuXG5cdGFkZF9pdGVtOiAoIGtleSwgZWwgKSA9PlxuXHRcdCRlbCA9ICQoIGVsIClcblx0XHRASXRlbXMucHVzaFxuXHRcdFx0ZWwgICAgOiBlbFxuXHRcdFx0JGVsICAgOiAkZWxcblx0XHRcdGRhdGEgIDogZ2FsbGVyeV9pdGVtKCAkZWwgKVxuXHRcdFx0bG9hZGVkOiBmYWxzZVxuXG5cblx0XHRyZXR1cm5cblxuXG5cdCMjI1xuXHRcdE1ldGhvZHNcblx0IyMjXG5cdHJlc2l6ZV9hbGw6IC0+XG5cdFx0QHJlc2l6ZSggaXRlbSApIGZvciBpdGVtIGluIEBJdGVtc1xuXG5cblxuXHQjIEF1dG9tYXRpY2FsbHkgTG9hZCBhbGwgaXRlbXMgdGhhdCBhcmUgYGluX2xvb3NlX3ZpZXdgXG5cdGF1dG9sb2FkOiA9PlxuXHRcdGZvciBpdGVtLCBrZXkgaW4gQEl0ZW1zXG5cdFx0XHRpZiBub3QgaXRlbS5sb2FkZWQgYW5kIEBpbl9sb29zZV92aWV3KCBpdGVtLmVsIClcblx0XHRcdFx0QGxvYWQoIGl0ZW0gKVxuXG5cdGluX2xvb3NlX3ZpZXc6ICggZWwgKSAtPlxuXHRcdHJldHVybiB0cnVlIGlmIG5vdCBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3Q/XG5cdFx0cmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG5cblx0XHQjIEVsZW1lbnRzIG5vdCBpbiB2aWV3IGlmIHRoZXkgZG9uJ3QgaGF2ZSBkaW1lbnNpb25zXG5cdFx0cmV0dXJuIGZhbHNlIGlmIHJlY3QuaGVpZ2h0IGlzIDAgYW5kIHJlY3Qud2lkdGggaXMgMFxuXG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0IyBZIEF4aXNcblx0XHRcdHJlY3QudG9wICsgcmVjdC5oZWlnaHQgPj0gLUBTZW5zaXRpdml0eSBhbmQgIyB0b3Bcblx0XHRcdHJlY3QuYm90dG9tIC0gcmVjdC5oZWlnaHQgPD0gX19XSU5ET1cuaGVpZ2h0ICsgQFNlbnNpdGl2aXR5IGFuZFxuXG5cdFx0XHQjIFggQXhpc1xuXHRcdFx0cmVjdC5sZWZ0ICsgcmVjdC53aWR0aCA+PSAtQFNlbnNpdGl2aXR5IGFuZFxuXHRcdFx0cmVjdC5yaWdodCAtIHJlY3Qud2lkdGggPD0gX19XSU5ET1cud2lkdGggKyBAU2Vuc2l0aXZpdHlcblxuXHRcdClcblxuXHRkZXN0cm95OiAtPlxuXHRcdEBkZXRhY2hfZXZlbnRzKClcblxuXHRhdHRhY2hfZXZlbnRzOiAtPlxuXHRcdCMgQ3JlYXRlIGEgZGVib3VuY2VkIGBhdXRvbG9hZGAgZnVuY3Rpb25cblx0XHRAdGhyb3R0bGVkX2F1dG9sb2FkID0gdGhyb3R0bGUoIEBhdXRvbG9hZCwgNTAgKVxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCBAdGhyb3R0bGVkX2F1dG9sb2FkLCAxMDBcblxuXG5cdGRldGFjaF9ldmVudHM6IC0+XG5cdFx0IyBDbGVhciB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uIGZyb20gaW5zdGFuY2Vcblx0XHRAdGhyb3R0bGVkX2F1dG9sb2FkID0gbnVsbFxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCBAdGhyb3R0bGVkX2F1dG9sb2FkLCAxMDBcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQWJzdHJhY3RfTGF6eV9Mb2FkZXJcbiIsIiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5BYnN0cmFjdF9MYXp5X0xvYWRlciA9IHJlcXVpcmUoICcuL0Fic3RyYWN0X0xhenlfTG9hZGVyJyApXG5fX1dJTkRPVyA9IHJlcXVpcmUoICcuLi9jb3JlL1dpbmRvdycgKVxuXG5jbGFzcyBMYXp5X01hc29ucnkgZXh0ZW5kcyBBYnN0cmFjdF9MYXp5X0xvYWRlclxuXG5cdHJlc2l6ZV9hbGw6IC0+XG5cdFx0QHBsYWNlaG9sZGVyX3dpZHRoID0gJCggJy5QUF9NYXNvbnJ5X19zaXplcicgKS53aWR0aCgpXG5cdFx0c3VwZXIoKVxuXG5cdHJlc2l6ZTogKCBpdGVtICkgLT5cblx0XHRpdGVtLiRlbC5jc3MgJ21pbi1oZWlnaHQnOiBNYXRoLmZsb29yKCBAcGxhY2Vob2xkZXJfd2lkdGggLyBpdGVtLmRhdGEuZ2V0KCdyYXRpbycpIClcblxuXHRjbGVhbnVwX2FmdGVyX2xvYWQ6IChpdGVtKSAtPlxuXHRcdCMgUmVtb3ZlIG1pbi1oZWlnaHRcblx0XHRpdGVtLiRlbC5jc3MoICdtaW4taGVpZ2h0JywgJycgKVxuXG5cdFx0IyBSdW4gYWxsIG90aGVyIGNsZWFudXBzXG5cdFx0c3VwZXIoIGl0ZW0gKVxuXG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5yZWZyZXNoJ1xuXG5cdFx0cmV0dXJuXG5cblx0YXR0YWNoX2V2ZW50czogLT5cblx0XHQjIENhbGwgUGFyZW50IGZpcnN0LCBpdCdzIGdvaW5nIHRvIGNyZWF0ZSBAdGhyb3R0bGVkX2F1dG9sb2FkXG5cdFx0c3VwZXIoKVxuXG5cdFx0IyBBdHRhY2hcblx0XHQkKCB3aW5kb3cgKS5vbiAnc2Nyb2xsJywgQHRocm90dGxlZF9hdXRvbG9hZFxuXG5cblxuXHRkZXRhY2hfZXZlbnRzOiAtPlxuXHRcdCMgRGV0YWNoXG5cdFx0JCggd2luZG93ICkub2ZmICdzY3JvbGwnLCBAdGhyb3R0bGVkX2F1dG9sb2FkXG5cblx0XHQjIENhbGwgcGFyZW50IGxhc3QsIGl0J3MgZ29pbmcgdG8gY2xlYW4gdXAgQHRocm90dGxlZF9hdXRvbG9hZFxuXHRcdHN1cGVyKClcblxuXHRkZXN0cm95OiAtPlxuXHRcdGZvciBpdGVtLCBrZXkgaW4gQEl0ZW1zXG5cdFx0XHRpdGVtLiRlbC5jc3MgJ21pbi1oZWlnaHQnLCAnJ1xuXHRcdHN1cGVyKClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IExhenlfTWFzb25yeVxuIiwiJCA9IHJlcXVpcmUoICdqUXVlcnknIClcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcblxuXG5pbnN0YW5jZSA9IGZhbHNlXG5cbmRlc3Ryb3kgPSAtPlxuXHRyZXR1cm4gaWYgbm90IGluc3RhbmNlXG5cdGluc3RhbmNlLmRlc3Ryb3koKVxuXHRpbnN0YW5jZSA9IG51bGxcblxuY3JlYXRlID0gLT5cblxuXHQjIE1ha2Ugc3VyZSBhbiBpbnN0YW5jZSBkb2Vzbid0IGFscmVhZHkgZXhpc3Rcblx0ZGVzdHJveSgpXG5cblx0IyBIYW5kbGVyIHJlcXVpcmVkXG5cdEhhbmRsZXIgPSBIb29rcy5hcHBseUZpbHRlcnMgJ3Bob3J0LmxhenkuaGFuZGxlcicsIGZhbHNlXG5cdHJldHVybiBpZiBub3QgSGFuZGxlclxuXG5cdCMgQnkgZGVmYXVsdCBMYXp5X01hc29ucnkgaXMgaGFuZGxpbmcgTGF6eS1Mb2FkaW5nXG5cdCMgQ2hlY2sgaWYgYW55b25lIHdhbnRzIHRvIGhpamFjayBoYW5kbGVyXG5cdGluc3RhbmNlID0gbmV3IEhhbmRsZXIoKVxuXG5cdHJldHVyblxuXG5cbiMgSW5pdGlhbGl6ZSBsYXp5IGxvYWRlciBhZnRlciB0aGUgcG9ydGZvbGlvIGlzIHByZXBhcmVkLCBwID0gMTAwXG5Ib29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5wcmVwYXJlJywgY3JlYXRlLCAxMDBcbkhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLmRlc3Ryb3knLCBkZXN0cm95IiwiSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuXG4jIyNcblxuICAgICMgSW5pdGlhbGl6ZSBQb3J0Zm9saW8gQ29yZVxuXHQtLS1cblx0XHRVc2luZyBwNTAgQCBgcGhvcnQuY29yZS5yZWFkeWBcblx0XHRMYXRlIHByaW9yaXR5IGlzIGdvaW5nIHRvIGZvcmNlIGV4cGxpY2l0IHByaW9yaXR5IGluIGFueSBvdGhlciBtb3ZpbmcgcGFydHMgdGhhdCBhcmUgZ29pbmcgdG8gdG91Y2ggcG9ydGZvbGlvIGxheW91dCBhdCBgcGhvcnQubG9hZGVkYFxuXHQtLS1cblxuIyMjXG5jbGFzcyBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlclxuXG5cdHByZXBhcmU6IC0+XG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5wcmVwYXJlJ1xuXHRcdHJldHVyblxuXG5cdGNyZWF0ZTogLT5cblx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQucG9ydGZvbGlvLmNyZWF0ZSdcblx0XHRyZXR1cm5cblxuXG5cdHJlZnJlc2g6IC0+XG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5yZWZyZXNoJ1xuXHRcdHJldHVyblxuXG5cblx0ZGVzdHJveTogLT5cblx0XHQjIERlc3Ryb3lcblx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQucG9ydGZvbGlvLmRlc3Ryb3knXG5cdFx0cmV0dXJuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlciIsIkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcblxuXG4jIyNcblx0QWJzdHJhY3QgQ2xhc3MgUG9ydG9mbGlvX0V2ZW50X0ltZXBsZW1lbnRhdGlvblxuXG4gICAgSGFuZGxlcyBhbGwgdGhlIGV2ZW50cyByZXF1aXJlZCB0byBmdWxseSBoYW5kbGUgYSBwb3J0Zm9saW8gbGF5b3V0IHByb2Nlc3NcbiMjI1xuY2xhc3MgUG9ydGZvbGlvX0ludGVyZmFjZVxuXG5cdGNvbnN0cnVjdG9yOiAoIGFyZ3MgKSAtPlxuXHRcdEBzZXR1cF9hY3Rpb25zKClcblx0XHRAaW5pdGlhbGl6ZSggYXJncyApXG5cblx0c2V0dXBfYWN0aW9uczogLT5cblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5wcmVwYXJlJywgQHByZXBhcmUsIDUwXG5cdFx0SG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uY3JlYXRlJywgQGNyZWF0ZSwgNTBcblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5yZWZyZXNoJywgQHJlZnJlc2gsIDUwXG5cdFx0SG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScsIEBkZXN0cm95LCA1MFxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLmRlc3Ryb3knLCBAcHVyZ2VfYWN0aW9ucywgMTAwXG5cblx0cHVyZ2VfYWN0aW9uczogPT5cblx0XHRIb29rcy5yZW1vdmVBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5wcmVwYXJlJywgQHByZXBhcmUsIDUwXG5cdFx0SG9va3MucmVtb3ZlQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uY3JlYXRlJywgQGNyZWF0ZSwgNTBcblx0XHRIb29rcy5yZW1vdmVBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5yZWZyZXNoJywgQHJlZnJlc2gsIDUwXG5cdFx0SG9va3MucmVtb3ZlQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScsIEBkZXN0cm95LCA1MFxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLmRlc3Ryb3knLCBAcHVyZ2VfYWN0aW9ucywgMTAwXG5cblxuXHQjIyNcbiAgICBcdFJlcXVpcmUgdGhlc2UgbWV0aG9kc1xuXHQjIyNcblx0aW5pdGlhbGl6ZTogLT4gdGhyb3cgbmV3IEVycm9yKCBcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgaW5pdGlhbGl6ZWAgbWV0aG9kXCIgKVxuXHRwcmVwYXJlICAgOiAtPiB0aHJvdyBuZXcgRXJyb3IoIFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGBwcmVwYXJlYCBtZXRob2RcIiApXG5cdGNyZWF0ZSAgICA6IC0+IHRocm93IG5ldyBFcnJvciggXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYGNyZWF0ZWAgbWV0aG9kXCIgKVxuXHRyZWZyZXNoICAgOiAtPiB0aHJvdyBuZXcgRXJyb3IoIFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGByZWZyZXNoYCBtZXRob2RcIiApXG5cdGRlc3Ryb3kgICA6IC0+IHRocm93IG5ldyBFcnJvciggXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYGRlc3Ryb3lgIG1ldGhvZFwiIClcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gUG9ydGZvbGlvX0ludGVyZmFjZSIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuUG9ydGZvbGlvX0ludGVyZmFjZSA9IHJlcXVpcmUoICcuL1BvcnRmb2xpb19JbnRlcmZhY2UnIClcblxuIyBAVE9ETzogTmVlZCBhIGhlYXZ2eSByZWZhY3RvciAtIG5vIG1vcmUgY2xhc3NlcyBwbGVhc2VcbmNsYXNzIFBvcnRmb2xpb19NYXNvbnJ5IGV4dGVuZHMgUG9ydGZvbGlvX0ludGVyZmFjZVxuXG5cdGNvbnN0cnVjdG9yOiAtPlxuXG5cdFx0QEVsZW1lbnRzID1cblx0XHRcdGNvbnRhaW5lcjogJ1BQX01hc29ucnknXG5cdFx0XHRzaXplciAgICA6ICdQUF9NYXNvbnJ5X19zaXplcidcblx0XHRcdGl0ZW0gICAgIDogJ1BQX01hc29ucnlfX2l0ZW0nXG5cblx0XHRzdXBlcigpXG5cblx0IyMjXG5cdFx0SW5pdGlhbGl6ZVxuXHQjIyNcblx0aW5pdGlhbGl6ZTogLT5cblx0XHRAJGNvbnRhaW5lciA9ICQoIFwiLiN7QEVsZW1lbnRzLmNvbnRhaW5lcn1cIiApXG5cblx0IyMjXG5cdFx0UHJlcGFyZSAmIEF0dGFjaCBFdmVudHNcbiAgICBcdERvbid0IHNob3cgYW55dGhpbmcgeWV0LlxuXG5cdFx0QGNhbGxlZCBvbiBob29rIGBwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZWBcblx0IyMjXG5cdHByZXBhcmU6ID0+XG5cdFx0cmV0dXJuIGlmIEAkY29udGFpbmVyLmxlbmd0aCBpcyAwXG5cblx0XHRAJGNvbnRhaW5lci5hZGRDbGFzcyggJ1BQX0pTX19sb2FkaW5nX21hc29ucnknIClcblxuXHRcdEBtYXliZV9jcmVhdGVfc2l6ZXIoKVxuXG5cdFx0IyBPbmx5IGluaXRpYWxpemUsIGlmIG5vIG1hc29ucnkgZXhpc3RzXG5cdFx0bWFzb25yeV9zZXR0aW5ncyA9IEhvb2tzLmFwcGx5RmlsdGVycyAncGhvcnQubWFzb25yeS5zZXR0aW5ncycsXG5cdFx0XHRpdGVtU2VsZWN0b3I6IFwiLiN7QEVsZW1lbnRzLml0ZW19XCJcblx0XHRcdGNvbHVtbldpZHRoIDogXCIuI3tARWxlbWVudHMuc2l6ZXJ9XCJcblx0XHRcdGd1dHRlciAgICAgIDogMFxuXHRcdFx0aW5pdExheW91dCAgOiBmYWxzZVxuXG5cdFx0QCRjb250YWluZXIubWFzb25yeSggbWFzb25yeV9zZXR0aW5ncyApXG5cblx0XHRAJGNvbnRhaW5lci5tYXNvbnJ5ICdvbmNlJywgJ2xheW91dENvbXBsZXRlJywgPT5cblx0XHRcdEAkY29udGFpbmVyXG5cdFx0XHRcdC5yZW1vdmVDbGFzcyggJ1BQX0pTX19sb2FkaW5nX21hc29ucnknIClcblx0XHRcdFx0LmFkZENsYXNzKCAnUFBfSlNfX2xvYWRpbmdfY29tcGxldGUnIClcblxuXHRcdFx0IyBAdHJpZ2dlciByZWZyZXNoIGV2ZW50XG5cdFx0XHQjIHRyaWdnZXJzIGBAcmVmcmVzaCgpYFxuXHRcdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5yZWZyZXNoJ1xuXG5cblx0IyMjXG5cdFx0U3RhcnQgdGhlIFBvcnRmb2xpb1xuXHRcdEBjYWxsZWQgb24gaG9vayBgcGhvcnQucG9ydGZvbGlvLmNyZWF0ZWBcblx0IyMjXG5cdGNyZWF0ZTogPT5cblx0XHRAJGNvbnRhaW5lci5tYXNvbnJ5KClcblx0XHRyZXR1cm5cblxuXG5cdCMjI1xuXHRcdERlc3Ryb3lcblx0XHRAY2FsbGVkIG9uIGhvb2sgYHBob3J0LnBvcnRmb2xpby5kZXN0cm95YFxuXHQjIyNcblx0ZGVzdHJveTogPT5cblx0XHRAbWF5YmVfcmVtb3ZlX3NpemVyKClcblxuXHRcdGlmIEAkY29udGFpbmVyLmxlbmd0aCA+IDBcblx0XHRcdEAkY29udGFpbmVyLm1hc29ucnkoICdkZXN0cm95JyApXG5cblxuXHRcdHJldHVyblxuXG5cblx0IyMjXG5cdFx0UmVsb2FkIHRoZSBsYXlvdXRcblx0XHRAY2FsbGVkIG9uIGhvb2sgYHBob3J0LnBvcnRmb2xpby5yZWZyZXNoYFxuXHQjIyNcblx0cmVmcmVzaDogPT5cblx0XHRAJGNvbnRhaW5lci5tYXNvbnJ5KCAnbGF5b3V0JyApXG5cblxuXG5cdCMjI1xuXHRcdENyZWF0ZSBhIHNpemVyIGVsZW1lbnQgZm9yIGpxdWVyeS1tYXNvbnJ5IHRvIHVzZVxuXHQjIyNcblx0bWF5YmVfY3JlYXRlX3NpemVyOiAtPlxuXHRcdEBjcmVhdGVfc2l6ZXIoKSBpZiBAc2l6ZXJfZG9lc250X2V4aXN0KClcblx0XHRyZXR1cm5cblxuXHRtYXliZV9yZW1vdmVfc2l6ZXI6IC0+XG5cdFx0cmV0dXJuIGlmIEAkY29udGFpbmVyLmxlbmd0aCBpc250IDFcblx0XHRAJGNvbnRhaW5lci5maW5kKCBcIi4je0BFbGVtZW50cy5zaXplcn1cIiApLnJlbW92ZSgpXG5cdFx0cmV0dXJuXG5cblx0c2l6ZXJfZG9lc250X2V4aXN0OiAtPiBAJGNvbnRhaW5lci5maW5kKCBcIi4je0BFbGVtZW50cy5zaXplcn1cIiApLmxlbmd0aCBpcyAwXG5cblxuXHRjcmVhdGVfc2l6ZXI6IC0+XG5cdFx0QCRjb250YWluZXIuYXBwZW5kIFwiXCJcIjxkaXYgY2xhc3M9XCIje0BFbGVtZW50cy5zaXplcn1cIj48L2Rpdj5cIlwiXCJcblxuXHRcdHJldHVyblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBvcnRmb2xpb19NYXNvbnJ5IiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcblBvcnRmb2xpb19FdmVudF9NYW5hZ2VyID0gcmVxdWlyZSggJy4vUG9ydGZvbGlvX0V2ZW50X01hbmFnZXInIClcbiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5cbiMgUG9ydGZvbGlvIG1hbmFnZXIgd2lsbCB0cmlnZ2VyIHBvcnRmb2xpbyBldmVudHMgd2hlbiBuZWNlc3NhcnlcblBvcnRmb2xpbyA9IG5ldyBQb3J0Zm9saW9fRXZlbnRfTWFuYWdlcigpXG5cblxuaXNfbWFzb25yeSA9IC0+XG5cdHJldHVybiAoICQoICcuUFBfTWFzb25yeScgKS5sZW5ndGggaXNudCAwIClcblxuIyBTdGFydCBNYXNvbnJ5IExheW91dFxuc3RhcnRfbWFzb25yeSA9IC0+XG5cdHJldHVybiBmYWxzZSBpZiBub3QgaXNfbWFzb25yeSgpXG5cblx0UG9ydGZvbGlvX01hc29ucnkgPSByZXF1aXJlKCAnLi9Qb3J0Zm9saW9fTWFzb25yeScgKVxuXHRuZXcgUG9ydGZvbGlvX01hc29ucnkoKVxuXG5tYXliZV9sYXp5X21hc29ucnkgPSAoIGhhbmRsZXIgKSAtPlxuXHQjIFVzZSBMYXp5X01hc29ucnkgaGFuZGxlciwgaWYgY3VycmVudCBsYXlvdXQgaXMgbWFzb25yeVxuXHRyZXR1cm4gcmVxdWlyZSggJ2xhenkvTGF6eV9NYXNvbnJ5JyApIGlmIGlzX21hc29ucnkoKVxuXHRyZXR1cm4gaGFuZGxlclxuXG5cbiMgU3RhcnQgUG9ydGZvbGlvXG5Ib29rcy5hZGRBY3Rpb24gJ3Bob3J0LmNvcmUucmVhZHknLCBQb3J0Zm9saW8ucHJlcGFyZSwgNTBcbkhvb2tzLmFkZEFjdGlvbiAncGhvcnQuY29yZS5sb2FkZWQnLCBQb3J0Zm9saW8uY3JlYXRlLCA1MFxuXG4jIEluaXRpYWxpemUgTWFzb25yeSBMYXlvdXRcbkhvb2tzLmFkZEFjdGlvbiAncGhvcnQuY29yZS5yZWFkeScsIHN0YXJ0X21hc29ucnlcblxuIyBJbml0aWFsaXplIExhenkgTG9hZGluZyBmb3IgTWFzb25yeSBMYXlvdXRcbkhvb2tzLmFkZEZpbHRlciAncGhvcnQubGF6eS5oYW5kbGVyJywgbWF5YmVfbGF6eV9tYXNvbnJ5XG5cblxuXG4iXX0=
