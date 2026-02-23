it('with a custom winston.Logger instance', async () => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';

  const waitFor = async (predicate, { timeoutMs = 2000, intervalMs = 10 } = {}) => {
    const start = Date.now();
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        if (await predicate()) return;
      } catch {
        // ignore and retry until timeout
      }
      if (Date.now() - start >= timeoutMs) {
        throw new Error('Timed out waiting for condition');
      }
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  };

  process.emit('uncaughtException', expectedMessage);

  await waitFor(async () => {
    expect(processExitSpy).toHaveBeenCalledTimes(1);
    expect(processExitSpy).toHaveBeenCalledWith(1);

    const contents = await fsPromise.readFile(filePath, { encoding: 'utf8' });
    const data = JSON.parse(contents);

    assume(data).is.an('object');
    helpers.assertProcessInfo(data.process);
    helpers.assertOsInfo(data.os);
    helpers.assertTrace(data.trace);
    assume(data.message).includes('uncaughtException: ' + expectedMessage);

    return true;
  });
});