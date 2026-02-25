it("should set a value for a path with a key set", function() {

    var cache = {};
    var version = 0;
    setPathValues(
        getModel({
            cache: cache,
            version: version++
        }), [
            $pathValue("movies['pulp-fiction', 'kill-bill-1', 'reservior-dogs'].director", "Quentin Tarantino")
        ]
    );

    expect(strip(cache)).toEqual(strip({
        movies: {
            "pulp-fiction": {
                "director": $atom("Quentin Tarantino")
            },
            "kill-bill-1": {
                "director": $atom("Quentin Tarantino")
            },
            "reservior-dogs": {
                "director": $atom("Quentin Tarantino")
            }
        }
    }));
});