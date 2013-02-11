with (scope('Overview', 'App')) {

  route('#overview', function() {
    render(
      h2('The bad and the good of the "with" statement.'),
      p("Before jumping into scope.js, it's important to understand how it works and why it's different.  At its core, Scope.js relies on the \"with\" statement.  However best-practices currently advises against using \"with\" as it can lead to unexpected behavior.  For example:"),

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
      ),

      p('However, if you use \"with\" for referencing rather than assigning, it becomes a much safer construct.  You can use it to construct domain specific languages that greatly reduce the amount of code you have to write.  For example:'),

      code_block(
        "var scope = {",
        "  log: function(text) { console.log(text); },",
        "  hello_world: 'hello world'",
        "};",
        " ",
        "// GOOD: using \"with\" as a shortcut for reference. (e.g. \"log\" and \"hello_world\")",
        "with (scope) {",
        "  log(hello_world);  // outputs \"hello world\"",
        "}",
        " ",
        "// outside the scope, \"log\" and \"hello_world\" are undefined",
        "hello_world;       // ReferenceError: hello_world is not defined",
        "log(hello_world);  // ReferenceError: log is not defined"
      ),
      p("This is the core concept behind scope.js."),


      h2('Creating DOM elements.'),
      p("There are a handful of helpers that creating DOM elements easy.  You can nest elements and pass any number of arguments.  You can optionally pass a hash containing key/values for attributes."),
      code_block(
        "with (scope()) {",
        "  render(",
        "    'plain text strings',",
        "    h1('Headers'),",
        "    h2({ style: 'color: red' }, 'Headers with attributes'),",
        "    div(",
        "      a({ href: 'http://www.google.com/' }, 'Links'),",
        "      p('paragraph text')",
        "    ),",
        "    ['arrays', b('of'), i('elements')]",
        "  );",
        "}"
      ),

      h2('Rendering'),
      p('Coming soon.'),

      h2('How "define" creates helpers'),
      p('Coming soon.'),

      h2('Routing'),
      p('Coming soon.'),

      h2('Namespaces'),
      p('Coming soon.'),

      h2('Events'),
      p('Coming soon.'),

      h2('Updating the DOM when data changes.'),
      p('Coming soon.'),

      h2('Initializers'),
      p('Coming soon.'),

      h2('Before/after filters'),
      p('Coming soon.')
    );
  });

}