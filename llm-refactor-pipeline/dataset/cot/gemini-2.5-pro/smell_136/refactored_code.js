it('should handle a high volume of large writes', function (done) {
    const logger = winston.createLogger({
      transports: [new winston.transports.File({
        filename: fileStressLogFile
      })]
    });

    const numWrites = 1000; // A fixed, large number for a deterministic test
    let readCounter = 0;
    const largeMessage = 'a'.repeat(16384 - os.EOL.length - 1);

    // 1. Wait for the logger to finish writing all entries to the file.
    logger.on('finish', () => {
      // 2. Once writes are flushed, read the file to verify its contents.
      helpers.tryRead(fileStressLogFile)
        .on('error', function (err) {
          assume(err).false();
          logger.close();
          done(err);
        })
        .pipe(split())
        .on('data', function (d) {
          const json = JSON.parse(d);
          assume(json.level).equal('info');
          assume(json.message).equal(largeMessage);
          assume(json.counter).equal(++readCounter);
        })
        .on('end', function () {
          assume(numWrites).equal(readCounter);
          logger.close();
          done();
        });
    });

    // 3. Queue all log messages synchronously.
    for (let i = 1; i <= numWrites; i++) {
      logger.info({
        counter: i,
        message: largeMessage
      });
    }

    // 4. Signal that no more writes will be queued, triggering the 'finish' event once done.
    logger.end();
  });