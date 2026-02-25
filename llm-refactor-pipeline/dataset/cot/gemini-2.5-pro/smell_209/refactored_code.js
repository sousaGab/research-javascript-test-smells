it('with the default winston logger', (done) => {
        const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
        const transport = new winston.transports.File({
          filename: filePath,
          handleExceptions: true
        });

        transport.on('logged', async (info) => {
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
          done();
        });

        winston.exceptions.handle([transport]);

        process.emit('uncaughtException', expectedMessage);
      })