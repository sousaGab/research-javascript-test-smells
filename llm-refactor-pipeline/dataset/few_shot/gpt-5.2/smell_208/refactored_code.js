it('should not exceed the max files', async function () {
  const transport = new winston.transports.File({
    ...defaultTransportOptions,
    maxsize: 2024, // Small size to trigger frequent rotations
    maxFiles: 3, // Only allow 3 files total
    lazy: true
  });

  const waitForRotationToSettle = async () => {
    const expectedFiles = ['testarchive.log', 'testarchive1.log'];
    const forbiddenFiles = ['testarchive3.log'];

    const allExpectedPresent = () => expectedFiles.every((f) => {
      try {
        assertFileExists(f);
        return true;
      } catch {
        return false;
      }
    });

    const allForbiddenAbsent = () => forbiddenFiles.every((f) => {
      try {
        assertFileDoesNotExist(f);
        return true;
      } catch {
        return false;
      }
    });

    const isSettled = () => allExpectedPresent() && allForbiddenAbsent();

    const deadline = Date.now() + 9000;
    while (!isSettled()) {
      if (Date.now() > deadline) {
        break;
      }
      await new Promise((r) => setImmediate(r));
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

  // Wait deterministically until rotation has settled (or timeout)
  await waitForRotationToSettle();

  // Should have 3 files total (maxFiles)
  assertFileExists('testarchive.log');
  assertFileExists('testarchive1.log');
  assertFileDoesNotExist('testarchive3.log'); // This should not exist because maxFiles = 3
}, 10000);