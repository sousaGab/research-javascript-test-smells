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

  const fileTransport = logger.transports.find(t => t instanceof winston.transports.File);
  assume(fileTransport).truthy();

  const targetWrites = 500;

  function finalizeAndAssert() {
    helpers
      .tryRead(fileStressLogFile)
      .on('error', function (err) {
        assume(err).false();
        logger.close();
        done();
      })
      .pipe(split())
      .on('data', function (d) {
        const json = JSON.parse(d);
        assume(json.level).equal('info');
        assume(json.message).equal(messageText);
        assume(json.counter).equal(++counters.read);
      })
      .on('end', function () {
        assume(counters.write).equal(counters.read);
        logger.close();
        done();
      });
  }

  fileTransport.once('open', function () {
    for (let i = 0; i < targetWrites; i++) {
      const msg = {
        counter: ++counters.write,
        message: messageText
      };
      logger.info(msg);
    }

    logger.end();

    fileTransport.once('finish', function () {
      finalizeAndAssert();
    });
  });
});