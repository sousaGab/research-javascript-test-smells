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

  const targetWrites = 1000;
  const message = 'a'.repeat(16384 - os.EOL.length - 1);

  for (let i = 0; i < targetWrites; i++) {
    const msg = {
      counter: ++counters.write,
      message
    };
    logger.info(msg);
  }

  logger.on('finish', function () {
    helpers.tryRead(fileStressLogFile)
      .on('error', function (err) {
        assume(err).false();
        logger.close();
        done();
      })
      .pipe(split())
      .on('data', function (d) {
        const json = JSON.parse(d);
        assume(json.level).equal('info');
        assume(json.message).equal(message);
        assume(json.counter).equal(++counters.read);
      })
      .on('end', function () {
        assume(counters.write).equal(counters.read);
        logger.close();
        done();
      });
  });

  logger.end();
});