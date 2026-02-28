test('.parse throw error when some plugin fail', async () => {
  const server = createServer(
    { enabledPlugins: [octetstream, json] },
    async (ctx, form) => {
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

      await expect(form.parse(ctx.req)).rejects.toMatchObject({
        code: errors.pluginFailed,
        httpCode: 500
      });

      expect(form._plugins.length).toBe(3);
      expect(ctx.__pluginsCount).toBe(2);
      expect(ctx.__pluginsResults).toBe(undefined);
    },
  );

  await new Promise((resolve, reject) => {
    request(server.callback())
      .post('/')
      .type('application/octet-stream')
      .attach('bin', fromFixtures('file', 'binaryfile.tar.gz'))
      .end((err) => (err ? reject(err) : resolve()));
  });
});