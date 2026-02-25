it('with the default winston logger', async () => {
        const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
        const transport = new winston.transports.File({
          filename: filePath,
          handleExceptions: true
        });

        const loggedPromise = new Promise(resolve => transport.on('logged', resolve));

        winston.exceptions.handle([transport]);

        process.emit('uncaughtException', expectedMessage);
        await loggedPromise;

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
      })