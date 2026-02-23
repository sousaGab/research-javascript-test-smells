// Your COMPLETE refactored test code here

it("directly", function() {
    const cache = {};
    const version = 0;
    const model = getModel({ cache, version: version++ });
    const pathMaps = [$pathMapEnvelope("movies['pulp-fiction'].title", "Pulp Fiction")];
    setPathMaps(model, pathMaps);
    expect(strip(cache)).toEqual(strip({
        movies: {
            "pulp-fiction": {
                "title": $atom("Pulp Fiction")
            }
        }
    }));
})