it('should handle a high volume of large writes synchronous', function (done) {
    const logger = winston.createLogger({
      transports: [new winston.transports.File({
        filename: fileStressLogFile
      })]
    });

    const counters = {
      write: 0,
      read: 0
    };

    const msgs = new Array(10).fill().map(() => ({
      counter: ++counters.write,
      message: 'a'.repeat(16384 - os.EOL.length - 1)
    }));
    
    let writeComplete = false;
    let readComplete = false;
    let doneCalled = false;

    const checkDone = () => {
      if (writeComplete && readComplete && !doneCalled) {
        doneCalled = true;
        logger.close();
        done();
      }
    };

    msgs.forEach(msg => logger.info(msg));

    // Wait for writes to complete by listening to the logger's drain event
    logger.on('finish', () => {
      writeComplete = true;
      checkDone();
    });

    // Handle file reading with proper error handling
    helpers.tryRead(fileStressLogFile)
      .on('error', function (err) {
        logger.close();
        done(err);
      })
      .pipe(split())
      .on('data', function (d) {
        const json = JSON.parse(d);
        assume(json.level).equal('info');
        assume(json.message).equal('a'.repeat(16384 - os.EOL.length - 1));
        assume(json.counter).equal(++counters.read);
      })
      .on('end', function () {
        readComplete = true;
        assume(counters.write).equal(counters.read);
        checkDone();
      });
  })