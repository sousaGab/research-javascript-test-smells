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

  const readAndAssert = () => {
    let sawAnyData = false;

    const stream = helpers.tryRead(fileStressLogFile)
      .on('error', function (err) {
        assume(err).false();
        logger.close();
        done();
      })
      .pipe(split())
      .on('data', function (d) {
        sawAnyData = true;
        const json = JSON.parse(d);
        assume(json.level).equal('info');
        assume(json.message).equal(expectedMessage);
        assume(json.counter).equal(++counters.read);
      })
      .on('end', function () {
        if (!sawAnyData || counters.read < counters.write) {
          return setImmediate(readAndAssert);
        }

        assume(counters.write).equal(counters.read);
        logger.close();
        done();
      });

    return stream;
  };

  readAndAssert();
});