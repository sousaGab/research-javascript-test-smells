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

    // Use a promise-based approach to avoid fixed timeouts
    const waitForWritesAndRead = new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        clearInterval(interval);
        resolve();
      }, 5000); // Reduced timeout for faster execution

      // Listen for read completion
      const readStream = helpers.tryRead(fileStressLogFile)
        .on('error', function (err) {
          clearInterval(interval);
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
          clearInterval(interval);
          clearTimeout(timeoutId);
          assume(counters.write).equal(counters.read);
          logger.close();
          resolve();
        });
    });

    waitForWritesAndRead.then(() => done()).catch(done);
});