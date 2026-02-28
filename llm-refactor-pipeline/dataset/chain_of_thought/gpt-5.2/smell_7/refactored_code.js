it("should set proper cache with clamped values", async () => {
  const expectCacheHeaders = async (cache_seconds, expectedTtl) => {
    const { req, res } = faker({ cache_seconds }, data_stats);
    await api(req, res);

    expect(res.setHeader.mock.calls).toEqual([
      ["Content-Type", "image/svg+xml"],
      [
        "Cache-Control",
        `max-age=${expectedTtl}, ` +
          `s-maxage=${expectedTtl}, ` +
          `stale-while-revalidate=${DURATIONS.ONE_DAY}`,
      ],
    ]);
  };

  await expectCacheHeaders(200_000, CACHE_TTL.STATS_CARD.MAX);
  await expectCacheHeaders(0, CACHE_TTL.STATS_CARD.MIN);
  await expectCacheHeaders(-10_000, CACHE_TTL.STATS_CARD.MIN);
});