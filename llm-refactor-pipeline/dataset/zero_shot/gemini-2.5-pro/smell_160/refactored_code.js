describe('default levels', function () {
  it('should log to a transport with a level at or below the message level', function (done) {
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
    logger.add(debugTransport).log(expected);
  });

  it('should NOT log to a transport with a level above the message level', function (done) {
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

    assume(logger.info).is.a('function');

    logger.on('finish', () => {
      done();
    });

    logger.add(infoTransport).log(expected);
  });
});