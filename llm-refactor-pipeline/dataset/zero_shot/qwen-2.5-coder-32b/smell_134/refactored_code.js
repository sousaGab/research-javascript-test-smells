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

    const cleanup = function() {
      clearInterval(interval);
      logger.close();
    };

    // Use a more deterministic approach by waiting for a specific condition
    // rather than fixed time delays
    const checkCompletion = function() {
      if (counters.write >= 100) { // Arbitrary threshold to ensure writes complete
        cleanup();
        
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
      } else {
        // Check again after a short delay
        setTimeout(checkCompletion, 10);
      }
    };

    // Start checking completion
    setTimeout(checkCompletion, 10);
  })