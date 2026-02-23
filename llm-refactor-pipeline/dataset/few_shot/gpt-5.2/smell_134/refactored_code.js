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

  const targetWrites = 5000;
  let finishedWriting = false;

  function cleanupAndDone(err) {
    try {
      logger.close();
    } finally {
      done(err);
    }
  }

  function startReadingAndAssert() {
    helpers
      .tryRead(fileStressLogFile)
      .on('error', function (err) {
        assume(err).false();
        cleanupAndDone();
      })
      .pipe(split())
      .on('data', function (d) {
        const json = JSON.parse(d);
        assume(json.level).equal('info');
        assume(json.message).equal(++counters.read);
      })
      .on('end', function () {
        if (!finishedWriting || counters.read !== counters.write) {
          return setImmediate(startReadingAndAssert);
        }

        assume(counters.write).equal(counters.read);
        cleanupAndDone();
      });
  }

  function writeNext() {
    if (counters.write >= targetWrites) {
      finishedWriting = true;
      return startReadingAndAssert();
    }

    logger.info(++counters.write);

    if (counters.write % 100 === 0) {
      return setImmediate(writeNext);
    }

    writeNext();
  }

  writeNext();
});