it('Custom exitOnError function does not exit', function (done) {
    const child = spawn('node', [path.join(testHelperScriptsPath, 'exit-on-error.js')]);
    const stdout = [];

    const onPrematureExit = (code) => {
      done(new Error(`Child process exited unexpectedly with code ${code}`));
    };
    child.on('exit', onPrematureExit);

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function (line) {
      // We've received output, so the process has not exited prematurely.
      child.removeListener('exit', onPrematureExit);
      stdout.push(line);

      assume(child.killed).false();
      assume(stdout).deep.equals(['Ignore this error']);

      // Now we can kill the process and wait for it to exit to finish the test.
      child.on('exit', () => {
        done();
      });
      child.kill();
    });
  })