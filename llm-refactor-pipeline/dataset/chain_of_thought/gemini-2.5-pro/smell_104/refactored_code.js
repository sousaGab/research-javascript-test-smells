it("should set a simple value from a path map into the cache", function() {

    var cache = {};
    var version = 0;
    setPathMaps(
        getModel({ cache: cache, version: version++ }), [
        $pathMapEnvelope("movies['pulp-fiction'].title", "Pulp Fiction")
    ]);

    expect(strip(cache)).toEqual(strip({
        movies: {
            "pulp-fiction": {
                "title": $atom("Pulp Fiction")
            }
        }
    }));
});