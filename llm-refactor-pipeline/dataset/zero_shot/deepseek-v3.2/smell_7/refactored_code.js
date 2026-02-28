it("should set proper cache with clamped values", async () => {
  const testCases = [
    {
      cache_seconds: 200_000,
      expectedMaxAge: CACHE_TTL.STATS_CARD.MAX,
      description: "large cache_seconds should use MAX"
    },
    {
      cache_seconds: 0,
      expectedMaxAge: CACHE_TTL.STATS_CARD.MIN,
      description: "zero cache_seconds should use MIN"
    },
    {
      cache_seconds: -10_000,
      expectedMaxAge: CACHE_TTL.STATS_CARD.MIN,
      description: "negative cache_seconds should use MIN"
    }
  ];

  for (const testCase of testCases) {
    const { req, res } = faker({ cache_seconds: testCase.cache_seconds }, data_stats);
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
})