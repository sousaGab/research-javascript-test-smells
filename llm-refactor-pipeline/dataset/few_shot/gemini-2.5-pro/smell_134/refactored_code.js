it('should handle a high volume of writes with lazy option enabled', function (done) {
    const logger = winston.createLogger({
      transports: [
        new winston.transports.File({
          filename: fileStressLogFile,
          lazy: true
        })
      ]
    });

    const totalWrites = 1000;
    let readCounter = 0;

    logger.on('finish', () => {
      helpers
        .tryRead(fileStressLogFile)
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
          assume(json.message).equal(String(++readCounter));
        })
        .on('end', function () {
          assume(totalWrites).equal(readCounter);
          done();
        });
    });

    for (let i = 1; i <= totalWrites; i++) {
      logger.info(String(i));
    }

    logger.close();
  })