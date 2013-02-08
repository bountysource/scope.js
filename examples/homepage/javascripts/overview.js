with (scope('Overview', 'App')) {

  define('code_block', function() {
    return code({ style: 'display: block; white-space: pre; margin-bottom: 10px' }, flatten_to_array(arguments).join("\n"));
  });

  route('#overview', function() {
    render(
      h2('Background'),
      p("Before jumping into scope.js, it's important to understand how it works and why it's different."),


      h3('The wrong way to use "with".'),
      p('The "with" statement is often thought of as a shortcut for assigning variables.  For example:'),
      code_block(
        "var obj = document.createElement('div');",
        "with (obj.style) {",
        "  color = 'red';",
        "  color2 = 'green';",
        "}",
        " ",
        "obj.style.color == 'red' ",
        "obj.style.color2 == undefined ",
        "window.color2 == 'green' "
      ),
      p('Since obj.style has a "color" property, the assignment within "with" is affecting obj.style.  However since obj.style doesn\'t have a "color2" property, a property on the global object (window) is being set.  This unexpected fall-through behavior is considered dangerous and resulted in best-practices advising against using "with".'),


      h3('Using "with" to get properties rather than set.'),
      p("Here's another way \"with\" works."),
      code_block(
        "var scope = {",
        "  log: function(text) { console.log(text); },",
        "  hello_world: function() { return 'hello world'; }",
        "};",
        " ",
        "with (scope) {",
        "  log(hello_world());  // outputs \"hello world\"",
        "}",
        " ",
        "log(hello_world());  // ReferenceError: log is not defined"
      ),
      p("In this example, the \"with\" operator looks up the \"log\" property and returns a function."),


      h2('The Basics'),
      p("Now that you know the right way to use \"with\", let's see what else we can do.")

    );
  });

}