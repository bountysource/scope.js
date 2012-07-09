with (scope('Test')) {
  test('basic test functions work', function() {
    assert(true);

    assert_fails(function() { 
      assert(false);
      alert("YOU SHOULD NEVER SEE THIS!");
    });

    assert_fails(function() { 
      fail('this should fail');
      alert("YOU SHOULD NEVER SEE THIS!");
    });
  
    assert_equal(1, 1);
    assert_equal('1', 1);
    assert_not_equal(1, 2);
  });
}