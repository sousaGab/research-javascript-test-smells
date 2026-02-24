it("should set proper cache with clamped values", async () => {
  const scenarios = [
    {
      cacheSeconds: 200_000,
      expectedMaxAge: CACHE_TTL.STATS_CARD.MAX,
    },
    {
      cacheSeconds: 0,
      expectedMaxAge: CACHE_TTL.STATS_CARD.MIN,
    },
    {
      cacheSeconds: -10_000,
      expectedMaxAge: CACHE_TTL.STATS_CARD.MIN,
    },
  ];

  for (const { cacheSeconds, expectedMaxAge } of scenarios) {
    const { req, res } = faker({ cache_seconds: cacheSeconds }, data_stats);
    await api(req, res);

    expect(res.setHeader.mock.calls).toEqual([
      ["Content-Type", "image/svg+xml"],
      [
        "Cache-Control",
        `max-age=${expectedMaxAge}, ` +
          `s-maxage=${expectedMaxAge}, ` +
          `stale-while-revalidate=${DURATIONS.ONE_DAY}`,
      ],
    ]);
  }
});