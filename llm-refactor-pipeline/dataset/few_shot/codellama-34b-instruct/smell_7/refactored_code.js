it("should set proper cache with clamped values", async () => {
    const cache_seconds = [200_000, 0, -10_000];
    const expected_cache_control = [
      `max-age=${CACHE_TTL.STATS_CARD.MAX}, ` +
        `s-maxage=${CACHE_TTL.STATS_CARD.MAX}, ` +
        `stale-while-revalidate=${DURATIONS.ONE_DAY}`,
      `max-age=${CACHE_TTL.STATS_CARD.MIN}, ` +
        `s-maxage=${CACHE_TTL.STATS_CARD.MIN}, ` +
        `stale-while-revalidate=${DURATIONS.ONE_DAY}`,
      `max-age=${CACHE_TTL.STATS_CARD.MIN}, ` +
        `s-maxage=${CACHE_TTL.STATS_CARD.MIN}, ` +
        `stale-while-revalidate=${DURATIONS.ONE_DAY}`,
    ];

    for (let i = 0; i < cache_seconds.length; i++) {
      const { req, res } = faker({ cache_seconds: cache_seconds[i] }, data_stats);
      await api(req, res);

      expect(res.setHeader.mock.calls).toEqual([
        ["Content-Type", "image/svg+xml"],
        ["Cache-Control", expected_cache_control[i]],
      ]);
    }
  })