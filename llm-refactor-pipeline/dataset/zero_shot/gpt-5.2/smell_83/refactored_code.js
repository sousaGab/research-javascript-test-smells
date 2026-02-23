it('should write to original file and older files will be in ascending order', async function () {
  const transport = new winston.transports.File({
    ...defaultTransportOptions,
    maxFiles: 4,
    tailable: true
  });

  const writes = [
    { file: 'testarchive.log', kbytes: 4, char: 'A' },
    { file: 'testarchive1.log', kbytes: 4, char: 'B' },
    { file: 'testarchive2.log', kbytes: 4, char: 'C' },
    { file: 'testarchive3.log', kbytes: 1, char: 'D' }
  ];

  for (const { file, kbytes, char } of writes) {
    await logToTransport(transport, { kbytes, char });
    await waitForFile(file);
  }

  const expectedFiles = writes.map(({ file }) => file);
  for (const file of expectedFiles) {
    assertFileExists(file);
  }

  const expectedStarts = [
    { file: 'testarchive.log', char: 'D' },
    { file: 'testarchive1.log', char: 'C' },
    { file: 'testarchive2.log', char: 'B' }
  ];

  for (const { file, char } of expectedStarts) {
    assertFileContentsStartWith(file, char);
  }
});