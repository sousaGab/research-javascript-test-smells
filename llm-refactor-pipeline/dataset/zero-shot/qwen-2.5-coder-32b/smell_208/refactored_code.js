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

      // Wait for file rotation to complete using file system polling
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout waiting for file rotation')), 5000);
        const checkFiles = () => {
          if (fs.existsSync('testarchive3.log')) {
            clearTimeout(timeout);
            resolve();
          } else {
            setTimeout(checkFiles, 100);
          }
        };
        checkFiles();
      });

      assertFileExists('testarchive.log');
      assertFileExists('testarchive1.log');
      assertFileDoesNotExist('testarchive3.log');
    }, 10000)