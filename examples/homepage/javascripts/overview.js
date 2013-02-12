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

      h2('Client-Side-Routing with route, set_route and get_route.'),
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

      h2('Creating DOM elements.'),
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

      h2('Rendering and Layouts'),
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

      h2('Creating helper functions with "define"'),
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

      h2('Form Processing'),
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

      h2('Namespaces'),
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
        "  ",
        "  // you must use full namespace to access .bar outside of App namespace",
        "  console.log(bar);  // ReferenceError: bar is not defined",
        "  console.log(App.bar); // works as expected",
        " ",
        "  // Zapp.boz works as execpted",
        "  console.log(Zapp.bar);  // inherited from App.bar",
        "  console.log(Zapp.boz);  // works as expected",
        " ",
        "}"
      ),

      h2('Events'),
      p('Coming soon.'),

      h2('Updating the DOM when data changes.'),
      p('Coming soon.'),

      h2('Initializers'),
      p('Coming soon.'),

//      h2('Curry'),
//      code_block(
//        "with (scope()) {",
//        " ",
//        "  define('process_login', function(form_data, param1, param2) {",
//        "    console.log(arguments);"
//    "  });",
//      "  // curry lets you create a reference to a function that you'll use later",
//      "  curry(process"
//    " ",
//      "}"
//    ),

    h2('Before/after filters'),
      p('Coming soon.')
    );
  });

}