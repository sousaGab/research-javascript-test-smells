describe("setPathMaps cache population", function() {
    it("stores movie title atom in cache when setting path maps directly", function() {
        var cache = {};
        var version = 0;
        var model = getModel({ cache: cache, version: version++ });
        var pathMaps = [
            $pathMapEnvelope("movies['pulp-fiction'].title", "Pulp Fiction")
        ];
        var expectedCache = {
            movies: {
                "pulp-fiction": {
                    "title": $atom("Pulp Fiction")
                }
            }
        };

        setPathMaps(model, pathMaps);

        expect(strip(cache)).toEqual(strip(expectedCache));
    });
});