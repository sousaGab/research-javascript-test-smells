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

    setTimeout(function () {
      clearInterval(interval);
      
      // Wait for the file to be flushed and readable
      const checkFileReady = () => {
        fs.access(fileStressLogFile, fs.constants.F_OK, (err) => {
          if (err) {
            // File not ready yet, try again
            setImmediate(checkFileReady);
          } else {
            // File exists, now read it
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
          }
        });
      };
      
      checkFileReady();
    }, 100);
  })