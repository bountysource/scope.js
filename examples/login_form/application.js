with (scope('Application')) {
  layout('the_application_layout', function(yield) {
    return div(
      h1('Awesome Application'),
      div({ style: "background: #eee; border: 1px solid #888; padding: 10px" }, yield),
      p('Copyright 2000')
    );
  });

  define('default_layout', the_application_layout);
}


with (scope('Login', 'Application')) {
  route('#', function() {
    render(the_form());
  });

  define('the_form', function() {
    return div(
      form({ action: process_form },
        h2("Login"),
        text({ name: 'login', placeholder: 'Login' }),
        password({ name: 'password', placeholder: 'Password' }),
        button('Go'),
        ' or ',
        a({ href: '#forgot-password' }, 'forgot password')
      )
    );
  });

  define('process_form', function(data) {
    alert('process login!');
    console.log(data);
  });
}


with (scope('ForgotPassword', 'Application')) {
  route('#forgot-password', function() {
    render(the_form());
  });

  define('the_form', function() {
    return div(
      form({ action: process_form },
        h2('Forgot Password'),
        text({ name: 'email' }),
        button('Go'),
        ' or ',
        a({ href: '#' }, 'Login')
      )
    );
  });

  define('process_form', function(data) {
    alert('process forgot password!');
    console.log(data);
  });
}
