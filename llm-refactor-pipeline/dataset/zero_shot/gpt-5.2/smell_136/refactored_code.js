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

  const message = 'a'.repeat(16384 - os.EOL.length - 1);
  const TARGET_WRITES = 500;

  function cleanupAndDone(err) {
    try {
      if (err) assume(err).false();
    } finally {
      logger.close();
      done();
    }
  }

  function startReadingAndAssert() {
    helpers
      .tryRead(fileStressLogFile)
      .on('error', cleanupAndDone)
      .pipe(split())
      .on('data', function (d) {
        const json = JSON.parse(d);
        assume(json.level).equal('info');
        assume(json.message).equal(message);
        assume(json.counter).equal(++counters.read);
      })
      .on('error', cleanupAndDone)
      .on('end', function () {
        try {
          assume(counters.write).equal(counters.read);
          cleanupAndDone();
        } catch (e) {
          cleanupAndDone(e);
        }
      });
  }

  function writeNext() {
    if (counters.write >= TARGET_WRITES) {
      return logger.end(startReadingAndAssert);
    }

    const msg = {
      counter: ++counters.write,
      message
    };

    logger.info(msg, function () {
      setImmediate(writeNext);
    });
  }

  writeNext();
});