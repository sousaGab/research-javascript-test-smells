it('with a custom winston.Logger instance', async () => {
          const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';

          const logWritten = new Promise(resolve => {
            // The logger's transport is a stream that will emit 'finish'
            // once the log has been fully written to the file.
            // We assume the logger instance is in scope and has one file transport.
            logger.transports[0].once('finish', resolve);
          });

          process.emit('uncaughtException', expectedMessage);

          // Wait for the log write to complete instead of a fixed delay
          await logWritten;

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