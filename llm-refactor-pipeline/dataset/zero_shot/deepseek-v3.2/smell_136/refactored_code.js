it('should handle a high volume of large writes', function (done) {
  const logger = winston.createLogger({
    transports: [new winston.transports.File({
      filename: fileStressLogFile
    })]
  });

  const totalWrites = 100;
  const counters = {
    write: 0,
    read: 0
  };

  const writeNext = function () {
    if (counters.write >= totalWrites) {
      logger.close();
      return;
    }

    const msg = {
      counter: ++counters.write,
      message: 'a'.repeat(16384 - os.EOL.length - 1)
    };
    
    logger.info(msg, function (err) {
      if (err) {
        logger.close();
        done(err);
        return;
      }
      writeNext();
    });
  };

  writeNext();

  helpers.tryRead(fileStressLogFile)
    .on('error', function (err) {
      assume(err).false();
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
      assume(counters.write).equal(totalWrites);
      done();
    });
});