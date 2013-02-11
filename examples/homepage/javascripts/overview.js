with (scope('Overview', 'App')) {

  route('#overview', function() {
    render(
      h2('The bad and the good of the "with" statement.'),
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
        "    ul(",
        "      li('lists'),",
        "      li(a({ href: '#' }, 'links')",
        "    ),",
        "    table(",
        "      tr(",
        "        th('col1'),",
        "        th('col2')",
        "      ),",
        "      tr(",
        "        td({ colSpan: 2 }, 'rows')",
        "      ),",
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