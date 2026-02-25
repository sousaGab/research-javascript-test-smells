describe("cache clamping", () => {
  it("should set cache to MAX when cache_seconds is higher than MAX", async () => {
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
  });

  it.each([
    ["zero", 0],
    ["negative", -10_000],
  ])("should set cache to MIN when cache_seconds is %s", async (_, cache_seconds) => {
    const { req, res } = faker({ cache_seconds }, data_stats);
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
  });
});