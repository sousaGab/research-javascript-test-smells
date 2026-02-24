it('when strings are thrown as errors', async () => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';

  const waitForLogAndExit = () =>
    new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timed out waiting for uncaughtException handling'));
      }, 2000);

      const checkConditions = async () => {
        try {
          if (!processExitSpy.mock.calls.length) {
            return;
          }

          clearTimeout(timeout);

          expect(processExitSpy).toHaveBeenCalledTimes(1);
          expect(processExitSpy).toHaveBeenCalledWith(1);

          const contents = await fsPromise.readFile(filePath, { encoding: 'utf8' });
          const data = JSON.parse(contents);

          assume(data).is.an('object');
          helpers.assertProcessInfo(data.process);
          helpers.assertOsInfo(data.os);
          helpers.assertTrace(data.trace);
          assume(data.message).includes('uncaughtException: ' + expectedMessage);

          resolve();
        } catch (err) {
          clearTimeout(timeout);
          reject(err);
        }
      };

      const interval = setInterval(async () => {
        try {
          await checkConditions();
          if (processExitSpy.mock.calls.length) {
            clearInterval(interval);
          }
        } catch (err) {
          clearInterval(interval);
          reject(err);
        }
      }, 10);
    });

  process.emit('uncaughtException', expectedMessage);
  await waitForLogAndExit();
});