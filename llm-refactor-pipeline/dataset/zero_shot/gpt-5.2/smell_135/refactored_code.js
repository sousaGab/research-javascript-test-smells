it('should handle a high volume of large writes synchronous', function (done) {
  const logger = winston.createLogger({
    transports: [
      new winston.transports.File({
        filename: fileStressLogFile
      })
    ]
  });

  const counters = {
    write: 0,
    read: 0
  };

  const expectedMessage = 'a'.repeat(16384 - os.EOL.length - 1);

  const msgs = new Array(10).fill().map(() => ({
    counter: ++counters.write,
    message: expectedMessage
  }));

  msgs.forEach(msg => logger.info(msg));

  const fileTransport = logger.transports.find(t => t instanceof winston.transports.File);
  assume(fileTransport).truthy();

  fileTransport.once('finish', function () {
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
        assume(json.message).equal(expectedMessage);
        assume(json.counter).equal(++counters.read);
      })
      .on('end', function () {
        assume(counters.write).equal(counters.read);
        logger.close();
        done();
      });
  });

  logger.end();
});