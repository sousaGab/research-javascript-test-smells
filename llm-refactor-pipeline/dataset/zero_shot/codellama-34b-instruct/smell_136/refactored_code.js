it('should handle a high volume of large writes', async function () {
  const logger = winston.createLogger({
    transports: [new winston.transports.File({
      filename: fileStressLogFile
    })]
  });

  const counters = {
    write: 0,
    read: 0
  };

  const interval = setInterval(async function () {
    const msg = {
      counter: ++counters.write,
      message: 'a'.repeat(16384 - os.EOL.length - 1)
    };
    await logger.info(msg);
  }, 0);

  await new Promise((resolve, reject) => {
    setTimeout(async function () {
      clearInterval(interval);

      try {
        const data = await helpers.tryRead(fileStressLogFile);
        const json = JSON.parse(data);
        assume(json.level).equal('info');
        assume(json.message).equal('a'.repeat(16384 - os.EOL.length - 1));
        assume(json.counter).equal(++counters.read);
        logger.close();
        resolve();
      } catch (err) {
        reject(err);
      }
    }, 10000);
  });

  assume(counters.write).equal(counters.read);
  logger.close();
});