describe('default levels', function () {
  it('should log to a transport with a matching level', function (done) {
    let logger = winston.createLogger();
    let expected = { message: 'foo', level: 'debug' };

    let debugTransport = new TransportStream({
      level: 'debug',
      log: function (obj) {
        assume(obj.message).equals('foo');
        assume(obj.level).equals('debug');
        assume(JSON.parse(obj[MESSAGE])).deep.equals({ level: 'debug', message: 'foo' });
        done();
      }
    });

    assume(logger.debug).is.a('function');

    logger
      .add(debugTransport)
      .log(expected);
  });

  it('should not log to a transport with a higher level', function (done) {
    let logger = winston.createLogger();
    let expected = { message: 'foo', level: 'debug' };

    let infoTransport = new TransportStream({
      level: 'info',
      log: function () {
        done(new Error('Transport on level info should never be called'));
      }
    });

    // A control transport to signal the end of the async test
    let controlTransport = new TransportStream({
      level: 'debug',
      log: function () {
        done();
      }
    });

    assume(logger.info).is.a('function');

    logger
      .add(infoTransport)
      .add(controlTransport)
      .log(expected);
  });
});