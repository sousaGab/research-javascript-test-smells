it("should set proper cache with clamped values", async () => {
    const cacheTTL = {
        MIN: 60,
        MAX: 3600,
    };
    const durations = {
        ONE_DAY: 86400,
    };

    const testCases = [
        {
            cacheSeconds: 200_000,
            expectedCacheControl: `max-age=${cacheTTL.MAX}, s-maxage=${cacheTTL.MAX}, stale-while-revalidate=${durations.ONE_DAY}`,
        },
        {
            cacheSeconds: 0,
            expectedCacheControl: `max-age=${cacheTTL.MIN}, s-maxage=${cacheTTL.MIN}, stale-while-revalidate=${durations.ONE_DAY}`,
        },
        {
            cacheSeconds: -10_000,
            expectedCacheControl: `max-age=${cacheTTL.MIN}, s-maxage=${cacheTTL.MIN}, stale-while-revalidate=${durations.ONE_DAY}`,
        },
    ];

    for (const { cacheSeconds, expectedCacheControl } of testCases) {
        const { req, res } = faker({ cache_seconds: cacheSeconds }, data_stats);
        await api(req, res);

        expect(res.setHeader.mock.calls).toEqual([
            ["Content-Type", "image/svg+xml"],
            ["Cache-Control", expectedCacheControl],
        ]);
    }
});