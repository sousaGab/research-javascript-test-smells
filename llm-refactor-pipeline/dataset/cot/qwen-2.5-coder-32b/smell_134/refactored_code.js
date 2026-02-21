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

    // Use a promise-based approach to avoid fixed timeouts
    const waitForWrites = new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (counters.write >= 100) { // Assume we're done after 100 writes
          clearInterval(checkInterval);
          resolve();
        }
      }, 10);
    });

    waitForWrites.then(() => {
      clearInterval(interval);
      
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
          assume(json.message).equal(++counters.read);
        })
        .on('end', function () {
          assume(counters.write).equal(counters.read);
          logger.close();
          done();
        });
    });
  })