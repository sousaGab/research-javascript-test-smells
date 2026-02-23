it('default levels', function (done) {
  const logger = winston.createLogger();
  const expected = { message: 'foo', level: 'debug' };

  function createFailingTransport(level) {
    return new TransportStream({
      level,
      log: function () {
        assume(false).equals(true, `Transport on level ${level} should never be called`);
      }
    });
  }

  function createAssertingTransport(level) {
    return new TransportStream({
      level,
      log: function (obj) {
        assume(obj.message).equals('foo');
        assume(obj.level).equals('debug');
        assume(JSON.parse(obj[MESSAGE])).deep.equals({ level: 'debug', message: 'foo' });
        done();
      }
    });
  }

  assume(logger.info).is.a('function');
  assume(logger.debug).is.a('function');

  logger
    .add(createFailingTransport('info'))
    .add(createAssertingTransport('debug'))
    .log(expected);
});