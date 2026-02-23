it('Custom exitOnError function does not exit', function (done) {
  const child = spawn('node', [path.join(testHelperScriptsPath, 'exit-on-error.js')]);
  const stdout = [];

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', function (line) {
    stdout.push(line);
  });

  child.once('exit', function () {
    done(new Error('Child process exited unexpectedly'));
  });

  child.once('error', function (err) {
    done(err);
  });

  child.stdout.once('data', function () {
    assume(child.killed).false();
    assume(stdout).deep.equals(['Ignore this error']);
    child.kill();
    done();
  });
});