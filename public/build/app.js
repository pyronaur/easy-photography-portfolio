(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var $, App_State, Hooks, Masonry, Portfolio, State_Manager;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Masonry = require('class/Masonry');

Portfolio = require('class/Portfolio');

State_Manager = require('class/State_Manager');

App_State = new State_Manager();

Hooks.addAction('pp.ready', function() {
  if ($('.PP-Masonry').length > 0) {
    return Hooks.addFilter('pp.portfolio.handler', function() {
      return new Masonry();
    });
  }
});

Hooks.addAction('pp.loaded', function() {
  var portfolio;
  return portfolio = new Portfolio();
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"class/Masonry":2,"class/Portfolio":3,"class/State_Manager":4}],2:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var $, Hooks, Masonry,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Masonry = (function() {
  Masonry.prototype.Elements = {
    container: 'PP-Masonry',
    sizer: 'PP-Masonry__sizer',
    item: 'PP-Masonry__item'
  };

  function Masonry($parent) {
    if ($parent == null) {
      $parent = $(document);
    }
    this.refresh = bind(this.refresh, this);
    this.destroy = bind(this.destroy, this);
    this.create = bind(this.create, this);
    this.$container = $parent.find("." + this.Elements.container);
    this.create();
  }

  Masonry.prototype.create = function() {
    if (this.$container.length === 0) {
      return;
    }
    this.$container.addClass('is-preparing-masonry');
    this.maybe_create_sizer();
    this.$container.masonry({
      itemSelector: "." + this.Elements.item,
      columnWidth: "." + this.Elements.sizer,
      gutter: 0,
      initLayout: false
    });
    this.$container.masonry('on', 'layoutComplete', (function(_this) {
      return function() {
        _this.$container.removeClass('is-preparing-masonry');
        return Hooks.doAction('pp.masonry.start');
      };
    })(this));
    this.$container.masonry();
  };

  Masonry.prototype.destroy = function() {
    this.maybe_remove_sizer();
    if (this.$container.length > 0) {
      this.$container.masonry('destroy');
    }
  };

  Masonry.prototype.refresh = function() {
    return this.$container.maosnry('layout');
  };


  /*
  
  		Create a sizer element for jquery-masonry to use
   */

  Masonry.prototype.maybe_create_sizer = function() {
    if (this.sizer_doesnt_exist()) {
      this.create_sizer();
    }
  };

  Masonry.prototype.maybe_remove_sizer = function() {
    if (this.$container.length !== 1) {
      return;
    }
    this.$container.find("." + this.Elements.sizer).remove();
  };

  Masonry.prototype.sizer_doesnt_exist = function() {
    return this.$container.find("." + this.Elements.sizer).length === 0;
  };

  Masonry.prototype.create_sizer = function() {
    this.$container.append("<div class=\"" + this.Elements.sizer + "\"></div>");
  };

  return Masonry;

})();

module.exports = Masonry;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],3:[function(require,module,exports){
(function (global){
var Hooks, Portfolio;

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Portfolio = (function() {
  function Portfolio() {

    /*
      		Event Based Portfolio is going to start soon
     */
    this.handler = Hooks.applyFilters('pp.portfolio.handler', false);
    if (this.handler) {
      Hooks.addAction('pp.portfolio.create', this.handler.create, 50);
      Hooks.addAction('pp.portfolio.refresh', this.handler.refresh, 50);
      Hooks.addAction('pp.portfolio.destroy', this.handler.destroy, 50);
      Hooks.addAction('pp.portfolio.destroy', this.auto_destroy, 500);
    }
  }

  Portfolio.prototype.create = function() {
    Hooks.doAction('pp.portfolio.create');
  };

  Portfolio.prototype.refresh = function() {
    Hooks.doAction('pp.portfolio.refresh');
  };

  Portfolio.prototype.destroy = function() {
    Hooks.doAction('pp.portfolio.destroy');
  };

  Portfolio.prototype.auto_destroy = function() {
    Hooks.removeAction('pp.portfolio.create', this.handler.create, 50);
    Hooks.removeAction('pp.portfolio.refresh', this.handler.refresh, 50);
    return Hooks.removeAction('pp.portfolio.destroy', this.handler.destroy, 50);
  };

  return Portfolio;

})();

module.exports = Portfolio;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],4:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var $, Hooks, State_Manager,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

State_Manager = (function() {
  function State_Manager() {
    this.loaded = bind(this.loaded, this);
    this.ready = bind(this.ready, this);
    this.$doc = $(document);
    this.$doc.on('ready', this.ready);
    this.$doc.find('.pp-wrapper').imagesLoaded(this.loaded);
  }

  State_Manager.prototype.ready = function() {
    var trigger;
    trigger = true;
    if (Hooks.applyFilters('pp.ready', true)) {
      Hooks.doAction('pp.ready');
    }
  };

  State_Manager.prototype.loaded = function() {
    var trigger;
    trigger = true;
    if (Hooks.applyFilters('pp.loaded', true)) {
      Hooks.doAction('pp.loaded');
    }
  };

  return State_Manager;

})();

module.exports = State_Manager;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[1])


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jbGFzcy9NYXNvbnJ5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jbGFzcy9Qb3J0Zm9saW8uY29mZmVlIiwic291cmNlcy9zY3JpcHQvY29mZmVlL2NsYXNzL1N0YXRlX01hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbi8qXG4gICAgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBBcHBfU3RhdGUsIEhvb2tzLCBNYXNvbnJ5LCBQb3J0Zm9saW8sIFN0YXRlX01hbmFnZXI7XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5NYXNvbnJ5ID0gcmVxdWlyZSgnY2xhc3MvTWFzb25yeScpO1xuXG5Qb3J0Zm9saW8gPSByZXF1aXJlKCdjbGFzcy9Qb3J0Zm9saW8nKTtcblxuU3RhdGVfTWFuYWdlciA9IHJlcXVpcmUoJ2NsYXNzL1N0YXRlX01hbmFnZXInKTtcblxuQXBwX1N0YXRlID0gbmV3IFN0YXRlX01hbmFnZXIoKTtcblxuSG9va3MuYWRkQWN0aW9uKCdwcC5yZWFkeScsIGZ1bmN0aW9uKCkge1xuICBpZiAoJCgnLlBQLU1hc29ucnknKS5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIEhvb2tzLmFkZEZpbHRlcigncHAucG9ydGZvbGlvLmhhbmRsZXInLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgTWFzb25yeSgpO1xuICAgIH0pO1xuICB9XG59KTtcblxuSG9va3MuYWRkQWN0aW9uKCdwcC5sb2FkZWQnLCBmdW5jdGlvbigpIHtcbiAgdmFyIHBvcnRmb2xpbztcbiAgcmV0dXJuIHBvcnRmb2xpbyA9IG5ldyBQb3J0Zm9saW8oKTtcbn0pO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lZWEJ3TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lZWEJ3TG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lPMEZCUVVFN096dEJRVUZCTEVsQlFVRTdPMEZCUjBFc1EwRkJRU3hIUVVGSkxFOUJRVUVzUTBGQlV5eFJRVUZVT3p0QlFVTktMRXRCUVVFc1IwRkJVU3hQUVVGQkxFTkJRVk1zVlVGQlZEczdRVUZEVWl4UFFVRkJMRWRCUVZVc1QwRkJRU3hEUVVGVExHVkJRVlE3TzBGQlExWXNVMEZCUVN4SFFVRlpMRTlCUVVFc1EwRkJVeXhwUWtGQlZEczdRVUZEV2l4aFFVRkJMRWRCUVdkQ0xFOUJRVUVzUTBGQlV5eHhRa0ZCVkRzN1FVRkZhRUlzVTBGQlFTeEhRVUZuUWl4SlFVRkJMR0ZCUVVFc1EwRkJRVHM3UVVGRmFFSXNTMEZCU3l4RFFVRkRMRk5CUVU0c1EwRkJaMElzVlVGQmFFSXNSVUZCTkVJc1UwRkJRVHRGUVVVelFpeEpRVUZITEVOQlFVRXNRMEZCUlN4aFFVRkdMRU5CUVdkQ0xFTkJRVU1zVFVGQmFrSXNSMEZCTUVJc1EwRkJOMEk3VjBGRFF5eExRVUZMTEVOQlFVTXNVMEZCVGl4RFFVRm5RaXh6UWtGQmFFSXNSVUZCZDBNc1UwRkJRVHRoUVVGUExFbEJRVUVzVDBGQlFTeERRVUZCTzBsQlFWQXNRMEZCZUVNc1JVRkVSRHM3UVVGR01rSXNRMEZCTlVJN08wRkJUVUVzUzBGQlN5eERRVUZETEZOQlFVNHNRMEZCWjBJc1YwRkJhRUlzUlVGQk5rSXNVMEZCUVR0QlFVTTFRaXhOUVVGQk8xTkJRVUVzVTBGQlFTeEhRVUZuUWl4SlFVRkJMRk5CUVVFc1EwRkJRVHRCUVVSWkxFTkJRVGRDSW4wPVxuIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgJCwgSG9va3MsIE1hc29ucnksXG4gIGJpbmQgPSBmdW5jdGlvbihmbiwgbWUpeyByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuIGZuLmFwcGx5KG1lLCBhcmd1bWVudHMpOyB9OyB9O1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuTWFzb25yeSA9IChmdW5jdGlvbigpIHtcbiAgTWFzb25yeS5wcm90b3R5cGUuRWxlbWVudHMgPSB7XG4gICAgY29udGFpbmVyOiAnUFAtTWFzb25yeScsXG4gICAgc2l6ZXI6ICdQUC1NYXNvbnJ5X19zaXplcicsXG4gICAgaXRlbTogJ1BQLU1hc29ucnlfX2l0ZW0nXG4gIH07XG5cbiAgZnVuY3Rpb24gTWFzb25yeSgkcGFyZW50KSB7XG4gICAgaWYgKCRwYXJlbnQgPT0gbnVsbCkge1xuICAgICAgJHBhcmVudCA9ICQoZG9jdW1lbnQpO1xuICAgIH1cbiAgICB0aGlzLnJlZnJlc2ggPSBiaW5kKHRoaXMucmVmcmVzaCwgdGhpcyk7XG4gICAgdGhpcy5kZXN0cm95ID0gYmluZCh0aGlzLmRlc3Ryb3ksIHRoaXMpO1xuICAgIHRoaXMuY3JlYXRlID0gYmluZCh0aGlzLmNyZWF0ZSwgdGhpcyk7XG4gICAgdGhpcy4kY29udGFpbmVyID0gJHBhcmVudC5maW5kKFwiLlwiICsgdGhpcy5FbGVtZW50cy5jb250YWluZXIpO1xuICAgIHRoaXMuY3JlYXRlKCk7XG4gIH1cblxuICBNYXNvbnJ5LnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy4kY29udGFpbmVyLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLiRjb250YWluZXIuYWRkQ2xhc3MoJ2lzLXByZXBhcmluZy1tYXNvbnJ5Jyk7XG4gICAgdGhpcy5tYXliZV9jcmVhdGVfc2l6ZXIoKTtcbiAgICB0aGlzLiRjb250YWluZXIubWFzb25yeSh7XG4gICAgICBpdGVtU2VsZWN0b3I6IFwiLlwiICsgdGhpcy5FbGVtZW50cy5pdGVtLFxuICAgICAgY29sdW1uV2lkdGg6IFwiLlwiICsgdGhpcy5FbGVtZW50cy5zaXplcixcbiAgICAgIGd1dHRlcjogMCxcbiAgICAgIGluaXRMYXlvdXQ6IGZhbHNlXG4gICAgfSk7XG4gICAgdGhpcy4kY29udGFpbmVyLm1hc29ucnkoJ29uJywgJ2xheW91dENvbXBsZXRlJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIF90aGlzLiRjb250YWluZXIucmVtb3ZlQ2xhc3MoJ2lzLXByZXBhcmluZy1tYXNvbnJ5Jyk7XG4gICAgICAgIHJldHVybiBIb29rcy5kb0FjdGlvbigncHAubWFzb25yeS5zdGFydCcpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgdGhpcy4kY29udGFpbmVyLm1hc29ucnkoKTtcbiAgfTtcblxuICBNYXNvbnJ5LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5tYXliZV9yZW1vdmVfc2l6ZXIoKTtcbiAgICBpZiAodGhpcy4kY29udGFpbmVyLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuJGNvbnRhaW5lci5tYXNvbnJ5KCdkZXN0cm95Jyk7XG4gICAgfVxuICB9O1xuXG4gIE1hc29ucnkucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy4kY29udGFpbmVyLm1hb3NucnkoJ2xheW91dCcpO1xuICB9O1xuXG5cbiAgLypcbiAgXG4gIFx0XHRDcmVhdGUgYSBzaXplciBlbGVtZW50IGZvciBqcXVlcnktbWFzb25yeSB0byB1c2VcbiAgICovXG5cbiAgTWFzb25yeS5wcm90b3R5cGUubWF5YmVfY3JlYXRlX3NpemVyID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuc2l6ZXJfZG9lc250X2V4aXN0KCkpIHtcbiAgICAgIHRoaXMuY3JlYXRlX3NpemVyKCk7XG4gICAgfVxuICB9O1xuXG4gIE1hc29ucnkucHJvdG90eXBlLm1heWJlX3JlbW92ZV9zaXplciA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLiRjb250YWluZXIubGVuZ3RoICE9PSAxKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuJGNvbnRhaW5lci5maW5kKFwiLlwiICsgdGhpcy5FbGVtZW50cy5zaXplcikucmVtb3ZlKCk7XG4gIH07XG5cbiAgTWFzb25yeS5wcm90b3R5cGUuc2l6ZXJfZG9lc250X2V4aXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuJGNvbnRhaW5lci5maW5kKFwiLlwiICsgdGhpcy5FbGVtZW50cy5zaXplcikubGVuZ3RoID09PSAwO1xuICB9O1xuXG4gIE1hc29ucnkucHJvdG90eXBlLmNyZWF0ZV9zaXplciA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuJGNvbnRhaW5lci5hcHBlbmQoXCI8ZGl2IGNsYXNzPVxcXCJcIiArIHRoaXMuRWxlbWVudHMuc2l6ZXIgKyBcIlxcXCI+PC9kaXY+XCIpO1xuICB9O1xuXG4gIHJldHVybiBNYXNvbnJ5O1xuXG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1hc29ucnk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVRXRnpiMjV5ZVM1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJazFoYzI5dWNua3VZMjltWm1WbElsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lJN1FVRkJRVHM3TzBGQlFVRXNTVUZCUVN4cFFrRkJRVHRGUVVGQk96dEJRVWRCTEVOQlFVRXNSMEZCU1N4UFFVRkJMRU5CUVZNc1VVRkJWRHM3UVVGRFNpeExRVUZCTEVkQlFWRXNUMEZCUVN4RFFVRlRMRlZCUVZRN08wRkJSVVk3YjBKQlJVd3NVVUZCUVN4SFFVTkRPMGxCUVVFc1UwRkJRU3hGUVVGWExGbEJRVmc3U1VGRFFTeExRVUZCTEVWQlFWY3NiVUpCUkZnN1NVRkZRU3hKUVVGQkxFVkJRVmNzYTBKQlJsZzdPenRGUVU5WkxHbENRVUZGTEU5QlFVWTdPMDFCUVVVc1ZVRkJWU3hEUVVGQkxFTkJRVWNzVVVGQlNEczdPenM3U1VGRGVFSXNTVUZCUXl4RFFVRkJMRlZCUVVRc1IwRkJZeXhQUVVGUExFTkJRVU1zU1VGQlVpeERRVUZqTEVkQlFVRXNSMEZCU1N4SlFVRkRMRU5CUVVFc1VVRkJVU3hEUVVGRExGTkJRVFZDTzBsQlJXUXNTVUZCUXl4RFFVRkJMRTFCUVVRc1EwRkJRVHRGUVVoWk96dHZRa0ZOWWl4TlFVRkJMRWRCUVZFc1UwRkJRVHRKUVVOUUxFbEJRVlVzU1VGQlF5eERRVUZCTEZWQlFWVXNRMEZCUXl4TlFVRmFMRXRCUVhOQ0xFTkJRV2hETzBGQlFVRXNZVUZCUVRzN1NVRkZRU3hKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEZGQlFWb3NRMEZCYzBJc2MwSkJRWFJDTzBsQlJVRXNTVUZCUXl4RFFVRkJMR3RDUVVGRUxFTkJRVUU3U1VGSFFTeEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRTlCUVZvc1EwRkRRenROUVVGQkxGbEJRVUVzUlVGQll5eEhRVUZCTEVkQlFVa3NTVUZCUXl4RFFVRkJMRkZCUVZFc1EwRkJReXhKUVVFMVFqdE5RVU5CTEZkQlFVRXNSVUZCWXl4SFFVRkJMRWRCUVVrc1NVRkJReXhEUVVGQkxGRkJRVkVzUTBGQlF5eExRVVExUWp0TlFVVkJMRTFCUVVFc1JVRkJZeXhEUVVaa08wMUJSMEVzVlVGQlFTeEZRVUZqTEV0QlNHUTdTMEZFUkR0SlFVOUJMRWxCUVVNc1EwRkJRU3hWUVVGVkxFTkJRVU1zVDBGQldpeERRVUZ2UWl4SlFVRndRaXhGUVVFd1FpeG5Ra0ZCTVVJc1JVRkJORU1zUTBGQlFTeFRRVUZCTEV0QlFVRTdZVUZCUVN4VFFVRkJPMUZCUXpORExFdEJRVU1zUTBGQlFTeFZRVUZWTEVOQlFVTXNWMEZCV2l4RFFVRjVRaXh6UWtGQmVrSTdaVUZEUVN4TFFVRkxMRU5CUVVNc1VVRkJUaXhEUVVGbExHdENRVUZtTzAxQlJqSkRPMGxCUVVFc1EwRkJRU3hEUVVGQkxFTkJRVUVzU1VGQlFTeERRVUUxUXp0SlFVbEJMRWxCUVVNc1EwRkJRU3hWUVVGVkxFTkJRVU1zVDBGQldpeERRVUZCTzBWQmJrSlBPenR2UWtGNVFsSXNUMEZCUVN4SFFVRlRMRk5CUVVFN1NVRkRVaXhKUVVGRExFTkJRVUVzYTBKQlFVUXNRMEZCUVR0SlFVVkJMRWxCUVVjc1NVRkJReXhEUVVGQkxGVkJRVlVzUTBGQlF5eE5RVUZhTEVkQlFYRkNMRU5CUVhoQ08wMUJRME1zU1VGQlF5eERRVUZCTEZWQlFWVXNRMEZCUXl4UFFVRmFMRU5CUVhGQ0xGTkJRWEpDTEVWQlJFUTdPMFZCU0ZFN08yOUNRVk5VTEU5QlFVRXNSMEZCVXl4VFFVRkJPMWRCUTFJc1NVRkJReXhEUVVGQkxGVkJRVlVzUTBGQlF5eFBRVUZhTEVOQlFYRkNMRkZCUVhKQ08wVkJSRkU3T3p0QlFVZFVPenM3T3p0dlFrRkxRU3hyUWtGQlFTeEhRVUZ2UWl4VFFVRkJPMGxCUTI1Q0xFbEJRVzFDTEVsQlFVTXNRMEZCUVN4clFrRkJSQ3hEUVVGQkxFTkJRVzVDTzAxQlFVRXNTVUZCUXl4RFFVRkJMRmxCUVVRc1EwRkJRU3hGUVVGQk96dEZRVVJ0UWpzN2IwSkJTWEJDTEd0Q1FVRkJMRWRCUVc5Q0xGTkJRVUU3U1VGRGJrSXNTVUZCVlN4SlFVRkRMRU5CUVVFc1ZVRkJWU3hEUVVGRExFMUJRVm9zUzBGQmQwSXNRMEZCYkVNN1FVRkJRU3hoUVVGQk96dEpRVU5CTEVsQlFVTXNRMEZCUVN4VlFVRlZMRU5CUVVNc1NVRkJXaXhEUVVGclFpeEhRVUZCTEVkQlFVa3NTVUZCUXl4RFFVRkJMRkZCUVZFc1EwRkJReXhMUVVGb1F5eERRVUY1UXl4RFFVRkRMRTFCUVRGRExFTkJRVUU3UlVGR2JVSTdPMjlDUVV0d1FpeHJRa0ZCUVN4SFFVRnZRaXhUUVVGQk8xZEJRVWNzU1VGQlF5eERRVUZCTEZWQlFWVXNRMEZCUXl4SlFVRmFMRU5CUVd0Q0xFZEJRVUVzUjBGQlNTeEpRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRXRCUVdoRExFTkJRWGxETEVOQlFVTXNUVUZCTVVNc1MwRkJiMFE3UlVGQmRrUTdPMjlDUVVkd1FpeFpRVUZCTEVkQlFXTXNVMEZCUVR0SlFVTmlMRWxCUVVNc1EwRkJRU3hWUVVGVkxFTkJRVU1zVFVGQldpeERRVUZ0UWl4bFFVRkJMRWRCUVdsQ0xFbEJRVU1zUTBGQlFTeFJRVUZSTEVOQlFVTXNTMEZCTTBJc1IwRkJhVU1zVjBGQmNFUTdSVUZFWVRzN096czdPMEZCVFdZc1RVRkJUU3hEUVVGRExFOUJRVkFzUjBGQmFVSWlmUT09XG4iLCJ2YXIgSG9va3MsIFBvcnRmb2xpbztcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuUG9ydGZvbGlvID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBQb3J0Zm9saW8oKSB7XG5cbiAgICAvKlxuICAgICAgXHRcdEV2ZW50IEJhc2VkIFBvcnRmb2xpbyBpcyBnb2luZyB0byBzdGFydCBzb29uXG4gICAgICovXG4gICAgdGhpcy5oYW5kbGVyID0gSG9va3MuYXBwbHlGaWx0ZXJzKCdwcC5wb3J0Zm9saW8uaGFuZGxlcicsIGZhbHNlKTtcbiAgICBpZiAodGhpcy5oYW5kbGVyKSB7XG4gICAgICBIb29rcy5hZGRBY3Rpb24oJ3BwLnBvcnRmb2xpby5jcmVhdGUnLCB0aGlzLmhhbmRsZXIuY3JlYXRlLCA1MCk7XG4gICAgICBIb29rcy5hZGRBY3Rpb24oJ3BwLnBvcnRmb2xpby5yZWZyZXNoJywgdGhpcy5oYW5kbGVyLnJlZnJlc2gsIDUwKTtcbiAgICAgIEhvb2tzLmFkZEFjdGlvbigncHAucG9ydGZvbGlvLmRlc3Ryb3knLCB0aGlzLmhhbmRsZXIuZGVzdHJveSwgNTApO1xuICAgICAgSG9va3MuYWRkQWN0aW9uKCdwcC5wb3J0Zm9saW8uZGVzdHJveScsIHRoaXMuYXV0b19kZXN0cm95LCA1MDApO1xuICAgIH1cbiAgfVxuXG4gIFBvcnRmb2xpby5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgSG9va3MuZG9BY3Rpb24oJ3BwLnBvcnRmb2xpby5jcmVhdGUnKTtcbiAgfTtcblxuICBQb3J0Zm9saW8ucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbigpIHtcbiAgICBIb29rcy5kb0FjdGlvbigncHAucG9ydGZvbGlvLnJlZnJlc2gnKTtcbiAgfTtcblxuICBQb3J0Zm9saW8ucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICBIb29rcy5kb0FjdGlvbigncHAucG9ydGZvbGlvLmRlc3Ryb3knKTtcbiAgfTtcblxuICBQb3J0Zm9saW8ucHJvdG90eXBlLmF1dG9fZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLnJlbW92ZUFjdGlvbigncHAucG9ydGZvbGlvLmNyZWF0ZScsIHRoaXMuaGFuZGxlci5jcmVhdGUsIDUwKTtcbiAgICBIb29rcy5yZW1vdmVBY3Rpb24oJ3BwLnBvcnRmb2xpby5yZWZyZXNoJywgdGhpcy5oYW5kbGVyLnJlZnJlc2gsIDUwKTtcbiAgICByZXR1cm4gSG9va3MucmVtb3ZlQWN0aW9uKCdwcC5wb3J0Zm9saW8uZGVzdHJveScsIHRoaXMuaGFuZGxlci5kZXN0cm95LCA1MCk7XG4gIH07XG5cbiAgcmV0dXJuIFBvcnRmb2xpbztcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW87XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVVHOXlkR1p2YkdsdkxtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpVUc5eWRHWnZiR2x2TG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVN4SlFVRkJPenRCUVVGQkxFdEJRVUVzUjBGQlVTeFBRVUZCTEVOQlFWTXNWVUZCVkRzN1FVRkZSanRGUVVWUkxHMUNRVUZCT3p0QlFVTmFPenM3U1VGSFFTeEpRVUZETEVOQlFVRXNUMEZCUkN4SFFVRlhMRXRCUVVzc1EwRkJReXhaUVVGT0xFTkJRVzFDTEhOQ1FVRnVRaXhGUVVFeVF5eExRVUV6UXp0SlFVVllMRWxCUVVjc1NVRkJReXhEUVVGQkxFOUJRVW83VFVGRlF5eExRVUZMTEVOQlFVTXNVMEZCVGl4RFFVRm5RaXh4UWtGQmFFSXNSVUZCZFVNc1NVRkJReXhEUVVGQkxFOUJRVThzUTBGQlF5eE5RVUZvUkN4RlFVRjNSQ3hGUVVGNFJEdE5RVU5CTEV0QlFVc3NRMEZCUXl4VFFVRk9MRU5CUVdkQ0xITkNRVUZvUWl4RlFVRjNReXhKUVVGRExFTkJRVUVzVDBGQlR5eERRVUZETEU5QlFXcEVMRVZCUVRCRUxFVkJRVEZFTzAxQlEwRXNTMEZCU3l4RFFVRkRMRk5CUVU0c1EwRkJaMElzYzBKQlFXaENMRVZCUVhkRExFbEJRVU1zUTBGQlFTeFBRVUZQTEVOQlFVTXNUMEZCYWtRc1JVRkJNRVFzUlVGQk1VUTdUVUZIUVN4TFFVRkxMRU5CUVVNc1UwRkJUaXhEUVVGblFpeHpRa0ZCYUVJc1JVRkJkME1zU1VGQlF5eERRVUZCTEZsQlFYcERMRVZCUVhWRUxFZEJRWFpFTEVWQlVFUTdPMFZCVGxrN08zTkNRV1ZpTEUxQlFVRXNSMEZCVVN4VFFVRkJPMGxCUTFBc1MwRkJTeXhEUVVGRExGRkJRVTRzUTBGQlpTeHhRa0ZCWmp0RlFVUlBPenR6UWtGTFVpeFBRVUZCTEVkQlFWTXNVMEZCUVR0SlFVTlNMRXRCUVVzc1EwRkJReXhSUVVGT0xFTkJRV1VzYzBKQlFXWTdSVUZFVVRzN2MwSkJTMVFzVDBGQlFTeEhRVUZUTEZOQlFVRTdTVUZGVWl4TFFVRkxMRU5CUVVNc1VVRkJUaXhEUVVGbExITkNRVUZtTzBWQlJsRTdPM05DUVV0VUxGbEJRVUVzUjBGQll5eFRRVUZCTzBsQlJXSXNTMEZCU3l4RFFVRkRMRmxCUVU0c1EwRkJiVUlzY1VKQlFXNUNMRVZCUVRCRExFbEJRVU1zUTBGQlFTeFBRVUZQTEVOQlFVTXNUVUZCYmtRc1JVRkJNa1FzUlVGQk0wUTdTVUZEUVN4TFFVRkxMRU5CUVVNc1dVRkJUaXhEUVVGdFFpeHpRa0ZCYmtJc1JVRkJNa01zU1VGQlF5eERRVUZCTEU5QlFVOHNRMEZCUXl4UFFVRndSQ3hGUVVFMlJDeEZRVUUzUkR0WFFVTkJMRXRCUVVzc1EwRkJReXhaUVVGT0xFTkJRVzFDTEhOQ1FVRnVRaXhGUVVFeVF5eEpRVUZETEVOQlFVRXNUMEZCVHl4RFFVRkRMRTlCUVhCRUxFVkJRVFpFTEVWQlFUZEVPMFZCU21FN096czdPenRCUVU5bUxFMUJRVTBzUTBGQlF5eFBRVUZRTEVkQlFXbENJbjA9XG4iLCJcbi8qXG4gICAgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBIb29rcywgU3RhdGVfTWFuYWdlcixcbiAgYmluZCA9IGZ1bmN0aW9uKGZuLCBtZSl7IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7IH07IH07XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5TdGF0ZV9NYW5hZ2VyID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBTdGF0ZV9NYW5hZ2VyKCkge1xuICAgIHRoaXMubG9hZGVkID0gYmluZCh0aGlzLmxvYWRlZCwgdGhpcyk7XG4gICAgdGhpcy5yZWFkeSA9IGJpbmQodGhpcy5yZWFkeSwgdGhpcyk7XG4gICAgdGhpcy4kZG9jID0gJChkb2N1bWVudCk7XG4gICAgdGhpcy4kZG9jLm9uKCdyZWFkeScsIHRoaXMucmVhZHkpO1xuICAgIHRoaXMuJGRvYy5maW5kKCcucHAtd3JhcHBlcicpLmltYWdlc0xvYWRlZCh0aGlzLmxvYWRlZCk7XG4gIH1cblxuICBTdGF0ZV9NYW5hZ2VyLnByb3RvdHlwZS5yZWFkeSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0cmlnZ2VyO1xuICAgIHRyaWdnZXIgPSB0cnVlO1xuICAgIGlmIChIb29rcy5hcHBseUZpbHRlcnMoJ3BwLnJlYWR5JywgdHJ1ZSkpIHtcbiAgICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5yZWFkeScpO1xuICAgIH1cbiAgfTtcblxuICBTdGF0ZV9NYW5hZ2VyLnByb3RvdHlwZS5sb2FkZWQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdHJpZ2dlcjtcbiAgICB0cmlnZ2VyID0gdHJ1ZTtcbiAgICBpZiAoSG9va3MuYXBwbHlGaWx0ZXJzKCdwcC5sb2FkZWQnLCB0cnVlKSkge1xuICAgICAgSG9va3MuZG9BY3Rpb24oJ3BwLmxvYWRlZCcpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gU3RhdGVfTWFuYWdlcjtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdGF0ZV9NYW5hZ2VyO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lVM1JoZEdWZlRXRnVZV2RsY2k1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJbE4wWVhSbFgwMWhibUZuWlhJdVkyOW1abVZsSWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUk3UVVGQlFUczdPMEZCUVVFc1NVRkJRU3gxUWtGQlFUdEZRVUZCT3p0QlFVZEJMRU5CUVVFc1IwRkJTU3hQUVVGQkxFTkJRVk1zVVVGQlZEczdRVUZEU2l4TFFVRkJMRWRCUVZFc1QwRkJRU3hEUVVGVExGVkJRVlE3TzBGQlIwWTdSVUZGVVN4MVFrRkJRVHM3TzBsQlExb3NTVUZCUXl4RFFVRkJMRWxCUVVRc1IwRkJVU3hEUVVGQkxFTkJRVWNzVVVGQlNEdEpRVWRTTEVsQlFVTXNRMEZCUVN4SlFVRkpMRU5CUVVNc1JVRkJUaXhEUVVGVExFOUJRVlFzUlVGQmEwSXNTVUZCUXl4RFFVRkJMRXRCUVc1Q08wbEJRMEVzU1VGQlF5eERRVUZCTEVsQlFVa3NRMEZCUXl4SlFVRk9MRU5CUVZrc1lVRkJXaXhEUVVFeVFpeERRVUZETEZsQlFUVkNMRU5CUVRCRExFbEJRVU1zUTBGQlFTeE5RVUV6UXp0RlFVeFpPenN3UWtGUllpeExRVUZCTEVkQlFVOHNVMEZCUVR0QlFVTk9MRkZCUVVFN1NVRkJRU3hQUVVGQkxFZEJRVlU3U1VGRlZpeEpRVUZITEV0QlFVc3NRMEZCUXl4WlFVRk9MRU5CUVcxQ0xGVkJRVzVDTEVWQlFTdENMRWxCUVM5Q0xFTkJRVWc3VFVGRFF5eExRVUZMTEVOQlFVTXNVVUZCVGl4RFFVRmxMRlZCUVdZc1JVRkVSRHM3UlVGSVRUczdNRUpCVVZBc1RVRkJRU3hIUVVGUkxGTkJRVUU3UVVGRFVDeFJRVUZCTzBsQlFVRXNUMEZCUVN4SFFVRlZPMGxCUlZZc1NVRkJSeXhMUVVGTExFTkJRVU1zV1VGQlRpeERRVUZ0UWl4WFFVRnVRaXhGUVVGblF5eEpRVUZvUXl4RFFVRklPMDFCUTBNc1MwRkJTeXhEUVVGRExGRkJRVTRzUTBGQlpTeFhRVUZtTEVWQlJFUTdPMFZCU0U4N096czdPenRCUVZOVUxFMUJRVTBzUTBGQlF5eFBRVUZRTEVkQlFXbENJbjA9XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
