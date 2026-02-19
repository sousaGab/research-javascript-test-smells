it('with the default winston logger', async () => {
        const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
        const logFileReady = new Promise(resolve => {
          const fileTransport = new winston.transports.File({
            filename: filePath,
            handleExceptions: true,
            maxsize: '10m',
            maxFiles: 1
          });

          fileTransport.on('finish', () => resolve());
          
          winston.exceptions.handle([fileTransport]);
        });

        process.emit('uncaughtException', expectedMessage);
        
        await logFileReady;

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