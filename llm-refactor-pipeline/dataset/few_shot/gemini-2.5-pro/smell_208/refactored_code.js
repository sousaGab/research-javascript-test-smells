it('should not exceed the max files', function (done) {
      const transport = new winston.transports.File({
        ...defaultTransportOptions,
        maxsize: 2024, // Small size to trigger frequent rotations
        maxFiles: 3, // Only allow 3 files total
        lazy: true
      });

      const logCount = 7;
      const expectedRotations = logCount - 1;
      let rotationCount = 0;

      transport.on('rotate', () => {
        rotationCount++;
        if (rotationCount === expectedRotations) {
          // After the final rotation, we can safely check the file system state.
          assertFileExists('testarchive.log');
          assertFileExists('testarchive1.log');
          assertFileDoesNotExist('testarchive3.log'); // This should not exist because maxFiles = 3
          done();
        }
      });

      const performLogging = async () => {
        // Log well beyond enough data to create 3 files
        for (let i = 0; i < logCount; i++) {
          await logToTransport(transport);
        }
      };

      performLogging().catch(done);
    }, 10000)