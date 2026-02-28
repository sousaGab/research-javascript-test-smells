it("should set the movie title directly in the cache", function() {
    var cache = {};
    var version = 0;

    setPathMaps(getModel({ cache: cache, version: version++ }), [
        $pathMapEnvelope("movies['pulp-fiction'].title", "Pulp Fiction")
    ]);

    var expectedCache = {
        movies: {
            "pulp-fiction": {
                title: $atom("Pulp Fiction")
            }
        }
    };

    expect(strip(cache)).toEqual(strip(expectedCache));
});