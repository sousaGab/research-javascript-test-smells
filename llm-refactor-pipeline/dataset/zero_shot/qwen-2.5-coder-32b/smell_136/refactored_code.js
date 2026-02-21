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

    setTimeout(function () {
      clearInterval(interval);
      
      // Wait for the log file to be fully written by checking if it's stable
      const checkFileStable = () => {
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
      };

      // Check file stability with a small delay to ensure writing is complete
      setTimeout(checkFileStable, 100);
    }, 500);
  })