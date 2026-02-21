it("should set the director of movies", function() {
    var cache = {};
    var version = 0;
    setPathValues(
        getModel({ cache: cache, version: version++ }), [
            $pathValue("movies['pulp-fiction', 'kill-bill-1', 'reservior-dogs'].director", "Quentin Tarantino")
        ]
    );

    expect(strip(cache)).toEqual(strip({
        movies: {
            "pulp-fiction": { "director": $atom("Quentin Tarantino") },
            "kill-bill-1": { "director": $atom("Quentin Tarantino") },
            "reservior-dogs": { "director": $atom("Quentin Tarantino") }
        }
    }));
})

function setPathValues(model, pathValues) {
    var cache = {};
    var version = 0;
    for (var i = 0; i < pathValues.length; i++) {
        var pathValue = pathValues[i];
        var path = pathValue.path;
        var value = pathValue.value;
        var atom = $atom(value);
        var cacheKey = cache.get(path);
        if (cacheKey) {
            cacheKey.value = atom;
        } else {
            cache.set(path, { value: atom });
        }
    }
    return cache;
}