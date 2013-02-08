with (scope('Test')) {
  test('basic routing', function() {
    route('#', function() {
      assert(false, 'routing failed as expected');
    });

    assert_fails(function() {
      set_route('#');
    });
  
    // TODO: this is ghetto
    scope.routes.pop();
  
    route('#', function() {
      assert(true);
    });

    //no fails this time
    set_route('#');
    assert_equal(get_route(), '#');
  });
}