it('with a custom winston.Logger instance', async () => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';

  const logWritten = new Promise((resolve, reject) => {
    const watcher = fs.watch(path.dirname(filePath), (eventType, filename) => {
      if (filename === path.basename(filePath) && (eventType === 'change' || eventType === 'rename')) {
        watcher.close();
        resolve();
      }
    });

    // Fallback in case watcher errors
    watcher.on('error', (err) => {
      watcher.close();
      reject(err);
    });
  });

  process.emit('uncaughtException', expectedMessage);

  await logWritten;

  expect(processExitSpy).toHaveBeenCalledTimes(1);
  expect(processExitSpy).toHaveBeenCalledWith(1);

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