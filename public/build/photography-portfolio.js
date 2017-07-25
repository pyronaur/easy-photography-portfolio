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
  Item_Data: require('./lazy/Item_Data'),
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

},{"./core/Photography_Portfolio":2,"./gallery/popup":8,"./lazy/Abstract_Lazy_Loader":9,"./lazy/Item_Data":10,"./lazy/start":12,"./portfolio/Portfolio_Interface":14,"./portfolio/start":16}],2:[function(require,module,exports){
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
  if (item.data.get_type() === 'video') {
    full = item.data.get_or_false('video_url');
  } else {
    full = item.data.get_url('full');
  }
  return {
    src: full,
    thumb: item.data.get_url('thumb'),
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

},{}],6:[function(require,module,exports){

/*
    Dependencies
 */
var Photoswipe_Factory, single_item_data, thumbnail_position;

Photoswipe_Factory = require('./photoswipe_factory');

single_item_data = function(item) {
  var height, ref, width;
  if (item.data.get_type() !== 'image') {
    return;
  }
  ref = item.data.get_size('full'), width = ref[0], height = ref[1];
  return {
    src: item.data.get_url('full'),
    msrc: item.data.get_url('full'),
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
      Gallery = new Photoswipe_Factory({
        getThumbBoundsFn: thumbnail_position($el)
      });
      return Gallery.open(gallery.map(single_item_data), {
        index: index
      });
    }
  };
};


},{"./photoswipe_factory":7}],7:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var $, Hooks, Photoswipe_Factory,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Photoswipe_Factory = (function() {
  function Photoswipe_Factory(options) {
    var defaults;
    if (options == null) {
      options = {};
    }
    this.close = bind(this.close, this);
    this.el = document.querySelector('.pswp');
    this.UI = Hooks.applyFilters("phort.photoswipe.UI", PhotoSwipeUI_Default);
    this.is_open = false;
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
    this.defaults = Hooks.applyFilters("phort.photoswipe.defaults", $.extend({}, defaults, options));
  }

  Photoswipe_Factory.prototype.close = function() {
    return this.instance.close();
  };

  Photoswipe_Factory.prototype.open = function(data, opts) {
    var options;
    if (data == null) {
      data = {};
    }
    if (opts == null) {
      opts = {};
    }
    options = $.extend({}, this.defaults, opts);
    if (options.index == null) {
      options.index = 0;
    }
    if (!options.index || options.index < 0) {
      options.index = 0;
    }
    this.instance = new PhotoSwipe(this.el, this.UI, data, options);
    this.instance.init();
    this.instance.listen('afterChange', this.trigger_change);
    this.is_open = true;
    return this.instance;
  };

  return Photoswipe_Factory;

})();

module.exports = Photoswipe_Factory;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],8:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var $, Gallery, Hooks, Item_Data, active_gallery, close_gallery, gallery_type, open_gallery, parse_gallery_item;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Item_Data = require('../lazy/Item_Data');

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

active_gallery = false;

parse_gallery_item = function(key, el) {
  var $el;
  $el = $(el);
  return {
    index: key,
    data: new Item_Data($el),
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
    active_gallery = Gallery($el);
    return active_gallery.open(gallery_items, index);
  }
};

close_gallery = function() {
  if (!active_gallery) {
    return false;
  }
  active_gallery.close();
  return active_gallery = false;
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

},{"../lazy/Item_Data":10,"./lightGallery":5,"./photoswipe":6}],9:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var $, Abstract_Lazy_Loader, Hooks, Item_Data, __WINDOW, throttle,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Item_Data = require('./Item_Data');

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
    thumb = item.data.get_url('thumb');
    full = item.data.get_url('full');
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
      data: new Item_Data($el),
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

},{"../core/Utilities":3,"../core/Window":4,"./Item_Data":10}],10:[function(require,module,exports){
var Item_Data;

Item_Data = (function() {
  function Item_Data($el) {
    var data;
    this.$el = $el;
    data = $el.data('item');
    if (!data) {
      throw new Error("Element doesn't contain `data-item` attribute");
    }
    this.data = data;
  }

  Item_Data.prototype.get_data = function(name) {
    var image;
    image = this.data['images'][name];
    if (!image) {
      return false;
    }
    return image;
  };

  Item_Data.prototype.get_size = function(name) {
    var height, image, ref, size, width;
    image = this.get_data(name);
    if (!image) {
      return false;
    }
    size = image['size'];
    ref = size.split('x'), width = ref[0], height = ref[1];
    width = parseInt(width);
    height = parseInt(height);
    return [width, height];
  };

  Item_Data.prototype.get_url = function(name) {
    var image;
    image = this.get_data(name);
    if (!image) {
      return false;
    }
    return image['url'];
  };

  Item_Data.prototype.get_or_false = function(key) {
    if (this.data[key]) {
      return this.data[key];
    }
    return false;
  };

  Item_Data.prototype.get_ratio = function() {
    return this.get_or_false('ratio');
  };

  Item_Data.prototype.get_type = function() {
    return this.get_or_false('type');
  };

  return Item_Data;

})();

module.exports = Item_Data;


},{}],11:[function(require,module,exports){
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
      'min-height': Math.floor(this.placeholder_width / item.data.get_ratio())
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

},{"../core/Window":4,"./Abstract_Lazy_Loader":9}],12:[function(require,module,exports){
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


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jb3JlL1Bob3RvZ3JhcGh5X1BvcnRmb2xpby5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY29yZS9VdGlsaXRpZXMuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvY29yZS9XaW5kb3cuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvbGlnaHRHYWxsZXJ5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9nYWxsZXJ5L3Bob3Rvc3dpcGUuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2dhbGxlcnkvcGhvdG9zd2lwZV9mYWN0b3J5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9nYWxsZXJ5L3BvcHVwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0Fic3RyYWN0X0xhenlfTG9hZGVyLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9sYXp5L0l0ZW1fRGF0YS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvbGF6eS9MYXp5X01hc29ucnkuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2xhenkvc3RhcnQuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL3BvcnRmb2xpby9Qb3J0Zm9saW9fRXZlbnRfTWFuYWdlci5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL1BvcnRmb2xpb19JbnRlcmZhY2UuY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL3BvcnRmb2xpby9Qb3J0Zm9saW9fTWFzb25yeS5jb2ZmZWUiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvcG9ydGZvbGlvL3N0YXJ0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFB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O0VBRUEsaUJBQUEsR0FBb0IsT0FBQSxDQUFTLHFCQUFUO1NBQ3BCLElBQUksaUJBQUosQ0FBQTtBQUplOztBQU1oQixrQkFBQSxHQUFxQixTQUFFLE9BQUY7RUFFcEIsSUFBeUMsVUFBQSxDQUFBLENBQXpDO0FBQUEsV0FBTyxPQUFBLENBQVMsbUJBQVQsRUFBUDs7QUFDQSxTQUFPO0FBSGE7O0FBT3JCLEtBQUssQ0FBQyxTQUFOLENBQWdCLGtCQUFoQixFQUFvQyxTQUFTLENBQUMsT0FBOUMsRUFBdUQsRUFBdkQ7O0FBQ0EsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsbUJBQWhCLEVBQXFDLFNBQVMsQ0FBQyxNQUEvQyxFQUF1RCxFQUF2RDs7QUFHQSxLQUFLLENBQUMsU0FBTixDQUFnQixrQkFBaEIsRUFBb0MsYUFBcEM7O0FBR0EsS0FBSyxDQUFDLFNBQU4sQ0FBZ0Isb0JBQWhCLEVBQXNDLGtCQUF0QyIsImZpbGUiOiJwaG90b2dyYXBoeS1wb3J0Zm9saW8uanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiMjI1xuICAgIExvYWQgRGVwZW5kZW5jaWVzXG4jIyNcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcbiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5cblxuIyBFeHBvc2Ugc29tZSBQaG90b2dyYXBoeSBQb3J0Zm9saW8gbW9kdWxlcyB0byB0aGUgcHVibGljIGZvciBleHRlbnNpYmlsaXR5XG53aW5kb3cuUFBfTW9kdWxlcyA9XG5cdCMgRXh0ZW5kIFBvcnRmb2xpbyBJbnRlcmZhY2UgdG8gYnVpbGQgY3VzdG9tIHBvcnRmb2xpbyBsYXlvdXRzIGJhc2VkIG9uIFBQIEV2ZW50c1xuXHRQb3J0Zm9saW9fSW50ZXJmYWNlOiByZXF1aXJlKCAnLi9wb3J0Zm9saW8vUG9ydGZvbGlvX0ludGVyZmFjZScgKVxuXG5cdCMgVXNlIGBJdGVtX0RhdGFgIHRvIGdldCBmb3JtYXR0ZWQgaXRlbSBpbWFnZSBzaXplcyBmb3IgbGF6eSBsYW9kaW5nXG5cdEl0ZW1fRGF0YTogcmVxdWlyZSggJy4vbGF6eS9JdGVtX0RhdGEnIClcblxuXHQjIEV4dGVuZCBBYnN0cmFjdF9MYXp5X0xvZGVyIHRvIGltcGxlbWVudCBsYXp5IGxvYWRlciBmb3IgeW91ciBsYXlvdXRcblx0QWJzdHJhY3RfTGF6eV9Mb2FkZXI6IHJlcXVpcmUoICcuL2xhenkvQWJzdHJhY3RfTGF6eV9Mb2FkZXInIClcblxuIyMjXG5cdEluY2x1ZGVzXG4jIyNcblxuIyBTdGFydCBQb3J0Zm9saW9cbnJlcXVpcmUgJy4vcG9ydGZvbGlvL3N0YXJ0J1xuXG4jIEdhbGxlcnlcbnJlcXVpcmUgJy4vZ2FsbGVyeS9wb3B1cCdcblxuIyBMYXp5IExvYWRpbmdcbnJlcXVpcmUgJy4vbGF6eS9zdGFydCdcblxuXG5cblxuIyMjXG5cdEJvb3Qgb24gYGRvY3VtZW50LnJlYWR5YFxuIyMjXG4kKCBkb2N1bWVudCApLnJlYWR5IC0+XG5cblx0IyBPbmx5IHJ1biB0aGlzIHNjcmlwdCB3aGVuIGJvZHkgaGFzIGBQUF9Qb3J0Zm9saW9gIGNsYXNzXG5cdHJldHVybiBpZiBub3QgJCggJ2JvZHknICkuaGFzQ2xhc3MoICdQUF9Qb3J0Zm9saW8nIClcblxuXHQjIEJvb3Rcblx0UGhvdG9ncmFwaHlfUG9ydGZvbGlvID0gbmV3ICggcmVxdWlyZSggJy4vY29yZS9QaG90b2dyYXBoeV9Qb3J0Zm9saW8nICkgKSgpXG5cdFBob3RvZ3JhcGh5X1BvcnRmb2xpby5yZWFkeSgpXG5cblx0cmV0dXJuIiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5cblxuY2xhc3MgQ29yZVxuXG5cdGNvbnN0cnVjdG9yOiAtPlxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQuY29yZS5yZWFkeScsIEB3YWl0X2Zvcl9sb2FkXG5cblx0IyBUcmlnZ2VyIHBob3J0LmNvcmUucmVhZHlcblx0cmVhZHk6ID0+XG5cdFx0aWYgSG9va3MuYXBwbHlGaWx0ZXJzKCAncGhvcnQuY29yZS5yZWFkeScsIHRydWUgKVxuXHRcdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LmNvcmUucmVhZHknXG5cdFx0cmV0dXJuXG5cblx0d2FpdF9mb3JfbG9hZDogPT5cblx0XHQjIFRyaWdnZXIgaW1hZ2VzTG9hZGVkIGV2ZW50IHdoZW4gaW1hZ2VzIGhhdmUgbG9hZGVkXG5cdFx0JCggJy5QUF9XcmFwcGVyJyApLmltYWdlc0xvYWRlZCggQGxvYWRlZCApXG5cblx0IyBUcmlnZ2VyIHBob3J0LmNvcmUubG9hZGVkXG5cdGxvYWRlZDogLT5cblx0XHRpZiBIb29rcy5hcHBseUZpbHRlcnMoICdwaG9ydC5jb3JlLmxvYWRlZCcsIHRydWUgKVxuXHRcdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LmNvcmUubG9hZGVkJ1xuXG5cdFx0cmV0dXJuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBDb3JlIiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cblxuICAgIC8qKlxuICAgICAqIFRoYW5rIHlvdSBSdXNzIGZvciBoZWxwaW5nIG1lIGF2b2lkIHdyaXRpbmcgdGhpcyBteXNlbGY6XG4gICAgICogQHVybCBodHRwczovL3JlbXlzaGFycC5jb20vMjAxMC8wNy8yMS90aHJvdHRsaW5nLWZ1bmN0aW9uLWNhbGxzLyNjb21tZW50LTI3NDU2NjM1OTRcbiAgICAgKi9cbiAgICB0aHJvdHRsZTogZnVuY3Rpb24gKCBmbiwgdGhyZXNoaG9sZCwgc2NvcGUgKSB7XG4gICAgICAgIHRocmVzaGhvbGQgfHwgKHRocmVzaGhvbGQgPSAyNTApXG4gICAgICAgIHZhciBsYXN0LFxuICAgICAgICAgICAgZGVmZXJUaW1lclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGNvbnRleHQgPSBzY29wZSB8fCB0aGlzXG5cbiAgICAgICAgICAgIHZhciBub3cgID0gK25ldyBEYXRlLFxuICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmd1bWVudHNcbiAgICAgICAgICAgIGlmICggbGFzdCAmJiBub3cgPCBsYXN0ICsgdGhyZXNoaG9sZCApIHtcbiAgICAgICAgICAgICAgICAvLyBob2xkIG9uIHRvIGl0XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KCBkZWZlclRpbWVyIClcbiAgICAgICAgICAgICAgICBkZWZlclRpbWVyID0gc2V0VGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBsYXN0ID0gbm93XG4gICAgICAgICAgICAgICAgICAgIGZuLmFwcGx5KCBjb250ZXh0LCBhcmdzIClcbiAgICAgICAgICAgICAgICB9LCB0aHJlc2hob2xkICsgbGFzdCAtIG5vdyApXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxhc3QgPSBub3dcbiAgICAgICAgICAgICAgICBmbi5hcHBseSggY29udGV4dCwgYXJncyApXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cblxufSIsIkhvb2tzID0gcmVxdWlyZSggJ3dwX2hvb2tzJyApXG5cblxuZ2V0X3NpemUgPSAtPlxuXHR3aWR0aCA6IHdpbmRvdy5pbm5lcldpZHRoIHx8ICR3aW5kb3cud2lkdGgoKVxuXHRoZWlnaHQ6IHdpbmRvdy5pbm5lckhlaWdodCB8fCAkd2luZG93LmhlaWdodCgpXG5cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRfc2l6ZSgpIiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcbiQgPSByZXF1aXJlKCBcImpRdWVyeVwiIClcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcblxuZGVmYXVsdHMgPVxuXHRkeW5hbWljIDogdHJ1ZVxuXHRzcGVlZCAgIDogMzUwXG5cdHByZWxvYWQgOiAzXG5cdGRvd25sb2FkOiBmYWxzZVxuXHRlc2NLZXkgIDogZmFsc2UgIyBXZSdyZSByb2xsaW5nIG91ciBvd25cblxuXHR0aHVtYm5haWwgICAgICAgICA6IHRydWVcblx0c2hvd1RodW1iQnlEZWZhdWx0OiB0cnVlXG5cbiMgQFRPRE86IFVzZSBPYmplY3QuYXNzaWduKCkgd2l0aCBCYWJlbFxuc2V0dGluZ3MgPSAkLmV4dGVuZCgge30sIGRlZmF1bHRzLCB3aW5kb3cuX19waG9ydC5saWdodEdhbGxlcnkgKVxuXG5cbnNpbmdsZV9pdGVtX2RhdGEgPSAoIGl0ZW0gKSAtPlxuXG5cdGlmIGl0ZW0uZGF0YS5nZXRfdHlwZSggKSBpcyAndmlkZW8nXG5cdFx0ZnVsbCA9IGl0ZW0uZGF0YS5nZXRfb3JfZmFsc2UoICd2aWRlb191cmwnIClcblx0ZWxzZVxuXHRcdGZ1bGwgPSBpdGVtLmRhdGEuZ2V0X3VybCggJ2Z1bGwnIClcblxuXHRyZXR1cm4ge1xuXHRcdHNyYyAgICA6IGZ1bGxcblx0XHR0aHVtYiAgOiBpdGVtLmRhdGEuZ2V0X3VybCggJ3RodW1iJyApXG5cdFx0c3ViSHRtbDogaXRlbS5jYXB0aW9uXG5cdH1cblxuXG5nZXRfc2V0dGluZ3MgPSAoIGdhbGxlcnksIGluZGV4ICkgLT5cblx0c2V0dGluZ3MuaW5kZXggICAgICAgICA9IGluZGV4XG5cdHNldHRpbmdzLmR5bmFtaWNFbCAgICAgPSBnYWxsZXJ5Lm1hcCggc2luZ2xlX2l0ZW1fZGF0YSApXG5cdHNldHRpbmdzLnZpZGVvTWF4V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCAqIDAuOFxuXG5cdEhvb2tzLmFwcGx5RmlsdGVycyAncGhvcnQubGlnaHRHYWxsZXJ5LnNldHRpbmdzJywgc2V0dGluZ3NcblxuXG5tb2R1bGUuZXhwb3J0cyA9ICggJGVsICkgLT5cblx0Y2xvc2U6IC0+XG5cdFx0R2FsbGVyeSA9ICRlbC5kYXRhKCAnbGlnaHRHYWxsZXJ5JyApXG5cdFx0R2FsbGVyeS5kZXN0cm95KCApIGlmIEdhbGxlcnkgYW5kIEdhbGxlcnkuZGVzdHJveT9cblxuXHRvcGVuOiAoICRnYWxsZXJ5X2l0ZW1zLCBpbmRleCApIC0+XG5cdFx0R2FsbGVyeSA9ICRlbC5saWdodEdhbGxlcnkoIGdldF9zZXR0aW5ncyggJGdhbGxlcnlfaXRlbXMsIGluZGV4ICkgKVxuXG5cblxuIiwiIyMjXG4gICAgRGVwZW5kZW5jaWVzXG4jIyNcblBob3Rvc3dpcGVfRmFjdG9yeSA9IHJlcXVpcmUoICcuL3Bob3Rvc3dpcGVfZmFjdG9yeScgKVxuXG5zaW5nbGVfaXRlbV9kYXRhID0gKCBpdGVtICkgLT5cblx0IyBQaG90b1N3aXBlIHN1cHBvcnRzIG9ubHkgaW1hZ2VzXG5cdHJldHVybiBpZiBpdGVtLmRhdGEuZ2V0X3R5cGUoICkgaXNudCAnaW1hZ2UnXG5cblx0W3dpZHRoLCBoZWlnaHRdID0gaXRlbS5kYXRhLmdldF9zaXplKCAnZnVsbCcgKVxuXG5cdCMgcmV0dXJuXG5cdHNyYyAgOiBpdGVtLmRhdGEuZ2V0X3VybCggJ2Z1bGwnIClcblx0bXNyYyA6IGl0ZW0uZGF0YS5nZXRfdXJsKCAnZnVsbCcgKVxuXHR3ICAgIDogd2lkdGhcblx0aCAgICA6IGhlaWdodFxuXHR0aXRsZTogaXRlbS5jYXB0aW9uXG5cbiMgQFRPRE86IEFkZCBvcHRpb24gdG8gcHJldmVudCBhbmltYXRpb25cbiMgQFRPRE86IE1ha2Ugc3VyZSBsYXp5IGxvYWRpbmcgd29ya3Mgd2hlbiBjbG9zaW5nIFBob3Rvc3dpcGVcbnRodW1ibmFpbF9wb3NpdGlvbiA9ICggJGVsICkgLT4gcmV0dXJuIC0+XG5cdHJldHVybiBmYWxzZSBpZiBub3QgJGVsXG5cblx0dGh1bWJuYWlsID0gJGVsLmZpbmQoICdpbWcnICkuZ2V0KCAwIClcblx0cGFnZVlTY3JvbGwgPSB3aW5kb3cucGFnZVlPZmZzZXQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcFxuXHRyZWN0ID0gdGh1bWJuYWlsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCggKVxuXG5cdCMgLy8gdyA9IHdpZHRoXG5cdG91dCA9XG5cdFx0eDogcmVjdC5sZWZ0XG5cdFx0eTogcmVjdC50b3AgKyBwYWdlWVNjcm9sbFxuXHRcdHc6IHJlY3Qud2lkdGhcblxuXHRyZXR1cm4gb3V0XG5cblxubW9kdWxlLmV4cG9ydHMgPSAoICRlbCApIC0+XG5cdEdhbGxlcnkgPSBmYWxzZVxuXG5cdGNsb3NlOiAtPlxuXHRcdHJldHVybiBpZiBub3QgR2FsbGVyeVxuXHRcdEdhbGxlcnkuY2xvc2UoKVxuXHRcdEdhbGxlcnkgPSBmYWxzZVxuXG5cdG9wZW46ICggZ2FsbGVyeSwgaW5kZXggKSAtPlxuXHRcdEdhbGxlcnkgPSBuZXcgUGhvdG9zd2lwZV9GYWN0b3J5KCBnZXRUaHVtYkJvdW5kc0ZuOiB0aHVtYm5haWxfcG9zaXRpb24oICRlbCApIClcblx0XHRHYWxsZXJ5Lm9wZW4oIGdhbGxlcnkubWFwKCBzaW5nbGVfaXRlbV9kYXRhICksIGluZGV4OiBpbmRleCApXG5cbiIsIiMjI1xuICAgIERlcGVuZGVuY2llc1xuIyMjXG5Ib29rcyA9IHJlcXVpcmUoJ3dwX2hvb2tzJylcbiQgPSByZXF1aXJlKCdqUXVlcnknKVxuXG5jbGFzcyBQaG90b3N3aXBlX0ZhY3RvcnlcblxuXHRjb25zdHJ1Y3RvcjogKG9wdGlvbnMgPSB7fSkgLT5cblxuXHRcdEBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wc3dwJylcblx0XHRAVUkgPSBIb29rcy5hcHBseUZpbHRlcnMoXCJwaG9ydC5waG90b3N3aXBlLlVJXCIsIFBob3RvU3dpcGVVSV9EZWZhdWx0KVxuXHRcdEBpc19vcGVuID0gZmFsc2VcblxuXHRcdGRlZmF1bHRzID1cblx0XHRcdGluZGV4OiAwXG5cdFx0XHRwcmVsb2FkOiBbMSwzXVxuXHRcdFx0ZXNjS2V5OiBmYWxzZVxuXHRcdFx0c2hhcmVCdXR0b25zOiBbXG5cdFx0XHRcdHtpZDonZmFjZWJvb2snLCBsYWJlbDonU2hhcmUgb24gRmFjZWJvb2snLCB1cmw6J2h0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS9zaGFyZXIvc2hhcmVyLnBocD91PXt7dXJsfX0nfVxuXHRcdFx0XHR7aWQ6J3R3aXR0ZXInLCBsYWJlbDonVHdlZXQnLCB1cmw6J2h0dHBzOi8vdHdpdHRlci5jb20vaW50ZW50L3R3ZWV0P3RleHQ9e3t0ZXh0fX0mdXJsPXt7dXJsfX0nfVxuXHRcdFx0XHR7aWQ6J3BpbnRlcmVzdCcsIGxhYmVsOidQaW4gaXQnLCB1cmw6J2h0dHA6Ly93d3cucGludGVyZXN0LmNvbS9waW4vY3JlYXRlL2J1dHRvbi8/dXJsPXt7dXJsfX0mbWVkaWE9e3tpbWFnZV91cmx9fSZkZXNjcmlwdGlvbj17e3RleHR9fSd9XG5cdFx0XHRdXG5cblxuXHRcdEBkZWZhdWx0cyA9IEhvb2tzLmFwcGx5RmlsdGVycyBcInBob3J0LnBob3Rvc3dpcGUuZGVmYXVsdHNcIiwgJC5leHRlbmQoIHt9LCBkZWZhdWx0cywgb3B0aW9ucyApXG5cblxuXHRjbG9zZTogPT5cblx0XHRAaW5zdGFuY2UuY2xvc2UoKVxuXG5cdG9wZW46IChkYXRhID0ge30sIG9wdHMgPSB7fSkgLT5cblxuXHRcdG9wdGlvbnMgPSAkLmV4dGVuZCgge30sIEBkZWZhdWx0cywgb3B0cylcblxuXHRcdCMgSW5kZXggaXMgMCBieSBkZWZhdWx0XG5cdFx0aWYgbm90IG9wdGlvbnMuaW5kZXg/XG5cdFx0XHRvcHRpb25zLmluZGV4ID0gMFxuXG5cdFx0IyBTZXQgdGhlIGluZGV4IHRvIDAgaWYgaXQgaXNuJ3QgYSBwcm9wZXIgdmFsdWVcblx0XHRpZiBub3Qgb3B0aW9ucy5pbmRleCBvciBvcHRpb25zLmluZGV4IDwgMFxuXHRcdFx0b3B0aW9ucy5pbmRleCA9IDBcblxuXHRcdEBpbnN0YW5jZSA9IG5ldyBQaG90b1N3aXBlKEBlbCwgQFVJLCBkYXRhICwgb3B0aW9ucylcblx0XHRAaW5zdGFuY2UuaW5pdCgpXG5cdFx0QGluc3RhbmNlLmxpc3RlbiAnYWZ0ZXJDaGFuZ2UnLCBAdHJpZ2dlcl9jaGFuZ2Vcblx0XHRAaXNfb3BlbiA9IHRydWVcblxuXHRcdHJldHVybiBAaW5zdGFuY2VcblxuXG5cbiMgZXhwb3J0c1xubW9kdWxlLmV4cG9ydHMgPSBQaG90b3N3aXBlX0ZhY3RvcnkiLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuJCA9IHJlcXVpcmUoIFwialF1ZXJ5XCIgKVxuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuSXRlbV9EYXRhID0gcmVxdWlyZSggJy4uL2xhenkvSXRlbV9EYXRhJyApXG5cblxuZ2FsbGVyeV90eXBlID0gd2luZG93Ll9fcGhvcnQucG9wdXBfZ2FsbGVyeSB8fCAnbGlnaHRnYWxsZXJ5J1xuXG5pZiBnYWxsZXJ5X3R5cGUgaXMgJ2xpZ2h0Z2FsbGVyeSdcblx0R2FsbGVyeSA9IHJlcXVpcmUoICcuL2xpZ2h0R2FsbGVyeScgKVxuXG5pZiBnYWxsZXJ5X3R5cGUgaXMgJ3Bob3Rvc3dpcGUnXG5cdEdhbGxlcnkgPSByZXF1aXJlKCAnLi9waG90b3N3aXBlJyApXG5cbnJldHVybiBpZiBub3QgR2FsbGVyeVxuXG5cbmFjdGl2ZV9nYWxsZXJ5ID0gZmFsc2VcblxucGFyc2VfZ2FsbGVyeV9pdGVtID0gKCBrZXksIGVsICkgLT5cblx0JGVsID0gJCggZWwgKVxuXG5cdGluZGV4ICA6IGtleVxuXHRkYXRhICAgOiBuZXcgSXRlbV9EYXRhKCAkZWwgKVxuXHRjYXB0aW9uOiAkZWwuZmluZCggJy5QUF9HYWxsZXJ5X19jYXB0aW9uJyApLmh0bWwoICkgfHwgJydcblxub3Blbl9nYWxsZXJ5ID0gKCBlbCApIC0+XG5cdCRlbCA9ICQoIGVsIClcblx0JGl0ZW1zID0gJGVsLmNsb3Nlc3QoICcuUFBfR2FsbGVyeScgKS5maW5kKCAnLlBQX0dhbGxlcnlfX2l0ZW0nIClcblxuXHRpZiAkaXRlbXMubGVuZ3RoID4gMFxuXHRcdGluZGV4ID0gJGl0ZW1zLmluZGV4KCAkZWwgKVxuXHRcdGdhbGxlcnlfaXRlbXMgPSAkLm1ha2VBcnJheSggJGl0ZW1zLm1hcCggcGFyc2VfZ2FsbGVyeV9pdGVtICkgKVxuXG5cdFx0YWN0aXZlX2dhbGxlcnkgPSBHYWxsZXJ5KCAkZWwgKVxuXHRcdGFjdGl2ZV9nYWxsZXJ5Lm9wZW4oIGdhbGxlcnlfaXRlbXMsIGluZGV4IClcblxuY2xvc2VfZ2FsbGVyeSA9IC0+XG5cdHJldHVybiBmYWxzZSBpZiBub3QgYWN0aXZlX2dhbGxlcnlcblx0YWN0aXZlX2dhbGxlcnkuY2xvc2UoIClcblx0YWN0aXZlX2dhbGxlcnkgPSBmYWxzZVxuXG5cbiMjXG4jIyBBdHRhY2ggRXZlbnRzXG4jI1xuJCggZG9jdW1lbnQgKS5vbiAnY2xpY2snLCAnLlBQX0dhbGxlcnlfX2l0ZW0nLCAoIGUgKSAtPlxuXHRlLnByZXZlbnREZWZhdWx0KCApXG5cdG9wZW5fZ2FsbGVyeSggdGhpcyApXG5cbmlmIEhvb2tzLmFwcGx5RmlsdGVycyAncGhvcnQuZ2FsbGVyeS5jdXN0b21fZXNjJywgdHJ1ZVxuXHQkKCB3aW5kb3cgKS5vbiAna2V5ZG93bicsICggZSApIC0+XG5cdFx0cmV0dXJuIHVubGVzcyBlLmtleUNvZGUgaXMgMjdcblx0XHRjbG9zZV9nYWxsZXJ5KCApXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCggKVxuXG4iLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuJCA9IHJlcXVpcmUoICdqUXVlcnknIClcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcbkl0ZW1fRGF0YSA9IHJlcXVpcmUoICcuL0l0ZW1fRGF0YScgKVxuX19XSU5ET1cgPSByZXF1aXJlKCAnLi4vY29yZS9XaW5kb3cnIClcbnRocm90dGxlID0gcmVxdWlyZSgnLi4vY29yZS9VdGlsaXRpZXMnKS50aHJvdHRsZVxuXG5jbGFzcyBBYnN0cmFjdF9MYXp5X0xvYWRlclxuXHRjb25zdHJ1Y3RvcjogLT5cblx0XHRARWxlbWVudHMgPVxuXHRcdFx0aXRlbSAgICAgICA6ICdQUF9MYXp5X0ltYWdlJ1xuXHRcdFx0cGxhY2Vob2xkZXI6ICdQUF9MYXp5X0ltYWdlX19wbGFjZWhvbGRlcidcblx0XHRcdGxpbmsgICAgICAgOiAnUFBfSlNfTGF6eV9fbGluaydcblx0XHRcdGltYWdlICAgICAgOiAnUFBfSlNfTGF6eV9faW1hZ2UnXG5cblx0XHRASXRlbXMgPSBbXVxuXG5cdFx0IyBBZGp1c3RhYmxlIFNlbnNpdGl2aXR5IGZvciBAaW5fdmlldyBmdW5jdGlvblxuXHRcdCMgVmFsdWUgaW4gcGl4ZWxzXG5cdFx0QFNlbnNpdGl2aXR5ID0gMTAwXG5cblx0XHQjIEF1dG8tc2V0dXAgd2hlbiBldmVudHMgYXJlIGF0dGFjaGVkXG5cdFx0IyBBdXRvLWRlc3Ryb3kgd2hlbiBldmVudHMgYXJlIGRldGFjaGVkXG5cdFx0QHRocm90dGxlZF9hdXRvbG9hZCA9IG51bGxcblxuXHRcdEBzZXR1cF9pdGVtcygpXG5cdFx0QHJlc2l6ZV9hbGwoKVxuXHRcdEBhdHRhY2hfZXZlbnRzKClcblxuXHQjIyNcblx0XHRBYnN0cmFjdCBNZXRob2RzXG5cdCMjI1xuXG5cdCMgVGhpcyBpcyBydW4gd2hlbiBhIHJlc2l6ZSBvciByZWZyZXNoIGV2ZW50IGlzIGRldGVjdGVkXG5cdHJlc2l6ZTogLT4gcmV0dXJuXG5cblx0bG9hZDogKCBpdGVtICkgLT5cblx0XHRAbG9hZF9pbWFnZSggaXRlbSApXG5cdFx0aXRlbS4kZWwuaW1hZ2VzTG9hZGVkID0+XG5cdFx0XHRAY2xlYW51cF9hZnRlcl9sb2FkKCBpdGVtIClcblxuXHRsb2FkX2ltYWdlOiAoIGl0ZW0gKSAtPlxuXG5cdFx0IyBHZXQgaW1hZ2UgVVJMc1xuXHRcdHRodW1iID0gaXRlbS5kYXRhLmdldF91cmwoICd0aHVtYicgKVxuXHRcdGZ1bGwgPSBpdGVtLmRhdGEuZ2V0X3VybCggJ2Z1bGwnIClcblxuXHRcdCMgQ3JlYXRlIGVsZW1lbnRzXG5cdFx0aXRlbS4kZWxcblx0XHRcdC5wcmVwZW5kKCBAZ2V0X2l0ZW1faHRtbCggdGh1bWIsIGZ1bGwgKSApXG5cdFx0XHQucmVtb3ZlQ2xhc3MoICdMYXp5LUltYWdlJyApXG5cblx0XHQjIE1ha2Ugc3VyZSB0aGlzIGltYWdlIGlzbid0IGxvYWRlZCBhZ2FpblxuXHRcdGl0ZW0ubG9hZGVkID0gdHJ1ZVxuXG5cdGNsZWFudXBfYWZ0ZXJfbG9hZDogKCBpdGVtICkgLT5cblx0XHQjIEFkZCBpbWFnZSBQUF9KU19sb2FkZWQgY2xhc3Ncblx0XHRpdGVtLiRlbC5maW5kKCAnaW1nJyApLmFkZENsYXNzKCAnUFBfSlNfX2xvYWRlZCcgKS5yZW1vdmVDbGFzcyggJ1BQX0pTX19sb2FkaW5nJyApXG5cblx0XHRpdGVtLiRlbFxuXG5cdFx0XHQjIFJlbW92ZSBgUFBfTGF6eV9JbWFnZWAsIGFzIHRoaXMgaXMgbm90IGEgbGF6eS1sb2FkYWJsZSBpbWFnZSBhbnltb3JlXG5cdFx0XHQucmVtb3ZlQ2xhc3MoIEBFbGVtZW50cy5pdGVtIClcblxuXHRcdFx0IyBSZW1vdmUgUGxhY2Vob2xkZXJcblx0XHRcdC5maW5kKCBcIi4je0BFbGVtZW50cy5wbGFjZWhvbGRlcn1cIiApXG5cdFx0XHQuZmFkZU91dCggNDAwLCAtPiAkKCB0aGlzICkucmVtb3ZlKCkgKVxuXG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LmxhenkubG9hZGVkX2l0ZW0nLCBpdGVtXG5cblxuXHRnZXRfaXRlbV9odG1sOiAoIHRodW1iLCBmdWxsICkgLT5cblxuXHRcdGlmICdkaXNhYmxlJyBpcyB3aW5kb3cuX19waG9ydC5wb3B1cF9nYWxsZXJ5XG5cdFx0XHRyZXR1cm4gXCJcIlwiXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiI3tARWxlbWVudHMubGlua31cIiByZWw9XCJnYWxsZXJ5XCI+XG5cdFx0XHRcdDxpbWcgY2xhc3M9XCIje0BFbGVtZW50cy5pbWFnZX1cIiBzcmM9XCIje3RodW1ifVwiIGNsYXNzPVwiUFBfSlNfX2xvYWRpbmdcIiAvPlxuXHRcdFx0PC9kaXY+XG5cdFx0XHRcIlwiXCJcblx0XHRlbHNlXG5cdFx0XHRyZXR1cm4gXCJcIlwiXG5cdFx0XHQ8YSBjbGFzcz1cIiN7QEVsZW1lbnRzLmxpbmt9XCIgaHJlZj1cIiN7ZnVsbH1cIiByZWw9XCJnYWxsZXJ5XCI+XG5cdFx0XHRcdDxpbWcgY2xhc3M9XCIje0BFbGVtZW50cy5pbWFnZX1cIiBzcmM9XCIje3RodW1ifVwiIGNsYXNzPVwiUFBfSlNfX2xvYWRpbmdcIiAvPlxuXHRcdFx0PC9hPlxuXHRcdFx0XCJcIlwiXG5cblx0c2V0dXBfaXRlbXM6ID0+XG5cdFx0IyBDbGVhciBleGlzdGluZyBpdGVtcywgaWYgYW55XG5cdFx0QEl0ZW1zID0gW11cblxuXHRcdCMgTG9vcCBvdmVyIERPTSBhbmQgYWRkIGVhY2ggaXRlbSB0byBASXRlbXNcblx0XHQkKCBcIi4je0BFbGVtZW50cy5pdGVtfVwiICkuZWFjaCggQGFkZF9pdGVtIClcblx0XHRyZXR1cm5cblxuXHRhZGRfaXRlbTogKCBrZXksIGVsICkgPT5cblx0XHQkZWwgPSAkKCBlbCApXG5cdFx0QEl0ZW1zLnB1c2hcblx0XHRcdGVsICAgIDogZWxcblx0XHRcdCRlbCAgIDogJGVsXG5cdFx0XHRkYXRhICA6IG5ldyBJdGVtX0RhdGEoICRlbCApXG5cdFx0XHRsb2FkZWQ6IGZhbHNlXG5cblxuXHRcdHJldHVyblxuXG5cblx0IyMjXG5cdFx0TWV0aG9kc1xuXHQjIyNcblx0cmVzaXplX2FsbDogLT5cblx0XHRAcmVzaXplKCBpdGVtICkgZm9yIGl0ZW0gaW4gQEl0ZW1zXG5cblxuXG5cdCMgQXV0b21hdGljYWxseSBMb2FkIGFsbCBpdGVtcyB0aGF0IGFyZSBgaW5fbG9vc2Vfdmlld2Bcblx0YXV0b2xvYWQ6ID0+XG5cdFx0Zm9yIGl0ZW0sIGtleSBpbiBASXRlbXNcblx0XHRcdGlmIG5vdCBpdGVtLmxvYWRlZCBhbmQgQGluX2xvb3NlX3ZpZXcoIGl0ZW0uZWwgKVxuXHRcdFx0XHRAbG9hZCggaXRlbSApXG5cblx0aW5fbG9vc2VfdmlldzogKCBlbCApIC0+XG5cdFx0cmV0dXJuIHRydWUgaWYgbm90IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdD9cblx0XHRyZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcblxuXHRcdCMgRWxlbWVudHMgbm90IGluIHZpZXcgaWYgdGhleSBkb24ndCBoYXZlIGRpbWVuc2lvbnNcblx0XHRyZXR1cm4gZmFsc2UgaWYgcmVjdC5oZWlnaHQgaXMgMCBhbmQgcmVjdC53aWR0aCBpcyAwXG5cblxuXHRcdHJldHVybiAoXG5cdFx0XHQjIFkgQXhpc1xuXHRcdFx0cmVjdC50b3AgKyByZWN0LmhlaWdodCA+PSAtQFNlbnNpdGl2aXR5IGFuZCAjIHRvcFxuXHRcdFx0cmVjdC5ib3R0b20gLSByZWN0LmhlaWdodCA8PSBfX1dJTkRPVy5oZWlnaHQgKyBAU2Vuc2l0aXZpdHkgYW5kXG5cblx0XHRcdCMgWCBBeGlzXG5cdFx0XHRyZWN0LmxlZnQgKyByZWN0LndpZHRoID49IC1AU2Vuc2l0aXZpdHkgYW5kXG5cdFx0XHRyZWN0LnJpZ2h0IC0gcmVjdC53aWR0aCA8PSBfX1dJTkRPVy53aWR0aCArIEBTZW5zaXRpdml0eVxuXG5cdFx0KVxuXG5cdGRlc3Ryb3k6IC0+XG5cdFx0QGRldGFjaF9ldmVudHMoKVxuXG5cdGF0dGFjaF9ldmVudHM6IC0+XG5cdFx0IyBDcmVhdGUgYSBkZWJvdW5jZWQgYGF1dG9sb2FkYCBmdW5jdGlvblxuXHRcdEB0aHJvdHRsZWRfYXV0b2xvYWQgPSB0aHJvdHRsZSggQGF1dG9sb2FkLCA1MCApXG5cdFx0SG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCcsIEB0aHJvdHRsZWRfYXV0b2xvYWQsIDEwMFxuXG5cblx0ZGV0YWNoX2V2ZW50czogLT5cblx0XHQjIENsZWFyIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gZnJvbSBpbnN0YW5jZVxuXHRcdEB0aHJvdHRsZWRfYXV0b2xvYWQgPSBudWxsXG5cdFx0SG9va3MucmVtb3ZlQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCcsIEB0aHJvdHRsZWRfYXV0b2xvYWQsIDEwMFxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBYnN0cmFjdF9MYXp5X0xvYWRlclxuIiwiY2xhc3MgSXRlbV9EYXRhXG5cblx0Y29uc3RydWN0b3I6ICggJGVsICkgLT5cblx0XHRAJGVsID0gJGVsXG5cdFx0ZGF0YSA9ICRlbC5kYXRhKCAnaXRlbScgKVxuXG5cdFx0aWYgbm90IGRhdGFcblx0XHRcdHRocm93IG5ldyBFcnJvciBcIkVsZW1lbnQgZG9lc24ndCBjb250YWluIGBkYXRhLWl0ZW1gIGF0dHJpYnV0ZVwiXG5cblx0XHRAZGF0YSA9IGRhdGFcblxuXG5cblx0Z2V0X2RhdGE6ICggbmFtZSApIC0+XG5cdFx0aW1hZ2UgPSBAZGF0YVsgJ2ltYWdlcycgXVsgbmFtZSBdXG5cdFx0cmV0dXJuIGZhbHNlIGlmIG5vdCBpbWFnZVxuXG5cdFx0cmV0dXJuIGltYWdlXG5cblx0Z2V0X3NpemU6ICggbmFtZSApIC0+XG5cdFx0aW1hZ2UgPSBAZ2V0X2RhdGEoIG5hbWUgKVxuXHRcdHJldHVybiBmYWxzZSBpZiBub3QgaW1hZ2VcblxuXHRcdHNpemUgPSBpbWFnZVsgJ3NpemUnIF1cblxuXHRcdFt3aWR0aCwgaGVpZ2h0XSA9IHNpemUuc3BsaXQoICd4JyApXG5cblx0XHR3aWR0aCA9IHBhcnNlSW50KCB3aWR0aCApXG5cdFx0aGVpZ2h0ID0gcGFyc2VJbnQoIGhlaWdodCApXG5cblx0XHRyZXR1cm4gW3dpZHRoLCBoZWlnaHRdXG5cblx0Z2V0X3VybDogKCBuYW1lICkgLT5cblx0XHRpbWFnZSA9IEBnZXRfZGF0YSggbmFtZSApXG5cdFx0cmV0dXJuIGZhbHNlIGlmIG5vdCBpbWFnZVxuXHRcdHJldHVybiBpbWFnZVsgJ3VybCcgXVxuXG5cdGdldF9vcl9mYWxzZTogKCBrZXkgKSAtPlxuXHRcdGlmIEBkYXRhWyBrZXkgXVxuXHRcdFx0cmV0dXJuIEBkYXRhWyBrZXkgXVxuXHRcdHJldHVybiBmYWxzZVxuXG5cdGdldF9yYXRpbyAgIDogLT4gQGdldF9vcl9mYWxzZSggJ3JhdGlvJyApXG5cdGdldF90eXBlICAgIDogLT4gQGdldF9vcl9mYWxzZSggJ3R5cGUnIClcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEl0ZW1fRGF0YVxuIiwiJCA9IHJlcXVpcmUoICdqUXVlcnknIClcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcbkFic3RyYWN0X0xhenlfTG9hZGVyID0gcmVxdWlyZSggJy4vQWJzdHJhY3RfTGF6eV9Mb2FkZXInIClcbl9fV0lORE9XID0gcmVxdWlyZSggJy4uL2NvcmUvV2luZG93JyApXG5cbmNsYXNzIExhenlfTWFzb25yeSBleHRlbmRzIEFic3RyYWN0X0xhenlfTG9hZGVyXG5cblx0cmVzaXplX2FsbDogLT5cblx0XHRAcGxhY2Vob2xkZXJfd2lkdGggPSAkKCAnLlBQX01hc29ucnlfX3NpemVyJyApLndpZHRoKClcblx0XHRzdXBlcigpXG5cblx0cmVzaXplOiAoIGl0ZW0gKSAtPlxuXHRcdGl0ZW0uJGVsLmNzcyAnbWluLWhlaWdodCc6IE1hdGguZmxvb3IoIEBwbGFjZWhvbGRlcl93aWR0aCAvIGl0ZW0uZGF0YS5nZXRfcmF0aW8oKSApXG5cblx0Y2xlYW51cF9hZnRlcl9sb2FkOiAoaXRlbSkgLT5cblx0XHQjIFJlbW92ZSBtaW4taGVpZ2h0XG5cdFx0aXRlbS4kZWwuY3NzKCAnbWluLWhlaWdodCcsICcnIClcblxuXHRcdCMgUnVuIGFsbCBvdGhlciBjbGVhbnVwc1xuXHRcdHN1cGVyKCBpdGVtIClcblxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCdcblxuXHRcdHJldHVyblxuXG5cdGF0dGFjaF9ldmVudHM6IC0+XG5cdFx0IyBDYWxsIFBhcmVudCBmaXJzdCwgaXQncyBnb2luZyB0byBjcmVhdGUgQHRocm90dGxlZF9hdXRvbG9hZFxuXHRcdHN1cGVyKClcblxuXHRcdCMgQXR0YWNoXG5cdFx0JCggd2luZG93ICkub24gJ3Njcm9sbCcsIEB0aHJvdHRsZWRfYXV0b2xvYWRcblxuXG5cblx0ZGV0YWNoX2V2ZW50czogLT5cblx0XHQjIERldGFjaFxuXHRcdCQoIHdpbmRvdyApLm9mZiAnc2Nyb2xsJywgQHRocm90dGxlZF9hdXRvbG9hZFxuXG5cdFx0IyBDYWxsIHBhcmVudCBsYXN0LCBpdCdzIGdvaW5nIHRvIGNsZWFuIHVwIEB0aHJvdHRsZWRfYXV0b2xvYWRcblx0XHRzdXBlcigpXG5cblx0ZGVzdHJveTogLT5cblx0XHRmb3IgaXRlbSwga2V5IGluIEBJdGVtc1xuXHRcdFx0aXRlbS4kZWwuY3NzICdtaW4taGVpZ2h0JywgJydcblx0XHRzdXBlcigpXG5cblxubW9kdWxlLmV4cG9ydHMgPSBMYXp5X01hc29ucnlcbiIsIiQgPSByZXF1aXJlKCAnalF1ZXJ5JyApXG5Ib29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5cblxuaW5zdGFuY2UgPSBmYWxzZVxuXG5kZXN0cm95ID0gLT5cblx0cmV0dXJuIGlmIG5vdCBpbnN0YW5jZVxuXHRpbnN0YW5jZS5kZXN0cm95KClcblx0aW5zdGFuY2UgPSBudWxsXG5cbmNyZWF0ZSA9IC0+XG5cblx0IyBNYWtlIHN1cmUgYW4gaW5zdGFuY2UgZG9lc24ndCBhbHJlYWR5IGV4aXN0XG5cdGRlc3Ryb3koKVxuXG5cdCMgSGFuZGxlciByZXF1aXJlZFxuXHRIYW5kbGVyID0gSG9va3MuYXBwbHlGaWx0ZXJzICdwaG9ydC5sYXp5LmhhbmRsZXInLCBmYWxzZVxuXHRyZXR1cm4gaWYgbm90IEhhbmRsZXJcblxuXHQjIEJ5IGRlZmF1bHQgTGF6eV9NYXNvbnJ5IGlzIGhhbmRsaW5nIExhenktTG9hZGluZ1xuXHQjIENoZWNrIGlmIGFueW9uZSB3YW50cyB0byBoaWphY2sgaGFuZGxlclxuXHRpbnN0YW5jZSA9IG5ldyBIYW5kbGVyKClcblxuXHRyZXR1cm5cblxuXG4jIEluaXRpYWxpemUgbGF6eSBsb2FkZXIgYWZ0ZXIgdGhlIHBvcnRmb2xpbyBpcyBwcmVwYXJlZCwgcCA9IDEwMFxuSG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZScsIGNyZWF0ZSwgMTAwXG5Ib29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgZGVzdHJveSIsIkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcblxuIyMjXG5cbiAgICAjIEluaXRpYWxpemUgUG9ydGZvbGlvIENvcmVcblx0LS0tXG5cdFx0VXNpbmcgcDUwIEAgYHBob3J0LmNvcmUucmVhZHlgXG5cdFx0TGF0ZSBwcmlvcml0eSBpcyBnb2luZyB0byBmb3JjZSBleHBsaWNpdCBwcmlvcml0eSBpbiBhbnkgb3RoZXIgbW92aW5nIHBhcnRzIHRoYXQgYXJlIGdvaW5nIHRvIHRvdWNoIHBvcnRmb2xpbyBsYXlvdXQgYXQgYHBob3J0LmxvYWRlZGBcblx0LS0tXG5cbiMjI1xuY2xhc3MgUG9ydGZvbGlvX0V2ZW50X01hbmFnZXJcblxuXHRwcmVwYXJlOiAtPlxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZSdcblx0XHRyZXR1cm5cblxuXHRjcmVhdGU6IC0+XG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5jcmVhdGUnXG5cdFx0cmV0dXJuXG5cblxuXHRyZWZyZXNoOiAtPlxuXHRcdEhvb2tzLmRvQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCdcblx0XHRyZXR1cm5cblxuXG5cdGRlc3Ryb3k6IC0+XG5cdFx0IyBEZXN0cm95XG5cdFx0SG9va3MuZG9BY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95J1xuXHRcdHJldHVyblxuXG5cbm1vZHVsZS5leHBvcnRzID0gUG9ydGZvbGlvX0V2ZW50X01hbmFnZXIiLCJIb29rcyA9IHJlcXVpcmUoIFwid3BfaG9va3NcIiApXG5cblxuIyMjXG5cdEFic3RyYWN0IENsYXNzIFBvcnRvZmxpb19FdmVudF9JbWVwbGVtZW50YXRpb25cblxuICAgIEhhbmRsZXMgYWxsIHRoZSBldmVudHMgcmVxdWlyZWQgdG8gZnVsbHkgaGFuZGxlIGEgcG9ydGZvbGlvIGxheW91dCBwcm9jZXNzXG4jIyNcbmNsYXNzIFBvcnRmb2xpb19JbnRlcmZhY2VcblxuXHRjb25zdHJ1Y3RvcjogKCBhcmdzICkgLT5cblx0XHRAc2V0dXBfYWN0aW9ucygpXG5cdFx0QGluaXRpYWxpemUoIGFyZ3MgKVxuXG5cdHNldHVwX2FjdGlvbnM6IC0+XG5cdFx0SG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZScsIEBwcmVwYXJlLCA1MFxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLmNyZWF0ZScsIEBjcmVhdGUsIDUwXG5cdFx0SG9va3MuYWRkQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCcsIEByZWZyZXNoLCA1MFxuXHRcdEhvb2tzLmFkZEFjdGlvbiAncGhvcnQucG9ydGZvbGlvLmRlc3Ryb3knLCBAZGVzdHJveSwgNTBcblx0XHRIb29rcy5hZGRBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgQHB1cmdlX2FjdGlvbnMsIDEwMFxuXG5cdHB1cmdlX2FjdGlvbnM6ID0+XG5cdFx0SG9va3MucmVtb3ZlQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucHJlcGFyZScsIEBwcmVwYXJlLCA1MFxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLmNyZWF0ZScsIEBjcmVhdGUsIDUwXG5cdFx0SG9va3MucmVtb3ZlQWN0aW9uICdwaG9ydC5wb3J0Zm9saW8ucmVmcmVzaCcsIEByZWZyZXNoLCA1MFxuXHRcdEhvb2tzLnJlbW92ZUFjdGlvbiAncGhvcnQucG9ydGZvbGlvLmRlc3Ryb3knLCBAZGVzdHJveSwgNTBcblx0XHRIb29rcy5yZW1vdmVBY3Rpb24gJ3Bob3J0LnBvcnRmb2xpby5kZXN0cm95JywgQHB1cmdlX2FjdGlvbnMsIDEwMFxuXG5cblx0IyMjXG4gICAgXHRSZXF1aXJlIHRoZXNlIG1ldGhvZHNcblx0IyMjXG5cdGluaXRpYWxpemU6IC0+IHRocm93IG5ldyBFcnJvciggXCJbQWJzdHJhY3RdIEFueSBzdWJjbGFzcyBvZiBgUG9ydGZvbGlvX0ludGVyZmFjZWAgbXVzdCBpbXBsZW1lbnQgYGluaXRpYWxpemVgIG1ldGhvZFwiIClcblx0cHJlcGFyZSAgIDogLT4gdGhyb3cgbmV3IEVycm9yKCBcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgcHJlcGFyZWAgbWV0aG9kXCIgKVxuXHRjcmVhdGUgICAgOiAtPiB0aHJvdyBuZXcgRXJyb3IoIFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGBjcmVhdGVgIG1ldGhvZFwiIClcblx0cmVmcmVzaCAgIDogLT4gdGhyb3cgbmV3IEVycm9yKCBcIltBYnN0cmFjdF0gQW55IHN1YmNsYXNzIG9mIGBQb3J0Zm9saW9fSW50ZXJmYWNlYCBtdXN0IGltcGxlbWVudCBgcmVmcmVzaGAgbWV0aG9kXCIgKVxuXHRkZXN0cm95ICAgOiAtPiB0aHJvdyBuZXcgRXJyb3IoIFwiW0Fic3RyYWN0XSBBbnkgc3ViY2xhc3Mgb2YgYFBvcnRmb2xpb19JbnRlcmZhY2VgIG11c3QgaW1wbGVtZW50IGBkZXN0cm95YCBtZXRob2RcIiApXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBvcnRmb2xpb19JbnRlcmZhY2UiLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuJCA9IHJlcXVpcmUoICdqUXVlcnknIClcbkhvb2tzID0gcmVxdWlyZSggXCJ3cF9ob29rc1wiIClcblBvcnRmb2xpb19JbnRlcmZhY2UgPSByZXF1aXJlKCAnLi9Qb3J0Zm9saW9fSW50ZXJmYWNlJyApXG5cblxuY2xhc3MgUG9ydGZvbGlvX01hc29ucnkgZXh0ZW5kcyBQb3J0Zm9saW9fSW50ZXJmYWNlXG5cblx0Y29uc3RydWN0b3I6IC0+XG5cblx0XHRARWxlbWVudHMgPVxuXHRcdFx0Y29udGFpbmVyOiAnUFBfTWFzb25yeSdcblx0XHRcdHNpemVyICAgIDogJ1BQX01hc29ucnlfX3NpemVyJ1xuXHRcdFx0aXRlbSAgICAgOiAnUFBfTWFzb25yeV9faXRlbSdcblxuXHRcdHN1cGVyKClcblxuXHQjIyNcblx0XHRJbml0aWFsaXplXG5cdCMjI1xuXHRpbml0aWFsaXplOiAtPlxuXHRcdEAkY29udGFpbmVyID0gJCggXCIuI3tARWxlbWVudHMuY29udGFpbmVyfVwiIClcblxuXHQjIyNcblx0XHRQcmVwYXJlICYgQXR0YWNoIEV2ZW50c1xuICAgIFx0RG9uJ3Qgc2hvdyBhbnl0aGluZyB5ZXQuXG5cblx0XHRAY2FsbGVkIG9uIGhvb2sgYHBob3J0LnBvcnRmb2xpby5wcmVwYXJlYFxuXHQjIyNcblx0cHJlcGFyZTogPT5cblx0XHRyZXR1cm4gaWYgQCRjb250YWluZXIubGVuZ3RoIGlzIDBcblxuXHRcdEAkY29udGFpbmVyLmFkZENsYXNzKCAnUFBfSlNfX2xvYWRpbmdfbWFzb25yeScgKVxuXG5cdFx0QG1heWJlX2NyZWF0ZV9zaXplcigpXG5cblx0XHQjIE9ubHkgaW5pdGlhbGl6ZSwgaWYgbm8gbWFzb25yeSBleGlzdHNcblx0XHRtYXNvbnJ5X3NldHRpbmdzID0gSG9va3MuYXBwbHlGaWx0ZXJzICdwaG9ydC5tYXNvbnJ5LnNldHRpbmdzJyxcblx0XHRcdGl0ZW1TZWxlY3RvcjogXCIuI3tARWxlbWVudHMuaXRlbX1cIlxuXHRcdFx0Y29sdW1uV2lkdGggOiBcIi4je0BFbGVtZW50cy5zaXplcn1cIlxuXHRcdFx0Z3V0dGVyICAgICAgOiAwXG5cdFx0XHRpbml0TGF5b3V0ICA6IGZhbHNlXG5cblx0XHRAJGNvbnRhaW5lci5tYXNvbnJ5KCBtYXNvbnJ5X3NldHRpbmdzIClcblxuXHRcdEAkY29udGFpbmVyLm1hc29ucnkgJ29uY2UnLCAnbGF5b3V0Q29tcGxldGUnLCA9PlxuXHRcdFx0QCRjb250YWluZXJcblx0XHRcdFx0LnJlbW92ZUNsYXNzKCAnUFBfSlNfX2xvYWRpbmdfbWFzb25yeScgKVxuXHRcdFx0XHQuYWRkQ2xhc3MoICdQUF9KU19fbG9hZGluZ19jb21wbGV0ZScgKVxuXG5cdFx0XHQjIEB0cmlnZ2VyIHJlZnJlc2ggZXZlbnRcblx0XHRcdCMgdHJpZ2dlcnMgYEByZWZyZXNoKClgXG5cdFx0XHRIb29rcy5kb0FjdGlvbiAncGhvcnQucG9ydGZvbGlvLnJlZnJlc2gnXG5cblxuXHQjIyNcblx0XHRTdGFydCB0aGUgUG9ydGZvbGlvXG5cdFx0QGNhbGxlZCBvbiBob29rIGBwaG9ydC5wb3J0Zm9saW8uY3JlYXRlYFxuXHQjIyNcblx0Y3JlYXRlOiA9PlxuXHRcdEAkY29udGFpbmVyLm1hc29ucnkoKVxuXHRcdHJldHVyblxuXG5cblx0IyMjXG5cdFx0RGVzdHJveVxuXHRcdEBjYWxsZWQgb24gaG9vayBgcGhvcnQucG9ydGZvbGlvLmRlc3Ryb3lgXG5cdCMjI1xuXHRkZXN0cm95OiA9PlxuXHRcdEBtYXliZV9yZW1vdmVfc2l6ZXIoKVxuXG5cdFx0aWYgQCRjb250YWluZXIubGVuZ3RoID4gMFxuXHRcdFx0QCRjb250YWluZXIubWFzb25yeSggJ2Rlc3Ryb3knIClcblxuXG5cdFx0cmV0dXJuXG5cblxuXHQjIyNcblx0XHRSZWxvYWQgdGhlIGxheW91dFxuXHRcdEBjYWxsZWQgb24gaG9vayBgcGhvcnQucG9ydGZvbGlvLnJlZnJlc2hgXG5cdCMjI1xuXHRyZWZyZXNoOiA9PlxuXHRcdEAkY29udGFpbmVyLm1hc29ucnkoICdsYXlvdXQnIClcblxuXG5cblx0IyMjXG5cdFx0Q3JlYXRlIGEgc2l6ZXIgZWxlbWVudCBmb3IganF1ZXJ5LW1hc29ucnkgdG8gdXNlXG5cdCMjI1xuXHRtYXliZV9jcmVhdGVfc2l6ZXI6IC0+XG5cdFx0QGNyZWF0ZV9zaXplcigpIGlmIEBzaXplcl9kb2VzbnRfZXhpc3QoKVxuXHRcdHJldHVyblxuXG5cdG1heWJlX3JlbW92ZV9zaXplcjogLT5cblx0XHRyZXR1cm4gaWYgQCRjb250YWluZXIubGVuZ3RoIGlzbnQgMVxuXHRcdEAkY29udGFpbmVyLmZpbmQoIFwiLiN7QEVsZW1lbnRzLnNpemVyfVwiICkucmVtb3ZlKClcblx0XHRyZXR1cm5cblxuXHRzaXplcl9kb2VzbnRfZXhpc3Q6IC0+IEAkY29udGFpbmVyLmZpbmQoIFwiLiN7QEVsZW1lbnRzLnNpemVyfVwiICkubGVuZ3RoIGlzIDBcblxuXG5cdGNyZWF0ZV9zaXplcjogLT5cblx0XHRAJGNvbnRhaW5lci5hcHBlbmQgXCJcIlwiPGRpdiBjbGFzcz1cIiN7QEVsZW1lbnRzLnNpemVyfVwiPjwvZGl2PlwiXCJcIlxuXG5cdFx0cmV0dXJuXG5cbm1vZHVsZS5leHBvcnRzID0gUG9ydGZvbGlvX01hc29ucnkiLCIjIyNcbiAgICBEZXBlbmRlbmNpZXNcbiMjI1xuSG9va3MgPSByZXF1aXJlKCBcIndwX2hvb2tzXCIgKVxuUG9ydGZvbGlvX0V2ZW50X01hbmFnZXIgPSByZXF1aXJlKCAnLi9Qb3J0Zm9saW9fRXZlbnRfTWFuYWdlcicgKVxuJCA9IHJlcXVpcmUoICdqUXVlcnknIClcblxuIyBQb3J0Zm9saW8gbWFuYWdlciB3aWxsIHRyaWdnZXIgcG9ydGZvbGlvIGV2ZW50cyB3aGVuIG5lY2Vzc2FyeVxuUG9ydGZvbGlvID0gbmV3IFBvcnRmb2xpb19FdmVudF9NYW5hZ2VyKClcblxuXG5pc19tYXNvbnJ5ID0gLT5cblx0cmV0dXJuICggJCggJy5QUF9NYXNvbnJ5JyApLmxlbmd0aCBpc250IDAgKVxuXG4jIFN0YXJ0IE1hc29ucnkgTGF5b3V0XG5zdGFydF9tYXNvbnJ5ID0gLT5cblx0cmV0dXJuIGZhbHNlIGlmIG5vdCBpc19tYXNvbnJ5KClcblxuXHRQb3J0Zm9saW9fTWFzb25yeSA9IHJlcXVpcmUoICcuL1BvcnRmb2xpb19NYXNvbnJ5JyApXG5cdG5ldyBQb3J0Zm9saW9fTWFzb25yeSgpXG5cbm1heWJlX2xhenlfbWFzb25yeSA9ICggaGFuZGxlciApIC0+XG5cdCMgVXNlIExhenlfTWFzb25yeSBoYW5kbGVyLCBpZiBjdXJyZW50IGxheW91dCBpcyBtYXNvbnJ5XG5cdHJldHVybiByZXF1aXJlKCAnbGF6eS9MYXp5X01hc29ucnknICkgaWYgaXNfbWFzb25yeSgpXG5cdHJldHVybiBoYW5kbGVyXG5cblxuIyBTdGFydCBQb3J0Zm9saW9cbkhvb2tzLmFkZEFjdGlvbiAncGhvcnQuY29yZS5yZWFkeScsIFBvcnRmb2xpby5wcmVwYXJlLCA1MFxuSG9va3MuYWRkQWN0aW9uICdwaG9ydC5jb3JlLmxvYWRlZCcsIFBvcnRmb2xpby5jcmVhdGUsIDUwXG5cbiMgSW5pdGlhbGl6ZSBNYXNvbnJ5IExheW91dFxuSG9va3MuYWRkQWN0aW9uICdwaG9ydC5jb3JlLnJlYWR5Jywgc3RhcnRfbWFzb25yeVxuXG4jIEluaXRpYWxpemUgTGF6eSBMb2FkaW5nIGZvciBNYXNvbnJ5IExheW91dFxuSG9va3MuYWRkRmlsdGVyICdwaG9ydC5sYXp5LmhhbmRsZXInLCBtYXliZV9sYXp5X21hc29ucnlcblxuXG5cbiJdfQ==
