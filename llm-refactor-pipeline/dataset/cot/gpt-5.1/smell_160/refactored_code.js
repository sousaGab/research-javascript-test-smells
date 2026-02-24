it('default levels', function (done) {
  let logger = winston.createLogger();
  let expected = { message: 'foo', level: 'debug' };

  let infoCalled = false;

  const infoLevelTransport = new TransportStream({
    level: 'info',
    log: function (obj) {
      infoCalled = true;
    }
  });

  const debugLevelTransport = new TransportStream({
    level: 'debug',
    log: function (obj) {
      assume(obj.message).equals('foo');
      assume(obj.level).equals('debug');
      assume(JSON.parse(obj[MESSAGE])).deep.equals({ level: 'debug', message: 'foo' });
      assume(infoCalled).equals(false, 'Transport on level info should never be called');
      done();
    }
  });

  assume(logger.info).is.a('function');
  assume(logger.debug).is.a('function');

  logger
    .add(infoLevelTransport)
    .add(debugLevelTransport)
    .log(expected);
});