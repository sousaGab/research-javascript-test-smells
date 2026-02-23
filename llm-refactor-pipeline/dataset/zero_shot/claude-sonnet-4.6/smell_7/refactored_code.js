it("should set proper cache with clamped values", async () => {
    const testCases = [
      { cache_seconds: 200_000, expectedTTL: CACHE_TTL.STATS_CARD.MAX },
      { cache_seconds: 0, expectedTTL: CACHE_TTL.STATS_CARD.MIN },
      { cache_seconds: -10_000, expectedTTL: CACHE_TTL.STATS_CARD.MIN },
    ];

    for (const { cache_seconds, expectedTTL } of testCases) {
      let { req, res } = faker({ cache_seconds }, data_stats);
      await api(req, res);

      expect(res.setHeader.mock.calls).toEqual([
        ["Content-Type", "image/svg+xml"],
        [
          "Cache-Control",
          `max-age=${expectedTTL}, ` +
            `s-maxage=${expectedTTL}, ` +
            `stale-while-revalidate=${DURATIONS.ONE_DAY}`,
        ],
      ]);
    }
  })