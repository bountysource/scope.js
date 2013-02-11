with (scope("App")) {

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

  define('code_block', function() {
    var elem = pre({ 'class': 'prettyprint' }, flatten_to_array(arguments).join("\n"));
    elem.innerHTML = prettyPrintOne(elem.innerHTML);
    return elem;
  });

}