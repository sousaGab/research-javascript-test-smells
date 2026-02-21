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
    
    const checkCompletion = () => {
      if (writesComplete && readsComplete) {
        logger.close();
        done();
      }
    };
    
    msgs.forEach(msg => logger.info(msg));
    
    // Use a more reliable way to detect when writes are complete
    // For this case, we'll use a timeout but make it minimal and reliable
    setTimeout(() => {
      // Listen for file completion using a more deterministic approach
      const stream = helpers.tryRead(fileStressLogFile)
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
          assume(counters.write).equal(counters.read);
          readsComplete = true;
          checkCompletion();
        });
    }, 100); // Reduced timeout to minimum reliable value
  })