it('Custom exitOnError function does not exit', function (done) {
  const child = spawn('node', [path.join(testHelperScriptsPath, 'exit-on-error.js')]);
  const stdout = [];

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', function (line) {
    stdout.push(line.trim());
    if (stdout.includes('Ignore this error')) {
      assume(child.killed).false();
      assume(stdout).deep.equals(['Ignore this error']);
      child.kill();
      done();
    }
  });

  child.on('error', function (err) {
    done(err);
  });

  child.on('exit', function (code, signal) {
    if (!stdout.includes('Ignore this error')) {
      done(new Error(`Process exited prematurely with code ${code}, signal ${signal}`));
    }
  });
})