it('default levels', function (done) {
  let logger = winston.createLogger();
  let expected = {message: 'foo', level: 'debug'};
  let transportCalled = false;

  function createTransport(level, shouldBeCalled) {
    return new TransportStream({
      level: level,
      log: function (obj) {
        assume(shouldBeCalled).is.true('Transport on level ' + level + ' should be called');
        assume(obj.message).equals('foo');
        assume(obj.level).equals('debug');
        assume(JSON.parse(obj[MESSAGE])).deep.equals({level: 'debug', message: 'foo'});
        
        if (!transportCalled) {
          transportCalled = true;
          done();
        }
      }
    });
  }

  assume(logger.info).is.a('function');
  assume(logger.debug).is.a('function');

  logger
    .add(createTransport('info', false))
    .add(createTransport('debug', true))
    .log(expected);
});