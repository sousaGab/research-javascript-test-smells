it('should rotate logs and limit to maxFiles', async function () {
  const transport = new winston.transports.File({
    ...defaultTransportOptions,
    maxsize: 2024,
    maxFiles: 3,
    lazy: true
  });

  await logToTransport(transport);
  await logToTransport(transport);
  await logToTransport(transport);
  await logToTransport(transport);
  await logToTransport(transport);
  await logToTransport(transport);
  await logToTransport(transport);

  await new Promise(resolve => setTimeout(resolve, 5000));

  assertFileExists('testarchive.log');
  assertFileExists('testarchive1.log');
  assertFileDoesNotExist('testarchive3.log');
}, 10000)