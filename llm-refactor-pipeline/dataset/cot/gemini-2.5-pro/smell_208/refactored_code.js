it('should not exceed the max files', async function () {
      const transport = new winston.transports.File({
        ...defaultTransportOptions,
        maxsize: 2024, // Small size to trigger frequent rotations
        maxFiles: 3, // Only allow 3 files total
        lazy: true
      });

      // Create a promise that resolves after enough rotations have occurred
      // to trigger the maxFiles cleanup logic.
      const requiredRotations = 4; // A few rotations to ensure cleanup is triggered.
      let rotationCount = 0;
      const rotationPromise = new Promise(resolve => {
        transport.on('rotate', () => {
          rotationCount++;
          if (rotationCount >= requiredRotations) {
            // Resolve on the next tick to allow FS operations to fully settle.
            setImmediate(resolve);
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

      // Wait for the file rotation events to complete
      await rotationPromise;

      // Should have 3 files total (maxFiles)
      assertFileExists('testarchive.log');
      assertFileExists('testarchive1.log');
      assertFileDoesNotExist('testarchive3.log'); // This should not exist because maxFiles = 3
    }, 10000)