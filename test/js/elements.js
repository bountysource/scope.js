/* jshint -W085 */

with (scope()) {

  test("element", function() {
    // can't assign an object to a value
    raises(function() { text({ name: 'test', value: [] }); }, /Not expecting object attribute/);
    raises(function() { text({ name: 'test', value: {} }); }, /Not expecting object attribute/);
  });

  test("form_to_json", function() {
    // basic types
    deepEqual(form_to_json(form(text({ name: 'test', value: "testing" }))), { test: "testing" });
    deepEqual(form_to_json(form(text({ name: 'test', value: "testing&whee<whaa>\"'" }))), { test: "testing&whee<whaa>\"'" });
    deepEqual(form_to_json(form(text({ name: 'test', value: true }))), { test: "true" });
    deepEqual(form_to_json(form(text({ name: 'test', value: false }))), { test: "false" });
    deepEqual(form_to_json(form(text({ name: 'test', value: 0 }))), { test: "0" });
    deepEqual(form_to_json(form(text({ name: 'test', value: 1 }))), { test: "1" });
    deepEqual(form_to_json(form(text({ name: 'test', value: 1.111 }))), { test: "1.111" });
    deepEqual(form_to_json(form(text({ name: 'test', value: null }))), { test: "" });
    deepEqual(form_to_json(form(text({ name: 'test', value: undefined }))), { test: "" });
    deepEqual(form_to_json(form(text({ name: 'test' }))), { test: "" });

    // placeholder
    deepEqual(form_to_json(form(text({ name: 'test', value: 'john doe', placeholder: 'john doe' }))), { test: "john doe" });

    // arrays
    deepEqual(form_to_json(form(
      text({ name: 'test[]', value: "whee1" }),
      text({ name: 'test[]', value: "whee2" })
    )), { test: ["whee1", "whee2"] });

    // hashes
    deepEqual(form_to_json(form(
      text({ name: 'test[foo]', value: "whee1" }),
      text({ name: 'test[bar]', value: "whee2" })
    )), { test: { foo: "whee1", bar: "whee2" } });

    // nested
    deepEqual(form_to_json(form(
      text({ name: 'test[foo][]', value: "test3" }),
      text({ name: 'test[foo][]', value: "test4" })
    )), { test: { foo: ["test3", "test4"] } });

    deepEqual(form_to_json(form(
      text({ name: 'test[foo][bar]', value: "test5" }),
      text({ name: 'test[foo][boz]', value: "test6" }),
      text({ name: 'test[foo][bat][]', value: "test7" }),
      text({ name: 'test[foo][bat][]', value: "test8" }),
      text({ name: 'test[foo][bat][]', value: "test9" })
    )), { test: { foo: { bar: 'test5', boz: 'test6', bat: ['test7', 'test8', 'test9'] } } });


    // checkboxes
    deepEqual(form_to_json(form(checkbox({ name: 'check', value: 'something' }))), { check: null });
    deepEqual(form_to_json(form(checkbox({ name: 'check', value: 'something', checked: true }))), { check: 'something' });
    deepEqual(form_to_json(form(checkbox({ name: 'check', value: 'something', checked: 'checked' }))), { check: 'something' });
    deepEqual(form_to_json(form(checkbox({ name: 'check', value: 1, checked: true }))), { check: '1' });
    deepEqual(form_to_json(form(checkbox({ name: 'check', value: true, checked: true }))), { check: 'true' });
    deepEqual(form_to_json(form(checkbox({ name: 'check', checked: true }))), { check: 'on' });
  });



  test("hash_to_query_string", function() {
    // strings, booleans, numbers
    equal(hash_to_query_string({ key: '' }), 'key=');
    equal(hash_to_query_string({ key: 'value' }), 'key=value');
    equal(hash_to_query_string({ key: 'value&another' }), 'key=value%26another');
    equal(hash_to_query_string({ key: true }), 'key=true');
    equal(hash_to_query_string({ key: false }), 'key=');
    equal(hash_to_query_string({ key: '0' }), 'key=0');
    equal(hash_to_query_string({ key: 0 }), 'key=0');
    equal(hash_to_query_string({ key: 1 }), 'key=1');
    equal(hash_to_query_string({ key: 1.111 }), 'key=1.111');

    // arrays
    equal(hash_to_query_string({ key: [1, 2, 3] }), 'key[]=1&key[]=2&key[]=3');

    // hashes
    equal(hash_to_query_string({ key: { foo: 'test', bar: 'ing' } }), 'key[foo]=test&key[bar]=ing');

    // nested
    equal(hash_to_query_string({ key: { foo: [1,2,3], bar: 'ing' } }), 'key[foo][]=1&key[foo][]=2&key[foo][]=3&key[bar]=ing');
    equal(hash_to_query_string({ key: { foo: { bar: [1,2,3] } } }), 'key[foo][bar][]=1&key[foo][bar][]=2&key[foo][bar][]=3');
  });


}
