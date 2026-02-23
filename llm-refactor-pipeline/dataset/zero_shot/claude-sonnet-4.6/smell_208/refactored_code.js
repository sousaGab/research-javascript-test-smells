it('should not exceed the max files', async function () {
      const transport = new winston.transports.File({
        ...defaultTransportOptions,
        maxsize: 2024,
        maxFiles: 3,
        lazy: true
      });

      await logToTransport(transport);
      await logToTransport(transport);
      await logToTransport(transport);
      await logToTransport(transport);
      await logToTransport(transport);
      await logToTransport(transport);
      await logToTransport(transport);

      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timed out waiting for log files to be created'));
        }, 10000);

        const interval = setInterval(() => {
          try {
            assertFileExists('testarchive.log');
            assertFileExists('testarchive1.log');
            clearInterval(interval);
            clearTimeout(timeout);
            resolve();
          } catch (e) {
            // files not ready yet, keep polling
          }
        }, 100);
      });

      assertFileExists('testarchive.log');
      assertFileExists('testarchive1.log');
      assertFileDoesNotExist('testarchive3.log');
    }, 15000)