it('default levels', function (done) {
  let logger = winston.createLogger();
  let expected = { message: 'foo', level: 'debug' };

  let infoCalled = false;
  let debugCalled = false;

  function createInfoLevelTransport() {
    return new TransportStream({
      level: 'info',
      log: function (obj) {
        infoCalled = true;
        assume(obj).equals(undefined, 'Transport on level info should never be called');
      }
    });
  }

  function createDebugLevelTransport() {
    return new TransportStream({
      level: 'debug',
      log: function (obj) {
        debugCalled = true;
        assume(obj.message).equals('foo');
        assume(obj.level).equals('debug');
        assume(JSON.parse(obj[MESSAGE])).deep.equals({ level: 'debug', message: 'foo' });
        assume(infoCalled).is.false('Transport on level info should never be called');
        done();
      }
    });
  }

  assume(logger.info).is.a('function');
  assume(logger.debug).is.a('function');

  logger
    .add(createInfoLevelTransport())
    .add(createDebugLevelTransport())
    .log(expected);
});