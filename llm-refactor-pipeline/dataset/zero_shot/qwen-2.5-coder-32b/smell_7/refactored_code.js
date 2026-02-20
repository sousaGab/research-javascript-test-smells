it("should set proper cache with clamped values", async () => {
  // Test case 1: cache_seconds = 200_000 (clamped to MAX)
  {
    let { req, res } = faker({ cache_seconds: 200_000 }, data_stats);
    await api(req, res);

    expect(res.setHeader.mock.calls).toEqual([
      ["Content-Type", "image/svg+xml"],
      [
        "Cache-Control",
        `max-age=${CACHE_TTL.STATS_CARD.MAX}, ` +
          `s-maxage=${CACHE_TTL.STATS_CARD.MAX}, ` +
          `stale-while-revalidate=${DURATIONS.ONE_DAY}`,
      ],
    ]);
  }

  // Test case 2: cache_seconds = 0 (already MIN)
  {
    let { req, res } = faker({ cache_seconds: 0 }, data_stats);
    await api(req, res);

    expect(res.setHeader.mock.calls).toEqual([
      ["Content-Type", "image/svg+xml"],
      [
        "Cache-Control",
        `max-age=${CACHE_TTL.STATS_CARD.MIN}, ` +
          `s-maxage=${CACHE_TTL.STATS_CARD.MIN}, ` +
          `stale-while-revalidate=${DURATIONS.ONE_DAY}`,
      ],
    ]);
  }

  // Test case 3: cache_seconds = -10_000 (clamped to MIN)
  {
    let { req, res } = faker({ cache_seconds: -10_000 }, data_stats);
    await api(req, res);

    expect(res.setHeader.mock.calls).toEqual([
      ["Content-Type", "image/svg+xml"],
      [
        "Cache-Control",
        `max-age=${CACHE_TTL.STATS_CARD.MIN}, ` +
          `s-maxage=${CACHE_TTL.STATS_CARD.MIN}, ` +
          `stale-while-revalidate=${DURATIONS.ONE_DAY}`,
      ],
    ]);
  }
})