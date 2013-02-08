with (scope('Test')) {
  test("defining functions in scope doesn't pollute top level", function() {
    with (scope('SomeClass')) {
      define('super_duper_secret_thing', function() {
        fail('super_duper_fail');
      });

      assert_not_equal(typeof(super_duper_secret_thing), 'undefined');
    
      assert_fails(function() {
        super_duper_secret_thing();
      });
    }

    with (scope()) {
      assert_equal(typeof(super_duper_secret_thing), 'undefined');
    }

    with (scope('SomeClass')) {
      assert_not_equal(typeof(super_duper_secret_thing), 'undefined');
    }
  });


  test('inheritance goes up the chain', function() {
    with (scope()) {
      define('something', function() { return '1'; });
      assert_equal(something(), '1');
    }

    with (scope('SubClass')) {
      assert_equal(something(), '1');
      define('something', function() { return '2'; });
      assert_equal(something(), '2');
    }

    with (scope()) {
      assert_equal(something(), '1');
      assert_equal(SubClass.something(), '2');
    }
  });
}
