with (scope('Home', 'App')) {

  define('latest_scope_js', { version: '0.0.1', size: '17.7kb' });

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
        div({ 'class': 'span6' },
          h4("But why?"),
          p(
            'Although the "with" statement has a bad reputation, it alters how variables are resolved... in a good way. ',
            a({ style: 'margin-left: 15px', href: '#overview' }, 'Read Overview')
          ),

          h4('Who uses it?'),
          p(
            div(a({ href: 'https://github.com/bountysource/frontend' }, 'BountySource'), ': The funding platform for open-source software.'),
            div(a({ href: 'https://github.com/bountysource/frontend' }, 'Badger'), ': A better registrar with domains for $10 a year.')
          )
        ),

        div({ 'class': 'span6' },
          h4("TodoMVC?"),
          p(
            "What would a javascript framework be without the obligatory TodoMVC implementation? ",
            a({ style: 'margin-left: 15px', href: 'examples/todomvc/' }, 'See Demo'),
            a({ style: 'margin-left: 15px', href: 'examples/todomvc/js/app.js' }, 'View Source')
          ),

          h4('What about tests?'),
          p(
            "The scope.js test suite is built using scope.js. It's pretty basic but it gets the job done.",
            a({ style: 'margin-left: 15px', href: 'examples/test_suite/' }, 'Run Test Suite')
          )
        )
      )
    );
  });

}
