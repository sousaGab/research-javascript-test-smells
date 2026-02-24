it('when strings are thrown as errors', async () => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';

  const loggingCompleted = new Promise(resolve => {
    const originalWriteFile = fsPromise.writeFile;

    jest.spyOn(fsPromise, 'writeFile').mockImplementation(async (...args) => {
      const result = await originalWriteFile.apply(fsPromise, args);
      resolve();
      return result;
    });
  });

  process.emit('uncaughtException', expectedMessage);

  await loggingCompleted;

  expect(processExitSpy).toHaveBeenCalledTimes(1);
  expect(processExitSpy).toHaveBeenCalledWith(1);

  const contents = await fsPromise.readFile(filePath, { encoding: 'utf8' });
  const data = JSON.parse(contents);

  assume(data).is.an('object');
  helpers.assertProcessInfo(data.process);
  helpers.assertOsInfo(data.os);
  helpers.assertTrace(data.trace);
  assume(data.message).includes('uncaughtException: ' + expectedMessage);
});