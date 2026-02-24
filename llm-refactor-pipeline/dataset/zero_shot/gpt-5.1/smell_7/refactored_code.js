it("should set proper cache with clamped values", async () => {
  const scenarios = [
    {
      input: { cache_seconds: 200_000 },
      expectedMaxAge: CACHE_TTL.STATS_CARD.MAX,
    },
    {
      input: { cache_seconds: 0 },
      expectedMaxAge: CACHE_TTL.STATS_CARD.MIN,
    },
    {
      input: { cache_seconds: -10_000 },
      expectedMaxAge: CACHE_TTL.STATS_CARD.MIN,
    },
  ];

  for (const { input, expectedMaxAge } of scenarios) {
    const { req, res } = faker(input, data_stats);
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