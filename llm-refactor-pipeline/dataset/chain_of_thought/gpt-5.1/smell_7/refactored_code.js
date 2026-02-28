it("should set proper cache with clamped values", async () => {
  const assertCacheHeader = (res, expectedMaxAge) => {
    expect(res.setHeader.mock.calls).toEqual([
      ["Content-Type", "image/svg+xml"],
      [
        "Cache-Control",
        `max-age=${expectedMaxAge}, ` +
          `s-maxage=${expectedMaxAge}, ` +
          `stale-while-revalidate=${DURATIONS.ONE_DAY}`,
      ],
    ]);
  };

  {
    const { req, res } = faker({ cache_seconds: 200_000 }, data_stats);
    await api(req, res);
    assertCacheHeader(res, CACHE_TTL.STATS_CARD.MAX);
  }

  {
    const { req, res } = faker({ cache_seconds: 0 }, data_stats);
    await api(req, res);
    assertCacheHeader(res, CACHE_TTL.STATS_CARD.MIN);
  }

  {
    const { req, res } = faker({ cache_seconds: -10_000 }, data_stats);
    await api(req, res);
    assertCacheHeader(res, CACHE_TTL.STATS_CARD.MIN);
  }
});