(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var $, App_State, Hooks, Masonry, State_Manager;

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

Masonry = require('class/Masonry');

State_Manager = require('class/State_Manager');

App_State = new State_Manager();

Hooks.addAction('pp.loaded', function() {
  var masonry;
  masonry = new Masonry();
  return masonry.start();
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"class/Masonry":2,"class/State_Manager":3}],2:[function(require,module,exports){
(function (global){

/*
    Dependencies
 */
var $, $window, Hooks, Masonry,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Hooks = (typeof window !== "undefined" ? window['wp']['hooks'] : typeof global !== "undefined" ? global['wp']['hooks'] : null);

$window = $(window);

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
    this.start = bind(this.start, this);
    this.create = bind(this.create, this);
    this.$container = $parent.find("." + this.Elements.container);
    this.Events = [['pp.masonry.destroy', this.destroy], ['pp.masonry.refresh', this.refresh], ['pp.masonry.init', this.start, 100]];
    this.attach();
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
  };

  Masonry.prototype.start = function() {
    Hooks.doAction('pp.masonry.before_start');
    this.$container.masonry('on', 'layoutComplete', (function(_this) {
      return function() {
        Hooks.doAction('pp.masonry.start');
        return _this.$container.removeClass('is-preparing-masonry');
      };
    })(this));
    return this.$container.masonry();
  };

  Masonry.prototype.destroy = function() {
    this.detach();
    this.maybe_remove_sizer();
    if (this.$container.length > 0) {
      this.$container.masonry('destroy');
    }
  };

  Masonry.prototype.refresh = function() {
    return this.$container.maosnry('layout');
  };

  Masonry.prototype.attach = function() {
    var event, i, len, ref, results;
    ref = this.Events;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      event = ref[i];
      results.push(Hooks.addAction.apply(this, event));
    }
    return results;
  };

  Masonry.prototype.detach = function() {
    var event, i, len, ref, results;
    ref = this.Events;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      event = ref[i];
      results.push(Hooks.removeAction.apply(this, event));
    }
    return results;
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


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2VzL3NjcmlwdC9jb2ZmZWUvYXBwLmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jbGFzcy9NYXNvbnJ5LmNvZmZlZSIsInNvdXJjZXMvc2NyaXB0L2NvZmZlZS9jbGFzcy9TdGF0ZV9NYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgJCwgQXBwX1N0YXRlLCBIb29rcywgTWFzb25yeSwgU3RhdGVfTWFuYWdlcjtcblxuJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydqUXVlcnknXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ2pRdWVyeSddIDogbnVsbCk7XG5cbkhvb2tzID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ3dwJ11bJ2hvb2tzJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyd3cCddWydob29rcyddIDogbnVsbCk7XG5cbk1hc29ucnkgPSByZXF1aXJlKCdjbGFzcy9NYXNvbnJ5Jyk7XG5cblN0YXRlX01hbmFnZXIgPSByZXF1aXJlKCdjbGFzcy9TdGF0ZV9NYW5hZ2VyJyk7XG5cbkFwcF9TdGF0ZSA9IG5ldyBTdGF0ZV9NYW5hZ2VyKCk7XG5cbkhvb2tzLmFkZEFjdGlvbigncHAubG9hZGVkJywgZnVuY3Rpb24oKSB7XG4gIHZhciBtYXNvbnJ5O1xuICBtYXNvbnJ5ID0gbmV3IE1hc29ucnkoKTtcbiAgcmV0dXJuIG1hc29ucnkuc3RhcnQoKTtcbn0pO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lZWEJ3TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2lZWEJ3TG1OdlptWmxaU0pkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lPMEZCUVVFN096dEJRVUZCTEVsQlFVRTdPMEZCUjBFc1EwRkJRU3hIUVVGSkxFOUJRVUVzUTBGQlV5eFJRVUZVT3p0QlFVTktMRXRCUVVFc1IwRkJVU3hQUVVGQkxFTkJRVk1zVlVGQlZEczdRVUZEVWl4UFFVRkJMRWRCUVZVc1QwRkJRU3hEUVVGVExHVkJRVlE3TzBGQlExWXNZVUZCUVN4SFFVRm5RaXhQUVVGQkxFTkJRVk1zY1VKQlFWUTdPMEZCUldoQ0xGTkJRVUVzUjBGQlowSXNTVUZCUVN4aFFVRkJMRU5CUVVFN08wRkJSV2hDTEV0QlFVc3NRMEZCUXl4VFFVRk9MRU5CUVdkQ0xGZEJRV2hDTEVWQlFUWkNMRk5CUVVFN1FVRkROVUlzVFVGQlFUdEZRVUZCTEU5QlFVRXNSMEZCWXl4SlFVRkJMRTlCUVVFc1EwRkJRVHRUUVVOa0xFOUJRVThzUTBGQlF5eExRVUZTTEVOQlFVRTdRVUZHTkVJc1EwRkJOMElpZlE9PVxuIiwiXG4vKlxuICAgIERlcGVuZGVuY2llc1xuICovXG52YXIgJCwgJHdpbmRvdywgSG9va3MsIE1hc29ucnksXG4gIGJpbmQgPSBmdW5jdGlvbihmbiwgbWUpeyByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuIGZuLmFwcGx5KG1lLCBhcmd1bWVudHMpOyB9OyB9O1xuXG4kID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ2pRdWVyeSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnalF1ZXJ5J10gOiBudWxsKTtcblxuSG9va3MgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snd3AnXVsnaG9va3MnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ3dwJ11bJ2hvb2tzJ10gOiBudWxsKTtcblxuJHdpbmRvdyA9ICQod2luZG93KTtcblxuTWFzb25yeSA9IChmdW5jdGlvbigpIHtcbiAgTWFzb25yeS5wcm90b3R5cGUuRWxlbWVudHMgPSB7XG4gICAgY29udGFpbmVyOiAnUFAtTWFzb25yeScsXG4gICAgc2l6ZXI6ICdQUC1NYXNvbnJ5X19zaXplcicsXG4gICAgaXRlbTogJ1BQLU1hc29ucnlfX2l0ZW0nXG4gIH07XG5cbiAgZnVuY3Rpb24gTWFzb25yeSgkcGFyZW50KSB7XG4gICAgaWYgKCRwYXJlbnQgPT0gbnVsbCkge1xuICAgICAgJHBhcmVudCA9ICQoZG9jdW1lbnQpO1xuICAgIH1cbiAgICB0aGlzLnJlZnJlc2ggPSBiaW5kKHRoaXMucmVmcmVzaCwgdGhpcyk7XG4gICAgdGhpcy5kZXN0cm95ID0gYmluZCh0aGlzLmRlc3Ryb3ksIHRoaXMpO1xuICAgIHRoaXMuc3RhcnQgPSBiaW5kKHRoaXMuc3RhcnQsIHRoaXMpO1xuICAgIHRoaXMuY3JlYXRlID0gYmluZCh0aGlzLmNyZWF0ZSwgdGhpcyk7XG4gICAgdGhpcy4kY29udGFpbmVyID0gJHBhcmVudC5maW5kKFwiLlwiICsgdGhpcy5FbGVtZW50cy5jb250YWluZXIpO1xuICAgIHRoaXMuRXZlbnRzID0gW1sncHAubWFzb25yeS5kZXN0cm95JywgdGhpcy5kZXN0cm95XSwgWydwcC5tYXNvbnJ5LnJlZnJlc2gnLCB0aGlzLnJlZnJlc2hdLCBbJ3BwLm1hc29ucnkuaW5pdCcsIHRoaXMuc3RhcnQsIDEwMF1dO1xuICAgIHRoaXMuYXR0YWNoKCk7XG4gICAgdGhpcy5jcmVhdGUoKTtcbiAgfVxuXG4gIE1hc29ucnkucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLiRjb250YWluZXIubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuJGNvbnRhaW5lci5hZGRDbGFzcygnaXMtcHJlcGFyaW5nLW1hc29ucnknKTtcbiAgICB0aGlzLm1heWJlX2NyZWF0ZV9zaXplcigpO1xuICAgIHRoaXMuJGNvbnRhaW5lci5tYXNvbnJ5KHtcbiAgICAgIGl0ZW1TZWxlY3RvcjogXCIuXCIgKyB0aGlzLkVsZW1lbnRzLml0ZW0sXG4gICAgICBjb2x1bW5XaWR0aDogXCIuXCIgKyB0aGlzLkVsZW1lbnRzLnNpemVyLFxuICAgICAgZ3V0dGVyOiAwLFxuICAgICAgaW5pdExheW91dDogZmFsc2VcbiAgICB9KTtcbiAgfTtcblxuICBNYXNvbnJ5LnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5tYXNvbnJ5LmJlZm9yZV9zdGFydCcpO1xuICAgIHRoaXMuJGNvbnRhaW5lci5tYXNvbnJ5KCdvbicsICdsYXlvdXRDb21wbGV0ZScsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBIb29rcy5kb0FjdGlvbigncHAubWFzb25yeS5zdGFydCcpO1xuICAgICAgICByZXR1cm4gX3RoaXMuJGNvbnRhaW5lci5yZW1vdmVDbGFzcygnaXMtcHJlcGFyaW5nLW1hc29ucnknKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHJldHVybiB0aGlzLiRjb250YWluZXIubWFzb25yeSgpO1xuICB9O1xuXG4gIE1hc29ucnkucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmRldGFjaCgpO1xuICAgIHRoaXMubWF5YmVfcmVtb3ZlX3NpemVyKCk7XG4gICAgaWYgKHRoaXMuJGNvbnRhaW5lci5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLiRjb250YWluZXIubWFzb25yeSgnZGVzdHJveScpO1xuICAgIH1cbiAgfTtcblxuICBNYXNvbnJ5LnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuJGNvbnRhaW5lci5tYW9zbnJ5KCdsYXlvdXQnKTtcbiAgfTtcblxuICBNYXNvbnJ5LnByb3RvdHlwZS5hdHRhY2ggPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZXZlbnQsIGksIGxlbiwgcmVmLCByZXN1bHRzO1xuICAgIHJlZiA9IHRoaXMuRXZlbnRzO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGV2ZW50ID0gcmVmW2ldO1xuICAgICAgcmVzdWx0cy5wdXNoKEhvb2tzLmFkZEFjdGlvbi5hcHBseSh0aGlzLCBldmVudCkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICBNYXNvbnJ5LnByb3RvdHlwZS5kZXRhY2ggPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZXZlbnQsIGksIGxlbiwgcmVmLCByZXN1bHRzO1xuICAgIHJlZiA9IHRoaXMuRXZlbnRzO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGV2ZW50ID0gcmVmW2ldO1xuICAgICAgcmVzdWx0cy5wdXNoKEhvb2tzLnJlbW92ZUFjdGlvbi5hcHBseSh0aGlzLCBldmVudCkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuXG4gIC8qXG4gIFxuICBcdFx0Q3JlYXRlIGEgc2l6ZXIgZWxlbWVudCBmb3IganF1ZXJ5LW1hc29ucnkgdG8gdXNlXG4gICAqL1xuXG4gIE1hc29ucnkucHJvdG90eXBlLm1heWJlX2NyZWF0ZV9zaXplciA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnNpemVyX2RvZXNudF9leGlzdCgpKSB7XG4gICAgICB0aGlzLmNyZWF0ZV9zaXplcigpO1xuICAgIH1cbiAgfTtcblxuICBNYXNvbnJ5LnByb3RvdHlwZS5tYXliZV9yZW1vdmVfc2l6ZXIgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy4kY29udGFpbmVyLmxlbmd0aCAhPT0gMSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLiRjb250YWluZXIuZmluZChcIi5cIiArIHRoaXMuRWxlbWVudHMuc2l6ZXIpLnJlbW92ZSgpO1xuICB9O1xuXG4gIE1hc29ucnkucHJvdG90eXBlLnNpemVyX2RvZXNudF9leGlzdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLiRjb250YWluZXIuZmluZChcIi5cIiArIHRoaXMuRWxlbWVudHMuc2l6ZXIpLmxlbmd0aCA9PT0gMDtcbiAgfTtcblxuICBNYXNvbnJ5LnByb3RvdHlwZS5jcmVhdGVfc2l6ZXIgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLiRjb250YWluZXIuYXBwZW5kKFwiPGRpdiBjbGFzcz1cXFwiXCIgKyB0aGlzLkVsZW1lbnRzLnNpemVyICsgXCJcXFwiPjwvZGl2PlwiKTtcbiAgfTtcblxuICByZXR1cm4gTWFzb25yeTtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNYXNvbnJ5O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lUV0Z6YjI1eWVTNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSWsxaGMyOXVjbmt1WTI5bVptVmxJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSTdRVUZCUVRzN08wRkJRVUVzU1VGQlFTd3dRa0ZCUVR0RlFVRkJPenRCUVVkQkxFTkJRVUVzUjBGQlNTeFBRVUZCTEVOQlFWTXNVVUZCVkRzN1FVRkRTaXhMUVVGQkxFZEJRVkVzVDBGQlFTeERRVUZUTEZWQlFWUTdPMEZCUTFJc1QwRkJRU3hIUVVGVkxFTkJRVUVzUTBGQlJ5eE5RVUZJT3p0QlFVVktPMjlDUVVWTUxGRkJRVUVzUjBGRFF6dEpRVUZCTEZOQlFVRXNSVUZCVnl4WlFVRllPMGxCUTBFc1MwRkJRU3hGUVVGWExHMUNRVVJZTzBsQlJVRXNTVUZCUVN4RlFVRlhMR3RDUVVaWU96czdSVUZQV1N4cFFrRkJSU3hQUVVGR096dE5RVUZGTEZWQlFWVXNRMEZCUVN4RFFVRkhMRkZCUVVnN096czdPenRKUVVONFFpeEpRVUZETEVOQlFVRXNWVUZCUkN4SFFVRmpMRTlCUVU4c1EwRkJReXhKUVVGU0xFTkJRV01zUjBGQlFTeEhRVUZKTEVsQlFVTXNRMEZCUVN4UlFVRlJMRU5CUVVNc1UwRkJOVUk3U1VGRlpDeEpRVUZETEVOQlFVRXNUVUZCUkN4SFFVRlZMRU5CUTFRc1EwRkJSU3h2UWtGQlJpeEZRVUYzUWl4SlFVRkRMRU5CUVVFc1QwRkJla0lzUTBGRVV5eEZRVVZVTEVOQlFVVXNiMEpCUVVZc1JVRkJkMElzU1VGQlF5eERRVUZCTEU5QlFYcENMRU5CUmxNc1JVRkhWQ3hEUVVGRkxHbENRVUZHTEVWQlFYRkNMRWxCUVVNc1EwRkJRU3hMUVVGMFFpeEZRVUUyUWl4SFFVRTNRaXhEUVVoVE8wbEJUMVlzU1VGQlF5eERRVUZCTEUxQlFVUXNRMEZCUVR0SlFVTkJMRWxCUVVNc1EwRkJRU3hOUVVGRUxFTkJRVUU3UlVGWVdUczdiMEpCWTJJc1RVRkJRU3hIUVVGUkxGTkJRVUU3U1VGRFVDeEpRVUZWTEVsQlFVTXNRMEZCUVN4VlFVRlZMRU5CUVVNc1RVRkJXaXhMUVVGelFpeERRVUZvUXp0QlFVRkJMR0ZCUVVFN08wbEJSVUVzU1VGQlF5eERRVUZCTEZWQlFWVXNRMEZCUXl4UlFVRmFMRU5CUVhGQ0xITkNRVUZ5UWp0SlFVVkJMRWxCUVVNc1EwRkJRU3hyUWtGQlJDeERRVUZCTzBsQlIwRXNTVUZCUXl4RFFVRkJMRlZCUVZVc1EwRkJReXhQUVVGYUxFTkJRME03VFVGQlFTeFpRVUZCTEVWQlFXTXNSMEZCUVN4SFFVRkpMRWxCUVVNc1EwRkJRU3hSUVVGUkxFTkJRVU1zU1VGQk5VSTdUVUZEUVN4WFFVRkJMRVZCUVdNc1IwRkJRU3hIUVVGSkxFbEJRVU1zUTBGQlFTeFJRVUZSTEVOQlFVTXNTMEZFTlVJN1RVRkZRU3hOUVVGQkxFVkJRV01zUTBGR1pEdE5RVWRCTEZWQlFVRXNSVUZCWXl4TFFVaGtPMHRCUkVRN1JVRlNUenM3YjBKQmFVSlNMRXRCUVVFc1IwRkJUeXhUUVVGQk8wbEJRMDRzUzBGQlN5eERRVUZETEZGQlFVNHNRMEZCWlN4NVFrRkJaanRKUVVWQkxFbEJRVU1zUTBGQlFTeFZRVUZWTEVOQlFVTXNUMEZCV2l4RFFVRnZRaXhKUVVGd1FpeEZRVUV3UWl4blFrRkJNVUlzUlVGQk5FTXNRMEZCUVN4VFFVRkJMRXRCUVVFN1lVRkJRU3hUUVVGQk8xRkJRek5ETEV0QlFVc3NRMEZCUXl4UlFVRk9MRU5CUVdVc2EwSkJRV1k3WlVGRFFTeExRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRmRCUVZvc1EwRkJkMElzYzBKQlFYaENPMDFCUmpKRE8wbEJRVUVzUTBGQlFTeERRVUZCTEVOQlFVRXNTVUZCUVN4RFFVRTFRenRYUVVsQkxFbEJRVU1zUTBGQlFTeFZRVUZWTEVOQlFVTXNUMEZCV2l4RFFVRkJPMFZCVUUwN08yOUNRVk5RTEU5QlFVRXNSMEZCVXl4VFFVRkJPMGxCUTFJc1NVRkJReXhEUVVGQkxFMUJRVVFzUTBGQlFUdEpRVU5CTEVsQlFVTXNRMEZCUVN4clFrRkJSQ3hEUVVGQk8wbEJSVUVzU1VGQlJ5eEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRTFCUVZvc1IwRkJjVUlzUTBGQmVFSTdUVUZEUXl4SlFVRkRMRU5CUVVFc1ZVRkJWU3hEUVVGRExFOUJRVm9zUTBGQmNVSXNVMEZCY2tJc1JVRkVSRHM3UlVGS1VUczdiMEpCVlZRc1QwRkJRU3hIUVVGVExGTkJRVUU3VjBGRFVpeEpRVUZETEVOQlFVRXNWVUZCVlN4RFFVRkRMRTlCUVZvc1EwRkJjVUlzVVVGQmNrSTdSVUZFVVRzN2IwSkJSMVFzVFVGQlFTeEhRVUZSTEZOQlFVRTdRVUZEVUN4UlFVRkJPMEZCUVVFN1FVRkJRVHRUUVVGQkxIRkRRVUZCT3p0dFFrRkRReXhMUVVGTExFTkJRVU1zVTBGQlV5eERRVUZETEV0QlFXaENMRU5CUVhWQ0xFbEJRWFpDTEVWQlFUWkNMRXRCUVRkQ08wRkJSRVE3TzBWQlJFODdPMjlDUVVsU0xFMUJRVUVzUjBGQlVTeFRRVUZCTzBGQlExQXNVVUZCUVR0QlFVRkJPMEZCUVVFN1UwRkJRU3h4UTBGQlFUczdiVUpCUTBNc1MwRkJTeXhEUVVGRExGbEJRVmtzUTBGQlF5eExRVUZ1UWl4RFFVRXdRaXhKUVVFeFFpeEZRVUZuUXl4TFFVRm9RenRCUVVSRU96dEZRVVJQT3pzN1FVRkxVanM3T3pzN2IwSkJTMEVzYTBKQlFVRXNSMEZCYjBJc1UwRkJRVHRKUVVOdVFpeEpRVUZ0UWl4SlFVRkRMRU5CUVVFc2EwSkJRVVFzUTBGQlFTeERRVUZ1UWp0TlFVRkJMRWxCUVVNc1EwRkJRU3haUVVGRUxFTkJRVUVzUlVGQlFUczdSVUZFYlVJN08yOUNRVWx3UWl4clFrRkJRU3hIUVVGdlFpeFRRVUZCTzBsQlEyNUNMRWxCUVZVc1NVRkJReXhEUVVGQkxGVkJRVlVzUTBGQlF5eE5RVUZhTEV0QlFYZENMRU5CUVd4RE8wRkJRVUVzWVVGQlFUczdTVUZEUVN4SlFVRkRMRU5CUVVFc1ZVRkJWU3hEUVVGRExFbEJRVm9zUTBGQmFVSXNSMEZCUVN4SFFVRkpMRWxCUVVNc1EwRkJRU3hSUVVGUkxFTkJRVU1zUzBGQkwwSXNRMEZCZFVNc1EwRkJReXhOUVVGNFF5eERRVUZCTzBWQlJtMUNPenR2UWtGTGNFSXNhMEpCUVVFc1IwRkJiMElzVTBGQlFUdFhRVUZITEVsQlFVTXNRMEZCUVN4VlFVRlZMRU5CUVVNc1NVRkJXaXhEUVVGclFpeEhRVUZCTEVkQlFVa3NTVUZCUXl4RFFVRkJMRkZCUVZFc1EwRkJReXhMUVVGb1F5eERRVUY1UXl4RFFVRkRMRTFCUVRGRExFdEJRVzlFTzBWQlFYWkVPenR2UWtGSGNFSXNXVUZCUVN4SFFVRmpMRk5CUVVFN1NVRkRZaXhKUVVGRExFTkJRVUVzVlVGQlZTeERRVUZETEUxQlFWb3NRMEZCYlVJc1pVRkJRU3hIUVVGcFFpeEpRVUZETEVOQlFVRXNVVUZCVVN4RFFVRkRMRXRCUVROQ0xFZEJRV2xETEZkQlFYQkVPMFZCUkdFN096czdPenRCUVUxbUxFMUJRVTBzUTBGQlF5eFBRVUZRTEVkQlFXbENJbjA9XG4iLCJcbi8qXG4gICAgRGVwZW5kZW5jaWVzXG4gKi9cbnZhciAkLCBIb29rcywgU3RhdGVfTWFuYWdlcixcbiAgYmluZCA9IGZ1bmN0aW9uKGZuLCBtZSl7IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7IH07IH07XG5cbiQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snalF1ZXJ5J10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydqUXVlcnknXSA6IG51bGwpO1xuXG5Ib29rcyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Wyd3cCddWydob29rcyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnd3AnXVsnaG9va3MnXSA6IG51bGwpO1xuXG5TdGF0ZV9NYW5hZ2VyID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBTdGF0ZV9NYW5hZ2VyKCkge1xuICAgIHRoaXMubG9hZGVkID0gYmluZCh0aGlzLmxvYWRlZCwgdGhpcyk7XG4gICAgdGhpcy5yZWFkeSA9IGJpbmQodGhpcy5yZWFkeSwgdGhpcyk7XG4gICAgdGhpcy4kZG9jID0gJChkb2N1bWVudCk7XG4gICAgdGhpcy4kZG9jLm9uKCdyZWFkeScsIHRoaXMucmVhZHkpO1xuICAgIHRoaXMuJGRvYy5maW5kKCcucHAtd3JhcHBlcicpLmltYWdlc0xvYWRlZCh0aGlzLmxvYWRlZCk7XG4gIH1cblxuICBTdGF0ZV9NYW5hZ2VyLnByb3RvdHlwZS5yZWFkeSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0cmlnZ2VyO1xuICAgIHRyaWdnZXIgPSB0cnVlO1xuICAgIGlmIChIb29rcy5hcHBseUZpbHRlcnMoJ3BwLnJlYWR5JywgdHJ1ZSkpIHtcbiAgICAgIEhvb2tzLmRvQWN0aW9uKCdwcC5yZWFkeScpO1xuICAgIH1cbiAgfTtcblxuICBTdGF0ZV9NYW5hZ2VyLnByb3RvdHlwZS5sb2FkZWQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdHJpZ2dlcjtcbiAgICB0cmlnZ2VyID0gdHJ1ZTtcbiAgICBpZiAoSG9va3MuYXBwbHlGaWx0ZXJzKCdwcC5sb2FkZWQnLCB0cnVlKSkge1xuICAgICAgSG9va3MuZG9BY3Rpb24oJ3BwLmxvYWRlZCcpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gU3RhdGVfTWFuYWdlcjtcblxufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdGF0ZV9NYW5hZ2VyO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lVM1JoZEdWZlRXRnVZV2RsY2k1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJbE4wWVhSbFgwMWhibUZuWlhJdVkyOW1abVZsSWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUk3UVVGQlFUczdPMEZCUVVFc1NVRkJRU3gxUWtGQlFUdEZRVUZCT3p0QlFVZEJMRU5CUVVFc1IwRkJTU3hQUVVGQkxFTkJRVk1zVVVGQlZEczdRVUZEU2l4TFFVRkJMRWRCUVZFc1QwRkJRU3hEUVVGVExGVkJRVlE3TzBGQlIwWTdSVUZGVVN4MVFrRkJRVHM3TzBsQlExb3NTVUZCUXl4RFFVRkJMRWxCUVVRc1IwRkJVU3hEUVVGQkxFTkJRVWNzVVVGQlNEdEpRVWRTTEVsQlFVTXNRMEZCUVN4SlFVRkpMRU5CUVVNc1JVRkJUaXhEUVVGVExFOUJRVlFzUlVGQmEwSXNTVUZCUXl4RFFVRkJMRXRCUVc1Q08wbEJRMEVzU1VGQlF5eERRVUZCTEVsQlFVa3NRMEZCUXl4SlFVRk9MRU5CUVZrc1lVRkJXaXhEUVVFeVFpeERRVUZETEZsQlFUVkNMRU5CUVRCRExFbEJRVU1zUTBGQlFTeE5RVUV6UXp0RlFVeFpPenN3UWtGUllpeExRVUZCTEVkQlFVOHNVMEZCUVR0QlFVTk9MRkZCUVVFN1NVRkJRU3hQUVVGQkxFZEJRVlU3U1VGRlZpeEpRVUZITEV0QlFVc3NRMEZCUXl4WlFVRk9MRU5CUVcxQ0xGVkJRVzVDTEVWQlFTdENMRWxCUVM5Q0xFTkJRVWc3VFVGRFF5eExRVUZMTEVOQlFVTXNVVUZCVGl4RFFVRmxMRlZCUVdZc1JVRkVSRHM3UlVGSVRUczdNRUpCVVZBc1RVRkJRU3hIUVVGUkxGTkJRVUU3UVVGRFVDeFJRVUZCTzBsQlFVRXNUMEZCUVN4SFFVRlZPMGxCUlZZc1NVRkJSeXhMUVVGTExFTkJRVU1zV1VGQlRpeERRVUZ0UWl4WFFVRnVRaXhGUVVGblF5eEpRVUZvUXl4RFFVRklPMDFCUTBNc1MwRkJTeXhEUVVGRExGRkJRVTRzUTBGQlpTeFhRVUZtTEVWQlJFUTdPMFZCU0U4N096czdPenRCUVZOVUxFMUJRVTBzUTBGQlF5eFBRVUZRTEVkQlFXbENJbjA9XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
