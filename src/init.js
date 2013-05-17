/* jshint -W103 */

var scope = function(namespace, base) {
  if (namespace) {
    if (base && !scope.instance[base]) {
      alert('Invalid scope parent: ' + base);
    } else {
      if (!scope.instance[namespace]) scope.instance[namespace] = scope.create_context(base ? scope.instance[base] : scope.instance);
      //scope.instance[namespace].__scope__ = namespace;
      return scope.instance[namespace];
    }
  } else {
    return scope.instance;
  }
};

// internal scope state stored here
scope.initial_state = function() {
  return {
    // for live dom observers
    data_logs: [],
    data_observers: [],
    data_hash: {},

    // layouts and rendering
    layouts: {},
    routes: [],
    refs: {}
  };
};
scope.state = scope.initial_state();

scope.create_context = function(proto) {
  function Scope() {}

  Scope.prototype = proto;
  var obj = new Scope();
  if (!obj.__proto__) obj.__proto__ = proto;
  return obj;
};

scope.instance = scope.create_context({
  define: function(key, callback) {
    this[key] = callback;
  }
});

// console.log for browsers lacking support
if (!window.console) window.console = { log: function() {} };