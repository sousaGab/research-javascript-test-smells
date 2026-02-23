test('.parse throw error when some plugin fail', async () => {
  const server = createServer(
    { enabledPlugins: [octetstream, json] },
    async (ctx, form) => {
      let errorWasCaught = false;

      form.on('plugin', () => {
        ctx.__pluginsCount = ctx.__pluginsCount || 0;
        ctx.__pluginsCount += 1;
      });

      form.once('error', () => {
        throw new Error('error event should not be fired when plugin throw');
      });

      form.use(() => {
        throw new Error('custom plugin err');
      });

      try {
        await form.parse(ctx.req);
      } catch (err) {
        errorWasCaught = true;
        expect(err.code).toBe(errors.pluginFailed);
        expect(err.httpCode).toBe(500);
        expect(form._plugins.length).toBe(3);
        expect(ctx.__pluginsCount).toBe(2);
        expect(ctx.__pluginsResults).toBe(undefined);
      }

      if (!errorWasCaught) {
        throw new Error('Expected form.parse() to throw, but it did not.');
      }
    },
  );

  await request(server.callback())
    .post('/')
    .type('application/octet-stream')
    .attach('bin', fromFixtures('file', 'binaryfile.tar.gz'))
    .expect(200);
});