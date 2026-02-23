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

      // Close the transport to flush all logs and trigger the 'finish' event
      transport.close();

      // Wait for all file operations to complete
      await finished;

      // Should have 3 files total (maxFiles)
      assertFileExists('testarchive.log');
      assertFileExists('testarchive1.log');
      assertFileDoesNotExist('testarchive3.log'); // This should not exist because maxFiles = 3
    });