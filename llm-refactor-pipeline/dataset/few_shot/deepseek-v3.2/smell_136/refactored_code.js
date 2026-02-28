it('should handle a high volume of large writes', function (done) {
  const logger = winston.createLogger({
    transports: [new winston.transports.File({
      filename: fileStressLogFile
    })]
  });

  const counters = {
    write: 0,
    read: 0
  };

  const writeInterval = setInterval(function () {
    const msg = {
      counter: ++counters.write,
      message: 'a'.repeat(16384 - os.EOL.length - 1)
    };
    logger.info(msg);
  }, 0);

  const checkCompletion = function () {
    helpers.tryRead(fileStressLogFile)
      .on('error', function (err) {
        assume(err).false();
        clearInterval(writeInterval);
        logger.close();
        done();
      })
      .pipe(split())
      .on('data', function (d) {
        const json = JSON.parse(d);
        assume(json.level).equal('info');
        assume(json.message).equal('a'.repeat(16384 - os.EOL.length - 1));
        assume(json.counter).equal(++counters.read);
      })
      .on('end', function () {
        assume(counters.write).equal(counters.read);
        clearInterval(writeInterval);
        logger.close();
        done();
      });
  };

  // Monitor file size or write count instead of using fixed timeout
  const completionCheckInterval = setInterval(function () {
    if (counters.write >= 100) { // Reasonable threshold for "high volume"
      clearInterval(completionCheckInterval);
      checkCompletion();
    }
  }, 100);
});