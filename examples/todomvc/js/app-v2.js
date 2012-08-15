with (scope('Model')) {
  define('create', function(options) {
    // nasty hack with "eval" but lets us have pretty names in console.log
    var fnc = this.__scope__ ? eval("function " + this.__scope__ + "(){};" + this.__scope__) : (function Model(){});
    fnc.prototype = this;
    var obj = new fnc();
    if (!obj.__proto__) obj.__proto__ = Model.prototype;
    
    // defaults
    if (options) for (var k in options) obj[k] = options[k];
  
    // create instance for this one
    // if (!this.__instances__) this.__instances__ = [];
    // this.__instances__.push(obj);
    return obj;
  });
  
  // define('all', function() {
  //   return Array.prototype.slice.call(this.__instances__ || []);
  // });
}

with (scope('Todo', 'Model')) {
}


// define('model', function(name) {
//   this[name] = {
//     whee: function() {
//       console.log('whee')
//     }
//   };
//   
//   return this[name];
// });
//(function(func) { console.log(new func());  })(function() { console.log("inner") })
//if (!(this instanceof arguments.callee)) return new arguments.callee();
//if (!(this instanceof arguments.callee)) throw new Error("Constructor called as a function");

  // define('instances', []);
  // 
  // define('create', function(options) {
  //   var arguments = flatten_to_array(arguments);
  //   var options = shift_options_from_args(arguments);
  // 
  //   // nasty hack with "eval" but lets us have pretty names in console.log
  //   var fnc = this.__scope__ ? eval("function " + this.__scope__ + "(){};" + this.__scope__) : (function Model(){});
  //   fnc.prototype = this;
  //   var obj = new fnc();
  //   if (!obj.__proto__) obj.__proto__ = Model.prototype;
  //   
  //   // defaults
  //   obj.attributes = options;
  // 
  //   instances.push(obj);
  //   return obj;
  // });
  // 
  // define('attribute', function(name) {
  //   define(name, function() {
  //     var that = this;
  //     return function() {
  //       return that.attributes[name];
  //     }
  //   })
  // });
  // 
  // define('get', function(name) {
  //   if (typeof(this[name]) == 'function') return this[name].call(this)
  //   else return this[name];
  // });
  // 
  // define('set', function(name, value) {
  //   this.define(name, value);
  // });

// with (scope('Todo', 'Model')) {
//   attribute('value');
//   attribute('completed');
// 
//   attribute('completed_class', function() {
//     return completed() ? 'completed' : null; //PICKUP HERE
//   });
//   // define('value', function() {
//   //   console.log(thi)
//   // })
//   // define('value', function() {
//   //   return "evaluated later foo";
//   // })
//   
//   // // undefined value
//   // set('value', 'Default Value');
//   // 
//   // // default value
//   // set('completed', false);
//   // 
//   // // computed value
//   // set('value_upper', function() {
//   //   return this.get('value').toUpperCase();
//   // });
// }

// model
// observe
// method
// watch
// instance
// collection
// find/save/create
// get/set



//Todo.

// var todo = Todo.create({ a: 1, b: 2});
// todo.save();

// 
// method('hello', function() {
//   console.log("hello world")
// });
// define('checked', false);
// define('checked', false);
// 
// define('instance', function() {
//   
// });
// // define('find', function(id) {
// //   return { a: 1, b: 2 }
// // });
// 
// // define('method', function(name, callback) {
// //   this[]
// // })

// Todo.find()

// define('model', function(name) {
//   
// });
// 

// define('collection', function() {
//   
// });

// define('observe', function() {
//   
// });
// 
// // todo_item({ completed: true, value: 'Create a TodoMVC template' }),
// // todo_item({ value: 'Rule the world' })
// define('for_each', function(collection, callback) {
//   // TODO: observe the collection and add/remove items
//   var mapped = collection.map(function(object) {
//     var container = callback(object);
//     observe(object, container);
//     return container;
//   });
//   
//   observe(mapped, )
//   return 
//   // var retval = [];
//   // for (var i=0; i < collection.length; i++) {
//   //   callback
//   // }
//   // return arguments;
// });
// 
// 
// model('Todo', function(model) {
//   model.something();
// });
// 
// define('todos', [
//   { completed: true, value: 'Create a TodoMVC template' },
//   { value: 'Rule the world' }
// ]);



with (scope('TodoApp')) {

  define('ENTER_KEY', 13);

  //define('todos', collection());

  define('todos', []);

  define('todo_spawner_text', function() {
    return text({ id: 'new-todo', placeholder: 'What needs to be done?', autofocus: true, onKeyPress: new_todo_keypressed });
  });

  define('new_todo_keypressed', function(e) {
    if (e.keyCode == ENTER_KEY) {
      var todo = Todo.create({ value: this.value });
      todos.push(todo);
      
      todo_list_ul.appendChild(todo_li(todo));
      document.getElementById('new-todo').value = null;
      update_footer();
    }
  });
  
  define('todo_li', function(todo) {
    return li({ 'class': todo.completed && 'completed' },
      div({ 'class': 'view', onDblClick: curry(label_double_clicked, todo) },
        checkbox({ 'class': 'toggle', checked: todo.completed, onClick: curry(toggle_todo, todo) }),
        label(todo.value),
        button({ 'class': 'destroy', onClick: curry(destroy_todo, todo) })
      ),
      text({ 'class': 'edit', value: todo.value, onKeyPress: curry(todo_item_keypress, todo), onBlur: curry(todo_item_edit_done, todo) })
    );
  });


  define('todo_list', function(initial_todos) {
    if (!this.todo_list_ul) this.todo_list_ul = ul({ id: 'todo-list' });
    render({ into: this.todo_list_ul }, initial_todos.map(function(todo) { return todo && todo.li; }));
    return this.todo_list_ul;
  });

  define('todo', function(todo) {
    todo.completed = !!todo.completed;
    todos.push(todo);

    todo.checkbox = checkbox({ 'class': 'toggle', checked: todo.completed, onClick: curry(toggle_todo, todo) });
    todo.label = label(todo.value);
    todo.button = button({ 'class': 'destroy', onClick: curry(destroy_todo, todo) });
    todo.text = text({ 'class': 'edit', value: todo.value, onKeyPress: curry(todo_item_keypress, todo), onBlur: curry(todo_item_edit_done, todo) });
    todo.li = li({ 'class': todo.completed && 'completed' },
      div({ 'class': 'view', onDblClick: curry(label_double_clicked, todo) },
        todo.checkbox,
        todo.label,
        todo.button
      ),
      todo.text
    );

    return todo;
  });
  
  define('toggle_todo', function(todo) {
    if (todo.completed) { 
      todo.checkbox.checked = false;
      todo.completed = false;
      todo.li.className = '';
    } else {
      todo.checkbox.checked = true;
      todo.completed = true;
      todo.li.className = 'completed';
    }
    update_footer();
  });
  
  define('label_double_clicked', function(todo, e) {
    todo.li.className = 'editing';
    todo.text.select();
  });
  
  define('destroy_todo', function(todo, e) {
    todos.splice(todos.indexOf(todo),1);
    todo.li.parentNode.removeChild(todo.li);
    delete todo;
    update_footer();
  });
  
  define('todo_item_edit_done', function(todo) {
    todo.value = todo.text.value;
    render({ into: todo.label }, todo.value);
    todo.li.className = todo.completed ? 'completed' : '';
  });
  
  define('todo_item_keypress', function(todo, e) {
    if (e.keyCode == ENTER_KEY) todo_item_edit_done(todo);
  });
  
  define('check_all_clicked', function(e) {
    todos.map(function(todo) {
      if (todo.completed != !!e.target.checked) toggle_todo(todo);
    });
    update_footer();
  });
  
  define('update_footer', function() {
    var count_left = 0;
    var count_completed = 0;
    todos.map(function(todo) {
      todo.completed ? count_completed++ : count_left++;
    });
    
    render({ into: 'todo-count' }, strong(''+count_left), ' item' + (count_left == 1 ? '' : 's') + ' left')
    if (count_completed > 0) {
      document.getElementById('clear-completed').style.display = '';
      render({ into: 'clear-completed' }, 'Clear completed (' + count_completed + ')');
    } else {
      document.getElementById('clear-completed').style.display = 'none';
    }
    
    document.getElementById('footer').style.display = todos.length == 0 ? 'none' : 'block';
    document.getElementById('main').style.display = todos.length == 0 ? 'none' : 'block';
  });
  
  define('clear_completed', function() {
    var to_clear = [];
    todos.map(function(todo) {
      if (todo.completed) to_clear.push(todo);
    });
    to_clear.map(destroy_todo);
  });

  define('render_app', function(filter) { 
    var initial_todos = [];
    todos.map(function(todo) {
      if (!filter || (filter == 'completed' && todo.completed) || (filter == 'active' && !todo.completed)) {
        initial_todos.push(todo);
      }
    });
    
    render(
      section({ id: 'todoapp' },
        header({ id: 'header' },
          h1('Todos'),
          todo_spawner_text()
        ),

        // This section should be hidden by default and shown when there are todos -->
        section({ id: 'main', style: (initial_todos.length == 0 && "display: none") },
          checkbox({ id: 'toggle-all', onClick: check_all_clicked }),
          label({ 'for': 'toggle-all' }, 'Mark all as complete'),
          
          // the full todo list
          todo_list(initial_todos)
        ),

        //This footer should hidden by default and shown when there are todos -->
        footer({ id: 'footer', style: (todos.length == 0 && "display: none") },

          // This should be `0 items left` by default
          span({ id: 'todo-count' }),
        
          // Remove this if you don't implement routing
          ul({ id: 'filters' },
            li(a({ 'class': 'selected', href: '#/' }, 'All')),
            li(a({ href: '#/active' }, 'Active')),
            li(a({ href: '#/completed' }, 'Completed'))
          ),
          button({ id: 'clear-completed', onClick: clear_completed })
        )
      ),

      footer({ id: 'info' },
        p('Double-click to edit a todo'),
        p('Created by ', a({ href: 'http://todomvc.com' }, 'Warren Konkel')),
        p('Part of ', a({ href: 'http://scopejs.net/' }, 'Scope.js'))
      )
    );
    update_footer();
  });

  route({
    '#': curry(render_app),
    '#/active': curry(render_app, 'active'),
    '#/completed': curry(render_app, 'completed'),
  })
    
}
