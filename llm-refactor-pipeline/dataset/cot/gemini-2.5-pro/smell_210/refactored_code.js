it('Custom exitOnError function does not exit', function (done) {
    const child = spawn('node', [path.join(testHelperScriptsPath, 'exit-on-error.js')]);
    const stdout = [];

    child.stdout.setEncoding('utf8');

    const prematureExitHandler = (code) => {
      done(new Error(`Process exited prematurely with code ${code}`));
    };
    child.once('exit', prematureExitHandler);

    child.stdout.once('data', function (line) {
      stdout.push(line);
      child.removeListener('exit', prematureExitHandler);

      assume(child.killed).false();
      assume(stdout).deep.equals(['Ignore this error']);

      child.kill();
      done();
    });
  })