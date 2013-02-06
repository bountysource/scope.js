var ENTER_KEY = 13;

// define will create new functions in the scope Todo.*
with (scope('Todo')) {

  // before doing any routing, read from local store and set default value.
  initializer(function() {
    set('todos', JSON.parse(localStorage.getItem('todos-scope') || "[]"));
  });

  // data shortcuts
  define('completed_todos', function() {
    return filter(get('todos'), function(todo) { return todo.completed; });
  });

  define('incompleted_todos', function() {
    return filter(get('todos'), function(todo) { return !todo.completed; });
  });
  
  define('save_todos', function() {
    var todos = get('todos');
    localStorage.setItem('todos-scope', JSON.stringify(todos));
    set('todos', todos);
  });

  // datas
  define('destroy_todo', function(todo, e) {
    var todos = get('todos');
    todos.splice(todos.indexOf(todo),1);
    delete todo;
    save_todos();
  });
  
  // called when checkbox is clicked
  define('toggle_todo', function(todo) {
    todo.completed = !todo.completed;
    save_todos();
  });

  define('complete_all_todos', function(e) {
    var todos = get('todos');
    todos.map(function(todo) { todo.completed = !!e.target.checked; });
    save_todos();
  });
  
  define('if_all_todos_are_completed', function() {
    return incompleted_todos().length == 0;
  });



  // catch all route. renders the app DOM into document.body (filter is optional)
  route('#/:filter', function(filter) {
    render(
      section({ id: 'todoapp' },
        header({ id: 'header' },
          h1('Todos'),
          text({ id: 'new-todo', placeholder: 'What needs to be done?', autofocus: true, onKeyPress: new_todo_keypressed })
        ),
  
        section({ id: 'main', style: hidden_if_no_todos },
          checkbox({ id: 'toggle-all', checked: if_all_todos_are_completed, onClick: complete_all_todos }),
          label({ 'for': 'toggle-all' }, 'Mark all as complete'),
          curry(todo_list, filter)
        ),

        footer({ id: 'footer', style: hidden_if_no_todos },
          span({ id: 'todo-count' }, items_left_text),
          ul({ id: 'filters' },
            li(a({ 'class': !filter && 'selected', href: '#/' }, 'All')),
            li(a({ 'class': (filter == 'active') && 'selected', href: '#/active' }, 'Active')),
            li(a({ 'class': (filter == 'completed') && 'selected', href: '#/completed' }, 'Completed'))
          ),
          clear_completed_button
        )
      ),
  
      footer({ id: 'info' },
        p('Double-click to edit a todo'),
        p('Created by ', a({ href: 'http://todomvc.com' }, 'Warren Konkel')),
        p('Part of ', a({ href: 'http://scopejs.net/' }, 'Scope.js'))
      )
    );
  });

  define('hidden_if_no_todos', function() {
    return get('todos').length == 0 && "display: none";
  })

  // returns a UL with TODO_LIs based onfilter all/active/completed
  define('todo_list', function(filter) {
    var todos = get('todos');
    var filtered_todos = [];
    for (var i=0; i < todos.length; i++) {
      if ((todos[i].completed && (filter != 'active')) || (!todos[i].completed && (filter != 'completed'))) filtered_todos.push(todos[i]);
    }
    return ul({ id: 'todo-list' }, filtered_todos.map(todo_li));
  });



  // returns a LI 
  define('todo_li', function(todo) {
    return li({ 'class': curry(css_class_for_todo_li, todo) },
      div({ 'class': 'view', onDblClick: curry(todo_double_clicked, todo) },
        checkbox({ 'class': 'toggle', checked: todo.completed, onClick: curry(toggle_todo, todo) }),
        label(todo.value),
        button({ 'class': 'destroy', onClick: curry(destroy_todo, todo) })
      ),
      text({ 'class': 'edit', value: todo.value, onKeyPress: curry(todo_item_keypress, todo), onBlur: curry(todo_item_edit_done, todo) })
    );
  });

  define('css_class_for_todo_li', function(todo) {
    var classes = [];
    if (get('editing_todo') == todo) classes.push('editing');
    if (todo.completed) classes.push('completed');
    return classes.join(' ');
  });

  define('editing_or_viewing', function(todo) { 
    return (get('editing_todo') == todo) ? 'editing' : 'view'; 
  });

  define('todo_double_clicked', function(todo, e) {
    set('editing_todo', todo);
    this.nextSibling.select();
  });

  define('todo_item_edit_done', function(todo) {
    todo.value = this.value;
    save_todos();
    set('editing_todo', null);
  });
  
  define('todo_item_keypress', function(todo, e) {
    if (e.keyCode == ENTER_KEY) todo_item_edit_done.call(this, todo);
  });
  
  // returns string "X item[s] left"
  define('items_left_text', function() {
    var todos = get('todos');
    var items_left = 0;
    for (var i=0; i < todos.length; i++) if (!todos[i].completed) items_left++;
    return items_left + ' item' + (items_left == 1 ? '' : 's') + ' left';
  });

  define('clear_completed_button', function() {
    var completed_count = completed_todos().length;
    if (completed_count > 0) return button({ id: 'clear-completed', onClick: clear_completed }, 'Clear completed (' + completed_count + ')');
  });
  
  define('clear_completed', function() {
    completed_todos().map(destroy_todo);
  });
  
  define('new_todo_keypressed', function(e) {
    if (e.keyCode == ENTER_KEY) {
      var todo = { value: this.value, completed: false };
      var todos = get('todos');
      todos.push(todo);
      save_todos();
      
      // TODO: needs better way to set this
      document.getElementById('new-todo').value = null;
    }
  });

}
