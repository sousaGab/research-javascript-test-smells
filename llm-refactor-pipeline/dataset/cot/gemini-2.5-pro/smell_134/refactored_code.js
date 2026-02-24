it('should handle a high volume of writes with lazy option enabled', function (done) {
    const logger = winston.createLogger({
      transports: [
        new winston.transports.File({
          filename: fileStressLogFile,
          lazy: true
        })
      ]
    });

    const totalWrites = 5000; // A deterministic, high volume of logs
    const counters = {
      write: 0,
      read: 0
    };

    // The 'finish' event is emitted when all transports have finished logging.
    // This is our synchronization point.
    logger.on('finish', () => {
      helpers
        .tryRead(fileStressLogFile)
        .on('error', function (err) {
          assume(err).false();
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
          assume(counters.read).equal(totalWrites);
          done();
        });
    });

    // Write a large number of logs synchronously to the stream.
    for (let i = 1; i <= totalWrites; i++) {
      logger.info(i);
      counters.write++;
    }

    // End the logger stream. This will trigger the 'finish' event
    // after all logs have been flushed to the transport.
    logger.end();
  });