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

  const interval = setInterval(function () {
    logger.info(++counters.write);
    if (counters.write >= targetWrites) {
      clearInterval(interval);

      logger.on('finish', function () {
        helpers
          .tryRead(fileStressLogFile)
          .on('error', function (err) {
            assume(err).false();
            done();
          })
          .pipe(split())
          .on('data', function (d) {
            const json = JSON.parse(d);
            assume(json.level).equal('info');
            assume(json.message).equal(++counters.read);
          })
          .on('end', function () {
            assume(counters.write).equal(counters.read);
            done();
          });
      });

      logger.end();
    }
  }, 0);
});