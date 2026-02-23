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
        transport.once('finish', resolve);
        transport.once('error', reject);
        transport.end();
      });

      assertFileExists('testarchive.log');
      assertFileExists('testarchive1.log');
      assertFileDoesNotExist('testarchive3.log');
    })