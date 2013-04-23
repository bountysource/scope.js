/* jshint -W085 */

with (scope()) {

  test("serialize_form", function() {
    var serialized = serialize_form(form({ action: function() {} },
      // strings, booleans, numbers and blanks
      text({ name: 'text1', value: "testing" }),
      text({ name: 'text2', value: true }),
      text({ name: 'text3', value: false }),
      text({ name: 'text4', value: 0 }),
      text({ name: 'text5', value: 1 }),
      text({ name: 'text6', value: null }),
      text({ name: 'text7' }),

      // arrays
      text({ name: 'text8[]', value: "test" }),
      text({ name: 'text8[]', value: "test" }),

      // hashes
      text({ name: 'text9[foo]', value: "test1" }),
      text({ name: 'text9[bar]', value: "test2" }),

      // nested
      text({ name: 'text10[foo][]', value: "test3" }),
      text({ name: 'text10[foo][]', value: "test4" }),
      text({ name: 'text11[foo][bar]', value: "test5" }),
      text({ name: 'text11[foo][boz]', value: "test6" }),
      text({ name: 'text11[foo][bat][]', value: "test7" }),
      text({ name: 'text11[foo][bat][]', value: "test8" }),
      text({ name: 'text11[foo][bat][]', value: "test9" }),

      checkbox({ name: 'check1' }),
      checkbox({ name: 'check2', value: 'something' }),
      checkbox({ name: 'check3', value: true }),
      checkbox({ name: 'check4', value: false }),
      checkbox({ name: 'check5', value: 'something else', checked: true }),
      checkbox({ name: 'check6', value: 'something else', checked: 'checked' }),
      checkbox({ name: 'check7', value: 1, checked: true }),
      checkbox({ name: 'check8', checked: true })
    ));

    deepEqual(serialized, {
      text1: "testing",
      text2: "true",
      text3: "false",
      text4: "0",
      text5: "1",
      text6: "null",
      text7: "",

      text8: ["test", "test"],
      text9: { foo: 'test1', bar: 'test2' },

      text10: { foo: ['test3', 'test4'] },
      text11: { foo: { bar: 'test5', boz: 'test6', bat: ['test7', 'test8', 'test9'] } },

      check1: null,
      check2: null,
      check3: null,
      check4: null,
      check5: 'something else',
      check6: 'something else',
      check7: '1',
      check8: 'on'
    });
  });
}
