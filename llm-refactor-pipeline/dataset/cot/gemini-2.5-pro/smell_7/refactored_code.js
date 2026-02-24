it("should set proper cache with clamped values", async () => {
  // Test clamping to MAX
  {
    const { req, res } = faker({ cache_seconds: 200_000 }, data_stats);
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

  // Test clamping to MIN
  {
    const { req, res } = faker({ cache_seconds: -10_000 }, data_stats);
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
});