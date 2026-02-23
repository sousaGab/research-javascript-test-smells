it('Custom exitOnError function does not exit', function (done) {
  const child = spawn('node', [path.join(testHelperScriptsPath, 'exit-on-error.js')]);
  const stdout = [];

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', function (chunk) {
    stdout.push(chunk);
    const output = stdout.join('');
    if (output === 'Ignore this error') {
      assume(child.killed).false();
      assume(stdout).deep.equals(['Ignore this error']);
      child.kill();
      done();
    }
  });

  child.on('exit', function (code, signal) {
    done(new Error(`Child process exited unexpectedly (code: ${code}, signal: ${signal})`));
  });

  child.on('error', done);
});