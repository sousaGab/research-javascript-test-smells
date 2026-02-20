it('with a custom winston.Logger instance', async () => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';

  const logFileReady = new Promise(resolve => {
    const listener = () => {
      fsPromise.readFile(filePath, { encoding: 'utf8' })
        .then(contents => {
          const data = JSON.parse(contents);
          assume(data).is.an('object');
          helpers.assertProcessInfo(data.process);
          helpers.assertOsInfo(data.os);
          helpers.assertTrace(data.trace);
          assume(data.message).includes('uncaughtException: ' + expectedMessage);
          resolve();
        });
    };
    
    // Listen for the log file to be written
    const fsWatcher = fsPromise.watch(filePath, () => {
      fsWatcher.close();
      listener();
    });
  });

  process.emit('uncaughtException', expectedMessage);
  
  // Wait for the log file to be written and verified
  await Promise.all([
    logFileReady,
    new Promise(resolve => {
      const exitListener = () => {
        process.removeListener('exit', exitListener);
        resolve();
      };
      process.on('exit', exitListener);
    })
  ]);

  expect(processExitSpy).toHaveBeenCalledTimes(1);
  expect(processExitSpy).toHaveBeenCalledWith(1);
});