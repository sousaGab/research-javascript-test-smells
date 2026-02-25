it.each([
  { cacheSeconds: 200_000, expectedTtl: CACHE_TTL.STATS_CARD.MAX },
  { cacheSeconds: 0, expectedTtl: CACHE_TTL.STATS_CARD.MIN },
  { cacheSeconds: -10_000, expectedTtl: CACHE_TTL.STATS_CARD.MIN },
])(
  "should set proper cache with clamped value for cache_seconds=$cacheSeconds",
  async ({ cacheSeconds, expectedTtl }) => {
    const { req, res } = faker({ cache_seconds: cacheSeconds }, data_stats);
    await api(req, res);

    expect(res.setHeader.mock.calls).toEqual([
      ["Content-Type", "image/svg+xml"],
      [
        "Cache-Control",
        `max-age=${expectedTtl}, s-maxage=${expectedTtl}, stale-while-revalidate=${DURATIONS.ONE_DAY}`,
      ],
    ]);
  },
);