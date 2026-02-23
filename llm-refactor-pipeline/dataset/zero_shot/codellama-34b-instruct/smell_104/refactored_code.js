// Your COMPLETE refactored test code here

describe("directly", function() {
    it("should set path maps", function() {
        const cache = {};
        const version = 0;
        const model = getModel({ cache, version: version++ });
        const pathMap = $pathMapEnvelope("movies['pulp-fiction'].title", "Pulp Fiction");
        setPathMaps(model, [pathMap]);
        expect(strip(cache)).toEqual(strip({
            movies: {
                "pulp-fiction": {
                    "title": $atom("Pulp Fiction")
                }
            }
        }));
    })
})