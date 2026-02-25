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

  const numWrites = 5000;

  // The 'finish' event is emitted when all logs have been written and the
  // underlying stream has been closed. This is the deterministic way to
  // know when to start reading the file.
  logger.on('finish', () => {
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
        logger.close();
        done();
      });
  });

  // Write a large number of log entries in a tight loop.
  for (let i = 0; i < numWrites; i++) {
    logger.info(++counters.write);
  }

  // Signal to the logger that we are done writing. This will trigger the
  // stream to flush and eventually emit the 'finish' event.
  logger.end();
});