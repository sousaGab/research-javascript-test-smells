it("sets the movie title in the cache when path maps are applied", function setMovieTitleInCacheTest() {
    var cache = {};
    var version = 0;

    setPathMaps(
        getModel({ cache: cache, version: version++ }),
        [
            $pathMapEnvelope("movies['pulp-fiction'].title", "Pulp Fiction")
        ]
    );

    expect(strip(cache)).toEqual(strip({
        movies: {
            "pulp-fiction": {
                "title": $atom("Pulp Fiction")
            }
        }
    }));
});