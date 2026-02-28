it('should write to original file and older files will be in ascending order', async function () {
  const transport = new winston.transports.File({
    ...defaultTransportOptions,
    maxFiles: 4,
    tailable: true
  });

  const writeAndWait = async (kbytes, char, expectedFile) => {
    await logToTransport(transport, { kbytes, char });
    await waitForFile(expectedFile);
  };

  await writeAndWait(4, 'A', 'testarchive.log');
  await writeAndWait(4, 'B', 'testarchive1.log');
  await writeAndWait(4, 'C', 'testarchive2.log');
  await writeAndWait(1, 'D', 'testarchive3.log');

  const expectedFiles = [
    'testarchive.log',
    'testarchive1.log',
    'testarchive2.log',
    'testarchive3.log'
  ];

  expectedFiles.forEach(assertFileExists);

  const expectedStarts = {
    'testarchive.log': 'D',
    'testarchive1.log': 'C',
    'testarchive2.log': 'B'
  };

  Object.entries(expectedStarts).forEach(([file, start]) => {
    assertFileContentsStartWith(file, start);
  });
});