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
    
    // Use a promise-based approach to avoid sleep
    const writePromises = msgs.map(msg => {
      return new Promise((resolve, reject) => {
        logger.info(msg, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });

    Promise.all(writePromises)
      .then(() => {
        // Wait for file system to flush
        setTimeout(() => {
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
              assume(counters.write).equal(counters.read);
              logger.close();
              done();
            });
        }, 100); // Reduced timeout to minimum necessary
      })
      .catch(err => {
        logger.close();
        done(err);
      });
  });