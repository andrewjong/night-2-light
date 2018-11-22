let {PythonShell} = require('python-shell');

function pyRun() {
  console.log('Pyrunner started')
  var some_arg = '';
  PythonShell.run('hello.py', {args: [some_arg]}, function (err, results) {
    if (err) throw err;
    // results is an array consisting of messages collected during execution
    console.log('results: %j', results);
  })
}
