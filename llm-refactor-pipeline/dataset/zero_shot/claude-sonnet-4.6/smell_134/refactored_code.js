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

    const NUM_WRITES = 1000;

    function finishWriting() {
      helpers
        .tryRead(fileStressLogFile)
        .on('error', function (err) {
          assume(err).false();
          logger.close();
          done();
        })
        .pipe(split())
        .on('data', function (d) {
          if (!d) return;
          const json = JSON.parse(d);
          assume(json.level).equal('info');
          assume(json.message).equal(++counters.read);
        })
        .on('end', function () {
          assume(counters.write).equal(counters.read);
          logger.close();
          done();
        });
    }

    function writeNext() {
      if (counters.write < NUM_WRITES) {
        logger.info(++counters.write);
        setImmediate(writeNext);
      } else {
        logger.on('finish', finishWriting);
        logger.end();
      }
    }

    writeNext();
  })