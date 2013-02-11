with (scope('Home', 'App')) {

  define('latest_scope_js', { version: '0.4.0', size: '17.7kb' });

  route('#', function() {
    render(
      div({ 'class': 'jumbotron' },
        h1('Bringing back the "with" statement.'),
        p({ 'class': 'lead' },
          "A light-weight no-dependency javascript MVC framework built on top of the \"with\" statement.",
          br(),
          "It provides DOM generation, client-side routing, event-based DOM and more."
        ),
        a({ 'class': 'btn btn-large btn-success', href: 'releases/scope-'+latest_scope_js.version+'.compressed.js' }, 'Download: ' + latest_scope_js.version),
        div(
          "Size: ", strong(latest_scope_js.size), " (minified)"
        )
      ),

      hr(),

      div({ 'class': 'row-fluid marketing' },
        div({ 'class': 'span4' },
          h4("Why use the \"with\" statement?"),
          p(
            'If used correctly, compelling syntaxes can be created that vastly reduce the amount of javascript needed.',
            a({ style: 'margin-left: 15px', href: '#overview' }, 'Read Overview')
          ),

          h4('Who uses it?'),
          p(
            div({ style: 'margin-bottom: 10px' }, a({ href: 'https://github.com/bountysource/frontend' }, 'BountySource'), ': The funding platform for open-source software.'),
            div(a({ href: 'https://github.com/bountysource/frontend' }, 'Badger'), ': A better registrar with domains for $10 a year.')
          ),

          h4("TodoMVC?"),
          p(
            "What's an MVC framework without a TodoMVC example?",
            a({ style: 'margin-left: 15px', href: 'examples/todomvc/' }, 'See Demo'),
            a({ style: 'margin-left: 15px', href: 'examples/todomvc/js/app.js' }, 'View Source')
          ),

          h4('What about tests?'),
          p(
            "The scope.js test suite is pretty basic but it's better than nothing'.",
            a({ style: 'margin-left: 15px', href: 'examples/test_suite/' }, 'Run Test Suite')
          ),

          h4("What's next?"),
          p(
            "The model layer needs a lot of work.  The code needs substantially more test coverage.  Cross-browser compatibility needs improvements."
          )
        ),

        div({ 'class': 'span8' },
          h4("What's it look like?"),

          a({ href: 'examples/homepage/example1.html', style: 'float: right; margin: 10px', 'class': 'btn btn-success btn-small' }, "Run This Example"),

          code_block(
            "<!doctype html>",
            "<html>",
            "<head>",
            "  <script src=\"scope.js\"></script>",
            "  <script>",
            " ",
            "    with (scope()) {",
            " ",
            "      route('#', function() {",
            "        render(",
            "          div(",
            "            h1({ style: \"color: red\" }, \"Hello World\"),",
            "            p(\"Hello and \", a({ href: \"#welcome\" }, \"welcome!\"))",
            "          )",
            "        );",
            "      });",
            " ",
            "      route('#welcome', function() {",
            "        render(",
            "          p(\"It's me, scope.js! \", a({ href: \"#\" }, \"Home!\"))",
            "        );",
            "      });",
            " ",
            "    }",
            " ",
            "  </script>",
            "</head>",
            "<body></body>",
            "</html>"
          )
        )

      )
    );
  });

}
