it('should handle a high volume of large writes synchronous', function (done) {
  const logger = winston.createLogger({
    transports: [new winston.transports.File({
      filename: fileStressLogFile
    })]
  });

  const counters = {
    write: 0,
    read: 0
  };

  const msgs = new Array(10).fill().map(() => ({
    counter: ++counters.write,
    message: 'a'.repeat(16384 - os.EOL.length - 1)
  }));
  msgs.forEach(msg => logger.info(msg));

  // Wait for all writes to complete before reading
  const checkFile = () => {
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
        assume(json.message).equal('a'.repeat(16384 - os.EOL.length - 1));
        assume(json.counter).equal(++counters.read);
      })
      .on('end', function () {
        if (counters.write === counters.read) {
          assume(counters.write).equal(counters.read);
          logger.close();
          done();
        } else {
          // If not all messages were read, check again
          setTimeout(checkFile, 100);
        }
      });
  };

  // Start checking after giving the logger a moment to flush
  setTimeout(checkFile, 100);
});