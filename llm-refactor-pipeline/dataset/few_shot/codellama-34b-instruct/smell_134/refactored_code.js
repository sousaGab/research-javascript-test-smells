it('should handle a high volume of writes with lazy option enabled', async () => {
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

    const interval = setInterval(() => {
      logger.info(++counters.write);
    }, 0);

    await new Promise((resolve) => {
      setTimeout(() => {
        clearInterval(interval);
        resolve();
      }, 10000);
    });

    const readStream = helpers.tryRead(fileStressLogFile);
    readStream.on('error', (err) => {
      assume(err).false();
      logger.close();
      done();
    });

    readStream.pipe(split()).on('data', (d) => {
      const json = JSON.parse(d);
      assume(json.level).equal('info');
      assume(json.message).equal(++counters.read);
    });

    readStream.on('end', () => {
      assume(counters.write).equal(counters.read);
      logger.close();
      done();
    });
  })