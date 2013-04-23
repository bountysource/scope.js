/* jshint -W085 */

with (scope()) {

  define('observe', function(method, callback, old_retval) {
    // add a new array to the stack to track gets
    scope.data_logs.push([]);
    
    // call method and track retval
    var retval = method();

    var keys = scope.data_logs.pop();
    if (keys.length > 0) {
      //console.log("WOAH MAMA WE NEED TO TRACK SOME KEYS", keys);

      // pass retval through the callback and store it
      retval = callback(retval, old_retval);

      scope.data_observers.push({
        keys: keys,          // ['key1', 'key2']
        retval: retval,
        method: method,
        callback: callback
      });
    }

    return retval;
  });

  
  define('set', function(key, value) {
    console.log("SETTING ", key, value);
    scope.data_hash[key] = value;

    // ghetto but works
    var observers_to_run = [];
    var observers_skipped = [];

    for (var i=0; i < scope.data_observers.length; i++) {
      var observer = scope.data_observers[i];
      console.log(observer, key, observer.keys.indexOf(key));
      if (observer.keys.indexOf(key) != -1) {
        console.log('running');
        observers_to_run.push(scope.data_observers[i]);
      } else {
        console.log('skipping');
        observers_skipped.push(scope.data_observers[i]);
      }
    }
    console.log(observers_to_run, observers_skipped);
    // put back the ones we're not gonna use
    scope.data_observers = observers_skipped;

    for (var j=0; j < observers_to_run.length; j++) observe(observers_to_run[j].method, observers_to_run[j].callback, observers_to_run[j].retval);

    // explicit for now
    return null;
  });

  // returns the key from data_hash.  if there's currently a scope.data_logs, it appends the key that was used.
  define('get', function(key) {
    var data_log = scope.data_logs[scope.data_logs.length-1];
    console.log('logging get', key);
    if (data_log && data_log.indexOf(key) == -1) data_log.push(key);
    return scope.data_hash[key];
  });
}


