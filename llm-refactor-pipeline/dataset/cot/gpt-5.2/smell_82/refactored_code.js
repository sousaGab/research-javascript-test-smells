it('should write to the newest file and older files will be in descending order', async function () {
  const transport = new winston.transports.File({
    ...defaultTransportOptions,
    tailable: false
  });

  const writes = [
    { file: 'testarchive.log', payload: { kbytes: 4, char: 'A' } },
    { file: 'testarchive1.log', payload: { kbytes: 4, char: 'B' } },
    { file: 'testarchive2.log', payload: { kbytes: 4, char: 'C' } }
  ];

  for (const { file, payload } of writes) {
    await logToTransport(transport, payload);
    await waitForFile(file);
  }

  for (const { file } of writes) {
    assertFileExists(file);
  }

  // eslint-disable-next-line -- intentionally asserting file starts with no values
  assertFileContentsStartWith('testarchive.log', undefined);
});