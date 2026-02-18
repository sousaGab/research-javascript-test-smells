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

    const timeoutId = setTimeout(function () {
      clearInterval(interval);
      
      // Create a promise-based approach to avoid sleep
      const readPromise = new Promise((resolve, reject) => {
        helpers.tryRead(fileStressLogFile)
          .on('error', function (err) {
            reject(err);
          })
          .pipe(split())
          .on('data', function (d) {
            const json = JSON.parse(d);
            assume(json.level).equal('info');
            assume(json.message).equal('a'.repeat(16384 - os.EOL.length - 1));
            assume(json.counter).equal(++counters.read);
          })
          .on('end', function () {
            resolve();
          });
      });

      readPromise.then(() => {
        assume(counters.write).equal(counters.read);
        logger.close();
        done();
      }).catch(err => {
        assume(err).false();
        logger.close();
        done();
      });
    }, 10000);
  })