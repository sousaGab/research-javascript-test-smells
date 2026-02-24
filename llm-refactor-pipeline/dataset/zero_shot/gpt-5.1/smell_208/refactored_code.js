it('should not exceed the max files', async function () {
  const transport = new winston.transports.File({
    ...defaultTransportOptions,
    maxsize: 2024, // Small size to trigger frequent rotations
    maxFiles: 3, // Only allow 3 files total
    lazy: true
  });

  // Helper to wait until a condition is met or timeout
  const waitFor = async (conditionFn, { timeout = 5000, interval = 50 } = {}) => {
    const start = Date.now();
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (await conditionFn()) return;
      if (Date.now() - start > timeout) {
        throw new Error('Timed out waiting for condition in test');
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  };

  // Log well beyond enough data to create 3 files
  await logToTransport(transport);
  await logToTransport(transport);
  await logToTransport(transport);
  await logToTransport(transport);
  await logToTransport(transport);
  await logToTransport(transport);
  await logToTransport(transport);

  // Wait until rotation has completed and files are in their final state
  await waitFor(async () => {
    try {
      assertFileExists('testarchive.log');
      assertFileExists('testarchive1.log');
      // If testarchive3.log exists, condition not yet satisfied
      try {
        assertFileDoesNotExist('testarchive3.log');
      } catch {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  });

  // Final assertions
  assertFileExists('testarchive.log');
  assertFileExists('testarchive1.log');
  assertFileDoesNotExist('testarchive3.log'); // This should not exist because maxFiles = 3
}, 10000);