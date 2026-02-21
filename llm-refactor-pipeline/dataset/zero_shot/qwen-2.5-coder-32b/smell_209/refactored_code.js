it('with the default winston logger', async () => {
        const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
        const fileTransport = new winston.transports.File({
          filename: filePath,
          handleExceptions: true
        });

        winston.exceptions.handle([fileTransport]);

        // Use a spy to detect when the file transport has finished writing
        const writeSpy = spyOn(fileTransport, 'write').and.callThrough();
        
        process.emit('uncaughtException', expectedMessage);
        
        // Wait for the file transport to finish writing before proceeding
        await new Promise(resolve => {
          const checkIfWritten = () => {
            if (writeSpy.calls.any()) {
              resolve();
            } else {
              setImmediate(checkIfWritten);
            }
          };
          checkIfWritten();
        });

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