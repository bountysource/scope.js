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
if (!window.console) window.console = { log: function() {} };;with (scope()) {
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
    var args = [];
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
          args.push(obj);
        }
      }
    }
    return args;
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
    return decodeURIComponent(encoded_html);
  });

  // merge one hash into another. non-destructive. values in b will overwrite those in a.
  define('merge', function(a, b) {
    var new_hash = {};
    for (var k in a) new_hash[k] = a[k];
    for (var j in b) new_hash[j] = b[j];
    return new_hash;
  });
}
;with (scope()) {
  scope.__initializers = [];

  define('initializer', function(callback) {
    scope.__initializers.push(callback);
  });
  
  // setup browser hook
  window.onload = function() {
    for (var i=0; i < scope.__initializers.length; i++) scope.__initializers[i]();
    delete scope.__initializers;
  };
};/* jshint -W083 */

with (scope()) {

  define('render', function() {
    var args = flatten_to_array(arguments);
    var options = shift_options_from_args(args);

    // layout explicitly passed in but not found
    if (options.layout && !scope.state.layouts[options.layout]) throw new Error("Layout not found: " + options.layout);

    // default layout unless 'into" was passed in
    if ((options.layout !== false) && !options.into && scope.state.layouts['default']) options.layout = 'default';

    // allow { into: 'dom-id-name' }
    if (!options.into) options.into = document.body;
    if (typeof(options.into) == 'string') options.into = document.getElementById(options.into);

    // if layout exists, use it
    if (scope.state.layouts[options.layout]) {
      if (!scope.state.layouts[options.layout].root_element) {
        var outer_div = div();
        var inner_div = div();
        render({ into: outer_div }, curry(scope.state.layouts[options.layout].callback, inner_div));
        if (outer_div.childNodes.length != 1) throw new Error("Expected a single element returned from layout: " + layout.name);
        scope.state.layouts[options.layout].root_element = outer_div.firstChild;

        if ((inner_div.parentNode.childNodes.length != 1) || inner_div.parentNode.childNodes[0] != inner_div) throw new Error("Expected layout to render arguments in an element with no siblings (i.e. div(arguments) ): " + layout.name);
        scope.state.layouts[options.layout].target_element = inner_div.parentNode;
      }

      // render layout into DOM (or target)
      if (scope.state.layouts[options.layout].root_element.parentNode != options.into) {
        render({ into: options.into }, scope.state.layouts[options.layout].root_element);
      }

      // set new target to be inner element of layout
      options.into = scope.state.layouts[options.layout].target_element;
    }


    // delete all children of target (innerHTML seems to be fastest way)
    if (options.into.innerHTML) options.into.innerHTML = '';
    //while (options.into.firstChild) options.into.removeChild(options.into.firstChild);

    for (var i=0; i <= args.length; i++) {
      var dom_element = args[i];

      // if it's a function, run it with observers
      if (typeof(dom_element) == 'function') {
        // console.log("running function")
        dom_element = observe(dom_element, function(retval, old_retval) {
          //console.log("INSIDE ELEMENT OBSERVER", retval, old_retval);
          
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
      if (dom_element) options.into.appendChild(dom_element);
    }
  });
  
  define('layout', function(name, callback) {
    scope.state.layouts[name] = { name: name, callback: callback };
  });

  // options processing order:
  //   type
  //   events/on*
  //   style
  //   class
  //   attribute
  define('element', function() {
    var args = flatten_to_array(arguments);
    var tag = args.shift();
    var options = shift_options_from_args(args);

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
    for (var m in options) {
      if (m.indexOf('on') === 0) {
        var callback = (function(cb) { return function() { cb.apply(element, Array.prototype.slice.call(arguments)); }; })(options[m]);
        if (element.addEventListener) {
          element.addEventListener(m.substring(2).toLowerCase(), callback, false);
        } else {
          element.attachEvent(m.toLowerCase(), callback);
        }
        delete options[m];
      }
    }

    // run through rest of the attributes
    for (var n in options) {
      if (typeof(options[n]) == 'function') {
        var key1 = n;
        observe(options[n], function(retval) {
          set_attribute(element, key1, retval);
        });
      } else {
        set_attribute(element, n, options[n]);
      }
    }
    
    // append child elements
    if (args.length > 0) render({ into: element }, args);

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
    } else if ((value === undefined) || (value === null)) {
      // skipping null/undefined
    } else if (typeof(value) == 'object') {
      throw new Error("Not expecting object attribute: " + key);
    } else {
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
    'option', 'optgroup', 'textarea', 'button', 'label', 'fieldset',
    'header', 'section', 'footer',
    function(tag) { 
      define(tag, function() { return element(tag, arguments); });
    }
  );
  
  define('a', function() { 
    var args = flatten_to_array(arguments);
    var options = shift_options_from_args(args);
    
    if (options.href && options.href.call) {
      var real_callback = options.href;
      options.href = '';
      options.onClick = function(e) {
        stop_event(e);
        real_callback.call(e.target);
      };
    }
//    else if (options.href && options.href.indexOf('#') == 0) {
//      // creating a new function for each link is expensive, so create once and save
//      if (!this.a.click_handler) this.a.click_handler = function(e) {
//        // skip optimization if a key is pressed or it was a middle click
//        if (!(e.metaKey || e.ctrlKey || e.altKey || e.shiftKey || (e.which == 2))) {
//          stop_event(e);
//          set_route('#' + this.href.split('#')[1]);
//        }
//      };
//      options.onClick = this.a.click_handler;
//    }

    return element('a', options, args);
  });
  
  define('img', function() { 
    var args = flatten_to_array(arguments);
    var options = shift_options_from_args(args);
    
    if (!options.src && (args.length == 1)) options.src = args.pop();
    
    return element('img', options, args);
  });
  
  
  define('form', function() {
    var args = flatten_to_array(arguments);
    var options = shift_options_from_args(args);
    
    if (options.action && options.action.call) {
      var real_callback = options.action;
      options.onSubmit = function(e) {
        stop_event(e);
        real_callback(form_to_json(this));
      };
      options.action = '';
    }
    
    return element('form', options, args);
  });

  define('input', function() { 
    var args = flatten_to_array(arguments);
    var options = shift_options_from_args(args);
    return this[options.type || 'text'](options, args);
  });

  // input types
  for_each(
    'text', 'hidden', 'password', 'checkbox', 'radio', 'search', 'range', 'number', 'reset', 'submit', 'url', 'email',
    function(input_type) {
      define(input_type, function() { 
        var args = flatten_to_array(arguments);
        var options = shift_options_from_args(args);
        options.type = input_type;
        if (input_type == 'submit' || input_type == 'reset')
          if (!options.value && args.length == 1)
            options.value = args.pop();
        return element('input', options, args);
      });
    }
  );


  define('form_to_json', function(form) {
    var serialized_form = {};

    var elems = form.getElementsByTagName('*');
    for (var i=0; i < elems.length; i++) {
      if ((elems[i].tagName != 'FORM') && elems[i].name) {
        var value = null;
        if (elems[i].getAttribute('placeholder') && (value == elems[i].getAttribute('placeholder'))) {
          value = '';
        } else if (elems[i].tagName == 'SELECT') {
          // TODO: support multiple select
          value = elems[i].options[elems[i].selectedIndex].value;
        } else if ((['radio', 'checkbox'].indexOf(elems[i].getAttribute('type')) == -1) || elems[i].checked) {
          value = elems[i].value;
        }

        var target = serialized_form;
        var name_stack = elems[i].name.split('[');
        for (var j=0; j < name_stack.length; j++) {
          var this_key = name_stack[j].replace(/\]$/,'');
          var next_key = name_stack[j+1] && name_stack[j+1].replace(/\]$/,'');

          if (next_key === undefined) {
            target[this_key] = value;
          } else if (next_key === '') {
            if (!target[this_key]) target[this_key] = [];
            target[this_key].push(value);
            break;
          } else {
            if (!target[this_key]) target[this_key] = {};
            target = target[this_key];
          }
        }
      }
    }

    return serialized_form;
  });


  define('hash_to_query_string', function(hash, prefix) {
    var parts = '';

    // params to url string
    for (var key in hash) {
      var prefixed_key = prefix ? prefix + '['+key+']' : key;
      if ((hash[key] === undefined) || (hash[key] === null) || (hash[key] === false)) {
        parts += '&'+prefixed_key+'=';
      } else if ((typeof(hash[key]) == 'object') && hash[key].pop) {
        // array
        for (var i=0; i < hash[key].length; i++) parts += '&'+prefixed_key+'[]=' + encode_html(hash[key][i]);
      } else if (typeof(hash[key]) == 'object') {
        // hash
        parts += '&' + hash_to_query_string(hash[key], prefixed_key);
      } else {
        parts += '&'+prefixed_key+'=' + encode_html(hash[key]);
      }
    }

    return parts.replace(/^&/,'');
  });

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
    e.className = e.className.replace((new RegExp('\\s*'+class_name+'\\s*')),' ').trim();
    return e;
  });

  // check if element has class
  define('has_class', function(e, class_name) {
    var class_names = e.className.split(/\s+/);
    return class_names.indexOf(class_name) >= 0;
  });

  define('toggle_class', function(e, class_name) {
    if (has_class(e, class_name)) remove_class(e, class_name);
    else add_class(e, class_name);
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
    (is_visible(element) ? hide : show)(element);
  });

  define('inner_html', function(element, html) {
    if (typeof(element) == 'string') element = document.getElementById(element);
    if (element) element.innerHTML = html;
  });

  define('in_dom', function(element) {
    if (element.parentNode === null) return false;
    else if (element.parentNode == document.body) return true;
    else return in_dom(element);
  });

}
;/* jshint -W103 */

with (scope()) {

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
};with (scope('JSONP')) {

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

    url += (url.indexOf('?') == -1 ? '?' : '&') + hash_to_query_string(options.params);

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
;with (scope()) {

  define('observe', function(method, callback, old_retval) {
    // add a new array to the stack to track gets
    scope.state.data_logs.push([]);
    
    // call method and track retval
    var retval = method();

    // run actual callback with retval
    callback(retval, old_retval);

    var keys = scope.state.data_logs.pop();
    if (keys.length > 0) {
      scope.state.data_observers.push({
        keys: keys,          // ['key1', 'key2']
        retval: retval,
        method: method,
        callback: callback
      });
    }

    return retval;
  });

  
  define('set', function(key, value) {
    console.log("SETTING ", key, value);
    scope.state.data_hash[key] = value;

    // ghetto but works
    var observers_to_run = [];
    var observers_skipped = [];

    for (var i=0; i < scope.state.data_observers.length; i++) {
      var observer = scope.state.data_observers[i];
      console.log(observer, key, observer.keys.indexOf(key));
      if (observer.keys.indexOf(key) != -1) {
        console.log('running');
        observers_to_run.push(scope.state.data_observers[i]);
      } else {
        console.log('skipping');
        observers_skipped.push(scope.state.data_observers[i]);
      }
    }
    console.log(observers_to_run, observers_skipped);
    // put back the ones we're not gonna use
    scope.state.data_observers = observers_skipped;

    for (var j=0; j < observers_to_run.length; j++) observe(observers_to_run[j].method, observers_to_run[j].callback, observers_to_run[j].retval);

    // explicit for now
    return null;
  });

  // returns the key from data_hash.  if there's currently a scope.state.data_logs, it appends the key that was used.
  define('get', function(key) {
    var data_log = scope.state.data_logs[scope.state.data_logs.length-1];
    console.log('logging get', key);
    if (data_log && data_log.indexOf(key) == -1) data_log.push(key);
    return scope.state.data_hash[key];
  });
}


;with (scope()) {
  // check for new routes on the browser bar every 100ms
  initializer(function() {
    var callback = function() {
      setTimeout(callback, 100);
      var hash = get_route();
      if (hash != scope.current_route) set_route(hash, { skip_updating_browser_bar: true });
    };
    
    // run once all other initializers finish
    if (scope.state.routes.length > 0) setTimeout(callback, 0);
  });
 
  // define a route
  //   route('#', function() {})  or  route({ '#': function(){}, '#a': function(){} })
  define('route', function(path, callback) {
    if (typeof(path) == 'string') {
      scope.state.routes.push({
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
        if (next_key === null) {
          if (this_key === '') target.push(this_value);
          else target[this_key] = this_value;
        } else {
          if (!target[this_key]) target[this_key] = (next_key === '' ? [] : {});
          target = target[this_key];
        }
      }
    }
    return hash;
  });

  define('to_param', function(params) {
    var qs = "";
    for (var k in params) qs += ((qs.length === 0 ? '?' : '&') + k + '=' + params[k]);
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

    // set root level params hash
    scope.instance.params = get_params();

    // try setting the actual route
    if (run_route(path)) return;

    // if that didn't work, register not_found with google analytics and move on to #not_found
    if (typeof(_gaq) == 'object') _gaq.push(['_trackPageview', '#not_found?path=' + encodeURIComponent(path)]);
    if (run_route('#not_found')) return;

    // lastly, if that didn't work, show an alert
    alert('Page not found: ' + path);
  });

  // scans routes for exact path match and runs before/after filters (no params processing)
  define('run_route', function(path) {
    for (var i=0; i < scope.state.routes.length; i++) {
      var route = scope.state.routes[i];
      var matches = path.match(route.regex);
      if (matches) {
        // scroll to the top of newly loaded page --- CAB
        window.scrollTo(0, 0);

        if (!route.context.run_filters('before')) return;
        route.callback.apply(null, matches.slice(1));
        route.context.run_filters('after');
        return true;
      }
    }
  });
};with (scope('StorageBase')) {
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
      if ((options.except||[]).map(namespaced).indexOf(name) == -1) remove(strip_namespace(name));
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
      if ((options.except||[]).map(namespaced).indexOf(attr) == -1) remove(strip_namespace(attr));
    }
  });
}

scope('Storage', (document.location.protocol == 'file:' || /\.dev$/.test(document.domain)) ? 'Local' : 'Cookies');
