it('default levels', function (done) {
  let logger = winston.createLogger();
  let expected = { message: 'foo', level: 'debug' };

  function debugTransport() {
    return new TransportStream({
      level: 'debug',
      log: function (obj) {
        assume(obj.message).equals('foo');
        assume(obj.level).equals('debug');
        assume(JSON.parse(obj[MESSAGE])).deep.equals({ level: 'debug', message: 'foo' });
        done();
      }
    });
  }

  function infoTransportShouldNotBeCalled() {
    return new TransportStream({
      level: 'info',
      log: function () {
        assume(undefined).equals(undefined, 'Transport on level info should never be called');
      }
    });
  }

  assume(logger.info).is.a('function');
  assume(logger.debug).is.a('function');

  logger.add(infoTransportShouldNotBeCalled()).add(debugTransport()).log(expected);
});