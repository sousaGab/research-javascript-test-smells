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

  // Wait for the 'finish' event, which is emitted when the stream has been
  // fully flushed to the underlying transport. This provides a deterministic
  // way to know when it's safe to read the file.
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
        done();
      });
  });

  // Instead of an interval with a fixed timeout, write a large, fixed number
  // of logs in a tight loop to simulate high volume.
  const numWrites = 5000;
  for (let i = 1; i <= numWrites; i++) {
    logger.info(i);
  }
  counters.write = numWrites;

  // Calling end() on the logger flushes all transports and triggers the
  // 'finish' event when complete, removing the need for a non-deterministic sleep.
  logger.end();
});