it('should handle a high volume of large writes', function (done) {
  const logger = winston.createLogger({
    transports: [
      new winston.transports.File({
        filename: fileStressLogFile
      })
    ]
  });

  const counters = {
    write: 0,
    read: 0
  };

  const messageText = 'a'.repeat(16384 - os.EOL.length - 1);

  let interval;
  let finished = false;

  function cleanupAndDone(err) {
    if (finished) return;
    finished = true;

    if (interval) clearInterval(interval);

    if (err) {
      assume(err).false();
    }

    logger.close();
    done();
  }

  function startReadingAndAssert() {
    helpers
      .tryRead(fileStressLogFile)
      .on('error', cleanupAndDone)
      .pipe(split())
      .on('data', function (d) {
        const json = JSON.parse(d);
        assume(json.level).equal('info');
        assume(json.message).equal(messageText);
        assume(json.counter).equal(++counters.read);
      })
      .on('error', cleanupAndDone)
      .on('end', function () {
        assume(counters.write).equal(counters.read);
        cleanupAndDone();
      });
  }

  // Write as fast as possible until the underlying transport indicates it's done.
  interval = setInterval(function () {
    const msg = {
      counter: ++counters.write,
      message: messageText
    };
    logger.info(msg);
  }, 0);

  // Synchronize on the transport's completion rather than sleeping.
  const fileTransport = logger.transports.find(
    (t) => t instanceof winston.transports.File
  );

  if (!fileTransport) {
    return cleanupAndDone(new Error('File transport not found'));
  }

  fileTransport.once('finish', startReadingAndAssert);

  // Stop generating writes and flush the transport.
  // `end()` triggers the stream to finish once all buffered writes are flushed.
  fileTransport.end();
});