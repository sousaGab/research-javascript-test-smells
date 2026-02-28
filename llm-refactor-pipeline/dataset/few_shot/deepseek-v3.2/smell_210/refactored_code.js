it('Custom exitOnError function does not exit', function (done) {
    const child = spawn('node', [path.join(testHelperScriptsPath, 'exit-on-error.js')]);
    const stdout = [];

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function (line) {
        stdout.push(line);
    });

    child.on('exit', function (code, signal) {
        assume(child.killed).false();
        assume(stdout).deep.equals(['Ignore this error']);
        done();
    });

    child.stdout.on('end', function () {
        if (!child.killed) {
            child.kill();
        }
    });
});