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

  const interval = setInterval(function () {
    logger.info(++counters.write);
  }, 0);

  function cleanupAndDone(err) {
    clearInterval(interval);
    logger.close();
    done(err);
  }

  function readAndAssert() {
    let settled = false;

    const stream = helpers.tryRead(fileStressLogFile);

    stream.on('error', function (err) {
      if (settled) return;
      settled = true;
      assume(err).false();
      cleanupAndDone();
    });

    stream
      .pipe(split())
      .on('data', function (d) {
        const json = JSON.parse(d);
        assume(json.level).equal('info');
        assume(json.message).equal(++counters.read);
      })
      .on('end', function () {
        if (settled) return;
        settled = true;
        assume(counters.write).equal(counters.read);
        cleanupAndDone();
      });
  }

  // Stop writing once the transport has actually opened, then read immediately.
  const transport = logger.transports && logger.transports[0];
  if (transport && typeof transport.once === 'function') {
    transport.once('open', function () {
      clearInterval(interval);
      readAndAssert();
    });
  } else {
    // Fallback: if transport doesn't expose 'open', stop after first successful write callback.
    logger.info(++counters.write, function () {
      clearInterval(interval);
      readAndAssert();
    });
  }
});