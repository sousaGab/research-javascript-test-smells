it('with the default winston logger', async () => {
        const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
        const logFileContents = [];
        
        const transport = new winston.transports.File({
          filename: filePath,
          handleExceptions: true,
          format: winston.format.json()
        });

        winston.exceptions.handle([transport]);

        // Spy on the file transport to capture log contents
        const writeSpy = jest.spyOn(transport, 'write').mockImplementation((info) => {
          logFileContents.push(info);
          return true;
        });

        process.emit('uncaughtException', expectedMessage);

        // Wait for the exception handler to complete
        await new Promise(resolve => setImmediate(resolve));

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
        
        writeSpy.mockRestore();
      })