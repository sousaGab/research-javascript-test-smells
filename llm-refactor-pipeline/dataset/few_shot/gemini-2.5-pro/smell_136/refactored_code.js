it('should handle a high volume of large writes', function (done) {
    const logger = winston.createLogger({
      transports: [new winston.transports.File({
        filename: fileStressLogFile
      })]
    });

    const TOTAL_WRITES = 1000;
    const counters = {
      write: 0,
      read: 0
    };
    const messageContent = 'a'.repeat(16384 - os.EOL.length - 1);

    // When the logger stream has finished writing all data, start reading.
    logger.on('finish', () => {
      helpers.tryRead(fileStressLogFile)
        .on('error', function (err) {
          assume(err).false();
          logger.close();
          done(err);
        })
        .pipe(split())
        .on('data', function (d) {
          if (!d) {
            return; // Ignore empty lines from split
          }
          const json = JSON.parse(d);
          assume(json.level).equal('info');
          assume(json.message).equal(messageContent);
          assume(json.counter).equal(++counters.read);
        })
        .on('end', function () {
          assume(counters.write).equal(counters.read);
          assume(counters.read).equal(TOTAL_WRITES);
          logger.close();
          done();
        });
    });

    // Queue up a deterministic number of log writes.
    for (let i = 0; i < TOTAL_WRITES; i++) {
      logger.info({
        counter: ++counters.write,
        message: messageContent
      });
    }

    // Signal that no more writes will be queued, triggering the 'finish' event
    // once the buffer is flushed.
    logger.end();
  });