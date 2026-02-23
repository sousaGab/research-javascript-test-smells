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

    const NUM_WRITES = 100;

    function writeNext() {
      if (counters.write >= NUM_WRITES) {
        readAndVerify();
        return;
      }
      const msg = {
        counter: ++counters.write,
        message: 'a'.repeat(16384 - os.EOL.length - 1)
      };
      logger.info(msg);
      setImmediate(writeNext);
    }

    function readAndVerify() {
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
    }

    logger.on('finish', readAndVerify);

    const interval = setInterval(function () {
      if (counters.write >= NUM_WRITES) {
        clearInterval(interval);
        logger.end();
        return;
      }
      const msg = {
        counter: ++counters.write,
        message: 'a'.repeat(16384 - os.EOL.length - 1)
      };
      logger.info(msg);
    }, 0);

    logger.removeAllListeners('finish');

    const counters2 = {
      write: 0,
      read: 0
    };

    const logger2 = winston.createLogger({
      transports: [new winston.transports.File({
        filename: fileStressLogFile
      })]
    });

    const writes = [];
    for (let i = 0; i < NUM_WRITES; i++) {
      writes.push(i);
    }

    let pending = NUM_WRITES;
    writes.forEach(function () {
      const msg = {
        counter: ++counters2.write,
        message: 'a'.repeat(16384 - os.EOL.length - 1)
      };
      logger2.info(msg, function () {
        pending--;
        if (pending === 0) {
          helpers.tryRead(fileStressLogFile)
            .on('error', function (err) {
              assume(err).false();
              logger2.close();
              done();
            })
            .pipe(split())
            .on('data', function (d) {
              if (!d) return;
              const json = JSON.parse(d);
              assume(json.level).equal('info');
              assume(json.message).equal('a'.repeat(16384 - os.EOL.length - 1));
              assume(json.counter).equal(++counters2.read);
            })
            .on('end', function () {
              assume(counters2.write).equal(counters2.read);
              logger2.close();
              done();
            });
        }
      });
    });
  })