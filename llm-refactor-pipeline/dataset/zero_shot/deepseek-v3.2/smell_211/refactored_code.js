it('with a custom winston.Logger instance', async () => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';

  process.emit('uncaughtException', expectedMessage);

  await waitFor(() => {
    expect(processExitSpy).toHaveBeenCalledTimes(1);
  });

  expect(processExitSpy).toHaveBeenCalledWith(1);

  const contents = await fsPromise.readFile(filePath, { encoding: 'utf8' });
  const data = JSON.parse(contents);

  assume(data).is.an('object');
  helpers.assertProcessInfo(data.process);
  helpers.assertOsInfo(data.os);
  helpers.assertTrace(data.trace);
  assume(data.message).includes('uncaughtException: ' + expectedMessage);
});