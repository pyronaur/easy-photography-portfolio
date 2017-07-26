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

},{"./core/Photography_Portfolio":2,"./gallery/gallery_item_data":5,"./gallery/gallery_item_factory":6,"./gallery/popup":9,"./lazy/Abstract_Lazy_Loader":10,"./lazy/start":12,"./portfolio/Portfolio_Interface":14,"./portfolio/start":16}],2:[function(require,module,exports){
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
var item;

item = function(data_obj) {
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

module.exports = item;


},{}],6:[function(require,module,exports){
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


},{"./gallery_item_data":5}],7:[function(require,module,exports){
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
    open: function($gallery_items, index) {
      var Gallery;
      return Gallery = $el.lightGallery(get_settings($gallery_items, index));
    }
  };
};


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],8:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var $, Hooks, PhotoSwipe, UI, create, defaults, pswp, single_item_data, thumbnail_position;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

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
        getThumbBoundsFn: thumbnail_position($el),
        index: index
      };
      return Gallery = create(gallery.map(single_item_data), options);
    }
  };
};


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],9:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var $, Gallery, Hooks, close_gallery, galery_item, gallery_type, open_gallery, parse_gallery_item, popup;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

galery_item = require('./gallery_item_factory');

gallery_type = window.__phort.popup_gallery || 'lightgallery';

if (gallery_type === 'lightgallery') {
  Gallery = require('./lightGallery');
}

if (gallery_type === 'photoswipe') {
  Gallery = require('./photoswipe');
}

if (!Gallery) {
  return;
}

popup = false;

parse_gallery_item = function(key, el) {
  var $el;
  $el = $(el);
  return {
    index: key,
    data: galery_item($el),
    caption: $el.find('.PP_Gallery__caption').html() || ''
  };
};

open_gallery = function(el) {
  var $el, $items, gallery_items, index;
  $el = $(el);
  $items = $el.closest('.PP_Gallery').find('.PP_Gallery__item');
  if ($items.length > 0) {
    index = $items.index($el);
    gallery_items = $.makeArray($items.map(parse_gallery_item));
    popup = Gallery($el);
    return popup.open(gallery_items, index);
  }
};

close_gallery = function() {
  if (!popup) {
    return false;
  }
  popup.close();
  return popup = false;
};

$(document).on('click', '.PP_Gallery__item', function(e) {
  e.preventDefault();
  return open_gallery(this);
});

if (Hooks.applyFilters('phort.gallery.custom_esc', true)) {
  $(window).on('keydown', function(e) {
    if (e.keyCode !== 27) {
      return;
    }
    close_gallery();
    return e.preventDefault();
  });
}


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./gallery_item_factory":6,"./lightGallery":7,"./photoswipe":8}],10:[function(require,module,exports){
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

},{"../core/Utilities":3,"../core/Window":4,"../gallery/gallery_item_factory":6}],11:[function(require,module,exports){
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

},{"../core/Window":4,"./Abstract_Lazy_Loader":10}],12:[function(require,module,exports){
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


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jb3JlL1Bob3RvZ3JhcGh5X1BvcnRmb2xpby5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY29yZS9VdGlsaXRpZXMuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY29yZS9XaW5kb3cuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvZ2FsbGVyeV9pdGVtX2RhdGEuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvZ2FsbGVyeV9pdGVtX2ZhY3RvcnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvbGlnaHRHYWxsZXJ5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9nYWxsZXJ5L3Bob3Rvc3dpcGUuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvcG9wdXAuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvQWJzdHJhY3RfTGF6eV9Mb2FkZXIuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvTGF6eV9NYXNvbnJ5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L3N0YXJ0LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9wb3J0Zm9saW8vUG9ydGZvbGlvX0V2ZW50X01hbmFnZXIuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL3BvcnRmb2xpby9Qb3J0Zm9saW9fSW50ZXJmYWNlLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9wb3J0Zm9saW8vUG9ydGZvbGlvX01hc29ucnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL3BvcnRmb2xpby9zdGFydC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOzs7QUFBQSxJQUFBOztBQUdBLEtBQUEsR0FBUSxPQUFBLENBQVMsVUFBVDs7QUFDUixDQUFBLEdBQUksT0FBQSxDQUFTLFFBQVQ7O0FBSUosTUFBTSxDQUFDLFVBQVAsR0FFQztFQUFBLG1CQUFBLEVBQXFCLE9BQUEsQ0FBUyxpQ0FBVCxDQUFyQjtFQUdBLE9BQUEsRUFDQztJQUFBLFNBQUEsRUFBVyxPQUFBLENBQVMsNkJBQVQsQ0FBWDtJQUNBLFlBQUEsRUFBYyxPQUFBLENBQVEsZ0NBQVIsQ0FEZDtHQUpEO0VBUUEsb0JBQUEsRUFBc0IsT0FBQSxDQUFTLDZCQUFULENBUnRCOzs7O0FBVUQ7Ozs7QUFLQSxPQUFBLENBQVEsbUJBQVI7O0FBR0EsT0FBQSxDQUFRLGlCQUFSOztBQUdBLE9BQUEsQ0FBUSxjQUFSOzs7QUFLQTs7OztBQUdBLENBQUEsQ0FBRyxRQUFILENBQWEsQ0FBQyxLQUFkLENBQW9CLFNBQUE7QUFHbkIsTUFBQTtFQUFBLElBQVUsQ0FBSSxDQUFBLENBQUcsTUFBSCxDQUFXLENBQUMsUUFBWixDQUFzQixjQUF0QixDQUFkO0FBQUEsV0FBQTs7RUFHQSxxQkFBQSxHQUF3QixJQUFJLENBQUUsT0FBQSxDQUFTLDhCQUFULENBQUYsQ0FBSixDQUFBO0VBQ3hCLHFCQUFxQixDQUFDLEtBQXRCLENBQUE7QUFQbUIsQ0FBcEI7Ozs7Ozs7O0FDdkNBOzs7QUFBQSxJQUFBLGNBQUE7RUFBQTs7QUFHQSxDQUFBLEdBQUksT0FBQSxDQUFTLFFBQVQ7O0FBQ0osS0FBQSxHQUFRLE9BQUEsQ0FBUyxVQUFUOztBQUdGO0VBRVEsY0FBQTs7O0lBQ1osS0FBSyxDQUFDLFNBQU4sQ0FBZ0Isa0JBQWhCLEVBQW9DLElBQUMsQ0FBQSxhQUFyQztFQURZOztpQkFJYixLQUFBLEdBQU8sU0FBQTtJQUNOLElBQUcsS0FBSyxDQUFDLFlBQU4sQ0FBb0Isa0JBQXBCLEVBQXdDLElBQXhDLENBQUg7TUFDQyxLQUFLLENBQUMsUUFBTixDQUFlLGtCQUFmLEVBREQ7O0VBRE07O2lCQUtQLGFBQUEsR0FBZSxTQUFBO1dBRWQsQ0FBQSxDQUFHLGFBQUgsQ0FBa0IsQ0FBQyxZQUFuQixDQUFpQyxJQUFDLENBQUEsTUFBbEM7RUFGYzs7aUJBS2YsTUFBQSxHQUFRLFNBQUE7SUFDUCxJQUFHLEtBQUssQ0FBQyxZQUFOLENBQW9CLG1CQUFwQixFQUF5QyxJQUF6QyxDQUFIO01BQ0MsS0FBSyxDQUFDLFFBQU4sQ0FBZSxtQkFBZixFQUREOztFQURPOzs7Ozs7QUFPVCxNQUFNLENBQUMsT0FBUCxHQUFpQjs7Ozs7O0FDOUJqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMvQkEsSUFBQTs7QUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFTLFVBQVQ7O0FBR1IsUUFBQSxHQUFXLFNBQUE7U0FDVjtJQUFBLEtBQUEsRUFBUSxNQUFNLENBQUMsVUFBUCxJQUFxQixPQUFPLENBQUMsS0FBUixDQUFBLENBQTdCO0lBQ0EsTUFBQSxFQUFRLE1BQU0sQ0FBQyxXQUFQLElBQXNCLE9BQU8sQ0FBQyxNQUFSLENBQUEsQ0FEOUI7O0FBRFU7O0FBS1gsTUFBTSxDQUFDLE9BQVAsR0FBaUIsUUFBQSxDQUFBOzs7Ozs7QUNSakIsSUFBQTs7QUFBQSxJQUFBLEdBQU8sU0FBRSxRQUFGO0FBRU4sTUFBQTtFQUFBLEtBQUEsR0FBUSxTQUFFLE1BQUYsRUFBVSxHQUFWO0lBQ1AsSUFBRyxNQUFBLElBQVcsTUFBUSxDQUFBLEdBQUEsQ0FBdEI7QUFDQyxhQUFPLE1BQVEsQ0FBQSxHQUFBLEVBRGhCOztBQUVBLFdBQU87RUFIQTtFQUtSLEdBQUEsR0FBTSxTQUFFLEdBQUY7V0FBVyxLQUFBLENBQU8sUUFBUCxFQUFpQixHQUFqQjtFQUFYO0VBRU4sS0FBQSxHQUFRLFNBQUUsU0FBRjtXQUFpQixLQUFBLENBQU8sR0FBQSxDQUFLLFFBQUwsQ0FBUCxFQUF3QixTQUF4QjtFQUFqQjtTQUdSO0lBQUEsSUFBQSxFQUFNLFNBQUUsU0FBRjtBQUNMLFVBQUE7TUFBQSxVQUFBLEdBQWEsS0FBQSxDQUFPLEtBQUEsQ0FBTyxTQUFQLENBQVAsRUFBMkIsTUFBM0I7TUFDYixJQUFnQixDQUFJLFVBQXBCO0FBQUEsZUFBTyxNQUFQOztNQUVBLE1BQWtCLFVBQVUsQ0FBQyxLQUFYLENBQWtCLEdBQWxCLENBQWxCLEVBQUMsY0FBRCxFQUFRO01BRVIsS0FBQSxHQUFRLFFBQUEsQ0FBVSxLQUFWO01BQ1IsTUFBQSxHQUFTLFFBQUEsQ0FBVSxNQUFWO0FBRVQsYUFBTyxDQUFFLEtBQUYsRUFBUyxNQUFUO0lBVEYsQ0FBTjtJQVdBLEdBQUEsRUFBSyxTQUFFLFNBQUY7YUFBaUIsS0FBQSxDQUFPLEtBQUEsQ0FBTyxTQUFQLENBQVAsRUFBMkIsS0FBM0I7SUFBakIsQ0FYTDtJQVlBLEdBQUEsRUFBSyxHQVpMOztBQVpNOztBQTJCUCxNQUFNLENBQUMsT0FBUCxHQUFpQjs7OztBQzNCakIsSUFBQTs7QUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLHFCQUFSOztBQUVQLFNBQUEsR0FBWSxTQUFFLEdBQUY7QUFDWCxNQUFBO0VBQUEsUUFBQSxHQUFXLEdBQUcsQ0FBQyxJQUFKLENBQVUsTUFBVjtFQUVYLElBQUcsQ0FBSSxRQUFQO0FBQ0MsVUFBTSxJQUFJLEtBQUosQ0FBVSwrQ0FBVixFQURQOztBQUdBLFNBQU8sSUFBQSxDQUFNLFFBQU47QUFOSTs7QUFTWixNQUFNLENBQUMsT0FBUCxHQUFpQjs7Ozs7O0FDWGpCOzs7QUFBQSxJQUFBOztBQUdBLENBQUEsR0FBSSxPQUFBLENBQVMsUUFBVDs7QUFDSixLQUFBLEdBQVEsT0FBQSxDQUFTLFVBQVQ7O0FBRVIsUUFBQSxHQUNDO0VBQUEsT0FBQSxFQUFVLElBQVY7RUFDQSxLQUFBLEVBQVUsR0FEVjtFQUVBLE9BQUEsRUFBVSxDQUZWO0VBR0EsUUFBQSxFQUFVLEtBSFY7RUFJQSxNQUFBLEVBQVUsS0FKVjtFQU1BLFNBQUEsRUFBb0IsSUFOcEI7RUFPQSxrQkFBQSxFQUFvQixJQVBwQjs7O0FBVUQsUUFBQSxHQUFXLENBQUMsQ0FBQyxNQUFGLENBQVUsRUFBVixFQUFjLFFBQWQsRUFBd0IsTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUF2Qzs7QUFHWCxnQkFBQSxHQUFtQixTQUFFLElBQUY7QUFFbEIsTUFBQTtFQUFBLElBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFWLENBQWUsTUFBZixDQUFBLEtBQTJCLE9BQTlCO0lBQ0MsSUFBQSxHQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBVixDQUFlLFdBQWYsRUFEUjtHQUFBLE1BQUE7SUFHQyxJQUFBLEdBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFWLENBQWUsTUFBZixFQUhSOztBQUtBLFNBQU87SUFDTixHQUFBLEVBQVMsSUFESDtJQUVOLEtBQUEsRUFBUyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQVYsQ0FBZSxPQUFmLENBRkg7SUFHTixPQUFBLEVBQVMsSUFBSSxDQUFDLE9BSFI7O0FBUFc7O0FBY25CLFlBQUEsR0FBZSxTQUFFLE9BQUYsRUFBVyxLQUFYO0VBQ2QsUUFBUSxDQUFDLEtBQVQsR0FBeUI7RUFDekIsUUFBUSxDQUFDLFNBQVQsR0FBeUIsT0FBTyxDQUFDLEdBQVIsQ0FBYSxnQkFBYjtFQUN6QixRQUFRLENBQUMsYUFBVCxHQUF5QixNQUFNLENBQUMsVUFBUCxHQUFvQjtTQUU3QyxLQUFLLENBQUMsWUFBTixDQUFtQiw2QkFBbkIsRUFBa0QsUUFBbEQ7QUFMYzs7QUFRZixNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFFLEdBQUY7U0FDaEI7SUFBQSxLQUFBLEVBQU8sU0FBQTtBQUNOLFVBQUE7TUFBQSxPQUFBLEdBQVUsR0FBRyxDQUFDLElBQUosQ0FBVSxjQUFWO01BQ1YsSUFBc0IsT0FBQSxJQUFZLHlCQUFsQztlQUFBLE9BQU8sQ0FBQyxPQUFSLENBQUEsRUFBQTs7SUFGTSxDQUFQO0lBSUEsSUFBQSxFQUFNLFNBQUUsY0FBRixFQUFrQixLQUFsQjtBQUNMLFVBQUE7YUFBQSxPQUFBLEdBQVUsR0FBRyxDQUFDLFlBQUosQ0FBa0IsWUFBQSxDQUFjLGNBQWQsRUFBOEIsS0FBOUIsQ0FBbEI7SUFETCxDQUpOOztBQURnQjs7Ozs7Ozs7QUMxQ2pCOzs7QUFBQSxJQUFBOztBQUdBLENBQUEsR0FBSSxPQUFBLENBQVMsUUFBVDs7QUFDSixLQUFBLEdBQVEsT0FBQSxDQUFTLFVBQVQ7O0FBR1IsUUFBQSxHQUNDO0VBQUEsS0FBQSxFQUFjLENBQWQ7RUFDQSxPQUFBLEVBQWMsQ0FBRSxDQUFGLEVBQUssQ0FBTCxDQURkO0VBRUEsTUFBQSxFQUFjLEtBRmQ7RUFHQSxZQUFBLEVBQWM7SUFFYjtNQUFFLEVBQUEsRUFBSSxVQUFOO01BQWtCLEtBQUEsRUFBTyxtQkFBekI7TUFBOEMsR0FBQSxFQUFLLHNEQUFuRDtLQUZhLEVBR2I7TUFBRSxFQUFBLEVBQUksU0FBTjtNQUFpQixLQUFBLEVBQU8sT0FBeEI7TUFBaUMsR0FBQSxFQUFLLDREQUF0QztLQUhhLEVBSWI7TUFBRSxFQUFBLEVBQUksV0FBTjtNQUFtQixLQUFBLEVBQU8sUUFBMUI7TUFBb0MsR0FBQSxFQUFLLGtHQUF6QztLQUphO0dBSGQ7OztBQVdELElBQUEsR0FBTyxRQUFRLENBQUMsYUFBVCxDQUF3QixPQUF4Qjs7QUFDUCxFQUFBLEdBQUssS0FBSyxDQUFDLFlBQU4sQ0FBb0IscUJBQXBCLEVBQTJDLE1BQU0sQ0FBQyxvQkFBbEQ7O0FBQ0wsVUFBQSxHQUFhLE1BQU0sQ0FBQzs7QUFHcEIsTUFBQSxHQUFTLFNBQUUsSUFBRixFQUFRLElBQVI7QUFDUixNQUFBOztJQURnQixPQUFPOztFQUN2QixPQUFBLEdBQVUsS0FBSyxDQUFDLFlBQU4sQ0FBb0IsMEJBQXBCLEVBQWdELENBQUMsQ0FBQyxNQUFGLENBQVUsRUFBVixFQUFjLFFBQWQsRUFBd0IsSUFBeEIsQ0FBaEQ7RUFHVixJQUFPLHFCQUFQO0lBQ0MsT0FBTyxDQUFDLEtBQVIsR0FBZ0IsRUFEakI7O0VBSUEsSUFBRyxDQUFJLE9BQU8sQ0FBQyxLQUFaLElBQXFCLE9BQU8sQ0FBQyxLQUFSLEdBQWdCLENBQXhDO0lBQ0MsT0FBTyxDQUFDLEtBQVIsR0FBZ0IsRUFEakI7O0VBR0EsUUFBQSxHQUFXLElBQUksVUFBSixDQUFnQixJQUFoQixFQUFzQixFQUF0QixFQUEwQixJQUExQixFQUFnQyxPQUFoQztFQUNYLFFBQVEsQ0FBQyxJQUFULENBQUE7QUFFQSxTQUFPO0FBZEM7O0FBaUJULGdCQUFBLEdBQW1CLFNBQUUsSUFBRjtBQUVsQixNQUFBO0VBQUEsSUFBVSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQVYsQ0FBYyxNQUFkLENBQUEsS0FBMkIsT0FBckM7QUFBQSxXQUFBOztFQUlBLE1BQWtCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBVixDQUFnQixNQUFoQixDQUFsQixFQUFDLGNBQUQsRUFBUTtTQUdSO0lBQUEsR0FBQSxFQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBVixDQUFlLE1BQWYsQ0FBUDtJQUNBLElBQUEsRUFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQVYsQ0FBZSxNQUFmLENBRFA7SUFFQSxDQUFBLEVBQU8sS0FGUDtJQUdBLENBQUEsRUFBTyxNQUhQO0lBSUEsS0FBQSxFQUFPLElBQUksQ0FBQyxPQUpaOztBQVRrQjs7QUFnQm5CLGtCQUFBLEdBQXFCLFNBQUUsR0FBRjtBQUFXLFNBQU8sU0FBQTtBQUN0QyxRQUFBO0lBQUEsSUFBZ0IsQ0FBSSxHQUFwQjtBQUFBLGFBQU8sTUFBUDs7SUFFQSxTQUFBLEdBQVksR0FBRyxDQUFDLElBQUosQ0FBVSxLQUFWLENBQWlCLENBQUMsR0FBbEIsQ0FBdUIsQ0FBdkI7SUFDWixXQUFBLEdBQWMsTUFBTSxDQUFDLFdBQVAsSUFBc0IsUUFBUSxDQUFDLGVBQWUsQ0FBQztJQUM3RCxJQUFBLEdBQU8sU0FBUyxDQUFDLHFCQUFWLENBQUE7SUFHUCxHQUFBLEdBQ0M7TUFBQSxDQUFBLEVBQUcsSUFBSSxDQUFDLElBQVI7TUFDQSxDQUFBLEVBQUcsSUFBSSxDQUFDLEdBQUwsR0FBVyxXQURkO01BRUEsQ0FBQSxFQUFHLElBQUksQ0FBQyxLQUZSOztBQUlELFdBQU87RUFiK0I7QUFBbEI7O0FBZ0JyQixNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFFLEdBQUY7QUFDaEIsTUFBQTtFQUFBLE9BQUEsR0FBVTtTQUVWO0lBQUEsS0FBQSxFQUFPLFNBQUE7TUFDTixJQUFVLENBQUksT0FBZDtBQUFBLGVBQUE7O01BQ0EsT0FBTyxDQUFDLEtBQVIsQ0FBQTthQUNBLE9BQUEsR0FBVTtJQUhKLENBQVA7SUFLQSxJQUFBLEVBQU0sU0FBRSxPQUFGLEVBQVcsS0FBWDtBQUVMLFVBQUE7TUFBQSxPQUFBLEdBQ0M7UUFBQSxnQkFBQSxFQUFrQixrQkFBQSxDQUFvQixHQUFwQixDQUFsQjtRQUNBLEtBQUEsRUFBa0IsS0FEbEI7O2FBR0QsT0FBQSxHQUFVLE1BQUEsQ0FBUSxPQUFPLENBQUMsR0FBUixDQUFhLGdCQUFiLENBQVIsRUFBeUMsT0FBekM7SUFOTCxDQUxOOztBQUhnQjs7Ozs7Ozs7QUN6RWpCOzs7QUFBQSxJQUFBOztBQUdBLENBQUEsR0FBSSxPQUFBLENBQVMsUUFBVDs7QUFDSixLQUFBLEdBQVEsT0FBQSxDQUFTLFVBQVQ7O0FBQ1IsV0FBQSxHQUFjLE9BQUEsQ0FBUyx3QkFBVDs7QUFHZCxZQUFBLEdBQWUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFmLElBQWdDOztBQUUvQyxJQUFHLFlBQUEsS0FBZ0IsY0FBbkI7RUFDQyxPQUFBLEdBQVUsT0FBQSxDQUFTLGdCQUFULEVBRFg7OztBQUdBLElBQUcsWUFBQSxLQUFnQixZQUFuQjtFQUNDLE9BQUEsR0FBVSxPQUFBLENBQVMsY0FBVCxFQURYOzs7QUFHQSxJQUFVLENBQUksT0FBZDtBQUFBLFNBQUE7OztBQUdBLEtBQUEsR0FBUTs7QUFFUixrQkFBQSxHQUFxQixTQUFFLEdBQUYsRUFBTyxFQUFQO0FBQ3BCLE1BQUE7RUFBQSxHQUFBLEdBQU0sQ0FBQSxDQUFHLEVBQUg7U0FFTjtJQUFBLEtBQUEsRUFBUyxHQUFUO0lBQ0EsSUFBQSxFQUFTLFdBQUEsQ0FBYSxHQUFiLENBRFQ7SUFFQSxPQUFBLEVBQVMsR0FBRyxDQUFDLElBQUosQ0FBVSxzQkFBVixDQUFrQyxDQUFDLElBQW5DLENBQUEsQ0FBQSxJQUE4QyxFQUZ2RDs7QUFIb0I7O0FBT3JCLFlBQUEsR0FBZSxTQUFFLEVBQUY7QUFDZCxNQUFBO0VBQUEsR0FBQSxHQUFNLENBQUEsQ0FBRyxFQUFIO0VBQ04sTUFBQSxHQUFTLEdBQUcsQ0FBQyxPQUFKLENBQWEsYUFBYixDQUE0QixDQUFDLElBQTdCLENBQW1DLG1CQUFuQztFQUVULElBQUcsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsQ0FBbkI7SUFDQyxLQUFBLEdBQVEsTUFBTSxDQUFDLEtBQVAsQ0FBYyxHQUFkO0lBQ1IsYUFBQSxHQUFnQixDQUFDLENBQUMsU0FBRixDQUFhLE1BQU0sQ0FBQyxHQUFQLENBQVksa0JBQVosQ0FBYjtJQUVoQixLQUFBLEdBQVEsT0FBQSxDQUFTLEdBQVQ7V0FDUixLQUFLLENBQUMsSUFBTixDQUFZLGFBQVosRUFBMkIsS0FBM0IsRUFMRDs7QUFKYzs7QUFXZixhQUFBLEdBQWdCLFNBQUE7RUFDZixJQUFnQixDQUFJLEtBQXBCO0FBQUEsV0FBTyxNQUFQOztFQUNBLEtBQUssQ0FBQyxLQUFOLENBQUE7U0FDQSxLQUFBLEdBQVE7QUFITzs7QUFTaEIsQ0FBQSxDQUFHLFFBQUgsQ0FBYSxDQUFDLEVBQWQsQ0FBaUIsT0FBakIsRUFBMEIsbUJBQTFCLEVBQStDLFNBQUUsQ0FBRjtFQUM5QyxDQUFDLENBQUMsY0FBRixDQUFBO1NBQ0EsWUFBQSxDQUFjLElBQWQ7QUFGOEMsQ0FBL0M7O0FBSUEsSUFBRyxLQUFLLENBQUMsWUFBTixDQUFtQiwwQkFBbkIsRUFBK0MsSUFBL0MsQ0FBSDtFQUNDLENBQUEsQ0FBRyxNQUFILENBQVcsQ0FBQyxFQUFaLENBQWUsU0FBZixFQUEwQixTQUFFLENBQUY7SUFDekIsSUFBYyxDQUFDLENBQUMsT0FBRixLQUFhLEVBQTNCO0FBQUEsYUFBQTs7SUFDQSxhQUFBLENBQUE7V0FDQSxDQUFDLENBQUMsY0FBRixDQUFBO0VBSHlCLENBQTFCLEVBREQ7Ozs7Ozs7OztBQ3BEQTs7O0FBQUEsSUFBQSxnRUFBQTtFQUFBOztBQUdBLENBQUEsR0FBSSxPQUFBLENBQVMsUUFBVDs7QUFDSixLQUFBLEdBQVEsT0FBQSxDQUFTLFVBQVQ7O0FBQ1IsWUFBQSxHQUFlLE9BQUEsQ0FBUyxpQ0FBVDs7QUFDZixRQUFBLEdBQVcsT0FBQSxDQUFTLGdCQUFUOztBQUNYLFFBQUEsR0FBVyxPQUFBLENBQVEsbUJBQVIsQ0FBNEIsQ0FBQzs7QUFFbEM7RUFDUSw4QkFBQTs7OztJQUNaLElBQUMsQ0FBQSxRQUFELEdBQ0M7TUFBQSxJQUFBLEVBQWEsZUFBYjtNQUNBLFdBQUEsRUFBYSw0QkFEYjtNQUVBLElBQUEsRUFBYSxrQkFGYjtNQUdBLEtBQUEsRUFBYSxtQkFIYjs7SUFLRCxJQUFDLENBQUEsS0FBRCxHQUFTO0lBSVQsSUFBQyxDQUFBLFdBQUQsR0FBZTtJQUlmLElBQUMsQ0FBQSxrQkFBRCxHQUFzQjtJQUV0QixJQUFDLENBQUEsV0FBRCxDQUFBO0lBQ0EsSUFBQyxDQUFBLFVBQUQsQ0FBQTtJQUNBLElBQUMsQ0FBQSxhQUFELENBQUE7RUFuQlk7OztBQXFCYjs7OztpQ0FLQSxNQUFBLEdBQVEsU0FBQSxHQUFBOztpQ0FFUixJQUFBLEdBQU0sU0FBRSxJQUFGO0lBQ0wsSUFBQyxDQUFBLFVBQUQsQ0FBYSxJQUFiO1dBQ0EsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFULENBQXNCLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQTtlQUNyQixLQUFDLENBQUEsa0JBQUQsQ0FBcUIsSUFBckI7TUFEcUI7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRCO0VBRks7O2lDQUtOLFVBQUEsR0FBWSxTQUFFLElBQUY7QUFHWCxRQUFBO0lBQUEsS0FBQSxHQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBVixDQUFlLE9BQWY7SUFDUixJQUFBLEdBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFWLENBQWUsTUFBZjtJQUdQLElBQUksQ0FBQyxHQUNKLENBQUMsT0FERixDQUNXLElBQUMsQ0FBQSxhQUFELENBQWdCLEtBQWhCLEVBQXVCLElBQXZCLENBRFgsQ0FFQyxDQUFDLFdBRkYsQ0FFZSxZQUZmO1dBS0EsSUFBSSxDQUFDLE1BQUwsR0FBYztFQVpIOztpQ0FjWixrQkFBQSxHQUFvQixTQUFFLElBQUY7SUFFbkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFULENBQWUsS0FBZixDQUFzQixDQUFDLFFBQXZCLENBQWlDLGVBQWpDLENBQWtELENBQUMsV0FBbkQsQ0FBZ0UsZ0JBQWhFO0lBRUEsSUFBSSxDQUFDLEdBR0osQ0FBQyxXQUhGLENBR2UsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUh6QixDQU1DLENBQUMsSUFORixDQU1RLEdBQUEsR0FBSSxJQUFDLENBQUEsUUFBUSxDQUFDLFdBTnRCLENBT0MsQ0FBQyxPQVBGLENBT1csR0FQWCxFQU9nQixTQUFBO2FBQUcsQ0FBQSxDQUFHLElBQUgsQ0FBUyxDQUFDLE1BQVYsQ0FBQTtJQUFILENBUGhCO1dBU0EsS0FBSyxDQUFDLFFBQU4sQ0FBZSx3QkFBZixFQUF5QyxJQUF6QztFQWJtQjs7aUNBZ0JwQixhQUFBLEdBQWUsU0FBRSxLQUFGLEVBQVMsSUFBVDtJQUVkLElBQUcsU0FBQSxLQUFhLE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBL0I7QUFDQyxhQUFPLGVBQUEsR0FDTyxJQUFDLENBQUEsUUFBUSxDQUFDLElBRGpCLEdBQ3NCLHFDQUR0QixHQUVRLElBQUMsQ0FBQSxRQUFRLENBQUMsS0FGbEIsR0FFd0IsV0FGeEIsR0FFaUMsS0FGakMsR0FFdUMseUNBSC9DO0tBQUEsTUFBQTtBQU9DLGFBQU8sYUFBQSxHQUNLLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFEZixHQUNvQixZQURwQixHQUM4QixJQUQ5QixHQUNtQyxxQ0FEbkMsR0FFUSxJQUFDLENBQUEsUUFBUSxDQUFDLEtBRmxCLEdBRXdCLFdBRnhCLEdBRWlDLEtBRmpDLEdBRXVDLHVDQVQvQzs7RUFGYzs7aUNBZWYsV0FBQSxHQUFhLFNBQUE7SUFFWixJQUFDLENBQUEsS0FBRCxHQUFTO0lBR1QsQ0FBQSxDQUFHLEdBQUEsR0FBSSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQWpCLENBQXlCLENBQUMsSUFBMUIsQ0FBZ0MsSUFBQyxDQUFBLFFBQWpDO0VBTFk7O2lDQVFiLFFBQUEsR0FBVSxTQUFFLEdBQUYsRUFBTyxFQUFQO0FBQ1QsUUFBQTtJQUFBLEdBQUEsR0FBTSxDQUFBLENBQUcsRUFBSDtJQUNOLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUNDO01BQUEsRUFBQSxFQUFRLEVBQVI7TUFDQSxHQUFBLEVBQVEsR0FEUjtNQUVBLElBQUEsRUFBUSxZQUFBLENBQWMsR0FBZCxDQUZSO01BR0EsTUFBQSxFQUFRLEtBSFI7S0FERDtFQUZTOzs7QUFZVjs7OztpQ0FHQSxVQUFBLEdBQVksU0FBQTtBQUNYLFFBQUE7QUFBQTtBQUFBO1NBQUEscUNBQUE7O21CQUFBLElBQUMsQ0FBQSxNQUFELENBQVMsSUFBVDtBQUFBOztFQURXOztpQ0FNWixRQUFBLEdBQVUsU0FBQTtBQUNULFFBQUE7QUFBQTtBQUFBO1NBQUEsaURBQUE7O01BQ0MsSUFBRyxDQUFJLElBQUksQ0FBQyxNQUFULElBQW9CLElBQUMsQ0FBQSxhQUFELENBQWdCLElBQUksQ0FBQyxFQUFyQixDQUF2QjtxQkFDQyxJQUFDLENBQUEsSUFBRCxDQUFPLElBQVAsR0FERDtPQUFBLE1BQUE7NkJBQUE7O0FBREQ7O0VBRFM7O2lDQUtWLGFBQUEsR0FBZSxTQUFFLEVBQUY7QUFDZCxRQUFBO0lBQUEsSUFBbUIsZ0NBQW5CO0FBQUEsYUFBTyxLQUFQOztJQUNBLElBQUEsR0FBTyxFQUFFLENBQUMscUJBQUgsQ0FBQTtJQUdQLElBQWdCLElBQUksQ0FBQyxNQUFMLEtBQWUsQ0FBZixJQUFxQixJQUFJLENBQUMsS0FBTCxLQUFjLENBQW5EO0FBQUEsYUFBTyxNQUFQOztBQUdBLFdBRUMsSUFBSSxDQUFDLEdBQUwsR0FBVyxJQUFJLENBQUMsTUFBaEIsSUFBMEIsQ0FBQyxJQUFDLENBQUEsV0FBNUIsSUFDQSxJQUFJLENBQUMsTUFBTCxHQUFjLElBQUksQ0FBQyxNQUFuQixJQUE2QixRQUFRLENBQUMsTUFBVCxHQUFrQixJQUFDLENBQUEsV0FEaEQsSUFJQSxJQUFJLENBQUMsSUFBTCxHQUFZLElBQUksQ0FBQyxLQUFqQixJQUEwQixDQUFDLElBQUMsQ0FBQSxXQUo1QixJQUtBLElBQUksQ0FBQyxLQUFMLEdBQWEsSUFBSSxDQUFDLEtBQWxCLElBQTJCLFFBQVEsQ0FBQyxLQUFULEdBQWlCLElBQUMsQ0FBQTtFQWZoQzs7aUNBbUJmLE9BQUEsR0FBUyxTQUFBO1dBQ1IsSUFBQyxDQUFBLGFBQUQsQ0FBQTtFQURROztpQ0FHVCxhQUFBLEdBQWUsU0FBQTtJQUVkLElBQUMsQ0FBQSxrQkFBRCxHQUFzQixRQUFBLENBQVUsSUFBQyxDQUFBLFFBQVgsRUFBcUIsRUFBckI7V0FDdEIsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IseUJBQWhCLEVBQTJDLElBQUMsQ0FBQSxrQkFBNUMsRUFBZ0UsR0FBaEU7RUFIYzs7aUNBTWYsYUFBQSxHQUFlLFNBQUE7SUFFZCxJQUFDLENBQUEsa0JBQUQsR0FBc0I7V0FDdEIsS0FBSyxDQUFDLFlBQU4sQ0FBbUIseUJBQW5CLEVBQThDLElBQUMsQ0FBQSxrQkFBL0MsRUFBbUUsR0FBbkU7RUFIYzs7Ozs7O0FBT2hCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7Ozs7O0FDN0pqQixJQUFBLHNEQUFBO0VBQUE7OztBQUFBLENBQUEsR0FBSSxPQUFBLENBQVMsUUFBVDs7QUFDSixLQUFBLEdBQVEsT0FBQSxDQUFTLFVBQVQ7O0FBQ1Isb0JBQUEsR0FBdUIsT0FBQSxDQUFTLHdCQUFUOztBQUN2QixRQUFBLEdBQVcsT0FBQSxDQUFTLGdCQUFUOztBQUVMOzs7Ozs7O3lCQUVMLFVBQUEsR0FBWSxTQUFBO0lBQ1gsSUFBQyxDQUFBLGlCQUFELEdBQXFCLENBQUEsQ0FBRyxvQkFBSCxDQUF5QixDQUFDLEtBQTFCLENBQUE7V0FDckIsMkNBQUE7RUFGVzs7eUJBSVosTUFBQSxHQUFRLFNBQUUsSUFBRjtXQUNQLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBVCxDQUFhO01BQUEsWUFBQSxFQUFjLElBQUksQ0FBQyxLQUFMLENBQVksSUFBQyxDQUFBLGlCQUFELEdBQXFCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBVixDQUFjLE9BQWQsQ0FBakMsQ0FBZDtLQUFiO0VBRE87O3lCQUdSLGtCQUFBLEdBQW9CLFNBQUMsSUFBRDtJQUVuQixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQVQsQ0FBYyxZQUFkLEVBQTRCLEVBQTVCO0lBR0EscURBQU8sSUFBUDtJQUVBLEtBQUssQ0FBQyxRQUFOLENBQWUseUJBQWY7RUFQbUI7O3lCQVdwQixhQUFBLEdBQWUsU0FBQTtJQUVkLDhDQUFBO1dBR0EsQ0FBQSxDQUFHLE1BQUgsQ0FBVyxDQUFDLEVBQVosQ0FBZSxRQUFmLEVBQXlCLElBQUMsQ0FBQSxrQkFBMUI7RUFMYzs7eUJBU2YsYUFBQSxHQUFlLFNBQUE7SUFFZCxDQUFBLENBQUcsTUFBSCxDQUFXLENBQUMsR0FBWixDQUFnQixRQUFoQixFQUEwQixJQUFDLENBQUEsa0JBQTNCO1dBR0EsOENBQUE7RUFMYzs7eUJBT2YsT0FBQSxHQUFTLFNBQUE7QUFDUixRQUFBO0FBQUE7QUFBQSxTQUFBLGlEQUFBOztNQUNDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBVCxDQUFhLFlBQWIsRUFBMkIsRUFBM0I7QUFERDtXQUVBLHdDQUFBO0VBSFE7Ozs7R0FwQ2lCOztBQTBDM0IsTUFBTSxDQUFDLE9BQVAsR0FBaUI7Ozs7Ozs7QUMvQ2pCLElBQUE7O0FBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUyxRQUFUOztBQUNKLEtBQUEsR0FBUSxPQUFBLENBQVMsVUFBVDs7QUFHUixRQUFBLEdBQVc7O0FBRVgsT0FBQSxHQUFVLFNBQUE7RUFDVCxJQUFVLENBQUksUUFBZDtBQUFBLFdBQUE7O0VBQ0EsUUFBUSxDQUFDLE9BQVQsQ0FBQTtTQUNBLFFBQUEsR0FBVztBQUhGOztBQUtWLE1BQUEsR0FBUyxTQUFBO0FBR1IsTUFBQTtFQUFBLE9BQUEsQ0FBQTtFQUdBLE9BQUEsR0FBVSxLQUFLLENBQUMsWUFBTixDQUFtQixvQkFBbkIsRUFBeUMsS0FBekM7RUFDVixJQUFVLENBQUksT0FBZDtBQUFBLFdBQUE7O0VBSUEsUUFBQSxHQUFXLElBQUksT0FBSixDQUFBO0FBWEg7O0FBaUJULEtBQUssQ0FBQyxTQUFOLENBQWdCLHlCQUFoQixFQUEyQyxNQUEzQyxFQUFtRCxHQUFuRDs7QUFDQSxLQUFLLENBQUMsU0FBTixDQUFnQix5QkFBaEIsRUFBMkMsT0FBM0M7Ozs7Ozs7QUM3QkEsSUFBQTs7QUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFTLFVBQVQ7OztBQUVSOzs7Ozs7Ozs7QUFTTTs7O29DQUVMLE9BQUEsR0FBUyxTQUFBO0lBQ1IsS0FBSyxDQUFDLFFBQU4sQ0FBZSx5QkFBZjtFQURROztvQ0FJVCxNQUFBLEdBQVEsU0FBQTtJQUNQLEtBQUssQ0FBQyxRQUFOLENBQWUsd0JBQWY7RUFETzs7b0NBS1IsT0FBQSxHQUFTLFNBQUE7SUFDUixLQUFLLENBQUMsUUFBTixDQUFlLHlCQUFmO0VBRFE7O29DQUtULE9BQUEsR0FBUyxTQUFBO0lBRVIsS0FBSyxDQUFDLFFBQU4sQ0FBZSx5QkFBZjtFQUZROzs7Ozs7QUFNVixNQUFNLENBQUMsT0FBUCxHQUFpQjs7Ozs7OztBQ2pDakIsSUFBQSwwQkFBQTtFQUFBOztBQUFBLEtBQUEsR0FBUSxPQUFBLENBQVMsVUFBVDs7O0FBR1I7Ozs7OztBQUtNO0VBRVEsNkJBQUUsSUFBRjs7SUFDWixJQUFDLENBQUEsYUFBRCxDQUFBO0lBQ0EsSUFBQyxDQUFBLFVBQUQsQ0FBYSxJQUFiO0VBRlk7O2dDQUliLGFBQUEsR0FBZSxTQUFBO0lBQ2QsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IseUJBQWhCLEVBQTJDLElBQUMsQ0FBQSxPQUE1QyxFQUFxRCxFQUFyRDtJQUNBLEtBQUssQ0FBQyxTQUFOLENBQWdCLHdCQUFoQixFQUEwQyxJQUFDLENBQUEsTUFBM0MsRUFBbUQsRUFBbkQ7SUFDQSxLQUFLLENBQUMsU0FBTixDQUFnQix5QkFBaEIsRUFBMkMsSUFBQyxDQUFBLE9BQTVDLEVBQXFELEVBQXJEO0lBQ0EsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IseUJBQWhCLEVBQTJDLElBQUMsQ0FBQSxPQUE1QyxFQUFxRCxFQUFyRDtXQUNBLEtBQUssQ0FBQyxTQUFOLENBQWdCLHlCQUFoQixFQUEyQyxJQUFDLENBQUEsYUFBNUMsRUFBMkQsR0FBM0Q7RUFMYzs7Z0NBT2YsYUFBQSxHQUFlLFNBQUE7SUFDZCxLQUFLLENBQUMsWUFBTixDQUFtQix5QkFBbkIsRUFBOEMsSUFBQyxDQUFBLE9BQS9DLEVBQXdELEVBQXhEO0lBQ0EsS0FBSyxDQUFDLFlBQU4sQ0FBbUIsd0JBQW5CLEVBQTZDLElBQUMsQ0FBQSxNQUE5QyxFQUFzRCxFQUF0RDtJQUNBLEtBQUssQ0FBQyxZQUFOLENBQW1CLHlCQUFuQixFQUE4QyxJQUFDLENBQUEsT0FBL0MsRUFBd0QsRUFBeEQ7SUFDQSxLQUFLLENBQUMsWUFBTixDQUFtQix5QkFBbkIsRUFBOEMsSUFBQyxDQUFBLE9BQS9DLEVBQXdELEVBQXhEO1dBQ0EsS0FBSyxDQUFDLFlBQU4sQ0FBbUIseUJBQW5CLEVBQThDLElBQUMsQ0FBQSxhQUEvQyxFQUE4RCxHQUE5RDtFQUxjOzs7QUFRZjs7OztnQ0FHQSxVQUFBLEdBQVksU0FBQTtBQUFHLFVBQU0sSUFBSSxLQUFKLENBQVcscUZBQVg7RUFBVDs7Z0NBQ1osT0FBQSxHQUFZLFNBQUE7QUFBRyxVQUFNLElBQUksS0FBSixDQUFXLGtGQUFYO0VBQVQ7O2dDQUNaLE1BQUEsR0FBWSxTQUFBO0FBQUcsVUFBTSxJQUFJLEtBQUosQ0FBVyxpRkFBWDtFQUFUOztnQ0FDWixPQUFBLEdBQVksU0FBQTtBQUFHLFVBQU0sSUFBSSxLQUFKLENBQVcsa0ZBQVg7RUFBVDs7Z0NBQ1osT0FBQSxHQUFZLFNBQUE7QUFBRyxVQUFNLElBQUksS0FBSixDQUFXLGtGQUFYO0VBQVQ7Ozs7OztBQUliLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7Ozs7OztBQ3hDakI7OztBQUFBLElBQUEsZ0RBQUE7RUFBQTs7OztBQUdBLENBQUEsR0FBSSxPQUFBLENBQVMsUUFBVDs7QUFDSixLQUFBLEdBQVEsT0FBQSxDQUFTLFVBQVQ7O0FBQ1IsbUJBQUEsR0FBc0IsT0FBQSxDQUFTLHVCQUFUOztBQUdoQjs7O0VBRVEsMkJBQUE7Ozs7O0lBRVosSUFBQyxDQUFBLFFBQUQsR0FDQztNQUFBLFNBQUEsRUFBVyxZQUFYO01BQ0EsS0FBQSxFQUFXLG1CQURYO01BRUEsSUFBQSxFQUFXLGtCQUZYOztJQUlELGlEQUFBO0VBUFk7OztBQVNiOzs7OzhCQUdBLFVBQUEsR0FBWSxTQUFBO1dBQ1gsSUFBQyxDQUFBLFVBQUQsR0FBYyxDQUFBLENBQUcsR0FBQSxHQUFJLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBakI7RUFESDs7O0FBR1o7Ozs7Ozs7OEJBTUEsT0FBQSxHQUFTLFNBQUE7QUFDUixRQUFBO0lBQUEsSUFBVSxJQUFDLENBQUEsVUFBVSxDQUFDLE1BQVosS0FBc0IsQ0FBaEM7QUFBQSxhQUFBOztJQUVBLElBQUMsQ0FBQSxVQUFVLENBQUMsUUFBWixDQUFzQix3QkFBdEI7SUFFQSxJQUFDLENBQUEsa0JBQUQsQ0FBQTtJQUdBLGdCQUFBLEdBQW1CLEtBQUssQ0FBQyxZQUFOLENBQW1CLHdCQUFuQixFQUNsQjtNQUFBLFlBQUEsRUFBYyxHQUFBLEdBQUksSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUE1QjtNQUNBLFdBQUEsRUFBYyxHQUFBLEdBQUksSUFBQyxDQUFBLFFBQVEsQ0FBQyxLQUQ1QjtNQUVBLE1BQUEsRUFBYyxDQUZkO01BR0EsVUFBQSxFQUFjLEtBSGQ7S0FEa0I7SUFNbkIsSUFBQyxDQUFBLFVBQVUsQ0FBQyxPQUFaLENBQXFCLGdCQUFyQjtXQUVBLElBQUMsQ0FBQSxVQUFVLENBQUMsT0FBWixDQUFvQixNQUFwQixFQUE0QixnQkFBNUIsRUFBOEMsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFBO1FBQzdDLEtBQUMsQ0FBQSxVQUNBLENBQUMsV0FERixDQUNlLHdCQURmLENBRUMsQ0FBQyxRQUZGLENBRVkseUJBRlo7ZUFNQSxLQUFLLENBQUMsUUFBTixDQUFlLHlCQUFmO01BUDZDO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QztFQWhCUTs7O0FBMEJUOzs7Ozs4QkFJQSxNQUFBLEdBQVEsU0FBQTtJQUNQLElBQUMsQ0FBQSxVQUFVLENBQUMsT0FBWixDQUFBO0VBRE87OztBQUtSOzs7Ozs4QkFJQSxPQUFBLEdBQVMsU0FBQTtJQUNSLElBQUMsQ0FBQSxrQkFBRCxDQUFBO0lBRUEsSUFBRyxJQUFDLENBQUEsVUFBVSxDQUFDLE1BQVosR0FBcUIsQ0FBeEI7TUFDQyxJQUFDLENBQUEsVUFBVSxDQUFDLE9BQVosQ0FBcUIsU0FBckIsRUFERDs7RUFIUTs7O0FBVVQ7Ozs7OzhCQUlBLE9BQUEsR0FBUyxTQUFBO1dBQ1IsSUFBQyxDQUFBLFVBQVUsQ0FBQyxPQUFaLENBQXFCLFFBQXJCO0VBRFE7OztBQUtUOzs7OzhCQUdBLGtCQUFBLEdBQW9CLFNBQUE7SUFDbkIsSUFBbUIsSUFBQyxDQUFBLGtCQUFELENBQUEsQ0FBbkI7TUFBQSxJQUFDLENBQUEsWUFBRCxDQUFBLEVBQUE7O0VBRG1COzs4QkFJcEIsa0JBQUEsR0FBb0IsU0FBQTtJQUNuQixJQUFVLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFBWixLQUF3QixDQUFsQztBQUFBLGFBQUE7O0lBQ0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxJQUFaLENBQWtCLEdBQUEsR0FBSSxJQUFDLENBQUEsUUFBUSxDQUFDLEtBQWhDLENBQXlDLENBQUMsTUFBMUMsQ0FBQTtFQUZtQjs7OEJBS3BCLGtCQUFBLEdBQW9CLFNBQUE7V0FBRyxJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBa0IsR0FBQSxHQUFJLElBQUMsQ0FBQSxRQUFRLENBQUMsS0FBaEMsQ0FBeUMsQ0FBQyxNQUExQyxLQUFvRDtFQUF2RDs7OEJBR3BCLFlBQUEsR0FBYyxTQUFBO0lBQ2IsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLENBQW1CLGVBQUEsR0FBaUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxLQUEzQixHQUFpQyxXQUFwRDtFQURhOzs7O0dBaEdpQjs7QUFxR2hDLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7Ozs7OztBQzdHakI7OztBQUFBLElBQUE7O0FBR0EsS0FBQSxHQUFRLE9BQUEsQ0FBUyxVQUFUOztBQUNSLHVCQUFBLEdBQTBCLE9BQUEsQ0FBUywyQkFBVDs7QUFDMUIsQ0FBQSxHQUFJLE9BQUEsQ0FBUyxRQUFUOztBQUdKLFNBQUEsR0FBWSxJQUFJLHVCQUFKLENBQUE7O0FBR1osVUFBQSxHQUFhLFNBQUE7QUFDWixTQUFTLENBQUEsQ0FBRyxhQUFILENBQWtCLENBQUMsTUFBbkIsS0FBK0I7QUFENUI7O0FBSWIsYUFBQSxHQUFnQixTQUFBO0FBQ2YsTUFBQTtFQUFBLElBQWdCLENBQUksVUFBQSxDQUFBLENBQXBCO0FBQUEsV0FBTyxNQUFQOztFQUVBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUyxxQkFBVDtTQUNwQixJQUFJLGlCQUFKLENBQUE7QUFKZTs7QUFNaEIsa0JBQUEsR0FBcUIsU0FBRSxPQUFGO0VBRXBCLElBQXlDLFVBQUEsQ0FBQSxDQUF6QztBQUFBLFdBQU8sT0FBQSxDQUFTLG1CQUFULEVBQVA7O0FBQ0EsU0FBTztBQUhhOztBQU9yQixLQUFLLENBQUMsU0FBTixDQUFnQixrQkFBaEIsRUFBb0MsU0FBUyxDQUFDLE9BQTlDLEVBQXVELEVBQXZEOztBQUNBLEtBQUssQ0FBQyxTQUFOLENBQWdCLG1CQUFoQixFQUFxQyxTQUFTLENBQUMsTUFBL0MsRUFBdUQsRUFBdkQ7O0FBR0EsS0FBSyxDQUFDLFNBQU4sQ0FBZ0Isa0JBQWhCLEVBQW9DLGFBQXBDOztBQUdBLEtBQUssQ0FBQyxTQUFOLENBQWdCLG9CQUFoQixFQUFzQyxrQkFBdEMiLCJmaWxlIjoicGhvdG9ncmFwaHktcG9ydGZvbGlvLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIjIyNcbiAgICBMb2FkIERlcGVuZGVuY2llc1xuIyMjXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG4kID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuXG5cbiMgRXhwb3NlIHNvbWUgUGhvdG9ncmFwaHkgUG9ydGZvbGlvIG1vZHVsZXMgdG8gdGhlIHB1YmxpYyBmb3IgZXh0ZW5zaWJpbGl0eVxud2luZG93LlBQX01vZHVsZXMgPVxuXHQjIEV4dGVuZCBQb3J0Zm9saW8gSW50ZXJmYWNlIHRvIGJ1aWxkIGN1c3RvbSBwb3J0Zm9saW8gbGF5b3V0cyBiYXNlZCBvbiBQUCBFdmVudHNcblx0UG9ydGZvbGlvX0ludGVyZmFjZTogcmVxdWlyZSggJy4vcG9ydGZvbGlvL1BvcnRmb2xpb19JbnRlcmZhY2UnIClcblxuXHQjIFVzZSBgZ2FsbGVyeV9pdGVtX2RhdGFgIHRvIGdldCBmb3JtYXR0ZWQgaXRlbSBpbWFnZSBzaXplcyBmb3IgbGF6eSBsb2FkaW5nXG5cdGdhbGxlcnk6XG5cdFx0aXRlbV9kYXRhOiByZXF1aXJlKCAnLi9nYWxsZXJ5L2dhbGxlcnlfaXRlbV9kYXRhJyApXG5cdFx0aXRlbV9mYWN0b3J5OiByZXF1aXJlKCcuL2dhbGxlcnkvZ2FsbGVyeV9pdGVtX2ZhY3RvcnknKVxuXG5cdCMgRXh0ZW5kIEFic3RyYWN0X0xhenlfTG9kZXIgdG8gaW1wbGVtZW50IGxhenkgbG9hZGVyIGZvciB5b3VyIGxheW91dFxuXHRBYnN0cmFjdF9MYXp5X0xvYWRlcjogcmVxdWlyZSggJy4vbGF6eS9BYnN0cmFjdF9MYXp5X0xvYWRlcicgKVxuXG4jIyNcblx0SW5jbHVkZXNcbiMjI1xuXG4jIFN0YXJ0IFBvcnRmb2xpb1xucmVxdWlyZSAnLi9wb3J0Zm9saW8vc3RhcnQnXG5cbiMgR2FsbGVyeVxucmVxdWlyZSAnLi9nYWxsZXJ5L3BvcHVwJ1xuXG4jIExhenkgTG9hZGluZ1xucmVxdWlyZSAnLi9sYXp5L3N0YXJ0J1xuXG5cblxuXG4jIyNcblx0Qm9vdCBvbiBgZG9jdW1lbnQucmVhZHlgXG4jIyNcbiQoIGRvY3VtZW50ICkucmVhZHkgLT5cblxuXHQjIE9ubHkgcnVuIHRoaXMgc2NyaXB0IHdoZW4gYm9keSBoYXMgYFBQX1BvcnRmb2xpb2AgY2xhc3Ncblx0cmV0dXJuIGlmIG5vdCAkKCAnYm9keScgKS5oYXNDbGFzcyggJ1BQX1BvcnRmb2xpbycgKVxuXG5cdCMgQm9vdFxuXHRQaG90b2dyYXBoeV9Qb3J0Zm9saW8gPSBuZXcgKCByZXF1aXJlKCAnLi9jb3JlL1Bob3RvZ3JhcGh5X1BvcnRmb2xpbycgKSApKClcblx0UGhvdG9ncmFwaHlfUG9ydGZvbGlvLnJlYWR5KClcblxuXHRyZXR1cm4iLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuJCA9IHJlcXVpcmUoICdqUXVlcnknIClcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcblxuXG5jbGFzcyBDb3JlXG5cblx0Y29uc3RydWN0b3I6IC0+XG5cdFx0SG9va3MuYWRkQWN0aW9uICdwaG9ydC5jb3JlLnJlYWR5JywgQHdhaXRfZm9yX2xvYWRcblxuXHQjIFRyaWdnZXIgcGhvcnQuY29yZS5yZWFkeVxuXHRyZWFkeTogPT5cblx0XHRpZiBIb29rcy5hcHBseUZpbHRlcnMoICdwaG9ydC5jb3JlLnJlYWR5JywgdHJ1ZSApXG5cdFx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQuY29yZS5yZWFkeSdcblx0XHRyZXR1cm5cblxuXHR3YWl0X2Zvcl9sb2FkOiA9PlxuXHRcdCMgVHJpZ2dlciBpbWFnZXNMb2FkZWQgZXZlbnQgd2hlbiBpbWFnZXMgaGF2ZSBsb2FkZWRcblx0XHQkKCAnLlBQX1dyYXBwZXInICkuaW1hZ2VzTG9hZGVkKCBAbG9hZGVkIClcblxuXHQjIFRyaWdnZXIgcGhvcnQuY29yZS5sb2FkZWRcblx0bG9hZGVkOiAtPlxuXHRcdGlmIEhvb2tzLmFwcGx5RmlsdGVycyggJ3Bob3J0LmNvcmUubG9hZGVkJywgdHJ1ZSApXG5cdFx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQuY29yZS5sb2FkZWQnXG5cblx0XHRyZXR1cm5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IENvcmUiLCJtb2R1bGUuZXhwb3J0cyA9IHtcblxuXG4gICAgLyoqXG4gICAgICogVGhhbmsgeW91IFJ1c3MgZm9yIGhlbHBpbmcgbWUgYXZvaWQgd3JpdGluZyB0aGlzIG15c2VsZjpcbiAgICAgKiBAdXJsIGh0dHBzOi8vcmVteXNoYXJwLmNvbS8yMDEwLzA3LzIxL3Rocm90dGxpbmctZnVuY3Rpb24tY2FsbHMvI2NvbW1lbnQtMjc0NTY2MzU5NFxuICAgICAqL1xuICAgIHRocm90dGxlOiBmdW5jdGlvbiAoIGZuLCB0aHJlc2hob2xkLCBzY29wZSApIHtcbiAgICAgICAgdGhyZXNoaG9sZCB8fCAodGhyZXNoaG9sZCA9IDI1MClcbiAgICAgICAgdmFyIGxhc3QsXG4gICAgICAgICAgICBkZWZlclRpbWVyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgY29udGV4dCA9IHNjb3BlIHx8IHRoaXNcblxuICAgICAgICAgICAgdmFyIG5vdyAgPSArbmV3IERhdGUsXG4gICAgICAgICAgICAgICAgYXJncyA9IGFyZ3VtZW50c1xuICAgICAgICAgICAgaWYgKCBsYXN0ICYmIG5vdyA8IGxhc3QgKyB0aHJlc2hob2xkICkge1xuICAgICAgICAgICAgICAgIC8vIGhvbGQgb24gdG8gaXRcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoIGRlZmVyVGltZXIgKVxuICAgICAgICAgICAgICAgIGRlZmVyVGltZXIgPSBzZXRUaW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3QgPSBub3dcbiAgICAgICAgICAgICAgICAgICAgZm4uYXBwbHkoIGNvbnRleHQsIGFyZ3MgKVxuICAgICAgICAgICAgICAgIH0sIHRocmVzaGhvbGQgKyBsYXN0IC0gbm93IClcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGFzdCA9IG5vd1xuICAgICAgICAgICAgICAgIGZuLmFwcGx5KCBjb250ZXh0LCBhcmdzIClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuXG59IiwiSG9va3MgPSByZXF1aXJlKCAnd3BfaG9va3MnIClcblxuXG5nZXRfc2l6ZSA9IC0+XG5cdHdpZHRoIDogd2luZG93LmlubmVyV2lkdGggfHwgJHdpbmRvdy53aWR0aCgpXG5cdGhlaWdodDogd2luZG93LmlubmVySGVpZ2h0IHx8ICR3aW5kb3cuaGVpZ2h0KClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldF9zaXplKCkiLCJpdGVtID0gKCBkYXRhX29iaiApIC0+XG5cblx0cGx1Y2sgPSAoIG9iamVjdCwga2V5ICkgLT5cblx0XHRpZiBvYmplY3QgYW5kIG9iamVjdFsga2V5IF1cblx0XHRcdHJldHVybiBvYmplY3RbIGtleSBdXG5cdFx0cmV0dXJuIGZhbHNlXG5cblx0Z2V0ID0gKCBrZXkgKSAtPiBwbHVjayggZGF0YV9vYmosIGtleSApXG5cblx0aW1hZ2UgPSAoIHNpemVfbmFtZSApIC0+IHBsdWNrKCBnZXQoICdpbWFnZXMnICksIHNpemVfbmFtZSApXG5cblxuXHRzaXplOiAoIHNpemVfbmFtZSApIC0+XG5cdFx0aW1hZ2Vfc2l6ZSA9IHBsdWNrKCBpbWFnZSggc2l6ZV9uYW1lICksICdzaXplJyApXG5cdFx0cmV0dXJuIGZhbHNlIGlmIG5vdCBpbWFnZV9zaXplXG5cblx0XHRbd2lkdGgsIGhlaWdodF0gPSBpbWFnZV9zaXplLnNwbGl0KCAneCcgKVxuXG5cdFx0d2lkdGggPSBwYXJzZUludCggd2lkdGggKVxuXHRcdGhlaWdodCA9IHBhcnNlSW50KCBoZWlnaHQgKVxuXG5cdFx0cmV0dXJuIFsgd2lkdGgsIGhlaWdodCBdXG5cblx0dXJsOiAoIHNpemVfbmFtZSApIC0+IHBsdWNrKCBpbWFnZSggc2l6ZV9uYW1lICksICd1cmwnIClcblx0Z2V0OiBnZXRcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGl0ZW0iLCJpdGVtID0gcmVxdWlyZSgnLi9nYWxsZXJ5X2l0ZW1fZGF0YScpXG5cbml0ZW1fZGF0YSA9ICggJGVsICkgLT5cblx0ZGF0YV9vYmogPSAkZWwuZGF0YSggJ2l0ZW0nIClcblxuXHRpZiBub3QgZGF0YV9vYmpcblx0XHR0aHJvdyBuZXcgRXJyb3IgXCJFbGVtZW50IGRvZXNuJ3QgY29udGFpbiBgZGF0YS1pdGVtYCBhdHRyaWJ1dGVcIlxuXG5cdHJldHVybiBpdGVtKCBkYXRhX29iaiApXG5cblxubW9kdWxlLmV4cG9ydHMgPSBpdGVtX2RhdGEiLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuJCA9IHJlcXVpcmUoIFwialF1ZXJ5XCIgKVxuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuXG5kZWZhdWx0cyA9XG5cdGR5bmFtaWMgOiB0cnVlXG5cdHNwZWVkICAgOiAzNTBcblx0cHJlbG9hZCA6IDNcblx0ZG93bmxvYWQ6IGZhbHNlXG5cdGVzY0tleSAgOiBmYWxzZSAjIFdlJ3JlIHJvbGxpbmcgb3VyIG93blxuXG5cdHRodW1ibmFpbCAgICAgICAgIDogdHJ1ZVxuXHRzaG93VGh1bWJCeURlZmF1bHQ6IHRydWVcblxuIyBAVE9ETzogVXNlIE9iamVjdC5hc3NpZ24oKSB3aXRoIEJhYmVsXG5zZXR0aW5ncyA9ICQuZXh0ZW5kKCB7fSwgZGVmYXVsdHMsIHdpbmRvdy5fX3Bob3J0LmxpZ2h0R2FsbGVyeSApXG5cblxuc2luZ2xlX2l0ZW1fZGF0YSA9ICggaXRlbSApIC0+XG5cblx0aWYgaXRlbS5kYXRhLmdldCggJ3R5cGUnICkgaXMgJ3ZpZGVvJ1xuXHRcdGZ1bGwgPSBpdGVtLmRhdGEuZ2V0KCAndmlkZW9fdXJsJyApXG5cdGVsc2Vcblx0XHRmdWxsID0gaXRlbS5kYXRhLnVybCggJ2Z1bGwnIClcblxuXHRyZXR1cm4ge1xuXHRcdHNyYyAgICA6IGZ1bGxcblx0XHR0aHVtYiAgOiBpdGVtLmRhdGEudXJsKCAndGh1bWInIClcblx0XHRzdWJIdG1sOiBpdGVtLmNhcHRpb25cblx0fVxuXG5cbmdldF9zZXR0aW5ncyA9ICggZ2FsbGVyeSwgaW5kZXggKSAtPlxuXHRzZXR0aW5ncy5pbmRleCAgICAgICAgID0gaW5kZXhcblx0c2V0dGluZ3MuZHluYW1pY0VsICAgICA9IGdhbGxlcnkubWFwKCBzaW5nbGVfaXRlbV9kYXRhIClcblx0c2V0dGluZ3MudmlkZW9NYXhXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoICogMC44XG5cblx0SG9va3MuYXBwbHlGaWx0ZXJzICdwaG9ydC5saWdodEdhbGxlcnkuc2V0dGluZ3MnLCBzZXR0aW5nc1xuXG5cbm1vZHVsZS5leHBvcnRzID0gKCAkZWwgKSAtPlxuXHRjbG9zZTogLT5cblx0XHRHYWxsZXJ5ID0gJGVsLmRhdGEoICdsaWdodEdhbGxlcnknIClcblx0XHRHYWxsZXJ5LmRlc3Ryb3koICkgaWYgR2FsbGVyeSBhbmQgR2FsbGVyeS5kZXN0cm95P1xuXG5cdG9wZW46ICggJGdhbGxlcnlfaXRlbXMsIGluZGV4ICkgLT5cblx0XHRHYWxsZXJ5ID0gJGVsLmxpZ2h0R2FsbGVyeSggZ2V0X3NldHRpbmdzKCAkZ2FsbGVyeV9pdGVtcywgaW5kZXggKSApXG5cblxuXG4iLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuJCA9IHJlcXVpcmUoIFwialF1ZXJ5XCIgKVxuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuXG5cbmRlZmF1bHRzID1cblx0aW5kZXggICAgICAgOiAwXG5cdHByZWxvYWQgICAgIDogWyAxLCAzIF1cblx0ZXNjS2V5ICAgICAgOiBmYWxzZVxuXHRzaGFyZUJ1dHRvbnM6IFtcblx0XHQjIEBUT0RPOiBpMThuIGZvciBsYWJlbHNcblx0XHR7IGlkOiAnZmFjZWJvb2snLCBsYWJlbDogJ1NoYXJlIG9uIEZhY2Vib29rJywgdXJsOiAnaHR0cHM6Ly93d3cuZmFjZWJvb2suY29tL3NoYXJlci9zaGFyZXIucGhwP3U9e3t1cmx9fScgfVxuXHRcdHsgaWQ6ICd0d2l0dGVyJywgbGFiZWw6ICdUd2VldCcsIHVybDogJ2h0dHBzOi8vdHdpdHRlci5jb20vaW50ZW50L3R3ZWV0P3RleHQ9e3t0ZXh0fX0mdXJsPXt7dXJsfX0nIH1cblx0XHR7IGlkOiAncGludGVyZXN0JywgbGFiZWw6ICdQaW4gaXQnLCB1cmw6ICdodHRwOi8vd3d3LnBpbnRlcmVzdC5jb20vcGluL2NyZWF0ZS9idXR0b24vP3VybD17e3VybH19Jm1lZGlhPXt7aW1hZ2VfdXJsfX0mZGVzY3JpcHRpb249e3t0ZXh0fX0nIH1cblx0XVxuXG5cbnBzd3AgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCAnLnBzd3AnIClcblVJID0gSG9va3MuYXBwbHlGaWx0ZXJzKCBcInBob3J0LnBob3Rvc3dpcGUuVUlcIiwgd2luZG93LlBob3RvU3dpcGVVSV9EZWZhdWx0IClcblBob3RvU3dpcGUgPSB3aW5kb3cuUGhvdG9Td2lwZVxuXG5cbmNyZWF0ZSA9ICggZGF0YSwgb3B0cyA9IHt9ICkgLT5cblx0b3B0aW9ucyA9IEhvb2tzLmFwcGx5RmlsdGVycyggXCJwaG9ydC5waG90b3N3aXBlLm9wdGlvbnNcIiwgJC5leHRlbmQoIHt9LCBkZWZhdWx0cywgb3B0cyApIClcblxuXHQjIEluZGV4IGlzIDAgYnkgZGVmYXVsdFxuXHRpZiBub3Qgb3B0aW9ucy5pbmRleD9cblx0XHRvcHRpb25zLmluZGV4ID0gMFxuXG5cdCMgU2V0IHRoZSBpbmRleCB0byAwIGlmIGl0IGlzbid0IGEgcHJvcGVyIHZhbHVlXG5cdGlmIG5vdCBvcHRpb25zLmluZGV4IG9yIG9wdGlvbnMuaW5kZXggPCAwXG5cdFx0b3B0aW9ucy5pbmRleCA9IDBcblxuXHRpbnN0YW5jZSA9IG5ldyBQaG90b1N3aXBlKCBwc3dwLCBVSSwgZGF0YSwgb3B0aW9ucyApXG5cdGluc3RhbmNlLmluaXQoIClcblxuXHRyZXR1cm4gaW5zdGFuY2VcblxuXG5zaW5nbGVfaXRlbV9kYXRhID0gKCBpdGVtICkgLT5cblx0IyBQaG90b1N3aXBlIHN1cHBvcnRzIG9ubHkgaW1hZ2VzXG5cdHJldHVybiBpZiBpdGVtLmRhdGEuZ2V0KCd0eXBlJykgaXNudCAnaW1hZ2UnXG5cblxuXG5cdFt3aWR0aCwgaGVpZ2h0XSA9IGl0ZW0uZGF0YS5zaXplKCAnZnVsbCcgKVxuXG5cdCMgcmV0dXJuXG5cdHNyYyAgOiBpdGVtLmRhdGEudXJsKCAnZnVsbCcgKVxuXHRtc3JjIDogaXRlbS5kYXRhLnVybCggJ2Z1bGwnIClcblx0dyAgICA6IHdpZHRoXG5cdGggICAgOiBoZWlnaHRcblx0dGl0bGU6IGl0ZW0uY2FwdGlvblxuXG5cbnRodW1ibmFpbF9wb3NpdGlvbiA9ICggJGVsICkgLT4gcmV0dXJuIC0+XG5cdHJldHVybiBmYWxzZSBpZiBub3QgJGVsXG5cblx0dGh1bWJuYWlsID0gJGVsLmZpbmQoICdpbWcnICkuZ2V0KCAwIClcblx0cGFnZVlTY3JvbGwgPSB3aW5kb3cucGFnZVlPZmZzZXQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcFxuXHRyZWN0ID0gdGh1bWJuYWlsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCggKVxuXG5cdCMgLy8gdyA9IHdpZHRoXG5cdG91dCA9XG5cdFx0eDogcmVjdC5sZWZ0XG5cdFx0eTogcmVjdC50b3AgKyBwYWdlWVNjcm9sbFxuXHRcdHc6IHJlY3Qud2lkdGhcblxuXHRyZXR1cm4gb3V0XG5cblxubW9kdWxlLmV4cG9ydHMgPSAoICRlbCApIC0+XG5cdEdhbGxlcnkgPSBmYWxzZVxuXG5cdGNsb3NlOiAtPlxuXHRcdHJldHVybiBpZiBub3QgR2FsbGVyeVxuXHRcdEdhbGxlcnkuY2xvc2UoIClcblx0XHRHYWxsZXJ5ID0gZmFsc2VcblxuXHRvcGVuOiAoIGdhbGxlcnksIGluZGV4ICkgLT5cblxuXHRcdG9wdGlvbnMgPVxuXHRcdFx0Z2V0VGh1bWJCb3VuZHNGbjogdGh1bWJuYWlsX3Bvc2l0aW9uKCAkZWwgKVxuXHRcdFx0aW5kZXggICAgICAgICAgIDogaW5kZXhcblxuXHRcdEdhbGxlcnkgPSBjcmVhdGUoIGdhbGxlcnkubWFwKCBzaW5nbGVfaXRlbV9kYXRhICksIG9wdGlvbnMgKVxuXG5cbiIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG4kID0gcmVxdWlyZSggXCJqUXVlcnlcIiApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5nYWxlcnlfaXRlbSA9IHJlcXVpcmUoICcuL2dhbGxlcnlfaXRlbV9mYWN0b3J5JyApXG5cblxuZ2FsbGVyeV90eXBlID0gd2luZG93Ll9fcGhvcnQucG9wdXBfZ2FsbGVyeSB8fCAnbGlnaHRnYWxsZXJ5J1xuXG5pZiBnYWxsZXJ5X3R5cGUgaXMgJ2xpZ2h0Z2FsbGVyeSdcblx0R2FsbGVyeSA9IHJlcXVpcmUoICcuL2xpZ2h0R2FsbGVyeScgKVxuXG5pZiBnYWxsZXJ5X3R5cGUgaXMgJ3Bob3Rvc3dpcGUnXG5cdEdhbGxlcnkgPSByZXF1aXJlKCAnLi9waG90b3N3aXBlJyApXG5cbnJldHVybiBpZiBub3QgR2FsbGVyeVxuXG5cbnBvcHVwID0gZmFsc2VcblxucGFyc2VfZ2FsbGVyeV9pdGVtID0gKCBrZXksIGVsICkgLT5cblx0JGVsID0gJCggZWwgKVxuXG5cdGluZGV4ICA6IGtleVxuXHRkYXRhICAgOiBnYWxlcnlfaXRlbSggJGVsIClcblx0Y2FwdGlvbjogJGVsLmZpbmQoICcuUFBfR2FsbGVyeV9fY2FwdGlvbicgKS5odG1sKCApIHx8ICcnXG5cbm9wZW5fZ2FsbGVyeSA9ICggZWwgKSAtPlxuXHQkZWwgPSAkKCBlbCApXG5cdCRpdGVtcyA9ICRlbC5jbG9zZXN0KCAnLlBQX0dhbGxlcnknICkuZmluZCggJy5QUF9HYWxsZXJ5X19pdGVtJyApXG5cblx0aWYgJGl0ZW1zLmxlbmd0aCA+IDBcblx0XHRpbmRleCA9ICRpdGVtcy5pbmRleCggJGVsIClcblx0XHRnYWxsZXJ5X2l0ZW1zID0gJC5tYWtlQXJyYXkoICRpdGVtcy5tYXAoIHBhcnNlX2dhbGxlcnlfaXRlbSApIClcblxuXHRcdHBvcHVwID0gR2FsbGVyeSggJGVsIClcblx0XHRwb3B1cC5vcGVuKCBnYWxsZXJ5X2l0ZW1zLCBpbmRleCApXG5cbmNsb3NlX2dhbGxlcnkgPSAtPlxuXHRyZXR1cm4gZmFsc2UgaWYgbm90IHBvcHVwXG5cdHBvcHVwLmNsb3NlKCApXG5cdHBvcHVwID0gZmFsc2VcblxuXG4jI1xuIyMgQXR0YWNoIEV2ZW50c1xuIyNcbiQoIGRvY3VtZW50ICkub24gJ2NsaWNrJywgJy5QUF9HYWxsZXJ5X19pdGVtJywgKCBlICkgLT5cblx0ZS5wcmV2ZW50RGVmYXVsdCggKVxuXHRvcGVuX2dhbGxlcnkoIHRoaXMgKVxuXG5pZiBIb29rcy5hcHBseUZpbHRlcnMgJ3Bob3J0LmdhbGxlcnkuY3VzdG9tX2VzYycsIHRydWVcblx0JCggd2luZG93ICkub24gJ2tleWRvd24nLCAoIGUgKSAtPlxuXHRcdHJldHVybiB1bmxlc3MgZS5rZXlDb2RlIGlzIDI3XG5cdFx0Y2xvc2VfZ2FsbGVyeSggKVxuXHRcdGUucHJldmVudERlZmF1bHQoIClcblxuIiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5nYWxsZXJ5X2l0ZW0gPSByZXF1aXJlKCAnLi4vZ2FsbGVyeS9nYWxsZXJ5X2l0ZW1fZmFjdG9yeScgKVxuX19XSU5ET1cgPSByZXF1aXJlKCAnLi4vY29yZS9XaW5kb3cnIClcbnRocm90dGxlID0gcmVxdWlyZSgnLi4vY29yZS9VdGlsaXRpZXMnKS50aHJvdHRsZVxuXG5jbGFzcyBBYnN0cmFjdF9MYXp5X0xvYWRlclxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRARWxlbWVudHMgPVxuXHRcdFx0aXRlbSAgICAgICA6ICdQUF9MYXp5X0ltYWdlJ1xuXHRcdFx0cGxhY2Vob2xkZXI6ICdQUF9MYXp5X0ltYWdlX19wbGFjZWhvbGRlcidcblx0XHRcdGxpbmsgICAgICAgOiAnUFBfSlNfTGF6eV9fbGluaydcblx0XHRcdGltYWdlICAgICAgOiAnUFBfSlNfTGF6eV9faW1hZ2UnXG5cblx0XHRASXRlbXMgPSBbXVxuXG5cdFx0IyBBZGp1c3RhYmxlIFNlbnNpdGl2aXR5IGZvciBAaW5fdmlldyBmdW5jdGlvblxuXHRcdCMgVmFsdWUgaW4gcGl4ZWxzXG5cdFx0QFNlbnNpdGl2aXR5ID0gMTAwXG5cblx0XHQjIEF1dG8tc2V0dXAgd2hlbiBldmVudHMgYXJlIGF0dGFjaGVkXG5cdFx0IyBBdXRvLWRlc3Ryb3kgd2hlbiBldmVudHMgYXJlIGRldGFjaGVkXG5cdFx0QHRocm90dGxlZF9hdXRvbG9hZCA9IG51bGxcblxuXHRcdEBzZXR1cF9pdGVtcygpXG5cdFx0QHJlc2l6ZV9hbGwoKVxuXHRcdEBhdHRhY2hfZXZlbnRzKClcblxuXHQjIyNcblx0XHRBYnN0cmFjdCBNZXRob2RzXG5cdCMjI1xuXG5cdCMgVGhpcyBpcyBydW4gd2hlbiBhIHJlc2l6ZSBvciByZWZyZXNoIGV2ZW50IGlzIGRldGVjdGVkXG5cdHJlc2l6ZTogLT4gcmV0dXJuXG5cblx0bG9hZDogKCBpdGVtICkgLT5cblx0XHRAbG9hZF9pbWFnZSggaXRlbSApXG5cdFx0aXRlbS4kZWwuaW1hZ2VzTG9hZGVkID0+XG5cdFx0XHRAY2xlYW51cF9hZnRlcl9sb2FkKCBpdGVtIClcblxuXHRsb2FkX2ltYWdlOiAoIGl0ZW0gKSAtPlxuXG5cdFx0IyBHZXQgaW1hZ2UgVVJMc1xuXHRcdHRodW1iID0gaXRlbS5kYXRhLnVybCggJ3RodW1iJyApXG5cdFx0ZnVsbCA9IGl0ZW0uZGF0YS51cmwoICdmdWxsJyApXG5cblx0XHQjIENyZWF0ZSBlbGVtZW50c1xuXHRcdGl0ZW0uJGVsXG5cdFx0XHQucHJlcGVuZCggQGdldF9pdGVtX2h0bWwoIHRodW1iLCBmdWxsICkgKVxuXHRcdFx0LnJlbW92ZUNsYXNzKCAnTGF6eS1JbWFnZScgKVxuXG5cdFx0IyBNYWtlIHN1cmUgdGhpcyBpbWFnZSBpc24ndCBsb2FkZWQgYWdhaW5cblx0XHRpdGVtLmxvYWRlZCA9IHRydWVcblxuXHRjbGVhbnVwX2FmdGVyX2xvYWQ6ICggaXRlbSApIC0+XG5cdFx0IyBBZGQgaW1hZ2UgUFBfSlNfbG9hZGVkIGNsYXNzXG5cdFx0aXRlbS4kZWwuZmluZCggJ2ltZycgKS5hZGRDbGFzcyggJ1BQX0pTX19sb2FkZWQnICkucmVtb3ZlQ2xhc3MoICdQUF9KU19fbG9hZGluZycgKVxuXG5cdFx0aXRlbS4kZWxcblxuXHRcdFx0IyBSZW1vdmUgYFBQX0xhenlfSW1hZ2VgLCBhcyB0aGlzIGlzIG5vdCBhIGxhenktbG9hZGFibGUgaW1hZ2UgYW55bW9yZVxuXHRcdFx0LnJlbW92ZUNsYXNzKCBARWxlbWVudHMuaXRlbSApXG5cblx0XHRcdCMgUmVtb3ZlIFBsYWNlaG9sZGVyXG5cdFx0XHQuZmluZCggXCIuI3tARWxlbWVudHMucGxhY2Vob2xkZXJ9XCIgKVxuXHRcdFx0LmZhZGVPdXQoIDQwMCwgLT4gJCggdGhpcyApLnJlbW92ZSgpIClcblxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5sYXp5LmxvYWRlZF9pdGVtJywgaXRlbVxuXG5cblx0Z2V0X2l0ZW1faHRtbDogKCB0aHVtYiwgZnVsbCApIC0+XG5cblx0XHRpZiAnZGlzYWJsZScgaXMgd2luZG93Ll9fcGhvcnQucG9wdXBfZ2FsbGVyeVxuXHRcdFx0cmV0dXJuIFwiXCJcIlxuXHRcdFx0PGRpdiBjbGFzcz1cIiN7QEVsZW1lbnRzLmxpbmt9XCIgcmVsPVwiZ2FsbGVyeVwiPlxuXHRcdFx0XHQ8aW1nIGNsYXNzPVwiI3tARWxlbWVudHMuaW1hZ2V9XCIgc3JjPVwiI3t0aHVtYn1cIiBjbGFzcz1cIlBQX0pTX19sb2FkaW5nXCIgLz5cblx0XHRcdDwvZGl2PlxuXHRcdFx0XCJcIlwiXG5cdFx0ZWxzZVxuXHRcdFx0cmV0dXJuIFwiXCJcIlxuXHRcdFx0PGEgY2xhc3M9XCIje0BFbGVtZW50cy5saW5rfVwiIGhyZWY9XCIje2Z1bGx9XCIgcmVsPVwiZ2FsbGVyeVwiPlxuXHRcdFx0XHQ8aW1nIGNsYXNzPVwiI3tARWxlbWVudHMuaW1hZ2V9XCIgc3JjPVwiI3t0aHVtYn1cIiBjbGFzcz1cIlBQX0pTX19sb2FkaW5nXCIgLz5cblx0XHRcdDwvYT5cblx0XHRcdFwiXCJcIlxuXG5cdHNldHVwX2l0ZW1zOiA9PlxuXHRcdCMgQ2xlYXIgZXhpc3RpbmcgaXRlbXMsIGlmIGFueVxuXHRcdEBJdGVtcyA9IFtdXG5cblx0XHQjIExvb3Agb3ZlciBET00gYW5kIGFkZCBlYWNoIGl0ZW0gdG8gQEl0ZW1zXG5cdFx0JCggXCIuI3tARWxlbWVudHMuaXRlbX1cIiApLmVhY2goIEBhZGRfaXRlbSApXG5cdFx0cmV0dXJuXG5cblx0YWRkX2l0ZW06ICgga2V5LCBlbCApID0+XG5cdFx0JGVsID0gJCggZWwgKVxuXHRcdEBJdGVtcy5wdXNoXG5cdFx0XHRlbCAgICA6IGVsXG5cdFx0XHQkZWwgICA6ICRlbFxuXHRcdFx0ZGF0YSAgOiBnYWxsZXJ5X2l0ZW0oICRlbCApXG5cdFx0XHRsb2FkZWQ6IGZhbHNlXG5cblxuXHRcdHJldHVyblxuXG5cblx0IyMjXG5cdFx0TWV0aG9kc1xuXHQjIyNcblx0cmVzaXplX2FsbDogLT5cblx0XHRAcmVzaXplKCBpdGVtICkgZm9yIGl0ZW0gaW4gQEl0ZW1zXG5cblxuXG5cdCMgQXV0b21hdGljYWxseSBMb2FkIGFsbCBpdGVtcyB0aGF0IGFyZSBgaW5fbG9vc2Vfdmlld2Bcblx0YXV0b2xvYWQ6ID0+XG5cdFx0Zm9yIGl0ZW0sIGtleSBpbiBASXRlbXNcblx0XHRcdGlmIG5vdCBpdGVtLmxvYWRlZCBhbmQgQGluX2xvb3NlX3ZpZXcoIGl0ZW0uZWwgKVxuXHRcdFx0XHRAbG9hZCggaXRlbSApXG5cblx0aW5fbG9vc2VfdmlldzogKCBlbCApIC0+XG5cdFx0cmV0dXJuIHRydWUgaWYgbm90IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdD9cblx0XHRyZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcblxuXHRcdCMgRWxlbWVudHMgbm90IGluIHZpZXcgaWYgdGhleSBkb24ndCBoYXZlIGRpbWVuc2lvbnNcblx0XHRyZXR1cm4gZmFsc2UgaWYgcmVjdC5oZWlnaHQgaXMgMCBhbmQgcmVjdC53aWR0aCBpcyAwXG5cblxuXHRcdHJldHVybiAoXG5cdFx0XHQjIFkgQXhpc1xuXHRcdFx0cmVjdC50b3AgKyByZWN0LmhlaWdodCA+PSAtQFNlbnNpdGl2aXR5IGFuZCAjIHRvcFxuXHRcdFx0cmVjdC5ib3R0b20gLSByZWN0LmhlaWdodCA8PSBfX1dJTkRPVy5oZWlnaHQgKyBAU2Vuc2l0aXZpdHkgYW5kXG5cblx0XHRcdCMgWCBBeGlzXG5cdFx0XHRyZWN0LmxlZnQgKyByZWN0LndpZHRoID49IC1AU2Vuc2l0aXZpdHkgYW5kXG5cdFx0XHRyZWN0LnJpZ2h0IC0gcmVjdC53aWR0aCA8PSBfX1dJTkRPVy53aWR0aCArIEBTZW5zaXRpdml0eVxuXG5cdFx0KVxuXG5cdGRlc3Ryb3k6IC0+XG5cdFx0QGRldGFjaF9ldmVudHMoKVxuXG5cdGF0dGFjaF9ldmVudHM6IC0+XG5cdFx0IyBDcmVhdGUgYSBkZWJvdW5jZWQgYGF1dG9sb2FkYCBmdW5jdGlvblxuXHRcdEB0aHJvdHRsZWRfYXV0b2xvYWQgPSB0aHJvdHRsZSggQGF1dG9sb2FkLCA1MCApXG5cdFx0SG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCcsIEB0aHJvdHRsZWRfYXV0b2xvYWQsIDEwMFxuXG5cblx0ZGV0YWNoX2V2ZW50czogLT5cblx0XHQjIENsZWFyIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gZnJvbSBpbnN0YW5jZVxuXHRcdEB0aHJvdHRsZWRfYXV0b2xvYWQgPSBudWxsXG5cdFx0SG9va3MucmVtb3ZlQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCcsIEB0aHJvdHRsZWRfYXV0b2xvYWQsIDEwMFxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBYnN0cmFjdF9MYXp5X0xvYWRlclxuIiwiJCA9IHJlcXVpcmUoICdqUXVlcnknIClcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcbkFic3RyYWN0X0xhenlfTG9hZGVyID0gcmVxdWlyZSggJy4vQWJzdHJhY3RfTGF6eV9Mb2FkZXInIClcbl9fV0lORE9XID0gcmVxdWlyZSggJy4uL2NvcmUvV2luZG93JyApXG5cbmNsYXNzIExhenlfTWFzb25yeSBleHRlbmRzIEFic3RyYWN0X0xhenlfTG9hZGVyXG5cblx0cmVzaXplX2FsbDogLT5cblx0XHRAcGxhY2Vob2xkZXJfd2lkdGggPSAkKCAnLlBQX01hc29ucnlfX3NpemVyJyApLndpZHRoKClcblx0XHRzdXBlcigpXG5cblx0cmVzaXplOiAoIGl0ZW0gKSAtPlxuXHRcdGl0ZW0uJGVsLmNzcyAnbWluLWhlaWdodCc6IE1hdGguZmxvb3IoIEBwbGFjZWhvbGRlcl93aWR0aCAvIGl0ZW0uZGF0YS5nZXQoJ3JhdGlvJykgKVxuXG5cdGNsZWFudXBfYWZ0ZXJfbG9hZDogKGl0ZW0pIC0+XG5cdFx0IyBSZW1vdmUgbWluLWhlaWdodFxuXHRcdGl0ZW0uJGVsLmNzcyggJ21pbi1oZWlnaHQnLCAnJyApXG5cblx0XHQjIFJ1biBhbGwgb3RoZXIgY2xlYW51cHNcblx0XHRzdXBlciggaXRlbSApXG5cblx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnXG5cblx0XHRyZXR1cm5cblxuXHRhdHRhY2hfZXZlbnRzOiAtPlxuXHRcdCMgQ2FsbCBQYXJlbnQgZmlyc3QsIGl0J3MgZ29pbmcgdG8gY3JlYXRlIEB0aHJvdHRsZWRfYXV0b2xvYWRcblx0XHRzdXBlcigpXG5cblx0XHQjIEF0dGFjaFxuXHRcdCQoIHdpbmRvdyApLm9uICdzY3JvbGwnLCBAdGhyb3R0bGVkX2F1dG9sb2FkXG5cblxuXG5cdGRldGFjaF9ldmVudHM6IC0+XG5cdFx0IyBEZXRhY2hcblx0XHQkKCB3aW5kb3cgKS5vZmYgJ3Njcm9sbCcsIEB0aHJvdHRsZWRfYXV0b2xvYWRcblxuXHRcdCMgQ2FsbCBwYXJlbnQgbGFzdCwgaXQncyBnb2luZyB0byBjbGVhbiB1cCBAdGhyb3R0bGVkX2F1dG9sb2FkXG5cdFx0c3VwZXIoKVxuXG5cdGRlc3Ryb3k6IC0+XG5cdFx0Zm9yIGl0ZW0sIGtleSBpbiBASXRlbXNcblx0XHRcdGl0ZW0uJGVsLmNzcyAnbWluLWhlaWdodCcsICcnXG5cdFx0c3VwZXIoKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gTGF6eV9NYXNvbnJ5XG4iLCIkID0gcmVxdWlyZSggJ2pRdWVyeScgKVxuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuXG5cbmluc3RhbmNlID0gZmFsc2VcblxuZGVzdHJveSA9IC0+XG5cdHJldHVybiBpZiBub3QgaW5zdGFuY2Vcblx0aW5zdGFuY2UuZGVzdHJveSgpXG5cdGluc3RhbmNlID0gbnVsbFxuXG5jcmVhdGUgPSAtPlxuXG5cdCMgTWFrZSBzdXJlIGFuIGluc3RhbmNlIGRvZXNuJ3QgYWxyZWFkeSBleGlzdFxuXHRkZXN0cm95KClcblxuXHQjIEhhbmRsZXIgcmVxdWlyZWRcblx0SGFuZGxlciA9IEhvb2tzLmFwcGx5RmlsdGVycyAncGhvcnQubGF6eS5oYW5kbGVyJywgZmFsc2Vcblx0cmV0dXJuIGlmIG5vdCBIYW5kbGVyXG5cblx0IyBCeSBkZWZhdWx0IExhenlfTWFzb25yeSBpcyBoYW5kbGluZyBMYXp5LUxvYWRpbmdcblx0IyBDaGVjayBpZiBhbnlvbmUgd2FudHMgdG8gaGlqYWNrIGhhbmRsZXJcblx0aW5zdGFuY2UgPSBuZXcgSGFuZGxlcigpXG5cblx0cmV0dXJuXG5cblxuIyBJbml0aWFsaXplIGxhenkgbG9hZGVyIGFmdGVyIHRoZSBwb3J0Zm9saW8gaXMgcHJlcGFyZWQsIHAgPSAxMDBcbkhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnLCBjcmVhdGUsIDEwMFxuSG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScsIGRlc3Ryb3kiLCJIb29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5cbiMjI1xuXG4gICAgIyBJbml0aWFsaXplIFBvcnRmb2xpbyBDb3JlXG5cdC0tLVxuXHRcdFVzaW5nIHA1MCBAIGBwaG9ydC5jb3JlLnJlYWR5YFxuXHRcdExhdGUgcHJpb3JpdHkgaXMgZ29pbmcgdG8gZm9yY2UgZXhwbGljaXQgcHJpb3JpdHkgaW4gYW55IG90aGVyIG1vdmluZyBwYXJ0cyB0aGF0IGFyZSBnb2luZyB0byB0b3VjaCBwb3J0Zm9saW8gbGF5b3V0IGF0IGBwaG9ydC5sb2FkZWRgXG5cdC0tLVxuXG4jIyNcbmNsYXNzIFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyXG5cblx0cHJlcGFyZTogLT5cblx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnXG5cdFx0cmV0dXJuXG5cblx0Y3JlYXRlOiAtPlxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uY3JlYXRlJ1xuXHRcdHJldHVyblxuXG5cblx0cmVmcmVzaDogLT5cblx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnXG5cdFx0cmV0dXJuXG5cblxuXHRkZXN0cm95OiAtPlxuXHRcdCMgRGVzdHJveVxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveSdcblx0XHRyZXR1cm5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyIiwiSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuXG5cbiMjI1xuXHRBYnN0cmFjdCBDbGFzcyBQb3J0b2ZsaW9fRXZlbnRfSW1lcGxlbWVudGF0aW9uXG5cbiAgICBIYW5kbGVzIGFsbCB0aGUgZXZlbnRzIHJlcXVpcmVkIHRvIGZ1bGx5IGhhbmRsZSBhIHBvcnRmb2xpbyBsYXlvdXQgcHJvY2Vzc1xuIyMjXG5jbGFzcyBQb3J0Zm9saW9fSW50ZXJmYWNlXG5cblx0Y29uc3RydWN0b3I6ICggYXJncyApIC0+XG5cdFx0QHNldHVwX2FjdGlvbnMoKVxuXHRcdEBpbml0aWFsaXplKCBhcmdzIClcblxuXHRzZXR1cF9hY3Rpb25zOiAtPlxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnLCBAcHJlcGFyZSwgNTBcblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5jcmVhdGUnLCBAY3JlYXRlLCA1MFxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCBAcmVmcmVzaCwgNTBcblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgQGRlc3Ryb3ksIDUwXG5cdFx0SG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScsIEBwdXJnZV9hY3Rpb25zLCAxMDBcblxuXHRwdXJnZV9hY3Rpb25zOiA9PlxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnByZXBhcmUnLCBAcHJlcGFyZSwgNTBcblx0XHRIb29rcy5yZW1vdmVBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5jcmVhdGUnLCBAY3JlYXRlLCA1MFxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnLCBAcmVmcmVzaCwgNTBcblx0XHRIb29rcy5yZW1vdmVBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgQGRlc3Ryb3ksIDUwXG5cdFx0SG9va3MucmVtb3ZlQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8uZGVzdHJveScsIEBwdXJnZV9hY3Rpb25zLCAxMDBcblxuXG5cdCMjI1xuICAgIFx0UmVxdWlyZSB0aGVzZSBtZXRob2RzXG5cdCMjI1xuXHRpbml0aWFsaXplOiAtPiB0aHJvdyBuZXcgRXJyb3IoIFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGBpbml0aWFsaXplYCBtZXRob2RcIiApXG5cdHByZXBhcmUgICA6IC0+IHRocm93IG5ldyBFcnJvciggXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYHByZXBhcmVgIG1ldGhvZFwiIClcblx0Y3JlYXRlICAgIDogLT4gdGhyb3cgbmV3IEVycm9yKCBcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgY3JlYXRlYCBtZXRob2RcIiApXG5cdHJlZnJlc2ggICA6IC0+IHRocm93IG5ldyBFcnJvciggXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYHJlZnJlc2hgIG1ldGhvZFwiIClcblx0ZGVzdHJveSAgIDogLT4gdGhyb3cgbmV3IEVycm9yKCBcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgZGVzdHJveWAgbWV0aG9kXCIgKVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW9fSW50ZXJmYWNlIiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5Qb3J0Zm9saW9fSW50ZXJmYWNlID0gcmVxdWlyZSggJy4vUG9ydGZvbGlvX0ludGVyZmFjZScgKVxuXG4jIEBUT0RPOiBOZWVkIGEgaGVhdnZ5IHJlZmFjdG9yIC0gbm8gbW9yZSBjbGFzc2VzIHBsZWFzZVxuY2xhc3MgUG9ydGZvbGlvX01hc29ucnkgZXh0ZW5kcyBQb3J0Zm9saW9fSW50ZXJmYWNlXG5cblx0Y29uc3RydWN0b3I6IC0+XG5cblx0XHRARWxlbWVudHMgPVxuXHRcdFx0Y29udGFpbmVyOiAnUFBfTWFzb25yeSdcblx0XHRcdHNpemVyICAgIDogJ1BQX01hc29ucnlfX3NpemVyJ1xuXHRcdFx0aXRlbSAgICAgOiAnUFBfTWFzb25yeV9faXRlbSdcblxuXHRcdHN1cGVyKClcblxuXHQjIyNcblx0XHRJbml0aWFsaXplXG5cdCMjI1xuXHRpbml0aWFsaXplOiAtPlxuXHRcdEAkY29udGFpbmVyID0gJCggXCIuI3tARWxlbWVudHMuY29udGFpbmVyfVwiIClcblxuXHQjIyNcblx0XHRQcmVwYXJlICYgQXR0YWNoIEV2ZW50c1xuICAgIFx0RG9uJ3Qgc2hvdyBhbnl0aGluZyB5ZXQuXG5cblx0XHRAY2FsbGVkIG9uIGhvb2sgYHBob3J0LnBvcnRmb2xpby5wcmVwYXJlYFxuXHQjIyNcblx0cHJlcGFyZTogPT5cblx0XHRyZXR1cm4gaWYgQCRjb250YWluZXIubGVuZ3RoIGlzIDBcblxuXHRcdEAkY29udGFpbmVyLmFkZENsYXNzKCAnUFBfSlNfX2xvYWRpbmdfbWFzb25yeScgKVxuXG5cdFx0QG1heWJlX2NyZWF0ZV9zaXplcigpXG5cblx0XHQjIE9ubHkgaW5pdGlhbGl6ZSwgaWYgbm8gbWFzb25yeSBleGlzdHNcblx0XHRtYXNvbnJ5X3NldHRpbmdzID0gSG9va3MuYXBwbHlGaWx0ZXJzICdwaG9ydC5tYXNvbnJ5LnNldHRpbmdzJyxcblx0XHRcdGl0ZW1TZWxlY3RvcjogXCIuI3tARWxlbWVudHMuaXRlbX1cIlxuXHRcdFx0Y29sdW1uV2lkdGggOiBcIi4je0BFbGVtZW50cy5zaXplcn1cIlxuXHRcdFx0Z3V0dGVyICAgICAgOiAwXG5cdFx0XHRpbml0TGF5b3V0ICA6IGZhbHNlXG5cblx0XHRAJGNvbnRhaW5lci5tYXNvbnJ5KCBtYXNvbnJ5X3NldHRpbmdzIClcblxuXHRcdEAkY29udGFpbmVyLm1hc29ucnkgJ29uY2UnLCAnbGF5b3V0Q29tcGxldGUnLCA9PlxuXHRcdFx0QCRjb250YWluZXJcblx0XHRcdFx0LnJlbW92ZUNsYXNzKCAnUFBfSlNfX2xvYWRpbmdfbWFzb25yeScgKVxuXHRcdFx0XHQuYWRkQ2xhc3MoICdQUF9KU19fbG9hZGluZ19jb21wbGV0ZScgKVxuXG5cdFx0XHQjIEB0cmlnZ2VyIHJlZnJlc2ggZXZlbnRcblx0XHRcdCMgdHJpZ2dlcnMgYEByZWZyZXNoKClgXG5cdFx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnXG5cblxuXHQjIyNcblx0XHRTdGFydCB0aGUgUG9ydGZvbGlvXG5cdFx0QGNhbGxlZCBvbiBob29rIGBwaG9ydC5wb3J0Zm9saW8uY3JlYXRlYFxuXHQjIyNcblx0Y3JlYXRlOiA9PlxuXHRcdEAkY29udGFpbmVyLm1hc29ucnkoKVxuXHRcdHJldHVyblxuXG5cblx0IyMjXG5cdFx0RGVzdHJveVxuXHRcdEBjYWxsZWQgb24gaG9vayBgcGhvcnQucG9ydGZvbGlvLmRlc3Ryb3lgXG5cdCMjI1xuXHRkZXN0cm95OiA9PlxuXHRcdEBtYXliZV9yZW1vdmVfc2l6ZXIoKVxuXG5cdFx0aWYgQCRjb250YWluZXIubGVuZ3RoID4gMFxuXHRcdFx0QCRjb250YWluZXIubWFzb25yeSggJ2Rlc3Ryb3knIClcblxuXG5cdFx0cmV0dXJuXG5cblxuXHQjIyNcblx0XHRSZWxvYWQgdGhlIGxheW91dFxuXHRcdEBjYWxsZWQgb24gaG9vayBgcGhvcnQucG9ydGZvbGlvLnJlZnJlc2hgXG5cdCMjI1xuXHRyZWZyZXNoOiA9PlxuXHRcdEAkY29udGFpbmVyLm1hc29ucnkoICdsYXlvdXQnIClcblxuXG5cblx0IyMjXG5cdFx0Q3JlYXRlIGEgc2l6ZXIgZWxlbWVudCBmb3IganF1ZXJ5LW1hc29ucnkgdG8gdXNlXG5cdCMjI1xuXHRtYXliZV9jcmVhdGVfc2l6ZXI6IC0+XG5cdFx0QGNyZWF0ZV9zaXplcigpIGlmIEBzaXplcl9kb2VzbnRfZXhpc3QoKVxuXHRcdHJldHVyblxuXG5cdG1heWJlX3JlbW92ZV9zaXplcjogLT5cblx0XHRyZXR1cm4gaWYgQCRjb250YWluZXIubGVuZ3RoIGlzbnQgMVxuXHRcdEAkY29udGFpbmVyLmZpbmQoIFwiLiN7QEVsZW1lbnRzLnNpemVyfVwiICkucmVtb3ZlKClcblx0XHRyZXR1cm5cblxuXHRzaXplcl9kb2VzbnRfZXhpc3Q6IC0+IEAkY29udGFpbmVyLmZpbmQoIFwiLiN7QEVsZW1lbnRzLnNpemVyfVwiICkubGVuZ3RoIGlzIDBcblxuXG5cdGNyZWF0ZV9zaXplcjogLT5cblx0XHRAJGNvbnRhaW5lci5hcHBlbmQgXCJcIlwiPGRpdiBjbGFzcz1cIiN7QEVsZW1lbnRzLnNpemVyfVwiPjwvZGl2PlwiXCJcIlxuXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gUG9ydGZvbGlvX01hc29ucnkiLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuUG9ydGZvbGlvX0V2ZW50X01hbmFnZXIgPSByZXF1aXJlKCAnLi9Qb3J0Zm9saW9fRXZlbnRfTWFuYWdlcicgKVxuJCA9IHJlcXVpcmUoICdqUXVlcnknIClcblxuIyBQb3J0Zm9saW8gbWFuYWdlciB3aWxsIHRyaWdnZXIgcG9ydGZvbGlvIGV2ZW50cyB3aGVuIG5lY2Vzc2FyeVxuUG9ydGZvbGlvID0gbmV3IFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyKClcblxuXG5pc19tYXNvbnJ5ID0gLT5cblx0cmV0dXJuICggJCggJy5QUF9NYXNvbnJ5JyApLmxlbmd0aCBpc250IDAgKVxuXG4jIFN0YXJ0IE1hc29ucnkgTGF5b3V0XG5zdGFydF9tYXNvbnJ5ID0gLT5cblx0cmV0dXJuIGZhbHNlIGlmIG5vdCBpc19tYXNvbnJ5KClcblxuXHRQb3J0Zm9saW9fTWFzb25yeSA9IHJlcXVpcmUoICcuL1BvcnRmb2xpb19NYXNvbnJ5JyApXG5cdG5ldyBQb3J0Zm9saW9fTWFzb25yeSgpXG5cbm1heWJlX2xhenlfbWFzb25yeSA9ICggaGFuZGxlciApIC0+XG5cdCMgVXNlIExhenlfTWFzb25yeSBoYW5kbGVyLCBpZiBjdXJyZW50IGxheW91dCBpcyBtYXNvbnJ5XG5cdHJldHVybiByZXF1aXJlKCAnbGF6eS9MYXp5X01hc29ucnknICkgaWYgaXNfbWFzb25yeSgpXG5cdHJldHVybiBoYW5kbGVyXG5cblxuIyBTdGFydCBQb3J0Zm9saW9cbkhvb2tzLmFkZEFjdGlvbiAncGhvcnQuY29yZS5yZWFkeScsIFBvcnRmb2xpby5wcmVwYXJlLCA1MFxuSG9va3MuYWRkQWN0aW9uICdwaG9ydC5jb3JlLmxvYWRlZCcsIFBvcnRmb2xpby5jcmVhdGUsIDUwXG5cbiMgSW5pdGlhbGl6ZSBNYXNvbnJ5IExheW91dFxuSG9va3MuYWRkQWN0aW9uICdwaG9ydC5jb3JlLnJlYWR5Jywgc3RhcnRfbWFzb25yeVxuXG4jIEluaXRpYWxpemUgTGF6eSBMb2FkaW5nIGZvciBNYXNvbnJ5IExheW91dFxuSG9va3MuYWRkRmlsdGVyICdwaG9ydC5sYXp5LmhhbmRsZXInLCBtYXliZV9sYXp5X21hc29ucnlcblxuXG5cbiJdfQ==
