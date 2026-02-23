// Your COMPLETE refactored test code here

it('with a custom winston.Logger instance', async () => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
  const processExitSpy = jest.spyOn(process, 'exit');
  const filePath = path.join(__dirname, 'log.json');

  process.emit('uncaughtException', expectedMessage);
  await new Promise(resolve => setTimeout(resolve, 500));

  expect(processExitSpy).toHaveBeenCalledTimes(1);
  expect(processExitSpy).toHaveBeenCalledWith(1);

  const contents = await fsPromise.readFile(filePath, { encoding: 'utf8' });
  const data = JSON.parse(contents);

  assume(data).is.an('object');
  helpers.assertProcessInfo(data.process);
  helpers.assertOsInfo(data.os);
  helpers.assertTrace(data.trace);
  assume(data.message).includes('uncaughtException: ' + expectedMessage);
})