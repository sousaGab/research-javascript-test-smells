it('should handle a high volume of large writes', async () => {
    const logger = winston.createLogger({
      transports: [new winston.transports.File({
        filename: fileStressLogFile
      })]
    });

    const counters = {
      write: 0,
      read: 0
    };

    const interval = setInterval(() => {
      const msg = {
        counter: ++counters.write,
        message: 'a'.repeat(16384 - os.EOL.length - 1)
      };
      logger.info(msg);
    }, 0);

    await new Promise((resolve) => setTimeout(resolve, 10000));

    clearInterval(interval);

    const readStream = helpers.tryRead(fileStressLogFile);
    readStream.on('error', (err) => {
      assume(err).false();
      logger.close();
      done();
    });

    readStream.pipe(split()).on('data', (d) => {
      const json = JSON.parse(d);
      assume(json.level).equal('info');
      assume(json.message).equal('a'.repeat(16384 - os.EOL.length - 1));
      assume(json.counter).equal(++counters.read);
    });

    readStream.on('end', () => {
      assume(counters.write).equal(counters.read);
      logger.close();
      done();
    });
  });