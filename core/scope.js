var scope = function(namespace, base) {
  var create_context = function(proto) {
    function Scope() {};
    Scope.prototype = proto;
    var obj = new Scope();
    if (!obj.__proto__) obj.__proto__ = proto;
    return obj;
  }

  if (!scope.instance) scope.instance = create_context({ 
    define: function(key, value) { 
      this[key] = value;
    }
  });

  if (namespace) {
    if (base && !scope.instance[base]) {
      alert('Invalid scope parent: ' + base);
    } else {
      if (!scope.instance[namespace]) scope.instance[namespace] = create_context(base ? scope.instance[base] : scope.instance);
      return scope.instance[namespace];
    }
  } else {
    return scope.instance;
  }
};