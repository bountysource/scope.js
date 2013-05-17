with (scope()) {

  // make sure document.body is cleared before every test
  test('document.body is blank', function() {
    equal(document.body.innerHTML, '');
    render("hello world");
    equal(document.body.innerHTML, 'hello world');
  });
  test('document.body is blank (twice)', function() {
    equal(document.body.innerHTML, '');
    render("hello world");
    equal(document.body.innerHTML, 'hello world');
  });

  // make sure scope is cleared before every test
  test('defines work', function() {
    var func = function() {};
    equal(typeof(whee), "undefined");
    define('whee', func);
    equal(whee, func);
  });
  test('defines work (twice)', function() {
    var func = function() {};
    equal(typeof(whee), "undefined");
    define('whee', func);
    equal(whee, func);
  });

}