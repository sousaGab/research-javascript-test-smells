test('.parse throws error when a plugin fails', async () => {
  const server = createServer(
    { enabledPlugins: [octetstream, json] },
    async (ctx, form) => {
      form.on('plugin', () => {
        ctx.__pluginsCount = ctx.__pluginsCount || 0;
        ctx.__pluginsCount += 1;
      });

      form.once('error', () => {
        throw new Error('error event should not be fired when plugin throws');
      });

      form.use(() => {
        throw new Error('custom plugin err');
      });

      let result = null;
      try {
        await form.parse(ctx.req);
      } catch (err) {
        expect(err.code).toBe(errors.pluginFailed);
        expect(err.httpCode).toBe(500);

        expect(form._plugins.length).toBe(3);
        expect(ctx.__pluginsCount).toBe(2);
        expect(ctx.__pluginsResults).toBe(undefined);

        result = err;
      }

      if (!result) {
        throw new Error('.parse should throw and be caught by the try/catch');
      }
    },
  );

  return new Promise((resolve, reject) => {
    request(server.callback())
      .post('/')
      .type('application/octet-stream')
      .attach('bin', fromFixtures('file', 'binaryfile.tar.gz'))
      .end((err) => (err ? reject(err) : resolve()));
  });
});