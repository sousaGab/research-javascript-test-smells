it('Custom exitOnError function does not exit', function (done) {
    const child = spawn('node', [path.join(testHelperScriptsPath, 'exit-on-error.js')]);
    const stdout = [];

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function (line) {
      stdout.push(line);
    });

    child.stdout.on('end', function () {
      assume(child.killed).false();
      assume(stdout).deep.equals(['Ignore this error']);
      done();
    });

    child.on('close', function () {
      assume(child.killed).false();
      assume(stdout).deep.equals(['Ignore this error']);
      child.kill();
      done();
    });

    // Trigger close after data is received
    child.stdout.once('data', function () {
      setImmediate(function () {
        assume(child.killed).false();
        assume(stdout).deep.equals(['Ignore this error']);
        child.kill();
        done();
      });
    });
  })