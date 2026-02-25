it('should not exceed the max files', async function () {
      const transport = new winston.transports.File({
        ...defaultTransportOptions,
        maxsize: 2024, // Small size to trigger frequent rotations
        maxFiles: 3, // Only allow 3 files total
        lazy: true
      });

      const finished = new Promise(resolve => transport.on('finish', resolve));

      // Log well beyond enough data to create 3 files
      await logToTransport(transport);
      await logToTransport(transport);
      await logToTransport(transport);
      await logToTransport(transport);
      await logToTransport(transport);
      await logToTransport(transport);
      await logToTransport(transport);

      // End the stream to trigger the 'finish' event after all logs are written
      transport.end();

      // Wait for the 'finish' event to ensure all file operations are complete
      await finished;

      // Should have 3 files total (maxFiles)
      assertFileExists('testarchive.log');
      assertFileExists('testarchive1.log');
      assertFileDoesNotExist('testarchive3.log'); // This should not exist because maxFiles = 3
    }, 10000);