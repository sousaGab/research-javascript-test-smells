it('should handle a high volume of large writes', function (done) {
    const logger = winston.createLogger({
      transports: [new winston.transports.File({
        filename: fileStressLogFile
      })]
    });

    const numWrites = 500;
    let numReads = 0;
    const largeMessage = 'a'.repeat(16384 - os.EOL.length - 1);

    logger.on('finish', () => {
      helpers.tryRead(fileStressLogFile)
        .on('error', function (err) {
          assume(err).false();
          done();
        })
        .pipe(split())
        .on('data', function (d) {
          if (!d) {
            return;
          }
          const json = JSON.parse(d);
          assume(json.level).equal('info');
          assume(json.message).equal(largeMessage);
          assume(json.counter).equal(++numReads);
        })
        .on('end', function () {
          assume(numWrites).equal(numReads);
          done();
        });
    });

    for (let i = 1; i <= numWrites; i++) {
      const msg = {
        counter: i,
        message: largeMessage
      };
      logger.info(msg);
    }

    logger.end();
  });