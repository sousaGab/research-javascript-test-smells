// Your COMPLETE refactored test code here

it("should set proper cache with clamped values", async () => {
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

    const { req: req2, res: res2 } = faker({ cache_seconds: 0 }, data_stats);
    await api(req2, res2);

    expect(res2.setHeader.mock.calls).toEqual([
        ["Content-Type", "image/svg+xml"],
        [
            "Cache-Control",
            `max-age=${CACHE_TTL.STATS_CARD.MIN}, ` +
                `s-maxage=${CACHE_TTL.STATS_CARD.MIN}, ` +
                `stale-while-revalidate=${DURATIONS.ONE_DAY}`,
        ],
    ]);

    const { req: req3, res: res3 } = faker({ cache_seconds: -10_000 }, data_stats);
    await api(req3, res3);

    expect(res3.setHeader.mock.calls).toEqual([
        ["Content-Type", "image/svg+xml"],
        [
            "Cache-Control",
            `max-age=${CACHE_TTL.STATS_CARD.MIN}, ` +
                `s-maxage=${CACHE_TTL.STATS_CARD.MIN}, ` +
                `stale-while-revalidate=${DURATIONS.ONE_DAY}`,
        ],
    ]);
})