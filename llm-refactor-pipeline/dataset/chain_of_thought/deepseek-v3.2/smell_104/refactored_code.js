it("directly sets path maps for movie title", function() {
    var cache = {};
    var version = 0;
    var model = getModel({ cache: cache, version: version++ });
    var pathMaps = [$pathMapEnvelope("movies['pulp-fiction'].title", "Pulp Fiction")];
    
    setPathMaps(model, pathMaps);
    
    var expectedCache = {
        movies: {
            "pulp-fiction": {
                "title": $atom("Pulp Fiction")
            }
        }
    };
    
    expect(strip(cache)).toEqual(strip(expectedCache));
});