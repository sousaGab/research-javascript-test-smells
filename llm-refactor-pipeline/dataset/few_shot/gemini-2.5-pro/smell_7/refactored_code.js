describe("cache clamping", () => {
  it.each([
    {
      cacheSeconds: 200_000,
      expectedTtl: CACHE_TTL.STATS_CARD.MAX,
      description: "over the max",
    },
    {
      cacheSeconds: 0,
      expectedTtl: CACHE_TTL.STATS_CARD.MIN,
      description: "the minimum",
    },
    {
      cacheSeconds: -10_000,
      expectedTtl: CACHE_TTL.STATS_CARD.MIN,
      description: "below the minimum",
    },
  ])("should set cache to $expectedTtl when cache_seconds is $description", async ({ cacheSeconds, expectedTtl }) => {
    const { req, res } = faker({ cache_seconds: cacheSeconds }, data_stats);
    await api(req, res);

    const expectedCacheHeader =
      `max-age=${expectedTtl}, ` +
      `s-maxage=${expectedTtl}, ` +
      `stale-while-revalidate=${DURATIONS.ONE_DAY}`;

    expect(res.setHeader.mock.calls).toEqual([
      ["Content-Type", "image/svg+xml"],
      ["Cache-Control", expectedCacheHeader],
    ]);
  });
});