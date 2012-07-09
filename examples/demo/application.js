with (scope('Demo')) {

  route('#', function() {
    render(
      h1('scope.js demo'),
      p("Welcome!"),
      ul(
        li(a({ href: '#page1' }, 'Page 1')),
        li(a({ href: '#page2' }, 'Page 2'))
      )
    );
  });

  route('#page1', function() {
    render(
      div('First page! ', a({ href: '#' }, 'Go back to home page.'))
    );
  });

  route('#page2', function() {
    render(
      div('Second page! ', a({ href: '#' }, 'Go back to home page.'))
    );
  });

}