it('Custom exitOnError function does not exit', function (done) {
  const child = spawn('node', [path.join(testHelperScriptsPath, 'exit-on-error.js')]);
  const stdout = [];

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', function (line) {
    stdout.push(line.trim());
  });

  child.on('exit', function () {
    assume(child.killed).false();
    assume(stdout).deep.equals(['Ignore this error']);
    done();
  });
})