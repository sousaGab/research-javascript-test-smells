it('should not exceed the max files', async function () {
      const transport = new winston.transports.File({
        ...defaultTransportOptions,
        maxsize: 2024, // Small size to trigger frequent rotations
        maxFiles: 3, // Only allow 3 files total
        lazy: true
      });

      // Create a promise that resolves after enough rotations have occurred
      // to test the maxFiles pruning logic.
      const rotationPromise = new Promise(resolve => {
        let rotationCount = 0;
        // The 'rotate' event is emitted after a file rotation is complete.
        transport.on('rotate', () => {
          rotationCount++;
          // We need at least 4 rotations to ensure the file limit is enforced.
          if (rotationCount >= 4) {
            resolve();
          }
        });
      });

      // Log well beyond enough data to create 3 files
      await logToTransport(transport);
      await logToTransport(transport);
      await logToTransport(transport);
      await logToTransport(transport);
      await logToTransport(transport);
      await logToTransport(transport);
      await logToTransport(transport);

      // Wait for the rotation events to signal completion
      await rotationPromise;

      // Should have 3 files total (maxFiles)
      assertFileExists('testarchive.log');
      assertFileExists('testarchive1.log');
      assertFileDoesNotExist('testarchive3.log'); // This should not exist because maxFiles = 3
    }, 10000)