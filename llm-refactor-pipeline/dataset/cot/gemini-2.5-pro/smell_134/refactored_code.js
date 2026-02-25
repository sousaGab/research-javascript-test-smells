it('should handle a high volume of writes with lazy option enabled', function (done) {
    const logger = winston.createLogger({
      transports: [
        new winston.transports.File({
          filename: fileStressLogFile,
          lazy: true
        })
      ]
    });

    const totalWrites = 5000; // A large, but deterministic, number of writes.
    let readCount = 0;

    // The 'finish' event is emitted after all logs have been written.
    // This is the synchronization point that replaces the fixed timeout.
    logger.on('finish', () => {
      helpers
        .tryRead(fileStressLogFile)
        .on('error', (err) => {
          assume(err).false();
          done();
        })
        .pipe(split())
        .on('data', (d) => {
          const json = JSON.parse(d);
          assume(json.level).equal('info');
          assume(json.message).equal(++readCount);
        })
        .on('end', () => {
          assume(totalWrites).equal(readCount);
          done();
        });
    });

    // Queue all log writes synchronously.
    for (let i = 1; i <= totalWrites; i++) {
      logger.info(i);
    }

    // Close the logger. This flushes the stream and triggers the 'finish' event
    // once all writes are complete.
    logger.close();
  });