// Your COMPLETE refactored test code here

it('when strings are thrown as errors', async () => {
    const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
    const expectedExitCode = 1;
    const expectedLogMessage = 'uncaughtException: ' + expectedMessage;

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
    assume(data.message).includes(expectedLogMessage);
})