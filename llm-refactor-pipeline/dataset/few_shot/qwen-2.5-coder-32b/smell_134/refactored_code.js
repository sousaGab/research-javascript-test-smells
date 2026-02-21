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

    let writesCompleted = false;
    let readsCompleted = false;

    const interval = setInterval(function () {
      logger.info(++counters.write);
    }, 0);

    const checkCompletion = () => {
      if (writesCompleted && readsCompleted) {
        logger.close();
        done();
      }
    };

    setTimeout(function () {
      clearInterval(interval);
      writesCompleted = true;
      
      helpers
        .tryRead(fileStressLogFile)
        .on('error', function (err) {
          assume(err).false();
          logger.close();
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
          readsCompleted = true;
          checkCompletion();
        });
    }, 10000);
  })