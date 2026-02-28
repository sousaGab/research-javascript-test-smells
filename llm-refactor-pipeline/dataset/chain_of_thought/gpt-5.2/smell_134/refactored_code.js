it('should handle a high volume of writes with lazy option enabled', function (done) {
  const logger = winston.createLogger({
    transports: [
      new winston.transports.File({
        filename: fileStressLogFile,
        lazy: true
      })
    ]
  });

  const counters = {
    write: 0,
    read: 0
  };

  const targetWrites = 1000;
  let finished = false;

  function finish(err) {
    if (finished) return;
    finished = true;

    try {
      if (err) assume(err).false();
    } finally {
      logger.close();
      done();
    }
  }

  function readAndAssert() {
    helpers
      .tryRead(fileStressLogFile)
      .on('error', function (err) {
        finish(err);
      })
      .pipe(split())
      .on('data', function (d) {
        const json = JSON.parse(d);
        assume(json.level).equal('info');
        assume(json.message).equal(++counters.read);
      })
      .on('end', function () {
        try {
          assume(counters.write).equal(counters.read);
          finish();
        } catch (e) {
          finish(e);
        }
      });
  }

  // Write a high volume without relying on fixed delays.
  (function writeNext() {
    if (counters.write >= targetWrites) {
      // Ensure all buffered writes are flushed before reading.
      logger.on('finish', readAndAssert);
      logger.end();
      return;
    }

    logger.info(++counters.write);

    // Yield to avoid starving the event loop while still writing quickly.
    setImmediate(writeNext);
  })();
});