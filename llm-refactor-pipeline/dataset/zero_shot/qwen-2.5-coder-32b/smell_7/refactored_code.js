it("should set proper cache with clamped values", async () => {
  const testCases = [
    { cache_seconds: 200_000, expectedMaxAge: CACHE_TTL.STATS_CARD.MAX },
    { cache_seconds: 0, expectedMaxAge: CACHE_TTL.STATS_CARD.MIN },
    { cache_seconds: -10_000, expectedMaxAge: CACHE_TTL.STATS_CARD.MIN },
  ];

  for (const { cache_seconds, expectedMaxAge } of testCases) {
    let { req, res } = faker({ cache_seconds }, data_stats);
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