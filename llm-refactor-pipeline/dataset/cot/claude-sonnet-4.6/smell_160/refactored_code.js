it('default levels', function (done) {
      let logger = winston.createLogger();
      let expected = {message: 'foo', level: 'debug'};

      function logLevelTransport(level) {
        return new TransportStream({
          level: level,
          log: function (obj) {
            assume(obj.message).equals('foo');
            assume(obj.level).equals('debug');
            assume(JSON.parse(obj[MESSAGE])).deep.equals({level: 'debug', message: 'foo'});
            done();
          }
        });
      }

      function logLevelTransportInfo(level) {
        return new TransportStream({
          level: level,
          log: function (obj) {
            assume(obj).equals(undefined, 'Transport on level info should never be called');
          }
        });
      }

      assume(logger.info).is.a('function');
      assume(logger.debug).is.a('function');

      logger
          .add(logLevelTransportInfo('info'))
          .add(logLevelTransport('debug'))
          .log(expected);
    })