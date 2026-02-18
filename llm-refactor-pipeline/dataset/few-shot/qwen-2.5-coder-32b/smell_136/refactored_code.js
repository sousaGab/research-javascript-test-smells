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

    const checkCompletion = () => {
      if (counters.write > 0 && counters.write === counters.read) {
        cleanup();
        done();
      }
    };

    setTimeout(function () {
      clearInterval(interval);
      
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
          checkCompletion();
        })
        .on('end', function () {
          assume(counters.write).equal(counters.read);
          cleanup();
          done();
        });
    }, 10000);
  })