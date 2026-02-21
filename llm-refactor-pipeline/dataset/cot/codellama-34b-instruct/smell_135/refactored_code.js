it('should handle a high volume of large writes synchronous', async () => {
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
    msgs.forEach(msg => logger.info(msg));

    const readStream = helpers.tryRead(fileStressLogFile);
    readStream.on('error', (err) => {
      assume(err).false();
      logger.close();
    });

    readStream.pipe(split())
      .on('data', (d) => {
        const json = JSON.parse(d);
        assume(json.level).equal('info');
        assume(json.message).equal('a'.repeat(16384 - os.EOL.length - 1));
        assume(json.counter).equal(++counters.read);
      })
      .on('end', () => {
        assume(counters.write).equal(counters.read);
        logger.close();
      });
  })