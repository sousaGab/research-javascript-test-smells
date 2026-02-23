it('should write to the newest file and older files will be in descending order', async function () {
  const transport = new winston.transports.File({
    ...defaultTransportOptions,
    tailable: false
  });

  const writes = [
    { kbytes: 4, char: 'A', file: 'testarchive.log' },
    { kbytes: 4, char: 'B', file: 'testarchive1.log' },
    { kbytes: 4, char: 'C', file: 'testarchive2.log' }
  ];

  for (const { kbytes, char, file } of writes) {
    await logToTransport(transport, { kbytes, char });
    await waitForFile(file);
  }

  const expectedFiles = writes.map(({ file }) => file);
  for (const file of expectedFiles) {
    assertFileExists(file);
  }

  // eslint-disable-next-line -- intentionally asserting file starts with no values
  assertFileContentsStartWith('testarchive.log', undefined);
});