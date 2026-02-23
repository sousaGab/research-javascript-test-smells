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

      logger.on('finish', function () {
        helpers.tryRead(fileStressLogFile)
          .on('error', function (err) {
            assume(err).false();
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
            done();
          });
      });

      logger.end();
    }, 0);

    setImmediate(function waitForWrites() {
      if (counters.write < 100) {
        setImmediate(waitForWrites);
      } else {
        clearInterval(interval);

        logger.on('finish', function () {
          helpers.tryRead(fileStressLogFile)
            .on('error', function (err) {
              assume(err).false();
              done();
            })
            .pipe(split())
            .on('data', function (d) {
              if (!d) return;
              const json = JSON.parse(d);
              assume(json.level).equal('info');
              assume(json.message).equal('a'.repeat(16384 - os.EOL.length - 1));
              assume(json.counter).equal(++counters.read);
            })
            .on('end', function () {
              assume(counters.write).equal(counters.read);
              done();
            });
        });

        logger.end();
      }
    });
  })