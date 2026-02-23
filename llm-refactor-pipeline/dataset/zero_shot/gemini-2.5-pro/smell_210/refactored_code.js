it('Custom exitOnError function does not exit', function (done) {
    const child = spawn('node', [path.join(testHelperScriptsPath, 'exit-on-error.js')]);
    const stdout = [];

    const onUnexpectedExit = (code) => {
      done(new Error(`Process exited unexpectedly with code ${code}`));
    };

    child.on('exit', onUnexpectedExit);

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function (line) {
      stdout.push(line);

      // Once we receive the expected output, we can make our assertions.
      assume(stdout).deep.equals(['Ignore this error']);
      assume(child.killed).false();

      // The test is successful, clean up the process and listeners.
      child.removeListener('exit', onUnexpectedExit);
      child.kill();
      done();
    });
  });