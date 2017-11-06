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

},{"./core/Photography_Portfolio":2,"./gallery/gallery_item_data":8,"./gallery/gallery_item_factory":9,"./gallery/start":11,"./lazy/Abstract_Lazy_Loader":12,"./lazy/start":14,"./portfolio/Portfolio_Interface":16,"./portfolio/start":18}],2:[function(require,module,exports){
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
var setup_driver, setup_factory;

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

module.exports = function() {
  var gallery_driver, gallery_factory;
  gallery_driver = setup_driver(window.__phort.popup_gallery);
  gallery_factory = setup_factory();
  return gallery_factory(gallery_driver);
};


},{"./adapters/lightgallery":5,"./adapters/photoswipe":6,"./gallery_factory":7}],11:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var $, Gallery, Hooks;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Gallery = require('./prepare_gallery_factory');

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

},{"../core/Utilities":3,"../core/Window":4,"../gallery/gallery_item_factory":9}],13:[function(require,module,exports){
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

},{"../core/Window":4,"./Abstract_Lazy_Loader":12}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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

},{"./Portfolio_Event_Manager":15,"./Portfolio_Masonry":17,"lazy/Lazy_Masonry":13}]},{},[1])


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jb3JlL1Bob3RvZ3JhcGh5X1BvcnRmb2xpby5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY29yZS9VdGlsaXRpZXMuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY29yZS9XaW5kb3cuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvYWRhcHRlcnMvbGlnaHRnYWxsZXJ5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9nYWxsZXJ5L2FkYXB0ZXJzL3Bob3Rvc3dpcGUuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvZ2FsbGVyeV9mYWN0b3J5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9nYWxsZXJ5L2dhbGxlcnlfaXRlbV9kYXRhLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9nYWxsZXJ5L2dhbGxlcnlfaXRlbV9mYWN0b3J5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9nYWxsZXJ5L3ByZXBhcmVfZ2FsbGVyeV9mYWN0b3J5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9nYWxsZXJ5L3N0YXJ0LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0Fic3RyYWN0X0xhenlfTG9hZGVyLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0xhenlfTWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvbGF6eS9zdGFydC5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL1BvcnRmb2xpb19FdmVudF9NYW5hZ2VyLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9wb3J0Zm9saW8vUG9ydGZvbGlvX0ludGVyZmFjZS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL1BvcnRmb2xpb19NYXNvbnJ5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9wb3J0Zm9saW8vc3RhcnQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTs7O0FBQUEsSUFBQTs7QUFHQSxLQUFBLEdBQVEsT0FBQSxDQUFTLFVBQVQ7O0FBQ1IsQ0FBQSxHQUFJLE9BQUEsQ0FBUyxRQUFUOztBQUlKLE1BQU0sQ0FBQyxVQUFQLEdBRUM7RUFBQSxtQkFBQSxFQUFxQixPQUFBLENBQVMsaUNBQVQsQ0FBckI7RUFHQSxPQUFBLEVBQ0M7SUFBQSxTQUFBLEVBQVcsT0FBQSxDQUFTLDZCQUFULENBQVg7SUFDQSxZQUFBLEVBQWMsT0FBQSxDQUFRLGdDQUFSLENBRGQ7R0FKRDtFQVFBLG9CQUFBLEVBQXNCLE9BQUEsQ0FBUyw2QkFBVCxDQVJ0Qjs7OztBQVVEOzs7O0FBS0EsT0FBQSxDQUFRLG1CQUFSOztBQUdBLE9BQUEsQ0FBUSxpQkFBUjs7QUFHQSxPQUFBLENBQVEsY0FBUjs7O0FBS0E7Ozs7QUFHQSxDQUFBLENBQUcsUUFBSCxDQUFhLENBQUMsS0FBZCxDQUFvQixTQUFBO0FBR25CLE1BQUE7RUFBQSxJQUFVLENBQUksQ0FBQSxDQUFHLE1BQUgsQ0FBVyxDQUFDLFFBQVosQ0FBc0IsY0FBdEIsQ0FBZDtBQUFBLFdBQUE7O0VBR0EscUJBQUEsR0FBd0IsSUFBSSxDQUFFLE9BQUEsQ0FBUyw4QkFBVCxDQUFGLENBQUosQ0FBQTtFQUN4QixxQkFBcUIsQ0FBQyxLQUF0QixDQUFBO0FBUG1CLENBQXBCOzs7Ozs7OztBQ3ZDQTs7O0FBQUEsSUFBQSxjQUFBO0VBQUE7O0FBR0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUyxRQUFUOztBQUNKLEtBQUEsR0FBUSxPQUFBLENBQVMsVUFBVDs7QUFHRjtFQUVRLGNBQUE7OztJQUNaLEtBQUssQ0FBQyxTQUFOLENBQWdCLGtCQUFoQixFQUFvQyxJQUFD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QUFwQjtBQUFBLFdBQU8sTUFBUDs7RUFFQSxpQkFBQSxHQUFvQixPQUFBLENBQVMscUJBQVQ7U0FDcEIsSUFBSSxpQkFBSixDQUFBO0FBSmU7O0FBTWhCLGtCQUFBLEdBQXFCLFNBQUUsT0FBRjtFQUVwQixJQUF5QyxVQUFBLENBQUEsQ0FBekM7QUFBQSxXQUFPLE9BQUEsQ0FBUyxtQkFBVCxFQUFQOztBQUNBLFNBQU87QUFIYTs7QUFPckIsS0FBSyxDQUFDLFNBQU4sQ0FBZ0Isa0JBQWhCLEVBQW9DLFNBQVMsQ0FBQyxPQUE5QyxFQUF1RCxFQUF2RDs7QUFDQSxLQUFLLENBQUMsU0FBTixDQUFnQixtQkFBaEIsRUFBcUMsU0FBUyxDQUFDLE1BQS9DLEVBQXVELEVBQXZEOztBQUdBLEtBQUssQ0FBQyxTQUFOLENBQWdCLGtCQUFoQixFQUFvQyxhQUFwQzs7QUFHQSxLQUFLLENBQUMsU0FBTixDQUFnQixvQkFBaEIsRUFBc0Msa0JBQXRDIiwiZmlsZSI6InBob3RvZ3JhcGh5LXBvcnRmb2xpby5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiIyMjXG4gICAgTG9hZCBEZXBlbmRlbmNpZXNcbiMjI1xuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuJCA9IHJlcXVpcmUoICdqUXVlcnknIClcblxuXG4jIEV4cG9zZSBzb21lIFBob3RvZ3JhcGh5IFBvcnRmb2xpbyBtb2R1bGVzIHRvIHRoZSBwdWJsaWMgZm9yIGV4dGVuc2liaWxpdHlcbndpbmRvdy5QUF9Nb2R1bGVzID1cblx0IyBFeHRlbmQgUG9ydGZvbGlvIEludGVyZmFjZSB0byBidWlsZCBjdXN0b20gcG9ydGZvbGlvIGxheW91dHMgYmFzZWQgb24gUFAgRXZlbnRzXG5cdFBvcnRmb2xpb19JbnRlcmZhY2U6IHJlcXVpcmUoICcuL3BvcnRmb2xpby9Qb3J0Zm9saW9fSW50ZXJmYWNlJyApXG5cblx0IyBVc2UgYGdhbGxlcnlfaXRlbV9kYXRhYCB0byBnZXQgZm9ybWF0dGVkIGl0ZW0gaW1hZ2Ugc2l6ZXMgZm9yIGxhenkgbG9hZGluZ1xuXHRnYWxsZXJ5OlxuXHRcdGl0ZW1fZGF0YTogcmVxdWlyZSggJy4vZ2FsbGVyeS9nYWxsZXJ5X2l0ZW1fZGF0YScgKVxuXHRcdGl0ZW1fZmFjdG9yeTogcmVxdWlyZSgnLi9nYWxsZXJ5L2dhbGxlcnlfaXRlbV9mYWN0b3J5JylcblxuXHQjIEV4dGVuZCBBYnN0cmFjdF9MYXp5X0xvZGVyIHRvIGltcGxlbWVudCBsYXp5IGxvYWRlciBmb3IgeW91ciBsYXlvdXRcblx0QWJzdHJhY3RfTGF6eV9Mb2FkZXI6IHJlcXVpcmUoICcuL2xhenkvQWJzdHJhY3RfTGF6eV9Mb2FkZXInIClcblxuIyMjXG5cdEluY2x1ZGVzXG4jIyNcblxuIyBTdGFydCBQb3J0Zm9saW9cbnJlcXVpcmUgJy4vcG9ydGZvbGlvL3N0YXJ0J1xuXG4jIEdhbGxlcnlcbnJlcXVpcmUgJy4vZ2FsbGVyeS9zdGFydCdcblxuIyBMYXp5IExvYWRpbmdcbnJlcXVpcmUgJy4vbGF6eS9zdGFydCdcblxuXG5cblxuIyMjXG5cdEJvb3Qgb24gYGRvY3VtZW50LnJlYWR5YFxuIyMjXG4kKCBkb2N1bWVudCApLnJlYWR5IC0+XG5cblx0IyBPbmx5IHJ1biB0aGlzIHNjcmlwdCB3aGVuIGJvZHkgaGFzIGBQUF9Qb3J0Zm9saW9gIGNsYXNzXG5cdHJldHVybiBpZiBub3QgJCggJ2JvZHknICkuaGFzQ2xhc3MoICdQUF9Qb3J0Zm9saW8nIClcblxuXHQjIEJvb3Rcblx0UGhvdG9ncmFwaHlfUG9ydGZvbGlvID0gbmV3ICggcmVxdWlyZSggJy4vY29yZS9QaG90b2dyYXBoeV9Qb3J0Zm9saW8nICkgKSgpXG5cdFBob3RvZ3JhcGh5X1BvcnRmb2xpby5yZWFkeSgpXG5cblx0cmV0dXJuIiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5cblxuY2xhc3MgQ29yZVxuXG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQuY29yZS5yZWFkeScsIEB3YWl0X2Zvcl9sb2FkXG5cblx0IyBUcmlnZ2VyIHBob3J0LmNvcmUucmVhZHlcblx0cmVhZHk6ID0+XG5cdFx0aWYgSG9va3MuYXBwbHlGaWx0ZXJzKCAncGhvcnQuY29yZS5yZWFkeScsIHRydWUgKVxuXHRcdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LmNvcmUucmVhZHknXG5cdFx0cmV0dXJuXG5cblx0d2FpdF9mb3JfbG9hZDogPT5cblx0XHQjIFRyaWdnZXIgaW1hZ2VzTG9hZGVkIGV2ZW50IHdoZW4gaW1hZ2VzIGhhdmUgbG9hZGVkXG5cdFx0JCggJy5QUF9XcmFwcGVyJyApLmltYWdlc0xvYWRlZCggQGxvYWRlZCApXG5cblx0IyBUcmlnZ2VyIHBob3J0LmNvcmUubG9hZGVkXG5cdGxvYWRlZDogLT5cblx0XHRpZiBIb29rcy5hcHBseUZpbHRlcnMoICdwaG9ydC5jb3JlLmxvYWRlZCcsIHRydWUgKVxuXHRcdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LmNvcmUubG9hZGVkJ1xuXG5cdFx0cmV0dXJuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBDb3JlIiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cblxuICAgIC8qKlxuICAgICAqIFRoYW5rIHlvdSBSdXNzIGZvciBoZWxwaW5nIG1lIGF2b2lkIHdyaXRpbmcgdGhpcyBteXNlbGY6XG4gICAgICogQHVybCBodHRwczovL3JlbXlzaGFycC5jb20vMjAxMC8wNy8yMS90aHJvdHRsaW5nLWZ1bmN0aW9uLWNhbGxzLyNjb21tZW50LTI3NDU2NjM1OTRcbiAgICAgKi9cbiAgICB0aHJvdHRsZTogZnVuY3Rpb24gKCBmbiwgdGhyZXNoaG9sZCwgc2NvcGUgKSB7XG4gICAgICAgIHRocmVzaGhvbGQgfHwgKHRocmVzaGhvbGQgPSAyNTApXG4gICAgICAgIHZhciBsYXN0LFxuICAgICAgICAgICAgZGVmZXJUaW1lclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGNvbnRleHQgPSBzY29wZSB8fCB0aGlzXG5cbiAgICAgICAgICAgIHZhciBub3cgID0gK25ldyBEYXRlLFxuICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmd1bWVudHNcbiAgICAgICAgICAgIGlmICggbGFzdCAmJiBub3cgPCBsYXN0ICsgdGhyZXNoaG9sZCApIHtcbiAgICAgICAgICAgICAgICAvLyBob2xkIG9uIHRvIGl0XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KCBkZWZlclRpbWVyIClcbiAgICAgICAgICAgICAgICBkZWZlclRpbWVyID0gc2V0VGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBsYXN0ID0gbm93XG4gICAgICAgICAgICAgICAgICAgIGZuLmFwcGx5KCBjb250ZXh0LCBhcmdzIClcbiAgICAgICAgICAgICAgICB9LCB0aHJlc2hob2xkICsgbGFzdCAtIG5vdyApXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxhc3QgPSBub3dcbiAgICAgICAgICAgICAgICBmbi5hcHBseSggY29udGV4dCwgYXJncyApXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cblxufSIsIkhvb2tzID0gcmVxdWlyZSggJ3dwX2hvb2tzJyApXG5cblxuZ2V0X3NpemUgPSAtPlxuXHR3aWR0aCA6IHdpbmRvdy5pbm5lcldpZHRoIHx8ICR3aW5kb3cud2lkdGgoKVxuXHRoZWlnaHQ6IHdpbmRvdy5pbm5lckhlaWdodCB8fCAkd2luZG93LmhlaWdodCgpXG5cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRfc2l6ZSgpIiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCBcImpRdWVyeVwiIClcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcblxuZGVmYXVsdHMgPVxuXHRkeW5hbWljIDogdHJ1ZVxuXHRzcGVlZCAgIDogMzUwXG5cdHByZWxvYWQgOiAzXG5cdGRvd25sb2FkOiBmYWxzZVxuXHRlc2NLZXkgIDogZmFsc2UgIyBXZSdyZSByb2xsaW5nIG91ciBvd25cblxuXHR0aHVtYm5haWwgICAgICAgICA6IHRydWVcblx0c2hvd1RodW1iQnlEZWZhdWx0OiB0cnVlXG5cbiMgQFRPRE86IFVzZSBPYmplY3QuYXNzaWduKCkgd2l0aCBCYWJlbFxuc2V0dGluZ3MgPSAkLmV4dGVuZCgge30sIGRlZmF1bHRzLCB3aW5kb3cuX19waG9ydC5saWdodEdhbGxlcnkgKVxuXG5cbnNpbmdsZV9pdGVtX2RhdGEgPSAoIGl0ZW0gKSAtPlxuXG5cdGlmIGl0ZW0uZGF0YS5nZXQoICd0eXBlJyApIGlzICd2aWRlbydcblx0XHRmdWxsID0gaXRlbS5kYXRhLmdldCggJ3ZpZGVvX3VybCcgKVxuXHRlbHNlXG5cdFx0ZnVsbCA9IGl0ZW0uZGF0YS51cmwoICdmdWxsJyApXG5cblx0cmV0dXJuIHtcblx0XHRzcmMgICAgOiBmdWxsXG5cdFx0dGh1bWIgIDogaXRlbS5kYXRhLnVybCggJ3RodW1iJyApXG5cdFx0c3ViSHRtbDogaXRlbS5jYXB0aW9uXG5cdH1cblxuXG5nZXRfc2V0dGluZ3MgPSAoIGdhbGxlcnksIGluZGV4ICkgLT5cblx0c2V0dGluZ3MuaW5kZXggICAgICAgICA9IGluZGV4XG5cdHNldHRpbmdzLmR5bmFtaWNFbCAgICAgPSBnYWxsZXJ5Lm1hcCggc2luZ2xlX2l0ZW1fZGF0YSApXG5cdHNldHRpbmdzLnZpZGVvTWF4V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCAqIDAuOFxuXG5cdEhvb2tzLmFwcGx5RmlsdGVycyAncGhvcnQubGlnaHRHYWxsZXJ5LnNldHRpbmdzJywgc2V0dGluZ3NcblxuXG5tb2R1bGUuZXhwb3J0cyA9ICggJGVsICkgLT5cblx0Y2xvc2U6IC0+XG5cdFx0R2FsbGVyeSA9ICRlbC5kYXRhKCAnbGlnaHRHYWxsZXJ5JyApXG5cdFx0R2FsbGVyeS5kZXN0cm95KCApIGlmIEdhbGxlcnkgYW5kIEdhbGxlcnkuZGVzdHJveT9cblxuXHRvcGVuOiAoIGdhbGxlcnlfaXRlbXMsIGluZGV4ICkgLT5cblx0XHRHYWxsZXJ5ID0gJGVsLmxpZ2h0R2FsbGVyeSggZ2V0X3NldHRpbmdzKCBnYWxsZXJ5X2l0ZW1zLCBpbmRleCApIClcblxuXG5cblxuIiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCBcImpRdWVyeVwiIClcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcblxubGFiZWxzID0gJC5leHRlbmQoIHt9LCB7XG5cdCdmYWNlYm9vayc6ICdTaGFyZSBvbiBGYWNlYm9vaycsXG5cdCd0d2l0dGVyJzogJ1R3ZWV0Jyxcblx0J3BpbnRlcmVzdCc6ICdQaW4gaXQnLFxufSwgd2luZG93Ll9fcGhvcnQuaTE4bi5waG90b3N3aXBlIClcblxuXG5kZWZhdWx0cyA9XG5cdGluZGV4ICAgICAgIDogMFxuXHRwcmVsb2FkICAgICA6IFsgMSwgMyBdXG5cdGVzY0tleSAgICAgIDogZmFsc2Vcblx0c2hhcmVCdXR0b25zOiBbXG5cdFx0eyBpZDogJ2ZhY2Vib29rJywgbGFiZWw6IGxhYmVscy5mYWNlYm9vaywgdXJsOiAnaHR0cHM6Ly93d3cuZmFjZWJvb2suY29tL3NoYXJlci9zaGFyZXIucGhwP3U9e3t1cmx9fScgfVxuXHRcdHsgaWQ6ICd0d2l0dGVyJywgbGFiZWwgOiBsYWJlbHMudHdpdHRlciwgdXJsOiAnaHR0cHM6Ly90d2l0dGVyLmNvbS9pbnRlbnQvdHdlZXQ/dGV4dD17e3RleHR9fSZ1cmw9e3t1cmx9fScgfVxuXHRcdHsgaWQ6ICdwaW50ZXJlc3QnLCBsYWJlbDogbGFiZWxzLnBpbnRlcmVzdCwgdXJsOiAnaHR0cDovL3d3dy5waW50ZXJlc3QuY29tL3Bpbi9jcmVhdGUvYnV0dG9uLz91cmw9e3t1cmx9fSZtZWRpYT17e2ltYWdlX3VybH19JmRlc2NyaXB0aW9uPXt7dGV4dH19JyB9XG5cdF1cblxuXG5wc3dwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvciggJy5wc3dwJyApXG5VSSA9IEhvb2tzLmFwcGx5RmlsdGVycyggXCJwaG9ydC5waG90b3N3aXBlLlVJXCIsIHdpbmRvdy5QaG90b1N3aXBlVUlfRGVmYXVsdCApXG5QaG90b1N3aXBlID0gd2luZG93LlBob3RvU3dpcGVcblxuXG5jcmVhdGUgPSAoIGRhdGEsIG9wdHMgPSB7fSApIC0+XG5cdG9wdGlvbnMgPSBIb29rcy5hcHBseUZpbHRlcnMoIFwicGhvcnQucGhvdG9zd2lwZS5vcHRpb25zXCIsICQuZXh0ZW5kKCB7fSwgZGVmYXVsdHMsIG9wdHMgKSApXG5cblx0IyBJbmRleCBpcyAwIGJ5IGRlZmF1bHRcblx0aWYgbm90IG9wdGlvbnMuaW5kZXg/XG5cdFx0b3B0aW9ucy5pbmRleCA9IDBcblxuXHQjIFNldCB0aGUgaW5kZXggdG8gMCBpZiBpdCBpc24ndCBhIHByb3BlciB2YWx1ZVxuXHRpZiBub3Qgb3B0aW9ucy5pbmRleCBvciBvcHRpb25zLmluZGV4IDwgMFxuXHRcdG9wdGlvbnMuaW5kZXggPSAwXG5cblx0aW5zdGFuY2UgPSBuZXcgUGhvdG9Td2lwZSggcHN3cCwgVUksIGRhdGEsIG9wdGlvbnMgKVxuXHRpbnN0YW5jZS5pbml0KCApXG5cblx0cmV0dXJuIGluc3RhbmNlXG5cblxuc2luZ2xlX2l0ZW1fZGF0YSA9ICggaXRlbSApIC0+XG5cdCMgUGhvdG9Td2lwZSBzdXBwb3J0cyBvbmx5IGltYWdlc1xuXHRyZXR1cm4gaWYgaXRlbS5kYXRhLmdldCggJ3R5cGUnICkgaXNudCAnaW1hZ2UnXG5cblxuXHRbd2lkdGgsIGhlaWdodF0gPSBpdGVtLmRhdGEuc2l6ZSggJ2Z1bGwnIClcblxuXHQjIHJldHVyblxuXHRzcmMgIDogaXRlbS5kYXRhLnVybCggJ2Z1bGwnIClcblx0bXNyYyA6IGl0ZW0uZGF0YS51cmwoICdmdWxsJyApXG5cdHcgICAgOiB3aWR0aFxuXHRoICAgIDogaGVpZ2h0XG5cdHRpdGxlOiBpdGVtLmNhcHRpb25cblxuXG50aHVtYm5haWxfcG9zaXRpb24gPSAoICRnYWxsZXJ5ICkgLT4gcmV0dXJuICggaW5kZXggKSAtPlxuXHRyZXR1cm4gZmFsc2UgaWYgbm90ICRnYWxsZXJ5Lmxlbmd0aFxuXG5cdCRlbCA9ICRnYWxsZXJ5LmVxKCBpbmRleCApXG5cdHRodW1ibmFpbCA9ICRlbC5maW5kKCAnaW1nJyApLmdldCggMCApXG5cblx0IyBUaHVtYm5haWwgbXVzdCBleGlzdCBiZWZvcmUgZGltZW5zaW9ucyBjYW4gYmUgb2J0YWluZWRcblx0cmV0dXJuIGlmIG5vdCB0aHVtYm5haWxcblxuXHRwYWdlWVNjcm9sbCA9IHdpbmRvdy5wYWdlWU9mZnNldCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wXG5cdHJlY3QgPSB0aHVtYm5haWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCApXG5cblx0IyAvLyB3ID0gd2lkdGhcblx0b3V0ID1cblx0XHR4OiByZWN0LmxlZnRcblx0XHR5OiByZWN0LnRvcCArIHBhZ2VZU2Nyb2xsXG5cdFx0dzogcmVjdC53aWR0aFxuXG5cdHJldHVybiBvdXRcblxuXG5tb2R1bGUuZXhwb3J0cyA9ICggJGVsICkgLT5cblx0R2FsbGVyeSA9IGZhbHNlXG5cblx0Y2xvc2U6IC0+XG5cdFx0cmV0dXJuIGlmIG5vdCBHYWxsZXJ5XG5cdFx0R2FsbGVyeS5jbG9zZSggKVxuXHRcdEdhbGxlcnkgPSBmYWxzZVxuXG5cdG9wZW46ICggZ2FsbGVyeSwgaW5kZXggKSAtPlxuXHRcdG9wdGlvbnMgPVxuXHRcdFx0Z2V0VGh1bWJCb3VuZHNGbjogdGh1bWJuYWlsX3Bvc2l0aW9uKCAkZWwuY2xvc2VzdCggJy5QUF9HYWxsZXJ5JyApLmZpbmQoICcuUFBfR2FsbGVyeV9faXRlbScgKSApXG5cdFx0XHRpbmRleCAgICAgICAgICAgOiBpbmRleFxuXG5cdFx0R2FsbGVyeSA9IGNyZWF0ZSggZ2FsbGVyeS5tYXAoIHNpbmdsZV9pdGVtX2RhdGEgKSwgb3B0aW9ucyApXG5cblxuXG4iLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuJCA9IHJlcXVpcmUoICdqUXVlcnknIClcbkhvb2tzID0gcmVxdWlyZSggJ3dwX2hvb2tzJyApXG5nYWxlcnlfaXRlbV9kYXRhID0gcmVxdWlyZSggJy4vZ2FsbGVyeV9pdGVtX2ZhY3RvcnknIClcblxuXG5cbnBhcnNlX2dhbGxlcnlfaXRlbSA9ICgga2V5LCBlbCApIC0+XG5cdCRlbCA9ICQoIGVsIClcblxuXHRpbmRleCAgOiBrZXlcblx0ZGF0YSAgIDogZ2FsZXJ5X2l0ZW1fZGF0YSggJGVsIClcblx0Y2FwdGlvbjogJGVsLmZpbmQoICcuUFBfR2FsbGVyeV9fY2FwdGlvbicgKS5odG1sKCApIHx8ICcnXG5cblxubW9kdWxlLmV4cG9ydHMgPSAoIEdhbGxlcnlfRHJpdmVyICkgLT5cblx0aW5zdGFuY2UgPSBmYWxzZVxuXG5cdG9wZW4gPSAoZWwpIC0+XG5cdFx0JGVsID0gJCggZWwgKVxuXHRcdCRpdGVtcyA9ICRlbC5jbG9zZXN0KCAnLlBQX0dhbGxlcnknICkuZmluZCggJy5QUF9HYWxsZXJ5X19pdGVtJyApXG5cblx0XHRpZiAkaXRlbXMubGVuZ3RoID4gMFxuXHRcdFx0aW5kZXggPSAkaXRlbXMuaW5kZXgoICRlbCApXG5cdFx0XHRnYWxsZXJ5X2l0ZW1zID0gJC5tYWtlQXJyYXkoICRpdGVtcy5tYXAoIHBhcnNlX2dhbGxlcnlfaXRlbSApIClcblxuXHRcdFx0aW5zdGFuY2UgPSBHYWxsZXJ5X0RyaXZlciggJGVsIClcblx0XHRcdGluc3RhbmNlLm9wZW4oIGdhbGxlcnlfaXRlbXMsIGluZGV4IClcblxuXG5cdG9wZW46IG9wZW5cblxuXHRoYW5kbGVfaGFzaDogLT5cblx0XHRpbmRleCA9IHBhcnNlSW50KCB3aW5kb3cubG9jYXRpb24uaGFzaC5zcGxpdCggJyZwaWQ9JyApWyAxIF0sIDEwIClcblx0XHRlbCA9ICQoICcuUFBfR2FsbGVyeScgKS5maXJzdCggKS5maW5kKCAnLlBQX0dhbGxlcnlfX2l0ZW0nICkuZ2V0KCBpbmRleCApXG5cdFx0b3BlbiggZWwgKVxuXG5cdGNsb3NlOiAtPlxuXHRcdHJldHVybiBmYWxzZSBpZiBub3QgaW5zdGFuY2VcblxuXHRcdGluc3RhbmNlLmNsb3NlKCApXG5cdFx0aW5zdGFuY2UgPSBmYWxzZSIsIml0ZW1fZGF0YSA9ICggZGF0YV9vYmogKSAtPlxuXG5cdHBsdWNrID0gKCBvYmplY3QsIGtleSApIC0+XG5cdFx0aWYgb2JqZWN0IGFuZCBvYmplY3RbIGtleSBdXG5cdFx0XHRyZXR1cm4gb2JqZWN0WyBrZXkgXVxuXHRcdHJldHVybiBmYWxzZVxuXG5cdGdldCA9ICgga2V5ICkgLT4gcGx1Y2soIGRhdGFfb2JqLCBrZXkgKVxuXG5cdGltYWdlID0gKCBzaXplX25hbWUgKSAtPiBwbHVjayggZ2V0KCAnaW1hZ2VzJyApLCBzaXplX25hbWUgKVxuXG5cblx0c2l6ZTogKCBzaXplX25hbWUgKSAtPlxuXHRcdGltYWdlX3NpemUgPSBwbHVjayggaW1hZ2UoIHNpemVfbmFtZSApLCAnc2l6ZScgKVxuXHRcdHJldHVybiBmYWxzZSBpZiBub3QgaW1hZ2Vfc2l6ZVxuXG5cdFx0W3dpZHRoLCBoZWlnaHRdID0gaW1hZ2Vfc2l6ZS5zcGxpdCggJ3gnIClcblxuXHRcdHdpZHRoID0gcGFyc2VJbnQoIHdpZHRoIClcblx0XHRoZWlnaHQgPSBwYXJzZUludCggaGVpZ2h0IClcblxuXHRcdHJldHVybiBbIHdpZHRoLCBoZWlnaHQgXVxuXG5cdHVybDogKCBzaXplX25hbWUgKSAtPiBwbHVjayggaW1hZ2UoIHNpemVfbmFtZSApLCAndXJsJyApXG5cdGdldDogZ2V0XG5cblxubW9kdWxlLmV4cG9ydHMgPSBpdGVtX2RhdGEiLCJpdGVtID0gcmVxdWlyZSgnLi9nYWxsZXJ5X2l0ZW1fZGF0YScpXG5cbml0ZW1fZGF0YSA9ICggJGVsICkgLT5cblx0ZGF0YV9vYmogPSAkZWwuZGF0YSggJ2l0ZW0nIClcblxuXHRpZiBub3QgZGF0YV9vYmpcblx0XHR0aHJvdyBuZXcgRXJyb3IgXCJFbGVtZW50IGRvZXNuJ3QgY29udGFpbiBgZGF0YS1pdGVtYCBhdHRyaWJ1dGVcIlxuXG5cdHJldHVybiBpdGVtKCBkYXRhX29iaiApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBpdGVtX2RhdGEiLCIjXG4jIFRoaXMgZmlsZSBpcyBnb2luZyB0byByZXR1cm4gYSBbR2FsbGVyeSBGYWN0b3J5XSBpbnN0YW5jZVxuIyBFYXN5IFBob3RvZ3JhcGh5IFBvcnRmb2xpbyBpcyB1c2luZyB0aGF0IHRvIG9wZW4vY2xvc2UvZGVzdHJveSBnYWxsZXJpZXNcbiNcbiMgW0dhbGxlcnkgRmFjdG9yeV0gcmVsaWVzIG9uIGEgW0FkYXB0ZXJdXG4jIEluc3RlYWQgb2YgcmVseWluZyBkaXJlY3RseSBvbiBhIGRlcGVuZGVuY3ksIEdhbGxlcnkgRmFjdG9yeSByZWxpZXMgb24gYSBBZGFwdGVyIHRoYXQgY2FuIGJlIG1vZGlmaWVkXG4jIEEgQWRhcHRlciBpcyBhbiBhZGFwdGVyIGZvciBhIFBvcHVwLUdhbGxlcnkgcGx1Z2luLCBzdWNoIGFzIExpZ2h0R2FsbGVyeSBvciBQaG90b1N3aXBlXG4jXG4jIFNvIHdoZW4gYSBnYWxsZXJ5IGlzIG9wZW5lZCwgdGhpcyBpcyBwcm9iYWJseSBob3cgaXQncyBnb2luZyB0byBsb29rOlxuIyBbR2FsbGVyeSBGYWN0b3J5XSBhc2tzIFtBZGFwdGVyXSB0byBmaW5kIGFuZCBvcGVuIGEgZ2FsbGVyeSB3aXRoIFthbnkgTGlnaHRCb3ggTGlicmFyeV1cbiNcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEdhbGxlcnkgQWRhcHRlcjpcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuc2V0dXBfZHJpdmVyID0gKCBkcml2ZXJfbmFtZSA9ICdsaWdodGdhbGxlcnknICkgLT5cblx0aWYgZHJpdmVyX25hbWUgaXMgJ2xpZ2h0Z2FsbGVyeSdcblx0XHRhZGFwdGVyID0gcmVxdWlyZSggJy4vYWRhcHRlcnMvbGlnaHRnYWxsZXJ5JyApXG5cblx0aWYgZHJpdmVyX25hbWUgaXMgJ3Bob3Rvc3dpcGUnXG5cdFx0YWRhcHRlciA9IHJlcXVpcmUoICcuL2FkYXB0ZXJzL3Bob3Rvc3dpcGUnIClcblxuXHRyZXR1cm4gSG9va3MuYXBwbHlGaWx0ZXJzKCAncGhvcnQuZ2FsbGVyeS5kcml2ZXInLCBhZGFwdGVyIClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEdhbGxlcnkgRmFjdG9yeTpcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBUaGUgZ2FsbGVyeSBmYWN0b3J5IGlzIHdoYXQgd2UncmUgaW50ZXJhY3Rpbmcgd2l0aCB0byBvcGVuL2Nsb3NlIGEgZ2FsbGVyeVxuc2V0dXBfZmFjdG9yeSA9IC0+XG5cdGZhY3RvcnkgPSByZXF1aXJlKCAnLi9nYWxsZXJ5X2ZhY3RvcnknIClcblx0cmV0dXJuIEhvb2tzLmFwcGx5RmlsdGVycyggJ3Bob3J0LmdhbGxlcnkuZmFjdG9yeScsIGZhY3RvcnkgKVxuXG4jXG4jIFJldHVybiBhIGZhY3RvcnkgaW5zdGFuY2VcbiNcbm1vZHVsZS5leHBvcnRzID0gLT5cblx0Z2FsbGVyeV9kcml2ZXIgPSBzZXR1cF9kcml2ZXIoIHdpbmRvdy5fX3Bob3J0LnBvcHVwX2dhbGxlcnkgKVxuXHRnYWxsZXJ5X2ZhY3RvcnkgPSBzZXR1cF9mYWN0b3J5KCApXG5cblx0cmV0dXJuIGdhbGxlcnlfZmFjdG9yeSggZ2FsbGVyeV9kcml2ZXIgKSIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuSG9va3MgPSByZXF1aXJlKCAnd3BfaG9va3MnIClcbkdhbGxlcnkgPSByZXF1aXJlKCAnLi9wcmVwYXJlX2dhbGxlcnlfZmFjdG9yeScgKVxuXG4jIENsaWNrXG4kKCBkb2N1bWVudCApLm9uICdjbGljaycsICcuUFBfR2FsbGVyeV9faXRlbScsICggZSApIC0+XG5cdGUucHJldmVudERlZmF1bHQoIClcblx0R2FsbGVyeS5vcGVuKCB0aGlzIClcblxuIyBIYXNoXG5pZiB3aW5kb3cubG9jYXRpb24uaGFzaCBhbmQgR2FsbGVyeS5oYW5kbGVfaGFzaFxuXHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LmNvcmUubG9hZGVkJywgR2FsbGVyeS5oYW5kbGVfaGFzaFxuXG4jIEVTQyBLZXlcbmlmIEhvb2tzLmFwcGx5RmlsdGVycyAncGhvcnQuZ2FsbGVyeS5jdXN0b21fZXNjJywgdHJ1ZVxuXHQkKCB3aW5kb3cgKS5vbiAna2V5ZG93bicsICggZSApIC0+XG5cdFx0cmV0dXJuIHVubGVzcyBlLmtleUNvZGUgaXMgMjdcblx0XHRlLnByZXZlbnREZWZhdWx0KCApXG5cdFx0R2FsbGVyeS5jbG9zZSggKVxuXG4iLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuJCA9IHJlcXVpcmUoICdqUXVlcnknIClcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcbmdhbGxlcnlfaXRlbSA9IHJlcXVpcmUoICcuLi9nYWxsZXJ5L2dhbGxlcnlfaXRlbV9mYWN0b3J5JyApXG5fX1dJTkRPVyA9IHJlcXVpcmUoICcuLi9jb3JlL1dpbmRvdycgKVxudGhyb3R0bGUgPSByZXF1aXJlKCcuLi9jb3JlL1V0aWxpdGllcycpLnRocm90dGxlXG5cbmNsYXNzIEFic3RyYWN0X0xhenlfTG9hZGVyXG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdEBFbGVtZW50cyA9XG5cdFx0XHRpdGVtICAgICAgIDogJ1BQX0xhenlfSW1hZ2UnXG5cdFx0XHRwbGFjZWhvbGRlcjogJ1BQX0xhenlfSW1hZ2VfX3BsYWNlaG9sZGVyJ1xuXHRcdFx0bGluayAgICAgICA6ICdQUF9KU19MYXp5X19saW5rJ1xuXHRcdFx0aW1hZ2UgICAgICA6ICdQUF9KU19MYXp5X19pbWFnZSdcblxuXHRcdEBJdGVtcyA9IFtdXG5cblx0XHQjIEFkanVzdGFibGUgU2Vuc2l0aXZpdHkgZm9yIEBpbl92aWV3IGZ1bmN0aW9uXG5cdFx0IyBWYWx1ZSBpbiBwaXhlbHNcblx0XHRAU2Vuc2l0aXZpdHkgPSAxMDBcblxuXHRcdCMgQXV0by1zZXR1cCB3aGVuIGV2ZW50cyBhcmUgYXR0YWNoZWRcblx0XHQjIEF1dG8tZGVzdHJveSB3aGVuIGV2ZW50cyBhcmUgZGV0YWNoZWRcblx0XHRAdGhyb3R0bGVkX2F1dG9sb2FkID0gbnVsbFxuXG5cdFx0QHNldHVwX2l0ZW1zKClcblx0XHRAcmVzaXplX2FsbCgpXG5cdFx0QGF0dGFjaF9ldmVudHMoKVxuXG5cdCMjI1xuXHRcdEFic3RyYWN0IE1ldGhvZHNcblx0IyMjXG5cblx0IyBUaGlzIGlzIHJ1biB3aGVuIGEgcmVzaXplIG9yIHJlZnJlc2ggZXZlbnQgaXMgZGV0ZWN0ZWRcblx0cmVzaXplOiAtPiByZXR1cm5cblxuXHRsb2FkOiAoIGl0ZW0gKSAtPlxuXHRcdEBsb2FkX2ltYWdlKCBpdGVtIClcblx0XHRpdGVtLiRlbC5pbWFnZXNMb2FkZWQgPT5cblx0XHRcdEBjbGVhbnVwX2FmdGVyX2xvYWQoIGl0ZW0gKVxuXG5cdGxvYWRfaW1hZ2U6ICggaXRlbSApIC0+XG5cblx0XHQjIEdldCBpbWFnZSBVUkxzXG5cdFx0dGh1bWIgPSBpdGVtLmRhdGEudXJsKCAndGh1bWInIClcblx0XHRmdWxsID0gaXRlbS5kYXRhLnVybCggJ2Z1bGwnIClcblxuXHRcdCMgQ3JlYXRlIGVsZW1lbnRzXG5cdFx0aXRlbS4kZWxcblx0XHRcdC5wcmVwZW5kKCBAZ2V0X2l0ZW1faHRtbCggdGh1bWIsIGZ1bGwgKSApXG5cdFx0XHQucmVtb3ZlQ2xhc3MoICdMYXp5LUltYWdlJyApXG5cblx0XHQjIE1ha2Ugc3VyZSB0aGlzIGltYWdlIGlzbid0IGxvYWRlZCBhZ2FpblxuXHRcdGl0ZW0ubG9hZGVkID0gdHJ1ZVxuXG5cdGNsZWFudXBfYWZ0ZXJfbG9hZDogKCBpdGVtICkgLT5cblx0XHQjIEFkZCBpbWFnZSBQUF9KU19sb2FkZWQgY2xhc3Ncblx0XHRpdGVtLiRlbC5maW5kKCAnaW1nJyApLmFkZENsYXNzKCAnUFBfSlNfX2xvYWRlZCcgKS5yZW1vdmVDbGFzcyggJ1BQX0pTX19sb2FkaW5nJyApXG5cblx0XHRpdGVtLiRlbFxuXG5cdFx0XHQjIFJlbW92ZSBgUFBfTGF6eV9JbWFnZWAsIGFzIHRoaXMgaXMgbm90IGEgbGF6eS1sb2FkYWJsZSBpbWFnZSBhbnltb3JlXG5cdFx0XHQucmVtb3ZlQ2xhc3MoIEBFbGVtZW50cy5pdGVtIClcblxuXHRcdFx0IyBSZW1vdmUgUGxhY2Vob2xkZXJcblx0XHRcdC5maW5kKCBcIi4je0BFbGVtZW50cy5wbGFjZWhvbGRlcn1cIiApXG5cdFx0XHQuZmFkZU91dCggNDAwLCAtPiAkKCB0aGlzICkucmVtb3ZlKCkgKVxuXG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LmxhenkubG9hZGVkX2l0ZW0nLCBpdGVtXG5cblxuXHRnZXRfaXRlbV9odG1sOiAoIHRodW1iLCBmdWxsICkgLT5cblxuXHRcdGlmICdkaXNhYmxlJyBpcyB3aW5kb3cuX19waG9ydC5wb3B1cF9nYWxsZXJ5XG5cdFx0XHRyZXR1cm4gXCJcIlwiXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiI3tARWxlbWVudHMubGlua31cIiByZWw9XCJnYWxsZXJ5XCI+XG5cdFx0XHRcdDxpbWcgY2xhc3M9XCIje0BFbGVtZW50cy5pbWFnZX1cIiBzcmM9XCIje3RodW1ifVwiIGNsYXNzPVwiUFBfSlNfX2xvYWRpbmdcIiAvPlxuXHRcdFx0PC9kaXY+XG5cdFx0XHRcIlwiXCJcblx0XHRlbHNlXG5cdFx0XHRyZXR1cm4gXCJcIlwiXG5cdFx0XHQ8YSBjbGFzcz1cIiN7QEVsZW1lbnRzLmxpbmt9XCIgaHJlZj1cIiN7ZnVsbH1cIiByZWw9XCJnYWxsZXJ5XCI+XG5cdFx0XHRcdDxpbWcgY2xhc3M9XCIje0BFbGVtZW50cy5pbWFnZX1cIiBzcmM9XCIje3RodW1ifVwiIGNsYXNzPVwiUFBfSlNfX2xvYWRpbmdcIiAvPlxuXHRcdFx0PC9hPlxuXHRcdFx0XCJcIlwiXG5cblx0c2V0dXBfaXRlbXM6ID0+XG5cdFx0IyBDbGVhciBleGlzdGluZyBpdGVtcywgaWYgYW55XG5cdFx0QEl0ZW1zID0gW11cblxuXHRcdCMgTG9vcCBvdmVyIERPTSBhbmQgYWRkIGVhY2ggaXRlbSB0byBASXRlbXNcblx0XHQkKCBcIi4je0BFbGVtZW50cy5pdGVtfVwiICkuZWFjaCggQGFkZF9pdGVtIClcblx0XHRyZXR1cm5cblxuXHRhZGRfaXRlbTogKCBrZXksIGVsICkgPT5cblx0XHQkZWwgPSAkKCBlbCApXG5cdFx0QEl0ZW1zLnB1c2hcblx0XHRcdGVsICAgIDogZWxcblx0XHRcdCRlbCAgIDogJGVsXG5cdFx0XHRkYXRhICA6IGdhbGxlcnlfaXRlbSggJGVsIClcblx0XHRcdGxvYWRlZDogZmFsc2VcblxuXG5cdFx0cmV0dXJuXG5cblxuXHQjIyNcblx0XHRNZXRob2RzXG5cdCMjI1xuXHRyZXNpemVfYWxsOiAtPlxuXHRcdEByZXNpemUoIGl0ZW0gKSBmb3IgaXRlbSBpbiBASXRlbXNcblxuXG5cblx0IyBBdXRvbWF0aWNhbGx5IExvYWQgYWxsIGl0ZW1zIHRoYXQgYXJlIGBpbl9sb29zZV92aWV3YFxuXHRhdXRvbG9hZDogPT5cblx0XHRmb3IgaXRlbSwga2V5IGluIEBJdGVtc1xuXHRcdFx0aWYgbm90IGl0ZW0ubG9hZGVkIGFuZCBAaW5fbG9vc2VfdmlldyggaXRlbS5lbCApXG5cdFx0XHRcdEBsb2FkKCBpdGVtIClcblxuXHRpbl9sb29zZV92aWV3OiAoIGVsICkgLT5cblx0XHRyZXR1cm4gdHJ1ZSBpZiBub3QgZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0P1xuXHRcdHJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuXG5cdFx0IyBFbGVtZW50cyBub3QgaW4gdmlldyBpZiB0aGV5IGRvbid0IGhhdmUgZGltZW5zaW9uc1xuXHRcdHJldHVybiBmYWxzZSBpZiByZWN0LmhlaWdodCBpcyAwIGFuZCByZWN0LndpZHRoIGlzIDBcblxuXG5cdFx0cmV0dXJuIChcblx0XHRcdCMgWSBBeGlzXG5cdFx0XHRyZWN0LnRvcCArIHJlY3QuaGVpZ2h0ID49IC1AU2Vuc2l0aXZpdHkgYW5kICMgdG9wXG5cdFx0XHRyZWN0LmJvdHRvbSAtIHJlY3QuaGVpZ2h0IDw9IF9fV0lORE9XLmhlaWdodCArIEBTZW5zaXRpdml0eSBhbmRcblxuXHRcdFx0IyBYIEF4aXNcblx0XHRcdHJlY3QubGVmdCArIHJlY3Qud2lkdGggPj0gLUBTZW5zaXRpdml0eSBhbmRcblx0XHRcdHJlY3QucmlnaHQgLSByZWN0LndpZHRoIDw9IF9fV0lORE9XLndpZHRoICsgQFNlbnNpdGl2aXR5XG5cblx0XHQpXG5cblx0ZGVzdHJveTogLT5cblx0XHRAZGV0YWNoX2V2ZW50cygpXG5cblx0YXR0YWNoX2V2ZW50czogLT5cblx0XHQjIENyZWF0ZSBhIGRlYm91bmNlZCBgYXV0b2xvYWRgIGZ1bmN0aW9uXG5cdFx0QHRocm90dGxlZF9hdXRvbG9hZCA9IHRocm90dGxlKCBAYXV0b2xvYWQsIDUwIClcblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5yZWZyZXNoJywgQHRocm90dGxlZF9hdXRvbG9hZCwgMTAwXG5cblxuXHRkZXRhY2hfZXZlbnRzOiAtPlxuXHRcdCMgQ2xlYXIgdGhlIGRlYm91bmNlZCBmdW5jdGlvbiBmcm9tIGluc3RhbmNlXG5cdFx0QHRocm90dGxlZF9hdXRvbG9hZCA9IG51bGxcblx0XHRIb29rcy5yZW1vdmVBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5yZWZyZXNoJywgQHRocm90dGxlZF9hdXRvbG9hZCwgMTAwXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFic3RyYWN0X0xhenlfTG9hZGVyXG4iLCIkID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuQWJzdHJhY3RfTGF6eV9Mb2FkZXIgPSByZXF1aXJlKCAnLi9BYnN0cmFjdF9MYXp5X0xvYWRlcicgKVxuX19XSU5ET1cgPSByZXF1aXJlKCAnLi4vY29yZS9XaW5kb3cnIClcblxuY2xhc3MgTGF6eV9NYXNvbnJ5IGV4dGVuZHMgQWJzdHJhY3RfTGF6eV9Mb2FkZXJcblxuXHRyZXNpemVfYWxsOiAtPlxuXHRcdEBwbGFjZWhvbGRlcl93aWR0aCA9ICQoICcuUFBfTWFzb25yeV9fc2l6ZXInICkud2lkdGgoKVxuXHRcdHN1cGVyKClcblxuXHRyZXNpemU6ICggaXRlbSApIC0+XG5cdFx0aXRlbS4kZWwuY3NzICdtaW4taGVpZ2h0JzogTWF0aC5mbG9vciggQHBsYWNlaG9sZGVyX3dpZHRoIC8gaXRlbS5kYXRhLmdldCgncmF0aW8nKSApXG5cblx0Y2xlYW51cF9hZnRlcl9sb2FkOiAoaXRlbSkgLT5cblx0XHQjIFJlbW92ZSBtaW4taGVpZ2h0XG5cdFx0aXRlbS4kZWwuY3NzKCAnbWluLWhlaWdodCcsICcnIClcblxuXHRcdCMgUnVuIGFsbCBvdGhlciBjbGVhbnVwc1xuXHRcdHN1cGVyKCBpdGVtIClcblxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCdcblxuXHRcdHJldHVyblxuXG5cdGF0dGFjaF9ldmVudHM6IC0+XG5cdFx0IyBDYWxsIFBhcmVudCBmaXJzdCwgaXQncyBnb2luZyB0byBjcmVhdGUgQHRocm90dGxlZF9hdXRvbG9hZFxuXHRcdHN1cGVyKClcblxuXHRcdCMgQXR0YWNoXG5cdFx0JCggd2luZG93ICkub24gJ3Njcm9sbCcsIEB0aHJvdHRsZWRfYXV0b2xvYWRcblxuXG5cblx0ZGV0YWNoX2V2ZW50czogLT5cblx0XHQjIERldGFjaFxuXHRcdCQoIHdpbmRvdyApLm9mZiAnc2Nyb2xsJywgQHRocm90dGxlZF9hdXRvbG9hZFxuXG5cdFx0IyBDYWxsIHBhcmVudCBsYXN0LCBpdCdzIGdvaW5nIHRvIGNsZWFuIHVwIEB0aHJvdHRsZWRfYXV0b2xvYWRcblx0XHRzdXBlcigpXG5cblx0ZGVzdHJveTogLT5cblx0XHRmb3IgaXRlbSwga2V5IGluIEBJdGVtc1xuXHRcdFx0aXRlbS4kZWwuY3NzICdtaW4taGVpZ2h0JywgJydcblx0XHRzdXBlcigpXG5cblxubW9kdWxlLmV4cG9ydHMgPSBMYXp5X01hc29ucnlcbiIsIiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5cblxuaW5zdGFuY2UgPSBmYWxzZVxuXG5kZXN0cm95ID0gLT5cblx0cmV0dXJuIGlmIG5vdCBpbnN0YW5jZVxuXHRpbnN0YW5jZS5kZXN0cm95KClcblx0aW5zdGFuY2UgPSBudWxsXG5cbmNyZWF0ZSA9IC0+XG5cblx0IyBNYWtlIHN1cmUgYW4gaW5zdGFuY2UgZG9lc24ndCBhbHJlYWR5IGV4aXN0XG5cdGRlc3Ryb3koKVxuXG5cdCMgSGFuZGxlciByZXF1aXJlZFxuXHRIYW5kbGVyID0gSG9va3MuYXBwbHlGaWx0ZXJzICdwaG9ydC5sYXp5LmhhbmRsZXInLCBmYWxzZVxuXHRyZXR1cm4gaWYgbm90IEhhbmRsZXJcblxuXHQjIEJ5IGRlZmF1bHQgTGF6eV9NYXNvbnJ5IGlzIGhhbmRsaW5nIExhenktTG9hZGluZ1xuXHQjIENoZWNrIGlmIGFueW9uZSB3YW50cyB0byBoaWphY2sgaGFuZGxlclxuXHRpbnN0YW5jZSA9IG5ldyBIYW5kbGVyKClcblxuXHRyZXR1cm5cblxuXG4jIEluaXRpYWxpemUgbGF6eSBsb2FkZXIgYWZ0ZXIgdGhlIHBvcnRmb2xpbyBpcyBwcmVwYXJlZCwgcCA9IDEwMFxuSG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZScsIGNyZWF0ZSwgMTAwXG5Ib29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgZGVzdHJveSIsIkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcblxuIyMjXG5cbiAgICAjIEluaXRpYWxpemUgUG9ydGZvbGlvIENvcmVcblx0LS0tXG5cdFx0VXNpbmcgcDUwIEAgYHBob3J0LmNvcmUucmVhZHlgXG5cdFx0TGF0ZSBwcmlvcml0eSBpcyBnb2luZyB0byBmb3JjZSBleHBsaWNpdCBwcmlvcml0eSBpbiBhbnkgb3RoZXIgbW92aW5nIHBhcnRzIHRoYXQgYXJlIGdvaW5nIHRvIHRvdWNoIHBvcnRmb2xpbyBsYXlvdXQgYXQgYHBob3J0LmxvYWRlZGBcblx0LS0tXG5cbiMjI1xuY2xhc3MgUG9ydGZvbGlvX0V2ZW50X01hbmFnZXJcblxuXHRwcmVwYXJlOiAtPlxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZSdcblx0XHRyZXR1cm5cblxuXHRjcmVhdGU6IC0+XG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5jcmVhdGUnXG5cdFx0cmV0dXJuXG5cblxuXHRyZWZyZXNoOiAtPlxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCdcblx0XHRyZXR1cm5cblxuXG5cdGRlc3Ryb3k6IC0+XG5cdFx0IyBEZXN0cm95XG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95J1xuXHRcdHJldHVyblxuXG5cbm1vZHVsZS5leHBvcnRzID0gUG9ydGZvbGlvX0V2ZW50X01hbmFnZXIiLCJIb29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5cblxuIyMjXG5cdEFic3RyYWN0IENsYXNzIFBvcnRvZmxpb19FdmVudF9JbWVwbGVtZW50YXRpb25cblxuICAgIEhhbmRsZXMgYWxsIHRoZSBldmVudHMgcmVxdWlyZWQgdG8gZnVsbHkgaGFuZGxlIGEgcG9ydGZvbGlvIGxheW91dCBwcm9jZXNzXG4jIyNcbmNsYXNzIFBvcnRmb2xpb19JbnRlcmZhY2VcblxuXHRjb25zdHJ1Y3RvcjogKCBhcmdzICkgLT5cblx0XHRAc2V0dXBfYWN0aW9ucygpXG5cdFx0QGluaXRpYWxpemUoIGFyZ3MgKVxuXG5cdHNldHVwX2FjdGlvbnM6IC0+XG5cdFx0SG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZScsIEBwcmVwYXJlLCA1MFxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLmNyZWF0ZScsIEBjcmVhdGUsIDUwXG5cdFx0SG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCcsIEByZWZyZXNoLCA1MFxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLmRlc3Ryb3knLCBAZGVzdHJveSwgNTBcblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgQHB1cmdlX2FjdGlvbnMsIDEwMFxuXG5cdHB1cmdlX2FjdGlvbnM6ID0+XG5cdFx0SG9va3MucmVtb3ZlQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZScsIEBwcmVwYXJlLCA1MFxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLmNyZWF0ZScsIEBjcmVhdGUsIDUwXG5cdFx0SG9va3MucmVtb3ZlQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCcsIEByZWZyZXNoLCA1MFxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLmRlc3Ryb3knLCBAZGVzdHJveSwgNTBcblx0XHRIb29rcy5yZW1vdmVBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgQHB1cmdlX2FjdGlvbnMsIDEwMFxuXG5cblx0IyMjXG4gICAgXHRSZXF1aXJlIHRoZXNlIG1ldGhvZHNcblx0IyMjXG5cdGluaXRpYWxpemU6IC0+IHRocm93IG5ldyBFcnJvciggXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYGluaXRpYWxpemVgIG1ldGhvZFwiIClcblx0cHJlcGFyZSAgIDogLT4gdGhyb3cgbmV3IEVycm9yKCBcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgcHJlcGFyZWAgbWV0aG9kXCIgKVxuXHRjcmVhdGUgICAgOiAtPiB0aHJvdyBuZXcgRXJyb3IoIFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGBjcmVhdGVgIG1ldGhvZFwiIClcblx0cmVmcmVzaCAgIDogLT4gdGhyb3cgbmV3IEVycm9yKCBcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgcmVmcmVzaGAgbWV0aG9kXCIgKVxuXHRkZXN0cm95ICAgOiAtPiB0aHJvdyBuZXcgRXJyb3IoIFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGBkZXN0cm95YCBtZXRob2RcIiApXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBvcnRmb2xpb19JbnRlcmZhY2UiLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuJCA9IHJlcXVpcmUoICdqUXVlcnknIClcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcblBvcnRmb2xpb19JbnRlcmZhY2UgPSByZXF1aXJlKCAnLi9Qb3J0Zm9saW9fSW50ZXJmYWNlJyApXG5cbiMgQFRPRE86IE5lZWQgYSBoZWF2dnkgcmVmYWN0b3IgLSBubyBtb3JlIGNsYXNzZXMgcGxlYXNlXG5jbGFzcyBQb3J0Zm9saW9fTWFzb25yeSBleHRlbmRzIFBvcnRmb2xpb19JbnRlcmZhY2VcblxuXHRjb25zdHJ1Y3RvcjogLT5cblxuXHRcdEBFbGVtZW50cyA9XG5cdFx0XHRjb250YWluZXI6ICdQUF9NYXNvbnJ5J1xuXHRcdFx0c2l6ZXIgICAgOiAnUFBfTWFzb25yeV9fc2l6ZXInXG5cdFx0XHRpdGVtICAgICA6ICdQUF9NYXNvbnJ5X19pdGVtJ1xuXG5cdFx0c3VwZXIoKVxuXG5cdCMjI1xuXHRcdEluaXRpYWxpemVcblx0IyMjXG5cdGluaXRpYWxpemU6IC0+XG5cdFx0QCRjb250YWluZXIgPSAkKCBcIi4je0BFbGVtZW50cy5jb250YWluZXJ9XCIgKVxuXG5cdCMjI1xuXHRcdFByZXBhcmUgJiBBdHRhY2ggRXZlbnRzXG4gICAgXHREb24ndCBzaG93IGFueXRoaW5nIHlldC5cblxuXHRcdEBjYWxsZWQgb24gaG9vayBgcGhvcnQucG9ydGZvbGlvLnByZXBhcmVgXG5cdCMjI1xuXHRwcmVwYXJlOiA9PlxuXHRcdHJldHVybiBpZiBAJGNvbnRhaW5lci5sZW5ndGggaXMgMFxuXG5cdFx0QCRjb250YWluZXIuYWRkQ2xhc3MoICdQUF9KU19fbG9hZGluZ19tYXNvbnJ5JyApXG5cblx0XHRAbWF5YmVfY3JlYXRlX3NpemVyKClcblxuXHRcdCMgT25seSBpbml0aWFsaXplLCBpZiBubyBtYXNvbnJ5IGV4aXN0c1xuXHRcdG1hc29ucnlfc2V0dGluZ3MgPSBIb29rcy5hcHBseUZpbHRlcnMgJ3Bob3J0Lm1hc29ucnkuc2V0dGluZ3MnLFxuXHRcdFx0aXRlbVNlbGVjdG9yOiBcIi4je0BFbGVtZW50cy5pdGVtfVwiXG5cdFx0XHRjb2x1bW5XaWR0aCA6IFwiLiN7QEVsZW1lbnRzLnNpemVyfVwiXG5cdFx0XHRndXR0ZXIgICAgICA6IDBcblx0XHRcdGluaXRMYXlvdXQgIDogZmFsc2VcblxuXHRcdEAkY29udGFpbmVyLm1hc29ucnkoIG1hc29ucnlfc2V0dGluZ3MgKVxuXG5cdFx0QCRjb250YWluZXIubWFzb25yeSAnb25jZScsICdsYXlvdXRDb21wbGV0ZScsID0+XG5cdFx0XHRAJGNvbnRhaW5lclxuXHRcdFx0XHQucmVtb3ZlQ2xhc3MoICdQUF9KU19fbG9hZGluZ19tYXNvbnJ5JyApXG5cdFx0XHRcdC5hZGRDbGFzcyggJ1BQX0pTX19sb2FkaW5nX2NvbXBsZXRlJyApXG5cblx0XHRcdCMgQHRyaWdnZXIgcmVmcmVzaCBldmVudFxuXHRcdFx0IyB0cmlnZ2VycyBgQHJlZnJlc2goKWBcblx0XHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCdcblxuXG5cdCMjI1xuXHRcdFN0YXJ0IHRoZSBQb3J0Zm9saW9cblx0XHRAY2FsbGVkIG9uIGhvb2sgYHBob3J0LnBvcnRmb2xpby5jcmVhdGVgXG5cdCMjI1xuXHRjcmVhdGU6ID0+XG5cdFx0QCRjb250YWluZXIubWFzb25yeSgpXG5cdFx0cmV0dXJuXG5cblxuXHQjIyNcblx0XHREZXN0cm95XG5cdFx0QGNhbGxlZCBvbiBob29rIGBwaG9ydC5wb3J0Zm9saW8uZGVzdHJveWBcblx0IyMjXG5cdGRlc3Ryb3k6ID0+XG5cdFx0QG1heWJlX3JlbW92ZV9zaXplcigpXG5cblx0XHRpZiBAJGNvbnRhaW5lci5sZW5ndGggPiAwXG5cdFx0XHRAJGNvbnRhaW5lci5tYXNvbnJ5KCAnZGVzdHJveScgKVxuXG5cblx0XHRyZXR1cm5cblxuXG5cdCMjI1xuXHRcdFJlbG9hZCB0aGUgbGF5b3V0XG5cdFx0QGNhbGxlZCBvbiBob29rIGBwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaGBcblx0IyMjXG5cdHJlZnJlc2g6ID0+XG5cdFx0QCRjb250YWluZXIubWFzb25yeSggJ2xheW91dCcgKVxuXG5cblxuXHQjIyNcblx0XHRDcmVhdGUgYSBzaXplciBlbGVtZW50IGZvciBqcXVlcnktbWFzb25yeSB0byB1c2Vcblx0IyMjXG5cdG1heWJlX2NyZWF0ZV9zaXplcjogLT5cblx0XHRAY3JlYXRlX3NpemVyKCkgaWYgQHNpemVyX2RvZXNudF9leGlzdCgpXG5cdFx0cmV0dXJuXG5cblx0bWF5YmVfcmVtb3ZlX3NpemVyOiAtPlxuXHRcdHJldHVybiBpZiBAJGNvbnRhaW5lci5sZW5ndGggaXNudCAxXG5cdFx0QCRjb250YWluZXIuZmluZCggXCIuI3tARWxlbWVudHMuc2l6ZXJ9XCIgKS5yZW1vdmUoKVxuXHRcdHJldHVyblxuXG5cdHNpemVyX2RvZXNudF9leGlzdDogLT4gQCRjb250YWluZXIuZmluZCggXCIuI3tARWxlbWVudHMuc2l6ZXJ9XCIgKS5sZW5ndGggaXMgMFxuXG5cblx0Y3JlYXRlX3NpemVyOiAtPlxuXHRcdEAkY29udGFpbmVyLmFwcGVuZCBcIlwiXCI8ZGl2IGNsYXNzPVwiI3tARWxlbWVudHMuc2l6ZXJ9XCI+PC9kaXY+XCJcIlwiXG5cblx0XHRyZXR1cm5cblxubW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW9fTWFzb25yeSIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5Qb3J0Zm9saW9fRXZlbnRfTWFuYWdlciA9IHJlcXVpcmUoICcuL1BvcnRmb2xpb19FdmVudF9NYW5hZ2VyJyApXG4kID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuXG4jIFBvcnRmb2xpbyBtYW5hZ2VyIHdpbGwgdHJpZ2dlciBwb3J0Zm9saW8gZXZlbnRzIHdoZW4gbmVjZXNzYXJ5XG5Qb3J0Zm9saW8gPSBuZXcgUG9ydGZvbGlvX0V2ZW50X01hbmFnZXIoKVxuXG5cbmlzX21hc29ucnkgPSAtPlxuXHRyZXR1cm4gKCAkKCAnLlBQX01hc29ucnknICkubGVuZ3RoIGlzbnQgMCApXG5cbiMgU3RhcnQgTWFzb25yeSBMYXlvdXRcbnN0YXJ0X21hc29ucnkgPSAtPlxuXHRyZXR1cm4gZmFsc2UgaWYgbm90IGlzX21hc29ucnkoKVxuXG5cdFBvcnRmb2xpb19NYXNvbnJ5ID0gcmVxdWlyZSggJy4vUG9ydGZvbGlvX01hc29ucnknIClcblx0bmV3IFBvcnRmb2xpb19NYXNvbnJ5KClcblxubWF5YmVfbGF6eV9tYXNvbnJ5ID0gKCBoYW5kbGVyICkgLT5cblx0IyBVc2UgTGF6eV9NYXNvbnJ5IGhhbmRsZXIsIGlmIGN1cnJlbnQgbGF5b3V0IGlzIG1hc29ucnlcblx0cmV0dXJuIHJlcXVpcmUoICdsYXp5L0xhenlfTWFzb25yeScgKSBpZiBpc19tYXNvbnJ5KClcblx0cmV0dXJuIGhhbmRsZXJcblxuXG4jIFN0YXJ0IFBvcnRmb2xpb1xuSG9va3MuYWRkQWN0aW9uICdwaG9ydC5jb3JlLnJlYWR5JywgUG9ydGZvbGlvLnByZXBhcmUsIDUwXG5Ib29rcy5hZGRBY3Rpb24gJ3Bob3J0LmNvcmUubG9hZGVkJywgUG9ydGZvbGlvLmNyZWF0ZSwgNTBcblxuIyBJbml0aWFsaXplIE1hc29ucnkgTGF5b3V0XG5Ib29rcy5hZGRBY3Rpb24gJ3Bob3J0LmNvcmUucmVhZHknLCBzdGFydF9tYXNvbnJ5XG5cbiMgSW5pdGlhbGl6ZSBMYXp5IExvYWRpbmcgZm9yIE1hc29ucnkgTGF5b3V0XG5Ib29rcy5hZGRGaWx0ZXIgJ3Bob3J0LmxhenkuaGFuZGxlcicsIG1heWJlX2xhenlfbWFzb25yeVxuXG5cblxuIl19
