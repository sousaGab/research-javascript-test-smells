it('should handle a high volume of large writes synchronous', function (done) {
  const logger = winston.createLogger({
    transports: [
      new winston.transports.File({
        filename: fileStressLogFile
      })
    ]
  });

  const counters = {
    write: 0,
    read: 0
  };

  const expectedMessage = 'a'.repeat(16384 - os.EOL.length - 1);

  const msgs = new Array(10).fill().map(() => ({
    counter: ++counters.write,
    message: expectedMessage
  }));

  msgs.forEach(msg => logger.info(msg));

  const transport = logger.transports && logger.transports[0];

  const startReading = () => {
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
        assume(json.message).equal(expectedMessage);
        assume(json.counter).equal(++counters.read);
      })
      .on('end', function () {
        assume(counters.write).equal(counters.read);
        logger.close();
        done();
      });
  };

  // Synchronize on the transport finishing its writes instead of sleeping.
  if (transport && typeof transport.once === 'function') {
    transport.once('finish', startReading);
  } else if (logger && typeof logger.once === 'function') {
    logger.once('finish', startReading);
  } else {
    // Fallback: ensure pending writes are flushed before reading.
    logger.end(startReading);
  }

  // Trigger flush for transports that require ending the stream.
  if (typeof logger.end === 'function') {
    logger.end();
  }
});