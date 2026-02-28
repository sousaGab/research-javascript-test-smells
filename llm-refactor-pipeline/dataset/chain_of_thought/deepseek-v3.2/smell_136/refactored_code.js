it('should handle a high volume of large writes', function (done) {
  const logger = winston.createLogger({
    transports: [new winston.transports.File({
      filename: fileStressLogFile
    })]
  });

  const counters = {
    write: 0,
    read: 0
  };

  const writePromises = [];
  const interval = setInterval(function () {
    const msg = {
      counter: ++counters.write,
      message: 'a'.repeat(16384 - os.EOL.length - 1)
    };
    
    const writePromise = new Promise((resolve) => {
      logger.info(msg, () => {
        resolve();
      });
    });
    writePromises.push(writePromise);
  }, 0);

  // Stop writing after a reasonable number of writes instead of fixed time
  const maxWrites = 100;
  const stopWriting = function () {
    clearInterval(interval);
    Promise.all(writePromises).then(() => {
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
          assume(counters.write).equal(counters.read);
          logger.close();
          done();
        });
    });
  };

  // Monitor write count instead of using fixed timeout
  const checkInterval = setInterval(() => {
    if (counters.write >= maxWrites) {
      clearInterval(checkInterval);
      stopWriting();
    }
  }, 10);
});