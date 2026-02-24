it('should handle a high volume of large writes', function (done) {
    const logger = winston.createLogger({
      transports: [new winston.transports.File({
        filename: fileStressLogFile
      })]
    });

    const totalWrites = 1000;
    let readCounter = 0;
    const messageContent = 'a'.repeat(16384 - os.EOL.length - 1);

    logger.on('finish', () => {
      helpers.tryRead(fileStressLogFile)
        .on('error', function (err) {
          assume(err).false();
          done();
        })
        .pipe(split())
        .on('data', function (d) {
          const json = JSON.parse(d);
          assume(json.level).equal('info');
          assume(json.message).equal(messageContent);
          assume(json.counter).equal(++readCounter);
        })
        .on('end', function () {
          assume(readCounter).equal(totalWrites);
          done();
        });
    });

    for (let i = 1; i <= totalWrites; i++) {
      const msg = {
        counter: i,
        message: messageContent
      };
      logger.info(msg);
    }

    logger.end();
  });