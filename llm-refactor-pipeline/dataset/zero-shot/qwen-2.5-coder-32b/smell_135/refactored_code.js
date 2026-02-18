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
    
    let writesComplete = false;
    let readsComplete = false;
    let doneCalled = false;

    const checkDone = () => {
      if (writesComplete && readsComplete && !doneCalled) {
        doneCalled = true;
        logger.close();
        done();
      }
    };

    msgs.forEach(msg => logger.info(msg));

    // Listen for write completion by checking file size or using a more reliable method
    const waitForWrites = () => {
      fs.stat(fileStressLogFile, (err, stats) => {
        if (err || stats.size === 0) {
          setTimeout(waitForWrites, 100);
        } else {
          writesComplete = true;
          checkDone();
        }
      });
    };

    setTimeout(() => {
      waitForWrites();
    }, 100);

    helpers.tryRead(fileStressLogFile)
      .on('error', function (err) {
        assume(err).false();
        logger.close();
        done();
      })
      .pipe(split())
      .on('data', function (d) {
        const json = JSON.parse(d);
        assume(json.level).equal('info');
        assume(json.message).equal('a'.repeat(16384 - os.EOL.length - 1));
        assume(json.counter).equal(++counters.read);
      })
      .on('end', function () {
        readsComplete = true;
        checkDone();
      });
  })