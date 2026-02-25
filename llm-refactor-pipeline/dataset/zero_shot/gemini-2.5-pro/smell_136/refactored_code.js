it('should handle a high volume of large writes', function (done) {
    const NUM_WRITES = 500;
    const fileTransport = new winston.transports.File({
      filename: fileStressLogFile
    });

    const logger = winston.createLogger({
      transports: [fileTransport]
    });

    const counters = {
      read: 0
    };

    const largeMessage = 'a'.repeat(16384 - os.EOL.length - 1);

    fileTransport.on('finish', function () {
      helpers.tryRead(fileStressLogFile)
        .on('error', function (err) {
          assume(err).false();
          done();
        })
        .pipe(split())
        .on('data', function (d) {
          const json = JSON.parse(d);
          assume(json.level).equal('info');
          assume(json.message).equal(largeMessage);
          assume(json.counter).equal(++counters.read);
        })
        .on('end', function () {
          assume(counters.read).equal(NUM_WRITES);
          done();
        });
    });

    for (let i = 1; i <= NUM_WRITES; i++) {
      const msg = {
        counter: i,
        message: largeMessage
      };
      logger.info(msg);
    }

    logger.end();
  });