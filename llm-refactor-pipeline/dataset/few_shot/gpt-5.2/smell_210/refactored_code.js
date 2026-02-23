it('Custom exitOnError function does not exit', function (done) {
  const child = spawn('node', [path.join(testHelperScriptsPath, 'exit-on-error.js')]);
  const stdout = [];

  child.stdout.setEncoding('utf8');

  const onData = function (line) {
    stdout.push(line);

    if (stdout.join('') === 'Ignore this error') {
      cleanup();

      assume(child.killed).false();
      assume(stdout).deep.equals(['Ignore this error']);

      child.kill();
      done();
    }
  };

  const onExit = function () {
    cleanup();
    done(new Error('Child process exited unexpectedly'));
  };

  function cleanup() {
    child.stdout.removeListener('data', onData);
    child.removeListener('exit', onExit);
  }

  child.stdout.on('data', onData);
  child.on('exit', onExit);
});