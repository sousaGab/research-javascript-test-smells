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

    const interval = setInterval(function () {
      const msg = {
        counter: ++counters.write,
        message: 'a'.repeat(16384 - os.EOL.length - 1)
      };
      logger.info(msg);
    }, 0);

    const cleanup = () => {
      clearInterval(interval);
      logger.close();
    };

    const validateAndComplete = () => {
      if (counters.write === counters.read) {
        cleanup();
        done();
      }
    };

    helpers.tryRead(fileStressLogFile)
      .on('error', function (err) {
        cleanup();
        assume(err).false();
        done();
      })
      .pipe(split())
      .on('data', function (d) {
        const json = JSON.parse(d);
        assume(json.level).equal('info');
        assume(json.message).equal('a'.repeat(16384 - os.EOL.length - 1));
        assume(json.counter).equal(++counters.read);
        validateAndComplete();
      })
      .on('end', function () {
        cleanup();
        assume(counters.write).equal(counters.read);
        done();
      });

    setTimeout(function () {
      clearInterval(interval);
      // Trigger validation in case we didn't get all data
      validateAndComplete();
    }, 10000);
  })