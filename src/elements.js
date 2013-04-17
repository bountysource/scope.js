/* jshint -W085 */
/* jshint -W083 */

with (scope()) {

  define('render', function() {
    var args = flatten_to_array(arguments);
    var options = shift_options_from_args(args);

    options.layout = typeof(options.layout) == 'undefined' ? ((options.target||options.into) ? false : this.default_layout) : options.layout;
    options.target =  options.target || options.into || document.body;
    if (typeof(options.target) == 'string') options.target = document.getElementById(options.target);

    if (options.layout) {
      args = options.layout(args);
      if (!args.push) args = [args];
      if (args[0].parentNode == options.target) return;
    }

    if (options.target.innerHTML) options.target.innerHTML = '';
    //while (options.target.firstChild) options.target.removeChild(options.target.firstChild);
    for (var i=0; i <= args.length; i++) {
      var dom_element = args[i];

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
        //console.log("LIVE OBSERVER")

        var key1 = n;
        observe(options[n], function(retval) {
          //console.log("SETTING LIVE OBSERVER", retval, element, key1)
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
    } else if (value !== undefined) {
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
        real_callback();
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
            if (name && (value !== null)) {
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
