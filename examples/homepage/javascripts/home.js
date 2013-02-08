with (scope('Home')) {

  define('latest_scope_js', { version: '0.0.1', size: '17.7kb' });

  define('default_layout', function(content) {
    return div(
      div({ 'class': 'fork-me' },
        a({ href: "https://github.com/bountysource/scope.js" },
          img({ src: "https://s3.amazonaws.com/github/ribbons/forkme_right_red_aa0000.png", alt: "Fork me on GitHub" })
        )
      ),

      div({ 'class': 'container-narrow' },
        div({ 'class': 'masthead' },
          ul({ 'class': 'nav nav-pills pull-right' },
            li({ 'class': (get_route() == '#' && 'active') }, a({ href: '#' }, 'Home')),
            li({ 'class': (get_route() == '#overview' && 'active') }, a({ href: '#overview' }, 'Overview'))
          ),
          h2({ 'class': 'muted' }, 'scope.js')
        ),

        hr(),

        content,

        hr(),

        div({ 'class': 'footer' },
          p('© BountySource Inc. ', (new Date()).getFullYear())
        )
      )
    );
  });

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
          h4('But why?'),
          p(
            'Although the "with" statement has a bad reputation, it alters how variables are resolved... in a good way. ',
            a({ style: 'margin-left: 15px', href: '#overview' }, 'Read More')
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

  route('#overview', function() {
    render(
      h1('Oh hai')
    );
  });

}
