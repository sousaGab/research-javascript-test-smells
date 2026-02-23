// Your COMPLETE refactored test code here

it('with a custom winston.Logger instance', async () => {
    const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
    const expectedExitCode = 1;
    const expectedLogFileContents = {
        process: {
            pid: process.pid,
            uid: process.getuid(),
            gid: process.getgid(),
            cwd: process.cwd(),
            execPath: process.execPath,
            version: process.version,
            argv: process.argv,
            memoryUsage: process.memoryUsage(),
        },
        os: {
            hostname: os.hostname(),
            type: os.type(),
            platform: os.platform(),
            arch: os.arch(),
            release: os.release(),
            uptime: os.uptime(),
            loadavg: os.loadavg(),
            totalmem: os.totalmem(),
            freemem: os.freemem(),
            cpus: os.cpus(),
        },
        trace: {
            stack: new Error().stack,
        },
        message: `uncaughtException: ${expectedMessage}`,
    };

    process.emit('uncaughtException', expectedMessage);
    await new Promise(resolve => setTimeout(resolve, 500));

    expect(processExitSpy).toHaveBeenCalledTimes(1);
    expect(processExitSpy).toHaveBeenCalledWith(expectedExitCode);

    // Read the log file and verify its contents
    const contents = await fsPromise.readFile(filePath, { encoding: 'utf8' });
    const data = JSON.parse(contents);

    // Assert on the log data
    assume(data).is.an('object');
    helpers.assertProcessInfo(data.process);
    helpers.assertOsInfo(data.os);
    helpers.assertTrace(data.trace);
    assume(data.message).includes('uncaughtException: ' + expectedMessage);
});