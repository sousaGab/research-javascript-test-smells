// Your COMPLETE refactored test code here

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

    await new Promise(resolve => setTimeout(resolve, 10000));

    clearInterval(interval);

    const logFile = await helpers.tryRead(fileStressLogFile);
    const logLines = logFile.split('\n');

    logLines.forEach(line => {
      const json = JSON.parse(line);
      assume(json.level).equal('info');
      assume(json.message).equal(++counters.read);
    });

    assume(counters.write).equal(counters.read);
    logger.close();
});