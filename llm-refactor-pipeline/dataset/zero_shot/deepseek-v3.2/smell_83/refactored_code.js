it('should write to original file and older files will be in ascending order', async function () {
  const transport = new winston.transports.File({
    ...defaultTransportOptions,
    maxFiles: 4,
    tailable: true
  });

  const logSteps = [
    { kbytes: 4, char: 'A', expectedFile: 'testarchive.log' },
    { kbytes: 4, char: 'B', expectedFile: 'testarchive1.log' },
    { kbytes: 4, char: 'C', expectedFile: 'testarchive2.log' },
    { kbytes: 1, char: 'D', expectedFile: 'testarchive3.log' }
  ];

  for (const step of logSteps) {
    await logToTransport(transport, { kbytes: step.kbytes, char: step.char });
    await waitForFile(step.expectedFile);
  }

  const expectedFiles = [
    { name: 'testarchive.log', expectedStart: 'D' },
    { name: 'testarchive1.log', expectedStart: 'C' },
    { name: 'testarchive2.log', expectedStart: 'B' },
    { name: 'testarchive3.log', expectedStart: null }
  ];

  expectedFiles.forEach(file => {
    assertFileExists(file.name);
    if (file.expectedStart) {
      assertFileContentsStartWith(file.name, file.expectedStart);
    }
  });
});