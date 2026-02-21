it("should set proper cache with clamped values", async () => {
  const assertCache = (req, res, expectedCacheControl) => {
    expect(res.setHeader.mock.calls).toEqual([
      ["Content-Type", "image/svg+xml"],
      ["Cache-Control", expectedCacheControl],
    ]);
  };

  {
    let { req, res } = faker({ cache_seconds: 200_000 }, data_stats);
    await api(req, res);

    assertCache(req, res, `max-age=${CACHE_TTL.STATS_CARD.MAX}, ` +
      `s-maxage=${CACHE_TTL.STATS_CARD.MAX}, ` +
      `stale-while-revalidate=${DURATIONS.ONE_DAY}`);
  }

  {
    let { req, res } = faker({ cache_seconds: 0 }, data_stats);
    await api(req, res);

    assertCache(req, res, `max-age=${CACHE_TTL.STATS_CARD.MIN}, ` +
      `s-maxage=${CACHE_TTL.STATS_CARD.MIN}, ` +
      `stale-while-revalidate=${DURATIONS.ONE_DAY}`);
  }

  {
    let { req, res } = faker({ cache_seconds: -10_000 }, data_stats);
    await api(req, res);

    assertCache(req, res, `max-age=${CACHE_TTL.STATS_CARD.MIN}, ` +
      `s-maxage=${CACHE_TTL.STATS_CARD.MIN}, ` +
      `stale-while-revalidate=${DURATIONS.ONE_DAY}`);
  }
});