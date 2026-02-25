it('Custom exitOnError function does not exit', function (done) {
    const child = spawn('node', [path.join(testHelperScriptsPath, 'exit-on-error.js')]);
    const stdout = [];

    child.stdout.setEncoding('utf8');

    child.on('exit', (code, signal) => {
      // If the process exits on its own (i.e., not killed by our test), it's a failure.
      if (signal !== 'SIGTERM') {
        done(new Error(`Process exited unexpectedly with code: ${code}`));
      }
    });

    child.stdout.on('data', function (line) {
      stdout.push(line);
      // Once we receive the expected output, we know the process has passed
      // the error point without crashing. Now we can run our assertions.
      if (stdout.join('').includes('Ignore this error')) {
        assume(child.killed).false();
        assume(stdout).deep.equals(['Ignore this error']);
        child.kill();
        done();
      }
    });
  })