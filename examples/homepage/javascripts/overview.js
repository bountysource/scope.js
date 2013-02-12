with (scope('Overview', 'App')) {

  route('#overview', function() {
    render(
      h2('The "with" statement is not always dangerous.'),
      p("Before jumping into scope.js, it's important to understand how it works and why it's different.  At its core, " +
        "Scope.js relies on the \"with\" statement.  Best-practices currently advises against using \"with\" as " +
        "it can lead to unexpected behavior.  However, if you use \"with\" for referencing rather than assigning, it " +
        "becomes a much safer construct."),

      div({ 'class': 'row-fluid' },
        div({ 'class': 'span6' },
          code_block(
            "// BAD: using \"with\" as a shortcut for assignment",
            "var obj = document.createElement('div');",
            "with (obj.style) {",
            "  color = 'red';",
            "  color2 = 'green';",
            "}",
            " ",
            "// color property set (expected)",
            "obj.style.color == 'red' ",
            " ",
            "// color2 creates a global variable (unexpected)",
            "obj.style.color2 == undefined ",
            "window.color2 == 'green' "
          )
        ),

        div({ 'class': 'span6' },
          code_block(
            "// GOOD: using \"with\" as a shortcut for reference",
            "var scope = {",
            "  log: function(text) { console.log(text); },",
            "  hello_world: 'hello world'",
            "};",
            " ",
            "// outputs \"hello world\" (expected)",
            "with (scope) {",
            "  log(hello_world);",
            "}",
            " ",
            "// ReferenceError: log is not defined (expected)",
            "log(hello_world);"
          )
        )
      ),

      h2('Client-side routes map URLs to callbacks.'),
      code_block(
        "with (scope()) {",
        " ",
        "  // route() runs a callback when the URL fragment changes or a({ href: '#' }, 'a link is clicked')",
        "  route('#', function() {",
        "    render('homepage', a({ href: '#welcome' }, 'welcome page'));",
        "  });",
        " ",
        "  // routes support directories and parameters",
        "  route('#projects/:project_id/tasks/:task_id', function(project_id, task_id) {",
        "    render('project number ' + project_id + ' and task number ' + task_id);",
        "  });",
        " ",
        "  // get_route() returns the current route and set_route() redirects the user",
        "  route('#welcome', function() {",
        "    console.log(get_route());  // outputs '#welcome'",
        "    set_route('#');  // redirects immediately",
        "  });",
        " ",
        "}"
      ),

      h2('DOM elements are easy to create.'),
      p("There are a handful of helpers that creating DOM elements easy.  You can nest elements and pass any number of arguments.  You can optionally pass a hash containing key/values for attributes."),
      code_block(
        "with (scope()) {",
        "  route('#', function() {",
        " ",
        "    render(",
        "      'plain text strings',",
        "      h1('Headers'),",
        "      h2({ style: 'color: red' }, 'Headers with attributes'),",
        "      div(",
        "        a({ href: 'http://www.google.com/' }, 'Links'),",
        "        p('paragraph text')",
        "      ),",
        "      ul(",
        "        li('lists'),",
        "        li(a({ href: '#' }, 'links')",
        "      ),",
        "      table(",
        "        tr(th('col1'), th('col2')),",
        "        tr(td({ colSpan: 2 }, 'rows'))",
        "      ),",
        "      ['arrays', b('of'), i('elements')]",
        "    );",
        " ",
        "  }",
        "}"
      ),

      h2('Render DOM elements into the page.'),
      code_block(
        "with (scope()) {",
        "  route('#', function() {",
        "    // render defaults to document.body as the target",
        "    var target_div = div('Loading...');",
        "    render(h1('Welcome!'), target_div);",
        " ",
        "    // into: lets you specify a target and update specific elements",
        "    setTimeout(function() {",
        "      render({ into: target_div }, 'Okay, everything is loaded!');",
        "    }, 1000);",
        "  });",
        "}"
      ),

      h2('Use "define" to create helper functions.'),
      code_block(
        "with (scope()) {",
        " ",
        "  route('#', function() {",
        "    render(",
        "      h1('Welcome!'),",
        "      full_name('John', 'Doe')",
        "    );",
        "  });",
        " ",
        "  define('full_name', function(first_name, last_name) {",
        "    return div(",
        "      span({ 'class': 'first' }, first_name),",
        "      span({ 'class': 'last' }, last_name)",
        "    );",
        "  });",
        " ",
        "}"
      ),

      h2('Form elements are serialized automatically.'),
      code_block(
        "with (scope()) {",
        " ",
        "  route('#', function() {",
        "    render(",
        "      form({ method: process_login },",
        "        'Email:', text({ name: 'email', placeholder: 'john@doe.com' }),",
        "        'Password:', password({ name: 'password', placeholder: 'abcd1234' }),",
        "        submit('Login')",
        "      )",
        "    );",
        "  });",
        " ",
        "  // form fields are automatically serialized and passed in as a hash",
        "  define('process_login', function(form_data) {",
        "    if ((form_data.email == 'jane@smith.com') && (form_data.password == 'secret')) {",
        "      set_route('#top-secret');",
        "    } else {",
        "      set_route('#go-away');",
        "    }",
        "  })",
        " ",
        "}"
      ),

      h2('Namespace each scope to prevent overlap.'),
      code_block(
        "// defines 'foo' in the global scope from which everything inherits",
        "with (scope()) {",
        "  define('foo', 'this is in the global scope');",
        "}",
        " ",
        "// this creates a new scope called 'App' which inherits everything in the global scope",
        "with (scope('App')) {",
        "  define('bar', 'this only exists in App');",
        "}",
        " ",
        "// this creates a new scope called 'Zapp' which inherits everything from App and the global scope",
        "with (scope('Zapp', 'App')) {",
        "  define('boz', 'this only exists in Zapp');",
        "}",
        " ",
        "with (scope()) {",
        "  // 'foo' from global scope works everywhere",
        "  console.log(foo);",
        "  console.log(App.foo);",
        "  console.log(Zapp.foo);",
        " ",
        "  // you must use full namespace to access .bar outside of App namespace",
        "  console.log(bar);  // ReferenceError: bar is not defined",
        "  console.log(App.bar); // works as expected",
        " ",
        "  // Zapp",
        "  console.log(Zapp.bar);  // inherited from App.bar",
        "  console.log(Zapp.boz);  // works as expected",
        " ",
        "}"
      ),

      h2('Update DOM automatically when data changes.'),
      code_block(
        "with (scope()) {",
        "  // because of 'get', this function will re-evaluate whenever set('display_name', '...') is called",
        "  define('live_display_name', function() {",
        "    return div(get('display_name') || 'Not logged in');",
        "  });",
        " ",
        "  route('#', function() {",
        "    // this renders 'Not logged in' since get('display_name') returns null",
        "    render(",
        "      h1('Welcome'),",
        "      live_display_name  // function reference",
        "    );",
        "    ",
        "    // when we use 'set', any function that used 'get' on this key will be re-evaluated",
        "    set('display_name', 'John Doe');",
        "    ",
        "  });",
        "}"
      ),

      h2('User initializers instead of window.onLoad'),
      code_block(
        "with (scope()) {",
        "  ",
        "  initializer(function() {",
        "    set('user_data', {});",
        "  });",
        "  ",
        "}"
      ),

      h2('Events invoke callbacks.'),
      code_block(
        "with (scope()) {",
        "  ",
        "  route('#', function() {",
        "    render(",
        "      h1('Welcome!'),",
        "      div({ onClick: div_clicked }, 'Click Me!'),",
        "    );",
        "  });",
        "  ",
        "  define('div_clicked', function(elem) {",
        "    set_route('#welcome');",
        "  });",
        "  ",
        "}"
      ),

      h2('Curry gives you a reference to a function.'),
      code_block(
        "with (scope()) {",
        "  // these two are equivalent",
        "  setTimeout(function() { set('display_name', 'John Doe'); }, 1000);",
        "  setTimeout(curry(set, 'display_name', 'John Doe'), 1000);",
        " ",
        "  // with partial parameters",
        "  var set_display_name = curry(set, 'display_name');",
        "  set_display_name('john doe')",
        "}"
      )
//
//      h2('Extras'),
//      p("Escape 'class'. Util functions (flatten_to_array, for_each, hide/show, etc). Not_found route.  scope.instance.____ for debugging"),
//
//      h2('Before/after filters'),
//      p('Coming soon.')
    );

  });

}