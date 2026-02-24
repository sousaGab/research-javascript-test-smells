describe('default levels', function () {
  it('should log to a transport with a matching level', function (done) {
    const logger = winston.createLogger();
    const expected = {
      message: 'foo',
      level: 'debug'
    };

    const debugTransport = new TransportStream({
      level: 'debug',
      log: function (obj) {
        assume(obj.message).equals('foo');
        assume(obj.level).equals('debug');
        assume(JSON.parse(obj[MESSAGE])).deep.equals({
          level: 'debug',
          message: 'foo'
        });
        done();
      }
    });

    assume(logger.debug).is.a('function');

    logger.add(debugTransport);
    logger.log(expected);
  });

  it('should not log to a transport with a higher level', function (done) {
    const logger = winston.createLogger();
    const expected = {
      message: 'foo',
      level: 'debug'
    };

    const infoTransport = new TransportStream({
      level: 'info',
      log: function () {
        done(new Error('Transport on level info should never be called'));
      }
    });

    // This transport acts as a signal that the log operation is complete.
    // If it gets called and the infoTransport was not, the test passes.
    const debugTransport = new TransportStream({
      level: 'debug',
      log: function () {
        done();
      }
    });

    assume(logger.info).is.a('function');

    logger.add(infoTransport);
    logger.add(debugTransport);
    logger.log(expected);
  });
});