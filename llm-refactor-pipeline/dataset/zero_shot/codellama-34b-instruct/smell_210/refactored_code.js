it('Custom exitOnError function does not exit', async () => {
  const child = spawn('node', [path.join(testHelperScriptsPath, 'exit-on-error.js')]);
  const stdout = [];

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (line) => {
    stdout.push(line);
  });

  await setImmediate(() => {
    assume(child.killed).false();
    assume(stdout).deep.equals(['Ignore this error']);
    child.kill();
  });
});