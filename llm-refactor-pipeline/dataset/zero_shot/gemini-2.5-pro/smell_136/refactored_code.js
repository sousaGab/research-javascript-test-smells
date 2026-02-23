it('should handle a high volume of large writes', function (done) {
  const logger = winston.createLogger({
    transports: [new winston.transports.File({
      filename: fileStressLogFile
    })]
  });

  const NUM_WRITES = 1000;
  const counters = {
    write: 0,
    read: 0
  };
  const expectedMessage = 'a'.repeat(16384 - os.EOL.length - 1);

  // The 'finish' event is emitted after all data has been flushed to the underlying stream.
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
        assume(json.message).equal(expectedMessage);
        assume(json.counter).equal(++counters.read);
      })
      .on('end', function () {
        assume(counters.write).equal(counters.read);
        done();
      });
  });

  // Queue a large number of write operations.
  for (let i = 0; i < NUM_WRITES; i++) {
    const msg = {
      counter: ++counters.write,
      message: expectedMessage
    };
    logger.info(msg);
  }

  // Calling close() will trigger the 'finish' event once all writes are done.
  logger.close();
});