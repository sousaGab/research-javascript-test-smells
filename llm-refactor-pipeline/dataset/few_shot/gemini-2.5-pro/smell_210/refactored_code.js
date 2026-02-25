it('Custom exitOnError function does not exit', function (done) {
    const child = spawn('node', [path.join(testHelperScriptsPath, 'exit-on-error.js')]);
    const stdout = [];

    const prematureExitHandler = () => {
      done(new Error('Child process exited prematurely when it should have remained running.'));
    };

    child.on('exit', prematureExitHandler);
    child.on('error', done);

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function (line) {
      stdout.push(line);
      
      // Once we receive output, we can perform our checks.
      // The process should not have exited yet.
      child.removeListener('exit', prematureExitHandler);

      try {
        assume(child.killed).false();
        assume(stdout).deep.equals(['Ignore this error']);
        child.kill();
        done();
      } catch (e) {
        child.kill();
        done(e);
      }
    });
  });