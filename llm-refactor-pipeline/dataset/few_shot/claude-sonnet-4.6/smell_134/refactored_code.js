it('should handle a high volume of writes with lazy option enabled', async function () {
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

    await new Promise(function (resolve) {
      const interval = setInterval(function () {
        logger.info(++counters.write);
      }, 0);

      logger.once('finish', resolve);

      setImmediate(function () {
        clearInterval(interval);
        logger.end();
      });
    });

    await new Promise(function (resolve, reject) {
      helpers
        .tryRead(fileStressLogFile)
        .on('error', function (err) {
          assume(err).false();
          logger.close();
          resolve();
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
          resolve();
        })
        .on('error', reject);
    });
  });