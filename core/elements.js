with (scope()) {
  define('element', function() {
    // first argument is element type (div, span, etc)
    var arguments = flatten_to_array(arguments);
    var tag = arguments.shift();
    var element = document.createElement(tag);
    var options = shift_options_from_args(arguments);

    // Fix bug for IE7: when create dynamically a radio button group/checkbox, we cannot set attributes: name, checked, etc.
    if ((tag == 'input') && (options.type == 'radio' || options.type == 'checkbox') && (/MSIE (\d+\.\d+);/.test(navigator.userAgent) && (new Number(RegExp.$1) == 7))) {
      element = document.createElement("<input type='" + options.type + "' " + (options['name'] ? "name='" + options['name'] + "'" : "") + (options['checked'] != null ? "CHECKED":" ") + "/>");
    }

    // DEPRECATED... events: { click: asd, mousedown: fds }
    if (options.events) {
      var events = options.events;
      delete options.events;
      for (var k in events) {
        options['on' + k] = events[k];
      }
    }

    // special case to set type first for IE because it changes things after type is set
    if ((tag == 'input') && (options.type == 'submit')) element.setAttribute('type', options.type);

    // process attributes
    for (var k in options) {
      if (k.indexOf('on') == 0) {
        var callback = (function(cb) { return function() { cb.apply(element, Array.prototype.slice.call(arguments)); } })(options[k]);
        if (element.addEventListener) {
          element.addEventListener(k.substring(2).toLowerCase(), callback, false);
        } else {
          element.attachEvent(k.toLowerCase(), callback);
        }
      } else if (k == 'class') {
        element.className = options['class'];
      } else if (k == 'style') {
        element.style.cssText = options.style;
      } else if (k == 'placeholder') {
        //add spaces to the end of placeholder so the serialized_form-hack doesn't match
        element.setAttribute(k, options[k] + '          ');
      } else if ((tag == 'input') && (options.type == 'submit') && (k == 'type')) {
        // special case for IE... we already set type above
      } else {
        element.setAttribute(k, options[k]);
      }
    }
    
    // append child elements
    for (var i=0; i <= arguments.length; i++) {
      if (typeof(arguments[i]) == 'object') {
        element.appendChild(arguments[i]);
      } else if (arguments[i]) {
        element.appendChild(document.createTextNode(arguments[i]));
      }
    }

    return element;
  });

  // simple elements
  for_each(
    'script', 'meta', 'title', 'link', 'script', 'iframe', 
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'div', 'p', 'span', 'pre', 'img', 'br', 'hr', 'i', 'b', 'strong', 'u',
    'ul', 'ol', 'li', 'dl', 'dt', 'dd',
    'table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot',
    'select', 'option', 'optgroup', 'textarea', 'button', 'label', 'fieldset',
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

  // input types
  for_each(
    'text', 'hidden', 'password', 'checkbox', 'radio', 'submit',
    function(input_type) {
      define(input_type, function() { 
        var arguments = flatten_to_array(arguments);
        var options = shift_options_from_args(arguments);
        options.type = input_type;
        if ((input_type == 'submit') && !options.value && arguments.length == 1) options.value = arguments.pop();
        return element('input', options, arguments);
      });
    }
  );

}
