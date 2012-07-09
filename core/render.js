with (scope()) {
  define('render', function() {
    var arguments = flatten_to_array(arguments);
    var options = shift_options_from_args(arguments);

    options.layout = typeof(options.layout) == 'undefined' ? ((options.target||options.into) ? false : this.default_layout) : options.layout;
    options.target =  options.target || options.into || document.body;
    if (typeof(options.target) == 'string') options.target = document.getElementById(options.target);
    if (options.layout) {
      var layout_elements = options.layout(arguments);
      if (!layout_elements.push) layout_elements = [layout_elements];
      if (layout_elements[0].parentNode != options.target) {
        options.target.innerHTML = '';
        for (var i=0; i < layout_elements.length; i++) options.target.appendChild(layout_elements[i]);
      }
    } else {
      options.target.innerHTML = '';
      for (var i=0; i < arguments.length; i++) {
        options.target.appendChild(typeof(arguments[i]) == 'string' ? document.createTextNode(arguments[i]) : arguments[i]);
      }
    }
  });
  
  define('layout', function(name, callback) {
    var layout_elem, yield_parent;
    define(name, function() {
      if (!layout_elem) {
        var tmp_div = div();
        layout_elem = callback(tmp_div);
        yield_parent = tmp_div.parentNode;
      }
      
      render({ into: yield_parent, layout: false }, arguments);
      return layout_elem;
    });
  });
  
  // // this might actually be problematic.. commenting out as it isn't used --- CAB
  // define('reset_layout', function(name) {
  //   if (this[name].layout_elem) {
  //     if (this[name].layout_elem.parentNode) this[name].layout_elem.parentNode.removeChild(this[name].layout_elem);
  //     this[name].layout_elem = null;
  //     this[name].yield_parent = null;
  //   }
  // });

}
