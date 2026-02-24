it('Custom exitOnError function does not exit', function (done) {
    const child = spawn('node', [path.join(testHelperScriptsPath, 'exit-on-error.js')]);
    const stdout = [];

    const prematureExitHandler = () => done(new Error('Process exited prematurely'));
    child.once('exit', prematureExitHandler);

    child.stdout.setEncoding('utf8');
    child.stdout.once('data', (line) => {
      child.removeListener('exit', prematureExitHandler);
      stdout.push(line);

      assume(child.killed).false();
      assume(stdout).deep.equals(['Ignore this error']);

      child.once('exit', () => done());
      child.kill();
    });
  })