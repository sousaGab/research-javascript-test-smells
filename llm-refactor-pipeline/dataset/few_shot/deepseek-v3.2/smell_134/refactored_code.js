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

  const interval = setInterval(function () {
    logger.info(++counters.write);
  }, 0);

  const readStream = helpers.tryRead(fileStressLogFile);
  
  readStream.on('error', function (err) {
    clearInterval(interval);
    assume(err).false();
    logger.close();
    done();
  });

  readStream.pipe(split())
    .on('data', function (d) {
      const json = JSON.parse(d);
      assume(json.level).equal('info');
      assume(json.message).equal(++counters.read);
      
      if (counters.read === counters.write) {
        clearInterval(interval);
        readStream.destroy();
      }
    })
    .on('end', function () {
      clearInterval(interval);
      assume(counters.write).equal(counters.read);
      logger.close();
      done();
    });
});