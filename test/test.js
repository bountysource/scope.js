with (scope('Test')) {
  define('test', function(name, callback) {
    initializer(function() {
      try {
        callback();
        document.body.appendChild(div('✔' + name))
      } catch(e) {
        document.body.appendChild(div('✘' + name))
        console.log(e);
      }
    });
  });
  
  define('fail', function(message) {
    var AssertError = function (message) { this.message = message; }
    AssertError.prototype = new Error();
    throw new AssertError(message);
  });
  
  define('assert', function(value, error_message) {
    if (value.call ? !value() : !value) fail(error_message || 'assert failed');
  });

  define('assert_equal', function(val1, val2) {
    assert(val1 == val2, 'assert_equal (' + val1 + ' != ' + val2 + ')');
  });

  define('assert_not_equal', function(val1, val2) {
    assert(val1 != val2, 'assert_not_equal (' + val1 + ' == ' + val2 + ')');
  });

  define('assert_fails', function(callback) {
    try {
      callback();
    } catch (e) {
      return;
    }
    fail('assert_fails did not fail');
  });

}
