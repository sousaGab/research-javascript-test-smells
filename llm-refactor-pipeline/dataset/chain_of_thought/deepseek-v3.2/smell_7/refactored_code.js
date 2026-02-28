it("should set proper cache with clamped values", async () => {
  const testCases = [
    {
      description: "cache_seconds above max",
      cacheSeconds: 200_000,
      expectedMaxAge: CACHE_TTL.STATS_CARD.MAX,
    },
    {
      description: "cache_seconds at zero",
      cacheSeconds: 0,
      expectedMaxAge: CACHE_TTL.STATS_CARD.MIN,
    },
    {
      description: "cache_seconds negative",
      cacheSeconds: -10_000,
      expectedMaxAge: CACHE_TTL.STATS_CARD.MIN,
    },
  ];

  for (const testCase of testCases) {
    const { req, res } = faker({ cache_seconds: testCase.cacheSeconds }, data_stats);
    await api(req, res);

    expect(res.setHeader.mock.calls).toEqual([
      ["Content-Type", "image/svg+xml"],
      [
        "Cache-Control",
        `max-age=${testCase.expectedMaxAge}, ` +
          `s-maxage=${testCase.expectedMaxAge}, ` +
          `stale-while-revalidate=${DURATIONS.ONE_DAY}`,
      ],
    ]);
  }
});