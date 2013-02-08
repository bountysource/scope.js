/* scope-0.4.0.js -- http://scopejs.net/ */
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

// for live dom observers
scope.data_logs = [];
scope.data_observers = [];
scope.data_hash = {};  

scope.create_context = function(proto) {
  function Scope() {};
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
if (!window.console) window.console = { log: function() {} };with (scope()) {
  define('redefine', function(name, callback) {
    var real_callback = this[name];
    define(name, function() {
      return callback.apply(this, [real_callback].concat(Array.prototype.slice.call(arguments)));
    });
  });

  define('stop_event', function(e) {
    if (!e) return;
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
    e.cancelBubble = true;
    e.returnValue = false;
  });
  
  define('flatten_to_array', function() {
    var stack = Array.prototype.slice.call(arguments);
    var arguments = [];
    while (stack.length > 0) {
      var obj = stack.shift();
      if (obj || (typeof(obj) == 'number')) {
        if ((typeof(obj) == 'object') && obj.concat) {
          // array? just concat
          stack = obj.concat(stack);
        } else if (((typeof(obj) == 'object') && obj.callee) || (Object.prototype.toString.call(obj).indexOf('NodeList') >= 0)) {
          // explicitly passed arguments or childNodes object? to another function
          stack = Array.prototype.slice.call(obj).concat(stack);
        } else {
          arguments.push(obj);
        }
      }
    }
    return arguments;
  });

  define('shift_options_from_args', function(args) {
    if ((typeof(args[0]) == 'object') && (typeof(args[0].nodeType) == 'undefined')) {
      return args.shift();
    } else if ((typeof(args[args.length-1]) == 'object') && (typeof(args[args.length-1].nodeType) == 'undefined')) {
      return args.pop();
    } else {
      return {};
    }
  });

  define('shift_callback_from_args', function(args) {
    if (typeof(args[0]) == 'function') {
      return args.shift();
    } else if (typeof(args[args.length-1]) == 'function') {
      return args.pop();
    } else {
      return (function(){});
    }
  });
  
  define('for_each', function() {
    var objs = flatten_to_array(arguments);
    var callback = objs.pop();
    var ret_val = [];
    for (var i=0; i < objs.length; i++) ret_val.push(callback(objs[i]));
    return ret_val;
  });
  
  define('curry', function(callback) {
    var curried_args = Array.prototype.slice.call(arguments,1);
    return (function() {
      return callback.apply(this, Array.prototype.concat.apply(curried_args, arguments));
    });
  });  
  
  // expects an iteratable array
  define('filter', function(iteratable, callback) {
    var retval = [];
    for (var i=0; i < iteratable.length; i++) if (callback(iteratable[i])) retval.push(iteratable[i]);
    return retval;
  });

  // encode html string
  define('encode_html', function(raw_html) {
    return encodeURIComponent(raw_html);
  });

  // decode an already encoded html string
  define('decode_html', function(encoded_html) {
    return decodeURIComponent(encoded_html)
  });

  // merge one hash into another. non-destructive. values in b will overwrite those in a.
  define('merge', function(a, b) {
    var new_hash = {};
    for (var k in a) new_hash[k] = a[k];
    for (var k in b) new_hash[k] = b[k];
    return new_hash;
  });
}
with (scope()) {
  scope.__initializers = [];

  define('initializer', function(callback) {
    scope.__initializers.push(callback);
  });
  
  // setup browser hook
  window.onload = function() {
    for (var i=0; i < scope.__initializers.length; i++) scope.__initializers[i]();
    delete scope.__initializers;
  }
}with (scope()) {

  define('render', function() {
    var arguments = flatten_to_array(arguments);
    var options = shift_options_from_args(arguments);

    options.layout = typeof(options.layout) == 'undefined' ? ((options.target||options.into) ? false : this.default_layout) : options.layout;
    options.target =  options.target || options.into || document.body;
    if (typeof(options.target) == 'string') options.target = document.getElementById(options.target);

    if (options.layout) {
      arguments = options.layout(arguments);
      if (!arguments.push) arguments = [arguments];
      if (arguments[0].parentNode == options.target) return;
    }

    if (options.target.innerHTML) options.target.innerHTML = '';
    //while (options.target.firstChild) options.target.removeChild(options.target.firstChild);
    for (var i=0; i <= arguments.length; i++) {
      var dom_element = arguments[i];
      
      // if it's a function, run it with observers
      if (typeof(dom_element) == 'function') {
        // console.log("running function")
        dom_element = observe(dom_element, function(retval, old_retval) {
          // console.log("INSIDE ELEMENT OBSERVER", retval, old_retval)
          
          // if the function returns nothing, use an empty string as a place holder
          if (typeof(retval) == 'undefined') retval = '';

          // duplicated below, shady.
          if (['string','boolean','number'].indexOf(typeof(retval)) >= 0) retval = document.createTextNode('' + retval);
  
          // replace current previous node with current
          if (old_retval && old_retval.parentNode) {
            // console.log("has parentNode and needs refresh", retval, old_retval);
            old_retval.parentNode.insertBefore(retval, old_retval);
            old_retval.parentNode.removeChild(old_retval);
          }

          return retval;
        });
      }
      
      // convert core JS types to text nodes
      if (['string','boolean','number'].indexOf(typeof(dom_element)) >= 0) dom_element = document.createTextNode('' + dom_element);
      
      // insert it at the end
      if (dom_element) options.target.appendChild(dom_element);
    }
  });
  
  // define('layout', function(name, callback) {
  //   var layout_elem, yield_parent;
  //   define(name, function() {
  //     if (!layout_elem) {
  //       var tmp_div = div();
  //       layout_elem = callback(tmp_div);
  //       yield_parent = tmp_div.parentNode;
  //     }
  //     
  //     render({ into: yield_parent, layout: false }, arguments);
  //     return layout_elem;
  //   });
  // });


  // options processing order:
  //   type
  //   events/on*
  //   style
  //   class
  //   attribute
  define('element', function() {
    var arguments = flatten_to_array(arguments);
    var tag = arguments.shift();
    var options = shift_options_from_args(arguments);

    // first argument is element type (div, span, etc)
    var element = document.createElement(tag);

    // always set type first as IE7 behaves differently for different types
    if (options.type) {
      element.setAttribute('type', options.type);
      delete options.type;
    }

    // converts { events: { click: 1, focus: 2 } } to { onClick: 1,  onFocus: 2 }
    if (options.events) {
      for (var k in options.events) {
        options['on' + k] = options.events[k];
      }
      delete options.events;
    }

    // runs through all on* and attaches events to the object
    for (var k in options) {
      if (k.indexOf('on') == 0) {
        var callback = (function(cb) { return function() { cb.apply(element, Array.prototype.slice.call(arguments)); } })(options[k]);
        if (element.addEventListener) {
          element.addEventListener(k.substring(2).toLowerCase(), callback, false);
        } else {
          element.attachEvent(k.toLowerCase(), callback);
        }
        delete options[k];
      }
    }

    // run through rest of the attributes
    for (var k in options) {
      if (typeof(options[k]) == 'function') {
        //console.log("LIVE OBSERVER")

        var key1 = k;
        observe(options[k], function(retval) {
          //console.log("SETTING LIVE OBSERVER", retval, element, key1)
          set_attribute(element, key1, retval);
        });
      } else {
        set_attribute(element, k, options[k]);
      }
    }
    
    // append child elements
    if (arguments.length > 0) render({ into: element }, arguments);

    return element;
  });
  
  // basically setAttribute but with better class/style/placeholder support
  define('set_attribute', function(element, key, value) { 
    //console.log("setting attribute", element, key, value)

    if (key == 'class') {
      element.className = value;
    } else if (key == 'style') {
      element.style.cssText = value;
    } else if (key == 'placeholder') {
      //add spaces to the end of placeholder so the serialized_form-hack doesn't match
      element.setAttribute(key, value + ' '); 
    } else if ((key == 'html') || (key.toLowerCase() == 'innerhtml')) {
      element.innerHTML = value;
    } else if (key == 'checked') {
      //add spaces to the end of placeholder so the serialized_form-hack doesn't match
      //console.log("SETTING CHECKED", value, value ? 'checked' : null)
      //element.setAttribute(key, value ? 'checked' : null); 
      element.checked = !!value;
    } else if (value != undefined) {
      element.setAttribute(key, value);
    }
  });

  // simple elements
  for_each(
    'script', 'meta', 'title', 'link', 'script', 'iframe', 
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'small',
    'div', 'p', 'span', 'pre', 'img', 'br', 'hr', 'i', 'b', 'strong', 'u',
    'ul', 'ol', 'li', 'dl', 'dt', 'dd',
    'table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot',
    'select', 'option', 'optgroup', 'textarea', 'button', 'label', 'fieldset',
    'header', 'section', 'footer', 'code',
    function(tag) { 
      define(tag, function() { return element(tag, arguments) }); 
    }
  );
  
  define('a', function() { 
    var arguments = flatten_to_array(arguments);
    var options = shift_options_from_args(arguments);
    
    if (options.href && options.href.call) {
      var real_callback = options.href;
      options.href = '';
      options.onClick = function(e) {
        stop_event(e);
        real_callback();
      }
    } else if (options.href && options.href.indexOf('#') == 0) {
      // creating a new function for each link is expensive, so create once and save
      if (!this.a.click_handler) this.a.click_handler = function(e) {
        stop_event(e);
        set_route('#' + this.href.split('#')[1]);
      };
      options.onClick = this.a.click_handler;
    }

    return element('a', options, arguments);
  });
  
  define('img', function() { 
    var arguments = flatten_to_array(arguments);
    var options = shift_options_from_args(arguments);
    
    if (!options.src && (arguments.length == 1)) options.src = arguments.pop();
    
    return element('img', options, arguments);
  });
  
  
  define('form', function() {
    var arguments = flatten_to_array(arguments);
    var options = shift_options_from_args(arguments);
    
    if (options.action && options.action.call) {
      var real_callback = options.action;
      options.onSubmit = function(e) {
        stop_event(e);

        var serialized_form = {};
        var elems = this.getElementsByTagName('*');
        for (var i=0; i < elems.length; i++) {
          if ((elems[i].tagName != 'FORM') && elems[i].name) {
            var value = null;
            if (elems[i].tagName == 'SELECT') {
              // TODO: support multiple select
              value = elems[i].options[elems[i].selectedIndex].value;
            } else if ((['radio', 'checkbox'].indexOf(elems[i].getAttribute('type')) == -1) || elems[i].checked) {
              value = elems[i].value;
            }

            var name = elems[i].name;
            if (name && (value != null)) {
              // TODO: currently only supports foo[] and foo[bar]. make recursive so nested works.
              if (name.substring(name.length - 2) == '[]') {
                name = name.substring(0,name.length - 2);
                if (!serialized_form[name]) serialized_form[name] = [];
                serialized_form[name].push(value);
              } else if (name.indexOf('[') >= 0) {
                var parts = name.split(/[[\]]/);
                if (!serialized_form[parts[0]]) serialized_form[parts[0]] = {};
                serialized_form[parts[0]][parts[1]] = value;
              } else {
                if (elems[i].getAttribute('placeholder') && (value == elems[i].getAttribute('placeholder'))) {
                  serialized_form[name] = '';
                } else {
                  serialized_form[name] = value;
                }
              }
            }
          }
        }

        real_callback(serialized_form);
      }
      options.action = '';
    }
    
    return element('form', options, arguments);
  });

  define('input', function() { 
    var arguments = flatten_to_array(arguments);
    var options = shift_options_from_args(arguments);
    return this[options.type || 'text'](options, arguments);
  });

  define('submit', function() {
    var arguments = flatten_to_array(arguments);
    var options = shift_options_from_args(arguments);
    options.type = 'submit';
    if (!options.value && arguments.length == 1) options.value = arguments.pop();
    return element('input', options, arguments);
  });

  // input types
  for_each(
    'text', 'hidden', 'password', 'checkbox', 'radio', 'search', 'range', 'number',
    function(input_type) {
      define(input_type, function() { 
        var arguments = flatten_to_array(arguments);
        var options = shift_options_from_args(arguments);
        options.type = input_type;

        return element('input', options, arguments);
      });
    }
  );

  // remove a DOM element
  define('remove_element', function(id) {
    var e = document.getElementById(id);
    return (e ? (e.parentNode.removeChild(e) && true) : false);
  });

  // add class to element
  define('add_class', function(e, class_name) {
    if (!e || has_class(e, class_name)) return e;
    var parts = e.className.split(/\s+/);
    parts.push(class_name);
    e.className = parts.join(' ');
    return e;
  });

  // remove class from element
  define('remove_class', function(e, class_name) {
    if (!e || !has_class(e, class_name)) return e;
    e.className = e.className.replace((new RegExp('\s*'+class_name+'\s*')),' ').trim();
    return e;
  });

  // check if element has class
  define('has_class', function(e, class_name) {
    var class_names = e.className.split(/\s+/);
    return class_names.indexOf(class_name) >= 0;
  });

  define('hide', function(element) {
    if (typeof(element) == 'string') element = document.getElementById(element);
    if (element) element.style.display = 'none';
  });

  define('show', function(element) {
    if (typeof(element) == 'string') element = document.getElementById(element);
    if (element) element.style.display = 'block';
  });

  define('is_visible', function(element) {
    if (typeof(element) == 'string') element = document.getElementById(element);
    return element.style.display != 'none';
  });

  define('toggle_visibility', function(element) {
    if (typeof(element) == 'string') element = document.getElementById(element);
    is_visible(element) ? hide(element) : show(element);
  });

  define('inner_html', function(element, html) {
    if (typeof(element) == 'string') element = document.getElementById(element);
    if (element) element.innerHTML = html;
  });

}
scope.routes = [];

with (scope()) {
  // check for new routes on the browser bar every 100ms
  initializer(function() {
    var callback = function() {
      setTimeout(callback, 100);
      var hash = get_route();
      if (hash != scope.current_route) set_route(hash, { skip_updating_browser_bar: true });
    }
    
    // run once all other initializers finish
    setTimeout(callback, 0);
  });
 
  // define a route
  //   route('#', function() {})  or  route({ '#': function(){}, '#a': function(){} })
  define('route', function(path, callback) {
    if (typeof(path) == 'string') {
      scope.routes.push({
        regex: (new RegExp("^" + path.replace(/^#\//,'#').replace(/:[a-z_]+/g, '([^/]*)') + '$')),
        callback: callback,
        context: this
      });
    } else {
      for (var key in path) {
        this.route(key, path[key]);
      }
    }
  });

  // return the current route as a string from browser bar (#/foo becomes #foo)
  define('get_route', function() {
    var r = '#' + ((window.location.href.match(/#\/?(.*)/)||[])[1] || '').split('?')[0];
    return r;
  });

  // return a hash of params for URLS like:   #some/url?param1=foobar
  define('get_params', function() {
    var hash = {};
    var qs = ((window.location.href.match(/#?\/?.*?\?(.*)/)||[])[1] || '');
    var pairs = qs.split('&');
    for (var i=0; i < pairs.length; i++) {
      var target = hash;
      var kv = pairs[i].split('=',2);
      if (kv.length != 2) continue;

      var this_value = unescape(kv[1]);
      if (this_value == 'true') this_value = true;
      else if (this_value == 'false') this_value = false;

      // handle nested hashes and arrays in params
      var key_parts = unescape(kv[0]).split('[');
      for (var j=0; j < key_parts.length; j++) {
        var this_key = key_parts[j].replace(/\]$/,'');
        var next_key = (key_parts.length > j+1) ? key_parts[j+1].replace(/\]$/,'') : null;
        
        // if there's not a next_key set the value... otherwise go a level deeper inception-style
        if (next_key == null) {
          if (this_key == '') target.push(this_value);
          else target[this_key] = this_value;
        } else {
          if (!target[this_key]) target[this_key] = (next_key == '' ? [] : {});
          target = target[this_key];
        }
      }
    }
    return hash;
  });

  define('to_param', function(params) {
    var qs = "";
    for (var k in params) qs += ((qs.length == 0 ? '?' : '&') + k + '=' + params[k]);
    return qs;
  });

  define('set_route', function(path, options) {
    // absolute URL?
    if (!path.match(/^#/)) {
      if (window.location.href.split('#')[0] == path.split('#')[0]) {
        path = '#'+path.split('#',2)[1];
      } else {
        window.location.href = path;
        return;
      }
    }
    
    // strip leading slash (#/foo --> #foo) 
    path = path.replace(/^#\//,'#');
    
    // super hax to fix layout bug
    if (document.getElementById('_content')) {
      document.getElementById('_content').setAttribute('id','content');
    }
    
    if (!options) options = {};

    if (options.params) {
      if (query_string) path = path.split('?')[0];
      path += to_param(options.params);
    }

    if (!options.skip_updating_browser_bar) {
      if (options.replace) {
        window.location.replace(window.location.href.split('#')[0] + path);
      } else {
        window.location.href = window.location.href.split('#')[0] + path;
      }
    }
    scope.current_route = path;

    if (options.reload_page) {
      window.location.reload();
      return;
    }
    
    // register a pageview with google analytics
    if (typeof(_gaq) == 'object') _gaq.push(['_trackPageview', path]);

    // replace path variable with get_route's logic to strip query params
    path = get_route();

    for (var i=0; i < scope.routes.length; i++) {
      var route = scope.routes[i];
      var matches = path.match(route.regex);
      if (matches) {
        // scroll to the top of newly loaded page --- CAB
        window.scrollTo(0, 0);
        
        if (!route.context.run_filters('before')) return;
        route.callback.apply(null, matches.slice(1));
        route.context.run_filters('after');
        return;
      }
    }

    // page not found
    for (var i=0; i < scope.routes.length; i++) {
      var route = scope.routes[i];
      var matches = '#not_found'.match(route.regex);
      if (matches) {
        // scroll to the top of newly loaded page --- CAB
        window.scrollTo(0, 0);
        
        if (!route.context.run_filters('before')) return;
        route.callback.apply(null, matches.slice(1));
        route.context.run_filters('after');
        return;
      }
    }

    // not found and no #not_found route
    alert('404 not found: ' + path);
  });
}with (scope()) {

  define('before_filter', function(name, callback) {
    if (!callback) {
      callback = name;
      name = null;
    }
    if (!this.hasOwnProperty('before_filters')) this.before_filters = [];
    this.before_filters.push({ name: name, callback: callback, context: this });
  });

  define('after_filter', function(name, callback) {
    if (!callback) {
      callback = name;
      name = null;
    }
    if (!this.hasOwnProperty('after_filters')) this.after_filters = [];
    this.after_filters.push({ name: name, callback: callback, context: this });
  });

  define('run_filters', function(name) {
    var filters = [];
    var obj = this;
    var that = this;
    while (obj) {
      // NOTE: IE doesn't like hasOwnProperty... this seems to work though
      //if (obj.hasOwnProperty(name + '_filters')) filters = obj[name + '_filters'].concat(filters);
      if (obj.__proto__ && (obj[name + '_filters'] != obj.__proto__[name + '_filters'])) filters = obj[name + '_filters'].concat(filters);
      obj = obj.__proto__;
    }
  
    for (var i=0; i < filters.length; i++) {
      scope.running_filters = true;
      filters[i].callback.call(that);
      delete scope.running_filters;

      if (scope.filter_performed_action) {
        var tmp_action = scope.filter_performed_action;
        delete scope.filter_performed_action;
        tmp_action.call(filters[i].context);
        return;
      }
    }

    return true;
  });

  // NOTE: doesn't quite work right now that element() calls render()
  // define('capture_action_if_called_when_filtering', function(method_name) {
  //   var that = this;
  //   var real_method = this[method_name];
  //   define(method_name, function() {
  //     var this_args = Array.prototype.slice.call(arguments);
  //     if (scope.running_filters) {
  //       if (scope.filter_performed_action) {
  //         alert('ERROR: double action in filters');
  //         return;
  //       }
  //       scope.filter_performed_action = function() { real_method.apply(that, this_args); };
  //     } else {
  //       real_method.apply(this, this_args);
  //     }
  //   });
  // });
  // 
  // capture_action_if_called_when_filtering('set_route');
  // capture_action_if_called_when_filtering('render');
}with (scope()) {

  define('observe', function(method, callback, old_retval) {
    // add a new array to the stack to track gets
    scope.data_logs.push([]);
    
    // call method and track retval
    var retval = method();

    var keys = scope.data_logs.pop();
    if (keys.length > 0) {
      //console.log("WOAH MAMA WE NEED TO TRACK SOME KEYS", keys);

      // pass retval through the callback and store it
      retval = callback(retval, old_retval);

      scope.data_observers.push({
        keys: keys,          // ['key1', 'key2']
        retval: retval,
        method: method,
        callback: callback
      });
    }

    return retval;
  });

  
  define('set', function(key, value) {
    //console.log("SETTING ", key, value);
    scope.data_hash[key] = value;

    // ghetto but works
    var observers_to_run = [];
    var observers_skipped = [];

    for (var i=0; i < scope.data_observers.length; i++) {
      var observer = scope.data_observers[i];
      if (observer.keys.indexOf(key) != -1) {
        observers_to_run.push(scope.data_observers[i]);
      } else {
        observers_skipped.push(scope.data_observers[i]);
      }
    }

    // put back the ones we're not gonna use
    scope.data_observers = observers_skipped;

    for (var i=0; i < observers_to_run.length; i++) observe(observers_to_run[i].method, observers_to_run[i].callback, observers_to_run[i].retval);

    // explicit for now
    return null;
  });

  // returns the key from data_hash.  if there's currently a scope.data_logs, it appends the key that was used.
  define('get', function(key) {
    var data_log = scope.data_logs[scope.data_logs.length-1];
    if (data_log && data_log.indexOf(key) == -1) data_log.push(key);
    return scope.data_hash[key];
  });
}


with (scope('JSONP')) {

  initializer(function() {
    scope.jsonp_callback_sequence = 0;
    scope.jsonp_callbacks = {};
  });

  // usage: JSONP.get({ url: ..., method: ..., callback: ..., params: ... });
  define('get', function(options) {
    var callback_name = 'callback_' + scope.jsonp_callback_sequence++;

    var url = options.url;

    // default params
    if (!options.params) options.params = {};
    options.params.cache = (new Date().getTime());
    options.params.callback = 'scope.jsonp_callbacks.' + callback_name;
    if (options.method != 'GET') options.params._method = options.method;

    // params to url string
    for (var key in options.params) {
      url += (url.indexOf('?') == -1 ? '?' : '&');
      url += key + '=' + encode_html(options.params[key]||'');
    }

    // TODO: alert if url is too long
    var script = document.createElement("script");        
    script.async = true;
    script.type = 'text/javascript';
    script.src = url;

    scope.jsonp_callbacks[callback_name] = function(response) {
      delete scope.jsonp_callbacks[callback_name];
      var head = document.getElementsByTagName('head')[0];
      head.removeChild(script);
      options.callback.call(null,response);
    };

    var head = document.getElementsByTagName('head')[0];
    head.appendChild(script);
  });
  
}
with (scope('StorageBase')) {
  define('namespaced', function(name) {
    return Storage.namespace ? Storage.namespace + '_' + name : name;
  });

  // remove the namespace from a key name
  define('strip_namespace', function(name) {
    if (!Storage.namespace) return name;
    return name.replace(new RegExp(Storage.namespace+'_'), '');
  });
}

with (scope('Cookies', 'StorageBase')) {
  define('get', function(name) {
    var ca = document.cookie.split(';');
    for (var i=0; i < ca.length; i++) {
      while (ca[i].charAt(0)==' ') ca[i] = ca[i].substring(1,ca[i].length);
      if (ca[i].length > 0) {
        var kv = ca[i].split('=');
        if (kv[0] == namespaced(name)) return decodeURIComponent(kv[1]);
      }
    }
  });

  define('set', function(name, value, options) {
    options = options || {};
    var cookie = (value ? namespaced(name)+"="+encodeURIComponent(value)+"; path=/;" : namespaced(name)+"=; path=/;");
    if (options.expires_at) cookie += "expires="+options.expires_at.toGMTString();
    document.cookie = cookie;
  });

  define('remove', function(name) {
    var before_remove = get(name);
    if (before_remove) {
      document.cookie=namespaced(name)+"="+";path="+";expires=Thu, 01 Jan 1970 00:00:01 GMT";
      return before_remove;
    }
  });

  define('clear', function(options) {
    options = options || {};
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
      var name = ca[i].split('=')[0].replace(/\s+/,'');
      if (!((options.except||[]).map(namespaced).indexOf(name) >= 0)) remove(strip_namespace(name));
    }
  });
}

with (scope('Local', 'StorageBase')) {
  define('get', function(name) {
    return window.localStorage.getItem(namespaced(name));
  });

  define('set', function(name, value) {
    window.localStorage.setItem(namespaced(name), value);
  });

  define('remove', function(name) {
    var before_remove = get(name);
    if (before_remove) {
      window.localStorage.removeItem(namespaced(name));
      return before_remove;
    }
  });

  define('clear', function(options) {
    options = options || {};
    for (var attr in window.localStorage) {
      if (!((options.except||[]).map(namespaced).indexOf(attr) >= 0)) remove(strip_namespace(attr));
    }
  });
}

scope('Storage', (document.location.protocol == 'file:' || /\.dev$/.test(document.domain)) ? 'Local' : 'Cookies');
