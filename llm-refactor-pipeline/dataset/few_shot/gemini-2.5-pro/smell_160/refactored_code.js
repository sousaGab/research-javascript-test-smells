it('default levels', function (done) {
      let logger = winston.createLogger();
      let expected = {message: 'foo', level: 'debug'};

      const infoTransport = new TransportStream({
        level: 'info',
        log: function () {
          done(new Error('Transport on level info should never be called'));
        }
      });

      const debugTransport = new TransportStream({
        level: 'debug',
        log: function (obj) {
          assume(obj.message).equals('foo');
          assume(obj.level).equals('debug');
          assume(JSON.parse(obj[MESSAGE])).deep.equals({level: 'debug', message: 'foo'});
          done();
        }
      });

      assume(logger.info).is.a('function');
      assume(logger.debug).is.a('function');

      logger
          .add(infoTransport)
          .add(debugTransport)
          .log(expected);
    })