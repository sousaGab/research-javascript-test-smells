describe("Testing the setPathMaps function", function() {
    let cache;
    let version;

    beforeEach(function() {
        cache = {};
        version = 0;
    });

    it("should set the path maps correctly", function() {
        setPathMaps(getModel({ cache: cache, version: version++ }), [
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
});